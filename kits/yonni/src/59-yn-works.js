// prefix: ynw
// ================================================================= VOTH-CENSUS TRADES PART II & WORKS
// Umbrella Rain-Canopy Market, Shophouse, Granary, Rotating Squall-Turbine Mill, Warehouse, Terraced Farmstead,
// Sheep & Goat Byre, Scoured-Hills Mine (linked to kits/resources), Granite Quarry, and Storm-Beacon Pharos.

/* 11. Umbrella Rain-Canopy Market Rotunda (8dac4161, c1eecdde) */
defBuilding({key:'yn-market',name:'Ren-Mark Umbrella Rain-Canopy Market',seed:7311,cls:'building',w:17.6,d:17.6,h:13.6,cut:true,
 tags:{types:['market','shop'],wealth:'middle',style:'freestanding',role:'market hall',job:'trading',market:true},
 note:'Open-arcaded circular market pavilion sheltered under a broad bronze-ribbed slate & verdigris rain-umbrella, packed with stalls and balance scales.',
 build(){
  const r=6.2,y0=.22;
  ynRootSkirt(0,0,r,4.8,{mk:'cobble',plinthH:y0+.26});
  ynFloorDisc(0,0,r-.05,y0,'flagstone',P('flagstone'),{seg:24});
  /* outer ring of 12 stone & ironwood piers carrying the broad oversailing market umbrella */
  ynNoCut(()=>{
   for(let i=0;i<12;i++){
    const a=i/12*TAU,px=Math.cos(a)*(r-.45),pz=Math.sin(a)*(r-.45);
    cyl('cobble',px,y0,pz,.34,.85,P('cobble'),10);
    cyl('ironwood',px,y0+.85,pz,.15,2.95,P('ironwood'),10);
   }
   sector('ashlar',0,0,r-.68,r-.22,0,TAU,y0+3.8,y0+4.15,P('ashlar'),24);
  });
  /* central masonry market drum + grand oversailing canopy */
  cyl('sealime',0,y0,0,1.25,4.15,P('sealime'),14);
  ynCanopy(0,0,1.25,r+1.35,y0+4.15,3.55,{mk:'verdigris',ribs:12,bell:.24,finialScale:1.15});
  door(0,y0,r-.2,0,2.2,3.2);
  for(let i=0;i<4;i++){
   const a=i*PI/2+PI/4,sx=Math.cos(a)*3.55,sz=Math.sin(a)*3.55;
   FURNISH('yonni_trade_stall',sx,y0,sz,ynFace(sx,sz,0,0));
  }
  FURNISH('yonni_works_weigh_scale',0,y0,2.45,0);
  FURNISH('yonni_trade_barrels',-2.4,y0,0,PI/2);
  FURNISH('yonni_common_brazier',2.4,y0,0,0);
 }});

/* 12. Amber & Tin-Chandler Shophouse */
defBuilding({key:'yn-shophouse',name:'Tred-Tur Amber & Tin-Chandler Shophouse',seed:7312,cls:'building',w:11.8,d:11.8,h:14.4,cut:true,
 tags:{types:['shop','dwelling-single'],wealth:'middle',style:'freestanding',role:'shophouse',job:'trading'},
 note:'Ground-floor arched shopfront under a deep crescent rain-visor with exterior spiral stone stair to the merchant twins upper apartment.',
 build(){
  yndTower({r:3.35,baseH:2.4,shaftH:2.5,upperH:2.35,upperR:3.85,arcade:false,roofMk:'slate',roofOver:.92,roofRise:2.65,ribs:8,tier:'middle',
   furn:false,furnUpper:false,rootD:5.2,
   stair:{a0:PI*.65,sweep:PI*.88,y1:5.22},
   opens0:[{a:PI/2,w:1.55,h:2.18,door:true,visor:true,visorOut:.85},{a:PI*.22,w:1.05,y:.8,h:1.2}],
   opens1:[{a:PI*.35,w:.72,y:.7,h:1.1},{a:-PI*.35,w:.72,y:.7,h:1.1}],
   opens2:[{a:PI*1.53,w:.92,h:1.92,door:true},{a:PI/2,w:.8,y:.8,h:1.2},{a:0,w:.75,y:.8,h:1.2}]});
  ynFurn([
   ['yonni_trade_stall',0,.16,1.1,0],
   ['yonni_works_weigh_scale',1.55,.16,.4,-PI/2],
   ['yonni_common_shelves',0,.16,-2.25,0],
   ['yonni_common_chest',-1.85,.16,-.3,PI/2],
   ['yonni_common_twin_alcove',0,5.22,-1.65,0],
   ['yonni_common_brazier',0,5.22,.85,0]
  ]);
 }});

