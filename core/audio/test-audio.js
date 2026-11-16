// node core/audio/test-audio.js — the audio catalogue's contract: the license policy, intake checks, filters, credits,
// and data/clips.json itself. Each check comes with a broken input that must fail.
const fs = require('fs'), path = require('path');
global.window = global; eval(fs.readFileSync(path.join(__dirname, '20-core-audio-catalog.js'), 'utf8'));
const read = p => JSON.parse(fs.readFileSync(path.join(__dirname, p), 'utf8'));
const K = KAUDIO.useLicenses(read('data/licenses.json'));
let bad = 0; const ok = (name, pass, neg) => { const r = pass && !neg; if (!r) bad++; console.log((r ? 'PASS  ' : 'FAIL  ') + name + (neg ? ' (its negative passed)' : '')); };

/* the policy, from the license texts sources actually use */
const T = t => K.licenseOf(t);
ok('CC0 by URL and by name', T('creativecommons.org/publicdomain/zero/1.0/') === 'cc0' && T('Creative Commons 0 (Public Domain)') === 'cc0', T('') === 'cc0');
ok('US federal works are public domain', T('Public Domain (U.S. Federal Government)') === 'pd-usgov' && T('Public Domain (U.S. National Park Service)') === 'pd-usgov', T('Public Domain (somebody)') === 'pd-usgov');
ok('CC BY 3.0 and 4.0 need credit', T('creativecommons.org/licenses/by/3.0/') === 'cc-by-3.0' && K.creditRequired('cc-by-4.0'), K.creditRequired('cc0'));
ok('non-commercial is out, even when it also says Attribution', T('Creative Commons Attribution-NonCommercial 4.0') === 'cc-by-nc' && !K.inGame('cc-by-nc'), K.inGame(T('creativecommons.org/licenses/by-nc/4.0/')));
ok('no-derivatives and share-alike are out', !K.inGame(T('Attribution-NoDerivatives 4.0')) && !K.inGame(T('Attribution-ShareAlike 4.0')), K.inGame(T('licenses/by-sa/4.0')));
ok('royalty-free is for the game, never re-shared', K.inGame(T('Sonniss GDC Royalty-Free (Commercial OK, No Attribution)')) && !K.shareable('rf-sonniss') && !K.shareable(T('Mixkit Free License')), K.shareable('rf-ftus'));
ok('"No Attribution" in a royalty-free name is not CC BY', T('Sonniss GDC Royalty-Free (Commercial OK, No Attribution)') === 'rf-sonniss', T('Sonniss GDC Royalty-Free (Commercial OK, No Attribution)') === 'cc-by-4.0');
ok('an unknown license is unverified and kept out', T('some site license') === 'unverified' && !K.inGame('unverified'), K.inGame(T('???')));

/* intake checks */
const good = { id: 'fs-1', title: 'Hiss', creator: 'Someone', source: 'https://freesound.org/s/1/', license: 'cc0', category: 'raw', duration: 3 };
ok('a complete CC0 record passes', K.check(good, {}).length === 0, K.check({ ...good, source: '' }, {}).length === 0);
ok('a duplicate id is refused', K.check(good, { 'fs-1': good }).some(p => /already/.test(p)), K.check(good, {}).some(p => /already/.test(p)));
ok('a disallowed license is refused with its reason', K.check({ ...good, license: 'cc-by-nc' }, {}).some(p => /non-commercial/.test(p)), K.check(good, {}).some(p => /not allowed/.test(p)));
ok('CC BY without a credit line is refused', K.check({ ...good, license: 'cc-by-4.0' }, {}).some(p => /attribution/.test(p)), K.check({ ...good, license: 'cc-by-4.0', attribution: 'x' }, {}).some(p => /attribution/.test(p)));
ok('an unknown license id is refused', K.check({ ...good, license: 'mit' }, {}).some(p => /not an id/.test(p)), K.check(good, {}).length > 0);

