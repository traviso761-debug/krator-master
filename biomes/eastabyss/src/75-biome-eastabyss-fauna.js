// ================================================================= EASTERN ABYSS — fauna
// The abyss floor's animals on the biome contract (2026-10), ported from Locus's ambient fauna
// (settlements/locus/src/83-locus-fauna.js: its flamingos and frilled lizards, there on Locus's own
// globals) and placed from the same fields the flora reads:
//   FLAMINGOS  flocks of 12-60 standing and feeding in the shallows (BIO.depth .03..55 m: the salt
//              lake's margin, the river channels' edges, the delta, the marsh pools), each bird
//              wading its own small loop, head down in the water to feed or up; and a few skeins
//              in V formation flying long loops over the lake and the flats, wings flapping; 1.3 m
//   FRILLED LIZARDS  on dry ground near the rivers and on the salt flats' damp edges, basking, then a
//              dash on the hind legs; the frill opens and the lizard rears and turns to face the
//              viewer (BIO.eye) inside ~25 m; 0.9 m nose to tail
// Every pose is a pure function of the BIO clock (BIO.WIND.t) and the kit's seeded layout: walkers
// (below) for the waders and the lizards, closed-form loops for the skeins. Nothing is integrated
// frame to frame, so a port replays the same poses from the same clock (biomes/GODOT.md). The frill
// is a function of the viewer's distance only. All of it is dynamic instanced meshes (BIO.dynamic)
// driven by one BIO.tick. Tags follow the project rule.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const zones=EASTABYSS.zones,blocked=EASTABYSS.blocked;
const T3=BIO.host.THREE;
EASTABYSS.FAUNA=[
 {key:'flamingo',name:'Salt-lake flamingo',H:[1.2,1.4],tags:{climate:'tropic',aridity:'humid',abyssal:true,riparian:'both'}},
 {key:'frilled_lizard',name:'Frilled lizard',L:[.8,1.0],tags:{climate:'tropic',aridity:'semiarid',abyssal:true,riparian:'both'}},
];
// ---------------------------------------------------------------- walkers: a pose that is a function of the clock
// (the same walkers as biomes/sedesert's fauna, 75: a kit keeps its own copy.) A WALKER goes round a
// closed polyline at a trapezoid speed (it eases out of and into each stop) and stands at some of its
// vertices for a while; walkAt(W,t) is its pose at clock t. The ground under the path is sampled once
// at build (W.gy), so a frame calls no terrainH.
const wrapA=a=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;},lerpA=(a,b,u)=>a+wrapA(b-a)*u;
function wSeg(W,s){const c=W.cum;let lo=0,hi=W.pts.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(c[m]<=s)lo=m;else hi=m-1;}return lo;}
function wAt(W,s){s=((s%W.L)+W.L)%W.L;const i=wSeg(W,s),n=W.pts.length,a=W.pts[i],b=W.pts[(i+1)%n],l=W.cum[i+1]-W.cum[i],u=l>0?(s-W.cum[i])/l:0;return[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];}
function wY(W,s){s=((s%W.L)+W.L)%W.L;const f=s/W.ds,k=Math.min(Math.floor(f),W.gy.length-2),u=f-k;return W.gy[k]+(W.gy[k+1]-W.gy[k])*u;}
function wHd(W,s,all,rc){s=((s%W.L)+W.L)%W.L;const n=W.pts.length,i=wSeg(W,s),c=W.cum,a=s-c[i],b=c[i+1]-s;
 if(a<rc&&(all||!W.isStop[i]))return lerpA(W.dir[(i+n-1)%n],W.dir[i],smooth(-rc,rc,a));
 if(b<rc&&(all||!W.isStop[(i+1)%n]))return lerpA(W.dir[i],W.dir[(i+1)%n],smooth(-rc,rc,-b));
 return W.dir[i];}
