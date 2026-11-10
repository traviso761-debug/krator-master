// ================================================================= HOST — the ground model: THE STAIR'S HEARTH (station 3)
// PLAN.md sections 1 ("The head: the vent pit"), 4 and 7 (station 3) on scale model 5.1: vent 77's pit crater, ~6.4 km across, sunk 300-350 m
// into the head step's plain. The page's frame: x east, z south, origin at the vent's pixel (5.1 px 892.8,1145.2); DOWN the valley's axis (ENE).
// Every landform is a core/terrain record or a core field:
//   THE PIT      KRELIEF.scarp along a closed, lobate ring (the pit's lip; drop: the floor falls h under the lip's ground): a 130 m wall of
//                stacked flows in benches, buttresses, a few ravines with their talus fans (the procession comes down one), the talus apron
//   THE DISH     outside the lip the ground rises to the plain (3,000-3,050 m; past the map 5.1's own relief: the Godthrone to the SW and S)
//   THE OLDER CRATER  KRELIEF.volcano's crater on the plain to the NE, a tuff ring with a lake in it and the Talovolci's walled fields (refs/06)
//   THE HEAT     KTHERM (core/terrain 47): one point vent on the pit floor, the ground's temperature between it and the winter soil; the warm
//                spring beside it; the hearth trees (biomes/hearths, read in place) placed by it, the snow kept off it (its snow mask)
//   THE STREAM   the spring's stream on the floor (KRELIEF.river: its bed never climbs), running ENE into tube_god_07's mouth
//   THE MOUTHS   tube_god_07 leaving ENE and the West Godstep Rim Cross-Conduit coming in from the SW, both at the floor in the wall's foot
//                (KCAVERN, 87-host-hearths.js: drawn to their first bend)
//   THE FARMS    the Talovolci's walled fields in the older crater, polygons painted on a core/mask raster (KMASK: data, not a canvas's pixels)
//   THE PATH     the procession's way (Godostera's top): over the plain from down-valley, down a ravine's fan to the spring (the nemetos)
// THE ROCK is stacked tibasalt flows (godstep-thin) under red oxidised scoria on the upper wall (35h: godstep-scoria).
const DOWN=[.9611,-.2764],ACROSS=[.2764,.9611];
const dOf=(x,z)=>x*DOWN[0]+z*DOWN[1],aOf=(x,z)=>x*ACROSS[0]+z*ACROSS[1],xzDA=(d,a)=>[d*DOWN[0]+a*ACROSS[0],d*DOWN[1]+a*ACROSS[1]];
const PIT=(function(){const ph=k=>KR.unit(KR.hash(WORLD,3,k,0x9177))*TAU,aW=Math.atan2(-.383,-.924),aD=Math.atan2(DOWN[1],DOWN[0]);
 /* the lip's radius by bearing (lobate, a little long down the axis, as a pit drawn out along its tube) and its height (2,810-2,850 m, highest WNW) */
 const Rr=a=>(3050+90*Math.sin(3*a+ph(1))+55*Math.sin(5*a+ph(2))+25*Math.sin(9*a+ph(3)))*(1+.05*Math.cos(2*(a-aD)));
 const rimY=a=>2830+20*Math.cos(a-aW);
 const N=96,pts=[];for(let k=0;k<=N;k++){const a=aW+k/N*TAU,r=Rr(a);pts.push([Math.cos(a)*r,Math.sin(a)*r]);}
 return{Rr,rimY,floor:2700,H:130,pts,aW,name:'The vent pit (Viropitos): vent 77\'s pit crater, 6 km across, 300 m deep in the head step\'s plain'};})();
const WALL=KRELIEF.scarp({pts:PIT.pts,side:-1,drop:true,h:PIT.H,run:260,power:1.3,benches:{n:2,w:16},buttresses:{sp:520,w:.28,amp:38},
 ravines:{n:5,w:[55,95],head:[60,150],depth:[25,60],fan:{r:170,h:16}},talus:{h:14,reach:110},rim:{lip:3,w:24},warp:{amp:40,scale:1/700},rough:.02,ends:20,seed:KR.hash(WORLD,3,0,0x5CA9)});
