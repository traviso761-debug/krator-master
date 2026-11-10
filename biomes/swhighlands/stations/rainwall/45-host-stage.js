// ================================================================= HOST — stage: station 2, the rain wall and the landslide lake (PLAN.md section 7)
// The wet western ramp at ~2.7-3.4 km, in cloud: the west wind off the Ancient's Valley drops 2.6-4 m of rain a year here, and the slopes
// fail as Taiwan's and Nepal's do. A deep valley runs west down the ramp; a ROCK AVALANCHE off its north wall (the shaded, south-facing
// side at 40 S) has crossed it and dammed it, as Sarez's did: a hummocky lobe with megablocks, the old valley drowned behind it (the
// model's landslide lake, 2,878 m), its trees standing dead in the water. The lake SEEPS through the dam rather than spills: the seep
// comes out at the dam's toe and runs west to the valley's HANGING LIP, where it falls ~170 m as a thread of falls (refs/34) into the
// lower valley. Fresh debris-flow chutes score both walls; fluted limestone pinnacles stand on the north ridge above the scar (refs/22).
// THE MAP (x east, z SOUTH, 4.8 km square, y 0 at ALT0 m above the sea): the valley's axis wanders round z ~0; its floor rises east (the
// lake's end) and drops at the lip (x ~ -1150). The kit reads the fields rain, scar, boulder, wet, slope (58-biome-swhighlands-rainwall.js)
// and snag (58b: the drowned trees). Every noise is KRAND's, every form core/terrain's (KRELIEF.range, KRELIEF.runout from 38c, river).
const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xa4b0b0);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00024);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,48000);
const hemi=new THREE.HemisphereLight(0xc4d0d0,0x3a4236,.7);scene.add(hemi);
const SUN_POS=[-1000,1000,-800];
const sun=new THREE.DirectionalLight(0xfff0dc,1.2);sun.position.set(SUN_POS[0],SUN_POS[1],SUN_POS[2]);scene.add(sun);
const fill=new THREE.DirectionalLight(0xa8c4d0,.3);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the map
const ALT0=2780,WORLD=8823;
const TERR={R:2400,X0:-2400,X1:2400,Z0:-2400,Z1:2400};
const NZ=(x,z,f,seed,o)=>KRAND.fbm(x*f+.31,.57,z*f-.13,o||3,seed)-.5;
// THE VALLEY: its axis, its floor's grade (5% up the drowned reach, 3% below the lip) and the lip's step, its walls
const LIP={x:-1150,drop:170,w:70};
function axisZ(x){return 110*Math.sin(x*.0011+.4)+70*NZ(x,0,.0016,201,2);}
function floorY(x){const up=-20+.05*(x-LIP.x),dn=-20-LIP.drop+.03*(x-LIP.x);return mix(dn,up,smooth(LIP.x-LIP.w*.5,LIP.x+LIP.w*.5,x));}
// spurs down both walls (KRELIEF.range rows across the valley), the north and south ridges beyond them
const SPURS=[-1900,-1100,-300,500,1300,2100].map((x,i)=>({x,n:KRELIEF.range({a:[x+60*(i%2?1:-1),-300],b:[x-40,-3000],h:110+20*(i%3),w:260,crest:.8,toe:.2,serr:.1,seed:211+i}),
 s:KRELIEF.range({a:[x-50,300],b:[x+70,3000],h:100+25*((i+1)%3),w:250,crest:.8,toe:.2,serr:.1,seed:221+i})}));
function wallsH(x,z){const d=Math.abs(z-axisZ(x)),side=z<axisZ(x)?1:-1;let h=760*Math.pow(smooth(55,1650,d),1.15)*(side>0?1.05:.95);
 for(const S of SPURS)h+=(side>0?S.n(x,z):S.s(x,z))*smooth(80,400,d);
 return h+30*NZ(x,z,.0018,231,3)+6*NZ(x,z,.012,232,2);}
// FRESH CHUTES: debris-flow scars down both walls (narrow, steep, gouged a few metres): where the rain wall fails every wet season
const CHUTES=[[-1650,-1],[-700,1],[-250,-1],[1000,1],[1650,-1],[1900,1]].map(([x,sd],i)=>({x,sd,w:22+10*KRAND.unit(KRAND.hash(WORLD,i,0xC4)),i}));
function chuteK(x,z){let k=0;const d=Math.abs(z-axisZ(x));for(const C of CHUTES){const sd=z<axisZ(x)?-1:1;if(sd!==C.sd)continue;const cx=C.x+40*NZ(0,z,.004,240+C.i,2),q=Math.abs(x-cx)/C.w;if(q<1)k=Math.max(k,(1-q*q)*smooth(90,260,d)*smooth(1300,900,d));}return k;}
// THE LIP AS A KNICKPOINT, not a scarp across the map: the step is the valley floor's only, fading out up the walls (700 m from the
// axis), so below the lip the seep runs in a plunge gorge cut 170 m into the lower valley; the lip itself a horseshoe, retreated 50 m
// upstream where the water goes over
function floor2(x,z){const d=Math.abs(z-axisZ(x)),lx=x-50*Math.exp(-Math.pow((z-axisZ(x))/90,2)),up=-20+.05*(x-LIP.x);
 return mix(floorY(lx),up,smooth(90,700,d));}
