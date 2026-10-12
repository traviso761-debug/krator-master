// ---------- what happens in Water 7 ----------
// Every minute or two something happens, and the Events button fires any of them now (src/core/happenings.js).
//
//   aqualaguna  Aqua Laguna, as the story tells it: the bells on the sea wall, the lock gates shut, and the sea
//               drawing back until the bed shows (the farther it goes, the bigger the waves); then the waves out of
//               the south-west, three of them, each bigger than the last, the third over the old wall and into Back
//               Street; and the Rocketman, the runaway prototype, out of Blue Station along the line into them
//   launch      a launch at Dock One: the wedges out, the galleon down the ways into the basin in a burst of spray,
//               the lock gates open, two King Bulls tow her out into the moat and to sea; the shipwrights' confetti
//   puffingtom  the Puffing Tom leaves Blue Station: the whistle and the steam, out along its rails on the sea
//   race        a yagara bull race up the ramp canal, from the quay to Up Town, the bulls swimming uphill
//   burst       the Thousand Sunny's Coup de Burst: the cannon in her stern, and she flies a kilometre off Scrap Island
//   seaking     a Sea King rises beside the sea train's line, arches over the water, and goes down again
//   merry       the Going Merry's farewell: at dusk she is taken out beyond the wall and burned, and it snows
//   rocketman   the Rocketman breaks out of its brick warehouse by Blue Station - the prototype that cannot stop - and
//               goes out along the sea train's line flat out, the Franky Family's houseboat harpooned on behind
//   pirates     a pirate crew that will not pay comes to Dock One's gate, and Galley-La's foremen throw the ship back
//               out to sea
//   arrival     the Puffing Tom comes in from St. Poplar: the whistle out on the sea, the platform crowded to meet it
// Aqua Laguna's season comes first: the wind and the sky going grey, the rain, the fog (weather(), on the engine's
// own light, which it sets fresh each frame).
import { createHappenings } from '../core/happenings.js';

