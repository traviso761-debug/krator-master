// prefix: zk
// ================================================================= SACRED (PLAN.md 6.4): the kiva and the funeral catacombs
// Their void plans are their interiors items (kits/interiors/sets/zeijani.js); drawn here: what stands at the ground or on the
// face, the ladder, the murals and friezes, the corridors' bones. The kiva is SUNK (no rock block: the cavern carves under the
// sheet's ground; `sunk` opens the ground over it in the cut-away).

/* the kiva: a frame of logs round the hatch, the ladder leaning out of it over the hearth (along its walk strip), a stone kerb
   round the ventilator's shaft, the murals on the back wall over the altar */
defBuilding({key:'zj_kiva',name:'Kiva',seed:4801,sunk:true,
 tags:{types:['religious'],wealth:'middle',style:'carved',rock:'tuff',finish:'plaster'},w:10,d:10,h:5.5,
 note:'sunk 3.6 m under an earth roof: down the ladder through the hatch; the bench terrace, the altar under the murals, the hearth, deflector, ventilator and sipapu, the great incense burner where Ranj is burned',
 build(o){const it=zjItem('zj_kiva');cvFromItem(it,{finish:'plaster'});zfFixtures(it);zkKivaDress(0,0,0);door(0,0,-1.0,PI,.8);}});
/* a kiva's dressing at its hatch (cx, cz) sunk in a floor at y0 (the plan: kivaPlan in the interiors set) */
function zkKivaDress(cx,cz,y0){const wd=P('woodD'),c=P('white'),Y=y0-3.6;
  for(const s of [-1,1]){box('log',cx,y0,cz+s*1.0,2.2,.18,.2,wd);box('log',cx+s*1.0,y0,cz,.2,.18,1.8,wd);}
  const A=[0,Y,.6],B=[0,y0+1.3,-1.51];for(const s of [-1,1])beam('log',[cx+s*.28,A[1],cz+A[2]],[cx+s*.28,B[1],cz+B[2]],.06,wd,true,6);
  for(let i=1;i<15;i++){const t=i/15;box('log',cx,A[1]+t*(B[1]-A[1]),cz+A[2]+t*(B[2]-A[2]),.62,.05,.06,wd);}
  zfRingWall('ashlar',cx,cz+3.9,.32,.52,y0,y0+.45,P('tuffDark'));
  box('plaster',cx,Y+1.15,cz-2.62,2.2,1.0,.12,P('plaster'));zfBand('patMural',cx,Y+1.2,cz-2.555,2.0,.9,0,c);}

/* the lattice shrine (in the open, where the pierced stone shows the sky through it: the outpost's, beside its kiva): an
   octagonal pavilion on a stepped podium, eight slim columns, pierced screens between them but at the front, a cornice and a
   small dome, an altar with a lamp and the spirits' staffs inside, lit at night */
defBuilding({key:'zj_shrine',name:'Lattice shrine',seed:4804,cut:true,tags:{types:['religious'],wealth:'middle',style:'constructed',rock:'tuff'},w:8,d:8,h:7.6,
 build(o){const c=P('white'),oct=r=>[0,1,2,3,4,5,6,7].map(k=>{const a=(22.5+45*k)*PI/180;return [r*Math.cos(a),r*Math.sin(a)];});
  prism('ashlar',oct(3.9),0,.3,P('tuffDark'));prism('tuffPol',oct(3.5),.3,.6,c);zfSteps('tuffPol',0,.6,3.45,1.6,2,c,.15,.3);
  const R=3.05,col=k=>{const a=(22.5+45*k)*PI/180;return [R*Math.cos(a),R*Math.sin(a)];};
  for(let k=0;k<8;k++){const p=col(k);zfColumn('tuffPol',p[0],.6,p[1],.13,3.1,c);}
  /* the screens: a lattice panel in each bay but the front (the bay facing +z), on a low sill, under a lintel */
  for(let k=0;k<8;k++){const a0=col(k),a1=col((k+1)%8),mx=(a0[0]+a1[0])/2,mz=(a0[1]+a1[1])/2,L=Math.hypot(a1[0]-a0[0],a1[1]-a0[1])-.3,ry=Math.atan2(a1[0]-a0[0],a1[1]-a0[1]);
   box('tuffPol',mx,3.45,mz,.24,.26,L+.3,c,ry);if(mz>2.5)continue;box('tuffPol',mx,.6,mz,.2,.35,L,c,ry);box('jali',mx,.95,mz,.06,2.5,L,c,ry);}
  prism('tuffPol',oct(3.4),3.7,3.95,c);zfDome('tuffPol',0,3.95,0,2.9,2.2,c,{seg:24,rows:8});lathe('tuffPol',0,0,[[.35,6.1],[.5,6.25],[.2,6.6]],12,c);cone('copper',0,6.6,0,.12,.9,P('copper'),8);
  box('tuffPol',0,.6,-1.2,1.2,.9,.7,c);FURNISH('zeijani_censer',0,1.5,-1.2,0,{setting:'outdoor'});sph('glow',.45,1.62,-1.2,.09,P('flame'),1,8);haloAt(0,2.2,-1.2,0xffb04a,true);
  FURNISH('zeijani_staff_stand',-1.6,.6,-.9,.6,{setting:'outdoor'});door(0,.6,3.3,0,1.6);}});

