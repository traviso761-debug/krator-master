// node core/terrain/test-strata-arcflow.js: verifies KSTRATA 'arch-ophiolite' & 'klint-kukersite' recipes
'use strict';
const path = require('path');
const T = require(path.join(__dirname, '..', '..', 'tools', 'ktest.js'))(__filename);

require(path.join(__dirname, '..', 'rand', '08-core-rand.js'));
require(path.join(__dirname, '35-core-strata.js'));
require(path.join(__dirname, '35f-core-strata-arcflow.js'));

const K = globalThis.KSTRATA;

T.ok('arch-ophiolite and klint-kukersite register on KSTRATA.RECIPES',
  Boolean(K && K.RECIPES['arch-ophiolite'] && K.RECIPES['klint-kukersite'] && K.RECIPES['klint-foredeep']));
T.neg('unknown recipe throws while arch-ophiolite resolves', r => Boolean(K.recipe(r)), 'no-such-ophiolite', 'arch-ophiolite');

{
  const S = K.create({seed: 8101, recipe: 'arch-ophiolite', range: [-40, 260]});
  const L = K.load(S.export());
  const B = K.bake(S, {res: 0.5});
  const a = S.at(24, 58, -32);
  const b = L.at(24, 58, -32);
  T.ok('arch-ophiolite exports/loads bit-for-bit and bakes with sheen + chromitite iridescence',
    S.beds.length > 25 && B.fx.sheen === 1 && B.fx.joints === 1 && JSON.stringify(a) === JSON.stringify(b));

  const rec = K.recipe('arch-ophiolite');
  let repeatBad = false;
  let betweenBad = false;
  const seen = {};
  for (let i = 0; i < S.beds.length; i++) {
    seen[S.beds[i].kind] = (seen[S.beds[i].kind] || 0) + 1;
    if (i > 0 && S.beds[i].kind === S.beds[i - 1].kind) repeatBad = true;
    if (i > 0 && rec.kinds[S.beds[i].kind].between && rec.kinds[S.beds[i - 1].kind].between) betweenBad = true;
  }
  T.ok('arch-ophiolite enforces noRepeat, separates chrysotile/garnierite partings, and includes zebra cumulates',
    !repeatBad && !betweenBad && (seen.serpentinite || 0) > 0 && (seen.chromitite || 0) > 0 && (seen.anorthosite || 0) > 0);
}

{
  const S = K.create({
    seed: 8105,
    formations: [
      {recipe: 'klint-foredeep', base: 20, top: 95},
      {recipe: 'klint-kukersite', top: 145},
      {recipe: 'arch-ophiolite', top: 210}
    ],
    range: [20, 210]
  });
  const low = S.at(0, 48, 0);
  const cap = S.at(0, 175, 0);
  let recessed = 0;
  for (let h = 25; h < 140; h += 1.7) {
    if (Math.abs(S.ledge(0, 0, h, 0.85) - h) > 1e-4) recessed++;
  }
  T.ok('klint-kukersite / klint-foredeep soft glauconite & kukersite recess under hard basalt/ophiolite caprock',
    low.hard <= 0.40 && cap.hard >= 0.60 && recessed > 12);
}

T.done();
