// ================================================================= HOST — the views: the breach (station 5)
// Down the gallery to the bulkhead, the bulkhead and the window from the walkway, through the window, down the stair, the chamber from its floor,
// toward the maze beyond.
const VIEWS=(function(){const V={},w=SEC.walk,F=LINE.FLOOR,Ch=LINE.chamber;
 V['Down the gallery to the bulkhead']=[w.x0+1,w.y+1.65,380,6,3,470];
 V['The bulkhead and the window']=[w.x0+.6,w.y+1.65,440,17,2.6,462];
 V['Through the window']=[w.x0+.8,w.y+1.65,474,40,-6,492];
 V['Down the stair']=[22.5,w.y+1.65,452.5,24.5,-16,512];
 V['The chamber from its floor']=[42,F+1.65,515,30,-6,470];
 V['Toward the maze']=[48,F+1.65,482,70,F+2,495];
 return V;})();
function onView(name){TRAINS.fixed=null;}
