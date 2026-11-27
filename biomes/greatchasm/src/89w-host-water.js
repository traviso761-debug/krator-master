// ================================================================= HOST — the water on core/water: almost none (PLAN.md section 1, "Water: none")
// No lake, river, lava tube or vent lies inside the chasm's polygon on the model; the trough is closed and dry. The one water on these pages is
// what people brought: the trade post's cistern (station 1; Yuni-built, fed by a qanat: PLAN.md section 5), a still under its own level. A
// station with no still draws nothing here; the fields path (89z: WATER.fields) reads the surfaces there are, none being a real answer. If the
// owner puts a pan in the Deep (PLAN.md section 9) it is a still with core/water's `brine` look (W.LOOKS), added here.
{const env=new THREE.Scene();
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:{environment:null},ground:()=>new THREE.Color(0x6a5a4a)});}
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
const LAKE_LOOK={cistern:{deep:0x1e3a3a,shallow:0x3a6a62},brine:{deep:0x6a7a6a,shallow:0xb8c0a8}};
const LAKE_DRAWS=LAKE_STILLS.map((S,i)=>{const L=LAKES[i],lk=LAKE_LOOK[L.kind]||LAKE_LOOK.cistern;
 const d=WATER.drawStill(S,{color:lin(L.colour==null?lk.deep:L.colour),roughness:.06,metalness:.05,envMapIntensity:.35,surf:false,breakers:false,renderOrder:1});
 d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=L.name;return d;});
const BIG_DRAW=BIG_LAKE?LAKE_DRAWS[LAKES.indexOf(BIG_LAKE)]:null,RIVER_DRAW=null;
{const WQ=new URLSearchParams(location.search);if(WQ.get('breakup')!=='0'&&WATER.breakupAll&&LAKES.length)WATER.breakupAll();}
window._water={stills:LAKES.map(L=>L.name+' '+L.kind+' '+L.level)};
