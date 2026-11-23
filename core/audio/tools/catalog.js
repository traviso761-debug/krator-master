// node core/audio/tools/catalog.js <command>   (core/audio/PLAN.md sections 2-3)
// The audio files live OUTSIDE the repo (owner, 2026-10-28: no audio goes to origin until it is wired into the game):
// in the audio folder, $KRATOR_AUDIO or ../krator-audio beside the repo. Records' `file` paths are relative to it.
//   board            build data/clips.json and data/rejected.json from <audio>/sound-board (meta.json, groups.json, held/)
//   intake <batch>   check <audio>/intake/<batch>/clips.json; move accepted clips into <audio>/library/, add them to
//                    data/clips.json, and write <batch>/report.md with every rejection and why
//   check            check data/clips.json against the license policy (and that files exist, when the folder is here)
//   credits          write core/audio/CREDITS.md from data/clips.json
const fs = require('fs'), path = require('path');
const AUDIO = path.join(__dirname, '..'), ROOT = path.join(AUDIO, '..', '..'), DATA = path.join(AUDIO, 'data');
const LIB = process.env.KRATOR_AUDIO || path.join(ROOT, '..', 'krator-audio');
global.window = global;
eval(fs.readFileSync(path.join(AUDIO, '20-core-audio-catalog.js'), 'utf8'));
const K = KAUDIO.useLicenses(JSON.parse(fs.readFileSync(path.join(DATA, 'licenses.json'), 'utf8')));
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 1) + '\n', 'utf8');
const rel = p => path.relative(LIB, p).split(path.sep).join('/');
const CLIPS = path.join(DATA, 'clips.json');

/* The board's groups become categories and tags; its per-clip tag ("S, night") becomes biome and time tags. */
const GROUP = {
  'Beds': ['amb.bed', []], 'Insects': ['amb.element', ['insect']], 'Frogs and calls': ['sfx.creature', ['call']],
  'Howlers': ['sfx.creature', ['primate', 'howl']], 'Howl bamboo': ['amb.element', ['howl-bamboo', 'wind']],
  'Strange material': ['raw', ['strange']], 'Birds of the north': ['sfx.creature', ['bird', 'temperate']],
  'Bats': ['sfx.creature', ['bat']], 'Giant insect material': ['raw', ['giant-insect', 'insect']]
};
const WORD = { 's': 'hyperjungle-s', 'n': 'hyperjungle-n', 'savage': 'hyperjungle-savage', 'savannah rims': 'savannah',
  'flooded forest': 'flooded-forest', 'the quiet forest': 'quiet', 'culms': 'howl-bamboo', 'howl': 'howl-bamboo' };
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function tagsOf(group, tag) {
  const out = new Set((GROUP[group] || ['raw', []])[1]);
  String(tag || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean).forEach(w => out.add(WORD[w] || slug(w)));
  if ([...out].some(t => t.startsWith('hyperjungle'))) out.add('hyperjungle');
  return [...out].filter(Boolean).sort();
}
function splitTitle(t) {
  const m = String(t).match(/^(.*) by (.+?)(?: \(([^)]*)\))?$/);
  return m ? { title: m[1].trim(), creator: m[2].trim() } : { title: String(t).trim(), creator: '' };
}
const newId = old => /^\d+$/.test(old) ? 'fs-' + old : old;

function board() {
  const B = path.join(LIB, 'sound-board');
  const meta = read(path.join(B, 'meta.json')), groups = read(path.join(B, 'groups.json'));
  const held = fs.existsSync(path.join(B, 'held', 'meta.json')) ? read(path.join(B, 'held', 'meta.json')) : {};
  const place = {};
  groups.forEach(g => g.clips.forEach(([id, tag, note]) => { if (!place[id]) place[id] = { group: g.name, tag, note }; }));
  const clips = [], rejected = [];
  for (const [old, m] of Object.entries(meta)) {
    const lic = K.licenseOf(m.license), pl = place[old] || { group: '', tag: '', note: '' }, { title, creator } = splitTitle(m.title || old);
    const rec = { id: newId(old), legacy: old, title, creator, source: m.page || '', license: lic, licenseText: m.license || '',
      category: (GROUP[pl.group] || ['raw'])[0], tags: tagsOf(pl.group, pl.tag), notes: pl.note || '', duration: +m.duration || 0,
      file: 'sound-board/' + m.file, share: K.shareable(lic), status: 'candidate' };
    rec.attribution = K.attribution(rec);
    if (!K.inGame(lic)) { rejected.push({ id: rec.id, title, creator, source: rec.source, license: lic, licenseText: rec.licenseText, why: K.license(lic).why, file: rec.file }); continue; }
    clips.push(rec);
  }
  for (const [id, m] of Object.entries(held)) {
    const { title, creator } = splitTitle(m.title || id);
    rejected.push({ id, title, creator, source: m.page || '', license: 'unverified', licenseText: m.license || '', why: m.why || K.license('unverified').why, file: 'sound-board/held/' + m.file });
  }
  /* Clips that came in through intake live in library/: keep them, the board knows nothing of them. */
  if (fs.existsSync(CLIPS)) read(CLIPS).clips.filter(c => String(c.file).startsWith('library/') && !clips.some(x => x.id === c.id)).forEach(c => clips.push(c));
  clips.sort((a, b) => a.id < b.id ? -1 : 1); rejected.sort((a, b) => a.id < b.id ? -1 : 1);
  write(CLIPS, { _doc: 'The clip catalogue (core/audio/PLAN.md section 3). Built by tools/catalog.js; new clips come in through intake.', clips });
  write(path.join(DATA, 'rejected.json'), { _doc: 'Clips kept out of the game by the license policy, with the reason. Never use these.', clips: rejected });
  console.log('catalogue', clips.length, 'clips (' + clips.filter(c => c.share).length + ' shareable), rejected', rejected.length);
}

