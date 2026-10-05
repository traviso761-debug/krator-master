// ================================================================= YS CITY — PASS 1: the placement as RECORDS (PLAN.md P3 step 5; GODOT.md items 4, 5)
// Reads the layout (87), the streets and highways (87c) and the natural ground, and writes what stands where as plain
// records: PLACE.blds (a kit def at a point: free-standing), PLACE.hosts (a drowned Ancient host: its type, cut, sink,
// plates, ways in and the pods grown on it), PLACE.slots (a plot reserved for something this build cannot draw yet: the
// foreign quarter's sets, the land quarter's reclaimed Ancients) and PLACE.moles (fill stamps: the reclaimed moles and
// the landmarks' islands, pushed onto CITY_STAMPS so the terrain is built with them). Nothing here builds geometry; the
// draw pass (90-city-draw.js) reads the records and calls the builders. Runs at load, before the terrain exists, so the
// ground it reads is the natural one (YS_NAT through terrainH) raised by its own moles.
// Every draw comes from KRAND (core/rand), never from the lineage's rng()/h3/fbm: a block's contents come from a stream
// seeded by the block's own cell (KRAND.cell), so the layout reproduces in Godot and one block's edit moves nothing in
// another. The one shared state is the kit audit's boost (a def not yet placed is picked first), which makes the full
// build, not a block alone, the unit of reproduction.
// The occupancy rule: every footprint is an oriented box; the streets, canals and highways are boxes reserved before
// anything is placed, a host's cap is a box, and nothing is placed on anything else (PLAN.md P3 step 2: the one rule that
// prevents every overlap bug).
const PLACE={shoreLog:[],SEED:32000,blds:[],hosts:[],slots:[],moles:[],occ:[],refused:{},grid:new Map(),G:50};
const PL_U=LAYOUT.U,PL_V=LAYOUT.V,PL_N=LAYOUT.N,PL_T=LAYOUT.T;
function ysPlStream(name,b){const s=KRAND.child(PLACE.SEED,name);return KRAND.stream(b?KRAND.cell(s,b.i,b.j):s);}
function ysPlRefuse(why){PLACE.refused[why]=(PLACE.refused[why]||0)+1;return null;}
// ---------------------------------------------------------------- oriented boxes (local x along (cos ry,-sin ry), local z along (sin ry,cos ry))
function ysPlBox(cx,cz,hw,hd,ry,tag){const c=Math.cos(ry),s=Math.sin(ry);return {cx,cz,hw,hd,ry,ux:[c,-s],uz:[s,c],r:Math.hypot(hw,hd),tag};}
function ysPlHit(A,B){const dx=B.cx-A.cx,dz=B.cz-A.cz;if(dx*dx+dz*dz>(A.r+B.r)*(A.r+B.r))return false;
 for(const L of [A.ux,A.uz,B.ux,B.uz]){const ra=A.hw*Math.abs(A.ux[0]*L[0]+A.ux[1]*L[1])+A.hd*Math.abs(A.uz[0]*L[0]+A.uz[1]*L[1]);
  const rb=B.hw*Math.abs(B.ux[0]*L[0]+B.ux[1]*L[1])+B.hd*Math.abs(B.uz[0]*L[0]+B.uz[1]*L[1]);if(Math.abs(dx*L[0]+dz*L[1])>ra+rb)return false;}return true;}
function ysPlKeys(B){const G=PLACE.G,ks=[];for(let j=Math.floor((B.cz-B.r)/G);j<=Math.floor((B.cz+B.r)/G);j++)for(let i=Math.floor((B.cx-B.r)/G);i<=Math.floor((B.cx+B.r)/G);i++)ks.push(i+','+j);return ks;}
function ysPlClash(B,skip){const seen=new Set();for(const k of ysPlKeys(B)){const L=PLACE.grid.get(k);if(!L)continue;for(const o of L){if(seen.has(o))continue;seen.add(o);if(skip&&skip.test(o.tag))continue;if(ysPlHit(B,o))return o;}}return null;}
function ysPlWhat(o){return String(o.tag).split(/[: ]/)[0];}   // a refusal names the kind of thing in the way
function ysPlTake(B){PLACE.occ.push(B);for(const k of ysPlKeys(B)){let L=PLACE.grid.get(k);if(!L)PLACE.grid.set(k,L=[]);L.push(B);}return B;}
function ysPlStrip(a,b,w,tag){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1;return ysPlBox((a[0]+b[0])/2,(a[1]+b[1])/2,w/2,L/2,Math.atan2(dx,dz),tag);}
// a block's frame: (u,v) along U and V from its centre; a box squared to the grid has local x = U, local z = V
const PL_RY=Math.atan2(-PL_U[1],PL_U[0]);
function ysPlAt(b,u,v){return [b.x+PL_U[0]*u+PL_V[0]*v,b.z+PL_U[1]*u+PL_V[1]*v];}
function ysPlFacing(fx,fz){return Math.atan2(fx,fz);}   // the yaw whose front (+z) faces (fx,fz)
// ---------------------------------------------------------------- the ground: the natural one, raised by the moles
function ysPlInPoly(P,x,z){let ins=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[j],b=P[i];if(((b[1]>z)!==(a[1]>z))&&(x<(a[0]-b[0])*(z-b[1])/(a[1]-b[1])+b[0]))ins=!ins;}return ins;}
function ysPlH(x,z){let h=terrainH(x,z);for(const m of PLACE.moles)if(x>=m.x0&&x<=m.x1&&z>=m.z0&&z<=m.z1&&ysPlInPoly(m.poly,x,z))h=Math.max(h,m.y);return h;}
// a mole: the record keeps the full polygon at the quay datum y (ysPlH reads it; the draw pass lays a plate at y - .12 on
// it and, if `o.wall`, a shell quay wall down to the bed round its edge, 84b hykHarbWall); the terrain's fill stamp lies
// 30 cm under the datum (nothing built on the mole fights the ground) and, under a walled mole, 7 m inside the edge with
// a sharp fall, so the heightfield's stepped edge hides behind the wall. o.node makes the mole a node of the bridge graph.
function ysPlPolyArea(P){let a=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];a+=p[0]*q[1]-q[0]*p[1];}return a/2;}
function ysPlInset(P,d){const n=P.length,out=[];const cx=P.reduce((a,p)=>a+p[0],0)/n,cz=P.reduce((a,p)=>a+p[1],0)/n;
 for(let i=0;i<n;i++){const a=P[(i-1+n)%n],b=P[i],c=P[(i+1)%n];const L=[];for(const [p,q] of [[a,b],[b,c]]){const dx=q[0]-p[0],dz=q[1]-p[1],l=Math.hypot(dx,dz)||1;let nx=-dz/l,nz=dx/l;
   if((cx-(p[0]+q[0])/2)*nx+(cz-(p[1]+q[1])/2)*nz<0){nx=-nx;nz=-nz;}L.push({px:p[0]+nx*d,pz:p[1]+nz*d,dx:dx/l,dz:dz/l});}
  const [e,f]=L;const den=e.dx*f.dz-e.dz*f.dx;if(Math.abs(den)<1e-6){out.push([b[0]+(cx-b[0])/Math.hypot(cx-b[0],cz-b[1])*d,b[1]+(cz-b[1])/Math.hypot(cx-b[0],cz-b[1])*d]);continue;}
  const t=((f.px-e.px)*f.dz-(f.pz-e.pz)*f.dx)/den;out.push([e.px+e.dx*t,e.pz+e.dz*t]);}return out;}
// an organic outline (Travis, Oct 5 2026: the platforms looked square): n points about a centre pushed off the block's
// middle, radii from KRAND smoothed round the ring, stretched e along the bearing a; star-shaped, so the inset is a
// pull toward the centre and the plate a fan
function ysPlOrganic(st,cx,cz,R,o){o=o||{};const n=o.n||14,e=o.e||1,a=o.a||0,amp=o.amp!=null?o.amp:.3;const off=o.off||0;const oa=st.range(0,TAU);cx+=Math.cos(oa)*off;cz+=Math.sin(oa)*off;
 let r=[...Array(n)].map(()=>1+amp*(st.next()-.5)*2);for(let k=0;k<2;k++)r=r.map((v,i)=>(r[(i-1+n)%n]+2*v+r[(i+1)%n])/4);
 const c=Math.cos(a),sn=Math.sin(a);const poly=r.map((v,i)=>{const t=i/n*TAU;const u=R*v*e*Math.cos(t),w=R*v*Math.sin(t);return [cx+u*c-w*sn,cz+u*sn+w*c];});return {poly,c:[cx,cz]};}
function ysPlInsetStar(P,c,d){return P.map(p=>{const dx=p[0]-c[0],dz=p[1]-c[1],l=Math.hypot(dx,dz)||1;const k=Math.max(.2,1-d/l);return [c[0]+dx*k,c[1]+dz*k];});}
function ysPlMole(name,poly,y,soft,o){o=o||{};const m={name,poly,y,soft:soft==null?6:soft,wall:!!o.wall,plate:o.plate!==false&&y>1,node:o.node||null,star:o.star||null,stairs:[],x0:Math.min(...poly.map(p=>p[0])),x1:Math.max(...poly.map(p=>p[0])),z0:Math.min(...poly.map(p=>p[1])),z1:Math.max(...poly.map(p=>p[1]))};
 if(m.node){m.node.x=(m.x0+m.x1)/2;m.node.z=(m.z0+m.z1)/2;m.node.y=y;m.node.mole=m;}
 PLACE.moles.push(m);if(m.plate)CITY_STAMPS.push({kind:'fill',poly:m.wall?(m.star?ysPlInsetStar(poly,m.star,7):ysPlInset(poly,7)):poly,y:y-(m.wall?.7:.3),soft:m.wall?0:m.soft,paint:'pave'});else CITY_STAMPS.push({kind:'fill',poly,y,soft:m.soft,paint:null});return m;}
// buildings along a mole's edges, fronts to the water: along each edge the cursor drops a def from the pool set back 2 m
// inside the edge (the box must be wholly on the mole: the ground check refuses a corner in the water or on a terrace)
function ysPlEdgeRun(m,b,o){const st=ysPlStream('edge:'+(o.tag||''),b);const P=m.poly,c=m.star||[(m.x0+m.x1)/2,(m.z0+m.z1)/2];let n=0;
 for(let i=0;i<P.length;i++){const a=P[i],q=P[(i+1)%P.length];const dx=q[0]-a[0],dz=q[1]-a[1],L=Math.hypot(dx,dz)||1;const tx=dx/L,tz=dz/L;let nx=-tz,nz=tx;if((c[0]-(a[0]+q[0])/2)*nx+(c[1]-(a[1]+q[1])/2)*nz>0){nx=-nx;nz=-nz;}   /* outward */
  const ry=ysPlFacing(nx,nz);let t=3;while(t<L-3&&n<(o.max||99)){if(st.chance(PL_GARDEN[o.kind]||0)){t+=st.range(8,16);continue;}
   const key=ysPlPick(st,o.pool),D=HYK.defs[key];if(t+D.w>L-3)break;const s=t+D.w/2;const cx=a[0]+tx*s-nx*(D.d/2+2),cz=a[1]+tz*s-nz*(D.d/2+2);
   const B=ysPlBox(cx,cz,D.w/2+1,D.d/2+1,ry,key);{const cl=ysPlClash(B);if(cl){ysPlRefuse('occupied by '+ysPlWhat(cl));t+=6;continue;}}
   const y=ysPlGround(B,o.land?undefined:{min:m.y-.5,slope:1});if(y==null){t+=6;continue;}
   ysPlBld(key,B,o.land?y:m.y,o.why,b,st);n++;t+=D.w+st.range(...PL_GAP[o.kind]);}}
 return n;}
