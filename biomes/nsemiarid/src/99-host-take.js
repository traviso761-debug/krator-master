// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says
// what this page has (the kit's checks and inspector are 98-host-checks.js). The presets are FOUND on the map rather than typed: one sweep scores every preset by the kit's own
// zones, nearer the LOD spine preferred, and a tree preset frames the nearest record of its species.
const SCORES={
 desert:(Z,x,z,ld)=>Z.desert*(1-Z.pan)-ld/3000,
 pan:(Z,x,z,ld)=>Z.pan*smooth(.4,.7,FIELD.salt(x,z))-ld/3000,
 steppe:(Z,x,z,ld)=>Z.steppe-ld/3000,
 med:(Z,x,z,ld)=>Z.med-ld/3000,
 forest:(Z,x,z,ld)=>Z.forest-ld/3000,
 tugai:(Z,x,z,ld)=>Z.tugai*(1-Z.pan)-ld/3000,
 strand:(Z,x,z,ld)=>FIELD.strand(x,z)*FIELD.bed(x,z)*(1-Z.pan)-ld/4000,
 ring:(Z,x,z,ld)=>FIELD.ring(x,z)-ld/4000};
const PLACE=(function(){const best={},bs={};for(const k in SCORES){best[k]=[0,0];bs[k]=-1e9;}
 for(let z=-3200;z<=3200;z+=50)for(let x=-3200;x<=3200;x+=50){const Z=NSEMIARID.zones(x,z),ld=BIO.lodD(x,z);
  for(const k in SCORES){const s=SCORES[k](Z,x,z,ld);if(s>bs[k]){bs[k]=s;best[k]=[x,z];}}}return best;})();
