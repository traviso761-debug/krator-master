// ================================================================= HOST — stage, STATION 5: THE BOG COUNTRY (the Footfall plateau)
// PLAN-STATIONS.md, station 5 (the owner, 2026-11-02). This replaces src/45-host-stage.js for `--station bogs` and keeps its contract (TERR, the s/t
// axes, rampH, baseH, SCARPS, PADS, TOWER, STREAM, TARN, STREAM_FLOW, STREAM_FALLS, TARN_STILL, streamNear, terrainH, waterH, FC, FIELD, the binding),
// so the kit's host fragments (82 the far country, 84 the ground and mist, 89a, 89w, 99) run on it unchanged.
// THE PLACE (scale model 5.1, surveyed 2026-11-02): the flattest wet cold ground in the polygon, 9,700 km2 round px 543,780 at ~3,300 m, 1.06 atm,
// 894 mm, +8 degC (20/-4), Dsb with Cfb and Dfb corners, 42 km from Footfall's ruin (px 560,767), behind the Inner Wall's wet face. The geology bake
// (kits/resources/data/geology.json) puts it on SEDIMENTARY ground, not the wall's impact province: no megabreccia here (STATION_BRECCIA false).
// The water is in the ground: no lake on the model, a mire fed by the crest's melt and seepage. Heights are the kit's own (page y): the bench stands at
// ~800 m on the page's scale as station 1's boreal band does, the crest rising past the SE edge, the wet face falling past the NW.
// The ideal-type host for the NORTHERN HIGHLANDS: the outer (north-western)
// flank of the Inner Wall, where the ground climbs out of the north-western
// lowlands toward the range's crest. Renderer, lights, fog, the terrain with
// terrainH(), the stream and its tarn with waterH(), the climate fields the
// biome asks for (wet / upland / flow / mist / cold / rock), the tick list, the
// error panel. A real world replaces this whole section with its own; the
// biome fragments never read anything from it except through BIO.host.
//
// THE MAP (x east, z SOUTH, origin mid-flank, 6.6 km square). One axis does the
// work: s runs from the low NW corner (s≈-4670, ~0 m, the top of the lowlands'
// foothills) up to the high SE corner (s≈+4670, ~1400 m); t runs across it,
// toward the NE. On that ramp:
//   SPURS AND SIDE VALLEYS   ridged noise in t, the ridges running down the
//                            axis, deeper and sharper the higher you go
//   THE CRAG STEPS           two broken scarps across the slope (s≈+350 and
//                            s≈+1900): grey rock steps of 25-45 m, unbroken
//                            where the stream crosses them (the waterfalls)
//   THE STREAM               rises in a tarn in the boreal band (s≈+2700) and
//                            runs down its own valley to leave by the NW corner:
//                            a monotone bed, cascades, two falls, plunge pools
// The climate follows altitude and aspect: temperate old growth below ~450 m,
// boreal above ~950 m, the north-facing side-valley walls a band colder.
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)

