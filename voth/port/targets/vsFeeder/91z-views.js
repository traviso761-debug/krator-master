// Generic presets (portViewsSegment) plus, per decay, close views of the
// vessel: from the sea, from the shore (quay) side, down onto the deck, and
// the reclaimed ship at night.
const VIEWS=portViewsSegment();
(()=>{const V=PORT_REG.vessel[PORT_LAYOUT.focus];if(!V)return;
 for(const R of PORT_LAYOUT.runs){if(!R.vessel)continue;const nm=portDName(R.d),x=R.vessel.x,z=R.vessel.z,L=V.length;
  VIEWS[nm+' close']=portCam(x,12,z,.4,.26,L*.72);
  VIEWS[nm+' shore side']=portCam(x-L*.12,12,z,Math.PI-.55,.3,L*.62);
  VIEWS[nm+' deck']=[x-L*.42,V.beam*.9+14,z+V.beam*1.1,x+L*.05,8,z];
  VIEWS[nm+' stern quarter']=portCam(x-L*.3,14,z,-.9,.22,L*.45);
  if(R.d===3)VIEWS[nm+' night close']=portCam(x,12,z,.5,.28,L*.7,1);}})();
