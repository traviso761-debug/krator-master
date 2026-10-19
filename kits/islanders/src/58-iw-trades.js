// prefix: iw
// ================================================================= THE WEST: pointed peaks, and a building for every trade the Voth city carries
// The owner (2026-10-14): the West stays the lower, broad-roofed set, but takes a few of Kautoa's pointed peaks (a tower of
// thatch rising out of the saddle: the peaked rumah, the spirit house, the beacon), and both sets carry every trade the Voth
// city's census lists (IS_TRADES, 68-is-trades.js). The trades' outdoor gear is shared (43-is-yards.js).
//   iwPeak(rf,o)  a Kautoa-style tower of black thatch rising out of a saddle roof's middle (rf: isSaddle's handle), its spike
//   iwShed(o)     an open work shed: an earth floor, tarred posts (carved at the front), o.back a back wall of tarred boards,
//                 a horned saddle roof (o.roof: isSaddle's options), its gables painted. Returns the roof's handle.
// Frame: origin on the ground at the plot centre, +z the front.
function iwPeak(rf,o){o=o||{};const r=rf.R(0),y0=r[1]-(o.sink==null?.7:o.sink),h=o.h==null?5:o.h,hw=o.hw==null?1.5:o.hw,hd=o.hd==null?1.4:o.hd;
 const sp=isSpire({hw,hd,sq:6,mk:'thatch',col:o.col||P('thatchW'),th:.26,nu:24,sub:3,prof:[[1,1,y0],[.84,.78,y0+h*.35],[.52,.38,y0+h*.7],[.18,.07,y0+h]]});
 if(o.spike!==false){cone('iron',0,sp.top-.1,0,.07,1.1,P('iron'),6);sph('brass',0,sp.top+1.05,0,.09,P('brass'),1,6);}
 if(o.board)W(0,0,hd*.84+.05,0,()=>box(o.board,0,y0+h*.18,0,hw*1.3,h*.32,.03,WHITE));
 return sp;}
function iwShed(o){const L=o.L,D=o.D,ph=o.postH==null?2.5:o.postH,R=Object.assign({ridgeH:2.4,sag:.6,hornRise:2,hornOut:1,taper:.7,over:.8,th:.24,nu:24,mk:'thatch'},o.roof||{});
 box('earth',0,0,0,L+.4,.12,D+.4,P('earth'));
 isNoCut(()=>{for(const x of isSpan(-L/2,L/2,Math.max(2,Math.round(L/3)+1)))for(const z of [-D/2,D/2]){if(z>0&&o.carved!==false)isPou(x,.12,z,ph,.14,{mk:'carvedR',n:2});else cyl('tarred',x,.12,z,.13,ph,P('tarred'),8);}
  for(const s of [-1,1]){box('wood',0,ph-.1,s*D/2,L+.3,.22,.2,P('woodD'));box('wood',s*L/2,ph-.1,0,.2,.22,D+.3,P('woodD'));}});
 if(o.back)box('planks',0,.12,-D/2,L,ph-.2,.12,P('tarred'));
 const rf=isSaddle(Object.assign({L,W:D,eaveY:ph+.1,ridgeY:ph+.1+R.ridgeH,col:R.col||P('thatchW')},R));
 for(const s of [-1,1])rf.gable(s*(L/2+.02),ph+.1,D/2+.02,o.gableMk||'patGableW',{});
 return rf;}
/* ---------------------------------------------------------------- pointed peaks */
defBuilding({key:'iw-house-peak',name:'Peaked rumah (West)',seed:5014,cut:true,w:18,d:13,h:16.5,budget:130000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'west'},
 note:'a rumah that has taken Kautoa\'s peak: the long room on piles under a black saddle sweeping up into gonjong spikes, and out of its middle a tall tower of thatch with an iron spike, a painted board on its face',
 build(o){iwHouse({L:10,D:6,floorY:1.7,wallH:2.4,roof:{ridgeH:3.0,sag:.9,hornRise:2.6,hornOut:1.4,taper:1,over:.9,th:.32},band:'patBand',bandH:.36,
  front:iwOpen(10,4),back:iwOpen(10,3,false),stair:'stair',finial:'spike',tier:'middle',underPig:true,
  extra:(rf)=>{iwPeak(rf,{h:8.6,hw:1.9,hd:2.4,board:'patGableW'});}});}});
