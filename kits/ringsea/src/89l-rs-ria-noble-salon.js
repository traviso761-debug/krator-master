// ---------------------------------------------------------------- vessel: Ria Noble House State Salon Barge
// Sleek 28 m ceremonial envoy and state salon-barge of the Ria Valley's noble houses (`image_2.png`): a double-ended
// crimson-oxblood hull banded in turquoise glaze and silver-gilt filigree, whose bow and stern swell seamlessly through
// sweeping gilded filigree cheek-fairings and double-volute acanthus brackets into a muscular tapered S-curved Gilded
// Bighorn-Ram Prow Figurehead and Crested Kingfisher Tail-Finial, framing a full-length vaulted canopy with scalloped
// gilt valance pelmets, sheer billowing white silk curtains, and twelve gilded ceremonial sweeps.
function rsRiaNobleCrest(B,kind,pos,dir,goldCol,accCol){
 // Modular Ria Noble-Family Animal Crest builder ('ram' | 'kingfisher' | 'heron'): zero Egyptian motifs
 const [px,py,pz]=pos;
 if(kind==='ram'){
  // Sculpted collar ring + Noble House of the Bighorn gilded ram head + twin sweeping spiralled horns!
  rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.24,.052,7,18),.6),[px-dir*.12,py-.14,pz],[Math.PI/2,-dir*.28,0],null,goldCol);
  rsSphere(B,'paktong',.38,[px,py,pz],[1.38,.98,.9],goldCol,14,10);
  rsCone(B,'paktong',.22,.66,[px+dir*.44,py-.12,pz],[0,0,-dir*Math.PI*.42],goldCol,10);
  for(const s of[-1,1]){
   rsSphere(B,'glaze',.085,[px+dir*.16,py+.09,pz+s*.28],null,accCol,8,6);
   const hPts=[];
   for(let i=0;i<=18;i++){
    const t=i/18,a=t*Math.PI*1.9,r=.44*(1-.42*t);
    hPts.push([px-dir*(.08-Math.sin(a)*r),py+.18+Math.cos(a)*r,pz+s*(.24+t*.28)]);
   }
   rsTube(B,'paktong',hPts,t=>lerp(.12,.034,t),goldCol,22,8);
  }
 }else if(kind==='kingfisher'){
  rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.2,.045,7,16),.6),[px-dir*.1,py-.12,pz],[Math.PI/2,-dir*.28,0],null,goldCol);
  rsSphere(B,'paktong',.29,[px,py,pz],[1.28,1.02,.88],goldCol,12,9);
  rsCone(B,'paktong',.125,.82,[px+dir*.56,py-.14,pz],[0,0,-dir*Math.PI*.44],goldCol,9);
  for(const s of[-1,1])rsSphere(B,'glaze',.065,[px+dir*.1,py+.07,pz+s*.21],null,accCol,7,5);
  for(let k=0;k<5;k++)rsCone(B,'glaze',.065,.48-k*.05,[px-dir*(.1+k*.11),py+.26-k*.03,pz],[0,0,dir*(.62+k*.18)],k%2?goldCol:accCol,6);
 }else{
  rsTube(B,'paktong',[[px-dir*.18,py,pz],[px,py+.5,pz],[px+dir*.3,py+.58,pz]],t=>lerp(.1,.048,t),goldCol,10,6);
  rsCone(B,'paktong',.075,.48,[px+dir*.5,py+.54,pz],[0,0,-dir*Math.PI*.48],goldCol,6);
 }
}
function buildRsRiaNobleSalon(){reseed(75000);
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
 const OXBL=rsLin(0x5a1316),DARK=rsLin(0x220c0e),GOLD=rsLin(0xdca838),GOLDD=rsLin(0xb08024);
 const TURQ=rsLin(0x2c868e),SILV=rsLin(0xd4dce4),SILK=rsLin(0xf6f1e8),DECK=rsLin(0x8e5c3c),PORP=rsLin(0x7c2226);
 // Sleek, graceful double-ended state gondola/salon hull (`image_2.png`: 26 m x 6.4 m)
 const H=rsHull({L:26,B:6.4,fb:1.58,dr:1.06,sheerF:1.55,sheerA:1.35,sp:2.6,pb:2.05,pa:2.05,q:.6,n:2.35,flare:.14,rakeF:1.65,rakeA:1.45,keelEnd:.3});
 rsHullMesh(B,H,'wood',(u,h)=>h>.91?GOLD:h>.73?TURQ:h>.68?SILV:h<.34?DARK:OXBL,72,12);
 {const pts=[];for(let i=0;i<=44;i++){const u=i/44,hw=H.halfAt(u,0);if(hw>0)pts.push([u,hw]);}
  const hF0=u=>clamp((0-H.yk(u))/(H.ys(u)-H.yk(u)),0,1);
  for(const s of[-1,1]){const fg=rsGrid((a,v)=>{const k=Math.min(pts.length-1,Math.round(a*(pts.length-1))),u=pts[k][0],hw=pts[k][1];
   return[H.xAt(u,hF0(u)),.034,s*(hw+.02+v*.6*(.4+.6*Math.sin(Math.PI*a)))];},pts.length-1,1,(a,v)=>[a*7,v]);rsPut(B,'foamT',fg,null,null,null,0xffffff);}}
 const dY=rsDeck(B,H,{bw:.36,mk:'wood',col:DECK});
 const yD=dY(.5);
 rsWale(B,H,.92,.078,'paktong',GOLD,.14,.84);
 rsWale(B,H,.72,.068,'paktong',GOLDD,.15,.83);
 rsSpine(B,H,.16,GOLDD,null,null,'paktong');
 for(const a of rsAlong(H,.18,.82,11,.82)){
  rsDecal(B,H,a.u,a.s,.82,.22,GOLD,'paktong',12,.036);
 }
 // 1. Seamless Hull-Hugging Gilt Stem & Stern Cheek-Fairings, Acanthus Scroll-Brackets & Tapered Muscular Necks (`image_2.png`!)
 const fairEnd=(isBow)=>{
  const uTip=isBow?1:0,uIn=isBow?.81:.17,dir=isBow?1:-1;
  const pTip=H.pt(uTip,0,1),nx0=pTip[0]+dir*.06,ny0=pTip[1]+.62,rRoot=isBow?.46:.38;
  // Sculpted gilded filigree cheek-fairing wrapping both sides of the hull end (`uIn..uTip`) and converging smoothly into `rRoot`!
  const endPt=(u,v)=>{
   const w=u*2-1,aw=Math.abs(w),s=w<0?-1:1;
   const uH=lerp(uTip,uIn,Math.pow(aw,.82));
   const hLow=lerp(.22,.68,aw*aw),hF=lerp(hLow,1.0,Math.min(1,v*1.18));
   const hp=H.pt(uH,s,hF),hn=H.nrm(uH,s,hF);
   const chest=Math.pow(Math.max(0,1-aw),1.3);
   const hx=hp[0]+hn.x*.04+dir*chest*.54*Math.sin(v*Math.PI*.82),hy=hp[1]+chest*v*.64,hz=(aw<1e-4?0:hp[2]+hn.z*(.04+.18*(1-aw*aw)));
   const kTop=smooth01((v-.52)/.48),ang=w*.86*Math.PI;
   const cx=nx0+dir*Math.cos(ang)*rRoot*1.04,cy=ny0-.12*Math.cos(ang),cz=Math.sin(ang)*rRoot*.96;
   return[lerp(hx,cx,kTop),lerp(hy,cy,kTop),lerp(hz,cz,kTop)];
  };
  const fG=rsGrid(endPt,24,12,(u,v)=>[u*3.5,v*2.2]);
  rsGridColors(fG,24,12,(u,v)=>v>.76?GOLD:GOLDD);
  rsPut(B,'paktong',fG,null,null,null,null);
  // Inboard apron closing the aft sector of the neck-root cleanly down onto the bow/stern deck!
  const backG=rsGrid((u,v)=>{
   const w=u*2-1,ang=Math.PI-w*.16*Math.PI;
   const top=[nx0+dir*Math.cos(ang)*rRoot*1.04,ny0-.12*Math.cos(ang),Math.sin(ang)*rRoot*.96];
   const uH=isBow?.91:.09,dk=[H.xAt(uH,1),dY(uH)+.04,w*H.halfAt(uH,dY(uH))*.52];
   return[lerp(dk[0],top[0],v),lerp(dk[1],top[1],v),lerp(dk[2],top[2],v)];
  },8,4,(u,v)=>[u*1.4,v]);
  rsPut(B,'paktong',backG,null,null,null,GOLDD);
  // Overlapping sculpted gilded gorget collar rings crowning the breast-to-neck transition!
  rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(rRoot*1.05,.058,8,20),1.2),[nx0,ny0,0],[Math.PI/2,dir*.26,0],null,GOLD);
  rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(rRoot*.93,.046,8,18),1),[nx0+dir*.1,ny0+.24,0],[Math.PI/2,dir*.3,0],null,GOLDD);
  // Sweeping gilded acanthus border mouldings & double-volute scroll-brackets hugging the sheerline (`image_2.png`!)
  for(const s of[-1,1]){
   const uSide=s<0?0:1,rim=[];
   for(let i=0;i<=12;i++)rim.push(endPt(lerp(.5,uSide,i/12),.36));
   rsTube(B,'paktong',rim,t=>lerp(.1,.05,t),GOLD,18,7);
   rsScroll(B,[nx0-dir*.34,ny0+.06,s*(rRoot*.76)],isBow?.72:.58,1.25,.11,GOLD,-dir,'paktong',s*(rRoot*.8));
  }
  // Muscular Tapered S-Curved Gilded Neck rising organically from deep inside `rRoot` up to the Noble House Animal Crest!
  const hTop=isBow?3.85:2.95,xOut=isBow?1.46:1.14;
  const nPts=[
   [nx0-dir*.06,ny0-.22,0],
   [nx0+dir*.78,ny0+hTop*.36,0],
   [nx0+dir*.48,ny0+hTop*.78,0],
   [nx0+dir*xOut,ny0+hTop,0]
  ];
  rsTube(B,'paktong',nPts,t=>lerp(rRoot,isBow?.19:.16,Math.pow(t,.68)),GOLD,24,10);
  // Dorsal filigree spine-scrolls climbing the back of the gilded neck (`image_2.png`!)
  rsScroll(B,[nx0+dir*.42,ny0+hTop*.36,0],isBow?.54:.44,1.1,.09,GOLDD,-dir,'paktong',0);
  rsRiaNobleCrest(B,isBow?'ram':'kingfisher',[nx0+dir*(xOut+.14),ny0+hTop+.06,0],dir,GOLD,TURQ);
 };
 fairEnd(true);
 fairEnd(false);
 // 12 synchronized gilded ceremonial sweeps (6 per side aft & fore of the central boarding waist)
 const oarPts=[];
 for(const x of[-7.8,-6.0,-4.2,4.2,6.0,7.8])oarPts.push([x,dY(H.uAt(x))+.05,H.halfAt(H.uAt(x),dY(H.uAt(x)))+.22]);
 rsOars(V,H,{name:'ceremonial sweeps',points:oarPts,len:4.1,inb:1.1,r:.042,bladeL:.95,bladeW:.21,col:0xcfa038,sweep:.38,lift:.16,rate:.46,ripple:.4});
 // 2. Full-Length Vaulted Gilded-Filigree Salon Canopy with Scalloped Gilt Valances & Billowing White Silk Curtains (`image_2.png`!)
 {const sx0=-8.2,sx1=8.2,nBays=5,colH=2.55,yCol0=yD+.008,yEnt=yCol0+colH;
  // Ornate pierced gilded salon balustrades with arched tracery between columns (`image_2.png`!)
  for(const s of[-1,1]){
   rsLink(B,'paktong',[sx0,yCol0+.66,s*2.15],[sx1,yCol0+.66,s*2.15],.048,GOLD,6);
   rsLink(B,'paktong',[sx0,yCol0+.14,s*2.15],[sx1,yCol0+.14,s*2.15],.038,GOLDD,6);
   for(let i=0;i<=15;i++){
    const rx=lerp(sx0,sx1,i/15);
    rsLink(B,'paktong',[rx,yCol0+.14,s*2.15],[rx,yCol0+.64,s*2.15],.028,GOLD,5);
    if(i<15)rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.24,.024,5,12,Math.PI),.5),[rx+.545,yCol0+.4,s*2.15],[0,Math.PI/2,0],null,GOLDD);
   }
  }
  // Crimson velvet/silk cushioned salon banquettes & low dolomite tea-table down the center
  for(const s of[-1,1])rsBox(B,'silk',[8.8,.42,.86],[0,yCol0+.22,s*1.32],null,PORP,1.5);
  rsBox(B,'stone',[4.2,.38,.78],[0,yCol0+.2,0],null,SILK,1.2);
  rsBox(B,'paktong',[4.32,.06,.88],[0,yCol0+.43,0],null,GOLD,1);
  // 12 Slender Gilded-Bronze Filigree Columns + Scalloped Gilt Valance Pelmets + Billowing White Silk Curtains (`image_2.png`!)
  const xCols=[];
  for(let i=0;i<=nBays;i++)xCols.push(lerp(sx0,sx1,i/nBays));
  for(const cx of xCols)for(const s of[-1,1]){
   rsBox(B,'paktong',[.34,.16,.34],[cx,yCol0+.08,s*2.15],null,GOLDD,1);
   rsCyl(B,'paktong',.105,.125,colH-.32,[cx,yCol0+.16+(colH-.32)/2,s*2.15],null,GOLD,10);
   rsSphere(B,'glaze',.14,[cx,yCol0+colH*.52,s*2.15],null,TURQ,8,6);
   rsCyl(B,'paktong',.22,.115,.16,[cx,yEnt-.08,s*2.15],null,GOLD,10);
  }
  for(let i=0;i<nBays;i++){
   const xa=xCols[i]+.14,xb=xCols[i+1]-.14;
   for(const s of[-1,1]){
    // Scalloped gilded valance pelmet crowning each curtain bay (`image_2.png`!)
    const pelG=rsGrid((u,v)=>{const xx=lerp(xa-.06,xb+.06,u),drop=.28+.14*Math.sin(u*Math.PI*3)**2;
     return[xx,yEnt-.03-v*drop,s*2.21];},12,3,(u,v)=>[u*2,v]);
    rsPut(B,'paktong',pelG,null,null,null,GOLD);
    const cg=rsGrid((u,v)=>{
     const side=u<.5?-1:1,su=u<.5?u*2:(1-u)*2;
     const gather=lerp(.1,.47,Math.pow(1-v,1.2))*su,t=side<0?gather*.88:1-gather*.88;
     const sw=Math.sin(Math.PI*v)*Math.sin(Math.PI*su)*.2;
     return[lerp(xa,xb,t),lerp(yCol0+.18,yEnt-.22,v),s*(2.08-sw)];
    },10,8,(u,v)=>[u*2,v*2.4]);
    rsPut(B,'silk',cg,null,null,null,SILK);
   }
  }
  // Cambered Vaulted Gilded-Filigree Salon Roof + Clerestory Cupola + Ornate Scrolled Cresting Pediments (`image_2.png`!)
  rsBox(B,'paktong',[sx1-sx0+.54,.22,4.68],[0,yEnt+.118,0],null,GOLD,1.5);
  rsBox(B,'glaze',[sx1-sx0+.32,.16,4.46],[0,yEnt+.316,0],null,TURQ,1.5);
  rsVault(B,'wood',sx0-.45,sx1+.45,yEnt+.405,2.42,.78,OXBL,18,14,2.5);
  for(const rx of[sx0-.35,-4.1,0,4.1,sx1+.35])rsVault(B,'paktong',rx-.09,rx+.09,yEnt+.428,2.46,.82,GOLD,2,14,1.2);
  // Raised gilded clerestory lantern cupola amidships + scrolled roofline cresting gables (`image_2.png`!)
  const yCup0=yEnt+1.08;
  rsBox(B,'glaze',[5.6,.58,2.35],[0,yCup0+.29,0],null,TURQ,1.2);
  rsBox(B,'paktong',[5.9,.14,2.65],[0,yCup0+.66,0],null,GOLD,1.2);
  rsRoof(B,'paktong',6.1,2.85,.92,[0,yCup0+.74,0],null,GOLD,.24,.16);
  for(const [gx,dir] of[[sx1+.4,1],[sx0-.4,-1]]){
   const gy=yEnt+.95;
   for(const s of[-1,1]){
    rsScroll(B,[gx,gy-.18,s*.22],.62,1.2,.085,GOLD,-dir,'paktong',s*.88);
    rsScroll(B,[gx,gy+.12,s*.12],.38,1.0,.065,GOLDD,dir,'paktong',s*.42);
   }
   rsRiaNobleCrest(B,'heron',[gx,gy+.22,0],dir,GOLD,TURQ);
  }
  rsLink(B,'paktong',[0,yCup0+1.66,0],[0,yCup0+3.55,0],.052,GOLD,6,.028);
  rsSphere(B,'paktong',.18,[0,yCup0+2.15,0],null,GOLD,8,6);
  rsPennant(B,[0,yCup0+3.55,0],3.2,.38,[GOLD,OXBL,TURQ]);
  rsSolid(B,[sx0-.5,yCol0,-2.45],[sx1+.5,yCup0+2.4,2.45]);
 }
 rsFigure(B,[9.2,dY(H.uAt(9.2)),0],0,GOLD,false,0x9e7052);
 rsFigure(B,[-9.2,dY(H.uAt(-9.2)),0],Math.PI,TURQ,false,0x9e7052);
 for(const [px,pz,yaw,col] of[[-2.2,-.85,Math.PI/2,SILK],[1.8,.85,-Math.PI/2,OXBL],[4.8,0,0,TURQ]])
  rsFigure(B,[px,yD+(Math.abs(pz)>.5?.43:0),pz],yaw,col,Math.abs(pz)>.5,0x9e7052);
 rsBake(B,V.group,'riaNobleSalon');V.deckY=yD;return V;
}
RS_VESSEL({key:'riaNobleSalon',name:'Ria Noble House State Salon Barge',culture:'ria',L:28,B:12,H:9.5,
 tags:{type:['pleasure barge','state barge','envoy','salon'],propulsion:['oars'],hull:'monohull',wealth:'wealthy',crew:18,role:'ceremonial noble-family state salon and diplomatic envoy barge of the Ria Valley'},
 blurb:'Sleek crimson-and-gold filigree ceremonial barge whose hull swells seamlessly into a muscular gilded Bighorn-Ram prow and Kingfisher tail-stern, with twelve gilded sweeps, scalloped gilt valances, and billowing white silk curtains.',build:buildRsRiaNobleSalon});
