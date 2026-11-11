// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
// the presets are FOUND on the map rather than typed: one sweep scores every preset by the kit's own zones,
// nearer the LOD spine preferred, and a tree preset frames the nearest built hero of its species
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const ACC=sp=>RRIM.PASSES.find(p=>p.sp===sp).accept;
const SCORES={
 shore:(Z,x,z,ld)=>Z.shore*Z.gentle*(1-Z.farm)-ld/4000,
 farm:(Z,x,z,ld)=>Z.farm-ld/4000,
 montane:(Z,x,z,ld)=>Z.montane*Z.gentle-ld/4000,
 cloud:(Z,x,z,ld)=>Z.montane*Z.fog-ld/4000,
 bog:(Z,x,z,ld)=>Z.montane*Z.fog*Z.gentle*smooth(.4,.8,Z.wet)-ld/3000,
 alpine:(Z,x,z,ld)=>Z.alpine*Z.gentle-ld/4000,
 lake:(Z,x,z,ld)=>Z.lake*Z.tree-ld/3000,
 rock:(Z,x,z,ld)=>Z.rock*Z.alpine-ld/4000};
const P=(function(){const best={},bs={};for(const k in SCORES){best[k]=[0,0];bs[k]=-1e9;}
 const RR=TERR.R-400;for(let z=-RR;z<=RR;z+=50)for(let x=-RR;x<=RR+100;x+=50){const Z=RRIM.zones(x,z),ld=BIO.lodD(x,z);
  for(const k in SCORES){const s=SCORES[k](Z,x,z,ld);if(s>bs[k]){bs[k]=s;best[k]=[x,z];}}}return best;})();
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>RRIM.SPECIES.indexOf(RRIM.byKey[k]);
function nearTree(key,x,z,minH){return RRIM.nearestTree(SPI(key),x,z,minH)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
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
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&RRIM.plantOfItem(item);
 const S=o.userData.species?RRIM.byKey[o.userData.species]:(best&&best.key&&RRIM.byKey[best.key]),tg=S?S.tags:(PLT?PLT.tags:null);
 if(o.userData.species)name=S.name+'  ·  a variant ('+o.name.replace('variant:','')+')';
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=S||isItem?'flora · the rift rim · '+(RRIM.RIMS[RRIM.rim]||'')+(S&&S.lineage?' · kin of '+S.lineage:''):'terrain / water';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:19500000,calls:700},   // scene triangles DRAWN at the camera (variants: the level by the camera); calls: one per variant pool part on this 6.8 km map (KNOWN_ISSUES), not a target
 cls:{pass:16000000,host:900000},
 type:{'riftrim/trees':'pass','riftrim/floor':'pass','riftrim/nursery':'pass','riftrim/kin':'pass','host':'host'},
};
// the instanced items only (what the kit roots): a mesh's bounding-box centre is not a plant. The kit's hanging
// things (weeper strands, stilt-pod tendrils) and the floor's flat mats are origins too, all at or above the ground.
// species that yield something edible the kit does not draw as a catalog fruit (sap, tips, nectar...): named, not hidden
const FRUIT_NOT_DRAWN=[];   /* every edible species names its catalog piece (the bell fir's seed: gathered from the closed bells, ?season=winter) */
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const HCHK={
 // every species of the table is placed somewhere on the stage (an asset modelled and never placed is invisible: SKILL.md 1b)
 placed(C){const zero=RRIM.SPECIES.filter((S,i)=>!(C[i]>0)).map(S=>S.key);
  return{ok:C.length===RRIM.SPECIES.length&&!zero.length,detail:zero.length?'never placed: '+zero.join(', '):C.length+' species, the scarcest '+Math.min(...C)};},
 // a station's own species (LAND.species): each placed somewhere on its page
 placedIn(keys,C){const zero=keys.filter(k=>!(C[SPI(k)]>0));return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):keys.length+' species of this band, the scarcest '+Math.min(...keys.map(k=>C[SPI(k)]))};},
 // every species carries its tags, the Koppen classes among them, inside the region's classes and outside the barren ones
 tagged(SP){const reg=Object.keys(RRIM.KOPPEN),bad=[];
  for(const S of SP){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||!k.length||k.some(c=>reg.indexOf(c)<0||RRIM.BARREN.indexOf(c)>=0))bad.push(S.key);}
  return{ok:!bad.length,detail:bad.length?'untagged or tagged outside the region: '+bad.join(', '):SP.length+' species tagged (climate, aridity, abyssal, riparian, Koppen)'};},
 // nothing roots under the water: no instance's origin more than a metre under the local surface (sedge stands in 0.35 m); the shallows' own plants excepted
 dry(P){const bad=P.filter(p=>{if(/biome:(cane|canejoint|dome)$/.test(p[3]))return false;const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});   /* the N lakes' glass canes and algal domes grow in the water (60); everything else stands out of it */
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 // nothing grows on the barren crest (the ice cap, the airless rim)
 barren(P){const bad=P.filter(p=>FIELD.barren(p[0],p[2])>.95&&!(LAND.lamps&&p[3]==='biome:glow'));   /* the crossing's signal lamps stand on the portal's apron: an artefact, not a plant */
  return{ok:!bad.length,detail:bad.length?bad.length+' on barren ground (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none on the ice or the bare crest'};},
 // no tree on a layered cliff face: steep (the host's slope) and bedded rock showing (its strata weight)
 cliffs(T){const bad=T.filter(t=>FIELD.slope(t.x,t.z)>.97&&FIELD.strata(t.x,t.z)>.5);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on cliff faces (first '+RRIM.SPECIES[bad[0].sp].key+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' trees, none on a layered face'};},
 // fruit: every fruiting species and plant names a catalog piece, and fruit is drawn on the stage
 fruit(SP,PL,P){const miss=SP.filter(S=>S.tags.harvest&&S.tags.harvest.edible.length&&!S.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(S.key)<0).map(S=>S.key);
  const n=P.filter(p=>/fruit|grapes/.test(p[3])).length,untagged=SP.filter(S=>!S.tags.harvest).map(S=>S.key).concat(Object.keys(PL).filter(k=>!PL[k].tags.harvest));
  return{ok:!miss.length&&!untagged.length&&n>=(LAND.fruitMin==null?200:LAND.fruitMin),detail:(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+n+' fruit and grape instances drawn; catalog keys: '+RRIM.FRUIT_KEYS.length};},
 // trees as variants: every placed species has K prototypes at each level, and the drawn trees are instances of them
 variants(V,T){if(!window._variants)return{ok:true,detail:'unique trees (?unique=1)'};if(!T.length&&V.protos.size===0&&!(LAND.species||[]).length)return{ok:true,detail:'no tree of this kit grows on this page (LAND.species is empty)'};const P=V.protos,sps=new Set(T.map(r=>r.sp)),miss=[];
  for(const sp of sps)for(const lv of [2,1,0])for(let v=0;v<V.K;v++)if(!P.has(sp+'|n|'+v+'|'+lv)&&!P.has(sp+'|s|'+v+'|'+lv))miss.push(RRIM.SPECIES[sp].key+' v'+v+' lv'+lv);
  return{ok:!miss.length&&V.stats.drawn>0&&P.size<=RRIM.SPECIES.length*2*3*V.K,detail:(miss.length?'missing: '+miss.slice(0,6).join(', ')+'; ':'')+P.size+' prototypes for '+T.length+' trees; '+V.stats.drawn+' drawn here (hero '+V.stats.levels[2]+', mid '+V.stats.levels[1]+', far '+V.stats.levels[0]+'), '+V.stats.tris+' triangles, grown in '+V.stats.growMs+' ms'};},
 // the prototypes keep every triangle of the items they harvested (an indexed item copied vertex by vertex lost them: the stilt pod's head, 2026-11-03).
 // The attach audit cannot see this: it samples BIO's baked items, and the variant trees are drawn by 86's own pools
 harvest(V){const a=Math.round(V.stats.itemTris),b=Math.round(V.stats.harvestTris);if(a===0&&b===0&&!(LAND.species||[]).length)return{ok:true,detail:'no tree of this kit grows on this page'};return{ok:a>0&&a===b,detail:b+' of '+a+' item triangles kept in the prototypes'};},
 // nothing roots on a KSTACKS body (a dome, a tor) or at its foot: BIO.init's mask (45)
 offRock(P){const bad=P.filter(p=>{const f=KSTACKS.foot(ROCK,p[0],p[2]);return f&&f.d<.5&&!/^biome:impTrees|^variant:impTrees/.test(p[3]);});
  return{ok:!bad.length,detail:bad.length?bad.length+' on a rock body (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':ROCK.length+' bodies, none under a plant'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
// the flora and the ground's wet band read the water's own shore (the review's third line): the env fields in the contract, no tree standing in the water,
// and the wet band wet at the water's edge (WATER.edgeAudit). EDGE_OWED: what this turn leaves (a ratchet)
function edgeCheck(){const P=[];for(const T of RRIM.TREES){if(T.sp==null)continue;P.push({x:T.x,z:T.z,r:Math.min(T.rb==null?.4:T.rb,.6),name:RRIM.SPECIES[T.sp].key});if(P.length>6000)break;}
 const bad=BIO.envCheck(ENV,[[0,0],[-1400,-200],[800,300],[-2400,0]]),F=WATER.edgeAudit({field:WATER_F,plants:P,wet:(x,z)=>Math.max(WET_SHORE(x,z),FIELD.geo(x,z)),band:4,clear:0}),N={};F.forEach(f=>{N[f.rule]=(N[f.rule]||0)+1;});
 return{ok:!bad.length&&(N['plant-in-water']||0)<=EDGE_OWED.plant&&(N['wet-short']||0)<=EDGE_OWED.wet,detail:(bad.length?'env: '+JSON.stringify(bad).slice(0,200)+'; ':'')+P.length+' trees, '+JSON.stringify(N)+' (owed '+JSON.stringify(EDGE_OWED)+')'};}
const EDGE_OWED=LAND.edgeOwed||{plant:0,wet:0};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 /* a station holds its band's species, not all seventeen (LAND.species): the others are none there by the climate, not by a fault */
 add(LAND.species?'every species of this band placed':'every species placed',LAND.species?HCHK.placedIn(LAND.species,RRIM.COUNTS||[]):HCHK.placed(RRIM.COUNTS||[]));
 add('every species tagged with its Koppen classes',HCHK.tagged(RRIM.SPECIES));
 add('nothing rooted under the water',HCHK.dry(P));
 add('nothing grows on barren ground',HCHK.barren(P));
 if(typeof VARIANTS!=='undefined')add('trees drawn as shared variants',HCHK.variants(VARIANTS,RRIM.TREES));
 if(window._variants)add('the variants keep every triangle of their items',HCHK.harvest(VARIANTS));
 add('fruit tagged, catalogued and drawn',HCHK.fruit(RRIM.SPECIES,RRIM.PLANTS,P));
 add('no tree on a layered cliff face',HCHK.cliffs(RRIM.TREES));
 if(ROCK.length)add('nothing rooted on a rock body (a dome, a tor)',HCHK.offRock(P));
 add('the flora and the wet band read the shore of the water (BIO.envCheck, WATER.edgeAudit)',edgeCheck());
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 const C=(RRIM.COUNTS||[]).slice();if(!LAND.species||LAND.species.length){C[SPI(LAND.species?LAND.species[0]:'frostfrill')]=0;add('a species never placed',LAND.species?HCHK.placedIn(LAND.species,C):HCHK.placed(C));}
 add('a species with no Koppen classes',HCHK.tagged(RRIM.SPECIES.map((S,i)=>i===3?Object.assign({},S,{tags:Object.assign({},S.tags,{koppen:[]})}):S)));
 add('a species tagged with the ice cap',HCHK.tagged([Object.assign({},RRIM.SPECIES[0],{tags:Object.assign({},RRIM.SPECIES[0].tags,{koppen:['EF']})})]));
 // the steepest bedded face of a wall, a point on the river's bed, the iciest crest point: the land's (found, not typed)
 if(LAND.probes.wall){const w=LAND.probes.wall();add('a tree on a canyon wall',HCHK.cliffs([{x:w[0],z:w[1],sp:0}]));}
 if(LAND.probes.bed){const b=LAND.probes.bed();add('a plant on the river bed',HCHK.dry([[b[0],b[1],b[2],'test']]));}
 if(LAND.probes.ice){const ic=LAND.probes.ice();add('a plant on the crest',HCHK.barren([[ic[0],terrainH(ic[0],ic[1]),ic[1],'test']]));}
 if(window._variants&&RRIM.TREES.length)add('a prototype that lost triangles',HCHK.harvest({stats:{itemTris:VARIANTS.stats.itemTris,harvestTris:VARIANTS.stats.itemTris*.2}}));
 if(window._variants&&RRIM.TREES.length)add('a species with no variants grown',HCHK.variants({K:VARIANTS.K,protos:new Map(),stats:VARIANTS.stats},RRIM.TREES));
 add('a fruiting species with no catalog fruit',HCHK.fruit(RRIM.SPECIES.map(S=>S.key==='bellfir'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),RRIM.PLANTS,P));
 if(ROCK.length){const B=ROCK[0];add('a plant on a rock body',HCHK.offRock([[B.x,B.top,B.z,'test']]));}
 {const g=LAND.probes.bed?LAND.probes.bed():[0,terrainH(0,0),0];add('a camera under the ground',HCHK.camerasOut([{view:'under',x:g[0],y:terrainH(g[0],g[2])-5,z:g[2]}]));}
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
// the tree variants (VARIANTS) follow the eye, after the camera is placed
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89-host-sky.js) */
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');   /* the runtime LOD (45: merge, fade, cull): each chunk mesh by its range */
/* the land in the tarn (core/water/ext/58; the owner, 2026-11-01): off at page load, for the tri counts; the panel's button or ?mirror=probe|live turns it on */
const MIRROR=BIG_DRAW&&WATER.mirrorSwitch?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[BIG_DRAW.mesh.material].concat(RIVER_DRAW?[RIVER_DRAW.mesh.material]:[]),
 level:BIG_LAKE.level,center:[BIG_LAKE.cx,BIG_LAKE.cz],radius:Math.max(800,BIG_LAKE.r*1.2),far:3500,tree:o=>o.name==='variant:impTrees',hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;
/* the sun's shadows (89z: KSHADOW, off at load): core's own button on the panel turns them on; each view moves the box. The lantern lobelias' glow follows the night */
KHOST.on(function shadowTick(){if(window._shadow)window._shadow.update();RRIM.night(1-smooth(.04,.35,sun.intensity));},'view');
KHOST.take({build:LAND.build_id||'riftrim',title:LAND.title||'Krator biome — the rift rim',
 hint:LAND.hint||'The rift rim',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,   /* the shared sky's pass, then the world (89-host-sky.js) */
 controls:[AIR_CONTROL].filter(Boolean),   /* the air (89a-host-atmos.js); the sun's shadows are core/shadow's own button (89z) */
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 // with variants the triangles drawn are the baked floor and dressing plus the instanced trees at this camera (the
 // nursery's grown prototypes are geometry, not what is drawn)
 get totals(){const t=BIO.totals(),nu=BIO.stats['riftrim/nursery'],v=window._variants&&typeof VARIANTS!=='undefined'?VARIANTS.stats:null;
  return {tris:t.tris-(nu?nu.tris:0)+(v?v.tris:0),inst:t.inst-(nu?nu.inst:0)+(v?v.drawn:0),meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 variants:()=>typeof VARIANTS!=='undefined'?VARIANTS.stats:null,
 biome:()=>window._biome,
 // the climate at a point, for the probe and for --eval: the fields and the kit's zones
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=RRIM.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
