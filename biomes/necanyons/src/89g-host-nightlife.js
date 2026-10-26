// ================================================================= HOST — the night's life: lures that glow, fireflies (core/atmos)
// The canyons are wild (no lamps: Pinnacle Rock's fires are its own), so what lights the night is the flora's: the
// monkeycups' rims glow to lure their prey (the kit's records, NECANYONS.LURES from 57; ATMOS.glowAdd, all of them one
// sprite cloud that follows the night), and fireflies hang over the wet places: the creek's banks, the seep lines'
// hanging gardens and the rain pools (ATMOS.fireflies: one sprite cloud, blinking, only at night and not in the rain).
// Both are core/atmos's, on its clock (the world hour, 89a-host-atmos.js), so they fade in through the dusk with 89n's
// light. Which centres take fireflies is a KRAND hash of the centre's index (never a draw); the swarm's own jitter is
// core/atmos's seeded stream. Two draw calls in all. ?nolife leaves them out.
const NIGHTLIFE=(function(){if(typeof ATMOS==='undefined'||!ATMOS.fireflies||!ATMOS.glowAdd)return null;
 if(new URLSearchParams(location.search).has('nolife'))return null;
 try{const KR=KRAND,SEED=4789,keep=(salt,i,p)=>KR.unit(KR.hash(SEED,salt,i))<p,rr2=(i,s)=>2+6*KR.unit(KR.hash(SEED,4,i,s)),out={lures:0,swarms:0};
  // the lures: a faint cold green at each glowing pitcher's mouth
  (NECANYONS.LURES||[]).forEach(L=>{if(L.lure!=='glow')return;ATMOS.glowAdd(L.x,L.y,L.z,[.45,1,.62],Math.max(.9,L.w*4),-1);out.lures++;});
  // the fireflies: centres on the creek's banks (every 36 m, both sides), the wettest seep lines, the rain pools
  const C=[],R=TERR.R-60;
  for(let z=-R,i=0;z<=R;z+=36,i++)for(const s of [-1,1]){if(!keep(1,i*2+(s>0),.7))continue;
   const x=CREEK.x(z)+s*(CREEK.w+rr2(i,s)),y=terrainH(x,z);C.push([x,y,z]);}
  (NECANYONS.SEEPS||[]).forEach((s,i)=>{if(s.seep<.55||!keep(2,i,.3))return;const x=s.x+s.nx*3,z=s.z+s.nz*3;C.push([x,Math.max(terrainH(x,z),s.y-8),z]);});
  (NECANYONS.POTHOLES||[]).forEach((p,i)=>{if(keep(3,i,.6))C.push([p.x,p.y,p.z]);});
  if(C.length){out.fireflies=ATMOS.fireflies(C,{n:7,spread:6});out.swarms=C.length;out.centres=C;}
  if(ATMOS.buildGlow&&out.lures)out.glow=ATMOS.buildGlow();
  return out;}catch(e){reportErr('nightlife: '+(e&&e.stack||e));return null;}})();
_mark('nightlife');
