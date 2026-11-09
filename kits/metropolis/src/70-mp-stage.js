// ================================================================= METROPOLIS — the test stage  [web]
// What stands where in each view. The spike's views put the real building and its shell side by side at 300 m with the same sun, show the switch with its dither, and
// a tiers view stands a few hundred towers of the two families round the worst street: about ten heroes, about sixty shells, impostors past 1 km.
// Boots once the library maps are in: the shells and the impostors are baked at load, from the heroes. Everything placed is a KRAND hash and a core/tags record.
const MPS={ready:false,keys:[].concat(...['spindle','ledger'].map(f=>MP.RUINS.map(s=>f+'.'+s))),hero:{},rec:{},slot:{},mesh:{},live:[],pool:[],mode:null,bakeMs:0};
/* shells to 1.4 km (1 km made the impostors, 128 px a view, soft on screen); the near rubble stops at 1 km, the far rubble at 3.2 km */
const MP_NEAR=300,MP_FAR=1400,MP_IMPFAR=3200,MP_RUBBLE=1000;
// the tiers: a grid of blocks, a tower in about 70% of them, by hash
MPS.towers=(function(){const P=[],pitch=/[?&]pitch=(\d+)/.test(location.search)?+RegExp.$1:220;MPS.pitch=pitch;const NB=Math.ceil(3100/pitch);for(let i=-NB;i<=NB;i++)for(let j=-NB;j<=NB;j++){if(MP.u(11,i+40,j+40)>.7)continue;if(i===0&&j===0)continue;const x=i*pitch,z=j*pitch;if(Math.hypot(x,z)>3100)continue;
 /* the states, by hash: a fifth intact, a quarter gutted, the five ruins a tenth or so each. A ruined Spindle is turned by quarters so its rubble (along a fin, at
    a0 in its frame) falls where the fewest neighbouring blocks hold a tower: the diagonal block it heads for and the two beside it; ties go to the hash's quarter */
 const f=MP.u(12,i+40,j+40)<.55?'spindle':'ledger',g=MP.u(13,i+40,j+40),st=MP.RUINS[[.2,.45,.57,.69,.79,.89,1.01].findIndex(c=>g<c)],k0=Math.floor(MP.u(15,i+40,j+40)*4),
  has=(a,b)=>!(MP.u(11,a+40,b+40)>.7)&&!(a===0&&b===0)&&Math.hypot(a*pitch,b*pitch)<=3100,
  crowd=k=>{const w=MP.SPINDLE.fins.a0-k*Math.PI/2,di=Math.sign(Math.round(Math.cos(w)*10)),dj=Math.sign(Math.round(Math.sin(w)*10));return (has(i+di,j+dj)?2:0)+(di&&has(i+di,j)?1:0)+(dj&&has(i,j+dj)?1:0);},
  kb=[0,1,2,3].map(q=>(k0+q)%4).reduce((b,k)=>crowd(k)<crowd(b)?k:b,k0),turn=f==='spindle'&&MP.RUINS.indexOf(st)>1?kb*Math.PI/2:0;
 P.push({id:'mp.t.'+i+'.'+j,key:f+'.'+st,x,z,yaw:f==='ledger'?(MP.u(14,i+40,j+40)<.5?Math.PI/2:0):turn});}return P;})();
