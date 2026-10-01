// Generic presets for the focus key (portViewsSegment in 70-port-core.js):
// Overview, one per decay, West side, East side, Ruined sides, From the sea,
// Above, Eye level, Night. Add your own below with portCam(tx,ty,tz,az,el,r):
//   VIEWS['My detail']=portCam(PORT_LAYOUT.runs[0].items[1].gx+40,PORT.DECK,20,.6,.3,90);
const VIEWS=portViewsSegment();
// ddYard detail views: each decay's slipway from the channel, the apron from
// the east, straight down.
{const R=PORT_LAYOUT.runs||[];for(const r of R){const it=r.items[1],nm=portDName(r.d);
  VIEWS[nm+' slip']=[it.gx-10,14,it.gz+56,it.gx-28,6,it.gz-50];
  VIEWS[nm+' apron']=portCam(it.gx+14,PORT.DECK,it.gz-45,1.2,.42,120);
  VIEWS[nm+' top']=[it.gx,400,it.gz-20,it.gx,0,it.gz-19.8];}}
