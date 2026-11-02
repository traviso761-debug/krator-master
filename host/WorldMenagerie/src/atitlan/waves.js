// ---------- Lake Atitlán: the water's surface ----------
// The engine's water is one flat Phong sheet. This gives it a surface (C.waves):
//   the waves   the sheet's normal is bent by a sum of travelling waves, long swell under short chop, in world space
//               so they line up across every piece of water; how steep they are follows the wind (the Xocomil,
//               api.ctx.lake.windNow(), from lake.js), and they fade out with distance, where they would only shimmer
//   the sky     at a grazing angle water is a mirror: the colour leans toward the sky's horizon (the fog colour,
//               which follows the time of day) by a Fresnel term, so the far lake is bright and the near lake dark
//   reflection  (C.waves.reflect) a true mirror: a camera reflected in the water's plane renders the land and the
//               sky over it (`res` of the screen, every `every` frames, clipped at the waterline) and the water takes
//               it by the Fresnel term, rippled by the waves' slope: the caldera's walls standing in a calm lake.
//               Only the large meshes are drawn into it (the ground, the backdrop, buildings and landmarks, the sky),
//               not the instanced crowds of trees and people
//   glint       (C.waves.glint) the sun on the water: `shine` the Phong shininess (a tighter spot than the engine's), less in
//               the wind, and `strength` scales it
//   rain        the weather's rain (core/weather.js) rings the near water and dulls the mirror
//   shallows    (C.waves.shallow) where the bed is a few metres down the water shows it: a depth map of the bed
//               (`res` texels over the lake) tints the water toward `colour` as exp(-depth / `depth`)
//   the surf    along the lake's shore, a strip `surf` m wide where lines of foam run in to the waterline and the
//               waterline itself is a pale wet edge; more of it in the wind
// Nothing here is in the layout fingerprint.

