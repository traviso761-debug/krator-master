// ================================================================= HOST — the map: STATION 2, THE RIFT JUNGLE (PLAN-STATIONS.md)
// The scale model (4.23) at px 418,1251: the Lizardmen river 3's last kilometres and its mouth on the terminal sea (-2,600 m), at the
// western foot of Cube's plateau. y = 0 is the sea's level (so BIO.waterH is 0, as the kit's shore logic expects). The model's cells
// round the site stand +250 to +460 m over the sea and fall to it within 2-4 km; what the page makes of that:
//   the SEA      the north-west corner, yellow with algae (RIFT_LAKE), shallow (to ~7 m: an evaporating terminal sea), its shore wandering
//   the SHORE    a coastal lowland 300-600 m wide, +1 to +10 m: the algal shore, glasswort, the delta's channels
//   the SCARP    a coastal escarpment in two steps: a lower cliff to a bench at +100 m, an upper cliff to the plain at +260 m
//   the PLAIN    rolling jungle +260 to +420 m, rising south-east toward Cube's plateau (beyond the page, in the far country)
//   the RIVER    the Lizardmen river 3 (33 m wide, 53 m3/s at its mouth on the model): across the plain in a meandering channel,
//                over the scarp in two falls (89w), across the lowland to the sea
// Inland is south-east: d is the distance from the shoreline along (1,1)/sqrt 2, t the position along the shore. Noise from core/rand.
// Provides what the shared host reads (45s, 88, 89a): TERR, terrainH, slopeAt, lakeIn, streamD, southK, FIELD_RAW, MAP_ORIGIN; and
// for 89w: RIVER (its centreline by d) and SCARP (the steps' d and heights).
const TERR={R:3200};
const SITE={px:418,py:1251,y0:-2600,atm:1.91};
const KF=(x,z,o,s)=>KRAND.fbm(x,0,z,o,s);
const S2=Math.SQRT1_2;
const along=(x,z)=>(x-z)*S2,inward=(x,z)=>(x+z)*S2;
// the shoreline: d of the shore at t (bays and points), about 1.9 km north-west of the centre
const shoreD=t=>-1900+180*Math.sin(t*.0013+.4)+90*Math.sin(t*.0037-1)+160*(KF(t*.0017,3.3,2,201)-.5);
function lakeIn(x,z){return inward(x,z)-shoreD(along(x,z));}   // > 0 inland, < 0 in the sea
// the scarp: two cliffs at these distances from the shore (they wander a little along it)
const SCARP={lo:[535,560],bench:100,hi:[805,830],plain:260};   /* steep: a fall's curtain (thrown at 5.5 m/s) clears each face */
const scarpOff=t=>70*Math.sin(t*.0021+2)+40*(KF(t*.004,7.1,2,203)-.5);
// the river: its centreline's t as a function of d (meanders on the plain and the lowland, straight in the gorge cut through the
// scarp), entering from the south-east corner
const RIVER={t:d=>{const g=smooth(380,620,d)*smooth(980,760,d);return 120+(1-g)*(260*Math.sin(d*.0016+.6)+90*Math.sin(d*.0047))+g*(90*Math.sin(.6+640*.0016));},
 w:d=>d<500?mix(46,33,smooth(0,500,d)):33,depth:d=>d<500?1.2:d<900?2.5:4};
function riverT(d){return RIVER.t(d);}
function streamD(x,z){const d=lakeIn(x,z);if(d<-40)return 1e9;return Math.abs(along(x,z)-RIVER.t(d));}
// a distributary across the lowland (the delta's second mouth), branching at the lower fall's pool
const DIST={t:d=>RIVER.t(d)-220*smooth(470,60,d)-60*Math.sin(d*.009)};
function distD(x,z){const d=lakeIn(x,z);if(d<-40||d>470)return 1e9;return Math.abs(along(x,z)-DIST.t(d));}
// the ground before the water's cuts: sea bed, lowland, the two cliffs and the bench, the plain rising south-east
function baseH(x,z){const t=along(x,z),d=lakeIn(x,z),o=scarpOff(t);
 if(d<0)return -.5-1.4*smooth(0,-260,d)-5*smooth(-260,-1200,d)+1.5*(KF(x*.0018+5,z*.0018+9,2,213)-.5)*smooth(-40,-200,d);   // the sea's bed: shallow, as the old page's algal lake (to ~-7 m): its yellow and its shoals show
 let h=1+9*smooth(0,420,d);                                                                            // the lowland
 h+=(SCARP.bench-10)*smooth(SCARP.lo[0]+o,SCARP.lo[1]+o,d);                                           // the lower cliff
 h+=(SCARP.plain-SCARP.bench)*smooth(SCARP.hi[0]+o,SCARP.hi[1]+o,d);                                  // the upper cliff
 h+=160*smooth(900,5600,d)+40*(KF(x*.0009,z*.0009,3,205)-.5)*smooth(800,1400,d);                      // the plain, rising inland
 return h;}
