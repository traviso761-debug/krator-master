// ================================================================= CORE — speleothems: an Alpine cleft's smoky quartz (KSPELEO.SMOKY)  [G data]
// The Line's cleft shrine at the hot doors (biomes/line/PLAN.md section 5, station `hotdoor`; openworld/ANCIENT-TUNNELS.md cave 7):
// a granite cleft (a Kluft: a tension crack in the granite that hot water filled and drained, lined with quartz grown from its
// walls) behind a rail. One preset more for KSPELEO.place; the presets in 39b-core-speleo.js are not touched. A separate file so
// the pages that take 39b stay byte-identical: list it after 39b-core-speleo.js (it needs KSPELEO loaded).
// No THREE, no DOM. Axes: y up, metres, x east, z south.
//
//   KSPELEO.SMOKY        the cleft's lining: smoky-quartz druse on its floor and roof (points to 25 cm, the commonest), clusters of
//                        big points on the floor (a cleft's prize: 0.3 to 1 m), a lone long point leaning out of the floor
//                        where there is room (to 1.2 m, steep). Every record's mineral is 'smoky-quartz'
//   KSPELEO.SMOKY_LOOK   the mineral's look for a host's draw (sRGB hex): body (the smoke at the foot), tip (paler, clearer),
//                        rim (a white quartz base where it grew from the granite), clarity (0..1: how much of the rock it shows),
//                        chlorite (the green dust a cleft's points carry in their hollows: a tint and its share)
//   const R = KSPELEO.place(C, {box, y, world, kinds: KSPELEO.SMOKY})
// Godot: the records cross as data, as every KSPELEO preset's do.
(function(root){
  'use strict';
  var S=root.KSPELEO;if(!S)throw new Error('core/terrain 39b2-core-speleo-cleft.js: load 39b-core-speleo.js first (KSPELEO)');
  if(S.SMOKY)return;
  /* p: a cell's chance, in KSPELEO's order (beam, block, druse); len and r in metres; el (rad) the beam's rise */
  S.SMOKY={beam:{p:.04,len:[.4,1.2],r:[.05,.14],el:[.6,1.3],minGap:1.5,mineral:'smoky-quartz'},
    block:{p:.16,len:[.3,1],r:[.2,.6],n:[2,6],mineral:'smoky-quartz'},
    druse:{p:.5,len:[.04,.25],r:[.5,1.6],n:[8,24],mineral:'smoky-quartz'}};
  S.SMOKY_LOOK={'smoky-quartz':{body:'#4a3a2e',tip:'#b8a898',rim:'#e6e2dc',clarity:.35,chlorite:{tint:'#4f6a3a',share:.15}}};
})(typeof window!=='undefined'?window:globalThis);
