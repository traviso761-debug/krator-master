// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
const VIEWS=STATION_PAGE.views;   /* the station's views (44s-host-station.js) */
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 // a plant names itself (the item's label); a bole or a structure names its registered volume
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // the harvest tag (biomes/FRUIT.md): a fruiting plant's item names its plant; otherwise the species of the volume round it
 const PLT=isItem?RIFT.plantOfItem((o.name||'').replace(/^biome:/,'')):null,S=!PLT&&best?RIFT.speciesByName(best.name):null,hv=PLT?PLT.tags.harvest:S?S.tags.harvest:null;
 if(PLT)name=PLT.name+'  ·  '+lab;
 const hvl=hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'';
 return name+hvl+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per biome pass come from
// BIO.stats (charged by BIO.cur inside the biome).
const BUDGET={
 showcase:{tris:STATION_PAGE.held||27000000,calls:700,rendered:17000000},   /* STATION_PAGE.held: a station's own ceiling (the owner, 2026-10-27: 40 M for the jungle) */   // held in memory (the hero trees' stand-ins included) / calls and triangles drawn at any one camera, with the runtime LOD (KNOWN_ISSUES BUDGET)
 cls:{pass:STATION_PAGE.passMax||19000000,host:900000},
 type:{'rift/trees':'pass','rift/far':'pass','rift/floor':'pass','rift/dress':'pass','host':'host'},   // rift/far: the impostors and the hero trees' stand-ins
};
// ---------------------------------------------------------------- fruit (biomes/FRUIT.md)
// species that yield something edible the kit does not draw as a catalog fruit (nuts, pods, pith...): named, not hidden
const FRUIT_NOT_DRAWN=['cycad','cloudfern','bladepear'];   /* bladepear: its pads are the food, singed of their spines; no catalog fruit */
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const HCHK={
 // every fruiting species and plant names a catalog piece, every one is tagged, and the fruit is drawn on the stage:
 // ballmelons (a few split, rind and flesh in pairs) and the hanging pods (frillpods, lantern fruit, bell dates)
 fruit(SP,PL,P){const miss=SP.filter(S=>S.tags.harvest&&S.tags.harvest.edible.length&&!S.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(S.key)<0).map(S=>S.key);
  const untagged=SP.filter(S=>!S.tags.harvest).map(S=>S.key).concat(Object.keys(PL).filter(k=>!PL[k].tags.harvest));
  const FM=STATION_PAGE.fruitMin,cnt=k=>P.filter(p=>p[3]==='biome:'+k).length,balls=cnt('ball'),pods=cnt('pod'),halves=cnt('melonhalf'),flesh=cnt('melonflesh');
  const ok=!miss.length&&!untagged.length&&balls>=FM.balls&&pods>=FM.pods&&halves>=FM.halves&&flesh===halves;
  return{ok,detail:(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+
   balls+' ballmelons, '+(halves/2)+' split ('+flesh+' flesh faces), '+pods+' hanging pods; catalog keys: '+RIFT.FRUIT_KEYS.length+' ('+RIFT.FRUIT_KEYS.join(', ')+')'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('fruit tagged, catalogued and drawn',HCHK.fruit(RIFT.SPECIES,RIFT.PLANTS,P));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 add('a fruiting species with no catalog fruit',HCHK.fruit(RIFT.SPECIES.map(S=>S.key==='carrotfrill'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),RIFT.PLANTS,P));
 if(STATION_PAGE.fruitMin.halves>0)add('no ballmelon split open',HCHK.fruit(RIFT.SPECIES,RIFT.PLANTS,P.filter(p=>p[3]!=='biome:melonhalf'&&p[3]!=='biome:melonflesh')));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
// the runtime LOD: which chunk meshes this camera draws (after the camera is placed, before the draw)
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89-host-sky.js) */
KHOST.take({build:'rift',title:STATION_PAGE.title,
 hint:STATION_PAGE.hint,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,   /* the shared sky's pass, then the world (89-host-sky.js) */
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome}});
