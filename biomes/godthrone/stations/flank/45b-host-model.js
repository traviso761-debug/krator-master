// ================================================================= HOST — the ground model: THE HIGH FLANK (station 2)
// PLAN.md section 7, station 2: the Godthrone's high flank at ~11 km (0.40 atm), on the south-east flank toward the Catch where
// 4.22 has a vent (px 716, 1128, 11,080 m): a black lava plain falling away from the summit at the shield's ~6.5%, a sinuous
// rille, a pit-crater chain over a collapsed tube, the old vents' dark rings, frost in the shadows. Its own frame (x east,
// z south, origin mid-map); every form a core/terrain record (KRELIEF), composed by KRELIEF.apply:
//   THE PLAIN      the flank's slope away from the summit (DOWN: south-south-east here), low swells and flow lobes
//   THE OLD VENTS  five small cones of the flank's old eruptions (KRELIEF.volcano), each with its halo of black beads: the
//                  field of dark rings (PLAN.md section 4: every old fountain keeps its halo; the thin wind barely moves it)
//   THE RILLE      a sinuous lava-carved canyon from the main old vent's crater down the slope (KRELIEF.rille on a
//                  KRELIEF.meander), its walls stepping on the tibasalt's flow tops
//   THE PIT CHAIN  a lava tube under the plain beside it, its roof fallen in in a chain of pits (KRELIEF.tube)
// The long lobate flows with levees and central channels come from core's lava-flow module once it lands (its frozen flows
// baked onto this ground: PLAN.md section 10); until then the plain carries its lobes as low relief.
const DOWN=[.59,.81],ACROSS=[-.81,.59],FL={y0:11080,slope:.065};
const dOf=(x,z)=>x*DOWN[0]+z*DOWN[1],aOf=(x,z)=>x*ACROSS[0]+z*ACROSS[1],xzDA=(d,a)=>[d*DOWN[0]+a*ACROSS[0],d*DOWN[1]+a*ACROSS[1]];
// the plain: the flank's slope, broad swells and the old flows' lobes (low tongues down the slope, 2-6 m)
function plainH(x,z){const d=dOf(x,z),a=aOf(x,z);
 const lobes=4.5*(1-Math.abs(fb(a*.0016+fb(d*.0004,a*.0004,2,WORLD+40)*2.2,d*.00045,2,WORLD+41)*2-1));
 return FL.y0-FL.slope*d+14*(fb(x*.0005,z*.0005,2,WORLD+42)-.5)+lobes+1.2*(vn(x*.03,z*.03,WORLD+43)-.5);}
// THE OLD VENTS: [d, a] on the flank's frame, h, r; the first is the main one (its crater feeds the rille)
const OLDVENTS=[[-1800,-400,38,420],[700,1900,22,260],[-300,-2600,26,300],[2400,-1500,18,220],[-3200,2300,30,340]].map((v,i)=>{const p=xzDA(v[0],v[1]);
 return{i,x:p[0],z:p[1],h:v[2],r:v[3],name:i?'An old flank vent (its cone and its ring of black beads)':'The old flank vent (4.22\'s, at 11,080 m: the rille\'s source)',
  f:KRELIEF.volcano({c:p,h:v[2],r:v[3],k:1.4,crater:{r:v[3]*.16,d:v[2]*.45},gullies:9,gully:.08,seed:KR.hash(WORLD,7,i,0x01D)%997+1})};});
const VENT=Object.assign(OLDVENTS[0],{crater:.16,throat:0,cd:0});
// THE RILLE: from the main vent's crater rim, meandering down the slope out of the map
const RILLE=KRELIEF.rille({pts:KRELIEF.meander(xzDA(-1800+OLDVENTS[0].r*.25,-400),xzDA(7000,600),{amp:260,wave:1500,seed:KR.hash(WORLD,8,0,0x111)}),
 ground:plainH,w:170,depth:62,floorW:.16,talus:.32,face:70,bench:6,seed:KR.hash(WORLD,8,1,0x112)});
// THE TUBE: under the plain to the rille's east, its roof fallen in in a chain of pits (big: a titanium basalt's tubes are wide)
const TUBE=KRELIEF.tube({pts:KRELIEF.meander(xzDA(-4200,1300),xzDA(5200,1700),{amp:180,wave:2100,seed:KR.hash(WORLD,9,0,0x113)}),
 ground:plainH,r:16,roof:9,ridge:2.5,every:150,p:.55,sky:.25,seed:KR.hash(WORLD,9,1,0x114)});
const FORMS=[RILLE,TUBE];
// the rock: the same titanium basalt (fresh: the alteration line, 8,500 m, is below)
const STRATA=KSTRATA.create({seed:KR.hash(WORLD,0,2,0x57A7),formations:[{recipe:'tibasalt'}],range:[10000,11800],
 dip:[DOWN[0],DOWN[1],.004],warp:[6,1.6],wash:{m:2},regolith:.35,dust:0x2a2624});
const _ground=KRELIEF.apply((x,z)=>{let y=plainH(x,z);for(const V of OLDVENTS)y+=V.f(x,z);return y;},FORMS);
function baseH(x,z){return _ground(x,z);}
// THE MODEL'S FIELDS (45c caches them): face (the rille's and the pits' walls), talus (the rille's aprons), rampart (the old
// cones), glass none, vent (near the main vent), halo and orange: a ring of black beads round each old vent
const MODEL={fieldsAt(x,z,sl,hollow,o){const r=KRELIEF.at(RILLE,x,z,plainH(x,z)),t=KRELIEF.at(TUBE,x,z,plainH(x,z));
  o.face=r&&(r.part==='wall')?1:t&&t.part==='collapse'?smooth(.6,1.2,sl):0;
  o.talus=r&&r.part==='talus'?1:t&&t.part==='collapse'?.6:0;
  let ra=0,ring=0,orr=0;for(const V of OLDVENTS){const d=Math.hypot(x-V.x,z-V.z)/V.r;ra=Math.max(ra,smooth(1.1,.7,d));
   /* the dark ring: the beads thickest a cone's radius or two out, thinning over ~6 radii; the youngest (the main) a little orange */
   const g=smooth(.5,1.2,d)*Math.exp(-Math.max(0,d-1.3)/2.4);ring=Math.max(ring,g);if(!V.i)orr=Math.max(orr,.35*Math.exp(-d/2));}
  o.rampart=ra;o.glass=0;o.vent=smooth(400,60,Math.hypot(x-VENT.x,z-VENT.z))*.5;
  o.halo=clamp((.18+.82*ring+.3*hollow)*smooth(.95,.45,sl)*(1-.6*ra),0,1);
  o.orange=clamp(orr+.15*hollow*ring,0,1);return o;},
 after(){const C=VENT;C.base=terrainH(C.x+C.r*1.2,C.z);C.top=C.base+C.h;C.lavaY=terrainH(C.x,C.z);}};
var PORTAL=null;
