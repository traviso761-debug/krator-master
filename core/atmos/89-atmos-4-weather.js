// ================================================================= ATMOS — weather: modes, rain streaks, lightning, fog, wet ground
// ATMOS.weather(o) starts it. Modes: auto (dawn fog, an evening shower 19:30-22:00, from the hour), clear, rain, storm
// (rain with lightning), fog. The state eases toward the mode's target each frame: W.rain, W.fog, W.wet (rises in rain,
// dries after), W.flash (lightning). The module draws the rain and the bolt; what the weather does to the HOST's scene
// (fog density, sun, ground roughness) is the host's. W.wind (1 calm .. 2.4 storm) scales the module's wind.
// o.apply(W) is called every frame after the state is updated.
// o.ui: an element to put a Weather selector in. Never flashes when the viewer asks for reduced motion.
(function(){const A=ATMOS;
 // THE STATE MACHINE, pure: what the weather is heading for at an hour in a mode, one eased step of the state, and
 // the lightning flash e ms after a strike. No THREE, no DOM: test-atmos.js runs these, and Godot's Atmos autoload
 // ports them line for line.
 A.MODES=['auto','clear','rain','storm','fog'];
 A.weatherAuto=h=>({rain:A.ss(19.5,19.9,h)*(1-A.ss(21.6,22,h)),fog:.7*A.ss(4.3,5.5,h)*(1-A.ss(8.4,9.6,h))});
 A.weatherTarget=(M,h)=>{const au=A.weatherAuto(h),PW=A.PRESETS.wind.weather;
  return{rain:M==='rain'?.75:M==='storm'?1:M==='auto'?au.rain:0,fog:M==='fog'?1:M==='auto'?au.fog:M==='storm'?.3:0,
   wind:M==='storm'?PW.storm:M==='rain'?PW.rain:M==='auto'?1+PW.autoRain*au.rain:PW.clear};};
 A.weatherStep=(W,h,dt)=>{const g=A.weatherTarget(W.mode,h);W.rain+=(g.rain-W.rain)*Math.min(1,dt*1.5);W.fog+=(g.fog-W.fog)*Math.min(1,dt*.8);
  W.wet=Math.min(1,Math.max(0,W.wet+dt*(W.rain>.15?.12*W.rain:-.02)));W.wind+=(g.wind-W.wind)*Math.min(1,dt*.4);return W;};
 A.flashAt=e=>e<80?1:e<150?.25:e<230?.8:e<600?.8*(1-(e-230)/370):0;
 A.weatherState=mode=>({mode:mode||'auto',rain:0,fog:0,wet:0,flash:0,wind:1,MODES:A.MODES});
 // o.reduceMotion (the host reads the viewer's setting): never flash
 A.weather=o=>{o=o||{};const T=A.T,W=A.W=A.weatherState(o.mode);
  // rain: streaks in a box (240 m) that travels with the camera
  const P=A.PRESETS.rain,F=A.glf,B=P.box/2,N=o.drops||P.drops,pos=new Float32Array(N*6),end=new Float32Array(N*2);for(let i=0;i<N;i++){const x=A.rr(-B,B),y=A.rr(-B,B),z=A.rr(-B,B);pos.set([x,y,z,x,y,z],i*6);end[i*2+1]=1;}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('tip',new T.BufferAttribute(end,1));
  const rm=new T.ShaderMaterial({uniforms:{time:A.U.time,wind:A.U.wind,windOff:A.U.windOff,light:A.U.light,rain:A.U.rain},transparent:true,depthWrite:false,fog:false,
   vertexShader:`uniform float time;uniform vec2 wind;uniform vec2 windOff;uniform float rain;attribute float tip;varying float vA;
    void main(){vec3 p=position;p.y=mod(p.y-time*${F(P.fall)},${F(P.box)})-${F(B)}+cameraPosition.y;p.xz=mod(p.xz-cameraPosition.xz+${F(B)}+windOff*${F(P.windRide)},${F(P.box)})-${F(B)}+cameraPosition.xz;
     p+=normalize(vec3(wind.x*${F(P.slant)},-1.0,wind.y*${F(P.slant)}))*tip*${F(P.streak)};vec4 mv=viewMatrix*vec4(p,1.0);vA=rain*(1.0-smoothstep(${F(P.fade[0])},${F(P.fade[1])},length(mv.xyz)))*(0.35+0.65*tip);gl_Position=projectionMatrix*mv;}`,
   fragmentShader:`uniform float light;varying float vA;void main(){gl_FragColor=vec4(vec3(${P.color.map(F).join(',')})*(0.35+0.65*light),vA*${F(P.alpha)});}`});
  const rain=new T.LineSegments(g,rm);rain.frustumCulled=false;rain.renderOrder=4;rain.name='atmos:rain';A.add(rain);A.noRay(rain);
  // lightning: a jagged ribbon far off, a double flash
  const K=14,bp=new Float32Array((K+1)*6),idx=[];for(let k=0;k<K;k++){const q=k*2;idx.push(q,q+1,q+2,q+1,q+3,q+2);}
  const bg=new T.BufferGeometry();bg.setAttribute('position',new T.BufferAttribute(bp,3));bg.setIndex(idx);
  const bm=new T.MeshBasicMaterial({color:0xe8ecff,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false,side:T.DoubleSide});
  const bolt=new T.Mesh(bg,bm);bolt.frustumCulled=false;bolt.visible=false;A.add(bolt);A.noRay(bolt);
  const reduce=!!o.reduceMotion;let next=A.clock.t*1000+6000,t0=-1e9;
  const strike=()=>{const cam=A.h.camera.position,a=A.rnd()*Math.PI*2,dist=700+A.rnd()*500,cx=cam.x+Math.cos(a)*dist,cz=cam.z+Math.sin(a)*dist,top=380+A.rnd()*120,base=A.ground(cx,cz);
   const sx=-Math.sin(a),sz=Math.cos(a);let x=cx,z=cz;for(let k=0;k<=K;k++){const y=top+(base-top)*k/K;if(k){x+=(A.rnd()-.5)*40;z+=(A.rnd()-.5)*40;}const w=3.2-2.4*k/K;bp.set([x-sx*w,y,z-sz*w,x+sx*w,y,z+sz*w],k*6);}
   bg.attributes.position.needsUpdate=true;bg.computeBoundingSphere();t0=A.clock.t*1000;next=t0+5000+A.rnd()*9000;};
  A.hook((t,h,dt)=>{const now=t*1000;A.weatherStep(W,h,dt);
   if(W.mode==='storm'&&!reduce&&W.rain>.6&&now>next)strike();W.flash=A.flashAt(now-t0);A.windScale=W.wind;A.U.gustAmp.value=.55+.25*Math.min(1,W.wind-1);
   A.U.rain.value=W.rain;A.U.fog.value=W.fog;A.U.flash.value=W.flash;rain.visible=W.rain>.01;bolt.visible=W.flash>.01;bm.opacity=Math.min(1,W.flash*1.5);
   if(o.apply)o.apply(W);});
  A.rec('weather',{preset:'rain',modes:W.MODES,mode:W.mode,drops:N,auto:{rain:[19.5,19.9,21.6,22],fog:[.7,4.3,5.5,8.4,9.6]},storm:{fog:.3,strikeEvery:[5,14],strikeDist:[700,1200]},
   note:'auto: rain ramps up over the first pair of hours and down over the second; fog = scale * ramps. W.rain/fog/wet/flash/wind are the state a host reads'});
  if(o.ui&&A.weatherUI)A.weatherUI(o.ui);A.strike=strike;return W;};   // the selector itself is host code: 89-atmos-9-host.js
})();
