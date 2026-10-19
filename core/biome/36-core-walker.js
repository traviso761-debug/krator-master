// ================================================================= BIOME CORE — walkers (2026-10-16)
// A grazing or roaming animal whose pose is a PURE FUNCTION OF THE CLOCK, so the export's motion bake
// (BIO.motionBake, 42-core-export.js; biomes/GODOT.md "Motion") takes it and a port replays it exactly. Lifted from
// sedesert's deer and coyotes (biomes/sedesert/src/75-biome-sedesert-fauna.js, which keeps its own copy for now):
// a WALKER goes round a closed polyline at a trapezoid speed (it eases out of and into each stop) and stands at some
// of its vertices for a while. Nothing is integrated frame to frame and nothing is drawn after the build, so any frame
// rate, or a port replaying the clock, lands on the same pose. The ground under the path is sampled once at build
// (W.gy, about every metre), so a frame calls no terrainH. Opt-in: a build lists it after 30-core-foliage.
//   BIO.walker(pts, stops, v, ta, off, hs)  -> W. pts [[x,z]...] a closed loop; stops [{i, d, ...}] sorted by vertex
//        (i the vertex, d seconds; any other field rides along); v the cruising speed (m/s); ta the ease (s); off the
//        walker's clock offset (s); hs the half-stride (m), rounded so the loop holds whole strides. W.P its period (s)
//   BIO.walkAt(W, t, back, rc)  -> {x, z, y (the ground), s (along the path), d (metres walked this period), hd
//        (heading: atan2(dx, dz), a body facing +z), vf (0..1 of the cruising speed), stop, u (s into it), ph (the
//        gait phase, pi a half-stride, continuous over the period and a whole number of turns round it)}.
//        back puts a follower that many metres behind on the same path; rc eases the corners over rc metres
//   BIO.walkPitch(W, s, e)  the body's pitch from the ground along the path, half-length e
//   BIO.walkLoop(cx, cz, r, ok, rand, opt)  -> a closed loop of about opt.n (8) vertices round (cx, cz) at radius r
//        (each 0.6 to 1.1 of it, shrunk until ok), every vertex and every leg (sampled each opt.step, 3 m) ok(x, z);
//        rand a () -> [0,1) the kit seeds (a KRAND stream). null when fewer than 3 vertices are ok
(function(){const {TAU,clamp,smooth}=BIO.fn;
const wrapA=a=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;},lerpA=(a,b,u)=>a+wrapA(b-a)*u;
function wSeg(W,s){const c=W.cum;let lo=0,hi=W.pts.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(c[m]<=s)lo=m;else hi=m-1;}return lo;}
function wAt(W,s){s=((s%W.L)+W.L)%W.L;const i=wSeg(W,s),n=W.pts.length,a=W.pts[i],b=W.pts[(i+1)%n],l=W.cum[i+1]-W.cum[i],u=l>0?(s-W.cum[i])/l:0;return[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];}
function wY(W,s){s=((s%W.L)+W.L)%W.L;const f=s/W.ds,k=Math.min(Math.floor(f),W.gy.length-2),u=f-k;return W.gy[k]+(W.gy[k+1]-W.gy[k])*u;}
// heading along the path; a corner is eased over rc metres (a walker eases only the corners it does not stop at)
function wHd(W,s,all,rc){s=((s%W.L)+W.L)%W.L;const n=W.pts.length,i=wSeg(W,s),c=W.cum,a=s-c[i],b=c[i+1]-s;
 if(a<rc&&(all||!W.isStop[i]))return lerpA(W.dir[(i+n-1)%n],W.dir[i],smooth(-rc,rc,a));
 if(b<rc&&(all||!W.isStop[(i+1)%n]))return lerpA(W.dir[i],W.dir[(i+1)%n],smooth(-rc,rc,-b));
 return W.dir[i];}
