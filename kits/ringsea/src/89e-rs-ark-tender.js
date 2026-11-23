// ---------------------------------------------------------------- vessel: cFlīt-qBōn Deep-Trench Vent-Harvester Tender
// Open-decked working catamaran of the cFlīt-qBōn rigged with a heavy red-cypress sheerlegs A-frame capstan crane over
// its stern/midships hoist well, suspending a weighted sawn-green-nephrite & cast-bronze deep-dive sled. Carries coiled
// 150 m braided trench lines, woven harvest baskets brimming with pale crystalline hydrothermal frost-coral and vivid
// yellow submarine volcanic sulfur, plus trailing "Hollow-Water" volcanic gas-plume sounding floats (sealed cedar and
// pumice density drums that sink instantly if rising submarine vent bubbles drop seawater density).
function rsArkTenderClaw(g,W,H,P){
 rsCloth(g,W,H,'#8e3120',10,'v');g.save();rsPolyPath(g,P);g.clip();
 g.strokeStyle='rgba(44,14,8,.42)';g.lineWidth=2;
 for(let k=1;k<8;k++){g.beginPath();g.moveTo(0,H*(1-k/8));g.lineTo(W,H*(1-k/8)-H*.36);g.stroke();}
 g.strokeStyle='#225640';g.lineWidth=W*.048;rsPolyPath(g,P);g.stroke();
 g.strokeStyle='#e0c832';g.lineWidth=W*.016;rsPolyPath(g,rsInset(P,W*.038));g.stroke();
 // Sounding plumb-line & vent-plume chevron mark
 const n0=P.length/2,ta=P[0],tm=[(P[n0-1][0]+P[n0][0])/2,(P[n0-1][1]+P[n0][1])/2];
 const cx=lerp(ta[0],tm[0],.5),cy=lerp(ta[1],tm[1],.5),R=Math.min(W,H)*.13;
 g.strokeStyle='#e2dcd0';g.lineWidth=R*.16;
 g.beginPath();g.moveTo(cx,cy-R*1.1);g.lineTo(cx,cy+R*.65);g.stroke();
 g.fillStyle='#2a845a';g.beginPath();g.moveTo(cx,cy+R*1.15);g.lineTo(cx+R*.55,cy+R*.45);g.lineTo(cx-R*.55,cy+R*.45);g.closePath();g.fill();
 g.restore();
 const n=P.length/2,a=P[n-1],b=P[n],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,d=Math.hypot(a[0]-b[0],a[1]-b[1]);
 g.globalCompositeOperation='destination-out';g.beginPath();g.arc(mx+d*.3,my-d*.1,d*.33,0,TAU);g.fill();g.globalCompositeOperation='source-over';
}
function buildRsArkDiveTender(){reseed(74300);
 if(!RSMAT.tarwood||!RSMAT.jade||!RSMAT.brick||!RSMAT.bone){
  const tTar=rsNoiseTex('extTar',256,256,(g,W,H)=>{g.fillStyle='#c4bdb2';g.fillRect(0,0,W,H);for(let r=0;r<16;r++){const y=r*H/16,v=175+h3(r,2,9)*45|0;g.fillStyle=`rgb(${v},${v-4},${v-10})`;g.fillRect(0,y,W,H/16-2);g.fillStyle='rgba(20,16,12,.65)';g.fillRect(0,y+H/16-2,W,2);}rsSpeckle(g,W,H,900,.12,true);});
  const tMet=rsNoiseTex('extPak',256,256,(g,W,H)=>{g.fillStyle='#dcdad4';g.fillRect(0,0,W,H);for(let i=0;i<90;i++){const y=h3(i,4,1)*H;g.strokeStyle=`rgba(90,92,96,${.05+.07*h3(i,2,3)})`;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}rsSpeckle(g,W,H,500,.06,true);});
  const tJad=rsNoiseTex('extJad',256,256,(g,W,H)=>{g.fillStyle='#c8d4cc';g.fillRect(0,0,W,H);for(let i=0;i<28;i++){g.strokeStyle=`rgba(245,255,248,${.08+.12*h3(i,6,2)})`;g.lineWidth=1+h3(i,3,7)*3;g.beginPath();let x=0,y=h3(i,1,5)*H;g.moveTo(x,y);for(let s=1;s<=8;s++){x=s*W/8;y+=Math.sin(s+i)*12;g.lineTo(x,y);}g.stroke();}rsSpeckle(g,W,H,600,.08,true);});
  const tBrk=rsNoiseTex('extBrk',256,256,(g,W,H)=>{g.fillStyle='#bfb6a6';g.fillRect(0,0,W,H);rsSpeckle(g,W,H,1100,.14,true);});
  const tBon=rsNoiseTex('extBon',256,256,(g,W,H)=>{g.fillStyle='#e2dcd0';g.fillRect(0,0,W,H);rsSpeckle(g,W,H,800,.09,true);});
  const tRope=rsNoiseTex('extRop',128,128,(g,W,H)=>{g.fillStyle='#d6ceb8';g.fillRect(0,0,W,H);for(let i=-H;i<W+H;i+=8){g.strokeStyle='rgba(60,44,24,.28)';g.lineWidth=3;g.beginPath();g.moveTo(i,0);g.lineTo(i+H,H);g.stroke();}});
  if(!RSMAT.tarwood)rsDefMat('tarwood',new THREE.MeshStandardMaterial({map:tTar,vertexColors:true,roughness:.74,side:DS}));
  if(!RSMAT.paktong)rsDefMat('paktong',new THREE.MeshStandardMaterial({map:tMet,vertexColors:true,metalness:.82,roughness:.28,side:DS}));
  if(!RSMAT.jade)rsDefMat('jade',new THREE.MeshStandardMaterial({map:tJad,vertexColors:true,metalness:.06,roughness:.24,side:DS}));
  if(!RSMAT.brick)rsDefMat('brick',new THREE.MeshStandardMaterial({map:tBrk,vertexColors:true,roughness:.88,side:DS}));
  if(!RSMAT.bone)rsDefMat('bone',new THREE.MeshStandardMaterial({map:tBon,vertexColors:true,roughness:.46,side:DS}));
  if(!RSMAT.metal.map){RSMAT.metal.map=tMet;RSMAT.metal.needsUpdate=true;}
  if(!RSMAT.rope.map){RSMAT.rope.map=tRope;RSMAT.rope.needsUpdate=true;}
 }
 if(!RSMAT.foamT){
  const tFoam=rsNoiseTex('extFoam',128,128,(g,W,H)=>{g.fillStyle='#dceeee';g.fillRect(0,0,W,H);for(let i=0;i<220;i++){g.fillStyle=`rgba(255,255,255,${.2+.45*h3(i,3,8)})`;g.beginPath();g.arc(h3(i,1,2)*W,h3(i,5,4)*H,2+h3(i,7,6)*7,0,TAU);g.fill();}});
  rsDefMat('foamT',new THREE.MeshBasicMaterial({map:tFoam,color:0xe8f6f6,transparent:true,opacity:.44,depthWrite:false,side:DS}));
 }
 if(typeof KMAT!=='undefined'&&KMAT.bindMat)KMAT.bindMat('ringsea',RSMAT,{alias:{woodI:'wood',paktong:'metal'},tile:{metal:1,paktong:1,rope:1,tarwood:1,jade:1,brick:1,bone:1}});
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const CYP=rsLin(0x522519),CYPD=rsLin(0x351811),TAR=rsLin(0x161311),DECK=rsLin(0x8a5b3e),BEAM=rsLin(0x482618);
 const PAK=rsLin(0xdcd6ca),PAKD=rsLin(0xa8aca8),BRZ=rsLin(0xb88636),JADE=rsLin(0x1f6e49),JADEL=rsLin(0x339668);
 const SULF=rsLin(0xe6c81e),SULFD=rsLin(0xc4a212),CORAL=rsLin(0xc8f0f6),PUMICE=rsLin(0xb8b2a6),ROPE=rsLin(0xa48c66);
 const foamHull=(H,w)=>{const pts=[];for(let i=0;i<=40;i++){const u=i/40,hw=H.halfAt(u,0);if(hw>0)pts.push([u,hw]);}if(pts.length<2)return;
  const hF0=u=>clamp((0-H.yk(u))/(H.ys(u)-H.yk(u)),0,1);
  for(const s of[-1,1]){const g=rsGrid((a,v)=>{const k=Math.min(pts.length-1,Math.round(a*(pts.length-1))),u=pts[k][0],hw=pts[k][1];
   return[H.xAt(u,hF0(u)),.035,H.z0+s*(hw+.02+v*w*(.4+.6*Math.sin(Math.PI*a)))];},pts.length-1,1,(a,v)=>[a*6,v]);rsPut(B,'foamT',g,null,null,null,0xffffff);}};
 // Twin nimble working hulls at z = +-3.15 m
 const hulls=[-3.15,3.15].map(z0=>{
  const H=rsHull({L:20.4,B:2.05,fb:1.3,dr:1.05,sheerF:1.0,sheerA:.82,sp:2.5,pb:2.2,pa:2.2,q:.64,n:2.05,flare:.12,rakeF:1.0,rakeA:.7,keelEnd:.24,z0});
  rsHullMesh(B,H,'tarwood',(u,h)=>h>.9?PAKD:h>.82?CYP:h<.38?TAR:CYPD,56,10);
  foamHull(H,.48);
  rsDeck(B,H,{bw:.2,mk:'tarwood',col:CYPD});
  rsWale(B,H,.88,.055,'paktong',PAK,.03,.97);
  const pb=H.pt(1,0,1),pa=H.pt(0,0,1);
  rsSpine(B,H,.12,PAK,[[pb[0]+.4,pb[1]+.35],[pb[0]+.72,pb[1]+.82]],[[pa[0]-.28,pa[1]+.45]],'paktong');
  for(const s of[-1,1]){
   const p1=H.pt(.86,s,.94),n1=H.nrm(.86,s,.94),p2=H.pt(.94,s,.96),n2=H.nrm(.94,s,.96);
   rsTube(B,'paktong',[[p1[0]+n1.x*.034,p1[1]+n1.y*.034,p1[2]+n1.z*.034],[p2[0]+n2.x*.034,p2[1]+n2.y*.034,p2[2]+n2.z*.034],[pb[0]+.42,pb[1]+.38,z0+s*.045],[pb[0]+.7,pb[1]+.78,z0]],t=>lerp(.048,.032,t),PAK,9,6);
   const q1=H.pt(.11,s,.93),m1=H.nrm(.11,s,.93);
   rsTube(B,'paktong',[[q1[0]+m1.x*.032,q1[1]+m1.y*.032,q1[2]+m1.z*.032],[pa[0]-.26,pa[1]+.42,z0]],t=>lerp(.044,.03,t),PAKD,6,6);
  }
  const shG=rsGrid((u,v)=>{const uu=lerp(.76,.995,u),s=v<.5?-1:1,hh=lerp(.04,.84,1-Math.abs(v*2-1)*.92);
   const p=H.pt(uu,s,hh),N=H.nrm(uu,s,hh);return[p[0]+N.x*.032,p[1]+N.y*.032,p[2]+N.z*.032];},12,10,(u,v)=>[u*1.8,v*1.4]);
  rsPut(B,'paktong',shG,null,null,null,PAK);
  return H;
 });
 // Crossbeams bridging hulls with an open stern/midships hoist well (x in [-5.4, -1.2], z in [-1.65, 1.65])
 const ySheer=hulls[1].ys(.5),yBeam=ySheer+.16,hBeam=.26,yBeamTop=yBeam+hBeam/2;
 for(const x of[-7.8,-5.55,-.95,1.8,4.6,7.4]){
  rsBox(B,'wood',[.3,hBeam,8.4],[x,yBeam,0],null,BEAM,2);
  for(const z0 of[-3.15,3.15])rsBox(B,'paktong',[.36,hBeam+.04,.42],[x,yBeam,z0],null,PAKD,1);
 }
 // Interrupted crossbeams at x = -3.25 flanking the hoist well
 for(const s of[-1,1]){
  rsBox(B,'wood',[.3,hBeam,2.35],[-3.25,yBeam,s*3.02],null,BEAM,2);
  rsBox(B,'paktong',[.36,hBeam+.04,.42],[-3.25,yBeam,s*3.15],null,PAKD,1);
 }
 const thDeck=.075,yDeckMid=yBeamTop+.006+thDeck/2,yD=yBeamTop+.006+thDeck;
 // Fore working deck (x in [-0.75, 7.55]), aft transom catwalk (x in [-7.9, -5.7]), and port/starboard hoist walkways
 for(let i=0;i<15;i++){const xf=lerp(-.72,7.52,i/14);rsBox(B,'wood',[.52,thDeck,6.0],[xf,yDeckMid,0],null,new THREE.Color(DECK).offsetHSL(0,0,rr(-.02,.02)),2);}
 for(let i=0;i<4;i++){const xa=lerp(-7.82,-5.82,i/3);rsBox(B,'wood',[.52,thDeck,6.0],[xa,yDeckMid,0],null,DECK,2);}
 for(let i=0;i<8;i++){const xw=lerp(-5.26,-1.28,i/7);for(const s of[-1,1])rsBox(B,'wood',[.5,thDeck,1.26],[xw,yDeckMid,s*2.37],null,DECK,2);}
 // Butt-joined hoist-well coaming & Paktong roller fairleads
 const hCoam=.34,yCoam=yD+.006+hCoam/2;
 for(const sx of[-5.48,-1.08])rsBox(B,'tarwood',[.18,hCoam,3.52],[sx,yCoam,0],null,CYPD,1.5);
 for(const sz of[-1,1])rsBox(B,'tarwood',[4.2,hCoam,.18],[-3.28,yCoam,sz*1.67],null,CYPD,1.5);
 rsCyl(B,'paktong',.09,.09,1.8,[-1.08,yCoam+.22,0],[Math.PI/2,0,0],PAK,10);
 // Sawn green nephrite coupling lugs on outer sides
 for(const s of[-1,1])for(const xh of[-5.55,4.6]){
  const zh=s*4.25;
  rsBox(B,'paktong',[.4,.28,.28],[xh,yBeam,zh-s*.08],null,PAKD,1);
  rsSphere(B,'jade',.19,[xh,yBeam,zh+s*.15],null,JADEL,10,8);
 }
 // Heavy Timber Sheerlegs A-Frame Capstan Crane over the hoist well + Apex Sheave Block + Windlass Drum
 const apex=[-3.55,yD+6.85,0];
 for(const s of[-1,1]){
  rsBox(B,'paktong',[.48,.22,.48],[-.85,yD+.118,s*2.42],null,PAKD,1);
  rsLink(B,'paktong',[-.35,yD+.05,s*2.42],[-1.05,yD+.82,s*2.26],.042,PAK,6);
  rsLink(B,'wood',[-.85,yD+.22,s*2.42],apex,.15,CYP,8,.105);
  rsLink(B,'wood',[-5.45,yD+.12,s*2.25],[lerp(-.85,apex[0],.58),lerp(yD+.22,apex[1],.58),s*2.42*.42],.095,BEAM,6);
  rsRope(B,apex,[4.5,yD+.15,s*2.65],.032,ROPE);
 }
 rsBox(B,'paktong',[.42,.4,.58],apex,null,PAK,1);
 for(const s of[-1,1])rsBox(B,'paktong',[.34,.48,.055],[apex[0],apex[1]-.36,s*.14],null,PAKD,1);
 rsCyl(B,'bronze',.21,.21,.16,[apex[0],apex[1]-.42,0],[Math.PI/2,0,0],BRZ,14);
 // Horizontal windlass capstan at x = 0.85 with spoked handspikes & coiled braided haul-cable
 for(const s of[-1,1])rsBox(B,'wood',[.32,1.05,.28],[.85,yD+.53,s*1.32],null,BEAM,1.5);
 rsCyl(B,'wood',.24,.24,2.36,[.85,yD+.78,0],[Math.PI/2,0,0],CYP,12);
 rsCyl(B,'rope',.29,.29,1.28,[.85,yD+.78,0],[Math.PI/2,0,0],ROPE,14);
 for(let k=0;k<4;k++){const a=k*Math.PI/2+.35;for(const s of[-1,1])rsLink(B,'wood',[.85+Math.cos(a)*.23,yD+.78+Math.sin(a)*.23,s*.92],[.85+Math.cos(a)*.65,yD+.78+Math.sin(a)*.65,s*.92],.032,DECK,5);}
 rsRope(B,[.85,yD+.98,0],[apex[0]+.18,apex[1]-.34,0],.035,ROPE);
 rsRope(B,[apex[0],apex[1]-.58,0],[-3.55,.92,0],.035,ROPE);
 // Hoisted Weighted Green-Nephrite & Cast-Bronze Deep-Dive Sled suspended in the open well (y = 0.42 m above sea)
 {const sx=-3.55,sy=.42;
  // Twin sawn emerald-nephrite hydro-ballast runners
  for(const s of[-1,1]){
   rsBox(B,'jade',[2.15,.18,.26],[sx,sy,s*.58],null,JADE,1);
   rsCone(B,'jade',.13,.38,[sx+1.26,sy+.03,s*.58],[0,0,-Math.PI/2],JADEL,6);
  }
  // Cast-bronze & Paktong cross-frame, diver footplate, hand-bar, and specimen cage
  for(const dx of[-.72,0,.72])rsBox(B,'bronze',[.14,.1,.92],[sx+dx,sy+.146,0],null,BRZ,1);
  rsBox(B,'paktong',[1.52,.05,.78],[sx-.08,sy+.228,0],null,PAKD,1);
  for(const s of[-1,1])rsLink(B,'bronze',[sx+.72,sy+.16,s*.48],[sx+.48,sy+.68,s*.38],.032,BRZ,6);
  rsLink(B,'paktong',[sx+.48,sy+.68,-.38],[sx+.48,sy+.68,.38],.034,PAK,6);
  // 4-point bridle up to hoist block
  rsSphere(B,'bronze',.12,[sx,sy+.92,0],null,BRZ,8,6);
  for(const dx of[-.65,.65])for(const s of[-1,1])rsRope(B,[sx,sy+.92,0],[sx+dx,sy+.16,s*.58],.02,ROPE);
 }
 // Coiled 150 m Braided Trench Lines on cedar reel-bollards (x = 2.6, z = +-2.15)
 for(const s of[-1,1]){
  const cx=2.6,cz=s*2.15;
  rsCyl(B,'wood',.14,.18,.72,[cx,yD+.368,cz],null,BEAM,8);
  for(let k=0;k<4;k++)rsPut(B,'rope',rsUV(new THREE.TorusGeometry(.44-k*.03,.085,8,18),1),[cx,yD+.095+k*.15,cz],[Math.PI/2,0,0],null,ROPE);
 }
 // Woven Harvest Baskets of Hydrothermal `frost-coral` (pale ice-cyan branches) & Bright Yellow Submarine `sulfur`
 for(const [bx,bz,isCoral] of[[2.2,-.95,true],[3.25,-.85,false],[2.35,1.02,false],[3.4,1.08,true]]){
  rsCyl(B,'thatch',.42,.32,.52,[bx,yD+.268,bz],null,rsLin(0x9a8052),12);
  rsPut(B,'rope',rsUV(new THREE.TorusGeometry(.43,.032,6,14),.8),[bx,yD+.51,bz],[Math.PI/2,0,0],null,ROPE);
  if(isCoral){
   for(let k=0;k<7;k++){
    const a=k*TAU/7+.3,r=.16*(k%2+.4);
    rsLink(B,'bone',[bx+Math.cos(a)*r*.5,yD+.46,bz+Math.sin(a)*r*.5],[bx+Math.cos(a)*(r+.14),yD+.82+(k%3)*.1,bz+Math.sin(a)*(r+.14)],.036,CORAL,5,.016);
   }
  }else{
   for(let k=0;k<6;k++){
    const a=k*TAU/6,r=k<5?.17:0;
    rsSphere(B,'brick',.15,[bx+Math.cos(a)*r,yD+.55+(k===5?.08:0),bz+Math.sin(a)*r],[1.1,.85,.95],k%2?SULF:SULFD,7,5);
   }
  }
 }
 // Trailing "Hollow-Water" Volcanic Gas-Plume Sounding Floats (sealed cedar & porous pumice density drums + telltale vanes)
 const soundFloat=(fx,fy,fz,inWater)=>{
  rsCyl(B,'tarwood',.26,.26,.78,[fx,fy,fz],[0,0,Math.PI/2],CYP,12);
  rsCyl(B,'brick',.275,.275,.26,[fx,fy,fz],[0,0,Math.PI/2],PUMICE,12);
  for(const dx of[-.26,.26])rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.27,.024,6,14),.8),[fx+dx,fy,fz],[0,Math.PI/2,0],null,PAK);
  rsLink(B,'wood',[fx,fy+.26,fz],[fx,fy+1.55,fz],.025,DECK,5);
  rsCyl(B,'jade',.15,.15,.035,[fx,fy+1.58,fz],[0,0,Math.PI/2],JADEL,12);
  if(inWater){
   const fg=rsGrid((a,v)=>{const ang=a*TAU,rr0=.34+v*.32;return[fx+Math.cos(ang)*rr0*1.3,.04,fz+Math.sin(ang)*rr0];},14,1,(a,v)=>[a*3,v]);
   rsPut(B,'foamT',fg,null,null,null,0xffffff);
  }
 };
 // Two live sounding floats trailing astern on outrigger tow-booms + one spare racked on the aft catwalk
 for(const s of[-1,1]){
  rsLink(B,'wood',[-7.7,yD+.22,s*2.1],[-10.6,.95,s*2.35],.055,CYP,6);
  rsRope(B,[-10.6,.95,s*2.35],[-11.35,.08,s*2.4],.022,ROPE);
  soundFloat(-11.45,.04,s*2.4,true);
 }
 soundFloat(-6.8,yD+.34,0,false);
 // Forward Compact Raked Crab-Claw Steadying Sail (x = 5.6, z = 0)
 {const mx=5.6,mh=10.6,foot=[mx,yD-.04,0],head=[mx+.85,yD+mh*.62,0];
  rsBox(B,'paktong',[.5,.32,.5],[mx,yD+.17,0],null,PAKD,1);
  rsLink(B,'wood',foot,head,.14,CYP,8,.095);
  rsRig(B,[foot,head],{gain:.55});
  const S=rsSail(B,{key:'ark-tender-claw',O:[8.8,yD+.42,0],U:[-1,0,0],V:[0,1,0],belly:.68,nu:18,nv:10,
   A:t=>[t*6.2+Math.sin(Math.PI*t)*.65,t*mh],
   Bf:t=>[t*6.8,t*mh*.32+Math.sin(Math.PI*t)*.55],draw:rsArkTenderClaw});
  rsSailEdge(B,S,0,.085,CYP,0,1.03,'wood');
  rsSailEdge(B,S,1,.075,CYP,0,1.02,'wood');
  rsRope(B,[head[0],head[1]-.08,0],S.at(.38,0),.026,ROPE);
  rsRope(B,S.at(.8,1),[1.6,yD+.38,1.15],.022,ROPE);
  rsPennant(B,S.at(1.03,0),1.9,.22,[SULF,JADEL,PAK]);
  rsRigEnd(B);
  for(const s of[-1,1])rsRope(B,head,[mx-.8,yBeam,s*3.25],.024,ROPE);
 }
 // Steering sweep & tender crew
 rsLink(B,'wood',[-8.2,hulls[1].ys(.08)+.3,3.45],[-11.4,-1.05,3.82],.095,CYP,6);
 rsBox(B,'paktong',[1.7,.72,.07],[-10.9,-.82,3.78],[0,0,.6],PAKD,1);
 for(const [px,pz,yaw,col] of[[.35,-1.55,0,JADE],[-2.6,2.35,-Math.PI/2,rsLin(0x822c1d)],[4.3,1.5,.4,PAKD],[-6.8,-1.8,Math.PI,JADE]])
  rsFigure(B,[px,yD,pz],yaw,col,false,0x6e4c36);
 rsBake(B,V.group,'arkDiveTender');V.deckY=yD;return V;
}
RS_VESSEL({key:'arkDiveTender',name:'cFlīt-qBōn Deep-Trench Vent-Harvester Tender',culture:'cflit-qbon',L:22,B:9.5,H:13,
 tags:{type:['workboat','diving tender','harvester'],propulsion:['sail','sweeps'],hull:'catamaran',wealth:'common',crew:8,role:'deep-trench hydrothermal sulfur & frost-coral harvesting and hollow-water gas-plume sounding'},
 blurb:'Open working catamaran with an A-frame capstan crane hoisting a green-nephrite & bronze dive sled, 150 m braided lines, baskets of frost-coral and yellow sulfur, and trailing hollow-water density sounding floats.',build:buildRsArkDiveTender});
