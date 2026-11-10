// ================================================================= HOST — the ground model: THE RIME TWIN (station 5)
// The summit as plain functions of (x, z) on the frame: baseH, STRATA, the heat (OASIS: 45a7-host-oasis.js's model on KTHERM, here the
// vent, the tower fumaroles and the cauldrons over the ice cap's frozen ground), RIME (the places the station draws: 87), MODEL.
//   THE CALDERA  map 5.1 pins the SE Twin's crater floor at 5,420 m and its rim at 5,880 m 7 km north-west: at 2 km cells the map's crater is
//                a broad bowl. The station's own: a caldera floor ~3.9 km across, its basalt wall rising 320-490 m (highest on the north-west,
//                to the map's 5,880) in steep columned faces (KSTRATA's tibasalt), the outer flank easing to the map's relief by 4.4 km
//   THE ICE CAP  glacier ice up to 30 m thick over the floor to the wall's foot, melted back round the vent: its margin a ramp of ice
//                (25 degrees) where the steam caves are melted in and the seracs spall
//   THE VENT     an active pit ~150 m across and 55 m deep, steaming; the bare warm ground round it (the vent's KTHERM reach)
//   THE TOWERS   fumaroles across the floor and up past the rim, each an ice tower's vent (KTHERM: a point vent each)
//   TUBE 10      its upper mouth under the south-east wall, a steam cave melted into the glacier's sole
const SITE_Y=REGION?REGION.y0:5420;
const LOCAL=(x,z)=>SITE_Y+(REGION?REGION.smooth(x,z):0);
const RIME=(function(){const K=KRAND,U=(i,s)=>K.unit(K.hash(WORLD,5,i,s));
 const V=[300,-200],th=(x,z)=>Math.atan2(z-V[1],x-V[0]);
 /* the melt's reach round the vent (where the ice stops): ~250 m, lobed */
 const RM=t=>250+40*Math.sin(3*t+1)+25*Math.sin(5*t+.4);
 const R={V,RM,th,pit:{r:72,depth:55},floorY:SITE_Y-26,wall:[1950,2400],iceR:[1750,2050],iceT:30};
 R.rimH=t=>320+170*Math.max(0,Math.cos(t+2.356));   /* the wall's height over the floor by bearing from the caldera's middle: highest north-west */
 // the steam caves: four melted into the ice margin, their mouths toward the vent
 R.caves=[0,1,2,3].map(k=>{const t=-2.2+k*1.55+(U(10+k,1)-.5)*.4,d=RM(t)+28,x=V[0]+Math.cos(t)*d,z=V[1]+Math.sin(t)*d,Rr=9+5*U(10+k,2);
  return{x,z,R:Rr,H:Rr*(.72+.12*U(10+k,3)),face:Math.atan2(V[1]-z,V[0]-x),mouth:.3+.08*U(10+k,4),name:'A steam cave (melted into the ice by the vent\'s breath; warm inside, lit blue through the ice)',reg:{cave:k,kind:'cavern'}};});
 // tube 10's upper mouth under the south-east wall
 {const t=.75,d=2005;R.tube={x:Math.cos(t)*d,z:Math.sin(t)*d,R:18,H:13,face:t+Math.PI,mouth:.36,name:'The upper mouth of tube 10 (tube_xanadu_se_10: the old lava tube melted out under the glacier\'s sole)',reg:{kind:'cavern',tube:'tube_xanadu_se_10'}};}
 // the cauldrons: three at the ice's foot, on the warm ground between the caves
 R.cauldrons=[0,1,2].map(k=>{const t=-1.45+k*1.55+(U(20+k,1)-.5)*.3,d=RM(t)-20,x=V[0]+Math.cos(t)*d,z=V[1]+Math.sin(t)*d;
  return{key:'cauldron'+k,name:'A slush cauldron (meltwater boiling at 86 C in the snow)',x,z,r:5+3*U(20+k,2),T:86,temp:.95,mineral:'sinter',milky:.7,boil:1,apron:4,lip:.45,depth:1.3,reach:30};});
 // the pit's own fumaroles round its floor
 R.pitVents=[0,1,2,3,4].map(k=>{const t=k/5*TAU+U(30+k,1),d=20+30*U(30+k,2);return{x:V[0]+Math.cos(t)*d,z:V[1]+Math.sin(t)*d,T:95,reach:25};});
 // the ice towers: candidates by index (KRAND), kept on the ice of the floor or past the rim, clear of each other, the caves, the tube, the vent
 const iceAtR=(x,z)=>{const r=Math.hypot(x,z),dv=Math.hypot(x-V[0],z-V[1]);return R.iceT*smooth(R.iceR[1],R.iceR[0],r)*smooth(RM(th(x,z)),RM(th(x,z))+70,dv);};
 R.iceAtR=iceAtR;R.towers=[];
 for(let i=0;i<400&&R.towers.length<24;i++){const flank=R.towers.length>=17,a=U(i,40)*TAU,r=flank?2440+160*U(i,41):300+1500*Math.sqrt(U(i,41)),x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(!flank&&iceAtR(x,z)<8)continue;if(Math.hypot(x-V[0],z-V[1])<RM(th(x,z))+90)continue;
  if(R.caves.some(c=>Math.hypot(x-c.x,z-c.z)<c.R+40)||Math.hypot(x-R.tube.x,z-R.tube.z)<R.tube.R+60||R.towers.some(t=>Math.hypot(x-t.x,z-t.z)<45))continue;
  R.towers.push({x,z,h:6+6*U(i,42),r:1.4+1.4*U(i,43),i,flank});}
 // the crevasses: tension cracks round the ice margin, along it; the seracs spalled off its front
 R.crevs=[];for(let i=0;i<40&&R.crevs.length<22;i++){const t=U(i,60)*TAU,d=RM(t)+80+140*U(i,61),x=V[0]+Math.cos(t)*d,z=V[1]+Math.sin(t)*d;
  if(R.caves.some(c=>Math.hypot(x-c.x,z-c.z)<c.R+25)||R.towers.some(q=>Math.hypot(x-q.x,z-q.z)<14))continue;R.crevs.push({x,z,yaw:t+Math.PI/2+(U(i,62)-.5)*.3,len:18+30*U(i,63),w:1.2+2*U(i,64)});}
 R.seracs=[];for(let i=0;i<70;i++){const t=U(i,80)*TAU,d=RM(t)+8+30*U(i,81),x=V[0]+Math.cos(t)*d,z=V[1]+Math.sin(t)*d;
  if(R.caves.some(c=>Math.hypot(x-c.x,z-c.z)<c.R+6))continue;const s=1.5+3.5*U(i,82);R.seracs.push({x,z,s,h:s*(.8+.8*U(i,83)),d:s*(.5+.4*U(i,84)),yaw:U(i,85)*TAU,tilt:[(U(i,86)-.5)*.3,(U(i,87)-.5)*.4]});}
 return R;})();
