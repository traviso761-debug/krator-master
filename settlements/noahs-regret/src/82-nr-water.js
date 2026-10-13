// ================================================================= THE GROUND AND THE SEA: the shore's mesh, the Ring Sea's water
// The ground is one warped grid about the hull (2.5 m cells over the arcology, stretching to 2.4 km at the rim) on
// terrainH (12-nr-world.js), coloured by what it is: wet sand at the waterline, dry sand, the dune grass behind, the sea
// floor. The sea is the shared wave field (core/atmos, `#include <atmos_waves>`) on Voth's water shader: depth from the
// ground, shallows to deep, a foam lap at the waterline. Inside the hull the same water stands in the holds (they are
// open to the sea), so the holds need no water of their own.
function nrWarp(u,a,b){const s=u<0?-1:1,x=Math.abs(u);return s*(a*x+b*Math.pow(x,5));}
function nrGroundMesh(){const N=320,pos=[],col=[],uv=[],idx=[];const c=new THREE.Color();
 const wet=new THREE.Color(0x9a8a6a).convertSRGBToLinear(),dry=new THREE.Color(0xd8c8a4).convertSRGBToLinear(),grass=new THREE.Color(0x8a9a5a).convertSRGBToLinear(),
  floor=new THREE.Color(0x8a7a5a).convertSRGBToLinear(),deep=new THREE.Color(0x4a5a52).convertSRGBToLinear();
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const x=nrWarp(i/N*2-1,400,2000),z=nrWarp(j/N*2-1,400,2000),h=terrainH(x,z);pos.push(x,h,z);uv.push(x/4,z/4);
  const d=z-nrShoreZ(x);
  if(h<-.4)c.copy(floor).lerp(deep,clamp(-h/14,0,1));
  else if(h<.9)c.copy(wet).lerp(dry,clamp((h+.4)/1.3,0,1));
  else{c.copy(dry);const g=clamp((d-120)/90,0,1)*clamp((h-4)/4,0,1)*(.6+.4*fbm(x/40,z/40,9.1,2));c.lerp(grass,g);}
  col.push(c.r,c.g,c.b);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+1,d=a+N+1,e=d+1;idx.push(a,d,b,b,d,e);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(new THREE.Uint32BufferAttribute(idx,1));g.computeVertexNormals();
 const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1});
 const L=KMAT.mode==='lib'?KMAT.packed('noahs-regret','sand'):null;
 if(L){const T=KMAT.textures(L,{aniso:TEXANISO});for(const t of [T.map,T.normalMap,T.roughnessMap])if(t){t.repeat.set(4/L.scale[0],4/L.scale[1]);}
  m.map=T.map;m.normalMap=T.normalMap;m.roughnessMap=T.roughnessMap;matHook(m,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));}
 const M=new THREE.Mesh(g,m);M.receiveShadow=true;M.userData.isGround=true;M.name='ground';return M;}
// ---------------------------------------------------------------- the sea
// The Ring Sea here is core/water's open water (core/water/README.md): a WATER.open surface at the sea's level carrying the
// shared wave field (core/atmos) as the old sheet did (field 1, its swell displaced, its chop and mid waves shading), on the
// one clock (atmWaveT), drawn by WATER.draw on the CDLOD water mesh (fine under the camera, coarser with distance, out to
// the horizon). The bed is baked from terrainH (with the hull's own ground, held below the keel in the holds) over the
// shore and the basin: the shallows' colour over the sand, a surf lap under 1.4 m, the swell calmed to nothing at the
// waterline (no sawtooth on the beach), the water fading out over the sand. The holds stand in the same water. No
// trochoids (the Ring Sea kit's swell): the floats off the inner quay are baked into the hull's buckets and cannot ride,
// so the sea moves no more than it did. The sky in it is core/atmos's skylight (90-scene.js gives it to the scene: the
// library materials reflect it too). Its CPU twin is WATER.heightAt. Before 2026-10-13 the sea was a warped 220 x 220 sheet
// with a per-vertex depth and Voth's water shader.
// nrSeaWater() makes the surface (before the world is built: terrainH already has the hull's ground); nrSeaDraw(S) draws
// it once ATMOS.init has run.
const NR_SEA_BED=[-1600,-1400,1600,600];   // the bed's box (x0, z0, x1, z1): the shore, the hull and the basin
function nrSeaWater(){return WATER.open({name:'The Ring Sea',field:1,bed:terrainH,bedBox:NR_SEA_BED,bedCell:4});}
function nrSeaDraw(S){const D=WATER.draw(S,{transparent:true,renderOrder:1,roughness:.18,metalness:.1,envMapIntensity:.4,
  shallow:new THREE.Color(0x5f9a96).convertSRGBToLinear().multiplyScalar(.42),deep:new THREE.Color(0x163a4c).convertSRGBToLinear().multiplyScalar(.5)});
 D.material.side=THREE.DoubleSide;   // the holds' water is seen from under the mezzanine too
 D.mesh.name='sea';D.mesh.userData.inspectLabel='The Ring Sea';return D;}