defBuilding({key:'iw-temple',name:'Spirit house (West)',seed:5104,cut:true,w:22,d:24,h:24,budget:220000,
 tags:{types:['religious','funerary'],wealth:'rich',style:'west',role:'temple'},
 note:'the temple of the ancestors: a square shrine high on carved red piles under a horned saddle, a tall peaked tower of black thatch rising out of it to an iron spike, a court of standing stones and the dead\'s stone tombs before it; the priests\' altar, the ancestor figures and the offerings inside',
 build(o){iwHouse({L:8,D:7,floorY:2.6,wallH:2.6,pileR:.22,pileMk:'carvedR',roof:{ridgeH:3.0,sag:.8,hornRise:2.8,hornOut:1.8,taper:1,over:1.0,th:.34},wallMk:'carvedR',wallCol:P('woodD'),
  band:'patStory',bandH:.6,front:[{x:0,w:1.3,h:2.1,door:true}],back:[],left:[{x:0,w:.7,y:1,h:.8}],right:[{x:0,w:.7,y:1,h:.8}],stair:'stair',stairW:1.8,finial:'moon',pou:'figure',
  extra:(rf)=>{iwPeak(rf,{h:13,hw:2.4,hd:2.6,sink:.9,board:'patGableW2'});const fy=2.6;
   isFurn([['generic_trade_altar',0,fy,-2.6,0],['islander_court_statue',-2.6,fy,-2.7,PI/8],['islander_court_statue',2.6,fy,-2.7,-PI/8],['islander_court_candelabra',-1.4,fy,-2.4,0],
    ['islander_court_candelabra',1.4,fy,-2.4,0],['islander_common_banner',-3.6,fy,0,PI/2],['islander_common_banner',3.6,fy,0,-PI/2],['islander_court_carpet',0,fy,.2,0],['generic_herb_bundles',2.8,fy,1.8,0]]);}});
  isNoCut(()=>{iwPaving(-8,8,6.8,12,1.1,{});for(const s of [-1,1]){for(let k=0;k<3;k++)isMenhir(s*(4+k*1.7),8+k*1.2,1.8+k*.5,.3);isTomb(s*6.5,10.6,0,{s:.9,figures:true});isFlag(s*9.5,5,9,{ry:s>0?0:PI});}
   for(const s of [-1,1])iwUprightGong(s*2.6,10.8,0,2.4,.5);});}});
/* ---------------------------------------------------------------- food: the bakehouse, the butcher's and smokehouse */
defBuilding({key:'iw-bakehouse',name:'Bakehouse (West)',seed:5360,cut:true,w:14,d:11,h:9.5,budget:100000,
 tags:{types:['shop','industry'],wealth:'middle',style:'west',role:'baker'},
 note:'the bakehouse: sago, breadfruit and rice cakes baked in earth ovens in the yard and sold over a counter window, the stores of sago flour in sacks and jars inside',
 build(o){iwHouse({L:7,D:5,floorY:.3,wallH:2.3,roof:{ridgeH:2.6,sag:.7,hornRise:2.2,hornOut:1.1,taper:.8,over:.8,th:.28,patch:.15},band:'patBand',bandH:.3,
  front:[{x:-2,w:1,h:1.85,door:true},{x:1.2,w:2.4,y:.9,h:1.0}],back:[{x:0,w:.7,y:.9,h:.7}],doorX:-2,stair:'none',finial:'spike',
  extra:()=>{const fy=.3;isFurn([['islander_common_counter',1.2,fy,1.9,PI],['generic_bread_basket',.6,fy,1.4,0],['generic_bread',1.9,fy,1.3,0],['generic_pastries',2.6,fy,-.4,0],
   ['islander_common_hearth',-2.4,fy,-1.8,0],['generic_sack',-.8,fy,-1.9,.3],['generic_sack',0,fy,-1.95,-.2],['generic_storage_jar',1,fy,-1.9,0],['generic_pantry_shelf',2.9,fy,-1.6,-PI/2]]);}});
  isNoCut(()=>{isUmu(-4.6,3.4,1);isUmu(-2.2,4.1,.85);iwWoodpile(4.8,3.2,PI/2,8,1.4);FURNISH('islander_common_bench',2.6,0,4,0,{setting:'outdoor'});});}});
