// ================================================================= STRONGBOW TODAY — the walk up: floors, walls, doors, lifts, a route
// [G data] The owner, 2026-11-12: "do a proper walk/elevator test, such that one can walk in, climb stairs and go thru doors
// starting from the bottom, to reach the top. add doors and stairs, and move the elevators as necessary". The elevator's way
// up, from the town at the foot to the caravan yard on the lip, as walkable records on core/walk (KWALK), and a walker that
// goes up it:
//   SB_WALK.plan(layout, plan) -> {floors, walls, doors, lifts, gangways, treads, holes, route}   (plain records, no THREE)
//   SB_WALK.register(W, S)     writes S into a KWALK registry: floors, walls and shut doors as blocks, a floor per lift car
//   SB_WALK.run(W, S, o)       walks S.route on W: {ok, legs, path, opened, rode, end}; o.shut: door ids never opened, o.stuck:
//                              lift ids that do not move, o.skip: gangway ids not registered (the negatives)
// THE WALKER is core/host's (core/host/90-host-camera.js, C.stand): it steps up at most STEP (0.7 m) and down at most DROP
// (1.4 m), keeps to a floor's edge rather than fall, is a body of radius R (0.35 m) and height H (1.7 m) pushed out of every
// block. A door opens when the walker comes within 2.2 m of it (core/walk's setBlock: a shut door is a block).
// THE LIFTS are the layout's (src/30-sb-layout.js places their frames): a car is a floor of half width SB_CAR that rises from
// stop to stop, inside a shaft of four walls with a gate at each stop on the side facing that stop's landing; where the car
// stops short of its landing a girder gangway bridges the gap.
// THE ROUTE: up the plaza's steps, through the lobby's door and down its treads, through the core's door into L1; up the core
// to T1 (a landing plate in the neck), through the neck's door and the ring building's, across T1's garden to L2; up past T2 to
// T3 and its gangway, round T3's promenade to the girder bridge, over it to the first wall landing; the wall lifts W1 to W5
// (W2 through the Nock's west wing to its transfer landing, W3 from there by an apron); from W5's gangway onto the plateau,
// through the Sultanate's post (a door in, a door out) to the caravan yard.
var SB_WALK=(function(){
 const STEP=.7,DROP=1.4,R=.35,H=1.7,DECK=1.6,GATE=1.3,DOORH=2.6,WALLT=.4;
 const v=(a,b)=>[b[0]-a[0],b[1]-a[1]],len=a=>Math.hypot(a[0],a[1]),nrm=a=>{const l=len(a)||1;return[a[0]/l,a[1]/l];};
 /* where a ray from p along d first meets a circle (c, r) going outward from inside: t >= 0 */
 const rayCircle=(p,d,c,r)=>{const f=[p[0]-c[0],p[1]-c[1]],b=f[0]*d[0]+f[1]*d[1],cc=f[0]*f[0]+f[1]*f[1]-r*r,disc=b*b-cc;if(disc<0)return null;
  const s=Math.sqrt(disc),t1=-b-s,t2=-b+s;return t1>=0?t1:t2>=0?t2:null;};

 function plan(L,P){
  const F=P.frame,PT={};for(const p of L.parts)PT[p.id]=p;const CAR=typeof SB_CAR==='undefined'?3:SB_CAR;
  const S={floors:[],walls:[],doors:[],lifts:[],gangways:[],treads:[],holes:[],route:[],car:CAR};
  const floor=(id,o)=>{o.id=id;S.floors.push(o);return o;};
  const wall=(id,b)=>{S.walls.push({id,box:b});};
  const door=(id,at,ax,y,o)=>{const w=(o&&o.w)||2*GATE,box=ax==='x'?[at[0]-w/2,at[0]+w/2,at[1]-WALLT/2,at[1]+WALLT/2,y,y+DOORH]:[at[0]-WALLT/2,at[0]+WALLT/2,at[1]-w/2,at[1]+w/2,y,y+DOORH];
   const d={id,at,ax,y,w,box,name:(o&&o.name)||id};S.doors.push(d);return d;};
  /* a ring wall of short straight pieces round c at r (thickness WALLT), y0..y1, open where a door stands */
  const ring=(id,c,r,y0,y1,gaps,a0,a1)=>{const n=Math.max(12,Math.ceil(2*Math.PI*r/1.6));a0=a0==null?0:a0;a1=a1==null?Math.PI*2:a1;
   for(let i=0;i<n;i++){const a=a0+(a1-a0)*(i+.5)/n,da=(a1-a0)/n/2;if(gaps.some(g=>Math.abs(Math.atan2(Math.sin(a-g.a),Math.cos(a-g.a)))<g.ha+da*.5))continue;
    const p=[c[0]+r*Math.cos(a-da),c[1]+r*Math.sin(a-da)],q=[c[0]+r*Math.cos(a+da),c[1]+r*Math.sin(a+da)];
    wall(id+'.'+i,[Math.min(p[0],q[0])-WALLT/2,Math.max(p[0],q[0])+WALLT/2,Math.min(p[1],q[1])-WALLT/2,Math.max(p[1],q[1])+WALLT/2,y0,y1]);}};
  /* a door in a ring wall where the segment a->b crosses the circle (c, r) */
  const ringDoor=(id,c,r,a,b,y,name)=>{const d=nrm(v(a,b)),t=rayCircle(a,d,c,r),p=[a[0]+d[0]*t,a[1]+d[1]*t],ang=Math.atan2(p[1]-c[1],p[0]-c[0]);
   const ax=Math.abs(Math.sin(ang))>Math.abs(Math.cos(ang))?'x':'z';const D=door(id,p,ax,y,{name});D.ring={c,r,a:ang,ha:(GATE+.2)/r};return D;};

  // ---- the foot: the plaza and its steps, the lobby, its door and treads, the core and its door --------------------------------
  const FT=P.foot,Z=FT.plaza,LB=FT.lobby,c0=[LB.at[0],LB.at[2]],y0=F.FL,fl=LB.y0+.25;
  floor('sb.walk.plaza',{rect:[Z.x0,Z.x1,Z.z0,Z.z1],y:Z.y});wall('sb.plaza.body',[Z.x0,Z.x1,Z.z0,Z.z1,y0-1,y0+Z.y-.05]);   /* the plaza is a platform: its body is solid */
  for(let k=0;k<3;k++)floor('sb.walk.plaza.step.'+k,{rect:[-(Z.x1-Z.x0-40)/2,(Z.x1-Z.x0-40)/2,Z.z1+1.6*(2-k),Z.z1+1.6*(3-k)],y:y0+Z.y*(k+1)/3});
  floor('sb.walk.lobby',{disc:[c0[0],c0[1],LB.r+.5],y:fl});
  /* the lobby's door: in the middle of the glass bay facing the plaza (between two mullions: targets/strongbow 8aw3 opens that bay) */
  const aD=(Math.floor(LB.ribs/4)+.5)/LB.ribs*Math.PI*2,dx=c0[0]+(LB.r+.6)*Math.cos(aD),dz=c0[1]+(LB.r+.6)*Math.sin(aD);
  const ld=door('sb.door.lobby',[dx,dz],'x',fl,{name:'the lobby\'s door on the plaza',w:3.2});S.lobbyDoor={a:aD,cell:Math.floor(LB.ribs/4),r:LB.r,w:3.2};
  /* the treads inside the door, down from the plaza (1.5) to the lobby's floor (0.25) */
  [[1.05,LB.r-1.2,LB.r+.6],[.65,LB.r-2.4,LB.r-1.2]].forEach(([y,r0,r1],k)=>{const t=floor('sb.walk.lobby.tread.'+k,{rect:[dx-2,dx+2,c0[1]+r0*Math.sin(aD),c0[1]+r1*Math.sin(aD)+.6],y:y0+y});S.treads.push(t);});
  ring('sb.wall.lobby',c0,LB.r+.6,fl,fl+8,[{a:aD,ha:1.8/LB.r}],Math.PI*.12,Math.PI*.88);
  const cd=door('sb.door.core',[c0[0],c0[1]+LB.core],'x',fl,{name:'the core\'s door'});
  ring('sb.wall.core',c0,LB.core,fl,fl+8,[{a:Math.PI/2,ha:GATE/LB.core+.02}]);

  // ---- the terraces: their decks (DECK over the node), T1's landing plate in the neck, its walls --------------------------------
  const ter=n=>{const id='sb.T'+n,p=PT[id];return {id,c:[p.shape[1],p.shape[2]],r:p.shape[3],y:p.y+DECK};};
  const T1=ter(1),T2=ter(2),T3=ter(3);
  /* a terrace's deck is an annulus: from the drum column at its middle (the Spine's radius + 1, where the saucer's deck starts)
     out to its garden's edge; in sectors (core/walk's polygons are simple) */
  const SPR=P.dim.SPINE.r+1;
  for(const T of [T1,T2,T3]){const n=36,m=3;for(let i=0;i<n;i++){const pts=[];
   for(let j=0;j<=m;j++){const a=(i+j/m)/n*Math.PI*2;pts.push([T.c[0]+(T.r-.5)*Math.cos(a),T.c[1]+(T.r-.5)*Math.sin(a),T.y]);}
   for(let j=m;j>=0;j--){const a=(i+j/m)/n*Math.PI*2;pts.push([T.c[0]+SPR*Math.cos(a),T.c[1]+SPR*Math.sin(a),T.y]);}
   floor('sb.walk.'+T.id.slice(3)+'.'+i,{poly:pts,y:T.y});}}

  // ---- the lifts: one record a frame (L2a and L2b share theirs), its stops, gates, gangways --------------------------------------
  const lw=L.ways.filter(w=>w.kind==='lift'&&!w.gated),byF=new Map();
  for(const w of lw){const k=w.frame.map(x=>x.toFixed(2)).join(',');(byF.get(k)||byF.set(k,{ways:[],frame:w.frame}).get(k)).ways.push(w);}
  /* a stop's walking height and the point its gate faces */
  const stopY=(part,y)=>/^sb\.T\d$/.test(part)?y+DECK:part==='sb.lobby.core'?fl:y;
  const plateauZ=x=>F.faceZ(x,F.lipY)-.6;
  for(const G of byF.values()){const f=G.frame,id=G.ways.map(w=>w.id).join('+'),stops=new Map();
   for(const w of G.ways){stops.set(w.a+'@'+w.y0,{part:w.a,y:stopY(w.a,w.y0)});stops.set(w.b+'@'+w.y1,{part:w.b,y:stopY(w.b,w.y1)});}
   const St=[...stops.values()].sort((a,b)=>a.y-b.y),lift={id,ways:G.ways.map(w=>w.id),frame:f,stops:St,shaft:[St[0].y-.4,St[St.length-1].y+DOORH+1.6]};
   for(const st of St){
    /* the gate's side: toward the landing's middle (a terrace's centre, a ledge's middle, the core's door, the plateau) */
    let tgt;const p=PT[st.part];
    if(/^sb\.T\d$/.test(st.part))tgt=[p.shape[1],p.shape[2]];
    else if(st.part==='sb.lobby.core')tgt=[cd.at[0],cd.at[1]];
    else if(st.part==='sb.lip.post')tgt=[f[0],plateauZ(f[0])-10];
    else tgt=[(p.shape[1]+p.shape[2])/2,(p.shape[3]+p.shape[4])/2];
    if(id==='L1'&&st.part==='sb.T1'){const L2=[...byF.values()].find(g=>g.ways.some(w=>w.id==='L2a'));tgt=L2.frame;}
    const d=v(f,tgt),side=Math.abs(d[0])>Math.abs(d[1])?[Math.sign(d[0]),0]:[0,Math.sign(d[1])];st.side=side;
    const gp=[f[0]+side[0]*(CAR+WALLT/2+.05),f[1]+side[1]*(CAR+WALLT/2+.05)];
    st.gate=door('sb.gate.'+id+'.'+st.part.replace(/^sb\./,''),gp,side[0]?'z':'x',st.y,{name:'the '+id+' gate at '+st.part});
    /* a gangway where the car stops short of the landing: from the car's edge along the gate's side until the landing's floor */
    const edge=[f[0]+side[0]*CAR,f[1]+side[1]*CAR];let gap=0;
    if(/^sb\.T\d$/.test(st.part)){const T=ter(+st.part.slice(4)),dc=len(v(T.c,edge));if(dc>T.r-.5){const t=rayCircle(edge,side,T.c,T.r-.5);gap=t==null?0:Math.max(0,len(v(edge,T.c))-(T.r-.5));
      /* along the side: walk from the edge until inside the deck's radius */let s=0;while(s<40&&len(v(T.c,[edge[0]+side[0]*s,edge[1]+side[1]*s]))>T.r-1.5)s+=.25;gap=s;}}
    else if(st.part==='sb.lip.post')gap=Math.max(0,edge[1]-plateauZ(edge[0])+.4);
    else{const s=p.shape,inside=q=>q[0]>=s[1]&&q[0]<=s[2]&&q[1]>=s[3]&&q[1]<=s[4];let k=0;while(k<30&&!inside([edge[0]+side[0]*k,edge[1]+side[1]*k]))k+=.25;gap=k;}
    if(gap>.05){const g=gap+1,a=edge,b=[edge[0]+side[0]*g,edge[1]+side[1]*g],hw=1.6;
     const rect=side[0]?[Math.min(a[0],b[0]),Math.max(a[0],b[0]),f[1]-hw,f[1]+hw]:[f[0]-hw,f[0]+hw,Math.min(a[1],b[1]),Math.max(a[1],b[1])];
     st.gangway=floor('sb.walk.gangway.'+id+'.'+st.part.replace(/^sb\./,''),{rect,y:st.y,gangway:true,len:g});S.gangways.push(st.gangway);}}
   /* the shaft: four walls of the frame, open at each stop's gate (the gate is the door there) */
   const o=CAR+WALLT/2+.05;
   for(const sd of [[1,0],[-1,0],[0,1],[0,-1]]){const gaps=St.filter(st=>st.side[0]===sd[0]&&st.side[1]===sd[1]).map(st=>st.y).sort((a,b)=>a-b);
    const fx=f[0]+sd[0]*o,fz=f[1]+sd[1]*o,along=sd[0]?'z':'x',c=along==='z'?f[1]:f[0],span=CAR+WALLT;
    const box=(a0,a1,ya,yb)=>along==='z'?[fx-WALLT/2,fx+WALLT/2,a0,a1,ya,yb]:[a0,a1,fz-WALLT/2,fz+WALLT/2,ya,yb];
    let yy=lift.shaft[0];for(const gy of gaps){if(gy-.1>yy)wall(id+'.shaft',box(c-span,c+span,yy,gy-.1));   /* under a gate: short of its floor, or it would touch the walker standing there */
     wall(id+'.shaft',box(c-span,c-GATE,gy,gy+DOORH));wall(id+'.shaft',box(c+GATE,c+span,gy,gy+DOORH));yy=gy+DOORH;}
    wall(id+'.shaft',box(c-span,c+span,yy,lift.shaft[1]));}
   lift.car={rect:[f[0]-CAR,f[0]+CAR,f[1]-CAR,f[1]+CAR],y:St[0].y};
   S.lifts.push(lift);}
  const LF=id=>S.lifts.find(l=>l.ways.indexOf(id)>=0),L1=LF('L1'),L2=LF('L2a');

  /* T1: the landing plate in the neck where L1 comes up (between the drum below and the drum above), the neck's wall and door, the
     ring building's wall and door, on the line from L1's gate to L2's */
  {const dn=P.drums.find(q=>q.id==='sb.sp.6.0'),up=P.drums.find(q=>q.id==='sb.sp.5.1'),f=(T1.y-(dn.at[1]+dn.h))/(up.at[1]-(dn.at[1]+dn.h));
   const nc=[dn.at[0]+(up.at[0]-dn.at[0])*f,dn.at[2]+(up.at[2]-dn.at[2])*f],nr=dn.nr,head=up.at[1]-T1.y;
   S.plate={c:[L1.frame[0],L1.frame[1]],r:SB_PLATE_R(P),y:T1.y,hole:L1.car.rect};floor('sb.walk.T1.plate',{disc:[L1.frame[0],L1.frame[1],S.plate.r],y:T1.y});
   const g1=L1.stops[L1.stops.length-1].gate.at,g2=L2.stops.find(s=>s.part==='sb.T1').gate.at;
   const nd=ringDoor('sb.door.neck',nc,nr,g1,g2,T1.y,'the neck\'s door at T1');ring('sb.wall.neck',nc,nr,T1.y,T1.y+Math.min(head,DOORH+1.2),[{a:nd.ring.a,ha:nd.ring.ha}]);
   const rd=ringDoor('sb.door.T1ring',T1.c,T1.r-12,g1,g2,T1.y,'the ring building\'s door at T1');ring('sb.wall.T1ring',T1.c,T1.r-12,T1.y,T1.y+6.4,[{a:rd.ring.a,ha:rd.ring.ha}]);
   S.neck={c:nc,r:nr,y:T1.y,head};}

  // ---- the wall: the girder bridge from T3, the ledges, the Nock's transfer landing, the shaft through its west wing ----------
  const br=L.ways.find(w=>w.id==='bridge.T3~sb.wl.0'),wl0=PT['sb.wl.0'],be=[br.pts[1][0],br.pts[1][1]];
  /* from the layout's own start on T3's rim (the reclamation draws the truss there), 2.5 m in onto the deck */
  {const p0=[br.pts[0][0],br.pts[0][1]],d=nrm(v(p0,T3.c)),a=[p0[0]+d[0]*2.5,p0[1]+d[1]*2.5];S.bridge={a:[a[0],a[1],T3.y],b:[be[0],be[1],wl0.y],w:3};
   floor('sb.walk.bridge.T3',{strip:{a:[a[0],a[1],T3.y],b:[be[0],be[1],wl0.y],w:3}});}
  for(const p of L.parts)if(p.kind==='landing'&&p.id!=='sb.nock.landing')floor('sb.walk.'+p.id.slice(3),{rect:p.shape.slice(1),y:p.y});
  {const p=PT['sb.nock.landing'];floor('sb.walk.nock.landing',{rect:p.shape.slice(1),y:p.y});}
  /* the holes a car rises through: each wall ledge at the top of the lift that arrives there; the Nock's west wing where W2 does */
  for(const l of S.lifts){const top=l.stops[l.stops.length-1],r=[l.car.rect[0]-.3,l.car.rect[1]+.3,l.car.rect[2]-.3,l.car.rect[3]+.3];
   if(/^sb\.wl\./.test(top.part))S.holes.push({in:top.part,rect:r});
   if(top.part==='sb.nock.landing')S.holes.push({in:'sb.nock.w',rect:r,y0:P.nock.y-P.nock.th,y1:P.nock.y});
   if(l.id==='L1')S.holes.push({in:'sb.T1.plate',rect:r});}
  if(L1)S.holes.push({in:'drums',drums:['sb.sp.6.1','sb.sp.6.0'],rect:[L1.car.rect[0]-.3,L1.car.rect[1]+.3,L1.car.rect[2]-.3,L1.car.rect[3]+.3]});
  /* a landing's floor is open where a car rises through it, so only the car bridges the shaft: with the car away a walker cannot
     step into it (the ledges and the Nock's landing in up to four rectangles round the hole, T1's plate in sectors round it) */
  for(const ho of S.holes){const fid=ho.in==='sb.nock.w'?'sb.walk.nock.landing':ho.in==='sb.T1.plate'?'sb.walk.T1.plate':/^sb\.wl\./.test(ho.in)?'sb.walk.'+ho.in.slice(3):null;
   const k=fid?S.floors.findIndex(f=>f.id===fid):-1;if(k<0)continue;const f=S.floors[k],h=ho.rect.map((x,i)=>x+(i%2?-.3:.3));S.floors.splice(k,1);   /* cut at the car's own edge (the drawn hole is 0.3 m wider) */
   if(f.rect){const [x0,x1,z0,z1]=f.rect,pc=(n,r)=>{if(r[1]-r[0]>.05&&r[3]-r[2]>.05)floor(fid+'.'+n,{rect:r,y:f.y});};
    pc(0,[x0,Math.max(x0,h[0]),z0,z1]);pc(1,[Math.min(x1,h[1]),x1,z0,z1]);pc(2,[Math.max(x0,h[0]),Math.min(x1,h[1]),z0,Math.max(z0,h[2])]);pc(3,[Math.max(x0,h[0]),Math.min(x1,h[1]),Math.min(z1,h[3]),z1]);}
   else if(f.disc){const [cx,cz,r]=f.disc,hc=[(h[0]+h[1])/2,(h[2]+h[3])/2],hw=(h[1]-h[0])/2,hd=(h[3]-h[2])/2,n=32,m=3;
    const sq=a=>{const c=Math.cos(a),s=Math.sin(a),t=Math.min(Math.abs(c)>1e-9?hw/Math.abs(c):1e9,Math.abs(s)>1e-9?hd/Math.abs(s):1e9);return[hc[0]+c*t,hc[1]+s*t];};
    for(let i=0;i<n;i++){const pts=[];for(let j=0;j<=m;j++){const a=(i+j/m)/n*Math.PI*2;pts.push([cx+r*Math.cos(a),cz+r*Math.sin(a),f.y]);}
     for(let j=m;j>=0;j--){const a=(i+j/m)/n*Math.PI*2,q=sq(a);pts.push([q[0],q[1],f.y]);}floor(fid+'.'+i,{poly:pts,y:f.y});}}}

  // ---- the top: the plateau, the Sultanate's post (walls, a door in, a door out), the caravan yard -------------------------------
  const ly=F.lipY,PO=PT['sb.lip.post'].shape,YD=PT['sb.lip.yard'].shape;
  {const pts=[];for(let x=20;x>=-300;x-=10)pts.push([x,plateauZ(x),ly]);pts.push([-300,-320,ly],[20,-320,ly]);floor('sb.walk.plateau',{poly:pts,y:ly});}
  const W5=LF('W5'),px=Math.max(PO[1]+4,Math.min(PO[2]-4,W5.frame[0]-6));
  const pin=door('sb.door.post.s',[px,PO[4]],'x',ly,{name:'the post\'s door from the elevator'}),pout=door('sb.door.post.n',[px,PO[3]],'x',ly,{name:'the post\'s door to the yard'});
  {const hgap=(x)=>Math.abs(x-px)<GATE;for(const zz of [PO[3],PO[4]])for(let x=PO[1];x<PO[2];x+=2){const xm=x+1;if(hgap(xm))continue;wall('sb.wall.post',[x,x+2,zz-WALLT/2,zz+WALLT/2,ly,ly+6]);}
   for(const xx of [PO[1],PO[2]])wall('sb.wall.post',[xx-WALLT/2,xx+WALLT/2,PO[3],PO[4],ly,ly+6]);}
  S.post={rect:PO.slice(1),y:ly,doors:[pin.id,pout.id],px};
  /* the yard's wall (the reclamation draws it, 2 m high) and its gate on the post's side */
  const yg=door('sb.door.yard',[px,YD[4]],'x',ly,{name:'the caravan yard gate',w:3.6});
  for(let x=YD[1];x<YD[2];x+=2){if(Math.abs(x+1-px)<1.8)continue;wall('sb.wall.yard',[x,x+2,YD[4]-.25,YD[4]+.25,ly,ly+2]);}
  for(let x=YD[1];x<YD[2];x+=2)wall('sb.wall.yard',[x,x+2,YD[3]-.25,YD[3]+.25,ly,ly+2]);
  for(const xx of [YD[1],YD[2]])wall('sb.wall.yard',[xx-.25,xx+.25,YD[3],YD[4],ly,ly+2]);S.yard={rect:YD.slice(1),y:ly,gate:yg.id};

  // ---- the route ---------------------------------------------------------------------------------------------------------------
  const go=(x,z,o)=>S.route.push(Object.assign({kind:'walk',at:[x,z]},o||{})),ride=(l,from,to)=>S.route.push({kind:'ride',lift:l.id,from,to});
  const inCar=l=>[l.frame[0],l.frame[1]],out=(st,k)=>[st.gate.at[0]+st.side[0]*(k||1.5),st.gate.at[1]+st.side[1]*(k||1.5)];
  go(0,Z.z1+12,{name:'the town, south of the plaza',start:true});go(0,Z.z1-6,{name:'up the plaza\'s steps'});go(ld.at[0],ld.at[1]+2,{name:'the plaza, before the lobby\'s door'});
  go(ld.at[0],ld.at[1]-4,{name:'through the lobby\'s door and down its treads',door:ld.id});go(cd.at[0],cd.at[1]+2,{name:'the lobby\'s floor, before the core\'s door'});
  const L1b=L1.stops[0],L1t=L1.stops[L1.stops.length-1];go(...out(L1b,.6),{name:'through the core\'s door to L1\'s gate',door:cd.id});
  go(...inCar(L1),{name:'into L1',door:L1b.gate.id});ride(L1,L1b.y,L1t.y);
  const L2b=L2.stops[0],L2t=L2.stops[L2.stops.length-1];
  go(...out(L1t,2),{name:'out of L1 onto T1\'s landing plate',door:L1t.gate.id});
  {const a=S.doors.find(d=>d.id==='sb.door.neck').at,b=S.doors.find(d=>d.id==='sb.door.T1ring').at,nn=nrm(v(L1t.gate.at,L2b.gate.at));
   go(a[0]-nn[0]*1.5,a[1]-nn[1]*1.5,{name:'to the neck\'s door'});go(a[0]+nn[0]*1.5,a[1]+nn[1]*1.5,{name:'through the neck\'s door onto T1',door:'sb.door.neck'});
   go(b[0]-nn[0]*1.5,b[1]-nn[1]*1.5,{name:'across the ring building'});go(b[0]+nn[0]*1.5,b[1]+nn[1]*1.5,{name:'through the ring building\'s door onto the garden',door:'sb.door.T1ring'});}
  go(...out(L2b,1.2),{name:'to L2\'s gate on T1'});go(...inCar(L2),{name:'into L2',door:L2b.gate.id});ride(L2,L2b.y,L2t.y);
  {const e=out(L2t,(L2t.gangway?L2t.gangway.len:0)+1.5);go(...e,{name:'out of L2 over its gangway onto T3',door:L2t.gate.id});
   /* round T3's promenade (between its ring building and its garden's edge) to the bridge */
   const a0=Math.atan2(e[1]-T3.c[1],e[0]-T3.c[0]),a1=Math.atan2(S.bridge.a[1]-T3.c[1],S.bridge.a[0]-T3.c[0]);let da=a1-a0;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
   const rp=T3.r-6.5,n=Math.max(2,Math.ceil(Math.abs(da)*rp/12));for(let i=1;i<=n;i++){const a=a0+da*i/n;go(T3.c[0]+rp*Math.cos(a),T3.c[1]+rp*Math.sin(a),{name:'round T3\'s promenade'});}}
  go(S.bridge.a[0],S.bridge.a[1],{name:'the bridge\'s end on T3'});go(S.bridge.b[0],S.bridge.b[1],{name:'over the girder bridge to the first wall landing'});
  let prev=null;for(const n of ['W1','W2','W3','W4','W5']){const l=LF(n),b=l.stops[0],t=l.stops[l.stops.length-1];
   go(...out(b,(b.gangway?b.gangway.len:0)+1.5),{name:'to '+n+'\'s gate'});go(...inCar(l),{name:'into '+n,door:b.gate.id});ride(l,b.y,t.y);
   go(...out(t,(t.gangway?t.gangway.len:0)+1.5),{name:'out of '+n+(t.gangway?' over its gangway':''),door:t.gate.id});prev=t;}
  go(px,PO[4]+2,{name:'across the plateau to the post\'s door'});go(px,PO[4]-3,{name:'into the Sultanate\'s post',door:pin.id});
  go(px,PO[3]+2,{name:'through the post'});go(px,PO[3]-3,{name:'out of the post',door:pout.id});
  go(px,YD[4]+2,{name:'to the yard gate'});go(px,YD[4]-3,{name:'through the yard gate',door:yg.id});
  go((YD[1]+YD[2])/2,(YD[3]+YD[4])/2,{name:'the caravan yard on the lip',end:true});
  return S;}
 /* the plate in the neck reaches past the drum's radius onto the terrace's deck */
 const SB_PLATE_R=P=>P.dim.SPINE.r+1;   /* to the deck's inner edge (the saucer's deck starts at the drum's radius + 1) */

 // ---- the registry ------------------------------------------------------------------------------------------------------------
 function register(W,S,o){o=o||{};const skip=new Set(o.skip||[]),R={floors:[],walls:[],doors:{},cars:{}};
  for(const f of S.floors){if(skip.has(f.id))continue;let rec;
   if(f.rect)rec=W.floor({rect:f.rect,y:f.y,name:f.id,tag:'sb.walk'});
   else if(f.disc){const [cx,cz,r]=f.disc,n=40,pts=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;pts.push([cx+r*Math.cos(a),cz+r*Math.sin(a),f.y]);}rec=W.poly({pts,name:f.id,tag:'sb.walk'});}
   else if(f.strip)rec=W.strip({a:[f.strip.a[0],f.strip.a[1],f.strip.a[2]],b:[f.strip.b[0],f.strip.b[1],f.strip.b[2]],w:f.strip.w,name:f.id,tag:'sb.walk'});
   else if(f.poly)rec=W.poly({pts:f.poly,name:f.id,tag:'sb.walk'});
   R.floors.push(rec);}
  for(const w of S.walls)R.walls.push(W.block(w.box,'sb.wall'));
  for(const d of S.doors)R.doors[d.id]=W.block(d.box,'sb.door');
  for(const l of S.lifts)R.cars[l.id]=W.floor({rect:l.car.rect,y:l.car.y,name:'car '+l.id,tag:'sb.car'});
  return R;}

 // ---- the walker (core/host's rules) ------------------------------------------------------------------------------------------
 function run(W,S,o){o=o||{};const RG=register(W,S,o),shut=new Set(o.shut||[]),stuck=new Set(o.stuck||[]),ground=o.ground||(()=>0);
  const opened=[],rode=[],legs=[],path=[],events=[];let pos=null;   /* events: {i (path index), door} and {i0, i1, lift}, for the page's replay */
  const at=(px,pz,ay)=>{const g=ground(px,pz),f=W.floorBelow(px,pz,ay,STEP);return f&&f[0]>=g-.3?f[0]:g;};
  const stand=(x,z)=>{const A=pos;let y=at(x,z,A[2]);
   if(A[2]-y>DROP&&W.floorBelow(A[0],A[1],A[2],STEP)){const yx=at(x,A[1],A[2]),yz=at(A[0],z,A[2]);
    if(A[2]-yx<=DROP){z=A[1];y=yx;}else if(A[2]-yz<=DROP){x=A[0];y=yz;}else{x=A[0];z=A[1];y=A[2];}}
   if(W.blocked(x,y,z,R,H)){const q=W.push(x,y,z,R,H);x=q[0];z=q[1];y=at(x,z,A[2]);}
   pos=[x,z,y];};
  const doors=()=>{for(const d of S.doors){if(opened.indexOf(d.id)>=0||shut.has(d.id))continue;
   if(Math.hypot(pos[0]-d.at[0],pos[1]-d.at[1])<2.2&&Math.abs(pos[2]-d.y)<1.5){W.setBlock(RG.doors[d.id],false);opened.push(d.id);events.push({i:path.length,door:d.id});}}};
  for(let i=0;i<S.route.length;i++){const L=S.route[i],leg={i,kind:L.kind,name:L.name||L.lift,ok:false};legs.push(leg);
   if(L.kind==='walk'){if(L.start){pos=[L.at[0],L.at[1],at(L.at[0],L.at[1],1e9)];path.push(pos.slice());leg.ok=true;continue;}
    let still=0,n=0;const lim=Math.ceil(Math.hypot(L.at[0]-pos[0],L.at[1]-pos[1])/.25)*4+120;
    while(n++<lim){const d=[L.at[0]-pos[0],L.at[1]-pos[1]],dl=Math.hypot(d[0],d[1]);if(dl<.4){leg.ok=true;break;}
     const s=Math.min(.25,dl),p0=pos.slice();doors();stand(pos[0]+d[0]/dl*s,pos[1]+d[1]/dl*s);path.push(pos.slice());
     if(Math.hypot(pos[0]-p0[0],pos[1]-p0[1])<.02){if(++still>30)break;}else still=0;}
    if(L.door&&opened.indexOf(L.door)<0)leg.ok=false;
    leg.at=pos.slice();if(!leg.ok)leg.msg='stopped at '+pos.map(x=>x.toFixed(1)).join(',')+' short of '+L.at.map(x=>x.toFixed(1)).join(',');}
   else{const l=S.lifts.find(q=>q.id===L.lift),car=RG.cars[l.id],r=car.rect;
    if(!(pos[0]>r[0]&&pos[0]<r[1]&&pos[1]>r[2]&&pos[1]<r[3]&&Math.abs(pos[2]-car.y)<.3)){leg.msg='not in the car';leg.at=pos.slice();}
    else{const to=stuck.has(l.id)?car.y:L.to;let y=car.y;const dir=Math.sign(to-y);
     const i0=path.length;while(Math.abs(to-y)>1e-6){y=dir>0?Math.min(to,y+.3):Math.max(to,y-.3);car.y=y;stand(pos[0],pos[1]);path.push(pos.slice());}events.push({i0,i1:path.length,lift:l.id,from:L.from,to:L.to});
     leg.ok=Math.abs(pos[2]-L.to)<.05;if(leg.ok)rode.push(l.id);else leg.msg='the car did not take the walker to '+L.to.toFixed(1)+' (at '+pos[2].toFixed(1)+')';leg.at=pos.slice();}}
   if(!leg.ok)break;}
  const end=S.route[S.route.length-1],ok=legs.length===S.route.length&&legs.every(l=>l.ok);
  return {ok,legs,path,events,opened,rode,end:pos,top:end.at,fail:legs.find(l=>!l.ok)||null};}
 /* what the arcology must open for the walk (targets/strongbow reads it as SB_CUTS when the today page sets it): the lobby's door
    bay, the core's door, the neck's and the ring building's doors at T1, L1's shaft through the drums over the lobby, W2's shaft
    through the Nock's west wing */
 function cuts(S,P){const LB=P.foot.lobby,D=id=>S.doors.find(d=>d.id===id),nd=D('sb.door.neck'),rd=D('sb.door.T1ring'),hole=S.holes.find(h=>h.in==='sb.nock.w');
  return {lobby:{a:S.lobbyDoor.a,ha:(S.lobbyDoor.w/2+.15)/(LB.r+1.2),cell:S.lobbyDoor.cell},core:{a:Math.PI/2,ha:(GATE+.15)/LB.core,h:DOORH+.3},
   neck:{drum:'sb.sp.6.0',a:nd.ring.a,ha:(GATE+.1)/nd.ring.r,y:S.neck.y,h:DOORH+.2},ring:{c:rd.ring.c,a:rd.ring.a,ha:(GATE+.15)/rd.ring.r,h:DOORH+.6},
   drums:{ids:['sb.sp.6.1','sb.sp.6.0'],r:Math.hypot(S.car,S.car)+.4},nock:hole?{part:'sb.nock.w',rect:hole.rect}:null};}
 return {plan,register,run,cuts,STEP,DROP,R,H,DECK,DOORH,GATE};})();
