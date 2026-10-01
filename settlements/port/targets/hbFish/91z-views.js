// hbFish views: the generic segment presets plus close-ups of each decay.
const VIEWS=portViewsSegment();
(function(){const R=PORT_LAYOUT.runs||[],D=PORT.DECK;
 for(const r of R){const it=r.items[1];if(!it)continue;const n=portDName(r.d);
  VIEWS[n+' basin']=portCam(it.gx-4,2,it.gz+60,.9,.32,120);
  VIEWS[n+' hall']=portCam(it.gx-12,D+4,it.gz-20,-.35,.22,75);
  VIEWS[n+' top']=[it.gx,420,it.gz+65,it.gx,0,it.gz+64.8];}
 const r3=R.find(r=>r.d===3);if(r3){const it=r3.items[1];VIEWS['Reclaimed village']=portCam(it.gx+2,4,it.gz+80,-.6,.22,70);}
 const r1=R.find(r=>r.d===1);if(r1){const it=r1.items[1];VIEWS['Ruined wrecks']=portCam(it.gx-20,0,it.gz+60,.3,.3,80);}})();
