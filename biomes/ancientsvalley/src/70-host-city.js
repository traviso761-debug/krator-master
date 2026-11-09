// ================================================================= HOST — the valley's city stage: the towers on the ground, the tiers, the lines
// [web] What kits/metropolis's test stage (its 70-mp-stage.js) does on a flat plain, done here on the valley's ground: every tower of the station's
// plan (STAGE.plan, 41-av-field.js: a record with its own y) is a core/tags record; the shells and the impostors of the two shelled families are
// baked at load from the heroes (KSHELL, BIO.impostor); then each frame the nearest towers are heroes (a pool, the dither at 300 m), the rest to
// 1.4 km baked shells, past that impostors, with the ruins' rubble to 1 km and coarse to 3.2 km (PLAN-ANOMALIES.md section 13's tiers). A design
// with no shell (the Terrace, the Long Curve...) stands only as a hero, so the plan keeps them round the eye's start. The lines (the viaduct) are
// instanced piers and decks from AV.viaduct, drawn to the far field: the hand of man in every view (PLAN.md section 3).
const AVC={ready:false,keys:[].concat(...['spindle','ledger'].map(f=>MP.RUINS.map(s=>f+'.'+s))),hero:{},rec:{},slot:{},mesh:{},live:[],mode:null,bakeMs:0,towers:STAGE.plan.towers,tierGroups:new Map(),tierN:null};
/* the shelled families' tiers, and the designs': a design has no shell (kits/metropolis/KNOWN_ISSUES.md), so it is a hero to 800 m (the nearest
   AV_DHEROMAX) and an impostor past that, in two looks (intact, broken) */
/* the owner, 2026-11-08: the foreground towers looked low-res (a design's impostor, 96 px a view, stood where a hero should) and floors floated (the
   impostor's slabs seen apart from their skin at a near, steep angle): a design is a hero to 1.4 km, to 3.2 km seen steeply from above, the nearest
   48 of them; its impostor is 128 px a view */
/* 2026-11-09, the owner's fourth eye: a shell seen onto its top (the eye over the tower's roof) smears whatever the range, so such a tower is a hero to
   AV_NEAR_STEEP; a design is a hero to 1 km, the nearest 64 (past 48 within 1.4 km the rest were cards at 900 m) */
const AV_NEAR=300,AV_FAR=1400,AV_IMPFAR=3200,AV_RUBBLE=1000,AV_HEROMAX=16,AV_DNEAR=1000,AV_DHEROMAX=72;
MP.NOSHELL=k=>/\.skeleton$/.test(k);
MP.mats();
/* THE FAR LOOKS (2026-11-09, the owner's fifth eye: floors hung in the air on the far impostors, shells drew over other models). A ruin at range
   is not its own hero baked to a card (the slabs read at a texel, the piers between them do not); it is the family's GUTTED hero cut at the
   state's height: a solid stub with a torn top. Five looks a family: intact, gutted, crown, broken, stump (a skeleton and a fallen tower share the
   stump's). Shells stand only for intact and gutted towers (the spike validated those), never for a tower whose roof the eye is above */
const AV_LOOK={intact:'intact',gutted:'gutted',crown:'crown',broken:'broken',stump:'stump',skeleton:'stump',fallen:'stump'};
const avImpKey=t=>t.family+'.'+AV_LOOK[t.state];
const avCanShell=t=>t.shelled&&(t.state==='intact'||t.state==='gutted');
AVC.towerAt={};AVC.towers.forEach(t=>{AVC.towerAt[t.x+','+t.z]=t;t.shelled=AVC.keys.indexOf(t.key)>=0;t.ikey=avImpKey(t);});
/* a geometry's triangles whose every vertex (in the mesh's world frame) lies under `top`, as a new non-indexed geometry; null when nothing is left */
function clipGeoY(g,m,top){const P=g.attributes.position,idx=g.index,n=idx?idx.count:P.count,v=new THREE.Vector3(),W=m.matrixWorld,keep=[];
 for(let t=0;t<n;t+=3){let ok=true;for(let j=0;j<3&&ok;j++){const i=idx?idx.getX(t+j):t+j;v.set(P.getX(i),P.getY(i),P.getZ(i)).applyMatrix4(W);if(v.y>top)ok=false;}if(ok)keep.push(t);}
 if(!keep.length)return null;if(keep.length*3===n&&!idx)return g;const out=new THREE.BufferGeometry();
 for(const name in g.attributes){const A=g.attributes[name],sz=A.itemSize,arr=new Float32Array(keep.length*3*sz);let o=0;for(const t of keep)for(let j=0;j<3;j++){const i=idx?idx.getX(t+j):t+j;for(let c=0;c<sz;c++)arr[o++]=A.array[i*sz+c];}out.setAttribute(name,new THREE.BufferAttribute(arr,sz));}
 return out;}
