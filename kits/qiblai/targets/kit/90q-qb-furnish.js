// TARGET: kit — the furnishing pass (Q6): every room the kit's interior builders recorded (QB_ROOMS, src/89q5-qb-interiors.js)
// furnished at once after the scene is built (90-scene.js) and before the probe, by the kit's shared pass (qnFurnishRooms,
// src/89q5f-qb-furnish.js: the catalog's Xanadu pieces through kits/interiors). window._interiors reports rooms, pieces,
// what a programme missed, the audit, the textures and the time.
const QB_IX=(function(){const t0=performance.now(),S=qnFurnishRooms(QB_ROOMS,scene,{seed:33851,frag:'90q-qb-furnish.js',name:'qiblai-interiors'});
 window._interiors={on:S.on,rooms:S.rooms,pieces:S.pieces,missing:S.missing,fails:S.fails.slice(0,12),byRoom:S.byRoom,tex:S.tex||null,ms:Math.round(performance.now()-t0)};return S;})();
