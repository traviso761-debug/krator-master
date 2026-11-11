// ================================================================= WOW — the layout: the bench's fields, the climate and the zones (DATA)
// [G data] Plain functions of a point's FIELDS (the host's: 47-host-land.js hands them to WOW.lay), no THREE, no DOM, no draws: the
// same point gives the same answer in Godot. PLAN.md sections 1-4.
//
// THE BENCH (PLAN.md section 4, the scale model 5.1): the Outer Wall's inner flank, a crescent from below Farside round to Dalab, rising
// from ~3.2 km at its lowland edge to ~6.5 km under the airless crest. Its theme is a wall coming apart, in bands up the bench:
//   the loess tablelands   3.0-4.1 km  the dust the wall sheds, blown down by the night's katabatic wind, lying as loess deep enough to
//                                      farm and to live in (yuan, liang, mao; sheer-walled gullies; earth pillars; terraced fields)
//   the slump terraces     3.85-5.55 km three benches (map 5.1): back-tilted blocks, uphill-facing scarps, trench lakes, sackung
//   the sturzstrom fields  4.6-5.9 km  five long-runout lobes from the headwall scars: hummocky, grooved, megablocks
//   the crest              7 km and up  the airless rim (godthrone's ground): nothing grows
// The model sculpts the slumps, the lobes and the yuan at 1 km a cell (tools/scale-model/smodel/tier1_biomes.py section 3, `w outer
// wall`; PLAN.md section 1); a station draws its own landforms at metres on top (44s: core/terrain's KRELIEF).
//
//   WOW.climate(mean)      {mean, warm, cold, perma (0..1)}: the annual mean at a point (°C) to the warmest and coldest months (the
//                          bench's swing, section 1's table: about +13 and -13 round the mean), and permafrost (a mean at or below -2 °C)
//   WOW.bench(h)           the bench's bands at an absolute height h (m): {loess (its depth, m), slump, runout, crest (each 0..1)}
//   WOW.springAt(F)        0..1: how near a point is to the spring line, where a cut reaches the foot of the loess (the water the loess
//                          soaks up comes out on the rock under it: the box canyons' heads, the villages' wells)
//   WOW.zoneOf(F)          the zone of a point from its fields F: {water, floor, pillar, terrace, yuan (0..1), gully (0..1), g (grade),
//                          slope (0..1), sunny (-1 a south-facing, shaded slope .. 1 a north-facing, sunny one), mean, loess (m)}
//                          -> 'water'|'cave'|'floor'|'pillar'|'wall'|'scarp'|'terrace'|'fellfield'|'tundra'|'gully'|'larch'|'yuan'|'steppe'
//   WOW.ZONES              each zone's words, and the nwouterwall zone its flora is read as (section 3: the NW outer wall's larch, steppe
//                          and floor, read in place; WOW.nwZone)
//   WOW.lay(o)             the host's binding: {fields: (x,z)=>F, R, seed}; WOW.at(x,z) is then {zone, F, clim}
var WOW={version:1,TAGS:{climate:'cold',aridity:'semiarid',abyssal:false,riparian:'no',koppen:['Dsb','Dsc','Csb','ET','EF']}};
WOW.PERMA=-2;   // °C: permafrost at or below this annual mean (the upper bench, as on the NW outer wall)
// the annual swing, about 13 °C either side of the mean on every band (the map 5.1 survey)
WOW.AMP={warm:13,cold:13};   /* 3-3.5 km +7.9 (20/-4), 3.5-4 km +5.3 (18/-8), 4.5-5 km -1.2 (12/-14): PLAN.md section 3 */
WOW.climate=function(mean){const warm=mean+WOW.AMP.warm,cold=mean-WOW.AMP.cold,p=mean<=WOW.PERMA-1?1:mean>=WOW.PERMA+1?0:(WOW.PERMA+1-mean)/2;
 return {mean,warm,cold,perma:p};};