BIO.walker=function(pts,stops,v,ta,off,hs){const n=pts.length,cum=[0],dir=[];
 for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];cum.push(cum[i]+Math.hypot(b[0]-a[0],b[1]-a[1]));dir.push(Math.atan2(b[0]-a[0],b[1]-a[1]));}
 const L=cum[n],N=Math.max(2,Math.ceil(L)),W={pts,cum,dir,L,ds:L/N,gy:new Float32Array(N+1),stops,v,off:off||0,tl:[],P:0,hs:L/(2*Math.max(1,Math.round(L/(2*hs)))),isStop:new Uint8Array(n)};
 for(let k=0;k<=N;k++){const p=wAt(W,k*W.ds);W.gy[k]=BIO.terrainH(p[0],p[1]);}
 stops.forEach(S=>W.isStop[S.i]=1);
 let t0=0,d0=0;
 if(!stops.length){W.tl.push({run:1,s0:0,Lr:L,D:L/v,ta:0,t0:0,d0:0});t0=L/v;}
 else for(let k=0;k<stops.length;k++){const S=stops[k],S2=stops[(k+1)%stops.length];
  W.tl.push({run:0,s0:cum[S.i],D:S.d,t0,d0,stop:S,hIn:dir[(S.i+n-1)%n],hOut:dir[S.i]});t0+=S.d;
  let Lr=cum[S2.i]-cum[S.i];if(Lr<=0)Lr+=L;const te=Math.min(ta,Lr/v),D=Lr/v+te;
  W.tl.push({run:1,s0:cum[S.i],Lr,D,ta:te,t0,d0});t0+=D;d0+=Lr;}
 W.P=t0;return W;};
BIO.walkAt=function(W,t,back,rc){let r=(t+W.off)%W.P;if(r<0)r+=W.P;rc=rc==null?1:rc;
 let e=W.tl[0];for(let k=1;k<W.tl.length&&W.tl[k].t0<=r;k++)e=W.tl[k];
 const tau=r-e.t0,o={stop:null,u:0,vf:0,s:0,d:e.d0,hd:0};
 if(!e.run){o.stop=e.stop;o.u=tau;o.s=e.s0;const d=e.D,tt=Math.min(1.5,d*.4);o.hd=lerpA(e.hIn,e.hOut,smooth(d-tt,d,tau));}
 else{const v=W.v,ta=e.ta;let s;
  if(ta<=0){s=v*tau;o.vf=1;}else if(tau<ta){s=v*tau*tau/(2*ta);o.vf=tau/ta;}
  else if(tau>e.D-ta){const k=e.D-tau;s=e.Lr-v*k*k/(2*ta);o.vf=k/ta;}else{s=v*(tau-ta/2);o.vf=1;}
  o.s=e.s0+s;o.d+=s;o.hd=wHd(W,o.s,false,rc);}
 if(back){o.s-=back;o.hd=wHd(W,o.s,true,rc);}
 const p=wAt(W,o.s);o.x=p[0];o.z=p[1];o.y=wY(W,o.s);o.ph=Math.PI*o.d/W.hs;return o;};
BIO.walkPitch=(W,s,e)=>clamp(-Math.atan2(wY(W,s+e)-wY(W,s-e),2*e),-.3,.3);
BIO.walkLoop=function(cx,cz,r,ok,rand,opt){opt=opt||{};const n=opt.n==null?8:opt.n,step=opt.step==null?3:opt.step,a0=rand()*TAU,pts=[];
 const leg=(a,b)=>{const l=Math.hypot(b[0]-a[0],b[1]-a[1]),m=Math.max(1,Math.ceil(l/step));for(let k=1;k<m;k++){const u=k/m;if(!ok(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u))return false;}return true;};
 for(let j=0;j<n;j++){const a=a0+(j+(rand()-.5)*.5)/n*TAU,f=.6+rand()*.5;let p=null;
  for(let g=0;g<6&&!p;g++){const rr=r*f*(1-g*.14),q=[cx+Math.cos(a)*rr,cz+Math.sin(a)*rr];if(ok(q[0],q[1])&&(!pts.length||leg(pts[pts.length-1],q)))p=q;}
  if(p)pts.push(p);}
 while(pts.length>3&&!leg(pts[pts.length-1],pts[0]))pts.pop();
 return pts.length>=3&&leg(pts[pts.length-1],pts[0])?pts:null;};
})();
