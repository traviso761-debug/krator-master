// ================================================================ PORT SEA (core/water)
// The sea is core/water's open water (core/water/README.md): a WATER.open surface at sea level (PORT.SEA0) carrying a share
// of the shared wave field (core/atmos) and no swell of its own, on the one clock (atmWaveT, whole cycles per period), drawn
// by WATER.draw on the CDLOD water mesh (fine under the camera, coarser with distance, out to the horizon). The bed is baked
// from terrainH (portBuildTerrain calls portSea once the stamps have shaped the ground) over the coast and the berths: the
// swell calmed to nothing at the waterline and against the moles, a surf lap where it is under 1.4 m, the water fading out
// over the sand. The depth tint is still PAINTED ON THE SEABED (portGroundColor) and seen through the part-transparent water,
// as before; the water's own colour is the old sheet's. The old 22-sine normal map (TEX.pkSeaN, 46 m a tile) is its detail,
// scrolled whole tiles per period. The sky in the water is core/atmos's skylight, a capture of the page's dome and giant given
// to the water only (90-scene.js): the kit's tuned materials are unchanged. A `dry` stamp (a pumped-out pit) is cut out of
// the water by the same rects the underwater fade is masked with (PK_DRY: a polygon stamp by its bounding box).
// Its CPU twin is WATER.heightAt. The vessels are baked (pbFlush, kbake): none rides it, so the harbour is kept calm
// (PORT_SEA_FIELD: at most ~13 cm from y=0) and they keep their waterlines. Before 2026-10-13 the sea was one static flat
// sheet with a fresnel rim (KNOWN_ISSUES.md: milky at grazing angles).
const PORT_SEA_FIELD=.25,PORT_SEA_TILT=2.4;   // the field's height and its shading slope (raised so the chop still reads)
const PORT_SEA_COL=[0x134a5c,0x0b2430];        // day, night (the old sheet's colours)
const PORT_SEA_K={value:new THREE.Vector3(1,1,1)};   // the night's colour over the day's, per channel (PORT_NIGHT)
let PORT_SEA=null,PORT_SEA_DRAW=null;
// the sea over the terrain's box [x0, z0, x1, z1] (the bed is baked over it, 5 m cells); returns the drawn mesh
function portSea(scene,box){
 PORT_SEA=WATER.open({name:'The sea',level:PORT.SEA0,field:PORT_SEA_FIELD,tilt:PORT_SEA_TILT,bed:terrainH,bedBox:box,bedCell:5});
 const c=new THREE.Color(PORT_SEA_COL[0]);
 const D=PORT_SEA_DRAW=WATER.draw(PORT_SEA,{scene,transparent:true,renderOrder:1,roughness:.16,metalness:.05,envMapIntensity:.45,
  shallow:c,deep:c,normalMap:TEX.pkSeaN,normalScale:.35,detailSize:46,detailCycles:[2,1]});
 D.material.opacity=.72;
 // the dry pits: the water is discarded inside the PK_DRY rects (71-port-terrain.js fills them)
 const ob=D.material.onBeforeCompile;
 D.material.onBeforeCompile=sh=>{ob(sh);sh.uniforms.u_dry=PK_DRY;sh.uniforms.u_ndry=PK_NDRY;sh.uniforms.u_seaK=PORT_SEA_K;
  sh.fragmentShader='uniform vec4 u_dry['+PK_DRYN+'];\nuniform int u_ndry;\nuniform vec3 u_seaK;\n'+sh.fragmentShader.replace('#include <color_fragment>',
   '#include <color_fragment>\nfor(int _i=0;_i<'+PK_DRYN+';_i++){if(_i>=u_ndry)break;vec4 _r=u_dry[_i];if(vWtrP.x>_r.x&&vWtrP.x<_r.z&&vWtrP.y>_r.y&&vWtrP.y<_r.w)discard;}')
   .replace('#include <roughnessmap_fragment>','diffuseColor.rgb*=u_seaK;\n'+
    // the old sheet's fresnel opacity: near-opaque at grazing angles, so the piles under the water do not streak through
    'float _fr=1.0-clamp(abs(dot(wtrN,normalize(cameraPosition-vec3(vWtrP.x,wtrLevel,vWtrP.y)))),0.0,1.0);diffuseColor.a=clamp(diffuseColor.a+_fr*_fr*_fr*0.3,0.0,1.0);\n'+
    '#include <roughnessmap_fragment>');};
 D.mesh.name='sea';D.mesh.userData.inspectLabel='The sea';
 return D.mesh;}
PORT_NIGHT.push(on=>{const d=new THREE.Color(PORT_SEA_COL[0]),n=new THREE.Color(PORT_SEA_COL[1]);
 if(on)PORT_SEA_K.value.set(n.r/d.r,n.g/d.g,n.b/d.b);else PORT_SEA_K.value.set(1,1,1);
 if(PORT_SEA_DRAW&&ATMOS.skyEnv)ATMOS.skyEnv.capture();});   // the night sky in the water at once (the skylight's own check waits 30 frames)