/* 13. Raised Conical-Cap Granary Drum */
defBuilding({key:'yn-granary',name:'Gren-Tur Rat-Baffled Conical Granary',seed:7313,cls:'building',w:10.6,d:10.6,h:12.8,cut:true,
 tags:{types:['farm','infrastructure'],wealth:'middle',style:'freestanding',role:'granary',job:'milling'},
 note:'Sealed sea-lime grain cylinder lifted above a projecting slate rat-baffle ring on a battered cobble base, storing hill-oats and barley.',
 build(){
  const rBase=2.65,rGrain=3.15,cz=-.3;
  ynRootSkirt(0,cz,rBase,4.8,{mk:'cobble',plinthH:.4});
  cyl('cobble',0,0,cz,rBase,1.65,P('cobble'),20);
  /* wide projecting ashlar & bronze rat-baffle disc at y = 1.65..1.83, with granary floor disc cleanly above at 1.98 */
  cyl('ashlar',0,1.65,cz,rGrain+.28,.18,P('ashlar'),22);
  const yG=1.98;
  ynFloorDisc(0,cz,rGrain-.05,yG,'floor',P('floor'));
  ynDrumWall(0,cz,rGrain-.34,rGrain,yG,4.2,'sealime',P('sealime'),[
   {a:PI/2,w:1.05,h:2.0,door:true,visor:true},{a:-PI/2,w:.55,y:2.6,h:.85}
  ]);
  ynNoCut(()=>svStair(0,cz+rGrain+1.55,0,yG,PI,{style:'solid',w:1.05,mk:'flagstone',col:P('flagstone'),run:1.55}));
  ynCanopy(0,cz,rGrain,rGrain+.95,yG+4.2,2.95,{mk:'slate',ribs:8});
  ynFurn([
   ['yonni_trade_bin',0,yG,cz-1.85,0],
   ['yonni_trade_bin',-1.75,yG,cz,PI/2],
   ['yonni_trade_bin',1.75,yG,cz,-PI/2],
   ['yonni_works_weigh_scale',0,yG,cz+.65,0]
  ]);
 }});

/* 14. Coastal Squall-Turbine & Mill-Tower (Animated rotating rotor!) */
defBuilding({key:'yn-watermill',name:'Wind-Mil Coastal Squall-Turbine & Mill',seed:7314,cls:'building',w:12.6,d:12.6,h:17.2,cut:true,
 tags:{types:['industry','farm'],wealth:'middle',style:'freestanding',role:'mill',job:'milling'},
 note:'Battered granite & sea-lime mill-tower crowned by a vertical-axis bronze-and-sailcloth squall-turbine rotor driving coastal millstones.',
 build(){
  const r=3.55,y0=.22;
  ynRootSkirt(0,0,r,5.2,{mk:'granite',plinthH:y0+.26});
  ynFloorDisc(0,0,r-.05,y0,'flagstone',P('flagstone'));
  ynDrumWall(0,0,r-.36,r,y0,4.8,'cobble',P('cobble'),[
   {a:PI/2,w:1.3,h:2.15,door:true,visor:true},{a:0,w:.68,y:1.8,h:1.15},{a:PI,w:.68,y:1.8,h:1.15}
  ]);
  ynCanopy(0,0,r,r+.92,y0+4.8,2.15,{mk:'slate',ribs:8,rHub:.55,finial:false});
  /* central ironwood drive-shaft + animated vertical-axis 6-vane coastal squall rotor */
  const yR=y0+7.05,iwCol=P('ironwood'),bzCol=P('bronze'),slCol=P('sail');
  cyl('ironwood',0,y0+.82,0,.18,6.2,iwCol,10);
  cyl('granite',0,y0+.005,0,.95,.47,P('granite'),16);
  cyl('ashlar',0,y0+.48,0,.88,.33,P('ashlar'),16);
  ynSpinner(0,yR,0,.95,()=>{
   cyl('bronze',0,0,0,.32,3.4,bzCol,12);
   cone('verdigris',0,3.405,0,.42,.55,P('verdigris'),12);
   for(let i=0;i<6;i++){
    const a=i/6*TAU;
    W(0,0,0,a,()=>{
     beam('ironwood',[0,.35,.34],[0,.35,2.39],.07,iwCol);
     beam('ironwood',[0,2.95,.34],[0,2.95,2.39],.07,iwCol);
     cyl('bronze',0,.28,2.45,.042,2.74,bzCol,6);
     quad('sail',.08,1.65,1.42,1.9,2.42,slCol,PI/2-.18);
    });
   }
  });
  ynFurn([
   ['yonni_trade_bin',-1.95,y0,-1.25,PI*.3],
   ['yonni_trade_bin',1.95,y0,-1.25,-PI*.3],
   ['yonni_works_weigh_scale',-1.85,y0,1.15,PI/2],
   ['yonni_trade_barrels',1.85,y0,1.15,-PI/2]
  ]);
 }});