// the plain round the pit: 5.1's relief (the Godthrone rising to the S and SW), never under 2,995 m inside the map (the plain as drawn, 3,000-3,050)
const modelAt=(x,z)=>REGION?REGION.y0+REGION.h(x,z):3020;
const plainH=(x,z)=>Math.max(modelAt(x,z),2995)+8*(fb(x*.0004,z*.0004,2,WORLD+30)-.5)-.0018*dOf(x,z)*.3+1.2*(vn(x*.02,z*.02,WORLD+31)-.5);
// THE OLDER CRATER on the plain to the NE: a low tuff ring and its crater (a lake in its floor; refs/06, Corvo, at the kit's scale)
const OLD=(function(){const x=3350,z=-3250;return{x,z,r:430,f:KRELIEF.volcano({c:[x,z],h:42,r:1050,k:1.2,crater:{r:430,d:125},gullies:9,gully:.05,seed:KR.hash(WORLD,4,0,0x01D)%997+1}),
 level:null,name:'The older crater: a tuff ring on the plain beside the pit, its lake and the Talovolci\'s walled fields (refs/06)'};})();
function preH(x,z){const r=Math.hypot(x,z),a=Math.atan2(z,x),Rr=PIT.Rr(a),rY=PIT.rimY(a);let g;
 if(r<Rr)g=PIT.floor+PIT.H+(rY-PIT.floor-PIT.H)*smooth(Rr-700,Rr,r)+3.5*(fb(x*.0011,z*.0011,2,WORLD+32)-.5)-.0018*dOf(x,z)+.8*(vn(x*.03,z*.03,WORLD+33)-.5);
 else g=rY+(plainH(x,z)-rY)*smooth(Rr,Rr+1500,r)+2*(vn(x*.01,z*.01,WORLD+34)-.5)*smooth(Rr,Rr+200,r);
 g=KRELIEF.shape(WALL,x,z,g);
 if(Math.abs(x-OLD.x)<1100&&Math.abs(z-OLD.z)<1100)g+=OLD.f(x,z);
 return g;}
