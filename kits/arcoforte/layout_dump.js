/* Dump ARCOFORTE layout, interior plans, area summary, and rule checks as JSON for arcoforte_blueprint.py */
'use strict';
const fs = require('fs');
const path = require('path');
const HERE = __dirname;
const ROOT = path.resolve(HERE, '..', '..');

const code = [
  path.join(ROOT, 'core/rand/08-core-rand.js'),
  path.join(ROOT, 'kits/interiors/dist/interiors-core.js'),
  path.join(ROOT, 'kits/ancients-interiors/dist/ancients-interiors-core.js'),
  path.join(HERE, 'src/30-af-plan.js'),
  path.join(HERE, 'src/31-af-interiors.js'),
  path.join(HERE, 'src/32-af-rules.js')
].map(p => fs.readFileSync(p, 'utf8')).join(';\n');

(0, eval)(code + ';\nglobal._OUT=[KratorInteriors,KratorAncientsInteriors,ARCOFORTE,AF_INT,AF_RULES];');
const [IX, AI, ARCOFORTE, AF_INT, AF_RULES] = global._OUT;
AI.IX = IX; AI.install(IX);

const P = ARCOFORTE.plan({ seed: 14800, state: 'refurbished' });
const B = AF_INT.buildPlans(AI, 'refurbished', P);
const area = AF_INT.areaSummary(P, B);
const checks = AF_RULES.checks(P, B);
process.stdout.write(JSON.stringify({ layout: P, interiors: B, area: area, checks: checks }));
