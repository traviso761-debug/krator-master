// ---------- Galaxy class: the stranger places ----------
// Original work. Builders for places.js (each takes THREE, the place's group and the kit, and returns its solids and
// an update), drawn at the sky's scale: hundreds of kilometres off, so they read as far, big things.
//
//   pulsar   a neutron star, a few kilometres of white, with two beams sweeping round it from its magnetic poles:
//            when one crosses you the star flares. A wind nebula of blue gas about it.
//   disc     a young star still in its disc of dust and gas: dark lanes, gaps cleared by planets forming in them
//            (one glowing), and jets from the star's poles.
//   eye      a planetary nebula: a dying star's shed shells, teal inside and red at the edges, a waist of denser gas
//            and two lobes, and the white dwarf at its heart.
//   rogue    a planet with no sun, adrift in the dark, its only light the aurora curtains over its poles.
import {planetMesh} from './planets.js';
const dirOf=(az,el)=>[Math.cos(az)*Math.cos(el),Math.sin(el),Math.sin(az)*Math.cos(el)];
const at=(az,el,d)=>dirOf(az,el).map(x=>x*d);
const add=THREE=>({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false});

export function pulsar(THREE,g,kit){
  const C=new THREE.Vector3(...at(0.3,0.08,140000));
  const star=new THREE.Mesh(new THREE.SphereGeometry(900,24,16),new THREE.MeshBasicMaterial({color:0xeef4ff,toneMapped:false}));star.position.copy(C);g.add(star);
  const core=kit.sprite(0xcfe0ff,14000,1),halo=kit.sprite(0x7a9cff,70000,0.35);core.position.copy(C);halo.position.copy(C);g.add(core,halo);
  // the beams: two long cones, narrow at the star, fading outwards; the magnetic axis tilted off the spin axis
  const spin=new THREE.Group();spin.position.copy(C);spin.rotation.z=0.25;g.add(spin);
  const mag=new THREE.Group();mag.rotation.z=0.62;spin.add(mag);
  const bm=new THREE.ShaderMaterial({...add(THREE),uniforms:{uT:{value:0}},
    vertexShader:`varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform float uT;varying vec2 vU;void main(){float a=pow(vU.y,2.2)*0.5*(0.85+0.15*sin(vU.y*80.-uT*30.));
      float edge=1.-pow(abs(vU.x-0.5)*2.,4.);gl_FragColor=vec4(vec3(0.75,0.85,1.)*a*edge,a*edge);}`});
  for(const s of [1,-1]){const geo=new THREE.CylinderGeometry(0,26000,420000,32,1,true);geo.translate(0,-210000,0);const b=new THREE.Mesh(geo,bm);b.rotation.z=s>0?Math.PI:0;mag.add(b);}
  // the wind nebula: blue puffs, thicker in the star's equator
  const rnd=kit.rnd;for(let i=0;i<70;i++){const a=rnd()*Math.PI*2,r=8000+rnd()*60000,y=(rnd()-0.5)*r*0.5;
    const s=kit.sprite(rnd()<0.3?0xb070ff:0x5a86ff,20000+rnd()*40000,0.06+rnd()*0.08);s.position.copy(C).add(new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r));g.add(s);}
  const v=new THREE.Vector3(),ax=new THREE.Vector3(),wq=new THREE.Quaternion();
  return {solids:[{name:'the pulsar',c:C.clone(),r:3000,orbit:true}],update:(t,dt,cam)=>{
    spin.rotation.y=t*1.3;bm.uniforms.uT.value=t;
    // the flare: how nearly a beam points at the camera
    if(!cam)return;star.getWorldPosition(v);v.sub(cam.position).normalize().negate();
    ax.set(0,1,0).applyQuaternion(mag.getWorldQuaternion(wq));const k=Math.pow(Math.abs(ax.dot(v)),60);
    core.material.opacity=0.6+0.4*k;core.scale.setScalar(14000*(1+5*k));halo.material.opacity=0.3+0.5*k;}};
}

export function disc(THREE,g,kit){
  const R=12000,C=new THREE.Vector3(...at(-0.3,0.1,700000));
  const star=kit.sprite(0xfff0c8,R*7,1),glow=kit.sprite(0xffc070,R*30,0.35);star.position.copy(C);glow.position.copy(C);g.add(star,glow);
  const ball=new THREE.Mesh(new THREE.SphereGeometry(R,48,32),new THREE.MeshBasicMaterial({color:0xfff2d0,toneMapped:false}));ball.position.copy(C);g.add(ball);
  const tilt=new THREE.Group();tilt.position.copy(C);tilt.rotation.set(-Math.PI/2+0.42,0,0.25);g.add(tilt);
  // the disc: dust lit warm by the star, brighter near it; dark lanes; three gaps; drawn twice (a thin bright
  // surface and a thicker dim one) so it has a little depth edge-on
  const dm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{uR:{value:R},uT:{value:0}},
    vertexShader:`varying vec3 vL;void main(){vL=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform float uR,uT;varying vec3 vL;
      float h(float x){return fract(sin(x*127.1)*43758.5453);}float n1(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(h(i),h(i+1.),f);}
      void main(){float r=length(vL.xy)/uR,ph=atan(vL.y,vL.x);
        float gap=1.-0.95*exp(-pow((r-7.)/0.5,2.))-0.85*exp(-pow((r-13.)/0.8,2.))-0.9*exp(-pow((r-21.)/1.,2.));
        float d=(0.6+0.4*n1(r*3.+n1(ph*3.)*2.))*gap*smoothstep(2.,3.5,r)*(1.-smoothstep(26.,34.,r));
        float lit=1.2/pow(r/3.,1.1);vec3 c=mix(vec3(0.42,0.24,0.14),vec3(1.,0.72,0.42),clamp(lit,0.,1.))*clamp(lit,0.15,1.6);
        gl_FragColor=vec4(c*d,d*0.9);}`});
  const d1=new THREE.Mesh(new THREE.RingGeometry(R*2,R*34,256,24),dm);tilt.add(d1);
  // a planet forming in the middle gap, glowing with the heat of what it is gathering
  const pp=kit.sprite(0xffb070,R*1.2,0.9),pa=13*R,pph=0.8;pp.position.set(Math.cos(pph)*pa,Math.sin(pph)*pa,0);tilt.add(pp);
  // the jets: thin, blue, along the star's poles
  const jm=new THREE.ShaderMaterial({...add(THREE),vertexShader:`varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec2 vU;void main(){float a=pow(vU.y,1.5)*0.35;gl_FragColor=vec4(vec3(0.55,0.75,1.)*a,a);}`});
  for(const s of [1,-1]){const geo=new THREE.CylinderGeometry(0,R*0.9,R*24,16,1,true);geo.translate(0,-R*12,0);const j=new THREE.Mesh(geo,jm);j.rotation.x=s>0?-Math.PI/2:Math.PI/2;tilt.add(j);}
  return {solids:[{name:'the young star',c:C.clone(),r:R*1.3,orbit:true}],update:t=>{tilt.rotation.z=0.25+t*0.002;pp.material.opacity=0.8+0.2*Math.sin(t*0.8);}};
}

