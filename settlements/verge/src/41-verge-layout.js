// ================================================================= VERGE — layout ([G data])
// Everything that says WHERE, and nothing that draws: the plateau and its canyon, the escarpment, the cataract
// gorge, the plunge pool, the lower river, the abyss floor and its salt lakes, the switchback trail with its
// hairpins and rest stops, the funicular's line, the highways and the two city districts. Plain maths on
// core/rand (KRAND): no THREE, no DOM, no Math.random, so it runs in node (tests/test-layout.js) and a Godot port
// reproduces it from the same seed (GODOT-PLAN.md rules 2 and 3).
//
// COMPASS: x east, z south, north is -z; metres; y up. A person is 1.75 m.
// ORIGIN: the LOWER TRAILHEAD, at the foot of the descent (the Yuni-engine kit's night-light volume is centred here).
//
// THE MAP (west to east):
//   the PLATEAU          ~938 m, eastern high desert; mesas well out (sedesert biome)
//   the CANYON           the river has cut it ~75 m into the plateau; its floor (862 m at the lip, rising west) holds
//                        UPPER VERGE and the linear oasis; the canyon flares to 600 m wide at its mouth
//   the LIP              x ~ -1400: the edge of the plateau
//   the ESCARPMENT       north and south of the canyon mouth: benched cliffs ~560 m deep
//   the SPUR             z -190..190: the easiest descent, a long concave ramp 1400 m deep down which the
//                        SWITCHBACK runs (26 legs, ~7 km, 12% grade), and beside it the Ancients' FUNICULAR ran
//   the GORGE            z ~ -226, cut into the escarpment north of the spur: SEVEN CATARACTS, ~120 m each, from the
//                        lip (858 m) to the PLUNGE POOL (3 m) at its foot
//   the ABYSS FLOOR      ~0..6 m round the city, falling east; LOWER VERGE round the trailhead, the pool and the river
//   the LOWER RIVER      from the pool east, meandering, to the SALT LAKES 8-16 km east (seen from the top)
const VG=(function(){
'use strict';
const clamp=(v,a,b)=>v<a?a:v>b?b:v, mix=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const SEED=7310;
const S_PLAT=KRAND.child(SEED,'plateau'),S_CAN=KRAND.child(SEED,'canyon'),S_ESC=KRAND.child(SEED,'escarpment'),S_FLOOR=KRAND.child(SEED,'floor'),S_MESA=KRAND.child(SEED,'mesas');
// value noise and fbm in the plane (KRAND's 3-D noise at y = 0.5)
const vn=(x,z,s)=>KRAND.vnoise(x,0.5,z,s);
const fbm=(x,z,o,s)=>KRAND.fbm(x,0.5,z,o,s);
const E={PLAT:938, LIP_X:-1400, CAN_LIP:862, FLOOR:4, POOL_Y:3.0};

// ---------------------------------------------------------------- the plateau
const MESAS=[[-3600,-1500,210,46],[-4700,900,260,58],[-2600,1500,170,38],[-5600,-600,300,64],[-3300,2400,240,40],[-2300,-2100,190,52]];
function mesaH(x,z){let h=0;for(let i=0;i<MESAS.length;i++){const M=MESAS[i],dx=x-M[0],dz=z-M[1],d=Math.hypot(dx,dz);if(d>M[2]*1.6)continue;
 const a=Math.atan2(dz,dx),e=M[2]*(1+.07*Math.sin(3*a+i)+.05*Math.sin(7*a+2*i)),u=d/e;h+=M[3]*(.82*smooth(1.0,.9,u)+.18*smooth(1.25,.96,u));}return h;}
function plateauH(x,z){return E.PLAT+14*(fbm(x*.0009+3,z*.0009-2,3,S_PLAT)-.5)+2.2*(fbm(x*.02,z*.02,2,S_PLAT+1)-.5)+mesaH(x,z);}

// ---------------------------------------------------------------- the canyon (upper river)
// the canyon's centreline, half-width and floor; the river runs in the north part of the floor
function canZ(x){return -100+40*Math.sin((x-E.LIP_X)*.0021)*smooth(-1450,-1900,x);}
function canHW(x){return 212+88*smooth(-2400,-1420,x)+14*Math.sin(x*.004+1.3);}
function canFloor(x){return E.CAN_LIP+.004*Math.max(0,E.LIP_X-x);}
const CAN_WALL=64;                                         // the wall's horizontal width, floor to rim
function rivUZ(x){return canZ(x)-.42*canHW(x)+30*Math.sin((x-E.LIP_X)*.0047)*smooth(-1420,-1700,x);}
const RIVU={hw:9,bank:17,bed:1.7};
function WLU(x){return canFloor(Math.min(x,E.LIP_X))-1.1;}  // the upper river's surface
// the canyon floor's own relief: gentle, with a low terrace on the river side
function canFloorH(x,z){return canFloor(x)+.9*(fbm(x*.012,z*.012,2,S_CAN)-.5)+1.6*smooth(30,90,Math.abs(z-rivUZ(x)));}
// the upper surface: the plateau with the canyon cut into it (valid west of the lip; the escarpment reads it AT the lip)
function upperH(x,z){
 const dz=Math.abs(z-canZ(x)),hw=canHW(x),P=plateauH(x,z);
 if(dz>=hw+CAN_WALL)return P;
 const F=canFloorH(x,z);if(dz<=hw)return F;
 let f=(dz-hw)/CAN_WALL;f=f-Math.sin(2*Math.PI*2*f)/(2*Math.PI*2)*.82;           // two benches up the wall
 return F+(P-F)*clamp(f,0,1);}

// ---------------------------------------------------------------- the lip, the escarpment and the spur
function lipX(z){const k=smooth(240,520,Math.abs(z+40));return E.LIP_X+k*(34*Math.sin(z*.0031+1)+16*Math.sin(z*.011)+140*(fbm(z*.0011,3.7,3,S_ESC+7)-.5)+22*Math.sin(z*.023+2));}
function kSpur(z,x){const w=x===undefined?0:22*Math.sin(x*.0063+1.2)+12*Math.sin(x*.017);return smooth(-204,-166,z)*(1-smooth(194+w,262+w,z));}   // its north flank drops to the river below the pool; its south flank wanders
function escW(z,x){return mix(560*(1+.5*(fbm(z*.0016,9.1,2,S_ESC+3)-.5)),1400+70*(fbm(z*.009,4.4,2,S_ESC+11)-.5),kSpur(z,x));}   // the spur's toe is ragged too
// the abyss floor (east of the escarpment's foot), falling gently east toward the salt lakes
const SALT_LAKES=[{x:10400,z:-600,rx:2900,rz:1500,a:.25},{x:14600,z:2100,rx:2300,rz:1700,a:-.4},{x:12600,z:-4300,rx:2600,rz:1200,a:.1},{x:7400,z:3900,rx:1500,rz:900,a:.6}];
const SALT_Y=-27;
function lakeD(x,z){let m=1e9;for(const L of SALT_LAKES){const c=Math.cos(L.a),s=Math.sin(L.a),dx=x-L.x,dz=z-L.z,u=(dx*c+dz*s)/L.rx,v=(-dx*s+dz*c)/L.rz;
 const w=1+.12*Math.sin(Math.atan2(v,u)*5+L.x);m=Math.min(m,(Math.hypot(u,v)-w)*Math.min(L.rx,L.rz));}return m;}   // < 0 inside a lake
function floorH(x,z){
 let h=E.FLOOR-.0034*Math.max(0,x-900)-.0016*Math.max(0,-x-2000)+2.4*(fbm(x*.0016,z*.0016,3,S_FLOOR)-.5)+.5*(fbm(x*.03,z*.03,2,S_FLOOR+3)-.5);
 h=Math.max(h,SALT_Y+.6);
 const ld=lakeD(x,z);if(ld<220)h=Math.min(h,mix(SALT_Y-4,h,smooth(-300,220,ld)));
 return h;}
// the cliff's profile across the escarpment (u 0 at the lip .. 1 at the foot): benches like bedded rock
function cliffP(u){const uc=Math.min(1,u/.84),f=1-uc,n=7;return .06*(1-smooth(.8,1,u))+.94*clamp(f-Math.sin(2*Math.PI*n*f)/(2*Math.PI*n)*.86,0,1);}   // benched cliff, then a talus apron
// the spur's profile: concave, steeper at the top, easing out onto the floor
// the spur's long profile: a steady fall, stepped by low ledges (the beds it is cut from) every ~55 m of height
function spurP(u){const f=Math.pow(1-u,1.12),n=16;return clamp(f-Math.sin(2*Math.PI*n*f)/(2*Math.PI*n)*.38,0,1);}
function escH(x,z,F){const L=lipX(z),W=escW(z,x),u0=(x-L)/W;if(u0>=1)return F;
 const k=kSpur(z,x);
 // buttresses and bays: the cliff's face is ribbed every ~130 m along the rim
 const u=clamp(u0+(1-k)*.055*Math.sin(z*.048+6*fbm(z*.004,x*.002,2,S_ESC+5)),0,1);
 const P=mix(cliffP(u),spurP(u0),k),U=upperH(L,z);
 const rough=(1-k*.85)*18*(fbm(x*.006,z*.006,3,S_ESC)-.5)*Math.sin(Math.PI*clamp(u0,0,1));
 // the spur is a ridge: its crest stands a little above its flanks, and shallow ribs run down it
 const crest=k*(14*Math.sin(Math.PI*clamp((z+200)/460,0,1))-6)*Math.sin(Math.PI*clamp(u0,0,1));
 const ribs=k*3.5*(fbm(x*.004,z*.03,2,S_ESC+9)-.5)*Math.sin(Math.PI*clamp(u0,0,1));
 return F+(U-F)*P+rough+crest+ribs;}

// ---------------------------------------------------------------- the gorge and the cataracts
// The river leaves the canyon at the lip and drops through seven cataracts in a slot cut into the escarpment north of
// the spur, into the plunge pool. x: where each fall's lip is; top/bot: the water above and below it.
const FALLS=[[-1398,858.6,742],[-1330,742,618],[-1262,618,497],[-1190,497,372],[-1112,372,251],[-1030,251,128],[-945,128,E.POOL_Y]].map((f,i)=>({id:'falls-'+(i+1),x:f[0],top:f[1],bot:f[2],h:+(f[1]-f[2]).toFixed(1)}));
const POOL={x:-886,z:-226,r:56,y:E.POOL_Y,depth:6};
function gorgeZ(x){return -226+7*Math.sin((x-E.LIP_X)*.012);}
function gorgeHW(x){let w=31+7*Math.sin(x*.021+.4);for(const f of FALLS){const d=x-f.x;if(d>2&&d<46)w+=13*Math.sin(Math.PI*(d-2)/44);}return w;}
// the gorge's water surface
function WLG(x){if(x<FALLS[0].x)return WLU(x);for(let i=FALLS.length-1;i>=0;i--)if(x>=FALLS[i].x)return FALLS[i].bot;return WLU(x);}
// its bed: plunge basins under each fall, shallower runs between
function gorgeBed(x){const w=WLG(x);let d=1.4;for(const f of FALLS){const t=x-f.x;if(t>=0&&t<40)d=Math.max(d,1.4+5*Math.sin(Math.PI*Math.min(1,t/40)));}return w-d;}
const GORGE={x0:E.LIP_X-24,x1:FALLS[FALLS.length-1].x+20};

// ---------------------------------------------------------------- the lower river
const RIVL_CTRL=[[POOL.x,POOL.z],[-700,-246],[-480,-232],[-250,-268],[0,-298],[320,-280],[640,-232],[1000,-246],[1500,-196],[2200,-232],[3000,-160],[4100,-196],[5400,-120],[7000,-40],[8200,-120]];
const RIVL=(function(){const P=[];for(let i=0;i<RIVL_CTRL.length-1;i++){const a=RIVL_CTRL[Math.max(0,i-1)],b=RIVL_CTRL[i],c=RIVL_CTRL[i+1],d=RIVL_CTRL[Math.min(RIVL_CTRL.length-1,i+2)];
  const n=Math.max(2,Math.round(Math.hypot(c[0]-b[0],c[1]-b[1])/12));
  for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;   // Catmull-Rom
   P.push([.5*((2*b[0])+(-a[0]+c[0])*t+(2*a[0]-5*b[0]+4*c[0]-d[0])*t2+(-a[0]+3*b[0]-3*c[0]+d[0])*t3),.5*((2*b[1])+(-a[1]+c[1])*t+(2*a[1]-5*b[1]+4*c[1]-d[1])*t2+(-a[1]+3*b[1]-3*c[1]+d[1])*t3)]);}}
 P.push(RIVL_CTRL[RIVL_CTRL.length-1].slice());
 let s=0;P[0].push(0);for(let i=1;i<P.length;i++){s+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);P[i].push(s);}
 return{pts:P,len:s,hw:15,bank:30,bed:1.9};})();
