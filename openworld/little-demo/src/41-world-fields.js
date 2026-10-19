// ================================================================= OPEN WORLD — fields: the land, the water, the climate, the biomes
// [G data] Plain maths of (x,z) over the region's rasters (WORLD_DATA, written by tools/scale-model/extract_region.py), on
// core/terrain's KLAND (40-core-land.js: the land itself, the ground rule every build on the scale model shares): no THREE,
// no DOM, no Math.random. Axes: metres, x east, z south, the origin at the region's centre pixel of the
// scale model, so x = (px - cx)*2000 and z = (py - cy)*2000. The noise is core/terrain's KRELIEF.noise (integer
// hashes, no Math.sin), so a Godot port grows the same land from the same rasters. WORLD.LAND is the KLAND instance.
//
//   WORLD.init(R)              R: the decoded rasters (98-world-start.js): elev, wlev, whas, wflag on the height grid;
//                              clim, rain, temp, biome, mask on the map grid
//   WORLD.H(x,z,minWave)       the ground height. minWave (m) leaves out detail finer than it: a far terrain chunk
//                              asks for less, so it is cheaper and does not alias
//   WORLD.water(x,z)           the water surface there (the sea, a lake, a named river), or -1e9 where there is none
//   WORLD.lakeWater / riverWater  its two parts (the water sheet treats a river's banks apart from a lake's shore)
//   WORLD.waterBodies()        the scale model's water as bodies (the Ring Sea, each salt lake and highland lake): a
//                              level, its cells, how salt it is, and a MASK over its cells and the ring round them, in
//                              metres (core/water draws each body as one surface clipped to it: 83w-world-seas.js)
//   WORLD.waterBodyAt(x,z)     the body whose cell holds (x,z) (its index), or -1
//   WORLD.riverLines(step)     each named river as a line in metres, a point every `step` m down its carved bed, at its
//                              water's height (riverWater), never climbing downstream: core/water's flow lines
//   WORLD.at(x,z)              the whole sample at a point (one object, reused): height, slope, water, climate, the
//                              biome blend, and the fields the kits read (wet, flow, upland, canyon, rim, rock, dune,
//                              salt, cold, slope...). WORLD.FIELDS names them.
//   WORLD.kitW(kit,x,z)        0..1: how much of that kit's overlay is here. Overlays blend over ~3 km and their edges
//                              are warped by noise, so no border reads as the scale model's 2 km pixels
//   WORLD.inside(x,z)          inside the region's polygon
//   WORLD.ground(x,z,A,out)    the ground's colour (linear RGB) and its rock weight from a sample A (WORLD.at)
//   WORLD.px(x) / WORLD.py(z)  scale-model pixels; WORLD.fromPx(px,py) -> [x,z]
//
// The land is KLAND's (core/terrain/40-core-land.js: Catmull-Rom on the 4 km cells, detail in a style per biome, the
// drainage network carved in, the escarpments made into cliffs); this fragment adds what is this world's: the kits' overlays,
// the ground palettes, the towns' own ground, the highways, the water bodies and the fields the kits read.
var WORLD=(function(){'use strict';
const W={ready:false};
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
const KN=KRELIEF.noise;
const N5=KN(505),N6=KN(707),N7=KN(808);   // the fields' and the ground colour's own noise (the land's is KLAND's)
W.landHook=null;   // (x, z, h, minWave) -> h: a world's own shaping of the land after the detail, before the towns and roads (H below)
W.FIELDS=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','mist'];

// ---------------------------------------------------------------- the styles: KLAND's (core/terrain/40-core-land.js STYLES, BIOME_STYLE)
const SKEYS=KLAND.SKEYS;
// the ground palettes (sRGB), from the kits' own ground painters where a kit exists (sedesert, eastabyss: 45-host-stage)
const PAL={
 desert:  {a:0xa85a42,b:0x884834,pale:0xc99a72,scrub:0x9e6a4c,sand:0xdca070,sand2:0xeab888,gravel:0xc7b08e,silt:0x9a8a68,damp:0x5a5040,mtn:0x7a6a5e,rock:0x8f4f3a},
 badland: {a:0x8a6a64,b:0x6e5a5e,pale:0xc8b8a0,scrub:0x8a7a5a,sand:0xb48a70,sand2:0xc4a488,gravel:0xb0a090,silt:0x8a8070,damp:0x4a4238,mtn:0x6e6460,rock:0x7a5a52},
 abyss:   {a:0x8d7a48,b:0x6c6a44,pale:0xe2ddd2,scrub:0x5e6e3a,sand:0xf1ede6,sand2:0xe2ddd2,gravel:0x9a8c74,silt:0x574836,damp:0x3d3526,mtn:0x6a5e4c,rock:0x8a6a5a},
 jungle:  {a:0x3b3324,b:0x2e2a1c,pale:0x5a4a32,scrub:0x3a4a24,sand:0x6a5a3a,sand2:0x7a6a48,gravel:0x6a5e48,silt:0x4a4030,damp:0x2a2418,mtn:0x5a5448,rock:0x5e5444},
 highland:{a:0x8a8458,b:0x6e7048,pale:0xa49c70,scrub:0x6a7040,sand:0xb0a478,sand2:0xbcb088,gravel:0xa09880,silt:0x7a7458,damp:0x4a4834,mtn:0x7a7468,rock:0x6e6a62},
 korona:  {a:0x6a5444,b:0x4a4440,pale:0x9a7a54,scrub:0x6a6040,sand:0xa88a5a,sand2:0xb89a6a,gravel:0x8a7a68,silt:0x6a5a48,damp:0x3a3430,mtn:0x5a524c,rock:0x4e4440},
 volcanic:{a:0x4a4038,b:0x3a3432,pale:0x6a5a4a,scrub:0x4a4a30,sand:0x5a4e44,sand2:0x6a5e52,gravel:0x5e5650,silt:0x4a443e,damp:0x2a2622,mtn:0x46403c,rock:0x3a3432},
 dryland: {a:0xb09a6a,b:0x9a845a,pale:0xc8b488,scrub:0x8a8048,sand:0xd0b888,sand2:0xdcc498,gravel:0xb8a888,silt:0x9a8a68,damp:0x5a5040,mtn:0x8a7a68,rock:0x8a6a52},
 sea:     {a:0x8a7a62,b:0x7a6a54,pale:0xb0a080,scrub:0x6a6a48,sand:0xc8b494,sand2:0xd4c0a0,gravel:0x9a8c74,silt:0x6a5e4a,damp:0x3a342a,mtn:0x6a6058,rock:0x6a5a4e}};
const SNOW=0xeef1f4,ICE=0xd8e4ee,SALT=0xf1ede6;
const lin=h=>{const r=(h>>16&255)/255,g=(h>>8&255)/255,b=(h&255)/255,f=c=>c<.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);return[f(r),f(g),f(b)];};

// ---------------------------------------------------------------- the rasters: KLAND holds them; this world reads them through it
let LAND=null,M,nx,ny,i0,j0,su,sv,cx,cy,X0,Y0,MW,MH,EL,WLV,WHAS,REL,CL,RN,TP,BI,MK;
let KIT,PALL,NB,CLCODE,CLGROUP;
// the kits (47-world-kits.js) are read at init: which overlay each grows on
let KITNAMES=[];W.KITS=KITNAMES;
W.init=function(R){M=WORLD_DATA.meta;
 LAND=KLAND.create(M,R);W.LAND=LAND;
 ({nx,ny,i0,j0,su,sv,cx,cy,X0,Y0,MW,MH,EL,WLV,WHAS,REL,CL,RN,TP,BI,MK}=LAND);
 LAND.hostH=(x,z)=>H(x,z,0,null,true);   // a river's water stands on the land with the towns in, without a road's fill
 // the biome table: kit and palette per overlay (the style is KLAND's)
 KITNAMES=WORLD_KITS.map(k=>k.name);W.KITS=KITNAMES;
 NB=M.biomes.length;KIT=new Int8Array(NB).fill(-1);PALL=[];
 M.biomes.forEach((b,i)=>{KIT[i]=WORLD_KITS.findIndex(k=>k.overlay===b.name.toLowerCase());
  const P=PAL[LAND.SID[i]],o={};for(const k in P)o[k]=lin(P[k]);PALL[i]=o;});
 CLCODE=M.classes.map(c=>c.code);CLGROUP=M.classes.map(c=>c.group);
 W.channelCount=LAND.channelCount;W.segmentCount=LAND.segmentCount;
 buildRoads();buildTowns();W.ready=true;};
W.px=x=>cx+x/2000;W.py=z=>cy+z/2000;W.fromPx=(px,py)=>[(px-cx)*2000,(py-cy)*2000];
W.box=()=>LAND.box();

// ---------------------------------------------------------------- sampling: KLAND's samplers and blend
const gridBil=(A,x,z)=>LAND.gridBil(A,x,z),mapBil=(A,x,z)=>LAND.mapBil(A,x,z),mapNear=(A,x,z)=>LAND.mapNear(A,x,z);
const BLEND={n:0,id:new Int32Array(4),w:new Float32Array(4)};
const blendAt=(x,z,B)=>LAND.blendAt(x,z,B);
W.style=(x,z)=>Object.assign({},LAND.styleAt(x,z));
W.kitW=function(k,x,z){const B=blendAt(x,z,BLEND);let s=0;for(let m=0;m<B.n;m++)if(KIT[B.id[m]]===k)s+=B.w[m];return s;};
W.biomeAt=function(x,z){const B=blendAt(x,z,BLEND);let b=0,bw=-1;for(let m=0;m<B.n;m++)if(B.w[m]>bw){bw=B.w[m];b=B.id[m];}return M.biomes[b];};
W.inside=(x,z)=>mapNear(MK,x,z)>127;
W.rain=(x,z)=>mapBil(RN,x,z)*M.rain.scale_mm;
W.temp=(x,z)=>mapBil(TP,x,z)+M.temp.offset;
W.climate=(x,z)=>{const c=mapNear(CL,x,z);return M.classes[c]||null;};
// the overlays' colours (linear RGB) at a point: the Köppen class's and the biome overlay's, as the scale model paints
// them, read from the raw map pixel (no warp: the overlay shows the data as it is)
let CLC=null,BIC=null;const GREY=[.2,.2,.2];
W.classColour=(x,z)=>{if(!CLC)CLC=M.classes.map(c=>lin(parseInt((c.color||'#888').slice(1),16)));return CLC[mapNear(CL,x,z)]||GREY;};
W.biomeColour=(x,z)=>{if(!BIC)BIC=M.biomes.map(b=>lin(parseInt((b.colour||'#888').slice(1),16)));return BIC[mapNear(BI,x,z)]||GREY;};
W.pressure=h=>M.pressure.atm0*Math.exp(-h/M.pressure.scale_m);
// how salt the water is, 0..1: the share of salt classes (abyssal salt lake, abyssal desert, salt flats) among the four
// map pixels round the point, bilinear, so a lake's brine shades over a pixel rather than in 2 km squares
let SALTA=null;
W.saltAt=(x,z)=>{if(!SALTA){SALTA=new Float32Array(CL.length);for(let i=0;i<CL.length;i++){const c=M.classes[CL[i]];SALTA[i]=c&&(c.code==='WX'||c.code==='XW'||c.code==='XS')?1:0;}}
 return mapBil(SALTA,x,z);};

// ---------------------------------------------------------------- the drainage network and the escarpments: KLAND's
W.unwarp=(qx,qz)=>LAND.unwarp(qx,qz);
W.riverLines=step=>LAND.riverLines(step);
W.carveAt=(x,z)=>{const c=LAND.carveAt(x,z,LAND.baseH(x,z),.5,{});return c.d<1e9?Object.assign({},c):null;};

// ---------------------------------------------------------------- the roads: highways between the settlements
// WORLD_DATA.roads (data/roads.json, routed by 42-world-roads.js and baked by bake.py): each road a centre line every
// ~20 m with its finished height (the grade held to 8 %, so it cuts and fills), and a half-width. Near a road the
// ground is held between two envelopes: above a road the land may rise no faster than its bank (BANK m a metre from
// the shoulder's edge: a cut), below it fall no faster (a fill); on the carriageway and its shoulder both are the road's
// height, so the ground is exactly it. Every segment near a point bounds it (the lowest cut, the highest fill), so the
// legs of a switchback and the roads at a junction each keep their level unless their banks truly clash (then the
// middle). Min and max of continuous bounds stay continuous; the bounds fade out between RREACH-20 and RREACH. A
// settlement's own ground is its build's: a road stops just outside the settlement's footprint (the routing trims it).
const RDC=1024,RREACH=150,BANK=.8;let RSEG=null,RHASH=null;const RD={w:0,d:1e9,hw:0,e:0,lo:0,hi:0};
function buildRoads(){const R=(WORLD_DATA.roads&&WORLD_DATA.roads.roads)||[],S=[];
 for(const r of R){const P=r.pts;for(let i=0;i<P.length-1;i++)S.push(P[i][0],P[i][1],P[i+1][0],P[i+1][1],P[i][2],P[i+1][2],r.hw);}
 RSEG=new Float64Array(S);RHASH=new Map();const n=RSEG.length/7;
 for(let s=0;s<n;s++){const o=s*7,x0=Math.min(RSEG[o],RSEG[o+2])-RREACH,x1=Math.max(RSEG[o],RSEG[o+2])+RREACH,z0=Math.min(RSEG[o+1],RSEG[o+3])-RREACH,z1=Math.max(RSEG[o+1],RSEG[o+3])+RREACH;
  for(let iz=Math.floor(z0/RDC);iz<=Math.floor(z1/RDC);iz++)for(let ix=Math.floor(x0/RDC);ix<=Math.floor(x1/RDC);ix++){const k=(ix+32768)*65536+(iz+32768);
   let a=RHASH.get(k);if(!a){a=[];RHASH.set(k,a);}a.push(s);}}
 W.roadCount=R.length;W.roadSegments=n;}
// the roads' bounds at (x,z): fills RD {lo, hi: the envelopes, w: how much they apply (0 beyond reach), d, hw and e of
// the nearest segment}. bound(h) is the ground h held between them
function roadAt(x,z,h,o){o.w=0;o.d=1e9;o.hw=0;o.e=h;o.lo=-1e9;o.hi=1e9;if(!RHASH)return o;
 const L=RHASH.get((Math.floor(x/RDC)+32768)*65536+(Math.floor(z/RDC)+32768));if(!L)return o;
 for(let i=0;i<L.length;i++){const s=L[i]*7,ax=RSEG[s],az=RSEG[s+1],dx=RSEG[s+2]-ax,dz=RSEG[s+3]-az,l2=dx*dx+dz*dz;
  let t=l2>0?((x-ax)*dx+(z-az)*dz)/l2:0;t=t<0?0:t>1?1:t;const ex=ax+dx*t-x,ez=az+dz*t-z,d=Math.sqrt(ex*ex+ez*ez);
  if(d>RREACH)continue;const hw=RSEG[s+6],e=lerp(RSEG[s+4],RSEG[s+5],t),b=Math.max(0,d-hw-1.5)*BANK;
  if(d<o.d){o.d=d;o.hw=hw;o.e=e;}
  if(e+b<o.hi)o.hi=e+b;if(e-b>o.lo)o.lo=e-b;}
 if(o.d<1e9)o.w=1-smooth(RREACH-20,RREACH,o.d);
 return o;}
function bound(h,o){const c=o.lo>o.hi?(o.lo+o.hi)/2:h<o.lo?o.lo:h>o.hi?o.hi:h;return lerp(h,c,o.w);}
// the distance (m) from (x,z) to the nearest road's edge (1e9 with none near): what the flora and the floor keep off
W.roadD=(x,z)=>{roadAt(x,z,0,RD);return RD.d<1e9?RD.d-RD.hw:1e9;};
W.road=(x,z)=>{const h=H(x,z,0,null,true);roadAt(x,z,h,RD);return RD.d<1e9?{d:RD.d,hw:RD.hw,w:RD.w,e:RD.e}:null;};
// how much of a road's carriageway covers (x,z), 0..1, prefiltered for a grid of spacing sp (m): a far terrain chunk
// draws a road narrower than its spacing as a faint band rather than losing it between vertices
W.roadCover=(x,z,sp)=>{if(!RHASH)return 0;roadAt(x,z,0,RD);if(RD.d>RREACH)return 0;const e=Math.max(.6,sp*.5);
 return clamp((RD.hw-RD.d)/e+.5,0,1)*Math.min(1,2*RD.hw/Math.max(sp,1e-3));};

// ---------------------------------------------------------------- the towns: a built settlement's own ground
// WORLD_DATA.towns (data/towns.json, written by bake.py from each settlement's build): where each town stands (x, z),
// its turn (rot, radians: world = turn(local - centre) + (x, z)), its footprint radius R and a blend band, and its own
// ground: a height grid in its local frame ('grid': the build's terrainH every step m, as Int16 steps of s m round h0) or flat
// at its local 0 (an Ancients site, whose landform is its own meshes). y0 lifts the town's local heights onto the land:
// the land's height at the town's centre less the town's own ground there, found once at init.
// Inside R the land takes the town's ground: 3 m under it where the town draws its own ground mesh (the tile covers
// it, streets and all), at it where the town is flat (the land is its plain); from R to R+band it eases back to the land.
let TOWNS=[];
function townGround(t,lx,lz){const g=t.grid;if(!g)return 0;
 const u=clamp((lx-g.x0)/g.step,0,g.n-1.0001),v=clamp((lz-g.z0)/g.step,0,g.n-1.0001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,o=j*g.n+i,A=g.h;
 return g.h0+((A[o]*(1-fu)+A[o+1]*fu)*(1-fv)+(A[o+g.n]*(1-fu)+A[o+g.n+1]*fu)*fv)*g.s;}
function townLocal(t,x,z){const dx=x-t.x,dz=z-t.z,c=Math.cos(t.rot),s=Math.sin(t.rot);
 return [t.cx+dx*c-dz*s,t.cz+dx*s+dz*c];}   // the inverse of world = Ry(rot)(local - centre) + (x, z) (three.js's rotation.y)
function buildTowns(){const D=(WORLD_DATA.towns&&WORLD_DATA.towns.towns)||[];
 TOWNS=D.map(t=>{const o={name:t.name,x:t.x,z:t.z,rot:t.rot||0,cx:t.centre?t.centre[0]:0,cz:t.centre?t.centre[1]:0,R:t.R,band:t.band||400,
  own:!!t.grid,grid:null,y0:0};
  if(t.grid){const b=atob(t.grid.h),a=new Int16Array(b.length/2);for(let i=0;i<a.length;i++)a[i]=(b.charCodeAt(2*i)|b.charCodeAt(2*i+1)<<8)<<16>>16;
   o.grid={n:t.grid.n,step:t.grid.step,x0:t.grid.x0,z0:t.grid.z0,h0:t.grid.h0,s:t.grid.s||.01,h:a};}
  // the lift: the land's height at the anchor (the town's centre unless the bake names a point of its frame) less the
  // town's own ground there
  const A=t.anchor||[o.cx,o.cz],c=Math.cos(o.rot),s=Math.sin(o.rot),ax=o.x+(A[0]-o.cx)*c+(A[1]-o.cz)*s,az=o.z-(A[0]-o.cx)*s+(A[1]-o.cz)*c;
  o.y0=H(ax,az,0,null,true,true)-townGround(o,A[0],A[1]);
  if(t.onWater){const wl=W.lakeWater(o.x,o.z);if(wl>-1e8)o.y0=wl;}   // a town on its water: its local 0 on the lake's surface
  if(t.y0!=null)o.y0=t.y0;   // a fixed lift, where the bake set one
  return o;});
 W.towns=TOWNS;}
// the town's pull at (x,z): returns the town or null, and fills TW {w, h}: w 1 inside R easing to 0 at R+band
const TW={w:0,h:0,t:null};
function townAt(x,z){TW.w=0;TW.t=null;
 for(let i=0;i<TOWNS.length;i++){const t=TOWNS[i],d=Math.hypot(x-t.x,z-t.z);if(d>=t.R+t.band)continue;
  const L=townLocal(t,x,z);let g;
  if(d<=t.R){g=townGround(t,L[0],L[1])+t.y0;if(t.own)g-=3*smooth(t.R,t.R-30,d);TW.w=1;}
  else{const k=t.R/d,E=townLocal(t,t.x+(x-t.x)*k,t.z+(z-t.z)*k);g=townGround(t,E[0],E[1])+t.y0;TW.w=1-smooth(t.R,t.R+t.band,d);}
  TW.h=g;TW.t=t;return TW;}
 return TW;}
// 0..1: how far into a town's ground (x,z) is; the flora and the floor keep off where it is over 0
W.townW=(x,z)=>{for(let i=0;i<TOWNS.length;i++){const t=TOWNS[i],d=Math.hypot(x-t.x,z-t.z);if(d<t.R+60)return 1;}return 0;};

// ---------------------------------------------------------------- the height
// The land is KLAND's (L.H: the scale model's heights, the style's detail, the channels' carve and the cliffs), then this
// world's own: the land hook, the towns' ground and the roads. P (optional) receives the parts the fields need (base,
// relief, the style blend, the channel's distance and cut: KLAND's) and the road's cover.
// nr: leave the roads out (the routing reads the land as it was); nt: leave the towns out
function H(x,z,minWave,P,nr,nt){minWave=minWave||0;
 let h=LAND.H(x,z,minWave,P);
 // a world's own shaping of its land (W.landHook: openworld/isle-demo's coast, reef and mangrove flats); none here
 if(W.landHook)h=W.landHook(x,z,h,minWave);
 // a town's own ground: inside its footprint the land is the town's, easing back over its band
 if(!nt&&TOWNS.length){townAt(x,z);if(TW.w>0)h=lerp(h,TW.h,TW.w);}
 // the roads, last: the carriageway is level at the road's height whatever the detail did (a road stops outside a
 // town's footprint, and was routed over the land with the towns in it, so it meets the town's ground at its edge)
 let rw=0;if(!nr&&RHASH){roadAt(x,z,h,RD);if(RD.w>0){h=bound(h,RD);rw=RD.d<=RD.hw+1.5?1:0;}}
 if(P)P.road=rw;
 return h;}
W.H=(x,z,minWave)=>H(x,z,minWave||0,null);
W.Hbare=(x,z,minWave)=>H(x,z,minWave||0,null,true,true);   // the land alone: no roads, no towns
W.Hland=(x,z,minWave)=>H(x,z,minWave||0,null,true,false);  // the land with the towns' ground, no roads: what the routing reads
W.baseH=(x,z)=>LAND.baseH(x,z);

// ---------------------------------------------------------------- the water: the sea and the lakes from the scale model, and its named rivers (KLAND's)
W.lakeWater=(x,z)=>LAND.lakeWater(x,z);
const riverWater=(x,z)=>LAND.riverWater(x,z);
W.riverWater=riverWater;

// ---------------------------------------------------------------- the water bodies (core/water: one surface each)
// Each 4-connected run of wet cells at one level (to half a metre) is a body. Cell (i,j)'s centre is the full pixel
// ((i+i0)/su, (j+j0)/sv), so in metres x = ((i+i0)/su - cx)*2000 (cells of 2000/su by 2000/sv m, about 4 km). Its mask
// covers its cells and the ring of cells round them (where lakeWater's plane runs on under the shore), refined in the ring
// by a flood (refineMask: the shore at about 500 m; near the camera core/water's shore grid decides it at 32 m), so a
// body never shows in a basin that is not its own: the abyss's floors under the sea's level stay dry.
let BODY=null,BODIES=null;
// The ring is refined to an eighth of a cell (about 500 m): a sub-cell of the ring is water only when the flood from the
// body's own cells reaches it across sub-cells with a corner under the level (the ground at 250 m detail), so a hollow
// under the level beside a lake, beyond the shore window, stays dry too (the window floods at 32 m near the camera; this
// is generous, a corner low enough lets it in, so the window's flood is never cut by it). The body's cells stay water.
const MSUB=8;   // at most: a big body's mask stays under 4096 texels a side and 4 M in all
function refineMask(cells,data,mnx,mnz,mi0,mj0,x0,z0,cw,ch,lv){const F=Math.max(1,Math.min(MSUB,Math.floor(4096/Math.max(mnx,mnz)),Math.floor(Math.sqrt(4e6/(mnx*mnz))))),fnx=mnx*F,fnz=mnz*F,fw=cw/F,fh=ch/F,out=new Uint8Array(fnx*fnz),
  cor=new Float32Array((fnx+1)*(fnz+1)).fill(NaN),st=new Int32Array(fnx*fnz);let n=0;
 const cH=(a,b)=>{const o=b*(fnx+1)+a;let h=cor[o];if(h!==h){h=H(x0+a*fw,z0+b*fh,250,null);cor[o]=h;}return h;};
 const low=(a,b)=>Math.min(cH(a,b),cH(a+1,b),cH(a,b+1),cH(a+1,b+1))<lv;
 for(const k of cells){const i=k%nx-mi0,j=(k-k%nx)/nx-mj0;for(let b=0;b<F;b++)for(let a=0;a<F;a++){const o=(j*F+b)*fnx+i*F+a;out[o]=255;st[n++]=o;}}
 while(n){const o=st[--n],a=o%fnx,b=(o-a)/fnx;
  for(const [p,q] of [[a-1,b],[a+1,b],[a,b-1],[a,b+1]]){if(p<0||q<0||p>=fnx||q>=fnz)continue;const r=q*fnx+p;
   if(out[r]||!data[((q/F)|0)*mnx+((p/F)|0)]||!low(p,q))continue;out[r]=255;st[n++]=r;}}
 return{x0,z0,cell:fw,cellZ:fh,nx:fnx,nz:fnz,data:out};}
const cellX=i=>((i+i0)/su-cx)*2000,cellZ=j=>((j+j0)/sv-cy)*2000;
W.waterBodyAt=(x,z)=>{if(!BODY)W.waterBodies();const i=Math.round((cx+x/2000)*su-i0),j=Math.round((cy+z/2000)*sv-j0);return i<0||j<0||i>=nx||j>=ny?-1:BODY[j*nx+i];};
W.waterBodies=function(){if(BODIES)return BODIES;BODY=new Int32Array(nx*ny).fill(-1);BODIES=[];const q=[];
 for(let s0=0;s0<nx*ny;s0++){if(!WHAS[s0]||BODY[s0]>=0)continue;const id=BODIES.length,lv=WLV[s0],cells=[];BODY[s0]=id;q.length=0;q.push(s0);
  while(q.length){const k=q.pop(),i=k%nx,j=(k-i)/nx;cells.push(k);
   for(const n of [i>0?k-1:-1,i<nx-1?k+1:-1,j>0?k-nx:-1,j<ny-1?k+nx:-1])if(n>=0&&WHAS[n]&&BODY[n]<0&&Math.abs(WLV[n]-lv)<.5){BODY[n]=id;q.push(n);}}
  cells.sort((a,b)=>a-b);let i0b=nx,j0b=ny,i1b=0,j1b=0,salt=0;
  for(const k of cells){const i=k%nx,j=(k-i)/nx;i0b=Math.min(i0b,i);j0b=Math.min(j0b,j);i1b=Math.max(i1b,i);j1b=Math.max(j1b,j);salt+=W.saltAt(cellX(i),cellZ(j));}
  // the mask: the body's cells and the ring round them, one cell beyond on every side
  const mi0=i0b-2,mj0=j0b-2,mnx=i1b-i0b+5,mnz=j1b-j0b+5,data=new Uint8Array(mnx*mnz);
  for(const k of cells){const i=k%nx,j=(k-i)/nx;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)data[(j-mj0+b)*mnx+(i-mi0+a)]=255;}
  const cw=2000/su,ch=2000/sv,x0=cellX(mi0)-cw/2,z0=cellZ(mj0)-ch/2;
  BODIES.push({id,level:lv,cells:cells.length,salt:salt/cells.length,
   mask:refineMask(cells,data,mnx,mnz,mi0,mj0,x0,z0,cw,ch,lv),
   box:[cellX(i0b-1)-cw/2,cellZ(j0b-1)-ch/2,cellX(i1b+1)+cw/2,cellZ(j1b+1)+ch/2]});}
 return BODIES;};
W.water=(x,z)=>Math.max(W.lakeWater(x,z),riverWater(x,z));   // a river's water where it is above a lake's (it runs into the lake at its mouth)

// ---------------------------------------------------------------- the whole sample
// W.at samples the height and its slope itself; a terrain chunk, which has its heights on a grid already, keeps the
// parts per vertex (W.Hp) and calls W.fieldsFrom with the grid's own slope.
const A={},PP={};
W.at=function(x,z){const h=H(x,z,0,PP),e=4,hx=H(x+e,z,0,null)-h,hz=H(x,z+e,0,null)-h;
 return fieldsFrom(x,z,h,Math.hypot(hx,hz)/e,PP,A);};
W.Hp=(x,z,minWave,P)=>H(x,z,minWave||0,P);
W.PARTS=['base','rel','cd','cut','cw','co','road','dune','rock','wallK'];
W.fieldsFrom=(x,z,h,tanS,P,out)=>fieldsFrom(x,z,h,tanS,P,out||{});
function fieldsFrom(x,z,h,tanS,PP,A){const slope=clamp(tanS*1.6,0,1),wl=W.water(x,z);
 const rain=W.rain(x,z),temp=W.temp(x,z),cc=mapNear(CL,x,z),code=CLCODE[cc]||'',grp=CLGROUP[cc]||'';
 A.x=x;A.z=z;A.h=h;A.water=wl;A.depth=wl-h;A.tanS=tanS;A.slope=slope;A.rain=rain;A.temp=temp;A.clim=code;A.group=grp;A.base=PP.base;A.rel=PP.rel;A.road=PP.road||0;
 // the channel: flow on its banks, canyon inside a cut deeper than 18 m, the rim a band outside the cut's lip
 const inCh=PP.cd<PP.co;
 const flow=PP.cd<1e8?1-smooth(PP.cw*.6,PP.cw+12+PP.cut*PP.wallK*.3,PP.cd):0;
 const can=inCh?smooth(12,40,PP.cut)*(1-smooth(PP.cw,PP.co*1.05,PP.cd)):0;
 const rim=PP.cd<1e8&&PP.cut>18?smooth(PP.co*.9,PP.co*1.1,PP.cd)*(1-smooth(PP.co*1.3,PP.co*1.3+120,PP.cd)):0;
 const nearW=wl>-1e8?smooth(40,0,h-wl):0;
 const rainK=smooth(150,1500,rain),dry=grp==='B'||code==='XW'||code==='XS';
 A.flow=flow;A.canyon=can;A.rim=rim;
 A.wet=clamp(Math.max(.05+rainK*(dry?.45:.9),flow*.9,nearW*.85,can*.6),0,1);
 A.dune=PP.dune*smooth(170,70,rain)*smooth(260,40,PP.rel)*smooth(.42,.6,N7.fbm(x/14000,z/14000,2));
 A.rock=clamp(Math.max(smooth(.3,.62,slope)*.9,PP.rock*smooth(.1,.35,slope)+PP.rock*.35*smooth(800,2400,PP.rel)),0,1);
 A.upland=clamp(.6*smooth(1400,4200,PP.base)+.4*smooth(250,1600,PP.rel),0,1);
 // salt crust: the abyss's salt classes, on its lowest flats only, in pans (not a sheet over the whole trough)
 A.salt=(code==='XS'||code==='WX'||code==='XW'?.85:0)*smooth(-1300,-1800,h)*smooth(.42,.62,N6.fbm(x/5200+13,z/5200-29,3));
 A.cold=smooth(12,-10,temp);A.oasis=0;A.abyss=0;A.mist=0;A.abyssUp=W.abyssUp(h);
 A.inside=mapNear(MK,x,z)>127;
 return A;};
// the abyss kit's own reading of the land: 'upland' is the height above the abyss floor (0 the lake shore .. 1 the top of
// the slope), not the plateau's mountains
W.abyssUp=(h)=>smooth(-1900,300,h);

// ---------------------------------------------------------------- the ground's colour
// From the overlay palettes (blended as the land is), the sample's fields and the height: sand on the dune seas, gravel
// and damp silt in the channels, salt crust in the abyss's flats, snow and ice where the mean is below freezing.
// Returns linear RGB in out[0..2] and the bedded-rock weight (the strata shader's) in out[3].
const GC=[0,0,0],_t=[0,0,0];
function mixc(o,c,t){o[0]+=(c[0]-o[0])*t;o[1]+=(c[1]-o[1])*t;o[2]+=(c[2]-o[2])*t;}
W.ground=function(x,z,S,out){const B=blendAt(x,z,BLEND);GC[0]=GC[1]=GC[2]=0;
 const n=N7.vn(x/37,z/37)-.5,n2=N6.fbm(x/900,z/900,2)-.5,pav=N5.fbm(x/240+5,z/240-2,2);
 for(let m=0;m<B.n;m++){const P=PALL[B.id[m]],w=B.w[m];
  _t[0]=P.a[0];_t[1]=P.a[1];_t[2]=P.a[2];mixc(_t,P.b,clamp(.5+n2*2.2,0,1));mixc(_t,P.pale,clamp(.25+n*.5,0,1)*.3);mixc(_t,P.b,smooth(.56,.7,pav)*.35);
  mixc(_t,P.scrub,clamp(.4*smooth(.2,.6,S.wet),0,1));
  mixc(_t,P.sand,S.dune*.9);
  mixc(_t,P.mtn,smooth(.2,.7,S.upland)*.5);
  mixc(_t,P.rock,S.rock*.55);
  const cg=S.canyon;if(cg>0){mixc(_t,P.gravel,cg*smooth(.2,.6,1-S.flow)*.8);}
  mixc(_t,P.silt,S.flow*.6);mixc(_t,P.damp,smooth(.6,.95,S.flow)*S.wet*.6);
  GC[0]+=_t[0]*w;GC[1]+=_t[1]*w;GC[2]+=_t[2]*w;}
 if(S.salt>0)mixc(GC,lin(SALT),S.salt*smooth(.3,.1,S.slope)*.7);
 if(S.temp<2){const sn=smooth(2,-6,S.temp)*smooth(.75,.45,S.slope);mixc(GC,lin(S.temp<-14?ICE:SNOW),sn);}
 const k=1+n*.12;out[0]=GC[0]*k;out[1]=GC[1]*k;out[2]=GC[2]*k;
 out[3]=clamp(S.rock*1.1-S.dune-S.salt,0,1)*(S.temp<-2?.4:1)*(1-(S.road||0));
 return out;};
return W;})();