// ---------------------------------------------------------------- the rust (the owner, 2026-11-04: more rust)
// A thousand years of weather on the heroes' colours, once per hero key, before the shells and impostors are baked from them (the bake reads the
// vertex and instance colours): rust streaks running down from the panels' joints and a grime that deepens with the state, by core/rand's noise
// in the tower's own frame, so every clone and every tier agrees. Heavier where the ruin is older.
/* the owner, 2026-11-04, twice: "more rust", then "even more rust and war damage": a base of rust over everything, streaks to full rust, soot
   from the burning in black patches, and the grime; an intact tower is a stained one */
const AV_RUST={intact:.8,gutted:.95,crown:1,broken:1,stump:1,skeleton:1,fallen:1};
function avRust(H,key){if(H.userData.avRusted)return H;H.userData.avRusted=true;const st=key.split('.')[1],k=AV_RUST[st]==null?.8:AV_RUST[st],seed=KRAND.hash(1104,MP.idHash?MP.idHash(key):key.length,7);
 const S3=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 /* the laser burns (the owner: "laser burns, fire damage"): two or three straight cuts through the tower at odd angles, each a plane in its frame,
    scorched black and glassy along a band; the fire: soot smeared upward from the burnt storeys */
 const CUTS=[];for(let i=0;i<3+Math.floor(KRAND.unit(KRAND.hash(seed,9,i))*3);i++){const a=KRAND.unit(KRAND.hash(seed,10,i))*Math.PI*2,b=(KRAND.unit(KRAND.hash(seed,11,i))-.5)*1.2,d=(KRAND.unit(KRAND.hash(seed,12,i))-.5)*60,h=20+KRAND.unit(KRAND.hash(seed,13,i))*160;
  CUTS.push({nx:Math.cos(a)*Math.cos(b),ny:Math.sin(b),nz:Math.sin(a)*Math.cos(b),d:d-h*Math.sin(b),w:1.5+KRAND.unit(KRAND.hash(seed,14,i))*3});}
 const T=[.46,.22,.10],T2=[.30,.16,.09],SOOT=[.05,.045,.04],PAL=[1.12,.80,.58],at=(x,y,z,c,o)=>{const s=KRAND.vnoise(x*.55+z*.55+y*.02,y*.07,0,seed),g=KRAND.vnoise(x*.12,y*.35+z*.12,3,seed+1),w=KRAND.vnoise(x*.04+7,y*.06+z*.04,5,seed+2),f=KRAND.vnoise(x*.09+3,y*.012+z*.09,8,seed+3);
  const run=S3(.22,.58,s)*(.75+.25*Math.max(0,.5-g)),r=Math.min(1,(.35+run)*k*(1.3-.5*Math.min(1,y/120))),dirt=1-k*(.36+.4*Math.max(0,g-.3));
  let soot=Math.min(1,(S3(.52,.76,w)+S3(.56,.82,f)*.9)*k);for(let i=0;i<CUTS.length;i++){const C=CUTS[i],e=Math.abs(x*C.nx+y*C.ny+z*C.nz-C.d);soot=Math.max(soot,S3(C.w*2.6,C.w*.5,e)*k);}
  {const l0=(c[o]*.3+c[o+1]*.59+c[o+2]*.11);if(l0<.22){const t=.7*S3(.22,.05,l0);c[o]=c[o]*(1-t)+.5*t;c[o+1]=c[o+1]*(1-t)+.48*t;c[o+2]=c[o+2]*(1-t)+.45*t;}}   /* a dark vertex colour lifted toward grey */
  const l=(c[o]*.3+c[o+1]*.59+c[o+2]*.11),tw=S3(.4,.6,g),R0=T[0]*(1-tw)+T2[0]*tw,R1=T[1]*(1-tw)+T2[1]*tw,R2=T[2]*(1-tw)+T2[2]*tw;
  c[o]=(c[o]*(1-r)+R0*(.6+l)*r)*dirt;c[o+1]=(c[o+1]*(1-r)+R1*(.6+l)*r)*dirt;c[o+2]=(c[o+2]*(1-r)+R2*(.6+l)*r)*dirt;
  /* the palette (the owner: a more uniform rust-shaded palette): every colour drawn half way to a rust-brown of its own brightness */
  const l2=(c[o]*.3+c[o+1]*.59+c[o+2]*.11);c[o]=c[o]*.35+l2*PAL[0]*.65;c[o+1]=c[o+1]*.35+l2*PAL[1]*.65;c[o+2]=c[o+2]*.35+l2*PAL[2]*.65;
  c[o]=c[o]*(1-soot)+SOOT[0]*soot;c[o+1]=c[o+1]*(1-soot)+SOOT[1]*soot;c[o+2]=c[o+2]*(1-soot)+SOOT[2]*soot;};
 const M=new THREE.Matrix4();
 /* the owner, 2026-11-08: the black tower (the Wedge's black curtain glass and dark piers) stood out; its dark materials are swapped for a grey like
    the others' before the rust goes on (one clone a material, shared by every hero), and a dark vertex colour is lifted toward grey the same way */
 const DK=AVC.darkSwap||(AVC.darkSwap=new Map());
 H.traverse(m=>{if(!m.isMesh||m.userData.door)return;const mt=m.material;if(mt&&mt.color&&!mt.transparent&&!mt.userData.mpWindow&&(mt.color.r*.3+mt.color.g*.59+mt.color.b*.11)<.2){let k=DK.get(mt);if(!k){k=mt.clone();k.color.setRGB(.58,.56,.52);k.roughness=.85;k.metalness=.12;if(mt.onBeforeCompile)k.onBeforeCompile=mt.onBeforeCompile;k.customProgramCacheKey=mt.customProgramCacheKey;DK.set(mt,k);}m.material=k;}});
 H.traverse(m=>{if(!m.isMesh||m.userData.door)return;
  if(m.isInstancedMesh&&m.instanceColor){const c=m.instanceColor.array,a=m.instanceMatrix.array;for(let i=0;i<m.count;i++)at(a[i*16+12],a[i*16+13],a[i*16+14],c,i*3);m.instanceColor.needsUpdate=true;}
  else{const g=m.geometry,col=g.attributes.color,p=g.attributes.position;if(!col||g.userData.avRusted)return;g.userData.avRusted=true;const c=col.array,q=p.array,n=Math.min(col.count,p.count);for(let i=0;i<n;i++)at(q[i*3],q[i*3+1],q[i*3+2],c,i*col.itemSize);col.needsUpdate=true;}});
 return H;}