function g0(x,z){return floor2(x,z)+wallsH(x,z)-4*chuteK(x,z);}
// THE ROCK AVALANCHE (core/terrain 38c KRELIEF.runout): the breakaway's foot on the north wall, the lobe across the valley to the south
// wall; 55 m thick, its margins raised, megablocks on it; its SCAR above it on the north wall (the head scarp under the crown, the slip
// surface scooped up to 40 m out of the wall), fresh grey rock and rubble
const SLIDE={x:180,crown:-1060,foot:-330};
/* hummocks low and broad (55 m apart, a sixth of the thickness: the default's L/45 and .45 stood as a field of 25 m spikes), two megablocks;
   the margins hardly raised (rim .06): with the default's .5 the margins stood over the lobe's middle and the lake filled the dam's back */
const RUNOUT=KRELIEF.runout({a:[SLIDE.x,SLIDE.foot],b:[SLIDE.x+110,axisZ(SLIDE.x)+520],w:290,h:55,rim:.06,hummocks:{sp:55,h:.16},grooves:{d:.1},blocks:{n:2,size:[16,30],h:[.35,.7]},lake:false,seed:WORLD+31});
function scarK(x,z){const t=(z-SLIDE.crown)/(SLIDE.foot-SLIDE.crown);if(t<-.08||t>1.05)return 0;const half=150*(.55+.45*Math.sin(Math.PI*clamp(t,0,1)))+20*NZ(x,z,.01,241,2),q=Math.abs(x-SLIDE.x-20*t)/half;
 return q<1?Math.pow(1-q*q,.6)*smooth(-.08,.04,t)*smooth(1.05,.85,t):0;}
function scarCut(x,z){const t=clamp((z-SLIDE.crown)/(SLIDE.foot-SLIDE.crown),0,1);return 40*scarK(x,z)*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.15)),.6);}
function g1(x,z){const g=g0(x,z)-scarCut(x,z);return KRELIEF.shape(RUNOUT,x,z,g);}
// THE LAKE: its level 12 m under the dam's lowest crest across the valley floor (it seeps through, never over: the hollows between the
// dam's hummocks stand over it); its water the region JOINED to the lake's middle: 360 rays walked out from there to the first ground
// over the level, a few metres past it (under the bank), so no hollow on the dam's back or in the scar is drawn full
/* the crest on each line along the valley is the highest of its 40 m running minima (an opening: a lone hummock's top is no dam) */
const LAKE=(function(){let lo=1e9;for(let q=-70;q<=70;q+=10){const P=[];for(let x=-200;x<=700;x+=5)P.push(g1(x,axisZ(x)+q));let hi=-1e9;
  for(let i=0;i+8<P.length;i++){let m=1e9;for(let k=0;k<=8;k++)m=Math.min(m,P[i+k]);hi=Math.max(hi,m);}lo=Math.min(lo,hi);}
 const level=lo-12,xe=LIP.x+(level+20)/.05,cx=(SLIDE.x+RUNOUT.w+xe)/2,c=[cx,axisZ(cx)],poly=[];
 for(let k=0;k<360;k++){const a=k/360*TAU,dx=Math.cos(a),dz=Math.sin(a);let r=0;while(r<1800&&g1(c[0]+dx*r,c[1]+dz*r)<level+.3)r+=4;r+=6;poly.push([c[0]+dx*r,c[1]+dz*r]);}
 return{level,poly,crest:lo,c,name:'The landslide lake'};})();
