import puppeteer from 'puppeteer';
import twitter from 'twitter'
import fs from 'fs'

(async () => {

  // 環境変数
  const chromePath = process.env.CHROME_PATH || ''
  const youtubePath = process.env.YOUTUBE_PATH || ''
  const youtubeChatPath = process.env.YOUTUBE_CHAT_PATH || ''
  const twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY || ''
  const twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET || ''
  const twitterTokenKey = process.env.TWITTER_TOKEN_KEY || ''
  const twitterTokenSecret = process.env.TWITTER_TOKEN_SECRET || ''

  // コマンドライン引数
  const args = process.argv.slice(2);
  const takeChatScreenShot = args[0] || '' // 引数有りで実行した場合チャット欄もスクショする

  // Puppeteer
  const browser = await puppeteer.launch({
    headless: takeChatScreenShot ? false : true, // チャット欄をスクショする場合ヘッドフルモードで起動する
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  page.on('pageerror', (error) => {
    console.error('pageerror: ', error)
  })

  const playButtonSelector = 'button.ytp-large-play-button.ytp-button'
  const screenshotPath = 'public/images/screenshot.png'
  const chatScreenShotPath = 'public/images/chat_screenshot.png'

  await page.goto(youtubePath);
  await page.waitForSelector(playButtonSelector);
  await page.click(playButtonSelector);
  await page.waitForTimeout(180000); // 広告の終了を待機
  await page.screenshot({ path: screenshotPath });

  if (takeChatScreenShot) {
    await page.goto(youtubeChatPath);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: chatScreenShotPath });
  }

  await browser.close();

  // Twitter
  const twitterClient = new twitter({
    consumer_key: twitterConsumerKey,
    consumer_secret: twitterConsumerSecret,
    access_token_key: twitterTokenKey,
    access_token_secret: twitterTokenSecret
  });

  // スクリーンショットをTwitterにアップロード
  const data = (() => {
    try {
      return fs.readFileSync(screenshotPath);
    } catch (error) {
      console.error(`failed to read ${error}`)
    }
  })();
  const media = await twitterClient.post('media/upload', { media: data });

  // ライブチャットのスクリーンショットをTwitterにアップロード
  const chatdata = takeChatScreenShot ? (() => {
    try {
      return fs.readFileSync(chatScreenShotPath);
    } catch (error) {
      console.error(`failed to read ${error}`)
    }
  })() : null
  const chatmedia = takeChatScreenShot && chatdata ? await twitterClient.post('media/upload', { media: chatdata }) : null;

  // Twitterに投稿
  const media_ids = takeChatScreenShot && chatmedia ? `${media.media_id_string},${chatmedia.media_id_string}` : `${media.media_id_string}`

  twitterClient.post('statuses/update', {
    status: '#渋谷 #渋谷スクランブル交差点 #Shibuya #ShibuyaCrossing',
    media_ids: media_ids
  }, (error, tweet, response) => {
    if (!error) {
      console.log(tweet)
    } else {
      console.error(error)
    }
  });
})();