// FOG: the shape (plain exponential near, saturating far, so the old-growth air is
// hazy at a few hundred metres and the far lowlands still read) is set where the
// sky is, in 82-host-sky.js, with the light modes that change its colour.
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xa9b8b6);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00016);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,48000);
const hemi=new THREE.HemisphereLight(0xc4d2d0,0x3e4636,.66);scene.add(hemi);
// the sun stands WNW (canon), mid-afternoon: it lights the NW-facing flank and
// throws long shafts down the side valleys
const SUN_POS=[-1300,880,-420];
const sun=new THREE.DirectionalLight(0xfff0d6,1.36);sun.position.set(SUN_POS[0],SUN_POS[1],SUN_POS[2]);scene.add(sun);
const fill=new THREE.DirectionalLight(0xa8c4d0,.30);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the map
// x east, z SOUTH, origin mid-bench, 4.8 km square. s runs from the NW (the bench's lip over the wet face) to the SE (the foot of the crest's rise).
const STATION_BRECCIA=false,STATION_NAME='The bog country (the Footfall plateau)';
const TERR={R:2400,X0:-2400,X1:2400,Z0:-2400,Z1:2400};
const RT2=Math.SQRT1_2;
const sOf=(x,z)=>(x+z)*RT2, tOf=(x,z)=>(x-z)*RT2;
const xzOf=(s,t)=>[(s+t)*RT2,(s-t)*RT2];
// the bench: ~800 m and nearly level across the map (a 0.6% fall to the NW), the wet face dropping past s=-3400 and the crest rising past s=+3400;
// at s=+-4900 it meets station 1's ramp (0 and 1400 m), where the far country (82-host-sky.js) takes over
const rampH=s=>s<-3400?792*smooth(-4900,-3400,s):s>3400?820+580*smooth(3400,4900,s):806+14*(s/3400);
const upU=s=>clamp((s+4900)/9800,0,1);
// the peat stream's line across the axis: a slow wide meander (a mire stream wanders)
const tStream=s=>-120+260*Math.sin(s*.0011+.9)+70*Math.sin(s*.0043+.2);
const S_SRC=1500, S_END=-3380;
const SCARPS=[];function scarpAt(Sc,s,t){return{sc:0,a:0,k:0};}
// THE MIRE'S FORMS, as plain records (seeded from KRAND by index: a dome or a pool never moves when another changes)
// raised bogs: domes of peat a few metres high over a kilometre (Ingram's profile, h0 sqrt(1 - (r/R)^2)), their centres the wettest and treeless
const BOG_SEED=54378;
const DOMES=[{x:-650,z:-250,R:760,h:6.2},{x:900,z:-950,R:520,h:4.4},{x:-1500,z:1300,R:600,h:5.0}];
const domeAt=(x,z)=>{let h=0,k=0;for(const D of DOMES){const r=Math.hypot(x-D.x,z-D.z)/D.R;if(r<1){h=Math.max(h,D.h*Math.sqrt(1-r*r));k=Math.max(k,1-r);}}return{h,k};};
// string bogs on the rise to the SE (s > 1700): low peat ridges (strings) along the contours, pools (flarks) between them
const stringAt=(x,z)=>{const s=sOf(x,z),t=tOf(x,z),w=smooth(1700,2300,s);if(w<=0)return 0;const ph=s*.052+1.6*Math.sin(t*.0031)+.8*Math.sin(t*.011+1.3);return w*(.5+.5*Math.cos(ph));};
// BASE TERRAIN: the bench, the domes, the strings, a mineral rise or two (the low knolls where the forest stands), the stream's hags
const KNOLLS=[{x:1300,z:600,R:420,h:9},{x:-300,z:1500,R:360,h:7},{x:1750,z:-1500,R:380,h:8},{x:-1900,z:-1300,R:460,h:10}];
function baseH(x,z){const s=sOf(x,z);let h=rampH(s);
 h+=6*(fbm(x*.0008+3,z*.0008-2,61,2)-.5)+1.2*(fbm(x*.004-1,z*.004+4,64,2)-.5);   // the bench's long swells and its grain: soft, a mire smooths what it covers
 for(const K of KNOLLS){const r=Math.hypot(x-K.x,z-K.z)/K.R;if(r<1.4)h+=K.h*Math.exp(-r*r*2.2);}
 h+=domeAt(x,z).h;h+=.8*stringAt(x,z);
 for(const P of PADS){const d=Math.hypot(x-P.x,z-P.z);if(d<P.r+P.f)h=mix(P.h,h,smooth(P.r,P.r+P.f,d));}
 return h;}
const PADS=[];
const TOWER={x:-1e5,z:-1e5,s:-1e5,t:0};   // no tower here (station 1's Girder tower); the views and checks that read it skip it (no TOWER.top)
const PILLARS=[];                         // no crag pillars (86-host-pillars.js is dropped for this station)

