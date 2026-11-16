// ================================================================= STRONGBOW TODAY — the interiors: rooms, storeys, stairs, solid walls
// [G data] The owner, 2026-11-15: "build all walls solid, work on open issues, then implement interiors for the arcology". Every
// standing part of the arcology and its foot gets its inside as records, on core/walk (KWALK) beside the walk up (32-sb-walk.js):
//   SB_ROOMS.plan(layout, plan, walkS) -> {storeys, rooms, floors, walls, doors, stairs, locked, parts, warn}
//   SB_ROOMS.register(W, R, {town})      floors, stairs (strips), walls and shut doors as blocks; the town's buildings as solids
//   SB_ROOMS.audit(R, S, o)              which rooms a walker gets to (test-sb-rooms.js): a flood per storey, chained by stairs
//                                        and doorsteps (a flood of the whole arcology at once takes minutes)
// THE DRUMS (P.drums, standing): a storey every h/st, each an Ancients ring plate (kits/ancients-interiors AI.ringPlate: rooms cut
//   radially out to the glass, a corridor ring, a core hall); a switchback in the core hall, storey to storey. Between drums a
//   flight climbs through the neck from the top storey's core hall to the next drum's bottom one, placed where both core halls (and
//   the neck, where a terrace stands at it) hold it clear of the other stairs and the lifts' shafts; at a terrace it lands on a
//   plate in the neck with a door to the deck.
// THE TERRACES: each ring building (between the drum column and r - 12) a ring of rooms off a corridor along the column, a passage
//   left open where the way out runs, a door from each room to the promenade.
// THE LOBBY: its three galleries are floors; the great stair (drawn by targets/strongbow 8aw3) is a stair of strips, a bridge from it
//   to each gallery at that gallery's height, and a flight from its top into the first drum.
// THE BOXES (the wings, the back block, the face's galleries, the shed, the gatehouse, the rim): a stair hall 9 m deep across one
//   end (the switchback in it), the rest in bars of at most 22 m across, each an AI bar plate (rooms either side of a corridor, an
//   end room open to the hall), walls between the bars. A box on another climbs from the lower one's hall to its own: its hall is at
//   the end that meets the lower one's.
// THE ORDER'S TOWER (sb.tower.order, the wedge): its storeys in bars across the wedge, shortened to the flanks; the hall at the
//   back; a flight down from the crown's deck, which the arc ramp reaches from the gatehouse; below it, through the sealed storeys,
//   the Order's own stair in a walled shaft down to the Nock's deck (the layout's way "down through the tower to the Nock").
// THE WAYS: every door way in the layout is a door in the walls it crosses (one door where two boxes share a wall), with a doorstep
//   (a sill floor the audit reads) and, where nothing joins it to the part it leads to, an apron or a bridge; a way the layout keeps
//   shut (the sealed drums, the Order's seal) is a locked door; the town's buildings are solids until the scrap set's interiors
//   (the scrap Xanadu session) arrive.
// Walls are blocks (core/walk's are axis-aligned): one block per straight run along an axis, a metre at most along a slanted wall,
// each open at its doors. Hashed only, no rng.
var SB_ROOMS=(function(){
 const WT=.2,DOORW=1.4,TAU=Math.PI*2,HD=9,BARD=22,SLOPE=.55;
 const hyp=Math.hypot;
 const segD=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz;let t=l>0?((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l:0;t=Math.max(0,Math.min(1,t));return hyp(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);};
 function plan(L,P,S){
  const AI=typeof KratorAncientsInteriors!=='undefined'?KratorAncientsInteriors:null;
  const F=P.frame,PT={};for(const p of L.parts)PT[p.id]=p;
  const R={storeys:[],rooms:[],floors:[],walls:[],doors:[],stairs:[],locked:[],parts:{},warn:[]};
  const floor=(id,o)=>{o.id=id;R.floors.push(o);return o;};
  /* a door, and its doorstep: a sill floor 0.8 m square in the gap, which the audit reads to tell a walker came through */
  const door=(id,at,y,o)=>{const d=Object.assign({id,at,y,w:DOORW,h:2.6},o||{});R.doors.push(d);
   if(d.step!==false)floor('door:'+id,{rect:[at[0]-.4,at[0]+.4,at[1]-.4,at[1]+.4],y,door:id});return d;};
  const stair=(id,a,b,w,o)=>{const s=Object.assign({id,a,b,w:w||1.6},o||{});R.stairs.push(s);return s;};
  /* a wall line as blocks, open at the doors given: a door cuts its own width out of the line (the span of the segment within w/2
     of the door's point along it), then the rest is one block per span where the segment runs along an axis, pieces of at most a
     metre where it is slanted */
  const wallLine=(id,pts,y0,y1,doors,t)=>{t=t||WT;const ds=(doors||[]).filter(d=>y0<d.y+2.6&&y1>d.y);
   for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],l=hyp(b[0]-a[0],b[1]-a[1]);if(l<1e-6)continue;const ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l,axial=Math.abs(ux)<1e-6||Math.abs(uz)<1e-6;
    let spans=[[0,l]];for(const d of ds){const s=(d.at[0]-a[0])*ux+(d.at[1]-a[1])*uz,off=Math.abs((d.at[0]-a[0])*uz-(d.at[1]-a[1])*ux);if(off>.6)continue;
     /* a slanted wall's blocks are its pieces' bounds, fatter than the piece: the cut is widened by that, so the gap stays the door's width */
     const pad=axial?0:(Math.abs(ux)*Math.abs(uz))*1.2+t/2,c0=s-d.w/2-pad,c1=s+d.w/2+pad,nx=[];for(const [s0,s1] of spans){if(c1<=s0||c0>=s1){nx.push([s0,s1]);continue;}if(c0>s0)nx.push([s0,c0]);if(c1<s1)nx.push([c1,s1]);}spans=nx;}
    for(const [s0,s1] of spans){const n=axial?1:Math.max(1,Math.ceil(s1-s0));for(let k=0;k<n;k++){const e0=s0+(s1-s0)*k/n,e1=s0+(s1-s0)*(k+1)/n;if(e1-e0<.05)continue;
     const p=[a[0]+ux*e0,a[1]+uz*e0],q=[a[0]+ux*e1,a[1]+uz*e1];
     R.walls.push({id,box:[Math.min(p[0],q[0])-t/2,Math.max(p[0],q[0])+t/2,Math.min(p[1],q[1])-t/2,Math.max(p[1],q[1])+t/2,y0,y1]});}}}};
  const circle=(c,r,n)=>{const o=[];for(let i=0;i<=n;i++){const a=i/n*TAU;o.push([c[0]+r*Math.cos(a),c[1]+r*Math.sin(a)]);}return o;};
  const sectors=(id,c,r0,r1,y,n,hole)=>{n=n||32;for(let i=0;i<n;i++){const pts=[];for(let j=0;j<=3;j++){const a=(i+j/3)/n*TAU;pts.push([c[0]+r1*Math.cos(a),c[1]+r1*Math.sin(a),y]);}
   for(let j=3;j>=0;j--){const a=(i+j/3)/n*TAU;let rr=r0;if(hole){const ca=Math.cos(a),sa=Math.sin(a),hw=(hole[1]-hole[0])/2,hd=(hole[3]-hole[2])/2;rr=Math.max(r0,Math.min(Math.abs(ca)>1e-9?hw/Math.abs(ca):1e9,Math.abs(sa)>1e-9?hd/Math.abs(sa):1e9));}
    pts.push([c[0]+rr*Math.cos(a),c[1]+rr*Math.sin(a),y]);}floor(id+'.'+i,{poly:pts,y});}};
  /* a plate's floors, one a room (the audit then says which rooms a walker gets to): a room's polygon, a corridor ring in
     sectors, a core in sectors less a lift's shaft */
  const plateFloors=(plate,c,hole)=>{for(const rm of plate.rooms){if(rm.poly&&!(hole&&rm.kind!=='corridor'&&/\.core$/.test(rm.id)))floor(rm.id,{poly:rm.poly.map(q=>[q[0],q[1],rm.y]),y:rm.y,room:rm.id});
    else if(rm.ring){const r0=typeof rm.ring.r0==='function'?rm.ring.r0(0):rm.ring.r0,r1=typeof rm.ring.r1==='function'?rm.ring.r1(0):rm.ring.r1;sectors(rm.id,[rm.ring.cx,rm.ring.cz],r0,r1+.02,rm.y,32);}
    else if(rm.poly&&hole){let r=0;for(const q of rm.poly)r=Math.max(r,hyp(q[0]-c[0],q[1]-c[1]));sectors(rm.id,c,0,r,rm.y,32,hole);}}};
  const addPlate=(part,p,plate,k,y,H)=>{R.storeys.push({part,level:k,y,h:H,plate});for(const rm of plate.rooms)R.rooms.push(Object.assign({part,state:p.state,by:p.by},rm));
   for(const w of plate.walls)wallLine(plate.id+'.wall',w.pts,y,y+H-.3,w.door?[{at:w.door.at,w:w.door.w,y}]:[]);};
  const kindsFor=p=>{const u=(p.use||'')+' '+p.kind,by=p.by,st=p.state;
   if(st==='sealed'||st==='cutoff'||st==='damaged'&&by==='ancient')return ()=>'store';
   if(by==='outcasts')return i=>['cottage','cottage','store','kitchen'][i%4];
   if(by==='order')return i=>['bedroom','bedroom','shrine','hall','kitchen'][i%5];
   if(/barracks/.test(u))return i=>['bunkroom','bunkroom','armoury','mess'][i%4];
   if(/office|gov|customs|gate/.test(u))return i=>['hall','strongroom','hall','chartroom'][i%4];
   if(/works|shops|sheds/.test(u))return i=>['workshop','workshop','store'][i%3];
   if(/store/.test(u))return ()=>'store';
   return i=>['bedroom','bedroom','kitchen','cottage','bedroom','workshop'][i%6];};
  const wayOf=(a,b)=>L.ways.find(q=>(q.a===a&&q.b===b)||(q.a===b&&q.b===a));
  const locked=(a,b)=>{const w=wayOf(a,b);return w?w.open===false:false;};
  const lift=id=>S.lifts.find(l=>l.ways.indexOf(id)>=0);
  /* a flight from y0 to y1 at SLOPE, placed by search: inside every circle of cons ([cx, cz, r]) along its whole run, clear of the
     stairs already placed at heights it shares and of the lifts' shafts. The first place that fits, nearest the circles' mean. */
  const liftPts=S.lifts.map(l=>({rect:[l.car.rect[0]-.6,l.car.rect[1]+.6,l.car.rect[2]-.6,l.car.rect[3]+.6]}));   /* the shaft: the car and its walls */
  const placeFlight=(id,y0,y1,cons,o)=>{o=o||{};const run=Math.max(4,Math.abs(y1-y0)/SLOPE),w=o.w||1.6,m=w/2+.5,ylo=Math.min(y0,y1)-3,yhi=Math.max(y0,y1)+3;
   const avoid=liftPts.concat(R.stairs.filter(s=>Math.max(s.a[2],s.b[2])>ylo&&Math.min(s.a[2],s.b[2])<yhi).map(s=>({a:s.a,b:s.b,w:s.w})));
   let cx=0,cz=0;for(const c of cons){cx+=c[0];cz+=c[1];}cx/=cons.length;cz/=cons.length;
   const offs=[[0,0]];for(let r=2;r<=20;r+=2)for(let k=0;k<12;k++){const a=k/12*TAU;offs.push([r*Math.cos(a),r*Math.sin(a)]);}
   const N=Math.ceil(run*2);
   for(const [ox,oz] of offs)for(let k=0;k<12;k++){const a=k/12*Math.PI,dx=Math.cos(a),dz=Math.sin(a),c=[cx+ox,cz+oz],p=[c[0]-dx*run/2,c[1]-dz*run/2],q=[c[0]+dx*run/2,c[1]+dz*run/2];
    let ok=true;for(let i=0;i<=N&&ok;i++){const f=i/N,x=p[0]+(q[0]-p[0])*f,z=p[1]+(q[1]-p[1])*f;
     for(const C of cons)if(hyp(x-C[0],z-C[1])>C[2]-m){ok=false;break;}
     if(ok)for(const A of avoid){if(A.rect?hyp(Math.max(A.rect[0]-x,0,x-A.rect[1]),Math.max(A.rect[2]-z,0,z-A.rect[3]))<m:segD([x,z],A.a,A.b)<A.w/2+m+.3){ok=false;break;}}}
    if(ok)return stair(id,[p[0],p[1],y0],[q[0],q[1],y1],w,o);}
   R.warn.push('no room for the flight '+id);return null;};

  // ---- the drums: storeys of ring plates, a stair in the core hall, the necks between them ---------------------------------------
  const SP=P.dim.SPINE,drumsUp=P.drums.filter(d=>PT[d.id]&&PT[d.id].state!=='gone').slice().sort((a,b)=>a.at[1]-b.at[1]);
  const L1=lift('L1'),L1hole=L1?L1.car.rect:null;
  const drumInfo={},coreR=d=>d.r-.6-9-2.4;
  for(const d of drumsUp){const p=PT[d.id],c=[d.at[0],d.at[2]],st=Math.max(1,p.st|0),H=d.h/st,kinds=kindsFor(p),inL1=L1&&hyp(c[0]-L1.frame[0],c[1]-L1.frame[1])<1;
   const rOut=d.r-.6,info={c,y0:d.at[1],y1:d.at[1]+d.h,st,H,storeys:[]};drumInfo[d.id]=info;R.parts[d.id]={kind:'drum',storeys:st};
   for(let k=0;k<st;k++){const y=d.at[1]+k*H,sid=d.id+'.L'+k;
    const plate=AI?AI.ringPlate({id:sid,level:k,y,h:H,cx:c[0],cz:c[1],rOut:()=>rOut,depth:9,cw:2.4,roomW:7,door:DOORW,core:{r:coreR(d),kind:'hall',wall:false},kinds:(i)=>kinds(i)}):null;
    if(plate){addPlate(d.id,p,plate,k,y,H);plateFloors(plate,c,inL1?L1hole:null);}
    else sectors(sid+'.floor',c,0,rOut,y,32,inL1?L1hole:null);info.storeys.push(y);}
   /* the glass: a ring of blocks the whole drum's height (no door: the drums are entered by their stairs) */
   wallLine(d.id+'.skin',circle(c,d.r-.3,96),d.at[1],d.at[1]+d.h,[]);
   /* the core hall's switchback: storey k's flight west to east on one line, the next east to west on the line beside it */
   for(let k=0;k+1<st;k++){const z=c[1]-9-(k%2)*2.6,x0=c[0]-6,x1=c[0]+6,ya=info.storeys[k],yb=info.storeys[k+1];
    stair(d.id+'.stair.'+k,k%2?[x1,z,ya]:[x0,z,ya],k%2?[x0,z,yb]:[x1,z,yb],1.6,{part:d.id});}}
  /* the lobby's flight into the first drum is placed first: the necks keep clear of it */
  {const LB=P.foot.lobby,c=[LB.at[0],LB.at[2]],st=LB.stair,rm=(st.r0+st.r1)/2,yAt=f=>LB.y0+.25+(LB.y1-LB.y0)*f;
   const aT=st.turns*TAU,top=[c[0]+rm*Math.cos(aT),c[1]+rm*Math.sin(aT),yAt(1)],d0=drumsUp[0],D0=drumInfo[d0.id];
   if(D0){const dir=[c[0]-top[0],c[1]-top[1]],l=hyp(dir[0],dir[1]),e=[top[0]+dir[0]/l*(l-8),top[1]+dir[1]/l*(l-8)];
    stair('sb.room.lobby.up',[top[0],top[1],top[2]],[e[0],e[1],D0.storeys[0]],2.4,{part:'sb.lobby',locked:locked('sb.lobby.stair',d0.id)});}}
  /* the necks: from a drum's top storey up to the next drum's bottom one; at a terrace, by a plate in the neck and a door to its deck */
  const terAt=(y0,y1)=>{for(const n of [1,2,3,4,5,6]){const p=PT['sb.T'+n];if(!p)continue;if(p.y+1.6>y0&&p.y+1.6<y1)return {n,p,c:[p.shape[1],p.shape[2]],r:p.shape[3],y:p.y+1.6};}return null;};
  const hatch=(s,name)=>{if(!s)return;const e=s.b;R.locked.push(door(s.id+'.hatch',[e[0],e[1]],e[2]-.1,{w:2,locked:true,step:false,name}));};
  for(let i=0;i+1<drumsUp.length;i++){const lo=drumsUp[i],up=drumsUp[i+1],A=drumInfo[lo.id],B=drumInfo[up.id],yA=A.storeys[A.storeys.length-1],yB=B.storeys[0];
   if(yB-yA>40)continue;   /* not neighbours (a gone drum between) */
   const T=terAt(A.y1-.5,B.y0+.5),nr=lo.nr||SP.neck,ax=t=>[A.c[0]+(B.c[0]-A.c[0])*t,A.c[1]+(B.c[1]-A.c[1])*t];
   const cA=[A.c[0],A.c[1],coreR(lo)],cB=[B.c[0],B.c[1],coreR(up)];
   if(T){const lockUp=locked('sb.T'+T.n,up.id),lockDn=locked(lo.id,'sb.T'+T.n),f=(T.y-A.y1)/Math.max(1,(B.y0-A.y1)),nc=ax(Math.max(0,Math.min(1,f)));
    const cN=[nc[0],nc[1],nr-.6],cT=[T.c[0],T.c[1],SP.r+1];
    /* the plate in the neck (T1's is the walk's, round L1's car) and the door from the neck to the deck */
    if(T.n!==1){floor('sb.room.T'+T.n+'.plate',{disc:[T.c[0],T.c[1],SP.r+1],y:T.y});
     const a=TAU*AI_h('neck'+T.n),dp=[nc[0]+nr*Math.cos(a),nc[1]+nr*Math.sin(a)];
     const dn=door('sb.room.door.neck.T'+T.n,dp,T.y,{name:'the neck\'s door to T'+T.n,ring:{c:nc,r:nr,a}});
     wallLine('sb.room.neck.T'+T.n,circle(nc,nr,64),T.y,T.y+2.9,[dn]);R.parts['sb.T'+T.n+'.neckdoor']={a,nc};}
    const f1=placeFlight(lo.id+'.neck.up',yA,T.y,[cA,cN,cT],{part:lo.id,locked:lockDn}),f2=placeFlight(up.id+'.neck.dn',T.y,yB,[cN,cT,cB],{part:up.id,locked:lockUp});
    if(lockDn)hatch(f1,'barred: '+lo.id+' to T'+T.n);if(lockUp)hatch(f2,'barred: T'+T.n+' to '+up.id);}
   else{const lk=locked(lo.id,up.id),s=placeFlight(lo.id+'.neck',yA,yB,[cA,cB],{part:lo.id,locked:lk});if(lk)hatch(s,'barred: '+lo.id+' to '+up.id);}}
  function AI_h(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return ((h>>>0)%100000)/100000;}

  // ---- the terraces' ring buildings ---------------------------------------------------------------------------------------------
  for(const n of [1,2,3,4,5,6]){const p=PT['sb.T'+n];if(!p||p.state==='gone')continue;const c=[p.shape[1],p.shape[2]],r=p.shape[3],y=p.y+1.6,ro=r-12-.3,ri=SP.r+1;
   /* the passage: where the way out runs (T1: the walk's ring door; another: its neck door's angle) */
   const rd=n===1?S.doors.find(d=>d.id==='sb.door.T1ring'):null,pa=n===1&&rd?rd.ring.a:(R.parts['sb.T'+n+'.neckdoor']||{}).a;
   const skip=pa==null?null:th=>Math.abs(Math.atan2(Math.sin(th-pa),Math.cos(th-pa)))<.12;
   /* the pavilion ring stands 6.4 m, or up to the drum over it where that drum's bottom storey reaches out over the ring */
   const over=drumsUp.filter(d=>d.at[1]>y&&hyp(d.at[0]-c[0],d.at[2]-c[1])+d.r>ri),RH=Math.min(6.4,over.length?Math.min(...over.map(d=>d.at[1]))-y-.2:6.4);
   const kinds=kindsFor(p),plate=AI?AI.ringPlate({id:'sb.T'+n+'.ring',level:0,y,h:RH,cx:c[0],cz:c[1],rOut:()=>ro,depth:ro-ri-2.4,cw:2.4,roomW:8,door:DOORW,core:null,kinds:i=>kinds(i),skip}):null;
   if(!plate)continue;addPlate('sb.T'+n,p,plate,0,y,RH);R.parts['sb.T'+n]={kind:'terrace',storeys:1};plateFloors(plate,c,null);
   /* the ring's outer wall: a door from each room to the promenade, and the passage (T1's wall and door are the walk's) */
   const outs=plate.rooms.filter(q=>q.th!=null).map(q=>({at:[c[0]+(ro+.3)*Math.cos(q.th),c[1]+(ro+.3)*Math.sin(q.th)],w:DOORW,y}));
   if(n!==1){if(pa!=null)outs.push({at:[c[0]+(ro+.3)*Math.cos(pa),c[1]+(ro+.3)*Math.sin(pa)],w:3,y});
    wallLine('sb.T'+n+'.outer',circle(c,ro+.3,128),y,y+RH-.3,outs);for(const o of outs)door('sb.room.door.T'+n+'.'+R.doors.length,o.at,y,{w:o.w});}
   else for(const o of outs)door('sb.room.door.T1.'+R.doors.length,o.at,y,{w:o.w,open:true});}

  // ---- the lobby: the galleries, the great stair and its bridges ------------------------------------------------------------------
  {const LB=P.foot.lobby,c=[LB.at[0],LB.at[2]],st=LB.stair,NT=Math.round(st.turns*36),rm=(st.r0+st.r1)/2,yAt=f=>LB.y0+.25+(LB.y1-LB.y0)*f;
   for(const g of LB.galleries)sectors('sb.room.lobby.'+g.id.split('.').pop(),c,g.r0,g.r1,g.y,48);
   for(let i=0;i<NT;i++){const f0=i/NT,f1=(i+1)/NT,a0=f0*st.turns*TAU,a1=f1*st.turns*TAU;
    stair('sb.room.lobby.stair.'+i,[c[0]+rm*Math.cos(a0),c[1]+rm*Math.sin(a0),yAt(f0)],[c[0]+rm*Math.cos(a1),c[1]+rm*Math.sin(a1),yAt(f1)],st.r1-st.r0-.4,{part:'sb.lobby'});}
   for(const g of LB.galleries){const f=(g.y-LB.y0-.25)/(LB.y1-LB.y0),a=f*st.turns*TAU,p0=[c[0]+st.r1*Math.cos(a),c[1]+st.r1*Math.sin(a)],p1=[c[0]+(g.r0+1)*Math.cos(a),c[1]+(g.r0+1)*Math.sin(a)];
    stair('sb.room.lobby.bridge.'+g.id.split('.').pop(),[p0[0],p0[1],g.y],[p1[0],p1[1],g.y],2.4,{part:'sb.lobby'});
    /* the gallery's parapet (inner edge), open at the bridge */
    wallLine('sb.room.lobby.parapet',circle(c,g.r0,96),g.y,g.y+1.1,[{at:[c[0]+g.r0*Math.cos(a),c[1]+g.r0*Math.sin(a)],w:2.8,y:g.y}]);}}

  // ---- the boxes: a stair hall across one end, bars of rooms, walls round, doors where the layout's ways meet ------------------
  const isBox=p=>p.shape[0]==='box'&&(p.st|0)>0&&p.h>0&&p.state!=='gone'&&p.zone!=='town'&&p.in!=='sb.plaza'&&
   ['office','barracks','guild','works','store','homes','gallery','shed','gate','burned'].indexOf(p.kind)>=0;
  const boxes=L.parts.filter(isBox).sort((a,b)=>a.y-b.y||(a.id<b.id?-1:1)),BX={};
  const ovl=(a,b)=>Math.max(0,Math.min(a[1],b[1])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[3],b[3])-Math.max(a[2],b[2]));
  /* a box's frame: its long axis, the hall's end (0 the low end, 1 the high), and P2(along, across) -> [x, z] */
  const frameOf=(s,along,e)=>{const A0=along==='x'?s[1]:s[3],A1=along==='x'?s[2]:s[4],C0=along==='x'?s[3]:s[1],C1=along==='x'?s[4]:s[2];
   const P2=(a,c)=>along==='x'?[a,c]:[c,a],wallA=e?A1:A0,sg=e?-1:1,ha=[Math.min(wallA,wallA+sg*HD),Math.max(wallA,wallA+sg*HD)];
   const hall=along==='x'?[ha[0],ha[1],C0,C1]:[C0,C1,ha[0],ha[1]];return {along,e,A0,A1,C0,C1,P2,wallA,sg,hall};};
  /* the box under this one that a stair way joins (a box on another climbs from it) */
  const under=p=>boxes.find(q=>q!==p&&Math.abs(p.y-(q.y+q.h))<.6&&ovl(p.shape.slice(1),q.shape.slice(1))>1&&(()=>{const w=wayOf(p.id,q.id);return w&&w.kind==='stair';})());
  for(const p of boxes){const s=p.shape,st=p.st|0,H=p.h/st,lx=s[2]-s[1],lz=s[4]-s[3],along=lx>=lz?'x':'z',q=under(p);
   let e=0;if(q&&BX[q.id]){const h0=frameOf(s,along,0).hall,h1=frameOf(s,along,1).hall;e=ovl(h1,BX[q.id].fr.hall)>ovl(h0,BX[q.id].fr.hall)?1:0;}
   BX[p.id]={p,st,H,fr:frameOf(s,along,e),under:q};R.parts[p.id]={kind:'box',storeys:st};}
  /* the doors of the ways: one per way; where two boxes share a wall it is in the middle of the shared run, else on the edge that
     faces the other part, kept 2.5 m off the corners; its storey the one nearest the other part's level; an apron (or the
     bridge) from it to the other part where nothing joins them */
  const levelOf=(id,yHint)=>{const p=PT[id];if(!p)return 0;if(/^sb\.T\d$/.test(id))return p.y+1.6;const b=BX[id];
   if(b){const k=Math.max(0,Math.min(b.st-1,Math.round((yHint-p.y)/b.H)));return p.y+k*b.H;}return p.y;};
  const ctr=p=>p.shape[0]==='box'?[(p.shape[1]+p.shape[2])/2,(p.shape[3]+p.shape[4])/2]:[p.shape[1],p.shape[2]];
  const nearOn=(p,q)=>{const s=p.shape;if(s[0]==='box')return [Math.max(s[1],Math.min(s[2],q[0])),Math.max(s[3],Math.min(s[4],q[1]))];
   const c=[s[1],s[2]],r=s[0]==='ring'?s[4]:s[3],d=hyp(q[0]-c[0],q[1]-c[1]);return d<=r?q.slice():[c[0]+(q[0]-c[0])/d*r,c[1]+(q[1]-c[1])/d*r];};
  const facing=(s,q)=>{const c=[(s[1]+s[2])/2,(s[3]+s[4])/2],hx=(s[2]-s[1])/2,hz=(s[4]-s[3])/2,dx=q[0]-c[0],dz=q[1]-c[1],m=2.5;
   if(Math.abs(dx)/hx>=Math.abs(dz)/hz)return [dx>0?s[2]:s[1],Math.max(s[3]+m,Math.min(s[4]-m,q[1]))];return [Math.max(s[1]+m,Math.min(s[2]-m,q[0])),dz>0?s[4]:s[3]];};
  const shared=(s,t)=>{const zr=[Math.max(s[3],t[3]),Math.min(s[4],t[4])],xr=[Math.max(s[1],t[1]),Math.min(s[2],t[2])];
   for(const [x,ok] of [[s[2],Math.abs(s[2]-t[1])<.6],[s[1],Math.abs(s[1]-t[2])<.6]])if(ok&&zr[1]-zr[0]>4)return [x,(zr[0]+zr[1])/2];
   for(const [z,ok] of [[s[4],Math.abs(s[4]-t[3])<.6],[s[3],Math.abs(s[3]-t[4])<.6]])if(ok&&xr[1]-xr[0]>4)return [(xr[0]+xr[1])/2,z];return null;};
  const apron=(id,a,ya,b,yb,w)=>{if(hyp(b[0]-a[0],b[1]-a[1])<.3&&Math.abs(ya-yb)<.3)return;stair(id,[a[0],a[1],ya],[b[0],b[1],yb],w,{apron:true});};
  const boxDoors={};const addBD=(id,d)=>{(boxDoors[id]=boxDoors[id]||[]).push(d);};
  for(const w of L.ways){if(['door','road','bridge','ramp'].indexOf(w.kind)<0)continue;const ba=BX[w.a],bb=BX[w.b];if(!ba&&!bb)continue;
   const lk=w.open===false,nm=w.id.replace(/^way\./,'');
   if(ba&&bb){const at=shared(ba.p.shape,bb.p.shape);if(at){const y=levelOf(w.a,bb.p.y),d=door('sb.room.door.'+nm,at,y,{w:DOORW+.6,locked:lk,way:w.id});addBD(w.a,d);addBD(w.b,d);if(lk)R.locked.push(d);continue;}}
   for(const [me,ot,end] of [[w.a,w.b,0],[w.b,w.a,1]]){const b=BX[me];if(!b)continue;const o=PT[ot];
    const tgt=w.pts?w.pts[end?0:w.pts.length-1]:ot==='sb.tower.order'&&w.kind==='ramp'?[P.ramp.pts[0][0],P.ramp.pts[0][2]]:o?ctr(o):ctr(b.p);
    const at=facing(b.p.shape,tgt),oy=w.kind==='ramp'?P.ramp.pts[0][1]:o?levelOf(ot,b.p.y):b.p.y,y=levelOf(me,oy),d=door('sb.room.door.'+nm+'.'+me.slice(3),at,y,{w:DOORW+.6,locked:lk,way:w.id});
    addBD(me,d);if(lk)R.locked.push(d);
    /* the apron: out from the door, square to its wall, then to the other part (a bridge's own line, the ramp's foot) */
    const s=b.p.shape,out=at[0]<=s[1]+1e-6?[-1,0]:at[0]>=s[2]-1e-6?[1,0]:at[1]<=s[3]+1e-6?[0,-1]:[0,1],a1=[at[0]+out[0]*1.5,at[1]+out[1]*1.5];
    const to=w.pts||w.kind==='ramp'?tgt:o&&!BX[ot]?nearOn(o,a1):null;
    if(to&&(oy>3||y>3||w.kind==='bridge')){apron('sb.room.apron.'+nm+'.'+me.slice(3)+'.0',at,y,a1,y,DOORW+.6);apron('sb.room.apron.'+nm+'.'+me.slice(3),a1,y,to,oy,w.kind==='bridge'?3:DOORW+1);}}}
  for(const p of boxes){const b=BX[p.id],s=p.shape,st=b.st,H=b.H,fr=b.fr,kinds=kindsFor(p),W=fr.C1-fr.C0,nb=Math.max(1,Math.ceil((W-.2)/BARD)),bw=W/nb;
   const b0=fr.e?fr.A0:fr.A0+HD,b1=fr.e?fr.A1-HD:fr.A1;
   if(!boxDoors[p.id]&&p.kind!=='burned')addBD(p.id,door('sb.room.door.'+p.id.slice(3)+'.street',[(s[1]+s[2])/2,s[4]],p.y,{w:DOORW+.6}));
   for(let k=0;k<st;k++){const y=p.y+k*H,sid=p.id+'.L'+k;
    /* the hall's floor runs to the walls and 0.3 m under the bars' end rooms: a gap between two floors stops a walker */
    {const hA=fr.P2(fr.wallA,fr.C0),hB=fr.P2(fr.wallA+fr.sg*(HD+.3),fr.C1);floor(sid+'.hall',{rect:[Math.min(hA[0],hB[0]),Math.max(hA[0],hB[0]),Math.min(hA[1],hB[1]),Math.max(hA[1],hB[1])],y,room:sid+'.hall'});}R.rooms.push({id:sid+'.hall',kind:'hall',part:p.id,state:p.state,by:p.by,y,h:H,level:k});
    for(let j=0;j<nb;j++){const c0=fr.C0+j*bw,c1=c0+bw,cm=(c0+c1)/2,bid=sid+'.b'+j;
     const plate=AI&&b1-b0>=14&&bw>=7?AI.barPlate({id:bid,level:k,y,h:H,path:u=>fr.P2(b0+(b1-b0)*u,cm),depth:bw-.4,side:'both',cw:2.2,roomW:6,door:DOORW,kinds:i=>kinds(i+j*7),ends:['core','core']}):null;
     if(plate){addPlate(p.id,p,plate,k,y,H);plateFloors(plate,null,null);}
     else{const a=fr.P2(b0,c0),c=fr.P2(b1,c1);floor(bid+'.floor',{rect:[Math.min(a[0],c[0]),Math.max(a[0],c[0]),Math.min(a[1],c[1]),Math.max(a[1],c[1])],y,room:bid});R.rooms.push({id:bid,kind:kinds(j),part:p.id,state:p.state,by:p.by,y,h:H,level:k});}
     if(j>0)wallLine(sid+'.bar',[fr.P2(b0,c0),fr.P2(b1,c0)],y,y+H-.3,[]);}
    /* the switchback in the hall: storey k's flight across the box on the line 1.5 m in from the end wall, the next on the line
       beside it, back the other way */
    if(k+1<st){const L2=Math.min(12,W-3),aL=fr.wallA+fr.sg*(1.5+(k%2)*2),pA=fr.P2(aL,fr.C0+1.5),pB=fr.P2(aL,fr.C0+1.5+L2);
     stair(p.id+'.stair.'+k,k%2?[pB[0],pB[1],y]:[pA[0],pA[1],y],k%2?[pA[0],pA[1],y+H]:[pB[0],pB[1],y+H],1.4,{part:p.id});}}
   wallLine(p.id+'.outer',[[s[1],s[3]],[s[2],s[3]],[s[2],s[4]],[s[1],s[4]],[s[1],s[3]]],p.y,p.y+p.h,boxDoors[p.id]||[]);}
  /* the climb from a box to the one on it: from the lower box's top storey to the upper one's bottom, inside the lower one's hall
     6.5 m in from its end wall (clear of its switchback), its last 3.5 m inside the upper one's hall */
  for(const p of boxes){const b=BX[p.id],q=b.under;if(!q)continue;const lo=BX[q.id].fr,up=b.fr,yT=q.y+q.h-BX[q.id].H,run=Math.max(6,(p.y-yT)/SLOPE);
   const aL=lo.wallA+lo.sg*6.5;let pB,pT;
   if(lo.along===up.along){pB=lo.P2(aL,lo.C0+1.5);pT=lo.P2(aL,lo.C0+1.5+Math.min(run,lo.C1-lo.C0-3));}
   else{const top=up.wallA+up.sg*5,bot=top+up.sg*run;pT=lo.P2(aL,top);pB=lo.P2(aL,bot);}
   const inR=(r,x,z,m)=>x>=r[0]+m&&x<=r[1]-m&&z>=r[2]+m&&z<=r[3]-m,len=hyp(pT[0]-pB[0],pT[1]-pB[1]);let ok=len>=4;
   /* open in the upper box's bottom storey: its hall, and the end rooms beyond it (open to the hall) away from the bars' walls */
   const nbU=Math.max(1,Math.ceil((up.C1-up.C0-.2)/BARD)),bwU=(up.C1-up.C0)/nbU;
   const upOpen=(x,z)=>{const a=up.along==='x'?x:z,c=up.along==='x'?z:x,dep=(a-up.wallA)*up.sg;if(dep<.9||dep>HD+6-.9||c<up.C0+.9||c>up.C1-.9)return false;
    if(dep>HD){const j=Math.round((c-up.C0)/bwU);if(j>0&&j<nbU&&Math.abs(c-(up.C0+j*bwU))<.9)return false;}return true;};
   for(let i=0;i<=20&&ok;i++){const f=i/20,x=pB[0]+(pT[0]-pB[0])*f,z=pB[1]+(pT[1]-pB[1])*f;if(!inR(lo.hall,x,z,.9))ok=false;if((1-f)*len<3.5&&!upOpen(x,z))ok=false;}
   if(!ok)R.warn.push('the climb from '+q.id+' to '+p.id+' leaves the halls');
   const s=stair(q.id+'.up.'+p.id.slice(3),[pB[0],pB[1],yT],[pT[0],pT[1],p.y],1.4,{part:q.id,locked:locked(q.id,p.id)});if(s.locked)hatch(s,'barred: '+q.id+' to '+p.id);}

  // ---- the Order's tower: the wedge's storeys, the crown, the arc ramp, the stair down through the sealed storeys to the Nock -----
  {const p=PT['sb.tower.order'],lowP=PT['sb.tower.low'],nock=PT['sb.nock.c'];
   if(p&&p.state!=='gone'){const st=p.st|0,H=p.h/st,back=F.back,kinds=kindsFor(p);R.parts[p.id]={kind:'tower',storeys:st};
    const hwAt=(t,z)=>{const f=1-(z-back)/F.d(t);return f<=0?0:F.w(t)*Math.pow(f,.8);};
    const wedge=t=>{const o=[];for(let i=0;i<=12;i++)o.push(F.flank(t,-1,1-i/12));for(let i=0;i<=12;i++)o.push(F.flank(t,1,i/12));o.push(o[0]);return o;};
    const shaftW=[[-8,back],[8,back],[8,back+5.2],[-8,back+5.2],[-8,back]];
    for(let k=0;k<st;k++){const y=p.y+k*H,t=F.t(y+H/2),sid=p.id+'.L'+k,zh=back+HD;
     floor(sid+'.hall',{poly:[[-hwAt(t,back)+.4,back+.2,y],[hwAt(t,back)-.4,back+.2,y],[hwAt(t,zh)-.4,zh+.3,y],[-hwAt(t,zh)+.4,zh+.3,y]],y,room:sid+'.hall'});
     R.rooms.push({id:sid+'.hall',kind:'hall',part:p.id,state:p.state,by:p.by,y,h:H,level:k});
     /* bars across the wedge, each as long as the flank lets it be at its far edge; a wall at each bar's near edge with a door
        into its end rooms, and one across the last bar's far edge (the prow beyond is a void) */
     let z0=zh;for(let j=0;;j++){const z1=z0+BARD,hl=hwAt(t,z1)-.8;if(2*hl<14)break;const bid=sid+'.b'+j;
      const plate=AI?AI.barPlate({id:bid,level:k,y,h:H,path:u=>[-hl+2*hl*u,(z0+z1)/2],depth:BARD-.4,side:'both',cw:2.2,roomW:6,door:DOORW,kinds:i=>kinds(i+j*5),ends:['core','core']}):null;
      if(plate){addPlate(p.id,p,plate,k,y,H);plateFloors(plate,null,null);}
      const hz=hwAt(t,z0)-.2,dz=[-1,1].map(sg=>({at:[sg*(hl-3),z0],w:DOORW,y}));wallLine(sid+'.bar',[[-hz,z0],[hz,z0]],y,y+H-.3,dz);for(const d of dz)door(sid+'.b'+j+'.door.'+(d.at[0]<0?'w':'e'),d.at,y);
      const z2=z0+BARD;if(2*(hwAt(t,z2+BARD)-.8)<14){wallLine(sid+'.far',[[-hwAt(t,z2)+.2,z2],[hwAt(t,z2)-.2,z2]],y,y+H-.3,[]);break;}z0=z2;}
     wallLine(sid+'.flank',wedge(t),y,y+H,[]);
     if(k+1<st){const z=back+1.5+(k%2)*2;stair(p.id+'.stair.'+k,k%2?[6,z,y]:[-6,z,y],k%2?[-6,z,y+H]:[6,z,y+H],1.4,{part:p.id});}}
    /* the crown's deck: the fan the page draws (8aw1 sbCrown), its parapet open at the ramp's gate */
    const C=P.crown,w0=F.w(0),d0=F.d(0),kx=1+C.over/w0,kz=1+C.over/d0,lerp=(a,b,f)=>a+(b-a)*f;
    const out=f=>{let q;if(f<.4)q=F.flank(0,-1,f/.4);else if(f<.8)q=F.flank(0,1,1-(f-.4)/.4);else{const g=(f-.8)/.2;q=[lerp(w0,-w0,g),back];}return [q[0]*kx,back+(q[1]-back)*kz];};
    const ol=[];for(let i=0;i<60;i++)ol.push(out(i/60));floor('sb.room.crown',{poly:ol.map(q=>[q[0],q[1],C.y1]),y:C.y1,room:'sb.room.crown'});
    R.rooms.push({id:'sb.room.crown',kind:'deck',part:'sb.crown',state:'kept',by:'order',y:C.y1,h:3,level:0});R.parts['sb.crown']={kind:'deck',storeys:1};
    const RP=P.ramp.pts,re=RP[RP.length-1],gi=ol.reduce((bi,q,i)=>hyp(q[0]-re[0],q[1]-re[2])<hyp(ol[bi][0]-re[0],ol[bi][1]-re[2])?i:bi,0);
    let gate=null;{let best=1e9;for(let i=1;i<RP.length;i++)for(let j=0;j<60;j++){const a=ol[j],b=ol[(j+1)%60];for(let f=0;f<=1;f+=.1){const q=[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f],d=segD(q,[RP[i-1][0],RP[i-1][2]],[RP[i][0],RP[i][2]]);if(d<best){best=d;gate=q;}}}}
    const gd=door('sb.room.door.crown.gate',gate||ol[gi],C.y1,{w:P.ramp.w+1,open:true,name:'the crown\'s gate'});
    wallLine('sb.room.crown.parapet',ol.concat([ol[0]]),C.y1,C.y1+1.4,[gd]);
    for(let i=1;i<RP.length;i++)stair('sb.room.ramp.'+i,[RP[i-1][0],RP[i-1][2],RP[i-1][1]],[RP[i][0],RP[i][2],RP[i][1]],P.ramp.w-1,{part:'sb.ramp'});
    R.parts['sb.ramp']={kind:'ramp',storeys:0};
    /* down from the crown into the top storey's hall, 6.5 m in from the back wall (clear of the switchback) */
    {const yTop=p.y+(st-1)*H,run=(C.y1-yTop)/SLOPE,z=back+6.5;stair('sb.room.crown.stair',[-run/2,z,C.y1],[run/2,z,yTop],2,{part:'sb.crown'});}
    /* the Order's stair through the sealed storeys: the hall's switchback carried down in a walled shaft, a landing at each turn */
    if(lowP&&nock){const y0=nock.y,y1=p.y,n=Math.max(1,Math.round((y1-y0)/(lowP.h/lowP.st))),h=(y1-y0)/n,parity=n%2;
     for(let k=0;k<n;k++){const odd=(k+parity)%2,z=back+1.5+odd*2,ya=y0+k*h,yb=ya+h;stair('sb.room.order.shaft.'+k,odd?[6,z,ya]:[-6,z,ya],odd?[-6,z,yb]:[6,z,yb],1.4,{part:'sb.tower.low',shaft:true});
      if(k+1<n){const xe=odd?-6.6:6.6;floor('sb.room.order.landing.'+k,{rect:[xe-1.1,xe+1.1,back+.6,back+4.4],y:yb});}}
     /* the shaft's walls; its door at the foot opens on the sealed storeys' ground floor, whose flank has the Order's door to the deck */
     const sd=door('sb.room.door.order.shaft',[-4,back+5.2],y0,{name:'the Order\'s stair, at its foot'});
     wallLine('sb.room.order.shaft.wall',shaftW,y0,y1-.1,[sd]);
     const tl=F.t(y0+2),fd=F.flank(tl,1,.18),od=door('sb.room.door.order.nock',fd,y0,{w:2.4,name:'the Order\'s door on the Nock'});
     wallLine('sb.tower.low.flank',wedge(tl),y0,y0+6,[od]);R.parts['sb.tower.low']={kind:'shaft',storeys:0};}}
   /* the Nock's deck round the tower (the landing's side is the walk's, behind the wall the layout keeps shut) */
   if(nock){const s=nock.shape;floor('sb.room.nock.deck',{rect:[s[1]+1,s[2],s[3],s[4]],y:nock.y,room:'sb.room.nock.deck'});
    R.rooms.push({id:'sb.room.nock.deck',kind:'deck',part:'sb.nock.c',state:nock.state,by:nock.by,y:nock.y,h:3,level:0});R.parts['sb.nock.c']={kind:'deck',storeys:1};
    const nw=PT['sb.nock.wall'];if(nw)R.walls.push({id:'sb.nock.wall',box:[nw.shape[1],nw.shape[2],nw.shape[3],nw.shape[4],nw.y,nw.y+(nw.h||4)]});}}

  /* the stairwells: every floor a flight climbs to is cut open over the flight (core/walk's walker has no head, but a host that
     keeps head room, Recast's agent height in Godot, finds a flight's top under a ceiling and stops there) */
  R.floors=stairwells(R.floors.map(f=>{if(/^door:/.test(f.id))return f;const pts=f.rect?[[f.rect[0],f.rect[2]],[f.rect[1],f.rect[2]],[f.rect[1],f.rect[3]],[f.rect[0],f.rect[3]]]:
   f.disc?Array.from({length:40},(_,i)=>[f.disc[0]+f.disc[2]*Math.cos(i/40*TAU),f.disc[1]+f.disc[2]*Math.sin(i/40*TAU)]):f.poly&&f.poly.every(q=>Math.abs(q[2]-f.y)<1e-6)?f.poly.map(q=>[q[0],q[1]]):null;
   return pts?Object.assign({},f,{pts2:pts}):f;}),R.stairs).map(f=>{if(!f.pts2)return f;const o=Object.assign({},f);delete o.pts2;delete o.rect;delete o.disc;o.poly=f.pts2.map(q=>[q[0],q[1],f.y]);return o;});
  R.solids=[];
  return R;}
 /* floors (each {id, y, pts2: [[x, z], ...]}; others pass through) less the footprints of the stairs that climb to them: a
    floor at a flight's top (or between its ends) loses the flight's plan, w + 0.3 wide, from its foot to its head. A cut floor
    is split in pieces, the first keeping the id, the rest id~1, id~2 */
 function stairwells(floors,stairs){
  const area=P=>{let a=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];a+=p[0]*q[1]-q[0]*p[1];}return a/2;};
  const clip=(P,a,b,keepIn)=>{const out=[],side=p=>((b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]))*(keepIn?1:-1);
   for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length],sp=side(p),sq=side(q);if(sp>=0)out.push(p);if((sp>=0)!==(sq>=0)){const t=sp/(sp-sq);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}}return out;};
  const minus=(P,Q)=>{const pieces=[];let rest=P;for(let i=0;i<Q.length;i++){const a=Q[i],b=Q[(i+1)%Q.length],o=clip(rest,a,b,false);if(o.length>=3&&Math.abs(area(o))>.02)pieces.push(o);rest=clip(rest,a,b,true);if(rest.length<3)return pieces;}return pieces;};   /* what is left in rest is the hole */
  const cuts=stairs.map(s=>{const dx=s.b[0]-s.a[0],dz=s.b[1]-s.a[1],l=hyp(dx,dz);if(l<.1||Math.abs(s.b[2]-s.a[2])<.5)return null;const ux=dx/l,uz=dz/l,h=s.w/2+.15;
   const Q=[[s.a[0]+uz*h,s.a[1]-ux*h],[s.b[0]+uz*h,s.b[1]-ux*h],[s.b[0]-uz*h,s.b[1]+ux*h],[s.a[0]-uz*h,s.a[1]+ux*h]];if(area(Q)<0)Q.reverse();
   return {Q,lo:Math.min(s.a[2],s.b[2]),hi:Math.max(s.a[2],s.b[2]),bb:[Math.min(...Q.map(q=>q[0])),Math.max(...Q.map(q=>q[0])),Math.min(...Q.map(q=>q[1])),Math.max(...Q.map(q=>q[1]))]};}).filter(Boolean);
  const out=[];
  for(const f of floors){if(!f.pts2){out.push(f);continue;}let parts=[f.pts2];
   for(const c of cuts){if(!(f.y>c.lo+.5&&f.y<=c.hi+.05))continue;const nx=[];
    for(const P of parts){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const q of P){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);z0=Math.min(z0,q[1]);z1=Math.max(z1,q[1]);}
     if(x1<c.bb[0]||x0>c.bb[1]||z1<c.bb[2]||z0>c.bb[3]){nx.push(P);continue;}const m=minus(P,c.Q);if(m===null)nx.push(P);else for(const q of m)nx.push(q);}parts=nx;}
   parts.forEach((P,i)=>out.push(Object.assign({},f,{id:i?f.id+'~'+i:f.id,pts2:P})));}
  return out;}

 // ---- the registry --------------------------------------------------------------------------------------------------------------
 /* the town's buildings as solids: each lot's footprint (turned by ry) in slices a metre thick along its longer side, each slice's
    bounds a block */
 function solids(town){const out=[];if(!town)return out;for(const L of town.lots){const c=Math.cos(L.ry||0),s=Math.sin(L.ry||0),w=L.w/2,d=L.d/2,h=L.h||6;
   const long=L.w>=L.d,n=Math.max(1,Math.ceil(long?L.w:L.d));
   for(let k=0;k<n;k++){const u0=-1+2*k/n,u1=-1+2*(k+1)/n,pts=long?[[u0*w,-d],[u1*w,-d],[u1*w,d],[u0*w,d]]:[[-w,u0*d],[w,u0*d],[w,u1*d],[-w,u1*d]];
    let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const [a,b] of pts){const x=L.x+a*c+b*s,z=L.z-a*s+b*c;x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z);}
    out.push({id:L.id,box:[x0,x1,z0,z1,L.y,L.y+h]});}}return out;}
 function register(W,R,o){o=o||{};const RG={doors:{},solids:0};
  for(const f of R.floors){if(f.rect)W.floor({rect:f.rect,y:f.y,name:f.id,tag:'sb.room'});else if(f.disc){const [cx,cz,r]=f.disc,pts=[];for(let i=0;i<40;i++){const a=i/40*TAU;pts.push([cx+r*Math.cos(a),cz+r*Math.sin(a),f.y]);}W.poly({pts,name:f.id,tag:'sb.room'});}
   else if(f.poly)W.poly({pts:f.poly,name:f.id,tag:'sb.room'});}
  for(const s of R.stairs)W.strip({a:[s.a[0],s.a[1],s.a[2]],b:[s.b[0],s.b[1],s.b[2]],w:s.w,name:s.id,tag:'sb.stair'});
  for(const w of R.walls)W.block(w.box,'sb.room.wall');
  for(const d of R.doors){if(d.open)continue;const b=[d.at[0]-d.w/2,d.at[0]+d.w/2,d.at[1]-d.w/2,d.at[1]+d.w/2,d.y,d.y+2.6];RG.doors[d.id]=W.block(b,d.locked?'sb.room.locked':'sb.room.door');}
  for(const b of solids(o.town)){W.block(b.box,'sb.town.solid');RG.solids++;}
  return RG;}

 // ---- the audit: a flood per window (a storey, the lobby, a deck), chained ------------------------------------------------------
 /* W is a KWALK with the walk's records and these (doors open but the locked ones). Each window gets its own small KWALK of the
    records that meet it (a flood in the whole arcology at once spends minutes on the storeys stacked over each sample); a window
    is flooded from every seed in it; a doorstep or a stair reached in one window seeds the windows its far side lies in, and a
    window is flooded again when it gets new seeds. Seeds start at o.starts (the town, the lifts' stops the walk proves). Returns
    {reached: Set of floor names, windows, nodes, ms}. */
 function audit(W,R,o){o=o||{};const t0=Date.now(),K=W.create?W:KWALK,cell=o.cell||.6,step=o.step==null?.7:o.step;
  const FL=W.floors,BL=W.blocks.filter(b=>!b.off),wins=[];
  const fb=f=>f.kind==='rect'?[f.rect[0],f.rect[1],f.rect[2],f.rect[3],f.y,f.y]:f.kind==='poly'?[f.bbox[0],f.bbox[1],f.bbox[2],f.bbox[3],Math.min(...f.pts.map(p=>p[2])),Math.max(...f.pts.map(p=>p[2]))]:
   [Math.min(f.a[0],f.b[0])-f.w/2,Math.max(f.a[0],f.b[0])+f.w/2,Math.min(f.a[1],f.b[1])-f.w/2,Math.max(f.a[1],f.b[1])+f.w/2,Math.min(f.a[2],f.b[2]),Math.max(f.a[2],f.b[2])];
  const FB=FL.map(fb);
  /* the windows: the floors clustered by name (a storey: everything up to its ".L<k>"; else the name's first three parts) and by
     nearness (bounds within 2 m, heights within 3 m), each cluster's bounds grown by 4 m; doorsteps belong to the windows round them */
  const grow=(b,m)=>[b[0]-m,b[1]+m,b[2]-m,b[3]+m];
  const keyOf=n=>{const m=/^(.*?\.L\d+)(\.|$)/.exec(n);return m?m[1]:n.split('.').slice(0,3).join('.');};
  const groups={};for(let i=0;i<FL.length;i++){const n=FL[i].name||'';if(/^door:/.test(n))continue;(groups[keyOf(n)]=groups[keyOf(n)]||[]).push(i);}
  for(const g in groups){const ix=groups[g],par=ix.map((_,j)=>j),fnd=j=>{while(par[j]!==j)j=par[j]=par[par[j]];return j;};
   for(let a=0;a<ix.length;a++)for(let b=a+1;b<ix.length;b++){const A=FB[ix[a]],B=FB[ix[b]];
    if(A[0]-2<=B[1]&&B[0]-2<=A[1]&&A[2]-2<=B[3]&&B[2]-2<=A[3]&&A[4]-3<=B[5]&&B[4]-3<=A[5])par[fnd(a)]=fnd(b);}
   const cl={};for(let j=0;j<ix.length;j++){const r=fnd(j),b=FB[ix[j]],e=cl[r]||(cl[r]={id:g+'#'+r,box:[b[0],b[1],b[2],b[3]],y0:b[4]-1,y1:b[5]+2.6});
    e.box=[Math.min(e.box[0],b[0]),Math.max(e.box[1],b[1]),Math.min(e.box[2],b[2]),Math.max(e.box[3],b[3])];e.y0=Math.min(e.y0,b[4]-1);e.y1=Math.max(e.y1,b[5]+2.6);}
   for(const r in cl){cl[r].box=grow(cl[r].box,4);wins.push(cl[r]);}}
  /* a stair that climbs out of its window (more than a storey) gets one of its own, its bounds and height and 2 m round: it is
     flooded from the end a window stood on, and seeds the far one when it reaches the floor there */
  for(let i=0;i<FL.length;i++){const f=FL[i];if(f.kind!=='strip')continue;const b=FB[i];if(b[5]-b[4]<1.5)continue;wins.push({id:'stair:'+f.name,box:grow(b,2),y0:b[4]-1,y1:b[5]+2.6});}
  const kw=w=>{if(w.K)return w.K;const k=K.create();const m=(b)=>b[1]>=w.box[0]&&b[0]<=w.box[1]&&b[3]>=w.box[2]&&b[2]<=w.box[3];
   for(let i=0;i<FL.length;i++){const b=FB[i],f=FL[i];if(!m(b)||b[5]<w.y0-1||b[4]>w.y1+1)continue;
    const r=f.kind==='rect'?k.floor({rect:f.rect,y:f.y,name:f.name}):f.kind==='poly'?k.poly({pts:f.pts,name:f.name}):k.strip({a:f.a,b:f.b,w:f.w,name:f.name});r.src=f;}
   for(const B of BL){const b=B.box;if(!m(b)||b[5]<w.y0-1||b[4]>w.y1+2)continue;k.block(b);}w.K=k;return k;};
  const inW=(w,p)=>p[0]>=w.box[0]&&p[0]<=w.box[1]&&p[2]>=w.box[2]&&p[2]<=w.box[3]&&p[1]>=w.y0-.5&&p[1]<=w.y1+.5;
  const reached=new Set(),seeded=new Set(),Q=[];let nodes=0,floods=0;
  const seed=p=>{const key=p.map(v=>v.toFixed(1)).join(',');if(seeded.has(key))return;seeded.add(key);for(const w of wins)if(inW(w,p)){(w.seeds=w.seeds||[]).push(p);if(!w.queued){w.queued=true;Q.push(w);}}};
  for(const p of o.starts||[])seed(p);
  while(Q.length){const w=Q.shift();w.queued=false;const k=kw(w),had=w.got||(w.got=new Set());
   /* a seed on a floor this window's earlier floods stood on adds nothing: leave it out (else each new seed floods it all again) */
   const sd=(w.seeds||[]).filter(p=>!k.floorsAt(p[0],p[2]).some(q=>Math.abs(q[0]-p[1])<=step&&had.has(q[1])));w.seeds=[];if(!sd.length)continue;
   const RE=k.reach(sd,{cell,step,box:w.box,ground:o.ground,limit:o.limit||2e6});nodes+=RE.nodes;floods++;
   const got=new Set(RE.reached);for(const f of RE.reached)had.add(f);
   for(const f of RE.reached){const src=f.src;if(!src)continue;const nm=src.name;
    /* a stair's end seeds the windows it reaches into only when the flood stood on what it lands on there (a flight blocked half
       way does not carry on) */
    if(src.kind==='strip'){const L=hyp(src.b[0]-src.a[0],src.b[1]-src.a[1])||1,ux=(src.b[0]-src.a[0])/L,uz=(src.b[1]-src.a[1])/L;
     for(const [e,sg] of [[src.a,-1],[src.b,1]]){const on=[0,.3].flatMap(d=>k.floorsAt(e[0]+sg*ux*d,e[1]+sg*uz*d)).filter(q=>q[1]!==f&&Math.abs(q[0]-e[2])<=step&&got.has(q[1]));   /* at its end, or just past it (a stairwell's edge) */
      if(on.length)seed([e[0],e[2],e[1]]);}}
    if(reached.has(nm))continue;reached.add(nm);
    if(/^door:/.test(nm)){const r=src.rect;seed([(r[0]+r[1])/2,src.y,(r[2]+r[3])/2]);}}}
  return {reached,windows:wins.length,floods,nodes,ms:Date.now()-t0};}
 return {plan,register,audit,solids,stairwells};})();
