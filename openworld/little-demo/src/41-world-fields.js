// ================================================================= OPEN WORLD — fields: the land, the water, the climate, the biomes
// [G data] Plain maths of (x,z) over the region's rasters (WORLD_DATA, written by tools/scale-model/extract_region.py):
// no THREE, no DOM, no Math.random. Axes: metres, x east, z south, the origin at the region's centre pixel of the
// scale model, so x = (px - cx)*2000 and z = (py - cy)*2000. The noise is core/terrain's KRELIEF.noise (integer
// hashes, no Math.sin), so a Godot port grows the same land from the same rasters.
//
//   WORLD.init(R)              R: the decoded rasters (98-world-start.js): elev, wlev, whas, wflag on the height grid;
//                              clim, rain, temp, biome, mask on the map grid
//   WORLD.H(x,z,minWave)       the ground height. minWave (m) leaves out detail finer than it: a far terrain chunk
//                              asks for less, so it is cheaper and does not alias
//   WORLD.water(x,z)           the water surface there (the sea, a lake, a named river), or -1e9 where there is none
//   WORLD.lakeWater / riverWater  its two parts (the water sheet treats a river's banks apart from a lake's shore)
//   WORLD.at(x,z)              the whole sample at a point (one object, reused): height, slope, water, climate, the
//                              biome blend, and the fields the kits read (wet, flow, upland, canyon, rim, rock, dune,
//                              salt, cold, slope...). WORLD.FIELDS names them.
//   WORLD.kitW(kit,x,z)        0..1: how much of that kit's overlay is here. Overlays blend over ~3 km and their edges
//                              are warped by noise, so no border reads as the scale model's 2 km pixels
//   WORLD.inside(x,z)          inside the region's polygon
//   WORLD.ground(x,z,A,out)    the ground's colour (linear RGB) and its rock weight from a sample A (WORLD.at)
//   WORLD.px(x) / WORLD.py(z)  scale-model pixels; WORLD.fromPx(px,py) -> [x,z]
//
// The land: the scale model's heights (4 km cells) by Catmull-Rom, then detail in a style per biome (hills, ridges,
// terraces where the relief allows mesas, badland gullies, dune seas where it is dry and flat, roughness), then the
// drainage network carved in: each channel's bed follows the scale model's own flow line, never above the local ground
// less its depth, so where the detail raises a hill across a channel the channel cuts a gorge through it. The
// channels give the kits their canyons, rims, banks and wet ground.
var WORLD=(function(){'use strict';
const W={ready:false};
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
const KN=KRELIEF.noise;
const N1=KN(101),N2=KN(202),N3=KN(303),N4=KN(404),N5=KN(505),NW=KN(606),N6=KN(707),N7=KN(808),NM=KN(909),NC=KN(1111),NS=KN(1212);
W.FIELDS=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','mist'];

// ---------------------------------------------------------------- the styles: how each biome's land is shaped
// hills/ridge scale the detail on the relief, terr the terraces (step m), dune the dune seas, gully the badland rills,
// rough the small relief, rock the bare-rock share, wallK how far a channel's wall leans (m out per m down)
const STYLES={
 desert:  {hills:1.0, ridge:.7, terr:.75,step:55,dune:1,  gully:.7, rough:1.0,rock:.25,wallK:.45},
 badland: {hills:1.1, ridge:1.1,terr:.55,step:30,dune:0,  gully:1.6,rough:1.2,rock:.55,wallK:.6},
 abyss:   {hills:.6,  ridge:.45,terr:.25,step:40,dune:.15,gully:.4, rough:.7, rock:.15,wallK:1.2},
 jungle:  {hills:.85, ridge:.4, terr:0,  step:40,dune:0,  gully:.5, rough:.8, rock:.05,wallK:1.8},
 highland:{hills:1.2, ridge:1.0,terr:.3, step:45,dune:0,  gully:.9, rough:1.1,rock:.35,wallK:.8},
 korona:  {hills:1.1, ridge:.9, terr:.65,step:80,dune:0,  gully:.5, rough:1.0,rock:.45,wallK:.5},
 volcanic:{hills:.9,  ridge:.8, terr:.1, step:40,dune:0,  gully:.8, rough:1.1,rock:.6, wallK:.8},
 dryland: {hills:.8,  ridge:.5, terr:.3, step:40,dune:.4, gully:.6, rough:.9, rock:.2, wallK:1.0},
 sea:     {hills:.5,  ridge:.3, terr:0,  step:40,dune:0,  gully:0,  rough:.5, rock:.05,wallK:2}};
const SKEYS=['hills','ridge','terr','step','dune','gully','rough','rock','wallK'];
// the overlay's name (lower case) -> its style; an overlay not listed takes 'desert'
const BIOME_STYLE={'sedesert':'desert','e badlands':'badland','e abysss':'abyss','hyperjungle':'jungle','e highlands':'highland',
 'n highlands':'highland','korona / ne':'korona','throne/volcano':'volcanic','crater drylands':'dryland','ring sea':'sea'};
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

// ---------------------------------------------------------------- the rasters
let M,nx,ny,i0,j0,su,sv,cx,cy,X0,Y0,MW,MH,EL,WLV,WHAS,REL,CL,RN,TP,BI,MK,SL,SU,SW;
let SID,KIT,STY,PALL,NB,CLCODE,CLGROUP;
// the kits (47-world-kits.js) are read at init: which overlay each grows on
let KITNAMES=[];W.KITS=KITNAMES;
W.init=function(R){M=WORLD_DATA.meta;const Hd=M.heights,F=M.frame;
 nx=Hd.grid[0];ny=Hd.grid[1];i0=Hd.origin_cell[0];j0=Hd.origin_cell[1];su=Hd.su;sv=Hd.sv;
 cx=F.origin_px[0];cy=F.origin_px[1];X0=F.box_px[0];Y0=F.box_px[1];MW=F.size_px[0];MH=F.size_px[1];
 EL=R.elev;WLV=R.wlev;WHAS=R.whas;CL=R.clim;RN=R.rain;TP=R.temp;BI=R.biome;MK=R.mask;SL=R.scarpL;SU=R.scarpU;SW=R.scarpW;
 // the relief: the range of heights over each cell's 3x3 neighbourhood (m): the detail scales with it
 REL=new Float32Array(nx*ny);
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){let lo=1e9,hi=-1e9;
  for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const v=EL[clamp(j+b,0,ny-1)*nx+clamp(i+a,0,nx-1)];if(v<lo)lo=v;if(v>hi)hi=v;}REL[j*nx+i]=hi-lo;}
 // the biome table: style and kit per overlay
 KITNAMES=WORLD_KITS.map(k=>k.name);W.KITS=KITNAMES;
 NB=M.biomes.length;SID=[];KIT=new Int8Array(NB).fill(-1);STY={};PALL=[];
 SKEYS.forEach(k=>STY[k]=new Float32Array(NB));
 M.biomes.forEach((b,i)=>{const st=BIOME_STYLE[b.name.toLowerCase()]||'desert';SID[i]=st;
  SKEYS.forEach(k=>STY[k][i]=STYLES[st][k]);KIT[i]=WORLD_KITS.findIndex(k=>k.overlay===b.name.toLowerCase());
  const P=PAL[st],o={};for(const k in P)o[k]=lin(P[k]);PALL[i]=o;});
 CLCODE=M.classes.map(c=>c.code);CLGROUP=M.classes.map(c=>c.group);
 buildChannels();buildRoads();buildTowns();W.ready=true;};