function inPoly(P,x,z){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
// THE SEEP: out of the dam's toe on the valley's axis, west down the valley, over the lip, on to the map's west edge (KRELIEF.river levels
// on the ground, never climbing; a channel carved under it)
const SEEP=(function(){let x0=SLIDE.x-60;for(;x0>-900;x0-=5){const q=KRELIEF.at?KRELIEF.at(RUNOUT,x0,axisZ(x0)):null;if(!q)break;}
 const pts=[];for(let x=x0;x>=TERR.X0-60;x-=8)pts.push([x,axisZ(x)+8*Math.sin(x*.013)]);
 const lv=KRELIEF.river(pts,g1,{depth:.5,sample:4}),C={key:'seep',name:'The seep (the lake\'s outlet through the dam)',pts,y:lv.map(p=>p.y),slope:lv.map(p=>p.slope),w:[1.6,3.2],dep:.5,speed:1.2};
 C.S=[0];for(let i=1;i<pts.length;i++)C.S.push(C.S[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));C.LEN=C.S[C.S.length-1];C.halfW=i=>mix(C.w[0],C.w[1],C.S[i]/C.LEN);return C;})();
const COURSES=[SEEP];
const SEGIX=(function(){const S=KSPACE.create({cell:40});for(let i=0;i<SEEP.pts.length-1;i++){const a=SEEP.pts[i],b=SEEP.pts[i+1];S.insert({i},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2+SEEP.w[1]+40);}return S;})();
const _sq=[];
function streamNear(x,z){SEGIX.query(x,z,0,_sq);let best=null;
 for(const q of _sq){const a=SEEP.pts[q.i],b=SEEP.pts[q.i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1),d=Math.hypot(a[0]+dx*t-x,a[1]+dz*t-z),w=SEEP.halfW(q.i);
  if(!best||d-w<best.dd)best={C:SEEP,i:q.i,f:t,d,dd:d-w,w,y:mix(SEEP.y[q.i],SEEP.y[q.i+1],t),slope:SEEP.slope[q.i]};}
 return best;}
function terrainH0(x,z){const g=g1(x,z),r=streamNear(x,z);if(!r)return g;const w=r.w,t=Math.max(0,r.d-w);let h=g;
 if(r.d<w)h=Math.min(h,r.y-r.C.dep*(1-.55*(r.d/w)*(r.d/w))-.15);else{const bank=r.y+.3+t*.25+Math.max(0,t-4)*.9;if(bank<h)h=bank;}
 if(r.d<w+2)h=Math.min(h,r.y-.4);return h;}
// THE FIELD (core/terrain KFIELD): the ground baked once (6 m), a 3 m inset over the lip, the seep and the dam's toe
const FIELD_BAKED=(function(){const t0=performance.now();const F=KFIELD.bake(terrainH0,[TERR.X0-60,TERR.Z0-60,TERR.X1+60,TERR.Z1+60],6,{name:'swhighlands-rainwall',
 insets:[{box:[-1500,-300,300,300],step:3,name:'the lip, the seep and the dam\'s toe'}]});window._fieldMs=Math.round(performance.now()-t0);return F;})();
const terrainH=FIELD_BAKED.sampler();
function inLake(x,z){return inPoly(LAKE.poly,x,z)&&terrainH(x,z)<LAKE.level;}
function waterH(x,z){if(inPoly(LAKE.poly,x,z)&&terrainH(x,z)<LAKE.level+.3)return LAKE.level;const r=streamNear(x,z);return r&&r.d<r.w+2?r.y:-1e9;}
function slopeAt(x,z){const h=terrainH(x,z),e=3;return Math.hypot(terrainH(x+e,z)-h,terrainH(x,z+e)-h)/e;}
// core/water records (drawn in 89w): the lake a still, the seep a flow, its falls over the lip (WATER.fallsOf on the flow)
const LAKE_STILL=WATER.still({name:LAKE.name+' (behind the rock avalanche)',level:LAKE.level,gradient:{centre:0x163c3c,rim:0x3c6458,power:1.2},poly:LAKE.poly});
const FLOWS=[WATER.flow({name:SEEP.name,pts:SEEP.pts.map((p,i)=>[p[0],p[1],SEEP.y[i]]),width:SEEP.pts.map((p,i)=>2*(SEEP.halfW(i)+2)),speed:SEEP.pts.map((p,i)=>SEEP.speed+3*smooth(.05,.6,SEEP.slope[i]))})];
const SEEP_FALLS=WATER.fallsOf(FLOWS[0],{steep:.6,minDrop:8,fit:true}).map(f=>WATER.fall(f));
// THE FISHING BRIDGE: rooted on both banks of the seep a short way below the dam (58: opt.bridges [[x, z, x2, z2]])
const BRIDGES=(function(){const i=SEEP.pts.findIndex(p=>p[0]<SEEP.pts[0][0]-260);const a=SEEP.pts[Math.max(1,i)],b=SEEP.pts[Math.max(1,i)+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),nx=-dz/l,nz=dx/l,hw=SEEP.halfW(i)+6;
 return[[a[0]+nx*hw,a[1]+nz*hw,a[0]-nx*hw,a[1]-nz*hw]];})();

// ---------------------------------------------------------------- the climate fields (15 m lattice)
// rain: the rain wall's forest everywhere but the fresh ground; scar: the avalanche's scar and the chutes; boulder: the deposit's
// hummocks, megablocks and margins, the chutes' fans; snag: the drowned valley floor shallow enough for a dead tree to stand (under 18 m
// of water); wet, mist (cloud on the lake and in the valley), slope, north (+1 a sunny slope)
const FC=(function(){const N=321,SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,K=['h','slope','north','rain','scar','boulder','snag','wet','mist','flow','cold'],a={};
 K.forEach(k=>a[k]=new Float32Array(N*N));const st=SX/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++)a.h[j*N+i]=terrainH(TERR.X0+i*st,TERR.Z0+j*st);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=TERR.X0+i*st,z=TERR.Z0+j*st,h=a.h[k];
  const hx=(a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)])/(2*st),hz=(a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i])/(2*st);
  a.slope[k]=Math.hypot(hx,hz);a.north[k]=clamp(-hz/.3,-1,1);
  const ro=KRELIEF.at?KRELIEF.at(RUNOUT,x,z,g0(x,z)):null,on=ro&&ro.part&&ro.part!=='lake'?1:0,n1=NZ(x,z,.003,251,2);
  a.scar[k]=clamp(Math.max(scarK(x,z),chuteK(x,z)*.9),0,1);
  a.boulder[k]=clamp((on?(ro.part==='megablock'||ro.part==='rim'?1:ro.part==='hummock'?.75:.5):0)+chuteK(x,z)*.3*smooth(.6,.3,a.slope[k]),0,1);
  const lake=inPoly(LAKE.poly,x,z),dep=LAKE.level-h;
  a.snag[k]=lake&&dep>.5&&dep<18?smooth(18,6,dep):0;
  {const r=streamNear(x,z);a.flow[k]=r?smooth(40,3,r.dd):0;}
  a.rain[k]=clamp((1-a.scar[k])*(1-on*.7)*(lake&&dep>-.3?0:1)*(.85+.15*n1),0,1);
  a.wet[k]=clamp(.78+.15*a.flow[k]+.1*n1-.1*smooth(.4,1,Math.max(0,a.north[k])),0,1);
  a.cold[k]=clamp((h-200)/900,0,1);
  a.mist[k]=clamp(smooth(LAKE.level+140,LAKE.level,h)*.7+.2*smooth(400,700,h),0,1);}
 const at=(arr,x,z)=>{const u=clamp((x-TERR.X0)/SX*(N-1),0,N-1.001),v=clamp((z-TERR.Z0)/SZ*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,a,at};})();
