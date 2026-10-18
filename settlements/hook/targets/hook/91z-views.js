// Presets for Hook's waterfront (settlements/hook/PLAN.md, section 5, the views the city has so far). First = opening.
// An 8th element truthy = the segment-boundary overlay; a 7th = night (70-port-core.js portCam).
const VIEWS=(()=>{const V={},L=PORT_LAYOUT,D=PORT.DECK,R=L.runs&&L.runs[0];if(!R)return {Empty:[0,300,600,0,0,0]};
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const it of L.items){const f=portFoot(it);if(!f)continue;
  x0=Math.min(x0,f.x0);x1=Math.max(x1,f.x1);z0=Math.min(z0,f.z0);z1=Math.max(z1,f.z1);}
 const cx=(x0+x1)/2,cz=(z0+z1)/2,span=Math.max(x1-x0,z1-z0);
 const H=L.hook||{},at=H.at||(()=>null),P=H.pier;
 // the whole waterfront, high, from the south-west over the Point; the Hook's L in the middle
 V['Overview']=portCam(cx,0,cz,-.6,.5,span*.8+300);
 V['From above']=[cx,span*1.05+500,cz+1,cx,0,cz];
 V['Segment bounds']=[cx,span*1.05+500,cz+1,cx,0,cz,0,1];
 if(P){const f=portFoot(P);let e={x0:f.x0,x1:f.x1,z0:f.z0,z1:f.z1};for(const it of (H.sea||L.harbour&&L.harbour.sea||[])){const g=portFoot(it);e={x0:Math.min(e.x0,g.x0),x1:Math.max(e.x1,g.x1),z0:e.z0,z1:Math.max(e.z1,g.z1)};}
  // low, from beyond the platforms, up the pier's axis
  V['The Hook from the sea']=portCam(P.gx-30,D,P.gz+200,.15,.1,620);
  V['The Hook and its platforms']=portCam((e.x0+e.x1)/2,D,(e.z0+e.z1)/2+60,.9,.42,(e.z1-e.z0)*.9+200);
  // on the pier's head, looking north to the Customs House
  V['The Customs']=[P.gx-30,D+2,P.gz+120,P.gx,D+6,P.gz-120];}
 const fish=at('hbFish');
 if(fish){const F=portRegOf('hbFish');V['The Strand at eye level']=[fish.gx+30,D+2,fish.gz-6,fish.gx-30,D,fish.gz+F.SEA*.6];}   /* on the harbour's quay, looking out over the jetties */
 const berth=at('slBerth');
 if(berth){const B=portRegOf('slBerth');V['The Iron Court']=portCam(berth.gx+40,D,berth.gz+B.SEA*.4,-.9,.3,300);}
 const heli=at('tmHeli');
 if(heli){V['The Sun Canton']=portCam(heli.gx,D,heli.gz-60,.5,.38,320);}
 const stack=L.items.find(it=>it.key==='chStack');
 if(stack){const S=portRegOf('chStack');V['The Stacks']=[stack.gx-30,D+1.7,stack.gz-S.LAND/2,stack.gx+40,D+8,stack.gz-S.LAND/2-10];}
 V['Night']=portCam(cx,0,cz,-.6,.5,span*.8+300,1);
 return V;})();
