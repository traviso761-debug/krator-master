// ================================================================= OPEN WORLD — a town's own water: its lake and shore, its river, its body
// [G data] A settlement page's water handed to the world with its ground (openworld/PLAN-VOTH.md section 3, Layer 2: step
// V2). 41 already takes a town's ground inside its footprint (buildTowns, townAt); this fragment, listed right after 41,
// takes the rest from the same WORLD_DATA.towns entry (core/world/bake_towns.py record()), wrapping WORLD's water calls:
//  * the water mask ('water': the page's water polygon, its river's channel and the edited ground joined to them, one byte
//    a cell, run-length coded): inside the footprint R the town decides where the water is (lakeWater, waterBodyAt),
//    the model's 2 km wet cells do not; its level is the town's 0 lifted onto the world's water (41's onWater: y0);
//  * the body: the town's water joins the model's body at its level that holds the town (the Ring Sea), so it is ONE
//    body, its mask taking the town's water in (or a body of its own where the model has none); 83w floods its shore
//    window from the town's water as from the body's cells, so the world draws the page's shoreline at 1:1;
//  * the river ('river': the page's polyline, mouth first, a half-width a point): riverWater serves its channel inside R;
//    the model river it joins ('join': the Turm) is cut just outside the band (WORLD_DATA.meta.rivers, before 41 builds
//    its channels, so no model channel or water runs across the town's own ground) and led on by a link round the band
//    and in along the radius to where the page's river leaves R, its bed carved by the land hook, its water falling to
//    the town's level;
//    riverLines carries the joined river down the link and a little way under the town's water;
//  * drawn: false -> the world draws the town's ground itself, so 41 does not sink it 3 m under a mesh of the town's own.
// No THREE, no DOM. A Godot port takes the same records (towns.json) and these rules.
//
//   WTOWN.list                 the towns with water: {name, level, R, band, body, river: {name, joined, pts, link}}
//   WTOWN.wetAt(x,z)           the town's water byte at (x,z) (0 land, 1 polygon, 2 river, 4 edited, 3 a hollow apart), or -1 outside every town
//   WTOWN.rivers()             each town's river in world metres: {name, town, level, pts: [[x, z, half-width]], joined, link}
//   WTOWN.check(o)             the checks: the shoreline against the page's trace, the river continuous, one body
var WTOWN=(function(){'use strict';
const W=WORLD,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
const base={init:W.init,lakeWater:W.lakeWater,riverWater:W.riverWater,waterBodies:W.waterBodies,waterBodyAt:W.waterBodyAt,riverLines:W.riverLines};
const WET=v=>v===1||v===2||v===4;
const LINK_DEPTH=4,LINK_WALL=1.2,LINK_OUT=300,STUB=150,STUB_DROP=.25;
let T=[];
const api={list:T};

// ---------------------------------------------------------------- decoding and frames
function rle(s,n){const b=atob(s),out=new Uint8Array(n);let o=0;
 for(let i=0;i+1<b.length;i+=2){const c=b.charCodeAt(i)+1;out.fill(b.charCodeAt(i+1),o,o+c);o+=c;}
 if(o!==n)throw new Error('WTOWN: a water mask of '+o+' cells, its grid wants '+n);return out;}
// the town's frame: world = Ry(rot)(local - centre) + (x, z) (41's townLocal is the inverse)
const toWorld=(t,lx,lz)=>{const dx=lx-t.cx,dz=lz-t.cz,c=Math.cos(t.rot),s=Math.sin(t.rot);return[t.x+dx*c+dz*s,t.z-dx*s+dz*c];};
const toLocal=(t,x,z)=>{const dx=x-t.x,dz=z-t.z,c=Math.cos(t.rot),s=Math.sin(t.rot);return[t.cx+dx*c-dz*s,t.cz+dx*s+dz*c];};
// the mask byte at the nearest cell, and whether any of the four cells round (x,z) is wet (the plane runs on under the
// shore by up to a cell; the ground decides the shore exactly)
function cellAt(e,x,z){const L=toLocal(e.t,x,z),m=e.mask,i=Math.round((L[0]-m.x0)/m.step),j=Math.round((L[1]-m.z0)/m.step);
 return i<0||j<0||i>=m.n||j>=m.n?0:m.data[j*m.n+i];}
function wetNear(e,x,z,kind){const L=toLocal(e.t,x,z),m=e.mask,u=(L[0]-m.x0)/m.step,v=(L[1]-m.z0)/m.step,i=Math.floor(u),j=Math.floor(v);
 for(let b=0;b<2;b++)for(let a=0;a<2;a++){const p=i+a,q=j+b;if(p<0||q<0||p>=m.n||q>=m.n)continue;const c=m.data[q*m.n+p];if(kind?c===kind:WET(c))return true;}
 return false;}
// the town whose footprint R holds (x,z): {e, d}, or null
function townOf(x,z){for(let k=0;k<T.length;k++){const e=T[k],d=Math.hypot(x-e.t.x,z-e.t.z);if(d<e.t.R)return{e,d};}return null;}

// ---------------------------------------------------------------- the polylines (the link, the town's river)
function cumOf(P){const c=[0];for(let i=1;i<P.length;i++)c.push(c[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));return c;}
// the nearest point of polyline P to (x,z): {d, s (arc length), i, t}
function nearOn(P,C,x,z){let bd=1e18,bs=0,bi=0,bt=0;
 for(let i=0;i<P.length-1;i++){const ax=P[i][0],az=P[i][1],dx=P[i+1][0]-ax,dz=P[i+1][1]-az,l2=dx*dx+dz*dz;
  let t=l2>0?((x-ax)*dx+(z-az)*dz)/l2:0;t=t<0?0:t>1?1:t;const d=Math.hypot(ax+dx*t-x,az+dz*t-z);
  if(d<bd){bd=d;bi=i;bt=t;bs=C[i]+(C[i+1]-C[i])*t;}}
 return{d:bd,s:bs,i:bi,t:bt};}
// the link's water at (x,z): inside its channel, its water height there; -1e9 elsewhere
function linkWater(e,x,z){const L=e.link;if(!L||x<L.box[0]||x>L.box[2]||z<L.box[1]||z>L.box[3])return -1e9;
 const n=nearOn(L.pts,L.cum,x,z);if(n.d>L.hw)return -1e9;const a=L.pts[n.i],b=L.pts[n.i+1];return lerp(a[2],b[2],n.t);}
// the link's bed carved into the land (the hook, before 41 eases the band to the town's ground): a trench to the water
// less LINK_DEPTH, its walls leaning LINK_WALL, never above the land (the min of two continuous fields is continuous)
function linkCarve(e,x,z,h){const L=e.link;if(!L||x<L.box[0]||x>L.box[2]||z<L.box[1]||z>L.box[3])return h;
 const n=nearOn(L.pts,L.cum,x,z),a=L.pts[n.i],b=L.pts[n.i+1],y=lerp(a[2],b[2],n.t)-LINK_DEPTH;
 return Math.min(h,y+Math.max(0,n.d-L.hw*.8)*LINK_WALL);}

// ---------------------------------------------------------------- init: cut the joined river, then 41, then the towns' water
// A model river that reaches a town with water is cut where it enters the circle R + band + LINK_OUT, just outside the
// band (the point on the circle kept as its last), before 41 builds its channels: inside, the town's ground and river
// stand. The cut is recorded.
function cutRivers(){const D=(WORLD_DATA.towns&&WORLD_DATA.towns.towns)||[],R=WORLD_DATA.meta.rivers||[],cuts=[];
 for(const t of D){if(!t.water)continue;const rr=t.R+(t.band||400)+LINK_OUT;
  for(const r of R){const P=r.line;if(!P||P.length<2||r._cutBy)continue;
   const inside=p=>Math.hypot(p[0]-t.x,p[1]-t.z)<rr;let k=P.findIndex(inside);if(k<0)continue;
   if(k===0){cuts.push({river:r.name,town:t.name,dropped:true});r._cutBy=t.name;r.line=[];continue;}
   // the crossing of the circle on segment k-1 -> k (bisection; the line's own values interpolated)
   const a=P[k-1],b=P[k];let lo=0,hi=1;for(let it=0;it<40;it++){const m=(lo+hi)/2,q=[lerp(a[0],b[0],m),lerp(a[1],b[1],m)];if(inside(q))hi=m;else lo=m;}
   const c=a.map((v,i)=>typeof v==='number'&&typeof b[i]==='number'?lerp(v,b[i],lo):v);
   cuts.push({river:r.name,town:t.name,at:[c[0],c[1]],kept:k,dropped:P.length-k});r._cutBy=t.name;r.line=P.slice(0,k).concat([c]);}}
 return cuts;}
W.init=function(R){const cuts=cutRivers();base.init(R);T.length=0;
 const D=(WORLD_DATA.towns&&WORLD_DATA.towns.towns)||[];
 D.forEach((rec,k)=>{const t=W.towns[k];if(!t||!rec.water)return;
  if(rec.drawn===false)t.own=false;   // the world draws the town's ground: no 3 m sink under a mesh of its own (41 townAt)
  const m=rec.water,e={t,name:t.name,level:t.y0+(rec.level||0),mask:{n:m.n,step:m.step,x0:m.x0,z0:m.z0,data:rle(m.rle,m.n*m.n)},
   shore:rec.shore||null,shoreSkip:rec.shoreSkip||null,river:null,link:null,body:-1,cut:cuts.filter(c=>c.town===t.name)};
  if(rec.river){const pts=rec.river.pts.map(p=>{const w=toWorld(t,p[0],p[1]);return[w[0],w[1],p[2]];});
   // where the page's river leaves R going upstream (mouth first): C, the link's end
   let C=null,ci=pts.length-1;for(let i=1;i<pts.length;i++){const d0=Math.hypot(pts[i-1][0]-t.x,pts[i-1][1]-t.z),d1=Math.hypot(pts[i][0]-t.x,pts[i][1]-t.z);
    if(d0<t.R&&d1>=t.R){const f=(t.R-d0)/(d1-d0);C=[lerp(pts[i-1][0],pts[i][0],f),lerp(pts[i-1][1],pts[i][1],f),lerp(pts[i-1][2],pts[i][2],f)];ci=i;break;}}
   const inR=C?pts.slice(0,ci).concat([C]):pts;
   e.river={name:rec.river.name,join:rec.river.join||null,joined:null,pts:inR,cum:cumOf(inR),C:C||pts[pts.length-1]};}
  T.push(e);});
 // the link: from the cut model river's last point A (in the world, out of the carve's warped space) round the outside of
 // the band to D, on the radius through C, then straight in along that radius to C. Inside the band 41 eases the land to
 // the town's ground carried out radially from R (townAt), so the page's river's channel runs on outward along that same
 // radius: the link's inward leg lies in it, and its sideways leg lies outside the band, where the carve alone shapes the
 // land. Its water falls from the model river's at A to the town's level at C.
 for(const e of T){const rv=e.river;if(!rv||!rv.join)continue;const c=e.cut.find(c=>c.river===rv.join&&c.at);if(!c)continue;
  const Mr=(WORLD_DATA.meta.rivers||[]).find(r=>r.name===rv.join),A=W.unwarp(c.at[0],c.at[1]),Cx=rv.C[0],Cz=rv.C[1],t=e.t;
  const ra=Math.hypot(A[0]-t.x,A[1]-t.z),aA=Math.atan2(A[1]-t.z,A[0]-t.x),aC=Math.atan2(Cz-t.z,Cx-t.x),rD=t.R+t.band+LINK_OUT*.5;
  let da=aC-aA;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
  const P=[],na=Math.max(1,Math.ceil(Math.abs(da)*rD/40));
  for(let i=0;i<=na;i++){const s=i/na,a=aA+da*s,r=lerp(ra,rD,s);P.push([t.x+Math.cos(a)*r,t.z+Math.sin(a)*r,0]);}   // the arc
  const nr=Math.max(2,Math.ceil((rD-t.R)/40));
  for(let i=1;i<=nr;i++){const r=lerp(rD,t.R,i/nr);P.push([t.x+Math.cos(aC)*r,t.z+Math.sin(aC)*r,0]);}   // the radius in to C
  const ya0=base.riverWater(A[0],A[1]),ya=ya0>-1e8?ya0:W.H(A[0],A[1])+2;
  const cum=cumOf(P),Lt=cum[cum.length-1];P.forEach((p,i)=>{p[2]=Math.max(e.level,lerp(ya,e.level,cum[i]/Lt));});
  const hw=Math.max(rv.pts.length?rv.pts[rv.pts.length-1][2]:20,(Mr&&Mr.width_m||40)/2),pad=hw*3+60;
  let box=[1e18,1e18,-1e18,-1e18];for(const p of P){box=[Math.min(box[0],p[0]-pad),Math.min(box[1],p[1]-pad),Math.max(box[2],p[0]+pad),Math.max(box[3],p[1]+pad)];}
  e.link={pts:P,cum,hw,box,from:A,ya,len:Lt};rv.joined=rv.join;}
 if(T.some(e=>e.link)){const prev=W.landHook;W.landHook=(x,z,h,mw)=>{if(prev)h=prev(x,z,h,mw);for(const e of T)if(e.link)h=linkCarve(e,x,z,h);return h;};}};

// ---------------------------------------------------------------- the water calls
W.lakeWater=function(x,z){const o=T.length?townOf(x,z):null;
 if(o)return wetNear(o.e,x,z)?o.e.level:-1e9;   // inside the footprint the town's water alone
 return base.lakeWater(x,z);};
W.riverWater=function(x,z){if(!T.length)return base.riverWater(x,z);const o=townOf(x,z);
 if(o)return wetNear(o.e,x,z,2)?o.e.level:-1e9;   // the page's river; no model river crosses the town
 for(const e of T){const v=linkWater(e,x,z);if(v>-1e8)return v;}   // the link (its box first)
 return base.riverWater(x,z);};
W.water=(x,z)=>Math.max(W.lakeWater(x,z),W.riverWater(x,z));
W.waterBodyAt=function(x,z){const o=T.length?townOf(x,z):null;
 if(o){if(o.e.body<0)W.waterBodies();return WET(cellAt(o.e,x,z))?o.e.body:-1;}
 return base.waterBodyAt(x,z);};

// the town's water joins the body at its level that holds the town (the cell at its centre, else one whose box meets the
// footprint); its mask takes the town's wet cells in, a mask cell round each (generous: the ground and the shore window
// decide the shore); where no body is at the town's level the town's water is a body of its own
let BOD=null;
function grow(M,x0,z0,x1,z1){const cz=M.cellZ==null?M.cell:M.cellZ,i0=Math.min(0,Math.floor((x0-M.x0)/M.cell)),j0=Math.min(0,Math.floor((z0-M.z0)/cz)),
  i1=Math.max(M.nx,Math.ceil((x1-M.x0)/M.cell)),j1=Math.max(M.nz,Math.ceil((z1-M.z0)/cz));
 if(i0===0&&j0===0&&i1===M.nx&&j1===M.nz)return M;
 const nx=i1-i0,nz=j1-j0,d=new Uint8Array(nx*nz);for(let j=0;j<M.nz;j++)d.set(M.data.subarray(j*M.nx,(j+1)*M.nx),(j-j0)*nx-i0);
 return Object.assign({},M,{x0:M.x0+i0*M.cell,z0:M.z0+j0*cz,nx,nz,data:d});}
function stampMask(M,e,R){const cz=M.cellZ==null?M.cell:M.cellZ,m=e.mask,n=m.n;let k=0;
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){if(!WET(m.data[j*n+i]))continue;const lx=m.x0+i*m.step,lz=m.z0+j*m.step,w=toWorld(e.t,lx,lz);
  if(Math.hypot(w[0]-e.t.x,w[1]-e.t.z)>R)continue;k++;
  const p=Math.floor((w[0]-M.x0)/M.cell),q=Math.floor((w[1]-M.z0)/cz);
  for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const pp=p+a,qq=q+b;if(pp>=0&&qq>=0&&pp<M.nx&&qq<M.nz)M.data[qq*M.nx+pp]=255;}}
 return k;}
