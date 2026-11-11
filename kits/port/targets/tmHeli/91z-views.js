// Generic presets for the focus key (portViewsSegment in 70-port-core.js),
// then tmHeli close-ups per decay: the pads from the sea, pad 1 from above
// its rim, the land apron (hangar, cab, fuel store).
const VIEWS=portViewsSegment();
(function(){const D=PORT.DECK;for(const R of PORT_LAYOUT.runs){const it=R.items[1],n=portDName(R.d);
 VIEWS[n+' close']=portCam(it.gx,D+6,it.gz+45,.55,.36,210);
 VIEWS[n+' pads']=portCam(it.gx+2,D+8,it.gz+90,.9,.2,110);
 VIEWS[n+' pad top']=portCam(it.gx-16,D+13,it.gz+62,-.8,.5,48);
 VIEWS[n+' apron']=portCam(it.gx,D,it.gz-36,Math.PI*.8,.42,95);
 if(R.d===0)VIEWS['Intact night']=portCam(it.gx,D+6,it.gz+45,.55,.3,190,1);}})();
