// ================================================================= HOST - the brook on core/water
// core/water Phase 3 (core/water/README.md), 2026-10-20: the brook (BROOK, the flow line made in 45-host-stage.js) is drawn here as
// core/water's ribbon: its ripples carried down the current, white where the bed steepens and along the banks, the sky in it from
// core/atmos's skylight (a capture of this page's dome and giant, given to the water only: WENV, so the page's own materials keep
// their lighting). Its twins: WATER.heightAt, WATER.flowAt; core/export carries it to Godot. BIO.waterH (45) is unchanged.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x3d3a26)});}
const BROOK_DRAW=WATER.drawFlow(BROOK,{shallow:new THREE.Color(0x4a8068).convertSRGBToLinear(),deep:new THREE.Color(0x2a5a4a).convertSRGBToLinear(),color:0xffffff,roughness:.2,metalness:.1,envMapIntensity:.35,step:40,across:4,margin:1});
BROOK_DRAW.mesh.userData.probeSkip=true;BROOK_DRAW.mesh.userData.inspectLabel='The brook';
