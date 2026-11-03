// ================================================================= METROPOLIS — S1, the Spindle: the hero  [draw]
// MP.heroSpindle(state) -> a Group. Budget 80k triangles (F.tris), under 10 draw calls. The storeys come from the record and the facade from the plan,
// so the glass follows the rooms. Each window storey is a band: a spandrel and a head on the skin, the glass 0.55 m in, and on it the bay's piers,
// jambs, fillers and mullions as instanced panels. A blank storey is one strip. The shape past the storeys (root fins, portals, lamp) is built here, from the record.
MP.heroSpindle=function(state,lite){const F=MP.SPINDLE,S=F.ruins[state]||{},B=MP.builder(lite),seedK=MP.idHash(F.id+state),ruin=state!=='intact';
 const R=MP.spindleR,cut=S.keep?S.keep*F.height.roof:1e9,stain=ruin?MP.stain(seedK,S.stain==null?.7:S.stain):null;
 const DARK=[.12,.12,.13],WALL=ruin?[.86,.83,.78]:[.97,.97,.96],D=.55,PI2=Math.PI*2;
 // a breach: a run of bays and storeys burnt out or fallen away, by hash. In the skin's strips it is a hole; the void behind it is the window chunk
 const breaches=[];if(S.breach){const n=Math.round(F.levels.length*S.breach*1.6);for(let i=0;i<n;i++){const u=j=>MP.u(seedK&0xffff,i,j),l=5+Math.floor(u(1)*44),b=F.levels[l];if(!b)continue;breaches.push({a:u(2)*PI2,w:.14+u(3)*.3,y0:b.y,y1:b.y+(1+Math.floor(u(4)*3.5))*MP.STOREY});}}
 const inBreach=(t,y)=>breaches.some(b=>{let d=Math.abs(t-b.a);d=Math.min(d,PI2-d);return d<b.w&&y>b.y0&&y<b.y1;});
 const hoop=l=>l.use==='plant',doors=[],DH=2.9;
 F.levels.forEach(function(L,lk){if(L.y>=cut)return;
  const y0=L.y,y1=Math.min(L.y+L.h,cut),fac=MP.levelFacade(F,L.k).ring,N=fac.length,bucket=y0<21?'concrete':'white',kinds=fac.map(b=>b.kind);
  const skirt=y0<21,glassy=kinds.some(k=>MP.isGlass(k)||k==='louvre'||k==='arcade');
  const col=stain||undefined,skip=ruin?inBreach:null;
  /* the lobby's doors: at each portal the two bays either side of it (the portal is a bay line) take a door screen, not the sloping glass */
  const isDoor=L.use==='lobby'&&!ruin?(t=>F.portals.some(p=>{let d=Math.abs(t-p);d=Math.min(d,PI2-d);return d<PI2/N-1e-4;})):null;
  if(!glassy||L.use==='lamp'||L.use==='roofpark'){if(L.use==='lamp'||L.use==='roofpark')return;
   B.lathe(bucket,[[R(y0),y0],[R(y1),y1]],N,{col,skip});}
  else{
   // the band: from the lowest sill to the highest window head of this storey
   let sill=9,top=0;kinds.forEach(k=>{const s=MP.BAYSIZE[k];if(s){sill=Math.min(sill,s[1]);top=Math.max(top,s[2]);}});
   const yS=y0+sill,yT=Math.min(y0+top*(L.h/MP.STOREY),y1-.2),rS=R(yS),rT=R(yT),dep=skirt?2.2:D;
   if(sill>.01)B.lathe(bucket,[[R(y0),y0],[rS,yS]],N,{col,skip});
   B.lathe(bucket,[[rS,yS],[rS-dep,yS]],N,{col,skip,uv:2});
   B.lathe(bucket,[[rT-dep,yT],[rT,yT]],N,{col,skip,uv:2});
   B.lathe(bucket,[[rT,yT],[R(y1),y1]],N,{col,skip});
   // what fills the band: glass where a window is, void where the ruin took it
   B.lathe(ruin?'glassOut':'glass',[[rS-dep,yS],[rT-dep,yT]],N,{uv:4,skip:isDoor?(t=>isDoor(t)):null});
   /* a door screen on the chord of the two bays at the glass's foot: bronze posts, fixed sidelights, a head, a pair of sliding leaves (MP.doorLeaves) between the sidelights; over the head a
      soffit back to the sloping glass, a cheek at each side, the glass again above */
   if(isDoor){const Wd=PI2/N,rg=rS-dep,rAt=y=>rg+(rT-dep-rg)*(y-yS)/(yT-yS),hwd=rg*Math.sin(Wd),Hh=DH+.4,rh=rAt(Hh);
    F.portals.forEach(function(p){const rc0=rg*Math.cos(Wd),cx=rc0*Math.cos(p),cz=rc0*Math.sin(p),yaw=Math.PI/2-p,tx=Math.sin(p),tz=-Math.cos(p),at=x=>[cx+tx*x,cz+tz*x];
     [-hwd+.15,-1.8,1.8,hwd-.15].forEach(x=>{const q=at(x);B.obox('bronze',q[0],DH/2,q[1],yaw,.3,DH,.3,{uv:2});});[-1,1].forEach(k=>{const q=at(k*(1.95+hwd-.3)/2);B.obox('glass',q[0],DH/2,q[1],yaw,hwd-.3-1.95,DH,.04,{uv:4});});B.obox('bronze',cx,DH+.2,cz,yaw,2*hwd,.4,.36,{uv:2});
     B.lathe('glass',[[rh,Hh],[rT-dep,yT]],2,{a0:p-Wd,a1:p+Wd,uv:4});B.lathe(bucket,[[rh,Hh],[rg,Hh]],2,{a0:p-Wd,a1:p+Wd,uv:2});
     [p-Wd,p+Wd].forEach(a=>{const c=Math.cos(a),s=Math.sin(a),A=[rg*c,yS,rg*s],Bp=[rg*c,Hh,rg*s],C=[rh*c,Hh,rh*s];B.quad(bucket,A,Bp,C,C,[-s,0,c],{uv:2});B.quad(bucket,Bp,A,C,C,[s,0,-c],{uv:2});});
     doors.push({x:cx,z:cz,yaw,w:3.3,h:DH});});}
   const W=PI2/N;
   fac.forEach(function(b,bi){const k=b.kind,c=b.th,a=c-W/2,ym=(yS+yT)/2,r=(rS+rT)/2-dep/2,arc=W*r,yaw=Math.PI/2-c;
    if(ruin&&inBreach(c,ym))return;if(isDoor&&isDoor(c))return;
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
  if(hoop(L))B.lathe(ruin?'white':'bronze',[[R(y1)+.02,y1-.9],[R(y1)+.35,y1-.8],[R(y1)+.35,y1+.5],[R(y1)+.02,y1+.6]],N,{uv:2,col});
  if(L.use==='lobby'||L.use==='skylobby')B.lathe(ruin?'cyanDead':'cyan',[[R(y1)+.05,y1-.5],[R(y1)+.05,y1-.1]],N,{uv:2});});
 // ---- behind each breach, the burnt-out storeys: a face 1.2 m in, drawn as rooms (the window chunk), so a breach is a hole into the building, not through it
 breaches.forEach(function(b){if(b.y0>=cut)return;const y1=Math.min(b.y1,cut),n=Math.max(2,Math.ceil((y1-b.y0)/3.6)),pts=[];for(let i=0;i<=n;i++){const y=b.y0+(y1-b.y0)*i/n;pts.push([R(y)-1.2,y]);}
  B.lathe('glassOut',pts,Math.max(4,Math.round(b.w*2*24)),{a0:b.a-b.w,a1:b.a+b.w,uv:4});
  for(let i=0;i<=n;i++){const y=b.y0+(y1-b.y0)*i/n;B.lathe('dark',[[R(y)-.1,y],[R(y)-1.2,y]],Math.max(4,Math.round(b.w*2*24)),{a0:b.a-b.w,a1:b.a+b.w,uv:2});B.lathe('dark',[[R(y)-1.2,y-.01],[R(y)-.1,y-.01]],Math.max(4,Math.round(b.w*2*24)),{a0:b.a-b.w,a1:b.a+b.w,uv:2});}});
 // ---- the portals: a bronze frame and a canopy out of the skirt at each, between the fins
 F.portals.forEach(function(a){const c=Math.cos(a),s=Math.sin(a),r=44,yaw=Math.PI/2-a,w=12,h=7;
  B.lathe('concrete',[[r+5,h],[r+5,h+1.2],[r-3,h+1.2]],6,{a0:a-.17,a1:a+.17,uv:3});B.lathe('concrete',[[r-3,h],[r+5,h]],6,{a0:a-.17,a1:a+.17,uv:3,flip:true});
  [-1,1].forEach(d=>{const x=c*r-s*d*(w/2+.8),z=s*r+c*d*(w/2+.8);B.panel(x,h/2,z,yaw,1.2,h,8,[.72,.7,.66]);});});
 // ---- the root fins: a thin wall with a curved outer edge, from the ground to where it dies in the skin
 for(let i=0;i<F.fins.n;i++){const a=F.fins.a0+i*PI2/F.fins.n,c=Math.cos(a),s=Math.sin(a),t=F.fins.t/2,nS=20,y1=Math.min(F.fins.y1,cut),col=ruin?[.8,.77,.72]:[1,1,1],mat=y=>y<21?'concrete':'white';
  const P=(r,y,d)=>[c*r-s*d,y,s*r+c*d];
  for(let j=0;j<nS;j++){const ya=y1*j/nS,yb=y1*(j+1)/nS,ra=MP.finR(F,ya),rb=MP.finR(F,yb),ia=R(ya)-1,ib=R(yb)-1,m=mat(ya),l=Math.max(Math.hypot(rb-ra,yb-ya),1e-3),nr=(yb-ya)/l,ny=-(rb-ra)/l;
   B.quad(m,P(ra,ya,-t),P(ra,ya,t),P(rb,yb,t),P(rb,yb,-t),[c*nr,ny,s*nr],{col});
   B.quad(m,P(ia,ya,t),P(ib,yb,t),P(rb,yb,t),P(ra,ya,t),[-s,0,c],{col});
   B.quad(m,P(ra,ya,-t),P(rb,yb,-t),P(ib,yb,-t),P(ia,ya,-t),[s,0,-c],{col});}}
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
  const Rc=R(cut)-.3,top=[];B.lathe('dark',[[Rc,cut-.4],[0,cut-.4]],36,{});B.lathe('concrete',[[6.5,cut-1],[6.5,cut+7]],16,{});B.lathe('concrete',[[6.5,cut+7],[0,cut+7]],12,{});
  for(let i=0;i<14;i++){const a=MP.u(seedK&0xffff,i,77)*PI2,h=1.5+4*MP.u(seedK&0xffff,i,78),w=.6+1.5*MP.u(seedK&0xffff,i,79),r=Rc+.1;B.panel(Math.cos(a)*r,cut+h/2-.4,Math.sin(a)*r,Math.PI/2-a,w,h,.5,WALL);}}
 const G=B.finish(F,state);if(!lite)MP.doorLeaves(G,doors);return G;};
