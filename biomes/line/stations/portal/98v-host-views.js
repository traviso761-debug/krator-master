// ================================================================= HOST — the views: the portal (station 7)
// Under the shallow cover toward the fallen stretch's light, the sky over the tracks, under a light well, toward the portal's day, the portal from
// the approach cutting, the guideway on toward Ledge, the shaft head on the tableland.
const VIEWS=(function(){const V={},w=SEC.walk,F=LINE.FALL,P=LINE.PORTAL,H=LINE.head.well,g=LINE.groundAt;
 V['Under the cover, toward the fallen stretch']=[w.x0+1,w.y+1.65,140,-2,4,F[0]+20];
 V['The fallen stretch — the sky over the line']=[(SEC.road.x0+SEC.road.x1)/2,SEC.road.y+1.65,285,-2,14,330];
 V['Under a light well']=[-1.5,SEC.strip.y+1.65,176,-2.5,30,180];
 V['Toward the daylight of the portal']=[w.x0+1,w.y+1.65,420,-2,3,P+100];
 V['The portal from the approach cutting']=[w.x0+1,w.y+1.65,P+90,-2,8,P];
 V['On toward Ledge']=[w.x0+1,w.y+1.65,P+150,-2,1,P+600];
 V['The shaft head on the tableland']=[H.x+22,g(H.x+22,H.z+18)+1.7,H.z+18,H.x,g(H.x,H.z)+2,H.z];
 return V;})();
function onView(name){TRAINS.fixed=null;}
