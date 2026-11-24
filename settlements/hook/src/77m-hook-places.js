/* ============================== HOOK: THE HAMLETS AND CAMPS OF THE ENVIRONS (S5, [G data]) ============================== */
/* The thirteen places of the owner's site plan (77-hook-ruin.js `places`: the Hukoa's, the Iziz settlers', the salvagers'
   and the Hykkousoi's hamlets, posts and camps) laid out as buildings by core/hamlet (KHAMLET.village; a camp through its
   work-camp option, core/hamlet/camp 26), each on its culture's row: the Hukoa on the Islanders' (islander_east: the
   Islanders kit), the settlers on the Iziz Vernacular's (iziz), the salvagers on a row of the post-apoc kit's pieces
   (HOOK_PLACES.SALVAGE, below: no core/hamlet row has them). Plain records: 90b draws them as it draws the town's lots (in
   full near the camera, massing beyond), 89z registers them in core/tags, 90e keeps the jungle off them.
   - THE GROUND a building may take: dry (0.4 m over the sea), not steep, outside Port Hook's zone and clear of every
     ruin footprint, heap, standing span and the wall (the plan's records, in a core/space grid).
   - A coastal hamlet's landing (the Islanders' quay) on the nearest shore of its point, facing the water; a works hamlet's
     resource there (fishing, salt) or at its point (lumber).
   - Not laid here: the Drowned Spire's village (C1: the Hykkousoi live in pods on the Spire, 77's pods, drawn by 90c)
     and the deck camp (C3: on a standing freeway span, its deck 14 m up). KNOWN_ISSUES.md.
   HOOK_PLACES.lots: the buildings as the town's drawing takes them; .villages: KHAMLET's results by place; .skipped. */
