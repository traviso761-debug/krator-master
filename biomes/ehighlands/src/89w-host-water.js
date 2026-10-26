// ================================================================= HOST - the stream, the bog pools and the tarn's water on core/water
// core/water (core/water/README.md), 2026-10-25, migration phase 4. The records stay in 45-host-stage.js (SPTS the stream's line, STREAMW,
// POOLS, TARN and TARNL); the drawing is here, after 89a-host-atmos.js has bound core/atmos. The stream is two WATER.flow ribbons (the
// reach into the tarn and the reach out of it; the tarn's water is the still between), its surface the level waterH gives, only ever
// falling; the 34 bog pools are WATER.still, all in ONE mesh (drawPools); the tarn's open water (seen in the lead where the stream comes
// in) is a WATER.still with a gradient. THE ICE ON THE TARN STAYS THE PAGE'S OWN SHADER (MAT_ICE in 84-host-ground.js): core/water has
// no ice kind. The sky in the water is a capture of this page's dome and giant, given to the water only. waterH, terrainH unchanged.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6a5a44)});}
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
const circ=(x,z,r,n)=>{const p=[];for(let k=0;k<n;k++){const a=k/n*TAU;p.push([x+Math.cos(a)*r,z+Math.sin(a)*r]);}return p;};
// ---- the tarn's water (under the ice)
const TARN_STILL=WATER.still({name:'The tarn (its water)',level:TARNL,poly:circ(TARN.x,TARN.z,TARN.r*1.3,64),
 gradient:{centre:lin(0x0c1a2a).getHex(),rim:lin(0x223040).getHex(),power:1.2}});
const TARN_DRAW=WATER.drawStill(TARN_STILL,{roughness:.08,metalness:.08,envMapIntensity:.4,renderOrder:1,pick:true});
TARN_DRAW.mesh.userData.inspectLabel='The tarn';
// ---- the bog's pools: black-blue, a little peat at the rim
const BOG_STILLS=POOLS.map((P,i)=>WATER.still({name:'A bog pool '+(i+1),level:P.y,poly:circ(P.x,P.z,P.r*1.2,16),
 gradient:{centre:lin(0x0e1e30).getHex(),rim:lin(0x2a3a30).getHex(),power:1.3}}));
const BOG_DRAW=BOG_STILLS.length?WATER.drawPools(BOG_STILLS,{color:0xffffff,roughness:.07,metalness:.05,envMapIntensity:.35,renderOrder:1,pick:true,name:'Bog pools'}):null;
if(BOG_DRAW)BOG_DRAW.mesh.userData.inspectLabel='A bog pool';
// ---- the stream: waterH along SPTS every 5 m, split where it enters the tarn and where it leaves
const STREAM_FLOWS=(function(){const runs=[[]];let y=1e9;
 for(let i=0;i<SPTS.length-1;i++){const a=SPTS[i],b=SPTS[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),m=Math.max(1,Math.ceil(L/6));
  for(let k=(i?1:0);k<=m;k++){const t=k/m,x=mix(a[0],b[0],t),z=mix(a[1],b[1],t);
   if(Math.hypot(x-TARN.x,z-TARN.z)<TARN.r*1.25){if(runs[runs.length-1].length)runs.push([]);continue;}
   const w=waterH(x,z),h=w>-1e8?w:terrainH(x,z)+.2;y=Math.min(y,h);runs[runs.length-1].push([x,z,y]);}}
 return runs.filter(r=>r.length>2).map((pts,i)=>{const F=WATER.flow({name:'The stream '+(i+1),pts,width:STREAMW*2+1,speed:1.2,rapids:[.03,.15]});
  const D=WATER.drawFlow(F,{shallow:lin(0x2a4a58),deep:lin(0x14283a),color:0xffffff,roughness:.1,metalness:.05,envMapIntensity:.5,step:8,across:5,margin:1.2,depthBias:1.5,renderOrder:2,pick:true});
  D.mesh.userData.inspectLabel='The stream';return{F,D};});})();
window._water={tarn:!!TARN_DRAW,pools:BOG_STILLS.length,streams:STREAM_FLOWS.length};