export function events(api){
  const {THREE,C,scene,OSM,camera,animHooks}=api;const K=C.water7Events||{};const R=Math.random;
  let H=null;const run=fn=>H.run(fn),notice=(...a)=>H.notice(...a);
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;q.userData.noWire=true;if(q.isMesh)q.castShadow=true;});return o;};
  const W7=OSM.water7||{},BS=W7.backstreet||[196,238],DAM=W7.damR||1480,deg=Math.PI/180;
  const M=c=>new THREE.MeshLambertMaterial({color:c});
  const seaY=(x,z)=>api.SEA?api.SEA.y(x,z):0.7;
  const LM=model=>(api.LANDMARKS||[]).find(g=>g.userData&&g.userData.info&&g.userData.info.model===model);
  const ST=(C.landmarks||[]).find(l=>l.model==='station'),[stx,stz]=ST?api.P(ST.at):[1290,0];
  // spray: soft white points thrown up and falling back
  const mist=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const k=c.getContext('2d'),g=k.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,0.95)');g.addColorStop(0.5,'rgba(240,250,255,0.4)');g.addColorStop(1,'rgba(240,250,255,0)');k.fillStyle=g;k.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  function sprayCloud(n,size,colour=0xffffff){const pos=new Float32Array(n*3).fill(-1e4),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const pts=tag(new THREE.Points(geo,new THREE.PointsMaterial({map:mist,size,color:colour,sizeAttenuation:true,transparent:true,depthWrite:false,opacity:0.85})));pts.frustumCulled=false;scene.add(pts);
    const P=[];for(let i=0;i<n;i++)P.push({t:99,x:0,y:0,z:0,vx:0,vy:0,vz:0});let k=0;
    return {pts,burst(x,y,z,m,sp,up){for(let j=0;j<m;j++){const p=P[k++%n];p.t=0;p.x=x;p.y=y;p.z=z;const a=R()*6.28,v=R()*sp;p.vx=Math.cos(a)*v;p.vz=Math.sin(a)*v;p.vy=up*(0.5+R()*0.7);}},
      step(dt,g=9.8,life=4){for(let i=0;i<n;i++){const p=P[i];if(p.t<life){p.t+=dt;p.vy-=g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;pos[i*3]=p.x;pos[i*3+1]=p.y;pos[i*3+2]=p.z;}else pos[i*3+1]=-1e4;}geo.attributes.position.needsUpdate=true;},
      remove(){scene.remove(pts);}};}
  // a yagara bull and its boat (for the race and the tows): body, head, frill, fins; a rider in the boat
  function yagara(col,scale=1,boat=true){const g=new THREE.Group(),b=M(col);
    const add=(geo,m,x,y,z)=>{const me=new THREE.Mesh(geo,m);me.position.set(x,y,z);g.add(me);return me;};
    add(new THREE.SphereGeometry(1,12,10).scale(2.2,1.1,1),b,3.2,0.6,0);add(new THREE.SphereGeometry(0.8,12,10).scale(1.1,1,0.9),b,5.4,1.4,0);
    for(const s of [-1,1])add(new THREE.SphereGeometry(0.25,8,6),M(0xf4f4f4),6.1,1.8,s*0.45);add(new THREE.ConeGeometry(0.6,1.2,8),M(0xe0a040),4.8,2.4,0);
    add(new THREE.BoxGeometry(1.2,0.1,2.4),b,2.6,0.4,0);
    if(boat){add(new THREE.BoxGeometry(4.4,0.8,1.8),M(0xc8803a),-2.2,0.3,0);add(new THREE.BoxGeometry(0.4,0.7,0.5),M(0x2a4a8a),-3,1.4,0);add(new THREE.SphereGeometry(0.2,8,6),M(0xe0b090),-3,1.95,0);}
    g.scale.setScalar(scale);return tag(g);}

  // ================================================================ the Rocketman, its warehouse, the storm
  function buildRocketman(){const rk=new THREE.Group(),iron=M(0x8a8e92),a=(geo,m,x,y,z,rz=0)=>{const me=new THREE.Mesh(geo,m);me.position.set(x,y,z);me.rotation.z=rz;rk.add(me);};
    a(new THREE.CylinderGeometry(1.9,1.9,9,16).rotateZ(Math.PI/2),iron,1,4.4,0);a(new THREE.ConeGeometry(1.9,4.5,16).rotateZ(-Math.PI/2),M(0x6a7a8a),7.7,4.4,0);
    for(const s2 of [-1,1])a(new THREE.SphereGeometry(0.3,8,6),M(0x111111),8.2,5.3,s2*1.0);a(new THREE.BoxGeometry(1.4,0.3,2.6),M(0xf4f4f4),8.4,3.6,0);   // the eyes, the teeth
    a(new THREE.BoxGeometry(0.4,2.2,0.2),M(0x6a7a8a),2,6.9,0,0.3);a(new THREE.BoxGeometry(4,4.4,4.4),iron,-5.4,5,0);a(new THREE.CylinderGeometry(0.6,0.8,2.6,10),M(0x2a2a2a),4,7.2,0);
    a(new THREE.BoxGeometry(14,3.4,3.8),M(0x7a7e82),-15,4,0);a(new THREE.BoxGeometry(24,0.9,3.6),M(0x1e1e22),-6,1.8,0);return tag(rk);}
  function buildHouseboat(){const hb=new THREE.Group(),a=(geo,c,x,y,z)=>{const me=new THREE.Mesh(geo,M(c));me.position.set(x,y,z);hb.add(me);};
    a(new THREE.BoxGeometry(26,3,11),0x6a4a30,0,0,0);a(new THREE.BoxGeometry(16,6,9),0xc84a3a,-2,4.5,0);a(new THREE.BoxGeometry(17,0.6,10),0x3a6aa8,-2,7.8,0);a(new THREE.BoxGeometry(6,4,7),0xe8c040,8,3.5,0);return tag(hb);}
  // the Rocketman's warehouse: brick, derelict, its doors to the line just north of Blue Station
  const WH={x:stx+6,z:stz-48};const whDoors=(()=>{const g=new THREE.Group(),b=M(0x8a4a32);const a=(geo,m,x,y,z)=>{const me=new THREE.Mesh(geo,m);me.position.set(x,y,z);me.castShadow=true;g.add(me);return me;};
    a(new THREE.BoxGeometry(34,11,14),b,-17,5.5+3,0);a(new THREE.BoxGeometry(35,0.6,15),M(0x5a3a2a),-17,11.3+3,0);for(let k=0;k<5;k++)a(new THREE.BoxGeometry(2,1.6,0.2),M(0x1a1a1c),-30+k*6,10+0.0,7.05);
    const doors=a(new THREE.BoxGeometry(0.5,8,11),M(0x5a3a24),0.3,4+3,0);g.position.set(WH.x,0,WH.z);g.traverse(q=>{q.userData.noFingerprint=true;q.userData.info={name:'The Brick Warehouse',info:'Where the Rocketman was put away: the sea train that came before the Puffing Tom, and cannot stop.'};});
    scene.add(g);(api.LANDMARKS||[]).push(g);return doors;})();
  // run the Rocketman: out of the warehouse, onto the line, flat out along the rails on the sea; the houseboat behind
  function rocketRun(withBoat,onDone){const rk=buildRocketman();scene.add(rk);const hb=withBoat?buildHouseboat():null;if(hb)scene.add(hb);
    const line=withBoat?tag(new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,1,4).translate(0,0.5,0).rotateX(Math.PI/2),M(0x2a2a2a))):null;if(line)scene.add(line);
    const SPR=sprayCloud(300,10),SMK=sprayCloud(200,16,0xb8b8b8);let s=0,v=4,acc=0,bs=-60;whDoors.visible=false;
    const at=u=>{const z=u<90?WH.z+(stz-12-WH.z)*Math.min(1,u/90):stz-12,x=WH.x+u,y=u<240?2.9:Math.max(seaY(x,z),seaY(x+8,z))+1.7;return [x,y,z];};
    const fn=(now,dt)=>{v=Math.min(62,v+dt*7);s+=v*dt;const [x,y,z]=at(s),[x2,y2]=at(s+8);rk.position.set(x,y-1.0,z);rk.rotation.set(0,0,Math.atan2(y2-y,8));
      acc+=dt;if(acc>0.06){acc=0;SMK.burst(x+4,y+8,z,2,2,6);if(s>240)SPR.burst(x+6,seaY(x+6,z)+0.5,z+(R()-0.5)*6,4,6,7);}
      if(hb){bs=s-70;const [hx,,hz]=at(Math.max(0,bs));const hy=bs<240?2.6:seaY(hx,hz)+0.4;hb.position.set(hx,hy,hz);hb.rotation.set(0,0,Math.sin(now/300)*0.06);
        line.position.set(hx+13,hy+3,hz);line.lookAt(x-6,y+1,z);line.scale.set(1,1,Math.hypot(x-6-hx-13,y-hy-2));}
      SPR.step(dt);SMK.step(dt,-1,5);
      if(s>2700){scene.remove(rk);if(hb)scene.remove(hb,line);SPR.remove();SMK.remove();whDoors.visible=true;onDone&&onDone();return false;}return true;};
    fn.rk=rk;return fn;}
  // the storm: the light and the sky going grey, fog, rain round the camera; k from 0 to 1 (and back)
  const stormRain=sprayCloud(2400,0.9,0xd0d8e0);const ST0={sun:null,hemi:null,fog:null,set:[0,0,0]};let stormK=0;
  animHooks.push((now)=>{const k=stormK;const sun=api.sun,hemi=api.hemi,fog=scene.fog,sky=api.sky;if(!sun||!fog)return;
    if(sun.intensity!==ST0.set[0])ST0.sun=sun.intensity;if(hemi&&hemi.intensity!==ST0.set[1])ST0.hemi=hemi.intensity;if(fog.density!==ST0.set[2])ST0.fog=fog.density;
    sun.intensity=ST0.sun*(1-0.75*k);if(hemi)hemi.intensity=ST0.hemi*(1-0.35*k);fog.density=ST0.fog*(1+5*k);ST0.set=[sun.intensity,hemi?hemi.intensity:0,fog.density];
    if(k>0.01&&sky&&sky.material&&sky.material.uniforms){const u=sky.material.uniforms,grey=new THREE.Color(0x6a7480);for(const key of ['top','hor'])if(u[key]&&u[key].value&&u[key].value.lerp)u[key].value.lerp(grey,k*0.7);fog.color.lerp(grey,k*0.6);}
    if(k>0.05){for(let j=0;j<Math.floor(60*k);j++)stormRain.burst(camera.position.x+(R()-0.5)*220,camera.position.y+50+R()*20,camera.position.z+(R()-0.5)*220,1,0.5,-22);}stormRain.step(0.016,9.8,3.5);});

  // ================================================================ Aqua Laguna
  function aqualaguna(){const SEA=api.SEA;if(!SEA)return;if(api.setHour)api.setHour(10.5);const am=(BS[0]+BS[1])/2*deg;SEA.surgeDir=[-Math.cos(am),-Math.sin(am)];
    for(const B of api.BELLS||[])B.swing=1;for(const L of api.LOCKS||[])L.target=0;
    let rocket=null;
    const SPR=sprayCloud(500,26);let t=0,sprAcc=0;const W=[{at:30,h:14,w:70},{at:44,h:22,w:80},{at:58,h:32,w:95}];SEA.surges=[];
    notice('Aqua Laguna','the bells on the sea wall, the lock gates shut, and the sea goes out until the bed shows: the farther it goes, the bigger the waves. Then they come, three of them, out of the south-west, the last over the old wall into Back Street. And out of Blue Station, along the line and into them, the Rocketman.',
      ()=>{const x=Math.cos(am)*820,z=Math.sin(am)*820;return [x,120,z,Math.cos(am)*2600,0,Math.sin(am)*2600];});
    run((now,dt)=>{t+=dt;
      // the season first: the wind and the grey and the rain coming on, clearing as it ends
      stormK=t<20?t/20:t<84?1:Math.max(0,1-(t-84)/12);
      // the draw-back: nine metres over twenty seconds, held, and given back as the first wave comes
      SEA.draw=t<6?0:t<26?-9*(t-6)/20:t<32?-9:t<40?-9*(1-(t-32)/8):0;
      SEA.surges=W.filter(w=>t>w.at-26&&t<w.at+40).map(w=>({f:(t-(w.at-26))*62,h:w.h*Math.min(1,(t-(w.at-26))/6),w:w.w}));
      // where a wave meets the wall, spray: along the wall's south-western arc
      sprAcc+=dt;if(sprAcc>0.05){sprAcc=0;for(let k=0;k<4;k++){const a=am+(R()-0.5)*1.4,x=Math.cos(a)*(DAM+16),z=Math.sin(a)*(DAM+16),lv=seaY(x,z)-0.7;if(lv>6)SPR.burst(x,Math.min(lv,40),z,3,10,Math.min(30,8+lv));}}
      SPR.step(dt);
      // the Rocketman at the second wave: out of its warehouse, along the line, into the waves, the houseboat behind
      if(t>40&&!rocket){rocket=rocketRun(true);}if(rocket&&rocket(now,dt)===false)rocket=()=>true;
      if(t>96){SEA.draw=0;SEA.surges=[];stormK=0;for(const L of api.LOCKS||[])L.target=0;SPR.remove();return false;}return true;});}

  // ================================================================ the Rocketman, on its own
  function rocketman(){const go=rocketRun(true);let t=0;
    notice('The Rocketman','the doors of the brick warehouse by Blue Station burst open and out comes the Rocketman - the sea train before the Puffing Tom, the one that cannot stop - along the line flat out, the Franky Family\u2019s houseboat harpooned on behind.',
      ()=>[WH.x+30,22,WH.z+70,WH.x+10,5,WH.z],()=>[go.rk.position.x,go.rk.position.y+4,go.rk.position.z]);
    run((now,dt)=>{t+=dt;return go(now,dt);});}

  // ================================================================ Galley-La throws a pirate ship out
  function pirates(){const a=(W7.docks||[[270]])[0][0]*deg,ca=Math.cos(a),sa=Math.sin(a);const g=new THREE.Group();
    {const L=34,B=9,sh=new THREE.Shape();sh.moveTo(-L/2,-B/2);sh.lineTo(L*0.25,-B/2);sh.quadraticCurveTo(L*0.45,-B*0.35,L/2,0);sh.quadraticCurveTo(L*0.45,B*0.35,L*0.25,B/2);sh.lineTo(-L/2,B/2);sh.closePath();
      const hull=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:6,bevelEnabled:false}).rotateX(-Math.PI/2).translate(0,-3,0),M(0x2a2420));g.add(hull);
      const fc=document.createElement('canvas');fc.width=128;fc.height=128;const k=fc.getContext('2d');k.fillStyle='#141414';k.fillRect(0,0,128,128);k.fillStyle='#f4f0e6';k.beginPath();k.arc(64,52,22,0,7);k.fill();k.fillStyle='#141414';k.fillRect(52,46,9,9);k.fillRect(68,46,9,9);k.strokeStyle='#f4f0e6';k.lineWidth=9;k.beginPath();k.moveTo(28,84);k.lineTo(100,112);k.moveTo(100,84);k.lineTo(28,112);k.stroke();
      const sailM=new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(fc),side:THREE.DoubleSide});for(const [x,h] of [[-4,24],[7,28]]){const m=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.5,h,8),M(0x2a1a10));m.position.set(x,3+h/2,0);g.add(m);
        const sl=new THREE.Mesh(new THREE.PlaneGeometry(11,h*0.5),sailM);sl.position.set(x+0.4,3+h*0.6,0);sl.rotation.y=Math.PI/2;g.add(sl);}}
    tag(g);scene.add(g);const SPR=sprayCloud(400,18);const lines=[0,1].map(()=>{const l=tag(new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,1,4).translate(0,0.5,0).rotateX(Math.PI/2),M(0xc8a868)));l.visible=false;scene.add(l);return l;});
    const gate=new THREE.Vector3(ca*(DAM+40),0,sa*(DAM+40));let t=0,splashed=false;
    notice('Pirates at Dock One','a pirate crew that will not pay for their repairs, at Dock One\u2019s gate. Galley-La\u2019s foremen go out to them - Paulie\u2019s ropes - and throw the ship back out to sea.',
      ()=>[gate.x-sa*330+ca*520,110,gate.z+ca*330+sa*520,gate.x+ca*260,20,gate.z+sa*260]);
    run((now,dt)=>{t+=dt;let r,y=0,roll=0,pitch=0;
      if(t<20){r=DAM+760-(720)*Math.min(1,t/20);}                          // in from the sea to the gate
      else if(t<28){r=DAM+40;}                                              // at the gate; the ropes go out to her
      else if(t<36){const f=(t-28)/8;r=DAM+40+f*420;y=Math.sin(Math.PI*f)*120;roll=f*Math.PI*2;pitch=Math.sin(f*Math.PI)*0.5;}   // and she is thrown
      else r=DAM+460+(t-36)*6;
      const x=ca*r,z=sa*r;g.position.set(x,(y||0)+(t<28||t>36?seaY(x,z)-0.5:0),z);g.rotation.set(roll,-a+Math.PI,pitch,'YXZ');
      for(const [i,l] of lines.entries()){const on=t>21&&t<31;l.visible=on;if(on){const tw=new THREE.Vector3(ca*(DAM-6)-sa*(i?72:-72),30,sa*(DAM-6)+ca*(i?72:-72));l.position.copy(tw);l.lookAt(g.position.x,g.position.y+8,g.position.z);l.scale.set(1,1,tw.distanceTo(g.position));}}
      if(t>36&&!splashed){splashed=true;SPR.burst(x,1,z,400,16,20);}SPR.step(dt);
      if(t>70){scene.remove(g,...lines);SPR.remove();return false;}return true;});}

  // ================================================================ the Puffing Tom comes in
  function arrival(){const T=api.SEATRAIN;if(!T)return;if(T.s<600){T.s=2200;}T.state='run';T.dir=-1;T.v=18;let t=0,blown=false;
    notice('The Puffing Tom arrives','in from St. Poplar along its rails on the sea, the whistle going as it nears, the platform at Blue Station crowded to meet it.',
      ()=>[stx+70,14,stz+16,stx+900,3,stz-12]);
    run((now,dt)=>{t+=dt;if(!blown&&T.s<700){blown=true;T.whistle=4;}return t<90&&!(T.state==='wait'&&T.s<=0&&t>5);});}

  // ================================================================ a launch at Dock One
  function launch(){const S=api.DOCKSHIPS&&api.DOCKSHIPS[1];if(!S)return;const D=S.dock,sg=S.g;const a=(W7.docks||[[270]])[0][0]*deg;
    const lock=(api.LOCKS||[]).reduce((b,L)=>!b||Math.abs(Math.sin((L.a-a)/2))<Math.abs(Math.sin((b.a-a)/2))?L:b,null);
    // the dock's frame: +x out to sea along the dock's axis
    const toWorld=(lx,ly,lz)=>new THREE.Vector3(lx,ly,lz).applyMatrix4(D.matrixWorld);
    const bulls=[yagara(0x3a8a9a,4,false),yagara(0x3a8a9a,4,false)];for(const b of bulls){b.visible=false;scene.add(b);}
    const lines=bulls.map(()=>{const l=tag(new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,1,4).translate(0,0.5,0).rotateX(Math.PI/2),M(0x2a2a2a)));l.visible=false;scene.add(l);return l;});
    const SPR=sprayCloud(400,18),CONF=sprayCloud(300,3.5,0xffd0a0);let t=0,splashed=false,cAcc=0;
    const slide=S.SL*0.45+40;   // how far down the ways to the water
    notice('A launch at Dock One','a new galleon from the Galley-La yards: the wedges knocked out, down the ways and into the basin in a wall of spray; the lock gates open, and two King Bulls take her out through the wall to the sea. The shipwrights on the slips throw their caps.',
      ()=>{const p=toWorld(S.kx+60,40,S.W/2+70),q=toWorld(S.kx+40,6,0);return [p.x,p.y,p.z,q.x,q.y,q.z];},()=>{const q=sg.localToWorld(new THREE.Vector3(S.kx,S.ky,0));return [q.x,q.y,q.z];});
    run((now,dt)=>{t+=dt;
      // down the ways (accelerating), then afloat, then towed out
      let dx=0;if(t>4){const u=t-4;dx=Math.min(slide,0.9*u*u);}const afloat=dx>=slide;
      let tow=0;if(t>16)tow=Math.min(320,(t-16)*7);
      if(t>12)lock&&(lock.target=1);
      const ww=toWorld(S.kx+dx+tow,0,0),wy=seaY(ww.x,ww.z)-0.7,slopeY=-dx*Math.tan(S.pitch),floatY=wy-S.ky+1.2-S.Ds*0.45;
      sg.position.set(dx+tow,Math.max(afloat?floatY:slopeY,floatY),0);
      if(!splashed&&dx>slide*0.75){splashed=true;const p=toWorld(S.kx+dx+S.Ls*0.4,0,0);SPR.burst(p.x,1,p.z,400,14,18);}
      SPR.step(dt);
      if(t>16&&t<62){for(let i=0;i<2;i++){const b=bulls[i],p=toWorld(S.kx+dx+tow+S.Ls/2+30,0,(i?1:-1)*7);b.visible=true;b.position.set(p.x,seaY(p.x,p.z)-0.2,p.z);b.rotation.y=-a;
        const st=toWorld(S.kx+dx+tow+S.Ls/2,0,(i?1:-1)*3);lines[i].visible=true;lines[i].position.set(st.x,seaY(st.x,st.z)+1.5,st.z);lines[i].lookAt(b.position.x,b.position.y+2,b.position.z);lines[i].scale.set(1,1,st.distanceTo(b.position));}}
      // the shipwrights' caps and confetti over the quays
      cAcc+=dt;if(t>8&&t<30&&cAcc>0.08){cAcc=0;for(const s of [-1,1]){const p=toWorld(S.kx+(R()-0.5)*60,0,s*(S.W/2+10));CONF.burst(p.x,6,p.z,4,3,12);}}CONF.step(dt,3,6);
      if(t>66){sg.position.set(0,0,0);for(const b of bulls)scene.remove(b);for(const l of lines)scene.remove(l);if(lock)lock.target=0;SPR.remove();CONF.remove();return false;}return true;});}

  // ================================================================ the Puffing Tom leaves
  function puffingtom(){const T=api.SEATRAIN;if(!T)return;if(T.state==='wait'&&T.s<=0)T.wait=4;T.whistle=4;
    notice('The Puffing Tom','the whistle and a burst of steam, and the sea train leaves Blue Station for St. Poplar: its paddles turning, along rails laid just under the sea and swaying with it.',
      ()=>[stx+60,22,stz+60,stx+260,4,stz-12],()=>[stx+80+T.s,4,stz-12]);
    let t=0;run((now,dt)=>{t+=dt;return t<70;});}

  // ================================================================ a yagara race up the ramp canal
  function race(){const c=(W7.canals||[]).find(q=>q.kind==='ramp');if(!c)return;const P=c.p.slice().reverse();   // from the quay up
    const L=[0];for(let i=1;i<P.length;i++)L.push(L[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const LEN=L[L.length-1];
    const at=s=>{let i=0;while(i<L.length-2&&L[i+1]<s)i++;const k=(s-L[i])/Math.max(1e-6,L[i+1]-L[i]),a=P[i],b=P[i+1];return [a[0]+(b[0]-a[0])*k,a[2]+(b[2]-a[2])*k,a[1]+(b[1]-a[1])*k,Math.atan2(b[1]-a[1],b[0]-a[0])];};
    const COLS=[0x5ab8c0,0xe0a040,0xc8503a,0x6a8ac8,0x8ac860,0xd070b0],RC=COLS.map((c2,i)=>({g:yagara(c2,1),s:0,v:5+R()*2,lane:(i-2.5)*2.1}));for(const r of RC)scene.add(r.g);
    const SPR=sprayCloud(200,3);let t=0,acc=0;
    notice('A yagara race','six bulls and their boats from the quay up the ramp canal to Up Town: the yagaras swim uphill, the canal falling the whole way against them.',
      ()=>{const [x,y,z]=at(LEN*0.12);const a=Math.atan2(z,x);return [x+Math.cos(a+1.0)*70,y+28,z+Math.sin(a+1.0)*70,x,y,z];},()=>{const lead=RC.reduce((b,r)=>r.s>b.s?r:b,RC[0]);const [x,y,z]=at(lead.s);return [x,y,z];});
    run((now,dt)=>{t+=dt;acc+=dt;
      for(const r of RC){if(t>3)r.s=Math.min(LEN,r.s+(r.v+Math.sin(t*0.7+r.lane)*1.4)*dt*(0.9+0.2*Math.sin(t*0.31+r.lane*2)));const [x,y,z,h]=at(r.s);
        r.g.position.set(x-Math.sin(h)*r.lane,y+0.3+Math.abs(Math.sin(t*4+r.lane))*0.15,z+Math.cos(h)*r.lane);r.g.rotation.y=-h;if(acc>0.15&&t>3)SPR.burst(r.g.position.x,r.g.position.y+0.5,r.g.position.z,2,1.5,3);}
      if(acc>0.15)acc=0;SPR.step(dt,6,1.4);
      if(t>LEN/5.2+20||RC.every(r=>r.s>=LEN)&&t>30){for(const r of RC)scene.remove(r.g);SPR.remove();return false;}return true;});}

  // ================================================================ the Sunny's Coup de Burst
  function burst(){const G=LM('sunny');if(!G)return;const p0=G.position.clone(),r0=G.rotation.y,dir=new THREE.Vector3(Math.cos(-r0),0,Math.sin(-r0));
    const SMK=sprayCloud(300,22,0xd8d8d8),SPR=sprayCloud(400,18);let t=0,fired=false,landed=false;const FLY=1000,TF=9;
    notice('Coup de Burst','three barrels of cola into the Thousand Sunny’s stern cannon, and the whole ship is thrown a kilometre through the air off Scrap Island, out to sea.',
      ()=>[p0.x-dir.x*120+dir.z*260,90,p0.z-dir.z*120-dir.x*260,p0.x+dir.x*500,30,p0.z+dir.z*500],()=>[G.position.x,G.position.y,G.position.z]);
    run((now,dt)=>{t+=dt;const f=t<4?0:Math.min(1,(t-4)/TF);
      if(t>3.6&&!fired){fired=true;SMK.burst(p0.x-dir.x*20,8,p0.z-dir.z*20,300,10,6);}
      const x=p0.x+dir.x*FLY*f,z=p0.z+dir.z*FLY*f,arc=Math.sin(Math.PI*f)*260;G.position.set(x,(f<1?arc:0)+(f>=1?seaY(x,z)-0.7:0),z);G.rotation.z=f>0&&f<1?-0.25*Math.cos(Math.PI*f):0;
      if(f>=1&&!landed){landed=true;SPR.burst(x,1,z,400,18,22);}
      SMK.step(dt,-0.6,6);SPR.step(dt);
      if(t>48){G.position.copy(p0);G.rotation.z=0;SMK.remove();SPR.remove();return false;}return true;});}

  // ================================================================ a Sea King
  function seaking(){const u0=900+R()*900,x0=stx+u0,z0=stz-12-60-R()*80,N=18,seg=[],skin=new THREE.MeshPhongMaterial({color:0x7a4a9a,shininess:30}),belly=M(0xe8a050);
    for(let i=0;i<N;i++){const r=6.5*(1-i/N*0.7),m=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),skin);const fin=new THREE.Mesh(new THREE.ConeGeometry(r*0.5,r*1.6,4),belly);fin.position.y=r*0.9;m.add(fin);tag(m);scene.add(m);seg.push({m,r});}
    const head=seg[0].m;for(const s of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(1.2,10,8),M(0xf0e040));e.position.set(5.2,2.6,s*3);head.add(e);}
    const jaw=new THREE.Mesh(new THREE.BoxGeometry(8,2,7),belly);jaw.position.set(6,-2,0);head.add(jaw);
    const SPR=sprayCloud(400,20);let t=0,splash=0;
    notice('A Sea King','out of the sea beside the sea train’s line: a serpent the length of a street, arching over the water. The train’s sound drives them off, and it goes down again.',
      ()=>[x0-160,60,z0+220,x0,20,z0]);
    run((now,dt)=>{t+=dt;const rise=t<6?t/6:t<20?1:Math.max(0,1-(t-20)/7);
      for(let i=0;i<N;i++){const s=i/N,ang=Math.PI*(s*1.4-0.2+t*0.05),x=x0+(s-0.5)*170+t*3,y=seaY(x,z0)-10+rise*(Math.sin(ang)*48+8)-i*0.4,z=z0+Math.sin(s*5+t*0.6)*14;seg[i].m.position.set(x,y,z);}
      head.lookAt(seg[0].m.position.x+(seg[0].m.position.x-seg[1].m.position.x),seg[0].m.position.y+(seg[0].m.position.y-seg[1].m.position.y),seg[0].m.position.z);head.rotateY(-Math.PI/2);jaw.rotation.z=-0.2-0.3*Math.abs(Math.sin(t*2));
      splash+=dt;if(splash>0.1){splash=0;for(const k of [0,N-1]){const p=seg[k].m.position,sy=seaY(p.x,p.z);if(Math.abs(p.y-sy)<seg[k].r)SPR.burst(p.x,sy,p.z,6,8,12);}}SPR.step(dt);
      if(t>30){for(const s of seg)scene.remove(s.m);SPR.remove();return false;}return true;});}

  // ================================================================ the Going Merry's farewell
  function merry(){const G=LM('merry');if(!G)return;const p0=G.position.clone(),r0=G.rotation.y,a=(W7.docks||[[270]])[0][0]*deg,ca=Math.cos(a),sa=Math.sin(a);
    const lock=(api.LOCKS||[]).reduce((b,L)=>!b||Math.abs(Math.sin((L.a-a)/2))<Math.abs(Math.sin((b.a-a)/2))?L:b,null);
    const gate=new THREE.Vector3(ca*(DAM-30),0,sa*(DAM-30)),out=new THREE.Vector3(ca*(DAM+620),0,sa*(DAM+620));
    if(api.setHour)api.setHour(16.3);
    const FIRE=sprayCloud(700,16,0xff8a30),SMK=sprayCloud(300,26,0x444444),SNOW=sprayCloud(1600,2.2,0xffffff);let t=0,fAcc=0,sAcc=0;
    notice('The Going Merry','her last voyage: taken out beyond the wall at dusk, a torch put to her, and her crew watching from the boats as she burns. And out of a clear sky it begins to snow.',
      ()=>[out.x-ca*150+sa*120,26,out.z-sa*150-ca*120,out.x,6,out.z],()=>[G.position.x,G.position.y+4,G.position.z]);
    run((now,dt)=>{t+=dt;if(t>2&&lock)lock.target=1;
      // to the dock's mouth, then out through it to sea
      const k1=Math.min(1,t/14),k2=Math.max(0,Math.min(1,(t-14)/16));const p=k2>0?gate.clone().lerp(out,k2*k2*(3-2*k2)):p0.clone().lerp(gate,k1*k1*(3-2*k1));
      G.position.set(p.x,seaY(p.x,p.z)-0.7-(t>58?(t-58)*0.25:0),p.z);G.rotation.y=k1>0.2?-a:r0;   // her bow (+x) out along the dock's axis
      fAcc+=dt;if(t>32&&fAcc>0.04){fAcc=0;for(let j=0;j<5;j++)FIRE.burst(G.position.x+(R()-0.5)*22,G.position.y+3+R()*8,G.position.z+(R()-0.5)*7,2,1.5,9);SMK.burst(G.position.x,G.position.y+12,G.position.z,1,2,4);}
      FIRE.step(dt,-1.5,1.6);SMK.step(dt,-1,7);
      // the snow: round the camera, falling slowly
      sAcc+=dt;if(t>38&&sAcc>0.03){sAcc=0;for(let j=0;j<10;j++)SNOW.burst(camera.position.x+(R()-0.5)*260,camera.position.y+60,camera.position.z+(R()-0.5)*260,1,0.6,-1.5);}SNOW.step(dt,0.15,40);
      if(t>84){G.position.copy(p0);G.rotation.y=r0;if(lock)lock.target=0;FIRE.remove();SMK.remove();SNOW.remove();return false;}return true;});}

  H=createHappenings(api,{events:{aqualaguna:['Aqua Laguna',aqualaguna],launch:['A launch at Dock One',launch],puffingtom:['The Puffing Tom',puffingtom],race:['A yagara race',race],
      burst:['Coup de Burst',burst],seaking:['A Sea King',seaking],merry:['The Going Merry\'s farewell',merry],
      rocketman:['The Rocketman',rocketman],pirates:['Pirates at Dock One',pirates],arrival:['The Puffing Tom arrives',arrival]},
    order:['puffingtom','race','pirates','launch','arrival','seaking','burst','rocketman','aqualaguna','merry'],first:K.first||40000,every:K.every||[70000,120000]});
}
