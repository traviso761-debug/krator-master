// ================================================================= HOST — stage: the Slabfields' station 2, the Leaner (PLAN.md sections 3.6, 5, 6 and 13; 2026-11-17)
// Station 1's stage (src/45-host-stage.js) with the Leaner's land: the renderer, the light, the land from its site record (40l: SLAB_SITES.leaner),
// the apron's blocks as KSTACKS records, the climate fields and the biome core's binding.
//   leaner  THE LEANER (station 2): the slab's NNW cliff across the page's south-east (KRELIEF.slab: spurs, gullies, scree cones, a fresh scar), its ramp
//           falling 6.7 degrees SSE behind the rim with open tension cracks behind the lip and ponds in its flow-top hollows, each drifted off its old
//           basin toward the SSE (the bradyseism: PLAN.md 3.6); an older, thinner apron in front of the cliff, running over the patera's rim and
//           spilling into the pit as a fan; the patera (KRELIEF.stepcut: a sheer wall and a bench) with its shelf, the old strandlines the drifting
//           lake left on it (tilted: higher toward the ENE), the warm springs on the shelf (the live ones low by the water, the dead higher), and the
//           warm lake; the corridor road along the apron's toe, down the spill and along the shelf
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}
const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'foot',SITE=SLAB_SITES[SKEY];
const STATION_REGION=SITE.name+' (the Slabfields, station '+SITE.station+'; ideal type)';
const WORLD=KRAND.hash(1601,1392,517);   /* the page's world seed: the station's 5.1 px and the edit that made it */

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT: 1.23 atm, semi-arid (235 mm): a softer sky than the Anvil's bench; the lake's breath the only haze
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd8dcdc);scene.fog=new THREE.FogExp2(HAZE.getHex(),.0001);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,30000);
scene.add(new THREE.HemisphereLight(0xcad8ec,0xa49c90,.74));
const sun=new THREE.DirectionalLight(0xffffff,1.3);sun.position.set(-900,1300,-700);scene.add(sun);
const fill=new THREE.DirectionalLight(0xe0e4f0,.18);fill.position.set(700,300,900);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:2600};
const SNOW_LINE=SITE.snow;
const n2=(x,z,f,seed)=>fbm(x*f,z*f,seed,2)-.5;
// the slab's frame (40l): s along the strike (ENE), v across it toward the ramp (SSE)
const SV={toS:(x,z)=>.8660254*x-.5*z,toV:(x,z)=>.5*x+.8660254*z,xz:(s,v)=>[.8660254*s+.5*v,-.5*s+.8660254*v]};
const L=(function(){const S=SITE,SL=S.slab,AP=S.apron,PT=S.patera,TL=S.tilt;
 if(SKEY!=='leaner')throw new Error('no station '+SKEY+' on this stage (stations/leaner)');
 const toS=SV.toS,toV=SV.toV,xz=SV.xz;
 // THE PLAIN: the corridor's south end, 2,110 m, rising 3 m a km toward the slab
 const plain=(x,z)=>S.base+.003*toV(x,z)+5*n2(x,z,.0011,61)+1.5*n2(x,z,.009,62);
 // THE CLIFF (KRELIEF.slab, core/terrain 38d; station 1's settings, a smaller slab): the rim on its lobate front, the ramp SSE behind it
 const rimV=s=>SL.rimV+SL.bow*Math.pow(s/SL.half,2);
 const pts=[];for(let s=-16000;s<=16000;s+=1000)pts.push(xz(s,rimV(s)));
 const W=KRELIEF.slab({pts,side:1,h:SL.h,run:SL.run,dip:SL.dip,seed:KRAND.hash(WORLD,1,51),
  spurs:{sp:420,spread:[.4,1.9],w:[.7,.97],out:[15,120],run:[.65,1.6],power:[1,1.9],dh:[-.08,.03],tip:[.02,.12]},gullies:{back:[15,90]},
  cones:{h:[30,90],reach:[110,240]},skirt:{h:SL.talus.h/SL.h,reach:SL.talus.reach/SL.run},
  scars:[{s:AP.s0+16000,w:700,back:110,run:.6}]});
 const footV=s=>rimV(s)-SL.run;
 // THE PATERA: KRELIEF.stepcut (core/terrain 38c): the sheer wall and a bench down to the shelf; radius and angle from its centre
 const PC=xz(PT.c[0],PT.c[1]),P=KRELIEF.stepcut({disc:{c:PC,r:PT.r},floor:PT.shelf,steps:PT.wall.steps,tread:PT.wall.tread,riser:PT.wall.riser,rim:1.5,
  warp:{amp:PT.wall.warp,scale:1/380},seed:KRAND.hash(WORLD,2,52)});
 const pr=(x,z)=>Math.hypot(x-PC[0],z-PC[1]);
 const rimAtS=s=>{const ds=s-PT.c[0];return Math.abs(ds)<PT.r?PT.c[1]+Math.sqrt(PT.r*PT.r-ds*ds):null;};   /* the rim's v at s (the plan circle) */
 // the lake's shore, a little ragged; the strandlines (40l: tilt.strands), tilted: higher toward the ENE
 const shoreR=(x,z)=>PT.shore+18*n2(x,z,.006,63)+8*n2(x,z,.03,64);
 const strandH=(k,s)=>TL.strands[k][0]+TL.strands[k][1]*s/1000;
 // the shelf: rising 0.95 m a hundred metres from the shore to the bench's foot; under the water a beach and then the lake's bowl
 function shelf(x,z){const r=pr(x,z),rs=shoreR(x,z);
  if(r>=rs)return PT.level+.0095*(r-rs)+.4*n2(x,z,.02,65);
  const d=rs-r;return PT.level-Math.min(PT.level-PT.floor,.6+d*.035+d*d*.00002);}
 // the strandlines: a beach berm at each old level (a ridge 0.4 m high and a few metres wide where the shelf crosses that height)
 function berms(x,z,y0){if(y0<PT.level-.2||y0>PT.level+7)return 0;const s=toS(x,z);let b=0;
  for(let k=0;k<TL.strands.length;k++){const h=PT.level+strandH(k,s);b+=(.35+.15*k)*Math.exp(-Math.pow((y0-h)/.22,2));}return b;}
 // THE APRON: t 0 at the cliff's foot to 1 at the patera's rim along its axis, u across (-1..1 its flanks)
 const run0=footV(AP.s0)-rimAtS(AP.s0);
 const hwAt=t=>lerp(AP.half[0],AP.half[1],clamp(t,0,1));
 function apronQ(x,z){const s=toS(x,z),v=toV(x,z),t=(footV(s)-v)/run0,u=(s-AP.s0)/hwAt(t);return{t,u,s,v};}
 function apronT(x,z){const q=apronQ(x,z);if(q.t<-.06||Math.abs(q.u)>1.03||q.t>1.25)return 0;const t=clamp(q.t,0,1),au=Math.abs(q.u);
  const edge=smooth(1.03,.93,au)*smooth(-.06,.04,q.t);if(edge<=0)return 0;
  let T=AP.foot*(1-.5*t);
  T+=AP.levee*Math.exp(-Math.pow((au-.86)/.07,2))*(1-smooth(.7,.95,t));
  const hum=fbm(x*.008,z*.008,71,3)-.45;T+=AP.hummock*Math.max(-.3,hum)*2*(.35+.65*t);
  T+=3*Math.sin(q.u*30)*(1-smooth(.2,.5,t))*smooth(.02,.12,t);
  T+=2*n2(x,z,.03,73);return Math.max(0,T*edge);}
 // THE SPILL: where the apron ran over the rim it fell into the pit as a fan, grading down at 1:9 to the shelf (the road's way down)
 const SP=AP.spill;
 function spill(x,z){const s=toS(x,z),du=(s-AP.s0)/SP.w;if(Math.abs(du)>1.1)return -1e9;const rr0=PT.r-pr(x,z);if(rr0<-20)return -1e9;
  return PT.shelf+90+AP.foot*.45-Math.max(0,rr0)*SP.grade-34*du*du+4*n2(x,z,.012,74);}
 // THE TENSION CRACKS behind the lip: open fissures along the strike (KRAND per crack), each tapering to nothing at its ends
 const CR=S.cracks,CRACKS=[];for(let i=0;i<CR.n;i++){const h=k=>KRAND.hash(WORLD,30,i*8+k)/4294967296;
  const s=lerp(-2400,2400,(i+.15+.7*h(0))/CR.n),len=lerp(CR.len[0],CR.len[1],h(1));CRACKS.push({s,len,back:lerp(CR.back[0],CR.back[1],h(2)),w:lerp(CR.w[0],CR.w[1],h(3)),d:lerp(CR.d[0],CR.d[1],h(4)),i});}
 function crackCut(x,z){const s=toS(x,z),v=toV(x,z);let c=0;
  for(const K of CRACKS){const ds=Math.abs(s-K.s);if(ds>K.len/2)continue;const vc=rimV(s)+K.back+6*Math.sin((s-K.s)*.012+K.i),dv=Math.abs(v-vc);
   const taper=1-Math.pow(ds/(K.len/2),2),w=K.w*.5*taper;if(dv>w+2)continue;c=Math.max(c,K.d*taper*smooth(w+1.5,w*.6,dv));}return c;}
 // THE PONDS on the ramp: each a hollow between flow-top pressure ridges, its floor tilted down SSE by the tilt since it formed; the water lies level in
 // the low (SSE) end, the high end a dry floor with the old shore across it, a ridge (a tumulus) holding it on the downhill side
 const PN=S.ponds,PONDS=[];for(let i=0;i<PN.n;i++){const h=k=>KRAND.hash(WORLD,40,i*8+k)/4294967296;
  const s=lerp(-2100,2100,(i+.2+.6*h(0))/PN.n),v=lerp(PN.v[0],PN.v[1],h(1)),r=lerp(PN.r[0],PN.r[1],h(2)),[x,z]=xz(s,v);
  if(Math.hypot(x,z)>TERR.R-r-60)continue;PONDS.push({s,v,x,z,r,i,e:lerp(1,1.5,h(3)),ry:lerp(-.5,.5,h(4))});}
 const rampY=(x,z)=>KRELIEF.shape(W,x,z,plain(x,z));
 PONDS.forEach(p=>{p.floor=rampY(p.x,p.z)-PN.deep-.4;p.level=p.floor+.35;p.old=p.floor+.35+PN.tilt*p.r*.9;});   /* the old level drowned the whole basin */
 const pondQ=(p,x,z)=>{const s=toS(x,z)-p.s,v=toV(x,z)-p.v,c=Math.cos(p.ry),si=Math.sin(p.ry),a=(s*c-v*si)/p.e,b=(s*si+v*c);return{d:Math.hypot(a,b),dv:v};};
 function pondY(x,z,y){for(const p of PONDS){const q=pondQ(p,x,z);if(q.d>p.r+40)continue;const fl=p.floor-PN.tilt*q.dv+.15*n2(x,z,.05,66);
   const dam=Math.max(p.level+1.1,fl+.4)-(q.d-p.r)*.05;   /* the ring of pressure ridges: over the level all round */
   if(q.d<p.r)return mix(fl,Math.max(y,dam),smooth(p.r*.82,p.r,q.d));
   return mix(Math.max(y,dam),y,smooth(p.r,p.r+40,q.d));}return y;}
 function pondW(x,z){for(const p of PONDS){const q=pondQ(p,x,z);if(q.d<p.r*.98&&p.floor-PN.tilt*q.dv<p.level)return p.level;}return -1e9;}
 // THE SPRINGS on the shelf: the live ones low (a metre or two over the level), the dead higher up, each a pool dished into a travertine mound (live) or a
 // dry crater ringed with sulfur (dead)
 const SPR=S.springs,SPRINGS=[];for(let i=0;i<SPR.n+SPR.dead;i++){const h=k=>KRAND.hash(WORLD,50,i*8+k)/4294967296,dead=i>=SPR.n;
  const s=lerp(SPR.s[0],SPR.s[1],(i%SPR.n+.15+.7*h(0))/SPR.n);   /* placed by s (west of the spill), then walked out from the shore to the height it needs */
  const want=dead?lerp(2.2,3.6,h(1)):lerp(.5,1.4,h(1)),ds=s-PT.c[0];
  const rs0=PT.shore,need=rs0+want/.0095,vv=PT.c[1]+Math.sqrt(Math.max(0,need*need-ds*ds)),[x,z]=xz(s,vv);
  if(Math.hypot(x,z)>TERR.R-20)continue;const r=lerp(SPR.r[0],SPR.r[1],h(2));SPRINGS.push({x,z,s,r,dead,i,temp:lerp(SPR.temp[0],SPR.temp[1],h(3))});}
 SPRINGS.forEach(q=>{q.y0=shelf(q.x,q.z);q.level=q.y0+(q.dead?-1e9:.25);});
 function springY(x,z,y){for(const q of SPRINGS){const d=Math.hypot(x-q.x,z-q.z);if(d>q.r*3.2)continue;
   const mound=(q.dead?.5:.9)*smooth(q.r*3.2,q.r*1.1,d),bowl=(q.dead?.7:1.1)*(1-Math.pow(Math.min(1,d/q.r),2));return y+mound-bowl*(d<q.r?1:0);}return y;}
 function springW(x,z){for(const q of SPRINGS){if(q.dead)continue;const d=Math.hypot(x-q.x,z-q.z);if(d<q.r*.95)return q.level;}return -1e9;}
 // THE ROAD: the corridor's track, its bed a smoothed line of the ground it crosses (cut and fill a metre or two), 5 m wide with its shoulders
 const RD=S.road,RL=[];
 for(let i=0;i+1<RD.pts.length;i++){const a=xz(RD.pts[i][0],RD.pts[i][1]),b=xz(RD.pts[i+1][0],RD.pts[i+1][1]),n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/10);
  for(let k=(i?1:0);k<=n;k++){const t=k/n;RL.push([lerp(a[0],b[0],t),lerp(a[1],b[1],t)]);}}
 let ROADY=null;   /* filled once the land without the road is known (below) */
 /* the nearest of the road's points within 64 m (KSPACE: the one spatial index); past that {d: 1e9, i: -1} */
 const RSP=KSPACE.create({cell:32});RL.forEach((p,i)=>RSP.insert(i,p[0],p[1],0));const _rq=[];
 const nearRoad=(x,z)=>{RSP.query(x,z,64,_rq);let best=1e9,bi=-1;for(const i of _rq){const d=Math.hypot(x-RL[i][0],z-RL[i][1]);if(d<best){best=d;bi=i;}}
  /* between two points 10 m apart: the segment's distance */
  if(bi>=0){for(const j of [bi-1,bi+1]){if(j<0||j>=RL.length)continue;const a=RL[bi],c=RL[j],ux=c[0]-a[0],uz=c[1]-a[1],l2=ux*ux+uz*uz,t=clamp(((x-a[0])*ux+(z-a[1])*uz)/l2,0,1),d=Math.hypot(x-a[0]-ux*t,z-a[1]-uz*t);if(d<best)best=d;}}
  return{d:best,i:bi};};
 function land0(x,z){let y=KRELIEF.shape(W,x,z,plain(x,z));
  const v=toV(x,z),s=toS(x,z);
  if(v>rimV(s)-5){y-=crackCut(x,z);y=pondY(x,z,y);}
  y+=apronT(x,z);
  const r=pr(x,z);if(r<PT.r+30){y=KRELIEF.shape(P,x,z,y);
   const a=KRELIEF.at(P,x,z);if(a&&a.part==='floor'){const sh=shelf(x,z);y=sh+berms(x,z,sh);y=springY(x,z,y);}
   y=Math.max(y,spill(x,z));}
  return y;}
 // the road's grade: the ground under it, smoothed over 120 m, then never steeper than 1:9
 ROADY=(function(){const raw=RL.map(p=>land0(p[0],p[1])),n=raw.length,out=new Float64Array(n);
  for(let i=0;i<n;i++){let a=0,w=0;for(let k=-6;k<=6;k++){const j=clamp(i+k,0,n-1),ww=1-Math.abs(k)/7;a+=raw[j]*ww;w+=ww;}out[i]=a/w;}
  for(let pass=0;pass<3;pass++){for(let i=1;i<n;i++)out[i]=clamp(out[i],out[i-1]-1.15,out[i-1]+1.15);for(let i=n-2;i>=0;i--)out[i]=clamp(out[i],out[i+1]-1.15,out[i+1]+1.15);}
  return out;})();
 function land(x,z){let y=land0(x,z);const b=nearRoad(x,z);if(b.i>=0&&b.d<RD.w*2.6){const ry=ROADY[b.i]-.12;y=mix(ry,y,smooth(RD.w*.55,RD.w*2.6,b.d));}return y;}
 function water(x,z){const w=springW(x,z);if(w>-1e8)return w;
  const r=pr(x,z);if(r<shoreR(x,z)+40){const y0=land0(x,z);if(y0<PT.level)return PT.level;}return pondW(x,z);}
 const spine=[[0,0]].concat([[-1400,-600],[1200,600],[400,1700],[-1100,-1500],[-2200,-1750],[-300,-1750],[1600,-600]].map(p=>xz(p[0],p[1])),SPRINGS.filter(q=>!q.dead).map(q=>[q.x,q.z]),PONDS.map(p=>[p.x,p.z]));
 return{land,land0,water,plain,rimV,footV,rimAtS,shelf,shoreR,strandH,apronT,apronQ,spill,crackCut,W,P,PC,pr,CRACKS,PONDS,SPRINGS,RL,ROADY,nearRoad,
  farBase:S.base,spine,toS,toV,xz,lakeLevel:PT.level};})();
