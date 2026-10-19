// ---------------------------------------------------------------- 99. the take: Iziz on core/host
// Iziz hands core/host (core/host/README.md; ROADMAP.md section 10, step 3) its views, its ground, its records (KTAGS.page,
// the full registry 91t-iziz-tags.js reads REG into: the inspector, I and a click, and the minimap, M, read them), and its own
// frame: FRAME_HOOKS as before, f(dt, nowMs), before the camera is placed (the labels, the city's sky, clock, wind and
// weather, in their order); the showcase sky and the giant kept on the eye after it. The city's hour stays its own clock
// (CITY_CLOCK, the hour slider in 93-city-ui.js); the host's speed buttons set the motion time the hooks are handed.
const IZIZ_HOST=KHOST.take({
 build:'iziz-'+(window.CITY?'city':String(TITLE).toLowerCase().replace(/[^a-z]+/g,'-')),title:TITLE,
 hint:'I hovers the inspector, a click inspects, P marks, M the map, F walks at eye height'+(IZIX.units.length?', X cuts a building away (] [ its storeys)':''),
 scene,camera,renderer,ground:terrainH,clear:1.2,minR:2,maxR:3000,views:VIEWS,
 inspect:(hit,hits,rec)=>{if(rec)return null;const o=hit.object,p=hit.point;
  return(o===groundM||(o.userData&&o.userData.isGround)?'ground':'unregistered '+(o.isInstancedMesh?'instance':'mesh'))+'\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1);},
 minimap:{title:TITLE},
 cutaway:IZIX.units.length?{units:IZIX.units}:undefined,   // every furnished building (95i-iziz-interiors.js)
 exporters:{tags:()=>KTAGS.page.export()},
 budget:BUDGET,api:window._api,
});
KHOST.on(function izizHooks(dt){const now=performance.now();for(const f of FRAME_HOOKS)f(dt,now);},'tick');
KHOST.on(function izizSky(){if(sky)sky.position.copy(camera.position);if(giant)giant.position.copy(camera.position).addScaledVector(giantDir,4000);},'view');
KHOST.hover(true);   // the inspector's hover tip on, as Iziz's was