function ysPlBlockPoly(b,u0,u1,v0,v1){return [[u0,v0],[u1,v0],[u1,v1],[u0,v1]].map(q=>ysPlAt(b,q[0],q[1]));}
function ysPlBoxPoly(B){return [[-1,-1],[1,-1],[1,1],[-1,1]].map(k=>[B.cx+B.ux[0]*k[0]*B.hw+B.uz[0]*k[1]*B.hd,B.cz+B.ux[1]*k[0]*B.hw+B.uz[1]*k[1]*B.hd]);}
// the ground under a box: nine samples; null (refused) when it is water, cliff, river valley or too steep
function ysPlGround(B,o){o=o||{};const S=[];for(const a of [-1,0,1])for(const c of [-1,0,1])S.push([B.cx+B.ux[0]*a*B.hw+B.uz[0]*c*B.hd,B.cz+B.ux[1]*a*B.hw+B.uz[1]*c*B.hd]);
 let lo=1e9,hi=-1e9,sum=0;for(const p of S){if(!o.stack&&ysKarst(p[0],p[1])>0)return ysPlRefuse('karst');const r=ysRiverDist(p[0],p[1]);if(r.d<r.w*2.6+4)return ysPlRefuse('river valley');
  const h=ysPlH(p[0],p[1]);lo=Math.min(lo,h);hi=Math.max(hi,h);sum+=h;}
 if(!o.wet&&lo<(o.min!=null?o.min:1.0))return ysPlRefuse('water');if(hi-lo>(o.slope||1.8))return ysPlRefuse('slope');return sum/S.length;}
// ---------------------------------------------------------------- the kit audit's memory: a def not yet placed is picked first
const PL_COUNT={};
function ysPlPick(st,pool){let tot=0;const w=pool.map(([k,wt])=>{const v=wt*(PL_COUNT[k]?1:12);tot+=v;return v;});let r=st.next()*tot;for(let i=0;i<pool.length;i++){r-=w[i];if(r<=0)return pool[i][0];}return pool[pool.length-1][0];}
function ysPlCount(k){PL_COUNT[k]=(PL_COUNT[k]||0)+1;}
// a free-standing record. B is its box (already clear), y the ground; `why` names the pass that put it there
function ysPlBld(key,B,y,why,b,st,extra){const D=HYK.defs[key];ysPlTake(B);ysPlCount(key);
 const r=Object.assign({key,x:B.cx,z:B.cz,ry:B.ry,y,v:st?st.int(0,3):0,why,block:b?b.i+','+b.j:null,wealth:D?D.tags.wealth:null,box:B},extra||{});PLACE.blds.push(r);return r;}
// a def's box at (x,z) facing ry, its footprint grown by m on every side
function ysPlDefBox(key,x,z,ry,m){const D=HYK.defs[key];return ysPlBox(x,z,D.w/2+(m||0),D.d/2+(m||0),ry,key);}
// place a def by name at a point (a landmark, a precinct piece): o.fwd shifts the box forward of the origin (a harbour
// piece: its origin on the quay line), o.skip lets it stand over a reserved kind (the market hall over its highways).
// ysPlTry is quiet (a reason string when it cannot); ysPlByName counts the refusal; ysPlSeek tries candidates in order
function ysPlTry(key,x,z,ry,o){o=o||{};const f=o.fwd||0;const B=ysPlDefBox(key,x+Math.sin(ry)*f,z+Math.cos(ry)*f,ry,o.margin==null?1:o.margin);const c=ysPlClash(B,o.skip);if(c)return 'occupied: '+key+' by '+ysPlWhat(c);
 const n0=Object.assign({},PLACE.refused);const y=o.y!=null?o.y:ysPlGround(B,o.ground);if(y==null){const why=Object.keys(PLACE.refused).find(k=>PLACE.refused[k]!==n0[k]);PLACE.refused=n0;return why+': '+key;}return {B,y};}
function ysPlByName(key,x,z,ry,why,b,o){o=o||{};const t=ysPlTry(key,x,z,ry,o);if(typeof t==='string')return ysPlRefuse(t);return ysPlBld(key,t.B,t.y,why,b,null,Object.assign({x,z},o.extra||{}));}
function ysPlSeek(key,cands,ry,why,b,o){let last='no candidate';for(const c of cands){const r=typeof ry==='function'?ry(c):ry;const t=ysPlTry(key,c[0],c[1],r,o);if(typeof t==='string'){last=t;continue;}
  return ysPlBld(key,t.B,t.y,why,b,null,Object.assign({x:c[0],z:c[1]},(o&&o.extra)||{}));}return ysPlRefuse(last);}
// candidates in a block: a preferred offset first, then a 12 m grid over the built square nearest it
function ysPlCands(b,u0,v0,h){const out=[ysPlAt(b,u0,v0)];const g=[];for(let u=-h;u<=h;u+=12)for(let v=-h;v<=h;v+=12)g.push([u,v,Math.hypot(u-u0,v-v0)]);g.sort((p,q)=>p[2]-q[2]);for(const q of g)out.push(ysPlAt(b,q[0],q[1]));return out;}

// ---------------------------------------------------------------- reserved before anything: streets, canals, highways
for(const s of LAYOUT.streets)ysPlTake(ysPlStrip(s.a,s.b,s.w,'street:'+s.kind));
for(const h of LAYOUT.highways)for(let i=1;i<h.pts.length;i++)ysPlTake(ysPlStrip(h.pts[i-1],h.pts[i],h.w,'highway'));

// ---------------------------------------------------------------- host types (the drowned quarter's Ancients)
// What the records need to know about a builder before it runs: its storey table, its face radius at a local height and
// bearing, where it may be cut, how it stands, where pods may go. Mirrored from the vendored kit (52-sky-abc, 56-sky-d,
// 71-sky-h) like ysHostMembers; re-read them if the kit changes. Travis's list (Oct 2 2026) leaves out B (lobes), F, I, J
// and the arcologies but the Pierced Stack and the Bole; C carries its body 150 m up on legs, E is a glass lens behind a
// diagrid with no wall to root a pod in. A, D and H are here; the Pierced Stack and the Bole wait on the alternates'
// helpers (KNOWN_ISSUES.md).
//  plate(k)  the top of plate k, builder y        rAt(yl,th)  the face radius at builder y, local bearing (null: a mean)
//  sink      'plate': sunk so plate k0 is near the L2 datum (A's plates start 64 m up); 'seabed': it stands on the bed
//  bearings  local bearings for n pods            avoid(yl,h)  true where a pod of height h at plate yl hits the host's own
//  crownY    a full tower's last pod-free height   minY        the lowest pod floor, world (the L1 datum)
const YS_HOST_TYPES={
 skyA:{name:'the Conocylinder',builder:'buildSkyA',key:'skyA',H:420,Y0:64,podium:64,cap:66,
  floors:{y0:64,pitch:8,top:.35,first:2.5},k0:2,           // pods from plate 2 up: plates 0 and 1 stand among the strut heads
  plate:k=>64+(k?k*8+.35:2.5),
  rAt:(yl)=>{if(yl<5)return 64;if(yl<64)return 22-4*(yl-5)/64;const t=clamp((yl-64)/356,0,1);return 40+26*Math.pow(Math.abs(t-.42)/.58,1.7)*(t<.42?1:1.15);},
  cuts:{tall:[168,240],mid:[128,160],low:[104,120]},crownY:408,   // a full tower's crown strut ring starts at 414
  sink:'plate',plateAt:28,                                    // plate k0 is sunk to about the L2 datum
  bearings:(st,n)=>{const a0=st.range(0,TAU);return [...Array(n)].map((_,i)=>a0+i*TAU/n+st.range(-.12,.12));}},
 // the Monolith: a rounded square (se 3.2) of bare concrete, plates every 6 m, the lift-core spine on local +x
 skyD:{name:'the Monolith',builder:'buildSkyD',key:'skyD',H:340,Y0:14,podium:44,cap:46,shaped:true,square:true,
  floors:{y0:20,pitch:6,top:.3,first:.3},k0:0,plate:k=>20+6*k+.3,
  rAt:(yl,th)=>{if(yl<14)return 44;const t=clamp(yl/340,0,1);const r=30*(1-.12*t)+(t>.84?9*Math.pow((t-.84)/.16,.7):0);return r*(th==null?1.08:se(th,3.2));},
  cuts:{tall:[170,260],mid:[110,164],low:[62,98],land:[44,74]},crownY:262,sink:'seabed',minY:9,
  bearings:(st,n)=>ysPlFaces([Math.PI/2,Math.PI,3*Math.PI/2],st,n)},   // never on the spine's face
 // the Warden: a square keep (se 7), plates every 6 m, setback ledges with corner turrets every 66 m
 skyH:{name:'the Warden',builder:'buildSkyH',key:'skyH',H:330,Y0:8,podium:52,cap:50,shaped:true,square:true,
  floors:{y0:14,pitch:6,top:.3,first:.3},k0:0,plate:k=>14+6*k+.3,
  rAt:(yl,th)=>{if(yl<8)return 52;const t=clamp(yl/330,0,1);const step=Math.floor(t*5)/5;const h=34*(1-.45*step)-2*(t*5-step*5)*.3;
   const g=th!=null&&Math.abs(Math.sin(2*th))>.995?.9:1;return h*(th==null?1.1:se(th,7))*g;},
  cuts:{tall:[170,250],mid:[110,164],low:[62,98],land:[44,74]},crownY:318,spire:371,sink:'seabed',minY:9,   /* spire: the finial's top (builder y), where the Pharos's beam must clear */
  avoid:(yl,h)=>[66,132,198,264].some(ys=>yl-1.5<ys+9&&yl+h+1.5>ys-1),   // a ledge and the turrets on it
  bearings:(st,n)=>ysPlFaces([0,Math.PI/2,Math.PI,3*Math.PI/2],st,n)}
};
// the five types built to be hosts (kits/ancients 8ap-host-*, vendored as 69h-host-*): their specs are already in this
// shape. L the Facet and M the Bastion are skyscrapers; the Arcades, the Capsule Stalks and the Bell Hall are mid-rises
// for the shallows and the land quarter.
for(const S of [HOSTSPEC_FACET,HOSTSPEC_BASTION,HOSTSPEC_ARCADES,HOSTSPEC_STALKS,HOSTSPEC_BELLHALL])YS_HOST_TYPES[S.key]=S;
// the Ancients brought in as hosts for the land quarter's density (Travis, Oct 5 2026: Sky B, C, E, J, K, the Attraction,
// the Pierced Stack as stumps; the Undulant house, the office alternate and the Ancient Library whole): their specs are
// `69i-host-ancients.js` (YS_HOST_ANCIENTS) when vendored; a pool entry whose type is not here is skipped
for(const S of (typeof YS_HOST_ANCIENTS!=='undefined'?YS_HOST_ANCIENTS:[]))YS_HOST_TYPES[S.key]=S;
for(const S of (typeof YS_HOST_OFFICES!=='undefined'?YS_HOST_OFFICES:[]))YS_HOST_TYPES[S.key]=S;   /* the original kit's offices and apartments (69j), whole, on land */
for(const k of ['altUndulant','altOffice1','altLibrary'])if(YS_HOST_TYPES[k])YS_HOST_TYPES[k].whole=true;
// bearings on a square host's faces: the face centres in a random order, then the faces again either side of centre
function ysPlFaces(F,st,n){const f=F.slice();for(let i=f.length-1;i>0;i--){const j=st.int(0,i);[f[i],f[j]]=[f[j],f[i]];}
 const out=[];for(let i=0;i<n;i++){const k=i%f.length,lap=Math.floor(i/f.length);out.push(f[k]+(lap?(lap%2?.32:-.32):0)+st.range(-.04,.04));}return out;}
