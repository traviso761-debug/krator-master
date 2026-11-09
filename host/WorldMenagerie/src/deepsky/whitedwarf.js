// ---------- a white dwarf in its planetary nebula: the Ring Nebula, M57 ----------
// How a star like the Sun ends: no explosion. It swells to a red giant, puffs its outer layers off over some
// thousands of years, and what is left of its core, carbon and oxygen the size of the Earth and about 0.6 of the Sun's
// mass, lights them up from inside while it cools for billions of years. A world unit is 10 km. The white dwarf is
// drawn to scale beside the Earth (each about 13,000 km across); the nebula round it is about a light year and a third
// across and is drawn K.nebula units out instead, a hundred million times smaller, fading in as you pull back.
// The nebula as the JWST photographed it in 2023: a barrel seen nearly end on, so it looks like a ring; inside, the
// blue-green of hot oxygen and helium; the ring itself red and orange (hydrogen, nitrogen); and round its rim some
// twenty thousand dense knots, and faint arcs in a halo further out (shells thrown off as the star pulsed).
import {mkRng} from '../core/rng.js';
export function whiteDwarf(api,kit,K){
  const {THREE,camera,animHooks}=api;const rnd=mkRng(K.seed||57);
  const group=new THREE.Group(),WR=K.radius||700,NEB=K.nebula||40000,TILT=(K.tilt==null?30:K.tilt)*Math.PI/180;
  const quiet=o=>{o.traverse(q=>{q.userData.noWire=true;});return o;};
  // ---- the white dwarf, and the Earth beside it for scale ----
  const wd=new THREE.Mesh(new THREE.SphereGeometry(WR,48,32),new THREE.ShaderMaterial({
    vertexShader:'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec3 vN;void main(){float l=0.6+0.4*pow(abs(vN.z),0.5);gl_FragColor=vec4(vec3(0.82,0.88,1.)*l*1.15,1.);}'}));
  wd.userData.info={name:'The white dwarf',info:K.info||''};group.add(wd);
  const halo=kit.glow(0xc8d8ff,WR*7,0.7);group.add(halo);
  const earthR=K.earthRadius||637;
  const earthTex=(()=>{const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');g.fillStyle='#1d4a8a';g.fillRect(0,0,256,128);
    // a few continents' worth of land and cloud, no particular map
    // land as clusters of small blots, cloud as streaks along the latitudes
    for(let c=0;c<7;c++){const cx=rnd()*256,cy=24+rnd()*80;for(let i=0;i<40;i++){g.fillStyle=rnd()<0.3?'#8a7a4a':'#4a6a32';g.beginPath();g.arc(cx+(rnd()-0.5)*50,cy+(rnd()-0.5)*30,2+rnd()*5,0,7);g.fill();}}
    for(let i=0;i<70;i++){g.fillStyle='rgba(255,255,255,'+(0.3+0.4*rnd())+')';g.beginPath();g.ellipse(rnd()*256,10+rnd()*108,4+rnd()*16,1+rnd()*2.5,(rnd()-0.5)*0.4,0,7);g.fill();}
    g.fillStyle='#eef';g.fillRect(0,0,256,8);g.fillRect(0,120,256,8);return new THREE.CanvasTexture(c);})();
  const earth=new THREE.Mesh(new THREE.SphereGeometry(earthR,32,20),new THREE.MeshLambertMaterial({map:earthTex}));earth.position.set(WR*3.2,0,WR*0.8);
  earth.userData.info={name:'The Earth, for scale',info:'The Earth drawn at the same scale as the white dwarf beside it: they are about the same size, and the white dwarf weighs some 200,000 times as much. A teaspoon of it would weigh about five tonnes, as much as an elephant.'};group.add(earth);
  // the white dwarf lights the Earth's near side
  const lamp=new THREE.PointLight(0xdde6ff,1.6,0);group.add(lamp);
  const labels=new THREE.Group();group.add(labels);
  {const a=kit.label('White dwarf: carbon and oxygen, 0.6 of the Sun\'s mass');a.position.set(WR*0.8,WR*1.3,0);labels.add(a);
   const b=kit.label('The Earth, at the same scale');b.position.set(earth.position.x+earthR,earthR*1.4,earth.position.z);labels.add(b);}
  // ---- the nebula: a barrel, its axis tilted TILT from the line of sight (+y, looking down) ----
  const neb=new THREE.Group();neb.rotation.x=TILT;group.add(neb);
  const glowM=[],nebPts=[];
  const add=(col,n,place,size,op)=>{const pos=new Float32Array(n*3),cc=new Float32Array(n*3),c=new THREE.Color();
    for(let i=0;i<n;i++){const [x,y,z,cl]=place(i);pos[i*3]=x;pos[i*3+1]=y;pos[i*3+2]=z;c.set(cl||col);const b=0.55+0.45*rnd();cc[i*3]=c.r*b;cc[i*3+1]=c.g*b;cc[i*3+2]=c.b*b;}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(cc,3));
    const m=new THREE.PointsMaterial({map:kit.soft,size,vertexColors:true,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false});
    const p=new THREE.Points(g,m);p.frustumCulled=false;neb.add(p);nebPts.push([m,op]);return n;};
  const ang=()=>rnd()*Math.PI*2;
  let NN=0;
  // inside: hot gas, blue-green, filling a short barrel
  NN+=add('#4fd6c8',5000,()=>{const a=ang(),r=NEB*0.55*Math.sqrt(rnd());return [Math.cos(a)*r,(rnd()-0.5)*NEB*0.9,Math.sin(a)*r,rnd()<0.3?'#7fb8ff':null];},NEB*0.05,0.045);
  // the ring: the barrel's wall, thickest at its waist, red outside and yellow-orange inside
  NN+=add('#ff6a3a',14000,()=>{const a=ang(),u=rnd(),r=NEB*(0.58+0.3*Math.pow(u,0.8)),y=(rnd()-0.5)*NEB*0.7*(1-0.5*u);return [Math.cos(a)*r,y,Math.sin(a)*r,u<0.35?'#ffc060':u<0.7?'#ff7a3a':'#d83a2a'];},NEB*0.035,0.34);
  // the knots round the rim: dense little clumps, many
  NN+=add('#ff9a6a',6000,()=>{const a=ang(),r=NEB*(0.82+0.12*rnd());return [Math.cos(a)*r,(rnd()-0.5)*NEB*0.4,Math.sin(a)*r,null];},NEB*0.01,0.8);
  // the halo: faint arcs, shells further out
  NN+=add('#b0402a',5000,()=>{const k=1+Math.floor(rnd()*4),a=ang(),th=Math.acos(2*rnd()-1),r=NEB*(1.05+0.22*k+0.03*rnd());return [Math.sin(th)*Math.cos(a)*r,Math.cos(th)*r*0.9,Math.sin(th)*Math.sin(a)*r,null];},NEB*0.02,0.05);
  for(let i=0;i<30;i++){const s=kit.glow(0x3fb8b0,NEB*0.5,0.03);s.position.set((rnd()-0.5)*NEB*0.5,(rnd()-0.5)*NEB*0.4,(rnd()-0.5)*NEB*0.5);neb.add(s);glowM.push([s.material,0.03]);}
  const nebHit=new THREE.Mesh(new THREE.CylinderGeometry(NEB*0.9,NEB*0.9,NEB*0.8,24,1),new THREE.MeshBasicMaterial({visible:false}));
  nebHit.userData.info={name:'The Ring Nebula, M57',info:K.nebulaInfo||''};neb.add(nebHit);
  quiet(group);
  let on=false;
  animHooks.push(()=>{if(!on)return;const d=camera.position.length(),kn=Math.min(1,Math.max(0,(d-WR*15)/(NEB*0.6)));
    for(const [m,op] of nebPts)m.opacity=op*kn;for(const [m,op] of glowM)m.opacity=op*kn;neb.visible=kn>0.01;
    labels.visible=d<WR*30;earth.visible=d<NEB*0.5;earth.rotation.y+=0.002;});
  return {group,ownSky:false,view:K.view||{az:1.2,el:0.25,d:WR*12},
    get pick(){return camera.position.length()<NEB*0.4?[wd,earth]:[nebHit];},
    active(v){on=v;},
    hud:()=>'a white dwarf in the Ring Nebula · 125,000 degrees at its surface',
    rows:()=>[{x:WR,z:NEB,w:TILT,dpt:NN},{x:earthR}]};
}
