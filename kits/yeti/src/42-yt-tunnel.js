// prefix: yt
// ================================================================= THE TUNNELS: covered ways between doors (PLAN.md section 3)
// The network itself is core/city's (KCITY.covered, core/city/36-city-covered.js: the doors in, the ways and junctions
// out, plain records); this fragment draws it. A tunnel is not heated: a buffer of still air at about -5 to 0 C and a cold
// trap for every door on it (PLAN.md section 4).
//   YT_TUN                    the section: a trench 1.2 m deep lined with dry slab, walls 0.7 m above the ground, a
//                             semi-elliptic vault over (2.45 m clear inside), the spoil banked against the walls
//   ytTunnelPiece(a, b, sec)  one straight run, a to b (local x,z), in a section: 'full' (the whole roof, pycrete coursed
//                             outside, an ice skylight every 10 m), 'slab' (removable pycrete slabs between stone ribs),
//                             'open' (the ribs alone: summer, where pycrete is only seasonal)
//   ytJunction(x, z, kind, angles)  the small dome over a crossing ('junction': a lamp niche and an inuksuk) or the lined
//                             dome of a long run ('warming': a lamp, a bench, robes), with an opening for each way
//   ytNetLayout, ytNetDraw    a whole KCITY.covered result laid out (crowding domes merged, runs trimmed at the domes)
//                             and drawn; ytNetHoles its ground holes; ytDoorNetPlan / Build a town's doors on it, the portals where
//                             a house's passage meets its tunnel; returns the ground holes it digs
const YT_TUN={hw:.85,hv:.55,ys:.7,yF:-1.2,t:.35,wt:.35,berm:1.3};
/* the dwellings' entry passage section, as a portal's inner opening (50-yt-dwell.js keeps the same numbers) */
const YT_PASS={hw:.55*YT_S,hv:.75*YT_S,ys:-.25,yF:-1.2};
/* how far from a dome's centre a run must reach so it meets the dome's inner shell even at its vault's crown (the shell
   curves in above the springing: a run stopped at the base radius falls short of it up there and leaves a slit) */
function ytRunReach(r,kind){const T=YT_TUN,H=kind==='warming'?2.9:2.4,Hi=H-.35*.9;return Math.min(r-.05,ytCatR(r,Hi,T.ys+T.hv+T.t)-.05);}
function ytTunnelPiece(ax,az,bx,bz,sec,season,o){o=o||{};const T=YT_TUN,dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz);if(L<.05)return;
 const coat=season==='winter'?'snow':'turf',xo=T.hw+T.wt;
 W(ax,0,az,Math.atan2(dx,dz),()=>{
  /* the trench: flagged floor, slab walls to the springing, the spoil banked outside them */
  box('flag',0,T.yF-.12,L/2,T.hw*2+T.wt,.12,L,P('flag'));
  for(const s of [-1,1]){box('slab',s*(T.hw+T.wt/2),T.yF,L/2,T.wt,T.ys-T.yF,L,P('slab'));
   psurf(coat,(u,v)=>[s*(xo+T.berm*u),T.ys*(1-u),L*v],2,Math.max(1,Math.round(L/2)),P(coat),{flip:s>0});}
  const yC=T.ys+T.hv+T.t;
  if(sec==='full'){ytVault('pycrete',T.hw,T.hv,T.ys,0,L,P('ice'),{inward:true});ytVault('course',T.hw+T.t,T.hv+T.t,T.ys,0,L,P('ice'));
   if(season!=='autumn')ytVault(coat,T.hw+T.t+.28,T.hv+T.t+.28,T.ys,.05,L-.05,P(coat));
   for(let z=5;z<L-2;z+=10)ellip('ice',0,yC+(season!=='autumn'?.28:0)+.01,z,.3,.07,.42,P('ice'),0,12);
   /* the vault's thickness closed at an open end (a run stopping inside a dome would show it hollow from within) */
   if(!o.capA){ytArchFace('pycrete',T.hw,T.hv,T.t,T.ys,0,-1,P('ice'));if(season!=='autumn')ytArchFace(coat,T.hw+T.t,T.hv+T.t,.28,T.ys,.05,-1,P(coat));}
   if(!o.capB){ytArchFace('pycrete',T.hw,T.hv,T.t,T.ys,L,1,P('ice'));if(season!=='autumn')ytArchFace(coat,T.hw+T.t,T.hv+T.t,.28,T.ys,L-.05,1,P(coat));}}
  else{/* stone ribs every 1.4 m; in the 'slab' section the pycrete slabs between them (and the winter's snow over all) */
   const n=Math.max(1,Math.round(L/1.4)),step=L/n;
   for(let i=0;i<=n;i++){const z=Math.min(L-.28,Math.max(0,i*step-.14));
    ytVault('slab',T.hw+T.t+.06,T.hv+T.t+.06,T.ys,z,z+.28,P('slab'));ytVault('slab',T.hw,T.hv,T.ys,z,z+.28,P('slab'),{inward:true});
    ytArchFace('slab',T.hw,T.hv,T.t+.06,T.ys,z,-1,P('slab'));ytArchFace('slab',T.hw,T.hv,T.t+.06,T.ys,z+.28,1,P('slab'));}
   if(sec==='slab'){for(let i=0;i<n;i++){const z0=i*step+.14,z1=(i+1)*step-.14;if(z1-z0<.1)continue;
     ytVault('course',T.hw+T.t,T.hv+T.t,T.ys,z0,z1,P('ice'));ytVault('pycrete',T.hw,T.hv,T.ys,z0,z1,P('ice'),{inward:true});}
    if(season==='winter')ytVault('snow',T.hw+T.t+.34,T.hv+T.t+.34,T.ys,.05,L-.05,P('snow'));}}
  if(o.capA)ytPortal(o.capA==='wall'?'slab':'course',o.capA==='wall'?{hw:.01,hv:.01,ys:T.ys,yF:T.yF}:YT_PASS,{hw:T.hw+T.t,hv:T.hv+T.t,ys:T.ys,yF:T.yF},0,-1,P(o.capA==='wall'?'slab':'ice'));
  if(o.capB)ytPortal(o.capB==='wall'?'slab':'course',o.capB==='wall'?{hw:.01,hv:.01,ys:T.ys,yF:T.yF}:YT_PASS,{hw:T.hw+T.t,hv:T.hv+T.t,ys:T.ys,yF:T.yF},L,1,P(o.capB==='wall'?'slab':'ice'));});}
