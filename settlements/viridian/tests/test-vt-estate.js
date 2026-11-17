#!/usr/bin/env node
/* settlements/viridian/tests/test-vt-estate.js: the estate as records (src/40-vt-estate.js; PLAN.md step V4), in node:
     - the three gardens are core/terrain terraces records that KRELIEF accepts, each held to its polygon and height band;
     - every hedge stands on a tread (KRELIEF.at), never on a riser or a bund, and the rows lie across the treads as planned;
     - the same seeds give the same hedges, a different seed moves them;
     - every bed's crop grows on its ground rain-fed (kits/crops, CROPS.at), and the shade crops stand only in the shade.
   The ground here is a stand-in for core/world's at 1:1 (step V6): the cell's slope (12 % below the house, 16.5 % above,
   SURVEY.md) and the hollow's two flanks rising away from its axis.

     node settlements/viridian/tests/test-vt-estate.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const HERE = path.join(__dirname, '..'), ROOT = path.join(HERE, '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);
global.window = global;
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
load('core/rand/08-core-rand.js');
load('core/terrain/38-core-relief.js');
load('core/terrain/38c-core-landforms.js');
['10-crop-core.js', '20-crop-records.js', '22-crop-material.js', '24-crop-vale-wild.js', '40-crop-query.js'].forEach(f => load('kits/crops/src/' + f));
load('settlements/viridian/src/40-vt-estate.js');
const K = KRELIEF;

/* the stand-in ground: 813 m at the court, the apron's two slopes, the flanks rising 6e-5 z^2 (90 m at 1.2 km) */
const ground = (x, z) => 813 + (x > 0 ? 0.165 * x : 0.12 * x) + 6e-5 * z * z;

/* ---- the terraces */
const R = VTE.terraces();
T.ok('three gardens as terraces records (' + R.map(r => r.kind).join(', ') + ')', R.length === 3 && R.every(r => r.kind === 'terraces' && r.zone && r.zone.poly && r.band),
  JSON.stringify(R.map(r => r.kind)));
T.ok('the records are plain data (survive JSON)', R.every(r => JSON.stringify(JSON.parse(JSON.stringify(r))) === JSON.stringify(r)), '');
const inBand = (r, x, z) => { const a = K.at(r, x, z, ground(x, z)); return !!a; };
/* the Low Garden's north flank at (0, -700) lies in its band (813 + 29 = 842 m); outside its polygon, at the court, it is not */
T.neg('a garden is held to its polygon', p => inBand(R[0], p[0], p[1]), [0, 0], [0, -700]);
/* the High Garden at x 1900 stands 813 + 0.165*1900 = 1126 m, in its band 1040-1200; at x 2400 + 400 it is outside */
T.neg('a garden is held to its height band', g => !!K.at(R[2], 1900, 0, g), 1300, ground(1900, 0));

/* ---- the hedges: a 160 x 160 m sample of each garden */
const BOX = [[-80, -780, 80, -620], [-80, 620, 80, 780], [1820, -80, 1980, 80]];
const H = R.map((r, i) => VTE.hedges(r, ground, { box: BOX[i] }));
T.ok('each sample has hedges (' + H.map(h => h.length).join(', ') + ')', H.every(h => h.length > 500), H.map(h => h.length).join(', '));
const partsOf = (r, pts) => { const c = {}; for (const p of pts) { const a = K.at(r, p.x, p.z, ground(p.x, p.z)); const k = a ? a.part : 'none'; c[k] = (c[k] || 0) + 1; } return c; };
const onTread = (r, pts) => { const c = partsOf(r, pts); return pts.length > 0 && c.tread === pts.length; };
T.ok('every hedge stands on a tread', R.every((r, i) => onTread(r, H[i])), H.map((h, i) => JSON.stringify(partsOf(R[i], h))).join(' '));
/* rows placed past the tread (at 0.95 of a step: the riser) are caught; the plan's rows pass */
{ const r = R[0], rs = r.riser;
  T.neg('a hedge row on the riser is caught', rows => onTread(r, VTE.hedges(r, ground, { box: BOX[0], rows })), [0.95], [0.5 * (1 - rs)]); }