// THE POOLS: dubh lochans on the dome flanks in concentric pool-and-ridge rows, flarks between the strings; each an ellipse along the contour,
// its own level (0.15-0.4 m under the peat round it), its floor 0.6-1.6 m down. One record each (BOG_POOLS); one draw for all (89w-host-water.js)
const BOG_POOLS=(function(){const L=[],H=(i,k)=>KRAND.unit(KRAND.hash(BOG_SEED,i,k,1));let i=0;
 const ok=(x,z,a)=>Math.abs(x)<TERR.R-60&&Math.abs(z)<TERR.R-60&&!L.some(P=>Math.hypot(P.x-x,P.z-z)<P.a+a+6);
 DOMES.forEach((D,di)=>{for(let ring=0;ring<5;ring++){const rr0=D.R*(.32+.13*ring),n=Math.round(TAU*rr0/48);for(let k=0;k<n;k++,i++){if(H(i,2)<.42)continue;
   const ang=k/n*TAU+H(i,3)*.12,x=D.x+Math.cos(ang)*rr0*(1+.05*(H(i,4)-.5)),z=D.z+Math.sin(ang)*rr0,a=6+16*H(i,5),b=2.5+4*H(i,6);
   if(ok(x,z,a))L.push({x,z,a,b,rot:ang+Math.PI/2,kind:'pool',dome:di});}}});
 for(let k=0;k<900&&L.length<520;k++,i++){const x=-TERR.R+H(i,7)*2*TERR.R,z=-TERR.R+H(i,8)*2*TERR.R;if(stringAt(x,z)>.25)continue;const s=sOf(x,z);if(s<1750)continue;
  const a=10+22*H(i,9),b=3+5*H(i,10);if(ok(x,z,a))L.push({x,z,a,b,rot:Math.PI/4+.3*(H(i,11)-.5),kind:'flark'});}
 // the dubh lochan: the largest pool, at the big dome's crown
 L.push({x:DOMES[0].x+60,z:DOMES[0].z-40,a:58,b:40,rot:.6,kind:'lochan'});
 L.forEach((P,j)=>{P.id=j;P.c=Math.cos(P.rot);P.s=Math.sin(P.rot);});return L;})();
const poolU=(P,x,z)=>{const dx=x-P.x,dz=z-P.z,u=(dx*P.c+dz*P.s)/P.a,v=(-dx*P.s+dz*P.c)/P.b;return Math.hypot(u,v);};
const POOLH={};const PH=60;BOG_POOLS.forEach(P=>{for(let gx=Math.floor((P.x-P.a)/PH);gx<=Math.floor((P.x+P.a)/PH);gx++)for(let gz=Math.floor((P.z-P.a)/PH);gz<=Math.floor((P.z+P.a)/PH);gz++)(POOLH[gx+','+gz]||(POOLH[gx+','+gz]=[])).push(P);});
function poolAt(x,z,pad){const C=POOLH[Math.floor(x/PH)+','+Math.floor(z/PH)];if(!C)return null;for(const P of C){if(poolU(P,x,z)<1+(pad||0)/P.b)return P;}return null;}
BOG_POOLS.forEach(P=>{let lo=1e9;for(let k=0;k<12;k++){const a=k/12*TAU,x=P.x+Math.cos(a)*P.a*P.c-Math.sin(a)*P.b*P.s,z=P.z+Math.cos(a)*P.a*P.s+Math.sin(a)*P.b*P.c;lo=Math.min(lo,baseH(x,z));}
 P.level=lo-(P.kind==='lochan'?.3:.18);P.depth=P.kind==='lochan'?2.4:.7+.9*KRAND.unit(KRAND.hash(BOG_SEED,P.id,12,1));
 P.poly=Array.from({length:P.kind==='lochan'?40:16},(_,k)=>{const a=k/(P.kind==='lochan'?40:16)*TAU,e=1+.06*Math.sin(3*a+P.id);return[P.x+(Math.cos(a)*P.a*P.c-Math.sin(a)*P.b*P.s)*e,P.z+(Math.cos(a)*P.a*P.s+Math.sin(a)*P.b*P.c)*e];});});
const LOCHAN=BOG_POOLS[BOG_POOLS.length-1];

// ---------------------------------------------------------------- the stream
// The peat stream: out of the lochan's dome, across the bench to the NW lip, in a channel cut 1.5-3 m into the peat (black hags each side). The bed is
// traced and clamped never to rise as station 1's is; on a 0.4% grade it has no falls (STREAM_FALLS is empty)
const STREAM=(function(){const P=[],S=[];const ds=12;
 for(let s=S_SRC;s>=S_END;s-=ds){P.push(xzOf(s,tStream(s)));S.push(S_SRC-s);}
 const n=P.length,LEN=S[n-1];
 const halfW=i=>mix(1.6,4.2,smooth(0,1,S[i]/LEN));
 const bed=[],dep=[],drop=[];let prev=1e9;
 const TARN_LEVEL=baseH(P[0][0],P[0][1])-1.8;
 for(let i=0;i<n;i++){let b=baseH(P[i][0],P[i][1])-mix(1.8,3.0,S[i]/LEN);if(i===0)b=TARN_LEVEL-1.2;b=Math.min(b,prev-.004);bed.push(b);prev=b;}
 for(let i=0;i<n;i++){const a=bed[Math.max(0,i-1)],c=bed[Math.min(n-1,i+1)];drop.push((a-c)/(2*ds));dep.push(mix(.4,.9,S[i]/LEN));}
 const pool=new Float32Array(n);for(let i=0;i<n;i++){const r=Math.sin(S[i]*.017+.4);if(r>.8)pool[i]=.8*(r-.8)/.2;}
 for(let i=0;i<n;i++){bed[i]-=pool[i];dep[i]+=pool[i];}
 const level=bed.map((b,i)=>b+dep[i]),bank=bed.map((b,i)=>b+pool[i]);
 const falls=[];
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;P.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);});
 return{P,S,LEN,bed,bank,dep,level,drop,halfW,falls,TARN_LEVEL,box:[x0-200,z0-200,x1+200,z1+200],src:P[0]};})();
