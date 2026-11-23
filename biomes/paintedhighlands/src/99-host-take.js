// ================================================================= HOST — the station's views, inspector words, season and probe checks, handed to core/host
const gh=(x,z,dy)=>terrainH(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const UV=(u,v)=>[NRM[0]*u+PAINTED_STRIKE[0]*v,NRM[1]*u+PAINTED_STRIKE[1]*v];
const VIEWS=(function(){const S=SITE;
 if(SKEY==='stripes'){const us=S.scarp.u,rim=UV(us-60,-300),core=UV(1500,200),WP=L.WADI.pts.slice().sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))[0],wi=L.WADI.pts.indexOf(WP),W2=L.WADI.pts[Math.min(L.WADI.pts.length-1,wi+6)],wash=[WP.x,WP.z],wash2=[W2.x,W2.z],f=STACKS[0]||{x:0,z:0,top:0,y0:0},hill=UV(1700,-900);
  return{'The scarp over the painted hills':look(rim[0],rim[1],8,core[0],core[1],0),'The banded hills':look(hill[0],hill[1],20,hill[0]+180,hill[1]+60,0),
   'The bloom in the wash':[wash[0],WP.y+1.7,wash[1],wash2[0],W2.y+.5,wash2[1]],'A danxia fin':look(f.x-70,f.z+40,4,f.x,f.z,(f.top-f.y0)*.5),
   'The dip slope':look(UV(-1800,600)[0],UV(-1800,600)[1],3,UV(200,-400)[0],UV(200,-400)[1],10),'From afar':look(UV(2400,-1700)[0],UV(2400,-1700)[1],200,UV(200,300)[0],UV(200,300)[1],40)};}
 if(SKEY==='bloom'){const P=S.playa,c=S.circles[0];return{'The bloom flats':look(P.x-P.rx*.9,P.z+P.rz*.5,6,P.x+300,P.z-100,0),'In the drifts':look(P.x-200,P.z+180,1.6,P.x+60,P.z,0),
  'The banded scarp over the playa':look(P.x,P.z-200,3,UV(S.scarp.u,-200)[0],UV(S.scarp.u,-200)[1],40),'A stone circle':look(c[0]+c[2]*2.2,c[1]+c[2]*1.6,3,c[0],c[1],0),
  'The pigment pit':look(S.pit.x+60,S.pit.z-40,8,S.pit.x,S.pit.z,-3),'From afar':look(P.x+2300,P.z-2200,220,P.x,P.z,0)};}
 if(SKEY==='canyon'){const K=S.canyon,cz=L.cz;
  /* the lip on a side (-1 north, +1 south): the first point out from the axis where the land stands within 4 m of the rim */
  const lip=(x,sd)=>{for(let a=150;a<1400;a+=6){const z=cz(x)+sd*a;if(terrainH(x,z)>=L.rimH(x,z)-4)return z+sd*8;}return cz(x)+sd*900;};
  const bz=x=>{for(let a=80;a<900;a+=4){const z=cz(x)+a;if(Math.abs(terrainH(x,z)-contactAt(x,z))<3)return z+30;}return cz(x)+300;};
  return{'The banded canyon':look(-700,lip(-700,-1),18,300,cz(300)+120,-20),'On the floor':look(-300,cz(-300)+30,1.7,400,cz(400),20),
  'The bench at the contact':look(200,bz(200),2,800,bz(800),0),'The south wall from the north rim':look(400,lip(400,-1),3,450,lip(450,1),-180),
  'Down the canyon':look(-2300,cz(-2300)-60,70,1600,cz(1600),-40),'From afar':look(-1800,lip(-1800,-1)-600,320,400,cz(400),-150)};}
 const A=SITES_CLIFF.filter(r=>r.site.kind==='cliff-alcove'),a0=A[4]||A[0]||{x:0,z:0,y:2000};
 return{'The cliff town\'s wall':look(-300,-2400,40,0,600,0),'An alcove at the seep line':[a0.x+10,a0.y+6,a0.z-110,a0.x,a0.y+6,a0.z+10],'Along a ledge':look(-1500,L.zw(-1500,1)+30,1.7,600,L.zw(600,1)+40,0),
  'Up the tiers':look(300,-1900,3,300,800,600),'The lake below the wall':look(-2300,2450,30,SITE.lake.x+SITE.lake.r*.4,SITE.lake.z,24),'From afar':look(-2300,-2500,500,0,600,200)};})();
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,item=isItem?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&(PAINTED.plantOfItem(item)||(typeof EBADLANDS!=='undefined'&&EBADLANDS.plantOfItem&&EBADLANDS.plantOfItem(item)));
 const name=PLT?PLT.name+'  ·  '+lab+(best?'  (at '+best.name+')':''):(best?best.name+'  ·  '+lab:lab),tg=PLT?PLT.tags:null;
 const bed=STRATA_DATA.at(p.x,p.y-.2,p.z),B=window._bloom||{};
 return name+'\n'+(isItem?'flora · '+SITE.name:'terrain / water')+(tg&&tg.climate?'\n'+tg.climate+' · '+tg.aridity+' · Koppen '+(tg.koppen||[]).join(' '):'')+
  (tg&&tg.harvest&&tg.harvest.note?'\n'+tg.harvest.note:'')+'\nbed: '+bed.recipe+' · '+bed.kind+' (hard '+bed.hard.toFixed(2)+')  ·  season: '+(B.stage||'?')+' (day '+(B.day==null?'?':B.day)+')'+
  (best&&best.site?'\nsite: '+best.site.kind+' · floor '+best.site.floorY+' m · '+best.site.width+' x '+best.site.depth+' m'+(best.site.seep?' · seep':'')+(best.site.ladder?' · ladder to '+best.site.ladder.to:''):'')+
  (best&&best.tags&&best.tags.hazard&&typeof KTAGS!=='undefined'&&KTAGS.hazardAt?'\n'+KTAGS.hazardAt(p.x,p.y,p.z,0):'')+
  '\nwet '+(FIELD.wet(p.x,p.z)*100|0)+'% · bare '+(FIELD.bare(p.x,p.z)*100|0)+'% · cold '+(FIELD.cold(p.x,p.z)*100|0)+'%\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
