// ---------- the colony: who lives in the mound, the air that moves through it, and what happens ----------
// The workers walk the galleries on their floors (blind, pale, a dark gut showing through), the soldiers stand at
// the tunnel mouths with their great orange heads, the gardeners tend the combs and the nurses the eggs; the queen
// lies in the royal cell, too big to leave, the king beside her and her attendants round her.
//
// The air: by day the sun warms the skin, the air in the surface conduits rises and the chimney's sinks; by night the
// skin cools first and the flow turns round. The mound breathes once a day (Turner and King's measurements of
// Macrotermes michaelseni). The motes show which way.
//
// Events: the swarming (winged alates out through holes the workers open at dusk), a breach (the soldiers come to the
// hole and face out while the workers wall it up), and a day and a night run through in under a minute.

export function buildLife(K,M){
  const {THREE,C,R,dyn}=K,V3=THREE.Vector3,mats=K.mats;
  const hooks=[],events=[];

  // ---- the bodies: little piles of parts, each part coloured, merged into one geometry per caste ----
  function body(parts){const pos=[],nor=[],col=[];
    for(const [g0,color,m4] of parts){const g=g0.toNonIndexed();g.applyMatrix4(m4);const p=g.attributes.position,n=g.attributes.normal,c=new THREE.Color(color);
      for(let i=0;i<p.count;i++){pos.push(p.getX(i),p.getY(i),p.getZ(i));nor.push(n.getX(i),n.getY(i),n.getZ(i));col.push(c.r,c.g,c.b);}g.dispose();}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeBoundingSphere();return g;}
  const blob=(sx,sy,sz,x,y,z)=>new THREE.Matrix4().makeTranslation(x,y,z).multiply(new THREE.Matrix4().makeScale(sx,sy,sz));
  const sph=new THREE.SphereGeometry(1,8,6);
  // a thin member from p to q
  const seg=(p,q,w)=>{const P=new V3(...p),Q=new V3(...q),d=Q.clone().sub(P),L=d.length(),z=d.normalize(),x=Math.abs(z.y)<0.9?new V3(0,1,0).cross(z).normalize():new V3(1,0,0).cross(z).normalize(),y=z.clone().cross(x);
    return [new THREE.BoxGeometry(w,w,L).translate(0,0,L/2),new THREE.Matrix4().makeBasis(x,y,z).setPosition(P)];};
  const legs=(col,s=1,y=0.42)=>{const out=[];for(const sd of [-1,1])for(const i of [-1,0,1]){const [g,m]=seg([sd*0.14*s,y*s,(0.12+i*0.13)*s],[sd*0.78*s,0,(0.12+i*0.5)*s],0.06*s);out.push([g,col,m]);}return out;};
  const feelers=(col,z,s=1)=>{const out=[];for(const sd of [-1,1]){const [g,m]=seg([sd*0.1*s,0.56*s,z*s],[sd*0.45*s,0.82*s,(z+0.55)*s],0.04*s);out.push([g,col,m]);}return out;};
  const WORKER=body([[sph,'#7a6c62',blob(0.42,0.36,0.64,0,0.45,-0.58)],[sph,'#e2d2b6',blob(0.26,0.22,0.32,0,0.44,0.14)],[sph,'#eadcc4',blob(0.3,0.26,0.32,0,0.5,0.6)],
    ...legs('#d8c6a6'),...feelers('#d8c6a6',0.85)]);
  const SOLDIER=body([[sph,'#9a8a78',blob(0.38,0.33,0.58,0,0.45,-0.6)],[sph,'#e2d2b6',blob(0.27,0.23,0.32,0,0.46,0.12)],[sph,'#b8622c',blob(0.42,0.36,0.58,0,0.56,0.78)],
    ...(()=>{const o=[];for(const sd of [-1,1]){const [g,m]=seg([sd*0.16,0.5,1.28],[-sd*0.06,0.47,1.85],0.1);o.push([g,'#2a1a10',m]);}return o;})(),...legs('#d8c6a6'),...feelers('#c89a6a',1.25)]);
  const wing=(sd,z,a)=>{const [g,m]=seg([sd*0.15,0.62,z],[sd*(0.15+Math.sin(a)*2.4),0.64,z-Math.cos(a)*2.4],0.02);g.scale(24,1,1);return [g,'#cbc3b4',m];};
  const ALATE=body([[sph,'#4a2e1c',blob(0.34,0.3,0.7,0,0.45,-0.55)],[sph,'#5a3822',blob(0.27,0.24,0.32,0,0.46,0.14)],[sph,'#3a2416',blob(0.28,0.25,0.3,0,0.5,0.55)],
    wing(-1,0.2,0.18),wing(1,0.2,0.18),wing(-1,0.05,0.3),wing(1,0.05,0.3),...legs('#5a3822'),...feelers('#5a3822',0.8)]);
  const casteMat=new THREE.MeshLambertMaterial({vertexColors:true});mats.caste=casteMat;

  // ---- walking the paths ----
  const walkable=M.paths.filter(P=>P.kind!=='chimney'&&P.len>4);
  const totalLen=walkable.reduce((a,P)=>a+P.len,0);
  const pickPath=()=>{let r=R()*totalLen;for(const P of walkable){r-=P.len;if(r<=0)return P;}return walkable[walkable.length-1];};
  const tmp={p:new V3(),t:new V3(),d:new V3(),u:new V3(),x:new V3(),m:new THREE.Matrix4(),q:new V3()};
  // where along a path: the point, the way on, and the floor (the wall below the middle)
  function at(P,s,out){const L=P.L;let lo=0,hi=L.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(L[mid]<=s)lo=mid;else hi=mid;}
    const a=P.pts[lo],b=P.pts[hi],f=(s-L[lo])/Math.max(1e-6,L[hi]-L[lo]);out.p.copy(a).lerp(b,f);out.t.copy(b).sub(a).normalize();
    out.r=P.rad[lo]+(P.rad[hi]-P.rad[lo])*f;out.d.set(0,-1,0).addScaledVector(out.t,out.t.y);
    if(out.d.lengthSq()<0.04&&P.N)out.d.copy(P.N[lo]);out.d.normalize();return out;}
  function pose(m,pos,fwd,up,s){const z=tmp.q.copy(fwd).normalize(),x=tmp.x.copy(up).cross(z).normalize(),y=tmp.u.copy(z).cross(x);m.makeBasis(x,y,z);if(s!==1)m.scale(new V3(s,s,s));m.setPosition(pos);return m;}

  const NW=C.life.workers,walkers=new THREE.InstancedMesh(WORKER,casteMat,NW);walkers.frustumCulled=false;dyn.add(walkers);
  // what they carry, held in the mandibles: a cut length of grass home along the foraging tunnels, a clay pellet
  // for building in the galleries (the grass only on the way home)
  const GRASS=new THREE.BoxGeometry(0.16,0.12,2.8).translate(0,0,1.0),PELLET=new THREE.SphereGeometry(0.36,8,6);
  const OFF_G=new THREE.Matrix4().makeTranslation(0,0.62,1.2),OFF_P=new THREE.Matrix4().makeTranslation(0,0.55,1.5),HIDE=new THREE.Matrix4().makeScale(0,0,0),M2=new THREE.Matrix4();
  const W=[];let nG=0,nP=0;for(let i=0;i<NW;i++){const P=pickPath(),fg=M.forage.includes(P),load=fg?(R()<0.75?'g':null):(R()<0.25?'p':null);
    W.push({P,s:R()*P.len,v:(1.6+R()*1.6)*(R()<0.5?-1:1),lane:R()<0.5?-1:1,load,li:load==='g'?nG++:load==='p'?nP++:-1});}
  const grassI=new THREE.InstancedMesh(GRASS,mats.load,Math.max(1,nG)),pelletI=new THREE.InstancedMesh(PELLET,mats.clay,Math.max(1,nP));grassI.frustumCulled=pelletI.frustumCulled=false;dyn.add(grassI,pelletI);
  const side=new V3(),fw=new V3(),up=new V3(),pos=new V3();
  function walk(dt){for(let i=0;i<NW;i++){const w=W[i];w.s+=w.v*dt;if(w.s<0){w.s=0;w.v=-w.v;}else if(w.s>w.P.len){w.s=w.P.len;w.v=-w.v;}
      at(w.P,w.s,tmp);fw.copy(tmp.t).multiplyScalar(Math.sign(w.v));up.copy(tmp.d).negate();side.copy(fw).cross(up).normalize();
      pos.copy(tmp.p).addScaledVector(tmp.d,tmp.r-0.08).addScaledVector(side,w.lane*Math.min(0.55,tmp.r*0.3));
      walkers.setMatrixAt(i,pose(tmp.m,pos,fw,up,1));
      if(w.load==='g')grassI.setMatrixAt(w.li,w.v<0?M2.multiplyMatrices(tmp.m,OFF_G):HIDE);else if(w.load==='p')pelletI.setMatrixAt(w.li,M2.multiplyMatrices(tmp.m,OFF_P));}
    walkers.instanceMatrix.needsUpdate=grassI.instanceMatrix.needsUpdate=pelletI.instanceMatrix.needsUpdate=true;}
  hooks.push((t,dt)=>walk(Math.min(dt,0.1)));

  // ---- foraging parties on the surface: out of the holes on the camera's side, along dusty trails to the grass,
  // and home with a length of it each; a few soldiers at each hole, facing out ----
  {const F=C.foragers,want=C.breach.th,hs=M.holes.filter(h=>!M.inTrench(h.x,h.z,20)).sort((a,b)=>Math.cos(Math.atan2(b.z,b.x)-want)-Math.cos(Math.atan2(a.z,a.x)-want)).slice(0,F.parties);
    const trails=[],tpos=[];
    for(const h of hs){const near=M.tufts.filter(t=>{const d=t.distanceTo(h);return d>F.trail[0]*0.5&&d<F.trail[1];}).sort((a,b)=>a.distanceTo(h)-b.distanceTo(h)).slice(0,3);
      for(const t of near){const pts=[],L=t.distanceTo(h),n=Math.ceil(L/4),q=R()*6,side=new V3(-(t.z-h.z),0,t.x-h.x).normalize();
        for(let i=0;i<=n;i++){const u=i/n,p=h.clone().lerp(t,u).addScaledVector(side,Math.sin(u*Math.PI*2+q)*L*0.04*Math.sin(u*Math.PI));p.y=0;pts.push(p);}
        const Lc=[0];for(let i=1;i<pts.length;i++)Lc.push(Lc[i-1]+pts[i].distanceTo(pts[i-1]));trails.push({pts,L:Lc,len:Lc[Lc.length-1],rad:pts.map(()=>1),N:null});
        // the trail worn into the sand
        for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1],d=b.clone().sub(a).normalize(),o=new V3(-d.z,0,d.x).multiplyScalar(2.2);
          for(const v of [a.clone().add(o),b.clone().add(o),b.clone().sub(o),a.clone().add(o),b.clone().sub(o),a.clone().sub(o)])tpos.push(v.x,0.08,v.z);}}}
    if(tpos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(tpos,3));g.computeVertexNormals();K.fabric.add(new THREE.Mesh(g,mats.trail));}
    const NF=trails.length?F.parties*F.each:0,fw2=new V3(),up2=new V3(0,1,0),ps2=new V3();
    if(NF){const im=new THREE.InstancedMesh(WORKER,casteMat,NF),gl=new THREE.InstancedMesh(GRASS,mats.load,NF),FW=[];im.frustumCulled=gl.frustumCulled=false;dyn.add(im,gl);
      for(let i=0;i<NF;i++){const T=trails[i%trails.length];FW.push({T,s:R()*T.len,v:(1.8+R()*1.4)*(R()<0.5?-1:1),lane:R()<0.5?-1:1});}
      const tq={p:new V3(),t:new V3(),d:new V3(),r:1};
      hooks.push((t,dt)=>{dt=Math.min(dt,0.1);for(let i=0;i<NF;i++){const w=FW[i];w.s+=w.v*dt;if(w.s<0){w.s=0;w.v=-w.v;}else if(w.s>w.T.len){w.s=w.T.len;w.v=-w.v;}
          at(w.T,w.s,tq);fw2.copy(tq.t).multiplyScalar(Math.sign(w.v));ps2.copy(tq.p).addScaledVector(new V3(-fw2.z,0,fw2.x),w.lane*0.9);ps2.y=0.08;
          im.setMatrixAt(i,pose(tmp.m,ps2,fw2,up2,1));gl.setMatrixAt(i,w.v<0?M2.multiplyMatrices(tmp.m,OFF_G):HIDE);}
        im.instanceMatrix.needsUpdate=gl.instanceMatrix.needsUpdate=true;});
      const sm=new THREE.InstancedMesh(SOLDIER,casteMat,hs.length*6),m=new THREE.Matrix4();let k=0;
      for(const h of hs)for(let j=0;j<6;j++){const a=j/6*Math.PI*2,p=h.clone().add(new V3(Math.cos(a)*7.5,0.6,Math.sin(a)*7.5));sm.setMatrixAt(k++,pose(m,p,new V3(Math.cos(a),0,Math.sin(a)),new V3(0,1,0),1.1));}
      dyn.add(sm);}}

  // ---- the soldiers at the tunnel mouths, facing out along the tunnels ----
  {const spots=[];for(const P of M.paths)if(P.kind==='gallery'&&P.len>20){for(const s of [3,P.len-3]){if(R()<0.55)continue;at(P,s,tmp);const out=s<5?1:-1;spots.push([tmp.p.clone().addScaledVector(tmp.d,tmp.r-0.08),tmp.t.clone().multiplyScalar(out),tmp.d.clone().negate()]);}}
    const n=Math.min(spots.length,C.life.soldiers),im=new THREE.InstancedMesh(SOLDIER,casteMat,n),m=new THREE.Matrix4();
    for(let i=0;i<n;i++){const [p,f,u]=spots[i];im.setMatrixAt(i,pose(m,p,f,u,1.1));}dyn.add(im);}

  // ---- the gardeners on the combs, the nurses and the eggs in the nurseries ----
  {const tend=[],eggs=[],larvae=[];
    for(const ch of M.gardens)for(let k=0;k<5;k++){const a=R()*Math.PI*2,r=R()*0.55;tend.push([new V3(ch.c.x+Math.cos(a)*r*ch.ax,ch.c.y-ch.b*0.15+R()*ch.b*0.25,ch.c.z+Math.sin(a)*r*ch.az),R()*6.3]);}
    for(const ch of M.nurseries){for(let k=0;k<160;k++){const a=R()*Math.PI*2,r=Math.sqrt(R())*0.6,h=R()*R()*ch.b*0.7;eggs.push(new V3(ch.c.x+Math.cos(a)*r*ch.ax,ch.c.y-ch.b*0.88+h,ch.c.z+Math.sin(a)*r*ch.az));}
      for(let k=0;k<26;k++){const a=R()*Math.PI*2,r=0.3+R()*0.4;larvae.push([new V3(ch.c.x+Math.cos(a)*r*ch.ax,ch.c.y-ch.b*0.82,ch.c.z+Math.sin(a)*r*ch.az),R()*6.3]);}
      for(let k=0;k<8;k++){const a=R()*Math.PI*2,r=0.35+R()*0.35;tend.push([new V3(ch.c.x+Math.cos(a)*r*ch.ax,ch.c.y-ch.b*0.9,ch.c.z+Math.sin(a)*r*ch.az),R()*6.3]);}}
    const im=new THREE.InstancedMesh(WORKER,casteMat,tend.length),o=new THREE.Object3D();tend.forEach(([p,yaw],i)=>{o.position.copy(p);o.rotation.set(0,yaw,0);o.updateMatrix();im.setMatrixAt(i,o.matrix);});dyn.add(im);
    const base=tend.map(([p,yaw])=>[p,yaw]);hooks.push(t=>{for(let i=0;i<base.length;i+=1){const [p,yaw]=base[i];o.position.copy(p);o.rotation.set(0,yaw+0.35*Math.sin(t*0.8+i),0);o.updateMatrix();im.setMatrixAt(i,o.matrix);}im.instanceMatrix.needsUpdate=true;});
    const em=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),mats.egg,eggs.length);eggs.forEach((p,i)=>{o.position.copy(p);o.rotation.set(R()*3,R()*3,0);o.scale.set(0.17,0.17,0.28);o.updateMatrix();em.setMatrixAt(i,o.matrix);});dyn.add(em);
    const lm=new THREE.InstancedMesh(new THREE.TorusGeometry(0.32,0.2,6,10,Math.PI*1.4),mats.egg,larvae.length);larvae.forEach(([p,yaw],i)=>{o.position.copy(p);o.rotation.set(Math.PI/2,0,yaw);o.scale.set(1,1,1);o.updateMatrix();lm.setMatrixAt(i,o.matrix);});dyn.add(lm);}

  // ---- the queen and the king in the royal cell, her attendants round her ----
  const RC=M.royal.c,floorY=RC.y-M.royal.b;
  const queen=new THREE.Group();queen.position.set(RC.x-3,floorY+3.4,RC.z);queen.rotation.y=0.35;dyn.add(queen);
  {const LQ=C.life.queenLength,pts=[];for(let i=0;i<=24;i++){const t=i/24,r=3.5*Math.pow(Math.sin(Math.PI*t),0.6)*(1-0.12*t)+0.05;pts.push(new THREE.Vector2(r,(t-0.5)*LQ));}
    const ab=new THREE.Mesh(new THREE.LatheGeometry(pts,26).rotateX(Math.PI/2),mats.queen);queen.add(ab);queen.userData.abdomen=ab;
    for(let k=1;k<10;k++){const t=k/10,r=3.5*Math.pow(Math.sin(Math.PI*t),0.6)*(1-0.12*t);const ring=new THREE.Mesh(new THREE.TorusGeometry(r+0.04,0.16,5,26),mats.tergite);ring.position.z=(t-0.5)*LQ;ab.add(ring);
      const plate=new THREE.Mesh(new THREE.SphereGeometry(1,10,6,0,Math.PI*2,0,0.5),mats.tergite);plate.scale.set(r*0.55,0.6,LQ/16);plate.position.set(0,r*0.86,(t-0.5)*LQ);ab.add(plate);}
    const front=new THREE.Mesh(body([[sph,'#8a5a30',blob(1.0,0.75,1.2,0,0,0)],[sph,'#7a4a26',blob(0.9,0.8,0.9,0,0.2,1.7)],...feelers('#7a4a26',1.6,2.2)]),casteMat);front.position.z=LQ/2+0.6;queen.add(front);
    for(const sd of [-1,1])for(const i of [-1,0,1]){const [g,m]=seg([sd*0.8,-0.2,LQ/2+0.6+i*0.4],[sd*2.0,-3.1,LQ/2+0.6+i*1.0],0.16);queen.add(new THREE.Mesh(g.applyMatrix4(m),mats.queenLeg));}}
  const king=new THREE.Mesh(ALATE,casteMat);king.scale.setScalar(C.life.alateScale*0.75);king.position.set(RC.x+11,floorY+0.2,RC.z+6);king.rotation.y=-2.1;dyn.add(king);
  {const n=C.life.attendants,im=new THREE.InstancedMesh(WORKER,casteMat,n),home=[];
    for(let i=0;i<n;i++){const t=(i/n-0.5)*0.95,a=i%2?1:-1,local=new V3(a*(4.4+R()*2.2),0,t*C.life.queenLength);local.applyAxisAngle(new V3(0,1,0),queen.rotation.y);
      home.push([local.add(new V3(queen.position.x,floorY+0.05,queen.position.z)),queen.rotation.y+(a>0?-Math.PI/2:Math.PI/2)+(R()-0.5)*0.6]);}
    const o=new THREE.Object3D();dyn.add(im);
    hooks.push(t=>{for(let i=0;i<n;i++){const [p,yaw]=home[i];o.position.copy(p);o.position.y+=0;o.rotation.set(0,yaw+0.15*Math.sin(t*2+i*1.7),0);o.updateMatrix();im.setMatrixAt(i,o.matrix);}im.instanceMatrix.needsUpdate=true;
      const ab=queen.userData.abdomen;ab.scale.set(1+0.025*Math.sin(t*1.1),1+0.03*Math.sin(t*1.1+0.6),1);});}

  // ---- the air: motes along the chimney, the connectives and the conduits, turning round with the day ----
  const AIR=[...M.paths.filter(P=>P.kind==='chimney'),...M.connectives,...M.conduits];
  const airLen=AIR.reduce((a,P)=>a+P.len,0),NA=C.life.motes,ap=new Float32Array(NA*3),A=[];
  for(let i=0;i<NA;i++){let r=R()*airLen,P=AIR[0];for(const Q of AIR){r-=Q.len;if(r<=0){P=Q;break;}}
    const kind=P.kind==='chimney'?'chimney':M.connectives.includes(P)?'connective':'conduit';A.push({P,s:R()*P.len,kind,a:R()*6.3,o:Math.sqrt(R())*0.75,v:0.7+R()*0.6});}
  const ag=new THREE.BufferGeometry();ag.setAttribute('position',new THREE.BufferAttribute(ap,3));
  const motes=new THREE.Points(ag,new THREE.PointsMaterial({map:K.T.dot,color:0xfff4dc,size:3.2,transparent:true,opacity:0.75,depthWrite:false}));motes.frustumCulled=false;dyn.add(motes);
  const bn=new V3();
  hooks.push((t,dt)=>{const day=K.isDay();dt=Math.min(dt,0.1);
    for(let i=0;i<NA;i++){const m=A[i],sp=(m.kind==='chimney'?7:4.5)*m.v,dir=m.kind==='chimney'?(day?-1:1):(day?1:-1);   /* by day up the conduits, out along the connectives, down the chimney; by night the other way */
      m.s+=sp*dir*dt;if(m.s>m.P.len)m.s-=m.P.len;if(m.s<0)m.s+=m.P.len;at(m.P,m.s,tmp);
      bn.copy(tmp.t).cross(tmp.d);const r=tmp.r*m.o;ap[i*3]=tmp.p.x+(tmp.d.x*Math.cos(m.a)+bn.x*Math.sin(m.a))*r;ap[i*3+1]=tmp.p.y+(tmp.d.y*Math.cos(m.a)+bn.y*Math.sin(m.a))*r;ap[i*3+2]=tmp.p.z+(tmp.d.z*Math.cos(m.a)+bn.z*Math.sin(m.a))*r;}
    ag.attributes.position.needsUpdate=true;});

  // ---- holes in the skin, for the events: a dark disc set into the surface ----
  const holeAt=(y,th)=>{const p=M.surf(y,th),q=M.surf(y+3,th),s=M.surf(y,th+0.01),n=s.clone().sub(p).cross(q.clone().sub(p)).normalize();if(n.dot(new V3(Math.cos(th),0,Math.sin(th)))<0)n.negate();return {p,n};};
  function hole(h,r){const m=new THREE.Mesh(new THREE.CircleGeometry(1,20),mats.mouth);m.position.copy(h.p).addScaledVector(h.n,0.6);m.quaternion.setFromUnitVectors(new V3(0,0,1),h.n);m.scale.setScalar(Math.max(0.001,r));m.visible=false;dyn.add(m);return m;}

  // ---- the swarming: at dusk the workers open slits in the skin and the winged ones pour out ----
  {const NH=9,holes=[],NAl=C.life.alates,al=new THREE.InstancedMesh(ALATE,casteMat,NAl),F=[];al.visible=false;al.frustumCulled=false;dyn.add(al);
    for(let k=0;k<NH;k++){const h=holeAt(300+R()*330,0.15+k/NH*2.1+R()*0.12);holes.push({...h,m:hole(h,0)});}
    const o=new THREE.Object3D();
    events.push({key:'swarm',label:'The swarming',card:'swarm',view:C.eventViews.swarm,start(api){api.setHour(18.15);let u=0;al.visible=true;
      for(let i=0;i<NAl;i++){const h=holes[i%NH];F[i]={h,t0:2+R()*16,p:new V3(),v:new V3(),life:0};}
      return {update(t,dt){u+=dt;const open=Math.min(1,u/2)*Math.min(1,Math.max(0,(30-u)/3));for(const h of holes){h.m.visible=open>0.01;h.m.scale.setScalar(6*open+0.001);}
        for(let i=0;i<NAl;i++){const f=F[i];if(u<f.t0){o.scale.setScalar(0.001);}
          else{if(!f.life){f.p.copy(f.h.p).addScaledVector(f.h.n,1.5);f.v.copy(f.h.n).multiplyScalar(5+R()*5).add(new V3((R()-0.5)*4,7+R()*6,(R()-0.5)*4));}
            f.life+=dt;f.v.y+=dt*0.8;f.v.x+=Math.sin(u*3+i)*dt*3;f.v.z+=Math.cos(u*2.6+i)*dt*3;f.p.addScaledVector(f.v,dt);
            o.position.copy(f.p);o.lookAt(f.p.clone().add(f.v));o.rotateZ(Math.sin(u*25+i)*0.4);o.scale.setScalar(C.life.alateScale*(f.life>22?Math.max(0.001,1-(f.life-22)/3):1));}
          o.updateMatrix();al.setMatrixAt(i,o.matrix);}al.instanceMatrix.needsUpdate=true;
        if(u>34){al.visible=false;for(const h of holes)h.m.visible=false;return false;}}};}});}

  // ---- a breach: a hole knocked in the skin; soldiers fill it facing out, workers wall it up from the rim ----
  {const h=holeAt(C.breach.y,C.breach.th),m=hole(h,0),NS=48,NW2=36,sol=new THREE.InstancedMesh(SOLDIER,casteMat,NS),wk=new THREE.InstancedMesh(WORKER,casteMat,NW2),o=new THREE.Matrix4();
    sol.visible=wk.visible=false;dyn.add(sol,wk);const ax1=new V3(0,1,0).cross(h.n).normalize(),ax2=h.n.clone().cross(ax1).normalize(),P=new V3();
    events.push({key:'breach',label:'A breach',card:'breach',view:C.eventViews.breach,start(api){let u=0;sol.visible=wk.visible=m.visible=true;
      return {update(t,dt){u+=dt;const R0=C.breach.r,r=u<1.2?R0*u/1.2:u<7?R0:Math.max(0,R0*(1-(u-7)/18));m.scale.setScalar(r+0.001);
        const come=Math.min(1,Math.max(0,(u-1.5)/3)),leave=u>24?Math.max(0,1-(u-24)/3):1;
        for(let i=0;i<NS;i++){const a=i/NS*Math.PI*2*3,ring=(i%3)/3,rr=r*(0.25+ring*0.65);P.copy(h.p).addScaledVector(ax1,Math.cos(a)*rr).addScaledVector(ax2,Math.sin(a)*rr).addScaledVector(h.n,-6*(1-come*leave)+0.3);
          pose(o,P,h.n,ax2,come*leave>0.01?1.15:0.001);sol.setMatrixAt(i,o);}
        for(let i=0;i<NW2;i++){const a=i/NW2*Math.PI*2+u*0.2,rr=r+1.6;P.copy(h.p).addScaledVector(ax1,Math.cos(a)*rr).addScaledVector(ax2,Math.sin(a)*rr).addScaledVector(h.n,0.2);
          const inward=P.clone().sub(h.p).negate().normalize();pose(o,P,inward,h.n,u>3&&r>0.5?1:0.001);wk.setMatrixAt(i,o);}
        sol.instanceMatrix.needsUpdate=wk.instanceMatrix.needsUpdate=true;
        if(u>28){sol.visible=wk.visible=m.visible=false;return false;}}};}});}

  // ---- the first rains: the sky closes in, drops the size of a person fall at their own nine metres a second,
  // the clay darkens as it soaks and dries again after ----
  {const RN=C.rain,N=RN.drops,dp=new Float32Array(N*3),dv=new Float32Array(N),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(dp,3));
    const drops=new THREE.Points(g,new THREE.PointsMaterial({map:K.T.dot,color:0xb4c4d2,size:RN.size*2.2,transparent:true,opacity:0.65,depthWrite:false}));drops.visible=false;drops.frustumCulled=false;drops.userData.noClip=true;dyn.add(drops);
    events.push({key:'rain',label:'The first rains',card:'rain',view:C.eventViews.rain,start(api){let u=0;drops.visible=true;const c=api.camera.position;
      for(let i=0;i<N;i++){const a=R()*Math.PI*2,r=Math.sqrt(R())*RN.radius;dp[i*3]=c.x+Math.cos(a)*r;dp[i*3+1]=R()*RN.radius*1.4;dp[i*3+2]=c.z+Math.sin(a)*r;dv[i]=RN.fall*(0.85+R()*0.3);}
      return {update(t,dt){u+=dt;dt=Math.min(dt,0.1);const k=u<4?u/4:u<28?1:Math.max(0,1-(u-28)/6),c=api.camera.position;api.setStorm(k);api.setWet(Math.min(1,u/10)*(u<34?1:Math.max(0,1-(u-34)/12)));
        for(let i=0;i<N;i++){dp[i*3+1]-=dv[i]*dt;if(dp[i*3+1]<0||Math.hypot(dp[i*3]-c.x,dp[i*3+2]-c.z)>RN.radius){const a=R()*Math.PI*2,r=Math.sqrt(R())*RN.radius;dp[i*3]=c.x+Math.cos(a)*r;dp[i*3+1]=c.y+RN.radius*(0.2+R()*0.6);dp[i*3+2]=c.z+Math.sin(a)*r;}}
        drops.material.opacity=0.65*Math.min(1,k*1.5);g.attributes.position.needsUpdate=true;
        if(u>46){drops.visible=false;api.setStorm(0);api.setWet(0);return false;}}};}});}

  // ---- a day and a night, run through in forty seconds: watch the air turn round ----
  events.push({key:'day',label:'A day and a night',card:'breathing',view:C.eventViews.day,start(api){const h0=api.getHour();let u=0;api.setCut(true);
    return {update(t,dt){u+=dt;api.setHour((h0+u/40*24)%24);if(u>=40){api.setHour(h0);return false;}}};}});

  return {hooks,events,anchors:{forage:(C.foragers&&M.holes.filter(h=>!M.inTrench(h.x,h.z,20)).sort((a,b)=>Math.cos(Math.atan2(b.z,b.x)-C.breach.th)-Math.cos(Math.atan2(a.z,a.x)-C.breach.th))[0])||null}};
}