/* 15. Vaulted Coastal Bond-Warehouse */
defBuilding({key:'yn-warehouse',name:'Stor-Dom Vaulted Coastal Bond-Store',seed:7315,cls:'building',w:15.4,d:14.2,h:13.2,cut:true,
 tags:{types:['infrastructure','industry'],wealth:'middle',style:'freestanding',role:'warehouse',job:'warehousing'},
 note:'Heavy twin-portal cobble & sea-lime bond-storehouse with bronze hoist beam, salt-fish casks, tin ingots, and wool bales.',
 build(){
  const r=4.65,y0=.24;
  ynRootSkirt(0,0,r,5.2,{mk:'cobble',plinthH:y0+.28});
  ynFloorDisc(0,0,r-.06,y0,'flagstone',P('flagstone'),{seg:20});
  ynDrumWall(0,0,r-.4,r,y0,4.5,'cobble',P('cobble'),[
   {a:PI/2,w:1.85,h:2.45,door:true,visor:true,visorOut:.85},
   {a:0,w:1.45,h:2.2,door:true,visor:true},{a:PI,w:.72,y:2.2,h:1.05},{a:-PI/2,w:.72,y:2.2,h:1.05}
  ]);
  /* projecting ironwood hoist beam over the front cargo arch */
  ynNoCut(()=>{
   beam('ironwood',[0,y0+3.95,r-.2],[0,y0+3.95,r+1.1],.16,P('ironwood'));
   sagRope('rope',[0,y0+3.9,r+.95],[0,y0+1.8,r+.95],.01,.025,P('rope'),2);
  });
  ynCanopy(0,0,r,r+1.05,y0+4.5,2.95,{mk:'slate',ribs:12});
  ynFurn([
   ['yonni_trade_barrels',-2.45,y0,-1.85,PI*.25],
   ['yonni_trade_barrels',2.45,y0,-1.85,-PI*.25],
   ['yonni_trade_bin',0,y0,-3.1,0],
   ['yonni_common_chest',-2.6,y0,.85,PI/2],
   ['yonni_common_shelves',2.6,y0,.85,-PI/2],
   ['yonni_works_weigh_scale',0,y0,1.35,0]
  ]);
 }});

/* 16. Terraced Wet-Hill Farmstead (02f9f0ab symmetric curved stone crop terraces, cleanly centered on (0,0)!) */
defBuilding({key:'yn-farmstead',name:'Teras-Farm Wet-Hill Terraced Farmstead',seed:7316,cls:'building',w:16.8,d:13.8,h:11.6,cut:true,
 tags:{types:['farm','dwelling-single'],wealth:'middle',style:'freestanding',role:'farmstead',job:'farming'},
 note:'Round sea-lime farmhouse centered above three symmetric curved coastal stone crop-terraces (02f9f0ab) planted with hill-oats and sea-kale.',
 build(){
  yndTower({cx:0,cz:-2.15,r:3.05,baseH:1.95,shaftH:2.35,roofMk:'shingle',roofOver:.88,roofRise:2.35,ribs:8,tier:'middle',rootD:5.0,
   opens0:[{a:PI/2,w:1.08,h:2.02,door:true,visor:true}]});
  /* symmetric curved stepped stone crop-terraces sweeping across the front slope */
  ynCropTerrace(0,-2.15,4.1,8.25,PI*.12,PI*.88,0,3,{stepH:.42});
  place('ynb-hill-oat',-2.8,3.4,0);
  place('ynb-sea-kale',2.8,3.4,.5);
 }});

