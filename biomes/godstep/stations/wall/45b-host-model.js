// ================================================================= HOST — the ground model: THE NORTH WALL (station 5)
// PLAN.md sections 1 ("The north wall"), 2, 4 and 7 (station 5) on scale model 5.1: the valley's north side over steps 2-3, Cfa and Csa at
// 2,100-2,600 m, 800-1,100 mm. On the model the wall is a ramp ~22 km long from the plateau the north arm rises from (~2,415 m) down to
// the dry country (~2,155 m); at the kit's scale that ramp is a STAIR OF FLOWS (PLAN.md section 4: "the valley's side as a stack of flows
// under forest"), as station 1 makes front 1's ramp a trap stair, and each floor is checked against the model's own on the same axis
// (98-host-wall.js, heightRows). The page's frame: x east, z south, origin at 5.1 px 939,1069 (Rrivar Cistal's head); DOWN faces the
// valley (SSE), ALONG is the wall's strike (ENE, the valley's axis). Every form is a core record:
//   THE STAIR    KRELIEF.stair: the plateau's ponded floor, the wall's lobate front terraced on its own flows' tops (a bench a flow, each
//                riser a colonnade: Haifoss's banded wall, refs/09), the foot's floor. KRELIEF.stair over KRELIEF.scarp because the wall
//                IS the flows: its benches are the flows' tops (flowTops), the strata take the same tops and the springs come out on them
//   THE STREAMS  the springs of Rrivar Cistal's head at a palagonite parting (a flow's top: the aquitard the snowmelt runs on), a thread
//                at a higher parting, and Guli Blaca off the plateau: each a line run down the wall (KRELIEF.meander), its level never
//                climbing, its bed carved; core/water's records (WATER.flow; its falls WATER.fallsOf where it drops off a riser)
//   THE TERRACES the Talovolci's terraces on the red soil at the wall's foot, painted as polygons on a core/mask canvas (KMASK: data, not a
//                DOM canvas) and read back as the terrace field: each row tilted back against its down-slope wall
//   THE PATH     the Talovolci's way up the wall beside Guli Blaca's falls (cairned: the kit's cairn pass)
const DOWN=[.2764,.9611],ALONG=[.9611,-.2764],ACROSS=ALONG,ST={y1:2402,y2:2170,lip:-300,tilt:.003,slope:24};
const dOf=(x,z)=>x*DOWN[0]+z*DOWN[1],aOf=(x,z)=>x*ALONG[0]+z*ALONG[1],xzDA=(d,a)=>[d*DOWN[0]+a*ALONG[0],d*DOWN[1]+a*ALONG[1]];
const STAIR=KRELIEF.stair({a:xzDA(-6000,0),b:xzDA(6000,0),steps:[{y:ST.y1,at:6000+ST.lip},{y:ST.y2,at:6000+ST.lip+5000}],w:6000,
 lobes:{amp:200,wave:1700},slope:ST.slope,tongues:{per:.25,len:[100,260],w:[50,120]},flows:[16,34],riser:.12,colonnade:.45,wrinkle:.8,seed:KR.hash(WORLD,5,0,0x5747)});
const swell=(x,z)=>-ST.tilt*dOf(x,z)+4*(fb(x*.0004,z*.0004,2,WORLD+530)-.5)+1*(vn(x*.02,z*.02,WORLD+531)-.5);
const preH=(x,z)=>KRELIEF.shape(STAIR,x,z,-1e9)+swell(x,z);
// the front's extent along DOWN at a strike position a: [lip d, toe d]
function frontSpan(a){let lip=null,toe=null;for(let d=ST.lip-700;d<ST.lip+1800;d+=4){const p=xzDA(d,a),c=KRELIEF.at(STAIR,p[0],p[1],-1e9);
  if(c&&c.part!=='top'&&lip==null)lip=d;if(lip!=null&&c&&c.part==='top'&&c.step===1){toe=d;break;}}return[lip==null?ST.lip:lip,toe==null?ST.lip+700:toe];}
