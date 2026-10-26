// prefix: yt
// ================================================================= HEAT AND BATH, THE WORKS (PLAN.md sections 4 and 6, Y4)
// Fire belongs to stone (PLAN.md section 1): the bathhouse, the smithy and the kitchen house are stone domes; the works that
// need no fire are pycrete. The bath and the smithy share a heat-storing wall with the room beside them in a town (the
// shared-heat rule, section 4); on the sheet each stands alone and records it.
//   yt_bathhouse     the banya and the sweat lodge: tiered slab benches round the town's largest stone stove, water butts
//   yt_smithy        the smith's stone dome: forge, anvil, quench, the iron and charcoal store
//   yt_kitchen_house the clan's cooking house: a stone stove with pots, the larder shelves, the meal tables
//   yt_tannery       a pycrete work dome for scraping and smoking hides, its racks outside in the wind
//   yt_weaving_house the qiviut combers' and weavers' lined dome: looms, the combed wool in baskets
//   yt_carvers_house the carvers' lined dome: soapstone blocks, antler, the figures on the benches
//   yt_tea_house     a lined dome where Ivan-chai is brewed and drunk, the travellers' warm room
//   yt_goldroot_house the goldroot (roseroot) drying house: racks under a turf lean-to, open to the dry wind
ytRoomDef({key:'yt_bathhouse',name:'Bathhouse (banya and sweat lodge)',seed:9501,dims:{Rr:3.6,Ho:4.2,kind:'stone',pass:2.8},budget:110000,
 tags:{types:['civic'],wealth:'middle',style:'common',role:'bath',job:'healing'},opts:{window:false},
 note:"the town's largest stone stove under heaped stones, tiered slab benches round it, water butts and birch-twig whisks; its spare heat goes to the room beside it through a shared mass wall, never into the tunnels",
 inside(D){ytStoneStove(0,D.yFl,-D.Rr+1.4,0,1.8,1.4,1.1);
  for(const [r,h] of [[D.Rr-.45,.45],[D.Rr-1.0,.9]])ytBenchRing(r,PI*.7,PI*2.3,D.yFl+h-.45);
  for(const x of [-1.4,1.4])FURNISH('generic_barrel',x,D.yFl,1.6,0);FURNISH('generic_herb_bundles',0,D.yFl,1.8,0);FURNISH('generic_soap',-.6,D.yFl,2.0,0);
  wkPad(0,.6,D.Rr*1.2,D.Rr,D.yFl);
  return {stove:{kind:'mass',mass_t:4.5,burns:'twice a day',note:'the heaped stones store the heat; the doorway lets the steam out low'},lamps:1,fuel:['larch','dung'],sharedWall:'the room beside it in a town'};}});
ytRoomDef({key:'yt_smithy',name:'Smithy',seed:9503,dims:{Rr:3.2,Ho:4.0,kind:'stone',pass:2.8},budget:100000,
 tags:{types:['industry'],wealth:'middle',style:'common',role:'smithy',job:'smithing'},opts:{window:false},
 note:'a stone dome round a stone forge with its hood flue and hide bellows, an anvil, a quench, the iron and charcoal store; the forge\'s spare heat warms the next room through a shared wall',
 inside(D){ytForge(0,D.yFl,-D.Rr+1.2,0);ytAnvil(.4,D.yFl,.2,.4);FURNISH('generic_barrel',-1.3,D.yFl,.4,0);FURNISH('generic_fuel',1.6,D.yFl,-.6,0);FURNISH('generic_crate',-1.6,D.yFl,-1.2,0);FURNISH('generic_sack',1.4,D.yFl,1.2,0);
  wkPad(0,.6,D.Rr*1.2,D.Rr,D.yFl);return {stove:{kind:'forge',note:'burned while the smith works; its stack a quarter taller for the thin air'},lamps:0,fuel:['charcoal','larch','coal where a node is near'],sharedWall:'the next room in a town'};}});
