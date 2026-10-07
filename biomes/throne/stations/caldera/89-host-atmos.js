// ================================================================= HOST — ATMOS: the shared atmosphere, bound to the caldera rim
// core/atmos (its README.md) with both its opt-in weathers: SNOW (snowfall, and the blizzard: blowing snow off the rim) and
// ASH (ashfall when the plume leans this way, and the ash storm), and the module's own modes. The air is thin: a clear day
// has almost no haze; a storm closes it in. What it does to this scene is ours (apply): the fog's density and colour (white
// for the snow, brown for the ash), the sun dimmed, the sky dome veiled as it closes in.
ATMOS.init({THREE:THREE,scene:scene,camera:camera,
 hour:()=>LIGHT_MODE==='night'?1:13,
 onFrame:fn=>TICKS.push(dt=>fn(dt)),
 ground:(x,z)=>terrainH(x,z),seed:90101,err:m=>console.warn(m),
 viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const WXB={sunI:sun.intensity,hemiI:hemi.intensity,fog:scene.fog.color.clone()};
_onLight.push(()=>{WXB.sunI=sun.intensity;WXB.hemiI=hemi.intensity;WXB.fog.copy(scene.fog.color);});
const WHITE=new THREE.Color(0xdde4ec),WHITE_NIGHT=new THREE.Color(0x262c36),ASH_FOG=new THREE.Color(0x6b5d49),ASH_FOG_NIGHT=new THREE.Color(0x1e1a16),FLASH=new THREE.Color(0xffd8b8),_wf=new THREE.Color();
const SKYVEIL=new THREE.Mesh(new THREE.SphereGeometry(8800,32,16),new THREE.MeshBasicMaterial({color:WHITE.clone(),transparent:true,opacity:0,side:THREE.BackSide,fog:true,depthWrite:false}));   // fogged: at its distance it is exactly the fog's colour (three mixes fog after tone mapping)
SKYVEIL.userData.probeSkip=true;SKYVEIL.renderOrder=-9;scene.add(SKYVEIL);TICKS.push(()=>SKYVEIL.position.copy(camera.position));
ATMOS.weather({mode:'clear',snow:true,ash:true,apply:W=>{const s=W.snow||0,a=W.ash||0,fg=W.fog||0,f=W.flash||0,night=LIGHT_MODE==='night';
 _wf.copy(WXB.fog).lerp(night?WHITE_NIGHT:WHITE,clamp(s*.9+fg*.6,0,1)).lerp(night?ASH_FOG_NIGHT:ASH_FOG,clamp(a*.85,0,1)).lerp(FLASH,f*.35);scene.fog.color.copy(_wf);
 scene.fog.density=.00009+.0012*s+.0085*s*s*s+.0014*a+.0095*a*a*a+.003*fg*fg+.0005*W.rain;   // thin air: clear is almost no haze; the storms close it in
 sun.intensity=WXB.sunI*(1-.45*s-.4*s*s)*(1-.8*a*a)*(1-.5*fg);hemi.intensity=WXB.hemiI*(1+.1*s)*(1-.4*a*a)+f*1.4;
 SKYVEIL.material.color.copy(_wf);SKYVEIL.material.opacity=clamp(Math.max(smooth(.3,.95,s),smooth(.35,.95,a))+.7*fg,0,1);}});
ATMOS.finish();
ATMOS.weatherUI(document.getElementById('ui'));