W.waterBodies=function(){const B=base.waterBodies();if(BOD)return B;BOD=B;
 for(const e of T){const t=e.t,R=t.R,span=[t.x-R,t.z-R,t.x+R,t.z+R];
  let id=base.waterBodyAt(t.x,t.z);if(id>=0&&Math.abs(B[id].level-e.level)>.5)id=-1;
  if(id<0)id=B.findIndex(b=>Math.abs(b.level-e.level)<.5&&b.box[0]<span[2]&&b.box[2]>span[0]&&b.box[1]<span[3]&&b.box[3]>span[1]);
  if(id>=0){const b=B[id];b.mask=grow(b.mask,span[0]-2*b.mask.cell,span[1]-2*b.mask.cell,span[2]+2*b.mask.cell,span[3]+2*b.mask.cell);
   e.cells=stampMask(b.mask,e,R);b.box=[Math.min(b.box[0],span[0]),Math.min(b.box[1],span[1]),Math.max(b.box[2],span[2]),Math.max(b.box[3],span[3])];
   b.towns=(b.towns||[]).concat([e.name]);e.body=id;e.joinedBody=true;continue;}
  // a body of its own: the town's water within R at 40 m cells
  const cell=40,nx=Math.ceil(2*R/cell)+4,M={x0:t.x-R-2*cell,z0:t.z-R-2*cell,cell,cellZ:cell,nx,nz:nx,data:new Uint8Array(nx*nx)};
  e.cells=stampMask(M,e,R);id=B.length;
  B.push({id,level:e.level,cells:Math.max(1,Math.round(e.cells*e.mask.step*e.mask.step/16e6)),salt:W.saltAt(t.x,t.z),mask:M,box:span,towns:[e.name],town:e.name});
  e.body=id;e.joinedBody=false;}
 return B;};

