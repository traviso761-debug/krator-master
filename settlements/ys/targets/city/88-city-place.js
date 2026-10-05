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
function ysPlMole(name,poly,y,soft){const m={name,poly,y,soft:soft==null?6:soft,x0:Math.min(...poly.map(p=>p[0])),x1:Math.max(...poly.map(p=>p[0])),z0:Math.min(...poly.map(p=>p[1])),z1:Math.max(...poly.map(p=>p[1]))};
 PLACE.moles.push(m);CITY_STAMPS.push({kind:'fill',poly,y,soft:m.soft,paint:y>1?'pave':null});return m;}
function ysPlBlockPoly(b,u0,u1,v0,v1){return [[u0,v0],[u1,v0],[u1,v1],[u0,v1]].map(q=>ysPlAt(b,q[0],q[1]));}
function ysPlBoxPoly(B){return [[-1,-1],[1,-1],[1,1],[-1,1]].map(k=>[B.cx+B.ux[0]*k[0]*B.hw+B.uz[0]*k[1]*B.hd,B.cz+B.ux[1]*k[0]*B.hw+B.uz[1]*k[1]*B.hd]);}
// the ground under a box: nine samples; null (refused) when it is water, cliff, river valley or too steep
function ysPlGround(B,o){o=o||{};const S=[];for(const a of [-1,0,1])for(const c of [-1,0,1])S.push([B.cx+B.ux[0]*a*B.hw+B.uz[0]*c*B.hd,B.cz+B.ux[1]*a*B.hw+B.uz[1]*c*B.hd]);
 let lo=1e9,hi=-1e9,sum=0;for(const p of S){if(!o.stack&&ysKarst(p[0],p[1])>0)return ysPlRefuse('karst');const r=ysRiverDist(p[0],p[1]);if(r.d<r.w*2.2+4)return ysPlRefuse('river valley');
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
  cuts:{tall:[170,250],mid:[110,164],low:[62,98],land:[44,74]},crownY:318,sink:'seabed',minY:9,
  avoid:(yl,h)=>[66,132,198,264].some(ys=>yl-1.5<ys+9&&yl+h+1.5>ys-1),   // a ledge and the turrets on it
  bearings:(st,n)=>ysPlFaces([0,Math.PI/2,Math.PI,3*Math.PI/2],st,n)}
};
// bearings on a square host's faces: the face centres in a random order, then the faces again either side of centre
function ysPlFaces(F,st,n){const f=F.slice();for(let i=f.length-1;i>0;i--){const j=st.int(0,i);[f[i],f[j]]=[f[j],f[i]];}
 const out=[];for(let i=0;i<n;i++){const k=i%f.length,lap=Math.floor(i/f.length);out.push(f[k]+(lap?(lap%2?.32:-.32):0)+st.range(-.04,.04));}return out;}
// the host type for a block by its class (the Pharos and the plaza name theirs)
const PL_TYPES={tall:[['skyA',1],['skyD',1],['skyH',1]],mid:[['skyA',.8],['skyD',1],['skyH',1]],low:[['skyD',1],['skyH',1]],land:[['skyD',1],['skyH',1]],full:[['skyA',1],['skyD',1],['skyH',1]]};
function ysPlType(st,cls){const L=PL_TYPES[cls]||PL_TYPES.mid;let t=L.reduce((s,e)=>s+e[1],0)*st.next();for(const [k,w] of L){t-=w;if(t<=0)return k;}return L[L.length-1][0];}
// the grown pools: [key, weight]; the way-in pods per wealth (a host needs one: every-host-has-a-way-in)
const PL_PODS={
 poor:[['hyk_pod_poor_2',3],['hyk_pod_poor_1',1],['hyk_pod_shop_food',.5],['hyk_pod_shop_general',.4],['hyk_pod_shop_salt',.3],['hyk_pod_shrine_tides',.3]],
 middle:[['hyk_pod_mid_2',2.5],['hyk_pod_mid_1',1],['hyk_pod_shop_armour',.35],['hyk_pod_shop_weapon',.35],['hyk_pod_shop_alchemy',.35],['hyk_pod_shop_chandler',.35],['hyk_pod_shop_salt',.3],
  ['hyk_pod_shop_cloth',.35],['hyk_pod_shop_potter',.35],['hyk_pod_tavern_2',.4],['hyk_pod_shrine_tides',.3],['hyk_pod_shrine_seagods',.3]],
 rich:[['hyk_pod_rich_2',2.5],['hyk_pod_rich_1',1],['hyk_pod_shop_pearl',.6],['hyk_pod_shrine_seagods',.35],['hyk_pod_shop_alchemy',.3]]};
