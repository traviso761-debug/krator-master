// ================================================================= HOST — the station: THE BLOODFALLS (station 6)
// PLAN.md section 4 ("The bloodfalls and the blood river") and section 7 (station 6), 7a: map 5.1 px 866,1442 (old canvas 594,1112): 5,377 m,
// 0.82 atm, 188 mm, EF, at the ice belt's southern edge at the head of Qol Ḍrāi. The south frame (stations/gills/45b-host-model.js, read in
// place: one frame with the Red Gill, 11 km north-west, origin on the gill) puts the falls at (8000, 8000): this page's square is centred there.
const STN={key:'blood',title:'Krator Godthrone: the bloodfalls',
 hint:'The bloodfalls (station 6), the ice belt\'s southern edge at 5.4 km: brine sealed for ages under the ice comes out of the cliff clear and rusts blood-red as it falls, staining the ice, hanging red icicles, stepping down in rust terraces to a red pool that steams on cold days; Qol Ḍrāi, the blood river, leaves south down its valley with the first red riverweed in its rapids, toward the Vale of Xanadu 3.7 km below. The Red Gill breathes 11 km north-west. N for night',
 centre:[8000,8000],R:4800,step:8,vent:false,portal:false,summit:false,site:{px:594,py:1112},
 items:['boulder','stone'],counts:B=>B.talus>100&&B.stones>500,
 minimap:'The bloodfalls',
 sky:{air:{pressure:1.6,humidity:.35,thin:{y0:0,scale:8000}},clouds:{cover:.25,cumulus:.25,cirrus:.35},fogDensity:.00005},
 layers:sd=>[KGROUND.layer('godthrone','iceGlacier',{w:'vGX.y*(1.0-vGX.z)',amt:.9,gain:1,tint:'vec3(1.0)'}),
  KGROUND.layer('godthrone','iceRust',{w:'vGX.y*vGX.z',amt:.95,gain:1.1,tint:'vec3(1.0)'}),
  KGROUND.layer('godthrone','rustTerrace',{w:'vGX.z*(1.0-vGX.y)',amt:.95,gain:1,tint:'vec3(1.0)'}),
  KGROUND.layer('godthrone','lichenCrust',{w:'vGY.w',amt:.8,gain:1,tint:'vec3(1.0)'})],
 /* four layers, not five: the ground's program has twelve fixed texture units and the GPUs link 16 (84-host-ground.js; the GPU verify of
    2026-11-08 failed at 17). Palagonite went (3.5% of the ground, the least of the five after the stained ice and the terraces, which are
    the station): the paint still colours it and the faces take its tint (84's vGX.x); its set is left out of this page's pack (station.json "tex") */
 /* the ice cliff and the falls at 2 m (the base lattice's 8 m draws a 40 m cliff in five cells) */
 insets:()=>[{x:FALL.x,z:FALL.z+40,r:260,st:2,name:'falls',label:'The ice cliff, the falls and the pool (ground, 2 m)'}],
 spine:()=>[[FALL.x,FALL.z],[FALL.x,FALL.z+500],[FALL.x-1500,FALL.z-1200],[8000,10500],[9500,12000],[6000,6000],[11000,7000]]};
