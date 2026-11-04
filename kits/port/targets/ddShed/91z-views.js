// Generic presets for the focus key (portViewsSegment in 70-port-core.js):
// Overview, one per decay, West side, East side, Ruined sides, From the sea,
// Above, Eye level, Night. Add your own below with portCam(tx,ty,tz,az,el,r):
//   VIEWS['My detail']=portCam(PORT_LAYOUT.runs[0].items[1].gx+40,PORT.DECK,20,.6,.3,90);
const VIEWS=portViewsSegment();
// ddShed detail views: each decay's open sea end from the water, inside the
// hall from its land end, straight down over it.
{const R=PORT_LAYOUT.runs||[];for(const r of R){const it=r.items[1],nm=portDName(r.d);
  VIEWS[nm+' sea end']=[it.gx+34,16,it.gz+78,it.gx,4,it.gz-40];
  VIEWS[nm+' inside']=[it.gx+27,PORT.DECK+4,it.gz-104,it.gx-2,-2,it.gz-14];
  VIEWS[nm+' top']=[it.gx,430,it.gz-50,it.gx,0,it.gz-49.8];}}
