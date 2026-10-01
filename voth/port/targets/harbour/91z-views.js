// Presets for the harbour. First = opening.
const VIEWS=(()=>{const V={},L=PORT_LAYOUT,D=PORT.DECK,R=L.runs&&L.runs[0];if(!R)return {Empty:[0,300,600,0,0,0]};
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const it of L.items){const f=portFoot(it);if(!f)continue;
  x0=Math.min(x0,f.x0);x1=Math.max(x1,f.x1);z0=Math.min(z0,f.z0);z1=Math.max(z1,f.z1);}
 const cx=(x0+x1)/2,cz=(z0+z1)/2,span=Math.max(x1-x0,z1-z0);
 V['Harbour']=portCam(cx,0,cz,.55,.5,span*.95+300);
 V['From above']=[cx,span*1.05+500,cz+1,cx,0,cz];
 V['Segment bounds']=[cx,span*1.05+500,cz+1,cx,0,cz,0,1];
 const H=L.harbour||{},P=H.pier;
 if(P){const f=portFoot(P);let e={x0:f.x0,x1:f.x1,z0:f.z0,z1:f.z1};for(const it of (H.sea||[])){const g=portFoot(it);e={x0:Math.min(e.x0,g.x0),x1:Math.max(e.x1,g.x1),z0:e.z0,z1:Math.max(e.z1,g.z1)};}
  V['The great pier and its platforms']=portCam((e.x0+e.x1)/2,D,(e.z0+e.z1)/2+60,.9,.42,(e.z1-e.z0)*.9+200);
  V['Pier head from the sea']=portCam(P.gx-30,D,P.gz+400,-.35,.18,420);}
 if(H.back&&H.back.length){let e=null;for(const it of H.back){const g=portFoot(it);e=e?{x0:Math.min(e.x0,g.x0),x1:Math.max(e.x1,g.x1),z0:Math.min(e.z0,g.z0),z1:Math.max(e.z1,g.z1)}:g;}
  V['The hinterland']=portCam((e.x0+e.x1)/2,D,(e.z0+e.z1)/2,-.3,.45,(e.x1-e.x0)*.7+220);}
 V['Night']=portCam(cx,D,cz,.4,.35,span*.7+260,1);
 return V;})();