// the host type for a block by its class (the Pharos and the plaza name theirs); Travis (Oct 5 2026): the Trays (F) take the Tripod's (C) turns
const PL_TYPES={tall:[['skyA',1],['skyD',1],['skyH',1],['skyL',1.2],['skyM',1.2],['skyB',.8],['skyF',.8],['skyJ',.8],['skyK',.8]],mid:[['skyA',.8],['skyD',1],['skyH',1],['skyL',1],['skyM',1],['skyB',.8],['skyE',.6],['skyJ',.8],['skyK',.8],['altStack',.8]],
 low:[['skyD',.5],['skyH',.5],['midArcades',1],['midStalks',1],['midBell',1],['altAttraction',.8],['altStack',.6]],land:[['skyD',.5],['skyH',.5],['midArcades',1.2],['midStalks',1.2],['midBell',1.2],['skyB',.7],['skyE',.6],['altAttraction',.8],['altStack',.8],['altApart',1],['altOffices',1],['altOfficeC',1]],
 full:[['skyA',1],['skyD',1],['skyH',1],['skyL',1],['skyM',1]],landTall:[['skyD',1],['skyH',1],['skyL',1],['skyM',1],['skyB',1],['skyE',1]],
 villa:[['altUndulant',1]],band:[['midArcades',1],['altStack',1],['skyE',.8],['skyD',.5],['skyH',.5]]};   /* the band: stumps whose cut keeps plates for a way in (not the Stalks or the Bell Hall) */
function ysPlType(st,cls){const L=(PL_TYPES[cls]||PL_TYPES.mid).filter(e=>YS_HOST_TYPES[e[0]]);if(!L.length)return null;let t=L.reduce((s,e)=>s+e[1],0)*st.next();for(const [k,w] of L){t-=w;if(t<=0)return k;}return L[L.length-1][0];}
// the grown pools: [key, weight]; the way-in pods per wealth (a host needs one: every-host-has-a-way-in)
const PL_PODS={
 poor:[['hyk_pod_poor_2',3],['hyk_pod_poor_1',1],['hyk_pod_shop_food',.5],['hyk_pod_shop_general',.4],['hyk_pod_shop_salt',.3],['hyk_pod_shrine_tides',.3]],
 middle:[['hyk_pod_mid_2',2.5],['hyk_pod_mid_1',1],['hyk_pod_shop_armour',.35],['hyk_pod_shop_weapon',.35],['hyk_pod_shop_alchemy',.35],['hyk_pod_shop_chandler',.35],['hyk_pod_shop_salt',.3],
  ['hyk_pod_shop_cloth',.35],['hyk_pod_shop_potter',.35],['hyk_pod_tavern_2',.4],['hyk_pod_shrine_tides',.3],['hyk_pod_shrine_seagods',.3]],
 rich:[['hyk_pod_rich_2',2.5],['hyk_pod_rich_1',1],['hyk_pod_shop_pearl',.6],['hyk_pod_shrine_seagods',.35],['hyk_pod_shop_alchemy',.3]]};
const PL_WAYS={poor:[['hyk_pod_poor_1',1]],middle:[['hyk_pod_mid_1',2],['hyk_pod_shop_food',1],['hyk_pod_shop_general',1],['hyk_pod_tavern_1',1]],rich:[['hyk_pod_rich_1',1]]};
const PL_PODN={poor:4,middle:5,rich:6,full:8};
const PL_QUARTER={n:0,library:false};   // the quarter hosts placed so far (two offices first, then the Library)
const YS_RUINS_POLY=[[1153.1,290.4],[1162.2,-13.0],[899.0,-56.8],[813.2,392.1],[931.2,584.5],[1157.9,485.7]];   // Travis: the ruined shallows east of the Amphitriton
const YS_BAND=[[471.5,-122.0],[851.4,-728.1],[875.6,-644.6],[718.0,-34.6],[530.7,-106.1]];   // Travis: the half-sunk Ancients' strip
// one host record: the type, the cut snapped to a storey, how it stands (sunk for A, on the bed for D and H), its plates
// (world y) and its pods spread over them (different plates, a few apart, every pod's floor a plate's top)
function ysPlHost(b,o){const st=ysPlStream(o.land?'land host record':'host',b);const cls=o.full?'full':o.land?'land':b.host||'mid';const T=YS_HOST_TYPES[o.type||ysPlType(st,cls)];if(!T)return ysPlRefuse('no host type for '+cls);
 // a land host (decay 3, reclaimed) stands on the ground, its pods above its podium's colonnade (17 m)
 const sink=o.land?o.y-.5-(T.foot||0):T.sink==='seabed'?Math.min(terrainH(b.x,b.z),b.y)-1.5:-(T.plate(T.k0)-T.plateAt)+st.range(-2.5,2.5);
 const whole=o.full||o.whole||(o.land&&(/^mid/.test(T.key)||T.whole));   /* a reclaimed mid-rise, a villa, an office, the Library stand whole */
 let cutY=null;if(!whole){const r=o.cutRange||T.cuts[cls]||T.cuts.mid;const n0=Math.ceil((r[0]-T.Y0)/T.floors.pitch),n1=Math.floor((r[1]-T.Y0)/T.floors.pitch);cutY=T.Y0+st.int(n0,n1)*T.floors.pitch;}
 const top=(whole?T.crownY:cutY)+sink;const ry=T.square?PL_RY+st.int(0,3)*Math.PI/2:st.range(0,TAU);
 const P='Project '+T.key.slice(3);const nm=T.name.replace('the ','');const mid=/^mid/.test(T.key);
 const rec={n:o.name||(o.full?P+' tower ('+b.i+','+b.j+')':o.land?'The reclaimed '+nm+' ('+b.i+','+b.j+')':mid?'The drowned '+nm+' ('+b.i+','+b.j+')':'The '+nm+' stump ('+b.i+','+b.j+')'),block:b.i+','+b.j,use:b.use,type:T.key,builder:T.builder,
  x:o.x!=null?o.x:b.x,z:o.z!=null?o.z:b.z,ry,sink:+sink.toFixed(2),d:o.full?4:o.land?3:1,land:!!o.land,cutY,full:!!o.full,cls,podium:T.podium,cap:{hw:T.cap},floors:T.floors,top:+top.toFixed(2),
  shaped:!!T.shaped,wealth:b.wealth,tall:!!o.tall,plates:[],pods:[],ways:[],spireY:T.spire!=null?+(T.spire+sink).toFixed(2):null};
 rec.rAt=(y,a)=>T.rAt(y-rec.sink,a==null?null:a+rec.ry);   // a world bearing a is the local bearing a + ry
 for(let k=T.k0;k<400;k++){const y=T.plate(k)+sink;if(y>top-4)break;const lo=o.land?sink+(T.lo!=null?T.lo:(/^mid/.test(T.key)?4:18)):T.minY;   /* a mid-rise has a terrace, not a colonnade, at its foot */if(lo!=null&&y<lo)continue;rec.plates.push(+y.toFixed(2));}
 // the pods: the way in first, then the wealth pool; bearings from the type, plates stepped about a base
 const n=o.pods!=null?o.pods:PL_PODN[o.full?'full':b.wealth];const keys=[o.way||ysPlPick(st,PL_WAYS[b.wealth])];for(const k of (o.must||[]))keys.push(k);
 while(keys.length<n)keys.push(ysPlPick(st,PL_PODS[b.wealth]));
 const TH=T.bearings(st,keys.length),Pl=rec.plates;const STEP=[0,2,-1,3,1,-2,4,-3];const base=o.land?0:Math.min(Pl.length-1,Math.max(0,Math.round(Pl.length*(o.full?.18:.35))));   // a land host's pods at ground scale: the lowest plates
 const ok=(k,D)=>Pl[k]+D.h+2<=top&&!(T.avoid&&T.avoid(Pl[k]-sink,D.h));
 const place=(key,i)=>{const D=HYK.defs[key];if(!D||!Pl.length)return false;let k=clamp(base+STEP[i%STEP.length]*(o.full?3:1),0,Pl.length-1);
  const isCrown=o.crown&&key===o.crown;if(isCrown){k=Pl.length-1;while(k>0&&T.avoid&&T.avoid(Pl[k]-sink,D.h))k--;}   /* the crown on the top plate, over the cut if need be (Travis: at the actual top; its beam is hoisted over the spire) */
  if(!isCrown&&!ok(k,D)){let best=-1;for(let d=1;d<Pl.length;d++){for(const q of [k-d,k+d])if(q>=0&&q<Pl.length&&ok(q,D)){best=q;break;}if(best>=0)break;}if(best<0)return false;k=best;}   // the pod clears the cut and the host's own ledges
  const y=Pl[k];const a=TH[i]-ry;const into=!!D.into;   // an into def is drawn only as a way in (the kit sheet tests it so: the Urchin pod's other layout puts its store in the door swing)
  rec.pods.push({key,a:+a.toFixed(4),y,level:y>=20?'L2':'L1',into,wealth:D.tags.wealth});if(into)rec.ways.push({a:+a.toFixed(4),y,R:D.w/2});ysPlCount(key);return true;};
 // the way in first: if the wealth's way-in pod fits no plate, the smallest one (every host needs a way in)
 keys.forEach((key,i)=>{if(!place(key,i)&&i===0)place('hyk_pod_poor_1',0);});
 // pods round one host stand on different plates (Travis, Oct 2026): if the cut squeezed them onto one, move a pod that
 // fits to the nearest other plate
 if(rec.pods.length>1&&new Set(rec.pods.map(p=>p.y)).size<2){const y0=rec.pods[0].y;const alt=Pl.filter(y=>y!==y0).sort((p,q)=>Math.abs(p-y0)-Math.abs(q-y0));
  for(const p of rec.pods.slice(1)){const D=HYK.defs[p.key];const y=alt.find(y=>y+D.h+2<=top&&!(T.avoid&&T.avoid(y-sink,D.h)));if(y==null)continue;p.y=y;p.level=y>=20?'L2':'L1';const w=rec.ways.find(w=>w.a===p.a);if(w)w.y=y;break;}}
 // a type whose faces leave pods one usable plate (the Capsule Stalks' smooth band) keeps only its way in
 if(rec.pods.length>1&&new Set(rec.pods.map(p=>p.y)).size<2){for(const p of rec.pods.slice(1))PL_COUNT[p.key]--;rec.pods.length=1;rec.ways=rec.ways.filter(w=>w.a===rec.pods[0].a);}
 // SOCKETS (the Capsule Stalks): pods plug into the capsule sockets on all three cores, each on the row just above a
 // plate, framed on its own core's axis (the draw pass gives HYK.placeOn a proxy host per core). Not into a face that
 // looks at another core, not across a bridge or the disc, clear of each other and of the centre stalk's pods; the
 // tubes a pod covers are left out by the builder (ysSocketTaken).
 if(T.sockets&&typeof HST!=='undefined'){const S=T.sockets(rec.d),cy=ry,cs=Math.cos(cy),sn=Math.sin(cy);rec.sockets=[];
  const pool=PL_PODS[b.wealth].filter(e=>!HYK.defs[e[0]].into),core=n=>HST.CORES.find(c=>c.n===n);
  const placed=rec.pods.map(p=>({c:'A',th:p.a+ry,y0:p.y-sink,y1:p.y-sink+HYK.defs[p.key].h,R:HYK.defs[p.key].w/2}));
  const cand=[];for(const s of S){const yl=Pl.map(y=>y-sink).find(y=>s.y-y>=.4&&s.y-y<=1.7);if(yl!=null)cand.push({s,yl,u:st.next()});}
  cand.sort((p,q)=>p.u-q.u);let got=0;const want=PL_PODN[b.wealth];
  for(const {s,yl} of cand){if(got>=want)break;const C=core(s.core);const key=ysPlPick(st,pool),D=HYK.defs[key],R=D.w/2;
   const capT=Math.min(C.top,whole?C.top:cutY);if(yl+D.h+1>capT)continue;
   const th=Math.atan2(s.nz,s.nx);
   if(HST.CORES.some(o=>o!==C&&o.top>yl&&Math.abs(Math.atan2(Math.sin(Math.atan2(o.z-C.z,o.x-C.x)-th),Math.cos(Math.atan2(o.z-C.z,o.x-C.x)-th)))<.8))continue;
   if(C.n===HST.DISC.core&&yl<HST.DISC.y+1.5&&yl+D.h>HST.DISC.y-1.5)continue;
   if(HST.BRIDGES.some(([a,bb,y])=>(a===C.n||bb===C.n)&&yl<y+2&&yl+D.h>y-2))continue;
   const clash=placed.some(t=>{if(yl>=t.y1+1||yl+D.h<=t.y0-1)return false;if(t.c===C.n){let d=Math.abs(th-t.th);d=Math.min(d,TAU-d);return d*C.r<R+t.R+1.2;}
    const T2=core(t.c);const ax=C.x+Math.cos(th)*(C.r+R),az=C.z+Math.sin(th)*(C.r+R),bx=T2.x+Math.cos(t.th)*(T2.r+t.R),bz=T2.z+Math.sin(t.th)*(T2.r+t.R);return Math.hypot(ax-bx,az-bz)<R+t.R+2;});
   if(clash)continue;
   placed.push({c:C.n,th,y0:yl,y1:yl+D.h,R});rec.sockets.push({core:C.n,cx:C.x,cz:C.z,th,y0:yl-.5,y1:yl+D.h+.5,r:C.r,half:R+.9});
   const wy=yl+sink;rec.pods.push({key,a:+(th-ry).toFixed(4),y:+wy.toFixed(2),level:wy>=20?'L2':'L1',into:false,wealth:D.tags.wealth,core:C.n,cr:C.r,
    cx:+(rec.x+C.x*cs+C.z*sn).toFixed(2),cz:+(rec.z-C.x*sn+C.z*cs).toFixed(2)});ysPlCount(key);got++;}}
 ysPlTake(ysPlBox(rec.x,rec.z,T.cap*(o.capScale||1),T.cap*(o.capScale||1),PL_RY,'host '+rec.n));PLACE.hosts.push(rec);return rec;}

