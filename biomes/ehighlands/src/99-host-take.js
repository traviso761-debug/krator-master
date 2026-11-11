// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
// the preset views and the negatives' points are the station's: 96-host-views.js (VIEWS, NEG, and the helpers gh, SPI, nearTree...)
// ---------------------------------------------------------------- the inspector's words
const BEAR=v=>{const a=(Math.atan2(v[0],-v[1])*180/Math.PI+360)%360;return Math.round(a)+'°';};
// points (the snow, the steam) are not things: the first hit that is not one
function describe(h0,hits){hits=hits.filter(h=>!h.object.isPoints);if(!hits.length)return '(nothing)';const p=hits[0].point,o=hits[0].object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // the classification and the tags (README.md, DEV TOOLS): a plant is flora of this kit, with its species' tags
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&EHIGH.plantOfItem(item);
 const S=best&&best.key&&EHIGH.byKey[best.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=S||isItem||(best&&best.key==='mother')?'flora · eastern highlands'+(S&&S.alien?' · alien':''):'terrain / water';
 // the plant's lean: the bearing it grows toward (the giant's is GIANT_AZ)
 let lean='';if(S){let bT=null,bd=1e9;for(const T of EHIGH.TREES){if(T.sp!==S.i)continue;const d=Math.hypot(T.x-p.x,T.z-p.z);if(d<bd){bd=d;bT=T;}}if(bT&&bT.lean)lean='\ngrows toward '+BEAR(bT.lean)+' (the giant: '+GIANT_AZ+'°)'+(bT.stage?' · '+bT.stage:'');}
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · form: '+tg.form+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  lean+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:16000000,calls:120},   // the first build's measure goes in KNOWN_ISSUES; not a target
 cls:{pass:12000000,host:900000},
 type:{'ehigh/trees':'pass','ehigh/floor':'pass','host':'host'},
};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const HCHK={
 // every species of the table is placed somewhere on the stage
 /* every species the station expects (STAGE.expect.species: the dry side's seven, the wet face's own) is placed somewhere on the stage */
 placed(C){const want=STAGE.expect.species,zero=want.filter(k=>!(C[SPI(k)]>0));
  return{ok:C.length===EHIGH.SPECIES.length&&!zero.length,detail:zero.length?'never placed: '+zero.join(', '):want.length+' species, the scarcest '+Math.min(...want.map(k=>C[SPI(k)]))};},
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
 cliffs(T,F){F=F||FIELD;const bad=T.filter(t=>F.slope(t.x,t.z)>.97&&F.rock(t.x,t.z)>.6);   /* F: the fields read (the negative's stand-in on a land with no sheer face) */
  return{ok:!bad.length,detail:bad.length?bad.length+' plants on sheer rock (first '+EHIGH.SPECIES[bad[0].sp].key+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' plants, none on a sheer face'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.3);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
/* species and plants that yield something edible the kit has no catalog fruit for: named, not hidden (biomes/FRUIT.md); none since 2026-10-20 */
const FRUIT_NOT_DRAWN=['thorn','treefern','beech'];   /* the thorn cushion's edible part is its flowers (tea), the tree fern's its croziers (a cooked green), the beech's its mast (a nut, roasted): none a fruit, no catalog piece wanted (2026-11-08) */
/* fruit: every edible species and plant names a catalog piece (the pieces are catalogued, not drawn on the stage) */
HCHK.fruit=(SP,PL)=>{const id=x=>x.key||x.name,miss=SP.concat(PL).filter(x=>x.tags.harvest&&x.tags.harvest.edible.length&&!x.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(id(x))<0).map(id),untagged=SP.concat(PL).filter(x=>!x.tags.harvest).map(id);
 return{ok:!miss.length&&!untagged.length,detail:(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+'catalog keys: '+EHIGH.FRUIT_KEYS.join(', ')};};
const T5=()=>EHIGH.TREES.filter(t=>t.sp===SPI('glasstower'));
// the flora and the wet band read the water's own shore (the final rebuild; nsemiarid's and oidong's lines): the env fields in the contract, no plant
// standing in the water, and the wet band wet at the water's edge (WATER.edgeAudit on 89z's fields). EDGE_OWED: what this turn leaves (a ratchet)
const EDGE_OWED={plant:0,wet:0};
function edgeCheck(){if(typeof WATER_F==='undefined'||!WATER_F)return{ok:true,detail:'no water fields on this page'};const P=[];
 for(const T of EHIGH.TREES){P.push({x:T.x,z:T.z,r:Math.min(T.rb==null?.4:T.rb,.6),name:EHIGH.SPECIES[T.sp].key});if(P.length>8000)break;}
 const bad=ENV&&BIO.envCheck?BIO.envCheck(ENV,NEG.env):[],F=WATER.edgeAudit({field:WATER_F,plants:P,wet:WET_SHORE,band:4,clear:0}),N={};F.forEach(f=>{N[f.rule]=(N[f.rule]||0)+1;});
 return{ok:!bad.length&&(N['plant-in-water']||0)<=EDGE_OWED.plant&&(N['wet-short']||0)<=EDGE_OWED.wet,detail:(bad.length?'env: '+JSON.stringify(bad).slice(0,200)+'; ':'')+P.length+' plants, '+JSON.stringify(N)+' (owed '+JSON.stringify(EDGE_OWED)+')'};}
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints(),b=window._biome||{};
 add('the flora and the wet band read the shore of the water (BIO.envCheck, WATER.edgeAudit)',edgeCheck());
 add('every species placed',HCHK.placed(EHIGH.COUNTS||[]));
 add('every species tagged',HCHK.tagged(EHIGH.SPECIES));
 add('fruit tagged and catalogued',HCHK.fruit(EHIGH.SPECIES,Object.values(EHIGH.PLANTS)));
 add('every plant grows toward the giant',HCHK.lean(EHIGH.TREES,EHIGH.GIANT));
 if(STAGE.expect.vigil)add('the vigil spikes in every stage',HCHK.vigil(EHIGH.TREES.filter(t=>t.sp===SPI('vigil')&&t.lv>0)));
 if(STAGE.expect.chemistry)add('the glass towers\' chemistry drawn',HCHK.chemistry(EHIGH.WICKS||[],EHIGH.COMBS||[],T5()));
 if(STAGE.expect.mother)add('the Mother Cushion drawn',HCHK.mother((b.tris&&b.tris.mother)||0));
 (STAGE.checks||[]).forEach(f=>{const r=f();add(r.name,r);});   /* a station's own (its 46 or 96) */
 add('nothing rooted under the water',HCHK.dry(P));
 add('no plant on a sheer rock face',HCHK.cliffs(EHIGH.TREES));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 const C=(EHIGH.COUNTS||[]).slice();C[SPI(STAGE.expect.species[STAGE.expect.species.length-1])]=0;add('a species never placed',HCHK.placed(C));
 add('a species with no form',HCHK.tagged(EHIGH.SPECIES.map((S,i)=>i===2?Object.assign({},S,{tags:Object.assign({},S.tags,{form:null})}):S)));
 add('a species tagged outside the region',HCHK.tagged([Object.assign({},EHIGH.SPECIES[0],{tags:Object.assign({},EHIGH.SPECIES[0].tags,{koppen:['Af']})})]));
 add('a spike turned away from the giant',HCHK.lean([Object.assign({},EHIGH.TREES[0],{lean:[-EHIGH.GIANT[0],-EHIGH.GIANT[1]]})],EHIGH.GIANT));
 if(STAGE.expect.vigil)add('a plateau where no stand flowers',HCHK.vigil(EHIGH.TREES.filter(t=>t.sp===SPI('vigil')&&t.lv>0&&t.stage!=='flower')));
 if(STAGE.expect.chemistry)add('a wormwick far from any tower',HCHK.chemistry((EHIGH.WICKS||[]).concat([[TERR.R*3,TERR.R*3]]),EHIGH.COMBS||[],T5()));
 if(STAGE.expect.mother)add('no Mother',HCHK.mother(0));
 (STAGE.negatives||[]).forEach(f=>{const r=f();add(r.name,r);});   /* a station's own */
 add('a fruiting species with no catalog fruit',HCHK.fruit(EHIGH.SPECIES.map(S=>S.key==='cereus'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),Object.values(EHIGH.PLANTS)));
 add('a plant under the water',HCHK.dry([[NEG.wet[0],NEG.wet[1],NEG.wet[2],'test']]));
 /* a land with no face past the rule (the treeline: its steepest .967, 2026-11-08) cannot feed the negative a real point: it is fed a made-up sheer face there */
 {const sheer=FIELD.slope(NEG.cliff[0],NEG.cliff[1])>.97&&FIELD.rock(NEG.cliff[0],NEG.cliff[1])>.6;
  add('a plant on a sheer rock face (the steepest found)',HCHK.cliffs([{x:NEG.cliff[0],z:NEG.cliff[1],sp:4}],sheer?null:{slope:()=>1,rock:()=>1}));}
 add('a camera under the water',HCHK.camerasOut([{view:'under',x:NEG.wet[0],y:NEG.wet[1]-5,z:NEG.wet[2]}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89-host-sky.js) */
KHOST.take({build:'ehighlands',title:STAGE.title,
 hint:STAGE.hint,
 scene,camera,renderer,ground:terrainH,clear:1.2,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,   /* the shared sky's pass, then the world (89-host-sky.js) */
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome,
 // the climate at a point, for the probe and for --eval: the fields and the kit's zones
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=EHIGH.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
