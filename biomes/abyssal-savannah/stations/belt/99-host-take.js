// ================================================================= HOST — the belt's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says what the page has.
// Heights in the views are above the ground.
const V=(cx,cz,cy,tx,tz,ty)=>[cx,terrainH(cx,cz)+cy,cz,tx,terrainH(tx,tz)+ty,tz];
const nearestTree=(sp,x,z,ea,pred)=>{let b=null,bd=1e18;for(const T of ABSAV.TREES){if(ea?!(T.ea&&T.sp===sp):(T.ea||T.sp!==sp))continue;if(T.lv!==2)continue;if(pred&&!pred(T))continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};
const nearestMound=(x,z)=>MOUNDS.reduce((b,k)=>!b||Math.hypot(k.x-x,k.z-z)<Math.hypot(b.x-x,b.z-z)?k:b,null);
function burnSpot(age,x0,z0){for(let r=0;r<2400;r+=60)for(let a=0;a<12;a++){const x=x0+Math.cos(a/12*TAU)*r,z=z0+Math.sin(a/12*TAU)*r;
  if(inMap(x,z)&&ABSAV.burn(x,z)===age){const Z=ABSAV.zones(x,z);if(Z.parkland>.6&&!inMound(x,z,40))return[x,z];}}return[x0,z0];}
const VIEWS={
 'Across the belt':V(-200,-2350,48,-700,1600,0),   /* over the crowns (the umbrella trees to 28 m) */
 'In the grass':V(700,-420,1.7,1000,-300,2.2),
 'Umbrella trees at their tallest':(function(){const T=nearestTree(0,500,-200,false,T=>T.H>22);if(!T)return V(500,-200,3,700,-200,12);const a=.5;
  return V(T.x-Math.cos(a)*T.crownR*4,T.z-Math.sin(a)*T.crownR*4,2.2,T.x,T.z,T.H*.55);})(),
 'The clay ant spires':(function(){const k=nearestMound(600,-300);if(!k)return V(600,-300,3,700,-300,4);const h=k.top-k.y0;return V(k.x-h*1.6,k.z+h*1.1,2,k.x,k.z,h*.55);})(),
 'Rope araucarias':(function(){const T=nearestTree(17,800,0,true,T=>BIO.field('upland',T.x,T.z)>.25);if(!T)return V(800,0,3,900,0,15);return V(T.x+T.crownR*3.5,T.z+T.crownR*2,2.5,T.x,T.z,T.H*.5);})(),
 'The belt stream':(function(){const z=-1100;return V(strX(z+140)+10,z+140,7,strX(z-220),z-220,1.5);})(),
 'The jungle edge':V(1500,-1150,4,2950,-2250,18),
 'The salt flat':V(PAN.c[0]+380,PAN.c[1]-650,5,PAN.c[0],PAN.c[1],0),
 'A fresh burn':(function(){const p=burnSpot(0,600,-200);return V(p[0]-30,p[1]-22,7,p[0]+25,p[1]+18,0);})(),
 'A young burn':(function(){const p=burnSpot(2,400,400);return V(p[0]-40,p[1]-30,1.8,p[0]+60,p[1]+40,1);})(),
 'Toward the salt lake':V(0,2350,28,1000,7000,-560),
 'The belt from above':V(-3700,-3000,520,300,500,0)};
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
// ---------------------------------------------------------------- the probe's budgets and the page's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:11000000,calls:300},
 cls:{pass:7500000,host:1800000},
 type:{'absav/trees':'pass','absav/floor':'pass','host':'host'}};
