// ================================================================= HOST — the atmosphere: the cloud sea
// core/atmos bound for this stage (its core, presets, export and the cloud deck, listed in build.py's CORE_ATMOS). The
// cloud sea is ATMOS.cloudDeck: a field of heaped, drifting billows written from PRESETS.clouddeck, so a game engine
// draws the same cloud from the same numbers (core/atmos/GODOT.md, "The cloud deck"). It follows the camera and thins
// where the ground rises through it; the ground it reads is the stage's cached height (FC), not the full terrain call.
// The mist sprites along its edge and up the ravines stay this host's own (84-host-ground.js).
ATMOS.init({THREE,scene,camera,hour:()=>11,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>FC.at(FC.a.h,x,z),seed:47,err:reportErr});
const DECK=ATMOS.cloudDeck({y:CLOUD_Y,sun:[-1000,900,-700],bounds:[-13000,-12600,13000,rimZ(0)+400],name:'The cloud sea'});
REGISTER({name:'The cloud sea (the hyperjungle\'s air, pooled below the Wall)',x:0,z:-2600,y:CLOUD_Y-60,r:1400,h:110});
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26; here, after ATMOS.init): wet: the southern highlands over the hyperjungle's
// cloud sea, rain and the cloud's fog. // It starts clear, so the page looks as it did; the Weather selector in the panel picks the rest.
ATMOS.bindWeather({climate:{wet:true},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
