// prefix: dvh
// ================================================================= CONFLUENCE HAMLET TRADES, QUARRIES, MINES, MARKET & FARMS (style: 'flume', DV3)
// Giant Qvevri Kiln, Red-Cypress Joiner, Apricot-Tuff Quarry, Vardzieti Adit-Mine (`kits/resources` resSource),
// Torrent-Raft Shed, Flumi-Bridzi Customs House, Trout-Weir, Market Bazaar, Lapidary Shophouse, Granary, Warehouse, Terrace Orchard & Mountain Byre.

/* 37. Giant Qvevri Amphora Kiln & Potter's Yard */
defBuilding({key:'dv-potter-qvevri',name:'Metkune-Kura Giant Qvevri Amphora Kiln & Yard',seed:7401,cls:'building',w:12.8,d:11.2,h:11.4,cut:true,
 tags:{types:['industry','shop'],wealth:'middle',style:'flume',role:'qvevri potter',job:'pottery'},
 note:'Beehive terracotta & volcanic-tuff updraft kiln firing man-sized qvevri wine-and-brandy amphorae lined with mountain beeswax.',
 build(){
  const cx=-1.6,w0=8.2,d0=7.4,y0=.26,h0=3.55;
  dvRootSkirt(cx,0,w0,d0,5.0,{mk:'cobble',plinthH:y0+.2});
  dvFloorRect(cx,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(cx,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.28,h:2.18,door:true},{x:-2.2,w:.82,y:.9,h:1.15}]
  });
  dvGableRoof(cx,0,w0,d0,y0+h0,1.6,{mk:'slate'});
  /* outdoor beehive terracotta qvevri kiln at +x */
  dvNoCut(()=>svNoWalk(()=>{
   cyl('basalt',4.1,0,0,1.85,.65,P('basalt'),16);
   lathe('terracotta',4.1,0,[[1.78,.66],[1.65,1.85],[1.15,3.15],[.48,4.05]],16,P('terracotta'),{uv:'cone'});
   cyl('bronze',4.1,4.06,0,.52,.22,P('bronze'),12);
  }));
  smokeAt(4.1,4.35,0);
  dvFurn([
   ['dv_qvevri_rack',cx-2.1,y0,-2.2,0],
   ['dv_qvevri_rack',cx+1.9,y0,-2.2,0],
   ['dv_common_table',cx,y0,.6,0],
   ['dv_shelves_provisions',cx-2.8,y0,1.2,PI/2]
  ]);
 }});

/* 38. Red-Cypress Flume-Wright & Dedabodzi Woodcarver */
defBuilding({key:'dv-joiner-cypress',name:'Khe-Ustati Red-Cypress Flume-Wright & Woodcarver',seed:7402,cls:'building',w:14.2,d:11.4,h:10.8,cut:true,
 tags:{types:['industry','shop'],wealth:'middle',style:'flume',role:'cypress joiner',job:'carpentry'},
 note:'Long open-timbered joinery framing V-flume chutes, overshot waterwheel buckets, and chip-carved dedabodzi hearth mother-pillars.',
 build(){
  const w0=10.8,d0=7.8,y0=.26,h0=3.7;
  dvRootSkirt(0,0,w0,d0,5.2,{mk:'colBasalt',plinthH:y0+.22});
  dvFloorRect(0,0,w0-.08,d0-.08,y0,'floor',P('floor'));
  dvAblaqBox(0,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.75,h:2.35,door:true},{x:-3.2,w:.9,y:.9,h:1.2},{x:3.2,w:.9,y:.9,h:1.2}],
   right:[{x:0,w:.9,y:.9,h:1.2}]
  });
  dvGableRoof(0,0,w0,d0,y0+h0,1.75,{mk:'slate'});
  /* stacked red-cypress logs in front-side yard */
  dvNoCut(()=>{
   dvCypressLog([-4.8,.32,4.4],[-1.8,.32,4.4],.26);
   dvCypressLog([-4.6,.78,4.4],[-2.0,.78,4.4],.24);
  });
  dvFurn([
   ['dv_dedabodzi_hearth',-2.8,y0,-1.4,0],
   ['dv_common_table',1.8,y0,-1.4,0],
   ['dv_pulley_basket',3.6,y0,1.6,0],
   ['dv_shelves_provisions',-3.8,y0,1.6,PI/2],
   ['dv_common_stool',1.8,y0,-.35,PI]
  ]);
 }});