// ---------------------------------------------------------------- the frontage walker: a block's streets lined with buildings
// The four sides of a block, nearest the market first; `sides` of them are built. Along a side the cursor drops a def from
// the pool, front to the street, set back from the street edge, a gap after it (and now and then a garden); a refusal
// moves the cursor on 6 m. h is the half-size of the built square (91 on a land block: the street's edge plus 2 m).
const PL_POOL={
 poor:[['hyk_house_poor_1',3],['hyk_house_poor_2',3],['hyk_house_poor_3',3],['hyk_shop_food',.4],['hyk_shop_general',.4],['hyk_smithy_small',.3]],
 middle:[['hyk_house_mid_1',2.5],['hyk_house_mid_2',2],['hyk_house_mid_3',2.5],['hyk_shop_armour',.25],['hyk_shop_weapon',.25],['hyk_shop_alchemy',.25],['hyk_shop_food',.3],['hyk_shop_general',.3],
  ['hyk_shop_chandler',.25],['hyk_shop_salt',.25],['hyk_shop_cloth',.25],['hyk_shop_potter',.25],['hyk_tavern_1',.25]],
 rich:[['hyk_house_rich_1',2],['hyk_house_rich_2',2],['hyk_house_rich_3',2],['hyk_shop_pearl',.4],['hyk_inn',.2]],
 market:[['hyk_shop_armour',1],['hyk_shop_weapon',1],['hyk_shop_alchemy',1],['hyk_shop_food',1.4],['hyk_shop_general',1.4],['hyk_shop_chandler',1],['hyk_shop_pearl',.8],['hyk_shop_salt',1],
  ['hyk_shop_cloth',1],['hyk_shop_potter',1],['hyk_tavern_1',.6],['hyk_inn',.3]],
 industry:[['hyk_warehouse_large',1.5],['hyk_warehouse_small',2],['hyk_smithy_large',1],['hyk_smithy_small',1.5],['hyk_granary',1]],
 foreign:[['iziz',1]]};   // placeholder: the foreign quarter's plots are slots (sizes from PL_FOREIGN)
// small buildings for the courtyard rings: the houses and the corner shops of each wealth (no inns, no big shops)
const PL_SMALL={poor:[['hyk_house_poor_1',3],['hyk_house_poor_2',3],['hyk_house_poor_3',3],['hyk_shop_food',.5],['hyk_shop_general',.5]],
 middle:[['hyk_house_mid_1',3],['hyk_house_mid_3',3],['hyk_house_poor_2',1],['hyk_shop_alchemy',.4],['hyk_shop_salt',.4],['hyk_shop_food',.5]],
 rich:[['hyk_house_mid_1',2],['hyk_house_mid_3',2],['hyk_house_rich_3',1],['hyk_shop_pearl',.6]]};
const PL_INDUSTRY_SMALL=[['hyk_warehouse_small',2],['hyk_smithy_small',1.5],['hyk_house_poor_2',1],['hyk_shop_general',.4]];   // the industry blocks' lanes
const PL_GAP={poor:[2,5],middle:[3,7],rich:[6,13],market:[3,6],industry:[6,12],foreign:[5,10]};
const PL_GARDEN={poor:.06,middle:.1,rich:.18,market:0,industry:.15,foreign:.1};
const PL_FOREIGN={iziz:[[14,12],[16,13],[12,12]],republic:[[13,11],[15,12],[18,10]],voth:[[16,14],[20,16]]};
function ysPlSides(b,h){const S=[[PL_U,PL_V],[[-PL_U[0],-PL_U[1]],PL_V],[PL_V,PL_U],[[-PL_V[0],-PL_V[1]],PL_U]];
 return S.map(([n,t])=>({n,t,mx:b.x+n[0]*h,mz:b.z+n[1]*h})).sort((p,q)=>Math.hypot(p.mx-CITY.HEAD[0],p.mz-CITY.HEAD[1])-Math.hypot(q.mx-CITY.HEAD[0],q.mz-CITY.HEAD[1]));}
function ysPlFront(b,o){const st=ysPlStream('front:'+(o.tag||''),b);const pool=o.pool,h=o.h||91,sides=ysPlSides(b,h).filter(S=>!o.only||o.only.some(n=>n[0]*S.n[0]+n[1]*S.n[1]>.9)).slice(0,o.sides||4);let n=0;
 for(const S of sides){let t=-h+4;const ry=o.inward?ysPlFacing(-S.n[0],-S.n[1]):ysPlFacing(S.n[0],S.n[1]);   /* inward: a courtyard ring, backs to the street frontage */
  while(t<h-4&&n<(o.max||99)){if(st.chance(PL_GARDEN[o.kind]||0)){t+=st.range(12,22);continue;}
   let key,w,d,fq=null;if(o.kind==='foreign'){fq=o.foreign;const sz=st.pick(PL_FOREIGN[fq]);w=sz[0];d=sz[1];key=null;}else{key=ysPlPick(st,pool);const D=HYK.defs[key];w=D.w;d=D.d;}
   if(t+w>h-4)break;const s=t+w/2;const cx=b.x+S.n[0]*(h-d/2)+S.t[0]*s,cz=b.z+S.n[1]*(h-d/2)+S.t[1]*s;
   const B=ysPlBox(cx,cz,w/2+1,d/2+1,ry,key||'slot');{const c=ysPlClash(B);if(c){ysPlRefuse('occupied by '+ysPlWhat(c));t+=6;continue;}}
   const y=ysPlGround(B,o.ground);if(y==null){t+=6;continue;}
   if(key)ysPlBld(key,B,y,o.why,b,st);else{ysPlTake(B);const slot={kind:'foreign',foreign:fq,swap:PL_SWAP[fq],x:cx,z:cz,ry,w,d,y,block:b.i+','+b.j,box:B};PLACE.slots.push(slot);
    if(o.standIn){const fit=PL_POOL.middle.filter(([k])=>HYK.defs[k].w<=w&&HYK.defs[k].d<=d);if(fit.length){const k2=ysPlPick(st,fit);const r=ysPlBld(k2,ysPlBox(cx,cz,HYK.defs[k2].w/2,HYK.defs[k2].d/2,ry,k2),y,o.why+' stand-in',b,st);r.standIn=true;slot.standIn=r;}}}
   n++;t+=w+st.range(...PL_GAP[o.kind]);}}
 return n;}
const PL_SWAP={iziz:['vern_*'],republic:['hl_rep_*'],voth:['voth_embassy','voth_townhouse_*']};

// ---------------------------------------------------------------- the shore run: harbour pieces squared to the real waterline
// Walk the mainland coast by arc length; where the coast lies in one of the named blocks, put the next piece of the
// sequence with its origin on the quay line (3 m inland of the natural waterline, found along the shore's water normal),
// its front to the water, and a fill apron behind it to the quay datum so the land part stands on the quay.
function ysPlWaterline(x,z,nx,nz){const f=t=>terrainH(x+nx*t,z+nz*t)-.3;if(f(80)>0)return null;
 // march in from the water to the first dry ground (a low beach can stay under +0.3 for a long way), then bisect
 let hi=80,lo=null;for(let t=77;t>=-150;t-=3){if(f(t)>0){lo=t;break;}hi=t;}if(lo==null)return null;
 for(let k=0;k<20;k++){const m=(lo+hi)/2;if(f(m)>0)lo=m;else hi=m;}return [x+nx*lo,z+nz*lo];}
