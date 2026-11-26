// ---------- a black hole, ray traced: M87* (and, with sgra.js, Sagittarius A*) ----------
// The picture is a shader. For each pixel a ray of light is followed backwards from the camera through the black
// hole's curved space (Schwarzschild: in units of its radius, a photon's acceleration is -3/2 h^2 x / r^5, h its
// angular momentum), a step at a time, smaller close in. It ends in the horizon (black), or out in the sky, where a
// star field and a haze are looked up in the direction it leaves by, so the stars behind are lensed; on the way it
// may cross the accretion disk (from the innermost stable orbit out to K.disk[1]) once, twice or three times, which
// is why the far side of the disk shows over the top of the shadow and under it, and the thin bright photon ring
// round it. Each crossing adds the disk's light: hotter inwards, its colour shifted and its brightness raised to the
// fourth power of the Doppler factor of gas orbiting at up to half the speed of light (the side coming towards you
// is the bright one) and the gravitational redshift. Along the spin axis, the jet.
//
//   Spin      a real black hole turns, and M87*'s is thought to turn fast. A true Kerr trace is not done here: the
//             spin is added as frame dragging in its weak-field form (a gravitomagnetic pull, v x B, B the field of a
//             spinning mass), with the disk's inner edge moved in to the innermost stable orbit of a hole turning at
//             0.6 of the most it can. It squashes the shadow on the side the disk comes towards you, as Kerr does.
//   EHT view  what the Event Horizon Telescope could see: the same trace from M87*'s real angle (its jet 17 degrees
//             off our line of sight), at about the telescope's resolution (a ring two beams across), blurred and in the
//             orange scale its picture was published in. The disk is drawn thin and bright, as a textbook draws it;
//             the real glow is thicker and fainter, and its brighter half is where the gas comes towards us.
//   Quality   the trace is drawn into a target smaller than the screen and scaled up: full size when the frames are
//             quick, down to a third when they are slow (#bhq=<0.3-1> fixes it).
// #eht in the address opens whichever black hole the page opens at in its EHT view, and #spin with its spin on.
// K: name, scale (world units to one Schwarzschild radius), disk [inner, outer], jet, exposure, peakK, haze [r,g,b],
// diskOpacity, label (the buttons' prefix), hud, info, eht {az, el, d}.
export function blackHole(api,kit,K){
  const {THREE,renderer,animHooks}=api;
  const S=K.scale||20,group=new THREE.Group(),name=K.name||'M87*',P=K.label||name;
  const DISK=K.disk||[3,14];
  const U={uCam:{value:new THREE.Vector3()},uInvProj:{value:new THREE.Matrix4()},uCamWorld:{value:new THREE.Matrix4()},uTime:{value:0},
    uRin:{value:DISK[0]},uRout:{value:DISK[1]},uJet:{value:K.jet==null?0.06:K.jet},uExp:{value:K.exposure||1.4},uTpk:{value:K.peakK||9000},
    uJ:{value:new THREE.Vector3()},uHaze:{value:new THREE.Vector3(...(K.haze||[0.03,0.022,0.015]))},uStars:{value:1},uDiskOp:{value:K.diskOpacity==null?0.92:K.diskOpacity}};
  const trace=new THREE.ShaderMaterial({uniforms:U,depthTest:false,depthWrite:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
    fragmentShader:`
precision highp float;
uniform vec3 uCam,uJ,uHaze;uniform mat4 uInvProj,uCamWorld;uniform float uTime,uRin,uRout,uJet,uExp,uTpk,uStars,uDiskOp;varying vec2 vUv;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec3 kelvin(float T){T=clamp(T,1000.,40000.)/100.;vec3 c;
  c.r=T<=66.?1.:clamp(1.292936*pow(T-60.,-0.1332047),0.,1.);
  c.g=T<=66.?clamp(0.3900816*log(T)-0.6318414,0.,1.):clamp(1.1298909*pow(T-60.,-0.0755148),0.,1.);
  c.b=T>=66.?1.:(T<=19.?0.:clamp(0.5432068*log(T-10.)-1.1962541,0.,1.));return c;}
vec3 sky(vec3 d){float phi=atan(d.z,d.x),th=acos(clamp(d.y,-1.,1.));vec3 col=vec3(0.);
  for(int L=0;L<3;L++){float sc=L==0?90.:(L==1?200.:420.);vec2 g=vec2(phi/6.2832*sc*2.,th/3.1416*sc),id=floor(g),f=fract(g)-0.5;
    float r=h21(id+float(L)*17.);if(r>0.93){vec2 o=vec2(h21(id+3.1),h21(id+7.7))-0.5;float dd=length(f-o*0.6),b=(r-0.93)/0.07;
      col+=mix(vec3(1.,.82,.66),vec3(.72,.82,1.),h21(id+9.))*b*b*smoothstep(0.16,0.,dd)*(L==0?2.2:1.2);}}
  // the galaxy round it: a haze of its own stars, thicker towards its middle
  col=(col+uHaze*(0.4+0.6*pow(max(0.,dot(d,normalize(vec3(-0.35,0.25,-1.)))),2.)))*uStars;
  return col;}
vec3 tone(vec3 c){return vec3(1.)-exp(-c*uExp);}
void main(){
  vec2 ndc=vUv*2.-1.;vec4 p=uInvProj*vec4(ndc,1.,1.);p/=p.w;vec3 v=normalize((uCamWorld*vec4(p.xyz,0.)).xyz),x=uCam;
  const float RF=48.;
  float R0=length(x);
  if(R0>RF){float b=dot(x,v),c=dot(x,x)-RF*RF,disc=b*b-c;if(disc<0.||b>0.){gl_FragColor=vec4(tone(sky(v)),1.);return;}x+=v*(-b-sqrt(disc));}
  vec3 hv=cross(x,v);float h2=dot(hv,hv);
  vec3 col=vec3(0.);float tr=1.;bool hole=false;
  float fmax=0.488;
  for(int i=0;i<420;i++){
    float r=length(x);
    if(r<1.0){hole=true;break;}
    if(r>RF+1.&&dot(x,v)>0.)break;
    float dt=clamp(0.05*r*r/(1.+r),0.015,1.2);
    float ay=abs(x.y),rho=length(x.xz);
    if(ay>1.4&&uJet>0.){float w=0.22+0.085*ay;col+=tr*vec3(.55,.68,1.)*exp(-rho*rho/(w*w))*exp(-ay/36.)*smoothstep(1.4,3.5,ay)*dt*uJet*(x.y>0.?1.:0.3);}
    vec3 xo=x;
    // gravity, and the frame dragging of a spinning hole as a gravitomagnetic field B = (3 (J.n) n - J) / r^3
    vec3 n=x/r,B=(3.*dot(uJ,n)*n-uJ)/(r*r*r),a=-1.5*h2*x/pow(r,5.)+2.*cross(v,B);
    v+=a*dt*0.5;x+=v*dt;r=length(x);n=x/r;B=(3.*dot(uJ,n)*n-uJ)/(r*r*r);a=-1.5*h2*x/pow(r,5.)+2.*cross(v,B);v+=a*dt*0.5;
    if(xo.y*x.y<0.){float f=xo.y/(xo.y-x.y);vec3 q=mix(xo,x,f);float rq=length(q.xz);
      if(rq>uRin&&rq<uRout){
        float beta=min(0.95,sqrt(0.5/max(0.6,rq-1.))),gam=1./sqrt(1.-beta*beta);
        vec3 ph=normalize(vec3(-q.z,0.,q.x));float cs=dot(ph,-normalize(v));
        float g=(1./(gam*(1.-beta*cs)))*sqrt(max(0.05,1.-1./rq));
        float fr=pow(rq/uRin,-0.75)*pow(1.-sqrt(uRin/rq),0.25)/fmax;
        float an=atan(q.z,q.x),om=pow(rq,-1.5)*2.2,s=an-uTime*om+1.6*log(rq);
        float nz=0.5+0.5*(0.55+0.45*sin(s*7.))*(0.6+0.4*sin(rq*6.+s*3.))+0.15*h21(vec2(floor(rq*8.),floor(s*12.)));
        float al=uDiskOp*smoothstep(uRin,uRin+0.25,rq)*smoothstep(uRout,uRout-4.,rq);
        vec3 em=kelvin(uTpk*fr*g)*pow(fr,2.)*pow(g,4.)*nz*1.5;
        col+=tr*em*al;tr*=1.-al;if(tr<0.02)break;}}
  }
  if(!hole)col+=tr*sky(normalize(v));
  gl_FragColor=vec4(tone(col),1.);
}`});
  // the trace goes into a target and is drawn from it onto the screen, blurred and recoloured in the EHT view
  const rt=new THREE.WebGLRenderTarget(4,4,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:false});
  const rtScene=new THREE.Scene(),rtCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  {const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),trace);q.frustumCulled=false;rtScene.add(q);}
  const DU={uTex:{value:rt.texture},uEHT:{value:0},uTexel:{value:new THREE.Vector2(0.25,0.25)}};
  const show=new THREE.ShaderMaterial({uniforms:DU,depthTest:false,depthWrite:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
    fragmentShader:`
precision highp float;uniform sampler2D uTex;uniform float uEHT;uniform vec2 uTexel;varying vec2 vUv;
// "afmhot", the scale the EHT pictures are printed in: black, red, orange, yellow, white
vec3 afmhot(float x){x=clamp(x,0.,1.);return clamp(vec3(2.*x,2.*x-0.5,2.*x-1.),0.,1.);}
void main(){
  if(uEHT<0.5){gl_FragColor=vec4(texture2D(uTex,vUv).rgb,1.);return;}
  vec3 c=vec3(0.);float w=0.;
  for(int i=-2;i<=2;i++)for(int j=-2;j<=2;j++){float k=exp(-float(i*i+j*j)/3.);c+=texture2D(uTex,vUv+vec2(float(i),float(j))*uTexel).rgb*k;w+=k;}
  float l=dot(c/w,vec3(0.3,0.55,0.15));gl_FragColor=vec4(afmhot(pow(l*1.25,1.1)),1.);
}`});
  const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),show);quad.frustumCulled=false;quad.renderOrder=-100;quad.userData.noWire=true;group.add(quad);
  // something to click: the shadow
  const hit=new THREE.Mesh(new THREE.SphereGeometry(S*2.6,24,16),new THREE.MeshBasicMaterial({visible:false}));hit.userData.noWire=true;
  hit.userData.info={name,info:K.info||''};group.add(hit);

  // ---- quality, the spin and the EHT view ----
  const fixedQ=(()=>{const m=/(^|[#&])bhq=([\d.]+)/.exec(location.hash);return m?Math.max(0.2,Math.min(1,+m[2])):null;})();
  const LEVELS=[1,0.75,0.5,0.34];
  let on=false,level=0,ema=16,slow=0,fast=0,last=null,spin=false,eht=false;
  const size=new THREE.Vector2();
  // a frame slower than 30 a second for a second steps the trace down; faster than 55 for three steps it back up
  animHooks.push(now=>{if(!on)return;if(last!=null){const dt=now-last;if(dt<250)ema=ema*0.9+dt*0.1;}last=now;
    if(fixedQ!=null||eht)return;
    if(ema>33){slow+=ema;fast=0;if(slow>1000&&level<LEVELS.length-1){level++;slow=0;}}
    else if(ema<18){fast+=ema;slow=0;if(fast>3000&&level>0){level--;fast=0;}}else{slow=fast=0;}});
  quad.onBeforeRender=(r,s,cam)=>{
    U.uCam.value.copy(cam.position).multiplyScalar(1/S);U.uCamWorld.value.copy(cam.matrixWorld);U.uInvProj.value.copy(cam.projectionMatrixInverse);U.uTime.value=performance.now()/1000;
    renderer.getDrawingBufferSize(size);
    let w,h;
    if(eht){h=K.ehtPixels||30;w=Math.max(1,Math.round(h*size.x/size.y));}
    else{const q=fixedQ!=null?fixedQ:LEVELS[level];w=Math.max(1,Math.round(size.x*q));h=Math.max(1,Math.round(size.y*q));}
    if(rt.width!==w||rt.height!==h)rt.setSize(w,h);DU.uTexel.value.set(0.6/w,0.6/h);
    // drawn the way a mirror is (three's Reflector): into the target, then back to whatever was being drawn to
    const prev=renderer.getRenderTarget();renderer.setRenderTarget(rt);renderer.render(rtScene,rtCam);renderer.setRenderTarget(prev);};

  const J=new THREE.Vector3(0,-(K.spin==null?0.6:K.spin)*0.25,0);   // J = a M^2 with M = 1/2: along -y, the way the disk turns
  function setSpin(v){spin=v;U.uJ.value.copy(v?J:new THREE.Vector3());U.uRin.value=v?(K.spinDisk||1.9):DISK[0];return v;}
  const VIEW=K.view||{az:0.6,el:0.09,d:S*34};
  function setEHT(v){eht=v;DU.uEHT.value=v?1:0;U.uStars.value=v?0:1;U.uJet.value=v?0:(K.jet==null?0.06:K.jet);
    if(api.view)api.view(v?EHTV:VIEW);
    if(v)kit.captions([[0,1e9,K.ehtCaption||'']])(1);else kit.hideCap();return v;}
  const press=(label,v)=>{const b=[...document.querySelectorAll('#ui button')].find(e=>e.textContent===label);if(b)b.setAttribute('aria-pressed',String(v));};
  const buttons={};
  buttons[P+': spin']=()=>press(P+': spin',setSpin(!spin));
  buttons[P+': EHT view']=()=>press(P+': EHT view',setEHT(!eht));

  const EHTV=K.eht||{az:0.6,el:1.27,d:S*40};let first=true;
  return {group,ownSky:true,pick:[hit],get view(){return eht?EHTV:VIEW;},buttons,
    active(v){on=v;last=null;
      if(v&&first&&/(^|[#&])eht(&|$)/.test(location.hash)){eht=true;DU.uEHT.value=1;U.uStars.value=0;U.uJet.value=0;kit.captions([[0,1e9,K.ehtCaption||'']])(1);
        requestAnimationFrame(()=>press(P+': EHT view',true));}
      if(v&&first&&/(^|[#&])spin(&|$)/.test(location.hash)){setSpin(true);requestAnimationFrame(()=>press(P+': spin',true));}
      if(v)first=false;
      if(!v&&eht){eht=false;DU.uEHT.value=0;U.uStars.value=1;U.uJet.value=K.jet==null?0.06:K.jet;press(P+': EHT view',false);}},
    hud:()=>(K.hud||name)+(spin?' · spinning (approximate)':'')+(eht?' · as the EHT saw it':'')+(fixedQ==null&&!eht&&level?' · trace at '+Math.round(LEVELS[level]*100)+'%':''),
    rows:()=>[{x:DISK[0],z:DISK[1],w:S,dpt:420,h:K.peakK||9000}],
    // for sgra.js
    S,isEHT:()=>eht};
}
