/* ================================================================= SCRAP XANADU: the buildings (seeds 33000-33199)
   Fifteen defs, family rows "Scrap: ...", culture 'xanadu-scrap' (kits/xanadu/PLAN-SCRAP.md section 3). Each has three
   variants: the paint scheme (XS_SCHEMES), the course pattern, and the storeys or crowns change with o.v. The Xanadu body
   stays (the battered whitewash, the maroon twig band, pointed arches); the Ancients' panels, glazing, girders, cable and
   bronze take the place of the timber and the stone of the upper works. */

const XS_TAG=(types,wealth)=>({type:[].concat(types),wealth,lit:wealth!=='common',culture:'xanadu-scrap'});
const XS_PATS=['checker','band','diamond','stripe'];
/* a glazed bay on girder brackets, its floor and roof of whole panels: (x,z) on the wall's face, ry outward, y its floor */
function xnXSBay(x,y,z,ry,w,h,dp,S,lit){const st=xC(S.steel),br=xC(XS.bronze),c=loc(x,z,0,dp/2,ry),f=loc(x,z,0,dp,ry);
 vB('xsShellB',c[0],y-.2,c[1],w+.24,.2,dp+.12,ry,xC(S.a));
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2-.25),0,ry);xnBracket(p[0],y-.2,p[1],ry,dp,.9,.22,st,'xArm');}
 vB('vPlaster',c[0],y,c[1],w-.12,h,dp-.12,ry,lit?xC(XS.room):IZ_ROOMC);
 vB('xsGlassB',f[0],y,f[1],w,h,.05,ry);for(const s of[-1,1]){const q=loc(x,z,s*w/2,dp/2,ry);vB('xsGlassB',q[0],y,q[1],.05,h,dp,ry);}
 for(const u of[-w/2,-w/6,w/6,w/2]){const p=loc(x,z,u,dp,ry);vPst('xsBronzeC',p[0],y,p[1],.05,h,br);}
 vB('xsBronzeB',f[0],y+h*.68,f[1],w,.05,.08,ry,br);
 vB('xsShellB',c[0],y+h,c[1],w+.36,.2,dp+.3,ry,xC(S.b));xnXSFinial(f[0],y+h+.2,f[1],.7,br);}
/* a flat roof of whole panels: a pale deck inside a coping in the second paint (a roof seen from above stays quiet) */
function xnXSRoof(x,y,z,w,d,ry,h,S){const cb=xC(S.b),e=Math.min(.6,w/4,d/4);
 vB('xsShellB',x,y,z,w-2*e+.02,h*.7,d-2*e+.02,ry,xC(S.a).multiplyScalar(.8));
 for(const s of[-1,1]){const p=loc(x,z,0,s*(d/2-e/2),ry),q=loc(x,z,s*(w/2-e/2),0,ry);vB('xsShellB',p[0],y,p[1],w,h,e,ry,cb);vB('xsShellB',q[0],y,q[1],e,h,d-2*e,ry,cb);}}
/* the cable rails round a flat roof at y, inset e from a w x d block centred at (x,z) */
function xnXSRoofRails(x,y,z,w,d,ry,e,S){const P=[[-1,-1],[1,-1],[1,1],[-1,1]].map(q=>loc(x,z,q[0]*(w/2-e),q[1]*(d/2-e),ry));
 for(let k=0;k<4;k++)xnXSRail(P[k],P[(k+1)%4],y,{S});}
/* an octagonal pavilion: eight dressed girder columns, panel arches between their heads, a glass dome on bronze ribs */
function xnXSPavilion(x,y,z,r,h,S,lit){const ap=r*Math.cos(Math.PI/8),side=2*r*Math.sin(Math.PI/8);
 for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.PI/8;xnXSCol(x+Math.sin(a)*r,y,z+Math.cos(a)*r,h,a,{S,s:.28});
  const b=k*Math.PI/4;kput('xsArchW',[x+Math.sin(b)*ap*.97,y+h*.42,z+Math.cos(b)*ap*.97],qEuler(0,b,0),[side*.98,h*.58,.22],xC(S.a));}
 kput('xsBronzeOct',[x,y+h,z],null,[r*1.12,.24,r*1.12],xC(XS.bronze));kput('xsDrumW',[x,y+h+.24,z],qEuler(0,Math.PI/16,0),[r*1.05,.7,r*1.05],xC(S.b));
 return xnXSDome(x,y+h+.94,z,r*.98,'glass',{lit,ribs:8});}

/* ---------------------------------------------------------------- 1. Panel House (a common town house) */
function buildXaScrapHouse(G,o){reseed(33001+(o.v|0));XS_SEED=33001+(o.v|0);const V=xV(o),S=xsS(V),lit=xLit();
 const W=8,D=7,wash=xC(xPick(XPAL.wash)),ns=V===2?3:2;
 const k=xnWall(0,0,0,W,3.4,D,0,wash,'wash');const Wu=W*k-.2,Du=D*k-.2;xnBand(0,3.4,0,W*k,D*k,0,.5);
 vnDoor(0,0,D/2-.05,0,1.2,2.3,'xPaint',xC(S.frame[0]),xC(XPAL.dark[0]));
 for(const s of[-1,1])xnXSWin(s*2.5,1.0,D/2-.1,0,1.0,1.4,{S,arch:true,lit});
 const top=xnXSBlock(0,3.9,0,Wu,ns*3,Du,0,{S,pat:XS_PATS[V],win:{rows:[1,2],every:2},lit});
 xnXSBay(0,4.3,Du/2+.08,0,2.6,2.3,1.0,S,lit);
 xnXSRoof(0,top,0,Wu+.7,Du+.7,0,.34,S);xnXSRoofRails(0,top+.34,0,Wu+.7,Du+.7,0,.3,S);
 xnXSLantern(1.6,top+.34,-1.0,1.0,1.6,{dome:'glass',lit});
 for(const s of[-1,1])xnXSFinial(s*(Wu/2+.15),top+.34,Du/2+.15,.9);
 vnReg('Panel House',0,0,5.6,top+4);vnFolk(0,D/2+3,2,2);}
XA.def({key:'xa_scrap_house',name:'Panel House',family:'Scrap: houses',tags:XS_TAG('single-family dwelling','common'),w:11,d:11,h:18,fw:8.4,fd:7.4,nv:3,build:buildXaScrapHouse});

