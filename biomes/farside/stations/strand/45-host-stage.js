// ================================================================= HOST — stage (Farside, station 3: THE STRAND)
// The same host as station 1's with another landform and another STAGE: 44z (the shell) and 47 (the land) are shared.
//
// WHERE (PLAN.md section 6): an open strand on the coast north of Farport (scale model 5.1 px 293,573; 4.23 px 21,243), under the full spray: the
// first two kilometres in from the surf, where the sea's flora holds everything. Krator's sea has little tide, so the spray
// coral builds its reefs out of the sand above the waterline.
//
// THE MAP (x east, z south, y up from the sea; R 1600; u inland, down the wind, v along the coast):
//   THE SEA          north-west of a long, nearly straight strand (u < ~ -480), a reef of surf rocks off the point at v ~ 650
//   THE BEACH        60 to 80 m of damp sand, the wrack heaped along its line, coral reefs standing out of it
//   THE DUNES        to ~600 m in: transverse ridges 3 to 14 m high under strand eelgrass lying flat inland, windrows of its
//                    dead leaf in the hollows
//   THE KELP         behind the dunes the land kelp begins, short and wind-cut, rising up the slope
//   THE WORKS        two kelp kilns, wrack heaps and a cart, drying racks, a goat fold behind the dunes
const SQ=Math.SQRT1_2;
const UV=(x,z)=>[(x+z)*SQ,(z-x)*SQ],XZ=(u,v)=>[(u-v)*SQ,(u+v)*SQ];
const shoreU=v=>-480+30*Math.sin(v*.0017+.9)+14*Math.sin(v*.0059+.2)-120*Math.exp(-Math.pow((v-650)/240,2));
const coastD=(x,z)=>{const p=UV(x,z);return p[0]-shoreU(p[1]);};
// the spray coral's reefs: patches from the waterline up the beach and into the first dunes
const coralK=(x,z,d)=>smooth(.6,.68,fbm(x*.008+5,z*.008-3,421,3))*smooth(-6,4,d)*smooth(260,120,d);
// the surf rocks: the point's reef and scattered knolls along the waterline
const rockK=(x,z,d)=>{const p=UV(x,z),pt=Math.exp(-Math.pow((p[1]-650)/220,2));
 return clamp(smooth(.62,.7,fbm(x*.012-2,z*.012+7,422,3))*smooth(-120,-10,d)*smooth(60,10,d)+pt*smooth(.45,.55,fbm(x*.02,z*.02,423,2))*smooth(-200,-30,d)*smooth(90,0,d),0,1);};
// the dunes: transverse ridges (crests along the coast, across the wind), in the band 70..640 m, higher inland
const duneH=(x,z,d)=>{const p=UV(x,z),ph=p[0]*.034+3*(fbm(x*.003,z*.003,424,2)-.5)*2;return smooth(60,140,d)*smooth(700,560,d)*(3+11*smooth(80,520,d))*Math.pow(.5+.5*Math.sin(ph),1.6)*(.7+.6*fbm(x*.004+9,z*.004,425,2));};
function groundH(x,z){const d=coastD(x,z);let h;
 if(d<0)h=-.3+.03*d-9*smooth(0,-480,d)+1*(fbm(x*.004,z*.004,426,2)-.5)*smooth(-10,-120,d);
 else{const n=fbm(x*.0015+4,z*.0015-2,427,3)-.5;h=-.3+2.2*smooth(0,60,d)+duneH(x,z,d)+220*Math.pow(smooth(500,3200,d),1.3)+70*n*smooth(500,1100,d);}
 const ck=coralK(x,z,d);if(ck>0)h=mix(h,Math.max(h,.6)+1.2*ck*(.6+.6*fbm(x*.06,z*.06,428,2)),ck);   /* the reefs stand up out of the sand */
 const rk=rockK(x,z,d);if(rk>0)h+=rk*(4.5+5*fbm(x*.05,z*.05,429,2));
 return h;}
const STAGE={
 key:'strand',name:'Farside: the strand',R:1600,seed:2633,
 /* re-sited on map 5.1 (pair 10): the old pixel (5.1 px 302,570) now stands at 1,725 m on the wall's slope; the nearest strand is 5.1 px
    293,573 (16 m, on the tsunami's scour bench, 30 km north of Farport). The sky's frame is on the 4.23 canvas (5.1 less 272,330) */
 site:{px:21,py:243},air:{pressure:1.3,humidity:.95},clouds:{cover:.55},fogDensity:.00026,weather:'clear',
 ground:groundH,coastD,UV,XZ,sea:{level:0,seeds:[XZ(-1500,0),XZ(-1500,-900),XZ(-1500,900)]},
 fields:{
  spray:(x,z)=>{const d=coastD(x,z);return d<0?1:smooth(1800,0,d);},
  invade:(x,z)=>1,front:(x,z)=>0,native:(x,z)=>0,
  sand:(x,z)=>{const d=coastD(x,z);return smooth(-6,2,d)*smooth(720,560,d)*(1-coralK(x,z,d))*clamp(1-rockK(x,z,d)*1.5,0,1);},
  coral:(x,z)=>coralK(x,z,coastD(x,z)),
  rock:(x,z)=>clamp(rockK(x,z,coastD(x,z))*1.6,0,1),
  strand:(x,z)=>{const d=coastD(x,z);return Math.exp(-Math.pow((d-14)/8,2))*(1-coralK(x,z,d));},
  graze:(x,z)=>{const d=coastD(x,z);return smooth(.56,.66,fbm(x*.004+11,z*.004-4,430,2))*smooth(560,700,d);},
  burn:(x,z)=>0,fog:(x,z)=>.2,
  upland:(x,z)=>clamp(groundH(x,z)/300,0,1)},
 natives:null,stream:null,
 farLift:(x,z)=>{const p=UV(x,z);return 900*smooth(2500,9000,p[0])*(.7+.5*fbm(x*.0005,z*.0005,431,3))+300*smooth(1800,5000,p[0])*(fbm(x*.0012,z*.0012,432,2)-.3);},
 works:[['kelpkiln',-420,-260,.2],['kelpkiln',-430,-120,-.15],['wrackheap',-450,-360,0],['wrackheap',-445,40,.5],['wrackheap',-455,220,-.4],
  ['wrackcart',-420,-200,1.2],['rack',-400,-330,.1],['rack',-395,-300,.1],['fold',320,-100,0]],
 spine:[[-480,-300],[-300,100],[-100,500],[150,-200],[600,0]],
 viewList:[['The strand from the surf',-620,-120,6,-300,-50,4],['The dunes and their eelgrass',-200,-400,7,100,-300,6],
  ['Coral reefs out of the sand',-560,0,10,-420,150,1],['The point (surf rocks and sea palms)',-560,520,6,-640,700,2],
  ['The wrack line',-470,-500,3,-470,-300,1],['Windrows in the dune hollows',-100,200,14,150,300,2],
  ['Over the strand from the dunes',150,0,40,-600,0,0],['Where the kelp begins',500,-300,10,800,-200,20]]};