export function waves(api){
  const {THREE,C,scene,OSM,inWater,animHooks,camera,groundH,renderer}=api;const K=C.waves;if(!K)return;
  const WY=api.ctx.waterLevel||0.05,windNow=()=>(api.ctx.lake&&api.ctx.lake.windNow)?api.ctx.lake.windNow():((api.ctx.weather&&api.ctx.weather.wind)||0),rainNow=()=>(api.ctx.weather&&api.ctx.weather.rain)||0;
  // ---- the waves and the sky, on the engine's water material ----
  let waterM=null;scene.traverse(m=>{if(!waterM&&m.isMesh&&(m.name==='water'||m.name==='river')&&m.material.isMeshPhongMaterial)waterM=m.material;});   // the lake sheet, or the tiles the map's water is drawn in
  const U={uT:{value:0},uW:{value:0},uS:{value:K.steep===undefined?1:K.steep},uFar:{value:K.far||2200},uSky:{value:K.sky===undefined?0.55:K.sky},
    uRefl:{value:null},uRM:{value:new THREE.Matrix4()},uRK:{value:0},uDep:{value:null},uDO:{value:new THREE.Vector2()},uDS:{value:new THREE.Vector2(1,1)},uSC:{value:new THREE.Color('#3aa8b8')},uSD:{value:6},uSK:{value:0},uRain:{value:0},uGl:{value:K.glint&&K.glint.strength!=null?K.glint.strength:1}};
  const RF=K.reflect,SH=K.shallow;
  // ---- the shallows: the bed's depth over the lake's box, a byte a texel in tenths of a metre ----
  if(SH&&waterM){let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(const w of (OSM.water||[])){if(C.lake&&C.lake.name&&w.n!==C.lake.name)continue;for(let i=0;i+1<w.o.length;i+=2){const x=w.o[i]/10,z=w.o[i+1]/10;x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z);}}
    if(x1>x0){const N=SH.res||512,d=new Uint8Array(N*N*4),sx=(x1-x0)/(N-1),sz=(z1-z0)/(N-1);
      for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=x0+i*sx,z=z0+j*sz,dep=inWater(x,z)?Math.max(0,WY-groundH(x,z)):0,v=Math.min(255,Math.round(dep*10)),k=(j*N+i)*4;d[k]=d[k+1]=d[k+2]=v;d[k+3]=255;}
      const tx=new THREE.DataTexture(d,N,N,THREE.RGBAFormat);tx.magFilter=tx.minFilter=THREE.LinearFilter;tx.needsUpdate=true;
      U.uDep.value=tx;U.uDO.value.set(x0,z0);U.uDS.value.set(x1-x0,z1-z0);U.uSC.value.set(SH.colour||'#3aa8b8');U.uSD.value=SH.depth||6;U.uSK.value=SH.strength==null?0.8:SH.strength;}}
  if(waterM){
    waterM.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
      sh.vertexShader='varying vec3 vWP;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
      if(SH)sh.defines=Object.assign(sh.defines||{},{W_SHALLOW:''});if(RF)sh.defines=Object.assign(sh.defines||{},{W_REFLECT:''});
      sh.fragmentShader=`uniform float uT,uW,uS,uFar,uSky,uRK,uSD,uSK,uRain,uGl;uniform sampler2D uRefl,uDep;uniform mat4 uRM;uniform vec2 uDO,uDS;uniform vec3 uSC;varying vec3 vWP;float wFoot;vec3 wN=vec3(0.0,1.0,0.0);
// one travelling wave's slope (dh/dx, dh/dz): direction d, length L m, steepness s; deep water, so it runs at sqrt(g k).
// A wave shorter than a few pixels' footprint on the water (wFoot, m) would only alias into a lattice, so it fades out
vec2 wv(vec2 p,vec2 d,float L,float s){float k=6.2831853/L;return d*s*cos(dot(p,d)*k-uT*sqrt(9.81*k))*clamp(1.5-wFoot*3.0/L,0.0,1.0);}
`+sh.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
  {float fd=length(vViewPosition),near=clamp(1.0-fd/uFar,0.0,1.0),mid=clamp(1.0-fd/(uFar*0.35),0.0,1.0),vc=abs(dot(normal,normalize(vViewPosition)));wFoot=fd*0.0016/max(vc,0.06);vec2 p=vWP.xz,g=vec2(0.0);p+=vec2(sin(p.y*0.031)+sin(p.y*0.0071+1.3),cos(p.x*0.027)+sin(p.x*0.0083+0.4))*6.0;   // warped, so the sum does not tile into a lattice
   p+=vec2(sin(p.y*0.11+uT*0.3),cos(p.x*0.13-uT*0.25))*1.2;
   // nine waves, each 0.66 the length of the last, on bearings a golden angle apart round the wind's: no two line up
   // and no length divides another, so the sum never settles into a lattice; the short ones only near the eye
   for(int i=0;i<9;i++){float fi=float(i),L=34.0*pow(0.66,fi),a=0.64+sin(fi*2.39996)*1.1,f=i<2?1.0:(i<5?mid:mid*mid);
     g+=wv(p+vec2(13.7,-9.1)*fi,vec2(cos(a),sin(a)),L,0.034-fi*0.0012)*f;}
   g*=uS*(0.45+uW*1.6)*near;
   // rain: rings spreading from where drops land, one to a cell, in two offset layers, near the eye only
   {float rr=uRain*clamp(1.0-fd/140.0,0.0,1.0);if(rr>0.0)for(int k=0;k<2;k++){vec2 q=vWP.xz*1.4+float(k)*7.31,ci=floor(q);float h=fract(sin(dot(ci,vec2(12.9898,78.233))+float(k)*3.7)*43758.5453);
     vec2 d=fract(q)-0.5-(vec2(fract(h*13.1),fract(h*7.7))-0.5)*0.5;float r=length(d),ph=fract(uT*0.85+h),e=r-ph*0.45;g+=d/max(r,0.001)*sin(e*55.0)*exp(-abs(e)*16.0)*(1.0-ph)*0.45*rr;}}vec3 nw=normalize(vec3(-g.x,1.0,-g.y));wN=nw;normal=normalize((viewMatrix*vec4(nw,0.0)).xyz);}`)
        .replace('#include <aomap_fragment>','reflectedLight.directSpecular*=uGl;\n#include <aomap_fragment>')
        .replace('#include <color_fragment>',`#include <color_fragment>
  #ifdef W_SHALLOW
  {vec2 su=(vWP.xz-uDO)/uDS;if(su.x>0.0&&su.y>0.0&&su.x<1.0&&su.y<1.0){float dep=texture2D(uDep,su).r*25.5;diffuseColor.rgb=mix(diffuseColor.rgb,uSC,exp(-dep/uSD)*uSK);}}
  #endif`)
        .replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );',`
  #ifdef W_REFLECT
  {vec4 rc=uRM*vec4(vWP,1.0);vec2 ruv=rc.xy/rc.w+wN.xz*0.035;vec3 rf=texture2D(uRefl,clamp(ruv,0.001,0.999)).rgb*0.86;
   float c=clamp(dot(normal,normalize(vViewPosition)),0.0,1.0),fr=0.02+0.98*pow(1.0-c,5.0);outgoingLight=mix(outgoingLight,rf,clamp(fr*uRK*(1.0-0.45*uRain),0.0,0.92));}   // rain roughens the mirror
  #else
  #ifdef USE_FOG
  {float c=clamp(dot(normal,normalize(vViewPosition)),0.0,1.0),fr=0.02+0.98*pow(1.0-c,5.0);outgoingLight=mix(outgoingLight,fogColor*0.92,clamp(fr*uSky*1.6,0.0,0.85));}
  #endif
  #endif
  gl_FragColor = vec4( outgoingLight, diffuseColor.a );`);};
    waterM.needsUpdate=true;}
  // ---- the mirror ----
  let rt=null,rcam=null,frame=0,scanAt=0;const clip=[new THREE.Plane(new THREE.Vector3(0,1,0),-WY)],TM=new THREE.Matrix4().set(0.5,0,0,0.5,0,0.5,0,0.5,0,0,0.5,0.5,0,0,0,1);
  const fwd=new THREE.Vector3(),up=new THREE.Vector3(),tgt=new THREE.Vector3(),sz=new THREE.Vector2();
  // what is drawn in the mirror: the big meshes, on layer 1 (they stay on layer 0 for the main camera)
  const scan=()=>{const W=new Set();scene.traverse(m=>{if(m.isLight)m.layers.enable(1);});   // r128 filters lights by the camera's layers too
    scene.traverse(m=>{if(m.isMesh&&m.material===waterM)W.add(m);});
    scene.traverse(m=>{if(!m.isMesh||m.isInstancedMesh||W.has(m)||m.name==='surf'||(m.layers.mask&2))return;if(!m.geometry.boundingSphere)m.geometry.computeBoundingSphere();const r=m.geometry.boundingSphere?m.geometry.boundingSphere.radius*Math.max(m.scale.x,m.scale.y,m.scale.z):0;if(r>(RF.minR||30))m.layers.enable(1);});};
  if(RF&&waterM&&renderer){rcam=new THREE.PerspectiveCamera();rcam.layers.set(1);U.uRK.value=RF.strength==null?1:RF.strength;
    animHooks.push(now=>{if(now>scanAt){scanAt=now+2000;scan();}if((frame++%(RF.every||2))!==0)return;
      renderer.getDrawingBufferSize(sz);const w=Math.max(64,Math.round(sz.x*(RF.res||0.4))),h=Math.max(64,Math.round(sz.y*(RF.res||0.4)));
      if(!rt||rt.width!==w||rt.height!==h){if(rt)rt.dispose();rt=new THREE.WebGLRenderTarget(w,h,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});U.uRefl.value=rt.texture;}
      camera.updateMatrixWorld();const p=camera.position;if(p.y<WY+0.3)return;camera.getWorldDirection(fwd);up.set(0,1,0).applyQuaternion(camera.quaternion);
      rcam.position.set(p.x,2*WY-p.y,p.z);tgt.copy(p).add(fwd);tgt.y=2*WY-tgt.y;rcam.up.set(up.x,-up.y,up.z);rcam.lookAt(tgt);
      rcam.fov=camera.fov;rcam.aspect=camera.aspect;rcam.near=camera.near;rcam.far=camera.far;rcam.updateProjectionMatrix();rcam.updateMatrixWorld();
      U.uRM.value.copy(TM).multiply(rcam.projectionMatrix).multiply(rcam.matrixWorldInverse);
      const oldRT=renderer.getRenderTarget(),oldClip=renderer.clippingPlanes,oldSh=renderer.shadowMap.autoUpdate;
      renderer.shadowMap.autoUpdate=false;renderer.clippingPlanes=clip;renderer.setRenderTarget(rt);renderer.clear();renderer.render(scene,rcam);
      renderer.setRenderTarget(oldRT);renderer.clippingPlanes=oldClip;renderer.shadowMap.autoUpdate=oldSh;});}
  // ---- the surf ----
  const W=K.surf||5,pos=[],uv=[],idx=[];let segs=0;
  for(const w of (OSM.water||[])){if(C.lake&&C.lake.name&&w.n&&w.n!==C.lake.name)continue;
    for(const o2 of [w.o,...(w.i||[])]){const r=[];for(let i=0;i+1<o2.length;i+=2)r.push([o2[i]/10,o2[i+1]/10]);if(r.length<3)continue;let s=0;
      for(let i=0;i<r.length;i++){const p=r[i],q=r[(i+1)%r.length],L=Math.hypot(q[0]-p[0],q[1]-p[1]);if(L<0.3||L>400){s+=L;continue;}
        let nx=(q[1]-p[1])/L,nz=-(q[0]-p[0])/L;if(!inWater((p[0]+q[0])/2+nx*3,(p[1]+q[1])/2+nz*3)){nx=-nx;nz=-nz;}   // n: out over the water
        const b=pos.length/3;pos.push(p[0],WY+0.06,p[1],q[0],WY+0.06,q[1],q[0]+nx*W,WY+0.04,q[1]+nz*W,p[0]+nx*W,WY+0.04,p[1]+nz*W);
        uv.push(s,0,s+L,0,s+L,W,s,W);idx.push(b,b+1,b+2,b,b+2,b+3);s+=L;segs++;}}}
  let surfM=null;
  if(pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);
    surfM=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8,
      uniforms:Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uT:{value:0},uO:{value:0.5},uW:{value:W},uL:{value:new THREE.Color(1,1,1)}}),
      vertexShader:`varying vec2 vU;