/* ---------------------------------------------------------------- 2. Panel Row (three narrow houses, one frontage) */
function buildXaScrapRow(G,o){reseed(33011+(o.v|0));XS_SEED=33011+(o.v|0);const V=xV(o),lit=xLit(),D=8;
 for(let h=0;h<3;h++){const x=(h-1)*5.65,Sk=xsS(V+h),pat=XS_PATS[(V+h)%4],ns=2+((V+h)%2),wash=xC(xPick(XPAL.wash));
  vB('xWashB',x,0,0,5.6,3.2,D,0,wash);vB('xsBronzeB',x,3.15,0,5.66,.1,D+.06,0,xC(XS.bronze));
  vnDoor(x-1.3,0,D/2,0,1.1,2.3,'xPaint',xC(Sk.frame[0]),xC(XPAL.dark[1]));
  xnXSWin(x+1.0,.9,D/2,0,1.8,1.8,{S:Sk,arch:true,lit});
  for(const s of[-1,1])xnXSCol(x-1.3+s*.95,0,D/2+1.5,3.0,0,{S:Sk,s:.24});   /* the girder porch */
  vB('xsShellB',x-1.3,3.0,D/2+.8,2.6,.16,1.9,0,xC(Sk.b));
  const top=xnXSBlock(x,3.2,0,5.4,ns*3,D-.4,0,{S:Sk,pat,win:{rows:[1,2],every:2},lit,quoins:h!==1});
  xnXSRoof(x,top,0,5.8,D,0,.3,Sk);xnXSRail(loc(x,0,-2.7,D/2-.3,0),loc(x,0,2.7,D/2-.3,0),top+.3,{S:Sk});
  for(const s of[-1,1])xnXSFinial(x+s*2.75,top+.3,D/2,.8);}
 vnReg('Panel Row',0,0,9.5,16);vnFolk(0,D/2+3.5,3,5);}
XA.def({key:'xa_scrap_row',name:'Panel Row',family:'Scrap: houses',tags:XS_TAG('multi-family dwelling','common'),w:18.5,d:12,h:17,fw:17.6,fd:8.2,nv:3,build:buildXaScrapRow});

/* ---------------------------------------------------------------- 3. Lantern House (a rich courtyard house) */
function buildXaScrapCourt(G,o){reseed(33021+(o.v|0));XS_SEED=33021+(o.v|0);const V=xV(o),S=xsS(V),lit=xLit(),W=26,D=24;
 const wash=xC(xPick(XPAL.wash)),pat=XS_PATS[(V+1)%4];
 const R=[{x:0,z:D/2-2.5,w:W,d:5,up:3},{x:0,z:-D/2+3.5,w:W,d:7,up:6},{x:-W/2+3,z:1,w:6,d:12,up:3},{x:W/2-3,z:1,w:6,d:12,up:3}];
 for(const r of R){vB('xWashB',r.x,0,r.z,r.w,3.6,r.d,0,wash);xnBand(r.x,3.6,r.z,r.w,r.d,0,.45);
  xnXSBlock(r.x,4.05,r.z,r.w-.3,r.up,r.d-.3,0,{S,pat,win:{rows:[1,2],every:2},lit,quoins:false});
  xnXSRoof(r.x,4.05+r.up,r.z,r.w,r.d,0,.3,S);}
 /* the gate: a girder portal before a double door, a pointed hood */
 xnDoorway(0,0,D/2,0,2.4,3.0,{c:xC(XPAL.dark[0])});for(const s of[-1,1])xnXSCol(s*1.8,0,D/2+.6,3.4,0,{S});
 xnXSBeam([-2.3,D/2+.6],[2.3,D/2+.6],3.8,{S});kput('xArcP',[0,3.82,D/2+.6],null,[4.4,1.5,.24],xC(S.frame[1]));xnXSWheel(0,4.5,D/2+.75,0,.45);
 /* the court: a girder arcade on all four sides carrying a gallery of panels, a cable rail on its edge */
 const cx=5.4,z1=5.4,z0=-3.4,st=xC(S.b);
 const ring=[[-cx,z0],[cx,z0],[cx,z1],[-cx,z1]];
 for(let k=0;k<4;k++){const a=ring[k],b=ring[(k+1)%4],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/2.7));
  for(let i=0;i<n;i++){const t=i/n;xnXSCol(a[0]+(b[0]-a[0])*t,0,a[1]+(b[1]-a[1])*t,3.4,0,{S,s:.26});}
  xnXSBeam(a,b,3.82,{S});}
 vB('xsShellB',0,3.8,(z1+7)/2,W-12,.3,7-z1+.3,0,st);vB('xsShellB',0,3.8,(z0-5)/2,W-12,.3,z0+5+.3,0,st);
 vB('xsShellB',-(cx+7)/2,3.8,1,7-cx,.3,z1-z0,0,st);vB('xsShellB',(cx+7)/2,3.8,1,7-cx,.3,z1-z0,0,st);
 for(let k=0;k<4;k++)xnXSRail(ring[k],ring[(k+1)%4],4.1,{S});
 xnXSPool(0,0,1,4.2,6.6,0,{S});for(const s of[-1,1])xnTree(s*3.6,-1.6,4.5);
 /* the hall's lantern: a ring of glass under a glass dome on bronze ribs, over the back range */
 xnXSLantern(0,10.35,-D/2+3.5,2.8,2.2,{n:12,dome:'glass',lit});
 /* the corner tower: a drum of verdigris panels in bronze bands standing proud of the corner, glazed to both streets, a glass cap */
 const tx=-W/2+1.2,tz=D/2-1.2,th=xnXSDrumFace(tx,0,tz,2.3,12,{S,glaze:[0,-Math.PI/2],lit});
 kput('xsBronzeOct',[tx,th,tz],null,[2.7,.2,2.7],xC(XS.bronze));xnXSDome(tx,th+.2,tz,2.4,'glass',{lit});
 vnReg('Lantern House',0,0,13,17);vnReg('Lantern House — corner tower',tx,tz,2.6,16);vnFolk(0,D/2+3,3,4);}
XA.def({key:'xa_scrap_court',name:'Lantern House',family:'Scrap: houses',tags:XS_TAG('single-family dwelling','rich'),w:28,d:27,h:18,fw:26.4,fd:24.4,nv:3,eye:[3,30,0,2],build:buildXaScrapCourt});

