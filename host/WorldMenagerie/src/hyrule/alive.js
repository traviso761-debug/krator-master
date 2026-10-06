// ---------- the country, alive ----------
// Fan work: Breath of the Wild belongs to Nintendo, and every shape here is this project's own.
//
//   camps        Bokoblin camps out in the wilds: hide tents, a skull-faced rock, a campfire with its smoke and glow,
//                and the Bokoblins themselves - red, blue, black - milling round the fire, bigger by night
//   travellers   people on the roads: walking with their packs, or riding, there and back between the stables
//   game         deer in the woods and boar on the hillsides, grazing and moving on
//   smoke        from the villages' chimneys, and steam off the hot springs
//   lanterns     at the stables and the camps, lit after dark
//   fireflies    over the water and in the woods at night
//   wind         the white lines of the wind, curling over the fields and gone
// Everything that comes in numbers is instanced: a few draw calls for all of it.
import { mkRng } from '../core/rng.js';

export function alive(api){
  const {THREE,ctx,scene,animHooks,groundH}=api;
  const PL=ctx.plan;if(!PL)return;const S=PL.sites;
  const R=mkRng(2017);
  const nightF=()=>api.nightF&&api.hour?api.nightF(api.hour()):0;
  const L=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c,flatShading:true},o||{}));
  const tag=o=>{o.userData.noFingerprint=true;return o;};
  const inLake=(x,z)=>{for(const lk of (PL.lakes||[])){let c=false;const p=lk.poly;for(let i=0,j=p.length-1;i<p.length;j=i++){if((p[i][1]>z)!==(p[j][1]>z)&&x<(p[j][0]-p[i][0])*(z-p[i][1])/(p[j][1]-p[i][1])+p[i][0])c=!c;}if(c)return true;}return false;};
  const dm=new THREE.Object3D(),M4=new THREE.Matrix4(),col=new THREE.Color();

  // a soft round sprite texture, for smoke, steam, glow
  const softTex=(r,g,b)=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,`rgba(${r},${g},${b},0.9)`);gr.addColorStop(1,`rgba(${r},${g},${b},0)`);x.fillStyle=gr;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);};
  const smokeTex=softTex(120,115,110),steamTex=softTex(240,248,250),glowTex=softTex(255,190,90);
  // one pool of rising puffs for every smoke and steam source: each source owns a few sprites that rise and fade in turn
  const puffs=[];
  const source=(x,y,z,tex,size,rise,n,opacity)=>{for(let k=0;k<n;k++){const sp=tag(new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,opacity:0})));sp.userData.noWire=true;scene.add(sp);
      puffs.push({sp,x,y,z,ph:k/n,size,rise,op:opacity||0.6});}};

  // ================================================================ Bokoblin camps
  const hide=L(0x8a6a48),hide2=L(0x6a4a30),bone=L(0xe8e0c8),rock=L(0x8a8478),log=L(0x5a3e28);
  const flameM=new THREE.MeshBasicMaterial({color:0xffa03a,transparent:true,opacity:0.9});
  const fires=[],campParts=[];
  for(const c of (PL.camps||[])){const y=groundH(c.x,c.z),a0=R()*6.28;
    // two or three hide tents round the fire, a skull-faced rock, a lookout on one
    for(let k=0;k<2+Math.floor(R()*2);k++){const a=a0+k*2.1,tx=c.x+Math.cos(a)*14,tz=c.z+Math.sin(a)*14,ty=groundH(tx,tz);
      const t=new THREE.Mesh(new THREE.ConeGeometry(4.5,6,5).translate(0,3,0),k%2?hide:hide2);t.position.set(tx,ty,tz);t.rotation.y=a;campParts.push(t);}
    const sk=new THREE.Mesh(new THREE.IcosahedronGeometry(6,1),rock);sk.scale.set(1,0.9,0.9);sk.position.set(c.x+Math.cos(a0+1)*20,y+3,c.z+Math.sin(a0+1)*20);campParts.push(sk);
    for(const s of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(1.3,8,6),L(0x1a1410));e.position.set(sk.position.x+Math.cos(a0+1)*-4.6+s*1.8*Math.sin(a0+1),y+4,sk.position.z+Math.sin(a0+1)*-4.6-s*1.8*Math.cos(a0+1));campParts.push(e);}
    for(let k=0;k<3;k++){const l=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.25,2.4,5).rotateZ(Math.PI/2),log);l.position.set(c.x,y+0.3,c.z);l.rotation.y=k*1.05;campParts.push(l);}
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2,st=new THREE.Mesh(new THREE.IcosahedronGeometry(0.5,0),rock);st.position.set(c.x+Math.cos(a)*1.6,y+0.2,c.z+Math.sin(a)*1.6);campParts.push(st);}
    const flame=tag(new THREE.Mesh(new THREE.ConeGeometry(0.9,2.2,6).translate(0,1.1,0),flameM));flame.position.set(c.x,y+0.3,c.z);scene.add(flame);
    const glow=tag(new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0.5})));glow.position.set(c.x,y+2,c.z);glow.scale.setScalar(14);scene.add(glow);
    fires.push({flame,glow,c,y,ph:R()*6.28});source(c.x,y+2,c.z,smokeTex,5,40,5,0.45);}
  // one mesh per material for every camp's fixed parts
  {const by=new Map();for(const p of campParts){if(!by.has(p.material))by.set(p.material,[]);by.get(p.material).push(p);}
   for(const [m,l] of by){const g=api.mergeParts?api.mergeParts(l,m):null;if(g){g.castShadow=true;g.receiveShadow=true;tag(g);scene.add(g);}}}
  // the Bokoblins: a squat body, a big head with a horn, a club; red, blue or black; milling round each fire
  const BOKO=[0xc84a3a,0x4a6ac8,0x2a2428,0xb05a8a],boks=[];
  for(const f of fires)for(let k=0;k<3+Math.floor(R()*3);k++)boks.push({f,a:R()*6.28,r:4+R()*7,sp:(0.15+R()*0.25)*(R()<0.5?-1:1),c:BOKO[Math.floor(R()*BOKO.length)],ph:R()*6.28});
  const bBody=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.55,0.75,1.4,7).translate(0,0.9,0),L(0xffffff),boks.length);
  const bHead=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.7,0),L(0xffffff),boks.length);
  const bHorn=new THREE.InstancedMesh(new THREE.ConeGeometry(0.16,0.6,5),bone,boks.length);
  const bClub=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12,0.22,1.6,5),log,boks.length);
  boks.forEach((b,i)=>{bBody.setColorAt(i,col.setHex(b.c));bHead.setColorAt(i,col.setHex(b.c));});
  for(const im of [bBody,bHead,bHorn,bClub]){if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;tag(im);scene.add(im);}

  // ================================================================ travellers on the roads
  // walkers with packs, and riders; each goes along a road and turns back at its end
  const roads=(api.ROADS||[]).filter(r=>r.len>400);
  const travellers=[];
  for(let k=0;k<44&&roads.length;k++){const r=roads[Math.floor(R()*roads.length)];travellers.push({r,s:R()*r.len,sp:(R()<0.4?4.5:1.3)*(R()<0.5?-1:1),ride:R()<0.4,c:[0x3a6aa8,0xa84a3a,0x6a8a3a,0xc8a060,0x8a5aa8][Math.floor(R()*5)]});}
  const along=(r,s)=>{let acc=0;for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],l=Math.hypot(bx-ax,bz-az);if(acc+l>=s){const u=(s-acc)/(l||1);return [ax+(bx-ax)*u,az+(bz-az)*u,Math.atan2(bz-az,bx-ax)];}acc+=l;}const e=r.pts[r.pts.length-1];return [e[0],e[1],0];};
  const tBody=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.28,0.34,1.3,7).translate(0,0.65,0),L(0xffffff),travellers.length);
  const tHead=new THREE.InstancedMesh(new THREE.SphereGeometry(0.22,8,6),L(0xf0c8a0),travellers.length);
  const tPack=new THREE.InstancedMesh(new THREE.BoxGeometry(0.5,0.7,0.6),L(0x8a6a44),travellers.length);
  const hBody=new THREE.InstancedMesh(new THREE.BoxGeometry(2.2,0.9,0.8),L(0x8a5a3a),travellers.length);
  const hNeck=new THREE.InstancedMesh(new THREE.BoxGeometry(0.5,1.5,0.45),L(0x8a5a3a),travellers.length);
  travellers.forEach((t,i)=>tBody.setColorAt(i,col.setHex(t.c)));
  for(const im of [tBody,tHead,tPack,hBody,hNeck]){if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;im.castShadow=true;tag(im);scene.add(im);}

  // ================================================================ game in the woods: deer and boar
  const game=[];
  for(let k=0;k<70;k++){const x=-5500+R()*11000,z=-4600+R()*9200,y=groundH(x,z);if(y<4||y>500||inLake(x,z))continue;
    game.push({x,z,a:R()*6.28,deer:R()<0.6,ph:R()*6.28,graze:R()<0.6});}
  const gBody=new THREE.InstancedMesh(new THREE.BoxGeometry(1.6,0.8,0.6),L(0xffffff),game.length);
  const gHead=new THREE.InstancedMesh(new THREE.BoxGeometry(0.6,0.5,0.4),L(0xffffff),game.length);
  const gLegs=new THREE.InstancedMesh(new THREE.BoxGeometry(0.15,1,0.15).translate(0,-0.5,0),L(0x4a3a2a),game.length*4);
  game.forEach((g,i)=>{const c=g.deer?0xa8743c:0x4a3a30;gBody.setColorAt(i,col.setHex(c));gHead.setColorAt(i,col.setHex(c));});
  for(const im of [gBody,gHead,gLegs]){if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;tag(im);scene.add(im);}

  // ================================================================ smoke from the villages, steam from the hot springs
  for(const key of ['kakariko','hateno','lurelin','tarrey','rito','goron'])if(S[key])for(let k=0;k<5;k++){const a=R()*6.28,r=30+R()*110,x=S[key].x+Math.cos(a)*r,z=S[key].z+Math.sin(a)*r;
    source(x,groundH(x,z)+8,z,smokeTex,4,30,4,0.4);}
  for(const lk of (PL.lakes||[]))if(lk.hot)for(let k=0;k<8;k++){const p=lk.poly[Math.floor(R()*lk.poly.length)],cx=lk.poly.reduce((s,q)=>s+q[0],0)/lk.poly.length,cz=lk.poly.reduce((s,q)=>s+q[1],0)/lk.poly.length;
    const x=cx+(p[0]-cx)*R(),z=cz+(p[1]-cz)*R();source(x,lk.level+1,z,steamTex,14,50,5,0.5);}
  if(ctx.falls)for(const f of ctx.falls)source(f.bx,Math.min(f.by,groundH(f.bx,f.bz))+3,f.bz,steamTex,f.w*0.8,30,6,0.55);

  // ================================================================ lanterns at the stables, lit after dark
  const lanterns=[];for(const st of (PL.stables||[])){for(let k=0;k<3;k++){const a=k*2.1,x=st.x+Math.cos(a)*14,z=st.z+Math.sin(a)*14;
      const sp=tag(new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0})));sp.position.set(x,groundH(x,z)+4,z);sp.scale.setScalar(6);scene.add(sp);lanterns.push(sp);}}

  // ================================================================ fireflies at night, over the water and in the woods
  const FF=900,ffPos=new Float32Array(FF*3),ffBase=[];
  for(let i=0;i<FF;i++){let x,z,tries=0;do{const lk=PL.lakes[Math.floor(R()*PL.lakes.length)],p=lk.poly[Math.floor(R()*lk.poly.length)];x=p[0]+(R()-0.5)*160;z=p[1]+(R()-0.5)*160;tries++;}while(tries<4&&groundH(x,z)>400);
    ffBase.push([x,groundH(x,z)+1+R()*4,z,R()*6.28]);}
  const ffG=new THREE.BufferGeometry();ffG.setAttribute('position',new THREE.BufferAttribute(ffPos,3));
  const ffM=new THREE.PointsMaterial({color:0xd8ff7a,size:1.4,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
  const ff=tag(new THREE.Points(ffG,ffM));ff.frustumCulled=false;ff.userData.noWire=true;scene.add(ff);

  // ================================================================ wind: white lines curling over the fields, near the camera
  const winds=[];const windM=()=>new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0});
  for(let k=0;k<14;k++){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(30*3),3));
    const l=tag(new THREE.Line(g,windM()));l.frustumCulled=false;l.userData.noWire=true;scene.add(l);winds.push({l,g,t:R()*6,life:0});}
  const spawnWind=w=>{const c=api.camera?api.camera.position:new THREE.Vector3();const a=R()*6.28,d=40+R()*220;
    w.x=c.x+Math.cos(a)*d;w.z=c.z+Math.sin(a)*d;w.y=groundH(w.x,w.z)+3+R()*10;w.t=0;w.life=4+R()*3;w.len=30+R()*40;w.curl=R()*6.28;};

  // ================================================================ every frame
  let last=performance.now();
  animHooks.push(now=>{const t=now/1000,dt=Math.min(0.05,(now-last)/1000),n=nightF();last=now;
    // fires flicker, brighter at night
    for(const f of fires){const k=1+Math.sin(t*9+f.ph)*0.12+Math.sin(t*13.7+f.ph)*0.08;f.flame.scale.set(k,k*(1.1+Math.sin(t*7+f.ph)*0.15),k);f.glow.material.opacity=0.25+0.6*n;f.glow.scale.setScalar(12+n*14);}
    boks.forEach((b,i)=>{const a=b.a+t*b.sp,x=b.f.c.x+Math.cos(a)*b.r,z=b.f.c.z+Math.sin(a)*b.r,y=groundH(x,z),hop=Math.abs(Math.sin(t*4+b.ph))*0.15,face=-a-(b.sp>0?Math.PI/2:-Math.PI/2);
      dm.position.set(x,y+hop,z);dm.rotation.set(0,face,0);dm.scale.set(1,1,1);dm.updateMatrix();bBody.setMatrixAt(i,dm.matrix);
      M4.copy(dm.matrix);dm.position.set(0,2.2,0);dm.rotation.set(0,0,0);dm.updateMatrix();bHead.setMatrixAt(i,M4.clone().multiply(dm.matrix));
      dm.position.set(0.2,2.9,0);dm.updateMatrix();bHorn.setMatrixAt(i,M4.clone().multiply(dm.matrix));
      dm.position.set(0,1.2,0.8);dm.rotation.set(Math.sin(t*3+b.ph)*0.6,0,0);dm.updateMatrix();bClub.setMatrixAt(i,M4.clone().multiply(dm.matrix));});
    for(const im of [bBody,bHead,bHorn,bClub])im.instanceMatrix.needsUpdate=true;
    travellers.forEach((tr,i)=>{tr.s+=tr.sp*dt;if(tr.s<0||tr.s>tr.r.len){tr.sp=-tr.sp;tr.s=Math.max(0,Math.min(tr.r.len,tr.s));}
      const [x,z,h]=along(tr.r,tr.s),y=groundH(x,z),face=-h+(tr.sp<0?Math.PI:0),off=2.2;
      const px=x-Math.sin(h)*off,pz=z+Math.cos(h)*off;   // keep to the side of the road
      if(tr.ride){dm.position.set(px,y+1.3,pz);dm.rotation.set(0,face,0);dm.updateMatrix();hBody.setMatrixAt(i,dm.matrix);M4.copy(dm.matrix);
        dm.position.set(1.1,0.9,0);dm.rotation.set(0,0,-0.5);dm.updateMatrix();hNeck.setMatrixAt(i,M4.clone().multiply(dm.matrix));
        dm.position.set(0,0.45,0);dm.rotation.set(0,0,0);dm.updateMatrix();tBody.setMatrixAt(i,M4.clone().multiply(dm.matrix));
        dm.position.set(0,1.95,0);dm.updateMatrix();tHead.setMatrixAt(i,M4.clone().multiply(dm.matrix));dm.scale.set(0,0,0);dm.updateMatrix();tPack.setMatrixAt(i,dm.matrix);dm.scale.set(1,1,1);}
      else{const bob=Math.abs(Math.sin(t*6+i))*0.08;dm.position.set(px,y+bob,pz);dm.rotation.set(0,face,0);dm.updateMatrix();tBody.setMatrixAt(i,dm.matrix);M4.copy(dm.matrix);
        dm.position.set(0,1.5,0);dm.updateMatrix();tHead.setMatrixAt(i,M4.clone().multiply(dm.matrix));dm.position.set(-0.4,0.9,0);dm.updateMatrix();tPack.setMatrixAt(i,M4.clone().multiply(dm.matrix));
        dm.scale.set(0,0,0);dm.position.set(0,0,0);dm.updateMatrix();hBody.setMatrixAt(i,dm.matrix);hNeck.setMatrixAt(i,dm.matrix);dm.scale.set(1,1,1);}});
    for(const im of [tBody,tHead,tPack,hBody,hNeck])im.instanceMatrix.needsUpdate=true;
    game.forEach((g,i)=>{if(!g.graze){g.a+=Math.sin(t*0.13+g.ph)*dt*0.4;const nx=g.x+Math.cos(g.a)*dt*(g.deer?2:1.2),nz=g.z+Math.sin(g.a)*dt*(g.deer?2:1.2);if(groundH(nx,nz)>3&&!inLake(nx,nz)){g.x=nx;g.z=nz;}else g.a+=Math.PI;}
      if(Math.sin(t*0.07+g.ph)>0.98)g.graze=!g.graze;const y=groundH(g.x,g.z),s=g.deer?1:0.8,legH=g.deer?1.1:0.6;
      dm.position.set(g.x,y+legH*s,g.z);dm.rotation.set(0,-g.a,0);dm.scale.setScalar(s);dm.updateMatrix();gBody.setMatrixAt(i,dm.matrix);M4.copy(dm.matrix);
      const down=g.graze?0.9:0;dm.position.set(0.9,0.4-down,0);dm.rotation.set(0,0,0);dm.scale.set(1,1,1);dm.updateMatrix();gHead.setMatrixAt(i,M4.clone().multiply(dm.matrix));
      [[0.6,0.25],[0.6,-0.25],[-0.6,0.25],[-0.6,-0.25]].forEach(([a,b],k)=>{dm.position.set(a,-0.3,b);dm.rotation.set(0,0,g.graze?0:Math.sin(t*8+k+g.ph)*0.4);dm.scale.set(1,legH,1);dm.updateMatrix();gLegs.setMatrixAt(i*4+k,M4.clone().multiply(dm.matrix));});});
    for(const im of [gBody,gHead,gLegs])im.instanceMatrix.needsUpdate=true;
    for(const p of puffs){const u=(p.ph+t*0.05)%1;p.sp.position.set(p.x+u*p.rise*0.3,p.y+u*p.rise,p.z+u*p.rise*0.15);p.sp.scale.setScalar(p.size*(0.6+u*2.2));p.sp.material.opacity=p.op*Math.sin(u*Math.PI);}
    for(const l of lanterns)l.material.opacity=0.85*Math.max(0,(n-0.25)/0.75);
    ffM.opacity=0.9*Math.max(0,(n-0.35)/0.65);if(ffM.opacity>0){for(let i=0;i<FF;i++){const [x,y,z,p]=ffBase[i];ffPos[i*3]=x+Math.sin(t*0.6+p)*3;ffPos[i*3+1]=y+Math.sin(t*0.9+p*2)*1.2;ffPos[i*3+2]=z+Math.cos(t*0.5+p)*3;}ffG.attributes.position.needsUpdate=true;}
    for(const w of winds){if(w.life<=0||w.t>w.life){spawnWind(w);}w.t+=dt;const u=w.t/w.life,a=w.l.geometry.attributes.position;
      for(let k=0;k<30;k++){const s=k/29,head=u*1.4-s*0.5;const px=w.x+head*w.len*2,c=Math.sin(head*4+w.curl)*6,py=w.y+Math.sin(head*3)*2;a.setXYZ(k,px,py+c*0.3,w.z+c);}
      a.needsUpdate=true;w.l.material.opacity=0.55*Math.sin(Math.min(1,u)*Math.PI)*(1-n*0.8);}});
  ctx.details=Object.assign(ctx.details||{},{camps:fires.length,bokoblins:boks.length,travellers:travellers.length,game:game.length,smokes:puffs.length});
}
