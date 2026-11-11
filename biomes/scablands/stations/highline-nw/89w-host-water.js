// ================================================================= HOST - the rain pond on core/water (replaces the kit's 89w-host-water.js: no lake, no river here)
// The pond's record is the stage's (45-host-stage.js POND_W), its fields 86's. The sky in the water is a capture of this page's dome and giant, given to the
// water only. Natural ripples (ext/56).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6a6a4a)});}
const POND_DRAW=WATER.drawStill(POND_W,{color:lin(0x5a7a6a).getHex(),roughness:.08,metalness:.05,envMapIntensity:.4,renderOrder:1});
POND_DRAW.mesh.userData.inspectLabel=POND_W.name;
WATER.breakupAll();
