// ================================================================= HOST — stage: station 1, the ring folds (PLAN.md section 7)
// The host for the SW highlands' first station: the long wet ramp's ridge-and-valley country at ~2.15 km, where the crater
// ring's compression folded the beds into long even ridges parallel to the crest (PLAN.md section 4). Renderer, lights, the
// terrain baked once into a KFIELD heightfield, the three water courses as core/water records, the climate fields the kit
// reads, the tick list, the error panel. The biome fragments read none of it except through BIO.host.
//
// THE MAP (x east, z SOUTH, 4.8 km square, y 0 = the strike valley's floor at ALT0 m above the sea). The ridges run N-S,
// parallel to the crest (east, beyond the map); the rivers run west toward the Ancient's Valley lake, so the drainage is a
// trellis: each river runs down a strike valley and turns west through a WATER GAP.
//   THE WEST FOLD (x ~ -2350)    the next ridge west, framing the view
//   THE ARCH RIDGE (x ~ -300)    hard sandstone: the BALD under one pillar cap on its crest (z ~ -1250), a WIND GAP with
//                                the ARCH standing in it (z -650), the COVE in its east flank (z ~ -150), and the
//                                WATER GAP the river cuts through it (z ~ 700)
//   THE STRIKE VALLEY (x ~ 500)  the river from the north edge down to the gap; the Republic's last farm at its north end
//   THE LIMESTONE RIDGE (x 1300) the RIVER CAVE at its west foot (z -430: a cliff bitten out of the flank, the chevron fold
//                                over a carve patch's mouth, the cave stream out of it to the river), and the GORGE up its
//                                flank (z ~ -1250): a stream falling through three NATURAL BRIDGES into a sink
//   THE EAST FOLD (x ~ 2950)     beyond the map; the far field carries it and the folds past it
// Every noise is KRAND's (core/rand), every record KRELIEF's or KSTACKS' (core/terrain): the same ground in Godot.
const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xa8b6b2);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00018);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,48000);
const hemi=new THREE.HemisphereLight(0xc6d4d0,0x3c4434,.66);scene.add(hemi);
// the shared sky (89s-host-sky.js) drives the sun by the hour; this is its first place, for the kit's own lighting until then
const SUN_POS=[-1200,900,-500];
const sun=new THREE.DirectionalLight(0xfff0d6,1.36);sun.position.set(SUN_POS[0],SUN_POS[1],SUN_POS[2]);scene.add(sun);
const fill=new THREE.DirectionalLight(0xa8c4d0,.30);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the map
const ALT0=2150;                       // the strike valley's floor above the sea (the 2-3 km band: Cfa, Dfb; PLAN.md section 1)
const WORLD=8817;                      // this station's world seed for KRAND (every field and placement cell)
const TERR={R:2400,X0:-2400,X1:2400,Z0:-2400,Z1:2400};
// value noise in [-.5,.5] (KRAND.fbm on the x,z plane)
const NZ=(x,z,f,seed,o)=>KRAND.fbm(x*f+.31,.57,z*f-.13,o||3,seed)-.5;
// THE FOLDS: four ridges along z (KRELIEF.range, spines far past the map so they never taper in view), their crests
// wandering a little east and west; the profile f^.72 (crest) gives even 20-25 degree flanks, the ridge-and-valley country's
const RIDGES=[
 {key:'west',name:'The west fold',x:-2350,h:200,w:520,seed:13,wander:60},
 {key:'arch',name:'The arch ridge',x:-300,h:290,w:560,seed:11,wander:70},
 {key:'lime',name:'The limestone ridge',x:1300,h:250,w:520,seed:12,wander:50},
 {key:'east',name:'The east fold',x:2950,h:330,w:600,seed:14,wander:80}];
