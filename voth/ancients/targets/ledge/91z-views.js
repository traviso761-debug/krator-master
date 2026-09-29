// Presets, DERIVED. 89z-rows.js loads before 90-scene.js and this file after it,
// so both builders have run and left their dimensions in LD_SITE. LDDEF is the
// fallback only if a builder threw.
//
// Builder frame: the cliff face is at x ~ 0 facing -x (west, into the sun), the
// rock at +x, the plain and the town at -x; the cliff runs along z. The camera
// is 50 degrees vertical, so a frame is 0.933 x the sight line tall: the whole
// 850 m composition wants 1 300 m or more of stand-off.
const LDDEF={x:0,z:0,d:0,NL:34,Y0:150,TOPD:840,TOPB:852,GC:-95,topR:450,lay:[],cores:[],
 reachAt:()=>200,faceX:()=>0,cake:null};
const LDA=Object.assign({},LDDEF,{x:-3600},LD_SITE[0]||{});
const LDB=Object.assign({},LDDEF,{x:3600},LD_SITE[1]||{});
const LDW=(S,x,y,z)=>[S.x+x,y,S.z+z];
// a layer, safely
const LDL=(S,i)=>S.lay[i]||{y:150+i*20,deck:154+i*20,top:170+i*20,za:-300,zb:300,R:200};
// THE HERO: three-quarter from below and to the south-west, the reference's own
// angle — the cliff on the right, the stack reaching out to the left, the great
// prow overhead, the soffits stepping up like an inverted ziggurat, the town at
// the foot for scale.
const LDHERO=S=>LDW(S,-990,36,1400).concat(LDW(S,-250,445,-40));
const VIEWS={
 'The Ledge':              LDHERO(LDA),
 // THE ELEVATION, square on to the cliff from the west, 1 750 m out.
 'The cliff face':         LDW(LDA,-1750,440,0).concat(LDW(LDA,0,440,0)),
 // THE SECTION: looking north along the cliff from 1 700 m south, so the stack
 // is in profile against the sky — an inverted ziggurat 830 m tall, the
 // escarpment turning away behind it.
 'The section':            LDW(LDA,-430,480,1560).concat(LDW(LDA,-430,480,0)),
 // THE SOFFITS, from the foot of the stack looking straight up its underside.
 'The soffits from below': LDW(LDA,-120,12,210).concat(LDW(LDA,-300,600,-60)),
 // A GALLERY at people scale: standing on the edge of layer 24, looking along it.
 'A gallery':              (function(S){const L=LDL(S,24),z0=60,R=S.reachAt(24,z0);
                             return LDW(S,-(R-2.4),L.deck+1.7,z0).concat(LDW(S,-(S.reachAt(24,-150)-10),L.deck+4,-150));})(LDA),
 // THE GREAT PROW, from out in the air to the south-west and above.
 'The great prow':         LDW(LDA,-800,610,360).concat(LDW(LDA,-360,775,LDA.GC)),
 // THE PLATEAU: the top deck's gardens running out of the plateau scrub, from
 // above and behind the cliff edge, the plain 840 m down beyond them.
 'The plateau':            LDW(LDA,560,1010,560).concat(LDW(LDA,-160,830,-40)),
 // THE TOWN at the foot, from the approach road: houses, the plaza, the lobby,
 // and the stack climbing out of the top of the frame.
 'The foot':               LDW(LDA,-780,22,-190).concat(LDW(LDA,-160,110,20)),
 // A LIFT CORE in its slot, and the bridges it throws to the layer ends.
 'A lift core':            (function(S){const C=S.cores[2]||{z:303,xf:-20};
                             return LDW(S,C.xf-300,260,C.z+260).concat(LDW(S,C.xf,300,C.z));})(LDA),
 // NIGHT: the hero, lit windows.
 'Night':                  LDW(LDA,-760,190,860).concat(LDW(LDA,-230,500,-40)).concat([1]),
 'Ruined':                 LDHERO(LDB),
 // THE RUIN IN SECTION: the prow gone, the top of the ziggurat cut back.
 'Ruined section':         LDW(LDB,-430,480,1560).concat(LDW(LDB,-430,480,0)),
 // THE FALLEN PROW, on the town under the gash it tore.
 'The fallen prow':        LDW(LDB,-1050,160,420).concat(LDW(LDB,-380,140,-110)),
 // THE SHEARED LAYERS: stubs at the rock line with the reinforcement out.
 'The sheared layers':     LDW(LDB,-420,300,520).concat(LDW(LDB,-10,340,285)),
 // THE PANCAKE: seven layers down on the eighth at the north end.
 'The pancaked wing':      (function(S){const c=S.cake||{z0:-450,z1:-262,y0:560,y1:590,R:180};
                             return LDW(S,-(c.R+260),(c.y0+c.y1)/2+40,c.z0-260).concat(LDW(S,-(c.R*.6),(c.y0+c.y1)/2,(c.z0+c.z1)/2));})(LDB),
 // THE ELEVATION of the ruin, with the rockfall scar south of the city.
 'Ruined cliff face':      LDW(LDB,-1750,440,120).concat(LDW(LDB,0,440,120)),
};
