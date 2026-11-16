// ================================================================= HOST — the views: the gap (station 2)
// The long run's last platform and its train, the lip over the fall (the white hooded lamps), down the Fixers' ramp into the chamber, the path across
// the chamber by its green lamps, the sump, the Fixers' stair up to S1, S1's platform and its train, the chamber from its far side.
const VIEWS=(function(){const V={},w=SEC.walk,PY=SEC.platformY,F=LINE.POOL;
 V['The gap station (the long run\'s last platform)']=[w.x0+1.6,PY+1.65,262,6,2.5,450];
 V['The lip over the fall (white hooded lamps)']=[w.x0+1.2,w.y+1.65,452,-4,-6,560];
 V['Down the Fixers\' ramp into the chamber']=[14,LINE.ramp[1][1]+1.7,LINE.ramp[1][2],2,-14,660];
 V['The path across the chamber (green lamps)']=[7.5,-16+1.7,630,4,-14,880];
 V['The sump (waded)']=[9,-16+1.7,705,0,-15.8,760];
 V['The Fixers\' stair up to S1']=[2,-16+1.7,900,12,-4,1000];
 V['S1\'s platform and its train']=[w.x0+1.6,PY+1.65,1040,8,2.6,1180];
 V['The chamber from the far fall']=[11,LINE.stair[5][1]+1.8,LINE.stair[5][2],-6,-12,700];
 return V;})();
function onView(name){TRAINS.fixed=null;}
