// ---------------------------------------------------------------- 99. the take: the Screamers on core/host
// The Hexahedron village and the furniture catalogue hand core/host (core/host/README.md; ROADMAP.md section 10, step 5)
// their views, ground (flat: terrainH is 0, the eye kept 2 m over it as the old camera did), records (KTAGS.page: the salvage
// homes' furniture and the REG 96t-screamers-tags.js reads in; the inspector, a click and I, and the minimap, M), TICKS (the
// wind, the gas giant's spin, the village's life and lifts, the path tracker: the host hands them motion time, not
// performance.now()/1000, core/host/README.md) and the sky: the dome, the giant and its rings kept on the eye after the camera.
// The old Inspect / Polygon / Path tools (93-polytool.js) are the host's marks (P); its Rings button and the tracker's Routes
// and Tracks buttons (95-pathviz.js) are layers in the bar.
const SCREAMERS_HOST=KHOST.take({
 build:'screamers-'+(typeof window._life!=='undefined'&&window._life?'village':String(TITLE).toLowerCase().replace(/[^a-z]+/g,'-')),title:TITLE,
 hint:'click inspects, I hovers, P marks, M the map, F walks at eye height',
 scene,camera,renderer,ground:terrainH,clear:2,minR:5,maxR:6000,views:VIEWS,
 ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},
  objects:()=>[sky,giant,giantRing]},
 layers:Object.assign({rings:{on:giantRing.visible,set:on=>{giantRing.visible=on;}}},
  window._tracker?{routes:{on:false,set:window._tracker.setRoutes},tracks:{on:false,set:window._tracker.setTracks}}:{}),
 legend:window._tracker?[['#7fe0a0','shuttle'],['#ff7f7f','patrol'],['#ffb347','post'],['#d76f9c','party']]:null,
 inspect:(hit,hits,rec)=>{if(rec)return null;const o=hit.object,p=hit.point;
  return 'unregistered '+(o.isInstancedMesh?'instance':'mesh')+'\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)+'\nrange '+camera.position.distanceTo(p).toFixed(0)+' m';},
 minimap:{title:TITLE},
 exporters:{tags:()=>KTAGS.page.export()},
 budget:BUDGET,api:window._api,
});