RIDGES.forEach(R=>{R.fn=KRELIEF.range({a:[R.x,-90000],b:[R.x,90000],h:R.h,w:R.w,crest:.72,toe:.12,serr:.05,seed:R.seed});});
const wob=(R,z)=>R.wander*2*NZ(0,z,.0006,R.seed+50,2);
const crestX=(R,z)=>R.x+wob(R,z);
function ridgesH(x,z){let m=0,s=0;for(const R of RIDGES){const v=R.fn(x-wob(R,z),z);s+=v;if(v>m)m=v;}return m+.25*(s-m);}   // KRELIEF.join's rule, without the array
// the nearest ridge's profile at x,z: 1 on its spine, 0 at its foot and beyond (the zones' crest and flank)
function ridgeAt(x,z){let best=null;for(const R of RIDGES){const d=Math.abs(x-crestX(R,z)),f=clamp(1-d/R.w,0,1);if(!best||f>best.f)best={R,d,f,east:x>crestX(R,z)};}return best;}
// the ramp: rising east (to the crest beyond the map), the strike valleys falling toward the water gap at z ~ 700 east of the
// arch ridge and southward west of it; swells and grain
function baseH(x,z){const east=smooth(-1100,-700,x);
 return .022*x-.011*z+.02*Math.max(0,z-700)*east+14*NZ(x,z,.0016,21,3)+3*NZ(x,z,.012,22,2);}
// THE COVE: a hollow let into the arch ridge's east flank between two spurs, sheltered and wet (the lattice oaks' ground)
const COVE={x:60,z:-150,rx:290,rz:210,d:44,name:'The cove'};
function coveK(x,z){const u=(x-COVE.x)/COVE.rx,v=(z-COVE.z)/COVE.rz,r2=u*u+v*v;return r2<1?(1-r2)*(1-r2):0;}
function g0(x,z){return baseH(x,z)+ridgesH(x,z)-COVE.d*coveK(x,z);}
const RA=RIDGES[1],RB=RIDGES[2];
// THE BALD: an open crest under one pillar cap (a zone only: the ground is the ridge's)
const BALD={x:crestX(RA,-1250),z:-1250,r:250,name:'The bald'};
// THE ARCH in its WIND GAP: a saddle notched across the arch ridge's crest (KRELIEF.gap, wind), and in it a hard bed left
// standing as an arch (KSTACKS 'arch', made in 47-host-land.js on this ground), its opening looking east-west through the ridge
const ARCH_Z=-650,ARCH_X=crestX(RA,ARCH_Z),ARCH_COL=g0(ARCH_X,ARCH_Z)-34;
const WIND_GAP=KRELIEF.gap({a:[ARCH_X+240,ARCH_Z],b:[ARCH_X-240,ARCH_Z],w:110,floor:ARCH_COL,wind:true,rough:.3,seed:31});   /* rough: the col's walls irregular, not a clean notch */
// THE WATER GAP: the river's notch through the arch ridge, its floor on the river's grade (KRELIEF.gap)
const WG_A=[330,705],WG_B=[-940,775];
const WATER_GAP=KRELIEF.gap({a:WG_A,b:WG_B,w:420,floor:[g0(WG_A[0],WG_A[1])-5,g0(WG_B[0],WG_B[1])-6],rough:.25,seed:32});
// THE GORGE: four notches stepping down the limestone ridge's west flank (KRELIEF.gap each, steep-walled), every step a fall
// of 15 m or more; a natural bridge stands over each fall (47-host-land.js) and the stream ends in a sink
const GP=[[1185,-1238],[1085,-1262],[988,-1246],[898,-1259],[818,-1250]];
const GORGE=(function(){const segs=[],falls=[];let prevEnd=null;
 for(let k=0;k<4;k++){const a=GP[k],b=GP[k+1],ga=g0(a[0],a[1]),gb=g0(b[0],b[1]);
  const top=k===0?ga-16:Math.min(prevEnd-15,ga-15),end=Math.min(top-4,gb-11);
  segs.push(KRELIEF.gap({a,b,w:58,floor:[top,end],floorW:5,wall:52,rough:.22,seed:40+k}));
  if(k>0)falls.push({k,x:a[0],z:a[1],dir:[b[0]-a[0],b[1]-a[1]],top:prevEnd,foot:top});prevEnd=end;}
 const sk=[796,-1249],level=Math.min(prevEnd-7,g0(sk[0],sk[1])-4);
 return{segs,falls,end:prevEnd,sink:{x:sk[0],z:sk[1],r:15,level,floor:level-5,name:'The sink'}};})();
