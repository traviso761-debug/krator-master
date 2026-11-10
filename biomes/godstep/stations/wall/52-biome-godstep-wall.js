// ================================================================= GODSTEP — the north wall's ground classes (station 5)  [G data]
// PLAN.md sections 2, 4 and 7 (station 5): the valley's one wet side. Its ground beyond station 1's classes: the living RED SOIL under the
// forest (ground.redsoil, a KGROUND layer), the forest's LITTER, the wet season's GRASS on the open benches and the foot, the Talovolci's
// TERRACES (worked red soil), and the SPRING's wet (the streams' banks, the seeps, the irrigated rows: read by the stalks, never painted).
// Each class a colour the host's painter (84) blends by its field; k its strength there.
GSTEP.GROUND.redsoil={col:0x7e3a20,k:.78,name:'Living red soil (laterite still forming under the forest, ~1,000 mm a year)'};
GSTEP.GROUND.litter={col:0x3e3222,k:.7,name:'The forest\'s litter (the spiral trees\' fallen leaves and bark)'};
GSTEP.GROUND.grass={col:0x5a7232,k:.72,name:'The wet season\'s grass'};
GSTEP.GROUND.terrace={col:0x6a3220,k:.85,name:'The Talovolci\'s terraces (worked red soil, irrigated off the springs)'};
['redsoil','litter','grass','terrace'].forEach(k=>GSTEP.CLASSES.push(k));
GSTEP.TAGS.koppen=['Cfa','Csa'];GSTEP.TAGS.climate='humid-subtropical';GSTEP.TAGS.aridity='humid';GSTEP.TAGS.riparian='yes';
