// ================================================================= 74m. MARR: the Governor's Palace (PLAN.md section 5)
// Seed 10021. Palasio de Gobernar — the Izani Governor's Palace of Marr, massed on the shared vassal palace blueprint
// (settlements/iziz/VASSAL-KITS.md section 3; kits/marr/blueprint/palace_G.png and palace_U.png; same (u, v) coordinate
// frame as Pylon's 74p-pyl-palace.js and Talia's 74t-tal-palace.js) and dressed in Marr's Spanish Colonial / New Orleans /
// Baroque house style:
// - Battered volcanic cantera stone terrace (T = 1.2 m) with imperial twin-return front stair & ceramic urn finials
// - Walled Korta de Onor forecourt (u = -36..-12) with Baroque stone gate piers, wrought-iron grilles, and palm planters
// - Two-storey main hall block (G1 = 5.5 m, U1 = 4.5 m) in Antigua mustard-ochre & cream lime plaster with carved cantera
//   quoins, a 6-bay ground-floor volcanic stone Tuscan arcade (Portal), and a full-width upper New Orleans wrought-iron
//   lacework gallery (Galería de Gobernador) shaded by a mission-tile eave
// - Great octagonal Baroque drum over the Sal de Trona (u = 10, v = 0) with circular oculi and stone pilasters under a
//   glazed cobalt-and-gold azulejo / terracotta ribbed dome and lantern cupola (rising to 27.5 m)
// - Seven octagonal colonial corner & flank pavilions (Chancery of the Ring Sea, Hall of the Consulado, State Banquet
//   Hall, Governor's Family Garden Pavilion with Barcelona mirador screens, Guardhouse, Sea-Shrine Chapel, Round Kitchen)
// - Inhabited Pleasure & Fountain Garden (Korta de Plejar) behind the residence wing!

const MPP=(u,v)=>[-v,1-u];

