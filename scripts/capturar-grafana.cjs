const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const response = await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (!response || response.status() >= 400) {
      throw new Error(`Grafana respondió HTTP ${response?.status() ?? 'sin respuesta'}`);
    }
    await page.getByText('Welcome to Grafana').waitFor({ state: 'visible', timeout: 60000 });
    await page.screenshot({ path: 'evidencias/02-grafana.png', fullPage: true });
    console.log(`Pantalla capturada: ${await page.title()}`);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