// THE RIVER CAVE: a cliff bitten out of the limestone ridge's west foot (walls ~3:1 round a flat floor at the valley's level),
// and in its back wall the cave's mouth, a core/terrain carve patch (KCARVE alcove) the cave stream comes out of
// (the owner, 2026-10-26: carved too deep, a pit under a ~100 m wall; then a trench round the hood): on core/terrain's cave-mouth calls,
// KCARVE.site (where along the ridge's foot the back wall stands 22 m), KCARVE.face / cut (the bite, never more than 28 m under the
// natural ground, its rim wandering by KRAND except on the mouth's wall), KCARVE.fold (the recess folded in steeply enough for the
// hood's margin, KCARVE.minSteep) and KCARVE.keepOut (no channel carved round the mouth)
const BITE=(function(){const S=KCARVE.site({base:g0,floorAt:(x,z)=>g0(x-60,z)+.5,from:[760,-432],to:[1000,-432],step:2,r:26,face:22});return{x:S.x,z:S.z,r:S.r,floor:S.floorY,face:S.face};})();
const BITE_FACE=KCARVE.face({c:[BITE.x,BITE.z],r:BITE.r,floorY:BITE.floor,slope:3.2,maxCut:28,open:[1,0],noise:{seed:91}});
let CAVE_STEEP=40;
function gBite(x,z,h,noCave){const v=KCARVE.cut(BITE_FACE,x,z,h);return noCave?v:KCARVE.fold(v,x,z,{steep:CAVE_STEEP});}
function g1raw(x,z){let h=g0(x,z);h=KRELIEF.shape(WIND_GAP,x,z,h);h=KRELIEF.shape(WATER_GAP,x,z,h);
 if(x>700&&x<1300&&z>-1360&&z<-1140)for(const S of GORGE.segs)h=KRELIEF.shape(S,x,z,h);
 const K=GORGE.sink,ds=Math.hypot(x-K.x,z-K.z);if(ds<K.r+40){const kr=K.r*(1+.4*(KRAND.fbm((x-K.x)/(ds||1)*2+3,.5,(z-K.z)/(ds||1)*2+3,2,93)-.5)),q=Math.min(ds,kr)/kr;
  const b=ds<kr?K.floor+5*q*q:K.level+(ds-kr)*1.1;if(b<h)h=b;}
 return h;}
const CAVE=KCARVE.add({id:'cave',kind:'alcove',c:[BITE.x+BITE.r-1,BITE.z],n:[-1,0],hw:7,depth:20,h:9,floorY:BITE.floor,
 base:(x,z)=>gBite(x,z,g1raw(x,z),true),margin:6,pad:2,cell:.6,name:'The river cave'});
CAVE_STEEP=Math.max(40,KCARVE.minSteep(CAVE)*1.2);   /* the fold's rise fits inside the hood's margin */
function g1(x,z){return gBite(x,z,g1raw(x,z));}

