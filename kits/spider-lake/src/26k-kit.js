// ================================================================= THE KIT: identity, library families, cloth buckets & palette ([G data])
// The Silk Principality of Spider Lake (1288, 220) & Ham-Tsek (1055, 219), culture 'spider-lake' (kits/spider-lake/PLAN.md).
// Core structural separation: cream dolomite / red-porphyry masonry piers & colonnades and vermilion/ebony-lacquered cedar
// compression masts carry ALL vertical loads; spider-silk velaria, hyperbolic-paraboloid saddle canopies, shamiyana awnings,
// evaporative hanging wind-veils, and 20 m dyed canal bolts work purely in tension, shade, and breeze-cooling.
const KIT={id:'spider-lake',title:'Spider Lake and Ham-Tsek Kit',pack:'spider-lake',culture:'spider-lake',
 faction:'Silk Principality of Spider Lake',band:'Hum-Ria',frag:'kits/spider-lake',
 ground:0x9e9a88,groundProc:0x989482,fog:0xd6deda,furnDetail:.6};
const SL={DOOR_H:2.15,WALL:.38,SOCLE:.44,PLINTH:.54,RISER:.18,BAY:3.4};
const SL_POLITIES={
 spiderLake:{hum:'Hām-Spī',coords:[1288,220],role:'Silk Principality lakeside capital, palace pavilions and Great Hum Sanctuary'},
 silkhead:{hum:'Spī-Kōr (Silkhead)',coords:[1288,220],role:'spillway caravan entrepot & great central caravanserai linking Spider Lake, Outland Gate and Hām-Tsēk'},
 hamTsek:{hum:'Hām-Tsēk',coords:[1055,219],role:'western stone-colonnade market, weir-bastion and canal dye-works sister town'}};
/* MAT key -> packed library family (materials.json). Includes kits/resources ore keys and engine fallback keys so 100% of
   opaque/lit surfaces in the scene carry real library maps. */
const SV_LIB={
 dolomite:'dolomite',porphyry:'porphyry',travertine:'travertine',paving:'paving',mosaic:'mosaic',plaster:'plaster',carve:'carve',
 cedar:'cedar',lacquer:'lacquer',ebony:'ebony',timber:'timber',wood:'wood',floor:'floor',bamboo:'bamboo',
 bronze:'bronze',verdigris:'verdigris',gold:'gold',iron:'iron',jade:'jade',terracotta:'terracotta',celadon:'celadon',tile:'tile',
 silk:'silk',velarium:'velarium',shamiyana:'shamiyana',veil:'veil',streamer:'streamer',brocade:'brocade',cocoon:'cocoon',
 reed:'reed',rope:'rope',flag:'flag',plain:'plain',brass:'brass',bone:'bone',
 stone:'stone',earth:'earth',sand:'sand',marble:'marble',gossan:'gossan',malachite:'malachite',quartz:'quartz',
 cassiterite:'cassiterite',galena:'galena',pegmatite:'pegmatite',coal:'coal',sulphur:'sulphur',efflor:'efflor',
 tar:'tar',potash:'potash',soda:'soda',schistem:'schistem',turq:'turq'};
const SV_TILE0={
 dolomite:1.8,porphyry:1.5,travertine:2,paving:2.2,mosaic:1.6,plaster:2.2,carve:1.4,
 cedar:1.5,lacquer:1.4,ebony:1.4,timber:1.6,wood:1.2,floor:1.8,bamboo:1.1,
 bronze:.8,verdigris:.9,gold:.6,iron:.8,jade:.7,terracotta:1.2,celadon:1.4,tile:1.5,
 silk:1.2,velarium:1.4,shamiyana:1.1,veil:.9,streamer:.95,brocade:1.1,cocoon:.6,
 reed:1,rope:.28,flag:1,plain:1.4,brass:.5,bone:.5,
 stone:2.4,earth:2.8,sand:3,marble:1.6,gossan:2,malachite:1.5,quartz:1.5,
 cassiterite:1.5,galena:1.5,pegmatite:1.5,coal:1.5,sulphur:1.6,efflor:2,tar:3,potash:1.6,soda:1.6,schistem:2,turq:.8};