/* the step coordinate at each hedge: its row's place across the tread, as planned (within a contouring cell's error) */
{ const r = R[0], rows = [0.3, 0.56, 0.82].map(f => f * (1 - r.riser));
  let worst = 0; for (const p of H[0]) { const g = ground(p.x, p.z), F = (g - r.base - VTE.offAt(r, p.x, p.z, g)) / r.rise; worst = Math.max(worst, Math.abs(F - p.level - rows[p.row])); }
  T.ok('each hedge lies on its row across the tread (worst ' + worst.toFixed(3) + ' of a step)', worst < 0.05, ''); }
/* the rows stand apart: three rows to a tread, a step's rise apart in height */
{ const levels = new Set(H[0].map(p => p.level)), perLevel = [...levels].map(k => new Set(H[0].filter(p => p.level === k).map(p => p.row)).size);
  T.ok('three rows to a tread (' + levels.size + ' treads in the sample)', levels.size >= 5 && perLevel.every(n => n <= 3) && perLevel.filter(n => n === 3).length >= levels.size - 2, perLevel.join(',')); }

/* ---- deterministic */
{ const ref = JSON.stringify(VTE.hedges(R[2], ground, { box: BOX[2] }));
  const other = Object.assign({}, R[2], { seed: R[2].seed + 1 });
  T.neg('the same seed gives the same hedges; another seed moves them', r => JSON.stringify(VTE.hedges(r, ground, { box: BOX[2] })) === ref, other, R[2]); }

/* ---- the beds */
const B = VTE.beds();
const planned = VTE.PLACES.reduce((n, p) => n + p.beds, 0);
T.ok('every bed has a crop (' + B.length + ' beds)', B.length === planned && B.every(b => b.crop), B.filter(b => !b.crop).map(b => b.id).join(', '));
const rainFed = beds => beds.every(b => VTE.fits(b.ground, b.crop) === 'rain' || VTE.fits(b.ground, b.crop) === 'wild');
T.ok('every bed grows rain-fed on its ground (no irrigation)', rainFed(B), B.filter(b => !rainFed([b])).map(b => b.id + ' ' + b.crop + ' ' + b.how).join(', '));
T.neg('a dry-garden crop in the wet gardens is caught', beds => rainFed(beds), [{ ground: 'wet', crop: 'saffron' }], [{ ground: 'dry', crop: 'saffron' }]);
const shadeOk = beds => beds.every(b => VTE.SHADE.indexOf(b.crop) < 0 || b.shade);
T.ok('the shade crops (ginseng, moon caps, brackets) stand only in the shade', shadeOk(B), B.filter(b => !shadeOk([b])).map(b => b.id).join(', '));
T.neg('ginseng in an open bed is caught', beds => shadeOk(beds), [{ crop: 'valley-ginseng', shade: false }], [{ crop: 'valley-ginseng', shade: true }]);
T.ok('the dry garden grows the plan\'s ten (the Vale\'s whorl olive and silverscrub among them)', ['monks-sage', 'saffron', 'juniper', 'umbel-seed', 'bench-garlic', 'cave-madder', 'sky-poppy', 'peyote', 'whorl-olive-leaf', 'silverscrub'].every(c => B.some(b => b.place === 'dry-garden' && b.crop === c)),
  B.filter(b => b.place === 'dry-garden').map(b => b.crop).join(','));
/* the physic garden: eight beds of eight crops, the Vale's wild medicinal plants among them (the owner, question 5: "y";
   kits/crops/src/24-crop-vale-wild.js). Without that fragment the wet ground's open beds had three crops */
const distinct = (beds, place) => new Set(beds.filter(b => b.place === place).map(b => b.crop)).size;
T.ok('the physic garden grows eight crops (' + B.filter(b => b.place === 'physic').map(b => b.crop).join(', ') + ')', distinct(B, 'physic') === 8, '');
T.neg('a physic garden of three crops is caught', beds => distinct(beds, 'physic') >= 6,
  ['bell-pod', 'camphor', 'circlelichen', 'bell-pod'].map(c => ({ place: 'physic', crop: c })),
  ['ginkgo-leaf', 'frost-willow-bark', 'beard-moss', 'cloudpine-resin', 'bell-pod', 'camphor'].map(c => ({ place: 'physic', crop: c })));
T.ok('the beds are deterministic', JSON.stringify(VTE.beds()) === JSON.stringify(B), '');
console.log('  beds: ' + VTE.PLACES.map(p => p.id + ' [' + B.filter(b => b.place === p.id).map(b => b.crop).join(', ') + ']').join('; '));
T.done();