OLD.level=(function(){let lo=1e9;for(let i=-8;i<=8;i++)for(let j=-8;j<=8;j++){const y=preH(OLD.x+i*25,OLD.z+j*25);if(y<lo)lo=y;}return lo+14;})();
// THE HEAT (KTHERM): one point vent on the floor west of the centre, over the winter soil (-4 C: the cold month's ground, a winter night); the
// warm spring beside it. Baked once on a 4 m lattice over the disc; the snow mask (KTHERM.snowMask) where snow may lie
const VENT={id:'vent77-hearth',kind:'point',x:-520,z:280,T:92,reach:270,decay:2.2,name:'The stair\'s hearth: the vent\'s warm ground (fumaroles at 92 C)'};
const SPRING={x:-455,z:250,r:10,name:'The warm spring (the nemetos): iron-red at its eye, a moss lawn round it'};
const THERM=KTHERM.create({soil:-4,vents:[VENT],detail:{amp:1.5,scale:.02,seed:KR.hash(WORLD,5,0,0x7E9)},world:'godstep-hearths'});
const THERM_BOX=[VENT.x-420,VENT.z-420,VENT.x+420,VENT.z+420],THERM_F=THERM.bake({box:THERM_BOX,cell:4}),SNOWOK=THERM.snowMask({box:THERM_BOX,cell:4,t0:-2,soft:1.5});
const inTB=(x,z)=>x>THERM_BOX[0]+2&&x<THERM_BOX[2]-2&&z>THERM_BOX[1]+2&&z<THERM_BOX[3]-2;
const heatAt=(x,z)=>inTB(x,z)?KTHERM.fieldAt(THERM_F,x,z):-4;
const snowOk=(x,z)=>{if(!inTB(x,z))return 1;const M=SNOWOK,u=clamp((x-M.x0)/M.cell,0,M.nx-1.001),v=clamp((z-M.z0)/M.cell,0,M.nz-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*M.nx+i,D=M.data;
 return (D[k]*(1-fu)*(1-fv)+D[k+1]*fu*(1-fv)+D[k+M.nx]*(1-fu)*fv+D[k+M.nx+1]*fu*fv)/255;};
// THE TUBE MOUTHS (PLAN.md section 1, "The head"): two tube mouths in one pit wall, at the floor. dir outward; the mouth's point (wx, wz) where the
// wall's ground stands the tube's height and 12 m more over the floor (a roof over the tube from there on). In front of it the roof has fallen:
// a cut from the floor to the mouth at the tube's floor, steep-sided (mouthCut), so the bore opens into the air at the cut's end
const MOUTHS=[{key:'god07',dir:[DOWN[0],DOWN[1]],w:48,h:28,grade:-.02,bend:.42,name:'the mouth of tube_god_07 (the Godstep and Pluton master tube, leaving ENE down the valley)'},
 {key:'conduit',dir:[-.687,.727],w:26,h:18,grade:.035,bend:-.38,name:'the mouth of the West Godstep Rim Cross-Conduit (from the Ilmenite Pillar Vault on the Godthrone, SW)'}].map(M=>{
 const a=Math.atan2(M.dir[1],M.dir[0]),R0=PIT.Rr(a)-WALL.run-WALL.talus.reach;let s=R0,fy=PIT.floor;
 {const p=[M.dir[0]*(R0-60),M.dir[1]*(R0-60)];fy=preH(p[0],p[1]);}
 for(s=R0-60;s<R0+700;s+=2){const y=preH(M.dir[0]*s,M.dir[1]*s);if(y-fy>M.h+12)break;}
 return Object.assign(M,{s,s0:R0-80,wx:M.dir[0]*s,wz:M.dir[1]*s,floorY:fy-.6});});
function mouthCut(x,z,g){for(const M of MOUTHS){const s=x*M.dir[0]+z*M.dir[1];if(s<M.s0-40||s>M.s+1)continue;const c=Math.abs(-x*M.dir[1]+z*M.dir[0]);if(c>M.w*2)continue;
  const fl=M.floorY+.8+.05*(M.s-s)*0,e=smooth(M.s0-40,M.s0,s),y=fl+Math.max(0,c-M.w*.5)*1.9;g=Math.min(g,mix(g,y,e));}return g;}
const preH2=(x,z)=>mouthCut(x,z,preH(x,z));
// THE STREAM: from the spring across the floor, ENE, into tube_god_07's mouth (the water goes down the tube); its bed never climbs
const STREAM=(function(){const M=MOUTHS[0],a=[SPRING.x+8,SPRING.z],b=[M.wx-M.dir[0]*30,M.wz-M.dir[1]*30];
 const pts=KRELIEF.meander(a,b,{amp:90,wave:520,seed:KR.hash(WORLD,6,0,0x57E)});const R=KRELIEF.river(pts,preH2,{depth:.5,sample:6});
 const L=R.map(p=>[p.x,p.z,p.y]);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;L.forEach(p=>{x0=Math.min(x0,p[0]);z0=Math.min(z0,p[1]);x1=Math.max(x1,p[0]);z1=Math.max(z1,p[1]);});
 return{pts:L,bb:[x0-12,z0-12,x1+12,z1+12],name:'The spring\'s stream (into tube_god_07\'s mouth)'};})();
function streamNear(x,z){const B=STREAM.bb;if(x<B[0]||x>B[2]||z<B[1]||z>B[3])return null;const P=STREAM.pts;let best=null;
 for(let i=0;i+1<P.length;i++){const a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz,t=l2?clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1):0,e=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);
  if(!best||e<best.e)best={e,y:a[2]+(b[2]-a[2])*t,s:i+t};}return best;}
// THE PATH: the procession's way, from the plain down-valley over the lip, down the ravine nearest the ENE, across the floor to the spring
const PATH=(function(){const want=Math.atan2(DOWN[1],DOWN[0])-.35;let V=WALL.ravines[0],bd=9;
 for(const R of WALL.ravines){let d=Math.abs(Math.atan2(R.z,R.x)-want);d=Math.min(d,TAU-d);if(d<bd){bd=d;V=R;}}
 const back=[V.x-V.nx*700,V.z-V.nz*700],top=[V.x-V.nx*40,V.z-V.nz*40],foot=[V.x+V.nx*(WALL.run+120),V.z+V.nz*(WALL.run+120)];
 const pts=[[back[0]+ (back[0]>0?600:-600)*.3,back[1]-500],back,top,[V.x,V.z],[V.x+V.nx*WALL.run*.5,V.z+V.nz*WALL.run*.5],foot,
  [mix(foot[0],SPRING.x,.5)+120,mix(foot[1],SPRING.z,.5)-90],[SPRING.x+40,SPRING.z-25]];
 return{pts,ravine:V,name:'The procession\'s way (Godostera\'s top): down a ravine of the pit\'s wall to the spring'};})();
