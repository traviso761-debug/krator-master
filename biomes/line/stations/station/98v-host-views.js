// ================================================================= HOST — the views: the station (3, the Twenny junction)
// Down the cavern from the north throat, the island platform and its train, from the east footbridge, the mezzanine, the branch's mouth toward Loj
// Twenny, the great shaft's cage, the west apron and the road's ramp, the south throat into the gallery.
const VIEWS=(function(){const V={},PY=SEC.platformY,D=LINE.DECK,Sh=LINE.shaft.c;
 V['Down the cavern from the north throat']=[20,SEC.walk.y+1.65,236,-2,6,420];
 V['The island platform and its train']=[-1.5,PY+1.65,330,3,PY+1.2,470];
 V['From the east footbridge']=[12,D+1.65,447.5,-8,3,600];
 V['Along the east mezzanine']=[LINE.CAV.x1-1.5,D+1.65,330,-8,D-2,520];
 V['The branch mouth toward Loj Twenny']=[17,PY+1.65,396,30,PY+2.5,413];
 V['The cage of the great shaft (2.2 km up)']=[-17,PY+1.65,522,Sh[0],12,Sh[1]];
 V['The west apron and the road ramp']=[-24,PY+1.65,600,-26,1,250];
 V['The south throat into the gallery']=[21.3,SEC.walk.y+1.65,650,8,3,820];
 return V;})();
function onView(name){TRAINS.fixed=null;}
