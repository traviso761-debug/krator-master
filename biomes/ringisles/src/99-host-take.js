// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says
// what this page has: one view per zone, the inspector's words, the budgets and the kit's own checks.
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const toward=(x,z,tx,tz,d,h,th)=>{const a=Math.atan2(tz-z,tx-x),cx=tx-Math.cos(a)*d,cz=tz-Math.sin(a)*d;return[cx,Math.max(gh(cx,cz,h),waterH(cx,cz)+h),cz,tx,Math.max(gh(tx,tz,th==null?1:th),waterH(tx,tz)+.2),tz];};
// the place on the island that scores best (the cached fields, every 32 m), for a view that must find its zone
function bestAt(score,box){let b=null,bs=-1e9;const N=FC.NX,cs=FC.cs;for(let j=2;j<FC.NZ-2;j+=4)for(let i=2;i<N-2;i+=4){const x=TERR.X0+i*cs,z=TERR.Z0+j*cs;
 if(box&&(x<box[0]||z<box[1]||x>box[2]||z>box[3]))continue;const k=j*N+i,f=n=>FC.a[n][k],s=score(f,x,z,FC.a.h[k]);if(s>bs){bs=s;b=[x,z];}}return b||[0,0];}
const KW=k=>f=>f('koppen:'+k)*(1-f('beach'))*(1-f('garden'))*(1-f('floor'))*(1-f('slope'));
function nearTree(key,x,z,minH){const T=RINGISLES.nearestTree&&RINGISLES.nearestTree(key,x,z,minH);return T||{x:x,z:z,y0:gh(x,z),H:6,crownR:3};}
function atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,1.7),waterH(cx,cz)+1.7,T.y0+(dy==null?0:dy)),cz,T.x,T.y0+T.H*(ty==null?.5:ty),T.z];}
const P_XA=bestAt(KW('XA')),P_AF=bestAt(KW('Af')),P_AM=bestAt(KW('Am')),P_AW=bestAt(KW('Aw')),P_XV=bestAt((f,x,z)=>KW('XV')(f)*smooth(60,220,coastD(x,z))),P_BSH=bestAt(KW('BSh')),
 P_XS=bestAt((f,x,z)=>KW('XS')(f)*(1-f('pan'))*smooth(700,300,Math.hypot(x-PAN.x,z-PAN.z))),
 P_BEACH=bestAt((f,x,z)=>f('beach')*smooth(-200,-700,x)*(1-f('dune'))),P_MANG=bestAt(f=>f('mangal')),P_REEF=bestAt((f,x,z)=>f('reef')*smooth(600,200,Math.hypot(x-BAY.x,z-BAY.z-350)));
