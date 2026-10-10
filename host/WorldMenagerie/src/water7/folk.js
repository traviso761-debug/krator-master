// ---------- the people of Water 7 ----------
// Some of the city's people, by name, each to be clicked for who they are (pushed onto api.LANDMARKS):
//   Paulie      Galley-La's Dock One foreman: slicked blond hair, orange goggles up, a cigar, an open denim jacket,
//               a coil of rope at his hip; at the head of Dock One's slip, the yard round him
//   Iceburg     the mayor and Galley-La's president: blue hair, a red-and-orange striped jacket, his mouse
//               Tyrannosaurus in his breast pocket; walking round Fountain Square
//   Franky      at his house's door: a blue pompadour, sunglasses up, an open red flowered shirt, forearms like
//               barrels with a blue star on each, swimming trunks; the Franky Family round the house (the Square
//               Sisters' tall blue hair among them)
//   Kokoro, Chimney and Gonbe   the keepers of Shift Station: the old woman with her bottle, the girl, the cat-rabbit
// And the town: the yagara rental shop on the quay (its tank of bulls, the boats and the customers queuing), masked
// revellers in capes and tricornes along the Market Terrace's promenades, and Up Town's square round the fountain
// (statues of shipwrights, benches, flower beds, a balustrade along the rim).
export function folk(api){
  const {THREE,C,scene,animHooks,camera,OSM}=api;const W7=OSM.water7;if(!W7)return;
  const T=W7.tiers,UP=T[T.length-1][1];let seed=19;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const MC=new Map(),M=c=>{if(!MC.has(c))MC.set(c,new THREE.MeshLambertMaterial({color:c}));return MC.get(c);};
  const add=(g,geo,c,x,y,z,rx=0,ry=0,rz=0)=>{const m=new THREE.Mesh(geo,typeof c==='string'||typeof c==='number'?M(c):c);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;g.add(m);return m;};
  const Cy=(r0,r1,h,s=10)=>new THREE.CylinderGeometry(r1,r0,h,s),Sp=(r,a=12,b=8)=>new THREE.SphereGeometry(r,a,b),Bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
  // ---- a person: facing +x, feet at 0, scaled to o.h metres ----
  function person(o){const g=new THREE.Group(),s=(o.h||1.78)/1.78,b=new THREE.Group();b.scale.setScalar(s);g.add(b);
    const legC=o.legs||'#2a2a30',skin=o.skin||'#e0b090';
    for(const sd of [-1,1]){add(b,Cy(0.075,0.065,0.82),o.bareLegs?skin:legC,0,0.43,sd*0.1);add(b,Bx(0.24,0.08,0.11),o.shoes||'#2a2018',0.05,0.04,sd*0.1);}
    if(o.trunks)add(b,Cy(0.2,0.19,0.18),o.trunks,0,0.9,0);
    add(b,Cy(o.waist||0.17,o.chest||0.2,0.6,12),o.shirt||'#e8e0cc',0,1.15,0);
    if(o.jacket)for(const sd of [-1,1])add(b,Bx(0.1,0.62,0.2),o.jacket,0.13,1.14,sd*0.13);                     // the jacket's open fronts
    if(o.bare)add(b,Bx(0.04,0.5,0.16),skin,0.19,1.18,0);                                                          // a bare chest down the open front
    const fa=o.forearm||0.05;for(const sd of [-1,1]){const arm=new THREE.Group();arm.position.set(0,1.42,sd*0.25);b.add(arm);add(arm,Cy(0.055,0.05,0.32),o.sleeve||o.jacket||o.shirt||'#e8e0cc',0,-0.16,0);
      add(arm,Cy(fa,fa*0.85,0.3),o.bareArms?skin:(o.sleeve||o.jacket||o.shirt||'#e8e0cc'),0.02,-0.45,0);add(arm,Sp(0.05),skin,0.03,-0.64,0);arm.rotation.x=sd*0.06;
      if(o.star){const st=add(arm,new THREE.CircleGeometry(fa*0.7,5),'#2a5ab8',fa*0.98,-0.45,0,0,Math.PI/2,0);st.rotation.y=Math.PI/2;}
      (g.userData.arms=g.userData.arms||[]).push(arm);}
    add(b,Cy(0.05,0.055,0.08),skin,0,1.49,0);add(b,Sp(0.11),skin,0,1.62,0);for(const sd of [-1,1])add(b,Sp(0.012,6,4),'#1a1a1a',0.1,1.64,sd*0.035);
    const hairC=o.hair||'#2a1c15';
    if(o.style==='slick')add(b,Sp(0.118,12,8).scale(1.05,0.75,1),hairC,-0.02,1.68,0);
    else if(o.style==='pomp'){const k=o.pompK||1;add(b,Sp(0.118,12,8).scale(1,0.7,1),hairC,-0.02,1.68,0);add(b,Sp(0.1*k,12,8).scale(2.2,0.85,1.0),hairC,0.12+0.08*(k-1),1.79+0.04*(k-1),0,0,0,0.3);}
    else if(o.style==='tall'){add(b,Sp(0.118,12,8).scale(1,0.7,1),hairC,-0.02,1.68,0);add(b,Cy(0.09,0.06,0.5),hairC,-0.02,1.95,0);}
    else if(o.style==='bun'){add(b,Sp(0.118,12,8).scale(1,0.75,1),hairC,-0.02,1.68,0);add(b,Sp(0.08),hairC,-0.05,1.8,0);}
    else if(o.style==='braids'){add(b,Sp(0.118,12,8).scale(1,0.8,1),hairC,-0.02,1.67,0);for(const sd of [-1,1])add(b,Cy(0.025,0.02,0.3),hairC,-0.04,1.45,sd*0.11);}
    else add(b,Sp(0.118,12,8).scale(1,0.7,1),hairC,-0.02,1.68,0);
    if(o.goggles){add(b,Bx(0.04,0.06,0.25),o.goggles,0.06,1.73,0,0,0,0.3);}
    if(o.shades){add(b,Bx(0.03,0.04,0.2),'#1a1a1a',0.09,1.72,0,0,0,0.4);}
    if(o.glasses){add(b,Bx(0.02,0.03,0.18),'#2a2a2e',0.115,1.64,0);}
    if(o.cigar){add(b,Cy(0.012,0.012,0.12,6),'#6a4a2a',0.16,1.57,0.02,0,0,Math.PI/2);add(b,Sp(0.014,6,4),'#ff7a30',0.22,1.57,0.02);}
    if(o.stripes)for(let k=0;k<5;k++)add(b,Cy(0.205,0.205+k*0.004,0.05,12),o.stripes,0,0.92+k*0.12,0);
    if(o.rope)add(b,new THREE.TorusGeometry(0.12,0.03,6,14),'#c8a868',0.02,0.95,-0.21,0,Math.PI/2,0);
    if(o.mouse){add(b,Sp(0.035),'#9a9a9e',0.2,1.35,0.1);for(const sd of [-1,1])add(b,Sp(0.016),'#c89aa0',0.2,1.39,0.1+sd*0.025);}
    if(o.bottle)add(b,Cy(0.035,0.04,0.24,8),'#3a6a3a',0.25,1.05,0.28);
    if(o.cola)add(b,Cy(0.035,0.035,0.12,8),'#c8302a',0.22,0.95,0.3);
    if(o.skirt)add(b,Cy(0.3,0.2,0.5,12),o.skirt,0,0.66,0);
    g.traverse(m=>{if(m.isMesh)m.userData.info={name:o.name,info:o.info};});
    if(o.name)(api.LANDMARKS||[]).push(g);scene.add(g);return g;}
  // a person is thirty-odd parts; once posed they are baked into one mesh coloured by vertex (one draw, not thirty)
  const VC=new THREE.MeshLambertMaterial({vertexColors:true});
  function bake(g){g.position.set(0,0,0);g.rotation.set(0,0,0);g.updateMatrixWorld(true);const pos=[],nor=[],col=[];let info=null;
    g.traverse(m=>{if(!m.isMesh)return;info=info||m.userData.info;const geo=(m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone()).applyMatrix4(m.matrixWorld),c=m.material.color||new THREE.Color(1,1,1),p=geo.attributes.position,n=geo.attributes.normal;
      for(let i=0;i<p.count;i++){pos.push(p.getX(i),p.getY(i),p.getZ(i));nor.push(n.getX(i),n.getY(i),n.getZ(i));col.push(c.r,c.g,c.b);}});
    for(const ch of [...g.children])g.remove(ch);const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));bg.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));bg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    const me=new THREE.Mesh(bg,VC);me.castShadow=true;me.userData.info=info;g.add(me);g.userData.baked=true;}
  const placeAt=(g,x,z,y,h)=>{if(!g.userData.baked)bake(g);g.position.set(x,y,z);g.rotation.y=-h;};
  // ================================================================ the named
  // Paulie at Dock One's slip head
  const D1=api.DOCKSHIPS&&api.DOCKSHIPS[1];if(D1){const p=new THREE.Vector3(D1.S0+18,2.3,D1.W/2+5).applyMatrix4(D1.dock.matrixWorld),q=new THREE.Vector3(D1.kx,2.3,0).applyMatrix4(D1.dock.matrixWorld);
    const g=person({name:'Paulie',info:"Galley-La's Dock One foreman: the best rigger in the yard, his ropes his weapon, a cigar always lit, and forever running from the debt collectors.",
      hair:'#e8c860',style:'slick',goggles:'#e8862a',cigar:true,jacket:'#3a5a8a',shirt:'#e8c040',legs:'#2a2a30',rope:true,h:1.9});placeAt(g,p.x,p.z,p.y+0.7,Math.atan2(q.z-p.z,q.x-p.x));}
  // Iceburg round Fountain Square
  const ice=person({name:'Iceburg',info:"The mayor of Water 7 and president of Galley-La: the shipwright who united the city's seven companies. Tyrannosaurus, his mouse, rides in his pocket.",
    hair:'#3a6ab8',style:'slick',shirt:'#d84a2a',stripes:'#f0a040',legs:'#2a2a3a',mouse:true,h:1.96});
  // Franky and the Family at Franky House (the island's frame: Scrap Island's centre, unturned)
  const [SX,SZ]=W7.scrap||[-1900,820],FH=[SX+78+22,SZ-36];
  {const g=person({name:'Franky',info:"The cyborg shipwright, Tom's apprentice and the Franky Family's boss: a blue pompadour, forearms like barrels, and he runs on cola.",
      hair:'#3a8ad8',style:'pomp',pompK:1.9,shades:true,shirt:'#c8302a',jacket:'#c8302a',bare:true,trunks:'#2a5ab8',bareLegs:true,bareArms:true,forearm:0.2,star:true,cola:true,h:2.3,shoes:'#3a3a3a',chest:0.3,waist:0.22});
    placeAt(g,FH[0]+3,FH[1]+1,2.5,0);}
  const FAM=[{name:'The Square Sisters',info:'Mozu and Kiwi, the Franky Family\'s twin sisters: tall blue hair, sunglasses, and a dance for every occasion.',hair:'#3a7ad8',style:'tall',shades:true,shirt:'#e8e0cc',skirt:'#e86a8a',bareLegs:true,h:1.7},
    {name:'The Square Sisters',info:'Mozu and Kiwi, the Franky Family\'s twin sisters.',hair:'#3a7ad8',style:'tall',shades:true,shirt:'#e8e0cc',skirt:'#e86a8a',bareLegs:true,h:1.7},
    {name:'Zambai',info:'The Franky Family\'s second: he keeps the house running while Franky is away.',hair:'#1a1a1a',style:'pomp',shades:true,shirt:'#2a8ab8',legs:'#e8e0cc',h:1.85},
    {name:'The Franky Family',info:'Franky\'s gang of dismantlers and bounty hunters, who live on Scrap Island.',hair:'#e8862a',style:'pomp',shirt:'#e8c040',legs:'#3a3a3a',h:1.8},
    {name:'The Franky Family',info:'Franky\'s gang of dismantlers and bounty hunters, who live on Scrap Island.',hair:'#2a2a2a',style:'pomp',shirt:'#3a8a4a',legs:'#5a4a3a',h:1.75},
    {name:'The Franky Family',info:'Franky\'s gang of dismantlers and bounty hunters, who live on Scrap Island.',hair:'#8a3ad8',style:'pomp',shirt:'#f4f0e6',legs:'#2a3a6a',h:1.82}];
  FAM.forEach((o,i)=>{const g=person(o);const a=-1.2+i*0.5;placeAt(g,FH[0]+6+Math.cos(a)*5,FH[1]+Math.sin(a)*5,2.5,Math.PI+a);});
  // Kokoro, Chimney and Gonbe at Shift Station
  {const ST=(C.landmarks||[]).find(l=>l.model==='station'),SG=(api.LANDMARKS||[]).find(g=>g.userData&&g.userData.info&&g.userData.info.model==='station');
    if(ST&&SG){const len=ST.track||2600,p=new THREE.Vector3(len-48,2,-26).applyMatrix4(SG.matrixWorld);
      const k=person({name:'Kokoro',info:'The stationmaster of Shift Station, out on the sea train\'s line: she likes her drink, and is not quite what she seems.',hair:'#e88a5a',style:'bun',shirt:'#c86a8a',skirt:'#7a4a8a',bareLegs:true,bottle:true,h:1.95,waist:0.24,chest:0.24});placeAt(k,p.x,p.z,p.y,Math.PI/2);
      const c=person({name:'Chimney',info:'Kokoro\'s granddaughter: she knows the sea train\'s line better than its drivers.',hair:'#2a1c15',style:'braids',shirt:'#e86a8a',skirt:'#e86a8a',bareLegs:true,h:1.15});placeAt(c,p.x+2,p.z+1,p.y,Math.PI/2);
      const gb=new THREE.Group();add(gb,Sp(0.18).scale(1.3,1,1),'#f4f4f0',0,0.22,0);add(gb,Sp(0.13),'#f4f4f0',0.22,0.38,0);for(const sd of [-1,1])add(gb,Cy(0.03,0.02,0.26,6),'#f4f4f0',0.2,0.6,sd*0.05);
      gb.traverse(m=>{if(m.isMesh)m.userData.info={name:'Gonbe',info:'Chimney\'s cat - or rabbit. Nobody is sure.'};});api.LANDMARKS&&api.LANDMARKS.push(gb);gb.position.set(p.x+2.6,p.y,p.z-0.6);scene.add(gb);}}
  // ================================================================ the yagara rental shop on the quay
  {const a=328*Math.PI/180,r=1312,ca=Math.cos(a),sa=Math.sin(a),g=new THREE.Group();g.position.set(ca*r,3,sa*r);g.rotation.y=-a;scene.add(g);
    add(g,Bx(14,8,24),'#f0e0c8',-2,4,0);add(g,new THREE.ConeGeometry(17,5,4).rotateY(Math.PI/4).scale(0.6,1,1.05),'#3a6aa8',-2,10.5,0);
    const tank=new THREE.Mesh(Bx(8,4.2,18),new THREE.MeshPhongMaterial({color:0x6ac8e8,transparent:true,opacity:0.45,shininess:90}));tank.position.set(9,2.1,0);g.add(tank);
    add(g,Bx(8.4,0.4,18.4),'#8a8a8e',9,0,0);
    const sc=document.createElement('canvas');sc.width=1024;sc.height=192;const k=sc.getContext('2d');k.fillStyle='#2a5a9a';k.fillRect(0,0,1024,192);k.fillStyle='#f8f0dc';k.font='bold 100px Georgia, serif';k.textAlign='center';k.textBaseline='middle';k.fillText('YAGARA BULL RENTAL',512,100);
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(20,3.8),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(sc)}));sign.position.set(5.1,9,0);sign.rotation.y=Math.PI/2;g.add(sign);
    const bulls=[];for(let i=0;i<4;i++){const b=new THREE.Group();add(b,Sp(0.4).scale(2,1,1),'#5ab8c0',0,0,0);add(b,Sp(0.3),'#5ab8c0',0.8,0.3,0);add(b,new THREE.ConeGeometry(0.2,0.4,6),'#e0a040',0.6,0.6,0);b.position.set(9,1.6,0);g.add(b);bulls.push({b,ph:i*1.57});}
    // the queue: customers along the quay, yagara boats waiting in the moat below
    for(let i=0;i<8;i++){const pp=person({shirt:['#e8c040','#c84a3a','#3a6aa8','#e8e0cc','#8a4a8a'][i%5],legs:'#3a3a42',hair:['#2a1c15','#c8a060','#1a1a1a'][i%3],h:1.6+R()*0.3});
      const lx=13,lz=-8+i*2.1,v=new THREE.Vector3(lx,0,lz).applyAxisAngle(new THREE.Vector3(0,1,0),-a);placeAt(pp,g.position.x+v.x,g.position.z+v.z,3,a+Math.PI/2);}
    for(let i=0;i<5;i++){const b=new THREE.Group();add(b,Sp(1).scale(2.2,1.1,1),'#5ab8c0',3.2,0.6,0);add(b,Sp(0.8),'#5ab8c0',5.4,1.4,0);add(b,Bx(4.4,0.8,1.8),'#c8803a',-2.2,0.3,0);
      const rr=1362,aa=a-0.012+i*0.006;b.position.set(Math.cos(aa)*rr,0.6,Math.sin(aa)*rr);b.rotation.y=-aa-Math.PI/2;scene.add(b);}
    g.traverse(m=>{if(m.isMesh)m.userData.info={name:'The Yagara Bull Rental',info:'Two thousand beli for two bulls and their boats: the way round Water 7. The bulls wait in the tank until they are wanted.'};});(api.LANDMARKS||[]).push(g);
    animHooks.push(now=>{const t=now/1000;for(const B of bulls){const u=Math.sin(t*0.5+B.ph);B.b.position.set(9+Math.sin(t*0.7+B.ph)*2.2,1.4+Math.sin(t*1.3+B.ph)*0.3,u*7);B.b.rotation.y=Math.cos(t*0.5+B.ph)>0?-Math.PI/2:Math.PI/2;}});}
  // ================================================================ masked revellers on the Market Terrace
  const NM=80,rm=(T[3][0]+T[4][0])/2,hM=T[3][1],cape=new THREE.InstancedMesh(new THREE.ConeGeometry(0.42,1.45,10).translate(0,0.78,0),new THREE.MeshLambertMaterial({color:0xffffff}),NM),
    mhead=new THREE.InstancedMesh(new THREE.SphereGeometry(0.11,10,8).translate(0,1.6,0),M('#e0b090'),NM),mask=new THREE.InstancedMesh(new THREE.SphereGeometry(0.115,10,8,-Math.PI/2*0.9,Math.PI*0.9,0.5,1.3).translate(0,1.6,0),new THREE.MeshLambertMaterial({color:0xffffff}),NM),
    tri=new THREE.InstancedMesh(new THREE.ConeGeometry(0.2,0.1,3).translate(0,1.75,0),M('#1a1a1c'),NM),RV=[],o=new THREE.Object3D(),cc=new THREE.Color();
  const CAPES=['#6a1a2a','#2a1a4a','#1a1a1c','#8a6a1a','#1a3a5a','#5a2a5a'],MASKS=['#f4f0e6','#e8c040','#f4f0e6','#c8a040','#e8e0f0'];
  for(let i=0;i<NM;i++){RV.push({r:rm+(R()<0.5?-1:1)*(19+R()*2),a:R()*6.28,v:(0.9+R()*0.5)/rm*(R()<0.5?-1:1)});cape.setColorAt(i,cc.set(CAPES[i%CAPES.length]));mask.setColorAt(i,cc.set(MASKS[i%MASKS.length]));}
  for(const m of [cape,mhead,mask,tri]){m.castShadow=true;m.frustumCulled=false;m.userData.noFingerprint=true;scene.add(m);}
  // ================================================================ Up Town's square
  {const g=new THREE.Group();scene.add(g);const stone='#f0e8d8',plinth='#d8ccb0';
    for(let k=0;k<8;k++){const a=k*Math.PI/4,x=Math.cos(a)*250,z=Math.sin(a)*250;add(g,Bx(3.4,3,3.4),plinth,x,UP+1.5,z,0,-a,0);
      const st=person({shirt:stone,legs:stone,skin:stone,hair:stone,shoes:stone,h:3.6});st.traverse(m=>{if(m.isMesh)m.userData.info={name:'A shipwright',info:'One of the shipwrights who built the city, in marble round the Great Fountain.'};});
      placeAt(st,x,z,UP+3,a+Math.PI);st.userData.arms&&(st.userData.arms[1].rotation.z=-2.2);}
    const n=96,bench=new THREE.InstancedMesh(new THREE.BoxGeometry(2.4,0.45,0.7).translate(0,0.45,0),M('#8a6a44'),n),bed=new THREE.InstancedMesh(new THREE.BoxGeometry(5,0.6,1.6).translate(0,0.3,0),new THREE.MeshLambertMaterial({color:0xffffff}),n);
    const FL=['#e85a6a','#e8c040','#c84ad8','#f4f0e6','#ea7a3a','#5ab84a'];
    for(let i=0;i<n;i++){const a=i/n*Math.PI*2+0.03;o.position.set(Math.cos(a)*232,UP,Math.sin(a)*232);o.rotation.set(0,-a+Math.PI/2,0);o.updateMatrix();bench.setMatrixAt(i,o.matrix);
      o.position.set(Math.cos(a+0.033)*197,UP,Math.sin(a+0.033)*197);o.updateMatrix();bed.setMatrixAt(i,o.matrix);bed.setColorAt(i,cc.set(FL[i%FL.length]));}
    for(const m of [bench,bed]){m.castShadow=true;m.userData.noFingerprint=true;g.add(m);}
    // the balustrade along the rim: posts and a rail
    const NP=Math.round(2*Math.PI*296/1.2),post=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1,0.13,1.0,6).translate(0,0.5,0),M('#f0e8d8'),NP);
    for(let i=0;i<NP;i++){const a=i/NP*Math.PI*2;o.position.set(Math.cos(a)*296,UP,Math.sin(a)*296);o.rotation.set(0,0,0);o.updateMatrix();post.setMatrixAt(i,o.matrix);}
    post.userData.noFingerprint=true;g.add(post);const rail=new THREE.Mesh(new THREE.TorusGeometry(296,0.16,6,360).rotateX(Math.PI/2),M('#e8dcc4'));rail.position.y=UP+1.05;g.add(rail);
    g.traverse(m=>{m.userData.noFingerprint=true;});}
  // ================================================================ the clock
  let last=0;const icePath={r:212,a:0};
  animHooks.push(now=>{const t=now/1000,dt=last?Math.min(0.1,t-last):0;last=t;
    // Iceburg, strolling round the square, now and then stopping to look at the fountain
    const stop=Math.sin(t*0.05)>0.8;if(!stop)icePath.a+=dt*1.1/icePath.r;const ix=Math.cos(icePath.a)*icePath.r,iz=Math.sin(icePath.a)*icePath.r;
    placeAt(ice,ix,iz,UP,stop?icePath.a+Math.PI:icePath.a+Math.PI/2);
    // the revellers along the promenades
    for(let i=0;i<NM;i++){const v=RV[i];v.a+=v.v*dt;const x=Math.cos(v.a)*v.r,z=Math.sin(v.a)*v.r,h=v.a+(v.v>0?Math.PI/2:-Math.PI/2);
      o.position.set(x,hM+Math.abs(Math.sin(t*6+i))*0.04,z);o.rotation.set(0,-h,0);o.scale.set(1,1,1);o.updateMatrix();for(const m of [cape,mhead,mask,tri])m.setMatrixAt(i,o.matrix);}
    for(const m of [cape,mhead,mask,tri])m.instanceMatrix.needsUpdate=true;});
  api.ctx.details=Object.assign(api.ctx.details||{},{folk:{named:8,revellers:NM}});
}
