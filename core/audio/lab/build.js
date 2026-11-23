// node core/audio/lab/build.js [--all]   (core/audio/PLAN.md section 5, step A2)
// Builds the Audio Lab into the audio folder ($KRATOR_AUDIO or ../krator-audio beside the repo; no audio in the repo):
//   <audio>/lab/previews/<id>.mp3   a small preview of every clip (ffmpeg; 80 kbps, 48 kbps over ten minutes), made once
//   <audio>/lab/index.html          template.html with the catalogue embedded
// By default only re-shareable clips go in (the published lab); --all adds the royalty-free ones that must stay on this
// machine (a local lab only: never publish that build).
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const HERE = __dirname, AUDIO = path.join(HERE, '..'), ROOT = path.join(AUDIO, '..', '..');
const LIB = process.env.KRATOR_AUDIO || path.join(ROOT, '..', 'krator-audio'), OUT = path.join(LIB, 'lab');
const ALL = process.argv.includes('--all');
global.window = global;
eval(fs.readFileSync(path.join(AUDIO, '20-core-audio-catalog.js'), 'utf8'));
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const K = KAUDIO.useLicenses(read(path.join(AUDIO, 'data', 'licenses.json')));
const cat = read(path.join(AUDIO, 'data', 'clips.json')).clips, cats = read(path.join(AUDIO, 'data', 'categories.json'));

const SHORT = { 'cc0': 'CC0', 'pd-usgov': 'Public domain', 'pd-age': 'Public domain', 'pd-author': 'Public domain',
  'cc-by-2.5': 'CC BY 2.5: credit the recordist', 'cc-by-3.0': 'CC BY 3.0: credit the recordist', 'cc-by-4.0': 'CC BY 4.0: credit the recordist' };
const shortLic = id => SHORT[id] || (id.startsWith('rf-') ? 'Royalty-free: game only, never re-shared' : id);
function site(c) {
  const h = (String(c.source).match(/^https?:\/\/([^/]+)/) || [])[1] || '';
  if (/freesound/.test(h)) return 'Freesound';
  const known = { 'www.nps.gov': 'NPS Sound Gallery', 'commons.wikimedia.org': 'Wikimedia Commons', 'opengameart.org': 'OpenGameArt',
    'soundopedia.com': 'Soundopedia', 'www.inaturalist.org': 'iNaturalist', 'archive.org': 'Internet Archive', 'citizen-dj.labs.loc.gov': 'Library of Congress',
    'www.freetousesounds.com': 'Free To Use Sounds' };
  return known[h] || (c.id.startsWith('sonniss-') ? 'Sonniss GDC' : h || 'source');
}

function ffmpeg(args) {
  return new Promise((res, rej) => {
    const p = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] }); let err = '';
    p.stderr.on('data', d => { err += d; }); p.on('error', rej);
    p.on('close', code => code === 0 ? res() : rej(new Error(err.trim().split('\n').pop())));
  });
}
async function previews(clips) {
  fs.mkdirSync(path.join(OUT, 'previews'), { recursive: true });
  const todo = clips.filter(c => {
    const src = path.join(LIB, c.file), dst = path.join(OUT, 'previews', c.id + '.mp3');
    if (!fs.existsSync(src)) { console.log('MISSING ' + c.id + ': ' + c.file); return false; }
    return !fs.existsSync(dst) || fs.statSync(dst).mtimeMs < fs.statSync(src).mtimeMs;
  });
  let done = 0, failed = 0;
  const one = async c => {
    const kbps = c.duration > 600 ? '48k' : '80k', dst = path.join(OUT, 'previews', c.id + '.mp3'), src = path.join(LIB, c.file);
    try {
      await ffmpeg(['-y', '-v', 'error', '-i', src, '-vn', '-ac', '2', '-ar', '44100', '-b:a', kbps, dst]);
    } catch (e) {
      try {
        fs.copyFileSync(src, dst);
      } catch (err2) {
        failed++; console.log('FAILED ' + c.id + ': ' + e.message);
      }
    }
    if (++done % 20 === 0) console.log('previews ' + done + '/' + todo.length);
  };
  const q = todo.slice(), workers = Array.from({ length: 4 }, async () => { while (q.length) await one(q.shift()); });
  await Promise.all(workers);
  return { made: todo.length - failed, failed };
}

(async () => {
  const clips = cat.filter(c => K.inGame(c.license) && (ALL || c.share));
  const r = await previews(clips);
  const have = clips.filter(c => fs.existsSync(path.join(OUT, 'previews', c.id + '.mp3')) || fs.existsSync(path.join(OUT, 'previews', c.id + '.wav')));
  const data = {
    built: new Date().toISOString().slice(0, 10), local: ALL,
    categories: cats.categories, statuses: cats.status,
    music: read(path.join(AUDIO, 'data', 'music.json')),
    clips: have.map(c => ({ id: c.id, legacy: c.legacy || null, title: c.title, user: c.creator, page: c.source, src: site(c),
      origFile: c.origFile || path.basename(c.file || ''),
      license: c.license, lic: shortLic(c.license), credit: K.creditRequired(c.license) ? c.attribution : '', share: !!c.share,
      category: c.category, tags: c.tags || [], note: c.notes || '', duration: c.duration,
      file: 'previews/' + c.id + (fs.existsSync(path.join(OUT, 'previews', c.id + '.wav')) ? '.wav' : '.mp3') }))
  };
  const legacy = {}; data.clips.forEach(c => { if (c.legacy) legacy[c.legacy] = c.id; }); data.legacy = legacy;
  /* The page runs the module's own code: core/rand, cue picker, soundscape blender, and music director are embedded. */
  const modules = [
    path.join(ROOT, 'core', 'rand', '08-core-rand.js'),
    path.join(AUDIO, '22-core-audio-cues.js'),
    path.join(AUDIO, '24-core-audio-soundscape.js'),
    path.join(AUDIO, '26-core-audio-music.js')
  ].map(p => fs.readFileSync(p, 'utf8')).join('\n');
  const page = fs.readFileSync(path.join(HERE, 'template.html'), 'utf8').replace('/*MODULES*/', () => modules).replace('/*DATA*/', () => JSON.stringify(data));
  fs.writeFileSync(path.join(OUT, 'index.html'), page, 'utf8');
  const mb = have.reduce((a, c) => {
    const p = fs.existsSync(path.join(OUT, 'previews', c.id + '.wav')) ? path.join(OUT, 'previews', c.id + '.wav') : path.join(OUT, 'previews', c.id + '.mp3');
    return a + fs.statSync(p).size;
  }, 0) / 1e6;
  console.log('lab: ' + have.length + ' clips' + (ALL ? ' (LOCAL build: includes clips that must never be published)' : '') +
    ', previews ' + mb.toFixed(1) + ' MB (' + r.made + ' made, ' + r.failed + ' failed) -> ' + path.join(OUT, 'index.html'));
})();
