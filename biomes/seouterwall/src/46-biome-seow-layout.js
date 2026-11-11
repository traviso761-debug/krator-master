// ================================================================= SEOW — the layout: the cordillera's tiers, the climate, the wind and the zones (DATA)
// [G data] Plain functions of a point's FIELDS (the host's: 47-host-land.js hands them to SEOW.lay), no THREE, no DOM, no draws: the
// same point gives the same answer in Godot. PLAN.md sections 1-2 and 7.
//
// THE CORDILLERA (PLAN.md section 1.3, on the scale model 5.1): the SE outer wall rises from the Godsgate's floor (3.4-3.9 km) through
// the tarns' cirques and the periglacial benches to the nival arêtes; the model's pass left it taller than the plan (6.2-11 km, section
// 7.2), so above ~6.5 km it is hypobaric and above 9 km airless. Its tiers by absolute height (m):
//   pass        to 3,850     the Godsgate's floor and fault toes: Dsc / BSk, krummholz, braided meltwater gravels
//   subalpine   3,850-4,200  the cirque floors and the slopes' foot: the tarns' band (stations 2-6)
//   bench       4,200-5,400  slump treads, felsenmeer, sorted stones, rock glaciers: ET
//   nival       5,400-6,450  arêtes, horns, hanging glaciers, rockfall chutes: EF
//   hypobaric   6,450-9,000  the model's taller crest: under 0.72 atm, nothing grows
//   airless     9,000 up     Class O
//
//   SEOW.atm(h)            the air (atm) at an absolute height: 1.6 x e^(-h / 8 km), the model's own rule
//   SEOW.tierOf(h)         the tier's id at an absolute height
//   SEOW.climate(mean)     {mean, warm, cold, perma (0..1), frost}: the annual mean at a point (°C) to the warmest and coldest months
//                          (SEOW.AMP: +11 and -12 round the mean), permafrost (a mean at or below -2 °C), and the nights' frost (1: a
//                          frost every night of the year, the warmest month's nights under 0 °C: PLAN.md section 2.2)
//   SEOW.zoneOf(F)         the zone of a point from its fields F: {water, heap, melt (the gully's part: floor, bar, pool, bank, fan),
//                          fan (0..1 the fan's active channels), moraine (m), g (grade), slope (0..1), sunny (-1 a south-facing, shaded
//                          slope .. 1 a north-facing, sunny one), wind (0 a lee .. 1 the col's open floor and the crests), mean}
//                          shore (a tarn's gravel strand, a metre or two over its water)
//                          road (the Ancients' highway's pavement), heat (°C: KTHERM's, station 3), sinter (0..1)
//                          -> 'water'|'road'|'hot'|'sinter'|'heap'|'floor'|'shore'|'fan'|'crag'|'scree'|'fellfield'|'tundra'|'moraine'|'larch'|'krummholz'|'col'|'puna'
//   SEOW.ZONES             each zone's words, and the nwouterwall zone its flora is read as (PLAN.md section 7.1: the NW outer wall's
//                          larch, pines, steppe and floor, read in place; SEOW.nwZone)
//   SEOW.lay(o)            the host's binding: {fields: (x,z)=>F, R, seed}; SEOW.at(x,z) is then {zone, F, clim}
var SEOW={version:1,TAGS:{climate:'cold',aridity:'semiarid',abyssal:false,riparian:'no',koppen:['Dsc','BSk','ET','EF']}};
SEOW.PERMA=-2;   // °C: permafrost at or below this annual mean (the benches, as on the NW outer wall)
// the annual swing: the warmest month 11 °C over the mean, the coldest 12 under it (the plan's col: +15 / -8 round +3.5)
SEOW.AMP={warm:11,cold:12};
SEOW.atm=h=>1.6*Math.exp(-h/8000);
SEOW.TIERS=[{id:'pass',to:3850},{id:'subalpine',to:4200},{id:'bench',to:5400},{id:'nival',to:6450},{id:'hypobaric',to:9000},{id:'airless',to:Infinity}];
SEOW.tierOf=function(h){for(const T of SEOW.TIERS)if(h<T.to)return T.id;return 'airless';};
// a night's frost: the warmest month's nights run ~12 °C under its mean on the col (the dry air's radiative loss: section 2.2)
SEOW.NIGHT=12;
SEOW.climate=function(mean){const warm=mean+SEOW.AMP.warm,cold=mean-SEOW.AMP.cold,p=mean<=SEOW.PERMA-1?1:mean>=SEOW.PERMA+1?0:(SEOW.PERMA+1-mean)/2;
 return {mean,warm,cold,perma:p,frost:warm-SEOW.NIGHT<=0?1:0};};