defBuilding({key:'iw-butcher',name:"Butcher's and smokehouse (West)",seed:5361,cut:true,w:15,d:12,h:9,budget:110000,
 tags:{types:['shop','industry'],wealth:'middle',style:'west',role:'butcher'},
 note:'the butcher\'s: pork, buffalo and turtle cut on the block in an open shed and sold from its rail, fish and meat smoked on racks over the trench behind it',
 build(o){const rf=iwShed({L:7.4,D:5.4,back:true,roof:{patch:.25}});iwSpikes(rf,.7);
  isFurn([['islander_common_counter',0,.12,2.0,PI],['generic_cured_meat',-1.4,.12,1.8,0],['generic_roast',1.4,.12,1.8,0],['generic_hanging_larder',-2.6,.12,-2.2,0],
   ['islander_common_workbench',2.4,.12,-1.9,0],['generic_fish',0,.12,-1.8,0],['generic_barrel',-3,.12,.2,0]]);
  isNoCut(()=>{isSmokeRack(0,-5,0,6);place('pig',5.4,2.4,1.2,{sub:'west'});W(5.4,0,2.4,0,()=>isPen(0,0,3.4,3,{}));});
  door(0,.12,2.8,0,3.0);}});
/* ---------------------------------------------------------------- the tannery and tapa house */
defBuilding({key:'iw-tannery',name:'Tannery and tapa house (West)',seed:5362,cut:true,w:16,d:13,h:8.5,budget:110000,
 tags:{types:['industry'],wealth:'poor',style:'west',role:'tanner',job:'tanning'},
 note:'the tanners and the bark-cloth beaters: buffalo hides and shark skins in the soaking vats under an open shed mended with iron, hides and beaten tapa drying on frames in the sun',
 build(o){const rf=iwShed({L:7,D:5,roof:{patch:.4,ridgeH:2.0,hornRise:1.6}});
  isFurn([['generic_trade_vat',-2,.12,-1,0],['generic_trade_vat',0,.12,-1.2,.3],['islander_common_workbench',2.3,.12,-1.5,0],['islander_common_rack',2.6,.12,1,-PI/2],['job_pole_rack',-2.6,.12,1.2,PI/2]]);
  isNoCut(()=>{isDryRack(0,4.6,0,7,'hide');isDryRack(0,-4.6,PI,7,'tapa');isDrum(5.6,0,1.4,{col:'galv'});isScrapHeap(-6.2,-1.4,PI/2);});
  door(0,.12,2.6,0,3.0);}});
