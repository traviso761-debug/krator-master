// ================================================================= HOST — stage (the Ancient's Valley, station 0: THE OVERLOOK)
// [web] Each station's say about its ground (STAGE); 47-host-land.js draws it, the same for every station. It sorts after the metropolis kit's records (40-46d), whose footprints size the plinths.
// WHERE (PLAN.md section 12): the ridge east of city1 (px 457,907 on 5.1: 84 m, 1.58 atm, Af, +24 degC, ~2,980 mm), the shelf's edge
// over a drowned inlet, looking south-west across city1's floor to the lake. No anomaly: the city on a normal day.
// THE PAGE (x east, z south, y up from the model's height at the pixel; R 2,800 m):
//   THE RIDGE         the eye's ground (y 0..50): residential under B, midrises on a lattice, the parks gone feral
//   THE FLOOR         south-west, down to y ~ -30 toward city1 (its centre at the page's south-west corner): the core's towers
//   THE INLETS        north and south of the ridge: the lake's drowned river trenches (y -66 and under), the lake beyond to the south
//   THE VIADUCT       a transit line along the ridge's north flank and out over the inlet on tall piers
//   THE DEAD LOBE     a scar on the ridge's east end: glass and bare ground, nothing grows
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const {mix,smooth}=BIO.fn;   /* TAU, clamp and lerp are the Ancients kit's (10-core.js, read in place for the engines; the same definitions) */
const AVQ=new URLSearchParams(location.search),AVQ_ON=k=>AVQ.get(k)!=='0';
/* the north-west kit's new look (its 45-host-stage.js sets these on its own page; a reader sets none and gets the old look): the backlit
   leaves, the culms' texture, the fungoid caps, the lobes' material; not the season (BIO.bindSeason) nor the root colour (BIO.setGround) */