const VMODE={};
const VIEWS={
 'The island from above':[-2600,900,2300,-200,0,0],
 'Windward rainforest (Af)':(function(){const T=nearTree('lehua',P_AF[0],P_AF[1],8);return atTree(T,T.crownR*3+22,2.2,T.H*.45,.7);})(),
 'Hypertropic forest (XA)':(function(){const T=nearTree('lehua',P_XA[0],P_XA[1],14);return atTree(T,T.crownR*2.2+12,-2.5,1.7,.55);})(),
 'Monsoon forest edge (Am)':toward(P_AM[0]-60,P_AM[1]+30,P_AM[0],P_AM[1],90,6,4),
 'Tall-grass savanna (Aw)':(function(){const T=nearTree('baobab',P_AW[0],P_AW[1]);return atTree(T,T.crownR*4+55,.7,9,.4);})(),
 'Abyssal savanna, the burn mosaic (XV)':toward(P_XV[0]+80,P_XV[1]+60,P_XV[0],P_XV[1],140,14,0),
 'Hot steppe (BSh)':(function(){const T=nearTree('corkwood',P_BSH[0],P_BSH[1]);return atTree(T,T.crownR*3+12,2.6,1.8,.4);})(),
 'Salt steppe and the pan (XS)':toward(PAN.x+PAN.rx*1.5,PAN.z-PAN.rz*1.2,PAN.x,PAN.z,PAN.rx*1.5,48,0),
 'The beach (strand)':toward(P_BEACH[0]+10,P_BEACH[1]-6,P_BEACH[0]-40,P_BEACH[1]+5,45,1.7,1),
 'The mangrove lagoon':(function(){const T=nearTree('mangrove',P_MANG[0],P_MANG[1]);return atTree(T,T.crownR*2.5+18,-1.2,1.6,.4);})(),
 'The reef flat':toward(P_REEF[0]+30,P_REEF[1]-20,P_REEF[0],P_REEF[1],36,2.5,-.6),
 'The tide pools':(function(){const P=POOLS[0];return[P.x+7,BENCH.level+1.8,P.z+5,P.x,P.level-.2,P.z];})(),
 'The geyser field':(function(){const g=LAYOUT.geysers[0];return toward(g.x+150,g.z+150,g.x,g.z,200,18,8);})(),
 'The village gardens':toward(GARDEN.x+120,GARDEN.z+150,GARDEN.x-30,GARDEN.z-30,170,75,0),
 'The upper gardens (coffee, cloves)':toward(GARDEN2.x+60,GARDEN2.z+70,GARDEN2.x,GARDEN2.z,95,38,0),
 'The island at night':[1800,260,-1600,0,20,0],
};
VMODE['The island at night']='night';
const goLight=k=>{setLightMode(VMODE[k]||'day');if(k==='The geyser field'&&GEYSER.SHOW&&LAYOUT.geysers[0].kind!=='spouter')GEYSER.erupt(LAYOUT.geysers[0].key,GEYSER.SHOW.t-8);};
const GCTL=[{button:'Day',on:()=>setLightMode('day')},{button:'Night',on:()=>setLightMode('night')},
 {button:'Erupt',on:()=>LAYOUT.geysers.forEach((g,i)=>{if(g.kind!=='spouter'&&GEYSER.SHOW)GEYSER.erupt(g.key,GEYSER.SHOW.t+i*1.5);})}];

