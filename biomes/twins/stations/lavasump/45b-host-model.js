// ================================================================= HOST — the ground model: THE RED CISTERN (station 3)
// The trap's ground as plain functions of (x, z) on the frame: baseH, STRATA, the decoy tube's line (TD, floorT), its portal (PORT, the trench),
// the amphitheatre and its pond (POND), MODEL. Started from station 1's (stations/pyroduct/45b-host-model.js): the same rock, the same trench.
//   THE BOWL     map 5.1's dent round the site (REGION, smoothed): ~1 km deep at 2 km cells, read as the amphitheatre's great bowl; its walls
//                past 900-1,600 m are the map's own
//   THE SHELF    inside it a lava shelf (the model's "lava-pool shelf graded into the slope": tools/scale-model/build_425_master.py section 4)
//                rising gently north-west, a shallow valley along the tube's line toward the portal
//   THE TUBE     the decoy (KCAVERN, 87): its floor from the amphitheatre's wall (4,894 m) up at 6 degrees for 600 m to the portal, its cover
//                thinning from 50 m to 8 m; the portal at the head of a collapsed trench 190 m long (station 1's), the arch its head wall
//   THE CISTERN  the blind collapse amphitheatre at the site: walls 66 m high round a floor 140 m across; the pond 90 m across at 4,890 m,
//                its margins a blister crust a hand over the lava, ash and talus at the walls' feet, the ash-dusted ramp from the tube's mouth
const SITE_Y=REGION?REGION.y0:4890;
const nrm2=v=>{const l=Math.hypot(v[0],v[1]);return[v[0]/l,v[1]/l];};
const BOWL=(x,z)=>SITE_Y+(REGION?REGION.smooth(x,z):0);
// the tube's line: from the amphitheatre (the origin) north-west, up the shelf (the NW Twin's apron rises that way)
const TD=nrm2([-1,-.9]),TN=[-TD[1],TD[0]];
const tq=(x,z)=>[x*TD[0]+z*TD[1],Math.abs(-x*TD[1]+z*TD[0])];   // along the tube from the pit's middle, across it
const TUBE={w:16,h:12,ledge:{v:4,d:1.4},s0:60,s1:680,grade:Math.tan(6*Math.PI/180)};
const POND={r:45,level:SITE_Y,crust:[45,62],T:1150,name:'The Red Cistern\'s lava pond (1,150 C basaltic andesite, churning, 90 m across)'};
const PIT={floor:SITE_Y+.4,wall0:72,rim:100,name:'The Red Cistern (a blind collapse amphitheatre open to the sky)'};
function floorT(s){return SITE_Y+4+TUBE.grade*(s-80);}   // the tube's floor (4,894 m at the amphitheatre's wall)
const coverT=s=>mix(50,8,smooth(100,650,s));
// the portal: its mouth at s = 680, its trench outside it (PORT.d points into the tube, toward the pit: station 1's frame)
const PORT={x:TD[0]*TUBE.s1,z:TD[1]*TUBE.s1,d:[-TD[0],-TD[1]],r:13,rim:3,name:'The decoy portal (a wide basalt arch carved with counterfeit caravan tally-marks)'};
const along=(P,x,z)=>{const dx=x-P.x,dz=z-P.z;return[dx*P.d[0]+dz*P.d[1],Math.abs(-dx*P.d[1]+dz*P.d[0])];};
const TRENCH={back:190,flat:40,half:10};
const PORT_FLOOR=floorT(TUBE.s1);
function trenchAt(x,z,g){const q=along(PORT,x,z),s=q[0],c=q[1];if(s<-TRENCH.back-30||s>40||c>TRENCH.half+60)return g;
 const yF=PORT_FLOOR,T=s<=0?mix(g,yF,smooth(-TRENCH.back,-TRENCH.flat,s)):yF+s*4.5;
 return Math.min(g,T+Math.max(0,c-TRENCH.half)*2.2+.6*smooth(TRENCH.half-3,TRENCH.half,c));}
// ---------------------------------------------------------------- the shelf and the valley along the tube
const surfT=s=>floorT(Math.max(s,80))+TUBE.h+coverT(Math.max(s,80));
function shelfH(x,z){const r=Math.hypot(x,z),q=tq(x,z),s=q[0],c=q[1];
 const shelf=floorT(80)+TUBE.h+coverT(80)+.07*Math.max(0,r-100)+3*(fb(x*.004,z*.004,2,WORLD+70)-.5);
 const valley=surfT(s)+.12*Math.max(0,c-30)+2*(fb(x*.006,z*.006,2,WORLD+71)-.5);
 const own=s>80?Math.min(shelf,valley):shelf;
 return mix(own,BOWL(x,z),smooth(900,1600,r));}
// ---------------------------------------------------------------- the frost (KFROST) on the bowl's walls, the rock
const LSLOPE=(x,z)=>{const e=40;return Math.hypot(BOWL(x+e,z)-BOWL(x-e,z),BOWL(x,z+e)-BOWL(x,z-e))/(2*e);};
const FROST=KFROST.create({seed:KR.hash(WORLD,3,1,0xF205),ground:(x,z)=>BOWL(x,z),lobes:{cell:30,h:1.2,where:(x,z)=>smooth(.08,.2,LSLOPE(x,z))*smooth(.6,.35,LSLOPE(x,z))*smooth(700,1200,Math.hypot(x,z))}});
const STRATA=KSTRATA.create({seed:KR.hash(WORLD,0,3,0x57A7),formations:[{recipe:'tibasalt'}],range:[4500,6200],
 dip:[TD[0],TD[1],.008],warp:[5,1.4],wash:{m:2},regolith:.4,dust:0x2c2a28});