export function eye(THREE,g,kit){
  const C=new THREE.Vector3(...at(0.15,0.12,300000)),rnd=kit.rnd;
  const n=14000,pos=new Float32Array(n*3),col=new Float32Array(n*3),c=new THREE.Color();
  // two lobes along y and a dense waist: points on shells r(θ) that swell towards the poles, coloured by radius
  for(let i=0;i<n;i++){const u=rnd()*2-1,a=rnd()*Math.PI*2,s=Math.sqrt(1-u*u);
    const lobe=1+1.4*Math.pow(Math.abs(u),2.2),waist=i<n*0.25;let r=(waist?60000:52000)*(waist?1:lobe)*(0.85+0.3*rnd());
    let x=s*Math.cos(a)*r,y=(waist?u*0.12:u)*r,z=s*Math.sin(a)*r;if(waist){x*=1.15;z*=1.15;}
    pos.set([C.x+x,C.y+y,C.z+z],i*3);const k=Math.min(1,Math.hypot(x,y*0.6,z)/110000);
    c.setRGB(0.25+0.85*k,0.75-0.45*k,0.85-0.7*k);col.set([c.r,c.g,c.b],i*3);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  const pts=new THREE.Points(geo,new THREE.PointsMaterial({map:kit.glowTex,size:9000,vertexColors:true,transparent:true,opacity:0.16,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
  const tilt=new THREE.Group();g.add(tilt);pts.geometry.translate(-C.x,-C.y,-C.z);tilt.position.copy(C);tilt.rotation.set(0.5,0,0.35);tilt.add(pts);
  const wd=kit.sprite(0xffffff,9000,1),wg=kit.sprite(0x9fd8ff,60000,0.45);wd.position.copy(C);wg.position.copy(C);g.add(wd,wg);
  return {solids:[{name:'the white dwarf',c:C.clone(),r:2000,orbit:true}],update:t=>{wd.material.opacity=0.85+0.15*Math.sin(t*2.1);}};
}

export function rogue(THREE,g,kit){
  const R=Math.tan(17*Math.PI/180)*0.48*900000,C=new THREE.Vector3(...at(-0.55,-0.18,0.48*900000));
  const pg=planetMesh(THREE,{R,type:'ice',seed:6.6,colours:['#0a1018','#2a3440','#1c242e','#4a5866'],seg:160});pg.position.copy(C);g.add(pg);
  // the aurora: curtains round each pole, folded and rippling, green below shading to violet at their tops
  const am=new THREE.ShaderMaterial({...add(THREE),uniforms:{uT:{value:0}},
    vertexShader:`varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform float uT;varying vec2 vU;void main(){float x=vU.x*6.283;
      float fold=0.5+0.5*sin(x*7.+sin(x*3.+uT*0.4)*2.+uT*0.3),ray=0.6+0.4*sin(x*90.+uT*2.)*sin(x*37.-uT);
      float h=vU.y,a=fold*ray*smoothstep(0.,0.1,h)*(1.-smoothstep(0.4,1.,h))*1.6;
      vec3 c=mix(vec3(0.2,1.,0.45),vec3(0.75,0.3,1.),smoothstep(0.25,0.8,h));gl_FragColor=vec4(c*a,a);}`});
  for(const s of [1,-1]){const geo=new THREE.CylinderGeometry(R*0.28,R*0.36,R*0.3,160,1,true),a=new THREE.Mesh(geo,am);
    a.position.copy(C).add(new THREE.Vector3(0,s*R*0.97,0));if(s<0)a.rotation.x=Math.PI;g.add(a);}
  const glow=kit.sprite(0x40ff90,R*1.3,0.3),g2=glow.clone();glow.position.copy(C).add(new THREE.Vector3(0,R*0.98,0));g2.position.copy(C).add(new THREE.Vector3(0,-R*0.98,0));g.add(glow,g2);
  return {solids:[{name:'the rogue planet',c:C.clone(),r:R,orbit:true}],update:t=>{am.uniforms.uT.value=t;pg.userData.spinner.rotation.y+=1e-5;}};
}
