// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 // a plant names itself (the item's label); a bole or a structure names its registered volume
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // the harvest tag (biomes/FRUIT.md): a small plant's by its item, else the species of the tree it is under
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&XANADU.plantOfItem?XANADU.plantOfItem(item):null;
 const S=best&&XANADU.SPECIES?XANADU.SPECIES.find(s=>s.name===best.name):null,hv=PLT?PLT.tags.harvest:(S&&S.tags.harvest);
 if(PLT)name=PLT.name+'  ·  '+name;
 return name+(hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per biome pass come from
// BIO.stats (charged by BIO.cur inside the biome).
const BUDGET={
 showcase:{tris:30000000,calls:600,rendered:14000000},   // held in memory (the hero trees' stand-ins included) / drawn at any one camera, with the runtime LOD (KNOWN_ISSUES)
 cls:{pass:19000000,host:900000},
 type:{'xanadu/trees':'pass','xanadu/floor':'pass','xanadu/dress':'pass','host':'host'},
};
// ---------------------------------------------------------------- the host's own checks (verify.py runs them), each with a broken input that must fail
// species and plants that yield something edible the kit does not draw as a catalog fruit (seeds, petals, nuts...): named, not hidden
const FRUIT_NOT_DRAWN=['ginkgo','lotustrumpet','ringbeech','wisteria','hyrcanoak','travelers','cloudfern','maquis'];
// the instanced items on the stage, by item name, counted
const itemCounts=()=>{const n={};scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;const k=(M.name||'').replace(/^biome:/,'');n[k]=(n[k]||0)+M.count;});return n;};
const HCHK={
 // fruit: every species and plant carries a harvest tag; every edible one names a catalog piece (or is listed as not
 // drawn); every catalog fruit's item is on the stage, the olives and the lotus seed heads among them
 fruit(SP,PL,N){const miss=SP.filter(S=>S.tags.harvest&&S.tags.harvest.edible.length&&!S.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(S.key)<0).map(S=>S.key)
   .concat(Object.keys(PL).filter(k=>PL[k].tags.harvest&&PL[k].tags.harvest.edible.length&&!PL[k].tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(k)<0));
  const untagged=SP.filter(S=>!S.tags.harvest).map(S=>S.key).concat(Object.keys(PL).filter(k=>!PL[k].tags.harvest));
  const fr=SP.filter(S=>S.tags.harvest&&S.tags.harvest.fruit).map(S=>S.key).concat(Object.keys(PL).filter(k=>PL[k].tags.harvest&&PL[k].tags.harvest.fruit));
  const undrawn=fr.filter(k=>!(N[XANADU.FRUIT_ITEM[k]]>0));
  return{ok:!miss.length&&!untagged.length&&!undrawn.length&&fr.length>=9,
   detail:(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+(undrawn.length?'fruit not drawn: '+undrawn.join(', ')+'; ':'')+
    fr.length+' fruiting species and plants, '+XANADU.FRUIT_KEYS.length+' catalog keys; whorl olives '+(N.whorlolive||0)+', lotus seed heads '+(N.lotuspod||0)+', pods '+(N.pod||0)+', fruit balls '+(N.ball||0)+', pitaya '+(N.pitayafruit||0)+', catkins '+(N.catkin||0)}}};
// THE PLANTS' FEET ON THE DRAWN GROUND (the final rebuild, core/terrain KSEAT; swlowlands' check, CORE-IMPROVEMENTS.md item 1). A rooted item is one whose
// instances stand at one offset from the drawn ground (the median of y - drawnH over up to 400 of them within [-1, .3] m, its quartiles within .25 m);
// each sampled instance is a record whose foot is that offset under it, measured by the probe's contact sweep (core/host/95b-host-seat.js). old: each
// foot where terrainH put it, the negative that must float and sink. HELD_ITEMS share a mesh between ground pieces and held ones (a crown, a limb's moss)
const HELD_ITEMS={'biome:mossmat':1,'biome:frill':1,'biome:banana':1,'biome:fan':1},NOT_FEET={'biome:boulder':1,'biome:rock':1},HELD_UP=.6;
const FEET_OWED=LAND.feetOwed==null?0:LAND.feetOwed;   // ratchet: the feet still off the drawn ground at this turn (KNOWN_ISSUES.md); down, never up
let _feet=null;
function rootedFeet(old){if(!_feet){const out=[],m=new THREE.Matrix4(),items=[];let held=0;
  scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome||!M.count||NOT_FEET[M.name])return;M.updateMatrixWorld();
   const P=[],st=Math.max(1,Math.floor(M.count/400));
   for(let i=0;i<M.count;i+=st){M.getMatrixAt(i,m);m.premultiply(M.matrixWorld);const e=m.elements;P.push([e[12],e[13],e[14],e[13]-drawnH(e[12],e[14]),i]);}
   const d=P.map(p=>p[3]).sort((a,b)=>a-b),q=f=>d[Math.min(d.length-1,Math.floor(d.length*f))],med=q(.5);
   if(med<-1||med>.3||q(.75)-q(.25)>.25)return;items.push(M.name);
   const tol=Math.max(.3,Math.min(.6,(q(.95)-q(.05))/2));   /* an item's own planting scatter round its median is not a gap */
   P.forEach(p=>{if(p[3]-med>HELD_UP&&(HELD_ITEMS[M.name]||OBSTACLES.some(o=>Math.hypot(p[0]-o.x,p[2]-o.z)<o.r))){held++;return;}
    out.push({id:M.name+'#'+p[4],'class':'flora',at:[p[0],p[1]-med,p[2]],off:terrainH(p[0],p[2])-drawnH(p[0],p[2]),foot:{tol}});});});
  _feet={items,recs:out,held};}
 return old?_feet.recs.map(r=>Object.assign({},r,{at:[r.at[0],r.at[1]+r.off,r.at[2]]})):_feet.recs;}
