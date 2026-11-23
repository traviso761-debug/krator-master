// ================================================================= THE LAKE TOWNS — each town's design row (settlements/xanadu-lake/PLAN.md section 4)
// [G data] XL.SPECS[key], keyed by the town's XAN_TUNE.lake key (its id 'lk.' + key). A row never copies a tune number: the
// people, px, trade, hub and province are read from XAN_TUNE.lake in place (core/region/data/xan-tune.js, on the page as
// gen/89zk-xl-tune.js, in node by require): XL.tune(key). tests/test-xl-towns.js holds every key to a tune record.
//
//   key        the tune key
//   bearing    the plan's direction from the town to open water (degrees; the fit's own, XL.FIT[key].bearing, is what the
//              ground uses: the test holds the two within 45 degrees)
//   shore      the core/coast class at the landing (the region's, read by tools/fit_lake_town.py)
//   wall       {rise: metres to the rim within 7 km (the model's), benches: the terrace benches' count}
//   world      {region, site, R, band}: the open world's region and site, the footprint and the band (core/world/bake_towns.py)
//   quarters   [{id, role, share, at}]: share of the houses; at 'shore' | 'slope' | 'bench' | 'stream'
//   landmarks  [{id, key, at}]: the civic set
//   works      [{key, n, at}]: the trade's pieces
//   craft      {dugouts, launches, barges}
//   wealth     [poor, mid, rich] shares of the houses; andean: the share in the Andean set (87b)
//   ruins      null | {...} (Ōlḍ-Thalaba's old quarter)
//   layout     the town's frame (page metres from the landing: x along the shore, d inland of the waterline): the shore road and
//              the contour rows (d), the terrace stairs (x), the market square, the benches ([d0, d1] and their half-length),
//              the stream ({x, drift, to}: its line x + drift * d, up to d = to), the core (the town's own ground: |x| < x,
//              d < d; outside it the region's rest fades in over `fade` m) and the town's half-width
var XL=XL||{};
XL.SPECS={
 mouth:{key:'mouth',bearing:180,
  shore:'sand',   /* the plan proposed shingle; the region's coast field reads sand at the landing (tools/fit_lake_town.py): kept */
  wall:{rise:510,benches:2},
  world:{region:'xanadu-north-shore',site:'sxanmouth01',R:1400,band:600},
  quarters:[{id:'landing',role:'harbour',share:.15,at:'shore'},{id:'market',role:'market',share:.10,at:'shore'},
   {id:'town',role:'residential',share:.50,at:'slope'},{id:'bench',role:'farm',share:.15,at:'bench'},{id:'stream',role:'residential',share:.10,at:'stream'}],
  landmarks:[{id:'ghat',key:'xa_ghat',at:'shore'},{id:'quay',key:'xa_quay',at:'shore'},{id:'temple',key:'xa_temple',at:'shore'},
   {id:'governor',key:'xa_governor',at:'shore'},{id:'market',key:'xa_shops',at:'shore'},{id:'bridge',key:'xa_bridge',at:'stream'}],
  works:[{key:'xa_fish_racks',n:8,at:'shore'},{key:'xa_boatshed',n:4,at:'shore'},{key:'xa_granary',n:1,at:'slope'},{key:'xa_smithy',n:1,at:'slope'},
   {key:'xa_wayside_shrine',n:2,at:'bench'}],
  craft:{dugouts:55,launches:2,barges:1},
  stalls:16,
  wealth:[.55,.35,.10],andean:.25,ruins:null,
  layout:{half:470,road:26,rows:[26,92,158,224,290,356],stairs:[-235,0,235],
   market:{x:-150,w:110,d:52},
   benches:[[410,520],[600,710]],benchHalf:560,
   stream:{x:430,drift:.06,to:960},
   core:{x:700,d:760,lake:180,fade:300},
   fields:{rows:9}},
  notes:'The first lake town: the plain pattern the shared target is proved on (mouth/PLAN.md). A quay and landing stair, the fish racks and boat sheds along the beach, the market square with the temple and the governor\'s house by the landing, the town up the 8 % slope in five contour rows, two terrace benches above, the stream\'s ravine at its east edge with a footbridge.'}};
// the town's tune record (XAN_TUNE.lake), read in place
XL.tune=key=>(typeof XAN_TUNE!=='undefined'&&XAN_TUNE.lake||[]).find(L=>L.key===key)||null;
// the town's household size: the tune's (T.farm.hh, people a household), read in place
XL.HH=(typeof XAN_TUNE!=='undefined'&&XAN_TUNE.farm)?XAN_TUNE.farm.hh:null;
// the houses the tune's people make: one a household
XL.households=key=>{const L=XL.tune(key);return L?Math.round(L.people/XL.HH):0;};
// the town the page draws: ?town=<key>, else the first built
XL.DEFAULT='mouth';
XL.pick=function(){let k=null;try{if(typeof location!=='undefined')k=new URLSearchParams(location.search).get('town');}catch(e){}return k&&XL.SPECS[k]?k:XL.DEFAULT;};
