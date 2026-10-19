// ================================================================= HOST — the Garden's great-houses' plan (P3e), made before the kits build
// PRG (58-pr-garden.js) on this page's Garden's mesa and the Heart, the pinnacles standing on the Garden's top, the roost
// plan's ascents (the Garden's stair and ramp, the stair up the Heart) and the pinnacles' climbs; the Beast Riders' sizes
// (CAT.dims). Every house and path is in core/tags before 89g draws it.
const GARDEN_TOWN=(function(){if(!GARDEN_B||!HEART_B)return null;try{const t0=performance.now();
 const stacks=ROCK.filter(B=>/^garden-/.test(B.id)&&B!==GARDEN_B&&B!==HEART_B&&Math.abs(B.y0-(GARDEN_B.top-2))<5);
 const G=PRG.plan({K:KSTACKS,rock:ROCK,garden:GARDEN_B,heart:HEART_B,stacks,ascents:ROOST.ascents||[],climbs:ROOST.climbs,dims:(k,v)=>CAT.dims(k,v),tags:BIO.tagReg(),seed:null});
 G.ms=Math.round(performance.now()-t0);return G;}
 catch(e){reportErr('garden plan: '+(e&&e.stack||e));return null;}})();
_mark('gardenplan');
