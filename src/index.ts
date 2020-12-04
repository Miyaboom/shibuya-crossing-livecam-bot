import puppeteer from 'puppeteer';
import express from 'express'

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/app/.apt/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('https://www.youtube.com/watch?v=lkIJYc4UH60');
  await page.screenshot({ path: 'public/youtube.png' });
  await browser.close();

  const app = express()
  const port = 3000

  app.get('/', (req, res) => {
    res.send('Hello World!')
  })

  app.use(express.static('public'));

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
})();