// Octagonal Spanish Colonial / Baroque pavilion of radius R at blueprint (u, v)
function marpPavilion(u,v,R,o,C){o=o||{};
 const [x,z]=MPP(u,v),T=1.2,SH=[5.5,4.5],ns=o.storeys==null?2:o.storeys,n=o.n==null?8:o.n,rc=R-1.25,rcol=R-.35;
 const P=o.P||null,box=P?o.box:null,inB=(px,pz)=>!!box&&px>box[0]-.25&&px<box[1]+.25&&pz>box[2]-.25&&pz<box[3]+.25,t=P?P.t:.35;
 const Htop=T+SH.slice(0,ns).reduce((a,b)=>a+b,0);
 if(!P)vPst('maDrum',x,T,z,rc,Htop-T,C.wash);
 let y=T;
 for(let s=0;s<ns;s++){const h=SH[s],ch=h-.75,cr=s?Math.max(.16,R*.03):Math.max(.2,R*.04),room=!!P,gaps=[];
  for(let k=0;k<n;k++){const a=k/n*TAU,px=x+Math.sin(a)*rcol,pz=z+Math.cos(a)*rcol;if(inB(px,pz))continue;
   if(s===0){vB('maCantera',px,y,pz,cr*2.2,.32,cr*2.2,a,C.st);
    vPst('maCol',px,y+.32,pz,cr,ch-.54,C.st);
    vB('maCantera',px,y+ch-.22,pz,cr*2.3,.22,cr*2.3,a,C.or);}
   else{
    // upper storey has slender New Orleans wrought-iron gallery columns and railings!
    vPst('vIron',px,y,pz,.06,ch,C.iron);
    const b=(k+.5)/n*TAU,rx=x+Math.sin(b)*rcol*.95,rz=z+Math.cos(b)*rcol*.95,L=2*rcol*Math.sin(Math.PI/n);
    if(!inB(rx,rz)){vB('vIron',rx,y+.9,rz,L,.045,.045,b,C.iron);
     vB('vIron',rx,y+ch-.2,rz,L,.18,.04,b,C.iron);}}}
  const ww=Math.min(1.45,TAU*rc/n*.48);
  for(let k=0;k<n;k++){const a=(k+.5)/n*TAU,px=x+Math.sin(a)*rc,pz=z+Math.cos(a)*rc;if(inB(px,pz))continue;
   const door=room&&P.st[s]&&P.arch.some(A=>A[0]===s&&A[1]===k);
   if(door){const dh=Math.min(ch-.5,3.2);gaps.push({a,w:ww,y0:0,y1:dh});maArch(px,y,pz,a,ww,dh,{fill:'DOOR',open:true,sill:false,band:C.st,key:C.or,leafC:C.wood,bw:.12,card:false});}
   else{if(room)gaps.push({a,w:ww,y0:.45,y1:.45+ch-.95});
    maArch(px,y+.45,pz,a,ww,ch-.95,{fill:s?'L':'G',band:C.st,key:C.or,bw:.13,card:!room});}}
  if(room)marpRing(x,z,rc-t/2,t,y,h,gaps,'vPlaster',C.wash,box);else if(P)vPst('maDrum',x,y,z,rc,h,C.wash);
  if(P){marpDisc(x,z,R,y+ch,.75,'maCantera',C.st,box,P.st[s+1]?{name:P.id+' upper floor',r:rc}:null);
   marpRing(x,z,R-.04,.16,y+ch+.28,.2,[],'vPlaster',C.or,box);}
  else{vPst('maDrumC',x,y+ch,z,R,.75,C.st);vPst('maDrum',x,y+ch+.28,z,R+.04,.2,C.or);}
  y+=h;}
 // Octagonal tile eave + Baroque ribbed dome (cobalt azulejo on chapel/residence, terracotta tile on state wings)
 vPst('maDrumC',x,Htop,z,R+.45,.22,C.st);
 vPst('maDrum',x,Htop+.22,z,R*.65,.85,C.washL);
 const domeItem=o.dome==='az'?'maDomeAz':o.dome==='cu'?'maDomeCu':'maDomeTile';
 const domeC=o.dome==='az'?C.az:o.dome==='cu'?null:C.tile;
 const hDome=R*.74;
 kput(domeItem,[x,Htop+1.07,z],null,[R*.68,hDome,R*.68],domeC);
 for(let k=0;k<8;k++)kput('maRib',[x,Htop+1.07,z],vQ(k*TAU/8,0,0),[R*.71,hDome+.03,R*.71],C.st);
 const top=Htop+1.07+hDome;
 if(o.lantern){
  vPst('maDrum',x,top-.08,z,Math.max(.48,R*.15),Math.max(.95,R*.22),C.washL);
  kput(domeItem,[x,top+Math.max(.85,R*.2),z],null,[Math.max(.52,R*.16),Math.max(.5,R*.15),Math.max(.52,R*.16)],domeC);
  vPst('vIron',x,top+Math.max(1.3,R*.34),z,.05,.9,C.iron);}
 else vPst('vIron',x,top-.05,z,.05,.85,C.iron);
 return top;}

// ---------------------------------------------------------------- THE ROOMS (shared vassal palace blueprint: kits/interiors/sets/marr.js)
function marpBox(PL){return[-PL.BLK[3],-PL.BLK[2],1-PL.BLK[1],1-PL.BLK[0]];}
function marpIn(B,x,z){return x>B[0]+.05&&x<B[1]-.05&&z>B[2]+.05&&z<B[3]-.05;}
function marpWalk(x0,x1,z0,z1,y,name){if(!maWalkOn()||!VERN.cur)return;const K=VERN.cur,sc=K.o.scale==null?1:K.o.scale,a=loc(K.x,K.z,x0*sc,z0*sc,K.ry),b=loc(K.x,K.z,x1*sc,z1*sc,K.ry);
 KWALK.floor({rect:[Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1])],y:(K.o.y||0)+y*sc,name:K.D.key+' '+name,tag:'floor'});}
function marpRing(cx,cz,rm,t,y,h,gaps,item,c,box){const G=gaps.map(g=>({a0:g.a-(g.w/2+.04)/rm,a1:g.a+(g.w/2+.04)/rm,g})).sort((p,q)=>p.a0-q.a0);
 const put=(a,L,y0,hh)=>{const px=cx+Math.sin(a)*rm,pz=cz+Math.cos(a)*rm;if(L<.02||hh<.02||(box&&marpIn(box,px,pz)))return;vB(item,px,y0,pz,L,hh,t,a,c);};
 const arc=(a0,a1)=>{const k=Math.max(1,Math.ceil((a1-a0)*rm/1.0)),s=(a1-a0)/k;for(let i=0;i<k;i++)put(a0+(i+.5)*s,2*rm*Math.sin(s/2)+.05,y,h);};
 if(!G.length){arc(0,TAU);return;}
 for(let i=0;i<G.length;i++){const g=G[i],e=i+1<G.length?G[i+1].a0:G[0].a0+TAU;if(e>g.a1)arc(g.a1,e);
  const L=2*rm*Math.sin((g.a1-g.a0)/2);put(g.g.a,L,y,g.g.y0);put(g.g.a,L,y+g.g.y1,h-g.g.y1);}}