/* ---------------------------------------------------------------- 4. Girder Arcade (shops behind a pointed arcade) */
function buildXaScrapBazaar(G,o){reseed(33031+(o.v|0));XS_SEED=33031+(o.v|0);const V=xV(o),S=xsS(V),lit=xLit(),W=30,n=5,bw=W/n;
 const wash=xC(xPick(XPAL.wash));
 vB('xWashB',0,0,-1.5,W,4.4,9,0,wash);
 for(let i=0;i<n;i++){const cx=-W/2+bw*(i+.5);
  vnDoor(cx-1.7,0,3.0,0,1.0,2.3,'xPaint',xC(S.frame[0]),xC(XPAL.dark[0]));xnXSWin(cx+.6,.6,3.0,0,3.0,2.4,{S,lit:true,kind:'lit'});
  kput('xsArchW',[cx,0,5.4],null,[bw,4.4,.3],xC(S.a));
  const a=[cx-bw/2+.4,3.55,5.95],b=[cx+bw/2-.4,3.55,5.95];beam('xsCable',a,b,.01,.01,xC(XS.cable));
  for(let k=1;k<4;k++){const t=k/4;kput('xsBulbB',[a[0]+(b[0]-a[0])*t,3.2,5.95],qEuler(Math.PI,0,0),[.14,.3,.14],xC(XS.bronze));if(lit)vBall('vBulb',a[0]+(b[0]-a[0])*t,3.12,5.95,.07);}
  if(i%2===0){vnSacks(cx+1.5,0,7.2,2);vnCrate(cx-1.2,0,7.4,.8,.3);}}
 for(let i=0;i<=n;i++)xnXSCol(-W/2+bw*i,0,5.85,4.4,0,{S,s:.34});
 vB('xsShellB',0,4.4,4.6,W+.4,.5,3.5,0,xC(S.a).multiplyScalar(.85));vB('xsShellB',0,4.4,6.3,W+.4,.5,.3,0,xC(S.b));xnXSRail([-W/2,6.15],[W/2,6.15],4.9,{S});
 const top=xnXSBlock(0,4.4,-1.5,W-.4,3,8.6,0,{S,pat:XS_PATS[(V+2)%4],win:{rows:[1,2],every:2},lit});
 xnXSRoof(0,top,-1.5,W+.2,9.2,0,.32,S);
 for(let i=0;i<=n;i++)xnXSFinial(-W/2+bw*i,top+.32,2.9,1.0);
 vnReg('Girder Arcade',0,0,16,9);vnFolk(0,9,5,10);}
XA.def({key:'xa_scrap_bazaar',name:'Girder Arcade',family:'Scrap: trade',tags:XS_TAG(['market/shop'],'common'),w:32,d:16,h:10,fw:30.4,fd:12.6,nv:3,build:buildXaScrapBazaar});

/* ---------------------------------------------------------------- 5. Terminus Serai (the caravan terminus) */
function buildXaScrapSerai(G,o){reseed(33041+(o.v|0));XS_SEED=33041+(o.v|0);const V=xV(o),S=xsS(V),lit=xLit(),H=22,E=15;
 const wash=xC(xPick(XPAL.wash)),dark=xC(XPAL.dark[0]);
 const R=[{x:0,z:(H+E)/2,w:2*H,d:H-E,ry:Math.PI},{x:0,z:-(H+E)/2,w:2*H,d:H-E,ry:0},{x:-(H+E)/2,z:0,w:H-E,d:2*E,ry:Math.PI/2},{x:(H+E)/2,z:0,w:H-E,d:2*E,ry:-Math.PI/2}];
 R.forEach((r,ri)=>{vB('xWashB',r.x,0,r.z,r.w,4,r.d,0,wash);xnBand(r.x,4,r.z,r.w,r.d,0,.45);
  xnXSBlock(r.x,4.45,r.z,r.w-.3,3,r.d-.3,0,{S,pat:ri===0?'checker':XS_PATS[(V+1)%4],win:{rows:[1,2],every:2,faces:[0,1,2,3]},lit,quoins:false});
  xnXSRoof(r.x,7.45,r.z,r.w,r.d,0,.3,S);
  /* the rooms' doors onto the court, one every 6 m */
  const L=2*E,nd=Math.round(L/6);for(let i=0;i<nd;i++){const u=-L/2+L*(i+.5)/nd,f=loc(0,0,u,-E,r.ry);vnDoor(f[0],0,f[1],r.ry,1.1,2.4,'xPaint',xC(S.frame[i%2]),dark);}});
 /* the court arcade: dressed girders 2.4 m in from the ranges, a panel gallery over them, a cable rail */
 const c=E-2.4,ring=[[-c,-c],[c,-c],[c,c],[-c,c]];
 for(let k=0;k<4;k++){const a=ring[k],b=ring[(k+1)%4],n=Math.round(2*c/3.2);for(let i=0;i<n;i++){const t=i/n;xnXSCol(a[0]+(b[0]-a[0])*t,0,a[1]+(b[1]-a[1])*t,4,0,{S,s:.3});}
  xnXSBeam(a,b,4.42,{S});xnXSRail(a,b,4.7,{S});}
 const gal=xC(S.a);vB('xsShellB',0,4.42,E-1.2,2*E,.28,2.6,0,gal);vB('xsShellB',0,4.42,-E+1.2,2*E,.28,2.6,0,gal);
 vB('xsShellB',E-1.2,4.42,0,2.6,.28,2*c,0,gal);vB('xsShellB',-E+1.2,4.42,0,2.6,.28,2*c,0,gal);
 /* the gate: a pylon faced in checker courses, the arch's cells left open for a double gate under a pointed hood */
 const gz=H-1,gt=xnXSBlock(0,0,gz,14,13,4,0,{S,pat:'checker',sh:3.25,door:{f:0,half:1,rows:8},win:{rows:[1,2],every:4,from:2,faces:[0]},lit});
 xnDoorway(0,0,gz+2,0,4.6,5.2,{c:dark});kput('xArcP',[0,5.2,gz+2.02],null,[4.7,1.3,.1],xC(S.frame[1]));
 for(const s of[-1,1])xnXSCol(s*2.6,0,gz+2.4,6.6,0,{S,s:.4});xnXSBeam([-3.2,gz+2.4],[3.2,gz+2.4],7.1,{S,h:.5});xnXSWheel(0,8.4,gz+2.3,0,.8);
 xnXSRoof(0,gt,gz,14.6,4.6,0,.34,S);for(const s of[-1,1])for(const t of[-1,1])xnXSFinial(s*7.1,gt+.34,gz+t*2.1,1.2);
 xnXSLantern(0,gt+.34,gz,1.5,1.8,{dome:'glass',lit});
 /* the kiosk over the well, the beasts' corner, the goods */
 kput('xOctS',[0,0,0],null,[1.3,.8,1.3],xC(XS.stone));kput('vDarkB',[0,.79,0],null,[1.4,.02,1.4]);
 xnXSPavilion(0,0,0,3.4,3.8,S,lit);
 for(let i=0;i<3;i++)xnYak(-9+i*2.6,-8,.4);vnSacks(8,0,-8,4);vnCrate(9,0,8,1.1,.4);vnCrate(9.6,0,6.6,.9,.2);vnSacks(-8,0,8,3);
 vnReg('Terminus Serai',0,0,22,9);vnReg('Terminus Serai — gate',0,gz,7.5,15);vnFolk(0,-4,6,9);}
