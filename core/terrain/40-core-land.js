// ================================================================= CORE — land: the open world's ground from the Krator Scale Model
// [G data] The ground rule every open-world region and every settlement built in place on the scale model share. Plain
// maths of (x,z) over a region's rasters (tools/scale-model/extract_region.py: region.json and the PNGs, decoded to typed
// arrays by the host): no THREE, no DOM, no Math.random. The noise is KRELIEF.noise (38-core-relief.js: integer hashes),
// so a Godot port grows the same land from the same rasters. Lifted from openworld/little-demo/src/41-world-fields.js
// (2026-10-19); that fragment now composes its towns, roads and fields on top of this.
//
// Axes: metres, x east, z south, the origin at the region's centre pixel of the scale model, so x = (px - cx)*2000 and
// z = (py - cy)*2000. One instance per region; nothing is shared between instances but the tables.
//
//   KLAND.create(meta, R, opts)  -> L
//       meta  region.json (frame, heights, biomes, drainage, rivers, rain)
//       R     the decoded rasters: elev, wlev, whas, wflag, scarpL, scarpU, scarpW on the height grid (Float32 / Uint8);
//             clim, rain, temp, biome, mask on the map grid (Uint8)
//       opts  {styles, biomeStyle}: a world's own style table and overlay -> style map (defaults KLAND.STYLES,
//             KLAND.BIOME_STYLE; an overlay not listed takes 'desert')
//   L.H(x,z,minWave,P)         the land's height. minWave (m) leaves out detail finer than it: a far terrain chunk asks
//                              for less, so it is cheaper and does not alias. P (optional) receives the parts the fields
//                              read: base, rel, cd, cut, cw, co and the style blend (L.SKEYS)
//   L.baseH(x,z)               the scale model's heights alone (Catmull-Rom on the 4 km cells)
//   L.lakeWater(x,z)           the sea's or a lake's level there (the nearest wet cell of the four round the point), or -1e9
//   L.riverWater(x,z)          a named river's water surface inside its bed, or -1e9. It reads L.hostH (default L.H), the
//                              host's land with its towns in: a world that lays towns sets L.hostH = its own height
//   L.riverLines(step)         each named river as a line in metres down its carved bed, at its water's height
//   L.carveAt(x,z,h,wallK,C,SC)  the channels' cut at (x,z) on ground h: fills C {k, d, hw, co, cut}
//   L.scarpAt(x,z,o) / L.scarpOf(v,o)  the escarpment rule: where the extractor marks a scarp, a value v between the
//                              floor L and the plateau U is gathered into a cliff
//   L.styleAt(x,z)             the style blend at a point (one object, reused); L.blendAt(x,z,B) the overlay blend
//   L.gridBil(A,x,z) / L.mapBil(A,x,z) / L.mapNear(A,x,z)  samplers on the height grid and the map grid
//   L.unwarp(qx,qz)            the inverse of the channels' warp
//   L.px(x), L.py(z), L.fromPx(px,py), L.box()   the frame
//   L.M, L.R, L.nx, L.ny, L.i0, L.j0, L.su, L.sv, L.cx, L.cy, L.X0, L.Y0, L.MW, L.MH   the grids
//   L.EL, L.WLV, L.WHAS, L.REL, L.CL, L.RN, L.TP, L.BI, L.MK, L.SL, L.SU, L.SW   the rasters (REL: the relief per cell)
//   L.STY[key][biome], L.SID[biome]   the style table per overlay, the style's name per overlay
//   L.channelCount, L.segmentCount
//
// The land: the scale model's heights (4 km cells) by Catmull-Rom, then detail in a style per biome (hills, ridges,
// terraces where the relief allows mesas, badland gullies, dune seas where it is dry and flat, roughness), then the
// drainage network carved in: each channel's bed follows the scale model's own flow line, never above the local ground
// less its depth, so where the detail raises a hill across a channel the channel cuts a gorge through it. Where the
// extractor marks an escarpment the smooth rise is gathered into a cliff at 1:1.
var KLAND=(function(){'use strict';
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
const KN=KRELIEF.noise;

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
// the overlay's name (lower case) -> its style; an overlay not listed takes 'desert'. 'sw bay' (the Ring Sea's
// south-western shore: tropical rainforest, 4,000 mm; biomes/swbay) is 'jungle' (added for Hook, 2026-10-19).
const BIOME_STYLE={'sedesert':'desert','e badlands':'badland','e abysss':'abyss','hyperjungle':'jungle','e highlands':'highland',
 'n highlands':'highland','korona / ne':'korona','throne/volcano':'volcanic','crater drylands':'dryland','ring sea':'sea','sw bay':'jungle'};

function create(meta,R,opts){opts=opts||{};
const L={M:meta,R:R,STYLES:STYLES,SKEYS:SKEYS,hostH:null};
const STYLE=opts.styles||STYLES,BSTYLE=opts.biomeStyle||BIOME_STYLE;
const N1=KN(101),N2=KN(202),N3=KN(303),N4=KN(404),N5=KN(505),NW=KN(606),N6=KN(707),N7=KN(808),NM=KN(909),NS=KN(1212);

// ---------------------------------------------------------------- the rasters
const M=meta,Hd=M.heights,F=M.frame;
const nx=Hd.grid[0],ny=Hd.grid[1],i0=Hd.origin_cell[0],j0=Hd.origin_cell[1],su=Hd.su,sv=Hd.sv;
const cx=F.origin_px[0],cy=F.origin_px[1],X0=F.box_px[0],Y0=F.box_px[1],MW=F.size_px[0],MH=F.size_px[1];
const EL=R.elev,WLV=R.wlev,WHAS=R.whas,CL=R.clim,RN=R.rain,TP=R.temp,BI=R.biome,MK=R.mask,SL=R.scarpL,SU=R.scarpU,SW=R.scarpW;
// the relief: the range of heights over each cell's 3x3 neighbourhood (m): the detail scales with it
const REL=new Float32Array(nx*ny);
for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){let lo=1e9,hi=-1e9;
 for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const v=EL[clamp(j+b,0,ny-1)*nx+clamp(i+a,0,nx-1)];if(v<lo)lo=v;if(v>hi)hi=v;}REL[j*nx+i]=hi-lo;}
// the biome table: a style per overlay
const NB=M.biomes.length,SID=[],STY={};
SKEYS.forEach(k=>STY[k]=new Float32Array(NB));
M.biomes.forEach((b,i)=>{const st=BSTYLE[b.name.toLowerCase()]||'desert';SID[i]=st;SKEYS.forEach(k=>STY[k][i]=STYLE[st][k]);});
Object.assign(L,{nx,ny,i0,j0,su,sv,cx,cy,X0,Y0,MW,MH,EL,WLV,WHAS,REL,CL,RN,TP,BI,MK,SL,SU,SW,STY,SID});
L.px=x=>cx+x/2000;L.py=z=>cy+z/2000;L.fromPx=(px,py)=>[(px-cx)*2000,(py-cy)*2000];
L.box=()=>{const F=M.frame.box_px;return[(F[0]-cx)*2000,(F[1]-cy)*2000,(F[2]-cx)*2000,(F[3]-cy)*2000];};

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
Object.assign(L,{baseH,gridBil,mapBil,mapNear,blendAt,styleAt,BLEND});

// ---------------------------------------------------------------- the drainage network
// The extractor's polylines (4 km steps), smoothed twice (Chaikin), the bed made to fall monotonically to the mouth.
// A spatial hash of the segments (4 km cells, each segment in every cell its reach can touch) answers "the nearest
// channel" in a handful of segments.
const CHC=4096,CHREACH=900;let SEG=null,CHASH=null;const RIVSEG=[];
// A named river (region.json 'rivers': the scale model's DATA.rivers) joins as a channel of its own width, its flow
// the accumulation that gives that width, flagged (slot 8: its water depth) so the water gets a surface.
function buildChannels(){const L0=M.drainage.lines.slice(),S=[];
 for(const r of M.rivers||[]){const a=M.drainage.min_accum*Math.pow(10,(r.width_m-10)/55),line=r.line.map(p=>[p[0],p[1],a,p[2]]);line.riv=r.depth_m;line.name=r.name;line.width=r.width_m;L0.push(line);}
 for(const line of L0){let P=line.map(p=>({x:p[0],z:p[1],a:p[2],e:p[3]}));
  for(let it=0;it<2;it++){if(P.length<3)break;const Q=[P[0]];
   for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],m=(t)=>({x:lerp(a.x,b.x,t),z:lerp(a.z,b.z,t),a:lerp(a.a,b.a,t),e:lerp(a.e,b.e,t)});Q.push(m(.25),m(.75));}
   Q.push(P[P.length-1]);P=Q;}
  let lo=1e9;for(const p of P){lo=Math.min(lo,p.e);p.bed=lo;}
  if(line.riv)RIVSEG.push({name:line.name,width:line.width,s0:S.length/9,n:P.length-1});
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];S.push(a.x,a.z,b.x,b.z,a.a,b.a,a.bed,b.bed,line.riv||0);}}
 SEG=new Float64Array(S);CHASH=new Map();const n=SEG.length/9;
 for(let s=0;s<n;s++){const o=s*9,x0=Math.min(SEG[o],SEG[o+2])-CHREACH,x1=Math.max(SEG[o],SEG[o+2])+CHREACH,z0=Math.min(SEG[o+1],SEG[o+3])-CHREACH,z1=Math.max(SEG[o+1],SEG[o+3])+CHREACH;
  for(let iz=Math.floor(z0/CHC);iz<=Math.floor(z1/CHC);iz++)for(let ix=Math.floor(x0/CHC);ix<=Math.floor(x1/CHC);ix++){const k=(ix+32768)*65536+(iz+32768);
   let a=CHASH.get(k);if(!a){a=[];CHASH.set(k,a);}a.push(s);}}
 L.channelCount=L0.length;L.segmentCount=n;}
