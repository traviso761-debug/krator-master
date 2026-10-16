// TARGET: ag-hollow - an agent's work sheet for the trades round (2026-10-16): its buildings in one row (two rows past 6),
// front (+z) toward the camera; keys not yet defined are skipped. Temporary: removed when the round is merged.
const TITLE='Iziz Vernacular - ag-hollow';
VERN.interiors=typeof KratorInteriors!=='undefined'&&!/[?&]interiors=0\b/.test(location.search);
const GROUND_C=40;
const AG_KEYS=['vern_house_poor_a', 'vern_house_poor_b', 'vern_house_poor_c', 'vern_house_mid_a', 'vern_house_mid_b', 'vern_house_mid_c', 'vern_house_rich_a', 'vern_house_rich_b', 'vern_shops', 'vern_tavern', 'vern_workshop_a', 'vern_workshop_b', 'vern_warehouse', 'vern_caravanserai', 'vern_tank'];
const SITES=[];
{const keys=AG_KEYS.filter(k=>VERN.defs[k]);const rows=[keys.slice(0,6),keys.slice(6,12),keys.slice(12)].filter(r=>r.length);let z=0;
 rows.forEach(row=>{const ws=row.map(k=>VERN.defs[k].w+12);let x=-ws.reduce((a,b)=>a+b,0)/2;const dz=Math.max(...row.map(k=>VERN.defs[k].d));
  row.forEach((k,i)=>{SITES.push({key:k,x:x+ws[i]/2,z:z,ry:0,o:{v:0}});x+=ws[i];});z+=dz+24;});}
