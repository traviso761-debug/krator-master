// ---------------------------------------------------------------- animation: the swell, the wind, the oars, under way
// One clock t (seconds) drives everything: RS_U.uTime feeds the sea's, the sails' and the flags' vertex shaders,
// rsRide (40-rs-core.js) poses each hull on the same swell, and each builder's anims (oar strokes, wheels)
// run on it. window._api.pause(t) freezes the clock at t seconds (verify.py shots are then repeatable).
// Every pose is a pure function of t and of the times the Under way toggle was set (RS_WAY.tOn/tOff).
//
// Under way (toolbar button, off by default so the sheet and its preset views stay put): each row of the
// sheet sails one closed course, a racetrack: east along the row's own line, a half-turn to port (radius
// RS_PZ/4) onto a lane midway to the next row, west, and a half-turn back. The row's vessels keep their
// spacing (they all make RS_WAY.speed, so they move like one train), heading follows the course's tangent and
// they heel gently into the turns. s(t) is the distance run (easing up over RS_WAY.ease s); a vessel is at
// course distance (its station's) + s. Turned off, s eases forward or back along the course to the nearest
// whole lap, so each train runs back to station along its own track in a few seconds without crossing any
// other. A Kelvin wake (one InstancedMesh, riding the swell) streams astern; labels and a preset view of a
// vessel follow it.
//
// The wind: RS_WIND blows toward (wx,wz) at speed. Under way each vessel trims to the apparent wind
// (true wind minus its own way): its rigs turn about their masts by RS_WAY.trimMax*sin(angle off the bow)
// (zero head to wind and dead downwind, the most on a beam reach) and its pennants swing to stream with it.
// At rest both are zero: the built pose.
const RS_WIND={x:-.35,z:.94,speed:5};   // blowing toward SSW (from NNE), m/s
const RS_WAY={on:false,tOn:0,tOff:-1e9,sOn:0,sOff:0,kOff:0,speed:1.8,ease:8,trimMax:.45,heel:.07,
 R:RS_PZ/4,xW:-RS_COLS*RS_PX/2,xE:RS_COLS*RS_PX/2,follow:null,last:null};
RS_WAY.S=RS_WAY.xE-RS_WAY.xW;RS_WAY.P=2*RS_WAY.S+TAU*RS_WAY.R;
const rsClock=()=>window._rsPause!=null?window._rsPause:performance.now()/1000;
const rsSmoother=x=>{x=clamp(x,0,1);return x*x*x*(x*(x*6-15)+10);};
// the way's return leg: from sOff, ease to the nearest whole lap in Tb seconds
function rsWayBack(){const W=RS_WAY,tg=Math.round(W.sOff/W.P)*W.P,d=tg-W.sOff;return{tg,d,Tb:clamp(3+Math.abs(d)/60,3,10)};}
// s(t): distance run along the course (every vessel the same); k(t): how far under way (0 rest .. 1)
function rsWayS(t){const W=RS_WAY;if(W.on){const s=Math.max(0,t-W.tOn),T=W.ease;return W.sOn+W.speed*(s-T*(1-Math.exp(-s/T)));}
 const b=rsWayBack();return W.sOff+b.d*rsSmoother((t-W.tOff)/b.Tb);}
function rsWayK(t){const W=RS_WAY;if(W.on)return 1-Math.exp(-Math.max(0,t-W.tOn)/W.ease);const b=rsWayBack();return W.kOff*(1-rsSmoother((t-W.tOff)/b.Tb));}
// the course: u in [0,P) from the west end of the row's line -> x, z, yaw (unwrapped, + = turning to port)
function rsCourseAt(zr,u){const W=RS_WAY,R=W.R,S=W.S,lap=Math.floor(u/W.P);u-=lap*W.P;let x,z,y;
 if(u<S){x=W.xW+u;z=zr;y=0;}
 else if(u<S+Math.PI*R){const f=(u-S)/R;x=W.xE+R*Math.sin(f);z=zr-R+R*Math.cos(f);y=f;}
 else if(u<2*S+Math.PI*R){const w=u-S-Math.PI*R;x=W.xE-w;z=zr-2*R;y=Math.PI;}
 else{const f=(u-2*S-Math.PI*R)/R;x=W.xW-R*Math.sin(f);z=zr-R-R*Math.cos(f);y=Math.PI+f;}
 return{x,z,yaw:y+lap*TAU};}