// the bands by the WARMEST MONTH, as the NW outer wall's (its larch's tree line at +7.5 °C, shrub tundra to +2.5, fellfield below)
WOW.BANDS={treeline:7.5,tundra:2.5};
// THE BENCH'S BANDS (PLAN.md sections 1-2) at an absolute height (m). The loess lies deepest on the lower bench (*proposed* 100-200 m: to
// ~180 m at 3.0-3.5 km, enough for the model's 185 m box canyons to stay in loess) and thins to nothing at the outer slump bench (~4 km);
// each band fades over a few hundred metres into the next (the model's benches 3,850-5,550 m, its lobes 4.6-5.9 km)
WOW.LOESS={deep:180,full:[3000,3500],gone:4100};
const _wst=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
WOW.bench=function(h){const L=WOW.LOESS;
 const loess=L.deep*_wst(2600,L.full[0],h)*(1-_wst(L.full[1],L.gone,h));
 return {loess,slump:_wst(3700,3950,h)*(1-_wst(5450,5700,h)),runout:_wst(4400,4650,h)*(1-_wst(5900,6200,h)),crest:_wst(6900,7400,h)};};
// the spring line: F.cut is how far a point lies under the tableland's surface round it (m), F.loess the loess's depth there; the springs
// rise where the cut reaches the loess's foot, on a band a few tens of metres high
WOW.springAt=function(F){if(!(F.loess>5)||F.cut==null)return 0;const d=F.cut-F.loess;return _wst(-40,-8,d)*(1-_wst(10,40,d));};
// the zones. A WALL is loess standing sheer (over ~45 degrees: it holds a vertical face for centuries, refs/04 and 05); a SCARP the same
// where no loess lies (the patchwork rock, the crater's megabreccia: the slump scarps, station 2); the larch takes the SHADED slopes and
// the gullies' south-facing walls (the bench is wetter than the NW outer wall: 392 mm against 220 at the median, so the larch closes into
// woods there), the feather-grass steppe the SUNNY ones; the YUAN is the tableland's flat top
WOW.zoneOf=function(F){
 if(F.water)return 'water';
 if(F.cave)return 'cave';
 if(F.floor)return 'floor';
 if(F.pillar)return 'pillar';
 if(F.g>1.0)return F.loess>2&&!F.thru?'wall':'scarp';   /* F.thru: a cut gone down through the loess into the rock (the host's) */
 // a sturzstrom's deposit (F.rubble: 1 on a fresh lobe, about half on an old one, its hummocks softened and grown over)
 if(F.rubble>.8)return 'runout';
 if(F.rubble>.3)return 'hummock';
 if(F.shore>.5)return 'shore';
 if(F.terrace)return 'terrace';
 const warm=F.mean+WOW.AMP.warm;
 if(warm<WOW.BANDS.tundra)return 'fellfield';
 if(warm<WOW.BANDS.treeline)return 'tundra';
 if(F.gully>.55)return 'gully';
 if(WOW.shadeOf(F)>.18)return 'larch';
 if(F.yuan>.5&&F.g<.08)return 'yuan';
 return 'steppe';};
