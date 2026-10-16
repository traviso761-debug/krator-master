// prefix: ie
// ================================================================= KAUTOA: a building for every trade the Voth city carries
// The owner (2026-10-14): both sets carry every trade in the Voth city's census (IS_TRADES, 68-is-trades.js). Kautoa stays the
// taller, pointier set (its towers of golden thatch), and a few of its public houses take the village hall's broad crossed
// saddles (ieHallRoof, 60-ie-east.js) for the overlap with the West. The outdoor gear is shared (43-is-yards.js); the sheds
// are ieShed (62-ie-civic.js), the houses ieHouse.
// Frame: origin on the ground at the plot centre, +z the front.
/* ---------------------------------------------------------------- the ancestor temple (priests, undertakers) */
defBuilding({key:'ie-temple',name:'Ancestor temple (Kautoa)',seed:6104,cut:true,w:24,d:28,h:30,budget:240000,
 tags:{types:['religious','funerary'],wealth:'rich',style:'east',role:'temple'},
 note:'the temple of the ancestors (the marapu): the tallest tower of golden thatch in the town on a coral platform, its face woven from skirt to ridge, the priests\' altar and the ancestors\' figures inside, and before it a court of megalith tombs, standing stones and the slab where the dead lie in state',
 build(o){box('coral',0,0,-1,15,.8,13,P('coral'));box('stone',0,.8,-1,15.4,.14,13.4,P('stone'));
  W(0,.94,-1.5,0,()=>ieHouse({w:8.4,d:7.6,floorY:1.6,wallH:2.6,ver:1.4,verFront:2.0,roof:{over:1.0,skirtH:2.0,skirtS:.46,towerH:17,towerS:.38,topSx:.18,topSz:.05,th:.38},
   wallMk:'planks',wallCol:P('woodL'),facade:'patGableE2',stair:'stair',stairW:2,finial:'moon',hornPosts:true,
   extra:()=>{const fy=1.6;isFurn([['generic_trade_altar',0,fy,-2.8,0],['islander_court_statue',-2.6,fy,-2.8,PI/8],['islander_court_statue',2.6,fy,-2.8,-PI/8],['islander_court_candelabra',-1.3,fy,-2.4,0],
    ['islander_court_candelabra',1.3,fy,-2.4,0],['islander_court_tapestry',0,fy,-3.66,0],['islander_court_carpet',0,fy,0,0],['islander_common_banner',-3.9,fy,.4,PI/2],['islander_common_banner',3.9,fy,.4,-PI/2]]);}}));
  isNoCut(()=>{ieSteps(0,5.5,0,.8,4,{});for(let k=0;k<4;k++){const x=-7.5+k*5;isTomb(x,10.4,0,{s:1.15,figures:k%2===0});}box('stone',0,0,8.2,3.2,.7,1.6,P('stoneD'));
   for(const s of [-1,1]){isMenhir(s*10.2,6.4,3.2,.42);isMenhir(s*10.8,12.4,2.4,.36);isPou(s*2.4,0,13.2,3.6,.24,{mk:'carved',top:'horns'});}});}});
/* ---------------------------------------------------------------- food: the bakehouse, the butcher's and smokehouse */
defBuilding({key:'ie-bakehouse',name:'Bakehouse (Kautoa)',seed:6310,cut:true,w:15,d:13,h:12.5,budget:110000,
 tags:{types:['shop','industry'],wealth:'middle',style:'east',role:'baker'},
 note:'the bakehouse: sago, breadfruit and taro cakes from the earth ovens in the yard, sold from the veranda of a low peaked house whose skirt reaches to the counter',
 build(o){ieHouse({w:6.4,d:5,floorY:.9,wallH:2.1,ver:.9,verFront:1.8,roof:{over:.8,skirtH:1.4,skirtS:.5,towerH:5.6,towerS:.4,topSx:.2,topSz:.05,patch:.1},
  wallMk:'bamboo',facade:'patWeave',towerFacade:false,stair:'stair',stairW:1.4,finial:'figure',front:[{x:-1.8,w:1,h:1.8,door:true},{x:1.4,w:2.2,y:.8,h:1.0}],
  extra:()=>{const fy=.9;isFurn([['islander_common_counter',1.4,fy,1.9,PI],['generic_bread_basket',.8,fy,1.3,0],['generic_pastries',2.3,fy,1.3,0],['islander_common_hearth',-2.2,fy,-1.7,0],
   ['generic_sack',-.6,fy,-1.9,.3],['generic_storage_jar',.6,fy,-1.9,0],['generic_pantry_shelf',2.7,fy,-1.4,-PI/2],['generic_bread',-1,fy,.6,0]]);}});
  isNoCut(()=>{isUmu(-5.6,3.6,1);isUmu(-5.4,-1.4,.85);FURNISH('generic_poor_bench',4.8,0,4.4,0,{setting:'outdoor'});isDrum(5.6,0,-2,{col:'galv'});});}});
