// ---------- Homeworld: the Kharak system, the first mission and the third ----------
// Fan work. Homeworld belongs to its makers (Relic Entertainment, and now Gearbox); nothing from the game, its
// models, its art or its sound is used, and every shape here is this project's own geometry.
//
// Two missions of the campaign, the first and the third, and a switch between them (#mission=1 or 3):
//
//   Mission 1, the Kharak System. The Mothership is out of the Scaffold for its trials, the great planet under
//     it. A Resource Collector goes out to the asteroids and back; the Research Ship stands off; the Scouts fly
//     patrol in formation until target drones come out of hyperspace, and then they go in and destroy them,
//     all but the last, which a Salvage Corvette takes in tow back to the hangar - over and over, as trials are
//   Mission 3, Return to Kharak. The Mothership comes out of hyperspace - a window of light sweeping down her
//     length - to find the Scaffold wrecked and tumbling and Kharak burning from pole to pole. Six cryo trays
//     hold what is left of the Kushan; one fails as she arrives. Taiidan fighters and corvettes are at the
//     others, the Mothership's interceptors go for them, and the Salvage Corvettes bring the trays in one by one
//
// What the Babylon 5 page taught: at this scale a fighter is a few pixels, so every small craft carries an
// engine light at a fixed size on screen, and here a trail of light behind it, which is how the game drew its
// ships too; anything that moves is left out of the model's fingerprint (noWire); fire is streaks close to and
// points far off. And Sensors: the whole battle drawn as the game's tactical map - dots on a grid, each on a
// stalk down to the plane - over the scene.
import {shipKit} from './ships.js';
import {makeKharak} from './kharak.js';
import {mkRng} from '../core/rng.js';

