// ================================================================= HOST — the air: core/atmos bound, the dust in the lamps
// core/atmos on this page's ticks, ground and camera (no sky reaches 2.4 km down: the bore's still air is the scene's fog, 49). The dust: a thin
// drift of motes in the green lamps' light along the walkway (ATMOS.smoke's dust: still air, no wind underground).
const hourNow=()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:12;
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:hourNow,seed:2082,viewH:()=>innerHeight});
const AIR=(function(){const out={dust:null};
 const E=LINE.lamps.filter(l=>l.x>0&&l.z>0&&l.z<LINE.WIN.walk1).map(l=>[l.x-1.5,l.y-.8,l.z,'dust']);
 if(E.length&&ATMOS.smoke){try{out.dust=ATMOS.smoke(E,{n:10});if(out.dust){out.dust.userData.probeSkip=true;out.dust.userData.inspectLabel='Dust in the lamps\' light';}}catch(e){out.dust=null;}}
 return out;})();
window._air={dust:!!AIR.dust};