// the stream's head pool (the kit's TARN): a small black pool where the stream gathers off the big dome's flank
const TARN={x:STREAM.src[0],z:STREAM.src[1],r:26,level:STREAM.TARN_LEVEL};
const STREAM_FLOW=WATER.flow({name:'The peat stream',pts:STREAM.P.map((p,i)=>[p[0],p[1],STREAM.level[i]]),width:STREAM.P.map((p,i)=>2*(STREAM.halfW(i)+3)),
 speed:STREAM.P.map((p,i)=>.4+1.2*smooth(.002,.02,STREAM.drop[i]))});
const STREAM_FALLS=[];
const TARN_STILL=WATER.still({name:'The head pool',level:TARN.level,gradient:{centre:0x14100c,rim:0x3a3020,power:1.4},poly:Array.from({length:32},(_,k)=>{const a=k/32*Math.PI*2;return[TARN.x+Math.cos(a)*(TARN.r+3),TARN.z+Math.sin(a)*(TARN.r+3)];})});
// the pools the stream's channel, its head pool or the dubh lochan would cut into go (their lip is lower than their level there: the check in 98);
// the index (POOLH) is rebuilt on what is left. A pool's id is kept, so the hazards and the views name the same pools
for(let i=BOG_POOLS.length-1;i>=0;i--){const P=BOG_POOLS[i];if(P===LOCHAN)continue;const r=streamNear(P.x,P.z);
 if((r&&r.d<r.w+P.a+12)||Math.hypot(P.x-TARN.x,P.z-TARN.z)<TARN.r+P.a+24||Math.hypot(P.x-LOCHAN.x,P.z-LOCHAN.z)<LOCHAN.a+P.a+8)BOG_POOLS.splice(i,1);}
for(const k in POOLH)delete POOLH[k];
BOG_POOLS.forEach(P=>{for(let gx=Math.floor((P.x-P.a)/PH);gx<=Math.floor((P.x+P.a)/PH);gx++)for(let gz=Math.floor((P.z-P.a)/PH);gz<=Math.floor((P.z+P.a)/PH);gz++)(POOLH[gx+','+gz]||(POOLH[gx+','+gz]=[])).push(P);});
// the bog pools as core/water stills (drawn as one mesh by WATER.drawPools): peat-brown, near black in the middle
const POOL_STILLS=BOG_POOLS.map(P=>WATER.still({name:P.kind==='lochan'?'The dubh lochan':P.kind==='flark'?'A flark':'A bog pool',level:P.level,poly:P.poly,
 gradient:{centre:0x0e0c09,rim:0x3c3424,power:1.2}}));
function streamNear(x,z){const B=STREAM.box;if(x<B[0]||x>B[2]||z<B[1]||z>B[3])return null;
 const P=STREAM.P;let bd=1e18,bi=0,bf=0;
 for(let i=0;i<P.length-1;i+=6){const a=P[i],b=P[Math.min(P.length-1,i+6)];const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);const px=a[0]+dx*t-x,pz=a[1]+dz*t-z,d2=px*px+pz*pz;if(d2<bd){bd=d2;bi=i;}}
 if(bd>300*300)return null;
 bd=1e18;const i0=Math.max(0,bi-6),i1=Math.min(P.length-2,bi+12);
 for(let i=i0;i<=i1;i++){const a=P[i],b=P[i+1];const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);const px=a[0]+dx*t-x,pz=a[1]+dz*t-z,d2=px*px+pz*pz;if(d2<bd){bd=d2;bi=i;bf=t;}}
 return{d:Math.sqrt(bd),s:mix(STREAM.S[bi],STREAM.S[bi+1],bf),i:bi,f:bf,bed:mix(STREAM.bed[bi],STREAM.bed[bi+1],bf),bank:mix(STREAM.bank[bi],STREAM.bank[bi+1],bf),level:mix(STREAM.level[bi],STREAM.level[bi+1],bf),w:STREAM.halfW(bi)};}

