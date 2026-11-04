// ================================================================= HOST — the station's site: the Cave of Crystals (the Hearth hold's drained storey)
// Scale model 5.1 px 525,1400 (biomes/KARST-SITES-5.1.md site 4; biomes/CRYSTAL-CAVES-5.1.md site 1; PLAN.md section 18). The shelf G (3,736 m) is
// drawn as y = 0; every height below is metres under it. NET is site 4's KKARST.network, whole (1.8 km): the page crops it round FOCUS, never edits it.
// HOLD names the network's chambers the hold's massing takes (proposed: the cooler chambers round the feeders) and the shapes the station cuts for it.
// The station's crystal numbers raise KSPELEO.SELENITE's as the preset allows at 0.75 g (CRYSTAL-CAVES-5.1.md, "The modules").
const SITE={key:'crystals',name:'The Cave of Crystals',region:'The Hearth hold, the drained storey (rift rim N)',px:525,py:1400,G:3736,
 koppen:['Dsc'],atm:1.00,rain:753,surfaceT:2,
 world:52514,
 /* the shelf over the hold: a few metres of swell, falling gently toward the trough (south) */
 ground:(x,z)=>4*Math.sin(x/230)+3*Math.cos(z/170)-z*.004,
 /* site 4's network (KARST-SITES-5.1.md): the active storey at G - 70 under the table, the drained storey at G - 40, the Naica in it; the rim's
    strike as the joints' angle and two of its faults for the feeders */
 net:{box:[-900,-900,900,900],kind:'hypogene',level:-70,table:-69,temp:55,
  levels:[{y:-40}],crystal:{storeys:[1],speleo:'SELENITE'},form:'maze',p:.45,joints:{angle:.35,sp:55},
  feeders:{cell:300,p:.6,depth:200,faults:[[-900,-420,900,-120],[-900,260,900,560]]},
  chamber:{p:.4,r:[20,60],h:[12,32]},cupola:{p:.7,n:[1,4],r:[4,10],h:[3,8]},thin:12,outlet:[0,900],w:[3,8],h:[3,7]},
 focus:'ch:n1:-11,-3',half:180,          /* the page: 360 m round the drained storey's largest feeder chamber */
 cell:1,chunk:16,                        /* KCAVERN's lattice: 1 m (the chambers are 60-110 m across) */
 /* the drained storey's warmth (KTHERM): the rock's own over the feeders' rising heat */
 therm:{soil:24,T:52,reach:170,decay:2.2},
 /* THE CRYSTALS (KSPELEO kinds). beams: the megacrystals in the feeder chambers; floor: the bladed gypsum floor ("shark teeth") and blocks
    elsewhere in the storey; cell in metres */
 crystals:{
  beams:{cell:3,kinds:{beam:{p:.3,len:[6,18],r:[.5,1.25],el:[.05,1.1],minGap:4,mineral:'selenite'},
   block:{p:.22,len:[.5,2.2],r:[.4,1.4],n:[2,6],mineral:'selenite'},druse:{p:.55,len:[.3,1.3],r:[1,2.8],n:[26,48],mineral:'gypsum'}}},
  floor:{cell:3,kinds:{block:{p:.06,len:[.3,1.2],r:[.3,.9],n:[2,4],mineral:'selenite'},druse:{p:.4,len:[.15,.7],r:[.8,2.2],n:[12,28],mineral:'gypsum'}}}},
 /* THE HOLD'S MASSING (proposed; PLAN.md section 18): the cooler chambers, a shelf cut in each, the night road up and the way down */
 hold:{chambers:{'ch:n1:-11,-2':'The north chamber (the hold\'s hall)','ch:n1:-10,-3':'The east chamber','ch:n1:-13,-4':'The south chamber'},
  shelf:{up:4,depth:8,half:9,h:4.5,rise:1.2},
  road:{from:'ch:n1:-11,-2',w:4.5,h:4,grade:.14},       /* the night road: a rising gallery toward the shelf's surface */
  down:{from:'ch:n1:-13,-4',w:3,h:3.2,pitch:.55},        /* the way down: a stair toward the active storey (pitch: rise over run) */
  clear:3},                                              /* m of headroom a volume's record promises over its floor at least */
 heat:{danger:1,soak:{full:1500,from:0,out:2400}},       /* Naica's air: 50 degC at 100% humidity kills an unprotected visitor in tens of minutes */
 vent:{r:1.6,r1:2.6}};                                    /* the vent's throat from a cupola's crown up through the shelf */
