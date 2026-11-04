// ================================================================= HOST — the valley's city stage: the towers on the ground, the tiers, the lines
// [web] What kits/metropolis's test stage (its 70-mp-stage.js) does on a flat plain, done here on the valley's ground: every tower of the station's
// plan (STAGE.plan, 41-av-field.js: a record with its own y) is a core/tags record; the shells and the impostors of the two shelled families are
// baked at load from the heroes (KSHELL, BIO.impostor); then each frame the nearest towers are heroes (a pool, the dither at 300 m), the rest to
// 1.4 km baked shells, past that impostors, with the ruins' rubble to 1 km and coarse to 3.2 km (PLAN-ANOMALIES.md section 13's tiers). A design
// with no shell (the Terrace, the Long Curve...) stands only as a hero, so the plan keeps them round the eye's start. The lines (the viaduct) are
// instanced piers and decks from AV.viaduct, drawn to the far field: the hand of man in every view (PLAN.md section 3).
const AVC={ready:false,keys:[].concat(...['spindle','ledger'].map(f=>MP.RUINS.map(s=>f+'.'+s))),hero:{},rec:{},slot:{},mesh:{},live:[],mode:null,bakeMs:0,towers:STAGE.plan.towers,tierGroups:new Map(),tierN:null};
const AV_NEAR=300,AV_FAR=1400,AV_IMPFAR=3200,AV_RUBBLE=1000,AV_HEROMAX=16;
MP.NOSHELL=k=>/\.skeleton$/.test(k);
MP.mats();
AVC.towerAt={};AVC.towers.forEach(t=>{AVC.towerAt[t.x+','+t.z]=t;t.shelled=AVC.keys.indexOf(t.key)>=0;});
// the towers as records before anything is drawn: the family's name, its footprint, the state
AVC.towers.forEach(T=>{const F=MP.FAMILY[T.family]||MP.DESIGNS[T.family];if(!F)return;const r=F.footprint?(F.footprint.r||Math.max(F.footprint.w||0,F.footprint.d||0)/2):30;
 REGISTER({name:F.name+' ('+T.state+')',kind:'tower',x:T.x,z:T.z,y:T.y,r:r,h:T.state==='intact'||T.state==='gutted'?F.height.tip:F.height.tip*.6,tags:{kind:'tower',family:T.family,state:T.state,zone:T.kind}});});
