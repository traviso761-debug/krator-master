// ================================================================= DALAB CITY — geometry (target: city)
// WHERE things are: the world, the Ancient lab, the settlements, the river, the terrain function. Metres; x east,
// z south. The lab stands north of centre; the main settlement south of it; six outlying settlements on a ring
// round both, joined by the highway circuit; the river down the west edge with a channel to the main settlement.
window.CITY=true;
const CITY={
 WORLD:4400,                 // side of the terrain plane (the clearing; the forest closes in at the edge)
 LAB:{x:0,z:-720,scale:.4},  // the Ancient lab: 64-dalab.js at K=4.105 is 2.4 km across; .4 gives a 180 m dome and a 480 m compound
 MAIN:{x:0,z:420,r:520},     // the main settlement: its mound (the palace mound) sits at the south of the plaza and faces the lab
 RING:1560,                  // radius of the outlying ring (from the point between lab and main)
 RING_C:[0,-120],
 HIGHWAY_W:14,STREET_W:8,LANE_W:5.5,
 RIVER_X:-1980,              // the river runs N-S near the west edge
 FOREST_R:2050,              // beyond this the forest is dense
 QUALITY:1,
};
const SEED_CITY=515151;
const FRAME_HOOKS_PRE=[];
function smoothstep(e0,e1,x){const t=clamp((x-e0)/(e1-e0),0,1);return t*t*(3-2*t);}
function angDiff(a,b){let d=Math.abs(a-b)%TAU;return d>Math.PI?TAU-d:d;}
// the six outlying settlements, on the ring at 60-degree spacing (offset so none sits on the lab's axis), each facing the lab
const SETTLE=[];
(function(){const L=CITY.LAB;
 for(let k=0;k<6;k++){const a=k/6*TAU+Math.PI/6;const x=CITY.RING_C[0]+Math.cos(a)*CITY.RING,z=CITY.RING_C[1]+Math.sin(a)*CITY.RING;
  SETTLE.push({key:'town'+(k+1),name:['Ashfold','Greenmarch','Reedholm','Oakhaven','Cornwell','Stonebrook'][k],x,z,r:190,main:false,face:Math.atan2(L.x-x,L.z-z),plazaR:34,moundR:30,streets:6,ringR:96});}
 // the main settlement: 3x; its mound faces the lab (north); the palace mound is the High Priest's seat here
 SETTLE.push({key:'main',name:'Dalab',x:CITY.MAIN.x,z:CITY.MAIN.z,r:CITY.MAIN.r,main:true,face:Math.atan2(L.x-CITY.MAIN.x,L.z-CITY.MAIN.z),plazaR:64,moundR:42,streets:8,ringR:210,ringR2:360});
})();
// the river: a gentle meander down the west edge; the main channel east to the main settlement; irrigation channels to
// the western towns and from the main channel to the eastern ones
function riverX(z){return CITY.RIVER_X+60*Math.sin(z*.0021+1.3)+24*Math.sin(z*.0067);}
const CHANNELS=[];   // [{pts,w}] painted as water and carved into the terrain
(function(){const M=CITY.MAIN;
 CHANNELS.push({pts:[[riverX(M.z-40),M.z-40],[-900,M.z-60],[M.x-M.r-30,M.z-40]],w:10,main:true});
 for(const S of SETTLE){if(S.main)continue;const rx=riverX(S.z);
  if(S.x<-600)CHANNELS.push({pts:[[rx,S.z+30],[(rx+S.x)/2,S.z+50],[S.x-S.r-20,S.z+30]],w:7});
  else{const mc=CHANNELS[0];const from=[-700,M.z-58];CHANNELS.push({pts:[from,[(from[0]+S.x)/2,(from[1]+S.z)/2+60],[S.x-(S.x>0?S.r+20:-(S.r+20)),S.z+40]],w:6});}}
})();
function segD(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);}
function channelD(x,z){let best=1e9,w=0;for(const C of CHANNELS){for(let i=0;i<C.pts.length-1;i++){const d=segD(x,z,C.pts[i],C.pts[i+1]);if(d<best){best=d;w=C.w;}}}return{d:best,w};}
function riverD(x,z){return Math.abs(x-riverX(z));}
// the terrain: flat lowland with a metre of roll, the river cut 3.5 m deep and 70 m wide, the channels 1.4 m deep
// the ground sits ~2.2 m above the datum: the biome reads anything under 0.3 m as water
terrainH=function(x,z){let h=2.2+.9*fbm(x*.0016+3,z*.0016-7,17,3)+.35*fbm(x*.009,z*.009,5,2)-.5;
 const rd=riverD(x,z);if(rd<60){const t=1-smoothstep(28,60,rd);h-=3.5*t;}
 const c=channelD(x,z);if(c.d<c.w){const t=1-smoothstep(c.w*.45,c.w,c.d);h-=1.4*t;}
 return h;};
const WATER_Y=1.25;
function isWater(x,z){return terrainH(x,z)<WATER_Y+.1;}
function nearestSettle(x,z){let best=null,bd=1e9;for(const S of SETTLE){const d=Math.hypot(x-S.x,z-S.z);if(d<bd){bd=d;best=S;}}return{S:best,d:bd};}
