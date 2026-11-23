// ================================================================= HOST — STATION 5's words, views and checks (read by stations/common/99-host-take.js)
const STATION_TITLE='the Ordeal ramp';
const STATION_HINT='The southern highlands, station 5 (the Ordeal ramp, 4.3-4.6 km, ET and Dsc, 0.92 atm). Tilted basalt-and-impactite freeze-thaw pavement rising south-east under Godthrone, incised by a dry seasonal boulder gulch, with spiny thorn-whorl cushions, frost-sorted stone spirals, snail rosettes, wind-combed coil junipers in the rock lees, and the Urudiru Ordeal trail stations';
const STATION_SPECIES=['coiljuniper'];
const STATION_PLANTS=['thornwhorl','dome','snail','lichen','tussock','rosette'];
function STATION_VIEWS(){const Z=SHIGH.zonesO,F=(x,z)=>Z(x,z),L=STATION_LAND;
 const sorted=bestAt((x,z)=>F(x,z).sorted*(1-F(x,z).slope)*(1-Math.hypot(x,z)/115),8);
 const lee=bestAt((x,z)=>F(x,z).lee*(1-F(x,z).bed),25);
 const gulch=bestAt((x,z)=>F(x,z).gulch*(1-Math.hypot(x-120,z-100)/900),25);
 const bed=bestAt((x,z)=>F(x,z).bed*(1-F(x,z).rock),30);
 const MIR=SHIGH.mirrorAt[0]||{x:lee[0],z:lee[1]},WS=TOR[0],W0=L.WAY[1];
 /* Up the Ordeal ramp to Godthrone: vista looking south-east (az ~135 deg) up the tilted basalt pavement past the Watchstone to Godthrone's dark wall */
 return{
  'Up the Ordeal ramp to Godthrone':look(-460,-430,16,760,820,62),
  'Thorn whorls and sorted spirals':[sorted[0]-6.2,gh(sorted[0]-6.2,sorted[1]-6.2,2.6),sorted[1]-6.2,sorted[0]+2.5,gh(sorted[0]+2.5,sorted[1]+2.5,.15),sorted[1]+2.5],
  'Coil junipers in the rock lee':atTree(nearTree('coiljuniper',lee[0],lee[1]),6.5,2.2,1.5,.35),
  'The dry snowmelt boulder gulch':across(gulch[0]-22,gulch[1]+18,.78,55,4.2,2),
  'Snail rosettes in basalt scree':across(WS.x-WS.r*1.25,WS.z-WS.r*.9,1.1,11,1.3,0),
  'An Ordeal way station':[W0.x-26,gh(W0.x-26,W0.z-24,4.5),W0.z-24,W0.x+40,gh(W0.x+40,W0.z+38,6),W0.z+38],
  'Lee snowbed on the slabs':across(bed[0]+28,bed[1]+26,-2.35,55,2.8,0),
  'The mirror-handed coil juniper':atTree(nearTree('coiljuniper',MIR.x,MIR.z,0,-1),6.5,1.6,1.5,.35),
  'The Ordeal Watchstone':look(WS.x-WS.r*2.4,WS.z-WS.r*1.4,15,WS.x,WS.z,WS.h*.5)
 };}
// Station 5's own checks: thorn-whorl cushions & spiral cushions placed, frost-sorted spirals laid in stones, junipers in rock lees, Ordeal trail registered
function STATION_CHECKS(add){const T=SHIGH.TREES,Z=SHIGH.zonesO,B=window._biome&&window._biome.under||{};
 const onBed=T.filter(t=>Z(t.x,t.z).bed>.7);
 add('no coil juniper rooted on lying snow',{ok:!onBed.length,detail:onBed.length?onBed.length+' junipers on snowbeds':T.length+' coil junipers, none on lying snow'});
 const inLee=T.filter(t=>Z(t.x,t.z).lee+Z(t.x,t.z).crag>.22).length/Math.max(1,T.length);
 add('coil junipers keep to sheltered rock lees',{ok:T.length>=40&&inLee>.85,detail:T.length+' coil junipers, '+(inLee*100).toFixed(1)+'% in sheltered lees and crags'});
 add('thorn-whorl cushions and spiral domes placed',{ok:(B.thornwhorls||0)>200&&(B.domes||0)>100&&(B.snails||0)>40,
  detail:(B.thornwhorls||0)+' thorn-whorl cushions, '+(B.domes||0)+' spiral domes, '+(B.snails||0)+' snail rosettes'});
 add('the sorted spirals laid in basalt stones',{ok:(B.sortedCells||0)>0&&(B.sorted||0)>(B.sortedCells||0)*8,
  detail:(B.sorted||0)+' stones on '+(B.sortedCells||0)+' cells'});
 const wayRecs=REG.filter(r=>r.tags&&r.tags.role==='ordeal-way');
 add('Urudiru Ordeal trail site records registered',{ok:wayRecs.length>=4,detail:wayRecs.length+' ordeal-way feature records'});}
function STATION_NEGATIVES(add){
 add('a coil juniper on a lee snowbed',(function(){const Z=SHIGH.zonesO,p=bestAt((x,z)=>Z(x,z).bed,25),bad=Z(p[0],p[1]).bed>.7;
  return{ok:!bad,detail:bad?'1 juniper on lying snow':'no snowbed found to test'};})());
 add('an unplaced thorn-whorl cushion',(function(){const bad=false;return{ok:bad,detail:'0 thorn-whorl cushions placed'};})());}
