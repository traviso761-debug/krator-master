// ================================================================= HOST — the station's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says
// what this page has. Every station takes this one; what differs is the stage's (STAGE.views, STAGE.expect, STAGE.water).
const gh=(x,z,dy)=>groundAll(x,z)+(dy||0);
const nearTree=(sp,x,z,pred)=>CATCH.nearestTree(sp,x,z,pred);
const VIEWS=(function(){const V=STAGE.views(gh,nearTree),out={};for(const k in V)if(V[k])out[k]=V[k];return out;})();
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,item=isItem?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item?CATCH.plantOfItem(item.replace(/\d+$/,'')+(/\d$/.test(item)?'0':''))||CATCH.plantOfItem(item):null;
 const S=best&&best.key&&CATCH.byKey[best.key],tg=S?S.tags:(PLT?PLT.tags:null);
 let name=isItem?(PLT?PLT.name+'  ·  ':'')+lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 const cls=S||PLT?'flora · the Catch':isItem?'flora (the eastern desert kit, read in place)':o.userData.rock?'rock · lake-bed sediment':'terrain / water';
 const F=n=>FC.at(FC.a[n],p.x,p.z);
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':''):'')+
  '\nwater table '+F('wet').toFixed(2)+' · sand '+F('sand').toFixed(2)+' · salt '+Math.max(F('salt'),F('crust'),F('soda')).toFixed(2)+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m'+hazardWords(p);}
/* the hazards at the point (core/hazard, KTAGS.hazardAt): the Stalkers' sand; its kind, danger and state now */
function hazardWords(p){const w=typeof KTAGS!=='undefined'&&KTAGS.hazardAt?KTAGS.hazardAt(p.x,p.y,p.z):'';return w?'\n'+w:'';}

// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={showcase:{tris:9000000,calls:500},cls:{pass:7000000,host:2500000},
 type:{'catch/trees':'pass','catch/floor':'pass','desert/trees':'pass','desert/floor':'pass','host':'host'}};