// ---------------------------------------------------------------- the inspector's words
const ZNAME={XA:'hypertropic jungle (XA)',Af:'rainforest (Af)',Am:'monsoon forest (Am)',Aw:'tropical savanna (Aw)',XV:'abyssal savanna (XV)',BSh:'hot steppe (BSh)',XS:'abyssal salt steppe (XS)'};
function describe(hit){const p=hit.point,o=hit.object;
 let best2=null;for(const r of REG){if(r.r>900)continue;if(regHas(r,p.x,p.y,p.z)&&(!best2||r.r<best2.r))best2=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,kit=o.userData.kit||'';
 let name=isItem?lab+(best2?'  (under '+best2.name+')':''):(best2?best2.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&kit==='ringisles'&&RINGISLES.plantOfItem(item);
 const S=best2&&best2.key&&(RINGISLES.byKey[best2.key]||RINGISLES.borrowOf[best2.key]),tg=S&&S.tags?S.tags:S&&S.koppen?{koppen:S.koppen,zone:S.zone,origin:'borrowed from '+S.kit}:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const K=RINGISLES.classAt(p.x,p.z);let top='',tw=0;for(const k in K)if(K[k]>tw){tw=K[k];top=k;}
 const cls=kit&&kit!=='ringisles'?'flora · the '+kit+' kit (grown in place by the ring isles kit)':isItem?'flora · the ring isles kit':'terrain / water';
 return name+'\n'+cls+(tg?'\nKoppen '+(tg.koppen||[]).join(' ')+' · zone '+tg.zone+' · '+(tg.origin||'')+(tg.climate?' · '+tg.climate+' · '+tg.aridity:''):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':''):'')+
  '\nclimate here: '+(tw>.05?ZNAME[top]+' '+Math.round(tw*100)+'%':'the sea')+(FIELD.beach(p.x,p.z)>.5?' · the beach':FIELD.mangal(p.x,p.z)>.5?' · the mangal':FIELD.reef(p.x,p.z)>.5?' · the reef flat':FIELD.lagoon(p.x,p.z)>.5?' · the lagoon':FIELD.pan(p.x,p.z)>.5?' · the salt pan':FIELD.garden(p.x,p.z)>.5?' · a garden':'')+
  (tw>.05&&(K.Aw+K.XV+K.BSh+K.XS)>.3?' · last burnt '+RINGISLES.burnAge(p.x,p.z).toFixed(1)+' years ago':'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(1)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}

// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:30000000,calls:900},   // a ceiling, not a target (KNOWN_ISSUES)
 cls:{pass:18000000,host:900000},
 type:{'geyser/sinter':'pass','geyser/trees':'pass','geyser/floor':'pass','geyser/show':'pass','ringisles/gardens':'pass','ringisles/trees':'pass',
  'ringisles/dressing':'pass','ringisles/floor':'pass','host':'host'},
};
// every instanced item: [x, y, z, its name, its kit]
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name,M.userData.kit||'']);}});return o;};
const ZONES=RINGISLES.ZONES,ORIGINS=['earth','krator','native','dead','crop'];
// the floor's items: each stands on the ground or the sea bed (not on a tree: the lianas, epiphytes and fruit are left out)
const GROUNDED=['tallgrass','tallgrassb','bunch','stubble','ash','samphire','crust','creeper','beachgrass','wrack','seagrass','brain','branchcoral','rubble','mound','stone','rice','cane','anemone','urchin'].map(k=>'biome:'+k);
const MANGAL_KEYS=['mangrove','stiltwood','kneetree'];
const HCHK={
 // every class of the isle demo's land carries flora where it is the class (its trees and its floor)
 classes(P){const by={};RINGISLES.CLASSES.forEach(k=>by[k]=0);
  for(const p of P){const K=RINGISLES.classAt(p[0],p[2]);for(const k in K)if(K[k]>.6)by[k]++;}
  const thin=RINGISLES.CLASSES.filter(k=>by[k]<400);return{ok:!thin.length,detail:thin.length?'thin: '+thin.map(k=>k+' '+by[k]).join(', '):RINGISLES.CLASSES.map(k=>k+' '+by[k]).join(' · ')};},
 // the trees are at an island's scale: no hyperjungle giants (savanna trees 6-20 m, baobabs to 40, the canopy to 35)
 scale(T){const big=T.filter(t=>t.H>42),tiny=T.filter(t=>!(t.H>.8));return{ok:!big.length&&!tiny.length&&T.length>200,detail:big.length?big.length+' trees over 42 m ('+big.slice(0,3).map(t=>(t.borrow||RINGISLES.SPECIES[t.sp].key)+' '+t.H.toFixed(0)).join(', ')+')':tiny.length?tiny.length+' trees under a metre':T.length+' trees, the tallest '+Math.max(...T.map(t=>t.H)).toFixed(0)+' m'};},
 // no tree on a cliff, none in the water but the mangal's
 rooted(T){const bad=T.filter(t=>{const d=waterH(t.x,t.z)-terrainH(t.x,t.z),mg=MANGAL_KEYS.indexOf(t.borrow)>=0;return(!mg&&d>.15)||(mg&&d>1.3)||RINGISLES.zones(t.x,t.z).cliff>.7;});
  return{ok:!bad.length,detail:bad.length?bad.length+' trees in the water or on a cliff ('+bad.slice(0,3).map(t=>(t.borrow||RINGISLES.SPECIES[t.sp].key)+' at '+t.x.toFixed(0)+','+t.z.toFixed(0)).join('; ')+')':T.length+' trees on dry ground (the mangal\'s in its water)'};},
 // nothing of the floor floats or is buried
 grounded(P){const L=P.filter(p=>p[4]==='ringisles'&&GROUNDED.indexOf(p[3])>=0),bad=L.filter(p=>{const g=terrainH(p[0],p[2]);return p[1]>g+.9||p[1]<g-1.2;});
  return{ok:!bad.length&&L.length>5000,detail:bad.length?bad.length+' of '+L.length+' floor items off the ground ('+[...new Set(bad.map(p=>p[3]))].slice(0,4).join(', ')+')':L.length+' floor items on the ground'};},
 placed(C,BC){const zero=RINGISLES.SPECIES.filter((S,i)=>!(C[i]>0)).map(S=>S.key).concat(RINGISLES.BORROW.filter((B,i)=>RINGISLES.kitOf(B)&&!(BC[i]>0)).map(B=>B.key));
  return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):RINGISLES.SPECIES.length+' own species and '+RINGISLES.BORROW.length+' borrowed placed'};},
 tagged(L){const bad=[];for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||ZONES.indexOf(t.zone)<0||!t.harvest||!k.length||k.some(c=>RINGISLES.CLASSES.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species, plants and crops tagged with their Koppen classes'};},
 // the burn mosaic: the savanna's grass in every state
 burn(st){const s=st||{};return{ok:s.black>40&&(s.flush+s.green)>200&&s.cured>400,detail:'grass black '+s.black+', flush '+s.flush+', green '+s.green+', cured '+s.cured};},
 // every garden plot planted
 gardens(G){const s=G||{};return{ok:s.plots>=25&&s.rice>2000&&s.taro>40&&s.trees>150&&s.kava>20&&s.cane>100&&s.sweetpotato>40&&s.herbs>40&&s.greens>100,detail:s.plots+' plots: rice '+s.rice+', taro '+s.taro+', trees '+s.trees+', kava '+s.kava+', cane '+s.cane+', sweet potato '+s.sweetpotato+', herbs '+s.herbs+', greens '+s.greens};},
 // the mangroves stand in the bay's mud and water
 mangal(T){const mg=T.filter(t=>t.borrow==='mangrove'),out=mg.filter(t=>FIELD.mangal(t.x,t.z)<.25);return{ok:mg.length>=8&&!out.length,detail:mg.length+' mangroves'+(out.length?', '+out.length+' out of the mangal':', all in the bay\'s mud and water')};},
 // the vent's field is the geyser kit's: none of this kit's flora on its thermal ground
 thermal(P){const L=P.filter(p=>p[4]==='ringisles'&&FIELD.floor(p[0],p[2])>.85),g=P.filter(p=>p[4]==='geyser').length;
  return{ok:!L.length&&g>200,detail:L.length?L.length+' of this kit\'s plants on the thermal ground':g+' geyser-kit items on the vent\'s field, none of this kit\'s'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(RINGISLES.PLANTS).map(k=>Object.assign({key:k},RINGISLES.PLANTS[k])).concat(Object.keys(RINGISLES.GARDEN).map(k=>RINGISLES.GARDEN[k]));
// every tree the kit grew (its passes and the gardens' plots), by its own species and by the borrowed ones
const treeCounts=()=>{const C=RINGISLES.SPECIES.map(()=>0),BC=RINGISLES.BORROW.map(()=>0);for(const t of RINGISLES.TREES){if(t.borrow){const B=RINGISLES.borrowOf[t.borrow];if(B)BC[B.i]++;}else C[t.sp]++;}return[C,BC];};
const under=()=>(window._biome&&window._biome.under)||{};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints(),T=RINGISLES.TREES||[];
 add('every climate class carries its flora',HCHK.classes(P));
 add('trees at an island\'s scale',HCHK.scale(T));
 add('no tree in the water or on a cliff',HCHK.rooted(T));
 add('the floor stands on the ground',HCHK.grounded(P));
 add('every species placed (own and borrowed)',HCHK.placed(...treeCounts()));
 add('every species, plant and crop tagged',HCHK.tagged(RINGISLES.allSpecies().concat(plantList())));
 add('the savanna burns in a mosaic',HCHK.burn(under()));
 add('the gardens are planted',HCHK.gardens(window._biome&&window._biome.gardens));
 add('the mangroves stand in the bay',HCHK.mangal(T));
 add('the vent\'s field is the geyser kit\'s',HCHK.thermal(P));
 add('preset cameras clear of the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),T=RINGISLES.TREES||[];
 add('no flora anywhere',HCHK.classes([]));
 add('a 150 m hypertree',HCHK.scale(T.concat([{H:150,borrow:'lehua'}])));
 add('a palm out at sea',HCHK.rooted([{x:BAY.x,z:BAY.z+BAY.r*1.6,borrow:'coconut'}]));
 add('grass floating 5 m up',HCHK.grounded(instPoints().concat([[P_AW[0],terrainH(P_AW[0],P_AW[1])+5,P_AW[1],'biome:tallgrass','ringisles']])));
 {const [C,BC]=treeCounts();C[0]=0;add('a species never placed',HCHK.placed(C,BC));}
 add('a species with no Koppen classes',HCHK.tagged(RINGISLES.allSpecies().map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{koppen:[]})}):S)));
 add('no burnt grass',HCHK.burn(Object.assign({},under(),{black:0})));
 add('no gardens',HCHK.gardens({plots:0,rice:0,taro:0,trees:0,kava:0,cane:0,sweetpotato:0,herbs:0,greens:0}));
 add('a mangrove on the mountain',HCHK.mangal(T.concat([{borrow:'mangrove',x:600,z:-150}])));
 add('this kit\'s grass in a hot spring',HCHK.thermal(instPoints().concat([[VENT.x,terrainH(VENT.x,VENT.z),VENT.z,'biome:tallgrass','ringisles']])));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-2,z:0}]));
 return R;}

