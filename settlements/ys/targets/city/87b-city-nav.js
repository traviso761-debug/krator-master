// ================================================================= YS CITY — NAV: the FOOT, BOAT and SWIM grids and A* (DESIGN §3; Voth's 78b-life-nav.js)
// Classified ONCE after everything stands (a YS_AFTER hook, after the surface lattice), from the real terrain class,
// the real deck records (NAV_EXTRA, bucketed on a 48 m hash so a 6 m grid over the core costs nothing), the host caps
// (hostEdge + NAV_MARGIN: the exact cap plus Voth's small margin, never the steering margin) and the placed buildings'
// footprints. FOOT has one layer per datum: 'ground' (land, wadeable shallows, decks and pads at the ground and quay
// datums), 'L1' (decks and host plates 9–18 m up) and 'L2' (decks and plates 24–36 m up), joined by stair and ladder
// records; BOAT is water with depth ≥ the vessel's draught and no deck lower than its air draught overhead; SWIM is
// BOAT at zero draught. A* with a binary heap over any layer, then greedy line-of-sight simplification (Voth's lesson:
// never thin a path by sampling). Nobody walks until the life layer; the connectivity invariants read these grids.
const NAV={cell:6,x0:-500,z0:-1300,x1:1700,z1:1100,W:0,H:0,grids:{},built:false,links:[],stats:{calls:0,fails:0}};
const NAV_LAYERS=['ground','L1','L2','boat','swim'];
const NAV_LEVELS={ground:[-2,6.5],L1:[9,18],L2:[24,36]};   // a deck's y range per foot layer
function navCell(x,z){return [Math.floor((x-NAV.x0)/NAV.cell),Math.floor((z-NAV.z0)/NAV.cell)];}
function navCentre(cx,cz){return [NAV.x0+(cx+.5)*NAV.cell,NAV.z0+(cz+.5)*NAV.cell];}
function navLayerOfDeck(d){if(d.level==='L1'||d.level==='L2')return d.level;if(d.level==='wet'||d.level==='quay'||d.level==='ground')return 'ground';
 const y=d.y!=null?d.y:0;for(const L in NAV_LEVELS){const r=NAV_LEVELS[L];if(y>=r[0]&&y<=r[1])return L;}return null;}
// a spatial hash of the deck records and the placed buildings, built with the grids
const NAV_HASH={cell:48,decks:{},blds:{}};
function navHashKeys(x0,z0,x1,z1){const c=NAV_HASH.cell;const ks=[];for(let j=Math.floor(z0/c);j<=Math.floor(z1/c);j++)for(let i=Math.floor(x0/c);i<=Math.floor(x1/c);i++)ks.push(i+','+j);return ks;}
function navHashBuild(){NAV_HASH.decks={};NAV_HASH.blds={};
 for(const d of NAV_EXTRA){let x0,z0,x1,z1;if(d.kind==='hostfloor'){x0=d.x-d.r;x1=d.x+d.r;z0=d.z-d.r;z1=d.z+d.r;}else{x0=d.x0;x1=d.x1;z0=d.z0;z1=d.z1;}
  d._layer=navLayerOfDeck(d);for(const k of navHashKeys(x0,z0,x1,z1))(NAV_HASH.decks[k]||(NAV_HASH.decks[k]=[])).push(d);}
 for(const p of HYK_PLACED){const D=HYK.defs[p.key];if(!D)continue;const r=Math.max(D.w,D.d)/2*(p.o.scale||1);const b={x:p.x,z:p.z,ry:p.ry,hw:D.w/2*(p.o.scale||1),hd:D.d/2*(p.o.scale||1),r,key:p.key,grown:D.grown};
  for(const k of navHashKeys(p.x-r,p.z-r,p.x+r,p.z+r))(NAV_HASH.blds[k]||(NAV_HASH.blds[k]=[])).push(b);}}
function navDeckHit(d,x,z){if(d.kind==='hostfloor')return Math.hypot(x-d.x,z-d.z)<=d.r;
 if(d.kind==='pad'){const cx=(d.x0+d.x1)/2,cz=(d.z0+d.z1)/2;return Math.hypot(x-cx,z-cz)<=d.w/2;}
 if(d.a&&d.b){const ax=d.a[0],az=d.a[2],bx=d.b[0],bz=d.b[2];const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1;const t=clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1);return Math.hypot(x-(ax+dx*t),z-(az+dz*t))<=d.w/2;}
 return x>=d.x0&&x<=d.x1&&z>=d.z0&&z<=d.z1;}
