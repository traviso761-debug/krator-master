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
  const A=[0,Y,.5],B=[0,1.3,-1.41];for(const s of [-1,1])beam('log',[s*.28,A[1],A[2]],[s*.28,B[1],B[2]],.06,wd,true,6);
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
