// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
// the presets are FOUND on the map rather than typed: one sweep scores every preset by the kit's own zones,
// nearer the LOD spine preferred, and a tree preset frames the nearest built hero of its species
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const ACC=sp=>EBADLANDS.PASSES.find(p=>p.sp===sp).accept;
const BADK=(x,z)=>typeof badK==='function'?badK(x,z):0;   /* the transect's badland mounds; a station without them scores none */
const SCORES={
 waste:(Z,x,z,ld)=>Z.waste*(1-Z.vent)-ld/3000,
 bad:(Z,x,z,ld)=>BADK(x,z)*smooth(.35,.15,Z.wet)*(1-Z.can)-ld/4000,
 green:(Z,x,z,ld)=>BADK(x,z)*Z.vale*2+Z.vale-ld/4000,
 steppe:(Z,x,z,ld)=>Z.steppe*(1-Z.rimZ)-ld/4000,
 vale:(Z,x,z,ld)=>Z.vale*(1-BADK(x,z))-ld/4000,
 pine:(Z,x,z,ld)=>Z.pine-ld/4000,
 boreal:(Z,x,z,ld)=>Z.boreal*(1-Z.rock)-ld/4000,
 tundra:(Z,x,z,ld)=>Z.tundra*smooth(.99,.9,Z.cold)-ld/4000};