MP.mats();   /* now, not at the bake: the shells and impostors wait for these maps */
MPS.boot=function(){if(MPS.ready)return true;if(window._texPending>0)return false;const t0=performance.now();
 MPS.keys.forEach(k=>{const p=k.split('.');MPS.hero[k]=MP.hero(p[0],p[1]);MPS.rec[k]=KSHELL.record(MP.FAMILY[p[0]],p[1]);});
 const size=/[?&]atlas=1024\b/.test(location.search)?1024:2048;
 MPS.packed=KSHELL.pack([].concat(...MPS.keys.map(k=>KSHELL.slots(MPS.rec[k]))),size);MPS.packed.forEach((s,i)=>{MPS.slot[s.id]=s;});MPS.atlas=KSHELL.atlas(size,renderer);
 if(!/[?&]nobake/.test(location.search))MPS.keys.forEach(k=>KSHELL.bake(MPS.atlas,MPS.rec[k],MPS.slot[k],MPS.hero[k],MPS.slot[k+'.top'],MPS.slot[k+'.bot']));if(!/[?&]nomip/.test(location.search))KSHELL.finish(MPS.atlas);
 MPS.mat=KSHELL.material(MPS.atlas,{steps:/[?&]steps=(\d+)/.test(location.search)?+RegExp.$1:32});MPS.mat.userData.U.uPx.value=2*Math.tan(camera.fov*Math.PI/360)/Math.max(1,innerHeight);
 if(!/[?&]noshell\b/.test(location.search))MPS.keys.forEach(k=>{const im=KSHELL.draw(MPS.atlas,MPS.rec[k],MPS.slot[k],MPS.mat,new Array(1400).fill([0,0,0]),MPS.slot[k+'.top'],MPS.slot[k+'.bot']);im.count=0;scene.add(im);MPS.mesh[k]=im;});
 /* the rubble: one instanced mesh a material and state, its instances the ruins within 1 km (MP.debris): past it, a ruin is its impostor */
 MPS.debris={};MPS.debrisFar={};MPS.debrisTris={};MPS.keys.forEach(k=>{const p=k.split('.'),G=MP.debris(MP.FAMILY[p[0]],p[1]);if(!G)return;MPS.debrisTris[k]=G.userData.tris;
  MPS.debris[k]=G.children.map(m=>{const im=new THREE.InstancedMesh(m.geometry,m.material,MPS.towers.length+8);im.count=0;im.frustumCulled=false;im.name=m.name;im.castShadow=im.receiveShadow=!!MP.shadow;scene.add(im);return im;});
  /* the far rubble: the heaps on a 16 m grid, no blocks or pieces, for the ruins past 1 km, whose impostors have none */
  const Gf=MP.debris(MP.FAMILY[p[0]],p[1],true);MPS.debrisFar[k]=Gf.children.map(m=>{const im=new THREE.InstancedMesh(m.geometry,m.material,MPS.towers.length+8);im.count=0;im.frustumCulled=false;im.name=m.name+'.far';scene.add(im);return im;});});
 MPS.bakeMs=Math.round(performance.now()-t0);
 // the impostors: one set, a slot a family and state, built from the hero's own meshes
 const S=BIO.impostorSet('mp',{grid:8,cell:/[?&]impcell=(\d+)/.test(location.search)?+RegExp.$1:128,slots:MPS.keys.length});MPS.impSet=S;BIO.kit('metro');
 MPS.imp={};
 MPS.keys.forEach(function(k){const p=k.split('.'),H=MP.hero(p[0],p[1],true),names=[];H.children.forEach((m,i)=>{const n='mp.'+k+'.'+i;BIO.def(n,m.geometry,m.material,{indexed:false});names.push([n,m]);});
  MPS.imp[k]=BIO.impostor('mp.'+k,function(){const M=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3(),c=new THREE.Color();
   names.forEach(function(e){const n=e[0],m=e[1];if(!m.isInstancedMesh){BIO.put(n,[0,0,0],null,1,null);return;}
    for(let i=0;i<m.count;i++){m.getMatrixAt(i,M);M.decompose(p,q,s);m.getColorAt(i,c);BIO.put(n,[p.x,p.y,p.z],q,[s.x,s.y,s.z],c.clone().convertLinearToSRGB());}});},{set:S,label:k});});
 BIO.impostorItem('mpImp',S,{label:'a far tower'});
 BIO.range=MP_IMPFAR;BIO.minRange=0;BIO.chunk=800;MPS.towers.forEach(T=>BIO.impostorPut('mpImp',MPS.imp[T.key],[T.x,0,T.z],T.yaw,1));BIO.range=null;BIO.minRange=0;BIO.chunk=null;
 BIO.bake();BIO.kit('');MPS.impQ=BIO.IMP.list.slice();BIO.IMP.list.length=0;MPS.impN=0;
 MPS.impMeshes=[];scene.traverse(o=>{if(o.isInstancedMesh&&/mpImp/.test(o.name||'')){MPS.impMeshes.push(o);o.userData.full=o.instanceMatrix.array.slice();}});
 MPS.bakeAllMs=Math.round(performance.now()-t0);MPS.impMs=0;MPS.ready=true;MP.show(MPS.want||Object.keys(MP_CFG)[0]);return true;};