W.px=x=>cx+x/2000;W.py=z=>cy+z/2000;W.fromPx=(px,py)=>[(px-cx)*2000,(py-cy)*2000];
W.box=()=>{const F=M.frame.box_px;return[(F[0]-cx)*2000,(F[1]-cy)*2000,(F[2]-cx)*2000,(F[3]-cy)*2000];};

// ---------------------------------------------------------------- sampling
function cr(p0,p1,p2,p3,t){return p1+.5*t*(p2-p0+t*(2*p0-5*p1+4*p2-p3+t*(3*(p1-p2)+p3-p0)));}
function baseH(x,z){let u=(cx+x/2000)*su-i0,v=(cy+z/2000)*sv-j0;u=clamp(u,1,nx-2.0001);v=clamp(v,1,ny-2.0001);
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,A=EL;
 const r=k=>{const o=(j+k)*nx+i;return cr(A[o-1],A[o],A[o+1],A[o+2],fu);};
 return cr(r(-1),r(0),r(1),r(2),fv);}
function gridBil(A,x,z){let u=(cx+x/2000)*su-i0,v=(cy+z/2000)*sv-j0;u=clamp(u,0,nx-1.0001);v=clamp(v,0,ny-1.0001);
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,o=j*nx+i;
 return (A[o]*(1-fu)+A[o+1]*fu)*(1-fv)+(A[o+nx]*(1-fu)+A[o+nx+1]*fu)*fv;}