/* a junction or warming dome over (x,z): angles are the directions (x = cos a, z = sin a) its ways leave by */
function ytJunction(x,z,kind,angles,season){const T=YT_TUN,warm=kind==='warming',r=warm?2.5:1.9,t=.35,H=warm?2.9:2.4,coat=season==='winter'?'snow':season==='summer'?'turf':null;
 const AE={hw:T.hw+T.t,hv:T.hv+T.t,ys:T.ys},doors=angles.map(a=>({ga:a,arch:AE,grow:-.03})),doorsL=angles.map(a=>({ga:a,arch:AE,grow:-.03}));
 W(x,0,z,0,()=>{
  /* the round pit: its slab wall broken where the ways come in, its flagged floor */
  const gs=angles.map(a=>{const g=Math.asin(Math.min(.95,(T.hw+T.wt)/r));return [((a-g)%TAU+TAU)%TAU,2*g];}).sort((p,q)=>p[0]-q[0]);
  for(let i=0;i<gs.length;i++){const s=gs[i][0]+gs[i][1],e=i+1<gs.length?gs[i+1][0]:gs[0][0]+TAU;if(e-s>.05)sector('slab',0,0,r,r+.3,s,e,T.yF,YT_KERB,P('slab'),Math.max(3,Math.round((e-s)*8)));}
  cyl('flag',0,T.yF-.12,0,r,.15,P('flag'),24);ytWalkDisc(0,0,r-.05,T.yF+.03);ytWalkRing(0,0,r,r+.3,T.yF,T.yF+2.4,angles.map(a=>({ga:a,w:2*(T.hw+T.wt)})));ytWalkTarget(warm?'warming dome':'junction',0,T.yF+.03,0,{opt:true});
  ytDome('course',r+t,H,P('ice'),{doors,rTop:.12,spiral:.5,seg:36});ytDome('pycrete',r,H-t*.9,P('ice'),{doors,rTop:.12,inward:true,spiral:.5,seg:36});
  ellip('ice',0,H-.03,0,.2,.06,.2,P('ice'),0,10);
  if(coat){const r1=ytCatR(r+t,H,.9);ytSweep(coat,[[r+t+.8,0],[r+t+.35,.45],[r1+.05,1.0]],0,TAU,28,P(coat),false,0);}
  /* inside: a lamp on a stone ledge between two ways; an inuksuk at the junction, robes and a bench in a warming dome */
  const mid=gs.length>1?(gs[0][0]+gs[0][1]+gs[1][0])/2:gs[0][0]+PI,lx=Math.cos(mid)*(r-.35),lz=Math.sin(mid)*(r-.35);
  box('slab',lx,T.yF,lz,.6,.9,.45,P('slab'),-mid+PI/2);ytLamp(lx,T.yF+.9,lz,-mid+PI/2);
  if(warm){ytShell('hideCap',ytCatProf(r-.2,H-t*.9-.3,0,12,.14),P('ice'),{doors:doorsL,inward:true,seg:36});
   const bm=mid+PI,bx=Math.cos(bm)*(r-.6),bz=Math.sin(bm)*(r-.6);box('larch',bx,T.yF,bz,1.6,.45,.55,P('larch'),-bm+PI/2);box('muskox',bx,T.yF+.45,bz,1.5,.06,.5,P('ice'),-bm+PI/2);}
  else{const im=mid+PI,ix=Math.cos(im)*(r-.45),iz=Math.sin(im)*(r-.45);
   W(ix,T.yF,iz,-im,()=>{box('slab',0,0,0,.36,.5,.22,P('slab'));box('slab',0,.5,0,.7,.14,.18,P('slab'));box('slab',0,.64,0,.22,.32,.2,P('slab'));box('slab',0,.96,0,.16,.14,.16,P('slab'));});}});}