// one impostor a frame: 64 views of a tower, twice, in one call can outlast the GPU watchdog on a slow GPU (the context is lost: see KNOWN_ISSUES.md)
MPS.impTick=function(){if(!MPS.impQ||!MPS.impQ.length)return;const r=MPS.impQ.shift(),t0=performance.now();BIO.IMP.list.length=0;BIO.IMP.list.push(r);MPS.impN+=BIO.bakeImpostors(renderer,{wait:0})||0;MPS.impMs+=Math.round(performance.now()-t0);};
// a hero placed: a clone that shares the geometry
function mpHero(key,x,z,yaw,fade){const H=MPS.hero[key]||(MPS.hero[key]=MP.hero(key.split('.')[0],key.split('.')[1])),g=new THREE.Group();H.children.forEach(m=>{let c=m.clone();if(m.isInstancedMesh){c=new THREE.InstancedMesh(m.geometry,m.material,m.count);c.instanceMatrix=m.instanceMatrix;c.instanceColor=m.instanceColor;c.frustumCulled=false;}g.add(c);});g.userData.leaves=g.children.filter(c=>c.userData.door).map(c=>({m:c,base:c.position.clone(),ax:c.userData.door.ax,w:c.userData.door.w,r:3+c.userData.door.w/2,dark:!!c.userData.door.dark,open:0}));g.position.set(x,0,z);g.rotation.y=yaw==null?0:yaw;
 if(MP.shadow)MP.shadow.cast(g);if(fade)mpFade(g,key,x,z,yaw);g.userData.mp={key,x,z,yaw:yaw==null?0:yaw};scene.add(g);MPS.live.push(g);MP.walkDirty=true;return g;}
// the hero's half of the dither: BIO.lodFade on a copy of its materials, its box in the aLod attributes, the same band as the shell's. The box is per placed hero, so each hero has a
// shallow geometry of its own: its own aLod buffer over the shared vertex buffers
const mpHalf=(key,yaw)=>{const f=MPS.rec[key].frame,h=f.mode?[f.a,f.b]:[f.a*.6,f.a*.6];return Math.abs(Math.cos(yaw==null?0:yaw))<.5?[h[1],h[0]]:h;};
const mpBoxDist=(key,x,z,yaw,e)=>{const h=mpHalf(key,yaw),dx=Math.max(Math.abs(e.x-x)-h[0],0),dz=Math.max(Math.abs(e.z-z)-h[1],0),dy=Math.max(e.y-MPS.rec[key].frame.H,0);return Math.hypot(dx,dy,dz);};
function mpFade(g,key,x,z,yaw){const h=mpHalf(key,yaw),H=MPS.rec[key].frame.H,a=new Float32Array(12);
 a.set([x-h[0],z-h[1],x+h[0],z+h[1],0,H,0,-MP_NEAR,1e9,1e9,1e9,1e9]);const cache=MPS.fadeMats||(MPS.fadeMats=new Map());
 g.children.forEach(m=>{const S=m.geometry,G=new THREE.BufferGeometry(),buf=new THREE.InstancedInterleavedBuffer(a.slice(),12,Math.max(1,m.isInstancedMesh?m.count:1));for(const n in S.attributes)G.setAttribute(n,S.attributes[n]);G.setIndex(S.index);if(!S.boundingSphere)S.computeBoundingSphere();G.boundingSphere=S.boundingSphere;
  G.setAttribute('aLodA',new THREE.InterleavedBufferAttribute(buf,4,0));G.setAttribute('aLodB',new THREE.InterleavedBufferAttribute(buf,4,4));G.setAttribute('aLodC',new THREE.InterleavedBufferAttribute(buf,4,8));m.geometry=G;
  let k=cache.get(m.material);if(!k){k=m.material.clone();k.onBeforeCompile=m.material.onBeforeCompile;k.customProgramCacheKey=m.material.customProgramCacheKey;k.userData=Object.assign({},m.material.userData);delete k.userData._lodFade;BIO.lodFade(k);cache.set(m.material,k);}m.material=k;});BIO._lodU.f.value=BIO.LOD.fade;}
