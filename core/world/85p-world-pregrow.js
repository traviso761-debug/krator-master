// ================================================================= OPEN WORLD — every prototype grown at load (opt-in)
// [web] A region lists this fragment after 85-world-flora.js (its LATE step reads FLORA). The nursery grows a species'
// level the first time a tree of it comes into reach, on the main thread; the first tree of a kit also pays for the kit's
// own setup (its materials, its textures), so a flight that reached the NE rim stalled for half a second on the eastern
// abyss's first mid tree (openworld/pinnacle, 2026-11-16). Here every prototype the region's kits can ask for (each
// species their passes can pick, each variant, each level the kit draws, the sapling where a pass has saplings) is queued
// at load, behind the streaming's own requests, and NURSERY.queued counts them, so the loading curtain stays down until
// they are grown. Pinnacle's 152 prototypes are 0.7 M triangles and grow in well under a second
// (openworld/pinnacle/tools/grow_times.py). A far level drawn as an impostor (84i) is left to 84i.
// The keys and specs are 85-world-flora.js's (pkey, spec); FLORA.VARIANTS is its variant count (4 when it says nothing).
LATE.push(()=>{'use strict';
 if(typeof FLORA==='undefined'||!FLORA.KITS)return;
 const NV=FLORA.VARIANTS==null?4:FLORA.VARIANTS,specs=[],t0=performance.now();
 FLORA.KITS.forEach((K,ki)=>{const imp=!!WORLD_KITS[ki].impostor,sps=new Set();
  for(const P of K.passes){if(P.pick||P.stand){for(let s=0;s<K.SP.length;s++)sps.add(s);}else if(Array.isArray(P.sp))P.sp.forEach(s=>sps.add(s));else if(P.sp!=null)sps.add(P.sp);}
  const sap=K.passes.some(P=>P.sapling),far=K.passes.some(P=>P.far);
  for(const sp of sps)for(let v=0;v<NV;v++){
   const L=[[2,false],[1,false]];if(far&&!imp)L.push([0,false]);if(sap)L.push([2,true]);
   for(const [lv,sa] of L)specs.push([ki+'|'+sp+'|'+v+'|'+(sa?'s':lv),{kit:K.name,sp,v,lv,sapling:sa}]);}});
 /* behind every request the streaming makes (its priority is a distance in metres) */
 for(const [key,spec] of specs)NURSERY.get(key,spec,1e8);
 NURSERY.pregrow={specs:specs.length,queuedMs:Math.round(performance.now()-t0),grown:()=>specs.filter(([k])=>NURSERY.protos.has(k)).length};});
