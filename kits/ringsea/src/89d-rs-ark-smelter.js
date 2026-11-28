// ---------------------------------------------------------------- vessel: cFlīt-qBōn Paktong Phytomining Smelt-Barge
// Heavy wide-beam twin-pontoon foundry catamaran of the cFlīt-qBōn: sheathed amidships in refractory volcanic tuff-brick
// slabs, carrying a domed Paktong white-copper & brick reverberatory smelt-furnace that burns dried blue-sap nickel-
// hyperaccumulating shrubs from The Arch (15-20% Ni bio-ore ash) smelted with copper and zinc into corrosion-proof
// Paktong alloy. Fitted with twin lever-operated oiled-hide & cedar deck bellows, a coopered water-quench trough,
// stacked bundles of blue-grey nickel-shrub fuel, gleaming white-copper ingot racks, and sawn nephrite side-hinges.
function rsArkSmeltClaw(g,W,H,P){
 rsCloth(g,W,H,'#72261a',10,'v');g.save();rsPolyPath(g,P);g.clip();
 // Soot-smoked top gradient from the smelt-furnace stack
 const gr=g.createLinearGradient(0,0,W*.8,H*.8);gr.addColorStop(0,'rgba(24,22,20,.42)');gr.addColorStop(.55,'rgba(24,22,20,.08)');gr.addColorStop(1,'rgba(0,0,0,0)');
 g.fillStyle=gr;g.fillRect(0,0,W,H);
 g.strokeStyle='rgba(40,14,10,.45)';g.lineWidth=2;
 for(let k=1;k<9;k++){g.beginPath();g.moveTo(0,H*(1-k/9));g.lineTo(W,H*(1-k/9)-H*.35);g.stroke();}
 g.strokeStyle='#344d56';g.lineWidth=W*.046;rsPolyPath(g,P);g.stroke();
 g.strokeStyle='#cfc8ba';g.lineWidth=W*.015;rsPolyPath(g,rsInset(P,W*.036));g.stroke();
 const n0=P.length/2,ta=P[0],tm=[(P[n0-1][0]+P[n0][0])/2,(P[n0-1][1]+P[n0][1])/2];
 const cx=lerp(ta[0],tm[0],.5),cy=lerp(ta[1],tm[1],.5),R=Math.min(W,H)*.13;
 // Crucible-and-ingot foundry mark in Paktong silver & nephrite green
 g.fillStyle='#dcd8cc';g.beginPath();g.moveTo(cx-R*.8,cy-R*.35);g.lineTo(cx+R*.8,cy-R*.35);g.lineTo(cx+R*.52,cy+R*.55);g.lineTo(cx-R*.52,cy+R*.55);g.closePath();g.fill();
 g.strokeStyle='#287c54';g.lineWidth=R*.16;g.beginPath();g.arc(cx,cy,R*1.12,0,TAU);g.stroke();
 g.restore();
 const n=P.length/2,a=P[n-1],b=P[n],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,d=Math.hypot(a[0]-b[0],a[1]-b[1]);
 g.globalCompositeOperation='destination-out';g.beginPath();g.arc(mx+d*.3,my-d*.1,d*.33,0,TAU);g.fill();g.globalCompositeOperation='source-over';
}
function buildRsArkSmelter(){reseed(74200);
 if(!RSMAT.brick||!RSMAT.hide||!RSMAT.ember){
  const tTar=rsNoiseTex('extTar',256,256,(g,W,H)=>{g.fillStyle='#c4bdb2';g.fillRect(0,0,W,H);for(let r=0;r<16;r++){const y=r*H/16,v=175+h3(r,2,9)*45|0;g.fillStyle=`rgb(${v},${v-4},${v-10})`;g.fillRect(0,y,W,H/16-2);g.fillStyle='rgba(20,16,12,.65)';g.fillRect(0,y+H/16-2,W,2);}rsSpeckle(g,W,H,900,.12,true);});
  const tMet=rsNoiseTex('extPak',256,256,(g,W,H)=>{g.fillStyle='#dcdad4';g.fillRect(0,0,W,H);for(let i=0;i<90;i++){const y=h3(i,4,1)*H;g.strokeStyle=`rgba(90,92,96,${.05+.07*h3(i,2,3)})`;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}rsSpeckle(g,W,H,500,.06,true);});
  const tJad=rsNoiseTex('extJad',256,256,(g,W,H)=>{g.fillStyle='#c8d4cc';g.fillRect(0,0,W,H);for(let i=0;i<28;i++){g.strokeStyle=`rgba(245,255,248,${.08+.12*h3(i,6,2)})`;g.lineWidth=1+h3(i,3,7)*3;g.beginPath();let x=0,y=h3(i,1,5)*H;g.moveTo(x,y);for(let s=1;s<=8;s++){x=s*W/8;y+=Math.sin(s+i)*12;g.lineTo(x,y);}g.stroke();}rsSpeckle(g,W,H,600,.08,true);});
  const tBrk=rsNoiseTex('extBrk',256,256,(g,W,H)=>{g.fillStyle='#bfb6a6';g.fillRect(0,0,W,H);const rh=H/8,cw=W/4;for(let r=0;r<8;r++)for(let c=0;c<5;c++){const x=(c*cw+(r%2)*cw/2)-cw/2,y=r*rh,v=176+h3(r,c,5)*44|0;g.fillStyle=`rgb(${v},${v-6},${v-14})`;g.fillRect(x+2,y+2,cw-4,rh-4);}rsSpeckle(g,W,H,900,.1,true);});
  const tHid=rsNoiseTex('extHid',256,256,(g,W,H)=>{g.fillStyle='#ccb89a';g.fillRect(0,0,W,H);for(let r=0;r<4;r++){g.strokeStyle='rgba(55,36,18,.35)';g.lineWidth=2;g.strokeRect(4,r*H/4+4,W-8,H/4-8);}rsSpeckle(g,W,H,800,.1,true);});
  const tEmb=rsNoiseTex('extEmb',128,128,(g,W,H)=>{g.fillStyle='#ff7820';g.fillRect(0,0,W,H);for(let i=0;i<160;i++){const c=h3(i,2,7)>.4?'#ffb840':'#381408';g.fillStyle=c;g.beginPath();g.arc(h3(i,1,3)*W,h3(i,4,9)*H,3+h3(i,6,2)*9,0,TAU);g.fill();}});
  const tRope=rsNoiseTex('extRop',128,128,(g,W,H)=>{g.fillStyle='#d6ceb8';g.fillRect(0,0,W,H);for(let i=-H;i<W+H;i+=8){g.strokeStyle='rgba(60,44,24,.28)';g.lineWidth=3;g.beginPath();g.moveTo(i,0);g.lineTo(i+H,H);g.stroke();}});
  if(!RSMAT.tarwood)rsDefMat('tarwood',new THREE.MeshStandardMaterial({map:tTar,vertexColors:true,roughness:.74,side:DS}));
  if(!RSMAT.paktong)rsDefMat('paktong',new THREE.MeshStandardMaterial({map:tMet,vertexColors:true,metalness:.82,roughness:.28,side:DS}));
  if(!RSMAT.jade)rsDefMat('jade',new THREE.MeshStandardMaterial({map:tJad,vertexColors:true,metalness:.06,roughness:.24,side:DS}));
  if(!RSMAT.brick)rsDefMat('brick',new THREE.MeshStandardMaterial({map:tBrk,vertexColors:true,roughness:.88,side:DS}));
  if(!RSMAT.hide)rsDefMat('hide',new THREE.MeshStandardMaterial({map:tHid,vertexColors:true,roughness:.46,side:DS}));
  if(!RSMAT.ember)rsDefMat('ember',new THREE.MeshStandardMaterial({map:tEmb,emissive:0xe85a18,emissiveMap:tEmb,emissiveIntensity:1.35,vertexColors:true,roughness:.7,side:DS}));
  if(!RSMAT.metal.map){RSMAT.metal.map=tMet;RSMAT.metal.needsUpdate=true;}
  if(!RSMAT.rope.map){RSMAT.rope.map=tRope;RSMAT.rope.needsUpdate=true;}
 }
 if(!RSMAT.foamT){
  const tFoam=rsNoiseTex('extFoam',128,128,(g,W,H)=>{g.fillStyle='#dceeee';g.fillRect(0,0,W,H);for(let i=0;i<220;i++){g.fillStyle=`rgba(255,255,255,${.2+.45*h3(i,3,8)})`;g.beginPath();g.arc(h3(i,1,2)*W,h3(i,5,4)*H,2+h3(i,7,6)*7,0,TAU);g.fill();}});
  rsDefMat('foamT',new THREE.MeshBasicMaterial({map:tFoam,color:0xe8f6f6,transparent:true,opacity:.44,depthWrite:false,side:DS}));
 }
 if(typeof KMAT!=='undefined'&&KMAT.bindMat)KMAT.bindMat('ringsea',RSMAT,{alias:{woodI:'wood',paktong:'metal'},tile:{metal:1,paktong:1,rope:1,tarwood:1,jade:1,brick:1,hide:1}});
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const CYP=rsLin(0x4e2318),CYPD=rsLin(0x321710),TAR=rsLin(0x161311),DECK=rsLin(0x7c5036),BEAM=rsLin(0x462417);
 const PAK=rsLin(0xe0dad0),PAKD=rsLin(0xa8aba8),TUFF=rsLin(0xa89b88),SOOT=rsLin(0x46403a);
 const JADE=rsLin(0x1f6e49),JADEL=rsLin(0x339668),HIDE=rsLin(0x8e5628),NISHRUB=rsLin(0x466b78),NIBLU=rsLin(0x5c8ea0),ROPE=rsLin(0x9a8462);
 const foamHull=(H,w)=>{const pts=[];for(let i=0;i<=44;i++){const u=i/44,hw=H.halfAt(u,0);if(hw>0)pts.push([u,hw]);}if(pts.length<2)return;
  const hF0=u=>clamp((0-H.yk(u))/(H.ys(u)-H.yk(u)),0,1);
  for(const s of[-1,1]){const g=rsGrid((a,v)=>{const k=Math.min(pts.length-1,Math.round(a*(pts.length-1))),u=pts[k][0],hw=pts[k][1];
   return[H.xAt(u,hF0(u)),.035,H.z0+s*(hw+.02+v*w*(.4+.6*Math.sin(Math.PI*a)))];},pts.length-1,1,(a,v)=>[a*7,v]);rsPut(B,'foamT',g,null,null,null,0xffffff);}};
 // Heavy wide-beam twin-pontoon foundry hulls at z = +-3.95 m
 const hulls=[-3.95,3.95].map(z0=>{
  const H=rsHull({L:26.8,B:2.85,fb:1.42,dr:1.2,sheerF:1.05,sheerA:.88,sp:2.4,pb:2.4,pa:2.4,q:.55,n:2.85,flare:.1,rakeF:1.05,rakeA:.75,keelEnd:.25,z0});
  rsHullMesh(B,H,'tarwood',(u,h)=>h>.9?PAKD:h>.82?CYP:h<.38?TAR:CYPD,64,12);
  foamHull(H,.55);
  rsDeck(B,H,{bw:.22,mk:'tarwood',col:TAR});
  rsWale(B,H,.88,.065,'paktong',PAKD,.03,.97);
  const pb=H.pt(1,0,1),pa=H.pt(0,0,1);
  rsSpine(B,H,.14,PAK,[[pb[0]+.45,pb[1]+.38],[pb[0]+.85,pb[1]+.92]],[[pa[0]-.3,pa[1]+.52]],'paktong');
  for(const s of[-1,1]){
   const p1=H.pt(.86,s,.94),n1=H.nrm(.86,s,.94),p2=H.pt(.94,s,.96),n2=H.nrm(.94,s,.96);
   rsTube(B,'paktong',[[p1[0]+n1.x*.036,p1[1]+n1.y*.036,p1[2]+n1.z*.036],[p2[0]+n2.x*.036,p2[1]+n2.y*.036,p2[2]+n2.z*.036],[pb[0]+.48,pb[1]+.42,z0+s*.05],[pb[0]+.82,pb[1]+.88,z0]],t=>lerp(.055,.036,t),PAK,10,6);
   const q1=H.pt(.11,s,.93),m1=H.nrm(.11,s,.93);
   rsTube(B,'paktong',[[q1[0]+m1.x*.035,q1[1]+m1.y*.035,q1[2]+m1.z*.035],[pa[0]-.28,pa[1]+.48,z0]],t=>lerp(.05,.035,t),PAKD,6,6);
  }
  // Paktong bow & bilge heat/wave sheath (+0.035 m along hull normal)
  const shG=rsGrid((u,v)=>{const uu=lerp(.74,.995,u),s=v<.5?-1:1,hh=lerp(.04,.85,1-Math.abs(v*2-1)*.92);
   const p=H.pt(uu,s,hh),N=H.nrm(uu,s,hh);return[p[0]+N.x*.035,p[1]+N.y*.035,p[2]+N.z*.035];},14,12,(u,v)=>[u*2,v*1.6]);
  rsPut(B,'paktong',shG,null,null,null,PAK);
  return H;
 });
 // Eight heavy foundry crossbeams + planked working deck
 const ySheer=hulls[1].ys(.5),yBeam=ySheer+.17,hBeam=.3,yBeamTop=yBeam+hBeam/2;
 for(let i=0;i<8;i++){
  const x=lerp(-10.2,10.2,i/7);
  rsBox(B,'wood',[.34,hBeam,10.5],[x,yBeam,0],null,BEAM,2);
  for(const z0 of[-3.95,3.95]){
   rsBox(B,'paktong',[.4,hBeam+.04,.48],[x,yBeam,z0],null,PAKD,1);
   const sOut=Math.sign(z0),uB=hulls[1].uAt(x),pKn=hulls[z0>0?1:0].pt(uB,sOut,.72);
   rsLink(B,'paktong',[pKn[0],pKn[1],pKn[2]+sOut*.04],[x,yBeam-.1,z0+sOut*.95],.044,PAKD,6);
  }
 }
 const thDeck=.085,yDeckMid=yBeamTop+.006+thDeck/2,yD=yBeamTop+.006+thDeck;
 for(let i=0;i<32;i++){
  const xp=lerp(-10.1,10.1,i/31);
  rsBox(B,'wood',[.55,thDeck,7.6],[xp,yDeckMid,0],null,new THREE.Color(DECK).offsetHSL(0,0,rr(-.02,.02)),2);
 }
 // Port & Starboard Sawn Green Nephrite Ball-and-Socket Side-Hinges (z = +-5.35 m)
 for(const s of[-1,1])for(const xh of[-7.28,0,7.28]){
  const zh=s*5.28;
  rsBox(B,'paktong',[.48,.34,.34],[xh,yBeam,zh-s*.12],null,PAKD,1);
  rsPut(B,'jade',rsUV(new THREE.TorusGeometry(.31,.1,8,14,Math.PI*1.35),1),[xh,yBeam,zh+s*.16],[0,s>0?-Math.PI/2:Math.PI/2,0],null,JADE);
  rsSphere(B,'jade',.22,[xh,yBeam,zh+s*.2],null,JADEL,12,10);
 }
 // Refractory volcanic tuff-brick foundry hearth apron amidships (x in [-4.8, 4.4], z in [-3.5, 3.5], lifted +0.008 m above deck!)
 const yHearth0=yD+.008,hHearth=.13,yH=yHearth0+hHearth;
 rsBox(B,'brick',[9.2,hHearth,7.0],[-.2,yHearth0+hHearth/2,0],null,TUFF,1.8);
 // Butt-joined Paktong angle curb framing the tuff-brick apron (proud by +0.02 m, non-overlapping corners)
 for(const sx of[-1,1])rsBox(B,'paktong',[.1,hHearth+.03,7.22],[-.2+sx*4.66,yHearth0+(hHearth+.03)/2,0],null,PAKD,1);
 for(const sz of[-1,1])rsBox(B,'paktong',[9.2,hHearth+.03,.1],[-.2,yHearth0+(hHearth+.03)/2,sz*3.56],null,PAKD,1);
 // Domed Paktong White-Copper & Refractory Brick Smelt-Furnace at (x = -0.6, z = 0)
 const fx=-.6,fy0=yH+.008;
 rsCyl(B,'brick',1.52,1.64,.46,[fx,fy0+.23,0],null,SOOT,16);
 rsCyl(B,'brick',1.34,1.48,1.72,[fx,fy0+1.33,0],null,TUFF,16);
 // Gleaming Paktong tension hoops round the brick cupola shaft + hood/flue collar flanges
 for(const hy of[.68,1.28,1.86])rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(1.46-(hy-.68)*.06,.055,8,20),1.2),[fx,fy0+hy,0],[Math.PI/2,0,0],null,PAK);
 rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(1.38,.068,8,22),1.2),[fx,fy0+2.2,0],[Math.PI/2,0,0],null,PAK);
 // Domed Paktong white-copper reverberatory hood + spark-arresting chimney stack
 const domeG=rsGrid((u,v)=>{const a=u*TAU,p=v*Math.PI*.46,r=1.36*Math.cos(p);return[fx+Math.cos(a)*r,fy0+2.2+Math.sin(p)*1.28,Math.sin(a)*r];},20,10,(u,v)=>[u*3,v*1.5]);
 rsPut(B,'paktong',domeG,null,null,null,PAK);
 rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.5,.058,8,18),1),[fx,fy0+3.34,0],[Math.PI/2,0,0],null,PAK);
 rsCyl(B,'paktong',.38,.48,2.35,[fx,fy0+4.45,0],null,PAKD,14);
 rsCyl(B,'brick',.46,.46,.28,[fx,fy0+5.78,0],null,SOOT,14);
 // Conical Paktong spark-arrestor cap on 4 struts above the flue
 for(let k=0;k<4;k++){const a=k*Math.PI/2+.4;rsLink(B,'paktong',[fx+Math.cos(a)*.4,fy0+5.92,Math.sin(a)*.4],[fx+Math.cos(a)*.52,fy0+6.36,Math.sin(a)*.52],.03,PAK,5);}
 rsCone(B,'paktong',.72,.34,[fx,fy0+6.52,0],null,PAK,14);
 // Arch-mouthed tapping breast (+x face of furnace) with glowing ember bed & Paktong tapping launder into ingot moulds
 rsBox(B,'brick',[.52,.98,1.06],[fx+1.42,fy0+.96,0],null,SOOT,1);
 rsBox(B,'ember',[.08,.56,.62],[fx+1.69,fy0+.86,0],null,0xffaa44,1);
 // Slag & molten white-copper launder spout + stepped ingot casting bench
 rsBox(B,'paktong',[1.32,.14,.32],[fx+2.28,fy0+.54,0],[0,0,-.14],PAKD,1);
 rsBox(B,'brick',[.92,.44,1.56],[fx+3.12,fy0+.22,0],null,SOOT,1.2);
 for(let m=0;m<3;m++){
  rsBox(B,'paktong',[.52,.1,.26],[fx+3.12,fy0+.5,m*.44-.44],null,PAK,.8);
  rsBox(B,'ember',[.42,.04,.16],[fx+3.12,fy0+.56,m*.44-.44],null,0xff9430,.6);
 }
 rsSolid(B,[fx-1.8,fy0,-1.8],[fx+3.7,fy0+6.8,1.8]);
 // Twin Lever-Operated Oiled-Hide & Cedar Deck Bellows flanking the furnace (z = +-2.45 m)
 for(const s of[-1,1]){
  const bx=fx-.25,bz=s*2.45,by0=yH+.008;
  // Lower cedar bellows bed
  rsBox(B,'wood',[1.72,.14,1.02],[bx,by0+.07,bz],null,BEAM,1.5);
  // Concertina pleated oiled sea-beast hide lung (3 stacked slightly tapered bags + upper tilted cedar leaf)
  for(let k=0;k<3;k++)rsCyl(B,'hide',.52-k*.02,.56-k*.02,.22,[bx,by0+.26+k*.23,bz],[0,0,.06*k],HIDE,10);
  rsBox(B,'wood',[1.76,.12,1.04],[bx+.04,by0+1.02,bz],[0,0,-.16],CYP,1.5);
  // Paktong tuyere blast-pipe curving into flanged furnace tuyere entry boss
  rsTube(B,'paktong',[[bx+.35,by0+.32,bz-s*.48],[fx+.1,by0+.48,s*1.75],[fx,by0+.62,s*1.32]],.075,PAKD,12,8);
  rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.13,.038,7,14),.7),[fx,by0+.62,s*1.46],null,null,PAK);
  // Fulcrum post + diagonal knee braces + long overhead rocking lever-pole with sawn nephrite counterweight
  rsBox(B,'wood',[.22,2.15,.22],[bx-1.05,by0+1.08,bz],null,BEAM,1.5);
  rsLink(B,'wood',[bx-1.62,by0+.04,bz],[bx-1.12,by0+.82,bz],.052,CYP,6);
  rsLink(B,'wood',[bx-1.05,by0+.04,bz+s*.48],[bx-1.05,by0+.78,bz+s*.12],.048,CYP,6);
  rsLink(B,'wood',[bx-2.15,by0+1.92,bz],[bx+.85,by0+2.36,bz],.065,CYP,6);
  rsLink(B,'paktong',[bx+.45,by0+2.3,bz],[bx+.42,by0+1.09,bz],.03,PAK,5);
  rsBox(B,'jade',[.32,.28,.28],[bx-2.1,by0+1.72,bz],null,JADE,1);
  rsRope(B,[bx+.82,by0+2.35,bz],[bx+.82,by0+.85,bz+s*.28],.02,ROPE);
 }
 // Coopered Red-Cedar & Paktong Water-Quench Trough forward port (x = 5.4, z = -2.15) + blacksmith tongs
 {const qx=5.4,qz=-2.15,qy=yD+.008;
  rsBox(B,'wood',[2.35,.68,1.08],[qx,qy+.34,qz],null,CYP,1.5);
  for(const ox of[-.85,0,.85])rsBox(B,'paktong',[.09,.72,1.14],[qx+ox,qy+.36,qz],null,PAKD,1);
  rsBox(B,'jade',[2.08,.06,.82],[qx,qy+.695,qz],null,rsLin(0x1d4f58),1);
  rsLink(B,'paktong',[qx-.7,qy+.76,qz+.32],[qx+.55,qy+.95,qz-.2],.028,PAK,5);
 }
 // Gleaming White-Copper (Paktong) Ingot Racks forward starboard (x = 5.6, z = 2.15)
 {const rx=5.6,rz=2.15,ry=yD+.008;
  for(const ox of[-1.05,1.05]){
   rsBox(B,'wood',[.18,1.08,.96],[rx+ox,ry+.54,rz],null,BEAM,1.5);
  }
  for(const shY of[.28,.68,1.02]){
   rsBox(B,'wood',[2.36,.08,.86],[rx,ry+shY,rz],null,CYPD,1.5);
   for(let i=0;i<5;i++)rsBox(B,'paktong',[.28,.13,.66],[rx-.8+i*.4,ry+shY+.112,rz],null,PAK,.8);
  }
 }
 // Stacked Bundles of Blue-Sap Nickel-Hyperaccumulating Shrub Fuel (15-20% Ni bio-ore) & Copper/Zinc Ore Sacks aft
 for(const s of[-1,1]){
  const fz=s*2.35;
  // Timber bunker rack
  rsBox(B,'wood',[3.4,.12,1.55],[-7.6,yD+.068,fz],null,BEAM,1.5);
  for(const ox of[-1.55,1.55])for(const oz of[-.7,.7])rsLink(B,'wood',[-7.6+ox,yD+.13,fz+oz],[-7.6+ox,yD+1.35,fz+oz],.055,CYP,5);
  // Bound cylindrical bundles of metallic blue-grey nickel-shrub brushwood
  for(let row=0;row<3;row++)for(let col=0;col<3-Math.floor(row/2);col++){
   const bx=-8.55+col*.96+(row%2)*.38,by=yD+.34+row*.36;
   rsCyl(B,'thatch',.21,.22,1.38,[bx,by,fz],[Math.PI/2,0,0],row%2?NIBLU:NISHRUB,8);
   for(const dz of[-.38,.38])rsPut(B,'rope',rsUV(new THREE.TorusGeometry(.225,.024,5,10),.6),[bx,by,fz+dz],null,null,ROPE);
  }
 }
 // Crushed copper & zinc flux ore sacks aft centerline
 for(let i=0;i<6;i++){
  const sx=-6.8-(i%3)*.75,sz=(i<3?-.52:.52);
  rsSphere(B,'cloth',.34,[sx,yD+.28,sz],[1.1,.78,.95],i%2?rsLin(0x886b4e):rsLin(0x527a68),8,6);
 }
 // Forward Raked Auxiliary Mast (x = 8.4, z = 0) & Soot-Weathered Catechu Crab-Claw Sail (clear of furnace solid!)
 {const mx=8.4,mh=12.2,foot=[mx,yD-.05,0],head=[mx+1.05,yD+mh*.62,0];
  rsBox(B,'paktong',[.58,.36,.58],[mx,yD+.19,0],null,PAKD,1);
  rsLink(B,'wood',foot,head,.16,CYP,8,.105);
  rsRig(B,[foot,head],{gain:.38});
  const S=rsSail(B,{key:'ark-smelt-claw',O:[11.8,yD+.45,0],U:[-1,0,0],V:[0,1,0],belly:.78,nu:20,nv:12,
   A:t=>[t*6.8+Math.sin(Math.PI*t)*.7,t*mh],
   Bf:t=>[t*7.4,t*mh*.34+Math.sin(Math.PI*t)*.6],draw:rsArkSmeltClaw});
  rsSailEdge(B,S,0,.095,CYP,0,1.03,'wood');
  rsSailEdge(B,S,1,.085,CYP,0,1.02,'wood');
  rsRope(B,[head[0],head[1]-.08,0],S.at(.4,0),.028,ROPE);
  rsRope(B,S.at(.82,1),[4.6,yD+.4,1.2],.025,ROPE);
  rsPennant(B,S.at(1.03,0),2.2,.24,[PAK,NIBLU,rsLin(0x72261a)]);
  rsRigEnd(B);
  for(const s of[-1,1])rsRope(B,head,[mx-.8,yBeam,s*4.1],.026,ROPE);
 }
 // Twin stern steering sweeps & smelter crew in leather aprons
 for(const s of[-1,1]){
  rsLink(B,'wood',[-10.8,hulls[1].ys(.08)+.32,s*4.35],[-14.4,-1.18,s*4.75],.1,CYP,6);
  rsBox(B,'paktong',[1.9,.82,.08],[-13.9,-.9,s*4.7],[0,0,.62],PAKD,1);
 }
 for(const [px,pz,py,yaw,col] of[[1.8,-1.3,yH,Math.PI,HIDE],[-.8,3.2,yH,-.4,NISHRUB],[4.6,-.9,yD,-.8,HIDE],[-5.8,1.1,yD,.3,PAKD],[-9.4,0,yD,Math.PI,NISHRUB]])
  rsFigure(B,[px,py,pz],yaw,col,false,0x6e4c36);
 rsBake(B,V.group,'arkSmelter');V.deckY=yD;return V;
}
RS_VESSEL({key:'arkSmelter',name:'cFlīt-qBōn Paktong Phytomining Smelt-Barge',culture:'cflit-qbon',L:28,B:12,H:15,
 tags:{type:['foundry barge','industrial','smelter'],propulsion:['sail','sweeps'],hull:'catamaran',wealth:'common',crew:18,role:'pelagic phytomining foundry smelting nickel-shrub ash with copper and zinc into Paktong'},
 blurb:'Wide-beam twin-pontoon foundry catamaran sheathed in refractory tuff-brick with a domed Paktong smelt-furnace, twin hide deck bellows, quench trough, blue-grey nickel-shrub fuel and white-copper ingot racks.',build:buildRsArkSmelter});
