// Regenerates the files in public/ that are rendered from the site itself:
//   renzo-carletti-cv.pdf, renzo-carletti-cv-es.pdf ← the matching .docx (CVs are edited in Word; needs LibreOffice)
//   og.png               ← /og/ (1200×630 share card)
//   apple-touch-icon.png ← favicon.svg (180×180)
// Needs Google Chrome or Chromium. Override the binary with CHROME=/path/to/chrome.
// Run with `npm run assets`, then commit the updated files.
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pub = (f) => path.join(root, 'public', f);
const chrome = process.env.CHROME ?? 'google-chrome';
const port = 4399;

const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, stdio: 'inherit' });
const headless = (args) =>
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=4000', ...args], {
    stdio: ['ignore', 'ignore', 'inherit'],
  });

run('npx', ['astro', 'build']);

const preview = spawn('npx', ['astro', 'preview', '--port', String(port)], { cwd: root, detached: true });
const base = await new Promise((resolve, reject) => {
  preview.stdout.on('data', (chunk) => {
    const match = String(chunk).match(/http:\/\/localhost:\d+\/[^\s]*/);
    if (match) resolve(match[0]);
  });
  preview.on('exit', () => reject(new Error('astro preview exited')));
});

try {
  for (const name of ['renzo-carletti-cv', 'renzo-carletti-cv-es']) {
    try {
      execFileSync(process.env.SOFFICE ?? 'soffice', ['--headless', '--convert-to', 'pdf', '--outdir', path.join(root, 'public'), pub(name + '.docx')], {
        stdio: 'ignore',
      });
      console.log(`wrote public/${name}.pdf`);
    } catch {
      console.warn(`LibreOffice (soffice) not found: public/${name}.pdf left as is`);
    }
  }
  headless(['--window-size=1200,630', `--screenshot=${pub('og.png')}`, base + 'og/']);
  console.log('wrote public/og.png');
  headless(['--window-size=180,180', '--default-background-color=101214ff', `--screenshot=${pub('apple-touch-icon.png')}`, 'file://' + pub('favicon.svg')]);
  console.log('wrote public/apple-touch-icon.png');
} finally {
  process.kill(-preview.pid);
}