AVC.boot=function(){if(AVC.ready)return true;if(window._texPending>0)return false;const t0=performance.now();
 AVC.keys.forEach(k=>{const p=k.split('.');AVC.hero[k]=MP.hero(p[0],p[1]);AVC.rec[k]=KSHELL.record(MP.FAMILY[p[0]],p[1]);});
 const size=/[?&]atlas=1024\b/.test(location.search)?1024:2048;
 AVC.packed=KSHELL.pack([].concat(...AVC.keys.map(k=>KSHELL.slots(AVC.rec[k]))),size);AVC.packed.forEach(s=>{AVC.slot[s.id]=s;});AVC.atlas=KSHELL.atlas(size,renderer);
 if(!/[?&]nobake/.test(location.search))AVC.keys.forEach(k=>KSHELL.bake(AVC.atlas,AVC.rec[k],AVC.slot[k],AVC.hero[k],AVC.slot[k+'.top'],AVC.slot[k+'.bot']));if(!/[?&]nomip/.test(location.search))KSHELL.finish(AVC.atlas);
 AVC.mat=KSHELL.material(AVC.atlas,{steps:/[?&]steps=(\d+)/.test(location.search)?+RegExp.$1:32});AVC.mat.userData.U.uPx.value=2*Math.tan(camera.fov*Math.PI/360)/Math.max(1,innerHeight);
 const cap=Math.max(16,AVC.towers.length);
 if(!/[?&]noshell\b/.test(location.search))AVC.keys.forEach(k=>{const im=KSHELL.draw(AVC.atlas,AVC.rec[k],AVC.slot[k],AVC.mat,new Array(cap).fill([0,0,0]),AVC.slot[k+'.top'],AVC.slot[k+'.bot']);im.count=0;im.frustumCulled=false;scene.add(im);AVC.mesh[k]=im;});
 AVC.debris={};AVC.debrisFar={};AVC.debrisTris={};AVC.keys.forEach(k=>{const p=k.split('.'),G=MP.debris(MP.FAMILY[p[0]],p[1]);if(!G)return;AVC.debrisTris[k]=G.userData.tris;
  AVC.debris[k]=G.children.map(m=>{const im=new THREE.InstancedMesh(m.geometry,m.material,cap);im.count=0;im.frustumCulled=false;im.name=m.name;im.castShadow=im.receiveShadow=!!MP.shadow;scene.add(im);return im;});
  const Gf=MP.debris(MP.FAMILY[p[0]],p[1],true);AVC.debrisFar[k]=Gf.children.map(m=>{const im=new THREE.InstancedMesh(m.geometry,m.material,cap);im.count=0;im.frustumCulled=false;im.name=m.name+'.far';scene.add(im);return im;});});
 AVC.bakeMs=Math.round(performance.now()-t0);
 /* the impostors: one set, a slot a family and state, from the hero's own meshes; the bake runs on the metro kit alone (the valley's forest is baked already: 88) */
 const S=BIO.impostorSet('av',{grid:8,cell:/[?&]impcell=(\d+)/.test(location.search)?+RegExp.$1:128,slots:AVC.keys.length});AVC.impSet=S;const savedKits=BIO.kits;BIO.kit('metro');
 AVC.imp={};
 AVC.keys.forEach(function(k){const p=k.split('.'),H=MP.hero(p[0],p[1],true),names=[];H.children.forEach((m,i)=>{const n='av.'+k+'.'+i;BIO.def(n,m.geometry,m.material,{indexed:false});names.push([n,m]);});
  AVC.imp[k]=BIO.impostor('av.'+k,function(){const M=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3(),c=new THREE.Color();
   names.forEach(function(e){const n=e[0],m=e[1];if(!m.isInstancedMesh){BIO.put(n,[0,0,0],null,1,null);return;}
    for(let i=0;i<m.count;i++){m.getMatrixAt(i,M);M.decompose(p,q,s);m.getColorAt(i,c);BIO.put(n,[p.x,p.y,p.z],q,[s.x,s.y,s.z],c.clone().convertLinearToSRGB());}});},{set:S,label:k});});
 BIO.impostorItem('avImp',S,{label:'a far tower'});
 BIO.range=AV_IMPFAR;BIO.minRange=0;BIO.chunk=800;AVC.towers.forEach(T=>{if(T.shelled)BIO.impostorPut('avImp',AVC.imp[T.key],[T.x,T.y,T.z],T.yaw,1);});BIO.range=null;BIO.minRange=0;BIO.chunk=null;
 {const mine={metro:BIO.kits.metro};BIO.kits=mine;try{BIO.bake();}finally{BIO.kits=savedKits;}}BIO.kit('');AVC.impQ=BIO.IMP.list.slice();BIO.IMP.list.length=0;AVC.impN=0;
 AVC.impMeshes=[];scene.traverse(o=>{if(o.isInstancedMesh&&/avImp/.test(o.name||'')){AVC.impMeshes.push(o);o.userData.full=o.instanceMatrix.array.slice();}});
 AVC.bakeAllMs=Math.round(performance.now()-t0);AVC.impMs=0;AVC.ready=true;AVC.mat.userData.U.uBand.value.set(AV_NEAR,0,.15);AVC.nextTier=0;return true;};
AVC.impTick=function(){if(!AVC.impQ||!AVC.impQ.length)return;const r=AVC.impQ.shift(),t0=performance.now();BIO.IMP.list.length=0;BIO.IMP.list.push(r);AVC.impN+=BIO.bakeImpostors(renderer,{wait:0})||0;AVC.impMs+=Math.round(performance.now()-t0);};
// a hero placed on the ground: a clone that shares the geometry
function avHero(key,x,y,z,yaw,fade){const H=AVC.hero[key]||(AVC.hero[key]=MP.hero(key.split('.')[0],key.split('.')[1])),g=new THREE.Group();H.children.forEach(m=>{let c=m.clone();if(m.isInstancedMesh){c=new THREE.InstancedMesh(m.geometry,m.material,m.count);c.instanceMatrix=m.instanceMatrix;c.instanceColor=m.instanceColor;c.frustumCulled=false;}g.add(c);});
 g.position.set(x,y,z);g.rotation.y=yaw==null?0:yaw;if(MP.shadow)MP.shadow.cast(g);if(fade&&AVC.rec[key])avFade(g,key,x,y,z,yaw);g.userData.av={key,x,y,z,yaw:yaw==null?0:yaw};scene.add(g);AVC.live.push(g);return g;}
