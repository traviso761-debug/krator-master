// ================================================================= HOST - the salt lake, the marsh pools and the rivers on core/water
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
// the salt lake: the lake's ellipse a=850 m, b=1900 m, its edge wobbling by up to 16%
const LAKE_BOX=[-1150,-2400,1150,2400],LAKE_MASK=maskOf(LAKE_BOX,8,(x,z)=>lakeIn(x,z)<24);
// the rivers' plumes (2026-10-27, the owner: the delta rode over the lake): the channels fade out as they reach the lake (RIVER_KEEP below) and
// their water runs on into it as a tint, strongest at each channel's line and spreading as it fades over ~250 m, so the river's grey-green
// meets the pink salt water as a plume, not an edge (WATER.open's tint field; the lake's own colour everywhere else)
const PLUME_HEX=RIVER_COL.clone().lerp(new THREE.Color(0x6a7a72),.5).getHex();
const LAKE_TINT={box:LAKE_BOX,cell:8,at:(x,z)=>{if(Math.abs(x)<500)return null;const lk=lakeIn(x,z);if(lk>24)return null;const into=Math.max(0,-lk),rd=riverD(x,z);
 const a=.6*smooth(30+.35*into,6,rd)*smooth(-260,-10,lk)*smooth(24,0,lk);return a<.004?null:{c:PLUME_HEX,a};}};
const LAKE_WATER=WATER.open({name:'The salt lake',level:0,swell:SWELL,field:0,bounds:LAKE_BOX,bed:terrainH,bedCell:8,mask:LAKE_MASK,tint:LAKE_TINT});
const LAKE_DRAW=WATER.draw(LAKE_WATER,{surf:false,roughness:.2,metalness:.05,envMapIntensity:.85,renderOrder:1,
 shallow:lin(WATER_SHALLOW.clone().lerp(WATER_MID,.4).lerp(WATER_PALE,.2)),deep:lin(WATER_DEEP)});
LAKE_DRAW.mesh.userData.inspectLabel='The salt lake';
// the marsh pools: the marsh zone (east of the lake, up to where the slope begins), wherever the ground is under the level
const MUD=new THREE.Color(0x6a6a58),RIVER_GREY=new THREE.Color(0x6a7a72);
const MARSH_BOX=[-250,-3740,2500,3740],MARSH_MASK=maskOf(MARSH_BOX,10,(x,z)=>{const W=zoneW(x,z);return Math.max(W.marshW,W.marshE)>.02&&W.lk>=24;});
const MARSH_WATER=WATER.open({name:'The marsh pools',level:0,swell:SWELL,field:0,bounds:MARSH_BOX,bed:terrainH,bedCell:10,mask:MARSH_MASK});
const MARSH_DRAW=WATER.draw(MARSH_WATER,{surf:false,roughness:.2,metalness:.03,envMapIntensity:.3,renderOrder:1,   /* tints as tuned on a real GPU against the old shader (2026-10-20): the lit surface shows a tint far brighter than the old one did */
 shallow:lin(POOL_COL.clone().lerp(MUD,.5)).multiplyScalar(.6),deep:lin(POOL_COL.clone().lerp(MUD,.4)).multiplyScalar(.4)});
MARSH_DRAW.mesh.userData.inspectLabel='The marsh pools';
// the rivers: the east river from the wall (x 3500) to the lake, the west from the far flats (x -3700) to the lake, each with the delta's two
// side channels that fan out over the last 430 m (riverD's own offsets). y: a hand above the level in the basin, the old ribbon's bed+.5 on the slope.
const RIVER_Y=(x,z)=>Math.max(.1,terrainH(x,z)+.5);
const riverLine=(x0,x1,dx,zf,off,wf)=>{const P=[],W=[];for(let x=x0;dx>0?x<=x1:x>=x1;x+=dx){const z=zf(x)+off(x);P.push([x,z,RIVER_Y(x,z)]);W.push(wf(x));}return{P,W};};
const eastW=x=>38+(2*(13-4*smooth(2000,3400,x))-38)*smooth(2000,2400,x);
// rapids (2026-10-26): the east river's own white-water band on its slope, [.05, .3] in place of core/water's preset [.015, .12], so the
// lower climb (a 5 to 12 % grade) runs streaked and green and only the steep reaches under the shelf (16 to 27 %) break white: the
// cataracts read where the ground is steepest. The ground has no step, so there is no WATER.fall (fallsOf finds none at .35).
const riverFlow=(name,L,speed,rapids)=>WATER.flow(Object.assign({name,pts:L.P,width:L.W,speed,densify:6},rapids?{rapids}:{}));   /* densify: a row every 6 m, so the fade into the lake (RIVER_KEEP) resolves */
const fanE=s=>x=>s*Math.max(0,(1250-x)/430)*(s>0?150:130);
const fanW=s=>x=>s*Math.max(0,(x+1250)/430)*(s>0?140:120);
const RIVERS=[
 riverFlow('The east river',riverLine(3500,800,-30,zE,x=>0,eastW),1.1,[.05,.3]),
 riverFlow('The east river, north channel',riverLine(1250,800,-30,zE,fanE(1),x=>30),.7),
 riverFlow('The east river, south channel',riverLine(1250,800,-30,zE,fanE(-1),x=>30),.7),
 riverFlow('The west river',riverLine(-3700,-800,30,zW,x=>0,x=>38),.9),
 riverFlow('The west river, north channel',riverLine(-1250,-800,30,zW,fanW(1),x=>30),.6),
 riverFlow('The west river, south channel',riverLine(-1250,-800,30,zW,fanW(-1),x=>30),.6)];
// each channel fades out over 45 m as it reaches the lake (drawFlow keep, core/water 2026-10-27): it never rides over the lake's water; LAKE_TINT carries its colour on
const RIVER_KEEP=(x,z)=>smooth(-30,15,lakeIn(x,z));
const RIVER_DRAW=RIVERS.map(S=>{const D=WATER.drawFlow(S,{keep:RIVER_KEEP,shallow:lin(RIVER_COL.clone().lerp(RIVER_GREY,.5)).multiplyScalar(.7),deep:lin(RIVER_COL.clone().lerp(RIVER_GREY,.35)).multiplyScalar(.6),color:0xffffff,roughness:.2,metalness:.05,envMapIntensity:.3,step:30,across:6,margin:3});
 D.mesh.userData.inspectLabel=S.name;return D;});
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
