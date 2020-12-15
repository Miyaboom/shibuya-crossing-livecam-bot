import puppeteer from 'puppeteer';
import twitter from 'twitter'
import fs from 'fs'

(async () => {

  // 環境変数
  const chromePath = process.env.CHROME_PATH || ''
  const youtubePath = process.env.YOUTUBE_PATH || ''
  const twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY || ''
  const twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET || ''
  const twitterTokenKey = process.env.TWITTER_TOKEN_KEY || ''
  const twitterTokenSecret = process.env.TWITTER_TOKEN_SECRET || ''

  // Puppeteer
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  page.on('pageerror', (error) => {
    console.error('pageerror: ', error)
  })

  const dirPath = 'public/images/'
  const playButtonSelector = 'button.ytp-large-play-button.ytp-button'
  const screenshotPath = `${dirPath}screenshot.png`
  const waitTime = 180000 // 広告の終了を待機

  // ディレクトリが無ければ作成する
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  await page.goto(youtubePath);
  await page.waitForSelector(playButtonSelector);
  await page.click(playButtonSelector);
  await page.waitForTimeout(waitTime);
  await page.screenshot({ path: screenshotPath });
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
      console.error('failed to read ', error)
    }
  })();
  const media = await twitterClient.post('media/upload', { media: data });

  // Twitterに投稿
  const media_ids = `${media.media_id_string}`

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