// ---------------------------------------------------------------- the water courses
// Each a polyline run downstream, its surface from KRELIEF.river on the ground before the channels (never climbing), then a
// channel carved under it. The river: down the strike valley from the north edge, west through the water gap, then south down
// the west strike valley. The cave stream: out of the cave's mouth across the valley floor into the river. The gorge stream:
// from its spring at the gorge's head down the four steps into the sink.
const COURSES=(function(){const L=[];
 const rv=[];for(let z=-2470;z<=600;z+=14)rv.push([500+70*Math.sin(z*.0023+.4)+35*Math.sin(z*.0061+1.1),z]);
 rv.push([430,658],[WG_A[0],WG_A[1]]);for(let t=1;t<=40;t++){const u=t/40;rv.push([lerp(WG_A[0],WG_B[0],u),lerp(WG_A[1],WG_B[1],u)]);}
 rv.push([-1060,820],[-1180,880],[-1270,960]);for(let z=1000;z<=2470;z+=14)rv.push([-1330+55*Math.sin(z*.0019+.7)+25*Math.sin(z*.0052),z]);
 L.push({key:'river',name:'The fold river',pts:rv,w:[7,10],dep:1.1,speed:1.2});
 // where the cave stream meets the river: the river's point nearest the cave's floor
 let jn=rv[0],jd=1e18;rv.forEach(p=>{const d=Math.hypot(p[0]-(BITE.x-300),p[1]-BITE.z);if(d<jd){jd=d;jn=p;}});
 const cv=[[BITE.x+BITE.r+18,BITE.z],[BITE.x+BITE.r+6,BITE.z],[BITE.x+BITE.r-10,BITE.z-1],[BITE.x,BITE.z-3],[BITE.x-60,BITE.z-8]];
 {const a=cv[cv.length-1];for(let t=1;t<=14;t++){const u=t/14;cv.push([lerp(a[0],jn[0],u),lerp(a[1],jn[1],u)+8*Math.sin(u*Math.PI*2)*(1-u)]);}}   /* from one start, the meander dying out before the river */
 /* two Chaikin passes (ends kept): the line had a kink just outside the mouth, and the current's ripples turned sharply there (the owner) */
 {let q=cv;for(let it=0;it<2;it++){const o=[q[0]];for(let i=0;i+1<q.length;i++){const a=q[i],b=q[i+1];o.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75]);}o.push(q[q.length-1]);q=o;}cv.length=0;q.forEach(p=>cv.push(p));}
 L.push({key:'cave',name:'The cave stream',pts:cv,w:[2.6,3.4],dep:.6,speed:1.6,join:{ci:0}});   /* it meets the river as one water: WATER.join below */
 const gs=[];for(let k=0;k<GP.length-1;k++){const a=GP[k],b=GP[k+1],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/5);for(let i=0;i<n;i++)gs.push([lerp(a[0],b[0],i/n),lerp(a[1],b[1],i/n)]);}
 gs.push(GP[GP.length-1],[GORGE.sink.x+6,GORGE.sink.z]);
 L.push({key:'gorge',name:'The gorge stream',pts:gs,w:[1.6,2.2],dep:.45,speed:1.8});
 L.forEach(C=>{const lv=KRELIEF.river(C.pts,g1,{depth:C.dep,sample:C.w[1]*2});C.y=lv.map(p=>p.y);C.slope=lv.map(p=>p.slope);
  if(C.key==='cave'){const sl=C.slope.slice();C.slope=sl.map((v,i)=>{let t=0,n=0;for(let k=-3;k<=3;k++){const j=i+k;if(j>=0&&j<sl.length){t+=sl[j];n++;}}return t/n;});}   /* its current eased too: no step in the ripples' speed at the mouth */
  C.S=[0];for(let i=1;i<C.pts.length;i++)C.S.push(C.S[i-1]+Math.hypot(C.pts[i][0]-C.pts[i-1][0],C.pts[i][1]-C.pts[i-1][1]));
  C.LEN=C.S[C.S.length-1];C.halfW=i=>mix(C.w[0],C.w[1],C.S[i]/C.LEN);});
 // A TRIBUTARY MEETS ITS RIVER AS ONE WATER (core/water WATER.join; the owner, 2026-10-26: no channel across the other's water, no
 // bank between them, no tip): its line cut where it comes within .3 of the river's half width of its centreline, its levels raised
 // to the river's there; 89w-host-water.js draws it after the river
 L.forEach(C=>{if(!C.join)return;const M=L[C.join.ci],J=WATER.join(C.pts.map((p,i)=>[p[0],p[1],C.y[i]]),M.pts.map((p,i)=>[p[0],p[1],M.y[i]]),{w:i=>M.halfW(i),tuck:1,tw:C.w[1],poolK:1.15});   /* the pool just rounds the corners (larger, it bulged the little stream's banks) */   /* tuck 1: it ends at the river's water edge, its foam border over the river's bank foam */
  C.joined=J;C.pts=J.pts.map(p=>[p[0],p[1]]);C.y=J.pts.map(p=>p[2]);C.slope=C.y.map((y,i)=>i+1<C.y.length?(y-C.y[i+1])/(Math.hypot(C.pts[i+1][0]-C.pts[i][0],C.pts[i+1][1]-C.pts[i][1])||1):0);
  {const sl=C.slope.slice();C.slope=sl.map((v,i)=>{let t=0,n=0;for(let k=-3;k<=3;k++){const j=i+k;if(j>=0&&j<sl.length){t+=sl[j];n++;}}return t/n;});}   /* eased: no step in the ripples' speed */
  C.S=[0];for(let i=1;i<C.pts.length;i++)C.S.push(C.S[i-1]+Math.hypot(C.pts[i][0]-C.pts[i-1][0],C.pts[i][1]-C.pts[i-1][1]));C.LEN=C.S[C.S.length-1];});
 return L;})();
