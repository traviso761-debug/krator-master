// ================================================================= HOST — the station's views, inspector words and checks, handed to core/host
// [web] The camera, the loop, the panel and window._api are core/host's (core/host/README.md); this fragment says what the page
// has. The views are the station's (STAGE.views(), made after the build so they can find the groves, the camp and the rows);
// a view may name an hour (STAGE.viewHour: the dusk view of the echoes). The kit's own checks run under verify.py --assert,
// each with a broken input that must fail (hostNegatives).
const VIEWS=(function(){const V=STAGE.views?STAGE.views():{},out={};for(const k in V)out[k]=V[k].cam||V[k];return out;})();
const VIEW_HOUR=(function(){const V=STAGE.views?STAGE.views():{},out={};for(const k in V)if(V[k].hour!=null)out[k]=V[k].hour;return out;})();
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-3&&p.y<=(r.y||0)+(r.h||40)+5){if(!best||r.r<best.r)best=r;}}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=lab==='ground'?STAGE.floorLabel(p.y):isItem?lab+(best?'  (in '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 const key=o.userData.kit==='cut'&&o.name?CUT.speciesOfItem(o.name.replace(/^biome:/,'')):null,S=key||(best&&[].concat(typeof NWLOW!=='undefined'?NWLOW.SPECIES:[],CUT.SPECIES).find(s=>s.name===best.name)),hv=S&&S.tags&&S.tags.harvest;
 const b=STAGE.toBowl(p.x,p.z),F=CUT.field(b[0],b[1]),N=CUT.north(b[0],b[1]);
 return name+(hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':''):'')+
  '\nthe warp: s '+F.s.toFixed(2)+' · combed '+(F.k<.5?'radially (spokes)':'round the centre (rings)')+(N.w?' · the compass points '+Math.round(CUT.bearing(N.dir[0],N.dir[1]))+'°':'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  ('+(p.y+STAGE.yRef).toFixed(0)+' m)  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the compass (the warp's needle: PLAN.md section 3)
const COMPASS=(function(){const el=document.createElement('div');el.id='cutCompass';
 el.style.cssText='position:fixed;right:14px;bottom:14px;width:64px;height:64px;border-radius:50%;background:rgba(20,22,24,.55);border:1px solid rgba(255,255,255,.25);z-index:5;pointer-events:none';
 el.innerHTML='<div style="position:absolute;left:31px;top:8px;width:2px;height:24px;background:#e8c060;transform-origin:1px 24px" id="cutNeedle"></div><div style="position:absolute;left:0;right:0;bottom:6px;text-align:center;font:10px system-ui;color:#ddd">the Cut</div>';
 document.body.appendChild(el);const nd=el.querySelector('#cutNeedle');
 return{update(){const p=camera.position,b=STAGE.toBowl(p.x,p.z),N=CUT.north(b[0],b[1]);el.style.opacity=N.w?.35+.65*N.w:0;
  const f=new THREE.Vector3();camera.getWorldDirection(f);const yaw=Math.atan2(f.x,-f.z),aim=Math.atan2(N.dir[0],-N.dir[1]);nd.style.transform='rotate('+((aim-yaw)*180/Math.PI)+'deg)';}};})();
// ---------------------------------------------------------------- the probe's budgets
const BUDGET={showcase:{tris:STAGE.budgetTris||9000000,calls:STAGE.budgetCalls||420,rendered:7000000},
 cls:{pass:7000000,host:900000},
 type:{'cut/natives':'pass','cut/camp':'pass','cut/plan':'pass','nwlow/trees':'pass','nwlow/floor':'pass','nhl/trees':'pass','nhl/floor':'pass','host':'host'}};
// ---------------------------------------------------------------- the kit's own checks (verify.py --assert)
const instOf=re=>{const o=[],m=new THREE.Matrix4();scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome||!re.test(M.name))return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);o.push(m.clone());}});return o;};
const HCHK={
 // the warp leans every culm toward the field's axis by its lean angle (the culm's own up vector against CUT.warp at its foot)
 combed(culms){let bad=0,n=0,worst=0;for(const c of culms){const W=CUT.warp(...STAGE.toBowl(c.x,c.z),{bites:false});if(W.s<.05)continue;n++;
   const up=[c.m[1],c.m[4],c.m[7]],l=Math.hypot(...up),ang=Math.acos(up[1]/l),along=(up[0]*W.axis[0]+up[2]*W.axis[1])/l,err=Math.abs(ang-CUT.LEAN*W.s);
   if(along<=0||err>CUT.LEAN*W.s*.2+.01){bad++;worst=Math.max(worst,err);}}
  return{ok:n>100&&!bad,detail:n+' culms checked, '+bad+' not leaning along the field'+(bad?' (worst '+(worst*180/Math.PI).toFixed(1)+' deg off)':'')};},
 // every node in a grove stands on the grove's levels: base + k L is the same set of heights for every culm
 nodes(groves){let bad=0,n=0;for(const G of groves){const y0=G.culms.reduce((a,c)=>Math.min(a,c.y),1e9);for(const c of G.culms){n++;const r=((c.y-y0)%G.L+G.L)%G.L;if(Math.min(r,G.L-r)>.02)bad++;}}
  return{ok:groves.length>0&&!bad,detail:groves.length+' groves, '+n+' culms; '+bad+' off their grove\'s node levels'};},
 // the bites, the echoes and the size steps are there (where the warp is strong enough to make them)
 warped(st,W){const s=CUT.field(...STAGE.toBowl(0,0)).s,need=s>.6;return{ok:(!need||st.echoes>0)&&(s<.2||st.bitten+(W.bites||0)>0)&&(W.trees===0||W.stepped>0||s<=.3),
  detail:'s '+s.toFixed(2)+' at the page; culms bitten '+st.bitten+', echoes '+st.echoes+'; read-in trees warped '+W.trees+' (size-stepped '+W.stepped+', crowns bitten '+W.bites+', '+W.floor+' floor plants leaned, '+(W.dropped||0)+' trees not this ring\'s)'};},
 // the camp's props carry the tags Dilihan's kit will look for
 camp(T){if(!STAGE.camp)return{ok:true,detail:'no camp on this station'};const recs=T?T.query({tags:{role:'placeholder',style:'dilihan'}}):[];
  const kinds=new Set(recs.map(r=>r.tags.variant));return{ok:kinds.has('culm stack')&&kinds.has('drying rack')&&kinds.has('lean-to')&&kinds.has('hearth')&&kinds.has('camp'),detail:recs.length+' records tagged for Dilihan: '+[...kinds].join(', ')};},
 // the read-in trees are only the ones the plan names for this ring
 ring(names){const allow=new Set(STAGE.nwAllow||[]),deny=names.filter(n=>CUT.warpDenied&&CUT.warpDenied(n));return{ok:!deny.length,detail:deny.length?'not this ring\'s: '+deny.join(', '):names.length+' read-in trees named, all of this ring'};},
 // every native is tagged with its harvest and the kit's tags
 tagged(SP){const miss=SP.filter(S=>!S.tags||!S.tags.harvest||!S.tags.climate).map(S=>S.key);return{ok:!miss.length,detail:miss.length?'untagged: '+miss.join(', '):SP.length+' natives tagged (climate, aridity, abyssal, riparian, harvest)'};}};
