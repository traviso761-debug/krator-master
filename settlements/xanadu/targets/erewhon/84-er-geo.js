// ================================================================= EREWHON — geometry (target: erewhon)
// The terrain of the Pearl of Xanadu comes from Travis's map (tools/erewhon-map.py → 83-er-data.js): heights at 8 m
// and ground classes at 4 m. Metres; x east, z SOUTH (the lake is north, −z; the mountain south, +z); origin at the
// map's centre. The biome's own heightmap is a rough guide only — this one governs.
window.ER=true;window.CITY=true;
const ER={W:ER_DATA.W*ER_DATA.S,H:ER_DATA.H*ER_DATA.S,S:ER_DATA.S,LAKE:-.5,QUALITY:1,CHUNK:480,BUDGET:25000000,
 CLS:{water:0,flat:1,steep:2,ridge:3,unbuild:4,cliff:5}};
const SEED_ER=717171;
window.DOORS=[];   // every door the builders place ({x,z,ry,y,key}); the Doors overlay draws them
function smoothstep(e0,e1,x){const t=clamp((x-e0)/(e1-e0),0,1);return t*t*(3-2*t);}
// ---------------------------------------------------------------- the height field (uint16 decimetres, offset 40 m) and the class field (RLE)
const ER_H=(function(){const d=ER_DATA.h8,bin=atob(d.b64),n=bin.length/2,out=new Float32Array(n);for(let i=0;i<n;i++){const v=bin.charCodeAt(2*i)|(bin.charCodeAt(2*i+1)<<8);out[i]=v*d.k-d.off;}return{w:d.w,h:d.h,a:out,cell:ER_DATA.S*4};})();
const ER_C=(function(){const d=ER_DATA.c4,bin=atob(d.b64),out=new Uint8Array(d.w*d.h);let o=0;for(let i=0;i<bin.length;i+=2){const v=bin.charCodeAt(i),n=bin.charCodeAt(i+1);for(let k=0;k<n;k++)out[o++]=v;}return{w:d.w,h:d.h,a:out,cell:ER_DATA.S*2};})();
function terrainBase(x,z){const H=ER_H;const u=clamp((x+ER.W/2)/H.cell,0,H.w-1.001),v=clamp((z+ER.H/2)/H.cell,0,H.h-1.001);const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
 const a=H.a[j*H.w+i],b=H.a[j*H.w+i+1],c=H.a[(j+1)*H.w+i],d=H.a[(j+1)*H.w+i+1];return (a*(1-fu)+b*fu)*(1-fv)+(c*(1-fu)+d*fu)*fv;}
function erClass(x,z){const C=ER_C;const i=clamp(Math.floor((x+ER.W/2)/C.cell),0,C.w-1),j=clamp(Math.floor((z+ER.H/2)/C.cell),0,C.h-1);return C.a[j*C.w+i];}
function onMap(x,z,m){m=m||0;return Math.abs(x)<ER.W/2-m&&Math.abs(z)<ER.H/2-m;}
// ---------------------------------------------------------------- levelled plots (the city flattens a disc under every landmark and every garden tile)
const FLATS=[],FLATCELL=64,FLATGRID={};
function cityFlat(x,z,r,apron,h){const f=[x,z,r,apron,h];FLATS.push(f);const R=r+apron;
 for(let iz=Math.floor((z-R)/FLATCELL);iz<=Math.floor((z+R)/FLATCELL);iz++)for(let ix=Math.floor((x-R)/FLATCELL);ix<=Math.floor((x+R)/FLATCELL);ix++){const k=ix+','+iz;(FLATGRID[k]||(FLATGRID[k]=[])).push(f);}return h;}