ytRoomDef({key:'yt_kitchen_house',name:'Kitchen house',seed:9505,dims:{Rr:3.0,Ho:3.8,kind:'stone',pass:2.6},budget:100000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'common',role:'kitchen',job:'baking'},
 note:"the clan's cooking house: a stone stove with its pots, the larder shelves, the meal tables; a clan cooks once for every house round it",
 inside(D){ytStoneStove(0,D.yFl,-D.Rr+1.1,0,1.6,1.1,.9);FURNISH('generic_stew_pot',-.3,D.yFl+.9,-D.Rr+1.1,0);FURNISH('generic_pantry_shelf',-1.9,D.yFl,-.4,PI/2);
  FURNISH('generic_hanging_larder',1.7,D.yFl,-.6,-PI/2);FURNISH('generic_bread_basket',.8,D.yFl,.9,0);FURNISH('generic_meal',-.5,D.yFl,1.0,0);FURNISH('generic_churn',1.5,D.yFl,1.0,0);
  wkPad(0,.6,D.Rr*1.2,D.Rr,D.yFl);return {stove:{kind:'mass',mass_t:2.2,burns:'morning and evening'},lamps:1,fuel:['larch','dung']};}});
ytRoomDef({key:'yt_tannery',name:'Tannery',seed:9507,dims:{Rr:3.0,Ho:3.6,pass:2.4},budget:90000,
 tags:{types:['industry'],wealth:'poor',style:'common',role:'tannery',job:'tanning'},opts:{lined:false,heated:false},
 note:'an unlined pycrete work dome for scraping and soaking hides; the stretching racks stand outside in the wind',
 inside(D){ytRack(-1.1,D.yFl,-1.4,.5,1.6,1.7,'hide');ytRack(1.2,D.yFl,-1.3,-.5,1.6,1.7,'hide');FURNISH('generic_barrel',0,D.yFl,.6,0);FURNISH('generic_barrel',1.0,D.yFl,1.0,0);FURNISH('generic_floor_basket',-1.2,D.yFl,.9,0);FURNISH('generic_crate',-.4,D.yFl,1.6,0);
  wkPad(0,0,D.Rr*1.2,D.Rr*1.2,D.yFl);return {stove:null,lamps:0,heated:false};},
 after(D){ytRack(-3.6,0,1.5,PI/2,2.4,2.0,'hide');ytRack(3.6,0,1.5,PI/2,2.4,2.0,'hide');}});
ytRoomDef({key:'yt_weaving_house',name:'Qiviut weaving house',seed:9509,dims:{Rr:3.2,Ho:3.7,pass:2.4},budget:100000,
 tags:{types:['industry'],wealth:'middle',style:'common',role:'weaving',job:'weaving'},
 note:"the musk-ox underwool's combers and weavers in a lined dome: two upright looms, the combed qiviut in baskets, lengths of felt and cloth",
 inside(D){ytLoom(-1.2,D.yFl,-1.6,.45);ytLoom(1.2,D.yFl,-1.6,-.45);FURNISH('generic_basket',0,D.yFl,-.2,0);FURNISH('generic_floor_basket',-1.4,D.yFl,.6,0);FURNISH('generic_sewing',1.2,D.yFl,.4,0);FURNISH('generic_chest',1.8,D.yFl,-.6,-PI/2);
  ytRug('felt',0,D.yFl,.9,1.6,1.0,0);ytLamp(0,D.yFl,1.2,0);wkPad(0,0,D.Rr*1.2,D.Rr*1.2,D.yFl);return {stove:null,lamps:1,fuel:'fat'};}});