function WLL(s){return Math.max(SALT_Y+.4,E.POOL_Y-.00055*s-.0035*Math.max(0,s-9000));}
// bucket the lower river's segments (40 m cells) so a query asks only the few nearby
const RIVL_B=(function(){const C=40,B=new Map();const P=RIVL.pts;for(let k=0;k<P.length-1;k++){const a=P[k],b=P[k+1],r=RIVL.bank+60;
  for(let i=Math.floor((Math.min(a[0],b[0])-r)/C);i<=Math.floor((Math.max(a[0],b[0])+r)/C);i++)for(let j=Math.floor((Math.min(a[1],b[1])-r)/C);j<=Math.floor((Math.max(a[1],b[1])+r)/C);j++){const kk=i*65536+j;if(!B.has(kk))B.set(kk,[]);B.get(kk).push(k);}}
 return{C,B};})();
// nearest point on the lower river: {d, s, x, z} (d horizontal distance to the centreline; null when far)
function rivLNear(x,z){const L=RIVL_B.B.get(Math.floor(x/RIVL_B.C)*65536+Math.floor(z/RIVL_B.C));if(!L)return null;const P=RIVL.pts;
 let bd=1e9,bs=0,bx=0,bz=0;for(const k of L){const a=P[k],b=P[k+1],ex=b[0]-a[0],ez=b[1]-a[1],l2=ex*ex+ez*ez,t=l2>0?clamp(((x-a[0])*ex+(z-a[1])*ez)/l2,0,1):0,px=a[0]+ex*t,pz=a[1]+ez*t,d=Math.hypot(x-px,z-pz);
  if(d<bd){bd=d;bs=a[2]+(b[2]-a[2])*t;bx=px;bz=pz;}}return{d:bd,s:bs,x:bx,z:bz};}

