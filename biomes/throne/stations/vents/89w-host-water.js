// ================================================================= HOST - the sulphur marsh's water on core/water (vent country)
// 2026-10-26 (the water migration, the last stations). Before: rings of the page's own ShaderMaterial (MAT_WATER, 86) from milky green-grey
// in the middle to sulphur yellow at the bank. Now a WATER.still over the marsh's ellipse (a 64-gon just past its rim, under the bank) at
// MARSH.level, the same colours as its gradient (0x8aa890 in the middle to 0xb4b878 at the rim, at 60% brightness: the old rings were unlit, the still
// surface takes the page's light; the gradient is round, its radius the ellipse's mean, so the
// long ends hold the rim's yellow a little longer and the short sides reach 70% of it), core/water's ripple and the sky in it
// (core/atmos's skylight: this dome and the giant, given to the water only). The hot pools are WATER.spring (86). The mud pots are mud,
// not water: they stay the page's own (86). waterH (47) is unchanged.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();g.position.copy(giantDir).multiplyScalar(GIANT_DIST);env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x4a4a3a),key:()=>LIGHT_MODE});}
const MARSH_POLY=[];for(let k=0;k<64;k++){const a=k/64*TAU;MARSH_POLY.push(upAt(MARSH.u+Math.cos(a)*MARSH.ru*1.01,MARSH.p+Math.sin(a)*MARSH.rp*1.01));}
const MARSH_WATER=WATER.still({name:'The sulphur marsh\'s acid water',level:MARSH.level,poly:MARSH_POLY,gradient:{centre:0x536556,rim:0x6c6e48,at:[MARSH.x,MARSH.z],radius:(MARSH.ru+MARSH.rp)*.505}});
const MARSH_DRAW=WATER.drawStill(MARSH_WATER,{roughness:.35,metalness:.05,envMapIntensity:.15,renderOrder:1});
MARSH_DRAW.mesh.userData.probeSkip=true;MARSH_DRAW.mesh.userData.inspectLabel=MARSH_WATER.name;
// the reflections switch (core/water/ext/58; 89zz-host-core.js installs it, off at page load): the marsh is the page's largest still
const MIRROR_STILL={materials:[MARSH_DRAW.mesh.material],level:MARSH.level,center:[MARSH.x,MARSH.z],radius:(MARSH.ru+MARSH.rp)*.5,far:2500};
// the marsh fizzes while acid rain falls (89-host-atmos.js, ATMOS.acidRain)
if(ACID_RAIN&&ATMOS.acidOn)ATMOS.acidOn(MARSH_DRAW.mesh.material,{kind:'water'});
