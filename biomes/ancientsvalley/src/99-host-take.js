// ================================================================= HOST — the station's views, inspector words and checks, handed to core/host
// [web] The camera, the loop, the panel and window._api are core/host's (core/host/README.md); this fragment says what the page has. The
// views are the station's (STAGE.views(), made after the build). The kit's own checks run under verify.py --assert, each with a broken
// input that must fail (hostNegatives): the brief's rule first (PLAN.md section 1: the hand of man in every view).
const VIEWS=(function(){const V=STAGE.views?STAGE.views():{},out={};for(const k in V)out[k]=V[k].cam||V[k];return out;})();
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-3&&p.y<=(r.y||0)+(r.h||40)+5){if(!best||r.r<best.r)best=r;}}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=lab==='ground'?STAGE.floorLabel(p.x,p.z,p.y):isItem?lab+(best?'  (in '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 const F=STAGE.F,fe=F.feral(p.x,p.z),ta=F.taint(p.x,p.z),sc=F.scar(p.x,p.z),de=F.density(p.x,p.z);
 return name+'\nzone '+F.zone(p.x,p.z)+' · density '+de.toFixed(2)+' · feral '+fe.toFixed(2)+' · taint '+ta.toFixed(2)+(sc>0?' · scar '+sc.toFixed(2):'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  ('+(p.y+STAGE.base).toFixed(0)+' m)  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets
const BUDGET={showcase:{tris:STAGE.budgetTris||9000000,calls:STAGE.budgetCalls||700,rendered:7500000},
 cls:{pass:7000000,host:1200000},
 type:{'lowlands/trees':'pass','lowlands/floor':'pass','nwlow/trees':'pass','nwlow/floor':'pass','host':'host'}};
// ---------------------------------------------------------------- the kit's own checks (verify.py --assert)
const HCHK={
 // the brief's rule: from every view's eye, an artificial structure stands within 1.5 km in the direction looked (a tower's or a line's record)
 handOfMan(views,recs){const bad=[];for(const k in views){const v=views[k],dx=v[3]-v[0],dz=v[5]-v[2],l=Math.hypot(dx,dz)||1,fx=dx/l,fz=dz/l;
   const ok=recs.some(r=>(r.kind==='tower'||r.kind==='line')&&(()=>{const ex=r.x-v[0],ez=r.z-v[2],d=Math.hypot(ex,ez);return d<Math.max(1500,r.r)&&(ex*fx+ez*fz)/Math.max(d,1)>.2||d<r.r;})());
   if(!ok)bad.push(k);}return{ok:!bad.length,detail:bad.length?'no structure ahead in: '+bad.join('; '):Object.keys(views).length+' views, each with a structure in reach ahead'};},
 // every tower stands on dry ground on its plinth (the drowned city is the lake's and comes later), and none on dead ground
 standing(T){let wet=0,dead=0;for(const t of T){if(t.y<STAGE.lakeY+1.5)wet++;if(STAGE.F.scar(t.x,t.z)>.5)dead++;}return{ok:T.length>60&&!wet&&!dead,detail:T.length+' towers; '+wet+' under the lake, '+dead+' on dead ground'};},
 // the ruin share (PLAN-ANOMALIES.md 13; the owner, 2026-11-04: far too intact at first): intact towers 5-15% of the plan, and under half standing tall at all
 ruinShare(T){const n=T.length,i=T.filter(t=>t.state==='intact').length,tall=T.filter(t=>t.state==='intact'||t.state==='gutted'||t.state==='crown').length,f=i/Math.max(n,1);return{ok:n>60&&f>=.02&&f<=.15&&tall/Math.max(n,1)<.35,detail:Math.round(f*100)+'% intact, '+Math.round(tall/Math.max(n,1)*100)+'% standing tall of '+n};},
 // the war damage on the ground: the craters are there, each a scar with nothing standing in it
 craters(C,T){let inside=0;for(const t of T)for(const c of C)if(Math.hypot(t.x-c.x,t.z-c.z)<c.r)inside++;return{ok:C.length>=8&&!inside,detail:C.length+' craters, '+inside+' towers standing in one'};},
 // the forest went feral: the read-in trees were grown, and the taint's tint reached the baked foliage
 feral(W,tinted){return{ok:W.trees>50&&W.grown>20&&tinted>0,detail:W.trees+' read-in trees wrapped, '+W.grown+' grown, '+W.floor+' floor plants grown, '+W.dropped+' not this station\'s; '+tinted+' materials tinted'};},
 // no tree stands on a street, a plinth or dead ground
 // (the kits decide a foot on the mask's probability, so a tree can land where the mask is half: two in a hundred is the allowance)
 clear(recs){let bad=0,n=0;for(const r of recs){if(r.kind!=='tree')continue;n++;if(STAGE.street(r.x,r.z)>.8||STAGE.built(r.x,r.z)>.8||STAGE.F.scar(r.x,r.z)>.8)bad++;}return{ok:n>50&&bad<=n*.02,detail:n+' trees, '+bad+' on a street, a plinth or a scar'};},
 // the lines: the viaduct's deck never dips under the lake and every pier reaches the ground
 lines(V){let low=0,short=0;for(const d of V.decks)if(d.y<STAGE.lakeY+20)low++;for(const p of V.piers)if(p.y1-p.y0<2)short++;return{ok:V.decks.length>50&&!low&&!short,detail:V.decks.length+' decks, '+V.piers.length+' piers; '+low+' low, '+short+' short'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),T=STAGE.plan.towers;
 add('the hand of man in every view',HCHK.handOfMan(VIEWS,REG));add('the towers stand on dry ground',HCHK.standing(T));add('10-15% of the towers stand to full height',HCHK.ruinShare(T));
 add('the forest is feral and tinted',HCHK.feral(AV.FERAL,window._tinted||0));add('no tree on a street, a plinth or a scar',HCHK.clear(REG));add('the viaduct stands',HCHK.lines(AV_LINES.V));
 add('the craters are struck and empty',HCHK.craters(STAGE.craters,T));
 if(STAGE.checks)STAGE.checks(add);return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),T=STAGE.plan.towers;
 add('a view with nothing built anywhere',HCHK.handOfMan({x:[0,30,0,0,30,-100000]},REG.filter(r=>r.kind!=='line'&&r.kind!=='tower')));
 add('a tower under the lake',HCHK.standing(T.slice(0,80).map((t,i)=>i?t:Object.assign({},t,{y:STAGE.lakeY-5}))));
 add('every tower intact',HCHK.ruinShare(T.map(t=>Object.assign({},t,{state:'intact'}))));
 add('no tree grown',HCHK.feral({trees:AV.FERAL.trees,grown:0,floor:0,dropped:0},window._tinted||0));
 add('a tenth of the trees on the plinths',HCHK.clear(REG.filter(r=>r.kind==='tree').map((r,i)=>i%10?r:Object.assign({},r,{x:STAGE.plan.towers[0].x,z:STAGE.plan.towers[0].z}))));
 add('a deck under the water',HCHK.lines({decks:AV_LINES.V.decks.map((d,i)=>i?d:Object.assign({},d,{y:STAGE.lakeY})),piers:AV_LINES.V.piers}));
 add('a tower in a crater',HCHK.craters(STAGE.craters,T.concat([{x:STAGE.craters[0].x,z:STAGE.craters[0].z}])));
 if(STAGE.negatives)STAGE.negatives(add);return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(skyView,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.take({build:'ancientsvalley-'+STAGE.key,title:STAGE.title,hint:STAGE.hint,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,start:STAGE.start||Object.keys(VIEWS)[0],
 ticks:TICKS,clock:{hour:STAGE.hour==null?9.5:STAGE.hour},draw:()=>SKY.render(),
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':'')+(AVC.ready?'\ntowers '+AVC.towers.length+(AVC.tierN?': heroes '+AVC.tierN.heroes+', shells '+AVC.tierN.shells+', impostors '+AVC.tierN.impostors:'')+'\nshell bake '+AVC.bakeMs+' ms, all '+AVC.bakeAllMs+' ms':'\nbaking the towers'),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'water':{match:o=>!!(o.userData&&o.userData.water)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return{rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  get exportBox(){return[-300,-300,300,300];},
  biome:()=>({sw:window._swlow,nw:window._nwlow}),valley:()=>({feral:AV.FERAL,tinted:window._tinted,towers:STAGE.plan.towers.length,tier:AVC.tierN,bakeMs:AVC.bakeMs,bakeAllMs:AVC.bakeAllMs,imp:AVC.impN,site:STAGE.px,base:STAGE.base,lakeY:STAGE.lakeY})}});
