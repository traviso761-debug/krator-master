// Presets. Sites come from ROWS (decay 1 stands at x = s); heights are the
// builders' own constants (see the head of each builder in src/8ah-engines.js).
// The sun is in the west-south-west, so the hero shots stand south-west.
const ENW=(k,x,y,z)=>[ROWS[k].s+x,y,ROWS[k].z+z];
const VIEWS={
 // THE PLAIN: all five from the south-west, the Harrow nearest, the Gyre and
 // the Press rising out of the haze behind.
 'The Engines':            [-1250,120,1550, 150,190,-600],
 'The Harrow':             ENW('harrow',-260,95,440).concat(ENW('harrow',60,135,0)),
 // under the raised wheel, at eye height beside a track
 'Under the wheel':        ENW('harrow',250,1.8,120).concat(ENW('harrow',345,220,26)),
 // down the furrow from 1.3 km back, the machine at the end of it
 'The furrow':             ENW('harrow',-1350,22,-40).concat(ENW('harrow',-100,120,0)),
 'The Strider':            ENW('strider',-340,120,400).concat(ENW('strider',0,140,0)),
 // beside the ring of stones at the foot of the probe, looking up at the belly
 'Beneath the Strider':    ENW('strider',-10,1.8,48).concat(ENW('strider',15,160,-8)),
 'The Breech':             ENW('breech',-180,110,470).concat(ENW('breech',60,70,0)),
 // on the barrel's axis, a little beyond the mouth: the bore, the core, the rods
 'Into the muzzle':        ENW('breech',360,168,10).concat(ENW('breech',140,78,0)),
 'The Gyre':               ENW('gyre',-300,130,660).concat(ENW('gyre',0,220,0)),
 // eye height on the ring's axis, looking north through it
 'Through the Gyre':       ENW('gyre',12,1.8,430).concat(ENW('gyre',0,190,-200)),
 'The Press':              ENW('press',-420,170,520).concat(ENW('press',0,280,0)),
 // on the plinth by the anvil, looking up at the die
 'Under the die':          ENW('press',34,37.8,56).concat(ENW('press',0,190,0)),
 'Night on the plain':     [-1250,120,1550, 150,190,-600, 1],
};