defBuilding({key:'ie-butcher',name:"Butcher's and smokehouse (Kautoa)",seed:6311,cut:true,w:16,d:14,h:12,budget:110000,
 tags:{types:['shop','industry'],wealth:'middle',style:'east',role:'butcher'},
 note:'the butcher\'s: pork, buffalo and turtle cut on the block in an open shed under a skirt and short tower of thatch, the meat sold from its rail, fish and meat smoked over a trench behind',
 build(o){ieShed({w:7,d:5,plat:.2,platMk:'earth',postH:2.4,carved:true,walls:{back:'bamboo'},roof:{skirtH:1.3,towerH:4.2,towerS:.36,topSx:.2,patch:.2,finial:'none'}});
  isFurn([['islander_common_counter',0,.2,2.0,PI],['generic_cured_meat',-1.6,.2,1.8,0],['generic_roast',1.6,.2,1.8,0],['generic_hanging_larder',-2.6,.2,-2,0],['islander_common_workbench',2.4,.2,-1.8,0],['generic_fish',0,.2,-1.7,0]]);
  isNoCut(()=>{isSmokeRack(0,-5.6,0,6);isPen(5.6,3,3.6,3.2,{});});place('pig',5.4,2.8,.6,{sub:'east'});door(0,.2,2.6,0,3);}});
/* ---------------------------------------------------------------- the tannery and tapa house */
defBuilding({key:'ie-tannery',name:'Tannery and tapa house (Kautoa)',seed:6312,cut:true,w:17,d:15,h:10.5,budget:110000,
 tags:{types:['industry'],wealth:'poor',style:'east',role:'tanner',job:'tanning'},
 note:'the tanners and bark-cloth beaters: hides soaking in vats under an open shed patched with iron, hides and beaten tapa drying on frames, the cloth folded for the ikat dyers',
 build(o){ieShed({w:7,d:5,plat:.15,platMk:'earth',postH:2.3,roof:{skirtH:1.1,towerH:3.4,towerS:.4,topSx:.24,patch:.45,finial:'none'}});
  isFurn([['generic_trade_vat',-2,.15,-1,0],['generic_trade_vat',0,.15,-1.2,.3],['islander_common_workbench',2.3,.15,-1.5,0],['islander_common_rack',2.6,.15,1,-PI/2],['job_pole_rack',-2.6,.15,1.2,PI/2]]);
  isNoCut(()=>{isDryRack(0,5.6,0,7,'hide');isDryRack(0,-5.6,PI,7,'tapa');isDrum(6.4,0,1.4,{col:'galv'});});door(0,.15,2.6,0,3);}});
/* ---------------------------------------------------------------- the healer's house */
defBuilding({key:'ie-healer',name:"Healer's house (Kautoa)",seed:6313,cut:true,w:16,d:14,h:15,budget:130000,
 tags:{types:['civic'],wealth:'middle',style:'east',role:'healer'},
 note:'the healer\'s house: a sick-room on piles behind a deep veranda, beds for the sick, the medicines and herbs, a moon on the tower\'s ridge; herbs drying and a little garden before the steps',
 build(o){ieHouse({w:9,d:6,floorY:1.5,wallH:2.2,ver:1.0,verFront:2.0,roof:{over:.8,skirtH:1.5,skirtS:.56,towerH:7,towerS:.3,topSx:.18,topSz:.05},
  wallMk:'bamboo',facade:'patWeave',towerFacade:false,stair:'stair',stairW:1.4,finial:'moon',
  extra:()=>{const fy=1.5;isFurn([['islander_common_bed',-3.2,fy,-2,0],['islander_common_bed',-1,fy,-2,0,{v:1}],['islander_common_bed',1.2,fy,-2,0],['generic_medicine',3.4,fy,-2.1,0],
   ['generic_herb_bundles',3.8,fy,.6,-PI/2],['islander_common_wall_shelves',3.4,fy,-2.6,0],['islander_common_low_table',0,fy,.6,0]]);}});
  isNoCut(()=>{isDryRack(-5,6,0,3.4,'hide');for(let i=0;i<4;i++)place('fl-taro',3+i%2*1.4,6.2+Math.floor(i/2)*1.3,i,{});});}});
