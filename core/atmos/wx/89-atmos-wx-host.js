// ================================================================= ATMOS — weather cells on a three.js page (W5, the host side)
// [web] ATMOS.weatherCells(o) turns on the moving weather (wx/89-atmos-wx-cells.js, the data) on a page that has ATMOS.weather
// (bindWeather calls it with o.cells): the mode 'live' joins the Weather selector, and while it is chosen
//   W        the camera's sample (ATMOS.weatherAt) is the page's W each frame: the rain, the fog, the snow and the ash fall
//            where the cells are, the ground wets under them and dries after they pass (4-weather's step takes it as it is)
//   the sky  the coverage map (n x n texels over span m round the camera, redrawn every map.every s or when the camera has
//            moved a texel's worth) clouds the sky over the cells and darkens a storm's base (sky/89-atmos-g-sky.js, atmWx);
//            the cloud shadows on the ground read the same map, so a cell's shadow lies under its cloud
//   strikes  a storm cell strikes in its core (ATMOS.wxStrikes: by the clock, the same at any frame rate): a branched bolt from
//            the cloud base to the ground (fx/89-atmos-fx-lightning.js, ATMOS.boltFx, with the strike's own seed), the flash
//            dimmed by distance, and its thunder (ATMOS.thunder, ATMOS.onThunder: core/audio's) delayed dist / 343 s
//   shafts   rain shafts under the nearest precipitating cells and virga (rain that dries before the ground, the dry
//            climates' kind): soft, streaked, open cylinders, one draw (PRESETS.wxcells.shafts.max instances)
//   splashes on the ground and on cover round the camera (fx/89-atmos-fx-raincover.js, ATMOS.rainSplashes) when that file is listed
// ?weather=<mode> in the page's URL picks the mode at load and holds it there (verify passes ?weather=clear, so its views and
// asserts stay what they were); o.mode is the page's own start (default: the weather's, which bindWeather keeps 'clear').
//   ATMOS.weatherCells({seed, climate (bindWeather's), biome (kits/crops' CROPS.BIOMES name: the warmth, aridity and air
//                       axes), axes, weights, wind, mode, shafts (false: none), splashes (false: none), reduceMotion}) -> S
//   ATMOS.wx            the system (plain data: ATMOS.export's 'wxcells' record); ATMOS.wxState {live, strikes, last, map}
// Needs ATMOS.init, 89-atmos-4-weather.js, core/rand (KRAND) and wx/89-atmos-wx-cells.js before it; the shared sky for the map.
(function(){const A=ATMOS;
 A.PRESETS.wxshafts=A.PRESETS.wxshafts||{segs:20,alpha:.62,grey:.62,snow:.86,lean:.35,streaks:46,fall:.012,base:.12,virga:[.3,.72]};
 A.weatherCells=function(o){o=o||{};const T=A.T,W=A.W;if(!W){A.err('weatherCells needs ATMOS.weather (ATMOS.bindWeather) first');return null;}
  if(typeof KRAND==='undefined'){A.err('weatherCells needs core/rand (KRAND)');return null;}
  const axes=o.axes||(typeof CROPS!=='undefined'&&o.biome?A.wxAxesFromCrops(CROPS,o.biome):null);
  const S=A.wx=A.wxSystem({seed:o.seed==null?KRAND.child((A.h&&A.h.seed)||1,'weather'):o.seed,climate:o.climate,axes,weights:o.weights,wind:o.wind,speed:o.speed});
  if(W.MODES.indexOf('live')<0)W.MODES=W.MODES.concat(['live']);
  let q=null;try{q=new URLSearchParams(location.search).get('weather');}catch(e){q=null;}
  if(q&&W.MODES.indexOf(q)>=0)W.mode=q;else if(o.mode)W.mode=o.mode;
  const snowOK=W.MODES.indexOf('snowfall')>=0,ashOK=W.MODES.indexOf('ash')>=0,reduce=!!o.reduceMotion;
  // the coverage map: bytes over the shared uniforms (the sky host made them; made here when there is no sky yet)
  const M=S.P.map,n=M.n,buf=new Float32Array(n*n*4),bytes=new Uint8Array(n*n*4),tex=new T.DataTexture(bytes,n,n,T.RGBAFormat);
  tex.minFilter=tex.magFilter=T.LinearFilter;tex.wrapS=tex.wrapT=T.ClampToEdgeWrapping;tex.generateMipmaps=false;tex.needsUpdate=true;
  A.U.wxMap=A.U.wxMap||{value:null};A.U.wxBox=A.U.wxBox||{value:new T.Vector4()};A.U.wxMean=A.U.wxMean||{value:new T.Vector4()};
  A.U.wxMap.value=tex;{const m=A.wxMean(S);A.U.wxMean.value.set(m[0],m[1],m[2],m[3]);}
  const st=A.wxState={live:null,strikes:0,last:null,map:{cx:null,cz:null,t:-1e9,draws:0}};
  const drawMap=(t,c)=>{const px=M.span/n,cx=Math.round(c.x/px)*px,cz=Math.round(c.z/px)*px;
   A.wxCoverMap(S,t,cx,cz,{out:buf});for(let i=0;i<buf.length;i++)bytes[i]=Math.round(Math.max(0,Math.min(1,buf[i]))*255);
   tex.needsUpdate=true;A.U.wxBox.value.set(cx,cz,M.span,1);st.map.cx=cx;st.map.cz=cz;st.map.t=t;st.map.draws++;};
  const cloudBase=()=>o.cloudBase!=null?o.cloudBase:A.skyCur?A.skyCur.uniforms.uCloudH.value.x:1600;
  const ground=(x,z)=>A.h&&A.h.ground?A.h.ground(x,z):0;
  let lastT=null;
  // called by the weather's own hook before its step (4-weather): the sample, the map, the strikes
  A.wxLive=(t,W)=>{const live=W.mode==='live',c=A.h.camera.position;A.U.wxBox.value.w=live?1:0;
   if(!live){W.live=null;lastT=t;return;}
   const L=A.weatherAt(c.x,c.z,t,S);
   if(!snowOK){L.rain=1-(1-L.rain)*(1-.8*L.snow);L.snow=0;}   /* a page without the snow's drawing: its snow cells rain */
   if(!ashOK){L.fog=1-(1-L.fog)*(1-.5*L.ash);L.ash=0;}         /* ...and its ash cells haze */
   W.live=st.live=L;
   const px=M.span/n;if(st.map.cx==null||t-st.map.t>=M.every||t<st.map.t||Math.abs(c.x-st.map.cx)>px||Math.abs(c.z-st.map.cz)>px)drawMap(t,c);
   if(lastT!=null&&t>lastT&&t-lastT<5&&!reduce){for(const s of A.wxStrikes(S,lastT,t,c.x,c.z,o.strikeRange==null?16000:o.strikeRange)){
     const d=Math.max(1,Math.hypot(s.x-c.x,s.z-c.z)),top=cloudBase(),base=ground(s.x,s.z);
     if(A.boltFx)A.boltFx({x:s.x,z:s.z,top:Math.max(top,base+200),base,dist:d,t:s.t,ash:s.ash&&ashOK,seed:s.seed});
     if(A.flashNow)A.flashNow(Math.min(1,s.power*Math.max(.15,Math.min(1,2500/d))));st.strikes++;st.last=s;}}
   lastT=t;};
  // THE SHAFTS: one instanced open cylinder (unit radius, y 0..1) per precipitating cell, from the cloud base to the ground
  if(o.shafts!==false){const P=A.PRESETS.wxshafts,F=A.glf,NM=S.P.shafts.max,cyl=new T.CylinderGeometry(1,1,1,P.segs,1,true);cyl.translate(0,.5,0);
   const g=new T.InstancedBufferGeometry();g.index=cyl.index;g.setAttribute('position',cyl.getAttribute('position'));g.setAttribute('uv',cyl.getAttribute('uv'));
   const ia=new Float32Array(NM*4),ib=new Float32Array(NM*4),aA=new T.InstancedBufferAttribute(ia,4),aB=new T.InstancedBufferAttribute(ib,4);
   aA.setUsage(T.DynamicDrawUsage);aB.setUsage(T.DynamicDrawUsage);g.setAttribute('iA',aA);g.setAttribute('iB',aB);g.instanceCount=0;
   const U=Object.assign(T.UniformsUtils.clone(T.UniformsLib.fog),{time:A.U.time,wind:A.U.wind,light:A.U.light});
   const mat=new T.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,fog:true,side:T.FrontSide,
    vertexShader:`uniform float time;uniform vec2 wind;attribute vec4 iA;attribute vec4 iB;varying vec2 vUv;varying float vK;varying float vEdge;varying float vNear;varying vec2 vKind;
     #include <fog_pars_vertex>
     void main(){vec3 p=position;float y=mix(iB.y,iB.x,p.y);vec2 lean=wind/max(length(wind),1e-3)*(1.0-p.y)*(iB.x-iB.y)*${F(P.lean)};
      vec3 w=vec3(iA.x+p.x*iA.z+lean.x,y,iA.y+p.z*iA.z+lean.y);vec4 mvPosition=viewMatrix*vec4(w,1.0);
      vec3 V=normalize(cameraPosition-w);vEdge=abs(dot(normalize(vec3(p.x,0.0,p.z)),V));vUv=vec2(uv.x,p.y);vK=iA.w;vKind=iB.zw;
      vNear=(length(cameraPosition.xz-iA.xy)-iA.z)*(1.0-smoothstep(iB.x-150.0,iB.x+50.0,cameraPosition.y));   /* above the cloud base the cloud hides it */gl_Position=projectionMatrix*mvPosition;
      #include <fog_vertex>
     }`,
    fragmentShader:`uniform float time;uniform float light;varying vec2 vUv;varying float vK;varying float vEdge;varying float vNear;varying vec2 vKind;
     #include <fog_pars_fragment>
     float atmShH(float x){uint h=uint(int(floor(x))+1000000)*2654435761u;h^=h>>15u;h*=2246822519u;h^=h>>13u;return float(h&65535u)/65535.0;}
     void main(){float u=vUv.x*${F(P.streaks)},fu=fract(u),s0=atmShH(u),s1=atmShH(u+1.0);float streak=mix(s0,s1,fu*fu*(3.0-2.0*fu));
      float fall=fract(vUv.y*5.0+time*${F(P.fall)}+s0*7.0);streak=0.55+0.45*streak*(0.75+0.25*smoothstep(0.0,0.6,fall)*smoothstep(1.0,0.6,fall));
      float a=vK*pow(vEdge,1.3)*streak*smoothstep(0.0,${F(P.base)},1.0-vUv.y);
      a*=vKind.x>0.5?smoothstep(${F(P.virga[0])},${F(P.virga[1])},vUv.y):smoothstep(0.0,0.04,vUv.y);
      a*=smoothstep(0.0,600.0,vNear);if(a<0.003)discard;
      vec3 c=mix(vec3(${F(P.grey)}),vec3(${F(P.snow)}),vKind.y)*(0.25+0.75*light);
      gl_FragColor=vec4(c,a*${F(P.alpha)});
      #ifdef USE_FOG
      gl_FragColor.rgb=mix(gl_FragColor.rgb,fogColor*0.7,0.45);
      #endif
      #include <fog_fragment>
     }`});
   const mesh=new T.Mesh(g,mat);mesh.frustumCulled=false;mesh.renderOrder=3;mesh.name='atmos:wxshafts';A.add(mesh);A.noRay(mesh);
   let shT=-1e9;A.hook(t=>{const live=W.mode==='live';mesh.visible=live;if(!live)return;if(t-shT<.5&&t>=shT)return;shT=t;
    const c=A.h.camera.position,L=A.wxShafts(S,c.x,c.z,t),top=cloudBase();
    L.forEach((s,i)=>{const b=ground(s.x,s.z);ia.set([s.x,s.z,s.r,Math.min(1,s.k)],i*4);ib.set([Math.max(top,b+150),b,s.virga,s.kind==='snow'?1:0],i*4);});
    g.instanceCount=L.length;aA.needsUpdate=true;aB.needsUpdate=true;A.stats.wxshafts=L.length;});}
  if(o.splashes!==false&&A.rainSplashes)A.rainSplashes(o.splashOpts||{});
  A.rec('wxcells',{system:{seed:S.seed,dx:S.dx,dz:S.dz,vx:S.vx,vz:S.vz,weights:S.weights,cum:S.cum,virga:S.virga,reach:S.reach},preset:'wxcells',mode:W.mode,
   note:'ATMOS.weatherAt(x, z, t) on this system and PRESETS.wxcells is the local W; the camera\'s sample is the page\'s W in mode live; the coverage map n x n over span m feeds the sky (atmWx)'});
  return S;};
})();
