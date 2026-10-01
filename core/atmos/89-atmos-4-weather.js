// ================================================================= ATMOS — weather: modes, rain streaks, lightning, fog, wet ground
// ATMOS.weather(o) starts it. Modes: auto (dawn fog, an evening shower 19:30-22:00, from the hour), clear, rain, storm
// (rain with lightning), fog. The state eases toward the mode's target each frame: W.rain, W.fog, W.wet (rises in rain,
// dries after), W.flash (lightning). The module draws the rain and the bolt; what the weather does to the HOST's scene
// (fog density, sun, ground roughness) is the host's: o.apply(W) is called every frame after the state is updated.
// o.ui: an element to put a Weather selector in. Never flashes when the viewer asks for reduced motion.
(function(){const A=ATMOS;
 A.weather=o=>{o=o||{};const T=A.T,W=A.W={mode:o.mode||'auto',rain:0,fog:0,wet:0,flash:0,MODES:['auto','clear','rain','storm','fog']};let last=performance.now();
  const auto=h=>({rain:A.ss(19.5,19.9,h)*(1-A.ss(21.6,22,h)),fog:.7*A.ss(4.3,5.5,h)*(1-A.ss(8.4,9.6,h))});
  // rain: streaks in a 240 m box that travels with the camera
  const N=o.drops||7000,pos=new Float32Array(N*6),end=new Float32Array(N*2);for(let i=0;i<N;i++){const x=A.rr(-120,120),y=A.rr(-120,120),z=A.rr(-120,120);pos.set([x,y,z,x,y,z],i*6);end[i*2+1]=1;}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('tip',new T.BufferAttribute(end,1));
  const rm=new T.ShaderMaterial({uniforms:{time:A.U.time,wind:A.U.wind,light:A.U.light,rain:A.U.rain},transparent:true,depthWrite:false,fog:false,
   vertexShader:`uniform float time;uniform vec2 wind;uniform float rain;attribute float tip;varying float vA;
    void main(){vec3 p=position;p.y=mod(p.y-time*60.0,240.0)-120.0+cameraPosition.y;p.xz=mod(p.xz-cameraPosition.xz+120.0+wind*time*6.0,240.0)-120.0+cameraPosition.xz;
     p+=normalize(vec3(wind.x*0.25,-1.0,wind.y*0.25))*tip*2.4;vec4 mv=viewMatrix*vec4(p,1.0);vA=rain*(1.0-smoothstep(50.0,120.0,length(mv.xyz)))*(0.35+0.65*tip);gl_Position=projectionMatrix*mv;}`,
   fragmentShader:`uniform float light;varying float vA;void main(){gl_FragColor=vec4(vec3(0.72,0.77,0.86)*(0.35+0.65*light),vA*0.42);}`});
  const rain=new T.LineSegments(g,rm);rain.frustumCulled=false;rain.renderOrder=4;rain.name='atmos:rain';A.add(rain);A.noRay(rain);
  // lightning: a jagged ribbon far off, a double flash
  const K=14,bp=new Float32Array((K+1)*6),idx=[];for(let k=0;k<K;k++){const q=k*2;idx.push(q,q+1,q+2,q+1,q+3,q+2);}
  const bg=new T.BufferGeometry();bg.setAttribute('position',new T.BufferAttribute(bp,3));bg.setIndex(idx);
  const bm=new T.MeshBasicMaterial({color:0xe8ecff,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false,side:T.DoubleSide});
  const bolt=new T.Mesh(bg,bm);bolt.frustumCulled=false;bolt.visible=false;A.add(bolt);A.noRay(bolt);
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;let next=performance.now()+6000,t0=-1e9;
  const strike=()=>{const cam=A.h.camera.position,a=A.rnd()*Math.PI*2,dist=700+A.rnd()*500,cx=cam.x+Math.cos(a)*dist,cz=cam.z+Math.sin(a)*dist,top=380+A.rnd()*120,base=A.ground(cx,cz);
   const sx=-Math.sin(a),sz=Math.cos(a);let x=cx,z=cz;for(let k=0;k<=K;k++){const y=top+(base-top)*k/K;if(k){x+=(A.rnd()-.5)*40;z+=(A.rnd()-.5)*40;}const w=3.2-2.4*k/K;bp.set([x-sx*w,y,z-sz*w,x+sx*w,y,z+sz*w],k*6);}
   bg.attributes.position.needsUpdate=true;bg.computeBoundingSphere();t0=performance.now();next=t0+5000+A.rnd()*9000;};
  A.hook((t,h)=>{const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;const M=W.mode,au=auto(h);
   const tr=M==='rain'?.75:M==='storm'?1:M==='auto'?au.rain:0,tf=M==='fog'?1:M==='auto'?au.fog:M==='storm'?.3:0;
   W.rain+=(tr-W.rain)*Math.min(1,dt*1.5);W.fog+=(tf-W.fog)*Math.min(1,dt*.8);W.wet=Math.min(1,Math.max(0,W.wet+dt*(W.rain>.15?.12*W.rain:-.02)));
   if(M==='storm'&&!reduce&&W.rain>.6&&now>next&&!document.hidden)strike();const e=now-t0;W.flash=e<80?1:e<150?.25:e<230?.8:e<600?.8*(1-(e-230)/370):0;
   A.U.rain.value=W.rain;A.U.fog.value=W.fog;A.U.flash.value=W.flash;rain.visible=W.rain>.01;bolt.visible=W.flash>.01;bm.opacity=Math.min(1,W.flash*1.5);
   if(o.apply)o.apply(W);});
  if(o.ui)A.weatherUI(o.ui);A.strike=strike;return W;};
 // the Weather selector, appended to any element (a host may call it later, once its own toolbar is laid out)
 A.weatherUI=el=>{const W=A.W;if(!W||!el)return null;const sel=document.createElement('select');sel.id='atmosWeather';sel.title='Weather';sel.setAttribute('aria-label','Weather');
  for(const m of W.MODES){const op=document.createElement('option');op.value=m;op.textContent=m;sel.appendChild(op);}sel.value=W.mode;sel.onchange=()=>{W.mode=sel.value;};el.appendChild(sel);return sel;};
})();
