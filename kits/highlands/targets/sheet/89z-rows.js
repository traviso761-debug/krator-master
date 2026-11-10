// TARGET: sheet — the Highlands kit's own sheet (build.py; laid out by kits/iziz-vernacular/src/90-vsheet-scene.js), front
// (+z) toward the camera: the Republican, Rustic and Tribal sets, a row per family in definition order (HL.families), as
// Highlands' `highlands` target laid them out (settlements/highlands/src/90-scene.js hlLayout). The bodies are solid, every door
// locked; the catalog furniture (89y-hl-furnish.js, FURNISH through core/furnish) is placed where a builder asks for a piece.
// A ?interiors=1 mode (Highlands' page has one: hollow bodies, furnished rooms, the doors that open onto them unlocked) can be
// added here once the kit's interiors land (kits/interiors/sets/highlands.js): the sheet already takes core/walk and core/door's host.
const HL_BRANCHES=['republican','rustic','tribal'];
const SHEET={title:'Highlands Building Kit',build:'highlands',ground:'meadow',groundRepeat:400,haze:.0005,
 owns:k=>!!HL.branches[VERN.defs[k].branch],branches:HL.branches,
 panes:['vWinClear','vWinLit','hStainedB','hFrostedB','hKeelGlass','hArchGlass'],
 budget:{showcase:{tris:4500000,calls:450}},   // as Highlands' sheet (round 7c)
 rows:[]};
for(const b of HL_BRANCHES)HL.families(b).forEach((F,i,a)=>SHEET.rows.push({family:F.family,branch:b,keys:F.keys,gapAfter:i===a.length-1?40:0}));
