// ================================================================= HOST — bismuth at the fumaroles (core/terrain's KGEODE)
// biomes/CRYSTAL-CAVES-5.1.md site 3, "Aura and bismuth" (the owner, 2026-11-09: moved here from the scablands' coulee). Hopper crystals
// grow only from a melt: at a fumarole the sulphides break down to native bismuth, which melts at 271 C in the vent's hot pockets and
// cools to stepped hoppers under an oxide film. So the pockets are KGEODE.around's, round each fumarole (STEAM, 47-host-land.js: its
// strength scales the count), on the ground, never in the marsh, a pool or a pot; drawn by KGEODE.draw (the hoppers in a rainbow film,
// each pocket's rind grey metal), by distance (its update on the page's ticks). Registered as one record for the inspector.
const BISMUTH=(function(){const t0=performance.now(),e=.75;
 const normal=(x,z)=>{const hx=terrainH(x+e,z)-terrainH(x-e,z),hz=terrainH(x,z+e)-terrainH(x,z-e),l=Math.hypot(hx,2*e,hz);return[-hx/l,2*e/l,-hz/l];};
 const R=KGEODE.around({sources:STEAM,world:8701,ground:terrainH,normal,n:[0,3],reach:.5,r:[.14,.38],minerals:{bismuth:1},steep:.5,
  accept:r=>waterH(r.x,r.z)<-1e8&&!HOLLOWS.some(H=>Math.hypot(r.x-H.x,r.z-H.z)<H.r)});
 const D=KGEODE.draw(R,{THREE,chunk:600});   /* sparse over the station: big chunks, few meshes */
 const pp=[];R.forEach(r=>pp.push(r.x,r.y,r.z));D.group.userData.probePoints=pp;scene.add(D.group);
 TICKS.push(()=>D.update(camera.position));D.update(camera.position);
 let cx=0,cz=0;R.forEach(r=>{cx+=r.x/R.length;cz+=r.z/R.length;});
 if(R.length)REGISTER({name:'Native bismuth in the fumaroles\' pockets: '+R.length+' pockets of hopper crystals (a melt cooled under an oxide film)',key:'bismuth.vents',
  x:cx,z:cz,y:terrainH(cx,cz)-40,r:2600,h:400,tags:{geode:{kind:'vent',mineral:'bismuth',n:R.length}}});
 window._bismuth={n:R.length,sources:new Set(R.map(r=>r.source)).size,meshes:D.meshes,tris:D.tris,ms:Math.round(performance.now()-t0)};
 return{records:R,draw:D,normal};})();
