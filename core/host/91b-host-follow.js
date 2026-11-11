// ================================================================= CORE HOST — the follow camera: a spring arm on a distance query (V)
// [web] core/host/91b-host-follow.js (core/host/UNDERGROUND.md; kits/tungang/PLAN.md section 6.3, view 1). OPT-IN BY FILE: a build
// lists it (host.py UNDERGROUND) and hands the take a distance query, so a page without it draws exactly as before. It sorts after
// 91-host-loop.js because it is a taker (K.onTake) and wraps the camera the loop made.
//
//   KHOST.take({..., solid: (x, y, z) => signed distance to anything solid (positive in the open),
//               follow: {dist: 4, r: .3, lift: .15, shoulder: .45, key: 'v', avatar: true | Object3D | false, on: false,
//                        dwell: .4, brief: .15, out: 2.5, pull: 20, fp: .6, shoulderAt: 1.2, ceil: 10, min: .25, minDist: 1.5, maxDist: 12}})
//   KHOST.follow.enable({solid, ...follow})   the same after the take (a station that adds it in a later fragment)
//   KHOST.follow.set(on) / .on / .S {L, want, mode, hc, elevMax, free, blk} / .clearance() (the query at the camera now)
//   KHOST.solidFrom({cavern, walk, ground, thin: ['thin'], r: 24})   a query from what the page has: KCAVERN's C.sdf (exact, counts
//     ceilings and overhangs), core/walk's blocks as boxes (a built hut, a scaffold; blocks tagged thin are left out), or the ground
//     as a bound (y - ground(x, z)). The smallest of those it is given
//   KHOST.solidGrid(solid, {cell: .5, r: 6, budget: 1500})   the fallback when a query is slow: the query sampled on a lattice round
//     the camera, refilled as it moves (budget samples a frame), read trilinearly; an unfilled cell asks the query itself
//   KHOST.arm: the arm's maths, pure (node: core/host/test-follow.js): march(solid, p, d, L, r) -> the free length; step(S, inp, dt, P);
//     mode(L, P) -> 'boom' | 'shoulder' | 'fp'; ceiling(solid, p, want, r, P) -> {hc, elevMax}
//
// The rules (Haigh-Hutchinson; Cinemachine's Decollider and Deoccluder; Godot's SpringArm3D): a sphere of radius r is marched from
// the pivot (the walker's eye, lifted) back along the view to the wanted length. If the camera's own spot is in the solid, the arm
// pulls in at once. If only the line to the spot is blocked (a pillar passed), it pulls in after `brief` seconds, so a brief blocker
// is ignored. It pushes out at `out` m/s only after `dwell` seconds free, so it does not pump at a doorway. Under `shoulderAt` m of
// arm the camera moves `shoulder` m to the right (over the shoulder), and under `fp` m it is first person. A cast up from the pivot
// finds the ceiling and lowers the pitch limit, so the arm is not crushed against a low roof. Thin things (ropes, blades, lamp
// chains: tag `thin`) are not in the query and never shorten the arm: they dither out instead (core/shader/aids, KFADE).
// Keys: V follow (walking: from the walker; orbiting: from where the camera stands, as F walks), F back to first person, wheel the
// arm's length. A build's own o.keys.v wins over V (follow.key names another key).
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{};
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const P0={dist:4,r:.3,lift:.15,shoulder:.45,key:'v',avatar:true,dwell:.4,brief:.15,out:2.5,pull:20,fp:.6,shoulderAt:1.2,ceil:10,min:.25,minDist:1.5,maxDist:12};
// ---------------------------------------------------------------- the arm's maths (pure)
const A=K.arm={P0};
// how far a sphere of radius r moves from p along the unit d before it touches (at most L). Sphere tracing never steps past the
// surface; a grazing march that runs out of steps returns where it got to (short, never into the rock)
A.march=function(solid,p,d,L,r,n){n=n==null?64:n;let t=0;
 for(let i=0;i<n&&t<L;i++){const s=solid(p[0]+d[0]*t,p[1]+d[1]*t,p[2]+d[2]*t)-r;if(s<.01)return t;t+=s;}
 return Math.min(t,L);};
