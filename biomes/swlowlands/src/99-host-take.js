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
const VIEWS=ST&&ST.views?ST.views():{
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
 'A clear spring':SPRINGS.length?(()=>{const S=SPRINGS[1],a=S.side>0?2.2:-.9;return[S.x+Math.cos(a)*44,S.y0+7,S.z+Math.sin(a)*44,S.x,S.y0+3,S.z];})():viewAxis(0,0,30,200,0,0),
 'The ribbon roots':viewTree('ribbonroot',-1350,0,1.5,2,.15,.3),
 'The fishing bridge':()=>KIN_BRIDGES.length?(b=>{const mx=(b[0]+b[2])/2,mz=(b[1]+b[3])/2;return[mx+60,terrainH(mx+60,mz+40)+6,mz+40,mx,6,mz];})(KIN_BRIDGES[0]):viewAxis(-1300,-200,30,-1400,0,0),
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
// THE PLANTS' FEET ON THE DRAWN GROUND (2026-10-27, core/terrain KSEAT; CORE-IMPROVEMENTS.md item 1). A rooted item is one whose
// instances stand at one offset from the drawn ground (the median of y - drawnH over up to 400 of them within [-1, .3] m,
// its quartiles within .25 m: a trunk, a shrub, a tuft; not a crown or a hanging clump). Each sampled instance is a
// record whose foot is that offset under it; the probe's contact sweep (core/host/95b-host-seat.js) measures it against the
// ground mesh. opt.old puts each foot where terrainH (the closure, what the plants stood on before) put it, the
// negative: the sweep must see those float and sink. Memoised: the instances do not move after the build.
// HELD_ITEMS share a mesh between pieces on the ground and pieces something else holds (a palm's crown, a limb, a trunk's spines,
// a log's back, duckweed on the water): an instance of one more than HELD_UP over the drawn ground is not a foot. That hides a
// float above HELD_UP on these items only, so the check's line counts what it left out. The same goes for anything over HELD_UP
// inside an obstacle's footprint: the tower's ledge plants (65-biome-swlowlands-dress.js). The tower is not a seat surface: its
// stacked floors cost every foot in its box dozens of rays, and verify did not finish. NOT_FEET: a boulder's origin is its middle
const HELD_ITEMS={'biome:fan':1,'biome:frond':1,'biome:cone':1,'biome:mossmat':1},NOT_FEET={'biome:boulder':1},HELD_UP=.6;
// FEET_OWED: the feet still off the drawn ground, recorded on 2026-11-02 (KNOWN_ISSUES.md); ratchet it down, never up
const FEET_OWED=47;
let _feet=null;
function rootedFeet(old){if(!_feet){const out=[],m=new THREE.Matrix4(),items=[];let held=0;
  scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome||!M.count||NOT_FEET[M.name])return;M.updateMatrixWorld();
   const P=[],st=Math.max(1,Math.floor(M.count/400));
   for(let i=0;i<M.count;i+=st){M.getMatrixAt(i,m);m.premultiply(M.matrixWorld);const e=m.elements;P.push([e[12],e[13],e[14],e[13]-drawnH(e[12],e[14]),i]);}
   const d=P.map(p=>p[3]).sort((a,b)=>a-b),q=f=>d[Math.min(d.length-1,Math.floor(d.length*f))],med=q(.5);
   if(med<-1||med>.3||q(.75)-q(.25)>.25)return;items.push(M.name);
   /* an item's own planting scatter round its median is not a gap: the foot's tolerance is at least that */
   const tol=Math.max(.3,Math.min(.6,(q(.95)-q(.05))/2));
   P.forEach(p=>{if(p[3]-med>HELD_UP&&(HELD_ITEMS[M.name]||OBSTACLES.some(o=>Math.hypot(p[0]-o.x,p[2]-o.z)<o.r))){held++;return;}
    out.push({id:M.name+'#'+p[4],'class':'flora',at:[p[0],p[1]-med,p[2]],off:terrainH(p[0],p[2])-drawnH(p[0],p[2]),foot:{tol}});});});
  _feet={items,recs:out,held};}
 return old?_feet.recs.map(r=>Object.assign({},r,{at:[r.at[0],r.at[1]+r.off,r.at[2]]})):_feet.recs;}
