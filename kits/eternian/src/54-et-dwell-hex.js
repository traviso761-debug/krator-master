// prefix: et
// ================================================================= THE HEXAGONAL HOUSES (P6; the owner, 2026-10-20): the Sanctum's
// six-fold plan taken up by the town at every tier. The poor's one-room hut of silt under reed, the common town's
// two-storey house of block and lime, the rich man's hexagonal house in its walled garden under celadon.

/* the hexagonal hut: one room of silt brick under a reed cone, a painted face over the door */
defBuilding({key:'et_hex_hut',name:'Hexagonal hut',seed:7009,cut:true,w:8,d:8,h:6,budget:30000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'poor'},
 note:'one hexagonal room of silt brick under a reed cone, unglazed openings behind plank shutters',
 build(o){etTrade({plan:'hex',R:3,mk:'silt',upMk:'silt',roof:'pyramid',roofMk:'reed',poor:true,mask:'lead',
  furn:[['eternian_poor_reed_mat',4,.6],['eternian_poor_hearth',3,.4],['eternian_poor_mask_board',2,.2],['generic_storage_jar',5,.4]]});}});

/* the hexagonal house: two storeys, block below and lime above, a grey-tiled cone, the mask over the door */
defBuilding({key:'et_hex_house',name:'Hexagonal house',seed:7010,cut:true,w:11,d:11,h:11,budget:60000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'common'},
 note:'a hexagonal house of two storeys, cast block below and lime above, shutters on every face, a grey-tiled cone',
 build(o){etTrade({plan:'hex',R:4.4,storeys:2,mk:'block',upMk:'lime',roof:'pyramid',roofMk:'tile',
  furn:[['eternian_common_table',4,1.4],['eternian_common_stove',3,.4],['eternian_common_mask_shelf',5,.2],['eternian_common_bench',2,.3],['eternian_common_bed',3,.4,1],['eternian_common_chest',5,.4,1]]});}});

/* the hexagonal villa: a rich house of pale brick, two storeys under a celadon ogee, in a hexagonal walled garden with a
   gate, a basin and clipped trees */
defBuilding({key:'et_hex_villa',name:'Hexagonal villa',seed:7011,cut:true,w:24,d:24,h:15,budget:110000,
 tags:{types:['dwelling-single'],wealth:'rich',style:'ministry'},
 note:'a hexagonal house of pale brick under a celadon ogee, in a hexagonal walled garden with a gate, a basin and clipped trees',
 build(o){const br=P('brick'),ap=11*ET_HEX_AP;
  etHexFaces(ap,(k)=>{etWall(11,0,2.6,'brick',br,k===1?[{x:0,w:2,h:2.3,door:true,mask:false,leaf:P('bronze')}]:[],{t:.4});});
  for(const q of etHex(11))box('brick',q[0],0,q[1],.8,3.2,.8,new THREE.Color(br).multiplyScalar(.86));
  box('stone',0,.6,ap-.6,1,.1,.5,P('stoneD'));etHead(0,2.9,ap,.7,{metal:'gold'});
  box('paving',0,0,5.6,2,.05,6,P('paving'));etBasin(5,0,4.2,3,3,.4);
  for(const [x,z] of [[-5.5,4],[-6,-4],[5.5,-4.5]]){cyl('glaze',x,0,z,.45,.6,etKeyCol('glaze'),12);cone('plain',x,1.1,z,.7,2.0,new THREE.Color(0x3e5e3a),8);}
  etTrade({plan:'hex',R:5,storeys:2,mk:'brick',upMk:'brick',roof:'ogee',roofMk:'celadon',steel:true,mask:false,
   furn:[['eternian_court_ancestor_niche',4,.3],['eternian_court_alabaster_lamp',3,.5],['eternian_common_table',0,1.6],['eternian_court_gallery_bench',5,.3],['eternian_court_canopy_bed',4,1.2,1],['eternian_court_visor_case',2,.3,1]],
   extra:F=>{box('stone',0,F.G+2.6,F.ap+.25,.8,.12,.4,P('stoneD'));etHead(0,F.G+2.72,F.ap+.3,.7,{metal:'gold'});}});}});
