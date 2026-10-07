// ================================================================= HOST — ATMOS: the shared atmosphere, bound to the cloud forest
// core/atmos (its README.md): the weather (fog most of the time: the cloud belt; drizzle; a clear spell when the cloud
// lifts), and its fog banks drifting through the elfin woods near the cameras. The module's fog state is the weather's; the
// scene's fog density is ours (apply): thick in the cloud, thin when it clears. The spill over the ridge (85) thins with it.
ATMOS.init({THREE:THREE,scene:scene,camera:camera,
 hour:()=>LIGHT_MODE==='night'?1:13,
 onFrame:fn=>TICKS.push(dt=>fn(dt)),
 ground:(x,z)=>terrainH(x,z),seed:90051,err:m=>console.warn(m),
 viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
// the sky dome takes no fog: inside the cloud a veil of the fog's colour hides it (a sphere just inside the dome)
const SKYVEIL=new THREE.Mesh(new THREE.SphereGeometry(8800,32,16),new THREE.MeshBasicMaterial({color:HAZE,transparent:true,opacity:0,side:THREE.BackSide,fog:true,depthWrite:false}));   // fogged: at its distance it is exactly the fog's colour (three mixes fog after tone mapping)
SKYVEIL.userData.probeSkip=true;SKYVEIL.renderOrder=-9;scene.add(SKYVEIL);TICKS.push(()=>SKYVEIL.position.copy(camera.position));
ATMOS.weather({mode:'fog',apply:W=>{const clear=W.mode==='clear';scene.fog.density=(clear?.0011:.0026)+.0042*W.fog+.0012*W.rain;
 SKYVEIL.material.opacity=clamp((clear?0:.45)+.53*W.fog+.25*W.rain,0,.97);SKYVEIL.material.color.copy(scene.fog.color);SPILLU.uK.value=.75+.25*W.fog;}});
// the fog banks: on the woods near the cameras' spine, a few hundred, low among the trees
(function(){reseed(8903);const pts=[],L=BIO.LOD();
 for(let k=0;k<5000&&pts.length<700;k++){const x=rr(-2450,2450),z=rr(-2450,2450);if(BIO.lodD(x,z)>L.mid)continue;if(FIELD.lee(x,z)>.5)continue;pts.push([x,terrainH(x,z)+rr(2,10),z]);}
 ATMOS.fogBank(pts);})();
ATMOS.finish();
ATMOS.weatherUI(document.getElementById('ui'));
