// ---------------------------------------------------------------- vessel: Ria Patrician Floating-Villa Barge
// Great patrician merchant-house floating villa of the Ria Valley: a 41 m walnut, red-porphyry, and turquoise-glazed
// hull pulled by 28 sweeps. Its bow anchors a solid gilded-bronze cutwater & stem-chute flush against the forefoot
// (zero gap!) suspending a pierced Gilded-Bronze & Glowing Ria-Amber Orb above the bow wave, while a sculpted muscular
// emerald-and-gold scaled breastplate straddles both bow gunwales to grow continuously into a towering S-curved
// Sturgeon-Leviathan prow ahead of a cypress forecourt, pedimented banquet hall with acroteria, and gilded aft rotunda.
function buildRsRiaPatricianBarge(){reseed(74900);
 if(!RSMAT.stone||!RSMAT.glaze||!RSMAT.silk||!RSMAT.paktong||!RSMAT.ember){
  const tSto=rsNoiseTex('extSto',256,256,(g,W,H)=>{g.fillStyle='#ded8ce';g.fillRect(0,0,W,H);rsSpeckle(g,W,H,700,.07,true);});
  const tGlz=rsNoiseTex('extGlz',256,256,(g,W,H)=>{g.fillStyle='#cfd8dc';g.fillRect(0,0,W,H);rsSpeckle(g,W,H,500,.06,false);});
  const tSlk=rsNoiseTex('extSlk',256,256,(g,W,H)=>{g.fillStyle='#ece8e0';g.fillRect(0,0,W,H);});
  const tMet=rsNoiseTex('extPak',256,256,(g,W,H)=>{g.fillStyle='#dcdad4';g.fillRect(0,0,W,H);rsSpeckle(g,W,H,500,.06,true);});
  const tEmb=rsNoiseTex('extEmb',128,128,(g,W,H)=>{g.fillStyle='#ff9a28';g.fillRect(0,0,W,H);for(let i=0;i<140;i++){g.fillStyle=h3(i,2,7)>.4?'#ffd060':'#984210';g.beginPath();g.arc(h3(i,1,3)*W,h3(i,4,9)*H,3+h3(i,6,2)*8,0,TAU);g.fill();}});
  const tRope=rsNoiseTex('extRop',128,128,(g,W,H)=>{g.fillStyle='#d6ceb8';g.fillRect(0,0,W,H);for(let i=-H;i<W+H;i+=8){g.strokeStyle='rgba(60,44,24,.28)';g.lineWidth=3;g.beginPath();g.moveTo(i,0);g.lineTo(i+H,H);g.stroke();}});
  if(!RSMAT.stone)rsDefMat('stone',new THREE.MeshStandardMaterial({map:tSto,vertexColors:true,roughness:.38,side:DS}));
  if(!RSMAT.glaze)rsDefMat('glaze',new THREE.MeshStandardMaterial({map:tGlz,vertexColors:true,roughness:.24,metalness:.06,side:DS}));
  if(!RSMAT.silk)rsDefMat('silk',new THREE.MeshStandardMaterial({map:tSlk,vertexColors:true,roughness:.52,side:DS}));
  if(!RSMAT.paktong)rsDefMat('paktong',new THREE.MeshStandardMaterial({map:tMet,vertexColors:true,metalness:.82,roughness:.28,side:DS}));
  if(!RSMAT.ember)rsDefMat('ember',new THREE.MeshStandardMaterial({map:tEmb,emissive:0xe8841c,emissiveMap:tEmb,emissiveIntensity:1.25,vertexColors:true,roughness:.45,side:DS}));
  if(!RSMAT.metal.map){RSMAT.metal.map=tMet;RSMAT.metal.needsUpdate=true;}
  if(!RSMAT.rope.map){RSMAT.rope.map=tRope;RSMAT.rope.needsUpdate=true;}
 }
 if(!RSMAT.foamT){
  const tFoam=rsNoiseTex('extFoam',128,128,(g,W,H)=>{g.fillStyle='#dceeee';g.fillRect(0,0,W,H);for(let i=0;i<220;i++){g.fillStyle=`rgba(255,255,255,${.2+.45*h3(i,3,8)})`;g.beginPath();g.arc(h3(i,1,2)*W,h3(i,5,4)*H,2+h3(i,7,6)*7,0,TAU);g.fill();}});
  rsDefMat('foamT',new THREE.MeshBasicMaterial({map:tFoam,color:0xe8f6f6,transparent:true,opacity:.44,depthWrite:false,side:DS}));
 }
 if(typeof KMAT!=='undefined'&&KMAT.bindMat)KMAT.bindMat('ringsea',RSMAT,{alias:{woodI:'wood',paktong:'metal'},tile:{metal:1,paktong:1,rope:1,stone:1,glaze:1,silk:1}});
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const WALN=rsLin(0x462318),DARK=rsLin(0x1f120d),PORP=rsLin(0x7c2624),DOLO=rsLin(0xe8dfd0),DOLOD=rsLin(0xcdc2ae);
 const GOLD=rsLin(0xdca634),GOLDD=rsLin(0xae7e22),EMER=rsLin(0x1f684c),EMERL=rsLin(0x34966c),TURQ=rsLin(0x1e7d86),SILK=rsLin(0xf4efe4),CYP=rsLin(0x214826);
 // Broad floating-villa hull (40.5 m x 13.8 m)
 const H=rsHull({L:40.5,B:13.8,fb:2.38,dr:1.46,sheerF:1.45,sheerA:1.65,sp:2.4,pb:2.25,pa:2.2,q:.44,n:3.1,flare:.08,rakeF:1.65,rakeA:1.25,keelEnd:.32});
 rsHullMesh(B,H,'wood',(u,h)=>h>.91?GOLD:h>.81?PORP:h>.73?EMER:h<.34?DARK:WALN,76,12);
 {const pts=[];for(let i=0;i<=46;i++){const u=i/46,hw=H.halfAt(u,0);if(hw>0)pts.push([u,hw]);}
  const hF0=u=>clamp((0-H.yk(u))/(H.ys(u)-H.yk(u)),0,1);
  for(const s of[-1,1]){const fg=rsGrid((a,v)=>{const k=Math.min(pts.length-1,Math.round(a*(pts.length-1))),u=pts[k][0],hw=pts[k][1];
   return[H.xAt(u,hF0(u)),.036,s*(hw+.02+v*.85*(.4+.6*Math.sin(Math.PI*a)))];},pts.length-1,1,(a,v)=>[a*8,v]);rsPut(B,'foamT',fg,null,null,null,0xffffff);}}
 const dY=rsDeck(B,H,{bw:.48,mk:'stone',col:DOLO});
 const yD=dY(.5);
 rsWale(B,H,.91,.1,'paktong',GOLD,.03,.86);
 rsWale(B,H,.73,.085,'glaze',EMER,.04,.85);
 rsSpine(B,H,.22,GOLDD,null,null,'paktong');
 // Allied Patrician House Medallions (River-Tortoise & Diving-Heron bronze reliefs) along hull sides + 28 sweeps
 for(const a of rsAlong(H,.22,.78,8,.62)){
  rsDecal(B,H,a.u,a.s,.62,.38,GOLD,'paktong',16,.04);
  rsDecal(B,H,a.u,a.s,.62,.22,EMERL,'chitin',10,.072);
 }
 const oarPts=[];
 for(let i=0;i<14;i++)oarPts.push([lerp(-11.8,10.6,i/13),yD-.32,H.hb(.5)+.35]);
 rsOars(V,H,{name:'villa sweeps',points:oarPts,len:5.5,inb:1.5,r:.05,bladeL:1.18,bladeW:.24,col:0x9e7444,sweep:.38,lift:.15,rate:.42,ripple:.45});
 // 1. Solid Bronze Cutwater Stem-Web & Chute (`image.png`!) + Hull-Straddling Scaled Breastplate & S-Curved Leviathan Prow (`image_5.png`!)
 {const pb=H.pt(1,0,1),bx=pb[0],by=pb[1];
  // Chute outer profile curve plunging smoothly down the raked stem from bow parapet (`by+.55`) to forefoot (`y=.38`)
  const chuteSpine=v=>[lerp(bx+2.05,bx+.28,v)+Math.sin(v*Math.PI)*.32,lerp(.38,by+.55,v),0];
  // Solid Sculpted Gilded-Bronze Cutwater Web & Cheek-Plates anchoring the chute 100% flush to the hull forefoot (`u = 0.87..1.0`):
  // ZERO open water gap between chute and hull!
  for(const s of[-1,1]){
   const webG=rsGrid((u,v)=>{
    const hF=lerp(.04,.96,v),uH=lerp(.87,.996,u);
    const hp=H.pt(uH,s,hF),hn=H.nrm(uH,s,hF);
    const aft=[hp[0]+hn.x*.042,hp[1]+hn.y*.042,hp[2]+hn.z*.042];
    const sp=chuteSpine(v),fwd=[sp[0],sp[1],s*lerp(.16,.38,Math.sin(v*Math.PI*.85))];
    // Bulge slightly outward across the bronze cheek so it reads as cast bevelled platework
    const bulge=Math.sin(u*Math.PI)*.14;
    return[lerp(aft[0],fwd[0],u),lerp(aft[1],fwd[1],u),lerp(aft[2],fwd[2],u)+s*bulge];
   },12,12,(u,v)=>[u*2.2,v*2.2]);
   rsPut(B,'paktong',webG,null,null,null,s>0?GOLD:GOLDD);
  }
  // Heavy Gilded Chute Spine & Fluted Side Mouldings running down the front of the solid bronze cutwater (`image.png`!)
  const spPts=[];for(let i=0;i<=12;i++)spPts.push(chuteSpine(1-i/12));
  rsTube(B,'paktong',spPts,t=>lerp(.44,.24,t),GOLD,20,10);
  for(const s of[-1,1]){
   const flPts=[];for(let i=0;i<=12;i++){const v=1-i/12,c=chuteSpine(v);flPts.push([c[0]-.14,c[1]+.05,s*lerp(.34,.15,1-v)]);}
   rsTube(B,'paktong',flPts,t=>lerp(.11,.06,t),GOLDD,18,7);
  }
  // Suspended Pierced Gilded-Bronze & Glowing Ria-Amber Orb hovering off the stem-tip at (bx + 2.75, 0.45, 0) (`image.png`!)
  const ox=bx+2.75,oy=.46;
  rsTube(B,'paktong',[[bx+1.98,.42,0],[bx+2.32,.58,0],[ox-.46,oy+.18,0]],.068,GOLD,10,6);
  rsSphere(B,'ember',.48,[ox,oy,0],null,0xffbe48,14,12);
  rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.53,.042,7,20),.8),[ox,oy,0],[0,0,0],null,GOLD);
  rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.56,.042,7,20),.8),[ox,oy,0],[Math.PI/2,0,0],null,GOLD);
  rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.59,.038,7,20),.8),[ox,oy,0],[0,Math.PI/2,0],null,GOLDD);
  // Sculpted Muscular Emerald-and-Gold Scaled Breastplate & Swept Cheek-Volutes Straddling Both Bow Gunwales (`u = 0.84..1.0`):
  // Sweeps 6.5 m aft along port & starboard rails and converges seamlessly into the 0.84 m-radius root of the Leviathan neck!
  const nx0=bx-.95,ny0=by+1.25,rRoot=.82;
  const leviBreastPt=(u,v)=>{
   const w=u*2-1,aw=Math.abs(w),s=w<0?-1:1;
   const uH=lerp(.995,.84,Math.pow(aw,.8));
   const hF=lerp(.58,1.0,Math.min(1,v*1.25));
   const hp=H.pt(uH,s,hF),hn=H.nrm(uH,s,hF);
   const chest=Math.pow(Math.max(0,1-aw),1.35);
   const hx=hp[0]+hn.x*.05+chest*.95*Math.sin(v*Math.PI*.85),hy=hp[1]+chest*v*1.05,hz=(aw<1e-4?0:hp[2]+hn.z*(.05+.32*(1-aw*aw)));
   const kTop=smooth01((v-.52)/.48);
   const ang=w*.95*Math.PI;
   const cx=nx0-Math.cos(ang)*rRoot*1.06,cy=ny0-.14*Math.cos(ang),cz=Math.sin(ang)*rRoot*.92;
   return[lerp(hx,cx,kTop),lerp(hy,cy,kTop),lerp(hz,cz,kTop)];
  };
  const lbG=rsGrid(leviBreastPt,28,14,(u,v)=>[u*4.5,v*2.8]);
  rsGridColors(lbG,28,14,(u,v)=>Math.abs(u-.5)>.36?GOLD:(v>.78?EMERL:EMER));
  rsPut(B,'chitin',lbG,null,null,null,null);
  // Aft Breastplate Closure fairing cleanly down onto the foredeck + Swept Gilded Cheek-Volutes & Pectoral Fin-Scrolls (`image_5.png`!)
  const lbBack=rsGrid((u,v)=>{
   const w=u*2-1,ang=w*.95*Math.PI;
   const top=[nx0-Math.cos(ang)*rRoot*1.06,ny0-.14*Math.cos(ang),Math.sin(ang)*rRoot*.92];
   const uH=lerp(.92,.85,Math.abs(w)),dk=[H.xAt(uH,1),dY(uH)+.06,w*H.halfAt(uH,dY(uH))*.86];
   return[lerp(dk[0],top[0],v),lerp(dk[1],top[1],v),lerp(dk[2],top[2],v)];
  },16,5,(u,v)=>[u*2.5,v*1.2]);
  rsPut(B,'chitin',lbBack,null,null,null,EMER);
  for(const s of[-1,1]){
   const uSide=s<0?0:1,rimPts=[];
   for(let i=0;i<=12;i++)rimPts.push(leviBreastPt(lerp(.5,uSide,i/12),.45));
   rsTube(B,'paktong',rimPts,t=>lerp(.12,.06,t),GOLD,18,7);
   rsScroll(B,[nx0-.35,ny0+.05,s*.82],.58,1.15,.11,GOLD,-1,'paktong',s*.86);
  }
  // Sculpted Gilded Collar Ring + Towering S-Curved Emerald-and-Gold Scaled Sturgeon-Leviathan Neck (`image_5.png`!)
  rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(rRoot*1.02,.085,8,22),1),[nx0,ny0-.04,0],[Math.PI/2,-.28,0],null,GOLD);
  const levPts=[
   [nx0,ny0-.16,0],
   [nx0+.95,ny0+1.25,0],
   [nx0-.55,ny0+3.15,0],
   [nx0+.45,ny0+4.85,0],
   [nx0+2.05,ny0+5.25,0]
  ];
  const levCurve=rsTube(B,'chitin',levPts,t=>lerp(.82,.32,Math.pow(t,.72)),EMERL,28,12);
  // Continuous Gilded Ventral Belly-Scutes & Serrated Dorsal Fin-Spines following the exact S-curve!
  const bellyPts=[];
  for(let i=0;i<=16;i++){
   const t=i/16,pt=levCurve.getPointAt(t),tg=levCurve.getTangentAt(t),rr0=lerp(.82,.32,Math.pow(t,.72));
   // Outward ventral normal in xy plane: (+tg.y, -tg.x)
   const nl=Math.hypot(tg.x,tg.y)||1,vx=tg.y/nl,vy=-tg.x/nl;
   bellyPts.push([pt.x+vx*rr0*.72,pt.y+vy*rr0*.72,0]);
   if(i>=2&&i<=14){
    const dx=-vx,dy=-vy;
    rsCone(B,'paktong',.11*(1-.35*t),.58*(1-.28*t),[pt.x+dx*(rr0+.18),pt.y+dy*(rr0+.18),0],[0,0,Math.atan2(dy,dx)-Math.PI/2],GOLD,5);
   }
  }
  rsTube(B,'paktong',bellyPts,t=>lerp(.32,.12,t),GOLD,24,8);
  // Fierce Sculpted Sturgeon-Leviathan Head, Gilded Jaws, Ivory Fangs, Flowing Barbels & Stag-Horns
  const hx=nx0+2.28,hy=ny0+5.22;
  rsSphere(B,'chitin',.48,[hx,hy,0],[1.45,.98,.9],EMER,14,10);
  rsCyl(B,'paktong',.15,.3,1.32,[hx+.92,hy+.08,0],[0,0,-Math.PI/2+.08],GOLD,10);
  rsCyl(B,'paktong',.11,.24,1.12,[hx+.82,hy-.24,0],[0,0,-Math.PI/2-.26],GOLDD,8);
  for(const s of[-1,1]){
   rsSphere(B,'ember',.115,[hx+.26,hy+.17,s*.36],null,0xffc440,8,6);
   rsTube(B,'paktong',[[hx-.1,hy+.34,s*.24],[hx-.85,hy+.96,s*.52],[hx-1.55,hy+1.32,s*.38]],t=>lerp(.095,.028,t),GOLD,12,6);
   rsTube(B,'paktong',[[hx+1.02,hy-.04,s*.16],[hx+.72,hy-.68,s*.44]],.03,GOLD,8,5);
   for(let f=0;f<3;f++)rsCone(B,'stone',.038,.24,[hx+.58+f*.28,hy-.05,s*.15],[0,0,-Math.PI*.88],DOLO,5);
  }
 }
 // Sculpted Bronze & Scaled Stern-Bustle fairing smoothly into the Curling Leviathan Tail-Fin!
 {const pa=H.pt(0,0,1);
  const stG=rsGrid((u,v)=>{
   const w=u*2-1,aw=Math.abs(w),s=w<0?-1:1,uH=lerp(0,.085,aw);
   const hp=H.pt(uH,s,lerp(.5,1,v)),hn=H.nrm(uH,s,lerp(.5,1,v));
   return[hp[0]-(1-aw)*.48*Math.sin(v*Math.PI*.85)+hn.x*.04,hp[1]+(1-aw)*v*.55,aw<1e-4?0:hp[2]+hn.z*(.04+.26*(1-aw))];
  },16,8,(u,v)=>[u*2.5,v*1.4]);
  rsPut(B,'chitin',stG,null,null,null,EMER);
  rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.44,.065,7,18),.8),[pa[0]+.08,pa[1]+.35,0],[Math.PI/2,.35,0],null,GOLD);
  rsTube(B,'chitin',[[pa[0]+.12,pa[1]+.2,0],[pa[0]-.88,pa[1]+1.55,0],[pa[0]-1.42,pa[1]+3.25,0]],t=>lerp(.44,.13,t),EMERL,18,9);
  for(const sf of[-1,1])rsCone(B,'paktong',.2,1.02,[pa[0]-1.52,pa[1]+3.55,sf*.34],[sf*.85,0,.38],GOLD,6);
 }
 // 2. Dolomite Villa Forecourt (x in [6.5, 16.2]) with Porphyry-and-Turquoise Mosaic & Potted Columnar Cypresses (`image.png`!)
 {const fx=11.4,fy=yD+.012;
  rsBox(B,'stone',[6.8,.04,6.4],[fx,fy+.02,0],null,PORP,1.5);
  rsBox(B,'stone',[5.6,.04,5.2],[fx,fy+.068,0],null,DOLO,1.5);
  rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(1.45,.08,6,24),.8),[fx,fy+.11,0],[Math.PI/2,0,0],null,GOLD);
  rsCyl(B,'glaze',1.25,1.25,.035,[fx,fy+.112,0],null,TURQ,22);
  const tree=(tx,tz)=>{
   rsBox(B,'stone',[.82,.56,.82],[tx,yD+.288,tz],null,PORP,1);
   rsBox(B,'paktong',[.92,.08,.92],[tx,yD+.616,tz],null,GOLD,1);
   rsCyl(B,'wood',.1,.13,.62,[tx,yD+.92,tz],null,WALN,7);
   for(let k=0;k<3;k++)rsCone(B,'thatch',.54-k*.1,1.72-k*.22,[tx,yD+1.72+k*.84,tz],null,CYP,10);
  };
  for(const s of[-1,1])for(const px of[8.2,13.4,-3.2,-7.8])tree(px,s*4.35);
 }
 // 3. Enriched Classical Ria Peristyle Banquet Pavilion amidships (`image.png` foreground: pediment relief + sculpted acroteria!)
 {const px=1.0,pw=10.4,pd=8.0,podiumH=.66,yPod=yD+.008+podiumH;
  rsBox(B,'stone',[pw+.6,podiumH,pd+.6],[px,yD+.008+podiumH/2,0],null,DOLOD,2);
  rsBox(B,'paktong',[pw+.72,.08,pd+.72],[px,yPod-.03,0],null,GOLD,1.5);
  for(let st=0;st<3;st++)rsBox(B,'stone',[.34,podiumH/3-.01,4.4],[6.48+st*.36,yD+.008+(2.5-st)*(podiumH/3),0],null,DOLO,1.5);
  const colH=3.15,yEnt=yPod+.008+colH;
  rsBox(B,'stone',[5.8,colH-.04,4.6],[px-.6,yPod+.008+(colH-.04)/2,0],null,DOLO,2);
  rsBox(B,'glaze',[.06,2.15,2.2],[px+2.34,yPod+1.12,0],null,PORP,1);
  const placeCol=(cx,cz)=>{
   rsBox(B,'stone',[.5,.2,.5],[cx,yPod+.108,cz],null,DOLO,1);
   rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.23,.04,6,14),.6),[cx,yPod+.24,cz],[Math.PI/2,0,0],null,GOLD);
   rsCyl(B,'stone',.18,.21,colH-.44,[cx,yPod+.24+(colH-.44)/2,cz],null,PORP,12);
   rsCyl(B,'paktong',.28,.19,.2,[cx,yEnt-.1,cz],null,GOLD,12);
  };
  for(let i=0;i<5;i++){const cx=lerp(px-pw/2+.35,px+pw/2-.35,i/4);for(const s of[-1,1])placeCol(cx,s*3.65);}
  for(const cz of[-1.25,1.25]){placeCol(px+pw/2-.35,cz);placeCol(px-pw/2+.35,cz);}
  for(let i=0;i<4;i++){
   const xa=lerp(px-pw/2+.45,px+pw/2-2.65,i/3),xb=xa+2.1;
   for(const s of[-1,1]){
    const cg=rsGrid((u,v)=>{const su=Math.abs(u-.5)*2,b=Math.sin(Math.PI*v)*(1-su)*.18;
     return[lerp(xa,xb,u),lerp(yPod+.22,yEnt-.22,v),s*(3.6-b)];},8,6,(u,v)=>[u*2,v*2]);
    rsPut(B,'silk',cg,null,null,null,SILK);
   }
  }
  // Architrave + Emerald-Glazed Frieze + Gilded Cornice + Pediment Roof with Gilded Acroteria (`image.png`!)
  rsBox(B,'stone',[pw+.26,.18,pd+.26],[px,yEnt+.098,0],null,DOLO,1.5);
  rsBox(B,'glaze',[pw+.34,.18,pd+.34],[px,yEnt+.286,0],null,EMER,1.5);
  rsBox(B,'paktong',[pw+.52,.12,pd+.52],[px,yEnt+.444,0],null,GOLD,1.5);
  const rRise=1.68,yRoof0=yEnt+.512;
  for(const s of[-1,1]){
   const slopeL=Math.hypot(pd/2+.48,rRise);
   rsBox(B,'tile',[pw+.84,.12,slopeL],[px,yRoof0+rRise/2,s*(pd/4+.24)],[s*Math.atan2(rRise,pd/2+.48),0,0],EMER,2);
  }
  for(const sx of[-1,1]){
   const sh=new THREE.Shape();sh.moveTo(-pd/2-.12,0);sh.lineTo(pd/2+.12,0);sh.lineTo(0,rRise-.06);sh.lineTo(-pd/2-.12,0);
   rsPut(B,'stone',rsUV(new THREE.ShapeGeometry(sh),2),[px+sx*(pw/2+.02),yRoof0,0],[0,Math.PI/2,0],null,DOLO);
   // Gilded tympanum River-Sun & scroll relief
   rsCyl(B,'paktong',.54,.54,.08,[px+sx*(pw/2+.08),yRoof0+.58,0],[0,0,Math.PI/2],GOLD,18);
   for(const sz of[-1,1]){
    rsScroll(B,[px+sx*(pw/2+.09),yRoof0+.38,sz*.62],.32,1.0,.055,GOLD,sx,'paktong',sz*1.15);
    // Corner palmette acroteria on pediment eaves
    rsCone(B,'paktong',.14,.52,[px+sx*(pw/2+.36),yRoof0+.28,sz*(pd/2+.36)],[sz*-.18,0,0],GOLD,6);
   }
   // Apex River-Lily Acroterion
   rsSphere(B,'paktong',.22,[px+sx*(pw/2+.38),yRoof0+rRise+.28,0],[1,1.35,1],GOLD,10,8);
  }
  rsLink(B,'paktong',[px-pw/2-.42,yRoof0+rRise+.08,0],[px+pw/2+.42,yRoof0+rRise+.08,0],.08,GOLD,8);
  rsSolid(B,[px-pw/2-.4,yD+.01,-pd/2-.4],[px+pw/2+.4,yRoof0+rRise+.55,pd/2+.4]);
 }
 // 4. Octagonal Gilded-Dome Aft Belvedere Rotunda with Arched Glazed Windows (`image.png`!) at x = -11.6, z = 0
 {const bx=-11.6,by0=yD+.008;
  rsCyl(B,'stone',3.55,3.8,.52,[bx,by0+.26,0],null,DOLO,8);
  const cY=by0+.53,cH=2.85;
  rsCyl(B,'stone',2.2,2.2,cH-.04,[bx,cY+cH/2,0],null,PORP,8);
  // Arched turquoise-glazed clerestory windows on the 8 faces of the inner drum (+3 cm proud of 2.2*cos(pi/8)=2.03 -> r=2.09)
  for(let k=0;k<8;k++){
   const a=k*TAU/8,wx=bx+Math.cos(a)*2.09,wz=Math.sin(a)*2.09;
   rsPut(B,'glaze',rsUV(rsArchGeo(.68,1.38),1),[wx,cY+1.48,wz],[0,-a+Math.PI/2,0],null,TURQ);
   const aCol=a+.39,cx=bx+Math.cos(aCol)*3.05,cz=Math.sin(aCol)*3.05;
   rsCyl(B,'stone',.16,.18,cH-.24,[cx,cY+.12+(cH-.24)/2,cz],null,DOLO,10);
   rsCyl(B,'paktong',.24,.17,.16,[cx,cY+cH-.08,cz],null,GOLD,10);
  }
  const yDom=cY+cH+.01;
  rsCyl(B,'paktong',3.35,3.25,.3,[bx,yDom+.15,0],null,GOLD,16);
  rsCyl(B,'glaze',2.95,3.05,.46,[bx,yDom+.54,0],null,EMER,16);
  const domG=rsGrid((u,v)=>{const a=u*TAU,p=v*Math.PI*.48,r=(2.92+.07*Math.abs(Math.sin(u*TAU*8)))*Math.cos(p);
   return[bx+Math.cos(a)*r,yDom+.78+Math.sin(p)*2.35,Math.sin(a)*r];},24,10,(u,v)=>[u*5,v*2]);
  rsPut(B,'paktong',domG,null,null,null,GOLD);
  rsCyl(B,'paktong',.48,.56,.72,[bx,yDom+3.42,0],null,GOLD,10);
  rsCone(B,'paktong',.62,.82,[bx,yDom+4.18,0],null,GOLD,10);
  rsLink(B,'paktong',[bx,yDom+4.58,0],[bx,yDom+6.85,0],.055,GOLD,6,.03);
  rsPennant(B,[bx,yDom+6.85,0],3.6,.46,[EMERL,GOLD,PORP]);
  rsSolid(B,[bx-3.8,by0,-3.8],[bx+3.8,yDom+4.8,3.8]);
 }
 // Perimeter balustrade along fore & aft quarters + steering sweeps + patrician guests
 for(const s of[-1,1])for(const [u0,u1,nb] of[[.08,.34,7],[.66,.86,6]]){
  const rPts=[];
  for(let i=0;i<=nb;i++){
   const u=lerp(u0,u1,i/nb),p=H.pt(u,s,1);
   rsCyl(B,'stone',.065,.08,.7,[p[0],p[1]+.36,p[2]*.96],null,DOLO,8);
   rPts.push([p[0],p[1]+.74,p[2]*.96]);
  }
  rsTube(B,'paktong',rPts,.055,GOLD,nb*3,6);
 }
 for(const s of[-1,1]){
  const p=H.pt(.05,s,.88);
  rsLink(B,'wood',[p[0]+.6,p[1]+.45,p[2]*1.04],[p[0]-3.2,-1.35,p[2]*1.2],.11,WALN,6);
  rsBox(B,'paktong',[1.85,.85,.08],[p[0]-2.75,-1.08,p[2]*1.18],[0,0,.55],GOLD,1);
 }
 for(const [px,py,pz,yaw,col] of[[12.6,yD+.12,0,0,SILK],[9.8,yD+.12,-1.8,.5,PORP],[9.8,yD+.12,1.8,-.5,EMER],[1.8,yD,5.2,0,GOLD],[-5.8,yD,-4.8,Math.PI,SILK],[-15.6,yD,0,Math.PI,EMERL]])
  rsFigure(B,[px,py,pz],yaw,col,false,0x9e7052);
 rsBake(B,V.group,'riaPatricianBarge');V.deckY=yD;return V;
}
RS_VESSEL({key:'riaPatricianBarge',name:'Ria Patrician Floating-Villa Barge',culture:'ria',L:44,B:24,H:14.5,
 tags:{type:['pleasure barge','villa barge','patrician','galley'],propulsion:['oars'],hull:'monohull',wealth:'wealthy',crew:68,role:'patrician merchant-family floating villa and banquet barge of the Ria Valley'},
 blurb:'Patrician floating-villa barge with a solid bronze cutwater chute suspending a glowing Ria-Amber orb and a hull-straddling emerald-and-gold Sturgeon-Leviathan prow, cypress forecourt, pedimented porphyry banquet hall with acroteria, and gilded aft belvedere.',build:buildRsRiaPatricianBarge});
