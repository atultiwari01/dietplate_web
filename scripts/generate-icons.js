import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4);
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function createPng(width, height, isMaskable = false) {
  // RGBA buffer
  // Background: #206140 (R: 32, G: 97, B: 64)
  // For maskable, safe zone is 80% circle, outer area is solid #206140
  // Plate: White/off-white circle with subtle green tint #f5faf7
  // Inner rim: #e3f2ea
  // Center leaf / sprout: #206140 & #52b788

  const raw = Buffer.alloc(height * (1 + width * 4));
  const cx = width / 2;
  const cy = height / 2;
  const outerPlateR = width * (isMaskable ? 0.32 : 0.38);
  const innerPlateR = width * (isMaskable ? 0.25 : 0.30);
  const bgR = width * (isMaskable ? 0.5 : 0.46);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 32, g = 97, b = 64, a = 255; // #206140 default

      if (!isMaskable) {
        // Rounded app icon shape (squircle)
        const cornerR = width * 0.22;
        const cornerDx = Math.max(0, Math.abs(dx) - (width * 0.46 - cornerR));
        const cornerDy = Math.max(0, Math.abs(dy) - (height * 0.46 - cornerR));
        const cornerDist = Math.sqrt(cornerDx * cornerDx + cornerDy * cornerDy);
        if (cornerDist > cornerR) {
          a = 0; // transparent outside rounded rectangle
        }
      }

      if (a > 0) {
        // Draw Plate
        if (dist <= outerPlateR) {
          // Plate outer border / drop shadow effect
          const shadowEdge = outerPlateR - dist;
          if (dist > innerPlateR) {
            // Rim
            r = 245; g = 250; b = 247;
          } else {
            // Plate dish center
            r = 255; g = 255; b = 255;
          }

          // Draw fork and leaf emblem in center
          // Left side: small fork tines / minimalist fork
          // Center-right: stylish organic green leaf
          if (Math.abs(dx) < width * 0.14 && Math.abs(dy) < height * 0.16) {
            // Leaf calculation: (x - cx + 0.02*w)^2 / a^2 + (y - cy)^2 / b^2 with rotation
            const lx = (dx * 0.707 - dy * 0.707);
            const ly = (dx * 0.707 + dy * 0.707);
            if (lx >= -width * 0.08 && lx <= width * 0.08 && ly >= -height * 0.05 && ly <= height * 0.09) {
              const leafProfile = (1 - Math.abs(lx) / (width * 0.08)) * (height * 0.09);
              if (Math.abs(ly) < leafProfile) {
                // Leaf color
                r = 32; g = 97; b = 64; // #206140
                if (Math.abs(lx) < width * 0.008) {
                  // Central leaf vein
                  r = 175; g = 241; b = 198; // #aff1c6
                }
              }
            }
          }
        }
      }

      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
      raw[offset++] = a;
    }
  }

  const deflated = zlib.deflateSync(raw);

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Deflate
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace none

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const pubDir = path.resolve('public');
if (!fs.existsSync(pubDir)) {
  fs.mkdirSync(pubDir, { recursive: true });
}

fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createPng(180, 180, false));

console.log('PNG PWA icons generated successfully in public/');
