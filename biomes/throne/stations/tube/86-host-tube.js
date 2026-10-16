// ================================================================= HOST — the tube's light, its lava, its rock and its cave life
// As RECORDS first (README.md), then drawn. THE SKYLIGHTS' LIGHT: a spot light down each hole (the day's, or the giant's
// at night), a shaft of light in the dusty air, motes drifting in it. THE HOT REACH: the lava stream in its channel (a
// flowing crust in its shader, the cracks glowing), three orange lights along it, the sump's glow where it goes under. THE
// ROCK: lavacicles hanging from the roof; the breakdown piles' blocks. THE LIFE on the walls and the roof (the kit's items, in
// its registry): lantern brackets glowing on the walls in the dark, dripping fungi hung from the roof, glow mushrooms on the
// flow ledges, root and moss curtains hanging from the skylights' edges.
const CAVE={skylights:SKY.map(S=>({x:S.x,z:S.z,r:S.r,u:S.u})),brackets:0,drips:0,curtains:0,ledgeGlow:0,lavacicles:0,blocks:0,hot:{u0:HOT.u0,lights:0}};
const C3=h=>new THREE.Color(h);
const ptOf=(T,u,a)=>{const p=T.P(u),t=T.tan(u),n=[-t[1],t[0]],X=TUBEX(T,u,a);return{x:p[0]+n[0]*X.l,y:T.floor(u)+X.v+(1-Math.sin(a))*.6,z:p[1]+n[1]*X.l,n,l:X.l,v:X.v,H:X.H};};
const nearSky=(x,z,k)=>SKY.some(S=>Math.hypot(x-S.x,z-S.z)<S.r*k);

// ---------------------------------------------------------------- the skylights' light
const SPOTS=SKY.map(S=>{const top=surfH(S.x,S.z)+40,f=TUBE.floor(S.u),sp=new THREE.SpotLight(0xfff0d8,2.6,top-f+40,Math.atan((S.r*1.35)/(top-f)),.55,1);
 sp.position.set(S.x,top,S.z);sp.target.position.set(S.x,f,S.z);scene.add(sp);scene.add(sp.target);return sp;});
// the shaft: an open cone of light from the hole to the floor, brightest at its top, broken by drifting noise; additive
const SHAFTU={uT:{value:0},uK:{value:1}};
const MAT_SHAFT=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:true,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,SHAFTU]),
 vertexShader:['#include <fog_pars_vertex>','attribute float aT;varying float vT;varying vec3 vP;varying vec3 vN;','void main(){vT=aT;vec4 wp=modelMatrix*vec4(position,1.0);vP=wp.xyz;vN=normalize(mat3(modelMatrix)*normal);vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uK;varying float vT;varying vec3 vP;varying vec3 vN;',
  'void main(){vec3 V=normalize(cameraPosition-vP);float edge=pow(1.0-abs(dot(V,normalize(vN))),1.5);',
  ' float n=0.6+0.4*sin(vP.x*0.31+vP.y*0.07+uT*0.4)*sin(vP.z*0.27-vP.y*0.05-uT*0.3);',
  ' float a=uK*0.11*(1.0-vT*0.75)*edge*n;gl_FragColor=vec4(vec3(1.0,0.94,0.82)*a,1.0);','#include <fog_fragment>','}'].join('\n')});
['uT','uK'].forEach(k=>MAT_SHAFT.uniforms[k]=SHAFTU[k]);MAT_SHAFT.uniforms.fogColor.value=scene.fog.color;MAT_SHAFT.uniforms.fogDensity.value=scene.fog.density;
SKY.forEach(S=>{const top=surfH(S.x,S.z)-2,f=TUBE.floor(S.u),h=top-f,g=new THREE.CylinderGeometry(S.r*.85,S.r*1.25,h,40,6,true);g.translate(0,-h/2,0);
 const t=new Float32Array(g.attributes.position.count);for(let i=0;i<t.length;i++)t[i]=-g.attributes.position.getY(i)/h;g.setAttribute('aT',new THREE.BufferAttribute(t,1));
 const m=new THREE.Mesh(g,MAT_SHAFT);m.position.set(S.x,top,S.z);m.userData.probeSkip=true;m.renderOrder=5;scene.add(m);});
