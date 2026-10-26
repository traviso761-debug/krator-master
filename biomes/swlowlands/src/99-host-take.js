// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
// Preset views. Most are FOUND, not typed: viewTree() looks up the nearest
// near-detail tree of a species to a point on the (s,t) axis and frames it from
// the sun side, so a view still lands on its subject when the placement moves.
const SUNH=(()=>{const l=Math.hypot(-1200,-600);return[-1200/l,-600/l];})();
function viewTree(key,s,t,dist,h,look,side){const sp=SWLOW.SPECIES.findIndex(S=>S.key===key),o=xzOf(s,t);let best=null,bd=1e9;
 for(const T of SWLOW.TREES){if(T.sp!==sp||T.lv!==2)continue;const d=Math.hypot(T.x-o[0],T.z-o[1]);if(d<bd){bd=d;best=T;}}
 if(!best)return[o[0]+80,terrainH(o[0],o[1])+30,o[1]+80,o[0],terrainH(o[0],o[1]),o[1]];
 const R=Math.max(best.spread||0,best.crownR),D=dist*R,a=Math.atan2(SUNH[1],SUNH[0])+(side||0),cx=best.x+Math.cos(a)*D,cz=best.z+Math.sin(a)*D;
 return[cx,terrainH(cx,cz)+h,cz,best.x,best.y0+best.H*look,best.z];}
function viewAxis(s0,t0,h0,s1,t1,h1){const a=xzOf(s0,t0),b=xzOf(s1,t1);return[a[0],terrainH(a[0],a[1])+h0,a[1],b[0],terrainH(b[0],b[1])+h1,b[1]];}
const VIEWS={
 'The oak avenue':(()=>{const a=xzOf(-985,ROAD_T(-985)),b=xzOf(-800,ROAD_T(-800));return[a[0],terrainH(a[0],a[1])+1.7,a[1],b[0],terrainH(b[0],b[1])+9,b[1]];})(),
 'Under the vault':(()=>{const a=xzOf(-720,ROAD_T(-720)),b=xzOf(-640,ROAD_T(-640));return[a[0],terrainH(a[0],a[1])+1.7,a[1],b[0],terrainH(b[0],b[1])+15,b[1]];})(),
 'A sprawl oak':viewTree('sprawloak',-300,0,1.75,4,.3,.4),
 'The plain from above':viewAxis(-900,-500,140,-200,300,0),
 'Pillar fig':viewTree('pillarfig',-900,0,1.0,3,.4,.3),
 'Figs on the pillar fig':viewTree('pillarfig',-900,0,.32,6,.3,.3),
 'Parasol kapok':viewTree('kapok',-1500,0,1.1,4,.62,.2),
 'Mangrove shore':viewTree('mangrove',-1950,-150,2.2,4,.3,.5),
 'The bayou':viewTree('cypress',-1400,-100,2.2,3,.5,.3),
 'Cane palms and gums':viewTree('gum',-1350,0,1.4,3,.35,.5),
 'Veil willows':viewTree('willow',-200,-120,1.6,2,.35,.3),
 'Flatwoods':viewTree('pine',-400,300,5,2.5,.45,.2),
 'Crimson ghost':viewTree('crimson',300,0,2.2,6,.45,-.6),
 'The tower':[40-150,terrainH(-110,-560)+40,-470-90,40,110,-470],
 'Chaparral':viewTree('manzanita',1500,0,2.2,2.2,.3,.3),
 'Madrone and cork oak':viewTree('madrone',1300,0,1.6,3,.4,.4),
 'Skirt palms':viewTree('skirtpalm',1400,-150,3.2,2.5,.45,1.9),
 'The cork grove':(()=>{const c=CORK_GROVE.center,a=Math.atan2(SUNH[1],SUNH[0]),cx=c[0]+Math.cos(a)*105,cz=c[1]+Math.sin(a)*105;return[cx,terrainH(cx,cz)+5,cz,c[0],terrainH(c[0],c[1])+4,c[1]];})(),
 'Flame parasol':viewTree('flame',-900,0,1.5,4,.5,.3),
 'Violet jacaranda':viewTree('jacaranda',400,0,2.6,5,.55,.3),
 'Lantern magnolia':viewTree('magnolia',-400,0,2.4,6,.55,.3),
 'Sunburn tree':viewTree('sunburn',-800,0,1.6,3,.45,.3),
 'Star gum':viewTree('stargum',-300,0,1.6,3,.5,.3),
 'Bay laurel':viewTree('baylaurel',1200,0,1.7,3,.4,.3),
 'Tier cedars':viewTree('cedar',2000,0,1.4,6,.45,.3),
 'From the hills':viewAxis(2300,150,60,-1300,-200,0),
 'From afar':viewAxis(3000,-2200,380,-400,0,0),
 'Krator rising':viewAxis(-600,200,30,1200,1400,900),
};
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 // a plant names itself (the item's label); a bole or a structure names its registered volume
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // the tree's harvest tag (biomes/FRUIT.md): what it yields and the catalog piece its fruit is
 const S=best&&SWLOW.SPECIES.find(s=>s.name===best.name),hv=S?S.tags.harvest:null;
 const hl=hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'';
 return name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m'+hl;}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per biome pass come from