const RIVER=COURSES[0],CAVE_STREAM=COURSES[1],GORGE_STREAM=COURSES[2];
// the segments in one KSPACE index (core/space): the nearest course to any point, for the channels, the mask and the fields
const SEGIX=(function(){const S=KSPACE.create({cell:40});COURSES.forEach((C,ci)=>{for(let i=0;i<C.pts.length-1;i++){const a=C.pts[i],b=C.pts[i+1];
 S.insert({ci,i},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2+C.w[1]+40);}});return S;})();
const _sq=[];
// nearest water course: {d, C, i, f, y (its surface), w (its half width), s (metres downstream)} within 40 m of its bank, or null
function streamsNear(x,z){SEGIX.query(x,z,0,_sq);const per=[];
 for(const q of _sq){const C=COURSES[q.ci],a=C.pts[q.i],b=C.pts[q.i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1),px=a[0]+dx*t-x,pz=a[1]+dz*t-z,d2=px*px+pz*pz;
  const w=C.halfW(q.i),dd=Math.sqrt(d2)-w,P=per[q.ci];if(!P||dd<P.dd)per[q.ci]={ci:q.ci,i:q.i,f:t,d2,dd};}
 const out=[];for(const P of per){if(!P)continue;const C=COURSES[P.ci],i=P.i,f=P.f;
  out.push({C,d:Math.sqrt(P.d2),dd:P.dd,i,f,y:mix(C.y[i],C.y[i+1],f),w:C.halfW(i),s:mix(C.S[i],C.S[i+1],f),slope:C.slope[i]});}
 return out;}
function streamNear(x,z){let best=null;for(const r of streamsNear(x,z))if(!best||r.dd<best.dd)best=r;return best;}
// the ground with the channels: a bed under the surface, a low bank, then the valley floor; the ground held under the water's
// surface out to the ribbon's margin (the field is coarser than the narrow channels)
// a polynomial smooth minimum (k: the blend's width in the values' units): where two channels meet, the corner between their banks
// is a fillet, not a crease (the owner, 2026-10-26: the confluence's edges wanted rounding)
const smin=(a,b,k)=>{const q=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-q*q*k*.25;};
function terrainH0(x,z){const g=g1(x,z);let h=null;
 for(const r of streamsNear(x,z)){if(r.C.key==='cave'&&(KCARVE.keepOut(x,z,2)||x>BITE.x+BITE.r-2))continue;   /* the cave stream cuts no trench round its mouth: the hood and the hill stay one face */
  const w=r.w,dep=r.C.dep,t=Math.max(0,r.d-w);let hc=g;
  if(r.d<w)hc=Math.min(hc,r.y-dep*(1-.55*(r.d/w)*(r.d/w))-.15);
  else{const bank=r.y+.35+t*.22+Math.max(0,t-5)*.9;if(bank<hc)hc=bank;}
  if(r.d<w+2.5)hc=Math.min(hc,r.y-.45);
  h=h==null?hc:smin(h,hc,1.6);}
 if(h==null)h=g;
 /* the mouths' pools (WATER.join pool): the ground under each held under its level, rising beyond its rim, smoothly into the banks */
 for(const C of COURSES){const P=C.joined&&C.joined.pool;if(!P)continue;const d=Math.hypot(x-P.x,z-P.z);if(d>P.r+12)continue;h=smin(h,P.level-.45+Math.max(0,d-P.r)*.6,1.2);}
 const K=GORGE.sink,ds=Math.hypot(x-K.x,z-K.z);if(ds<K.r+2)h=Math.min(h,K.level-.4-(K.r+2-ds)*.25);
 return h;}
// THE FIELD (core/terrain KFIELD): the ground baked once (6 m), with a 2 m inset over the gorge and the cave, where the
// steps, the bridges' rims and the bite's walls are finer than the base grid; everything after this reads the field
const FIELD_BAKED=(function(){const t0=performance.now();
 const F=KFIELD.bake(terrainH0,[TERR.X0-60,TERR.Z0-60,TERR.X1+60,TERR.Z1+60],6,{name:'swhighlands-s1',
  insets:[{box:[744,-1320,1236,-384],step:2,name:'the gorge and the cave'},{box:[396,-468,474,-384],step:2,name:'the mouth of the cave stream'}]});window._fieldMs=Math.round(performance.now()-t0);return F;})();