const AUDIO_EXT = /\.(mp3|ogg|wav|flac)$/i;
function realAudio(p) {
  if (!fs.existsSync(p) || fs.statSync(p).size < 2048) return false;
  const b = fs.readFileSync(p).subarray(0, 4), s = b.toString('latin1');
  return s.startsWith('ID3') || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) || s === 'OggS' || s === 'RIFF' || s === 'fLaC';
}
function intake(batch) {
  const dir = path.join(LIB, 'intake', batch), cat = read(CLIPS), byId = {};
  cat.clips.forEach(c => { byId[c.id] = c; if (c.legacy) byId[c.legacy] = c; });
  const recs = read(path.join(dir, 'clips.json')), list = Array.isArray(recs) ? recs : recs.clips || [];
  const ok = [], bad = [];
  for (const r of list) {
    const p = K.check(r, byId), src = path.join(dir, 'audio', path.basename(r.file || (r.id + '.mp3')));
    if (!AUDIO_EXT.test(src) || !realAudio(src)) p.push('file: missing or not real audio (' + rel(src) + ')');
    const twin = cat.clips.find(c => c.source && c.source === r.source);
    if (twin) p.push('duplicate: same source page as ' + twin.id);
    if (p.length) { bad.push([r.id, p]); continue; }
    const share = K.shareable(r.license), dest = path.join(LIB, 'library', path.basename(src));
    fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.renameSync(src, dest);
    const rec = { id: r.id, title: r.title, creator: r.creator, source: r.source, license: r.license, licenseText: r.licenseText || '',
      category: r.category, tags: (r.tags || []).map(slug).filter(Boolean).sort(), notes: r.notes || '', duration: +r.duration,
      file: rel(dest), share, status: 'candidate' };
    rec.attribution = r.attribution || K.attribution(rec);
    cat.clips.push(rec); byId[rec.id] = rec; ok.push(rec.id);
  }
  cat.clips.sort((a, b) => a.id < b.id ? -1 : 1); write(CLIPS, cat);
  const report = ['# Intake ' + batch, '', 'Accepted ' + ok.length + ', rejected ' + bad.length + '.', '',
    ...(bad.length ? ['## Rejected', '', ...bad.map(([id, p]) => '- `' + id + '`: ' + p.join('; ')), ''] : []),
    ...(ok.length ? ['## Accepted', '', ...ok.map(id => '- `' + id + '`'), ''] : [])].join('\n');
  fs.writeFileSync(path.join(dir, 'report.md'), report, 'utf8');
  console.log(report);
}
function checkAll() {
  const cat = read(CLIPS), seen = new Set(), problems = [];
  for (const c of cat.clips) {
    if (seen.has(c.id)) problems.push(c.id + ': duplicate id'); seen.add(c.id);
    if (!K.inGame(c.license)) problems.push(c.id + ': license ' + c.license + ' is not allowed in the game');
    if (c.share && !K.shareable(c.license)) problems.push(c.id + ': marked shareable but ' + c.license + ' may not be re-shared');
    if (!/^https?:\/\//.test(c.source || '')) problems.push(c.id + ': no source page');
    if (K.creditRequired(c.license) && !c.attribution) problems.push(c.id + ': credit required but no attribution');
    if (fs.existsSync(LIB) && !fs.existsSync(path.join(LIB, c.file))) problems.push(c.id + ': file missing (' + c.file + ' in ' + LIB + ')');
  }
  problems.forEach(p => console.log('FAIL  ' + p));
  console.log(cat.clips.length + ' clips, ' + problems.length + ' problems');
  return problems.length;
}
function credits() {
  const cat = read(CLIPS);
  fs.writeFileSync(path.join(AUDIO, 'CREDITS.md'), KAUDIO.credits(cat.clips, 'Sound credits (the whole catalogue)'), 'utf8');
  console.log('wrote core/audio/CREDITS.md');
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === 'board') board();
else if (cmd === 'intake' && arg) intake(arg);
else if (cmd === 'check') process.exit(checkAll() ? 1 : 0);
else if (cmd === 'credits') credits();
else { console.log('usage: node core/audio/tools/catalog.js board | intake <batch> | check | credits'); process.exit(2); }
