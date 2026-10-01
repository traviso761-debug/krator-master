// ================================================================= YS MOCK — three houses: poor barnacle, middle pod, rich conch
// The first Hykkousoi builders, written to prove the kit (DESIGN §4): no box anywhere, every opening a hole with a lip,
// every shell rooted with a fillet, every house hollow with its floor, its room and the residence's three spots
// (DESIGN §7). The housing agent's set supersedes these in phase 2; the keys stay so the sheet can still show them.
reseed(30300);
// ---- poor: a barnacle colony. One large fluted cone cut on the slant, three smaller clustered against it; the door is a
// hole in the big one's flank, the top aperture is the vent and the smoke hole. Grey shell, no lamp (the lighting rule).
function buildHykMockPoor(G,o){reseed(30301+(o.v|0));const grey=()=>hC(hPick(HPAL.barnacle));
 const main={cx:0,cz:-.4,rb:3.2,rt:2.3,h:4.9,dir:Math.PI/2};const small=[{cx:3.4,cz:1.6,rb:1.7,rt:1.1,h:2.6},{cx:-3.1,cz:1.9,rb:1.5,rt:1.0,h:2.3},{cx:-2.2,cz:-3.3,rb:1.9,rt:1.3,h:3.0}];
 const bodies=[main].concat(small);
 for(const b of bodies){const col=grey();const L={H:b.h,cx:b.cx,cz:b.cz,yBase:-.4,rFn:y=>b.rb+(b.rt-b.rb)*Math.pow(y/b.h,.75),nu:44,nv:18,flute:{n:16,amp:.075,sharp:1.5},rings:{n:7,amp:.025},noise:{amp:.035,su:5,sv:1.2,seed:b.cx*3|0},tilt:{amp:.22,dir:b.dir!=null?b.dir:rng()*TAU},col};
  const ops=[];if(b===main){const d=hykLatheAt(L,Math.PI/2,1.3);ops.push({p:d.p,n:d.n,r:1.05,ky:1.25,kind:'door'});const w1=hykLatheAt(L,Math.PI/2+1.9,2.6),w2=hykLatheAt(L,Math.PI/2-1.9,2.4);ops.push({p:w1.p,n:w1.n,r:.42,kind:'window'},{p:w2.p,n:w2.n,r:.38,kind:'window'});}
  else if(rng()<.7){const w=hykLatheAt(L,Math.atan2(b.cz,b.cx)+rr(-.6,.6),b.h*.45);ops.push({p:w.p,n:w.n,r:.3,kind:'window'});}
  L.ops=ops;hykPut('hkBarn',hykLathe(L));
  const Li=Object.assign({},L,{rFn:y=>L.rFn(y)*.9,flip:true,col:hC(hPick(HPAL.barnacle),.85)});hykPut('hkIn',hykLathe(Li),true);
  hykPut('hkBarn',hykFlare([b.cx,-.35,b.cz],[0,1,0],b.rb*.98,b.rb*.32,{col}));
  // the lid: a domed plate over the tilted rim (the operculum), with the vent at its centre and its lip
  const hAt=th=>b.h*(1-L.tilt.amp*.5*(1+Math.cos(th-L.tilt.dir)));const rtAt=th=>L.rFn(hAt(th))*(1+L.flute.amp*Math.pow(.5+.5*Math.cos(L.flute.n*th),L.flute.sharp))*(1+L.rings.amp*Math.sin(L.rings.n*TAU));
  hykPut('hkBarn',hykSurf((u,v)=>{const th=u*TAU;const r=rtAt(th)*v;return [b.cx+r*Math.cos(th),L.yBase+hAt(th)+b.rt*.28*(1-v*v)-.04,b.cz+r*Math.sin(th)];},40,5,{col:hC(hPick(HPAL.barnacle),.9),flip:true,hole:(u,v)=>v<.22}));
  const vy=L.yBase+hAt(L.tilt.dir+Math.PI)*.5+hAt(L.tilt.dir)*.5+b.rt*.26;kput('hkLip',[b.cx,vy,b.cz],qEuler(Math.PI/2,0,0),[b.rt*.24,b.rt*.24,1.2],col);   // the vent
  for(const op of ops){if(op.kind==='door')hykDoor(op,{level:'ground'});else hykWin(op,{});}
  hykFloor(b.cx,b.cz,.02,b.rb*.86,{col:hC(hPick(HPAL.floor),.9)});}
 // the room is the big cone; the small ones are stores
 const room=hykRoom('bedroom',hykCirclePoly(main.cx,main.cz,main.rb*.84,14),.02,3.2,{doors:[[main.cx,main.cz+main.rb,2.1]],residence:true,wealth:.15});
 hykSpot(room,'bed',main.cx-.2,main.cz-1.4,0,2.1,1.0);hykSpot(room,'store',main.cx-1.8,main.cz+.5,Math.PI/2,1.2,.7);hykSpot(room,'food',main.cx+1.7,main.cz+.5,0,.8,.8);hykSpot(room,'hearth',main.cx+.1,main.cz+.2,0,.8,.8);
 hykReg('Barnacle hut',0,0,4.9,5.2);}
