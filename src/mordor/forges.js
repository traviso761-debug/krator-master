// ---------- the works: furnace stacks over every forge-town, mine and camp the map marks, each with its fire and
// its column of smoke. This is what the land is for, and at a distance the smoke is the only way you know the
// towns are there at all. Only Mordor is built this way, so it travels with its own page instead of with the
// shared engine, and nothing is built unless the city config carries a "forges" block. ----------
import { hash3, mkRng } from '../core/rng.js';

export function forges(api){
  const {THREE,C,ctx,POIS,scene,camera,animHooks,box,col,group,groundH,nightF,hour}=api;

  const F=C.forges;if(!F)return;
  const FR=mkRng(9931),D=new THREE.Object3D();
  const KINDS=new Set(F.kinds||['forge','mine','camp']);
  const sites=POIS.filter(p=>KINDS.has(p.kind));
  if(!sites.length)return;
  // group the halls back into the towns they belong to: one smoke column to a town reads better than one to a hall
  const towns=new Map();
  for(const p of sites){let t=towns.get(p.name);if(!t){t={name:p.name,kind:p.kind,pts:[]};towns.set(p.name,t);}t.pts.push(p);}
  const stackM=new THREE.MeshPhongMaterial({color:0x2b2723,specular:0x3a342c,shininess:6,flatShading:true});
  const fireM=new THREE.MeshBasicMaterial({color:0xff7a1e,transparent:true,opacity:0.9});
  const mouthM=new THREE.MeshBasicMaterial({color:0xff5a10,transparent:true,opacity:0.8});
  const smokeM=new THREE.MeshLambertMaterial({color:0x2e2a26,transparent:true,opacity:0.2,depthWrite:false});
  // ---- the hearths of Nurn ----
  // Not works: cook fires in the hamlets along the shore and at the granaries, which are the only lights in
  // the south of the country. A stack here would be a ninety-five metre chimney over a fishing village.
  {
    const hs=POIS.filter(p=>p.kind==='hearth');
    if(hs.length){
      const hM=new THREE.MeshBasicMaterial({color:0xff8a2e,transparent:true,opacity:0.85});
      const hSm=new THREE.MeshLambertMaterial({color:0x2e2a26,transparent:true,opacity:0.16,depthWrite:false});
      const fire=new THREE.InstancedMesh(new THREE.ConeGeometry(26,90,6).translate(0,45,0),hM,hs.length);
      const sm=new THREE.InstancedMesh(new THREE.SphereGeometry(48,7,5),hSm,hs.length);
      fire.userData.noWire=sm.userData.noWire=true;
      hs.forEach((p,i)=>{const gy=groundH(p.x,p.z);
        D.position.set(p.x,gy+4,p.z);D.rotation.set(0,FR()*6.28,0);D.scale.set(1,1,1);D.updateMatrix();
        fire.setMatrixAt(i,D.matrix);
        D.position.set(p.x+40,gy+120,p.z+20);D.scale.set(1,1.6,1);D.updateMatrix();sm.setMatrixAt(i,D.matrix);});
      fire.count=sm.count=hs.length;fire.frustumCulled=sm.frustumCulled=false;
      scene.add(fire,sm);
      ctx.details=Object.assign(ctx.details||{},{hearths:hs.length});
      let t0=performance.now();
      animHooks.push(now=>{const t=(now-t0)/1000;
        hs.forEach((p,i)=>{const gy=groundH(p.x,p.z);
          D.position.set(p.x,gy+4,p.z);D.rotation.set(0,0,0);
          D.scale.set(0.8+0.3*Math.sin(t*5+i),0.8+0.4*Math.sin(t*7+i),0.8+0.3*Math.cos(t*4+i));
          D.updateMatrix();fire.setMatrixAt(i,D.matrix);});
        fire.instanceMatrix.needsUpdate=true;});
    }
  }
  const H=F.stack||95,SC=F.scale||1;
  const stacks=[],fires=[],columns=[];
  let nStack=0;
  for(const t of towns.values()){
    // a stack to each hall, up to a few: chimneys, a lit furnace mouth at the foot
    const use=t.pts.slice(0,F.perTown||4);
    for(const p of use){
      const gy=groundH(p.x,p.z),h=H*SC*(0.7+FR()*0.7);
      const st=new THREE.Mesh(new THREE.CylinderGeometry(4.5*SC,8*SC,h,8).translate(0,h/2,0),stackM);
      st.position.set(p.x,gy,p.z);scene.add(st);stacks.push(st);nStack++;
      const cap=new THREE.Mesh(new THREE.CylinderGeometry(9*SC,5*SC,10*SC,8).translate(0,5*SC,0),stackM);
      cap.position.set(p.x,gy+h,p.z);scene.add(cap);
      const fl=new THREE.Mesh(new THREE.ConeGeometry(6*SC,26*SC,6).translate(0,13*SC,0),fireM);
      fl.position.set(p.x,gy+h+8*SC,p.z);scene.add(fl);fires.push({fl,ph:FR()*6.28});
      const mouth=new THREE.Mesh(new THREE.BoxGeometry(26*SC,12*SC,4*SC),mouthM);
      mouth.position.set(p.x,gy+7*SC,p.z+16*SC);scene.add(mouth);
    }
    // one column of smoke to the town, leaning away downwind and spreading as it goes
    const c=use[Math.floor(use.length/2)]||t.pts[0];
    const gy=groundH(c.x,c.z),n=F.puffs||7;
    const col=[];
    for(let k=0;k<n;k++){const p=new THREE.Mesh(new THREE.SphereGeometry(22*SC,7,5),smokeM);
      p.userData.t=k/n;scene.add(p);col.push(p);}
    columns.push({col,x:c.x,y:gy+H*SC,z:c.z,ph:FR()*6.28});
  }
  const RISE=F.rise||1400,DRIFT=F.drift||2600;
  animHooks.push(now=>{
    const nf=nightF(hour()),burn=0.7+0.3*Math.sin(now*0.0016);
    fireM.opacity=(0.55+0.4*nf)*burn;mouthM.opacity=(0.45+0.45*nf)*burn;
    for(const q of fires){const k=0.6+0.5*Math.sin(now*0.007+q.ph);q.fl.scale.set(0.8+0.3*k,k,0.8+0.3*k);}
    for(const c of columns)for(let i=0;i<c.col.length;i++){const p=c.col[i];
      const t=((now*0.000055)+p.userData.t+c.ph*0.1)%1;
      p.position.set(c.x+DRIFT*t*t,c.y+RISE*Math.pow(t,0.9),c.z+DRIFT*t*t*0.4);
      p.scale.setScalar(0.6+3.4*t);}
    smokeM.opacity=0.2;});
  // ---- the fissures: the plateau is cracked open and the fire under it shows through ----
  let fissures=0;
  {const cracks=POIS.filter(p=>p.kind==='fissure');
   const crackM=new THREE.MeshBasicMaterial({color:0xff5a12,transparent:true,opacity:0.85});
   const lipM=new THREE.MeshPhongMaterial({color:0x1d1a17,specular:0x2e2a24,shininess:5,flatShading:true});
   const glowM=new THREE.MeshBasicMaterial({color:0xff6a1a,transparent:true,opacity:0.12,depthWrite:false});
   const glows=[];
   for(const p of cracks){const gy=groundH(p.x,p.z),len=(F.fissure||2600)*(0.5+hash3(p.x,p.z,5)*1.4),w=len*0.05;
     const arm=new THREE.Group();arm.position.set(p.x,gy,p.z);arm.rotation.y=-p.ang;scene.add(arm);
     const fire=new THREE.Mesh(new THREE.BoxGeometry(len,3,w),crackM);fire.position.y=1.5;arm.add(fire);
     for(const sd of [-1,1]){const lip=new THREE.Mesh(new THREE.BoxGeometry(len*1.05,22,w*0.8),lipM);
       lip.position.set(0,7,sd*w*0.85);arm.add(lip);}
     const gl=new THREE.Mesh(new THREE.SphereGeometry(len*0.45,8,6),glowM);
     gl.scale.set(1,0.3,0.4);gl.position.set(p.x,gy+len*0.06,p.z);gl.userData.noShadow=true;scene.add(gl);
     glows.push({gl,ph:FR()*6.28});fissures++;}
   if(fissures)animHooks.push(now=>{const n=nightF(hour());
     crackM.opacity=0.7+0.25*Math.sin(now*0.0013);
     glowM.opacity=(0.08+0.12*n)*(0.7+0.3*Math.sin(now*0.0009));
     for(const q of glows)q.gl.scale.y=0.26+0.1*Math.sin(now*0.0017+q.ph);});}

  // ---- ash, falling all the time ----
  if(F.ash){const n=F.ash,pos=new Float32Array(n*3),vel=new Float32Array(n);
   const SPREAD=(F.ashSpread||2600),TOP=(F.ashTop||900);
   for(let i=0;i<n;i++){pos[i*3]=(FR()-0.5)*SPREAD;pos[i*3+1]=FR()*TOP;pos[i*3+2]=(FR()-0.5)*SPREAD;vel[i]=3+FR()*5;}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
   const am=new THREE.PointsMaterial({color:0x796f66,size:(F.ashSize||1.4),transparent:true,opacity:(F.ashOpacity||0.33),sizeAttenuation:true,depthWrite:false});
   const pts=new THREE.Points(g,am);pts.frustumCulled=false;scene.add(pts);
   let last=performance.now();
   animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;
     for(let i=0;i<n;i++){let y=pos[i*3+1]-vel[i]*dt;
       if(y<0){y=TOP;pos[i*3]=(FR()-0.5)*SPREAD;pos[i*3+2]=(FR()-0.5)*SPREAD;}
       pos[i*3+1]=y;pos[i*3]+=dt*2.2;}
     g.attributes.position.needsUpdate=true;
     pts.position.set(camera.position.x,camera.position.y-TOP*0.5,camera.position.z);});}

  ctx.details=Object.assign(ctx.details||{},{forgeTowns:towns.size,forgeStacks:nStack,fissures});
}