/* ---------------------------------------------------------------- the guest house (the inn): the village hall's roof */
defBuilding({key:'ie-guesthouse',name:'Guest house (Kautoa)',seed:6314,cut:true,w:24,d:16,h:15,budget:180000,
 tags:{types:['inn','tavern'],wealth:'middle',style:'east',role:'inn'},
 note:'the guest house for traders and visiting crews, under the village hall\'s broad horned saddle and its spire: sleeping mats and chests down the long room, a hearth and the kava bowls, the boats\' gear stacked outside',
 build(o){ieHouse({w:15,d:6,floorY:1.6,wallH:2.3,ver:1.0,verFront:1.8,hall:{rise:3.4,hornOut:1.6,spire:5.4,spireS:1.6},
  front:[{x:-4.5,w:1,h:1.8,door:true},{x:4.5,w:1,h:1.8,door:true},{x:0,w:.8,y:.9,h:.7}],wallMk:'bamboo',facade:'patWeave',stair:'stair',stairX:-4.5,stairW:1.3,
  extra:()=>{const fy=1.6;for(let i=0;i<5;i++){const x=-6+i*3;FURNISH('islander_common_bed',x,fy,-2.3,0,{v:i%2});FURNISH('islander_common_chest',x+1.1,fy,-2.4,0);}
   isFurn([['islander_common_hearth',0,fy,.5,0],['islander_common_kava_bowl',-2,fy,1,0],['islander_common_kava_bowl',2,fy,1,0],['islander_common_lamp',5,fy,1.4,0]]);}});
  isNoCut(()=>{isCargo(-9.4,6.4,0,5);});}});
/* ---------------------------------------------------------------- the harbourmaster's house (customs): the village hall's roof */
defBuilding({key:'ie-harbourmaster',name:"Harbourmaster's house (Kautoa)",seed:6315,cut:true,w:18,d:16,h:17,budget:160000,
 tags:{types:['civic'],wealth:'rich',style:'east',role:'customs'},
 note:'the house where the king\'s due is taken on every cargo landed: a counting room high on carved posts under crossed horned saddles and a spire, tally boards, the strongbox, cargo held for the due in the yard',
 build(o){ieHouse({w:8,d:6,floorY:2,wallH:2.4,ver:1.2,verFront:2,hall:{rise:3.2,hornOut:1.4,cross:{rise:4},spire:6.4,spireS:1.4,finial:'moon'},
  wallMk:'planks',wallCol:P('woodL'),facade:'patGableE',stair:'stair',stairW:1.6,hornPosts:true,
  extra:()=>{const fy=2;isFurn([['islander_common_desk',-1.6,fy,-2,0],['islander_common_chair',-1.6,fy,-1.1,PI],['generic_strongbox',2.6,fy,-2.2,0],['generic_writing_supplies',-.4,fy,-2.2,0],
   ['islander_common_board',3.4,fy,1,-PI/2],['islander_court_cabinet',-3.4,fy,-2.4,0],['islander_common_scroll',.6,fy,-2.4,0]]);}});
  isNoCut(()=>{isCargo(-6.4,6.6,.2,4);isFlag(6.6,6.4,9,{});});}});
