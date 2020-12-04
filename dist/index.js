"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const express_1 = __importDefault(require("express"));
(async () => {
    const browser = await puppeteer_1.default.launch({
        executablePath: '/app/.apt/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://www.youtube.com/watch?v=lkIJYc4UH60');
    await page.screenshot({ path: 'public/youtube.png' });
    await browser.close();
    const app = express_1.default();
    const port = 3000;
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });
    app.use(express_1.default.static('public'));
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });
})();