/* the catacombs: a round-headed portal under a frieze of the dead, funerary lamps either side; inside, the loculi corridors
   lined with bones (panels of the ossuary sheet on both walls) and the chapel's frieze over its altar */
defBuilding({key:'zj_catacomb',name:'Funeral catacombs',seed:4802,originFront:true,
 tags:{types:['funerary','religious'],wealth:'middle',style:'carved',rock:'tuff',finish:'hewn'},w:32,d:24,h:12,
 note:'down 4.5 m to the mortuary chapel; loculi corridors lined with bones to an ossuary chamber at each end; the Keeper\'s cell',
 build(o){const it=zjItem('zj_catacomb');cvFromItem(it,{finish:'hewn'});zfFixtures(it);const c=P('white'),Y=-4.5;
  zfArch('tuffHewn',0,0,.02,1.5,2.5,.42,c,{key:true,keyMk:'basaltPol'});box('tuffHewn',0,0,.29,2.1,.12,.5,c);
  box('tuffPol',0,3.0,.08,4.2,.8,.24,c);zfBand('patSkel',0,3.05,.21,4.0,.7,0,c);
  for(const s of [-1,1]){zfNiche(s*1.7,1.4,.02,.34,.44);FURNISH('zeijani_funerary_lamp',s*1.7,1.4,.05,0,{setting:'outdoor'});}
  /* (the west corridor's south wall stops either side of the Keeper's doorway, x -6.4) */
  const bones=(x0,x1,z)=>box('ossuary',(x0+x1)/2,Y+.25,z,Math.abs(x1-x0),1.9,.06,c);
  for(const s of [-1,1])bones(s*3.3,s*10.2,-11.4);bones(3.3,10.2,-12.6);bones(-3.3,-5.75,-12.6);bones(-7.05,-10.2,-12.6);
  box('plaster',0,Y+1.45,-14.66,2.4,.9,.12,P('plaster'));zfBand('patSkel',0,Y+1.5,-14.595,2.2,.8,0,c);
  door(0,0,0,0,1.4);}});

/* the temple (Kailasa): the gateway's tiers on the face; in the pit the lamp pillars (columns over the rock left standing, a
   lamp on each), the podium's base moulding, friezes of the spirits and cornice round its four faces, the corner shrines'
   domes, the drum's cornice and the pierced lattice dome over the open sanctum, lit from inside */
/* the sky dome: a hemisphere painted with the heavens over the Throne (the sun, the ringed gas giant, its moons, the stars) on both
   faces, a little self-lit so the sanctum's lamps are not all it has. The painting is the owner's (`patSkyDome`, the library's
   patterns/zeijani/sky-dome: wrapping round, its gilt band the rim); the canvas below is the procedural fallback (?mat=proc); spherical UVs: u round the sky, v from the rim (0) to the zenith (1) */