function feetCheck(old){const F=rootedFeet(old),c=KSEAT.contactSweep(KHOST.seatScene(),F),off=F.map(r=>Math.abs(r.off)).sort((a,b)=>a-b),q=f=>off.length?off[Math.min(off.length-1,Math.floor(off.length*f))]:0;
 return{ok:c.n>1000&&c.fails.length<=(old?0:FEET_OWED)&&c.neg===true,detail:c.ok+' of '+c.n+' feet of '+_feet.items.length+' rooted items on the drawn ground, '+_feet.held+' held pieces left out ('+c.by.float+' floating, '+c.by.buried+' buried, '+c.by.inside+' inside; worst '+
  c.worst.gap.toFixed(2)+' m up, '+c.worst.depth.toFixed(2)+' m down; the control '+(c.neg?'floats':'DID NOT float')+'); terrainH off the drawn ground at these feet: median '+q(.5).toFixed(2)+', p99 '+q(.99).toFixed(2)+', max '+q(1).toFixed(2)+' m'};}
// THE LAND SIDE OF THE WATER (core/water ext/60, PRACTICE.md section 2; the checklist's third line): the env's fields hold their units, the trees stand out of
// the water the eye sees, and the wet band reaches it. The dawn redwoods (sp 0) stand in the shallows by design (the kit's notes)
const EDGE_OWED=LAND.edgeOwed||{plant:0,wet:0};   // ratchet: none owed at this turn
function edgeCheck(neg){const P=[];for(const T of XANADU.TREES){if(T.lv===0||T.sp===0)continue;P.push({x:T.x,z:T.z,r:Math.min(T.rb,.6),name:XANADU.SPECIES[T.sp].key});if(P.length>4000)break;}
 if(neg&&WATER_F){const s=XANADU.TREES.find(T=>T.lv>0);const w=(function(){for(let z=TERR.Z0;z<TERR.Z1;z+=40)for(let x=TERR.X0;x<TERR.X1;x+=40)if(WATER_FN.shore(x,z)<-4)return[x,z];return null;})();if(w)P.push({x:w[0],z:w[1],r:.5,name:'the control (in the water)'});}
 const pts=[[0,0],[TERR.X0*.5,TERR.Z0*.5],[TERR.X1*.5,TERR.Z1*.5],[TERR.X0*.5,TERR.Z1*.5]],bad=BIO.envCheck(ENV,pts),F=WATER.edgeAudit({field:WATER_F,plants:P,wet:WET_SHORE,band:4,clear:0}),N={};F.forEach(f=>{N[f.rule]=(N[f.rule]||0)+1;});
 return{ok:!bad.length&&(N['plant-in-water']||0)<=EDGE_OWED.plant&&(N['wet-short']||0)<=EDGE_OWED.wet,detail:(bad.length?'env: '+JSON.stringify(bad).slice(0,200)+'; ':'')+P.length+' trees, '+JSON.stringify(N)};}
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('fruit tagged, catalogued and drawn',HCHK.fruit(XANADU.SPECIES,XANADU.PLANTS,itemCounts()));
 if(XQ_ON('seat'))add('the plants feet on the drawn ground (KSEAT contact sweep)',feetCheck(false));
 add('the flora and the wet band read the water\'s own shore (BIO.envCheck, WATER.edgeAudit)',edgeCheck(false));
 if(typeof stationChecks==='function')stationChecks(add);
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),N=itemCounts();
 add('a fruiting species with no catalog fruit',HCHK.fruit(XANADU.SPECIES.map(S=>S.key==='cacao'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),XANADU.PLANTS,N));
 add('no whorl olives drawn',HCHK.fruit(XANADU.SPECIES,XANADU.PLANTS,Object.assign({},N,{whorlolive:0})));
 add('a plant with no harvest tag',HCHK.fruit(XANADU.SPECIES,Object.assign({},XANADU.PLANTS,{lotus:{name:'Lotus',items:[],tags:{}}}),N));
 if(XQ_ON('seat'))add('the plants feet back on terrainH (as before KSEAT): they float and sink',feetCheck(true));
 add('a tree standing in the lake',edgeCheck(true));
 if(typeof stationNegatives==='function')stationNegatives(add);
 return R;}
/* the land in the lake (core/water/ext/58; the owner, 2026-11-01): off at page load, for the tri counts; the panel's button or ?mirror=probe|live turns it on.
   The lake and the river's last reach at its level; the sphere the lake's shore distance from its middle (1500 m) */
const MIRROR=LAND.mirror?WATER.mirrorSwitch(Object.assign({THREE,renderer,scene,camera,sky:SKY,tree:o=>/^biome:impTrees/.test(o.name),hour:()=>ATMOS.clock?ATMOS.clock.hour:0},LAND.mirror())):null;window.MIRROR=MIRROR;
// ---------------------------------------------------------------- the page, handed to the host
// the runtime LOD: which chunk meshes this camera draws (after the camera is placed, before the draw)
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89-host-sky.js) */
KHOST.take({build:'xanadu',title:LAND.station?'Krator biome — Xanadu: '+LAND.label:'Krator biome — Xanadu',
 hint:LAND.hint||'Xanadu, the Vale in the East Rift Highlands: an enclosed mountain lake, the sacred river from its chasm, ornamental wildwood, the Mediterranean uplands (ideal type)',
 scene,camera,renderer,ground:drawnH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:MIRROR?()=>{MIRROR.update();SKY.draw();}:SKY.draw,   /* the reflections (off at load), the shared sky's pass, then the world (89-host-sky.js) */
 seat:{records:()=>rootedFeet(false)},
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,itemCounts,
 get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome}});
