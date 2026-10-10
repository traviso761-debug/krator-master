// ---------- what moves in a streamed metropolis ----------
// The trains run on every rail line in the region (data/metro/<city>/rail.json.gz, the pieces joined line by line),
// in their lines' colours (C.vehicles.lineColours), up on the viaducts where the line is raised; only those within
// K.trainFar of the camera are moved and drawn, and none inside the detailed core, which runs its own.
// The cars drive (on the side of the road the city drives on) along the main roads of the tiles in hand, and the
// people walk their streets; a tile's cars and people come and go with the tile (src/core/metro.js hands over each
// tile's road lines, with their heights, as it arrives, and says when it is thrown away).
import {joinFast} from './chains.js';

export function metrolife(api){
  const {THREE,C,scene,animHooks,camera}=api;const M=C.metro;if(!M)return;const K=M.life||{},V=C.vehicles||{};
  const base=M.url||('data/metro/'+(C.city||api.ctx.defaultCity||'tokyo')+'/');
  const SIDE=V.side==='left'?-1:1,TRAIN_FAR=K.trainFar||4000,CAR_FAR=K.carFar||900,PEOPLE_FAR=K.peopleFar||350;
  const core=(M.core||[])[0],la0=C.origin[0],lo0=C.origin[1],ML=111132,MO=111320*Math.cos(la0*Math.PI/180);
  const inCore=(x,z)=>{if(!core)return false;const la=la0-z/ML,lo=lo0+x/MO;return la>core[0]&&la<core[2]&&lo>core[1]&&lo<core[3];};
  function body(parts){const pos=[],nor=[],col=[];for(const [g0,c,x,y,z] of parts){const g=g0.toNonIndexed().translate(x,y,z),p=g.attributes.position,n=g.attributes.normal,cc=new THREE.Color(c);
      for(let i=0;i<p.count;i++){pos.push(p.getX(i),p.getY(i),p.getZ(i));nor.push(n.getX(i),n.getY(i),n.getZ(i));col.push(cc.r,cc.g,cc.b);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));return g;}
  const Bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d),W='#ffffff',G='#22262c';
  const mat=new THREE.MeshLambertMaterial({vertexColors:true});
  const CAR=body([[Bx(4.2,0.85,1.7),W,0,0.72,0],[Bx(2.4,0.62,1.56),W,-0.2,1.45,0],[Bx(2.35,0.5,1.58),G,-0.2,1.45,0]]);
  const TRAIN=body([[Bx(19.6,1.7,2.9),W,0,1.55,0],[Bx(19.6,0.75,2.92),G,0,2.55,0],[Bx(19.6,0.5,2.8),'#d8dadc',0,3.2,0]]);
  const PERSON=body([[Bx(0.22,0.85,0.34),'#2c2c34',0,0.43,0],[Bx(0.3,0.68,0.46),W,0,1.18,0],[new THREE.SphereGeometry(0.13,6,4),'#d9b08c',0,1.66,0]]);
  const mk=(geo,n,cast)=>{const m=new THREE.InstancedMesh(geo,mat,n);m.frustumCulled=false;m.castShadow=!!cast;m.userData.metro=true;scene.add(m);
    // the colours before the count: this three.js sizes the colour buffer from the count
    m.setColorAt(0,new THREE.Color(1,1,1));m.count=0;return m;};
  const trainM=mk(TRAIN,K.maxTrainCars||1600,true),carM=mk(CAR,K.maxCars||2500,true),manM=mk(PERSON,K.maxPeople||3000);
  const pushRange=(im,n)=>{im.count=n;im.instanceMatrix.updateRange.offset=0;im.instanceMatrix.updateRange.count=Math.max(1,n)*16;im.instanceMatrix.needsUpdate=true;
    if(im.instanceColor){im.instanceColor.updateRange.offset=0;im.instanceColor.updateRange.count=Math.max(1,n)*3;im.instanceColor.needsUpdate=true;}};
  const chainOf=pts=>{const cum=[0];for(let i=0;i+1<pts.length;i++)cum.push(cum[i]+Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][2]-pts[i][2]));let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[2]);z1=Math.max(z1,p[2]);}return {pts,cum,len:cum[cum.length-1],x0,x1,z0,z1};};
  function at(c,s,o){s=Math.max(0,Math.min(c.len,s));let lo=0,hi=c.cum.length-2;while(lo<hi){const m=(lo+hi+1)>>1;if(c.cum[m]<=s)lo=m;else hi=m-1;}
    const a=c.pts[lo],b=c.pts[lo+1],L=c.cum[lo+1]-c.cum[lo]||1,t=(s-c.cum[lo])/L;o.x=a[0]+(b[0]-a[0])*t;o.y=a[1]+(b[1]-a[1])*t;o.z=a[2]+(b[2]-a[2])*t;o.dx=(b[0]-a[0])/L;o.dz=(b[2]-a[2])/L;return o;}
  let seed=1;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  // ---- the trains ----
  const trains=[],SKW=new THREE.Color('#f4f4f2');
  const LC=Object.entries(V.lineColours||{}).map(([re,c])=>[new RegExp(re,'i'),new THREE.Color(c)]),TC=(V.trainColours||['#c8ccd0','#e8e8e4']).map(c=>new THREE.Color(c));
  fetch(base+'rail.json.gz').then(r=>r.arrayBuffer()).then(b=>{const u=new Uint8Array(b);return u[0]===0x1f&&u[1]===0x8b?new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).json():JSON.parse(new TextDecoder().decode(u));})
    .then(D=>{const wait=()=>{if(!api.METRO_GROUND){setTimeout(wait,500);return;}const gh=api.METRO_GROUND,byName=new Map();
        for(const [p,name,kind,deck] of D.l){const k=name+'|'+kind;if(!byName.has(k))byName.set(k,[]);const pts=[];for(let i=0;i+1<p.length;i+=2)pts.push([p[i],p[i+1],deck]);byName.get(k).push(pts);}
        for(const [k,ls] of byName){const [name,kind]=k.split('|'),lc=LC.find(([re])=>re.test(name));
          const lift=d=>(d||(kind==='monorail'?2:0))?(d||2)*6:0.3;
          for(const pts of joinFast(ls,4)){const c=chainOf(pts.map(([x,z,deck])=>[x,lift(deck),z]));c.lift=true;if(c.len<800)continue;
            // the Shinkansen (V.shinkansen.match): white, sixteen cars, and three times the speed
            const sk=V.shinkansen&&new RegExp(V.shinkansen.match||'新幹線','i').test(name);
            const n=Math.max(1,Math.round(c.len/(K.trainSpacing||2600)));for(let q=0;q<n;q++)trains.push({c,s:R()*c.len,dir:R()<0.5?-1:1,v:(sk?50:(K.trainSpeed||16))*(0.8+R()*0.4),cars:sk?16:(K.trainCars||10),col:sk?SKW:(lc?lc[1]:TC[Math.floor(R()*TC.length)]),pause:0});}}
        api.ctx.details.metroTrains=trains.length;};wait();}).catch(e=>{api.ctx.details.metroTrainError=String(e);});
  // ---- the cars and the people, by tile ----
  const tiles=new Map();
  const CARC=(V.carColours||['#f2f2f0','#c8ccd0','#1a1c22']).map(c=>new THREE.Color(c)),CLOTH=['#3a3a40','#5a4a3e','#2a3a5a','#e0dcd2','#8a7a6a','#1e1e22','#b8a888','#6a7a8a'].map(c=>new THREE.Color(c));
  api.METRO_LIFE={add(key,lines){const cars=[],people=[];
      for(const [cls,w,flat] of lines){const pts=[];for(let i=0;i+2<flat.length;i+=3)pts.push([flat[i],flat[i+1],flat[i+2]]);const c=chainOf(pts);if(c.len<20)continue;
        if(cls===1){const n=Math.round(c.len/1000*(K.carsPerKm||18));for(let q=0;q<n;q++)cars.push({c,s:R()*c.len,dir:R()<0.5?-1:1,v:8+R()*6,lane:SIDE*Math.min(w/4,3)*(0.7+R()*0.5),col:CARC[Math.floor(R()*CARC.length)]});}
        else{const n=Math.round(c.len/1000*(cls===3?K.walkersPedPerKm||60:K.walkersPerKm||16));for(let q=0;q<n;q++)people.push({c,s:R()*c.len,dir:R()<0.5?-1:1,v:1+R()*0.6,off:(R()<0.5?-1:1)*(cls===3?R()*2:w/2+1),col:CLOTH[Math.floor(R()*CLOTH.length)]});}}
      tiles.set(key,{cars,people});},
    drop(key){tiles.delete(key);}};
  // ---- every frame: move, place what is near, pack it at the front ----
  const o={},d=new THREE.Object3D();let last=0;
  animHooks.push(now=>{const dt=last?Math.min(0.1,(now-last)/1000):0;last=now;const cx=camera.position.x,cz=camera.position.z;
    let i=0;const cap=trainM.instanceMatrix.count;
    for(const t of trains){const c=t.c;if(t.pause>0)t.pause-=dt;else{t.s+=t.v*t.dir*dt;if(t.s>c.len){t.s=c.len;t.dir=-1;t.pause=20;}else if(t.s<0){t.s=0;t.dir=1;t.pause=20;}}
      const ex=Math.max(c.x0-cx,0,cx-c.x1),ez=Math.max(c.z0-cz,0,cz-c.z1);if(ex*ex+ez*ez>TRAIN_FAR*TRAIN_FAR)continue;
      for(let k=0;k<t.cars&&i<cap;k++){at(c,t.s-t.dir*k*20.4,o);const dx=o.x-cx,dz=o.z-cz;if(dx*dx+dz*dz>TRAIN_FAR*TRAIN_FAR||inCore(o.x,o.z))continue;
        const fx=o.dx*t.dir,fz=o.dz*t.dir;d.position.set(o.x,api.METRO_GH(o.x,o.z)+o.y,o.z);d.rotation.set(0,Math.atan2(-fz,fx),0);d.updateMatrix();trainM.setMatrixAt(i,d.matrix);trainM.setColorAt(i,t.col);i++;}}
    pushRange(trainM,i);
    let ic=0,ip=0;const ccap=carM.instanceMatrix.count,pcap=manM.instanceMatrix.count;
    for(const tl of tiles.values()){
      for(const a of tl.cars){a.s+=a.v*a.dir*dt;if(a.s>a.c.len){a.s=a.c.len;a.dir=-1;}else if(a.s<0){a.s=0;a.dir=1;}if(ic>=ccap)continue;at(a.c,a.s,o);const dx=o.x-cx,dz=o.z-cz;if(dx*dx+dz*dz>CAR_FAR*CAR_FAR)continue;
        const fx=o.dx*a.dir,fz=o.dz*a.dir;d.position.set(o.x-fz*a.lane,o.y,o.z+fx*a.lane);d.rotation.set(0,Math.atan2(-fz,fx),0);d.updateMatrix();carM.setMatrixAt(ic,d.matrix);carM.setColorAt(ic,a.col);ic++;}
      for(const p of tl.people){p.s+=p.v*p.dir*dt;if(p.s>p.c.len){p.s=p.c.len;p.dir=-1;}else if(p.s<0){p.s=0;p.dir=1;}if(ip>=pcap)continue;at(p.c,p.s,o);const dx=o.x-cx,dz=o.z-cz;if(dx*dx+dz*dz>PEOPLE_FAR*PEOPLE_FAR)continue;
        const fx=o.dx*p.dir,fz=o.dz*p.dir;d.position.set(o.x-fz*p.off,o.y-0.25,o.z+fx*p.off);d.rotation.set(0,Math.atan2(-fz,fx),0);d.updateMatrix();manM.setMatrixAt(ip,d.matrix);manM.setColorAt(ip,p.col);ip++;}}
    pushRange(carM,ic);pushRange(manM,ip);api.ctx.details.metroMoving=i+'/'+ic+'/'+ip;
    if(/lifedebug/.test(api.HASH0||'')){const near=(im,n)=>{let b=1e9,bp=null;const m=new THREE.Matrix4(),v=new THREE.Vector3();for(let k=0;k<n;k++){im.getMatrixAt(k,m);v.setFromMatrixPosition(m);const dd=v.distanceTo(camera.position);if(dd<b){b=dd;bp=v.toArray().map(Math.round);}}return [Math.round(b),bp];};
      api.ctx.details.lifeNear={cam:camera.position.toArray().map(Math.round),train:near(trainM,i),car:near(carM,ic),man:near(manM,ip)};}});
}
