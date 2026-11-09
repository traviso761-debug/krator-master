// TARGET: east - station 3 of the dam basins (biomes/dambasins/PLAN.md, section 3): the east bed inside Korona, the overlay over a
// second biome. THE SITE (read by 80-db-bed.js, which sorts after this).
//   where       the east lake's (dam 2's) eastern shore, where it lapped into Korona's west edge (biomes/korona/NOTES.md, "The east
//               lobe's lake laps into Korona": its Aw and Af lowland, then Korona's western ring, crests 2,500-2,600 m with 3,000 to
//               4,000 mm on its face). The east breach ran west, away from here (NOTES.md): no flood scoured this shore, and no port
//               stood on it; what the falling lake left here is its third population of hulks, the ships trapped below the sill and
//               grounded one by one on the strandlines as the water went (nsemiarid/PLAN.md section 5, the Aral pattern)
//   the frame   y = 0 is the east lake's old full level (1,050 m: dams.json, the east dam's lake), x along the old shore, -z the land,
//               +z the bed; the sill at -200 (850 m), today's lake at -1,110 (-60 m, Korona's notes), far out of the station
//   the land    the shore's own profile (80-db-bed.js, station 1's: the notch, the ring, the drain band, the recession), and inland
//               Korona's western ring rising 1,450 m in 6 km, cut by ravines
//   the climate Af and Aw at the shore, 3-4 m of rain on the ring's face: the bed is forest, not salt. Korona's warm wet floor is the
//               hyperjungle (biomes/korona/BIOME-API.md: "the hyperjungle (read in place) on the warm wet floor"), so the bed's
//               flora here is the hyperjungle, read in place; thinner on the bathtub ring's calcite and the drain band's slumps,
//               where the centuries since have had least to work with (91m-bio-45-db-init.js)
// SCALE MODEL 5.1 (checked 2026-11-08): the east dam keeps its 4.21 numbers (dams.json: lake 1,050, crest 1,100, foot 850), but
// the bed no longer closes under 1,050 m on 5.1's ground, so this is an ideal type on the plans' numbers, as stations 1 and 2 are.
const EB={rise:1450,riseZ:6000,ravine:200};
const ebSm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
// the ring's rise inland of the old shore (zz < 0), its spurs and ravines running down to the lake
function ebRise(x,z){const zz=z-dbShore(x);if(zz>=0)return 0;const t=-zz;
 const rise=EB.rise*Math.pow(ebSm(300,EB.riseZ,t),1.25),rav=Math.pow(1-Math.abs(2*fbm(x/520,z/2200,6.1,3)-1),2.6)*EB.ravine*ebSm(250,1600,t);
 return rise-rav+(fbm(x/900,z/900,2.4,3)-.5)*160*ebSm(600,3000,t);}
// THE HULKS (89z-rows.js places them from EB_HULKS): the wrecks and the forest keep off them
const EB_HULKS=[];
var DB_SITE={levels:{lake:'the east lake (dam 2)',full:1050,sill:-200,remnant:-1110,drainZ:2800},seed:907,
 base:(x,z)=>dbShoreBase(x,z)+ebRise(x,z),
 dust:false,climate:{},fog:{color:0xaab4b0,density:.00011},   /* a humid haze, blue-grey, not the steppe's dust (91d) */
 // the palette: a wet country's (Af, Aw), not the steppe's: the forest's dark soil and leaf litter on the land and the bed both, the
 // wall's green under its own trees, the silt darker and browner where the forest has worked it longest (high on the bed), the
 // ring's calcite still pale (alkaline: little grows on it), the strandlines darker bands
 tint:(x,z,h,slope,col,s,n,n2,mix3)=>{const soil=mix3([.34,.27,.18],[.28,.30,.17],ebSm(.35,.7,n)),wall=ebSm(40,400,h),bedK=s.bed>0?s.bed*(1-s.ring*.75):0;
  let c=mix3(col,soil,.82*(1-s.ring*.8));c=mix3(c,[.17,.27,.11],wall*.85);if(bedK>0)c=mix3(c,[.40,.34,.25],bedK*.35*ebSm(-900,-200,h));
  return c;},
 // the wrecks: the lake's boats grounded on the strandlines as it fell (station 1's acceptance), none on the hulks
 wrecks:()=>({x0:-2600,x1:2600,z0:dbShore(0)+40,z1:dbShore(0)+6200,accept:(x,z,h)=>{const s=DB_BASIN.sample(x,z,h,{}),B=KBASIN.BAND;return s.band===B.ring?.01:s.band===B.drain?.02:s.band===B.recession?.03+.2*s.strand:0;},
  avoid:(x,z)=>EB_HULKS.some(H=>Math.hypot(x-H.x,z-H.z)<H.L*.55+40)}),
 // the debris: little (no flood came this way): what the boats shed and the shore's own litter
 flotsam:()=>({x0:-2000,x1:2000,z0:dbShore(0)+30,z1:dbShore(0)+4600,accept:(x,z,h)=>{if(h>-.5)return 0;const s=DB_BASIN.sample(x,z,h,{}),B=KBASIN.BAND;return s.band===B.recession?.04+.12*s.strand:.02;},
  avoid:(x,z)=>EB_HULKS.some(H=>Math.hypot(x-H.x,z-H.z)<H.L*.5+12)}),
 check:{x0:-2400,x1:2400,z0:-300,z1:3200},
 checks:[
  ['east-the-ring-rises',bad=>{const lift=bad?-1300:0,o=[];for(const x of [-1500,0,1500]){const a=DB_NAT(x,dbShore(x)-6000)+lift,b=DB_NAT(x,dbShore(x)+100);o.push([a,b]);}
    const ok=o.every(p=>p[0]-p[1]>1000);return{ok,detail:'6 km inland of the old line the ground stands '+o.map(p=>(p[0]-p[1]).toFixed(0)).join(', ')+' m over it (Korona\'s western ring)'};}],
  ['east-hulks-on-the-strandlines',bad=>{const dz=bad?-3400:0,S={};let off=0;
    for(const H of EB_HULKS){const z=H.z+dz,h=terrainH(H.x,z),s=DB_BASIN.sample(H.x,z,h,S);if(s.band!==KBASIN.BAND.recession||h>DB.sill)off++;}
    return{ok:EB_HULKS.length>=4&&!off,detail:EB_HULKS.length+' hulks below the sill, '+off+' not on the recession'};}]]};
