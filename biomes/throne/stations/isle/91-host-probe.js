// ================================================================= HOST — probe (window._api)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:24000000,calls:260},   // a ceiling, not a target (KNOWN_ISSUES)
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
const SPK=k=>THRONE.SPECIES.indexOf(THRONE.byKey[k]);
// items meant to stand in the water: the kelp, a geyser's throat
const WET_ITEMS=/^biome:(kelp\d|seaweed\d|vent)$/;
const HCHK={
 // the geysers: each on its schedule (a period longer than its eruption), on the sinter; erupt() starts one now
 geysers(L){const bad=L.filter(G=>!(G.H>0&&G.dur>0&&G.period>G.dur)||FIELD.sinter(G.x,G.z)<.5);
  return{ok:L.length>=2&&!bad.length,detail:bad.length?bad.length+' geysers off the sinter or off their schedules':L.map(G=>G.key+' every '+G.period+' s for '+G.dur+' s, '+G.H+' m').join('; ')};},
 // nothing grows in a spring, or on a geyser's cone
 springs(P){const bad=P.filter(p=>!WET_ITEMS.test(p[3])&&(POOLS.some(S=>Math.hypot(p[0]-S.x,p[2]-S.z)<S.r*.95)||Math.hypot(p[0]-GEYSERS[0].x,p[2]-GEYSERS[0].z)<GEYSERS[0].cone*1.2));
  return{ok:!bad.length,detail:bad.length?bad.length+' instances in a spring or on the cone (first '+bad[0][3]+')':'the springs and the cone are bare'};},
 // the wild Ranj bears on the warm ground: most of the near Ranj trees there have resin drops in their crowns
 spice(T,resin){const sp=SPK('spice'),W=T.filter(t=>t.sp===sp&&t.lv===2&&!t.planted&&FIELD.grove(t.x,t.z)>.4),bearing=W.filter(t=>resin.some(p=>Math.hypot(p[0]-t.x,p[2]-t.z)<t.crownR+1.5));
  return{ok:W.length>=8&&bearing.length>=W.length*.6,detail:bearing.length+' of '+W.length+' near wild Ranj trees on the warm ground bear resin'};},
 // the coconut palm names its catalog fruit, and its nuts are drawn
 coconut(SP,P){const S=SP.find(s=>s.key==='coconut'),n=P.filter(p=>p[3]==='biome:coconut').length;const ok=!!S&&S.tags.harvest&&S.tags.harvest.fruit==='generic_fruit_coconut'&&n>=40;
  return{ok,detail:(S&&S.tags.harvest&&S.tags.harvest.fruit?'catalog '+S.tags.harvest.fruit:'no catalog fruit')+'; '+n+' coconuts drawn'};},
 // the camp is the natives', and what it taps is Ranj trees
 camp(C,tapped,T){const sp=SPK('spice'),bad=tapped.filter(r=>!T.some(t=>t.sp===sp&&Math.hypot(t.x-r.x,t.z-r.z)<.5));
  return{ok:C.culture==='throne-natives'&&C.shelters.length>=3&&tapped.length>=4&&!bad.length,detail:(bad.length?bad.length+' tapped trees that are not Ranj trees; ':'')+C.shelters.length+' shelters, '+tapped.length+' Ranj trees tapped, '+C.pots+' pots'};},
 // kelp only under the water, 3-15 m down at its foot
 kelp(P){const K=P.filter(p=>/^biome:kelp\d$/.test(p[3])),bad=K.filter(p=>{const w=waterH(p[0],p[2]);return w<-1e8||w-p[1]<2.5||w-p[1]>16;});
  return{ok:K.length>=200&&!bad.length,detail:bad.length?bad.length+' kelp out of its depth':K.length+' kelp cards, all 3-15 m down'};},
 // the hyper-mangroves stand in the lagoon
 mangroves(T){const sp=SPK('mangrove'),M=T.filter(t=>t.sp===sp),bad=M.filter(t=>Math.hypot(t.x-LAGOON.x,t.z-LAGOON.z)>LAGOON.r*1.45);
  return{ok:M.length>=10&&!bad.length,detail:bad.length?bad.length+' mangroves out of the lagoon':M.length+' hyper-mangroves, all in the lagoon'};},
 // the isle's species are all placed: its own (isle:true) and the woods' and the warm ground's
 placed(C){const here=THRONE.SPECIES.filter(S=>S.isle||['spice','lehua','treefern','archpalm'].indexOf(S.key)>=0),zero=here.filter(S=>!(C[S.i]>0)).map(S=>S.key);
  return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):here.length+' species of the isle, the scarcest '+Math.min(...here.map(S=>C[S.i]))};},
 // nothing grows on the trail
 paths(T){const bad=T.filter(t=>PATHGRID.at(t.x,t.z)<-.2);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on the trail':'no tree on the trail'};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 dry(P){const bad=P.filter(p=>{if(WET_ITEMS.test(p[3]))return false;const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned (kelp and the throats are meant to be)'};},
 camerasOut(C){const bad=C.filter(c=>c.y<Math.max(terrainH(c.x,c.z),waterH(c.x,c.z))+.5);return{ok:!bad.length,detail:bad.length?'under the ground or the water: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
const resinPts=P=>P.filter(p=>p[3]==='biome:resin');
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the geysers keep their schedules, on the sinter',HCHK.geysers(GEYSERS));
 add('nothing grows in a spring or on the cone',HCHK.springs(P));
 add('the wild Ranj bears resin on the warm ground',HCHK.spice(THRONE.TREES,resinPts(P)));
 add('the coconut palm bears its catalog fruit',HCHK.coconut(THRONE.SPECIES,P));
 add('the camp is the natives\', and it taps Ranj trees',HCHK.camp(ISLE.camp,ISLE.tapped,THRONE.TREES));
 add('the kelp stands 3-15 m down',HCHK.kelp(P));
 add('the hyper-mangroves stand in the lagoon',HCHK.mangroves(THRONE.TREES));
 add('nothing grows on the trail',HCHK.paths(THRONE.TREES));
 add('every species of the isle placed',HCHK.placed(THRONE.TREES.reduce((C,t)=>{C[t.sp]=(C[t.sp]||0)+1;return C;},THRONE.SPECIES.map(()=>0))));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('nothing rooted under the water',HCHK.dry(P));
 add('preset cameras clear of ground and sea',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});const P=instPoints(),sp=SPK('spice');
 add('a geyser in the forest',HCHK.geysers(GEYSERS.concat([Object.assign({},GEYSERS[0],{x:DOME.cx+isleR(0)*.7,z:DOME.cz})])));
 add('a plant in the Prismatic Spring',HCHK.springs([[POOLS[0].x,POOLL[0],POOLS[0].z,'biome:fern']]));
 add('wild Ranj with no resin',HCHK.spice(THRONE.TREES,[]));
 add('a coconut palm with no catalog fruit',HCHK.coconut(THRONE.SPECIES.map(S=>S.key==='coconut'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),P));
 {const c=THRONE.TREES.find(t=>t.sp!==sp)||{x:0,z:0};add('a tapped tree that is not a Ranj tree',HCHK.camp(ISLE.camp,ISLE.tapped.concat([{x:c.x,z:c.z}]),THRONE.TREES));}
 add('kelp on the beach',HCHK.kelp(P.concat([[LANDING.x,terrainH(LANDING.x,LANDING.z),LANDING.z,'biome:kelp0']])));
 add('a mangrove on the crown',HCHK.mangroves(THRONE.TREES.concat([{sp:SPK('mangrove'),x:BASIN.x,z:BASIN.z}])));
 {const C=THRONE.SPECIES.map(()=>1);C[SPK('coconut')]=0;add('a species of the isle never placed',HCHK.placed(C));}
 {const p=TRAILS[0].pts[Math.floor(TRAILS[0].pts.length/2)];add('a tree on the trail',HCHK.paths([{x:p[0],z:p[1]}]));}
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 {const a=1.0,d=isleR(a)*1.2;add('a plant on the sea floor',HCHK.dry([[DOME.cx+Math.cos(a)*d,SEA-8,DOME.cz+Math.sin(a)*d,'biome:fern']]));}
 add('a camera under the sea',HCHK.camerasOut([{view:'under',x:LAGOON.x,y:SEA-1.5,z:LAGOON.z}]));
 return R;}
window._api={BUDGET,REG,hostChecks,hostNegatives,erupt,geyser:GEYSER_STATE,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,setLightMode,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),go:k=>go(k),
 biome:()=>window._biome,isle:()=>ISLE,
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),e:basinE(x,z),dn:dnOf(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}};
window._registered=REG.length;