// ---------------------------------------------------------------- terrain
function terrainH(x,z){let h=baseH(x,z);
 const dt=Math.hypot(x-TARN.x,z-TARN.z);
 if(dt<TARN.r+30){const bowl=TARN.level-2.2*(1-Math.pow(Math.min(1,dt/TARN.r),2))+Math.max(0,dt-TARN.r)*.25+(dt<TARN.r?0:.25);if(bowl<h)h=bowl;}
 // the pools: a floor under each, its edge a cut peat lip (the poly's level, then down)
 const P=poolAt(x,z,0);if(P){const u=poolU(P,x,z);if(u<1)h=Math.min(h,P.level-.25-P.depth*(1-u*u));}   /* inside its ellipse only: the peat round it stays at its own height, a cut lip 0.4 m over the water (outside it a hollow under the level drew a dry moat) */
 // the stream: a channel cut into the peat with steep black hags, the ground held under the ribbon
 const r=streamNear(x,z);
 if(r){const w=r.w,t=Math.max(0,r.d-w),bank=Math.max(r.bank,r.level-.25)+.35+t*.9+Math.max(0,t-3)*.25;
  if(r.d<w)h=Math.min(h,r.bed-.25*(1-r.d/w));else if(bank<h)h=bank;
  if(r.d<w+3)h=Math.min(h,r.level-.4-.2*(1-r.d/(w+3)));}
 return h;}
function waterH(x,z){if(Math.hypot(x-TARN.x,z-TARN.z)<TARN.r+6)return TARN.level;const P=poolAt(x,z,1);if(P)return P.level;
 const r=streamNear(x,z);if(r&&r.d<r.w+4)return r.level;return -1e9;}
function slopeAt(x,z){const h=terrainH(x,z),e=3;return Math.hypot(terrainH(x+e,z)-h,terrainH(x,z+e)-h)/e;}

// ---------------------------------------------------------------- the climate fields
// The kit's fields (wet / upland / flow / mist / cold / rock) on its 18 m lattice, read as station 1 reads them, plus BOG: 1 on the open mire (the
// domes, the strings and flarks, the wet flats), 0 on the mineral knolls and the stream's drier levees. COLD: Dsb at ~3.3 km, the kit's montane
// band meeting its boreal one (.62-.74), colder in the hollows (cold air and frost pockets on a bog) and on the domes' open crowns
const FC=(function(){const N=300,SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,K=['h','slope','north','valley','flow','wet','up','mist','cold','rock','bog'],a={};K.forEach(k=>a[k]=new Float32Array(N*N));
 const st=SX/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=TERR.X0+i*st,z=TERR.Z0+j*st;a.h[j*N+i]=terrainH(x,z);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=TERR.X0+i*st,z=TERR.Z0+j*st,h=a.h[k];
  const hx=(a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)])/(2*st),hz=(a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i])/(2*st);
  a.slope[k]=Math.hypot(hx,hz);a.north[k]=clamp(hz/.32,-1,1);
  let knoll=0;for(const K of KNOLLS){const r=Math.hypot(x-K.x,z-K.z)/K.R;knoll=Math.max(knoll,Math.exp(-r*r*2.2));}
  const dm=domeAt(x,z),sg=stringAt(x,z),r=streamNear(x,z),dT=Math.hypot(x-TARN.x,z-TARN.z),pl=poolAt(x,z,14);
  a.valley[k]=r?Math.exp(-(r.d*r.d)/(60*60)):0;
  a.flow[k]=Math.max(r?smooth(40,4,r.d):0,smooth(TARN.r+30,TARN.r,dT),pl?.25:0);   /* a pool wets its edge but is no stream bank: the kit's riparian zone (rip) starts at .3 */
  a.up[k]=clamp(h/1400,0,1);
  const n1=fbm(x*.0021+4,z*.0021-6,88,2)-.5,n2=fbm(x*.0009-3,z*.0009+2,89,2)-.5;
  // BOG: the open mire. The domes (their crowns wholly), the string fen, the wet flats; not the knolls, the levees, the bench's NW lip
  const bog=clamp(Math.max(smooth(.05,.35,dm.k),sg>0?.85:0,.55+.9*n2)*(1-smooth(.25,.6,knoll))*(1-(r?smooth(28,10,r.d)*.6:0))*smooth(-3300,-2700,sOf(x,z)),0,1);
  a.bog[k]=bog;
  a.cold[k]=clamp(.66+.06*bog+.05*dm.k-.08*knoll+.05*n2,0,1);
  a.wet[k]=clamp(.82+.14*bog+.06*a.flow[k]-.12*knoll+.06*n1,0,1);
  a.rock[k]=clamp(smooth(.62,1.15,a.slope[k])*.3+knoll*smooth(.15,.35,n1)*.25,0,1);   // a few stones on the knolls; no crags
  a.mist[k]=clamp(Math.max(bog*.7*smooth(-.25,.2,n2),a.flow[k]*.8),0,1);}
 const at=(arr,x,z)=>{const u=clamp((x-TERR.X0)/SX*(N-1),0,N-1.001),v=clamp((z-TERR.Z0)/SZ*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,a,at};})();
