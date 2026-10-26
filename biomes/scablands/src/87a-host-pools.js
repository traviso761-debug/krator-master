// ================================================================= HOST — the pools' flora placed (72-biome-scablands-pools.js)
// The stage's records handed to the overlay's flora before the kit's build bakes (88): the potholes holding rain, the
// plunge lake, and the falls' foot (along the horseshoe every 4 m, 26 to 60 m below its lip: where the cliff meets the
// basin's floor and its first ledges).
// The inspector names the overlay's plants through STAGE_PLANTS (98-host-checks.js).
const SC_CLIFF_FOOT=(function(){const out=[],lo=FLOOR.top-FLOOR.k*FALL.s-FLOOR.drop;
 for(let d=-FLOOR.half+60;d<=FLOOR.half-60;d+=4){const off=26+34*KRAND.unit(KRAND.hash(5153,Math.round(d))),p=courseAt(FALL.s+lipAt(d)+off,d);if(terrainH(p[0],p[1])<lo+14)out.push(p);}return out;})();
const SC_POOLS=SCABLANDS.place({potholes:POTHOLES,lake:{x:PLUNGE.x,z:PLUNGE.z,level:PLUNGE.level,poly:PLUNGE.poly},cliff:SC_CLIFF_FOOT,ground:terrainH,water:waterH});
const STAGE_PLANTS={plantOfItem:SCABLANDS.plantOfItem,kit:'the scablands (the overlay\'s own flora)'};
window._pools=SC_POOLS.count;
