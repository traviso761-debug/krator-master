// ================================================================= HOST — the views: the fault (station 6)
// Into the junction hall, where the bores divide, down the west bore, along the east bore, the fault and the scramble over it, the flooded low point.
const VIEWS=(function(){const V={},WY=SEC.walk.y,E=LINE.EB,E2=LINE.EB2,F=LINE.FLOOD;
 V['Into the junction hall']=[14.8,WY+1.65,80,-2,4,300];
 V['Where the bores divide']=[0,1.65,215,0,5,320];
 V['Down the west bore']=[-22.5,SEC.road.y+1.65,300,-14,3,600];
 V['Along the east bore']=[E.x1-1.2,WY+1.65,300,12,3,600];
 V['The fault']=[E.x1-1.2,WY+1.65,585,14,2.5,640];
 V['Over the scramble']=[E.x1+.3,3.2+1.65,620,16,1.5,680];
 V['The flooded low point']=[E2.x1-1.2,WY+1.65,690,14,F.level,790];
 return V;})();
function onView(name){TRAINS.fixed=null;}