// pts [[x,z]...] closed; stops [{i,d,...}] sorted by vertex; runs [{...}] one a stop (what the walker does
// on the way to the next stop); v m/s; ta the ease (s); off the clock offset (s); hs the half-stride (m)
function mkWalker(pts,stops,v,ta,off,hs,runs){const n=pts.length,cum=[0],dir=[];
 for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];cum.push(cum[i]+Math.hypot(b[0]-a[0],b[1]-a[1]));dir.push(Math.atan2(b[0]-a[0],b[1]-a[1]));}
 const L=cum[n],N=Math.max(2,Math.ceil(L)),W={pts,cum,dir,L,ds:L/N,gy:new Float32Array(N+1),stops,v,off,tl:[],P:0,hs:L/(2*Math.max(1,Math.round(L/(2*hs)))),isStop:new Uint8Array(n)};
 for(let k=0;k<=N;k++){const p=wAt(W,k*W.ds);W.gy[k]=BIO.terrainH(p[0],p[1]);}
 stops.forEach(S=>W.isStop[S.i]=1);
 let t0=0;
 for(let k=0;k<stops.length;k++){const S=stops[k],S2=stops[(k+1)%stops.length];
  W.tl.push({run:0,s0:cum[S.i],D:S.d,t0,stop:S,hIn:dir[(S.i+n-1)%n],hOut:dir[S.i]});t0+=S.d;
  let Lr=cum[S2.i]-cum[S.i];if(Lr<=0)Lr+=L;const te=Math.min(ta,Lr/v),D=Lr/v+te;
  W.tl.push({run:1,s0:cum[S.i],Lr,D,ta:te,t0,R:runs?runs[k]:null});t0+=D;}
 W.P=t0;return W;}
// {x,z,y (ground), s, hd, vf (speed 0..1), e (the timeline entry), tau (s into it), stop, u, ph (gait)}
function walkAt(W,t){let r=(t+W.off)%W.P;if(r<0)r+=W.P;
 let e=W.tl[0];for(let k=1;k<W.tl.length&&W.tl[k].t0<=r;k++)e=W.tl[k];
 const tau=r-e.t0,o={e,tau,stop:null,u:0,vf:0,s:0,hd:0};
 if(!e.run){o.stop=e.stop;o.u=tau;o.s=e.s0;const d=e.D,tt=Math.min(1.5,d*.4);o.hd=lerpA(e.hIn,e.hOut,smooth(d-tt,d,tau));}
 else{const v=W.v,ta=e.ta;let s;
  if(ta<=0){s=v*tau;o.vf=1;}else if(tau<ta){s=v*tau*tau/(2*ta);o.vf=tau/ta;}
  else if(tau>e.D-ta){const k=e.D-tau;s=e.Lr-v*k*k/(2*ta);o.vf=k/ta;}else{s=v*(tau-ta/2);o.vf=1;}
  o.s=e.s0+s;o.hd=wHd(W,o.s,false,.3);}
 const p=wAt(W,o.s);o.x=p[0];o.z=p[1];o.y=wY(W,o.s);o.ph=Math.PI*o.s/W.hs;return o;}
// ---------------------------------------------------------------- geometries (vertex-coloured; bodies face +z, the ground at y=0)
const _c=new T3.Color();
function asm(parts){const pos=[],nor=[],col=[];
 parts.forEach(p=>{const g=p.g.index?p.g.toNonIndexed():p.g,a=g.attributes.position.array,b=g.attributes.normal.array;
  for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);nor.push(b[i],b[i+1],b[i+2]);
   _c.set(typeof p.c==='function'?p.c(a[i],a[i+1],a[i+2]):p.c).convertSRGBToLinear();col.push(_c.r,_c.g,_c.b);}});
 return BIO.geo._make(pos,nor,new Array(pos.length/3*2).fill(0),col);}
const ell=(rx,ry,rz,x,y,z,ws,hs,rotx)=>{const g=new T3.SphereGeometry(1,ws||7,hs||5);g.scale(rx,ry,rz);if(rotx)g.rotateX(rotx);g.translate(x,y,z);return g;};
const tube=(a,b,r0,r1,seg)=>{const d=new T3.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=d.length(),g=new T3.CylinderGeometry(r1,r0,L,seg||4,1,true);g.translate(0,L/2,0);
 g.applyMatrix4(new T3.Matrix4().makeRotationFromQuaternion(new T3.Quaternion().setFromUnitVectors(new T3.Vector3(0,1,0),d.normalize())));g.translate(a[0],a[1],a[2]);return g;};
const quad=(P,c)=>{const g=new T3.BufferGeometry(),p=[...P[0],...P[1],...P[2],...P[0],...P[2],...P[3]];g.setAttribute('position',new T3.Float32BufferAttribute(p,3));g.computeVertexNormals();return{g,c};};
const FC={pink:0xf2909e,deep:0xe4687e,black:0x1c1818,leg:0xdc7c8a,bill:0xe6d6cc,tip:0x1a1414,
 liz:0x7c6444,lizD:0x56442e,lizB:0xb8a482,frill:0xd2502c,frillC:0xe8a848};
