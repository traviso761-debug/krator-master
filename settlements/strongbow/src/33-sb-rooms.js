// ================================================================= STRONGBOW TODAY — the interiors: rooms, storeys, stairs, solid walls
// [G data] The owner, 2026-11-15: "build all walls solid, work on open issues, then implement interiors for the arcology". Every
// standing part of the arcology and its foot gets its inside as records, on core/walk (KWALK) beside the walk up (32-sb-walk.js):
//   SB_ROOMS.plan(layout, plan, walkS) -> {storeys, rooms, floors, walls, doors, stairs, links, locked}
//   SB_ROOMS.register(W, R)            floors, stairs (strips), walls and shut doors as blocks
//   SB_ROOMS.reach(W, R, S, o)         which rooms a walker gets to from the plaza, every door open but the locked ones, the lifts
//                                      ridden stop to stop (the audit test-sb-rooms.js runs)
// THE DRUMS (P.drums, standing): a storey every h/st, each an Ancients ring plate (kits/ancients-interiors AI.ringPlate: rooms cut
//   radially out to the glass, a corridor ring, a core hall); the Spine's core hall holds a switchback stair, storey to storey, and
//   in the two drums over the lobby L1's shaft. Between drums a stair climbs through the neck, from the top storey's core to the next
//   drum's bottom one; where a terrace stands at the neck it lands on a plate there with a door in the neck's wall to the deck.
// THE TERRACES: each ring building (between the drum column and r - 12) a ring of rooms off a corridor along the column, a passage
//   left open where the way out runs, a door from each room to the promenade.
// THE LOBBY: its three galleries are floors; the great stair (drawn by targets/strongbow 8aw3) is a stair of strips, a bridge from it
//   to each gallery at that gallery's height.
// THE BOXES (the wings, the back block, the face's galleries, the Order's storeys in the tower, the shed, the gatehouse, the rim): a
//   storey every h/st, a bar plate (rooms either side of a corridor along the long side), a stair along one end, walls round.
// THE WAYS: every door way in the layout is a door in the walls it crosses; a way the layout keeps shut (the sealed burned run,
//   the barred outcasts' stair, the Order's seal) is a locked door; the town's buildings are solid until the scrap set's own
//   interiors (the scrap Xanadu session) arrive.
// Walls are blocks of at most a metre along each wall line (core/walk's blocks are axis-aligned: a long slanted wall would block its
// room), open at their doors. Hashed only, no rng.
var SB_ROOMS=(function(){
 const WT=.2,DOORW=1.4,TAU=Math.PI*2;
 const hyp=Math.hypot;
 function plan(L,P,S){
  const AI=typeof KratorAncientsInteriors!=='undefined'?KratorAncientsInteriors:null;
  const F=P.frame,PT={};for(const p of L.parts)PT[p.id]=p;
  const R={storeys:[],rooms:[],floors:[],walls:[],doors:[],stairs:[],links:[],locked:[],parts:{}};
  const floor=(id,o)=>{o.id=id;R.floors.push(o);return o;};
  const door=(id,at,y,o)=>{const d=Object.assign({id,at,y,w:DOORW,h:2.6},o||{});R.doors.push(d);return d;};
  const stair=(id,a,b,w,o)=>{const s=Object.assign({id,a,b,w:w||1.6},o||{});R.stairs.push(s);return s;};
  /* a wall line as blocks of at most a metre, open within w/2 of any of the doors given */
  const wallLine=(id,pts,y0,y1,doors,t)=>{t=t||WT;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],l=hyp(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(l/1));
   for(let k=0;k<n;k++){const p=[a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n],q=[a[0]+(b[0]-a[0])*(k+1)/n,a[1]+(b[1]-a[1])*(k+1)/n],m=[(p[0]+q[0])/2,(p[1]+q[1])/2];
    if((doors||[]).some(d=>hyp(m[0]-d.at[0],m[1]-d.at[1])<d.w/2+.25&&y0<d.y+2.6&&y1>d.y))continue;
    R.walls.push({id,box:[Math.min(p[0],q[0])-t/2,Math.max(p[0],q[0])+t/2,Math.min(p[1],q[1])-t/2,Math.max(p[1],q[1])+t/2,y0,y1]});}}};
  const circle=(c,r,n)=>{const o=[];for(let i=0;i<=n;i++){const a=i/n*TAU;o.push([c[0]+r*Math.cos(a),c[1]+r*Math.sin(a)]);}return o;};
  const sectors=(id,c,r0,r1,y,n,hole)=>{n=n||32;for(let i=0;i<n;i++){const pts=[];for(let j=0;j<=3;j++){const a=(i+j/3)/n*TAU;pts.push([c[0]+r1*Math.cos(a),c[1]+r1*Math.sin(a),y]);}
   for(let j=3;j>=0;j--){const a=(i+j/3)/n*TAU;let rr=r0;if(hole){const ca=Math.cos(a),sa=Math.sin(a),hw=(hole[1]-hole[0])/2,hd=(hole[3]-hole[2])/2;rr=Math.max(r0,Math.min(Math.abs(ca)>1e-9?hw/Math.abs(ca):1e9,Math.abs(sa)>1e-9?hd/Math.abs(sa):1e9));}
    pts.push([c[0]+rr*Math.cos(a),c[1]+rr*Math.sin(a),y]);}floor(id+'.'+i,{poly:pts,y});}};
  /* a plate's floors, one a room (reach() then says which rooms a walker gets to): a room's polygon, a corridor ring in sectors,
     a core in sectors less a lift's shaft */
  const plateFloors=(plate,c,hole)=>{for(const rm of plate.rooms){if(rm.poly&&!(hole&&rm.kind!=='corridor'&&/\.core$/.test(rm.id)))floor(rm.id,{poly:rm.poly.map(q=>[q[0],q[1],rm.y]),y:rm.y,room:rm.id});
    else if(rm.ring){const r0=typeof rm.ring.r0==='function'?rm.ring.r0(0):rm.ring.r0,r1=typeof rm.ring.r1==='function'?rm.ring.r1(0):rm.ring.r1;sectors(rm.id,[rm.ring.cx,rm.ring.cz],r0,r1+.02,rm.y,32);}
    else if(rm.poly&&hole){let r=0;for(const q of rm.poly)r=Math.max(r,hyp(q[0]-c[0],q[1]-c[1]));sectors(rm.id,c,0,r,rm.y,32,hole);}}};
  const kindsFor=p=>{const u=(p.use||'')+' '+p.kind,by=p.by,st=p.state;
   if(st==='sealed'||st==='cutoff'||st==='damaged'&&by==='ancient')return ()=>'store';
   if(by==='outcasts')return i=>['cottage','cottage','store','kitchen'][i%4];
   if(by==='order')return i=>['bedroom','bedroom','shrine','hall','kitchen'][i%5];
   if(/barracks/.test(u))return i=>['bunkroom','bunkroom','armoury','mess'][i%4];
   if(/office|gov|customs/.test(u))return i=>['hall','strongroom','hall','chartroom'][i%4];
   if(/works|shops|sheds/.test(u))return i=>['workshop','workshop','store'][i%3];
   if(/store/.test(u))return ()=>'store';
   return i=>['bedroom','bedroom','kitchen','cottage','bedroom','workshop'][i%6];};
  const locked=(a,b)=>{const w=L.ways.find(q=>(q.a===a&&q.b===b)||(q.a===b&&q.b===a));return w?w.open===false:false;};
  const lift=id=>S.lifts.find(l=>l.ways.indexOf(id)>=0);

  // ---- the drums: storeys of ring plates, a stair in the core hall, the necks between them ---------------------------------------
  const SP=P.dim.SPINE,drumsUp=P.drums.filter(d=>PT[d.id]&&PT[d.id].state!=='gone').slice().sort((a,b)=>a.at[1]-b.at[1]);
  const L1=lift('L1'),L1hole=L1?L1.car.rect:null;
  const drumInfo={};
  for(const d of drumsUp){const p=PT[d.id],c=[d.at[0],d.at[2]],st=Math.max(1,p.st|0),H=d.h/st,kinds=kindsFor(p),inL1=L1&&hyp(c[0]-L1.frame[0],c[1]-L1.frame[1])<1;
   const rOut=d.r-.6,info={c,y0:d.at[1],y1:d.at[1]+d.h,st,H,storeys:[]};drumInfo[d.id]=info;R.parts[d.id]={kind:'drum',storeys:st};
   for(let k=0;k<st;k++){const y=d.at[1]+k*H,sid=d.id+'.L'+k;
    const plate=AI?AI.ringPlate({id:sid,level:k,y,h:H,cx:c[0],cz:c[1],rOut:()=>rOut,depth:9,cw:2.4,roomW:7,door:DOORW,core:{r:rOut-9-2.4,kind:'hall',wall:false},kinds:(i)=>kinds(i)}):null;
    if(plate){R.storeys.push({part:d.id,level:k,y,h:H,plate});for(const rm of plate.rooms)R.rooms.push(Object.assign({part:d.id,state:p.state,by:p.by},rm));
     for(const w of plate.walls)wallLine(sid+'.wall',w.pts,y,y+H-.3,w.door?[{at:w.door.at,w:w.door.w,y}]:[]);plateFloors(plate,c,inL1?L1hole:null);}
    else sectors(sid+'.floor',c,0,rOut,y,32,inL1?L1hole:null);info.storeys.push(y);}
   /* the glass: a ring of blocks the whole drum's height (no door: the drums are entered by their stairs) */
   wallLine(d.id+'.skin',circle(c,d.r-.3,96),d.at[1],d.at[1]+d.h,[]);
   /* the core hall's switchback: storey k's flight west to east on one line, the next east to west on the line beside it */
   for(let k=0;k+1<st;k++){const z=c[1]-9-(k%2)*2.6,x0=c[0]-6,x1=c[0]+6,ya=info.storeys[k],yb=info.storeys[k+1];
    stair(d.id+'.stair.'+k,k%2?[x1,z,ya]:[x0,z,ya],k%2?[x0,z,yb]:[x1,z,yb],1.6,{part:d.id});}}
  /* the necks: from a drum's top storey up to the next drum's bottom one; at a terrace, by a plate in the neck and a door to its deck */
  const terAt=(y0,y1)=>{for(const n of [1,2,3,4,5,6]){const p=PT['sb.T'+n];if(!p)continue;if(p.y+1.6>y0&&p.y+1.6<y1)return {n,p,c:[p.shape[1],p.shape[2]],r:p.shape[3],y:p.y+1.6};}return null;};
  for(let i=0;i+1<drumsUp.length;i++){const lo=drumsUp[i],up=drumsUp[i+1],A=drumInfo[lo.id],B=drumInfo[up.id],yA=A.storeys[A.storeys.length-1],yB=B.storeys[0];
   if(yB-yA>40)continue;   /* not neighbours (a gone drum between) */
   const T=terAt(A.y1-.5,B.y0+.5),pa=[A.c[0]-7,A.c[1]+9],pb=[B.c[0]+7,B.c[1]+9];
   /* the neck's wall between the two drums: a ring round the neck's axis at each half metre of height band */
   const nr=lo.nr||SP.neck,ax=t=>[A.c[0]+(B.c[0]-A.c[0])*t,A.c[1]+(B.c[1]-A.c[1])*t];
   if(T){const pm=[T.c[0]-7,T.c[1]+9.5],pm2=[T.c[0]+7,T.c[1]+12],
     lockUp=locked('sb.T'+T.n,up.id),lockDn=locked(lo.id,'sb.T'+T.n);
    stair(lo.id+'.neck.up',[pa[0],pa[1],yA],[pm[0],pm[1],T.y],1.6,{part:lo.id,locked:lockDn});
    stair(up.id+'.neck.dn',[pm2[0],pm2[1],T.y],[pb[0],pb[1],yB],1.6,{part:up.id,locked:lockUp});
    /* the plate in the neck (T1's is the walk's, round L1's car) and the door from the neck to the deck */
    if(T.n!==1){floor('sb.room.T'+T.n+'.plate',{disc:[T.c[0],T.c[1],SP.r+1],y:T.y});}
    const f=(T.y-A.y1)/Math.max(1,(B.y0-A.y1)),nc=ax(Math.max(0,Math.min(1,f))),dirA=Math.atan2((T.n===1?0:1),1)+(T.n===1?0:.8*T.n);
    if(T.n!==1){const a=TAU*AI_h('neck'+T.n),dp=[nc[0]+nr*Math.cos(a),nc[1]+nr*Math.sin(a)];
     const dn=door('sb.room.door.neck.T'+T.n,dp,T.y,{name:'the neck\'s door to T'+T.n,ring:{c:nc,r:nr,a}});
     wallLine('sb.room.neck.T'+T.n,circle(nc,nr,64),T.y,T.y+2.9,[dn]);R.parts['sb.T'+T.n+'.neckdoor']={a,nc};}
    for(const [id,lk] of [[lo.id+'.neck.up',lockDn],[up.id+'.neck.dn',lockUp]])if(lk){const s=R.stairs.find(q=>q.id===id),e=s.b;R.locked.push(door(id+'.hatch',[e[0],e[1]],e[2]-.1,{w:2,locked:true,name:'barred: '+id}));}}
   else{const lk=locked(lo.id,up.id);stair(lo.id+'.neck',[pa[0],pa[1],yA],[pb[0],pb[1],yB],1.6,{part:lo.id,locked:lk});
    if(lk){R.locked.push(door(lo.id+'.neck.hatch',[pb[0],pb[1]],yB-.1,{w:2,locked:true,name:'barred: '+lo.id+' to '+up.id}));}}}
  function AI_h(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return ((h>>>0)%100000)/100000;}

  // ---- the terraces' ring buildings ---------------------------------------------------------------------------------------------
  for(const n of [1,2,3,4,5,6]){const p=PT['sb.T'+n];if(!p||p.state==='gone')continue;const c=[p.shape[1],p.shape[2]],r=p.shape[3],y=p.y+1.6,ro=r-12-.3,ri=SP.r+1;
   /* the passage: where the way out runs (T1: the walk's ring door; another: its neck door's angle) */
   const rd=n===1?S.doors.find(d=>d.id==='sb.door.T1ring'):null,pa=n===1&&rd?rd.ring.a:(R.parts['sb.T'+n+'.neckdoor']||{}).a;
   const skip=pa==null?null:th=>Math.abs(Math.atan2(Math.sin(th-pa),Math.cos(th-pa)))<.12;
   const kinds=kindsFor(p),plate=AI?AI.ringPlate({id:'sb.T'+n+'.ring',level:0,y,h:6.4,cx:c[0],cz:c[1],rOut:()=>ro,depth:ro-ri-2.4,cw:2.4,roomW:8,door:DOORW,core:null,kinds:i=>kinds(i),skip}):null;
   if(!plate)continue;R.storeys.push({part:'sb.T'+n,level:0,y,h:6.4,plate});R.parts['sb.T'+n]={kind:'terrace',storeys:1};
   for(const rm of plate.rooms){R.rooms.push(Object.assign({part:'sb.T'+n,state:p.state,by:p.by},rm));}plateFloors(plate,c,null);
   for(const w of plate.walls)wallLine('sb.T'+n+'.wall',w.pts,y,y+6.1,w.door?[{at:w.door.at,w:w.door.w,y}]:[]);
   /* the ring's outer wall: a door from each room to the promenade, and the passage (T1's wall and door are the walk's) */
   if(n!==1){const outs=plate.rooms.filter(q=>q.th!=null).map(q=>({at:[c[0]+(ro+.3)*Math.cos(q.th),c[1]+(ro+.3)*Math.sin(q.th)],w:DOORW,y}));
    if(pa!=null)outs.push({at:[c[0]+(ro+.3)*Math.cos(pa),c[1]+(ro+.3)*Math.sin(pa)],w:3,y});
    wallLine('sb.T'+n+'.outer',circle(c,ro+.3,128),y,y+6.1,outs);for(const o of outs)door('sb.room.door.T'+n+'.'+R.doors.length,o.at,y,{w:o.w});}
   else{const outs=plate.rooms.filter(q=>q.th!=null).map(q=>({at:[c[0]+(ro+.3)*Math.cos(q.th),c[1]+(ro+.3)*Math.sin(q.th)],w:DOORW,y}));for(const o of outs)door('sb.room.door.T1.'+R.doors.length,o.at,y,{w:o.w,open:true});}}

  // ---- the lobby: the galleries, the great stair and its bridges ------------------------------------------------------------------
  {const LB=P.foot.lobby,c=[LB.at[0],LB.at[2]],st=LB.stair,NT=Math.round(st.turns*36),rm=(st.r0+st.r1)/2,yAt=f=>LB.y0+.25+(LB.y1-LB.y0)*f;
   for(const g of LB.galleries)sectors('sb.room.lobby.'+g.id.split('.').pop(),c,g.r0,g.r1,g.y,48);
   for(let i=0;i<NT;i++){const f0=i/NT,f1=(i+1)/NT,a0=f0*st.turns*TAU,a1=f1*st.turns*TAU;
    stair('sb.room.lobby.stair.'+i,[c[0]+rm*Math.cos(a0),c[1]+rm*Math.sin(a0),yAt(f0)],[c[0]+rm*Math.cos(a1),c[1]+rm*Math.sin(a1),yAt(f1)],st.r1-st.r0-.4,{part:'sb.lobby'});}
   for(const g of LB.galleries){const f=(g.y-LB.y0-.25)/(LB.y1-LB.y0),a=f*st.turns*TAU,p0=[c[0]+st.r1*Math.cos(a),c[1]+st.r1*Math.sin(a)],p1=[c[0]+(g.r0+1)*Math.cos(a),c[1]+(g.r0+1)*Math.sin(a)];
    stair('sb.room.lobby.bridge.'+g.id.split('.').pop(),[p0[0],p0[1],g.y],[p1[0],p1[1],g.y],2.4,{part:'sb.lobby'});
    /* the gallery's parapet (inner edge), open at the bridge */
    wallLine('sb.room.lobby.parapet',circle(c,g.r0,96),g.y,g.y+1.1,[{at:[c[0]+g.r0*Math.cos(a),c[1]+g.r0*Math.sin(a)],w:2.8,y:g.y}]);}}

  // ---- the boxes: storeys of bar plates, a stair at one end, walls round, doors where the layout's ways meet --------------------
  const isBox=p=>p.shape[0]==='box'&&(p.st|0)>0&&p.h>0&&p.state!=='gone'&&p.zone!=='town'&&p.in!=='sb.plaza'&&
   ['office','barracks','guild','works','store','homes','gallery','tower','shed','gate','burned'].indexOf(p.kind)>=0&&!(p.id==='sb.tower.low');
  const boxes=L.parts.filter(isBox);
  /* the doors of a box: a way to another part, on this box's edge nearest that part */
  const edgePt=(s,q)=>{const x=Math.max(s[1],Math.min(s[2],q[0])),z=Math.max(s[3],Math.min(s[4],q[1]));const d=[x-s[1],s[2]-x,z-s[3],s[4]-z],m=Math.min(...d);
   return m===d[0]?[s[1],z]:m===d[1]?[s[2],z]:m===d[2]?[x,s[3]]:[x,s[4]];};
  const ctr=p=>p.shape[0]==='box'?[(p.shape[1]+p.shape[2])/2,(p.shape[3]+p.shape[4])/2]:[p.shape[1],p.shape[2]];
  for(const p of boxes){const s=p.shape,st=p.st|0,H=p.h/st,y0=p.y,kinds=kindsFor(p),lx=s[2]-s[1],lz=s[4]-s[3],along=lx>=lz?'x':'z';
   R.parts[p.id]={kind:'box',storeys:st};
   const dd=[];for(const w of L.ways){if(w.kind!=='door'&&w.kind!=='road'&&w.kind!=='bridge')continue;const o=w.a===p.id?w.b:w.b===p.id?w.a:null;if(!o||!PT[o])continue;
    const q=w.pts?(w.a===p.id?w.pts[0]:w.pts[w.pts.length-1]):ctr(PT[o]),at=edgePt(s,q),y=w.kind==='bridge'?Math.max(y0,PT[o].y+1.6):y0;
    dd.push(door('sb.room.door.'+p.id.slice(3)+'.'+o.slice(3),at,y,{w:DOORW+.6,locked:w.open===false,to:o,from:p.id}));}
   if(!dd.length&&p.kind!=='burned'){const at=[(s[1]+s[2])/2,s[4]];dd.push(door('sb.room.door.'+p.id.slice(3)+'.street',at,y0,{w:DOORW+.6,to:'outside',from:p.id}));}
   for(let k=0;k<st;k++){const y=y0+k*H,sid=p.id+'.L'+k,path=along==='x'?u=>[s[1]+lx*u,(s[3]+s[4])/2]:u=>[(s[1]+s[2])/2,s[3]+lz*u];
    const plate=AI&&Math.min(lx,lz)>7?AI.barPlate({id:sid,level:k,y,h:H,path,depth:Math.min(lx,lz)-.6,side:'both',cw:2.2,roomW:6,door:DOORW,kinds:i=>kinds(i),ends:['core','core']}):null;
    if(plate){R.storeys.push({part:p.id,level:k,y,h:H,plate});for(const rm of plate.rooms)R.rooms.push(Object.assign({part:p.id,state:p.state,by:p.by},rm));
     for(const w of plate.walls)wallLine(sid+'.wall',w.pts,y,y+H-.3,w.door?[{at:w.door.at,w:w.door.w,y}]:[]);plateFloors(plate,null,null);}
    else floor(sid+'.floor',{rect:[s[1]+.2,s[2]-.2,s[3]+.2,s[4]-.2],y});
    if(k+1<st){const e=along==='x'?[[s[1]+1.2,s[3]+1.2+(k%2)*1.8],[s[1]+1.2+Math.min(12,lx*.4),s[3]+1.2+(k%2)*1.8]]:[[s[1]+1.2+(k%2)*1.8,s[3]+1.2],[s[1]+1.2+(k%2)*1.8,s[3]+1.2+Math.min(12,lz*.4)]];
     stair(p.id+'.stair.'+k,k%2?[e[1][0],e[1][1],y]:[e[0][0],e[0][1],y],k%2?[e[0][0],e[0][1],y+H]:[e[1][0],e[1][1],y+H],1.4,{part:p.id});}}
   const rim=[[s[1],s[3]],[s[2],s[3]],[s[2],s[4]],[s[1],s[4]],[s[1],s[3]]];
   wallLine(p.id+'.outer',rim,y0,y0+p.h,dd.map(d=>({at:d.at,w:d.w,y:d.y})));
   for(const d of dd)if(d.locked)R.locked.push(d);}
  /* the boxes stacked on others (the barracks over the offices, the homes over the store, the shops over the sheds): the lower one's
     top storey climbs into the upper one's bottom storey by its stair */
  for(const p of boxes)for(const q of boxes){if(p===q||Math.abs(q.y-(p.y+p.h))>.6)continue;const s=p.shape,t=q.shape;if(s[1]>=t[2]||t[1]>=s[2]||s[3]>=t[4]||t[3]>=s[4])continue;
   const x0=Math.max(s[1],t[1])+1.2,z0=Math.max(s[3],t[3])+1.2,top=p.y+p.h-p.h/(p.st|1);
   stair(p.id+'.up.'+q.id.slice(3),[x0,z0+4,top],[x0+Math.min(12,(Math.min(s[2],t[2])-x0)*.6),z0+4,q.y],1.4,{part:p.id,locked:locked(p.id,q.id)});}

  // ---- the town: its buildings solid until the scrap set's interiors ---------------------------------------------------------------
  R.solids=[];
  return R;}

 // ---- the registry --------------------------------------------------------------------------------------------------------------
 function register(W,R,o){o=o||{};const RG={doors:{}};
  for(const f of R.floors){if(f.rect)W.floor({rect:f.rect,y:f.y,name:f.id,tag:'sb.room'});else if(f.disc){const [cx,cz,r]=f.disc,pts=[];for(let i=0;i<40;i++){const a=i/40*TAU;pts.push([cx+r*Math.cos(a),cz+r*Math.sin(a),f.y]);}W.poly({pts,name:f.id,tag:'sb.room'});}
   else if(f.poly)W.poly({pts:f.poly,name:f.id,tag:'sb.room'});}
  for(const s of R.stairs)W.strip({a:[s.a[0],s.a[1],s.a[2]],b:[s.b[0],s.b[1],s.b[2]],w:s.w,name:s.id,tag:'sb.stair'});
  for(const w of R.walls)W.block(w.box,'sb.room.wall');
  for(const d of R.doors){if(d.open)continue;const b=[d.at[0]-d.w/2,d.at[0]+d.w/2,d.at[1]-d.w/2,d.at[1]+d.w/2,d.y,d.y+2.6];RG.doors[d.id]=W.block(b,d.locked?'sb.room.locked':'sb.room.door');}
  return RG;}
 return {plan,register};})();