/* ---------------------------------------------------------------- the healer's house */
defBuilding({key:'iw-healer',name:"Healer's house (West)",seed:5363,cut:true,w:16,d:12,h:11,budget:120000,
 tags:{types:['civic'],wealth:'middle',style:'west',role:'healer'},
 note:'the healer\'s house: a long sick-room on piles with mats and beds for the sick, the healer\'s medicines and herbs on shelves and hung from the rafters, a herb garden and a drying rack before it',
 build(o){iwHouse({L:10,D:5.4,floorY:1.4,wallH:2.3,roof:{ridgeH:3.0,sag:1.0,hornRise:2.8,hornOut:1.4,taper:.9,over:.9,th:.3},band:'patBand',bandH:.3,
  front:iwOpen(10,4),back:iwOpen(10,4,false),stair:'stair',finial:'moon',
  extra:()=>{const fy=1.4;isFurn([['islander_common_bed',-3.8,fy,-1.8,0],['islander_common_bed',-1.6,fy,-1.8,0],['islander_common_bed',1.6,fy,-1.8,0,{v:1}],['generic_medicine',3.8,fy,-2,0],
   ['generic_herb_bundles',4.2,fy,.6,-PI/2],['islander_common_wall_shelves',3.2,fy,-2.3,0],['islander_common_low_table',0,fy,.5,0],['islander_common_jug',.4,fy,.6,0]]);}});
  isNoCut(()=>{isDryRack(-4,5.6,0,3.6,'hide');for(let i=0;i<6;i++)place('fl-taro',2+i%3*1.4,5.2+Math.floor(i/3)*1.3,i,{});});}});
/* ---------------------------------------------------------------- the guest longhouse (the inn) */
defBuilding({key:'iw-guesthouse',name:'Guest longhouse (West)',seed:5364,cut:true,w:26,d:13,h:12,budget:180000,
 tags:{types:['inn','tavern'],wealth:'middle',style:'west',role:'inn'},
 note:'the guest longhouse where traders and the crews of visiting boats sleep: a long hall on piles under a black saddle with three gonjong spikes, sleeping mats and chests down both sides, a kava bowl and a hearth at the middle, a shelter for the boats\' gear',
 build(o){iwHouse({L:18,D:6.4,floorY:1.6,wallH:2.4,roof:{ridgeH:3.4,sag:1.4,hornRise:3.2,hornOut:1.6,taper:1,over:1.0,th:.32},wings:{L:3.6},band:'patBand',bandH:.36,
  front:iwOpen(18,8),back:iwOpen(18,6,false),stair:'stair',stairW:1.4,finial:'spike',
  extra:()=>{const fy=1.6;for(let i=0;i<6;i++){const x=-7.5+i*3;FURNISH('islander_common_bed',x,fy,-2.5,0,{v:i%2});FURNISH('islander_common_chest',x+1.1,fy,-2.6,0);}
   isFurn([['islander_common_hearth',0,fy,.4,0],['islander_common_kava_bowl',-2.2,fy,1,0],['islander_common_kava_bowl',2.2,fy,1,0],['islander_common_low_table',4.4,fy,1.2,0],['islander_common_lamp',-5,fy,1.5,0]]);}});
  isNoCut(()=>{isCargo(-9,5.2,0,5);});}});
/* ---------------------------------------------------------------- the harbourmaster's house (customs) */
defBuilding({key:'iw-harbourmaster',name:"Harbourmaster's house (West)",seed:5371,cut:true,w:14,d:12,h:12,budget:130000,
 tags:{types:['civic'],wealth:'rich',style:'west',role:'customs'},
 note:'the harbourmaster\'s house where the chief\'s due is taken on every cargo: a counting room on piles behind a horned porch, the tally boards and the strongbox, scales, cargo held for the due in the yard',
 build(o){iwHouse({L:8,D:5.6,floorY:1.6,wallH:2.4,roof:{ridgeH:3.2,sag:1.0,hornRise:3.0,hornOut:1.4,taper:1,over:.9,th:.3},band:'patGableW',bandH:.45,
  front:iwOpen(8,2),back:iwOpen(8,2,false),stair:'stair',porch:{w:3,d:2.2},finial:'moon',pou:'figure',
  extra:()=>{const fy=1.6;isFurn([['islander_common_desk',-1.6,fy,-1.8,0],['islander_common_chair',-1.6,fy,-.9,PI],['generic_strongbox',2.8,fy,-2,0],['generic_writing_supplies',-.6,fy,-2,0],
   ['islander_common_board',2.6,fy,1.2,-PI/2],['islander_common_bookcase',-3.4,fy,-2.2,0],['islander_common_scroll',0,fy,-2.4,0]]);}});
  isNoCut(()=>{isCargo(-5.4,4.6,.2,4);isFlag(5.5,4.6,8,{});});}});
