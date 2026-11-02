// ================================================================= METROPOLIS — the test stage  [web]
// What stands where in each view. The spike's views put the real building and its shell side by side at 300 m with the same sun, show the switch with its dither, and
// a tiers view stands a few hundred towers of the two families round the worst street: about ten heroes, about sixty shells, impostors past 1 km.
// Boots once the library maps are in: the shells and the impostors are baked at load, from the heroes. Everything placed is a KRAND hash and a core/tags record.
const MPS={ready:false,keys:['spindle.intact','spindle.gutted','ledger.intact','ledger.gutted'],hero:{},rec:{},slot:{},mesh:{},live:[],pool:[],mode:null,bakeMs:0};
const MP_NEAR=300,MP_FAR=1000,MP_IMPFAR=3200;
// the tiers: a grid of blocks, a tower in about 70% of them, by hash
MPS.towers=(function(){const P=[],pitch=220;for(let i=-14;i<=14;i++)for(let j=-14;j<=14;j++){if(MP.u(11,i+20,j+20)>.7)continue;if(i===0&&j===0)continue;const x=i*pitch,z=j*pitch;if(Math.hypot(x,z)>3100)continue;
 const f=MP.u(12,i+20,j+20)<.55?'spindle':'ledger',g=MP.u(13,i+20,j+20)<.2;P.push({id:'mp.t.'+i+'.'+j,key:f+(g?'.intact':'.gutted'),x,z,yaw:f==='ledger'&&MP.u(14,i+20,j+20)<.5?Math.PI/2:0});}return P;})();
MP.mats();   /* now, not at the bake: the shells and impostors wait for these maps */
MPS.boot=function(){if(MPS.ready)return true;if(window._texPending>0)return false;const t0=performance.now();
 MPS.keys.forEach(k=>{const p=k.split('.');MPS.hero[k]=MP.hero(p[0],p[1]);MPS.rec[k]=KSHELL.record(MP.FAMILY[p[0]],p[1]);});
 const size=/[?&]atlas=1024\b/.test(location.search)?1024:2048;
 MPS.packed=KSHELL.pack(MPS.keys.map(k=>MPS.rec[k]),size);MPS.packed.forEach((s,i)=>{MPS.slot[s.id]=s;});MPS.atlas=KSHELL.atlas(size,renderer);
 if(!/[?&]nobake/.test(location.search))MPS.keys.forEach(k=>KSHELL.bake(MPS.atlas,MPS.rec[k],MPS.slot[k],MPS.hero[k]));if(!/[?&]nomip/.test(location.search))KSHELL.finish(MPS.atlas);
 MPS.mat=KSHELL.material(MPS.atlas,{steps:/[?&]steps=(\d+)/.test(location.search)?+RegExp.$1:24});MPS.mat.userData.U.uPx.value=2*Math.tan(camera.fov*Math.PI/360)/innerHeight;
 if(!/[?&]noshell\b/.test(location.search))MPS.keys.forEach(k=>{const im=KSHELL.draw(MPS.atlas,MPS.rec[k],MPS.slot[k],MPS.mat,new Array(256).fill([0,0,0]));im.count=0;scene.add(im);MPS.mesh[k]=im;});
 MPS.bakeMs=Math.round(performance.now()-t0);
 // the impostors: one set, a slot a family and state, built from the hero's own meshes
 const S=BIO.impostorSet('mp',{grid:8,cell:/[?&]impcell=(\d+)/.test(location.search)?+RegExp.$1:128,slots:4});MPS.impSet=S;BIO.kit('metro');
 MPS.imp={};
 MPS.keys.forEach(function(k){const p=k.split('.'),H=MP.hero(p[0],p[1],true),names=[];H.children.forEach((m,i)=>{const n='mp.'+k+'.'+i;BIO.def(n,m.geometry,m.material,{indexed:false});names.push([n,m]);});
  MPS.imp[k]=BIO.impostor('mp.'+k,function(){const M=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3(),c=new THREE.Color();
   names.forEach(function(e){const n=e[0],m=e[1];if(!m.isInstancedMesh){BIO.put(n,[0,0,0],null,1,null);return;}
    for(let i=0;i<m.count;i++){m.getMatrixAt(i,M);M.decompose(p,q,s);m.getColorAt(i,c);BIO.put(n,[p.x,p.y,p.z],q,[s.x,s.y,s.z],c.clone().convertLinearToSRGB());}});},{set:S,label:k});});
 BIO.impostorItem('mpImp',S,{label:'a far tower'});
 BIO.range=MP_IMPFAR;BIO.minRange=MP_FAR;BIO.chunk=800;MPS.towers.forEach(T=>BIO.impostorPut('mpImp',MPS.imp[T.key],[T.x,0,T.z],T.yaw,1));BIO.range=null;BIO.minRange=0;BIO.chunk=null;
 BIO.bake();BIO.kit('');MPS.impQ=BIO.IMP.list.slice();BIO.IMP.list.length=0;MPS.impN=0;
 MPS.impMeshes=[];scene.traverse(o=>{if(o.isInstancedMesh&&/mpImp/.test(o.name||''))MPS.impMeshes.push(o);});
 MPS.bakeAllMs=Math.round(performance.now()-t0);MPS.impMs=0;MPS.ready=true;MP.show(MPS.want||Object.keys(MP_CFG)[0]);return true;};