XA.def({key:'xa_scrap_serai',name:'Terminus Serai',family:'Scrap: trade',tags:XS_TAG(['tavern/inn','market/shop','infrastructure'],'civic'),w:46,d:47,h:19,fw:44.4,fd:44.4,nv:3,eye:[8,46,0,14],build:buildXaScrapSerai});

/* ---------------------------------------------------------------- 6. Garrison Gate (two towers, a girder gate, the barracks) */
function buildXaScrapGate(G,o){reseed(33051+(o.v|0));XS_SEED=33051+(o.v|0);const V=xV(o),S=xsS(V),lit=xLit(),TZ=4;
 const wash=xC(xPick(XPAL.wash)),dark=xC(XPAL.dark[0]);let tt=0;
 for(const s of[-1,1]){const x=s*6.5,k=xnWall(x,0,TZ,7,5,7,0,wash,'wash'),tw=7*k-.1;xnBand(x,5,TZ,tw+.1,tw+.1,0,.4);
  tt=xnXSBlock(x,5.4,TZ,tw,10,tw,0,{S,pat:XS_PATS[V===1?3:0],sh:3.33,win:{rows:[1,2],every:2,faces:[0,1,2,3]},lit});
  xnXSRoof(x,tt,TZ,tw+.6,tw+.6,0,.3,S);
  for(let i=0;i<3;i++)for(let f=0;f<4;f++){const p=loc(x,TZ,(i-1)*1.9,tw/2+.05,XS_YAW[f]);vB('xsShellB',p[0],tt+.3,p[1],1.0,1.1,.45,XS_YAW[f],xC(i===1?S.b:S.a));
   kput('xArcP',[p[0],tt+1.4,p[1]],qEuler(0,XS_YAW[f],0),[1.0,.5,.45],xC(S.frame[0]));}
  for(const a of[-1,1])for(const b of[-1,1])xnXSFinial(x+a*(tw/2+.1),tt+.3,TZ+b*(tw/2+.1),1.3);
  kput('xsDrumW',[x,tt+.3,TZ],null,[1.6,1.3,1.6],xC(S.a));xnXSDome(x,tt+1.6,TZ,1.7,'verd',{S});}
 /* the gate: girder jambs and lintel, the leaves, a walk between the towers on its own girders, the Wheel above */
 for(const s of[-1,1])xnXSCol(s*2.75,0,TZ+3.6,7,0,{S,s:.42});xnXSBeam([-3.2,TZ+3.6],[3.2,TZ+3.6],7.5,{S,h:.6});
 xnDoorway(0,0,TZ,0,5.6,6.4,{c:dark});vB('xsShellB',0,6.4,TZ,6,1.1,.5,0,xC(S.b));
 vB('xsShellB',0,7.5,TZ,6,.4,6,0,xC(S.a));for(const s of[-1,1])xnXSRail([-3,TZ+s*2.9],[3,TZ+s*2.9],7.9,{S});
 vB('xsShellB',0,7.9,TZ+3.35,4.2,2.6,.4,0,xC(S.a));xnXSWheel(0,9.2,TZ+3.65,0,1.0);
 /* the curtain walls, coped with panels, cable-railed */
 for(const s of[-1,1]){const x=s*14.2;xnWall(x,0,TZ,8.4,7,2.6,0,wash,'wash');vB('xsShellB',x,7,TZ,8.6,.4,2.4,0,xC(S.b));xnXSRail([x-4.2,TZ+1],[x+4.2,TZ+1],7.4,{S});}
 /* the barracks behind */
 const bz=-7;vB('xWashB',0,0,bz,22,3.4,8,0,wash);xnBand(0,3.4,bz,22,8,0,.4);
 for(let i=0;i<4;i++){const x=-8.25+i*5.5;vnDoor(x,0,bz+4,0,1.1,2.3,'xPaint',xC(S.frame[0]),dark);}
 const bt=xnXSBlock(0,3.8,bz,21.6,3,7.6,0,{S,pat:'band',win:{rows:[1,2],every:2},lit,quoins:false});
 xnXSRoof(0,bt,bz,22.4,8.4,0,.3,S);xnXSRoofRails(0,bt+.3,bz,22.4,8.4,0,.3,S);
 xnFlagpole(0,bt+.3,bz,5,xC(XPAL.saffron));
 vnReg('Garrison Gate',0,TZ,10,tt+3);vnReg('Garrison Gate — barracks',0,bz,11,8);vnFolk(0,TZ+7,3,3);}
XA.def({key:'xa_scrap_gate',name:'Garrison Gate',family:'Scrap: garrison',tags:XS_TAG(['military','civic'],'civic'),w:38,d:24,h:22,fw:37,fd:22,nv:3,eye:[5,30,0,4],build:buildXaScrapGate});

/* ---------------------------------------------------------------- 7. Glass-Crowned Tower (watch and signal) */
function buildXaScrapTower(G,o){reseed(33061+(o.v|0));XS_SEED=33061+(o.v|0);const V=xV(o),S=xsS(V),lit=xLit(),r=3.6,br=xC(XS.bronze);
 const wash=xC(xPick(XPAL.wash)),k=xnWall(0,0,0,9,2.4,9,0,wash,'wash');xnBand(0,2.4,0,9*k,9*k,0,.35);
 vnDoor(0,0,4.5,0,1.3,2.2,'xPaint',xC(S.frame[0]),xC(XPAL.dark[0]));
 const hh=V===1?21:18,top=xnXSDrumFace(0,2.75,0,r,hh,{S,glaze:[0,Math.PI],lit,pat:V===2?'band':null});
 for(let i=0;i<12;i++){const a=i*TAU/12,p=[Math.sin(a)*r,Math.cos(a)*r];xnBracket(p[0],top,p[1],a,1.1,1.0,.24,xC(S.steel),'xArm');}
 kput('xsDrumW',[0,top,0],null,[r+1.2,.3,r+1.2],xC(S.a));
 const P=[];for(let i=0;i<16;i++){const a=i*TAU/16;P.push([Math.sin(a)*(r+1.05),Math.cos(a)*(r+1.05)]);}
 for(let i=0;i<16;i++)xnXSRail(P[i],P[(i+1)%16],top+.3,{S});
 xnXSLantern(0,top+.3,0,2.6,2.8,{n:12,dome:'glass',lit,fin:1.6});
 kput('xsRing',[0,top+.3+2.8*.5,0],qEuler(Math.PI/2,0,0),[2.75,2.75,4],br);
 vnReg('Glass-Crowned Tower',0,0,4.6,top+7);}