/* ---------------------------------------------------------------- the beacon tower (the lighthouse): a pointed peak */
defBuilding({key:'iw-beacon',name:'Beacon tower (West)',seed:5372,cut:true,w:9,d:9,h:21,budget:90000,
 tags:{types:['infrastructure'],wealth:'middle',style:'west',role:'lighthouse'},
 note:'the beacon that guides the canoes home: a tall timber tower on stone, a fire basket on its platform under a peaked hood of black thatch on posts, the keepers\' room at its foot, fuel stacked up its ladder',
 build(o){isCutFloor(.2);box('stone',0,0,0,4.8,.6,4.8,P('stoneD'));
  isWalls(4,4,.6,2.3,'planks',P('tarred'),{front:[{x:0,w:1,h:1.85,door:true}],back:[],left:[{x:0,w:.6,y:.9,h:.6}],right:[],frame:P('woodD')});
  isFurn([['islander_common_bed',-1,.6,-1.2,0],['generic_fuel',1.1,.6,-1.2,0],['generic_lamp_oil',1.2,.6,.6,0],['islander_common_stool',-.6,.6,.8,0]]);
  isNoCut(()=>{const H=13;for(const sx of [-1,1])for(const sz of [-1,1])beam('tarred',[sx*2.1,.6,sz*2.1],[sx*1.3,H,sz*1.3],.16,P('tarred'),true,8);
   for(let y=3.4;y<H;y+=3.2)for(const [a,b] of [[[-1,-1],[1,-1]],[[1,-1],[1,1]],[[1,1],[-1,1]],[[-1,1],[-1,-1]]]){const f=lerp(2.1,1.3,y/H);beam('wood',[a[0]*f,y,a[1]*f],[b[0]*f,y-1.6,b[1]*f],.07,P('woodD'),true,5);}
   box('planks',0,H,0,3.6,.18,3.6,P('planks'));isLadder(1.7,1.75,0,H+.18,{});isBeacon(0,H+.18,0,1);
   for(const sx of [-1,1])for(const sz of [-1,1])cyl('wood',sx*1.5,H+.18,sz*1.5,.08,2.8,P('wood'),6);
   isSpire({hw:2.3,hd:2.3,sq:6,mk:'thatch',col:P('thatchW'),th:.22,nu:24,sub:3,prof:[[1,1,H+2.9],[.66,.66,H+3.9],[.3,.3,H+5.4],[.08,.08,H+6.6]]});
   cone('iron',0,H+6.5,0,.06,1.0,P('iron'),6);});}});
/* ---------------------------------------------------------------- the quarry, the sulphur diggings, the salt works */
defBuilding({key:'iw-quarry',name:'Coral quarry (West)',seed:5366,w:18,d:13,h:8,budget:70000,
 tags:{types:['industry'],wealth:'poor',style:'west',role:'quarry',job:'masonry'},
 note:'the quarrymen\'s yard: blocks of coral rock cut from the old reef\'s face and squared for walls and tombs, a lifting tripod, the masons\' shelter under a little horned roof',
 build(o){isQuarryFace(0,-3.2,0,14,5.6);W(-5.6,0,3.4,0,()=>{const rf=iwShed({L:3.6,D:2.6,postH:2.1,carved:false,roof:{ridgeH:1.2,hornRise:.55,hornOut:.25,taper:.4,over:.5,patch:.3}});
   FURNISH('islander_common_workbench',0,.12,-.6,0);FURNISH('generic_crate',1.1,.12,.4,.2);});
  door(-5.6,.12,4.7,0,2.4);isNoCut(()=>{FURNISH('job_pole_rack',5.6,0,4.2,0,{setting:'outdoor'});});}});
