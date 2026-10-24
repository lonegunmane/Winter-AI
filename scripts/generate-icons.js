import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
const iconSvg = fs.readFileSync(path.join(publicDir, 'icon.svg'));
const maskableSvg = fs.readFileSync(path.join(publicDir, 'icon-maskable.svg'));

async function generate() {
  console.log('Generating PWA icons...');

  await sharp(iconSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  await sharp(iconSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  await sharp(maskableSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  await sharp(iconSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  await sharp(iconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('Icons successfully generated!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
