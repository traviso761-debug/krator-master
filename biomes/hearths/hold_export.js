// node biomes/hearths/hold_export.js [--cave]   the Cave of Crystals' hold massing as JSON on stdout (PLAN.md section 18)
// Runs the station's data fragments (stations/crystals/44z-host-site.js, 48-hearths-hold.js: [G data]) on the core in node, as the page does, and
// prints CAVE.HOLD.export(): every reserved volume (chambers, shelves, galleries, passages, approaches) with its shape, floor, headroom, area,
// volume and temperature, for the settlement kit and Godot. --cave prints the whole CAVE.export() (the KKARST crop, the KCAVERN plan, the
// KSPELEO records, the KTHERM field, the hazards) instead. The same records the page draws: the fragments are read, not copied.
'use strict';
const fs=require('fs'),path=require('path');
global.window=global;
const ROOT=path.join(__dirname,'..','..'),ST=path.join(__dirname,'stations','crystals');
const src=['core/rand/08-core-rand.js','core/space/20-core-space.js','core/terrain/39-core-cavern.js','core/terrain/39b-core-speleo.js',
 'core/terrain/39c-core-karst.js','core/terrain/47-core-therm.js'].map(f=>fs.readFileSync(path.join(ROOT,f),'utf8'))
 .concat(['44z-host-site.js','48-hearths-hold.js'].map(f=>fs.readFileSync(path.join(ST,f),'utf8')));
/* one script, as the page has it: the fragments' top-level consts are seen by the ones after them */
const run=new Function(src.join('\n;\n')+'\n;return CAVE;');
const CAVE=run();
process.stdout.write(JSON.stringify(process.argv.includes('--cave')?CAVE.export():CAVE.HOLD.export(),null,1)+'\n');
