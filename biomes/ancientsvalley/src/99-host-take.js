// ================================================================= HOST — the station's views, inspector words and checks, handed to core/host
// [web] The camera, the loop, the panel and window._api are core/host's (core/host/README.md); this fragment says what the page has. The
// views are the station's (STAGE.views(), made after the build). The kit's own checks run under verify.py --assert, each with a broken
// input that must fail (hostNegatives): the brief's rule first (PLAN.md section 1: the hand of man in every view).
const VIEWS=(function(){const V=STAGE.views?STAGE.views():{},out={};for(const k in V)out[k]=V[k].cam||V[k];return out;})();
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y==null?0:r.y)-3&&p.y<=(r.y==null?0:r.y)+(r.h==null?40:r.h)+5){if(!best||r.r<best.r)best=r;}}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=lab==='ground'?STAGE.floorLabel(p.x,p.z,p.y):isItem?lab+(best?'  (in '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 const F=STAGE.F,fe=F.feral(p.x,p.z),ta=F.taint(p.x,p.z),sc=F.scar(p.x,p.z),de=F.density(p.x,p.z);
 return name+'\nzone '+F.zone(p.x,p.z)+' · density '+de.toFixed(2)+' · feral '+fe.toFixed(2)+' · taint '+ta.toFixed(2)+(sc>0?' · scar '+sc.toFixed(2):'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  ('+(p.y+STAGE.base).toFixed(0)+' m)  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets
const BUDGET={showcase:{tris:STAGE.budgetTris==null?9000000:STAGE.budgetTris,calls:STAGE.budgetCalls==null?700:STAGE.budgetCalls,rendered:7500000},
 cls:{pass:8000000,host:1200000},   /* the trees' pass 7 M -> 8 M on 2026-11-09: the roof perches copy a wrapped tree's span onto the ruins' tops (7.31 M on the RTX lane) */
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
 ruinShare(T){const n=T.length,i=T.filter(t=>t.state==='intact').length,tall=T.filter(t=>t.state==='intact'||t.state==='gutted'||t.state==='crown').length,f=i/Math.max(n,1);return{ok:n>60&&f>=.01&&f<=.15&&tall/Math.max(n,1)<.35,detail:Math.round(f*100)+'% intact, '+Math.round(tall/Math.max(n,1)*100)+'% standing tall of '+n};},
 // the war damage on the ground: the craters are there, each a scar with nothing standing in it
 craters(C,T){let inside=0;for(const t of T)for(const c of C)if(Math.hypot(t.x-c.x,t.z-c.z)<c.r)inside++;return{ok:C.length>=8&&!inside,detail:C.length+' craters, '+inside+' towers standing in one'};},
 // the lean: a leaning tower leans no more than 5 degrees (further and the shell's trace would leave its pad), none that stands whole or lies fallen
 lean(T){let bad=0,n=0;for(const t of T){if(t.lean){n++;if(t.lean>5.01||t.state==='intact'||t.state==='fallen')bad++;}}return{ok:n>20&&!bad,detail:n+' towers lean, '+bad+' wrongly'};},
 // the grid runs between the buildings (the owner, 2026-11-08): no plinth's centre on a street, and the street under no plinth
 grid(T){let on=0;for(const t of T)if(STAGE.streetK(t.x,t.z)>.05)on++;return{ok:T.length>60&&!on,detail:T.length+' towers, '+on+' standing on a street'};},
 lamps(L){const up=L.filter(l=>l.state==='up').length;return{ok:L.length>100&&up>L.length*.3&&up<L.length*.7,detail:L.length+' lamp standards, '+up+' standing'};},
 // the ruined vehicles (41b, 73): at least 150 records, none on a plinth or under the lake, most of those on scorched ground burnt
 wrecks(W){let plinth=0,wet=0,hot=0,burnt=0;for(const w of W){if(STAGE.built(w.x,w.z)>.5)plinth++;if(w.y<STAGE.lakeY+1)wet++;if(STAGE.scorch(w.x,w.z)>.6){hot++;if(w.state==='burnt')burnt++;}}
  return{ok:W.length>=150&&!plinth&&!wet&&(hot<8||burnt>hot*.6),detail:W.length+' wrecks, '+plinth+' on a plinth, '+wet+' under the lake; '+burnt+' of '+hot+' on scorched ground burnt'};},
 // the forest went feral: the read-in trees were grown, and the taint's tint reached the baked foliage
 feral(W,tinted){return{ok:W.trees>50&&W.grown>20&&tinted>0,detail:W.trees+' read-in trees wrapped, '+W.grown+' grown, '+W.floor+' floor plants grown, '+W.dropped+' not this station\'s; '+tinted+' materials tinted'};},
 // no tree stands on a street, a plinth or dead ground
 // (the kits decide a foot on the mask's probability, so a tree can land where the mask is half: two in a hundred is the allowance). The streets are
 // overgrown by design (the owner, 2026-11-08: a destroyed, overgrown grid), so a tree on one is counted apart and allowed to a sixth of the forest
 clear(recs){let bad=0,st=0,n=0;for(const r of recs){if(r.kind!=='tree')continue;n++;if(STAGE.built(r.x,r.z)>.8||STAGE.F.scar(r.x,r.z)>.8)bad++;else if(STAGE.street(r.x,r.z)>.8)st++;}return{ok:n>50&&bad<=n*.02&&st<=n/6,detail:n+' trees, '+bad+' on a plinth or a scar, '+st+' on a street (overgrown)'};},
 // the lines: the viaduct's deck never dips under the lake and every pier reaches the ground
 // the steam on the water, the keepers on their rounds (each round four corners on dry ground), the halves (the owner, 2026-11-08: about half
 // the dry land wild, the forest mask far denser there than in the foul half)
 steam(S){return{ok:S.banks>=20&&S.plumes>=1,detail:S.banks+' banks of mist, '+S.plumes+' plumes of steam'};},
 keepers(K){let bad=0;for(const k of K){if(!k.route||k.route.length<4)bad++;else for(const p of k.route)if(terrainH(p[0],p[1])<STAGE.lakeY+2)bad++;}return{ok:K.length>=3&&!bad,detail:K.length+' keepers on their rounds, '+bad+' faults'};},
 halves(F,forest){let n=0,hi=0,fw=0,ff=0,nw=0,nf=0;for(let x=-2900;x<=2900;x+=100)for(let z=-2900;z<=2900;z+=100){if(Math.hypot(x,z)>STAGE.R||terrainH(x,z)<STAGE.lakeY+.5)continue;n++;if(F.wild(x,z)>.5){hi++;fw+=forest(x,z);nw++;}else{ff+=forest(x,z);nf++;}}
  const s=n?hi/n:0,a=nw?fw/nw:0,b=nf?ff/nf:0;return{ok:s>.4&&s<.78&&a>b*3,detail:Math.round(s*100)+'% of the dry land wild; the forest mask '+a.toFixed(2)+' there, '+b.toFixed(2)+' in the foul half'};},
 // the overgrowth of the wild half (the owner, 2026-11-09: Midgar at the end of FF7): trees on the ruins' tops and creepers on the towers
 overgrown(F,recs,CR){let roof=0,bad=0;for(const r of recs){if(r.kind!=='rooftree')continue;roof++;if(F.wild(r.x,r.z)<.5)bad++;}const c=CR?CR.curtains:0;return{ok:roof>=60&&bad<=roof*.03&&c>=1500,detail:roof+" ruins' tops with trees ("+bad+" outside the wild half), "+c+" curtains of creeper and moss on "+(CR?CR.towers:0)+" towers"};},
 /* the transit (PLAN.md 14): the grid's junctions, the highway's ramps, the cargo line's crossings, the subway's stations, the trains; the war rising
    toward the lake (the mean damage of the streets whose nearer end is in the lakeward third against the rest) */
 /* the cards' cut-outs (the owner, 2026-11-09: "an audit of cards not getting cut out properly"): every material on the page whose map carries alpha
    (over 3% of a 32x32 read under 128) must test it (alphaTest, coverage or transparency), and no alpha test may run on a map with none; also the
    curtains' (71) and the kits' card materials by name */
 cardsCut(){const seen=new Set(),bad=[],c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');let maps=0,unread=0;
  const share=img=>{try{g.clearRect(0,0,32,32);g.drawImage(img,0,0,32,32);const d=g.getImageData(0,0,32,32).data;let lo=0;for(let i=3;i<d.length;i+=4)if(d[i]<128)lo++;return lo/1024;}catch(e){return -1;}};
  scene.traverse(o=>{if(!(o.isMesh||o.isInstancedMesh))return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(!m||seen.has(m))return;seen.add(m);const map=m.map||(m.uniforms&&m.uniforms.map&&m.uniforms.map.value);if(!map||!map.image||!map.image.width)return;maps++;
   const at=m.alphaTest!=null?m.alphaTest:(m.uniforms&&m.uniforms.alphaTest?m.uniforms.alphaTest.value:0),s=share(map.image);if(s<0||s>.98){unread++;return;}   /* a read that comes back empty (a bitmap the 2D canvas will not draw, the headless lane) is no verdict */
   if(s>.03&&!(at>0)&&!m.transparent&&!m.alphaToCoverage)bad.push((o.name||o.userData.inspectLabel||m.type)+': alpha in the map ('+Math.round(s*100)+'%), no cut');else if(s<.005&&at>0)bad.push((o.name||o.userData.inspectLabel||m.type)+': a cut on a map with no alpha');});});
  return{ok:!bad.length&&maps-unread>20,detail:maps+' mapped materials of '+seen.size+(unread?' ('+unread+' unreadable here)':'')+(bad.length?'; '+bad.slice(0,5).join('; '):'; every alpha map tested, no test without alpha')};},
 transit(T,n){if(!T)return{ok:false,detail:'no transit'};const J=T.net.junctions.length,kinds={};T.net.junctions.forEach(j=>{kinds[j.kind]=(kinds[j.kind]||0)+1;});
  const ok=J>=300&&T.highway.ramps.length>=3&&T.highway.spans.length>=80&&T.cargo.crossings.length>=8&&T.subway.stations.length>=3&&T.trains.length>=4&&(n?n.dressed>=20:true);
  return{ok,detail:J+' junctions ('+Object.keys(kinds).map(k=>kinds[k]+' '+k).join(', ')+'), the highway '+T.highway.spans.length+' spans and '+T.highway.ramps.length+' ramps, the cargo line '+T.cargo.crossings.length+' crossings, the subway '+T.subway.stations.length+' stations, '+T.trains.length+' trains, '+(n?n.dressed:0)+' streets dressed'};},
 warToLake(T){if(!T)return{ok:false,detail:'no transit'};let hi=[],lo=[];T.wars.forEach((W,i)=>{const Rd=T.net.roads[i],q0=Rd.path.at(0),q1=Rd.path.at(Rd.L),k=Math.max(T.lakeK(q0.x,q0.z),T.lakeK(q1.x,q1.z)),d=(W.damageAt(0)+W.damageAt(Rd.L*.5)+W.damageAt(Rd.L))/3;(k>.6?hi:lo).push(d);});
  const m=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0,mh=m(hi),ml=m(lo);return{ok:hi.length>=4&&lo.length>=4&&mh>ml*1.6,detail:hi.length+' lakeward streets at mean damage '+mh.toFixed(2)+', '+lo.length+' inland at '+ml.toFixed(2)};},
 lines(V){let low=0,short=0;for(const d of V.decks)if(d.y<STAGE.lakeY+20)low++;for(const p of V.piers)if(p.y1-p.y0<2)short++;return{ok:V.decks.length>50&&!low&&!short,detail:V.decks.length+' decks, '+V.piers.length+' piers; '+low+' low, '+short+' short'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),T=STAGE.plan.towers;
 add('the hand of man in every view',HCHK.handOfMan(VIEWS,REG));add('the towers stand on dry ground',HCHK.standing(T));add('10-15% of the towers stand to full height',HCHK.ruinShare(T));
 add('the forest is feral and tinted',HCHK.feral(AV.FERAL,window._tinted||0));add('no tree on a street, a plinth or a scar',HCHK.clear(REG));add('the cards are cut: every alpha map is tested',HCHK.cardsCut());
if(STAGE.transit){add('the transit stands: the grid, the highway, the lines, the subway',HCHK.transit(STAGE.transit,typeof AVTR!=='undefined'?AVTR.n:null));add('the war rises toward the lake',HCHK.warToLake(STAGE.transit));}else add('the viaduct stands',HCHK.lines(AV_LINES.V));
 add('the craters are struck and empty',HCHK.craters(STAGE.craters,T));add('the broken towers lean, a little',HCHK.lean(T));
 add('the grid runs between the buildings',HCHK.grid(T));if(!STAGE.transit)add('the avenues have their lamp standards',HCHK.lamps(AV_LAMPS));
 add('the lake steams',HCHK.steam(AV_STEAM));add('the keepers walk their rounds',HCHK.keepers(AV_KEEPERS));add('the land is half wild, half foul',HCHK.halves(STAGE.F,STAGE.forest));add('the wild half is overgrown: trees on the ruins, creepers on the towers',HCHK.overgrown(STAGE.F,REG,AV_CREEPERS));
 add('the ruined vehicles stand in the streets',HCHK.wrecks(AVW.records));
 if(STAGE.checks)STAGE.checks(add);return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),T=STAGE.plan.towers;
 add('a view with nothing built anywhere',HCHK.handOfMan({x:[0,30,0,0,30,-100000]},REG.filter(r=>r.kind!=='line'&&r.kind!=='tower')));
 add('a tower under the lake',HCHK.standing(T.slice(0,80).map((t,i)=>i?t:Object.assign({},t,{y:STAGE.lakeY-5}))));
 add('every tower intact',HCHK.ruinShare(T.map(t=>Object.assign({},t,{state:'intact'}))));
 add('no tree grown',HCHK.feral({trees:AV.FERAL.trees,grown:0,floor:0,dropped:0},window._tinted||0));
 add('a tenth of the trees on the plinths',HCHK.clear(REG.filter(r=>r.kind==='tree').map((r,i)=>i%10?r:Object.assign({},r,{x:STAGE.plan.towers[0].x,z:STAGE.plan.towers[0].z}))));
 if(STAGE.transit){add('no transit at all',HCHK.transit(null));add('the war the same everywhere',HCHK.warToLake(Object.assign({},STAGE.transit,{wars:STAGE.transit.wars.map(W=>Object.assign({},W,{damageAt:()=>.3}))})));}
 else add('a deck under the water',HCHK.lines({decks:AV_LINES.V.decks.map((d,i)=>i?d:Object.assign({},d,{y:STAGE.lakeY})),piers:AV_LINES.V.piers}));
 add('a tower in a crater',HCHK.craters(STAGE.craters,T.concat([{x:STAGE.craters[0].x,z:STAGE.craters[0].z}])));
 add('an intact tower leaning twenty degrees',HCHK.lean(T.map((t,i)=>i?t:Object.assign({},t,{lean:20,state:'intact'}))));
 add('a tower standing in an avenue',HCHK.grid(T.concat([{x:(STAGE.avenueLines()[2]||0)*STAGE.lattice.c,z:(STAGE.avenueLines()[2]||0)*STAGE.lattice.s}])));
 if(!STAGE.transit)add('every lamp standing',HCHK.lamps(AV_LAMPS.map(l=>Object.assign({},l,{state:'up'}))));
 add('no steam on the water',HCHK.steam({banks:0,plumes:0}));add('no keeper on a round',HCHK.keepers([]));
 add('the whole land wild',HCHK.halves({wild:()=>1},STAGE.forest));
 add('no tree on a ruin and no creeper',HCHK.overgrown(STAGE.F,REG.filter(r=>r.kind!=='rooftree'),{curtains:0,towers:0}));
 add('a wreck under the lake',HCHK.wrecks(AVW.records.map((w,i)=>i?w:Object.assign({},w,{y:STAGE.lakeY-3}))));
 if(STAGE.negatives)STAGE.negatives(add);return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(skyView,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.take({build:'ancientsvalley-'+STAGE.key,title:STAGE.title,hint:STAGE.hint,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,start:STAGE.start||Object.keys(VIEWS)[0],
 ticks:TICKS,clock:{hour:STAGE.hour==null?9.5:STAGE.hour},draw:()=>SKY.render(),
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':'')+(AVC.ready?'\ntowers '+AVC.towers.length+(AVC.tierN?': heroes '+AVC.tierN.heroes+', shells '+AVC.tierN.shells+', impostors '+AVC.tierN.impostors:'')+'\nshell bake '+AVC.bakeMs+' ms, all '+AVC.bakeAllMs+' ms':'\nbaking the towers')+(typeof AVW!=='undefined'&&AVW.ok?'\nwrecks '+AVW.drawn+'/'+AVW.records.length+', '+AVW.built+' looks built in '+AVW.buildMs+' ms':''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'water':{match:o=>!!(o.userData&&o.userData.water)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return{rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  get exportBox(){return[-300,-300,300,300];},
  biome:()=>({sw:window._swlow,nw:window._nwlow}),valley:()=>({feral:AV.FERAL,tinted:window._tinted,towers:STAGE.plan.towers.length,wrecks:AVW.records.length,wrecksDrawn:AVW.drawn,wreckLooks:AVW.built,tier:AVC.tierN,bakeMs:AVC.bakeMs,bakeAllMs:AVC.bakeAllMs,imp:AVC.impN,site:STAGE.px,base:STAGE.base,lakeY:STAGE.lakeY})}});