const HOOK_PLACES=(function(){
 if(typeof KHAMLET==='undefined'||typeof HOOK_RUIN==='undefined'||!HOOK_RUIN.places)return null;
 const R=HOOK_RUIN,W=HOOK_WORLD,DIMS=typeof HOOK_DIMS!=='undefined'?HOOK_DIMS:{};
 const ZONE=((typeof HOOK_SITE!=='undefined'&&HOOK_SITE.districts||[]).find(d=>d.type==='zone')||{}).poly||null;
 const inPoly=(x,z,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
 /* the ground read once a metre (the layout asks the same spots many times) */
 const NAT=new Map(),natH=(x,z)=>{const k=Math.round(x)+','+Math.round(z);let v=NAT.get(k);if(v===undefined){v=W.natH(Math.round(x),Math.round(z));NAT.set(k,v);}return v;};
 /* ---- the ruin's footprints in a core/space grid */
 const S=KSPACE.create({cell:40});
 const line=(x0,z0,x1,z1,r,step)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/step));for(let a=0;a<=n;a++)S.insert({r},x0+(x1-x0)*a/n,z0+(z1-z0)*a/n,r);};
 for(const t of R.towers){let x=t.x,z=t.z,w=t.w,d=t.d,yaw=t.yaw;
  if(t.state==='fallen'){const L=t.roof*.75,dir=t.leanDir;x=t.x+Math.sin(dir)*L/2;z=t.z+Math.cos(dir)*L/2;w=Math.min(t.w,t.d);d=L;yaw=dir;}
  const s=Math.min(w,d),L=Math.max(w,d),r=s/2*1.15+4,ax=w>=d?[Math.cos(yaw),-Math.sin(yaw)]:[Math.sin(yaw),Math.cos(yaw)],h=Math.max(0,(L-s)/2);
  line(x-ax[0]*h,z-ax[1]*h,x+ax[0]*h,z+ax[1]*h,r,Math.max(4,s*.6));}
 for(const h of R.heaps)S.insert({r:(h.r==null?10:h.r)+3},h.x,h.z,(h.r==null?10:h.r)+3);
 for(const s of R.spans)if(s.state!=='fallen')line(s.p0[0],s.p0[1],s.p1[0],s.p1[1],16,10);
 line(R.ramp.p0[0],R.ramp.p0[1],R.ramp.p1[0],R.ramp.p1[1],14,10);line(R.wall.p0[0],R.wall.p0[1],R.wall.p1[0],R.wall.p1[1],9,8);
 for(const g of R.gates)S.insert({r:24},g.x,g.z,24);
 for(const f of R.foundations||[])for(const w of f.walls)line(w[0],w[1],w[2],w[3],3,4);   /* the clearings' foundations */
 const _q=[],ruinAt=(x,z)=>{const L=S.query(x,z,0,_q);for(const o of L)if(Math.abs(o.r)>0)return true;return false;};
 const ground={ok:(x,z)=>{if(R.townAt(x,z))return false;if(ruinAt(x,z))return false;const h=natH(x,z);if(!(h>.4))return false;
  return Math.hypot(natH(x+5,z)-h,natH(x,z+5)-h)/5<.3;}};
 /* ---- the salvagers' row: the post-apoc kit's scrap houses, longhouse, mess, shops and works (kits/post-apoc) */
 const SALVAGE={kit:'post-apoc',household:4.5,workShare:.45,slopeMax:.3,
  religious:'shaman',civic:'longhouse',general:'shop-general',food:'mess',warehouse:'warehouse',
  services:{religious:1,civic:3,general:2,food:3,warehouse:4},
  houses:{poor:[['dw-box',1,3],['dw-tire',1,2],['dw-bus',1,2],['dw-tank',1,1],['dw-stilt',1,1]],
   middling:[['lg-stack',3,2],['lg-twinsilo',3,1],['lg-bulkhead',4,1]],head:[['chief',1,1]],middlingShare:.3},
  works:{salvage:[{key:'smithy',jobs:10,share:.45},{key:'shop-tinker',jobs:4,share:.2},{key:'warehouse',jobs:8,share:.25},{key:'watchtower',jobs:3,share:.1}]},
  focusJobs:{salvage:90},reach:{salvage:300},pending:{}};
 /* ---- the settlers' row: core/hamlet's iziz row with the works its frontier places want, on the Vernacular's pieces (its
    rest stop, toll house and guard tower; the saw pit and the village shrine, kits/iziz-vernacular/extra, built for these) */
 const IZ=KHAMLET.CULTURES.iziz,SETTLERS=Object.assign({},IZ,{
  works:Object.assign({},IZ.works,{lumber:[{key:'vern_sawpit',jobs:12,share:1}],waystation:[{key:'vern_rest_stop',jobs:6,share:.6},{key:'vern_toll_house',jobs:3,share:.4}],
   post:[{key:'vern_guard_tower',jobs:4,share:1}],hunting:[{key:'vern_pens',jobs:3,share:1}]}),
  focusJobs:Object.assign({},IZ.focusJobs,{lumber:40,waystation:12,post:6,hunting:4}),
  reach:Object.assign({},IZ.reach,{lumber:400,waystation:200,post:150,hunting:200}),pending:{}});
 /* ---- each place's spec: its row and focus (the plan's `work`), its people; a camp by core/hamlet's work-camp option;
    the Drowned Spire's village and the deck camp are laid below, not by core/hamlet */
 const PLAN={H1:{row:'islander_east',focus:'fishing',landing:true},H2:{row:SETTLERS,focus:'farming'},H3:{row:SALVAGE,focus:'salvage'},
  H4:{row:SETTLERS,focus:'waystation'},P1:{row:SETTLERS,focus:'post'},
  C1:{own:'spire'},C2:{row:'islander_east',focus:'fishing',camp:true,shore:true},
  C3:{own:'deck'},C4:{row:SETTLERS,focus:'post'},
  C5:{row:'islander_east',focus:'lumber',camp:true},C6:{row:'islander_east',focus:'salt',shore:true,landing:true,boat:true},
  C7:{row:SETTLERS,focus:'lumber',camp:true},C8:{row:SETTLERS,focus:'hunting',camp:true}};
 /* the nearest shore off the ruin: the first point under the sea along 24 bearings, every 10 m out to 600 */
 function shore(x,z){let best=null;for(let k=0;k<24;k++){const a=k/24*Math.PI*2,ux=Math.cos(a),uz=Math.sin(a);
  for(let r=10;r<=600;r+=10){if(natH(x+ux*r,z+uz*r)<0){const qx=x+ux*(r-12),qz=z+uz*(r-12);   /* the quay's spot: off the ruin */
   if(!ruinAt(qx,qz)&&!ruinAt(qx-ux*12,qz-uz*12)&&(!best||r<best.r))best={r,x:qx,z:qz,ux,uz};break;}}}return best;}
 /* the roomiest dry ground near a point: the most of the ground's good spots (every 30 m) within 120 m, searched every
    `step` m out to `reach` (a layout that cannot place its houses, or a point in the water, moves there) */
 function roomiest(x,z,reach,step){let best=null;for(let j=-reach;j<=reach;j+=step)for(let i=-reach;i<=reach;i+=step){if(i*i+j*j>reach*reach)continue;
  const cx=x+i,cz=z+j;if(!ground.ok(cx,cz))continue;let n=0;for(let b=-120;b<=120;b+=30)for(let a=-120;a<=120;a+=30)if(a*a+b*b<=14400&&ground.ok(cx+a,cz+b))n++;
  const sc=n-Math.hypot(i,j)/200;if(!best||sc>best.sc)best={x:cx,z:cz,sc,n};}return best;}
 /* a works village's resource out in its land, not on its point: core/hamlet faces its works from the point to the
    resource, and a resource on the point leaves them no facing (a zero box the houses then overlap) */
 function outward(x,z,r){let best=null;for(let k=0;k<16;k++){const a=k/16*Math.PI*2,qx=x+Math.cos(a)*r,qz=z+Math.sin(a)*r;if(ground.ok(qx,qz)){best=[qx,qz];break;}}return best||[x+r,z];}
 /* ---- THE ROAD NET a place's link joins: the plan's south road (the mainland's way in) and the town's edge (Port Hook's
    zone, where its streets come out), every 20 m; each link, once routed, joins the net for the places after it */
 const NET=[];const dens=(pts,st)=>{const o=[];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/st));
  for(let k=0;k<n;k++)o.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}if(pts.length)o.push(pts[pts.length-1]);return o;};
 for(const r of R.roads||[])for(const q of dens(r.pts,20))NET.push(q);
 /* the town's edge: each quarter's outline (77's town is its quarters and a margin), pushed out from the quarter's middle
    past the margin, where that is outside the town and dry */
 for(const d of (typeof HOOK_SITE!=='undefined'&&HOOK_SITE.districts||[]).filter(d=>d.type==='quarter')){const Q=d.poly;let zx=0,zz=0;for(const q of Q){zx+=q[0];zz+=q[1];}zx/=Q.length;zz/=Q.length;
  for(const q of dens(Q.concat([Q[0]]),20)){const L=Math.max(1e-9,Math.hypot(q[0]-zx,q[1]-zz)),o=[q[0]+(q[0]-zx)/L*75,q[1]+(q[1]-zz)/L*75];if(natH(o[0],o[1])>.4&&!R.townAt(o[0],o[1]))NET.push(o);}}
 const nearestGoal=(x,z)=>{let b=null,bd=1e18;for(const q of NET){const d=(q[0]-x)*(q[0]-x)+(q[1]-z)*(q[1]-z);if(d<bd){bd=d;b=q;}}return b;};
 const villages={},lots=[],skipped=[];
 for(const p of R.places){const id=String(p.id).split('.').pop().toUpperCase(),Q=PLAN[id];
  if(!Q){skipped.push({id:p.id,why:'no plan'});continue;}if(Q.own)continue;
  /* its link to the road net, as the main lane's direction (the nearest goal; the road itself is routed below) */
  const g0=nearestGoal(p.x,p.z);
  const row=typeof Q.row==='string'?KHAMLET.CULTURES[Q.row]:Q.row,sh=(Q.shore||Q.landing)?shore(p.x,p.z):null;
  const spec={id:p.id,world:0x48554b41,culture:row,focus:Q.focus,site:{x:p.x,z:p.z},popMax:p.people,
   dims:k=>{const B=DIMS[k];return B?{w:B.w,d:B.d,h:B.h}:null;},ground,siteReach:400};
  if(g0)spec.link={x:g0[0],z:g0[1]};
  if(Q.camp)spec.camp=true;
  if(Q.workers!=null)spec.resource={x:p.x,z:p.z,workers:Q.workers};
  else if(sh)spec.resource={x:sh.x,z:sh.z};else{const o=outward(p.x,p.z,150);spec.resource={x:o[0],z:o[1]};}
  if(Q.landing&&sh)spec.landing={x:sh.x,z:sh.z,ux:sh.ux,uz:sh.uz};
  const lay=()=>{try{return KHAMLET.village(spec);}catch(e){return {error:String(e&&e.message||e)};}};
  let V=lay();
  /* no ground, or no room for its houses: once more at the roomiest dry ground within 1.5 km (moved: `moved` says how far) */
  if(!V||V.error||!V.records){const r=roomiest(p.x,p.z,1500,60);
   if(r){const dx=r.x-p.x,dz=r.z-p.z;spec.site={x:r.x,z:r.z};if(spec.resource&&Q.workers==null&&!sh){const o=outward(r.x,r.z,150);spec.resource={x:o[0],z:o[1]};}
    if(spec.resource&&Q.workers!=null){spec.resource.x+=dx;spec.resource.z+=dz;}
    if(Q.shore||Q.landing){const s2=shore(r.x,r.z);if(s2){spec.resource=Q.workers!=null?spec.resource:{x:s2.x,z:s2.z};if(Q.landing)spec.landing={x:s2.x,z:s2.z,ux:s2.ux,uz:s2.uz};}}
    const W2=lay();if(W2&&!W2.error&&W2.records){V=W2;V.moved=Math.round(Math.hypot(dx,dz));}}}
  if(V&&Q.boat)V.boat=true;
  villages[p.id]=V;if(!V||V.error||!V.records){skipped.push({id:p.id,why:V&&V.error||'no records'});continue;}
  const kitOf=k=>{const B=DIMS[k];return B?B.kit:null;};
  V.records.forEach(r=>{if(!r)return;const c=Math.cos(r.ry),s=Math.sin(r.ry),hw=r.w/2,hd=r.d/2;let lo=1e9,hi=-1e9;
   for(const q of [[0,0],[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]]){const h=natH(r.x+q[0]*c+q[1]*s,r.z-q[0]*s+q[1]*c);lo=Math.min(lo,h);hi=Math.max(hi,h);}
   const kit=r.pending?null:kitOf(r.key);
   lots.push({id:r.id,kit,key:r.key,v:0,x:r.x,z:r.z,y:Math.max(hi,.3),ry:r.ry,w:r.w,d:r.d,h:r.h,drop:Math.max(0,Math.max(hi,.3)-lo)+.3,
    place:p.id,culture:p.culture,role:r.role,cls:'hamlet',pending:!kit,rubble:false,landing:r.role==='landing'});});}
 /* ---- THE LINKS: from each laid place's main lane's end to the road net, along the Ancient city's streets (the plan's
    lattice: 20 m streets between its blocks, so a link keeps off the towers by the city's own grid). A shortest path over
    the streets' crossings (Dijkstra, the climb weighed), a street passable where the ground is dry, out of the town and
    clear of every tower (a string of circles a little inside its box), heap, pier, foundation stub and building, and
    crossing the wall only at a gate. The lanes are core/hamlet's; links 5 m wide, lanes 6 */
 const roads=[],RQ=KSPACE.create({cell:40}),_rq=[];
 const rline=(x0,z0,x1,z1,r,step)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/step));for(let a=0;a<=n;a++)RQ.insert({r},x0+(x1-x0)*a/n,z0+(z1-z0)*a/n,r);};
 for(const t of R.towers){let x=t.x,z=t.z,w=t.w,d=t.d,yaw=t.yaw;
  if(t.state==='fallen'){const L=t.roof*.75,dir=t.leanDir;x=t.x+Math.sin(dir)*L/2;z=t.z+Math.cos(dir)*L/2;w=Math.min(t.w,t.d);d=L;yaw=dir;}
  const s=Math.min(w,d),L=Math.max(w,d),r=s/2+2,ax=w>=d?[Math.cos(yaw),-Math.sin(yaw)]:[Math.sin(yaw),Math.cos(yaw)],h=Math.max(0,(L-s)/2);
  rline(x-ax[0]*h,z-ax[1]*h,x+ax[0]*h,z+ax[1]*h,r,Math.max(4,s*.5));}
 for(const h of R.heaps){const r=(h.r==null?10:h.r)+2;RQ.insert({r},h.x,h.z,r);}
 for(const s of R.spans)RQ.insert({r:8},s.p0[0],s.p0[1],8);
 for(const f of R.foundations||[])for(const w of f.walls)rline(w[0],w[1],w[2],w[3],2.5,4);
 for(const L of lots){const r=Math.hypot(L.w,L.d)/2+1;RQ.insert({r,place:L.place},L.x,L.z,r);}
 const roadOk=(x,z,own)=>{if(!(natH(x,z)>.4))return false;if(R.townAt(x,z))return false;for(const o of RQ.query(x,z,0,_rq))if(o.r>0&&!(own&&o.place===own))return false;return true;};
 const W0=R.wall.p0,W1=R.wall.p1,gates=R.gates;
 const crossesWall=(a,b)=>{const d=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);const d1=d(W0,W1,a),d2=d(W0,W1,b),d3=d(a,b,W0),d4=d(a,b,W1);
  if(!((d1>0)!==(d2>0)&&(d3>0)!==(d4>0)))return false;const t=d1/(d1-d2),x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;return !gates.some(g=>Math.hypot(g.x-x,g.z-z)<30);};
 const legOk=(a,b,own)=>{if(crossesWall(a,b))return false;const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/12));
  for(let k=0;k<=n;k++){const x=a[0]+(b[0]-a[0])*k/n,z=a[1]+(b[1]-a[1])*k/n;if(!roadOk(x,z,own))return false;}return true;};
 const CR=(i,j)=>[R.cx(i)+R.PITCH/2,R.cz(j)-R.PITCH/2],ci=x=>Math.round((x-R.cx(0))/R.PITCH-.5),cj=z=>Math.round((R.cz(0)-z)/R.PITCH-.5);
 /* the crossings within four blocks of a point a straight leg reaches (the nearest first) */
 const near=(x,z,own)=>{const i0=ci(x),j0=cj(z),o=[];for(let dj=-4;dj<=4;dj++)for(let di=-4;di<=4;di++){const c=CR(i0+di,j0+dj);o.push([Math.hypot(c[0]-x,c[1]-z),i0+di,j0+dj,c]);}
  return o.sort((a,b)=>a[0]-b[0]).filter(q=>legOk([x,z],q[3],own)).slice(0,4);};
 const edgeMemo=new Map(),edge=(i,j,i2,j2)=>{const k=i<i2||(i===i2&&j<j2)?i+','+j+'|'+i2+','+j2:i2+','+j2+'|'+i+','+j;let v=edgeMemo.get(k);
  if(v===undefined){const a=CR(i,j),b=CR(i2,j2);v=legOk(a,b)?Math.hypot(b[0]-a[0],b[1]-a[1])*(1+8*Math.abs(natH(b[0],b[1])-natH(a[0],a[1]))/R.PITCH):-1;edgeMemo.set(k,v);}return v;};
 function route(start,own){const goals=new Map();for(const q of NET){const i=ci(q[0]),j=cj(q[1]);for(const c of [[i,j],[i+1,j],[i,j+1],[i+1,j+1],[i-1,j],[i,j-1]]){const p=CR(c[0],c[1]);
   if(Math.hypot(p[0]-q[0],p[1]-q[1])<R.PITCH&&!goals.has(c[0]+','+c[1])&&legOk(p,q))goals.set(c[0]+','+c[1],q);}}
  const S=near(start[0],start[1],own);if(!S.length)return {why:'no street crossing a straight leg reaches from the lane end'};const dist=new Map(),prev=new Map(),H=[];
  const push=(d,k)=>{H.push([d,k]);let i=H.length-1;while(i>0){const p=(i-1)>>1;if(H[p][0]<=H[i][0])break;[H[p],H[i]]=[H[i],H[p]];i=p;}};
  const pop=()=>{const t=H[0],e=H.pop();if(H.length){H[0]=e;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<H.length&&H[l][0]<H[m][0])m=l;if(r<H.length&&H[r][0]<H[m][0])m=r;if(m===i)break;[H[m],H[i]]=[H[i],H[m]];i=m;}}return t;};
  for(const q of S){const k=q[1]+','+q[2];dist.set(k,q[0]);prev.set(k,null);push(q[0],k);}
  let n=0,end=null;while(H.length&&n<30000){const [d,k]=pop();if(d>dist.get(k))continue;n++;if(goals.has(k)){end=k;break;}
   const [i,j]=k.split(',').map(Number);for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const c=edge(i,j,i+di,j+dj);if(c<0)continue;const k2=(i+di)+','+(j+dj),d2=d+c;
    if(!dist.has(k2)||d2<dist.get(k2)){dist.set(k2,d2);prev.set(k2,k);push(d2,k2);}}}
  if(!end)return {why:'no goal reached ('+n+' crossings, '+goals.size+' goal crossings)'};const pts=[goals.get(end)];for(let k=end;k;k=prev.get(k)){const [i,j]=k.split(',').map(Number);pts.push(CR(i,j));}pts.push(start);pts.reverse();
  /* straight runs as one segment */
  const o=[pts[0]];for(let i=1;i<pts.length-1;i++){const a=o[o.length-1],b=pts[i],c=pts[i+1],cr=(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);if(Math.abs(cr)>1)o.push(b);}o.push(pts[pts.length-1]);
  return {pts:o.map(q=>[+q[0].toFixed(2),+q[1].toFixed(2)]),visited:n};}
 const unlinked=[];
 for(const id of Object.keys(villages)){const V=villages[id];if(!V||!V.records)continue;
  /* a lane runs out to its last dry, clear point (core/hamlet runs the main one up to 200 m toward the link, which may be
     the water); the link starts there */
  const trim=l=>{const a=l.pts[0],b=l.pts[1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/5));let last=null;
   for(let k=0;k<=n;k++){const q=[a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n];if(roadOk(q[0],q[1],id))last=q;else if(last)break;}
   return last&&Math.hypot(last[0]-a[0],last[1]-a[1])>4?[a,[+last[0].toFixed(2),+last[1].toFixed(2)]]:null;};
  let start=[V.site.x,V.site.z];
  for(const l of V.lanes||[]){const t=trim(l);if(!t)continue;roads.push({id:l.id,kind:'lane',place:id,w:l.w,pts:t});if(l.main)start=t[1];}
  const r=route(start,id);
  if(!r||!r.pts){if(V.boat){V.routeWhy='by boat: its quay (cut off from the streets by water)';continue;}unlinked.push(id);V.routeWhy=r?r.why:'none';continue;}
  roads.push({id:id+':link',kind:'link',place:id,w:5,pts:r.pts});for(const q of dens(r.pts,20))NET.push(q);}
 /* ---- THE DROWNED SPIRE'S VILLAGE (C1): the Hykkousoi's grown pods (the Ys kit's, 90b's hykpod) spiralling up the Spire
    from above the water to under its broken crown, on the Spindle's own surface (the metropolis kit's MP.spindleR: KMP,
    77g); the plan's six pods (77) are among them, the rest each a bearing by the golden angle and a floor in turn */
 const spirePods=[],C1=R.places.find(p=>/c1$/.test(p.id)),SP=R.spire;
 /* its surface is read when a pod is drawn (90b: KMP's MP.spindleR); the top is under the crown's tear (the crown state
    stands to about 0.85 of the roof: kits/metropolis MP.ruin) */
 if(C1&&SP){const top=SP.roof*.85,base=SP.y,lo=Math.max(10,-base+6),hi=top-10,N=18,
   keys=['hyk_pod_poor_1','hyk_pod_poor_2','hyk_pod_mid_1','hyk_pod_poor_1','hyk_pod_mid_2','hyk_pod_shop_armour'];
  for(let k=0;k<N;k++){const u=KRAND.unit(KRAND.hash(0x53505245,k,1)),a=+((k*2.399963+u*.3)%(Math.PI*2)).toFixed(4),py=+(lo+(hi-lo)*(k+.3+u*.4)/N).toFixed(2);
   spirePods.push({id:C1.id+':pod:'+k,kit:'hykpod',key:keys[k%keys.length],v:0,x:SP.x,z:SP.z,y:base,ry:0,a,py,spec:{rAt:y=>KMP.MP.spindleR(y)},hostName:'The Drowned Spire',
    w:6,d:6,h:5,drop:0,place:C1.id,culture:'hykkousoi',role:'pod',cls:'hamlet',pending:false,rubble:false,aloft:true});}
  for(const L of spirePods)lots.push(L);villages[C1.id]={records:spirePods,site:{x:SP.x,z:SP.z},own:'spire'};}
 /* ---- THE DECK CAMP (C3): the salvagers' shacks along both edges of its standing freeway span, on the deck (77's span: its
    midpoint, its ends and its deck's height; the deck 24 m wide, its top 1.25 m over the record's y, as 90c draws it),
    each facing the deck's axis, the middle left clear */
 const C3=R.places.find(p=>/c3$/.test(p.id)),deck=[];
 if(C3&&C3.parent){const s=R.spans.find(q=>q.id===C3.parent);if(s&&s.state!=='fallen'){const ex=s.p1[0]-s.p0[0],ez=s.p1[1]-s.p0[1],L=Math.hypot(ex,ez),ux=ex/L,uz=ez/L,vx=-uz,vz=ux,top=s.y+1.25;
  const keys=['dw-box','dw-tire','dw-bus','shop-tinker','dw-tank','gen-wind','dw-box','dw-tire'];let t=[-L/2+6,-L/2+6];
  for(let k=0;k<keys.length;k++){const B=DIMS[keys[k]],side=k%2;if(!B||B.d>10)continue;if(t[side]+B.w>L/2-6)continue;const sg=side?1:-1,off=sg*(12-B.d/2-1.2),c=t[side]+B.w/2;
   deck.push({id:C3.id+':'+k,kit:'apoc',key:keys[k],v:0,x:+(s.x+ux*c+vx*off).toFixed(2),z:+(s.z+uz*c+vz*off).toFixed(2),y:top,ry:+Math.atan2(-sg*vx,-sg*vz).toFixed(4),
    w:B.w,d:B.d,h:B.h,drop:0,place:C3.id,culture:'ancients-salvage',role:k===3?'general':k===5?'works':'house',cls:'hamlet',pending:false,rubble:false,aloft:true});t[side]+=B.w+3;}
  for(const L of deck)lots.push(L);villages[C3.id]={records:deck,site:{x:s.x,z:s.z},own:'deck',span:s.id};}}
 function register(T){let n=0;for(const L of lots){T.add({id:L.id,class:'building',kind:L.role==='house'?'house':L.role==='pod'?'pod':'hamlet',key:L.key,parent:L.place,
  name:L.key+' ('+L.place+')',at:[L.x,L.y,L.z],ry:L.ry,size:[L.w,L.d,L.h],tags:{culture:L.culture==='ancients-salvage'?'post-apoc':L.culture,state:'intact'}});n++;}return n;}
 return {lots,villages,skipped,register,SALVAGE,SETTLERS,ground,ruinAt,roads,unlinked,roadOk,
  report:{places:Object.keys(villages).length,lots:lots.length,pending:lots.filter(L=>L.pending).length,skipped:skipped.map(s=>s.id),
   roads:{lanes:roads.filter(r=>r.kind==='lane').length,links:roads.filter(r=>r.kind==='link').length,unlinked},
   moved:Object.fromEntries(Object.keys(villages).filter(k=>villages[k]&&villages[k].moved).map(k=>[k,villages[k].moved]))}};})();
