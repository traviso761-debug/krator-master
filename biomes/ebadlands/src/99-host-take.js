// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
// the presets are FOUND on the map rather than typed: one sweep scores every preset by the kit's own zones,
// nearer the LOD spine preferred, and a tree preset frames the nearest built hero of its species
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const ACC=sp=>EBADLANDS.PASSES.find(p=>p.sp===sp).accept;
const SCORES={
 waste:(Z,x,z,ld)=>Z.waste*(1-Z.vent)-ld/3000,
 bad:(Z,x,z,ld)=>badK(x,z)*smooth(.35,.15,Z.wet)*(1-Z.can)-ld/4000,
 green:(Z,x,z,ld)=>badK(x,z)*Z.vale*2+Z.vale-ld/4000,
 steppe:(Z,x,z,ld)=>Z.steppe*(1-Z.rimZ)-ld/4000,
 vale:(Z,x,z,ld)=>Z.vale*(1-badK(x,z))-ld/4000,
 pine:(Z,x,z,ld)=>Z.pine-ld/4000,
 boreal:(Z,x,z,ld)=>Z.boreal*(1-Z.rock)-ld/4000,
 tundra:(Z,x,z,ld)=>Z.tundra*smooth(.99,.9,Z.cold)-ld/4000};
const P=(function(){const best={},bs={};for(const k in SCORES){best[k]=[0,0];bs[k]=-1e9;}
 for(let z=-3000;z<=3000;z+=50)for(let x=-3000;x<=3100;x+=50){const Z=EBADLANDS.zones(x,z),ld=BIO.lodD(x,z);
  for(const k in SCORES){const s=SCORES[k](Z,x,z,ld);if(s>bs[k]){bs[k]=s;best[k]=[x,z];}}}return best;})();
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>EBADLANDS.SPECIES.indexOf(EBADLANDS.byKey[k]);
function nearTree(key,x,z,minH){return EBADLANDS.nearestTree(SPI(key),x,z,minH)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
// a camera d metres from a tree, looking at its crown
function atTree(T,d,az,dy){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*.6,T.z];}
const CX=-200,rimN=(x,k)=>zR(x)-Wc(x,0)*(k==null?1.5:k);
const POOL0=POOLS[0];
const VIEWS={
 'Zion, the river in the canyon':look(150,zR(150)+30,3,-350,zR(-350),12),
 'From afar':look(-3300,3300,700,600,0,200),
 // from just outside the north wall's top, looking across and down to the floor on the far side
 'The canyon from the rim':[CX,gh(CX,rimN(CX,1.4),28),rimN(CX,1.4),CX-260,floorC(CX-260)+4,zR(CX-260)+Wc(CX-260,0)*.45],
 'Sulphur flats':[POOL0[0]-150,POOLL[0]+16,POOL0[1]+120,POOL0[0],POOLL[0]+1,POOL0[1]],
 'Stilt pods at the vents':atTree(nearTree('stiltpod',VENTS.x,VENTS.z),26,.8,2),
 'Ember crowns and sunspires':atTree(nearTree('embercrown',P.waste[0],P.waste[1]),38,2.4,3),
 'Needle bloom stand':atTree(nearTree('needlebloom',P.waste[0],P.waste[1]),14,1.2,2),
 'Needle bloom close-up':(function(){const T=nearTree('needlebloom',P.waste[0],P.waste[1],6);return[T.x+Math.cos(1.2)*4.5,T.y0+T.H*.85,T.z+Math.sin(1.2)*4.5,T.x,T.y0+T.H*.85,T.z];})(),
 'Painted badlands':look(P.bad[0]-260,P.bad[1]+180,40,P.bad[0]+60,P.bad[1]-60,10),
 'Green badlands':look(P.green[0]-220,P.green[1]-160,30,P.green[0]+60,P.green[1]+40,6),
 'Sagebrush and pinyon-juniper':atTree(nearTree('juniper',P.steppe[0],P.steppe[1]),22,2.0,2.5),
 'Rose weepers and giant umbels':atTree(nearTree('weeper',P.vale[0],P.vale[1]),30,1.4,2.5),
 'Cottonwoods on the floodplain':atTree(nearTree('cottonwood',-1600,zR(-1600)),45,1.8,3),
 'Ponderosa and aspen':atTree(nearTree('ponderosa',P.pine[0],P.pine[1],20),48,3.2,3),
 'Aspen grove':atTree(nearTree('aspen',P.pine[0],P.pine[1]),22,.4,2),
 'Spruce close-up':(function(){const T=nearTree('spruce',P.boreal[0],P.boreal[1],18),a=Math.atan2(-T.z,-T.x)+.4;return atTree(T,16,a,3);})(),
 'Spruce-fir forest':(function(){const T=nearTree('spruce',P.boreal[0],P.boreal[1],18),a=Math.atan2(-T.z,-T.x)+.4;return atTree(T,75,a,12);})(),
 'The tarn':[TARN.x-TARN.r*1.15,Math.max(TARNL+5,gh(TARN.x-TARN.r*1.15,TARN.z+TARN.r*.75,3)),TARN.z+TARN.r*.75,TARN.x+TARN.r*.6,TARNL+30,TARN.z-TARN.r*.5],
 'The treeline, krummholz and bristlecones':atTree(nearTree('bristlecone',P.tundra[0],P.tundra[1]),22,3.4,2),
 'The hanging garden':(function(){const A=ARCADE,p=A.W(-6,-A.dep/2-16),t=A.W(1,0);return[p[0],A.y0+4.5,p[1],t[0],A.y0+6.5,t[1]];})(),
 'Hanging garden close-up':(function(){const A=ARCADE,p=A.W(-3,-A.dep/2-5),t=A.W(2,-A.dep/2-1);return[p[0],A.y0+3.2,p[1],t[0],A.y0+5.5,t[1]];})(),
 'Fruit: pinyon, juniper, prickly pear':atTree(nearTree('pinyon',P.steppe[0],P.steppe[1]),9,2.2,1.6),
 'The ice and the airless rim':look(2450,1100,320,3300,-400,0),
};
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
 type:{'badlands/trees':'pass','badlands/floor':'pass','badlands/dress':'pass','badlands/nursery':'pass','host':'host'},
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
// ---------------------------------------------------------------- the page, handed to the host
// the tree variants (VARIANTS) follow the eye, after the camera is placed
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.take({build:'ebadlands',title:'Krator biome — the eastern badlands',
 hint:'The eastern badlands: sulphur flats and the hot waste in the north, painted badlands, a Zion canyon through the sagebrush plateau, green valleys in the south, pine, spruce-fir and tundra up to the ice of the outer rim (ideal type)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},objects:()=>[sky,giant,giantRing]},
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