const avHalf=(key,yaw)=>{const r=AVC.rec[key];if(!r){const F=MP.FAMILY[key.split('.')[0]]||MP.DESIGNS[key.split('.')[0]],fp=F&&F.footprint||{},h=fp.r||Math.max(fp.w||40,fp.d||40)/2;return[h,h];}const f=r.frame,h=f.mode?[f.a,f.b]:[f.a*.6,f.a*.6];return Math.abs(Math.cos(yaw==null?0:yaw))<.5?[h[1],h[0]]:h;};
const avH=key=>{const r=AVC.rec[key];if(r)return r.frame.H;const F=MP.FAMILY[key.split('.')[0]]||MP.DESIGNS[key.split('.')[0]];return F?F.height.tip:60;};
const avBoxDist=(T,e)=>{const h=avHalf(T.key,T.yaw),dx=Math.max(Math.abs(e.x-T.x)-h[0],0),dz=Math.max(Math.abs(e.z-T.z)-h[1],0),dy=Math.max(e.y-T.y-avH(T.key),Math.max(T.y-e.y,0),0);return Math.hypot(dx,dy,dz);};
function avFade(g,key,x,y,z,yaw){const h=avHalf(key,yaw),H=AVC.rec[key].frame.H,a=new Float32Array(12);
 a.set([x-h[0],z-h[1],x+h[0],z+h[1],y,y+H,0,-AV_NEAR,1e9,1e9,1e9,1e9]);const cache=AVC.fadeMats||(AVC.fadeMats=new Map());
 g.children.forEach(m=>{const S=m.geometry,G=new THREE.BufferGeometry(),buf=new THREE.InstancedInterleavedBuffer(a.slice(),12,Math.max(1,m.isInstancedMesh?m.count:1));for(const n in S.attributes)G.setAttribute(n,S.attributes[n]);G.setIndex(S.index);if(!S.boundingSphere)S.computeBoundingSphere();G.boundingSphere=S.boundingSphere;
  G.setAttribute('aLodA',new THREE.InterleavedBufferAttribute(buf,4,0));G.setAttribute('aLodB',new THREE.InterleavedBufferAttribute(buf,4,4));G.setAttribute('aLodC',new THREE.InterleavedBufferAttribute(buf,4,8));m.geometry=G;
  let k=cache.get(m.material);if(!k){k=m.material.clone();k.onBeforeCompile=m.material.onBeforeCompile;k.customProgramCacheKey=m.material.customProgramCacheKey;k.userData=Object.assign({},m.material.userData);delete k.userData._lodFade;BIO.lodFade(k);cache.set(m.material,k);}m.material=k;});BIO._lodU.f.value=BIO.LOD.fade;}
function avShells(list){const n={};AVC.keys.forEach(k=>n[k]=0);const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),one=new THREE.Vector3(1,1,1),p=new THREE.Vector3();
 list.forEach(T=>{const im=AVC.mesh[T.key];if(!im)return;M.compose(p.set(T.x,T.y,T.z),Q.setFromAxisAngle(Y,T.yaw||0),one);im.setMatrixAt(n[T.key]++,M);});
 AVC.keys.forEach(k=>{if(!AVC.mesh[k])return;AVC.mesh[k].count=n[k];AVC.mesh[k].instanceMatrix.needsUpdate=true;});}
function avDebris(list,far){const DB=far?AVC.debrisFar:AVC.debris,n={},M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),one=new THREE.Vector3(1,1,1),p=new THREE.Vector3();
 list.forEach(T=>{const D=DB[T.key];if(!D)return;const i=n[T.key]=(n[T.key]||0);M.compose(p.set(T.x,T.y,T.z),Q.setFromAxisAngle(Y,T.yaw||0),one);D.forEach(im=>im.setMatrixAt(i,M));n[T.key]++;});
 for(const k in DB)DB[k].forEach(im=>{im.count=n[k]||0;im.instanceMatrix.needsUpdate=true;});}