defBuilding({key:'iw-sulphur',name:'Sulphur diggings (West)',seed:5367,w:15,d:13,h:7,budget:60000,
 tags:{types:['industry'],wealth:'poor',style:'west',role:'miner',job:'mining'},
 note:'the miners\' diggings at a fuming vent: yellow sulphur cut from its crust and carried off in baskets, a shelter of iron and thatch for the diggers, a tub to wash the crust',
 build(o){isSulphurVent(-2,-1.6,1.4);W(4.4,0,3.0,0,()=>{iwShed({L:3.4,D:2.6,postH:2.0,carved:false,roof:{ridgeH:1.2,hornRise:.55,hornOut:.25,taper:.4,over:.5,patch:.7}});
   FURNISH('generic_basket',-.8,.12,0,0);FURNISH('generic_basket',.6,.12,-.4,.4);FURNISH('generic_sack',.9,.12,.6,0);});
  door(4.4,.12,4.3,0,2.4);isNoCut(()=>{for(let i=0;i<4;i++)FURNISH('generic_basket',-5+i*.8,0,3.6,i,{setting:'outdoor'});FURNISH('job_salt_tub',2,0,-3.8,0,{setting:'outdoor'});});}});
defBuilding({key:'iw-saltworks',name:'Salt works (West)',seed:5368,w:20,d:15,h:7,budget:70000,
 tags:{types:['industry'],wealth:'poor',style:'west',role:'salt works',job:'salt'},
 note:'the salt makers\' pans on the salt flats: brine let into a grid of clay pans and dried by the sun, the salt raked into heaps and carried to the store, the boiling shed with its pots',
 build(o){isSaltPans(-2,-1,4,3,3);W(7,0,3.4,0,()=>{iwShed({L:4,D:3,postH:2.1,carved:false,back:true,roof:{ridgeH:1.2,hornRise:.55,hornOut:.25,taper:.4,over:.5,patch:.35}});
   FURNISH('job_salt_tub',-.8,.12,-.4,0);FURNISH('job_salt_heap',.8,.12,0,0);FURNISH('generic_sack',1.2,.12,-.9,0);});
  door(7,.12,4.9,0,2.6);isNoCut(()=>{FURNISH('job_salt_heap',-8.6,0,5.6,0,{setting:'outdoor'});smokeAt(7,2,3.4,{r:.2});});}});
/* ---------------------------------------------------------------- the stock: the pens, the buffalo byre */
defBuilding({key:'iw-pens',name:'Stock pens (West)',seed:5369,cut:true,w:16,d:12,h:6,budget:80000,
 tags:{types:['farm'],wealth:'poor',style:'west',role:'swineherd',job:'herding'},
 note:'the swineherds\' and fowlers\' pens: a pig sty fenced in bamboo, a hen house on stilts, a duck pond in a fenced yard, the keepers\' hut',
 build(o){isPen(-4,-1.4,6,6,{});place('pig',-4.4,-2,.4,{sub:'west'});place('pig',-3,-.4,2.2,{sub:'west'});
  W(3.4,0,-2.4,0,()=>{isPiles(isSpan(-1,1,2),isSpan(-.8,.8,2),1.2,{r:.08,mk:'bamboo',col:P('bamboo'),beams:false});isDeck(2.4,2,1.2,{col:P('planks'),beam:false});
   box('mat',0,1.2,0,2.2,1.2,1.8,P('bamboo'));const rf=isSaddle({L:2.2,W:1.8,eaveY:2.4,ridgeY:3.4,sag:.2,hornRise:.7,hornOut:.3,taper:.6,over:.4,th:.14,nu:12,mk:'thatch',col:P('thatchW')});isLogLadder(0,1.0,0,1.2);});
  W(4,0,3,0,()=>{ellip('water',0,0,0,2.2,.05,1.5,0x4a6a5a,0,14);isPen(0,0,6,4.4,{});});place('duck',3.6,2.6,.4,{sub:'west'});place('hen',2.4,-.6,1,{sub:'west'});
  isCutFloor(0);W(-4,0,4.2,0,()=>{iwShed({L:2.8,D:2.2,postH:2,carved:false,back:true,roof:{ridgeH:1.1,hornRise:.5,hornOut:.25,taper:.4,over:.5,patch:.5}});
   isFurn([['generic_poor_bed',0,.12,-.5,0],['generic_poor_stool',.8,.12,.3,0],['generic_eggs',-.9,.12,.4,0],['generic_basket',-.4,.12,.6,0]]);});
  door(-4,.12,5.3,0,2);}});