const treeNames=()=>REG.filter(r=>r.kind==='tree').map(r=>r.name);
const culmRecs=()=>(CUT.PLANTS?CUT.PLANTS.groves:[]).flatMap(G=>G.culms);
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=CUT.PLANTS||{groves:[]},st=window._cut||{};
 if(STAGE.groves!==false){add('culms combed along the field',HCHK.combed(culmRecs()));add('a grove\'s nodes on one set of levels',HCHK.nodes(P.groves));}
 add('the warp\'s bites, echoes and size steps',HCHK.warped(st,CUT.WARPED));add('the camp tagged for Dilihan\'s kit',HCHK.camp(BIO.tagReg()));
 add('the read-in trees are this ring\'s',HCHK.ring(treeNames()));add('the trees keep out of the water the eye sees (WATER.edgeAudit)',edgeCheck(readInTrees()));
 add('the lake draws no breakers (still water)',{ok:!LAKE_WATER||!!(LAKE_WATER.drawOpt&&LAKE_WATER.drawOpt.breakers===false&&LAKE_WATER.drawOpt.surf===false),detail:LAKE_DRAW?'surf and breakers off on the lake':'no lake on this station'});
 add('the reflections off at load (WATER.mirrorSwitch)',{ok:!MIRROR||MIRROR.mode()==='off'||/mirror=/.test(location.search),detail:MIRROR?'mode '+MIRROR.mode():'no still on this station'});add('the natives tagged',HCHK.tagged(CUT.SPECIES));
 if(STAGE.checks)STAGE.checks(add);return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=CUT.PLANTS||{groves:[]};
 if(STAGE.groves!==false){add('culms standing straight up',HCHK.combed(culmRecs().map(c=>Object.assign({},c,{m:[1,0,0,0,1,0,0,0,1]}))));
  add('a grove with one culm a metre off its levels',HCHK.nodes(P.groves.slice(0,1).map(G=>Object.assign({},G,{culms:G.culms.map((c,i)=>i?c:Object.assign({},c,{y:c.y+1}))}))));}
 if(CUT.field(...STAGE.toBowl(0,0)).s>=.2)add('no bites and no echoes',HCHK.warped({bitten:0,echoes:0},{trees:1,stepped:0,bites:0}));   /* where the warp is under .2 nothing is asked of it */
 if(STAGE.camp)add('a camp with no tags',HCHK.camp({query:()=>[]}));
 add('a meranti on the page',HCHK.ring(['Sky meranti'].concat(treeNames())));
 if(waterSurfaces().length&&WATER.edgeAudit){const w=LAKE_DRAW?[-STAGE.up[0]*600,-STAGE.up[1]*600]:STAGE.pool?[STAGE.pool.poly.reduce((a,p)=>a+p[0],0)/STAGE.pool.poly.length,STAGE.pool.poly.reduce((a,p)=>a+p[1],0)/STAGE.pool.poly.length]:null;
  if(w)add('a tree in the middle of the water',edgeCheck([{x:w[0],z:w[1],name:'test tree'}]));}
 add('a native with no harvest',HCHK.tagged(CUT.SPECIES.map((S,i)=>i?S:Object.assign({},S,{tags:{climate:S.tags.climate}}))));
 if(STAGE.negatives)STAGE.negatives(add);return R;}
