// Generic presets for the focus key (portViewsSegment in 70-port-core.js):
// Overview, one per decay, West side, East side, Ruined sides, From the sea,
// Above, Eye level, Night. Add your own below with portCam(tx,ty,tz,az,el,r):
//   VIEWS['My detail']=portCam(PORT_LAYOUT.runs[0].items[1].gx+40,PORT.DECK,20,.6,.3,90);
const VIEWS=portViewsSegment();
// ddDock detail views: each decay's pit from the east at an angle, straight
// down over it, and down the length of the intact pit from its head.
{const R=PORT_LAYOUT.runs||[];for(const r of R){const it=r.items[1],nm=portDName(r.d);
  VIEWS[nm+' pit']=portCam(it.gx,-2,it.gz-10,.95,.38,165);
  VIEWS[nm+' top']=[it.gx,430,it.gz-18,it.gx,0,it.gz-17.8];}
 if(R.length){const i0=R[0].items[1];VIEWS['Down the pit']=[i0.gx+19,PORT.DECK+12,i0.gz-106,i0.gx,-6,i0.gz+10];
  VIEWS['Gate from the sea']=[i0.gx+30,14,i0.gz+150,i0.gx,0,i0.gz+40];}}