defBuilding({key:'iw-byre',name:'Buffalo byre (West)',seed:5370,cut:true,w:16,d:12,h:8.5,budget:90000,
 tags:{types:['farm'],wealth:'middle',style:'west',role:'dairy',job:'herding'},
 note:'the water buffalo\'s byre: a long open shed under a horned roof, hay racks and troughs, the milking stools and the milk jars, a wallow beside it',
 build(o){iwShed({L:9,D:5,postH:2.4,roof:{ridgeH:2.2,hornRise:1.8,hornOut:.9}});
  isFurn([['generic_trade_hayrack',-3,.12,-2,0],['generic_trade_trough',0,.12,-2,0],['generic_trade_hayrack',3,.12,-2,0],['generic_dairy',3.6,.12,1.6,0],['generic_churn',2.6,.12,1.8,0],['generic_poor_stool',1.6,.12,1.4,0]]);
  place('buffalo',-2,.4,PI/2,{sub:'west'});
  isNoCut(()=>{ellip('earth',-5.6,0,4.2,2.0,.06,1.4,0x4a3a2a,0,12);ellip('water',-5.6,.03,4.2,1.5,.04,1,0x5a5a48,0,12);});
  door(0,.12,2.6,0,3);}});
/* ---------------------------------------------------------------- the harbour's new trades (shore row: land at z > 0, the sea at z < 0) */
defBuilding({key:'iw-quay',name:'Quay and cargo shed (West)',seed:5204,cut:true,w:22,d:30,h:12.4,budget:150000,
 tags:{types:['infrastructure'],wealth:'middle',style:'west',role:'dockers',job:'warehousing'},
 note:'the trading quay where the dockers load and unload: a broad timber quay on tarred piles with bollards, shear legs for the heavy cargo, bales and jars waiting, and the cargo shed on the shore under a horned roof',
 build(o){const y=.5;isNoCut(()=>{iwPier(0,1.5,-12,8,y,{bollards:true,step:2.4});iwShearLegs([-3,y,-9],[-1.4,y,-10.6],[-2.2,5.2,-11.6],[-2.2,y,-6],y);
   isCargo(1.6,-4,0,6);iwCanoe(-6.2,-7.5,.05,{L:7});iwCanoe(6.2,-9,-.08,{});});
  W(0,0,8.6,0,()=>{iwShed({L:12,D:5,postH:2.6,back:true,roof:{ridgeH:2.6,hornRise:2.2,hornOut:1.2}});
   isFurn([['generic_trade_bin',-4.6,.12,-1.4,0],['generic_trade_bin',-3,.12,-1.4,0],['job_bales',-.6,.12,-1.4,0],['generic_storage_jar',1.2,.12,-1.4,0],['generic_crate',3,.12,-1.2,.2],['generic_barrel',4.8,.12,-1.3,0]]);});
  door(0,.12,11.1,0,4);}});