// motes drifting in the shafts
const MOTEU={uT:{value:0},uScale:{value:innerHeight*.5},uK:{value:1}};
const MAT_MOTE=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uT:MOTEU.uT,uScale:MOTEU.uScale,uK:MOTEU.uK},
 vertexShader:'attribute vec3 aS;uniform float uT,uScale;varying float vA;void main(){vec3 p=position+vec3(sin(uT*0.13+aS.x*9.0)*1.5,mod(aS.y*12.0-uT*0.12,12.0)-6.0,cos(uT*0.11+aS.x*7.0)*1.5);vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(uScale*0.03/max(1.0,-mv.z),1.0,4.0);vA=0.5+0.5*sin(uT*2.0+aS.z*30.0);}',
 fragmentShader:'uniform float uK;varying float vA;void main(){vec2 q=gl_PointCoord-0.5;if(length(q)>0.5)discard;gl_FragColor=vec4(vec3(1.0,0.95,0.85)*vA*uK*0.7,1.0);}'});
(function(){reseed(8801);const P=[],A=[];SKY.forEach(S=>{const f=TUBE.floor(S.u);for(let i=0;i<500;i++){const a=rr(0,TAU),d=S.r*Math.sqrt(rng());P.push(S.x+Math.cos(a)*d,f+rr(2,16),S.z+Math.sin(a)*d);A.push(rng(),rng(),rng());}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(A,3));
 const pts=new THREE.Points(g,MAT_MOTE);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=6;scene.add(pts);})();
TICKS.push(dt=>{SHAFTU.uT.value+=dt;MOTEU.uT.value+=dt;MOTEU.uScale.value=innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360));});
_onLight.push(m=>{const n=m==='night';SPOTS.forEach(sp=>{sp.color.setHex(n?0x8aa6c8:0xfff0d8);sp.intensity=n?.35:2.6;});SHAFTU.uK.value=n?.12:1;MOTEU.uK.value=n?.1:1;});

// ---------------------------------------------------------------- the hot reach: the lava stream, its lights, the sump
const LAVAU={uT:{value:0}};
const MAT_STREAM=new THREE.ShaderMaterial({fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,LAVAU]),
 vertexShader:['#include <fog_pars_vertex>','attribute vec2 aF;varying vec2 vF;varying vec3 vP;','void main(){vF=aF;vec4 wp=modelMatrix*vec4(position,1.0);vP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT;varying vec2 vF;varying vec3 vP;',
  'vec2 h2(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(0.1031,0.1030,0.0973));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy);}',
  // the crust's plates carried downstream (aF.y metres along the stream), torn at the banks (aF.x 0..1 across)
  'void main(){vec2 p=vec2(vF.x*6.0,vF.y*0.5-uT*0.9);vec2 c=floor(p),f=fract(p);float F1=8.0,F2=8.0;vec2 id=vec2(0.0);',
  ' for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j)),o=0.5+0.3*sin(uT*0.4+6.2831*h2(c+g));vec2 r=g+o-f;float d=dot(r,r);if(d<F1){F2=F1;F1=d;id=c+g;}else if(d<F2)F2=d;}',
  ' float e=sqrt(F2)-sqrt(F1),crack=1.0-smoothstep(0.0,0.12,e),bank=smoothstep(0.38,0.5,abs(vF.x-0.5));',
  ' float pl=h2(id).x;vec3 crust=mix(vec3(0.05,0.03,0.02),vec3(0.22,0.07,0.03),pl*0.6)*(1.0-bank*0.5);',
  ' vec3 hot=mix(vec3(1.0,0.35,0.05),vec3(1.0,0.8,0.35),crack);float open=smoothstep(0.82,0.98,pl)*(1.0-bank);',
  ' vec3 col=mix(crust,hot*2.2,max(crack*(1.0-bank*0.7),open));gl_FragColor=vec4(col,1.0);','#include <fog_fragment>','}'].join('\n')});
