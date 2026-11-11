// ================================================================= HOST — STATION 2's words, views and checks (read by stations/common/99-host-take.js)
const STATION_TITLE='the spiral conifers';
const STATION_HINT="The southern highlands, station 2: the spiral conifers on the plateau behind the Inner Wall's rim (3.6-4.3 km, Dsc). Rope pines wound in three strands, helix firs whose branches climb in one stair, coil juniper krummholz on the wind-shorn crest, snowbeds in the shade; every spiral turns right-handed but the rare mirror tree";
const STATION_SPECIES=['ropepine','helixfir','coiljuniper'];
const STATION_PLANTS=['cone','dwarf','moss','tussock','daisy','rosette','lichen'];
function STATION_VIEWS(){const Z=SHIGH.zonesS,F=(x,z)=>Z(x,z);
 const forest=bestAt((x,z)=>F(x,z).forest),meadow=bestAt((x,z)=>F(x,z).open),krumm=bestAt((x,z)=>F(x,z).krumm),bed=bestAt((x,z)=>F(x,z).bed*(1-F(x,z).rock));
 const MIR=SHIGH.mirrorAt[0]||{x:0,z:0},CS=TOR[0];
 return{
  'The rope pines':atTree(nearTree('ropepine',forest[0],forest[1],9),18,.7,2.2,.55),
  'A helix fir':atTree(nearTree('helixfir',forest[0],forest[1],18),30,2.1,2.5,.55),
  'Spiral cones':(function(){const T=nearTree('helixfir',forest[0],forest[1],14);return[T.x+5,T.y0+T.H*.82,T.z+4,T.x,T.y0+T.H*.85,T.z];})(),
  'Under the conifers':across(forest[0],forest[1],.6,45,1.7,3),
  'The coil junipers on the crest':atTree(nearTree('coiljuniper',krumm[0],krumm[1]),7,1.4,1.6,.3),
  'A meadow':across(meadow[0],meadow[1],-.5,120,2,6),
  'A snowbed':across(bed[0]+30,bed[1]+30,-2.3,60,3,0),
  'The mirror-handed rope pine':atTree(nearTree('ropepine',MIR.x,MIR.z,0,-1),16,1.2,2,.5),
  'The Coil Stone':look(CS.x+CS.r*2.4,CS.z+CS.r*1.1,14,CS.x,CS.z,CS.h*.5),
  'The tarn':(function(){const x=TARN.x+TARN.r*2.8,z=TARN.z+TARN.r*1.6;return[x,Math.max(gh(x,z,3),TARNL+6),z,TARN.x,TARNL+1,TARN.z];})(),
  'From the crest':look(1900,1900,30,-800,-900,40),
 };}
// the station's own checks: the forest below the crest, the krummholz on it, the snowbeds bare of trees, the cones' spirals by the hand
function STATION_CHECKS(add){const T=SHIGH.TREES,Z=SHIGH.zonesS,J=SPI('coiljuniper');
 const tall=T.filter(t=>t.sp!==J),onBed=T.filter(t=>Z(t.x,t.z).bed>.75);
 add('no tree in a snowbed',{ok:!onBed.length,detail:onBed.length?onBed.length+' trees on lying snow (first '+SHIGH.SPECIES[onBed[0].sp].key+')':T.length+' trees, none in a snowbed'});
 const kr=T.filter(t=>t.sp===J),kOn=kr.filter(t=>Z(t.x,t.z).krumm+Z(t.x,t.z).crag>.3).length/Math.max(1,kr.length),tOff=tall.filter(t=>Z(t.x,t.z).krumm<.6).length/Math.max(1,tall.length);
 add('the krummholz on the crest, the tall trees below it',{ok:kr.length>0&&kOn>.8&&tOff>.9,detail:'coil junipers on the crest or the crags '+(kOn*100).toFixed(1)+'%, tall trees off the crest '+(tOff*100).toFixed(1)+'%'});}
function STATION_NEGATIVES(add){add('a helix fir in a snowbed',(function(){const Z=SHIGH.zonesS,p=bestAt((x,z)=>Z(x,z).bed,25),bad=Z(p[0],p[1]).bed>.75;return{ok:!bad,detail:bad?'1 tree on lying snow':'no snowbed found to test'};})());}
