// ================================================================= EASTERN HIGH DESERT — fauna
// The first fauna layer on the biome contract. Four kinds, each placed from
// the same climate fields the flora reads, and animated by the biome itself
// through BIO.tick (the core makes the dynamic instanced meshes, BIO.dynamic):
//   KITES      big broad-winged raptors circling in thermals over the mesas,
//              the butte and the canyon: a few birds per thermal, banked into
//              the turn, climbing and sinking slowly, wingspan 3 m
//   SWIFTS     flocks of small fast birds over the pond and the canyon's water,
//              a flat swarm that never quite settles
//   STRIDERS   long-legged flightless walkers in small bands on the canyon
//              floor and at the pond, pacing the river; sand-coloured, 2.4 m
//   LIZARDS    basking on the floor's boulders (SEDESERT.ROCKS), banded, still
//   DEER       canyon mule deer (2026-10): herds of 3-8 in the riparian strip and at the pond, each
//              walking its own loop between browse points in the bosque and the scrub beside it,
//              head down to browse, up for a glance; bucks carry forked antlers; 1 m at the shoulder
//   COYOTES    (2026-10) singly or in pairs (in file), trotting long loops through the scrub and the
//              canyon floor, pausing to sniff or look round; 0.6 m at the shoulder
// The deer and coyotes are walkers: their pose is a pure function of the clock (walkAt), so a port can
// replay it; their legs are separate instances swinging on the hips (this kit does not load 35-core-anim).
// Tags follow the project rule. No fauna is ever part of a building.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=SEDESERT.PAL,zones=SEDESERT.zones,C=SEDESERT.C,{bright,vary}=SEDESERT;
const T3=BIO.host.THREE;
SEDESERT.FAUNA=[
 {key:'kite',name:'Desert kite',span:[2.6,3.4],tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'both'}},
 {key:'swift',name:'Wadi swift',span:[.6,.8],tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'yes'}},
 {key:'strider',name:'Sand strider',H:[2.0,2.7],tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'both'}},
 {key:'lizard',name:'Rock lizard',L:[.25,.45],tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'no'}},
 {key:'deer',name:'Canyon mule deer',H:[.86,1.1],tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'yes'}},
 {key:'coyote',name:'Coyote',H:[.55,.64],tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'both'}},
];
// ---------------------------------------------------------------- geometries (unit, vertex-coloured)
const G={};
// a gliding bird: a body spindle and two swept wings, span 1 along x, facing +z, vertex-coloured (pale underside)
G.bird=function(){const pos=[],nor=[],col=[];
 const tri=(a,b,c,cc)=>{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;
  [a,b,c].forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(nx/l,ny/l,nz/l);col.push(cc,cc,cc);});};
 const body=[[0,0,.16],[.03,.02,0],[-.03,.02,0],[0,-.03,0],[0,0,-.14]];
 tri(body[0],body[1],body[3],.9);tri(body[0],body[3],body[2],.9);tri(body[0],body[2],body[1],.55);
 tri(body[4],body[3],body[1],.9);tri(body[4],body[2],body[3],.9);tri(body[4],body[1],body[2],.55);
 for(let s=-1;s<=1;s+=2){const root=[s*.03,.02,.03],mid=[s*.28,.04,.0],tip=[s*.5,.0,-.06],back=[s*.2,.02,-.1];
  // top (dark) and underside (pale), both faces
  tri(root,mid,back,.5);tri(mid,tip,back,.5);tri(root,back,mid,.95);tri(mid,back,tip,.95);}
 const tail=[[0,0,-.12],[.06,0,-.24],[-.06,0,-.24]];tri(tail[0],tail[1],tail[2],.6);tri(tail[0],tail[2],tail[1],.9);
 return BIO.geo._make(pos,nor,new Array(pos.length/3*2).fill(0),col);};
// a strider's body: a plump spindle with a long neck and a small head, facing +z, legs are rods
G.striderBody=function(){const g=new T3.SphereGeometry(.5,8,6);g.scale(.55,.6,1);
 const neck=new T3.CylinderGeometry(.06,.1,1.0,5).translate(0,.5,0).rotateX(-.7).translate(0,.4,.4);
 const head=new T3.SphereGeometry(.15,6,5).scale(1,.8,1.6).translate(0,1.12,1.06);
 const parts=[g,neck,head],pos=[],nor=[],col=[];
 parts.forEach((p,i)=>{const q=p.toNonIndexed(),a=q.attributes.position.array,n=q.attributes.normal.array;for(let k=0;k<a.length;k+=3){pos.push(a[k],a[k+1],a[k+2]);nor.push(n[k],n[k+1],n[k+2]);const sh=i===0?(a[k+1]<-.1?.98:.8):.75;col.push(sh,sh,sh);}});
 return BIO.geo._make(pos,nor,new Array(pos.length/3*2).fill(0),col);};
