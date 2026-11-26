// ================================================================= METROPOLIS — S1, the Spindle: the hero  [draw]
// MP.heroSpindle(state) -> a Group. Budget 80k triangles (F.tris), under 10 draw calls. The storeys come from the record and the facade from the plan,
// so the glass follows the rooms. Each window storey is a band: a spandrel and a head on the skin, the glass 0.55 m in, and on it the bay's piers,
// jambs, fillers and mullions as instanced panels. A blank storey is one strip. The shape past the storeys (root fins, portals, lamp) is built here, from the record.
// a Spindle's root fins between y0 and y1 (their outer edge MP.finR, their inner edge a metre inside the skin's line): the hero's, and a stump's free-standing upper fins,
// which a polar shell cannot hold (a blade off the axis fans into a sheet), so the rubble (57) draws them; free closes the inner edge, which the skin hid
MP.spindleFins=function(B,F,y0,y1,ruin,free){const R=MP.spindleR,PI2=Math.PI*2;if(y1<=y0)return;
 for(let i=0;i<F.fins.n;i++){const a=F.fins.a0+i*PI2/F.fins.n,c=Math.cos(a),s=Math.sin(a),t=F.fins.t/2,nS=Math.max(4,Math.round(20*(y1-y0)/F.fins.y1)),col=ruin?[.8,.77,.72]:[1,1,1],mat=y=>y<21?'concrete':'white';
  const P=(r,y,d)=>[c*r-s*d,y,s*r+c*d];
  for(let j=0;j<nS;j++){const ya=y0+(y1-y0)*j/nS,yb=y0+(y1-y0)*(j+1)/nS,ra=MP.finR(F,ya),rb=MP.finR(F,yb),ia=R(ya)-1,ib=R(yb)-1,m=mat(ya),l=Math.max(Math.hypot(rb-ra,yb-ya),1e-3),nr=(yb-ya)/l,ny=-(rb-ra)/l;
   B.quad(m,P(ra,ya,-t),P(ra,ya,t),P(rb,yb,t),P(rb,yb,-t),[c*nr,ny,s*nr],{col});
   B.quad(m,P(ia,ya,t),P(ib,yb,t),P(rb,yb,t),P(ra,ya,t),[-s,0,c],{col});
   B.quad(m,P(ra,ya,-t),P(rb,yb,-t),P(ib,yb,-t),P(ia,ya,-t),[s,0,-c],{col});
   if(free)B.quad(m,P(ia,ya,t),P(ia,ya,-t),P(ib,yb,-t),P(ib,yb,t),[-c,0,-s],{col});}
  if(free){const r0=MP.finR(F,y1),i0=R(y1)-1;B.quad('concrete',P(i0,y1,-t),P(i0,y1,t),P(r0,y1,t),P(r0,y1,-t),[0,1,0],{col});}}};
