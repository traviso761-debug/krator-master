// ================================================================= HOST — the page's views, inspector words and checks, handed to core/host
// shighlands' station take, for the Outlands: the station's words, views and colony checks are 98-host-views.js's.
const VIEWS=STATION_VIEWS();
// ---------------------------------------------------------------- the inspector's words: a form names its colony and its role
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 const il=isItem&&hit.instanceId!=null&&BIO.instLabel?BIO.instLabel(o,hit.instanceId):null,item=isItem?(o.name||'').replace(/^biome:/,''):null;
 const S=item?OUTL.formOfItem(item,il||lab):null,seam=il&&/^A seam/.test(il);
 let name=il||lab;if(!isItem&&best)name=best.name+'  ·  '+lab;
 const A={};OUTL.COLONY.at(p.x,p.z,A);
 const col=A.c?'colony '+A.c.id+' ('+OUTL.byType[A.c.type].name.toLowerCase()+', age '+A.c.age.toFixed(2)+', reach '+A.c.R.toFixed(0)+' m)'+(A.seam?'  ·  ON THE SEAM with '+A.c2.id:''):'no colony holds this ground';
 const tg=seam?OUTL.SEAM.tags:S?S.tags:null,T=S?OUTL.byType[S.type]:null;
 return name+'\n'+(isItem?'flora · the Outlands, '+STATION_TITLE:'terrain / water')+'  ·  '+col+
  (tg&&S?'\n'+T.name+' · role: '+S.role+' · '+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · Koppen '+tg.koppen.join(' '):'')+
  (S&&S.how?'\n'+S.how:seam?'\n'+OUTL.SEAM.how:'')+(tg&&tg.harvest&&tg.harvest.use!=='none'?'\nharvest: '+tg.harvest.use+(tg.harvest.edible.length?' · edible '+tg.harvest.edible.join(', '):''):'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- budgets and checks
const BUDGET={showcase:{tris:19500000,calls:160},cls:{pass:14000000,host:1800000},type:{'outl/colonies':'pass','host':'host'}};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
const HCHK={
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+')':P.length+' instances, none drowned'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};},
 colonies(R){const bad=R.filter(c=>!c.rec);return{ok:R.length>0&&!bad.length,detail:bad.length?bad.length+' colonies with no core/tags record':R.length+' colonies, each a core/tags record (kind colony) before any form was drawn'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('nothing rooted under the water',HCHK.dry(instPoints()));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 add('every colony on the map is a core/tags record',HCHK.colonies(OUTL.COLONY.colonies.filter(c=>Math.abs(c.x)<TERR.R-150+c.R&&Math.abs(c.z)<TERR.R-150+c.R)));
 STATION_CHECKS(add);
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 if(POOLS.length)add('a plant on a pool\'s bed',HCHK.dry([[POOLS[0].x,POOLS[0].l-2.5,POOLS[0].z,'test']]));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 add('a colony with no record',HCHK.colonies([{id:'x'}]));
 STATION_NEGATIVES(add);
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');
KHOST.take({build:'outlands',title:'Krator biome — the Outlands: '+STATION_TITLE,hint:STATION_HINT,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances+' · colonies '+(window._biome?window._biome.colonies:0),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export(),colonies:()=>OUTL.COLONY.records()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome,atmos:()=>ATMOS.export(),colonies:()=>OUTL.COLONY.records(),
 colonyAt:(x,z)=>{const A=OUTL.COLONY.at(x,z,{});return A.c?{id:A.c.id,type:A.c.type,seam:A.seam,gap:+A.gap.toFixed(2),c2:A.c2?A.c2.id:null,level:A.level}:null;},
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