window.NWLOW_LOOK={backlit:true,culm:true,fung:true,lobes:true};
const STAGE=(function(){const RG=AV_REGION,BASE=RG.site.base,LAKE_Y=RG.lake.y,R=2800,SEED=KRAND.hash(1104,457,907),M=AV.model(RG.grid);
 // the model's ground in page metres (y from BASE), and the page's own relief on it: ridged noise scaled by the model's slope (a steep
 // flank gets crags, the floor stays level), finer where the city stands (built ground), none under the lake's level
 const modelY=(x,z)=>M.at(x,z)-BASE;
 const slopeK=(x,z)=>{const s=(M.at(x+600,z)-M.at(x-600,z))/1200,t=(M.at(x,z+600)-M.at(x,z-600))/1200;return Math.hypot(s,t);};
 /* the model's height and slope on a 32 m lattice under the relief (41, AV.lattice: the model's cells are 2 km, so within 2 cm; its bicubic was most of
    what was left of the build's ground after the 4 m lattices, 2026-11-11); modelY itself stays exact for the far ground */
 const modelL=AV.lattice(modelY,{cell:32,half:R+1600,tol:1e9}).h,slopeL=AV.lattice(slopeK,{cell:32,half:R+1600,tol:1e9}).h;
 function land0(x,z){const m=modelL(x,z),st=slopeL(x,z),r=1-Math.abs(2*KRAND.fbm(x*.0013+3.7,z*.0013-9.1,0,4,SEED+1)-1),f=KRAND.fbm(x*.011+1.3,z*.011+2.2,0,3,SEED+2);
  return m+(14+260*Math.min(.5,st))*(r-.45)*smooth(LAKE_Y-30,LAKE_Y+6,m)+2.2*(f-.5);}
 /* the ground's lattices (41, AV.lattice; 2026-11-10: a build asked the model-and-noise ground 94 million times, the whole ground 16 million): the model's
    ground with its relief on a 4 m lattice under everything, and the whole ground on another that the fields and the kits read (BIO's terrainH, 47);
    the drawn ground, the towers and the roads keep the whole ground itself */
 const landGround=AV.lattice(land0,{cell:4,half:R+1400}).h;
 // THE CRATERS (the owner, 2026-11-04: war damage): fourteen strikes on the dry land, bowls with raised rims, each a scar of melt glass
 const CRATERS=AV.craters({R:R+200,n:24,seed:SEED+13,rMin:35,rMax:150,ok:(x,z,r)=>landGround(x,z)>LAKE_Y+r*.2+4&&Math.hypot(x-300,z+150)>r+260});
 const scorch=(x,z)=>AV.scorch(CRATERS,x,z,SEED);
 function rawGround(x,z){return landGround(x,z)+AV.craterH(CRATERS,x,z);}
 // the fields (41-av-field.js) on the raw ground: the cities and basins from the record, one dead lobe on the ridge's east end, the craters
 const cities=RG.cities.map(c=>({n:c.n,x:c.x,z:c.z,h:c.h,theme:c.theme})),basins=RG.basins.map(b=>({n:b.n,x:b.x,z:b.z,r:b.r,kind:b.kind}));
 const scars=[{x:1500,z:-200,rx:520,rz:330,yaw:.5}].concat(CRATERS.map(c=>({x:c.x,z:c.z,rx:c.r*1.25,rz:c.r*1.25,yaw:0,k:.85})));
 const F=AV.fields({ground:rawGround,base:BASE,lakeY:LAKE_Y,cities,basins,scars,seed:SEED,R});
 // THE VIADUCT: along the ridge's north flank from the east edge, west and out over the north inlet; its deck 16 m over the ridge, level over the water
 /* two transit lines: the north flank's out over the inlet, and (the owner, 2026-11-08: the station's vision has a viaduct line across the view)
    a second from the west, through the core and past the Overlook's line of sight 800 m out, to the south-east */
 const VIA=[[2900,-520],[1400,-560],[300,-700],[-900,-1300],[-2900,-2300]],VIA2=[[-2750,-350],[-1500,500],[-600,1100],[300,2000],[1500,2850]],VIAS=[VIA,VIA2];
 const viaDeckY=(x,z,s)=>Math.max(rawGround(x,z)+16,LAKE_Y+38,-2);
 /* the cargo line at grade (PLAN.md 14): across the page west to east between the lattice's lines, the towers kept off its corridor */
 const CARGO_PTS=[[-2900,-980],[-900,-1120],[1100,-760],[2900,-640]];
 const polyD=(LS,x,z)=>{let d=1e9;for(const L of LS)for(let k=0;k+1<L.length;k++){const a=L[k],b=L[k+1],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1),px=a[0]+dx*t,pz=a[1]+dz*t;d=Math.min(d,Math.hypot(x-px,z-pz));}return d;};
 const railD=(x,z)=>polyD([CARGO_PTS],x,z);
 const viaD=(x,z)=>{let d=1e9;for(const L of VIAS)for(let k=0;k+1<L.length;k++){const a=L[k],b=L[k+1],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1),px=a[0]+dx*t,pz=a[1]+dz*t;d=Math.min(d,Math.hypot(x-px,z-pz));}return d;};
 // THE PLAN: the towers on a lattice turned 17 degrees, the skyscrapers on the floor (the Spindle three in ten, the Ledger, and the designs: the
 // Wedge, the Reed, the Telescope, the Stalk, the Swell, the Organ, the Yoke), the midrises on the shelf (the Ledger three in ten, the Terrace,
 // the Long Curve, the Cupola, the Arcades, the Pods, the Spiral, the Terrarium); nothing in the viaduct's corridor or at the eye's start
 const NEAR={x:300,z:-150,r:420,keys:[]};
 // THE ENGINES (the owner, 2026-11-04: sparingly, for the sense of scale): the Gyre, a 430 m ring on edge, on the floor to the north-west where the
 // Overlook looks past it to city1; the Strider, a four-legged walker halted mid-stride, on the shelf to the south-east. Each on a pad of its own
 const ENGINES=[{key:'gyre',x:-1500,z:-650,yaw:.6},{key:'strider',x:1450,z:1350,yaw:-2.2}].map(e=>Object.assign({},AV.ENGINES[e.key],e,{y:rawGround(e.x,e.z)}));
 const engineD=(x,z)=>{let d=1e9;for(const E of ENGINES)d=Math.min(d,Math.hypot(x-E.x,z-E.z)-E.r);return d;};
 /* the lake's pull, for the plan and the transit: the distance to the nearest water cell (a 120 m sample of the raw ground), 1 at the shore, 0 beyond 2.6 km */
 const LAKE=(function(){const W=KSPACE.create({cell:400}),pts=[];for(let x=-R-1200;x<=R+1200;x+=120)for(let z=-R-1200;z<=R+1200;z+=120){if(rawGround(x,z)<LAKE_Y-1){const q={x,z};pts.push(q);W.insert(q,x,z,1);}}
  const wq=[];const d=(x,z)=>{wq.length=0;W.query(x,z,2800,wq);let m=4000;for(const q of wq)m=Math.min(m,Math.hypot(q.x-x,q.z-z));return m;};return{d,k:(x,z)=>smooth(2600,250,d(x,z)),cells:pts.length};})();
 /* the lake-front property values (the owner, 2026-11-09): the tall families (tips of 180 m and more) win toward the shore, the short ones inland (AV.plan's lakeK, tall, short) */
 /* the residential quarter round NEAR keeps its own mix (the lean put fallen giants across the residential street's view, 2026-11-09): the plan's pull
    reads .45 there, between the short (under .4) and the tall (over .5) swaps, so neither applies */
 const PLAN=AV.plan({R:R+400,pitch:165,theta:17*Math.PI/180,seed:SEED+5,ground:rawGround,lakeY:LAKE_Y,F,lakeK:(x,z)=>Math.hypot(x-NEAR.x,z-NEAR.z)<NEAR.r+200?.45:LAKE.k(x,z),
  tall:['spindle','organ','stalk','reed','swell','yoke','telescope','wedge'],short:['ledger','ledger','pods','terrace','crescent','cupola'],
  coreKeys:['spindle','spindle','spindle','ledger','wedge','reed','telescope','stalk','swell','organ','yoke'],
  shelfKeys:['ledger','ledger','ledger','spindle','terrace','crescent','cupola','arcades','pods','spiral','terrarium'],
  skip:(x,z)=>viaD(x,z)<34||railD(x,z)<30||Math.hypot(x-NEAR.x,z-NEAR.z)<70||engineD(x,z)<90||CRATERS.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+30),
  /* the kerb lines (41, AV.kerbPlace): the roadway's half width plus its pavement, the kit's kinds (an avenue 26 m and 3.5, a road 11 and 3.5); the
     plinth 3 m behind the pavement; the plinth's half extents as the PADS below make them (the footprint and 6 m); the network's disc and lines */
  kerb:{avenue:13+3.5,road:5.5+3.5,gap:3,corner:.35,R:R-110,lineMax:R-140,extent:fam=>{const F=MP.FAMILY[fam]||MP.DESIGNS[fam]||{},fp=F.footprint||{};return fp.r?[fp.r+6,fp.r+6]:[(fp.w==null?60:fp.w)/2+6,(fp.d==null?60:fp.d)/2+6];}}});
 const th=PLAN.theta,ct=Math.cos(th),snt=Math.sin(th);   /* the lattice's turn, used by the transit below and the streets after it */
 // the towers' plinths: each stands on a level pad at its own height (a disc round a round tower, a slab round a slab, turned with it), eased
 // into the ground over 14 m (core/space finds the ones in reach). padD: the distance from a pad's edge in metres (negative inside). The
 // engines take pads too, wide and eased over 60 m
 const PADS=KSPACE.create({cell:300});PLAN.towers.forEach(T=>{const F=MP.FAMILY[T.family]||MP.DESIGNS[T.family]||{},fp=F.footprint||{};
  if(fp.r){T.rx=T.rz=fp.r+6;}else{T.rx=(fp.w==null?60:fp.w)/2+6;T.rz=(fp.d==null?60:fp.d)/2+6;}T.padR=Math.max(T.rx,T.rz);T.c=Math.cos(T.yaw);T.s=Math.sin(T.yaw);T.ease=14;PADS.insert(T,T.x,T.z,T.padR+16);});
 ENGINES.forEach(E=>{E.rx=E.rz=E.padR=E.r+20;E.c=1;E.s=0;E.ease=60;E.family='engine';PADS.insert(E,E.x,E.z,E.padR+64);});
 // THE DEBRIS: slabs thrown from the craters and lying in the streets (41: AV.debris), off the plinths, the viaduct and the water
 const DEBRIS=AV.debris({craters:CRATERS,R:R,n:420,seed:SEED+17,ok:(x,z)=>{if(rawGround(x,z)<LAKE_Y+2||viaD(x,z)<14||railD(x,z)<8||engineD(x,z)<40)return false;const dq=[];PADS.query(x,z,0,dq);for(let i=0;i<dq.length;i++){const T=dq[i],dx=x-T.x,dz=z-T.z,u=dx*T.c+dz*T.s,v=-dx*T.s+dz*T.c;if(Math.abs(u)<T.rx-4&&Math.abs(v)<T.rz-4)return false;}return true;}});
 const padD=(T,x,z)=>{const dx=x-T.x,dz=z-T.z,u=dx*T.c+dz*T.s,v=-dx*T.s+dz*T.c,mn=Math.min(T.rx,T.rz);return Math.hypot(u*mn/T.rx,v*mn/T.rz)-mn;};
 const _q=[];
 /* the relief: the model's ground with every tower's plinth eased in. The roadbed sinking is gone (2026-11-09): the transit kit grades the roads */
 function relief(x,z){let h=rawGround(x,z);_q.length=0;PADS.query(x,z,0,_q);for(let i=0;i<_q.length;i++){const T=_q[i],d=padD(T,x,z);if(d<T.ease)h=mix(T.y,h,smooth(0,T.ease,d));}return h;}
 /* THE TRANSIT (PLAN.md section 14; kits/ancient-transit read in place): the lattice's lines become the kit's road network (an avenue every third
    line, 26 m; the rest roads of 11 m), each a graded alignment pinned flat through its junctions, the junctions read off the kerb lines; the war
    along every street rises toward the lake (a riot inland, bombed at the shore, the military positions and the barricades of wrecks in the
    lakeward half); the second viaduct's line becomes the elevated highway with three ramps landing at avenue crossings; the north viaduct the
    elevated passenger line with two stations; a cargo line at grade crosses the page with a level crossing at every street; a subway runs under
    an avenue with three stations, most of it blocked. The records come before the ground, because the ground takes their carving */
 const AVT={};
 {const p=PLAN.pitch,n=Math.ceil(R/p)+1,defs=[],ix=[{},{}],toXZ=(u,w)=>[u*ct-w*snt,u*snt+w*ct];
  for(let axis=0;axis<2;axis++)for(let k=-n;k<=n;k++){const v=(k+.5)*p;if(Math.abs(v)>R-140)continue;const half=Math.sqrt((R-110)*(R-110)-v*v),av=((k%3)+3)%3===1;
   const a=axis===0?toXZ(v,-half):toXZ(-half,v),b=axis===0?toXZ(v,half):toXZ(half,v);
   defs.push({id:(axis?'w':'u')+(k<0?'m':'')+Math.abs(k),pts:[a,b],kind:av?'avenue':'road',axis,k,av});ix[axis][k]=defs.length-1;}
  AVT.defs=defs;AVT.ix=ix;}
 AVT.lakeD=LAKE.d;AVT.lakeK=LAKE.k;AVT.waterCells=LAKE.cells;   /* the lake's pull (LAKE, above the plan) */
 /* the subway under the avenue nearest the Overlook's line of sight (a w-line avenue through the core), three stations, most of it blocked */
 {let best=null;for(const d of AVT.defs){if(!d.av||d.axis!==1)continue;const v=(d.k+.5)*PLAN.pitch;if(best==null||Math.abs(v-900)<Math.abs((best.k+.5)*PLAN.pitch-900))best=d;}
  const a=best.pts[0],b=best.pts[1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),f=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  AVT.subway=KTRANSIT.subway([f(.06),f(.35),f(.65),f(.94)],{id:'sw',ground:relief,stations:[Math.round(L*.2),Math.round(L*.5),Math.round(L*.78)],stationStates:['ruined','collapsed','ruined'],seed:SEED+71});AVT.subwayLine=best.id;}
 /* the roads (graded on the relief, dipping into the carving), their war */
 let AVT_WARS=null,CRX=null;const crq=[];const AVT_T0=performance.now();
 /* the war's craters on one spatial index (KTRANSIT.craterH walks a street's whole list; the ground is sampled millions of times): the kit's own
    bowl and rim, the deepest bowl and the highest rim winning, on the craters within reach */
 const craterSum=(x,z)=>{if(!CRX)return 0;crq.length=0;CRX.query(x,z,0,crq);let h=0,rim=0;for(const c of crq){const d=Math.hypot(x-c.x,z-c.z);if(d>=c.r*1.6)continue;
  if(d<c.r){const q=d/c.r,t=1-q*q,v=-c.depth*t*t;if(v<h)h=v;}const u=d<c.r?(d-c.r)/(.35*c.r):(d-c.r)/(.6*c.r),w=Math.max(0,1-u*u),b=.16*c.depth*w*w;if(b>rim)rim=b;}return h+rim;};
 const SINKG=AV.sinkGate(AVT.subway);   /* the subway's drops only where one reaches (41, AV.sinkGate) */
 const carve=(x,z)=>(SINKG(x,z)?KTRANSIT.sinkholeH(AVT.subway,x,z):0)+Math.min(0,craterSum(x,z));
 AVT.net=KTRANSIT.network(AVT.defs,{ground:relief,carve});
 AVT.streets=AVT.defs.map((d,i)=>{const Rd=AVT.net.roads[i];return{id:d.id,pts:d.pts,width:Rd.width,pavement:Rd.pavement,ground:Rd.levelAt,av:d.av,axis:d.axis,k:d.k};});
 AVT_WARS=AVT.streets.map((st,i)=>{const Rd=AVT.net.roads[i],lk=s=>{const q=Rd.path.at(s);return AVT.lakeK(q.x,q.z);},hi=Math.max(lk(0),lk(Rd.L*.5),lk(Rd.L));
  return KTRANSIT.war(st,{damage:s=>{const k=lk(s);return clamp(.1+.85*Math.pow(k,1.3),0,1);},military:hi>.55?true:(hi>.3?.5:false),blockades:st.av&&hi>.4?true:undefined,network:AVT.net,road:i,seed:KRAND.hash(SEED,73,i,0)});});
 AVT.wars=AVT_WARS;CRX=KSPACE.create({cell:60});AVT_WARS.forEach(W=>W.craters.forEach(c=>CRX.insert(c,c.x,c.z,c.r*1.6)));AVT.craters=AVT_WARS.reduce((a,W)=>a+W.craters.length,0);
 /* the cargo line at grade: level crossings at every street it meets, a cutting where the ground rises */
 AVT.cargo=KTRANSIT.rail(CARGO_PTS,{id:'cargo',ground:relief,streets:AVT.streets,catenary:true,seed:SEED+75});
 const lineHnear=(x,z)=>{const lx=x*ct+z*snt,lz=-x*snt+z*ct,p=PLAN.pitch,ku=Math.round(lx/p-.5),kw=Math.round(lz/p-.5);let h=0;const iu=AVT.ix[0][ku],iw=AVT.ix[1][kw];
  if(iu!=null)h+=KTRANSIT.lineH(AVT.net.roads[iu],x,z);if(iw!=null)h+=KTRANSIT.lineH(AVT.net.roads[iw],x,z);return h;};
 /* the ground everything stands on: the relief, the subway's holes, the war's craters, the roads' and the cargo line's cuttings */
 function ground(x,z){let h=relief(x,z);if(h<LAKE_Y+1.5)return h;h+=(SINKG(x,z)?KTRANSIT.sinkholeH(AVT.subway,x,z):0)+craterSum(x,z)+lineHnear(x,z)+KTRANSIT.lineH(AVT.cargo,x,z,{form:.45});return LOBQ?lobbyH(x,z,h):h;}
 /* the lobbies' approaches (PLAN.md section 15; 41c AV.lobbies, made below once the streets are graded): the ground takes the plane of each flight
    across its width, blended over 1.5 m at its sides, so the bank between the pavement and the plinth is cut or filled where the steps are */
 let LOBQ=null;const lobq=[];
 function lobbyH(x,z,h){lobq.length=0;LOBQ.query(x,z,0,lobq);for(let i=0;i<lobq.length;i++){const A=lobq[i],dx=x-A.a[0],dz=z-A.a[1],t=(dx*A.ux+dz*A.uz)/A.L,s=Math.abs(-dx*A.uz+dz*A.ux);
  if(t<0||t>1||s>A.w/2+1.5)continue;const y=A.a[2]+(A.b[2]-A.a[2])*t-.03,k=s<=A.w/2?1:1-smooth(A.w/2,A.w/2+1.5,s);h=mix(h,y,k);}return h;}
 /* the highway on the second viaduct's line: three ramps, each landing at an avenue crossing (off, on, off), the ruin by the scar and the lake */
 {const HP=KTRANSIT.path(VIA2,{ground:relief,radius:80}),xs=[];AVT.defs.forEach((d,i)=>{if(!d.av)return;KTRANSIT.intersections(HP,d.pts).forEach(c=>xs.push({s:c.sP,road:i}));});xs.sort((a,b)=>a.s-b.s);
  const pick=f=>{let best=null;for(const c of xs){if(c.s<400||c.s>HP.L-400)continue;if(best==null||Math.abs(c.s-f*HP.L)<Math.abs(best.s-f*HP.L))best=c;}return best;};
  const r1=pick(.25),r2=pick(.5),r3=pick(.75),ramps=[];[[r1,-1,'off'],[r2,1,'on'],[r3,-1,'off']].forEach(([c,side,dir])=>{if(c)ramps.push({s:Math.max(200,c.s-240),side,dir,road:c.road});});
  AVT.highway=KTRANSIT.highway(VIA2,{id:'h1',ground:ground,clearance:9,ramps,ruin:s=>{const q=HP.at(s),k=AVT.lakeK(q.x,q.z),sc=F.scar(q.x,q.z);return sc>.3?{intact:0,cracked:.1,collapsed:.5,gone:.4}:k>.6?{intact:.1,cracked:.3,collapsed:.35,gone:.25}:{intact:.45,cracked:.35,collapsed:.12,gone:.08};},
   overgrowth:s=>{const q=HP.at(s);return 2*F.feral(q.x,q.z)*F.wild(q.x,q.z);},blockades:[Math.round(HP.L*.62)],seed:SEED+77});AVT.rampCrossings=ramps;AVT.highwayPath=HP;}
 /* the elevated passenger line on the north viaduct's line, two stations, overgrown where the land is wild */
 /* the ramps' feet join the grid (the transit session's answer, 2026-11-09, kit 49674696b): each landing road a road of kind `ramp` in the network, a T on the
    avenue it lands on with the kerb corners, cuts, crosswalk and signals, the avenue regraded flat through it in place; a landing road that stops short
    of its avenue by more than 12 m stays a free end (junction.ramp marks the joined ones) */
 if(KTRANSIT.joinRamps)try{AVT.rampJoins=KTRANSIT.joinRamps(AVT.net,AVT.highway);}catch(e){AVT.rampJoinErr=e.message||String(e);}
 {const PP=KTRANSIT.path(VIA,{ground:relief,radius:160});AVT.pax=KTRANSIT.rail(VIA,{id:'pax',ground:ground,elevated:true,stations:[1500,3400],overgrowth:s=>{const q=PP.at(Math.min(s,PP.L));return 2*F.feral(q.x,q.z)*F.wild(q.x,q.z);},seed:SEED+79});}
 AVT.trains=[KTRANSIT.train(AVT.cargo,{id:'freight',s:Math.round(AVT.cargo.L*.42),kind:'freight',state:'derailed',from:2}),KTRANSIT.train(AVT.pax,{id:'pax1',s:2400,kind:'passenger',state:'fallen',from:2}),
  KTRANSIT.train(AVT.subway,{id:'metro1',s:AVT.subway.stations[0].s+30,kind:'passenger',cars:4,state:'standing'}),KTRANSIT.train(AVT.subway,{id:'metro2',s:AVT.subway.stations[1].s-260,kind:'passenger',cars:4,state:'derailed',from:1})];
 AVT.ms=Math.round(performance.now()-AVT_T0);
 /* THE LOBBIES (PLAN.md section 15; 41c): every kerb tower's door, its approach from the pavement (steps, a ramp, or a rubble ramp where the rise
    is too great), open (a climb to what the ruin leaves) or blocked by rubble at the door or on the stair; the records, then the ground takes the
    approaches. The pavement's level is the graded road's plus its kerb */
 const LOB=AV.lobbies({towers:PLAN.towers,family:k=>MP.FAMILY[k]||null,ruin:(Fm,s)=>MP.ruin(Fm,s),seed:SEED+91,near:NEAR,kerbH:.15,lattice:{c:ct,s:snt,pitch:PLAN.pitch},
  ground,fallen:AV.fallenBlocks(PLAN.towers,k=>MP.FAMILY[k]||null,(Fm,s)=>MP.debrisPlan(Fm,s)),
  skin:(Fm,y)=>{const fp=Fm.footprint||{};if(y<.25&&fp.shape==='rect')return{hw:fp.w/2,hd:fp.d/2};if(Fm.envR)return{r:Fm.envR(y)};if(Fm.id==='spindle')return{r:MP.spindleR(y)};return fp.r?{r:fp.r}:{hw:(fp.w==null?60:fp.w)/2,hd:(fp.d==null?60:fp.d)/2};},
  street:(axis,k)=>{const i=AVT.ix[axis][k];if(i==null)return null;const Rd=AVT.net.roads[i];return{levelAt:Rd.levelAt,half:Rd.width/2,pave:Rd.pavement==null?3.5:Rd.pavement};}});
 /* each flight's plane, and the level path on the plinth from its head to the door (unless the plinth is cut deeper than 2.5 m there) */
 LOBQ=KSPACE.create({cell:60});const lobPut=(a,b,w)=>{const L=Math.max(.1,Math.hypot(b[0]-a[0],b[1]-a[1])),q={a,b,w,L,ux:(b[0]-a[0])/L,uz:(b[1]-a[1])/L};LOBQ.insert(q,(a[0]+b[0])/2,(a[1]+b[1])/2,L/2+w/2+2);};
 LOB.doors.forEach(D=>{const A=D.approach;if(A.kind!=='steps'&&A.kind!=='ramp')return;lobPut(A.a,A.b,A.w);if(D.cut!=='ground'&&Math.hypot(D.path.b[0]-D.path.a[0],D.path.b[1]-D.path.a[1])>.3)lobPut(D.path.a,D.path.b,A.w);});   /* a path of no length would level a disc */
 const GRL=AV.lattice(ground,{cell:4,half:R+200}),yOf=GRL.h;
 // the streets: the lattice's lines (asphalt), 9 m wide, where the city is dense enough to have them
 /* THE STREET GRID (the owner, 2026-11-08: a clear Ancient grid, destroyed and overgrown): the lattice's lines are the streets, 11 m wide, and every
    third line an avenue of 26 m; drawn as asphalt with rubble at the kerbs, the forest thinned to a third on them (cracks and saplings), where the
    city is dense enough to have them */
 /* the owner, 2026-11-08: the grid must run BETWEEN the buildings. The towers stand on the lattice's nodes (i p, j p), so the streets run on the
    half lines ((k + 1/2) p), between the plinths; every third half line is an avenue (blocks of three lots). A street is 12 m, an avenue 28 m; the
    roadbed is sunk 0.45 m behind a kerb (ground), lamp standards stand along the avenues (70) */
 const SW=6,AW=14;
 const lineOf=(v,p)=>{const k=Math.round(v/p-.5);return{k,d:Math.abs(v-(k+.5)*p),av:((k%3)+3)%3===1};};
 const streetD=(x,z)=>{const lx=x*ct+z*snt,lz=-x*snt+z*ct,p=PLAN.pitch;return Math.min(lineOf(lx,p).d,lineOf(lz,p).d);};
 const streetK=(x,z)=>{const lx=x*ct+z*snt,lz=-x*snt+z*ct,p=PLAN.pitch,A=lineOf(lx,p),B=lineOf(lz,p),ha=A.av?AW:SW,hb=B.av?AW:SW;
  return Math.max(smooth(ha+1.5,ha-.5,A.d),smooth(hb+1.5,hb-.5,B.d));};
 const street=(x,z)=>streetK(x,z)*smooth(.1,.3,F.density(x,z));
 const avenueLines=()=>{const p=PLAN.pitch,n=Math.ceil((R+400)/p)+2,out=[];for(let k=-n;k<=n;k++)if(((k%3)+3)%3===1)out.push((k+.5)*p);return out;};
 // the kits' masks (zones): the south-west lowlands' forest wherever the ground is dry land and not built or dead, thick in the parks, thin on the
 // core's cracked plazas; the north-west's trees mixed in at a third (PLAN.md section 5: a mix of the two). 0 on a street or a plinth
 const built=(x,z)=>{_q.length=0;PADS.query(x,z,0,_q);let k=0;for(let i=0;i<_q.length;i++){k=Math.max(k,smooth(10,-6,padD(_q[i],x,z)));}return k;};
 /* the overgrowth is the rule, not the exception (PLAN.md section 5: wild overgrowth wherever the ground is not scarred): the forest takes
    every lot between the towers, thinner only where the core's pavement is thickest */
 const forest=(x,z)=>{const y=yOf(x,z);if(y<LAKE_Y+.6)return 0;const zn=F.zone(x,z),pk=F.park(x,z),sc=F.scar(x,z);
  /* the owner, 2026-11-08: half the land scarred and polluted, half overgrown: the wild half takes every lot (the core's plazas too) and more of its
     streets; the foul half keeps a tenth of the forest, a sick scrub (its wet falls under the rainforest zone's threshold: the kits' drier species) */
  const w=F.wild(x,z),open=mix(zn==='floor'?.8+.2*pk:zn==='shelf'?.95+.05*pk:1,1,w);return clamp(open*(1-sc)*(1-.85*scorch(x,z))*(.08+.92*w),0,1)*(1-.65*street(x,z)*(1-.4*w))*(1-built(x,z));};
 return{key:'overlook',name:'The Ancient\'s Valley: the Overlook',title:'Krator biome — the Ancient\'s Valley: the Overlook',
  hint:'The ridge east of city1 over its drowned inlet (84 m, 1.58 atm, Af): the city on a normal day, no anomaly. Fly (W A S D, Q E, Shift), F to walk. R rides with a keeper robot (again for the next, Esc to let go).',
  R,px:[RG.site.px,RG.site.py],base:BASE,lakeY:LAKE_Y,air:{pressure:RG.site.atm,humidity:.82},
  /* the owner, 2026-11-08: dark, unnaturally turbulent, coloured cloudiness and a medium-distance smog, universal near the cities (this whole page is
     city1): the sky's clouds low, heavy and fast, the air turbid and dust-coloured toward the taint's purple, the page's fog thick enough that 2 km is
     half veiled and 4 km gone (it also hides the far tiers), the smog itself the height fog's mist on the floor (89v-host-smog.js) */
  /* core/atmos's smog additions (2026-11-09, session atmos-smog): the cloud's mood (dark, the taint's brown-purple tint, violent turbulence, the
     fires' glow at night, shifting episodes) and the mist's density field: F.density, universal in the cores, thin on the terraces */
  clouds:{cover:.74,cumulus:1.25,cirrus:.3,bank:.7,height:950,scale:1500,drift:.022,dark:.8,tint:[.42,.33,.30],turbulence:.7,turbKind:'violent',glow:.5,glowColour:[1,.55,.2]},
  cloudMood:{period:300,glowColour:[1,.55,.2],
   /* the valley's own palette (the owner, 2026-11-09, again: "still getting the green shader during storms"): core/atmos's MOOD_PALETTE holds a sickly
      green and a jaundice yellow, which tinted the whole cloud deck (cover .74) pale green in a clear spell, and in a storm the air (89v, AV_AIR: the fog
      drawn toward the clouds' colour) carried that green onto the far towers, the mist and the sky light, the storm's dark and its lightning making it
      olive. The valley's clouds keep the taint's hues: brown, dull red, ash grey, ghostly purple */
   palette:[[.42,.33,.30],[.48,.26,.24],[.46,.45,.44],[.52,.44,.66]]},airLook:{turbidity:2.8,dust:[.58,.47,.54]},fogDensity:.00036,
  smog:{colour:[.36,.30,.36],mix:.85,mist:{density:.0011,above:110,depth:110,noise:.85,day:1,field:true},band:{density:.0032,y:[430,690],cover:.6,noise:1}},seed:SEED,model:M,region:RG,
  ground,groundFast:yOf,groundLattice:GRL,rawGround,modelY,F,plan:PLAN,pads:PADS,engines:ENGINES,craters:CRATERS,debris:DEBRIS,scorch,viaduct:{pts:VIAS,deckY:viaDeckY,d:viaD},transit:AVT,lobbies:LOB,relief,railD,near:NEAR,street,streetK,streetD,avenueLines,lattice:{c:ct,s:snt,pitch:PLAN.pitch,AW,SW},built,forest,scars,cities,basins,
  water:{level:LAKE_Y,shallow:0x4f7a74,deep:0x1a3440,name:'The valley lake (17.4 m: brackish, the drowned city under it)'},
  floorLabel:(x,z,y)=>{if(F.scar(x,z)>.5)return 'dead ground: melt glass (the scar)';if(street(x,z)>.5)return 'a street';if(built(x,z)>.5)return 'a tower\'s plinth';if(F.foul(x,z)>.6&&F.park(x,z)<.5)return 'polluted ground (the foul half)';const zn=F.zone(x,z);return zn==='floor'?'the floor: the core\'s plazas':zn==='shelf'?(F.park(x,z)>.5?'a park gone feral':'the shelf: the residential rings'):'the terraces';},
  // what the kits read: the lowlands' fields. Af and 2,980 mm: tropic everywhere, wet at the water and in the hollows, dry on the pavement
  // and the ridge's crest, brackish salt at the shore, upland by the height over the lake; no river on this page
  /* wet high everywhere: the kits' rainforest zone (swlowlands' `rain` needs wet over .86 and tropic over .86) is the valley's overgrowth; drier only on the pavement's edge */
  fields:{wet:(x,z)=>clamp(.8+.12*smooth(12,2,yOf(x,z)-LAKE_Y)+.1*F.park(x,z)-.12*F.density(x,z)*(1-F.park(x,z))+.08*F.wild(x,z)-.12*F.foul(x,z),0,.98),tropic:(x,z)=>.92,dry:(x,z)=>clamp(.1*F.density(x,z)+.5*F.scar(x,z)+.1*smooth(25,50,yOf(x,z))+.35*F.foul(x,z),0,1),
   flow:(x,z)=>0,upland:(x,z)=>clamp((yOf(x,z)-LAKE_Y)/300,0,1),salt:(x,z)=>.35*smooth(6,1,yOf(x,z)-LAKE_Y)},
  zone:(x,z)=>{const f=forest(x,z);return{sw:f,nw:f*.33,city:F.density(x,z)};},
  /* the north-west's species kept: the wet country's tall trees and the bamboo; not the grass tree (its lance cards are drawn apart from its
     trunk, so a grown tree left them floating: the core attach audit) nor the dry foothills' banksia */
  swAllow:null,swKeep:['gum'],nwAllow:['kauri','towerash','skybamboo','treefern','ginkgo','glowwillow','meranti','mistpalm','pandan','paperbark'],swQ:2.3,nwQ:1.35,
  // the ground's layers (materials.json; KGROUND in 47): a pave, b asphalt, c rubble, d glass; e rainfloor, f oak litter, g mud
  layers:['ground.pave','ground.asphalt','ground.rubble','ground.glass','ground.rainfloor','ground.oaklitter','ground.mud'],
  weights:(x,z)=>{const y=yOf(x,z),d=F.density(x,z),sc=F.scar(x,z),pk=F.park(x,z),st=street(x,z),b=built(x,z),wet=smooth(10,1.5,y-LAKE_Y),zn=F.zone(x,z),fo=forest(x,z);
   const sco=scorch(x,z),fl=F.foul(x,z),pave=clamp(Math.max(b,(zn==='floor'?.3:.1)*d*(1-pk)*(1-.8*fo)*smooth(.3,.7,KRAND.fbm(x*.004+5,z*.004,0,2,SEED+8))),0,1)*(1-sc)*(1-st),rub=clamp(Math.max(.45*d*(1-pk)*(1-.6*fo)*smooth(.3,.65,KRAND.fbm(x*.02,z*.02,0,2,SEED+9)),.9*sco,.55*fl*(1-fo)*smooth(.35,.6,KRAND.fbm(x*.011+1,z*.011,0,2,SEED+10)),.5*smooth(.15,.5,st)*(1-smooth(.6,.9,st))),0,1)*(1-sc)*(1-b);
   const soilNW=clamp(.5*pk+.25,0,1)*(1-pave)*(1-sc),soilSW=clamp(.9-.5*pk,0,1)*(1-pave)*(1-sc);
   return[pave,st*(1-sc),rub,sc,soilNW*(1-wet),soilSW*(1-wet),wet*(1-sc)];},
  /* the paint is also the canopy seen from afar (the kits' trees stop at their LOD range): the forest's dark green where the mask is high */
  paint:(x,z)=>{const y=yOf(x,z),d=F.density(x,z),sc=F.scar(x,z),pk=F.park(x,z),wet=smooth(10,1.5,y-LAKE_Y),t=F.taint(x,z),fo=forest(x,z),sco=scorch(x,z);let c=[.30,.33,.22];
   c=c.map((v,i)=>mix(v,[.44,.42,.38][i],.35*d*(1-pk)));c=c.map((v,i)=>mix(v,[.15,.24,.12][i],.75*fo));c=c.map((v,i)=>mix(v,[.11,.10,.09][i],.5*F.foul(x,z)*(1-fo)));c=c.map((v,i)=>mix(v,[.26,.18,.28][i],.3*F.foul(x,z)*t));c=c.map((v,i)=>mix(v,[.17,.20,.26][i],.3*fo*F.wild(x,z)*t));c=c.map((v,i)=>mix(v,[.21,.21,.20][i],.7*street(x,z)));c=c.map((v,i)=>mix(v,[.22,.20,.16][i],wet));c=c.map((v,i)=>mix(v,[.09,.08,.07][i],.85*sco));c=c.map((v,i)=>mix(v,[.13,.12,.14][i],sc));
   c=c.map((v,i)=>mix(v,[.30,.24,.30][i],.35*t*(1-sc)));return c;},
  views:()=>{const Y=(x,z)=>Math.max(ground(x,z),LAKE_Y),V=(c,cy,t,ty)=>[c[0],Y(c[0],c[1])+cy,c[1],t[0],Y(t[0],t[1])+ty,t[1]];
   const c1=cities.find(c=>c.n===1)||{x:-2000,z:2000};
   /* a spot to stand: near (cx, cz), on dry ground, no tower's plinth within `clear`, and the fewest towers filling a 70-degree cone toward
      (tx, tz) out to `ahead` metres (each weighted by its nearness and its width in the view) */
   /* a spot to stand: on the EDGE OF A PLINTH near (cx, cz) (the plaza's rim: paved, nothing grows there, the ground falls away), the pad's own
      tower behind the eye, and the fewest other towers filling a 70-degree cone toward (tx, tz) out to `ahead` metres */
   /* the trees registered so far (the views are made after the build): no eye within 12 m of one */
   const TR=KSPACE.create({cell:120});if(typeof REG!=='undefined')REG.forEach(rc=>{if(rc.kind==='tree')TR.insert(rc,rc.x,rc.z,Math.max(rc.r==null?4:rc.r,4));});const tq=[];
   const openSpot=(cx,cz,r,clear,tx,tz,ahead)=>{let best=null,bs=1e9;const near=[];PADS.query(cx,cz,r,near);const q=[];
    for(const P of near){if(P.family==='engine')continue;for(let k=0;k<24;k++){const a=k/24*TAU,x=P.x+Math.cos(a)*(P.padR-3),z=P.z+Math.sin(a)*(P.padR-3);if(ground(x,z)<LAKE_Y+3||padD(P,x,z)>0)continue;
      tq.length=0;TR.query(x,z,2,tq);if(tq.some(t=>Math.hypot(t.x-x,t.z-z)<12))continue;
      const dx=tx-x,dz=tz-z,l=Math.hypot(dx,dz)||1,fx=dx/l,fz=dz/l;if(((P.x-x)*fx+(P.z-z)*fz)>-P.padR*.5)continue;   /* the pad's tower behind the eye */
      q.length=0;PADS.query(x,z,ahead,q);let ok=true,score=Math.hypot(x-cx,z-cz)/r;
      for(const T of q){if(T===P)continue;const ex=T.x-x,ez=T.z-z,d=Math.hypot(ex,ez);if(padD(T,x,z)<clear){ok=false;break;}if(d>ahead)continue;const c=(ex*fx+ez*fz)/d;if(c<Math.cos(35*Math.PI/180))continue;score+=(T.padR*2/d)*(1-d/ahead)*6;}
      if(!ok)continue;if(score<bs){bs=score;best=[x,z];}}}return best||[cx,cz];};
   const o1=openSpot(140,460,400,18,c1.x*.6,c1.z*.6,420),o2r=openSpot(NEAR.x-60,NEAR.z+170,300,14,NEAR.x-900,NEAR.z+620,120);
   /* the residential street's eye stood on a broken Cupola's plinth rim with the Cupola's rubble heap spilling 6 m in front of it, 60% of the frame
      (2026-11-09): it steps 15 m across the street, to the left of its line of sight, where the first thing ahead is 75 m off */
   const o2=(()=>{const dx=NEAR.x-900-o2r[0],dz=NEAR.z+620-o2r[1],l=Math.hypot(dx,dz)||1;return[o2r[0]+dz/l*15,o2r[1]-dx/l*15];})();
   const V0={
    'The Overlook: city1 and the lake':V(o1,9,[c1.x*.6,c1.z*.6],60),
    'A residential street':V(o2,1.8,[NEAR.x-900,NEAR.z+620],28),
    'Among the towers':V(openSpot(NEAR.x+40,NEAR.z-20,200,10,NEAR.x-500,NEAR.z+300,60),1.8,[NEAR.x-500,NEAR.z+300],90),
    'The viaduct over the inlet':V([-400,-900],22,[-1500,-1700],30),
    /* the eye on the water itself (the forest now takes the shore where it stood): the water cell nearest the old spot */
    'The core from the water':(function(){let best=null,bd=1e9;for(let x=-1400;x<=200;x+=40)for(let z=1700;z<=2800;z+=40){if(Math.hypot(x,z)>R-60||ground(x,z)>LAKE_Y-1.5)continue;const d=Math.hypot(x+600,z-2300);if(d<bd){bd=d;best=[x,z];}}return V(best||[-600,2300],6,[-1800,1500],120);})(),
    'The dead lobe':V([900,-100],9,[1600,-250],4),
    /* the largest crater whose rim spot stands clear of every tower's pad and rubble (a fallen tower's heap reaches 120 m from its foot) */
    'A crater':(function(){const q=[];for(const c of CRATERS.slice().sort((a,b)=>b.r-a.r)){const ex=c.x+c.r*1.9,ez=c.z+c.r*1.4;if(ground(ex,ez)<LAKE_Y+3)continue;q.length=0;PADS.query(ex,ez,140,q);if(q.some(T=>Math.hypot(T.x-ex,T.z-ez)<T.padR+130))continue;return V([ex,ez],5,[c.x,c.z],-c.depth*.5);}const c=CRATERS[0];return V([c.x+c.r*1.9,c.z+c.r*1.4],5,[c.x,c.z],-c.depth*.5);})(),
    'The Gyre':(function(){const E=ENGINES[0];return V([E.x+E.r*1.6,E.z+E.r*1.1],6,[E.x,E.z],E.h*.35);})(),
    'The Strider':(function(){const E=ENGINES[1];return V([E.x-E.r*1.94,E.z-E.r*.98],4,[E.x,E.z],E.h*.4);})(),   /* 1.5, 1.3 stood inside a Pods stump's footprint, 1.26, 1.1 in a palm's fronds once the plan leaned tall toward the lake (the eye check, 2026-11-09) */
    'A park gone feral':(function(){let best=null,bw=0;for(let x=-2400;x<=2400;x+=60)for(let z=-2400;z<=2400;z+=60){const w=F.park(x,z)*(.3+.7*F.wild(x,z))*(ground(x,z)>LAKE_Y+3?1:0)*(1-Math.hypot(x,z)/5000);if(w>bw){bw=w;best=[x,z];}}best=best||[0,0];return V([best[0]+120,best[1]+90],3,best,14);})(),
    'From the air':V([600,-300],520,[c1.x*.5,c1.z*.5],0)};
   /* the views a later host fragment adds (75: the extraplanars' drowned hall), absolute eyes it chose itself */
   return Object.assign(V0,STAGE.extraViews||{});},
  start:'The Overlook: city1 and the lake',
  /* the LOD spine: a lattice over the whole page (the kits drop a species past its mid range from the spine unless it has an impostor; the
     overgrowth is everywhere, so the spine is), plus the eye's start */
  spine:(function(){const S=[[NEAR.x,NEAR.z]];for(let x=-2400;x<=2400;x+=800)for(let z=-2400;z<=2400;z+=800)S.push([x,z]);return S;})(),
  budgetTris:20000000,budgetCalls:1200};})();   /* calls 900 -> 1200 on 2026-11-09 with the transit: the kit's chunked draws and the furniture cells near the eye (the park view 1,085 on the RTX lane) */   /* raised from 9.5 M on 2026-11-09 (the owner: "we can increase tri budget"): the overgrowth of the wild half; BUDGETS.json */