// ---------------------------------------------------------------- the ground without the trail
function groundH0(x,z){
 const L=lipX(z);let h;
 if(x<=L)h=upperH(x,z);
 else h=escH(x,z,floorH(x,z));
 // the upper river's channel (in the canyon, to the lip)
 if(x<=L+2){const dU=Math.abs(z-rivUZ(x));if(dU<RIVU.bank)h=Math.min(h,mix(WLU(x)-RIVU.bed,h,smooth(RIVU.hw,RIVU.bank,dU)));}
 // the gorge: a slot with near-vertical walls, its bed stepping down the cataracts
 if(x>GORGE.x0&&x<GORGE.x1+30){const dz=Math.abs(z-gorgeZ(x)),hw=gorgeHW(x);
  if(dz<hw+9){const k=smooth(GORGE.x0,GORGE.x0+20,x);h=Math.min(h,mix(h,mix(gorgeBed(x),h,smooth(hw-5,hw+8,dz)),k));}}
 // the plunge pool
 const dp=Math.hypot(x-POOL.x,z-POOL.z);if(dp<POOL.r+24)h=Math.min(h,mix(POOL.y-POOL.depth,h,smooth(POOL.r*.55,POOL.r+22,dp)));
 // the lower river's channel
 if(x>POOL.x-10){const n=rivLNear(x,z);if(n&&n.d<RIVL.bank)h=Math.min(h,mix(WLL(n.s)-RIVL.bed,h,smooth(RIVL.hw,RIVL.bank,n.d)));}
 return h;}

