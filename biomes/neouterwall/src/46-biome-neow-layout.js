// ================================================================= NEOW — the layout: the cauldron's fields, the climate and the zones (DATA)
// [G data] Plain functions of a point's FIELDS (the host's: 47-host-land.js hands them to NEOW.lay), no THREE, no DOM, no draws: the
// same point gives the same answer in Godot. PLAN.md sections 2-4.
//
// THE WALL (PLAN.md sections 1-2, the scale model 5.1): the Outer Wall between Korona and Spider Lake, its median 7 km and a third of it
// airless crest; its life in the north-west lowland and in three warm tarns in dike-walled cauldrons (2.7-3.0 km). The rock, in the order
// it formed: the impact rim (gneiss, breccia, pseudotachylite on the slump faults), Korona's contact aureole (skarn: epidote green,
// garnet red-brown, magnetite black, marble white), the Arachnoids' dikes (basalt standing out as walls: the cauldrons' boxwork), the
// Outland Gate fault (its open fractures bring hot water up into the cauldrons).
//
//   NEOW.climate(mean)     {mean, warm, cold, perma (0..1)}: the annual mean at a point (°C) to the warmest and coldest months (the
//                          cauldron's swing: SITE.amp, 7 either side at station 1), and permafrost (a mean at or below -2 °C)
//   NEOW.heatK(t)          0..1: how hot the ground is for the springs' surfaces at t °C (the ground's temperature, KTHERM's: 47): the
//                          mats from 22 °C, the bare sinter from 40, a scald from 60
//   NEOW.zoneOf(F)         the zone of a point from its fields F: {water, spring, dike, stair, heat (°C), shoreD (m), apron (0..1), talus
//                          (m), g (grade), slope (0..1), sunny (-1 a south-facing, shaded slope .. 1 a north-facing, sunny one), mean}
//                          -> 'spring'|'water'|'dike'|'stair'|'sinter'|'mat'|'shore'|'mouth'|'scarp'|'wall'|'talus'|'gully'|'ice'|'fellfield'|
//                             'tundra'|'grove'|
//                             'slope'|'meadow'
//   NEOW.ZONES             each zone's words, and the nwouterwall zone its flora is read as (PLAN.md section 4: the NW outer wall's
//                          woods and floor, read in place; NEOW.nwZone); 'grove' also holds this kit's own tree ferns (50)
//   NEOW.lay(o)            the host's binding: {fields: (x,z)=>F, R, seed}; NEOW.at(x,z) is then {zone, F, clim}
var NEOW={version:1,TAGS:{climate:'cold',aridity:'humid',abyssal:false,riparian:'both',koppen:['WH','Dfb','Dfc','Cfb','ET']}};
NEOW.PERMA=-2;   // °C: permafrost at or below this annual mean (the rim's slopes over ~4.6 km)
// the annual swing (PLAN.md section 3: the cauldrons 9-11 °C, warmest 16-18, coldest 2-3)
NEOW.AMP={warm:7,cold:7};
NEOW.climate=function(mean){const warm=mean+NEOW.AMP.warm,cold=mean-NEOW.AMP.cold,p=mean<=NEOW.PERMA-1?1:mean>=NEOW.PERMA+1?0:(NEOW.PERMA+1-mean)/2;
 return {mean,warm,cold,perma:p};};
