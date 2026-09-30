// Presets. Sites come from ROWS (decay 1 stands at x = s); heights are the
// builders' own constants (see the head of each builder in src/8ah-engines.js
// and src/8ai-engines2.js). The sun is in the west-south-west, so the hero
// shots stand south or south-west of what they look at.
const ENW=(k,x,y,z)=>[ROWS[k].s+x,y,ROWS[k].z+z];
const VIEWS={
 // THE PLAIN at eye height, 1 km south of the Harrow: the Harrow nearest on
 // the left, the Strider and the Press on the right, the Gyre ahead, the
 // Retorts and the Needle in the haze beyond.
 'The Engines':            [-250,1.8,1000, 60,230,-700],
 // west, into the low sun: the Sleeper kneeling, the Ram in its ridge beyond
 'The western plain':      [-900,1.8,-300, -1866,150,-560],
 // east: the Carapace close on the right, the Press, the Needle, the Gyre, the Strider
 'The eastern plain':      [2000,1.8,1100, 1300,200,-1300],
 // all ten from 1.9 km up
 'The plain from above':   [-200,1900,2700, -100,0,-1100],
 'The Harrow':             ENW('harrow',-260,95,440).concat(ENW('harrow',60,135,0)),
 // the fallen wheel at eye height, the snapped boom hanging behind it
 'The fallen wheel':       ENW('harrow',470,1.8,250).concat(ENW('harrow',300,90,40)),
 'The furrow':             ENW('harrow',-1350,22,-40).concat(ENW('harrow',-100,120,0)),
 'The Strider':            ENW('strider',-340,120,400).concat(ENW('strider',0,140,0)),
 // the buckled leg and the sagging corner, from the south-west on the ground
 'The buckled leg':        ENW('strider',-300,6,60).concat(ENW('strider',-90,90,-80)),
 'The Breech':             ENW('breech',-180,110,470).concat(ENW('breech',60,70,0)),
 'Into the muzzle':        ENW('breech',360,168,10).concat(ENW('breech',140,78,0)),
 'The Gyre':               ENW('gyre',-300,130,660).concat(ENW('gyre',0,220,0)),
 'Through the Gyre':       ENW('gyre',12,1.8,430).concat(ENW('gyre',0,190,-200)),
 'The Press':              ENW('press',-560,190,700).concat(ENW('press',0,300,0)),
 'Under the die':          ENW('press',34,37.8,56).concat(ENW('press',0,190,0)),
 'The Sleeper':            ENW('sleeper',-280,90,520).concat(ENW('sleeper',0,130,20)),
 // beside the torn-off arm, looking up at the bowed head
 'The fallen arm':         ENW('sleeper',-240,1.8,230).concat(ENW('sleeper',-20,150,20)),
 'The Carapace':           ENW('carapace',-440,110,400).concat(ENW('carapace',0,60,0)),
 'Under the Carapace':     ENW('carapace',-90,1.8,30).concat(ENW('carapace',60,42,0)),
 'The Retorts':            ENW('retorts',-320,120,440).concat(ENW('retorts',0,100,20)),
 'The split sphere':       ENW('retorts',-40,3,300).concat(ENW('retorts',40,30,150)),
 'The Needle':             ENW('needle',-520,170,720).concat(ENW('needle',0,240,0)),
 // along the fallen top toward the stump
 'The broken top':         ENW('needle',420,5,-260).concat(ENW('needle',0,200,0)),
 'The Ram':                ENW('ram',-280,90,440).concat(ENW('ram',40,50,0)),
 'The torn tail':          ENW('ram',-250,4,70).concat(ENW('ram',-150,50,0)),
 'Night on the plain':     [-250,1.8,1000, 60,230,-700, 1],
};
