/**
 * Genera TUTTE le icone dell'app partendo da UN unico file sorgente.
 *
 * Sorgente:      assets/logo.png (il "capolavoro", disegno 1024+ con sfondo trasparente)
 * Genera:        icon.png, adaptive-icon.png, splash-icon.png, favicon.png
 *                + icone native Android (ic_launcher + foreground nelle mipmap)
 *
 * Uso:           node scripts/generate-icons.mjs
 * Dopo il cambio logo:  sostituisci assets/logo.png e rilanci lo script.
 *
 * Regole rispettate:
 *  - iOS (icon.png):        1024×1024, NIENTE trasparenza, niente angoli (li maschera iOS),
 *                            contenuto dentro ~80% centrale.
 *  - Android adaptive:      foreground con sfondo trasparente, contenuto nella ZONA SICURA
 *                            centrale (~58%, il cerchio visibile è ~66%).
 *  - Splash:                icona centrata con margini ampi (resizeMode "contain").
 *  - favicon:               piccolo 48×48 per il web.
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'logo.png');

// Scala del contenuto rispetto al canvas (frazione della dimensione totale)
const SCALE_IOS = 0.8;        // icon.png / icone legacy Android
const SCALE_ADAPTIVE = 0.58;  // foreground: dentro la zona sicura (cerchio ~66%)
const SCALE_SPLASH = 0.55;    // splash: margini ampi
const SCALE_FAVICON = 0.8;    // favicon

/** Componi il logo (scalato e centrato) su un canvas `size`×`size`. Restituisce il pipeline sharp. */
async function placeLogo({ size, scale, background }) {
  const logoSize = Math.round(size * scale);
  const bg = background === 'transparent'
    ? { r: 0, g: 0, b: 0, alpha: 0 }
    : { r: 255, g: 255, b: 255, alpha: 1 };
  const canvas = sharp({
    create: { width: size, height: size, channels: 4, background: bg },
  });
  const left = Math.round((size - logoSize) / 2);
  const top = Math.round((size - logoSize) / 2);
  const logoBuf = await sharp(SRC)
    .resize(logoSize, logoSize, { fit: 'fill', kernel: 'lanczos3' })
    .png()
    .toBuffer();
  let out = canvas.composite([{ input: logoBuf, left, top }]);
  if (background !== 'transparent') {
    // iOS/legacy: nessuna trasparenza → appiattisci su bianco e rimuovi del tutto il canale alpha
    out = out.flatten({ background: '#ffffff' }).removeAlpha();
  }
  return out;
}

// Densità Android: [densità, dimensione ic_launcher (legacy), dimensione foreground (adattiva)]
const DENSITIES = [
  { dir: 'mdpi', size: 48, fg: 108 },
  { dir: 'hdpi', size: 72, fg: 162 },
  { dir: 'xhdpi', size: 96, fg: 216 },
  { dir: 'xxhdpi', size: 144, fg: 324 },
  { dir: 'xxxhdpi', size: 192, fg: 432 },
];

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`Manca il sorgente: ${SRC}`);
    process.exit(1);
  }
  const meta = await sharp(SRC).metadata();
  console.log(`Sorgente: ${SRC} (${meta.width}×${meta.height})`);

  // --- Assets Expo (root assets/) ---
  (await placeLogo({ size: 1024, scale: SCALE_IOS, background: 'white' }))
    .png().toFile(path.join(ROOT, 'assets', 'icon.png'));
  console.log('✓ assets/icon.png (iOS, 1024×1024, opaca)');

  (await placeLogo({ size: 1024, scale: SCALE_ADAPTIVE, background: 'transparent' }))
    .png().toFile(path.join(ROOT, 'assets', 'adaptive-icon.png'));
  console.log('✓ assets/adaptive-icon.png (Android foreground, zona sicura)');

  (await placeLogo({ size: 1024, scale: SCALE_SPLASH, background: 'white' }))
    .png().toFile(path.join(ROOT, 'assets', 'splash-icon.png'));
  console.log('✓ assets/splash-icon.png (splash, centrata con margini)');

  (await placeLogo({ size: 48, scale: SCALE_FAVICON, background: 'white' }))
    .png().toFile(path.join(ROOT, 'assets', 'favicon.png'));
  console.log('✓ assets/favicon.png (web, 48×48)');

  // --- Icone native Android (usate dalla build locale) ---
  for (const d of DENSITIES) {
    const base = path.join(ROOT, 'android', 'app', 'src', 'main', 'res', `mipmap-${d.dir}`);
    if (!fs.existsSync(base)) continue;

    // ic_launcher + ic_launcher_round: icone legacy quadrate (sfondo bianco, niente trasparenza)
    for (const name of ['ic_launcher.webp', 'ic_launcher_round.webp']) {
      (await placeLogo({ size: d.size, scale: SCALE_IOS, background: 'white' }))
        .webp({ lossless: true }).toFile(path.join(base, name));
    }
    // ic_launcher_foreground: strato frontale adattivo (trasparente, zona sicura)
    (await placeLogo({ size: d.fg, scale: SCALE_ADAPTIVE, background: 'transparent' }))
      .webp({ lossless: true }).toFile(path.join(base, 'ic_launcher_foreground.webp'));

    console.log(`✓ mipmap-${d.dir}/ ic_launcher + round (${d.size}px) + foreground (${d.fg}px)`);
  }

  console.log('\nFatto! Tutte le icone rigenerate da assets/logo.png');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
