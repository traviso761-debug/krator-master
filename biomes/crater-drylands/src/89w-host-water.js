// ================================================================= HOST - the seep on core/water
// core/water (core/water/README.md), 2026-10-25, migration phase 4: the seep's pool is one WATER.still (a 32-gon of the old disc's radius at SEEPL, dark
// green at the middle to a grey-green rim as a gradient). The page's own MAT_WATER and disc are gone (84-host-ground.js); SEEP and SEEPL stay in
// 45-host-stage.js and BIO.waterH is unchanged. The fire's flames and smoke (89-host-fire.js) are not water and are untouched.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x8a7a5a)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const SEEP_STILL=(function(){const poly=[],R=SEEP.r*1.35;for(let k=0;k<32;k++){const a=k/32*TAU;poly.push([SEEP.x+Math.cos(a)*R,SEEP.z+Math.sin(a)*R]);}
 const S=WATER.still({name:'The seep',level:SEEPL,poly,gradient:{centre:lin(0x2e5a4a).getHex(),rim:lin(0x6a8a6a).getHex(),power:1}});
 WATER.drawStill(S,{roughness:.06,metalness:.1,envMapIntensity:.4,renderOrder:1,pick:true});return S;})();
window._water={seep:!!SEEP_STILL};