// a vessel's pose at t: {x,z,yaw,heel,k,trim,flag}; at rest exactly its station
function rsWayPose(p,t){const k=rsWayK(t),s=rsWayS(t);
 if(Math.abs(s)<1e-9&&k<1e-9)return{x:p.x,z:p.z,yaw:0,heel:0,k:0,trim:0,flag:0};
 const u=p.x-RS_WAY.xW+s,c=rsCourseAt(p.z,u),w=12,a=rsCourseAt(p.z,u+w),b=rsCourseAt(p.z,u-w);
 const kap=(a.yaw-b.yaw)/(2*w);   // the turn rate, smoothed over 24 m so the heel eases in and out
 // apparent wind in the vessel frame (x bow, z starboard): true wind minus the vessel's own way
 const v=RS_WAY.speed*k,wx=RS_WIND.x*RS_WIND.speed-Math.cos(c.yaw)*v,wz=RS_WIND.z*RS_WIND.speed+Math.sin(c.yaw)*v;
 const co=Math.cos(c.yaw),si=Math.sin(c.yaw),lx=wx*co-wz*si,lz=wx*si+wz*co,L=Math.hypot(lx,lz)||1;
 const ang=Math.atan2(lz,-lx);   // 0: the wind blows straight aft (from ahead), +: toward starboard
 const fx=-(1-k)+k*lx/L,fz=k*lz/L;
 return{x:c.x,z:c.z,yaw:c.yaw,heel:-RS_WAY.heel*kap*RS_WAY.R*Math.min(1,k),k,trim:RS_WAY.trimMax*Math.sin(ang)*k,flag:Math.atan2(fz,-fx)};}

// ---- the wake: a foam texture (Kelvin arms from the bow, churn from the stern) on a strip that rides the swell
const RS_WAKE=(()=>{const tex=canvasTex(256,512,(g,W,H)=>{g.clearRect(0,0,W,H);   // canvas y = distance astern of the bow, x = across
  const arm=(sd)=>{for(let i=0;i<260;i++){const t=i/260,y=t*H,x=W/2+sd*t*W*.49;const a=.55*(1-t)*(1-t)*Math.min(1,t*14);
    g.fillStyle=`rgba(235,245,248,${a})`;g.beginPath();g.ellipse(x,y,2+t*7,3+t*4,sd*.35,0,TAU);g.fill();
    if(i%9===0){g.fillStyle=`rgba(225,238,242,${a*.6})`;for(let k=1;k<5;k++){g.beginPath();g.arc(x-sd*k*t*9,y+k*2,1+t*3,0,TAU);g.fill();}}}};
  arm(-1);arm(1);
  for(let i=0;i<900;i++){const t=.38+.62*h3(i,5,1),x=W/2+(h3(i,6,2)-.5)*(10+t*70),y=t*H;const a=.5*(1-(t-.38)/.62)**1.5;
   g.fillStyle=`rgba(240,248,250,${a*(.4+.6*h3(i,7,3))})`;g.beginPath();g.arc(x,y,1+h3(i,8,4)*4,0,TAU);g.fill();}});
 tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;
 const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,opacity:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 mat.onBeforeCompile=sh=>{sh.uniforms.uRsTime=RS_U.uTime;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+rsSwellGLSL())
  .replace('#include <project_vertex>','vec4 rsW=modelMatrix*instanceMatrix*vec4(transformed,1.);rsW.y+=rsSwellH(rsW.xz)+.05;vec4 mvPosition=viewMatrix*rsW;gl_Position=projectionMatrix*mvPosition;');};
 // unit strip: x from 0 (the bow) to -1 (astern), z +-0.36; scaled per vessel by 2.6 L
 const geo=new THREE.PlaneGeometry(1,.72,24,10);geo.rotateX(-Math.PI/2);geo.translate(-.5,0,0);
 {const uv=geo.attributes.uv,p=geo.attributes.position;for(let i=0;i<p.count;i++)uv.setXY(i,.5+p.getZ(i)/.72,1+p.getX(i));}   // v=1 at the bow (canvas top)
 const im=new THREE.InstancedMesh(geo,mat,Math.max(1,RS_PLACED.length));im.frustumCulled=false;im.visible=false;im.userData.probeSkip=true;im.name='wakes';scene.add(im);return im;})();
const _rsWM=new THREE.Matrix4(),_rsWQ=new THREE.Quaternion(),_rsWP=new THREE.Vector3(),_rsWS=new THREE.Vector3(),_rsWY=new THREE.Vector3(0,1,0);

// ---- labels follow their vessel: map each label quad (93-labels.js bakes its anchor at station) to its vessel
const RS_LABQ=(()=>{const m=LABELS&&LABELS.getObjectByName('labels');if(!m)return null;const a=m.geometry.attributes.aPos,q=[];
 for(let i=0;i<a.count;i+=4){const p=RS_PLACED.find(p=>Math.abs(p.x-a.getX(i))<1e-3&&Math.abs(p.z-a.getZ(i))<1e-3);q.push(p?{p,y:a.getY(i)}:null);}return{a,q};})();

