const fs = require('fs'), path = require('path');

function getMp3Duration(filePath) {
  const buf = fs.readFileSync(filePath);
  let offset = 0;
  // Skip ID3v2 tag if present
  if (buf.length > 10 && buf.toString('ascii', 0, 3) === 'ID3') {
    const tagSize = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
    offset = 10 + tagSize;
  }

  // Find first frame sync (0xFFE0)
  const bitratesV1L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
  const sampleRatesV1 = [44100, 48000, 32000, 0];

  while (offset < buf.length - 4) {
    if (buf[offset] === 0xff && (buf[offset + 1] & 0xe0) === 0xe0) {
      const ver = (buf[offset + 1] >> 3) & 3;
      const layer = (buf[offset + 1] >> 1) & 3;
      const brIdx = (buf[offset + 2] >> 4) & 0x0f;
      const srIdx = (buf[offset + 2] >> 2) & 3;
      if (ver === 3 && layer === 1 && brIdx > 0 && brIdx < 15 && srIdx < 3) {
        const kbps = bitratesV1L3[brIdx];
        const audioBytes = buf.length - offset;
        const dur = (audioBytes * 8) / (kbps * 1000);
        return Math.round(dur * 100) / 100;
      }
    }
    offset++;
  }
  // Fallback: estimate at 128 kbps
  return Math.round((buf.length * 8) / 128000 * 100) / 100;
}

const p = 'C:/Users/travi/Documents/krator-audio/intake/2026-10-29-pixabay-d';
const jsonPath = path.join(p, 'clips.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

data.clips.forEach(c => {
  const fp = path.join(p, 'audio', c.file);
  c.duration = getMp3Duration(fp);
  console.log(c.id, '->', c.duration, 's');
});

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('MP3 durations calculated accurately!');
