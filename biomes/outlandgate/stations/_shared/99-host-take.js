// ================================================================= HOST — a later station's views, inspector words and checks, handed to core/host
// (station 1's src/99-host-take.js, read off the STAGE: its kin and species rows, its budget types, its wet point)
const VIEWS=STATION_VIEWS();
// ---------------------------------------------------------------- the inspector's words: a tree names its row, a work its record
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 const il=isItem&&hit.instanceId!=null&&BIO.instLabel?BIO.instLabel(o,hit.instanceId):null;
 let name=il||lab;if(!isItem&&best)name=best.name+'  ·  '+lab;
 const K=OGATE.KIN.concat(OGATE.KINX||[]).find(r=>name.indexOf(r.name)>=0),S=OGATE.SPECIES.find(s=>name.indexOf(s.name)>=0);
 return name+'\n'+(isItem?'flora · the Outland Gate, '+STATION_TITLE:'terrain / water / works')+(K?'\n'+K.name+' (read in place: '+K.from+') · '+K.where:'')+(S?'\n'+S.how:'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- budgets and checks
const BUDGET={showcase:{tris:19500000,calls:160},cls:{pass:14000000,host:1800000},type:Object.assign({'ogate/woods':'pass','ogate/reeds':'pass','host':'host'},STAGE.budgetTypes||{})};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
const HCHK={
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+')':P.length+' instances, none drowned'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('nothing rooted under the water',HCHK.dry(instPoints()));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 STATION_CHECKS(add);return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('a plant under the water',HCHK.dry([[STAGE.wetAt[0],waterH(STAGE.wetAt[0],STAGE.wetAt[1])-2.5,STAGE.wetAt[1],'test']]));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 STATION_NEGATIVES(add);return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');
KHOST.take({build:'outlandgate',title:'Krator biome — the Outland Gate: '+STATION_TITLE,hint:STATION_HINT,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances+' · trees '+(window._biome?window._biome.trees:0),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome,atmos:()=>ATMOS.export(),
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
