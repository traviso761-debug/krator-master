// ================================================================= 99. the take: Noah's Regret on core/host
// Noah's Regret hands core/host (core/host/README.md; ROADMAP.md section 10, step 5) its views (a view's {cut, night} through
// onView, as setView took them), its ground and its clamp (under the dune only inside the hull), the walk floors (NR_WALK:
// every deck under a point), its records (KTAGS.page is SVTAGS: the defs, the parks' trees and every catalog piece, 36-def.js
// and 91f-furnish.js), the inspector's words (92-camera.js nrInspect), its cutaway units and its own frame: after the camera
// is placed, FRAME_HOOKS (the night's lights, the smoke and the cloth's clock), the sun's shadow box on the orbit target, the
// sky camera and core/atmos, as the old loop ran them; then its two-pass draw (the sky's scene, then the world).
// The cutaway (X): the nine deck buildings (NR_BUILT, their planned storeys) and the bridge house (four storeys and the
// bridge), in world coordinates from the hull frame (NR_HULL: the list and trim tilt a storey by under 0.5 m over a building).
// No editor: the catalog pieces are merged into the hull-frame batch and its instanced templates, which no world adapter
// moves one by one yet.
const NR_CUT_UNITS=(function(){const U=[],W=(x,y,z)=>nrH2W(x,y,z);
 for(const B of NR_BUILT){const F=Array.from(new Set(B.floors)).sort((a,b)=>a-b);if(!F.length)continue;const c=W(B.x,B.y,B.z);
  U.push({id:B.lot,name:((B.rec&&B.rec.name)||B.key)+' ('+B.lot+')',x:c[0],z:c[2],ry:nrHeadingW(B.ry),w:B.w+2,d:B.d+2,
   levels:F.map((y,i)=>({y:W(B.x,y,B.z)[1],h:(i+1<F.length?F[i+1]:y+NR_STOREY)-y,name:'storey '+(i+1)}))});}
 const BH=NR.BRIDGEHOUSE,S0=BH.storeys[0],c=W(S0.xc,S0.y0,0),nm=["the officers' hall",'the chart deck','the berths','the lookout lounge'];
 U.push({id:'bridgehouse',name:'The bridge house',x:c[0],z:c[2],ry:NR_YAW,w:2*S0.a+2,d:2*S0.b+2,
  levels:BH.storeys.map(S=>({y:W(S.xc,S.y0,0)[1],h:S.y1-S.y0,name:nm[S.k]})).concat([{y:W(BH.bridge.xc,BH.bridge.y0,0)[1],h:BH.bridge.y1-BH.bridge.y0,name:'the bridge'}])});
 return U;})();
const NR_HOST=KHOST.take({
 build:'noahs-regret',title:TITLE,
 hint:'I (or T) hovers the inspector, a click inspects, C cuts the decks (or pick a level), X a building storey by storey, N night, F walks (Q / E a level down or up), P marks, M the map',
 scene,camera,renderer,ground:terrainH,clampCam:nrClampCam,minR:1,maxR:2500,walk:NR_WALK,walker:{step:1.95,drop:1e9},
 views:VIEWS,onView:name=>{const v=VIEWS[name];nrViewOpt(v&&v[6]);},
 inspect:(hit,hits)=>nrInspect(hits),
 keys:{c:()=>cutCycle(),n:()=>nrNight(),t:()=>KHOST.hover(),q:()=>nrWalkStep(-1),e:()=>nrWalkStep(1)},
 stats:()=>'records '+REG.length+'  furniture '+SVF.placed.length+(CUT.y!=null?'  CUT '+lvlSel.value:'')+'\n'+nrWhere(KHOST.cam.ctl.target),
 cutaway:{units:NR_CUT_UNITS,cutAt:1.4},
 minimap:{title:TITLE},
 exporters:{tags:()=>SVTAGS.export()},
 api:window._api,
 draw:(sc,cam)=>{renderer.clear();renderer.render(skyScene,skyCam);renderer.render(sc,cam);},
});
KHOST.onWalk=nrWalkFrom;
KHOST.on(function nrFrame(dt){const now=performance.now();for(const f of FRAME_HOOKS)f(dt,now);
 {const tg=KHOST.cam.ctl.target;sun.target.position.set(tg.x,0,tg.z);sun.position.set(tg.x+LIGHTDIR.x*300,LIGHTDIR.y*300,tg.z+LIGHTDIR.z*300);sun.target.updateMatrixWorld();}
 skyCam.quaternion.copy(camera.quaternion);skyCam.fov=camera.fov;skyCam.updateProjectionMatrix();
 atmosFrame(dt);},'view');
KHOST.hover(true);   // the inspector's hover tip on, as the page's was
