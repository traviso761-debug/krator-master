// ================================================================= HOST — the ruined vehicles in the streets (the owner, 2026-11-07)
// [web] The records are 41b-av-wrecks.js's (AV.wrecks, on the stage's lattice, scorch and ground); this fragment draws them from the Motor
// Vehicles kit's bundle (39v: KratorVehicles.build(key, {variant, seed, state}), the lowest point on y = 0, userData.ruin the form). A wreck is
// 3 to 13 draw calls and 2,000 to 5,000 triangles, so not every record is in the scene: a POOL of the nearest records to the eye inside AVW_R
// metres (core/space, refreshed every quarter second as 70 refreshes the tiers), at most AVW_MAX of them, is drawn; the rest stand as records
// only (the inspector and the checks see them). A PROTOTYPE per (key, variant, state, seed) is built once, when first wanted, a few a tick (the
// kit's ruin pass is a few ms), and every wreck of that look is a clone of it (geometry and materials shared). No shadows: the wrecks sit under
// the towers' and the forest's. Nothing here decides where a wreck stands: it draws the record.
const AVW_R=450,AVW_MAX=48,AVW_BUILDS=3,AVW_PROTOS=72;
const AVW=(function(){const kit=typeof KratorVehicles!=='undefined'?KratorVehicles:null,out={records:[],live:new Map(),protos:new Map(),byId:new Map(),evicted:0,built:0,buildMs:0,drawn:0,ok:!!kit,tick(){}};
 if(!kit){reportErr('wrecks: KratorVehicles is not on the page (39v-mp-vehicles-bundle.js)');return out;}
 const sizes={};kit.list().forEach(v=>{sizes[v.key]={w:v.w,d:v.d,h:v.h,name:v.name};});
 /* where none may stand: the lake, a plinth, a crater's bowl and rim, the viaduct's corridor, an engine's pad, the scar, off the page */
 const ok=(x,z)=>{if(Math.hypot(x,z)>STAGE.R-30)return false;const g=terrainH(x,z);if(g<STAGE.lakeY+1.5)return false;if(STAGE.built(x,z)>.05||STAGE.F.scar(x,z)>.5||STAGE.viaduct.d(x,z)<14)return false;
  for(const c of STAGE.craters)if(Math.hypot(x-c.x,z-c.z)<c.r*1.3+6)return false;for(const E of STAGE.engines)if(Math.hypot(x-E.x,z-E.z)<E.r+30)return false;return true;};
 /* the plazas for the helicopters: the lattice's nodes round the eye's start where no tower stands (the city's plan left the lot empty) */
 const LT=STAGE.lattice,p=LT.pitch,plazas=[],pq=[];for(let i=-6;i<=6;i++)for(let j=-6;j<=6;j++){const lx=i*p,lz=j*p,x=lx*LT.c-lz*LT.s,z=lx*LT.s+lz*LT.c;if(Math.hypot(x-STAGE.near.x,z-STAGE.near.z)>900)continue;
  pq.length=0;STAGE.pads.query(x,z,0,pq);if(pq.some(T=>Math.hypot(T.x-x,T.z-z)<T.padR+12))continue;if(STAGE.F.density(x,z)<.4||!ok(x,z))continue;plazas.push({x,z});}
 /* nearness to the lake (the owner, 2026-11-09: the wrecks and the signs of violence increase toward it): 1 at the model's water cells, 0 some 3 km
    from the nearest; the lake lies to the page's west and north-west, the inlets north and south of the ridge */
 const G=STAGE.region.grid,WC=G.water.map(w=>[G.x0+w[0]*G.dx,G.z0+w[1]*G.dz]),halfCell=Math.max(G.dx,G.dz)*.5;
 const lake=(x,z)=>{let d=1e9;for(const w of WC){const e=Math.hypot(x-w[0],z-w[1]);if(e<d)d=e;}return smooth(3200,0,Math.max(0,d-halfCell));};
 const t0=performance.now();
 const W=AV.wrecks({R:STAGE.R,lattice:LT,seed:STAGE.seed+41,scorch:STAGE.scorch,density:STAGE.F.density,lake,ok,craters:STAGE.craters,avoid:STAGE.wreckAvoid||[],max:STAGE.wreckMax==null?700:STAGE.wreckMax,
  formOf:kit.ruinOf,sizes,air:{jet:true,helis:2,plazas}});
 /* each record on the ground: y at its centre, pitched by the slope under nose and tail, rolled by the slope across (the roadbed is level, the kerbs
    are not); registered as kind 'wreck' with the inspector's words */
 const SP=KSPACE.create({cell:150});
 W.forEach(r=>{const fx=Math.sin(r.yaw),fz=Math.cos(r.yaw),hd=r.d*.4,hw=r.w*.4,yn=terrainH(r.x+fx*hd,r.z+fz*hd),yt=terrainH(r.x-fx*hd,r.z-fz*hd),yl=terrainH(r.x+fz*hw,r.z-fx*hw),yr=terrainH(r.x-fz*hw,r.z+fx*hw);
  r.y=Math.min(yn,yt,yl,yr,terrainH(r.x,r.z))+.02;r.pitch=Math.atan2(yt-yn,hd*2)*.8;r.roll=Math.atan2(yl-yr,hw*2)*.8;   /* +x about the heading is the left kerb (yl); a nose on higher ground pitches the group's +z up: a negative x rotation */
  const nm=(sizes[r.key]||{}).name||r.name;r.label='a ruined '+nm+' ('+r.state+(r.form?', '+r.form:'')+')';
  SP.insert(r,r.x,r.z,Math.max(r.w,r.d)/2);});
 /* the registry takes the wrecks by 600 m cell, not one a wreck: only the nearest 48 are drawn, so a wreck's own volume reads empty to the probe
    from any other view (the page's own check, HCHK.wrecks, reads the full record list) */
 {const cells=new Map();W.forEach(r=>{const k=Math.floor(r.x/600)+','+Math.floor(r.z/600);let c=cells.get(k);if(!c){c={n:0,sx:0,sz:0,y0:1e9,burnt:0};cells.set(k,c);}c.n++;c.sx+=r.x;c.sz+=r.z;c.y0=Math.min(c.y0,r.y);if(r.state==='burnt')c.burnt++;});
  cells.forEach((c,k)=>REGISTER({name:'ruined Ancient vehicles in the streets ('+c.n+', '+c.burnt+' burnt)',kind:'wreck',x:c.sx/c.n,z:c.sz/c.n,y:c.y0-1,r:440,h:16,tags:{kind:'wreck',cell:k,n:c.n,burnt:c.burnt}}));}
 out.records=W;W.forEach(r=>out.byId.set(r.id,r));out.planMs=Math.round(performance.now()-t0);out.plazas=plazas.length;
 /* the prototypes: one group per look, built when first wanted; its meshes are the host's, unshadowed, named for the inspector */
 const protoOf=r=>{const k=r.key+'/'+r.variant+'/'+r.state+'/'+r.seed;let g=out.protos.get(k);if(g)return g;const t=performance.now();
  try{g=kit.build(r.key,{variant:r.variant,seed:r.seed,state:r.state});}catch(e){reportErr('wreck '+k+': '+(e.stack||e));g=null;}
  if(!g)return null;g.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=false;m.userData.host=true;}});out.protos.set(k,g);out.built++;out.buildMs+=Math.round(performance.now()-t);return g;};
 const Y=new THREE.Vector3(0,1,0),E=new THREE.Euler();
 const place=r=>{const g=protoOf(r);if(!g)return null;const c=g.clone();c.traverse(m=>{if(m.isMesh){m.userData.host=true;m.userData.inspectLabel=r.label;}});
  c.position.set(r.x,r.y,r.z);c.rotation.set(0,0,0);c.rotateOnAxis(Y,r.yaw);c.rotateX(r.pitch);c.rotateZ(r.roll);c.userData.wreck=r.id;c.userData.host=true;c.name='wreck:'+r.id;scene.add(c);return c;};
 /* the pool, each quarter second: the nearest AVW_MAX records inside AVW_R of the eye; what left the pool leaves the scene (the looks stay, up to AVW_PROTOS) */
 const q=[];let next=0;
 out.tick=function(){const now=performance.now();if(now<next)return;next=now+250;const e=camera.position;q.length=0;SP.query(e.x,e.z,AVW_R,q);
  const want=q.filter(r=>{r.dist=Math.hypot(r.x-e.x,r.z-e.z);return r.dist<AVW_R+r.d/2;}).sort((a,b)=>a.dist-b.dist).slice(0,AVW_MAX),ids=new Set(want.map(r=>r.id));
  out.live.forEach((g,id)=>{if(!ids.has(id)){scene.remove(g);out.live.delete(id);}});
  let builds=0;for(const r of want){if(out.live.has(r.id))continue;const k=r.key+'/'+r.variant+'/'+r.state+'/'+r.seed;if(!out.protos.has(k)){if(builds>=AVW_BUILDS)continue;builds++;}
   const g=place(r);if(g)out.live.set(r.id,g);}
  out.drawn=out.live.size;
  /* the looks kept (the heap, 2026-11-09: a look is keyed by its seed, so nearly every wreck is its own, and every view kept the ones it built): past
     AVW_PROTOS, the oldest looks no live wreck wears go, their geometry freed; a look is built again if its wreck comes back */
  if(out.protos.size>AVW_PROTOS){const used=new Set();out.live.forEach((g,id)=>{const r=out.byId.get(id);if(r)used.add(r.key+'/'+r.variant+'/'+r.state+'/'+r.seed);});
   for(const [k,g] of out.protos){if(out.protos.size<=AVW_PROTOS)break;if(used.has(k))continue;out.protos.delete(k);g.traverse(m=>{if(m.geometry)m.geometry.dispose();});out.evicted++;}}};
 return out;})();
tick(function(){if(AVW.ok)AVW.tick();});