ytRoomDef({key:'yt_carvers_house',name:"Carvers' house",seed:9511,dims:{Rr:3.0,Ho:3.6,pass:2.4},budget:100000,
 tags:{types:['shop'],wealth:'middle',style:'common',role:'carvers',job:'masonry'},
 note:'a lined dome where soapstone, antler and horn are carved: blocks on the floor, figures on the benches, the engraved panels',
 inside(D){ytBenchRing(D.Rr-.5,PI*1.1,PI*1.9,D.yFl);for(let i=0;i<5;i++){const a=PI*(1.18+i*.16);sph('soap',Math.cos(a)*(D.Rr-.5),D.yFl+.6,Math.sin(a)*(D.Rr-.5),.12,P('ice'),1.4,8);}
  box('soap',-.8,D.yFl,.2,.6,.4,.5,P('ice'));box('soap',.7,D.yFl,.5,.5,.5,.4,P('ice'));box('antler',0,D.yFl+.5,-D.Rr+.3,1.6,.6,.03,P('ice'));
  ytLamp(0,D.yFl,.9,0);FURNISH('generic_crate',1.6,D.yFl,-.2,0);FURNISH('generic_basket',-1.5,D.yFl,.7,0);FURNISH('generic_tea_set',.9,D.yFl,1.3,0);FURNISH('generic_chest',-1.7,D.yFl,-.5,PI/2);wkPad(0,0,D.Rr*1.2,D.Rr*1.2,D.yFl);return {stove:null,lamps:1,fuel:'fat'};}});
ytRoomDef({key:'yt_tea_house',name:'Tea house (Ivan-chai)',seed:9513,dims:{Rr:3.2,Ho:3.7,pass:2.4},budget:100000,
 tags:{types:['tavern'],wealth:'middle',style:'common',role:'tea house'},
 note:'the travellers\' warm room: fireweed tea brewed over lamps and drunk on the benches; robes, a fur-mosaic rug',
 inside(D){ytBenchRing(D.Rr-.55,PI*.7,PI*2.3,D.yFl);ytRug('mosaic',0,D.yFl,0,2.0,2.0,0);for(const x of [-.6,.6])FURNISH('generic_tea_set',x,D.yFl+.02,0,0);
  FURNISH('generic_snack_bowl',0,D.yFl+.02,.7,0);FURNISH('generic_water',1.7,D.yFl,1.2,0);ytLamp(0,D.yFl,-D.Rr+.8,0);ytLamp(-1.6,D.yFl,1.2,0);wkPad(0,0,D.Rr*1.2,D.Rr*1.2,D.yFl);return {stove:null,lamps:2,fuel:'fat'};}});
/* the goldroot house: drying racks under a turf lean-to on larch posts, open to the dry wind on the lee side */
defBuilding({key:'yt_goldroot_house',name:'Goldroot drying house',seed:9515,w:8,d:6,h:3.2,budget:40000,
 tags:{types:['farm'],wealth:'middle',style:'common',role:'drying',job:'healing'},
 note:'the roseroot (goldroot), the High Country\'s remedy and trade good, dried four or five years\' growth at a time on racks under a turf lean-to',
 build(o){CURREC.season='summer';CURREC.layers=[{k:'turf',m:.2}];CURREC.heat={stove:null,heated:false,crownVent:0};
  for(const x of [-3.4,-1.15,1.15,3.4]){pole('larch',[x,0,-2.2],[x,2.7,-2.2],.08,P('larch'));pole('larch',[x,0,2.2],[x,2.0,2.2],.08,P('larch'));}
  ytQuad('turf',[-3.8,2.0,2.6],[3.8,2.0,2.6],[-3.8,2.8,-2.6],[3.8,2.8,-2.6],P('turf'),[0,1,.3]);
  ytQuad('larch',[-3.6,0,-2.3],[3.6,0,-2.3],[-3.6,2.6,-2.3],[3.6,2.6,-2.3],P('larch'),[0,0,1]);
  for(const x of [-2.25,0,2.25])ytRack(x,0,0,0,1.9,1.8,'root');FURNISH('generic_sack',-3,0,1.4,0);FURNISH('generic_floor_basket',3,0,1.4,0);door(0,0,2.4,0,4);}});
