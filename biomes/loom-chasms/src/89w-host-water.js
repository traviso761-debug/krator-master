// ================================================================= HOST — the water on core/water (the Great Chasm's, with riftrim's river added back)
// The Loom's page has none within 12 km. The Cradle's: Aina Bruk, a perennial river from its spring (RIVER_SPEC: a WATER.flow, drawn as
// core/water's ribbon), and the spring's pool (a still, the `spring` look's colours). What follows from here is the Great Chasm's text:
// No lake, river, lava tube or vent lies inside the chasm's polygon on the model; the trough is closed and dry. The one water on these pages is
// what people brought: the trade post's cistern (station 1; Yuni-built, fed by a qanat: PLAN.md section 5), a still under its own level. A
// station with no still draws nothing here; the fields path (89z: WATER.fields) reads the surfaces there are, none being a real answer. If the
// owner puts a pan in the Deep (PLAN.md section 9) it is a still with core/water's `brine` look (W.LOOKS), added here.
{const env=new THREE.Scene();
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:{environment:null},ground:()=>new THREE.Color(0x6a5a4a)});}
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
const LAKE_LOOK={cistern:{deep:0x1e3a3a,shallow:0x3a6a62},brine:{deep:0x6a7a6a,shallow:0xb8c0a8},spring:{deep:0x1e4a52,shallow:0x5aa0a0}};
const LAKE_DRAWS=LAKE_STILLS.map((S,i)=>{const L=LAKES[i],lk=LAKE_LOOK[L.kind]||LAKE_LOOK.cistern;
 const d=WATER.drawStill(S,{color:lin(L.colour==null?lk.deep:L.colour),roughness:.06,metalness:.05,envMapIntensity:.35,surf:false,breakers:false,renderOrder:1});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=L.name;return d;});
const BIG_DRAW=BIG_LAKE?LAKE_DRAWS[LAKES.indexOf(BIG_LAKE)]:null;
const RIVER_DRAW=RIVER?WATER.drawFlow(RIVER,{shallow:lin(LAND.riverLook?LAND.riverLook[0]:0x6aa0a0),deep:lin(LAND.riverLook?LAND.riverLook[1]:0x2e6468),
 color:0xffffff,roughness:.1,metalness:.05,envMapIntensity:.5,step:12,across:4,margin:1.5,renderOrder:1}):null;
if(RIVER_DRAW){RIVER_DRAW.mesh.userData.probeSkip=true;RIVER_DRAW.mesh.userData.inspectLabel=RIVER.name||'The river';}
const CANAL_DRAWS=CANALS.map(C=>{const d=WATER.drawFlow(C,{shallow:lin(0x7aa8a0),deep:lin(0x3a6a64),color:0xffffff,roughness:.12,metalness:.05,envMapIntensity:.45,step:6,across:2,margin:.4,renderOrder:1});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=C.name||'A canal';return d;});
{const WQ=new URLSearchParams(location.search);if(WQ.get('breakup')!=='0'&&WATER.breakupAll&&(LAKES.length||RIVER||CANALS.length)){WATER.breakupAll();if((RIVER||CANALS.length)&&WATER.breakupFlows)WATER.breakupFlows();}}
window._water={stills:LAKES.map(L=>L.name+' '+L.kind+' '+L.level),river:!!RIVER,canals:CANALS.length};