const FIELD={wet:(x,z)=>FC.at(FC.a.wet,x,z),salt:(x,z)=>0,upland:(x,z)=>FC.at(FC.a.up,x,z),flow:(x,z)=>FC.at(FC.a.flow,x,z),
 mist:(x,z)=>FC.at(FC.a.mist,x,z),cold:(x,z)=>FC.at(FC.a.cold,x,z),rock:(x,z)=>FC.at(FC.a.rock,x,z),bog:(x,z)=>FC.at(FC.a.bog,x,z)};

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: the stream from the tarn to the NW corner, the tower, the old wood, a boreal stand, the crest
// the LOD spine: the stream, the big dome's crown, the string fen, a knoll's wood
const SPINE=(function(){const o=[];for(let s=S_SRC-100;s>=S_END+300;s-=880){const p=xzOf(s,tStream(s));o.push([Math.round(p[0]),Math.round(p[1])]);}
 o.push([DOMES[0].x,DOMES[0].z],[DOMES[1].x,DOMES[1].z]);{const p=xzOf(2200,300);o.push([Math.round(p[0]),Math.round(p[1])]);}o.push([KNOLLS[0].x,KNOLLS[0].z]);
 return o;})();
BIO.init({tags:'nhighlands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,
 mask:(x,z)=>{if(x<TERR.X0+4||x>TERR.X1-4||z<TERR.Z0+4||z>TERR.Z1-4)return 0;   // the map's square: beyond it is the far country
  if(Math.hypot(x-TARN.x,z-TARN.z)<TARN.r+4)return 0;const r=streamNear(x,z);if(r&&r.d<r.w+1.2)return 0;   // the water and its wet edge
  if(poolAt(x,z,.6))return 0;   // the bog pools
  if(r&&r.d<r.w+6&&terrainH(x,z)<r.level+.3)return 0;
  return smooth(1.35,.85,FC.at(FC.a.slope,x,z));},                                                                   // the crag faces stay bare rock
 obstacles:OBSTACLES,ticks:tick,seed:31,register:REGISTER,
 origin:SPINE,center:[0,0],fields:FIELD,err:reportErr});
// B1/B2 (core/biome README, "Adopting it"): one LOD mesh per chunk, rows sorted by range (lodTick draws the prefix that reaches the
// camera), small meshes merged up to 1500 triangles, and a dithered cross-fade over the last 15% of each range (no pop at a ring)
// the items' geometry welded and drawn by index (core/biome BIO.INDEX_ITEMS; ?index=0 for the soup): the leaf and floor cards were
// vertex-bound on an integrated GPU (the optimization pass, 2026-10-26: a quarter of the pixels saved a tenth of the frame)
BIO.INDEX_ITEMS=new URLSearchParams(location.search).get('index')!=='0';
BIO.LOD.merge=new URLSearchParams(location.search).get("lodmerge")!=="0";BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&new URLSearchParams(location.search).get("lodfade")!=="0"?.15:0;
// per-instance range culling for loose instances (core/biome BIO.LOD.cull; GRAPHIC-LOAD.md recommendation 1; ?lodcull=0 to compare)
BIO.LOD.cull=BIO.LOD.fade>0&&new URLSearchParams(location.search).get('lodcull')!=='0';
BIO.setSun(SUN_POS);