XA.def({key:'xa_scrap_tower',name:'Glass-Crowned Tower',family:'Scrap: civic',tags:XS_TAG(['military','infrastructure'],'civic'),w:11,d:11,h:33,fw:9.4,fd:9.4,nv:3,build:buildXaScrapTower});

/* ---------------------------------------------------------------- 8. Wheel Shrine (the Decree's shrine) */
function buildXaScrapShrine(G,o){reseed(33071+(o.v|0));XS_SEED=33071+(o.v|0);const V=xV(o),S=xsS(V),lit=xLit(),PZ=-4,br=xC(XS.bronze);
 const wash=xC(xPick(XPAL.wash)),stone=xC(xPick(XPAL.stone));
 vB('vStone',0,0,PZ,16,1.0,16,0,stone);xnFlight(0,0,PZ+8+2.05,0,4,1.0,'vStone',stone);
 const k=xnWall(0,1,PZ,10,5,10,0,wash,'wash'),hw=10*k;xnBand(0,6,PZ,hw,hw,0,.6,null,{gold:true});
 vnDoor(0,1,PZ+5-.05,0,1.6,2.8,'xPaint',xC(XPAL.red),xC(XPAL.dark[0]));
 for(const s of[-1,1])xnXSWin(s*2.8,2.2,PZ+5-.12,0,1.0,1.9,{S,arch:true,lit});
 xnXSRoof(0,6.6,PZ,hw+.6,hw+.6,0,.3,S);for(const a of[-1,1])for(const b of[-1,1])xnXSFinial(a*(hw/2+.2),6.9,PZ+b*(hw/2+.2),1.1);
 const lt=xnXSLantern(0,6.9,PZ,3.5,2.6,{n:12,lit});
 xnXSDome(0,lt,PZ,3.7,V===1?'panel':'verd',{S,ribs:12,wheel:true});
 /* the prayer wheels: rows of panel drums on bronze axles under panel roofs on girder posts */
 for(const s of[-1,1]){const x=s*7.1;
  for(let i=0;i<7;i++){const z=PZ-5.4+i*1.8;vPst('xsBronzeC',x,1.0,z,.05,2.0,br);kput('xsDrumW',[x,1.45,z],null,[.36,.95,.36],xC(i%2?S.b:S.a));
   kput('xsBronzeOct',[x,1.4,z],null,[.4,.06,.4],br);kput('xsBronzeOct',[x,2.4,z],null,[.4,.06,.4],br);}
  for(const z of[PZ-6.6,PZ+6.6])xnXSCol(x,1.0,z,2.4,0,{S,s:.2});vB('xsShellB',x,3.4,PZ,1.5,.16,13.6,0,xC(S.b));}
 xnXSPool(0,0,9.6,6.4,4.6,0,{S});
 vnReg('Wheel Shrine',0,PZ,8,17);vnFolk(0,7,3,3);}
XA.def({key:'xa_scrap_shrine',name:'Wheel Shrine',family:'Scrap: civic',tags:XS_TAG('religious','civic'),w:18,d:27,h:19,fw:16.4,fd:26,nv:3,eye:[3,22,0,-4],build:buildXaScrapShrine});

/* ---------------------------------------------------------------- 9. Cistern Pavilion (a pavilion at the head of a mosaic pool) */
function buildXaScrapPavilion(G,o){reseed(33081+(o.v|0));XS_SEED=33081+(o.v|0);const V=xV(o),S=xsS(V),lit=xLit(),stone=xC(xPick(XPAL.stone));
 xnXSPool(0,0,3,8.4,11.4,0,{S});
 kput('xOctS',[0,0,-6.4],qEuler(0,Math.PI/8,0),[4.5,.6,4.5],stone);kput('xOctS',[0,.6,-6.4],qEuler(0,Math.PI/8,0),[4.0,.3,4.0],xC(S.tile[1]));
 xnXSPavilion(0,.9,-6.4,3.3,3.6,S,lit);
 xnFountain(0,.9,-6.4,.9,stone);
 for(const a of[-1,1])for(const b of[-1,1]){const x=a*4.8,z=3+b*6.3;xnXSCol(x,0,z,1.8,0,{S,s:.2,cap:false});xnXSFinial(x,1.8,z,.8);}
 vnReg('Cistern Pavilion',0,-6.4,4.2,12);vnReg('Cistern Pavilion — pool',0,3,6,1);vnFolk(0,10.5,2,3);}
XA.def({key:'xa_scrap_pavilion',name:'Cistern Pavilion',family:'Scrap: civic',tags:XS_TAG(['civic','infrastructure'],'civic'),w:14,d:24,h:12,fw:11,fd:23,nv:3,eye:[2,19,0,-5],build:buildXaScrapPavilion});

/* ---------------------------------------------------------------- 10. Cable Bridge (a footbridge between two stair towers) */
function buildXaScrapBridge(G,o){reseed(33091+(o.v|0));XS_SEED=33091+(o.v|0);const V=xV(o),S=xsS(V),lit=xLit(),TX=10,TW=4.2,DY=7;
 const st=xC(S.steel),br=xC(XS.bronze),cab=xC(XS.cable),dark=xC(XPAL.dark[0]);
 for(const s of[-1,1]){const x=s*TX,inner=s<0?1:3;
  const top=xnXSBlock(x,0,0,TW,10.5,TW,0,{S,pat:XS_PATS[(V+(s>0?1:0))%4],sh:3.5,door:[{f:0,rows:3},{f:inner,from:8,rows:3}],win:{rows:[1,2],every:2,from:1,faces:[0,2]},lit});
  vnDoor(x,0,TW/2,0,1.2,2.4,'xPaint',xC(S.frame[0]),dark);vnDoor(x-s*TW/2,DY,0,XS_YAW[inner],1.2,2.4,'xPaint',xC(S.frame[0]),dark,false);
  xnXSRoof(x,top,0,TW+.6,TW+.6,0,.3,S);xnXSLantern(x,top+.3,0,1.3,1.4,{dome:'glass',lit});}
 /* the span: two cambered girders, a deck of whole panels, cable rails; lanterns hung under it */
 const x0=-TX+TW/2+.08,x1=TX-TW/2-.08,N=6,Y=t=>DY-.06+Math.sin(Math.PI*t)*.7;
 for(let k=0;k<N;k++){const t0=k/N,t1=(k+1)/N,a=[x0+(x1-x0)*t0,Y(t0)],b=[x0+(x1-x0)*t1,Y(t1)],L=Math.hypot(b[0]-a[0],b[1]-a[1]),q=qEuler(0,0,Math.atan2(b[1]-a[1],b[0]-a[0]));
  const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
  for(const z of[-1.15,1.15])kput('xsGirderX',[m[0],m[1]-.3,z],q,[L+.04,.56,.26],st);
  kput('xsPanel',[m[0],m[1]+.03,0],q,[L-.03,.1,2.3],xC(k%2?S.a:S.b));
  for(const z of[-1.12,1.12]){kput('xsGirder',[a[0],a[1]+.55,z],null,[.09,1.0,.09],st);
   for(const hh of[.36,.68])beam('xsCable',[a[0],a[1]+hh,z],[b[0],b[1]+hh,z],.012,.012,cab);beam('xsBronzeB',[a[0],a[1]+1.05,z],[b[0],b[1]+1.05,z],.07,.05,br);}
  if(k>0){beam('xsCable',[a[0],a[1]-1.3,0],[a[0],a[1]-.3,0],.01,.01,cab);kput('xsBulbB',[a[0],a[1]-1.3,0],qEuler(Math.PI,0,0),[.16,.32,.16],br);if(lit)vBall('vBulb',a[0],a[1]-1.4,0,.07);}}
 for(const z of[-1.12,1.12])kput('xsGirder',[x1,Y(1)+.55,z],null,[.09,1.0,.09],st);
 vnReg('Cable Bridge',0,0,12,12);vnFolk(0,4,2,6);}
