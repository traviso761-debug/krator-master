// ---------------------------------------------------------------- 99. the take: Dalab on core/host
// The kit's set and the settlement hand core/host (core/host/README.md; ROADMAP.md section 10, step 5) their views, ground,
// records (KTAGS.page, the registry 91t-dalab-tags.js reads REG into: the inspector, I and a click, and the minimap, M) and
// their own frame: FRAME_HOOKS as before, f(dt, nowMs), before the camera is placed (the labels, the Krator sky and the
// lighting, 94-dalab-light.js; the biome's wind, the windmills; the city's life); the showcase sky and the giant kept on the
// eye after it (94-dalab-light.js removes them for KratorSky). A preset's seventh element is its hour, as before: onView sets
// it for the view select and the hidden buttons (the global setView, which 94-dalab-light.js wraps, does it for
// window._api.setView). TICKS is handed over (ticks:TICKS): its one entry, the
// fire flicker of 69-mat-salvage.js, reads NIGHT, which a host tick below keeps equal to DNIGHT.
var NIGHT=false;   /* what the salvage fire flicker (69-mat-salvage.js) reads: follows 94-dalab-light.js DNIGHT */
const DALAB_HOST=KHOST.take({
 build:window.CITY?'dalab':'dalab-set',title:TITLE,
 hint:'I hovers the inspector, a click inspects, P marks, M the map, F walks at eye height, N night',
 ticks:TICKS,scene,camera,renderer,ground:terrainH,clear:1.2,minR:2,maxR:3000,views:VIEWS,
 onView:n=>{const v=VIEWS[n];DSKY.hour=v&&v[6]!=null?v[6]:DSKY_DAY;dalabSkyTick();dalabHourUI();},
 inspect:(hit,hits,rec)=>{if(rec)return null;const o=hit.object,p=hit.point;
  return(o===groundM||(o.userData&&o.userData.isGround)?'ground':'unregistered '+(o.isInstancedMesh?'instance':'mesh'))+'\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1);},
 minimap:{title:TITLE},
 exporters:{tags:()=>KTAGS.page.export()},
 budget:BUDGET,api:window._api,
});
KHOST.on(function dalabNightFlag(){NIGHT=!!DNIGHT;},'tick');
KHOST.on(function dalabHooks(dt){const now=performance.now();for(const f of FRAME_HOOKS)f(dt,now);},'tick');
KHOST.on(function dalabSky(){if(sky)sky.position.copy(camera.position);if(giant)giant.position.copy(camera.position).addScaledVector(giantDir,4000);},'view');
KHOST.hover(true);   // the inspector's hover tip on, as Dalab's was