/* 39. Apricot-Rose Volcanic Tuff & Skarn Quarry */
defBuilding({key:'dv-quarry-tuff',name:'Tufi-Kariera Apricot-Tuff & Golden-Skarn Quarry',seed:7403,cls:'building',w:15.6,d:13.2,h:10.8,cut:true,
 front:{x:-3.8,z:4.4,yaw:0},
 tags:{types:['industry'],wealth:'poor',style:'flume',role:'tuff quarry',job:'quarrying'},
 note:'Stepped open-bench volcanic quarry sawing warm apricot-rose tuff ashlar, dark basalt courses, and golden-skarn tympanum blocks under a timber sheer-legs crane.',
 build(){
  const cx=-3.8,cz=1.2,w0=6.2,d0=5.8,y0=.24,h0=3.25;
  dvRootSkirt(cx,cz,w0,d0,5.0,{mk:'colBasalt',plinthH:y0+.2});
  dvFloorRect(cx,cz,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(cx,cz,w0,d0,y0,h0,{front:[{x:0,w:1.12,h:2.08,door:true}]});
  dvGableRoof(cx,cz,w0,d0,y0+h0,1.45,{mk:'slate'});

  /* stepped rose-tuff & skarn quarry benches + timber sheer-legs crane at +x */
  dvNoCut(()=>svNoWalk(()=>{
   box('tuff',3.2,0,-3.2,7.2,2.2,2.4,P('tuff'));
   box('skarn',3.6,2.206,-3.8,6.2,1.9,1.8,P('skarn'));
   box('tuffPolished',2.2,.01,.8,1.35,.85,.95,P('tuff'));
   box('basalt',4.1,.01,1.1,1.25,.75,.88,P('basalt'));
   /* timber A-frame quarry derrick */
   beam('cypress',[1.4,0,2.8],[3.1,5.6,.6],.14,P('cypress'));
   beam('cypress',[4.8,0,2.8],[3.1,5.6,.6],.14,P('cypress'));
   beam('cypress',[3.1,0,-1.4],[3.1,5.6,.6],.14,P('cypress'));
   cyl('rope',3.1,1.4,.6,.024,4.15,P('rope'),6);
  }));
  dvFurn([
   ['dv_wiresaw_frame',cx,y0,cz-1.3,0],
   ['dv_scale_weregild',cx-1.8,y0,cz+1.3,PI/4],
   ['dv_chest_jade_inlay',cx+1.8,y0,cz+1.3,-PI/2],
   ['dv_brazier_copper',cx+1.6,y0,cz-.1,0]
  ]);
 }});

/* 40. Vardzieti Skarn, Tin & Nephrite Adit-Mine (`kits/resources` resSource!) */
defBuilding({key:'dv-mine-gorge',name:'aghvizi-Magharo Vardzieti Tin, Skarn & Nephrite Mine',seed:7404,cls:'building',w:15.8,d:13.8,h:11.2,cut:true,
 front:{x:-4.0,z:4.5,yaw:0},
 tags:{types:['industry'],wealth:'poor',style:'flume',role:'mine',job:'mining'},
 note:'Timbered gorge rock-adit, roofed windlass shaft, and tally-cabin drawing on the nearest non-oil kits/resources ore node via resSource.',
 build(p){
  p=p||{};const metal=p.metal||'tin';
  const cx=-4.0,cz=1.4,w0=6.2,d0=5.8,y0=.24,h0=3.3;
  dvRootSkirt(cx,cz,w0,d0,5.2,{mk:'colBasalt',plinthH:y0+.2});
  dvFloorRect(cx,cz,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(cx,cz,w0,d0,y0,h0,{front:[{x:0,w:1.12,h:2.08,door:true}]});
  dvGableRoof(cx,cz,w0,d0,y0+h0,1.5,{mk:'slate'});
  /* rock adit portal at rear + ore heaps */
  dvAdit(2.6,-2.2,0,{w:2.6,h:2.8});
  dvOreHeap(2.2,2.6,metal,1.15);
  dvOreHeap(4.4,1.8,'copper',.92);
  dvFurn([
   ['dv_scale_weregild',cx-1.6,y0,cz-.8,0],
   ['dv_sluice_fleece_trough',cx+.8,y0,cz-1.4,0],
   ['dv_pulley_basket',cx-1.8,y0,cz+1.4,0],
   ['dv_brazier_copper',cx+1.8,y0,cz+1.4,0]
  ]);
 }});

/* 41. Gorge Torrent-Raft & Coracle Shed */
defBuilding({key:'dv-boatwright-raft',name:'Tivi-Navsadguri Gorge Torrent-Raft & Coracle Shed',seed:7405,cls:'building',w:12.6,d:12.4,h:10.4,cut:true,
 tags:{types:['industry','infrastructure'],wealth:'middle',style:'flume',role:'raft boatwright',job:'shipwrighting'},
 note:'Waterside timber-framed boat-shed lashing buoyant cypress gorge-rafts and oiled-hide coracles for the foaming Crookwash rapids.',
 build(){
  const w0=8.8,d0=6.8,cz0=1.4,y0=.26,h0=3.55;
  dvRootSkirt(0,cz0,w0,d0,5.4,{mk:'rivercobble',plinthH:y0+.2});
  dvFloorRect(0,cz0,w0-.08,d0-.08,y0,'floor',P('floor'));
  dvAblaqBox(0,cz0,w0,d0,y0,h0,{
   front:[{x:0,w:1.48,h:2.25,door:true}],
   back:[{x:0,w:2.2,h:2.4,door:true,open:true,leaf:false}]
  });
  dvGableRoof(0,cz0,w0,d0,y0+h0,1.65,{mk:'slate'});
  /* timber launching slipway sloping north (-z) toward the river + lashed cypress log raft! */
  dvNoCut(()=>svNoWalk(()=>{
   for(const sx of [-1.2,1.2])beam('wood',[sx,.18,-2.1],[sx,-1.15,-5.4],.14,P('wood'));
   for(let i=-2;i<=2;i++)dvCypressLog([i*.42,-.42,-2.6],[i*.42,-1.02,-5.0],.16);
  }));
  dvFurn([
   ['dv_common_table',-2.4,y0,cz0-.8,0],
   ['dv_pulley_basket',2.5,y0,cz0-1.2,0],
   ['dv_shelves_provisions',-3.1,y0,cz0+1.6,PI/2],
   ['dv_brazier_copper',2.4,y0,cz0+1.6,0]
  ]);
 }});

/* 42. Flumi-Bridzi Confluence Toll & Truce-Clerk House */
defBuilding({key:'dv-customs-bridgehead',name:'Sabazho-Bridzi Confluence Toll & Truce-Clerk House',seed:7406,cls:'building',w:12.4,d:10.6,h:13.8,cut:true,
 tags:{types:['civic','infrastructure'],wealth:'middle',style:'flume',role:'customs house',job:'customs'},
 note:'Neutral confluence toll-house at Flumi-Bridzi where clerks register floating flume-logs, tin ingots, and nephrite slabs under a 12-pleat verdigris gumbat.',
 build(){
  const w0=9.2,d0=7.6,y0=.32,h0=3.85;
  dvRootSkirt(0,0,w0,d0,5.4,{mk:'colBasalt',plinthH:y0+.22});
  dvFloorRect(0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,0,w0,d0,y0,h0,{
   front:[{x:0,w:1.38,h:2.28,door:true},{x:-2.6,w:.88,y:.95,h:1.2},{x:2.6,w:.88,y:.95,h:1.2}],
   back:[{x:0,w:1.15,h:2.15,door:true,open:true,leaf:false}]
  });
  dvExtStair(0,d0/2+.95,0,y0,PI,1.45,.95);
  dvRoofTerrace(0,0,w0+.14,d0+.14,y0+h0,{});
  dvGumbat(0,0,1.72,y0+h0,2.05,2.65,{mk:'verdigris',windows:4});
  dvFurn([
   ['dv_scale_weregild',-2.2,y0,-.8,0],
   ['dv_scriptorium_lectern',2.2,y0,-1.8,0],
   ['dv_chest_jade_inlay',-2.8,y0,1.8,PI/2],
   ['dv_carved_chair',2.2,y0,-.8,PI],
   ['dv_brazier_copper',2.4,y0,1.8,0]
  ]);
 }});

/* 43. Mountain Torrent Trout-Weir & Basket-Trap Hut */
defBuilding({key:'dv-fishweir-trout',name:'Kalmakhi-Fatsa Torrent Trout-Weir & Basket-Trap Hut',seed:7407,cls:'building',w:11.4,d:11.6,h:9.4,cut:true,
 tags:{types:['farm','infrastructure'],wealth:'poor',style:'flume',role:'trout-weir hut',job:'fishing'},
 note:'Streamside cobble lodge and timber river-walk setting conical wicker funnel-traps for spotted mountain trout in the Crookwash rapids.',
 build(){
  const w0=7.2,d0=5.8,cz0=1.5,y0=.24,h0=3.25;
  dvRootSkirt(0,cz0,w0,d0,5.2,{mk:'rivercobble',plinthH:y0+.2});
  dvFloorRect(0,cz0,w0-.08,d0-.08,y0,'floor',P('floor'));
  dvAblaqBox(0,cz0,w0,d0,y0,h0,{
   front:[{x:0,w:1.1,h:2.05,door:true}],back:[{x:0,w:1.1,h:2.05,door:true,open:true,leaf:false}]
  });
  dvGableRoof(0,cz0,w0,d0,y0+h0,1.45,{mk:'slate'});
  /* timber weir walkway & conical wicker fish-traps over river (-z) */
  dvNoCut(()=>{
   dvFloorRect(0,-3.2,5.6,2.2,.2,'planks',P('planks'));
   svNoWalk(()=>{
    for(const sx of [-2.4,0,2.4])cyl('cypress',sx,-3.6,-3.2,.12,3.75,P('cypress'),8);
    for(const sx of [-1.4,1.4])cone('planks',sx,-.95,-4.4,.38,1.25,P('planks'),8);
   });
  });
  dvFurn([
   ['dv_poor_pallet',-2.1,y0,cz0-.9,0],
   ['dv_brazier_copper',1.8,y0,cz0-.6,0],
   ['dv_apricot_drying_tray',1.4,y0,cz0+1.4,0],
   ['dv_shelves_provisions',-2.4,y0,cz0+1.4,PI/2]
  ]);
 }});

/* 44. Flumi-Bridzi Covered Ablaq Market Bazaar */
defBuilding({key:'dv-market-confluence',name:'Flumi-Bazari Covered Ablaq Confluence Market',seed:7408,cls:'building',w:16.8,d:14.2,h:15.2,cut:true,
 tags:{types:['market','shop'],wealth:'middle',style:'flume',role:'market hall',job:'trading',market:true},
 note:'Polychrome open-arcaded market hall at the neutral Flumi-Bridzi confluence, crowned by a 12-pleat verdigris gumbat over nephrite, tin, kilim, and brandy stalls.',
 build(){
  const w0=13.2,d0=10.6,y0=.32,h0=4.15;
  dvRootSkirt(0,0,w0,d0,5.4,{mk:'colBasalt',plinthH:y0+.24});
  dvFloorRect(0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,0,w0,d0,y0,h0,{
   front:[{x:-3.2,w:1.85,h:2.55,door:true},{x:0,w:2.05,h:2.65,door:true,open:true,leaf:false},{x:3.2,w:1.85,h:2.55,door:true,open:true,leaf:false}],
   back:[{x:0,w:2.05,h:2.65,door:true,open:true,leaf:false}],
   left:[{x:0,w:1.75,h:2.45,door:true,open:true,leaf:false}],right:[{x:0,w:1.75,h:2.45,door:true,open:true,leaf:false}]
  });
  dvExtStair(0,d0/2+.95,0,y0,PI,2.2,.95);
  dvRoofTerrace(0,0,w0+.18,d0+.18,y0+h0,{});
  dvGumbat(0,0,2.15,y0+h0,2.35,3.15,{mk:'verdigris',windows:8});
  dvFurn([
   ['dv_market_stall_jade',-3.6,y0,-2.1,0],
   ['dv_market_stall_jade',3.6,y0,-2.1,0],
   ['dv_market_stall_jade',-3.6,y0,1.9,PI],
   ['dv_market_stall_jade',3.6,y0,1.9,PI],
   ['dv_scale_weregild',0,y0,0,0],
   ['dv_qvevri_rack',0,y0,-3.8,0]
  ]);
 }});

/* 45. Nephrite Lapidary & Copper-Chandler Shophouse */
defBuilding({key:'dv-shophouse-lapidary',name:'Dzedi-Dukani Nephrite Lapidary & Copper Shophouse',seed:7409,cls:'building',w:11.8,d:10.8,h:12.6,cut:true,
 tags:{types:['shop','dwelling-single'],wealth:'middle',style:'flume',role:'lapidary shophouse',job:'trading'},
 note:'Two-tier merchant shophouse with golden-skarn ground-floor shop arch, exterior stair, and sunny stepped-back upper dwelling.',
 build(){
  const w0=8.6,d0=7.6,y0=.3,h0=3.6;
  dvRootSkirt(0,0,w0,d0,5.2,{mk:'colBasalt',plinthH:y0+.22});
  dvFloorRect(0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,0,w0,d0,y0,h0,{
   front:[{x:-1.1,w:1.55,h:2.28,door:true},{x:1.9,w:1.15,y:.8,h:1.25}],
   left:[{x:0,w:.82,y:.95,h:1.15}]
  });
  dvExtStair(-1.1,d0/2+.9,0,y0,PI,1.5,.9);
  const y1=y0+h0;
  dvRoofTerrace(0,1.75,w0+.14,3.8,y1,{openBack:true});
  dvFloorRect(0,-1.6,7.8,3.9,y1+.02,'floor',P('floor'));
  dvAblaqBox(0,-1.6,7.8,3.9,y1+.02,3.1,{front:[{x:0,w:1.0,h:2.0,door:true},{x:-2.2,w:.76,y:.85,h:1.1},{x:2.2,w:.76,y:.85,h:1.1}]});
  dvGableRoof(0,-1.6,7.8,3.9,y1+3.12,1.55,{mk:'slate'});
  dvFurn([
   ['dv_market_stall_jade',0,y0,.8,0],
   ['dv_scale_weregild',2.4,y0,-.8,-PI/2],
   ['dv_shelves_provisions',-3.1,y0,-2.2,0],
   ['dv_chest_jade_inlay',2.6,y0,-2.4,0],
   ['dv_common_alcove_bed',-1.8,y1+.02,-2.2,0]
  ]);
 }});

/* 46. Slate-Baffled Gorge Grain & Dried-Apricot Store */
defBuilding({key:'dv-granary-stilted',name:'Beghli-Sakli Slate-Baffled Grain & Dried-Apricot Granary',seed:7410,cls:'building',w:10.8,d:9.8,h:11.6,cut:true,
 tags:{types:['farm','infrastructure'],wealth:'middle',style:'flume',role:'granary',job:'milling'},
 note:'Ventilated red-cypress & apricot-tuff granary lifted on basalt piers with wide slate rat-baffle caps, storing mountain barley and dried apricots.',
 build(){
  const w0=7.6,d0=6.6,yG=1.75,hG=3.65;
  dvRootSkirt(0,0,w0-.4,d0-.4,5.0,{mk:'colBasalt',plinthH:.32});
  /* 6 basalt stilts + wide projecting slate rat-baffle slabs cleanly below granary floor */
  dvNoCut(()=>svNoWalk(()=>{
   for(const sx of [-2.8,0,2.8])for(const sz of [-2.2,2.2]){
    box('basalt',sx,.006,sz,.68,1.38,.68,P('basalt'));
    box('slate',sx,1.392,sz,1.18,.14,1.18,P('slate'));
   }
  }));
  dvFloorRect(0,0,w0-.08,d0-.08,yG,'floor',P('floor'));
  dvAblaqBox(0,0,w0,d0,yG,hG,{
   front:[{x:0,w:1.15,h:2.1,door:true}],left:[{x:0,w:.68,y:1.6,h:.85}],right:[{x:0,w:.68,y:1.6,h:.85}]
  });
  dvExtStair(0,d0/2+1.65,0,yG,PI,1.2,1.65);
  dvGableRoof(0,0,w0,d0,yG+hG,1.75,{mk:'slate'});
  dvFurn([
   ['dv_apricot_drying_tray',-1.9,yG,-1.4,0],
   ['dv_apricot_drying_tray',1.9,yG,-1.4,0],
   ['dv_shelves_provisions',-2.4,yG,1.4,PI/2],
   ['dv_scale_weregild',1.8,yG,1.2,-PI/2]
  ]);
 }});

/* 47. Confluence Timber, Ingot & Qvevri Bond-Warehouse */
defBuilding({key:'dv-warehouse-flume',name:'Satsavi-Flumi Timber, Ingot & Qvevri Bond-Warehouse',seed:7411,cls:'building',w:15.4,d:12.6,h:12.4,cut:true,
 tags:{types:['infrastructure','industry'],wealth:'middle',style:'flume',role:'warehouse',job:'warehousing'},
 note:'Heavy twin-arch basalt & apricot-tuff bond-storehouse with overhead pulley-hoist storing sawn cypress baulks, tin-bronze ingots, and sealed qvevri.',
 build(){
  const w0=12.0,d0=9.0,y0=.28,h0=4.25;
  dvRootSkirt(0,0,w0,d0,5.4,{mk:'colBasalt',plinthH:y0+.24});
  dvFloorRect(0,0,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(0,0,w0,d0,y0,h0,{
   front:[{x:-2.4,w:1.85,h:2.55,door:true},{x:2.4,w:1.85,h:2.55,door:true,open:true,leaf:false}],
   left:[{x:0,w:.85,y:1.6,h:1.0}],right:[{x:0,w:.85,y:1.6,h:1.0}]
  });
  dvGableRoof(0,0,w0,d0,y0+h0,2.05,{mk:'slate'});
  dvPulleyRig(2.4,y0+h0-.35,d0/2,0,1.4,2.1);
  dvFurn([
   ['dv_qvevri_rack',-3.8,y0,-2.6,0],
   ['dv_qvevri_rack',3.8,y0,-2.6,0],
   ['dv_pulley_basket',-3.6,y0,1.6,0],
   ['dv_chest_jade_inlay',0,y0,-2.8,0],
   ['dv_scale_weregild',3.2,y0,1.4,-PI/2]
  ]);
 }});

/* 48. Terraced Apricot, Walnut & Barley Farmstead */
defBuilding({key:'dv-orchard-terrace',name:'Tsiran-Baghi Terraced Apricot & Barley Farmstead',seed:7412,cls:'building',w:16.2,d:13.8,h:10.2,cut:true,
 front:{x:-3.8,z:4.6,yaw:0},
 tags:{types:['farm','dwelling-single'],wealth:'middle',style:'flume',role:'terrace farmstead',job:'farming'},
 note:'Grower sakli with flat slate apricot-drying roof-plaza beside stepped drystone mountain crop-terraces watered by a timber snowmelt leat.',
 build(){
  const cx=-3.8,cz=1.2,w0=7.2,d0=6.4,y0=.28,h0=3.45;
  dvRootSkirt(cx,cz,w0,d0,5.2,{mk:'cobble',plinthH:y0+.22});
  dvFloorRect(cx,cz,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(cx,cz,w0,d0,y0,h0,{
   front:[{x:0,w:1.18,h:2.12,door:true},{x:-2.0,w:.8,y:.9,h:1.1}],
   right:[{x:0,w:.82,y:.9,h:1.1}]
  });
  dvRoofTerrace(cx,cz,w0+.14,d0+.14,y0+h0,{});
  /* stepped drystone crop-terraces at +x */
  dvCropTerrace(3.6,-.6,6.8,8.6,0,3);
  dvFurnRoom(cx,cz,w0-.85,d0-.85,y0,'middle');
  dvNoCut(()=>FURNISH('dv_apricot_drying_tray',cx,y0+h0+.006,cz,0));
 }});

/* 49. Vardzieti Mountain Sheep, Crag-Goat & Cousin-Mount Byre */
defBuilding({key:'dv-byre-mountain',name:'Gomi-Dzagh Mountain Sheep, Goat & Cousin-Mount Byre',seed:7413,cls:'building',w:15.4,d:13.2,h:9.8,cut:true,
 front:{x:-2.8,z:4.4,yaw:0},
 tags:{types:['farm'],wealth:'middle',style:'flume',role:'mountain byre',job:'herding'},
 note:'Warm basalt-and-cypress winter fold and fenced paddock sheltering Golden-Fleece mountain sheep, crag goats, and a royal cousin charger.',
 build(){
  const cx=-2.8,cz=.8,w0=8.2,d0=6.8,y0=.24,h0=3.45;
  dvRootSkirt(cx,cz,w0,d0,5.0,{mk:'cobble',plinthH:y0+.2});
  dvFloorRect(cx,cz,w0-.08,d0-.08,y0,'flagstone',P('flagstone'));
  dvAblaqBox(cx,cz,w0,d0,y0,h0,{
   front:[{x:0,w:1.45,h:2.2,door:true}],right:[{x:0,w:1.35,h:2.1,door:true,open:true,leaf:false}]
  });
  dvGableRoof(cx,cz,w0,d0,y0+h0,1.65,{mk:'slate'});
  /* fenced stone-and-cypress livestock yard at +x with live KratorFauna animals! */
  dvNoCut(()=>svNoWalk(()=>{
   const fCol=P('cypress');
   box('earth',3.8,.006,.8,5.4,.05,6.4,P('earth'));
   for(const sx of [1.4,6.2])for(const sz of [-2.2,0,2.2,3.8])cyl('cypress',sx,0,sz,.08,1.15,fCol,8);
   beam('cypress',[1.48,.95,3.8],[6.12,.95,3.8],.07,fCol);
   beam('cypress',[6.2,.95,-2.12],[6.2,.95,3.72],.07,fCol);
   beam('cypress',[1.48,.95,-2.2],[6.12,.95,-2.2],.07,fCol);
  }));
  place('dvb-sheep',3.2,0,1.8,.4,{sub:'flume'});
  place('dvb-goat',4.8,0,-.6,-1.1,{sub:'flume'});
  dvFurn([
   ['dv_sluice_fleece_trough',cx,y0,cz-1.8,0],
   ['dv_shelves_provisions',cx-2.8,y0,cz+.8,PI/2],
   ['dv_pulley_basket',cx+2.4,y0,cz+1.6,0],
   ['dv_brazier_copper',cx-1.8,y0,cz+1.8,0]
  ]);
 }});
