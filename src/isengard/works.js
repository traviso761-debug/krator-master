// ---------- Saruman's works on the plain ----------
// Fan work from Tolkien; the geometry is this project's own.
//
// "The roads were paved with stone flags, dark and hard; and beside their borders instead of trees there marched
// long lines of pillars, some of marble, some of copper and of iron, joined by heavy chains... The plain was bored
// and delved. Shafts were driven deep into the ground; their upper ends were covered by low mounds and domes of
// stone... Iron wheels revolved there endlessly, and hammers thudded. At night plumes of vapour steamed from the
// vents, lit from beneath with red light, or blue, or venomous green."
//
// So: the forges, black and low, between the roads; the domes over the shafts, and the vents; tall iron chimneys
// with smoke going up them all the time and fire at their mouths; the pillars and chains along every road to the
// centre; orcs about the plain; and outside the Ring, the valley cut down to stumps. All of it is Saruman's, and
// goes in the Treegarth (ctx.warParts). ctx.works.quench(k) takes the fire out of it, for the flood.
import { mkRng } from '../core/rng.js';
import { createDust } from '../core/dust.js';
import { RI,RO,ROAD_A,GATE_A,clearOfPlan,plainY } from './plan.js';
import { fangornEdge } from './fangorn.js';

export function works(api){
  const {THREE,ctx,scene,animHooks,groundH,mergeParts,nightF,hour}=api;
  const R=mkRng(1400),D=new THREE.Object3D();
  const WAR=ctx.warParts=ctx.warParts||[];
  const add=o=>{o.userData.noFingerprint=true;scene.add(o);WAR.push(o);return o;};
  const fold=(list,mat)=>{const m=mergeParts(list,mat);m.castShadow=m.receiveShadow=true;return add(m);};
  const byMat=new Map();const put=m=>{let a=byMat.get(m.material);if(!a){a=[];byMat.set(m.material,a);}a.push(m);return m;};
  const stoneM=new THREE.MeshLambertMaterial({color:0x2e2c2a,flatShading:true});
  const forgeM=[0x2c2a29,0x33302d,0x282624,0x3a3531].map(c=>new THREE.MeshLambertMaterial({color:c,flatShading:true}));
  const ironM=new THREE.MeshLambertMaterial({color:0x2a2826,flatShading:true});
  const marbleM=new THREE.MeshLambertMaterial({color:0xb7b3aa}),copperM=new THREE.MeshLambertMaterial({color:0x4f7a6a}),chainM=new THREE.MeshLambertMaterial({color:0x1c1b1a});

  // ---- the forges ----
  const taken=[];
  const free=(x,z,r)=>clearOfPlan(x,z,r)&&!taken.some(([tx,tz,tr])=>Math.hypot(x-tx,z-tz)<r+tr+6);
  for(let i=0,n=0;n<70&&i<6000;i++){const a=R()*Math.PI*2,d=210+R()*(RI-300),x=Math.cos(a)*d,z=Math.sin(a)*d,w=18+R()*22,dp=12+R()*10;
    if(!free(x,z,Math.max(w,dp)/2))continue;taken.push([x,z,Math.max(w,dp)/2]);n++;
    const h=6+R()*7,y=plainY(d)-1,m=put(new THREE.Mesh(new THREE.BoxGeometry(w,h+1,dp).translate(0,(h+1)/2,0),forgeM[Math.floor(R()*4)]));m.position.set(x,y,z);m.rotation.y=-a;
    // a lean-to roof, a door with the fire behind it
    const r2=put(new THREE.Mesh(new THREE.BoxGeometry(w*0.9,1.2,dp*0.5).translate(0,0.6,0),ironM));r2.position.set(x,y+h+1,z);r2.rotation.y=-a;}

  // ---- the shafts and their domes, and the vents ----
  const domes=[],vents=[];
  for(let i=0,n=0;n<150&&i<9000;i++){const a=R()*Math.PI*2,d=200+R()*(RI-250),x=Math.cos(a)*d,z=Math.sin(a)*d,r=3.5+R()*6;
    if(!free(x,z,r+2))continue;taken.push([x,z,r]);n++;const y=plainY(d);
    const m=put(new THREE.Mesh(new THREE.SphereGeometry(r,10,6,0,Math.PI*2,0,Math.PI/2),stoneM));m.position.set(x,y-0.3,z);m.scale.y=0.55+R()*0.3;
    domes.push([x,y+r*m.scale.y,z]);
    if(R()<0.45){const vh=2+R()*4,v=put(new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.7,vh,6).translate(0,vh/2,0),ironM));v.position.set(x,y+r*m.scale.y-0.4,z);
      vents.push({x,y:y+r*m.scale.y+vh,z,ph:R()*6.28,col:R()<0.7?0:R()<0.6?1:2});}}
  // ---- the chimneys ----
  const stacks=[];
  for(let i=0,n=0;n<38&&i<6000;i++){const a=R()*Math.PI*2,d=230+R()*(RI-320),x=Math.cos(a)*d,z=Math.sin(a)*d,rr=1.4+R()*1.4;
    if(!free(x,z,rr+4))continue;taken.push([x,z,rr+2]);n++;const h=22+R()*28,y=plainY(d);
    const m=put(new THREE.Mesh(new THREE.CylinderGeometry(rr*0.8,rr*1.25,h,8).translate(0,h/2,0),ironM));m.position.set(x,y-0.5,z);
    for(let b=1;b<4;b++){const band=put(new THREE.Mesh(new THREE.CylinderGeometry(rr*1.3-b*0.1,rr*1.3-b*0.1,0.8,8),stoneM));band.position.set(x,y+h*b/4,z);}
    stacks.push({x,y:y+h,z,r:rr,ph:R()*6.28});}

  // ---- the pillars and chains ----
  // Along both sides of each road to the centre, and the way from the gate: a pillar every fourteen metres, of
  // marble, of copper, of iron, a chain sagging between each pair.
  const posts=[];
  const lineOf=(a,r0,r1,off)=>{for(let r=r0;r>r1;r-=14){const x=Math.cos(a)*r-Math.sin(a)*off,z=Math.sin(a)*r+Math.cos(a)*off;posts.push([x,plainY(Math.hypot(x,z)),z,posts.length%3]);}posts.push(null);};
  for(const a of ROAD_A)for(const sd of [-1,1])lineOf(a,RI-40,110,sd*9);
  for(const sd of [-1,1])lineOf(GATE_A,RI-12,110,sd*11);
  const PH=6.5,mats=[marbleM,copperM,ironM];
  const pil=[0,1,2].map(k=>new THREE.InstancedMesh(new THREE.CylinderGeometry(0.45,0.55,PH,6).translate(0,PH/2,0),mats[k],posts.length));
  const cnt=[0,0,0];
  for(const p of posts){if(!p)continue;D.position.set(p[0],p[1],p[2]);D.rotation.set(0,0,0);D.scale.set(1,1,1);D.updateMatrix();pil[p[3]].setMatrixAt(cnt[p[3]]++,D.matrix);}
  pil.forEach((m,k)=>{m.count=cnt[k];m.frustumCulled=false;add(m);});
  {const links=[];for(let i=0;i<posts.length-1;i++){const a=posts[i],b=posts[i+1];if(!a||!b)continue;
      for(let s=0;s<6;s++){const t0=s/6,t1=(s+1)/6,sag=t=>-1.8*4*t*(1-t);
        const p0=[a[0]+(b[0]-a[0])*t0,a[1]+PH-0.5+(b[1]-a[1])*t0+sag(t0),a[2]+(b[2]-a[2])*t0],p1=[a[0]+(b[0]-a[0])*t1,a[1]+PH-0.5+(b[1]-a[1])*t1+sag(t1),a[2]+(b[2]-a[2])*t1];links.push([p0,p1]);}}
   const ch=new THREE.InstancedMesh(new THREE.BoxGeometry(0.22,0.22,1),chainM,links.length);
   links.forEach(([p0,p1],i)=>{const dx=p1[0]-p0[0],dy=p1[1]-p0[1],dz=p1[2]-p0[2],L=Math.hypot(dx,dy,dz);
     D.position.set((p0[0]+p1[0])/2,(p0[1]+p1[1])/2,(p0[2]+p1[2])/2);D.scale.set(1,1,L);D.lookAt(p1[0],p1[1],p1[2]);D.updateMatrix();ch.setMatrixAt(i,D.matrix);});
   ch.frustumCulled=false;add(ch);}

  for(const [mat,list] of byMat)fold(list,mat);

  // ---- smoke, steam, and the fire at the chimney mouths ----
  const smoke=createDust(api,{max:9000,size:22,color:0x2a2724,drag:0.35,gravity:-1.4,wind:[3.5,0,1.5]});
  const steam=createDust(api,{max:4000,size:9,color:0xd8d6d0,drag:0.8,gravity:-1.2,wind:[2,0,1]});
  const fireM=new THREE.MeshBasicMaterial({color:0xff7a28,transparent:true,opacity:0.9,depthWrite:false,blending:THREE.AdditiveBlending});
  const fire=new THREE.InstancedMesh(new THREE.ConeGeometry(1,3.5,7).translate(0,1.75,0),fireM,stacks.length);fire.frustumCulled=false;add(fire);
  // the vents' glow at night: red, or blue, or venomous green
  const ventCols=[0xff4a1c,0x3a6cff,0x5cff3a];
  const glowM=ventCols.map(c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0.8,depthWrite:false,blending:THREE.AdditiveBlending}));
  const glow=glowM.map((m,k)=>{const im=new THREE.InstancedMesh(new THREE.SphereGeometry(1.1,8,6),m,vents.length);let n=0;
    for(const v of vents)if(v.col===k){D.position.set(v.x,v.y,v.z);D.rotation.set(0,0,0);D.scale.setScalar(1);D.updateMatrix();im.setMatrixAt(n++,D.matrix);}
    im.count=n;im.frustumCulled=false;add(im);return im;});

  // ---- orcs about the plain ----
  // Gangs of a dozen or two round the forges and the shafts, and files of them walking the roads.
  const ORC=new THREE.MeshLambertMaterial({color:0x2b2621,flatShading:true});
  const gangs=[];for(let g=0;g<40;g++){const t=taken[Math.floor(R()*taken.length)];gangs.push({x:t[0]+(R()-0.5)*30,z:t[1]+(R()-0.5)*30,n:8+Math.floor(R()*16)});}
  const nG=gangs.reduce((s,g)=>s+g.n,0),files=[];for(let f=0;f<16;f++)files.push({a:ROAD_A[f%8]+(f<8?0:Math.PI*0.0),off:(R()<0.5?-1:1)*3,n:20,ph:R(),v:(1.5+R())/700});
  const nF=files.length*20,orcs=new THREE.InstancedMesh(new THREE.BoxGeometry(0.8,1.9,0.6).translate(0,0.95,0),ORC,nG+nF);orcs.frustumCulled=false;add(orcs);
  {let i=0;for(const g of gangs)for(let k=0;k<g.n;k++){const x=g.x+(R()-0.5)*14,z=g.z+(R()-0.5)*14;D.position.set(x,plainY(Math.hypot(x,z)),z);D.rotation.set(0,R()*6.28,0);D.scale.setScalar(1.15);D.updateMatrix();orcs.setMatrixAt(i++,D.matrix);}}

  // ---- outside: the valley felled ----
  // Stumps, thousands of them, over the valley floor south and east of the Ring, where the trees were cut for the
  // furnaces; the eaves of Fangorn start where the stumps stop.
  {const N=2600,st=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5,0.7,1,6).translate(0,0.5,0),new THREE.MeshLambertMaterial({color:0x5a4634,flatShading:true}),N);let n=0;
   for(let i=0;i<N*3&&n<N;i++){const x=-2500+R()*7600,z=-2200+R()*6500,d=Math.hypot(x,z);if(d<RO+40)continue;
     if(x>fangornEdge(z)-150)continue;
     D.position.set(x,groundH(x,z)-0.1,z);D.rotation.set((R()-0.5)*0.1,R()*6,(R()-0.5)*0.1);D.scale.set(1+R(),0.6+R()*0.9,1+R());D.updateMatrix();st.setMatrixAt(n++,D.matrix);}
   st.count=n;st.frustumCulled=false;add(st);}

  // ---- what moves ----
  let quench=0,last=performance.now();
  const dFire=new THREE.Object3D();
  animHooks.push(now=>{if(ctx.war===false)return;const t=now/1000,dt=Math.min(0.05,(now-last)/1000);last=now;const n=nightF(hour()),live=1-quench;
    // smoke up the chimneys, all the time, and steam out of the vents
    for(const s of stacks){if(R()<0.55*live)smoke.emit(s.x+(R()-0.5)*s.r,s.y+1,s.z+(R()-0.5)*s.r,(R()-0.5)*1.5,5+R()*3,(R()-0.5)*1.5,14+R()*10,12+R()*10);}
    for(const v of vents)if(R()<0.07+quench*0.4)steam.emit(v.x,v.y+0.5,v.z,(R()-0.5),2+R()*2+quench*5,(R()-0.5),4+R()*4,5+R()*5+quench*8);
    stacks.forEach((s,i)=>{const k=live*(0.7+0.3*Math.sin(t*7+s.ph)+0.15*Math.sin(t*13+s.ph*2));dFire.position.set(s.x,s.y-0.4,s.z);dFire.rotation.set(0,0,0);
      dFire.scale.set(s.r*0.8*k,Math.max(0.001,k*(1+0.3*Math.sin(t*9+s.ph))),s.r*0.8*k);dFire.updateMatrix();fire.setMatrixAt(i,dFire.matrix);});
    fire.instanceMatrix.needsUpdate=true;
    glowM.forEach(m=>{m.opacity=(0.15+0.75*n)*live;});
    // the files of orcs on the roads, walking in towards the tower and out again
    let i=nG;for(const f of files){const u=((t*f.v)+f.ph)%1,out=Math.floor(((t*f.v)+f.ph))%2===1;
      for(let k=0;k<f.n;k++){let r=RI-50-(((u+k*0.004)%1)*(RI-170));if(out)r=RI-50-r+120;
        const x=Math.cos(f.a)*r-Math.sin(f.a)*f.off,z=Math.sin(f.a)*r+Math.cos(f.a)*f.off;
        D.position.set(x,plainY(Math.hypot(x,z))+Math.abs(Math.sin(t*7+k))*0.1,z);D.rotation.set(0,Math.atan2(Math.cos(f.a),Math.sin(f.a))+(out?0:Math.PI),0);D.scale.setScalar(1.15);D.updateMatrix();orcs.setMatrixAt(i++,D.matrix);}}
    orcs.instanceMatrix.needsUpdate=true;});
  ctx.works={stacks,vents,domes,taken,quench(k){quench=Math.max(0,Math.min(1,k));},get quenched(){return quench;}};
  (ctx.onWar=ctx.onWar||[]).push(()=>{quench=0;});
  ctx.details=Object.assign(ctx.details||{},{domes:domes.length,chimneys:stacks.length,vents:vents.length,pillars:posts.filter(Boolean).length});
}
