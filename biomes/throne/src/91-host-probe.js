// ================================================================= HOST — probe (window._api)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:20000000,calls:140},   // a ceiling, not a target: measure and record it in KNOWN_ISSUES
 cls:{pass:16000000,host:900000},
 type:{'throne/trees':'pass','throne/floor':'pass','host':'host'},
};
function _probePoints(){
 const pts=[],m=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),bb=new THREE.Box3();
 scene.traverse(o=>{if(o.userData&&o.userData.probeSkip)return;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);m.decompose(pos,q,sc);pts.push([pos.x,pos.y,pos.z]);}return;}
  if(!o.isMesh)return;bb.setFromObject(o);if(!isFinite(bb.min.x)||!isFinite(bb.max.x))return;
  pts.push([(bb.min.x+bb.max.x)/2,(bb.min.y+bb.max.y)/2,(bb.min.z+bb.max.z)/2]);});
 return pts;}
function regOccupancy(){const n=new Array(REG.length).fill(0);const P=_probePoints();
 REG.forEach((r,i)=>{for(const p of P)if(regHas(r,p[0],p[1],p[2]))n[i]++;});
 return REG.map((r,i)=>({name:r.name,n:n[i]}));}
function nanSweep(){const bad=[];let badInst=0;
 scene.traverse(o=>{if(!o.isMesh&&!o.isInstancedMesh)return;if(o.userData&&o.userData.probeSkip)return;
  const p=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;if(p){const a=p.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad.push({geo:o.name||o.geometry.type,at:i});break;}}
  if(o.isInstancedMesh){const a=o.instanceMatrix.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){badInst++;break;}}});
 return {meshes:bad.length,first:bad.slice(0,8),instances:badInst,firstInstances:[]};}
