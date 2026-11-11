// ---------- a core-collapse supernova ----------
// A red supergiant of some twenty suns, cut away to its shells like an onion (hydrogen outside, then helium, carbon
// and oxygen, neon, silicon, and the iron core at the middle, which fusion cannot burn), and what happens when the
// core runs out: it falls in on itself in a quarter of a second, bounces off the neutron star it has made, and the
// shock, pushed by the neutrinos, takes hours to cross the star; it breaks out of the surface in a flash, and the
// star's layers go out at thousands of km a second, mixed into fingers as they go, leaving a neutron star at the
// middle and, in a thousand years, a remnant like the Crab. The real thing takes hours to a day before the surface
// moves and the core is 1/100,000 of the star's radius; here the clock is K.length seconds on a loop, the shells
// are drawn far thicker than they are, and the captions say how long each step really takes.
// #snt=<seconds> starts the loop at that time (the tests use it).
import {mkRng} from '../core/rng.js';
export function supernova(api,kit,K){
  const {THREE,camera,animHooks}=api;const rnd=mkRng(K.seed||1987);
  const R=K.radius||600,T=K.length||64,group=new THREE.Group();
  const quiet=o=>{o.traverse(q=>{q.userData.noWire=true;});return o;};
  // ---- the star, cut away: a quarter left out of every shell ----
  const SH=K.shells||[[1,'#c03a1a','Hydrogen envelope'],[0.36,'#e08a2a','Helium'],[0.22,'#e8d050','Carbon and oxygen'],[0.14,'#80d060','Neon and oxygen'],[0.085,'#50b8d0','Silicon'],[0.045,'#d8e0f0','The iron core']];
  const star=new THREE.Group();group.add(star);const shells=[];
  SH.forEach(([f,col,name],si)=>{const g=new THREE.SphereGeometry(R*f,64,40,Math.PI*0.25,Math.PI*1.5);
    // the outer surface mottled with the convection cells a supergiant has, a few the size of the star
    const c=new THREE.Color(col),p=g.attributes.position,cc=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++){const x=p.getX(i)/R,y=p.getY(i)/R,z=p.getZ(i)/R,n=f===1?0.78+0.22*Math.sin(x*7+Math.sin(y*5))*Math.sin(z*6+y*3):1;cc[i*3]=c.r*n;cc[i*3+1]=c.g*n;cc[i*3+2]=c.b*n;}
    g.setAttribute('color',new THREE.BufferAttribute(cc,3));
    const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity:1}));
    // the cut's two faces: a half-ring each, from this shell in to the next, at the two edges of the wedge, so the
    // shells show as bands, a little darker than their surfaces
    const fm=new THREE.MeshBasicMaterial({color:c.clone().multiplyScalar(0.8),side:THREE.DoubleSide,transparent:true,opacity:1}),fi=SH[si+1]?R*SH[si+1][0]:0;
    const face=new THREE.Group();for(const a of [Math.PI*0.25,Math.PI*1.75]){const d=new THREE.Mesh(new THREE.RingGeometry(fi,R*f,48,1,-Math.PI/2,Math.PI),fm);d.rotation.y=Math.PI-a;d.renderOrder=1;face.add(d);}
    const s=new THREE.Group();s.add(m,face);s.userData.info={name,info:''};star.add(s);shells.push({s,f,m,fm});});
  // shells inner of the outer one go in front of it in the cut: push each a hair forward
  shells.forEach((q,i)=>{q.s.children.forEach(o=>{o.renderOrder=i;});});
  const starInfo=K.info||'';shells[0].s.userData.info={name:'A red supergiant',info:starInfo};
  const labels=new THREE.Group();group.add(labels);
  // the wedge left out faces +x (three's sphere starts its phi at -x, so the star is turned half round). The labels
  // stand in a column to the screen's right of the star, wherever the camera is, each with a line to the middle of its
  // band on whichever cut face is turned more towards the camera
  star.rotation.y=Math.PI;
  const leadM=new THREE.LineBasicMaterial({color:0xd8b030,transparent:true,opacity:0.8,depthTest:false});
  const LB=SH.map(([f,,name],i)=>{const r=R*(f+(SH[i+1]?SH[i+1][0]:0))/2;
    const l=kit.label(name);labels.add(l);const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);const ln=new THREE.Line(g,leadM);ln.renderOrder=9;ln.frustumCulled=false;labels.add(ln);
    return {r,i,l,ln};});
  function placeLabels(){const p=camera.position,az=Math.atan2(p.z,p.x),right=new THREE.Vector3(Math.sin(az),0,-Math.cos(az)),c=Math.SQRT1_2,side=p.z>=0?1:-1;
    for(const q of LB){const a=new THREE.Vector3(q.r*c,R*0.02*q.i,side*q.r*c),b=right.clone().multiplyScalar(R*1.2).setY(R*(0.8-0.32*q.i));
      q.l.position.copy(b);const pa=q.ln.geometry.attributes.position;pa.setXYZ(0,a.x,a.y,a.z);pa.setXYZ(1,b.x,b.y,b.z);pa.needsUpdate=true;}}
  const coreGlow=kit.glow(0xe8f0ff,R*0.15,0.9);group.add(coreGlow);
  // ---- the shock: a shell that goes out through the star ----
  const shockM=new THREE.MeshBasicMaterial({color:0xfff2c0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const shock=new THREE.Mesh(new THREE.SphereGeometry(1,48,32),shockM);group.add(shock);
  const flash=kit.glow(0xffffff,R*6,0);group.add(flash);
  const nuFlash=kit.glow(0xc8d8ff,R*1.4,0);group.add(nuFlash);
  // ---- the ejecta: each puff a piece of one shell, going out at its own speed, faster out than in, in fingers ----
  const NE=K.ejecta||9000,ePos=new Float32Array(NE*3),eCol=new Float32Array(NE*3),E=[];
  // the inner layers break out through the outer ones as Rayleigh-Taylor fingers: a few hundred directions, each a
  // thread of puffs strung out along it, the heavier elements at its root and the lighter at its tip
  const dirs=[];for(let i=0;i<(K.fingers||340);i++){const u=rnd()*2-1,th=rnd()*Math.PI*2,s=Math.sqrt(1-u*u);dirs.push([s*Math.cos(th),u,s*Math.sin(th),0.75+0.5*rnd()]);}
  for(let i=0;i<NE;i++){const D=dirs[i%dirs.length],j=0.05;let x=D[0]+(rnd()-0.5)*j,y=D[1]+(rnd()-0.5)*j,z=D[2]+(rnd()-0.5)*j;const l=Math.hypot(x,y,z);x/=l;y/=l;z/=l;
    const u=rnd(),k=Math.min(SH.length-1,Math.floor((1-u)*(SH.length-0.01))),c=new THREE.Color(SH[k][1]).lerp(new THREE.Color('#fff4e0'),0.25);
    const sp=D[3]*(0.3+0.7*Math.pow(u,0.7));E.push({x,y,z,sp,k});
    eCol[i*3]=c.r;eCol[i*3+1]=c.g;eCol[i*3+2]=c.b;}
  const eg=new THREE.BufferGeometry();eg.setAttribute('position',new THREE.BufferAttribute(ePos,3));eg.setAttribute('color',new THREE.BufferAttribute(eCol,3));
  const eM=new THREE.PointsMaterial({map:kit.soft,size:R*0.05,vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
  const ej=new THREE.Points(eg,eM);ej.frustumCulled=false;group.add(ej);
  const ns=kit.glow(0xb8d0ff,R*0.08,0);group.add(ns);
  quiet(group);
  const ejGlow=kit.glow(0xffd8a8,R,0);group.add(ejGlow);
  // ---- the clock, and the days ----
  // After the breakout the loop's seconds stand for days, slowly at first: day = 400 ((t - breakout) / (fade -
  // breakout))^1.6. The light curve is a type II-P's, as a red supergiant gives: the breakout's flash, a plateau of
  // about a hundred days while the hydrogen recombines from the outside in, a drop, and the radioactive tail (cobalt-56,
  // half-life 77 days: a magnitude a hundred days). Absolute magnitudes, as the chart draws them.
  const at={collapse:12,bounce:18,breakout:28,coast:34,fade:T-5};
  const DAYS=400,dayAt=t=>t<at.breakout?-1:DAYS*Math.pow(Math.min(1,(t-at.breakout)/(at.fade-at.breakout)),1.6);
  const tAt=day=>at.breakout+(at.fade-at.breakout)*Math.pow(day/DAYS,1/1.6);
  const mag=d=>d<0?-9:d<1?-15.5-3*Math.exp(-d*6)+(-1.5*d):d<8?-17-0.5*(d-1)/7:d<100?-17.5+0.007*(d-8):d<125?-16.86+2.5*(d-100)/25:-14.36+0.0098*(d-125);
  const cap=kit.captions([
    [0,at.collapse,'A red supergiant some twenty times the Sun\'s mass, near the end: cut away to the shells it has burned, each the ash of the one outside it. Its core is iron, and burning iron gives nothing back.'],
    [at.collapse,at.bounce,'The iron core, as massive as the Sun and the size of the Earth, can no longer hold itself up. It falls in at a quarter of the speed of light, in a quarter of a second.'],
    [at.bounce,at.breakout-2,'It stops at the density of an atom\'s nucleus, a neutron star 20 km across, and bounces. A flood of neutrinos drives the shock out; it takes hours to cross the star.'],
    [at.breakout-2,at.coast,'Shock breakout: the shock reaches the surface, and the star flashes brighter than all the hundred billion stars of its galaxy together.'],
    [at.coast,tAt(60),'The star\'s layers go out at up to 10,000 km a second, its elements mixed into fingers as they go: the iron, silicon and oxygen it made, out into the galaxy. At the middle, the neutron star.'],
    [tAt(60),tAt(115),'The plateau: for about a hundred days it stays as bright, as the hydrogen it threw off cools and recombines from the outside in, letting out the heat of the explosion.'],
    [tAt(115),at.fade,'The tail: what shines now is the nickel-56 the explosion made, a tenth of the Sun\'s mass of it, decaying to cobalt-56 (half-life six days) and then to iron-56 (77 days). The iron in your blood was made like this.'],
    [at.fade,T+1,'In a thousand years, a remnant a dozen light years across: the Crab Nebula is one, seen to explode in 1054 (press Pulsar).']]);
  let on=false,t0=null,off=0;
  {const m=/(^|[#&])snt=([\d.]+)/.exec(location.hash);if(m)off=+m[2];}
  const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
  let tNow=0,rrNow=R;
  animHooks.push(now=>{if(!on)return;if(t0==null)t0=now-off*1000;const t=((now-t0)/1000)%T;tNow=t;cap(t);
    // the core falls in
    const fall=sm(at.collapse,at.bounce,t);const core=shells[shells.length-1];core.s.scale.setScalar(Math.max(0.12,1-0.88*fall*fall));
    coreGlow.material.opacity=0.9*(1-sm(at.bounce,at.bounce+1,t));coreGlow.scale.setScalar(R*0.15*(1-0.8*fall)+1);
    // the bounce: neutrinos, and the shock going out to the surface by the breakout
    const ts=t-at.bounce,sk=sm(0,at.breakout-at.bounce,ts);
    nuFlash.material.opacity=ts>0?Math.max(0,1-ts/1.5):0;
    shock.visible=ts>0&&t<at.breakout+0.5;shock.scale.setScalar(Math.max(1,R*(0.05+0.97*Math.pow(sk,0.8))));shockM.opacity=0.35*(1-sm(at.breakout-1,at.breakout+0.5,t));
    // the breakout flash, then the star is gone and the ejecta coast out
    const tb=t-at.breakout;flash.material.opacity=tb>0?Math.max(0,1.2*Math.exp(-tb/1.8)-0.05):0;flash.scale.setScalar(R*(3+6*Math.min(1,Math.max(0,tb)/2)));
    const gone=sm(at.breakout,at.breakout+1.2,t);star.visible=gone<1;
    for(const q of shells)q.m.material.opacity=q.fm.opacity=1-gone;labels.visible=t<at.collapse+2&&camera.position.x>0;   // only while the cut, which faces +x, can be seen
    const eo=t<at.breakout?0:(1-sm(at.fade,T,t))*(0.95);eM.opacity=eo;ej.visible=eo>0.01;
    if(ej.visible){const rr=R*(0.9+2.6*(1-Math.exp(-Math.max(0,tb)/12))),pa=eg.attributes.position.array;rrNow=rr;
      for(let i=0;i<NE;i++){const e=E[i],r=rr*e.sp;pa[i*3]=e.x*r;pa[i*3+1]=e.y*r;pa[i*3+2]=e.z*r;}eg.attributes.position.needsUpdate=true;eM.size=R*(0.06+0.05*Math.min(1,Math.max(0,tb)/20));}
    ns.material.opacity=t>at.breakout+1?0.9:0;
    // the debris shines as the light curve says
    const day=dayAt(t),lum=day<0?0:Math.pow(10,-0.4*(mag(day)+17.5));
    if(ej.visible){eM.opacity*=0.3+0.7*Math.min(1,Math.sqrt(lum));ejGlow.material.opacity=Math.min(0.9,0.6*lum)*(1-sm(at.fade,T,t));ejGlow.scale.setScalar(rrNow*2.2);}else ejGlow.material.opacity=0;
    if(labels.visible)placeLabels();
    if(day>=0&&t<at.fade+3){if(!chartOn){chartOn=true;kit.chart.show('Its light curve: a type II-P supernova','');}drawCurve(day);}else if(chartOn){chartOn=false;kit.chart.hide();}});
  let chartOn=false;
  function drawCurve(day){const c=kit.chart,b=c.frame('days after the breakout','brightness'),g=c.g,X=d=>b.x0+(b.x1-b.x0)*d/DAYS,Y=m=>b.y1+(b.y0-b.y1)*(m+18.6)/7.2;
    g.strokeStyle='rgba(216,176,48,0.45)';g.lineWidth=2;g.beginPath();for(let d=0;d<=DAYS;d+=2){d?g.lineTo(X(d),Y(mag(d))):g.moveTo(X(d),Y(mag(d)));}g.stroke();
    g.strokeStyle='#ffd27a';g.lineWidth=3.5;g.beginPath();for(let d=0;d<=day;d+=1){d?g.lineTo(X(d),Y(mag(d))):g.moveTo(X(d),Y(mag(d)));}g.stroke();
    g.fillStyle='#fff';g.beginPath();g.arc(X(day),Y(mag(day)),6,0,7);g.fill();
    g.fillStyle='#b8b4a4';g.font='18px Georgia, serif';g.fillText('plateau',X(30),Y(-17.5)-10);g.fillText('cobalt-56 tail',X(200),Y(mag(200))-12);
    c.note('Day '+Math.round(day)+'. '+(day<100?'As bright as a few hundred million Suns.':'Fading by a magnitude every hundred days, as the cobalt decays.'));}
  const restart=()=>{t0=null;off=0;};
  return {group,ownSky:false,view:K.view||{az:0.35,el:0.18,d:R*5.4},
    get pick(){return star.visible?shells.map(q=>q.s):[];},
    active(v){on=v;t0=null;chartOn=false;},
    rows:()=>[...SH.map(([f],i)=>({x:f*R,z:i,w:R})),{x:NE,z:T,w:(K.fingers||340),dpt:DAYS}],
    buttons:{'Supernova: again':restart},
    hud:()=>{const t=tNow,d=dayAt(t);return 'a core-collapse supernova · '+(t<at.collapse?'the star':t<at.bounce?'core collapse':t<at.breakout?'the shock':t<at.fade?'day '+Math.round(d):'the remnant');}};
}
