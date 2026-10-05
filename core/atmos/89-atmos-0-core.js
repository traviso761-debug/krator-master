// ================================================================= ATMOS — core: the host binding, the clock, instanced sets, the glow registry
// ATMOS is the portable atmosphere and street-dressing module (core/atmos/README.md): evening lights, glow, particles,
// weather, ivy and window boxes, sewer grates, street lamps and fountains, culling. Every fragment is a closure that
// adds to the one global `ATMOS`; nothing else is declared at top level, so any build can include the files.
// A build binds it once:
//   ATMOS.init({THREE, scene, camera, hour:()=>0..24, onFrame:fn=>{/* call fn(dt) every frame */}, ground:(x,z)=>y, seed,
//     err:msg=>{}, viewH:()=>innerHeight, pixelRatio:()=>renderer.getPixelRatio()})
// then places things with the module calls and ends with ATMOS.finish() (bakes the instanced sets, builds the glow).
// Its own PRNG (ATMOS.seed / rnd / rr / pick): it never touches the host's stream.
const ATMOS={};
(function(){const A=ATMOS;
 A.init=function(h){A.h=h;const T=A.T=h.THREE,P=A.PRESETS,PW=P.wind,PC=P.clock;A.root=new T.Group();A.root.name='atmos';h.scene.add(A.root);
  A.sets={};A.glow=[];A.lamps=[];A.lampGlow=[];A.fx=[];A.hooks=[];A.stats={};A.seed(h.seed||1);
  // THE UNIFORMS every shader shares (a game engine's global shader parameters; GODOT.md lists them as atm_*)
  A.U={hour:{value:0},night:{value:0},time:{value:0},rain:{value:0},fog:{value:0},flash:{value:0},wind:{value:new T.Vector2(PW.base[0],PW.base[1])},gustAmp:{value:PW.gustAmp},
   windOff:{value:new T.Vector2()},light:{value:1},px:{value:600}};
  A.windBase=new T.Vector2(PW.base[0],PW.base[1]);A.windScale=1;let warned=false;
  // the shared GLSL, written from the presets so JS and shaders agree
  const f=A.glf;
  A.GLSL_WIND=`float atmGust(float t,vec2 xz,vec2 w){float s=t-dot(xz,w)/max(length(w),1e-3)/${f(PW.frontSpeed)};return ${PW.gust.map(g=>`${f(g[0])}*sin(s*${f(g[1])}+${f(g[2])})`).join('+')};}
  vec2 atmWind(float t,vec2 xz,vec2 w,float amp){return w*(1.0+amp*atmGust(t,xz,w));}`;
  A.GLSL_LIT=`float atmLit(float h,vec2 t){float hh=h<12.0?h+24.0:h;return smoothstep(t.x,t.x+${f(PC.ramp)},hh)*(1.0-smoothstep(t.y-${f(PC.ramp)},t.y,hh));}`;
  // THE CLOCK: the module's own simulation time in seconds, from 0 at init. The HOST owns real time: its frame call
  // passes dt (seconds since its last frame, capped by the host) as the first argument of the onFrame callback, and the
  // module never reads a wall clock. clock.scale speeds it up or stops it (0); clock.fixed pins it (deterministic shots:
  // every shader and hook sees that time, and nothing eases). Godot's Atmos autoload does the same from _process(delta).
  A.clock={t:0,dt:0,scale:1,fixed:null};
  // the view: sprite sizes are framebuffer pixels, so px needs the view's height in CSS pixels (h.viewH) and the pixel
  // ratio (h.pixelRatio), each a number or a function; the host reads them from its window
  const num=(v,d)=>{const r=typeof v==='function'?v():v;return r>0?r:d;};
  h.onFrame(hostDt=>{const C=A.clock;let real=+hostDt;if(!(real>=0)){if(!warned){warned=true;A.err('onFrame must pass dt in seconds as its first argument; stepping 1/60 s');}real=1/60;}
   C.dt=C.fixed!=null?0:Math.min(.1,real)*C.scale;C.t=C.fixed!=null?C.fixed:C.t+C.dt;
   const t=C.t,dt=C.dt,hr=h.hour(),U=A.U;U.hour.value=hr;U.night.value=A.night(hr);U.time.value=t;U.light.value=1-PC.nightDim*U.night.value;
   // the wind: a base vector (A.windBase, slowly veering) times A.windScale (the weather raises it); gusts are added per
   // place and time by atmGust() in the shaders. windOff is the base wind integrated over time, for things that ride it (rain)
   const v=PW.veer,veer=v[0]*Math.sin(t*v[1])+v[2]*Math.sin(t*v[3]+1.7),c=Math.cos(veer),s=Math.sin(veer),b=A.windBase;U.wind.value.set((b.x*c-b.y*s)*A.windScale,(b.x*s+b.y*c)*A.windScale);
   U.windOff.value.addScaledVector(U.wind.value,dt);
   U.px.value=num(h.viewH,720)*num(h.pixelRatio,1)/(2*Math.tan(h.camera.fov*Math.PI/360));for(const fn of A.hooks){try{fn(t,hr,dt);}catch(e){A.err('frame: '+e.message);}}});
  for(const fn of A.onInit)fn(h);};
 // later fragments that need the bound host (A.T, A.U, A.hook) push a setup function here; init runs them in file order
 A.onInit=[];
 A.glf=v=>{const q=String(+v);return/[.e]/.test(q)?q:q+'.0';};   // a number as a GLSL float literal
 A.err=m=>{if(A.h&&A.h.err)A.h.err('atmos: '+m);else console.warn('atmos: '+m);};
 A.hook=fn=>A.hooks.push(fn);   // fn(t, hour, dt): t and dt are the module clock's seconds
 A.ground=(x,z)=>A.h.ground?A.h.ground(x,z):0;
 // EFFECT RECORDS: every placing call also records what it placed, as plain data (ATMOS.export() writes them out)
 A.rec=(type,o)=>{const r=Object.assign({id:type+'_'+A.fx.length,type},o);A.fx.push(r);return r;};
 // the clock: night factor, and a light's on/off window (on in the evening, off next morning; off may be past 24)
 A.ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
 A.night=h=>{const C=A.PRESETS.clock;return Math.min(1,Math.max(0,1-A.ss(C.dawn[0],C.dawn[1],h)+A.ss(C.dusk[0],C.dusk[1],h)));};
 A.litAt=(h,on,off)=>{const hh=h<12?h+24:h,r=A.PRESETS.clock.ramp;return A.ss(on,on+r,hh)*(1-A.ss(off-r,off,hh));};
 // GUSTS: a gust factor in -1..1 at time t and place (x,z). Gust fronts travel downwind (wind.frontSpeed m/s), so
 // neighbours differ and a plume shows the wave going up it. The same sum in JS (A.gust, A.windAt) and GLSL (atmGust, atmWind).
 A.gust=(t,x,z)=>{const P=A.PRESETS.wind,w=A.U.wind.value,l=Math.hypot(w.x,w.y)||1,s=t-(x*w.x+z*w.y)/l/P.frontSpeed;let g=0;for(const q of P.gust)g+=q[0]*Math.sin(s*q[1]+q[2]);return g;};
 A.windAt=(t,x,z)=>{const w=A.U.wind.value,f=1+A.U.gustAmp.value*A.gust(t,x,z);return[w.x*f,w.y*f];};
 // HAZE: how much fog and rain thicken the air for a light (beams and halos read stronger in it)
 A.haze=()=>1+1.6*A.U.fog.value+.9*A.U.rain.value;
 // PRNG (mulberry32)
 let s=1;A.seed=n=>{s=(n>>>0)||1;};A.rnd=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 // a separate stream (same generator) for things added late, so they never shift the placement stream
 A.stream=n=>{let s=(n>>>0)||1;return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
 A.rr=(a,b)=>a+(b-a)*A.rnd();A.pick=a=>a[Math.floor(A.rnd()*a.length)];
 A.col=hex=>new A.T.Color(hex).convertSRGBToLinear();
 // shared geometry (unit sizes; posts and cones stand on y=0) and cached materials
 const G={};A.geo=k=>{if(G[k])return G[k];const T=A.T;
  G[k]=k==='box'?new T.BoxGeometry(1,1,1):k==='post'?new T.CylinderGeometry(1,1,1,8).translate(0,.5,0):k==='post16'?new T.CylinderGeometry(1,1,1,16).translate(0,.5,0):
   k==='ball'?new T.SphereGeometry(1,8,6):k==='cone'?new T.ConeGeometry(1,1,7).translate(0,.5,0):k==='plane'?new T.PlaneGeometry(1,1):null;return G[k];};
 A.geoPut=(k,g)=>(G[k]=g);A.geoKinds=()=>G;
 const M={};A.mat=(k,make)=>M[k]||(M[k]=make());
 A.lam=(hex,rough)=>A.mat('std'+hex+'_'+(rough||.85),()=>new A.T.MeshStandardMaterial({color:hex,roughness:rough||.85,metalness:0}));
 // INSTANCED SETS: put() collects, finish() bakes one InstancedMesh per set. Item: [x,y,z, sx,sy,sz, ry|Quaternion, color]
 A.set=(name,geo,mat)=>A.sets[name]||(A.sets[name]={geo:typeof geo==='string'?A.geo(geo):geo,mat,items:[]});
 A.put=(name,item)=>{A.sets[name].items.push(item);};
 A.bakeSets=()=>{const T=A.T,m=new T.Matrix4(),p=new T.Vector3(),sc=new T.Vector3(),q0=new T.Quaternion(),qy=new T.Quaternion(),Y=new T.Vector3(0,1,0),W=new T.Color(1,1,1);
  for(const name in A.sets){const S=A.sets[name];if(!S.items.length||S.mesh)continue;const im=new T.InstancedMesh(S.geo,S.mat,S.items.length);let col=false;
   S.items.forEach((o,i)=>{p.set(o[0],o[1],o[2]);sc.set(o[3],o[4],o[5]);const q=o[6]==null?q0:(o[6].isQuaternion?o[6]:qy.setFromAxisAngle(Y,o[6]));m.compose(p,q,sc);im.setMatrixAt(i,m);if(o[7]!=null)col=true;});
   if(col)S.items.forEach((o,i)=>im.setColorAt(i,o[7]!=null?(o[7].isColor?o[7]:A.col(o[7])):W));
   im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.name='atmos:'+name;im.userData.atmos=name;A.root.add(im);S.mesh=im;A.stats[name]=S.items.length;}};
 // the GLOW registry: a soft additive sprite over every light. on/off are the light's hours (on<0: follows the night)
 A.glowAdd=(x,y,z,col,size,on,off)=>{A.glow.push([x,y,z,col[0],col[1],col[2],size||6,on==null?-1:on,off==null?30:off]);};
 A.noRay=o=>{o.raycast=()=>{};o.userData.probeSkip=true;return o;};
 A.add=o=>{A.root.add(o);return o;};
 // SPRITE CLOUDS: camera-facing quads, one instance per particle (not GL points: points clip at the screen edge as soon as
 // their centre leaves it, are capped in size by the driver, and have no equivalent in a game engine; a quad maps 1:1 onto a
 // Godot MultiMesh or particle quad). attrs: {name:[itemSize, array]}, one item per particle; the particle's position
 // goes in `ipos`. The vertex shader works out mv (view-space centre) and ps (on-screen size in pixels, as gl_PointSize
 // did) and ends with gl_Position=atmQuad(mv,ps); the fragment shader reads vUv (0..1 across the sprite, as gl_PointCoord).
 A.GLSL_QUAD='attribute vec3 ipos;uniform float px;varying vec2 vUv;\n vec4 atmQuad(vec4 mv,float ps){vUv=position.xy+0.5;return projectionMatrix*vec4(mv.xy+position.xy*ps*max(-mv.z,1e-3)/px,mv.z,1.0);}';
 A.sprites=(name,attrs,m,order)=>{const T=A.T,g=new T.InstancedBufferGeometry(),n=attrs.ipos[1].length/3;
  g.setAttribute('position',new T.Float32BufferAttribute([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3));g.setIndex([0,1,2,0,2,3]);
  for(const k in attrs)g.setAttribute(k,new T.InstancedBufferAttribute(new Float32Array(attrs[k][1]),attrs[k][0]));g.instanceCount=n;
  const mesh=new T.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=order||3;mesh.name='atmos:'+name;A.add(mesh);A.noRay(mesh);A.stats[name]=n;return mesh;};
 A.finish=()=>{A.bakeSets();if(A.buildGlow)A.buildGlow();return A.stats;};
})();
