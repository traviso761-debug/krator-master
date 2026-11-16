const fs = require('fs');
const path = require('path');

const tplPath = path.join(__dirname, '..', 'lab', 'template.html');
let tpl = fs.readFileSync(tplPath, 'utf8');
const isCRLF = tpl.includes('\r\n');
tpl = tpl.replace(/\r\n/g, '\n');

// 1. Patch decode(id)
const oldDecode = `function decode(id) {
  if (decoded.has(id)) { const p = decoded.get(id); decoded.delete(id); decoded.set(id, p); return p; }
  const c = CLIPS[id];`;

const newDecode = `function decode(id) {
  if (decoded.has(id)) { const p = decoded.get(id); decoded.delete(id); decoded.set(id, p); return p; }
  const cut = typeof localCuts !== 'undefined' ? [...(localCuts || []), ...(sharedCuts || [])].find(x => x.id === id) : null;
  if (cut) {
    const p = decode(cut.clip).then(parentBuf => {
      const start = clamp(cut.start || 0, 0, parentBuf.duration);
      const end = clamp(cut.end || parentBuf.duration, start + 0.05, parentBuf.duration);
      let sliced = slice(parentBuf, start, end);
      if (cut.xf > 0) sliced = loopable(sliced, cut.xf);
      return sliced;
    });
    p.catch(() => decoded.delete(id));
    decoded.set(id, p);
    while (decoded.size > 8) decoded.delete(decoded.keys().next().value);
    return p;
  }
  const c = CLIPS[id];`;

if (tpl.includes(oldDecode)) {
  tpl = tpl.replace(oldDecode, newDecode);
  console.log('Successfully patched decode() in template.html');
} else {
  console.log('oldDecode already patched or not found');
}

// 2. Patch renderCutsInto with + Soundtrack button
const oldCutRow = `    bt('+ Scene', () => { trackFromCut(c); renderTracks(); changed(); edMsg('Added "' + c.name + '" to the scene.'); });`;

const newCutRow = `    bt('+ Scene', () => { trackFromCut(c); renderTracks(); changed(); edMsg('Added "' + c.name + '" to the scene.'); });
    bt('+ Soundtrack', (e) => {
      e.stopPropagation();
      const parent = CLIPS[c.clip] || {};
      const cutMeta = {
        id: c.id,
        title: c.name || 'Saved Cut',
        category: parent.category || 'amb.bed',
        duration: Math.max(0.1, (c.end || 0) - (c.start || 0)),
        isCut: true
      };
      if (typeof openSoundtrackAddMenu === 'function') openSoundtrackAddMenu(cutMeta, e.currentTarget);
    });`;

if (tpl.includes(oldCutRow) && !tpl.includes("bt('+ Soundtrack'")) {
  tpl = tpl.replace(oldCutRow, newCutRow);
  console.log('Added + Soundtrack button to saved cut list in template.html');
} else {
  console.log('oldCutRow already patched or not found');
}

fs.writeFileSync(tplPath, isCRLF ? tpl.replace(/\n/g, '\r\n') : tpl, 'utf8');
console.log('patch_template_cuts complete');