// THE BLOCKS: blocks of the slab's basalt on the apron (KSTACKS buttes, as station 1's), from KRAND.hash(world, index, try), kept apart by KSPACE and off
// the road; the big ones on the distal half, and the talus's fresh blocks under the face
const BLOCKS=(function(){const B=SITE.blocks,AP=SITE.apron,out=[],SPC=KSPACE.create({cell:80});
 for(let i=0;i<B.n;i++){const big=i<B.big;
  for(let k=0;k<40;k++){const h=j=>KRAND.hash(WORLD,1000+i,k*16+j)/4294967296;
   const t=big?lerp(.45,.9,h(0)):lerp(.05,.95,h(0)),u=lerp(-.85,.85,h(1)),s=AP.s0+u*lerp(AP.half[0],AP.half[1],t)*.92,v=L.footV(s)-t*(L.footV(AP.s0)-L.rimAtS(AP.s0)),[x,z]=L.xz(s,v);
   const r=big?lerp(B.bigR[0],B.bigR[1],h(2)):lerp(B.r[0],B.r[1],h(2)),H=big?lerp(B.bigH[0],B.bigH[1],h(3)):lerp(B.H[0],B.H[1],h(3));
   if(L.apronT(x,z)<15||Math.hypot(x,z)>TERR.R-r)continue;
   if(L.nearRoad(x,z).d<r+14)continue;
   if(SPC.some(x,z,r+60,o=>Math.hypot(o.x-x,o.z-z)<o.r+r+15))continue;
   let y0=1e9;for(let a=0;a<12;a++){const an=a/12*TAU;y0=Math.min(y0,L.land(x+Math.cos(an)*r,z+Math.sin(an)*r));}
   const ry=h(4)*TAU,e=lerp(1,1.7,h(5)),split=h(6)<.55;
   const tiers=split?[{h:H*.62,r,e,ry},{h:H*.38,r:r*lerp(.55,.85,h(7)),e:e*lerp(.9,1.2,h(8)),ry:ry+lerp(-.4,.4,h(9)),dx:lerp(-.15,.15,h(10))*r,dz:lerp(-.15,.15,h(11))*r}]:[{h:H,r,e,ry}];
   let S=null;try{S=KSTACKS.make({kind:'butte',id:'block'+i,x,z,y0:y0-1.5,seed:KRAND.hash(WORLD,1100+i,7),tiers,bed:[H*.45,H*.75],lobes:.035,weather:0,
    columns:{w:[1.4,2.8],d:.4,ent:.4}});}catch(e){continue;}
   S.beds.forEach((b,k)=>{b.sq=lerp(6,11,KRAND.hash(WORLD,1300+i,k)/4294967296);b.ch*=.3;b.nt*=.3;});
   S.name=big?'A field-sized block of the Leaner\'s basalt ('+Math.round(r*2)+' m across, '+Math.round(H)+' m high)':'A block of the Leaner\'s basalt ('+Math.round(H)+' m)';
   S.big=big;S.r=r;out.push(S);SPC.insert(S,x,z,r);break;}}
 // THE TALUS'S FRESH BLOCKS under the face: the swarm's quakes bring more down than the Anvil's dawn warming (2-4 a 500 m length)
 for(let s=-2500;s<=2500;s+=500){const n=2+Math.floor(KRAND.hash(WORLD,1500,s+3000)/4294967296*3);
  for(let k=0;k<n;k++){const h=j=>KRAND.hash(WORLD,1500+k,(s+3000)*8+j)/4294967296;const bs=s+lerp(-220,220,h(0)),bv=L.footV(bs)-lerp(30,SITE.slab.talus.reach*.75,h(1)),[bx,bz]=L.xz(bs,bv),r=lerp(3,7,h(2)),H=lerp(3,8,h(3));
   if(Math.hypot(bx,bz)>TERR.R-r)continue;
   if(SPC.some(bx,bz,r+20,o=>Math.hypot(o.x-bx,o.z-bz)<o.r+r+4))continue;
   let y0=1e9;for(let a=0;a<8;a++){const an=a/8*TAU;y0=Math.min(y0,L.land(bx+Math.cos(an)*r,bz+Math.sin(an)*r));}
   let S=null;try{S=KSTACKS.make({kind:'butte',id:'talus'+s+'_'+k,x:bx,z:bz,y0:y0-1,seed:KRAND.hash(WORLD,1600+k,s+3000),tiers:[{h:H,r,e:lerp(1,1.5,h(4)),ry:h(5)*TAU}],bed:[H,H],lobes:.03,weather:0});}catch(e){continue;}
   S.beds.forEach(b=>{b.sq=lerp(6,12,h(6));b.ch*=.25;b.nt*=.2;});
   S.name='A block fallen from the face in the last swarm (fresh: no lichen on it)';S.big=false;S.talus=true;S.r=r;out.push(S);SPC.insert(S,bx,bz,r);}}
 return out;})();
