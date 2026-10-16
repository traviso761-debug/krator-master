// TARGET: ag-craft - an agent's work sheet for the trades round (2026-10-16): its buildings in one row (two rows past 6),
// front (+z) toward the camera; keys not yet defined are skipped. Temporary: removed when the round is merged.
const TITLE='Iziz Vernacular - ag-craft';
VERN.interiors=typeof KratorInteriors!=='undefined'&&!/[?&]interiors=0\b/.test(location.search);
const GROUND_C=40;
const AG_KEYS=['vern_apothecary', 'vern_tinker', 'vern_glassworks', 'vern_salvage_yard'];
const SITES=[];
{const keys=AG_KEYS.filter(k=>VERN.defs[k]);const rows=[keys.slice(0,6),keys.slice(6,12),keys.slice(12)].filter(r=>r.length);let z=0;
 rows.forEach(row=>{const ws=row.map(k=>VERN.defs[k].w+12);let x=-ws.reduce((a,b)=>a+b,0)/2;const dz=Math.max(...row.map(k=>VERN.defs[k].d));
  row.forEach((k,i)=>{SITES.push({key:k,x:x+ws[i]/2,z:z,ry:0,o:{v:0}});x+=ws[i];});z+=dz+24;});}
