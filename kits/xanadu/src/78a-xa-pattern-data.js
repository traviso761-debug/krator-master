// ================================================================= XANADU — the black-and-white pattern system: its data [G data]
// The owner's brief for the Pleasure Dome (2026-11-09; settlements/xanadu/citadel/refs/pleasure-dome/STYLE.md): black and
// white patterns, psychedelic in their intricacy, dream-like in their omnipresence and enormity. Two stones and gold; banding
// that follows the geometry (wall courses, alternating voussoirs, receding checkered arch orders, striped piers and drums,
// vault stripes into ribs and chevrons); a pattern per kind of room. This fragment is the DATA: the stones, every pattern's
// parameters, the room kinds' dress, the arch curves and the fret, as plain numbers and pure functions, so the Godot side
// (a ShaderMaterial per pattern, the same arch curves) reads the same table. No three.js, no DOM.
//   XPAT.stone             the two stones and the gold (sRGB hex), the vein strength
//   XPAT.pat[name]         a world-aligned pattern: {kind, ...its sizes in metres}. The kinds (78b's shader):
//                          band     courses of `course` m alternating up a vertical face (they wrap every curve: a drum, a pier,
//                                   a column are banded by the same courses); on a level face stripes `course` wide along x
//                          checker  squares of `cell` m on every face
//                          pave     crazy paving: irregular pieces about `cell` m across, `black` of them black, gold joints
//                                   `joint` m wide
//                          op       the op-art wallcovering (ref 07): cells of `cell` m, each a bundle of `lines` stripes,
//                                   straight or turning in half circles, white lines `ink` of the pitch on black
//                          chevron  courses broken into zigzags `pitch` m long and `rise` m high
//                          key      the Greek-key runner (ref 06; laid as a strip, its own frame): a black edge, a gold fret
//                                   `fret` m wide, then black panels `panel` m long in gold frames between white marble bars
//                          diamond  a white field with a small black diamond every `cell` m (ref 09's floor): the calm floor
//                          solid    one stone per instance (the voussoirs, gores, treads, rings: the instance colour picks
//                                   white, black or gold: XPAT.ink)
//   XPAT.room[kind]        the dress of a kind of room (STYLE.md rule 4): wall, floor and ceiling patterns, the arch curve
//   XPAT.arch[kind]        an arch curve's shape; xpArchCurve(kind, n) gives the intrados (span 1, springs at y 0)
//   XPAT.balance           the share of black, by dome (the pattern materials read it per block)
//   XPAT.fret              the Greek key as a bitmap (rows top to bottom, '1' gold), tiled along the border
const XPAT={
 stone:{black:0x121214,white:0xf2efe8,gold:0xd6a640,vein:.8},
 // the instance colour of a `solid` piece, read by the shader as data (r: white, b: not gold): never seen as a colour
 ink:{W:[1,1,1],B:[0,0,1],G:[1,1,0]},
 pat:{
  band:{kind:'band',course:.5,block:1.4},          // the great rooms: about 0.5 m a course (STYLE.md rule 5)
  bandFine:{kind:'band',course:.3,block:.9},       // the small rooms: finer
  checker:{kind:'checker',cell:.6},
  pave:{kind:'pave',cell:1.25,black:.56,joint:.04},
  op:{kind:'op',cell:1.1,lines:6,ink:.42},
  chevron:{kind:'chevron',course:.42,pitch:1.8,rise:.55},
  key:{kind:'key',edge:.08,line:.035,fret:.34,panel:2.2,bar:.5},
  diamond:{kind:'diamond',cell:1.2,d:.2},
  solid:{kind:'solid'},
 },
 // the dress of each kind of room (STYLE.md rule 4)
 room:{
  great:{wall:'band',floor:'band',ceil:'chevron',arch:'horseshoe'},      // the Hall of Feasts: banded, receding checkered arches
  court:{wall:'band',floor:'pave',ceil:null,arch:'round'},               // the open courts: crazy paving with gold joints
  stair:{wall:'band',floor:'pave',ceil:'chevron',arch:'round'},          // the stair halls
  passage:{wall:'band',floor:'band',ceil:'checker',arch:'round',runner:true},   // the passages and the Golden Way's door: Greek-key runners
  bath:{wall:'checker',floor:'checker',ceil:'band',arch:'horseshoe'},    // checker and stripe under pierced domes
  private:{wall:'op',floor:'diamond',ceil:'bandFine',arch:'pointed'},   // the private rooms: the op-art wallcovering over a calm diamond floor (refs 07, 09)
  service:{wall:'bandFine',floor:'checker',ceil:'bandFine',arch:'round'},
 },
 arch:{round:{rise:.5},pointed:{rise:.62},horseshoe:{rise:.66,r:.46,c:.2}},
 fret:['111110','100010','101010','101000','101111'],
 exterior:'wash',   // the outside keeps the kit's whitewash and gold frieze
 dome:null,         // the domes outside: the kit's own kinds (turquoise on variant 0: the owner, 2026-11-10, for both domes); 'B' is ref 08's black gores under gold ribs
 // the balance (the owner, 2026-11-09): how much of a pattern is black. The citadel's Dome favours black (the ground black, the
 // figure white, about two to one); the Dome of the Bay favours white, under more skylight. A builder sets it (xpBalance)
 // and every block it draws carries it; band, chevron, pave, op and diamond read it, and the alternating pieces follow
 balance:{citadel:.667,bay:.34,even:.5},
};
// the intrados of an arch of span 1 springing at y = 0, from the left spring over the crown to the right: n+1 points [x, y]
function xpArchCurve(kind,n){const A=XPAT.arch[kind]||XPAT.arch.round,P=[];n=n==null?16:n;
 if(kind==='horseshoe'){const r=A.r,c=A.c,a0=Math.asin(c/r);   // a circle of radius r centred c above the springs: it swells past them
  for(let i=0;i<=n;i++){const a=Math.PI+a0-(Math.PI+2*a0)*i/n;P.push([Math.cos(a)*r,c+Math.sin(a)*r]);}
  P[0][1]=0;P[n][1]=0;return P;}
 if(kind==='pointed'){const R=.5+((A.rise*A.rise)-.25)/1,cx=R-.5,top=Math.sqrt(R*R-cx*cx);   // two-centred: each arc from a centre on the springing line
  const h=n>>1;for(let i=0;i<=h;i++){const t=i/h,a=Math.PI-Math.atan2(top,cx)*t;P.push([cx+Math.cos(a)*R,Math.sin(a)*R]);}
  for(let i=h-1;i>=0;i--){const q=P[i];P.push([-q[0],q[1]]);}return P;}
 for(let i=0;i<=n;i++){const a=Math.PI*(1-i/n);P.push([Math.cos(a)*.5,Math.sin(a)*.5]);}return P;}
// the rise of an arch of span 1 (its crown above the springs)
function xpArchRise(kind){const P=xpArchCurve(kind,16);let m=0;for(const p of P)m=Math.max(m,p[1]);return m;}