// ---------------------------------------------------------------- the benches (Travis): a street on a slope levels a lot's depth either side of itself to its own grade,
// so the plots between two contour streets are terraces and not a hillside. A bench is a polyline with the road's own
// base heights at its points; terrainH takes the nearest bench within its reach (B.W) and blends to the ground over
// BENCH_B. A street that fronts plots ('lot') reaches past its edge by a plot's depth (BENCH_LOT), so a house stands on
// the bench and not on the blend; where two benches overlap, the two nearest blend across their midline.
const BENCHES=[],BENCHCELL=48,BENCHGRID={},BENCH_W=10,BENCH_B=4,BENCH_LOT=13;
function benchReach(w){return w/2+1.8+BENCH_LOT;}
// the garden district's own ground: a stepped surface of cell levels (87-er-layout sets it); null outside
let GARDEN_HFN=null;
let GARDEN_RAMP=null;   // the eased bank above the garden (87-er-layout sets it)
let CIT_HFN=null;   // the citadel's stepped grounds (87-er-layout sets it)
function groundLevel(x,z){const k=CIT_HFN&&CIT_HFN(x,z);if(k!=null)return k;const g=GARDEN_HFN&&GARDEN_HFN(x,z);if(g!=null)return g;const b=terrainBase(x,z);const lv=LEVEL_FN&&LEVEL_FN(x,z,b);if(lv!=null)return lv;return GARDEN_RAMP?GARDEN_RAMP(x,z,b):b;}
let LEVEL_FN=null;   // the levelled region south of the garden (87-er-layout sets it)
// hs: the bench's own heights at its points (a stair's ramp, round 9c); else the ground's
function benchAdd(pts,W,hs){W=W||BENCH_W;const B={pts,W,h:hs||pts.map(p=>groundLevel(p[0],p[1]))};BENCHES.push(B);const R=W+BENCH_B;
 for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const x0=Math.min(a[0],b[0])-R,x1=Math.max(a[0],b[0])+R,z0=Math.min(a[1],b[1])-R,z1=Math.max(a[1],b[1])+R;
  for(let iz=Math.floor(z0/BENCHCELL);iz<=Math.floor(z1/BENCHCELL);iz++)for(let ix=Math.floor(x0/BENCHCELL);ix<=Math.floor(x1/BENCHCELL);ix++){const k=ix+','+iz;(BENCHGRID[k]||(BENCHGRID[k]=[])).push([B,i]);}}return B;}
// the level a point takes: each bench's nearest segment gives its own level (its grade blended to the ground over
// BENCH_B past its reach); the nearest two benches mix across the line between them, so overlapping terraces meet in
// a steep scarp rather than a seam
// the stream keeps its channel: a bench fades out within STREAM_KEEP of the stream's line (a street crossing it
// rides a bridge, 90b), so no terrace fills the channel and the water runs unbroken
const STREAM_KEEP=[4,9];let STREAMGRID=null;
function streamDist(x,z){if(!STREAMGRID){STREAMGRID={};for(const P of ER_LINES.stream)for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],R=STREAM_KEEP[1];
  for(let iz=Math.floor((Math.min(a[1],b[1])-R)/BENCHCELL);iz<=Math.floor((Math.max(a[1],b[1])+R)/BENCHCELL);iz++)for(let ix=Math.floor((Math.min(a[0],b[0])-R)/BENCHCELL);ix<=Math.floor((Math.max(a[0],b[0])+R)/BENCHCELL);ix++){const k=ix+','+iz;(STREAMGRID[k]||(STREAMGRID[k]=[])).push([a,b]);}}}
 const L=STREAMGRID[Math.floor(x/BENCHCELL)+','+Math.floor(z/BENCHCELL)];if(!L)return 1e9;let bd=1e9;
 for(const [a,b] of L){const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);bd=Math.min(bd,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}return bd;}
function benchH(x,z,h){const L=BENCHGRID[Math.floor(x/BENCHCELL)+','+Math.floor(z/BENCHCELL)];if(!L)return h;let cB=null,cd=1e9,ch=0,d1=1e9,l1=h,d2=1e9,l2=h;
 const sk=smoothstep(STREAM_KEEP[0],STREAM_KEEP[1],streamDist(x,z));if(sk<=0)return h;
 const take=()=>{if(!cB||cd>cB.W+BENCH_B)return;const k=(1-smoothstep(cB.W,cB.W+BENCH_B,cd))*sk,lv=h*(1-k)+ch*k;if(cd<d1){d2=d1;l2=l1;d1=cd;l1=lv;}else if(cd<d2){d2=cd;l2=lv;}};
 for(const [B,i] of L){if(B.dead)continue;if(B!==cB){take();cB=B;cd=1e9;}const a=B.pts[i],b=B.pts[i+1];const dx=b[0]-a[0],dz=b[1]-a[1],l2_=dx*dx+dz*dz||1;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2_,0,1);const d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);if(d<cd){cd=d;ch=B.h[i]*(1-t)+B.h[i+1]*t;}}
 take();if(d1===1e9)return h;if(d2===1e9)return l1;const w=smoothstep(-BENCH_B,BENCH_B,d2-d1);return l2+(l1-l2)*w;}
// the stream's water level at a point of its line: 1.4 m over the channel's bed, but under its banks (sampled 4.5 m
// either side) by 1.4 m, and never under the ground (round 9c: sampled only at the line's points, the ribbon floated over
// bridges and sank under the avenue between them)
function streamY(x,z){const c=terrainH(x,z);let bank=1e9;for(const [dx,dz] of[[4.5,0],[-4.5,0],[0,4.5],[0,-4.5]])bank=Math.min(bank,terrainH(x+dx,z+dz));return Math.max(c+.12,Math.min(bank-1.4,c+1.4));}
terrainH=function(x,z){const k=CIT_HFN&&CIT_HFN(x,z);const gk=k==null&&GARDEN_HFN&&inGarden(x,z,.5)?GARDEN_HFN(x,z):null;let h=k!=null?k:gk!=null?gk:benchH(x,z,groundLevel(x,z));/* no street bench reaches inside the citadel */const L=FLATGRID[Math.floor(x/FLATCELL)+','+Math.floor(z/FLATCELL)];
 if(L)for(const f of L){const d=Math.hypot(x-f[0],z-f[1]);if(d<f[2]+f[3]){const k=1-smoothstep(f[2],f[2]+f[3],d);h=h*(1-k)+f[4]*k;}}return h;};
