// ================================================================= HOST — the portal's sky and the eye's exposure
// The one station that opens to the day: the shared sky (ATMOS.skyBiome, core/atmos/SKY-PLAN.md section 9) at the portal's place on the scale
// model, on the host's clock, its key sun; and the exposure ramp (PLAN.md section 6: "the portal station ramps it over 300 m"): each frame the
// tone-mapping exposure follows LINE.exposureAt at the eye (dark-adapted under cover, the day's out of it). ?exposure= pins it.
const SUN=new THREE.DirectionalLight(0xfff1dc,2.0);SUN.position.set(-200,400,300);scene.add(SUN);scene.add(SUN.target);
const SKY=(typeof ATMOS!=='undefined'&&ATMOS.skyBiome)?ATMOS.skyBiome({renderer,camera,scene,sun:SUN,site:{px:SITE.px,py:SITE.py},preset:{fogDensity:.0007}}):null;
tick(()=>{if(Q.has('exposure'))return;const p=camera.position,e=LINE.exposureAt(p.x,p.y,p.z);renderer.toneMappingExposure+=(e-renderer.toneMappingExposure)*.08;});
window._sky=!!SKY;