// one step of the spring: S {L, free, blk}; inp {want (the length asked), hit (the march's free length), spotIn (the camera's spot
// at the current L is in the solid)}; P the rules (P0). Returns S.L
A.step=function(S,inp,dt,P){P=P||P0;const want=inp.want,hit=Math.min(inp.hit,want),min=P.min==null?P0.min:P.min;
 if(want<S.L){S.L=Math.max(min,want);}
 if(hit<S.L-1e-3){S.free=0;
  if(inp.spotIn){S.L=Math.max(min,hit);S.blk=0;}
  else{S.blk+=dt;if(S.blk>=P.brief)S.L=Math.max(min,S.L+(hit-S.L)*(1-Math.exp(-dt*P.pull)));}}
 else{S.blk=0;if(hit>S.L+1e-3){S.free+=dt;if(S.free>=P.dwell)S.L=Math.min(hit,S.L+P.out*dt);}else S.free=0;}
 return S.L;};
A.mode=function(L,P){P=P||P0;return L<P.fp?'fp':L<P.shoulderAt?'shoulder':'boom';};
// the ceiling over the pivot and the steepest the arm may rise (radians above level) so its end stays under it
A.ceiling=function(solid,p,want,r,P){P=P||P0;const hc=A.march(solid,p,[0,1,0],P.ceil,r);
 return {hc,elevMax:hc>=P.ceil-1e-6?Math.PI/2:Math.asin(clamp((hc-.15)/Math.max(.01,want),-1,1))};};
// ---------------------------------------------------------------- the queries
function boxSD(b,x,y,z){const qx=Math.max(b[0]-x,x-b[1]),qz=Math.max(b[2]-z,z-b[3]),qy=Math.max(b[4]-y,y-b[5]);
 const ox=Math.max(qx,0),oy=Math.max(qy,0),oz=Math.max(qz,0);return Math.sqrt(ox*ox+oy*oy+oz*oz)+Math.min(Math.max(qx,qy,qz),0);}
A.boxSD=boxSD;
K.solidFrom=function(o){o=o||{};const C=o.cavern,W=o.walk,G=o.ground?(typeof o.ground==='function'?o.ground:(x,z)=>o.ground.h(x,z)):null;
 const thin=o.thin||['thin'],R=o.r==null?24:o.r,isThin=t=>!!t&&thin.some(n=>t===n||(' '+t+' ').indexOf(' '+n+' ')>=0||t.indexOf(n+':')===0);
 let near=[],cx=1e30,cz=1e30,nb=-1;
 function blocksNear(x,z){const B=W.blocks;if(Math.abs(x-cx)<R/2&&Math.abs(z-cz)<R/2&&nb===B.length)return near;cx=x;cz=z;nb=B.length;near=[];
  for(let i=0;i<B.length;i++){const k=B[i],b=k.box;if(isThin(k.tag))continue;if(b[1]<x-R||b[0]>x+R||b[3]<z-R||b[2]>z+R)continue;near.push(k);}return near;}
 return function(x,y,z){let d=1e9;if(C)d=C.sdf(x,y,z);else if(G)d=y-G(x,z);
  if(W&&W.blocks&&W.blocks.length){const L=blocksNear(x,z);for(let i=0;i<L.length;i++){if(L[i].off)continue;const s=boxSD(L[i].box,x,y,z);if(s<d)d=s;}}
  return d;};};
// the cached lattice round the camera (the plan's fallback, 6.3): filled a budget a frame, nearest first; read trilinearly
K.solidGrid=function(solid,o){o=o||{};const cell=o.cell==null?.5:o.cell,R=o.r==null?6:o.r,n=Math.round(2*R/cell)+1,budget=o.budget==null?1500:o.budget;
 const V=new Float32Array(n*n*n),has=new Uint8Array(n*n*n);let ox=1e30,oy=0,oz=0,todo=[],ti=0;
 function centre(x,y,z){ox=Math.round((x-R)/cell)*cell;oy=Math.round((y-R)/cell)*cell;oz=Math.round((z-R)/cell)*cell;has.fill(0);ti=0;todo=[];
  const m=(n-1)/2;for(let k=0;k<n;k++)for(let j=0;j<n;j++)for(let i=0;i<n;i++)todo.push([(i-m)*(i-m)+(j-m)*(j-m)+(k-m)*(k-m),i,j,k]);todo.sort((a,b)=>a[0]-b[0]);}
 function at(i,j,k){const q=(k*n+j)*n+i;if(!has[q]){V[q]=solid(ox+i*cell,oy+j*cell,oz+k*cell);has[q]=1;}return V[q];}
 const f=function(x,y,z){const u=(x-ox)/cell,v=(y-oy)/cell,w=(z-oz)/cell;if(!(u>=0&&v>=0&&w>=0&&u<n-1&&v<n-1&&w<n-1))return solid(x,y,z);
  const i=u|0,j=v|0,k=w|0,a=u-i,b=v-j,c=w-k;
  const x00=at(i,j,k)*(1-a)+at(i+1,j,k)*a,x10=at(i,j+1,k)*(1-a)+at(i+1,j+1,k)*a,x01=at(i,j,k+1)*(1-a)+at(i+1,j,k+1)*a,x11=at(i,j+1,k+1)*(1-a)+at(i+1,j+1,k+1)*a;
  return (x00*(1-b)+x10*b)*(1-c)+(x01*(1-b)+x11*b)*c;};
 f.move=function(x,y,z){if(Math.abs(x-ox-R)>R/2||Math.abs(y-oy-R)>R/2||Math.abs(z-oz-R)>R/2)centre(x,y,z);
  for(let e=0;e<budget&&ti<todo.length;e++,ti++){const t=todo[ti];at(t[1],t[2],t[3]);}return ti/todo.length;};
 f.cell=cell;return f;};