const BUDGET={showcase:{tris:10000000,calls:160},cls:{floor:5000000,trees:3000000,host:3000000},type:{'paintedhighlands/floor':'floor','paintedhighlands/trees':'trees','paintedhighlands/sites':'floor','ebadlands':'trees','host':'host'}};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
const isFlower=n=>/^biome:phfl\d/.test(n);
const HCHK={
 placed(st){const need=['grass','flowers'].concat(SKEY==='stripes'||SKEY==='canyon'?['trees']:[]).concat(SKEY==='bloom'?['stones']:[]).concat(SKEY==='cliff'?['gardens']:[]),
  v=k=>k==='trees'?(st&&st.trees?st.trees.juniper+st.trees.pinyon+st.trees.oak+st.trees.maple:0):(st&&st[k])||0,zero=need.filter(k=>!(v(k)>0));
  return{ok:!zero.length,detail:zero.length?'none: '+zero.join(', '):need.map(k=>k+' '+v(k)).join(', ')};},
 // the beds: the stack has the badland under the danxia where the plan puts them, and the ground's shader draws them (strataColor)
 strata(S,sh){const x=0,z=0,C=contactAt(x,z),lo=S.at(x,C-8,z),hi=S.at(x,C+8,z),ok=!!sh&&lo.recipe==='badland'&&hi.recipe==='danxia';
  return{ok,detail:'at the centre, 8 m under the contact ('+C.toFixed(0)+' m): '+lo.recipe+' '+lo.kind+'; 8 m over: '+hi.recipe+' '+hi.kind+(sh?'; drawn by strataColor':'; NO SHADER')};},
 // nothing rooted on a fin or in a cliff site kept bare (KMASK), nor under the water
 bare(P){P=P.filter(p=>/^biome:ph/.test(p[3])&&p[3]!=='biome:phstone')   /* the circles' stones are the site */.concat((PAINTED.TREES||[]).map(T=>[T.x,T.y0||0,T.z,'tree:'+(T.sp||'juniper')]));const bad=P.filter(p=>(KEEP_BARE&&KEEP_BARE(p[0],p[2])<=0&&!(SKEY==='cliff'&&(p[3]==='biome:phgrass'||isFlower(p[3]))))||(ON_STACK&&ON_STACK(p[0],p[2])));
  return{ok:!bad.length,detail:bad.length?bad.length+' in a bare site or on a fin (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':'the sites and the fins bare ('+P.length+' instances)'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-.6;});return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+')':'none drowned'};},
 // the drifts echo the stripes: most flowers stand on a bed that favours them (PAINTED_BLOOM.DRIFT)
 drifts(P){const F=P.filter(p=>isFlower(p[3]));if(!F.length)return{ok:false,detail:'no flowers'};let hit=0;
  F.forEach(p=>{const i=+p[3].replace('biome:phfl',''),k=BED_AT(p[0],p[1]+.1,p[2]),L2=PAINTED_BLOOM.DRIFT[k];if(L2&&L2.indexOf(i)>=0)hit++;});const r=hit/F.length;
  return{ok:r>=.55,detail:(r*100).toFixed(0)+'% of '+F.length+' flowers on a bed that favours them (55% needed)'};},
 // the calendar: each stage leads on its own day, and the page's BIO.SEASON is the calendar's dry
 calendar(){const bad=['snow','melt','bloom','seed','straw'].filter(s=>PAINTED_BLOOM.at(PAINTED_BLOOM.day(s),12).stage!==s),B=BLOOM_NOW(),sd=Math.abs(BIO.SEASON.value-B.dry);
  return{ok:!bad.length&&sd<.02,detail:(bad.length?'stages off their day: '+bad.join(', ')+'; ':'every stage on its day; ')+'now '+B.stage+', BIO.SEASON '+BIO.SEASON.value.toFixed(2)+' (dry '+B.dry.toFixed(2)+')'};},
 sites(n){const A=SITES_CLIFF.filter(r=>r.site.kind==='cliff-alcove'),seeped=A.filter(r=>r.site.seep).length,linked=A.filter(r=>r.site.ladder).length;
  const ok=SKEY==='cliff'?A.length>=n&&seeped===A.length&&linked>=A.length-4:SKEY==='canyon'?SITES_CLIFF.length>=n:true;
  return{ok,detail:SKEY==='cliff'?A.length+' alcoves ('+seeped+' with a seep, '+linked+' with a ladder up), '+SITES_CLIFF.length+' sites':SITES_CLIFF.length+' sites'};},
 // the flash flood follows its hazard record: with the cycle on the flood is drawn at its mark, idle it is gone
 flood(F){if(!F)return{ok:SKEY!=='stripes'&&SKEY!=='canyon',detail:'no flood on this station'};const c=F.rec.tags.hazard.cycle,t=F.now(),keep=c.offset;
  F.setOffset(((c.warn+c.ramp+c.on/2-t)%c.period+c.period)%c.period);F.tick();const on=F.D.mesh.visible&&F.k>.99&&KHAZ.state(F.rec,t).state==='on';
  F.setOffset(((c.period*.75-t)%c.period+c.period)%c.period);F.tick();const off=!F.D.mesh.visible&&KHAZ.state(F.rec,t).state==='idle';F.setOffset(keep);F.tick();
  return{ok:on&&off,detail:'on: drawn '+on+'; idle: hidden '+off};},
 // the cold: KHAZ's ambient temperature from the calendar; winter under the cold row's start on the plateau, summer over it
 cold(fn){if(typeof KHAZ==='undefined'||!fn)return{ok:false,detail:'no temperature provided'};const H=KHOST.host.clock,d0=H.day,h0=H.hour;
  const at=st=>{H.day=PAINTED_BLOOM.day(st)-(SKY.clock.day-H.day);H.hour=6;return fn(0,SITE.base,0,0);};const w=at('snow'),s=at('straw');H.day=d0;H.hour=h0;
  const provided=KHAZ.provided().indexOf('temperature')>=0;return{ok:provided&&w<s&&(SITE.temp.cold>2||w<0),detail:'a winter dawn '+w.toFixed(1)+' degC, an autumn dawn '+s.toFixed(1)+' degC'+(provided?'':'; NOT PROVIDED')};},
 pigment(P){if(SKEY!=='bloom')return{ok:true,detail:'no pigment works on this station'};if(!P)return{ok:false,detail:'no work camp'};
  return{ok:P.stands.length>0&&!!P.first,detail:P.stands.length+' stands on the bright beds, first pitch at '+(P.first?P.first.stand:'none')};},
 camerasOut(Cs){const bad=Cs.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):Cs.length+' cameras above the ground'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the steppe, the bloom and the trees placed',HCHK.placed(window._station));
 add('the beds: badland under danxia, drawn on the GPU',HCHK.strata(STRATA_DATA,STRATA_SH));
 add('the sites and the fins kept bare',HCHK.bare(P));
 add('nothing rooted under the water',HCHK.dry(P));
 add('the drifts echo the stripes',HCHK.drifts(P));
 add('the bloom\'s calendar on the clock',HCHK.calendar());
 add('the cliff sites as records',HCHK.sites(SKEY==='cliff'?12:SKEY==='canyon'?6:0));
 add('the flash flood drawn on its hazard record\'s cycle',HCHK.flood(FLOOD));
 add('the cold: the season\'s temperature on KHAZ',HCHK.cold(typeof PH_TEMP!=='undefined'?PH_TEMP:null));
 add('the pigment works (core/camp)',HCHK.pigment(typeof PIGMENT!=='undefined'?PIGMENT:null));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('no flowers placed',HCHK.placed(Object.assign({},window._station,{flowers:0})));
 add('a stack without its danxia',HCHK.strata({at:(x,y,z)=>({recipe:'badland',kind:'grey',hard:.1})},STRATA_SH));
 if(STACKS.length)add('a plant on a fin',HCHK.bare([[STACKS[0].x,0,STACKS[0].z,'biome:phgrass']]));
 else if(SITES_CLIFF.length)add('a sage in a cliff site',HCHK.bare([[SITES_CLIFF[0].x,0,SITES_CLIFF[0].z,'biome:phsage']]));
 {const y=terrainH(0,0),k=BED_AT(0,y+.1,0),Lk=PAINTED_BLOOM.DRIFT[k]||[],i=[0,1,2,3,4,5,6,7,8].find(i=>Lk.indexOf(i)<0);
  add('flowers on a bed that never favours them',HCHK.drifts([0,1,2,3].map(()=>[0,y,0,'biome:phfl'+i])));}
 if(FLOOD)add('a flood that never shows',HCHK.flood(Object.assign({},FLOOD,{D:{mesh:{visible:false}},tick(){}})));
 add('a summer as cold as the winter',HCHK.cold(()=>-5));
 if(SKEY==='bloom')add('a works with no stands',HCHK.pigment({stands:[],first:null}));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 if(SKEY==='cliff')add('an alcove without its seep',(()=>{const r=SITES_CLIFF.find(r=>r.site.kind==='cliff-alcove'),sv=r.site.seep;r.site.seep=null;const o=HCHK.sites(12);r.site.seep=sv;return o;})());
 return R;}
KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
// THE SEASON: a select on the bar moves the clock to a stage's day (the sky's sun follows: core/atmos's day); #day= picks any day. With none given
// the page opens in the bloom (PAINTED_BLOOM.day('bloom'))
const SEASONS=[['bloom','Spring: the bloom'],['melt','Spring: the melt'],['seed','Early summer: seed'],['straw','Late summer and autumn: straw'],['snow','Winter: snow']];
const setStage=s=>{const H=KHOST.host;if(!H||!H.clock)return;H.clock.day=PAINTED_BLOOM.day(s)-(SKY.clock.day-(H.clock.day||0));applyBloom();};
const HINT={stripes:"Station 1 of the painted highlands (scale model 5.1, px 986,635; 2,926 m, BSk, 157 mm, 1.11 atm): a hogback's danxia scarp facing east over the breached fold's core, rounded badland hills banded pink, cream, gold, grey, maroon, mauve and green-grey (KSTRATA's badland under its danxia, folded NNW-SSE), fins of red sandstone standing out on the clay, a dry wash down the strike valley with the bloom on its floor, each drift's flower the one its clay favours (ideal type)",
 bloom:"Station 2 (px 1008,626; the playa at 3,393 m, Dsb, 173 mm): the bloom flats in full spring flower after the melt, melt sheets on the clay, a banded scarp to the west, stone circles on the rim and a pigment pit (ideal type). The season select moves the year: melt, bloom, seed, straw, snow",
 canyon:"Station 3 (px 1034,615; floor 2,900 m, rims 3,253-3,411 m, BSk, 125 mm): the Painted Canyon cut through the whole column, the clay beds banded below the contact bench, the danxia cliffs stepped by their beds above; the melt stream on its floor, junipers on the ledges, the ledges kept bare for the canyon's villages (ideal type)",
 cliff:"Station 4 (px 1101,624; 2,061 m on the wall, Cfa, 862 mm): the cliff town's wall at the canyon's mouth, tiers of sandstone cliff over clay, an alcove at each seep line with its spring, ledges and talus benches, all EMPTY: core/tags site records for the settlement plan to fill (ideal type)"}[SKEY];