/* ---------------------------------------------------------------- the beacon tower (the lighthouse) */
defBuilding({key:'ie-beacon',name:'Beacon tower (Kautoa)',seed:6316,cut:true,w:8,d:8,h:24,budget:100000,
 tags:{types:['infrastructure'],wealth:'middle',style:'east',role:'lighthouse'},
 note:'the beacon on the headland: a tapering tower of coral stone, the keepers\' room at its foot, the fire basket on its top under a tall spire of golden thatch on posts, the moon on the spire',
 build(o){isCutFloor(0);sector('coral',0,0,2.2,2.8,PI/2+.3,PI/2+TAU-.3,0,2.6,P('coral'),20);sector('coral',0,0,2.2,2.8,PI/2-.3,PI/2+.3,2.0,2.6,P('coral'),3);door(0,0,2.8,0,1.2);
  cyl('earth',0,0,0,2.2,.06,P('earth'),18);isFurn([['islander_common_bed',-.9,0,-1,0],['generic_fuel',1,0,-1.1,0],['generic_lamp_oil',1.3,0,.5,0],['islander_common_stool',-.8,0,.9,0]]);
  isNoCut(()=>{const H=14;cyl('coral',0,2.6,0,2.4,H-2.6,P('coral'),18,1.6/2.4);box('stone',0,H,0,4.2,.22,4.2,P('stone'));isLadder(2.6,2.6,PI/2,H-2.6,{});
   isBeacon(0,H+.22,0,1);for(const sx of [-1,1])for(const sz of [-1,1])cyl('wood',sx*1.7,H+.22,sz*1.7,.09,2.9,P('wood'),6);
   const sp=isSpire({hw:2.4,hd:2.4,sq:7,mk:'thatchR',col:P('thatchE'),th:.22,nu:24,sub:3,prof:[[1,1,H+3],[.6,.56,H+4.6],[.32,.24,H+6.6],[.16,.05,H+8.4]]});ieFinial('moon',sp,.8);});}});
/* ---------------------------------------------------------------- the quarry, the sulphur diggings, the salt works */
defBuilding({key:'ie-quarry',name:'Coral quarry (Kautoa)',seed:6317,cut:true,w:18,d:13,h:9,budget:70000,
 tags:{types:['industry'],wealth:'poor',style:'east',role:'quarry',job:'masonry'},
 note:'the quarrymen\'s yard where the stone for Kautoa\'s walls and tombs is cut: the old reef\'s face, blocks squared on the floor, a lifting tripod, the masons\' shelter under a little peaked roof',
 build(o){isQuarryFace(0,-3.2,0,14,5.6);W(-5.6,0,3.6,0,()=>{ieShed({w:3,d:2.4,postH:2.1,roof:{skirtH:.8,towerH:2.2,towerS:.4,topSx:.26,patch:.3,finial:'none'}});
   FURNISH('islander_common_workbench',0,0,-.6,0);FURNISH('generic_crate',1.0,0,.4,.2);FURNISH('generic_poor_stool',-.9,0,.5,0);FURNISH('generic_sack',.9,0,-.7,0);});door(-5.6,0,4.8,0,2.4);}});
defBuilding({key:'ie-sulphur',name:'Sulphur diggings (Kautoa)',seed:6318,cut:true,w:15,d:13,h:8,budget:60000,
 tags:{types:['industry'],wealth:'poor',style:'east',role:'miner',job:'mining'},
 note:'the miners\' diggings at a fuming vent: yellow sulphur cut from its crust and carried in baskets, the diggers\' shelter of iron and thatch, a washing tub',
 build(o){isSulphurVent(-2,-1.6,1.4);W(4.4,0,3.2,0,()=>{ieShed({w:3,d:2.4,postH:2,roof:{skirtH:.8,towerH:1.8,towerS:.44,topSx:.28,patch:.7,finial:'none'}});
   FURNISH('generic_basket',-.7,0,0,0);FURNISH('generic_sack',.7,0,.4,0);FURNISH('generic_basket',.5,0,-.6,.4);});door(4.4,0,4.4,0,2.4);
  isNoCut(()=>{for(let i=0;i<4;i++)FURNISH('generic_basket',-5+i*.8,0,3.8,i,{setting:'outdoor'});});}});
