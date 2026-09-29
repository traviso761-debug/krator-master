// Generic presets for the focus key (portViewsSegment in 70-port-core.js):
// Overview, one per decay, West side, East side, Ruined sides, From the sea,
// Above, Eye level, Night. Add your own below with portCam(tx,ty,tz,az,el,r):
//   VIEWS['My detail']=portCam(PORT_LAYOUT.runs[0].items[1].gx+40,PORT.DECK,20,.6,.3,90);
const VIEWS=portViewsSegment();
// tmShip close-ups, per decay: the whole terminal, the tower cab, the yard.
(function(){const D=PORT.DECK;for(const R of PORT_LAYOUT.runs){const it=R.items[1],n=portDName(R.d);
 VIEWS[n+' close']=portCam(it.gx,D+4,it.gz-40,.55,.38,165);
 VIEWS[n+' tower']=portCam(it.gx+36,D+24,it.gz-16,-.6,.12,62);
 VIEWS[n+' yard']=portCam(it.gx-22,D,it.gz-42,-.7,.45,95);}})();
