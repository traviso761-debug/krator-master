// ---------------------------------------------------------------- vessel: cFlīt-qBōn Great Moon-Pool Ark-Catamaran
// Flagship living craft of the cFlīt-qBōn ("Fleet-Born"), pelagic 25-minute breath-hold click-speaking boat nomads of
// the Drownlands and The Arch. Twin deep-V dark bitumen-caulked red-cypress hulls sheathed at stem and keel in
// gleaming corrosion-proof Paktong white-copper (Cu-Ni-Zn), bridged by nine heavy cypress cross-beams round a central
// 5 x 4 m railed Free-Dive Moon-Pool with a submerged decompression stage and twin dive ladders where divers drop
// 100+ m into fault trenches. Rigged with twin twin-masted rust-red catechu crab-claw sails outboard on both hulls,
// an aft deckhouse glazed with sawn emerald nephrite storm-lights, a bow cast-bronze P-wave Tsunami Gong frame, and
// port/starboard sawn green nephrite ball-and-socket coupling hinges for locking into floating Ark-Wards.
function rsArkCatechuClaw(g,W,H,P){
 rsCloth(g,W,H,'#862b1c',12,'v');g.save();rsPolyPath(g,P);g.clip();
 for(let i=0;i<36;i++){g.fillStyle=`rgba(42,12,8,${.05+.05*(i%2)})`;g.fillRect(0,H*i/36,W,H/72);}
 g.strokeStyle='rgba(48,14,8,.48)';g.lineWidth=2.2;
 for(let k=1;k<10;k++){g.beginPath();g.moveTo(0,H*(1-k/10));g.lineTo(W,H*(1-k/10)-H*.38);g.stroke();}
 g.strokeStyle='#204c3b';g.lineWidth=W*.048;rsPolyPath(g,P);g.stroke();
 g.strokeStyle='#d6cab8';g.lineWidth=W*.016;rsPolyPath(g,rsInset(P,W*.038));g.stroke();
 const n0=P.length/2,ta=P[0],tm=[(P[n0-1][0]+P[n0][0])/2,(P[n0-1][1]+P[n0][1])/2];
 const cx=lerp(ta[0],tm[0],.5),cy=lerp(ta[1],tm[1],.5),R=Math.min(W,H)*.13;
 g.strokeStyle='#2c7d58';g.lineWidth=R*.22;g.beginPath();g.arc(cx,cy,R,0,TAU);g.stroke();
 g.strokeStyle='#e2dcd0';g.lineWidth=R*.1;g.beginPath();g.arc(cx,cy,R*.62,0,TAU);g.stroke();
 for(let k=0;k<4;k++){const a=k*Math.PI/2+.78;g.fillStyle='#e2dcd0';g.beginPath();g.arc(cx+Math.cos(a)*R*1.32,cy+Math.sin(a)*R*1.32,R*.11,0,TAU);g.fill();}
 g.restore();
 const n=P.length/2,a=P[n-1],b=P[n],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,d=Math.hypot(a[0]-b[0],a[1]-b[1]);
 g.globalCompositeOperation='destination-out';g.beginPath();g.arc(mx+d*.3,my-d*.1,d*.34,0,TAU);g.fill();g.globalCompositeOperation='source-over';
}
function buildRsArkCatamaran(){reseed(74100);
 if(!RSMAT.tarwood){
  const tTar=rsNoiseTex('extTar',256,256,(g,W,H)=>{g.fillStyle='#c4bdb2';g.fillRect(0,0,W,H);for(let r=0;r<16;r++){const y=r*H/16,v=175+h3(r,2,9)*45|0;g.fillStyle=`rgb(${v},${v-4},${v-10})`;g.fillRect(0,y,W,H/16-2);g.fillStyle='rgba(20,16,12,.65)';g.fillRect(0,y+H/16-2,W,2);}rsSpeckle(g,W,H,900,.12,true);});
  const tMet=rsNoiseTex('extPak',256,256,(g,W,H)=>{g.fillStyle='#dcdad4';g.fillRect(0,0,W,H);for(let i=0;i<90;i++){const y=h3(i,4,1)*H;g.strokeStyle=`rgba(90,92,96,${.05+.07*h3(i,2,3)})`;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}rsSpeckle(g,W,H,500,.06,true);});
  const tJad=rsNoiseTex('extJad',256,256,(g,W,H)=>{g.fillStyle='#c8d4cc';g.fillRect(0,0,W,H);for(let i=0;i<28;i++){g.strokeStyle=`rgba(245,255,248,${.08+.12*h3(i,6,2)})`;g.lineWidth=1+h3(i,3,7)*3;g.beginPath();let x=0,y=h3(i,1,5)*H;g.moveTo(x,y);for(let s=1;s<=8;s++){x=s*W/8;y+=Math.sin(s+i)*12;g.lineTo(x,y);}g.stroke();}rsSpeckle(g,W,H,600,.08,true);});
  const tRope=rsNoiseTex('extRop',128,128,(g,W,H)=>{g.fillStyle='#d6ceb8';g.fillRect(0,0,W,H);for(let i=-H;i<W+H;i+=8){g.strokeStyle='rgba(60,44,24,.28)';g.lineWidth=3;g.beginPath();g.moveTo(i,0);g.lineTo(i+H,H);g.stroke();}});
  rsDefMat('tarwood',new THREE.MeshStandardMaterial({map:tTar,vertexColors:true,roughness:.74,side:DS}));
  rsDefMat('paktong',new THREE.MeshStandardMaterial({map:tMet,vertexColors:true,metalness:.82,roughness:.28,side:DS}));
  rsDefMat('jade',new THREE.MeshStandardMaterial({map:tJad,vertexColors:true,metalness:.06,roughness:.24,side:DS}));
  if(!RSMAT.metal.map){RSMAT.metal.map=tMet;RSMAT.metal.needsUpdate=true;}
  if(!RSMAT.rope.map){RSMAT.rope.map=tRope;RSMAT.rope.needsUpdate=true;}
 }
 if(!RSMAT.foamT){
  const tFoam=rsNoiseTex('extFoam',128,128,(g,W,H)=>{g.fillStyle='#dceeee';g.fillRect(0,0,W,H);for(let i=0;i<220;i++){g.fillStyle=`rgba(255,255,255,${.2+.45*h3(i,3,8)})`;g.beginPath();g.arc(h3(i,1,2)*W,h3(i,5,4)*H,2+h3(i,7,6)*7,0,TAU);g.fill();}});
  rsDefMat('foamT',new THREE.MeshBasicMaterial({map:tFoam,color:0xe8f6f6,transparent:true,opacity:.44,depthWrite:false,side:DS}));
 }
 if(typeof KMAT!=='undefined'&&KMAT.bindMat)KMAT.bindMat('ringsea',RSMAT,{alias:{woodI:'wood',paktong:'metal'},tile:{metal:1,paktong:1,rope:1,tarwood:1,jade:1}});
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const CYP=rsLin(0x56261b),CYPD=rsLin(0x3a1912),TAR=rsLin(0x181412),DECK=rsLin(0x88583b),BEAM=rsLin(0x4c2819);
 const PAK=rsLin(0xdcd6c8),PAKD=rsLin(0xaeb0ae),JADE=rsLin(0x1f6e49),JADEL=rsLin(0x339668),BRZ=rsLin(0xb88636),ROPE=rsLin(0x9e8866);
 const foamHull=(H,w)=>{const pts=[];for(let i=0;i<=48;i++){const u=i/48,hw=H.halfAt(u,0);if(hw>0)pts.push([u,hw]);}if(pts.length<2)return;
  const hF0=u=>clamp((0-H.yk(u))/(H.ys(u)-H.yk(u)),0,1);
  for(const s of[-1,1]){const g=rsGrid((a,v)=>{const k=Math.min(pts.length-1,Math.round(a*(pts.length-1))),u=pts[k][0],hw=pts[k][1];
   return[H.xAt(u,hF0(u)),.035,H.z0+s*(hw+.02+v*w*(.4+.6*Math.sin(Math.PI*a)))];},pts.length-1,1,(a,v)=>[a*8,v]);rsPut(B,'foamT',g,null,null,null,0xffffff);}};
 // Twin deep-V dark bitumen-caulked red-cypress hulls at z = +-4.7 m (clean port/stbd half-grids: zero stem/stern fold!)
 const hullSides=(H,mk,colFn,nu,nv)=>{for(const s of[-1,1]){
  const g=rsGrid((u,v)=>{const hF=s>0?v:1-v;return H.pt(u,s,hF);},nu,nv,(u,v,p)=>[p[0]/4,(p[1]-H.yk(u)+Math.abs(p[2]-H.z0))/4]);
  rsGridColors(g,nu,nv,(u,v)=>colFn(u,s>0?v:1-v,s));rsPut(B,mk,g,null,null,null,null);}};
 const hulls=[-4.7,4.7].map(z0=>{
  const H=rsHull({L:34.2,B:2.55,fb:1.46,dr:1.26,sheerF:1.22,sheerA:.92,sp:2.5,pb:2.2,pa:2.3,q:.64,n:1.85,flare:.14,rakeF:1.35,rakeA:.85,keelEnd:.28,z0});
  hullSides(H,'tarwood',(u,h)=>h>.91?CYPD:h>.84?CYP:h<.38?TAR:CYP,68,12);
  foamHull(H,.55);
  rsDeck(B,H,{bw:.24,mk:'tarwood',col:CYPD});
  rsWale(B,H,.9,.065,'paktong',PAK,.03,.97);
  rsWale(B,H,.68,.055,'tarwood',TAR,.04,.96);
  // Paktong white-copper keel & wave-piercing bow stem spine + faired sheer cheek-straps
  const pb=H.pt(1,0,1),pa=H.pt(0,0,1);
  rsSpine(B,H,.14,PAK,[[pb[0]+.55,pb[1]+.42],[pb[0]+1.05,pb[1]+1.05],[pb[0]+1.22,pb[1]+1.65]],[[pa[0]-.32,pa[1]+.55],[pa[0]-.48,pa[1]+1.15]],'paktong');
  for(const s of[-1,1]){
   const p1=H.pt(.86,s,.94),n1=H.nrm(.86,s,.94),p2=H.pt(.94,s,.96),n2=H.nrm(.94,s,.96);
   rsTube(B,'paktong',[[p1[0]+n1.x*.038,p1[1]+n1.y*.038,p1[2]+n1.z*.038],[p2[0]+n2.x*.038,p2[1]+n2.y*.038,p2[2]+n2.z*.038],[pb[0]+.58,pb[1]+.46,z0+s*.055],[pb[0]+1.02,pb[1]+1.02,z0]],t=>lerp(.058,.038,t),PAK,10,6);
   const q1=H.pt(.11,s,.93),m1=H.nrm(.11,s,.93),q2=H.pt(.04,s,.95),m2=H.nrm(.04,s,.95);
   rsTube(B,'paktong',[[q1[0]+m1.x*.036,q1[1]+m1.y*.036,q1[2]+m1.z*.036],[q2[0]+m2.x*.036,q2[1]+m2.y*.036,q2[2]+m2.z*.036],[pa[0]-.3,pa[1]+.52,z0]],t=>lerp(.052,.036,t),PAKD,8,6);
  }
  // Fitted Paktong wave-piercing bow & forefoot armor sheath (offset +0.036 m along hull normal: zero z-fighting)
  const shG=rsGrid((u,v)=>{const uu=lerp(.77,.996,u),s=v<.5?-1:1,hF=1-Math.abs(v*2-1)*.92,hh=lerp(.04,.86,hF);
   const p=H.pt(uu,s,hh),N=H.nrm(uu,s,hh);return[p[0]+N.x*.036,p[1]+N.y*.036,p[2]+N.z*.036];},18,14,(u,v)=>[u*2.2,v*1.8]);
  rsPut(B,'paktong',shG,null,null,null,PAK);
  // Stern Paktong heel & rudder-post sheath
  const stG=rsGrid((u,v)=>{const uu=lerp(.005,.13,u),s=v<.5?-1:1,hh=lerp(.05,.68,1-Math.abs(v*2-1)*.92);
   const p=H.pt(uu,s,hh),N=H.nrm(uu,s,hh);return[p[0]+N.x*.034,p[1]+N.y*.034,p[2]+N.z*.034];},8,10,(u,v)=>[u*1.2,v*1.4]);
  rsPut(B,'paktong',stG,null,null,null,PAKD);
  return H;
 });
 // Heavy red-cypress crossbeams bridging the twin hulls around the central 5 x 4 m Moon-Pool (x in [-2.5,2.5], z in [-2,2])
 const ySheer=hulls[1].ys(.5),yBeam=ySheer+.18,hBeam=.28,yBeamTop=yBeam+hBeam/2;
 const fullBeams=[-12,-9.2,-6.2,-3.05,3.05,6.2,9.2,12];
 for(const x of fullBeams){
  rsBox(B,'wood',[.32,hBeam,11.9],[x,yBeam,0],null,BEAM,2);
  for(const z0 of[-4.7,4.7]){
   rsBox(B,'paktong',[.38,hBeam+.04,.46],[x,yBeam,z0],null,PAKD,1);
   const sOut=Math.sign(z0),uB=hulls[1].uAt(x),pKn=hulls[z0>0?1:0].pt(uB,sOut,.72);
   rsLink(B,'paktong',[pKn[0],pKn[1],pKn[2]+sOut*.04],[x,yBeam-.1,z0+sOut*1.05],.045,PAKD,6);
  }
 }
 // Interrupted midships crossbeams at x = 0 flanking the 5 x 4 m moon-pool
 for(const s of[-1,1]){
  rsBox(B,'wood',[.32,hBeam,3.62],[0,yBeam,s*4.14],null,BEAM,2);
  rsBox(B,'paktong',[.38,hBeam+.04,.46],[0,yBeam,s*4.7],null,PAKD,1);
 }
 // Longitudinal stringer girders under the deck (elevated below yBeamTop: bottom yBeam-.12, top yBeam+.12, clear of crossbeam tops!)
 for(const z of[-3.6,-2.18,2.18,3.6])rsBox(B,'wood',[24.6,.18,.22],[0,yBeam-.02,z],null,CYPD,2);
 // Main bridge deck planking (bottom at yBeamTop + 0.006, top at yD = yBeamTop + 0.086 -> zero coplanar overlap with crossbeams!)
 const thDeck=.08,yDeckMid=yBeamTop+.006+thDeck/2,yD=yBeamTop+.006+thDeck;
 // Fore & aft full-width plank bays (z in [-4.35, 4.35]), leaving central x in [-2.65, 2.65] for moon-pool + side decks
 for(let i=0;i<16;i++){
  const xf=lerp(2.92,12.15,i/15);rsBox(B,'wood',[.54,thDeck,8.68],[xf,yDeckMid,0],null,new THREE.Color(DECK).offsetHSL(0,0,rr(-.025,.025)),2);
  const xa=lerp(-12.15,-2.92,i/15);rsBox(B,'wood',[.54,thDeck,8.68],[xa,yDeckMid,0],null,new THREE.Color(DECK).offsetHSL(0,0,rr(-.025,.025)),2);
 }
 // Port & starboard side-decks flanking the 5 x 4 m moon-pool (x in [-2.6, 2.6], |z| in [2.16, 4.35])
 for(let i=0;i<9;i++){
  const xm=lerp(-2.36,2.36,i/8);
  for(const s of[-1,1])rsBox(B,'wood',[.54,thDeck,2.16],[xm,yDeckMid,s*3.26],null,new THREE.Color(DECK).offsetHSL(0,0,rr(-.02,.02)),2);
 }
 // Central 5 x 4 m Railed Free-Dive Moon-Pool (clear opening 5.0 m x 4.0 m: x in [-2.5, 2.5], z in [-2.0, 2.0])
 // Butt-joined coamings sitting at yD + 0.006 so corners and undersides have zero coplanar overlap
 const hCoam=.44,yCoam=yD+.006+hCoam/2,yCoamTop=yD+.006+hCoam;
 for(const sx of[-1,1])rsBox(B,'tarwood',[.22,hCoam,4.44],[sx*2.61,yCoam,0],null,CYPD,1.5);
 for(const sz of[-1,1])rsBox(B,'tarwood',[4.98,hCoam,.22],[0,yCoam,sz*2.11],null,CYPD,1.5);
 // Paktong corner shoes & top wear-lips on moon-pool coaming (proud by +8 mm)
 for(const sx of[-1,1])for(const sz of[-1,1]){
  rsBox(B,'paktong',[.32,hCoam+.03,.32],[sx*2.61,yCoam+.015,sz*2.11],null,PAK,1);
  // Paktong safety rail stanchions
  rsLink(B,'paktong',[sx*2.61,yCoamTop+.02,sz*2.11],[sx*2.61,yCoamTop+.68,sz*2.11],.038,PAK,6);
 }
 for(const sz of[-1,1]){
  for(const x of[-1.25,0,1.25])rsLink(B,'paktong',[x,yCoamTop+.02,sz*2.11],[x,yCoamTop+.68,sz*2.11],.032,PAK,6);
  rsLink(B,'paktong',[-2.61,yCoamTop+.68,sz*2.11],[2.61,yCoamTop+.68,sz*2.11],.036,PAK,6);
  rsRope(B,[-2.58,yCoamTop+.36,sz*2.11],[2.58,yCoamTop+.36,sz*2.11],.022,ROPE);
 }
 // Fore & aft moon-pool rails with central 1.3 m diver drop-gates
 for(const sx of[-1,1])for(const sz of[-1,1]){
  rsLink(B,'paktong',[sx*2.61,yCoamTop+.02,sz*.72],[sx*2.61,yCoamTop+.68,sz*.72],.034,PAK,6);
  rsLink(B,'paktong',[sx*2.61,yCoamTop+.68,sz*2.11],[sx*2.61,yCoamTop+.68,sz*.72],.034,PAK,6);
 }
 // Submerged Paktong & cedar decompression dive-stage at y = -1.12 m + twin Paktong dive ladders into the sea
 const yStg=-1.12;
 for(const sx of[-1,1])for(const sz of[-1,1])rsLink(B,'paktong',[sx*2.25,yD-.02,sz*1.75],[sx*2.25,yStg-.08,sz*1.75],.035,PAKD,6);
 for(const sz of[-1,1])rsBox(B,'paktong',[4.56,.09,.12],[0,yStg,sz*1.75],null,PAKD,1);
 for(let i=0;i<7;i++){const xs=lerp(-2.05,2.05,i/6);rsBox(B,'tarwood',[.22,.06,3.34],[xs,yStg+.082,0],null,CYP,1.5);}
 // Twin Paktong dive ladders descending along port & starboard inner moon-pool walls to y = -1.72 m
 for(const sz of[-1,1]){
  for(const xl of[-.42,.42])rsLink(B,'paktong',[xl,yCoamTop+.45,sz*1.88],[xl,-1.72,sz*1.88],.03,PAK,6);
  for(let r=0;r<11;r++){const yr=lerp(-1.58,yCoamTop+.25,r/10);rsLink(B,'paktong',[-.4,yr,sz*1.88],[.4,yr,sz*1.88],.022,PAK,5);}
 }
 // Weighted sawn green-nephrite free-dive descent stones hung on braided shot-lines over the moon-pool
 for(const sx of[-1,1]){
  const xd=sx*1.55,zd=sx*.95;
  rsLink(B,'paktong',[xd,yCoamTop+.02,sx*2.11],[xd,yCoamTop+.95,zd],.042,PAK,6);
  rsRope(B,[xd,yCoamTop+.95,zd],[xd,-.45,zd],.024,ROPE);
  rsCyl(B,'jade',.13,.18,.42,[xd,-.66,zd],null,JADE,10);
  rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.09,.024,6,12),.6),[xd,-.41,zd],[0,Math.PI/2,0],null,PAK);
 }
 // Port & Starboard Sawn Green Nephrite Ball-and-Socket Coupling Hinges (3 per outer beam side at z = +-6.05 m)
 for(const s of[-1,1])for(const xh of[-9.2,0,9.2]){
  const zh=s*5.98;
  rsBox(B,'paktong',[.52,.34,.36],[xh,yBeam,zh-s*.14],null,PAKD,1);
  // Sawn emerald nephrite C-socket & spherical coupling ball (separated radially so surfaces are distinct)
  rsPut(B,'jade',rsUV(new THREE.TorusGeometry(.34,.11,8,16,Math.PI*1.35),1),[xh,yBeam,zh+s*.18],[0,s>0?-Math.PI/2:Math.PI/2,0],null,JADE);
  rsSphere(B,'jade',.24,[xh,yBeam,zh+s*.22],null,JADEL,12,10);
  rsCyl(B,'paktong',.055,.055,.68,[xh,yBeam,zh+s*.22],null,PAK,8);
 }
 // Aft Deckhouse Cabin with Sawn Green Nephrite Storm-Lights (x = -7.6, z = 0, w = 6.2, d = 4.6, h = 2.15)
 const cx=-7.6,cw=6.2,cd=4.6,ch=2.15,cy0=yD+.008;
 // Butt-joined walls so zero corner overlap
 for(const sx of[-1,1])rsBox(B,'tarwood',[.18,ch,cd],[cx+sx*(cw/2-.09),cy0+ch/2,0],null,CYP,2);
 for(const sz of[-1,1])rsBox(B,'tarwood',[cw-.38,ch,.18],[cx,cy0+ch/2,sz*(cd/2-.09)],null,CYP,2);
 rsSolid(B,[cx-cw/2-.3,cy0,-cd/2-.3],[cx+cw/2+.3,cy0+ch+.95,cd/2+.3]);
 // Cambered storm-vault roof in tarred red-cypress strapped with Paktong ribs (lifted +8 mm above wall tops)
 rsVault(B,'tarwood',cx-cw/2-.32,cx+cw/2+.32,cy0+ch+.008,cd/2+.28,.72,CYPD,14,12,2.5);
 for(const rx of[cx-2.6,cx,cx+2.6])rsVault(B,'paktong',rx-.09,rx+.09,cy0+ch+.03,cd/2+.31,.75,PAK,2,12,1.5);
 // Sawn emerald-nephrite translucent-cut storm-lights in Paktong bezels (+0.025 m proud of walls)
 for(const sz of[-1,1])for(let i=0;i<3;i++){
  const wx=cx-1.9+i*1.9,wy=cy0+1.26,wz=sz*(cd/2+.022);
  rsBox(B,'paktong',[.68,.54,.04],[wx,wy,wz],null,PAK,1);
  rsBox(B,'jade',[.52,.38,.03],[wx,wy,wz+sz*.024],null,JADEL,1);
 }
 // Fore bulkhead doorway + twin nephrite observation storm-lights overlooking the moon-pool
 rsBox(B,'tarwood',[.05,1.58,.92],[cx+cw/2+.028,cy0+.82,0],null,TAR,1.5);
 for(const sz of[-1,1]){
  rsBox(B,'paktong',[.04,.52,.58],[cx+cw/2+.022,cy0+1.28,sz*1.38],null,PAK,1);
  rsBox(B,'jade',[.03,.36,.42],[cx+cw/2+.046,cy0+1.28,sz*1.38],null,JADEL,1);
 }
 // Bow Cast-Bronze P-Wave Tsunami Gong Frame (x = 10.1, z = 0)
 {const gx=10.1,gy=yD+.008;
  for(const sz of[-1,1]){
   rsBox(B,'paktong',[.46,.14,.46],[gx,gy+.07,sz*1.28],null,PAKD,1);
   rsLink(B,'tarwood',[gx,gy+.14,sz*1.28],[gx+.18,gy+2.68,sz*1.02],.11,CYP,8,.085);
   rsLink(B,'tarwood',[gx-.75,gy+.04,sz*1.28],[gx+.08,gy+1.95,sz*1.08],.065,CYPD,6);
   rsLink(B,'paktong',[gx+.15,gy+2.18,sz*1.06],[gx+.18,gy+2.68,sz*.58],.045,PAK,6);
   rsBox(B,'jade',[.32,.14,.36],[gx+.18,gy+2.62,sz*1.02],null,JADE,1);
  }
  // Curved Paktong & red-cypress top lintel + upturned horn finials
  rsBox(B,'tarwood',[.26,.22,2.76],[gx+.18,gy+2.78,0],null,CYP,1.5);
  rsBox(B,'paktong',[.3,.1,3.12],[gx+.18,gy+2.95,0],null,PAK,1);
  // Cast-bronze P-wave Tsunami Gong disc + central boss + suspended nephrite seismic striker
  const gcy=gy+1.52;
  rsCyl(B,'bronze',.68,.68,.09,[gx+.18,gcy,0],[0,0,Math.PI/2],BRZ,24);
  rsSphere(B,'bronze',.19,[gx+.25,gcy,0],[.55,1,1],rsLin(0xdca844),10,8);
  for(const sz of[-1,1])rsRope(B,[gx+.18,gy+2.66,sz*.42],[gx+.18,gcy+.52,sz*.36],.02,ROPE);
  rsRope(B,[gx+.38,gy+2.66,0],[gx+.38,gcy+.04,0],.016,ROPE);
  rsSphere(B,'jade',.1,[gx+.38,gcy,0],[1,1.3,1],JADEL,8,6);
 }
 // Perimeter deck lifelines on Paktong stanchions
 for(const s of[-1,1]){
  const pts=[[-12,s*4.25],[-8,s*4.25],[-4,s*4.25],[0,s*4.25],[4,s*4.25],[8,s*4.25],[12,s*4.25]];
  for(const [px,pz] of pts)rsLink(B,'paktong',[px,yD+.01,pz],[px,yD+.88,pz],.032,PAKD,5);
  for(let i=0;i<pts.length-1;i++)rsRope(B,[pts[i][0],yD+.84,pts[i][1]],[pts[i+1][0],yD+.84,pts[i+1][1]],.022,ROPE);
 }
 // Twin twin-masted rust-red catechu crab-claw sails (4 sails: fore & main stepped outboard at z = +-4.7 m, clear of cabin!)
 const clawRig=(mx,mz,mh,wClaw,gain)=>{
  const uM=hulls[1].uAt(mx),yStep=hulls[1].ys(uM)-.18;
  const foot=[mx,yStep,mz],head=[mx+.65,yStep+mh*.62,mz];
  // Solid mast partner block + raked red-cypress mast spar (blocks walker cleanly at mast foot)
  rsBox(B,'paktong',[.54,.36,.54],[mx,yStep+.36,mz],null,PAKD,1);
  rsLink(B,'wood',foot,head,.16,CYP,8,.105);
  rsRig(B,[foot,head],{gain});
  const tack=[mx+2.8,yStep+.62,mz+Math.sign(mz)*.08];
  const S=rsSail(B,{key:'ark-catechu-claw',O:tack,U:[-1,0,0],V:[0,1,0],belly:mz>0?.85:-.85,nu:22,nv:12,
   A:t=>[t*wClaw*.72+Math.sin(Math.PI*t)*.85,t*mh],
   Bf:t=>[t*wClaw,t*mh*.3+Math.sin(Math.PI*t)*.75],draw:rsArkCatechuClaw});
  rsSailEdge(B,S,0,.105,CYP,0,1.03,'wood');
  rsSailEdge(B,S,1,.09,CYP,0,1.02,'wood');
  rsRope(B,[head[0],head[1]-.1,head[2]],S.at(.38,0),.03,ROPE);
  rsRope(B,S.at(.82,1),[mx-wClaw*.62,yStep+.55,mz],.026,ROPE);
  const tip=S.at(1.03,0);rsPennant(B,tip,2.4,.24,[JADEL,PAK,rsLin(0x8c2d1e)]);
  rsRigEnd(B);
  rsRope(B,head,[mx+4.2,hulls[1].ys(hulls[1].uAt(mx+4.2)),mz],.026,ROPE);
  rsRope(B,head,[mx-2.2,yBeam,mz+Math.sign(mz)*.85],.024,ROPE);
 };
 for(const s of[-1,1]){
  clawRig(6.8,s*4.7,16.8,9.8,.62);
  clawRig(-6.2,s*4.7,14.6,8.4,.42);
 }
 // Twin stern Paktong-shod steering sweeps
 for(const s of[-1,1]){
  rsLink(B,'wood',[-13.4,hulls[1].ys(.08)+.35,s*5.15],[-17.6,-1.28,s*5.55],.11,CYP,6);
  rsBox(B,'paktong',[2.2,.88,.08],[-17.1,-.96,s*5.5],[0,0,.64],PAK,1);
 }
 // Breath-hold cFlīt-qBōn crew & divers on deck and at the moon-pool
 for(const [fx,fz,yaw,col] of[[2.95,-.8,Math.PI,JADE],[-2.95,.9,0,rsLin(0x7c281c)],[8.6,1.4,0,PAKD],[4.6,-3.1,.6,JADE],[-4.2,3.2,-.4,rsLin(0x7c281c)],[-11.2,0,Math.PI,PAKD]])
  rsFigure(B,[fx,yD,fz],yaw,col,false,0x6e4c36);
 // Coiled dive lines & woven catch-baskets on the foredeck
 for(const sz of[-1,1]){
  rsPut(B,'rope',rsUV(new THREE.TorusGeometry(.42,.11,8,16),1),[4.2,yD+.12,sz*2.95],[Math.PI/2,0,0],null,ROPE);
  rsCyl(B,'thatch',.34,.28,.48,[5.4,yD+.25,sz*2.85],null,rsLin(0x9a8258),10);
 }
 rsBake(B,V.group,'arkCatamaran');V.deckY=yD;return V;
}
RS_VESSEL({key:'arkCatamaran',name:'cFlīt-qBōn Great Moon-Pool Ark-Catamaran',culture:'cflit-qbon',L:36,B:14,H:21,
 tags:{type:['flagship','ark-catamaran','diving mother-ship','dwelling'],propulsion:['sail','sweeps'],hull:'catamaran',wealth:'state',crew:48,role:'pelagic living ark and 100 m breath-hold trench-diving flagship'},
 blurb:'Twin deep-V bitumen-caulked red-cypress hulls sheathed in Paktong white-copper around a 5x4 m railed Free-Dive Moon-Pool, four catechu-red crab-claw sails, nephrite storm-lights, bow tsunami gong and nephrite coupling hinges.',build:buildRsArkCatamaran});