// THE STREAMS: [name, start (d, a) or a spring at a parting (a, the parting nearest y), half-width, speed]
const WSTREAMS=(function(){
 /* a spring at the parting nearest y on the front at a: down the front from the lip, the first ground at or under that flow's top */
 const springAt=(a,y)=>{const T=STAIR.flowTops.slice().sort((p,q)=>Math.abs(p-y)-Math.abs(q-y))[0],sp=frontSpan(a);
  for(let d=sp[0];d<sp[1]+40;d+=2){const p=xzDA(d,a);if(preH(p[0],p[1])<=T+.8)return{d:d+6,a,top:T};}return{d:sp[1],a,top:T};};
 const R=[{key:'blaca',name:'Guli Blaca (falling off the wall\'s benches in the wet season)',from:{d:-4790,a:-820},hw:4,speed:1.6,seed:11},
  Object.assign({key:'cistal',name:'The springs of Rrivar Cistal\'s head (their threads down the lower benches)',hw:1.8,speed:1.1,seed:12},{from:springAt(380,2268)}),
  Object.assign({key:'thread',name:'A spring thread off a higher parting',hw:1.3,speed:.9,seed:13},{from:springAt(2350,2330)})];
 R.forEach(S=>{const f=S.from,end=[4790,f.a+(S.key==='blaca'?260:-180)];
  const M=KRELIEF.meander(xzDA(f.d,f.a),xzDA(end[0],end[1]),{amp:S.key==='blaca'?40:22,wave:300,step:4,seed:KR.hash(WORLD,S.seed,0,0x5E1)});
  let y=1e9;S.line=[];for(const p of M){const g=preH(p[0],p[1]);y=Math.min(y,g-.15);S.line.push([p[0],p[1],y]);}
  S.spring=xzDA(f.d,f.a);S.top=f.top==null?null:f.top;});
 return R;})();
// the streams' segments filed in core/space (KSPACE): the carve, the wet and the trees' clearance read only those near a point
const SSP=(function(){const S=KSPACE.create({cell:60});WSTREAMS.forEach((W,wi)=>{const L=W.line;for(let i=0;i<L.length-1;i++){const a=L[i],b=L[i+1];
  S.insert({wi,i,a,b},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2+W.hw+20);}});return S;})(),_sq=[];
// the nearest stream point: {d (m to its line), y (its level there), hw, wi}
function streamNear(x,z){SSP.query(x,z,0,_sq);let best=null;for(const s of _sq){const a=s.a,b=s.b,dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz,t=l2?clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1):0;
  const e=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);if(!best||e<best.d)best={d:e,y:a[2]+(b[2]-a[2])*t,hw:WSTREAMS[s.wi].hw,wi:s.wi};}return best;}
// THE CHANNEL: a bed under each stream's level (deeper for the bigger water), banks easing out over 12 m
function carve(x,z,g){const n=streamNear(x,z);if(!n||n.d>n.hw+14)return g;const dep=.8+.22*n.hw,q=n.d;
 const c=q<=n.hw?n.y-dep*(1-.45*(q/n.hw)*(q/n.hw)):n.y-dep*.55+(q-n.hw)*.42;return Math.min(g,c);}
// THE TERRACES (core/mask): rows along the strike on the foot's floor near the streams, each 34 m deep, painted on a KMASK canvas at 2 m a pixel
const TERRACES=(function(){const rows=[];[[-1300,-930],[-600,-330],[-20,300],[450,760],[1950,2240]].forEach(([a0,a1],bi)=>{
  const t0=Math.max(frontSpan(a0)[1],frontSpan(a1)[1])+50;
  for(let r=0;r<6;r++){const d0=t0+r*34,d1=d0+30,j=(KR.unit(KR.hash(WORLD,bi,r,0x7E2))-.5)*40;rows.push({b:bi,r,d0,d1,a0:a0+j,a1:a1+j*.6});}});
 const P=rows.map(R=>[xzDA(R.d0,R.a0),xzDA(R.d0,R.a1),xzDA(R.d1,R.a1),xzDA(R.d1,R.a0)]);
 let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;P.forEach(q=>q.forEach(p=>{x0=Math.min(x0,p[0]);z0=Math.min(z0,p[1]);x1=Math.max(x1,p[0]);z1=Math.max(z1,p[1]);}));
 x0-=20;z0-=20;const px=2,W=Math.ceil((x1-x0+20)/px),H=Math.ceil((z1-z0+20)/px),cv=KMASK.canvas(W,H),ctx=cv.getContext('2d');
 ctx.fillStyle='#ffffff';P.forEach(q=>{ctx.beginPath();q.forEach((p,i)=>{const u=(p[0]-x0)/px,v=(p[1]-z0)/px;if(i)ctx.lineTo(u,v);else ctx.moveTo(u,v);});ctx.closePath();ctx.fill();});
 /* read back through core/mask's own distance transform (KMASK.distance: 0 inside a painted row), never a canvas's pixels */
 const DT=KMASK.distance(cv,{channel:0,threshold:128});
 const at=(x,z)=>{const i=Math.floor((x-x0)/px),j=Math.floor((z-z0)/px);return i<0||j<0||i>=W||j>=H?0:DT.d2[j*W+i]===0?1:0;};
 /* which row holds a point (its position down the row, 0 at the upper edge): the sawtooth's input */
 const row=(x,z)=>{const d=dOf(x,z),a=aOf(x,z);for(const R of rows)if(d>=R.d0&&d<=R.d1&&a>=Math.min(R.a0,R.a1)&&a<=Math.max(R.a0,R.a1))return{R,u:(d-R.d0)/(R.d1-R.d0)};return null;};
 return{rows,polys:P,at,row,hash:KMASK.hash(cv),name:'The Talovolci\'s terraces on the red soil (worked rows, dry-stone walls)'};})();