XA.def({key:'xa_scrap_bridge',name:'Cable Bridge',family:'Scrap: civic',tags:XS_TAG('infrastructure','civic'),w:25,d:8,h:14,fw:24.6,fd:4.6,nv:3,eye:[3,13,0,0],build:buildXaScrapBridge});

/* ---------------------------------------------------------------- the guilds, the stores and the baths (the owner, 2026-11-11) */
/* glass eyes set in a dome (the hammam's "elephant eyes"): ts the heights as fractions of the dome, ns how many at each */
const XS_DOMER=[[0,1],[.1,1.06],[.26,1.12],[.44,1.08],[.62,.92],[.78,.66],[.9,.38],[.97,.14],[1,0]];   /* XDOME's radius by height */
function xsDomeR(t){for(let i=1;i<XS_DOMER.length;i++){const a=XS_DOMER[i-1],b=XS_DOMER[i];if(t<=b[0])return a[1]+(b[1]-a[1])*(t-a[0])/(b[0]-a[0]);}return 0;}
function xnXSEyes(x,y,z,r,H,ts,ns){const br=xC(XS.bronze);
 ts.forEach((t,l)=>{const n=ns[l],rr0=r*xsDomeR(t)*.99;for(let i=0;i<n;i++){const a=(i+.5*(l%2))*TAU/n,p=[x+Math.sin(a)*rr0,y+H*t,z+Math.cos(a)*rr0];
  kput('xsGlassDome',p,null,[.3,.24,.3]);kput('xsRing',[p[0],p[1]+.02,p[2]],qEuler(Math.PI/2,0,0),[.34,.34,.8],br);}});}

/* ---------------------------------------------------------------- 11. Salvagers' Guildhall (the guild that quarries the hull) */
function buildXaScrapGuildSalvage(G,o){reseed(33101+(o.v|0));XS_SEED=33101+(o.v|0);const V=xV(o),S=xsS(V),lit=xLit(),HX=-6,W=22,D=14,br=xC(XS.bronze);
 const wash=xC(xPick(XPAL.wash)),dark=xC(XPAL.dark[0]),stone=xC(xPick(XPAL.stone));
 const k=xnWall(HX,0,0,W,4,D,0,wash,'wash'),Wu=W*k-.2,Du=D*k-.2;xnBand(HX,4,0,W*k,D*k,0,.45,null,{gold:true});
 xnDoorway(HX,0,D/2,0,2.6,3.2,{c:dark});for(const s of[-1,1])xnXSWin(HX+s*6,1.1,D/2-.12,0,1.4,1.8,{S,arch:true,lit});
 const top=xnXSBlock(HX,4.45,0,Wu,6,Du,0,{S,pat:'quoin',win:{rows:[1,2],every:2},lit});xnXSRoof(HX,top,0,Wu+.6,Du+.6,0,.3,S);
 /* the portico: four dressed girders two storeys tall, a pediment of panels carrying the guild's sign, a panel in a ring */
 const pz=D/2+2.4;for(const u of[-6,-2,2,6])xnXSCol(HX+u,0,pz,8,0,{S,s:.42});
 xnXSBeam([HX-7,pz],[HX+7,pz],8.5,{S,h:.55});vB('xsShellB',HX,8.0,(D/2+pz)/2+.2,14.4,.3,pz-D/2+.8,0,xC(S.a).multiplyScalar(.85));
 vB('xsShellB',HX,8.5,pz,14.4,1.8,.4,0,xC(S.b));kput('xsRing',[HX,9.4,pz+.26],null,[.75,.75,2],br);
 vB('xsPanel',HX,9.12,pz+.24,1.0,.56,.06,0,xC(S.a));for(const a of[-1,1])for(const b of[-1,1])vBall('xsBall',HX+a*.4,9.4+b*.18,pz+.3,.05,br);   /* the sign: one whole sheet and its four fasteners */
 vB('xsShellB',HX,10.3,pz,8,.4,.4,0,xC(S.frame[0]));vB('xsShellB',HX,10.7,pz,3.6,.4,.4,0,xC(S.frame[1]));xnXSFinial(HX,11.1,pz,1.2);
 /* the monitor: a long lantern of glass down the roof, the hall's daylight */
 const L=Wu-4,my=top+.3,nm=Math.round(L/1.2);vB('vPlaster',HX,my,0,L-.1,1.3,2.7,0,lit?xC(XS.room):IZ_ROOMC);
 for(const s of[-1,1]){vB('xsGlassB',HX,my,s*1.4,L,1.3,.05,0);vB('xsGlassB',HX+s*L/2,my,0,.05,1.3,2.8,0);for(let i=0;i<=nm;i++)vPst('xsBronzeC',HX-L/2+L*i/nm,my,s*1.42,.04,1.3,br);}
 vB('xsShellB',HX,my+1.3,0,L+.4,.18,3.3,0,xC(S.b));
 /* the panel yard: whole sheets stacked on bearers, sorted by skin, under a girder gantry with its trolley and a sheet on the hook */
 const YX=12;xnPave(YX,-2,13,12,0,stone,2.4);
 [-4,-1.6,.8,3.2].forEach((x,i)=>{const it=i%2?'xsPanelV':'xsPanel',nl=8+Math.floor(xsU(11,i,0)*7);
  for(const z of[-.9,.9])kput('xsGirderX',[YX+x,.15,-2+z],null,[1.5,.3,.2],xC(S.steel));
  for(let j=0;j<nl;j++)vB(it,YX+x,.3+j*.09,-2,1.2,.07,2.4,0,xC(0xffffff).multiplyScalar(.9+.1*xsU(12,i,j)));});
 for(const x of[-5.5,5.5])for(const z of[-5,1])xnXSCol(YX+x,0,z,7,0,{S,s:.36});
 for(const z of[-5,1])xnXSBeam([YX-5.5,z],[YX+5.5,z],7.4,{S});for(const x of[-5.5,5.5])xnXSBeam([YX+x,-5],[YX+x,1],7.4,{S});xnXSBeam([YX-5.5,-2],[YX+5.5,-2],7.4,{S,h:.5});
 vB('xsBronzeB',YX+1.5,6.45,-2,1,.45,.8,0,br);beam('xsCable',[YX+1.5,6.45,-2],[YX+1.5,3.55,-2],.015,.015,xC(XS.cable));vBall('xsBall',YX+1.5,3.5,-2,.14,br);
 vB('xsPanel',YX+1.5,2.2,-2,2.4,1.2,.07,0,xC(S.a));
 vnReg("Salvagers' Guildhall",HX,0,12,12);vnReg("Salvagers' Guildhall — panel yard",YX,-2,7,8);vnFolk(HX,D/2+5,3,4);vnFolk(YX,4,2,3);}
