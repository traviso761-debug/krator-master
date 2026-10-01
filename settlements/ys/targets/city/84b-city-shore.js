// ================================================================= YS CITY — the land–sea model (DESIGN §3; Voth's 10-core, 15-shore, 78b-life-nav)
// Built now, walked by nobody until the life layer, so that layer starts on a finished floor. Three things:
//  1. SHORE LOOPS addressed by arc length: the mainland coast plus every island and karst stack as the layout decides
//     them (ysLoopAdd), with ysNearestLoop(x,z) → the loop, the arc length, the distance, the tangent and the normal
//     toward the water, so harbours, pens and shore huts square themselves to whichever loop is nearest.
//  2. The SURFACE LATTICE: 12 m cells over the city core, classified ONCE after everything is built from the real
//     terrain and the real deck records (NAV_EXTRA): land | shallows | canal | open | deck | cliff; landDist(x,z) is the
//     signed distance to the waterline from a chamfer transform of that lattice (> 0 inland, < 0 under water), and
//     it sees decks (Voth's warning: a distance field alone cannot). waterDepth(x,z) reads the terrain.
//  3. HOSTS as cantons: hostEdge(h,dx,dz) is the exact distance to a host's cap edge along a bearing (a square's
//     corner lies at hw/max(|cos|,|sin|), not at hw); the nav grid blocks a cell from the exact cap plus NAV_MARGIN,
//     mid-route steering keeps steerMargin(r), and the two are never confused.
const SHORE_LOOPS=[];
function ysLoopAdd(name,pts,closed,extra){const P=pts.map(p=>[p[0],p[1]]);if(closed&&(P[0][0]!==P[P.length-1][0]||P[0][1]!==P[P.length-1][1]))P.push([P[0][0],P[0][1]]);
 const cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
 const L=Object.assign({name,pts:P,closed:!!closed,cum,len:cum[cum.length-1]},extra||{});SHORE_LOOPS.push(L);return L;}
function ysLoopCircle(name,cx,cz,r,n,extra){const pts=[];n=n||32;for(let i=0;i<n;i++){const a=i/n*TAU;pts.push([cx+r*Math.cos(a),cz+r*Math.sin(a)]);}return ysLoopAdd(name,pts,true,Object.assign({cx,cz,r},extra||{}));}
ysLoopAdd('mainland',CITY.SHORE,false);
// the point on a loop at arc length s (wrapping on a closed loop), its tangent, and the normal toward the water
function shoreAt(loop,s){if(loop.closed)s=((s%loop.len)+loop.len)%loop.len;else s=clamp(s,0,loop.len);let i=1;while(i<loop.cum.length-1&&loop.cum[i]<s)i++;
 const a=loop.pts[i-1],b=loop.pts[i];const seg=loop.cum[i]-loop.cum[i-1]||1;const t=(s-loop.cum[i-1])/seg;const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
 const tx=(b[0]-a[0])/seg,tz=(b[1]-a[1])/seg;let nx=-tz,nz=tx;if(terrainH(x+nx*9,z+nz*9)>terrainH(x-nx*9,z-nz*9)){nx=-nx;nz=-nz;}   // the normal points to the lower (wetter) side
 return {x,z,tx,tz,nx,nz,s,loop};}
function ysNearestLoop(x,z){let best=null;for(const L of SHORE_LOOPS){for(let i=1;i<L.pts.length;i++){const a=L.pts[i-1],b=L.pts[i];const dx=b[0]-a[0],dz=b[1]-a[1];const l2=dx*dx+dz*dz||1;
  const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);const qx=a[0]+dx*t,qz=a[1]+dz*t;const d=Math.hypot(x-qx,z-qz);if(!best||d<best.d)best={d,loop:L,s:L.cum[i-1]+t*Math.sqrt(l2)};}}
 if(!best)return null;const at=shoreAt(best.loop,best.s);at.d=best.d;return at;}
// ---------------------------------------------------------------- the surface lattice
const SURF={cell:12,x0:-500,z0:-1300,x1:1700,z1:1100,nx:0,nz:0,cls:null,dist:null,level:null,built:false};
const SURF_CLS=['land','shallows','canal','open','deck','cliff'];
function ysDeckAt(x,z){for(const d of NAV_EXTRA){if(d.kind==='hostfloor'){if(Math.hypot(x-d.x,z-d.z)<=d.r)return d;continue;}
 if(d.kind==='pad'){const cx=(d.x0+d.x1)/2,cz=(d.z0+d.z1)/2;if(Math.hypot(x-cx,z-cz)<=d.w/2)return d;continue;}
 if(d.a&&d.b){const ax=d.a[0],az=d.a[2],bx=d.b[0],bz=d.b[2];const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1;const t=clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1);if(Math.hypot(x-(ax+dx*t),z-(az+dz*t))<=d.w/2+.5)return d;continue;}
 if(x>=d.x0&&x<=d.x1&&z>=d.z0&&z<=d.z1)return d;}return null;}
