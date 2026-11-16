// ================================================================= HOST — the views: the bore (station 1)
// Down the bore from the walkway (the lamps running to a point), from the access road, over the tracks from the central strip, across the
// gallery (the section's scale), the crossover from above it, the vein's working, a kept train passing (the view holds the clock where the train
// is in sight; every other view lets it run). Each eye stands in the open over a floor (the probe's check).
const TRAIN_VIEW='A kept train passing (T2, southbound)';
const VIEWS=(function(){const V={},w=SEC.walk,r=SEC.road;
 V['Down the bore (the walkway)']=[w.x0+1.2,w.y+1.65,30,6,3.5,700];
 V['From the access road']=[r.x0+2.5,r.y+1.7,120,-6,4,760];
 V['Over the tracks (the central strip)']=[0,SEC.strip.y+1.7,520,0,4.5,1150];
 V['Across the gallery (the section)']=[w.x0+.9,w.y+1.7,250,-16,4.5,262];
 V['The crossover (from the walkway)']=[w.x0+.8,w.y+1.7,272,-2,.6,368];
 V['The Fixers vein working']=[w.x0+1.1,w.y+1.65,LINE.vein.z-8,SEC.x1+6,1.6,LINE.vein.z+2];
 V[TRAIN_VIEW]=[w.x0+1.0,w.y+1.65,620,4.5,2.5,470];
 return V;})();
function onView(name){if(name===TRAIN_VIEW){const T=LINE.trains[0];TRAINS.at(TRAINS.when(T,560));}else TRAINS.fixed=null;}