// a lizard: a flat body, a tapering tail, a wedge head; length 1 along +z, banded by vertex colour
G.lizard=function(){const pos=[],nor=[],col=[];const P=[];
 const W=u=>u<.35?.16*Math.sin(u/.35*Math.PI*.5+.4):u<.62?.16:.16*(1-(u-.62)/.38);
 const H=u=>u<.62?.07:.07*(1-(u-.62)/.38)+.005;
 const n=12;for(let i=0;i<=n;i++){const u=i/n,z=u-.45,w=W(u),h=H(u),band=(i%3===0)?.55:1;P.push([[-w,0,z,band],[0,h,z,band*1.1],[w,0,z,band]]);}
 const push=(p,nn)=>{pos.push(p[0],p[1],p[2]);nor.push(nn[0],nn[1],nn[2]);col.push(p[3],p[3],p[3]);};
 for(let i=0;i<n;i++){const a=P[i],b=P[i+1];for(let s=0;s<2;s++){const a0=a[s],a1=a[s+1],b0=b[s],b1=b[s+1],nn=s===0?[-.6,.8,0]:[.6,.8,0];push(a0,nn);push(b1,nn);push(b0,nn);push(a0,nn);push(a1,nn);push(b1,nn);}}
 for(let k=0;k<4;k++){const s=k<2?-1:1,z=k%2?.05:-.25,leg=[[s*.1,.03,z,.7],[s*.3,.0,z-.06*s,.7],[s*.3,.0,z+.06,.7]];push(leg[0],[0,1,0]);push(leg[1],[0,1,0]);push(leg[2],[0,1,0]);}
 return BIO.geo._make(pos,nor,new Array(pos.length/3*2).fill(0),col);};
// ---------------------------------------------------------------- materials
const M={
 bird:BIO.leafMat(null,'fauna-bird',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 body:BIO.leafMat(null,'fauna-body',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 solid:BIO.solidMat(null,0xffffff),
};
BIO.def('lizard',G.lizard(),M.body,{label:'Rock lizards'});
// ---------------------------------------------------------------- walkers: a pose that is a function of the clock (2026-10)
// The deer and the coyotes are WALKERS: each goes round a closed polyline at a trapezoid speed (it eases
// out of and into each stop) and stands at some of its vertices for a while. walkAt(W,t,back) gives the
// pose at clock t (the BIO clock, BIO.WIND.t) as a pure function of t: nothing is integrated frame to frame, so any frame rate, or a
// port replaying the clock (biomes/GODOT.md), lands on the same pose. `back` puts a follower that many
// metres behind on the same path: it moves and stops with its leader. The ground under the path is
// sampled once at build (W.gy, about every metre), so a frame calls no terrainH.
const wrapA=a=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;},lerpA=(a,b,u)=>a+wrapA(b-a)*u;
function wSeg(W,s){const c=W.cum;let lo=0,hi=W.pts.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(c[m]<=s)lo=m;else hi=m-1;}return lo;}
function wAt(W,s){s=((s%W.L)+W.L)%W.L;const i=wSeg(W,s),n=W.pts.length,a=W.pts[i],b=W.pts[(i+1)%n],l=W.cum[i+1]-W.cum[i],u=l>0?(s-W.cum[i])/l:0;return[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];}
function wY(W,s){s=((s%W.L)+W.L)%W.L;const f=s/W.ds,k=Math.min(Math.floor(f),W.gy.length-2),u=f-k;return W.gy[k]+(W.gy[k+1]-W.gy[k])*u;}
// heading along the path; a corner is eased over rc metres (a walker eases only the corners it does not stop at)
function wHd(W,s,all,rc){s=((s%W.L)+W.L)%W.L;const n=W.pts.length,i=wSeg(W,s),c=W.cum,a=s-c[i],b=c[i+1]-s;
 if(a<rc&&(all||!W.isStop[i]))return lerpA(W.dir[(i+n-1)%n],W.dir[i],smooth(-rc,rc,a));
 if(b<rc&&(all||!W.isStop[(i+1)%n]))return lerpA(W.dir[i],W.dir[(i+1)%n],smooth(-rc,rc,-b));
 return W.dir[i];}
// pts [[x,z]...] a closed loop; stops [{i,d,...}] sorted by vertex; v the cruising speed (m/s); ta the ease (s);
// off the walker's clock offset (s); hs the half-stride (m): the gait phase is pi per half-stride, rounded so the
// loop holds whole strides and the phase never jumps at the wrap
function mkWalker(pts,stops,v,ta,off,hs){const n=pts.length,cum=[0],dir=[];
 for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];cum.push(cum[i]+Math.hypot(b[0]-a[0],b[1]-a[1]));dir.push(Math.atan2(b[0]-a[0],b[1]-a[1]));}
 const L=cum[n],N=Math.max(2,Math.ceil(L)),W={pts,cum,dir,L,ds:L/N,gy:new Float32Array(N+1),stops,v,off,tl:[],P:0,hs:L/(2*Math.max(1,Math.round(L/(2*hs)))),isStop:new Uint8Array(n)};
 for(let k=0;k<=N;k++){const p=wAt(W,k*W.ds);W.gy[k]=BIO.terrainH(p[0],p[1]);}
 stops.forEach(S=>W.isStop[S.i]=1);
 let t0=0;
 if(!stops.length){W.tl.push({run:1,s0:0,Lr:L,D:L/v,ta:0,t0:0});t0=L/v;}
 else for(let k=0;k<stops.length;k++){const S=stops[k],S2=stops[(k+1)%stops.length];
  W.tl.push({run:0,s0:cum[S.i],D:S.d,t0,stop:S,hIn:dir[(S.i+n-1)%n],hOut:dir[S.i]});t0+=S.d;
  let Lr=cum[S2.i]-cum[S.i];if(Lr<=0)Lr+=L;const te=Math.min(ta,Lr/v),D=Lr/v+te;
  W.tl.push({run:1,s0:cum[S.i],Lr,D,ta:te,t0});t0+=D;}
 W.P=t0;return W;}