function marpDisc(cx,cz,r,y,h,item,c,box,walk){const zs=[];for(let q=cz-r;q<cz+r-.05;q+=.5)zs.push(q);zs.push(cz+r);
 if(box)for(const zb of[box[2],box[3]])if(zb>cz-r&&zb<cz+r)zs.push(zb);zs.sort((p,q)=>p-q);
 for(let i=0;i+1<zs.length;i++){const za=zs[i],zb=zs[i+1],dz=Math.max(Math.abs(za-cz),Math.abs(zb-cz));if(zb-za<.02||dz>=r)continue;
  const s=Math.sqrt(r*r-dz*dz),zm=(za+zb)/2;let segs=[[cx-s,cx+s]];
  if(box&&zm>box[2]&&zm<box[3])segs=[[cx-s,Math.min(cx+s,box[0])],[Math.max(cx-s,box[1]),cx+s]];
  for(const [x0,x1] of segs)if(x1-x0>.02){vB(item,(x0+x1)/2,y,zm,x1-x0,h,zb-za,0,c);
   if(walk&&dz<walk.r){const w=Math.sqrt(walk.r*walk.r-dz*dz),a=Math.max(x0,cx-w),b=Math.min(x1,cx+w);if(b-a>.05)marpWalk(a,b,za,zb,y+h,walk.name);}}}}
function marpDoor(x,y,z,ry,w,dh,C){const fc=w>=1.4?C.or:C.st;
 IZDOOR.leaf(x,y,z,ry,w-.03,dh-.04,.07,C.wood,{pair:w>1.4});
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.07),0,ry);vB('maCantera',p[0],y,p[1],.14,dh+.12,.26,ry,fc);}
 vB('maCantera',x,y+dh,z,w+.28,.14,.26,ry,fc);}