function mpShells(list){const n={};MPS.keys.forEach(k=>n[k]=0);const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),one=new THREE.Vector3(1,1,1),p=new THREE.Vector3();
 list.forEach(s=>{const im=MPS.mesh[s[0]];if(!im)return;M.compose(p.set(s[1],0,s[2]),Q.setFromAxisAngle(Y,s[3]==null?0:s[3]),one);im.setMatrixAt(n[s[0]]++,M);});
 MPS.keys.forEach(k=>{if(!MPS.mesh[k])return;MPS.mesh[k].count=n[k];MPS.mesh[k].instanceMatrix.needsUpdate=true;});}
function mpDebris(list,far){const DB=far?MPS.debrisFar:MPS.debris,n={},M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),one=new THREE.Vector3(1,1,1),p=new THREE.Vector3();
 list.forEach(s=>{const D=DB[s[0]];if(!D)return;const i=n[s[0]]=(n[s[0]]||0);M.compose(p.set(s[1],0,s[2]),Q.setFromAxisAngle(Y,s[3]==null?0:s[3]),one);D.forEach(im=>im.setMatrixAt(i,M));n[s[0]]++;});
 for(const k in DB)DB[k].forEach(im=>{im.count=n[k]||0;im.instanceMatrix.needsUpdate=true;});}
function mpClear(){MPS.live.forEach(g=>{scene.remove(g);});MPS.live.length=0;MPS.pool.length=0;mpShells([]);mpDebris([]);mpDebris([],true);MP.closeStoreys();MPS.impMeshes.forEach(o=>o.visible=false);MPS.mat.userData.U.uBand.value.set(0,0,.15);}
// one view's stage. cfg: {heroes:[[key,x,z,yaw]], shells:[...], band:[near,far], fade, tiers, storey:[family,k,x,z]}
MP.show=function(name){if(!MPS.ready){MPS.want=name;return;}const c=MP_CFG[name];if(!c)return;mpClear();MPS.mode=name;
 (c.heroes||[]).forEach(h=>mpHero(h[0],h[1],h[2],h[3],c.fade));mpShells(c.shells||[]);mpDebris([].concat(c.heroes||[],c.shells||[]));
 if(c.band)MPS.mat.userData.U.uBand.value.set(c.band[0],c.band[1],.15);
 if(c.tiers){MPS.impMeshes.forEach(o=>o.visible=true);MPS.mat.userData.U.uBand.value.set(MP_NEAR,0,.15);MPS.nextTier=0;MPS.tierGroups=new Map();}
 if(c.storey)MP.openStorey(c.storey[0],c.storey[1],c.storey[2],c.storey[3]);
 if(c.atlas){const m=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshBasicMaterial({map:MPS.atlas[c.atlas].texture,fog:false,toneMapped:false}));m.position.set(0,220,0);m.geometry.attributes.uv;scene.add(m);MPS.live.push(m);}};
