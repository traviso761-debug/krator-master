// ================================================================= YS CITY — the world: constants and the natural ground
// x east, z south, north is -z, y up, sea level y = 0. The map is CITY.WORLD square about the origin. The coast runs
// from the south-middle edge to the north-east corner as a concave bay (DESIGN §2): land to the north-west, the
// Ring Sea to the south-east. Phase 0 gives the bay its shape and a gentle hinterland; the karst, the river and its
// travertine terraces, the old city's sink and the far country (volcano SE, Inner Wall N/W) come with phase 3.
const CITY={WORLD:3200,HW:1600,SEA0:0,
 // the shoreline, traced from the south-middle edge to the NE corner; the city stands at the head of the bay
 SHORE:[[0,1600],[70,1180],[190,760],[330,330],[450,-100],[640,-520],[950,-900],[1290,-1250],[1600,-1600]],
 HEAD:[380,-60],     // the head of the bay: the main market stands near here
};
// signed distance to the shore polyline: > 0 inland (north-west of the line), < 0 at sea. The polyline runs
// south to north-east, so the land is on its LEFT (cross product > 0 when x east, z south).
function ysShoreDist(x,z){let best=1e9,sign=1;const P=CITY.SHORE;
 for(let i=0;i<P.length-1;i++){const ax=P[i][0],az=P[i][1],bx=P[i+1][0],bz=P[i+1][1];const dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz||1;
  const t=clamp(((x-ax)*dx+(z-az)*dz)/L2,0,1);const qx=ax+dx*t,qz=az+dz*t;const d=Math.hypot(x-qx,z-qz);
  if(d<best){best=d;sign=(dx*(z-az)-dz*(x-ax))>0?-1:1;}}
 return best*sign;}
// the natural ground before any stamp: a wandering shore, a beach, a hinterland rising gently toward the Inner Wall,
// a seabed falling to ~30 m in the bay. Continuous everywhere. Replaced in phase 3 by the full landform.
function YS_NAT(x,z){
 const wander=22*(fbm(x/900+1.3,z/900+4.1,2.3,3)-.5)+6*(fbm(x/120,z/120,5.7,2)-.5);
 const d=ysShoreDist(x,z)+wander;
 if(d<0){const s=-d;const q=Math.pow(s/420,1.4),f=1-Math.exp(-q);
  return .5-30.5*f+(fbm(x/150,z/150,3.3,2)-.5)*2.4*clamp(s/70,0,1);}
 if(d<60){const s=d/60;return .5+3.2*s*s*(3-2*s);}
 const u=d-60;
 return 3.7+u*.018+(fbm(x/520,z/520,1.7,3)-.5)*22*clamp(u/300,0,1)+(fbm(x/70,z/70,8.2,2)-.5)*1.4*clamp(u/40,0,1);}