const G={};
// the wader's body (the folded wings dark at the tail), the ground at y=0
G.flaBody=()=>asm([{g:ell(.16,.15,.3,0,.8,0),c:FC.pink},{g:ell(.12,.06,.17,0,.86,-.17,5,3),c:(x,y,z)=>z<-.27?FC.black:FC.deep}]);
// the lower neck: pivot at its root, along +y, 0.36 m
G.flaNeck=()=>asm([{g:tube([0,-.05,-.03],[0,.37,0],.05,.034,4),c:FC.pink}]);
// the upper neck and the head: pivot at the lower neck's tip, along +y; the bill points +z and bends down
G.flaHead=()=>asm([{g:tube([0,-.01,0],[0,.27,0],.034,.03,4),c:FC.pink},{g:ell(.042,.042,.06,0,.28,.025,6,4),c:FC.pink},
 {g:tube([0,.28,.07],[0,.255,.15],.024,.014,4),c:FC.bill},{g:tube([0,.255,.15],[0,.215,.18],.014,.006,4),c:FC.tip}]);
// a leg: hip at y=0, the foot at y=-1; the knee (the ankle, in fact) a darker band
G.flaLeg=()=>{const g=new T3.CylinderGeometry(.014,.011,1,4,2,true);g.translate(0,-.5,0);return asm([{g,c:(x,y,z)=>Math.abs(y+.5)<.06?FC.deep:FC.leg}]);};
// in flight: neck stretched forward, legs trailing, along +z; the wings are their own instances (they flap)
G.flaFly=()=>asm([{g:ell(.15,.13,.3,0,0,0),c:FC.pink},{g:tube([0,.02,.22],[0,.04,.8],.04,.03,4),c:FC.pink},{g:ell(.042,.042,.06,0,.04,.84,6,4),c:FC.pink},
 {g:tube([0,.03,.88],[0,-.01,.98],.022,.008,4),c:FC.tip},{g:tube([.03,-.04,-.2],[.03,-.05,-.95],.012,.01,4),c:FC.leg},{g:tube([-.03,-.04,-.2],[-.03,-.05,-.95],.012,.01,4),c:FC.leg}]);
// one wing, out along +x from the hinge at the body's side: the pink coverts, the black flight feathers
G.flaWing=()=>asm([quad([[.08,0,.15],[.46,0,.13],[.46,0,-.17],[.08,0,-.17]],FC.deep),quad([[.46,0,.13],[.86,-.02,.04],[.84,-.02,-.12],[.46,0,-.17]],FC.black)]);
// a frilled lizard, 0.9 m: the origin at the hips, the head +z, the tail -z, legs splayed
G.lizard=()=>{const c=(x,y,z)=>y>.1?FC.lizD:y<.055?FC.lizB:FC.liz,P=[{g:ell(.065,.05,.17,0,.08,.1,7,5),c},{g:ell(.042,.038,.07,0,.1,.32,6,4,-.1),c},
 {g:tube([0,.07,-.04],[0,.035,-.58],.034,.006,5),c:(x,y,z)=>Math.floor(-z*14)%2?FC.lizD:FC.liz}];
 for(const s of [1,-1]){P.push({g:tube([s*.05,.07,.2],[s*.12,0,.24],.014,.01,4),c:FC.lizD});P.push({g:tube([s*.05,.07,0],[s*.13,0,-.04],.016,.01,4),c:FC.lizD});}
 return asm(P);};
