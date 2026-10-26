// Presets for the old port (biomes/dambasins/PLAN.md, section 3). First = opening. y = 0 is the old full level.
const VIEWS=(()=>{const V={},L=PORT_LAYOUT,D=PORT.DECK,R=L.runs&&L.runs[0];if(!R)return {Empty:[0,300,600,0,0,0]};
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const it of L.items){const f=portFoot(it);if(!f)continue;
  x0=Math.min(x0,f.x0);x1=Math.max(x1,f.x1);z0=Math.min(z0,f.z0);z1=Math.max(z1,f.z1);}
 const cx=(x0+x1)/2,cz=(z0+z1)/2,span=Math.max(x1-x0,z1-z0),P=L.db&&L.db.pier,g=(x,z)=>DB_NAT(x,z);   // the bed's own ground (the views are made before the terrain is built)
 // from the bed below, looking up the fast-drain slope at the port on its old line, the ring white under it
 V['The old port from the bed']=[cx+160,g(cx+160,z1+420)+4,z1+420,cx,D+12,cz];
 // the whole station, high over the bed
 V['Overview']=portCam(cx,0,cz,-.6,.55,span*.8+500);
 // on the pier's head, looking out over where the lake was
 if(P){const f=portFoot(P);V['From the pier head']=[P.gx-20,D+2,f.z1-10,P.gx+60,g(P.gx+60,f.z1+1600)+10,f.z1+1600];
  // below the pier, on the slope, looking up at its piles standing in dust
  V['Under the pier']=[P.gx+120,g(P.gx+120,f.z1+220)+2,f.z1+220,P.gx,D-4,f.z1-60];}
 // along the ring: the bleached band under the old line, from the side
 V['The bathtub ring']=[x0-200,g(x0-200,z1+150)+8,z1+150,cx,-12,z1+40];
 V['From above']=[cx,span*1.05+700,cz+400,cx,0,cz+400];
 // the moored hulks (D1), from the slope below them, and along the quay's foot
 const M=(L.db&&L.db.moored)||[];
 if(M.length){const m=M[0];V['The moored hulks']=[m.gx+260,g(m.gx+260,m.gz+260)+14,m.gz+260,m.gx,g(m.gx,m.gz)+12,m.gz];
  V['Along the quay foot']=[m.gx-260,g(m.gx-260,m.gz+110)+5,m.gz+110,m.gx+120,g(m.gx,m.gz)+10,m.gz];}   // out on the slope, below the berths
 // the wrecks (91a-db-wrecks.js): the nearest of each state to the port, from a little way off and low
 if(typeof DB_WRECKS!=='undefined'){const near=st=>{let b=null,bd=1e9;for(const w of DB_WRECKS){if(w.state!==st)continue;const d=Math.hypot(w.x-cx,w.z-cz);if(d<bd){bd=d;b=w;}}return b;};
  for(const [st,nm] of [['whole','A stranded trawler'],['snapped','Snapped in two'],['pieces','Broken up'],['buried','Half buried']]){const w=near(st);if(!w)continue;
   const a=w.heading+1.1,d=w.L*1.1+25,x=w.x+Math.sin(a)*d,z=w.z+Math.cos(a)*d;V[nm]=[x,g(x,z)+4+w.H*.4,z,w.x,w.h+w.H*.3,w.z];}
  // the ship cemetery: from high over the strandlines, the field of wrecks below
  V['The ship cemetery']=[cx+400,g(cx+400,cz+1800)+90,cz+1800,cx-200,g(cx-200,cz+3200),cz+3200];}
 return V;})();