// pose the whole fleet at t (the frame hook, and the probes in 91-rs-probe.js)
function rsFleetPose(t){RS_U.uTime.value=t;
 RS_PLACED.forEach((p,i)=>{const w=rsWayPose(p,t);p.way=w;rsRide(p.G,p.D,w.x,w.z,w.yaw,t,null,w.heel);
  const U=p.G.userData.rsU;if(U){U.uRsTrim.value=w.trim;U.uRsFlag.value=w.flag;}
  if(p.reg){p.reg.x=w.x;p.reg.z=w.z;}for(const f of p.V.anims)f(t);
  if(w.k>0){const L=Math.max(6,p.D.L)*2.6;_rsWP.set(w.x+Math.cos(w.yaw)*p.D.L*.5,0,w.z-Math.sin(w.yaw)*p.D.L*.5);_rsWQ.setFromAxisAngle(_rsWY,w.yaw);_rsWS.set(L,1,L);
   _rsWM.compose(_rsWP,_rsWQ,_rsWS);RS_WAKE.setMatrixAt(i,_rsWM);}});
 const k=rsWayK(t);RS_WAKE.visible=k>.002;if(RS_WAKE.visible){RS_WAKE.instanceMatrix.needsUpdate=true;RS_WAKE.material.opacity=.85*Math.min(1,k);}
 if(RS_LABQ){const a=RS_LABQ.a;RS_LABQ.q.forEach((e,j)=>{if(!e)return;const G=e.p.G;for(let c=0;c<4;c++)a.setXYZ(j*4+c,G.position.x,e.y+G.position.y,G.position.z);});a.needsUpdate=true;}}
FRAME_HOOKS.push((dt,now)=>{const t=rsClock();rsFleetPose(t);
 TEX.rsWater.offset.x=(t*.004)%1;TEX.rsWater.offset.y=(t*.0025)%1;
 // a preset view of a vessel follows it (translation and turn) while it is under way or running home
 const f=RS_WAY.follow;if(f&&!WALK.on){const w=f.way,l=RS_WAY.last||{x:f.x,z:f.z,yaw:0};
  ctl.target.x+=w.x-l.x;ctl.target.z+=w.z-l.z;const dy=w.yaw-l.yaw;if(dy){const ox=ctl.target.x-w.x,oz=ctl.target.z-w.z,c=Math.cos(dy),s=Math.sin(dy);
   ctl.target.x=w.x+ox*c+oz*s;ctl.target.z=w.z-ox*s+oz*c;ctl.theta+=dy;}
  RS_WAY.last={x:w.x,z:w.z,yaw:w.yaw};}});
// which vessel a preset view looks at (re-armed whenever a view is picked: setView puts the camera back at station,
// and the first frame carries it to wherever the vessel is now)
function rsFollowView(name){RS_WAY.follow=RS_PLACED.find(p=>name===p.D.name||name===p.D.name+' — abeam')||null;RS_WAY.last=null;}
sel.addEventListener('change',()=>rsFollowView(sel.value));for(const b of hb.querySelectorAll('button'))b.addEventListener('click',()=>rsFollowView(b.textContent));
rsFollowView(Object.keys(VIEWS)[0]);
// toggle (on: true/false/undefined = flip) at time t0 (default now). The state at t0 is carried over, so a toggle
// mid-return or mid-ease never jumps.
function rsUnderWay(on,t0){const W=RS_WAY,next=on==null?!W.on:!!on,t=t0==null?rsClock():t0;
 if(next!==W.on){const s=rsWayS(t),k=rsWayK(t);if(next){W.sOn=s;W.tOn=t-(k>0?-W.ease*Math.log(1-Math.min(k,.999)):0);}else{W.sOff=s;W.kOff=k;W.tOff=t;}W.on=next;
  if(next&&k>0){W.sOn=s-W.speed*((t-W.tOn)-W.ease*(1-Math.exp(-(t-W.tOn)/W.ease)));}}
 for(const b of ui.querySelectorAll('button'))if(b.textContent==='Under way')b.classList.toggle('on',W.on);return W.on;}
uiButton('Under way',false,()=>rsUnderWay());
window._api.underWay=rsUnderWay;
window._api.wayState=()=>({on:RS_WAY.on,tOn:RS_WAY.tOn,tOff:RS_WAY.tOff,sOn:RS_WAY.sOn,sOff:RS_WAY.sOff,kOff:RS_WAY.kOff});
// labels start hidden on this sheet (the Labels button shows them): twelve names over one roadstead crowd every wide shot
if(LABELS)LABELS.visible=false;