const heroOf=(key,lite)=>{const p=key.split('.');return avRust(MP.hero(p[0],p[1],lite),key);};
// the towers as records before anything is drawn: the family's name, its footprint, the state
AVC.towers.forEach(T=>{const F=MP.FAMILY[T.family]||MP.DESIGNS[T.family];if(!F)return;const r=F.footprint?(F.footprint.r||Math.max(F.footprint.w||0,F.footprint.d||0)/2):30;
 REGISTER({name:F.name+' ('+T.state+')',kind:'tower',x:T.x,z:T.z,y:T.y,r:r,h:T.state==='intact'||T.state==='gutted'?F.height.tip:F.height.tip*.6,tags:{kind:'tower',family:T.family,state:T.state,zone:T.kind}});});
AVC.boot=function(){if(AVC.ready)return true;if(window._texPending>0)return false;const t0=performance.now();
 try{AVC.engines();}catch(e){reportErr('engines: '+e.stack);}AVC.engineMs=Math.round(performance.now()-t0);
 AVC.keys.forEach(k=>{const p=k.split('.');AVC.hero[k]=heroOf(k);AVC.rec[k]=KSHELL.record(MP.FAMILY[p[0]],p[1]);});
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
 const S=BIO.impostorSet('av',{grid:8,cell:/[?&]impcell=(\d+)/.test(location.search)?+RegExp.$1:128,slots:14});AVC.impSet=S;const savedKits=BIO.kits;BIO.kit('metro');
 AVC.imp={};
 /* a hero's meshes, wherever they sit in its tree (a design's ruin pass nests groups), each with its matrix in the hero's frame */
 /* the owner, 2026-11-09: a ruin's impostor showed its floors as dashes hanging in the air (the slabs inside under the tear, and the storeys' plates,
    read at a texel while the piers between them do not): the impostor is baked without them, the skin and the frame alone */
 const heroMeshes=H=>{const out=[];H.updateMatrixWorld(true);H.traverse(m=>{if(!m.isMesh||!m.geometry||!m.material||m.userData.door)return;let o=m,skip=false;while(o&&o!==H){if(/slab|floor|storey|plate/i.test(o.name||''))skip=true;o=o.parent;}if(!skip)out.push(m);});return out;};
 const impOf=(k,S)=>{const pk=k.split('.'),fam=pk[0],look=pk[1],solid=look!=='intact'&&look!=='gutted',F=MP.FAMILY[fam];let top=Infinity;
  if(solid){try{const R=MP.ruin(F,look);top=Math.max(8,R.cut==null?8:R.cut);}catch(e){top=20;}}
  const H=heroOf(solid?fam+'.gutted':k,true),names=[];heroMeshes(H).forEach((m,i)=>{let g=m.geometry;if(solid&&!m.isInstancedMesh){g=clipGeoY(g,m,top);if(!g)return;}const n='av.'+k+'.'+i;BIO.def(n,g,m.material,{indexed:false});names.push([n,m]);});
  return BIO.impostor('av.'+k,function(){const M=new THREE.Matrix4(),W=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3(),c=new THREE.Color();
   names.forEach(function(e){const n=e[0],m=e[1];W.copy(m.matrixWorld);if(!m.isInstancedMesh){W.decompose(p,q,s);BIO.put(n,[p.x,p.y,p.z],q,[s.x,s.y,s.z],null);return;}
    for(let i=0;i<m.count;i++){m.getMatrixAt(i,M);M.premultiply(W).decompose(p,q,s);if(p.y>top)continue;if(m.instanceColor)m.getColorAt(i,c);else c.setRGB(1,1,1);BIO.put(n,[p.x,p.y,p.z],q,[s.x,s.y,s.z],c.clone().convertLinearToSRGB());}});},{set:S,label:k});};
 /* every look the plan uses, shelled families and designs alike, in sets of 14 (a set is one atlas pair and one draw call a chunk) */
 AVC.dkeys=[];{const seen=new Set();AVC.towers.forEach(t=>{if(!seen.has(t.ikey)){seen.add(t.ikey);AVC.dkeys.push(t.ikey);}});}
 AVC.dsets=[S];AVC.dset={};let slotLeft=0,cur=null;AVC.dkeys.forEach(k=>{if(!slotLeft){cur=AVC.dsets.length===1&&!AVC.dsets[0].used?S:BIO.impostorSet('avd'+AVC.dsets.length,{grid:8,cell:128,slots:14});cur.used=true;if(cur!==S)AVC.dsets.push(cur);slotLeft=14;BIO.impostorItem('avImp'+(AVC.dsets.length-1),cur,{label:'a far tower'});}
  AVC.imp[k]=impOf(k,cur);AVC.dset[k]='avImp'+(AVC.dsets.indexOf(cur));slotLeft--;});
 BIO.range=AV_IMPFAR;BIO.minRange=0;BIO.chunk=800;AVC.towers.forEach(T=>{BIO.impostorPut(AVC.dset[T.ikey],AVC.imp[T.ikey],[T.x,T.y,T.z],T.yaw,1);});BIO.range=null;BIO.minRange=0;BIO.chunk=null;
 {const mine={metro:BIO.kits.metro};BIO.kits=mine;try{BIO.bake();}finally{BIO.kits=savedKits;}}BIO.kit('');AVC.impQ=BIO.IMP.list.slice();BIO.IMP.list.length=0;AVC.impN=0;
 AVC.impMeshes=[];scene.traverse(o=>{if(o.isInstancedMesh&&/avImp/.test(o.name||'')){AVC.impMeshes.push(o);o.userData.full=o.instanceMatrix.array.slice();}});AVC.impKeys=AVC.dkeys.length;
 AVC.bakeAllMs=Math.round(performance.now()-t0);AVC.impMs=0;AVC.ready=true;AVC.mat.userData.U.uBand.value.set(AV_NEAR,0,.15);AVC.nextTier=0;return true;};