HYK.def({key:'mock_poor_barnacle',name:'Barnacle hut',family:'housing',row:'Housing — poor',w:10,d:10,h:5.6,tags:{type:['single-family dwelling'],wealth:'poor',lit:false},build:buildHykMockPoor});
// ---- middle: a pod house. A superellipsoid body with a smaller sleeping pod grown onto its side, a lens dome on the crown
// with a short spire, round lipped windows, a flared skirt into the ground. Cream shell, no lamp.
function buildHykMockMid(G,o){reseed(30311+(o.v|0));const col=hC(hPick(HPAL.shell)),col2=hC(hPick(HPAL.shellWarm));
 const A={a:4.3,b:3.7,c:4.1,e1:.86,e2:.9,nu:60,nv:30,noise:{amp:.022,su:4,sv:3,seed:5},col,hollow:{t:.07,col:hC(hPick(HPAL.shell),.9)},
  openings:[{th:0,el:-.08,r:1.15,ky:1.3,kind:'door'},{th:.9,el:.18,r:.52,kind:'window'},{th:-.9,el:.18,r:.5,kind:'window'},{th:Math.PI,el:.3,r:.55,kind:'window'},{th:.35,el:.95,r:.42,kind:'window'}]};
 const pa=hykPod(A);hykPut('hkShell',pa.geo);hykPut('hkIn',pa.inner,true);hykPut('hkShell',hykFlare([0,.0,0],[0,1,0],A.a*.96,1.6,{col}));
 for(const op of pa.openings){if(op.kind==='door')hykDoor(op,{level:'ground'});else hykWin(op,{});}
 hykFloor(0,0,.12,A.a*.86,{});
 // the sleeping pod, grown on the -x flank, rooted with its own fillet into the body
 const B={a:2.5,b:2.3,c:2.4,e1:.9,e2:.92,cy:1.9,nu:44,nv:24,noise:{amp:.03,su:4,sv:3,seed:9},col:col2,hollow:{t:.08,col:col2},openings:[{th:-Math.PI/2,el:.2,r:.45,kind:'window'},{th:-Math.PI/2+1.2,el:.5,r:.34,kind:'window'}]};
 const pb=hykPod(B);pb.geo.translate(-5.1,0,.6);hykPut('hkShell',pb.geo);pb.inner.translate(-5.1,0,.6);hykPut('hkIn',pb.inner,true);
 for(const op of pb.openings){op.p=[op.p[0]-5.1,op.p[1],op.p[2]+.6];hykWin(op,{});}
 hykPut('hkShell',hykFlare([-3.6,1.9,.6],[-1,0,0],2.1,1.1,{col:col2}));hykPut('hkShell',hykFlare([-5.1,0,.6],[0,1,0],2.3,.9,{col:col2}));
 hykFloor(-5.1,.6,.12,2.0,{});
 // the crown: a lens dome on a short drum, lenses set in rings, a spire finial
 const dy=pa.cy+A.b*.78;const D={H:1.9,cx:0,cz:0,yBase:dy,rFn:y=>1.9*Math.sqrt(Math.max(0,1-Math.pow(y/1.9,2.2)))+.05,nu:36,nv:12,rings:{n:3,amp:.03},col:col2};
 hykPut('hkShell',hykLathe(D));kput('hkLip',[0,dy+.02,0],qEuler(Math.PI/2,0,0),[2.05,2.05,1.1],col2);
 for(let ring=0;ring<2;ring++){const n=ring?6:10,y=ring?1.2:.55,r=D.rFn(y);for(let i=0;i<n;i++){const a=i/n*TAU+ring*.3;kput('hkLens',[r*Math.cos(a)*.98,dy+y,r*Math.sin(a)*.98],null,ring?.22:.27,hC(hPick(HPAL.lens)));}}
 hykPut('hkShell',hykLathe({H:2.4,cx:0,cz:0,yBase:dy+1.75,rFn:y=>.42*Math.pow(1-y/2.4,.8)+.03,nu:14,nv:8,flute:{n:7,amp:.14,sharp:1.3},twist:.9,col:col2}));
 // rooms: the hall (hearth, table, food) and the sleeping pod (bed, store)
 const hall=hykRoom('hall',hykCirclePoly(0,0,A.a*.82,16),.12,3.6,{doors:[[0,A.c,2.3]],wealth:.5});
 hykSpot(hall,'hearth',1.3,-1.6,0,1.0,1.0);hykSpot(hall,'table',-.4,-.3,0,1.4,1.4);hykSpot(hall,'food',2.4,.9,0,.8,.8);hykSpot(hall,'seat',-1.9,1.6,.4,1.2,.9);
 const bed=hykRoom('bedroom',hykCirclePoly(-5.1,.6,2.0,12),.12,2.6,{doors:[[-3.4,.6,1.0,'hall']],residence:true,wealth:.5});
 hykSpot(bed,'bed',-5.6,.5,Math.PI/2,2.1,1.0);hykSpot(bed,'store',-4.9,1.7,0,1.2,.7);hykSpot(bed,'food',-4.8,-.7,0,.8,.8);
 hykReg('Pod house',-1.2,0,7.2,8.2);}