function landH(x,z){return L.land(x,z);}
function floor0(x){return L.farBase;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;let h=L.land(x,z);const b=KSTACKS.topAt(BLOCKS,x,z);if(b>h)h=b;_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){return L.water(x,z);}

// ---------------------------------------------------------------- the climate fields (the field contract's units: core/biome/README.md)
//   cold    by height over the station's own snow line (none lies here: the crest is 1.2 km under it)
//   wet     the lake's shore, the springs and the ponds; the blocks' shade; the rest dry (235 mm)
//   rock    the steeps: the cliff, the patera's wall, the talus, the blocks; the apron's rubble half rock
//   canyon  THE SHADE: the north and the lee of a block (the kit reads it as `shade`)
//   rim     THE APRON: the share of the apron's rubble under a point (0 off it)
//   geo     the warm springs (their mounds and the ground round them)
//   flat    the shelf and the plain (the Siphon Pits' cold ground reads it)
function nearBlock(x,z){let best=null,bd=1e9;for(const S of BLOCKS){const d=Math.hypot(x-S.x,z-S.z)-S.r;if(d<bd){bd=d;best=S;}}return{S:best,d:bd};}
function nearSpring(x,z){let bd=1e9,b=null;for(const q of L.SPRINGS){const d=Math.hypot(x-q.x,z-q.z)-q.r;if(d<bd){bd=d;b=q;}}return{q:b,d:bd};}
function fieldsAt(x,z,h,slope){
 const w=waterH(x,z),wd=w>-1e8?0:1;let near=0;
 for(let k=0;k<8&&wd;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*25,z+Math.sin(a)*25)>-1e8){near=Math.max(near,.85);break;}}
 for(let k=0;k<8&&wd&&near<.8;k++){const a=k/8*TAU;if(waterH(x+Math.cos(a)*80,z+Math.sin(a)*80)>-1e8){near=Math.max(near,.45);break;}}
 const nb=nearBlock(x,z),shade=nb.S?smooth(nb.S.r*.9,0,nb.d)*(.55+.45*smooth(-.2,.6,(nb.S.z-z)/(nb.S.r+1))):0;
 const ap=smooth(0,20,L.apronT(x,z)),ns=nearSpring(x,z),geo=ns.q&&!ns.q.dead?smooth(30,0,ns.d):ns.q?.3*smooth(15,0,ns.d):0;
 const rock=clamp(Math.max(smooth(.5,.82,slope),smooth(.35,.6,slope)*.45,ap*.42),0,1);
 const wet=clamp(.12+.65*near+.35*shade+.05*ap-.15*rock+.05*n2(x,z,.002,131),0,1);
 return{wet,flow:0,upland:1,canyon:shade,rim:ap,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:clamp(.5+(h-SITE.snow[0])/1400,0,1),geo,barren:0,fog:0,mist:0,flat:1-smooth(.12,.3,slope)};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','mist','flat'];
