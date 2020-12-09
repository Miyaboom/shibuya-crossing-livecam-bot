// import express from 'express'
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

  // Puppeteer
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto(youtubePath);
  await page.waitForSelector('button.ytp-large-play-button.ytp-button');
  await page.click('button.ytp-large-play-button.ytp-button');
  await page.waitForSelector('div.ytp-player-content.ytp-iv-player-content');
  await page.waitForTimeout(180000);
  await page.screenshot({ path: 'public/images/screenshot.png' });

  await page.goto(youtubeChatPath);
  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'public/images/chat_screenshot.png' });

  await browser.close();

  // Twitter
  const twitterClient = new twitter({
    consumer_key: twitterConsumerKey,
    consumer_secret: twitterConsumerSecret,
    access_token_key: twitterTokenKey,
    access_token_secret: twitterTokenSecret
  });

  const data = await fs.readFileSync('public/images/screenshot.png');
  const media = await twitterClient.post('media/upload', { media: data });

  const chatdata = await fs.readFileSync('public/images/chat_screenshot.png');
  const chatmedia = await twitterClient.post('media/upload', { media: chatdata });

  twitterClient.post('statuses/update', {
    status: '#渋谷 #渋谷スクランブル交差点 #Shibuya #ShibuyaCrossing',
    media_ids: [media.media_id_string, chatmedia.media_id_string]
  }, function (error, tweet, response) {
    if (!error) {
      console.log(tweet)
    } else {
      console.log(error)
    }
  });

  // Webサーバー
  // const app = express()
  // const port = process.env.PORT || 5000

  // app.get('/', (req, res) => {
  //   res.send('Hello World!')
  // })

  // app.get('/screenshot', (req, res) => {
  //   page.screenshot({ path: 'public/images/screenshot.png' });
  //   res.send('Take a screenshot!')
  // })

  // app.get('/tweet', (req, res) => {
  //   twitterClient.post('statuses/update', { status: 'Shibuya Crossing LiveCam' }, function (error, tweet, response) {
  //     if (!error) {
  //       res.send(tweet)
  //     } else {
  //       res.send(error)
  //     }
  //   });
  // })

  // app.get('/tweet-screenshot', async (req, res) => {

  //   await page.screenshot({ path: 'public/images/screenshot.png' });

  //   const data = await fs.readFileSync('public/images/screenshot.png');
  //   const media = await twitterClient.post('media/upload', { media: data });

  //   twitterClient.post('statuses/update', {
  //     status: '',
  //     media_ids: media.media_id_string
  //   }, function (error, tweet, response) {
  //     if (!error) {
  //       res.send(tweet)
  //     } else {
  //       res.send(error)
  //     }
  //   });
  // })

  // app.use(express.static('public'));

  // app.listen(port, () => {
  //   console.log(`Example app listening at http://localhost:${port}`)
  // })
})();