const ZK_SKY=(function(){const L=KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('zeijani','patSkyDome'):null,T=L?KMAT.textures(L,{aniso:8}).map:canvasTex(2048,1024,(g,w,h)=>{
 const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#0b1030');sky.addColorStop(.55,'#1d2a66');sky.addColorStop(.86,'#3d4f8c');sky.addColorStop(1,'#6a5a7a');g.fillStyle=sky;g.fillRect(0,0,w,h);
 let s=7;const R=()=>{s=(s*16807)%2147483647;return s/2147483647;};
 for(let i=0;i<900;i++){const x=R()*w,y=R()*h*.85,r=R()<.06?2.4:R()*1.3+.3;g.fillStyle='rgba(255,'+(230+R()*25|0)+','+(190+R()*60|0)+','+(.5+R()*.5)+')';g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
 /* the sun: a gold disc and its rays */
 const sx=w*.16,sy=h*.5;g.strokeStyle='#ffcc55';g.lineWidth=6;for(let i=0;i<24;i++){const a=i*TAU/24;g.beginPath();g.moveTo(sx+Math.cos(a)*70,sy+Math.sin(a)*70);g.lineTo(sx+Math.cos(a)*(i%2?110:140),sy+Math.sin(a)*(i%2?110:140));g.stroke();}
 const sg=g.createRadialGradient(sx,sy,0,sx,sy,66);sg.addColorStop(0,'#fff6c8');sg.addColorStop(1,'#f0a830');g.fillStyle=sg;g.beginPath();g.arc(sx,sy,64,0,TAU);g.fill();
 /* the gas giant: banded, a ring before and behind it */
 const gx=w*.6,gy=h*.46,gr=150;const ring=(front)=>{g.save();g.translate(gx,gy);g.rotate(-.35);g.strokeStyle='rgba(230,200,150,.85)';g.lineWidth=14;g.beginPath();g.ellipse(0,0,gr*1.75,gr*.38,0,front?0:PI,front?PI:TAU);g.stroke();g.restore();};
 ring(false);g.save();g.beginPath();g.arc(gx,gy,gr,0,TAU);g.clip();const cols=['#c98a4e','#e8c08a','#a8603a','#f0d8a8','#b87848','#d8a870','#8a4a30'];
 for(let i=0;i<14;i++){g.fillStyle=cols[i%cols.length];g.fillRect(gx-gr,gy-gr+i*gr*2/14,gr*2,gr*2/14+1);}
 const sh=g.createRadialGradient(gx-gr*.4,gy-gr*.4,gr*.2,gx,gy,gr*1.1);sh.addColorStop(0,'rgba(255,255,255,.12)');sh.addColorStop(1,'rgba(0,0,20,.55)');g.fillStyle=sh;g.fillRect(gx-gr,gy-gr,gr*2,gr*2);g.restore();ring(true);
 /* the moons */
 for(const [u,v,r,cA,cB] of [[.42,.3,26,'#e8e4dc','#8a8478'],[.82,.42,34,'#d8c8b0','#6a5a48'],[.9,.66,18,'#c8d8e8','#58687a'],[.33,.64,14,'#f0d0b8','#806050']]){
  const mg=g.createRadialGradient(w*u-r*.3,h*v-r*.3,1,w*u,h*v,r);mg.addColorStop(0,cA);mg.addColorStop(1,cB);g.fillStyle=mg;g.beginPath();g.arc(w*u,h*v,r,0,TAU);g.fill();}
 /* a gilt band at the rim (the bottom of the sheet) */
 g.fillStyle='#b8862e';g.fillRect(0,h*.93,w,h*.07);g.fillStyle='#e8c060';for(let x=0;x<w;x+=64){g.beginPath();g.moveTo(x,h*.93);g.lineTo(x+32,h*.965);g.lineTo(x+64,h*.93);g.fill();}});
 T.wrapS=THREE.RepeatWrapping;T.wrapT=THREE.ClampToEdgeWrapping;T.encoding=THREE.sRGBEncoding;T.anisotropy=8;
 const m=new THREE.MeshStandardMaterial({map:T,emissive:0xffffff,emissiveMap:T,emissiveIntensity:.35,roughness:.55,metalness:.05,side:THREE.DoubleSide});MAT.skyDome=m;TILE.skyDome=1;
 return {geo:new THREE.SphereGeometry(1,48,16,0,TAU,0,PI/2)};})();
function zkSkyDome(x,y,z,r,h){const m=TF(x,y,z,0);m.scale(new THREE.Vector3(r,h,r));emit('skyDome',ZK_SKY.geo,m,WHITE,{su:1,sv:1});}
function zkBand(mk,x0,x1,z,y,h,ry,c){/* a frieze on a face at z (local, facing ry): a backing slab straddling the face and the sheet on it */
 const w=Math.abs(x1-x0),cx=(x0+x1)/2;W(0,0,0,ry,()=>{box('tuffPol',cx,y-.05,z,w+.1,h+.1,.16,c);zfBand(mk,cx,y,z+.085,w,h,0,c);});}
defBuilding({key:'zj_temple',name:'The temple: cut from one rock',seed:4803,originFront:true,
 tags:{types:['religious'],wealth:'rich',style:'carved',rock:'tuff',finish:'polished'},w:48,d:52,h:22,
 note:'a gateway into a pit cut from the top of the rock; the podium left standing with its stair, the sanctum under a pierced lattice dome lit from inside, four shrines, two lamp pillars, cloisters in the pit\'s walls',
 build(o){const it=zjItem('zj_temple');cvFromItem(it,{finish:'polished'});zfFixtures(it);const c=P('white');
  /* the gateway: jambs inside the cut, a stepped lintel, three receding tiers with friezes, a crown and a finial */
  for(const s of [-1,1])box('tuffPol',s*1.92,0,.12,.32,4.9,.42,c);zfStepLintel('tuffPol',0,4.9,.14,4.0,c,{n:3,h:.35,d:.42});
  box('tuffPol',0,6.0,.15,6.4,1.2,.5,c);zfBand('patFriezeB',0,6.1,.405,6.0,1.0,0,c);
  box('tuffPol',0,7.2,.1,5.0,1.1,.4,c);zfBand('patFriezeC',0,7.28,.305,4.6,.9,0,c);
  box('tuffPol',0,8.3,.05,3.4,1.0,.3,c);zfStepLintel('tuffPol',0,9.3,.05,2.0,c,{n:3,h:.3,d:.3});cone('copper',0,10.2,.05,.25,.8,P('copper'),10);
  for(const s of [-1,1]){zfNiche(s*3.3,1.3,.02,.42,.54);FURNISH('zeijani_glow_basin',s*3.0,0,1.1,0,{setting:'outdoor'});}
  /* the lamp pillars */
  for(const x of [-11,11]){zfColumn('tuffPol',x,0,-12,.68,12,c);cyl('copper',x,12,-12,.55,.25,P('copper'),12);sph('glow',x,12.35,-12,.32,P('flame'),1,12);haloAt(x,12.4,-12,0xffb04a,true);}
  /* the podium: a base moulding, the friezes on its four faces (split by the stair's slot at the front), the cornice */
  for(const [x0,x1,z,ry] of [[-9,-1.6,-16,0],[1.6,9,-16,0]]){box('tuffPol',(x0+x1)/2,0,z+.05,x1-x0,.45,.5,c);zkBand('patFriezeB',x0+.3,x1-.3,z,1.2,1.5,ry,c);box('tuffPol',(x0+x1)/2,5.5,z+.1,x1-x0+.3,.45,.6,c);}
  for(const [cx,cz,L,ry] of [[0,-40,18,PI],[-9,-28,24,-PI/2],[9,-28,24,PI/2]]){W(cx,0,cz,ry,()=>{box('tuffPol',0,0,.05,L,.45,.5,c);box('tuffPol',0,5.5,.1,L+.3,.45,.6,c);zkBand('patFrieze',-L/2+.4,L/2-.4,0,1.2,1.5,0,c);});}
  /* the shrines' domes and finials */
  for(const [x,z] of [[-6.6,-19],[6.6,-19],[-6.6,-37],[6.6,-37]]){lathe('tuffPol',x,z,[[1.55,8.85],[1.8,8.95],[1.8,9.1],[1.6,9.15]],20,c);zfDome('tuffPol',x,9.1,z,1.7,1.3,c,{seg:20,rows:7});cone('copper',x,10.4,z,.14,.5,P('copper'),8);}
  /* the drum's cornice, the sky dome on it (the heavens painted inside and out: underground, a pierced dome showed only rock),
     the light inside, the finial */
  lathe('tuffPol',0,-30,[[6.15,10.75],[6.55,10.9],[6.55,11.1],[6.2,11.2]],40,c);
  zkSkyDome(0,11.2,-30,6.2,5.2);
  cyl('copper',0,16.3,-30,.3,.4,P('copper'),12);cone('copper',0,16.7,-30,.3,1.1,P('copper'),12);
  sph('glow',0,9.2,-30,.55,P('flame'),1,16);haloAt(0,9.2,-30,0xffb04a,true);for(let i=0;i<6;i++){const a=i*TAU/6;sph('glow',Math.cos(a)*3.2,8.6,-30+Math.sin(a)*3.2,.18,P('flame'),1,10);}
  zkKivaDress(13.2,-28,0);   /* the kiva in the pit's east side (its plan: the temple's item) */
  door(0,0,0,0,3.6);}});
