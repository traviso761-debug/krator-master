// Storms and ends of the world, for any page on the shared engine: a dark dome over the sky, lightning, clouds in a
// shape, smoke plumes, and the sea rising. Made for Numenor's Downfall (src/numenor/downfall.js); kept here so that an
// eruption or a pall on another page takes the same pieces. Each takes the engine's api (THREE, scene, camera) and
// returns a small object with an update(dt) to call from an anim hook, so the page keeps its own timeline.
import { mkRng } from './rng.js';

// a soft round sprite: white in the middle, gone at the edge
export function softTex(THREE){
  const c=document.createElement('canvas');c.width=c.height=64;const q=c.getContext('2d'),gr=q.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.45,'rgba(255,255,255,0.6)');gr.addColorStop(1,'rgba(255,255,255,0)');
  q.fillStyle=gr;q.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);}

// The gloom: a dome round the camera, inside the sky, dark overhead and clear at the horizon. A storm's overcast in
// the weather module fogs out everything past a few kilometres, which a thing seen from far off cannot have; this
// darkens the sky and leaves the distance. flash() lights it white for a moment (lightning).
export function gloomDome(api,o={}){
  const {THREE,scene,camera,ctx}=api;
  const U={uA:{value:o.alpha==null?0.45:o.alpha},uC:{value:new THREE.Color(o.colour==null?0x141218:o.colour)},uF:{value:0}};
  const m=new THREE.Mesh(new THREE.SphereGeometry(Math.min(200000,((ctx&&ctx.skyR)||200000)*0.45),32,16),new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,side:THREE.BackSide,fog:false,
    vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform float uA;uniform vec3 uC;uniform float uF;varying vec3 vD;void main(){float a=smoothstep(-0.01,0.35,vD.y)*uA;gl_FragColor=vec4(mix(uC,vec3(0.86,0.9,1.0),uF),max(a,uF*0.5*smoothstep(-0.02,0.2,vD.y)));}'}));
  m.frustumCulled=false;m.renderOrder=5;m.userData.noWire=true;scene.add(m);
  return {mesh:m,get alpha(){return U.uA.value;},set alpha(v){U.uA.value=v;},flash(){U.uF.value=1;},
    update(dt){m.position.copy(camera.position);U.uF.value=Math.max(0,U.uF.value-dt*3);}};}

// Lightning: strike(x, y, z, top) draws a jagged bolt from the cloud at height top down to the point, gone in a third of
// a second, and flashes the gloom (and a page overlay, which canvas-only screenshots do not show).
export function lightning(api,o={}){
  const {THREE,scene}=api,gloom=o.gloom||null,life=o.life||0.35;
  const flash=document.createElement('div');flash.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:30;background:#dfe6ff;opacity:0';document.body.appendChild(flash);
  const M=new THREE.LineBasicMaterial({color:0xf2f4ff,transparent:true,opacity:1,depthWrite:false});let bolts=[],fl=0,n=0;
  return {strike(x,y,z,top){const pts=[],N=26,R=mkRng(++n*7919+Math.floor(x)^Math.floor(z));let px=x+(R()-0.5)*3000,pz=z+(R()-0.5)*3000;
      for(let i=0;i<=N;i++){const t=i/N;pts.push(new THREE.Vector3(px+(x-px)*t+(R()-0.5)*600*(1-t),top+(y-top)*t,pz+(z-pz)*t+(R()-0.5)*600*(1-t)));}
      const L=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),M.clone());L.frustumCulled=false;L.userData.noWire=true;scene.add(L);bolts.push({L,t:0});
      fl=0.32;if(gloom)gloom.flash();},
    update(dt){bolts=bolts.filter(b=>{b.t+=dt;b.L.material.opacity=Math.max(0,1-b.t/life);if(b.t>life){scene.remove(b.L);b.L.geometry.dispose();b.L.material.dispose();return false;}return true;});
      fl=Math.max(0,fl-dt*2.2);flash.style.opacity=String(fl);}};}

// A cloud in a shape: count soft dark puffs placed by shape(R, span) -> [x, y, z] (x forward, z across, y up), as one
// Points. 'eagle' is the shape the Downfall uses: wings spread across, swept back, the primaries spread at the tips.
export const SHAPES={
  eagle(R,span){const r=R();
    if(r<0.78){const u=(R()<0.5?-1:1)*Math.pow(R(),0.8),au=Math.abs(u),chord=span*(0.13*(1-au*au*0.7)+0.02),sweep=-au*span*0.16+Math.sin(au*Math.PI)*span*0.05;
      const fing=au>0.75?Math.sin(R()*Math.PI*5)*span*0.02:0,c=R();
      return [sweep-c*chord+fing,(R()-0.5)*span*0.03*(1-au*0.6)+au*au*span*0.05+(1-c)*chord*0.5,u*span/2];}
    if(r<0.9){const x=span*0.04-R()*span*0.22;return [x,(R()-0.5)*span*0.04,(R()-0.5)*span*0.1*(1-(span*0.04-x)/(span*0.32))];}   // the body
    if(r<0.95){const a=R()*Math.PI*2,rr=R()*span*0.03;return [span*0.08+Math.cos(a)*rr,(R()-0.5)*span*0.01,Math.sin(a)*rr];}     // the head
    const t=R();return [-span*0.2-t*span*0.12,0,(R()-0.5)*span*(0.03+t*0.09)];}};                                                // the tail, fanned