MAT_STREAM.uniforms.uT=LAVAU.uT;MAT_STREAM.uniforms.fogColor.value=scene.fog.color;MAT_STREAM.uniforms.fogDensity.value=scene.fog.density;
TICKS.push(dt=>{LAVAU.uT.value+=dt;});
(function(){const pos=[],F=[],idx=[];let n=0,s=0;
 for(let u=HOT.u0+10;u<=TUBE.L-3;u+=1.5){const p=TUBE.P(u),t=TUBE.tan(u),nn=[-t[1],t[0]],k=hotK(u),w=CHAN.hw*1.15*k,o=-1.5*Math.sin(u*.03),y=lavaY(u)+(1-k)*.8;
  pos.push(p[0]+nn[0]*(o-w),y,p[1]+nn[1]*(o-w),p[0]+nn[0]*(o+w),y,p[1]+nn[1]*(o+w));F.push(0,s,1,s);s+=1.5;if(n)idx.push((n-1)*2,(n-1)*2+1,n*2,(n-1)*2+1,n*2+1,n*2);n++;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aF',new THREE.Float32BufferAttribute(F,2));g.setIndex(idx);
 const m=new THREE.Mesh(g,MAT_STREAM);m.userData.inspectLabel='The lava stream (the hot reach)';m.userData.lava=true;scene.add(m);CAVE.stream=m;})();
// THE VISITOR'S LAMP: a dim warm light carried with the camera (in the dark between the skylights the cave would read as
// black; anyone down here carries one). Only under the rock
const LAMP=new THREE.PointLight(0xffd8a8,.9,32,1.6);scene.add(LAMP);
TICKS.push(()=>{const c=camera.position;LAMP.position.set(c.x,c.y+.3,c.z);LAMP.visible=c.y<surfH(c.x,c.z)-3;});
// THE HEAT over the stream (83): four sheets stacked over the channel, the shimmer strongest just over the lava, fading up
// to ~4 m, across to the banks and at the reach's ends
(function(){for(const hh of [.35,1.1,2.1,3.4]){const pos=[],K=[],idx=[];let n=0;
 for(let u=HOT.u0+20;u<=TUBE.L-4;u+=2){const p=TUBE.P(u),t=TUBE.tan(u),nn=[-t[1],t[0]],k=hotK(u)*smooth(TUBE.L-4,TUBE.L-30,u),o=-1.5*Math.sin(u*.03),w=CHAN.hw*1.6,y=lavaY(u)+hh;
  for(const s of [-1,0,1]){pos.push(p[0]+nn[0]*(o+s*w),y,p[1]+nn[1]*(o+s*w));K.push(s?0:k*(1-hh/4.2));}
  if(n)for(const c of [0,1]){const a=(n-1)*3+c,b=n*3+c;idx.push(a,a+1,b,a+1,b+1,b);}n++;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aK',new THREE.Float32BufferAttribute(K,1));g.setIndex(idx);HEAT.sheet(g,9);}
 // in reach: under the rock and within ~260 m of the reach
 const hp=TUBE.P((HOT.u0+TUBE.L)/2);HEAT.near=c=>c.y<surfH(c.x,c.z)-3&&Math.hypot(c.x-hp[0],c.z-hp[1])<(TUBE.L-HOT.u0)/2+260;})();
const HOTLIGHTS=[1200,1290,1380].map(u=>{const p=TUBE.P(u),l=new THREE.PointLight(0xff6a24,2.2,80,1.4);l.position.set(p[0],TUBE.floor(u)+3,p[1]);scene.add(l);CAVE.hot.lights++;return l;});
TICKS.push((dt,t)=>{HOTLIGHTS.forEach((l,i)=>l.intensity=2.2*(.85+.15*Math.sin(t*1.3+i*2)+.06*Math.sin(t*7.1+i)));});
// the sump: the tube's end, where the stream goes under; its glow
(function(){const u=TUBE.L-1,p=TUBE.P(u),t=TUBE.tan(u),g=new THREE.CircleGeometry(1,40);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x2a0c04}));
 m.scale.set(TUBE.W(u)*1.3,TUBE.H(u)*1.3,1);m.position.set(p[0],TUBE.floor(u)+TUBE.H(u)*.3,p[1]);m.lookAt(p[0]-t[0],TUBE.floor(u)+TUBE.H(u)*.3,p[1]-t[1]);m.userData.inspectLabel='The sump (the lava stream goes under)';scene.add(m);})();