const PL_WAYS={poor:[['hyk_pod_poor_1',1]],middle:[['hyk_pod_mid_1',2],['hyk_pod_shop_food',1],['hyk_pod_shop_general',1],['hyk_pod_tavern_1',1]],rich:[['hyk_pod_rich_1',1]]};
const PL_PODN={poor:4,middle:5,rich:6,full:8};
// one host record: the type, the cut snapped to a storey, how it stands (sunk for A, on the bed for D and H), its plates
// (world y) and its pods spread over them (different plates, a few apart, every pod's floor a plate's top)
function ysPlHost(b,o){const st=ysPlStream(o.land?'land host record':'host',b);const cls=o.full?'full':o.land?'land':b.host||'mid';const T=YS_HOST_TYPES[o.type||ysPlType(st,cls)];
 // a land host (decay 3, reclaimed) stands on the ground, its pods above its podium's colonnade (17 m)
 const sink=o.land?o.y-.5:T.sink==='seabed'?Math.min(terrainH(b.x,b.z),b.y)-1.5:-(T.plate(T.k0)-T.plateAt)+st.range(-2.5,2.5);
 let cutY=null;if(!o.full){const r=T.cuts[cls]||T.cuts.mid;const n0=Math.ceil((r[0]-T.Y0)/T.floors.pitch),n1=Math.floor((r[1]-T.Y0)/T.floors.pitch);cutY=T.Y0+st.int(n0,n1)*T.floors.pitch;}
 const top=(o.full?T.crownY:cutY)+sink;const ry=T.square?PL_RY+st.int(0,3)*Math.PI/2:st.range(0,TAU);
 const P='Project '+T.key.slice(3);const nm=T.name.replace('the ','');
 const rec={n:o.name||(o.full?P+' tower ('+b.i+','+b.j+')':o.land?'The reclaimed '+nm+' ('+b.i+','+b.j+')':'The '+nm+' stump ('+b.i+','+b.j+')'),block:b.i+','+b.j,use:b.use,type:T.key,builder:T.builder,
  x:o.x!=null?o.x:b.x,z:o.z!=null?o.z:b.z,ry,sink:+sink.toFixed(2),d:o.full?4:o.land?3:1,land:!!o.land,cutY,full:!!o.full,cls,podium:T.podium,cap:{hw:T.cap},floors:T.floors,top:+top.toFixed(2),
  shaped:!!T.shaped,wealth:b.wealth,plates:[],pods:[],ways:[]};
 rec.rAt=(y,a)=>T.rAt(y-rec.sink,a==null?null:a+rec.ry);   // a world bearing a is the local bearing a + ry
 for(let k=T.k0;k<400;k++){const y=T.plate(k)+sink;if(y>top-4)break;const lo=o.land?sink+18:T.minY;if(lo!=null&&y<lo)continue;rec.plates.push(+y.toFixed(2));}
 // the pods: the way in first, then the wealth pool; bearings from the type, plates stepped about a base
 const n=o.pods!=null?o.pods:PL_PODN[o.full?'full':b.wealth];const keys=[o.way||ysPlPick(st,PL_WAYS[b.wealth])];for(const k of (o.must||[]))keys.push(k);
 while(keys.length<n)keys.push(ysPlPick(st,PL_PODS[b.wealth]));
 const TH=T.bearings(st,keys.length),Pl=rec.plates;const STEP=[0,2,-1,3,1,-2,4,-3];const base=o.land?0:Math.min(Pl.length-1,Math.max(0,Math.round(Pl.length*(o.full?.18:.35))));   // a land host's pods at ground scale: the lowest plates
 const ok=(k,D)=>Pl[k]+D.h+2<=top&&!(T.avoid&&T.avoid(Pl[k]-sink,D.h));
 keys.forEach((key,i)=>{const D=HYK.defs[key];if(!D||!Pl.length)return;let k=clamp(base+STEP[i%STEP.length]*(o.full?3:1),0,Pl.length-1);
  if(o.crown&&key===o.crown)k=Math.max(0,Pl.length-4);
  if(!ok(k,D)){let best=-1;for(let d=1;d<Pl.length;d++){for(const q of [k-d,k+d])if(q>=0&&q<Pl.length&&ok(q,D)){best=q;break;}if(best>=0)break;}if(best<0)return;k=best;}   // the pod clears the cut and the host's own ledges
  const y=Pl[k];const a=TH[i]-ry;const into=!!D.into;   // an into def is drawn only as a way in (the kit sheet tests it so: the Urchin pod's other layout puts its store in the door swing)
  rec.pods.push({key,a:+a.toFixed(4),y,level:y>=20?'L2':'L1',into,wealth:D.tags.wealth});if(into)rec.ways.push({a:+a.toFixed(4),y,R:D.w/2});ysPlCount(key);});
 // pods round one host stand on different plates (Travis, Oct 2026): if the cut squeezed them onto one, move a pod that
 // fits to the nearest other plate
 if(rec.pods.length>1&&new Set(rec.pods.map(p=>p.y)).size<2){const y0=rec.pods[0].y;const alt=Pl.filter(y=>y!==y0).sort((p,q)=>Math.abs(p-y0)-Math.abs(q-y0));
  for(const p of rec.pods.slice(1)){const D=HYK.defs[p.key];const y=alt.find(y=>y+D.h+2<=top&&!(T.avoid&&T.avoid(y-sink,D.h)));if(y==null)continue;p.y=y;p.level=y>=20?'L2':'L1';const w=rec.ways.find(w=>w.a===p.a);if(w)w.y=y;break;}}
 ysPlTake(ysPlBox(rec.x,rec.z,T.cap,T.cap,PL_RY,'host '+rec.n));PLACE.hosts.push(rec);return rec;}

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
const PL_GAP={poor:[3,7],middle:[5,11],rich:[10,20],market:[3,6],industry:[6,12],foreign:[5,10]};
const PL_GARDEN={poor:.12,middle:.18,rich:.25,market:0,industry:.15,foreign:.1};
const PL_FOREIGN={iziz:[[14,12],[16,13],[12,12]],republic:[[13,11],[15,12],[18,10]],voth:[[16,14],[20,16]]};
function ysPlSides(b,h){const S=[[PL_U,PL_V],[[-PL_U[0],-PL_U[1]],PL_V],[PL_V,PL_U],[[-PL_V[0],-PL_V[1]],PL_U]];
 return S.map(([n,t])=>({n,t,mx:b.x+n[0]*h,mz:b.z+n[1]*h})).sort((p,q)=>Math.hypot(p.mx-CITY.HEAD[0],p.mz-CITY.HEAD[1])-Math.hypot(q.mx-CITY.HEAD[0],q.mz-CITY.HEAD[1]));}
