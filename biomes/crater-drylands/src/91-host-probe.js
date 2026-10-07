// ================================================================= HOST — probe (window._api)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:18500000,calls:120},   // measured 17.0M at q=1 on this 5.2 km map (KNOWN_ISSUES), not a target
 cls:{pass:14000000,host:900000},
 type:{'craterdry/trees':'pass','craterdry/floor':'pass','craterdry/fire':'host','host':'host'},
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
// species that yield something edible the kit does not draw as a catalog fruit (nectar, pith, sour leaves): named, not hidden
const FRUIT_NOT_DRAWN=['prismmallee','pillar','treealoe','pincushion','jade'];
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const HCHK={
 // every species of the table is placed somewhere on the stage
 placed(C){const zero=CRATERDRY.SPECIES.filter((S,i)=>!(C[i]>0)).map(S=>S.key);
  return{ok:C.length===CRATERDRY.SPECIES.length&&!zero.length,detail:zero.length?'never placed: '+zero.join(', '):C.length+' species, the scarcest '+Math.min(...C)};},
 // every species carries its tags (and how it meets a fire), the Koppen classes inside the region's
 tagged(SP){const reg=Object.keys(CRATERDRY.KOPPEN),FIRES=['resprouter','seeder','survivor','avoider','killed'],bad=[];
  for(const S of SP){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||FIRES.indexOf(t.fire)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key);}
  return{ok:!bad.length,detail:bad.length?'untagged or tagged outside the region: '+bad.join(', '):SP.length+' species tagged (climate, aridity, abyssal, riparian, fire, harvest, Koppen)'};},
 // THE MOSAIC: every stage of it covers a real share of the burnable map (char, bloom, regrowth, old scrub)
 mosaic(sh){const low=['char','bloom','regrow','mature'].filter(k=>!(sh[k]>=.03));
  return{ok:!low.length,detail:(low.length?'stages under 3% of the map: '+low.join(', ')+'; ':'')+Object.keys(sh).map(k=>k+' '+(sh[k]*100).toFixed(1)+'%').join(', ')};},
 // the fires kept off the refuges: no kopje summit ever burned (fire cannot carry over bare granite)
 refuges(F,K){const bad=K.filter(k=>F.ageAt(k.x,k.z)<CRATERDRY.NEVER).map(k=>k.name||(k.x+','+k.z));
  return{ok:!bad.length,detail:bad.length?'burned on a kopje top: '+bad.join('; '):K.length+' kopje summits never burned'};},
 // each burn stage draws its own life: resprouts, the frill-trees' seedlings, fire lilies in the char, the bloom's carpet
 fireLife(b){const u=(b&&b.under)||{},need={shoots:b&&b.shoots,seedlings:b&&b.seedlings,lilies:u.lilies,carpet:u.carpet,charred:u.charred},low=Object.keys(need).filter(k=>!(need[k]>=20));
  return{ok:!low.length,detail:(low.length?'too few: '+low.join(', ')+'; ':'')+Object.keys(need).map(k=>k+' '+need[k]).join(', ')};},
 // nothing roots under the water: no instance's origin more than a metre under the local surface (the reeds stand in 0.4 m)
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 // no tree on a sheer rock face (the kopjes' steepest granite)
 cliffs(T){const bad=T.filter(t=>FIELD.slope(t.x,t.z)>.97&&FIELD.rock(t.x,t.z)>.6);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on sheer rock (first '+CRATERDRY.SPECIES[bad[0].sp].key+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' trees, none on a sheer face'};},
 // fruit: every fruiting species names a catalog piece, every species and plant carries a harvest tag, and the
 // fruit is drawn (the frill-trees' fireseed, the parasol pines' cones; the yucca and Joshua flowers are drawn as blooms)
 fruit(SP,PL,P){const miss=SP.filter(S=>S.tags.harvest&&S.tags.harvest.edible.length&&!S.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(S.key)<0).map(S=>S.key);
  const seeds=P.filter(p=>/(^|:)seed$/.test(p[3])).length,cones=P.filter(p=>/pinecone$/.test(p[3])).length,untagged=SP.filter(S=>!S.tags.harvest).map(S=>S.key).concat(Object.keys(PL).filter(k=>!PL[k].tags.harvest));
  return{ok:!miss.length&&!untagged.length&&seeds>=50&&cones>=50,detail:(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+seeds+' fireseeds and '+cones+' pine cones drawn; catalog keys: '+CRATERDRY.FRUIT_KEYS.join(', ')};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('every species placed',HCHK.placed(CRATERDRY.COUNTS||[]));
 add('every species tagged, its fire response among the tags',HCHK.tagged(CRATERDRY.SPECIES));
 add('every stage of the fire mosaic present',HCHK.mosaic(FIRE.shares()));
 add('no fire on a kopje summit',HCHK.refuges(FIRE,KOP));
 add('each burn stage draws its own life',HCHK.fireLife(window._biome));
 add('nothing rooted under the water',HCHK.dry(P));
 add('no tree on a sheer rock face',HCHK.cliffs(CRATERDRY.TREES));
 add('fruit tagged, catalogued and drawn',HCHK.fruit(CRATERDRY.SPECIES,CRATERDRY.PLANTS,P));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 const C=(CRATERDRY.COUNTS||[]).slice();C[SPI('swordspire')]=0;add('a species never placed',HCHK.placed(C));
 add('a species with no fire response',HCHK.tagged(CRATERDRY.SPECIES.map((S,i)=>i===2?Object.assign({},S,{tags:Object.assign({},S.tags,{fire:null})}):S)));
 add('a species tagged outside the region',HCHK.tagged([Object.assign({},CRATERDRY.SPECIES[0],{tags:Object.assign({},CRATERDRY.SPECIES[0].tags,{koppen:['EF']})})]));
 add('a map with no bloom',HCHK.mosaic(Object.assign({},FIRE.shares(),{bloom:0})));
 add('a fire over the Scyvoi Rock',HCHK.refuges({ageAt:()=>1},[KOP[0]]));
 add('a build with no seedlings',HCHK.fireLife(Object.assign({},window._biome,{seedlings:0})));
 add('a plant on the seep bed',HCHK.dry([[SEEP.x,SEEPL-2.5,SEEP.z,'test']]));
 // the steepest granite on the Scyvoi Rock (found, not typed)
 {let bx=KOP[0].x,bz=KOP[0].z,bs=-1;for(let z=KOP[0].z-260;z<=KOP[0].z+260;z+=4)for(let x=KOP[0].x-260;x<=KOP[0].x+260;x+=4){const s=FIELD.slope(x,z)*FIELD.rock(x,z);if(s>bs){bs=s;bx=x;bz=z;}}
  add('a tree on the kopje\'s sheer face',HCHK.cliffs([{x:bx,z:bz,sp:0}]));}
 add('a fruiting species with no catalog fruit',HCHK.fruit(CRATERDRY.SPECIES.map(S=>S.key==='frill'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),CRATERDRY.PLANTS,P));
 add('no fruit drawn',HCHK.fruit(CRATERDRY.SPECIES,CRATERDRY.PLANTS,P.filter(p=>!/seed$|pinecone$/.test(p[3]))));
 add('a camera under the seep',HCHK.camerasOut([{view:'under',x:SEEP.x,y:SEEPL-5,z:SEEP.z}]));
 return R;}
window._api={BUDGET,REG,hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),
 biome:()=>window._biome,
 fire:()=>({fires:FIRE.fires.map(f=>({ago:+f.ago.toFixed(2),x:f.x|0,z:f.z|0,frac:+f.frac.toFixed(3),cells:f.cells,failed:!!f.failed})),shares:FIRE.shares()}),
 // the climate at a point, for the probe and for --eval: the fields, the burn and the kit's zones
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),age:FIRE.ageAt(x,z),front:FIRE.frontAt(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=CRATERDRY.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}};
window._registered=REG.length;
