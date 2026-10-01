// Views for the container-housing dev target: each run, each block close,
// eye level in an alley, night, and straight down.
const VIEWS=(()=>{const V={},D=PORT.DECK,runs=PORT_LAYOUT.runs;
 const blk=(R,k)=>R.items.find(it=>it.key===k&&it.gz<-1);
 const nm=d=>portDName(d);
 V['Intact blocks']=portCam((runs[0].x0+runs[0].x1)/2,D,-120,.35,.55,300);
 for(const R of runs){for(const k of CH_DEV_KEYS){const it=blk(R,k);if(!it)continue;
  V[k+' '+nm(R.d)]=portCam(it.gx,D+6,it.gz-55,.5,.5,150);}}
 for(const R of runs){const it=blk(R,CH_DEV_KEYS[0]);if(it)V['Eye '+nm(R.d)]=[it.gx-2,D+1.7,it.gz-8,it.gx-2,D+6,it.gz-60];}
 V['Night reclaimed']=portCam((runs[2].x0+runs[2].x1)/2,D+5,-120,.3,.4,260,1);
 V['Night intact']=portCam((runs[0].x0+runs[0].x1)/2,D+5,-120,.3,.4,260,1);
 V['Top intact']=[(runs[0].x0+runs[0].x1)/2,520,-150,(runs[0].x0+runs[0].x1)/2,0,-150.2];
 return V;})();