export function model(api){
  const {THREE,C,scene,camera,renderer,animHooks}=api;
  const K=C.fleet||{};
  const kit=shipKit(THREE),M=kit.M,rnd=mkRng(1999);
  const G=new THREE.Group();scene.add(G);
  const pick=[];
  const quiet=o=>{o.traverse(q=>{q.userData.noWire=true;});return o;};
  const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
  const lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t<=0?0:t>=1?1:t*t*(3-2*t),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  // ---------- the Mothership ----------
  const L=K.height||3000;
  const ms=kit.mothership(L);G.add(ms);const MU=ms.userData;
  ms.userData.info={name:'The Mothership',info:'Sixty years in the building, most of that in the Scaffold, the whole of the Kushan people\'s industry turned to one ship: a curved tower kilometres tall - the Banana, to the players - carrying six hundred thousand sleepers in cryo trays, with a hangar through her middle, her own shipyard and refinery, only a few small guns, and Karan S\'jet wired into her core as Fleet Command.'};pick.push(ms);
  // her own materials, so the hyperspace window can cut her without cutting every ship that shares a colour
  const cut=new THREE.Plane(V3(1,0,0),1e9);renderer.localClippingEnabled=true;
  ms.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.clippingPlanes=[cut];}});
  const BAY=ms.userData.bay.clone();

  // ---------- the Scaffold, and the wreck of it ----------
  // standing upright behind her, as she stood in it: the frame's length is up
  // (in the game it is shorter than she is: she stood in its clutches)
  const SC=kit.scaffold(1900,900);SC.g.rotation.z=Math.PI/2;SC.g.position.set(MU.aft-820,-150,0);G.add(SC.g);
  SC.g.userData.info={name:'The Scaffold',info:'The orbital cradle the Mothership was built in, over Kharak: a frame of girders kilometres long, the gantries and the fabrication modules clamped to it. She has just come out of it for her trials.'};pick.push(SC.g);
  // the wreck: the same girders, most of them, blown apart and tumbling slowly about where the frame was
  const WR=V3(-900,-500,-2600),wreck=[];
  {const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshPhongMaterial({color:0x3e3a36,flatShading:true}),SC.beams.length);let n=0;
    for(const [a,b,r] of SC.beams){if(rnd()<0.35)continue;const len=a.distanceTo(b)*(0.3+rnd()*0.7);
      wreck.push({p:a.clone().add(b).multiplyScalar(0.5).multiplyScalar(0.9).add(V3((rnd()-0.5)*900,(rnd()-0.5)*900,(rnd()-0.5)*900)),
        q:new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd()*6,rnd()*6,rnd()*6)),w:V3(rnd()-0.5,rnd()-0.5,rnd()-0.5).normalize(),rate:(rnd()-0.5)*0.12,v:V3(rnd()-0.5,rnd()-0.5,rnd()-0.5).multiplyScalar(3),s:V3(r*2,len,r*2),i:n++});}
    im.count=n;im.frustumCulled=false;const wg=new THREE.Group();wg.position.copy(WR);wg.add(im);wg.userData.im=im;quiet(wg);G.add(wg);SC.wreck=wg;}
  const fires=[];for(let i=0;i<60;i++){const w=wreck[Math.floor(rnd()*wreck.length)];fires.push({w,off:V3((rnd()-0.5)*20,(rnd()-0.5)*w.s.y,(rnd()-0.5)*20)});}

  // ---------- the others of the first mission ----------
  const RS=kit.research();RS.position.set(-400,650,-1100);G.add(RS);RS.userData.info={name:'The Research Ship',info:'The first ship built by the Mothership\'s own yard: a hub and its modules, where the fleet\'s scientists work out what the Kushan will need to know before they need it.'};pick.push(RS);
  const AF=V3(900,-500,-2600),rocks=[];
  {const g=new THREE.Group();for(let i=0;i<46;i++){const r=14+rnd()*rnd()*70,a=kit.asteroid(r,i*7+3);a.position.set(AF.x+(rnd()-0.5)*1300,AF.y+(rnd()-0.5)*400,AF.z+(rnd()-0.5)*900);a.rotation.set(rnd()*6,rnd()*6,rnd()*6);g.add(a);rocks.push({m:a,r,spin:(rnd()-0.5)*0.1,k:1});}
    G.add(g);g.userData.info={name:'The asteroid field',info:'Rocks off the Mothership\'s quarter, and the ore in them: the Resource Collectors go out, chew them up, and bring it back to be refined into ships.'};pick.push(g);SC.rocks=g;}
  const m1=[RS,SC.g,SC.rocks],m3=[SC.wreck];

  // ---------- the craft: each with an engine light and a trail ----------
  const CRAFT=[];
  const TEAM={kus:new THREE.Color(0xbfe0ff),tai:new THREE.Color(0xff7040),drone:new THREE.Color(0xff5a4a),col:new THREE.Color(0xffd080)};
  const craft=(obj,team,size,mission)=>{quiet(obj);scene.add(obj);const c={obj,team,size:size||10,mission,alive:true,trail:[],tn:0,vis:true};CRAFT.push(c);return c;};
  const NT=36,MAXC=80;
  // Points drawn as soft round lights, each at its own size on screen (a fighter's engine is smaller than a
  // corvette's), and added into the picture rather than painted over it
  const softTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.25,'rgba(255,255,255,0.8)');gr.addColorStop(0.6,'rgba(255,255,255,0.18)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const sprites=n=>{const geo=new THREE.BufferGeometry(),P=new Float32Array(n*3),Cc=new Float32Array(n*3),S=new Float32Array(n);
    geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setAttribute('color',new THREE.BufferAttribute(Cc,3));geo.setAttribute('psize',new THREE.BufferAttribute(S,1));
    const mat=new THREE.ShaderMaterial({uniforms:{map:{value:softTex}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexColors:true,
      vertexShader:'attribute float psize;varying vec3 vC;void main(){vC=color;gl_PointSize=psize;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:'uniform sampler2D map;varying vec3 vC;void main(){vec4 t=texture2D(map,gl_PointCoord);gl_FragColor=vec4(vC*t.a,1.0);}'});
    const o=new THREE.Points(geo,mat);o.frustumCulled=false;o.userData.noWire=true;scene.add(o);
    return {o,geo,P,C:Cc,S,n,draw(k){geo.setDrawRange(0,k);geo.attributes.position.needsUpdate=geo.attributes.color.needsUpdate=geo.attributes.psize.needsUpdate=true;}};};
  const glows=sprites(MAXC);
  // The trails: ribbons of light, each a strip of quads down the last couple of seconds of a craft's path,
  // turned to face the camera, tapering and fading to its tail, and never thinner on screen than a couple of
  // pixels however far off - which is how the game drew its fleets, as much as by the ships themselves
  const trG=new THREE.BufferGeometry(),trP=new Float32Array(MAXC*NT*2*3),trC=new Float32Array(MAXC*NT*2*3),trI=[];
  for(let s=0;s<MAXC;s++)for(let k=0;k+1<NT;k++){const a=(s*NT+k)*2,b=a+2;trI.push(a,a+1,b+1,a,b+1,b);}
  trG.setAttribute('position',new THREE.BufferAttribute(trP,3));trG.setAttribute('color',new THREE.BufferAttribute(trC,3));trG.setIndex(trI);
  const trails=new THREE.Mesh(trG,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));trails.frustumCulled=false;trails.userData.noWire=true;scene.add(trails);

  // ---------- fire, explosions, hyperspace ----------
  const NB=500,B=[];for(let i=0;i<NB;i++)B.push({p:V3(0,0,0),v:V3(0,0,0),life:0,c:null});
  const bG=new THREE.BufferGeometry(),bP=new Float32Array(NB*6),bC=new Float32Array(NB*6);bG.setAttribute('position',new THREE.BufferAttribute(bP,3));bG.setAttribute('color',new THREE.BufferAttribute(bC,3));
  const bolts=new THREE.LineSegments(bG,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));bolts.frustumCulled=false;bolts.userData.noWire=true;scene.add(bolts);
  const boltPts=sprites(NB);
  const FIRE={kus:new THREE.Color(0xffb050),tai:new THREE.Color(0xff4040)};
  let bi=0;const shoot=(from,to,team,speed)=>{const b=B[bi=(bi+1)%NB];b.p.copy(from);b.v.copy(to).sub(from);const d=b.v.length();b.v.setLength(speed||900);b.life=Math.min(2,d/(speed||900)+0.1);b.c=FIRE[team];};
  // an explosion: a fireball that blooms white to orange and dies to red, a ring of shock thrown out flat, and
  // sparks flung in every direction, each fading as it flies
  const tex=(draw)=>{const c=document.createElement('canvas');c.width=c.height=128;draw(c.getContext('2d'));return new THREE.CanvasTexture(c);};
  const fireTex=tex(g=>{const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,240,1)');gr.addColorStop(0.2,'rgba(255,220,140,0.95)');gr.addColorStop(0.5,'rgba(255,120,40,0.6)');gr.addColorStop(0.8,'rgba(160,40,10,0.2)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);
    for(let q=0;q<40;q++){const a=Math.random()*6.28,r=10+Math.random()*40;g.fillStyle='rgba(255,200,120,0.25)';g.beginPath();g.arc(64+Math.cos(a)*r,64+Math.sin(a)*r,4+Math.random()*10,0,7);g.fill();}});
  const ringTex=tex(g=>{const gr=g.createRadialGradient(64,64,40,64,64,63);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(0.7,'rgba(200,220,255,0.7)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);});
  const NX=24,NS=28,X=[],sparks=sprites(NX*NS);
  for(let i=0;i<NX;i++){const fb=new THREE.Sprite(new THREE.SpriteMaterial({map:fireTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0}));
    const ring=new THREE.Sprite(new THREE.SpriteMaterial({map:ringTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0}));
    for(const o of [fb,ring]){o.visible=false;o.userData.noWire=true;scene.add(o);}
    X.push({fb,ring,age:9,size:1,p:V3(0,0,0),v:Array.from({length:NS},()=>V3(rnd()-0.5,rnd()-0.5,rnd()-0.5).normalize().multiplyScalar(0.3+rnd()))});}
  let xi=0;const boom=(p,size)=>{const x=X[xi=(xi+1)%NX];x.p.copy(p);x.age=0;x.size=size;x.fb.visible=x.ring.visible=true;x.fb.position.copy(p);x.ring.position.copy(p);x.fb.material.rotation=rnd()*6;};
  // the hyperspace window: a frame of light, and a sheet of it, that sweeps along a ship as it comes through
  const winTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
    const gr=g.createRadialGradient(64,64,10,64,64,90);gr.addColorStop(0,'rgba(120,170,255,0.25)');gr.addColorStop(0.7,'rgba(150,200,255,0.5)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);
    g.strokeStyle='rgba(235,245,255,1)';g.lineWidth=6;g.strokeRect(6,6,116,116);return new THREE.CanvasTexture(c);})();
  const windows=[];const hyper=(at,axis,size,from,to,dur,after)=>{const [sw,sh]=Array.isArray(size)?size:[size,size],m=new THREE.Mesh(new THREE.PlaneGeometry(sw,sh),new THREE.MeshBasicMaterial({map:winTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    m.userData.noWire=true;m.lookAt(axis);scene.add(m);const w={m,at:at.clone(),axis:axis.clone().normalize(),from,to,dur,t:0,after};windows.push(w);return w;};

  // ---------- Kharak ----------
  const KH=makeKharak(api,C.kharak||{});pick.push(KH.planet);

  // ---------- mission 1: the trials ----------
  const scouts=[],drones=[];
  for(let i=0;i<7;i++)scouts.push(craft(kit.scout('kus'),'kus',9,1));
  for(let i=0;i<6;i++)drones.push(craft(kit.drone(),'drone',6,1));
  const sal1=craft(kit.salvage(),'kus',14,1),col1=craft(kit.collector(),'col',60,1);
  const lifters=[];for(let i=0;i<6;i++)lifters.push(craft(kit.lifter(),'col',34,1));
  const beamM=new THREE.LineBasicMaterial({color:0x9affd0,transparent:true,opacity:0.8,blending:THREE.AdditiveBlending,depthWrite:false});
  const beam=new THREE.Line(new THREE.BufferGeometry().setFromPoints([V3(0,0,0),V3(0,0,1)]),beamM);beam.frustumCulled=false;beam.userData.noWire=true;scene.add(beam);
  const DP=V3(2200,250,1200);          // where the drones come in
  const T1=K.trialEvery||48;
  const M1={cycle:-1,killed:0,captured:0,harvested:0,start:0,built:0};
  function patrol(i,t,out){const a=t*0.12+i*0.05,r=1400;out.set(Math.cos(a)*r*1.1+400,220+Math.sin(a*2)*60,Math.sin(a)*r*0.8);
    // the claw: the others off the leader's wings
    const off=[[0,0],[-30,30],[-30,-30],[-60,60],[-60,-60],[-90,90],[-90,-90]][i];const dx=-Math.sin(a),dz=Math.cos(a)*0.8,n=Math.hypot(dx,dz);
    out.x+=(-dx*off[0]/n)+(-dz*off[1]/n)*0.5;out.z+=(-dz*off[0]/n)+(dx*off[1]/n)*0.5;return out;}
  function dronePos(i,t,out){const a=i/6*Math.PI*2+t*0.05;return out.set(DP.x+Math.cos(a)*90,DP.y+Math.sin(i*1.7)*40,DP.z+Math.sin(a)*90);}
  function step1(t,dt,now){const cyc=Math.floor(t/T1),u=t-cyc*T1;
    if(cyc!==M1.cycle){M1.cycle=cyc;for(const d of drones){d.alive=true;d.obj.visible=false;d.shown=false;}}
    // the drones come through their windows, one after another
    drones.forEach((d,i)=>{const at=1+i*0.4;if(!d.shown&&u>at&&u<at+0.2){d.shown=true;dronePos(i,t,tmp);hyper(tmp,V3(-1,0,-0.3),26,-14,14,0.8);}
      const dies=12+i*3.2,captured=i===5;
      if(d.alive&&!captured&&u>dies){d.alive=false;boom(d.obj.position,18);M1.killed++;}
      d.obj.visible=d.shown&&d.alive&&!(captured&&u>40);
      if(captured&&u>28&&u<40){const k=ease((u-28)/12);dronePos(i,t,tmp);d.obj.position.copy(tmp).lerp(BAY,k);if(u>39.8&&!d.cap){d.cap=true;M1.captured++;}}
      else{dronePos(i,t,d.obj.position);d.cap=false;}
      d.obj.rotation.y+=dt*1.5;});
    // the scouts: patrol, then in at the drones, round them firing, and back
    const eng=ease((u-6)/4)*(1-ease((u-34)/6));
    scouts.forEach((s,i)=>{patrol(i,t,tmp);const a=t*0.5+i*0.9,r=150+i*6;tmp2.set(DP.x+Math.cos(a)*r,DP.y+Math.sin(a*0.7)*80,DP.z+Math.sin(a)*r);
      const p=tmp.lerp(tmp2,eng);face(s.obj,s.obj.position,p);s.obj.position.copy(p);
      if(eng>0.8&&rnd()<dt*3){const live=drones.filter(d=>d.alive&&d.obj.visible);if(live.length)shoot(p,live[i%live.length].obj.position,'kus',700);}});
    // the salvage corvette: out of the bay to the last drone, and back with it
    {const k=u<20?0:u<28?ease((u-20)/8):u<40?1-ease((u-28)/12):0;dronePos(5,t,tmp);sal1.obj.position.copy(BAY).lerp(tmp.add(V3(-12,0,0)),k);sal1.obj.visible=u>19&&u<40;face(sal1.obj,BAY,tmp);}
    // the collector: out to its rock, harvesting, and home with the load
    {const cyc2=t%70,rock=rocks[Math.floor(t/70)%rocks.length];const rp=rock.m.position;tmp.copy(rp).add(V3(-rock.r-40,10,0));
      const k=cyc2<16?ease(cyc2/16):cyc2<42?1:cyc2<60?1-ease((cyc2-42)/18):0;col1.obj.position.copy(BAY).lerp(tmp,k);col1.obj.visible=cyc2<61;face(col1.obj,col1.obj.position,cyc2<42?rp:BAY);
      const harvest=cyc2>=16&&cyc2<42;beam.visible=harvest;if(harvest){beam.geometry.setFromPoints([col1.obj.position,rp]);rock.k=Math.max(0.35,rock.k-dt*0.004);rock.m.scale.setScalar(rock.k);}
      if(cyc2>=60&&!col1.home){col1.home=true;M1.harvested++;}if(cyc2<60)col1.home=false;}
    for(const r of rocks)r.m.rotation.y+=r.spin*dt;
    RS.rotation.y+=dt*0.02;
    // the Research Ship is being built: the hub first, then a module every eight seconds
    {const built=Math.min(6,Math.floor((t-M1.start)/8));RS.userData.mods.forEach((m,k)=>{m.visible=k<built;});M1.built=built;}
    // the Heavy Lifters: up from Kharak, each to its tray, to dock a Rack Module and go down for the next
    lifters.forEach((c,i)=>{const q=trays[i],T=36,ph=(t+i*6)%T,d=V3(q.g.position.x-180+(i%3)*180,q.g.position.y+48,q.g.position.z),s=V3(d.x+(i-2.5)*300,-5600,d.z+(i%2?1:-1)*900);
      c.obj.visible=ph<33;const k=ph<14?ease(ph/14):ph<20?1:1-ease((ph-20)/13);c.obj.position.copy(s).lerp(d,k);
      if(ph<14)face(c.obj,s,d);else if(ph>=20)face(c.obj,d,s);});
    // the Phased Disassembler Array at work on its planetoid
    if(SC.dis){const D=SC.dis;D.chunk.rotation.y+=dt*0.05;D.chunk.rotation.x+=dt*0.013;D.rays.forEach((r,i)=>{r.visible=Math.sin(now*0.004+i*1.9)>-0.3;r.scale.x=r.scale.z=0.6+0.5*Math.random();});
      if(rnd()<dt*2){D.g.updateMatrixWorld(true);const p=D.g.localToWorld(V3((rnd()-0.5)*260,(rnd()-0.5)*260,(rnd()-0.5)*260).setLength(160));boom(p,10+rnd()*10);}}
    M1.u=u;}

  // ---------- mission 3: Return to Kharak ----------
  const trays=[],tai=[],def=[],sal=[];
  for(let i=0;i<6;i++){const g=quiet(kit.cryotray());g.position.set(1100+(i%3)*800,120-Math.floor(i/3)*520+(i%2)*90,1500+(i%2)*380);g.rotation.set((rnd()-0.5)*0.2,rnd()*6,(rnd()-0.5)*0.2);scene.add(g);
    const home1=V3(MU.aft-2350,-760+(i%3)*620,i<3?-520:520);
    trays.push({g,home:g.position.clone(),rot:g.rotation.clone(),home1,state:'held',lost:false,t:0});}
  trays[0].g.userData.info={name:'A cryo tray',info:'A long mechanical cargo container: a thousand Rack Modules of a hundred sleepers each, a hundred thousand to the tray, six trays for the six hundred thousand. In the first mission they wait in stable orbit beside the Scaffold, not yet loaded - nobody would risk them until the hyperspace drive had been tested - while Heavy Lifters bring up the last modules from Kharak. In the third they are all that is left of the Kushan: one fails as the Mothership comes out of hyperspace, the rest have to be defended, and the Salvage Corvettes bring them in one by one.'};
  for(const q of trays){q.g.userData.info=trays[0].g.userData.info;pick.push(q.g);}
  for(let i=0;i<12;i++)tai.push(craft(i<4?kit.corvette('tai'):kit.interceptor('tai'),'tai',i<4?30:12,3));
  for(let i=0;i<8;i++)def.push(craft(kit.interceptor('kus'),'kus',12,3));
  for(let i=0;i<2;i++)sal.push(craft(kit.salvage(),'kus',14,3));
  const cap=craft(kit.salvage(),'kus',14,3);
  const M3={start:0,recovered:0,lost:0,captured:0,wave:-1,arrived:false,said:''};
  const WAVE=64;
  function trayPos(q){return q.g.position;}
  function step3(t,dt,now){const u=t-M3.start;
    // the arrival: a window sweeps the Mothership from bow to stern, and she is there
    if(!M3.arrived){M3.arrived=true;const f=MU.front+260,a=MU.aft-240;cut.set(V3(1,0,0),-f);hyper(V3(f,0,0),V3(1,0,0),[760,L*1.2],f,a,7);
      for(const q of trays){q.state='held';q.lost=false;q.g.visible=true;q.g.position.copy(q.home);q.g.rotation.copy(q.rot);}M3.recovered=0;M3.lost=0;M3.captured=0;M3.wave=-1;}
    // the malfunction: the first tray sparks, tumbles, and goes
    {const q=trays[0];if(!q.lost&&u>4){q.g.rotation.x+=dt*0.3;q.g.rotation.z+=dt*0.2;q.g.userData.lightMat.color.setHex(Math.sin(now*0.03)>0?0xff3020:0x401010);
        if(rnd()<dt*8){const p=q.g.localToWorld(V3((rnd()-0.5)*400,0,0));boom(p,10);}
        if(u>12){q.lost=true;q.g.visible=false;boom(q.g.position,160);boom(q.g.position.clone().add(V3(120,0,0)),110);boom(q.g.position.clone().add(V3(-120,0,0)),110);M3.lost=1;}}}
    // the Taiidan, in waves out of hyperspace, each at a tray; the Mothership's interceptors after them
    const wave=Math.floor(Math.max(0,u-6)/WAVE),wu=Math.max(0,u-6)-wave*WAVE;
    if(wave!==M3.wave&&u>6){M3.wave=wave;tai.forEach((c,i)=>{c.alive=wave>0||i===0||i===1||i===4||i===5;c.dies=12+i*3.6+(i<4?10:0);c.at=null;c.taken=false;});
      hyper(V3(4200,400,3000),V3(-1,0,-0.6),160,-80,80,1.5);}
    const held=trays.filter(q=>q.state==='held'&&!q.lost);
    tai.forEach((c,i)=>{if(!c.alive||!held.length||u<6){c.obj.visible=false;return;}
      if(!c.at||c.at.state!=='held'||c.at.lost)c.at=held[i%held.length];
      // the first corvette of each wave is not destroyed but taken: its crew disabled, a Salvage Corvette
      // latches on and tows it into the hangar, to fly for the Kushan
      if(wu>c.dies&&i===0&&!c.taken){c.taken=true;c.tow=0;c.from=c.obj.position.clone();}
      if(c.taken){c.tow+=dt;const k=ease((c.tow-3)/14);c.obj.position.copy(c.from).lerp(BAY,k);cap.obj.visible=c.tow>0&&k<1;
        if(c.tow<3)cap.obj.position.copy(BAY).lerp(c.from,ease(c.tow/3));else cap.obj.position.copy(c.obj.position).add(V3(0,9,0));face(cap.obj,cap.obj.position,BAY);
        if(k>=1){c.alive=false;c.obj.visible=false;cap.obj.visible=false;M3.captured++;}return;}
      if(wu>c.dies){c.alive=false;c.obj.visible=false;boom(c.obj.position,i<4?55:22);return;}
      const T=trayPos(c.at),a=t*(i<4?0.18:0.45)+i*1.3,r=(i<4?260:170)+i*7,y=Math.sin(a*1.3+i)*90;
      tmp.set(T.x+Math.cos(a)*r,T.y+y,T.z+Math.sin(a)*r);
      // in from the window at the start of the wave
      const k=ease(wu/6);tmp2.set(4200,400,3000).lerp(tmp,k);face(c.obj,c.obj.position,tmp2);c.obj.position.copy(tmp2);c.obj.visible=true;
      if(k>0.9&&rnd()<dt*(i<4?4:2.5))shoot(tmp2,T.clone().add(V3((rnd()-0.5)*300,(rnd()-0.5)*40,(rnd()-0.5)*40)),'tai',650);});
    def.forEach((c,i)=>{const target=tai[i%tai.length],go=target.alive&&target.obj.visible&&!target.taken;
      const home=tmp.set(600+Math.cos(t*0.2+i)*300,120+i*12,500+Math.sin(t*0.2+i)*300);
      if(go){tmp2.copy(target.obj.position).add(V3(Math.cos(t+i)*60,20,Math.sin(t+i)*60));}else tmp2.copy(home);
      const p=c.obj.position.lengthSq()<1?home.clone():c.obj.position.clone();const d=tmp2.clone().sub(p),dd=d.length(),sp=Math.min(dd,dt*260);
      if(dd>0.1)p.addScaledVector(d,sp/dd);face(c.obj,c.obj.position,p);c.obj.position.copy(p);c.obj.visible=u>3;
      if(go&&dd<260&&rnd()<dt*4)shoot(p,target.obj.position,'kus',800);});
    // the salvage: a pair of corvettes to each held tray in turn, latch on, and tow it into the hangar
    {const idx=Math.floor(Math.max(0,u-16)/22),su=Math.max(0,u-16)-idx*22,q=held.length?trays.filter(q=>!q.lost)[idx]:null;
      sal.forEach((s,k)=>{s.obj.visible=false;});
      if(q&&q.state!=='home'&&u>16){const T=trayPos(q);
        sal.forEach((s,k)=>{const side=V3(0,0,k?40:-40);const at=T.clone().add(side);
          if(su<7){s.obj.position.copy(BAY).lerp(at,ease(su/7));face(s.obj,BAY,at);}else s.obj.position.copy(at);s.obj.visible=true;});
        if(su>=7){q.state='tow';const k=ease((su-7)/14);q.g.position.copy(q.home).lerp(BAY,k);q.g.rotation.y=lerp(q.rot.y,0,k);
          if(su>21){q.state='home';q.g.visible=false;M3.recovered++;}}}}
    if(M3.recovered+M3.lost>=6&&u>16+22*6+10){M3.start=t;M3.arrived=false;}
    // the wreck tumbles, burning
    {const im=SC.wreck.userData.im,Dm=new THREE.Object3D();for(const w of wreck){w.q.multiply(new THREE.Quaternion().setFromAxisAngle(w.w,w.rate*dt));w.p.addScaledVector(w.v,dt);
        Dm.position.copy(w.p);Dm.quaternion.copy(w.q);Dm.scale.copy(w.s);Dm.updateMatrix();im.setMatrixAt(w.i,Dm.matrix);}im.instanceMatrix.needsUpdate=true;
      if(rnd()<dt*3){const f=fires[Math.floor(rnd()*fires.length)];boom(f.w.p.clone().add(WR).add(f.off),6+rnd()*14);}}
    M3.u=u;}

  // ---------- the switch ----------
  let mission=0,t0=performance.now();
  const setMission=m=>{if(m===mission)return;mission=m;for(const o of m1)o.visible=m===1;for(const o of m3)o.visible=m===3;
    for(const c of CRAFT){c.obj.visible=false;c.trail.length=0;}
    for(const q of trays){q.g.visible=true;if(m===1){q.g.position.copy(q.home1);q.g.rotation.set(0,0,0);q.g.userData.lightMat.color.setHex(0xbfe0ff);q.state='held';q.lost=false;}}beam.visible=false;
    KH.setMission(m,false);if(m===3){M3.arrived=false;M3.start=(performance.now()-t0)/1000;}else{cut.set(V3(1,0,0),1e9);M1.cycle=-1;M1.start=(performance.now()-t0)/1000;}
    for(const [k,b] of Object.entries(BTN))b.setAttribute('aria-pressed',String(+k===m));};
  const BTN={};

  // ---------- sensors: the tactical map ----------
  let sensors=false;
  const grid=new THREE.Group();for(const r of [1000,2000,3000,4000,5000]){const pts=[];for(let k=0;k<=96;k++){const a=k/96*Math.PI*2;pts.push(V3(Math.cos(a)*r,0,Math.sin(a)*r));}
    grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x2a8a4a,transparent:true,opacity:0.6})));}
  for(let k=0;k<12;k++){const a=k/12*Math.PI*2;grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V3(0,0,0),V3(Math.cos(a)*5000,0,Math.sin(a)*5000)]),new THREE.LineBasicMaterial({color:0x1e5a34,transparent:true,opacity:0.5})));}
  const stG=new THREE.BufferGeometry(),stP=new Float32Array((MAXC+8)*6);stG.setAttribute('position',new THREE.BufferAttribute(stP,3));
  const stalks=new THREE.LineSegments(stG,new THREE.LineBasicMaterial({color:0x3ac86a,transparent:true,opacity:0.7}));stalks.frustumCulled=false;grid.add(stalks);
  quiet(grid);grid.visible=false;scene.add(grid);

  // ---------- the frame ----------
  const tmp=V3(0,0,0),tmp2=V3(0,0,0),m4=new THREE.Matrix4(),UP=V3(0,1,0);
  function face(obj,from,to){if(from.distanceToSquared(to)<1e-4)return;m4.lookAt(to,from,UP);obj.quaternion.setFromRotationMatrix(m4);obj.rotateY(-Math.PI/2);}
  let last=performance.now(),trT=0;
  animHooks.push(now=>{const dt=Math.min(0.1,(now-last)/1000);last=now;const t=(now-t0)/1000;
    if(mission===1)step1(t,dt,now);else if(mission===3)step3(t,dt,now);
    // the windows sweep, and the Mothership shows behind hers
    for(let i=windows.length-1;i>=0;i--){const w=windows[i];w.t+=dt;const k=clamp(w.t/w.dur,0,1),s=lerp(w.from,w.to,ease(k));
      w.m.position.copy(w.at).addScaledVector(w.axis,s-w.from);w.m.material.opacity=Math.sin(k*Math.PI);
      if(w.dur>5)cut.set(V3(1,0,0),-(w.at.x+(s-w.from))); if(k>=1){scene.remove(w.m);windows.splice(i,1);if(w.dur>5)cut.set(V3(1,0,0),1e9);}}
    // the trails and the engine lights
    trT+=dt;const sample=trT>0.05;if(sample)trT=0;let g=0;const cam=camera.position,toC=V3(0,0,0),dir=V3(0,0,0),side=V3(0,0,0);
    CRAFT.forEach((c,s)=>{const on=c.obj.visible;if(sample){if(on){c.trail.unshift(c.obj.position.clone());if(c.trail.length>NT)c.trail.pop();}else if(c.trail.length)c.trail.pop();}
      const col=TEAM[c.team],T=c.trail;
      for(let k=0;k<NT;k++){const o=(s*NT+k)*6;
        if(k>=T.length){const q=T.length?T[T.length-1]:c.obj.position;trP[o]=trP[o+3]=q.x;trP[o+1]=trP[o+4]=q.y;trP[o+2]=trP[o+5]=q.z;trC.fill(0,o,o+6);continue;}
        const p=k===0&&on?c.obj.position:T[k],nx=T[Math.min(T.length-1,k+1)],pv=T[Math.max(0,k-1)];
        dir.copy(pv).sub(nx);if(dir.lengthSq()<1e-6)dir.set(1,0,0);toC.copy(cam).sub(p);const dist=toC.length();
        side.crossVectors(dir,toC).normalize();const f=1-k/NT,w=Math.max(c.size*0.22,dist*0.0024)*(0.35+0.65*f);
        trP[o]=p.x+side.x*w;trP[o+1]=p.y+side.y*w;trP[o+2]=p.z+side.z*w;trP[o+3]=p.x-side.x*w;trP[o+4]=p.y-side.y*w;trP[o+5]=p.z-side.z*w;
        const a=Math.pow(f,1.6)*0.85;trC[o]=trC[o+3]=col.r*a;trC[o+1]=trC[o+4]=col.g*a;trC[o+2]=trC[o+5]=col.b*a;}
      if(on&&g<MAXC){const q=c.obj.position;glows.P.set([q.x,q.y,q.z],g*3);glows.C.set([col.r,col.g,col.b],g*3);glows.S[g]=(c.size>40?15:c.size>20?11:7)*(sensors?1.6:1);
        if(sensors){stP.set([q.x,q.y,q.z,q.x,0,q.z],g*6);}g++;}});
    trG.attributes.position.needsUpdate=trG.attributes.color.needsUpdate=true;trG.setDrawRange(0,CRAFT.length*(NT-1)*6);
    glows.draw(g);
    if(sensors){stG.setDrawRange(0,g*2);stG.attributes.position.needsUpdate=true;}
    // the bolts
    let nb=0;for(const b of B){if(b.life<=0)continue;b.life-=dt;b.p.addScaledVector(b.v,dt);
      bP.set([b.p.x,b.p.y,b.p.z,b.p.x-b.v.x*0.05,b.p.y-b.v.y*0.05,b.p.z-b.v.z*0.05],nb*6);bC.set([b.c.r,b.c.g,b.c.b,b.c.r*0.2,b.c.g*0.2,b.c.b*0.2],nb*6);
      boltPts.P.set([b.p.x,b.p.y,b.p.z],nb*3);boltPts.C.set([b.c.r,b.c.g,b.c.b],nb*3);boltPts.S[nb]=5;nb++;}
    bG.setDrawRange(0,nb*2);bG.attributes.position.needsUpdate=bG.attributes.color.needsUpdate=true;boltPts.draw(nb);
    // the explosions
    let ns=0;for(const x of X){if(x.age>3){x.fb.visible=x.ring.visible=false;continue;}x.age+=dt;const u=x.age/3;
      const fbU=Math.min(1,x.age/1.6);x.fb.scale.setScalar(x.size*(0.5+1.8*Math.sqrt(fbU)));x.fb.material.opacity=Math.max(0,1-fbU)*1.0;x.fb.material.color.setRGB(1,1-0.4*fbU,1-0.8*fbU);
      x.ring.scale.setScalar(x.size*(0.4+5*u));x.ring.material.opacity=Math.max(0,0.8-u);
      for(const v of x.v){if(ns>=sparks.n)break;const d=x.size*1.5*Math.sqrt(x.age)*v.length()*2;sparks.P.set([x.p.x+v.x*d,x.p.y+v.y*d,x.p.z+v.z*d],ns*3);const a=Math.max(0,1-u*1.2);sparks.C.set([a,0.7*a,0.35*a],ns*3);sparks.S[ns]=3;ns++;}}
    sparks.draw(ns);
    // the lamps: the running lights and the masthead lamps blink, the hangar's guide lamps chase in toward
    // the mouth, the Scaffold's corner lamps wink, and the engines' plumes breathe
    {const bl=now%2000;MU.blinks.forEach((b,i)=>{b.visible=((bl+i*230)%2000)<(i%2?260:160);});
      const ch=Math.floor(now/140)%6;MU.guides.forEach((b,i)=>{b.visible=(i%6)===ch||(i%6)===(ch+1)%6;});
      if(SC.lamps)SC.lamps.forEach((b,i)=>{b.visible=((now+i*170)%1600)<220;});
      MU.plumes.forEach((pl,i)=>{const f=0.85+0.12*Math.sin(now*0.02+i*1.7)+0.05*Math.sin(now*0.071+i);pl.scale.set(1,f,1);});
      // the manoeuvring jets fire in short bursts, the hyperspace core glows through its armour, the pylons hum
      MU.puffs.forEach((pf,i)=>{pf.visible=((now*0.001+i*1.37)%7)<0.35;});
      const cg=0.75+0.25*Math.sin(now*0.0017);MU.coreGlow.color.setRGB(0.66*cg,0.53*cg,1*cg);const pg=0.8+0.2*Math.sin(now*0.003);MU.pylonM.color.setRGB(0.81*pg,0.9*pg,pg);}
  });

  // ---------- the panel ----------
  const H0=location.hash.slice(1),hm=/(^|&)mission=(\d)/.exec(H0);
  const ship={radius:K.radius||5200,group:G,pick,minD:K.minD||60,
    get adaptiveNear(){return true;},
    hashExtra:()=>'&mission='+mission+(sensors?'&sensors':''),
    hud:()=>mission===1?'Mission 1 · the Kharak System · Research Ship '+(M1.built<6?'building, '+M1.built+' of 6 modules':'built')+' · trials: '+M1.killed+' drones destroyed, '+M1.captured+' captured, '+M1.harvested+' loads harvested'
      :'Mission 3 · Return to Kharak · cryo trays recovered '+M3.recovered+' of 6'+(M3.lost?', one lost':'')+(M3.captured?' · Taiidan corvettes captured: '+M3.captured:'')+(tai.some(c=>c.alive&&c.obj.visible&&!c.taken)?' · hostiles: '+tai.filter(c=>c.alive&&c.obj.visible&&!c.taken).length:''),
    buttons:{'Mission 1: Kharak System':()=>setMission(1),'Mission 3: Return to Kharak':()=>setMission(3),
      'Sensors':()=>{sensors=!sensors;grid.visible=sensors;}}};
  // the buttons are made after the model: mark the pressed one when they exist
  {let tries=0;const find=()=>{for(const b of document.querySelectorAll('#ui button')){if(/^Mission 1/.test(b.textContent))BTN[1]=b;if(/^Mission 3/.test(b.textContent))BTN[3]=b;}
    for(const [k,b] of Object.entries(BTN))b.setAttribute('aria-pressed',String(+k===mission));if(!BTN[1]&&++tries<60)setTimeout(find,250);};setTimeout(find,0);}
  setMission(hm&&hm[2]==='3'?3:1);KH.setMission(mission,true);
  if(/(^|&)sensors(&|$)/.test(H0)){sensors=true;grid.visible=true;}
  return ship;
}