// THE HEAT (OASIS_MODEL, 45a7: KTHERM over the frozen ground; its springs the cauldrons, its fumaroles the vent's and the towers')
const OASIS=OASIS_MODEL({name:'The Rime Twin',c:RIME.V,soil:-18,air:12,
 springs:RIME.cauldrons,geysers:[],mudpots:[],rills:[],
 fumaroles:[{x:RIME.V[0],z:RIME.V[1],T:95,reach:430}].concat(RIME.pitVents,RIME.towers.map(t=>({x:t.x,z:t.z,T:70,reach:14,h:t.h,r:t.r*.6,name:'An ice tower\'s fumarole (its steam out of the chimney\'s top)'}))),
 box:[-2700,-2700,2700,2700]});
// ---------------------------------------------------------------- the rock and the ice
const STRATA=KSTRATA.create({seed:KR.hash(WORLD,0,5,0x57A7),formations:[{recipe:'tibasalt'}],range:[4600,6200],
 dip:[.6,.4,.004],warp:[5,1.4],wash:{m:2},regolith:.4,dust:0x2c2a28});
function rockH(x,z){const r=Math.hypot(x,z),t=Math.atan2(z,x),W=RIME.wall,rim=RIME.rimH(t);
 const floor=RIME.floorY+4*(fb(x*.002,z*.002,2,WORLD+50)-.5)+1.5*(vn(x*.03,z*.03,WORLD+53)-.5);
 /* the wall: a steep rise, columned faces (the strata's ledge pass benches them), its rim a little serrated */
 const k=smooth(W[0],W[1],r),wall=floor+rim*Math.pow(k,.85)+18*(fb(t*6,r*.004,2,WORLD+54)-.5)*k;
 return r<=W[1]?wall:mix(wall,LOCAL(x,z),smooth(W[1],4400,r));}
function pitAt(x,z,g){const P=RIME.pit,d=Math.hypot(x-RIME.V[0],z-RIME.V[1]);if(d>P.r+30)return g;
 return g-P.depth*smooth(P.r+16,P.r-12,d)+3*smooth(P.r+30,P.r+14,d)*smooth(P.r+2,P.r+14,d);}   /* a low spatter lip round the rim */
