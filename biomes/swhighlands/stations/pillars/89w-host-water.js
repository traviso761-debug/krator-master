// ================================================================= HOST — the water drawn (station 4, the pillar rim)
// Pan Riba across the floor (core/water: its WATER.flow record in 45-host-stage.js), a ribbon in the river's colours; the sky in
// the water from core/atmos's skylight, as station 1's
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x2c3a2c),key:()=>LIGHT_MODE});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const FLOW_DRAWS=FLOWS.map(F=>{const D=WATER.drawFlow(F,{rapids:[.02,.14],shallow:lin(0x6a9a86),deep:lin(0x1e4a42),color:0xffffff,roughness:.2,metalness:.05,
 envMapIntensity:.35,step:10,across:6,margin:1.2,chute:.5,rain:true,renderOrder:2});D.mesh.userData.probeSkip=true;D.mesh.userData.inspectLabel=F.name;return D;});