/* a whole network, laid out as data and then drawn. net: KCITY.covered's {ways, junctions}; own [{id, x, z, r, angles}]:
   the caller's domes on network nodes (a house's lead dome, with the angle back to its house). Domes that crowd each
   other (closer than their radii and 0.6 m) are merged into one, the first of them (a caller's dome before a junction):
   two domes that close would leave the run between them trimmed to nothing and each one's doorway toward the other open.
   Every way end at a merged dome moves to its centre. ytNetLayout is pure data, so the ground's holes and the drawing
   read the same layout; ytNetDraw draws it, ytNetHoles cuts the ground for it. */
function ytNetLayout(net,own){const domes=(own||[]).map(d=>Object.assign({fixed:d.angles||[],own:true},d)).concat(net.junctions.map(j=>Object.assign({fixed:[],r:j.kind==='warming'?2.5:1.9},j)));
 const rep={},byId={};domes.forEach(d=>{rep[d.id]=d.id;byId[d.id]=d;});const root=id=>{while(rep[id]!==id)id=rep[id];return id;};
 for(let i=0;i<domes.length;i++)for(let k=i+1;k<domes.length;k++){const A=domes[i],B=domes[k];
  /* two callers' domes are never merged: each ends its own house's lead */
  if(A.own&&B.own)continue;
  if(Math.hypot(A.x-B.x,A.z-B.z)<A.r+B.r+.6){const ra=root(A.id),rb=root(B.id);if(ra!==rb&&!(byId[ra].own&&byId[rb].own))rep[rb]=ra;}}
 const R=id=>byId[id]?byId[root(id)]:null,ways=[];
 for(const W of net.ways){const A=R(W.a),B=R(W.b),P=W.pts.map(p=>p.slice());if(A)P[0]=[A.x,A.z];if(B)P[P.length-1]=[B.x,B.z];if(A&&B&&A.id===B.id)continue;ways.push({W,P,A,B});}
 /* two ways leaving one dome close together (under 0.9 rad apart) would cross each other's walls: the shorter is
    folded onto the longer at a new junction a few metres out along it */
 const endDir=(w,d)=>{const P=w.P,n=P.length;return w.A===d?Math.atan2(P[1][1]-P[0][1],P[1][0]-P[0][0]):Math.atan2(P[n-2][1]-P[n-1][1],P[n-2][0]-P[n-1][0]);};
 const wlen=w=>{let L=0;for(let i=1;i<w.P.length;i++)L+=Math.hypot(w.P[i][0]-w.P[i-1][0],w.P[i][1]-w.P[i-1][1]);return L;};
 let nNew=0;for(let pass=0;pass<12;pass++){let did=false;
  for(const d of domes.filter(q=>root(q.id)===q.id)){const W2=ways.filter(w=>w.A===d||w.B===d);if(W2.length<2)continue;
   for(let i=0;i<W2.length&&!did;i++)for(let k=i+1;k<W2.length&&!did;k++){const w1=W2[i],w2=W2[k];let da=Math.abs(((endDir(w1,d)-endDir(w2,d))%TAU+TAU+PI)%TAU-PI);if(da>=.9)continue;
    const lg=wlen(w1)>=wlen(w2)?w1:w2,sh=lg===w1?w2:w1,L=wlen(lg),sd=Math.min(L*.5,d.r+3.4);if(sd<d.r+1)continue;
    /* the point sd along the long way from d */
    const P=lg.A===d?lg.P:lg.P.slice().reverse();let acc=0,pt=null,ix=1;for(let j=1;j<P.length;j++){const g=Math.hypot(P[j][0]-P[j-1][0],P[j][1]-P[j-1][1]);if(acc+g>=sd){const t=(sd-acc)/g;pt=[P[j-1][0]+(P[j][0]-P[j-1][0])*t,P[j-1][1]+(P[j][1]-P[j-1][1])*t];ix=j;break;}acc+=g;}
    if(!pt)continue;const J={id:'cjx:'+(nNew++),kind:'junction',x:pt[0],z:pt[1],r:1.9,fixed:[]};domes.push(J);rep[J.id]=J.id;byId[J.id]=J;
    const far=lg.A===d?lg.B:lg.A,head=P.slice(0,ix).concat([pt]),tail=[pt].concat(P.slice(ix));
    lg.P=head;lg.A=d;lg.B=J;ways.push({W:Object.assign({},lg.W,{id:lg.W.id+'x'}),P:tail,A:J,B:far});
    if(sh.A===d){sh.A=J;sh.P[0]=pt.slice();}else{sh.B=J;sh.P[sh.P.length-1]=pt.slice();}did=true;}
   if(did)break;}
  if(!did)break;}
 /* a warming dome stands on its run: where the run's ends moved to a merged dome, the dome moves onto the run's new line
    (left where it was it would stand beside the run, and the run would pass straight through it uncut) */
 for(const d of domes){if(d.kind!=='warming'||root(d.id)!==d.id)continue;const w=ways.find(q=>q.W.id===d.way);if(!w)continue;let best=null;
  for(let i=1;i<w.P.length;i++){const a=w.P[i-1],b=w.P[i],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz||1,t=Math.max(.15,Math.min(.85,((d.x-a[0])*dx+(d.z-a[1])*dz)/L2)),x=a[0]+dx*t,z=a[1]+dz*t,e=Math.hypot(d.x-x,d.z-z);if(!best||e<best[2])best=[x,z,e];}
  if(best){d.x=best[0];d.z=best[1];}}
 const ang={},push=(d,a)=>{(ang[d.id]=ang[d.id]||[]).push(a);},warmOn=d=>d.kind==='warming'&&root(d.id)===d.id;
 for(const w of ways){const P=w.P,n=P.length;if(w.A)push(w.A,Math.atan2(P[1][1]-P[0][1],P[1][0]-P[0][0]));if(w.B)push(w.B,Math.atan2(P[n-2][1]-P[n-1][1],P[n-2][0]-P[n-1][0]));}
 for(const d of domes)if(warmOn(d)){const w=ways.find(q=>q.W.id===d.way);if(w){const a=Math.atan2(w.P[1][1]-w.P[0][1],w.P[1][0]-w.P[0][0]);push(d,a);push(d,a+PI);}}
 const pieces=[],corners=[];
 for(const w of ways){const P=w.P;
  const trim=(i,k,r)=>{const a=P[i],b=P[k],d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d>r+.1)P[i]=[a[0]+(b[0]-a[0])*r/d,a[1]+(b[1]-a[1])*r/d];};
  if(w.A)trim(0,1,ytRunReach(w.A.r,w.A.kind));if(w.B)trim(P.length-1,P.length-2,ytRunReach(w.B.r,w.B.kind));
  let pc=[];for(let i=1;i<P.length;i++)pc.push([P[i-1],P[i]]);
  for(const wj of domes.filter(d=>warmOn(d)&&d.way===w.W.id)){const out=[];for(const q of pc){const [a,b]=q,dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),t=((wj.x-a[0])*dx+(wj.z-a[1])*dz)/(L*L);
    if(t>0&&t<1&&Math.abs(-(wj.x-a[0])*dz+(wj.z-a[1])*dx)/L<.5){const tm=ytRunReach(wj.r,'warming')/L;out.push([a,[a[0]+dx*(t-tm),a[1]+dz*(t-tm)]],[[a[0]+dx*(t+tm),a[1]+dz*(t+tm)],b]);}else out.push(q);}pc=out;}
  for(const q of pc)if(Math.hypot(q[1][0]-q[0][0],q[1][1]-q[0][1])>=.2)pieces.push({a:q[0],b:q[1],section:w.W.section});
  for(let i=1;i<P.length-1;i++)corners.push({x:P[i][0],z:P[i][1],r:1.9,kind:'junction',angles:[Math.atan2(P[i-1][1]-P[i][1],P[i-1][0]-P[i][0]),Math.atan2(P[i+1][1]-P[i][1],P[i+1][0]-P[i][0])]});}
 const out=[];for(const d of domes){if(root(d.id)!==d.id)continue;
  /* angles closer than a doorway's width are one doorway */
  const U=[];for(const a of d.fixed.concat(ang[d.id]||[]).map(a=>(a%TAU+TAU)%TAU).sort((p,q)=>p-q))if(!U.length||a-U[U.length-1]>.35)U.push(a);
  if(U.length>1&&U[0]+TAU-U[U.length-1]<.35)U.pop();out.push({x:d.x,z:d.z,r:d.r,kind:d.kind==='warming'?'warming':'junction',angles:U});}
 return {domes:out.concat(corners),pieces,ways:ways.length,warming:out.filter(d=>d.kind==='warming').length};}
