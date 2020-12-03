import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://www.youtube.com/watch?v=21X5lGlDOfg');
  await page.screenshot({ path: 'youtube.png' });
  await browser.close();
})();
