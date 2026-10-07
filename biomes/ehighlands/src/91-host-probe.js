// ================================================================= HOST — probe (window._api)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:16000000,calls:120},   // the first build's measure goes in KNOWN_ISSUES; not a target
 cls:{pass:12000000,host:900000},
 type:{'ehigh/trees':'pass','ehigh/floor':'pass','host':'host'},
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
 placed(C){const zero=EHIGH.SPECIES.filter((S,i)=>!(C[i]>0)).map(S=>S.key);
  return{ok:C.length===EHIGH.SPECIES.length&&!zero.length,detail:zero.length?'never placed: '+zero.join(', '):C.length+' species, the scarcest '+Math.min(...C)};},
 // every species carries its tags, the Koppen classes inside the region's
 tagged(SP){const reg=Object.keys(EHIGH.KOPPEN),bad=[];
  for(const S of SP){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||!t.form||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key);}
  return{ok:!bad.length,detail:bad.length?'untagged or tagged outside the region: '+bad.join(', '):SP.length+' species tagged (climate, aridity, abyssal, riparian, form, harvest, Koppen)'};},
 // THE LEAN: every plant grows toward the giant (its recorded bearing within 40 degrees of the giant's)
 lean(T,g){const c=Math.cos(40*Math.PI/180),bad=T.filter(t=>!t.lean||t.lean[0]*g[0]+t.lean[1]*g[1]<c);
  return{ok:T.length>0&&!bad.length,detail:bad.length?bad.length+' of '+T.length+' plants turned away from the giant (first '+EHIGH.SPECIES[bad[0].sp].key+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' plants, every one toward the giant'};},
 // the vigil spikes stand in every stage: rosettes, this year's flowering stand, dead torches
 vigil(T){const n={rosette:0,young:0,flower:0,torch:0};T.forEach(t=>{if(t.stage)n[t.stage]++;});const low=Object.keys(n).filter(k=>!(n[k]>=3));
  return{ok:!low.length,detail:(low.length?'too few: '+low.join(', ')+'; ':'')+Object.keys(n).map(k=>k+' '+n[k]).join(', ')};},
 // the glass towers' chemistry is drawn: wormwick round them and combs on the cliffs, each wormwick near a tower
 chemistry(W,Cm,T5){const far=W.filter(w=>!T5.some(t=>Math.hypot(t.x-w[0],t.z-w[1])<25));
  return{ok:W.length>=20&&Cm.length>=3&&!far.length,detail:(far.length?far.length+' wormwick more than 25 m from any tower; ':'')+W.length+' wormwick, '+Cm.length+' comb clusters'};},
 // the Mother Cushion is drawn and big: its skin covers more than 100,000 m^2 (about 1,000 triangles of 2 m cells per ... )
 mother(tris){return{ok:tris>=40000,detail:tris+' triangles of cushion skin on the Mother'};},
 // nothing roots under the water: no instance's origin more than a metre under the local surface
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 // no plant on a sheer rock face (the gullies' walls, the tors' risers)
 cliffs(T){const bad=T.filter(t=>FIELD.slope(t.x,t.z)>.97&&FIELD.rock(t.x,t.z)>.6);
  return{ok:!bad.length,detail:bad.length?bad.length+' plants on sheer rock (first '+EHIGH.SPECIES[bad[0].sp].key+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' plants, none on a sheer face'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.3);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
const T5=()=>EHIGH.TREES.filter(t=>t.sp===SPI('glasstower'));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints(),b=window._biome||{};
 add('every species placed',HCHK.placed(EHIGH.COUNTS||[]));
 add('every species tagged',HCHK.tagged(EHIGH.SPECIES));
 add('every plant grows toward the giant',HCHK.lean(EHIGH.TREES,EHIGH.GIANT));
 add('the vigil spikes in every stage',HCHK.vigil(EHIGH.TREES.filter(t=>t.sp===SPI('vigil')&&t.lv>0)));
 add('the glass towers\' chemistry drawn',HCHK.chemistry(EHIGH.WICKS||[],EHIGH.COMBS||[],T5()));
 add('the Mother Cushion drawn',HCHK.mother((b.tris&&b.tris.mother)||0));
 add('nothing rooted under the water',HCHK.dry(P));
 add('no plant on a sheer rock face',HCHK.cliffs(EHIGH.TREES));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 const C=(EHIGH.COUNTS||[]).slice();C[SPI('cereus')]=0;add('a species never placed',HCHK.placed(C));
 add('a species with no form',HCHK.tagged(EHIGH.SPECIES.map((S,i)=>i===2?Object.assign({},S,{tags:Object.assign({},S.tags,{form:null})}):S)));
 add('a species tagged outside the region',HCHK.tagged([Object.assign({},EHIGH.SPECIES[0],{tags:Object.assign({},EHIGH.SPECIES[0].tags,{koppen:['Af']})})]));
 add('a spike turned away from the giant',HCHK.lean([Object.assign({},EHIGH.TREES[0],{lean:[-EHIGH.GIANT[0],-EHIGH.GIANT[1]]})],EHIGH.GIANT));
 add('a plateau where no stand flowers',HCHK.vigil(EHIGH.TREES.filter(t=>t.sp===SPI('vigil')&&t.lv>0&&t.stage!=='flower')));
 add('a wormwick far from any tower',HCHK.chemistry((EHIGH.WICKS||[]).concat([[TORS[2].x,TORS[2].z]]),EHIGH.COMBS||[],T5()));
 add('no Mother',HCHK.mother(0));
 add('a plant on the tarn bed',HCHK.dry([[TARN.x,TARNL-3,TARN.z,'test']]));
 // the steepest rock on the west gully's walls (found, not typed)
 {let bx=0,bz=0,bs=-1;const G=GULLY[0];for(let z=zF(G.x0)+100;z<=zF(G.x0)+900;z+=4)for(let x=xg(G,z)-90;x<=xg(G,z)+90;x+=4){const s=FIELD.slope(x,z)*FIELD.rock(x,z);if(s>bs){bs=s;bx=x;bz=z;}}
  add('a plant on the gully\'s sheer wall',HCHK.cliffs([{x:bx,z:bz,sp:4}]));}
 add('a camera under the tarn',HCHK.camerasOut([{view:'under',x:TARN.x,y:TARNL-8,z:TARN.z}]));
 return R;}
window._api={BUDGET,REG,hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 typeStats,regOccupancy,nanSweep,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),views:()=>Object.keys(VIEWS),
 biome:()=>window._biome,
 // the climate at a point, for the probe and for --eval: the fields and the kit's zones
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=EHIGH.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}};
window._registered=REG.length;
