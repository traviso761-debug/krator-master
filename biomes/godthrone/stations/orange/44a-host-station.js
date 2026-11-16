// ================================================================= HOST — the station: THE ORANGE BELT (station 3)
// PLAN.md sections 4 and 7 (station 3), 7a: map 5.1 px 736,1325 (old canvas 464,995), 8,347 m, 0.56 atm, HF, 7 km south-west of
// Pluton (743,1328, 9,650 m) on the Godthrone's west flank, falling west-north-west at ~0.22 (12 degrees). The dry-cold line
// (8,500 m) crosses the map's upper third: above it the flows are fresh and black, below it the bead glass has met meltwater a few
// days a year and turned to palagonite. Its own frame and ground model (stations/orange/45b-host-model.js); no vent, no portal.
const STN={key:'orange',title:'Krator Godthrone: the orange belt',
 hint:'The Godthrone\'s orange belt (station 3): the dry-cold line at 8.5 km, a little over half an atmosphere; black titanium-basalt flows above it, going ochre below it where meltwater turned the glass to palagonite; a palagonite cliff honeycombed with tafoni, knife-edged ridges and snow-filled gullies under it, debris-covered ice tongues at the foot; split stones with the endoliths\' green band; the first lichen. Pluton\'s ruin stands 15 km east, up the flank. N for night',
 centre:[0,0],R:4800,step:8,vent:false,portal:false,summit:false,site:{px:464,py:995},
 items:['boulder','stone','splitstone'],
 counts:B=>B.talus>150&&B.stones>1000&&(B.split||0)>200,
 rockFace:'rockTafoni',minimap:'The Godthrone\'s orange belt',
 /* the stations' layers: palagonite on its weight, the debris-covered ice, the lichen crusts (KGROUND, materials.json) */
 layers:sd=>[KGROUND.layer('godthrone','palagonite',{w:'vGX.x',amt:.9,gain:1,tint:'vec3(1.0)'}),
  KGROUND.layer('godthrone','iceDebris',{w:'vGX.y',amt:.95,gain:1.1,tint:'vec3(1.0)'}),
  KGROUND.layer('godthrone','lichenCrust',{w:'vGY.w',amt:.8,gain:1,tint:'vec3(1.0)'})],
 spine:()=>[[0,0],xzDA(-2600,0),xzDA(700,-1200),xzDA(700,1400),xzDA(2400,0),xzDA(3600,-900),xzDA(3600,1300)]};