// ---------------------------------------------------------------- the switchback
// N legs zigzag down the spur between z = zN (the gorge side) and z = zS, joined by small hairpin arcs. The height
// falls linearly with distance walked; each hairpin sits where the slope's own height is the trail's height there
// (found by bisection on the ground), so the legs are cut in at one end and built out at the other by a few metres.
const TRAIL={legs:26,zN:-138,zS:116,r:7,half:2.2,bank:8.5,top:null,bot:null,pts:null,len:0,grade:0,hairpins:[],rest:[]};
TRAIL.top=[E.LIP_X-8,-58];TRAIL.bot=[14,-36];
(function(){
 const yTop=canFloorH(TRAIL.top[0],TRAIL.top[1])+.15,yBot=floorH(TRAIL.bot[0],TRAIL.bot[1])+.15;
 // x where the ground at row z is at height y (the escarpment is monotone down-slope along a row)
 const xAt=(y,z)=>{let lo=lipX(z)+2,hi=lipX(z)+escW(z)+40;for(let k=0;k<44;k++){const m=(lo+hi)/2;if(groundH0(m,z)>y)lo=m;else hi=m;}return(lo+hi)/2;};
 const N=TRAIL.legs;let hy=[];for(let k=1;k<N;k++)hy.push(yTop+(yBot-yTop)*k/N);
 let pts=null,len=0;
 for(let it=0;it<8;it++){
  const H=[];for(let k=1;k<N;k++){const z=k%2?TRAIL.zS:TRAIL.zN;H.push({k,z,x:xAt(hy[k-1],z),side:k%2?'S':'N'});}
  // the polyline: the top, each hairpin as a semicircle bulging outward, the bottom
  const P=[[TRAIL.top[0],TRAIL.top[1]]],r=TRAIL.r;
  for(const h of H){const out=h.side==='S'?1:-1;
   for(let j=0;j<=10;j++){const a=Math.PI*j/10;P.push([h.x-r*Math.cos(a),h.z+out*r*Math.sin(a)]);}}
  P.push([TRAIL.bot[0],TRAIL.bot[1]]);
  let s=0;const S=[0];for(let i=1;i<P.length;i++){s+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);S.push(s);}
  // the hairpins' heights from the arc length at their apex
  const nh=H.map((h,i)=>{const iApex=1+i*11+5;return yTop+(yBot-yTop)*S[iApex]/s;});
  let moved=0;for(let i=0;i<nh.length;i++){moved=Math.max(moved,Math.abs(nh[i]-hy[i]));}
  hy=nh;pts=P.map((p,i)=>[p[0],p[1],yTop+(yBot-yTop)*S[i]/s,S[i]]);len=s;TRAIL.hairpins=H.map((h,i)=>({id:'hairpin-'+h.k,k:h.k,x:h.x,z:h.z,side:h.side,y:hy[i]}));
  if(moved<.05)break;}
 TRAIL.pts=pts;TRAIL.len=len;TRAIL.yTop=yTop;TRAIL.yBot=yBot;TRAIL.grade=(yTop-yBot)/len;
 // the rest stops: at the hairpins nearest the 0.2, 0.4, 0.6 and 0.8 km marks of the DESCENT (metres below the top).
 // On the gorge side (N) the stop is built out on the cliff over the falls; on the S side it is cut into the rock.
 // They alternate: cliff, carved, cliff, carved.
 [.2,.4,.6,.8].forEach((km,i)=>{const y=yTop-km*1000,side=i%2?'S':'N';let b=null;for(const h of TRAIL.hairpins)if(h.side===side&&(!b||Math.abs(h.y-y)<Math.abs(b.y-y)))b=h;
  const out=b.side==='S'?1:-1;
  TRAIL.rest.push({id:'rest-'+Math.round(km*1000),km,mark:Math.round(km*1000),hairpin:b.id,side:b.side,variant:b.side==='N'?1:0,
   x:b.x,z:b.z+out*(TRAIL.r+12),y:b.y,yaw:Math.PI});});   // vern_rest_stop: its +z toward the trail on the gate side, so +z faces north on both sides
 // a bucket grid of segments (8 m cells)
 const C=8,B=new Map();for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1],r=TRAIL.bank+1;
  for(let i=Math.floor((Math.min(a[0],b[0])-r)/C);i<=Math.floor((Math.max(a[0],b[0])+r)/C);i++)for(let j=Math.floor((Math.min(a[1],b[1])-r)/C);j<=Math.floor((Math.max(a[1],b[1])+r)/C);j++){const kk=i*65536+j;if(!B.has(kk))B.set(kk,[]);B.get(kk).push(k);}}
 TRAIL.C=C;TRAIL.B=B;})();
