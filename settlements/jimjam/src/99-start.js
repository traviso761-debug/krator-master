// ---------------------------------------------------------------- 99. the take: Jimjam on core/host
// Jimjam hands core/host (core/host/README.md; ROADMAP.md section 10, step 5) its views, its ground, its records (KTAGS.page,
// which 91t-jj-tags.js fills from REG: the inspector, I and a click, and the minimap, M, read them), and its own frame:
// FRAME_HOOKS as before, f(dt, nowMs), before the camera is placed (the sky and sun, the shadow box on the orbit target, the
// labels' scale, the windmill); the sky dome kept on the eye after it. A preset's 7th element (a view's {hour, day}) reaches
// the sun through onView, as setView's did. No cutaway (the kit's buildings have no storeys the host could cut) and no
// editor (no core/furnish pieces, no editor world).
const JJ_HOST=KHOST.take({
 build:'jimjam-kit',title:TITLE,
 hint:'I hovers the inspector, a click inspects, P marks, M the map, F walks at eye height',
 scene,camera,renderer,ground:terrainH,clear:1.2,minR:2,maxR:3000,views:VIEWS,
 onView:name=>{const v=VIEWS[name];jjApplyViewSky(v&&v[6]);},
 inspect:(hit,hits,rec)=>{if(rec)return null;const o=hit.object,p=hit.point;
  return(o===groundM||(o.userData&&o.userData.isGround)?'ground':'unregistered '+(o.isInstancedMesh?'instance':'mesh'))+'\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1);},
 minimap:{title:TITLE},
 exporters:{tags:()=>KTAGS.page.export()},
 budget:BUDGET,api:window._api,
});
KHOST.on(function jjHooks(dt){const now=performance.now();for(const f of FRAME_HOOKS)f(dt,now);},'tick');
KHOST.on(function jjSky(){if(sky)sky.position.copy(camera.position);if(giant)giant.position.copy(camera.position).addScaledVector(giantDir,4000);},'view');
KHOST.hover(true);   // the inspector's hover tip on, as Jimjam's was
