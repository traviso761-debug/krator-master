// ================================================================ DAM BASINS — the bed (biomes/dambasins/PLAN.md)
// The ground of a drained dam lake's old shore, in the Ancient Port kit's frame: x runs along the old shore, -z is the
// land, +z the bed, and y = 0 is the lake's old FULL level (900 m on the west bed), so the kit's decks stand at their
// 6 m freeboard over the old water, as they were built. The adapted terrain fragment (71-port-terrain.js) takes its
// natural ground from DB_NAT and its colours from dbGroundTint, and with DB_DRY draws no sea, no underwater fade and no
// port scrub.
//   the land     rising gently inland, a low scarp behind the old beach (the notch the waves cut while the lake stood)
//   the line     KBASIN's bench at the full level and its beach ridge just over it
//   the ring     0 to -30 m: the bathtub ring, the reservoir's yearly drawdown, a band of bleached calcite stain
//   the drain    -30 to -200 m (the sill): the slope the water left in days when the dam broke: gullied, slumped, no
//                strandlines, the docks and moored ships stranded at its head
//   the recession under the sill: the centuries' fall, KBASIN's staircase of strandlines, salt growing downward
// Deterministic: the ground is a function of x and z (the kit's fbm with fixed seeds, KBASIN's own hashes); no draws.
const DB_DRY=true;
const dbSm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};   // smoothstep (the kit has none)
const DB={full:900,sill:-200,ring:30,remnant:-981,drainZ:2800,wind:[1,.3]};   // levels in this frame: m over the full level
// the bed's marks: one dam lake whose old basin is everything bedward of the old shore (KBASIN, core/terrain)
const DB_BASIN=KBASIN.create({seed:903,wind:DB.wind,lakes:[{name:'the west lake',kind:'dam',level:0,sill:DB.sill,ring:DB.ring,remnant:DB.remnant,member:()=>1}]});
// the old shore wanders along x (the port's own wander, so the kit's quay line sits on it)
function dbShore(x){return -10+60*(fbm(x/1400+3.7,1.3,.7,3)-.5)+10*(fbm(x/170,4.1,2.2,2)-.5);}
// the ground before the basin's marks: zz metres bedward of the old shore
function dbBase(x,z){const zz=z-dbShore(x);
 if(zz<0){const t=-zz;   // the land: a gentle rise, the notch's scarp a stone's throw behind the beach, hills inland
  return 1.2*dbSm(0,12,t)+7*dbSm(18,46,t)+Math.max(0,t-46)*.02+(fbm(x/420,z/420,1.9,3)-.5)*18*dbSm(60,320,t)+(fbm(x/60,z/60,7.7,2)-.5)*1.4*dbSm(10,60,t);}
 // the bed: the fast drain falls to the sill over DB.drainZ (steeper past the ring), then the recession, gentler
 const u=zz/DB.drainZ,fall=zz<DB.drainZ?DB.sill*(u*.82+.18*u*u):DB.sill-(zz-DB.drainZ)*.035;
 // the drain band's gullies (running downslope, along z) and its slump lobes; both fade toward the line and the sill
 const band=dbSm(80,420,zz)*(1-dbSm(DB.drainZ*.85,DB.drainZ*1.2,zz));
 const gully=Math.pow(1-Math.abs(2*fbm(x/48,zz/700,3.3,3)-1),2.2)*-6*band;
 const slump=(dbSm(.58,.74,fbm(x/320,zz/260,9.1,2))-.25)*8*band;
 return fall+gully+slump+(fbm(x/90,z/90,5.5,2)-.5)*1.6;}
function DB_NAT(x,z){const h=dbBase(x,z);return DB_BASIN.land(x,z,h);}
// THE COLOURS (sRGB-ish, to linear at the end as the kit's own): the land the steppe's tan and sage; the ridge's pebbles;
// the ring bleached calcite streaked downslope; the drain band's grey-buff silt, darker in the gullies; the recession's
// pale silt with its strandlines and the salt whitening down toward today's water; rock where it is steep
const DB_GC={steppe:[.70,.62,.47],sage:[.60,.63,.51],pebble:[.62,.59,.53],ring:[.91,.89,.83],silt:[.74,.69,.58],silt2:[.64,.59,.50],
 strand:[.56,.51,.42],salt:[.94,.92,.88],rock:[.36,.33,.31]};
const DB_S={};
function dbGroundTint(x,z,h,slope,c,paint){if(paint)return c;   // a stamp's own paint stays (the decks, the aprons)
 const s=DB_BASIN.sample(x,z,h,DB_S),n=fbm(x/140,z/140,2.7,3),n2=fbm(x/19,z/19,8.1,2)-.5,mix3=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
 let col=mix3(DB_GC.steppe,DB_GC.sage,clamp((n-.45)*3,0,1)*.6);
 col=mix3(col,DB_GC.pebble,s.shore*.8);
 if(s.bed>0){let b=mix3(DB_GC.silt,DB_GC.silt2,clamp(.5+n2*1.4,0,1));
  // the drain band's gullies hold darker, damper silt (the ground's fall from DB_NAT's gullies: slope reads them)
  b=mix3(b,DB_GC.silt2,clamp(slope*1.6,0,.6)*(s.band===KBASIN.BAND.drain?1:.3));
  b=mix3(b,DB_GC.strand,s.strand*.5);
  b=mix3(b,DB_GC.salt,dbSm(.25,.8,s.salt)*.85);
  // the ring: calcite bleached on the rock and silt, streaked downslope (long along z, thin along x)
  const streak=.75+.25*fbm(x/7,z/90,4.4,2);b=mix3(b,DB_GC.ring,s.ring*streak);
  col=mix3(col,b,s.bed);}
 if(slope>.6){const t=clamp((slope-.6)*2.2,0,1)*(1-s.ring*.6);col=mix3(col,DB_GC.rock,t);}
 const k=.93+n2*.16;return col.map(v=>Math.pow(clamp(v*k,0,1),1.9));}