// the tiers each half second: the nearest towers are heroes from a pool; 300 m - 1 km shells
MPS.tiersTick=function(){if(!MPS.ready||!MPS.mode)return;const c=MP_CFG[MPS.mode];if(!c||!c.tiers)return;const now=performance.now();if(now<(MPS.nextTier||0))return;MPS.nextTier=now+150;
 const e=camera.position,T=MPS.towers,near=[],mid=[],MAX=MPS.heroMax==null?24:MPS.heroMax;
 /* a tower seen steeply from above (over 35 degrees) is a shell out to 3.2 km: an impostor is a card, and a tall thin tower's card seen from over it is a long leaning smear that overlaps its neighbours */
 /* a skeleton has no shell (MP.NOSHELL): its bare frame stands in front of its floors, a surface behind a surface, which a heightfield (polar or box)
    bakes as the core standing through the slabs (the owner, 2026-11-03); it is a hero to the hero's range, then its impostor */
 for(const t of T){const d=mpBoxDist(t.key,t.x,t.z,t.yaw,e),hz=Math.hypot(e.x-t.x,e.z-t.z),steep=(e.y-MPS.rec[t.key].frame.H*.5)>.7*Math.max(hz,1),ns=MP.NOSHELL(t.key);t.d=d;t.shell=false;if(d<MP_NEAR)near.push(t);if(!ns&&d>=MP_NEAR*.85&&(d<MP_FAR||(steep&&d<MP_IMPFAR))){mid.push(t);t.shell=true;}}
 near.sort((a,b)=>a.d-b.d);const keep=near.slice(0,MAX),G=MPS.tierGroups;
 /* a hero placed stays placed: its geometry holds its box, so only the towers that join or leave the ten change */
 G.forEach((g,id)=>{if(!keep.some(t=>t.id===id)){scene.remove(g);G.delete(id);MPS.live.splice(MPS.live.indexOf(g),1);MP.walkDirty=true;}});keep.forEach(t=>{if(!G.has(t.id))G.set(t.id,mpHero(t.key,t.x,t.z,t.yaw,true));});near.slice(MAX).forEach(t=>{if(t.d<MP_NEAR*.85&&!MP.NOSHELL(t.key)){mid.push(t);t.shell=true;}});
 mpShells(mid.map(t=>[t.key,t.x,t.z,t.yaw]));mpDebris(T.filter(t=>t.d<MP_RUBBLE).map(t=>[t.key,t.x,t.z,t.yaw]));mpDebris(T.filter(t=>t.d>=MP_RUBBLE&&t.d<MP_IMPFAR).map(t=>[t.key,t.x,t.z,t.yaw]),true);
 // an impostor stands for exactly the towers that are neither a hero nor a shell, tower by tower (a chunk's fade left half-dithered ghosts; a flat distance hid both from a high camera): for the rest its matrix is zero
 MPS.impMeshes.forEach(o=>{const A=o.instanceMatrix.array,F=o.userData.full;for(let i=0,n=F.length/16;i<n;i++){const t=MPS.towerAt[F[i*16+12]+','+F[i*16+14]],near=t?(t.shell||G.has(t.id)):false;for(let k=0;k<16;k++)A[i*16+k]=near?0:F[i*16+k];}o.instanceMatrix.needsUpdate=true;});MPS.tierN={heroes:keep.length,shells:mid.length,impostors:T.filter(t=>t.d>=MP_FAR).length,towers:T.length,pitch:MPS.pitch};};
MPS.towerAt={};MPS.towers.forEach(t=>{MPS.towerAt[t.x+','+t.z]=t;});
/* a pixel's size at a metre, for the shell's trace, every frame: a page that boots hidden (a background tab, a closed pane) has innerHeight 0, which made it Infinity and
   every shell black until the page reloaded */
tick(function(){if(!MPS.ready)MPS.boot();else{MPS.mat.userData.U.uPx.value=2*Math.tan(camera.fov*Math.PI/360)/Math.max(1,innerHeight);MPS.impTick();MPS.tiersTick();MP.cutTick();MP.enterTick();if(MP.walkAt&&Math.hypot(camera.position.x-MP.walkAt[0],camera.position.z-MP.walkAt[1])>800)MP.walkDirty=true;if(MP.walkDirty)MP.walkSync();}});
// ---- the views. A pair stands 170 m apart, hero to the west, its shell to the east, looked at from 300 m
const D=300,sp='spindle.intact',sg='spindle.gutted',li='ledger.intact',lg='ledger.gutted';
 const PAIR=(k,dx,yaw)=>({heroes:[[k,-dx,0,yaw]],shells:[[k,dx,0,yaw]]});
