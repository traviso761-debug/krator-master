// ================================================================= HOST — the page's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says what
// this page has. Heights in the views are above the ground.
const V=(cx,cz,cy,tx,tz,ty)=>[cx,terrainH(cx,cz)+cy,cz,tx,terrainH(tx,tz)+ty,tz];
// the nearest thing of a kind to a point, for the views that frame one (the kit's records, read after the build)
const nearestTree=(sp,x,z,ea)=>{let b=null,bd=1e18;for(const T of ABSAV.TREES){if(ea?!(T.ea&&T.sp===sp):(T.ea||T.sp!==sp))continue;if(T.lv!==2)continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};
const nearestKopje=(x,z)=>KOPJES.reduce((b,k)=>!b||Math.hypot(k.x-x,k.z-z)<Math.hypot(b.x-x,b.z-z)?k:b,null);
function burnSpot(age,x0,z0){for(let r=0;r<2400;r+=60)for(let a=0;a<12;a++){const x=x0+Math.cos(a/12*TAU)*r,z=z0+Math.sin(a/12*TAU)*r;
  if(inMap(x,z)&&ABSAV.burn(x,z)===age){const Z=ABSAV.zones(x,z);if(Z.parkland>.6)return[x,z];}}return[x0,z0];}
const VIEWS={
 'Down the slope from the bench':V(1150,150,22,-2200,0,60),
 'Up the slope from the foot':V(-2900,-200,14,600,0,260),
 'The parkland':V(-700,-350,2.2,-200,-150,8),
 'Umbrella trees':(function(){const T=nearestTree(0,-500,0);if(!T)return V(-500,0,3,-300,0,10);const a=.6;return V(T.x-Math.cos(a)*T.crownR*4.5,T.z-Math.sin(a)*T.crownR*4.5,2.5,T.x,T.z,T.H*.55);})(),
 'A kopje':(function(){const k=nearestKopje(-300,0);return V(k.x-k.r*2.2,k.z+k.r*1.4,4,k.x,k.z,k.h*.7);})(),
 'The stream gully':(function(){const G=STREAM.gully,x=-950;return V(x+120,G.zc(x+120),9,x-220,G.zc(x-220),2);})(),
 'A fresh burn':(function(){const p=burnSpot(0,-600,0);return V(p[0]-30,p[1]-22,7,p[0]+25,p[1]+18,0);})(),
 'A young burn':(function(){const p=burnSpot(2,-500,300);return V(p[0]-40,p[1]-30,1.8,p[0]+60,p[1]+40,1);})(),
 'The caprock rim':(function(){const x=RIM.face[0]-warpZ(-500)-120;return V(x,-500,3,x+330,-480,200);})(),
 'The bench and the pan':V(1500,-450,6,PAN.c[0],PAN.c[1],0),
 'Stub lycopsids':(function(){const T=nearestTree(2,1800,-200);if(!T)return V(1800,-200,2,1900,-200,1);return V(T.x-9,T.z-6,1.7,T.x+6,T.z+4,1.4);})(),
 'The jungle at the foot':(function(){const T=nearestTree(17,-2500,0,true);if(!T)return V(-2600,0,3,-2400,0,10);return V(T.x+40,T.z+25,3,T.x,T.z,T.H*.6);})(),
 'The rim slope from above':V(-3600,1800,650,600,-200,150)};
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>2000)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 const S=best&&(ABSAV.SPECIES.find(s=>s.name===best.name)||(typeof EASTABYSS!=='undefined'&&EASTABYSS.SPECIES.find(s=>s.name===best.name))),hv=S&&S.tags.harvest;
 const inMapP=inMap(p.x,p.z),age=inMapP?ABSAV.burn(p.x,p.z):null;
 return name+(hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')
  +(age!=null?'\nburn: '+(age===12?'does not burn (gallery or rock)':age===0?'this year':age+' years ago'):'')
  +'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  ('+(p.y+SITE.y0abs).toFixed(0)+' m on the model, '+atmAt(p.y).toFixed(2)+' atm)  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:9000000,calls:260},
 cls:{pass:6000000,host:1600000},
 type:{'absav/trees':'pass','absav/floor':'pass','host':'host'}};
