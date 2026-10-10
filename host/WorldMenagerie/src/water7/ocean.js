// ---------- the sea round Water 7 ----------
// An ocean world wants a sea that moves. The engine's sheet of sea is put away and this takes its place: one grid
// that follows the camera, fine near it and coarse out to the horizon, its surface raised in the vertex shader by a
// sum of travelling (Gerstner) waves, lit by the engine's own Phong material so the fog, the sun and the shadows
// still work. Out at sea the swell is a metre or more; inside the sea wall (OSM.water7.damR) it is the moat's
// ripple. The colour runs from the shallows' turquoise round the island to deep blue offshore; foam on the crests,
// a band of it where the swell breaks on the sea wall and round Scrap Island.
//
// The tide: the whole sea rises and falls (C.water7.tide: {amp metres, period seconds}). Aqua Laguna (the events)
// drives it further: SEA.draw pulls the sea back (the warning: the farther it goes, the bigger the waves), and
// SEA.surges are walls of water, each {f: how far its front has come, h: its height, w: its width}, crossing the sea
// along SEA.surgeDir and dying out as they climb the island.
//
// api.SEA.y(x, z) is the surface's height there now, for anything that floats (the yagaras, the ships, the sea
// train's rails, laid just under the surface and swaying with it).
export function ocean(api){
  const {THREE,C,scene,camera,animHooks,OSM,nightF,hour}=api;const W7=OSM.water7;if(!W7)return;
  const K=Object.assign({tide:{amp:0.45,period:420},swell:1},C.water7&&C.water7.sea||{});
  const BASE=(typeof C.waterLevel==='number')?C.waterLevel:0.7,DAM=W7.damR||1480,[SX,SZ,SR]=W7.scrap||[-1900,820,150],ISL=W7.tiers?W7.tiers[0][0]:1350;
  // the waves: direction, wavelength, amplitude, steepness. Outside the wall the sum is about a metre and a half.
  const WAVES=[[0.8,0.6,140,0.85*K.swell,0.55],[0.35,0.94,76,0.5*K.swell,0.6],[-0.62,0.78,41,0.26*K.swell,0.55],[0.96,-0.28,22,0.13*K.swell,0.5],[-0.2,-0.98,12.5,0.06*K.swell,0.4]]
    .map(([dx,dz,L,A,Q])=>{const l=Math.hypot(dx,dz),k=2*Math.PI/L;return {dx:dx/l,dz:dz/l,k,A,Q,w:Math.sqrt(9.81*k)};});
  const SEA={tide:0,draw:0,surges:[],surgeDir:[0.6,0.8],t:0};api.SEA=SEA;
  // how much of the swell reaches a point: all of it at sea, a little in the moat, none under the island
  const calm=(x,z)=>{const r=Math.hypot(x,z);return r>DAM+30?1:r>DAM?0.12+0.88*(r-DAM)/30:0.12;};
  const surgeAt=(x,z)=>{let y=0;const r=Math.hypot(x,z),fade=r>ISL?1:Math.max(0,1-(ISL-r)/260);
    for(const s of SEA.surges){const d=(x*SEA.surgeDir[0]+z*SEA.surgeDir[1])+3400-s.f,u=d/Math.max(1,s.w);y+=s.h*fade/(Math.cosh(u)**2);}return y;};
  SEA.y=(x,z)=>{let y=BASE+SEA.tide+SEA.draw+surgeAt(x,z);const c=calm(x,z),t=SEA.t;for(const W of WAVES)y+=c*W.A*Math.sin(W.k*(W.dx*x+W.dz*z)-W.w*t);return y;};

  // ---- the grid: 2 x 2 remapped so its vertices crowd round the middle ----
  const N=320,S=7000,P=2.5,geo=new THREE.PlaneGeometry(2,2,N,N).rotateX(-Math.PI/2),pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const u=pos.getX(i),v=pos.getZ(i);pos.setXYZ(i,Math.sign(u)*S*Math.abs(u)**P,0,Math.sign(v)*S*Math.abs(v)**P);}
  geo.computeBoundingSphere();geo.boundingSphere.radius=S*1.5;
  const U={uT:{value:0},uTide:{value:0},uDam:{value:DAM},uIsl:{value:ISL},uScrap:{value:new THREE.Vector3(SX,SZ,SR)},uSurgeDir:{value:new THREE.Vector2(0.6,0.8)},
    uSurge:{value:[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()]},uNight:{value:0}};
  const mat=new THREE.MeshPhongMaterial({color:0xffffff,specular:0x3a5260,shininess:34,vertexColors:false});
  const wavesGLSL=WAVES.map(W=>`wave(p,vec2(${W.dx.toFixed(4)},${W.dz.toFixed(4)}),${W.k.toFixed(5)},${W.A.toFixed(3)}*c,${W.Q.toFixed(3)},${W.w.toFixed(4)},y,nrm,sh);`).join('\n');
  mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
    sh.vertexShader=sh.vertexShader.replace('#include <common>',`#include <common>
uniform float uT,uTide,uDam,uIsl,uNight;uniform vec3 uScrap;uniform vec2 uSurgeDir;uniform vec3 uSurge[3];
varying float vFoam;varying float vShore;varying float vR;varying float vCrest;varying vec2 vP;
void wave(vec2 p,vec2 d,float k,float A,float Q,float w,inout float y,inout vec3 nrm,inout vec2 sh){float f=k*dot(d,p)-w*uT,s=sin(f),co=cos(f),ns=k>0.2?0.45:(k>0.1?0.7:1.0);
  y+=A*s;sh+=Q*A*d*co;nrm.x-=ns*d.x*k*A*co;nrm.z-=ns*d.y*k*A*co;nrm.y-=ns*Q*k*A*s;}`)
    .replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
