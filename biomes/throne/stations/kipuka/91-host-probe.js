// ================================================================= HOST — probe (window._api)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:24000000,calls:260},   // two kits on one page: a ceiling, not a target (KNOWN_ISSUES)
 cls:{pass:16000000,host:900000},
 type:{'throne/trees':'pass','throne/floor':'pass','jungle/trees':'pass','jungle/floor':'pass','jungle/fauna':'pass','host':'host'},
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
const KEY=t=>THRONE.SPECIES[t.sp].key;
const HCHK={
 // the species of this station (the windward ones but the geyser isle's and the cloud forest's own, and the ruff trees' seedlings) are all placed
 placed(C){const here=THRONE.SPECIES.filter(S=>(S.tags.plume==='windward'&&!S.isle&&!S.cloud)||S.key==='ruff'),zero=here.filter(S=>!(C[S.i]>0)).map(S=>S.key);
  return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):here.length+' species of this station, the scarcest '+Math.min(...here.map(S=>C[S.i]))};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged or tagged outside the region: '+bad.join(', '):L.length+' species and plants tagged'};},
 mosaic(sh){const low=['fresh','young','mature','old'].filter(k=>!(sh[k]>=(k==='fresh'?.01:.02)));
  return{ok:!low.length,detail:(low.length?'stages under their share of the map: '+low.join(', ')+'; ':'')+Object.keys(sh).map(k=>k+' '+(sh[k]*100).toFixed(1)+'%').join(', ')};},
 // THE KIPUKA are the hyperjungle's: no Throne tree stands inside one but the great ruffs on its rim
 kipukaKept(T,own){const bad=T.filter(t=>KEY(t)!=='greatruff'&&KEY(t)!=='frilltree'&&KEY(t)!=='siphon'&&own(t.x,t.z)>.75);
  return{ok:!bad.length,detail:bad.length?bad.length+' Throne trees inside a kipuka (first '+KEY(bad[0])+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' Throne trees, none inside a kipuka but on its rim'};},
 // ... and the hyperjungle stands only on them
 jungleOnKipuka(J,own){const bad=J.filter(t=>own(t.x,t.z)<.3);
  return{ok:J.length>10&&!bad.length,detail:bad.length?bad.length+' hyperjungle trees off the kipuka (first at '+[bad[0].x|0,bad[0].z|0]+')':J.length+' hyperjungle trees, all on the kipuka'};},
 // the great ruffs seed the young lava beside their kipuka: ruff trees stand there
 seeded(T,near){const s=T.filter(t=>KEY(t)==='ruff'&&near(t.x,t.z)>.05);
  return{ok:s.length>=10,detail:s.length+' ruff-tree seedlings on the young lava beside a kipuka'};},
 // the lava casts stand where a flow met the forest
 casts(R,near){const c=R.filter(r=>r.key==='cast'),bad=c.filter(r=>near(r.x,r.z)<.02);
  return{ok:c.length>=5&&!bad.length,detail:bad.length?bad.length+' casts away from any kipuka':c.length+' lava casts, all beside a kipuka'};},
 // the siphon trees stand in the tube's skylights
 siphons(T,sky){const s=T.filter(t=>KEY(t)==='siphon'),bad=s.filter(t=>sky(t.x,t.z)<.3);
  return{ok:s.length>0&&!bad.length,detail:bad.length?bad.length+' siphon trees out of a skylight':s.length+' siphon trees, all in skylights'};},
 onTop(F,key,age){const f=F.flows.find(x=>x.key===key);if(!f||!f.path)return{ok:false,detail:'no flow '+key};const P=f.path.filter((p,i)=>i%3===0&&Math.abs(p.x)<TERR.R&&Math.abs(p.z)<TERR.R),hit=P.filter(p=>F.ageAt(p.x,p.z)===age).length/Math.max(1,P.length);
  return{ok:hit>=.9,detail:(hit*100).toFixed(0)+'% of the '+key+' flow\'s path is '+age+' years old ground'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 cliffs(T){const bad=T.filter(t=>FIELD.slope(t.x,t.z)>.97&&FIELD.rock(t.x,t.z)>.6);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on sheer rock (first '+KEY(bad[0])+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' trees, none on a sheer face'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
const JT=()=>(typeof HYPERJUNGLE!=='undefined'&&HYPERJUNGLE.TREES)||[];
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('every species of the station placed',HCHK.placed(THRONE.COUNTS||[]));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('every stage of the flow mosaic present',HCHK.mosaic(FLOWS.shares()));
 add('the kipuka are the hyperjungle\'s',HCHK.kipukaKept(THRONE.TREES,FIELD.owned));
 add('the hyperjungle stands on the kipuka',HCHK.jungleOnKipuka(JT(),FIELD.owned));
 add('the young lava beside a kipuka is seeded with ruff trees',HCHK.seeded(THRONE.TREES,FIELD.knear));
 add('the lava casts stand where a flow met the forest',HCHK.casts(REG,FIELD.knear));
 add('the siphon trees stand in the skylights',HCHK.siphons(THRONE.TREES,FIELD.skylight));
 add('the new flow lies on top',HCHK.onTop(FLOWS,'new',3));
 add('nothing rooted under the water',HCHK.dry(P));
 add('no tree on a sheer rock face',HCHK.cliffs(THRONE.TREES));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 const C=(THRONE.COUNTS||[]).slice();C[SPI('siphon')]=0;add('a species never placed',HCHK.placed(C));
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===14?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 add('a map with no fresh lava',HCHK.mosaic(Object.assign({},FLOWS.shares(),{fresh:0})));
 const inK=(function(){for(let z=-2000;z<=2000;z+=40)for(let x=-2000;x<=2000;x+=40)if(FIELD.owned(x,z)>.95&&FIELD.kedge(x,z)<.05)return[x,z];return[0,0];})();
 add('a lehua inside a kipuka',HCHK.kipukaKept([{sp:SPI('lehua'),x:inK[0],z:inK[1]}],FIELD.owned));
 const FN=FLOWS.flows.find(f=>f.key==='new').path[20];
 add('a hyperjungle tree on the new flow',HCHK.jungleOnKipuka(JT().concat([{x:FN.x,z:FN.z}]),FIELD.owned));
 add('no seedlings',HCHK.seeded([],FIELD.knear));
 add('a cast in the middle of a kipuka',HCHK.casts(REG.filter(r=>r.key==='cast').concat([{key:'cast',x:inK[0],z:inK[1]}]),(x,z)=>x===inK[0]&&z===inK[1]?0:FIELD.knear(x,z)));
 add('a siphon tree on open lava',HCHK.siphons([{sp:SPI('siphon'),x:FN.x,z:FN.z}],FIELD.skylight));
 add('a flow buried by an older one',HCHK.onTop(FLOWS,'new',35));
 // a point on a stream where it has water (a flow may have buried its bed elsewhere)
 {let p=streamPt(STREAMS[0],0);for(let s=-2500;s<=2500;s+=40){const q=streamPt(STREAMS[0],s);if(waterH(q[0],q[1])>-1e8){p=q;break;}}
  add('a plant on a stream\'s bed',HCHK.dry([[p[0],waterH(p[0],p[1])-2.5,p[1],'test']]));}
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 return R;}
window._api={BUDGET,REG,hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,setLightMode,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),go:k=>go(k),
 biome:()=>window._biome,jungle:()=>window._jungle,
 flows:()=>({flows:FLOWS.flows.map(f=>({key:f.key,age:f.age,cells:f.cells,steps:f.path.length})),shares:FLOWS.shares()}),
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),age:FLOWS.ageAt(x,z),thick:FLOWS.thickAt(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}};
window._registered=REG.length;
