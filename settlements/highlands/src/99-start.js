// ---------------------------------------------------------------- 99. the take: Highlands on core/host
// The Highlands rows and Roketstad hand core/host (core/host/README.md; ROADMAP.md section 10, step 3) their views, ground,
// records (KTAGS.page: the furniture, 89y-hl-furnish.js, and the sites, 91h-hl-tags.js) and their own frame: FRAME_HOOKS as
// before, f(dt, nowMs), before the camera is placed (the labels, the clocks and the orrery, 94-hl-anim.js; Roketstad's sky,
// city clock and forest LOD); the showcase sky and the giant kept on the eye after it. Roketstad's hour stays its own (CITYSKY,
// the hour slider in 93-rk-ui.js). TICKS is handed over (ticks:TICKS): its one entry, the
// fire flicker of 69-mat-salvage.js, reads NIGHT, set just below.
var NIGHT=false;   /* what the salvage fire flicker (69-mat-salvage.js) reads; this page's hour has no night flag, so the lights stay off and only FIRE_T runs */
const HL_HOST=KHOST.take({
 build:window.CITY?'roketstad':'highlands',title:TITLE,
 hint:'I hovers the inspector, a click inspects, P marks, M the map, F walks at eye height',
 ticks:TICKS,scene,camera,renderer,ground:terrainH,walk:KWALK,clear:1.2,minR:2,maxR:3000,views:VIEWS,
 inspect:(hit,hits,rec)=>{if(rec)return null;const o=hit.object,p=hit.point;
  return(o===groundM||(o.userData&&o.userData.isGround)?'ground':'unregistered '+(o.isInstancedMesh?'instance':'mesh'))+'\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1);},
 minimap:{title:TITLE},
 exporters:{tags:()=>KTAGS.page.export()},
 budget:BUDGET,api:window._api,
});
KHOST.on(function hlHooks(dt){const now=performance.now();for(const f of FRAME_HOOKS)f(dt,now);},'tick');
KHOST.on(function hlSky(){if(sky)sky.position.copy(camera.position);if(giant)giant.position.copy(camera.position).addScaledVector(giantDir,4000);},'view');
KHOST.hover(true);
