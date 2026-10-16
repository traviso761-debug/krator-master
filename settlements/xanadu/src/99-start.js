// ---------------------------------------------------------------- 99. the take: Xanadu on core/host
// The kit's rows and Erewhon hand core/host (core/host/README.md; ROADMAP.md section 10, step 5) their views, ground, records
// (KTAGS.page, the registry 91t-xanadu-tags.js reads REG into: the inspector, I and a click, and the minimap, M) and their own
// frame: FRAME_HOOKS as before, f(dt, nowMs), before the camera is placed (the labels; the kit's still water and waves,
// core/atmos; Erewhon's sky, city clock, wind and chunk culling); the showcase sky and the giant kept on the eye after it.
// Erewhon's hour stays its own (ERSKY, the hour slider in 93-er-ui.js). TICKS is not handed over: its one entry
// (69-mat-salvage.js's fire flicker) reads the Ancients camera's NIGHT, which no Xanadu page defines (KNOWN_ISSUES.md).
const XANADU_HOST=KHOST.take({
 build:window.CITY?'erewhon':'xanadu',title:TITLE,
 hint:'I hovers the inspector, a click inspects, P marks, M the map, F walks at eye height',
 scene,camera,renderer,ground:terrainH,clear:1.2,minR:2,maxR:3000,views:VIEWS,
 inspect:(hit,hits,rec)=>{if(rec)return null;const o=hit.object,p=hit.point;
  return(o===groundM||(o.userData&&o.userData.isGround)?'ground':'unregistered '+(o.isInstancedMesh?'instance':'mesh'))+'\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1);},
 minimap:{title:TITLE},
 exporters:{tags:()=>KTAGS.page.export()},
 budget:BUDGET,api:window._api,
});
KHOST.on(function xanaduHooks(dt){const now=performance.now();for(const f of FRAME_HOOKS)f(dt,now);},'tick');
KHOST.on(function xanaduSky(){if(sky)sky.position.copy(camera.position);if(giant)giant.position.copy(camera.position).addScaledVector(giantDir,4000);},'view');
KHOST.hover(true);   // the inspector's hover tip on, as Xanadu's was