// one impostor a frame: 64 views of a tower, twice, in one call can outlast the GPU watchdog on a slow GPU (the context is lost: see KNOWN_ISSUES.md)
MPS.impTick=function(){if(!MPS.impQ||!MPS.impQ.length)return;const r=MPS.impQ.shift(),t0=performance.now();BIO.IMP.list.length=0;BIO.IMP.list.push(r);MPS.impN+=BIO.bakeImpostors(renderer,{wait:0})||0;MPS.impMs+=Math.round(performance.now()-t0);};
// a hero placed: a clone that shares the geometry
function mpHero(key,x,z,yaw,fade){const H=MPS.hero[key],g=new THREE.Group();H.children.forEach(m=>{let c=m.clone();if(m.isInstancedMesh){c=new THREE.InstancedMesh(m.geometry,m.material,m.count);c.instanceMatrix=m.instanceMatrix;c.instanceColor=m.instanceColor;c.frustumCulled=false;}g.add(c);});g.position.set(x,0,z);g.rotation.y=yaw||0;
 if(fade)mpFade(g,key,x,z);scene.add(g);MPS.live.push(g);return g;}
// the hero's half of the dither: BIO.lodFade on a copy of its materials, its box in the aLod attributes, the same band as the shell's. The geometry is cloned: a fade is per placed hero
function mpFade(g,key,x,z){const F=MP.FAMILY[key.split('.')[0]],R=F.footprint.r||0,hw=F.footprint.w?F.footprint.w/2:R*.6,hd=F.footprint.d?F.footprint.d/2:R*.6,H=F.height.tip,a=new Float32Array(12);
 a.set([x-hw,z-hd,x+hw,z+hd,0,H,0,-MP_NEAR,1e9,1e9,1e9,1e9]);const cache=MPS.fadeMats||(MPS.fadeMats=new Map());
 g.children.forEach(m=>{const buf=new THREE.InstancedInterleavedBuffer(a.slice(),12,Math.max(1,m.isInstancedMesh?m.count:1)),G=m.geometry.clone();G.setAttribute('aLodA',new THREE.InterleavedBufferAttribute(buf,4,0));G.setAttribute('aLodB',new THREE.InterleavedBufferAttribute(buf,4,4));G.setAttribute('aLodC',new THREE.InterleavedBufferAttribute(buf,4,8));m.geometry=G;
  let k=cache.get(m.material);if(!k){k=m.material.clone();k.onBeforeCompile=m.material.onBeforeCompile;k.customProgramCacheKey=m.material.customProgramCacheKey;k.userData=Object.assign({},m.material.userData);delete k.userData._lodFade;BIO.lodFade(k);cache.set(m.material,k);}m.material=k;});BIO._lodU.f.value=BIO.LOD.fade;}
function mpShells(list){const n={};MPS.keys.forEach(k=>n[k]=0);const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),one=new THREE.Vector3(1,1,1),p=new THREE.Vector3();
 list.forEach(s=>{const im=MPS.mesh[s[0]];if(!im)return;M.compose(p.set(s[1],0,s[2]),Q.setFromAxisAngle(Y,s[3]||0),one);im.setMatrixAt(n[s[0]]++,M);});
 MPS.keys.forEach(k=>{if(!MPS.mesh[k])return;MPS.mesh[k].count=n[k];MPS.mesh[k].instanceMatrix.needsUpdate=true;});}
