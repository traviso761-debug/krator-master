// ================================================================= HOST — vent country's waters, the fissure's glow, the steam, the hollows' dead
// As RECORDS first (README.md), then drawn. The marsh's acid water (milky, yellow-green); the hot pools, each its own
// colours (blue where it is hottest, green and yellow at its cooler rim; a cool pool green to orange throughout); the mud
// pots, grey and bubbling; the fissure's crack, glowing orange at night; the fumaroles' steam; the
// hollows: obstacles (nothing roots there), and on the west one's rim the bleached bones of what the gas killed.
const VENTS={marsh:{x:MARSH.x,z:MARSH.z,level:MARSH.level,acid:true},pools:POOLS.map((P,i)=>({x:P.x,z:P.z,r:P.r,level:POOLL[i],hot:P.hot})),
 mud:MUD.map((M,i)=>({x:M.x,z:M.z,r:M.r,level:MUDL[i]})),fumaroles:STEAM.length,hollows:HOLLOWS.map(H=>({x:H.x,z:H.z,r:H.r,gas:'CO2',kills:true})),bones:[]};
HOLLOWS.forEach(H=>OBSTACLES.push({x:H.x,z:H.z,r:H.r*1.05}));

// ---------------------------------------------------------------- the water: the marsh, the pools
const MAT_WATER=new THREE.ShaderMaterial({fog:true,vertexColors:true,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uSun:{value:new THREE.Vector3(...SUN_POS).normalize()},uSky:{value:new THREE.Color(0xd2cec2)},uLight:{value:1}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;varying vec3 vCol;',
  'void main(){vCol=color;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uLight;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec3 vCol;',
  'void main(){',
  ' vec3 n=normalize(vec3(0.02*sin(vWP.x*0.31+uT*0.8)+0.015*sin(vWP.z*0.53-uT*0.5),1.0,0.02*cos(vWP.z*0.27+uT*0.7)));',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(clamp(1.0-max(dot(n,V),0.0),0.0,1.0),3.0);',
  ' vec3 col=mix(vCol,uSky,0.06+fr*0.5);vec3 H=normalize(uSun+V);col+=pow(max(dot(n,H),0.0),120.0)*0.6*vec3(1.0,0.95,0.85);',
  ' gl_FragColor=vec4(col*uLight,1.0);','#include <fog_fragment>','}'].join('\n')});
