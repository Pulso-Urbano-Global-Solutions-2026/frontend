/**
 * Generates app icon PNGs from logo.svg using sharp.
 * Run from the frontend/ directory: node gen-icons.js
 */
const sharp = require('sharp');
const fs    = require('fs');
const path  = require('path');

const ASSETS   = path.join(__dirname, 'pulso-mobile', 'assets');
const IMAGES   = path.join(ASSETS, 'images');
const SVG_RAW  = fs.readFileSync(path.join(__dirname, 'logo.svg'), 'utf8');

// Full icon SVG — background rect already included in logo.svg
const iconSvg = SVG_RAW
  .replace('width="200"', 'width="1024"')
  .replace('height="200"', 'height="1024"')
  .replace('viewBox="0 0 200 200"', 'viewBox="0 0 200 200"');

// Foreground SVG: remove the outer background rect (first rect, fill="#0a0e1a")
const fgSvg = SVG_RAW
  .replace('<rect width="200" height="200" rx="32" fill="#0a0e1a"></rect>', '')
  .replace('width="200"', 'width="1024"')
  .replace('height="200"', 'height="1024"');

async function run() {
  // 1. Main icon: 1024×1024
  await sharp(Buffer.from(iconSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(IMAGES, 'icon.png'));
  console.log('✓ icon.png');

  // 2. Splash: 1284×2778 (iPhone 15 Pro Max — logo centred on dark bg)
  const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1284" height="2778">
    <rect width="1284" height="2778" fill="#0a0e1a"/>
    <image href="data:image/svg+xml;base64,${Buffer.from(iconSvg).toString('base64')}" x="${(1284-400)/2}" y="${(2778-400)/2}" width="400" height="400"/>
  </svg>`;
  await sharp(Buffer.from(splashSvg))
    .resize(1284, 2778)
    .png()
    .toFile(path.join(IMAGES, 'splash.png'));
  console.log('✓ splash.png');

  // 3. Android foreground: transparent bg, 1024×1024
  await sharp(Buffer.from(fgSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(ASSETS, 'android-icon-foreground.png'));
  console.log('✓ android-icon-foreground.png');

  // 4. Android background: solid #0a0e1a, 1024×1024
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: '#0a0e1a' },
  })
    .png()
    .toFile(path.join(ASSETS, 'android-icon-background.png'));
  console.log('✓ android-icon-background.png');

  // 5. Android monochrome: white logo on transparent bg
  const monoSvg = fgSvg
    .replace(/stroke="#22d3ee"/g, 'stroke="#ffffff"')
    .replace(/fill="#22d3ee"/g, 'fill="#ffffff"')
    .replace(/stop-color="#22d3ee"/g, 'stop-color="#ffffff"')
    .replace(/stop-color="#3ddc84"/g, 'stop-color="#ffffff"')
    .replace(/fill="#3ddc84"/g, 'fill="#ffffff"');
  await sharp(Buffer.from(monoSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(ASSETS, 'android-icon-monochrome.png'));
  console.log('✓ android-icon-monochrome.png');

  // 6. Favicon: 48×48
  await sharp(Buffer.from(iconSvg))
    .resize(48, 48)
    .png()
    .toFile(path.join(ASSETS, 'favicon.png'));
  console.log('✓ favicon.png');

  console.log('\nAll icons generated.');
}

run().catch((e) => { console.error(e); process.exit(1); });