function marpInterior(PL,C){const {wash,washL,or,st,az,iron,wood}=C,P=MPP,LV=PL.LV,PT=PL.PT,box=marpBox(PL);
 const DH=(lv,w)=>lv?(w>=1.4?3.0:2.4):(w>=1.4?3.4:2.6);
 for(const E of PL.edges){if(E.kind==='open')continue;
  const L=LV[E.lv],y=L.y,h=E.lv?L.h+.03:L.h,alongX=E.axis==='u',ry=alongX?0:Math.PI/2;
  const ends=alongX?[-E.s1,-E.s0]:[1-E.s1,1-E.s0],f=alongX?1-E.c:-E.c,lim=alongX?[box[0],box[1]]:[box[2],box[3]];
  const a=Math.max(ends[0],lim[0]+PL.T-.02),b=Math.min(ends[1],lim[1]-PL.T+.02);if(b-a<.05)continue;
  const at=s=>alongX?[s,f]:[f,s],seg=(s0,s1,y0,hh,item,c)=>{if(s1-s0<.02||hh<.02)return;const m=at((s0+s1)/2);vB(item||'vPlaster',m[0],y0,m[1],s1-s0,hh,PT,ry,c||washL);};
  if(E.kind==='rail'){const m=at((a+b)/2);
   vB('maCantera',m[0],y,m[1],b-a,.95,.2,ry,st);vB('vIron',m[0],y+.95,m[1],b-a+.04,.06,.26,ry,iron);continue;}
  if(E.kind==='glaze'){const gw=Math.min(b-a-1.2,3.2),m=(a+b)/2,s0=m-gw/2,s1=m+gw/2,sill=1.0,head=E.lv?3.4:4.0;
   seg(a,s0,y,h);seg(s1,b,y,h);seg(s0,s1,y,sill);seg(s0,s1,y+head,h-head);
   const q=at(m);vB('vWinClear',q[0],y+sill,q[1],gw,head-sill,.03,ry,null);
   for(const f of[0,.33,.67,1])vB('vWood',q[0],y+sill+f*(head-sill-.05),q[1],gw+.06,.05,.09,ry,wood);
   for(const k of[-1.5,-1,0,1,1.5]){const r=at(m+k*gw/3);vB('vWood',r[0],y+sill,r[1],.06,head-sill,.09,ry,wood);}
   continue;}
  const D=E.doors.map(d=>({s:alongX?-d.s:1-d.s,w:d.w})).sort((p,q)=>p.s-q.s);let s=a;
  for(const d of D){const s0=d.s-d.w/2,s1=d.s+d.w/2,dh=DH(E.lv,d.w);seg(s,s0,y,h);seg(s0,s1,y+dh,h-dh);const m=at(d.s);marpDoor(m[0],y,m[1],ry,d.w,dh,C);s=s1;}
  seg(s,b,y,h);}
 for(const K of PL.cells){if(K[1]!==1||!K[7])continue;const x0=-K[5],x1=-K[4],z0=1-K[3],z1=1-K[2];
  const X0=Math.max(x0,box[0]+PL.T-.02),X1=Math.min(x1,box[1]-PL.T+.02),Z0=Math.max(z0,box[2]+PL.T-.02),Z1=Math.min(z1,box[3]-PL.T+.02);
  vB('maCantera',(X0+X1)/2,LV[1].y-.25,(Z0+Z1)/2,X1-X0,.25,Z1-Z0,0,st);marpWalk(x0,x1,z0,z1,LV[1].y,'upper floor '+K[0]);}
 // the two internal stairs (pstG and serv)
 const y0=LV[0].y,rise=LV[1].y-y0,N=17,run=N*.32,tilt=Math.atan2(rise,run);
 {const x=6.85,zc=-19.73;vnStairs(x,y0,zc,Math.PI,1.3,rise,N,'maCantera',or);
  vBq('maCantera',x-.6,y0+rise/2-.2,zc,.14,.34,Math.hypot(run,rise)+.2,qEuler(-tilt,0,0),st);}
 {const xc=14.73,z=-16.7;vnStairs(xc,y0,z,Math.PI/2,1.1,rise,N,'maCantera',or);
  vBq('maCantera',xc,y0+rise/2-.2,z-.5,Math.hypot(run,rise)+.2,.34,.14,qEuler(0,0,-tilt),st);}
 // exterior doors through the main block's faces into the corner pavilions and terrace
 for(const D of PL.ext){if(D[6])continue;const [x,z]=P(D[3],D[4]),lv=D[0],ry=Math.abs(D[3]-PL.BLK[0])<1e-6?0:Math.abs(D[3]-PL.BLK[1])<1e-6?Math.PI:D[4]<0?Math.PI/2:-Math.PI/2;
  maArch(x,LV[lv].y,z,ry,D[5],lv?3.0:3.2,{fill:'DOOR',open:true,sill:false,band:or,leafC:wood,bw:.12});}
 // Sal de Trona dais & azulejo compass medallion on the audience hall floor
 {const [x,z]=P(14.35,0);vB('maCantera',x,y0,z,6,.45,1.5,0,st);vB('vPlaster',x,y0+.4,z+.76,6.04,.05,.06,0,or);}
 {const [x,z]=P(10,0);kput('maDiscAz',[x,y0+.02,z],qEuler(Math.PI/2,0,0),[3.2,3.2,.03],az);
  kput('maRing',[x,y0+.03,z],null,[3.25,3.25,1.4],st);}}