KHOST.take({build:'paintedhighlands'+(SKEY==='stripes'?'':'-'+SKEY),title:'Krator biome — the painted highlands: '+SITE.name,hint:HINT,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 controls:[{select:SEASONS,id:'season',on:v=>setStage(v)}].concat(FLOOD?[{button:'Flash flood',title:'the flood comes now (its warning first): the hazard record\'s cycle',on:()=>FLOOD.trigger()}]:[]),
 inspect:describe,stats:()=>'inst '+window._instances+' · '+(window._bloom?window._bloom.stage:''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export(),sites:()=>({format:'krator-sites',version:0,station:SKEY,note:'the cliff sites, kept bare for the settlement plan (PLAN.md section 5a)',sites:SITES_CLIFF.map(r=>Object.assign({x:r.x,y:r.y,z:r.z,name:r.name},r.site)),pigmentWorks:PIGMENT?{camp:PIGMENT.W,first:PIGMENT.first,beds:PIGMENT.beds}:null,mask:KMASK.export(BARE_MASK.mv)}),
  fauna:()=>({format:'krator-fauna-places',version:0,note:'kits/fauna keys and where they live (PLAN.md section 4)',fauna:PAINTED_FAUNA}),
  bloom:()=>({format:'krator-bloom',version:0,calendar:PAINTED_BLOOM.CAL,flowers:PAINTED_BLOOM.FLOWERS,drift:PAINTED_BLOOM.DRIFT,now:window._bloom})},
 minimap:{title:SITE.name},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._station,site:()=>SITE,bloom:()=>BLOOM_NOW(),setStage,sites:()=>SITES_CLIFF.map(r=>r.site),strata:()=>STRATA_DATA.export(),
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],
 exportBox:SKEY==='canyon'?[-200,L.cz(0)-200,200,L.cz(0)+200]:SKEY==='bloom'?[SITE.playa.x-500,SITE.playa.z-50,SITE.playa.x-100,SITE.playa.z+350]:SKEY==='stripes'?(()=>{const p=L.WADI.pools.filter(p=>Math.abs(p.x)<2300&&Math.abs(p.z)<2300).sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))[0]||{x:0,z:0};return[p.x-200,p.z-200,p.x+200,p.z+200];})():(()=>{const p=SEEPS[Math.floor(SEEPS.length/2)]||{x:0,z:-1100};return[p.x-150,p.z-150,p.x+150,p.z+150];})(),
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),bed:BED_AT(x,terrainH(x,z),z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
if(!/[?&#]day=/.test(location.search+location.hash))setStage('bloom');
