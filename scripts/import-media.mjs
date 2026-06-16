#!/usr/bin/env node
/**
 * GIUSEWORD media import — turn a folder of Giuseppe's raw photos/videos into
 * web-ready assets for the cinematic site. ToS-clean: works on files you already
 * have (AirDropped originals, or the official Instagram "Download your information"
 * export) — it does NOT fetch anything from the internet.
 *
 * Usage:
 *   node scripts/import-media.mjs <input-folder>
 *
 * Output (under public/media/):
 *   photos/<name>.jpg        responsive 1200w + 2000w, mozjpeg, metadata stripped
 *   photos/<name>.avif/.webp next-gen formats for modern browsers
 *   video/<name>.mp4         H.264 720p/1080p, faststart, audio AAC
 *   posters/<name>.jpg       still frame pulled from ~1s into each video
 *
 * Requirements: sharp (already a dep) + ffmpeg (system).
 */
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, existsSync } from 'node:fs';
import { extname, basename, join } from 'node:path';

const IN = process.argv[2];
if (!IN || !existsSync(IN)) {
  console.error('Usage: node scripts/import-media.mjs <input-folder>');
  process.exit(1);
}
const OUT = 'public/media';
['photos', 'video', 'posters'].forEach((d) => mkdirSync(join(OUT, d), { recursive: true }));

const slug = (s) => basename(s, extname(s)).toLowerCase().normalize('NFKD')
  .replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'media';

const IMG = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.tif', '.tiff']);
const VID = new Set(['.mp4', '.mov', '.m4v', '.webm', '.avi', '.mkv']);

const files = readdirSync(IN).filter((f) => !f.startsWith('.'));
let imgN = 0, vidN = 0;

for (const f of files) {
  const ext = extname(f).toLowerCase();
  const name = slug(f);
  const src = join(IN, f);
  try {
    if (IMG.has(ext)) {
      const base = sharp(src).rotate().withMetadata({ exif: {} }); // strip EXIF (incl. GPS)
      for (const w of [1200, 2000]) {
        const tag = w === 1200 ? '' : '@2x';
        await base.clone().resize({ width: w, withoutEnlargement: true })
          .jpeg({ quality: 82, mozjpeg: true }).toFile(join(OUT, 'photos', `${name}${tag}.jpg`));
      }
      await base.clone().resize({ width: 1600, withoutEnlargement: true })
        .avif({ quality: 55 }).toFile(join(OUT, 'photos', `${name}.avif`));
      await base.clone().resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 76 }).toFile(join(OUT, 'photos', `${name}.webp`));
      imgN++; console.log(`photo  → ${name} (.jpg @2x .avif .webp)`);
    } else if (VID.has(ext)) {
      const mp4 = join(OUT, 'video', `${name}.mp4`);
      execFileSync('ffmpeg', ['-y', '-i', src,
        '-vf', "scale='min(1920,iw)':-2", '-c:v', 'libx264', '-preset', 'slow',
        '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
        '-c:a', 'aac', '-b:a', '128k', mp4], { stdio: 'ignore' });
      execFileSync('ffmpeg', ['-y', '-ss', '1', '-i', src, '-frames:v', '1',
        '-q:v', '3', join(OUT, 'posters', `${name}.jpg`)], { stdio: 'ignore' });
      vidN++; console.log(`video  → ${name} (.mp4 + poster)`);
    }
  } catch (e) {
    console.warn(`skip ${f}: ${e.message.split('\n')[0]}`);
  }
}
console.log(`\nDone. ${imgN} photo(s), ${vidN} video(s) → ${OUT}/`);
console.log('Reference them in src/pages/index.astro, e.g. /media/photos/<name>.jpg, /media/video/<name>.mp4');