function buildMarGovernorPalace(G,o){reseed(10021+(o.v|0));
 const T=1.2,G1=5.5,U1=4.5,R1=T+G1,R2=R1+U1;
 const C={wash:MA_OCHRE(),washL:MA_LIME(),coral:MA_CORAL(),or:MA_OR(),st:MA_CANT(),stD:MA_CANTD(),
          tile:MA_TILE(),az:MA_AZ(),iron:MA_IRON(),wood:MA_WOOD()};
 const IXI=VERN.cur&&VERN.cur.hollow?VERN.cur.ixItem:null,PL=IXI&&IXI.plan?IXI.plan:null,BOX=PL?marpBox(PL):null,pv=id=>PL?PL.pav.find(q=>q.id===id):null;
 const {wash,washL,or,st,stD,tile,az,iron,wood}=C,P=MPP;
 const blk=(item,u0,u1,v0,v1,y,h,c)=>{const [x,z]=P((u0+u1)/2,(v0+v1)/2);vB(item,x,y,z,Math.abs(v1-v0),h,Math.abs(u1-u0),0,c);};
 const at=(u,v)=>P(u,v);

 // Four functional domains (VASSAL-KITS.md 3.2): ceremony, government, city, residence + forecourt
 vnReg('Governor\'s palace — Sal de Trona audience hall (ceremony)',...at(10,0),17,R2+2,{type:['civic'],role:'governor',domain:'ceremony'});
 vnReg('Governor\'s palace — Baroque dome and harbour lantern',...at(10,0),7.5,27.5,{type:['civic'],domain:'ceremony'});
 vnReg('Governor\'s palace — Chanseleria de Mar & Admiralty (government)',...at(-8,-18),6.5,R2+6,{type:['civic'],domain:'government'});
 vnReg('Governor\'s palace — Sal de Konsil council hall (the city\'s door)',...at(-8,18),6.5,R2+6,{type:['civic'],domain:'city'});
 vnReg('Governor\'s palace — Governor\'s residence & mirador',...at(26,12),9,R2+5,{type:['civic'],domain:'residence'});
 vnReg('Governor\'s palace — Korta de Onor forecourt',...at(-24,0),14,3.5,{type:['civic'],domain:'ceremony'});

 // ---- 1. FORECOURT & GROUNDS (u = -36..38, v = -30..30): ochre tapia walls with cantera coping, iron grilles & Baroque gate piers
 const wall=(u0,u1,v0,v1)=>{
  blk('maCantera',u0,u1,v0,v1,0,.85,stD);
  blk('vPlaster',u0,u1,v0,v1,.85,2.25,wash);
  blk('vPlaster',u0-.02,u1+.02,v0,v1,2.55,.22,or);
  const lu=Math.abs(u1-u0)>1,eu=lu?.12:.26,ev=lu?.26:.12;
  blk('maCantera',Math.min(u0,u1)-eu,Math.max(u0,u1)+eu,Math.min(v0,v1)-ev,Math.max(v0,v1)+ev,3.1,.22,st);};
 for(const s of[-1,1]){
  wall(-36.4,-35.6,s*5.6,s*30);wall(-36,38,s*29.6,s*30.4);
  const [gx,gz]=P(-36,s*5.5);
  vB('maCantera',gx,0,gz,2.1,.5,2.1,0,stD);
  vB('maCantera',gx,.5,gz,1.8,4.5,1.8,0,st);
  vB('vPlaster',gx,4.0,gz,1.88,.26,1.88,0,or);
  vB('maCantera',gx,5.0,gz,2.1,.28,2.1,0,st);
  kput('maDomeAz',[gx,5.28,gz],null,[.92,.95,.92],az);
  kput('maUrn',[gx,6.2,gz],null,[.35,.58,.35],or);
  const b=P(-33.5,s*8);vnBannerPole(b[0],0,b[1],0,7,or);}
 wall(37.6,38.4,-30,-20.5);wall(37.6,38.4,-13.5,30);

 // Forecourt axial walk with azulejo compass medallions & two lush courtyard palm/fountain planters!
 blk('maCantera',-35.6,-12,-4.2,4.2,0,.06,st);
 for(const u of[-28,-19]){const [x,z]=P(u,0);
  kput('maDiscAz',[x,.07,z],qEuler(Math.PI/2,0,0),[2.2,2.2,.03],az);
  kput('maRing',[x,.08,z],null,[2.25,2.25,1.4],st);
  kput('maDisc',[x,.09,z],qEuler(Math.PI/2,0,0),[1.1,1.1,.03],or);}
 for(const s of[-1,1]){
  const [px,pz]=P(-24,s*12);vnPlanter(px,0,pz,4.2,6.4,0,st);vnTree(px,.35,pz,4.2);
  for(const u of[-30,-21]){const l=P(u,s*5.4);vnLampPost(l[0],0,l[1],3.6);}}

 // ---- 2. TERRACE & IMPERIAL FRONT STAIR (T = 1.2 m)
 const ter=(u0,u1,v0,v1)=>{const sg=v1>=v0?1:-1;
  blk('maCantera',u0,u1,v0,v1,0,T,st);
  blk('maCantera',u0-.16,u1+.16,v0-.16*sg,v1+.16*sg,0,.35,stD);
  blk('vPlaster',u0-.02,u1+.02,v0,v1,T-.48,.18,or);};
 ter(-8.5,34.6,-25.6,25.6);for(const s of[-1,1])ter(-14.3,-8.5,s*11.7,s*25.6);
 maWalkFloor(0,T,-12,51.2,43.1,0,'palace terrace');
 {const [x,z]=P(-8.5,0);
  vnStairs(x,0,z+1.92,0,6.8,T,12,'maCantera',st);
  for(const s of[-1,1]){
   vB('maCantera',x+s*3.7,0,z+1.92,.65,T+.85,4.2,0,st);
   kput('maUrnAz',[x+s*3.7,T+.85,z+3.8],null,[.38,.62,.38],az);}}

 // ---- 3. MAIN HALL BLOCK (u = -4..24, v = -18..18, y = T..R2)
 vnBody('vPlaster',0,T,-9,36,G1+U1,28,0,wash,PL?{t:.4,floor:'maCantera',floorC:st}:{t:.4});
 maQuoins(0,T,-9,36,G1+U1,28,0,st,.58);
 maBand(0,R1-.1,0-9,36,28,0,st,.18,.26,'maCantera');
 // Front Loggia & Double Gallery at u = -8.9 across v = -11.7..11.7:
 // Ground storey: 7-bay carved volcanic cantera stone Tuscan arcade (central arch open in front of the portal); Upper storey: ornate New Orleans wrought-iron gallery!
 blk('vPlaster',-8.9,-8.3,-11.7,11.7,R1-1.0,1.0,wash);
 blk('maCantera',-8.9,-4.0,-11.7,11.7,R1-.32,.34,st);
 {const [x,z]=P(-8.9,0);
  maCanteraPortal(0,T,5.0,0,2.4,4.2,st,or,wood,{pediment:true,front:true,sill:false});
  for(const dx of[-7.2,-3.6,3.6,7.2])maArch(dx,T+.5,5.0,0,1.65,3.4,{fill:'L',band:st,key:or,bw:.15});
  maArcade(x,T,z,0,7,2.55,G1-.9,.68,st,or,{col:true,fill:'O'});
  // Upper-level recessed loggia wall at u = -4.0 (z = 5.0) + full-width NOLA wrought-iron gallery along z = 9.9!
  maIronGallery(x,R1,z+.2,0,23.2,2.2,U1-.2,iron,wood,{storeys:1,roof:true,tileC:tile,pots:true});
  for(let k=0;k<7;k++){const ux=-10.8+k*3.6;
   maArch(ux,R1+.15,5.0,0,1.65,3.2,{fill:'L',band:st,shutters:wood,bw:.14});}}

 // Side & rear facades of the main block with ground arched windows, upper iron balconies, and Barcelona miradors
 for(const s of[-1,1]){const [x,z]=P(11,s*18),ry=-s*Math.PI/2;
  for(let k=-2;k<=2;k++){const pz=z+k*3.0,idx=k+2;
   const skipG=PL&&(s<0?idx===4:(idx===0||idx===2)),skipU=PL&&(s<0?idx===4:idx===0);
   if(!skipG)maArch(x,T+.6,pz,ry,1.8,3.4,{fill:'L',band:st,key:or,bw:.15});
   if(!skipU){if(k===0)maMirador(x,R1+.25,pz,ry,3.2,3.0,.95,wood,st,tile,true);
    else{maBalcony(x,R1+.12,pz,ry,2.4,.8,st,iron);
     maArch(x,R1+.22,pz,ry,1.45,2.7,{fill:'L',band:st,shutters:wood,bw:.14});}}}}
 {const [x,z]=P(24,0);
  for(let k=-3;k<=3;k++){const px=x+k*3.1;
   if(!(PL&&k===3))maArch(px,T+.6,z,Math.PI,1.8,3.4,{fill:'L',band:st,bw:.15});
   maBalcony(px,R1+.12,z,Math.PI,2.4,.8,st,iron);
   maArch(px,R1+.22,z,Math.PI,1.45,2.7,{fill:'L',band:st,shutters:wood,bw:.14});}}

 // Roof parapet with cantera coping & ceramic urns + hipped tile roof rim
 maParapet(0,R2,-9,36,28,0,wash,st,.9,true);

 // ---- 4. THE GREAT BAROQUE DOME & LANTERN (u = 10, v = 0, rising to 27.5 m)
 {const [x,z]=P(10,0),yR=R2+.9;
  vB('maCantera',x,R2,z,16.4,1.2,16.4,0,st);
  vB('vPlaster',x,R2+1.2,z,16.8,.24,16.8,0,or);
  for(const sx of[-1,1])for(const sz of[-1,1]){
   vB('maCantera',x+sx*7.4,R2+1.44,z+sz*7.4,1.2,1.6,1.2,0,st);
   kput('maUrnAz',[x+sx*7.4,R2+3.04,z+sz*7.4],null,[.45,.75,.45],az);}
  maBaroqueDome(x,yR+.5,z,6.8,4.6,washL,'maDomeAz',az,st,true);}

 // ---- 5. THE SEVEN PAVILIONS (blueprint: Chancery, Council, Banquet, Family Residence, Guard, Chapel, Kitchen)
 for(const s of[-1,1]){
  marpPavilion(-8,s*18,6.3,{n:12,lantern:true,dome:'tile',P:pv(s<0?'pavCh':'pavCo'),box:BOX},C);
  marpPavilion(24,s*18,5.0,{n:10,lantern:false,dome:s>0?'az':'tile',P:pv(s<0?'pavDi':'pavFa'),box:BOX},C);}
 marpPavilion(8,-22,3.6,{n:8,storeys:2,dome:'tile',P:pv('pavGu'),box:BOX},C);
 marpPavilion(8,22,3.6,{n:8,storeys:1,dome:'az',lantern:true,P:pv('pavSh'),box:BOX},C);
 // Round kitchen pavilion at (31, -6) with vented cupola
 {const [x,z]=P(31,-6),K=pv('kitch');
  if(!K)vPst('maDrum',x,T,z,3.6,5.5,wash);
  else{const rm=3.6-K.t/2,gaps=[];for(let k=0;k<8;k++){const a=k*TAU/8,px=x+Math.sin(a)*rm,pz=z+Math.cos(a)*rm;
    if(k===0){gaps.push({a,w:1.15,y0:0,y1:2.5});maArch(px,T,pz,a,1.1,2.5,{fill:'DOOR',open:true,sill:false,band:st,leafC:wood,bw:.1,card:false});}
    else{gaps.push({a,w:.8,y0:1.95,y1:3.55});maArch(px,T+1.95,pz,a,.8,1.6,{fill:'G',band:st,bw:.1,card:false});}}
   marpRing(x,z,rm,K.t,T,5.5,gaps,'vPlaster',wash,null);
   marpDisc(x,z,3.6-K.t/2,T+5.3,.2,'vPlaster',wash,null,null);}
  kput('maRing',[x,T+5.5,z],null,[3.7,3.7,1.4],st);
  kput('maDomeTile',[x,T+5.55,z],null,[3.65,2.4,3.65],tile);
  vPst('maDrum',x,T+7.8,z,.65,1.1,washL);kput('maDomeTile',[x,T+8.9,z],null,[.72,.55,.72],or);}
 if(PL)marpInterior(PL,C);

 // ---- 6. OUTSIDE CHANCERY STAIR & REAR INHABITED PLEASURE GARDEN (Korta de Plejar)
 {const zc=P(1.35,0)[1],xt=19.5,N=22,run=N*.32,xc=xt+run/2;
  vnStairs(xc,0,zc,Math.PI/2,2.4,R1,N,'maCantera',st);
  vB('maCantera',xt-.75,0,zc,1.6,R1,2.6,0,st);
  maWalkFloor(18.3,R1,zc,2.8,2.6,0,'palace chancery landing');
  maCanteraPortal(18,R1,zc,Math.PI/2,1.6,3.1,st,or,wood,{pediment:false,open:true});}
 // Rear Pleasure & Fountain Courtyard behind the residence wing (u = 33.5, v = 12) + service barrels/crates on -v
 {const [gx,gz]=P(31.5,14);maPatioPleasure(gx,T,gz,12.0,7.2,0,{lamps:true});}
 for(let k=0;k<3;k++){const [bx,bz]=P(33+k*1.4,-22);vnCrate(bx,0,bz,.8,.2,wood);vnBarrel(bx+1.1,0,bz,.36,.88,wood);}}

VERN.def({key:'mar_governor_palace',name:'Governor\'s palace (Palasio de Gobernar)',family:'civic',
 tags:{type:['civic'],wealth:'civic',lit:true,role:'governor',job:'administration'},w:64,d:76,h:28.0,build:buildMarGovernorPalace});