// the bands by the WARMEST MONTH, as the NW outer wall's (its larch's tree line at +7.5 °C, shrub tundra to +2.5, fellfield below)
NEOW.BANDS={treeline:7.5,tundra:2.5};
const _nst=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
// THE SPRINGS' GROUND (PLAN.md section 6: hot water and ground, sinter crust over hot water): the thermophile mats banded by temperature
// grow over 22 °C (Yellowstone's: the green and orange cyanobacterial mats to ~70 °C on the run-off), the bare sinter over 40, a scald
// over 60 where nothing roots
NEOW.HEAT={mat:22,sinter:40,scald:60};
NEOW.heatK=function(t){return {mat:_nst(NEOW.HEAT.mat-4,NEOW.HEAT.mat+4,t),sinter:_nst(NEOW.HEAT.sinter-5,NEOW.HEAT.sinter+5,t),scald:_nst(NEOW.HEAT.scald-5,NEOW.HEAT.scald+5,t)};};
// the zones. WALL: skarn and gneiss standing over ~45 degrees (no soil holds); TALUS: the fall banked against a dike's foot; the APRON's
// gentle ground is the GROVE (the warm floor's wood: tree ferns, the NW outer wall's conifers); the wall's wooded slopes are SLOPE; the
// gentle open ground over the cauldron MEADOW (wet: 2.5 m of rain); then the tree line's bands by the warmest month
NEOW.zoneOf=function(F){
 if(F.spring)return 'spring';   /* before the water: a spring's pool is water too */
 if(F.dike)return 'dike';   /* before the water too: a fin standing in the tarn is rock */
 if(F.water)return 'water';
 if(F.stair)return 'stair';
 if(F.heat>=NEOW.HEAT.sinter)return 'sinter';
 if(F.heat>=NEOW.HEAT.mat)return 'mat';
 if(F.shoreD<14&&F.y<3)return 'shore';
 if(F.cave)return 'mouth';   /* a cave's mouth (stations 5, 5a: KCARVE) */
 if(F.mirror)return 'scarp';   /* a slump's bared head scarp (station 4) */
 if(F.g>1.0)return 'wall';
 if(F.talus>2.5&&F.g>.35)return 'talus';
 if(F.gully>.5)return 'gully';   /* a badland gully's floor (station 3) */
 const warm=F.mean+NEOW.AMP.warm;
 if(warm<0)return 'ice';   /* EF: the warmest month under 0 °C (station 5a's portal): snow and ice, nothing grows */
 if(warm<NEOW.BANDS.tundra)return 'fellfield';
 if(warm<NEOW.BANDS.treeline)return 'tundra';
 if(F.apron>.5&&F.g<.45)return 'grove';
 if(F.g>.3||NEOW.shadeOf(F)>.2)return 'slope';
 return 'meadow';};
// how shaded a point is (0..1 a south-facing slope; the station stands near 31 S, so the shaded slopes face SOUTH): only a real slope counts
NEOW.shadeOf=function(F){const t=F.slope<.05?0:F.slope>.16?1:(F.slope-.05)/.11;return -F.sunny*t*t*(3-2*t);};
// each zone: its words, and the nwouterwall zone whose passes grow there (nwouterwall's 55 and 60, read in place: 'none' grows nothing)
NEOW.ZONES={
 water:{nw:'water',name:'water (the Vitreous Boxwork Tarn: warm, 2,950 m)'},
 spring:{nw:'none',name:'a hot spring (the Outland Gate fault\'s water, up through the skarn)'},
 dike:{nw:'none',name:'a dike (basalt weathered out of the skarn as a wall)'},
 stair:{nw:'none',name:'the sinter stair (the main spring\'s run-off, terraced pools behind sinter dams)'},
 sinter:{nw:'none',name:'bare sinter (silica crust over hot ground: it may break)'},
 mat:{nw:'none',name:'thermophile mats (green, orange and rust by the water\'s heat)'},
 shore:{nw:'floor',name:'the tarn\'s warm shore (reeds, willow, cottongrass)'},
 wall:{nw:'none',name:'the cauldron\'s wall (banded skarn and gneiss: no tree holds on the face)'},
 talus:{nw:'rock',name:'talus against a dike\'s foot'},
 gully:{nw:'floor',name:'a badland gully\'s floor (skarn gravel, willow and cottongrass in its damp)'},
 mouth:{nw:'none',name:'a cave\'s mouth (the Epidote Cave: hypogene, dissolved out of the skarn\'s marble by water rising up the fault)'},
 scarp:{nw:'none',name:'a mirror scarp (a slump\'s head scarp: the fault surface bared, its black pseudotachylite polished)'},
 ice:{nw:'none',name:'snow and ice (EF: the warmest month under 0 °C)'},
 fellfield:{nw:'fellfield',name:'fellfield'},tundra:{nw:'tundra',name:'shrub tundra'},
 grove:{nw:'larch',name:'the apron\'s grove (tree ferns, larch and stone pine on the warm, wet floor)'},
 slope:{nw:'larch',name:'the wall\'s wooded slope'},
 meadow:{nw:'alas',name:'wet meadow (cottongrass, cloudberry: 2.5 m of rain a year)'}};
NEOW.nwZone=z=>(NEOW.ZONES[z]||{nw:'none'}).nw;
NEOW.lay=function(o){NEOW.FIELDS=o.fields;NEOW.R=o.R;NEOW.seed=o.seed==null?6100:o.seed;return NEOW;};
NEOW.at=function(x,z){const F=NEOW.FIELDS(x,z);return {zone:NEOW.zoneOf(F),F,clim:NEOW.climate(F.mean)};};
