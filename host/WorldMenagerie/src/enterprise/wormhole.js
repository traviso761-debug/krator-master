// ---------- Galaxy class: the wormhole ----------
// Original work. A stable wormhole with one mouth a few light-years from home and the other out past the nebula,
// thirty light-years off: fly into either and you come out of the other at once, going the way you were going.
//
// A mouth is drawn as a sphere, not a hole: what you see in it is the far side's light, bent round the throat. The
// shader on it is a picture of that, not a ray tracer: bright in the middle (the far sky seen straight through),
// a darker band where the light is bent most, a thin bright ring at the rim, the far side's stars smeared into
// arcs and turning; then a halo, and a slow spiral of glowing dust falling in round it. The place's own light is
// tinted by the far side: blue-white at this end, gold at the other.
//
// `mouth` is a place builder (places.js); `wormholes(W)` is the runtime: it takes the ship through. Passing through
// is a white-out, a shake and the warp's sound; the far place is arrived at as a course would arrive there, and the
// ship is put just outside the far mouth, still at speed. Escorts come through with her (traffic.js).
import {PLACES} from './places.js';
const dirOf=(az,el)=>[Math.cos(az)*Math.cos(el),Math.sin(el),Math.sin(az)*Math.cos(el)];

export const MOUTH_R=2400;
export function mouth(THREE,g,kit,o){
  const C=new THREE.Vector3(...dirOf(o.az,o.el)).multiplyScalar(o.d||26000),R=MOUTH_R;
  const near=new THREE.Color(o.near),far=new THREE.Color(o.far);
  const mat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uNear:{value:near},uFar:{value:far}},
    vertexShader:`varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform float uT;uniform vec3 uNear,uFar;varying vec3 vN;varying vec3 vV;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        float mu=clamp(dot(vN,vV),0.,1.),r=sqrt(1.-mu*mu);           // 0 in the middle of the disc, 1 at its rim
        // where on the disc, round the line of sight
        vec3 ax=normalize(cross(vV,vec3(0.,1.,0.)+vec3(1e-4))),ay=cross(ax,vV);float a=atan(dot(vN,ay),dot(vN,ax));
        // the far sky, wound round the throat: more turns towards the rim
        float s=a+2.2/(r+0.18)-uT*0.25;
        float lane=0.5+0.5*sin(s*3.);
        vec3 col=uFar*pow(1.-r,2.2)*2.2;                                // straight through: the far side's light
        col+=mix(vec3(0.02,0.03,0.08),uFar*0.55,lane*smoothstep(0.15,0.75,r))*(1.-smoothstep(0.82,0.97,r));
        // the far side's stars, smeared into arcs along the winding
        vec2 q=vec2(s*6.,r*22.);vec2 c=floor(q);float st=step(0.93,h(c));float fx=fract(q.x),fy=fract(q.y);
        col+=vec3(1.)*st*smoothstep(0.5,0.,abs(fy-0.5))*smoothstep(0.,0.3,fx)*smoothstep(1.,0.6,fx)*(1.-r)*1.4;
        // the Einstein ring at the rim, and this side's light along it
        col+=mix(uFar,vec3(1.),0.5)*exp(-pow((r-0.93)/0.025,2.))*1.6+uNear*pow(r,8.)*0.8;
        gl_FragColor=vec4(col,1.);}`});
  const ball=new THREE.Mesh(new THREE.SphereGeometry(R,64,48),mat);ball.position.copy(C);g.add(ball);
  const halo=kit.sprite(o.far,R*7,0.45),glare=kit.sprite(0xffffff,R*2.6,0.35);halo.position.copy(C);glare.position.copy(C);g.add(halo,glare);
  // dust falling in: points on a slow spiral in a tilted disc, brightening as they go in, wrapping round
  const n=2600,a=new Float32Array(n*3),pos=new Float32Array(n*3),rnd=kit.rnd;
  for(let i=0;i<n;i++){a[i*3]=rnd();a[i*3+1]=rnd()*6.283;a[i*3+2]=(rnd()-0.5)*0.12;}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('a',new THREE.BufferAttribute(a,3));
  const dm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uT:{value:0},uR:{value:R},uC:{value:near.clone().lerp(far,0.5)},uH:{value:kit.height()}},
    vertexShader:`uniform float uT,uR,uH;attribute vec3 a;varying float vB;void main(){
        float u=fract(a.x-uT*0.012);float rr=uR*(1.08+u*u*4.5);float th=a.y+2.5/(0.25+u)+uT*0.05/(0.2+u);
        vec3 p=vec3(cos(th)*rr,a.z*rr,sin(th)*rr);vB=(1.-u)*smoothstep(0.,0.08,u)*smoothstep(1.,0.85,u);
        vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(uH*90./-mv.z,1.,12.);}`,
    fragmentShader:`uniform vec3 uC;varying float vB;void main(){vec2 d=gl_PointCoord-0.5;float k=smoothstep(0.5,0.,length(d));gl_FragColor=vec4(uC*vB*k*1.6,vB*k);}`});
  const dust=new THREE.Points(geo,dm);dust.position.copy(C);dust.rotation.set(0.35,0,0.2);g.add(dust);
  return {solids:[{name:'the wormhole',c:C.clone(),r:R,gate:true}],update:t=>{mat.uniforms.uT.value=t;dm.uniforms.uT.value=t;
    halo.material.opacity=0.4+0.06*Math.sin(t*0.7);}};
}