const FIELD={rain:(x,z)=>FC.at(FC.a.rain,x,z),scar:(x,z)=>FC.at(FC.a.scar,x,z),boulder:(x,z)=>FC.at(FC.a.boulder,x,z),snag:(x,z)=>FC.at(FC.a.snag,x,z),
 wet:(x,z)=>FC.at(FC.a.wet,x,z),slope:(x,z)=>FC.at(FC.a.slope,x,z),north:(x,z)=>FC.at(FC.a.north,x,z),mist:(x,z)=>FC.at(FC.a.mist,x,z),flow:(x,z)=>FC.at(FC.a.flow,x,z),
 cold:(x,z)=>FC.at(FC.a.cold,x,z),upland:()=>0,rock:(x,z)=>smooth(.75,1.2,FC.at(FC.a.slope,x,z)),salt:()=>0};

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
const SPINE=[[SLIDE.x,-150],[SLIDE.x,-700],[900,axisZ(900)],[-450,axisZ(-450)],[LIP.x,axisZ(LIP.x)],[-500,-1450],[600,900],[1700,-700]];
BIO.init({tags:'swhighlands-rainwall',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,field:FIELD_BAKED,
 mask:(x,z)=>{if(x<TERR.X0+4||x>TERR.X1-4||z<TERR.Z0+4||z>TERR.Z1-4)return 0;if(inPoly(LAKE.poly,x,z)&&terrainH(x,z)<LAKE.level+.6)return 0;
  const r=streamNear(x,z);if(r&&r.dd<.8)return 0;if(r&&r.dd<5&&terrainH(x,z)<r.y+.3)return 0;
  if(nearPinnacle(x,z,2))return 0;   /* the pinnacles (47-host-land.js): nothing roots on their walls */
  return smooth(1.25,.85,FC.at(FC.a.slope,x,z));},
 obstacles:OBSTACLES,ticks:tick,seed:WORLD,register:REGISTER,origin:SPINE,center:[0,0],fields:FIELD,err:reportErr});
{const Q=new URLSearchParams(location.search);
 BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS);