const FC=(function(){const N=400,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const Lc={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==Lc.x||z!==Lc.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);Lc.x=x;Lc.z=z;Lc.k=j*N+i;Lc.fu=u-i;Lc.fv=v-j;}
  const k=Lc.k,fu=Lc.fu,fv=Lc.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));
FIELD.shade=FIELD.canyon;FIELD.apron=FIELD.rim;   /* the kit's own names for the two it borrows */
// the ground's warmth: the springs' water (24-31 degC) at their pools, falling to the air's mean by 30 m (KTHERM not taken: KNOWN_ISSUES.md)
let HEAT_AT=(x,z)=>{const ns=nearSpring(x,z);return ns.q&&!ns.q.dead?mix(SITE.temp.mean,ns.q.temp,smooth(30,0,ns.d)):SITE.temp.mean;};

// ---------------------------------------------------------------- the host binding
// nothing roots in the water or on a block's wall; a block's top is ground (lichen grows there); the road is kept bare
function rootMask(x,z){const d=terrainH(x,z)-waterH(x,z);if(d<.15)return 0;if(L.nearRoad(x,z).d<SITE.road.w*.7)return 0;return d<.7?(d-.15)/.55:1;}
const WBOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const OBSTACLES=BLOCKS.map(S=>({x:S.x,z:S.z,r:S.r+1}));
BIO.init({tags:'slabfields',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:5130+SITE.station,origin:L.spine,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:230,mid:560,far:2400,floor:[180,440]},
 windows:{water:WBOX}});
BIO.setSun([-900,1300,-700]);