function erSlope(x,z){const e=3;return Math.hypot(terrainBase(x+e,z)-terrainBase(x-e,z),terrainBase(x,z+e)-terrainBase(x,z-e))/(2*e);}
function erGrad(x,z){const e=3;return[(terrainBase(x+e,z)-terrainBase(x-e,z))/(2*e),(terrainBase(x,z+e)-terrainBase(x,z-e))/(2*e)];}
// map pixel → world, for the district centres read off the picture
const MP=(px,py)=>[(px-ER_DATA.W/2)*ER.S,(py-ER_DATA.H/2)*ER.S];
// polylines from the map (world metres)
const ER_LINES=ER_DATA.lines;
// ---------------------------------------------------------------- the Pleasure Dome's island is land all round the dome
// (Travis, round 9c): its lagoon and bays were lake 4–18 m deep inside the rim. The island is the land flood-filled
// from its centre; inside that land's convex hull the ground rises to ISLAND_LEVEL, sloping into the lake over the
// hull's last ISLAND_RAMP metres. terrainBase is wrapped, so everything downstream (paint, class, benches) sees it
const ISLAND_C=MP(615,200),ISLAND_LEVEL=.8,ISLAND_RAMP=10;   // the 'Pleasure island' district's centre (DIST, 87-er-layout)
const ISLAND=(function(){const raw=terrainBase,S=4,N=45,land=(i,j)=>raw(ISLAND_C[0]+i*S,ISLAND_C[1]+j*S)>ER.LAKE+.3;
 let seed=null;for(let r=0;r<=N&&!seed;r++)for(let i=-r;i<=r&&!seed;i++)for(let j=-r;j<=r;j++)if(Math.max(Math.abs(i),Math.abs(j))===r&&land(i,j)){seed=[i,j];break;}if(!seed)return null;
 const seen=new Set([seed+'']),st=[seed],P=[];while(st.length){const [i,j]=st.pop();P.push([ISLAND_C[0]+i*S,ISLAND_C[1]+j*S]);for(const [a,b] of[[1,0],[-1,0],[0,1],[0,-1]]){const k=(i+a)+','+(j+b);if(seen.has(k)||Math.abs(i+a)>N||Math.abs(j+b)>N||!land(i+a,j+b))continue;seen.add(k);st.push([i+a,j+b]);}}
 P.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],hi=[];   // the hull, counter-clockwise (monotone chain)
 for(const p of P){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}for(let i=P.length-1;i>=0;i--){const p=P[i];while(hi.length>1&&cr(hi[hi.length-2],hi[hi.length-1],p)<=0)hi.pop();hi.push(p);}
 const H=lo.slice(0,-1).concat(hi.slice(0,-1));let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of H){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}
 // the inward distance to the hull's edge (negative outside)
 const edge=(x,z)=>{if(x<x0-40||x>x1+40||z<z0-40||z>z1+40)return -1e9;let d=1e9;for(let i=0;i<H.length;i++){const a=H[i],b=H[(i+1)%H.length],l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;d=Math.min(d,((b[0]-a[0])*(z-a[1])-(b[1]-a[1])*(x-a[0]))/l);}return d;};
 return{hull:H,edge};})();
if(ISLAND){const raw=terrainBase;terrainBase=function(x,z){const h=raw(x,z);if(h>=ISLAND_LEVEL)return h;const e=ISLAND.edge(x,z);if(e<=0)return h;return h+(ISLAND_LEVEL-h)*smoothstep(0,ISLAND_RAMP,e);};}
// nearest point on a polyline set: {x,z,d,seg:[a,b]}
function nearestOnLines(lines,x,z){let best=null;for(const P of lines)for(let i=0;i<P.length-1;i++){const ax=P[i][0],az=P[i][1],bx=P[i+1][0],bz=P[i+1][1];const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1;const t=clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1);
 const qx=ax+dx*t,qz=az+dz*t,d=Math.hypot(x-qx,z-qz);if(!best||d<best.d)best={x:qx,z:qz,d,a:P[i],b:P[i+1]};}return best;}
const FRAME_HOOKS_PRE_ER=[];
