const fs = require('fs'), path = require('path');
const p = path.join(__dirname, '..', 'lab', 'template.html');
let html = fs.readFileSync(p, 'utf8');

const oldMatching = `function matching() {
  const words = filt.q.toLowerCase().split(/\\s+/).filter(Boolean), len = filt.len ? filt.len.split('-').map(Number) : null;
  return DATA.clips.filter(c => {
    if (filt.cat && c.category !== filt.cat) return false;
    if (filt.lic === 'free' && !(c.license === 'cc0' || c.license.startsWith('pd-'))) return false;
    if (filt.lic === 'by' && !c.license.startsWith('cc-by')) return false;
    if (filt.lic === 'rf' && !c.license.startsWith('rf-')) return false;
    if (filt.status === 'noted') { const n = noteOf(c.id); if (!n || !(n.text || n.use)) return false; }
    else if (filt.status && statusOf(c.id) !== filt.status) return false;
    if (len && !(c.duration >= len[0] && c.duration < len[1])) return false;
    for (const t of filt.tags) if (!c.tags.includes(t)) return false;
    if (words.length) {
      const n = noteOf(c.id) || {}, hay = [c.id, c.title, c.user, c.note, c.tags.join(' '), c.category, c.src, n.use, n.text].join(' ').toLowerCase();
      for (const w of words) if (!hay.includes(w)) return false;
    }
    return true;
  });
}`;

const newMatching = `const SEARCH_ALIASES = {
  'alient': 'alien', 'taking': 'talking', 'geiger': 'geiger', 'rad': 'radiation', 'soundscape': 'soundscapes'
};
function normSearchToken(w) { return SEARCH_ALIASES[w] || w; }
function matching() {
  const words = filt.q.toLowerCase().split(/\\s+/).filter(Boolean), len = filt.len ? filt.len.split('-').map(Number) : null;
  return DATA.clips.filter(c => {
    if (filt.cat && c.category !== filt.cat) return false;
    if (filt.lic === 'free' && !(c.license === 'cc0' || c.license.startsWith('pd-'))) return false;
    if (filt.lic === 'by' && !c.license.startsWith('cc-by')) return false;
    if (filt.lic === 'rf' && !c.license.startsWith('rf-')) return false;
    if (filt.status === 'noted') { const n = noteOf(c.id); if (!n || !(n.text || n.use)) return false; }
    else if (filt.status && statusOf(c.id) !== filt.status) return false;
    if (len && !(c.duration >= len[0] && c.duration < len[1])) return false;
    for (const t of filt.tags) if (!c.tags.includes(t)) return false;
    if (words.length) {
      const n = noteOf(c.id) || {}, hay = [c.id, c.title, c.user, c.note, c.tags.join(' '), c.category, c.src, n.use, n.text].join(' ').toLowerCase();
      for (const rawW of words) {
        const w = normSearchToken(rawW);
        if (!hay.includes(rawW) && !hay.includes(w)) {
          if (w.length >= 5) {
            const prefix = w.slice(0, 4);
            if (!hay.includes(prefix)) return false;
          } else {
            return false;
          }
        }
      }
    }
    return true;
  });
}`;

const oldCRLF = oldMatching.replace(/\n/g, '\r\n');
const newCRLF = newMatching.replace(/\n/g, '\r\n');

if (html.includes(oldCRLF)) {
  html = html.replace(oldCRLF, newCRLF);
  fs.writeFileSync(p, html, 'utf8');
  console.log('Updated matching() in template.html (CRLF)');
} else if (html.includes(oldMatching)) {
  html = html.replace(oldMatching, newMatching);
  fs.writeFileSync(p, html, 'utf8');
  console.log('Updated matching() in template.html (LF)');
} else {
  console.error('oldMatching not found');
}
