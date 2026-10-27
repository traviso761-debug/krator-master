// ================================================================= CORE — lava on the GPU (KLAVA.gpu): the same step as render passes
// [G shader] core/terrain/46-core-lava.js's step, cell for cell, as fragment shaders on float textures (render-to-texture,
// ping-pong), for a flow that runs in real time over a big lattice. Three.js r128 on WebGL2 (float render targets: the
// renderer's EXT_color_buffer_float). The arithmetic is the CPU stepper's in float32 (the ground relative to the sim's
// lowest point, so 20 km summits keep centimetres), so the two agree within a tolerance, not to the bit (a page's verify
// compares them: KLAVA.gpuCheck). Godot: the same passes as a compute shader or SubViewports (core/terrain/LAVA.md).
//
//   const G = KLAVA.gpu(renderer, sim)   takes the sim's state now (z, h, T, dep, its vents and ponds: up to 4 of each)
//   G.step(dt)          one step on the GPU (each vent's Q(t) and each pond's level(t, out) read on the CPU at sim.t;
//                       the ponds' out is not tallied on the GPU: a pond whose level follows its out runs on the CPU)
//   G.run(seconds, dt)  fixed steps of dt (default sim.dtNext): no reduction for an adaptive dt on the GPU
//   G.pull()            reads the state back into the sim's arrays (z, h, T, dep; molten counted): slow, for checks and saves
//   G.push()            uploads the sim's arrays (after a CPU edit or a restore)
//   G.texture           the state now, RGBA32F: r ground - G.zRef, g thickness, b temperature (K), a deposit; a lava
//                       surface can read it in its vertex shader (texelFetch at the cell) instead of pulling
//   G.dispose()
//   KLAVA.gpuCheck(renderer, mk, steps, dt) -> {dh, dT, mass}: runs a sim from mk() on the CPU and another on the GPU for
//                       `steps` fixed steps and gives the worst differences (m, K) and the molten-plus-frozen volumes' ratio
(function(root){
 const K=root.KLAVA||(root.KLAVA={});   /* the data half may load after this one: both merge into the same object */
 const GL=v=>{const s=String(v);return /[.eE]/.test(s)?s:s+'.0';};
 const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}';
 // the shared GLSL: a cell's state with its pond held, the rheology, the pair's flux, the eight volumes it sends
 function common(sim){const R=sim.rheo,e=R.eta,vft=e.length>2;return [
  'precision highp float;precision highp int;',
  'uniform sampler2D uS;uniform sampler2D uP;uniform ivec2 uN;uniform float uCs,uDt,uHmin;uniform float uPondL[4];uniform float uPondT[4];',
  'const int DI[8]=int[8](1,-1,0,0,1,-1,-1,1);const int DJ[8]=int[8](0,0,1,-1,1,-1,1,-1);',
  'const float WO=2.0/3.0,WD=0.23570226039551584,KO=0.1,KD=0.025,RHOG='+GL(R.rho*K.G)+';',
  'bool inGrid(ivec2 c){return c.x>=0&&c.y>=0&&c.x<uN.x&&c.y<uN.y;}',
  /* the cell's (z, h, T, dep) with its pond (P.g = pond index + 1) held at the level; P.r its roughness */
  'vec4 cellS(ivec2 c){vec4 s=texelFetch(uS,c,0);int p=int(texelFetch(uP,c,0).g+0.5)-1;',
  ' if(p>=0){float L=p==0?uPondL[0]:p==1?uPondL[1]:p==2?uPondL[2]:uPondL[3];s.g=max(L-s.r,0.0);s.b=p==0?uPondT[0]:p==1?uPondT[1]:p==2?uPondT[2]:uPondT[3];}return s;}',
  'vec2 rheo(float T){float le='+(vft?GL(e[0])+'+'+GL(e[1])+'/max(1.0,T-'+GL(e[2])+')':GL(e[0])+'+'+GL(e[1])+'*T')+';',
  ' return vec2(max('+GL(R.etaMin==null?1:R.etaMin)+',exp2(le*3.321928094887362)),exp2(('+GL(R.yld[0])+'+'+GL(R.yld[1])+'*T)*3.321928094887362));}',
  'float flux(float he,float dH,float d,float w,float eta,float Sy){if(!(he>0.0)||!(dH>0.0))return 0.0;',
  ' float G=RHOG*dH/sqrt(dH*dH+d*d),hc=Sy/G;if(he<=hc)return 0.0;float e=he-hc;return w*G*e*e*(he+0.5*hc)/(3.0*eta);}',
  /* the eight volumes cell c sends this step (the CPU's pass 1), scaled so it never sends more than it holds */
  'void outs(ivec2 c,out float o[8]){for(int n=0;n<8;n++)o[n]=0.0;vec4 s=cellS(c);float hc=s.g;if(!(hc>uHmin))return;',
  ' float zc=s.r+texelFetch(uP,c,0).r,Hc=zc+hc,A=uCs*uCs,tot=0.0;vec2 r=rheo(s.b);',
  ' for(int n=0;n<8;n++){ivec2 k=c+ivec2(DI[n],DJ[n]);float zn,Hn;',
  '  if(inGrid(k)){vec4 t=cellS(k);zn=t.r+texelFetch(uP,k,0).r;Hn=zn+t.g;}',
  '  else{'+(sim.edge==='wall'?'continue;':'ivec2 m=clamp(c-ivec2(DI[n],DJ[n]),ivec2(0),uN-1);zn=2.0*zc-texelFetch(uS,m,0).r-texelFetch(uP,m,0).r;Hn=zn;')+'}',
  '  float dH=Hc-Hn;if(!(dH>0.0))continue;bool diag=n>3;float d=diag?uCs*1.4142135623730951:uCs,w=(diag?WD:WO)*uCs;',
  '  float he=min(hc,Hc-zn),q=flux(he,dH,d,w,r.x,r.y);if(!(q>0.0))continue;',
  '  float v=min(q*uDt,(diag?KD:KO)*A*dH);o[n]=v;tot+=v;}',
  ' if(tot>hc*A){float k=hc*A/tot;for(int n=0;n<8;n++)o[n]*=k;}}'].join('\n');}
 function quad(T,mat){const sc=new T.Scene(),m=new T.Mesh(new T.PlaneBufferGeometry(2,2),mat);m.frustumCulled=false;sc.add(m);return sc;}
 K.gpu=function(renderer,sim,o){o=o||{};const T=root.THREE;if(!T)throw new Error('KLAVA.gpu needs three.js');
  if(sim.vents.length>4||sim.ponds.length>4)throw new Error('KLAVA.gpu: at most 4 vents and 4 ponds');
  const nx=sim.nx,nz=sim.nz,N=nx*nz,R=sim.rheo;let zRef=Infinity;for(let k=0;k<N;k++)if(sim.z[k]<zRef)zRef=sim.z[k];
  const rt=()=>new T.WebGLRenderTarget(nx,nz,{type:T.FloatType,format:T.RGBAFormat,minFilter:T.NearestFilter,magFilter:T.NearestFilter,depthBuffer:false,stencilBuffer:false});
  const S=[rt(),rt()],O=[rt(),rt()];let cur=0;
  const buf=new Float32Array(N*4);
  const pd=new Float32Array(N*4);for(let k=0;k<N;k++){pd[k*4]=sim.rough[k];pd[k*4+1]=sim.pondOf[k]+1;}
  const P=new T.DataTexture(pd,nx,nz,T.RGBAFormat,T.FloatType);P.minFilter=P.magFilter=T.NearestFilter;P.needsUpdate=true;
  const init=new T.DataTexture(buf,nx,nz,T.RGBAFormat,T.FloatType);init.minFilter=init.magFilter=T.NearestFilter;
  const U={uS:{value:null},uP:{value:P},uN:{value:[nx,nz]},uCs:{value:sim.cs},uDt:{value:1},uHmin:{value:sim.hmin},
   uPondL:{value:[0,0,0,0]},uPondT:{value:[0,0,0,0]},uHalf:{value:0},uO1:{value:null},uO2:{value:null},
   uVent:{value:[0,1,2,3].map(()=>new T.Vector4(-1e9,-1e9,0,0))},uVentT:{value:[0,0,0,0]},uRa:{value:0},uCa:{value:0}};
  const C=common(sim);
  const fluxM=new T.ShaderMaterial({uniforms:U,vertexShader:VS,fragmentShader:C+'\nuniform int uHalf;\nvoid main(){ivec2 c=ivec2(gl_FragCoord.xy);float o[8];outs(c,o);'+
   'gl_FragColor=uHalf==0?vec4(o[0],o[1],o[2],o[3]):vec4(o[4],o[5],o[6],o[7]);}'});
  fluxM.uniforms.uHalf={value:0};
  // the update: what it keeps and takes (heat mixed by volume), the vents, cooling and freezing (the CPU's passes 2 to 4)
  const updM=new T.ShaderMaterial({uniforms:U,vertexShader:VS,fragmentShader:C+'\nuniform sampler2D uO1,uO2;uniform vec4 uVent[4];uniform float uVentT[4];uniform float uRa,uCa;\n'+
   'float outOf(ivec2 k,int n){vec4 a=n<4?texelFetch(uO1,k,0):texelFetch(uO2,k,0);int m=n&3;return m==0?a.x:m==1?a.y:m==2?a.z:a.w;}\n'+
   'void main(){ivec2 c=ivec2(gl_FragCoord.xy);vec4 s=cellS(c);float A=uCs*uCs,so=0.0;bool pond=texelFetch(uP,c,0).g>0.5;',
   ' for(int n=0;n<8;n++)so+=outOf(c,n);float V=s.g*A-so,E=s.b*V;',
   ' for(int n=0;n<8;n++){ivec2 k=c+ivec2(DI[n],DJ[n]);if(!inGrid(k))continue;float v=outOf(k,n^1);if(v==0.0)continue;V+=v;E+=v*cellS(k).b;}',
   ' V=max(V,0.0);float h=V/A,T=V>0.0?E/V:s.b,z=s.r,dep=s.a;',
   ' for(int i=0;i<4;i++){vec4 v=uVent[i];vec2 d=vec2(c)-v.xy;if(v.w>0.0&&dot(d,d)<=v.z*v.z){float per=v.w*uDt,v0=h*A;T=(T*v0+uVentT[i]*per)/(v0+per);h+=per/A;}}',
   ' if(!pond&&h>0.0){T=T/pow(1.0+uRa*T*T*T/h,1.0/3.0);T=(T+uCa/h*'+GL(R.Tground)+')/(1.0+uCa/h);',
   '  if(T<='+GL(R.Tsol)+'){z+=h;dep+=h;h=0.0;}}',
   ' gl_FragColor=vec4(z,h,T,dep);}'].join('\n')});
  const scF=quad(T,fluxM),scU=quad(T,updM),cam=new T.Camera();
  const G={zRef,texture:null,steps:0};
  function render(sc,target){const prev=renderer.getRenderTarget(),ac=renderer.autoClear;renderer.autoClear=false;renderer.setRenderTarget(target);renderer.render(sc,cam);renderer.setRenderTarget(prev);renderer.autoClear=ac;}
  G.push=function(){for(let k=0;k<N;k++){buf[k*4]=sim.z[k]-zRef;buf[k*4+1]=sim.h[k];buf[k*4+2]=sim.T[k];buf[k*4+3]=sim.dep[k];}
   init.needsUpdate=true;const copy=new T.ShaderMaterial({uniforms:{uS:{value:init}},vertexShader:VS,fragmentShader:'precision highp float;uniform sampler2D uS;void main(){gl_FragColor=texelFetch(uS,ivec2(gl_FragCoord.xy),0);}'});
   const sc=quad(T,copy);render(sc,S[cur]);copy.dispose();sc.children[0].geometry.dispose();G.texture=S[cur].texture;return G;};
  G.step=function(dt){dt=dt==null?sim.dtNext:dt;const t=sim.t,A=sim.cs*sim.cs;
   sim.ponds.forEach((p,i)=>{U.uPondL.value[i]=(typeof p.level==='function'?p.level(t,p.out):p.level)-zRef;U.uPondT.value[i]=p.T;});
   sim.vents.forEach((v,i)=>{const Q=typeof v.Q==='function'?v.Q(t):v.Q,ks=v.cells,k0=ks[0],ci=(v.x-sim.x0)/sim.cs,cj=(v.z-sim.z0)/sim.cs;
    /* the vent's cells: within r of its point (in cells), or its one nearest cell */
    const near=v.r>0?null:[k0%nx,(k0-k0%nx)/nx];
    U.uVent.value[i].set(near?near[0]:ci,near?near[1]:cj,near?0:v.r/sim.cs,Q>0?Q/ks.length:0);U.uVentT.value[i]=v.T;});
   U.uDt.value=dt;U.uRa.value=3*R.emis*R.exposed*K.SIGMA*dt/(R.rho*R.cp);U.uCa.value=R.kc*dt/(R.dc*R.rho*R.cp);
   U.uS.value=S[cur].texture;
   fluxM.uniforms.uHalf.value=0;render(scF,O[0]);fluxM.uniforms.uHalf.value=1;render(scF,O[1]);
   U.uO1.value=O[0].texture;U.uO2.value=O[1].texture;render(scU,S[1-cur]);cur=1-cur;G.texture=S[cur].texture;
   sim.t=t+dt;sim.steps++;G.steps++;return dt;};
  G.run=function(seconds,dt){dt=dt||sim.dtNext;const end=sim.t+seconds;let n=0;while(sim.t<end-1e-9){G.step(Math.min(dt,end-sim.t));n++;}return n;};
  G.pull=function(){renderer.readRenderTargetPixels(S[cur],0,0,nx,nz,buf);let mol=0;
   for(let k=0;k<N;k++){sim.z[k]=buf[k*4]+zRef;sim.h[k]=buf[k*4+1];sim.T[k]=buf[k*4+2];sim.dep[k]=buf[k*4+3];if(sim.h[k]>sim.hmin&&sim.T[k]>R.Tsol)mol++;}
   sim.molten=mol;return sim;};
  G.dispose=function(){S.concat(O).forEach(r=>r.dispose());P.dispose();init.dispose();fluxM.dispose();updM.dispose();};
  return G.push();};
 // the CPU and the GPU from the same start for `steps` fixed steps: the worst differences
 K.gpuCheck=function(renderer,mk,steps,dt){const a=mk(),b=mk(),G=K.gpu(renderer,b);
  for(let i=0;i<steps;i++){a.step(dt);G.step(dt);}G.pull();
  let dh=0,dT=0,va=0,vb=0;for(let k=0;k<a.N;k++){dh=Math.max(dh,Math.abs(a.h[k]-b.h[k]),Math.abs(a.dep[k]-b.dep[k]));
   if(a.h[k]>a.hmin&&b.h[k]>b.hmin)dT=Math.max(dT,Math.abs(a.T[k]-b.T[k]));va+=a.h[k]+a.dep[k];vb+=b.h[k]+b.dep[k];}
  G.dispose();return {dh,dT,mass:vb/va,cpu:va*a.cs*a.cs,gpu:vb*b.cs*b.cs,molten:[a.molten,b.molten]};};
})(typeof globalThis!=='undefined'?globalThis:this);