// nearest point on the trail: {d, y, s} (null when no segment is near)
function trailNear(x,z){const L=TRAIL.B.get(Math.floor(x/TRAIL.C)*65536+Math.floor(z/TRAIL.C));if(!L)return null;const P=TRAIL.pts;
 let bd=1e9,by=0,bs=0;for(const k of L){const a=P[k],b=P[k+1],ex=b[0]-a[0],ez=b[1]-a[1],l2=ex*ex+ez*ez,t=l2>0?clamp(((x-a[0])*ex+(z-a[1])*ez)/l2,0,1):0,d=Math.hypot(x-a[0]-ex*t,z-a[1]-ez*t);
  if(d<bd){bd=d;by=a[2]+(b[2]-a[2])*t;bs=a[3]+(b[3]-a[3])*t;}}return{d:bd,y:by,s:bs};}
// the trail at distance s from the top: [x, z, y, heading (radians from +x toward +z)]
function trailAt(s){const P=TRAIL.pts;s=clamp(s,0,TRAIL.len);let lo=0,hi=P.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(P[m][3]<=s)lo=m;else hi=m;}
 const a=P[lo],b=P[hi],t=(s-a[3])/Math.max(1e-6,b[3]-a[3]);return[mix(a[0],b[0],t),mix(a[1],b[1],t),mix(a[2],b[2],t),Math.atan2(b[1]-a[1],b[0]-a[0])];}

