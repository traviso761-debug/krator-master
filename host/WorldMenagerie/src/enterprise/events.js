// ---------- Galaxy class: events ----------
// Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used, and every sound here is
// synthesised by the page.
//
//   Warp          from the turntable: the engines spool up, the ship stretches and is gone in a flash, and a few
//                 seconds later it drops back out where it was. At the helm: warp 5, and Warp again drops out
//                 into a new system.
//   Red alert     the windows go red and pulse, and the klaxon sounds.
//   Shields       raised with a shimmer; after that they show only where something hits them.
//   Phasers       the emitters run along the saucer's strip, above or below, to the point nearest the target and
//                 meet; then the beam.
//   Torpedo       out of the forward launcher at the foot of the neck; it blows the target rock apart.
//   Incoming fire a bolt from somewhere off the bow quarter: on the shields if they are up, on the hull if not.
//   Separate      the saucer lifts off the neck and moves ahead; again, and it comes back and docks.
//   Shuttle       a shuttle out of the main bay at the stern, peeling away.
import {saucerTop,saucerBot} from './hull.js';
import {SAUCER,TORPEDO,BAYS} from './dims.js';
import {neckLead} from './hull.js';

export function events(W){
  const {THREE,scene,camera,ROOT,G,SAU,animHooks,glowTex}=W;
  const FX=W.FX,SYS=W.SYS;
  const V3=()=>new THREE.Vector3();
  const live=[];          // running effects: each a function(now, dt) that returns false when it is done
  const run=f=>{if(firstT==null)firstT=T;live.push(f);};
  let last=null,T=0;
  // (a test may freeze the events' clock a set time after the first one starts: #evfreeze=seconds)
  let freeze=null;W.freezeAfter=s=>{freeze=s;};let firstT=null;
  animHooks.push(now=>{let dt=last==null?0:Math.min(0.1,(now-last)/1000);last=now;
    if(freeze!=null&&firstT!=null&&T+dt>firstT+freeze)dt=Math.max(0,firstT+freeze-T);T+=dt;
    for(let i=live.length-1;i>=0;i--)if(live[i](T,dt)===false)live.splice(i,1);});
  W.evClock=()=>[T,firstT,freeze,live.length];
  const ease=x=>x<0?0:x>1?1:x*x*(3-2*x);

  // ---------- sound ----------
  let AC=null,master=null;
  const ac=()=>{if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=0.22;master.connect(AC.destination);}catch(e){AC=null;}}
    if(AC&&AC.state==='suspended')AC.resume();return AC;};
  const noise=(a,dur)=>{const b=a.createBuffer(1,Math.ceil(a.sampleRate*dur),a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=a.createBufferSource();s.buffer=b;return s;};
  const env=(a,g,t0,att,hold,rel,peak)=>{g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(peak,t0+att);g.gain.setValueAtTime(peak,t0+att+hold);g.gain.exponentialRampToValueAtTime(0.0001,t0+att+hold+rel);};
  function sound(kind){
    const a=ac();if(!a)return;const t=a.currentTime;
    if(kind==='phaser'){const o=a.createOscillator(),o2=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain();
      o.type='sawtooth';o.frequency.setValueAtTime(1150,t);o.frequency.linearRampToValueAtTime(980,t+1.6);o2.type='sine';o2.frequency.value=31;
      const lg=a.createGain();lg.gain.value=60;o2.connect(lg);lg.connect(o.frequency);f.type='bandpass';f.frequency.value=1400;f.Q.value=2;
      o.connect(f);f.connect(g);g.connect(master);env(a,g,t+0.4,0.05,1.2,0.35,0.9);o.start(t);o2.start(t);o.stop(t+2.2);o2.stop(t+2.2);}
    else if(kind==='torpedo'){const o=a.createOscillator(),g=a.createGain();o.type='triangle';o.frequency.setValueAtTime(820,t);o.frequency.exponentialRampToValueAtTime(110,t+0.7);
      o.connect(g);g.connect(master);env(a,g,t,0.01,0.1,0.6,0.9);o.start(t);o.stop(t+0.9);
      const n=noise(a,0.6),f=a.createBiquadFilter(),g2=a.createGain();f.type='highpass';f.frequency.value=2500;n.connect(f);f.connect(g2);g2.connect(master);env(a,g2,t,0.005,0.05,0.4,0.4);n.start(t);}
    else if(kind==='boom'){const n=noise(a,2.4),f=a.createBiquadFilter(),g=a.createGain();f.type='lowpass';f.frequency.setValueAtTime(1800,t);f.frequency.exponentialRampToValueAtTime(90,t+2);
      n.connect(f);f.connect(g);g.connect(master);env(a,g,t,0.01,0.15,2,1.2);n.start(t);}
    else if(kind==='hit'){const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(260,t);o.frequency.exponentialRampToValueAtTime(70,t+0.8);
      o.connect(g);g.connect(master);env(a,g,t,0.01,0.05,0.8,0.9);o.start(t);o.stop(t+1);sound('boom');}
    else if(kind==='klaxon'){for(let k=0;k<3;k++){const o=a.createOscillator(),g=a.createGain(),t0=t+k*1.1;o.type='square';
      o.frequency.setValueAtTime(330,t0);o.frequency.exponentialRampToValueAtTime(760,t0+0.75);const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=1800;
      o.connect(f);f.connect(g);g.connect(master);env(a,g,t0,0.03,0.6,0.2,0.35);o.start(t0);o.stop(t0+1);}}
    else if(kind==='warp'){const n=noise(a,3),f=a.createBiquadFilter(),g=a.createGain();f.type='bandpass';f.Q.value=3;f.frequency.setValueAtTime(200,t);f.frequency.exponentialRampToValueAtTime(3200,t+1.6);
      n.connect(f);f.connect(g);g.connect(master);env(a,g,t,0.9,0.5,1.2,0.8);n.start(t);
      const o=a.createOscillator(),g2=a.createGain();o.type='sine';o.frequency.setValueAtTime(60,t+1.4);o.frequency.exponentialRampToValueAtTime(25,t+2.6);o.connect(g2);g2.connect(master);env(a,g2,t+1.4,0.02,0.1,1.2,1.4);o.start(t+1.4);o.stop(t+3);}
    else if(kind==='shield'){const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(180,t);o.frequency.linearRampToValueAtTime(520,t+0.9);
      o.connect(g);g.connect(master);env(a,g,t,0.2,0.4,0.6,0.5);o.start(t);o.stop(t+1.4);}
  }

  // ---------- pieces ----------
  const sprite=(col,size,op=1)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:col,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,toneMapped:false,opacity:op}));
    s.scale.setScalar(size);s.userData.noWire=true;return s;};
  // a flash where something happened, in the world: it swells and fades
  function flash(pos,col,size,dur,parent){
    const s=sprite(col,size*0.3);s.position.copy(pos);(parent||FX).add(s);const t0=T;
    run(t=>{const u=(t-t0)/dur;if(u>=1){s.parent.remove(s);s.material.dispose();return false;}
      s.scale.setScalar(size*(0.3+0.9*Math.sqrt(u)));s.material.opacity=Math.pow(1-u,1.6);});
  }
  const world=(o,local)=>o.localToWorld(local.clone());
  const toFX=p=>FX.worldToLocal(p.clone());
  const dirFX=v=>v.clone().applyQuaternion(FX.quaternion.clone().invert());
  const shipCentre=()=>ROOT.getWorldPosition(V3());

  // ---------- the target ----------
  // A rock some kilometres off the port bow, slowly tumbling, to shoot at.
  const rock=(()=>{
    const g=new THREE.IcosahedronGeometry(1,4),p=g.attributes.position,v=V3();
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const n=Math.sin(v.x*3.1+1.3)*Math.sin(v.y*2.7+0.4)*Math.sin(v.z*3.7+2.1)*0.18+Math.sin(v.x*7.3)*Math.sin(v.y*6.1+1)*Math.sin(v.z*5.3)*0.06;
      v.multiplyScalar(1+n);v.x*=1.35;p.setXYZ(i,v.x,v.y,v.z);}
    g.computeVertexNormals();
    const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x8a7f72,roughness:0.95,metalness:0.02,emissive:0xff6020,emissiveIntensity:0}));
    m.scale.setScalar(55);m.castShadow=m.receiveShadow=true;m.userData.noWire=true;
    m.userData.info={name:'A rock',info:'A few hundred thousand tonnes of nickel-iron, here to be shot at.'};
    SYS.add(m);return m;})();
  rock.position.set(2600,180,-1300);
  let rockDead=false,rockHeat=0;
  function placeTarget(){
    const f=new THREE.Vector3(1,0,0).applyQuaternion(ROOT.quaternion),r=new THREE.Vector3(0,0,1).applyQuaternion(ROOT.quaternion);
    const p=shipCentre().addScaledVector(f,2600).addScaledVector(r,(Math.random()<0.5?-1:1)*1100).add(new THREE.Vector3(0,(Math.random()-0.5)*500,0));
    rock.position.copy(SYS.worldToLocal(p));rock.visible=true;rockDead=false;
  }
  W.placeTarget=placeTarget;
  animHooks.push(()=>{rock.rotation.x+=0.0007;rock.rotation.y+=0.0011;rockHeat*=0.96;rock.material.emissiveIntensity=rockHeat;});
  const targetPos=()=>{
    const c=shipCentre();
    if(rock.visible){const p=rock.getWorldPosition(V3());if(p.distanceTo(c)<15000)return {p,rock:true};}
    return {p:c.addScaledVector(new THREE.Vector3(1,0,0).applyQuaternion(ROOT.quaternion),3500),rock:false};
  };

  // ---------- warp ----------
  // power: how hard the engines are working, 0 to 1; the grilles, the collectors and their glows answer it
  let power=0,powerTo=0;
  animHooks.push((now)=>{power+=(powerTo-power)*0.06;const k=power;
    W.grilleMat.color.setRGB(1+1.4*k,1+1.5*k,1+1.2*k);W.bussMat.color.setRGB(1+0.8*k,1+0.5*k,1+0.4*k);
    for(const g of W.bussGlows)g.scale.setScalar(95*(1+1.2*k));});
  let warpShow=false;
  function warpShowRun(){
    // from the turntable: out, and back
    if(warpShow)return;warpShow=true;sound('warp');powerTo=1;const t0=T;let gone=false,back=false;
    const home=ROOT.position.clone(),fwd=new THREE.Vector3(1,0,0).applyQuaternion(ROOT.quaternion);
    run(t=>{const u=t-t0;
      if(u<1.5)return;
      if(u<1.85){const k=(u-1.5)/0.35;ROOT.scale.x=1+5*k*k;ROOT.position.copy(home).addScaledVector(fwd,8000*k*k*k);
        if(!gone){gone=true;flash(world(G,new THREE.Vector3(-129,-34,0)),0xcfe4ff,1300,0.8);}return;}
      if(u<5.2){ROOT.visible=false;return;}
      if(!back){back=true;ROOT.visible=true;sound('warp');flash(home.clone().addScaledVector(fwd,300),0xcfe4ff,1200,0.8);}
      if(u<5.6){const k=1-(u-5.2)/0.4;ROOT.scale.x=1+4*k*k;ROOT.position.copy(home).addScaledVector(fwd,6000*k*k*k);return;}
      ROOT.scale.x=1;ROOT.position.copy(home);powerTo=0;warpShow=false;return false;});
  }
  function engage(factor){
    const S=W.flight;
    if(!S.on){warpShowRun();return;}
    if(S.warp){S.warp=factor;return;}
    if(W.spooling)return;W.spooling=true;sound('warp');powerTo=1;const t0=T;let went=false;
    run(t=>{const u=t-t0;if(!W.spooling||!S.on){ROOT.scale.x=1;W.spooling=false;if(!S.warp)powerTo=0;return false;}if(u<1.4)return;
      if(!went){went=true;S.warp=factor;flash(shipCentre().add(new THREE.Vector3(1,0,0).applyQuaternion(ROOT.quaternion).multiplyScalar(-200)),0xcfe4ff,2400,1.1);}
      const k=Math.max(0,1-(u-1.4)/0.5);ROOT.scale.x=1+3*k;
      if(u>1.9){ROOT.scale.x=1;W.spooling=false;return false;}});
  }
  function dropOut(quiet){
    const S=W.flight;W.spooling=false;if(!S.warp)return;S.warp=0;S.v=Math.min(S.v,W.FULL_IMPULSE);powerTo=0;
    W.relocate();if(!quiet){sound('warp');flash(shipCentre().add(new THREE.Vector3(1,0,0).applyQuaternion(ROOT.quaternion).multiplyScalar(500)),0xcfe4ff,2400,1.1);}
  }
  W.engage=engage;W.dropOut=dropOut;

  // ---------- red alert ----------
  let red=false,redT=0;
  const winBase=W.hullMats.map(m=>({m,c:m.emissive.clone(),i:m.emissiveIntensity}));
  const redLamps=[];
  for(const [x,z] of [[60,150],[60,-150],[-150,90],[-150,-90]]){const s=sprite(0xff2010,40,0);s.position.set(x,saucerTop(x,z)+1.2,z);SAU.add(s);redLamps.push(s);}
  animHooks.push(()=>{
    const k=red?0.5+0.5*Math.sin((T-redT)*Math.PI*1.4):0;
    for(const w of winBase){if(red){w.m.emissive.setRGB(1,0.16+0.06*k,0.1);w.m.emissiveIntensity=w.i*(0.45+0.9*k);}else{w.m.emissive.copy(w.c);w.m.emissiveIntensity=w.i;}}
    for(const s of redLamps)s.material.opacity=red?k:0;});
  function redAlert(){red=!red;redT=T;if(red)sound('klaxon');}

  // ---------- shields ----------
  // An ellipsoid round the whole ship, a little bigger than it. A fresnel rim, a faint hexagonal weave, and a
  // ripple that runs out from wherever it is struck.
  const SC=new THREE.Vector3(-129.25,-34.5,0),SR=new THREE.Vector3(372,118,282);
  const shMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false,
    uniforms:{uS:{value:null},uOn:{value:0},uT:{value:0},uHit:{value:new THREE.Vector4(0,0,0,-99)},uCol:{value:new THREE.Color(0.35,0.62,1.0)}},
    vertexShader:`uniform vec3 uS;varying vec3 vP,vN,vV;void main(){vP=position*uS;vec4 w=modelMatrix*vec4(position,1.);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`varying vec3 vP,vN,vV;uniform float uOn,uT;uniform vec4 uHit;uniform vec3 uCol;
      float hex(vec2 p){p*=0.055;vec2 q=vec2(p.x*1.1547,p.y+p.x*0.5773);vec2 f=fract(q);float a=min(min(f.x,f.y),min(1.-f.x,1.-f.y));return smoothstep(0.0,0.06,a);}
      void main(){float fr=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.6);
        float h=1.-hex(vP.xz+vP.y*0.7);
        float age=uT-uHit.w,d=length(vP-uHit.xyz),ring=exp(-pow((d-age*420.)/38.,2.))*exp(-age*1.4),spot=exp(-d/40.)*exp(-age*3.);
        float a=uOn*(fr*0.5+h*fr*0.6)+(ring*(0.5+0.8*h)+spot*1.5)*(0.35+fr);
        gl_FragColor=vec4(uCol*a,a);}`});
  shMat.uniforms.uS.value=SR;
  const shield=new THREE.Mesh(new THREE.SphereGeometry(1,64,40),shMat);
  // in the ship's own frame, centred on it; drawn last
  shield.position.copy(SC);shield.scale.copy(SR);shield.renderOrder=10;shield.userData.noWire=true;shield.raycast=()=>{};G.add(shield);
  let shUp=false,shT=-99;
  animHooks.push(()=>{shMat.uniforms.uT.value=T;const u=T-shT;shMat.uniforms.uOn.value=shUp?Math.max(0.0,1.2*Math.exp(-u*1.1)):0;
    shield.visible=shUp||T-shMat.uniforms.uHit.value.w<4;});
  function shields(){shUp=!shUp;shT=T;if(shUp)sound('shield');}
  function shieldHit(worldP){const l=shield.worldToLocal(worldP.clone()).normalize();const p=l.multiply(SR);shMat.uniforms.uHit.value.set(p.x,p.y,p.z,T);}

  // ---------- phasers ----------
  const A=SAUCER.a,B=SAUCER.b;
  const stripAt=(th,top)=>{const e=top?0.69:0.745,x=e*A*Math.cos(th),z=e*B*Math.sin(th);
    return new THREE.Vector3(x,top?saucerTop(x,z)+0.4:saucerBot(x,z)-0.4,z);};
  const beamGeo=new THREE.CylinderGeometry(1,1,1,10,1,true);beamGeo.translate(0,0.5,0);
  const beamMat=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
  const Y=new THREE.Vector3(0,1,0);
  function phasers(){
    const tg=targetPos();const tl=SAU.worldToLocal(tg.p.clone());const top=tl.y>-25;
    // the point on the strip that looks most nearly at the target (skipping the gap over the impulse deck)
    let best=0,bd=-2;for(let i=0;i<180;i++){const th=i/180*Math.PI*2,p=stripAt(th,top);if(p.x<-95&&Math.abs(p.z)<150)continue;
      const d=tl.clone().sub(p).normalize().dot(new THREE.Vector3(p.x/A,0,p.z/B).normalize());if(d>bd){bd=d;best=th;}}
    sound('phaser');
    const em=[sprite(0xffa040,26),sprite(0xffa040,26)];for(const s of em)SAU.add(s);
    const outer=new THREE.Mesh(beamGeo,beamMat(0xff5a1a)),core=new THREE.Mesh(beamGeo,beamMat(0xfff0c8));
    const hitS=sprite(0xffb060,90);for(const o of [outer,core,hitS]){o.visible=false;o.userData.noWire=true;FX.add(o);}
    const t0=T;
    run(t=>{const u=t-t0;
      if(u<0.42){const k=ease(u/0.42);em[0].position.copy(stripAt(best-0.5*(1-k),top));em[1].position.copy(stripAt(best+0.5*(1-k),top));return;}
      if(u<2.0){
        const a=world(SAU,stripAt(best,top)),b=tg.rock?rock.getWorldPosition(V3()).add(a.clone().sub(rock.getWorldPosition(V3())).normalize().multiplyScalar(48)):tg.p;
        const A0=toFX(a),B0=toFX(b),d=B0.clone().sub(A0),L=d.length(),fl=0.75+0.25*Math.sin(u*90);
        for(const [m,r] of [[outer,4.2*fl],[core,1.5]]){m.visible=true;m.position.copy(A0);m.quaternion.setFromUnitVectors(Y,d.clone().normalize());m.scale.set(r,L,r);}
        em[0].position.copy(stripAt(best,top));em[1].visible=false;em[0].scale.setScalar(40*fl);
        hitS.visible=true;hitS.position.copy(B0);hitS.scale.setScalar(80+40*Math.random());
        if(tg.rock)rockHeat=Math.min(1.4,rockHeat+0.06);
        return;}
      for(const o of [outer,core,hitS])FX.remove(o);for(const s of em)SAU.remove(s);return false;});
  }

  // ---------- torpedoes ----------
  const launcher=()=>{const y=TORPEDO.fore.y;return world(G,new THREE.Vector3(neckLead(y)+1.5,y,0));};
  function torpedo(){
    const tg=targetPos(),p=launcher(),dir=tg.p.clone().sub(p).normalize();
    sound('torpedo');flash(p,0xff6030,60,0.5);
    const g=new THREE.Group(),core=sprite(0xffd0a0,16),halo=sprite(0xff3a10,60),spk=[sprite(0xff7040,34),sprite(0xff7040,34)];
    g.add(halo,core,...spk);g.position.copy(toFX(p));FX.add(g);
    const v=dir.multiplyScalar(2600).add(new THREE.Vector3(1,0,0).applyQuaternion(ROOT.quaternion).multiplyScalar(W.flight.v||0));const t0=T;
    run((t,dt)=>{const u=t-t0;g.position.addScaledVector(dirFX(v),dt);
      halo.scale.setScalar(55+12*Math.sin(u*40));spk[0].scale.set(90,8,1);spk[1].scale.set(8,90,1);spk[0].material.rotation=u*6;spk[1].material.rotation=u*6;
      const wp=g.getWorldPosition(V3());
      const hit=tg.rock&&rock.visible&&wp.distanceTo(rock.getWorldPosition(V3()))<70;
      if(hit||u>3.2){FX.remove(g);explode(wp,hit);return false;}});
  }
  function explode(p,onRock){
    sound('boom');flash(p,0xffe0b0,onRock?900:500,1.4);flash(p,0xff5a20,onRock?1500:800,2.2);
    if(!onRock)return;
    rock.visible=false;rockDead=true;
    // the pieces: shards of the rock flung out, tumbling, cooling as they go
    const mat=new THREE.MeshStandardMaterial({color:0x7a6f62,roughness:0.95,emissive:0xff5010,emissiveIntensity:1.2});
    const geo=new THREE.DodecahedronGeometry(1,0),bits=[];
    for(let i=0;i<46;i++){const m=new THREE.Mesh(geo,mat);m.scale.set(4+Math.random()*14,3+Math.random()*10,4+Math.random()*12);m.position.copy(toFX(p));m.userData.noWire=true;
      const v=new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize().multiplyScalar(60+Math.random()*220);
      m.userData.v=v;m.userData.w=new THREE.Vector3(Math.random(),Math.random(),Math.random()).multiplyScalar(2);FX.add(m);bits.push(m);}
    const t0=T;
    run((t,dt)=>{const u=t-t0;mat.emissiveIntensity=1.2*Math.exp(-u*0.8);
      for(const m of bits){m.position.addScaledVector(m.userData.v,dt);m.rotation.x+=m.userData.w.x*dt;m.rotation.y+=m.userData.w.y*dt;}
      if(u>14){for(const m of bits)FX.remove(m);mat.dispose();placeTarget();return false;}});
  }

  // ---------- incoming fire ----------
  function incoming(){
    const c=shipCentre(),q=ROOT.quaternion;
    const from=new THREE.Vector3(1,(Math.random()-0.3)*0.6,(Math.random()<0.5?-1:1)*(0.4+Math.random()*0.6)).normalize().applyQuaternion(q);
    const start=c.clone().addScaledVector(from,5000);
    // where it lands: on the shield's skin if the shields are up, on the hull (somewhere on the saucer) if not
    const aimL=new THREE.Vector3((Math.random()-0.2)*260,0,(Math.random()-0.5)*300);aimL.y=saucerTop(aimL.x,aimL.z)*(Math.random()<0.6?1:0)+(Math.random()<0.6?0:saucerBot(aimL.x,aimL.z));
    const bolt=new THREE.Group(),h=sprite(0x60ff70,70),k2=sprite(0xd8ffd0,22);bolt.add(h,k2);bolt.position.copy(toFX(start));FX.add(bolt);
    const t0=T;
    run((t,dt)=>{const u=(t-t0)/0.9;
      const aimW=shUp?(()=>{const l=SAU.localToWorld(aimL.clone()),cc=shield.getWorldPosition(V3());
        const s=l.sub(cc),loc=s.clone().applyQuaternion(G.getWorldQuaternion(new THREE.Quaternion()).invert());loc.divide(SR);const n=loc.length();
        return cc.add(s.multiplyScalar(1/n));})():SAU.localToWorld(aimL.clone());
      if(u<1){bolt.position.copy(toFX(start.clone().lerp(aimW,u)));return;}
      FX.remove(bolt);
      if(shUp){shieldHit(aimW);sound('shield');flash(aimW,0x80c8ff,180,0.6);}
      else{sound('hit');flash(aimW,0xffd090,240,1.0);flash(aimW,0xff5020,420,1.6);
        // a scorch that glows and fades where it struck
        const s=sprite(0xff6020,60);s.position.copy(SAU.worldToLocal(aimW.clone()));SAU.add(s);const t1=T;
        run(tt=>{const v=1-(tt-t1)/6;if(v<=0){SAU.remove(s);return false;}s.material.opacity=v*(0.7+0.3*Math.sin(tt*30));});}
      W.flight.shake=(W.flight.shake||0)+18;
      return false;});
  }

  // ---------- saucer separation ----------
  let sep=false,sepBusy=false;
  function separate(){
    if(sepBusy)return;sepBusy=true;sep=!sep;const from=SAU.position.clone(),to=sep?new THREE.Vector3(240,34,0):new THREE.Vector3(0,0,0),t0=T,D=sep?9:11;
    for(const g of W.impGlows)g.userData.k=1;
    run(t=>{const u=(t-t0)/D,k=ease(u);
      // up off the latches first, then ahead; coming back, ahead first and then down onto them
      const ky=sep?ease(u*2.2):ease(u*1.6-0.6),kx=sep?ease(u*1.3-0.3):ease(u*1.3);
      SAU.position.set(from.x+(to.x-from.x)*kx,from.y+(to.y-from.y)*ky,0);
      for(const g of W.impGlows)g.scale.setScalar(40*(1+1.5*Math.sin(Math.PI*Math.min(1,u))));
      if(u>=1){SAU.position.copy(to);sepBusy=false;return false;}});
  }

  // ---------- the shuttle ----------
  // A small boxy shuttle of this project's own drawing: a body with a sloped nose, two engine pods, windows.
  function shuttleMesh(){
    const g=new THREE.Group(),hull=new THREE.MeshStandardMaterial({color:0xc4c8cc,roughness:0.5,metalness:0.2,envMap:W.env}),dark=new THREE.MeshStandardMaterial({color:0x3a3f46,roughness:0.6});
    const body=new THREE.Mesh(new THREE.BoxGeometry(8.5,3,4.6),hull);g.add(body);
    const nose=new THREE.Mesh(new THREE.CylinderGeometry(0.01,2.3,2.4,4,1),hull);nose.rotation.z=-Math.PI/2;nose.rotation.x=Math.PI/4;nose.scale.set(1,1,0.7);nose.position.x=5.4;g.add(nose);
    for(const z of [-2.9,2.9]){const p=new THREE.Mesh(new THREE.BoxGeometry(7,1.2,1.1),hull);p.position.set(-0.6,-0.4,z);g.add(p);
      const gl=new THREE.Mesh(new THREE.BoxGeometry(5,0.35,0.15),new THREE.MeshBasicMaterial({color:0x6fb0ff,toneMapped:false}));gl.position.set(-0.6,-0.4,z+Math.sign(z)*0.6);g.add(gl);}
    const win=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.8,3.2),new THREE.MeshBasicMaterial({color:0xffe0a0,toneMapped:false}));win.position.set(4.3,0.6,0);g.add(win);
    const back=new THREE.Mesh(new THREE.BoxGeometry(0.3,2.2,3.6),dark);back.position.x=-4.3;g.add(back);
    const eng=sprite(0xff5a30,10);eng.position.set(-4.8,-0.4,0);g.add(eng);
    g.traverse(o=>{o.userData.noWire=true;if(o.isMesh)o.castShadow=true;});
    g.userData.info={name:'A shuttlecraft',info:'Out of the main shuttlebay at the stern.'};
    return g;
  }
  function shuttle(){
    const s=shuttleMesh(),bay=new THREE.Vector3(BAYS.main.x+12,BAYS.main.y,0);
    const qW=ROOT.getWorldQuaternion(new THREE.Quaternion()),aft=new THREE.Vector3(-1,0,0).applyQuaternion(qW),up=new THREE.Vector3(0,1,0).applyQuaternion(qW),
      side=new THREE.Vector3(0,0,Math.random()<0.5?1:-1).applyQuaternion(qW),shipV=new THREE.Vector3(1,0,0).applyQuaternion(qW).multiplyScalar(W.flight.v||0);
    const p=world(G,bay);s.position.copy(toFX(p));FX.add(s);
    W.bayGlow.material.opacity=0.9;
    let vel=aft.clone().multiplyScalar(6);const t0=T,dir=aft.clone(),X1=new THREE.Vector3(1,0,0);
    run((t,dt)=>{const u=t-t0;
      const want=u<6?aft:aft.clone().multiplyScalar(0.3).addScaledVector(side,0.8).addScaledVector(up,0.35).normalize();
      dir.lerp(want,Math.min(1,dt*0.6)).normalize();
      const sp=Math.min(110,4+u*u*1.6);vel.copy(dir).multiplyScalar(sp).add(shipV);
      s.position.addScaledVector(dirFX(vel),dt);
      s.quaternion.setFromUnitVectors(X1,dirFX(dir).normalize());
      W.bayGlow.material.opacity=0.35+0.55*Math.max(0,1-u/5);
      if(u>60){FX.remove(s);return false;}});
  }

  W.fire=k=>{if(k==='phasers')phasers();else torpedo();};
  // the events panel
  const panel=document.createElement('div');panel.id='pitpanel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Events');
  const list=[['Warp',()=>W.flight.on?(W.flight.warp?dropOut():engage(5)):engage(5)],['Red alert',redAlert],['Shields',shields],['Phasers',phasers],['Torpedo',torpedo],
    ['Incoming fire',incoming],['Separate the saucer',separate],['Launch a shuttle',shuttle]];
  {const h=document.createElement('div');h.className='sub';h.textContent='Events';panel.appendChild(h);}
  for(const [lab,fn] of list){const b=document.createElement('button');b.type='button';b.textContent=lab;b.onclick=()=>{ac();fn();sync();};panel.appendChild(b);}
  document.body.appendChild(panel);
  const sync=()=>{for(const b of panel.querySelectorAll('button')){const t=b.textContent;
    b.setAttribute('aria-pressed',String(t==='Red alert'?red:t==='Shields'?shUp:t==='Separate the saucer'?sep:false));}};
  const hud=()=>[red?'RED ALERT':'',shUp?'shields up':'',sep?'saucer separated':''].filter(Boolean).join(' · ');
  const act={warp:list[0][1],red:redAlert,shields,phasers,torpedo,incoming,separate,shuttle};
  return {panel,hud,act,sync,state:()=>({red,shUp,sep,rockDead})};
}