defBuilding({key:'ie-saltworks',name:'Salt works (Kautoa)',seed:6319,cut:true,w:20,d:15,h:8,budget:70000,
 tags:{types:['industry'],wealth:'poor',style:'east',role:'salt works',job:'salt'},
 note:'the salt pans on the flats: brine in a grid of clay pans dried by the sun, the salt raked into heaps, the boiling and store shed under a skirt of thatch',
 build(o){isSaltPans(-2,-1,4,3,3);W(7,0,3.6,0,()=>{ieShed({w:3.6,d:2.8,postH:2.1,walls:{back:'mat'},roof:{skirtH:.9,towerH:2.4,towerS:.4,topSx:.26,patch:.3,finial:'none'}});
   FURNISH('job_salt_tub',-.8,0,-.4,0);FURNISH('job_salt_heap',.8,0,0,0);FURNISH('generic_sack',1.1,0,-.9,0);});door(7,0,5,0,2.6);
  isNoCut(()=>{FURNISH('job_salt_heap',-8.6,0,5.6,0,{setting:'outdoor'});smokeAt(7,2.2,3.6,{r:.2});});}});
/* ---------------------------------------------------------------- the stock: the pens, the buffalo byre */
defBuilding({key:'ie-pens',name:'Stock pens (Kautoa)',seed:6320,cut:true,w:16,d:13,h:7,budget:80000,
 tags:{types:['farm'],wealth:'poor',style:'east',role:'swineherd',job:'herding'},
 note:'the swineherds\' and fowlers\' pens: a pig sty in a coral-walled yard, a hen house on stilts under a little peak, a duck pond, the keepers\' shelter',
 build(o){isPen(-4,-1.4,6,6,{});place('pig',-4.4,-2,.4,{sub:'east'});place('pig',-3,-.4,2.2,{sub:'east'});
  W(3.4,0,-2.4,0,()=>{isPiles(isSpan(-1,1,2),isSpan(-.8,.8,2),1.2,{r:.08,mk:'bamboo',col:P('bamboo'),beams:false});isDeck(2.4,2,1.2,{col:P('planks'),beam:false});
   box('mat',0,1.2,0,2.2,1.2,1.8,P('bamboo'));isHip({hw:1.5,hd:1.3,eaveY:2.4,topY:4.6,topS:.16,topS2:.05,mk:'thatchR',col:P('thatchE'),th:.14});isLogLadder(0,1.0,0,1.2);});
  W(4,0,3.2,0,()=>{ellip('water',0,0,0,2.2,.05,1.5,0x4a6a5a,0,14);isPen(0,0,6,4.4,{});});place('duck',3.6,2.8,.4,{sub:'east'});place('hen',2.4,-.6,1,{sub:'east'});
  W(-4,0,4.6,0,()=>{ieShed({w:2.6,d:2,postH:1.9,walls:{back:'mat'},roof:{skirtH:.7,towerH:1.6,towerS:.44,topSx:.3,patch:.4,finial:'none'}});
   isFurn([['generic_poor_bed',0,0,-.5,0],['generic_poor_stool',.8,0,.3,0],['generic_eggs',-.9,0,.4,0],['generic_basket',-.4,0,.6,0]]);});door(-4,0,5.6,0,2);}});
defBuilding({key:'ie-byre',name:'Buffalo byre (Kautoa)',seed:6321,cut:true,w:16,d:12,h:10,budget:90000,
 tags:{types:['farm'],wealth:'middle',style:'east',role:'dairy',job:'herding'},
 note:'the water buffalo\'s byre: a long open shed under a skirt with two short towers, hay racks and troughs, the milking stools and jars, a wallow beside it',
 build(o){ieShed({w:9,d:5,plat:.15,platMk:'earth',postH:2.4,roof:{skirtH:1.2,towerH:3.2,towerS:.24,topSx:.18,towers:[[-2.4,0,1],[2.4,0,1]],finial:'horns'}});
  isFurn([['generic_trade_hayrack',-3,.15,-2,0],['generic_trade_trough',0,.15,-2,0],['generic_trade_hayrack',3,.15,-2,0],['generic_dairy',3.6,.15,1.6,0],['generic_churn',2.6,.15,1.8,0],['generic_poor_stool',1.6,.15,1.4,0]]);
  place('buffalo',-2,.4,PI/2,{sub:'east'});isNoCut(()=>{ellip('earth',-5.6,0,4.2,2.0,.06,1.4,0x4a3a2a,0,12);ellip('water',-5.6,.03,4.2,1.5,.04,1,0x5a5a48,0,12);});door(0,.15,2.6,0,3);}});
