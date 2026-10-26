// ================================================================= NWOW — the layout: climate, permafrost, pycrete's rule and the zones (DATA)
// [G data] Plain functions of a point's FIELDS (the host's: 47-host-land.js hands them to BIO.init and to NWOW.lay), no THREE, no
// DOM, no draws: the same point gives the same answer in Godot. PLAN.md sections 1, 3 and 5.
//
//   NWOW.climate(mean)      {mean, warm, cold, perma (0..1), pyc}: the annual mean at a point (°C) to the warmest and coldest
//                           months (the continental steps: warm = mean + 11, cold = mean - 13.5), permafrost (mean at or below
//                           -2 °C, faded over a degree), and PYCRETE'S RULE (section 5): 'permanent' where the mean is at or below
//                           -2 °C (the Yeti's halls and cities), 'seasonal' where the coldest month is at or below -8 °C but the
//                           summer thaws it (walls, towers and forts raised for the raiding season, slumping in spring),
//                           'none' elsewhere (larch, stone and sod). The culture kit (kits/yeti/PLAN.md section 1) reads it back
//   NWOW.zoneOf(F)          the zone of a point from its fields F: {water, floor, aufeis, field, pocket, alas, pingo, burn, gully,
//                           rock, mean, sunny (-1 a south-facing, shaded slope .. 1 a north-facing, sunny one), slope (0..1)}
//                           -> 'water'|'aufeis'|'floor'|'field'|'pocket'|'alas'|'burn'|'gully'|'rock'|'fellfield'|'tundra'|
//                              'larch'|'steppe'
//   NWOW.ZONES              each zone's crops-kit zone (kits/crops BIOMES.nwouterwall) and its words
//   NWOW.lay(o)             the host's binding: {fields: (x,z)=>F, R, seed}; NWOW.at(x,z) is then {zone, F, clim}
var NWOW={version:1,TAGS:{climate:'cold',aridity:'semiarid',abyssal:false,riparian:'no',koppen:['Dsb','Dsc','ET','EF']}};
NWOW.PERMA=-2;            // °C: permafrost and permanent pycrete at or below this annual mean (PLAN.md sections 1 and 5)
NWOW.SEASONAL=-8;         // °C: seasonal pycrete where the coldest month is at or below this
// the annual swing: the warmest and coldest months over and under the mean. A station sets its own (the Yeti Valley's sun trap and
// cold pool widen it: +11 and -19 round a mean of -4, the model's 4.22 correction)
NWOW.AMP={warm:11,cold:13.5};
NWOW.climate=function(mean){const warm=mean+NWOW.AMP.warm,cold=mean-NWOW.AMP.cold,p=mean<=NWOW.PERMA-1?1:mean>=NWOW.PERMA+1?0:(NWOW.PERMA+1-mean)/2;
 return {mean,warm,cold,perma:p,pyc:mean<=NWOW.PERMA?'permanent':cold<=NWOW.SEASONAL?'seasonal':'none'};};
// the bands by the WARMEST MONTH (PLAN.md section 1's table): the tree line where it falls under +7.5 °C (a mean of -3.5 on the
// forest-steppe's swing), shrub tundra to +2.5 (a mean of -8.5), fellfield below; the larch takes the sunny slopes too where the
// warmest month is under +10.5 (a mean under -0.5)
NWOW.BANDS={treeline:7.5,tundra:2.5,larchFlat:10.5};
NWOW.zoneOf=function(F){
 if(F.water)return 'water';
 if(F.aufeis)return 'aufeis';
 if(F.field)return 'field';
 if(F.pocket)return 'pocket';
 if(F.alas)return 'alas';
 if(F.floor)return 'floor';
 if(F.rock>.6)return 'rock';
 const warm=F.mean+NWOW.AMP.warm;
 if(warm<NWOW.BANDS.tundra)return 'fellfield';
 if(warm<NWOW.BANDS.treeline)return 'tundra';
 if(F.burn)return 'burn';
 if(F.gully>.55)return 'gully';
 // the forest-steppe's split (section 1): larch where the slope is shaded and holds its snow, steppe where the sun dries it; on
 // the flats the permafrost decides (the open Yakutian larch lives on the melt the frozen ground holds), and above the steppe's
 // reach (a mean under ~0 °C) the larch takes the sunny slopes too
 const shade=NWOW.shadeOf(F);
 if(shade>.18)return 'larch';
 if(warm<NWOW.BANDS.larchFlat&&shade>-.5)return 'larch';
 if(F.perma>.5&&shade>-.3)return 'larch';
 return 'steppe';};
// each zone: its crops-kit zone (kits/crops CROPS.BIOMES.nwouterwall) and its name
NWOW.ZONES={
 water:{crop:'alas',name:'water'},aufeis:{crop:'alas',name:'aufeis (naled: winter overflow ice)'},floor:{crop:'steppe',name:'the valley floor (gravel)'},
 field:{crop:'steppe',name:'a field of the Three Gifts'},pocket:{crop:'tundra',name:'snow-potato pockets'},alas:{crop:'alas',name:'an alas (a thaw hollow)'},
 burn:{crop:'larchwood',name:'a burn (Ivan-chai on the larch\'s edge)'},gully:{crop:'steppe',name:'a gully (silverthorn)'},rock:{crop:'fellfield',name:'rock (a tor, a crag)'},
 fellfield:{crop:'fellfield',name:'fellfield'},tundra:{crop:'tundra',name:'shrub tundra'},larch:{crop:'larchwood',name:'larch wood (shaded slope, permafrost)'},
 steppe:{crop:'steppe',name:'feather-grass steppe (sunny slope)'}};
// how shaded a point is (0..1 a south-facing slope): only a real slope counts (a swell of a few degrees on the floor does not hold
// its snow any longer than the flat round it)
NWOW.shadeOf=function(F){const t=F.slope<.05?0:F.slope>.16?1:(F.slope-.05)/.11;return -F.sunny*t*t*(3-2*t);};
NWOW.lay=function(o){NWOW.FIELDS=o.fields;NWOW.R=o.R;NWOW.seed=o.seed==null?4700:o.seed;return NWOW;};
NWOW.at=function(x,z){const F=NWOW.FIELDS(x,z);return {zone:NWOW.zoneOf(F),F,clim:NWOW.climate(F.mean)};};
NWOW.pycAt=function(x,z){return NWOW.climate(NWOW.FIELDS(x,z).mean).pyc;};
