// ================================================================= HOST — probe (window._api)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:19500000,calls:700},   // scene triangles DRAWN at the camera (variants: the level by the camera); calls: one per variant pool part on this 6.8 km map (KNOWN_ISSUES), not a target
 cls:{pass:16000000,host:900000},
 type:{'badlands/trees':'pass','badlands/floor':'pass','badlands/dress':'pass','badlands/nursery':'pass','host':'host'},
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
// the instanced items only (what the kit roots): a mesh's bounding-box centre is not a plant. The kit's hanging
// things (weeper strands, stilt-pod tendrils) and the floor's flat mats are origins too, all at or above the ground.
// species that yield something edible the kit does not draw as a catalog fruit (sap, tips, nectar...): named, not hidden
const FRUIT_NOT_DRAWN=['ponderosa','spruce','fir','aspen','cottonwood','maple','sunspire','needlebloom'];
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const HCHK={
 // every species of the table is placed somewhere on the stage (an asset modelled and never placed is invisible: SKILL.md 1b)
 placed(C){const zero=EBADLANDS.SPECIES.filter((S,i)=>!(C[i]>0)).map(S=>S.key);
  return{ok:C.length===EBADLANDS.SPECIES.length&&!zero.length,detail:zero.length?'never placed: '+zero.join(', '):C.length+' species, the scarcest '+Math.min(...C)};},
 // every species carries its tags, the Koppen classes among them, inside the region's classes and outside the barren ones
 tagged(SP){const reg=Object.keys(EBADLANDS.KOPPEN),bad=[];
  for(const S of SP){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||!k.length||k.some(c=>reg.indexOf(c)<0||EBADLANDS.BARREN.indexOf(c)>=0))bad.push(S.key);}
  return{ok:!bad.length,detail:bad.length?'untagged or tagged outside the region: '+bad.join(', '):SP.length+' species tagged (climate, aridity, abyssal, riparian, Koppen)'};},
 // nothing roots under the water: no instance's origin more than a metre under the local surface (the reeds stand in 0.4 m)
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 // nothing grows on the barren crest (the ice cap, the airless rim)
 barren(P){const bad=P.filter(p=>FIELD.barren(p[0],p[2])>.95);
  return{ok:!bad.length,detail:bad.length?bad.length+' on barren ground (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none on the ice or the bare crest'};},
 // no tree on a layered cliff face: steep (the host's slope) and bedded rock showing (its strata weight)
 cliffs(T){const bad=T.filter(t=>FIELD.slope(t.x,t.z)>.97&&FIELD.strata(t.x,t.z)>.5);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on cliff faces (first '+EBADLANDS.SPECIES[bad[0].sp].key+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' trees, none on a layered face'};},
 // the hanging garden: the dressing hung curtains, vines and drapes off the arcade, and its instances sit on the structure
 hanging(D,P){const near=P.filter(p=>Math.hypot(p[0]-ARCADE.cx,p[2]-ARCADE.cz)<ARCADE.len*.75&&p[1]>ARCADE.y0+1&&/maiden|vine|weep|grapes/.test(p[3])).length;
  const ok=!!D&&D.curtains>=20&&D.vines>=10&&near>=150;
  return{ok,detail:D?D.curtains+' fern curtains, '+D.vines+' grape vines, '+D.drapes+' weeper drapes, '+D.plants+' ledge plants; '+near+' hanging instances above the arcade floor':'no dressing ran'};},
 // fruit: every fruiting species and plant names a catalog piece, and fruit is drawn on the stage
 fruit(SP,PL,P){const miss=SP.filter(S=>S.tags.harvest&&S.tags.harvest.edible.length&&!S.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(S.key)<0).map(S=>S.key);
  const n=P.filter(p=>/fruit|grapes/.test(p[3])).length,untagged=SP.filter(S=>!S.tags.harvest).map(S=>S.key).concat(Object.keys(PL).filter(k=>!PL[k].tags.harvest));
  return{ok:!miss.length&&!untagged.length&&n>=200,detail:(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+n+' fruit and grape instances drawn; catalog keys: '+EBADLANDS.FRUIT_KEYS.length};},
 // trees as variants: every placed species has K prototypes at each level, and the drawn trees are instances of them
 variants(V,T){if(!window._variants)return{ok:true,detail:'unique trees (?unique=1)'};const P=V.protos,sps=new Set(T.map(r=>r.sp)),miss=[];
  for(const sp of sps)for(const lv of [2,1,0])for(let v=0;v<V.K;v++)if(!P.has(sp+'|n|'+v+'|'+lv)&&!P.has(sp+'|s|'+v+'|'+lv))miss.push(EBADLANDS.SPECIES[sp].key+' v'+v+' lv'+lv);
  return{ok:!miss.length&&V.stats.drawn>0&&P.size<=EBADLANDS.SPECIES.length*2*3*V.K,detail:(miss.length?'missing: '+miss.slice(0,6).join(', ')+'; ':'')+P.size+' prototypes for '+T.length+' trees; '+V.stats.drawn+' drawn here (hero '+V.stats.levels[2]+', mid '+V.stats.levels[1]+', far '+V.stats.levels[0]+'), '+V.stats.tris+' triangles, grown in '+V.stats.growMs+' ms'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('every species placed',HCHK.placed(EBADLANDS.COUNTS||[]));
 add('every species tagged with its Koppen classes',HCHK.tagged(EBADLANDS.SPECIES));
 add('nothing rooted under the water',HCHK.dry(P));
 add('nothing grows on barren ground',HCHK.barren(P));
 add('hanging foliage on the arcade',HCHK.hanging(window._dress,P));
 if(typeof VARIANTS!=='undefined')add('trees drawn as shared variants',HCHK.variants(VARIANTS,EBADLANDS.TREES));
 add('fruit tagged, catalogued and drawn',HCHK.fruit(EBADLANDS.SPECIES,EBADLANDS.PLANTS,P));
 add('no tree on a layered cliff face',HCHK.cliffs(EBADLANDS.TREES));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 const C=(EBADLANDS.COUNTS||[]).slice();C[SPI('umbel')]=0;add('a species never placed',HCHK.placed(C));
 add('a species with no Koppen classes',HCHK.tagged(EBADLANDS.SPECIES.map((S,i)=>i===3?Object.assign({},S,{tags:Object.assign({},S.tags,{koppen:[]})}):S)));
 add('a species tagged with the ice cap',HCHK.tagged([Object.assign({},EBADLANDS.SPECIES[0],{tags:Object.assign({},EBADLANDS.SPECIES[0].tags,{koppen:['EF']})})]));
 // the steepest bedded face of the canyon's north wall at x=200 (found, not typed)
 {let bz=zR(200),bs=-1;for(let z=zR(200)-260;z<zR(200);z+=2){const s=FIELD.slope(200,z)*FIELD.strata(200,z);if(s>bs){bs=s;bz=z;}}
  add('a tree on the canyon wall',HCHK.cliffs([{x:200,z:bz,sp:0}]));}
 const x=200;add('a plant on the river bed',HCHK.dry([[x,floorC(x)-2.8,zR(x),'test']]));
 // the iciest point of the crest (found, not typed: the crest's line wanders)
 let ix=3000,iz=0,ib=-1;for(let z=-3000;z<=3000;z+=100)for(let x=2400;x<=3400;x+=50){const v=FIELD.barren(x,z);if(v>ib){ib=v;ix=x;iz=z;}}
 add('a plant on the crest',HCHK.barren([[ix,terrainH(ix,iz),iz,'test']]));
 add('the dressing never ran',HCHK.hanging(null,P));
 if(window._variants)add('a species with no variants grown',HCHK.variants({K:VARIANTS.K,protos:new Map(),stats:VARIANTS.stats},EBADLANDS.TREES));
 add('a fruiting species with no catalog fruit',HCHK.fruit(EBADLANDS.SPECIES.map(S=>S.key==='pinyon'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),EBADLANDS.PLANTS,P));
 add('a camera under the canyon floor',HCHK.camerasOut([{view:'under',x:x,y:floorC(x)-5,z:zR(x)}]));
 return R;}
window._api={BUDGET,REG,hostChecks,hostNegatives,
 // with variants the triangles drawn are the baked floor and dressing plus the instanced trees at this camera (the
 // nursery's grown prototypes are geometry, not what is drawn)
 get totals(){const t=BIO.totals(),nu=BIO.stats['badlands/nursery'],v=window._variants&&typeof VARIANTS!=='undefined'?VARIANTS.stats:null;
  return {tris:t.tris-(nu?nu.tris:0)+(v?v.tris:0),inst:t.inst-(nu?nu.inst:0)+(v?v.drawn:0),meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 variants:()=>typeof VARIANTS!=='undefined'?VARIANTS.stats:null,
 typeStats,regOccupancy,nanSweep,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),
 biome:()=>window._biome,
 // the climate at a point, for the probe and for --eval: the fields and the kit's zones
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=EBADLANDS.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}};
window._registered=REG.length;