// edible parts with no catalog piece: named, not hidden (biomes/FRUIT.md)
const FRUIT_NOT_DRAWN=['umbrella','tongue','stub','embercycad','kopjefig','saltbush'];
// The host's own checks, each with a broken input that must fail.
const HCHK={
 // every species and ground plant carries the project's tags and a harvest tag
 tags(L){const bad=L.filter(S=>!S.tags||!S.tags.climate||!S.tags.aridity||S.tags.abyssal==null||!S.tags.riparian||!S.tags.harvest).map(S=>S.key);
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged (climate, aridity, abyssal, riparian, harvest); edible, no catalog piece: '+FRUIT_NOT_DRAWN.join(', ')};},
 // each savannah tree stands in its zones: the umbrella trees on the parkland, the bench or the foot; the stubs on the bench;
 // the ember cycads on rock or the parkland; the tongue trees in the gullies, the parkland or the foot
 zoned(TREES){const need={0:Z=>Z.parkland+Z.steppe+Z.foot,1:Z=>Z.gallery+Z.parkland+Z.foot,2:Z=>Z.steppe,3:Z=>Z.scarp+Z.parkland,4:Z=>1};let bad=0,n=0,first='';
  for(const T of TREES){if(T.ea)continue;n++;const Z=ABSAV.zones(T.x,T.z);if(!(need[T.sp](Z)>.02)){bad++;if(!first)first=ABSAV.SPECIES[T.sp].key+' at '+T.x.toFixed(0)+','+T.z.toFixed(0);}}
  return{ok:n>100&&!bad,detail:n+' savannah trees, '+bad+' out of their zones'+(first?' (first: '+first+')':'')};},
 // the jungle at the foot is the eastern abyss's, read in place, and it stays low on the slope
 jungle(TREES){const E=TREES.filter(T=>T.ea),hi=E.filter(T=>BIO.field('upland',T.x,T.z)>.45);
  return{ok:E.length>50&&hi.length<=E.length*.05,detail:E.length+' eastern abyss trees (read in place), '+hi.length+' above upland .45'};},
 // nothing rooted in the water (the pools, the pan's sheet, the stream)
 dry(TREES){const wet=TREES.filter(T=>BIO.depth(T.x,T.z)>-.25);return{ok:!wet.length,detail:wet.length?wet.length+' trees in water':'no tree in the water ('+TREES.length+')'};},
 // the burn mosaic reads: every age band is on the map, and a fresh burn carries its char and its lilies
 burn(F,ages){const miss=[0,1,2,3,8].filter(a=>!ages[a]);return{ok:!miss.length&&F.charred>0&&F.lilies>0,detail:'patch ages seen '+Object.keys(ages).join(',')+'; charred '+F.charred+', ember lilies '+F.lilies};}};
function burnAges(){const o={};for(let z=-TERR.Z+100;z<TERR.Z;z+=200)for(let x=-TERR.X+100;x<TERR.X;x+=200){const a=ABSAV.burn(x,z);o[a<4?a:8]=1;}return o;}
// the flora and the ground's wet band read the water's own shore (the review's third line; oidong's lines): the env fields in the contract, no tree
// standing in the water, and the wet band wet at the water's edge (WATER.edgeAudit). EDGE_OWED: what this turn leaves (a ratchet)
const EDGE_OWED={plant:0,wet:0};
function edgeCheck(){const P=[];for(const T of ABSAV.TREES){P.push({x:T.x,z:T.z,r:Math.min(T.rb==null?.4:T.rb,.6),name:T.ea?'ea':ABSAV.SPECIES[T.sp].key});if(P.length>8000)break;}
 const G=STREAM.gully,bad=BIO.envCheck(ENV,[[0,0],[-1500,G.zc(-1500)],[PAN.c[0],PAN.c[1]],[-2780,G.zc(-2780)]]),F=WATER.edgeAudit({field:WATER_F,plants:P,wet:WET_SHORE,band:4,clear:0}),N={};F.forEach(f=>{N[f.rule]=(N[f.rule]||0)+1;});
 return{ok:!bad.length&&(N['plant-in-water']||0)<=EDGE_OWED.plant&&(N['wet-short']||0)<=EDGE_OWED.wet,detail:(bad.length?'env: '+JSON.stringify(bad).slice(0,200)+'; ':'')+P.length+' trees, '+JSON.stringify(N)+' (owed '+JSON.stringify(EDGE_OWED)+')'+(F.length?'; first: '+JSON.stringify(F[0]).slice(0,240):'')};}
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),T=ABSAV.TREES,F=(window._biome||{}).floor||{};
 add('species tagged',HCHK.tags(ABSAV.SPECIES.concat(ABSAV.PLANTS)));
 add('savannah trees in their zones',HCHK.zoned(T));
 add('the eastern abyss jungle at the foot',HCHK.jungle(T));
 add('no tree in the water',HCHK.dry(T));
 add('the burn mosaic',HCHK.burn(F,burnAges()));
 add('the flora and the wet band read the shore of the water (BIO.envCheck, WATER.edgeAudit)',edgeCheck());
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),T=ABSAV.TREES,F=(window._biome||{}).floor||{};
 add('a species with no harvest tag',HCHK.tags(ABSAV.SPECIES.map(S=>S.key==='stub'?Object.assign({},S,{tags:{climate:'tropic'}}):S)));
 add('a stub lycopsid in the jungle at the foot',HCHK.zoned(T.concat([{sp:2,x:-2900,z:0,ea:false}])));
 add('the jungle read in place, carried up to the bench',HCHK.jungle(T.map(t=>t.ea?Object.assign({},t,{x:2000}):t)));
 add('a tree in the pan',HCHK.dry(T.concat([{x:PAN_WATER.x,z:PAN_WATER.z}])));
 add('no ember lilies drawn',HCHK.burn(Object.assign({},F,{lilies:0}),burnAges()));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
// the page opens at 14:00 (10:00 on game start's day is the daily eclipse here: the sun behind the giant, 09:00-10:30); #hour= moves it
const PAGE_HOUR=14;
KHOST.on(skyView,'view');   /* the shared sky, its lights and fog at the hour (89s-host-sky.js) */
/* the land in the pan (core/water/ext/58; the owner, 2026-11-01): off at page load, for the tri counts; the panel's button or ?mirror=probe|live turns it on.
   The pan is the largest still near the eye (240 m); the stream's foot pools stand 470 m lower at the foot, so they keep the sky's reflection (one plane a page) */
const MIRROR=WATER.mirrorSwitch?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[PAN_DRAW.mesh.material],
 level:PAN_WATER.level,center:[PAN_WATER.x,PAN_WATER.z],radius:PAN_WATER.r*2.2,far:2400,tree:o=>o.name==='biome:impTrees',hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;
KHOST.take({build:'abyssal-savannah',title:'Krator biome — the abyssal savannah',
 hint:'The abyssal savannah, station 1: the eastern abyss\'s gentle east rim (scale model px 1026,350, map 5.1), from the jungle\'s foot up the parkland and the caprock rim to the bench',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:PAGE_HOUR},draw:MIRROR?()=>{MIRROR.update();SKY.render();}:()=>SKY.render(),
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome}});
