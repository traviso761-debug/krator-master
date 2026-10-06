// ================================================================= HOST — probe (window._api)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:19500000,calls:120},   // measured 18.4M at q=1 on this 5.2 km map (2026-10-06), not a target
 cls:{pass:14000000,host:900000},
 type:{'shigh/trees':'pass','shigh/floor':'pass','host':'host'},
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
const HCHK={
 // every species of the table is placed somewhere on the stage
 placed(C){const zero=SHIGH.SPECIES.filter((S,i)=>!(C[i]>0)).map(S=>S.key);
  return{ok:C.length===SHIGH.SPECIES.length&&!zero.length,detail:zero.length?'never placed: '+zero.join(', '):C.length+' species, the scarcest '+Math.min(...C)};},
 // EVERYTHING SPIRALS: every species and every floor plant carries its tags and one of the four kinds of spiral, the
 // Koppen classes inside the region's
 tagged(SP,PL){const reg=Object.keys(SHIGH.KOPPEN),bad=[];
  for(const S of SP.concat(PL)){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||SHIGH.SPIRALS.indexOf(t.spiral)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged, without a spiral, or tagged outside the region: '+bad.join(', '):SP.length+' species and '+PL.length+' floor plants tagged, each with its spiral'};},
 // ONE HAND: every tree right-handed but the mirror-handed few, and at least one of those (the showcase plants one)
 hands(T){const mir=T.filter(t=>t.hand<0).length,bad=T.filter(t=>t.hand!==1&&t.hand!==-1).length,share=T.length?mir/T.length:0;
  return{ok:!bad&&mir>=1&&share<.02,detail:(bad?bad+' trees with no hand; ':'')+mir+' mirror-handed of '+T.length+' ('+(share*100).toFixed(2)+'%)'};},
 // the cloud forest stands in the cloud: most cloud-forest trees where the fog field is high, the paramo's rosette trees
 // above it
 cloud(T){const cf=['coilbark','trumpet','volute','crozier'].map(SPI),pr=['groundsel','frill'].map(SPI);
  const a=T.filter(t=>cf.indexOf(t.sp)>=0),b=T.filter(t=>pr.indexOf(t.sp)>=0),fa=a.filter(t=>t.fog>.3).length/Math.max(1,a.length),fb=b.filter(t=>t.fog<.6).length/Math.max(1,b.length);
  return{ok:a.length>0&&b.length>0&&fa>.85&&fb>.85,detail:'cloud-forest trees in cloud '+(fa*100).toFixed(1)+'%, paramo trees above it '+(fb*100).toFixed(1)+'%'};},
 // nothing roots under the water: no instance's origin more than a metre under the local surface (rush stands in 0.4 m)
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 // nothing grows under the cloud deck's floor: no tree below the deck by more than its lower layer (the jungle is not drawn)
 deck(T){const bad=T.filter(t=>t.y0<CLOUD_Y-60);return{ok:!bad.length,detail:bad.length?bad.length+' trees under the deck (first '+SHIGH.SPECIES[bad[0].sp].key+' at '+[bad[0].x|0,bad[0].y0|0,bad[0].z|0]+')':T.length+' trees, none lost under the cloud'};},
 // no tree on a sheer rock face (the tors' steepest granite)
 cliffs(T){const bad=T.filter(t=>FIELD.slope(t.x,t.z)>.97&&FIELD.rock(t.x,t.z)>.6);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on sheer rock (first '+SHIGH.SPECIES[bad[0].sp].key+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' trees, none on a sheer face'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('every species placed',HCHK.placed(SHIGH.COUNTS||[]));
 add('every plant tagged with its spiral',HCHK.tagged(SHIGH.SPECIES,Object.values(SHIGH.PLANTS)));
 add('one hand: every spiral right-handed but the rare mirror',HCHK.hands(SHIGH.TREES));
 add('the cloud forest in the cloud, the paramo above it',HCHK.cloud(SHIGH.TREES));
 add('nothing rooted under the water',HCHK.dry(P));
 add('no tree under the cloud deck',HCHK.deck(SHIGH.TREES));
 add('no tree on a sheer rock face',HCHK.cliffs(SHIGH.TREES));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 const C=(SHIGH.COUNTS||[]).slice();C[SPI('aloe')]=0;add('a species never placed',HCHK.placed(C));
 add('a species with no spiral',HCHK.tagged(SHIGH.SPECIES.map((S,i)=>i===2?Object.assign({},S,{tags:Object.assign({},S.tags,{spiral:null})}):S),[]));
 add('a floor plant with a made-up spiral',HCHK.tagged([],[Object.assign({},SHIGH.PLANTS.moss,{tags:Object.assign({},SHIGH.PLANTS.moss.tags,{spiral:'zigzag'})})]));
 add('a species tagged outside the region',HCHK.tagged([Object.assign({},SHIGH.SPECIES[0],{tags:Object.assign({},SHIGH.SPECIES[0].tags,{koppen:['Af']})})],[]));
 add('no mirror-handed tree',HCHK.hands(SHIGH.TREES.map(t=>Object.assign({},t,{hand:1}))));
 add('half the trees mirror-handed',HCHK.hands(SHIGH.TREES.map((t,i)=>Object.assign({},t,{hand:i%2?-1:1}))));
 add('the cloud forest out of the cloud',HCHK.cloud(SHIGH.TREES.map(t=>Object.assign({},t,{fog:0}))));
 add('a plant on the tarn bed',HCHK.dry([[TARN.x,TARNL-2.5,TARN.z,'test']]));
 add('a tree under the deck',HCHK.deck([{x:0,y0:CLOUD_Y-200,z:-2500,sp:0}]));
 // the steepest granite on the Whorl Stone (found, not typed)
 {let bx=TOR[0].x,bz=TOR[0].z,bs=-1;for(let z=TOR[0].z-200;z<=TOR[0].z+200;z+=4)for(let x=TOR[0].x-200;x<=TOR[0].x+200;x+=4){const s=FIELD.slope(x,z)*FIELD.rock(x,z);if(s>bs){bs=s;bx=x;bz=z;}}
  add('a tree on the tor\'s sheer face',HCHK.cliffs([{x:bx,z:bz,sp:0}]));}
 add('a camera under the tarn',HCHK.camerasOut([{view:'under',x:TARN.x,y:TARNL-5,z:TARN.z}]));
 return R;}
window._api={BUDGET,REG,hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),
 biome:()=>window._biome,
 // the climate at a point, for the probe and for --eval: the fields and the kit's zones
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=SHIGH.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}};
window._registered=REG.length;