AVC.impTick=function(){if(!AVC.impQ||!AVC.impQ.length)return;const r=AVC.impQ.shift(),t0=performance.now();BIO.IMP.list.length=0;BIO.IMP.list.push(r);AVC.impN+=BIO.bakeImpostors(renderer,{wait:0})||0;AVC.impMs+=Math.round(performance.now()-t0);};
// a hero placed on the ground: a clone that shares the geometry
function avHero(key,x,y,z,yaw,fade){const H=AVC.hero[key]||(AVC.hero[key]=heroOf(key)),g=new THREE.Group();H.children.forEach(m=>{let c;if(m.isInstancedMesh){c=new THREE.InstancedMesh(m.geometry,m.material,m.count);c.instanceMatrix=m.instanceMatrix;c.instanceColor=m.instanceColor;c.frustumCulled=false;c.position.copy(m.position);c.quaternion.copy(m.quaternion);c.scale.copy(m.scale);c.userData=m.userData;}else c=m.clone();g.add(c);});
 g.position.set(x,y,z);g.rotation.y=yaw==null?0:yaw;if(MP.shadow)MP.shadow.cast(g);if(fade&&AVC.rec[key])avFade(g,key,x,y,z,yaw);g.userData.av={key,x,y,z,yaw:yaw==null?0:yaw};scene.add(g);AVC.live.push(g);return g;}
