// ================================================================= HOST - STATION 2: the winding lake and its marsh pools on core/water (as src/89w, no rivers)
// core/water Phase 3 (core/water/README.md), 2026-10-20. Before this, one 300x300 plane at y=0 (180k triangles, a vertex colour by depth and
// salinity in the page's own ShaderMaterial) carried the lake, the marsh pools and the rivers' basin reaches, and a ribbon mesh the east river
// up the slope. The surface is still y=0 (BIO.waterH and terrainH are unchanged: the zones, the floor mask and the open world's readers see
// the same ground), now as three kinds:
//   the SALT LAKE      WATER.open over the lake window, a mask keeping it to the lake side of the shore (lakeIn < 24 m), the salt tints
//   the MARSH POOLS    WATER.open over the marsh's box, a mask of the marsh zone outside the lake: the pools are where the ground
//                      dips under y=0, so hundreds of them are ONE surface (one draw), the page's olive pool tint
//   the RIVERS         WATER.flow down each river's centre (the east river from the slope to its delta, the west across the flats) and the
//                      delta's side channels, a hand above the level (y=.1, so a ribbon does not fight the open water it crosses)
// The sky in the water is core/atmos's skylight, a capture of this page's dome and giant given to the water only (WENV).
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone();env.add(g);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6a5a44)});}
const lin=c=>c.clone().convertSRGBToLinear();
const maskOf=(box,cell,f)=>{const nx=Math.round((box[2]-box[0])/cell),nz=Math.round((box[3]-box[1])/cell),d=new Uint8Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)d[j*nx+i]=f(box[0]+(i+.5)*cell,box[1]+(j+.5)*cell)?255:0;
 return{x0:box[0],z0:box[1],cell,nx,nz,data:d};};
// surf: false (core/water, 2026-10-21): WATER.draw laps a surf of white bands wherever the bed is under 1.4 m, right for a sea's beach and wrong for a still lake's
// rim and a marsh's pools, and the bed was clamped at 1.4 m deep to hide it. Now the bed is the ground's own and the lap is off; the ground itself and BIO.waterH are untouched.
const SWELL=[[.05,22,35,0,.03],[.03,13,-50,1.3,.03],[.012,6,80,2.2,.02]];
// the lake: winding north-south through the whole square (45: xc, hw)
// THE POOLS THE SHORE CUTS INTO ARE THE LAKE'S (the owner, 2026-10-27: "algae color doesn't extend to pools that intersect
// shoreline"): every cell under the water level joined to the lake (4-neighbour flood from lakeIn < 0, at 8 m) goes to the lake's
// surface and its tint, and out of the marsh pools'; the rivers' channels (riverD < 40 m) are not followed upstream
function lakeJoined(box,cell){const nx=Math.round((box[2]-box[0])/cell),nz=Math.round((box[3]-box[1])/cell),c=new Uint8Array(nx*nz),q=[];
 const X=i=>box[0]+(i+.5)*cell,Z=j=>box[1]+(j+.5)*cell,wet=(x,z)=>terrainH(x,z)<BIO.waterH(x,z)-.02&&riverD(x,z)>=40;
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)if(lakeIn(X(i),Z(j))<0){c[j*nx+i]=1;q.push(j*nx+i);}
 while(q.length){const k=q.pop(),i=k%nx,j=(k-i)/nx;
  for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=nx||b>=nz)continue;const n=b*nx+a;
   if(c[n])continue;if(wet(X(a),Z(b))){c[n]=1;q.push(n);}}}
 return(x,z)=>{const i=Math.floor((x-box[0])/cell),j=Math.floor((z-box[1])/cell);return i>=0&&j>=0&&i<nx&&j<nz&&c[j*nx+i]===1;};}
