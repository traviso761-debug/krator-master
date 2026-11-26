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
//   THE FLOWS      four eruptions' lobate flows frozen by core's lava-flow module at build time (KLAVA.bake), levees and
//                  central channels sculpted from their edges
/*FLOWS-INPUT-BEGIN: what the flows' bake reads (build.py runs bake-flows.js on this block when it changes) */
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
const FLOW_BAKE={box:[-6000,-6000,6000,6000],cell:40,seed:KR.hash(WORLD,10,0,0xF10),
 /* the eruptions, oldest first: two from vents up the slope (off the map), one at the north old cone, the youngest from the
    main old cone's downslope foot (its crater would pond it) */
 eruptions:[[xzDA(-5400,-1600),300,86400],[xzDA(-5300,1500),260,86400],[xzDA(-3200+380,2300),220,64800],[xzDA(-1800+460,-400),320,86400]]
  .map(s=>({x:s[0][0],z:s[0][1],r:60,Q:s[1],duration:s[2],T:1420}))};
const flowH0=(x,z)=>{let y=plainH(x,z);for(const V of OLDVENTS)y+=V.f(x,z);return y;};
/*FLOWS-INPUT-END*/
// THE FLOWS (core/terrain KLAVA.bake: the lava-flow module run at build time, 2026-10-27): four of the flank's eruptions, oldest
// first, from vents up the slope and at the old cones, each frozen where it stopped: lobate flows stacked by age, thicker where
// the slope eases. KLAVA freezes a whole column at once, so no levee or channel forms in it: they are SCULPTED here from each
// flow's own edges (a distance transform on the bake's 40 m cells): a levee a fifth of the way in from each edge, a central
// channel where a flow is wide enough to have carried one
const FLOWS=(function(){const t0=performance.now(),cell=FLOW_BAKE.cell,h0=flowH0;
 /* the bake: from the committed data (stations/flank/flows.json, written by bake-flows.js at build time and inlined as FLOWS_DATA)
    when the page carries it, else run here (~45 s at 40 m: a page built without node) */
 const B=typeof FLOWS_DATA!=='undefined'?(function(D){const u16=KFIELD.unb64(D.dh,Uint16Array),dh=new Float32Array(u16.length);for(let k=0;k<dh.length;k++)dh[k]=u16[k]/100;
   return{dh,age:KFIELD.unb64(D.age,Uint8Array),nx:D.nx,nz:D.nz,x0:D.x0,z0:D.z0,cell:D.cell,eruptions:D.eruptions,ms:0,from:'flows.json'};})(FLOWS_DATA)
  :KLAVA.bake(Object.assign({h:h0},FLOW_BAKE));
 const nx=B.nx,nz=B.nz,N=nx*nz,on=k=>B.age[k]>0&&B.dh[k]>.5,dist=new Float32Array(N),half=new Float32Array(N),D2=cell*Math.SQRT2;
 /* the distance in from the flow's edge (an edge: a neighbour of another flow, or of none) by a two-pass chamfer */
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;if(!on(k)){dist[k]=0;continue;}let edge=i===0||j===0||i===nx-1||j===nz-1;
  if(!edge)for(const q of [k-1,k+1,k-nx,k+nx])if(!on(q)||B.age[q]!==B.age[k]){edge=true;break;}dist[k]=edge?cell*.5:1e9;}
 const relax=(k,q,d)=>{if(dist[q]+d<dist[k])dist[k]=dist[q]+d;};
 for(let j=1;j<nz-1;j++)for(let i=1;i<nx-1;i++){const k=j*nx+i;if(!on(k))continue;relax(k,k-1,cell);relax(k,k-nx,cell);relax(k,k-nx-1,D2);relax(k,k-nx+1,D2);}
 for(let j=nz-2;j>0;j--)for(let i=nx-2;i>0;i--){const k=j*nx+i;if(!on(k))continue;relax(k,k+1,cell);relax(k,k+nx,cell);relax(k,k+nx+1,D2);relax(k,k+nx-1,D2);}
 /* the flow's local half-width: the most of that distance within 7 cells (a separable running max) */
 {const R=7,tmp=new Float32Array(N);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){let m=0;for(let a=Math.max(0,i-R);a<=Math.min(nx-1,i+R);a++)m=Math.max(m,dist[j*nx+a]);tmp[j*nx+i]=m;}
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){let m=0;for(let b=Math.max(0,j-R);b<=Math.min(nz-1,j+R);b++)m=Math.max(m,tmp[b*nx+i]);half[j*nx+i]=m;}}
 const bil=(A,x,z)=>{const u=clamp((x-B.x0)/cell,0,nx-1.001),v=clamp((z-B.z0)/cell,0,nz-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*nx+i;
  return A[k]*(1-fu)*(1-fv)+A[k+1]*fu*(1-fv)+A[k+nx]*(1-fu)*fv+A[k+nx+1]*fu*fv;};
 const ageAt=(x,z)=>{const i=Math.round((x-B.x0)/cell),j=Math.round((z-B.z0)/cell);return i<0||j<0||i>=nx||j>=nz?0:B.age[j*nx+i];};
 /* the flows' relief at a point: the frozen thickness, the levees, the channel */
 const at=(x,z,o)=>{o=o||{};const th=bil(B.dh,x,z);o.th=th;o.age=ageAt(x,z);if(th<.3){o.y=th;o.u=0;o.levee=0;o.channel=0;return o;}
  const d=bil(dist,x,z),w=Math.max(cell,bil(half,x,z)),u=clamp(d/w,0,1);
  const lev=Math.min(5,.35*th)*smooth(40,120,w)*Math.exp(-Math.pow((u-.22)/.12,2)),ch=Math.min(4,.3*th)*smooth(60,160,w)*smooth(.62,.95,u);
  o.u=u;o.levee=lev;o.channel=ch;o.y=th+lev-ch;return o;};
 return{B,at,h0,ms:Math.round(performance.now()-t0),last:FLOW_BAKE.eruptions.length};})();
