// ---------------------------------------------------------------- animation: the swell, the wind, the oars, under way
// One clock t (seconds) drives everything: RS_U.uTime feeds the sea's and the sails' vertex shaders,
// rsRide (40-rs-core.js) poses each hull on the same swell, and each builder's anims (oar strokes,
// wheels) run on it. window._api.pause(t) freezes the clock at t seconds (verify.py shots are then
// repeatable). Every pose is a pure function of t (and, under way, of the time the toggle was set).
//
// Under way (toolbar button, off by default so the sheet and its preset views stay put): every vessel
// makes RS_WAY.speed m/s east, easing up over RS_WAY.ease s, and wraps round its row (RS_COLS*RS_PX m)
// so the spacing never changes; a Kelvin wake (one InstancedMesh, riding the swell) streams astern.
// A preset view of a vessel follows it while it is under way; turning it off returns all to station.
const RS_WAY={on:false,t0:0,speed:1.8,ease:8,span:RS_COLS*RS_PX,follow:null,last:0};
function rsWayDist(t){if(!RS_WAY.on)return 0;const s=Math.max(0,t-RS_WAY.t0),T=RS_WAY.ease;return RS_WAY.speed*(s-T*(1-Math.exp(-s/T)));}
function rsWayX(p,t){if(!RS_WAY.on)return p.x;const W=RS_WAY.span,x0=-W/2;let u=(p.x-x0+rsWayDist(t))%W;if(u<0)u+=W;return x0+u;}
const rsClock=()=>window._rsPause!=null?window._rsPause:performance.now()/1000;

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
  .replace('#include <project_vertex>','vec4 rsW=modelMatrix*instanceMatrix*vec4(transformed,1.);rsW.y+=rsSwell(rsW.xz).x+.05;vec4 mvPosition=viewMatrix*rsW;gl_Position=projectionMatrix*mvPosition;');};
 // unit strip: x from 0 (the bow) to -1 (astern), z +-0.36; scaled per vessel by 2.6 L
 const geo=new THREE.PlaneGeometry(1,.72,24,10);geo.rotateX(-Math.PI/2);geo.translate(-.5,0,0);
 {const uv=geo.attributes.uv,p=geo.attributes.position;for(let i=0;i<p.count;i++)uv.setXY(i,.5+p.getZ(i)/.72,1+p.getX(i));}   // v=1 at the bow (canvas top)
 const im=new THREE.InstancedMesh(geo,mat,Math.max(1,RS_PLACED.length));im.frustumCulled=false;im.visible=false;im.userData.probeSkip=true;im.name='wakes';scene.add(im);return im;})();
const _rsWM=new THREE.Matrix4(),_rsWQ=new THREE.Quaternion(),_rsWP=new THREE.Vector3(),_rsWS=new THREE.Vector3();

FRAME_HOOKS.push((dt,now)=>{const t=rsClock();RS_U.uTime.value=t;
 TEX.rsWater.offset.x=(t*.004)%1;TEX.rsWater.offset.y=(t*.0025)%1;
 RS_PLACED.forEach((p,i)=>{const x=rsWayX(p,t);rsRide(p.G,p.D,x,p.z,0,t);if(p.reg)p.reg.x=x;
  for(const f of p.V.anims)f(t);
  if(RS_WAY.on){const L=Math.max(6,p.D.L)*2.6;_rsWP.set(x+p.D.L*.5,0,p.z);_rsWS.set(L,1,L);_rsWM.compose(_rsWP,_rsWQ,_rsWS);RS_WAKE.setMatrixAt(i,_rsWM);}});
 RS_WAKE.visible=RS_WAY.on;if(RS_WAY.on){RS_WAKE.instanceMatrix.needsUpdate=true;RS_WAKE.material.opacity=.85*(1-Math.exp(-Math.max(0,t-RS_WAY.t0)/RS_WAY.ease));}
 // a preset view of a vessel follows it east (and round the wrap) while it is under way
 if(!WALK.on){const f=RS_WAY.follow,off=f?rsWayX(f,t)-f.x:0;ctl.target.x+=off-RS_WAY.last;RS_WAY.last=off;}});
// which vessel a preset view looks at (re-armed whenever a view is picked: setView puts the camera back at station)
function rsFollowView(name){RS_WAY.follow=RS_PLACED.find(p=>name===p.D.name||name===p.D.name+' — abeam')||null;RS_WAY.last=0;}
sel.addEventListener('change',()=>rsFollowView(sel.value));for(const b of hb.querySelectorAll('button'))b.addEventListener('click',()=>rsFollowView(b.textContent));
rsFollowView(Object.keys(VIEWS)[0]);
function rsUnderWay(on,t0){RS_WAY.on=on==null?!RS_WAY.on:!!on;RS_WAY.t0=t0==null?rsClock():t0;for(const b of ui.querySelectorAll('button'))if(b.textContent==='Under way')b.classList.toggle('on',RS_WAY.on);return RS_WAY.on;}
uiButton('Under way',false,()=>rsUnderWay());
window._api.underWay=rsUnderWay;
// labels start hidden on this sheet (the Labels button shows them): twelve names over one roadstead crowd every wide shot
if(LABELS)LABELS.visible=false;
