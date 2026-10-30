// ---------- what happens in the Zone ----------
// Every minute or two something happens, and the Events button fires any of them now (src/core/happenings.js).
// The accident is told as it happened, without anyone shown hurt.
//   night       1:23 on 26 April 1986: the test on Reactor 4, the explosions, the firefighters (the plant's crew and
//               Pripyat's, by road from their stations, up ladders and outside stairs onto the roofs), the open core's glow and its column of
//               steam and smoke over the plant, drifting north-west as the first plume did (C.chernobylEvents.reactor: where)
//   evacuation  the afternoon of 27 April: the buses come down Lenin Avenue (`route`, a mapped road's name, from
//               `from`) and take Pripyat away in about three hours
//   arch        November 2016: the New Safe Confinement, built to the west, slides 327 m along its rails over the
//               reactor (the arch landmark itself, moved back and brought on)
//   nature      the Zone without people: Przewalski's horses grazing an old field (`horses`, where), wolves
//   duga        the Duga radar and the Russian Woodpecker
//   rbmk        inside the RBMK: unit 4 cut away (unit4.js), the reactor and how it failed, then the accident played
//               in it with a chart of its power
//   liquidators the spring and summer of 1986: Mi-8s dropping sand, clay, boron and lead into the open core, the men
//               clearing graphite off block V's roof by hand, the Red Forest dead and rust-red
//   shelter     June to November 1986: the Shelter raised round the ruin, part by part, by a crane
import { createHappenings } from '../core/happenings.js';
import { makeCrews } from './crews.js';

