// ---------- Babylon 5: who else is out here ----------
// Fan work. Babylon 5 belongs to Warner Bros. and J. Michael Straczynski; nothing from the series, its models
// or its art is used, and every shape here is this project's own geometry, built from the silhouettes as they
// are generally described.
//
//   an Earthforce destroyer, Omega class, holding station off the carousel: a long grey warship with a
//     hammerhead forward, its own rotating section amidships for gravity, and a block of engines aft with blue
//     radiators - a kilometre and a half of it
//   a Minbari war cruiser, a Sharlin, further off: a long blade of a hull, blue-green and glossy, with the
//     great swept crest rising off its back and a lesser one under it - the one ship out here nobody built
//     from plates
//   the raid (the Raiders button, or #raid): the gate opens out of turn and raiders come through it - small
//     delta fighters - and go for the carousel. Condition red: Starfuries come off the sphere after them, the
//     defence grid's pulse cannons open up, and one by one the raiders break up, until the last is gone
import {mkRng} from '../core/rng.js';

export function makeVisitors(api,O){
  const {THREE,scene,animHooks}=api;
  const rnd=mkRng(2259);
  const P=(c,o)=>new THREE.MeshPhongMaterial(Object.assign({color:c,specular:0x2a2a2a,shininess:10,flatShading:true},o||{}));
  const box=(w,h,d,mat,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x||0,y||0,z||0);return m;};
  const quiet=g=>{g.traverse(o=>{o.userData.noWire=true;});return g;};
  const blink=[];

  // ---------- the Omega destroyer ----------
  // Along +x, bow forward, 1500 m. Its drum turns once every twenty seconds.
  const omega=new THREE.Group();let omegaDrum;
  {const hull=P(0x8c8b86),panel=P(0x74736e),dark=P(0x3e3d3a),rad=new THREE.MeshPhongMaterial({color:0x2e4f82,specular:0x8aa8d8,shininess:60,flatShading:true,side:THREE.DoubleSide});
    const lit=new THREE.MeshBasicMaterial({color:0xffe2a8}),glow=new THREE.MeshBasicMaterial({color:0xbfe0ff});
    // the hammerhead: the forward hull, its nose stepping in, and the command tower on top
    omega.add(box(440,110,200,hull,470,0,0),box(180,80,150,panel,760,-6,0),box(90,50,110,hull,880,-12,0));
    omega.add(box(120,50,80,panel,420,80,0),box(60,24,50,dark,450,114,0));
    // the forward arms either side of the nose - the "mandibles"
    for(const sd of [-1,1]){omega.add(box(360,40,50,hull,640,-30,sd*130));omega.add(box(80,60,70,dark,820,-30,sd*130));}
    // the spine back to the engines, with plating either side
    omega.add(box(760,60,70,panel,-60,0,0));for(let i=0;i<8;i++)omega.add(box(40,76,86,dark,-380+i*95,0,0));
    // the rotating section: a drum on the spine amidships, trench-banded
    omegaDrum=new THREE.Group();omegaDrum.position.x=-40;
    {const d=new THREE.Mesh(new THREE.CylinderGeometry(135,135,280,40,1,false),hull);d.rotation.z=Math.PI/2;omegaDrum.add(d);
      for(const x of [-100,0,100]){const r=new THREE.Mesh(new THREE.CylinderGeometry(139,139,14,40),dark);r.rotation.z=Math.PI/2;r.position.x=x;omegaDrum.add(r);}
      for(let k=0;k<40;k++){const a=k/40*Math.PI*2;for(const x of [-60,60]){const w=box(10,6,4,lit,x+(k%3)*8,Math.cos(a)*136,Math.sin(a)*136);w.rotation.x=a;omegaDrum.add(w);}}}
    omega.add(omegaDrum);
    // aft: the engine block, four nozzles glowing, and the radiators standing out in a cross
    omega.add(box(300,170,230,hull,-560,0,0),box(120,190,250,panel,-420,0,0));
    for(const [y,z] of [[50,60],[50,-60],[-50,60],[-50,-60]]){const n=new THREE.Mesh(new THREE.CylinderGeometry(34,46,70,12,1,true),dark);n.rotation.z=Math.PI/2;n.position.set(-745,y,z);omega.add(n);
      const c=new THREE.Mesh(new THREE.CircleGeometry(32,12),glow);c.rotation.y=-Math.PI/2;c.position.set(-770,y,z);omega.add(c);}
    for(let k=0;k<4;k++){const a=k/4*Math.PI*2+Math.PI/4,f=new THREE.Mesh(new THREE.BoxGeometry(220,4,230),rad);f.position.set(-470,Math.cos(a)*220,Math.sin(a)*220);f.rotation.x=-a+Math.PI/2;omega.add(f);}
    // the guns: twin turrets along the top and bottom of the forward hull
    for(const y of [58,-58])for(let i=0;i<5;i++){const t=box(24,10,24,dark,300+i*70,y,(i%2?1:-1)*50);omega.add(t);for(const dz of [-4,4])omega.add(box(36,3,3,panel,318+i*70,y+(y>0?6:-6),(i%2?1:-1)*50+dz));}
    // windows down the hammerhead
    for(let i=0;i<30;i++)omega.add(box(6,4,1,lit,280+rnd()*380,-40+rnd()*80,(rnd()<0.5?-1:1)*101));
    const nav=[[900,0,-60,0xff3a2a],[900,0,60,0x3aff6a],[-700,100,0,0xffffff]];
    for(const [x,y,z,c] of nav){const b=new THREE.Mesh(new THREE.SphereGeometry(8,8,6),new THREE.MeshBasicMaterial({color:c}));b.position.set(x,y,z);omega.add(b);blink.push(b);}
    omega.position.set(-400,1500,-3600);omega.rotation.set(-0.06,0.02,0);quiet(omega);scene.add(omega);
    omega.userData.info={name:'An Earthforce destroyer',info:'An Omega-class destroyer holding station off the carousel: a kilometre and a half of warship, the hammerhead of its forward hull bristling with guns, a rotating section of its own amidships so the crew have weight, and its engines and blue radiators aft.'};
    O.pick.push(omega);}

  // ---------- the Minbari cruiser ----------
  // A blade of a hull, tall rather than wide, a long crest sweeping up and back off its spine and a lesser one
  // under it; glossy blue-green, the colour moving as the light does. 1600 m, bow +x.
  const minbari=new THREE.Group();
  {const skin=new THREE.MeshPhongMaterial({color:0x3f7f7c,specular:0xa8ffe8,shininess:110,emissive:0x07201f}),
      deep=new THREE.MeshPhongMaterial({color:0x2a4f5a,specular:0x9adcf0,shininess:90,emissive:0x051418,side:THREE.DoubleSide}),
      lit=new THREE.MeshBasicMaterial({color:0xb8f4ff});
    // the hull: a spindle, sharp at the bow, full just aft of the middle, drawn in to the stern
    const prof=[];for(let i=0;i<=40;i++){const t=i/40,x=-800+t*1600,r=110*Math.pow(Math.sin(Math.PI*Math.pow(t,0.8)),0.75)+2;prof.push(new THREE.Vector2(r,x));}
    const body=new THREE.Mesh(new THREE.LatheGeometry(prof,24),skin);body.rotation.z=-Math.PI/2;body.scale.set(1,1.25,0.5);minbari.add(body);
    // the crests: a blade rooted along the hull, its leading edge sweeping up and back to a point, its trailing
    // edge curving in under it - drawn in the ship's side plane and extruded thin
    const crest=(root0,root1,tip,bulge,depth)=>{const s=new THREE.Shape();s.moveTo(root0[0],root0[1]);
      s.quadraticCurveTo(root0[0]-bulge*0.2,tip[1]*0.9+root0[1]*0.1,tip[0],tip[1]);
      s.quadraticCurveTo(root1[0]-bulge*0.5,root1[1]+(tip[1]-root1[1])*0.35,root1[0],root1[1]);s.lineTo(root0[0],root0[1]);
      const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelThickness:3,bevelSize:3,bevelSegments:1,curveSegments:24});g.translate(0,0,-depth/2);return new THREE.Mesh(g,deep);};
    minbari.add(crest([260,90],[-320,110],[-760,560],260,14));
    minbari.add(crest([-80,-90],[-470,-80],[-820,-360],160,10));
    // the forward vanes, down and forward either side of the bow
    for(const sd of [-1,1]){const v=crest([420,-40],[640,-20],[860,-210],-80,6);v.position.z=sd*34;v.rotation.x=sd*0.25;minbari.add(v);}
    // the lights down the hull
    for(let i=0;i<24;i++){const x=-600+i*52;for(const sd of [-1,1])minbari.add(box(18,3,2,lit,x,-8,sd*52*Math.sin(Math.PI*(x+800)/1600)+sd*2));}
    minbari.position.set(4200,-1500,-5200);minbari.rotation.set(0.12,-0.35,0.05);quiet(minbari);scene.add(minbari);
    minbari.userData.info={name:'A Minbari war cruiser',info:'A Sharlin-class cruiser, on a visit: a blade of a hull a mile and a half long, grown rather than bolted, blue-green and glossy, with the great crest sweeping up off its back. It keeps its distance, and its gunports shut.'};
    O.pick.push(minbari);}

  let t0=performance.now();
  animHooks.push(now=>{const t=(now-t0)/1000;omegaDrum.rotation.x=t*Math.PI*2/20;
    const k=now%2600;blink.forEach((b,i)=>{b.visible=((k+i*300)%2600)<260;});
    minbari.position.y=-1500+Math.sin(t*0.05)*20;});

  // ================= the raid =================
  const R={on:false,t:0,raiders:[],furies:[],say:''};
  const grey=P(0x9d968a,{specular:0x333333,shininess:12}),darkM=P(0x4a4843);
  const raiderM=P(0x5e5c46),canopyM=new THREE.MeshPhongMaterial({color:0x1a2a2a,specular:0x88aaaa,shininess:80});
  const makeRaider=()=>{const g=new THREE.Group();const s=new THREE.Shape();s.moveTo(9,0);s.lineTo(-6,7.5);s.lineTo(-3.5,0);s.lineTo(-6,-7.5);s.lineTo(9,0);
    const w=new THREE.ExtrudeGeometry(s,{depth:1.4,bevelEnabled:false});w.rotateX(Math.PI/2);w.translate(0,0.7,0);g.add(new THREE.Mesh(w,raiderM));
    const c=new THREE.Mesh(new THREE.SphereGeometry(1.8,10,6),canopyM);c.scale.set(1.6,0.7,1);c.position.set(1.5,0.8,0);g.add(c);return quiet(g);};
  const N=8;
  for(let i=0;i<N;i++){const r=makeRaider();r.visible=false;scene.add(r);const f=O.makeFury(THREE,grey,darkM);f.visible=false;scene.add(f);R.raiders.push({g:r,alive:false,dies:20+i*4.5,next:0});R.furies.push({g:f,next:0});}
  // engine lights, fixed size on screen: raiders red-orange, Starfuries blue
  const glows=(n,colour,size)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3).fill(-1e7),3));
    const p=new THREE.Points(g,new THREE.PointsMaterial({color:colour,size,sizeAttenuation:false,transparent:true,depthWrite:false}));p.frustumCulled=false;p.userData.noWire=true;scene.add(p);return p;};
  const rGlow=glows(N,0xff7040,6),fGlow=glows(N,0x8ac8ff,5);
  // the bolts: pulse fire, orange for Earthforce, green for the raiders; a streak close to, a point far off
  const NB=600,B=[];for(let i=0;i<NB;i++)B.push({p:new THREE.Vector3(),v:new THREE.Vector3(),life:0,c:0});
  const bolts=[0,1].map(c=>{const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(NB*3).fill(-1e7),3));
    const pts=new THREE.Points(pg,new THREE.PointsMaterial({color:c?0x7aff5a:0xffa040,size:4,sizeAttenuation:false,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
    const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(NB*6).fill(-1e7),3));
    const ln=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:c?0x9aff7a:0xffc070,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
    for(const o of [pts,ln]){o.frustumCulled=false;o.userData.noWire=true;scene.add(o);}return {pg,lg};});
  let bi=0;const fire=(from,to,speed,c,lead)=>{const b=B[bi=(bi+1)%NB];b.p.copy(from);b.v.copy(to).sub(from);if(lead)b.v.addScaledVector(lead,b.v.length()/speed);b.v.setLength(speed);b.life=Math.min(2.2,from.distanceTo(to)/speed+0.3);b.c=c;};
  // the explosions: a flash that swells and fades, and a cloud of sparks thrown out
  const NX=14,X=[];
  for(let i=0;i<NX;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),new THREE.MeshBasicMaterial({color:0xffc080,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));m.visible=false;m.userData.noWire=true;scene.add(m);
    const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(40*3).fill(-1e7),3));
    const sp=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffd090,size:3,sizeAttenuation:false,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.frustumCulled=false;sp.userData.noWire=true;scene.add(sp);
    X.push({m,sg,sp,age:9,size:1,p:new THREE.Vector3(),dirs:Array.from({length:40},()=>new THREE.Vector3(rnd()-0.5,rnd()-0.5,rnd()-0.5).normalize().multiplyScalar(20+rnd()*60))});}
  let xi=0;const boom=(p,size)=>{const x=X[xi=(xi+1)%NX];x.p.copy(p);x.age=0;x.size=size;x.m.visible=true;};

  // a notice at the foot of the screen
  const note=document.createElement('div');note.style.cssText='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);max-width:560px;padding:8px 14px;background:rgba(8,20,34,.86);color:#e8eef4;border:1px solid #6a3a3a;font:13px Helvetica,Arial,sans-serif;line-height:1.4;display:none;z-index:6';
  document.body.appendChild(note);let noteT=0;const say=(txt,ms)=>{note.textContent=txt;note.style.display='block';noteT=performance.now()+(ms||7000);};

  // where each raider is on its run: loops round the carousel, a little over a kilometre out, working along it
  const path=(i,t,out)=>{const th=0.32*t+i*0.34,x=500+1300*Math.sin(0.16*t+i*0.9),r=1050+120*Math.sin(0.7*t+i);return out.set(x,Math.cos(th)*r,Math.sin(th)*r);};
  const gp=new THREE.Vector3(),sphereP=new THREE.Vector3(O.SY,0,0),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),w=new THREE.Vector3(),m4=new THREE.Matrix4(),UP=new THREE.Vector3(0,1,0);
  const face=(g,from,to)=>{if(from.distanceToSquared(to)<1e-4)return;m4.lookAt(from,to,UP);g.quaternion.setFromRotationMatrix(m4);g.rotateY(Math.PI/2);};
  const ease=u=>u<=0?0:u>=1?1:u*u*(3-2*u);
  function raid(){if(R.on)return;R.on=true;R.start=performance.now()+3200;R.last=R.start;O.gate.userData.openNow();
    O.gate.updateMatrixWorld(true);gp.set(0,0,1700).applyMatrix4(O.gate.matrixWorld);
    for(const r of R.raiders){r.alive=true;r.g.visible=false;r.next=0;}for(const f of R.furies){f.g.visible=false;f.next=0;}
    say('The jump gate is opening out of turn. Raiders - eight of them, coming through.',4000);R.said=0;}
  let lastNow=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.1,(now-lastNow)/1000);lastNow=now;
    if(noteT&&now>noteT){note.style.display='none';noteT=0;}
    // the bolts and the explosions run whether or not the raid does, until they are spent
    for(const k of [0,1]){const pp=bolts[k].pg.attributes.position,lp=bolts[k].lg.attributes.position;let n=0;
      for(const q of B){if(q.c!==k||q.life<=0)continue;q.life-=dt;q.p.addScaledVector(q.v,dt);
        pp.setXYZ(n,q.p.x,q.p.y,q.p.z);lp.setXYZ(2*n,q.p.x,q.p.y,q.p.z);lp.setXYZ(2*n+1,q.p.x-q.v.x*0.06,q.p.y-q.v.y*0.06,q.p.z-q.v.z*0.06);n++;}
      for(let i=n;i<NB;i++){pp.setXYZ(i,0,-1e7,0);lp.setXYZ(2*i,0,-1e7,0);lp.setXYZ(2*i+1,0,-1e7,0);}
      pp.needsUpdate=lp.needsUpdate=true;}
    for(const x of X){if(x.age>3){if(x.m.visible){x.m.visible=false;x.sg.attributes.position.array.fill(-1e7);x.sg.attributes.position.needsUpdate=true;}continue;}
      x.age+=dt;const u=x.age/3;x.m.position.copy(x.p);x.m.scale.setScalar(x.size*(0.3+Math.sqrt(u)*1.2));x.m.material.opacity=Math.max(0,1-u*1.6);
      const sp=x.sg.attributes.position;x.dirs.forEach((d,i)=>sp.setXYZ(i,x.p.x+d.x*x.age*x.size/30,x.p.y+d.y*x.age*x.size/30,x.p.z+d.z*x.age*x.size/30));sp.needsUpdate=true;x.sp.material.opacity=Math.max(0,1-u);}
    if(!R.on)return;
    const t=(now-R.start)/1000;if(t<0)return;
    const rp=rGlow.geometry.attributes.position,fp=fGlow.geometry.attributes.position;let alive=0;
    // the raiders: out of the vortex, onto their run, firing at the carousel as they pass
    R.raiders.forEach((r,i)=>{if(!r.alive){rp.setXYZ(i,0,-1e7,0);return;}
      if(t>=r.dies){r.alive=false;r.g.visible=false;boom(r.g.position,45);return;}
      alive++;r.g.visible=true;path(i,t,a);const k=ease(t/9);const pos=b.copy(gp).lerp(a,k);path(i,t+0.2,c);c.lerp(gp,1-ease((t+0.2)/9));
      face(r.g,pos,c);r.g.position.copy(pos);rp.setXYZ(i,pos.x,pos.y,pos.z);
      if(t>8&&t>r.next){r.next=t+0.7+rnd()*0.6;
        // at the hull under it
        w.set(Math.max(O.DA,Math.min(O.DF,pos.x+(rnd()-0.5)*300)),pos.y,pos.z);const L=Math.hypot(w.y,w.z)||1;w.y*=O.DR/L;w.z*=O.DR/L;fire(pos,w,1200,1);
        if(rnd()<0.3)setTimeout(()=>boom(w.clone(),8),Math.max(0,pos.distanceTo(w)/1.2));}});
    // the Starfuries: off the sphere, round onto the raiders' tails, firing; home again when it is over
    R.furies.forEach((f,i)=>{const r=R.raiders[i];const tl=Math.max(0,t-2.2);
      path(i,tl,a);a.x+=((i%2)?20:-20);
      let pos;if(t<4){f.g.visible=false;fp.setXYZ(i,0,-1e7,0);return;}
      const k=ease((t-4-i*0.3)/7),back=ease((t-(r.dies+3))/10);
      pos=b.copy(sphereP).lerp(a,k);if(back>0)pos.lerp(sphereP,back);
      if(back>=1){f.g.visible=false;fp.setXYZ(i,0,-1e7,0);return;}
      f.g.visible=k>0;path(i,tl+0.2,c);face(f.g,pos,back>0?sphereP:c);f.g.position.copy(pos);fp.setXYZ(i,pos.x,pos.y,pos.z);
      if(r.alive&&k>0.9&&t>f.next){f.next=t+0.3+rnd()*0.3;path(i,t+0.1,c);w.copy(c).sub(r.g.position).multiplyScalar(10);fire(pos,r.g.position,1500,0,w);}});
    rp.needsUpdate=fp.needsUpdate=true;
    // the defence grid: each live raider draws fire from the guns that face it and are in range
    if(t>9)for(const r of R.raiders){if(!r.alive||rnd()>dt*10)continue;
      for(let tries=0;tries<6;tries++){const g=O.GUNS[Math.floor(rnd()*O.GUNS.length)];g.parent.localToWorld(c.copy(g.p));w.copy(r.g.position).sub(c);const d=w.length();
        if(d>2600)continue;g.parent.localToWorld(a.copy(g.p).add(g.n)).sub(c);if(a.dot(w)/d<0.15)continue;fire(c,r.g.position,1600,0);fire(c.addScaledVector(a,3),r.g.position,1600,0);break;}}
    if(R.said===0&&t>5){R.said=1;say('Condition red. Starfuries launching from the Cobra bays; the defence grid is live.',6000);}
    if(R.said===1&&alive<=4&&t>10){R.said=2;say('Half of them gone. The rest are making runs down the carousel.',5000);}
    if(alive===0&&R.said<3){R.said=3;say('The last raider breaks up. Stand down from condition red.',7000);}
    if(t>R.raiders[N-1].dies+14){R.on=false;}
    R.alive=alive;});
  return {raid,status:()=>R.on?(R.alive?'condition red · '+R.alive+' raider'+(R.alive===1?'':'s'):'standing down'):'',omega,minbari};
}
