// ================================================================= HOST — ATMOS: the shared atmosphere, bound to vent country
// core/atmos (its README.md) with its opt-in ash weather (we are under the plume): the module's 'fog' is the rift's ACID
// FOG here (the vents' gas held down in the still air: yellowed, sour, the sun a pale disc in it), 'ashfall' and the ash
// storm besides, and the rest. The module draws the weather; what it does to this scene is ours (apply): the fog's
// density and colour, the sun dimmed, the flash, and a veil over the sky dome (which takes no fog) as it closes in.
ATMOS.init({THREE:THREE,scene:scene,camera:camera,
 hour:()=>LIGHT_MODE==='night'?1:14,
 onFrame:fn=>TICKS.push(dt=>fn(dt)),
 ground:(x,z)=>terrainH(x,z),seed:90081,err:m=>console.warn(m),
 viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const WXB={sunI:sun.intensity,hemiI:hemi.intensity,fog:scene.fog.color.clone()};
_onLight.push(()=>{WXB.sunI=sun.intensity;WXB.hemiI=hemi.intensity;WXB.fog.copy(scene.fog.color);});
const ACID=new THREE.Color(0xb4ae7c),ACID_NIGHT=new THREE.Color(0x24261a),ASH_FOG=new THREE.Color(0x6b5d49),ASH_FOG_NIGHT=new THREE.Color(0x1e1a16),FLASH=new THREE.Color(0xffd8b8),_wf=new THREE.Color();
const SKYVEIL=new THREE.Mesh(new THREE.SphereGeometry(8800,32,16),new THREE.MeshBasicMaterial({color:ACID.clone(),transparent:true,opacity:0,side:THREE.BackSide,fog:true,depthWrite:false}));   // fogged: at its distance it is exactly the fog's colour (three mixes fog after tone mapping)
SKYVEIL.userData.probeSkip=true;SKYVEIL.renderOrder=-9;scene.add(SKYVEIL);TICKS.push(()=>SKYVEIL.position.copy(camera.position));
ATMOS.weather({mode:'clear',ash:true,apply:W=>{const a=W.ash||0,fg=W.fog||0,f=W.flash||0,night=LIGHT_MODE==='night';
 _wf.copy(WXB.fog).lerp(night?ACID_NIGHT:ACID,clamp(fg*.9,0,1)).lerp(night?ASH_FOG_NIGHT:ASH_FOG,clamp(a*.85,0,1)).lerp(FLASH,f*.35);scene.fog.color.copy(_wf);
 scene.fog.density=.00035+.0035*fg*fg+.0016*a+.0105*a*a*a+.0008*W.rain;   // the acid fog ~300 m; the ash storm a brown-out
 sun.intensity=WXB.sunI*(1-.55*fg)*(1-.8*a*a)*(1-.3*W.rain);hemi.intensity=WXB.hemiI*(1-.15*fg)*(1-.4*a*a)+f*1.4;
 SKYVEIL.material.color.copy(_wf);SKYVEIL.material.opacity=clamp(smooth(.35,.95,a)+.75*fg,0,1);}});
// the fog banks: low in the graben, the marsh and the steam valley, near the cameras' spine
(function(){reseed(8903);const pts=[],L=BIO.LOD();for(let k=0;k<5000&&pts.length<420;k++){const x=rr(-2400,2400),z=rr(-2400,2400);if(BIO.lodD(x,z)>L.mid)continue;
  if(FIELD.graben(x,z)<.5&&FIELD.valley(x,z)<.3&&FIELD.marsh(x,z)<.3)continue;pts.push([x,terrainH(x,z)+rr(1,6),z]);}ATMOS.fogBank(pts);})();
ATMOS.finish();
ATMOS.weatherUI(document.getElementById('ui'));
