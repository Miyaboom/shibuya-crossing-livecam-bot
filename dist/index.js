"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const twitter_1 = __importDefault(require("twitter"));
const fs_extra_1 = __importDefault(require("fs-extra"));
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
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    page.on('pageerror', (error) => {
        console.error('pageerror: ', error);
    });
    const dirPath = 'public/images/';
    const playButtonSelector = 'button.ytp-large-play-button.ytp-button';
    const screenshotPath = `${dirPath}screenshot.png`;
    const waitTime = 180000; // 広告の終了を待機
    // ディレクトリが無ければ作成する
    if (!fs_extra_1.default.existsSync(dirPath)) {
        fs_extra_1.default.mkdirsSync(dirPath);
    }
    await page.goto(youtubePath);
    await page.waitForSelector(playButtonSelector);
    await page.click(playButtonSelector);
    await page.waitForTimeout(waitTime);
    await page.screenshot({ path: screenshotPath });
    await browser.close();
    // Twitter
    const twitterClient = new twitter_1.default({
        consumer_key: twitterConsumerKey,
        consumer_secret: twitterConsumerSecret,
        access_token_key: twitterTokenKey,
        access_token_secret: twitterTokenSecret
    });
    // スクリーンショットをTwitterにアップロード
    const data = (() => {
        try {
            return fs_extra_1.default.readFileSync(screenshotPath);
        }
        catch (error) {
            console.error('failed to read ', error);
        }
    })();
    const media = await twitterClient.post('media/upload', { media: data });
    // Twitterに投稿
    const media_ids = `${media.media_id_string}`;
    twitterClient.post('statuses/update', {
        status: '#渋谷 #渋谷スクランブル交差点 #Shibuya https://youtu.be/lkIJYc4UH60',
        media_ids: media_ids
    }, (error, tweet, response) => {
        if (!error) {
            console.log(tweet);
        }
        else {
            console.error(error);
        }
    });
})();
