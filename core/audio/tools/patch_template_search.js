const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'lab', 'template.html');
let html = fs.readFileSync(target, 'utf8');

// 1. Update matching
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

const newMatching = `function matching() {
  const rawQ = filt.q.toLowerCase().trim();
  const words = rawQ ? rawQ.split(/[\\s_/-]+/).filter(Boolean) : [];
  const len = filt.len ? filt.len.split('-').map(Number) : null;
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
      const n = noteOf(c.id) || {};
      const hay = [
        c.id, c.title, c.user, c.note, c.tags.join(' '), c.category, c.src,
        c.page || '', c.origFile || '', c.file || '', n.use, n.text
      ].join(' ').toLowerCase();
      const hayNorm = hay.replace(/[-_./]/g, ' ');
      for (const rawW of words) {
        const w = normSearchToken(rawW);
        const match = hay.includes(rawW) || hay.includes(w) || hayNorm.includes(rawW) || hayNorm.includes(w);
        if (!match) {
          if (w.length >= 5) {
            const prefix = w.slice(0, 4);
            if (!hay.includes(prefix) && !hayNorm.includes(prefix)) return false;
          } else {
            return false;
          }
        }
      }
    }
    return true;
  });
}`;

const isCRLF = html.includes('\r\n');
const htmlNorm = html.replace(/\r\n/g, '\n');
const oldMatchingNorm = oldMatching.replace(/\r\n/g, '\n');

if (!htmlNorm.includes(oldMatchingNorm)) {
  console.error('Could not find oldMatching in template.html');
  process.exit(1);
}
let patched = htmlNorm.replace(oldMatchingNorm, newMatching);

// 2. Update renderLibrary details.open state
const oldGrp = `    const sec = el('details', 'grp'); sec.open = !folded.has(g.key);
    const sum = el('summary'); sum.append(el('h2', '', esc(g.name)), el('span', 'count', g.clips.length + (g.clips.length === 1 ? ' clip' : ' clips')));
    sec.appendChild(sum);
    sec.addEventListener('toggle', () => { sec.open ? folded.delete(g.key) : folded.add(g.key); saveFolded(); });`;

const newGrp = `    const sec = el('details', 'grp'); sec.open = filt.q ? true : !folded.has(g.key);
    const sum = el('summary'); sum.append(el('h2', '', esc(g.name)), el('span', 'count', g.clips.length + (g.clips.length === 1 ? ' clip' : ' clips')));
    sec.appendChild(sum);
    sec.addEventListener('toggle', () => { if (!filt.q) { sec.open ? folded.delete(g.key) : folded.add(g.key); saveFolded(); } });`;

const oldGrpNorm = oldGrp.replace(/\r\n/g, '\n');
if (!patched.includes(oldGrpNorm)) {
  console.error('Could not find oldGrp in template.html');
  process.exit(1);
}
patched = patched.replace(oldGrpNorm, newGrp);

// 3. Update meta and extra in clipRow
const oldMeta = `'<div class="sub">' + esc(c.user) + ' &middot; <a href="' + esc(c.page) + '" target="_blank" rel="noopener">' + esc(c.src) + '</a>' +
    ' &middot; <span class="lic">' + esc(c.lic) + '</span>' + (c.tags.length ? ' &middot; <span class="tagline">' + c.tags.map(esc).join(', ') + '</span>' : '') + '</div>'`;

const newMeta = `'<div class="sub">' + esc(c.user) + ' &middot; <a href="' + esc(c.page) + '" target="_blank" rel="noopener">' + esc(c.src) + '</a>' +
    ' &middot; <span class="lic">' + esc(c.lic) + '</span>' + (c.tags.length ? ' &middot; <span class="tagline">' + c.tags.map(esc).join(', ') + '</span>' : '') +
    (c.origFile ? ' &middot; <span class="origfile" title="Downloaded file" style="color:#789; font-size:11px;">📁 ' + esc(c.origFile) + '</span>' : '') + '</div>'`;

const oldMetaNorm = oldMeta.replace(/\r\n/g, '\n');
if (!patched.includes(oldMetaNorm)) {
  console.error('Could not find oldMeta in template.html');
  process.exit(1);
}
patched = patched.replace(oldMetaNorm, newMeta);

const oldExtra = `extra.append(speed, pitch, loop, el('span', 'msg', 'volume'), vol, el('span', 'msg', esc(c.id) + (c.credit ? ' &middot; credit: ' + esc(c.credit) : '')));`;
const newExtra = `extra.append(speed, pitch, loop, el('span', 'msg', 'volume'), vol, el('span', 'msg', esc(c.id) + (c.origFile ? ' &middot; ' + esc(c.origFile) : '') + (c.credit ? ' &middot; credit: ' + esc(c.credit) : '')));`;

if (!patched.includes(oldExtra)) {
  console.error('Could not find oldExtra in template.html');
  process.exit(1);
}
patched = patched.replace(oldExtra, newExtra);

if (isCRLF) {
  patched = patched.replace(/\n/g, '\r\n');
}

fs.writeFileSync(target, patched, 'utf8');
console.log('Successfully patched template.html');