// the tiers each 150 ms: the nearest towers heroes from a pool; 300 m to 1.4 km shells (to 3.2 km seen steeply); the rest impostors
AVC.tiersTick=function(){if(!AVC.ready)return;const now=performance.now();if(now<(AVC.nextTier||0))return;AVC.nextTier=now+150;
 const e=camera.position,T=AVC.towers,near=[],mid=[];
 for(const t of T){const d=avBoxDist(t,e),hz=Math.hypot(e.x-t.x,e.z-t.z),steep=(e.y-t.y-avH(t.key)*.5)>.7*Math.max(hz,1),ns=!t.shelled||MP.NOSHELL(t.key);t.d=d;t.shell=false;if(d<AV_NEAR)near.push(t);if(!ns&&d>=AV_NEAR*.85&&(d<AV_FAR||(steep&&d<AV_IMPFAR))){mid.push(t);t.shell=true;}}
 near.sort((a,b)=>a.d-b.d);const keep=near.slice(0,AV_HEROMAX),G=AVC.tierGroups;
 G.forEach((g,id)=>{if(!keep.some(t=>t.id===id)){scene.remove(g);G.delete(id);AVC.live.splice(AVC.live.indexOf(g),1);}});keep.forEach(t=>{if(!G.has(t.id))G.set(t.id,avHero(t.key,t.x,t.y,t.z,t.yaw,t.shelled));});
 near.slice(AV_HEROMAX).forEach(t=>{if(t.shelled&&t.d<AV_NEAR*.85&&!MP.NOSHELL(t.key)){mid.push(t);t.shell=true;}});
 avShells(mid);avDebris(T.filter(t=>t.shelled&&t.d<AV_RUBBLE));avDebris(T.filter(t=>t.shelled&&t.d>=AV_RUBBLE&&t.d<AV_IMPFAR),true);
 AVC.impMeshes.forEach(o=>{const A=o.instanceMatrix.array,F=o.userData.full;for(let i=0,n=F.length/16;i<n;i++){const t=AVC.towerAt[F[i*16+12]+','+F[i*16+14]],nr=t?(t.shell||G.has(t.id)):false;for(let k=0;k<16;k++)A[i*16+k]=nr?0:F[i*16+k];}o.instanceMatrix.needsUpdate=true;});
 AVC.tierN={heroes:keep.length,shells:mid.length,impostors:T.filter(t=>t.shelled&&t.d>=AV_FAR).length,towers:T.length,unshelled:T.filter(t=>!t.shelled).length};};
tick(function(){if(!AVC.ready)AVC.boot();else{AVC.mat.userData.U.uPx.value=2*Math.tan(camera.fov*Math.PI/360)/Math.max(1,innerHeight);AVC.impTick();AVC.tiersTick();}});
// ---------------------------------------------------------------- the lines: the viaduct (AV.viaduct's records drawn as instanced piers and decks)
const AV_LINES=(function(){const V=AV.viaduct(STAGE.viaduct.pts,{step:36,ground:terrainH,deckY:STAGE.viaduct.deckY});
 const P=KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('metropolis','concrete'):null,T=P?KMAT.textures(P,{aniso:8}):{};
 const mat=new THREE.MeshStandardMaterial({map:T.map||null,normalMap:T.normalMap||null,roughnessMap:T.roughnessMap||null,color:0x9a968c,roughness:.95,metalness:0});
 const rail=new THREE.MeshStandardMaterial({color:0x5a5248,roughness:.6,metalness:.6});
 const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),P3=new THREE.Vector3(),S3=new THREE.Vector3(),E=new THREE.Euler();
 const piers=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,V.piers.length);V.piers.forEach((p,i)=>{const h=Math.max(1,p.y1-p.y0);M.compose(P3.set(p.x,p.y0+h/2,p.z),Q.identity(),S3.set(3.2,h,4.2));piers.setMatrixAt(i,M);});
 const decks=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,V.decks.length);V.decks.forEach((d,i)=>{M.compose(P3.set(d.x,d.y-1.2,d.z),Q.setFromEuler(E.set(0,-d.yaw,d.pitch,'YXZ')),S3.set(d.len+.3,2.4,11));decks.setMatrixAt(i,M);});
 const rails=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),rail,V.decks.length*2);V.decks.forEach((d,i)=>{[-3.6,3.6].forEach((o,k)=>{const ox=-Math.sin(d.yaw)*o,oz=Math.cos(d.yaw)*o;M.compose(P3.set(d.x+ox,d.y+.3,d.z+oz),Q.setFromEuler(E.set(0,-d.yaw,d.pitch,'YXZ')),S3.set(d.len+.3,.6,.4));rails.setMatrixAt(i*2+k,M);});});
 [piers,decks,rails].forEach(m=>{m.frustumCulled=false;m.userData.inspectLabel='the transit viaduct';m.userData.host=true;m.castShadow=m.receiveShadow=!!MP.shadow;scene.add(m);});
 REGISTER({name:'The transit viaduct',kind:'line',x:0,z:-800,r:3000,h:60,tags:{kind:'line',line:'viaduct',length:Math.round(V.length)}});
 return{V,piers,decks,rails,tris:(V.piers.length+V.decks.length*3)*12};})();