// THE PATH: the Talovolci's way up the wall beside Guli Blaca's falls, from the foot's floor to the plateau
const PATH=(function(){const a=WSTREAMS[0].from.a+140,sp=frontSpan(a),pts=[xzDA(4400,a+500),xzDA(sp[1]+700,a+160),xzDA(sp[1]+60,a+40)];
 for(let d=sp[1],k=0;d>sp[0];d-=55,k++)pts.push(xzDA(d,a+(k%2?50:-10)));
 pts.push(xzDA(sp[0]-200,a+30),xzDA(-4400,a-300));return{pts,name:'The Talovolci\'s way up the north wall (cairned beside Guli Blaca\'s falls)'};})();
function pathD(x,z){let best=1e9;const P=PATH.pts;for(let i=0;i<P.length-1;i++){const ax=P[i][0],az=P[i][1],bx=P[i+1][0],bz=P[i+1][1],dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;
 const t=l2?clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1):0,e=Math.hypot(x-ax-dx*t,z-az-dz*t);if(e<best)best=e;}return best;}
// THE GROUND: the stair, the tilt, the terraces' sawtooth, the channels
function localH(x,z){let y=preH(x,z);const r=TERRACES.at(x,z)>0?TERRACES.row(x,z):null;if(r)y+=.8*(1-r.u)-.4;return carve(x,z,y);}
function baseH(x,z){const g=localH(x,z);return REGION?REGION.blend(g,x,z,5300,9600,REGION.y0):g;}
// the views' anchors: the tallest fall on Guli Blaca's line (its biggest drop over 8 m along it) and Rrivar Cistal's spring
const WALLV=(function(){const L=WSTREAMS[0].line;let bi=0,bd=0;for(let i=4;i<L.length-4;i++){const dd=L[i-2][2]-L[i+2][2];if(dd>bd){bd=dd;bi=i;}}
 const s=WSTREAMS[1].spring;return{falls:{x:L[bi][0],z:L[bi][1],y:L[bi][2],i:bi},spring:{x:s[0],z:s[1]}};})();
// THE WATER (core/water, 20 and 22: data): each stream a WATER.flow; its falls where it drops off a riser (WATER.fallsOf's slope breaks)
const WFLOWS=WSTREAMS.map(S=>WATER.flow({name:S.name,pts:S.line,width:S.hw*2,speed:S.speed,rapids:[.03,.15]}));
const WFALLS=[].concat(...WFLOWS.map((F,i)=>WATER.fallsOf(F,{steep:.5,minDrop:5,fit:true}).map(o=>Object.assign(WATER.fall(o),{stream:i}))));
// THE ROCK: the wall's flows as formations (each a ponded flow, its top weathered red: the wall's recipe), the older pile beneath, beds dipping
// with the floors' tilt
const STRATA=(function(){const F=[],T=STAIR.flowTops;let prev=STAIR.flowBase-600;F.push({recipe:'godstep-wall',base:prev,top:STAIR.flowBase});prev=STAIR.flowBase;
 for(const t of T){if(t-prev<1)continue;F.push({recipe:'godstep-wall',base:prev,top:t});prev=t;}
 F.push({recipe:'godstep-wall',base:prev,top:prev+400});
 return KSTRATA.create({seed:KR.hash(WORLD,0,5,0x57A7),formations:F,range:[STAIR.flowBase-600,prev+400],dip:[DOWN[0],DOWN[1],ST.tilt],warp:[0,0],wash:{m:2},regolith:.4,dust:0x3a2a22});})();
