// Views for the cgStore dev target: the generic segment presets, then close
// views of the cranes per decay (items[1] of each run is cgStore).
const VIEWS=portViewsSegment();
(()=>{const R=PORT_LAYOUT.runs||[];for(const r of R){const it=r.items[1];if(!it)continue;const nm=portDName(r.d);
 VIEWS[nm+' profile']=portCam(it.gx-20,30,it.gz+5,-Math.PI/2+.25,.12,150);
 VIEWS[nm+' close']=portCam(it.gx-20,30,it.gz-10,.7,.25,120);
 VIEWS[nm+' top']=[it.gx,420,it.gz+5,it.gx,0,it.gz+4.8];}})();