HYK.def({key:'mock_mid_pod',name:'Pod house',family:'housing',row:'Housing — middle',w:14,d:11,h:9.6,tags:{type:['single-family dwelling'],wealth:'middle',lit:false},build:buildHykMockMid});
// ---- rich: a conch. A fluted log-spiral body whose flared lip is the porch and door, a nacre-lipped aperture, windows in
// the outer whorl, a lens-domed annex grown onto the flank, a shell-paved forecourt, glow-pearls either side of the door.
function buildHykMockRich(G,o){reseed(30321+(o.v|0));const col=hC(hPick(HPAL.nacre)),col2=hC(hPick(HPAL.coral));
 const C={R:3.3,turns:2.7,g:.78,flare:.32,apexLift:5.2,flute:{n:11,amp:.05},rings:{n:26,amp:.018},nu:240,nv:28,col};
 const pre=hykConch(C);   // a first pass only to find the opening points on the outer whorl
 const wins=[.80,.86].map(t=>{const Cc=pre.cen(t);const r=pre.rho(t);const C2=pre.cen(t+.002);const tx=C2[0]-Cc[0],tz=C2[2]-Cc[2];const L=Math.hypot(tx,tz)||1;const nx=tz/L,nz=-tx/L;   // outward from the whorl
  const chk=(Cc[0]+nx)*(Cc[0]+nx)+(Cc[2]+nz)*(Cc[2]+nz)>(Cc[0]-nx)*(Cc[0]-nx)+(Cc[2]-nz)*(Cc[2]-nz);const sx=chk?nx:-nx,sz=chk?nz:-nz;
  return {p:[Cc[0]+sx*r*.92,Cc[1]+r*.25,Cc[2]+sz*r*.92],n:[sx*.9,.35,sz*.9],r:.55,kind:'window'};});
 C.ops=wins;const sh=hykConch(C);hykPut('hkNacre',sh.geo);
 const Ci=Object.assign({},C,{R:C.R*.92,flip:true,col:hC(hPick(HPAL.shell),.92)});hykPut('hkIn',hykConch(Ci).geo,true);
 // the apex spire and the aperture
 const ap=sh.cen(0);hykPut('hkNacre',hykLathe({H:3.2,cx:ap[0],cz:ap[2],yBase:ap[1]-.6,rFn:y=>.9*Math.pow(1-y/3.2,.85)+.05,nu:16,nv:10,flute:{n:9,amp:.12,sharp:1.3},twist:.7,col}));
 // the septum: a nacre wall a metre inside the mouth, with the real door through it, so the porch is a porch and not a cave
 const A=sh.aperture;const Rt=C.R*1.22,dz=-1.1,dx=A.p[0],dy=A.p[1]-Rt*.42;const dr=1.15,dky=1.35;
 hykPut('hkNacre',hykSurf((u,v)=>{const th=u*TAU;const r=v*Rt;return [A.p[0]+r*Math.cos(th),A.p[1]+r*Math.sin(th),A.p[2]+dz];},44,5,{col:hC(hPick(HPAL.coral)),hole:(u,v,p)=>Math.pow(p[0]-dx,2)+Math.pow((p[1]-dy)/dky,2)<dr*dr*1.05}));
 hykDoor({p:[dx,dy,A.p[2]+dz],n:[0,0,1],r:dr,ky:dky},{level:'ground',nacre:true,depth:.7});
 kput('hkLipN',[A.p[0],A.p[1]-.2,A.p[2]+.3],qEuler(0,0,0),[A.r*.96,A.r*.96,A.r*1.4],col);   // the mouth's own lip
 // shoulder knobs along the body whorl: the shell's spines
 for(let t=.5;t<.965;t+=.038){const Cc=sh.cen(t),Cn=sh.cen(t+.002);const r=sh.rho(t);const ox=Cc[0]-(-sh.rho(1)*1.3),oz=Cc[2];const ol=Math.hypot(ox,oz)||1;
  const kx=Cc[0]+(ox/ol)*r*.72,ky2=Cc[1]+r*.78,kz=Cc[2]+(oz/ol)*r*.72;const s=r*.2;kput('hkBall',[kx,ky2,kz],qFacing([ox/ol,.6,oz/ol]),[s,s*.8,s*1.5],col);}
 for(const w of wins)hykWin(w,{nacre:true,lit:true});
 // the skirt into the forecourt, the forecourt, and the floor of the chamber
 for(const t of [.3,.55,.78,.97]){const Cc=sh.cen(t);const r=sh.rho(t);hykPut('hkNacre',hykFlare([Cc[0],.02,Cc[2]],[0,1,0],r*.96,r*.42,{col}));}
 hykPut('hkFloor',hykDisc(0,.03,6.5,6.8,{col:hC(hPick(HPAL.floor)),lobes:{n:11,amp:.06}}));
 const fl=[];for(let i=0;i<=10;i++){const t=.66+i/10*.34;const Cc=sh.cen(t);fl.push([Cc[0],Cc[2]]);}
 for(let i=0;i<=10;i++){const t=.66+i/10*.34;const Cc=sh.cen(t);const r=sh.rho(t)*.8;const C2=sh.cen(t+.002);const tx=C2[0]-Cc[0],tz=C2[2]-Cc[2];const L=Math.hypot(tx,tz)||1;hykFloor(Cc[0],Cc[2],.3,r,{nu:16});}
 // the annex: a lens dome grown onto the outer whorl, a nacre drum, lenses, a short spire
 const t0=.72;const Cc=sh.cen(t0);const rr0=sh.rho(t0);const C2=sh.cen(t0+.002);const tx=C2[0]-Cc[0],tz=C2[2]-Cc[2];const L=Math.hypot(tx,tz)||1;let nx=tz/L,nz=-tx/L;
 if((Cc[0]+nx)*(Cc[0]+nx)+(Cc[2]+nz)*(Cc[2]+nz)<(Cc[0]-nx)*(Cc[0]-nx)+(Cc[2]-nz)*(Cc[2]-nz)){nx=-nx;nz=-nz;}
 const ax=Cc[0]+nx*(rr0+1.9),az=Cc[2]+nz*(rr0+1.9);const DR=2.6,DH=2.4,DY=2.9;
 hykPut('hkNacre',hykLathe({H:DY,cx:ax,cz:az,yBase:0,rFn:y=>DR*(1+.06*Math.sin(y*2)),nu:36,nv:8,rings:{n:4,amp:.03},col:col2}));
 hykPut('hkNacre',hykLathe({H:DH,cx:ax,cz:az,yBase:DY,rFn:y=>DR*Math.sqrt(Math.max(0,1-Math.pow(y/DH,2.3)))+.05,nu:36,nv:12,col}));
 for(let i=0;i<9;i++){const a=i/9*TAU;const r=DR*.93;kput('hkLens',[ax+r*Math.cos(a),DY+.9,az+r*Math.sin(a)],null,.3,hC(hPick(HPAL.lens)));}
 hykPut('hkNacre',hykLathe({H:2.1,cx:ax,cz:az,yBase:DY+DH-.3,rFn:y=>.4*Math.pow(1-y/2.1,.8)+.03,nu:14,nv:8,flute:{n:7,amp:.14,sharp:1.3},twist:1.1,col}));
 hykPut('hkNacre',hykFlare([ax,0,az],[0,1,0],DR*.98,1.2,{col:col2}));hykPut('hkNacre',hykFlare([Cc[0]+nx*rr0*.96,1.4,Cc[2]+nz*rr0*.96],[nx,0,nz],1.6,1.3,{col:col2}));
 const dw=hykLatheAt({cx:ax,cz:az,yBase:0,rFn:y=>DR},Math.atan2(nz,nx),1.6);hykWin({p:dw.p,n:dw.n,r:.5,kind:'window'},{nacre:true,lit:true});
 hykFloor(ax,az,.12,DR*.88,{});
 // lamps either side of the door, one in the chamber
 hykLight(A.p[0]-A.r*.85,A.p[1]+.9,A.p[2]+.6,{r:.22,nacre:true});hykLight(A.p[0]+A.r*.85,A.p[1]+.9,A.p[2]+.6,{r:.22,nacre:true});
 const Cm=sh.cen(.84);hykLight(Cm[0],Cm[1]+sh.rho(.84)*.55,Cm[2],{r:.2,nacre:true});
 // rooms: the chamber (the outer whorl) and the annex hall
 const poly=[];for(let i=0;i<=8;i++){const t=.7+i/8*.29;const Cc3=sh.cen(t);const r=sh.rho(t)*.74;const C4=sh.cen(t+.002);const dx=C4[0]-Cc3[0],dz=C4[2]-Cc3[2];const Ld=Math.hypot(dx,dz)||1;poly.push([Cc3[0]+dz/Ld*r,Cc3[2]-dx/Ld*r]);}
 for(let i=8;i>=0;i--){const t=.7+i/8*.29;const Cc3=sh.cen(t);const r=sh.rho(t)*.74;const C4=sh.cen(t+.002);const dx=C4[0]-Cc3[0],dz=C4[2]-Cc3[2];const Ld=Math.hypot(dx,dz)||1;poly.push([Cc3[0]-dz/Ld*r,Cc3[2]+dx/Ld*r]);}
 const ch=hykRoom('bedroom',poly,.3,4.2,{doors:[[A.p[0],A.p[2]+.6,A.r*1.2]],residence:true,wealth:.9});
 const b1=sh.cen(.76),b2=sh.cen(.88),b3=sh.cen(.95);const bd=(t)=>{const a=sh.cen(t),b=sh.cen(t+.002);return Math.atan2(b[0]-a[0],b[2]-a[2]);};
 hykSpot(ch,'bed',b1[0],b1[2],bd(.76)+Math.PI/2,2.1,1.0);hykSpot(ch,'store',b2[0]+.9,b2[2],bd(.88),1.2,.7);hykSpot(ch,'food',b3[0]-1.1,b3[2]-.3,bd(.95),.8,.8);hykSpot(ch,'seat',b2[0]-1.0,b2[2]+.2,bd(.88),1.0,.9);
 const an=hykRoom('hall',hykCirclePoly(ax,az,DR*.84,14),.12,DY+DH*.6,{doors:[[Cc[0]+nx*(rr0+.4),Cc[2]+nz*(rr0+.4),1.2,'bedroom']],wealth:.9});
 hykSpot(an,'hearth',ax+nx*1.1,az+nz*1.1,0,1.0,1.0);hykSpot(an,'table',ax-nz*1.3,az+nx*1.3,0,1.3,1.3);hykSpot(an,'shrine',ax+nz*1.3,az-nx*1.3,Math.atan2(nx,nz),.9,.6);
 hykReg('Conch house',0,-1,9.5,9.8);}
HYK.def({key:'mock_rich_conch',name:'Conch house',family:'housing',row:'Housing — rich',w:19,d:17,h:10.5,tags:{type:['single-family dwelling'],wealth:'rich',lit:true},build:buildHykMockRich});