function ytNetDraw(L,season){for(const p of L.pieces)ytTunnelPiece(p.a[0],p.a[1],p.b[0],p.b[1],p.section,season,{});for(const d of L.domes)ytJunction(d.x,d.z,d.kind,d.angles,season);}
function ytNetHoles(L){const hw=YT_TUN.hw+YT_TUN.wt/2;return L.pieces.map(p=>({run:[p.a[0],p.a[1],p.b[0],p.b[1],hw]})).concat(L.domes.map(d=>({circle:[d.x,d.z,d.r+.15]})));}
/* local shapes of a child placed at (x, z, ry), in its parent's frame */
function ytHolesXf(S,x,z,ry){const c=Math.cos(ry),s=Math.sin(ry),f=(px,pz)=>[x+px*c+pz*s,z-px*s+pz*c];
 return S.map(h=>{if(h.circle){const p=f(h.circle[0],h.circle[1]);return {circle:[p[0],p[1],h.circle[2]]};}
  if(h.run){const a=f(h.run[0],h.run[1]),b=f(h.run[2],h.run[3]);return {run:[a[0],a[1],b[0],b[1],h.run[4]]};}return {poly:h.poly.map(p=>f(p[0],p[1]))};});}
/* a town's doors on one covered network (PLAN.md section 3). houses [{id, key, x, z, ry}]: each def's covered variant
   ends its passage at the mouth (DEFS[key].mouth: the mouth's local z); a straight lead of the tunnel runs on 2.4 m to the
   house's node, a dome over the node turns it onto the network KCITY.covered lays between the nodes. o: warmEvery,
   section. ytDoorNetPlan is data only (the ground is cut from it before the world is built); ytDoorNetBuild draws it. */