/* ---------------------------------------------------------------- the envoys' compound (Kautoa only: the kingdom receives embassies) */
defBuilding({key:'ie-envoy',name:"Envoys' compound (Kautoa)",seed:6025,cut:true,w:32,d:28,h:16,budget:260000,
 tags:{types:['civic','dwelling-multi'],wealth:'rich',style:'east',role:'embassy'},
 note:'where the king lodges foreign envoys: a coral-walled court with a hall under the village hall\'s crossed saddles for audiences and feasts, a lodging house, the envoys\' banners on tall poles at the gate',
 build(o){W(-5,0,-3,0,()=>ieCutWith(0,0,1.6,()=>ieHouse({w:9,d:6,floorY:1.6,wallH:2.4,ver:1.1,verFront:1.8,hall:{rise:3.2,hornOut:1.4,cross:{rise:4},spire:5.6,spireS:1.4,finial:'moon'},
   wallMk:'planks',wallCol:P('woodL'),facade:'patGableE',stair:'stair',stairW:1.6,hornPosts:true,
   extra:()=>{const fy=1.6;isFurn([['islander_court_throne',0,fy,-2.2,0],['islander_court_table',0,fy,-.4,0],['islander_court_divan',-3,fy,-1.6,PI/2],['islander_court_divan',3,fy,-1.6,-PI/2],['islander_court_tapestry',0,fy,-2.96,0]]);}})));
  W(8,0,-4,0,()=>ieCutWith(0,0,1.5,()=>ieHouse({w:6,d:5.4,floorY:1.5,wallH:2.2,ver:.9,verFront:1.5,roof:{over:.8,skirtH:1.4,skirtS:.5,towerH:7,towerS:.38,topSx:.2,topSz:.05},
   wallMk:'bamboo',facade:'patWeave',towerFacade:false,stair:'stair',finial:'figure',tier:'rich',beds:2})));
  isNoCut(()=>{const hw=15.4,hd=13.4;for(const [x0,z0,x1,z1] of [[-hw,-hd,hw,-hd],[-hw,-hd,-hw,hd],[hw,-hd,hw,hd],[-hw,hd,-2.4,hd],[2.4,hd,hw,hd]]){const L=Math.hypot(x1-x0,z1-z0);
    W((x0+x1)/2,0,(z0+z1)/2,Math.atan2(x1-x0,z1-z0)-PI/2,()=>{box('coral',0,0,0,L+.6,1.6,.6,P('coral'));box('stone',0,1.6,0,L+.7,.14,.7,P('stone'));});}
   for(const s of [-1,1]){isPou(s*2.8,0,hd+.3,3.4,.2,{mk:'carved',top:'figure'});for(const c of ['teal','ochre','red'])isFlag(s*(4.2+['teal','ochre','red'].indexOf(c)*1.6),hd+1.2,8+(c==='teal'?2:0),{c,ry:s>0?0:PI});}});}});
/* ---------------------------------------------------------------- the harbour's new trades (shore row: land at z > 0, the sea at z < 0) */
defBuilding({key:'ie-quay',name:'Quay and cargo shed (Kautoa)',seed:6303,cut:true,w:24,d:30,h:15,budget:160000,
 tags:{types:['infrastructure'],wealth:'middle',style:'east',role:'dockers',job:'warehousing'},
 note:'the trading quay of Kautoa: a broad plank quay on tarred piles with bollards and a rail, the cargo shed on the shore under a skirt of thatch and two towers, bales and jars waiting, outrigger canoes alongside',
 build(o){const y=.5;isNoCut(()=>{ieWalk([0,1.5],[0,-12],8,y,{bollards:true,step:2.4});isCargo(1.6,-4,0,6);ieCanoe(-6.2,IS_SEA.level-.25,-7.5,.05,{L:7});ieCanoe(6.2,IS_SEA.level-.25,-9,-.08,{});});
  W(0,0,8.6,0,()=>{ieShed({w:12,d:5,postH:2.6,walls:{back:'bamboo'},roof:{skirtH:1.4,towerH:4,towerS:.2,topSx:.12,towers:[[-3,0,1],[3,0,1]],finial:'figure'}});
   isFurn([['generic_trade_bin',-4.6,0,-1.4,0],['generic_trade_bin',-3,0,-1.4,0],['job_bales',-.6,0,-1.4,0],['generic_storage_jar',1.2,0,-1.4,0],['generic_crate',3,0,-1.2,.2],['generic_barrel',4.8,0,-1.3,0]]);});
  door(0,0,11.1,0,4);}});