XA.def({key:'xa_scrap_guild_salvage',name:"Salvagers' Guildhall",family:'Scrap: guilds and stores',tags:XS_TAG(['civic','industry'],'civic'),w:36,d:22,h:14,fw:35,fd:20,nv:3,eye:[-4,24,-4,0],build:buildXaScrapGuildSalvage});

/* ---------------------------------------------------------------- 12. Merchants' Guildhall (a hall of glazed bays under a glass dome) */
function buildXaScrapGuildHall(G,o){reseed(33111+(o.v|0));XS_SEED=33111+(o.v|0);const V=xV(o),S=xsS(V),lit=xLit(),W=18,D=15;
 const wash=xC(xPick(XPAL.wash)),dark=xC(XPAL.dark[0]),stone=xC(xPick(XPAL.stone));
 vB('vStone',0,0,0,W+2,.6,D+2,0,stone);xnFlight(0,0,D/2+1+1.36,0,4,.6,'vStone',stone);
 const k=xnWall(0,.6,0,W,3.8,D,0,wash,'wash'),Wu=W*k-.2,Du=D*k-.2;xnBand(0,4.4,0,W*k,D*k,0,.5,null,{gold:true});
 xnDoorway(0,.6,D/2,0,2.4,3.0,{c:dark});for(const s of[-1,1])xnXSCol(s*1.7,.6,D/2+.5,3.2,0,{S,s:.26});
 kput('xArcP',[0,3.8,D/2+.5],null,[3.6,1.0,.2],xC(S.frame[1]));
 for(const s of[-1,1])xnXSWin(s*5.5,1.6,D/2-.12,0,1.2,1.8,{S,arch:true,lit});
 const top=xnXSBlock(0,4.9,0,Wu,6.6,Du,0,{S,pat:XS_PATS[(V+3)%4],sh:3.3,win:{rows:[1,2],every:2,faces:[1,2,3]},lit});
 for(let s=0;s<2;s++)for(const x of[-5,0,5])xnXSBay(x,4.9+s*3.3+.5,Du/2+.08,0,2.8,2.2,.9,S,lit);
 xnXSRoof(0,top,0,Wu+.6,Du+.6,0,.3,S);
 xnXSLantern(0,top+.3,0,3.0,2.2,{n:12,dome:'glass',lit});
 for(const a of[-1,1])for(const b of[-1,1])xnXSPavilion(a*(Wu/2-1.5),top+.3,b*(Du/2-1.5),1.1,2.0,S,lit);
 vnReg("Merchants' Guildhall",0,0,10,19);vnFolk(0,D/2+5,4,4);}
XA.def({key:'xa_scrap_guild_hall',name:"Merchants' Guildhall",family:'Scrap: guilds and stores',tags:XS_TAG(['civic','market/shop'],'civic'),w:20,d:21,h:19,fw:20,fd:17,nv:3,eye:[4,30,0,3],build:buildXaScrapGuildHall});

/* ---------------------------------------------------------------- 13. Granary (bins of verdigris panels on a floor on girder stilts) */
function buildXaScrapGranary(G,o){reseed(33121+(o.v|0));XS_SEED=33121+(o.v|0);const V=xV(o),S=xsS(V),br=xC(XS.bronze),st=xC(S.steel),DY=2.4,n=V===1?3:4,R=2.1,L=n*5;
 const stone=xC(xPick(XPAL.stone));
 /* the stilts, each under a bronze rat-guard (the staddle's cap), the girder bearers, the deck */
 for(let i=0;i<=n*2;i++)for(const z of[-3,3]){const x=-L/2+i*L/(n*2);vB('vStone',x,0,z,.7,.3,.7,0,stone);kput('xsGirder',[x,.3+(DY-.3)/2,z],null,[.3,DY-.3,.3],st);kput('xsBronzeOct',[x,DY-.6,z],null,[.55,.08,.55],br);}
 for(const z of[-3,3])xnXSBeam([-L/2-.3,z],[L/2+.3,z],DY,{S});vB('xsShellB',0,DY,0,L+1,.25,7.6,0,xC(S.a).multiplyScalar(.85));
 /* the bins: drums of verdigris panels in bronze bands, panel caps, a bronze hatch to the gallery */
 for(let i=0;i<n;i++){const x=-L/2+5*(i+.5),y0=DY+.25,t=xnXSDrumFace(x,y0,0,R,6,{S,item:'xsPanelV',pat:V===2?'band':null});
  xnXSDome(x,t,0,R*1.03,'panel',{S,rise:.55,ribs:8,fin:1.0});vB('xsBronzeB',x,y0+.3,R+.08,.9,1.2,.06,0,br);}
 xnXSRail([-L/2-.5,3.75],[L/2+.5,3.75],DY+.25,{S});xnXSRail([-L/2-.5,-3.75],[L/2+.5,-3.75],DY+.25,{S});
 xnFlight(L/2+.5+5.44,0,2.0,Math.PI/2,1.4,DY+.25,'vStone',stone);
 vnSacks(-L/2+2,0,5.6,5);vnSacks(L/2-3,0,5.6,3);vnCrate(1,0,5.8,.9,.3);
 vnReg('Granary',0,0,L/2+2,DY+9);vnFolk(0,6.5,2,4);}