#include <fog_pars_vertex>
void main(){vU=uv;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`,
      fragmentShader:`uniform float uT,uO,uW;uniform vec3 uL;varying vec2 vU;
#include <common>
#include <fog_pars_fragment>
void main(){float d=vU.y,x=vU.x,a=0.0;
  // two sets of lines running in, out of step along the shore, each fading as it reaches the waterline
  for(int k=0;k<2;k++){float ph=fract(uT/(5.5+float(k)*1.7)+sin(x*0.071+float(k)*2.1)*0.35+sin(x*0.013)*0.5),front=uW*(1.0-ph);
    a+=exp(-abs(d-front)*(2.2+sin(x*0.9)*0.6))*(0.35+0.65*ph)*smoothstep(0.0,0.25,1.0-ph)*(0.6+0.4*sin(x*1.7+float(k)));}
  a+=exp(-d*2.4)*(0.55+0.25*sin(uT*0.9+x*0.3));   // the wet edge
  a*=uO*smoothstep(uW,uW*0.55,d);gl_FragColor=vec4(uL,clamp(a,0.0,0.9));
#include <fog_fragment>
}`});
    const m=new THREE.Mesh(g,surfM);m.name='surf';m.renderOrder=2;m.userData.noFingerprint=true;scene.add(m);}
  // ---- the clock ----
  const t0=performance.now();
  animHooks.push(now=>{const t=(now-t0)/1000*(api.ctx.evspeed||1),w=windNow();U.uT.value=t;U.uW.value=w;U.uRain.value=rainNow();if(waterM&&K.glint&&K.glint.shine)waterM.shininess=K.glint.shine*(1-0.5*w);   // after the engine's own (02-ground.js), so this one holds
    if(surfM){surfM.uniforms.uT.value=t;surfM.uniforms.uO.value=(K.surfOpacity||0.55)*(0.55+w*0.9);
      const day=api.hour?Math.max(0.25,Math.min(1,Math.sin(Math.PI*(api.hour()-6)/12)*1.4)):1;surfM.uniforms.uL.value.setScalar(day);}});
  api.ctx.details=Object.assign(api.ctx.details||{},{waves:{water:!!waterM,surf:segs,reflect:!!(RF&&renderer),shallow:!!U.uDep.value}});
}