MAT_WATER.uniforms.fogColor.value=scene.fog.color;MAT_WATER.uniforms.fogDensity.value=scene.fog.density;
TICKS.push(dt=>{MAT_WATER.uniforms.uT.value+=dt;});
const lin=h=>new THREE.Color(h).convertSRGBToLinear();
// a water surface of rings: pt(a,t) the point at angle a, t of the way out; cols the colours from the middle out
function waterRings(pt,Lv,cols,label,mat){const PN=64,R=cols.length-1,pos=[],col=[],idx=[];const c0=pt(0,0);pos.push(c0[0],Lv,c0[1]);const C0=lin(cols[0]);col.push(C0.r,C0.g,C0.b);
 for(let r=1;r<=R;r++){const C=lin(cols[r]);for(let k=0;k<PN;k++){const p=pt(k/PN*TAU,r/R);pos.push(p[0],Lv,p[1]);col.push(C.r,C.g,C.b);}}
 for(let k=0;k<PN;k++)idx.push(0,1+(k+1)%PN,1+k);
 for(let r=1;r<R;r++){const a=1+(r-1)*PN,b=1+r*PN;for(let k=0;k<PN;k++){const k1=(k+1)%PN;idx.push(a+k,a+k1,b+k,a+k1,b+k1,b+k);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,mat||MAT_WATER);m.userData.probeSkip=true;m.userData.inspectLabel=label;m.renderOrder=1;scene.add(m);return m;}
// the marsh: milky yellow-green acid water, its edge under the bank
waterRings((a,t)=>upAt(MARSH.u+Math.cos(a)*MARSH.ru*t*1.01,MARSH.p+Math.sin(a)*MARSH.rp*t*1.01),MARSH.level,[0x8aa890,0x9ab088,0xb4b878],'The sulphur marsh\'s acid water');
// the pools: the hotter, the bluer and the deeper its blue; a cool one green, its rim orange
POOLS.forEach((P,i)=>{const h=P.hot,mixc=(a,b,t)=>'#'+new THREE.Color(a).lerp(new THREE.Color(b),t).getHexString();
 waterRings((a,t)=>[P.x+Math.cos(a)*P.r*1.5*t,P.z+Math.sin(a)*P.r*1.5*t],POOLL[i],[mixc(0x2e8a6a,0x0a4e96,h),mixc(0x4a9a6a,0x1a74a8,h),mixc(0x6aa858,0x38a6b0,h),mixc(0xc0882e,0x9ab448,h)],h>.6?'A hot pool (the hottest are the bluest)':'A cooler hot pool (its mats grow into it)');});

// ---------------------------------------------------------------- the mud pots
// Grey mud, bubbling: in the shader, bubbles swell and burst on a jittered grid, each on its own clock, rings spreading
const MAT_MUD=new THREE.ShaderMaterial({fog:true,transparent:true,depthWrite:false,vertexColors:true,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uLight:{value:1}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;varying float vEdge;',
  'void main(){vEdge=color.r;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uLight;varying vec3 vWP;varying float vEdge;',
  'float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'void main(){vec2 p=vWP.xz*0.55;vec2 c=floor(p);float lit=0.0,dark=0.0;',
  ' for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=c+vec2(float(i),float(j));float hs=h2(g);vec2 o=g+0.5+0.35*vec2(h2(g+3.1)-0.5,h2(g+7.7)-0.5);',
  '  float ph=fract(uT*(0.18+0.25*hs)+hs*7.0),d=length(p-o);',
  '  float on=step(0.45,hs),bub=smoothstep(0.42*ph+0.02,0.42*ph-0.06,d)*step(ph,0.55)*on;dark+=bub*0.35;lit+=bub*smoothstep(0.3*ph,0.42*ph,d)*0.8;',
  '  float rr=(ph-0.55)*1.6;lit+=step(0.55,ph)*smoothstep(0.06,0.0,abs(d-rr))*(1.0-ph)*1.4*on;}',
  ' vec3 col=vec3(0.2,0.185,0.165)*(0.92+0.08*sin(vWP.x*1.7+sin(vWP.z*1.3)*2.0)+0.06*sin(vWP.z*3.1+uT*0.3))*(1.0-dark)+vec3(0.26,0.24,0.21)*lit;',
  ' gl_FragColor=vec4(col*uLight,smoothstep(0.0,0.9,vEdge));','#include <fog_fragment>','}'].join('\n')});
MAT_MUD.uniforms.fogColor.value=scene.fog.color;MAT_MUD.uniforms.fogDensity.value=scene.fog.density;
TICKS.push(dt=>{MAT_MUD.uniforms.uT.value+=dt;});
MUD.forEach((M,i)=>waterRings((a,t)=>[M.x+Math.cos(a)*M.r*1.3*t,M.z+Math.sin(a)*M.r*1.3*t],MUDL[i],[0xffffff,0xffffff,0xffffff,0xffffff,0x000000],'A mud pot (it bubbles)',MAT_MUD).userData.probeSkip=false);   // the probe counts the mud (its region holds nothing else)

// ---------------------------------------------------------------- the fissure's glow
// A ribbon down the bottom of the crack: still hot four years on, orange at night, flickering. By day it does not show
// (a dull red strip in a dark crack read as a stream). It stops where the crack runs into a cone (it climbed over them)
const GLOWU={uT:{value:0},uK:{value:.35}};
const MAT_GLOW=new THREE.ShaderMaterial({fog:true,side:THREE.DoubleSide,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,GLOWU]),
 vertexShader:['#include <fog_pars_vertex>','attribute float aS;varying float vS;','void main(){vS=aS;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uK;varying float vS;',
  'void main(){float f=0.6+0.25*sin(vS*0.13+uT*1.7)+0.15*sin(vS*0.71-uT*3.1);gl_FragColor=vec4(vec3(1.0,0.36,0.08)*f*uK,1.0);','#include <fog_fragment>','}'].join('\n')});
