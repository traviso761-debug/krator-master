// hbHaven views: the generic segment presets plus close-ups of each decay.
const VIEWS=portViewsSegment();
(function(){const R=PORT_LAYOUT.runs||[],D=PORT.DECK;
 for(const r of R){const it=r.items[1];if(!it)continue;const n=portDName(r.d);
  VIEWS[n+' haven']=portCam(it.gx,4,it.gz+20,.5,.3,110);
  VIEWS[n+' lighthouse']=portCam(it.gx-8,D+10,it.gz+66,-.4,.15,55);
  VIEWS[n+' slipway']=portCam(it.gx,D,it.gz-20,.35,.3,55);
  VIEWS[n+' night']=portCam(it.gx-8,D,it.gz+50,.2,.3,160,1);
  VIEWS[n+' top']=[it.gx,300,it.gz+40,it.gx,0,it.gz+39.8];}})();