// ---------------------------------------------------------------- the camera
function install(H,opts){const C=K.cam,THREE=H.o.THREE||root.THREE,camera=H.camera,c=C.ctl;
 const P=Object.assign({},P0,opts);if(typeof P.solid!=='function')throw new Error('KHOST.follow: solid(x, y, z) is required');
 const F=K.follow;F.opts=P;F.solid=P.solid;
 const S=F.S={L:P.dist,want:P.dist,free:0,blk:0,mode:'boom',hc:P.ceil,elevMax:Math.PI/2};
 let last=0,frame=0,fig=null;
 function avatar(){if(fig||P.avatar===false)return fig;
  if(P.avatar&&P.avatar.isObject3D)fig=P.avatar;
  else{fig=new THREE.Group();const m=new THREE.MeshStandardMaterial({color:0xd8a25a,roughness:.7});
   const body=new THREE.Mesh(new THREE.CylinderGeometry(.2,.24,1.1,10),m);body.position.y=.85;
   const head=new THREE.Mesh(new THREE.SphereGeometry(.15,12,8),m);head.position.y=1.58;
   const nose=new THREE.Mesh(new THREE.BoxGeometry(.08,.06,.14),m);nose.position.set(0,1.58,-.16);fig.add(body,head,nose);}
  fig.name='the follow camera\'s walker';fig.traverse(q=>{q.userData.khost='follow';q.userData.probeSkip=true;q.castShadow=true;});
  if(root.KFADE&&P.xray!==false)root.KFADE.xray(fig,P.xray&&P.xray!==true?P.xray:{});   /* seen through the rock as a silhouette */
  H.scene.add(fig);fig.visible=false;return fig;}
 const baseApply=C.apply,baseWalk=C.walk;
 const fw=new THREE.Vector3(),rt=new THREE.Vector3(),piv=[0,0,0],d=[0,0,0];
 function place(){const now=performance.now(),dt=last?Math.min(.1,(now-last)/1000):0;last=now;frame++;
  const t=c.target;piv[0]=t.x;piv[1]=t.y+P.lift;piv[2]=t.z;
  if(F.grid)F.grid.move(piv[0],piv[1],piv[2]);
  const q=F.grid||P.solid;
  if(frame%3===1||!S.hcT){const cl=A.ceiling(q,piv,S.want,P.r,P);S.hc=cl.hc;S.elevMax=cl.elevMax;S.hcT=now;}   /* the ceiling cast, every third frame */
  const lo=Math.PI/2-1.35,hi=Math.min(Math.PI/2+1.35,Math.PI/2+S.elevMax);c.phi=clamp(c.phi,lo,Math.max(lo,hi));
  const p=c.phi,sp=Math.sin(p);fw.set(-sp*Math.sin(c.theta),-Math.cos(p),-sp*Math.cos(c.theta));rt.set(Math.cos(c.theta),0,-Math.sin(c.theta));
  d[0]=-fw.x;d[1]=-fw.y;d[2]=-fw.z;
  /* over the shoulder: the pivot moves right as the arm shortens (not past what is free beside the head) */
  const k=clamp((P.shoulderAt-S.L)/Math.max(.01,P.shoulderAt-P.fp),0,1);let side=P.shoulder*k;
  if(side>0)side=Math.min(side,A.march(q,piv,[rt.x,0,rt.z],side,P.r*.6));
  const pv=[piv[0]+rt.x*side,piv[1],piv[2]+rt.z*side];
  const hit=A.march(q,pv,d,S.want,P.r),spotIn=q(pv[0]+d[0]*S.L,pv[1]+d[1]*S.L,pv[2]+d[2]*S.L)<P.r;
  A.step(S,{want:S.want,hit,spotIn},dt,P);S.mode=A.mode(S.L,P);
  if(S.mode==='fp'){camera.position.set(t.x,t.y,t.z);}
  else camera.position.set(pv[0]+d[0]*S.L,pv[1]+d[1]*S.L,pv[2]+d[2]*S.L);
  camera.lookAt(camera.position.x+fw.x,camera.position.y+fw.y,camera.position.z+fw.z);
  const g=avatar();if(g){const w=C.walkAt;g.visible=S.mode!=='fp';if(w){g.position.set(w[0],w[2],w[1]);}g.rotation.y=c.theta;}
  /* what stands between the camera and the walker dithers out (core/shader/aids KFADE, on the materials a build gave it) */
  if(root.KFADE&&P.fade!==false){if(S.mode==='fp')root.KFADE.track(null);else root.KFADE.track(camera.position,[t.x,t.y-.5,t.z],P.fadeR==null?.8:P.fadeR);}}
 C.apply=function(){if(!F.on||!c.walk)return baseApply();C.stand();place();if(H.o.depth)C.depth();};
 C.walk=function(on,quiet){baseWalk(on,quiet);if(!c.walk&&F.on)F.set(false);};
 F.set=function(on){on=on===undefined?!F.on:!!on;if(on===F.on)return F.on;F.on=on;
  if(on){if(!c.walk)standBelow();S.L=Math.min(S.want,P.dist);S.free=S.blk=0;last=0;if(P.grid!==false&&P.grid)F.grid=K.solidGrid(P.solid,P.grid===true?{}:P.grid);}
  else{if(fig)fig.visible=false;F.grid=null;if(root.KFADE)root.KFADE.track(null);}
  if(K.followShown)K.followShown(on);if(F.btn)F.btn.classList.toggle('on',on);return on;};
 /* from the orbit: stand on the floor under the eye, not the highest floor at that x, z (core/host's F does, so F in a tube under a
    town stands you in the town: Dhelv, 2026-11-11, UNDERGROUND.md); no floor below, the camera's own walk */
 function standBelow(){const W=H.o.walk,x=camera.position.x,z=camera.position.z,y=camera.position.y,fb=W&&W.floorBelow?W.floorBelow(x,z,y,.3):null;
  if(!fb){C.walk(true);return;}C.walkAt=[x,z,fb[0]];c.target.set(x,fb[0]+c.eye,z);c.walk=true;c.phi=Math.PI/2+.12;if(K.onWalk)K.onWalk(true);}
 F.clearance=function(){return P.solid(camera.position.x,camera.position.y,camera.position.z);};
 // ---------------------------------------------------------------- input: V, F (back to first person), the wheel (the arm)
 const typing=e=>{const t=e.target;return t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable);};
 const key=String(P.key||'v').toLowerCase(),own=H.o.keys&&H.o.keys[key];
 root.addEventListener('keydown',e=>{if(typing(e)||e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key.toLowerCase();
  if(k===key&&!own){F.set();e.preventDefault();}
  else if(k==='f'&&F.on){F.set(false);e.stopImmediatePropagation();e.preventDefault();}},true);
 H.renderer.domElement.addEventListener('wheel',e=>{if(!F.on||e.shiftKey)return;S.want=clamp(S.want*(e.deltaY>0?1.12:.89),P.minDist,P.maxDist);
  e.preventDefault();e.stopImmediatePropagation();},{capture:true,passive:false});
 if(K.ui&&P.button!==false){const b=F.btn=root.document.createElement('button');b.textContent='follow ('+key.toUpperCase()+')';b.id='khost-follow-btn';b.onclick=()=>F.set();K.ui.appendChild(b);}
 if(P.on)F.set(true);
 return F;}
K.follow={on:false,enable(opts){if(!K.host||!K.cam)throw new Error('KHOST.follow.enable: after KHOST.take');if(K.follow.opts)return K.follow;return install(K.host,opts||{});}};
if(K.onTake)K.onTake(function followTake(H){const o=H.o;if(!o.solid&&!(o.follow&&o.follow.solid))return;
 try{install(H,Object.assign({solid:o.solid},o.follow||{}));}catch(e){K.err('follow: '+((e&&e.stack)||e));}});
})(typeof window!=='undefined'?window:globalThis);