function ysPlShoreRun(uses,seq,o){o=o||{};const L=SHORE_LOOPS[0];const st=ysPlStream('shore:'+uses.join('+'));let i=0,s=0,placed=0;
 while(s<L.len&&i<seq.length*(o.loops||1)){const at=shoreAt(L,s);const g=ysBlockIJ(at.x,at.z);const b=ysBlock(Math.round(g[0]),Math.round(g[1]));
  if(!b||uses.indexOf(b.use)<0){s+=10;continue;}
  // shoreAt picks the wetter side from ±9 m; on a flat beach both read alike, so the run decides it from ±40 m
  if(terrainH(at.x+at.nx*40,at.z+at.nz*40)>terrainH(at.x-at.nx*40,at.z-at.nz*40)){at.nx=-at.nx;at.nz=-at.nz;}
  const it=seq[i%seq.length];const D=HYK.defs[it.key||it];const key=it.key||it;const back=it.back||0;
  const wl=ysPlWaterline(at.x,at.z,at.nx,at.nz);const lg=why=>PLACE.shoreLog.push([uses[0],Math.round(s),key,why]);if(!wl){lg('no waterline');s+=8;continue;}
  const ox=wl[0]-at.nx*(3+back),oz=wl[1]-at.nz*(3+back);const ry=ysPlFacing(at.nx,at.nz);
  // the honest box: from 8 m behind the origin to the def's depth in front (a back-set piece is wholly on land)
  const fwd=back?D.d/2:D.d/2-8;const B=ysPlBox(ox+at.nx*fwd,oz+at.nz*fwd,D.w/2+1,D.d/2+1,ry,key);
  {const c=ysPlClash(B,/^street:(canal|awash)/);if(c){ysPlRefuse('occupied: shore by '+ysPlWhat(c));lg(c.tag);s+=8;continue;}}   // a pier runs out over the drowned grid's canal lines: they are the harbour's water
  if(ysRiverDist(ox,oz).d<ysRiverDist(ox,oz).w*2.6+6){ysPlRefuse('river valley');lg('river');s+=12;continue;}
  const Bl=ysPlBox(ox-at.nx*8,oz-at.nz*8,D.w/2+3,(back?D.d/2+3:9),ry,'apron');   // the land part: the apron behind the quay line
  ysPlMole('quay apron '+key,ysPlBoxPoly(Bl),2.5,5);
  ysPlBld(key,B,2.5,o.why||'shore',b,st,{shore:true,x:ox,z:oz,over:/^street:(canal|awash)/});lg('placed');placed++;i++;s+=(D.w+(it.gap!=null?it.gap:st.range(6,12)));}
 return placed;}

