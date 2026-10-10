// ---------- what moves on Rome's streets and rails ----------
// Fiat 500s and small hatchbacks on every street a car may use, Vespas and mopeds weaving everywhere (more of them
// than cars, as in Rome), ATAC's red buses on the main roads, trams on the tram lines - articulated, in the green and
// cream or the orange - and trains on the main lines into Termini, the Frecciarossa in red and the regionals in white
// and green. Each rides a chain of mapped ways joined end to end, on the right, up onto the bridge decks, turning back
// at the ends of what it can drive (the trams and trains pause there first).
//
// Out of the frame and far off is not worth updating: a vehicle more than C.vehicles.far metres from the camera is
// neither moved nor drawn until the camera comes back. Map data (c) OpenStreetMap contributors, ODbL.
import {mkRng} from './rng.js';
import {joinFast} from './chains.js';

export function traffic(api){
  const {THREE,C,scene,ROADS,RAILS,STATIONS,groundH,joinChains,animHooks,camera}=api;const K=C.vehicles;if(!K)return;
  // the side of the road the city drives on (K.side: 'left' in Japan and Britain), and its colours
  const SIDE=K.side==='left'?-1:1,cols=(a,d)=>(a||d).map(c=>new THREE.Color(c));
  const R=mkRng(K.seed||2753),V3=THREE.Vector3,FAR=K.far||1300;
  // ---- the chains: ways of the chosen kinds joined end to end, with lengths along them ----
  function chains(lines,minLen){return joinFast(lines,2.5).map(pts=>{const cum=[0];for(let i=0;i+1<pts.length;i++)cum.push(cum[i]+Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]));let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}return {pts,cum,len:cum[cum.length-1],x0,x1,z0,z1};}).filter(c=>c.len>=minLen);}
  const roadLines=set=>ROADS.filter(r=>set.has(r.c)).map(r=>r.pts.map((p,i)=>[p[0],p[1],r.ys?r.ys[i]:0]));
  function at(c,s,o){s=Math.max(0,Math.min(c.len,s));let lo=0,hi=c.cum.length-2;while(lo<hi){const m=(lo+hi+1)>>1;if(c.cum[m]<=s)lo=m;else hi=m-1;}
    const a=c.pts[lo],b=c.pts[lo+1],L=c.cum[lo+1]-c.cum[lo]||1,t=(s-c.cum[lo])/L;o.x=a[0]+(b[0]-a[0])*t;o.z=a[1]+(b[1]-a[1])*t;o.dx=(b[0]-a[0])/L;o.dz=(b[1]-a[1])/L;
    o.y=Math.max(groundH(o.x,o.z),(a[2]||0)+((b[2]||0)-(a[2]||0))*t);return o;}
  // ---- the bodies: little models, coloured by vertex so one instanced mesh takes a tint per vehicle ----
  function body(parts){const pos=[],nor=[],col=[];for(const [g0,c,x,y,z] of parts){const g=(g0.index?g0.toNonIndexed():g0.clone()).translate(x,y,z),p=g.attributes.position,n=g.attributes.normal,cc=new THREE.Color(c);
      for(let i=0;i<p.count;i++){pos.push(p.getX(i),p.getY(i),p.getZ(i));nor.push(n.getX(i),n.getY(i),n.getZ(i));col.push(cc.r,cc.g,cc.b);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));return g;}
  const Bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d),Cy=(r,h,s=8)=>new THREE.CylinderGeometry(r,r,h,s),Sp=r=>new THREE.SphereGeometry(r,8,6),W='#ffffff',G='#22262c',T='#1a1a1a';
  const wheels=(xs,r,half)=>xs.flatMap(x=>[-1,1].map(s=>[Cy(r,0.22,10).rotateX(Math.PI/2),T,x,r,s*half]));
  // all along +x, the front at +x
  const CAR=body([[Bx(3.5,0.85,1.6),W,0,0.72,0],[Bx(2.0,0.62,1.46),W,-0.2,1.45,0],[Bx(1.95,0.5,1.48),G,-0.2,1.45,0],[Bx(0.06,0.42,1.3),G,0.82,1.42,0],...wheels([-1.1,1.1],0.3,0.72)]);
  const MOPED=body([[Bx(1.3,0.42,0.42),W,-0.15,0.62,0],[Bx(0.5,0.6,0.38),W,0.45,0.75,0],[Bx(0.12,0.5,0.5),G,0.62,1.2,0],...wheels([-0.6,0.62],0.24,0),
    [Cy(0.2,0.62,8),'#3a4a6a',-0.25,1.25,0],[Sp(0.17),'#e8e4dc',-0.22,1.75,0]]);
  const BUS=body([[Bx(12,1.4,2.5),W,0,1.2,0],[Bx(12,0.9,2.52),G,0,2.3,0],[Bx(12,0.35,2.5),'#e8e8e8',0,2.95,0],...wheels([-3.8,3.6],0.5,1.2)]);
  const TRAMCAR=body([[Bx(14,1.3,2.4),W,0,1.0,0],[Bx(14,1.0,2.42),G,0,2.1,0],[Bx(14,0.5,2.36),'#d8d4cc',0,2.85,0],[Bx(1.2,0.6,1.2),'#555',0,3.4,0]]);
  const TRAINCAR=body([[Bx(25,1.6,2.9),W,0,1.5,0],[Bx(25,0.8,2.92),G,0,2.6,0],[Bx(25,0.7,2.8),W,0,3.35,0]]);
  const mat=new THREE.MeshLambertMaterial({vertexColors:true});
  const CARC=cols(K.carColours,['#e8e4d6','#c8282a','#f2f0ea','#2a4a7a','#1e1e22','#8a9aa8','#d8c060','#3c6a4a','#a8b0b6','#e8a020']);
  const MOPC=cols(K.mopedColours,['#e8e4d6','#9ac0c8','#c8282a','#f2f0ea','#2a2a2e','#e8c040','#7aa070']);
  const fleet=[];
  // put vehicles on chains: n per kilometre, both ways, a speed, a lane offset to the right, a length (for the trains)
  function addKind(geo,chs,perKm,cap,speed,lane,colours,opts={}){const list=[];
    for(const c of chs){const n=Math.max(opts.min||0,Math.round(c.len/1000*perKm));for(let k=0;k<n&&list.length<cap;k++)list.push({c,s:R()*c.len,dir:R()<0.5?-1:1,v:speed[0]+R()*(speed[1]-speed[0]),lane:SIDE*lane*(0.8+R()*0.4),pause:0,cars:opts.cars||1,gap:opts.gap||0});}
    const count=list.reduce((a,v)=>a+v.cars,0);if(!count)return;opts.far=opts.far||FAR;const im=new THREE.InstancedMesh(geo,mat,count);im.frustumCulled=false;im.castShadow=!!opts.cast;
    let i=0;for(const v of list){const cc=v.c.col||colours[Math.floor(R()*colours.length)];v.col=cc;for(let k=0;k<v.cars;k++)im.setColorAt(i++,cc);}scene.add(im);
    // opts.head: the first and last cars in their own shape (a nose), the tail turned round
    let head=null;if(opts.head){head=new THREE.InstancedMesh(opts.head,mat,list.length*2);head.frustumCulled=false;head.castShadow=!!opts.cast;let j=0;for(const v of list){head.setColorAt(j++,v.col);head.setColorAt(j++,v.col);}scene.add(head);}
    fleet.push({im,head,list,opts});return list;}
  const MAIN=new Set(['primary','secondary','trunk']),STREETS=new Set(['primary','secondary','tertiary','trunk','residential','unclassified']),ALL=new Set([...STREETS,'living_street','pedestrian']);
  const streetCh=chains(roadLines(STREETS),80),allCh=chains(roadLines(ALL),60),mainCh=chains(roadLines(MAIN),400);
  addKind(CAR,streetCh,K.cars||22,K.maxCars||900,[6,12],1.6,CARC,{cast:true,far:K.carFar||1000});
  addKind(MOPED,allCh,K.mopeds||26,K.maxMopeds||900,[7,14],1.0,MOPC,{far:K.mopedFar||600});
  addKind(BUS,mainCh,K.buses||1.2,K.maxBuses||60,[6,9],1.8,cols(K.busColours,['#c0262c','#d83a30']),{cast:true});
  const tramCh=chains(RAILS.filter(r=>r.type==='tram').map(r=>r.pts.map(p=>[p[0],p[1],0])),300);
  addKind(TRAMCAR,tramCh,K.trams||0.8,K.maxTrams||30,[5,8],0,cols(K.tramColours,['#3f7a4a','#e07a2a','#e8e2d0']),{cars:3,gap:14.4,min:1,pauseAt:12,far:K.railFar||2000});
  // the trains: the lines joined one name at a time, so a train keeps to its own line and wears its colour
  // (K.lineColours: {pattern: colour}, e.g. the Yamanote's green); K.railElevated runs them on viaducts too
  const LC=Object.entries(K.lineColours||{}).map(([re,c])=>[new RegExp(re,'i'),new THREE.Color(c)]),byName=new Map();
  // K.shinkansen {match, speed, cars}: those lines run their own trains, long-nosed and fast, and none of the others
  const SK=K.shinkansen,SKRE=SK?new RegExp(SK.match||'新幹線|Shinkansen','i'):null,skLines=new Map();
  for(const r of RAILS){if(r.type!=='rail'||!SKRE||!SKRE.test(r.name||''))continue;const k=r.name;if(!skLines.has(k))skLines.set(k,[]);skLines.get(k).push(r.pts.map(p=>[p[0],p[1],r.elevated?groundH(p[0],p[1])+(K.viaduct||8):0]));}
  for(const r of RAILS){if(r.type!=='rail'||(r.elevated&&!K.railElevated))continue;const k=r.name||'';if(SKRE&&SKRE.test(k))continue;if(!byName.has(k))byName.set(k,[]);byName.get(k).push(r.pts.map(p=>[p[0],p[1],r.elevated?groundH(p[0],p[1])+(K.viaduct||8):0]));}
  const railCh=[];for(const [name,ls] of byName){const lc=LC.find(([re])=>re.test(name));for(const c of chains(ls,800)){c.col=lc?lc[1]:null;railCh.push(c);}}
  // K.stationDwell: a train stops that many seconds at each mapped station within K.stationNear metres of its line,
  // its middle at the station; the stops are arc lengths along the chain
  const stopsOn=c=>{const out=[];if(!K.stationDwell)return out;const NR=K.stationNear||60;
    for(const st of STATIONS||[]){if(st.x<c.x0-NR||st.x>c.x1+NR||st.z<c.z0-NR||st.z>c.z1+NR)continue;let best=NR*NR,bs=-1;
      for(let i=0;i+1<c.pts.length;i++){const a=c.pts[i],b=c.pts[i+1],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((st.x-a[0])*dx+(st.z-a[1])*dz)/L2)),ex=a[0]+dx*t-st.x,ez=a[1]+dz*t-st.z,d2=ex*ex+ez*ez;if(d2<best){best=d2;bs=c.cum[i]+Math.sqrt(L2)*t;}}
      if(bs>=0&&!out.some(s2=>Math.abs(s2-bs)<150))out.push(bs);}return out.sort((a,b)=>a-b);};
  for(const c of railCh)c.stops=stopsOn(c);
  api.TRAIN_CHAINS=railCh;
  addKind(TRAINCAR,railCh,K.trains||0.35,K.maxTrains||14,[10,22],0,cols(K.trainColours,['#c82020','#e8e8e2','#3a7a5a']),{cars:K.trainCars||7,gap:25.4,min:1,pauseAt:20,cast:true,far:K.railFar||2000,dwell:K.stationDwell||0});
  if(SK){// the N700: white, a blue band under the windows, and a fifteen-metre duck-bill nose on each end
    const prof=new THREE.Shape();prof.moveTo(-12.5,0.6);prof.lineTo(-2,0.6);prof.quadraticCurveTo(8,0.6,12.4,1.15);prof.quadraticCurveTo(7,2.4,1,3.6);prof.lineTo(-12.5,3.75);prof.closePath();
    const nose=new THREE.ExtrudeGeometry(prof,{depth:3.36,bevelEnabled:false,curveSegments:8}).translate(0,0,-1.68);
    const SKC=body([[Bx(25,3.15,3.36),W,0,2.18,0],[Bx(25.02,0.32,3.38),'#1a4aa8',0,1.25,0],[Bx(25.02,0.55,3.38),'#2a3038',0,2.75,0]]);
    const SKH=body([[nose,W,0,0,0],[Bx(14,0.32,3.38),'#1a4aa8',-5.5,1.25,0],[Bx(9,0.55,3.38),'#2a3038',-8,2.75,0]]);
    const skCh=[];for(const ls of skLines.values())for(const c of chains(ls,600)){c.stops=stopsOn(c).filter(()=>true);skCh.push(c);}
    addKind(SKC,skCh,SK.perKm||0.25,SK.max||6,SK.speed||[38,55],0,cols(null,['#f4f4f2']),{cars:SK.cars||16,gap:25.2,min:1,pauseAt:40,cast:true,far:K.railFar||2500,head:SKH,dwell:SK.dwell||0});
    api.ctx.details=Object.assign(api.ctx.details||{},{shinkansenLines:skCh.length});}
  // ---- every frame: move, and place (or hide) each vehicle ----
  // upload only the slots drawn this frame: marking the whole buffer sends every instance, used or not
  const pushRange=(im,n)=>{if(!n&&!im._wasN)return;im._wasN=n;im.instanceMatrix.updateRange.offset=0;im.instanceMatrix.updateRange.count=Math.max(1,n)*16;im.instanceMatrix.needsUpdate=true;
    if(im.instanceColor){im.instanceColor.updateRange.offset=0;im.instanceColor.updateRange.count=Math.max(1,n)*3;im.instanceColor.needsUpdate=true;}};
  const o={},d=new THREE.Object3D(),cam=new V3();let total=0;for(const f of fleet)total+=f.im.count;
  let lastT=0,ms=0;animHooks.push((now)=>{const T0=performance.now();const dt=lastT?Math.min(0.1,(now-lastT)/1000):0;lastT=now;cam.copy(camera.position);
    for(const f of fleet){let i=0;const im=f.im;f.hi=0;
      for(const v of f.list){const c=v.c;
        const F=f.opts.far;if(c.frame!==now||c.farFor!==F){c.frame=now;c.farFor=F;const ex=Math.max(c.x0-cam.x,0,cam.x-c.x1),ez=Math.max(c.z0-cam.z,0,cam.z-c.z1);c.near=ex*ex+ez*ez<F*F;}
        if(v.pause>0)v.pause-=dt;else{const s0=v.s;v.s+=v.v*v.dir*dt;if(v.s>c.len){v.s=c.len;v.dir=-1;v.pause=f.opts.pauseAt||0;}else if(v.s<0){v.s=0;v.dir=1;v.pause=f.opts.pauseAt||0;}
          else if(f.opts.dwell&&c.stops&&c.stops.length){const half=v.cars*v.gap/2;for(const st of c.stops){const t=st+v.dir*half;if((s0-t)*(v.s-t)<=0&&v.lastStop!==st){v.s=t;v.pause=f.opts.dwell*(0.8+((st*7.13)%1)*0.4);v.lastStop=st;break;}}}}
        if(!c.near)continue;   // the whole route is out of range: only moved along it
        for(let k=0;k<v.cars;k++){at(c,v.s-v.dir*k*v.gap,o);const dx=o.x-cam.x,dz=o.z-cam.z;
          if(f.head&&(k===0||k===v.cars-1)){if(dx*dx+dz*dz>F*F)continue;const fx=o.dx*v.dir*(k?-1:1),fz=o.dz*v.dir*(k?-1:1);d.position.set(o.x,o.y+0.05,o.z);d.rotation.set(0,Math.atan2(-fz,fx),0);d.updateMatrix();f.head.setMatrixAt(f.hi,d.matrix);f.head.setColorAt(f.hi,v.col);f.hi++;continue;}
          if(dx*dx+dz*dz>F*F)continue;   // out of range: not written at all, so not drawn
          const fx=o.dx*v.dir,fz=o.dz*v.dir;d.position.set(o.x-fz*v.lane,o.y+0.05,o.z+fx*v.lane);d.rotation.set(0,Math.atan2(-fz,fx),0);d.updateMatrix();im.setMatrixAt(i,d.matrix);im.setColorAt(i,v.col);i++;}}
      // only the vehicles in range are packed at the front, and only they are drawn
      im.count=i;pushRange(im,i);if(f.head){f.head.count=f.hi;pushRange(f.head,f.hi);}}
    if(/traindebug/.test(api.HASH0||'')){const f=fleet.find(q=>q.head);if(f&&f.list.length){const v=f.list[0];at(v.c,v.s,o);api.ctx.details.shinkansenAt=[Math.round(o.x),Math.round(o.y),Math.round(o.z),Math.round(v.dir*o.dx*100)/100,Math.round(v.dir*o.dz*100)/100,Math.round(v.pause)];}}
    ms=ms*0.95+(performance.now()-T0)*0.05;api.ctx.details.trafficMs=+ms.toFixed(2);api.ctx.details.trafficDrawn=fleet.reduce((a,f)=>a+f.im.count,0);});
  api.ctx.details=Object.assign(api.ctx.details||{},{romeVehicles:total,carChains:streetCh.length,tramLines:tramCh.length,railLines:railCh.length});
}
