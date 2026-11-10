// ================================================================= HOST — the bench's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says what the page has.
// Heights in the views are above the ground.
const V=(cx,cz,cy,tx,tz,ty)=>[cx,terrainH(cx,cz)+cy,cz,tx,terrainH(tx,tz)+ty,tz];
const nearestTree=(sp,x,z,ea,pred)=>{let b=null,bd=1e18;for(const T of ABSAV.TREES){if(ea?!(T.ea&&T.sp===sp):(T.ea||T.sp!==sp))continue;if(T.lv!==2)continue;if(pred&&!pred(T))continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};
const nearestEb=(sp,x,z)=>{let b=null,bd=1e18;for(const T of (ABSAV.EBTREES||[])){if(T.sp!==sp||T.lv!==2)continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};
const nearestKopje=(x,z)=>KOPJES.reduce((b,k)=>!b||Math.hypot(k.x-x,k.z-z)<Math.hypot(b.x-x,b.z-z)?k:b,null);
function burnSpot(age,x0,z0){for(let r=0;r<2400;r+=60)for(let a=0;a<12;a++){const x=x0+Math.cos(a/12*TAU)*r,z=z0+Math.sin(a/12*TAU)*r;
  if(inMap(x,z)&&ABSAV.burn(x,z)===age){const Z=ABSAV.zones(x,z);if(Z.steppe>.6&&faceK(x,z)<.2)return[x,z];}}return[x0,z0];}
const VIEWS={
 'The cliffs from below':V(-2700,300,3,rimX(150)-120,150,300),
 'Along the rim':V(rimX(-1900)+70,-1900,4,rimX(700)+20,700,0),
 'Over the edge':V(rimX(-500)+6,-500,14,-3200,-300,0),
 'The middle ravine':V(CH.mouth[0]-260,CH.mouth[1]+90,8,RAV.x,RAV.z,40),
 'The bench':V(-350,-1500,2,900,-400,3),
 'Stub lycopsids':(function(){const T=nearestTree(2,300,-600);if(!T)return V(300,-600,2,400,-600,1);return V(T.x-13,T.z-9,4.6,T.x+4,T.z+3,1.2);})(),   /* above the colony's poles (to 3.6 m): the eye stands clear of them */
 'A kopje':(function(){const k=nearestKopje(300,0);return V(k.x-k.r*2.4,k.z+k.r*1.5,4,k.x,k.z,k.h*.7);})(),
 'The relay ramp':V(1050,120,5,2600,-60,170),
 'The fault scarps':V(950,-1750,3,1650,-1900,140),
 'Pinyon and juniper':(function(){const T=nearestEb(0,2600,-1200);if(!T)return V(2600,-1200,3,2700,-1200,6);return V(T.x-T.H*2.2,T.z+T.H*1.3,2,T.x,T.z,T.H*.5);})(),
 'The sag pond':V(SAG.x-170,SAG.z+100,5,SAG.x,SAG.z,0),
 'The jungle at the foot':(function(){const T=nearestTree(2,-2900,300,true)||nearestTree(3,-2700,300,true);if(!T)return V(-2900,300,3,-2700,300,10);return V(T.x+60,T.z+30,3,T.x,T.z,T.H*.5);})(),
 'A fresh burn':(function(){const p=burnSpot(0,300,-200);return V(p[0]-30,p[1]-22,7,p[0]+25,p[1]+18,0);})(),
 'The climb from above':V(-4300,2700,720,700,-300,0)};
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>2000)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 const S=best&&(ABSAV.SPECIES.find(s=>s.name===best.name)||(typeof EASTABYSS!=='undefined'&&EASTABYSS.SPECIES.find(s=>s.name===best.name))||(typeof EBADLANDS!=='undefined'&&EBADLANDS.SPECIES.find(s=>s.name===best.name))),hv=S&&S.tags.harvest;
 const inMapP=inMap(p.x,p.z),age=inMapP?ABSAV.burn(p.x,p.z):null,part=inMapP?(KRELIEF.at(SCARP,p.x,p.z)||KRELIEF.at(RELAY,p.x,p.z)):null;
 return name+(hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')
  +(part?'\nthe land: '+part.part:'')+(age!=null?'\nburn: '+(age===12?'does not burn (gallery or rock)':age===0?'this year':age+' years ago'):'')
  +'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  ('+(p.y+SITE.y0abs).toFixed(0)+' m on the model, '+atmAt(p.y).toFixed(2)+' atm)  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the page's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:13500000,calls:320},   /* 12.8M at the opening view on the GPU (2026-11-09): the steppe floor 6.2M is the bench edge to edge */
 cls:{pass:7000000,host:1800000},
 type:{'absav/trees':'pass','absav/floor':'pass','ebadlands/trees':'pass','host':'host'}};
