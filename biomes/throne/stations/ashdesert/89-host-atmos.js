// ================================================================= HOST — ATMOS: the shared atmosphere, bound to the ash desert
// core/atmos (its README.md) with its opt-in ASH weather (ATMOS.weather({ash:true}), from Voth's ash storm): 'ashfall' most
// days (flecks sifting down, a little haze), 'ash' the storm (a gale of flecks, veils of ash racing along the ground, warm
// lightning, a brown-out), and the module's own modes besides. The module draws the ash; what it does to this scene is
// ours (apply): the fog's density and colour, the sun and the sky's light dimmed, the flash lighting everything, and a
// veil over the sky dome (which takes no fog) closing in as the storm thickens.
ATMOS.init({THREE:THREE,scene:scene,camera:camera,
 hour:()=>LIGHT_MODE==='night'?1:14,
 onFrame:fn=>TICKS.push(dt=>fn(dt)),
 ground:(x,z)=>terrainH(x,z),seed:90071,err:m=>console.warn(m),
 viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
// the light mode's own values, which the weather darkens from (re-read whenever the mode changes)
const WXB={sunI:sun.intensity,hemiI:hemi.intensity,fog:scene.fog.color.clone(),dens:scene.fog.density};
_onLight.push(()=>{WXB.sunI=sun.intensity;WXB.hemiI=hemi.intensity;WXB.fog.copy(scene.fog.color);});
const ASH_FOG=new THREE.Color(0x6b5d49),ASH_FOG_NIGHT=new THREE.Color(0x1e1a16),FLASH=new THREE.Color(0xffd8b8),_wf=new THREE.Color();
const SKYVEIL=new THREE.Mesh(new THREE.SphereGeometry(8800,32,16),new THREE.MeshBasicMaterial({color:ASH_FOG.clone(),transparent:true,opacity:0,side:THREE.BackSide,fog:true,depthWrite:false}));   // fogged: at its distance it is exactly the fog's colour (three mixes fog after tone mapping)
SKYVEIL.userData.probeSkip=true;SKYVEIL.renderOrder=-9;scene.add(SKYVEIL);TICKS.push(()=>SKYVEIL.position.copy(camera.position));
ATMOS.weather({mode:'ashfall',ash:true,apply:W=>{const a=W.ash||0,f=W.flash||0,night=LIGHT_MODE==='night';
 _wf.copy(WXB.fog).lerp(night?ASH_FOG_NIGHT:ASH_FOG,clamp(a*.85,0,1)).lerp(FLASH,f*.35);scene.fog.color.copy(_wf);
 scene.fog.density=.00045+.0016*a+.0105*a*a*a+.0016*W.fog+.0008*W.rain;   // ashfall a haze; the storm a brown-out (~150 m)
 sun.intensity=WXB.sunI*(1-.8*a*a)*(1-.3*W.rain);hemi.intensity=WXB.hemiI*(1-.4*a*a)+f*1.4;
 SKYVEIL.material.color.copy(_wf);SKYVEIL.material.opacity=clamp(smooth(.35,.95,a)+.5*W.fog,0,1);}});   // the veil closes in a full storm, so fogged shapes do not stand out against the dome
// a few fog banks in the hollows between the dunes, up only in fog
(function(){reseed(8903);const pts=[],L=BIO.LOD();for(let k=0;k<3000&&pts.length<260;k++){const x=rr(-2400,2400),z=rr(-2400,2400);if(BIO.lodD(x,z)>L.mid)continue;pts.push([x,terrainH(x,z)+rr(1,6),z]);}ATMOS.fogBank(pts);})();
ATMOS.finish();
ATMOS.weatherUI(document.getElementById('ui'));
