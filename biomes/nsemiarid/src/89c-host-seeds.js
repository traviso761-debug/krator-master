// ================================================================= HOST — the seed weather and the seeds the wind tears loose
// Both ride core/atmos's wind (89b-host-atmos.js: NSWIND, ATMOS.windAt with its gust fronts; the wind setting scales it).
// THE SEED WEATHER (biomes/nsemiarid/PLAN.md, section 7): a layer of drifting plumes, cotton and parachutes in a box round
// the camera, carried by the mean wind, bobbing, sinking and lifting again, wrapped at the box's edges so the drift never
// ends; more of it shows as the wind rises. Drawn as one Points cloud; ?seeds=0 turns it off.
// SEED FLIGHT (2026-10-22): the trees round the camera that bear windborne seed let it go when the wind where they stand
// passes their hold (a gust front running downwind sets them off in a wave): the helicopter trumpet flings its winged
// seeds off the rim of its spinning bell, the kite ash drops its keys, the ripe dandelion frill and the giant dandelion
// their plumes, the golden poplar its cotton. A winged seed autorotates down slowly and is carried off; a plume rides the
// gusts and lifts in them; each lands, lies a while and is gone. In a breeze only the cotton and the dandelions go, now
// and then; in a high wind everything does. The drift lantern is the other way about: its bulbs lift off in still air,
// rise and drift away, and a wind holds them down. Host-only (the kit's records say where the trees are and what they bear);
// in Godot the same rule on atm_wind. window._seeds counts what flew.
const SEEDS=(function(){const Q=new URLSearchParams(location.search);if(Q.get('seeds')==='0')return null;
 const N=2600,BOX=[260,90,260],pos=new Float32Array(N*3),ph=new Float32Array(N),rnd=ATMOS.stream(4421);
 for(let i=0;i<N;i++){pos[i*3]=(rnd()-.5)*BOX[0]*2;pos[i*3+1]=rnd()*BOX[1];pos[i*3+2]=(rnd()-.5)*BOX[2]*2;ph[i]=rnd()*6.283;}
 const tex=BIO.canvasTex(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);const c=w/2;g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.2;
  for(let k=0;k<14;k++){const a=k/14*6.283;g.beginPath();g.moveTo(c,c);g.lineTo(c+Math.cos(a)*c*.85,c+Math.sin(a)*c*.85);g.stroke();}
  g.fillStyle='rgba(255,255,255,1)';g.beginPath();g.arc(c,c,3,0,6.283);g.fill();});
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setDrawRange(0,N);
 const mat=new THREE.PointsMaterial({map:tex,size:.9,sizeAttenuation:true,transparent:true,depthWrite:false,alphaTest:.05,color:0xf4f0e6,opacity:.9});
 const P=new THREE.Points(geo,mat);P.frustumCulled=false;P.userData.probeSkip=true;P.userData.host=true;P.userData.inspectLabel='The seed weather';scene.add(P);
 ATMOS.hook((t,hr,dt)=>{const w=ATMOS.U.wind.value,ws=NSWIND.WIND_MS,c=camera.position;
  for(let i=0;i<N;i++){const k=i*3;pos[k]+=w.x*ws*dt+Math.sin(t*.7+ph[i])*.4*dt;pos[k+2]+=w.y*ws*dt+Math.cos(t*.6+ph[i])*.4*dt;pos[k+1]+=Math.sin(t*1.3+ph[i]*2)*.5*dt-.15*dt;
   for(const a of [0,2]){const lim=BOX[a];if(pos[k+a]>lim)pos[k+a]-=lim*2;else if(pos[k+a]<-lim)pos[k+a]+=lim*2;}
   if(pos[k+1]<0)pos[k+1]+=BOX[1];else if(pos[k+1]>BOX[1])pos[k+1]-=BOX[1];}
  geo.setDrawRange(0,Math.round(N*Math.min(1,.35+.3*ATMOS.windScale)));   // a calm shows a third of it, a gale all
  P.position.set(c.x,Math.max(terrainH(c.x,c.z),c.y-BOX[1]*.6),c.z);geo.attributes.position.needsUpdate=true;});
 return{points:P,n:N};})();