defBuilding({key:'ie-canoeshed',name:'Drua shed (Kautoa)',seed:6304,cut:true,w:18,d:34,h:16,budget:200000,
 tags:{types:['infrastructure','civic'],wealth:'rich',style:'east',role:'coast guard'},
 note:'the coast guard\'s drua shed: a great double-hulled war canoe drawn up on its slipway under a long skirt of golden thatch with three towers, the crews\' spears and paddles racked, their bunks and lockers at the back',
 build(o){isNoCut(()=>ieSlip([-2.2,2.2],13,-6));
  W(0,0,6,0,()=>{W(0,0,0,PI/2,()=>ieShed({w:17,d:8,postH:3.2,carved:true,roof:{skirtH:1.6,towerH:5,towerS:.14,topSx:.08,towers:[[-5.5,0,1],[0,0,1.2],[5.5,0,1]],finial:'figure'}}));
   W(0,.42,-.6,0,()=>ieDouble({L:14,sp:4.4}));
   isFurn([['generic_trade_weapon_rack',-3.6,0,-7.2,PI/2],['generic_trade_weapon_rack',3.6,0,-7.2,-PI/2],['generic_trade_bunk',-3.2,0,7.4,0],['generic_trade_locker',3.2,0,7.6,0],['job_pole_rack',3.4,0,3,-PI/2]]);});
  door(0,0,14.6,0,4);}});
defBuilding({key:'ie-ferry',name:'Ferry landing (Kautoa)',seed:6305,cut:true,w:14,d:24,h:11,budget:90000,
 tags:{types:['infrastructure'],wealth:'poor',style:'east',role:'ferry'},
 note:'the ferrymen\'s landing: a jetty to the deep water with the ferry canoes moored, a little peaked shelter where the passengers wait and the fares are paid',
 build(o){const y=.5;isNoCut(()=>{ieWalk([0,1.5],[0,-11],2.4,y,{bollards:true});ieWalk([-2.7,-11.8],[2.7,-11.8],1.8,y,{});
   ieCanoe(2.3,IS_SEA.level-.25,-8,0,{L:6.4});ieCanoe(-2.4,IS_SEA.level-.25,-9.6,.1,{L:5.6});});
  W(0,0,5.8,0,()=>{ieShed({w:4.2,d:3,postH:2.2,walls:{back:'mat'},roof:{skirtH:1,towerH:3.2,towerS:.4,topSx:.24,finial:'figure'}});
   isFurn([['islander_common_bench',-.9,0,-.9,0],['islander_common_bench',.9,0,-.9,0,{v:1}],['generic_strongbox',1.6,0,.5,-PI/2],['islander_common_stool',.6,0,.6,0]]);});
  door(0,0,7.4,0,2.4);}});
/* ---------------------------------------------------------------- the mine: it works the nearest mineable node (kits/resources, resSource) */
defBuilding({key:'ie-mine',name:'Mine (Kautoa)',seed:6322,cut:true,w:20,d:16,h:10,budget:120000,
 tags:{types:['industry'],wealth:'poor',style:'east',role:'mine',job:'mining'},
 note:'the miners\' workings: an adit timbered into the hillside and a shaft under a windlass, the ore broken and sorted under a skirt of thatch with a short tower, the dressed ore heaped for the carriers. It works the nearest iron, copper or gold node within reach; the node\'s grade sets its yield',
 build(o){const metal=o.metal||'iron';isAdit(0,-5,0,{});isNoCut(()=>{isWindlass(-6.4,-1.6,0);isOrePile(5.6,2.6,metal,1.2);isOrePile(7.2,4.4,metal,.8);});
  W(-1,0,4.4,0,()=>{ieShed({w:6,d:3.6,postH:2.3,walls:{back:'mat'},roof:{skirtH:1,towerH:2.8,towerS:.34,topSx:.22,patch:.35,finial:'none'}});
   isFurn([['islander_common_workbench',-1.6,0,-1,0],['generic_basket',0,0,-1.1,0],['generic_basket',.7,0,-1,.4],['generic_crate',2.1,0,-.9,0],['job_pole_rack',2.4,0,.6,-PI/2],['generic_sack',-.4,0,.6,0]]);});
  door(-1,0,6.3,0,3);}});
