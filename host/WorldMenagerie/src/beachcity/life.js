// ---------- what the shore is doing while you look at it ----------
// Fan work; Steven Universe belongs to Rebecca Sugar and Cartoon Network, and every shape here is this project's own.
//
// The wheel, the rides and the lighthouse's beam move with their models (landmarks.js). This is the rest: the
// surf running up the ocean beaches and back (the bay is still), the boardwalk itself - planks on posts along the
// back of the beach, with a rail and lamps on its sea side - and the gulls.
import { mkRng } from '../core/rng.js';

export function life(api){
  const {THREE,C,ctx,scene,animHooks}=api;
  const K=C.life||{},PL=ctx.plan;if(!PL)return;
  const R=mkRng(K.seed||2013);
  const nightF=()=>api.nightF&&api.hour?api.nightF(api.hour()):0;

  // ---- the surf: two white bands along each ocean waterline, running up the sand and back, out of step ----
  // Each band is a ribbon along the line; every frame its vertices slide along the line's normal (towards the
  // land and back), which is the wave running up the beach. The lines run with the sea on their right.
  const foam=[];
  for(const line of (PL.surf||[]))for(const [w,ph,op] of [[3,0,0.55],[5,2.1,0.28]]){
    const n=line.length,pos=new Float32Array(n*6),base=[],nor=[],idx=[];
    for(let k=0;k<n;k++){const a=line[Math.max(0,k-1)],b=line[Math.min(n-1,k+1)],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1;
      nor.push(-dz/L,dx/L);base.push(line[k][0],line[k][1]);
      if(k)idx.push(2*k-2,2*k-1,2*k, 2*k-1,2*k+1,2*k);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setIndex(idx);
    const m=new THREE.MeshBasicMaterial({color:0xf6fbff,transparent:true,opacity:op,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8});
    const o=new THREE.Mesh(g,m);o.position.y=0.78;o.frustumCulled=false;o.userData.noWire=true;o.userData.noFingerprint=true;o.renderOrder=2;scene.add(o);
    foam.push({g,m,o,pos,base,nor,w,ph,op,n});}
  const slide=(f,off)=>{const p=f.pos;for(let k=0;k<f.n;k++){const x=f.base[2*k],z=f.base[2*k+1],nx=f.nor[2*k],nz=f.nor[2*k+1];
      p[6*k]=x+nx*(off-f.w/2);p[6*k+2]=z+nz*(off-f.w/2);p[6*k+3]=x+nx*(off+f.w/2);p[6*k+5]=z+nz*(off+f.w/2);}
    f.g.attributes.position.needsUpdate=true;};
  for(const f of foam){slide(f,0);f.g.computeBoundingSphere();}

  // ---- the boardwalk: planks on posts along the back of the ocean beach, with a skirt down to the sand ----
  const BW=PL.boardwalk||[];
  const plankTex=(()=>{const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');
    for(let i=0;i<16;i++){const v=150+Math.floor(R()*40);g.fillStyle=`rgb(${v},${Math.floor(v*0.78)},${Math.floor(v*0.56)})`;g.fillRect(i*16,0,15,64);g.fillStyle='rgba(60,40,24,0.7)';g.fillRect(i*16+15,0,1,64);}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;})();
  const deckM=new THREE.MeshLambertMaterial({map:plankTex,side:THREE.DoubleSide}),DY=2.2;
  if(BW.length>1){const pos=[],uv=[],idx=[];
   BW.forEach(([x,zb,zf],k)=>{pos.push(x,DY,zb,x,DY,zf, x,DY,zf,x,DY-1.1,zf);uv.push(x/4,0,x/4,(zf-zb)/4, x/4,0,x/4,0.3);
     if(k){const a=(k-1)*4,c=k*4;idx.push(a,a+1,c, a+1,c+1,c, a+2,a+3,c+2, a+3,c+3,c+2);}});
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
   const m=new THREE.Mesh(g,deckM);m.receiveShadow=true;m.userData.wireCat='road';scene.add(m);}

  // ---- the boardwalk's sea side: a rail on posts, and lamps ----
  const posts=BW.map(([x,,zf])=>[x,zf-0.3]);
  const postM=new THREE.MeshLambertMaterial({color:0xf2ece0}),d=new THREE.Object3D();
  if(posts.length>1){
    const pm=new THREE.InstancedMesh(new THREE.BoxGeometry(0.16,1.1,0.16).translate(0,0.55,0),postM,posts.length);
    posts.forEach(([x,z],i)=>{d.position.set(x,DY,z);d.updateMatrix();pm.setMatrixAt(i,d.matrix);});
    pm.castShadow=true;pm.userData.wireCat='road';scene.add(pm);
    const rail=new THREE.InstancedMesh(new THREE.BoxGeometry(0.14,0.12,1),postM,posts.length-1);
    for(let i=0;i+1<posts.length;i++){const [ax,az]=posts[i],[bx,bz]=posts[i+1];d.position.set((ax+bx)/2,DY+1.05,(az+bz)/2);d.rotation.set(0,Math.atan2(bx-ax,bz-az),0);d.scale.set(1,1,Math.hypot(bx-ax,bz-az));d.updateMatrix();rail.setMatrixAt(i,d.matrix);}
    rail.userData.wireCat='road';scene.add(rail);}
  const lampM=new THREE.MeshBasicMaterial({color:0xffe6a8}),poleM=new THREE.MeshLambertMaterial({color:0x3e4a52}),lamps=[];
  for(let k=3;k<BW.length;k+=8){const [x,,zf]=BW[k],z=zf-0.9;
    const p=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.12,4.2,6).translate(0,2.1,0),poleM);p.position.set(x,DY,z);scene.add(p);
    const l=new THREE.Mesh(new THREE.SphereGeometry(0.32,8,6),lampM);l.position.set(x,DY+4.3,z);l.userData.noFingerprint=true;scene.add(l);lamps.push(l);}

  const dayThings=[];let lastNight=null;   // what goes home at dusk (see the frame loop)
  // ---- the beach: umbrellas and towels on the sand in front of the boardwalk and under the cliff ----
  const umbCols=[0xe8504a,0x48a8e0,0xf6c84a,0x7ac860,0xf08cb4,0xffffff].map(c=>new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide}));
  const poleU=new THREE.MeshLambertMaterial({color:0xf0ece4});
  // one mesh per colour: forty umbrellas are not worth eighty draw calls
  const umb=new Map(),put=(m,o)=>{if(!umb.has(m))umb.set(m,[]);umb.get(m).push(o);};
  for(const [x,z] of (PL.umbrellas||[])){const y=api.groundH(x,z),k=Math.floor(R()*umbCols.length);
    const p=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,2.4,5).translate(0,1.2,0),poleU);p.position.set(x,y,z);p.rotation.z=(R()-0.5)*0.2;put(poleU,p);
    const c=new THREE.Mesh(new THREE.ConeGeometry(1.4,0.6,8,1,true).translate(0,2.3,0),umbCols[k]);c.position.set(x,y,z);c.rotation.z=p.rotation.z;put(umbCols[k],c);
    const t=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.03,1.9),umbCols[(k+2)%umbCols.length]);t.position.set(x+1.3,y+0.03,z+0.6);t.rotation.y=R()*0.6;put(umbCols[(k+2)%umbCols.length],t);}
  for(const [m,list] of umb){const g=api.mergeParts?api.mergeParts(list,m):null;if(g){g.castShadow=true;scene.add(g);dayThings.push(g);}else for(const o of list)scene.add(o);}

  // ---- sailboats on the bay, drifting back and forth ----
  const hullM=new THREE.MeshLambertMaterial({color:0xf2f2ee}),sailM=new THREE.MeshLambertMaterial({color:0xfaf8f0,side:THREE.DoubleSide});
  const boats=[];
  for(const [bx,bz] of (PL.bay||[])){const b=new THREE.Group();
    b.add(new THREE.Mesh(new THREE.BoxGeometry(6,0.9,2).translate(0,0.45,0),hullM));
    const sail=new THREE.BufferGeometry();sail.setAttribute('position',new THREE.Float32BufferAttribute([0,1,0, 0,8,0, 2.8,1,0, 0,1,0, 0,6.4,0, -2.4,1.2,0],3));sail.computeVertexNormals();
    b.add(new THREE.Mesh(sail,sailM));b.userData.noFingerprint=true;b.position.set(bx,0.6,bz);scene.add(b);boats.push({b,bx,bz,ph:R()*6.28,r:60+R()*80});}

  // ---- people: on the sand, in the water, on the boardwalk, in Dewey Park and at Funland ----
  // All of them in two instanced meshes (bodies and heads), so two hundred people are two draw calls. Each is
  // {x,y,z,lie,ang,move} and the ones that move are updated every frame.
  const surf0=(PL.surf||[[]])[0].filter((p,i,a)=>i===0||p[0]>a[i-1][0]);   // the south waterline, west to east
  const oceanZ=x=>{for(let i=0;i+1<surf0.length;i++)if(surf0[i+1][0]>=x){const a=surf0[i],b=surf0[i+1],u=(x-a[0])/((b[0]-a[0])||1);return a[1]+(b[1]-a[1])*u;}return surf0.length?surf0[surf0.length-1][1]:240;};
  const SKIN=[0xf2c8a8,0xd8a07a,0xa86a48,0x6a4430,0xf6d8c0],WEAR=[0xe8504a,0x48a8e0,0xf6c84a,0x7ac860,0xf08cb4,0x8a6ad8,0xffffff,0x2a3a5a,0xf09040];
  const folk=[];
  const person=(x,z,o)=>{const p=Object.assign({x,z,y:o&&o.y!==undefined?o.y:api.groundH(x,z),lie:false,ang:R()*6.28,wear:WEAR[Math.floor(R()*WEAR.length)],skin:SKIN[Math.floor(R()*SKIN.length)],move:null},o||{});folk.push(p);return p;};
  for(const [x,t] of (PL.beachgoers||[])){const oz=oceanZ(x),z=oz-12-t*70;if(R()<0.55)person(x,z,{lie:true,day:true});else person(x,z,{day:true});}
  // walking along the edge of the water, there and back
  for(let i=0;i<24;i++){const x0=-900+R()*1600;person(x0,oceanZ(x0)-6,{day:true,move:{kind:'shore',x0,span:60+R()*160,sp:(0.6+R()*0.8)*(R()<0.5?-1:1),ph:R()*6.28}});}
  // swimming: just the heads, bobbing, out past the surf
  for(let i=0;i<26;i++){const x=-850+R()*1500;person(x,oceanZ(x)+10+R()*30,{y:0.2,swim:true,day:true,move:{kind:'swim',ph:R()*6.28}});}
  // on the boardwalk, strolling one way or the other
  const BWX0=BW.length?BW[0][0]:-900,BWX1=BW.length?BW[BW.length-1][0]:-200;
  for(let i=0;i<44;i++){const x0=BWX0+R()*(BWX1-BWX0),k=Math.max(0,Math.min(BW.length-1,Math.round((x0-BWX0)/4))),zz=BW.length?BW[k][1]+2+R()*(BW[k][2]-BW[k][1]-4):0;
    person(x0,zz,{y:2.2,move:{kind:'walk',sp:(0.9+R()*0.6)*(R()<0.5?-1:1),lo:BWX0+5,hi:BWX1-5}});}
  // Dewey Park and Funland
  const DP=PL.sites.deweypark;if(DP)for(let i=0;i<16;i++){const a=R()*6.28,r=8+R()*30;person(DP.x+Math.cos(a)*r,DP.z+Math.sin(a)*r*0.7,{lie:R()<0.25,day:true});}
  const FL=PL.sites.funland;if(FL)for(let i=0;i<34;i++)person(FL.x+(R()-0.5)*60,FL.z+(R()-0.5)*90,{y:FL.deck||2.4,move:{kind:'mill',ph:R()*6.28,ox:0,oz:0}});
  // ---- the lifeguard stands, a volleyball game, and kites over the beach ----
  const whiteM=new THREE.MeshLambertMaterial({color:0xf6f4ee}),redM=new THREE.MeshLambertMaterial({color:0xe04040});
  const stands=[];for(const x of [-760,-380,120,380]){const z=oceanZ(x)-26,y=api.groundH(x,z),g=new THREE.Group();
    for(const [a,b] of [[-0.8,-0.8],[0.8,-0.8],[-0.8,0.8],[0.8,0.8]])g.add(new THREE.Mesh(new THREE.BoxGeometry(0.15,3,0.15).translate(a,1.5,b),whiteM));
    g.add(new THREE.Mesh(new THREE.BoxGeometry(2,0.15,2).translate(0,3,0),whiteM),new THREE.Mesh(new THREE.BoxGeometry(1.8,1.2,0.1).translate(0,3.6,-0.9),redM),
          new THREE.Mesh(new THREE.ConeGeometry(1.6,0.6,8,1,true).translate(0,5.4,0),redM),new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,2.4).translate(0,4.3,0),whiteM));
    g.position.set(x,y,z);g.userData.noFingerprint=true;scene.add(g);person(x,z,{y:y+3.1,day:true});stands.push(g);}
  const vx=-650,vz=oceanZ(-650)-40,vy=api.groundH(vx,vz);
  {const g=new THREE.Group();for(const s of [-4.5,4.5])g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,2.6).translate(0,1.3,s),whiteM));
   const net=new THREE.Mesh(new THREE.PlaneGeometry(9,0.9).rotateY(Math.PI/2).translate(0,2.1,0),new THREE.MeshLambertMaterial({color:0xf0f0f0,transparent:true,opacity:0.6,side:THREE.DoubleSide}));g.add(net);
   g.position.set(vx,vy,vz);g.userData.noFingerprint=true;scene.add(g);}
  const ball=new THREE.Mesh(new THREE.SphereGeometry(0.25,10,8),new THREE.MeshLambertMaterial({color:0xfff6c0}));ball.userData.noFingerprint=true;scene.add(ball);
  const players=[[-4,-2],[-5,2],[4,-1.5],[5,2.5]].map(([a,b])=>person(vx+a,vz+b,{y:vy,ang:a<0?0:Math.PI,day:true}));
  const kites=[];for(const x of [-820,-540,-260,300]){const z=oceanZ(x)-30,y=api.groundH(x,z),flier=person(x,z,{y,day:true});
    const k=new THREE.Mesh(new THREE.PlaneGeometry(1.6,2.2).rotateZ(Math.PI/4),new THREE.MeshLambertMaterial({color:umbCols[Math.floor(R()*5)].color,side:THREE.DoubleSide}));
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0.6}));
    k.userData.noFingerprint=line.userData.noFingerprint=true;scene.add(k,line);dayThings.push(k,line);kites.push({k,line,x,y,z,ph:R()*6.28});}

  // ---- now that everyone is made: the people's meshes ----
  // A person is four parts in four instanced meshes: legs (shorts or trousers), a torso in their shirt or swimsuit,
  // a head, and hair. Each is placed by its own matrix in the person's frame (standing, or lying on the sand), so
  // a walker's legs can swing.
  const PANTS=[0x2a3a5a,0x6a5a4a,0xe8e0d0,0x3a6a8a,0x2a2a2a],HAIR=[0x2a1a12,0x5a3a22,0xd8b060,0x1a1a1a,0xa04a2a,0x8a8a8a];
  const IMK=(geo)=>new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0xffffff}),folk.length*(geo.userData.per||1));
  const legG=new THREE.BoxGeometry(0.16,0.82,0.18).translate(0,-0.41,0);legG.userData.per=2;
  const legIM=IMK(legG),torIM=IMK(new THREE.CylinderGeometry(0.2,0.24,0.62,7).translate(0,0.31,0)),
        headIM=IMK(new THREE.SphereGeometry(0.15,8,6)),hairIM=IMK(new THREE.SphereGeometry(0.16,8,5,0,Math.PI*2,0,Math.PI*0.55));
  const bodyIM=torIM;
  const col=new THREE.Color(),PM=new THREE.Matrix4(),LM=new THREE.Matrix4(),OM=new THREE.Matrix4(),E=new THREE.Euler(),Q=new THREE.Quaternion(),ONE=new THREE.Vector3(1,1,1),V=new THREE.Vector3();
  folk.forEach((p,i)=>{const pants=p.swim?p.wear:PANTS[Math.floor(R()*PANTS.length)];legIM.setColorAt(2*i,col.setHex(pants));legIM.setColorAt(2*i+1,col);
    torIM.setColorAt(i,col.setHex(p.wear));headIM.setColorAt(i,col.setHex(p.skin));hairIM.setColorAt(i,col.setHex(HAIR[Math.floor(R()*HAIR.length)]));p.swing=0;});
  const local=(x,y,z,rx)=>{E.set(rx||0,0,0);Q.setFromEuler(E);V.set(x,y,z);return LM.compose(V,Q,ONE);};
  const placeFolk=(p,i)=>{
    if(p.hidden){PM.makeScale(0,0,0);for(const im of [torIM,headIM,hairIM])im.setMatrixAt(i,PM);legIM.setMatrixAt(2*i,PM);legIM.setMatrixAt(2*i+1,PM);return;}   // gone home
    // the person's frame: standing upright, or lying along the towel
    E.set(0,p.ang,p.lie?Math.PI/2:0,'YXZ');Q.setFromEuler(E);V.set(p.x,p.y+(p.lie?0.18:0)+(p.swim?-0.9:0),p.z);PM.compose(V,Q,ONE);
    const sw=p.swing||0;
    legIM.setMatrixAt(2*i,OM.multiplyMatrices(PM,local(0,0.82,-0.1,sw)));legIM.setMatrixAt(2*i+1,OM.multiplyMatrices(PM,local(0,0.82,0.1,-sw)));
    torIM.setMatrixAt(i,OM.multiplyMatrices(PM,local(0,0.8,0)));
    headIM.setMatrixAt(i,OM.multiplyMatrices(PM,local(0,1.58,0)));hairIM.setMatrixAt(i,OM.multiplyMatrices(PM,local(-0.02,1.6,0)));};
  folk.forEach(placeFolk);
  for(const im of [legIM,torIM,headIM,hairIM]){if(im.instanceColor)im.instanceColor.needsUpdate=true;im.castShadow=true;im.frustumCulled=false;im.userData.noFingerprint=true;scene.add(im);}

  const moving=folk.map((p,i)=>[p,i]).filter(([p])=>p.move);
  // towels under the people lying on the sand
  {const towels=[];for(const p of folk)if(p.lie&&p.y<3){const t=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.03,2),umbCols[Math.floor(R()*umbCols.length)]);t.position.set(p.x-Math.cos(p.ang)*0.6,p.y+0.03,p.z+Math.sin(p.ang)*0.6);t.rotation.y=p.ang+Math.PI/2;towels.push(t);}
   const byM=new Map();for(const t of towels){if(!byM.has(t.material))byM.set(t.material,[]);byM.get(t.material).push(t);}
   for(const [m,l] of byM){const g=api.mergeParts?api.mergeParts(l,m):null;if(g){scene.add(g);dayThings.push(g);}}}

  const at=(m,x,y,z)=>{m.position.set(x,y,z);return m;};
  // ---- Mayor Dewey's van, going round the town ----
  // White, with stripes down the side, his name on it, and loudspeakers on the roof: he is always campaigning.
  const VL=PL.vanloop||[];let van=null,vanS=0,vanLen=0;const vanSeg=[];
  if(VL.length>2){
    for(let i=0;i<VL.length;i++){const a=VL[i],b=VL[(i+1)%VL.length],l=Math.hypot(b[0]-a[0],b[1]-a[1]);vanSeg.push([a,b,l,vanLen]);vanLen+=l;}
    const side=(()=>{const c=document.createElement('canvas');c.width=256;c.height=96;const g=c.getContext('2d');g.fillStyle='#f6f4ee';g.fillRect(0,0,256,96);
      g.fillStyle='#2a4a9a';g.fillRect(0,58,256,12);g.fillStyle='#d83a3a';g.fillRect(0,72,256,8);g.fillStyle='#2a4a9a';g.font='bold 40px sans-serif';g.textAlign='center';g.fillText('DEWEY',128,44);
      return new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c)});})();
    const vw=new THREE.MeshLambertMaterial({color:0xf6f4ee}),glassM=new THREE.MeshLambertMaterial({color:0x2c3a44}),tyre=new THREE.MeshLambertMaterial({color:0x222222});
    van=new THREE.Group();
    const body=new THREE.Mesh(new THREE.BoxGeometry(5.2,2.3,2.1),[vw,vw,vw,vw,side,side]);body.position.y=1.55;van.add(body);
    van.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.1,0.9,1.8),glassM),2.62,2,0));
    for(const [a,b] of [[1.7,1.05],[1.7,-1.05],[-1.7,1.05],[-1.7,-1.05]]){const w=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,0.3,10).rotateX(Math.PI/2),tyre);w.position.set(a,0.42,b);van.add(w);}
    for(const s of [-0.5,0.5]){const h=new THREE.Mesh(new THREE.ConeGeometry(0.35,0.8,8,1,true).rotateZ(Math.PI/2),new THREE.MeshLambertMaterial({color:0xd8d8d8,side:THREE.DoubleSide}));h.position.set(0.8,3.05,s);h.rotation.y=s*0.6;van.add(h);}
    van.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.2,0.5,0.2),tyre),0.6,2.85,0));
    // a flag on a stick at the back
    van.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,1.4),vw),-2.4,3.3,0.9));
    van.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.7,0.45).translate(-0.35,0,0),new THREE.MeshLambertMaterial({color:0xd83a3a,side:THREE.DoubleSide})),-2.4,3.8,0.9));
    van.traverse(o=>{if(o.isMesh)o.castShadow=true;o.userData.noFingerprint=true;});van.userData.info={name:"Mayor Dewey's van",info:"The Mayor, going round the town in his van with the loudspeakers on the roof. He is always campaigning, whether or not there is an election."};
    scene.add(van);ctx.deweyVan=van;}
  const vanAt=s=>{s=((s%vanLen)+vanLen)%vanLen;for(const [a,b,l,s0] of vanSeg)if(s<=s0+l){const u=l?(s-s0)/l:0;return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,Math.atan2(-(b[1]-a[1]),b[0]-a[0])];}return [VL[0][0],VL[0][1],0];};

  // ---- gulls, over the beaches and the bay ----
  const birdM=new THREE.MeshLambertMaterial({color:0xf4f4f0,side:THREE.DoubleSide});
  const birdG=new THREE.BufferGeometry();birdG.setAttribute('position',new THREE.Float32BufferAttribute([-1,0.25,0.15, 0,0,-0.35, 0,0,0.35, 1,0.25,0.15, 0,0,-0.35, 0,0,0.35],3));birdG.computeVertexNormals();
  const gulls=[],G=PL.gulls||[[0,0]];
  for(let i=0;i<(K.gulls||0);i++){const m=new THREE.Mesh(birdG,birdM);m.scale.setScalar(0.55);m.userData.noWire=true;m.userData.noFingerprint=true;scene.add(m);
    const c=G[i%G.length];gulls.push({m,cx:c[0]+(R()-0.5)*160,cz:c[1]+(R()-0.5)*80,cy:12+R()*40,r:20+R()*70,w:(R()<0.5?-1:1)*(0.12+R()*0.18),ph:R()*6.28});}

  animHooks.push(now=>{
    const t=now/1000,n=nightF();
    const SEA=ctx.sea||{level:0.7,base:0.7,drain:0},drop=SEA.base-SEA.level;
    // the waterline moves out as the level falls (the sea bed shelves at about 1 in 28), and the surf goes with it
    // ...and when the sea comes back after the tower it overruns the waterline: the surge carries the foam up the beach
    const surge=SEA.surge||0,shift=Math.min(drop,10)/0.035-surge*surge*55;
    for(const f of foam){const s=Math.sin(t*0.55+f.ph);slide(f,shift-1.5-2.5*s*(1-surge));f.o.position.y=SEA.level+0.08+surge*0.9;
      f.m.opacity=Math.min(1,f.op*(0.55+0.45*Math.max(0,-s))*Math.max(0,1-SEA.drain/1.5)+surge*0.6);}
    for(const l of lamps)l.visible=n>0.25;
    // the people who move
    const dt=0.016;
    // the beach empties at dusk and fills again in the morning: nobody sunbathing, swimming, playing or flying a kite
    // in the dark; the boardwalk, Funland and the town keep their evening crowd
    const night=n>0.35;
    if(night!==lastNight){lastNight=night;folk.forEach((p,i)=>{if(p.day){p.hidden=night;placeFolk(p,i);}});for(const o of dayThings)o.visible=!night;ball.visible=!night;
      for(const im of [legIM,torIM,headIM,hairIM])im.instanceMatrix.needsUpdate=true;}
    for(const [p,i] of moving){const m=p.move;if(p.hidden)continue;
      if(m.kind==='shore'){m.ph+=dt*m.sp/m.span*2;p.x=m.x0+Math.sin(m.ph)*m.span;p.z=oceanZ(p.x)-6;p.y=api.groundH(p.x,p.z);p.ang=Math.cos(m.ph)*m.sp>0?0:Math.PI;}
      else if(m.kind==='walk'){p.x+=m.sp*dt;if(p.x>m.hi||p.x<m.lo){m.sp=-m.sp;p.x=Math.max(m.lo,Math.min(m.hi,p.x));}p.ang=m.sp>0?0:Math.PI;}
      else if(m.kind==='swim'){p.y=SEA.level-0.5+Math.sin(t*1.3+m.ph)*0.25;if(SEA.drain>0.4)p.y=-60;}   // out of the water when it goes
      else if(m.kind==='mill'){const a=t*0.15+m.ph;p.x+=Math.cos(a)*0.02;p.z+=Math.sin(a)*0.02;p.ang=-a;}
      p.swing=(m.kind==='walk'||m.kind==='shore')?Math.sin(t*5+i)*0.45:0;placeFolk(p,i);}
    for(const im of [legIM,torIM,headIM,hairIM])im.instanceMatrix.needsUpdate=true;
    // the volleyball, back and forth over the net
    {const u=(t*0.35)%1,dir=Math.floor(t*0.35)%2?1:-1;ball.position.set(vx+dir*(u*9-4.5),vy+2+Math.sin(u*Math.PI)*4,vz+Math.sin(t)*1.5);}
    for(const k of kites){const kx=k.x+Math.sin(t*0.3+k.ph)*6,ky=k.y+26+Math.sin(t*0.7+k.ph)*3,kz=k.z-14+Math.cos(t*0.4+k.ph)*4;
      k.k.position.set(kx,ky,kz);k.k.rotation.set(Math.sin(t+k.ph)*0.3,0.4,Math.sin(t*0.8+k.ph)*0.3);
      const a=k.line.geometry.attributes.position;a.setXYZ(0,k.x,k.y+1.4,k.z);a.setXYZ(1,kx,ky-1,kz);a.needsUpdate=true;}
    if(van){vanS+=9*dt;const [x,z,h]=vanAt(vanS);van.position.set(x,api.groundH(x,z),z);van.rotation.y=h;}
    for(const b of boats){const dry=SEA.drain>0.5;if(!dry){const a=b.ph+t*0.02;b.b.position.x=b.bx+Math.sin(a)*b.r;b.b.position.z=b.bz+Math.sin(a*0.7)*b.r*0.3;b.b.rotation.y=Math.cos(a)>0?0:Math.PI;}
      // on the water, or sitting on the sea bed, leaning over, when the sea has gone
      const gy=api.groundH(b.b.position.x,b.b.position.z);b.b.position.y=Math.max(SEA.level-0.1,gy+0.2);b.b.rotation.z=dry?0.25:Math.sin(t*0.8+b.ph)*0.04;}
    for(const g of gulls){const a=g.ph+t*g.w;g.m.position.set(g.cx+Math.cos(a)*g.r,g.cy+Math.sin(t*0.4+g.ph)*3,g.cz+Math.sin(a)*g.r);
      g.m.rotation.y=-a-(g.w>0?0:Math.PI);g.m.scale.y=0.55*(1+0.6*Math.sin(t*5+g.ph));}
  });
  ctx.details=Object.assign(ctx.details||{},{gulls:gulls.length,boardwalkLamps:lamps.length});
}
