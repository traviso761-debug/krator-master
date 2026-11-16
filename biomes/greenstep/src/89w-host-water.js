// ================================================================= HOST — the plunge basins, the rivers and the falls on core/water (riftrim's, 2026-11-09)
// Greenstep's water (PLAN.md section 2.2): the Clodosriba and the Western Rille's stream as core/water ribbons, each riser's leap a tall
// curtain fall (its churn sized to its plunge pool, its curtain white to the foot), and the plunge basins under them as stills:
//   deep     the basins: turquoise-black over the basalt (a gradient by depth)
// No breakers on a still (BACKPORT.md's universal set). Glints broken up (ext/56), rain rings on them all (the weather's wet ground).
// THE REFLECTIONS SWITCH (ext/58) on the largest still, off at page load (99-host-take.js).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x5a5a4a)});}
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
const LAKE_LOOK={deep:{deep:0x0e2a2c,shallow:0x2a6a64},glacial:{deep:0x1a6a78,shallow:0x6ac0c0},algal:{deep:0x1e5a5a,shallow:0x3a8a7e},peat:{deep:0x2a2016,shallow:0x5a4a2e},frozen:{deep:0x2a4a5a,shallow:0x8ab0c0}};
const RIVER_DRAWS=RIVERS.map((RV,i)=>{const d=WATER.drawFlow(RV,{shallow:lin(LAND.riverLook?LAND.riverLook[0]:0x5a9ea8),deep:lin(LAND.riverLook?LAND.riverLook[1]:0x3a7480),
 color:0xffffff,roughness:.1,metalness:.05,envMapIntensity:.6,step:20,across:4,margin:1.5,renderOrder:1});d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=RV.name||'The river';return d;});
const RIVER_DRAW=RIVER_DRAWS[0]||null;
const LAKE_DRAWS=LAKE_STILLS.map((S,i)=>{const L=LAKES[i],lk=Object.assign({},LAKE_LOOK[L.kind]||LAKE_LOOK.deep,(LAND.lakeLook&&i===0)?{deep:LAND.lakeLook.deep[0],shallow:LAND.lakeLook.shallow}:{});
 const d=WATER.drawStill(S,{color:lin(L.colour==null?lk.deep:L.colour),roughness:L.kind==='glacial'?.18:.08,metalness:.05,envMapIntensity:L.kind==='peat'?.25:.45,
  surf:false,breakers:false,renderOrder:1});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=L.name+' ('+L.kind+')';return d;});
const FALL_DRAWS=FALL_RECS.map((F,i)=>{const o=FALLS[i];const d=WATER.drawFall(F,{color:lin(0xdce8e6),opacity:.9,rowStep:3,cols:12,spray:'drop',plungeR:o.plungeR==null?20:o.plungeR,footK:.8,envMapIntensity:.25,renderOrder:3,pick:true});
 d.mesh.userData.inspectLabel=o.name||'A fall';if(d.plunge)d.plunge.userData.inspectLabel=(o.name||'A fall')+' (plunge pool)';return d;});
const BIG_DRAW=BIG_LAKE?LAKE_DRAWS[LAKES.indexOf(BIG_LAKE)]:null;
{const WQ=new URLSearchParams(location.search);if(WQ.get('breakup')!=='0'&&WATER.breakupAll){WATER.breakupAll();if(RIVERS.length)WATER.breakupFlows();}}
window._water={lakes:LAKES.map(L=>L.name+' '+L.kind+' '+L.level),rivers:RIVERS.map(R=>R.name),falls:FALLS.length};