// The cut at (x,z) on ground h: every channel segment near the (warped) point cuts down to its bed with walls leaning
// wallK, and the ground takes the DEEPEST cut. A maximum of continuous cuts is continuous, so the land has no step where
// two channels' reaches meet or the nearest segment changes. Fills C: k the cut (m), and the distance, half-width, wall
// reach and depth of the segment that cut deepest (of the nearest one where none cuts), for the fields.
const CH={k:0,d:1e9,hw:0,co:0,cut:0};
function carveAt(x,z,h,wallK,C,SC){C.k=0;C.d=1e9;C.hw=0;C.co=0;C.cut=0;
 const qx=x+(NM.fbm(x/2600,z/2600,2)-.5)*440+(NM.vn(x/380,z/380)-.5)*60,qz=z+(NM.fbm(x/2600+31,z/2600-77,2)-.5)*440+(NM.vn(x/380+9,z/380+5)-.5)*60;
 const L1=CHASH.get((Math.floor(qx/CHC)+32768)*65536+(Math.floor(qz/CHC)+32768));if(!L1)return C;
 let nd=1e18;
 for(let i=0;i<L1.length;i++){const o=L1[i]*9,ax=SEG[o],az=SEG[o+1],dx=SEG[o+2]-ax,dz=SEG[o+3]-az,l2=dx*dx+dz*dz;
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
// the carved bed and falls with it (down the valley's mouth, over a cliff: a cataract). The ground is the host's
// (L.hostH: its land with its towns in, without a road's fill, which crosses on a causeway), or this land's.
function riverWater(x,z){if(!CHASH)return -1e9;
 const qx=x+(NM.fbm(x/2600,z/2600,2)-.5)*440+(NM.vn(x/380,z/380)-.5)*60,qz=z+(NM.fbm(x/2600+31,z/2600-77,2)-.5)*440+(NM.vn(x/380+9,z/380+5)-.5)*60;
 const L1=CHASH.get((Math.floor(qx/CHC)+32768)*65536+(Math.floor(qz/CHC)+32768));if(!L1)return -1e9;
 let best=-1e9,bd=1e9,cxp=0,czp=0,wd=0;
 for(let i=0;i<L1.length;i++){const o=L1[i]*9;if(!(SEG[o+8]>0))continue;
  const ax=SEG[o],az=SEG[o+1],dx=SEG[o+2]-ax,dz=SEG[o+3]-az,l2=dx*dx+dz*dz;
  let t=l2>0?((qx-ax)*dx+(qz-az)*dz)/l2:0;t=t<0?0:t>1?1:t;const px=ax+dx*t,pz=az+dz*t,d=Math.hypot(px-qx,pz-qz);
  const s=chanS(lerp(SEG[o+4],SEG[o+5],t)),hw=(10+s*55)*.5;
  if(d<hw&&d<bd){bd=d;cxp=px-qx;czp=pz-qz;wd=Math.min(SEG[o+8],.7*(2+s*5));}}
 if(bd<1e9)best=(L.hostH||H)(x+cxp,z+czp,0,null)+wd;
 return best;}
// The named rivers as lines in metres (core/water's flow lines). The channels are carved in WARPED space (q = p + warp(p),
// carveAt's noise), so a point down a segment is brought back to the world by the warp's inverse (a fixed point: the
// warp moves a point by at most 250 m and stretches it by under 0.7, so 24 steps settle it to well under a millimetre);
// its height is the river's water there (riverWater: 4.6 m over the carved floor). The floor is not monotone: where the
// land lies under the line's bed the carve follows the land, so it dips and climbs again (by up to 150 m across a
// depression). A sill up to RIVPOOL m holds a pool behind it (taken from the mouth upward: a point is lifted toward the
// next one's level by at most that); past it the water follows the floor up and down as the old sheet did, never under
// the floor and never a slab across a depression (a full fill floated it up to 228 m over the ground)
const RIVPOOL=2;
const warpQ=(x,z)=>[x+(NM.fbm(x/2600,z/2600,2)-.5)*440+(NM.vn(x/380,z/380)-.5)*60,z+(NM.fbm(x/2600+31,z/2600-77,2)-.5)*440+(NM.vn(x/380+9,z/380+5)-.5)*60];
L.unwarp=(qx,qz)=>{let x=qx,z=qz;for(let k=0;k<24;k++){const q=warpQ(x,z);x+=qx-q[0];z+=qz-q[1];}return[x,z];};
L.riverLines=function(step){step=step==null?40:step;const out=[];
 for(const Rv of RIVSEG){const pts=[];let carry=0;
  for(let s=Rv.s0;s<Rv.s0+Rv.n;s++){const o=s*9,ax=SEG[o],az=SEG[o+1],bx=SEG[o+2],bz=SEG[o+3],Ln=Math.hypot(bx-ax,bz-az);
   for(let d=carry;d<Ln;d+=step){const t=d/Ln,w=L.unwarp(ax+(bx-ax)*t,az+(bz-az)*t),y=riverWater(w[0],w[1]);if(y>-1e8)pts.push([w[0],w[1],y]);}
   carry=Ln>carry?carry+Math.ceil((Ln-carry)/step)*step-Ln:carry-Ln;}
  for(let i=pts.length-2;i>=0;i--)if(pts[i][2]<pts[i+1][2])pts[i][2]=Math.min(pts[i+1][2],pts[i][2]+RIVPOOL);
  out.push({name:Rv.name,width:Rv.width,pts});}
 return out;};
// a channel's size from its flow: strength s (0 at the threshold), width and depth (m)
const chanS=acc=>Math.max(0,Math.log10(acc/M.drainage.min_accum));
Object.assign(L,{carveAt,riverWater,chanS,CH});

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
Object.assign(L,{scarpAt,scarpOf,SCR});

// ---------------------------------------------------------------- the height
// P (optional) receives the parts the fields need: base, relief, the style blend, the channel's distance and cut.
function H(x,z,minWave,P){minWave=minWave||0;
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
 if(P){P.base=b;P.rel=rel;P.cd=cd;P.cut=cut;P.cw=cw;P.co=co;SKEYS.forEach(k=>P[k]=S[k]);}
 return h;}
L.H=H;

// ---------------------------------------------------------------- the water: the sea and the lakes from the scale model
// The level of the nearest wet cell of the four round the point; -1e9 where none is wet. A lake's shore is where its
// plane meets the ground.
L.lakeWater=function(x,z){let u=(cx+x/2000)*su-i0,v=(cy+z/2000)*sv-j0;u=clamp(u,0,nx-1.0001);v=clamp(v,0,ny-1.0001);
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;let best=-1e9,bw=-1;
 for(let b=0;b<2;b++)for(let a=0;a<2;a++){const o=(j+b)*nx+i+a;if(!WHAS[o])continue;const w=(a?fu:1-fu)*(b?fv:1-fv);if(w>bw){bw=w;best=WLV[o];}}
 if(bw<0){// the edge of a water body: look one ring further, so the plane runs under the shore
  for(let b=-1;b<=2;b++)for(let a=-1;a<=2;a++){const o=clamp(j+b,0,ny-1)*nx+clamp(i+a,0,nx-1);if(WHAS[o]&&WLV[o]>best)best=WLV[o];}}
 return best;};

buildChannels();
return L;}

return {create,STYLES,SKEYS,BIOME_STYLE};})();
if(typeof module!=='undefined'&&module.exports)module.exports=KLAND;