function typeStats(){const out={};for(const k in BIO.stats){const t=BIO.stats[k],cls=BUDGET.type[k]||'pass';out[k]={tris:t.tris,inst:t.inst,meshes:t.meshes,cls,limit:BUDGET.cls[cls],over:t.tris>BUDGET.cls[cls]};}return out;}
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const ORIGINS=['earth','krator','native'],LIVES=['shoulder','seam','plume','vent','windward'];
const HCHK={
 // every species of the table is placed somewhere on the stage
 // (the species of this station: the windward ones live on the windward stations' pages)
 placed(C){const here=THRONE.SPECIES.filter(S=>S.tags.plume!=='windward'&&!S.vents&&!S.cold),zero=here.filter(S=>!(C[S.i]>0)).map(S=>S.key);
  return{ok:C.length===THRONE.SPECIES.length&&!zero.length,detail:zero.length?'never placed: '+zero.join(', '):here.length+' species of this station, the scarcest '+Math.min(...here.map(S=>C[S.i]))};},
 // every species and floor plant carries its tags: the project's, its origin and where it lives, Koppen inside the region
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged or tagged outside the region: '+bad.join(', '):L.length+' species and plants tagged (climate, aridity, abyssal, riparian, origin, plume, harvest, Koppen)'};},
 // THE MOSAIC: every stage of the flows covers a real share of the map (the fresh one is a single flow: 1%; the others 2%)
 mosaic(sh){const low=['fresh','young','mature','old'].filter(k=>!(sh[k]>=(k==='fresh'?.01:.02)));
  return{ok:!low.length,detail:(low.length?'stages under their share of the map: '+low.join(', ')+'; ':'')+Object.keys(sh).map(k=>k+' '+(sh[k]*100).toFixed(1)+'%').join(', ')};},
 // THE TURN: deep under the plume the trees are Krator's own; in the shoulder's clear air they are not
 turn(T,pl){const deep=T.filter(t=>pl(t.x,t.z)>.85),clear=T.filter(t=>pl(t.x,t.z)<.12),nat=L=>L.filter(t=>THRONE.SPECIES[t.sp].tags.origin==='native').length/Math.max(1,L.length);
  const a=nat(deep),b=nat(clear);return{ok:deep.length>20&&clear.length>20&&a>=.85&&b<=.12,detail:'under the plume '+(a*100).toFixed(0)+'% native of '+deep.length+'; in clear air '+(b*100).toFixed(0)+'% of '+clear.length};},
 // the young lie on the old: the new flow is the age of the ground along most of its own path
 onTop(F,key,age){const f=F.flows.find(x=>x.key===key);if(!f||!f.path)return{ok:false,detail:'no flow '+key};const P=f.path.filter((p,i)=>i%3===0),hit=P.filter(p=>F.ageAt(p.x,p.z)===age).length/Math.max(1,P.length);
  return{ok:hit>=.9,detail:(hit*100).toFixed(0)+'% of the '+key+' flow\'s path is '+age+' years old ground'};},
 // the bone bells grow only in the vents' steam
 bells(T,v){const b=T.filter(t=>THRONE.SPECIES[t.sp].key==='bonebell'),bad=b.filter(t=>v(t.x,t.z)<.06);
  return{ok:b.length>0&&!bad.length,detail:bad.length?bad.length+' bone bells out of the steam (first at '+[bad[0].x|0,bad[0].z|0]+')':b.length+' bone bells, all in the steam'};},
 // the night lights Krator's own life: the glow at night is many times the day's
 glow(f){const d=f(0),n=f(1);f(LIGHT_MODE==='night'?1:0);return{ok:n.lamp>d.lamp*4&&n.bracket>d.bracket*4,detail:'lamp '+d.lamp.toFixed(2)+' to '+n.lamp.toFixed(2)+', bracket '+d.bracket.toFixed(2)+' to '+n.bracket.toFixed(2)};},
 // nothing roots under the water: no instance's origin more than a metre under the local surface
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 // no tree on a sheer rock face (a flow's front, a crater wall)
 cliffs(T){const bad=T.filter(t=>FIELD.slope(t.x,t.z)>.97&&FIELD.rock(t.x,t.z)>.6);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on sheer rock (first '+THRONE.SPECIES[bad[0].sp].key+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' trees, none on a sheer face'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('every species placed',HCHK.placed(THRONE.COUNTS||[]));
 add('every species and plant tagged, with its origin and where it lives',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('every stage of the flow mosaic present',HCHK.mosaic(FLOWS.shares()));
 add('the plume turns the life to Krator\'s own',HCHK.turn(THRONE.TREES,plumeAt));
 add('the new flow lies on top',HCHK.onTop(FLOWS,'new',2));
 add('bone bells only in the steam',HCHK.bells(THRONE.TREES,FIELD.vent));
 add('the night lights the native life',HCHK.glow(THRONE.setNight));
 add('nothing rooted under the water',HCHK.dry(P));
 add('no tree on a sheer rock face',HCHK.cliffs(THRONE.TREES));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 const C=(THRONE.COUNTS||[]).slice();C[SPI('lampcap')]=0;add('a species never placed',HCHK.placed(C));
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===3?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 add('a species tagged outside the region',HCHK.tagged([Object.assign({},THRONE.SPECIES[0],{tags:Object.assign({},THRONE.SPECIES[0].tags,{koppen:['EF']})})]));
 add('a map with no fresh lava',HCHK.mosaic(Object.assign({},FLOWS.shares(),{fresh:0})));
 add('the plume read backwards',HCHK.turn(THRONE.TREES,(x,z)=>1-plumeAt(x,z)));
 add('a flow buried by an older one',HCHK.onTop(FLOWS,'new',38));
 add('a bone bell on the shoulder',HCHK.bells([{sp:SPI('bonebell'),x:-2000,z:-500}],FIELD.vent));
 add('a glow that ignores the night',HCHK.glow(()=>({lamp:.2,bracket:.1})));
 add('a plant on the acid lake\'s bed',HCHK.dry([[PIT.x,PIT.lake-3,PIT.z,'test']]));
 {let bx=PIT.x,bz=PIT.z,bs=-1;for(let z=PIT.z-200;z<=PIT.z+200;z+=4)for(let x=PIT.x-200;x<=PIT.x+200;x+=4){const s=FIELD.slope(x,z)*FIELD.rock(x,z);if(s>bs){bs=s;bx=x;bz=z;}}
  add('a tree on the pit crater\'s wall',HCHK.cliffs([{x:bx,z:bz,sp:0}]));}
 add('a camera in the acid lake',HCHK.camerasOut([{view:'under',x:PIT.x,y:PIT.floor-5,z:PIT.z}]));
 return R;}
window._api={BUDGET,REG,hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,setLightMode,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),go:k=>go(k),
 biome:()=>window._biome,
 flows:()=>({flows:FLOWS.flows.map(f=>({key:f.key,age:f.age,cells:f.cells,steps:f.path.length})),shares:FLOWS.shares()}),
 // the climate at a point, for the probe and for --eval: the fields, the flow and the kit's zones
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),age:FLOWS.ageAt(x,z),thick:FLOWS.thickAt(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}};
window._registered=REG.length;
