// ================================================================= HOST — a station's views, inspector words and checks, handed to core/host
// src/99-host-take.js's shape for the stations above the scarp (station.json maps this in its place). The station says what is its own
// (stations/<name>/: STATION_TITLE, STATION_HINT, STATION_SPECIES (the keys it must place), STATION_PLANTS (its floor plants' keys),
// STATION_VIEWS() (the views, found on the map), STATION_CHECKS(add) and STATION_NEGATIVES(add), STATION_BUDGET); the rest is common.
const gh=(x,z,dy)=>terrainH(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>SHIGH.byKey[k]?SHIGH.byKey[k].i:-1;
function nearTree(key,x,z,minH,hand){return SHIGH.nearestTree(SPI(key),x,z,minH,hand?{hand}:null)||SHIGH.nearestTree(SPI(key),x,z,minH)||{x:x,z:z,y0:gh(x,z),H:6,crownR:3};}
function atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*(ty==null?.6:ty),T.z];}
const across=(x,z,az,d,h,th)=>{const tx=x+Math.cos(az)*d,tz=z+Math.sin(az)*d;return[x,gh(x,z,h),z,tx,gh(tx,tz,th==null?2:th),tz];};
// the best point of a score near the spine (a station's views are found, not typed)
function bestAt(score,step){let b=[0,0],bs=-1e9;step=step||50;for(let z=-2300;z<=2300;z+=step)for(let x=-2300;x<=2300;x+=step){if(BIO.mask(x,z)<=0)continue;const s=score(x,z)-BIO.lodD(x,z)/3000;if(s>bs){bs=s;b=[x,z];}}return b;}
const VIEWS=STATION_VIEWS();
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&SHIGH.plantOfItem(item);
 const S=best&&best.key&&SHIGH.byKey[best.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=S||isItem?'flora · southern highlands, '+STATION_TITLE:'terrain / water / ice';
 const hand=best&&best.hand!=null?(best.hand<0?'  ·  MIRROR-HANDED':'  ·  right-handed'):'';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · spiral: '+tg.spiral+hand+' · Koppen '+tg.koppen.join(' '):'')+
  (S&&S.how?'\n'+S.how:'')+(tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none'):'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- budgets and checks
const BUDGET=typeof STATION_BUDGET!=='undefined'?STATION_BUDGET:{showcase:{tris:19500000,calls:140},cls:{pass:14000000,host:1500000},type:{'shigh/trees':'pass','shigh/floor':'pass','host':'host'}};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
const HCHK={
 placed(C,keys){const zero=keys.filter(k=>!(C[SPI(k)]>0));return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):keys.length+' species placed, the scarcest '+Math.min(...keys.map(k=>C[SPI(k)]))};},
 tagged(L){const bad=[];for(const S of L){const t=S.tags||{},k=t.koppen||[];if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||SHIGH.SPIRALS.indexOf(t.spiral)<0||!t.harvest||!k.length||k.some(c=>!(c in SHIGH.KOPPEN)))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged, without a spiral, or tagged outside the region: '+bad.join(', '):L.length+' tagged, each with its spiral'};},
 hands(T){if(!T.length)return{ok:true,detail:'no trees on this station'};const mir=T.filter(t=>t.hand<0).length,bad=T.filter(t=>t.hand!==1&&t.hand!==-1).length,share=mir/T.length;
  return{ok:!bad&&mir>=1&&share<.02,detail:(bad?bad+' trees with no hand; ':'')+mir+' mirror-handed of '+T.length+' ('+(share*100).toFixed(2)+'%)'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+')':P.length+' instances, none drowned'};},
 edge(T){if(!WATER.fields||!WATER.edgeAudit||!WATER.surfaces.length)return{ok:true,detail:'no water the eye sees on this page'};
  const F=WATER_F||WATER.fields({box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],cell:8,ground:terrainH,surfaces:WATER.surfaces.filter(q=>q.kind!=='fall')});
  const A=WATER.edgeAudit({field:F,plants:T.map(t=>({x:t.x,z:t.z,r:t.rb==null?.5:t.rb,name:SHIGH.SPECIES[t.sp].key})),clear:0}),n=A.filter(f=>f.rule==='plant-in-water').length;
  return{ok:n===0,detail:n?n+' trees in the water':T.length+' trees, none in the water the eye sees'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
const PLANTS_OF=()=>(STATION_PLANTS||[]).map(k=>Object.assign({key:k},SHIGH.PLANTS[k]));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 if(STATION_SPECIES.length)add('every species of the station placed',HCHK.placed(SHIGH.COUNTS||[],STATION_SPECIES));
 add('every plant tagged with its spiral',HCHK.tagged(STATION_SPECIES.map(k=>SHIGH.byKey[k]).concat(PLANTS_OF())));
 add('one hand: every spiral right-handed but the rare mirror',HCHK.hands(SHIGH.TREES));
 add('nothing rooted under the water',HCHK.dry(P));
 add('the trees keep out of the water the eye sees (WATER.edgeAudit)',HCHK.edge(SHIGH.TREES));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 if(typeof STATION_CHECKS==='function')STATION_CHECKS(add);
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 if(STATION_SPECIES.length){const C=(SHIGH.COUNTS||[]).slice();C[SPI(STATION_SPECIES[0])]=0;add('a species never placed',HCHK.placed(C,STATION_SPECIES));}
 add('a plant with a made-up spiral',HCHK.tagged([Object.assign({},PLANTS_OF()[0],{tags:Object.assign({},PLANTS_OF()[0].tags,{spiral:'zigzag'})})]));
 add('a plant tagged outside the region',HCHK.tagged([Object.assign({},PLANTS_OF()[0],{tags:Object.assign({},PLANTS_OF()[0].tags,{koppen:['Af']})})]));
 if(SHIGH.TREES.length)add('no mirror-handed tree',HCHK.hands(SHIGH.TREES.map(t=>Object.assign({},t,{hand:1}))));
 if(TARN)add('a plant on the tarn bed',HCHK.dry([[TARN.x,TARNL-2.5,TARN.z,'test']]));
 if(TARN&&WATER.edgeAudit)add('a tree in the middle of the tarn',HCHK.edge([{x:TARN.x,z:TARN.z,sp:0,rb:.5}]));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 if(typeof STATION_NEGATIVES==='function')STATION_NEGATIVES(add);
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');
const MIRROR=WATER.mirrorSwitch&&typeof TARN_DRAW!=='undefined'&&TARN_DRAW?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,
 far:2200,tree:o=>o.name==='biome:impTrees',hour:()=>ATMOS.clock?ATMOS.clock.hour:0,materials:[TARN_DRAW.mesh.material],level:TARNL,center:[TARN.x,TARN.z],radius:TARN.r*2.5}):null;
window.MIRROR=MIRROR;
KHOST.take({build:'shighlands-'+SHIGH.STATION,title:'Krator biome — the southern highlands: '+STATION_TITLE,hint:STATION_HINT,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:MIRROR?()=>{MIRROR.update();SKY.draw();}:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome,atmos:()=>ATMOS.export(),
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
