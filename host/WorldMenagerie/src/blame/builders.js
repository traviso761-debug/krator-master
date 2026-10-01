// ---------- the Builders, at work ----------
// In Blame! the City is still being built. The Builders - machines, some of them the size of buildings - have
// had nobody to tell them what to build for thousands of years, so they build whatever they build, and they
// have not stopped. This page's Builders are its own design: a long pale body on six legs, a head with one
// lens, and an arm that reaches down in front and lays down wall.
//
// Each works a site (detail.js picks them): a wall going up course by course. The Builder walks the length of
// the top of the wall laying the next course behind its arm, turns round at the end, steps up and comes back.
// A course takes it anything from ten seconds to a minute. The wall under it is two instances - everything
// finished, and the course being laid - so a site costs two matrices a frame however tall it has got.
//
// The Builders themselves are instanced too: every body is one instance of one mesh, every leg segment one of
// another, and so on, so twenty Builders are six draw calls. Each has an Object3D skeleton that is never
// added to the scene; it is posed every frame and its parts' world matrices copied into the instances.
//
// There is also traffic: lifts running up and down the column, the pylons of the Plain and the faces of the
// machine towers, each with a light. It is the only other thing in the City that visibly moves.
//
// Nothing here is in the fingerprint: it moves, and what moves is not layout.