XA.def({key:'xa_scrap_granary',name:'Granary',family:'Scrap: guilds and stores',tags:XS_TAG(['infrastructure','farm'],'civic'),w:32,d:13,h:12,fw:22,fd:8,nv:3,build:buildXaScrapGranary});

/* ---------------------------------------------------------------- 14. Storehouse (the town's food and goods store) */
function buildXaScrapStore(G,o){reseed(33131+(o.v|0));XS_SEED=33131+(o.v|0);const V=xV(o),S=xsS(V),lit=xLit(),W=22,D=11,br=xC(XS.bronze);
 const wash=xC(xPick(XPAL.wash)),dark=xC(XPAL.dark[0]);
 const k=xnWall(0,0,0,W,4.2,D,0,wash,'wash'),Wu=W*k-.2,Du=D*k-.2;xnBand(0,4.2,0,W*k,D*k,0,.45);
 for(const x of[-7,0,7]){xnDoorway(x,0,D/2,0,2.4,3.0,{c:dark});for(const s of[-1,1])xnXSCol(x+s*1.6,0,D/2+2.2,3.4,0,{S,s:.24});
  vB('xsShellB',x,3.4,D/2+1.1,4,.16,2.4,0,xC(S.b));}
 const top=xnXSBlock(0,4.65,0,Wu,3,Du,0,{S,pat:'stripe',win:{rows:[1,2],every:4},lit});xnXSRoof(0,top,0,Wu+.6,Du+.6,0,.3,S);
 /* the cowls: the store breathes through a row of bronze ventilators on panel drums */
 for(let i=0;i<5;i++){const x=-8+i*4;kput('xsDrumW',[x,top+.3,0],null,[.36,.9,.36],xC(S.a));kput('xsBulbB',[x,top+1.2,0],null,[.46,.55,.46],br);}
 /* the hoist: a girder jib over the middle door, its block and its line */
 kput('xsGirderX',[0,top-.6,Du/2+1.0],qEuler(0,Math.PI/2,0),[2.2,.4,.25],xC(S.steel));vBall('xsBall',0,top-.95,Du/2+1.8,.16,br);
 beam('xsCable',[0,top-1.0,Du/2+1.8],[0,1.2,Du/2+1.8],.012,.012,xC(XS.cable));vnSacks(0,0,D/2+1.9,2);
 for(let i=0;i<4;i++)vnBarrel(-9.5+i*.9,0,D/2+3.4,.36,.95,xC(0x8a6a48));vnSacks(-4,0,D/2+3.2,4);vnCrate(4.4,0,D/2+3,1.0,.2);vnCrate(5.6,0,D/2+3.3,.9,-.2);vnSacks(9,0,D/2+3.1,3);
 vnReg('Storehouse',0,0,11,10);vnFolk(0,D/2+5,3,6);}
XA.def({key:'xa_scrap_store',name:'Storehouse',family:'Scrap: guilds and stores',tags:XS_TAG(['infrastructure','market/shop'],'civic'),w:24,d:17,h:10,fw:22.4,fd:11.4,nv:3,build:buildXaScrapStore});

/* ---------------------------------------------------------------- 15. Bathhouse (a hammam: domes of panels set with glass eyes) */
function buildXaScrapBath(G,o){reseed(33141+(o.v|0));XS_SEED=33141+(o.v|0);const V=xV(o),S=xsS(V),lit=xLit(),CZ=1,HZ=-9;
 const wash=xC(xPick(XPAL.wash)),dark=xC(XPAL.dark[0]);
 /* the changing hall: a battered cube, a drum, a great panel dome set with three rings of glass eyes */
 const k=xnWall(0,0,CZ,12,6,12,0,wash,'wash'),cw=12*k;xnBand(0,6,CZ,cw,cw,0,.5);xnXSRoof(0,6.5,CZ,cw+.4,cw+.4,0,.3,S);
 kput('xsDrumW',[0,6.8,CZ],qEuler(0,Math.PI/16,0),[4.6,1.2,4.6],xC(S.b));
 const R=4.5,H=R*.95;xnXSDome(0,8.0,CZ,R,'panel',{S,ribs:12});xnXSEyes(0,8.0,CZ,R,H,[.32,.55,.74],[14,12,8]);
 xnDoorway(0,0,CZ+6,0,2.2,2.8,{c:dark});kput('xArcP',[0,2.85,CZ+6.05],null,[3.0,1.1,.16],xC(S.frame[1]));
 for(const s of[-1,1])xnXSWin(s*3.6,1.4,CZ+6-.15,0,1.1,1.7,{S,arch:true,lit,kind:'frosted'});
 /* the porch: dressed girders, a lintel, a panel canopy */
 const az=CZ+7.8;for(const x of[-4.5,-1.5,1.5,4.5])xnXSCol(x,0,az,3.6,0,{S,s:.3});xnXSBeam([-5,az],[5,az],4.0,{S});
 vB('xsShellB',0,3.95,(CZ+6+az)/2+.15,10.4,.25,az-CZ-6+.9,0,xC(S.a).multiplyScalar(.85));xnXSRail([-5,az+.2],[5,az+.2],4.2,{S});
 /* the hot rooms behind: a long low block under two smaller eyed domes; the furnace and its chimney at the back */
 vB('xWashB',0,0,HZ,16,4.4,8,0,wash);xnBand(0,4.4,HZ,16,8,0,.4);xnXSRoof(0,4.8,HZ,16.4,8.4,0,.3,S);
 for(const s of[-1,1]){kput('xsDrumW',[s*4,5.1,HZ],qEuler(0,Math.PI/16,0),[2.5,.6,2.5],xC(S.b));xnXSDome(s*4,5.7,HZ,2.4,'panel',{S,ribs:8});xnXSEyes(s*4,5.7,HZ,2.4,2.28,[.4,.68],[8,5]);}
 vB('xWashB',5.5,0,HZ-5.5,4,3,3,0,wash);vnChimney(5.5,3,HZ-5.5,5,.4,false);vB('vStone',2.6,0,HZ-6,1.4,1.0,1.6,0,xC(XS.stone));
 xnXSPool(0,0,CZ+12,7,3.6,0,{S});
 vnReg('Bathhouse',0,CZ,7,15);vnReg('Bathhouse — hot rooms',0,HZ,8.5,9);vnFolk(0,CZ+15.5,3,4);}
XA.def({key:'xa_scrap_bath',name:'Bathhouse',family:'Scrap: civic',tags:XS_TAG('civic','civic'),w:18,d:34,h:15,fw:16.4,fd:30,nv:3,eye:[3,27,0,3],build:buildXaScrapBath});
