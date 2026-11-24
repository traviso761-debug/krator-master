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
 // P1: the Heights from the sea side (the ridge behind the Customs, the hosts on the grid), the Ancient town from the
 // ridge looking down over the roofs to the Hook, and the hill behind the site
 // (the heights are read from the ground itself: the scale model's slope stands where the plan's ridge was)
 if(typeof HOOK_GROUND!=='undefined'){const r=HOOK_GROUND.ridge,c=HOOK_GROUND.hill,rx=(r.x0+r.x1)/2,g=(x,z)=>terrainH(x,z);
  V['The Heights']=portCam(rx,g(rx,r.z1+40)+4,r.z1+40,.1,.28,900);
  V['The Ancient town']=[rx+300,g(rx+300,r.z0+60)+60,r.z0+60,rx-100,D,120];
  /* from the hill's crest, back over the whole town to the harbour and the Hook (on the spit the hill is the kit's ramp,
     the only height behind the waterfront: the view the 4.21 slope gave from below no longer shows anything) */
  const hz=(c.z0+c.z1)/2;V['The hill behind']=[120,g(120,hz)+22,hz,-100,D,-150];}
 // P3: the governor's palace at the head of the Hook's axis, and the Stacks' slave market from its cages
 if(typeof HOOK_SITE!=='undefined'){const mk=id=>(HOOK_SITE.markers||[]).find(m=>m.id===id);const B=mk('B'),E=mk('E');
  if(B)V['The palace']=[B.x+60,terrainH(B.x,B.z)+45,B.z+170,B.x,terrainH(B.x,B.z)+14,B.z];
  if(E)V['The slave market']=[E.x-80,terrainH(E.x,E.z)+22,E.z+70,E.x,terrainH(E.x,E.z)+4,E.z];}
 // S3: the Ancient city round the port (77-hook-ruin.js, 90c): from high over the harbour to the downtown and the Crown;
 // low over the drowned downtown from beside the Drowned Spire; on the freeway's approach, looking up the deck to the gate
 if(typeof HOOK_RUIN!=='undefined'&&HOOK_RUIN.crown){const C=HOOK_RUIN.crown,S=HOOK_RUIN.spire,G=HOOK_RUIN.gates[1],ctr=HOOK_RUIN.spans.reduce((a,s)=>[a[0]+s.x/HOOK_RUIN.spans.length,a[1]+s.z/HOOK_RUIN.spans.length],[0,0]);
  V['The Ancient city']=[cx+(cx-ctr[0])*.6,1900,cz+(cz-ctr[1])*.6,ctr[0],0,ctr[1]];
  if(S)V['The drowned downtown']=[S.x+(S.x-C.x)*.12,30,S.z+(S.z-C.z)*.12,C.x,C.y+60,C.z];
  const aps=HOOK_RUIN.spans.filter(s=>s.arc==='approach'),ap=aps[aps.length-1];   /* the approach's far end, by the ramp */
  if(ap&&G)V['The road in']=[ap.x,ap.y+4,ap.z,G.x,G.y+10,G.z];
  /* up close (90d): beside the Crown, its neighbours drawn as the kit's heroes */
  V['The Crown up close']=[C.x+160,C.y+70,C.z+160,C.x,C.y+90,C.z];}
 V['Night']=portCam(cx,0,cz,-.6,.5,span*.8+300,1);
 return V;})();
