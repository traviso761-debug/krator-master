// Presets, DERIVED from SI_SITE, which buildSkyI fills (one entry per decay)
// before this runs. SIDEF is the fallback only if a builder threw.
//
// The camera is 50 degrees vertical: the whole 446 m tower wants ~650 m of
// stand-off. The sun is in the west-south-west, so the lit faces are seen from
// the south-west.
const SIDEF={x:0,z:0,PR:88,Y0:12,H:446,street:{eye:[30,76,20],look:[0,112,30]},cross:{y:60,th:2.3,r:40},
 falls:[[60,100],[80,120]],hinge:[-30,270,20],hangLo:[-40,230,30],topple:{base:[94,0],tip:[390,0],R0:50,ang:0}};
const SIA=Object.assign({},SIDEF,{x:-300},SI_SITE[0]||{});
const SIR=Object.assign({},SIDEF,{x:300},SI_SITE[1]||{});
const SIT=Object.assign({},SIDEF,{x:1200},SI_SITE[2]||{});
const SIH=Object.assign({},SIDEF,{x:0},SI_SITE[3]||{});
// camera and target in site coordinates, optional night flag
const SIV=(S,c,t,n)=>[S.x+c[0],c[1],S.z+c[2],S.x+t[0],t[1],S.z+t[2]].concat(n?[1]:[]);
const SIHERO=(S,n)=>SIV(S,[-300,150,600],[0,215,0],n);
// a site point ([x,z] or [x,y,z]) pushed out from the axis by m metres, at height y
const SIOUT=(p,m,y)=>{const px=p[0],pz=p[p.length===2?1:2],pr=Math.hypot(px,pz)||1;return[px*(1+m/pr),y,pz*(1+m/pr)];};
const VIEWS={
 'Skyscraper I':              SIHERO(SIA),
 // THE ROW: intact, rehabilitated, ruined, and the toppled body on the plain.
 'The row of four':           [450,430,1750,450,170,0],
 'Ruined':                    SIV(SIR,[-240,130,580],[0,190,0]),
 'Rehabilitated':             SIV(SIH,[-240,130,580],[0,215,0]),
 // THE TOPPLED: the stump and the upper body lying east on its braids.
 'Toppled':                   (function(S){const t=S.topple,mx=(t.base[0]+t.tip[0])/2,mz=(t.base[1]+t.tip[1])/2;
                                return SIV(S,[mx-120,170,mz+520],[mx*.7,50,mz*.7]);})(SIT),
 // ALONG THE FALLEN BODY: from beyond its tip, low, looking back to the stump.
 'Along the fallen body':     (function(S){const t=S.topple,dx=t.tip[0]-t.base[0],dz=t.tip[1]-t.base[1],L=Math.hypot(dx,dz)||1;
                                return SIV(S,[t.tip[0]+dx/L*110+dz/L*60,38,t.tip[1]+dz/L*110-dx/L*60],[t.base[0],40,t.base[1]]);})(SIT),
 // THE CROWN: the strands straightened into fins, standing off the shaft on
 // their ties, closing in on the knife tip.
 'The crown':                 SIV(SIA,[-170,410,170],[0,370,0]),
 // THE BRAID: the strands crossing over and under at mid-height.
 'The braid':                 SIV(SIA,[-190,180,210],[0,170,0]),
 // THE FOOT, at a person's height below the south stair.
 'The foot':                  SIV(SIA,[-24,2,150],[0,42,0]),
 // LOOKING UP from the podium at the foot of strand A.
 'Looking up':                SIV(SIA,[-10,13.8,76],[0,330,0]),
 // ON THE STREET: standing on strand A's stair, looking up it.
 'On the street':             SIV(SIA,SIA.street.eye,SIA.street.look),
 // THE FALLEN STRAND: strand B's lost section on the plain, the ruin behind.
 'The fallen strand':         (function(S){const f=S.falls[0];return SIV(S,SIOUT(f,150,40),[f[0]*.55,70,f[1]*.55]);})(SIR),
 // THE HANGING STRAND: strand A broken below its hinge, swung out and down.
 'The hanging strand':        (function(S){const h=S.hangMid||S.hinge;return SIV(S,SIOUT(h,210,h[1]-30),[h[0],h[1]+4,h[2]]);})(SIR),
 // NIGHT: the hero after dark, the lit slots and the beam from the tip.
 'Night':                     SIHERO(SIA,1),
};