// ---------------------------------------------------------------- the water the eye sees (the final rebuild, pair 10)
// THE TREES KEEP OUT OF IT (core/water ext/60 and 57: WATER.fields and edgeAudit; the review's third line): the shore of the lake, the creek and a station's
// pool baked at 8 m over the page, and no read-in tree's foot inside it (the plants a kit marks aquatic, standing at the water's own edge, excepted)
let WATER_F=null;
const waterSurfaces=()=>[LAKE_WATER,CREEK_FLOW,POOL_STILL].filter(Boolean);
function edgeCheck(trees){if(!WATER.fields||!WATER.edgeAudit)return{ok:true,detail:'not on this page (core/water ext/60)'};if(!waterSurfaces().length)return{ok:true,detail:'no water on this station'};
 const S=TERR.R*1.1;if(!WATER_F)WATER_F=WATER.fields({box:[-S,-S,S,S],cell:8,ground:terrainH,surfaces:waterSurfaces()});
 const P=trees.map(T=>({x:T.x,z:T.z,r:0,name:T.name||'tree',aquatic:!!T.aquatic}));const F=WATER.edgeAudit({field:WATER_F,plants:P,clear:0}),bad=F.filter(f=>f.rule==='plant-in-water');
 return{ok:!bad.length,detail:P.length+' read-in trees against the water\'s own shore; '+bad.length+' standing in it'+(bad.length?' (first at '+[bad[0].x,bad[0].z].map(v=>Math.round(v||0)).join(',')+')':'')};}