/* 17. Coastal Sheep & Goat Byre (with live kits/fauna livestock) */
defBuilding({key:'yn-byre-stock',name:'Ship-Bir Coastal Sheep & Goat Byre',seed:7317,cls:'building',w:16.8,d:13.8,h:9.8,cut:true,
 tags:{types:['farm'],wealth:'poor',style:'freestanding',role:'byre',job:'dairy'},
 note:'Turf-roofed cobble dairy byre & curved dry-stone coastal sheepfold housing live sheep, goats, milk churn, and fodder troughs.',
 build(){
  const r=3.25,y0=.16,bx=-3.0,bz=-.62,fx=3.3,fz=.92;
  ynRootSkirt(bx,bz,r,4.6,{mk:'cobble',plinthH:y0+.22});
  ynFloorDisc(bx,bz,r-.05,y0,'flagstone',P('flagstone'));
  ynDrumWall(bx,bz,r-.34,r,y0,2.85,'cobble',P('cobble'),[
   {a:PI/2,w:1.45,h:2.05,door:true,visor:true},{a:0,w:1.25,h:1.95,door:true,open:true}
  ]);
  ynCanopy(bx,bz,r,r+.9,y0+2.85,2.2,{mk:'turf',ribs:0,finial:false});
  /* curved dry-stone walled fold on +x with live sheep & goat */
  ynNoCut(()=>{
   sector('cobble',fx,fz,3.45,3.85,-PI*.85,PI*.68,.006,1.05,P('cobble'),14);
   sector('earth',fx,fz,.05,3.42,0,TAU,.014,.06,P('earth'),14);
  });
  place('ynb-sheep',fx-.6,fz+.4,.4,{sub:'freestanding'});
  place('ynb-goat',fx+.95,fz-.6,2.1,{sub:'freestanding'});
  FURNISH('yonni_trade_trough',fx-.5,.065,fz-1.85,0,{setting:'outdoor'});
  ynFurn([
   ['yonni_works_churn',bx,y0,bz-1.55,0],
   ['yonni_trade_barrels',bx-1.75,y0,bz,PI/2],
   ['yonni_common_shelves',bx,y0,bz+1.05,PI],
   ['yonni_common_stool',bx+1.0,y0,bz-.9,0]
  ]);
 }});

/* 18. Scoured-Hills Mine & Sorting Drum (works nearest kits/resources node via resSource!) */
defBuilding({key:'yn-mine',name:'Or-Adit Scoured-Hills Mine & Sorting Drum',seed:7318,cls:'building',w:17.6,d:13.8,h:10.8,cut:true,
 tags:{types:['industry'],wealth:'poor',style:'freestanding',role:'mine',job:'mining'},
 note:'Timbered granite adit, roofed windlass shaft, and round sorting shed working the nearest kits/resources iron, tin, coal, or saltpeter node.',
 build(o){
  ynAdit(-1.35,-2.35,0);
  ynWindlass(4.65,-1.65,0);
  /* round sorting & assay drum on the forecourt */
  const cx=-3.25,cz=2.15;
  ynRootSkirt(cx,cz,2.55,4.5,{mk:'ironstone',plinthH:.36});
  ynFloorDisc(cx,cz,2.5,.16,'flagstone',P('flagstone'));
  ynDrumWall(cx,cz,2.2,2.55,.16,2.85,'ironstone',P('ironstone'),[
   {a:PI/2,w:1.25,h:2.0,door:true,visor:true},{a:0,w:1.15,h:1.9,door:true,open:true}
  ]);
  ynCanopy(cx,cz,2.55,3.35,3.01,2.05,{mk:'slate',ribs:6});
  ynOreHeap(2.0,2.2,(o&&o.metal)||'iron',1.05);
  ynOreHeap(5.75,2.0,'tin',.8);
  ynFurn([
   ['yonni_trade_workbench',cx,.16,cz-1.1,0],
   ['yonni_works_weigh_scale',cx+1.05,.16,cz,-PI/2],
   ['yonni_common_chest',cx-1.15,.16,cz,PI/2],
   ['yonni_common_brazier',cx,.16,cz+.9,0]
  ]);
 }});