/* a broken tower's lean (AV.lean: up to 5 degrees, a direction by hash): one quaternion per tower, the heroes, the shells and the rubble share it */
const avQuat=(T)=>{if(T.q)return T.q;const Y=new THREE.Vector3(0,1,0),q=new THREE.Quaternion().setFromAxisAngle(Y,T.yaw||0);if(T.lean){const ax=new THREE.Vector3(Math.cos(T.leanDir||0),0,Math.sin(T.leanDir||0)),t=new THREE.Quaternion().setFromAxisAngle(ax,T.lean*Math.PI/180);q.premultiply(t);}T.q=q;return q;};
const avHalf=(key,yaw)=>{const r=AVC.rec[key];if(!r){const F=MP.FAMILY[key.split('.')[0]]||MP.DESIGNS[key.split('.')[0]],fp=F&&F.footprint||{},h=fp.r||Math.max(fp.w||40,fp.d||40)/2;return[h,h];}const f=r.frame,h=f.mode?[f.a,f.b]:[f.a*.6,f.a*.6];return Math.abs(Math.cos(yaw==null?0:yaw))<.5?[h[1],h[0]]:h;};
const avH=key=>{const r=AVC.rec[key];if(r)return r.frame.H;const F=MP.FAMILY[key.split('.')[0]]||MP.DESIGNS[key.split('.')[0]];return F?F.height.tip:60;};
const avBoxDist=(T,e)=>{const h=avHalf(T.key,T.yaw),dx=Math.max(Math.abs(e.x-T.x)-h[0],0),dz=Math.max(Math.abs(e.z-T.z)-h[1],0),dy=Math.max(e.y-T.y-avH(T.key),Math.max(T.y-e.y,0),0);return Math.hypot(dx,dy,dz);};
function avFade(g,key,x,y,z,yaw){const h=avHalf(key,yaw),H=AVC.rec[key].frame.H,a=new Float32Array(12);
 a.set([x-h[0],z-h[1],x+h[0],z+h[1],y,y+H,0,-AV_NEAR,1e9,1e9,1e9,1e9]);const cache=AVC.fadeMats||(AVC.fadeMats=new Map());
 g.children.forEach(m=>{const S=m.geometry,G=new THREE.BufferGeometry(),buf=new THREE.InstancedInterleavedBuffer(a.slice(),12,Math.max(1,m.isInstancedMesh?m.count:1));for(const n in S.attributes)G.setAttribute(n,S.attributes[n]);G.setIndex(S.index);if(!S.boundingSphere)S.computeBoundingSphere();G.boundingSphere=S.boundingSphere;
  G.setAttribute('aLodA',new THREE.InterleavedBufferAttribute(buf,4,0));G.setAttribute('aLodB',new THREE.InterleavedBufferAttribute(buf,4,4));G.setAttribute('aLodC',new THREE.InterleavedBufferAttribute(buf,4,8));m.geometry=G;
  let k=cache.get(m.material);if(!k){k=m.material.clone();k.onBeforeCompile=m.material.onBeforeCompile;k.customProgramCacheKey=m.material.customProgramCacheKey;k.userData=Object.assign({},m.material.userData);delete k.userData._lodFade;BIO.lodFade(k);cache.set(m.material,k);}m.material=k;});BIO._lodU.f.value=BIO.LOD.fade;}
function avShells(list){const n={};AVC.keys.forEach(k=>n[k]=0);const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),one=new THREE.Vector3(1,1,1),p=new THREE.Vector3();
 list.forEach(T=>{const im=AVC.mesh[T.key];if(!im)return;M.compose(p.set(T.x,T.y,T.z),avQuat(T),one);im.setMatrixAt(n[T.key]++,M);});
 AVC.keys.forEach(k=>{if(!AVC.mesh[k])return;AVC.mesh[k].count=n[k];AVC.mesh[k].instanceMatrix.needsUpdate=true;});}
function avDebris(list,far){const DB=far?AVC.debrisFar:AVC.debris,n={},M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),one=new THREE.Vector3(1,1,1),p=new THREE.Vector3();
 list.forEach(T=>{const D=DB[T.key];if(!D)return;const i=n[T.key]=(n[T.key]||0);M.compose(p.set(T.x,T.y,T.z),Q.setFromAxisAngle(Y,T.yaw||0),one);D.forEach(im=>im.setMatrixAt(i,M));n[T.key]++;});   /* the rubble lies on the ground: no lean */
 for(const k in DB)DB[k].forEach(im=>{im.count=n[k]||0;im.instanceMatrix.needsUpdate=true;});}
