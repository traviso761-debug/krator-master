// Generic presets for the focus key (portViewsSegment in 70-port-core.js),
// then tmPass close-ups per decay: the whole terminal from the sea side, the
// boarding bridges from above the berth, the plaza from the land.
const VIEWS=portViewsSegment();
(function(){const D=PORT.DECK;for(const R of PORT_LAYOUT.runs){const it=R.items[1],n=portDName(R.d);
 VIEWS[n+' close']=portCam(it.gx,D+10,it.gz-10,.6,.3,190);
 VIEWS[n+' bridges']=portCam(it.gx,D+4,it.gz+30,.35,.42,120);
 VIEWS[n+' plaza']=portCam(it.gx,D+6,it.gz-80,Math.PI-.5,.42,110);
 VIEWS[n+' terraces']=portCam(it.gx-10,D+14,it.gz-30,-.35,.25,75);
 if(R.d===0)VIEWS['Intact night']=portCam(it.gx,D+10,it.gz-10,.6,.25,170,1);}})();