/* the other fourteen, intact and close up (46, 54): one view each, and all sixteen in a gallery, four by four, 300 m apart. Their shells and impostors wait on the
   shells' review; their hero is built when a view first asks for it */
const MPS_DESIGNVIEWS={cfg:{},views:{}};(function(){const all=['spindle','ledger'].concat(MP.DESIGN_KEYS),g=[];
 MP.DESIGN_KEYS.forEach(k=>{const F=MP.DESIGNS[k],H=F.height.tip,d=Math.max(H*1.5,Math.max(F.footprint.w,F.footprint.d)*1.6,90),n='Design, '+F.name.replace(/^The /,'');
  MPS_DESIGNVIEWS.cfg[n]={heroes:[[k+'.intact',0,0,0]]};MPS_DESIGNVIEWS.views[n]=[d*.55,Math.max(8,H*.32),d,0,H*.42,0];});
 all.forEach((k,i)=>g.push([k+'.intact',((i%4)-1.5)*300,(Math.floor(i/4)-1.5)*300,0]));MPS_DESIGNVIEWS.cfg['Designs, all sixteen']={heroes:g};MPS_DESIGNVIEWS.views['Designs, all sixteen']=[900,700,900,0,40,0];
 /* the Ancients kit's buildings (46b, 55): one view each, and all of them on a grid of 440 m (the Apartments are 410 m long) */
 const ga=[];MP.ANCIENT_KEYS.forEach((k,i)=>{const F=MP.ANCIENTS[k],H=F.height.tip,d=Math.max(H*1.5,Math.max(F.footprint.w,F.footprint.d)*1.4,90),n='Ancient, '+F.name.replace(/^The /,'');
  MPS_DESIGNVIEWS.cfg[n]={heroes:[[k+'.intact',0,0,0]]};MPS_DESIGNVIEWS.views[n]=[d*.55,Math.max(8,H*.32),d,0,H*.42,0];ga.push([k+'.intact',((i%4)-1.5)*440,(Math.floor(i/4)-1.5)*440,0]);});
 MPS_DESIGNVIEWS.cfg['Ancients, all']={heroes:ga};
 /* the designs with plans (46c): their seven states in a row, intact first, a diameter and a half apart */
 (MP.PLANNED_KEYS||[]).forEach(k=>{const F=MP.FAMILY[k],D=2*(F.footprint.r||Math.max(F.footprint.w,F.footprint.d)/2),gap=D*1.5+20,n='Ruins, '+F.name.replace(/^The /,''),H=F.height.tip,row=[];
  MP.RUINS.forEach((s,i)=>row.push([k+'.'+s,(i-3)*gap,0,0]));MPS_DESIGNVIEWS.cfg[n]={heroes:row};const w=gap*6;MPS_DESIGNVIEWS.views[n]=[w*.35,Math.max(H*.8,w*.28),w*.75,0,H*.2,0];});
 /* the Ancients kit's buildings with plans (46d): the same row */
 (MP.ANCIENT_PLANNED||[]).forEach(k=>{const F=MP.ANCIENTS[k],D=Math.max(F.footprint.w,F.footprint.d),gap=D*1.2+20,n='Ruins, '+F.name.replace(/^The /,''),H=F.height.tip,row=[];
  MP.RUINS.forEach((s,i)=>row.push([k+'.'+s,(i-3)*gap,0,0]));MPS_DESIGNVIEWS.cfg[n]={heroes:row};const w=gap*6;MPS_DESIGNVIEWS.views[n]=[w*.35,Math.max(H*.8,w*.28),w*.75,0,H*.2,0];});MPS_DESIGNVIEWS.views['Ancients, all']=[1300,1000,1300,0,40,0];})();
