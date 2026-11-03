// ================================================================= HOST — the lakes, the river and the falls on core/water
// The rim's lakes are its feature (PLAN.md section 1, "a staircase of lakes"): each still drawn by its kind (section 3, "The lakes' colours"):
//   deep     the great lake: dark blue under the cliff, green-blue over the plain's shallows (a gradient by depth)
//   glacial  the S rim's higher lakes and the W tarns: milky turquoise from rock flour (core/water ext/54's `proglacial` look)
//   algal    the N rim's montane lakes: teal over the mats (the algal domes and the lakebed's own layer, 45 and 60, show through)
//   peat     tea-dark water edged with bog
//   frozen   the 4,477 m lake and the tarns: ice most of the year (WATER.ice: black ice cracked in big polygons, snow drifts), melting at the edge
// No breakers on a still (the owner, 2026-11-02: BACKPORT.md's universal set). The river is core/water's ribbon; each fall a tall fall (its
// churn sized to its plunge pool, its curtain white to the foot). Glints broken up (ext/56), rain rings on them all (the weather's wet ground).
// THE REFLECTIONS SWITCH (ext/58) on the largest still, off at page load (99-host-take.js).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x5a5a4a)});}
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
const LAKE_LOOK={deep:{deep:0x163a54,shallow:0x2e6e70},glacial:{deep:0x1a6a78,shallow:0x6ac0c0},algal:{deep:0x1e5a5a,shallow:0x3a8a7e},peat:{deep:0x2a2016,shallow:0x5a4a2e},frozen:{deep:0x2a4a5a,shallow:0x8ab0c0}};
const RIVER_DRAW=RIVER?WATER.drawFlow(RIVER,{shallow:lin(LAND.riverLook?LAND.riverLook[0]:0x5a9ea8),deep:lin(LAND.riverLook?LAND.riverLook[1]:0x3a7480),
 color:0xffffff,roughness:.1,metalness:.05,envMapIntensity:.6,step:20,across:4,margin:1.5,renderOrder:1}):null;
if(RIVER_DRAW){RIVER_DRAW.mesh.userData.probeSkip=true;RIVER_DRAW.mesh.userData.inspectLabel=RIVER.name||'The river';}
const LAKE_DRAWS=LAKE_STILLS.map((S,i)=>{const L=LAKES[i],lk=Object.assign({},LAKE_LOOK[L.kind]||LAKE_LOOK.deep,(LAND.lakeLook&&i===0)?{deep:LAND.lakeLook.deep[0],shallow:LAND.lakeLook.shallow}:{});
 const d=WATER.drawStill(S,{color:lin(L.colour==null?lk.deep:L.colour),roughness:L.kind==='glacial'?.18:.08,metalness:.05,envMapIntensity:L.kind==='peat'?.25:.45,
  surf:false,breakers:false,renderOrder:1});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=L.name+' ('+L.kind+')';return d;});
// a frozen lake: the ice over the still, its rim melting (W.ice; ext/54b draws it)
const ICE_DRAWS=LAKES.map((L,i)=>{if(L.kind!=='frozen'||!WATER.ice||!WATER.drawIce)return null;try{const I=WATER.ice({name:L.name+' (ice)',poly:L.poly,level:L.level,seed:7300+i,
  drifts:{wind:Math.atan2((LAND.wind||[1,0])[1],(LAND.wind||[1,0])[0]),spacing:14,chance:.5,len:[10,24],wid:[3,6],depth:[.15,.4]},cracks:{cell:22,width:.04}});const D=WATER.drawIce(I,{THREE,scene,lift:.06});return{I,D};}catch(e){reportErr('ice: '+e.stack);return null;}});
const FALL_DRAWS=FALL_RECS.map((F,i)=>{const o=FALLS[i];const d=WATER.drawFall(F,{color:lin(0xdce8e6),opacity:.9,rowStep:3,cols:12,spray:'drop',plungeR:o.plungeR==null?20:o.plungeR,footK:.8,envMapIntensity:.25,renderOrder:3,pick:true});
 d.mesh.userData.inspectLabel=o.name||'A fall';if(d.plunge)d.plunge.userData.inspectLabel=(o.name||'A fall')+' (plunge pool)';return d;});
const BIG_DRAW=BIG_LAKE?LAKE_DRAWS[LAKES.indexOf(BIG_LAKE)]:null;
{const WQ=new URLSearchParams(location.search);if(WQ.get('breakup')!=='0'&&WATER.breakupAll){WATER.breakupAll();if(RIVER)WATER.breakupFlows();}}
window._water={lakes:LAKES.map(L=>L.name+' '+L.kind+' '+L.level),river:!!RIVER,falls:FALLS.length,ice:ICE_DRAWS.filter(Boolean).length};