function pathD(x,z){let best=1e9;const P=PATH.pts;for(let i=0;i<P.length-1;i++){const ax=P[i][0],az=P[i][1],bx=P[i+1][0],bz=P[i+1][1],dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;
 const t=l2?clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1):0,e=Math.hypot(x-ax-dx*t,z-az-dz*t);if(e<best)best=e;}return best;}
// THE FARMS: the Talovolci's walled fields in the older crater, between its lake and its inner wall (refs/06): a jittered lattice of plots, each a
// polygon; painted on a core/mask raster (KMASK.canvas: integer-exact, the same bytes in Godot) that the ground and the walls read
const FARMS=(function(){const c=80,out=[],rIn=OLD.r*.95;
 for(let j=-6;j<=6;j++)for(let i=-6;i<=6;i++){const h=KR.hash(WORLD,i+40,j+40,0xFA4),u=k=>KR.unit(KR.hash(h,k)),cx=OLD.x+i*c,cz=OLD.z+j*c,r=Math.hypot(cx-OLD.x,cz-OLD.z);
  if(r>rIn||u(0)<.18)continue;const P=[[0,0],[1,0],[1,1],[0,1]].map((q,k)=>[cx+(q[0]-.5)*c+(u(1+k)-.5)*c*.22,cz+(q[1]-.5)*c+(u(5+k)-.5)*c*.22]);
  if(P.some(p=>preH2(p[0],p[1])<OLD.level+1.2||Math.hypot(p[0]-OLD.x,p[1]-OLD.z)>OLD.r*1.02))continue;out.push({i,j,P});}
 return out;})();
const FARM_MASK=(function(){const S=1200,N=512,x0=OLD.x-S/2,z0=OLD.z-S/2,px=S/N,cv=KMASK.canvas(N,N),g=cv.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,N,N);g.fillStyle='#fff';
 for(const F of FARMS){g.beginPath();F.P.forEach((p,k)=>{const X=(p[0]-x0)/px,Y=(p[1]-z0)/px;if(k)g.lineTo(X,Y);else g.moveTo(X,Y);});g.closePath();g.fill();}
 const D=cv.data;   /* the raster's own bytes (KMASK: RGBA, row by row) */
 return{N,x0,z0,px,hash:KMASK.hash(cv),at:(x,z)=>{const i=Math.floor((x-x0)/px),j=Math.floor((z-z0)/px);return i<0||j<0||i>=N||j>=N?0:D[(j*N+i)*4]/255;}};})();
function localH(x,z){let y=preH2(x,z);const s=streamNear(x,z);if(s&&s.e<7)y=Math.min(y,s.y-.55+.11*s.e*s.e);
 const w=FARM_MASK.at(x,z);if(w>0)y+=.25*w;   /* the plots stand a little proud: worked soil, stones cleared to the walls */
 return y;}
function baseH(x,z){const g=localH(x,z);return REGION?REGION.blend(g,x,z,5300,9600,REGION.y0):g;}
// THE ROCK: stacked thin flows (the bead partings palagonite) under the oxidised scoria of the upper wall; the beds nearly flat
const STRATA=KSTRATA.create({seed:KR.hash(WORLD,0,3,0x57A7),formations:[{recipe:'godstep-thin',base:2300,top:2775},{recipe:'godstep-scoria',base:2775,top:2900},{recipe:'godstep-thin',base:2900,top:3500}],
 range:[2300,3500],dip:[DOWN[0],DOWN[1],.0018],warp:[0,0],wash:{m:2},regolith:.4,dust:0x2e2a26});
