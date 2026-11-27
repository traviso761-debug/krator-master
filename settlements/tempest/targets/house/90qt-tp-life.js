// ================================================================= THE HOUSE OF THE TEMPEST — life on the crest (step 4b)
// TP_LIFE (src/80x) drawn: the herds from kits/fauna (gen/69u, the farm group's horse and yak, read in place through its bundle) on
// the drawn ground, by day on the commons and at the byres, by night the horses in the walled paddock (the page's NIGHT, from the
// sky: ?hour=21 shows it); each beast a still in its pose, instanced by look (coat and pose), and a few nearest the paddock and the
// byres alive (KratorFauna.animate). The chain of fires: the Storm Tower's mirror flashing its code by day toward the brow, its
// fire basket and the utse's beacon burning by night, the brow lookout (the fort asset's watch post, xa_fort_post) at its pin 14 km
// west on the far land, its fire and its mirror. The relay waits on step 5. [web]: three.js, the kit's vB.
const TP_LIFE_DRAWN=(function(){
 const L=TP_LIFE,S=L.signals,PLACED={day:L.place(TP_GROUNDS,'day'),night:L.place(TP_GROUNDS,'night')},LIVE_N=12;
 const id=a=>a.herd+'.'+a.i,byId={day:{},night:{}};for(const w of['day','night'])for(const a of PLACED[w])byId[w][id(a)]=a;
 const page=a=>{const p=TPS.toPage(a.x,a.z);return[p[0],terrainH(p[0],p[1]),p[1]];};
 /* ---------------------------------------------------------------- the herds: one look per (key, coat, pose), its meshes instanced */
 const looks={},live=[],m4=new THREE.Matrix4(),q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),one=new THREE.Vector3(1,1,1),v3=new THREE.Vector3();
 const HERDS=new THREE.Group();HERDS.name='the herds (kits/fauna)';scene.add(HERDS);
 /* the live ones: the beasts nearest the paddock's gate and the byres' sheds by day (where the crest's views look) */
 const near=(pt,herd,n)=>PLACED.day.filter(a=>a.herd===herd).map(a=>[a,Math.hypot(a.x-pt[0],a.z-pt[1])]).sort((p,r)=>p[1]-r[1]).slice(0,n).map(p=>id(p[0]));
 const pb=TP_GROUNDS.fields.find(f=>f.id==='paddock').box,shed=TP_GROUNDS.pieces.find(p=>p.id==='byres.shed.a');
 const LIVE=new Set(near([pb[2],(pb[1]+pb[3])/2],'remounts',LIVE_N/2).concat(near(shed.at,'milk',LIVE_N/2)));
 function lookOf(a){const k=a.key+'|'+a.look+'|'+a.pose;if(looks[k])return looks[k];
  const g=KratorFauna.build(a.key,{variant:a.look,seed:L.SEED+a.look});KratorFauna.animate(g,0,a.pose);g.updateMatrixWorld(true);
  const ms=[];g.traverse(o=>{if(o.isMesh)ms.push({geo:o.geometry,mat:o.material,rel:o.matrixWorld.clone()});});
  return looks[k]={ms,tris:g.userData.tris||0,list:[],meshes:[]};}
 for(const a of PLACED.day){if(LIVE.has(id(a)))continue;lookOf(a).list.push(id(a));}
 let tris=0,inst=0;
 for(const k in looks){const Lk=looks[k];for(const m of Lk.ms){const im=new THREE.InstancedMesh(m.geo,m.mat,Lk.list.length);im.frustumCulled=false;im.name='herd '+k;
   im.castShadow=false;im.receiveShadow=false;HERDS.add(im);Lk.meshes.push({im,rel:m.rel});}tris+=Lk.tris*Lk.list.length;inst+=Lk.list.length;}
 const at=(a,M)=>{const p=page(a);q.setFromAxisAngle(Y,a.ry+TPS.ry);return M.compose(v3.set(p[0],p[1],p[2]),q,one);};
 const W=new THREE.Matrix4(),IM=new THREE.Matrix4();
 /* the live beasts: their own groups, animated near the camera */
 for(const a of PLACED.day){if(!LIVE.has(id(a)))continue;const g=KratorFauna.build(a.key,{variant:a.look,seed:L.SEED+a.look});g.name='a live '+a.key;
  HERDS.add(g);live.push({g,a,ph:(a.i*.37)%1});tris+=g.userData.tris||0;}
 let when=null,seat=0;
 function set(w){if(w===when)return;when=w;seat=0;const B=byId[w];
  for(const k in looks){const Lk=looks[k];Lk.list.forEach((h,i)=>{const a=B[h];at(a,W);const gy=page(a)[1];seat=Math.max(seat,Math.abs(W.elements[13]-gy));
    for(const M of Lk.meshes){IM.multiplyMatrices(W,M.rel);M.im.setMatrixAt(i,IM);}});for(const M of Lk.meshes)M.im.instanceMatrix.needsUpdate=true;}
  for(const o of live){const a=B[id(o.a)],p=page(a);o.g.position.set(p[0],p[1],p[2]);o.g.rotation.y=a.ry+TPS.ry;}
  /* the registry follows the herds (one volume a herd, round its field) */
  for(const r of REGS){const f=TP_GROUNDS.fields.find(x=>x.id===r.herd[w]),b=f.box,c=TPS.toPage((b[0]+b[2])/2,(b[1]+b[3])/2),ys=[[b[0],b[1]],[b[2],b[1]],[b[2],b[3]],[b[0],b[3]],[(b[0]+b[2])/2,(b[1]+b[3])/2]].map(p=>{const g=TPS.toPage(p[0],p[1]);return terrainH(g[0],g[1]);});
   Object.assign(r.reg,{x:c[0],z:c[1],r:Math.hypot(b[2]-b[0],b[3]-b[1])/2+1,y:Math.min(...ys)-.5,h:Math.max(...ys)-Math.min(...ys)+3});}}
 /* registered before they are drawn (core/tags): one volume a herd, moved with it at dusk and dawn */
 const REGS=L.herds.map(h=>{const reg={name:'The House of the Tempest — the crest — '+h.note.split(':')[0],x:0,y:0,z:0,r:1,h:1,cls:'life',key:h.key,type:'xa_tempest_life',   /* core/tags: an animal is class life, its species the kind */
   tags:{culture:'xanadu',kit:'fauna',type:['agriculture'],wealth:'civic',lit:false,part:'herd'}};REG.push(reg);return{herd:h,reg};});
 set('day');
 /* ---------------------------------------------------------------- the chain of fires and mirrors */
 const st=TP_PLAN.towers.find(t=>t.id===S.storm.tower),sc=TPS.toPage(st.ctr[0],st.ctr[1]),roof=TPS.pad+XFORT.towerTop(st);
 const LK=S.lookout.at,toLk=Math.atan2(LK[0]-sc[0],LK[1]-sc[1]);   /* the bearing from the Storm Tower to the brow (three.js yaw: +z toward +x) */
 const fires=[],mirrors=[],FL=new THREE.MeshBasicMaterial({color:0xffa040,toneMapped:false,transparent:true,opacity:.92,depthWrite:false});
 const MOFF=new THREE.Color(0x8d939a),MON=new THREE.Color(4,4,3.6);
 function fire(name,x,y,z,s){const g=new THREE.Group();g.name=name;g.position.set(x,y,z);g.visible=false;g.userData.probeSkip=true;
  for(let i=0;i<3;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(.28*s*(1-i*.22),1.1*s*(1-i*.2),7),FL);c.position.set((i-1)*.12*s,.5*s,((i*2)%3-1)*.1*s);g.add(c);}
  const l=new THREE.PointLight(0xff8a3a,0,80*s,2);l.position.y=1.2*s;g.add(l);scene.add(g);fires.push({name,g,l,ph:fires.length*1.7});return g;}
 function mirror(name,x,y,z,ry){const g=new THREE.Group();g.name=name;g.position.set(x,y,z);g.rotation.y=ry;g.userData.probeSkip=true;
  const mat=new THREE.MeshBasicMaterial({color:MOFF.clone(),toneMapped:false}),plate=new THREE.Mesh(new THREE.PlaneGeometry(S.storm.mirror.w,S.storm.mirror.h),mat);
  plate.position.set(0,1.9,.06);g.add(plate);const back=new THREE.Mesh(new THREE.BoxGeometry(S.storm.mirror.w+.12,S.storm.mirror.h+.12,.08),new THREE.MeshLambertMaterial({color:0x4a3a2a}));
  back.position.set(0,1.9,0);g.add(back);scene.add(g);mirrors.push({name,g,mat});return g;}
 /* the Storm Tower's basket and its four bronze mirrors are the fort asset's (a signal tower: kits/xanadu 80g xfTower, since
    2026-11-23); after the bake the fire is lit on that basket and the flash shown on the mirror that faces the brow (afterBake) */
 function glint(name,x,y,z,ry,r){const g=new THREE.Group();g.name=name;g.position.set(x,y,z);g.rotation.y=ry;g.userData.probeSkip=true;g.visible=false;
  const mat=new THREE.MeshBasicMaterial({color:MON.clone(),toneMapped:false}),disc=new THREE.Mesh(new THREE.CircleGeometry(r,20),mat);g.add(disc);scene.add(g);
  mirrors.push({name,g,mat,glint:true});return g;}
 /* ---------------------------------------------------------------- the brow lookout (called by 90r before the bake) */
 const far=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0),o3=new THREE.Vector3();
 const farH=(x,z)=>{o3.set(x,9000,z);far.set(o3,down);const h=far.intersectObject(TP_FARMESH,false)[0];return h?h.point.y:terrainH(x,z);};
 let lookout=null;
 function placeLookout(G){const x=LK[0],z=LK[1],P=XFORT.post(),ry=Math.atan2(sc[0]-x,sc[1]-z),cs=[[-P.w/2,-P.d/2],[P.w/2,-P.d/2],[P.w/2,P.d/2],[-P.w/2,P.d/2],[0,0]];
  const ys=cs.map(c=>{const p=loc(x,z,c[0],c[1],ry);return farH(p[0],p[1]);}),y=Math.min(...ys)-.2;   /* seated by its lowest corner on the drawn far land */
  TSTAT.cur='xa_fort_post/0';const r0=REG.length;const g=VERN.place(G,'xa_fort_post',x,z,ry,{v:0,y,fort:S.lookout.fort});for(let i=r0;i<REG.length;i++)REG[i].type='xa_fort_post';TSTAT.cur=null;
  const T=P.tower,tp=loc(x,z,T.at[0],T.at[1],ry),top=y+T.h+.15+P.basket.h;fire('the brow lookout\'s fire',tp[0],top+.3,tp[1],1.3);
  const mp=loc(x,z,T.at[0]+T.w/2-.6,T.at[1],ry);mirror('the brow lookout\'s mirror',mp[0],y+T.h+.15,mp[1],ry);
  lookout={placed:!!g,x,z,y,ground:farH(x,z),corners:ys,ry};return g;}
 /* ---------------------------------------------------------------- after the bake: the utse's beacon basket, found among the kit's drums
    (xfKeep puts it 1.2 m in from the roof's corner; its stack is narrower than the block, so it stands some 2 m further in) */
 function afterBake(){const U=TP_PLAN.utse,want=TPS.toPage(U.at[0]+U.w/2-1.2,U.at[1]+U.d/2-1.2),im=KIT.meshes.xDrumE;let best=null;
  if(im){const M=new THREE.Matrix4(),p=new THREE.Vector3(),qq=new THREE.Quaternion(),s=new THREE.Vector3();
   for(let i=0;i<im.count;i++){im.getMatrixAt(i,M);M.decompose(p,qq,s);const d=Math.hypot(p.x-want[0],p.z-want[1]);if(d<4&&p.y>TPS.pad+15&&(!best||p.y>best.y))best={x:p.x,y:p.y,z:p.z};}}
  if(best)fire('the utse\'s beacon',best.x,best.y+.55,best.z,1.1);
  /* the Storm Tower's: its basket on the roof's middle, its four mirrors (flat drums, .06 thick) at the corners */
  let basket=null,face=null;
  if(im){const M=new THREE.Matrix4(),p=new THREE.Vector3(),qq=new THREE.Quaternion(),s=new THREE.Vector3();
   for(let i=0;i<im.count;i++){im.getMatrixAt(i,M);M.decompose(p,qq,s);const dx=p.x-sc[0],dz=p.z-sc[1],d=Math.hypot(dx,dz);if(p.y<roof||p.y>roof+4||d>st.w*.75)continue;   /* the corners are on the diagonal */
    if(d<1.2&&s.y>.3){if(!basket||p.y>basket.y)basket={x:p.x,y:p.y,z:p.z};}
    else if(s.y<.1){const a=Math.atan2(dx,dz),off=Math.abs(Math.atan2(Math.sin(a-toLk),Math.cos(a-toLk)));if(!face||off<face.off)face={x:p.x,y:p.y,z:p.z,a,off,r:s.x};}}}
  if(basket)fire('the Storm Tower\'s fire',basket.x,basket.y+.55,basket.z,1);
  if(face)glint('the Storm Tower\'s mirror toward the brow',face.x+Math.sin(face.a)*.06,face.y,face.z+Math.cos(face.a)*.06,face.a,Math.max(.3,face.r*.9));
  return!!best&&!!basket&&!!face;}
 /* ---------------------------------------------------------------- each frame: the live beasts, the mirrors' code, the fires */
 const clock={t:0};
 function tick(dt,night){clock.t+=dt||0;const t=clock.t,cam=camera.position;
  set(night?'night':'day');
  for(const o of live){if(o.g.position.distanceTo(cam)>700)continue;KratorFauna.animate(o.g,t,o.a.pose==='rest'?'rest':o.a.pose,{phase:o.ph});}
  const on=!night&&L.lit(S.code,t);for(const m of mirrors){if(m.glint)m.g.visible=on;else m.mat.color.copy(on?MON:MOFF);}
  for(const f of fires){f.g.visible=!!night;if(night){const k=.84+.10*Math.sin(t*5.1+f.ph)+.06*Math.sin(t*13.3+f.ph*1.7);f.l.intensity=2.2*k;f.g.scale.setScalar(.9+.15*k);}}
  return on;}
 FRAME_HOOKS.push(dt=>tick(dt,typeof NIGHT!=='undefined'&&!!NIGHT));
 return{PLACED,looks,live,set,tick,placeLookout,afterBake,get when(){return when;},get seat(){return seat;},get lookout(){return lookout;},fires,mirrors,
  stats:()=>({instanced:inst,live:live.length,looks:Object.keys(looks).length,tris,meshes:HERDS.children.length})};})();
