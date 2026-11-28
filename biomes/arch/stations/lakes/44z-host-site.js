// ================================================================= HOST — STATION: The axial rift lakes and inter-lake river (Station 7)  [G data]
// Registered here (44z, after 41-biome-arch-sites.js and before 45-host-stage.js) so 40, 41 and 50 stay untouched for downstream builds.
// Scale model 5.1 (nw_expansion.py section 3B), px [403, 170]: the dry alluvial rift-valley neck between Axial Rift Lake 3 (px 381,172; 1,184 km2,
// -95 m max depth) in the WSW and Axial Rift Lake 4 (px 418,168; 456 km2, -48 m max depth) in the ENE, flanked by the +590 m NNW and +440 m SSE
// serpentinite-and-laterite horsts. Zero marine tide and zero salt: the Arch Axial River (headwater chain of 9103 Mere-Upe) links the +14.5 m upper
// freshwater rift lake across a 1.34 km laterite-and-awaruite cobble sill down to the +6.0 m lower rift lake, joined by a Type II Ca-OH fault-foot
// travertine spring on the NNW horst scarp, an oxbow sedge-fen tarn on the SSE terrace, and a Chimaera H2/CH4 cleft on the SSE fault step.
const STATION_KEY='lakes';
ARCH_SITES.lakes={
 key:'lakes',
 name:'The axial rift lakes and inter-lake river',
 px:[403,170],
 world:[806000,340000],
 sky:{px:131,py:-160},
 base:18,
 atm:1.59,
 koppen:'Am',
 rain:1976,
 temp:{mean:29,warm:33,cold:24,low:19},
 soil:29,
 lat:-19.6,
 axis:[0.920505,-0.390731],
 upperLake:{sMax:-620,level:14.5,depth:-38.0,halfW:780},
 lowerLake:{sMin:720,level:6.0,depth:-34.0,halfW:820},
 river:{s0:-612,s1:696,width:28,speed:1.35,meanderAmp:94},
 oxbow:{s:135,a:-245,r:46,level:11.4,depth:2.8},
 springs:[{key:'lk1',s:-175,a:468,r:11,flow:9,T:62,reach:58}],
 alkPool:{s:-78,a:258,r:21},
 hollows:[
  {s:-280,a:-540,r:118,depth:15},
  {s:310,a:590,r:132,depth:17}
 ],
 flames:{s:255,a:-495,len:115,n:7},
 seed:0x4A2C07
};