/* Every tensile spider-silk family joins SV_CLOTH: double-sided, carries aFlut pin-weights from CLOTHW, and hooks ATMOS wind. */
const SV_CLOTH={silk:1,velarium:1,shamiyana:1,veil:1,streamer:1,brocade:1,flag:1};
const SV_CUT=Object.assign({
 dolomite:1,porphyry:1,travertine:1,plaster:1,carve:1,cedar:1,lacquer:1,ebony:1,timber:1,wood:1,bamboo:1,
 bronze:1,verdigris:1,terracotta:1,celadon:1,tile:1,reed:1,plain:1},SV_CLOTH);
const KIT_FALLBACK=[];
const SVPAL={
 dolomite:[0xede6d6,0xe6decb,0xf2ece0],dolomiteD:[0xd4cab6,0xcbc0aa],
 porphyry:[0x7e2e2c,0x722624,0x8a3632],porphyryL:[0x98443e,0x8e3c38],
 travertine:[0xdfd5be,0xd6cbb2],paving:[0xc4bca8,0xb8b09c],mosaic:[0xe6dfd0,0xdcd4c2],
 plaster:[0xf4f0e6,0xeee9dc,0xf7f4ec],carve:[0xd8ceb8,0xcec2aa],
 cedar:[0x8c5e3c,0x805434,0x986844],cedarD:[0x644028,0x583822],
 lacquer:[0xb8291e,0xa82218,0xc43224],ebony:[0x261e1c,0x1e1816,0x2e2420],
 timber:[0x8a6442,0x7e5a3a],wood:[0x7c5638,0x704c30],woodD:[0x483220,0x3e2a1b],
 floor:[0x9a7450,0x8e6846],bamboo:[0x9ab07a,0x8ca46e],
 bronze:[0xa87e42,0x9a7238,0xb48a4c],verdigris:[0x4e8874,0x427a68],
 gold:[0xdcb244,0xcfa438],iron:[0x423e3a,0x36322e],brass:[0xc4983e,0xb48a34],
 jade:[0x3e8868,0x327a5c,0x4c9674],bone:[0xeae2ce,0xdfd6c0],
 terracotta:[0xb85c3c,0xaa5234],celadon:[0x84a896,0x789c8a],tile:[0x5a6268,0x4e565c],
 /* Spider-silk palette: waxed amber broadcloth, saffron, cochineal crimson, raw ivory, indigo, lake turquoise, golden dragline */
 silkAmber:[0xdca038,0xd2942e,0xe6ac44],silkSaffron:[0xe8a828,0xdc9c20,0xf0b434],
 silkCrimson:[0xb42428,0xa61e22,0xc22c30],silkIvory:[0xf5efe0,0xeee6d4,0xf8f4e8],
 silkIndigo:[0x284678,0x223c6a,0x305286],silkTurquoise:[0x2c8e94,0x248086,0x369ca2],
 silkCeladon:[0x78ab96,0x6c9e8a],silkGold:[0xe6bc4c,0xdab040],
 cocoon:[0xf6dfa4,0xf0d696,0xfbe6b2],cocoonLit:[0xffd478,0xffca64],
 reed:[0xc2aa72,0xb69e66],rope:[0xd4b25c,0xc8a650],
 stone:[0x948e82,0x888276,0xa09a8e],stoneD:[0x686258,0x5c564e],earth:[0x8a7254,0x7e6648],sand:[0xd6ccb4,0xcac0a8],
 water:[0x3c7882,0x326c76],flame:[0xffb858],ember:[0xff7424]};
function P(k){return jc(pick(SVPAL[k]),.04);}
