// ---------------------------------------------------------------- vessel: cFlīt-qBōn Fast Crab-Claw Scout Trimaran
// Razor-sleek pelagic scout and drift-timber recovery trimaran of the cFlīt-qBōn: a knife-narrow bitumen-tarred
// red-cypress central vaka hull sheathed with a gleaming Paktong white-copper cutwater, twin curved laminated aka
// cross-booms carrying wave-slicing ama outrigger floats, slatted wing-decks, a high-aspect catechu-red crab-claw
// speed sail, and a geared Paktong bow harpoon-capstan for snagging megatsunami-uprooted giant red-cypress trunks.
function rsArkScoutClaw(g,W,H,P){
 rsCloth(g,W,H,'#962f1d',11,'v');g.save();rsPolyPath(g,P);g.clip();
 for(let i=0;i<32;i++){g.fillStyle=`rgba(48,12,8,${.04+.05*(i%2)})`;g.fillRect(0,H*i/32,W,H/64);}
 g.strokeStyle='rgba(44,12,8,.45)';g.lineWidth=2;
 for(let k=1;k<10;k++){g.beginPath();g.moveTo(0,H*(1-k/10));g.lineTo(W,H*(1-k/10)-H*.42);g.stroke();}
 g.strokeStyle='#1d5840';g.lineWidth=W*.044;rsPolyPath(g,P);g.stroke();
 g.strokeStyle='#e4ded2';g.lineWidth=W*.016;rsPolyPath(g,rsInset(P,W*.035));g.stroke();
 // Twin swift-current chevrons + jade eye-ring
 const n0=P.length/2,ta=P[0],tm=[(P[n0-1][0]+P[n0][0])/2,(P[n0-1][1]+P[n0][1])/2];
 const cx=lerp(ta[0],tm[0],.48),cy=lerp(ta[1],tm[1],.5),R=Math.min(W,H)*.14;
 g.strokeStyle='#e4ded2';g.lineWidth=R*.16;
 for(const off of[-R*.38,R*.28]){g.beginPath();g.moveTo(cx-R*.65,cy+off+R*.35);g.lineTo(cx,cy+off-R*.35);g.lineTo(cx+R*.65,cy+off+R*.35);g.stroke();}
 g.fillStyle='#2ca06d';g.beginPath();g.arc(cx,cy-R*.72,R*.2,0,TAU);g.fill();
 g.restore();
 const n=P.length/2,a=P[n-1],b=P[n],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,d=Math.hypot(a[0]-b[0],a[1]-b[1]);
 g.globalCompositeOperation='destination-out';g.beginPath();g.arc(mx+d*.3,my-d*.1,d*.36,0,TAU);g.fill();g.globalCompositeOperation='source-over';
}
function buildRsArkScoutTri(){reseed(74400);
 if(!RSMAT.tarwood||!RSMAT.jade){
  const tTar=rsNoiseTex('extTar',256,256,(g,W,H)=>{g.fillStyle='#c4bdb2';g.fillRect(0,0,W,H);for(let r=0;r<16;r++){const y=r*H/16,v=175+h3(r,2,9)*45|0;g.fillStyle=`rgb(${v},${v-4},${v-10})`;g.fillRect(0,y,W,H/16-2);g.fillStyle='rgba(20,16,12,.65)';g.fillRect(0,y+H/16-2,W,2);}rsSpeckle(g,W,H,900,.12,true);});
  const tMet=rsNoiseTex('extPak',256,256,(g,W,H)=>{g.fillStyle='#dcdad4';g.fillRect(0,0,W,H);for(let i=0;i<90;i++){const y=h3(i,4,1)*H;g.strokeStyle=`rgba(90,92,96,${.05+.07*h3(i,2,3)})`;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}rsSpeckle(g,W,H,500,.06,true);});
  const tJad=rsNoiseTex('extJad',256,256,(g,W,H)=>{g.fillStyle='#c8d4cc';g.fillRect(0,0,W,H);rsSpeckle(g,W,H,600,.08,true);});
  const tRope=rsNoiseTex('extRop',128,128,(g,W,H)=>{g.fillStyle='#d6ceb8';g.fillRect(0,0,W,H);for(let i=-H;i<W+H;i+=8){g.strokeStyle='rgba(60,44,24,.28)';g.lineWidth=3;g.beginPath();g.moveTo(i,0);g.lineTo(i+H,H);g.stroke();}});
  if(!RSMAT.tarwood)rsDefMat('tarwood',new THREE.MeshStandardMaterial({map:tTar,vertexColors:true,roughness:.74,side:DS}));
  if(!RSMAT.paktong)rsDefMat('paktong',new THREE.MeshStandardMaterial({map:tMet,vertexColors:true,metalness:.82,roughness:.28,side:DS}));
  if(!RSMAT.jade)rsDefMat('jade',new THREE.MeshStandardMaterial({map:tJad,vertexColors:true,metalness:.06,roughness:.24,side:DS}));
  if(!RSMAT.metal.map){RSMAT.metal.map=tMet;RSMAT.metal.needsUpdate=true;}
  if(!RSMAT.rope.map){RSMAT.rope.map=tRope;RSMAT.rope.needsUpdate=true;}
 }
 if(!RSMAT.foamT){
  const tFoam=rsNoiseTex('extFoam',128,128,(g,W,H)=>{g.fillStyle='#dceeee';g.fillRect(0,0,W,H);for(let i=0;i<220;i++){g.fillStyle=`rgba(255,255,255,${.2+.45*h3(i,3,8)})`;g.beginPath();g.arc(h3(i,1,2)*W,h3(i,5,4)*H,2+h3(i,7,6)*7,0,TAU);g.fill();}});
  rsDefMat('foamT',new THREE.MeshBasicMaterial({map:tFoam,color:0xe8f6f6,transparent:true,opacity:.44,depthWrite:false,side:DS}));
 }
 if(typeof KMAT!=='undefined'&&KMAT.bindMat)KMAT.bindMat('ringsea',RSMAT,{alias:{woodI:'wood',paktong:'metal'},tile:{metal:1,paktong:1,rope:1,tarwood:1,jade:1}});
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const CYP=rsLin(0x5a271b),CYPD=rsLin(0x381811),TAR=rsLin(0x161210),DECK=rsLin(0x906040),DRIFT=rsLin(0x6e2e1d);
 const PAK=rsLin(0xe0dad0),PAKD=rsLin(0xa8aca8),BRZ=rsLin(0xba8838),JADE=rsLin(0x227850),ROPE=rsLin(0xa8906a);
 const foamHull=(H,w)=>{const pts=[];for(let i=0;i<=40;i++){const u=i/40,hw=H.halfAt(u,0);if(hw>0)pts.push([u,hw]);}if(pts.length<2)return;
  const hF0=u=>clamp((0-H.yk(u))/(H.ys(u)-H.yk(u)),0,1);
  for(const s of[-1,1]){const g=rsGrid((a,v)=>{const k=Math.min(pts.length-1,Math.round(a*(pts.length-1))),u=pts[k][0],hw=pts[k][1];
   return[H.xAt(u,hF0(u)),.032,H.z0+s*(hw+.02+v*w*(.4+.6*Math.sin(Math.PI*a)))];},pts.length-1,1,(a,v)=>[a*6,v]);rsPut(B,'foamT',g,null,null,null,0xffffff);}};
 // Razor-sleek narrow central vaka hull (L = 16.4 m, B = 1.68 m)
 const HV=rsHull({L:16.4,B:1.68,fb:1.2,dr:.96,sheerF:.95,sheerA:.72,sp:2.6,pb:1.85,pa:2.0,q:.74,n:1.8,flare:.12,rakeF:1.25,rakeA:.75,keelEnd:.22,z0:0});
 rsHullMesh(B,HV,'tarwood',(u,h)=>h>.9?PAKD:h>.82?CYP:h<.38?TAR:CYPD,60,10);
 foamHull(HV,.45);
 const dY=rsDeck(B,HV,{bw:.16,mk:'wood',col:DECK});
 const yD0=dY(.5);
 rsWale(B,HV,.89,.05,'paktong',PAK,.03,.97);
 const pb=HV.pt(1,0,1),pa=HV.pt(0,0,1);
 rsSpine(B,HV,.115,PAK,[[pb[0]+.45,pb[1]+.36],[pb[0]+.88,pb[1]+.78]],[[pa[0]-.28,pa[1]+.42]],'paktong');
 for(const s of[-1,1]){
  const p1=HV.pt(.85,s,.94),n1=HV.nrm(.85,s,.94),p2=HV.pt(.94,s,.96),n2=HV.nrm(.94,s,.96);
  rsTube(B,'paktong',[[p1[0]+n1.x*.033,p1[1]+n1.y*.033,p1[2]+n1.z*.033],[p2[0]+n2.x*.033,p2[1]+n2.y*.033,p2[2]+n2.z*.033],[pb[0]+.46,pb[1]+.38,s*.04],[pb[0]+.84,pb[1]+.74,0]],t=>lerp(.046,.03,t),PAK,9,6);
  const q1=HV.pt(.11,s,.93),m1=HV.nrm(.11,s,.93);
  rsTube(B,'paktong',[[q1[0]+m1.x*.032,q1[1]+m1.y*.032,q1[2]+m1.z*.032],[pa[0]-.26,pa[1]+.39,0]],t=>lerp(.042,.028,t),PAKD,6,6);
 }
 // Gleaming Paktong wave-slicing cutwater sheath (+0.032 m along hull normal)
 {const shG=rsGrid((u,v)=>{const uu=lerp(.74,.996,u),s=v<.5?-1:1,hh=lerp(.04,.86,1-Math.abs(v*2-1)*.92);
  const p=HV.pt(uu,s,hh),N=HV.nrm(uu,s,hh);return[p[0]+N.x*.032,p[1]+N.y*.032,p[2]+N.z*.032];},14,10,(u,v)=>[u*1.8,v*1.4]);
  rsPut(B,'paktong',shG,null,null,null,PAK);}
 // Twin Ama Outrigger Floats at z = +-4.45 m (fb = 0.32 < deckY - 0.8 so boarders step cleanly past them onto the wing-deck!)
 const zAma=4.45;
 for(const s of[-1,1]){
  const FA=rsHull({L:11.6,B:.64,fb:.32,dr:.3,sheerF:.28,sheerA:.22,sp:2.4,pb:1.9,pa:2.0,q:.68,n:1.9,rakeF:.65,rakeA:.4,keelEnd:.06,z0:s*zAma});
  rsHullMesh(B,FA,'tarwood',(u,h)=>h>.82?PAKD:h<.4?TAR:CYP,36,8);
  foamHull(FA,.28);
  const fp=FA.pt(1,0,1),faA=FA.pt(0,0,1);
  rsSpine(B,FA,.065,PAK,[[fp[0]+.28,fp[1]+.18]],[[faA[0]-.16,faA[1]+.12]],'paktong');
 }
 // Three Curved Laminated Red-Cypress Aka Cross-Booms (x = -3.8, 0, +3.8) + Saddle-Knees + Wing-Deck Walkways
 const yWing=HV.ys(.5)+.18;
 for(const xk of[-3.8,0,3.8]){
  rsBox(B,'paktong',[.36,.22,1.02],[xk,yWing-.04,0],null,PAKD,1);
  const uK=HV.uAt(xk);
  for(const s of[-1,1]){
   rsTube(B,'wood',[[xk,yWing,.32*s],[xk,yWing+.18,s*1.85],[xk,yWing-.08,s*3.35],[xk,.42,s*zAma]],t=>lerp(.105,.075,t),CYP,18,8);
   const pVk=HV.pt(uK,s,.68),nVk=HV.nrm(uK,s,.68);
   rsLink(B,'paktong',[pVk[0]+nVk.x*.03,pVk[1]+nVk.y*.03,pVk[2]+nVk.z*.03],[xk,yWing+.08,s*1.05],.038,PAKD,6);
   rsBox(B,'paktong',[.32,.14,.34],[xk,.32,s*zAma],null,PAKD,1);
   rsBox(B,'rope',[.24,.22,.26],[xk,.46,s*zAma],null,ROPE,.8);
   rsLink(B,'paktong',[xk,yWing-.02,s*2.35],[xk,.48,s*zAma],.032,PAKD,5);
   for(const dx of[-.42,.42])rsLink(B,'wood',[xk+dx,.28,s*zAma],[xk,.56,s*(zAma-.28)],.032,CYP,5);
  }
 }
 // Walkable slatted wing-platform (z in [-2.35, +2.35], x in [-3.95, +3.95], lifted at yWing + 0.14 -> zero coplanarity!)
 const thW=.065,yWD=yWing+.14+thW;
 for(const s of[-1,1])rsBox(B,'wood',[8.2,.12,.14],[0,yWing+.06,s*2.32],null,CYPD,2);
 for(let i=0;i<15;i++){
  const xw=lerp(-3.72,3.72,i/14);
  rsBox(B,'wood',[.42,thW,4.52],[xw,yWing+.14+thW/2,0],null,new THREE.Color(DECK).offsetHSL(0,0,rr(-.02,.02)),2);
 }
 // Outboard woven net trampolines between wing-platform and ama floats (z in [2.48, 4.18], lifted clear)
 for(const s of[-1,1]){
  rsLink(B,'wood',[-3.8,yWing-.08,s*4.12],[3.8,yWing-.08,s*4.12],.045,CYP,6);
  const netG=rsGrid((u,v)=>{const xx=lerp(-3.62,3.62,u),zz=s*lerp(2.46,4.04,v),yy=lerp(yWing+.04,yWing-.08,v)-Math.sin(Math.PI*u)*Math.sin(Math.PI*v)*.06;
   return[xx,yy,zz];},12,6,(u,v)=>[u*5,v*3]);
  rsPut(B,'cloth',netG,null,null,null,ROPE);
 }
 // Bow Paktong & Bronze Harpoon-Capstan + Swivel Drift-Timber Snagging Grapnel Launcher (x = 5.45, z = 0)
 {const cx=5.45,cy=dY(HV.uAt(cx))+.008;
  rsBox(B,'paktong',[.86,.14,.76],[cx,cy+.07,0],null,PAKD,1);
  // Geared capstan drum wound with heavy braided tow-hawser
  rsCyl(B,'bronze',.24,.28,.54,[cx-.18,cy+.42,0],null,BRZ,12);
  rsCyl(B,'rope',.27,.27,.32,[cx-.18,cy+.42,0],null,ROPE,12);
  for(let k=0;k<4;k++){const a=k*Math.PI/2+.4;rsLink(B,'wood',[cx-.18+Math.cos(a)*.22,cy+.64,Math.sin(a)*.22],[cx-.18+Math.cos(a)*.55,cy+.64,Math.sin(a)*.55],.028,CYP,5);}
  // Forward swivel fork + heavy barbed Paktong timber-snagging harpoon
  rsCyl(B,'paktong',.07,.09,.56,[cx+.32,cy+.42,0],null,PAK,8);
  const ha=[cx-.05,cy+.74,0],hb=[cx+1.75,cy+.98,0];
  rsLink(B,'paktong',ha,hb,.042,PAK,8,.026);
  rsCone(B,'paktong',.095,.36,[cx+1.9,cy+1.0,0],[0,0,-Math.PI/2+.13],PAK,6);
  for(const s of[-1,1])rsCone(B,'paktong',.045,.24,[cx+1.66,cy+.96,s*.08],[s*.5,0,Math.PI*.72],PAKD,5);
  rsPut(B,'jade',rsUV(new THREE.TorusGeometry(.11,.028,6,12),.6),[cx-.08,cy+.74,0],[0,Math.PI/2,0],null,JADE);
  // Coiled tow-line connected to salvaged giant red-cypress drift-timber trunk lashed alongside port aka!
  rsPut(B,'rope',rsUV(new THREE.TorusGeometry(.34,.08,8,16),1),[4.65,cy+.09,-.38],[Math.PI/2,0,0],null,ROPE);
 }
 // Salvaged Megatsunami-Uprooted Giant Red-Cypress Drift-Timber Trunk lashed outboard to port aka brackets (z = -2.95 m, floating in sea!)
 {const lx=-.35,lz=-2.95,ly=.08;
  rsTube(B,'wood',[[lx-4.2,ly-.04,lz-.08],[lx-1.4,ly+.05,lz+.06],[lx+1.6,ly+.04,lz-.04],[lx+4.3,ly+.12,lz+.08]],t=>lerp(.42,.28,t),DRIFT,20,10);
  // Snagged root-flare burl at butt end + two rope lashings up to the port aka cross-booms
  for(let k=0;k<4;k++){const a=k*1.5+.3;rsLink(B,'wood',[lx-4.0,ly,lz],[lx-4.75,ly+Math.sin(a)*.38,lz+Math.cos(a)*.42],.11,CYPD,6,.04);}
  for(const xk of[-3.8,3.8]){
   rsPut(B,'rope',rsUV(new THREE.TorusGeometry(.39,.035,6,14),.8),[xk*.85,ly+.04,lz],[0,Math.PI/2,0],null,ROPE);
   rsRope(B,[xk*.85,ly+.38,lz],[xk,yWing-.04,-2.35],.028,ROPE);
  }
 }
 // Raked Single Catechu-Red Crab-Claw Speed Sail (stepped at x = 1.15, z = 0, H = 14.2 m)
 {const mx=1.15,mh=12.6,foot=[mx,yWD-.06,0],head=[mx+1.1,yWD+mh*.64,0];
  rsBox(B,'paktong',[.48,.32,.48],[mx,yWD+.17,0],null,PAKD,1);
  rsLink(B,'wood',foot,head,.145,CYP,8,.095);
  rsRig(B,[foot,head],{gain:.75});
  const S=rsSail(B,{key:'ark-scout-claw',O:[5.9,dY(HV.uAt(5.9))+.42,0],U:[-1,0,0],V:[0,1,0],belly:.88,nu:22,nv:12,
   A:t=>[t*9.8+Math.sin(Math.PI*t)*.95,t*mh],
   Bf:t=>[t*11.2,t*mh*.28+Math.sin(Math.PI*t)*.72],draw:rsArkScoutClaw});
  rsSailEdge(B,S,0,.095,CYP,0,1.04,'wood');
  rsSailEdge(B,S,1,.082,CYP,0,1.03,'wood');
  rsRope(B,[head[0],head[1]-.08,0],S.at(.36,0),.028,ROPE);
  rsRope(B,S.at(.78,1),[-3.5,yWD+.2,1.25],.024,ROPE);
  rsPennant(B,S.at(1.04,0),2.6,.24,[JADE,PAK,rsLin(0x962f1d)]);
  rsPennant(B,S.at(1.03,1),1.7,.16,[PAK,JADE]);
  rsRigEnd(B);
  rsRope(B,head,[pb[0]+.4,pb[1]+.4,0],.024,ROPE);
  for(const s of[-1,1])rsRope(B,head,[0,.5,s*zAma],.025,ROPE);
 }
 // High-aspect kick-up Paktong stern rudder in faired twin rudder-cheeks & scout crew
 for(const s of[-1,1])rsBox(B,'tarwood',[.62,.86,.055],[-8.02,HV.ys(.04)+.12,s*.085],null,CYP,1);
 for(const gy of[-.18,.28])rsBox(B,'paktong',[.72,.08,.24],[-7.96,HV.ys(.04)+gy,0],null,PAKD,1);
 rsBox(B,'paktong',[.52,1.85,.06],[-8.18,-.22,0],[0,0,.18],PAK,1);
 rsLink(B,'wood',[-8.05,HV.ys(.04)+.58,0],[-6.45,yWD+.55,0],.032,DECK,5);
 rsFigure(B,[4.85,dY(HV.uAt(4.85)),.25],0,JADE,false,0x6e4c36);
 rsFigure(B,[-2.35,yWD,1.15],0,rsLin(0x882c1c),false,0x6e4c36);
 rsFigure(B,[-5.85,dY(HV.uAt(-5.85)),0],Math.PI,PAKD,true,0x6e4c36);
 rsBake(B,V.group,'arkScoutTri');V.deckY=yWD;return V;
}
RS_VESSEL({key:'arkScoutTri',name:'cFlīt-qBōn Fast Crab-Claw Scout Trimaran',culture:'cflit-qbon',L:17,B:10,H:14.5,
 tags:{type:['scout','trimaran','salvage','outrigger'],propulsion:['sail','paddles'],hull:'trimaran',wealth:'common',crew:4,role:'fast open-swell scouting and snagging megatsunami-uprooted giant red-cypress drift-timber'},
 blurb:'Razor-sleek central hull with Paktong cutwater, curved aka outrigger floats, raked catechu-red crab-claw speed sail, bow harpoon-capstan and lashed giant red-cypress drift-timber.',build:buildRsArkScoutTri});