// how shaded a point is (0..1 a south-facing slope; Krator stands near 40 S, so the shaded slopes face SOUTH): only a real slope counts
WOW.shadeOf=function(F){const t=F.slope<.05?0:F.slope>.16?1:(F.slope-.05)/.11;return -F.sunny*t*t*(3-2*t);};
// each zone: its words, and the nwouterwall zone whose passes grow there (nwouterwall's 55 and 60, read in place: 'none' grows nothing)
WOW.ZONES={
 water:{nw:'water',name:'water (the spring brook)'},
 floor:{nw:'floor',name:'a gully floor (silt and gravel, the brook\'s willows)'},
 pillar:{nw:'none',name:'an earth pillar (a loess column under its capstone)'},
 cave:{nw:'none',name:'a cave house (a yaodong: a vaulted room dug into the loess)'},
 wall:{nw:'none',name:'a loess wall (buff silt standing sheer, its old soils faint dark bands)'},
 scarp:{nw:'none',name:'a scarp in the crater\'s patchwork rock (megabreccia): bare (the NW outer wall\'s rock zone roots its stone pine\'s mats, not on a face)'},
 runout:{nw:'none',name:'a fresh sturzstrom\'s deposit (angular rubble of every rock, hummocks and grooves: nothing has rooted yet)'},
 hummock:{nw:'fellfield',name:'an old sturzstrom\'s hummocks (the rubble softened under lichen and cushions)'},
 shore:{nw:'floor',name:'a trench lake\'s shore (gravel, the willows\' fringe)'},
 terrace:{nw:'field',name:'terraced fields (contouring the slope, the Hayrant\'s)'},
 fellfield:{nw:'fellfield',name:'fellfield'},tundra:{nw:'tundra',name:'shrub tundra'},
 gully:{nw:'gully',name:'a side gully (silverthorn, the loess\'s runnels)'},
 larch:{nw:'larch',name:'larch wood (a shaded, south-facing slope)'},
 yuan:{nw:'steppe',name:'the yuan (the tableland\'s flat top: feather-grass steppe)'},
 steppe:{nw:'steppe',name:'feather-grass steppe (a sunny, north-facing slope)'}};
WOW.nwZone=z=>(WOW.ZONES[z]||{nw:'none'}).nw;
// THE DUST TOWER (PLAN.md section 4, refs/01): the loess tablelands' own builders, colonies that trap the wind-blown dust and cement it into
// towers 5-30 m tall, black, with orange spiral bosses: core/terrain's KSTACKS mounds (fluted spires fused on a skirt) BY CELL, so any window
// over the same world gives the same towers. o: {world, box [x0, z0, x1, z1], ground, accept(x, z), avoid(x, z, r)}; spec overrides WOW.DUST.
// Each record named and keyed (plant.dusttower) and drawn on organic.dusttower (the host's stacks)
WOW.DUST={cell:110,p:.2,H:[6,24],r:[2.2,5.5],gap:8,clay:[.2,.18,.17]};
WOW.dustTowers=function(o,spec){if(typeof KSTACKS==='undefined'||!KSTACKS.mounds)return [];const S=Object.assign({},WOW.DUST,spec||{});
 return KSTACKS.mounds({id:'dusttower',world:o.world,cell:S.cell,x0:o.box[0],z0:o.box[1],x1:o.box[2],z1:o.box[3],per:1,p:S.p,H:S.H,r:S.r,gap:S.gap,ground:o.ground,soil:S.clay,
  accept:(x,z,r)=>o.accept(x,z)&&!(o.avoid&&o.avoid(x,z,r))}).map(B=>Object.assign(B,{key:'plant.dusttower',tex:'organic.dusttower',
  name:'A dust tower ('+(B.top-B.y0).toFixed(0)+' m: a colony that traps the wind-blown dust and cements it into a tower, black with orange spiral bosses)'}));};
// THE PUYA SPIKE (PLAN.md section 4, refs/02): a giant rosette of grey spears on the dry bench at 4-5 km, its flower spike 8-12 m tall
// blooming once in a century. Where it grows (50 places it): the band, the zones, a sunny slope's share and the bloomers' share
WOW.PUYA={mean:[-4.5,4.5],zones:['steppe','tundra','hummock'],cell:16,p:.2,bloom:.025,sunny:-.05};
WOW.lay=function(o){WOW.FIELDS=o.fields;WOW.R=o.R;WOW.seed=o.seed==null?5200:o.seed;return WOW;};
WOW.at=function(x,z){const F=WOW.FIELDS(x,z);return {zone:WOW.zoneOf(F),F,clim:WOW.climate(F.mean)};};