function mapBil(A,x,z){let u=cx+x/2000-X0,v=cy+z/2000-Y0;u=clamp(u,0,MW-1.0001);v=clamp(v,0,MH-1.0001);
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,o=j*MW+i;
 return (A[o]*(1-fu)+A[o+1]*fu)*(1-fv)+(A[o+MW]*(1-fu)+A[o+MW+1]*fu)*fv;}
function mapNear(A,x,z){const u=clamp(Math.round(cx+x/2000-X0),0,MW-1),v=clamp(Math.round(cy+z/2000-Y0),0,MH-1);return A[v*MW+u];}
// the overlay blend at a point: the four map pixels round the WARPED point, bilinear. Fills B {n, id[], w[]}
const BLEND={n:0,id:new Int32Array(4),w:new Float32Array(4)};
function blendAt(x,z,B){const wx=x+(NW.fbm(x/7000,z/7000,2)-.5)*2600,wz=z+(NW.fbm(x/7000+40,z/7000-17,2)-.5)*2600;
 let u=cx+wx/2000-X0,v=cy+wz/2000-Y0;u=clamp(u,0,MW-1.0001);v=clamp(v,0,MH-1.0001);
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,o=j*MW+i;
 const ids=[BI[o],BI[o+1],BI[o+MW],BI[o+MW+1]],ws=[(1-fu)*(1-fv),fu*(1-fv),(1-fu)*fv,fu*fv];
 B.n=0;for(let k=0;k<4;k++){let m=0;for(;m<B.n;m++)if(B.id[m]===ids[k])break;if(m===B.n){B.id[m]=ids[k];B.w[m]=0;B.n++;}B.w[m]+=ws[k];}
 return B;}
const SBL={};SKEYS.forEach(k=>SBL[k]=0);
function styleAt(x,z){const B=blendAt(x,z,BLEND);SKEYS.forEach(k=>{let s=0;for(let m=0;m<B.n;m++)s+=B.w[m]*STY[k][B.id[m]];SBL[k]=s;});return SBL;}
W.style=(x,z)=>Object.assign({},styleAt(x,z));
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

// ---------------------------------------------------------------- the drainage network
// The extractor's polylines (4 km steps), smoothed twice (Chaikin), the bed made to fall monotonically to the mouth.
// A spatial hash of the segments (4 km cells, each segment in every cell its reach can touch) answers "the nearest
// channel" in a handful of segments.
const CHC=4096,CHREACH=900;let SEG=null,CHASH=null;
// A named river (region.json 'rivers': the scale model's DATA.rivers) joins as a channel of its own width, its flow
// the accumulation that gives that width, flagged (slot 8: its water depth) so W.water gives it a surface.
function buildChannels(){const L=M.drainage.lines.slice(),S=[];
 for(const r of M.rivers||[]){const a=M.drainage.min_accum*Math.pow(10,(r.width_m-10)/55),line=r.line.map(p=>[p[0],p[1],a,p[2]]);line.riv=r.depth_m;L.push(line);}
 for(const line of L){let P=line.map(p=>({x:p[0],z:p[1],a:p[2],e:p[3]}));
  for(let it=0;it<2;it++){if(P.length<3)break;const Q=[P[0]];
   for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],m=(t)=>({x:lerp(a.x,b.x,t),z:lerp(a.z,b.z,t),a:lerp(a.a,b.a,t),e:lerp(a.e,b.e,t)});Q.push(m(.25),m(.75));}
   Q.push(P[P.length-1]);P=Q;}
  let lo=1e9;for(const p of P){lo=Math.min(lo,p.e);p.bed=lo;}
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];S.push(a.x,a.z,b.x,b.z,a.a,b.a,a.bed,b.bed,line.riv||0);}}
 SEG=new Float64Array(S);CHASH=new Map();const n=SEG.length/9;
 for(let s=0;s<n;s++){const o=s*9,x0=Math.min(SEG[o],SEG[o+2])-CHREACH,x1=Math.max(SEG[o],SEG[o+2])+CHREACH,z0=Math.min(SEG[o+1],SEG[o+3])-CHREACH,z1=Math.max(SEG[o+1],SEG[o+3])+CHREACH;
  for(let iz=Math.floor(z0/CHC);iz<=Math.floor(z1/CHC);iz++)for(let ix=Math.floor(x0/CHC);ix<=Math.floor(x1/CHC);ix++){const k=(ix+32768)*65536+(iz+32768);
   let a=CHASH.get(k);if(!a){a=[];CHASH.set(k,a);}a.push(s);}}
 W.channelCount=L.length;W.segmentCount=n;}
