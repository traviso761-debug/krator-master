// ================================================================= HOST — ATMOS: the shared atmosphere, bound to the glacier
// core/atmos (its README.md) with its opt-in SNOW weather (ATMOS.weather({snow:true}), the owner's glacier): 'snowfall'
// (flakes drifting down, a soft haze) and 'blizzard' (a gale of flakes, streaks of blown snow, spindrift skimming the ice,
// a white-out), and the module's own modes. What it does to this scene is ours (apply): the fog's density and colour, the
// sun dimmed, and a veil over the sky dome (which takes no fog) as the white-out closes in.
ATMOS.init({THREE:THREE,scene:scene,camera:camera,
 hour:()=>LIGHT_MODE==='night'?1:13,
 onFrame:fn=>TICKS.push(dt=>fn(dt)),
 ground:(x,z)=>terrainH(x,z),seed:90091,err:m=>console.warn(m),
 viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const WXB={sunI:sun.intensity,hemiI:hemi.intensity,fog:scene.fog.color.clone()};
SKY_LOOK.push(()=>{WXB.sunI=sun.intensity;WXB.hemiI=hemi.intensity;WXB.fog.copy(scene.fog.color);});   /* from the shared sky each frame, before the weather runs again over it (82, 89-host-sky.js) */
const WHITE=new THREE.Color(0xdde4ec),WHITE_NIGHT=new THREE.Color(0x262c36),_wf=new THREE.Color();
const SKYVEIL=new THREE.Mesh(new THREE.SphereGeometry(8800,32,16),new THREE.MeshBasicMaterial({color:WHITE.clone(),transparent:true,opacity:0,side:THREE.BackSide,fog:true,depthWrite:false}));   // fogged: at its distance it is exactly the fog's colour (three mixes fog after tone mapping)
SKYVEIL.userData.probeSkip=true;SKYVEIL.renderOrder=-9;scene.add(SKYVEIL);TICKS.push(()=>SKYVEIL.position.copy(camera.position));
ATMOS.weather({mode:'clear',snow:true,apply:W=>{const s=W.snow||0,fg=W.fog||0,night=LIGHT_MODE==='night';
 _wf.copy(WXB.fog).lerp(night?WHITE_NIGHT:WHITE,clamp(s*.9+fg*.7,0,1));scene.fog.color.copy(_wf);
 scene.fog.density=.00018+.0012*s+.0085*s*s*s+.0032*fg*fg+.0006*W.rain;   // snowfall a soft haze; the blizzard a white-out (~150 m)
 sun.intensity=WXB.sunI*(1-.45*s-.4*s*s)*(1-.5*fg)*(1-.3*W.rain);hemi.intensity=WXB.hemiI*(1+.1*s)*(1-.1*fg);
 SKYVEIL.material.color.copy(_wf);SKYVEIL.material.opacity=clamp(smooth(.3,.95,s)+.7*fg,0,1);}});
// SNOW THAT LIES (core/atmos/fx/89-atmos-fx-snowcover.js, 2026-10-25): fresh snow builds on every up-facing surface while it snows
// (a blizzard covers the moraines, the rock and the trees' tops in about seven minutes) and stays: the glacier's air is
// frozen, so it does not melt by day. The painted accumulation zone stays the ground's own. window._snowDepth(d) sets it.
ATMOS.snowCover({frozen:true,lee:.45});ATMOS.snowOnScene(scene);   /* lee .45 (2026-10-26, WEATHER item 10): the faces downwind of the gale hold more of it, the windward faces less */
// THE RAIN OCCLUSION MAP (R10, core/atmos/fx/89-atmos-fx-raincover.js): no fresh snow and no flakes under the conifers, the ice
// arch and the caves' roofs (the painted accumulation zone stays the ground's own)
ATMOS.rainCover({renderer});
// HEIGHT FOG (R1, core/atmos/sky/89-atmos-j-fog.js + host/89-atmos-j-heightfog.js): the thin air's haze is the page's own at the
// ground under the eye and thins fast above it (the snow crown stands clear, the far flank below hazes); at dawn a cold mist
// pools in the ground 80 m under the eye (the bench, the lake, the outwash). The weather's law above keeps writing the fog's
// density and colour: this fog reads them
ATMOS.heightFog({falloff:1/1100,sun:.5,sky:.45,mist:{density:.00015,below:80,depth:30,noise:.7}});ATMOS.heightFogScene(scene);window._snowDepth=d=>{ATMOS.snow.depth=d;};
ATMOS.finish();
// the Weather select goes into the host's #ui: 99-host-take.js, after KHOST.take