// the frill: a ruff round the neck in the xy plane, facing +z; the pivot at the neck
G.frill=()=>{const g=new T3.CircleGeometry(.2,10,-.4,Math.PI+.8);return asm([{g,c:(x,y,z)=>Math.hypot(x,y)>.12?FC.frill:FC.frillC}]);};
const M={body:BIO.leafMat(null,'fauna-body',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true})};
const _w1=new T3.Color(1,1,1),_m4=new T3.Matrix4(),_p3=new T3.Vector3(),_q1=new T3.Quaternion(),_q2=new T3.Quaternion(),_eu=new T3.Euler(),_s3=new T3.Vector3(),_v3=new T3.Vector3();
const setI=(im,i,x,y,z,rx,ry,rz,sx,sy,sz,col)=>{_p3.set(x,y,z);_eu.set(rx,ry,rz,'YXZ');_q2.setFromEuler(_eu);_s3.set(sx,sy,sz);_m4.compose(_p3,_q2,_s3);im.setMatrixAt(i,_m4);if(col)im.setColorAt(i,col);};
// a point in a body frame (heading hd, pitch pt) at scale k, from the origin o, into _v3
const inBody=(o,hd,pt,k,l)=>{_eu.set(pt,hd,0,'YXZ');_q1.setFromEuler(_eu);_v3.set(l[0]*k,l[1]*k,l[2]*k).applyQuaternion(_q1).add(o);return _v3;};
// the wader's rig: the neck's root in the body, the lower neck's length, the hips, the leg length; the two necks'
// tilts (rad from upright, forward positive) standing and feeding
const FLA={neck:[0,.86,.22],lowL:.36,hips:[[.06,.68,-.02],[-.06,.68,-.02]],legLen:.68,stand:[.55,-.75],feed:[2.35,3.05]};
// ---------------------------------------------------------------- the pass
// keep (optional, the host's): (kind,x,z)->bool, false where it keeps the ground (BIOME-API.md)
EASTABYSS.buildFauna=function(R,q,keep){
 reseed(750011);q=q==null?1:q;R=R||3000;const st={flamingos:0,flocks:0,skeins:0,flying:0,lizards:0};
 const LOD=BIO.LOD(),Y=(x,z)=>BIO.terrainH(x,z),fok=typeof keep==='function'?keep:null;
 const tint=(dl)=>{const c=new T3.Color(1,1,1);c.offsetHSL(rr(-.01,.01),rr(-.04,.02),dl==null?rr(-.06,.04):dl);return c.convertSRGBToLinear();};
 // a leg of a path is good when every metre-ish point on it passes
 const legOK=(a,b,ok,step)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/(step||1.5));for(let i=1;i<n;i++){const u=i/n;if(!ok(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u))return false;}return true;};
 // ---- FLAMINGOS: shallow water (the waders stand on the bed), clear of the host's obstacles
 const shallow=(x,z)=>{const d=BIO.depth(x,z);return d>.03&&d<.55&&BIO.clearOf(x,z,1)&&(!fok||fok('flamingo',x,z));};
 const cand=[];
 BIO.grid(55,0,R,(x,z)=>BIO.lodD(x,z)>LOD.mid?0:1,(x,y,z)=>{const Z=zones(x,z);cand.push([x,z,.35+.65*Math.max(Z.salt,Z.flow,Z.marsh)]);},{patch:0,pad:0,noMask:true,depth:[.08,.45]});
 for(let i=cand.length-1;i>0;i--){const j=Math.floor(rng()*(i+1)),t=cand[i];cand[i]=cand[j];cand[j]=t;}
 const flocks=[],birds=[],NF=Math.max(1,Math.round(8*q));
 for(const c of cand){if(flocks.length>=NF)break;if(rng()>c[2]||!shallow(c[0],c[1]))continue;if(flocks.some(f=>Math.hypot(f.x-c[0],f.z-c[1])<340))continue;
  const n=Math.max(12,Math.round(ri(12,60)*q)),rf=6+Math.sqrt(n)*2.4,F={x:c[0],z:c[1],birds:[]};
  for(let b=0;b<n;b++){let home=null;
   for(let g=0;g<14&&!home;g++){const a=rr(0,TAU),r=rf*Math.sqrt(rng()),px=F.x+Math.cos(a)*r,pz=F.z+Math.sin(a)*r;
    if(shallow(px,pz)&&!F.birds.some(o=>Math.hypot(o.W.pts[0][0]-px,o.W.pts[0][1]-pz)<1.1))home=[px,pz];}
   if(!home)continue;const pts=[home];
   for(let g=0;g<16&&pts.length<3;g++){const a=rr(0,TAU),r=rr(1.5,4.5),p=[home[0]+Math.cos(a)*r,home[1]+Math.sin(a)*r];if(shallow(p[0],p[1])&&legOK(pts[pts.length-1],p,shallow))pts.push(p);}
   if(pts.length===3&&!legOK(pts[2],pts[0],shallow))pts.pop();
   if(pts.length<2)pts.push([home[0]+.01,home[1]]);   // a bird with nowhere to wade stands
   // at each stop it feeds (head down) or stands; on each leg it feeds as it wades or walks head up
   const stops=pts.map((p,i)=>({i,d:rr(6,24),feed:rng()<.62?1:0})),runs=pts.map(()=>({feed:rng()<.6?1:0}));
   const W=mkWalker(pts,stops,rr(.16,.3),1,rr(0,900),.24,runs);
   W.tl.forEach((e,k)=>{e.hf=e.run?e.R.feed:e.stop.feed;});W.tl.forEach((e,k)=>{e.hp=W.tl[(k+W.tl.length-1)%W.tl.length].hf;});
   const juv=rng()<.1,B={W,F,k:rr(.9,1.04),ph:rr(0,TAU),c:juv?tint(-.18):tint()};F.birds.push(B);birds.push(B);}
  if(F.birds.length>=8)flocks.push(F);else F.birds.forEach(B=>birds.splice(birds.indexOf(B),1));}
 st.flocks=flocks.length;st.flamingos=birds.length;
 // ---- the skeins: V formations flying an ellipse that joins two flocks (or loops one), over the lake and the flats
 const skeins=[],flyers=[];
 for(let s=0;s<Math.min(3,flocks.length);s++){const A=flocks[s],B=flocks[(s+1)%flocks.length],cx=(A.x+B.x)/2,cz=(A.z+B.z)/2,th=Math.atan2(B.z-A.z,B.x-A.x),
   ra=Math.max(260,Math.hypot(B.x-A.x,B.z-A.z)/2+120),rb=ra*rr(.35,.55);let g=-1e9;
  for(let k=0;k<32;k++){const a=k/32*TAU,x=cx+Math.cos(th)*ra*Math.cos(a)-Math.sin(th)*rb*Math.sin(a),z=cz+Math.sin(th)*ra*Math.cos(a)+Math.cos(th)*rb*Math.sin(a);g=Math.max(g,Y(x,z)+EASTABYSS.canopyH(x,z),BIO.waterH(x,z));}   // over the canopy too
  const S={x:cx,z:cz,th,ra,rb,y:g+rr(30,55),w:rr(13,17)/ra*(rng()<.5?1:-1),a0:rr(0,TAU),n:ri(8,15)};
  for(let b=0;b<S.n;b++){const row=Math.ceil(b/2),side=b%2?1:-1;flyers.push({S,back:row*2.3+rr(-.3,.3),lat:side*row*1.5,dy:rr(-.6,.6),ph:rr(0,TAU),k:rr(.92,1.04),c:tint()});}
  skeins.push(S);}
 st.skeins=skeins.length;st.flying=flyers.length;
 // ---- FRILLED LIZARDS: dry, open ground near the rivers and on the flats' damp edges
 const dry=(x,z)=>BIO.depth(x,z)<-.4&&BIO.mask(x,z)>.5&&BIO.clearOf(x,z,1)&&!blocked(x,z,.4)&&(!fok||fok('frilled_lizard',x,z));
 const lizards=[];
 BIO.grid(70,0,R,(x,z)=>{if(BIO.lodD(x,z)>LOD.mid)return 0;const Z=zones(x,z);
  return clamp(smooth(.3,.8,Z.flow)*(1-Z.marsh*.6)*(1-Z.jung)*.9+Z.flat*smooth(.95,.7,Z.salt)*smooth(.03,.12,Z.wet)*.7,0,1)*.32*q;},(x,y,z)=>{
  if(!dry(x,z))return;const pts=[[x,z]];
  for(let g=0;g<14&&pts.length<3;g++){const a=rr(0,TAU),r=rr(2.5,8),p=[x+Math.cos(a)*r,z+Math.sin(a)*r];if(dry(p[0],p[1])&&legOK(pts[pts.length-1],p,dry,1))pts.push(p);}
  if(pts.length===3&&!legOK(pts[2],pts[0],dry,1))pts.pop();if(pts.length<2)return;
  const stops=pts.map((p,i)=>({i,d:rr(4,22)}));   // basking, then a dash on the hind legs
  lizards.push({W:mkWalker(pts,stops,rr(1.6,2.6),.3,rr(0,700),.2),x,z,k:rr(.85,1.08),c:tint()});},{patch:.3,pad:1});
 st.lizards=lizards.length;
 // ---- the meshes
 const nB=birds.length,nF=flyers.length,nL=lizards.length;
 const mB=nB?BIO.dynamic('flamingo',G.flaBody(),M.body,nB,{label:'Salt-lake flamingos'}):null,
  mN=nB?BIO.dynamic('flamingoneck',G.flaNeck(),M.body,nB,{label:'Salt-lake flamingos'}):null,
  mH=nB?BIO.dynamic('flamingohead',G.flaHead(),M.body,nB,{label:'Salt-lake flamingos'}):null,
  mL=nB?BIO.dynamic('flamingoleg',G.flaLeg(),M.body,nB*2,{label:'Salt-lake flamingos'}):null,
  mF=nF?BIO.dynamic('flamingoflying',G.flaFly(),M.body,nF,{label:'Salt-lake flamingos (flying)'}):null,
  mW=nF?BIO.dynamic('flamingowing',G.flaWing(),M.body,nF*2,{label:'Salt-lake flamingos (flying)'}):null,
  mZ=nL?BIO.dynamic('frilledlizard',G.lizard(),M.body,nL,{label:'Frilled lizards'}):null,
  mR=nL?BIO.dynamic('frill',G.frill(),M.body,nL,{label:'Frilled lizards'}):null;
 [mB,mN,mH,mL,mF,mW,mZ,mR].forEach(m=>{if(m)m.userData.kit=BIO.kitName||'';});   // BIO.dynamic leaves the kit unset: BIO.export({kit}) would drop them
 const o3=new T3.Vector3(),hip=new T3.Vector3();let first=true;
 const flag=(...ms)=>ms.forEach(m=>{if(!m)return;m.instanceMatrix.needsUpdate=true;if(first&&m.instanceColor)m.instanceColor.needsUpdate=true;});
 // t is the BIO clock (BIO.WIND.t: the host's clock() when it binds one, else the core's own)
 BIO.tick(dt=>{const t=BIO.WIND.t.value,E=BIO.eye(),far=(x,z,r)=>!first&&E&&Math.hypot(x-E[0],z-E[2])>r;   // far groups keep their last pose
  // waders: the head eases between down and up over 1.5 s at each change of what the bird is doing
  if(mB)birds.forEach((B,i)=>{if(far(B.F.x,B.F.z,1500))return;const o=walkAt(B.W,t),k=B.k,f=mix(o.e.hp,o.e.hf,smooth(0,1.5,o.tau)),col=first?B.c:null;
   const hd=o.hd+(o.stop?.22*f*Math.sin(t*.55+B.ph)*smooth(0,2,o.u)*smooth(o.stop.d,o.stop.d-2,o.u):0),pt=.18*f;   // a feeding bird sweeps its head side to side
   o3.set(o.x,o.y,o.z);setI(mB,i,o.x,o.y,o.z,pt,hd,0,k,k,k,col);
   const a1=mix(FLA.stand[0],FLA.feed[0],f),a2=mix(FLA.stand[1],FLA.feed[1],f);
   const n0=inBody(o3,hd,pt,k,FLA.neck).clone();setI(mN,i,n0.x,n0.y,n0.z,pt+a1,hd,0,k,k,k,col);
   const n1=inBody(n0,hd,pt+a1,k,[0,FLA.lowL,0]);setI(mH,i,n1.x,n1.y,n1.z,pt+a2,hd,0,k,k,k,col);
   for(let l=0;l<2;l++){hip.copy(inBody(o3,hd,pt,k,FLA.hips[l]));setI(mL,i*2+l,hip.x,hip.y,hip.z,.35*o.vf*Math.sin(o.ph+l*Math.PI),hd,0,k,k*FLA.legLen,k,col);}});
  // skeins: the leader on the ellipse, the rest in the V behind it; wings flap ~0.9 a second
  if(mF)flyers.forEach((F,i)=>{const S=F.S;if(far(S.x,S.z,3000))return;const a=S.a0+S.w*t,ca=Math.cos(a),sa=Math.sin(a),ct=Math.cos(S.th),stt=Math.sin(S.th),sg=Math.sign(S.w);
   const lx=S.x+ct*S.ra*ca-stt*S.rb*sa,lz=S.z+stt*S.ra*ca+ct*S.rb*sa;let tx=(-ct*S.ra*sa-stt*S.rb*ca)*sg,tz=(-stt*S.ra*sa+ct*S.rb*ca)*sg;const L=Math.hypot(tx,tz)||1;tx/=L;tz/=L;
   const x=lx-tx*F.back-tz*F.lat,z=lz-tz*F.back+tx*F.lat,y=S.y+F.dy+.5*Math.sin(t*.4+F.ph),hd=Math.atan2(tx,tz),fl=.55*Math.sin(t*5.6+F.ph),k=F.k,col=first?F.c:null;
   setI(mF,i,x,y,z,0,hd,0,k,k,k,col);setI(mW,i*2,x,y+.04*k,z,0,hd,fl,k,k,k,col);setI(mW,i*2+1,x,y+.04*k,z,0,hd,-fl,-k,k,k,col);});
  // lizards: bask, dash upright on the hind legs; inside ~25 m of the viewer the frill opens, the lizard rears
  // and turns to face it (a function of the viewer's distance, not of the past)
  if(mZ)lizards.forEach((Z,i)=>{if(far(Z.x,Z.z,900))return;const o=walkAt(Z.W,t),k=Z.k,col=first?Z.c:null;
   const dE=E?Math.hypot(E[0]-o.x,E[1]-o.y,E[2]-o.z):1e9,f=smooth(26,16,dE),toE=E?Math.atan2(E[0]-o.x,E[2]-o.z):o.hd;
   const hd=lerpA(o.hd,toE,f*(1-o.vf)),run=o.vf*(o.stop?0:1),pt=-.3*run-.32*f*(1-run),lift=(.13*run+.05*f*(1-run))*k;
   setI(mZ,i,o.x,o.y+lift,o.z,pt,hd,0,k,k,k,col);
   const p=inBody(o3.set(o.x,o.y+lift,o.z),hd,pt,k,[0,.1,.25]);const fs=mix(.4,1,f)*k;
   setI(mR,i,p.x,p.y,p.z,pt+mix(-1.35,-.15,f),hd,0,fs,fs,k,first?_w1:null);});
  flag(mB,mN,mH,mL,mF,mW,mZ,mR);first=false;});
 // ---- the volumes the inspector names, with their tags (the project rule)
 const FT={};EASTABYSS.FAUNA.forEach(f=>FT[f.key]=f.tags);
 flocks.forEach(F=>{let cx=0,cz=0,n=0,r=0,y0=1e9,y1=-1e9;F.birds.forEach(B=>B.W.pts.forEach(p=>{cx+=p[0];cz+=p[1];n++;}));cx/=n;cz/=n;
  F.birds.forEach(B=>{B.W.pts.forEach(p=>r=Math.max(r,Math.hypot(p[0]-cx,p[1]-cz)));for(let k=0;k<B.W.gy.length;k++){y0=Math.min(y0,B.W.gy[k]);y1=Math.max(y1,B.W.gy[k]);}});
  F.x=cx;F.z=cz;F.r=r;BIO.register({name:'Flamingo flock',key:'flamingo',kind:'fauna',x:cx,z:cz,y:y0-2,r:r+3,h:y1-y0+4,tags:FT.flamingo});});
 skeins.forEach(S=>BIO.register({name:'Flamingo skein',key:'flamingo',kind:'fauna',x:S.x,z:S.z,y:S.y-10,r:S.ra+30,h:16,tags:FT.flamingo}));
 lizards.forEach(Z=>{let y0=1e9,y1=-1e9,r=0;Z.W.pts.forEach(p=>r=Math.max(r,Math.hypot(p[0]-Z.x,p[1]-Z.z)));for(let k=0;k<Z.W.gy.length;k++){y0=Math.min(y0,Z.W.gy[k]);y1=Math.max(y1,Z.W.gy[k]);}
  BIO.register({name:'Frilled lizard',key:'frilled_lizard',kind:'fauna',x:Z.x,z:Z.z,y:y0-2,r:r+3,h:y1-y0+4,tags:FT.frilled_lizard});});
 EASTABYSS.FAUNA_LAYOUT={flocks,birds,skeins,flyers,lizards};   // a world's camera may want to find them; the walkers are data
 return{fauna:st};};
})();
BIO.kitEnd(EASTABYSS);   // its exports run in its registry; the default kit is current again (moved here from 70 with the fauna)