// what the kit asks of a point (45c caches them)
const MODEL={fieldsAt(x,z,sl,hollow,o,y,north){const c=KRELIEF.at(WALL,x,z,0),part=c?c.part:null,r=Math.hypot(x,z),Rr=PIT.Rr(Math.atan2(z,x)),inPit=r<Rr;
  const heat=heatAt(x,z),warm=smooth(6,20,heat),s=streamNear(x,z),se=s?s.e:1e9,sp=Math.hypot(x-SPRING.x,z-SPRING.z),oc=Math.hypot(x-OLD.x,z-OLD.z);
  o.face=smooth(.55,1.0,sl)*(part==='face'||part==='buttress'||part==='ravine'||part==='bench'||sl>.9?1:.5);
  o.talus=clamp((part==='talus'||part==='fan'?.9:0)+smooth(.35,.6,sl)*smooth(1.0,.6,sl)*.6,0,1)*(1-warm);
  /* the scoria: the upper wall's red (the strata carry it on the faces) and the lip's ground, oxidised cinder for ~350 m back from the lip */
  o.scoria=clamp(inPit?0:smooth(Rr+380,Rr+30,r)*(.6+.4*vn(x*.01,z*.01,WORLD+60)),0,1)*smooth(.9,.4,sl);
  o.stream=s?smooth(4.5,1.5,se):0;
  o.lake=oc<OLD.r*1.2?smooth(OLD.level+.4,OLD.level-.2,y):0;
  o.farm=FARM_MASK.at(x,z)*(1-o.lake);
  /* the moss lawn (the nemetos, refs/04): round the warm spring and along its stream, on the floor */
  o.lawn=clamp(Math.max(smooth(170,60,sp),smooth(26,6,se)*.85)*smooth(.35,.15,sl)*(1-smooth(55,75,heat))*(.75+.25*vn(x*.04,z*.04,WORLD+61)),0,1)*(1-o.stream);
  o.warm=warm*(1-o.lawn)*(1-o.stream);o.heat=heat;
  o.skin=0;o.sand=0;o.moss=0;o.cone=0;o.playa=0;
  o.palag=clamp(smooth(.6,.8,fb(x*.009,z*.009,2,WORLD+62))*smooth(.6,.2,sl)*(1-o.scoria)*(1-o.lawn)*(1-o.farm),0,1)*.6;
  o.soil=clamp((.12+.5*hollow)*smooth(.5,.15,sl)*(1-o.scoria*.6)*(1-o.lawn)*(1-warm),0,1)*(1-o.lake);
  o.lichen=clamp(smooth(.55,.25,sl)*smooth(.35,.7,vn(x*.012,z*.012,WORLD+63))*(1-o.lawn)*(1-o.farm)*(1-warm),0,1)*.4;
  /* a winter night: snow on the plain and the lip, patchy on the floor (a warm pit), none on ground over 0 C (KTHERM's snow mask), none on the
     water; the wall's ledges hold it */
  const sn=(inPit?.3+.3*hollow+.2*smooth(.1,.6,north):.42+.25*hollow)*smooth(.85,.35,sl)*smooth(.15,.6,vn(x*.008,z*.008,WORLD+64)+.25);
  o.snow=clamp(sn,0,.7)*snowOk(x,z)*(1-o.lake)*(1-o.stream)*(1-o.lawn*.7)*(1-o.farm*.55);
  o.path=Math.exp(-Math.pow(pathD(x,z)/3,2));o.flow=0;o.age=0;o.step=0;o.part=part||'plain';return o;},
 coreFields(F){/* the snow read through KTHERM's mask at its own 4 m (the field's 20 m cache would smear it over the warm ground's edge) */
  {const s0=F.snow;F.snow=(x,z)=>s0(x,z)*snowOk(x,z);}
  F.wet=(x,z)=>clamp(F.lawn(x,z)*.8+F.stream(x,z)+F.lake(x,z)+F.snow(x,z)*.2,0,1);F.cold=(x,z)=>clamp(1-F.warm(x,z),0,1);
  F.rock=(x,z)=>Math.max(F.face(x,z),smooth(.6,1.2,F.slope(x,z)));},
 farColor(x,z,h,sl,c,K){return c;},
 after(){}};
