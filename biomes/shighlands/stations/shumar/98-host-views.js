// ================================================================= HOST — STATION 4's words, views and checks (read by stations/common/99-host-take.js)
const STATION_TITLE='Shumar, the basalt gorge and dry plateau';
const STATION_HINT='The southern highlands, station 4 (Shumar, 3.1-3.36 km, Dsb, 1.06 atm). Wind-swept whorl-wormwood and bunchgrass bench split by the 235 m stepped ablaq canyon of Qappu-Narun, with fastigiate helix poplars along the river bars, gnarled twist-apricots on the shelves, and rope pines on the rim; every spiral right-handed but the rare mirror tree';
const STATION_SPECIES=['helixpoplar','whorlapricot','ropepine','coiljuniper','aloe','cereus'];
const STATION_PLANTS=['spiralsage','cone','tussock','albuca','fern','daisy','rosette','lichen'];
function STATION_VIEWS(){const Z=SHIGH.zonesM,F=(x,z)=>Z(x,z),L=STATION_LAND;
 const rimPt=bestAt((x,z)=>F(x,z).rim*(1-Math.abs(z)/900),30);
 const barPt=bestAt((x,z)=>F(x,z).terrace*(1-Math.abs(z+80)/700),20);
 const shelfPt=bestAt((x,z)=>F(x,z).shelf*(1-Math.abs(z-160)/800),25);
 const benchPt=bestAt((x,z)=>F(x,z).bench*(1-F(x,z).rock)*(1-Math.hypot(x-380,z+180)/1200),35);
 const MIR=SHIGH.mirrorAt[0]||{x:L.rivX(0)+24,z:0},AS=TOR[0];
 const pop=nearTree('helixpoplar',barPt[0],barPt[1],15);
 const apr=nearTree('whorlapricot',shelfPt[0],shelfPt[1],4.5);
 const pin=nearTree('ropepine',rimPt[0],rimPt[1],9);
 /* Canyon floor by the poplars: ground-level on the gravel bar beside Qappu-Narun looking past the helix poplars and river to the ablaq cliff */
 const fz=pop.z+28,fx=L.rivX(fz)+(pop.x>=L.rivX(pop.z)?16:-16),tz=pop.z-65,tx=L.rivX(tz)+(pop.x>=L.rivX(pop.z)?8:-8);
 /* The basalt gorge: vista from the east canyon lip looking south-west down into Qappu-Narun, the helix poplars and the stepped ablaq wall */
 const gz=-250,G0=L.geom(L.canX(gz)+250,gz),gx=L.canX(gz)+(G0.wf+G0.ww*.92),gtz=175,gtx=L.rivX(gtz)-24;
 return{
  'The basalt gorge':[gx,gh(gx,gz,22),gz,gtx,L.rivLevel(gtz)+24,gtz],
  'Canyon floor by the poplars':[fx,Math.max(gh(fx,fz,2.2),L.rivLevel(fz)+2.6),fz,tx,L.floorY(tz)+18,tz],
  'Twist-apricots on the canyon shelf':atTree(apr,11,1.1,1.9,.55),
  'Whorl-wormwood on the dry bench':across(benchPt[0],benchPt[1],2.05,28,1.5,.4),
  'Rimrock rope pines':atTree(pin,18,.8,2.4,.55),
  'The mirror-handed helix poplar':atTree(nearTree('helixpoplar',MIR.x,MIR.z,0,-1),22,1.35,2.4,.52),
  'The Ablaq Spire':look(AS.x+AS.r*2.3,AS.z+AS.r*1.2,14,AS.x,AS.z,AS.h*.5),
  'The karst tarn':(function(){const x=TARN.x+TARN.r*2.6,z=TARN.z+TARN.r*1.5;return[x,Math.max(gh(x,z,3),TARNL+6),z,TARN.x,TARNL+1,TARN.z];})()
 };}
// Station 4's own checks: riparian helix poplars in the canyon, pines on the rim/shelves, no trees on sheer ablaq cliffs, whorl-wormwood placed
function STATION_CHECKS(add){const T=SHIGH.TREES,Z=SHIGH.zonesM,P=SPI('helixpoplar'),B=window._biome&&window._biome.under||{};
 const onCliff=T.filter(t=>Z(t.x,t.z).cliff>.75);
 add('no tree on a sheer canyon cliff face',{ok:!onCliff.length,detail:onCliff.length?onCliff.length+' trees on cliff risers':T.length+' trees, none on sheer cliffs'});
 const pops=T.filter(t=>t.sp===P),inCan=pops.filter(t=>BIO.field('canyon',t.x,t.z)>.45).length/Math.max(1,pops.length);
 add('helix poplars keep to the canyon floor and seeps',{ok:pops.length>=20&&inCan>.9,detail:pops.length+' helix poplars, '+(inCan*100).toFixed(1)+'% in the gorge'});
 add('whorl-wormwood and bunchgrass sward across the bench',{ok:(B.sage||0)>200&&(B.bunch||0)>400,detail:(B.sage||0)+' whorl-wormwood clumps, '+(B.bunch||0)+' bunchgrass tufts'});}
function STATION_NEGATIVES(add){
 add('a tree in the middle of Qappu-Narun',HCHK.edge([{x:STATION_LAND.rivX(0),z:0,sp:SPI('helixpoplar'),rb:.45}]));
 add('a tree on a sheer canyon cliff',(function(){const Z=SHIGH.zonesM;let found=false;
  for(let z=-600;z<=600&&!found;z+=20)for(let x=-500;x<=500&&!found;x+=10)if(Z(x,z).cliff>.75)found=true;
  return{ok:!found,detail:found?'1 tree on sheer cliff':'no cliff face found'};})());}