window._flowsMs=FLOWS.ms;
const _fl={};
const flowGround=(x,z)=>FLOWS.h0(x,z)+FLOWS.at(x,z,_fl).y;
// THE RILLE: from the main vent's crater rim, meandering down the slope out of the map
const RILLE=KRELIEF.rille({pts:KRELIEF.meander(xzDA(-1800+OLDVENTS[0].r*.25,-400),xzDA(7000,600),{amp:260,wave:1500,seed:KR.hash(WORLD,8,0,0x111)}),
 ground:flowGround,w:170,depth:62,floorW:.16,talus:.32,face:70,bench:6,seed:KR.hash(WORLD,8,1,0x112)});
// THE TUBE: under the plain to the rille's east, its roof fallen in in a chain of pits (big: a titanium basalt's tubes are wide)
const TUBE=KRELIEF.tube({pts:KRELIEF.meander(xzDA(-4200,1300),xzDA(5200,1700),{amp:180,wave:2100,seed:KR.hash(WORLD,9,0,0x113)}),
 ground:flowGround,r:16,roof:9,ridge:2.5,every:150,p:.55,sky:.25,seed:KR.hash(WORLD,9,1,0x114)});
const FORMS=[RILLE,TUBE];
// the rock: the titanium basalt with the summit's ash between its flows (the flank is DOWNWIND, south-east of the summit:
// kits/resources/ROCK-PROPOSAL.md's tuff aprons; src/35t-godthrone-strata.js `tibasalt-ash`); fresh: the alteration line, 8,500 m, is below
const STRATA=KSTRATA.create({seed:KR.hash(WORLD,0,2,0x57A7),formations:[{recipe:'tibasalt-ash'}],range:[10000,11800],
 dip:[DOWN[0],DOWN[1],.004],warp:[6,1.6],wash:{m:2},regolith:.35,dust:0x2a2624});
const _ground=KRELIEF.apply(flowGround,FORMS);
function baseH(x,z){return _ground(x,z);}
// THE MODEL'S FIELDS (45c caches them): face (the rille's and the pits' walls), talus (the rille's aprons), rampart (the old
// cones), glass none, vent (near the main vent), halo and orange: a ring of black beads round each old vent
const MODEL={fieldsAt(x,z,sl,hollow,o){const g0=flowGround(x,z),r=KRELIEF.at(RILLE,x,z,g0),t=KRELIEF.at(TUBE,x,z,g0),F=FLOWS.at(x,z,{});
  o.face=r&&(r.part==='wall')?1:t&&t.part==='collapse'?smooth(.6,1.2,sl):0;
  o.talus=r&&r.part==='talus'?1:t&&t.part==='collapse'?.6:0;
  let ra=0,ring=0,orr=0;for(const V of OLDVENTS){const d=Math.hypot(x-V.x,z-V.z)/V.r;ra=Math.max(ra,smooth(1.1,.7,d));
   /* the dark ring: the beads thickest a cone's radius or two out, thinning over ~6 radii; the youngest (the main) a little orange */
   const g=smooth(.5,1.2,d)*Math.exp(-Math.max(0,d-1.3)/2.4);ring=Math.max(ring,g);if(!V.i)orr=Math.max(orr,.35*Math.exp(-d/2));}
  /* the flows' own surface: rubbly clinker (the spatter channel) along the levees and over the older flows; the youngest glassy */
  const flowOn=F.th>.5?1:0,lev=smooth(.6,2.5,F.levee||0);o.rampart=Math.max(ra,.7*lev,.3*flowOn*(F.age===FLOWS.last?0:1));o.vent=smooth(400,60,Math.hypot(x-VENT.x,z-VENT.z))*.5;
  /* the youngest flow is bare black rock, glassy-skinned; older ones carry their share of the beads */
  const young=F.age===FLOWS.last&&F.th>.8?1:0;
  o.halo=clamp((.18+.82*ring+.3*hollow)*smooth(.95,.45,sl)*(1-.6*ra)*(1-.75*young),0,1);o.glass=.45*young;
  o.orange=clamp(orr+.15*hollow*ring,0,1);
  /* the summit's ash, drifted into the hollows of the older flows (the youngest is bare): pale, thin, downwind */
  o.tuff=clamp(.55*hollow*(1-young)*smooth(.8,.3,sl)*(1-.7*ring),0,.6);return o;},
 after(){const C=VENT;C.base=terrainH(C.x+C.r*1.2,C.z);C.top=C.base+C.h;C.lavaY=terrainH(C.x,C.z);}};
var PORTAL=null;