export function wormholes(W){
  const {THREE,ROOT,SYS,animHooks}=W,S=W.flight,F=W.fx,V=()=>new THREE.Vector3();
  // the white-out
  const fade=document.createElement('div');fade.id='ent-tunnel';
  fade.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:4;opacity:0;background:radial-gradient(circle at 50% 50%,#ffffff 0%,#cfe2ff 30%,#6a5aff 70%,#140a30 100%);transition:opacity .5s';
  document.body.appendChild(fade);
  let busy=false,count=0;const wp=V();
  function through(pl,s){
    const P2=PLACES.find(p=>p.id===pl.P.link);if(!P2||busy)return;busy=true;count++;
    W.cancelAuto&&W.cancelAuto(true);F.sound('warp');S.shake+=40;S.punch=1400;fade.style.opacity='1';
    const fwd=V().set(1,0,0).applyQuaternion(ROOT.quaternion),v=S.vel.clone();
    setTimeout(()=>{
      S.map.set(P2.ly[0],P2.ly[1]);W.course.dest=P2;W.course.arrived=true;W.arrive();
      // out of the far mouth, going the way she was going
      const pl2=W.herePlace(),g2=pl2.solids.find(x=>x.gate);
      if(g2){SYS.localToWorld(wp.copy(g2.c));ROOT.position.copy(wp).addScaledVector(fwd,g2.r*1.9);}
      S.vel.copy(v);if(W.setThrottle)W.setThrottle(Math.max(0.3,S.thr));
      W.emit&&W.emit('wormhole',{from:pl.P,to:P2});
      setTimeout(()=>{fade.style.opacity='0';S.shake+=12;},250);
      setTimeout(()=>{busy=false;},2500);},550);
  }
  animHooks.push(()=>{
    if(busy||!S.on||S.warp||W.spooling)return;const pl=W.herePlace();if(!pl||!pl.P.link||!pl.group.visible)return;
    for(const s of pl.solids)if(s.gate){SYS.localToWorld(wp.copy(s.c));if(wp.distanceTo(ROOT.position)<s.r*0.9)through(pl,s);}});
  // #ev=wormhole: fly to the nearer mouth (a course to its place, or straight in when here)
  const go=()=>{const pl=W.herePlace();
    if(pl.P.link){const c=W.contacts().find(c=>c.kind==='gate');if(c)W.goContact(c);return;}
    const ms=PLACES.filter(p=>p.link).sort((a,b)=>S.map.distanceTo(new THREE.Vector2(...a.ly))-S.map.distanceTo(new THREE.Vector2(...b.ly)));
    if(ms[0])W.course.set(ms[0]);};
  return {act:{wormhole:go},state:()=>({through:count,busy})};
}