/* a ruin's pair: the hero turned half round, so each one's rubble falls away from the other */
MP.NOSHELL=k=>/\.skeleton$/.test(k);
const MPS_RUINVIEWS={cfg:{},views:{}};['crown','broken','stump','skeleton','fallen'].forEach(s=>{const a='Ruin, Spindle '+s,b='Ruin, Ledger '+s,ns=MP.NOSHELL('x.'+s);
 MPS_RUINVIEWS.cfg[a]={heroes:[['spindle.'+s,-150,0,Math.PI]],shells:ns?[]:[['spindle.'+s,150,0,0]]};MPS_RUINVIEWS.views[a]=[0,70,470,0,55,0];
 MPS_RUINVIEWS.cfg[b]={heroes:[['ledger.'+s,-95,0,Math.PI]],shells:ns?[]:[['ledger.'+s,95,0,0]]};MPS_RUINVIEWS.views[b]=[0,45,250,0,14,0];});
const MP_CFG={
 'Pair, Spindle, street':Object.assign(PAIR(sp,85),{}),'Pair, Spindle, raised':PAIR(sp,85),'Pair, Spindle gutted':PAIR(sg,85),'Pair, Spindle gutted, crown':PAIR(sg,85),'Pair, Spindle at 150 m':PAIR(sp,85),
 'Pair, Spindle, the roof':PAIR(sp,85),'Pair, Spindle, under the lamp':PAIR(sp,85),'Pair, Ledger, the roof':PAIR(li,80),'Pair, Ledger':PAIR(li,80),'Pair, Ledger gutted':PAIR(lg,80),'Pair, Ledger end on':{heroes:[[li,0,-60]],shells:[[li,0,60]]},
 'Hero alone at 300 m':{heroes:[[sp,0,0]]},'Shell alone at 300 m':{shells:[[sp,0,0]]},
 'Switch, hero side (240 m)':{heroes:[[sp,0,0]],shells:[[sp,0,0]],band:[MP_NEAR,0],fade:true},'Switch, in the band (280 m)':{heroes:[[sp,0,0]],shells:[[sp,0,0]],band:[MP_NEAR,0],fade:true},'Switch, shell side (320 m)':{heroes:[[sp,0,0]],shells:[[sp,0,0]],band:[MP_NEAR,0],fade:true},
 'Far, shell at 900 m':{shells:[[sp,-120,0],[li,120,0]]},
 'The atlas, zoom':{atlas:'A'},'The atlas, colour':{atlas:'A'},'The atlas, normal':{atlas:'B'},'The atlas, rough, metal, window':{atlas:'C'},
 'Tiers, the worst street':{tiers:true},'Tiers, from a roof':{tiers:true},'Tiers, from the air':{tiers:true},'Shell close, 130 m':{shells:[[sp,0,0]]},'Hero close, 130 m':{heroes:[[sp,0,0]]},
 ...MPS_RUINVIEWS.cfg,...MPS_DESIGNVIEWS.cfg,
 'Inside the Vault, a server floor':{heroes:[['datacenter.intact',0,0]],storey:['datacenter',1,0,0]},'Inside the Gantry Hall, the floor':{heroes:[['gantry.intact',0,0]],storey:['gantry',0,0,0]},'Inside the Spindle, a flat':{heroes:[[sp,0,0]],storey:['spindle',8,0,0]},'Inside the Spindle, the lobby':{heroes:[[sp,0,0]],storey:['spindle',0,0,0]},'Inside the Spindle, an office floor':{heroes:[[sp,0,0]],storey:['spindle',22,0,0]},'Inside the Ledger, the council':{heroes:[[li,0,0]],storey:['ledger',11,0,0]},'Inside the Ledger, an office':{heroes:[[li,0,0]],storey:['ledger',6,0,0]}};
