import fs from 'fs';
import zlib from 'zlib';

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crc.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function generateIconPNG(size, isMaskable = false) {
  const width = size;
  const height = size;
  const rowSize = width * 4 + 1; // 1 filter byte per row
  const rawData = Buffer.alloc(rowSize * height);

  // Design: Dark modern card background with rounded rect or full bleed, and sharp red "oc" logo in center
  const cx = width / 2;
  const cy = height / 2;
  const radius = size * (isMaskable ? 0.48 : 0.42);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Distance from center
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color: #0b0f17 (dark slate)
      let r = 11;
      let g = 15;
      let b = 23;
      let a = 255;

      // Inner branded circular badge with vibrant red gradient
      if (dist < radius) {
        // Red accent gradient: #E30000 to #990000
        const grad = (y / height);
        r = Math.floor(227 - grad * 60);
        g = Math.floor(10 - grad * 10);
        b = Math.floor(20 - grad * 15);
      }

      // Drawing simple bold "O C" monogram in the center
      // Normalize coords to [-1, 1] relative to center
      const nx = dx / (size * 0.28);
      const ny = dy / (size * 0.28);

      // "O" letter ring: center at nx = -0.45
      const oDist = Math.sqrt((nx + 0.45) * (nx + 0.45) + ny * ny);
      if (oDist >= 0.28 && oDist <= 0.65) {
        r = 255; g = 255; b = 255; // White
      }

      // "C" letter curve: center at nx = 0.45
      const cDist = Math.sqrt((nx - 0.45) * (nx - 0.45) + ny * ny);
      if (cDist >= 0.28 && cDist <= 0.65) {
        // Cut out the right mouth of the C: nx > 0.45 and |ny| < 0.35
        if (!(nx > 0.45 && Math.abs(ny) < 0.35)) {
          r = 255; g = 255; b = 255; // White
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Generate files
fs.writeFileSync('public/pwa-192x192.png', generateIconPNG(192, false));
fs.writeFileSync('public/pwa-512x512.png', generateIconPNG(512, false));
fs.writeFileSync('public/pwa-maskable-512x512.png', generateIconPNG(512, true));
fs.writeFileSync('public/apple-touch-icon.png', generateIconPNG(180, false));
console.log('PWA PNG icons generated successfully!');
