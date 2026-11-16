// ================================================================= HOST — the views: the hot door (station 4)
// Down the gallery to the outer door wall, the plant's hall and its generators, the pipes along the east wall, the cleft shrine, the outer door wall
// close, inside the airlock with the sealed train, past the inner door (the cyan burning, the spalls).
const VIEWS=(function(){const V={},w=SEC.walk,Pl=LINE.plant,Cl=LINE.cleft,O=LINE.OUT,I=LINE.INN;
 V['Down the gallery to the outer door']=[w.x0+1,w.y+1.65,150,-2,4,O];
 V['The plant hall — the generators']=[40,Pl.y+1.65,140,28,Pl.y+3,200];
 V['The cooling banks and the cells on charge']=[34,Pl.y+1.65,214,40,Pl.y+2,250];
 V['The pipes along the east wall']=[w.x0+1,w.y+1.65,250,14.4,4.9,O];
 V['The cleft shrine']=[-20.4,SEC.road.footY+1.65,86,Cl.c[0],Cl.c[1]+1.4,Cl.z];
 V['The outer door wall']=[(SEC.road.x0+SEC.road.x1)/2,SEC.road.y+1.65,260,0,4,O];
 V['In the airlock — the sealed train']=[w.x0+1,w.y+1.65,O+20,4,2.5,I];
 V['Past the inner door — the cyan still burning']=[w.x0+1,w.y+1.65,I+20,-2,5,I+300];
 return V;})();
function onView(name){TRAINS.fixed=null;}