// the joined river: the model river down to its cut (41 builds no more of it), the link, and a stub of STUB m down the
// page's river just under the town's water (so the ribbon runs on under the open surface, not edge to edge with it)
W.riverLines=function(step){step=step==null?40:step;const out=base.riverLines(step);
 for(const e of T){const rv=e.river;if(!rv||!e.link)continue;const k=out.findIndex(r=>r.name===rv.join);if(k<0)continue;
  const L=out[k],A=e.link.from;let cut=L.pts.length;
  // the model's line ends at the cut; drop any point of it past the link's start (nearest to it), then the link
  let bi=-1,bd=1e18;L.pts.forEach((p,i)=>{const d=Math.hypot(p[0]-A[0],p[1]-A[1]);if(d<bd){bd=d;bi=i;}});if(bi>=0)cut=bi+1;
  const pts=L.pts.slice(0,cut),lk=e.link.pts,lc=e.link.cum;
  for(let s=0;s<=e.link.len;s+=step){let i=0;while(i<lc.length-2&&lc[i+1]<s)i++;const f=(s-lc[i])/Math.max(1e-6,lc[i+1]-lc[i]);
   pts.push([lerp(lk[i][0],lk[i+1][0],f),lerp(lk[i][1],lk[i+1][1],f),lerp(lk[i][2],lk[i+1][2],f)]);}
  // the stub: down the page's river from C (its points run mouth first, so backwards from the end)
  const P=rv.pts,C=rv.cum,Lr=C[C.length-1];
  for(let s=step;s<=STUB;s+=step){const a=Lr-s;let i=0;while(i<C.length-2&&C[i+1]<a)i++;const f=(a-C[i])/Math.max(1e-6,C[i+1]-C[i]);
   pts.push([lerp(P[i][0],P[i+1][0],f),lerp(P[i][1],P[i+1][1],f),e.level-STUB_DROP]);}
  for(let i=pts.length-2;i>=0;i--)if(pts[i][2]<pts[i+1][2])pts[i][2]=pts[i+1][2];   // never climbing downstream
  out[k]=Object.assign({},L,{pts,joined:e.name,link:e.link.pts.length});}
 return out;};

