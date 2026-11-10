// ================================================================= HOST â€” the station's site: the gypsum maze under Cube's plateau  [G data]
// biomes/KARST-SITES-5.1.md site 3 (the owner approved it, 2026-11-03): scale model 5.1 px 720,1570 (4.2x 448,1240, the Rift's station 4), the
// plateau's WEST SCARP, where the maze in the rift fill is cut open. G (-260 m, the table's surface here) is drawn as y = 0; every height
// below is metres under the table. The page's z axis runs along the rift's strike (N-S here: the scarp faces west toward station 2, px
// 692,1578), x across it (east). NET is the site's KKARST.network call (a network maze, two storeys over the lowest), whole over 1.1 x 1.3 km:
// the page crops it to CROP and never edits it. The doc's numbers, and where this page differs (each said in PLAN-STATIONS.md "Station 5"):
//   - the box is 1.1 x 1.3 km, not 4 x 4 km: KKARST joins each upper storey to the one below by a search over every pair of nodes, which
//     at 4 km and 28 m joints is 4e8 distances a storey in the browser; the crop is the same cave either way (the maze is one piece)
//   - TABLE: the regional water table is 1.2 km down (the scarp's foot, station 2: the doc's G - 300), but the lowest storey keeps a
//     PERCHED table on the lake marl under the gypsum, 0.7 m over its floor at the scarp: the "water only at its lowest storey near the
//     scarp" the doc asks for. The floors rise from the scarp by `gradient` (.003: a gypsum maze is cut level), so the water stands in
//     the storey's western half and runs out of its mouths as springs at the face's foot
//   - the top storey at G - 10, not G - 8: its floors rise from the scarp too, and at G - 8 their crowns broke the table's surface in the
//     east of the page (KKARST does not know the cap); every top-storey chamber is still a collapse doline (its roof under `thin`)
//   - chambers' p .15 (the doc's .12): a few more chambers, so the top storey has its collapse dolines on the page
//   - the passages are 2-4 m wide and 2.1-3.2 m high (the doc's 1.5-4 by 1.5-3): the walkable ones; a 1.5 m passage is under the
//     1 m lattice's grain (KCAVERN), and Optymistychna's crawls are not drawn
//   - the storeys' p: .62, .56, .5 (the doc's .6, .5, .35): KKARST keeps only the piece of each storey joined to its spring node, and
//     under p .5 on a square lattice that piece is a few passages (bond percolation), so the doc's .35 drew almost no top storey
// The PAGE'S SCARP is the plateau's upper step: 36 m from the table's lip to a bench on the lake marl, where the lowest storey's springs
// come out. The rest of the scarp (1.2 km and more down to station 2's floor) is off the page.
const SITE={key:'maze',name:'The gypsum maze',region:'Cube\'s plateau, the west scarp (the Rift\'s east island)',px:720,py:1570,G:-260,
 koppen:['Cfa'],atm:1.65,rain:2055,surfaceT:22,
 world:7201570,
 /* THE TABLE AND ITS SCARP. The table: a metre or two of swell (core/rand's noise), rising 4 m a km east (as the storeys' floors rise from
    the scarp). The scarp: its crest at x = scarp.x, wandering +-wob[0] m along the strike (buttresses and re-entrants: wob[1] is the noise's
    frequency), falling over w m to the bench `drop` m down, which falls on west by `bench` (a talus apron on the marl) */
 table:{swell:1.4,k:.005,east:.004},
 scarp:{x:-150,drop:36.5,w:22,wob:[12,.012],bench:.04,step:[3.4,.55,.75]},   /* step: the face in ledges and risers, the beds' (P m a step, the ledge's share, how much) */
 /* site 3's network (KARST-SITES-5.1.md, the doc's call with the changes above): the lowest storey at G - 35, two over it at G - 18 and
    G - 10 (under the cap), the rift's strike as the joints (angle 0: N-S and E-W, 28 m), chambers where three passages meet (8-16 m, 4-8
    m high: on the top storey every one's roof is under `thin`, so it is a collapse doline, KKARST's cenote form). The spring: the scarp's
    foot on the lowest storey */
 net:{box:[-240,-640,900,640],kind:'maze',level:-35,table:-34.3,gradient:.003,p:.62,joints:{angle:0,sp:28},
  levels:[{y:-18,kind:'maze',p:.56},{y:-10,kind:'maze',p:.5}],spring:[-176,24],
  w:[2,4],h:[2.1,3.2],chamber:{p:.15,r:[8,16],h:[4,8]},thin:8},
 /* the page: 450 x 400 m from the bench under the face to 385 m in under the table */
 crop:[-215,-200,235,200],
 cover:1.2,            /* a node is kept when the table stands this far over its floor: KKARST's nodes past the face are the maze the scarp took */
 cenote:{face:4},      /* a collapse doline stands on the table: none whose middle is over 4 m down the face */
 cell:1,chunk:16,      /* KCAVERN's lattice: 1 m */
 /* THE DRESS (KSPELEO): a dry, relict gypsum maze has no dripstone to speak of. KSPELEO has no gypsum-flower or crust kind, so its kinds
    stand in: small chandeliers for the gypsum flowers curling off the roofs and upper walls, druse (mineral gypsum) for the crusts of small
    crystals, blocks (selenite) for the clusters weathered out of the walls, a few small stalactites from wet spells. Cell in metres; each
    storey placed over tiles of `tile` m, from its floors' own height there */
 dress:{cell:3.2,tile:60,kinds:{chandelier:{p:.05,len:[.3,.9],r:[.15,.45],arms:[5,9],minGap:1.2},stalactite:{p:.03,len:[.15,.6],r:[.04,.12],minGap:1},
  druse:{p:.3,len:[.05,.22],r:[.5,1.4],n:[4,9],mineral:'gypsum'},block:{p:.06,len:[.25,.8],r:[.3,.9],n:[2,4],mineral:'selenite'}}},
 /* THE SITES (records only, no architecture; the owner, 2026-11-03: the maze is where the lost loj lies and where the Ancients' line joined
    natural caves). ANCIENTS: a cut gallery from the page's east edge (the Rift line's spur from Cube, the hub, east) to where it broke into
    the maze, on the middle storey, its end at the N-S passage nearest `at`; w by h, vaulted, hewn. LOJ: the middle-storey chamber nearest
    `at`, its passages walled `gap` m out from its wall, `wall` m thick (dry stone, drawn as rock): the rumoured lost Tungang loj's door */
 ancients:{at:[140,-70],storey:1,w:5,h:4.2,rise:.8,run:40},
 loj:{at:[110,100],storey:1,gap:2.5,wall:1.2},
 /* the hazards KKARST does not give: a fall over each collapse doline's rim, and out of every mouth on the face whose sill stands this far
    over the ground below it */
 fallFrom:3};
SITE.ground=(function(S){const sc=S.scarp,T=S.table;
 return function(x,z){const top=T.swell*2*(KRAND.fbm(x*T.k+3.1,0,z*T.k-1.7,2,S.world+1)-.5)+T.east*(x-sc.x);
  const cx=sc.x+sc.wob[0]*2*(KRAND.fbm(0,0,z*sc.wob[1]+5.3,2,S.world+2)-.5),u=(cx-x)/sc.w;if(u<=0)return top;
  const f=u>=1?1:u*u*(3-2*u),foot=-sc.drop-sc.bench*Math.max(0,cx-sc.w-x),g=top+(foot-top)*f;if(!sc.step||f>=1)return g;
  /* the ledges: the height mapped onto steps (a flat ledge for the first share of each P m, a riser for the rest), faded in from the lip and
     out at the foot so the table and the bench stay smooth */
  const P=sc.step[0],q=g/P,fl=Math.floor(q),fr=q-fl,L=sc.step[1],t=fr<=L?0:(fr-L)/(1-L),gs=P*(fl+t*t*(3-2*t)),k=sc.step[2]*Math.min(1,4*f*(1-f)*1.6);
  return g+(gs-g)*k;};})(SITE);