function mpClear(){MPS.live.forEach(g=>{scene.remove(g);});MPS.live.length=0;MPS.pool.length=0;mpShells([]);MP.closeStoreys();MPS.impMeshes.forEach(o=>o.visible=false);MPS.mat.userData.U.uBand.value.set(0,0,.15);}
// one view's stage. cfg: {heroes:[[key,x,z,yaw]], shells:[...], band:[near,far], fade, tiers, storey:[family,k,x,z]}
MP.show=function(name){if(!MPS.ready){MPS.want=name;return;}const c=MP_CFG[name];if(!c)return;mpClear();MPS.mode=name;
 (c.heroes||[]).forEach(h=>mpHero(h[0],h[1],h[2],h[3],c.fade));mpShells(c.shells||[]);
 if(c.band)MPS.mat.userData.U.uBand.value.set(c.band[0],c.band[1],.15);
 if(c.tiers){MPS.impMeshes.forEach(o=>o.visible=true);MPS.mat.userData.U.uBand.value.set(0,0,.15);MPS.nextTier=0;}
 if(c.storey)MP.openStorey(c.storey[0],c.storey[1],c.storey[2],c.storey[3]);
 if(c.atlas){const m=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshBasicMaterial({map:MPS.atlas[c.atlas].texture,fog:false,toneMapped:false}));m.position.set(0,220,0);m.geometry.attributes.uv;scene.add(m);MPS.live.push(m);}};
// the tiers each half second: the nearest towers are heroes from a pool; 300 m - 1 km shells
MPS.tiersTick=function(){if(!MPS.ready||!MPS.mode)return;const c=MP_CFG[MPS.mode];if(!c||!c.tiers)return;const now=performance.now();if(now<(MPS.nextTier||0))return;MPS.nextTier=now+500;
 const e=camera.position,T=MPS.towers,near=[],mid=[];for(const t of T){const d=Math.hypot(t.x-e.x,t.z-e.z);if(d<MP_NEAR)near.push(t);else if(d<MP_FAR)mid.push(t);}
 MPS.live.forEach(g=>scene.remove(g));MPS.live.length=0;near.sort((a,b)=>Math.hypot(a.x-e.x,a.z-e.z)-Math.hypot(b.x-e.x,b.z-e.z));near.slice(0,10).forEach(t=>mpHero(t.key,t.x,t.z,t.yaw));near.slice(10).forEach(t=>mid.push(t));
 mpShells(mid.map(t=>[t.key,t.x,t.z,t.yaw]));MPS.tierN={heroes:Math.min(10,near.length),shells:mid.length,impostors:T.length-near.length-mid.length+Math.max(0,near.length-10)-Math.max(0,near.length-10)};};
tick(function(){if(!MPS.ready)MPS.boot();else{MPS.impTick();MPS.tiersTick();}});
// ---- the views. A pair stands 170 m apart, hero to the west, its shell to the east, looked at from 300 m
const D=300,sp='spindle.intact',sg='spindle.gutted',li='ledger.intact',lg='ledger.gutted';
const PAIR=(k,dx,yaw)=>({heroes:[[k,-dx,0,yaw||0]],shells:[[k,dx,0,yaw||0]]});
const MP_CFG={
 'Pair, Spindle, street':Object.assign(PAIR(sp,85),{}),'Pair, Spindle, raised':PAIR(sp,85),'Pair, Spindle gutted':PAIR(sg,85),'Pair, Spindle gutted, crown':PAIR(sg,85),'Pair, Spindle at 150 m':PAIR(sp,85),
 'Pair, Ledger':PAIR(li,80),'Pair, Ledger gutted':PAIR(lg,80),'Pair, Ledger end on':{heroes:[[li,0,-60]],shells:[[li,0,60]]},
 'Hero alone at 300 m':{heroes:[[sp,0,0]]},'Shell alone at 300 m':{shells:[[sp,0,0]]},
 'Switch, hero side (240 m)':{heroes:[[sp,0,0]],shells:[[sp,0,0]],band:[MP_NEAR,0],fade:true},'Switch, in the band (280 m)':{heroes:[[sp,0,0]],shells:[[sp,0,0]],band:[MP_NEAR,0],fade:true},'Switch, shell side (320 m)':{heroes:[[sp,0,0]],shells:[[sp,0,0]],band:[MP_NEAR,0],fade:true},
 'Far: shell at 900 m':{shells:[[sp,-120,0],[li,120,0]]},
 'The atlas: zoom':{atlas:'A'},'The atlas: colour':{atlas:'A'},'The atlas: normal':{atlas:'B'},'The atlas: rough, metal, window':{atlas:'C'},
 'Tiers, the worst street':{tiers:true},'Tiers, from a roof':{tiers:true},
 'Inside: the Spindle, a flat':{heroes:[[sp,0,0]],storey:['spindle',8,0,0]},'Inside: the Spindle, the lobby':{heroes:[[sp,0,0]],storey:['spindle',0,0,0]},'Inside: the Spindle, an office floor':{heroes:[[sp,0,0]],storey:['spindle',22,0,0]},'Inside: the Ledger, the council':{heroes:[[li,0,0]],storey:['ledger',11,0,0]},'Inside: the Ledger, an office':{heroes:[[li,0,0]],storey:['ledger',6,0,0]}};
