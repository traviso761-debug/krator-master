// TARGET: sheet — the Xanadu kit's own sheet (build.py; laid out by kits/iziz-vernacular/src/90-vsheet-scene.js), front (+z)
// toward the camera: a row per family in definition order (XA.families), every def at every variant, v0 first, as Xanadu's
// `xanadu` target laid them out (settlements/xanadu/src/90-scene.js xaLayout with XA_VARIANTS). The bodies are solid, every door
// locked. Not here (Xanadu's page has them): the Vale of Xanadu biome's plants (86b-xa-plants.js falls back to the kit's own
// shapes) and core/water's still water on the pools (Xanadu's targets/xanadu/90-xa-still.js: MAT.xWater draws them here). A
// ?interiors=1 mode can be added once the kit's interiors land (kits/interiors/sets/xanadu.js): the sheet takes core/walk and
// core/door's host already.
const SHEET={title:'Xanadu Building Kit',build:'xanadu',ground:'xMeadow',groundRepeat:400,haze:.00042,exposure:1.05,spreadAll:true,
 owns:k=>VERN.defs[k].kit==='xanadu',
 panes:['vWinClear','vWinLit','xStainedB','xFrostedB','xGlass'],
 budget:{showcase:{tris:6000000,calls:600}},   // every variant of everything: Xanadu's sheet's budget
 rows:XA.families().map(F=>({family:F.family,keys:[].concat(...F.keys.map(k=>{const n=VERN.defs[k].nv||3,out=[];for(let v=0;v<n;v++)out.push({key:k,o:{v}});return out;}))}))};