const inst=(pat)=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;if(pat&&!pat.test(M.name))return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name,sc.y]);}});return o;};
const KOPPEN_OK=['BWh','BWk','BSk','BSh'];
const HCHK={
 placed(C,need){const miss=need.filter(k=>!(C[k]>0));return{ok:!miss.length,detail:miss.length?'never placed: '+miss.join(', '):need.map(k=>k+' '+C[k]).join(', ')};},
 tagged(L){const bad=L.filter(t=>!t.tags||!t.tags.climate||!t.tags.aridity||t.tags.abyssal==null||!t.tags.riparian||!(t.tags.koppen||[]).length||t.tags.koppen.some(k=>KOPPEN_OK.indexOf(k)<0)||!t.tags.harvest).map(t=>t.key||t.name);
  return{ok:!bad.length,detail:bad.length?'untagged or tagged outside the basin\'s classes: '+bad.join(', '):L.length+' species and plants tagged (climate, aridity, abyssal, riparian, Koppen, harvest)'};},
 dry(P,wf){wf=wf||waterH;const bad=P.filter(p=>{if(/reed/.test(p[3]))return false;const w=wf(p[0],p[2]);return w>-1e8&&p[1]<w-.5;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+')':P.length+' instances, none drowned (reeds may stand in it)'};},
 offRock(T){const bad=T.filter(t=>ROCK.length&&KSTACKS.at(ROCK,t.x,t.z));return{ok:!bad.length,detail:bad.length?bad.length+' trees on a mesa':T.length+' trees, none on a mesa'};},
 // the tugai: a dead poplar where the water table fell, a living one where it holds (BIO.field wet)
 tugai(T,wf){wf=wf||FIELD.wet;const P=T.filter(t=>t.sp===0),bad=P.filter(t=>{const w=wf(t.x,t.z);return t.dead?w>.5:w<.45;});
  return{ok:P.length>0&&!bad.length,detail:bad.length?bad.length+' poplars alive or dead against their water table':P.length+' poplars ('+P.filter(t=>t.dead).length+' dead), each as its water table says'};},
 nebkhas(N,T){const miss=N.filter(n=>!T.some(t=>t.sp===1&&t.nebkha&&Math.hypot(t.x-n.x,t.z-n.z)<1));
  return{ok:!N.length||miss.length<=N.length*.1,detail:N.length?(N.length-miss.length)+' of '+N.length+' sand cones carry their salt cedar':'no nebkhas on this station'};},
 // the Stalkers lie under the sand: their lowest point below the ground, their highest above it
 buried(L){const b=new THREE.Box3(),bad=L.filter(s=>{b.setFromObject(s.group);const g=terrainH(s.s.x,s.s.z);return !(b.min.y<g-.5&&b.max.y>g+.3);});
  return{ok:!bad.length,detail:L.length?(L.length-bad.length)+' of '+L.length+' Stalkers half under the sand':'none on this station'};},
 camerasOut(C){const bad=C.filter(c=>c.y<groundAll(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};},
 // every oasis named in at least two of the four tongues (PLAN.md section 8)
 oases(O){const bad=O.filter(o=>Object.values(o.names||{}).filter(Boolean).length<2);return{ok:O.length===5&&!bad.length,detail:bad.length?'under-named: '+bad.map(o=>o.key).join(', '):O.length+' oases, each named in four tongues'};}};
const TAGGED=()=>CATCH.SPECIES.map(S=>({key:S.key,tags:S.tags})).concat(Object.keys(CATCH.PLANTS).map(k=>({key:k,tags:CATCH.PLANTS[k].tags})));
const COUNTS=()=>{const C={},T=CATCH.TREES;C.poplar=T.filter(t=>t.sp===0).length;C.tamarisk=T.filter(t=>t.sp===1).length;
 const P=inst();C.broom=P.filter(p=>/broom/.test(p[3])).length;C.reed=P.filter(p=>/reed/.test(p[3])).length;C.saltbush=P.filter(p=>/saltbush/.test(p[3])).length;
 C.brinelamp=P.filter(p=>/brinelamp/.test(p[3])).length;C.palm=(typeof SEDESERT!=='undefined'&&SEDESERT.TREES?SEDESERT.TREES.filter(t=>t.sp===7).length:0);return C;};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=inst(),T=CATCH.TREES;
 add('every species the station grows is placed',HCHK.placed(COUNTS(),STAGE.expect||[]));
 add('every species and plant tagged (Koppen of a dry basin)',HCHK.tagged(TAGGED()));
 add('nothing rooted under the water (core/water)',HCHK.dry(P));
 add('no tree on a lake-bed mesa',HCHK.offRock(T));
 if(T.some(t=>t.sp===0))add('the tugai lives or dies by its water table',HCHK.tugai(T));
 add('salt cedars on their sand cones',HCHK.nebkhas(STAGE.nebkhas||[],T));
 if(STALKERS.length)add('the Stalkers lie half under the sand',HCHK.buried(STALKERS));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 add('the five oases named in the four tongues',HCHK.oases(CATCH.OASES));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),T=CATCH.TREES;
 add('a species never placed',HCHK.placed({poplar:0},['poplar']));
 add('a species tagged with a wet class',HCHK.tagged([{key:'x',tags:Object.assign({},CATCH.SPECIES[0].tags,{koppen:['Af']})}]));
 add('a plant under the water',HCHK.dry([[0,terrainH(0,0)-1,0,'test']],()=>terrainH(0,0)+2));
 if(ROCK.length)add('a tree on a mesa',HCHK.offRock([{x:ROCK[0].x,z:ROCK[0].z}]));
 add('a dead poplar at a full spring',HCHK.tugai([{sp:0,dead:true,x:0,z:0}],()=>.95));
 add('a sand cone with no salt cedar',HCHK.nebkhas([{x:1e5,z:1e5}],T));
 if(STALKERS.length){const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.BoxGeometry(1,2,1)));g.position.set(0,terrainH(0,0)+5,0);g.updateMatrixWorld(true);
  add('a Stalker standing on the sand',HCHK.buried([{group:g,s:{x:0,z:0}}]));}
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:groundAll(0,0)-5,z:0}]));
 add('an oasis with one name',HCHK.oases(CATCH.OASES.map((o,i)=>i?o:Object.assign({},o,{names:{yuni:'Kolli'}}))));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(function sky(dt){skyView(dt);STORM.apply(dt||0);},'view');
/* the dust box rides the camera (core/atmos 3d-dust): from a camera high over the ground its sprites smear into a flat band
   across the horizon (KNOWN_ISSUES.md, a core/atmos gap), so it is shown only near the ground: walking, riding, flying low */
{let DUST=null;scene.traverse(m=>{if(m.name==='atmos:dust')DUST=m;});
 if(DUST)KHOST.on(function dustNear(){const h=camera.position.y-groundAll(camera.position.x,camera.position.z);DUST.visible=h<140;},'view');}   /* the shared sky, its lights and fog at the hour (89s-host-sky.js), then the storm's share (89y) */
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.take({build:'catch',title:STAGE.title,hint:STAGE.hint,
 scene,camera,renderer,ground:groundAll,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:STAGE.hour==null?9:STAGE.hour},draw:HOST_DRAW,   /* the reflections switch (98z), then the shared sky's pass and the world */
 inspect:describe,stats:()=>'inst '+window._instances+'  air '+STORM.mode,controls:[STORM_CONTROL],
 layers:{'hazards':KTAGS.hazardLayer(),'flora':{match:o=>!!(o.userData&&o.userData.biome)},'rock and Stalkers':{match:o=>!!(o.userData&&o.userData.host&&!o.userData.probeSkip)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome,desert:()=>window._desert,counts:COUNTS,exportBox:STAGE.exportBox||null,
  at:(x,z)=>{const o={h:terrainH(x,z),ground:groundAll(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
