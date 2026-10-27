// Presets, DERIVED from what the builder left in AP_SITE (8at1): the tiers' height, the neck, the cores, the stairs.
// The pile is 940 m square and 435 m tall, so a whole view stands about 1 400 m off.
BUDGET.type.arcpile='mega';
const APDEF={x:0,z:0,TS:36.571,NT:12,NECK:6,YN:219.4,H:435,half:k=>(940+(260-940)*k/11)/2,cores:[],stairs:[],gate:{a:-285,b:285,y0:219.4},fallen:[]};
const APA=Object.assign({},APDEF,{x:-1500},AP_SITE[0]||{});
const APB=Object.assign({},APDEF,{x:1500},AP_SITE[1]||{});
const APW=(S,x,y,z)=>[S.x+x,y,S.z+z];
const APHERO=S=>APW(S,1150,520,1150).concat(APW(S,0,170,0));
const great=(S,i)=>S.cores.filter(c=>c.sys==='great')[i]||{x:96,z:96,r:15,y1:330};
const VIEWS={
 'The Pile':                APHERO(APA),
 // square on from the south: the tiers stepping in, the slots and the stairs at the two ends
 'The south elevation':     APW(APA,0,210,1500).concat(APW(APA,0,200,0)),
 // from high over the south-east: the roofs, the gardens on every one, the crown's fields
 'The gardens from above':  APW(APA,560,1050,760).concat(APW(APA,0,180,0)),
 // in a court on the plain, looking up through the blocks
 'A court':                 APW(APA,-150,4,-260).concat(APW(APA,-40,120,-120)),
 // on a base roof garden at the fourth tier, the blocks of the fifth and sixth crossing over
 'A roof garden':           (function(S){return APW(S,-300,3*S.TS+3,260).concat(APW(S,-120,3*S.TS+20,40));})(APA),
 // the crown: its fields on the roofs, from just over the neck
 'The crown':               (function(S){return APW(S,320,S.YN+150,330).concat(APW(S,0,S.YN+60,0));})(APA),
 // the east grand stair, from its foot, up the slot to the gate
 // the capstone: the terraced ziggurat on the summit, its glass bands under the sloping fascias, its decks planted
 'The capstone':            (function(S){const c=S.cap||{y0:366,top:422,h0:120};return APW(S,330,c.y0+74,330).concat(APW(S,0,c.y0+34,0));})(APA),
 'The east stair':          (function(S){const s=S.stairs.find(t=>t.sx>0)||{x0:530,x1:287,y1:223};
                             return APW(S,s.x0+140,30,140).concat(APW(S,s.x1,s.y1*.7,0));})(APA),
 // a great core, from the neck
 'A great core':            (function(S){const c=great(S,3);return APW(S,c.x+170,S.YN+30,c.z+150).concat(APW(S,c.x,S.YN,c.z));})(APA),
 'The Pile at night':       APHERO(APA).concat([1]),
 'The ruin':                APHERO(APB),
 'The capstone, kept':      (function(S){const c=S.cap||{y0:366,top:422,h0:120};return APW(S,-260,c.top+30,-300).concat(APW(S,0,c.y0+20,0));})(APB),
 // the island: the crown from over the neck, the cut cores and the broken stair below it
 'The island':              (function(S){return APW(S,-380,S.YN+120,420).concat(APW(S,0,S.YN+20,0));})(APB),
 // a great core cut at the neck
 'The cut':                 (function(S){const c=great(S,1);return APW(S,c.x+70,S.YN+150,c.z-90).concat(APW(S,c.x,S.YN-15,c.z));})(APB),
 // the west stair's last flights, down
 'The broken stair':        (function(S){const s=S.stairs.find(t=>t.sx<0)||{x0:-530,x1:-287,y1:223};
                             return APW(S,s.x0-120,90,-220).concat(APW(S,(s.x0+s.x1)/2,s.y1*.6,0));})(APB),
 // THE FALLEN CORNER: the south-east quarter down, its torn slabs in a slope, the torn ends of the blocks that stand
 'The fallen corner':       (function(S){const c=S.corner||275;return APW(S,c+560,230,c+560).concat(APW(S,c*.55,60,c*.55));})(APB),
 // A CRASH: a block whose supports failed, hinged on one end and dropped a tier through the block under it
 'A crash':                 (function(S){const c=(S.crashed||[])[0]||{ax:'z',c:-183,a:-315,b:-148,y0:183};
                             return c.ax==='z'?APW(S,c.c-150,c.y0+70,c.b+110).concat(APW(S,c.c,c.y0-15,c.b-10))
                                              :APW(S,c.b+110,c.y0+70,c.c-150).concat(APW(S,c.b-10,c.y0-15,c.c));})(APB),
 // THE CROWN'S FARMS: ridged fields, polytunnels, orchards, sheds and tanks on the island's roofs
 'The crown farms':         (function(S){return APW(S,-240,S.YN+190,250).concat(APW(S,-40,S.YN+70,40));})(APB),
 // A ROPE BRIDGE between two crown roofs
 'A rope bridge':           (function(S){const b=(S.bridges||[])[0];if(!b)return APW(S,0,S.YN+120,300).concat(APW(S,0,S.YN,0));
                             const m=[(b.from[0]+b.to[0])/2,b.from[1],(b.from[2]+b.to[2])/2];return APW(S,m[0]+45,m[1]+28,m[2]+55).concat(APW(S,m[0],m[1]-4,m[2]));})(APB),
 // a fallen block on the plain
 'A fallen block':          (function(S){const f=S.fallen[0]||{x:560,z:560};return APW(S,f.x*1.25,60,f.z*1.25+80).concat(APW(S,f.x,10,f.z));})(APB),
};