// ---------------------------------------------------------------- the canyon ramps
// Two diagonal paths cut down the canyon's walls west of the city (north and south), from the plateau to the canyon
// floor at a riding grade: how the plateau's nomad bands come down to the highway (the canyon walls are too steep).
const RAMPS=[['north',-3640,-3080,-1],['south',-3380,-2860,1]].map(([id,xa,xb,sg])=>{
 const za=canZ(xa)+sg*(canHW(xa)+CAN_WALL+8),zb=canZ(xb)+sg*(canHW(xb)-10),ya=plateauH(xa,za),yb=canFloorH(xb,zb),pts=[];
 for(let k=0;k<=40;k++){const t=k/40,x=mix(xa,xb,t),z=mix(za,zb,t);pts.push([x,z,mix(ya,yb,t)]);}
 let s=0;pts[0].push(0);for(let k=1;k<pts.length;k++){s+=Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]);pts[k].push(s);}
 return{id,pts,len:s,half:2.4,bank:7,grade:(ya-yb)/s};});
function rampNear(x,z){let best=null;for(const Rp of RAMPS){const P=Rp.pts;if(x<P[0][0]-20||x>P[P.length-1][0]+20)continue;
 for(let k=0;k<P.length-1;k++){const a=P[k],b=P[k+1],ex=b[0]-a[0],ez=b[1]-a[1],l2=ex*ex+ez*ez,t=clamp(((x-a[0])*ex+(z-a[1])*ez)/l2,0,1),d=Math.hypot(x-a[0]-ex*t,z-a[1]-ez*t);
  if(d<Rp.bank&&(!best||d<best.d))best={d,y:a[2]+(b[2]-a[2])*t,R:Rp};}}return best;}
