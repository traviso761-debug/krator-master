// prefix: et
// ================================================================= THE PROFILE SAMPLES: the P1 test row (PLAN.md section 11)
// Not buildings: fragments of the grammar on their own, so a helper can be judged before a building takes it (class
// feature, kind sample). The State's buildings (P4) are made of these.

/* the stepped pier bundle in pale brick, figures' niches under the pier tops, a verdigris spire, a lancet bundle in onyx
   under a stepped head with an oculus, a circuit-maze band across the piers */
defBuilding({key:'et_sample_piers',name:'Profile: the stepped pier bundle',seed:7991,cls:'feature',kind:'sample',w:16,d:7.4,h:32,budget:60000,
 front:{x:0,z:3.7,yaw:0},tags:{style:'ministry'},
 note:'nine piers in organ-pipe ranks with set-back caps, niches for figures, a verdigris spire; five onyx lancets under a stepped head and an oculus; a circuit-maze band',
 build(o){const R=etPierBundle({n:9,w:14,d:5,h0:12,step:2,mk:'brick',col:P('brick'),spire:9,niches:true});
  etLancets(0,1.0,2.5+.27,{n:5,w:.9,h:6.2,step:.6,oculus:.7,light:'onyx',headCol:P('limeShade')});
  etMazeBand(0,10.2,2.5+.27,14,.7);
  /* a faceted head in every niche, eyes closed, in the metals of rank across the bundle */
  R.niches.forEach((q,i)=>etHead(q[0],q[1]+.04,q[2]-.25,R.pw*.62,{metal:['gunmetal','bronze','silver','gold'][Math.min(3,Math.min(i,R.niches.length-1-i))]}));
  box('stone',0,0,0,15,.5,6.2,P('stoneD'));}});

/* a ministry hall's wall: pale brick on a dark plinth, seven onyx lancets with their tracery grids, the face frieze under
   the cornice */
defBuilding({key:'et_sample_lancets',name:'Profile: lancets, tracery and the frieze',seed:7992,cls:'feature',kind:'sample',w:12,d:2.4,h:13.4,budget:50000,
 front:{x:0,z:1.2,yaw:0},tags:{style:'ministry'},
 note:'a pale brick wall: seven onyx lancets in a stepped bundle, each in its bronze tracery grid; the face frieze; a dark stone cornice',
 build(o){box('stone',0,0,0,11,.8,1.4,P('stoneD'));box('brick',0,.8,0,10.4,11.2,.8,P('brick'));
  etLancets(0,1.6,.42,{n:7,w:.95,h:6.6,step:.45,light:'onyx',headCol:P('brick')});
  etFrieze(0,10.0,.42,10.4,1.5);
  box('stone',0,12.0,0,11,.5,1.4,P('stoneD'));box('stone',0,12.5,0,9.6,.4,1.1,P('stoneD'));}});

/* the court's screens: two pierced bronze screens in a dark stone wall, the banner of the sign either side, a circuit-maze
   band over them. The screens and the band take their take per instance (38-et-alt.js): the row places three */
defBuilding({key:'et_sample_screens',name:'Profile: screens, banners and the maze',seed:7993,cls:'feature',kind:'sample',w:11,d:2,h:8,budget:40000,
 front:{x:0,z:1,yaw:0},tags:{style:'court'},
 note:'pierced bronze screens (two takes, one per instance), banners of the sign, a circuit-maze band (three takes, one per instance)',
 build(o){box('stone',0,0,0,10,6.6,.6,P('stoneD'));
  for(const s of [-1,1])etScreen(s*1.7,.8,.32,2.6,4.2);
  for(const s of [-1,1])etBanner(s*4.3,6.4,.32,1.1,4.4);
  etMazeBand(0,5.4,.32,7.8,.7);
  box('stone',0,6.6,0,10.4,.4,.9,P('stoneD'));}});

/* the canal town's breathing wall: cast pattern block on a stone footing, a lime coping */
defBuilding({key:'et_sample_block',name:'Profile: cast pattern block',seed:7994,cls:'feature',kind:'sample',w:7,d:1.4,h:3.2,budget:30000,
 front:{x:0,z:.7,yaw:0},tags:{style:'common'},
 note:'a wall of cast pattern block, every other block pierced, on a stone footing under a lime coping',
 build(o){box('stone',0,0,0,6.6,.3,.6,P('stoneD'));etPatternBlock(6.4,2.4,.3,0,{s:.4});box('lime',0,2.72,0,6.6,.14,.5,P('limeShade'));}});

/* the head generator (P2): fifty seeded heads on plinths, a row to each rank (gold, silver, bronze, gunmetal, and stone
   for humans' ancestors); three with open eyes (the living: under a tenth) and three veiled. Fifty people, four metals */
defBuilding({key:'et_sample_heads',name:'Statuary: fifty heads by rank',seed:7995,cls:'feature',kind:'sample',w:22,d:10,h:3.4,budget:120000,
 front:{x:0,z:5,yaw:0},tags:{style:'court'},
 note:'fifty faceted heads from the generator, ten to a rank (gold, silver, bronze, gunmetal, stone); three open-eyed, three veiled',
 build(o){const M=['gold','silver','bronze','gunmetal','stone'],OPEN={7:1,23:1,41:1},VEIL={12:1,30:1,48:1};
  box('stone',0,0,0,21.6,.15,9.6,P('paving'));
  for(let r=0;r<5;r++)for(let c=0;c<10;c++){const i=r*10+c;
   etHead(-9+c*2,.15,3.6-r*1.8,1.25,{metal:M[r],plinth:.9,eyes:OPEN[i]?'open':'closed',veiled:!!VEIL[i]});}}});

/* the figures: the four poses (standing, seated, the ancestor holding up a door with arms spread, hands folded) in gold
   and bronze; never striding, never armed */
defBuilding({key:'et_sample_figures',name:'Statuary: figures in the four poses',seed:7996,cls:'feature',kind:'sample',w:18,d:3,h:4.4,budget:80000,
 front:{x:0,z:1.5,yaw:0},tags:{style:'court'},
 note:'eight faceted figures from the generator: standing, seated, holding a lintel, hands folded; gold and bronze',
 build(o){const poses=['stand','seat','lintel','folded'];
  for(let i=0;i<8;i++)etFigure(-7.7+i*2.2,0,0,3.2,{pose:poses[i%4],metal:i<4?'gold':'bronze',plinth:.6});
  for(const lx of [-3.3,5.5])box('stone',lx,.6+3.2*1.18,0,3.2*.9,.28,.6,P('stoneD'));}});   /* the lintels the hands hold up (shY .8 + .38) */

/* the masks over the canal town's doors: the household's dead in terracotta and in lead, eyes closed */
defBuilding({key:'et_sample_masks',name:'Statuary: door masks',seed:7997,cls:'feature',kind:'sample',w:9,d:1.2,h:2.6,budget:40000,
 front:{x:0,z:.6,yaw:0},tags:{style:'common'},
 note:'eight door masks from the generator on a lime wall: terracotta and lead, eyes closed',
 build(o){box('lime',0,0,0,8.6,2.4,.4,P('lime'));
  for(let i=0;i<8;i++)etMask(-3.7+i*1.06,1.5,.3,.62,i%2?'lead':'terracotta');}});
