// ================================================================= HOST - the water on core/water (every station)
//   THE TARN   a WATER.open at the tarn's level (the model's wl) over every ground under it in the model's basin, with a shore grid (4 m) flooded from
//              the site's seed in the water; still (no surf, no breakers: the owner's rule), warm: green-teal in the shallows, the springs' run-off
//              entering as a paler plume where the sinter steps meet it (core/water ext/61: a tint on a slow current; ?plume=0 without it)
//   THE RIVER  a Warra (stations 2 and 3): a WATER.flow on its graded line (45: it never climbs), white where the bed steepens
// The springs, pools, mud pots and geysers are the geyser kit's show (65, through core/water's geyser kinds). The reflections switch (99) serves the
// tarn; off at page load.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6a6a5e)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const STILLS=[];
const TARN_DRAW=SITE.tarn?(function(){const R=TERR.R*1.1,box=[-R,-R,R,R],seed=SITE.tarn.seed,q=new URLSearchParams(location.search);
 /* the steps' foot: where the springs' warm water enters the tarn (a slow plume of paler, warmer water) */
 const mouth=SITE.steps?SITE.steps.b:null;
 const plume=mouth&&q.get('plume')!=='0'?{tint:{box,cell:8,at:(x,z)=>{const d=Math.hypot(x-mouth[0],z-mouth[1]);return d>360?null:{c:lin(0x9ad0b8),a:.45*smooth(360,20,d)};}},
  tintFlow:{v:(x,z)=>{const dx=x-mouth[0],dz=z-mouth[1],d=Math.hypot(dx,dz)||1;return[dx/d*.05*smooth(420,0,d),dz/d*.05*smooth(420,0,d)];},cell:8,period:60,swirl:.06,scale:90}}:{};
 const W=WATER.open(Object.assign({name:SITE.tarn.name,level:LEVEL,field:.1,bounds:box,bed:terrainH,bedBox:box,shore:{cell:4,band:40,seeds:[seed],land:(x,z)=>!inBasin(x,z)}},plume));   /* inBasin keeps the tarn out of a river's cut (47) */
 const D=WATER.draw(W,{renderOrder:1,roughness:.1,metalness:.05,envMapIntensity:.45,surf:false,breakers:false,pick:true,   /* still water (HANDOFF-REBUILD.md, 'Still water takes no breakers') */
  shallow:lin(dv(SITE.tarn.shallow,0x58a49a)),deep:lin(dv(SITE.tarn.deep,0x1c5e6a))});
 D.mesh.userData.inspectLabel=SITE.tarn.name;D.mesh.userData.probeSkip=true;STILLS.push({mat:D.mesh.material,level:LEVEL,center:seed,radius:2200,far:4000});return D;})():null;
const RIVER_DRAW=RIVER&&RIVER.pts.length>=3?(function(){const F=WATER.flow({name:RIVER.name,pts:RIVER.pts,width:RIVER.pts.map(()=>2*RIVER.hw),speed:1.6});
 const d=WATER.drawFlow(F,{rapids:[.008,.03],shallow:lin(0x7a9a90),deep:lin(0x3e6a6a),color:0xffffff,roughness:.3,metalness:.05,envMapIntensity:.35,step:8,across:3,margin:2.4,renderOrder:1});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=RIVER.name;return d;})():null;
window._water={tarn:!!TARN_DRAW,river:!!RIVER_DRAW};
