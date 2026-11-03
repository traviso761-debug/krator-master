// ================================================================= HOST - the land: STATION 4, THE DESCENT (PLAN-STATIONS.md; the final rebuild, 2026-11-03)
// On src/45b-host-land.js's LAND CONTRACT (TERR, terrainH, FIELD_RAW, LAND), over the ground of 45a-host-descent-land.js (the step, the cataract's foot, Ālph's
// line; reusable by the `floor` station). This station is the outlet, the cataract and the river's run down to the floor: the Vale's lake and its lip, the
// cataract into its amphitheatre, the valley's rapids and the lower falls, and a strip of the floor at the bottom where Ālph meets the floor's lake. The Vale's
// species follow the river down (the kit's own passes by XANADU.zones from these fields); the floor's own flora, the Rift's natives against tall Xanadu
// forms, is the `floor` station's (the owner, 2026-11-03), not this one's.
const TERR={R:3200,X0:-3400,X1:3400,Z0:-3400,Z1:3400};
function terrainH(x,z){return descentH(x,z);}
// ---------------------------------------------------------------- the climate fields (the kit's zones read them: XANADU.zones)
const FALL_FOOT=[RIV.pool.x,RIV.pool.z];
const sprayK=(x,z)=>smooth(950,70,Math.hypot(x-FALL_FOOT[0],z-FALL_FOOT[1]));
const lowerK=(x,z)=>{const s=sOf(x,z),t=tOf(x,z);return smooth(420,40,Math.abs(t-TR(s)))*smooth(380,0,Math.abs(s-160));};
const rimAt=(x,z)=>{const s=sOf(x,z),t=tOf(x,z);return s<cliffS(t)?rimT(t):rimB(s,t);};
const FIELD_RAW={
 /* Cfa above, a little wetter going down into the dense air; the side ridges in the lee are dry (the garrigue's whorl olives and pitaya); spray, rivers, shores wet */
 wet:(x,z)=>{const s=sOf(x,z),t=tOf(x,z),h=terrainH(x,z),r=riverNear(x,z);
  let w=.6+.08*smooth(LAKE_Y,LAKE_Y-500,h)-.3*smooth(80,380,rimAt(x,z));
  w=Math.max(w,.97*sprayK(x,z),.8*lowerK(x,z),r?.96*smooth(130,12,r.d):0,.86*smooth(420,0,s-lakeShore(t))*smooth(-1500,-2200,s),.9*smooth(300,0,seaShore(t)-s));
  return clamp(w+.08*(fbm(x*.0024-9,z*.0024+3,91,2)-.5),0,1);},
 salt:(x,z)=>{const s=sOf(x,z),t=tOf(x,z);return clamp(smooth(200,700,t)*smooth(1600,2300,s),0,1);},
 /* the side ridges and the step's own face: the uplands and the crag */
 upland:(x,z)=>{const s=sOf(x,z),t=tOf(x,z),sc=cliffS(t);return clamp(.05+.5*smooth(120,420,rimAt(x,z))+.35*smooth(sc-60,sc,s)*smooth(sc+70,sc+20,s),0,1);},
 flow:(x,z)=>{const r=riverNear(x,z);return r?clamp(smooth(95,8,r.d),0,1):0;},
 mist:(x,z)=>clamp(Math.max(.95*sprayK(x,z),.7*lowerK(x,z)),0,1)};
// ---------------------------------------------------------------- the land, for the shared host
const LAND={station:'descent',label:'The descent',
 hint:'Xanadu, the descent: the Vale\'s lake goes over the cataract, 265 m into its amphitheatre, and Ālph runs down its valley to the abyssal floor (station 4)',
 sd:(x,z)=>{const s=sOf(x,z),t=tOf(x,z);return Math.min(s-lakeShore(t)+(s>cliffS(t)?1e4:0),seaShore(t)-s);},
 mask:(x,z)=>{const s=sOf(x,z),t=tOf(x,z),h=terrainH(x,z);
  if(s<cliffS(t)&&h<LAKE_Y+.2)return 0;                                       // the Vale's lake
  if(Math.hypot(x-RIV.pool.x,z-RIV.pool.z)<RIV.pool.r+3)return 0;            // the plunge pool
  const r=riverNear(x,z);if(r&&r.d<r.w+3)return 0;                            // the river's channel and its water
  try{if(WATER_FN.shore(x,z)<1.5)return 0;}catch(e){}                        // the water the eye sees (89z's fields exist before the kit builds; before them, a const not yet made)
  return 1;},
 spine:[xzOf(-2350,0),xzOf(-1990,0),RIV.lip,[RIV.pool.x,RIV.pool.z],xzOf(-1500,TR(-1500)),xzOf(-900,TR(-900)),xzOf(-300,TR(-300)),xzOf(160,TR(160)),xzOf(800,TR(800)),
  xzOf(1500,TR(1500)),xzOf(2200,TR(2200)),xzOf(-2100,-1200),xzOf(-2100,1200),xzOf(-600,-1500),xzOf(-600,1500)],
 snowH:1e5,lake:true,river:RIV,waterY:0,bands:{upland:[0,1100]},
 belt:{y0:LAKE_Y-300,y1:LAKE_Y+60,windward:[DX[0],DX[1]],density:.0012},   /* the cataract's mist on the step's south-east faces, fed by the spray */
 /* feetOwed: 1,226 of 60,906 sampled feet off the drawn ground on 2026-11-03 (SwiftShader), all the kit's own floor items (grass 542, trunk 294, frond 178,
    star 86, ...) on the valley's 17% slopes and the step's foot, floating 2-4 m: the kit's floor pass seats on a height that is not the drawn mesh there
    (NOTES.md). A ratchet: down, never up */
 dome:false,feetOwed:1226,R:TERR.R+300,
 far:{label:'The abyss round the descent',
  h:(x,z)=>{const s=sOf(x,z),t=tOf(x,z),g=terrainH(clamp(x,TERR.X0,TERR.X1),clamp(z,TERR.Z0,TERR.Z1)),d=Math.max(Math.abs(x)-3400,Math.abs(z)-3400,0);
   if(s<lakeShore(t)-200)return LAKE_Y-.4;if(s>seaShore(t)+100)return -.4;   /* the two lakes past the water's boxes */
   const rid=1-Math.abs(2*KRAND.fbm(x*.0005,.5,z*.0005,3,623)-1),wall=smooth(2500,9000,Math.abs(t))*(900+700*rid);
   return g*smooth(1400,0,d)+Math.max(wall,s<cliffS(t)?LAKE_Y+40+300*smooth(0,5000,-s-2500):0);},
  color:(x,z,y,q)=>{const L=a=>a.map(v=>Math.pow(v/255,2.2)),M=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
   if(y<1)return M(L([30,70,72]),L([96,108,112]),.4*smooth(4500,13000,q.r));if(Math.abs(y-LAKE_Y+.4)<.2)return M(L([60,128,122]),L([110,124,128]),.4*smooth(4500,13000,q.r));
   const t=tOf(x,z);let c=M(L([40,66,34]),L([150,136,100]),smooth(-200,600,t)*smooth(LAKE_Y-600,LAKE_Y-850,y));c=M(c,L([128,110,96]),smooth(LAKE_Y+100,LAKE_Y+900,y));
   return M(c,L([100,112,118]),.5*smooth(4500,13000,q.r));}},
 mirror:()=>({materials:[SEA_DRAW.mesh.material],level:0,center:xzOf(3000,0),radius:900,far:4000})};