defBuilding({key:'iw-canoeshed',name:'War-canoe shed (West)',seed:5205,cut:true,w:16,d:30,h:13.4,budget:170000,
 tags:{types:['infrastructure','civic'],wealth:'rich',style:'west',role:'coast guard'},
 note:'the coast guard\'s war-canoe shed: a long kora-kora drawn up on its cradle under a great horned roof, the paddles and spears racked, the crew\'s lockers and bunks at the back, a slipway down into the sea',
 build(o){const SL=.09;isNoCut(()=>{iwSlip(0,12,-6,.9,SL);});
  W(0,0,5,0,()=>{W(0,0,0,PI/2,()=>{iwShed({L:16,D:7,postH:3,carved:true,roof:{ridgeH:3.2,sag:1.2,hornRise:3,hornOut:1.6,taper:1}});});
   W(0,.9,0,0,()=>iwHull({L:15,B:.95,D:1.2,ribs:[.04,.96,20],plank:[.04,.96,.9]}));
   for(let k=0;k<5;k++)box('wood',0,.12,-6+k*3,2.6,.7,.4,P('woodD'));
   isFurn([['generic_trade_weapon_rack',-2.9,.12,-6,PI/2],['generic_trade_weapon_rack',2.9,.12,-6,-PI/2],['generic_trade_bunk',-2.7,.12,6.6,0],['generic_trade_locker',2.7,.12,6.8,0],['job_pole_rack',2.8,.12,2,-PI/2]]);});
  door(0,.12,13.6,0,4);}});
defBuilding({key:'iw-ferry',name:'Ferry landing (West)',seed:5206,cut:true,w:14,d:24,h:10,budget:90000,
 tags:{types:['infrastructure'],wealth:'poor',style:'west',role:'ferry'},
 note:'the ferrymen\'s landing: a jetty out to the deep water, the ferry canoes moored to it, a little horned shelter where the passengers wait and the fares are paid',
 build(o){const y=.5;isNoCut(()=>{iwPier(0,1.5,-11,2.4,y,{bollards:true});iwPier(0,-11,-12.6,5.4,y,{});iwCanoe(2.2,-8,0,{L:6.4});iwCanoe(-2.4,-10.4,.1,{L:5.6});});
  W(0,0,5.6,0,()=>{iwShed({L:4.4,D:3,postH:2.2,back:true,roof:{ridgeH:1.5,hornRise:.9,hornOut:.4,taper:.5}});
   isFurn([['islander_common_bench',-.9,.12,-.9,0],['islander_common_bench',.9,.12,-.9,0,{v:1}],['generic_strongbox',1.6,.12,.5,-PI/2],['islander_common_stool',.6,.12,.6,0]]);});
  door(0,.12,7.2,0,2.4);}});
/* ---------------------------------------------------------------- the mine: it works the nearest mineable node (kits/resources, resSource) */
defBuilding({key:'iw-mine',name:'Mine (West)',seed:5373,cut:true,w:20,d:16,h:9,budget:120000,
 tags:{types:['industry'],wealth:'poor',style:'west',role:'mine',job:'mining'},
 note:'the miners\' workings: an adit timbered into the hillside and a shaft under a windlass, the ore carried out in baskets, broken and sorted in an open shed under a horned roof, the dressed ore heaped for the carriers. It works the nearest iron, copper or gold node within reach; the node\'s grade sets its yield',
 build(o){const metal=o.metal||'iron';isAdit(0,-5,0,{});isNoCut(()=>{isWindlass(-6.4,-1.6,0);isOrePile(5.6,2.6,metal,1.2);isOrePile(7.2,4.4,metal,.8);});
  W(-1,0,4.4,0,()=>{iwShed({L:6,D:3.6,postH:2.3,carved:false,back:true,roof:{ridgeH:1.6,hornRise:1,hornOut:.5,taper:.6,patch:.45}});
   isFurn([['islander_common_workbench',-1.6,.12,-1,0],['generic_basket',0,.12,-1.1,0],['generic_basket',.7,.12,-1,.4],['generic_crate',2.1,.12,-.9,0],['job_pole_rack',2.4,.12,.6,-PI/2],['generic_sack',-.4,.12,.6,0]]);});
  door(-1,.12,6.3,0,3);}});