// The cut at (x,z) on ground h: every channel segment near the (warped) point cuts down to its bed with walls leaning
// wallK, and the ground takes the DEEPEST cut. A maximum of continuous cuts is continuous, so the land has no step where
// two channels' reaches meet or the nearest segment changes. Fills C: k the cut (m), and the distance, half-width, wall
// reach and depth of the segment that cut deepest (of the nearest one where none cuts), for the fields.
const CH={k:0,d:1e9,hw:0,co:0,cut:0};
function carveAt(x,z,h,wallK,C,SC){C.k=0;C.d=1e9;C.hw=0;C.co=0;C.cut=0;
 const qx=x+(NM.fbm(x/2600,z/2600,2)-.5)*440+(NM.vn(x/380,z/380)-.5)*60,qz=z+(NM.fbm(x/2600+31,z/2600-77,2)-.5)*440+(NM.vn(x/380+9,z/380+5)-.5)*60;
 const L=CHASH.get((Math.floor(qx/CHC)+32768)*65536+(Math.floor(qz/CHC)+32768));if(!L)return C;
 let nd=1e18;
 for(let i=0;i<L.length;i++){const o=L[i]*9,ax=SEG[o],az=SEG[o+1],dx=SEG[o+2]-ax,dz=SEG[o+3]-az,l2=dx*dx+dz*dz;
  let t=l2>0?((qx-ax)*dx+(qz-az)*dz)/l2:0;t=t<0?0:t>1?1:t;const ex=ax+dx*t-qx,ez=az+dz*t-qz,d=Math.sqrt(ex*ex+ez*ez);
  if(d>CHREACH)continue;
  const s=chanS(lerp(SEG[o+4],SEG[o+5],t)),hw=(10+s*55)*.5,depth=2+s*5,bed=SC&&SC.w>0?scarpOf(lerp(SEG[o+6],SEG[o+7],t),SC):lerp(SEG[o+6],SEG[o+7],t);   // a bed falls over the cliff as the land does: a cataract
  const Dc=h-Math.min(h-depth,bed-depth*.5),outer=Math.min(CHREACH-40,hw+6+Dc*wallK);
  const k=d<outer?Dc*(1-smooth(hw,outer,d)):0;
  if(k>C.k||(C.k===0&&d<nd)){if(k>C.k)C.k=k;nd=d;C.d=d;C.hw=hw;C.co=outer;C.cut=Dc;}}
 return C;}
