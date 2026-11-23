// TARGET: sheet — the Painted Men (Kweentx) kit's own sheet (build.py; laid out by kits/iziz-vernacular/src/90-vsheet-scene.js),
// front (+z) toward the camera: Tlingit / Pacific-NW painted plank-houses, bamboo stilt huts, arched longhouses, sacred stone
// circles, farms, salvage roundhouses, and the cantilevered cliff settlement.
const PM_BRANCHES=['tribal'];
const SHEET={title:'Painted Men Building Kit',build:'painted-men',ground:'meadow',groundRepeat:400,haze:.0005,
 owns:k=>!!(VERN.defs[k]&&VERN.defs[k].branch==='tribal'),branches:{tribal:'Painted Men'},
 panes:['vWinClear','vWinLit'],
 budget:{showcase:{tris:2200000,calls:320}},
 rows:[]};
for(const b of PM_BRANCHES)HL.families(b).forEach((F,i,a)=>SHEET.rows.push({family:F.family,branch:b,keys:F.keys,gapAfter:i===a.length-1?40:0}));