const P=(function(){const best={},bs={};for(const k in SCORES){best[k]=[0,0];bs[k]=-1e9;}
 const RR=TERR.R-400;for(let z=-RR;z<=RR;z+=50)for(let x=-RR;x<=RR+100;x+=50){const Z=EBADLANDS.zones(x,z),ld=BIO.lodD(x,z);
  for(const k in SCORES){const s=SCORES[k](Z,x,z,ld);if(s>bs[k]){bs[k]=s;best[k]=[x,z];}}}return best;})();
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>EBADLANDS.SPECIES.indexOf(EBADLANDS.byKey[k]);
function nearTree(key,x,z,minH){return EBADLANDS.nearestTree(SPI(key),x,z,minH)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
// a camera d metres from a tree, looking at its crown
function atTree(T,d,az,dy){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*.6,T.z];}
const VIEWS=LAND.views({P,look,atTree,nearTree,gh});
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 // a plant names itself (the item's label); a bole or a structure names its registered volume
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // the classification and the tags (README.md, DEV TOOLS): a plant is flora of this kit, with its species' tags
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&EBADLANDS.plantOfItem(item);
 const S=o.userData.species?EBADLANDS.byKey[o.userData.species]:(best&&best.key&&EBADLANDS.byKey[best.key]),tg=S?S.tags:(PLT?PLT.tags:null);
 if(o.userData.species)name=S.name+'  ·  a variant ('+o.name.replace('variant:','')+')';
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=S||isItem?'flora · eastern badlands'+(S&&S.alien?' · alien':''):'terrain / water';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:19500000,calls:700},   // scene triangles DRAWN at the camera (variants: the level by the camera); calls: one per variant pool part on this 6.8 km map (KNOWN_ISSUES), not a target
 cls:{pass:16000000,host:900000},
 type:{'badlands/trees':'pass','badlands/floor':'pass','badlands/dress':'pass','badlands/nursery':'pass','badlands/sulphur':'pass','badlands/kin':'pass','host':'host'},
};
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
 // the Throne's brimstone reeds (the owner, 2026-10-06): grown, and only in a band at the sulphur pools' shores, not across the flats
 reeds(P){const T=P.filter(p=>p[3]==='biome:tassel'||/^biome:reedbrim/.test(p[3])),off=T.filter(p=>poolD(p[0],p[2])[0]>1.8||waterH(p[0],p[2])-terrainH(p[0],p[2])>.8);   /* out past a pool's bank, or standing in deep water */
  return{ok:T.length>=300&&!off.length,detail:off.length?off.length+' of '+T.length+' reed tassels off a pool shore (past the bank or in deep water; first at '+off[0].slice(0,3).map(v=>v|0)+')':T.length+' brimstone-reed stems, all at a sulphur pool shore'};},
 // nothing roots on a KSTACKS body (a dome, a tor) or at its foot: BIO.init's mask (45)
 offRock(P){const bad=P.filter(p=>{const f=KSTACKS.foot(ROCK,p[0],p[2]);return f&&f.d<.5&&!/^biome:impTrees|^variant:impTrees/.test(p[3]);});
  return{ok:!bad.length,detail:bad.length?bad.length+' on a rock body (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':ROCK.length+' bodies, none under a plant'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
// the flora and the ground's wet band read the water's own shore (the review's third line): the env fields in the contract, no tree standing in the water,
// and the wet band wet at the water's edge (WATER.edgeAudit). EDGE_OWED: what this turn leaves (a ratchet)
function edgeCheck(){const P=[];for(const T of EBADLANDS.TREES){if(T.sp==null)continue;P.push({x:T.x,z:T.z,r:Math.min(T.rb||.4,.6),name:EBADLANDS.SPECIES[T.sp].key});if(P.length>6000)break;}
 const bad=BIO.envCheck(ENV,[[0,0],[-1400,-200],[800,300],[-2400,0]]),F=WATER.edgeAudit({field:WATER_F,plants:P,wet:(x,z)=>Math.max(WET_SHORE(x,z),FIELD.geo(x,z)),band:4,clear:0}),N={};F.forEach(f=>{N[f.rule]=(N[f.rule]||0)+1;});
 return{ok:!bad.length&&(N['plant-in-water']||0)<=EDGE_OWED.plant&&(N['wet-short']||0)<=EDGE_OWED.wet,detail:(bad.length?'env: '+JSON.stringify(bad).slice(0,200)+'; ':'')+P.length+' trees, '+JSON.stringify(N)+' (owed '+JSON.stringify(EDGE_OWED)+')'};}
const EDGE_OWED=LAND.edgeOwed||{plant:0,wet:0};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('every species placed',HCHK.placed(EBADLANDS.COUNTS||[]));
 add('every species tagged with its Koppen classes',HCHK.tagged(EBADLANDS.SPECIES));
 add('nothing rooted under the water',HCHK.dry(P));
 add('nothing grows on barren ground',HCHK.barren(P));
 if(LAND.arcade)add('hanging foliage on the arcade',HCHK.hanging(window._dress,P));
 if(typeof VARIANTS!=='undefined')add('trees drawn as shared variants',HCHK.variants(VARIANTS,EBADLANDS.TREES));
 add('fruit tagged, catalogued and drawn',HCHK.fruit(EBADLANDS.SPECIES,EBADLANDS.PLANTS,P));
 add('no tree on a layered cliff face',HCHK.cliffs(EBADLANDS.TREES));
 if(POOLS.length)add('brimstone reeds at the sulphur pools only',HCHK.reeds(P));
 if(ROCK.length)add('nothing rooted on a rock body (a dome, a tor)',HCHK.offRock(P));
 add('the flora and the wet band read the shore of the water (BIO.envCheck, WATER.edgeAudit)',edgeCheck());
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 const C=(EBADLANDS.COUNTS||[]).slice();C[SPI('umbel')]=0;add('a species never placed',HCHK.placed(C));
 add('a species with no Koppen classes',HCHK.tagged(EBADLANDS.SPECIES.map((S,i)=>i===3?Object.assign({},S,{tags:Object.assign({},S.tags,{koppen:[]})}):S)));
 add('a species tagged with the ice cap',HCHK.tagged([Object.assign({},EBADLANDS.SPECIES[0],{tags:Object.assign({},EBADLANDS.SPECIES[0].tags,{koppen:['EF']})})]));
 // the steepest bedded face of a wall, a point on the river's bed, the iciest crest point: the land's (found, not typed)
 if(LAND.probes.wall){const w=LAND.probes.wall();add('a tree on a canyon wall',HCHK.cliffs([{x:w[0],z:w[1],sp:0}]));}
 if(LAND.probes.bed){const b=LAND.probes.bed();add('a plant on the river bed',HCHK.dry([[b[0],b[1],b[2],'test']]));}
 if(LAND.probes.ice){const ic=LAND.probes.ice();add('a plant on the crest',HCHK.barren([[ic[0],terrainH(ic[0],ic[1]),ic[1],'test']]));}
 if(LAND.arcade)add('the dressing never ran',HCHK.hanging(null,P));
 if(window._variants)add('a species with no variants grown',HCHK.variants({K:VARIANTS.K,protos:new Map(),stats:VARIANTS.stats},EBADLANDS.TREES));
 add('a fruiting species with no catalog fruit',HCHK.fruit(EBADLANDS.SPECIES.map(S=>S.key==='pinyon'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),EBADLANDS.PLANTS,P));
 if(POOLS.length&&VENTS)add('a brimstone reed out on the flats',HCHK.reeds(P.concat([[VENTS.x,terrainH(VENTS.x,VENTS.z),VENTS.z,'biome:tassel']])));
 if(ROCK.length){const B=ROCK[0];add('a plant on a rock body',HCHK.offRock([[B.x,B.top,B.z,'test']]));}
 {const g=LAND.probes.bed?LAND.probes.bed():[0,terrainH(0,0),0];add('a camera under the ground',HCHK.camerasOut([{view:'under',x:g[0],y:terrainH(g[0],g[2])-5,z:g[2]}]));}
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
// the tree variants (VARIANTS) follow the eye, after the camera is placed
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89-host-sky.js) */
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');   /* the runtime LOD (45: merge, fade, cull): each chunk mesh by its range */
/* the land in the tarn (core/water/ext/58; the owner, 2026-11-01): off at page load, for the tri counts; the panel's button or ?mirror=probe|live turns it on */
const MIRROR=TARN_DRAW&&WATER.mirrorSwitch?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[TARN_DRAW.mesh.material].concat(RIVER_DRAW?[RIVER_DRAW.mesh.material]:[]),
 level:TARNL,center:[TARN.x,TARN.z],radius:TARN.r*2.5,far:2500,tree:o=>o.name==='variant:impTrees',hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;
KHOST.take({build:LAND.build_id||'ebadlands',title:LAND.title||'Krator biome — the eastern badlands',
 hint:LAND.hint||'The eastern badlands: sulphur flats and the hot waste in the north, painted badlands, a Zion canyon through the sagebrush plateau, green valleys in the south, pine, spruce-fir and tundra up to the ice of the outer rim (ideal type)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,   /* the shared sky's pass, then the world (89-host-sky.js) */
 controls:AIR_CONTROL?[AIR_CONTROL]:[],   /* the air: calm or a dust storm (89a-host-atmos.js) */
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 // with variants the triangles drawn are the baked floor and dressing plus the instanced trees at this camera (the
 // nursery's grown prototypes are geometry, not what is drawn)
 get totals(){const t=BIO.totals(),nu=BIO.stats['badlands/nursery'],v=window._variants&&typeof VARIANTS!=='undefined'?VARIANTS.stats:null;
  return {tris:t.tris-(nu?nu.tris:0)+(v?v.tris:0),inst:t.inst-(nu?nu.inst:0)+(v?v.drawn:0),meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 variants:()=>typeof VARIANTS!=='undefined'?VARIANTS.stats:null,
 biome:()=>window._biome,
 // the climate at a point, for the probe and for --eval: the fields and the kit's zones
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=EBADLANDS.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