MP.heroSpindle=function(state,lite,only){const F=MP.SPINDLE,S=F.ruins[state]||{},B=MP.builder(lite),seedK=MP.idHash(F.id+state),ruin=state!=='intact';
 const R=MP.spindleR,RU=MP.ruin(F,state),cut=RU.cut,stain=ruin?MP.stain(seedK,S.stain==null?.7:S.stain):null;
 /* the tear (MP.ruin, MP.tearAt): a storey stands in a 15-degree sector while its foot is under the tear there, so the edge steps by storeys and sectors and every
    band of 72 or 48 bays breaks on the same lines. topAt is the top of what stands in a sector; a skeleton's floors and columns are its frame, from frame[0] */
 const SEC=24,torn=RU.torn>0,secOf=t=>Math.floor((((t%PI2)+PI2)%PI2)/(PI2/SEC)),tear=t=>MP.tearAt(F,RU,(secOf(t)+.5)*(PI2/SEC)*24),
  topAt=t=>{const c=tear(t);let y=0;F.levels.forEach(L=>{if(L.y<c&&L.y<cut)y=Math.max(y,Math.min(L.y+L.h,cut));});return y;},
  patch=(t,y)=>RU.patchy&&y>RU.patchy[0]&&y<RU.patchy[1]&&MP.u(seedK&0xffff,secOf(t*2),Math.floor(y/MP.STOREY),91)<.5,frame0=RU.frame?RU.frame[0]:Infinity;
 const DARK=[.12,.12,.13],WALL=ruin?[.86,.83,.78]:[.97,.97,.96],D=.55,PI2=Math.PI*2;
 // a breach: a run of bays and storeys burnt out or fallen away, by hash. In the skin's strips it is a hole; the void behind it is the window chunk
 const breaches=[];if(S.breach){const n=Math.round(F.levels.length*S.breach*1.6);for(let i=0;i<n;i++){const u=j=>MP.u(seedK&0xffff,i,j),l=5+Math.floor(u(1)*44),b=F.levels[l];if(!b)continue;breaches.push({a:u(2)*PI2,w:.14+u(3)*.3,y0:b.y,y1:b.y+(1+Math.floor(u(4)*3.5))*MP.STOREY});}}
 const inBreach=(t,y)=>breaches.some(b=>{let d=Math.abs(t-b.a);d=Math.min(d,PI2-d);return d<b.w&&y>b.y0&&y<b.y1;});
 const hoop=l=>l.use==='plant',doors=[],DH=2.9;
 /* a skeleton's storey above its skin: the core (the hero's), and the bare frame, the floor (a ring slab) and 24 rusted columns at the skin's line, each torn by the same
    sectors. The frame is drawn only for only === 'frame', by the rubble (57): a polar shell fans free columns and slab edges into a ragged mass */
 const RUST=[.42,.33,.27];
 function frameLevel(L){const y=L.y,rc=MP.coreR(F,L.k),ro=R(y)-.6,sk=t=>L.y>=tear(t);
  if(only!=='frame'){B.lathe('concrete',[[rc,y],[rc,y+L.h]],16,{uv:3});if(L.y===F.levels.filter(q=>q.y>=frame0)[0].y&&RU.patchy){const p0=RU.patchy[0],p1=RU.patchy[1];B.lathe('dark',[[R(p0)-1.2,p0],[R(p1)-1.2,p1]],48,{});}return;}
  B.lathe('concrete',[[ro,y+.02],[rc,y+.02]],48,{uv:3,skip:sk});B.lathe('concrete',[[rc,y-.32],[ro,y-.32]],48,{uv:3,skip:sk});B.lathe('concrete',[[ro,y-.32],[ro,y+.02]],48,{uv:2,skip:sk});
  for(let i=0;i<24;i++){const a=(i+.5)*PI2/24;if(sk(a))continue;const r=R(y+L.h/2)-.9;B.obox('concrete',Math.cos(a)*r,y+L.h/2,Math.sin(a)*r,Math.PI/2-a,.7,L.h,.7,{col:RUST,uv:2});}}
 if(only==='frame'){F.levels.forEach(L=>{if(L.y>=frame0&&L.y<cut)frameLevel(L);});return B.finish(F,state+'.frame');}
 F.levels.forEach(function(L,lk){if(L.y>=cut)return;if(L.y>=frame0){frameLevel(L);return;}
  const y0=L.y,y1=Math.min(L.y+L.h,cut),fac=MP.levelFacade(F,L.k).ring,N=fac.length,bucket=y0<21?'concrete':'white',kinds=fac.map(b=>b.kind);
  const skirt=y0<21,glassy=kinds.some(k=>MP.isGlass(k)||k==='louvre'||k==='arcade');
  const col=stain||undefined,skip=ruin?((t,y)=>inBreach(t,y)||(torn&&L.y>=tear(t))||patch(t,y)):null;
  /* the lobby's doors: at each portal the two bays either side of it (the portal is a bay line) take a door screen, not the sloping glass */
  const isDoor=L.use==='lobby'?(t=>F.portals.some(p=>{let d=Math.abs(t-p);d=Math.min(d,PI2-d);return d<PI2/N-1e-4;})):null;
  if(!glassy||L.use==='lamp'||L.use==='roofpark'){if(L.use==='lamp'||L.use==='roofpark')return;
   B.lathe(bucket,[[R(y0),y0],[R(y1),y1]],N,{col,skip});}
  else{
   // the band: from the lowest sill to the highest window head of this storey
   let sill=9,top=0;kinds.forEach(k=>{const s=MP.BAYSIZE[k];if(s){sill=Math.min(sill,s[1]);top=Math.max(top,s[2]);}});
   const yS=y0+sill,yT=Math.min(y0+top*(L.h/MP.STOREY),y1-.2),rS=R(yS),rT=R(yT),dep=skirt?2.2:D;
   if(sill>.01)B.lathe(bucket,[[R(y0),y0],[rS,yS]],N,{col,skip});
   /* the lobby's reveal floor is a curb 0.45 m high (none at the doors): a floor at the ground is no height in a side map, so the shell, seen from above, caught its edge
      in the map's first row bay by bay, as spines round the skirt */
   if(yS<.01&&L.k===0){const PL=.45,sk=(t,y)=>(isDoor&&isDoor(t))||(skip&&skip(t,y));B.lathe(bucket,[[rS,yS],[rS,PL]],N,{col,skip:sk,uv:2});B.lathe(bucket,[[rS,PL],[rS-dep,PL]],N,{col,skip:sk,uv:2});if(isDoor)B.lathe(bucket,[[rS,yS],[rS-dep,yS]],N,{col,skip:(t,y)=>!isDoor(t),uv:2});}
   else B.lathe(bucket,[[rS,yS],[rS-dep,yS]],N,{col,skip,uv:2});
   B.lathe(bucket,[[rT-dep,yT],[rT,yT]],N,{col,skip,uv:2});
   B.lathe(bucket,[[rT,yT],[R(y1),y1]],N,{col,skip});
   // what fills the band: glass where a window is, void where the ruin took it
   B.lathe(ruin?'glassOut':'glass',[[rS-dep,yS],[rT-dep,yT]],N,{uv:4,skip:isDoor?(t=>isDoor(t)):(torn||RU.patchy?skip:null)});
   /* a door screen on the chord of the two bays at the glass's foot: bronze posts, fixed sidelights, a head, a pair of sliding leaves (MP.doorLeaves) between the sidelights; over the head a
      soffit back to the sloping glass, a cheek at each side, the glass again above */
   if(isDoor){const Wd=PI2/N,rg=rS-dep,rAt=y=>rg+(rT-dep-rg)*(y-yS)/(yT-yS),hwd=rg*Math.sin(Wd),Hh=DH+.4,rh=rAt(Hh);
    F.portals.forEach(function(p){const rc0=rg*Math.cos(Wd),cx=rc0*Math.cos(p),cz=rc0*Math.sin(p),yaw=Math.PI/2-p,tx=Math.sin(p),tz=-Math.cos(p),at=x=>[cx+tx*x,cz+tz*x];
     [-hwd+.15,-1.8,1.8,hwd-.15].forEach(x=>{const q=at(x);B.obox('bronze',q[0],DH/2,q[1],yaw,.3,DH,.3,{uv:2});});[-1,1].forEach(k=>{const q=at(k*(1.95+hwd-.3)/2);B.obox(ruin?'glassOut':'glass',q[0],DH/2,q[1],yaw,hwd-.3-1.95,DH,.04,{uv:4});});B.obox('bronze',cx,DH+.2,cz,yaw,2*hwd,.4,.36,{uv:2});
     B.lathe(ruin?'glassOut':'glass',[[rh,Hh],[rT-dep,yT]],2,{a0:p-Wd,a1:p+Wd,uv:4});B.lathe(bucket,[[rh,Hh],[rg,Hh]],2,{a0:p-Wd,a1:p+Wd,uv:2});
     [p-Wd,p+Wd].forEach(a=>{const c=Math.cos(a),s=Math.sin(a),A=[rg*c,yS,rg*s],Bp=[rg*c,Hh,rg*s],C=[rh*c,Hh,rh*s];B.quad(bucket,A,Bp,C,C,[-s,0,c],{uv:2});B.quad(bucket,Bp,A,C,C,[s,0,-c],{uv:2});});
     /* a ruin's doorway stands open, its leaves gone; where its lobby will not open (under the skin that stands) a dark face 1.5 m in closes the hollow behind */
     if(!ruin)doors.push({x:cx,z:cz,yaw,w:3.3,h:DH});else if(L.y+L.h>RU.skin+.01){const q=at(0),k=1.5;B.obox('dark',q[0]-Math.cos(p)*k,DH/2,q[1]-Math.sin(p)*k,yaw,3.6,DH+.4,.1,{uv:2});}else doors.push({x:cx,z:cz,yaw,w:3.3,h:DH,dark:true});});}
   const W=PI2/N;
   fac.forEach(function(b,bi){const k=b.kind,c=b.th,a=c-W/2,ym=(yS+yT)/2,r=(rS+rT)/2-dep/2,arc=W*r,yaw=Math.PI/2-c;
    if(ruin&&inBreach(c,ym))return;if(torn&&L.y>=tear(c))return;if(patch(c,ym))return;if(isDoor&&isDoor(c))return;
    const put=(off,y,w,h,d,cl)=>{const t=c+off/r;B.panel(Math.cos(t)*r,y,Math.sin(t)*r,yaw+(c-t),w,h,d,cl);};
    if(k==='pier'||k==='blank'){put(0,ym,arc*1.02,yT-yS,dep,WALL);return;}
    if(k==='louvre'){for(let s=0;s<3;s++)put(0,yS+(yT-yS)*(s+.5)/3,arc*.98,.26,dep*.8,DARK);return;}
    const Z=MP.BAYSIZE[k],f=Z[0],jw=arc*(1-f)/2;
    if(jw>.12){put(-arc/2+jw/2,ym,jw,yT-yS,dep,WALL);put(arc/2-jw/2,ym,jw,yT-yS,dep,WALL);}
    const fs=y0+Z[1],ft=y0+Z[2]*(L.h/MP.STOREY);
    if(fs>yS+.03)put(0,(yS+fs)/2,arc*1.01,fs-yS,dep,WALL);
    if(ft<yT-.03)put(0,(ft+yT)/2,arc*1.01,yT-ft,dep,WALL);
    if(ruin?MP.u(seedK&0xffff,lk,bi)<.2:(y0<75||bi%2===0))put(arc/2,ym,.09,yT-yS,.14,DARK);});}
  // a plant floor is where the structure transfers: a bronze hoop round it, the ruin's breaking line
  if(hoop(L))B.lathe(ruin?'white':'bronze',[[R(y1)+.02,y1-.9],[R(y1)+.35,y1-.8],[R(y1)+.35,y1+.5],[R(y1)+.02,y1+.6]],N,{uv:2,col,skip:torn?(t=>L.y>=tear(t)):null});
  if(L.use==='lobby'||L.use==='skylobby')B.lathe(ruin?'cyanDead':'cyan',[[R(y1)+.05,y1-.5],[R(y1)+.05,y1-.1]],N,{uv:2,skip:torn?(t=>L.y>=tear(t)):null});});
 // ---- behind each breach, the burnt-out storeys: a face 1.2 m in, drawn as rooms (the window chunk), so a breach is a hole into the building, not through it
 breaches.forEach(function(b){if(b.y0>=cut)return;const y1=Math.min(b.y1,cut),n=Math.max(2,Math.ceil((y1-b.y0)/3.6)),pts=[];for(let i=0;i<=n;i++){const y=b.y0+(y1-b.y0)*i/n;pts.push([R(y)-1.2,y]);}
  B.lathe('glassOut',pts,Math.max(4,Math.round(b.w*2*24)),{a0:b.a-b.w,a1:b.a+b.w,uv:4});
  for(let i=0;i<=n;i++){const y=b.y0+(y1-b.y0)*i/n;B.lathe('dark',[[R(y)-.1,y],[R(y)-1.2,y]],Math.max(4,Math.round(b.w*2*24)),{a0:b.a-b.w,a1:b.a+b.w,uv:2});B.lathe('dark',[[R(y)-1.2,y-.01],[R(y)-.1,y-.01]],Math.max(4,Math.round(b.w*2*24)),{a0:b.a-b.w,a1:b.a+b.w,uv:2});}});
 // ---- the portals: a bronze frame and a canopy out of the skirt at each, between the fins
 F.portals.forEach(function(a){const c=Math.cos(a),s=Math.sin(a),r=44,yaw=Math.PI/2-a,w=12,h=7;
  B.lathe('concrete',[[r+5,h],[r+5,h+1.2],[r-3,h+1.2]],6,{a0:a-.17,a1:a+.17,uv:3});B.lathe('concrete',[[r-3,h],[r+5,h]],6,{a0:a-.17,a1:a+.17,uv:3,flip:true});
  [-1,1].forEach(d=>{const x=c*r-s*d*(w/2+.8),z=s*r+c*d*(w/2+.8);B.panel(x,h/2,z,yaw,1.2,h,8,[.72,.7,.66]);});});
 // ---- the root fins: a thin wall with a curved outer edge, from the ground to where it dies in the skin (a ruin's to its cut: a stump's free fins are its rubble's, 57)
 MP.spindleFins(B,F,0,RU.fins,ruin);
 // ---- the lamp: the neck flares to the disc; the disc's rim is the observation ring, on it a low dome, a needle
 if(cut>=F.height.roof){const K=F.crown,sg=56,rD=K.r;
  B.lathe('white',[[R(222),222],[rD-2,225.2],[rD,226]],sg,{});
  B.lathe('bronze',[[rD,226],[rD+.4,226.3],[rD+.4,226.9],[rD,227.1]],sg,{uv:2});
  B.lathe('glass',[[rD-.7,227.1],[rD-.7,231]],sg,{});
  for(let i=0;i<sg;i+=2){const a=i*PI2/sg;B.panel(Math.cos(a)*(rD-.4),229,Math.sin(a)*(rD-.4),Math.PI/2-a,.3,3.9,.5,DARK);}
  B.lathe('bronze',[[rD-.7,231],[rD+.6,231.2],[rD+.6,232],[rD-2,232.8],[K.dome*2.1,234]],sg,{uv:2});
  const dome=[];for(let i=0;i<=8;i++){const t=i/8*Math.PI/2;dome.push([13*Math.cos(t),234+6*Math.sin(t)]);}B.lathe('white',dome,sg,{});
  B.lathe('bronze',[[1,240],[.9,241],[.5,252],[.08,262]],12,{uv:2});
  B.lathe('bronze',[[.6,248],[1.4,248.3],[.55,248.7]],12,{uv:1});B.lathe('bronze',[[.45,254],[.95,254.2],[.4,254.5]],12,{uv:1});
 }else{
  // the torn top: the core stands a little above the skin; the skin's edge is cut by the last storey, a dark floor over it
  const Rc=R(cut)-.3,cTop=RU.core>0?RU.core:cut+7,c0=(torn?cut-RU.torn:cut)-1;
  if(!torn)B.lathe('dark',[[Rc,cut-.4],[0,cut-.4]],36,{});
  else if(!RU.frame){/* each sector's top: a dark floor over the burnt storeys, and a wall down each step to the lower sector beside it (seen from either side) */
   const W=PI2/SEC;for(let i=0;i<SEC;i++){const a0=i*W,y=topAt(a0+W/2),yn=topAt(a0+W*1.5);B.lathe('dark',[[R(y)-.05,y],[0,y]],2,{a0,a1:a0+W});
    if(Math.abs(y-yn)>.1){const a=a0+W,c=Math.cos(a),s=Math.sin(a),lo=Math.min(y,yn),hi=Math.max(y,yn),r=R(lo)-.05;B.quad('dark',[0,lo,0],[r*c,lo,r*s],[r*c,hi,r*s],[0,hi,0],[s,0,-c],{uv:2});B.quad('dark',[r*c,lo,r*s],[0,lo,0],[0,hi,0],[r*c,hi,r*s],[-s,0,c],{uv:2});}}}
  B.lathe('concrete',[[6.5,c0],[6.5,cTop]],16,{});B.lathe('concrete',[[6.5,cTop],[0,cTop]],12,{});
  for(let i=0;i<14;i++){const a=MP.u(seedK&0xffff,i,77)*PI2,h=1.5+4*MP.u(seedK&0xffff,i,78),w=.6+1.5*MP.u(seedK&0xffff,i,79),y=torn?topAt(a):cut,r=R(y)-.4;B.panel(Math.cos(a)*r,y+h/2-.4,Math.sin(a)*r,Math.PI/2-a,w,h,.5,WALL);}}
 /* a skeleton's skin is closed at the frame's foot (where the tear took the frame's slabs the eye went into the hollow), and an impostor (lite) holds the bare frame and a
    stump's free fins, which a card draws well and a shell does not */
 if(RU.frame){const y=RU.frame[0]-.36;B.lathe('dark',[[R(y)-.05,y],[0,y]],48,{});}
 if(lite&&RU.frame){F.levels.forEach(L=>{if(L.y>=frame0&&L.y<cut){const o=only;only='frame';frameLevel(L);only=o;}});}
 if(lite&&RU.finsFree)MP.spindleFins(B,F,RU.finsFree[0],RU.finsFree[1],true,true);
 const G=B.finish(F,state);if(!lite)MP.doorLeaves(G,doors);return G;};
