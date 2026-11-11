// ---------- two neutron stars merge: GW170817 ----------
// A world unit is a kilometre. The two stars (each about 24 km across) orbit, losing energy to gravitational waves;
// their separation goes as the time left to the merger to the power 1/4 and their angular speed as its -3/8, so the
// orbital phase is known in closed form (phase(t) = w0 tc (1 - s^(5/8)) / (5/8), s the fraction of time left). The
// sheet under them is space, its height the wave's strain, enormously exaggerated: a quadrupole, cos(2 angle - 2
// phase), read at the retarded time t - r/c, so the ripples go out as a two-armed spiral at K.waveSpeed (light,
// slowed down a thousand times), louder as the orbit tightens. Then the merger, the short gamma-ray burst 1.7 seconds
// later (as it was), the kilonova (blue at first, then red as the heavy elements thicken it), and a black hole. On a
// loop of K.length seconds, with captions; the chart shows the wave as a detector here would record it, and Listen
// plays the chirp. #mgt=<seconds> starts the loop at that time (the tests use it).
import {mkRng} from '../core/rng.js';
export function merger(api,kit,K){
  const {THREE,animHooks}=api;const rnd=mkRng(K.seed||170817);
  const group=new THREE.Group(),T=K.length||48,TC=K.merge||30,A0=K.a0||220,AMIN=K.amin||26,W0=K.omega0||0.5,CV=K.waveSpeed||350,NSR=K.radius||12;
  const quiet=o=>{o.traverse(q=>{q.userData.noWire=true;});return o;};
  // ---- the orbit, in closed form ----
  const SM=Math.pow(AMIN/A0,4),TM=TC*(1-SM),WM=W0*Math.pow(SM,-3/8),PM=W0*TC*(1-Math.pow(SM,5/8))/0.625;
  const sep=t=>t<=0?A0:t>=TM?AMIN:A0*Math.pow(1-t/TC,0.25);
  const phase=t=>t<=0?W0*t:t<TM?W0*TC*(1-Math.pow(1-t/TC,0.625))/0.625:PM+WM*(t-TM);
  // the wave's size at the source: as the orbit's speed to the 2/3, so as 1/separation; after the merger it rings down
  const amp=t=>t<0?0:t<TM?A0/sep(t):(A0/AMIN)*Math.exp(-(t-TM)/0.5);
  // ---- the stars ----
  const nsM=new THREE.ShaderMaterial({vertexShader:'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec3 vN;void main(){float l=0.55+0.45*abs(vN.z);gl_FragColor=vec4(vec3(0.66,0.76,1.)*l*1.2,1.);}'});
  const stars=[0,1].map(i=>{const m=new THREE.Mesh(new THREE.SphereGeometry(NSR*(i?0.95:1),32,20),nsM);const g=kit.glow(0x9ab8ff,NSR*6,0.6);m.add(g);group.add(m);
    m.userData.info={name:'A neutron star',info:K.info||''};return m;});
  // ---- the sheet ----
  const GR=K.sheet||2600,SEG=K.sheetSegments||90,Y0=-70;
  const sheetG=new THREE.PlaneGeometry(GR*2,GR*2,SEG,SEG).rotateX(-Math.PI/2);
  const sp=sheetG.attributes.position,base=new Float32Array(sp.count*2);for(let i=0;i<sp.count;i++){base[i*2]=sp.getX(i);base[i*2+1]=sp.getZ(i);}
  const sheetM=new THREE.MeshBasicMaterial({color:0x4a6aa8,wireframe:true,transparent:true,opacity:0.35,depthWrite:false});
  const sheet=new THREE.Mesh(sheetG,sheetM);sheet.position.y=Y0;sheet.frustumCulled=false;group.add(sheet);
  sheet.userData.info={name:'Gravitational waves',info:K.waveInfo||''};
  // ---- the merger and after ----
  const flash=kit.glow(0xffffff,600,0);group.add(flash);
  const remnant=new THREE.Mesh(new THREE.SphereGeometry(18,32,20),new THREE.MeshBasicMaterial({color:0x000000}));group.add(remnant);
  const rimGlow=kit.glow(0xffa860,90,0);group.add(rimGlow);
  const jetM=new THREE.MeshBasicMaterial({color:0xd8c8ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  for(const sg of [1,-1]){const c=new THREE.Mesh(new THREE.ConeGeometry(110,3000,24,1,true).translate(0,-1500,0),jetM);c.rotation.x=sg>0?Math.PI:0;group.add(c);}
  const NK=K.kilonova||5000,kPos=new Float32Array(NK*3),kCol=new Float32Array(NK*3),KD=[];
  for(let i=0;i<NK;i++){const u=rnd()*2-1,th=rnd()*Math.PI*2,s=Math.sqrt(1-u*u);KD.push([s*Math.cos(th),u,s*Math.sin(th),0.4+0.6*rnd(),Math.abs(u)>0.55]);}
  const kG=new THREE.BufferGeometry();kG.setAttribute('position',new THREE.BufferAttribute(kPos,3));kG.setAttribute('color',new THREE.BufferAttribute(kCol,3));
  const kM=new THREE.PointsMaterial({map:kit.soft,size:40,vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
  const kil=new THREE.Points(kG,kM);kil.frustumCulled=false;group.add(kil);
  const kGlow=kit.glow(0x8fb0ff,400,0);group.add(kGlow);
  quiet(group);
  stars.forEach(m=>{m.userData.noWire=true;});
  // ---- the clock ----
  const GRB=TM+1.7,KN=TM+3,FADE=T-4;
  const cap=kit.captions([
    [0,10,'130 million years ago, in the galaxy NGC 4993: two neutron stars, about 1.5 and 1.3 times the Sun\'s mass and each the size of a city, in orbit round each other. Every orbit sends out gravitational waves, ripples in space itself.'],
    [10,21,'The waves carry energy away, so the orbit shrinks and quickens. On 17 August 2017 they reached the Earth: LIGO\'s two detectors and Virgo heard them for 100 seconds, rising in pitch, a chirp. Their stretch of the Earth was a few thousandths of a proton\'s width.'],
    [21,TM,'The last orbits: hundreds a second, at a third of the speed of light, the tides of each pulling the other out of round.'],
    [TM,GRB,'They touch and merge.'],
    [GRB,KN+2,'1.7 seconds after the waves, the Fermi and INTEGRAL satellites caught a short burst of gamma rays: the merger\'s jets. Light and gravity had raced each other for 130 million years and come in together: gravitational waves travel at the speed of light.'],
    [KN+2,FADE-3,'The kilonova: a few hundredths of a Sun\'s mass thrown out, and in it, by rapid neutron capture, the heavy elements: gold, platinum, uranium, perhaps several Earths\' mass of gold. Blue at first, then red, as those elements thicken the cloud. Telescopes found it 11 hours later; some seventy observatories watched.'],
    [FADE-3,T+1,'What was left was too heavy to stay a neutron star, and most likely collapsed to a black hole.']]);
  let on=false,t0=null,off=0,listen=false,lastT=-1,tNow=0;
  {const m=/(^|[#&])mgt=([\d.]+)/.exec(location.hash);if(m)off=+m[2];}
  const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
  const H0=K.height||70;
  animHooks.push(now=>{if(!on)return;if(t0==null)t0=now-off*1000;const t=((now-t0)/1000)%T;tNow=t;cap(t);
    if(listen&&lastT>=0&&lastT<TC-8&&t>=TC-8)kit.audio.chirp(kit.audio.now()+0.02,TM-(TC-8),35,420);
    lastT=t;
    // the stars
    const a=sep(t),p=phase(t),merged=t>=TM;
    stars.forEach((m,i)=>{const sg=i?-1:1;m.visible=!merged;m.position.set(Math.cos(p)*a/2*sg,0,Math.sin(p)*a/2*sg);
      const st=1+0.35*Math.pow(AMIN/a,3);m.scale.set(st,1/Math.sqrt(st),1/Math.sqrt(st));m.rotation.y=-p;});
    // the sheet: each vertex at its own retarded time
    const pa=sp.array;
    for(let i=0;i<sp.count;i++){const x=base[i*2],z=base[i*2+1],r=Math.hypot(x,z),tr=t-r/CV,A=amp(tr);
      pa[i*3+1]=A?H0*Math.pow(A/(A0/AMIN),0.7)*Math.min(1,Math.sqrt(250/Math.max(r,1)))*sm(0,120,r)*Math.cos(2*Math.atan2(z,x)-2*phase(tr))*(1-sm(FADE,T,t)):0;}
    sp.needsUpdate=true;
    // the flash, the burst, the cloud, the black hole
    const tm=t-TM;flash.material.opacity=merged?Math.max(0,1.3*Math.exp(-tm/0.5)):0;flash.scale.setScalar(300+600*sm(0,0.5,tm));
    jetM.opacity=t>GRB&&t<GRB+2?0.7*(1-(t-GRB)/2):0;
    remnant.visible=merged&&tm>1;rimGlow.material.opacity=remnant.visible?0.6*(1-sm(FADE,T,t)):0;
    const kt=t-KN;
    if(kt>0){const r=60+kt*90,red=sm(0,9,kt),pk=kG.attributes.position.array,ck=kG.attributes.color.array;
      for(let i=0;i<NK;i++){const d=KD[i],rr=r*d[3]*(d[4]?1.25:0.8);pk[i*3]=d[0]*rr;pk[i*3+1]=d[1]*rr;pk[i*3+2]=d[2]*rr;
        const blue=d[4]?1-red*0.6:1-red;ck[i*3]=0.55+0.45*(1-blue);ck[i*3+1]=0.45+0.25*blue;ck[i*3+2]=0.35+0.65*blue;}
      kG.attributes.position.needsUpdate=true;kG.attributes.color.needsUpdate=true;kM.opacity=0.8*(1-sm(FADE,T,t))*(0.4+0.6*Math.exp(-kt/8));kM.size=30+kt*4;
      kGlow.material.opacity=0.5*Math.exp(-kt/6);kGlow.material.color.setRGB(0.55+0.45*red,0.7-0.3*red,1-0.6*red);kGlow.scale.setScalar(r*2.4);}
    else{kM.opacity=0;kGlow.material.opacity=0;}
    drawWave(t);});
  // ---- the chart: the wave as a detector at the camera would record it, the last four seconds ----
  function drawWave(t){const c=kit.chart,b=c.frame('the last four seconds','strain'),g=c.g,mid=(b.y0+b.y1)/2,hh=(b.y0-b.y1)/2;
    g.strokeStyle='rgba(238,234,220,0.25)';g.beginPath();g.moveTo(b.x0,mid);g.lineTo(b.x1,mid);g.stroke();
    g.strokeStyle='#9ab8ff';g.lineWidth=2;g.beginPath();
    for(let k=0;k<=500;k++){const tt=t-4+4*k/500,h=amp(tt)/(A0/AMIN)*Math.cos(2*phase(tt)),x=b.x0+(b.x1-b.x0)*k/500,y=mid-h*hh*0.95;k?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();
    c.note(t<TM?'Higher and faster as the orbit closes: the chirp'+(listen?'.':' (press Merger: listen).'):t<TM+2?'The ring-down: the merged star settles.':'Silence: the waves have gone by.');}
  const restart=()=>{t0=null;off=0;lastT=-1;};
  return {group,ownSky:false,view:K.view||{az:0.8,el:0.45,d:1500},
    get pick(){return [...stars,sheet];},
    active(v){on=v;t0=null;lastT=-1;if(v)kit.chart.show('The gravitational wave','');},
    buttons:{'Merger: again':restart,
      'Merger: listen':function(){listen=!listen;if(listen)kit.audio.start();const b=[...document.querySelectorAll('#ui button')].find(e=>e.textContent==='Merger: listen');if(b)b.setAttribute('aria-pressed',String(listen));}},
    hud:()=>{const t=tNow;return 'GW170817 · '+(t<TM?(TM-t).toFixed(1)+' s to the merger, '+Math.round(sep(t))+' km apart':t<GRB?'the merger':t<KN?'the gamma-ray burst':t<FADE?'the kilonova':'a black hole');},
    rows:()=>[{x:A0,z:AMIN,w:W0,dpt:SEG,h:TC},{x:NK,z:T,w:CV,dpt:GR}]};
}