// the pose at clock t: {x,z,y (the ground), s, hd (heading), vf (0..1 of the cruising speed), stop, u (s into it), ph (gait)}
function walkAt(W,t,back,rc){let r=(t+W.off)%W.P;if(r<0)r+=W.P;
 let e=W.tl[0];for(let k=1;k<W.tl.length&&W.tl[k].t0<=r;k++)e=W.tl[k];
 const tau=r-e.t0,o={stop:null,u:0,vf:0,s:0,hd:0};
 if(!e.run){o.stop=e.stop;o.u=tau;o.s=e.s0;const d=e.D,tt=Math.min(1.5,d*.4);o.hd=lerpA(e.hIn,e.hOut,smooth(d-tt,d,tau));}
 else{const v=W.v,ta=e.ta;let s;
  if(ta<=0){s=v*tau;o.vf=1;}else if(tau<ta){s=v*tau*tau/(2*ta);o.vf=tau/ta;}
  else if(tau>e.D-ta){const k=e.D-tau;s=e.Lr-v*k*k/(2*ta);o.vf=k/ta;}else{s=v*(tau-ta/2);o.vf=1;}
  o.s=e.s0+s;o.hd=wHd(W,o.s,false,rc);}
 if(back){o.s-=back;o.hd=wHd(W,o.s,true,rc);}
 const p=wAt(W,o.s);o.x=p[0];o.z=p[1];o.y=wY(W,o.s);o.ph=Math.PI*o.s/W.hs;return o;}
// the body's pitch from the ground along the path, half-length e
const wPitch=(W,s,e)=>clamp(-Math.atan2(wY(W,s+e)-wY(W,s-e),2*e),-.3,.3);
// ---------------------------------------------------------------- quadrupeds: deer and coyotes (2026-10)
// Four dynamic meshes an animal kind (body, head on its neck, legs, the bucks' antlers), every part
// posed from the walker's pose: the head swings on its neck pivot about the body's x (positive is
// down), each leg on its hip, diagonal pairs in step (a walk or a trot), the swing scaled by the speed.
// Bodies face +z, the ground at y=0, units metres at scale 1.
const _c=new T3.Color();
function asm(parts){const pos=[],nor=[],col=[];
 parts.forEach(p=>{const g=p.g.index?p.g.toNonIndexed():p.g,a=g.attributes.position.array,b=g.attributes.normal.array;
  for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);nor.push(b[i],b[i+1],b[i+2]);
   _c.set(typeof p.c==='function'?p.c(a[i],a[i+1],a[i+2]):p.c).convertSRGBToLinear();col.push(_c.r,_c.g,_c.b);}});
 return BIO.geo._make(pos,nor,new Array(pos.length/3*2).fill(0),col);}
const ell=(rx,ry,rz,x,y,z,ws,hs,rotx,rotz)=>{const g=new T3.SphereGeometry(1,ws||8,hs||6);g.scale(rx,ry,rz);if(rotx)g.rotateX(rotx);if(rotz)g.rotateZ(rotz);g.translate(x,y,z);return g;};
// an open tube from a (radius r0) to b (radius r1)
const tube=(a,b,r0,r1,seg)=>{const d=new T3.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=d.length(),g=new T3.CylinderGeometry(r1,r0,L,seg||5,1,true);g.translate(0,L/2,0);
 g.applyMatrix4(new T3.Matrix4().makeRotationFromQuaternion(new T3.Quaternion().setFromUnitVectors(new T3.Vector3(0,1,0),d.normalize())));g.translate(a[0],a[1],a[2]);return g;};
// a leg: hip at y=0, the hoof or paw at y=-1 (scaled by the leg's length), tapered, hooves dark
const legGeo=(r0,r1,up,low,foot)=>{const g=new T3.CylinderGeometry(r0,r1,1,5,3,true);g.translate(0,-.5,0);return asm([{g,c:(x,y,z)=>y<-.93?foot:y<-.45?low:up}]);};
const DEER_C={tan:0x8a6c4c,belly:0xd2c2a2,rump:0xe4dac6,face:0x75604a,muz:0xcfc4b0,dark:0x18130f,antler:0xd6cab0};
G.deerBody=function(){const K=DEER_C,coat=(x,y,z)=>z<-.36&&y>.66?K.rump:y<.69?K.belly:K.tan;
 return asm([{g:ell(.19,.21,.5,0,.83,0,10,7),c:coat},{g:ell(.16,.19,.21,0,.87,.3,8,5),c:(x,y,z)=>y<.73?K.belly:K.tan},
  {g:tube([0,.9,-.47],[0,.79,-.6],.04,.03,4),c:(x,y,z)=>y<.83?K.dark:K.rump}]);};