['uT','uK'].forEach(k=>MAT_GLOW.uniforms[k]=GLOWU[k]);MAT_GLOW.uniforms.fogColor.value=scene.fog.color;MAT_GLOW.uniforms.fogDensity.value=scene.fog.density;
const FISSGLOW=(function(){const pos=[],s=[],idx=[];let n=0,acc=0,run=false;
 for(let u=FISS.u0+30;u<=FISS.u1-30;u+=5){const c=fissPt(u);acc+=5;if(coneAt(c[0],c[1]).k>.05){run=false;continue;}
  const w=2.2+.9*Math.sin(u*.05),y=terrainH(c[0],c[1])+1.8;
  pos.push(c[0]-PERP[0]*w,y,c[1]-PERP[1]*w,c[0]+PERP[0]*w,y,c[1]+PERP[1]*w);s.push(acc,acc);
  if(run)idx.push((n-1)*2,(n-1)*2+1,n*2,(n-1)*2+1,n*2+1,n*2);n++;run=true;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(s,1));g.setIndex(idx);
 const m=new THREE.Mesh(g,MAT_GLOW);m.userData.probeSkip=true;m.userData.inspectLabel='The fissure\'s crack (still hot)';m.visible=false;scene.add(m);return m;})();
TICKS.push(dt=>{GLOWU.uT.value+=dt;});

// ---------------------------------------------------------------- the steam
// Each fumarole breathes a column of soft puffs that rise, swell and thin (station 1's: one Points object looping in the
// vertex shader); the pools and the marsh steam too
const STEAMU={uT:{value:0},uScale:{value:innerHeight*.5},uCol:{value:new THREE.Color(0xeeeae0)}};
const STEAM_MAT=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,STEAMU]),
 vertexShader:['#include <fog_pars_vertex>','attribute vec4 aS;uniform float uT,uScale;varying float vA;',
  'void main(){float ph=fract(uT*aS.y+aS.x);vec3 p=position+vec3(sin(ph*6.0+aS.x*9.0)*aS.z*0.4+ph*aS.z*2.5,ph*aS.w,cos(ph*5.0+aS.x*7.0)*aS.z*0.4+ph*aS.z*1.2);',
  ' vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;gl_PointSize=uScale*aS.z*(0.6+ph*2.2)/max(1.0,-mvPosition.z);',
  ' vA=smoothstep(0.0,0.12,ph)*(1.0-ph)*0.5;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform vec3 uCol;varying float vA;',
  'void main(){vec2 q=gl_PointCoord-0.5;float r=length(q);if(r>0.5)discard;gl_FragColor=vec4(uCol,vA*smoothstep(0.5,0.1,r));','#include <fog_fragment>','}'].join('\n')});
STEAM_MAT.uniforms.fogColor.value=scene.fog.color;STEAM_MAT.uniforms.fogDensity.value=scene.fog.density;
['uT','uScale','uCol'].forEach(k=>STEAM_MAT.uniforms[k]=STEAMU[k]);
(function(){reseed(8601);const P=[],A=[];
 const add=(x,z,y,n,size,rise,rate)=>{for(let i=0;i<n;i++){P.push(x+rr(-1.5,1.5),y,z+rr(-1.5,1.5));A.push(rng(),rate*rr(.8,1.2),size*rr(.7,1.3),rise*rr(.7,1.3));}};
 STEAM.forEach(S=>add(S.x,S.z,Math.max(terrainH(S.x,S.z),waterH(S.x,S.z)),Math.round(10+18*S.s),4+5*S.s,24+30*S.s,.07));
 for(let k=0;k<40;k++){const a=rr(0,TAU),t=Math.sqrt(rng())*.95,c=upAt(MARSH.u+Math.cos(a)*MARSH.ru*t,MARSH.p+Math.sin(a)*MARSH.rp*t);add(c[0],c[1],MARSH.level,2,5,14,.05);}
 POOLS.forEach((p,i)=>add(p.x,p.z,POOLL[i],Math.round(4+8*p.hot),2.5+p.r*.12,10+8*p.hot,.09));
 {const pts=[];for(let u=FISS.u0+40;u<FISS.u1-40;u+=28){const c=fissPt(u);pts.push(c);}pts.forEach(c=>add(c[0],c[1],terrainH(c[0],c[1])+1,2,3,12,.08));}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(A,4));
 const pts=new THREE.Points(g,STEAM_MAT);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=2;scene.add(pts);})();