// the bands by the WARMEST MONTH, as the NW outer wall's (its larch's tree line at +7.5 °C, shrub tundra to +2.5, fellfield below)
SEOW.BANDS={treeline:7.5,tundra:2.5};
// THE WIND (the God-Bore: PLAN.md section 2.1): the night's katabatic gale pours off the Godthrone and the crest, down from the north-west
// across the col. F.wind is the host's exposure field (0 a lee, 1 the open floor and the crests); above SEOW.EXPOSED no tree stands
// upright: the larch only in a lee, the creeping pine (krummholz) on the open ground
SEOW.EXPOSED=.55;
// THE HEAT (station 3: the fault's vents, core/terrain KTHERM): ground at or over SEOW.HOT °C is the Hearths' (their trees stand on 25-60 °C),
// nothing else roots there
SEOW.HOT=20;
SEOW.FROM=[-.55,-.83];   /* the gale's direction of travel's opposite (where it comes from): north-north-west, unit (x, z) */
// the zones. A CRAG is bare rock standing steep (over ~42 degrees: the megabreccia's ribs, nothing roots on the face); SCREE the steep
// slope under it (29-42 degrees: the crags' fall, cushion plants and the creeping pine in its hollows); on the flat the meltwater's
// gravel (FLOOR: the gully's floor and its bars; FAN: the fan's gravel, its live channels a few metres wide), the moraines' till and
// turf, the outwash flat (COL);
// by the warmest month the fellfield and the tundra higher up; on the slopes the larch in a sheltered shaded lee, the krummholz on an
// exposed shaded slope, the puna's bunchgrass on the sunny ones
SEOW.zoneOf=function(F){
 if(F.water)return 'water';
 if(F.road)return 'road';
 if(F.heat!=null&&F.heat>=SEOW.HOT)return 'hot';
 if(F.sinter>.5)return 'sinter';
 if(F.heap)return 'heap';
 if(F.melt==='floor'||F.melt==='bar'||F.melt==='pool')return 'floor';
 if(F.shore)return 'shore';
 if(F.g>.9)return 'crag';
 if(F.melt==='fan')return 'fan';
 if(F.g>.55)return 'scree';
 const warm=F.mean+SEOW.AMP.warm;
 if(warm<SEOW.BANDS.tundra)return 'fellfield';
 if(warm<SEOW.BANDS.treeline)return 'tundra';
 if(F.moraine>3)return 'moraine';
 const sh=SEOW.shadeOf(F);
 if(sh>.18)return F.wind<SEOW.EXPOSED-.06?'larch':'krummholz';   /* a margin under the exposure: a tree stands a few metres from its grid point */
 if(F.g<.06)return 'col';
 return 'puna';};
// how shaded a point is (0..1 a south-facing slope; the stations stand near 53 S, so the shaded slopes face SOUTH): only a real slope counts
SEOW.shadeOf=function(F){const t=F.slope<.05?0:F.slope>.16?1:(F.slope-.05)/.11;return -F.sunny*t*t*(3-2*t);};
// each zone: its words, and the nwouterwall zone whose passes grow there (nwouterwall's 55 and 60, read in place: 'none' grows nothing)
SEOW.ZONES={
 water:{nw:'water',name:'water (the meltwater brook)'},
 hot:{nw:'none',name:'warm ground over the fault\'s vents (the Hearths\': nothing else roots on it)'},
 sinter:{nw:'none',name:'the sinter terraces\' apron (opaline and iron sinter: bare)'},
 road:{nw:'none',name:'the Ancients\' highway (board-formed concrete, 30 m, graded at 4 %: the Godsgate\'s one surviving artery)'},
 heap:{nw:'none',name:'a rockfall heap (megabreccia blocks fallen from the crags)'},
 floor:{nw:'floor',name:'the meltwater gully\'s floor (braided cobble and gravel bars)'},
 shore:{nw:'floor',name:'a tarn\'s strand (gravel and black basalt sand washed down from the wall: willows, sedge)'},
 fan:{nw:'floor',name:'the meltwater fan (gravel spread into the hollow\'s low: the brook sinks into it)'},
 crag:{nw:'none',name:'a crag (megabreccia: blocks of every rock in a grey matrix flecked with impact glass)'},
 scree:{nw:'fellfield',name:'scree under the crags (the freeze-thaw\'s fall)'},
 fellfield:{nw:'fellfield',name:'fellfield'},tundra:{nw:'tundra',name:'shrub tundra'},
 moraine:{nw:'tundra',name:'a moraine (till and turf: crowberry, dwarf birch, the creeping pine)'},
 larch:{nw:'larch',name:'stunted larch in a lee (a shaded slope out of the God-Bore)'},
 krummholz:{nw:'tundra',name:'krummholz (the creeping pine, flagged by the night\'s gale)'},
 col:{nw:'steppe',name:'the outwash flat (the col\'s puna: bunchgrass on gravel)'},
 puna:{nw:'steppe',name:'puna (cold bunchgrass on a sunny slope)'}};
SEOW.nwZone=z=>(SEOW.ZONES[z]||{nw:'none'}).nw;
SEOW.lay=function(o){SEOW.FIELDS=o.fields;SEOW.R=o.R;SEOW.seed=o.seed==null?6100:o.seed;return SEOW;};
SEOW.at=function(x,z){const F=SEOW.FIELDS(x,z);return {zone:SEOW.zoneOf(F),F,clim:SEOW.climate(F.mean)};};