function ysSurfBuild(){const c=SURF.cell;SURF.nx=Math.ceil((SURF.x1-SURF.x0)/c);SURF.nz=Math.ceil((SURF.z1-SURF.z0)/c);const n=SURF.nx*SURF.nz;
 SURF.cls=new Uint8Array(n);SURF.level=new Float32Array(n);const wet=new Uint8Array(n);const grid=typeof ysBlockIJ==='function';
 for(let j=0;j<SURF.nz;j++)for(let i=0;i<SURF.nx;i++){const x=SURF.x0+(i+.5)*c,z=SURF.z0+(j+.5)*c;const k=j*SURF.nx+i;const h=terrainH(x,z);
  const d=ysDeckAt(x,z);if(d){SURF.cls[k]=4;SURF.level[k]=d.y;continue;}
  SURF.level[k]=h;if(h>1.0){const sx=(terrainH(x+c,z)-terrainH(x-c,z))/(2*c),sz=(terrainH(x,z+c)-terrainH(x,z-c))/(2*c);SURF.cls[k]=Math.hypot(sx,sz)>1.2?5:0;continue;}
  wet[k]=h<0?1:0;if(h>-1.2){SURF.cls[k]=1;continue;}
  let canal=false;if(grid&&h>-6){const g=ysBlockIJ(x,z);const b=ysBlock(Math.round(g[0]),Math.round(g[1]));canal=!!(b&&b.kind!=='land');}SURF.cls[k]=canal?2:3;}
 // the signed distance to the waterline: a two-pass chamfer (3,4) on the wet mask, in both directions
 const INF=1e9;const dw=new Float32Array(n).fill(INF),dl=new Float32Array(n).fill(INF);
 for(let k=0;k<n;k++){if(wet[k])dw[k]=0;else dl[k]=0;}
 const pass=(D)=>{const W=SURF.nx,H=SURF.nz;for(let j=0;j<H;j++)for(let i=0;i<W;i++){const k=j*W+i;let v=D[k];if(i>0)v=Math.min(v,D[k-1]+3);if(j>0){v=Math.min(v,D[k-W]+3);if(i>0)v=Math.min(v,D[k-W-1]+4);if(i<W-1)v=Math.min(v,D[k-W+1]+4);}D[k]=v;}
  for(let j=H-1;j>=0;j--)for(let i=W-1;i>=0;i--){const k=j*W+i;let v=D[k];if(i<W-1)v=Math.min(v,D[k+1]+3);if(j<H-1){v=Math.min(v,D[k+W]+3);if(i<W-1)v=Math.min(v,D[k+W+1]+4);if(i>0)v=Math.min(v,D[k+W-1]+4);}D[k]=v;}};
 pass(dw);pass(dl);SURF.dist=new Float32Array(n);for(let k=0;k<n;k++)SURF.dist[k]=(wet[k]?-dl[k]:dw[k])*c/3;
 SURF.built=true;}
function ysSurfIdx(x,z){const i=Math.floor((x-SURF.x0)/SURF.cell),j=Math.floor((z-SURF.z0)/SURF.cell);if(i<0||j<0||i>=SURF.nx||j>=SURF.nz)return -1;return j*SURF.nx+i;}
function landDist(x,z){if(!SURF.built){return ysShoreDist(x,z);}const k=ysSurfIdx(x,z);if(k<0)return ysShoreDist(x,z);return SURF.dist[k];}
function waterDepth(x,z){return Math.max(0,-terrainH(x,z));}
function surfAt(x,z){if(!SURF.built)return null;const k=ysSurfIdx(x,z);if(k<0)return 'open';return SURF_CLS[SURF.cls[k]];}
function surfLevel(x,z){const k=ysSurfIdx(x,z);return k<0?terrainH(x,z):SURF.level[k];}
function ysSurfCensus(){if(!SURF.built)return null;const c={cells:SURF.cls.length};for(const name of SURF_CLS)c[name]=0;for(let k=0;k<SURF.cls.length;k++)c[SURF_CLS[SURF.cls[k]]]++;
 c.landDistAtHead=+landDist(CITY.HEAD[0],CITY.HEAD[1]).toFixed(1);if(typeof LAYOUT!=='undefined'&&LAYOUT.A)c.landDistAtA=+landDist(LAYOUT.A.x,LAYOUT.A.z).toFixed(1);c.loops=SHORE_LOOPS.map(L=>L.name);return c;}
// ---------------------------------------------------------------- hosts as cantons (DESIGN §3)
const NAV_MARGIN=10;function steerMargin(r){return 1.45*r+40;}
// the distance from the host's centre to its cap's edge along (dx,dz), world; a square cap's corner is further than its side
function hostEdge(h,dx,dz){const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;const ry=h.ry||0;const lx=dx*Math.cos(ry)-dz*Math.sin(ry),lz=dx*Math.sin(ry)+dz*Math.cos(ry);
 if(h.cap&&h.cap.poly){let best=1e9;const P=h.cap.poly;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];const ex=b[0]-a[0],ez=b[1]-a[1];const den=dx*ez-dz*ex;if(Math.abs(den)<1e-9)continue;
   const t=((a[0]-h.x)*ez-(a[1]-h.z)*ex)/den,u=((a[0]-h.x)*dz-(a[1]-h.z)*dx)/den;if(t>0&&u>=0&&u<=1)best=Math.min(best,t);}return best<1e9?best:(h.cap.hw||60);}
 const hw=(h.cap&&h.cap.hw)||60;return hw/Math.max(Math.abs(lx),Math.abs(lz),1e-6);}
// is (x,z) inside the host's cap plus a margin?
function hostBlocks(h,x,z,margin){const dx=x-h.x,dz=z-h.z;const d=Math.hypot(dx,dz);if(d<1e-6)return true;return d<hostEdge(h,dx,dz)+(margin==null?NAV_MARGIN:margin);}
// after everything is built: the lattice
const YS_AFTER=[];
YS_AFTER.push(function(){try{ysSurfBuild();window._surf=ysSurfCensus();}catch(e){reportErr('surf '+e.stack);}});
