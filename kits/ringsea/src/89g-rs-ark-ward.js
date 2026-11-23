// ---------------------------------------------------------------- vessel: cFlīt-qBōn Coupled 3-Hull Chained Ark-Ward
// Shows how the cFlīt-qBōn live moored together over 80-150 m fault trenches: three modular twin-hulled catamarans
// (central command & moon-pool ark + starboard dwelling/drying catamaran + port boatwright/net-loft catamaran, six hulls
// in all) coupled side-by-side via sawn green-nephrite ball-and-socket hinge-bridges into a continuous walkable floating
// village street, anchored at the bow by a cyclopean alternating Paktong-link and carved-nephrite-ring trench chain.
function rsArkWardClaw(g,W,H,P){
 rsCloth(g,W,H,'#7f281a',11,'v');g.save();rsPolyPath(g,P);g.clip();
 g.strokeStyle='rgba(40,12,8,.44)';g.lineWidth=2;
 for(let k=1;k<9;k++){g.beginPath();g.moveTo(0,H*(1-k/9));g.lineTo(W,H*(1-k/9)-H*.36);g.stroke();}
 g.strokeStyle='#1f5a40';g.lineWidth=W*.048;rsPolyPath(g,P);g.stroke();
 g.strokeStyle='#ded8cb';g.lineWidth=W*.016;rsPolyPath(g,rsInset(P,W*.038));g.stroke();
 // Interlocked three-ring Ark-Ward emblem in emerald nephrite & Paktong white
 const n0=P.length/2,ta=P[0],tm=[(P[n0-1][0]+P[n0][0])/2,(P[n0-1][1]+P[n0][1])/2];
 const cx=lerp(ta[0],tm[0],.5),cy=lerp(ta[1],tm[1],.5),R=Math.min(W,H)*.095;
 for(const [ox,oy,c] of[[-R*.85,R*.35,'#ded8cb'],[0,-R*.45,'#329b6b'],[R*.85,R*.35,'#ded8cb']]){
  g.strokeStyle=c;g.lineWidth=R*.22;g.beginPath();g.arc(cx+ox,cy+oy,R,0,TAU);g.stroke();
 }
 g.restore();
 const n=P.length/2,a=P[n-1],b=P[n],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,d=Math.hypot(a[0]-b[0],a[1]-b[1]);
 g.globalCompositeOperation='destination-out';g.beginPath();g.arc(mx+d*.3,my-d*.1,d*.34,0,TAU);g.fill();g.globalCompositeOperation='source-over';
}
function buildRsArkChainedWard(){reseed(74500);
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
 const CYP=rsLin(0x54251a),CYPD=rsLin(0x361811),TAR=rsLin(0x161311),DECK=rsLin(0x88583c),BEAM=rsLin(0x4a2618);
 const PAK=rsLin(0xded8cc),PAKD=rsLin(0xa8aca8),BRZ=rsLin(0xba8636),JADE=rsLin(0x1e6d48),JADEL=rsLin(0x329868),ROPE=rsLin(0xa28b66);
 const foamHull=(H,w)=>{const pts=[];for(let i=0;i<=38;i++){const u=i/38,hw=H.halfAt(u,0);if(hw>0)pts.push([u,hw]);}if(pts.length<2)return;
  const hF0=u=>clamp((0-H.yk(u))/(H.ys(u)-H.yk(u)),0,1);
  for(const s of[-1,1]){const g=rsGrid((a,v)=>{const k=Math.min(pts.length-1,Math.round(a*(pts.length-1))),u=pts[k][0],hw=pts[k][1];
   return[H.xAt(u,hF0(u)),.035,H.z0+s*(hw+.02+v*w*(.4+.6*Math.sin(Math.PI*a)))];},pts.length-1,1,(a,v)=>[a*6,v]);rsPut(B,'foamT',g,null,null,null,0xffffff);}};
 // Helper for a butt-joined storm-light cabin (zero coplanar corner faces)
 const arkHouse=(hx,hy0,hz,hw,hd,hh,nWin)=>{
  for(const sx of[-1,1])rsBox(B,'tarwood',[.16,hh,hd],[hx+sx*(hw/2-.08),hy0+hh/2,hz],null,CYP,2);
  for(const sz of[-1,1])rsBox(B,'tarwood',[hw-.34,hh,.16],[hx,hy0+hh/2,hz+sz*(hd/2-.08)],null,CYP,2);
  rsSolid(B,[hx-hw/2-.28,hy0,hz-hd/2-.28],[hx+hw/2+.28,hy0+hh+.75,hz+hd/2+.28]);
  rsVault(B,'tarwood',hx-hw/2-.26,hx+hw/2+.26,hy0+hh+.008,hd/2+.24,.56,CYPD,10,10,2.2);
  for(const rx of[hx-hw*.36,hx+hw*.36])rsVault(B,'paktong',rx-.07,rx+.07,hy0+hh+.026,hd/2+.26,.58,PAK,2,10,1.2);
  for(const sz of[-1,1])for(let i=0;i<nWin;i++){
   const wx=hx-hw*.3+(nWin>1?i*(hw*.6)/(nWin-1):0),wy=hy0+hh*.58,wz=hz+sz*(hd/2+.02);
   rsBox(B,'paktong',[.54,.44,.035],[wx,wy,wz],null,PAK,1);
   rsBox(B,'jade',[.4,.3,.028],[wx,wy,wz+sz*.022],null,JADEL,1);
  }
  rsBox(B,'tarwood',[.045,1.45,.78],[hx+hw/2+.025,hy0+.74,hz],null,TAR,1.2);
 };
 // Helper to build one twin-hull catamaran hull-pair with Paktong cutwaters (clean port/stbd half-grids: zero stem/stern fold!)
 const makeCatHulls=(L,Bm,fb,dr,zA,zB)=>{
  return[zA,zB].map(z0=>{
   const H=rsHull({L,B:Bm,fb,dr,sheerF:1.05,sheerA:.82,sp:2.5,pb:2.25,pa:2.25,q:.62,n:1.95,flare:.12,rakeF:1.15,rakeA:.75,keelEnd:.25,z0});
   for(const s of[-1,1]){
    const g=rsGrid((u,v)=>{const hF=s>0?v:1-v;return H.pt(u,s,hF);},52,10,(u,v,p)=>[p[0]/4,(p[1]-H.yk(u)+Math.abs(p[2]-H.z0))/4]);
    rsGridColors(g,52,10,(u,v)=>{const h=s>0?v:1-v;return h>.9?PAKD:h>.82?CYP:h<.38?TAR:CYPD;});rsPut(B,'tarwood',g,null,null,null,null);
   }
   foamHull(H,.46);
   rsDeck(B,H,{bw:.2,mk:'tarwood',col:CYPD});
   rsWale(B,H,.88,.055,'paktong',PAKD,.04,.96);
   const pb=H.pt(1,0,1),pa=H.pt(0,0,1);
   rsSpine(B,H,.12,PAK,[[pb[0]+.45,pb[1]+.38],[pb[0]+.85,pb[1]+.88]],[[pa[0]-.28,pa[1]+.48]],'paktong');
   for(const s of[-1,1]){
    const p1=H.pt(.86,s,.94),n1=H.nrm(.86,s,.94),p2=H.pt(.94,s,.96),n2=H.nrm(.94,s,.96);
    rsTube(B,'paktong',[[p1[0]+n1.x*.034,p1[1]+n1.y*.034,p1[2]+n1.z*.034],[p2[0]+n2.x*.034,p2[1]+n2.y*.034,p2[2]+n2.z*.034],[pb[0]+.46,pb[1]+.4,z0+s*.048],[pb[0]+.82,pb[1]+.84,z0]],t=>lerp(.05,.034,t),PAK,9,6);
    const q1=H.pt(.11,s,.93),m1=H.nrm(.11,s,.93);
    rsTube(B,'paktong',[[q1[0]+m1.x*.032,q1[1]+m1.y*.032,q1[2]+m1.z*.032],[pa[0]-.26,pa[1]+.44,z0]],t=>lerp(.046,.032,t),PAKD,6,6);
   }
   const shG=rsGrid((u,v)=>{const uu=lerp(.77,.995,u),s=v<.5?-1:1,hh=lerp(.04,.85,1-Math.abs(v*2-1)*.92);
    const p=H.pt(uu,s,hh),N=H.nrm(uu,s,hh);return[p[0]+N.x*.032,p[1]+N.y*.032,p[2]+N.z*.032];},12,10,(u,v)=>[u*1.8,v*1.4]);
   rsPut(B,'paktong',shG,null,null,null,PAK);
   return H;
  });
 };
 // 1. Central Command & Moon-Pool Ark (z = +-3.2 m, L = 33.8 m)
 const hCen=makeCatHulls(33.8,2.25,1.46,1.22,-3.2,3.2);
 const yBeam=hCen[1].ys(.5)+.18,hBeam=.28,yBeamTop=yBeam+hBeam/2;
 const thDeck=.08,yDeckMid=yBeamTop+.006+thDeck/2,yD=yBeamTop+.006+thDeck;
 for(const x of[-11.8,-8.8,-5.8,-2.55,2.55,5.8,8.8,11.8]){
  rsBox(B,'wood',[.3,hBeam,8.5],[x,yBeam,0],null,BEAM,2);
  for(const z0 of[-3.2,3.2])rsBox(B,'paktong',[.36,hBeam+.04,.42],[x,yBeam,z0],null,PAKD,1);
 }
 for(const s of[-1,1])rsBox(B,'wood',[.3,hBeam,2.35],[0,yBeam,s*3.08],null,BEAM,2);
 // Central Ark deck planks round a 4.4 x 3.2 m Moon-Pool (x in [-2.2, 2.2], z in [-1.6, 1.6])
 for(let i=0;i<15;i++){
  const xf=lerp(2.5,11.9,i/14),xa=lerp(-11.9,-2.5,i/14);
  rsBox(B,'wood',[.54,thDeck,6.2],[xf,yDeckMid,0],null,DECK,2);
  rsBox(B,'wood',[.54,thDeck,6.2],[xa,yDeckMid,0],null,DECK,2);
 }
 for(let i=0;i<7;i++){const xm=lerp(-1.95,1.95,i/6);for(const s of[-1,1])rsBox(B,'wood',[.52,thDeck,1.34],[xm,yDeckMid,s*2.43],null,DECK,2);}
 // Central Moon-Pool butt-joined coaming, rails & submerged Paktong dive ladder
 const hCoam=.38,yCoam=yD+.006+hCoam/2;
 for(const sx of[-1,1])rsBox(B,'tarwood',[.2,hCoam,3.6],[sx*2.3,yCoam,0],null,CYPD,1.5);
 for(const sz of[-1,1]){
  rsBox(B,'tarwood',[4.38,hCoam,.2],[0,yCoam,sz*1.7],null,CYPD,1.5);
  for(const x of[-2.3,0,2.3])rsLink(B,'paktong',[x,yD+hCoam+.02,sz*1.7],[x,yD+hCoam+.64,sz*1.7],.032,PAK,5);
  rsLink(B,'paktong',[-2.3,yD+hCoam+.64,sz*1.7],[2.3,yD+hCoam+.64,sz*1.7],.032,PAK,5);
 }
 for(const xl of[-.35,.35])rsLink(B,'paktong',[xl,yD+hCoam+.35,1.52],[xl,-1.55,1.52],.028,PAK,5);
 for(let r=0;r<9;r++){const yr=lerp(-1.42,yD+hCoam+.2,r/8);rsLink(B,'paktong',[-.34,yr,1.52],[.34,yr,1.52],.02,PAK,5);}
 // Central Command Pavilion aft (x = -7.6, z = 0) + Bow P-Wave Tsunami Gong (x = 10.6, z = 0)
 arkHouse(-7.6,yD+.008,0,5.6,3.9,2.1,3);
 {const gx=10.6,gy=yD+.008;
  for(const sz of[-1,1]){
   rsBox(B,'paktong',[.38,.12,.38],[gx,gy+.06,sz*1.05],null,PAKD,1);
   rsLink(B,'tarwood',[gx,gy+.12,sz*1.05],[gx+.12,gy+2.25,sz*.88],.095,CYP,6,.075);
   rsLink(B,'tarwood',[gx-.58,gy+.04,sz*1.05],[gx+.06,gy+1.65,sz*.92],.055,CYPD,5);
   rsLink(B,'paktong',[gx+.1,gy+1.82,sz*.91],[gx+.12,gy+2.25,sz*.48],.038,PAK,5);
  }
  rsBox(B,'paktong',[.26,.18,2.42],[gx+.12,gy+2.34,0],null,PAK,1);
  rsCyl(B,'bronze',.54,.54,.08,[gx+.12,gy+1.28,0],[0,0,Math.PI/2],BRZ,20);
  rsSphere(B,'bronze',.15,[gx+.18,gy+1.28,0],[.55,1,1],rsLin(0xdca844),8,6);
 }
 // 2. Starboard Dwelling/Drying Catamaran (z = +8.5, +13.1 m -> center +10.8 m) & Port Workshop Catamaran (z = -8.5, -13.1 m -> center -10.8 m)
 for(const side of[-1,1]){
  const zc=side*10.8;
  makeCatHulls(27.6,1.95,1.36,1.08,zc-2.3,zc+2.3);
  for(let i=0;i<7;i++){
   const x=lerp(-9.6,9.6,i/6);
   rsBox(B,'wood',[.28,hBeam,6.4],[x,yBeam,zc],null,BEAM,2);
   for(const dz of[-2.3,2.3])rsBox(B,'paktong',[.34,hBeam+.04,.38],[x,yBeam,zc+dz],null,PAKD,1);
  }
  for(let i=0;i<26;i++){
   const xp=lerp(-9.5,9.5,i/25);
   rsBox(B,'wood',[.54,thDeck,4.7],[xp,yDeckMid,zc],null,new THREE.Color(DECK).offsetHSL(0,0,rr(-.02,.02)),2);
  }
  // Outer nephrite coupling sockets ready for the next ward unit (z = side * 14.15 m)
  for(const xh of[-6.4,0,6.4]){
   const zo=side*14.12;
   rsBox(B,'paktong',[.42,.3,.3],[xh,yBeam,zo-side*.12],null,PAKD,1);
   rsPut(B,'jade',rsUV(new THREE.TorusGeometry(.27,.085,7,14,Math.PI*1.3),1),[xh,yBeam,zo+side*.14],[0,side>0?-Math.PI/2:Math.PI/2,0],null,JADE);
   rsSphere(B,'jade',.19,[xh,yBeam,zo+side*.18],null,JADEL,10,8);
  }
  if(side>0){
   // Starboard: family dwelling house aft + forward kelp/fish drying racks & fresh-water barrel cisterns
   arkHouse(-5.4,yD+.008,zc,4.8,3.2,1.88,2);
   for(const dx of[2.2,4.8]){
    for(const dz of[-1.35,1.35])rsLink(B,'wood',[dx,yD+.02,zc+dz],[dx,yD+1.82,zc+dz],.055,CYP,5);
    rsLink(B,'wood',[dx,yD+1.78,zc-1.45],[dx,yD+1.78,zc+1.45],.05,CYP,5);
   }
   for(const dz of[-.95,0,.95]){
    rsLink(B,'wood',[2.1,yD+1.72,zc+dz],[4.9,yD+1.72,zc+dz],.038,DECK,5);
    // Hung kelp/drying strips in textured cloth
    for(let k=0;k<4;k++)rsBox(B,'cloth',[.46,.72,.03],[2.55+k*.66,yD+1.28,zc+dz],null,k%2?rsLin(0x3b5838):rsLin(0x9a5c3c),1);
   }
   for(let c=0;c<3;c++)rsCyl(B,'wood',.28,.31,.72,[-1.4+c*.72,yD+.368,zc+1.35],null,CYP,10);
  }else{
   // Port: boatwright & ropewalk workshop shelter forward + Paktong sheet bench & stacked cordage coils aft
   arkHouse(3.8,yD+.008,zc,4.8,3.2,1.88,2);
   rsBox(B,'wood',[2.4,.74,.92],[-1.8,yD+.378,zc-.95],null,BEAM,1.5);
   rsBox(B,'paktong',[1.6,.05,.68],[-1.8,yD+.78,zc-.95],null,PAK,1);
   for(let k=0;k<3;k++)rsPut(B,'rope',rsUV(new THREE.TorusGeometry(.38,.09,8,14),1),[7.2,yD+.1+k*.16,zc+.95],[Math.PI/2,0,0],null,ROPE);
  }
 }
 // 3. Six Sawn Green-Nephrite Ball-and-Socket Hinge-Bridges coupling the 3 catamarans into a walkable Floating Village Street!
 // Spans gap z in [3.2, 8.5] and [-8.5, -3.2] at x = -4.2, +0.4, +6.6 (walkable gangways at x = -4.2 and +6.6!)
 for(const side of[-1,1])for(const [xb,isBridge] of[[-4.2,true],[.4,false],[6.6,true]]){
  const zIn=side*4.32,zMid=side*6.35,zOut=side*8.38;
  // Twin heavy sawn-nephrite ball-and-socket articulator joints at both ends of the cross-link
  for(const zj of[zIn+.45*side,zOut-.45*side]){
   rsBox(B,'paktong',[.62,.36,.48],[xb,yBeam,zj-Math.sign(zj-zMid)*.24],null,PAKD,1);
   rsPut(B,'jade',rsUV(new THREE.TorusGeometry(.38,.12,8,16,Math.PI*1.4),1),[xb,yBeam,zj],[0,zj<zMid?-Math.PI/2:Math.PI/2,0],null,JADE);
   rsSphere(B,'jade',.27,[xb,yBeam,zj],null,JADEL,12,10);
   rsCyl(B,'paktong',.06,.06,.78,[xb,yBeam,zj],null,PAK,8);
  }
  // Articulated cypress & Paktong spreader strut between the two nephrite balls
  rsBox(B,'paktong',[.38,.26,2.8],[xb,yBeam,zMid],null,PAKD,1.5);
  if(isBridge){
   // Walkable 1.9 m wide railed village-street gangway planked at yD + 0.012 m (step < 0.65 m: seamless walking across all 3 hulls!)
   for(const ox of[-.82,.82])rsBox(B,'wood',[.16,.2,5.1],[xb+ox,yD-.09,zMid],null,BEAM,2);
   for(let p=0;p<9;p++){
    const zp=lerp(side*3.38,side*8.32,p/8);
    rsBox(B,'wood',[1.84,.075,.48],[xb,yD+.048,zp],null,DECK,1.5);
   }
   for(const ox of[-.88,.88]){
    for(const zp of[side*3.55,zMid,side*8.15])rsLink(B,'paktong',[xb+ox,yD+.09,zp],[xb+ox,yD+.92,zp],.03,PAK,5);
    rsRope(B,[xb+ox,yD+.88,side*3.55],[xb+ox,yD+.88,side*8.15],.022,ROPE);
   }
  }
 }
 // 4. Cyclopean Alternating Paktong-Link and Carved-Nephrite-Ring Trench Mooring Chain at the Bow!
 // Bridle chains from all 3 catamarans meet at a great nephrite-and-Paktong bow yoke (x = 16.4, y = 1.48, z = 0), plunging into the trench!
 {const yk=[16.4,1.48,0];
  // Bow mooring bitts + heavy Paktong & nephrite stem-hawse fairlead bolster across the central bows
  rsBox(B,'paktong',[.68,.54,.88],[11.6,yD+.28,0],null,PAKD,1);
  rsBox(B,'tarwood',[.36,.28,6.9],[13.6,hCen[1].ys(.88)+.18,0],null,BEAM,2);
  for(const sz of[-3.2,0,3.2]){
   rsBox(B,'paktong',[.52,.36,.52],[13.6,hCen[1].ys(.88)+.2,sz],null,PAK,1);
   rsPut(B,'jade',rsUV(new THREE.TorusGeometry(.22,.065,7,14),1),[13.88,hCen[1].ys(.88)+.24,sz],[0,Math.PI/2,0],null,JADE);
  }
  for(const side of[-1,1]){
   rsBox(B,'paktong',[.52,.44,.64],[9.1,yD+.23,side*10.8],null,PAKD,1);
   // Heavy Paktong bridle cables converging through the fairlead into the sculpted bow yoke manifold
   rsTube(B,'paktong',[[9.1,yD+.38,side*10.8],[13.6,hCen[1].ys(.88)+.24,side*3.2],[15.88,1.48,side*.36]],.075,PAKD,18,8);
  }
  rsTube(B,'paktong',[[11.8,yD+.38,0],[13.88,hCen[1].ys(.88)+.24,0],[15.88,1.48,0]],.095,PAK,14,8);
  // Sculpted Paktong & sawn-nephrite 3-cable yoke collar clasping all 3 bridles into the master trench ring
  rsBox(B,'paktong',[.46,.34,1.08],[15.92,1.48,0],null,PAK,1);
  rsCyl(B,'jade',.24,.28,.38,[16.18,1.48,0],[0,0,Math.PI/2],JADEL,12);
  // Master cyclopean carved emerald-nephrite bridal ring at the bow yoke
  rsPut(B,'jade',rsUV(new THREE.TorusGeometry(.56,.16,10,22),1.2),yk,[Math.PI/2,.25,0],null,JADE);
  // Alternating Paktong-link and carved-nephrite-ring trench chain plunging from (16.6, 1.35, 0) down to (19.1, -2.05, 0)
  const nLinks=9;
  for(let i=0;i<nLinks;i++){
   const f=i/(nLinks-1),lx=lerp(16.72,19.05,f),ly=lerp(1.22,-2.05,Math.pow(f,.88));
   if(i%2===0){
    // Elongated gleaming Paktong link (rotated in vertical plane)
    rsPut(B,'paktong',rsUV(new THREE.TorusGeometry(.36,.095,8,16),1),[lx,ly,0],[0,.15,-.85],[1.35,.82,1],PAK);
   }else{
    // Thick carved sawn emerald-nephrite torus ring (rotated 90 deg so links interlock with zero coplanar contact!)
    rsPut(B,'jade',rsUV(new THREE.TorusGeometry(.38,.115,9,18),1),[lx,ly,0],[Math.PI/2,-.85,0],null,JADEL);
   }
  }
  // Foam ring where the cyclopean trench chain pierces the sea surface around x = 17.85
  const cg=rsGrid((a,v)=>{const ang=a*TAU,rr0=.42+v*.48;return[17.85+Math.cos(ang)*rr0,.04,Math.sin(ang)*rr0];},16,1,(a,v)=>[a*4,v]);
  rsPut(B,'foamT',cg,null,null,null,0xffffff);
 }
 // 5. Sails: Central Ark main crab-claw forward (x = 5.4, z = 0) + Port/Starboard flank steadying claws aft (clear of all houses & rigs!)
 const wardRig=(mx,mz,mh,wClaw,gain)=>{
  const foot=[mx,yD-.05,mz],head=[mx+.85,yD+mh*.62,mz];
  rsBox(B,'paktong',[.52,.34,.52],[mx,yD+.18,mz],null,PAKD,1);
  rsLink(B,'wood',foot,head,.155,CYP,8,.1);
  rsRig(B,[foot,head],{gain});
  const S=rsSail(B,{key:'ark-ward-claw',O:[mx+3.6,yD+.48,mz],U:[-1,0,0],V:[0,1,0],belly:mz>=0?.82:-.82,nu:20,nv:12,
   A:t=>[t*wClaw*.72+Math.sin(Math.PI*t)*.8,t*mh],
   Bf:t=>[t*wClaw,t*mh*.3+Math.sin(Math.PI*t)*.68],draw:rsArkWardClaw});
  rsSailEdge(B,S,0,.095,CYP,0,1.03,'wood');
  rsSailEdge(B,S,1,.085,CYP,0,1.02,'wood');
  rsRope(B,[head[0],head[1]-.08,mz],S.at(.38,0),.028,ROPE);
  rsRope(B,S.at(.8,1),[mx-wClaw*.56,yD+.42,mz+(mz>=0?.85:-.85)],.024,ROPE);
  rsPennant(B,S.at(1.03,0),2.4,.24,[JADEL,PAK,rsLin(0x7f281a)]);
  rsRigEnd(B);
 };
 wardRig(5.4,0,16.2,8.6,.4);
 wardRig(4.2,10.8,11.6,6.4,.38);
 wardRig(-4.8,-10.8,11.6,6.4,.38);
 // Village residents & divers strolling across the three catamarans and nephrite hinge-bridges
 for(const [px,pz,yaw,col] of[[6.6,5.8,Math.PI/2,JADE],[-4.2,-5.8,-Math.PI/2,rsLin(0x842b1c)],[0,2.5,Math.PI,PAKD],[8.8,-1.2,0,JADEL],[-1.2,10.8,.5,rsLin(0x842b1c)],[-2.6,-10.2,-.3,JADE],[6.8,10.4,Math.PI,PAKD],[-10.8,0,Math.PI,JADEL]])
  rsFigure(B,[px,yD+(Math.abs(pz)>3.3&&Math.abs(pz)<8.3?.085:0),pz],yaw,col,false,0x6e4c36);
 // Stern steering sweeps on the central ark
 for(const s of[-1,1]){
  rsLink(B,'wood',[-13.4,hCen[1].ys(.08)+.32,s*3.55],[-17.8,-1.2,s*3.95],.105,CYP,6);
  rsBox(B,'paktong',[2.0,.82,.08],[-17.3,-.92,s*3.9],[0,0,.62],PAKD,1);
 }
 rsBake(B,V.group,'arkChainedWard');V.deckY=yD;return V;
}
RS_VESSEL({key:'arkChainedWard',name:'cFlīt-qBōn Coupled 3-Hull Chained Ark-Ward',culture:'cflit-qbon',L:40,B:32,H:20,
 tags:{type:['floating village','ark-ward','catamaran formation','dwelling'],propulsion:['sail','sweeps'],hull:'catamaran',wealth:'state',crew:110,role:'coupled three-catamaran pelagic village ward moored over 80-150 m fault trenches'},
 blurb:'Three modular twin-hulled catamarans coupled side-by-side via sawn green-nephrite ball-and-socket hinge-bridges into a floating village street, moored by a cyclopean Paktong and nephrite-ring trench chain.',build:buildRsArkChainedWard});