// the head on its neck: the pivot (0,0,0) is the neck's root, at DEER.neck in the body
G.deerHead=function(){const K=DEER_C,ear=s=>{const g=new T3.SphereGeometry(1,6,4);g.scale(.085,.045,.012);g.rotateZ(s*.45);g.translate(s*.1,.53,.3);return{g,c:K.tan};};
 return asm([{g:tube([0,-.07,-.05],[0,.41,.28],.1,.065,6),c:K.tan},{g:ell(.07,.08,.13,0,.44,.36,7,5,.5),c:K.face},
  {g:ell(.045,.05,.08,0,.385,.46,6,4,.5),c:K.muz},{g:ell(.024,.02,.02,0,.355,.525,4,3),c:K.dark},ear(1),ear(-1)]);};
// a mule deer's antlers: a beam that forks, and forks again
G.deerAntler=function(){const K=DEER_C,P=[];
 for(const s of [1,-1]){const b0=[s*.035,.52,.33],b1=[s*.12,.66,.3],b2=[s*.2,.74,.37],b3=[s*.16,.79,.24],b4=[s*.25,.86,.43],b5=[s*.23,.88,.33],b6=[s*.19,.92,.21],b7=[s*.13,.9,.27];
  [[b0,b1,.02,.016],[b1,b2,.016,.012],[b1,b3,.016,.012],[b2,b4,.012,.006],[b2,b5,.012,.006],[b3,b6,.012,.006],[b3,b7,.011,.006]].forEach(e=>P.push({g:tube(e[0],e[1],e[2],e[3],3),c:K.antler}));}
 return asm(P);};
G.deerLeg=()=>legGeo(.034,.018,DEER_C.tan,0x6e5840,DEER_C.dark);
const COY_C={grey:0x8e7e68,back:0x5c5042,belly:0xcfc1a6,muz:0xbcad92,dark:0x1c1814};
G.coyBody=function(){const K=COY_C,coat=(x,y,z)=>y>.6?K.back:y<.43?K.belly:K.grey;
 return asm([{g:ell(.12,.14,.34,0,.5,0,9,6),c:coat},{g:ell(.11,.14,.15,0,.52,.21,7,5),c:coat},
  {g:tube([0,.54,-.3],[0,.28,-.5],.04,.066,5),c:(x,y,z)=>y<.34?K.dark:K.grey}]);};
G.coyHead=function(){const K=COY_C,ear=s=>{const g=new T3.CylinderGeometry(0,.032,.085,4,1,true);g.rotateZ(-s*.25);g.translate(s*.042,.245,.13);return{g,c:K.back};};
 return asm([{g:tube([0,-.06,-.04],[0,.12,.12],.075,.055,6),c:K.grey},{g:ell(.07,.065,.09,0,.15,.16,7,5),c:K.grey},
  {g:tube([0,.13,.22],[0,.105,.345],.042,.018,5),c:K.muz},{g:ell(.016,.014,.014,0,.104,.348,4,3),c:K.dark},ear(1),ear(-1)]);};
G.coyLeg=()=>legGeo(.024,.013,COY_C.grey,0x9a8a72,COY_C.dark);
// the rigs: hips [front L, front R, hind L, hind R] and the neck's root in the body, the leg length, the
// swing (rad) and the bob (m) at full speed
const DEER={hips:[[.085,.78,.33],[-.085,.78,.33],[.085,.8,-.34],[-.085,.8,-.34]],neck:[0,.95,.36],legLen:.8,amp:.34,bob:.02};
const COY={hips:[[.06,.47,.22],[-.06,.47,.22],[.06,.48,-.24],[-.06,.48,-.24]],neck:[0,.56,.27],legLen:.48,amp:.5,bob:.035};
const _w1=new T3.Color(1,1,1),_m4=new T3.Matrix4(),_p3=new T3.Vector3(),_q1=new T3.Quaternion(),_q2=new T3.Quaternion(),_eu=new T3.Euler(),_s3=new T3.Vector3(),_v3=new T3.Vector3();
// pose animal i of rig R (its meshes in R.body, R.head, R.legs, R.ant) from walker pose o at size k, the head
// angle `head`; col (linear) on the first frame; ai the antler instance (-1: none). Legs stay plumb on a slope.
function rigPose(R,i,o,k,head,col,ai){const hd=o.hd,pt=o.pt||0,sw=R.amp*o.vf,y=o.y+R.bob*k*o.vf*Math.abs(Math.sin(o.ph));
 _eu.set(pt,hd,0,'YXZ');_q1.setFromEuler(_eu);_p3.set(o.x,y,o.z);_s3.set(k,k,k);_m4.compose(_p3,_q1,_s3);R.body.setMatrixAt(i,_m4);if(col)R.body.setColorAt(i,col);
 _v3.set(R.neck[0]*k,R.neck[1]*k,R.neck[2]*k).applyQuaternion(_q1);_eu.set(pt+head,hd,0,'YXZ');_q2.setFromEuler(_eu);
 _p3.set(o.x+_v3.x,y+_v3.y,o.z+_v3.z);_m4.compose(_p3,_q2,_s3);R.head.setMatrixAt(i,_m4);if(col)R.head.setColorAt(i,col);
 if(R.ant&&ai>=0){R.ant.setMatrixAt(ai,_m4);if(col)R.ant.setColorAt(ai,_w1);}   // every mesh on M.body needs instance colours (one program for all of them)
 _s3.set(k,k*R.legLen,k);
 for(let l=0;l<4;l++){const H=R.hips[l],a=sw*Math.sin(o.ph+(l===0||l===3?0:Math.PI));
  _v3.set(H[0]*k,H[1]*k,H[2]*k).applyQuaternion(_q1);_eu.set(a,hd,0,'YXZ');_q2.setFromEuler(_eu);
  _p3.set(o.x+_v3.x,y+_v3.y,o.z+_v3.z);_m4.compose(_p3,_q2,_s3);R.legs.setMatrixAt(i*4+l,_m4);if(col)R.legs.setColorAt(i*4+l,col);}}