const roomAt=(key,k,want)=>{const F=MP.FAMILY[key],st=MP.storey(F,k),R=st.rooms.filter(q=>q.mpKind===want)[0]||st.rooms[0],c=R.poly.reduce((s,p)=>[s[0]+p[0]/R.poly.length,s[1]+p[1]/R.poly.length],[0,0]);return [c[0],F.levels[k].y,c[1]];};
const outward=(p,y,e,o)=>{const l=Math.hypot(p[0],p[2])||1,dx=p[0]/l,dz=p[2]/l;return [p[0]-dx*o,p[1]+e,p[2]-dz*o,p[0]+dx*8,p[1]+y,p[2]+dz*8];};
const VIEWS={
 'Pair, Spindle, street':[0,1.7,D,0,95,0],'Pair, Spindle, raised':[0,90,D,0,110,0],'Pair, Spindle gutted':[0,1.7,D,0,90,0],'Pair, Spindle gutted, crown':[0,175,D-10,0,170,0],'Pair, Spindle at 150 m':[0,1.7,150,0,120,0],
 'Pair, Spindle, the roof':[0,340,240,0,225,0],'Pair, Spindle, under the lamp':[0,150,120,0,226,0],'Pair, Ledger, the roof':[0,170,230,0,50,0],'Pair, Ledger':[0,6,D,0,26,0],'Pair, Ledger gutted':[0,6,D,0,26,0],'Pair, Ledger end on':[D,6,0,0,26,0],
 'Hero alone at 300 m':[0,1.7,D,0,110,0],'Shell alone at 300 m':[0,1.7,D,0,110,0],
 'Switch, hero side (240 m)':[0,1.7,240+40,0,110,0],'Switch, in the band (280 m)':[0,1.7,275+40,0,110,0],'Switch, shell side (320 m)':[0,1.7,320+40,0,110,0],
 'Far, shell at 900 m':[0,6,900,0,110,0],
 'The atlas, zoom':[-156,75,70,-156,75,0],'The atlas, colour':[0,220,420,0,220,0],'The atlas, normal':[0,220,420,0,220,0],'The atlas, rough, metal, window':[0,220,420,0,220,0],
 'Tiers, the worst street':[110,1.7,110,-900,70,110],'Tiers, from a roof':[110,90,110,-900,60,-900],'Tiers, from the air':[1500,600,1500,0,0,0],'Shell close, 130 m':[0,1.7,130,0,75,0],'Hero close, 130 m':[0,1.7,130,0,75,0],
 ...MPS_RUINVIEWS.views,...MPS_DESIGNVIEWS.views,
 'Inside the Vault, a server floor':[14,6.7,4.2,-40,6.4,4.2],'Inside the Gantry Hall, the floor':[-8,1.7,16,-40,1.2,-3],'Inside the Spindle, a flat':outward(roomAt('spindle',8,'living'),1.4,1.6,2),'Inside the Spindle, the lobby':[0,3,-20,14,3,-34],'Inside the Spindle, an office floor':outward(roomAt('spindle',22,'office'),1.5,1.6,4),
 'Inside the Ledger, the council':(function(){const p=roomAt('ledger',11,'hall'),s=p[2]>0?1:-1;return [p[0]-7,p[1]+1.8,p[2]+s*-3,p[0]+6,p[1]+1.5,p[2]+s*3];})(),'Inside the Ledger, an office':[-12,MP.LEDGER.levels[6].y+1.6,-7,-3,MP.LEDGER.levels[6].y+1.5,-11]};
// the buildings on the page, as records before anything is drawn
['spindle','ledger'].forEach(k=>{const F=MP.FAMILY[k];REGISTER({name:F.name,x:0,z:0,r:F.footprint.r||F.footprint.w/2,h:F.height.tip});});
MP.ANCIENT_KEYS.forEach(k=>{const F=MP.ANCIENTS[k];REGISTER({name:F.name+' (the Ancients kit)',x:0,z:0,r:Math.max(F.footprint.w,F.footprint.d)/2,h:F.height.tip});});
MP.DESIGN_KEYS.forEach(k=>{const F=MP.DESIGNS[k];REGISTER({name:F.name,x:0,z:0,r:Math.max(F.footprint.w,F.footprint.d)/2,h:F.height.tip});});