const FLIGHT=(function(){const Q=new URLSearchParams(location.search);if(Q.get('seeds')==='0')return null;
 const R=ATMOS.stream(7717),rr=(a,b)=>a+(b-a)*R();
 // what each tree lets go: the seed kind, the wind it holds against (m/s), seeds a second per m/s past it, where they
 // leave from (a height and a radius in the tree's own terms) and their size (m)
 const BEAR={
  trumpet:{kind:'heli',hold:8.5,rate:.9,from:T=>[T.y0+T.H*.84+T.crownR*.85,T.crownR],size:[.6,.95],fling:true},
  samara:{kind:'heli',hold:9,rate:.5,from:T=>[T.y0+T.H*.72,T.crownR*.8],size:[.5,.7]},
  frill:{kind:'plume',hold:9.5,rate:.8,from:T=>[T.y0+T.H*.82+T.crownR*.6,T.crownR],size:[.6,1.0],when:T=>T.seed%4===1||T.seed%4===2},
  dandelion:{kind:'plume',hold:5.5,rate:.25,from:T=>[T.y0+T.H,T.crownR*.5],size:[.26,.4]},
  poplar:{kind:'plume',hold:4.5,rate:.12,from:T=>[T.y0+T.H*.72,T.crownR],size:[.14,.22],when:T=>!T.dead},
  // the drift lantern the other way about: its gas-filled bulbs lift off in still air, and a wind holds them down (calm)
  lantern:{kind:'lantern',calm:true,hold:5,rate:.02,from:T=>[T.y0+T.H*.85,T.crownR],size:[.6,1.0]}};
 const POOL={heli:0,plume:1,lantern:2};
 const SP=NSEMIARID.SPECIES,bearOf=SP.map(S=>BEAR[S.key]||null);
 // the pools: winged seeds (one quad, a single maple key from the owner's sheet, else drawn; its heavy end, the card's
 // left, on the axis it turns about), plumes (two crossed quads) and lanterns (the kit's own bulb, glowing a little)
 const NH=900,NP=1600,NL=160,CAP=NH+NP+NL,R0=[0,NH,NH+NP,CAP],poolOf=i=>i<NH?0:i<NH+NP?1:2;
 const LIBP=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('nsemiarid',n):null;
 const card=(n,draw)=>{const L=LIBP(n);if(L){const t=KMAT.textures(L,{aniso:4,flipY:false}).map;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;return t;}return BIO.canvasTex(128,128,draw);};
 const heliTex=card('seed.samara',(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='rgba(200,160,110,.95)';g.beginPath();g.ellipse(w*.62,h*.5,w*.34,h*.17,0,0,6.283);g.fill();
  g.fillStyle='rgba(120,100,60,1)';g.beginPath();g.ellipse(w*.2,h*.5,w*.1,h*.09,0,0,6.283);g.fill();});
 const plumeTex=NSEMIARID.MAT.pappus.map;
 const quad=(cross)=>{const g=new THREE.BufferGeometry(),p=[],u=[],ix=[];const add=(rx)=>{const b=p.length/3;
   if(rx)p.push(0,-.5,-.5, 0,-.5,.5, 0,.5,.5, 0,.5,-.5);else p.push(-.5,-.5,0, .5,-.5,0, .5,.5,0, -.5,.5,0);u.push(0,1,1,1,1,0,0,0);ix.push(b,b+1,b+2,b,b+2,b+3);};
  add(false);if(cross)add(true);g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));g.setIndex(ix);g.computeVertexNormals();return g;};
 const mk=(geo,tex,n,label,col)=>{const m=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({map:tex,color:col,alphaTest:.3,side:THREE.DoubleSide}),n);
  m.count=0;m.frustumCulled=false;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.userData.probeSkip=true;m.userData.host=true;m.userData.inspectLabel=label;scene.add(m);return m;};
 const MH=mk(quad(false).translate(.35,0,0),heliTex,NH,'Winged seeds in flight',0xffffff),MP=mk(quad(true),plumeTex,NP,'Plumed seeds in flight',0xf6f2ea);
 const LC=new THREE.Color(NSEMIARID.byKey.lantern.leaf[0]).multiplyScalar(1.5),
  ML=new THREE.InstancedMesh(BIO.kits.nsemiarid.defs.lantern.geo,new THREE.MeshLambertMaterial({color:LC,emissive:LC.clone().multiplyScalar(.25),vertexColors:true}),NL);
 ML.count=0;ML.frustumCulled=false;ML.instanceMatrix.setUsage(THREE.DynamicDrawUsage);ML.userData.probeSkip=true;ML.userData.host=true;ML.userData.inspectLabel='Drift lanterns aloft';scene.add(ML);
 // a seed: position, velocity, age, size, spin and its rate, and when it landed
 const S=[];for(let i=0;i<CAP;i++)S.push({on:false,heli:i<NH,lantern:i>=NH+NP,x:0,y:0,z:0,vx:0,vy:0,vz:0,age:0,s:1,a:0,ar:0,tilt:0,landed:-1});
 const free=[[],[],[]];for(let i=CAP-1;i>=0;i--)free[poolOf(i)].push(i);
 const stats={released:0,landed:0,active:0,bySpecies:{},sources:0};window._seeds=stats;
 // the candidate sources: the bearing trees within RADIUS of the camera, re-listed as the camera moves
 const RADIUS=420;let SRC=[],last=null;
 const relist=c=>{last={x:c.x,z:c.z};SRC=[];for(const T of NSEMIARID.TREES){const B=bearOf[T.sp];if(!B||(B.when&&!B.when(T)))continue;
   const d=Math.hypot(T.x-c.x,T.z-c.z);if(d<RADIUS)SRC.push({T,B,d,acc:R()});}
  SRC.sort((a,b)=>a.d-b.d);if(SRC.length>500)SRC.length=500;stats.sources=SRC.length;};
 // a full pool gives up the seed farthest from the camera: the trees in view always throw
 const steal=(pool,c)=>{let b=-1,bd=-1;const i0=R0[pool],i1=R0[pool+1];for(let i=i0;i<i1;i++){const q=S[i];const d=(q.x-c.x)**2+(q.z-c.z)**2;if(d>bd){bd=d;b=i;}}return b;};
 const release=(src)=>{const B=src.B,T=src.T,pool=POOL[B.kind],c=api.pin||camera.position;
  const idx=free[pool].length?free[pool].pop():steal(pool,c);if(idx<0)return;const s=S[idx];
  const f=B.from(T),a=R()*6.283,r=f[1]*Math.sqrt(R()),w=NSWIND.at(T.x,T.z);
  s.on=true;s.x=T.x+Math.cos(a)*r;s.z=T.z+Math.sin(a)*r;s.y=f[0]+rr(-.4,.4);s.age=0;s.landed=-1;s.s=rr(B.size[0],B.size[1]);
  s.vx=w[0]*.5;s.vz=w[1]*.5;s.vy=rr(-.2,.6);
  // a trumpet's seed leaves the rim of a turning bell: flung along the rim's way round, outward
  if(B.fling){const sp=NSWIND.mean()*.42*f[1];s.vx+=-Math.sin(a)*sp+Math.cos(a)*1.5;s.vz+=Math.cos(a)*sp+Math.sin(a)*1.5;}
  if(s.lantern){s.vx=w[0]*.2;s.vz=w[1]*.2;s.vy=.2;}
  s.a=R()*6.283;s.ar=(s.heli?rr(14,24):rr(.3,.9))*(R()<.5?-1:1);s.tilt=s.heli?rr(.25,.45):rr(-.2,.2);
  stats.released++;const k=SP[T.sp].key;stats.bySpecies[k]=(stats.bySpecies[k]||0)+1;};
 const M4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(0,0,0,'YXZ'),vp=new THREE.Vector3(),vs=new THREE.Vector3();
 const api={stats,meshes:null,BEAR,pin:null};   // pin {x,z}: list the sources round it instead of the camera (the probe's gale check)
 ATMOS.hook((t,hr,dt)=>{if(!dt)return;const c=api.pin||camera.position;if(!last||Math.hypot(c.x-last.x,c.z-last.z)>40)relist(c);
  // the trees let go where the wind passes their hold
  for(const src of SRC){const w=NSWIND.at(src.T.x,src.T.z),ex=src.B.calm?src.B.hold-w[2]:w[2]-src.B.hold;if(ex<=0)continue;src.acc+=src.B.rate*ex*dt;
   while(src.acc>=1){src.acc-=1;release(src);}}
  // the flight
  let nh=0,np=0,nl=0,act=0;
  for(let i=0;i<CAP;i++){const s=S[i];if(!s.on)continue;s.age+=dt;
   if(s.lantern){const w=NSWIND.at(s.x,s.z),k=Math.min(1,dt/2.5);   // a lantern rises half a metre a second, bobbing, and drifts
    s.vx+=(w[0]-s.vx)*k;s.vz+=(w[1]-s.vz)*k;s.vy+=(.55+.25*Math.sin(t*.8+i)-s.vy)*Math.min(1,dt);s.x+=s.vx*dt;s.y+=s.vy*dt;s.z+=s.vz*dt;s.a+=s.ar*dt;
    if(s.age>150||s.y-terrainH(s.x,s.z)>260||Math.hypot(s.x-c.x,s.z-c.z)>RADIUS*1.6){s.on=false;free[2].push(i);continue;}
    act++;e.set(.08*Math.sin(t+i),s.a,.08*Math.cos(t*.9+i));q.setFromEuler(e);vp.set(s.x,s.y,s.z);vs.set(s.s,s.s*1.2,s.s);M4.compose(vp,q,vs);M4.toArray(ML.instanceMatrix.array,(nl++)*16);continue;}
   if(s.landed<0){const w=NSWIND.at(s.x,s.z),g=ATMOS.gust(t,s.x,s.z),k=Math.min(1,dt/(s.heli?.7:.3));
    s.vx+=(w[0]-s.vx)*k;s.vz+=(w[1]-s.vz)*k;
    // a winged seed autorotates down at about a metre a second; a plume sinks slower and the gusts lift it
    const fall=s.heli?-1.05:-.35+.9*Math.max(0,g)+.25*Math.sin(t*1.7+i);s.vy+=(fall-s.vy)*Math.min(1,dt*1.5);
    s.x+=s.vx*dt;s.y+=s.vy*dt;s.z+=s.vz*dt;s.a+=s.ar*dt;
    const gy=Math.max(terrainH(s.x,s.z),waterH(s.x,s.z));if(s.y<gy+.05){s.y=gy+.05;s.landed=s.age;stats.landed++;}}
   // landed: it lies a while and is gone; far off or old, gone
   if((s.landed>=0&&s.age-s.landed>8)||s.age>120||Math.hypot(s.x-c.x,s.z-c.z)>RADIUS*1.6){s.on=false;free[s.heli?0:1].push(i);continue;}
   act++;const sz=s.s*(s.landed>=0?Math.max(.01,1-(s.age-s.landed)/8):1);
   if(s.heli){e.set(s.landed>=0?1.45:s.tilt,s.a,0);q.setFromEuler(e);vp.set(s.x,s.y,s.z);vs.set(sz*1.5,sz*.6,sz);M4.compose(vp,q,vs);M4.toArray(MH.instanceMatrix.array,nh*16);nh++;}
   else{e.set(s.landed>=0?.9:s.tilt,s.a,0);q.setFromEuler(e);vp.set(s.x,s.y+sz*.3,s.z);vs.set(sz,sz*1.3,sz);M4.compose(vp,q,vs);M4.toArray(MP.instanceMatrix.array,(np++)*16);}}
  MH.count=nh;MP.count=np;ML.count=nl;MH.instanceMatrix.needsUpdate=true;MP.instanceMatrix.needsUpdate=true;ML.instanceMatrix.needsUpdate=true;stats.active=act;});
 api.meshes=[MH,MP,ML];return api;})();