// A river's water at (x,z): inside the bed of a river segment (slot 8 > 0), the carved ground at the channel's centre
// line abreast of the point plus the water depth (at most 70 % of the cut, so it stays below the banks); -1e9 elsewhere.
// The centre is found in the warped space the carve uses and brought back by the same offset, so the water lies in
// the carved bed and falls with it (down the valley's mouth, over a cliff: a cataract).
function riverWater(x,z){if(!CHASH)return -1e9;
 const qx=x+(NM.fbm(x/2600,z/2600,2)-.5)*440+(NM.vn(x/380,z/380)-.5)*60,qz=z+(NM.fbm(x/2600+31,z/2600-77,2)-.5)*440+(NM.vn(x/380+9,z/380+5)-.5)*60;
 const L=CHASH.get((Math.floor(qx/CHC)+32768)*65536+(Math.floor(qz/CHC)+32768));if(!L)return -1e9;
 let best=-1e9,bd=1e9,cxp=0,czp=0,wd=0;
 for(let i=0;i<L.length;i++){const o=L[i]*9;if(!(SEG[o+8]>0))continue;
  const ax=SEG[o],az=SEG[o+1],dx=SEG[o+2]-ax,dz=SEG[o+3]-az,l2=dx*dx+dz*dz;
  let t=l2>0?((qx-ax)*dx+(qz-az)*dz)/l2:0;t=t<0?0:t>1?1:t;const px=ax+dx*t,pz=az+dz*t,d=Math.hypot(px-qx,pz-qz);
  const s=chanS(lerp(SEG[o+4],SEG[o+5],t)),hw=(10+s*55)*.5;
  if(d<hw&&d<bd){bd=d;cxp=px-qx;czp=pz-qz;wd=Math.min(SEG[o+8],.7*(2+s*5));}}
 if(bd<1e9)best=H(x+cxp,z+czp,0,null,true)+wd;   // the land without a road's fill: a road crosses on a causeway
 return best;}
// a channel's size from its flow: strength s (0 at the threshold), width and depth (m)
const chanS=acc=>Math.max(0,Math.log10(acc/M.drainage.min_accum));
W.carveAt=(x,z)=>{const c=carveAt(x,z,baseH(x,z),.5,{});return c.d<1e9?Object.assign({},c):null;};

// ---------------------------------------------------------------- the escarpments: cliffs at 1:1
// Where the extractor marks an escarpment (the eastern abyss's rim: scarpw.png), the scale model's smooth rise from the
// floor's level L to the plateau's U is gathered into a cliff: a point's share t of the way up is sharpened round a
// centre c that noise moves (promontories and embayments), so the plateau runs level to the edge and the drop happens
// within a few hundred metres; a little of the old slope is kept as the talus at its foot. A channel's bed is
// sharpened by the same rule where it crosses, so a river leaves the plateau as a cataract (Verge's).
const SCR={w:0,L:0,U:0,c:.5};
function scarpAt(x,z,o){o.w=SW?gridBil(SW,x,z)/255:0;if(o.w<.01){o.w=0;return o;}
 o.L=gridBil(SL,x,z);o.U=gridBil(SU,x,z);if(o.U-o.L<300){o.w=0;return o;}
 o.c=.5+(NS.fbm(x/4500,z/4500,3)-.5)*.55+(NS.vn(x/900,z/900)-.5)*.12;return o;}