const readInTrees=()=>[].concat(typeof NWLOW!=='undefined'&&NWLOW.TREES&&window._nwlow?NWLOW.TREES.map(T=>({x:T.x,z:T.z,name:NWLOW.SPECIES[T.sp]&&NWLOW.SPECIES[T.sp].key,aquatic:T.y0<.4})):[],
 typeof NHL!=='undefined'&&NHL.TREES&&window._nhl?NHL.TREES.map(T=>({x:T.x,z:T.z,name:NHL.SPECIES[T.sp]&&NHL.SPECIES[T.sp].key})):[]).filter(T=>!(CUT.warpDenied&&T.name&&CUT.warpDenied(T.name)));
// THE REFLECTIONS SWITCH (core/water ext/58, WATER.mirrorSwitch; the owner, 2026-11-01: every biome gets it, OFF at page load, for the tri counts): the land in
// the lake (station 1: the near and far surfaces, at the lake's level, centred a kilometre out) or in a station's still pool. ?mirror=probe|live asks at load
const MIRROR=(function(){if(!WATER.mirrorSwitch)return null;const tree=o=>/impTrees|imp/i.test(o.name||'');
 if(LAKE_DRAW){const c=[-STAGE.up[0]*1000,-STAGE.up[1]*1000];return WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[LAKE_DRAW.mesh.material].concat(FAR_DRAW?[FAR_DRAW.mesh.material]:[]),
  level:WATER_LEVEL,center:c,radius:1000,far:6000,tree,hour:()=>ATMOS.clock?ATMOS.clock.hour:0});}
 if(POOL_DRAW&&POOL_DRAW.mesh&&STAGE.pool){const P=STAGE.pool.poly,cx=P.reduce((a,p)=>a+p[0],0)/P.length,cz=P.reduce((a,p)=>a+p[1],0)/P.length,r=Math.max(...P.map(p=>Math.hypot(p[0]-cx,p[1]-cz)));
  return WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[POOL_DRAW.mesh.material],level:STAGE.pool.level,center:[cx,cz],radius:r,far:1500,tree,hour:()=>ATMOS.clock?ATMOS.clock.hour:0});}
 return null;})();window.MIRROR=MIRROR;
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(skyView,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);COMPASS.update();},'view');
KHOST.take({build:'cut-'+STAGE.key,title:STAGE.title,hint:STAGE.hint,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,start:STAGE.start||Object.keys(VIEWS)[0],
 onView:name=>{if(VIEW_HOUR[name]!=null&&KHOST.host)KHOST.host.clock.hour=VIEW_HOUR[name];},
 ticks:TICKS,clock:{hour:STAGE.hour==null?9.5:STAGE.hour},draw:()=>{if(MIRROR)MIRROR.update();SKY.render();},
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':'')+'\nwarp s '+CUT.field(...STAGE.toBowl(camera.position.x,camera.position.z)).s.toFixed(2),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'water':{match:o=>!!(o.userData&&o.userData.water)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return{rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  /* the export box: round the station's core/water record (the lake, or its pool) and out to the nearest read-in tree, so it holds
     items, buckets and water alike */
  get exportBox(){const P=STAGE.pool&&STAGE.pool.poly;if(!P)return[-200,-200,200,200];const xs=P.map(p=>p[0]),zs=P.map(p=>p[1]),cx=(Math.min(...xs)+Math.max(...xs))/2,cz=(Math.min(...zs)+Math.max(...zs))/2;
   let t=null,d=1e9;for(const r of REG)if(r.kind==='tree'){const e=Math.hypot(r.x-cx,r.z-cz);if(e<d){d=e;t=r;}}if(t){xs.push(t.x);zs.push(t.z);}
   return[Math.min(...xs)-40,Math.min(...zs)-40,Math.max(...xs)+40,Math.max(...zs)+40].map(Math.round);},
  biome:()=>window._cut,cut:()=>({warped:CUT.WARPED,plants:CUT.PLANTS?{groves:CUT.PLANTS.groves.length,reeds:CUT.PLANTS.reeds.length,rank:CUT.PLANTS.rank.length,melons:CUT.PLANTS.melons.length,lichen:CUT.PLANTS.lichen.length}:null,site:STAGE.site,s:CUT.field(...STAGE.toBowl(0,0)).s})}});