const VIEWS={
 'From afar':look(-3300,3300,600,-300,-900,150),
 'The old lake bed and its strandlines':look(BED.x+1500,BED.z+1500,90,BED.x,BED.z,0),
 'The bathtub ring':look(PLACE.ring[0]-120*W0[0],PLACE.ring[1]-120*W0[1],10,PLACE.ring[0]+60,PLACE.ring[1]+40,0),
 'The salt pan':look(PLACE.pan[0]-80,PLACE.pan[1]+70,4,PLACE.pan[0]+60,PLACE.pan[1]-60,0),
 'Crescent saxaul groves':atTree(nearTree('saxaul',PLACE.desert[0],PLACE.desert[1]),45,UPW+.5,8),
 'Crawlers on the desert':look(PLACE.desert[0]-30,PLACE.desert[1]+30,3,PLACE.desert[0]+20,PLACE.desert[1]-20,0),
 'Golden poplar at the lake margin':atTree(nearTree('poplar',PLACE.tugai[0],PLACE.tugai[1],0,T=>!T.dead),40,1.2,4),
 'Dead poplars on the salt':atTree(nearTree('poplar',BED.x,BED.z,0,T=>!!T.dead),28,2.2,3),
 'The walking steppe':look(PLACE.steppe[0]-60,PLACE.steppe[1]+40,5,PLACE.steppe[0]+40,PLACE.steppe[1]-30,1),
 'Dandelion frills':atTree(nearTree('frill',PLACE.steppe[0],PLACE.steppe[1]),38,UPW,6),
 'Helicopter trumpets':atTree(nearTree('trumpet',PLACE.steppe[0],PLACE.steppe[1]),26,UPW+.4,4),
 'Pistachio parkland':atTree(nearTree('pistachio',PLACE.steppe[0],PLACE.steppe[1]),30,2.6,3),
 'Giant dandelions and foxtails':atTree(nearTree('dandelion',PLACE.steppe[0],PLACE.steppe[1]),10,UPW+.3,1.6),
 'Judas trees and almonds':atTree(nearTree('judas',PLACE.med[0],PLACE.med[1]),20,1.8,2.5),
 'The spring pool and its plane':[POOL.x-70,Math.max(POOL.lv+14,gh(POOL.x-70,POOL.z+60,6)),POOL.z+60,POOL.x,POOL.lv+8,POOL.z],
 'Drift lanterns':atTree(nearTree('lantern',PLACE.med[0],PLACE.med[1]),14,.6,2),
 'The feral fruit forest':atTree(nearTree('apple',PLACE.forest[0],PLACE.forest[1]),24,1.4,3),
 'Kite ash':atTree(nearTree('samara',PLACE.forest[0],PLACE.forest[1]),36,2.8,5),
};
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:19500000,calls:700},
 cls:{pass:16000000,host:900000},
 type:{'nsemiarid/trees':'pass','nsemiarid/floor':'pass','nsemiarid/nursery':'pass','host':'host'},
};
// where the stage's checks look: the lake the stream runs into, a ring of points round the old bed for the dust
const LAKE_SKIP=(x,z)=>LAKE_W.contains(x,z);
const DUST_PTS=Array.from({length:60},(_,k)=>{const a=k*2.39996,r=40+k*9;return[BED.x+Math.cos(a)*(BED.r*.7+r),BED.z+Math.sin(a)*(BED.r*.7+r)];});
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=inst(),T=NSEMIARID.TREES;
 add('every species placed',HCHK.placed(NSEMIARID.COUNTS||[]));
 add('every species tagged with its Koppen classes',HCHK.tagged(NSEMIARID.SPECIES));
 add('nothing rooted under the water',HCHK.dry(P));
 add('no tree on a bare rock face',HCHK.cliffs(T));
 if(typeof VARIANTS!=='undefined')add('trees drawn as shared variants',HCHK.variants(VARIANTS,T));
 add('fruit tagged and drawn',HCHK.fruit(NSEMIARID.SPECIES,NSEMIARID.PLANTS,P));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 add('crawlers grow downslope (their trails upslope)',HCHK.crawlers(inst(/^biome:crawler$/),inst(/crawlerDead/)));
 add('tumbler drifts on the windward faces',HCHK.drifts(inst(/tumbler/),T,NSEMIARID.windAt));
 add('step cones read the years dry',HCHK.cones(inst(/stepcone/)));
 add('saxaul on its crescents',HCHK.crescents(T.filter(t=>t.sp===SPI('saxaul'))));
 add('dead poplars on the salt',HCHK.deadPoplars(T.filter(t=>t.sp===SPI('poplar'))));
 add('the stream sits in its banks (core/water)',HCHK.banks(STREAM,SW));
 add('the stream shows: the drawn ground under its water',HCHK.shows(STREAM,0,LAKE_SKIP));
 add('the wind lifts dust off the dry ground, a calm none (core/atmos)',HCHK.dust(DUST_PTS));
 add('the trumpets turn on a pivot',HCHK.spin(VARIANTS.protos));
 add('a gale tears the winged seeds loose, a calm holds them; the lanterns the other way (core/atmos)',HCHK.gale(PLACE.steppe));
 if(window._variants)add('wind-shaped trees face the wind where they stand',HCHK.facing(windShapedDrawn()));
 add('the furlers shut with the gusts (core/atmos)',HCHK.furlers(furlerMeshes(),(window._biome&&window._biome.under&&window._biome.under.furlersShut)||0));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=inst(),T=NSEMIARID.TREES;
 const C=(NSEMIARID.COUNTS||[]).slice();C[SPI('lantern')]=0;add('a species never placed',HCHK.placed(C));
 add('a species with no Koppen classes',HCHK.tagged(NSEMIARID.SPECIES.map((S,i)=>i===3?Object.assign({},S,{tags:Object.assign({},S.tags,{koppen:[]})}):S)));
 add('a species tagged outside the region',HCHK.tagged([Object.assign({},NSEMIARID.SPECIES[0],{tags:Object.assign({},NSEMIARID.SPECIES[0].tags,{koppen:['EF']})})]));
 add('a plant on the lake bed under the water',HCHK.dry([[BED.x,LAKE.level-6,BED.z,'test']]));
 if(window._variants)add('a species with no variants grown',HCHK.variants({K:VARIANTS.K,protos:new Map(),stats:VARIANTS.stats},T));
 add('a fruiting species not named',HCHK.fruit(NSEMIARID.SPECIES.map(S=>S.key==='apple'?Object.assign({},S,{key:'apple?'}):S),NSEMIARID.PLANTS,P));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 // the crawlers turned round: heads swapped with their trails
 {const H=inst(/^biome:crawler$/),D=inst(/crawlerDead/);add('crawlers growing uphill',HCHK.crawlers(D.slice(0,H.length*3),H));}
 add('drifts against the wind turned round',HCHK.drifts(inst(/tumbler/),T,(x,z)=>{const w=NSEMIARID.windAt(x,z);return[-w[0],-w[1]];}));
 {const S=inst(/stepcone/),ys=S.map(s=>s[4]).reverse();add('step cones heights shuffled',HCHK.cones(S.map((s,i)=>[s[0],s[1],s[2],s[3],ys[i]])));}
 {let off=null;for(let z=-1000;z<1000&&!off;z+=7)for(let x=-1000;x<1000;x+=7)if(NSEMIARID.crescentAt(x,z)[0]<=0){off={x,z};break;}add('a saxaul off its crescent',HCHK.crescents([off]));}
 add('a dead poplar on the steppe',HCHK.deadPoplars([{x:PLACE.steppe[0],z:PLACE.steppe[1],dead:true}]));
 add('the stream lifted 3 m over its banks',HCHK.banks(STREAM,SW,3));
 add('the stream drawn 1.2 m low, under its ground',HCHK.shows(STREAM,1.2,LAKE_SKIP));
 add('dust off ground masked bare of it',HCHK.dust(DUST_PTS,()=>0));
 add('a gale that tears nothing loose',HCHK.gale(PLACE.steppe,1e9));
 if(window._variants){const R=windShapedDrawn();add('wind-shaped trees turned at random',HCHK.facing(R.map((r,i)=>[r[0],r[1],r[2]+1+(i%5)])));}
 add('furlers placed shut, a still frame',HCHK.furlers(furlerMeshes(),12));
 if(window._variants){const M=new Map();for(const [k,P] of VARIANTS.protos)M.set(k,{parts:P.parts.map(q=>({geo:{attributes:{}}}))});add('trumpet crowns with no pivot',HCHK.spin(M));}
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.take({build:'nsemiarid',title:'Krator biome — the northern semiarid country',
 hint:'The walking steppe: an old lake bed with its strandlines and a remnant salt lake in the north, the hot steppe, the Mediterranean foothills and the feral fruit forest on the rainy upland in the south; everything here travels (ideal type)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},objects:()=>[sky,giant,giantRing]},
 inspect:describe,stats:()=>'inst '+window._instances+'  wind '+NSWIND.mode+' '+NSWIND.mean().toFixed(1)+' m/s',controls:[WIND_CONTROL],
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'seed weather':{objects:()=>(SEEDS?[SEEDS.points]:[]).concat(FLIGHT?FLIGHT.meshes:[])},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals(),nu=BIO.stats['nsemiarid/nursery'],v=window._variants&&typeof VARIANTS!=='undefined'?VARIANTS.stats:null;
  return {tris:t.tris-(nu?nu.tris:0)+(v?v.tris:0),inst:t.inst-(nu?nu.inst:0)+(v?v.drawn:0),meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 variants:()=>typeof VARIANTS!=='undefined'?VARIANTS.stats:null,
 biome:()=>window._biome,
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=NSEMIARID.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