const FRUIT_NOT_DRAWN=['umbrella','tongue','stub','embercycad','kopjefig','saltbush'];
const zoneOf=T=>ABSAV.zones(T.x,T.z);
// The page's own checks, each with a broken input that must fail.
const HCHK={
 tags(L){const bad=L.filter(S=>!S.tags||!S.tags.climate||!S.tags.aridity||S.tags.abyssal==null||!S.tags.riparian||!S.tags.harvest).map(S=>S.key);
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged (climate, aridity, abyssal, riparian, harvest); edible, no catalog piece: '+FRUIT_NOT_DRAWN.join(', ')};},
 // each savannah tree stands in its zones: umbrella trees on the parkland, the salt steppe or the jungle's edge; tongue trees by the stream, in the
 // parkland's damp or the jungle's edge; stubs on the salt steppe; ember cycads on rock or the parkland
 zoned(TREES){const need={0:Z=>Z.parkland+Z.steppe+Z.foot,1:Z=>Z.gallery+Z.parkland+Z.foot,2:Z=>Z.steppe,3:Z=>Z.scarp+Z.parkland,4:Z=>1};let bad=0,n=0,first='';
  for(const T of TREES){if(T.ea)continue;n++;const Z=zoneOf(T);if(!(need[T.sp](Z)>.02)){bad++;if(!first)first=ABSAV.SPECIES[T.sp].key+' at '+T.x.toFixed(0)+','+T.z.toFixed(0);}}
  return{ok:n>100&&!bad,detail:n+' savannah trees, '+bad+' out of their zones'+(first?' (first: '+first+')':'')};},
 // the jungle's edge is the eastern abyss's, read in place: its jungle trees stand at the jungle's edge or by the stream (the rope araucarias,
 // the parkland's own, apart)
 jungle(TREES){const E=TREES.filter(T=>T.ea&&T.sp!==17),out=E.filter(T=>{const Z=zoneOf(T);return Z.foot+Z.gallery<.03;});
  return{ok:E.length>50&&out.length<=E.length*.05,detail:E.length+' eastern abyss trees (read in place) at the jungle\'s edge and the stream, '+out.length+' out in the parkland'};},
 // the rope araucarias stand through the parkland
 araucaria(TREES){const A=TREES.filter(T=>T.ea&&T.sp===17),P=A.filter(T=>zoneOf(T).parkland>.3);
  return{ok:P.length>=12,detail:A.length+' rope araucarias, '+P.length+' on the parkland'};},
 // the parkland at its tallest: umbrella trees to ~28 m (station 1's reach 24)
 tall(TREES){const U=TREES.filter(T=>!T.ea&&T.sp===0),hi=U.filter(T=>T.H>24),mx=U.reduce((m,T)=>Math.max(m,T.H),0);
  return{ok:U.length>100&&hi.length>=20,detail:U.length+' umbrella trees, '+hi.length+' over 24 m, the tallest '+mx.toFixed(1)+' m'};},
 // the clay ants' spires: on the open parkland, none in the water or on the stream, no tree rooted in a mound's skirt
 mounds(M,TREES){const wet=M.filter(B=>waterH(B.x,B.z)>terrainH(B.x,B.z)-.5||FIELD.flow(B.x,B.z)>.1),inT=TREES.filter(T=>M.some(B=>Math.hypot(T.x-B.x,T.z-B.z)<(B.R==null?4:B.R)));
  return{ok:M.length>=20&&!wet.length&&!inT.length,detail:M.length+' spires, '+wet.length+' in the water or on the stream, '+inT.length+' trees rooted in a skirt'};},
 dry(TREES){const wet=TREES.filter(T=>BIO.depth(T.x,T.z)>-.25);return{ok:!wet.length,detail:wet.length?wet.length+' trees in water':'no tree in the water ('+TREES.length+')'};},
 burn(F,ages){const miss=[0,1,2,3,8].filter(a=>!ages[a]);return{ok:!miss.length&&F.charred>0&&F.lilies>0,detail:'patch ages seen '+Object.keys(ages).join(',')+'; charred '+F.charred+', ember lilies '+F.lilies};}};
function burnAges(){const o={};for(let z=-TERR.Z+100;z<TERR.Z;z+=200)for(let x=-TERR.X+100;x<TERR.X;x+=200){const a=ABSAV.burn(x,z);o[a<4?a:8]=1;}return o;}
const EDGE_OWED={plant:0,wet:0};
function edgeCheck(){const P=[];for(const T of ABSAV.TREES){P.push({x:T.x,z:T.z,r:Math.min(T.rb==null?.4:T.rb,.6),name:T.ea?'ea':ABSAV.SPECIES[T.sp].key});if(P.length>8000)break;}
 const bad=BIO.envCheck(ENV,[[0,0],[strX(-1200),-1200],[PAN.c[0],PAN.c[1]],[SEEP.x,SEEP.z]]),F=WATER.edgeAudit({field:WATER_F,plants:P,wet:WET_SHORE,band:4,clear:0}),N={};F.forEach(f=>{N[f.rule]=(N[f.rule]||0)+1;});
 return{ok:!bad.length&&(N['plant-in-water']||0)<=EDGE_OWED.plant&&(N['wet-short']||0)<=EDGE_OWED.wet,detail:(bad.length?'env: '+JSON.stringify(bad).slice(0,200)+'; ':'')+P.length+' trees, '+JSON.stringify(N)+' (owed '+JSON.stringify(EDGE_OWED)+')'+(F.length?'; first: '+JSON.stringify(F[0]).slice(0,240):'')};}
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),T=ABSAV.TREES,F=(window._biome||{}).floor||{};
 add('species tagged',HCHK.tags(ABSAV.SPECIES.concat(ABSAV.PLANTS)));
 add('savannah trees in their zones',HCHK.zoned(T));
 add('the eastern abyss jungle at the jungle\'s edge',HCHK.jungle(T));
 add('rope araucarias through the parkland',HCHK.araucaria(T));
 add('the parkland at its tallest',HCHK.tall(T));
 add('the clay ant spires',HCHK.mounds(MOUNDS,T));
 add('no tree in the water',HCHK.dry(T));
 add('the burn mosaic',HCHK.burn(F,burnAges()));
 add('the flora and the wet band read the shore of the water (BIO.envCheck, WATER.edgeAudit)',edgeCheck());
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),T=ABSAV.TREES,F=(window._biome||{}).floor||{};
 add('a species with no harvest tag',HCHK.tags(ABSAV.SPECIES.map(S=>S.key==='stub'?Object.assign({},S,{tags:{climate:'tropic'}}):S)));
 add('a stub lycopsid in the jungle\'s hollow',HCHK.zoned(T.concat([{sp:2,x:JUNG.c[0],z:JUNG.c[1],ea:false}])));
 add('the jungle read in place, carried out into the parkland',HCHK.jungle(T.map(t=>t.ea&&t.sp!==17?Object.assign({},t,{x:900,z:-300}):t)));
 add('no rope araucaria',HCHK.araucaria(T.filter(t=>!(t.ea&&t.sp===17))));
 add('the umbrella trees at station 1\'s heights',HCHK.tall(T.map(t=>!t.ea&&t.sp===0?Object.assign({},t,{H:Math.min(t.H,22)}):t)));
 add('a spire on the stream',HCHK.mounds(MOUNDS.concat([{x:strX(-600),z:-600,R:5}]),T));
 add('a tree in the salt flat\'s brine',HCHK.dry(T.concat([{x:PAN_WATER.x,z:PAN_WATER.z}])));
 add('no ember lilies drawn',HCHK.burn(Object.assign({},F,{lilies:0}),burnAges()));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
const PAGE_HOUR=14;
KHOST.on(skyView,'view');   /* the shared sky, its lights and fog at the hour (89s-host-sky.js) */
/* the land in the salt flat's sheet (core/water/ext/58): off at page load; the panel's button or ?mirror=probe|live turns it on */
const MIRROR=WATER.mirrorSwitch?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[PAN_DRAW.mesh.material],
 level:PAN_WATER.level,center:[PAN_WATER.x,PAN_WATER.z],radius:PAN_WATER.r*2.2,far:2400,tree:o=>o.name==='biome:impTrees',hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;
KHOST.take({build:'abyssal-savannah-belt',title:'Krator biome — the abyssal savannah: the floor\'s belt',
 hint:'The abyssal savannah, station 2: the floor\'s belt (scale model px 1031,515, map 5.1; -1,880 m, 2.0 atm), the parkland at its tallest between the lake jungle\'s edge and the salt lake\'s rim',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:PAGE_HOUR},draw:MIRROR?()=>{MIRROR.update();SKY.render();}:()=>SKY.render(),
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome}});