// ================================================================= THE PASS
(function placePass(){const A=LAYOUT.A,LM=LAYOUT.landmarks;const toA=b=>[A.x-b.x,A.z-b.z];
 // ---- 1. the landmarks by name, each with its one freedom (the facing)
 // the Amphitriton on its island: the plinth's foot at sea level on a fill to just under it; +z to the land and the drawbridge
 {const ry=ysPlFacing(-PL_N[0],-PL_N[1]);ysPlMole('the Amphitriton island',[...Array(24)].map((_,k)=>[A.x+58*Math.cos(k/24*TAU),A.z+58*Math.sin(k/24*TAU)]),-.4,14,{plate:false});
  ysPlByName('hyk_amphitriton',A.x,A.z,ry,'landmark',A,{y:0,margin:2});}
 // the Temple of the Tides on a mole at the quay datum, its back (the wet door) flush with the mole's edge toward the Amphitriton
 // (Travis: the Tides' and the Library's podiums are organic, ysPlOrganic, sized so the building's box lies inside at the
 // outline's narrowest; the Tides' back still stands near the mole's edge toward the Amphitriton)
 if(LM.temple_tides){const b=LM.temple_tides;const d=toA(b),l=Math.hypot(d[0],d[1]);const ry=ysPlFacing(-d[0]/l,-d[1]/l);const D=HYK.defs.hyk_temple_tides;const st=ysPlStream('mole',b);
  const o=ysPlOrganic(st,b.x-d[0]/l*10,b.z-d[1]/l*10,66,{n:16,amp:.14,e:1.15,a:Math.atan2(-d[0]/l,d[1]/l)+Math.PI/2,off:0});ysPlMole('the Tides mole',o.poly,2.5,6,{wall:true,star:o.c,node:{kind:'mole',n:'the Tides mole',wealth:'civic',block:b.i+','+b.j}});
  ysPlByName('hyk_temple_tides',b.x,b.z,ry,'landmark',b,{y:2.5});}
 // the Library on its mole, facing the Tides
 if(LM.library){const b=LM.library;const t=LM.temple_tides||A;const d=[t.x-b.x,t.z-b.z],l=Math.hypot(d[0],d[1]);const ry=ysPlFacing(d[0]/l,d[1]/l);const D=HYK.defs.hyk_library;const st=ysPlStream('mole',b);
  const o=ysPlOrganic(st,b.x+d[0]/l*6,b.z+d[1]/l*6,54,{n:14,amp:.16,e:1.2,a:Math.atan2(-d[0]/l,d[1]/l)+Math.PI/2,off:0});ysPlMole('the Library mole',o.poly,2.5,6,{wall:true,star:o.c,node:{kind:'mole',n:'the Library mole',wealth:'civic',block:b.i+','+b.j}});ysPlByName('hyk_library',b.x,b.z,ry,'landmark',b,{y:2.5});}
 // the Temple of the Winds on its stack's top, facing the Amphitriton; the Citadel on its stack, the bridge door (local -x) toward it
 if(LM.temple_winds){const b=LM.temple_winds;const d=toA(b),l=Math.hypot(d[0],d[1]);const ry=ysPlFacing(d[0]/l,d[1]/l);const y=ysPlGround(ysPlDefBox('hyk_temple_winds',b.x,b.z,ry,0),{stack:true,slope:20});
  ysPlByName('hyk_temple_winds',b.x,b.z,ry,'landmark',b,{y:y!=null?y:terrainH(b.x,b.z)});}
 if(LM.citadel){const b=LM.citadel;const P=LM.pharos||A;const d=[P.x-b.x,P.z-b.z],l=Math.hypot(d[0],d[1]);const ry=ysPlFacing(d[0]/l,d[1]/l);const y=terrainH(b.x,b.z);   /* the gate faces the Pharos: its span lands there */
  ysPlByName('hyk_citadel',b.x,b.z,ry,'landmark',b,{y,skip:/^street/,extra:{over:/^street/}});   /* the drowned grid's canal lines run under its stack */
  // the Treasury in the precinct outside the wall, on the stack's side away from the gate
  const a0=Math.atan2(-d[1],-d[0]);const C=[];for(const r of [61,65,57])for(let k=0;k<12;k++){const a=a0+(k%2?1:-1)*Math.ceil(k/2)*.35;C.push([b.x+r*Math.cos(a),b.z+r*Math.sin(a)]);}
  ysPlSeek('hyk_treasury',C,c=>ysPlFacing(b.x-c[0],b.z-c[1]),'landmark',b,{ground:{stack:true,slope:7}});}
 // the Wet Cells: an island reached only by water, at the water datum
 if(LM.wet_cells){const b=LM.wet_cells;const g=terrainH(b.x,b.z);const sk=Math.max(2.6,-g+.6);   /* its rock rises from the bed (the builder reads `sink`) */
  ysPlByName('hyk_wet_cells',b.x,b.z,ysPlFacing(b.x-CITY.STACKS[2].x,b.z-CITY.STACKS[2].z),'landmark',b,{y:0,skip:/^street/,extra:{over:/^street/,sink:sk}});}
 // ---- 2. the hosts: the Pharos and two more full-height towers, the grown plaza's host, then every host block
 const hostBlocks=LAYOUT.blocks.filter(b=>b.use==='host');
 if(LM.pharos)ysPlHost(LM.pharos,{type:'skyH',full:true,name:'The Pharos',crown:'hyk_pharos_crown',must:['hyk_pharos_crown'],way:'hyk_pod_rich_1',pods:4});   /* on a Project H (Travis) */
 // the full towers: farthest-point picks among the tall hosts in open water, away from the Pharos and the Amphitriton
 {const tall=hostBlocks.filter(b=>b.host==='tall');const chosen=[LM.pharos||A,A];const full=tall.filter(b=>typeof b.full==='string');chosen.push(...full);
  for(let n=full.length;n<2&&tall.length;n++){let best=null;for(const b of tall){if(full.indexOf(b)>=0)continue;const d=Math.min(...chosen.map(c=>Math.hypot(c.x-b.x,c.z-b.z)));if(!best||d>best.d)best={b,d};}
   if(!best)break;full.push(best.b);chosen.push(best.b);}
  for(const b of full){const type=typeof b.full==='string'?b.full:null;b.full=true;ysPlHost(b,Object.assign({full:true},type?{type}:{}));}}
 if(LM.grown_plaza){const b=LM.grown_plaza;ysPlHost(Object.assign(b,{host:'mid'}),{name:'The grown plaza',must:['hyk_market_plaza'],pods:3});}
 // the hosts of every other block: an awash block's is a low one (D or H, cut short, standing on the bed)
 // a scenery stack (the Needle, the Tooth...) standing in a host block's cap leaves the block to the water
 const onStack=b=>CITY.STACKS.some(t=>ysStackLocal(t,b.x,b.z).d<t.r*1.25+70);   /* any stack, the landmarks' too (the Citadel's stands over a block) */
 for(const b of hostBlocks){if(b.full)continue;if(onStack(b)){ysPlRefuse('karst: host block');continue;}ysPlHost(b,b.type?{type:b.type}:{});}
 // a host at a point Travis named: a synthetic block (90+k, 0), the ground or the bed under it, the block it falls in
 // kept from lanes (a lane would run through it); on land the box must be clear of the streets, in the water a canal
 // line may pass under
 let ysPlPointK=0;
 function ysPlHostAt(x,z,type,o){o=o||{};const g=ysBlockIJ(x,z);const home=ysBlock(Math.round(g[0]),Math.round(g[1]));const land=terrainH(x,z)>1;
  const b={i:90+ysPlPointK++,j:0,x,z,s:ysShoreDist(x,z),y:ysPlaneY(ysShoreDist(x,z)),kind:land?'land':'open',use:'host',host:'mid',wealth:o.wealth||'middle',point:true};
  const T=YS_HOST_TYPES[type];if(!T)return ysPlRefuse('point host: no type '+type);const cap=T.cap*(o.capScale||1);
  // the point first, then a 12 m grid out to 36 m round it, nearest first: the first clear spot (on land: with ground)
  const RE=o.reach||36;const cands=[[x,z]];for(let u=-RE;u<=RE;u+=12)for(let v=-RE;v<=RE;v+=12)if(u||v)cands.push([x+u,z+v]);cands.sort((p,q)=>Math.hypot(p[0]-x,p[1]-z)-Math.hypot(q[0]-x,q[1]-z));
  let at=null,y=null,why='occupied';for(const c of cands){const B=ysPlBox(c[0],c[1],cap,cap,PL_RY,'host');const cl=ysPlClash(B,land?null:/^street/);if(cl){why='occupied by '+ysPlWhat(cl);continue;}
   if(land){const n0=Object.assign({},PLACE.refused);y=ysPlGround(B,{slope:6});PLACE.refused=n0;if(y==null){why='no ground';continue;}}at=c;break;}
  if(!at)return ysPlRefuse('point host '+type+': '+why);b.x=at[0];b.z=at[1];
  LAYOUT.blocks.push(b);LAYOUT.by[b.i+','+b.j]=b;if(home&&!o.noHome)home.hostPlaced=true;
  const rec=ysPlHost(b,Object.assign({type,capScale:o.capScale||1},land?{land:true,y}:{},o.host||{}));if(rec&&o.name)rec.n=o.name;return rec;}
 // Travis (Oct 5 2026): two skyscraper stumps of types not yet standing, on the land quarter's points he named
 ysPlHostAt(165.3,117.0,'skyF',{host:{cutRange:[82,130],tall:true},name:'The Trays stump at the head'});   /* Travis: Sky F, not the Tripod */
 ysPlHostAt(47.7,495.4,'skyE',{reach:84,capScale:.72,host:{cutRange:[80,124],tall:true},name:'The Lens stump by the river'});   /* a tight spot between the river's valley and the grid's edge: the cap at 72 % (the lens narrows as it rises) */   /* the river's valley (2.6 widths) takes the point itself */
 // Travis (Oct 5 2026): the open strip east of the inner quarter, (304, 36) to (163, 603), 70 m wide: small reclaimed Ancients
 // (the Undulant villas and the Office B towers, the only podded types under 45 m across) every 52 m along its middle, each
 // with a few Hykkousoi houses round it
 {const A=[304,36],Bp=[163,603];const L=Math.hypot(Bp[0]-A[0],Bp[1]-A[1]);const st=ysPlStream('strip hosts',{i:81,j:0});let n=0;
  for(let s=30;s<L-30;s+=52){const t=s/L;const x=A[0]+(Bp[0]-A[0])*t,z=A[1]+(Bp[1]-A[1])*t;const type=st.chance(.55)?'altUndulant':'altOffices';if(!YS_HOST_TYPES[type])continue;
   const r=ysPlHostAt(x,z,type,{noHome:true,wealth:'middle',host:{pods:type==='altUndulant'?2:3}});if(!r)continue;n++;
   const b=LAYOUT.by[r.block],R=YS_HOST_TYPES[type].cap+9;const ring={poly:ysPlBoxPoly(ysPlBox(r.x,r.z,R,R,PL_RY)),star:[r.x,r.z],y:r.sink+.5,x0:r.x-R,x1:r.x+R,z0:r.z-R,z1:r.z+R};
   ysPlEdgeRun(ring,b,{pool:PL_SMALL.middle,kind:'middle',why:'strip ring',tag:'strip'+n,land:true,max:4});}
  PLACE.strip=n;}
 // Travis (Oct 5 2026): the office terrace stands in the ocean instead, whole and podded, at the two points he named
 if(YS_HOST_TYPES.altOffice1){ysPlHostAt(874.5,245.0,'altOffice1',{capScale:.8,host:{whole:true},name:'The sunk Terrace Wedge (east)'});ysPlHostAt(1179.5,-869.4,'altOffice1',{capScale:.8,host:{whole:true},name:'The sunk Terrace Wedge (north)'});}
 // the band of half-sunk Ancients (Travis): mid-rise hosts standing in the shallows along the coast north-east of the
 // head (YS_BAND, a strip 50–200 m offshore), every 125 m along its middle, sunk to the bed and cut low, each a node of
 // the bridge graph (the spanning tree links them to their neighbours and the shore)
 {const B=YS_BAND;const e0=[(B[0][0]+B[4][0])/2,(B[0][1]+B[4][1])/2],e1=[(B[1][0]+B[2][0])/2,(B[1][1]+B[2][1])/2];const mid=k=>[e0[0]+(e1[0]-e0[0])*k,e0[1]+(e1[1]-e0[1])*k];
  const L=Math.hypot(mid(1)[0]-mid(0)[0],mid(1)[1]-mid(0)[1]);const n=Math.floor(L/125);let got=0;
  for(let k=0;k<=n;k++){const c=mid((k+.5)/(n+1));if(terrainH(c[0],c[1])>-1)continue;const b={i:60+k,j:0,x:c[0],z:c[1],s:ysShoreDist(c[0],c[1]),y:ysPlaneY(ysShoreDist(c[0],c[1])),kind:'awash',use:'host',host:'low',wealth:k%3===0?'poor':'middle',band:true};
   const st=ysPlStream('band',b);const type=ysPlType(st,'band'),cap=YS_HOST_TYPES[type].cap*.8;{const cl=ysPlClash(ysPlBox(c[0],c[1],cap,cap,PL_RY,'host'),/^street/);if(cl){ysPlRefuse('band: occupied by '+ysPlWhat(cl));continue;}}
   LAYOUT.blocks.push(b);LAYOUT.by[b.i+','+b.j]=b;const rec=ysPlHost(b,{type,capScale:.8,cutRange:type==='midArcades'?YS_HOST_TYPES[type].cuts.mid:YS_HOST_TYPES[type].cuts.low});if(rec){rec.n='The half-sunk '+YS_HOST_TYPES[type].name.replace('the ','')+' ('+(k+1)+')';got++;}}
  PLACE.band=got;}
 // Travis (Oct 5 2026): the ruins in the shallows east of the Amphitriton (YS_RUINS_POLY): the Ancients' civic and
 // industrial buildings (64b-ys-ruins.js, YS_RUIN_TYPES) fully ruined, not podded, standing on the bed with their lower
 // floors under the water. Smallest first on a 25 m grid of the polygon in the stream's order, each at a bearing of its
 // own: its footprint (grown 4 m) clear of everything but the drowned grid's water lines, off every stack, its middle and
 // the half-way points to its corners inside the polygon (a big one may overhang the edge), every corner in the water and
 // the middle at least 6 m deep; it stands at the bed's lowest point under it, so nothing floats.
 PLACE.ruins=[];
 if(typeof YS_RUIN_TYPES!=='undefined'){const P=YS_RUINS_POLY;const st=ysPlStream('ruins',{i:80,j:0});
  const inP=(x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
  const xs=P.map(p=>p[0]),zs=P.map(p=>p[1]);const grid=[];for(let x=Math.min(...xs);x<=Math.max(...xs);x+=25)for(let z=Math.min(...zs);z<=Math.max(...zs);z+=25)if(inP(x,z))grid.push([x,z,st.next()]);
  grid.sort((p,q)=>p[2]-q[2]);const types=YS_RUIN_TYPES.slice().sort((p,q)=>p.w*p.d-q.w*q.d);
  for(const T of types){const ry=st.range(0,TAU);let got=null;
   for(const [x,z] of grid){const cx=T.cx||0,cz=T.cz||0;const mx=x+cx*Math.cos(ry)+cz*Math.sin(ry),mz=z-cx*Math.sin(ry)+cz*Math.cos(ry);   /* the footprint's middle (the builder's frame turned ry) */
    const Bx=ysPlBox(mx,mz,T.w/2+4,T.d/2+4,ry,'ruin '+T.key);if(ysPlClash(Bx,/^street/))continue;
    const poly=ysPlBoxPoly(Bx);if(!inP(mx,mz)||poly.some(p=>!inP((p[0]+mx)/2,(p[1]+mz)/2)))continue;   /* the middle and the half-way points in the polygon: a big one may overhang its edge a little */
    if(CITY.STACKS.some(s=>ysStackLocal(s,mx,mz).d<s.r*1.25+Math.max(T.w,T.d)/2+10))continue;
    const S=poly.concat([[mx,mz],[(poly[0][0]+mx)/2,(poly[0][1]+mz)/2],[(poly[2][0]+mx)/2,(poly[2][1]+mz)/2]]).map(p=>terrainH(p[0],p[1]));
    if(terrainH(mx,mz)>-6||S.some(h=>h>-2))continue;
    ysPlTake(Bx);got={key:T.key,builder:T.builder,name:T.name,x,z,ry:+ry.toFixed(3),d:4,sink:+(Math.min(...S)-.5).toFixed(2),box:Bx,w:T.w,dd:T.d,h:T.h};break;}
   if(got)PLACE.ruins.push(got);else ysPlRefuse('ruin: '+T.key);}}
 // the kit audit over the pods: a grown def no host drew takes the place of a pod whose def is drawn elsewhere, on a host
 // of its wealth if one has room, else on any (an into def opens a way where it lands)
 {const grown=HYK.order.filter(k=>HYK.defs[k].grown&&!/^hyk_(pharos_crown|market_plaza|spiral_stair)$/.test(k)&&!PL_COUNT[k]);
  for(const k of grown){const D=HYK.defs[k];let done=false;
   for(const pass of [0,1])for(const h of PLACE.hosts){if(done)break;if(pass===0&&h.wealth!==D.tags.wealth)continue;
    for(const p of h.pods){if(p.into||PL_COUNT[p.key]<2||p.y+D.h+2>h.top)continue;PL_COUNT[p.key]--;p.key=k;p.wealth=D.tags.wealth;p.into=!!D.into;
     if(p.into)h.ways.push({a:p.a,y:p.y,R:D.w/2});ysPlCount(k);done=true;break;}}}}
 // ---- 3. the precincts on land and in the shallows
 // the main market: the hall at the centre, its front to the docks; the block lined with shops
 {const b=ysBlock(0,0);if(b){ysPlSeek('hyk_market_main',[12,4,-4,-12,-20].map(k=>[b.x+PL_N[0]*k,b.z+PL_N[1]*k]),ysPlFacing(PL_N[0],PL_N[1]),'main market',b,{margin:3,skip:/^highway/,extra:{over:/^highway/}});ysPlFront(b,{pool:PL_POOL.market,kind:'market',why:'main market',sides:4});}}
 // the headland: a mole over the awash block at the quay datum, the barracks and the mustering ground, ballistas to the sea
 // (Travis: the harbour moles are organic too, a large round warehouse at each one's centre)
 if(LM.headland_military){const b=LM.headland_military;const st=ysPlStream('mole',b);const o=ysPlOrganic(st,b.x,b.z,94,{n:18,amp:.22,e:1.1,a:st.range(0,TAU),off:0});
  ysPlMole('the headland',o.poly,2.5,8,{wall:true,star:o.c,node:{kind:'mole',n:'the headland',wealth:'civic',block:b.i+','+b.j}});const fr=ysPlFacing(PL_U[0],PL_U[1]);
  const at=(u,v)=>ysPlAt(b,u,v);ysPlByName('hyk_warehouse_round',o.c[0],o.c[1],fr,'headland',b,{y:2.5});ysPlSeek('hyk_barracks',ysPlCands(b,-30,-50,70),fr,'headland',b,{ground:{min:2.2,slope:1}});ysPlSeek('hyk_muster',ysPlCands(b,-25,45,70),fr,'headland',b,{ground:{min:2.2,slope:1}});
  for(const v of [-55,0,55])ysPlSeek('hyk_ballista',ysPlCands(b,70,v,80).slice(0,40),fr,'headland',b);}
 // the military harbour: a mole strip on each block's landward side, the sheds and the berth on its seaward edge
 {const MH=LAYOUT.blocks.filter(b=>b.use==='military_harbour').sort((p,q)=>p.s-q.s);const fr=ysPlFacing(PL_U[0],PL_U[1]);
  MH.forEach((b,i)=>{const st=ysPlStream('mole',b);const c=ysPlAt(b,-66,0);const o=ysPlOrganic(st,c[0],c[1],96,{n:18,amp:.18,e:.5,a:Math.atan2(PL_U[1],PL_U[0]),off:0});
   ysPlMole('military harbour mole '+(i+1),o.poly,2.5,4,{wall:true,star:o.c,node:{kind:'mole',n:'military harbour mole '+(i+1),wealth:'civic',block:b.i+','+b.j}});
   {const w=ysPlAt(b,-74,0);ysPlByName('hyk_warehouse_round',w[0],w[1],fr,'military harbour',b,{y:2.5,margin:.5});}
   const seq=i===0?[['hyk_boom_chain',-50],['hyk_ballista',20],['hyk_ship_shed_military',60]]:[['hyk_ship_shed_military',-45],['hyk_hexareme_berth',0],['hyk_ship_shed_military',45]];
   for(const [k,v] of seq){const D=HYK.defs[k];const back=k==='hyk_ballista';const p=ysPlAt(b,back?-60:-37,v);ysPlByName(k,p[0],p[1],fr,'military harbour',b,{y:2.5,margin:.5,fwd:back?0:D.d/2-8});}});}
 // the civilian harbour and the fishing docks along the coast; the shipwright with them
 ysPlShoreRun(['civilian_harbour'],['hyk_quay','hyk_pier','hyk_navigators_guild','hyk_boat_shed','hyk_quay','hyk_pier','hyk_pearlmongers_guild','hyk_shipwright','hyk_quay','hyk_pier','hyk_boat_shed'],{why:'civilian harbour'});
 // (the river's valley takes the south half of the docks' shore: the pieces it must have come first)
 ysPlShoreRun(['fishing_docks'],['hyk_wet_landing',{key:'hyk_fishmonger',back:12,gap:4},'hyk_pier',{key:'hyk_fishmonger',back:12,gap:4},'hyk_boat_shed'],{why:'fishing docks'});
 ysPlShoreRun(['aquaculture'],[{key:'hyk_aquaculture_pen',gap:14}],{why:'aquaculture',loops:12});
 // the harbour's piers (Travis: two dozen more, with room for a ship to work round the moles): along the water edges of
 // the harbour moles every ~34 m, a pier facing out, only where a 60 m square off its head is clear of anything built
 // (hosts, moles, other piers; the water streets do not count); then the harbour shore filled with piers in the gaps
 {let n=PLACE.blds.filter(r=>r.key==='hyk_pier').length;const clearAhead=(x,z,ry)=>!ysPlClash(ysPlBox(x+Math.sin(ry)*54,z+Math.cos(ry)*54,18,18,ry,'clear'),/^(street|apron|flight)/);
  for(const m of PLACE.moles){if(!m.wall||!m.star||!m.node)continue;const P=m.poly,c=m.star;   /* every walled mole: the harbour's, the home-grown, the Tides', the Library's */
   for(let i=0;i<P.length;i++){const a=P[i],q=P[(i+1)%P.length];const dx=q[0]-a[0],dz=q[1]-a[1],L=Math.hypot(dx,dz)||1;let nx=-dz/L,nz=dx/L;if((c[0]-(a[0]+q[0])/2)*nx+(c[1]-(a[1]+q[1])/2)*nz>0){nx=-nx;nz=-nz;}
    for(let s=12;s<L-8;s+=21){const x=a[0]+dx/L*s-nx*1.5,z=a[1]+dz/L*s-nz*1.5;if(terrainH(x+nx*40,z+nz*40)>-1.2)continue;const ry=ysPlFacing(nx,nz);if(!clearAhead(x,z,ry))continue;
     const t=ysPlTry('hyk_pier',x,z,ry,{fwd:HYK.defs.hyk_pier.d/2-8,margin:1,y:2.5,skip:/^street:(canal|awash)/});if(typeof t==='string'){ysPlRefuse(t);continue;}
     ysPlBld('hyk_pier',t.B,2.5,'harbour piers',LAYOUT.by[m.node.block],null,{shore:true,x,z,over:/^street:(canal|awash)/});n++;}}}
  n+=ysPlShoreRun(['civilian_harbour','fishing_docks'],[{key:'hyk_pier',gap:24}],{why:'harbour piers',loops:10});PLACE.piers=n;}
 // the windmill and the generator on the river: on the bank, a little clear of the valley, facing the water
 {const pr=ysRiverProfile();for(const [key,s,side] of [['hyk_generator',260,1],['hyk_windmill',480,-1],['hyk_granary',520,-1]]){let e=pr.seg[0];for(const q of pr.seg)if(s<=q.s0+q.L){e=q;break;}
   const t=(s-e.s0)/e.L,x=e.a[0]+(e.b[0]-e.a[0])*t,z=e.a[1]+(e.b[1]-e.a[1])*t;const ux=(e.b[0]-e.a[0])/e.L,uz=(e.b[1]-e.a[1])/e.L;const nx=-uz*side,nz=ux*side;const w=ysRiverDist(x,z).w;
   const D=HYK.defs[key];const C=[];for(const off of [8,16,26,40])for(const ds of [0,20,-20,40,-40])C.push([x+nx*(w*2.6+off+D.d/2)+ux*ds,z+nz*(w*2.6+off+D.d/2)+uz*ds]);
   ysPlSeek(key,C,ysPlFacing(-nx,-nz),'river',null);}}
 // the caravanserai on the foreign block nearest the market, on the side facing it
 const FQ=LAYOUT.blocks.filter(b=>b.use==='foreign').sort((p,q)=>Math.hypot(p.x-CITY.HEAD[0],p.z-CITY.HEAD[1])-Math.hypot(q.x-CITY.HEAD[0],q.z-CITY.HEAD[1]));
 if(FQ.length){const b=FQ[0];const S=ysPlSides(b,91)[0];const D=HYK.defs.hyk_caravanserai;const u0=(S.n[0]*PL_U[0]+S.n[1]*PL_U[1])*(91-D.d/2-2),v0=(S.n[0]*PL_V[0]+S.n[1]*PL_V[1])*(91-D.d/2-2);
  ysPlSeek('hyk_caravanserai',ysPlCands(b,u0,v0,66),ysPlFacing(S.n[0],S.n[1]),'caravanserai',b);}
 // the foreign quarter: slots with their swap lists (Iziz nearest the market, the Republic, Voth furthest) and the
 // Historians' chapterhouse on its own square
 // (Travis, Oct 5 2026: the inner quarter as dense as the coast's neighbourhoods) every side, and a lane-quartered middle
 // with small houses; every foreign slot keeps its swap list and, until the set lands, a Hykkousoi stand-in is drawn in it
 FQ.forEach((b,i)=>{const fq=i<2?'iziz':i<4?'republic':'voth';if(!b.hostPlaced)for(const s of ysLanes(b))ysPlTake(ysPlStrip(s.a,s.b,s.w,'street:lane'));   /* the lanes first: a side's house must not straddle a lane's end */
  ysPlFront(b,{kind:'foreign',foreign:fq,why:'foreign quarter',sides:4,max:40,standIn:true});
  if(!b.hostPlaced)for(const [qu,qv] of [[1,1],[1,-1],[-1,1],[-1,-1]]){const c=ysPlAt(b,qu*48,qv*48);const q={x:c[0],z:c[1],i:b.i,j:b.j,wealth:'middle'};
   ysPlFront(q,{pool:PL_SMALL.middle,kind:'middle',why:'foreign quarter lane',h:40,sides:2,only:[[-qu*PL_U[0],-qu*PL_U[1]],[-qv*PL_V[0],-qv*PL_V[1]]],tag:'flane'+qu+qv});}});
 if(FQ.length>2){const b=FQ[2];const B=ysPlBox(b.x,b.z,22,22,PL_RY,'chapterhouse');if(!ysPlClash(B)){const y=ysPlGround(B);if(y!=null){ysPlTake(B);PLACE.slots.push({kind:'chapterhouse',swap:['civic_chapter_house'],x:b.x,z:b.z,ry:PL_RY,w:44,d:44,y,block:b.i+','+b.j,box:B});}}}
 // ---- 4. the land quarter: neighbourhoods (sides built by distance from the head), shrines and the two small markets,
 // the reclaimed Ancients' plots (a quarter of the neighbourhood blocks; slots until the mid-rise types are vendored),
 // industry, farms
 const NB=LAYOUT.blocks.filter(b=>b.use==='neighbourhood').map(b=>Object.assign(b,{dH:Math.hypot(b.x-CITY.HEAD[0],b.z-CITY.HEAD[1])})).sort((p,q)=>p.dH-q.dH);
 // the Arena (Travis: the old Citadel model, copied) on the nearest neighbourhood block with room for it (not one marked
 // for a reclaimed Ancient), its gate to the head, the block lined with the market's shops and taverns
 if(HYK.defs.hyk_arena){for(const b of NB){if(b.landHost)continue;const d=[CITY.HEAD[0]-b.x,CITY.HEAD[1]-b.z],l=Math.hypot(d[0],d[1])||1;
   const t=ysPlTry('hyk_arena',b.x,b.z,ysPlFacing(d[0]/l,d[1]/l),{margin:3,ground:{slope:6}});if(typeof t==='string'){ysPlRefuse(t);continue;}
   // it wants flat ground: its block's middle is levelled to the mean (a flat stamp, graded over 10 m), paved
   CITY_STAMPS.push({kind:'flat',poly:ysPlBoxPoly(ysPlBox(t.B.cx,t.B.cz,t.B.hw+6,t.B.hd+6,t.B.ry)),y:t.y,soft:10,paint:'pave'});
   ysPlBld('hyk_arena',t.B,t.y,'landmark',b,null,{x:b.x,z:b.z});b.use='arena';b.tag='Ar';LAYOUT.landmarks.arena=b;b.hostPlaced=true;   /* no lanes, no neighbourhood frontage */
   ysPlFront(b,{pool:PL_POOL.market,kind:'market',why:'arena',sides:4});break;}}
 // the reclaimed Ancients take half the neighbourhood blocks (the layout marks them, b.landHost, the first two as skyscraper
 // stumps; 87-city-layout.js), before any civic piece or frontage: each block anywhere a clear spot fits the host's
 // footprint; a marked block that cannot take one hands its turn to the next block in the hash order, and is laned instead
 {const order=NB.map(b=>[b,KRAND.unit(KRAND.hash(KRAND.child(LAYOUT.HOST_SEED,'land hosts'),b.i,b.j))]).sort((p,q)=>p[1]-q[1]).map(p=>p[0]);
  const special=['altApart','altOffices','altOfficeC','altLibrary'].filter(k=>YS_HOST_TYPES[k]);   /* Travis: the Ancient Library and the original kit's offices and apartments (not the terrace: it dwarfs the houses) */
  const want=NB.filter(b=>b.landHost).length+special.length;let got=0,tall=0;   /* the share is a wish: the blocks with a clear spot decide */
  for(const b of order.filter(b=>b.landHost).concat(order.filter(b=>!b.landHost))){if(got>=want)break;const st=ysPlStream('land host',b);const isTall=tall<2;const type=isTall?ysPlType(st,'landTall'):(special.length?special[0]:ysPlType(st,'land'));if(!type)break;const cap=YS_HOST_TYPES[type].cap;
   for(const c of ysPlCands(b,0,0,93-cap-2)){const B=ysPlBox(c[0],c[1],cap,cap,PL_RY,'land host');if(ysPlClash(B))continue;const n0=Object.assign({},PLACE.refused);const y=ysPlGround(B,{slope:5});PLACE.refused=n0;
    if(y==null)continue;const rec=ysPlHost(b,{land:true,y,type,x:c[0],z:c[1],cutRange:isTall?[80,124]:null,tall:isTall,name:type==='altLibrary'?'The Ancient Library':null});b.hostPlaced=true;got++;if(isTall)tall++;if(!isTall&&special.length&&special[0]===type)special.shift();
    {const R=cap+16;const ring={poly:ysPlBoxPoly(ysPlBox(c[0],c[1],R,R,PL_RY)),star:[c[0],c[1]],y,x0:c[0]-R,x1:c[0]+R,z0:c[1]-R,z1:c[1]+R};ysPlEdgeRun(ring,b,{pool:PL_SMALL[b.wealth],kind:b.wealth,why:'host ring',tag:'ring',land:true,max:10});}   /* the Hykkousoi settle round the reclaimed Ancient (Travis) */
    break;}}
  if(got<want)ysPlRefuse('land hosts: '+got+' of '+want+' wished');
  // the lanes quarter every neighbourhood block without a host (87c ysLanes), reserved like the streets
  for(const b of NB)if(!b.hostPlaced)for(const s of ysLanes(b))ysPlTake(ysPlStrip(s.a,s.b,s.w,'street:lane'));}
 // the sectors about the head: north-west inland (-N), north-east (+T side), south (-T side); a market and a shrine in each
 const sector=b=>{const dx=b.x-CITY.HEAD[0],dz=b.z-CITY.HEAD[1];const t=dx*PL_T[0]+dz*PL_T[1],n=-(dx*PL_N[0]+dz*PL_N[1]);return n>Math.abs(t)?'NW':t>0?'NE':'S';};
 const civic={NW:['hyk_market_nbhd_1','hyk_shrine_tides'],NE:['hyk_shrine_seagods','hyk_market_nbhd_2'],S:['hyk_market_nbhd_2','hyk_shrine_tides']};
 const civLeft=[];for(const sec of ['NW','NE','S']){const L=NB.filter(b=>sector(b)===sec);if(!L.length){civLeft.push(...civic[sec]);continue;}const b=L[Math.min(L.length-1,1)];
  civic[sec].forEach((k,i)=>{if(!ysPlSeek(k,ysPlCands(b,i?40:-40,0,72),ysPlFacing(PL_V[0],PL_V[1]),'neighbourhood civic',b))civLeft.push(k);});}
 // a sector the span left without neighbourhoods hands its market and shrine to the nearest other neighbourhood block
 for(const k of civLeft){if(PL_COUNT[k]&&/shrine/.test(k))continue;for(const b of NB)if(ysPlSeek(k,ysPlCands(b,0,40,72),ysPlFacing(PL_V[0],PL_V[1]),'neighbourhood civic',b))break;}
 for(const b of NB){if(b.use==='arena')continue;const st=ysPlStream('land host',b);
  const sides=b.dH<750*LAYOUT.K?4:3;   /* every street of a neighbourhood built, but the outermost's back */ysPlFront(b,{pool:PL_POOL[b.wealth],kind:b.wealth,why:'neighbourhood',sides});
  // the lanes' frontages (a block without a reclaimed Ancient is quartered by two lanes, 87c): the small houses and
  // corner shops line both sides of each lane, in each quarter facing its two lane sides
  if(!b.hostPlaced)for(const [qu,qv] of [[1,1],[1,-1],[-1,1],[-1,-1]]){const c=ysPlAt(b,qu*48,qv*48);const q={x:c[0],z:c[1],i:b.i,j:b.j,wealth:b.wealth};

   // the quarter's middle (Travis, Oct 5 2026): a podded Ancient villa (the Undulant house) most of the time; the first
   // two quarters off the head take the office alternate, one the Ancient Library; a few Hykkousoi houses round each
   {const qs=ysPlStream('quarter host:'+qu+qv,b);let type=null,name=null;if(qs.chance(.7))type=ysPlType(qs,'villa');   /* the villas; the offices and the Library take land blocks (below) */
    if(type){const T=YS_HOST_TYPES[type];const ins=Math.min(56,Math.max(28,93-T.cap-18));   /* clear of the lanes and of the frontage's houses */const cc=ysPlAt(b,qu*ins,qv*ins);const B=ysPlBox(cc[0],cc[1],T.cap,T.cap,PL_RY,'quarter host');const n0=Object.assign({},PLACE.refused);const y=ysPlClash(B)?null:ysPlGround(B,{slope:3});PLACE.refused=n0;
     if(y!=null){ysPlHost(b,{land:true,y,type,x:cc[0],z:cc[1],name,pods:type==='altUndulant'?2:3});const R=T.cap+10;const ring={poly:ysPlBoxPoly(ysPlBox(cc[0],cc[1],R,R,PL_RY)),star:[cc[0],cc[1]],y,x0:cc[0]-R,x1:cc[0]+R,z0:cc[1]-R,z1:cc[1]+R};
      ysPlEdgeRun(ring,b,{pool:PL_SMALL[b.wealth],kind:b.wealth,why:'host ring',tag:'ring'+qu+qv,land:true,max:5});}else ysPlRefuse('quarter host: '+type);}
   ysPlFront(q,{pool:PL_SMALL[b.wealth],kind:b.wealth,why:'lane',h:40,sides:2,only:[[-qu*PL_U[0],-qu*PL_U[1]],[-qv*PL_V[0],-qv*PL_V[1]]],tag:'lane'+qu+qv});   /* the lane frontage after the quarter's host, so the houses fit round it */}}
  if(st.chance(.3)){const k=st.chance(.5)?'hyk_shrine_tides':'hyk_shrine_seagods';ysPlSeek(k,ysPlCands(b,st.range(-30,30),st.range(-30,30),60).slice(0,30),ysPlFacing(PL_V[0],PL_V[1]),'neighbourhood shrine',b);}}
 for(const b of LAYOUT.blocks.filter(b=>b.use==='industry')){if(!b.hostPlaced)for(const s of ysLanes(b))ysPlTake(ysPlStrip(s.a,s.b,s.w,'street:lane'));
  ysPlFront(b,{pool:PL_POOL.industry,kind:'industry',why:'industry',sides:4});
  if(!b.hostPlaced)for(const [qu,qv] of [[1,1],[1,-1],[-1,1],[-1,-1]]){const c=ysPlAt(b,qu*48,qv*48);const q={x:c[0],z:c[1],i:b.i,j:b.j,wealth:'poor'};
   ysPlFront(q,{pool:PL_INDUSTRY_SMALL,kind:'industry',why:'industry lane',h:40,sides:2,only:[[-qu*PL_U[0],-qu*PL_U[1]],[-qv*PL_V[0],-qv*PL_V[1]]],tag:'ilane'+qu+qv});}}
 for(const b of LAYOUT.blocks.filter(b=>b.use==='farm')){const st=ysPlStream('farm',b);const fr=ysPlFacing(PL_V[0],PL_V[1]);
  const p=ysPlAt(b,st.range(-20,20),-50);ysPlByName(st.chance(.5)?'hyk_farmhouse_1':'hyk_farmhouse_2',p[0],p[1],fr,'farm',b);
  const nf=b.s<700*LAYOUT.K?2:1;for(let k=0;k<nf;k++){const q=ysPlAt(b,k?28:-28,10);ysPlByName('hyk_farm_field',q[0],q[1],PL_RY,'farm',b);}}
 // ---- 5. the drowned home-grown blocks: an organic mole at the quay datum (Travis: not square: asymmetric, with
 // terraces), the Hykkousoi round its edge facing the water; an upper terrace 2.2 m up to one side with its own ring of
 // houses, a knoll on top of that now and then, a flight between each pair of terraces on the side facing the mole's middle
 for(const b of LAYOUT.blocks.filter(b=>b.use==='homegrown')){if(onStack(b)){ysPlRefuse('karst: home-grown block');continue;}const st=ysPlStream('mole',b);const nm='home-grown mole ('+b.i+','+b.j+')';
  const lo=ysPlOrganic(st,b.x,b.z,64,{n:16,e:st.range(1,1.3),a:st.range(0,TAU),amp:.34,off:10});
  const m=ysPlMole(nm,lo.poly,2.5,6,{wall:true,star:lo.c,node:{kind:'mole',n:nm,wealth:b.wealth,block:b.i+','+b.j}});
  ysPlEdgeRun(m,b,{pool:PL_POOL[b.wealth],kind:b.wealth,why:'home-grown mole',tag:'quay'});
  const up=ysPlOrganic(st,lo.c[0],lo.c[1],30,{n:12,amp:.3,off:16});const mu=ysPlMole(nm+', upper terrace',up.poly,4.7,0,{wall:true,star:up.c});
  ysPlEdgeRun(mu,b,{pool:PL_SMALL[b.wealth],kind:b.wealth,why:'home-grown mole',tag:'terrace',max:6});
  const flight=(low,high)=>{const P=high.poly;let best=null;for(let i=0;i<P.length;i++){const a=P[i],q=P[(i+1)%P.length];const mx=(a[0]+q[0])/2,mz=(a[1]+q[1])/2;const d=Math.hypot(mx-low.star[0],mz-low.star[1]);if(!best||d<best.d)best={d,mx,mz,a,q};}
   const dx=best.q[0]-best.a[0],dz=best.q[1]-best.a[1],L=Math.hypot(dx,dz)||1;let nx=-dz/L,nz=dx/L;if((high.star[0]-best.mx)*nx+(high.star[1]-best.mz)*nz>0){nx=-nx;nz=-nz;}   /* outward from the upper terrace */
   const A={x:best.mx+nx*5,y:low.y,z:best.mz+nz*5},B={x:best.mx-nx*.6,y:high.y,z:best.mz-nz*.6};ysPlTake(ysPlBox((A.x+B.x)/2,(A.z+B.z)/2,1.6,3.5,Math.atan2(B.x-A.x,B.z-A.z),'flight'));low.stairs.push({A,B});};
  flight(m,mu);
  if(st.chance(.5)){const top=ysPlOrganic(st,up.c[0],up.c[1],13,{n:10,amp:.25,off:6});const mt=ysPlMole(nm+', the knoll',top.poly,6.9,0,{wall:true,star:top.c});flight(mu,mt);}}
})();
if(typeof ysApplyEdits==='function')ysApplyEdits();   // 86-city-edits: Travis's hand placements and deletions (the editor, 94), the last word on PLACE.blds
// counters for _api.city.place() and the probe
function ysPlaceCensus(){const by={},why={};for(const r of PLACE.blds){by[r.key]=(by[r.key]||0)+1;why[r.why]=(why[r.why]||0)+1;}
 const pods={};for(const h of PLACE.hosts)for(const p of h.pods)pods[p.key]=(pods[p.key]||0)+1;
 const placed=Object.assign({},by);for(const k in pods)placed[k]=(placed[k]||0)+pods[k];
 const zero=HYK.order.filter(k=>!placed[k]);
 return {blds:PLACE.blds.length,hosts:PLACE.hosts.length,full:PLACE.hosts.filter(h=>h.full).length,pods:PLACE.hosts.reduce((s,h)=>s+h.pods.length,0),
  slots:PLACE.slots.reduce((o,s)=>(o[s.kind]=(o[s.kind]||0)+1,o),{}),moles:PLACE.moles.length,why,refused:PLACE.refused,byKey:placed,zero,
  podPlates:PLACE.hosts.map(h=>h.n+': '+[...new Set(h.pods.map(p=>p.y))].length+' plates of '+h.pods.length+' pods')};}