function feetCheck(old){const F=rootedFeet(old),c=KSEAT.contactSweep(KHOST.seatScene(),F),off=F.map(r=>Math.abs(r.off)).sort((a,b)=>a-b),q=f=>off.length?off[Math.min(off.length-1,Math.floor(off.length*f))]:0;
 return{ok:c.n>1000&&c.fails.length<=(old?0:FEET_OWED)&&c.neg===true,detail:c.ok+' of '+c.n+' feet of '+_feet.items.length+' rooted items on the drawn ground, '+_feet.held+' held pieces left out ('+c.by.float+' floating, '+c.by.buried+' buried, '+c.by.inside+' inside; worst '+
  c.worst.gap.toFixed(2)+' m up, '+c.worst.depth.toFixed(2)+' m down; the control '+(c.neg?'floats':'DID NOT float')+'); terrainH off the drawn ground at these feet: median '+q(.5).toFixed(2)+', p99 '+q(.99).toFixed(2)+', max '+q(1).toFixed(2)+' m'};}
// THE LAND SIDE OF THE WATER (core/water ext/60, PRACTICE.md section 2; ChatGPT's third checklist line): the env's fields hold their units, the trees stand out of the water the eye sees, and the wet band reaches it
function edgeCheck(){const P=[];for(const T of SWLOW.TREES){if(T.cut||T.lv===0||T.sp===0||T.sp===1)continue;P.push({x:T.x,z:T.z,r:Math.min(T.rb,.6),name:SWLOW.SPECIES[T.sp].key});if(P.length>4000)break;}
 const bad=BIO.envCheck(ENV,[[0,0],[-1400,-200],[800,300],[-2400,0]]),F=WATER.edgeAudit({field:WATER_F,plants:P,wet:WET_SHORE,band:4,clear:0}),N={};F.forEach(f=>{N[f.rule]=(N[f.rule]||0)+1;});
 return{ok:!bad.length&&(N['plant-in-water']||0)<=EDGE_OWED.plant&&(N['wet-short']||0)<=EDGE_OWED.wet,detail:(bad.length?'env: '+JSON.stringify(bad).slice(0,200)+'; ':'')+P.length+' trees, '+JSON.stringify(N)};}
const EDGE_OWED={plant:0,wet:0};   // ratchet: none owed at this turn
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),N=_instNames();
 add('fruit tagged, catalogued and drawn',HCHK.fruit(SWLOW.SPECIES,SWLOW.PLANTS,N));
 add('the plants feet on the drawn ground (KSEAT contact sweep)',feetCheck(false));
 add('the flora and the wet band read the water\'s own shore (BIO.envCheck, WATER.edgeAudit)',edgeCheck());
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),N=_instNames();
 add('a fruiting species with no catalog fruit',HCHK.fruit(SWLOW.SPECIES.map(S=>S.key==='rattlepod'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),SWLOW.PLANTS,N));
 add('a species with no harvest tag',HCHK.fruit(SWLOW.SPECIES.map(S=>S.key==='madrone'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:undefined})}):S),SWLOW.PLANTS,N));
 add('the figs never drawn',HCHK.fruit(SWLOW.SPECIES,SWLOW.PLANTS,N.filter(n=>n[0]!=='biome:fig')));
 add('the plants feet back on terrainH (as before KSEAT): they float and sink',feetCheck(true));
 return R;}
/* the land in the sea (core/water/ext/58; the owner, 2026-11-01): off at page load, for the tri counts; the panel's button or ?mirror=probe|live turns it on */
const MIRROR=WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[SEA_DRAW.mesh.material,INLAND_DRAW.mesh.material],level:0,center:xzOf(-2500,-50),radius:700,far:4000,
 tree:o=>/^biome:impTrees/.test(o.name),hour:()=>ATMOS.clock?ATMOS.clock.hour:0});window.MIRROR=MIRROR;
// ---------------------------------------------------------------- the page, handed to the host
// the runtime LOD: which chunk meshes this camera draws (after the camera is placed, before the draw)
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89-host-sky.js) */
KHOST.take({build:'swlowlands',title:'Krator Southwestern Lowlands',
 hint:'The southwestern lowlands: mangrove shore, bayou, rainforest strip, humid subtropical plain, Mediterranean hills (ideal type)',
 scene,camera,renderer,ground:drawnH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:()=>{MIRROR.update();SKY.draw();},   /* the shared sky's pass, then the world (89-host-sky.js) */
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 seat:{records:()=>rootedFeet(false)},
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome}});