function ysPlFront(b,o){const st=ysPlStream('front:'+(o.tag||''),b);const pool=o.pool,h=o.h||91,sides=ysPlSides(b,h).slice(0,o.sides||4);let n=0;
 for(const S of sides){let t=-h+4;const ry=ysPlFacing(S.n[0],S.n[1]);
  while(t<h-4&&n<(o.max||99)){if(st.chance(PL_GARDEN[o.kind]||0)){t+=st.range(12,22);continue;}
   let key,w,d,fq=null;if(o.kind==='foreign'){fq=o.foreign;const sz=st.pick(PL_FOREIGN[fq]);w=sz[0];d=sz[1];key=null;}else{key=ysPlPick(st,pool);const D=HYK.defs[key];w=D.w;d=D.d;}
   if(t+w>h-4)break;const s=t+w/2;const cx=b.x+S.n[0]*(h-d/2)+S.t[0]*s,cz=b.z+S.n[1]*(h-d/2)+S.t[1]*s;
   const B=ysPlBox(cx,cz,w/2+1,d/2+1,ry,key||'slot');{const c=ysPlClash(B);if(c){ysPlRefuse('occupied by '+ysPlWhat(c));t+=6;continue;}}
   const y=ysPlGround(B,o.ground);if(y==null){t+=6;continue;}
   if(key)ysPlBld(key,B,y,o.why,b,st);else{ysPlTake(B);PLACE.slots.push({kind:'foreign',foreign:fq,swap:PL_SWAP[fq],x:cx,z:cz,ry,w,d,y,block:b.i+','+b.j,box:B});}
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
  if(ysRiverDist(ox,oz).d<ysRiverDist(ox,oz).w*2.2+6){ysPlRefuse('river valley');lg('river');s+=12;continue;}
  const Bl=ysPlBox(ox-at.nx*8,oz-at.nz*8,D.w/2+3,(back?D.d/2+3:9),ry,'apron');   // the land part: the apron behind the quay line
  ysPlMole('quay apron '+key,ysPlBoxPoly(Bl),2.5,5);
  ysPlBld(key,B,2.5,o.why||'shore',b,st,{shore:true,x:ox,z:oz,over:/^street:(canal|awash)/});lg('placed');placed++;i++;s+=(D.w+(it.gap!=null?it.gap:st.range(6,12)));}
 return placed;}

// ================================================================= THE PASS
(function placePass(){const A=LAYOUT.A,LM=LAYOUT.landmarks;const toA=b=>[A.x-b.x,A.z-b.z];
 // ---- 1. the landmarks by name, each with its one freedom (the facing)
 // the Amphitriton on its island: the plinth's foot at sea level on a fill to just under it; +z to the land and the drawbridge
 {const ry=ysPlFacing(-PL_N[0],-PL_N[1]);ysPlMole('the Amphitriton island',[...Array(24)].map((_,k)=>[A.x+58*Math.cos(k/24*TAU),A.z+58*Math.sin(k/24*TAU)]),-.4,14);
  ysPlByName('hyk_amphitriton',A.x,A.z,ry,'landmark',A,{y:0,margin:2});}
 // the Temple of the Tides on a mole at the quay datum, its back (the wet door) flush with the mole's edge toward the Amphitriton
 if(LM.temple_tides){const b=LM.temple_tides;const d=toA(b),l=Math.hypot(d[0],d[1]);const ry=ysPlFacing(-d[0]/l,-d[1]/l);const D=HYK.defs.hyk_temple_tides;
  const B=ysPlBox(b.x,b.z,D.w/2+6,D.d/2,ry,'mole');const P=ysPlBoxPoly(ysPlBox(b.x-d[0]/l*8,b.z-d[1]/l*8,D.w/2+6,D.d/2+8,ry));ysPlMole('the Tides mole',P,2.5,6);
  ysPlByName('hyk_temple_tides',b.x,b.z,ry,'landmark',b,{y:2.5});}
 // the Library on its mole, facing the Tides
 if(LM.library){const b=LM.library;const t=LM.temple_tides||A;const d=[t.x-b.x,t.z-b.z],l=Math.hypot(d[0],d[1]);const ry=ysPlFacing(d[0]/l,d[1]/l);const D=HYK.defs.hyk_library;
  ysPlMole('the Library mole',ysPlBoxPoly(ysPlBox(b.x+d[0]/l*6,b.z+d[1]/l*6,D.w/2+8,D.d/2+12,ry)),2.5,6);ysPlByName('hyk_library',b.x,b.z,ry,'landmark',b,{y:2.5});}
 // the Temple of the Winds on its stack's top, facing the Amphitriton; the Citadel on its stack, the bridge door (local -x) toward it
 if(LM.temple_winds){const b=LM.temple_winds;const d=toA(b),l=Math.hypot(d[0],d[1]);const ry=ysPlFacing(d[0]/l,d[1]/l);const y=ysPlGround(ysPlDefBox('hyk_temple_winds',b.x,b.z,ry,0),{stack:true,slope:20});
  ysPlByName('hyk_temple_winds',b.x,b.z,ry,'landmark',b,{y:y!=null?y:terrainH(b.x,b.z)});}
 if(LM.citadel){const b=LM.citadel;const d=toA(b),l=Math.hypot(d[0],d[1]);const ry=Math.atan2(d[1]/l,-d[0]/l);const y=terrainH(b.x,b.z);
  ysPlByName('hyk_citadel',b.x,b.z,ry,'landmark',b,{y});
  // the Treasury in the precinct outside the wall, on the stack's side away from the bridge door
  const a0=Math.atan2(-d[1],-d[0]);const C=[];for(const r of [62,70,56])for(let k=0;k<12;k++){const a=a0+(k%2?1:-1)*Math.ceil(k/2)*.35;C.push([b.x+r*Math.cos(a),b.z+r*Math.sin(a)]);}
  ysPlSeek('hyk_treasury',C,c=>ysPlFacing(b.x-c[0],b.z-c[1]),'landmark',b,{ground:{stack:true,slope:7}});}
 // the Wet Cells: an island reached only by water, at the water datum
 if(LM.wet_cells){const b=LM.wet_cells;ysPlByName('hyk_wet_cells',b.x,b.z,ysPlFacing(PL_N[0],PL_N[1]),'landmark',b,{y:0});}
 // ---- 2. the hosts: the Pharos and two more full-height towers, the grown plaza's host, then every host block
 const hostBlocks=LAYOUT.blocks.filter(b=>b.use==='host');
 if(LM.pharos)ysPlHost(LM.pharos,{type:'skyA',full:true,name:'The Pharos',crown:'hyk_pharos_crown',must:['hyk_pharos_crown'],way:'hyk_pod_rich_1',pods:4});
 // the full towers: farthest-point picks among the tall hosts in open water, away from the Pharos and the Amphitriton
 {const tall=hostBlocks.filter(b=>b.host==='tall');const chosen=[LM.pharos||A,A];const full=[];
  for(let n=0;n<2&&tall.length;n++){let best=null;for(const b of tall){if(full.indexOf(b)>=0)continue;const d=Math.min(...chosen.map(c=>Math.hypot(c.x-b.x,c.z-b.z)));if(!best||d>best.d)best={b,d};}
   full.push(best.b);chosen.push(best.b);}
  for(const b of full){b.full=true;ysPlHost(b,{full:true});}}
 if(LM.grown_plaza){const b=LM.grown_plaza;ysPlHost(Object.assign(b,{host:'mid'}),{name:'The grown plaza',must:['hyk_market_plaza'],pods:3});}
 // the hosts of every other block: an awash block's is a low one (D or H, cut short, standing on the bed)
 // a scenery stack (the Needle, the Tooth...) standing in a host block's cap leaves the block to the water
 const onStack=b=>CITY.STACKS.slice(2).some(t=>Math.hypot(t.x-b.x,t.z-b.z)<t.r*1.25+70);
 for(const b of hostBlocks){if(b.full)continue;if(onStack(b)){ysPlRefuse('karst: host block');continue;}ysPlHost(b,{});}
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
 if(LM.headland_military){const b=LM.headland_military;ysPlMole('the headland',ysPlBlockPoly(b,-88,88,-88,88),2.5,8);const fr=ysPlFacing(PL_U[0],PL_U[1]);
  const at=(u,v)=>ysPlAt(b,u,v);ysPlSeek('hyk_barracks',ysPlCands(b,-30,-40,76),fr,'headland',b);ysPlSeek('hyk_muster',ysPlCands(b,-25,35,76),fr,'headland',b);
  for(const v of [-55,0,55])ysPlSeek('hyk_ballista',ysPlCands(b,70,v,80).slice(0,40),fr,'headland',b);}
 // the military harbour: a mole strip on each block's landward side, the sheds and the berth on its seaward edge
 {const MH=LAYOUT.blocks.filter(b=>b.use==='military_harbour').sort((p,q)=>p.s-q.s);const fr=ysPlFacing(PL_U[0],PL_U[1]);
  MH.forEach((b,i)=>{ysPlMole('military harbour mole '+(i+1),ysPlBlockPoly(b,-90,-34,-88,88),2.5,4);
   const seq=i===0?[['hyk_boom_chain',-50],['hyk_ballista',20],['hyk_ship_shed_military',60]]:[['hyk_ship_shed_military',-45],['hyk_hexareme_berth',0],['hyk_ship_shed_military',45]];
   for(const [k,v] of seq){const D=HYK.defs[k];const back=k==='hyk_ballista';const p=ysPlAt(b,back?-60:-37,v);ysPlByName(k,p[0],p[1],fr,'military harbour',b,{y:2.5,margin:.5,fwd:back?0:D.d/2-8});}});}
 // the civilian harbour and the fishing docks along the coast; the shipwright with them
 ysPlShoreRun(['civilian_harbour'],['hyk_quay','hyk_pier','hyk_navigators_guild','hyk_boat_shed','hyk_quay','hyk_pier','hyk_pearlmongers_guild','hyk_shipwright','hyk_quay','hyk_pier','hyk_boat_shed'],{why:'civilian harbour'});
 // (the river's valley takes the south half of the docks' shore: the pieces it must have come first)
 ysPlShoreRun(['fishing_docks'],['hyk_wet_landing',{key:'hyk_fishmonger',back:12,gap:4},'hyk_pier',{key:'hyk_fishmonger',back:12,gap:4},'hyk_boat_shed'],{why:'fishing docks'});
 ysPlShoreRun(['aquaculture'],[{key:'hyk_aquaculture_pen',gap:14}],{why:'aquaculture',loops:12});
 // the windmill and the generator on the river: on the bank, a little clear of the valley, facing the water
 {const pr=ysRiverProfile();for(const [key,s,side] of [['hyk_generator',260,1],['hyk_windmill',480,-1],['hyk_granary',520,-1]]){let e=pr.seg[0];for(const q of pr.seg)if(s<=q.s0+q.L){e=q;break;}
   const t=(s-e.s0)/e.L,x=e.a[0]+(e.b[0]-e.a[0])*t,z=e.a[1]+(e.b[1]-e.a[1])*t;const ux=(e.b[0]-e.a[0])/e.L,uz=(e.b[1]-e.a[1])/e.L;const nx=-uz*side,nz=ux*side;const w=ysRiverDist(x,z).w;
   const D=HYK.defs[key];const C=[];for(const off of [8,16,26,40])for(const ds of [0,20,-20,40,-40])C.push([x+nx*(w*2.2+off+D.d/2)+ux*ds,z+nz*(w*2.2+off+D.d/2)+uz*ds]);
   ysPlSeek(key,C,ysPlFacing(-nx,-nz),'river',null);}}
 // the caravanserai on the foreign block nearest the market, on the side facing it
 const FQ=LAYOUT.blocks.filter(b=>b.use==='foreign').sort((p,q)=>Math.hypot(p.x-CITY.HEAD[0],p.z-CITY.HEAD[1])-Math.hypot(q.x-CITY.HEAD[0],q.z-CITY.HEAD[1]));
 if(FQ.length){const b=FQ[0];const S=ysPlSides(b,91)[0];const D=HYK.defs.hyk_caravanserai;const u0=(S.n[0]*PL_U[0]+S.n[1]*PL_U[1])*(91-D.d/2-2),v0=(S.n[0]*PL_V[0]+S.n[1]*PL_V[1])*(91-D.d/2-2);
  ysPlSeek('hyk_caravanserai',ysPlCands(b,u0,v0,66),ysPlFacing(S.n[0],S.n[1]),'caravanserai',b);}
 // the foreign quarter: slots with their swap lists (Iziz nearest the market, the Republic, Voth furthest) and the
 // Historians' chapterhouse on its own square
 FQ.forEach((b,i)=>{const fq=i<2?'iziz':i<4?'republic':'voth';ysPlFront(b,{kind:'foreign',foreign:fq,why:'foreign quarter',sides:2,max:10});});
 if(FQ.length>2){const b=FQ[2];const B=ysPlBox(b.x,b.z,22,22,PL_RY,'chapterhouse');if(!ysPlClash(B)){const y=ysPlGround(B);if(y!=null){ysPlTake(B);PLACE.slots.push({kind:'chapterhouse',swap:['civic_chapter_house'],x:b.x,z:b.z,ry:PL_RY,w:44,d:44,y,block:b.i+','+b.j,box:B});}}}
 // ---- 4. the land quarter: neighbourhoods (sides built by distance from the head), shrines and the two small markets,
 // the reclaimed Ancients' plots (a quarter of the neighbourhood blocks; slots until the mid-rise types are vendored),
 // industry, farms
 const NB=LAYOUT.blocks.filter(b=>b.use==='neighbourhood').map(b=>Object.assign(b,{dH:Math.hypot(b.x-CITY.HEAD[0],b.z-CITY.HEAD[1])})).sort((p,q)=>p.dH-q.dH);
 // the sectors about the head: north-west inland (-N), north-east (+T side), south (-T side); a market and a shrine in each
 const sector=b=>{const dx=b.x-CITY.HEAD[0],dz=b.z-CITY.HEAD[1];const t=dx*PL_T[0]+dz*PL_T[1],n=-(dx*PL_N[0]+dz*PL_N[1]);return n>Math.abs(t)?'NW':t>0?'NE':'S';};
 const civic={NW:['hyk_market_nbhd_1','hyk_shrine_tides'],NE:['hyk_shrine_seagods','hyk_market_nbhd_2'],S:['hyk_market_nbhd_2','hyk_shrine_tides']};
 const civLeft=[];for(const sec of ['NW','NE','S']){const L=NB.filter(b=>sector(b)===sec);if(!L.length){civLeft.push(...civic[sec]);continue;}const b=L[Math.min(L.length-1,1)];
  civic[sec].forEach((k,i)=>{if(!ysPlSeek(k,ysPlCands(b,i?40:-40,0,72),ysPlFacing(PL_V[0],PL_V[1]),'neighbourhood civic',b))civLeft.push(k);});}
 // a sector the span left without neighbourhoods hands its market and shrine to the nearest other neighbourhood block
 for(const k of civLeft){if(PL_COUNT[k]&&/shrine/.test(k))continue;for(const b of NB)if(ysPlSeek(k,ysPlCands(b,0,40,72),ysPlFacing(PL_V[0],PL_V[1]),'neighbourhood civic',b))break;}
 // the reclaimed Ancients take a share of the outer neighbourhood blocks (a third, at least three), before any frontage: the
 // blocks are tried in the order of a hash of their cell (the same in any engine), each anywhere a clear spot fits its
 // footprint, until the share is met
 {const want=Math.max(3,Math.round(NB.length/3));let got=0;
  for(const [b] of NB.filter(b=>b.dH>250*LAYOUT.K).map(b=>[b,KRAND.unit(KRAND.hash(KRAND.child(PLACE.SEED,'land hosts'),b.i,b.j))]).sort((p,q)=>p[1]-q[1])){
   if(got>=want)break;const st=ysPlStream('land host',b);const type=ysPlType(st,'land'),cap=YS_HOST_TYPES[type].cap;
   for(const c of ysPlCands(b,0,0,93-cap-2)){const B=ysPlBox(c[0],c[1],cap,cap,PL_RY,'land host');if(ysPlClash(B))continue;const n0=Object.assign({},PLACE.refused);const y=ysPlGround(B,{slope:5});PLACE.refused=n0;
    if(y==null)continue;ysPlHost(b,{land:true,y,type,x:c[0],z:c[1]});got++;break;}}
  if(got<want)ysPlRefuse('land hosts: '+got+' of '+want);}
 for(const b of NB){const st=ysPlStream('land host',b);
  const sides=b.dH<450*LAYOUT.K?4:b.dH<750*LAYOUT.K?2:1;   /* the first layout's densities, at the span K (budget 30 M) */ysPlFront(b,{pool:PL_POOL[b.wealth],kind:b.wealth,why:'neighbourhood',sides});
  if(st.chance(.3)){const k=st.chance(.5)?'hyk_shrine_tides':'hyk_shrine_seagods';ysPlSeek(k,ysPlCands(b,st.range(-30,30),st.range(-30,30),60).slice(0,30),ysPlFacing(PL_V[0],PL_V[1]),'neighbourhood shrine',b);}}
 for(const b of LAYOUT.blocks.filter(b=>b.use==='industry'))ysPlFront(b,{pool:PL_POOL.industry,kind:'industry',why:'industry',sides:2});
 for(const b of LAYOUT.blocks.filter(b=>b.use==='farm')){const st=ysPlStream('farm',b);const fr=ysPlFacing(PL_V[0],PL_V[1]);
  const p=ysPlAt(b,st.range(-20,20),-50);ysPlByName(st.chance(.5)?'hyk_farmhouse_1':'hyk_farmhouse_2',p[0],p[1],fr,'farm',b);
  const nf=b.s<700*LAYOUT.K?2:1;for(let k=0;k<nf;k++){const q=ysPlAt(b,k?28:-28,10);ysPlByName('hyk_farm_field',q[0],q[1],PL_RY,'farm',b);}}
 // ---- 5. the drowned home-grown blocks: a mole at the quay datum, the Hykkousoi round its edge facing the water
 for(const b of LAYOUT.blocks.filter(b=>b.use==='homegrown')){ysPlMole('home-grown mole ('+b.i+','+b.j+')',ysPlBlockPoly(b,-62,62,-62,62),2.5,6);
  ysPlFront(b,{pool:PL_POOL[b.wealth],kind:b.wealth,why:'home-grown mole',h:58,sides:2});}
})();
// counters for _api.city.place() and the probe
function ysPlaceCensus(){const by={},why={};for(const r of PLACE.blds){by[r.key]=(by[r.key]||0)+1;why[r.why]=(why[r.why]||0)+1;}
 const pods={};for(const h of PLACE.hosts)for(const p of h.pods)pods[p.key]=(pods[p.key]||0)+1;
 const placed=Object.assign({},by);for(const k in pods)placed[k]=(placed[k]||0)+pods[k];
 const zero=HYK.order.filter(k=>!placed[k]);
 return {blds:PLACE.blds.length,hosts:PLACE.hosts.length,full:PLACE.hosts.filter(h=>h.full).length,pods:PLACE.hosts.reduce((s,h)=>s+h.pods.length,0),
  slots:PLACE.slots.reduce((o,s)=>(o[s.kind]=(o[s.kind]||0)+1,o),{}),moles:PLACE.moles.length,why,refused:PLACE.refused,byKey:placed,zero,
  podPlates:PLACE.hosts.map(h=>h.n+': '+[...new Set(h.pods.map(p=>p.y))].length+' plates of '+h.pods.length+' pods')};}