const FRUIT_NOT_DRAWN=['umbrella','tongue','stub','embercycad','kopjefig','saltbush'];
const zoneOf=T=>ABSAV.zones(T.x,T.z);
const allTrees=()=>ABSAV.TREES.concat(ABSAV.EBTREES||[]);
// The page's own checks, each with a broken input that must fail.
const HCHK={
 tags(L){const bad=L.filter(S=>!S.tags||!S.tags.climate||!S.tags.aridity||S.tags.abyssal==null||!S.tags.riparian||!S.tags.harvest).map(S=>S.key);
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged (climate, aridity, abyssal, riparian, harvest); edible, no catalog piece: '+FRUIT_NOT_DRAWN.join(', ')};},
 zoned(TREES){const need={0:Z=>Z.parkland+Z.steppe+Z.foot,1:Z=>Z.gallery+Z.parkland+Z.foot,2:Z=>Z.steppe,3:Z=>Z.scarp+Z.parkland,4:Z=>1};let bad=0,n=0,first='';
  for(const T of TREES){if(T.ea||T.eb)continue;n++;const Z=zoneOf(T);if(!(need[T.sp](Z)>.02)){bad++;if(!first)first=ABSAV.SPECIES[T.sp].key+' at '+T.x.toFixed(0)+','+T.z.toFixed(0);}}
  return{ok:n>100&&!bad,detail:n+' savannah trees, '+bad+' out of their zones'+(first?' (first: '+first+')':'')};},
 // the jungle below is the eastern abyss's, read in place: it climbs the slope and the ravines but not onto the bench
 jungle(TREES){const E=TREES.filter(T=>T.ea),hi=E.filter(T=>T.x>rimX(T.z)+40);
  return{ok:E.length>50&&hi.length<=E.length*.05,detail:E.length+' eastern abyss trees (read in place), '+hi.length+' up on the bench'};},
 // the plateau's flora is ebadlands', read in place: on the fault blocks, the ramp and the rim, not below the cliffs
 plateau(EB){const lo=EB.filter(T=>T.x<rimX(T.z)-30),on=EB.filter(T=>plateauK(T.x,T.z)>.5||rimK(T.x,T.z)>.2),k={};EB.forEach(T=>{k[T.sp]=(k[T.sp]||0)+1;});
  return{ok:EB.length>=150&&!lo.length&&on.length>=EB.length*.7&&k[0]>0&&k[1]>0&&k[10]>0,detail:EB.length+' ebadlands trees (pinyon '+(k[0]||0)+', juniper '+(k[1]||0)+', yucca '+(k[10]||0)+'), '+on.length+' on the blocks or the rim, '+lo.length+' below the cliffs'};},
 // nothing stands on a sheer face (the drawn ground over a slope of 1.1: 48 degrees)
 faces(TREES){const bad=TREES.filter(T=>slopeAt(T.x,T.z)>1.1);
  return{ok:bad.length<=Math.max(2,TREES.length*.0005),detail:bad.length+' of '+TREES.length+' trees on a face over 48 degrees'+(bad[0]?' (first at '+bad[0].x.toFixed(0)+','+bad[0].z.toFixed(0)+')':'')};},
 // the cliffs stand (360 m over the run, at three sections) and the faults step with a ramp between them
 land(h){const cl=[-1500,0,1500].map(z=>h(rimX(z)+30,z)-h(rimX(z)-SCARP.run-40,z)),north=h(1700,-1900)-h(1380,-1900),south=h(2420,1900)-h(2080,1900),ramp=KRELIEF.at(RELAY,1900,0);
  return{ok:cl.every(d=>d>280)&&north>100&&south>100&&!!ramp,detail:'the cliffs '+cl.map(d=>d.toFixed(0)).join(', ')+' m; the north fault '+north.toFixed(0)+' m, the south '+south.toFixed(0)+' m; at 1900,0 '+(ramp?ramp.part:'none')};},
 dry(TREES){const wet=TREES.filter(T=>BIO.depth(T.x,T.z)>-.25);return{ok:!wet.length,detail:wet.length?wet.length+' trees in water':'no tree in the water ('+TREES.length+')'};},
 burn(F,ages){const miss=[0,1,2,3,8].filter(a=>!ages[a]);return{ok:!miss.length&&F.charred>0&&F.lilies>0,detail:'patch ages seen '+Object.keys(ages).join(',')+'; charred '+F.charred+', ember lilies '+F.lilies};}};
function burnAges(){const o={};for(let z=-TERR.Z+100;z<TERR.Z;z+=200)for(let x=-TERR.X+100;x<TERR.X;x+=200){const a=ABSAV.burn(x,z);o[a<4?a:8]=1;}return o;}
const EDGE_OWED={plant:0,wet:0};
function edgeCheck(){const P=[];for(const T of allTrees()){P.push({x:T.x,z:T.z,r:Math.min(T.rb==null?.4:T.rb,.6),name:T.ea?'ea':T.eb?'eb':ABSAV.SPECIES[T.sp].key});if(P.length>8000)break;}
 const bad=BIO.envCheck(ENV,[[0,0],[CH.head[0],CH.head[1]],[SAG.x,SAG.z],[CH.mouth[0],CH.mouth[1]]]),F=WATER.edgeAudit({field:WATER_F,plants:P,wet:WET_SHORE,band:4,clear:0}),N={};F.forEach(f=>{N[f.rule]=(N[f.rule]||0)+1;});
 return{ok:!bad.length&&(N['plant-in-water']||0)<=EDGE_OWED.plant&&(N['wet-short']||0)<=EDGE_OWED.wet,detail:(bad.length?'env: '+JSON.stringify(bad).slice(0,200)+'; ':'')+P.length+' trees, '+JSON.stringify(N)+' (owed '+JSON.stringify(EDGE_OWED)+')'+(F.length?'; first: '+JSON.stringify(F[0]).slice(0,240):'')};}
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),T=ABSAV.TREES,F=(window._biome||{}).floor||{};
 add('species tagged',HCHK.tags(ABSAV.SPECIES.concat(ABSAV.PLANTS)));
 add('savannah trees in their zones',HCHK.zoned(T));
 add('the eastern abyss jungle below the cliffs',HCHK.jungle(T));
 add('ebadlands\' pinyon, juniper and yucca on the plateau\'s blocks',HCHK.plateau(ABSAV.EBTREES||[]));
 add('nothing on the cliffs\' faces',HCHK.faces(allTrees()));
 add('the cliffs and the faulted climb (KRELIEF.scarp, KRELIEF.relay)',HCHK.land(terrainH));
 add('no tree in the water',HCHK.dry(allTrees()));
 add('the burn mosaic',HCHK.burn(F,burnAges()));
 add('the flora and the wet band read the shore of the water (BIO.envCheck, WATER.edgeAudit)',edgeCheck());
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),T=ABSAV.TREES,F=(window._biome||{}).floor||{},EB=ABSAV.EBTREES||[];
 add('a species with no harvest tag',HCHK.tags(ABSAV.SPECIES.map(S=>S.key==='stub'?Object.assign({},S,{tags:{climate:'tropic'}}):S)));
 add('a stub lycopsid at the cliffs\' foot',HCHK.zoned(T.concat([{sp:2,x:-3000,z:300,ea:false}])));
 add('the jungle read in place, carried up onto the bench',HCHK.jungle(T.map(t=>t.ea?Object.assign({},t,{x:400}):t)));
 add('a pinyon on the floor below the cliffs',HCHK.plateau(EB.concat([{sp:0,x:-2800,z:0,eb:true}])));
 add('trees on the cliffs\' face',HCHK.faces(allTrees().concat(Array.from({length:60},(v,i)=>{const z=-2360+i*80;return{x:rimX(z)-SCARP.run*.35,z};}))));
 add('the cliffs flattened',HCHK.land((x,z)=>baseH(x,z)));
 add('a tree in the sag pond',HCHK.dry(allTrees().concat([{x:SAG.x,z:SAG.z}])));
 add('no ember lilies drawn',HCHK.burn(Object.assign({},F,{lilies:0}),burnAges()));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
const PAGE_HOUR=14;
KHOST.on(skyView,'view');   /* the shared sky, its lights and fog at the hour (89s-host-sky.js) */
/* the land in the sag pond (core/water/ext/58): off at page load; the panel's button or ?mirror=probe|live turns it on */
const MIRROR=WATER.mirrorSwitch?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[SAG_DRAW.mesh.material],
 level:SAG.level,center:[SAG.x,SAG.z],radius:SAG.r*3,far:2400,tree:o=>o.name==='biome:impTrees',hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;
KHOST.take({build:'abyssal-savannah-bench',title:'Krator biome — the abyssal savannah: the bench\'s edge',
 hint:'The abyssal savannah, station 3: the bench\'s edge (scale model px 1038,414, map 5.1; -280 m, 1.66 atm), the rim breaking as cliffs, the bench steppe and the faulted climb into ebadlands\' pinyon-juniper country',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:PAGE_HOUR},draw:MIRROR?()=>{MIRROR.update();SKY.render();}:()=>SKY.render(),
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome}});
