// ================================================================= HOST — the high passes' views, inspector words and probe checks (station 2), handed to core/host
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const H0=HOLLOWS[0],RZ=roadZ;
const VIEWS={
 'The pass':look(-260,RZ(-260)+40,6,140,RZ(140),2),
 'Cairns at the saddle':look(70,RZ(70)+22,2.2,120,RZ(120),1.2),
 'A prayer-stone wall':look(-500,RZ(-500)+14,2,-330,RZ(-330)+8,.6),
 'Cushions on the gravel':look(-1700,RZ(-1700)-180,1.6,-1690,RZ(-1690)-160,.1),
 'Snow lotus among the stones':look(-900,1180,1.4,-892,1186,.2),
 'Sky poppies at the tarn':look(TARN.x+TARN.r*1.7,TARN.z+TARN.r*.9,1.8,TARN.x,TARN.z,.3),
 'Patterned ground':look(H0.x+H0.r*.6,H0.z+H0.r*.4,3,H0.x,H0.z,0),
 'The heights':look(0,RZ(0)+250,8,0,2000,300),
 'Down to the valley':look(200,-1150,6,200,-3000,-600),
 'From afar':look(-2300,RZ(-2300)+900,220,600,RZ(600),40),
};
// a station on this ground (the Cold Hearths) adds its own views, checks and words (STATION_TAKE: {build, title, hint, views(), checks(add), negatives(add), plant(item)})
const ST=typeof STATION_TAKE!=='undefined'?STATION_TAKE:{};if(ST.views)Object.assign(VIEWS,ST.views());
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&((ST.plant&&ST.plant(item))||OIDONG.plantOfItem(item));
 const name=PLT?PLT.name+'  ·  '+lab+(best?'  (at '+best.name+')':''):(best?best.name+'  ·  '+lab:lab),tg=PLT?PLT.tags:null;
 return name+'\n'+(isItem?'flora · the high passes':'terrain / water')+(tg?'\n'+tg.climate+' · '+tg.aridity+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest&&tg.harvest.note?'\n'+tg.harvest.note:'')+'\nwet '+(FIELD.wet(p.x,p.z)*100|0)+'% · cold '+(FIELD.cold(p.x,p.z)*100|0)+'%\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
const BUDGET={showcase:{tris:10000000,calls:110},cls:{pass:8000000,host:1500000},   /* measured 2026-11-03 (Arc): the high country 7.0M, the scene 7.6-8.1M */
 type:{'oidong/high':'pass','host':'host'}};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
const HCHK={
 // the high country's plants and the road's marks are all here
 placed(st){const need=['cushions','lotus','poppies','stones','cairns','walls'],zero=need.filter(k=>!(st&&st[k]>0));return{ok:!zero.length,detail:zero.length?'none: '+zero.join(', '):need.map(k=>k+' '+st[k]).join(', ')};},
 // above the last tree: no tree, no valley plant
 treeless(P){const bad=P.filter(p=>/biome:(darkneedle|broad|gloss|blossom|lace|heart|raceme|needle|bambooleaf|fern|mooncap|lilypad|giantpad)/.test(p[3]));
  return{ok:!bad.length,detail:bad.length?bad.length+' valley plants up here (first '+bad[0][3]+')':P.length+' instances, none of the valley\'s'};},
 // the sky poppies keep to the damp ground (the wet field)
 poppies(P){const pp=P.filter(p=>p[3]==='biome:poppy'),bad=pp.filter(p=>FIELD.wet(p[0],p[2])<.38);return{ok:pp.length>0&&!bad.length,detail:bad.length?bad.length+' poppies on dry gravel (first at '+bad[0].slice(0,3).map(v=>v|0)+')':pp.length+' poppy heads, all in damp hollows'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-.6;});return{ok:!bad.length,detail:bad.length?bad.length+' under the tarn':P.length+' instances, none drowned'};},
 road(P){const bad=P.filter(p=>p[3]!=='biome:stone'&&p[3]!=='biome:standing'&&Math.abs(p[2]-roadZ(p[0]))<1);return{ok:!bad.length,detail:bad.length?bad.length+' plants on the road':'the road kept clear'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
function edgeCheck(){const P=instPoints().filter(p=>p[3]==='biome:lobe').slice(0,6000).map(p=>({x:p[0],z:p[2],r:.3,name:'cushion'}));
 const bad=BIO.envCheck(ENV,[[0,roadZ(0)],[TARN.x,TARN.z+TARN.r*2],[-1500,-200],[0,1600]]),F=WATER.edgeAudit({field:WATER_F,plants:P,wet:WET_SHORE,band:4,clear:0}),N={};F.forEach(f=>{N[f.rule]=(N[f.rule]||0)+1;});
 return{ok:!bad.length&&!(N['plant-in-water']>0)&&!(N['wet-short']>0),detail:(bad.length?'env: '+JSON.stringify(bad).slice(0,200)+'; ':'')+P.length+' cushions, '+JSON.stringify(N)};}
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the high country\'s plants and the road\'s marks placed',HCHK.placed(window._station));
 add('above the last tree: none of the valley\'s plants',HCHK.treeless(P));
 add('sky poppies in the damp hollows only',HCHK.poppies(P));
 add('nothing rooted under the tarn',HCHK.dry(P));
 add('the pilgrims\' road kept clear',HCHK.road(P));
 add('the flora and the wet band read the shore of the water (BIO.envCheck, WATER.edgeAudit)',edgeCheck());
 if(ST.checks)ST.checks(add,P);
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 add('no cairns',HCHK.placed(Object.assign({},window._station,{cairns:0})));
 add('a cedar on the pass',HCHK.treeless([[0,5050,0,'biome:darkneedle']]));
 add('a poppy on the dry shelf',HCHK.poppies([[KNOBS[0].x,5200,KNOBS[0].z,'biome:poppy']]));
 add('a cushion in the tarn',HCHK.dry([[TARN.x,TARN.l-2,TARN.z,'biome:lobe']]));
 add('a cushion on the road',HCHK.road([[0,5050,roadZ(0),'biome:lobe']]));
 add('a camera under the tarn',HCHK.camerasOut([{view:'under',x:TARN.x,y:TARN.l-5,z:TARN.z}]));
 if(ST.negatives)ST.negatives(add,P);
 return R;}
KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
const MIRROR=WATER.mirrorSwitch?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[POOLS_DRAW.mesh.material],
 level:TARN.l,center:[TARN.x,TARN.z],radius:TARN.r*3,far:1200,hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;
KHOST.take({build:ST.build||'oidong-passes',title:ST.title||'Krator biome — the high passes over the Oidong Valley',
 hint:ST.hint||"Station 2: the cold desert 3 km above the Oidong Valley (ET, 5,050 m, 141 mm), where the pilgrims' road from Longsong crosses the shelf: bare gravel and scree under a huge sky, cushion plants, the snow lotus among the stones, sky poppies at a meltwater tarn, sorted stone polygons in the frost hollows, cairns at the saddle and prayer-stone walls (ideal type)",
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:MIRROR?()=>{MIRROR.update();SKY.draw();}:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 minimap:{title:ST.map||'The high passes'},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._station,
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],   /* no tree above the tree line: no bucket geometry to export */
 exportBox:[Math.round(TARN.x-150),Math.round(TARN.z-150),Math.round(TARN.x+150),Math.round(TARN.z+150)],   /* verify.py's export box: holds the tarn (the water section) */
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