// the tiers each 150 ms: the nearest towers heroes from a pool; 300 m to 1.4 km shells (to 3.2 km seen steeply); the rest impostors
AVC.tiersTick=function(){if(!AVC.ready)return;const now=performance.now();if(now<(AVC.nextTier||0))return;AVC.nextTier=now+150;
 const e=camera.position,T=AVC.towers,near=[],mid=[];
 /* a design (no shell) is a hero to AV_DNEAR, the nearest AV_DHEROMAX of them, then its impostor. Seen steeply from above (the owner, 2026-11-08: the
    shells' top maps smeared from the air) a shelled tower is a hero to AV_NEAR_STEEP, unfaded, and its shell starts there; the hero pool is wider */
 /* the owner, 2026-11-08: heroes and shells drew on top of each other from the air. The dither band (the shell from .85 nearR, the hero fading out
    over it) is for the walker's view, where the hero fades; from above the heroes are unfaded, so a shell starts only where the heroes stop */
 /* THE TIERS, plainly. A tower is one of: a HERO (real), a SHELL (intact or gutted Spindles and Ledgers only, side-on, 255 m to 1.4 km from the walker's
    level), or its IMPOSTOR (a solid look, past the heroes). Every other tower (the designs, every ruin state, any tower whose roof the eye is above) is
    a hero to AV_DNEAR, to 3.2 km seen steeply, the nearest AV_DHEROMAX, then its impostor: no shell is ever drawn for it. A hero and a shell overlap
    only in the walker's dither band (255-300 m), where the hero fades out; everywhere else exactly one stands */
 const dnear=[],up=e.y-terrainH(e.x,e.z),steepEye=up>60;
 for(const t of T){const d=avBoxDist(t,e),hz=Math.hypot(e.x-t.x,e.z-t.z),H=avH(t.key),steep=(e.y-t.y-H*.5)>.7*Math.max(hz,1),above=e.y>t.y+H+25;t.d=d;t.shell=false;t.above=above;
  const shellable=avCanShell(t)&&!above&&!steepEye;t.shellable=shellable;
  if(!shellable){if(d<AV_DNEAR||(steep&&d<AV_IMPFAR))dnear.push(t);continue;}
  if(d<AV_NEAR)near.push(t);if(d>=AV_NEAR*.85&&(d<AV_FAR||(steep&&d<AV_IMPFAR))){mid.push(t);t.shell=true;}}
 near.sort((a,b)=>a.d-b.d);dnear.sort((a,b)=>a.d-b.d);const keep=near.slice(0,AV_HEROMAX).concat(dnear.slice(0,AV_DHEROMAX)),G=AVC.tierGroups;
 const fadeOf=t=>t.shellable;
 G.forEach((g,id)=>{const t=keep.find(t=>t.id===id);if(!t||g.userData.fade!==fadeOf(t)){scene.remove(g);G.delete(id);AVC.live.splice(AVC.live.indexOf(g),1);}});
 keep.forEach(t=>{if(!G.has(t.id)){const f=fadeOf(t),g=avHero(t.key,t.x,t.y,t.z,t.yaw,f);g.userData.fade=f;if(t.lean)g.quaternion.copy(avQuat(t));G.set(t.id,g);}});
 /* a shellable tower past the hero pool's cap within 255 m stands as its shell (rare: the pool is the nearest 16 and shells begin at 255 m) */
 near.slice(AV_HEROMAX).forEach(t=>{if(!t.shell){mid.push(t);t.shell=true;}});
 /* a hero the pool still holds past the dither band has no shell */
 {const held=new Set(keep.map(t=>t.id));for(let i=mid.length-1;i>=0;i--){const t=mid[i];if(held.has(t.id)&&t.d>=AV_NEAR){t.shell=false;mid.splice(i,1);}}}
 avShells(mid);avDebris(T.filter(t=>t.shelled&&t.d<AV_RUBBLE));avDebris(T.filter(t=>t.shelled&&t.d>=AV_RUBBLE&&t.d<AV_IMPFAR),true);
 AVC.impMeshes.forEach(o=>{const A=o.instanceMatrix.array,F=o.userData.full;for(let i=0,n=F.length/16;i<n;i++){const t=AVC.towerAt[F[i*16+12]+','+F[i*16+14]],nr=t?(t.shell||G.has(t.id)):false;for(let k=0;k<16;k++)A[i*16+k]=nr?0:F[i*16+k];}o.instanceMatrix.needsUpdate=true;});
 AVC.tierN={heroes:keep.length,shells:mid.length,impostors:T.filter(t=>!t.shell&&!G.has(t.id)).length,towers:T.length,looks:AVC.impKeys,steep:steepEye};};
tick(function(){if(!AVC.ready)AVC.boot();else{AVC.mat.userData.U.uPx.value=2*Math.tan(camera.fov*Math.PI/360)/Math.max(1,innerHeight);AVC.impTick();AVC.tiersTick();}});
// ---------------------------------------------------------------- the engines (kits/ancients 8ah, 8ai, read in place: the owner, 2026-11-04)
// A builder run once into a group of its own at decay 1 (the machine coming apart), the kit's instanced detail baked into that group, its pieces
// that touch nothing dropped (as kits/metropolis 55 does for its Ancients heroes), centred on its plan and stood on its pad. Always drawn: two
// on a page, each a few hundred metres across, are the sense of scale and cannot be let go at range. Built at the boot (the first frame): the
// kit's fragments (8ah, 8ai, its registry) sort after this one and before core/host's
let AV_ENGINES=[];
AVC.engines=function(){AV_ENGINES=STAGE.engines.map(E=>{const fn=window[E.fn];if(typeof fn!=='function'){reportErr('engine: the Ancients kit has no '+E.fn+' on this page');return null;}
 KIT.order.forEach(n=>{KIT.items[n].length=0;});KOFF=[0,0,0];KXF=null;const holder=new THREE.Group(),G=new THREE.Group(),r0=ANC_REG.length;
 try{fn(holder,0,0,1);}catch(e){reportErr('engine '+E.key+': '+e.stack);}
 (MP.ANCIENT_SKIP||[]).forEach(n=>{if(KIT.items[n])KIT.items[n].length=0;});KOFF=[0,0,0];KXF=null;kbake(holder);KIT.order.forEach(n=>{KIT.items[n].length=0;});
 const dropped=MP.ancientFloaters?MP.ancientFloaters(holder,true):0,S=MP.ancientSize?MP.ancientSize(holder):{cx:0,cz:0};holder.position.set(-S.cx,0,-S.cz);G.add(holder);
 /* the kit's own volumes (ANC_REG, in the builder's frame) become the page's records, moved with the engine */
 const c=Math.cos(E.yaw),s=Math.sin(E.yaw);ANC_REG.splice(r0).forEach(v=>{const lx=(v.x||0)-S.cx,lz=(v.z||0)-S.cz;REGISTER({name:v.name,kind:'engine',x:E.x+lx*c-lz*s,z:E.z+lx*s+lz*c,y:E.y+(v.y||0),r:v.r,h:v.h,tags:{kind:'engine',engine:E.key}});});
 G.position.set(E.x,E.y,E.z);G.rotation.y=E.yaw;G.name='engine.'+E.key;G.userData.inspectLabel=E.name;let tris=0;G.traverse(m=>{if(m.isMesh&&m.geometry){const g=m.geometry,n=g.index?g.index.count/3:g.attributes.position.count/3;tris+=n*(m.isInstancedMesh?m.count:1);}});G.userData.tris=Math.round(tris);
 if(MP.shadow)MP.shadow.cast(G);scene.add(G);return G;}).filter(Boolean);return AV_ENGINES;};