// ---------------------------------------------------------------- the rock: lavacicles, breakdown blocks
BIO.def('lavacicle',(function(){const g=new THREE.ConeGeometry(.5,1,5,1);g.translate(0,-.5,0);return g;})(),BIO.solidMat(null),{label:'Lavacicles'});
BIO.def('block',new THREE.DodecahedronGeometry(1,0),BIO.solidMat(null),{label:'Breakdown (the fallen roof)'});
(function(){reseed(8802);
 // lavacicles: in drifts along the roof, thickest near its crown, none where it fell in
 for(const T of TUBES)for(let u=4;u<T.L-4;u+=1.1){if(fbm(u*.03,T.L,176,2)<.42)continue;for(let k=0;k<3;k++){const a=Math.PI/2+rr(-.75,.75),q=ptOf(T,u,a);if(T===TUBE&&nearSky(q.x,q.z,1.35))continue;
  const L=rr(.08,.45)*(1+hotK(u)*.6),r=rr(.03,.07);BIO.put('lavacicle',[q.x,q.y+.02,q.z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[r,L,r],C3(T===TUBE&&hotK(u)>.3?0x3a1a12:0x34302c).multiplyScalar(rr(.8,1.1)));CAVE.lavacicles++;}}
 // the breakdown: blocks of the fallen roof heaped under each skylight, a few strewn beyond
 SKY.forEach(S=>{for(let i=0;i<170;i++){const a=rr(0,TAU),d=S.r*1.45*Math.pow(rng(),.7),x=S.x+Math.cos(a)*d,z=S.z+Math.sin(a)*d;if(!tubeAt(x,z))continue;
  const s=rr(.3,1.6)*(1.2-d/(S.r*1.6)),y=terrainH(x,z);BIO.put('block',[x,y+s*.3,z],qEuler(rr(0,TAU),rr(0,TAU),rr(0,TAU)),[s*rr(.8,1.3),s*rr(.5,.9),s],C3(pick([0x3a3634,0x46403c,0x2e2a28])).multiplyScalar(rr(.85,1.1)));CAVE.blocks++;}});
})();

// ---------------------------------------------------------------- the cave life on the walls and the roof (the kit's items)
(function(){const prev=BIO.kit('throne'),cur=BIO.cur;BIO.cur='throne/floor';reseed(8803);const LC=k=>THRONE.LIB.cardsOf(k),PAL=THRONE.PAL;
 const SH=LC('shelf'),DR=LC('drip'),MH=LC('mosshang'),GS=LC('glowshroom');
 const dark=(x,z,u)=>!nearSky(x,z,3.2)&&hotK(u)<.15;
 for(const T of TUBES)for(let u=6;u<T.L-6;u+=rr(4,9)){
  // the lantern brackets: in clusters on the walls between the ledges, in the dark
  for(const side of [0,1]){if(rng()<.45)continue;const a=side?rr(.15,.55):Math.PI-rr(.15,.55),q=ptOf(T,u,a);if(!dark(q.x,q.z,u))continue;
   const inw=[-q.n[0]*Math.sign(q.l),-q.n[1]*Math.sign(q.l)],yaw=Math.atan2(inw[0],inw[1]);
   for(let k=0,n=ri(2,5);k<n;k++){const s=rr(.18,.42),du=rr(-1.2,1.2),dy=rr(-.6,.6),tt=T.tan(u);
    if(SH.length)BIO.put(pick(SH),[q.x+tt[0]*du+inw[0]*.35,q.y+dy-s*1.4,q.z+tt[1]*du+inw[1]*.35],qEuler(rr(-.1,.1),yaw+rr(-.3,.3),0),s*3.2,null);
    else BIO.put('bracket',[q.x+tt[0]*du,q.y+dy,q.z+tt[1]*du],qEuler(0,yaw,0),[s,s*.6,s],C3(pick(PAL.bracket)));CAVE.brackets++;}}
  // dripping fungi hung from the roof, in the dark
  if(DR.length&&rng()<.6){const a=Math.PI/2+rr(-.6,.6),q=ptOf(T,u,a);if(dark(q.x,q.z,u))for(let k=0,n=ri(1,4);k<n;k++){const s=rr(.5,1.2);BIO.put(pick(DR),[q.x+rr(-.8,.8),q.y-.05,q.z+rr(-.8,.8)],qEuler(0,rr(0,TAU),0),[s,s*rr(1,1.6),s],null);CAVE.drips++;}}
  // glow mushrooms on the flow ledges
  if(GS.length&&rng()<.45){const side=rng()<.5,kL=pick(LEDGES),H=T.H(u),a=side?Math.asin(clamp(Math.pow(kL,1/.85),0,1)):Math.PI-Math.asin(clamp(Math.pow(kL,1/.85),0,1)),q=ptOf(T,u,a);
   if(dark(q.x,q.z,u))for(let k=0,n=ri(2,5);k<n;k++){const s=rr(.25,.55);BIO.put(pick(GS),[q.x+rr(-.6,.6),q.y+.15,q.z+rr(-.6,.6)],qEuler(0,rr(0,TAU),0),[s,s,s],null);CAVE.ledgeGlow++;}}}
 // the curtains: roots and moss hung from the skylights' roof edges (inside) and from their rims (the surface's edge)
 if(MH.length)SKY.forEach(S=>{const f=TUBE.floor(S.u),H=TUBE.H(S.u);
  for(let k=0;k<70;k++){const a=rr(0,TAU),R=skyR(S,a)*rr(1.22,1.3),x=S.x+Math.cos(a)*R,z=S.z+Math.sin(a)*R,y=f+H*.42,h=rr(1.5,4);BIO.put(pick(MH),[x,y,z],qEuler(0,rr(0,TAU),0),[h*.8,h,h*.8],null);CAVE.curtains++;}
  for(let k=0;k<50;k++){const a=rr(0,TAU),R=skyR(S,a)-.3,x=S.x+Math.cos(a)*R,z=S.z+Math.sin(a)*R,y=surfH(x,z)-2.6,h=rr(2,6);BIO.put(pick(MH),[x,y,z],qEuler(0,rr(0,TAU),0),[h*.8,h,h*.8],null);CAVE.curtains++;}});
 BIO.cur=cur;BIO.kit(prev);_mark('layout');})();
