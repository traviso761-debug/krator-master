// ================================================================= HOST — the air's core and the weather (stations 2-5: no sea)
// The showcase's 89w-host-sea binds core/atmos and draws the Ring Sea; a field on other ground has no sea, so this is its first half: ATMOS.init on the
// one clock, the sky's light for the springs' and pools' water (core/atmos skylight), and the weather by the site's climate (bindWeather).
ATMOS.init({THREE,scene,camera,hour:()=>LIGHT_MODE==='night'?0:13,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:SITE.seed==null?5304:SITE.seed+5240,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const SKY_ENV=new THREE.Scene(),SEA_ENV={environment:null};
{SKY_ENV.add(new THREE.Mesh(sky.geometry,sky.material));for(const m of[giant,giantRing]){const c=m.clone();c.position.copy(giantDir).multiplyScalar(GIANT_DIST);SKY_ENV.add(c);}}
ATMOS.skylight({renderer,sky:SKY_ENV,scene:SEA_ENV,ground:()=>new THREE.Color(SITE.skyGround==null?0x3a3834:SITE.skyGround),key:()=>LIGHT_MODE});
ATMOS.bindWeather({climate:SITE.climate||{},sun,hemi,grounds:[MAT_GROUND]});
_mark('air');
