const fs = require('fs'), path = require('path'), { execSync } = require('child_process');

const p = 'C:/Users/travi/Documents/krator-audio/intake/2026-10-29-pixabay-d';
const jsonPath = path.join(p, 'clips.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

data.clips.forEach(c => {
  const fp = path.join(p, 'audio', c.file);
  let str = '';
  try {
    str = execSync(`ffmpeg -i "${fp}" 2>&1`, { stdio: ['pipe', 'pipe', 'pipe'] }).toString();
  } catch (e) {
    str = (e.stderr ? e.stderr.toString() : '') + (e.stdout ? e.stdout.toString() : '');
  }
  const m = str.match(/Duration:\s*(\d+):(\d+):(\d+(\.\d+)?)/);
  if (m) {
    const dur = parseFloat(m[1]) * 3600 + parseFloat(m[2]) * 60 + parseFloat(m[3]);
    c.duration = Math.round(dur * 100) / 100;
    console.log(c.id, '->', c.duration, 's');
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Durations written successfully!');
