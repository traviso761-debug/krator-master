// ---------------------------------------------------------------- vessel: Lower-Ria Heartland Dynastic Palace-Barge
// Monumental floating palace-villa of the Western (Lower Ria / Heartland) Dynasty: a 51 m broad-beam hull in crimson
// cedar, cobalt-and-turquoise glazed Ria brick friezes, and gilded bronze outrigger galleries pulled by 44 synchronized
// sweeps. Both bow cheeks are embraced 7.5 m aft by a sculpted gilt-scale & jeweled turquoise crescent pectoral collar
// fanning into a 5-socket crown manifold for the Western Dynasty's 5-Headed Gilded River-Serpent (Uktena) Prow Emblem;
// behind open a cypress mosaic forecourt, grand balustraded stair, silk-curtained porphyry audience hall, and gilded aft dome.
function buildRsRiaWestPalaceBarge(){reseed(74700);
 if(!RSMAT.stone||!RSMAT.glaze||!RSMAT.silk||!RSMAT.paktong||!RSMAT.ember){
  const tSto=rsNoiseTex('extSto',256,256,(g,W,H)=>{g.fillStyle='#ded8ce';g.fillRect(0,0,W,H);for(let r=0;r<6;r++){const y=r*H/6;g.strokeStyle='rgba(90,82,70,.22)';g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}rsSpeckle(g,W,H,700,.07,true);});
  const tGlz=rsNoiseTex('extGlz',256,256,(g,W,H)=>{g.fillStyle='#cfd8dc';g.fillRect(0,0,W,H);for(let r=0;r<8;r++)for(let c=0;c<8;c++){g.strokeStyle='rgba(40,50,60,.25)';g.strokeRect(c*W/8+1,r*H/8+1,W/8-2,H/8-2);}rsSpeckle(g,W,H,500,.06,false);});
  const tSlk=rsNoiseTex('extSlk',256,256,(g,W,H)=>{g.fillStyle='#ece8e0';g.fillRect(0,0,W,H);for(let x=0;x<W;x+=6){g.fillStyle=`rgba(120,110,95,${.04+.04*Math.sin(x*.2)})`;g.fillRect(x,0,3,H);}});
  const tMet=rsNoiseTex('extPak',256,256,(g,W,H)=>{g.fillStyle='#dcdad4';g.fillRect(0,0,W,H);rsSpeckle(g,W,H,500,.06,true);});
  const tEmb=rsNoiseTex('extEmb',128,128,(g,W,H)=>{g.fillStyle='#ff8a24';g.fillRect(0,0,W,H);for(let i=0;i<140;i++){g.fillStyle=h3(i,2,7)>.4?'#ffd060':'#682008';g.beginPath();g.arc(h3(i,1,3)*W,h3(i,4,9)*H,3+h3(i,6,2)*8,0,TAU);g.fill();}});
  const tRope=rsNoiseTex('extRop',128,128,(g,W,H)=>{g.fillStyle='#d6ceb8';g.fillRect(0,0,W,H);for(let i=-H;i<W+H;i+=8){g.strokeStyle='rgba(60,44,24,.28)';g.lineWidth=3;g.beginPath();g.moveTo(i,0);g.lineTo(i+H,H);g.stroke();}});
  if(!RSMAT.stone)rsDefMat('stone',new THREE.MeshStandardMaterial({map:tSto,vertexColors:true,roughness:.38,side:DS}));
  if(!RSMAT.glaze)rsDefMat('glaze',new THREE.MeshStandardMaterial({map:tGlz,vertexColors:true,roughness:.24,metalness:.06,side:DS}));
  if(!RSMAT.silk)rsDefMat('silk',new THREE.MeshStandardMaterial({map:tSlk,vertexColors:true,roughness:.52,side:DS}));
  if(!RSMAT.paktong)rsDefMat('paktong',new THREE.MeshStandardMaterial({map:tMet,vertexColors:true,metalness:.82,roughness:.28,side:DS}));
  if(!RSMAT.ember)rsDefMat('ember',new THREE.MeshStandardMaterial({map:tEmb,emissive:0xe86c18,emissiveMap:tEmb,emissiveIntensity:1.3,vertexColors:true,roughness:.6,side:DS}));
  if(!RSMAT.metal.map){RSMAT.metal.map=tMet;RSMAT.metal.needsUpdate=true;}
  if(!RSMAT.rope.map){RSMAT.rope.map=tRope;RSMAT.rope.needsUpdate=true;}
 }
 if(!RSMAT.foamT){
  const tFoam=rsNoiseTex('extFoam',128,128,(g,W,H)=>{g.fillStyle='#dceeee';g.fillRect(0,0,W,H);for(let i=0;i<220;i++){g.fillStyle=`rgba(255,255,255,${.2+.45*h3(i,3,8)})`;g.beginPath();g.arc(h3(i,1,2)*W,h3(i,5,4)*H,2+h3(i,7,6)*7,0,TAU);g.fill();}});
  rsDefMat('foamT',new THREE.MeshBasicMaterial({map:tFoam,color:0xe8f6f6,transparent:true,opacity:.44,depthWrite:false,side:DS}));
 }
 if(typeof KMAT!=='undefined'&&KMAT.bindMat)KMAT.bindMat('ringsea',RSMAT,{alias:{woodI:'wood',paktong:'metal'},tile:{metal:1,paktong:1,rope:1,stone:1,glaze:1,silk:1}});
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const CRIM=rsLin(0x6c1919),MAHOG=rsLin(0x3f1b14),DARK=rsLin(0x1e120e),GOLD=rsLin(0xdca632),GOLDD=rsLin(0xb07e20);
 const DOLO=rsLin(0xe8dec9),DOLOD=rsLin(0xcbc0a8),PORP=rsLin(0x782323),COB=rsLin(0x1a487e),TURQ=rsLin(0x1f7e86),SILV=rsLin(0xdce2ea);
 const SILK=rsLin(0xf4efe4),CYP=rsLin(0x234a28),CYPD=rsLin(0x18361c);
 // Broad-beam Lake Nemi floating-palace hull (51 m x 15.8 m)
 const H=rsHull({L:51,B:15.8,fb:2.65,dr:1.65,sheerF:1.55,sheerA:1.85,sp:2.5,pb:2.35,pa:2.25,q:.46,n:3.2,flare:.08,rakeF:1.8,rakeA:1.4,keelEnd:.35});
 rsHullMesh(B,H,'wood',(u,h)=>h>.92?GOLD:h>.83?TURQ:h>.74?CRIM:h<.34?DARK:MAHOG,84,14);
 {const pts=[];for(let i=0;i<=52;i++){const u=i/52,hw=H.halfAt(u,0);if(hw>0)pts.push([u,hw]);}
  const hF0=u=>clamp((0-H.yk(u))/(H.ys(u)-H.yk(u)),0,1);
  for(const s of[-1,1]){const fg=rsGrid((a,v)=>{const k=Math.min(pts.length-1,Math.round(a*(pts.length-1))),u=pts[k][0],hw=pts[k][1];
   return[H.xAt(u,hF0(u)),.038,s*(hw+.02+v*.95*(.4+.6*Math.sin(Math.PI*a)))];},pts.length-1,1,(a,v)=>[a*9,v]);rsPut(B,'foamT',fg,null,null,null,0xffffff);}}
 // Cream-dolomite main promenade deck + gilded bronze & turquoise-glazed wales
 const dY=rsDeck(B,H,{bw:.52,mk:'stone',col:DOLO});
 const yD=dY(.5);
 rsWale(B,H,.92,.11,'paktong',GOLD,.04,.84);
 rsWale(B,H,.76,.09,'glaze',COB,.05,.83);
 rsWale(B,H,.56,.1,'paktong',GOLDD,.04,.96);
 rsSpine(B,H,.24,GOLDD,null,null,'paktong');
 // Outrigger sweep-galleries port & starboard (x in [-17, +15], proud of hull sides) + 44 synchronized red-and-gold sweeps!
 const oarPts=[];
 for(const s of[-1,1]){
  const zGal=s*(H.hb(.5)+.55);
  rsBox(B,'wood',[32.4,.52,.62],[-1.0,yD-.18,zGal],null,CRIM,2);
  rsBox(B,'paktong',[32.6,.12,.7],[-1.0,yD+.14,zGal],null,GOLD,1.5);
  for(let i=0;i<12;i++){
   const bx=lerp(-16.6,14.6,i/11);
   rsLink(B,'paktong',[bx,yD-.42,s*(H.hb(.5)-.1)],[bx,yD-.18,zGal+s*.24],.07,GOLDD,6);
  }
 }
 for(let i=0;i<22;i++)oarPts.push([lerp(-16.2,14.2,i/21),yD-.08,H.hb(.5)+.78]);
 rsOars(V,H,{name:'royal sweeps',points:oarPts,len:6.4,inb:1.8,r:.055,bladeL:1.35,bladeW:.26,col:0xb83224,sweep:.36,lift:.14,rate:.38,ripple:.5});
 // Perimeter dolomite & gilded balustrade along the promenade (stopping cleanly at u = 0.84 where the Uktena pectoral collar begins!)
 for(const s of[-1,1])for(const [u0,u1,nb] of[[.08,.38,9],[.58,.83,7]]){
  const rPts=[];
  for(let i=0;i<=nb;i++){
   const u=lerp(u0,u1,i/nb),p=H.pt(u,s,1);
   rsCyl(B,'stone',.075,.09,.76,[p[0],p[1]+.39,p[2]*.96],null,DOLO,8);
   rPts.push([p[0],p[1]+.8,p[2]*.96]);
  }
  rsTube(B,'paktong',rPts,.06,GOLD,nb*3,6);
 }
 // 1. Hull-Embracing Gilt-and-Turquoise Crescent Pectoral Collar (`image_3.png`!) & 5-Headed Gilded River-Serpent (`Uktena`) Prow!
 {const pb=H.pt(1,0,1),bx=pb[0],by=pb[1];
  // Wide Crown Manifold center where the hull-hugging breast converges to root all 5 Uktena necks (`z` fanned +-1.65 m!)
  const mx0=bx+.25,my0=by+1.55;
  // Sculpted Gilded-Scale Bow Breast & Cheek-Wings embracing 7.6 m of both bow sides (`uHull = 0.84..1.0`) from `hF = 0.18` to `my0`!
  const ukBreastPt=(u,v)=>{
   const w=u*2-1,aw=Math.abs(w),s=w<0?-1:1;
   const uH=lerp(1.0,.84,Math.pow(aw,.8));
   const hLow=lerp(.12,.56,aw*aw),hF=lerp(hLow,1.0,Math.min(1,v*1.2));
   const hp=H.pt(uH,s,hF),hn=H.nrm(uH,s,hF);
   const chest=Math.pow(Math.max(0,1-aw),1.35),vBelly=Math.sin(Math.min(1,v*1.06)*Math.PI*.86);
   const outLat=.045+.48*(1-aw*aw)*vBelly;
   const outFwd=chest*(1.95*Math.sin(v*Math.PI*.84)+.45*v);
   const hx=hp[0]+hn.x*outLat+outFwd,hy=hp[1]+chest*v*.95,hz=(aw<1e-4?0:hp[2]+hn.z*outLat);
   // Smoothly converge upper breast (`v in 0.60..1.0`) into the wide elliptical 5-head crown manifold!
   const kTop=smooth01((v-.6)/.4);
   const ang=w*.95*Math.PI;
   const cx=mx0-.35-Math.cos(ang)*1.25,cy=my0-.12*Math.cos(ang),cz=Math.sin(ang)*1.82;
   return[lerp(hx,cx,kTop),lerp(hy,cy,kTop),lerp(hz,cz,kTop)];
  };
  const brG=rsGrid(ukBreastPt,32,16,(u,v)=>[u*5.5,v*3.2]);
  rsGridColors(brG,32,16,(u,v)=>v>.8?GOLD:v<.16?GOLDD:GOLD);
  rsPut(B,'chitin',brG,null,null,null,null);
  // Aft Breast-Manifold Closure fairing smoothly down onto the foredeck (zero open rim from behind!)
  const ukBack=rsGrid((u,v)=>{
   const w=u*2-1,ang=w*.95*Math.PI;
   const top=[mx0-.35-Math.cos(ang)*1.25,my0-.12*Math.cos(ang),Math.sin(ang)*1.82];
   const uH=lerp(.94,.845,Math.abs(w)),dk=[H.xAt(uH,1),dY(uH)+.06,w*H.halfAt(uH,dY(uH))*.88];
   return[lerp(dk[0],top[0],v),lerp(dk[1],top[1],v),lerp(dk[2],top[2],v)];
  },18,6,(u,v)=>[u*3,v*1.4]);
  rsPut(B,'chitin',ukBack,null,null,null,GOLDD);
  // Swept Jeweled Turquoise-and-Silver Crescent Pectoral Collar (`image_3.png`!) wrapping across the breast & up both bow sheerlines!
  const colPts=[],colUpper=[];
  for(let i=0;i<=20;i++){
   const u=lerp(.04,.96,i/20),vCol=.38+.36*Math.pow(Math.abs(u*2-1),1.25);
   const p=ukBreastPt(u,vCol);
   colPts.push([p[0]+.06*(1-Math.abs(u*2-1)),p[1],p[2]*1.02]);
   const p2=ukBreastPt(u,Math.min(.96,vCol+.16));
   colUpper.push([p2[0]+.05*(1-Math.abs(u*2-1)),p2[1],p2[2]*1.02]);
  }
  rsTube(B,'glaze',colPts,t=>lerp(.12,.22,Math.sin(t*Math.PI)),SILV,32,8);
  rsTube(B,'paktong',colUpper,t=>lerp(.08,.14,Math.sin(t*Math.PI)),GOLD,28,7);
  // Jeweled turquoise cabochon bosses studded along the crescent collar + central dark-cobalt & gold oculus boss (`image_3.png`!)
  for(let j=1;j<10;j++){
   const pJ=colPts[j*2];
   rsSphere(B,'glaze',.12,[pJ[0]+.08,pJ[1],pJ[2]*1.03],null,j%2?TURQ:COB,8,6);
  }
  const cenP=ukBreastPt(.5,.52);
  rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.56,.11,8,20),.8),[cenP[0]+.06,cenP[1],0],[0,Math.PI/2,0],null,GOLD);
  rsCyl(B,'glaze',.48,.48,.12,[cenP[0]+.04,cenP[1],0],[0,0,Math.PI/2],COB,18);
  rsSphere(B,'paktong',.24,[cenP[0]+.12,cenP[1],0],[.55,1,1],GOLD,10,8);
  // Wide Sculpted Crown-Gorget Rim & 5 Distinct Calyx Sockets rooting the 5 Fanned Uktena Serpent Necks!
  // Staggered in BOTH fore-aft `x`, lateral `z` (+-1.85 m), and height `y` so all 5 heads silhouette distinctly in 3/4 and abeam views!
  for(let k=-2;k<=2;k++){
   const ak=Math.abs(k);
   const rootX=mx0+.42-ak*.58,rootY=my0-.04,rootZ=k*.76;
   // Sculpted gilded lotus/scale calyx socket collar at each neck root
   rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.44-ak*.03,.075,7,16),.8),[rootX,rootY+.06,rootZ],[Math.PI/2,-.18,k*.14],null,GOLD);
   const tipX=bx+3.45-ak*.92,tipY=by+6.05-ak*.62,tipZ=k*1.08;
   const nPts=[
    [rootX,rootY-.18,rootZ*.92],
    [rootX+.88,rootY+1.25,lerp(rootZ,tipZ,.38)],
    [rootX+.28,rootY+2.75-ak*.28,lerp(rootZ,tipZ,.72)],
    [tipX,tipY,tipZ]
   ];
   rsTube(B,'chitin',nPts,t=>lerp(.42-ak*.03,.2,t),GOLD,22,10);
   // Sculpted Serpent Head, Open Fanged Jaws, Uktena Stag-Antlers, Spire Crown & Blazing Forehead Ulunsuti Crystal (`image_3.png`!)
   const yawOut=-k*.24,qH=qEuler(0,yawOut,.12);
   const P=(dx,dy,dz)=>{const v=new THREE.Vector3(dx,dy,dz).applyQuaternion(qH);return[tipX+v.x,tipY+v.y,tipZ+v.z];};
   rsSphere(B,'paktong',.31,P(.18,.06,0),[1.38,.94,.9],GOLD,12,9);
   rsCyl(B,'paktong',.13,.24,.74,P(.66,.12,0),[0,yawOut,-Math.PI/2+.14],GOLD,8);
   rsCyl(B,'paktong',.1,.18,.64,P(.58,-.15,0),[0,yawOut,-Math.PI/2-.3],GOLDD,8);
   rsSphere(B,'ember',.11,P(.4,.26,0),[1.2,1,.85],0xffb838,8,6);
   rsSphere(B,'glaze',.12,P(.22,.28,0),[1,1,.9],k===0?TURQ:COB,8,6);
   for(const sh of[-1,1]){
    rsCone(B,'paktong',.06,.88-ak*.06,P(-.08,.52,sh*.18),[sh*.34,yawOut,.72],GOLD,6);
    rsCone(B,'stone',.038,.24,P(.88,-.02,sh*.1),[0,yawOut,-Math.PI*.85],DOLO,5);
   }
   // Tall Thai/Ria flame-spire crest rising from each serpent crown (`image_3.png`!)
   rsCone(B,'paktong',.085,.92-ak*.08,P(-.18,.62,0),[0,yawOut,.28],GOLD,7);
  }
 }
 // Sculpted Gilded Stern-Transom Fairing rooting Twin Curling Uktena Tail-Scrolls!
 {const pa=H.pt(0,0,1);
  const stApron=rsGrid((u,v)=>{
   const w=u*2-1,aw=Math.abs(w),s=w<0?-1:1,uH=lerp(0,.085,aw);
   const hp=H.pt(uH,s,lerp(.48,1,v)),hn=H.nrm(uH,s,lerp(.48,1,v));
   return[hp[0]-(1-aw)*.45*Math.sin(v*Math.PI*.85)+hn.x*.04,hp[1]+(1-aw)*v*.55,aw<1e-4?0:hp[2]+hn.z*(.04+.28*(1-aw))];
  },18,8,(u,v)=>[u*3,v*1.5]);
  rsPut(B,'chitin',stApron,null,null,null,GOLD);
  for(const s of[-1,1]){
   rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.36,.065,7,16),.8),[pa[0]+.18,pa[1]+.28,s*1.25],[Math.PI/2,.25,0],null,GOLD);
   rsTube(B,'chitin',[[pa[0]+.22,pa[1]+.12,s*1.22],[pa[0]-.85,pa[1]+1.55,s*1.48],[pa[0]-.35,pa[1]+3.25,s*1.15],[pa[0]-1.08,pa[1]+4.35,s*.85]],t=>lerp(.34,.09,t),GOLD,18,8);
   rsCone(B,'glaze',.17,.58,[pa[0]-1.15,pa[1]+4.62,s*.82],[0,0,.35],TURQ,8);
  }
 }
 // 2. Mosaic Forecourt (x in [7.2, 20.2]) with Cobalt-and-Gold Medallion & 6 Potted Columnar Cypress Trees
 {const fx=13.6,fy=yD+.012;
  rsBox(B,'glaze',[9.4,.04,8.6],[fx,fy+.02,0],null,COB,1.5);
  rsBox(B,'stone',[8.2,.04,7.4],[fx,fy+.068,0],null,DOLO,1.5);
  rsCyl(B,'paktong',2.15,2.15,.035,[fx,fy+.112,0],null,GOLD,24);
  rsCyl(B,'glaze',1.65,1.65,.035,[fx,fy+.154,0],null,TURQ,24);
  const planterTree=(tx,tz,baseY,scaleK)=>{
   rsBox(B,'glaze',[.92*scaleK,.62*scaleK,.92*scaleK],[tx,baseY+.32*scaleK,tz],null,COB,1);
   rsBox(B,'paktong',[1.02*scaleK,.09*scaleK,1.02*scaleK],[tx,baseY+.68*scaleK,tz],null,GOLD,1);
   rsCyl(B,'wood',.11*scaleK,.14*scaleK,.7*scaleK,[tx,baseY+.98*scaleK,tz],null,MAHOG,7);
   for(let tier=0;tier<3;tier++){
    rsCone(B,'thatch',(.58-tier*.11)*scaleK,(1.85-tier*.25)*scaleK,[tx,baseY+(1.85+tier*.92)*scaleK,tz],null,tier%2?CYP:CYPD,10);
   }
  };
  for(const s of[-1,1])for(const px of[9.6,13.6,17.6])planterTree(px,s*4.95,yD+.008,1);
  for(const s of[-1,1])for(const px of[-17.2,-12.2])planterTree(px,s*4.85,yD+.008,.92);
 }
 // 3. Elevated Palace Terrace (x in [-8.6, +6.8], z in [-5.8, +5.8], height +1.32 m) + Grand Balustraded Bow Stair with Braziers!
 const hTer=1.32,yTer0=yD+.008,yTer=yTer0+hTer;
 rsBox(B,'stone',[15.4,hTer,11.6],[-.9,yTer0+hTer/2,0],null,DOLOD,2.2);
 rsBox(B,'paktong',[15.6,.09,11.8],[-.9,yTer-.03,0],null,GOLD,1.5);
 for(const s of[-1,1])for(let i=0;i<5;i++){
  rsBox(B,'glaze',[2.35,.76,.04],[-6.5+i*2.8,yTer0+.66,s*5.83],null,i%2?TURQ:COB,1);
  rsBox(B,'paktong',[2.48,.1,.06],[-6.5+i*2.8,yTer0+1.14,s*5.84],null,GOLD,1);
 }
 for(let st=0;st<6;st++){
  const sx=8.82-st*.36,sy=yTer0+(st+.5)*(hTer/6);
  rsBox(B,'stone',[.34,hTer/6-.01,4.8],[sx,sy,0],null,DOLO,1.5);
 }
 // Stepped dolomite cheek-newels + gilded handrail + flaming ceremonial bronze braziers flanking the grand bow stair (`image_4.png`!)
 for(const s of[-1,1]){
  rsBox(B,'stone',[.72,.82,.56],[9.12,yTer0+.41,s*2.68],null,DOLO,1);
  rsCyl(B,'paktong',.34,.2,.26,[9.12,yTer0+.96,s*2.68],null,GOLD,12);
  rsCyl(B,'ember',.26,.22,.06,[9.12,yTer0+1.1,s*2.68],null,0xffa030,10);
  rsLink(B,'paktong',[9.05,yTer0+.78,s*2.68],[6.85,yTer+.68,s*2.68],.095,GOLD,8);
 }
 // 4. Open Colonnaded Silk-Curtained Audience Hall (`image_4.png`: carved eave brackets & hanging corner lantern finials!)
 {const hx=-1.0,hw=13.2,hd=9.6,colH=3.55,yCol0=yTer+.008,yEnt=yCol0+colH;
  rsBox(B,'stone',[4.6,.36,4.2],[hx-2.2,yCol0+.18,0],null,PORP,1.5);
  rsBox(B,'paktong',[1.4,.95,1.2],[hx-3.1,yCol0+.85,0],null,GOLD,1);
  rsSolid(B,[hx-hw/2-.4,yTer0,-hd/2-.4],[hx+hw/2+.4,yEnt+3.6,hd/2+.4]);
  const xCols=[];
  for(let i=0;i<6;i++)xCols.push(lerp(hx-hw/2+.35,hx+hw/2-.35,i/5));
  const placeCol=(cx,cz)=>{
   rsBox(B,'stone',[.54,.22,.54],[cx,yCol0+.11,cz],null,DOLO,1);
   rsCyl(B,'stone',.2,.23,colH-.46,[cx,yCol0+.23+(colH-.46)/2,cz],null,PORP,12);
   rsCyl(B,'glaze',.225,.225,.38,[cx,yCol0+colH*.52,cz],null,TURQ,12);
   rsCyl(B,'paktong',.32,.21,.22,[cx,yEnt-.11,cz],null,GOLD,12);
  };
  for(const cx of xCols)for(const s of[-1,1])placeCol(cx,s*4.5);
  for(const cz of[-1.5,1.5]){placeCol(xCols[0],cz);placeCol(xCols[xCols.length-1],cz);}
  const silkDrape=(ax,az,bx,bz)=>{
   const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz),nx=-dz/L,nz=dx/L;
   const cg=rsGrid((u,v)=>{
    const side=u<.5?-1:1,su=u<.5?u*2:(1-u)*2;
    const gather=lerp(.12,.46,Math.pow(1-v,1.3))*su,t=side<0?gather*.85:1-gather*.85;
    const billow=Math.sin(Math.PI*v)*Math.sin(Math.PI*su)*.22;
    return[lerp(ax,bx,t)+nx*billow,lerp(yCol0+.18,yEnt-.28,v),lerp(az,bz,t)+nz*billow];
   },10,8,(u,v)=>[u*2,v*2.5]);
   rsPut(B,'silk',cg,null,null,null,SILK);
  };
  for(let i=0;i<xCols.length-1;i++)for(const s of[-1,1])silkDrape(xCols[i],s*4.46,xCols[i+1],s*4.46);
  silkDrape(xCols[xCols.length-1],-4.46,xCols[xCols.length-1],-1.56);
  silkDrape(xCols[xCols.length-1],1.56,xCols[xCols.length-1],4.46);
  // Entablature + Carved Gilt Eave Brackets + Two-Tier Hipped Roof with Hanging Corner Lanterns (`image_4.png`!)
  rsBox(B,'paktong',[hw+.36,.32,hd+.36],[hx,yEnt+.168,0],null,GOLD,1.5);
  rsBox(B,'glaze',[hw+.16,.24,hd+.16],[hx,yEnt+.46,0],null,COB,1.5);
  rsRoof(B,'tile',hw+1.55,hd+1.55,1.88,[hx,yEnt+.59,0],null,GOLDD,.26,.46);
  for(const sx of[-1,1])for(const sz of[-1,1]){
   const ex=hx+sx*(hw/2+.72),ez=sz*(hd/2+.72);
   rsLink(B,'paktong',[ex,yEnt+.58,ez],[ex,yEnt+.08,ez],.03,GOLD,5);
   rsCyl(B,'ember',.14,.11,.28,[ex,yEnt-.08,ez],null,0xffb440,8);
  }
  rsBox(B,'glaze',[hw*.46,.78,hd*.46],[hx,yEnt+2.86,0],null,TURQ,1.2);
  rsRoof(B,'paktong',hw*.58,hd*.58,1.55,[hx,yEnt+3.26,0],null,GOLD,.24,.08);
  rsLink(B,'paktong',[hx,yEnt+4.8,0],[hx,yEnt+6.35,0],.075,GOLD,8,.035);
  rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.48,.075,8,18,Math.PI*1.35),.8),[hx,yEnt+6.68,0],[0,Math.PI/2,Math.PI*.82],null,GOLD);
  for(const sx of[-1,1])for(const sz of[-1,1]){
   const bx=hx+sx*(hw/2+.55),bz=sz*(hd/2+.55);
   rsLink(B,'paktong',[bx,yTer+.02,bz],[bx,yEnt+4.4,bz],.06,GOLD,6,.04);
   rsLink(B,'paktong',[bx,yEnt+3.85,bz-.55],[bx,yEnt+3.85,bz+.55],.035,GOLD,5);
   const bg=rsGrid((u,v)=>[bx+.08*Math.sin(Math.PI*v),lerp(yEnt+.8,yEnt+3.8,v),bz+(u-.5)*.86],4,8,(u,v)=>[u,v*3]);
   rsPut(B,'silk',bg,null,null,null,TURQ);
  }
 }
 // 5. Gilded Aft Rotunda Dome (`image.png`!) at x = -14.8, z = 0
 {const rx=-14.8,ry0=yD+.008;
  rsCyl(B,'stone',4.45,4.75,.56,[rx,ry0+.28,0],null,DOLO,24);
  rsCyl(B,'glaze',3.95,4.15,.28,[rx,ry0+.71,0],null,COB,24);
  const rY=ry0+.86,rColH=3.1;
  rsCyl(B,'stone',2.65,2.65,rColH-.04,[rx,rY+rColH/2,0],null,DOLOD,20);
  for(let k=0;k<12;k++){
   const a=k*TAU/12,cx=rx+Math.cos(a)*3.55,cz=Math.sin(a)*3.55;
   rsCyl(B,'stone',.17,.2,rColH-.28,[cx,rY+.14+(rColH-.28)/2,cz],null,PORP,10);
   rsCyl(B,'paktong',.25,.18,.18,[cx,rY+rColH-.09,cz],null,GOLD,10);
  }
  const yDom=rY+rColH+.01;
  rsCyl(B,'paktong',3.95,3.85,.34,[rx,yDom+.17,0],null,GOLD,24);
  rsCyl(B,'glaze',3.55,3.65,.52,[rx,yDom+.61,0],null,TURQ,24);
  const domG=rsGrid((u,v)=>{const a=u*TAU,p=v*Math.PI*.48,r=(3.52+.09*Math.abs(Math.sin(u*TAU*8)))*Math.cos(p);
   return[rx+Math.cos(a)*r,yDom+.88+Math.sin(p)*2.75,Math.sin(a)*r];},32,12,(u,v)=>[u*6,v*2]);
  rsPut(B,'paktong',domG,null,null,null,GOLD);
  rsCyl(B,'paktong',.62,.72,.85,[rx,yDom+3.95,0],null,GOLD,12);
  rsCone(B,'paktong',.78,.95,[rx,yDom+4.86,0],null,GOLD,12);
  rsPennant(B,[rx,yDom+5.38,0],4.2,.55,[TURQ,GOLD,CRIM]);
  rsSolid(B,[rx-4.5,ry0,-4.5],[rx+4.5,yDom+5.2,4.5]);
 }
 for(const s of[-1,1]){
  const p=H.pt(.05,s,.88);
  rsLink(B,'wood',[p[0]+.8,p[1]+.5,p[2]*1.04],[p[0]-3.6,-1.45,p[2]*1.22],.12,MAHOG,6);
  rsBox(B,'paktong',[2.1,.95,.09],[p[0]-3.1,-1.15,p[2]*1.2],[0,0,.56],GOLD,1);
 }
 for(const [px,py,pz,yaw,col] of[[15.8,yD+.12,0,0,SILK],[12.2,yD+.12,-2.2,.4,COB],[12.2,yD+.12,2.2,-.4,TURQ],[6.2,yTer,1.5,0,SILK],[6.2,yTer,-1.5,0,CRIM],[1.2,yD,6.1,0,GOLD],[-4.5,yD,-6.1,Math.PI,COB],[-10.2,yD,2.4,Math.PI,SILK]])
  rsFigure(B,[px,py,pz],yaw,col,false,0x9e7052);
 rsBake(B,V.group,'riaWestPalaceBarge');V.deckY=yD;return V;
}
RS_VESSEL({key:'riaWestPalaceBarge',name:'Lower-Ria Heartland Dynastic Palace-Barge',culture:'ria',L:56,B:28,H:16,
 tags:{type:['palace barge','royal barge','state','galley'],propulsion:['oars'],hull:'monohull',wealth:'royal',crew:140,role:'ceremonial floating palace of the Western Ria Heartland Dynasty'},
 blurb:'Broad-beam Lower-Ria floating palace: 44 synchronized sweeps, mosaic forecourt with potted cypresses, grand balustraded stair, silk-curtained porphyry audience hall, gilded aft rotunda dome, and the hull-embracing 5-headed gilded Uktena river-serpent prow.',build:buildRsRiaWestPalaceBarge});