const terrainH=FIELD_BAKED.sampler();
// the water surface: the course's level across its channel, the sink's in its bowl, none elsewhere
function waterH(x,z){const K=GORGE.sink;if(Math.hypot(x-K.x,z-K.z)<K.r+1.5)return K.level;
 for(const C of COURSES){const P=C.joined&&C.joined.pool;if(P&&Math.hypot(x-P.x,z-P.z)<P.r+1)return P.level;}
 const r=streamNear(x,z);if(r&&r.d<r.w+2.5)return r.y;return -1e9;}
function slopeAt(x,z){const h=terrainH(x,z),e=3;return Math.hypot(terrainH(x+e,z)-h,terrainH(x,z+e)-h)/e;}
// core/water records (drawn in 89w-host-water.js): each course a WATER.flow, the gorge's falls WATER.fallsOf's slope breaks
// (fit: the curtain lands at the foot of its step), the sink a still disc
const FLOWS=COURSES.map(C=>WATER.flow({name:C.name,pts:C.pts.map((p,i)=>[p[0],p[1],C.y[i]]),width:C.pts.map((p,i)=>2*(C.halfW(i)+2.5)),
 speed:C.pts.map((p,i)=>C.speed+3*smooth(.05,.6,C.slope[i]))}));
const GORGE_FALLS=WATER.fallsOf(FLOWS[2],{steep:.6,minDrop:6,fit:true}).map(f=>WATER.fall(f));
const SINK_STILL=WATER.still({name:'The sink',level:GORGE.sink.level,gradient:{centre:0x1e3634,rim:0x4c6a5a,power:1.4},
 poly:Array.from({length:32},(_,k)=>{const a=k/32*TAU,K=GORGE.sink;return[K.x+Math.cos(a)*(K.r+1.5),K.z+Math.sin(a)*(K.r+1.5)];})});

// ---------------------------------------------------------------- the farm (the Iron Republic's last, at the valley's north end)
// Fields and walls only: the farmstead and its crops are the Republic's builds' (PLAN.md section 0). KRELIEF.fields lays the
// enclosures; 82-host-far.js walls them, 84-host-ground.js paints them; the native flora keeps out (the mask)
const FARM={x0:150,x1:880,z0:-2400,z1:-1660,name:'The last farm (the Iron Republic)'};
const FARM_FIELDS=KRELIEF.fields({seed:WORLD+5,angle:9,spacing:[70,150],warp:20,drop:.3,kinds:[['pasture',3],['arable',2],['hay',1]]});
function farmK(x,z){const e=Math.min(x-FARM.x0,FARM.x1-x,z-FARM.z0,FARM.z1-z);return smooth(0,70,e);}

// ---------------------------------------------------------------- the climate fields
// On a 15 m lattice (read a million times a build); terrainH itself is the field's. wet: the ramp's rain (1,300-1,800 mm,
// wetter in the hollows); mist: the valley's and the gaps' morning fog; cold: little at 2.1-2.4 km, the crests and the
// south-facing (shaded) slopes a band colder; rock: the cliffs; cove, bald, crest, valley, farm: the kit's zones
const FC=(function(){const N=321,SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,K=['h','slope','north','valley','crest','flow','wet','mist','cold','rock','cove','bald','farm'],a={};
 K.forEach(k=>a[k]=new Float32Array(N*N));const st=SX/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++)a.h[j*N+i]=terrainH(TERR.X0+i*st,TERR.Z0+j*st);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=TERR.X0+i*st,z=TERR.Z0+j*st,h=a.h[k];
  const hx=(a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)])/(2*st),hz=(a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i])/(2*st);
  a.slope[k]=Math.hypot(hx,hz);
  // at 40 S the shaded slopes face SOUTH (PLAN.md section 2): the ground falls toward +z
  a.north[k]=clamp(-hz/.32,-1,1);
  const R=ridgeAt(x,z);a.crest[k]=smooth(.55,.92,R.f);a.valley[k]=smooth(.25,0,R.f);
  /* the bank distance as a smooth minimum over the courses near (8 m): the banks' gravel rounds the corner where two meet */
  {let dm=null;for(const r of streamsNear(x,z)){if(r.C.key==='cave'&&KCARVE.keepOut(x,z,2))continue;const dd=r.d-r.w;dm=dm==null?dd:smin(dm,dd,8);}a.flow[k]=dm==null?0:smooth(60,4,dm);}
  const n1=NZ(x,z,.0021,88,2),n2=NZ(x,z,.0009,89,2);
  a.cove[k]=clamp(coveK(x,z)*1.4+smooth(.3,.05,R.f)*smooth(.1,.4,R.f)*.3*(R.east?1:.6)*smooth(.15,.45,n1+.5),0,1);
  a.bald[k]=smooth(BALD.r+60,BALD.r*.55,Math.hypot((x-BALD.x)*.8,z-BALD.z))*smooth(.7,.9,R.f);
  a.farm[k]=farmK(x,z);
  a.cold[k]=clamp((h-40+120*Math.max(0,-a.north[k])+100*n2)/600,0,1);
  a.wet[k]=clamp(.74+.12*a.valley[k]+.14*a.flow[k]+.12*a.cove[k]-.16*a.crest[k]+.12*n1,0,1);
  a.rock[k]=clamp(smooth(.7,1.25,a.slope[k]),0,1);
  a.mist[k]=clamp(Math.max(a.valley[k]*.7*smooth(-.25,.2,n2),a.flow[k]*.85,a.cove[k]*.6),0,1);}
 const at=(arr,x,z)=>{const u=clamp((x-TERR.X0)/SX*(N-1),0,N-1.001),v=clamp((z-TERR.Z0)/SZ*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,a,at};})();