// ---------------------------------------------------------------- levelled pads
// Flat ground for things that need it on a slope: the rest stops, the trailhead plazas, the funicular's stations.
// [x, z, half-width x, half-depth z, y, blend, yaw]
const PADS=[];
for(const R of TRAIL.rest)PADS.push({id:R.id,x:R.x,z:R.z,hx:11,hz:8,y:R.y,blend:7,yaw:R.yaw});
function padAt(x,z){let best=null;for(const p of PADS){const c=Math.cos(p.yaw||0),s=Math.sin(p.yaw||0),dx=x-p.x,dz=z-p.z,lx=Math.abs(dx*c-dz*s)-p.hx,lz=Math.abs(dx*s+dz*c)-p.hz,d=Math.max(lx,lz,0);
 if(d<p.blend){const k=1-smooth(0,p.blend,d);if(!best||k>best.k)best={k,y:p.y};}}return best;}

// ---------------------------------------------------------------- terrain
// the Ancients' funicular cuts its cuttings and station floors into the ground (70 installs it from the kit's plan)
const CARVE={fn:null,box:null};
function groundH(x,z){
 let h=groundH0(x,z);
 if(CARVE.fn&&x>CARVE.box[0]&&x<CARVE.box[1]&&z>CARVE.box[2]&&z<CARVE.box[3])h=CARVE.fn(x,z,h);
 const pd=padAt(x,z);if(pd)h=mix(h,pd.y,pd.k);
 const n=trailNear(x,z);if(n&&n.d<TRAIL.bank)h=mix(h,n.y,1-smooth(TRAIL.half,TRAIL.bank,n.d));
 if(x<-2700&&x>-3700){const rp=rampNear(x,z);if(rp)h=mix(h,rp.y,1-smooth(rp.R.half,rp.R.bank,rp.d));}
 return h;}
// the local water surface (-1e9 where there is none)
function waterAt(x,z){
 const dp=Math.hypot(x-POOL.x,z-POOL.z);if(dp<POOL.r+10)return POOL.y;
 if(x>GORGE.x0&&x<GORGE.x1&&Math.abs(z-gorgeZ(x))<gorgeHW(x))return WLG(x);
 if(x<=lipX(z)+2&&Math.abs(z-rivUZ(x))<RIVU.bank)return WLU(x);
 if(x>POOL.x-10){const n=rivLNear(x,z);if(n&&n.d<RIVL.bank)return WLL(n.s);}
 if(x>3000&&lakeD(x,z)<60)return SALT_Y;
 return -1e9;}
// what kind of ground (for the fields, the paint, the inspector)
function zoneAt(x,z){const L=lipX(z);if(x<=L){const dz=Math.abs(z-canZ(x));return dz<=canHW(x)?'canyon':dz<=canHW(x)+CAN_WALL?'canyon-wall':'plateau';}
 const u=(x-L)/escW(z,x);if(u<1)return kSpur(z,x)>.5?'spur':'cliff';return x>5000&&lakeD(x,z)<400?'salt':'floor';}

// ---------------------------------------------------------------- the funicular's line
// The Ancients' funicular ran straight down the spur's south side, from its upper station on the canyon floor to the
// lower station on the abyss floor. The kit (kits/ancients, FUNICULAR) plans its piers, spans and breaks from this.
// Its line (z 162) is clear of the trail's corridor (the hairpins and their banks reach z 132, the south rest stops'
// pads 150), so the switchback never has to pass through its cuttings or piers: it climbs beside the ruin.
const FZ=162,FUNI={z:FZ,a:null,b:null};
FUNI.a=[E.LIP_X-46,canFloorH(E.LIP_X-46,FZ)+9,FZ];FUNI.b=[lipX(FZ)+escW(FZ)+60,floorH(lipX(FZ)+escW(FZ)+60,FZ)+4,FZ];