function scarpOf(v,o){const rise=o.U-o.L,t=clamp((v-o.L)/rise,0,1),ts=smooth(o.c-.045,o.c+.045,t),tk=ts*.88+t*.12;return v+o.w*(o.L+rise*tk-v);}

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
// P (optional) receives the parts the fields need: base, relief, the style blend, the channel's distance and cut.
// nr: leave the roads out (the routing reads the land as it was); nt: leave the towns out
function H(x,z,minWave,P,nr,nt){minWave=minWave||0;
 const SC=scarpAt(x,z,SCR),b=SC.w>0?scarpOf(baseH(x,z),SC):baseH(x,z),S=styleAt(x,z),rel=gridBil(REL,x,z);
 let h=b+(N1.fbm(x/6000,z/6000,4)-.5)*2*clamp(rel*.12,12,420)*S.hills*(1-.75*SC.w);   // the cliff's band keeps its plateau and floor level
 if(minWave<1700){const r=1-Math.abs(2*N2.fbm(x/1700,z/1700,3)-1);h+=(r*r-.35)*clamp(rel*.06,6,200)*S.ridge;}
 // terraces where the relief allows mesas: flat treads, risers a fraction of each step
 if(S.terr>.01&&minWave<600){const tm=S.terr*smooth(40,250,rel)*smooth(4200,1800,rel);
  if(tm>.01){const step=S.step*(.75+.5*N6.vn(x/9000,z/9000)),t=h/step,fl=Math.floor(t),f=t-fl,k=.14;
   const g=f<1-k?0:smooth(1-k,1,f);h=lerp(h,(fl+g)*step,tm);}}
 // dune seas: dry, flat and in patches; transverse ridges across the WNW wind, a gentle stoss and a steep lee
 if(S.dune>.01&&minWave<200){const dm=S.dune*smooth(170,70,mapBil(RN,x,z)*M.rain.scale_mm)*smooth(260,40,rel)*smooth(.42,.6,N7.fbm(x/14000,z/14000,2));
  if(dm>.01){const s=(x*.83+z*.55)/260+2.2*N7.fbm(x/1800,z/1800,2)+.5*N7.vn(x/400,z/400),f=s-Math.floor(s),p=f<.72?f/.72:(1-f)/.28;
   h+=dm*p*p*(3-2*p)*(10+14*N7.vn(x/3000,z/3000));}}
 if(minWave<420)h+=(N3.fbm(x/420,z/420,3)-.5)*2*(5+rel*.006)*S.rough;
 if(S.gully>.01&&minWave<240){const g=1-Math.abs(2*N4.fbm(x/240,z/240,2)-1);h-=S.gully*(3+rel*.004)*Math.pow(g,6)*2.2;}
 if(minWave<90)h+=(N3.vn(x/90+11,z/90-7)-.5)*2*(1.2+rel*.0015)*S.rough;
 // the channels: carve to the bed line (or the local ground less the depth, whichever is lower); the wall leans wallK
 let cd=1e9,cut=0,cw=0,co=0;
 if(minWave<400){carveAt(x,z,h,S.wallK,CH,SC);h-=CH.k;cd=CH.d;cut=CH.cut;cw=CH.hw;co=CH.co;}
 if(minWave<13)h+=(N5.vn(x/13,z/13)-.5)*1.1+(N5.vn(x/3.1+50,z/3.1)-.5)*.3;
 // the roads, last: the carriageway is level at the road's height whatever the detail did
 // a town's own ground: inside its footprint the land is the town's, easing back over its band
 if(!nt&&TOWNS.length){townAt(x,z);if(TW.w>0)h=lerp(h,TW.h,TW.w);}
 // the roads, last: the carriageway is level at the road's height whatever the detail did (a road stops outside a
 // town's footprint, and was routed over the land with the towns in it, so it meets the town's ground at its edge)
 let rw=0;if(!nr&&RHASH){roadAt(x,z,h,RD);if(RD.w>0){h=bound(h,RD);rw=RD.d<=RD.hw+1.5?1:0;}}
 if(P){P.base=b;P.rel=rel;P.cd=cd;P.cut=cut;P.cw=cw;P.co=co;P.road=rw;SKEYS.forEach(k=>P[k]=S[k]);}
 return h;}
W.H=(x,z,minWave)=>H(x,z,minWave||0,null);
W.Hbare=(x,z,minWave)=>H(x,z,minWave||0,null,true,true);   // the land alone: no roads, no towns
W.Hland=(x,z,minWave)=>H(x,z,minWave||0,null,true,false);  // the land with the towns' ground, no roads: what the routing reads
W.baseH=baseH;

// ---------------------------------------------------------------- the water: the sea and the lakes from the scale model, and its named rivers
// The level of the nearest wet cell of the four round the point; -1e9 where none is wet. A lake's shore is where its
// plane meets the ground.
W.lakeWater=function(x,z){let u=(cx+x/2000)*su-i0,v=(cy+z/2000)*sv-j0;u=clamp(u,0,nx-1.0001);v=clamp(v,0,ny-1.0001);
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;let best=-1e9,bw=-1;
 for(let b=0;b<2;b++)for(let a=0;a<2;a++){const o=(j+b)*nx+i+a;if(!WHAS[o])continue;const w=(a?fu:1-fu)*(b?fv:1-fv);if(w>bw){bw=w;best=WLV[o];}}
 if(bw<0){// the edge of a water body: look one ring further, so the plane runs under the shore
  for(let b=-1;b<=2;b++)for(let a=-1;a<=2;a++){const o=clamp(j+b,0,ny-1)*nx+clamp(i+a,0,nx-1);if(WHAS[o]&&WLV[o]>best)best=WLV[o];}}
 return best;};
W.riverWater=riverWater;
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