// the springs' and streams' wet (0..1): the channels and their banks, a seep round each spring, the terraces (irrigated off the springs)
function springW(x,z){const n=streamNear(x,z);let w=n?Math.exp(-Math.pow(Math.max(0,n.d-n.hw)/26,2)):0;
 for(const S of WSTREAMS){if(S.key==='blaca')continue;const r=Math.hypot(x-S.spring[0],z-S.spring[1]);w=Math.max(w,.9*smooth(70,10,r));}
 return Math.max(w,.72*TERRACES.at(x,z));}
const MODEL={fieldsAt(x,z,sl,hollow,o,y,north){const c=KRELIEF.at(STAIR,x,z,-1e9),part=c?c.part:'top',d=dOf(x,z),onFront=part==='front'||part==='tongue';
  o.face=onFront?smooth(.55,1.0,sl):smooth(.9,1.4,sl);
  const up=baseH(x-DOWN[0]*40,z-DOWN[1]*40),rise=up-y;o.talus=clamp(smooth(10,30,rise)*smooth(.75,.35,sl)*(1-o.face),0,1);
  const sw=springW(x,z),ter=TERRACES.at(x,z),pth=Math.exp(-Math.pow(pathD(x,z)/2.6,2)),n=streamNear(x,z),inWater=n&&n.d<n.hw+1?1:0;
  o.spring=clamp(sw,0,1);o.terrace=ter;o.path=pth;
  /* the forest: the plateau, the benches and the foot under the wall, thinning south into the steps' dry country; never on a face or in the water */
  o.forest=clamp(((1-smooth(500,3300,d))*(.55+.45*smooth(.28,.55,fb(x*.0011,z*.0011,2,WORLD+570)))+.5*sw*smooth(400,900,d))*smooth(.6,.3,sl)*(1-o.face)*(1-ter)*(1-pth)*(1-inWater),0,1);
  /* the litter in patches under the crowns' reach, the wet season's grass between (the red soil shows through both) */
  o.litter=clamp(o.forest*.6*smooth(.35,.6,fb(x*.018,z*.018,2,WORLD+572)),0,1);
  const dry=smooth(2400,4400,d);
  o.grass=clamp(smooth(.6,.25,sl)*(1-o.face)*(1-ter)*(1-pth*.8)*(.5+.4*sw)*(1-dry*.65)*(1-o.litter)*(1-.35*o.forest),0,1);
  o.soil=clamp(dry*(1-o.face)*(1-ter)*(1-sw)*.85,0,1);
  o.redsoil=clamp(Math.max(ter,(1-o.face)*smooth(.75,.3,sl)*(.4+.45*hollow)*(1-dry)),0,1);
  /* the spray's moss on the wet faces and the stream banks; the crusts on the open rock */
  o.moss=clamp(sw*1.3*smooth(.3,.9,sl)+sw*.35*(1-o.forest)*(1-ter),0,1)*(1-inWater);
  o.lichen=clamp(smooth(.55,.25,sl)*(1-o.forest)*(1-o.grass)*.4,0,1);
  o.palag=clamp(smooth(.6,.8,fb(x*.009,z*.009,2,WORLD+561))*smooth(.6,.2,sl)*(1-o.forest)*(1-o.grass)*(1-ter)*.4,0,1);
  o.skin=0;o.sand=0;o.snow=0;o.playa=0;o.cone=0;o.flow=0;o.age=0;o.step=c?c.step:0;o.part=part;return o;},
 /* the far country: the wall's forest on the far benches north of the valley, the dry steppe south of it */
 farColor(x,z,h,sl,c,K){const d=dOf(x,z),f=smooth(1500,-1500,d)*smooth(.8,.3,sl);return K.mixC(c,K.L([38,52,28]),f*.75);},
 coreFields(F){F.wet=(x,z)=>clamp(.45+.55*F.spring(x,z),0,1);F.salt=()=>0;F.upland=()=>1;F.cold=()=>0;},
 after(){}};