// ---------------------------------------------------------------- the highways
// One highway: in from the west along the canyon floor (south of the river) to the upper trailhead, down the
// switchback, and on from the lower trailhead east along the river's south bank toward the salt lakes.
const HWY_U=(function(){const P=[];for(let x=-6200;x<=TRAIL.top[0]-14;x+=40){const z=canZ(x)+.30*canHW(x)+18*Math.sin(x*.0031);P.push([x,z]);}P.push([TRAIL.top[0]-14,TRAIL.top[1]]);return P;})();
const HWY_L=(function(){const P=[[TRAIL.bot[0]+16,TRAIL.bot[1]]];for(let x=TRAIL.bot[0]+60;x<=8400;x+=40){const n=rivLNear(x,-200);const z0=n?n.z:-200;P.push([x,z0+92+20*Math.sin(x*.0027)]);}return P;})();
// the map edges a traveller arrives by or leaves by (the life layer's ports): one per level, both ends
const PORTS={
 west:{id:'west',name:'The canyon highway, west',x:-6000,z:HWY_U[5][1],level:'upper'},
 plateau_n:{id:'plateau_n',name:'The plateau, north',x:-2300,z:-2600,level:'upper'},
 plateau_s:{id:'plateau_s',name:'The plateau, south',x:-2900,z:2400,level:'upper'},
 east:{id:'east',name:'The river highway, east',x:8200,z:HWY_L[HWY_L.length-1][1],level:'lower'},
 floor_n:{id:'floor_n',name:'The abyss floor, north',x:1800,z:-3200,level:'lower'},
 floor_s:{id:'floor_s',name:'The abyss floor, south',x:2200,z:3000,level:'lower'}};

// ---------------------------------------------------------------- the two cities
// Districts are rings of distance from each trailhead (the brief: warehouses close to the trailhead, then shops and
// workshops, then houses, inns and caravanserais further out). The placement pass (70) reads these.
const CITY={
 upper:{id:'upper',name:'Upper Verge',culture:'iziz',faction:'iziz',head:[TRAIL.top[0]-26,TRAIL.top[1]],
  box:[-2780,TRAIL.top[0]-4,-420,232],rings:[[0,230,'warehouse'],[230,560,'trade'],[560,2000,'dwelling']],
  edge:[-2700,HWY_U[0][1]]},
 lower:{id:'lower',name:'Lower Verge',culture:'yuni',faction:'yuni',head:[TRAIL.bot[0]+30,TRAIL.bot[1]],
  box:[-820,1350,-520,420],rings:[[0,260,'warehouse'],[260,640,'trade'],[640,2000,'dwelling']],
  edge:[1280,0]}};

function polyHas(poly,x,z){let a=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const xi=poly[i][0],zi=poly[i][1],xj=poly[j][0],zj=poly[j][1];
 if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))a=!a;}return a;}

return{E,SEED,clamp,mix,smooth,fbm,vn,plateauH,mesaH,MESAS,canZ,canHW,canFloor,canFloorH,CAN_WALL,rivUZ,RIVU,WLU,upperH,lipX,kSpur,escW,
 floorH,SALT_LAKES,SALT_Y,lakeD,cliffP,spurP,FALLS,POOL,gorgeZ,gorgeHW,WLG,gorgeBed,GORGE,RIVL,WLL,rivLNear,groundH0,TRAIL,trailNear,trailAt,
 PADS,padAt,groundH,CARVE,RAMPS,rampNear,waterAt,zoneAt,FUNI,HWY_U,HWY_L,PORTS,CITY,polyHas};
})();
// the two functions every pass reads (a one-entry cache: the biome asks for the same point many times)
const _vgT={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_vgT.x&&z===_vgT.z)return _vgT.h;const h=VG.groundH(x,z);_vgT.x=x;_vgT.z=z;_vgT.h=h;return h;}
function waterH(x,z){return VG.waterAt(x,z);}