api.wetAt=(x,z)=>{const o=T.length?townOf(x,z):null;return o?cellAt(o.e,x,z):-1;};
api.rivers=()=>T.filter(e=>e.river).map(e=>({name:e.river.name,town:e.name,level:e.level,pts:e.river.pts,joined:e.river.joined,
 link:e.link?{from:e.link.from,len:e.link.len,ya:e.link.ya,hw:e.link.hw}:null}));

// ---------------------------------------------------------------- the checks (the region's verify and core/world/test-town-water.js)
// shore: each trace point of the page (the town's frame, inside R less a margin), brought into the world: the distance to
// where the world's ground meets the town's level (32 rays, 0.5 m steps to 60 m): the worst and the mean, and the points
// where none is found. Where the site's edits moved the ground, and in the river's vale, the trace is not the page's shore:
// bake_towns.py lists those points (shoreSkip) and they are left out
// river: the joined river's line has no gap over 2 steps, never climbs downstream, and stands over the ground (the
// link's and the model's points: water over the bed by more than 0.3 m); the page's river in R has water at every 50 m
// body: every wet cell of the town (every 100 m) answers one body, and that body is the model's (joined: one water body)
function shoreCheck(e,o){const S=e.shore;if(!S)return{n:0};const errs=[],miss=[],dirs=[];for(let a=0;a<32;a++)dirs.push([Math.cos(a*Math.PI/16),Math.sin(a*Math.PI/16)]);
 const skip=new Set(e.shoreSkip||[]);
 for(let k=1;k<S.length-1;k++){const w=toWorld(e.t,S[k][0],S[k][1]);if(Math.hypot(w[0]-e.t.x,w[1]-e.t.z)>e.t.R-(o.margin==null?150:o.margin)||skip.has(k))continue;
  let best=1e9;const g0=W.H(w[0],w[1])-e.level;if(g0===0)best=0;
  for(const [dx,dz] of dirs){let a=g0;for(let q=1;q<=120;q++){const d=q*.5;if(d-.5>=best)break;const b=W.H(w[0]+dx*d,w[1]+dz*d)-e.level;
   if((a<0)!==(b<0)){best=Math.min(best,d-.5+.5*Math.abs(a)/Math.max(1e-9,Math.abs(a)+Math.abs(b)));break;}a=b;}}
  if(best>1e8)miss.push([Math.round(S[k][0]),Math.round(S[k][1])]);else errs.push([best,S[k][0],S[k][1]]);}
 errs.sort((a,b)=>b[0]-a[0]);const mean=errs.reduce((s,v)=>s+v[0],0)/Math.max(1,errs.length);
 return{n:errs.length+miss.length,max:errs.length?+errs[0][0].toFixed(2):0,mean:+mean.toFixed(2),missing:miss.length,worst:errs.slice(0,3).map(v=>[+v[0].toFixed(2),Math.round(v[1]),Math.round(v[2])]),firstMissing:miss[0]||null};}