/* 19. Coastal Granite & Cobble Quarry */
defBuilding({key:'yn-quarry',name:'Gran-Kwori Coastal Granite & Cobble Quarry',seed:7319,cls:'building',w:16.8,d:13.6,h:10.6,cut:true,
 tags:{types:['industry'],wealth:'poor',style:'freestanding',role:'quarry',job:'quarrying'},
 note:'Stepped coastal granite cut-face, bronze-pulley shear-legs hoist, dressed ashlar blocks, and stonecutters round-shelter.',
 build(){
  const grCol=P('granite'),asCol=P('ashlar'),iwCol=P('ironwood');
  ynNoCut(()=>{
   /* stepped granite quarry face at -z */
   for(let i=0;i<5;i++){
    const xx=lerp(-6.2,.8,i/4),hh=3.2+(i%2)*.95;
    box('granite',xx,.008*i,-3.4,1.65,hh,2.4,grCol);
    box('ashlar',xx*.8-.5,.006,-.7,.82,.55,.62,asCol,i*.3);
   }
   /* ironwood shear-legs tripod crane */
   for(let k=0;k<3;k++){
    const a=k/3*TAU;
    pole('ironwood',[-2.2+Math.cos(a)*1.35,.01,.8+Math.sin(a)*1.35],[-2.2,4.2,.8],.075,iwCol,6);
   }
   sagRope('rope',[-2.2,4.1,.8],[-2.2,.85,.8],.01,.025,P('rope'),2);
   box('ashlar',-2.2,.3,.8,.78,.52,.62,asCol);
  });
  /* stonecutters shelter drum on +x */
  const cx=3.68,cz=1.25;
  ynRootSkirt(cx,cz,2.55,4.4,{mk:'cobble',plinthH:.36});
  ynFloorDisc(cx,cz,2.5,.16,'flagstone',P('flagstone'));
  ynDrumWall(cx,cz,2.2,2.55,.16,2.85,'cobble',P('cobble'),[
   {a:PI/2,w:1.2,h:2.0,door:true,visor:true},{a:PI,w:1.1,h:1.9,door:true,open:true}
  ]);
  ynCanopy(cx,cz,2.55,3.35,3.01,2.0,{mk:'slate',ribs:6});
  ynFurn([
   ['yonni_trade_workbench',cx,.16,cz-1.15,0],
   ['yonni_trade_anvil',cx-.95,.16,cz+.2,0],
   ['yonni_common_chest',cx+1.15,.16,cz+.2,-PI/2],
   ['yonni_common_brazier',cx,.16,cz+1.05,0]
  ]);
 }});

/* 20. Coastal Pharos & Storm-Beacon */
defBuilding({key:'yn-beacon',name:'Si-Bekon Coastal Pharos & Storm-Beacon',seed:7320,cls:'building',w:11.4,d:11.4,h:21.4,cut:true,
 tags:{types:['infrastructure'],wealth:'middle',style:'freestanding',role:'lighthouse'},
 note:'Tall battered coastal-granite & sea-lime pharos crowned by a bronze-ribbed storm-lantern cage and blazing sea-fire.',
 build(){
  const r=3.1,y0=.26;
  ynRootSkirt(0,0,r,6.4,{mk:'granite',plinthH:y0+.32});
  ynFloorDisc(0,0,r-.05,y0,'flagstone',P('flagstone'));
  ynDrumWall(0,0,r-.4,r,y0,4.2,'granite',P('granite'),[{a:PI/2,w:1.15,h:2.15,door:true,visor:true}]);
  ynDripSkirt(0,0,r,y0+4.2,.42,.22,'slate',P('slate'));
  ynDrumWall(0,0,r-.48,r-.12,y0+4.2,6.4,'sealime',P('sealime'),[
   {a:PI/2,w:.58,y:1.6,h:1.25},{a:0,w:.58,y:3.6,h:1.25},{a:PI,w:.58,y:3.6,h:1.25},{a:-PI/2,w:.58,y:1.6,h:1.25}
  ]);
  const yB=y0+10.6;
  ynCorbelFins(0,0,r-.12,3.55,yB-1.4,yB,12,'corbel',P('corbel'),{bronzeTip:true});
  ynFloorDisc(0,0,3.5,yB+.16,'flagstone',P('flagstone'));
  ynSpiralStair(0,0,r+.04,0,yB+.16,PI*.6,PI*1.15);
  /* bronze storm-beacon lantern cage + fire */
  ynNoCut(()=>{
   ynArcadeRing(0,0,1.45,1.82,yB+.16,2.65,8,{paraH:.55,paraMk:'ashlar',colMk:'bronze',spandrelMk:'bronze',archH:.42,colR:.08});
   cyl('iron',0,yB+.72,0,.78,.42,P('iron'),12);
   sph('glow',0,yB+1.38,0,.52,0xffa638,1.25,10);
   haloAt(0,yB+1.5,0,0xffa638,true);
   smokeAt(0,yB+3.8,0,{r:.42});
   ynCanopy(0,0,1.82,2.55,yB+2.81,2.25,{mk:'verdigris',ribs:8,finialScale:1.05});
  });
  ynFurn([
   ['yonni_poor_twin_pallet',0,y0,-1.45,0],
   ['yonni_trade_barrels',-1.75,y0,.35,PI/2],
   ['yonni_common_chest',1.75,y0,.35,-PI/2],
   ['yonni_common_brazier',0,y0,.95,0]
  ]);
 }});
