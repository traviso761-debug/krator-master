// ---------- Galaxy class: the other ships ----------
// Fan work. Every ship here is this project's own design, not any ship from any film, series or game; the
// peoples are this page's own too. Each builder returns {g, nose, bubble, engines}: the group (+x forward, metres),
// the point it fires from, its shield's sprite, and the engine glows that pulse.
//
//   the Varr     a warrior people: a heavy cruiser of about 300 m, a dark bronze wedge of stepped armour with two
//                forward-swept blade wings, orange slits for engines. It hunts from behind a cloak.
//   the Lattice  a hive: no front, no back; a dark core under a growing crust of blocks and spines, inside two
//                cages of glowing violet struts, about 1.1 km across. Slow, enormous, and it learns.
//   the Sere     a quiet, exact people who keep records of everything: a white survey ship of about 350 m, a slim
//                keel under one tall swept fin, two spars below with amber engine strips. They help, a little.
//   a hauler     a trader's tug pulling a spine of cargo pods, about 400 m.
//   a derelict   two broken halves of something ancient and ribbed, 2.5 km long, a few lights still flickering.
export function factions(THREE,W,E){
  const std=(c,m,r)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r,envMap:W.env,envMapIntensity:1.1});
  const flat=(pts,depth,mat,bev)=>{const sh=new THREE.Shape();pts.forEach(([x,z],i)=>i?sh.lineTo(x,z):sh.moveTo(x,z));sh.closePath();
    const geo=new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:!!bev,bevelThickness:bev||0,bevelSize:bev||0,bevelSegments:2});geo.rotateX(Math.PI/2);return new THREE.Mesh(geo,mat);};
  const fin=(g)=>{g.traverse(o=>{o.userData.noWire=true;if(o.isMesh)o.castShadow=o.receiveShadow=true;});};

  function varr(){
    const g=new THREE.Group(),hull=std(0x5e4636,0.6,0.45),plate=std(0x3b2c24,0.5,0.55),glowM=new THREE.MeshBasicMaterial({color:0xff6a20,toneMapped:false});
    // the wedge: three stepped layers of armour, each a little shorter, the top one a brow over the bridge
    [[150,-150,46,0,22],[120,-140,36,22,14],[40,-120,24,36,12]].forEach(([f,a,w,y,h],i)=>{
      const m=flat([[f,0],[f-40,w],[a,w*1.15],[a-10,0],[a,-w*1.15],[f-40,-w]],h,i===1?plate:hull,2.5);m.position.y=y+h;g.add(m);});
    // the wings: from the hull's flanks, swept forward to blades that turn down at their tips
    for(const sd of [1,-1]){
      // the wing droops (anhedral), so the blade at its tip hangs below the hull
      const wg=new THREE.Group();wg.position.set(0,18,sd*40);wg.rotation.x=sd*0.26;g.add(wg);
      const w=flat([[-100,0],[-40,0],[70,130],[30,142],[-110,30]].map(([x,z])=>[x,z*sd]),5,hull,1.5);w.position.y=2.5;wg.add(w);
      const st=new THREE.Mesh(new THREE.BoxGeometry(120,2,4),glowM);st.position.set(-20,3.5,sd*60);st.rotation.y=-sd*0.85;wg.add(st);
      const bl=flat([[80,0],[10,0],[-10,-70],[40,-60]],4,plate,1.2);bl.rotation.x=-Math.PI/2;bl.position.set(-10,4,sd*138);wg.add(bl);
      const gun=new THREE.Mesh(new THREE.CylinderGeometry(2.5,3.5,50,8),plate);gun.rotation.z=Math.PI/2;gun.position.set(80,0,sd*132);wg.add(gun);
      const muz=E.sprite(0xff7a30,18,0.8);muz.position.set(108,0,sd*132);wg.add(muz);
      // the engines: two slits in the rear face
      const sl=new THREE.Mesh(new THREE.BoxGeometry(1,8,40),glowM);sl.position.set(-158,22,sd*24);g.add(sl);
      const eg=E.sprite(0xff6a20,60,0.8);eg.position.set(-165,22,sd*24);g.add(eg);eg.userData.eng=true;}
    // a prong under the bow: the main gun, its emitter glowing
    const pr=new THREE.Mesh(new THREE.CylinderGeometry(4,7,70,8),plate);pr.rotation.z=Math.PI/2;pr.position.set(160,8,0);g.add(pr);
    const nose=E.sprite(0xff8a40,36,0.9);nose.position.set(198,8,0);g.add(nose);
    const win=new THREE.Mesh(new THREE.BoxGeometry(0.6,1.6,26),new THREE.MeshBasicMaterial({color:0xffc080,toneMapped:false}));win.position.set(41,63,0);g.add(win);
    const bubble=E.sprite(0xff9050,620,0);g.add(bubble);fin(g);
    g.userData.info={name:'A Varr cruiser',info:'A warrior people\'s heavy cruiser: about 300 m, cloaked until it strikes.'};
    return {g,nose,bubble,engines:g.children.filter(o=>o.userData.eng)};
  }

  function lattice(){
    const g=new THREE.Group(),spin=new THREE.Group();g.add(spin);g.userData.spin=spin;
    const dark=std(0x2a2c30,0.7,0.5),dark2=std(0x3a3d42,0.6,0.6);dark.flatShading=dark2.flatShading=true;
    const core=new THREE.Mesh(new THREE.IcosahedronGeometry(300,1),dark);spin.add(core);
    // the crust: blocks and spines grown out of the core, every way
    let s=7;const r=()=>(s=(s*16807)%2147483647)/2147483647;
    for(let i=0;i<120;i++){const d=new THREE.Vector3(r()-0.5,r()-0.5,r()-0.5).normalize(),long=r()<0.25;
      const m=new THREE.Mesh(new THREE.BoxGeometry(long?20:40+r()*90,long?20:30+r()*70,long?180+r()*200:30+r()*80),r()<0.5?dark:dark2);
      m.position.copy(d).multiplyScalar(270+r()*60);m.lookAt(d.clone().multiplyScalar(2000));spin.add(m);}
    // the cages: two polyhedra of glowing struts, turned against each other
    const lm=new THREE.LineBasicMaterial({color:0xb090ff,transparent:true,opacity:0.85,toneMapped:false});
    const c1=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.DodecahedronGeometry(500)),lm),c2=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(560,1)),lm.clone());
    c2.material.opacity=0.45;c2.rotation.set(0.4,0.7,0.2);spin.add(c1,c2);g.userData.cages=[c1,c2];
    // lights in the crust, and the glow of the core through the gaps
    const n=260,im=new THREE.InstancedMesh(new THREE.BoxGeometry(6,6,6),new THREE.MeshBasicMaterial({color:0xc8a8ff,toneMapped:false}),n),m4=new THREE.Matrix4();
    for(let i=0;i<n;i++){const d=new THREE.Vector3(r()-0.5,r()-0.5,r()-0.5).normalize().multiplyScalar(300+r()*90);m4.makeTranslation(d.x,d.y,d.z);im.setMatrixAt(i,m4);}spin.add(im);
    const cg=E.sprite(0x9a70ff,1100,0.5);spin.add(cg);
    const nose=E.sprite(0xc8a0ff,60,0.9);nose.position.set(380,0,0);g.add(nose);
    const engines=[];for(const z of [-1,1]){const e=E.sprite(0xa080ff,180,0.6);e.position.set(0,0,z*420);e.userData.eng=true;spin.add(e);engines.push(e);}
    const bubble=E.sprite(0xb090ff,2000,0);g.add(bubble);fin(g);
    g.userData.info={name:'A Lattice ship',info:'A hive\'s ship, about 1.1 km across. It adapts to whatever is fired at it.'};
    return {g,nose,bubble,engines};
  }

  function sere(){
    const g=new THREE.Group(),white=std(0xe4e2dc,0.25,0.35),trim=std(0x9a968e,0.4,0.45),amb=new THREE.MeshBasicMaterial({color:0xffb040,toneMapped:false});
    // the keel: a long slender lathe along x
    const prof=[[0,-180],[10,-176],[18,-150],[24,-60],[26,40],[20,120],[10,170],[0,185]].map(([r,y])=>new THREE.Vector2(r,y));
    const k=new THREE.Mesh(new THREE.LatheGeometry(prof,32),white);k.rotation.z=-Math.PI/2;k.scale.set(1,1,0.75);g.add(k);
    // the fin: tall and swept back, thin, a band of amber along its leading edge
    const f=flat([[60,0],[-20,0],[-140,150],[-100,150]],4,white,1.5);f.rotation.x=-Math.PI/2;f.position.set(0,14,2);g.add(f);
    const edge=new THREE.Mesh(new THREE.BoxGeometry(2,150,1.5),amb);edge.position.set(-40,90,0);edge.rotation.z=0.72;g.add(edge);
    // two spars under the keel, out and down, each with an engine strip
    const engines=[];for(const sd of [1,-1]){
      const sp=new THREE.Mesh(new THREE.BoxGeometry(220,6,10),trim);sp.position.set(-70,-30,sd*55);sp.rotation.x=sd*-0.25;g.add(sp);
      const st=new THREE.Mesh(new THREE.BoxGeometry(160,2,1),amb);st.position.set(-70,-26,sd*60.5);st.rotation.x=sd*-0.25;g.add(st);
      const strut=new THREE.Mesh(new THREE.BoxGeometry(30,5,60),trim);strut.position.set(-50,-14,sd*28);strut.rotation.x=sd*0.55;g.add(strut);
      const e=E.sprite(0xffb040,50,0.8);e.position.set(-185,-30,sd*55);e.userData.eng=true;g.add(e);engines.push(e);}
    for(let i=0;i<14;i++){const w=new THREE.Mesh(new THREE.BoxGeometry(6,1.4,0.6),amb);w.position.set(110-i*16,4,19.6);g.add(w);const w2=w.clone();w2.position.z=-19.6;g.add(w2);}
    const nose=E.sprite(0xffc060,26,0.9);nose.position.set(190,0,0);g.add(nose);
    const bubble=E.sprite(0xffc070,700,0);g.add(bubble);fin(g);
    g.userData.info={name:'A Sere survey ship',info:'A quiet, exact people\'s survey ship, about 350 m. Friendly.'};
    return {g,nose,bubble,engines};
  }

  function hauler(seed){
    const g=new THREE.Group(),body=std(0xc9a24a,0.35,0.5),grey=std(0x6d6a64,0.5,0.55);
    const cab=new THREE.Mesh(new THREE.BoxGeometry(60,34,40),body);cab.position.x=150;g.add(cab);
    const br=new THREE.Mesh(new THREE.BoxGeometry(2,6,30),new THREE.MeshBasicMaterial({color:0xfff0c0,toneMapped:false}));br.position.set(181,8,0);g.add(br);
    const spine=new THREE.Mesh(new THREE.CylinderGeometry(5,5,330,8),grey);spine.rotation.z=Math.PI/2;spine.position.x=-35;g.add(spine);
    const cols=[0x8a4a3a,0x3f6b8a,0xa8a090,0x5a7a4a,0xb07a30,0x6a5a8a];
    for(let i=0;i<6;i++){const c=new THREE.Mesh(new THREE.BoxGeometry(44,38+((i+seed)%3)*8,40),std(cols[(i+seed)%6],0.3,0.6));c.position.set(100-i*50,0,0);g.add(c);}
    const eb=new THREE.Mesh(new THREE.BoxGeometry(40,46,56),grey);eb.position.x=-210;g.add(eb);
    const engines=[];for(const z of [-16,16]){const e=E.sprite(0x9fc8ff,70,0.8);e.position.set(-236,0,z);e.userData.eng=true;g.add(e);engines.push(e);}
    for(const [y,c] of [[22,0xff3020],[-22,0x30ff60]]){const l=E.sprite(c,14,1);l.position.set(180,y,0);g.add(l);}
    const nose=E.sprite(0xffffff,10,0.5);nose.position.set(185,0,0);g.add(nose);
    const bubble=E.sprite(0xffffff,10,0);g.add(bubble);fin(g);
    g.userData.info={name:'A hauler',info:'A trader\'s tug and its train of cargo pods, about 400 m.'};
    return {g,nose,bubble,engines};
  }

  function derelict(){
    const g=new THREE.Group(),rust=std(0x4a423a,0.55,0.85),bone=std(0x6e665a,0.4,0.8);
    // two halves of a ribbed hull, broken in the middle and drifting apart, the ribs bare where the skin is gone
    for(const [x,rz,ry] of [[-700,0.08,0.05],[760,-0.12,0.18]]){const h=new THREE.Group();h.position.x=x;h.rotation.set(0,ry,rz);g.add(h);
      const skin=new THREE.Mesh(new THREE.CylinderGeometry(150,170,1000,24,1,true,0,Math.PI*1.35),rust);skin.material.side=THREE.DoubleSide;skin.rotation.z=Math.PI/2;h.add(skin);
      for(let i=0;i<14;i++){const rb=new THREE.Mesh(new THREE.TorusGeometry(172,10,6,28),bone);rb.rotation.y=Math.PI/2;rb.position.x=-480+i*72;h.add(rb);}
      const cap=new THREE.Mesh(new THREE.SphereGeometry(170,20,12,0,Math.PI*2,0,Math.PI/2),rust);cap.rotation.z=x<0?Math.PI/2:-Math.PI/2;cap.position.x=x<0?-500:500;h.add(cap);
      for(let i=0;i<6;i++){const l=E.sprite(0xffd8a0,30,0.8);l.position.set(-400+i*150,(i%2?1:-1)*160,60);l.userData.flick=Math.random()*9;h.add(l);}}
    const nose=E.sprite(0xffffff,1,0);g.add(nose);const bubble=E.sprite(0xffffff,1,0);g.add(bubble);fin(g);
    g.userData.info={name:'A derelict',info:'Two halves of something old and very large, 2.5 km end to end, dead but for a few lights.'};
    return {g,nose,bubble,engines:[]};
  }
  return {varr,lattice,sere,hauler,derelict};
}
