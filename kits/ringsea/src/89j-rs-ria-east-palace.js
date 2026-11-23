// ---------------------------------------------------------------- vessel: Upper-Ria Dynastic Swan-Prow Palace-Barge
// Ceremonial palace-barge of the Eastern (Upper Ria) Dynasty: a cream-dolomite, red-porphyry, and silver-bronze terraced
// floating palace whose bow is seamlessly embraced by a monumental Crested Silver-Bronze Swan/Heron Prow: sweeping
// feathered cheek-wings fair 9 m aft along port and starboard bows, housing a recessed arched chest herald-balcony and
// tapering organically through sculpted gorget collars into a tall S-curved silver neck and 7-plume crowned head. Behind
// rise a silver-domed bow shrine, a scalloped cobalt-and-ivory striped silk sun-velarium, exterior grand side stairs
// ascending to semicircular colonnaded upper courts, and a two-storey aft palace under twin crow's-nest banner-masts.
function buildRsRiaEastPalaceBarge(){reseed(74800);
 if(!RSMAT.stone||!RSMAT.glaze||!RSMAT.silk||!RSMAT.paktong){
  const tSto=rsNoiseTex('extSto',256,256,(g,W,H)=>{g.fillStyle='#ded8ce';g.fillRect(0,0,W,H);rsSpeckle(g,W,H,700,.07,true);});
  const tGlz=rsNoiseTex('extGlz',256,256,(g,W,H)=>{g.fillStyle='#cfd8dc';g.fillRect(0,0,W,H);rsSpeckle(g,W,H,500,.06,false);});
  const tSlk=rsNoiseTex('extSlk',256,256,(g,W,H)=>{g.fillStyle='#ece8e0';g.fillRect(0,0,W,H);});
  const tMet=rsNoiseTex('extPak',256,256,(g,W,H)=>{g.fillStyle='#dcdad4';g.fillRect(0,0,W,H);rsSpeckle(g,W,H,500,.06,true);});
  const tRope=rsNoiseTex('extRop',128,128,(g,W,H)=>{g.fillStyle='#d6ceb8';g.fillRect(0,0,W,H);for(let i=-H;i<W+H;i+=8){g.strokeStyle='rgba(60,44,24,.28)';g.lineWidth=3;g.beginPath();g.moveTo(i,0);g.lineTo(i+H,H);g.stroke();}});
  if(!RSMAT.stone)rsDefMat('stone',new THREE.MeshStandardMaterial({map:tSto,vertexColors:true,roughness:.38,side:DS}));
  if(!RSMAT.glaze)rsDefMat('glaze',new THREE.MeshStandardMaterial({map:tGlz,vertexColors:true,roughness:.24,metalness:.06,side:DS}));
  if(!RSMAT.silk)rsDefMat('silk',new THREE.MeshStandardMaterial({map:tSlk,vertexColors:true,roughness:.52,side:DS}));
  if(!RSMAT.paktong)rsDefMat('paktong',new THREE.MeshStandardMaterial({map:tMet,vertexColors:true,metalness:.82,roughness:.28,side:DS}));
  if(!RSMAT.metal.map){RSMAT.metal.map=tMet;RSMAT.metal.needsUpdate=true;}
  if(!RSMAT.rope.map){RSMAT.rope.map=tRope;RSMAT.rope.needsUpdate=true;}
 }
 if(!RSMAT.foamT){
  const tFoam=rsNoiseTex('extFoam',128,128,(g,W,H)=>{g.fillStyle='#dceeee';g.fillRect(0,0,W,H);for(let i=0;i<220;i++){g.fillStyle=`rgba(255,255,255,${.2+.45*h3(i,3,8)})`;g.beginPath();g.arc(h3(i,1,2)*W,h3(i,5,4)*H,2+h3(i,7,6)*7,0,TAU);g.fill();}});
  rsDefMat('foamT',new THREE.MeshBasicMaterial({map:tFoam,color:0xe8f6f6,transparent:true,opacity:.44,depthWrite:false,side:DS}));
 }
 if(typeof KMAT!=='undefined'&&KMAT.bindMat)KMAT.bindMat('ringsea',RSMAT,{alias:{woodI:'wood',paktong:'metal'},tile:{metal:1,paktong:1,rope:1,stone:1,glaze:1,silk:1}});
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const DOLO=rsLin(0xeae3d4),DOLOD=rsLin(0xcfc6b2),PORP=rsLin(0x7e292b),BRONZE=rsLin(0x8e6b46);
 const SILV=rsLin(0xd8dfe8),SILVL=rsLin(0xe8eef4),SILVD=rsLin(0x9ea8b6),GOLD=rsLin(0xd6a438),COB=rsLin(0x1c4f8a),TURQ=rsLin(0x248690),IVORY=rsLin(0xf4f0e6);
 // Graceful cream-dolomite & silver-bronze clad palace hull (47 m x 14.4 m)
 const H=rsHull({L:47,B:14.4,fb:2.55,dr:1.55,sheerF:1.75,sheerA:2.35,sp:2.5,pb:2.25,pa:2.15,q:.48,n:2.9,flare:.1,rakeF:1.9,rakeA:1.6,keelEnd:.35});
 rsHullMesh(B,H,'stone',(u,h)=>h>.92?SILV:h>.84?PORP:h<.33?BRONZE:DOLO,80,14);
 {const pts=[];for(let i=0;i<=50;i++){const u=i/50,hw=H.halfAt(u,0);if(hw>0)pts.push([u,hw]);}
  const hF0=u=>clamp((0-H.yk(u))/(H.ys(u)-H.yk(u)),0,1);
  for(const s of[-1,1]){const fg=rsGrid((a,v)=>{const k=Math.min(pts.length-1,Math.round(a*(pts.length-1))),u=pts[k][0],hw=pts[k][1];
   return[H.xAt(u,hF0(u)),.038,s*(hw+.02+v*.9*(.4+.6*Math.sin(Math.PI*a)))];},pts.length-1,1,(a,v)=>[a*8,v]);rsPut(B,'foamT',fg,null,null,null,0xffffff);}}
 const dY=rsDeck(B,H,{bw:.5,mk:'wood',col:rsLin(0xb89668)});
 const yD=dY(.5);
 rsWale(B,H,.92,.1,'paktong',SILV,.04,.82);
 rsWale(B,H,.74,.085,'paktong',GOLD,.05,.81);
 rsSpine(B,H,.22,SILVD,null,null,'paktong');
 // Silver-bronze swan-wing relief bosses along midships hull topsides + 36 synchronized silver-bladed sweeps (18 per side)
 for(const a of rsAlong(H,.18,.74,7,.78)){
  rsDecal(B,H,a.u,a.s,.78,.46,SILV,'paktong',16,.04);
  rsDecal(B,H,a.u,a.s,.78,.24,TURQ,'glaze',12,.075);
 }
 const oarPts=[];
 for(let i=0;i<18;i++)oarPts.push([lerp(-14.8,11.6,i/17),yD-.28,H.hb(.5)+.32]);
 rsOars(V,H,{name:'silver sweeps',points:oarPts,len:5.9,inb:1.6,r:.052,bladeL:1.25,bladeW:.24,col:0xcfd6de,sweep:.38,lift:.15,rate:.4,ripple:.45});
 // 1. Seamless Monumental Crested Silver-Bronze Swan / Great Heron Prow Embracing the Bow (`5a273f5e.jpg`!)
 {const pb=H.pt(1,0,1),bx=pb[0],by=pb[1];
  // Neck-root collar center where the entire sculpted swan breast & cheek-wings converge seamlessly (ZERO flat top!)
  const nx0=bx+.35,ny0=by+1.95,rNeck0=1.06;
  // Sweeping Hull-Hugging Swan Breast & Port/Starboard Feathered Cheek-Wings (u = 0 port wing -> 0.5 chest prow -> 1 stbd wing):
  // Trailing wings start 9.5 m aft on the hull (`uHull = 0.79`) only 4.5 cm proud of `H.pt`, swelling forward around the
  // stem into the full sculpted swan chest (`+2.7 m` ahead of `pb[0]`) and converging smoothly at `v = 1` into the neck collar!
  const breastPt=(u,v)=>{
   const w=u*2-1,aw=Math.abs(w),s=w<0?-1:1;
   const uHull=lerp(1.0,.79,Math.pow(aw,.82));
   // Lower edge rises gently toward the aft wing-tips like a folded swan wing (`5a273f5e.jpg`!)
   const hLow=lerp(.06,.52,aw*aw),hHigh=lerp(1.0,.98,aw);
   const hF=lerp(hLow,hHigh,Math.min(1,v*1.18));
   const hp=H.pt(uHull,s,hF),hn=H.nrm(uHull,s,hF);
   // Proudness swells smoothly from 0.045 m at wing-tip (`aw=1`) to full sculpted chest forward of stem (`aw=0`)
   const chest=Math.pow(Math.max(0,1-aw),1.45),vBelly=Math.sin(Math.min(1,v*1.08)*Math.PI*.88);
   const outLat=.045+.58*(1-aw*aw)*vBelly;
   const outFwd=chest*(2.65*Math.sin(v*Math.PI*.82)+.55*v);
   const hx=hp[0]+hn.x*outLat+outFwd,hy=hp[1]+chest*v*.75,hz=(aw<1e-4?0:hp[2]+hn.z*outLat)*(1+.14*chest*vBelly);
   // Smoothly converge upper breast (`v in 0.62..1.0`) directly onto the tilted circular neck-root collar!
   const kTop=smooth01((v-.62)/.38);
   const ang=(w*.94)*Math.PI; // wraps almost all the way round the back of the neck root!
   const cx=nx0-Math.cos(ang)*rNeck0*1.08,cy=ny0-.18*Math.cos(ang),cz=Math.sin(ang)*rNeck0*.96;
   return[lerp(hx,cx,kTop),lerp(hy,cy,kTop),lerp(hz,cz,kTop)];
  };
  const breastG=rsGrid(breastPt,36,18,(u,v)=>[u*6,v*3.8]);
  rsGridColors(breastG,36,18,(u,v)=>v>.82?SILVL:v<.18?SILVD:SILV);
  rsPut(B,'chitin',breastG,null,null,null,null);
  // Aft Breast-Deck Apron closing the back of the neck-root cleanly down onto the foredeck (zero open rim from behind!)
  const backG=rsGrid((u,v)=>{
   const w=u*2-1,ang=w*.94*Math.PI;
   const top=[nx0-Math.cos(ang)*rNeck0*1.08,ny0-.18*Math.cos(ang),Math.sin(ang)*rNeck0*.96];
   const uH=lerp(.94,.8,Math.abs(w)),dk=[H.xAt(uH,1),dY(uH)+.06,w*H.halfAt(uH,dY(uH))*.88];
   return[lerp(dk[0],top[0],v),lerp(dk[1],top[1],v),lerp(dk[2],top[2],v)];
  },18,6,(u,v)=>[u*3,v*1.5]);
  rsPut(B,'chitin',backG,null,null,null,SILV);
  // Gilded & silver-bronze wing-margin border tubes hugging the port & starboard hull sheer and wing sweeps (`5a273f5e.jpg`!)
  for(const s of[-1,1]){
   const uSide=s<0?0:1,wRim=[],wLow=[];
   for(let i=0;i<=14;i++){
    const f=i/14;
    wRim.push(breastPt(lerp(.5,uSide,f),.76));
    wLow.push(breastPt(lerp(.18,.98,f)*s*.5+.5,.08));
   }
   rsTube(B,'paktong',wRim,t=>lerp(.11,.055,t),GOLD,24,7);
   rsTube(B,'paktong',wLow,t=>lerp(.09,.05,t),SILVL,22,7);
   // Embossed wing-shoulder spiral roundels seamlessly seated on the cheek-wings (`5a273f5e.jpg`!)
   const wp=breastPt(.5+s*.27,.38);
   rsCyl(B,'paktong',1.08,1.08,.14,[wp[0],wp[1],wp[2]+s*.04],[Math.PI/2,s*.18,s*.28],SILVL,22);
   rsCyl(B,'paktong',.64,.64,.18,[wp[0]+.02,wp[1],wp[2]+s*.09],[Math.PI/2,s*.18,s*.28],GOLD,18);
   rsSphere(B,'glaze',.24,[wp[0]+.04,wp[1],wp[2]+s*.16],[1,1,.55],TURQ,10,8);
  }
  // Diagonal gilded breast-baldric bands crossing the swan's chest (`5a273f5e.jpg`!)
  for(const vBand of[.42,.64]){
   const bPts=[];
   for(let i=0;i<=14;i++)bPts.push(breastPt(lerp(.16,.84,i/14),vBand));
   rsTube(B,'paktong',bPts,.068,GOLD,22,6);
  }
  // Cleanly Framed Recessed Chest Herald Lookout-Balcony in the Swan's Breast (`5a273f5e.jpg`!)
  const cp=breastPt(.5,.4),hbx=cp[0]-.12,hby=cp[1]+.05;
  // Molded silver-and-gold horseshoe portal arch framing the chest alcove
  rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.92,.14,9,22,Math.PI*1.12),1),[hbx+.06,hby+.12,0],[0,Math.PI/2,-.18],null,SILVL);
  rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(1.04,.055,7,22,Math.PI*1.12),.8),[hbx+.1,hby+.12,0],[0,Math.PI/2,-.18],null,GOLD);
  rsCyl(B,'glaze',.82,.82,.42,[hbx-.18,hby+.12,0],[0,0,Math.PI/2],rsLin(0x132232),18);
  // Cantilevered semicircular balcony deck + corbel + turned silver balustrade & herald
  rsCyl(B,'stone',1.06,.58,.32,[hbx+.28,hby-.48,0],null,DOLO,18);
  rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(1.02,.055,7,18,Math.PI),.8),[hbx+.28,hby+.22,0],[Math.PI/2,0,-Math.PI/2],null,GOLD);
  for(let k=0;k<=6;k++){
   const a=(k/6-.5)*Math.PI*.92,rx=hbx+.28+Math.cos(a)*.98,rz=Math.sin(a)*.98;
   rsLink(B,'paktong',[rx,hby-.32,rz],[rx,hby+.22,rz],.034,SILVL,6);
  }
  rsFigure(B,[hbx+.32,hby-.32,0],0,TURQ,false,0x9e7052);
  // Overlapping Sculpted Gorget Collar Rings smoothly fairing the Breast into the S-Curved Swan Neck!
  for(let c=0;c<3;c++){
   const rr0=rNeck0*(1.04-c*.09),cy=ny0-.06+c*.34,cx=nx0+c*.16;
   rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(rr0,.085,8,24),1.2),[cx,cy,0],[Math.PI/2,-.22,0],null,c===1?GOLD:SILVL);
  }
  // Towering Graceful S-Curved Silver-Bronze Swan Neck (`r = 1.06 -> 0.34`, continuous tangent from breast!)
  const neckPts=[
   [nx0,ny0-.18,0],
   [nx0+1.15,ny0+1.65,0],
   [nx0+.15,ny0+3.95,0],
   [nx0+.85,ny0+5.75,0],
   [nx0+2.35,ny0+6.05,0],
   [nx0+3.35,ny0+5.65,0]
  ];
  rsTube(B,'chitin',neckPts,t=>lerp(1.04,.33,Math.pow(t,.68)),SILVL,32,14);
  rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.58,.065,8,20),1),[nx0+.38,ny0+4.55,0],[Math.PI/2,.32,0],null,GOLD);
  // Finely Sculpted Crested Swan/Heron Head, Arched Brow, Cobalt Eyes, Basal Cere & Two-Part Tapered Bill (`5a273f5e.jpg`!)
  const hx=nx0+3.52,hy=ny0+5.55;
  rsSphere(B,'paktong',.5,[hx,hy,0],[1.5,.98,.86],SILVL,16,12);
  // Basal bill cere + upper & lower tapered silver-gilt bill
  rsSphere(B,'paktong',.26,[hx+.68,hy-.08,0],[1.2,.88,.78],GOLD,10,8);
  rsCone(B,'paktong',.21,2.05,[hx+1.58,hy-.36,0],[0,0,-Math.PI/2-.24],SILVL,12);
  rsCone(B,'paktong',.14,1.65,[hx+1.38,hy-.48,0],[0,0,-Math.PI/2-.28],SILVD,10);
  for(const s of[-1,1]){
   rsSphere(B,'glaze',.125,[hx+.24,hy+.1,s*.39],[1.25,.85,.7],COB,10,8);
   // Sweeping silver eye-scroll ridge (`5a273f5e.jpg`!)
   rsTube(B,'paktong',[[hx+.52,hy+.16,s*.32],[hx+.18,hy+.26,s*.42],[hx-.48,hy+.32,s*.36],[hx-.95,hy+.52,s*.24]],t=>lerp(.06,.028,t),SILVL,12,6);
  }
  // 7-Plume Royal Crown Crest sweeping back from the occiput!
  for(let p=0;p<7;p++){
   const pf=p/6,zOff=(p%2?(p+1)/2:-(p/2))*.045;
   rsTube(B,'paktong',[[hx-.05-pf*.45,hy+.34,zOff],[hx-.55-pf*.68,hy+.88-pf*.14,zOff*1.4],[hx-1.05-pf*.78,hy+1.18-pf*.26,zOff*1.6]],t=>lerp(.095,.02,t),p%2?GOLD:SILVL,10,6);
  }
 }
 // Sculpted Feathered Silver Stern-Bustle fairing into 7 Sweeping Swan Tail-Plumes (`5a273f5e.jpg`!)
 {const pa=H.pt(0,0,1);
  const stBustle=rsGrid((u,v)=>{
   const w=u*2-1,aw=Math.abs(w),s=w<0?-1:1,uH=lerp(0,.09,aw);
   const hp=H.pt(uH,s,lerp(.45,1,v)),hn=H.nrm(uH,s,lerp(.45,1,v));
   const out=.04+.45*(1-aw)*Math.sin(v*Math.PI*.85);
   return[hp[0]-out*1.2+hn.x*.04,hp[1]+(1-aw)*v*.65,aw<1e-4?0:hp[2]+hn.z*out];
  },18,8,(u,v)=>[u*3,v*1.5]);
  rsPut(B,'chitin',stBustle,null,null,null,SILV);
  for(let k=-3;k<=3;k++){
   const zk=k*.52,hk=4.15-Math.abs(k)*.34;
   rsTube(B,'paktong',[[pa[0]+.25,pa[1]+.2,zk*.4],[pa[0]-.95,pa[1]+1.75,zk*.8],[pa[0]-2.05,pa[1]+hk,zk]],t=>lerp(.26,.05,t),Math.abs(k)%2?GOLD:SILVL,14,8);
  }
 }
 // 2. Forward Silver-Domed Bow Shrine Rotunda (x = 13.6) + Scalloped Cobalt-and-Ivory Striped Silk Sun-Velarium (`326b8287.jpg`!)
 {const sx=13.6,sy0=yD+.008;
  rsCyl(B,'stone',2.45,2.65,.34,[sx,sy0+.17,0],null,DOLO,20);
  for(let k=0;k<8;k++){
   const a=k*TAU/8;
   rsCyl(B,'stone',.13,.15,2.25,[sx+Math.cos(a)*2.05,sy0+.35+1.125,Math.sin(a)*2.05],null,PORP,8);
   rsCyl(B,'paktong',.2,.14,.14,[sx+Math.cos(a)*2.05,sy0+2.54,Math.sin(a)*2.05],null,SILV,8);
  }
  const sdG=rsGrid((u,v)=>{const a=u*TAU,p=v*Math.PI*.48,r=2.34*Math.cos(p);return[sx+Math.cos(a)*r,sy0+2.64+Math.sin(p)*1.48,Math.sin(a)*r];},24,10,(u,v)=>[u*4,v*1.5]);
  rsPut(B,'paktong',sdG,null,null,null,SILVL);
  rsSphere(B,'paktong',.24,[sx,sy0+4.28,0],null,GOLD,10,8);
  rsSolid(B,[sx-2.6,sy0,-2.6],[sx+2.6,sy0+4.4,2.6]);
 }
 // Cobalt-and-Ivory Striped Silk Sun-Velarium Canopy with Scalloped Gilt Valance Borders (x in [1.8, 9.8], z in [-4.4, 4.4])
 {const vx0=1.8,vx1=9.8,vy=yD+3.35;
  for(const px of[vx0,5.8,vx1])for(const s of[-1,1]){
   rsLink(B,'paktong',[px,yD+.01,s*4.35],[px,vy+.18,s*4.35],.068,GOLD,6);
   rsSphere(B,'paktong',.13,[px,vy+.28,s*4.35],null,SILVL,8,6);
  }
  for(const s of[-1,1]){
   rsLink(B,'paktong',[vx0,vy,s*4.35],[vx1,vy,s*4.35],.052,GOLD,6);
   // Scalloped hanging silk valance fringe along port & starboard eaves
   const valG=rsGrid((u,v)=>{const xx=lerp(vx0+.06,vx1-.06,u),drop=.34+.14*Math.abs(Math.sin(u*Math.PI*10));
    return[xx,vy-.04-v*drop,s*4.39];},30,3,(u,v)=>[u*6,v]);
   rsPut(B,'silk',valG,null,null,null,COB);
  }
  for(let st=0;st<10;st++){
   const xa=lerp(vx0+.08,vx1-.84,st/9),xb=xa+.74;
   const sg=rsGrid((u,v)=>{const zz=lerp(-4.32,4.32,v),arch=Math.cos((v-.5)*Math.PI)*.44;
    return[lerp(xa,xb,u),vy+arch,zz];},2,12,(u,v)=>[u,v*4]);
   rsPut(B,'silk',sg,null,null,null,st%2?COB:IVORY);
  }
  rsSolid(B,[vx0-.2,vy-.1,-4.5],[vx1+.2,vy+.55,4.5]);
 }
 // 3. Semicircular Colonnaded Upper Court & Tiered Aft Palace (`5a273f5e.jpg`!) (x in [-17.6, +1.2])
 const yT1=yD+2.15,yT2=yT1+2.55;
 {
  rsBox(B,'stone',[14.8,2.14,9.2],[-10.0,yD+.008+1.07,0],null,DOLO,2);
  const apseG=rsGrid((u,v)=>{const a=(u-.5)*Math.PI,r=4.54;return[-2.6+Math.cos(a)*r,lerp(yD+.012,yT1-.006,v),Math.sin(a)*r];},18,4,(u,v)=>[u*4,v*1.5]);
  rsPut(B,'stone',apseG,null,null,null,DOLOD);
  const capG=rsGrid((u,v)=>{const a=(u-.5)*Math.PI,r=v*4.58;return[-2.6+Math.cos(a)*r,yT1+.008,Math.sin(a)*r];},18,4,(u,v)=>[u*3,v*2]);
  rsPut(B,'stone',capG,null,null,null,DOLO);
  // Semicircular Red-Porphyry & Silver-Arched Colonnade + Parapet Balustrade on the Apse Terrace!
  for(let k=0;k<=8;k++){
   const a=(k/8-.5)*Math.PI*.88,cx=-2.6+Math.cos(a)*3.95,cz=Math.sin(a)*3.95;
   rsCyl(B,'stone',.15,.17,2.15,[cx,yT1+.015+1.075,cz],null,PORP,10);
   rsCyl(B,'paktong',.23,.16,.16,[cx,yT1+2.25,cz],null,SILVL,10);
  }
  const archR=rsGrid((u,v)=>{const a=(u-.5)*Math.PI*.92,r=lerp(3.62,4.28,v);return[-2.6+Math.cos(a)*r,yT1+2.38,Math.sin(a)*r];},18,2,(u,v)=>[u*4,v]);
  rsPut(B,'paktong',archR,null,null,null,SILVL);
  const archTop=rsGrid((u,v)=>{const a=(u-.5)*Math.PI*.92,r=4.22;return[-2.6+Math.cos(a)*r,lerp(yT1+2.4,yT1+2.76,v),Math.sin(a)*r];},18,2,(u,v)=>[u*4,v]);
  rsPut(B,'glaze',archTop,null,null,null,TURQ);
  // Twin exterior stone stairs ascending port & starboard from main deck up to yT1!
  for(const s of[-1,1]){
   for(let st=0;st<7;st++)rsBox(B,'stone',[.42,.29,1.28],[.4-st*.46,yD+.15+st*.29,s*5.35],null,DOLO,1);
   rsLink(B,'paktong',[.65,yD+.75,s*5.98],[-2.6,yT1+.75,s*5.98],.065,SILVL,6);
   rsLink(B,'paktong',[.65,yD+.12,s*5.98],[.65,yD+.75,s*5.98],.06,GOLD,6);
  }
  // Upper Aft Palace Hall (x in [-16.6, -5.8], z in [-4.1, 4.1]) in dolomite, porphyry & gold bands (`5a273f5e.jpg`!)
  rsBox(B,'stone',[10.8,2.52,8.2],[-11.2,yT1+.012+1.26,0],null,DOLO,2);
  rsBox(B,'glaze',[11.0,.36,8.4],[-11.2,yT1+1.95,0],null,PORP,1.5);
  rsBox(B,'paktong',[11.2,.24,8.6],[-11.2,yT2+.13,0],null,GOLD,1.5);
  for(const s of[-1,1])for(let w=0;w<4;w++){
   const wx=-14.8+w*2.4;
   rsBox(B,'glaze',[.85,1.05,.04],[wx,yT1+1.15,s*4.13],null,TURQ,1);
   rsBox(B,'paktong',[.98,.12,.06],[wx,yT1+1.74,s*4.14],null,SILVL,1);
  }
  // Upper roof balustrade + twin silver-bronze cupolas with gilded finials
  for(const s of[-1,1]){
   rsLink(B,'paktong',[-16.6,yT2+.88,s*4.1],[-5.8,yT2+.88,s*4.1],.055,SILVL,6);
   for(let p=0;p<6;p++){const px=lerp(-16.4,-6.0,p/5);rsLink(B,'paktong',[px,yT2+.26,s*4.1],[px,yT2+.86,s*4.1],.035,GOLD,5);}
  }
  for(const cx of[-14.2,-8.2]){
   rsCyl(B,'stone',1.35,1.45,.75,[cx,yT2+.64,0],null,DOLOD,14);
   rsCone(B,'paktong',1.58,1.38,[cx,yT2+1.72,0],null,SILVL,14);
   rsSphere(B,'paktong',.18,[cx,yT2+2.48,0],null,GOLD,8,6);
  }
  rsSolid(B,[-17.5,yD+.01,-4.7],[1.3,yT2+2.6,4.7]);
  // Two tall ceremonial gilded banner-masts with crow's-nest galleries & streaming cobalt/silver pennants (`5a273f5e.jpg`!)
  for(const [mx,baseY,mh] of[[1.8,yD,16.2],[-8.2,yT2+.26,11.6]]){
   rsCyl(B,'paktong',.34,.38,.36,[mx,baseY+.19,0],null,GOLD,10);
   rsLink(B,'wood',[mx,baseY+.02,0],[mx,baseY+mh,0],.2,rsLin(0x9c6e3c),8,.12);
   const gy=baseY+mh*.48;
   rsCyl(B,'paktong',.95,.55,.22,[mx,gy,0],null,SILVL,16);
   rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.95,.045,6,18),.8),[mx,gy+.52,0],[Math.PI/2,0,0],null,GOLD);
   rsPennant(B,[mx,baseY+mh+.12,0],4.4,.52,[SILVL,COB,TURQ]);
   for(const s of[-1,1])rsRope(B,[mx,baseY+mh-.3,0],[mx-1.2,yD+.6,s*5.8],.028,SILVD);
  }
 }
 // Potted citrus/ornamental shrubs & Upper-Ria nobles in ivory and turquoise robes
 for(const s of[-1,1])for(const px of[4.2,8.4]){
  rsCyl(B,'glaze',.38,.3,.54,[px,yD+.28,s*3.65],null,TURQ,10);
  rsSphere(B,'thatch',.55,[px,yD+.95,s*3.65],[1,1.15,1],rsLin(0x2e5e32),10,8);
 }
 for(const [px,py,pz,yaw,col] of[[10.6,yD,0,0,IVORY],[6.2,yD,-1.8,.5,COB],[5.4,yD,1.9,-.4,TURQ],[-1.2,yT1+.02,0,0,IVORY],[-11.2,yT2+.26,1.8,0,GOLD],[2.2,yD,5.6,0,SILVL]])
  rsFigure(B,[px,py,pz],yaw,col,false,0x9e7052);
 rsBake(B,V.group,'riaEastPalaceBarge');V.deckY=yD;return V;
}
RS_VESSEL({key:'riaEastPalaceBarge',name:'Upper-Ria Dynastic Swan-Prow Palace-Barge',culture:'ria',L:52,B:26,H:19,
 tags:{type:['palace barge','royal barge','state','galley'],propulsion:['oars'],hull:'monohull',wealth:'royal',crew:120,role:'ceremonial floating palace of the Eastern Upper-Ria Dynasty'},
 blurb:'Cream-dolomite, red-porphyry and silver-bronze palace-barge seamlessly embraced at the bow by a Crested Silver-Bronze Swan/Heron Prow with swept cheek-wings and a chest balcony, striped sun-velarium, semicircular colonnaded upper courts and 36 silver sweeps.',build:buildRsRiaEastPalaceBarge});
