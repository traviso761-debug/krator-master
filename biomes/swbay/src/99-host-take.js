// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
// the presets are written in the bay's own coordinates (u along the NE
// diagonal from the bay's centre, v across it; heights above the ground)
const XZ=(u,v)=>[BAY.c[0]+(u+v)*SQ,BAY.c[1]+(v-u)*SQ];
const V=(cu,cv,cy,tu,tv,ty)=>{const c=XZ(cu,cv),t=XZ(tu,tv);return[c[0],terrainH(c[0],c[1])+cy,c[1],t[0],terrainH(t[0],t[1])+ty,t[1]];};
const VIEWS={
 'The bay from the shore':V(1010,-320,12,200,0,2),
 'Under the prism gums':V(1150,200,8,1400,260,40),
 'Cap-trees':V(1230,-250,10,1430,-420,28),
 'Ironbarks':V(1180,-60,8,1420,-20,44),
 'Bracket trees':V(1640,260,4,1760,300,12),
 'The fan-crowns':V(1300,460,12,1500,620,34),
 'The river mouth':V(900,-160,22,1250,20,3),
 'Soarers over the bay':V(960,120,30,400,-100,70),
 'The jetty':(function(){const J=window.JETTY;if(!J)return V(950,-360,6,850,-360,2);const c=[J.head[0]-J.dir[1]*40+J.dir[0]*-30,J.head[1]+J.dir[0]*40+J.dir[1]*-30],t=[J.head[0]+J.dir[0]*J.L*.45,J.head[1]+J.dir[1]*J.L*.45];return[c[0],9,c[1],t[0],3,t[1]];})(),
 'Gliders over the savannah':V(2500,-100,6,2800,0,170),
 'The cataracts':(function(){const u=1900;return V(u-80,vR(u-80),26,u+260,vR(u+260),4);})(),
 'Bay swimmers':(function(){const p=(SWBAY.FAUNA&&SWBAY.FAUNA.pods&&SWBAY.FAUNA.pods[0])||{x:BAY.c[0],z:BAY.c[1],r:100};const cx=p.x+p.r*.9,cz=p.z+p.r*.55;return[cx,16,cz,p.x,0,p.z];})(),
 'The herd':(function(){const h=(SWBAY.FAUNA&&SWBAY.FAUNA.herd)||{x:0,z:0};const cx=h.x-52,cz=h.z+38;return[cx,terrainH(cx,cz)+5,cz,h.x,terrainH(h.x,h.z)+2,h.z];})(),
 'The jungle from above':V(1080,0,160,1500,120,30),
 'The tower':V(1020,-720,70,1250,-500,90),
 'Under the tower':V(1300,-560,50,1250,-500,120),
 'Into the rainforest':V(1700,100,10,1950,150,28),
 'Tree ferns':V(1900,-220,5,2050,-270,8),
 'The savannah edge':V(2400,0,12,2700,100,20),
 'Baobab avenue':V(2800,300,6,3100,360,28),
 'Parasols and monkey puzzles':V(3100,-300,6,3300,-420,12),
 'Monkey-puzzle parasols':V(3040,180,3,3140,250,32),
 'From the highlands':V(3600,0,120,1000,0,0),
 'From over the bay':V(-200,0,220,1200,0,30),
 'The volcano':(function(){const c=XZ(2300,-100);return[c[0],terrainH(c[0],c[1])+70,c[1],VOLC.c[0],1000,VOLC.c[1]];})(),
 'Umbrella thorns':V(2650,-450,5,2850,-520,14),
 'Krator rising':V(600,0,30,3000,-1400,650),
};
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 // a plant names itself (the item's label); a bole or a structure names its registered volume
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // a tree's volume names its species: show what it yields (biomes/FRUIT.md)
 const S=best&&SWBAY.SPECIES.find(s=>s.name===best.name),hv=S&&S.tags.harvest;
 return name+(hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per biome pass come from
// BIO.stats (charged by BIO.cur inside the biome).
const BUDGET={
 // held in memory (the heroes' lite stand-ins included) / drawn at any one camera, with the runtime LOD /
 // draw calls (KNOWN_ISSUES, BUDGET). The agreed 10M at q=1 plus the stand-ins (0.29M). Measured Oct 2026:
 // 10.13M held; 4.7-7.0M drawn at the presets checked (renderer.info; BIO.lodShown counts the chunk meshes
 // only, 2.0-6.2M over the 27 presets) in 169-273 calls. Before the LOD every camera drew all ~10.5M in
 // 57-97 calls. `rendered` is tracked, not asserted by verify.py.
 showcase:{tris:10500000,calls:400,rendered:8000000},
 cls:{pass:7500000,host:900000},
 type:{'bay/trees':'pass','bay/floor':'pass','bay/dress':'pass','bay/fauna':'pass','host':'host'},
};
// species that yield something edible the kit does not draw as a catalog fruit: named, not hidden. The umbrella
// the tree fern's fruit are fiddleheads: no catalog piece (biomes/FRUIT.md); the thorn's pods, the monkey-puzzle seeds and the cherries are catalogued, not drawn on the stage.
const FRUIT_NOT_DRAWN=['treefern'];
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const HCHK={
 // fruit: every fruiting species names a catalog piece (biomes/FRUIT.md), and fruit is drawn on the stage (the baobabs'
 // gatepods are the 'pod' items, the parasol caps the 'parasol' items; the coral fungus is built into its bucket)
 fruit(SP,P){const miss=SP.filter(S=>S.tags.harvest&&S.tags.harvest.edible.length&&!S.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(S.key)<0).map(S=>S.key);
  const untagged=SP.filter(S=>!S.tags.harvest).map(S=>S.key),np=P.filter(p=>/:pod$/.test(p[3])).length,nc=P.filter(p=>/:parasol$/.test(p[3])).length;
  return{ok:!miss.length&&!untagged.length&&np>=20&&nc>=100,detail:(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+np+' gatepods and '+nc+' parasol caps drawn; catalog keys: '+SWBAY.FRUIT_KEYS.join(', ')+'; not drawn: '+FRUIT_NOT_DRAWN.join(', ')};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('fruit tagged, catalogued and drawn',HCHK.fruit(SWBAY.SPECIES,P));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 add('a fruiting species with no catalog fruit',HCHK.fruit(SWBAY.SPECIES.map(S=>S.key==='baobab'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),P));
 add('a species with no harvest tag',HCHK.fruit(SWBAY.SPECIES.map(S=>S.key==='coral'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:undefined})}):S),P));
 add('no gatepods drawn',HCHK.fruit(SWBAY.SPECIES,P.filter(p=>!/:pod$/.test(p[3]))));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
// the runtime LOD: which chunk meshes this camera draws (after the camera is placed, before the draw)
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.take({build:'swbay',title:'Krator biome — the southwest bay',
 hint:'The southwest bay: bay hyperjungle, rainforest, parasol savannah, the volcano in the NE (ideal type)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);if(typeof wallSky!=='undefined')wallSky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}},
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[sky,giant,giantRing,typeof wallSky!=='undefined'?wallSky:null]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome}});