// BIO.stats (charged by BIO.cur inside the biome).
const BUDGET={
 // held in memory (the heroes' lite stand-ins included) / drawn at any one camera, with the runtime LOD /
 // draw calls (KNOWN_ISSUES, BUDGET). Measured Oct 2026 at the 27 presets: 11.6M held; 4.1-8.1M drawn
 // (renderer.info; BIO.lodShown counts the chunk meshes only, ~0.9M less) in 216-403 calls; 1.3M / 99 from afar.
 // Before the LOD every camera drew all 11.7M in ~63 calls. `rendered` is tracked, not asserted by verify.py.
 showcase:{tris:12000000,calls:450,rendered:9000000},
 cls:{pass:9000000,host:900000},
 type:{'lowlands/trees':'pass','lowlands/floor':'pass','lowlands/dress':'pass','host':'host'},
};
// ---------------------------------------------------------------- the host's own checks (verify.py runs them when present)
// species that yield something edible the kit does not draw as a catalog fruit (acorns, palm fruit, bay berries,
// seeds, palm heart): named, not hidden (biomes/FRUIT.md)
const FRUIT_NOT_DRAWN=['canepalm','pine'];
function _instNames(){const o=[];scene.traverse(M=>{if(M.isInstancedMesh&&M.userData.biome)o.push([M.name,M.count]);});return o;}
const HCHK={
 // fruit: every species and fruiting plant carries a harvest tag, every edible one names a catalog piece (or is listed
 // as not drawn), the kit names the four catalog keys of FRUIT.md, and the figs and pods are drawn on the stage
 fruit(SP,PL,N){const miss=SP.filter(S=>S.tags.harvest&&S.tags.harvest.edible.length&&!S.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(S.key)<0).map(S=>S.key);
  const untagged=SP.filter(S=>!S.tags.harvest).map(S=>S.key).concat(Object.keys(PL).filter(k=>!PL[k].tags.harvest));
  const cnt=re=>N.filter(n=>re.test(n[0])).reduce((a,n)=>a+n[1],0),figs=cnt(/^biome:fig$/),pods=cnt(/^biome:pod$/);
  const keys=SWLOW.FRUIT_KEYS,want=['generic_fruit_madrone','generic_fruit_rattlepod','generic_fruit_ember_tamarind','generic_fruit_pillar_fig'],lost=want.filter(k=>keys.indexOf(k)<0);
  return{ok:!miss.length&&!untagged.length&&!lost.length&&figs>=500&&pods>=500,
   detail:(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+(lost.length?'catalog keys missing: '+lost.join(', ')+'; ':'')
    +figs+' figs and '+pods+' pods drawn; '+SP.length+' species and '+Object.keys(PL).length+' plant tagged; catalog keys: '+keys.length};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),N=_instNames();
 add('fruit tagged, catalogued and drawn',HCHK.fruit(SWLOW.SPECIES,SWLOW.PLANTS,N));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),N=_instNames();
 add('a fruiting species with no catalog fruit',HCHK.fruit(SWLOW.SPECIES.map(S=>S.key==='rattlepod'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),SWLOW.PLANTS,N));
 add('a species with no harvest tag',HCHK.fruit(SWLOW.SPECIES.map(S=>S.key==='madrone'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:undefined})}):S),SWLOW.PLANTS,N));
 add('the figs never drawn',HCHK.fruit(SWLOW.SPECIES,SWLOW.PLANTS,N.filter(n=>n[0]!=='biome:fig')));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
// the runtime LOD: which chunk meshes this camera draws (after the camera is placed, before the draw)
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.take({build:'swlowlands',title:'Krator Southwestern Lowlands',
 hint:'The southwestern lowlands: mangrove shore, bayou, rainforest strip, humid subtropical plain, Mediterranean hills (ideal type)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);if(typeof wallSky!=='undefined')wallSky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}},
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[sky,giant,giantRing,typeof wallSky!=='undefined'?wallSky:null]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome}});