const LAKE_BOX=[-2400,-3740,2400,3740],LAKE_JOIN=lakeJoined(LAKE_BOX,8),LAKE_MASK=maskOf(LAKE_BOX,8,(x,z)=>lakeIn(x,z)<24||LAKE_JOIN(x,z));
const LAKE_WATER=WATER.open({name:'The winding lake',level:0,swell:SWELL,field:0,bounds:LAKE_BOX,bed:terrainH,bedCell:8,mask:LAKE_MASK});
const LAKE_DRAW=WATER.draw(LAKE_WATER,{surf:false,roughness:.2,metalness:.05,envMapIntensity:.85,renderOrder:1,
 shallow:lin(WATER_SHALLOW.clone().lerp(WATER_MID,.4).lerp(WATER_PALE,.2)),deep:lin(WATER_DEEP)});
LAKE_DRAW.mesh.userData.inspectLabel='The winding lake';
// the marsh pools: the marsh zone (east of the lake, up to where the slope begins), wherever the ground is under the level
const MUD=new THREE.Color(0x6a6a58),RIVER_GREY=new THREE.Color(0x6a7a72);
const MARSH_BOX=[-2400,-3740,2400,3740],MARSH_MASK=maskOf(MARSH_BOX,10,(x,z)=>{const W=zoneW(x,z);return Math.max(W.marshW,W.marshE)>.02&&W.lk>=24&&!LAKE_JOIN(x,z)&&riverD(x,z)>20;});   /* the rivers' carved beds are the ribbons', not marsh water */
const MARSH_WATER=WATER.open({name:'The marsh pools',level:0,swell:SWELL,field:0,bounds:MARSH_BOX,bed:terrainH,bedCell:10,mask:MARSH_MASK});
const MARSH_DRAW=WATER.draw(MARSH_WATER,{surf:false,roughness:.2,metalness:.03,envMapIntensity:.3,renderOrder:1,   /* tints as tuned on a real GPU against the old shader (2026-10-20): the lit surface shows a tint far brighter than the old one did */
 shallow:lin(POOL_COL.clone().lerp(MUD,.5)).multiplyScalar(.6),deep:lin(POOL_COL.clone().lerp(MUD,.4)).multiplyScalar(.4)});
MARSH_DRAW.mesh.userData.inspectLabel='The marsh pools';
const RIVERS=[],RIVER_DRAW=[];   /* no rivers at this station: the lake fills from its ends, beyond the map */
// the lily pads and the leaf rafts ride the swell (2026-10-26): their material lifts each instance by the water's own height at its centre
// (WATER.rideOn, core/water W5: the vertex chunk WATER.rideGLSL, the same swell as WATER.heightAt: the trochoids through the Newton inverse and
// the lake bed's damping, on the water's one clock), times aBob: 1 on the lake (its bed's damping is in the chunk), the marsh's own damping in
// its pools (the lake's chunk is undamped outside the lake's bed box; both surfaces take SWELL), 0 off both masks, so a pad on a river reach stays
// put. Before: the page wrote the trochoids' sum at the instance's rest point itself (no inverse, no bed). The water palm's rhizome and the
// hyacinths (the shared 'rosette', 'rod' and 'bloom' items) do not bob. The export and a Godot port see the rest height (the bob is shader-only).
{const dampAt=(x,z)=>LAKE_WATER.contains(x,z)?1:MARSH_WATER.contains(x,z)?(MARSH_WATER.damp?MARSH_WATER.damp(x,z,0):1):0;
 const done=new Set();
 scene.traverse(o=>{if(!o.isInstancedMesh||(o.name!=='biome:pad'&&o.name!=='biome:floatleaf'))return;
  const n=o.count,M=o.instanceMatrix.array,b=new Float32Array(n);for(let i=0;i<n;i++)b[i]=dampAt(M[i*16+12],M[i*16+14]);
  o.geometry.setAttribute('aBob',new THREE.InstancedBufferAttribute(b,1));
  const m=o.material;if(done.has(m))return;done.add(m);WATER.rideOn(m,LAKE_WATER,{weight:'aBob'});});}
// natural ripples (core/water/ext/56, 2026-10-27, as station 1): the lake's and the marsh pools' normals broken up, the swell's stripes
// in patches and a drifting chop over them
WATER.breakupAll();
