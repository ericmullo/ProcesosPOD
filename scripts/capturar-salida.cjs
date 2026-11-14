const fs = require('node:fs');
const { chromium } = require('playwright');

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('Uso: node scripts/capturar-salida.cjs entrada.txt salida.png');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1500, height: 900 }, deviceScaleFactor: 1 });
    const content = fs.readFileSync(input, 'utf8');
    const title = input.includes('escalado') ? 'Escalado a tres réplicas' : 'Deployment, ReplicaSet, Pods y Service';
    await page.setContent(`<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
      body { margin: 0; padding: 36px; color: #e5e7eb; background: #0f172a; font-family: Arial, sans-serif; }
      h1 { margin: 0 0 12px; font-size: 28px; }
      p { margin: 0 0 22px; color: #94a3b8; }
      pre { margin: 0; padding: 24px; overflow: visible; border-radius: 10px; background: #020617; color: #d1fae5; font: 14px/1.6 Consolas, monospace; white-space: pre; }
    </style></head><body><h1>${title}</h1><p>Salida real de kubectl guardada durante la ejecución de GitHub Actions</p><pre id="output"></pre></body></html>`);
    await page.locator('#output').evaluate((element, text) => { element.textContent = text; }, content);
    await page.screenshot({ path: output, fullPage: true });
    console.log(`Captura de salida guardada en ${output}`);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