// the head: `base` while walking; at a stop it eases to `down` (browsing, sniffing) and, for a glance
// (stop.ga, stop.gd: when and how long), up to `alert`
function headAt(o,base,down,alert,ramp){if(!o.stop)return base;const S=o.stop,u=o.u,d=S.d,dn=smooth(0,ramp,u)*smooth(d,d-ramp*1.2,u);
 const g=S.gd?smooth(S.ga-.5,S.ga,u)*smooth(S.ga+S.gd+.5,S.ga+S.gd,u):0,tgt=S.look?alert:down+(alert-down)*g;return base+(tgt-base)*dn;}
// ---------------------------------------------------------------- the pass
// Static fauna is put like any item; the moving kinds are laid out here and
// driven by one tick.
SEDESERT.buildFauna=function(R,q,keep){
 reseed(700021);q=q==null?1:q;R=R||3000;const T=T3,st={kites:0,swifts:0,striders:0,lizards:0,thermals:0,flocks:0,bands:0};
 const LOD=BIO.LOD(),Y=(x,z)=>BIO.terrainH(x,z);
 // ---- lizards: on the boulders the floor left, where the ground is dry and rocky
 SEDESERT.ROCKS.forEach(r=>{if(rng()>.28*q)return;const Z=zones(r[0],r[2]);if(Z.scrub+Z.bad+Z.rim+Z.mtn<.3)return;
  const L=rr(.25,.45),c=bright(vary(pick([0x8a7a5a,0x9a8a6a,0x6a5a4a,0xa0805a]),.03,.1,.06),1.1);
  BIO.put('lizard',[r[0]+rr(-.3,.3)*r[3],r[1],r[2]+rr(-.3,.3)*r[3]],qEuler(0,rr(0,TAU),0),[L,L,L],c);st.lizards++;});
 // ---- kites: thermals over high ground, the canyon and the butte, a few birds each
 const therm=[];
 BIO.grid(380,0,R,(x,z)=>{if(BIO.lodD(x,z)>LOD.far)return 0;const Z=zones(x,z);return (Z.rim*.8+Z.bad*.5+Z.up*1.2+Z.scrub*.15)*q;},(x,y,z)=>{
  therm.push({x,z,y0:y+rr(60,140),r:rr(40,90),n:ri(2,5),w:rr(.12,.2)*(rng()<.5?1:-1),ph:rr(0,TAU),climb:rr(20,45)});},{patch:.3,pad:0,noMask:true});
 const kites=[];therm.forEach(t=>{for(let i=0;i<t.n;i++)kites.push({t,a:rr(0,TAU),dr:rr(.8,1.15),dy:rr(-8,8),span:rr(2.6,3.4),ph:rr(0,TAU)});st.thermals++;});
 st.kites=kites.length;
 // ---- swifts: flocks over the pond and the river's water
 const flocks=[];
 BIO.grid(90,0,R,(x,z)=>{if(BIO.lodD(x,z)>LOD.mid)return 0;const Z=zones(x,z);return (Z.oasis*.9+Z.bank*.7)*q;},(x,y,z)=>{
  flocks.push({x,z,y0:BIO.waterH(x,z)>-1e8?BIO.waterH(x,z)+rr(6,14):y+rr(6,14),n:ri(14,30),r:rr(18,40),ph:rr(0,TAU),w:rr(.5,.9)});},{patch:.4,pad:0,noMask:true,depth:[-3,3],box:BIO.window('water')});
 const swifts=[];flocks.forEach(f=>{for(let i=0;i<f.n;i++)swifts.push({f,p:rr(0,TAU),q:rr(0,TAU),k:rr(.7,1.3),span:rr(.6,.8)});st.flocks++;});
 st.swifts=swifts.length;
 // ---- striders: bands on the canyon floor and at the pond, walking the river's way and back
 const bands=[];
 BIO.grid(110,0,R,(x,z)=>{if(BIO.lodD(x,z)>LOD.mid)return 0;const Z=zones(x,z);return (Z.rip*.6+Z.oasis*.5)*q*smooth(.4,.15,Z.slope);},(x,y,z)=>{
  bands.push({x,z,n:ri(4,9),ph:rr(0,TAU),dir:rr(0,TAU),len:rr(40,80),sp:rr(.9,1.4)});},{patch:.2,pad:3});
 const striders=[];bands.forEach(b=>{for(let i=0;i<b.n;i++)striders.push({b,ox:rr(-9,9),oz:rr(-9,9),H:rr(2.0,2.7),ph:rr(0,TAU),c:bright(vary(pick([0xa88858,0x987848,0xb09060,0x8a6a40]),.02,.08,.05),.9).convertSRGBToLinear()});st.bands++;});   // an instance colour is LINEAR (BIO.put converts; a dynamic mesh must itself)
 st.striders=striders.length;
 // ---- the dynamic meshes
 const kiteM=kites.length?BIO.dynamic('kite',G.bird(),M.bird,kites.length,{label:'Desert kites'}):null;
 const swiftM=swifts.length?BIO.dynamic('swift',G.bird(),M.bird,swifts.length,{label:'Wadi swifts'}):null;
 const bodyM=striders.length?BIO.dynamic('strider',G.striderBody(),M.body,striders.length,{label:'Sand striders'}):null;
 const legM=striders.length?BIO.dynamic('striderleg',BIO.geo.rod(5),M.solid,striders.length*2,{label:'Sand striders'}):null;
 const m=new T.Matrix4(),p=new T.Vector3(),qq=new T.Quaternion(),s=new T.Vector3(),e=new T.Euler(),c=new T.Color();
 const setI=(im,i,x,y,z,rx,ry,rz,sx,sy,sz,col)=>{p.set(x,y,z);e.set(rx,ry,rz,'YXZ');qq.setFromEuler(e);s.set(sx,sy,sz);m.compose(p,qq,s);im.setMatrixAt(i,m);if(col)im.setColorAt(i,col);};
 const kiteCol=C(0x4a3a2c).convertSRGBToLinear(),swiftCol=C(0x3a3a3c).convertSRGBToLinear();
 // the first frame lays everyone out; the colours are set once
 let first=true;
 BIO.tick((dt,t)=>{
  if(kiteM){kites.forEach((k,i)=>{const th=k.t,a=k.a+t*th.w,r=th.r*k.dr,x=th.x+Math.cos(a)*r,z=th.z+Math.sin(a)*r,y=th.y0+k.dy+th.climb*Math.sin(t*.05+k.ph);
   const sg=Math.sign(th.w),heading=Math.atan2(-Math.sin(a)*sg,Math.cos(a)*sg);   // along the circle's tangent
   setI(kiteM,i,x,y,z,.06*Math.sin(t*.7+k.ph),heading,-.45*sg,k.span,k.span,k.span,first?kiteCol:null);});kiteM.instanceMatrix.needsUpdate=true;if(first)kiteM.instanceColor.needsUpdate=true;}
  if(swiftM){swifts.forEach((w,i)=>{const f=w.f,u=t*f.w*w.k,x=f.x+Math.cos(u+w.p)*f.r*Math.sin(u*.37+w.q),z=f.z+Math.sin(u*1.13+w.q)*f.r*.8,y=f.y0+4*Math.sin(u*1.7+w.p)+2*Math.cos(u*.6);
   const vx=-Math.sin(u+w.p)*f.r*Math.sin(u*.37+w.q),vz=Math.cos(u*1.13+w.q)*f.r*.8,heading=Math.atan2(vx,vz);
   setI(swiftM,i,x,y,z,0,heading,.3*Math.sin(u*2+w.p),w.span,w.span,w.span,first?swiftCol:null);});swiftM.instanceMatrix.needsUpdate=true;if(first)swiftM.instanceColor.needsUpdate=true;}
  if(bodyM){striders.forEach((sd,i)=>{const b=sd.b,u=(t*b.sp+sd.ph*20)%(b.len*2),along=u<b.len?u:b.len*2-u,fwd=u<b.len?1:-1;
   const x=b.x+Math.cos(b.dir)*(along-b.len/2)+sd.ox,z=b.z+Math.sin(b.dir)*(along-b.len/2)+sd.oz,g=Y(x,z),legH=sd.H*.5,step=t*b.sp*2.4+sd.ph,bob=.06*Math.abs(Math.sin(step));
   const heading=Math.atan2(Math.cos(b.dir)*fwd,Math.sin(b.dir)*fwd),y=g+legH+bob;
   setI(bodyM,i,x,y,z,0,heading,0,sd.H*.62,sd.H*.62,sd.H*.62,first?sd.c:null);
   const dz=Math.sin(step)*.35,cd=Math.cos(heading),sn=Math.sin(heading);
   for(let l=0;l<2;l++){const sg=l?1:-1,swing=dz*sg,lx=x+cd*.18*sg*-1+sn*swing*legH,lz=z-sn*.18*sg*-1+cd*swing*legH;
    setI(legM,i*2+l,(x+lx)/2,g+legH*.55,(z+lz)/2,swing*.9,heading,0,.11,legH*1.1,.11,first?sd.c:null);}});   // the swing is fore-aft: about the local x
   bodyM.instanceMatrix.needsUpdate=true;legM.instanceMatrix.needsUpdate=true;if(first){bodyM.instanceColor.needsUpdate=true;legM.instanceColor.needsUpdate=true;}}
  first=false;});
 // ---- deer and coyotes (2026-10): walkers (above) on dry, gentle, unmasked ground; the draws come after
 // every older kind's, so the kites, swifts, striders and lizards lie exactly where they did
 const fok=typeof keep==='function'?keep:null;   // the host's own filter, (kind,x,z)->bool (BIOME-API.md)
 const dryOK=(x,z,Z)=>BIO.depth(x,z)<-.3&&Z.slope<.45&&BIO.mask(x,z)>.5&&BIO.clearOf(x,z,2)&&!SEDESERT.blocked(x,z,.6);   // not through a trunk
 const deerOK=(x,z)=>{const Z=zones(x,z);return Z.rip+Z.oasis+Z.bank*.5+Z.scrub*.6+Z.bench*.3>.3&&dryOK(x,z,Z)&&(!fok||fok('deer',x,z));};
 const coyOK=(x,z)=>{const Z=zones(x,z);return Z.scrub+Z.rip+Z.bad*.6+Z.oasis+Z.bench*.4>.25&&dryOK(x,z,Z)&&(!fok||fok('coyote',x,z));};
 // a leg is walkable: every 3 m on it passes, and it climbs no steeper than 1 in 2.5
 const legOK=(a,b,ok)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/3);if(Math.abs(BIO.placeH(b[0],b[1])-BIO.placeH(a[0],a[1]))>L*.4)return false;   // a decision: on placeH (core/biome head)
  for(let i=1;i<n;i++){const u=i/n;if(!ok(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u))return false;}return true;};
 const tint=()=>{const c=new T.Color(1,1,1);c.offsetHSL(rr(-.012,.012),rr(-.05,.03),rr(-.07,.05));return c.convertSRGBToLinear();};
 // ---- DEER: herds of 3-8 in the canyon's riparian strip and at the pond, browsing between points in
 // the bosque and the scrub beside it; each deer walks its own loop through the herd's browse points
 const herds=[],deer=[];
 BIO.grid(170,0,R,(x,z)=>{if(BIO.lodD(x,z)>LOD.mid)return 0;const Z=zones(x,z);return (Z.rip*.8+Z.oasis*.9+Z.bank*.3)*q*smooth(.45,.2,Z.slope);},(x,y,z)=>{
  if(!deerOK(x,z))return;const pool=[[x,z]];
  for(let k=0;k<70&&pool.length<9;k++){const a=rr(0,TAU),r=rr(5,34),px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
   if(!deerOK(px,pz)||pool.some(p=>Math.hypot(p[0]-px,p[1]-pz)<5))continue;pool.push([px,pz]);}
  if(pool.length<4)return;
  const H={x,z,pool,deer:[]},n=ri(3,8);
  for(let j=0;j<n;j++){const want=ri(3,5),path=[pick(pool)];
   for(let g=0;g<30&&path.length<want;g++){const p=pick(pool),l=path[path.length-1];if(path.indexOf(p)>=0||!legOK(l,p,deerOK))continue;path.push(p);}
   while(path.length>2&&!legOK(path[path.length-1],path[0],deerOK))path.pop();
   if(path.length<2)continue;
   const stops=path.map((p,i)=>{const d=rr(7,18),S={i,d};if(rng()<.6){S.ga=rr(.25,.55)*d;S.gd=rr(1.5,3);if(S.ga+S.gd+.6>d-1.6)delete S.gd;}return S;});
   const buck=rng()<.3,W=mkWalker(path.map(p=>[p[0],p[1]]),stops,rr(.45,.75),.8,rr(0,600),.55);
   const d={W,H,buck,k:buck?rr(1.0,1.1):rr(.86,.97),c:tint()};H.deer.push(d);deer.push(d);}
  if(H.deer.length)herds.push(H);},{patch:.2,pad:4});
 st.herds=herds.length;st.deer=deer.length;
 // ---- COYOTES: singly or in pairs, trotting long loops through the scrub and the canyon floor and
 // pausing at some of the corners to sniff or to look round; a pair travels in file
 const packs=[],coys=[];
 BIO.grid(800,0,R,(x,z)=>{if(BIO.lodD(x,z)>LOD.mid)return 0;const Z=zones(x,z);return (Z.scrub*.5+Z.rip*.7+Z.bad*.3+Z.oasis*.4)*q*.8*smooth(.45,.2,Z.slope);},(x,y,z)=>{
  const n=ri(5,8),R0=rr(70,190),a0=rr(0,TAU),pts=[];
  for(let j=0;j<n;j++){let ok=null;for(let g=0;g<6&&!ok;g++){const a=a0+j/n*TAU+rr(-.25,.25),r=R0*rr(.55,1.1)*(1-g*.12),px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
    if(!coyOK(px,pz)||(pts.length&&!legOK(pts[pts.length-1],[px,pz],coyOK)))continue;ok=[px,pz];}
   if(ok)pts.push(ok);}
  while(pts.length>3&&!legOK(pts[pts.length-1],pts[0],coyOK))pts.pop();
  if(pts.length<4||!legOK(pts[pts.length-1],pts[0],coyOK))return;
  const stops=[];pts.forEach((p,i)=>{if(rng()<.45)stops.push({i,d:rr(2.5,8),look:rng()<.45});});if(!stops.length)stops.push({i:0,d:rr(3,6),look:true});
  const W=mkWalker(pts,stops,rr(2.0,2.8),.6,rr(0,1000),.5),m=rng()<.45?2:1,P={x,z,W,n:m};
  for(let j=0;j<m;j++)coys.push({W,P,back:j?rr(5,8):0,k:rr(.92,1.06),c:tint()});
  packs.push(P);},{patch:.2,pad:4});
 st.packs=packs.length;st.coyotes=coys.length;
 // ---- their meshes and their tick (the older kinds' tick above is untouched)
 let nB=0;deer.forEach(d=>d.ai=d.buck?nB++:-1);
 const DR=deer.length?Object.assign({body:BIO.dynamic('deer',G.deerBody(),M.body,deer.length,{label:'Canyon mule deer'}),
   head:BIO.dynamic('deerhead',G.deerHead(),M.body,deer.length,{label:'Canyon mule deer'}),
   ant:nB?BIO.dynamic('deerantler',G.deerAntler(),M.body,nB,{label:'Canyon mule deer (buck)'}):null,
   legs:BIO.dynamic('deerleg',G.deerLeg(),M.body,deer.length*4,{label:'Canyon mule deer'})},DEER):null;
 const CY=coys.length?Object.assign({body:BIO.dynamic('coyote',G.coyBody(),M.body,coys.length,{label:'Coyotes'}),
   head:BIO.dynamic('coyotehead',G.coyHead(),M.body,coys.length,{label:'Coyotes'}),ant:null,
   legs:BIO.dynamic('coyoteleg',G.coyLeg(),M.body,coys.length*4,{label:'Coyotes'})},COY):null;
 [DR,CY].forEach(Rg=>Rg&&[Rg.body,Rg.head,Rg.legs,Rg.ant].forEach(m=>{if(m)m.userData.kit=BIO.kitName||'';}));   // BIO.dynamic leaves the kit unset: BIO.export({kit}) would drop them
 const FAR2=1600*1600;let first2=true;
 const flag=Rg=>{for(const m of [Rg.body,Rg.head,Rg.legs,Rg.ant])if(m){m.instanceMatrix.needsUpdate=true;if(first2&&m.instanceColor)m.instanceColor.needsUpdate=true;}};
 // t is the BIO clock (BIO.WIND.t: the host's clock() when it binds one, else the core's own), the one the
 // foliage sways to, so one world clock drives both and a port replays the same poses from it
 BIO.tick(dt=>{const t=BIO.WIND.t.value,E=BIO.eye(),far=(x,z)=>!first2&&E&&(x-E[0])*(x-E[0])+(z-E[2])*(z-E[2])>FAR2;   // past 1.6 km a herd keeps its last pose
  if(DR){deer.forEach((d,i)=>{if(far(d.H.x,d.H.z))return;const o=walkAt(d.W,t,0,.8);o.pt=wPitch(d.W,o.s,.42*d.k);
    rigPose(DR,i,o,d.k,headAt(o,.22,1.85,-.3,1.3),first2?d.c:null,d.ai);});flag(DR);}
  if(CY){coys.forEach((c,i)=>{if(far(c.P.x,c.P.z))return;const o=walkAt(c.W,t,c.back,1.5);o.pt=wPitch(c.W,o.s,.3*c.k);
    rigPose(CY,i,o,c.k,headAt(o,.3,1.1,-.25,.7),first2?c.c:null,-1);});flag(CY);}
  first2=false;});
 // the volumes the inspector names, and the tags (the project rule) on each
 const FT={};SEDESERT.FAUNA.forEach(f=>FT[f.key]=f.tags);
 const span=(Ws,ptsOf)=>{let cx=0,cz=0,n=0;Ws.forEach(W=>ptsOf(W).forEach(p=>{cx+=p[0];cz+=p[1];n++;}));cx/=n;cz/=n;let r=0,y0=1e9,y1=-1e9;
  Ws.forEach(W=>{ptsOf(W).forEach(p=>r=Math.max(r,Math.hypot(p[0]-cx,p[1]-cz)));for(let k=0;k<W.gy.length;k++){y0=Math.min(y0,W.gy[k]);y1=Math.max(y1,W.gy[k]);}});return{x:cx,z:cz,r,y0,y1};};
 herds.forEach(H=>{const s=span(H.deer.map(d=>d.W),W=>W.pts);H.x=s.x;H.z=s.z;H.r=s.r;
  BIO.register({name:'Mule deer herd',key:'deer',kind:'fauna',x:s.x,z:s.z,y:s.y0-3,r:s.r+5,h:s.y1-s.y0+8,tags:FT.deer});});
 packs.forEach(P=>{const s=span([P.W],W=>W.pts);P.x=s.x;P.z=s.z;P.r=s.r;
  BIO.register({name:P.n>1?'Coyotes (a pair)':'Coyote',key:'coyote',kind:'fauna',x:s.x,z:s.z,y:s.y0-3,r:s.r+5,h:s.y1-s.y0+8,tags:FT.coyote});});
 SEDESERT.FAUNA_LAYOUT={thermals:therm,flocks:flocks,bands:bands,herds:herds,packs:packs,deer:deer,coyotes:coys};   // a world's camera may want to find them
 therm.forEach(t=>BIO.register({name:'Kite thermal',x:t.x,z:t.z,y:t.y0-60,r:t.r*1.2+6,h:t.climb+80}));
 bands.forEach(b=>BIO.register({name:'Sand striders',x:b.x,z:b.z,y:Y(b.x,b.z)-4,r:b.len/2+14,h:10}));
 return{fauna:st};};
})();
BIO.kitEnd(SEDESERT);   // its exports run in its registry; the default kit is current again