/* filters, sorting, credits */
const C = [{ id: 'a', title: 'Owl', creator: 'Zed', category: 'sfx.creature', tags: ['bird', 'night'], license: 'cc0', duration: 5, status: 'approved', share: true },
  { id: 'b', title: 'Rain bed', creator: 'Amy', category: 'amb.bed', tags: ['rain'], license: 'cc-by-4.0', duration: 120, status: 'candidate', share: true, attribution: 'Rain bed by Amy' },
  { id: 'c', title: 'Hornet', creator: 'Bo', category: 'raw', tags: ['insect', 'giant-insect'], license: 'rf-sonniss', duration: 30, status: 'candidate', share: false }];
const ids = a => a.map(x => x.id).join('');
ok('filter by category, tag, text and length', ids(KAUDIO.filter(C, { category: 'amb.bed' })) === 'b' && ids(KAUDIO.filter(C, { tags: ['giant-insect'] })) === 'c' &&
  ids(KAUDIO.filter(C, { text: 'owl night' })) === 'a' && ids(KAUDIO.filter(C, { minDur: 10, maxDur: 60 })) === 'c', ids(KAUDIO.filter(C, { text: 'owl rain' })) !== '');
ok('filter by kind and by shareable', ids(KAUDIO.filter(C, { kind: 'sfx' })) === 'a' && ids(KAUDIO.filter(C, { share: false })) === 'c', ids(KAUDIO.filter(C, { kind: 'bed' })) !== 'b');
ok('sort by duration, both ways', ids(KAUDIO.sort(C, 'duration')) === 'acb' && ids(KAUDIO.sort(C, 'duration', true)) === 'bca', ids(KAUDIO.sort(C, 'title')) === 'acb');
const cr = KAUDIO.credits(C);
ok('credits put required credits first and include everything allowed', cr.indexOf('Rain bed by Amy') < cr.indexOf('"Owl" by Zed') && /Hornet/.test(cr), !/Required/.test(cr));
ok('credits never list a disallowed clip', !/Bad/.test(KAUDIO.credits([{ id: 'x', title: 'Bad', creator: 'X', license: 'cc-by-nc' }])), /Bad/.test(KAUDIO.credits([{ id: 'x', title: 'Bad', creator: 'X', license: 'cc0' }])) === false);

/* the catalogue itself obeys the policy */
const cat = read('data/clips.json').clips, rej = read('data/rejected.json').clips;
/* each rule is a function, run on the catalogue and on the catalogue plus one bad clip */
const allowed = a => a.every(c => K.inGame(c.license)), sharedOk = a => a.every(c => !c.share || K.shareable(c.license));
const sourced = a => a.every(c => /^https?:\/\//.test(c.source) && c.creator), credited = a => a.filter(c => K.creditRequired(c.license)).every(c => c.attribution);
const unique = a => new Set(a.map(c => c.id)).size === a.length, one = cat[0];
ok('every catalogued clip is allowed in the game', cat.length > 0 && allowed(cat), allowed([...cat, { ...one, license: 'cc-by-nc' }]));
ok('only re-shareable licenses are marked shareable', sharedOk(cat), sharedOk([...cat, { ...one, license: 'rf-sonniss', share: true }]));
ok('every clip has a source page and a creator', sourced(cat), sourced([...cat, { ...one, source: 'freesound' }]));
ok('every clip whose license asks for credit has an attribution line', credited(cat), credited([...cat, { ...one, license: 'cc-by-4.0', attribution: '' }]));
ok('ids are unique', unique(cat), unique([...cat, one]));
ok('nothing rejected slipped into the catalogue', !rej.some(r => cat.some(c => c.id === r.id)) && rej.every(r => !K.inGame(r.license)), false);
const cats = new Set(read('data/categories.json').categories.map(c => c.id));
ok('every clip has a known category', cat.every(c => cats.has(c.category)), cats.has('nope'));

console.log(bad ? bad + ' FAILED' : 'all passed');
process.exit(bad ? 1 : 0);
