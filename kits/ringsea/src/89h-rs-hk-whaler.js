// ---------------------------------------------------------------- vessel: Hueru-Kuran Whalebone Baidarka Whaler
// Built by the Hueru-Kuran ("Whale Clans" of Crookshore's drowned ejecta craters): twin Aleut/Kuril-Ainu bifid-jaw
// ("split-snout") hulls framed in red-cedar and curved whale-ribs under taut amber-oiled sea-beast hide stitched with
// dark baleen cordage. Bridged by a bleached leviathan rib-arch shelter, an elevated bow harpooner's pulpit armed with
// green-nephrite-headed toggle harpoons, racks of inflated amber-hide buoyancy floats, a Jōmon flame-rimmed ceramic
// deck hearth-pot, a stitched gutskin lug-sail bearing Kuril-Ainu moreu spiral-eye crests, and eight whaling paddlers.
function rsHkGutskinSail(g,W,H,P){
 // Translucent-looking warm amber gutskin/sea-lion membrane sewn in horizontal bands
 rsCloth(g,W,H,'#c88b42',9,'h');g.save();rsPolyPath(g,P);g.clip();
 for(let r=0;r<9;r++){
  const y=r*H/9;
  g.fillStyle=`rgba(120,62,18,${.06+.06*(r%2)})`;g.fillRect(0,y,W,H/9);
  g.strokeStyle='rgba(28,20,14,.62)';g.lineWidth=2.4;g.setLineDash([7,6]);
  g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();g.setLineDash([]);
 }
 // Bold Kuril-Ainu `moreu` double-spiral & killer-whale dorsal fin crest in soot-black, bone-ivory & oxblood
 g.strokeStyle='#1c1612';g.lineWidth=W*.044;rsPolyPath(g,P);g.stroke();
 g.strokeStyle='#efe7d6';g.lineWidth=W*.016;rsPolyPath(g,rsInset(P,W*.036));g.stroke();
 const [cx,cy]=rsCentroid(P),R=Math.min(W,H)*.24;
 // Central diamond-eye `sik` enclosed by four `ayus` thorn-curls
 g.fillStyle='#1c1612';
 g.beginPath();g.moveTo(cx,cy-R*.85);g.quadraticCurveTo(cx+R*1.05,cy,cx,cy+R*.85);g.quadraticCurveTo(cx-R*1.05,cy,cx,cy-R*.85);g.fill();
 g.fillStyle='#efe7d6';
 g.beginPath();g.moveTo(cx,cy-R*.52);g.quadraticCurveTo(cx+R*.65,cy,cx,cy+R*.52);g.quadraticCurveTo(cx-R*.65,cy,cx,cy-R*.52);g.fill();
 g.fillStyle='#7e2418';g.beginPath();g.arc(cx,cy,R*.24,0,TAU);g.fill();
 g.fillStyle='#efe7d6';g.beginPath();g.arc(cx,cy,R*.09,0,TAU);g.fill();
 g.strokeStyle='#1c1612';g.lineWidth=R*.13;g.lineCap='round';
 for(const sx of[-1,1])for(const sy of[-1,1]){
  g.beginPath();g.moveTo(cx+sx*R*.52,cy+sy*R*.38);
  g.bezierCurveTo(cx+sx*R*1.25,cy+sy*R*.35,cx+sx*R*1.28,cy+sy*R*1.05,cx+sx*R*.72,cy+sy*R*1.02);
  g.bezierCurveTo(cx+sx*R*.42,cy+sy*R*.98,cx+sx*R*.48,cy+sy*R*.68,cx+sx*R*.74,cy+sy*R*.72);
  g.stroke();
 }
 g.restore();
}
function buildRsHkWhaleCat(){reseed(74600);
 if(!RSMAT.hide||!RSMAT.bone||!RSMAT.jade||!RSMAT.brick||!RSMAT.ember){
  const tHid=rsNoiseTex('extHid',256,256,(g,W,H)=>{g.fillStyle='#ccb89a';g.fillRect(0,0,W,H);for(let r=0;r<4;r++){g.strokeStyle='rgba(55,36,18,.35)';g.lineWidth=2;g.strokeRect(4,r*H/4+4,W-8,H/4-8);}rsSpeckle(g,W,H,800,.1,true);});
  const tBon=rsNoiseTex('extBon',256,256,(g,W,H)=>{g.fillStyle='#e2dcd0';g.fillRect(0,0,W,H);rsSpeckle(g,W,H,800,.09,true);});
  const tJad=rsNoiseTex('extJad',256,256,(g,W,H)=>{g.fillStyle='#c8d4cc';g.fillRect(0,0,W,H);rsSpeckle(g,W,H,600,.08,true);});
  const tBrk=rsNoiseTex('extBrk',256,256,(g,W,H)=>{g.fillStyle='#bfb6a6';g.fillRect(0,0,W,H);rsSpeckle(g,W,H,1100,.14,true);});
  const tEmb=rsNoiseTex('extEmb',128,128,(g,W,H)=>{g.fillStyle='#ff7820';g.fillRect(0,0,W,H);for(let i=0;i<160;i++){g.fillStyle=h3(i,2,7)>.4?'#ffb840':'#381408';g.beginPath();g.arc(h3(i,1,3)*W,h3(i,4,9)*H,3+h3(i,6,2)*9,0,TAU);g.fill();}});
  const tMet=rsNoiseTex('extPak',256,256,(g,W,H)=>{g.fillStyle='#dcdad4';g.fillRect(0,0,W,H);rsSpeckle(g,W,H,500,.06,true);});
  const tRope=rsNoiseTex('extRop',128,128,(g,W,H)=>{g.fillStyle='#d6ceb8';g.fillRect(0,0,W,H);for(let i=-H;i<W+H;i+=8){g.strokeStyle='rgba(60,44,24,.28)';g.lineWidth=3;g.beginPath();g.moveTo(i,0);g.lineTo(i+H,H);g.stroke();}});
  if(!RSMAT.hide)rsDefMat('hide',new THREE.MeshStandardMaterial({map:tHid,vertexColors:true,roughness:.46,side:DS}));
  if(!RSMAT.bone)rsDefMat('bone',new THREE.MeshStandardMaterial({map:tBon,vertexColors:true,roughness:.46,side:DS}));
  if(!RSMAT.jade)rsDefMat('jade',new THREE.MeshStandardMaterial({map:tJad,vertexColors:true,metalness:.06,roughness:.24,side:DS}));
  if(!RSMAT.brick)rsDefMat('brick',new THREE.MeshStandardMaterial({map:tBrk,vertexColors:true,roughness:.88,side:DS}));
  if(!RSMAT.ember)rsDefMat('ember',new THREE.MeshStandardMaterial({map:tEmb,emissive:0xe85a18,emissiveMap:tEmb,emissiveIntensity:1.35,vertexColors:true,roughness:.7,side:DS}));
  if(!RSMAT.metal.map){RSMAT.metal.map=tMet;RSMAT.metal.needsUpdate=true;}
  if(!RSMAT.rope.map){RSMAT.rope.map=tRope;RSMAT.rope.needsUpdate=true;}
 }
 if(!RSMAT.foamT){
  const tFoam=rsNoiseTex('extFoam',128,128,(g,W,H)=>{g.fillStyle='#dceeee';g.fillRect(0,0,W,H);for(let i=0;i<220;i++){g.fillStyle=`rgba(255,255,255,${.2+.45*h3(i,3,8)})`;g.beginPath();g.arc(h3(i,1,2)*W,h3(i,5,4)*H,2+h3(i,7,6)*7,0,TAU);g.fill();}});
  rsDefMat('foamT',new THREE.MeshBasicMaterial({map:tFoam,color:0xe8f6f6,transparent:true,opacity:.44,depthWrite:false,side:DS}));
 }
 if(typeof KMAT!=='undefined'&&KMAT.bindMat)KMAT.bindMat('ringsea',RSMAT,{alias:{woodI:'wood',paktong:'metal'},tile:{metal:1,rope:1,jade:1,brick:1,hide:1,bone:1}});
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const AMBER=rsLin(0xa86426),AMBERL=rsLin(0xc47a32),UMBER=rsLin(0x4c2810),BALEEN=rsLin(0x1b1715);
 const BONE=rsLin(0xe8e0cf),BONED=rsLin(0xc8bea8),CEDAR=rsLin(0x6e3a22),DECK=rsLin(0x8e5c3a);
 const JADE=rsLin(0x20744b),JADEL=rsLin(0x349a68),JOMON=rsLin(0x8e4226),SIN=rsLin(0xb8a27a);
 const foamHull=(H,w)=>{const pts=[];for(let i=0;i<=40;i++){const u=i/40,hw=H.halfAt(u,0);if(hw>0)pts.push([u,hw]);}if(pts.length<2)return;
  const hF0=u=>clamp((0-H.yk(u))/(H.ys(u)-H.yk(u)),0,1);
  for(const s of[-1,1]){const g=rsGrid((a,v)=>{const k=Math.min(pts.length-1,Math.round(a*(pts.length-1))),u=pts[k][0],hw=pts[k][1];
   return[H.xAt(u,hF0(u)),.035,H.z0+s*(hw+.02+v*w*(.4+.6*Math.sin(Math.PI*a)))];},pts.length-1,1,(a,v)=>[a*6,v]);rsPut(B,'foamT',g,null,null,null,0xffffff);}};
 // Twin Aleut/Kuril-Ainu Oiled-Hide & Whalebone Baidarka Hulls at z = +-2.75 m
 const hulls=[-2.75,2.75].map(z0=>{
  const H=rsHull({L:17.8,B:1.88,fb:1.18,dr:.88,sheerF:.78,sheerA:.86,sp:2.5,pb:2.05,pa:2.1,q:.68,n:2.1,flare:.12,rakeF:.65,rakeA:.75,keelEnd:.22,z0});
  rsHullMesh(B,H,'hide',(u,h)=>h>.91?BONE:h>.84?BALEEN:h<.34?UMBER:(h>.58?AMBERL:AMBER),56,10);
  foamHull(H,.45);
  rsDeck(B,H,{bw:.22,mk:'wood',col:CEDAR});
  // Bleached whale-rib gunwale cap + dark baleen cordage longitudinal chine-seams
  rsWale(B,H,.95,.055,'bone',BONE,.03,.95);
  rsWale(B,H,.66,.035,'rope',BALEEN,.04,.95);
  // External whale-rib rubbing frames stitched along the oiled hide topsides (seated cleanly with zero tangent coplanarity)
  for(let i=0;i<9;i++){
   const u=lerp(.15,.85,i/8);
   for(const s of[-1,1]){
    const p1=H.pt(u,s,.48),n1=H.nrm(u,s,.48),p2=H.pt(u,s,.74),n2=H.nrm(u,s,.74),p3=H.pt(u,s,.96),n3=H.nrm(u,s,.96);
    rsTube(B,'bone',[[p1[0]+n1.x*.015,p1[1]+n1.y*.015,p1[2]+n1.z*.015],[p2[0]+n2.x*.015,p2[1]+n2.y*.015,p2[2]+n2.z*.015],[p3[0]+n3.x*.015,p3[1]+n3.y*.015,p3[2]+n3.z*.015]],.035,BONED,8,6);
   }
  }
  // Signature Aleut/Kuril-Ainu Bifid-Jaw ("Split-Snout") Bow on EACH hull — faired organically back to u = 0.85!
  const pTop=H.pt(.96,0,.92),pLow=H.pt(.95,0,.22);
  // Stitched amber-hide port & starboard bow cheek-fairings embracing the hull (+38 mm proud, then projecting forward into the split jaws)
  for(const s of[-1,1]){
   const bfG=rsGrid((u,v)=>{
    const hv=s>0?v:1-v,hh=lerp(.14,.94,hv);
    if(u<=.65){
     const uu=lerp(.86,.992,u/.65),p=H.pt(uu,s,hh),N=H.nrm(uu,s,hh);
     return[p[0]+N.x*.038,p[1]+N.y*.038,p[2]+N.z*.038];
    }
    const f=(u-.65)/.35,p0=H.pt(.992,s,hh),N0=H.nrm(.992,s,hh);
    const jx=lerp(pLow[0]+.62,pTop[0]+.52,hv),jy=lerp(pLow[1]-.02,pTop[1]+.2,hv),jz=z0+s*.075;
    return[lerp(p0[0]+N0.x*.038,jx,f),lerp(p0[1]+N0.y*.038,jy,f),lerp(p0[2]+N0.z*.038,jz,f)];
   },10,8,(u,v)=>[u*1.6,v*1.4]);
   rsPut(B,'hide',bfG,null,null,null,AMBER);
   // Carved bleached-whalebone stem-knees continuing from the gunwale wale ends (u = 0.955) into the upper snout spine
   const k1=H.pt(.955,s,.95),nk1=H.nrm(.955,s,.95);
   rsTube(B,'bone',[[k1[0]+nk1.x*.03,k1[1]+nk1.y*.03,k1[2]+nk1.z*.03],[pTop[0]+.38,pTop[1]+.18,z0+s*.06],[pTop[0]+1.15,pTop[1]+.52,z0]],t=>lerp(.048,.028,t),BONE,9,6);
  }
  // Lower wave-cleaving jaw: sleek upturned forefoot horn rooted deep in keel & shod in carved whalebone
  rsTube(B,'hide',[[H.xAt(.87,.14),H.yk(.87)+.08,z0],[pLow[0]+.05,pLow[1]-.02,z0],[pLow[0]+.92,pLow[1]-.04,z0],[pLow[0]+1.85,pLow[1]+.24,z0]],t=>lerp(.26,.08,t),AMBER,16,8);
  rsTube(B,'bone',[[H.xAt(.89,0),H.yk(.89)-.02,z0],[pLow[0]+.45,pLow[1]-.1,z0],[pLow[0]+1.65,pLow[1]+.18,z0],[pLow[0]+2.22,pLow[1]+.42,z0],[pLow[0]+2.42,pLow[1]+.62,z0]],t=>lerp(.065,.03,t),BONE,14,6);
  // Upper spray-deflecting snout: sweeping upper jaw rooted at u = 0.87 with carved Kuril-Ainu bone spiral & baleen jaw-struts across the open cleft!
  rsTube(B,'hide',[[H.xAt(.87,.86),H.ys(.87)-.12,z0],[pTop[0]-.05,pTop[1]-.04,z0],[pTop[0]+.82,pTop[1]+.35,z0],[pTop[0]+1.62,pTop[1]+.68,z0]],t=>lerp(.28,.1,t),AMBERL,16,8);
  rsScroll(B,[pTop[0]+1.58,pTop[1]+.68,z0],.34,1.1,.09,BONE,1,'bone',z0);
  // Twin whalebone cleft-struts & dark baleen cordage seizing rings joining upper and lower jaws
  rsLink(B,'bone',[pLow[0]+.62,pLow[1]-.03,z0],[pTop[0]+.48,pTop[1]+.16,z0],.048,BONED,6);
  rsLink(B,'bone',[pLow[0]+1.28,pLow[1]+.09,z0],[pTop[0]+1.05,pTop[1]+.45,z0],.045,BONED,6);
  for(const [sx,sy,sr] of[[pTop[0]+.48,pTop[1]+.16,.16],[pTop[0]+.105*10,pTop[1]+.45,.13],[pLow[0]+1.28,pLow[1]+.09,.12]])
   rsPut(B,'rope',rsUV(new THREE.TorusGeometry(sr,.025,6,12),.6),[sx,sy,z0],[0,Math.PI/2,0],null,BALEEN);
  // Upturned baidarka stern with hide-wrapped cheek-fairing, whalebone stern-knees & carved whale-fluke bone finial
  const pSt=H.pt(0,0,1);
  for(const s of[-1,1]){
   const sfG=rsGrid((u,v)=>{
    const uu=lerp(.005,.11,u),hh=lerp(.22,.94,s>0?v:1-v),p=H.pt(uu,s,hh),N=H.nrm(uu,s,hh);
    return[p[0]+N.x*.036,p[1]+N.y*.036,p[2]+N.z*.036];
   },6,6,(u,v)=>[u*1.2,v*1.2]);
   rsPut(B,'hide',sfG,null,null,null,UMBER);
   const a1=H.pt(.028,s,.95),na1=H.nrm(.028,s,.95);
   rsTube(B,'bone',[[a1[0]+na1.x*.03,a1[1]+na1.y*.03,a1[2]+na1.z*.03],[pSt[0]-.18,pSt[1]+.18,z0+s*.05],[pSt[0]-.52,pSt[1]+.62,z0]],t=>lerp(.048,.032,t),BONED,8,6);
  }
  rsTube(B,'bone',[[H.xAt(.08,.25),H.yk(.08)+.08,z0],[pSt[0]+.05,pSt[1]-.1,z0],[pSt[0]-.55,pSt[1]+.65,z0],[pSt[0]-.82,pSt[1]+1.38,z0]],t=>lerp(.16,.06,t),BONE,14,8);
  rsPut(B,'rope',rsUV(new THREE.TorusGeometry(.14,.026,6,12),.6),[pSt[0]-.16,pSt[1]+.16,z0],[0,Math.PI/2,.4],null,BALEEN);
  for(const sf of[-1,1])rsCone(B,'bone',.12,.52,[pSt[0]-.88,pSt[1]+1.48,z0+sf*.22],[sf*1.15,0,.35],BONE,6);
  // Painted spiral-eye talisman on outer bow cheek
  const sOut=Math.sign(z0);
  rsDecal(B,H,.88,sOut,.68,.26,BONE,'bone',16,.048);
  rsDecal(B,H,.88,sOut,.68,.11,BALEEN,'rope',12,.072);
  return H;
 });
 // Six red-cedar & whalebone crossbeams lashed with dark baleen cordage + carved whalebone knee-brackets + slatted deck
 const ySheer=hulls[1].ys(.5),yBeam=ySheer+.16,hBeam=.24,yBeamTop=yBeam+hBeam/2;
 for(let i=0;i<6;i++){
  const x=lerp(-6.8,6.8,i/5);
  rsBox(B,'wood',[.26,hBeam,7.1],[x,yBeam,0],null,CEDAR,2);
  // Curved whalebone knee-gussets & dark baleen lashings over each hull
  for(const z0 of[-2.75,2.75]){
   rsBox(B,'rope',[.34,hBeam+.05,.42],[x,yBeam,z0],null,BALEEN,.8);
   const uB=hulls[1].uAt(x),H0=hulls[z0>0?1:0];
   for(const sk of[-1,1]){
    const pK=H0.pt(uB,sk,.74),nK=H0.nrm(uB,sk,.74);
    rsLink(B,'bone',[pK[0]+nK.x*.025,pK[1]+nK.y*.025,pK[2]+nK.z*.025],[x,yBeam-.08,z0+sk*.68],.038,BONED,6);
   }
  }
 }
 const thDeck=.07,yDeckMid=yBeamTop+.006+thDeck/2,yD=yBeamTop+.006+thDeck;
 for(let i=0;i<24;i++){
  const xp=lerp(-6.65,6.65,i/23);
  rsBox(B,'wood',[.48,thDeck,4.6],[xp,yDeckMid,0],null,new THREE.Color(DECK).offsetHSL(0,0,rr(-.02,.02)),2);
 }
 // Bleached Leviathan Rib-Arch Shelter amidships-aft (x in [-5.4, -0.8], z in [-1.85, +1.85])
 {const sx0=-5.3,sx1=-.9,shH=2.12,shW=1.82;
  // Five pairs of massive curved white leviathan ribs arching up from the deck to cross at a whale-vertebra ridgepole!
  for(let i=0;i<5;i++){
   const rx=lerp(sx0,sx1,i/4);
   for(const s of[-1,1]){
    rsTube(B,'bone',[[rx,yD+.02,s*shW],[rx,yD+shH*.58,s*(shW+.16)],[rx,yD+shH*.96,s*.48],[rx,yD+shH+.16,-s*.26]],t=>lerp(.095,.052,t),BONE,14,8);
    rsBox(B,'rope',[.18,.16,.18],[rx,yD+.1,s*shW],null,BALEEN,.6);
   }
   // Carved whale-vertebra centrum ring at each rib crossing
   rsCyl(B,'bone',.14,.14,.22,[rx,yD+shH+.04,0],[0,0,Math.PI/2],BONED,10);
  }
  // Longitudinal whalebone ridgepole & side purlins
  rsLink(B,'bone',[sx0-.35,yD+shH+.04,0],[sx1+.35,yD+shH+.04,0],.055,BONE,8);
  for(const s of[-1,1])rsLink(B,'wood',[sx0-.25,yD+shH*.62,s*(shW+.06)],[sx1+.25,yD+shH*.62,s*(shW+.06)],.04,CEDAR,6);
  // Taut stitched amber-oiled sea-beast hide canopy stretched just INSIDE the outer whale-ribs (r - 0.09 m so ribs stand boldly proud outside!)
  const hideG=rsGrid((u,v)=>{const xx=lerp(sx0+.08,sx1-.08,u),a=lerp(.12,Math.PI-.12,v);
   return[xx,yD+.18+Math.sin(a)*(shH-.14),Math.cos(a)*(shW-.1)];},12,14,(u,v)=>[u*2.4,v*2.6]);
  rsPut(B,'hide',hideG,null,null,null,AMBERL);
  rsSolid(B,[sx0-.2,yD,-shW-.2],[sx1+.2,yD+shH+.25,shW+.2]);
 }
 // Jōmon Flame-Rimmed (`Kaen-Doki`) Ceramic Deck Hearth-Pot forward of the shelter (x = 0.25, z = -1.05)
 {const hx=.25,hz=-1.05,hy=yD+.008;
  // Sand-filled cedar & stone fire-box (butt-joined curb around stone hearth bed)
  rsBox(B,'wood',[1.08,.12,1.08],[hx,hy+.06,hz],null,CEDAR,1);
  rsBox(B,'brick',[.86,.05,.86],[hx,hy+.148,hz],null,BONED,1);
  const py=hy+.18;
  // Cord-impressed terracotta Jōmon vessel body flaring upward + glowing charcoal embers
  rsCyl(B,'brick',.3,.18,.42,[hx,py+.21,hz],null,JOMON,14);
  rsCyl(B,'ember',.25,.22,.05,[hx,py+.4,hz],null,0xff9c38,12);
  // Sculpted Jōmon `kaen-doki` cockscomb & spiral flame-rim projections crowning the rim (4 tall + 4 low crenellations)
  rsPut(B,'brick',rsUV(new THREE.TorusGeometry(.31,.038,7,16),.8),[hx,py+.43,hz],[Math.PI/2,0,0],null,JOMON);
  for(let k=0;k<4;k++){
   const a=k*Math.PI/2+.35,rx=hx+Math.cos(a)*.31,rz=hz+Math.sin(a)*.31;
   rsScroll(B,[rx,py+.45,rz],.13,.95,.038,JOMON,1,'brick',rz);
   const a2=a+Math.PI/4;
   rsCone(B,'brick',.055,.18,[hx+Math.cos(a2)*.31,py+.52,hz+Math.sin(a2)*.31],null,JOMON,6);
  }
 }
 // Racks of Inflated Amber-Oiled Hide Buoyancy Floats (`Avatak`) along port & starboard rails (x in [-0.2, 3.4], z = +-2.05)
 for(const s of[-1,1]){
  const rz=s*2.02;
  for(const rx of[-.2,3.4])rsLink(B,'wood',[rx,yD+.01,rz],[rx,yD+.78,rz],.042,CEDAR,5);
  rsLink(B,'bone',[-.35,yD+.72,rz],[3.55,yD+.72,rz],.038,BONE,6);
  for(let i=0;i<3;i++){
   const fx=.35+i*1.25;
   // Plump inflated whole-seal oiled-hide float + carved bone inflation nozzle & coiled baleen float-line
   rsSphere(B,'hide',.31,[fx,yD+.44,rz],[1.48,.82,.86],i%2?AMBERL:AMBER,12,9);
   rsCyl(B,'bone',.042,.052,.14,[fx+.46,yD+.5,rz],[0,0,-Math.PI/3],BONE,7);
   rsPut(B,'rope',rsUV(new THREE.TorusGeometry(.18,.032,6,12),.6),[fx,yD+.12,rz-s*.22],[Math.PI/2,0,0],null,BALEEN);
  }
 }
 // Elevated Bow Harpooner's Pulpit Stage (x in [4.35, 6.75], z in [-1.15, +1.15], yPulp = yD + 0.68)
 {const px0=4.35,px1=6.75,pcx=(px0+px1)/2,yPulp=yD+.68;
  for(const px of[px0+.14,px1-.14])for(const s of[-1,1]){
   rsLink(B,'wood',[px,yD+.01,s*1.02],[px,yPulp-.07,s*.96],.07,CEDAR,6);
   rsLink(B,'bone',[px-.35,yD+.04,s*1.02],[px,yPulp-.12,s*.96],.042,BONED,5);
  }
  rsBox(B,'wood',[px1-px0,.08,2.1],[pcx,yPulp-.04,0],null,DECK,1.5);
  // Curved bleached whale-jawbone knee-brace pulpit rail around the bow harpooner!
  rsTube(B,'bone',[[px0+.2,yPulp+.04,-1.0],[px1+.15,yPulp+.82,-.72],[px1+.42,yPulp+.92,0],[px1+.15,yPulp+.82,.72],[px0+.2,yPulp+.04,1.0]],.055,BONE,22,8);
  for(const s of[-1,1])rsLink(B,'bone',[px1+.08,yPulp+.02,s*.72],[px1+.12,yPulp+.8,s*.7],.04,BONED,6);
  // Lead Hueru-Kuran harpooner in amber gutskin kamleika poised with a green-nephrite-headed toggle harpoon!
  rsFigure(B,[5.55,yPulp,-.12],0,AMBERL,false,0x8c6244);
  const ha=[4.45,yPulp+1.25,.24],hb=[7.85,yPulp+1.68,.12];
  rsLink(B,'wood',ha,hb,.034,CEDAR,6);
  rsLink(B,'bone',[7.81,yPulp+1.675,.121],[8.38,yPulp+1.75,.1],.024,BONE,6,.018);
  rsCone(B,'jade',.068,.3,[8.55,yPulp+1.77,.1],[0,0,-Math.PI/2+.12],JADEL,6);
  // Racked spare toggle harpoons with carved bone foreshafts & sawn green-nephrite blades on pulpit sides
  for(const s of[-1,1])for(let h=0;h<2;h++){
   const rx0=4.1+h*.25,rz=s*1.08,ry0=yPulp+.22+h*.16;
   rsLink(B,'wood',[rx0-.6,ry0-.12,rz],[rx0+2.35,ry0+.28,rz],.028,CEDAR,5);
   rsLink(B,'bone',[rx0+2.31,ry0+.275,rz],[rx0+2.82,ry0+.35,rz],.02,BONE,5,.015);
   rsCone(B,'jade',.058,.26,[rx0+2.97,ry0+.37,rz],[0,0,-Math.PI/2+.14],JADE,6);
  }
 }
 // Stepped Cedar & Whalebone Mast (x = 2.25, z = 0, H = 11.2 m) + Stitched Gutskin Kuril-Ainu Lug-Sail
 {const mx=2.25,mh=9.2,tp=[mx,yD+mh,0];
  rsCyl(B,'bone',.26,.3,.34,[mx,yD+.178,0],null,BONED,10);
  rsLink(B,'wood',[mx,yD-.08,0],tp,.135,CEDAR,8,.088);
  rsRig(B,[mx,0],{gain:.65});
  const S=rsSail(B,{key:'hk-gutskin-lug',O:[mx+.18,yD+2.65,0],U:[-.96,0,.28],V:[0,1,0],belly:.62,nu:16,nv:12,
   A:t=>[lerp(-2.2,3.4,t),5.85+t*.55],
   Bf:t=>[lerp(-1.95,3.25,t),0],draw:rsHkGutskinSail});
  rsSailEdge(B,S,0,.075,CEDAR,-.03,1.03,'wood');
  rsSailEdge(B,S,1,.068,CEDAR,-.03,1.03,'wood');
  rsRope(B,tp,S.at(.35,0),.026,BALEEN);
  rsRope(B,tp,S.at(.78,0),.024,BALEEN);
  rsRope(B,S.at(.95,1),[-.4,yD+.5,1.45],.022,SIN);
  rsPennant(B,[mx,yD+mh+.15,0],2.6,.28,[BONE,BALEEN,JOMON]);
  rsRigEnd(B);
  for(const s of[-1,1])rsRope(B,tp,[mx-.5,yBeam,s*2.85],.024,BALEEN);
 }
 // Eight Seated Hueru-Kuran Whaling Paddlers along the outer hull gunwales + Animated Bone-Tipped Paddles
 const padPts=[];
 for(let i=0;i<4;i++){
  const px=lerp(-4.6,3.6,i/3),u=hulls[1].uAt(px),py=hulls[1].ys(u);
  padPts.push([px,py+.22,3.45]);
  for(const s of[-1,1])rsFigure(B,[px-.15,py-.35,s*2.75],0,i%2?AMBER:rsLin(0x523622),true,0x8c6244);
 }
 rsOars(V,hulls[1],{name:'whaling paddles',points:padPts,len:2.85,inb:.25,r:.032,bladeL:.62,bladeW:.21,col:0xdcd3c0,sweep:.48,lift:.28,rate:.68,pitch:1.08,immerse:.22,ripple:.4});
 // Stern steersman with whalebone-bladed steering sweep
 rsFigure(B,[-6.15,yD,0],Math.PI,AMBER,false,0x8c6244);
 rsLink(B,'wood',[-6.65,yD+.45,.55],[-10.35,-.95,1.05],.085,CEDAR,6);
 rsBox(B,'bone',[1.55,.68,.07],[-9.95,-.72,1.0],[0,0,.55],BONE,1);
 rsBake(B,V.group,'hkWhaleCat');V.deckY=yD;return V;
}
RS_VESSEL({key:'hkWhaleCat',name:'Hueru-Kuran Whalebone Baidarka Whaler',culture:'hueru-kuran',L:20,B:8.5,H:11.5,
 tags:{type:['whaler','baidarka','hunting catamaran'],propulsion:['paddles','sail'],hull:'catamaran',wealth:'common',crew:10,role:'open-ocean leviathan and sea-beast hunting off Crookshore crater-coasts'},
 blurb:'Twin Aleut/Kuril-Ainu bifid-jaw hulls of whale-rib and amber-oiled hide stitched with baleen, bridged by a bleached leviathan rib-arch shelter, harpoon pulpit with green-nephrite toggle harpoons, hide floats and a Jōmon flame-rimmed deck hearth.',build:buildRsHkWhaleCat});