function caveFloorAt(x,z,g){for(const C of RIME.caves.concat([RIME.tube])){if(C.floor==null)continue;const dx=x-C.x,dz=z-C.z,d=Math.hypot(dx,dz);
  if(d<C.R*1.05)g=Math.min(g,mix(C.floor,g,smooth(C.R*.8,C.R*1.05,d)));
  /* the entry: a passage melted out from the mouth through the ice to the bare ground (or the cap's thin edge), the cave's floor carried out level */
  const s=dx*Math.cos(C.face)+dz*Math.sin(C.face),q=Math.abs(-dx*Math.sin(C.face)+dz*Math.cos(C.face)),hw=C.R*.55;
  if(s>0&&s<C.R+C.run&&q<hw+6)g=Math.min(g,mix(C.floor+.03*Math.max(0,s-C.R),g,Math.min(1,smooth(hw,hw+6,q)+smooth(C.R+C.run-10,C.R+C.run,s))));}
 return g;}
function iceT(x,z){return RIME.iceAtR(x,z)*(1+.08*(vn(x*.01,z*.01,WORLD+55)-.5));}
RIME.caves.forEach(C=>{C.floor=rockH(C.x,C.z);C.run=45;});
/* tube 10's floor: its mouth's ground (the wall's foot, the cap's thin edge); the cave cut back into the rising wall behind it */
{const T=RIME.tube,mx=T.x+Math.cos(T.face)*T.R,mz=T.z+Math.sin(T.face)*T.R;T.floor=rockH(mx,mz)+iceT(mx,mz);T.run=30;}
function baseH(x,z){let g=rockH(x,z)+iceT(x,z);g=OASIS.relief(x,z,g);g=pitAt(x,z,g);g=caveFloorAt(x,z,g);return REGION?REGION.blend(g,x,z,4400,9500,SITE_Y):g;}
const MODEL={
 warmAt:(x,z)=>OASIS.warmAt(x,z),
 heatAt:(x,z)=>OASIS.heatAt(x,z),
 classAt(x,z,o){const ti=iceT(x,z),ice=smooth(1.5,6,ti),h=OASIS.heatAt(x,z),dv=Math.hypot(x-RIME.V[0],z-RIME.V[1]);
  o.ice=Math.max(o.ice||0,ice*(1-smooth(30,60,h)));
  o.ash=Math.max(o.ash||0,(1-ice)*smooth(-6,4,h)*smooth(RIME.wall[0]-100,RIME.wall[0]-300,Math.hypot(x,z))*.85);
  let su=smooth(RIME.pit.r+20,RIME.pit.r,dv)*.7;for(const f of RIME.pitVents)su=Math.max(su,smooth(9,2,Math.hypot(x-f.x,z-f.z)));o.sulph=Math.max(o.sulph||0,su);return o;},
 maskAt(x,z){if(iceT(x,z)>2||Math.hypot(x-RIME.V[0],z-RIME.V[1])<RIME.pit.r+18||OASIS.wet(x,z))return 0;
  for(const C of RIME.caves.concat([RIME.tube]))if(Math.hypot(x-C.x,z-C.z)<C.R+3)return 0;return 1;},
 pathAt(){return 0;},
 fieldsAt(x,z,sl,hollow,o){const r=Math.hypot(x,z),ice=smooth(1.5,6,iceT(x,z));o.face=smooth(.95,1.5,sl);
  o.talus=smooth(RIME.wall[0]-80,RIME.wall[0],r)*smooth(RIME.wall[0]+120,RIME.wall[0]+20,r)*(1-o.face)*(1-ice);o.obsidian=.06;
  o.scree=clamp((.55+.45*smooth(.2,.6,sl))*(1-o.face)*(1-ice),0,1);
  o.lichen=clamp(.25*smooth(.45,.12,sl)*smooth(.45,.8,vn(x*.01,z*.01,WORLD+61))*(1-ice),0,1);
  o.blocks=clamp((.1*smooth(.45,.8,vn(x*.004,z*.004,WORLD+62))*smooth(RIME.wall[1],RIME.wall[1]+200,r)+.7*o.talus)*(1-o.face)*(1-ice),0,1);o.poly=0;return o;},
 after(){OASIS.after();RIME.V.y=terrainH(RIME.V[0],RIME.V[1]);RIME.towers.forEach(t=>t.y=terrainH(t.x,t.z));
  let mx=-1e9,mxa=0;for(let k=0;k<360;k++){const a=k/360*TAU,r=RIME.wall[1]+20,y=terrainH(Math.cos(a)*r,Math.sin(a)*r);if(y>mx){mx=y;mxa=a;}}RIME.rimTop=mx;RIME.rimAt=mxa;}};