const FIELD={wet:(x,z)=>FC.at(FC.a.wet,x,z),salt:(x,z)=>0,upland:(x,z)=>FC.at(FC.a.crest,x,z),flow:(x,z)=>FC.at(FC.a.flow,x,z),
 mist:(x,z)=>FC.at(FC.a.mist,x,z),cold:(x,z)=>FC.at(FC.a.cold,x,z),rock:(x,z)=>FC.at(FC.a.rock,x,z),
 cove:(x,z)=>FC.at(FC.a.cove,x,z),bald:(x,z)=>FC.at(FC.a.bald,x,z),crest:(x,z)=>FC.at(FC.a.crest,x,z),valley:(x,z)=>FC.at(FC.a.valley,x,z),
 farm:(x,z)=>FC.at(FC.a.farm,x,z),slope:(x,z)=>FC.at(FC.a.slope,x,z),north:(x,z)=>FC.at(FC.a.north,x,z)};

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: the station's places (heroes to 800 m round each, impostors beyond)
const SPINE=[[Math.round(BALD.x),BALD.z],[Math.round(ARCH_X),ARCH_Z],[COVE.x,COVE.z],[BITE.x,BITE.z],[1000,-1250],[-300,740],[520,-900],[-1300,1500]];
BIO.init({tags:'swhighlands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,field:FIELD_BAKED,
 mask:(x,z)=>{if(x<TERR.X0+4||x>TERR.X1-4||z<TERR.Z0+4||z>TERR.Z1-4)return 0;   // the map's square: beyond it is the far country
  const K=GORGE.sink;if(Math.hypot(x-K.x,z-K.z)<K.r+3)return 0;
  const r=streamNear(x,z);if(r&&r.d<r.w+1.5)return 0;if(r&&r.d<r.w+6&&terrainH(x,z)<r.y+.3)return 0;   // the water and its wet edge
  if(KCARVE.covered(x,z)!=null)return 0;                                                               // nothing roots in the cave
  if(Math.hypot(x-BITE.x,z-BITE.z)<BITE.r+70&&x<BITE.x+BITE.r)return 0;                                 // the cave's floor and the ground before it stay open
  if(Math.abs(z-ARCH_Z)<50&&Math.abs(x-ARCH_X)<70)return 0;                                             // the arch's col: bare rock and turf
  return smooth(1.25,.8,FC.at(FC.a.slope,x,z))*(1-FC.at(FC.a.farm,x,z));},                           // the cliffs stay bare; the farm is the Republic's
 obstacles:OBSTACLES,ticks:tick,seed:WORLD,register:REGISTER,
 origin:SPINE,center:[0,0],fields:FIELD,err:reportErr});
// GRAPHIC-LOAD.md from day one (core/biome README, "Adopting it"): item geometry welded and drawn by index; one LOD mesh per
// chunk, rows sorted by range, small meshes merged to 1500 triangles, a dithered cross-fade over each range's last 15%, and every
// loose instance culled at its own row's range. ?index=0 ?lodmerge=0 ?lodfade=0 ?lodcull=0 to compare
{const Q=new URLSearchParams(location.search);
 BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS);
