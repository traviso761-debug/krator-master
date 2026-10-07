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
 build(o){const it=zjItem('zj_kiva');cvFromItem(it,{finish:'plaster'});zfFixtures(it);const wd=P('woodD'),c=P('white'),Y=-3.6;
  for(const s of [-1,1]){box('log',0,0,s*1.0,2.2,.18,.2,wd);box('log',s*1.0,0,0,.2,.18,1.8,wd);}
  const A=[0,Y,.6],B=[0,1.3,-1.51];for(const s of [-1,1])beam('log',[s*.28,A[1],A[2]],[s*.28,B[1],B[2]],.06,wd,true,6);
  for(let i=1;i<15;i++){const t=i/15;box('log',0,A[1]+t*(B[1]-A[1]),A[2]+t*(B[2]-A[2]),.62,.05,.06,wd);}
  zfRingWall('ashlar',0,3.9,.32,.52,0,.45,P('tuffDark'));
  box('plaster',0,Y+1.15,-2.62,2.2,1.0,.12,P('plaster'));zfBand('patMural',0,Y+1.2,-2.555,2.0,.9,0,c);
  door(0,0,-1.0,PI,.8);}});

/* the catacombs: a round-headed portal under a frieze of the dead, funerary lamps either side; inside, the loculi corridors
   lined with bones (panels of the ossuary sheet on both walls) and the chapel's frieze over its altar */
defBuilding({key:'zj_catacomb',name:'Funeral catacombs',seed:4802,originFront:true,
 tags:{types:['funerary','religious'],wealth:'middle',style:'carved',rock:'tuff',finish:'hewn'},w:32,d:24,h:12,
 note:'down 4.5 m to the mortuary chapel; loculi corridors lined with bones to an ossuary chamber at each end; the Keeper\'s cell',
 build(o){const it=zjItem('zj_catacomb');cvFromItem(it,{finish:'hewn'});zfFixtures(it);const c=P('white'),Y=-4.5;
  zfArch('tuffHewn',0,0,.02,1.5,2.5,.42,c,{key:true,keyMk:'basaltPol'});box('tuffHewn',0,0,.29,2.1,.12,.5,c);
  box('tuffPol',0,3.0,.08,4.2,.8,.24,c);zfBand('patSkel',0,3.05,.21,4.0,.7,0,c);
  for(const s of [-1,1]){zfNiche(s*1.7,1.4,.02,.34,.44);FURNISH('zeijani_funerary_lamp',s*1.7,1.4,.05,0,{setting:'outdoor'});}
  for(const s of [-1,1])for(const zs of [-1,1]){const x0=s*3.3,x1=s*10.2;box('ossuary',(x0+x1)/2,Y+.25,-12+zs*.6,Math.abs(x1-x0),1.9,.06,c);}
  box('plaster',0,Y+1.45,-14.66,2.4,.9,.12,P('plaster'));zfBand('patSkel',0,Y+1.5,-14.595,2.2,.8,0,c);
  door(0,0,0,0,1.4);}});

/* the temple (Kailasa): the gateway's tiers on the face; in the pit the lamp pillars (columns over the rock left standing, a
   lamp on each), the podium's base moulding, friezes of the spirits and cornice round its four faces, the corner shrines'
   domes, the drum's cornice and the pierced lattice dome over the open sanctum, lit from inside */
function zkBand(mk,x0,x1,z,y,h,ry,c){/* a frieze on a face at z (local, facing ry): a backing slab straddling the face and the sheet on it */
 const w=Math.abs(x1-x0),cx=(x0+x1)/2;W(0,0,0,ry,()=>{box('tuffPol',cx,y-.05,z,w+.1,h+.1,.16,c);zfBand(mk,cx,y,z+.085,w,h,0,c);});}
defBuilding({key:'zj_temple',name:'The temple: cut from one rock',seed:4803,originFront:true,
 tags:{types:['religious'],wealth:'rich',style:'carved',rock:'tuff',finish:'polished'},w:48,d:52,h:19,
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
  /* the drum's cornice, the lattice dome on it, the light inside, the finial */
  lathe('tuffPol',0,-30,[[6.15,10.75],[6.55,10.9],[6.55,11.1],[6.2,11.2]],40,c);
  zfDome('jali',0,11.2,-30,6.2,5.2,P('white'),{seg:40,rows:12});
  /* the lamplight behind the lattice: a warm unlit shell just inside it, seen only through its holes (from inside, its back faces cull) */
  zfDome('glow',0,11.2,-30,5.95,4.95,0xb8682e,{seg:40,rows:12});
  cyl('copper',0,16.3,-30,.3,.4,P('copper'),12);cone('copper',0,16.7,-30,.3,1.1,P('copper'),12);
  sph('glow',0,9.2,-30,.55,P('flame'),1,16);haloAt(0,9.2,-30,0xffb04a,true);for(let i=0;i<6;i++){const a=i*TAU/6;sph('glow',Math.cos(a)*3.2,8.6,-30+Math.sin(a)*3.2,.18,P('flame'),1,10);}
  door(0,0,0,0,3.6);}});