TICKS.push(dt=>{STEAMU.uT.value+=dt;STEAMU.uScale.value=innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360));});
_onLight.push(m=>{const n=m==='night';STEAMU.uCol.value.setHex(n?0x40444c:0xeeeae0);MAT_WATER.uniforms.uLight.value=n?.18:1;MAT_MUD.uniforms.uLight.value=n?.2:1;GLOWU.uK.value=1.6;FISSGLOW.visible=n;});

// ---------------------------------------------------------------- the hollows' dead
// The CO2 kills what wanders in and the mat digests it, so the floor is clean; what is left lies bleached on the west
// hollow's rim, where the gas thins: ribs, skulls, long bones
(function(){const H=HOLLOWS[1];reseed(8602);
 const C=h=>new THREE.Color(h),Y=(x,z)=>terrainH(x,z);
 BIO.bucket('bone',BIO.barkMat(null),{label:'Bleached bones',uvScale:[1,1]});
 BIO.def('skull',new THREE.SphereGeometry(1,8,6).scale(1,.75,1.3),BIO.solidMat(null),{label:'Skulls'});
 const white=()=>C(0xe4ddcc).lerp(C(0xb8ae9a),rr(0,.4));
 for(let k=0;k<20;k++){const a=rr(0,TAU),d=H.r*rr(1.02,1.25),x=H.x+Math.cos(a)*d,z=H.z+Math.sin(a)*d,y=Y(x,z),s=rr(.6,1.6),kind=k%3,c=white();
  if(kind===0){const ry=rr(0,TAU),sx=Math.cos(ry),sz=Math.sin(ry);BIO.tube('bone',[{x:x-sx*s,y:y+.08,z:z-sz*s,r:.05*s,col:c},{x:x+sx*s,y:y+.1,z:z+sz*s,r:.04*s,col:c}],c,{seg:4,cap:true});
   for(let j=0;j<6;j++){const t=(j/5-.5)*1.6*s,px=x+sx*t,pz=z+sz*t,side=j%2?1:-1;BIO.tube('bone',[{x:px,y:y+.1,z:pz,r:.03*s,col:c},{x:px-sz*.45*s*side,y:y+.45*s,z:pz+sx*.45*s*side,r:.025*s,col:c},{x:px-sz*.7*s*side,y:y+.05,z:pz+sx*.7*s*side,r:.02*s,col:c}],c,{seg:3,cap:true});}}
  else if(kind===1)BIO.put('skull',[x,y+.12*s,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),.22*s,c);
  else{const a2=rr(0,TAU),L=rr(.5,1.2)*s;BIO.tube('bone',[{x:x-Math.cos(a2)*L,y:y+.05,z:z-Math.sin(a2)*L,r:.06*s,col:c},{x:x+Math.cos(a2)*L,y:y+.05,z:z+Math.sin(a2)*L,r:.06*s,col:c}],c,{seg:4,cap:true});}
  VENTS.bones.push({x,z,kind:['ribcage','skull','long bone'][kind]});}
 REGISTER({name:'Bones on the hollow\'s rim (the gas killed them; the mat cleaned the floor)',x:H.x,z:H.z,y:Y(H.x,H.z),r:H.r*1.3,h:H.depth+6,bones:true});
 _mark('layout');
})();
