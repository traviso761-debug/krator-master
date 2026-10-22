// Presets for the old port (biomes/dambasins/PLAN.md, section 3). First = opening. y = 0 is the old full level.
const VIEWS=(()=>{const V={},L=PORT_LAYOUT,D=PORT.DECK,R=L.runs&&L.runs[0];if(!R)return {Empty:[0,300,600,0,0,0]};
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const it of L.items){const f=portFoot(it);if(!f)continue;
  x0=Math.min(x0,f.x0);x1=Math.max(x1,f.x1);z0=Math.min(z0,f.z0);z1=Math.max(z1,f.z1);}
 const cx=(x0+x1)/2,cz=(z0+z1)/2,span=Math.max(x1-x0,z1-z0),P=L.db&&L.db.pier,g=(x,z)=>terrainH(x,z);
 // from the bed below, looking up the fast-drain slope at the port on its old line, the ring white under it
 V['The old port from the bed']=[cx+160,g(cx+160,z1+900)+3,z1+900,cx,D+20,cz];
 // the whole station, high over the bed
 V['Overview']=portCam(cx,0,cz,-.6,.55,span*.8+500);
 // on the pier's head, looking out over where the lake was
 if(P){const f=portFoot(P);V['From the pier head']=[P.gx-20,D+2,f.z1-10,P.gx+60,g(P.gx+60,f.z1+1600)+10,f.z1+1600];
  // below the pier, on the slope, looking up at its piles standing in dust
  V['Under the pier']=[P.gx+120,g(P.gx+120,f.z1+220)+2,f.z1+220,P.gx,D-4,f.z1-60];}
 // along the ring: the bleached band under the old line, from the side
 V['The bathtub ring']=[x0-200,g(x0-200,z1+150)+8,z1+150,cx,-12,z1+40];
 V['From above']=[cx,span*1.05+700,cz+400,cx,0,cz+400];
 return V;})();