export function cloudFigure(api,o={}){
  const {THREE,scene}=api,shape=typeof o.shape==='function'?o.shape:SHAPES[o.shape||'eagle'],N=o.count||4200,span=o.span||150000,R=mkRng(o.seed||1441);
  const pos=new Float32Array(N*3),cl=new Float32Array(N*3);
  for(let k=0;k<N;k++){pos.set(shape(R,span),k*3);const d=0.07+R()*0.08;cl.set([d,d*0.97,d*1.08],k*3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(cl,3));
  const p=new THREE.Points(g,new THREE.PointsMaterial({size:o.size||5200,map:o.tex||softTex(THREE),vertexColors:true,transparent:true,opacity:o.opacity||0.92,depthWrite:false,fog:false}));
  // stood up in the sky (o.tilt about the across axis), so that from the ground it shows its shape, not its edge
  p.rotation.z=o.tilt==null?1.15:o.tilt;p.frustumCulled=false;p.userData.noWire=true;p.userData.noShadow=true;p.renderOrder=4;scene.add(p);return p;}

// A plume: smoke from a point, rising and leaning downwind, with a glow under it for fire. strength 0 to 1 sets how
// much of it there is; height and spread are what it reaches at full strength.
export function plume(api,o={}){
  const {THREE,scene}=api,N=o.count||500,R=mkRng(o.seed||666),tex=o.tex||softTex(THREE);
  const pos=new Float32Array(N*3),age=new Float32Array(N).map(()=>R()),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const sm=new THREE.Points(g,new THREE.PointsMaterial({color:o.colour==null?0x2e2622:o.colour,size:o.size||420,map:tex,transparent:true,opacity:0,depthWrite:false}));
  sm.frustumCulled=false;sm.userData.noWire=true;scene.add(sm);
  const glow=o.glow===false?null:new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:o.glowColour||0xff6a24,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
  if(glow)scene.add(glow);
  const P={x:o.x||0,y:o.y||0,z:o.z||0,strength:0,lean:o.lean==null?0.4:o.lean,height:o.height||6000,spread:o.spread||1800,rate:o.rate||0.05,glowSize:o.glowSize||900,opacity:o.opacity||0.8,smoke:sm,glow};
  P.update=(dt,t=0)=>{const f=P.strength;
    for(let k=0;k<N;k++){age[k]+=dt*P.rate;if(age[k]>1)age[k]-=1;const a=age[k],h=a*P.height,sp=60+a*P.spread;
      pos[k*3]=P.x+h*P.lean+Math.sin(k*1.3+a*5)*sp;pos[k*3+1]=P.y+h;pos[k*3+2]=P.z+Math.cos(k*2.1+a*4)*sp;}
    g.attributes.position.needsUpdate=true;sm.material.opacity=f*P.opacity;
    if(glow){glow.position.set(P.x,P.y+20,P.z);glow.material.opacity=f*0.95;glow.scale.setScalar(P.glowSize*(1+0.12*Math.sin(t*3.1)));}};
  return P;}

// The sea rising: the engine's sea (its water buffer's tiles, named 'river' or 'water'; a tile standing high is a lake,
// and is left), the far ring that continues it, and the surf (a page's 'surf' meshes, hidden once the sea is up).
// set(level) puts the sea at that height and writes ctx.seaLevel, which anything floating reads.
export function risingSea(api){
  const {THREE,scene,ctx}=api,waters=[],surf=[];let far=null;
  scene.traverse(o=>{if(!o.isMesh)return;
    if((o.name==='water'||o.name==='river')&&(!o.geometry.boundingSphere||o.geometry.boundingSphere.center.y<5)){waters.push({o,y0:o.position.y});o.material.side=THREE.DoubleSide;o.frustumCulled=false;}
    else if(o.name==='surf')surf.push(o);
    else if(o.renderOrder===-1&&o.geometry&&o.geometry.type==='RingGeometry')far={o,y0:o.position.y};});
  // the engine only draws its sea where the ground was below it, so once the water is up a single sheet over the
  // whole map, in the sea's own material, takes over from its tiles
  const B=api.B,mat=waters.length?waters[0].o.material:new THREE.MeshPhongMaterial({color:0x2a5f8c,side:THREE.DoubleSide});
  const sheet=new THREE.Mesh(new THREE.PlaneGeometry(B.w+12000,B.d+12000).rotateX(-Math.PI/2),mat);sheet.position.set(B.x0+B.w/2,0,B.z0+B.d/2);
  sheet.visible=false;sheet.frustumCulled=false;sheet.receiveShadow=true;sheet.name='flood';sheet.userData.wireCat='water';scene.add(sheet);
  return {count:waters.length,set(L){ctx.seaLevel=L;const up=L>1.5;sheet.visible=up;sheet.position.y=L+0.7;
    for(const w of waters){w.o.position.y=w.y0+L;w.o.visible=!up;}if(far)far.o.position.y=far.y0+L;for(const s of surf)s.visible=!up;}};}
