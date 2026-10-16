// TARGET: ag-land - an agent's work sheet for the trades round (2026-10-16): its buildings in one row (two rows past 6),
// front (+z) toward the camera; keys not yet defined are skipped. Temporary: removed when the round is merged.
const TITLE='Iziz Vernacular - ag-land';
VERN.interiors=typeof KratorInteriors!=='undefined'&&!/[?&]interiors=0\b/.test(location.search);
const GROUND_C=40;
const AG_KEYS=['vern_farmhouse', 'vern_byre', 'vern_pens', 'vern_boatyard', 'vern_fish_landing'];
const SITES=[];
{const keys=AG_KEYS.filter(k=>VERN.defs[k]);const rows=[keys.slice(0,6),keys.slice(6,12),keys.slice(12)].filter(r=>r.length);let z=0;
 rows.forEach(row=>{const ws=row.map(k=>VERN.defs[k].w+12);let x=-ws.reduce((a,b)=>a+b,0)/2;const dz=Math.max(...row.map(k=>VERN.defs[k].d));
  row.forEach((k,i)=>{SITES.push({key:k,x:x+ws[i]/2,z:z,ry:0,o:{v:0}});x+=ws[i];});z+=dz+24;});}
// ag-land stop-gap (2026-10-16): build.py's TARGET_CORE gives core/furnish to 'vernacular' only, and 95i calls
// KFURN.linearColours. Until the ag-* sheets take core/furnish, this supplies that one step (the same sRGB-byte to linear
// conversion as core/furnish/52-core-furnish-draw.js). Not a declaration: a page that has KFURN keeps its own.
if(typeof KFURN==='undefined'){const _L=new Float32Array(256);for(let i=0;i<256;i++){const c=i/255;_L[i]=c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);}
 window.KFURN={linearColours(geo){const a=geo.getAttribute('color');if(!a||a.array instanceof Float32Array)return;const s=a.array,o=new Float32Array(s.length);
  for(let i=0;i<s.length;i++)o[i]=_L[s[i]];geo.setAttribute('color',new THREE.BufferAttribute(o,a.itemSize||3));}};}