function navDecksAt(x,z){const k=Math.floor(x/NAV_HASH.cell)+','+Math.floor(z/NAV_HASH.cell);const L=NAV_HASH.decks[k];if(!L)return [];const out=[];for(const d of L)if(navDeckHit(d,x,z))out.push(d);return out;}
function navBuildingAt(x,z){const k=Math.floor(x/NAV_HASH.cell)+','+Math.floor(z/NAV_HASH.cell);const L=NAV_HASH.blds[k];if(!L)return null;
 for(const b of L){if(b.grown)continue;const dx=x-b.x,dz=z-b.z;if(dx*dx+dz*dz>b.r*b.r)continue;const c=Math.cos(b.ry),s=Math.sin(b.ry);const lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)<=b.hw&&Math.abs(lz)<=b.hd)return b;}return null;}
function navHostBlocks(x,z,margin){for(const h of HOSTS)if(hostBlocks(h,x,z,margin))return h;return null;}
// the cell tests, one per layer; true = blocked
function navBlocked(layer,x,z,o){o=o||{};const decks=navDecksAt(x,z);
 if(layer==='ground'){if(decks.some(d=>d._layer==='ground'))return false;const s=surfAt(x,z);if(s==='cliff'||s==='canal'||s==='open'||s==='deck')return true;
  if(s==='shallows'&&waterDepth(x,z)>1.2)return true;if(navHostBlocks(x,z,NAV_MARGIN))return true;if(navBuildingAt(x,z))return true;return false;}
 if(layer==='L1'||layer==='L2'){return !decks.some(d=>d._layer===layer);}
 const draught=layer==='swim'?.4:(o.draught||.8),air=o.air||6;const depth=waterDepth(x,z);if(depth<draught)return true;
 if(decks.some(d=>d._layer!==null&&(d.y||0)<air&&d.kind!=='hostfloor'))return true;if(navHostBlocks(x,z,2))return true;return false;}
function navBuild(){NAV.W=Math.ceil((NAV.x1-NAV.x0)/NAV.cell);NAV.H=Math.ceil((NAV.z1-NAV.z0)/NAV.cell);navHashBuild();
 for(const L of NAV_LAYERS){const g=new Uint8Array(NAV.W*NAV.H);for(let j=0;j<NAV.H;j++)for(let i=0;i<NAV.W;i++){const p=navCentre(i,j);g[j*NAV.W+i]=navBlocked(L,p[0],p[1])?1:0;}NAV.grids[L]=g;}
 NAV.links=NAV_EXTRA.filter(d=>d.kind==='stair'||d.kind==='ladder');NAV.built=true;}
function navNearestOpen(g,cx,cz){const W=NAV.W,H=NAV.H;if(cx>=0&&cz>=0&&cx<W&&cz<H&&!g[cz*W+cx])return [cx,cz];
 for(let r=1;r<12;r++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;const x=cx+dx,z=cz+dz;if(x<0||z<0||x>=W||z>=H)continue;if(!g[z*W+x])return [x,z];}return [cx,cz];}
