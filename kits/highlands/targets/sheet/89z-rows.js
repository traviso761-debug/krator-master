/* TARGET: sheet — the Highlands kit's own sheet (build.py; laid out by kits/iziz-vernacular/src/90-vsheet-scene.js), front
   (+z) toward the camera: the Republican and Slavic/Carpathian Rustic sets (Painted Men moved to kits/painted-men), one row per
   family in architectural progression. Bodies are solid, every door locked; catalog furniture (89y-hl-furnish.js, FURNISH
   through core/furnish) is placed where a builder asks for a piece. */
const HL_BRANCHES=['republican','rustic'];
const HL_RUSTIC_ROW_ORDER=[
 'Dwellings',
 'Baronial and clan burgh',
 'Temple and hall',
 'Civic and sacred',
 'Walls and garrison',
 'Trade and crafts',
 'Food and hospitality',
 'Crafts and works',
 'Farms and mills',
 'Orchards and dairies',
 'Lake and riverfront',
 'Salvage'
];
const SHEET={title:'Highlands Building Kit',build:'highlands',ground:'meadow',groundRepeat:400,haze:.0005,
 owns:k=>VERN.defs[k]&&(VERN.defs[k].branch==='republican'||VERN.defs[k].branch==='rustic'),branches:{republican:'Republican',rustic:'Rustic'},
 panes:['vWinClear','vWinLit','hStainedB','hFrostedB','hKeelGlass','hArchGlass'],
 budget:{showcase:{tris:5200000,calls:480}},
 rows:[]};
for(const b of HL_BRANCHES){
 const fams=HL.families(b);
 if(b==='rustic'){
  const rank=f=>{const i=HL_RUSTIC_ROW_ORDER.indexOf(f);return i<0?999:i;};
  fams.sort((a,c)=>rank(a.family)-rank(c.family));}
 fams.forEach((F,i,a)=>SHEET.rows.push({family:F.family,branch:b,keys:F.keys,gapAfter:i===a.length-1?40:0}));}