export function makeBuilders(api){
  const {THREE,scene,mats,M,sites,lifts}=api;
  const group=new THREE.Group();group.userData.noWire=true;scene.add(group);
  const bodyMat=mats.mk('machine',{color:0xd7d9dc}),limbMat=new THREE.MeshLambertMaterial({color:0x3a3c40}),
        lensMat=new THREE.MeshBasicMaterial({color:0xe8f0ff}),tipMat=new THREE.MeshBasicMaterial({color:0xffc890});
  const boxC=new THREE.BoxGeometry(1,1,1),boxTop=new THREE.BoxGeometry(1,1,1).translate(0,-0.5,0);
  const n=sites.length;
  const PARTS={body:{geo:boxC,mat:bodyMat,per:10},limb:{geo:boxTop,mat:limbMat,per:13},lens:{geo:boxC,mat:lensMat,per:1},tip:{geo:boxC,mat:tipMat,per:1}};
  const IM={};
  for(const k in PARTS){const p=PARTS[k];const im=new THREE.InstancedMesh(p.geo,p.mat,Math.max(1,n*p.per));im.frustumCulled=false;
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.userData.kind='builder';group.add(im);IM[k]=im;}
  // the walls, by material
  const wallIM={};
  for(const key of ['arcade','machine','concrete']){const c=sites.filter(s=>s.mat===key).length;if(!c)continue;
    const im=new THREE.InstancedMesh(boxC,M[key],c*2);im.frustumCulled=false;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.userData.kind='builder-wall';const col=new THREE.Color();for(let i=0;i<c*2;i++)im.setColorAt(i,col.setScalar(i%2?0.9:0.74));
    group.add(im);wallIM[key]={im,next:0};}

  // ---- a Builder's skeleton, one unit long; the site scales it ----
  function skeleton(){
    const root=new THREE.Object3D();const parts=[];
    const part=(kind,parent,px,py,pz,sx,sy,sz)=>{const o=new THREE.Object3D();o.position.set(px,py,pz);o.scale.set(sx,sy,sz);parent.add(o);parts.push({o,kind});return o;};
    const pivot=(parent,px,py,pz)=>{const o=new THREE.Object3D();o.position.set(px,py,pz);parent.add(o);return o;};
    const hull=pivot(root,0,0.62,0);
    part('body',hull,0,0,0,0.5,0.3,1.0);
    part('body',hull,0,0.2,-0.12,0.4,0.16,0.56);
    part('body',hull,0,0.05,-0.6,0.36,0.2,0.24);
    const head=pivot(hull,0,0.02,0.56);
    part('body',head,0,0,0.1,0.3,0.24,0.26);
    part('lens',head,0,0.03,0.24,0.1,0.1,0.03);
    const arm=pivot(head,0,-0.08,0.18);
    part('limb',arm,0,0,0,0.07,0.55,0.07);
    part('tip',arm,0,-0.57,0,0.1,0.07,0.1);
    const legs=[];
    for(const sx of [-1,1])for(const [i,z] of [[0,0.34],[1,0],[2,-0.34]]){
      const hip=pivot(hull,sx*0.24,-0.04,z);
      const up=pivot(hip,0,0,0);part('limb',up,0,0,0,0.06,0.42,0.06);
      const knee=pivot(up,0,-0.42,0);part('limb',knee,0,0,0,0.05,0.76,0.05);part('body',knee,0,-0.76,0,0.09,0.05,0.09);
      legs.push({hip,up,knee,sx,ph:(i+(sx>0?1:0))%2*Math.PI});
    }
    return {root,parts,hull,head,arm,legs};
  }
  const B=sites.map((s,i)=>{const k=skeleton();k.site=s;s.off=(i*37.7)%97;s.speed=Math.max(1.2,s.size*0.18);
    const w=wallIM[s.mat];s.wi=w.next;w.next+=2;return k;});

  // sparks at every arm, and the lights on the lifts: one Points, rewritten every frame
  const NS=10,NL=lifts.length;
  const pos=new Float32Array((n*NS+NL)*3),colA=new Float32Array((n*NS+NL)*3);
  for(let i=0;i<n*NS;i++){colA.set([1,0.8,0.5],i*3);}
  for(let i=0;i<NL;i++){colA.set(lifts[i].warm?[1,0.8,0.55]:[0.85,0.92,1],(n*NS+i)*3);}
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));
  pg.setAttribute('color',new THREE.BufferAttribute(colA,3));
  const pts=new THREE.Points(pg,new THREE.PointsMaterial({size:3,sizeAttenuation:false,map:api.dot,vertexColors:true,transparent:true,depthWrite:false,alphaTest:0.02}));
  pts.frustumCulled=false;group.add(pts);
  // the lift cabins
  const liftIM=new THREE.InstancedMesh(boxC,new THREE.MeshLambertMaterial({color:0x9a9ca0,emissive:0x2a2418}),Math.max(1,NL));
  liftIM.frustumCulled=false;liftIM.instanceMatrix.setUsage(THREE.DynamicDrawUsage);group.add(liftIM);

  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),sv=new THREE.Vector3(),e=new THREE.Euler();
  let seed=1;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
  function update(nowMs){
    const t=nowMs/1000;
    const cnt={body:0,limb:0,lens:0,tip:0};
    B.forEach((k,bi)=>{
      const s=k.site;
      // where the wall has got to: courses finished, and how far along the one being laid
      const D=s.speed*(t+s.off*20),per=s.L;
      let done=Math.floor(D/per);const along=D-done*per;
      const span=Math.max(1,Math.floor(s.max-s.n0));done=Math.floor(s.n0)+(done%span);
      const dir=done%2?-1:1;
      const cs=Math.cos(s.ang),sn=Math.sin(s.ang);
      const toW=(u,y,w)=>v.set(s.x+cs*u-sn*w,y,s.z-sn*u-cs*w);
      // the finished wall, and the course going down
      const w=wallIM[s.mat].im,hDone=done*s.hc;
      if(hDone>0){toW(0,s.y+hDone/2,0);e.set(0,s.ang,0);q.setFromEuler(e);m4.compose(v,q,sv.set(per,hDone,s.w));}
      else m4.makeScale(0,0,0);
      w.setMatrixAt(s.wi,m4);
      const u0=dir>0?-per/2:per/2-along;
      toW(u0+along/2,s.y+hDone+s.hc/2,0);q.setFromEuler(e.set(0,s.ang,0));m4.compose(v,q,sv.set(Math.max(0.01,along),s.hc,s.w));
      w.setMatrixAt(s.wi+1,m4);
      // the Builder: astride the new course, just behind where it is laying it
      const front=dir>0?-per/2+along:per/2-along;
      const sz=s.size,bu=front-dir*sz*0.55;
      toW(bu,s.y+hDone+s.hc,0);
      k.root.position.copy(v);k.root.rotation.set(0,s.ang+(dir>0?Math.PI/2:-Math.PI/2),0);k.root.scale.setScalar(sz);
      // walking: a tripod gait, stride set by the distance covered
      const ph=along/(sz*0.35);
      for(const L of k.legs){const a=Math.sin(ph+L.ph);
        L.hip.rotation.set(0,a*0.35*L.sx,0);const lift=Math.max(0,Math.cos(ph+L.ph));L.up.rotation.set(0,0,L.sx*(2.0+lift*0.2));L.knee.rotation.set(0,0,-L.sx*(1.9+lift*0.35));}
      k.hull.position.y=0.62+Math.sin(ph*2)*0.012;
      k.head.rotation.x=Math.sin(t*0.7+bi)*0.08;
      k.arm.rotation.x=-0.55+Math.sin(t*6+bi)*0.12;
      k.root.updateMatrixWorld(true);
      for(const p of k.parts){IM[p.kind].setMatrixAt(cnt[p.kind]++,p.o.matrixWorld);}
      // sparks, where the arm meets the wall
      const tipW=v.setFromMatrixPosition(k.parts.find(p=>p.kind==='tip').o.matrixWorld);
      const flick=Math.sin(t*23+bi*3)>-0.3;
      for(let i=0;i<NS;i++){const j=(bi*NS+i)*3;
        if(flick){pos[j]=tipW.x+(rnd()-0.5)*sz*0.25;pos[j+1]=tipW.y+(rnd()-0.3)*sz*0.18;pos[j+2]=tipW.z+(rnd()-0.5)*sz*0.25;}
        else{pos[j]=pos[j+1]=pos[j+2]=-1e7;}}
    });
    for(const k in IM){IM[k].count=cnt[k];IM[k].instanceMatrix.needsUpdate=true;}
    for(const k in wallIM)wallIM[k].im.instanceMatrix.needsUpdate=true;
    // the lifts: up, wait, down, wait
    lifts.forEach((l,i)=>{
      const c=(t*l.speed/l.range+l.ph)%2,u=c<1?c:2-c,e2=u*u*(3-2*u);
      const y=l.y0+e2*l.range;
      m4.compose(v.set(l.x,y,l.z),q.setFromEuler(e.set(0,l.ry,0)),sv.set(l.s,l.s*1.3,l.s));liftIM.setMatrixAt(i,m4);
      const j=(n*NS+i)*3;pos[j]=l.x+Math.sin(l.ry)*l.s*0.51;pos[j+1]=y;pos[j+2]=l.z+Math.cos(l.ry)*l.s*0.51;
    });
    liftIM.instanceMatrix.needsUpdate=true;pg.attributes.position.needsUpdate=true;
  }
  update(performance.now());
  return {group,update,sites,builders:B};
}
