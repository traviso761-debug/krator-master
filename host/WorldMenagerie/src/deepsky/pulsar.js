// ---------- the Crab Pulsar, and the Crab Nebula round it ----------
// A world unit is a kilometre here. The neutron star is 20 km across (K.radius 10); it turns on the vertical axis,
// slowed to K.slow turns a second unless the Real speed button is on (29.6 a second: faster than the screen can
// show, so it strobes, as the radio telescopes see it pulse). Its magnetic axis is tilted K.tilt degrees to its
// spin, and everything magnetic turns with it: the hot polar caps, the dipole's closed field lines (r = L sin^2
// theta for several shells L), the open ones from the caps, and the two beams out along the magnetic axis, sweeping
// round the sky like a lighthouse's; particles stream out along them. The light cylinder is where something turning
// with the star would be going at the speed of light: 1,610 km out for the Crab, drawn faint.
// The nebula round it is 11 light years across and is drawn K.nebula km across instead, thousands of millions of
// times smaller, so that both can be on one screen; it fades in as you pull back: the synchrotron glow of the
// pulsar's wind (blue-white), the filaments of the star's old outer layers (red and orange, hydrogen and oxygen),
// the inner ring of the wind's termination shock round the spin axis, and the jet along it (as Chandra sees them).
import {mkRng} from '../core/rng.js';
export function pulsar(api,kit,K){
  const {THREE,camera,animHooks}=api;const rnd=mkRng(K.seed||1054);
  const R=K.radius||10,TILT=(K.tilt==null?45:K.tilt)*Math.PI/180,LC=K.lightCylinder||1610,BEAM=K.beam||5000;
  const group=new THREE.Group(),spin=new THREE.Group(),mag=new THREE.Group();mag.rotation.z=TILT;spin.add(mag);group.add(spin);
  const add=(o,p=group)=>{o.traverse(q=>{q.userData.noWire=true;});p.add(o);return o;};
  // ---- the star: blue-white, its polar caps hotter ----
  const starM=new THREE.ShaderMaterial({uniforms:{uAx:{value:new THREE.Vector3(0,1,0)}},
    vertexShader:'varying vec3 vN,vL;void main(){vL=normalize(position);vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform vec3 uAx;varying vec3 vN,vL;void main(){float cap=pow(abs(dot(vL,uAx)),40.);float limb=0.55+0.45*abs(vN.z);vec3 c=mix(vec3(.62,.72,1.),vec3(1.,1.,1.),cap)*limb*(1.+cap*1.5);gl_FragColor=vec4(c,1.);}'});
  const star=new THREE.Mesh(new THREE.SphereGeometry(R,48,32),starM);mag.add(star);
  star.userData.info={name:'The Crab Pulsar',info:K.info||''};
  const halo=kit.glow(0x9ab8ff,R*9,0.55);mag.add(halo);
  // ---- the field ----
  const lineM=new THREE.LineBasicMaterial({color:0x6a9aff,transparent:true,opacity:0.32,blending:THREE.AdditiveBlending,depthWrite:false});
  const openM=new THREE.LineBasicMaterial({color:0xffc070,transparent:true,opacity:0.28,blending:THREE.AdditiveBlending,depthWrite:false});
  const fieldLine=(L,phi,rmax,m)=>{const pts=[],t0=Math.asin(Math.min(1,Math.sqrt(R/L)));
    for(let i=0;i<=120;i++){const th=t0+(Math.PI-2*t0)*i/120,r=L*Math.sin(th)**2;if(r>rmax){if(pts.length)break;else continue;}
      pts.push(new THREE.Vector3(r*Math.sin(th)*Math.cos(phi),r*Math.cos(th),r*Math.sin(th)*Math.sin(phi)));}
    if(pts.length>1)add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),m),mag);};
  for(const L of K.shells||[25,45,80,140,260,480,900])for(let k=0;k<8;k++)fieldLine(L,k*Math.PI/4+L*0.01,LC,lineM);
  // the open lines: from near the caps, out past the light cylinder (one half of each: r grows as theta goes from the cap)
  for(const L of [3000,6000,12000])for(let k=0;k<8;k++){const phi=k*Math.PI/4,pts=[],t0=Math.asin(Math.sqrt(R/L));
    for(const sg of [1,-1]){pts.length=0;for(let i=0;i<=80;i++){const th=t0+i/80*0.5,r=L*Math.sin(th)**2;const y=r*Math.cos(th)*sg;pts.push(new THREE.Vector3(r*Math.sin(th)*Math.cos(phi),y,r*Math.sin(th)*Math.sin(phi)));}
      add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),openM),mag);}}
  // ---- the beams: cones out of both poles, fading along their length ----
  const cone=(sg)=>{const g=new THREE.ConeGeometry(BEAM*Math.tan(0.16),BEAM,40,8,true).translate(0,-BEAM/2,0),p=g.attributes.position,c=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++){const k=Math.pow(Math.max(0,1+p.getY(i)/BEAM),1.6);c[i*3]=0.55*k;c[i*3+1]=0.7*k;c[i*3+2]=1.0*k;}g.setAttribute('color',new THREE.BufferAttribute(c,3));
    const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    // the cone's apex is at the star, its open end out along the magnetic axis
    m.rotation.x=sg>0?Math.PI:0;return add(m,mag);};
  cone(1);cone(-1);
  const NP=600,pPos=new Float32Array(NP*3),pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pPos,3));
  const parts=add(new THREE.Points(pg,new THREE.PointsMaterial({map:kit.soft,color:0xcfe0ff,size:40,transparent:true,opacity:0.8,blending:THREE.AdditiveBlending,depthWrite:false})),mag);parts.frustumCulled=false;
  const P=[];for(let i=0;i<NP;i++)P.push({u:rnd(),sg:i%2?1:-1,a:rnd()*Math.PI*2,w:Math.sqrt(rnd())});
  // ---- the spin axis and the light cylinder: still, they do not turn ----
  add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,-LC*1.3,0),new THREE.Vector3(0,LC*1.3,0)]),new THREE.LineDashedMaterial({color:0xffffff,dashSize:40,gapSize:30,transparent:true,opacity:0.5})));
  group.children[group.children.length-1].computeLineDistances();
  // the light cylinder: rings round the spin axis, one above the other
  const lcM=new THREE.LineBasicMaterial({color:0x6a8ac8,transparent:true,opacity:0.25,depthWrite:false});
  for(let k=-3;k<=3;k++){const pts=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*LC,k*LC*0.4,Math.sin(a)*LC));}
    add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lcM));}
  const labels=new THREE.Group();add(labels);
  for(const [t,x,y,z,w] of [['The neutron star: 20 km across, 1.4 times the Sun\'s mass',R*2.5,R*3,0,110],['Spin axis',0,LC*0.9,0,260],
    ['Light cylinder: 1,610 km out',LC,LC*0.4,0,520],['Closed field lines',260,-90,0,300]]){const l=kit.label(t);l.position.set(x,y,z);labels.add(l);}
  const magLabel=kit.label('Magnetic axis and beam');magLabel.position.set(0,BEAM*0.45,0);mag.add(magLabel);
  // ---- the nebula, drawn far smaller than it is ----
  const NEB=K.nebula||36000,neb=new THREE.Group();add(neb);
  const glowM=[];
  for(let i=0;i<220;i++){const u=rnd(),v=rnd(),w=Math.cbrt(rnd()),th=Math.acos(2*u-1),ph=v*Math.PI*2,r=NEB*0.5*w;
    const s=kit.glow(rnd()<0.5?0x8fb0ff:0xc8d8ff,NEB*(0.12+0.18*(1-w)),0.12+0.12*(1-w));s.position.set(r*Math.sin(th)*Math.cos(ph)*1.25,r*Math.cos(th)*0.85,r*Math.sin(th)*Math.sin(ph));neb.add(s);glowM.push(s.material);}
  // the filaments: random walks over and through the shell, as points so that each looks like a thread of gas
  const NF=9000,fPos=new Float32Array(NF*3),fCol=new Float32Array(NF*3);let n=0;
  const FC=[[1,0.32,0.18],[1,0.5,0.22],[0.95,0.75,0.35],[0.6,0.9,0.55]];
  while(n<NF){let th=Math.acos(2*rnd()-1),ph=rnd()*Math.PI*2,rr=0.72+rnd()*0.3;const c=FC[Math.floor(rnd()*FC.length)],len=40+Math.floor(rnd()*90);
    for(let k=0;k<len&&n<NF;k++,n++){th+=(rnd()-0.5)*0.05;ph+=(rnd()-0.5)*0.05+0.012;rr+=(rnd()-0.5)*0.02;const r=NEB*0.5*rr;
      fPos[n*3]=r*Math.sin(th)*Math.cos(ph)*1.25;fPos[n*3+1]=r*Math.cos(th)*0.85;fPos[n*3+2]=r*Math.sin(th)*Math.sin(ph);const b=0.5+0.5*rnd();fCol[n*3]=c[0]*b;fCol[n*3+1]=c[1]*b;fCol[n*3+2]=c[2]*b;}}
  const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(fPos,3));fg.setAttribute('color',new THREE.BufferAttribute(fCol,3));
  const filM=new THREE.PointsMaterial({map:kit.soft,size:NEB*0.02,vertexColors:true,transparent:true,opacity:0.7,blending:THREE.AdditiveBlending,depthWrite:false});neb.add(new THREE.Points(fg,filM));
  // the inner ring and the jet (Chandra's picture of the middle): a ring of puffs round the spin axis, a jet up it
  for(let i=0;i<60;i++){const a=i/60*Math.PI*2,s=kit.glow(0xd8e4ff,NEB*0.03,0.35);s.position.set(Math.cos(a)*NEB*0.07,(rnd()-0.5)*NEB*0.004,Math.sin(a)*NEB*0.07);neb.add(s);glowM.push(s.material);}
  for(let i=0;i<30;i++){const y=i/30*NEB*0.16,s=kit.glow(0xc8d8ff,NEB*0.02*(1-i/40),0.3);s.position.set(Math.sin(i*0.5)*NEB*0.005,y,Math.cos(i*0.4)*NEB*0.004);neb.add(s);glowM.push(s.material);}
  const nebHit=new THREE.Mesh(new THREE.SphereGeometry(NEB*0.5,24,16),new THREE.MeshBasicMaterial({visible:false}));nebHit.scale.set(1.25,0.85,1);nebHit.userData.info={name:'The Crab Nebula',info:K.nebulaInfo||''};neb.add(nebHit);
  const nebGlow0=glowM.map(m=>m.opacity),filOp=filM.opacity;
  // ---- the pulses ----
  // You are the observer: what the chart shows is the light from the beams that reaches the camera. The magnetic axis
  // points along (-sin T cos p, cos T, sin T sin p) at spin phase p; a beam's light falls off as exp(-(angle/0.12)^2)
  // off its axis. The phase covered by each frame is sampled finely (at real speed a frame is half a turn), into a
  // trace of the last three turns, and every peak is a click, at its own moment within the frame.
  const NS=600,trace=new Float32Array(NS),STEP=3*Math.PI*2/NS,O3=new THREE.Vector3();let sAcc=0,prevI=0,rising=false,peak=0,listen=false;
  const beamI=(p,o)=>{const bx=-Math.sin(TILT)*Math.cos(p),by=Math.cos(TILT),bz=Math.sin(TILT)*Math.sin(p),c=Math.abs(bx*o.x+by*o.y+bz*o.z),a=Math.acos(Math.min(1,c));return Math.exp(-(a/0.12)*(a/0.12));};
  function pulses(p0,p1,dtSec){O3.copy(camera.position).normalize();const n=Math.max(1,Math.ceil((p1-p0)/STEP));const T0=listen&&kit.audio.ctx?kit.audio.now()+0.06:0;
    for(let k=1;k<=n;k++){const p=p0+(p1-p0)*k/n,I=beamI(p,O3);
      if(I>prevI)rising=true;else if(rising&&prevI>0.04){rising=false;if(listen)kit.audio.click(T0+dtSec*k/n,Math.min(0.5,0.12+prevI*0.4),real?2400:1500);peak++;}
      if(I<prevI)rising=false;prevI=I;
      sAcc+=(p1-p0)/n;while(sAcc>=STEP){sAcc-=STEP;trace.copyWithin(0,1);trace[NS-1]=I;}}}
  function drawChart(){const c=kit.chart,b=c.frame('the last three turns','brightness'),g=c.g;g.strokeStyle='#9ab8ff';g.lineWidth=2.5;g.beginPath();
    for(let k=0;k<NS;k++){const x=b.x0+(b.x1-b.x0)*k/(NS-1),y=b.y0-(b.y0-b.y1)*trace[k];k?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();
    let mx=0;for(let k=0;k<NS;k++)mx=Math.max(mx,trace[k]);
    c.note(mx>0.04?'A pulse each time a beam sweeps over you'+(real?': 29.6 a second, as the radio telescopes hear it.':'.'):'No pulses: neither beam crosses your line of sight. Orbit until a beam sweeps over the camera.');}
  // ---- running ----
  // ---- running ----
  // #pulsar=real starts it at its real speed
  let on=false,real=/(^|[#&])pulsar=real/.test(location.hash),phase=0,btn=null,last=null;const SLOW=K.slow||0.25,FAST=29.6;
  animHooks.push((now)=>{if(!on)return;const dt=Math.min(0.25,(now-(last==null?now:last))/1000);last=now;
    if(real&&!btn){btn=[...document.querySelectorAll('#ui button')].find(b=>b.textContent==='Pulsar: real speed');if(btn)btn.textContent='Pulsar: slowed';}
    const p0=phase;phase+=dt*(real?FAST:SLOW)*Math.PI*2;spin.rotation.y=phase%(Math.PI*2);pulses(p0,phase,dt);
    for(let i=0;i<NP;i++){const p=P[i];p.u=(p.u+dt*(real?0.6:0.12))%1;const d=R+p.u*BEAM*0.9,rad=d*Math.tan(0.16)*p.w;pPos[i*3]=Math.cos(p.a)*rad;pPos[i*3+1]=p.sg*d;pPos[i*3+2]=Math.sin(p.a)*rad;}
    pg.attributes.position.needsUpdate=true;
    // near, the star and its field; far, the nebula
    const d=camera.position.length(),kn=Math.min(1,Math.max(0,(d-4000)/14000)),kf=1-Math.min(1,Math.max(0,(d-6000)/20000));
    glowM.forEach((m,i)=>{m.opacity=nebGlow0[i]*kn;});filM.opacity=filOp*kn;neb.visible=kn>0.01;labels.visible=magLabel.visible=kf>0.5&&d<5000;
    lineM.opacity=0.32*kf;openM.opacity=0.28*kf;lcM.opacity=0.25*kf;
    if(d<8000)drawChart();
    const el=Math.asin(camera.position.y/Math.max(1,d));api.ctx.details=Object.assign(api.ctx.details||{},{pulses:peak,camEl:Math.round(el*100)/100});});
  return {group,ownSky:false,view:K.view||{az:0.9,el:0.22,d:2600},
    get pick(){return camera.position.length()<8000?[star]:[nebHit];},
    active(v){on=v;last=null;if(v)kit.chart.show('The pulses, as seen from the camera','');},
    buttons:{'Pulsar: real speed':function(){real=!real;btn=btn||[...document.querySelectorAll('#ui button')].find(b=>b.textContent==='Pulsar: real speed');if(btn)btn.textContent=real?'Pulsar: slowed':'Pulsar: real speed';},
      'Pulsar: listen':function(){listen=!listen;if(listen)kit.audio.start();const b=[...document.querySelectorAll('#ui button')].find(e=>e.textContent==='Pulsar: listen');if(b)b.setAttribute('aria-pressed',String(listen));}},
    rows:()=>[{x:R,z:LC,w:TILT,dpt:NF,h:NEB},{x:BEAM,z:SLOW,w:NP,dpt:(K.shells||[]).length}],
    hud:()=>'the Crab Pulsar · '+(real?'29.6 turns a second':(SLOW+' turns a second, slowed '+Math.round(FAST/SLOW)+' times'))};
}