// ---------------------------------------------------------------- the lines: the viaduct (AV.viaduct's records drawn as instanced piers and decks)
let AV_LINES_GONE=0,AV_LAMPS=[];
const AV_LINES=(function(){const V=AV.viaduct(STAGE.viaduct.pts,{step:36,ground:terrainH,deckY:STAGE.viaduct.deckY});
 const P=KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('metropolis','concrete'):null,T=P?KMAT.textures(P,{aniso:8}):{};
 const mat=new THREE.MeshStandardMaterial({map:T.map||null,normalMap:T.normalMap||null,roughnessMap:T.roughnessMap||null,color:0x9a968c,roughness:.95,metalness:0});
 const rail=new THREE.MeshStandardMaterial({color:0x5a5248,roughness:.6,metalness:.6});
 const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),P3=new THREE.Vector3(),S3=new THREE.Vector3(),E=new THREE.Euler();
 /* the war damage on the line: a deck in fourteen is down (and the one after it half the time), its pier with it; a fallen deck lies tilted at the foot */
 const gone=V.decks.map((d,i)=>KRAND.unit(KRAND.hash(STAGE.seed,i,71))<.13||(i>0&&KRAND.unit(KRAND.hash(STAGE.seed,i-1,71))<.13&&KRAND.unit(KRAND.hash(STAGE.seed,i,72))<.6));
 const piers=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,V.piers.length);V.piers.forEach((p,i)=>{const h=Math.max(1,p.y1-p.y0),down=gone[i]&&gone[Math.max(0,i-1)];M.compose(P3.set(p.x,p.y0+(down?h*.25:h/2),p.z),Q.identity(),S3.set(3.2,down?h*.5:h,4.2));piers.setMatrixAt(i,M);});
 const decks=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,V.decks.length);V.decks.forEach((d,i)=>{if(gone[i]){const g=terrainH(d.x,d.z);M.compose(P3.set(d.x+8,Math.max(g,STAGE.lakeY-1)+2,d.z-6),Q.setFromEuler(E.set(.5,-d.yaw+.4,.35,'YXZ')),S3.set(d.len*.9,2.4,11));}
  else M.compose(P3.set(d.x,d.y-1.2,d.z),Q.setFromEuler(E.set(0,-d.yaw,d.pitch,'YXZ')),S3.set(d.len+.3,2.4,11));decks.setMatrixAt(i,M);});
 const rails=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),rail,V.decks.length*2);V.decks.forEach((d,i)=>{[-3.6,3.6].forEach((o,k)=>{const ox=-Math.sin(d.yaw)*o,oz=Math.cos(d.yaw)*o;if(gone[i])M.compose(P3.set(0,-1e4,0),Q.identity(),S3.set(.01,.01,.01));else M.compose(P3.set(d.x+ox,d.y+.3,d.z+oz),Q.setFromEuler(E.set(0,-d.yaw,d.pitch,'YXZ')),S3.set(d.len+.3,.6,.4));rails.setMatrixAt(i*2+k,M);});});
 AV_LINES_GONE=gone.filter(Boolean).length;
 /* THE DEBRIS (the owner's third pass): the craters' ejecta and the streets' fallen slabs (STAGE.debris, AV.debris), tilted concrete blocks in the
    same rusted grime as the towers, one instanced mesh; every record on the ground at its own height */
 const D=STAGE.debris,dm=new THREE.MeshStandardMaterial({map:T.map||null,normalMap:T.normalMap||null,color:0x5a5048,roughness:.98,metalness:0}),deb=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),dm,D.length);
 D.forEach((d,i)=>{const g=terrainH(d.x,d.z);M.compose(P3.set(d.x,g+d.sy*.3,d.z),Q.setFromEuler(E.set(d.tilt*.6,d.yaw,d.tilt,'YXZ')),S3.set(d.sx,d.sy,d.sz));deb.setMatrixAt(i,M);});
 deb.frustumCulled=false;deb.userData.inspectLabel='fallen slabs';deb.userData.host=true;deb.castShadow=deb.receiveShadow=!!MP.shadow;scene.add(deb);
 STAGE.craters.forEach((c,i)=>REGISTER({name:'A blast crater ('+Math.round(c.r)+' m)',kind:'crater',x:c.x,z:c.z,y:terrainH(c.x,c.z)-2,r:c.r*2.4,h:c.depth+c.rim+6,tags:{kind:'crater',n:i+1}}));
 /* THE LAMP STANDARDS (the owner, 2026-11-08: the grid carried by rows the eye follows): along both kerbs of every avenue, one every 30 m, 7 m tall, a
    bracket and a head; a third of them bent, a sixth fallen, by hash; none on a plinth, a scar, the water or the viaduct's corridor */
 const LT=STAGE.lattice,lamps=[],lampQ=[];const toW=(lx,lz)=>[lx*LT.c-lz*LT.s,lx*LT.s+lz*LT.c];
 STAGE.avenueLines().forEach((lv,li)=>{for(let s=-STAGE.R-300;s<=STAGE.R+300;s+=30){[[lv+LT.AW+1.5,s,0],[lv-LT.AW-1.5,s,0],[s,lv+LT.AW+1.5,1],[s,lv-LT.AW-1.5,1]].forEach((e,q)=>{const w=toW(e[0],e[1]),x=w[0],z=w[1];
   if(Math.hypot(x,z)>STAGE.R)return;if(STAGE.F.density(x,z)<.3||STAGE.F.scar(x,z)>.3||STAGE.built(x,z)>.05||STAGE.viaduct.d(x,z)<16)return;const g=terrainH(x,z);if(g<STAGE.lakeY+2)return;
   const h=KRAND.hash(STAGE.seed,li,Math.round(s/30),q+50),u=KRAND.unit(h);lamps.push({x,z,y:g,yaw:e[2]?Math.PI/2:0,state:u<.17?'fallen':u<.5?'bent':'up',u:KRAND.unit(KRAND.hash(h,3))});});}});
 const lampMat=new THREE.MeshStandardMaterial({color:0x4a4038,roughness:.9,metalness:.5}),LP=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),lampMat,lamps.length*2);
 lamps.forEach((l,i)=>{const H=7;if(l.state==='fallen'){M.compose(P3.set(l.x+Math.cos(l.u*6.28)*3,l.y+.2,l.z+Math.sin(l.u*6.28)*3),Q.setFromEuler(E.set(0,l.u*6.28,Math.PI/2*.97,'YXZ')),S3.set(.3,H,.3));LP.setMatrixAt(i*2,M);M.compose(P3.set(0,-1e4,0),Q.identity(),S3.set(.01,.01,.01));LP.setMatrixAt(i*2+1,M);return;}
  const tilt=l.state==='bent'?(.25+.5*l.u):0;M.compose(P3.set(l.x,l.y+H/2,l.z),Q.setFromEuler(E.set(tilt*Math.cos(l.u*4),l.yaw,tilt*Math.sin(l.u*4),'YXZ')),S3.set(.3,H,.3));LP.setMatrixAt(i*2,M);
  const ax=Math.sin(l.yaw),az=Math.cos(l.yaw),bx=l.x-Math.sin(tilt*Math.sin(l.u*4))*H*.5,bz=l.z+Math.sin(tilt*Math.cos(l.u*4))*H*.5;M.compose(P3.set(bx+ax*1.2,l.y+H*(1-.15*tilt)-.3,bz+az*1.2),Q.setFromEuler(E.set(0,l.yaw,0,'YXZ')),S3.set(.25,.35,2.6));LP.setMatrixAt(i*2+1,M);});
 LP.frustumCulled=false;LP.userData.inspectLabel='a lamp standard';LP.userData.host=true;scene.add(LP);
 if(lamps.length)REGISTER({name:'The avenues\' lamp standards',kind:'line',x:0,z:0,r:STAGE.R,h:8,tags:{kind:'line',line:'lamps',count:lamps.length}});
 AV_LAMPS=lamps;
 [piers,decks,rails].forEach(m=>{m.frustumCulled=false;m.userData.inspectLabel='the transit viaduct';m.userData.host=true;m.castShadow=m.receiveShadow=!!MP.shadow;scene.add(m);});
 REGISTER({name:'The transit viaduct',kind:'line',x:0,z:-800,r:3000,h:60,tags:{kind:'line',line:'viaduct',length:Math.round(V.length)}});
 return{V,piers,decks,rails,debris:deb,tris:(V.piers.length+V.decks.length*3+D.length)*12};})();
