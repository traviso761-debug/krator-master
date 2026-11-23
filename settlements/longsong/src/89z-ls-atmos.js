// ================================================================= LONGSONG — the air: the weather, the hearths' smoke, fireflies, culling, LOD
// [draw] core/atmos (2026-10-20, every core module that fits the build): its weather (auto: the valley's dawn fog and its
// evening shower, from the hour; the selector beside the clock, 99) scales the night's light and the page's haze (89x
// keeps their base: LSNIGHT.state); its particles: the smoke of the ward's hearths and the caravanserai's kitchen, and
// fireflies over the gardens and the Garden of Held Water; its culling of the big static instanced sets. And core/lod's
// options (97 takes the finished scene over): what moves is left to the page (the people, the herds, the interiors, the
// festival's camp).
const LSAIR=(function(){const O={},N=LSNIGHT.state,FOG0=scene.fog.density;
 // ---------------------------------------------------------------- the weather
 O.W=ATMOS.weather({mode:'auto',apply:W=>{scene.fog.density=FOG0*(1+30*W.fog+10*W.rain);
  if(N.sun!=null)sun.intensity=N.sun*(1-.55*W.rain-.35*W.fog);
  if(N.hemi!=null)hemi.intensity=N.hemi*(1-.2*W.rain)+W.flash*1.2;}});
 // ---------------------------------------------------------------- the hearths' smoke: one plume over each lay house of the ward,
 // and the caravanserai's kitchen (kind 0: a chimney)
 const smoke=LS.BUILDINGS.filter(B=>B.base==='ward'&&(B.kind==='house'||B.id==='caravanserai')).map(B=>[B.x+(B.kind==='house'?B.w*.25:0),LS.topY(B)+.6,B.z,0]);
 O.smoke=ATMOS.smoke(smoke);O.plumes=smoke.length;
 // ---------------------------------------------------------------- fireflies: the ward's gardens and the Garden of Held Water
 const ff=LS.GARDENS.map(G=>[(G.x0+G.x1)/2,0,(G.z0+G.z1)/2]).concat([[LS.HELD.fountain.x,0,LS.HELD.fountain.z]]).map(c=>[c[0],terrainH(c[0],c[2]),c[2]]);
 O.fireflies=ATMOS.fireflies(ff,{n:10,spread:14});
 // ---------------------------------------------------------------- culling: the big static instanced sets split by bearing (the
 // biome core's flora keeps its own sets; the people and the herds move)
 O.cull=ATMOS.cull(scene,{keep:m=>!!m.userData.biome,skip:m=>!!(m.userData.people||m.userData.herd)});
 // ---------------------------------------------------------------- core/lod's options (read by 97-lod-auto.js)
 window.LOD_OPTIONS={skip:o=>!!(o.userData.people||o.userData.herd||o.userData.interiors||o.userData.festival)};
 window._air={get weather(){return {mode:O.W.mode,rain:+O.W.rain.toFixed(2),fog:+O.W.fog.toFixed(2)};},plumes:O.plumes,fireflies:ff.length};
 return O;})();
_mark('air');
