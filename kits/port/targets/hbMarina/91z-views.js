// hbMarina views: the generic segment presets plus close-ups of each decay.
const VIEWS=portViewsSegment();
(function(){const R=PORT_LAYOUT.runs||[],D=PORT.DECK;
 for(const r of R){const it=r.items[1];if(!it)continue;const n=portDName(r.d);
  VIEWS[n+' pontoons']=portCam(it.gx-6,2,it.gz+70,.75,.3,115);
  VIEWS[n+' clubhouse']=portCam(it.gx-14,D+6,it.gz-30,.25,.2,70);
  VIEWS[n+' top']=[it.gx,420,it.gz+65,it.gx,0,it.gz+64.8];}
 const r3=R.find(r=>r.d===3);if(r3){const it=r3.items[1];VIEWS['Reclaimed village']=portCam(it.gx-10,3,it.gz+110,-.5,.25,75);}
 const r1=R.find(r=>r.d===1);if(r1){const it=r1.items[1];VIEWS['Ruined wrecks']=portCam(it.gx-10,0,it.gz+90,.4,.3,85);}})();
