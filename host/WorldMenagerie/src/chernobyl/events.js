// ---------- what happens in the Zone ----------
// Every minute or two something happens, and the Events button fires any of them now (src/core/happenings.js).
// The accident is told as it happened, without anyone shown hurt.
//   night       1:23 on 26 April 1986: the test on Reactor 4, the explosions, the open core's glow and its column of
//               steam and smoke over the plant, drifting north-west as the first plume did (C.chernobylEvents.reactor: where)
//   evacuation  the afternoon of 27 April: the buses come down Lenin Avenue (`route`, a mapped road's name, from
//               `from`) and take Pripyat away in about three hours
//   arch        November 2016: the New Safe Confinement, built to the west, slides 327 m along its rails over the
//               reactor (the arch landmark itself, moved back and brought on)
//   nature      the Zone without people: Przewalski's horses grazing an old field (`horses`, where), wolves
//   duga        the Duga radar and the Russian Woodpecker
//   rbmk        inside the RBMK: unit 4 cut away (unit4.js), the reactor and how it failed
import { createHappenings } from '../core/happenings.js';

export function events(api){
  const {THREE,C,scene,groundH,P,ROADS}=api;const K=C.chernobylEvents||{};
  const R=Math.random;
  // each running event's clock in the details (events.t), for tools/probe.py
  let H=null;const run=fn=>{let T=0;H.run((now,dt)=>{T+=dt;api.ctx.details.events={t:+T.toFixed(1)};return fn(now,dt);});},notice=(...a)=>H.notice(...a);
  const setH=h=>{const f=api.setHour||window.setHour;if(f)f(h);};
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;q.userData.noWire=true;});return o;};
  const soft=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.35,'rgba(255,255,255,0.5)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const puff=(col,s,op,add)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:soft,color:col,transparent:true,opacity:op,depthWrite:false,fog:!add,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));sp.scale.setScalar(s);return tag(sp);};
  const cap=document.createElement('div');
  cap.style.cssText='position:fixed;left:50%;bottom:70px;transform:translateX(-50%);max-width:min(660px,calc(100vw - 32px));padding:9px 14px;background:rgba(18,18,14,.84);color:#eeeadc;font:14px/1.45 Georgia,serif;border-left:3px solid #d8b030;display:none;z-index:11;pointer-events:none';
  document.body.appendChild(cap);
  const captions=list=>{let shown='';return t=>{let c='';for(const [a,b,text] of list)if(t>=a&&t<b)c=text;if(c!==shown){shown=c;cap.textContent=c;cap.style.display=c?'block':'none';}};};
  const hideCap=()=>{cap.style.display='none';};
  const ll=(a,dy=0)=>{const [x,z]=P(a);return [x,groundH(x,z)+dy,z];};
  const arch=()=>api.LANDMARKS&&api.LANDMARKS.find(g=>g.userData.info&&g.userData.info.model==='arch')||(()=>{let f=null;scene.traverse(o=>{if(!f&&o.isGroup&&o.userData.info&&o.userData.info.model==='arch')f=o;});return f;})();

  // ---- the night of 26 April 1986 ----
  // the camera's shake, by amplitude (decays by itself): an offset on the orbit's target, taken off again next frame
  const shake={amp:0,off:new THREE.Vector3()};
  if(api.ctx.pushCam)api.ctx.pushCam((now,ctl)=>{ctl.target.sub(shake.off);if(shake.amp>0.01){shake.off.set(R()-0.5,(R()-0.5)*0.7,R()-0.5).multiplyScalar(shake.amp*ctl.dist*0.012);ctl.target.add(shake.off);shake.amp*=0.93;}else shake.off.set(0,0,0);});
  // a white flash over the whole screen
  const flashEl=document.createElement('div');flashEl.style.cssText='position:fixed;inset:0;background:#fff6e0;opacity:0;pointer-events:none;z-index:10';document.body.appendChild(flashEl);
  function night(){const [rx,ry,rz]=ll(K.reactor||[51.38955,30.09909]),g=tag(new THREE.Group());scene.add(g);setH(1.3);let t=0;
    // the arch is not there yet: hidden for the night, and back after
    // unit 4 whole until the explosion, the ruin after it (unit4.js); without it, the arch is just hidden
    const U=api.ctx.unit4,A=U?null:arch();if(U)U.set('before');if(A)A.visible=false;let blown=false;
    const top=ry+60;   // the reactor hall's roof, about
    const glow=puff(0xa8c8ff,260,0,true);glow.position.set(rx,ry+70,rz);g.add(glow);
    const fire=puff(0xff7a30,110,0,true);fire.position.set(rx,ry+40,rz);g.add(fire);
    // the blue column of ionised air over the open core
    const beamM=new THREE.MeshBasicMaterial({color:0x7aa8ff,vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});
    const bg=new THREE.CylinderGeometry(30,14,420,24,8,true).translate(0,210,0),bp=bg.attributes.position,bc=new Float32Array(bp.count*3);
    for(let i=0;i<bp.count;i++){const k=Math.pow(1-bp.getY(i)/420,1.8);bc[i*3]=bc[i*3+1]=bc[i*3+2]=k;}bg.setAttribute('color',new THREE.BufferAttribute(bc,3));
    const beam=tag(new THREE.Mesh(bg,beamM));beam.position.set(rx,ry+30,rz);g.add(beam);
    const plume=[];for(let i=0;i<160;i++){const s=puff(i%4?0x3a3a3e:0x6a6a70,40,0,false);g.add(s);plume.push({s,u:R(),sp:0.6+R()*0.8,dx:R()-0.5,dz:R()-0.5});}
    // the light the explosions and the fires throw on the plant and the town
    const light=new THREE.PointLight(0xffa060,0,2600,1);light.position.set(rx,top+20,rz);g.add(light);
    const flash=puff(0xfff0d0,10,0,true);flash.position.set(rx,top,rz);g.add(flash);
    // each blast: a fireball of puffs, a shock ring along the ground, a ring of dust, debris
    const balls=[],rings=[],dust=[],bits=[];
    const ringM=()=>new THREE.MeshBasicMaterial({color:0xffd8a0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});
    // embers: burning graphite and fuel, points under gravity that stay glowing where they land
    const NE=520,ePos=new Float32Array(NE*3),eCol=new Float32Array(NE*3),eGeo=new THREE.BufferGeometry();
    eGeo.setAttribute('position',new THREE.BufferAttribute(ePos,3));eGeo.setAttribute('color',new THREE.BufferAttribute(eCol,3));
    const embers=tag(new THREE.Points(eGeo,new THREE.PointsMaterial({size:3.2,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})));embers.frustumCulled=false;g.add(embers);
    const E=[];for(let i=0;i<NE;i++){E.push({live:false,p:new THREE.Vector3(rx,-1e4,rz),v:new THREE.Vector3(),heat:0,landed:false});ePos[i*3+1]=-1e4;}
    // chunks: the roof's slabs and graphite blocks, tumbling
    const NC=160,chunkM=new THREE.MeshLambertMaterial({color:0x4a4640,emissive:0x501800}),chunks=tag(new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),chunkM,NC));chunks.frustumCulled=false;g.add(chunks);
    const CH=[],dummy=new THREE.Object3D();for(let i=0;i<NC;i++){CH.push({live:false,p:new THREE.Vector3(),v:new THREE.Vector3(),r:new THREE.Euler(),w:new THREE.Vector3(),s:new THREE.Vector3(1,1,1)});dummy.position.set(0,-1e4,0);dummy.updateMatrix();chunks.setMatrixAt(i,dummy.matrix);}
    // the upper shield, "Elena": 17 m across and 2,000 tonnes, thrown up on its edge and dropped back into the shaft
    const lid=tag(new THREE.Mesh(new THREE.CylinderGeometry(8.5,8.5,3,28),new THREE.MeshLambertMaterial({color:0x8a9096,emissive:0x301008})));lid.visible=false;g.add(lid);
    const L={p:new THREE.Vector3(),v:new THREE.Vector3(),on:false};
    function blast(power,col){
      shake.amp=Math.max(shake.amp,1.2*power);flashEl.style.transition='none';flashEl.style.opacity=String(Math.min(0.9,0.55*power));requestAnimationFrame(()=>{flashEl.style.transition='opacity 0.9s ease-out';flashEl.style.opacity='0';});
      flash.userData.k=1;flash.userData.s=600*power;
      for(let i=0;i<14;i++){const b=puff(i%3?col:0xfff2c0,10,0.95,true);b.position.set(rx+(R()-0.5)*20,top-10+R()*20,rz+(R()-0.5)*20);g.add(b);
        balls.push({b,age:0,life:2.5+R()*2.5,s:(50+R()*70)*power,v:new THREE.Vector3((R()-0.5)*14,10+R()*30*power,(R()-0.5)*14)});}
      // the smoke that follows the fireball up
      for(let i=0;i<18;i++){const b=puff(0x2e2a28,20,0,false);b.position.set(rx+(R()-0.5)*30,top,rz+(R()-0.5)*30);g.add(b);
        balls.push({b,age:-0.6-R()*0.8,life:9+R()*6,s:(90+R()*90)*power,smoke:true,v:new THREE.Vector3((R()-0.5)*8-4,14+R()*16*power,(R()-0.5)*8-4)});}
      const ring=tag(new THREE.Mesh(new THREE.RingGeometry(0.96,1,96).rotateX(-Math.PI/2),ringM()));ring.position.set(rx,ry+2,rz);g.add(ring);rings.push({ring,age:0,max:520*power});
      for(let i=0;i<36;i++){const a=i/36*Math.PI*2+R()*0.1,b=puff(0x6a625a,30,0,false);g.add(b);dust.push({b,a,age:0,max:(260+R()*120)*power});}
      // debris thrown out: the north side harder, where the block failed
      let n=Math.round(260*power);for(const e of E){if(n<=0)break;if(e.live)continue;n--;const a=R()*Math.PI*2,up=15+R()*38*power,out=6+R()*34*power;
        e.live=true;e.landed=false;e.heat=1;e.p.set(rx+(R()-0.5)*14,top,rz+(R()-0.5)*14);e.v.set(Math.cos(a)*out,up,Math.sin(a)*out-(R()<0.4?18:0));}
      n=Math.round(80*power);for(const c of CH){if(n<=0)break;if(c.live)continue;n--;const a=R()*Math.PI*2,out=6+R()*30*power;
        c.live=true;c.p.set(rx+(R()-0.5)*20,top,rz+(R()-0.5)*20);c.v.set(Math.cos(a)*out,20+R()*50*power,Math.sin(a)*out);c.w.set(R()*6-3,R()*6-3,R()*6-3);c.s.set(0.6+R()*3,0.4+R()*1.2,0.6+R()*4);}}
    const CAP=captions([[0,8,'Night, 25 to 26 April 1986. Reactor 4 is being run at low power for a test: could the turbine, coasting down, keep the cooling pumps going until the diesels started?'],
      [8,12,'At 1:23:40 the operators pressed AZ-5, the button to shut the reactor down. The control rods going in first raised its power.'],
      [12,16,'1:23:44. Power surges to a hundred times its rating in seconds; the fuel shatters, the channels burst, and the steam lifts the reactor\'s 2,000-tonne lid.'],
      [16,28,'Two or three seconds later a second explosion tears the reactor hall apart, throwing burning graphite and fuel across the roofs and the ground.'],
      [28,44,'Witnesses described a glow of pale blue over the open core: the air itself, ionised. The graphite inside burned for ten days, carrying radioactive smoke up and across Europe.'],
      [44,60,'The plant\'s and Pripyat\'s firemen put out the fires on the roofs by morning. Helicopters later dropped some 5,000 tonnes of sand, boron, clay and lead on the core.']]);
    notice('26 April 1986, 1:23','the night of the accident at Reactor 4.',()=>[rx-520,ry+190,rz+640,rx,ry+70,rz],()=>[rx,ry,rz]);
    let b1=false,b2=false;
    const step=(now,dt)=>{t+=dt;CAP(t);
      // the surge: the ground starts to shake, a light flickers through the hall's windows
      if(t>9.5&&t<12){shake.amp=Math.max(shake.amp,(t-9.5)*0.25);light.color.setHex(0xffc890);light.intensity=(t-9.5)*0.4*(0.5+R());}
      if(!b1&&t>12){b1=true;if(U&&!blown){U.set('explosion');blown=true;}blast(1,0xffffff);
        lid.visible=true;L.on=true;L.p.set(rx,top-25,rz);L.v.set(-3,42,5);lid.position.copy(L.p);lid.rotation.set(0,0,0);}
      if(!b2&&t>14.6){b2=true;blast(1.6,0xff8a30);}
      const on=t>12?Math.min(1,(t-12)/3)*(t>56?Math.max(0,1-(t-56)/4):1):0;
      glow.material.opacity=on*0.8*(0.8+0.2*Math.sin(now*0.003));fire.material.opacity=on*0.9*(0.75+0.25*Math.sin(now*0.011));
      beamM.opacity=t>15?on*0.16*(0.85+0.15*Math.sin(now*0.002)):0;
      for(const p of plume){const k=(t*0.05*p.sp+p.u)%1,h=k*1200,spread=20+k*500;p.s.position.set(rx+p.dx*spread-k*700,ry+40+h,rz+p.dz*spread-k*700);p.s.scale.setScalar(40+k*420);p.s.material.opacity=on*0.6*Math.pow(1-k,1.3);}
      // the flash and the light: a burst at each blast, then the fires' flicker
      const fk=flash.userData.k||0;if(fk>0){flash.userData.k=Math.max(0,fk-dt*2.2);flash.material.opacity=fk;flash.scale.setScalar(flash.userData.s*(1.4-0.4*fk));}else flash.material.opacity=0;
      if(t>=12){light.color.setHex(0xff9050);light.intensity=fk*9+on*1.4*(0.75+0.25*Math.sin(now*0.013)+0.1*R());}
      for(let i=balls.length-1;i>=0;i--){const q=balls[i];q.age+=dt;if(q.age<0)continue;const k=q.age/q.life;
        if(k>=1){g.remove(q.b);q.b.material.dispose();balls.splice(i,1);continue;}
        q.b.position.addScaledVector(q.v,dt);q.v.multiplyScalar(Math.exp(-dt*0.6));q.b.scale.setScalar(q.s*(0.25+0.75*Math.sqrt(Math.min(1,k*4))+k*0.6));
        q.b.material.opacity=q.smoke?0.75*Math.min(1,k*5)*(1-k):Math.pow(1-k,1.6);if(!q.smoke)q.b.material.color.lerp(new THREE.Color(0xff4010),dt*0.8);}
      for(let i=rings.length-1;i>=0;i--){const q=rings[i];q.age+=dt;const k=q.age/1.2;if(k>=1){g.remove(q.ring);rings.splice(i,1);continue;}
        const r=q.max*(1-Math.pow(1-k,2.2));q.ring.scale.set(r,1,r);q.ring.material.opacity=0.45*Math.pow(1-k,2);}
      for(let i=dust.length-1;i>=0;i--){const q=dust[i];q.age+=dt;const k=q.age/6;if(k>=1){g.remove(q.b);dust.splice(i,1);continue;}
        const r=q.max*(1-Math.pow(1-Math.min(1,k*2.5),2));q.b.position.set(rx+Math.cos(q.a)*r,ry+8+k*30,rz+Math.sin(q.a)*r);q.b.scale.setScalar(30+k*110);q.b.material.opacity=0.55*Math.min(1,k*8)*(1-k);}
      // embers: gravity and a little drag; landed ones smoulder and fade over half a minute
      for(let i=0;i<NE;i++){const e=E[i];if(!e.live)continue;
        if(!e.landed){e.v.y-=9.8*dt;e.v.multiplyScalar(Math.exp(-dt*0.08));e.p.addScaledVector(e.v,dt);if(e.p.y<=ry+0.5){e.p.y=ry+0.5;e.landed=true;}}
        e.heat=Math.max(0,e.heat-dt*(e.landed?0.03:0.06));
        const fl=e.heat*(0.7+0.3*Math.sin(now*0.02+i));ePos[i*3]=e.p.x;ePos[i*3+1]=e.p.y;ePos[i*3+2]=e.p.z;eCol[i*3]=fl;eCol[i*3+1]=fl*(e.landed?0.35:0.6);eCol[i*3+2]=fl*0.15;}
      eGeo.attributes.position.needsUpdate=true;eGeo.attributes.color.needsUpdate=true;
      let cm=false;for(let i=0;i<NC;i++){const c=CH[i];if(!c.live)continue;cm=true;
        if(c.p.y>ry+0.4){c.v.y-=9.8*dt;c.p.addScaledVector(c.v,dt);c.r.x+=c.w.x*dt;c.r.y+=c.w.y*dt;c.r.z+=c.w.z*dt;}else c.p.y=ry+0.3;
        dummy.position.copy(c.p);dummy.rotation.copy(c.r);dummy.scale.copy(c.s);dummy.updateMatrix();chunks.setMatrixAt(i,dummy.matrix);}
      if(cm)chunks.instanceMatrix.needsUpdate=true;chunkM.emissive.setRGB(0.3*on,0.09*on,0);
      // the lid: up on its edge, turning, and back down into the shaft, where the ruin's own lid takes over
      if(L.on){L.v.y-=9.8*dt;L.p.addScaledVector(L.v,dt);lid.position.copy(L.p);lid.rotation.z+=dt*0.55;lid.rotation.x+=dt*0.12;if(L.v.y<0&&L.p.y<top-30){L.on=false;lid.visible=false;shake.amp=Math.max(shake.amp,0.5);}}
      if(t>60){scene.remove(g);if(U)U.set('today');if(A)A.visible=true;hideCap();setH(11);shake.amp=0;flashEl.style.opacity='0';return false;}return true;};
    // evt=<seconds> in the address (for tools/probe.py, whose frames are slow): run the event's first seconds at once
    const ff=/(^|[#&])evt=([0-9.]+)/.exec(location.hash);if(ff){const end=+ff[2],t0=performance.now();while(t<end)step(t0+t*1000,0.05);}
    run(step);}

  // ---- the evacuation, 27 April ----
  function evacuation(){const name=K.route||'Центральний проспект',ways=(ROADS||[]).filter(r=>r.name===name).map(r=>r.pts.slice());if(!ways.length)return;
    // the road's ways chained into one line, from `from`
    const [fx,fz]=P(K.from||[51.4055,30.0577]);let line=[[fx,fz]];
    while(ways.length){const [lx,lz]=line[line.length-1];let bi=-1,bd=1e9,rev=false;
      ways.forEach((w,i)=>{const a=Math.hypot(w[0][0]-lx,w[0][1]-lz),b=Math.hypot(w[w.length-1][0]-lx,w[w.length-1][1]-lz);if(a<bd){bd=a;bi=i;rev=false;}if(b<bd){bd=b;bi=i;rev=true;}});
      if(bd>80)break;const w=ways.splice(bi,1)[0];if(rev)w.reverse();line.push(...w);}
    const cum=[0];for(let i=1;i<line.length;i++)cum.push(cum[i-1]+Math.hypot(line[i][0]-line[i-1][0],line[i][1]-line[i-1][1]));const LEN=cum[cum.length-1];if(LEN<300)return;
    const at=s=>{s=Math.max(0,Math.min(LEN-0.01,s));let i=1;while(cum[i]<s)i++;const u=(s-cum[i-1])/(cum[i]-cum[i-1]),[ax,az]=line[i-1],[bx,bz]=line[i];return [ax+(bx-ax)*u,az+(bz-az)*u,Math.atan2(bx-ax,bz-az)];};
    const g=tag(new THREE.Group());scene.add(g);setH(14);let t=0;
    // the buses: Ikarus and LAZ, cream and red, yellow, blue; and the people's luggage is not shown
    const geo=new THREE.BoxGeometry(2.5,3,11).translate(0,1.9,0),roofG=new THREE.BoxGeometry(2.3,0.25,10.6).translate(0,3.5,0),winG=new THREE.BoxGeometry(2.56,0.9,9.6).translate(0,2.5,0.3);
    const cols=[0xe8dcc0,0xd8b830,0x3a6aa8,0xe8e4d8,0xc85a3a],winM=new THREE.MeshLambertMaterial({color:0x2a3038}),roofM=new THREE.MeshLambertMaterial({color:0xd8d4cc});
    const N=K.buses||40,GAP=22,bus=[];for(let i=0;i<N;i++){const b=new THREE.Group();b.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:cols[i%cols.length]})),new THREE.Mesh(winG,winM),new THREE.Mesh(roofG,roofM));tag(b);g.add(b);bus.push(b);}
    const CAP=captions([[0,16,'27 April 1986, the day after. Pripyat had gone on with its Saturday the day before: weddings, football, children in the parks. At 11 in the morning the radio told the city to be ready to leave.'],
      [16,32,'Some 1,200 buses came up from Kyiv. At 2 in the afternoon people came down from the blocks with a few things for three days, and the columns pulled out down Lenin Avenue.'],
      [32,48,'Within about three hours the city of 49,000 was empty. Nobody came back to live. Later that year the zone was set at 30 km round the plant, and some 116,000 people had left it.']]);
    const [mx,mz]=at(GAP*6);
    // the camera beside the road a little way down it, the column already passing
    notice('The evacuation','27 April 1986: the buses leave Pripyat.',()=>{const [x,z,a]=at(GAP*3);return [x+Math.cos(a)*40-Math.sin(a)*30,groundH(x,z)+22,z-Math.sin(a)*40-Math.cos(a)*30,x+Math.sin(a)*60,groundH(x,z)+2,z+Math.cos(a)*60];},()=>[mx,groundH(mx,mz),mz]);
    run((now,dt)=>{t+=dt;CAP(t);const head=GAP*10+t*9;
      bus.forEach((b,i)=>{const s=head-i*GAP;b.visible=s>0&&s<LEN-5;if(!b.visible)return;const [x,z,a]=at(s);b.position.set(x+Math.cos(a)*1.8,groundH(x,z),z-Math.sin(a)*1.8);b.rotation.y=a;});
      if(t>50){scene.remove(g);hideCap();return false;}return true;});}

  // ---- the arch slides over the reactor, November 2016 ----
  function slide(){const A=arch();if(!A)return;const home=A.position.clone(),D=K.slide||327;setH(12);let t=0;A.visible=true;
    const [vx,vy,vz]=[home.x-520,home.y+180,home.z+640];
    const CAP=captions([[0,16,'After the accident the reactor was closed in by the Shelter, the "sarcophagus": built in about seven months in 1986, much of it by remote cranes, by people who could only work minutes at a time.'],
      [16,32,'It was meant to last 30 years. The New Safe Confinement was built beside it, 327 m to the west, where the ground was cleaner: two halves raised on jacks and joined, 36,000 tonnes of steel.'],
      [32,48,'In November 2016 it was slid along its rails over the reactor, the largest movable land structure ever built: 257 m across, 108 m high, made to last a hundred years.'],
      [48,62,'Under it, cranes on its roof beams are to take the old shelter apart. In February 2025 a drone hit the arch and set its cladding smouldering for weeks; the damage is still being repaired.']]);
    notice('The arch slides into place','November 2016: the New Safe Confinement moves over Reactor 4.',()=>[vx,vy,vz,home.x-120,home.y+40,home.z],()=>[home.x,home.y,home.z]);
    run((now,dt)=>{t+=dt;CAP(t);const u=t<18?0:Math.min(1,(t-18)/24),e=u*u*(3-2*u);A.position.set(home.x-D*(1-e),home.y,home.z);A.updateMatrixWorld(true);
      if(t>64){A.position.copy(home);A.updateMatrixWorld(true);hideCap();return false;}return true;});}

  // ---- the Zone without people ----
  function nature(){const [hx,hy,hz]=ll(K.horses||[51.3475,30.1095]),g=tag(new THREE.Group());scene.add(g);setH(15.5);let t=0;
    const coat=new THREE.MeshLambertMaterial({color:0xb08a58}),dark=new THREE.MeshLambertMaterial({color:0x3a2c22}),belly=new THREE.MeshLambertMaterial({color:0xe0cca8}),grey=new THREE.MeshLambertMaterial({color:0x6e6a62});
    const horse=()=>{const h=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.6,1.5),coat);b.position.y=1.05;h.add(b);const u=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.2,1.3),belly);u.position.y=0.78;h.add(u);
      const n=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.75,0.35),coat);n.position.set(0,1.45,0.75);n.rotation.x=0.6;h.add(n);const m=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.55,0.25),dark);m.position.set(0,1.6,0.62);m.rotation.x=0.6;h.add(m);
      const hd=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.26,0.55),coat);hd.position.set(0,1.62,1.08);hd.rotation.x=0.9;h.add(hd);h.userData.head=[n,m,hd];
      for(const [x,z] of [[-0.2,0.6],[0.2,0.6],[-0.2,-0.6],[0.2,-0.6]]){const l=new THREE.Mesh(new THREE.BoxGeometry(0.13,0.8,0.13),dark);l.position.set(x,0.4,z);h.add(l);}
      const tl=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.7,0.1),dark);tl.position.set(0,0.95,-0.8);tl.rotation.x=-0.3;h.add(tl);return h;};
    const wolf=()=>{const w=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(0.32,0.38,1.0),grey);b.position.y=0.6;w.add(b);const hd=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.26,0.42),grey);hd.position.set(0,0.78,0.6);w.add(hd);
      for(const [x,z] of [[-0.1,0.35],[0.1,0.35],[-0.1,-0.35],[0.1,-0.35]]){const l=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.45,0.08),grey);l.position.set(x,0.22,z);w.add(l);}return w;};
    const herd=[];for(let i=0;i<12;i++){const h=tag(horse()),a=R()*6.28,r=4+R()*22;h.userData.p=[hx+Math.cos(a)*r,hz+Math.sin(a)*r];h.userData.a=R()*6.28;h.userData.graze=R()<0.7;g.add(h);herd.push(h);}
    const pack=[];for(let i=0;i<4;i++){const w=tag(wolf());w.userData.o=[-120-i*3+R()*2,60+i*4];g.add(w);pack.push(w);}
    const CAP=captions([[0,16,'With the people gone, the Zone has become one of the largest wild places in Europe. Elk, roe deer, boar, lynx and wolves came back.'],
      [16,32,'In 1998 some thirty Przewalski\'s horses were let go here, the last truly wild horses, once extinct in the wild. They took to the old fields and the empty villages, and there are now some two hundred.'],
      [32,48,'Radiation still matters: the dose falls unevenly, there are hot spots, and studies argue over what it does. But for the animals here, the people were worse than the radiation.']]);
    notice('The Zone without people','Przewalski\'s horses on an old kolkhoz field.',()=>[hx+40,hy+9,hz+30,hx,hy+1,hz],()=>[hx,hy,hz]);
    run((now,dt)=>{t+=dt;CAP(t);
      for(const h of herd){const [px,pz]=h.userData.p;if(!h.userData.graze){h.userData.a+=(R()-0.5)*0.02;h.userData.p=[px+Math.sin(h.userData.a)*dt*0.6,pz+Math.cos(h.userData.a)*dt*0.6];}
        h.position.set(h.userData.p[0],groundH(h.userData.p[0],h.userData.p[1]),h.userData.p[1]);h.rotation.y=h.userData.a;for(const q of h.userData.head)q.rotation.x=h.userData.graze?1.6:0.6;
        if(R()<dt*0.05)h.userData.graze=!h.userData.graze;}
      // the wolves cross the far side of the field at a trot, at a distance
      pack.forEach((w,i)=>{const s=t*2.4,x=hx+w.userData.o[0]+s,z=hz+w.userData.o[1];w.position.set(x,groundH(x,z),z);w.rotation.y=Math.PI/2;w.visible=t>18;});
      if(t>50){scene.remove(g);hideCap();setH(11);return false;}return true;});}

  // ---- the Duga ----
  function duga(){const [dx,dy,dz]=ll(K.duga||[51.30559,30.06618]);setH(9.5);let t=0;
    const CAP=captions([[0,16,'In the forest south of the plant stands Duga: an over-the-horizon radar, built in the 1970s to see American missiles launched beyond the curve of the Earth, by bouncing short waves off the ionosphere.'],
      [16,32,'The great array is some 150 m high and half a kilometre long; the smaller one beside it about 90. The transmitter was far off, near Chernihiv; these were the ears.'],
      [32,48,'It broadcast a sharp tapping, ten times a second, across the short-wave bands of the world. Radio hams called it the Russian Woodpecker. It went quiet in 1989.'],
      [48,60,'The town that ran it, Chernobyl-2, was secret: on the maps it was a children\'s summer camp.']]);
    notice('Duga, the Russian Woodpecker','the over-the-horizon radar in the forest.',()=>[dx-260,dy+40,dz+300,dx,dy+90,dz],()=>[dx,dy,dz]);
    run((now,dt)=>{t+=dt;CAP(t);if(t>62){hideCap();return false;}return true;});}

  // ---- inside the RBMK ----
  function rbmk(){const U=api.ctx.unit4;if(!U)return;U.set('cutaway');setH(11);let t=0;
    const CAP=captions([[0,14,'Unit 4 was an RBMK-1000: a water-cooled, graphite-moderated channel reactor, 3,200 MW of heat for 1,000 MW of electricity. Its core is a cylinder of graphite blocks 11.8 m across and 7 m high.'],
      [14,28,'Through the graphite run 1,661 pressure tubes, each holding a fuel assembly of uranium dioxide enriched to about 2%. The water boils as it rises through them.'],
      [28,42,'The steam and water go up to four drum separators, 30 m long. The steam drives two turbines, and eight main circulation pumps, six working and two in reserve, send the water back down.'],
      [42,56,'Over the core lies the upper biological shield, a steel lid 17 m across that the builders called Elena. On it is the floor of the reactor hall, where the refuelling machine could change fuel with the reactor running.'],
      [56,70,'211 control rods of boron carbide. Under each rod was a graphite displacer, so that a rod fully withdrawn, starting back in, first pushed water out of the bottom of its channel, and there it added reactivity.'],
      [70,84,'And the RBMK had a positive void coefficient: as water turned to steam, which absorbs fewer neutrons, power rose. At low power, with almost all its rods withdrawn, unit 4 was unstable that night.'],
      [84,98,'At 1:23:40 the AZ-5 button sent all the rods in at once. Their displacers and the boiling water sent power up many times over in seconds; the steam explosion that followed lifted the upper shield and tore the reactor open.'],
      [98,112,'The other RBMKs were changed after 1986: more enriched fuel, more rods kept in, faster shutdown rods, longer displacers. Some still run in Russia.']]);
    notice('Inside the RBMK','unit 4 cut away: the reactor and how it failed.',()=>U.view('cutaway'),()=>U.centre());
    run((now,dt)=>{t+=dt;CAP(t);if(t>114){U.set('today');hideCap();return false;}return true;});}

  H=createHappenings(api,{events:{night:['26 April 1986',night],evacuation:['The evacuation',evacuation],arch:['The arch slides into place',slide],nature:['The Zone without people',nature],duga:['Duga',duga],rbmk:['Inside the RBMK',rbmk]},
    order:['nature','evacuation','arch','duga','rbmk','night'],first:K.first||40000,every:K.every||[80000,140000],
    colours:{bg:'rgba(18,18,14,.86)',fg:'#eeeadc',edge:'#d8b030',btn:'rgba(40,38,26,.9)',btnEdge:'#d8b030'}});
}