function ytDoorNetPlan(houses,o){o=o||{};const lead=2.4,H=houses.map(h=>{const mz=DEFS[h.key].mouth,s=Math.sin(h.ry),c=Math.cos(h.ry);
  return Object.assign({},h,{mx:h.x+mz*s,mz:h.z+mz*c,lx:h.x+(mz+lead)*s,lz:h.z+(mz+lead)*c});});
 const net=KCITY.covered(H.map(h=>({id:h.id,x:h.lx,z:h.lz})),{w:2*YT_TUN.hw,section:o.section||'full',warmEvery:o.warmEvery==null?40:o.warmEvery,endGap:3});
 const layout=ytNetLayout(net,H.map(h=>({id:h.id,x:h.lx,z:h.lz,r:1.9,kind:'junction',angles:[Math.atan2(h.mz-h.lz,h.mx-h.lx)]})));
 return {houses:H,net,layout};}
function ytDoorNetHoles(N){let H=[];const T=YT_TUN;
 for(const h of N.houses){H=H.concat(ytHolesXf(DEFS[h.key].holes({covered:true}),h.x,h.z,h.ry));H.push({run:[h.mx,h.mz,h.lx,h.lz,T.hw+T.wt/2]});}
 return H.concat(ytNetHoles(N.layout));}
function ytDoorNetBuild(N,v){const season=YT_SEASONS[(v|0)%3];
 for(const h of N.houses){place(h.key,h.x,h.z,h.ry,{y:0,v:v|0,covered:true});
  /* the lead from the passage's mouth to its node, the portal where the passage meets it (the node's dome is the layout's) */
  const dd=Math.hypot(h.lx-h.mx,h.lz-h.mz),r=ytRunReach(1.9,'junction'),ex=h.mx+(h.lx-h.mx)*(dd-r)/dd,ez=h.mz+(h.lz-h.mz)*(dd-r)/dd;
  ytTunnelPiece(h.mx,h.mz,ex,ez,'full',season,{capA:'pass'});}
 ytNetDraw(N.layout,season);
 return {houses:N.houses.length,ways:N.layout.ways,domes:N.layout.domes.length,warming:N.layout.warming};}
