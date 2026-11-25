// ================================================================= HOST — STATION: Fleetborn Cove (Station 6; settlements/fleetborn-cove/PLAN.md section 1)  [G data]
// Registered here (44z, after 41-biome-arch-sites.js and before 45-host-stage.js) so 40, 41 and 50 stay untouched for downstream builds.
// Scale model 5.1e23, px [236, 242]: a sinuous drowned-gjar pocket fjord opening NNW into the Arch Sea across a -9 to -14 m pillow-lava and
// serpentinite sill, plunging SSE into a calm -45 to -59 m inner sanctuary basin under a +246 m eastern ophiolite/laterite gorge wall (with the
// +76 m Arcoforte cliff-prow spur reserved in KTAGS as site:fleetborn-arcoforte), sheltered on the west by a +48..+156 m dark basalt headland,
// and narrowing at its SSE head into a +7..+22 m tectonic gjar fissure neck. Plain data: no THREE, no DOM, no Math.random.
const STATION_KEY='cove';
ARCH_SITES.cove={
 key:'cove',
 name:'Fleetborn Cove and the ophiolite sill',
 px:[236,242],
 world:[472000,484000],
 sky:{px:-36,py:-88},
 base:12,
 sea:0,
 atm:1.60,
 koppen:'Am',
 rain:1750,
 temp:{mean:28,warm:33,cold:24,low:19},
 soil:28,
 lat:-21.5,
 tide:{range:14,low:-7,high:7},
 axis:[0.422618,0.906308],
 sill:{s:-790,depth:[-13.8,-9.2],raceSpeed:5.2,raceLen:420,raceW:138},
 basin:{s:[-450,720],depth:-58.5,width:[280,450]},
 gjar:{s:[1080,2550],saddle:[7.5,21.5],wd:38},
 arcoforte:{id:'site:fleetborn-arcoforte',s:-370,du:118,r:96,clearR:84,elev:[55,95]},
 /* Type II (Ca-OH, pH > 11) serpentinite fault-contact cliff seeps draping multi-tiered tufa and brucite-carbonate curtains down the gorge wall */
 weeps:[
  {key:'w0',s:-645,side:1,du:90,r:9,flow:9.5,w:21},
  {key:'w1',s:-490,side:1,du:92,r:10,flow:11.0,w:24},
  {key:'w2',s:-85,side:1,du:96,r:11,flow:13.5,w:27},
  {key:'w3',s:285,side:1,du:90,r:10,flow:10.0,w:22},
  {key:'w4',s:640,side:1,du:88,r:8,flow:7.0,w:18}
 ],
 /* Shallow fault-ledge zones (-8..+5 m) where alkaline seep water meets Mg-rich seawater to build Lost-City brucite-carbonate White Stacks */
 stacks:{n:14,zones:[[-835,-645,1],[-815,-635,-1],[-160,360,1],[180,680,-1]]},
 /* Ultramafic seep/garnierite hollows on the +145..+246 m eastern nickel-laterite plateau */
 hollows:[
  {s:-220,du:540,r:125,depth:14},
  {s:260,du:680,r:145,depth:17},
  {s:760,du:590,r:115,depth:13}
 ],
 /* Chimaera abiotic H2/CH4 cleft-flames in a dry serpentinite fault cleft on the western/sill bluff overlooking the tidal race */
 flames:{s:-745,side:-1,du:46,len:118,n:9},
 seed:0x4A2C06
};
