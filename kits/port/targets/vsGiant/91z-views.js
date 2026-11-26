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
  if(R.d===3)VIEWS[nm+' night close']=portCam(x,12,z,.5,.28,L*.7,1);}
 // the ruined giant's break (hull z = VS_GCRACK; heading +x puts it at x + VS_GCRACK)
 const R=PORT_LAYOUT.runs.find(r=>r.d===1&&r.vessel);
 if(R){VIEWS['Ruined break']=portCam(R.vessel.x+VS_GCRACK,8,R.vessel.z,.55,.25,150);
  VIEWS['Ruined break from shore']=portCam(R.vessel.x+VS_GCRACK,8,R.vessel.z,Math.PI-.5,.3,140);}})();
