"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import express from 'express'
const puppeteer_1 = __importDefault(require("puppeteer"));
const twitter_1 = __importDefault(require("twitter"));
const fs_1 = __importDefault(require("fs"));
(async () => {
    // 環境変数
    const chromePath = process.env.CHROME_PATH || '';
    const youtubePath = process.env.YOUTUBE_PATH || '';
    const twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY || '';
    const twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET || '';
    const twitterTokenKey = process.env.TWITTER_TOKEN_KEY || '';
    const twitterTokenSecret = process.env.TWITTER_TOKEN_SECRET || '';
    // Puppeteer
    const browser = await puppeteer_1.default.launch({
        executablePath: chromePath,
        // executablePath: '/app/.apt/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(youtubePath);
    await page.waitForSelector('button.ytp-large-play-button.ytp-button');
    await page.click('button.ytp-large-play-button.ytp-button');
    await page.waitForSelector('div.ytp-player-content.ytp-iv-player-content');
    await page.evaluate(() => {
        var _a;
        const element = window.document.querySelector('div.ytp-player-content.ytp-iv-player-content');
        console.log(element);
        (_a = element === null || element === void 0 ? void 0 : element.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(element);
    });
    await page.waitForTimeout(180000);
    await page.screenshot({ path: 'public/images/screenshot.png' });
    await browser.close();
    // Twitter
    const twitterClient = new twitter_1.default({
        consumer_key: twitterConsumerKey,
        consumer_secret: twitterConsumerSecret,
        access_token_key: twitterTokenKey,
        access_token_secret: twitterTokenSecret
    });
    const data = await fs_1.default.readFileSync('public/images/screenshot.png');
    const media = await twitterClient.post('media/upload', { media: data });
    twitterClient.post('statuses/update', {
        status: '',
        media_ids: media.media_id_string
    }, function (error, tweet, response) {
        if (!error) {
            console.log(tweet);
        }
        else {
            console.log(error);
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
