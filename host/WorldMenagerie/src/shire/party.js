// ---------- the Long-expected Party ----------
// Fan work; Tolkien's world belongs to the Tolkien Estate and every shape here is this project's own.
//
// Bilbo's eleventy-first birthday, in the Party Field below the Hill. The book has "ropes and poles, lanterns,
// tents, pavilions, and a new gate", and a pavilion so big that the Party Tree stands inside it; the film leaves
// the tree in the open, strung with lanterns and bunting over a dance floor, with the marquee and the
// pavilions round the field - and at night Gandalf's fireworks, the last of them a dragon that comes down over
// the field like a real one and bursts. This is the film's version, with the book's new gate.
//
// Off until asked for: the Party button, or #party in the address. The fireworks only go up after dark.

import { mkRng } from '../core/rng.js';

export function party(api){
  const {THREE,ctx,scene,groundH,mergeParts,animHooks}=api;
  const V=ctx.plan;if(!V)return;
  const R=mkRng(111);
  const S=V.sites,T=S.partyTree,y0=T.y,P=S.pond;
  const inPond=(x,z,m)=>((x-P.x)/(P.rx+m))**2+((z-P.z)/(P.rz+m))**2<1;
  const g=new THREE.Group();g.name='party';g.visible=/(^|&)party(&|$)/.test(api.HASH0||'');scene.add(g);
  const byMat=new Map(),mats={};const matOf=(c,o)=>{const k=c+(o?'b':'');return mats[k]||(mats[k]=o?new THREE.MeshBasicMaterial({color:c}):new THREE.MeshLambertMaterial({color:c,flatShading:true,side:THREE.DoubleSide}));};
  const put=(geo,c,x,y,z,ry,basic)=>{const m=new THREE.Mesh(geo,matOf(c,basic));m.position.set(x,y,z);m.rotation.y=ry||0;
    if(!byMat.has(m.material))byMat.set(m.material,[]);byMat.get(m.material).push(m);return m;};
  const gy=(x,z)=>groundH(x,z);

  // ---- the marquee: a long white tent of three peaks, open at the sides, on timber poles ----
  const MX=T.x-58,MZ=T.z-6,ML=34,MW=16;
  for(let i=0;i<=6;i++)for(const w of [-MW/2,MW/2]){const x=MX-ML/2+i*ML/6;put(new THREE.CylinderGeometry(0.12,0.12,3.2,6).translate(0,1.6,0),0x8a6a48,x,gy(x,MZ+w),MZ+w);}
  for(let k=0;k<3;k++){const x=MX-ML/3+k*ML/3;const c=new THREE.ConeGeometry(Math.SQRT2/2,1,4,1).rotateY(Math.PI/4);c.scale(ML/3+0.4,5.2,MW+0.6);c.translate(0,2.6,0);
    put(c,k===1?0xf4efe4:0xece6d6,x,y0+3.2,MZ);put(new THREE.ConeGeometry(0.1,1.6,5),0xc8384a,x,y0+9,MZ);}
  put(new THREE.BoxGeometry(ML+0.2,0.6,MW+0.2).translate(0,0,0),0xd8384a,MX,y0+3.0,MZ);                       // the valance, red
  for(let r=0;r<3;r++)for(let c=0;c<2;c++){const x=MX-ML/2+4+r*11,z=MZ-3+c*6;put(new THREE.BoxGeometry(9,0.1,1.4).translate(0,0.8,0),0xa07a52,x,gy(x,z),z);
    for(const sd of [-1,1])put(new THREE.BoxGeometry(9,0.1,0.4).translate(0,0.45,0),0x8a6a48,x,gy(x,z+sd*1.2),z+sd*1.2);}
  // ---- the pavilions round the field ----
  const PAV=[[T.x+30,T.z-60,0xf0d890],[T.x+62,T.z+14,0xf4efe4],[T.x-10,T.z+58,0xe8a0a0],[T.x-96,T.z+40,0xf4efe4],[T.x+50,T.z-24,0xb8d8e8]];
  for(const [x,z,c] of PAV){const y=gy(x,z);for(const [dx,dz] of [[-3,-3],[3,-3],[3,3],[-3,3]])put(new THREE.CylinderGeometry(0.08,0.08,2.6,5).translate(0,1.3,0),0x8a6a48,x+dx,y,z+dz);
    const cn=new THREE.ConeGeometry(Math.SQRT2/2,1,4,1).rotateY(Math.PI/4);cn.scale(6.6,3.4,6.6);cn.translate(0,1.7,0);put(cn,c,x,y+2.6,z);
    put(new THREE.BoxGeometry(0.5,0.4,0.02),0xc8384a,x,y+6.3,z);put(new THREE.CylinderGeometry(0.03,0.03,1.4,4).translate(0,0.7,0),0x8a6a48,x,y+5.9,z);}
  // ---- the dance floor under the tree, and a stand for the band ----
  put(new THREE.BoxGeometry(16,0.3,14).translate(0,0.15,0),0xb08a60,T.x+14,y0,T.z+14);
  put(new THREE.BoxGeometry(6,1.0,4).translate(0,0.5,0),0x9a7a52,T.x+26,y0,T.z+26);
  // ---- the new gate, where the Hill lane comes down to the field ----
  {const x=T.x+86,z=T.z-40,y=gy(x,z);for(const d of [-2,2])put(new THREE.BoxGeometry(0.4,4,0.4).translate(0,2,0),0x8a6a48,x,y,z+d);
    put(new THREE.BoxGeometry(0.5,1.0,5).translate(0,4.3,0),0x7a9a4a,x,y,z);}

  // ---- bunting and lanterns: strung out from the tree to poles round the field ----
  const flagG=new THREE.BufferGeometry();flagG.setAttribute('position',new THREE.Float32BufferAttribute([-0.25,0,0,0.25,0,0,0,-0.5,0],3));flagG.computeVertexNormals();
  const FLAG=[0xd8384a,0xf0c830,0x3a8ad8,0x4aa84a,0xf4efe4,0xe07a24];
  const flags=[],lamps=[];
  const hub=[T.x,y0+11,T.z];
  for(let k=0;k<14;k++){const a=k/14*6.28,r=34+R()*14,px=T.x+Math.cos(a)*r,pz=T.z+Math.sin(a)*r,py=gy(px,pz);
    put(new THREE.CylinderGeometry(0.1,0.1,6,5).translate(0,3,0),0x8a6a48,px,py,pz);
    const end=[px,py+6,pz],n=Math.round(r/0.8);
    for(let i=1;i<n;i++){const t=i/n,x=hub[0]+(end[0]-hub[0])*t,z=hub[2]+(end[2]-hub[2])*t,y=hub[1]+(end[1]-hub[1])*t-4.5*4*t*(1-t);
      if(k%2===0)flags.push({x,y,z,ry:a+Math.PI/2,c:FLAG[i%FLAG.length]});else if(i%3===0)lamps.push([x,y-0.3,z]);}}
  const fm=new THREE.InstancedMesh(flagG,new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide}),flags.length);
  const o=new THREE.Object3D(),col=new THREE.Color();
  flags.forEach((f,i)=>{o.position.set(f.x,f.y,f.z);o.rotation.set(0,f.ry,0);o.scale.setScalar(1);o.updateMatrix();fm.setMatrixAt(i,o.matrix);fm.setColorAt(i,col.setHex(f.c));});
  fm.frustumCulled=false;g.add(fm);
  const lampM=new THREE.MeshBasicMaterial({color:0xffe0a0});
  const lm=new THREE.InstancedMesh(new THREE.SphereGeometry(0.22,8,6),lampM,lamps.length);lamps.forEach(([x,y,z],i)=>{o.position.set(x,y,z);o.updateMatrix();lm.setMatrixAt(i,o.matrix);});
  lm.frustumCulled=false;g.add(lm);
  for(const [m,list] of byMat){const mm=mergeParts(list,m);if(mm){mm.castShadow=true;mm.receiveShadow=true;g.add(mm);}}

  // ---- the guests ----
  const N=140,CLOTH=[0xd8b83a,0x4a8a3a,0x8a5a2a,0x3a6a8a,0xb85a3a,0x6a8a2a,0xe0d0a0,0xc8506a];
  const gb=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22,0.3,0.75,8).translate(0,0.55,0),new THREE.MeshLambertMaterial({color:0xffffff}),N);
  const gh=new THREE.InstancedMesh(new THREE.SphereGeometry(0.17,8,6).translate(0,1.08,0),new THREE.MeshLambertMaterial({color:0xe8c8a8}),N);
  const guests=[];for(let i=0;i<N;i++){const dancing=i<40;let x,z;
    do{const a=R()*6.28,r=dancing?Math.sqrt(R())*6:8+R()*50;x=(dancing?T.x+14:T.x)+Math.cos(a)*r*(dancing?1:1.1);z=(dancing?T.z+14:T.z)+Math.sin(a)*r*0.8;}while(inPond(x,z,3));guests.push({x,z,y:gy(x,z)+(dancing?0.3:0),ph:R()*6.28,d:dancing});gb.setColorAt(i,col.setHex(CLOTH[i%CLOTH.length]));}
  gb.instanceColor.needsUpdate=true;for(const m of [gb,gh]){m.frustumCulled=false;m.userData.noFingerprint=true;g.add(m);}

  // ---- the fireworks ----
  const MAXP=4000,pos=new Float32Array(MAXP*3),colA=new Float32Array(MAXP*3),vel=new Float32Array(MAXP*3),life=new Float32Array(MAXP);
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));pg.setAttribute('color',new THREE.BufferAttribute(colA,3).setUsage(THREE.DynamicDrawUsage));
  const pts=new THREE.Points(pg,new THREE.PointsMaterial({size:3.2,sizeAttenuation:false,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
  pts.frustumCulled=false;pts.userData.noFingerprint=true;pts.userData.noWire=true;g.add(pts);
  let next=0;const PAL=[[1,0.8,0.3],[1,0.3,0.25],[0.4,1,0.5],[0.5,0.7,1],[1,1,1],[1,0.5,0.9]];
  function burst(x,y,z,n,speed,c){for(let k=0;k<n;k++){const i=next;next=(next+1)%MAXP;
    const u=Math.random()*2-1,a=Math.random()*6.28,s=Math.sqrt(1-u*u),v=speed*(0.7+Math.random()*0.3);
    pos[i*3]=x;pos[i*3+1]=y;pos[i*3+2]=z;vel[i*3]=Math.cos(a)*s*v;vel[i*3+1]=u*v;vel[i*3+2]=Math.sin(a)*s*v;life[i]=1.6+Math.random()*0.8;
    colA[i*3]=c[0];colA[i*3+1]=c[1];colA[i*3+2]=c[2];}}
  // The dragon: points in the shape of one - a sinuous body, a head, two great wings - flying in low over the
  // Water towards the field, wings beating, until it bursts over the tree.
  const DR=[];{for(let k=0;k<60;k++){const t=k/59;DR.push([-18+t*36,Math.sin(t*6.28*1.2)*1.4,0,'body']);}
    for(let k=0;k<14;k++)DR.push([18+k*0.3,0.6+Math.sin(k)*0.3,(k%3-1)*0.4,'head']);
    for(let side of [-1,1])for(let k=0;k<70;k++){const t=k/69;DR.push([-4+t*10-(t*t)*6,0.5,side*(1+t*16),'wing']);}
    for(let k=0;k<30;k++){const t=k/29;DR.push([-18-t*14,Math.sin(t*9)*1.2,Math.cos(t*7)*0.8,'tail']);}}
  const dPos=new Float32Array(DR.length*3),dCol=new Float32Array(DR.length*3);
  DR.forEach((p,i)=>{const c=p[3]==='wing'?[1,0.55,0.15]:p[3]==='head'?[1,0.95,0.6]:[1,0.3,0.1];dCol.set(c,i*3);});
  const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(dPos,3).setUsage(THREE.DynamicDrawUsage));dg.setAttribute('color',new THREE.BufferAttribute(dCol,3));
  const dragon=new THREE.Points(dg,new THREE.PointsMaterial({size:3.8,sizeAttenuation:false,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
  dragon.frustumCulled=false;dragon.visible=false;dragon.userData.noFingerprint=true;dragon.userData.noWire=true;g.add(dragon);
  let lastT=0,nextBurst=0,dragonT=-1,nextDragon=12;

  animHooks.push(now=>{
    if(!g.visible)return;
    const t=now/1000,dt=Math.min(0.05,t-(lastT||t));lastT=t;
    guests.forEach((q,i)=>{const b=q.d?Math.abs(Math.sin(t*4+q.ph))*0.25:0;o.position.set(q.x+(q.d?Math.cos(t*0.8+q.ph)*1.5:0),q.y+b,q.z+(q.d?Math.sin(t*0.8+q.ph)*1.5:0));o.rotation.set(0,t*(q.d?1.5:0)+q.ph,0);o.updateMatrix();gb.setMatrixAt(i,o.matrix);gh.setMatrixAt(i,o.matrix);});
    gb.instanceMatrix.needsUpdate=gh.instanceMatrix.needsUpdate=true;
    const night=api.nightF?api.nightF(api.hour()):0;
    lampM.color.setRGB(0.6+0.4*night,0.5+0.38*night,0.3+0.3*night);
    if(night>0.5){
      if(t>nextBurst){nextBurst=t+0.8+Math.random()*1.6;burst(T.x+(Math.random()-0.5)*120,y0+30+Math.random()*30,T.z+(Math.random()-0.5)*90,160,18+Math.random()*10,PAL[Math.floor(Math.random()*PAL.length)]);}
      if(dragonT<0&&t>nextDragon){dragonT=0;dragon.visible=true;}
    }
    if(dragonT>=0){dragonT+=dt;const k=Math.min(1,dragonT/9);
      const sx=T.x+260-k*260,sz=T.z+220-k*220,sy=y0+30-k*8;const flap=Math.sin(dragonT*5),ang=Math.atan2(-220,-260);
      const ca=Math.cos(ang),sa=Math.sin(ang);
      DR.forEach((p,i)=>{let [x,y,z,kind]=p;if(kind==='wing')y+=flap*Math.abs(z)*0.35;if(kind==='body'||kind==='tail')y+=Math.sin(dragonT*3+x*0.2)*0.8;
        dPos[i*3]=sx+x*ca-z*sa;dPos[i*3+1]=sy+y;dPos[i*3+2]=sz+x*sa+z*ca;});
      dg.attributes.position.needsUpdate=true;
      if(k>=1){dragon.visible=false;dragonT=-1;nextDragon=t+45;for(const c of PAL)burst(T.x,y0+26,T.z,260,26,c);}}
    for(let i=0;i<MAXP;i++){if(life[i]<=0){colA[i*3]*=0.8;colA[i*3+1]*=0.8;colA[i*3+2]*=0.8;continue;}
      life[i]-=dt;vel[i*3+1]-=6*dt;pos[i*3]+=vel[i*3]*dt;pos[i*3+1]+=vel[i*3+1]*dt;pos[i*3+2]+=vel[i*3+2]*dt;
      const f=Math.max(0,Math.min(1,life[i]));colA[i*3]*=0.985;colA[i*3+1]*=0.985;colA[i*3+2]*=0.985;if(f<0.3){colA[i*3]*=0.9;colA[i*3+1]*=0.9;colA[i*3+2]*=0.9;}}
    pg.attributes.position.needsUpdate=true;pg.attributes.color.needsUpdate=true;
  });
  api.onUI(({ui,mkBtn})=>{const b=mkBtn(g.visible?'Party: on':'The Party',ui,()=>{g.visible=!g.visible;b.textContent=g.visible?'Party: on':'The Party';b.setAttribute('aria-pressed',String(g.visible));});
    b.setAttribute('aria-pressed',String(g.visible));b.title='Bilbo\'s eleventy-first birthday in the Party Field; fireworks after dark';});
  (ctx.shireCards=ctx.shireCards||[]).push({x:T.x,z:T.z,r:30,info:{name:'The Party Field',info:'Below the Hill, with the Party Tree in the middle of it - in the films a great pine by a little lake. Bilbo\'s eleventy-first birthday was held here: a marquee and pavilions, lanterns and bunting in the tree, dancing, and at night Gandalf\'s fireworks, the last of them a dragon. Press The Party.'}});
}