export function events(api){
  const {THREE,C,scene,groundH,P,ROADS,camera}=api;const K=C.chernobylEvents||{};
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
    // what is under a falling piece: unit 4's roofs, the plant's turbine hall and deaerator bays, or the ground
    const PL=(C.landmarks||[]).find(l=>l.model==='plant'),rect=([s,w,n,e],h)=>{const [x0,z1]=P([s,w]),[x1,z0]=P([n,e]);return [x0,z0,x1,z1,ry+h];};
    const ROOFS=[...(U&&U.roofs||[]),...(PL?[rect(PL.hall,PL.hallH||31),...(PL.deaerators||[]).map(r=>rect(r,PL.deaeratorH||47))]:[])];
    const floorAt=(x,z)=>{let h=ry;for(const [x0,z0,x1,z1,y] of ROOFS)if(x>x0&&x<x1&&z>z0&&z<z1&&y>h)h=y;return h;};
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
      shake.amp=Math.max(shake.amp,1.2*power);if(api.ctx.sound)api.ctx.sound.boom(power,rx,rz);flashEl.style.transition='none';flashEl.style.opacity=String(Math.min(0.9,0.55*power));requestAnimationFrame(()=>{flashEl.style.transition='opacity 0.9s ease-out';flashEl.style.opacity='0';});
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
        c.live=true;c.down=false;c.p.set(rx+(R()-0.5)*20,top,rz+(R()-0.5)*20);c.v.set(Math.cos(a)*out,20+R()*50*power,Math.sin(a)*out);c.w.set(R()*6-3,R()*6-3,R()*6-3);c.s.set(0.6+R()*3,0.4+R()*1.2,0.6+R()*4);}}
    const CAP=captions([[0,8,'Night, 25 to 26 April 1986. Reactor 4 is being run at low power for a test: could the turbine, coasting down, keep the cooling pumps going until the diesels started?'],
      [8,12,'At 1:23:40 the operators pressed AZ-5, the button to shut the reactor down. The control rods going in first raised its power.'],
      [12,16,'1:23:44. Power surges to a hundred times its rating in seconds; the fuel shatters, the channels burst, and the steam lifts the reactor\'s 2,000-tonne lid.'],
      [16,26,'Two or three seconds later a second explosion tears the reactor hall apart, throwing burning graphite and fuel across the roofs and the ground.'],
      [26,40,'Within minutes the firemen were there: Lieutenant Volodymyr Pravik\'s watch from the plant\'s own station, then Lieutenant Viktor Kibenok\'s from Pripyat. Major Leonid Telyatnikov came in from leave to command them.'],
      [40,54,'They went up the ladders and the outside stairs onto the turbine hall\'s roof, 30 m up, where the bitumen burned, and onto block V\'s by the stack, to keep the fire from reaching unit 3.'],
      [54,68,'Witnesses described a glow of pale blue over the open core: the air itself, ionised. Graphite from the core lay all round the men on the roofs; no one had told them what it was.'],
      [68,82,'By about 5 in the morning the fires on the roofs were out. The graphite inside the reactor burned on for ten days, carrying radioactive smoke up and across Europe.'],
      [82,100,'Pravik, Kibenok and four of their men died of radiation sickness in Moscow within weeks. Telyatnikov lived, and died in 2004. Helicopters later dropped some 5,000 tonnes of sand, boron, clay and lead on the core.']]);
    notice('26 April 1986, 1:23','the night of the accident at Reactor 4.',()=>[rx-520,ry+190,rz+640,rx,ry+70,rz],()=>[rx,ry,rz]);
    let b1=false,b2=false;
    // ---- the firefighters ----
    const CR=makeCrews(api,{tag}),S=U&&U.spots;let crews=null;
    function firemen(){const [sx,,sz]=ll(K.fireStation||[51.39355,30.10661]),[px,,pz]=ll(K.pripyatFire||[51.40051,30.05157]),F=U.firePts(),q=new THREE.Vector3();
      const gy=(x,z)=>groundH(x,z);
      // an engine: by road from its station to its spot, `dur` seconds from `start`; a trimmed path starts `trim` m short
      const V=[],spray=[],men=[];
      const engine=(from,to,ladder,start,dur,trim)=>{const e=CR.fireEngine(ladder);g.add(e.g);const p=CR.path(CR.route(from,[to[0],to[2]]));const s0=trim?Math.max(0,p.LEN-trim):0;
        const v={e,p,s0,start,dur,to,parked:false};V.push(v);return v;};
      const lad=engine([sx,sz],S.hallSouth[0],true,16.5,13),t1=engine([sx,sz],S.hallSouth[1],false,17.3,13),t2=engine([sx,sz],S.hallSouth[3],false,18,13.5);
      const p1=engine([px,pz],S.vFoot,false,24,12,1600),p2=engine([px,pz],S.hallSouth[2],false,25,12,1800);
      const edge=S.hallEdge(0.15);
      // the men: a line of points each walks along from `start`, at `speed`, then sprays at `aim`
      const man=(pts,start,aim,hoseFrom)=>{const m={g:CR.person(0x6a6450,0xb8a040),pts,start,aim,cum:[0],done:false,hose:CR.hose(3),hoseFrom};
        for(let i=1;i<pts.length;i++)m.cum.push(m.cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1],pts[i][2]-pts[i-1][2]));g.add(m.g,m.hose);m.g.visible=false;m.hose.visible=false;men.push(m);};
      const nearF=(x,z,k)=>F.slice(0,F.length-1).map(f=>[Math.hypot(f[0]-x,f[2]-z),f]).sort((a,b)=>a[0]-b[0])[k][1];
      const stand=(f,from,d)=>{const dx=from[0]-f[0],dz=from[2]-f[2],l=Math.hypot(dx,dz)||1;return [f[0]+dx/l*d,f[1]+0.3,f[2]+dz/l*d];};
      for(let i=0;i<4;i++){const f=nearF(edge[0],edge[2],i),base=[edge[0]+(i-1.5)*1.2,gy(edge[0],edge[2]+9),edge[2]+9.5];
        man([base,[edge[0],ry+1,edge[2]+8.5],[edge[0],edge[1]+0.2,edge[2]],stand(f,edge,6+i)],36+i*1.6,f,lad);}
      const vf=S.vFoot,ve=S.vEdge,fv=F[F.length-1];
      for(let i=0;i<3;i++)man([[vf[0]+2+i,gy(vf[0],vf[2]),vf[2]+(i-1)*1.5],[ve[0]+2,gy(vf[0],vf[2]),ve[2]],[ve[0]+2,ve[1]+0.2,ve[2]],[ve[0]-1,ve[1]+0.2,ve[2]],stand(fv,ve,5+i*1.5)],38+i*1.4,fv,p1);
      {const f=nearF(S.hallSouth[2][0],S.hallSouth[2][2],5);man([[p2.to[0],gy(p2.to[0],p2.to[2]),p2.to[2]],[p2.to[0],ry+1,p2.to[2]-8],[p2.to[0],ry+31.2,p2.to[2]-9],stand(f,[p2.to[0],0,p2.to[2]],7)],41,f,p2);}
      // the water: drops on arcs from each nozzle
      const NW=900,wPos=new Float32Array(NW*3),wGeo=new THREE.BufferGeometry();wGeo.setAttribute('position',new THREE.BufferAttribute(wPos,3));
      const water=tag(new THREE.Points(wGeo,new THREE.PointsMaterial({color:0xc8dcff,size:0.5,transparent:true,opacity:0.7,depthWrite:false})));water.frustumCulled=false;g.add(water);
      const W=[];for(let i=0;i<NW;i++){W.push({life:0,p:new THREE.Vector3(),v:new THREE.Vector3()});wPos[i*3+1]=-1e4;}let wi=0;
      crews={step(now,dt){
        for(const v of V){const k=Math.max(0,Math.min(1,(t-v.start)/v.dur));v.e.g.visible=t>=v.start;v.e.beacon.material.opacity=Math.sin(now*0.025)>0?1:0.15;
          if(t<v.start)continue;const ease=k<1?k*k*(3-2*k):1,[x,z,hd]=v.p.at(v.s0+(v.p.LEN-v.s0)*ease);v.e.g.position.set(x,groundH(x,z),z);v.e.g.rotation.y=hd;v.parked=k>=1;}
        // the ladder up to the roof's edge once the truck stands
        if(lad.parked){const k=Math.min(1,(t-lad.start-lad.dur)/4),piv=lad.e.ladder;piv.getWorldPosition(q);
          const dx=edge[0]-q.x,dy=edge[1]+0.6-q.y,dz=edge[2]-q.z,hz=Math.hypot(dx,dz);piv.rotation.order='YXZ';piv.rotation.y=Math.atan2(dx,dz)-lad.e.g.rotation.y;
          piv.rotation.x=-Math.atan2(dy,hz)*k;lad.e.ext.scale.z=8+(Math.hypot(dx,dy,dz)-8)*k;}
        for(const m of men){const d=(t-m.start)*4;m.g.visible=d>=0;m.hose.visible=d>=0;if(d<0)continue;let i=1;while(i<m.cum.length-1&&m.cum[i]<d)i++;
          const L=m.cum[m.cum.length-1],u=Math.min(1,(Math.min(d,L)-m.cum[i-1])/Math.max(1e-6,m.cum[i]-m.cum[i-1])),a=m.pts[i-1],b=m.pts[i];
          m.g.position.set(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u);m.done=d>=L;
          const tx=m.done?m.aim[0]:b[0],tz=m.done?m.aim[2]:b[2];if(Math.hypot(tx-m.g.position.x,tz-m.g.position.z)>0.3)m.g.rotation.y=Math.atan2(tx-m.g.position.x,tz-m.g.position.z);
          m.g.userData.walk(now*0.012,m.done?0:1);
          const eg=m.hoseFrom.e.g.position;m.hose.userData.set([[eg.x,eg.y+1.5,eg.z],[m.pts[m.pts.length-2][0],m.pts[m.pts.length-2][1]+0.2,m.pts[m.pts.length-2][2]],[m.g.position.x,m.g.position.y+1,m.g.position.z]]);
          // spraying while the fires burn
          if(m.done&&fireK>0.02)for(let n=0;n<3;n++){const w=W[wi];wi=(wi+1)%NW;const p=m.g.position,dx=m.aim[0]-p.x,dz=m.aim[2]-p.z,l=Math.hypot(dx,dz)||1,sp=Math.sqrt(9.8*l/0.9)*0.75;
            w.life=1.4;w.p.set(p.x+dx/l*0.8,p.y+1.2,p.z+dz/l*0.8);w.v.set(dx/l*sp+(R()-0.5)*1.2,sp*0.55+(R()-0.5)*1.2,dz/l*sp+(R()-0.5)*1.2);}}
        for(let i=0;i<NW;i++){const w=W[i];if(w.life<=0){wPos[i*3+1]=-1e4;continue;}w.life-=dt;w.v.y-=9.8*dt;w.p.addScaledVector(w.v,dt);wPos[i*3]=w.p.x;wPos[i*3+1]=w.p.y;wPos[i*3+2]=w.p.z;}
        wGeo.attributes.position.needsUpdate=true;
        // the roof fires going out as the water reaches them
        fireK=t<44?1:Math.max(0,1-(t-44)/32);U.fires(fireK);}};
      notice('The firefighters','the plant\'s crew and Pripyat\'s, on the turbine hall\'s roof and block V\'s.',()=>[edge[0]-150,edge[1]+90,edge[2]+190,edge[0]+30,edge[1],edge[2]-10],()=>[edge[0],edge[1],edge[2]]);}
    let fireK=1;
    const step=(now,dt)=>{t+=dt;CAP(t);
      // the surge: the ground starts to shake, a light flickers through the hall's windows
      if(api.ctx.sound)api.ctx.sound.rumble(t>9.5&&t<12?(t-9.5)*0.3:t>=12&&t<20?0.5*(1-(t-12)/8):0);
      if(t>9.5&&t<12){shake.amp=Math.max(shake.amp,(t-9.5)*0.25);light.color.setHex(0xffc890);light.intensity=(t-9.5)*0.4*(0.5+R());}
      if(!b1&&t>12){b1=true;if(U&&!blown){U.set('explosion');blown=true;}blast(1,0xffffff);
        lid.visible=true;L.on=true;L.p.set(rx,top-25,rz);L.v.set(-3,42,5);lid.position.copy(L.p);lid.rotation.set(0,0,0);}
      if(!b2&&t>14.6){b2=true;blast(1.6,0xff8a30);}
      if(U&&S&&!crews&&t>16)firemen();
      const on=t>12?Math.min(1,(t-12)/3)*(t>92?Math.max(0,1-(t-92)/8):1):0;
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
        if(!e.landed){e.v.y-=9.8*dt;e.v.multiplyScalar(Math.exp(-dt*0.08));e.p.addScaledVector(e.v,dt);const fl=floorAt(e.p.x,e.p.z);if(e.v.y<0&&e.p.y<=fl+0.5){e.p.y=fl+0.5;e.landed=true;}}
        e.heat=Math.max(0,e.heat-dt*(e.landed?0.03:0.06));
        const fl=e.heat*(0.7+0.3*Math.sin(now*0.02+i));ePos[i*3]=e.p.x;ePos[i*3+1]=e.p.y;ePos[i*3+2]=e.p.z;eCol[i*3]=fl;eCol[i*3+1]=fl*(e.landed?0.35:0.6);eCol[i*3+2]=fl*0.15;}
      eGeo.attributes.position.needsUpdate=true;eGeo.attributes.color.needsUpdate=true;
      let cm=false;for(let i=0;i<NC;i++){const c=CH[i];if(!c.live)continue;cm=true;
        if(!c.down){c.v.y-=9.8*dt;c.p.addScaledVector(c.v,dt);c.r.x+=c.w.x*dt;c.r.y+=c.w.y*dt;c.r.z+=c.w.z*dt;const fl=floorAt(c.p.x,c.p.z);if(c.v.y<0&&c.p.y<=fl+0.3){c.p.y=fl+0.3;c.down=true;}}
        dummy.position.copy(c.p);dummy.rotation.copy(c.r);dummy.scale.copy(c.s);dummy.updateMatrix();chunks.setMatrixAt(i,dummy.matrix);}
      if(cm)chunks.instanceMatrix.needsUpdate=true;chunkM.emissive.setRGB(0.3*on,0.09*on,0);
      // the lid: up on its edge, turning, and back down into the shaft, where the ruin's own lid takes over
      if(L.on){L.v.y-=9.8*dt;L.p.addScaledVector(L.v,dt);lid.position.copy(L.p);lid.rotation.z+=dt*0.55;lid.rotation.x+=dt*0.12;if(L.v.y<0&&L.p.y<top-30){L.on=false;lid.visible=false;shake.amp=Math.max(shake.amp,0.5);}}
      if(crews)crews.step(now,dt);
      if(t>100){scene.remove(g);if(U)U.set('today');if(A)A.visible=true;hideCap();setH(11);shake.amp=0;flashEl.style.opacity='0';return false;}return true;};
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
    const CAP=captions([[0,12,'Unit 4 was an RBMK-1000: a water-cooled, graphite-moderated channel reactor, 3,200 MW of heat for 1,000 MW of electricity. Its core is a cylinder of graphite blocks 11.8 m across and 7 m high.'],
      [12,24,'Through the graphite run 1,661 pressure tubes, each holding a fuel assembly of uranium dioxide enriched to about 2%. Water comes up through them from below and boils as it rises: blue here is water, white steam.'],
      [24,36,'The steam and water go up to four drum separators, 30 m long. The steam drives two turbines, and eight main circulation pumps, six working and two in reserve, send the water back down.'],
      [36,48,'Over the core lies the upper biological shield, a steel lid 17 m across and 2,000 tonnes that the builders called Elena. On it is the floor of the reactor hall.'],
      [48,60,'211 control rods of boron carbide. Under each hung a graphite displacer, so that a rod drawn right out, starting back in, first pushed water out of the bottom of its channel: there, it added reactivity.'],
      [60,72,'And the RBMK had a positive void coefficient: as water turned to steam, which absorbs fewer neutrons, power rose, and more water boiled. At low power, with almost every rod drawn out, it was unstable.'],
      [72,80,'1:23:04 on 26 April. Unit 4 is at 200 MW, its rods nearly all out. The test begins: the turbine is let coast, the pumps it feeds slow, and more of the water boils.'],
      [80,86,'1:23:40. AZ-5: every rod starts in at once, at 0.4 m a second. Their displacers push the water out of the bottoms of the channels.'],
      [86,92,'Power runs away: past full power in two seconds, a hundred times it in three. The fuel shatters, the channels burst, and the steam lifts Elena off the reactor and turns it on its edge.'],
      [92,104,'A second explosion, two or three seconds later, threw out graphite and fuel and opened the core to the sky. The rods had gone in about 2 m.'],
      [104,118,'The other RBMKs were changed after 1986: more enriched fuel, more rods kept in, faster shutdown rods, displacers that no longer leave water under them. Some still run in Russia.']]);
    notice('Inside the RBMK','unit 4 cut away: the reactor and how it failed.',()=>U.view('cutaway'),()=>U.centre());
    // the chart of the reactor's power through the accident, drawn as it happens
    const cv=document.createElement('canvas');cv.width=300;cv.height=150;cv.style.cssText='position:fixed;right:16px;top:70px;width:300px;height:150px;background:rgba(18,18,14,.84);border-left:3px solid #d8b030;z-index:11;pointer-events:none;display:none;max-width:calc(100vw - 32px)';
    document.body.appendChild(cv);const cg=cv.getContext('2d'),pts=[];
    const lg=p=>Math.log10(Math.max(p,0.01)),py=p=>138-(lg(p)+2)/4*118;   // 0.01 to 100 times full power, on a log scale
    function chart(clock,p){pts.push([clock,p]);cg.clearRect(0,0,300,150);cg.font='11px Georgia, serif';cg.fillStyle='#bdb8a8';
      for(const [v,l] of [[0.0625,'200 MW'],[1,'3,200 MW (full)'],[30,'about 100,000 MW']]){const y=py(v);cg.strokeStyle='rgba(200,190,160,.25)';cg.beginPath();cg.moveTo(40,y);cg.lineTo(296,y);cg.stroke();cg.fillText(l,44,y-3);}
      cg.fillText('1:23:00',36,148);cg.fillText('1:23:48',250,148);cg.fillStyle='#eeeadc';cg.fillText('Reactor power',8,14);
      cg.strokeStyle='#ff8a3a';cg.lineWidth=2;cg.beginPath();pts.forEach(([c,v],i)=>{const x=40+c/48*250;i?cg.lineTo(x,py(v)):cg.moveTo(x,py(v));});cg.stroke();}
    // the night in event time: 72 to 80 the coast-down (1:23:04 to 1:23:40), 80 to 92 the eight seconds after AZ-5
    const night=t=>{if(t<80){const k=(t-72)/8;return {clock:4+k*36,rods:0,power:0.0625*(1+0.5*k),boil:0.25+0.3*k};}
      const s=Math.min(8,(t-80)*8/12),az=Math.min(1,s/4);
      return {clock:40+s,rods:Math.min(2.2,s*0.55),power:s<2?0.09*(1+s*1.5):s<4.2?0.36*Math.pow(10,(s-2)*1.12):Math.max(5,300*Math.exp(-(s-4.2)*0.6)),boil:Math.min(1,0.55+az*0.45+(s>3.5?0.2:0))};};
    let lifted=false;
    const step=(now,dt)=>{t+=dt;CAP(t);
      if(t<48)U.reactor({rods:3,power:1,boil:0.45});
      else if(t<60){const k=(t-48)/12;U.reactor({rods:3*(1-Math.min(1,k*1.6))+(k>0.75?(k-0.75)*4:0),power:1,boil:0.45});}   // the rods drawn out and a first move back in
      else if(t<72){const k=(t-60)/12;U.reactor({rods:0,power:0.3+0.9*k,boil:0.3+0.5*k});}                              // more steam, more power
      else if(t<104){const n=night(Math.min(t,92));cv.style.display='block';if(t<=92)chart(n.clock,n.power);
        const s=(Math.min(t,92)-80)*8/12,lid=s>4.6?Math.min(1,(s-4.6)/1.4):0;
        U.reactor({rods:n.rods,power:n.power,boil:n.boil,lid:lid*9,tilt:lid*1.35});
        if(lid>0&&!lifted){lifted=true;shake.amp=1.4;flashEl.style.transition='none';flashEl.style.opacity='0.6';requestAnimationFrame(()=>{flashEl.style.transition='opacity 1.2s ease-out';flashEl.style.opacity='0';});if(api.ctx.sound)api.ctx.sound.boom(1.2);}}
      if(t>104)U.reactor({rods:2.2,power:0.05,boil:1,lid:9,tilt:1.35});
      if(t>120){U.set('today');hideCap();cv.remove();return false;}return true;};
    const ff=/(^|[#&])evt=([0-9.]+)/.exec(location.hash);if(ff){const end=+ff[2],t0=performance.now();while(t<end)step(t0+t*1000,0.05);}
    run(step);}

  // ---- the liquidators, spring and summer 1986 ----
  function liquidators(){const U=api.ctx.unit4;if(!U||!U.spots)return;U.set('explosion');U.fires(0,0.5);setH(13);let t=0;const Z=api.ctx.zone;if(Z)Z.red(1);
    const [rx,ry,rz]=ll(K.reactor||[51.38955,30.09909]),g=tag(new THREE.Group());scene.add(g);const CR=makeCrews(api,{tag}),S=U.spots;
    const CAP=captions([[0,14,'From 27 April to 10 May 1986, helicopters flew over the open reactor and dropped some 5,000 tonnes of sand, clay, dolomite, boron carbide and lead into it, to smother the burning graphite and soak up its heat.'],
      [14,28,'Each crew made its run at about 200 m and let its load go over the core, a few seconds in its heat and its radiation, more than 1,800 flights in all.'],
      [28,44,'In September the worst of the graphite and fuel still lay on the roofs round the ruin. The robots sent up failed in the radiation; the work fell to some 3,800 soldiers and reservists in lead aprons.'],
      [44,58,'On block V\'s roof by the stack each was allowed between 40 seconds and two minutes: out of the door, a shovel of graphite over the edge into the ruin, and back. They were called the bio-robots.'],
      [58,72,'The pines west of the plant took so much radiation that summer that they died and turned red: the Red Forest, felled and buried in trenches in 1987. Some 600,000 people worked as liquidators.']]);
    notice('The liquidators','helicopters over the core, and the men clearing block V\'s roof.',()=>[rx-520,ry+260,rz+420,rx+60,ry+90,rz],()=>[rx,ry,rz]);
    // the helicopters: each round a circle 700 m across that passes over the core, dropping its load as it does
    const H3=[0,1,2].map(i=>{const h=CR.heli();g.add(h.g);return Object.assign(h,{ph:i/3,lap:-1});}),bags=[],clouds=[];
    // the core still smoking
    const smoke=[];for(let i=0;i<40;i++){const s=puff(0x8a8680,40,0,false);g.add(s);smoke.push({s,u:R(),dx:R()-0.5,dz:R()-0.5});}
    // the men: from block V's door (its east side) to the west edge, a shovel over it, back
    const vr=S.vRoof,ve=S.vEdge,wx=vr[0]-(ve[0]-vr[0])+3,men=[],blocks=[];
    for(let i=0;i<6;i++){const m=CR.person(0x6a6c62,0x5a6648);g.add(m);men.push({m,ph:i/6,z:vr[2]+(i-2.5)*2.2,thrown:-1});}
    const step=(now,dt)=>{t+=dt;CAP(t);
      let near=0;
      for(const h of H3){const u=t/26+h.ph,a=u*Math.PI*2,R0=350,x=rx+R0-Math.cos(a)*R0,z=rz+Math.sin(a)*R0*0.8;h.g.position.set(x,ry+170+60*(1-Math.cos(a)),z);
        h.g.rotation.set(0,Math.atan2(Math.sin(a),Math.cos(a)*0.8),-0.12);h.spin(dt);near=Math.max(near,Math.min(1,250/Math.max(60,camera.position.distanceTo(h.g.position))));
        const lap=Math.floor(u);if(Math.cos(a)>0.995&&lap!==h.lap){h.lap=lap;for(let k=0;k<6;k++){const b=tag(new THREE.Mesh(new THREE.BoxGeometry(1.2,0.8,1.2),new THREE.MeshLambertMaterial({color:k%2?0xc8b890:0x8a8a84})));
          b.position.set(x+(R()-0.5)*3,h.g.position.y-3-k*1.5,z+(R()-0.5)*3);g.add(b);bags.push({b,v:new THREE.Vector3(Math.sin(a)*8,0,Math.cos(a)*6)});}}}
      if(api.ctx.sound)api.ctx.sound.heli(near*0.6);
      for(let i=bags.length-1;i>=0;i--){const q=bags[i];q.v.y-=9.8*dt;q.b.position.addScaledVector(q.v,dt);
        if(q.b.position.y<ry+28){g.remove(q.b);bags.splice(i,1);const c=puff(0xd8d0c0,20,0.8,false);c.position.set(q.b.position.x,ry+34,q.b.position.z);g.add(c);clouds.push({c,age:0});}}
      for(let i=clouds.length-1;i>=0;i--){const q=clouds[i];q.age+=dt;const k=q.age/6;if(k>=1){g.remove(q.c);clouds.splice(i,1);continue;}q.c.position.y+=dt*6;q.c.scale.setScalar(20+k*70);q.c.material.opacity=0.8*(1-k);}
      for(const p of smoke){const k=(t*0.04+p.u)%1;p.s.position.set(rx+p.dx*(10+k*120)-k*160,ry+40+k*500,rz+p.dz*(10+k*120)-k*120);p.s.scale.setScalar(30+k*200);p.s.material.opacity=0.45*Math.pow(1-k,1.5);}
      // the roof work from 28 s: each man's round 12 s, staggered
      for(const q of men){const on=t>28&&t<66;q.m.visible=on;if(!on)continue;const r=((t-28)/12+q.ph)%1,lap=Math.floor((t-28)/12+q.ph);
        const run=r<0.4?r/0.4:r<0.55?1:r<0.95?1-(r-0.55)/0.4:0,x=ve[0]-2+(wx-ve[0]+2)*run;
        q.m.position.set(x,vr[1]+0.2,q.z);q.m.rotation.y=r<0.4?-Math.PI/2:Math.PI/2;q.m.userData.walk(now*0.02,r<0.4||(r>0.55&&r<0.95)?1:0);
        if(r>0.4&&r<0.55&&lap!==q.thrown){q.thrown=lap;const b=tag(new THREE.Mesh(new THREE.BoxGeometry(0.5,0.4,0.7),new THREE.MeshLambertMaterial({color:0x2a2a2e})));
          b.position.set(x-1,vr[1]+1.4,q.z);g.add(b);blocks.push({b,v:new THREE.Vector3(-6,4,0)});}}
      for(let i=blocks.length-1;i>=0;i--){const q=blocks[i];q.v.y-=9.8*dt;q.b.position.addScaledVector(q.v,dt);q.b.rotation.z+=dt*4;if(q.b.position.y<ry+20){g.remove(q.b);blocks.splice(i,1);}}
      if(t>74){scene.remove(g);U.set('today');if(Z)Z.red(0);hideCap();if(api.ctx.sound)api.ctx.sound.heli(0);return false;}return true;};
    const ff=/(^|[#&])evt=([0-9.]+)/.exec(location.hash);if(ff){const end=+ff[2],t0=performance.now();while(t<end)step(t0+t*1000,0.05);}
    run(step);}

  // ---- the Shelter goes up, June to November 1986 ----
  function shelterUp(){const U=api.ctx.unit4;if(!U||!U.shelterParts)return;U.set('building');U.fires(0,0.3);setH(12);let t=0;
    const SP=U.shelterParts,A=U.shelterAt,g=tag(new THREE.Group());scene.add(g);
    for(const p in SP)U.show(SP[p],false);
    // the crane: a crawler crane on the west side, its boom over the ruin, its hook down to what it is setting
    const CM=new THREE.MeshLambertMaterial({color:0xd8b030}),DK=new THREE.MeshLambertMaterial({color:0x3a3a36});
    const base=new THREE.Mesh(new THREE.BoxGeometry(14,6,18),CM);base.position.set(A.crane[0],A.crane[1]+3,A.crane[2]);g.add(base);
    for(const s of [-1,1]){const tr=new THREE.Mesh(new THREE.BoxGeometry(3,2,22),DK);tr.position.set(A.crane[0]+s*7,A.crane[1]+1,A.crane[2]);g.add(tr);}
    const bA=new THREE.Vector3(A.crane[0]+5,A.crane[1]+6,A.crane[2]),bB=new THREE.Vector3(...A.tip),len=bA.distanceTo(bB);
    const boom=new THREE.Mesh(new THREE.BoxGeometry(2.2,2.2,len).translate(0,0,len/2),CM);boom.position.copy(bA);boom.lookAt(bB);g.add(boom);
    const hookG=new THREE.BufferGeometry().setFromPoints([bB.clone(),bB.clone()]),hook=new THREE.Line(hookG,new THREE.LineBasicMaterial({color:0x222222}));hook.frustumCulled=false;g.add(hook);tag(g);
    const CAP=captions([[0,14,'The Shelter was built from June to November 1986, in 206 days: some 400,000 m³ of concrete and 7,300 tonnes of steel round what was left of unit 4.'],
      [14,28,'Little of it could be welded or bolted by hand. Its pieces were made elsewhere and set by cranes worked from behind shielding, the drivers guided by television and periscopes.'],
      [28,42,'First the walls: the cascade wall stepped down the north side over the rubble, concrete poured behind steel forms, and the buttressed wall on the west.'],
      [42,56,'Then two great beams across the reactor hall, from the west wall to block V, and on them a roof of 27 steel pipes 1.2 m across, with panels sloping down the south side.'],
      [56,70,'It was finished on 30 November 1986 and meant to last 20 or 30 years. Its pieces only rested on each other and on the ruin, and it was never sealed. The arch slid over it in 2016.']]);
    notice('The Shelter goes up','June to November 1986.',()=>U.view('shelter'),()=>U.centre());
    const PH=[['cascade',4,26,'grow'],['buttress',22,36,'grow'],['beams',38,46,'lower'],['roof',46,58,'lower']];
    const step=(now,dt)=>{t+=dt;CAP(t);let hookTo=null;
      for(const [p,a,b,how] of PH){const o=SP[p];if(t<a){U.show(o,false);continue;}U.show(o,true);const k=Math.min(1,(t-a)/(b-a)),e=k*k*(3-2*k);
        if(how==='grow'){o.scale.y=Math.max(0.01,e);o.position.y=A.crane[1];}else{o.scale.y=1;o.position.y=A.crane[1]+40*(1-e);if(k<1)hookTo=[A.tip[0],A.tip[1]-30-40*(1-e)+40,A.tip[2]];}}
      const pa=hookG.attributes.position;pa.setXYZ(1,A.tip[0],hookTo?hookTo[1]:A.tip[1]-30,A.tip[2]);pa.needsUpdate=true;
      if(t>60&&U.state()!=='shelter'){U.set('shelter');U.fires(0,0);}
      if(t>72){scene.remove(g);U.set('today');hideCap();return false;}return true;};
    const ff=/(^|[#&])evt=([0-9.]+)/.exec(location.hash);if(ff){const end=+ff[2],t0=performance.now();while(t<end)step(t0+t*1000,0.05);}
    run(step);}

  H=createHappenings(api,{events:{night:['26 April 1986',night],evacuation:['The evacuation',evacuation],arch:['The arch slides into place',slide],nature:['The Zone without people',nature],duga:['Duga',duga],rbmk:['Inside the RBMK',rbmk],liquidators:['The liquidators',liquidators],shelter:['The Shelter goes up',shelterUp]},
    order:['nature','evacuation','liquidators','shelter','arch','duga','rbmk','night'],first:K.first||40000,every:K.every||[80000,140000],
    colours:{bg:'rgba(18,18,14,.86)',fg:'#eeeadc',edge:'#d8b030',btn:'rgba(40,38,26,.9)',btnEdge:'#d8b030'}});
}
