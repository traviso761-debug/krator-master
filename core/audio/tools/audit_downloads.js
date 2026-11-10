const fs = require('fs'), path = require('path');

function walk(dir) {
  let res = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const full = path.join(dir, file);
      try {
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          res = res.concat(walk(full));
        } else if (/\.(mp3|wav|ogg|flac|m4a|aac|zip)$/i.test(file)) {
          res.push({ path: full, file: file, mtime: stat.mtimeMs, size: stat.size });
        }
      } catch (e) {}
    });
  } catch (e) {}
  return res;
}

const allAudio = walk('C:/Users/travi/Downloads');
console.log('Total audio files in Downloads & subfolders:', allAudio.length);
const yesterday = new Date('2026-10-28T00:00:00').getTime();
const recent = allAudio.filter(a => a.mtime >= yesterday);
console.log('Downloaded since yesterday (2026-10-28):', recent.length);

const cat = JSON.parse(fs.readFileSync('core/audio/data/clips.json', 'utf8')).clips;
console.log('Total clips in clips.json:', cat.length);

const labHtml = fs.readFileSync('../krator-audio/lab/index.html', 'utf8');
const dataMatch = labHtml.match(/const DATA = (\{[\s\S]*?\});\s*const \$/);
const DATA = JSON.parse(dataMatch[1]);
console.log('Total clips embedded in Lab index.html:', DATA.clips.length);

// Audit each file
const uncatalogued = [];
recent.forEach(r => {
  // Check if filename or pixabay id appears in clips.json
  const fn = r.file;
  const m = fn.match(/(\d+)\.(mp3|wav|ogg)$/i);
  const pxId = m ? m[1] : null;

  const found = cat.find(c => {
    if (c.file && path.basename(c.file) === fn) return true;
    if (pxId && (c.id.includes(pxId) || (c.source && c.source.includes(pxId)))) return true;
    return false;
  });

  if (!found) {
    uncatalogued.push(r);
  }
});

console.log('Uncatalogued files:', uncatalogued.length);
uncatalogued.forEach(u => console.log('  *', u.file, `(${new Date(u.mtime).toLocaleString()})`));