const roomAt=(key,k,want)=>{const F=MP.FAMILY[key],st=MP.storey(F,k),R=st.rooms.filter(q=>q.mpKind===want)[0]||st.rooms[0],c=R.poly.reduce((s,p)=>[s[0]+p[0]/R.poly.length,s[1]+p[1]/R.poly.length],[0,0]);return [c[0],F.levels[k].y,c[1]];};
const outward=(p,y,e,o)=>{const l=Math.hypot(p[0],p[2])||1,dx=p[0]/l,dz=p[2]/l;return [p[0]-dx*o,p[1]+e,p[2]-dz*o,p[0]+dx*8,p[1]+y,p[2]+dz*8];};
const VIEWS={
 'Pair, Spindle, street':[0,1.7,D,0,95,0],'Pair, Spindle, raised':[0,90,D,0,110,0],'Pair, Spindle gutted':[0,1.7,D,0,90,0],'Pair, Spindle gutted, crown':[0,175,D-10,0,170,0],'Pair, Spindle at 150 m':[0,1.7,150,0,120,0],
 'Pair, Ledger':[0,6,D,0,26,0],'Pair, Ledger gutted':[0,6,D,0,26,0],'Pair, Ledger end on':[D,6,0,0,26,0],
 'Hero alone at 300 m':[0,1.7,D,0,110,0],'Shell alone at 300 m':[0,1.7,D,0,110,0],
 'Switch, hero side (240 m)':[0,1.7,240+40,0,110,0],'Switch, in the band (280 m)':[0,1.7,275+40,0,110,0],'Switch, shell side (320 m)':[0,1.7,320+40,0,110,0],
 'Far: shell at 900 m':[0,6,900,0,110,0],
 'The atlas: zoom':[-156,75,70,-156,75,0],'The atlas: colour':[0,220,420,0,220,0],'The atlas: normal':[0,220,420,0,220,0],'The atlas: rough, metal, window':[0,220,420,0,220,0],
 'Tiers, the worst street':[110,1.7,110,-1500,160,-1500],'Tiers, from a roof':[110,90,110,-900,60,-900],
 'Inside: the Spindle, a flat':outward(roomAt('spindle',8,'living'),1.4,1.6,2),'Inside: the Spindle, the lobby':[0,3,-20,14,3,-34],'Inside: the Spindle, an office floor':outward(roomAt('spindle',22,'office'),1.5,1.6,4),
 'Inside: the Ledger, the council':[-6,MP.LEDGER.levels[11].y+2,-7,8,MP.LEDGER.levels[11].y+2,-9],'Inside: the Ledger, an office':[-12,MP.LEDGER.levels[6].y+1.6,-7,-3,MP.LEDGER.levels[6].y+1.5,-11]};
// the buildings on the page, as records before anything is drawn
['spindle','ledger'].forEach(k=>{const F=MP.FAMILY[k];REGISTER({name:F.name,x:0,z:0,r:F.footprint.r||F.footprint.w/2,h:F.height.tip});});
