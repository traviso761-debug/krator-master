// ================================================================= HOST — the station: THE BASAL ESCARPMENT (station 4)
// PLAN.md sections 4 and 7 (station 4), 7a: map 5.1 px 752,1213 (old canvas 480,883), 7,066 m mid-scarp, 0.66 atm, HT, on the
// escarpment where the Godthrone falls to the south-western bay (9.5 km at 761,1217 to 4.8 km at 739,1206); the raster falls
// south-west at ~0.1 there. The page draws the scarp's steepest stretch as the cliff the plan describes, on the raster's mean: a
// 600 m wall of stacked flows across the map, gentler ground above and below. Below the dry-cold line (8.5 km) throughout, so its
// bead horizons are palagonite: ochre stripes between the black flows. Its own frame and ground model; no vent, no portal.
const STN={key:'scarp',title:'Krator Godthrone: the basal escarpment',
 hint:'The Godthrone\'s basal escarpment (station 4): the mountain\'s south-western scarp at 7 km, two thirds of an atmosphere; a cliff of titanium-basalt flows 600 m high, each flow a ledge, the thick ponded ones standing in colonnades, the bead horizons between them turned to ochre palagonite stripes; talus under it, snow on the benches, lichen on the stable blocks. N for night',
 centre:[0,0],R:4800,step:8,vent:false,portal:false,summit:false,site:{px:480,py:883},
 items:['boulder','stone','splitstone'],
 counts:B=>B.talus>2000&&B.stones>1000,
 rockFace:'rockColumns',minimap:'The Godthrone\'s basal escarpment',
 sky:{air:{pressure:1.6,humidity:.25,thin:{y0:0,scale:8000}},clouds:{cover:.25,cumulus:.3,cirrus:.3}},
 layers:sd=>[KGROUND.layer('godthrone','palagonite',{w:'vGX.x',amt:.85,gain:1,tint:'vec3(1.0)'}),
  KGROUND.layer('godthrone','lichenCrust',{w:'vGY.w',amt:.8,gain:1,tint:'vec3(1.0)'})],
 /* the close views stand under the face: a 2 m inset at the foot of a buttress (99's views find it by the same point) */
 insets:()=>[{x:xzDA(SC.d+SC.run+30,-600)[0],z:xzDA(SC.d+SC.run+30,-600)[1],r:300,st:2,name:'scarp',label:'The escarpment\'s face (ground, 2 m)'}],
 spine:()=>[[0,0],xzDA(-2600,0),xzDA(-200,-2400),xzDA(-200,2400),xzDA(SC.d+SC.run+200,-600),xzDA(2600,0),xzDA(3600,1800)]};