function riverCheck(e,step){const rv=e.river;if(!rv)return{ok:true,none:true};let dry=0,firstDry=null;
 for(let s=0;s<=rv.cum[rv.cum.length-1];s+=50){const P=rv.pts,C=rv.cum;let i=0;while(i<C.length-2&&C[i+1]<s)i++;const f=(s-C[i])/Math.max(1e-6,C[i+1]-C[i]),x=lerp(P[i][0],P[i+1][0],f),z=lerp(P[i][1],P[i+1][1],f);
  if(!(W.water(x,z)>W.H(x,z)+.3)){dry++;firstDry=firstDry||[Math.round(x),Math.round(z)];}}
 const out={inTown:{stations:Math.floor(rv.cum[rv.cum.length-1]/50)+1,dry,firstDry},joined:rv.joined};
 if(rv.joined){const L=W.riverLines(step).find(r=>r.name===rv.joined);let gap=0,climb=0,buried=0,first=null;
  if(L)for(let i=1;i<L.pts.length;i++){const a=L.pts[i-1],b=L.pts[i];if(Math.hypot(b[0]-a[0],b[1]-a[1])>2.01*step)gap++;if(b[2]>a[2]+1e-6)climb++;
   if(Math.hypot(b[0]-e.t.x,b[1]-e.t.z)<e.t.R+e.t.band&&!(b[2]>W.H(b[0],b[1])+.3)){buried++;first=first||[Math.round(b[0]),Math.round(b[1])];}}
  out.line={found:!!L,points:L?L.pts.length:0,gaps:gap,climbs:climb,buriedNearTown:buried,firstBuried:first};}
 out.ok=dry===0&&(!rv.joined||(out.line.found&&out.line.gaps===0&&out.line.climbs===0&&out.line.buriedNearTown===0));return out;}
function bodyCheck(e){const m=e.mask,ids=new Map();let n=0;
 for(let j=0;j<m.n;j+=10)for(let i=0;i<m.n;i+=10){if(!WET(m.data[j*m.n+i]))continue;const w=toWorld(e.t,m.x0+i*m.step,m.z0+j*m.step);
  if(Math.hypot(w[0]-e.t.x,w[1]-e.t.z)>=e.t.R)continue;n++;const id=W.waterBodyAt(w[0],w[1]);ids.set(id,(ids.get(id)||0)+1);}
 const B=W.waterBodies();return{cells:n,bodies:[...ids.keys()],one:ids.size===1&&!ids.has(-1),body:e.body,joinedModel:!!e.joinedBody,level:e.level,
  bodyLevel:e.body>=0?B[e.body].level:null};}
api.check=function(o){o=o||{};return T.map(e=>{const sh=shoreCheck(e,o),rv=riverCheck(e,o.step||40),bd=bodyCheck(e),lim=o.shoreMax==null?8:o.shoreMax;
 return{town:e.name,level:e.level,cut:e.cut,shore:sh,river:rv,body:bd,ok:sh.missing===0&&sh.max<=lim&&rv.ok&&bd.one};});};
return api;})();