vec4 wp0=modelMatrix*vec4(position,1.0);vec2 p=wp0.xz;float r=length(p);
float c=r>uDam+30.0?1.0:(r>uDam?0.12+0.88*(r-uDam)/30.0:0.12);
float y=0.0;vec3 nrm=vec3(0.0,1.0,0.0);vec2 sh=vec2(0.0);
${wavesGLSL}
float fade=r>uIsl?1.0:max(0.0,1.0-(uIsl-r)/260.0);float sg=0.0;
for(int i=0;i<3;i++){float d=dot(p,uSurgeDir)+3400.0-uSurge[i].x,u=d/max(1.0,uSurge[i].z),ch=cosh(u);float hh=uSurge[i].y*fade/(ch*ch);y+=hh;sg+=hh;nrm.x+=uSurgeDir.x*2.0*hh*tanh(u)/max(1.0,uSurge[i].z);nrm.z+=uSurgeDir.y*2.0*hh*tanh(u)/max(1.0,uSurge[i].z);}
objectNormal=normalize(nrm);
vCrest=clamp((y-sg)/(1.1*max(c,0.12))+smoothstep(2.0,8.0,sg)*0.8,0.0,1.4);
float dDam=abs(r-uDam-8.0),dIsl=abs(r-uIsl-1.0),dScr=abs(length(p-uScrap.xy)-uScrap.z);
vShore=max(max(smoothstep(26.0,0.0,dDam)*(0.55+0.45*sin(uT*1.3+r*0.05+atan(p.y,p.x)*40.0)),smoothstep(8.0,0.0,dIsl)*0.6),smoothstep(18.0,0.0,dScr));
vR=r;vP=p;`)
    .replace('#include <begin_vertex>',`#include <begin_vertex>
transformed.y+=y+uTide;transformed.x+=sh.x;transformed.z+=sh.y;`);
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
uniform float uNight,uT;varying float vFoam;varying float vShore;varying float vR;varying float vCrest;varying vec2 vP;`)
    .replace('vec4 diffuseColor = vec4( diffuse, opacity );',`
vec3 deep=vec3(0.07,0.32,0.5),mid=vec3(0.1,0.42,0.6),shal=vec3(0.15,0.52,0.66);
vec3 wc=mix(shal,mid,smoothstep(1300.0,2600.0,vR));wc=mix(wc,deep,smoothstep(2200.0,6000.0,vR));
// whitecaps in patches, not stripes: the crest's height, broken up by a slow pattern of three cross waves
float n=sin(dot(vP,vec2(0.061,0.023))+uT*0.21)*sin(dot(vP,vec2(-0.027,0.071))-uT*0.17)+0.5*sin(dot(vP,vec2(0.19,-0.13))+uT*0.5);
float foam=clamp(smoothstep(1.05,1.5,vCrest)*smoothstep(0.45,1.1,n)*0.8+vShore*(0.6+0.3*n),0.0,1.0);
wc=mix(wc,vec3(0.9,0.95,0.98),foam*0.75);wc*=1.0-0.55*uNight;
vec4 diffuseColor = vec4( wc, opacity );`);};
  const sea=new THREE.Mesh(geo,mat);sea.name='ocean';sea.receiveShadow=true;sea.frustumCulled=false;sea.userData.noFingerprint=true;sea.userData.noWire=true;scene.add(sea);
  // the engine's flat sea goes away (its tiles are named 'river'); the canals, which are not the sea, stay
  let hid=0;scene.traverse(o=>{if(o.isMesh&&o.name==='river'){o.visible=false;hid++;}});
  const P0=Math.PI*2;let last=0;
  animHooks.push(now=>{const t=now/1000;SEA.t=t;U.uT.value=t;
    SEA.tide=K.tide.amp*Math.sin(P0*t/K.tide.period);U.uTide.value=SEA.tide+SEA.draw;
    U.uSurgeDir.value.set(SEA.surgeDir[0],SEA.surgeDir[1]);for(let i=0;i<3;i++){const s=SEA.surges[i];U.uSurge.value[i].set(s?s.f:-1e5,s?s.h:0,s?s.w:1);}
    U.uNight.value=nightF(hour());
    // the grid follows the camera, a step at a time so the waves do not swim
    const st=40;sea.position.set(Math.round(camera.position.x/st)*st,0,Math.round(camera.position.z/st)*st);
    // and it is the sea's own level, not the engine's
    sea.position.y=BASE;});
  api.ctx.details=Object.assign(api.ctx.details||{},{ocean:{grid:N,hidSheets:hid}});
}