function terrainH(x,z){
 let h=baseH(x,z)+3*(KF(x*.006,z*.006,3,207)-.5)+1.2*(KF(x*.03,z*.03,2,209)-.5);
 const d=lakeIn(x,z);
 // the river's channel: a meandering bed on the plain and the lowland, a slot through the cliffs (its falls are the cliffs' height)
 const sd=streamD(x,z),w=RIVER.w(d)*.5,dep=RIVER.depth(d);
 if(sd<w+40){const bed=baseH(x,z)-dep-(d>900?3:0);h=mix(h,Math.min(h,bed),smooth(w+40,w-2,sd));}
 const dd=distD(x,z);if(dd<40)h=mix(h,Math.min(h,baseH(x,z)-1.1),smooth(36,10,dd));
 // the plunge pools under the two falls: bowls in the bench and the lowland
 for(const P of POOLS){const r=Math.hypot(x-P.x,z-P.z);if(r<P.r*1.8)h=mix(h,Math.min(h,P.y-4),smooth(P.r*1.8,P.r*.6,r));}
 return h;}
// the two plunge pools (89w's falls land in them): at the foot of each cliff on the river's line
const POOLS=(function(){const P=[];for(const [d0,r] of [[SCARP.hi[0],40],[SCARP.lo[0],48]]){const dd=d0+scarpOff(RIVER.t(d0))-28,t=RIVER.t(dd),x=(t+dd)*S2,z=(dd-t)*S2;   /* at each cliff's foot where the river meets it (the cliffs wander: scarpOff) */
  /* shoreD varies along t: walk the point so its own lakeIn is dd */
  let px=x,pz=z;for(let k=0;k<6;k++){const e=dd-lakeIn(px,pz);px+=e*S2;pz+=e*S2;}
  P.push({x:px,z:pz,r,y:baseH(px,pz)});}return P;})();
function slopeAt(x,z){const h=terrainH(x,z),e=3;return Math.hypot(terrainH(x+e,z)-h,terrainH(x,z+e)-h)/e;}
function southK(x,z){return 1;}   // all of it on the jungle side: the ground painter's litter palette
const FIELD_RAW={
 wet:(x,z)=>clamp(.88+.08*(KF(x*.0011,z*.0011,2,211)-.5)+.08*smooth(80,10,Math.min(streamD(x,z),distD(x,z))),0,1),
 salt:(x,z)=>{const lk=lakeIn(x,z);return clamp(.9*smooth(90,4,lk)*smooth(-10,40,lk)+.35*smooth(220,80,lk),0,1);},
 // upland: low everywhere (the plain is the jungle's floor at 1.8 atm); the cliffs read as rock (the strata show on them)
 upland:(x,z)=>clamp(Math.max(0,baseH(x,z))/3000+.2*smooth(.7,1.2,slopeAt(x,z)),0,1),
 flow:(x,z)=>clamp(Math.max(smooth(70,15,streamD(x,z)),.7*smooth(50,12,distD(x,z))),0,1),
 // a little mist in the lowland under the cliffs and at the falls' spray
 mist:(x,z)=>{const d=lakeIn(x,z);let m=.25*smooth(0,200,d)*smooth(700,450,d);for(const P of POOLS)m=Math.max(m,.6*smooth(220,40,Math.hypot(x-P.x,z-P.z)));return clamp(m,0,1);}};
// the LOD origins: a 3 x 3 lattice over the page
const MAP_ORIGIN=[];for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)MAP_ORIGIN.push([i*1800,j*1800]);
// the river's and the pools' water for the kit (BIO.init: waterH, and the planting mask MAP_DRY): the surface .6 m over the bed in the
// channel, the pools' level in their bowls, the sea's 0 elsewhere; nothing roots in the channel, the delta channel or a pool
function MAP_WATERH(x,z){for(const P of POOLS)if(Math.hypot(x-P.x,z-P.z)<P.r*1.4)return P.y+.2;const d=lakeIn(x,z);
 if(d>0&&streamD(x,z)<RIVER.w(d)*.5+30)return Math.max(0,baseH(x,z)-RIVER.depth(d)-(d>900?3:0)+.6);if(d>0&&distD(x,z)<30)return Math.max(0,baseH(x,z)-.5);return 0;}
function MAP_DRY(x,z){const d=lakeIn(x,z);if(d<0)return 1;
 /* where a fall comes down the cliffs (the scarp's bands plus 70 m below each) the keep-out widens to 30 m past the river's banks: the
    curtain and its spray stand clear of trunks (the owner, 2026-10-27: a frill tree stood in the upper fall) */
 const o=scarpOff(along(x,z)),fall=Math.max(smooth(SCARP.hi[0]+o-90,SCARP.hi[0]+o-60,d)*smooth(SCARP.hi[1]+o+20,SCARP.hi[1]+o,d),smooth(SCARP.lo[0]+o-90,SCARP.lo[0]+o-60,d)*smooth(SCARP.lo[1]+o+20,SCARP.lo[1]+o,d));
 const hw=RIVER.w(d)*.5+30*fall;let k=smooth(hw+1,hw+7,streamD(x,z))*smooth(8,14,distD(x,z));
 for(const P of POOLS)k*=smooth(P.r*1.4,P.r*2,Math.hypot(x-P.x,z-P.z));return k;}