// ---------------------------------------------------------------- the page, handed to the host
// the runtime LOD (a borrowed swbay tree is its hero near and its lite stand-in far: BIO.lodTick shows the right one)
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(function geyserScale(){if(GEYSER.SHOW)GEYSER.SHOW.setScale(innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360)));},'view');
KHOST.on(function fauna(dt,clock){if(FAUNA_TICK)FAUNA_TICK(dt,clock.t);});
let HOSTED=null;
HOSTED=KHOST.take({build:'ringisles',title:'Krator biome — the Ring Sea isles',
 hint:"An island of the Ring Sea archipelago at the sea's level (~1.9 atm, hot): its zones chosen by the scale model's climate class (Koppen as fields). The windward rainforest (Af) and hypertropic jungle (XA) under the mountain, monsoon forest (Am), tall-grass savanna (Aw) and abyssal savanna (XV) burnt in a mosaic, hot steppe (BSh), salt steppe (XS) and a salt pan; the beach, the mangrove lagoon, the reef flat, the tide pools, a geyser field and a village's gardens (ideal type). N for night",
 scene,camera,renderer,ground:terrainH,floor:(x,z)=>Math.max(terrainH(x,z),waterH(x,z)),clear:1.6,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 onView:goLight,controls:GCTL,
 keys:{n:()=>setLightMode(LIGHT_MODE==='night'?'day':'night')},
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},objects:()=>[sky,giant,giantRing]},
 inspect:describe,stats:()=>'inst '+window._instances+' · animals '+FAUNA.length,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'fauna':{match:o=>{let q=o;while(q){if(q.userData&&q.userData.fauna)return true;q=q.parent;}return false;}},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 setLightMode,biome:()=>window._biome,geyser:()=>window._geyser,
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),coast:coastD(x,z),reef:reefD(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));o.burnAge=+RINGISLES.burnAge(x,z).toFixed(2);return o;}}});
