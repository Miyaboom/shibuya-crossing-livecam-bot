import puppeteer from 'puppeteer';
import twitter from 'twitter'
import fs from 'fs-extra'

(async () => {

  const chromePath = process.env.CHROME_PATH || ''
  const twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY || ''
  const twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET || ''
  const twitterTokenKey = process.env.TWITTER_TOKEN_KEY || ''
  const twitterTokenSecret = process.env.TWITTER_TOKEN_SECRET || ''

  const youtubeVideoPath = 'https://www.youtube.com/embed/HpdO5Kq3o7Y'
  const youtubeChatPath = 'https://www.youtube.com/live_chat?is_popout=1&v=HpdO5Kq3o7Y'
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36'
  const dirPath = 'public/images/'
  const playButtonSelector = 'button.ytp-large-play-button.ytp-button'
  const screenshotVideoPath = `${dirPath}screenshotvideo.png`
  const screenshotChatPath = `${dirPath}screenshotchat.png`

  // Puppeteer初期化
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  page.on('pageerror', (error) => {
    console.error('pageerror: ', error)
  })

  // ディレクトリが無ければ作成
  if (!fs.existsSync(dirPath)) {
    fs.mkdirsSync(dirPath);
  }

  // Youtubeの動画をキャプチャ
  await page.setUserAgent(userAgent)
  await page.goto(youtubeVideoPath);
  await page.waitForSelector(playButtonSelector);
  await page.click(playButtonSelector);
  await page.waitForTimeout(180000);
  await page.screenshot({ path: screenshotVideoPath });

  await page.goto(youtubeChatPath);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: screenshotChatPath });

  await browser.close();

  // Twitterクライアント初期化
  const twitterClient = new twitter({
    consumer_key: twitterConsumerKey,
    consumer_secret: twitterConsumerSecret,
    access_token_key: twitterTokenKey,
    access_token_secret: twitterTokenSecret
  });

  // スクリーンショットをTwitterにアップロード
  const upload = async (path: string) => {
    const data = fs.readFileSync(path);
    return await twitterClient.post('media/upload', { media: data });
  }
  const screenshotVideoMedia = await upload(screenshotVideoPath);
  const screenshotChatMedia = await upload(screenshotChatPath);

  // Twitterに投稿
  const media_ids = `${screenshotVideoMedia.media_id_string},${screenshotChatMedia.media_id_string}`

  twitterClient.post('statuses/update', {
    status: '【LIVE】渋谷スクランブル交差点 ライブカメラ / Shibuya Scramble Crossing Live Camera https://youtu.be/HpdO5Kq3o7Y @YouTubeより #渋谷 #shibuya',
    media_ids: media_ids
  }, (error, tweet, response) => {
    if (!error) {
      console.log(tweet)
    } else {
      console.error(error)
    }
  });
})();