// ---------------------------------------------------------------- the amphitheatre
function pitAt(x,z,g){const r=Math.hypot(x,z);if(r>PIT.rim+4)return g;
 const n=fb(x*.05,z*.05,2,WORLD+72)-.5;let y;
 if(r<POND.r)y=POND.level-2.4;
 else if(r<POND.crust[1])y=POND.level+.22+.12*n;   /* the blister crust: a hand over the lava */
 else if(r<PIT.wall0)y=mix(POND.level+.4,PIT.floor+2.6,smooth(POND.crust[1],PIT.wall0,r))+.4*n;
 else y=PIT.floor+2.6+(g-PIT.floor-2.6)*Math.pow(smooth(PIT.wall0,PIT.rim,r),.85)+1.5*n*smooth(PIT.wall0,PIT.wall0+6,r);
 /* the ash-dusted ramp from the tube's mouth down onto the crust (the guide sends the pack-train down it) */
 const q=tq(x,z);if(q[0]>0&&q[1]<9&&r<PIT.wall0+2&&r>POND.r+4)y=Math.max(y,mix(POND.level+.3,floorT(80),smooth(POND.r+6,PIT.wall0+2,r))-.6*smooth(6,9,q[1]));
 return Math.min(g,y);}
function preH(x,z){return shelfH(x,z)+FROST.h(x,z)+1.2*(vn(x*.06,z*.06,WORLD+53)-.5)*smooth(100,140,Math.hypot(x,z));}
function baseH(x,z){let g=pitAt(x,z,trenchAt(x,z,preH(x,z)));return REGION?REGION.blend(g,x,z,4400,9500,SITE_Y):g;}
// ---------------------------------------------------------------- what the kit's fields read
const MODEL={
 /* warm: the amphitheatre (snow-free, the lava's heat) and the portal's breath (+22 C air wafting out) */
 warmAt(x,z){const r=Math.hypot(x,z),q=along(PORT,x,z),dp=Math.hypot(Math.max(0,q[0]),Math.max(0,q[1]-TRENCH.half))+Math.max(0,-q[0]-50);return Math.max(smooth(PIT.wall0+6,PIT.wall0-2,r),smooth(24,4,dp)*(q[0]>-70?.85:0));},
 heatAt(x,z){const r=Math.hypot(x,z);return r<POND.r?POND.T:r<POND.crust[1]?mix(900,300,smooth(POND.r,POND.crust[1],r)):-8+80*smooth(PIT.rim+20,POND.crust[1],r);},
 classAt(x,z,o){const r=Math.hypot(x,z),q=tq(x,z),n=vn(x*.08,z*.08,WORLD+74);
  o.crust=Math.max(o.crust||0,smooth(POND.r-1,POND.r+1,r)*smooth(POND.crust[1]+1,POND.crust[1]-1,r),.9*smooth(PIT.wall0+8,PIT.wall0,r));   /* old crust under the floor's ash */
  /* the ash: dusting the crust (it hides the glow), deep at the walls' feet and on the ramp, wind-laid along the valley to the portal */
  const a=Math.max(.35*o.crust*(.6+.6*n),smooth(POND.crust[1]-2,POND.crust[1]+4,r)*smooth(PIT.wall0+10,PIT.wall0,r),
   q[0]>TUBE.s1-260?.45*smooth(40,12,q[1])*smooth(TUBE.s1-260,TUBE.s1-120,q[0])*(.6+.6*n):0);
  o.ash=Math.max(o.ash||0,clamp(a,0,1));return o;},
 pathAt(){return 0;},
 fieldsAt(x,z,sl,hollow,o){const r=Math.hypot(x,z);o.face=smooth(.95,1.5,sl);o.talus=smooth(PIT.rim+40,PIT.rim+8,r)*smooth(PIT.rim,PIT.rim+6,r)*(1-o.face);
  o.obsidian=.15;o.scree=clamp((.55+.45*smooth(.2,.6,sl))*(1-o.face),0,1);
  o.lichen=clamp(.5*smooth(.45,.12,sl)*smooth(.35,.75,vn(x*.01,z*.01,WORLD+61))*smooth(140,200,r),0,1);
  o.blocks=clamp(.12*smooth(.4,.75,vn(x*.004,z*.004,WORLD+62))*smooth(160,300,r)*(1-o.face),0,1);o.poly=0;return o;},
 maskAt(x,z){return Math.hypot(x,z)<PIT.wall0?0:1;},   /* nothing loose on the crust, the pond or the ramp: the kit's pass keeps out */
 after(){PORT.y=terrainH(PORT.x+PORT.d[0]*12,PORT.z+PORT.d[1]*12);PORT.floor=PORT_FLOOR;
  let lo=1e9;for(let k=0;k<72;k++){const a=k/72*TAU;lo=Math.min(lo,terrainH(Math.cos(a)*(PIT.rim+2),Math.sin(a)*(PIT.rim+2)));}PIT.rimY=lo;
  PIT.apronY=terrainH((POND.r+8)*TN[0],(POND.r+8)*TN[1]);}};