const NAV_NEI=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.41421],[1,-1,1.41421],[-1,1,1.41421],[-1,-1,1.41421]];
function NavHeap(){this.a=[];}
NavHeap.prototype.push=function(n,s){const a=this.a;let i=a.length;a.push([n,s]);while(i>0){const p=(i-1)>>1;if(a[p][1]<=a[i][1])break;const t=a[p];a[p]=a[i];a[i]=t;i=p;}};
NavHeap.prototype.pop=function(){const a=this.a,top=a[0],last=a.pop();if(a.length){a[0]=last;let i=0;const n=a.length;for(;;){const l=2*i+1,r=2*i+2;let m=i;if(l<n&&a[l][1]<a[m][1])m=l;if(r<n&&a[r][1]<a[m][1])m=r;if(m===i)break;const t=a[m];a[m]=a[i];a[i]=t;i=m;}}return top;};
// 8-connected A* over one layer, Euclidean heuristic; null when unreachable. Returns world points.
function navAStar(layer,ax,az,bx,bz){const g=NAV.grids[layer];if(!g)return null;NAV.stats.calls++;const W=NAV.W,H=NAV.H;
 let s0=navCell(ax,az),g0=navCell(bx,bz);s0=[clamp(s0[0],0,W-1),clamp(s0[1],0,H-1)];g0=[clamp(g0[0],0,W-1),clamp(g0[1],0,H-1)];
 const st=navNearestOpen(g,s0[0],s0[1]),gl=navNearestOpen(g,g0[0],g0[1]);const sI=st[1]*W+st[0],gI=gl[1]*W+gl[0];if(sI===gI)return [[ax,az],[bx,bz]];
 const n=W*H;const G=new Float32Array(n).fill(Infinity);const from=new Int32Array(n).fill(-1);const closed=new Uint8Array(n);G[sI]=0;
 const heap=new NavHeap();heap.push(sI,Math.hypot(gl[0]-st[0],gl[1]-st[1]));let iter=0;
 while(heap.a.length&&iter++<400000){const cur=heap.pop()[0];if(closed[cur])continue;if(cur===gI)break;closed[cur]=1;const cx=cur%W,cz=(cur-cx)/W;
  for(const nb of NAV_NEI){const x=cx+nb[0],z=cz+nb[1];if(x<0||z<0||x>=W||z>=H)continue;const k=z*W+x;if(closed[k]||g[k])continue;
   if(nb[2]>1&&(g[cz*W+x]||g[z*W+cx]))continue;   // no cutting a blocked corner
   const t=G[cur]+nb[2];if(t<G[k]){from[k]=cur;G[k]=t;heap.push(k,t+Math.hypot(gl[0]-x,gl[1]-z));}}}
 if(from[gI]===-1){NAV.stats.fails++;return null;}
 const path=[];let cur=gI;for(;;){const cx=cur%W,cz=(cur-cx)/W;path.push(navCentre(cx,cz));if(cur===sI)break;cur=from[cur];}
 path.reverse();path.unshift([ax,az]);path.push([bx,bz]);return path;}
function navLOS(layer,ax,az,bx,bz){const g=NAV.grids[layer];const d=Math.hypot(bx-ax,bz-az);const steps=Math.max(1,Math.ceil(d/(NAV.cell*.5)));
 for(let i=0;i<=steps;i++){const t=i/steps;const c=navCell(ax+(bx-ax)*t,az+(bz-az)*t);if(c[0]<0||c[1]<0||c[0]>=NAV.W||c[1]>=NAV.H||g[c[1]*NAV.W+c[0]])return false;}return true;}
function navSimplify(layer,path){const MAX=400;const out=[path[0]];let i=0;while(i<path.length-1){let far=i+1;for(let k=i+1;k<path.length;k++){if(Math.hypot(path[k][0]-path[i][0],path[k][1]-path[i][1])>MAX)break;if(navLOS(layer,path[i][0],path[i][1],path[k][0],path[k][1]))far=k;}out.push(path[far]);i=far;}return out;}
function navPath(layer,ax,az,bx,bz){const p=navAStar(layer,ax,az,bx,bz);return p?navSimplify(layer,p):null;}
// a flood fill from a point: the set of reachable cells on one layer (the connectivity invariants)
function navReach(layer,ax,az){const g=NAV.grids[layer];const W=NAV.W,H=NAV.H;const c0=navCell(ax,az);const st=navNearestOpen(g,clamp(c0[0],0,W-1),clamp(c0[1],0,H-1));
 const seen=new Uint8Array(W*H);const stack=[st[1]*W+st[0]];seen[stack[0]]=1;let n=0;while(stack.length){const cur=stack.pop();n++;const cx=cur%W,cz=(cur-cx)/W;
  for(const nb of NAV_NEI){if(nb[2]>1)continue;const x=cx+nb[0],z=cz+nb[1];if(x<0||z<0||x>=W||z>=H)continue;const k=z*W+x;if(seen[k]||g[k])continue;seen[k]=1;stack.push(k);}}return {seen,n};}
function navConnected(layer,ax,az,bx,bz){const r=navReach(layer,ax,az);const g=NAV.grids[layer];const c=navCell(bx,bz);const q=navNearestOpen(g,clamp(c[0],0,NAV.W-1),clamp(c[1],0,NAV.H-1));return !!r.seen[q[1]*NAV.W+q[0]];}
function navCensus(){if(!NAV.built)return null;const c={cell:NAV.cell,W:NAV.W,H:NAV.H,links:NAV.links.length,stats:NAV.stats};for(const L of NAV_LAYERS){const g=NAV.grids[L];let open=0;for(let k=0;k<g.length;k++)if(!g[k])open++;c[L]=open;}return c;}
YS_AFTER.push(function(){try{navBuild();window._nav=navCensus();}catch(e){reportErr('nav '+e.stack);}});
