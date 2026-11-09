// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says
// what this page has.
const VIEWS={
 'The wadi':[RIVER.x(1250)-30,terrainH(RIVER.x(1250)-30,1250)+24,1250,RIVER.x(300),40,300],
 'From afar':[-2500,560,2300,0,120,0],
 'Krator rising':[-500,200,700,1900,900,-2100],
 // the lake from its beach: the towers standing in the shallows, the open water running on north into the haze
 'The lakeshore':[-260,terrainH(-260,shoreZ(-260)+50)+7,shoreZ(-260)+50,-760,30,shoreZ(-760)-260],
 'Over the lake to the plain':[150,140,shoreZ(150)-900,150,20,500],
};
// views found from the built layout: the stone forest, the fengcong, a tower's dome, the paddies, the pond, the wadi's tower
(function(){const R=ROCK,by=id=>R.find(B=>B.id===id);
 VIEWS['Over the stone forest']=[SF.c[0]+330,120,SF.c[1]+300,SF.c[0]-40,10,SF.c[1]-20];
 // inside the stone forest: a gap among the blades near the middle, looking along it
 {let best=null;for(let k=0;k<40&&!best;k++){const a=k*2.4,r=60+k*3,x=SF.c[0]+Math.cos(a)*r,z=SF.c[1]+Math.sin(a)*r,Z=KGUILIN.at(x,z);if(!Z.rock&&Z.footD>2&&Z.footD<6&&pondE(x,z)>1.6)best=[x,z,a];}
  if(best){const y=terrainH(best[0],best[1]);VIEWS['In the stone forest']=[best[0],y+1.7,best[1],best[0]+Math.cos(best[2]+1.6)*40,y+7,best[1]+Math.sin(best[2]+1.6)*40];}}
 /* the pond from its shore: the first spot round the ring (from the north-east, as before) clear of the blades; the old fixed spot stood in one (GPU --all-views, 2026-11-09) */
 {let ex=POND.x+POND.rx*1.7,ez=POND.z+POND.rz*1.5;for(let k=0;k<24;k++){const a=Math.atan2(1.5,1.7)+(k%2?1:-1)*Math.ceil(k/2)*.26,x=POND.x+Math.cos(a)*POND.rx*1.75,z=POND.z+Math.sin(a)*POND.rz*1.75,Z=KGUILIN.at(x,z);
   if(!Z.rock&&Z.footD>3){ex=x;ez=z;break;}}
  VIEWS['The pond in the stone forest']=[ex,Math.max(POND.level,terrainH(ex,ez))+4,ez,POND.x,POND.level,POND.z];}
 VIEWS['The lotus pond (close)']=[POND.x+POND.rx*.55,POND.level+2.2,POND.z+POND.rz*.5,POND.x,POND.level,POND.z];
 const fc=by('fcbase');if(fc)VIEWS['The fengcong']=[fc.x-950,160,fc.z+700,fc.x,90,fc.z];
 const bn=by('bendN');if(bn)VIEWS['A tower at the wadi\'s edge']=[RIVER.x(-260),RIVER.level(-260)+14,-260,bn.x,bn.top*.45,bn.z];
 const t=R.filter(B=>/^tower/.test(B.id)).sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))[0];
 if(t){const cb=t.beds[t.beds.length-1];VIEWS['A tower\'s dome (the scrub forest)']=[cb.cx+t.R*.9,t.top+30,cb.cz+t.R*.7,cb.cx,t.top-20,cb.cz];}
 const P=KGUILIN.PADDIES.filter(F=>F.state==='green').sort((a,b)=>Math.hypot(a.x-RIVER.x(a.z)-120,a.z)-Math.hypot(b.x-RIVER.x(b.z)-120,b.z))[0];
 if(P)VIEWS['The paddies']=[P.x+60,P.level+9,P.z+50,P.x-60,P.level+20,P.z-60];
 const o=KGUILIN.CLIFF.filter(c=>c.kind==='orchid'&&c.up<.4&&!KGUILIN.bodies()[c.body].kind.match(/fin|spire/)).sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))[0];
 if(o)VIEWS['A stone orchid on the cliff']=[o.x+o.nx*5,o.y+.8,o.z+o.nz*5,o.x,o.y,o.z];
 const bb=KGUILIN.nearestTree&&KGUILIN.nearestTree(0,RIVER.x(300)+RIVER.w+10,300);if(bb)VIEWS['Bamboo on the bank']=[bb.x-(bb.x-RIVER.x(bb.z))*.5,RIVER.level(bb.z)+3,bb.z+18,bb.x,bb.y0+6,bb.z];
 // the jungle giants on the plain, and a cliff fig at a tower's foot (nwbay's, read in place)
 const BT=KGUILIN.BTREES||[],gi=BT.filter(T=>T.key==='prismgum'||T.key==='ironbark').sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))[0];
 if(gi)VIEWS['The jungle giants on the plain']=[gi.x+gi.H*1.1,gi.y0+8,gi.z+gi.H*.9,gi.x,gi.y0+gi.H*.55,gi.z];
 const fg=BT.filter(T=>T.key==='clifffig').map(T=>({T,N:KGUILIN.nearestFoot(T.x,T.z)})).filter(e=>e.N).sort((a,b)=>Math.hypot(a.T.x,a.T.z)-Math.hypot(b.T.x,b.T.z))[0];
 if(fg){const T=fg.T,dx=T.x-fg.N.S.x,dz=T.z-fg.N.S.z,dl=Math.hypot(dx,dz)||1,ux=dx/dl,uz=dz/dl;VIEWS['A cliff fig at a tower\'s foot']=[T.x+ux*55-uz*25,T.y0+9,T.z+uz*55+ux*25,T.x,T.y0+T.H*.35,T.z];}})();

// ---------------------------------------------------------------- the inspector's words: a plant names its species and its
// harvest (biomes/FRUIT.md); a paddy its state and crop; a borrowed tree (nwbay's) its species from nwbay's list
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&KGUILIN.plantOfItem(item);
 const nm=BIO.nameAt?BIO.nameAt(p.x,p.y,p.z):null,NM=nm&&(!best||nm.r<best.r)?nm:null;
 const SB=best&&(KGUILIN.SPECIES.find(s=>best.key===s.key)||NWBAY.SPECIES.find(s=>best.key===s.key)),F=PLT||SB||(NM&&NM.plant?KGUILIN.PLANTS[NM.plant]:null),hv=F&&F.tags?F.tags.harvest:null;
 const Z=KGUILIN.at(p.x,p.z),pd=Z.paddy||KGUILIN.paddyAt(p.x,p.z);
 return(NM?NM.name:F?F.name:best?best.name:(o.userData.inspectLabel||item||o.name||'mesh'))+'  ·  '+(o.userData.inspectLabel||item||'')+
  (hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')+
  (pd?'\npaddy '+pd.id+' · '+pd.state+' · crop '+pd.crop+' (kits/crops)':'')+
  '\nzone '+Z.zone+(Z.rock?' · '+(Z.up*100).toFixed(0)+'% up its tower':'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}

// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:14000000,calls:220},
 cls:{pass:6500000,host:2600000},
 type:{'kguilin/trees':'pass','kguilin/nwbay':'pass','kguilin/cliffs':'pass','kguilin/floor':'pass','host':'host'},
};
// edible plants the catalog has no piece for (named, not hidden: FRUIT.md)
const FRUIT_NOT_DRAWN=['bamboo','osmanthus','pomelo','cliffoak','rice'];
const _itemCounts=()=>{const n={};scene.traverse(M=>{if(M.isInstancedMesh&&M.userData.biome){const k=M.name.replace(/^biome:/,'');n[k]=(n[k]||0)+M.count;}});return n;};
const SMALLK={spire:1,fin:1,balanced:1},isBlade=B=>!!SMALLK[B.kind]&&!B.tower;
const HCHK={
 // fruit: every species and plant carries a harvest tag; every edible one names a catalog piece (or is listed as not
 // catalogued); every catalog fruit the kit names is drawn by its item
 fruit(SP,PL,N){const all=SP.map(S=>[S.key,S.tags]).concat(Object.keys(PL).map(k=>[k,PL[k].tags]));
  const untagged=all.filter(e=>!e[1].harvest).map(e=>e[0]);
  const miss=all.filter(e=>e[1].harvest&&e[1].harvest.edible.length&&!e[1].harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(e[0])<0).map(e=>e[0]);
  const keys=[...new Set(all.map(e=>e[1].harvest&&e[1].harvest.fruit).filter(Boolean))],undrawn=keys.filter(k=>!(N[KGUILIN.FRUIT_ITEMS[k]]>0));
  return{ok:!untagged.length&&!miss.length&&!undrawn.length&&keys.length>=1,detail:(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+
   (undrawn.length?'catalogued but not drawn: '+undrawn.join(', ')+'; ':'')+all.length+' tagged; drawn: lotus seed heads '+(N.lotuspod||0)+', pomelos '+(N.pomelo||0)};},
 // the brief's three: a fruit (the pomelo), the staple (rice, in the paddies), a medicinal plant (the stone orchid), each drawn
 three(SP,PL,N){const pom=SP.find(s=>s.key==='pomelo'),rice=PL.rice,orc=PL.orchid;
  const ok=!!(pom&&pom.tags.harvest.edible.length&&N.pomelo>0&&rice&&rice.tags.harvest.edible.length&&rice.tags.crop==='rice'&&(N.ricebed||0)+(N.ricerows||0)>0&&orc&&orc.tags.harvest.medicinal&&N.orchid>0);
  return{ok,detail:'fruit pomelo ('+(N.pomelo||0)+'), staple rice ('+((N.ricebed||0)+(N.ricerows||0))+' fields, '+(N.rice||0)+' tufts), medicinal stone orchid ('+(N.orchid||0)+')'};},
 // the cliff rule: no tree roots on a rim, under a wall, in water or in a paddy; a tree on the rock stands on the rock's drawn top
 cliffs(TREES){let bad=0,wet=0,off=0,worst=0;TREES.forEach(T=>{const Z=KGUILIN.at(T.x,T.z);if(Z.zone==='rim'||Z.zone==='wall'||Z.zone==='cliff')bad++;if(Z.zone==='water'||Z.zone==='paddy')wet++;
   if(Z.rock){const d=Math.abs(T.y0+.25-KGUILIN.top(T.x,T.z));worst=Math.max(worst,d);if(d>.05)off++;}});
  return{ok:bad===0&&wet===0&&off===0&&TREES.length>500,detail:TREES.length+' trees; '+bad+' on a rim, a cliff or a wall; '+wet+' in water or a paddy; '+off+' off the rock\'s top (worst '+worst.toFixed(3)+' m)'};},
 // the towers are green: their domes carry oaks and pines, their faces scrub (the share of the cliff points drawn)
 towers(TREES,N,cliff){const onRock=TREES.filter(T=>T.Z&&T.Z.rock&&!T.Z.small).length,pines=TREES.filter(T=>T.sp===6).length,towers=ROCK.filter(B=>B.tower).length;
  const scrub=cliff.filter(c=>c.kind==='scrub').length;
  return{ok:towers>=20&&onRock>towers*30&&pines>towers&&(N.scrub||0)>=scrub*.9&&scrub>towers*150,detail:towers+' towers; '+onRock+' trees on their tops and ledges ('+pines+' Masson pines); '+(N.scrub||0)+' scrub clumps on '+scrub+' cliff points'};},
 // the stone forest: hundreds of blades and pinnacles, none in the pond, each registered
 stoneForest(R){const sf=R.filter(isBlade),wet=sf.filter(B=>pondE(B.x,B.z)<1.1).length,reg=sf.filter(B=>REG.some(r=>r.name===B.name&&r.x===B.x&&r.z===B.z)).length;
  return{ok:sf.length>=200&&wet===0&&reg===sf.length,detail:sf.length+' blades and pinnacles ('+sf.filter(B=>B.kind==='fin').length+' blades); '+wet+' in the pond; '+reg+' registered'};},
 // the paddies: each field drawn in its state (a card for every field but a flooded one), the wet ones on core/water
 paddies(F,N,W){const want=F.filter(P=>P.state!=='flooded').length,got=(N.ricebed||0)+(N.ricerows||0),wetF=F.filter(P=>P.state!=='ripe').length;
  return{ok:F.length>=100&&got===want&&!!W&&W.paddies.length===wetF,detail:F.length+' fields ('+['flooded','young','green','ripe'].map(s=>s+' '+F.filter(P=>P.state===s).length).join(', ')+'); '+got+' rice cards of '+want+'; '+(W?W.paddies.length:0)+' still-water records of '+wetF};}};
// the water: core/water's records (the lake open water at its level, the wadi a flow line on its level, the pond and the wet
// paddies still) and drawn; the lake's surface where the lake is (WATER.at over its middle)
HCHK.water=(W,D)=>{if(!W)return{ok:false,detail:'no core/water records'};const c=W.river;let worst=0;
 if(c)c.pts.forEach(p=>{worst=Math.max(worst,Math.abs(p.y-RIVER.level(p.z)));});
 const L=W.lake,lx=-700,lz=shoreZ(-700)-400,atL=L&&WATER.at(lx,lz);
 const ok=!!L&&L.kind==='open'&&L.level===LAKE.level&&atL===L&&!!c&&c.kind==='flow'&&worst<.01&&!!W.pond&&W.pond.kind==='still'&&W.paddies.every(S=>S.kind==='still')&&!!D&&!!D.lake&&!!D.river&&!!D.still;
 return{ok,detail:(L?'the lake: '+L.kind+' at '+L.level+' m, '+(atL===L?'over its water':'NOT over its water'):'no lake')+'; '+(c?'the wadi: '+c.pts.length+' points, off its level by '+worst.toFixed(3)+' m':'no wadi')+'; the pond '+(W.pond?W.pond.kind:'missing')+'; '+W.paddies.length+' paddies; drawn: '+(D?Object.keys(D).join(', '):'none')};};
// the sky: the shared sky at the page's pixel on the scale model, its air the model's there; its night darker than its noon
HCHK.sky=S=>{const P=S.preset,ok=!!P&&P.site.px===SKY_SITE.px&&P.site.py===SKY_SITE.py&&Math.abs(P.air.pressure-1.89)<.02;
 return{ok,detail:P?'site px '+P.site.px+','+P.site.py+'; air '+P.air.pressure+' atm, humidity '+P.air.humidity:'no preset'};};
// the borrowed species (nwbay's, read in place): each placed in its zones; the cliff figs on the ground at a tower's foot
HCHK.borrowed=(BT,N)=>{const by={};BT.forEach(T=>{by[T.key]=(by[T.key]||0)+1;});const want=['prismgum','ironbark','fancrown','clifffig','flamecrown','treefern','pandan','lotustrumpet','pipereed'];
 const miss=want.filter(k=>!by[k]),figs=BT.filter(T=>T.key==='clifffig'),atFoot=figs.filter(T=>{const Z=KGUILIN.at(T.x,T.z);return !Z.rock&&Z.footD<KGUILIN.reachOf('clifffig',NWBAY.byKey.clifffig.rb[1]*1.15)+16;}).length,
  bad=BT.filter(T=>{const Z=KGUILIN.at(T.x,T.z);return T.water?!(Z.zone==='shallows'||Z.zone==='water'||Z.zone==='shore'):Z.rock||Z.zone==='water'||Z.zone==='paddy'||Z.zone==='wall';}).length;
 return{ok:!miss.length&&figs.length>=10&&atFoot===figs.length&&bad===0,detail:BT.length+' borrowed trees ('+want.map(k=>k+' '+(by[k]||0)).join(', ')+'); '+atFoot+' of '+figs.length+' figs at a tower\'s foot; '+bad+' out of their zone'+(miss.length?'; missing: '+miss.join(', '):'')};};
// roots (the owner, 2026-10-26): no tree's root spread hangs off a stack. Every tree on a tower's top or dome keeps it on that
// body's top (KGUILIN.rootsFit); every cliff fig at a foot keeps it on the ground, short of the wall (KGUILIN.groundFit); each
// at its reach, measured with the bole it was drawn with
HCHK.roots=(own,BT)=>{const L=[];own.forEach(T=>{const Z=KGUILIN.at(T.x,T.z);if(Z.rock&&!Z.small)L.push({T,key:KGUILIN.SPECIES[T.sp].key,B:Z.B});});
 const F=BT.filter(T=>T.key==='clifffig'),badR=L.filter(e=>!KGUILIN.rootsFit(e.T.x,e.T.z,e.T.y0+.25,KGUILIN.reachOf(e.key,e.T.rb),e.B)),
  badF=F.filter(T=>!KGUILIN.groundFit(T.x,T.z,T.y0+.5,KGUILIN.reachOf('clifffig',T.rb)));
 return{ok:!badR.length&&!badF.length&&F.length>=10,detail:L.length+' trees on the rock, '+badR.length+' with roots off the top'+(badR.length?' ('+badR.slice(0,3).map(e=>e.key+' at '+e.T.x.toFixed(0)+','+e.T.z.toFixed(0)).join(', ')+')':'')+'; '+F.length+' cliff figs at the feet (reach to '+Math.max(0,...F.map(T=>KGUILIN.reachOf('clifffig',T.rb))).toFixed(1)+' m), '+badF.length+' with roots on the rock or off the ground'};};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),N=_itemCounts();
 add('roots stay on the rock or the ground (no tree\'s spread hangs off a stack)',HCHK.roots(KGUILIN.TREES,KGUILIN.BTREES||[]));
 add('the lake, the wadi, the pond and the paddies on core/water',HCHK.water(WATER_RECS,WATER_DRAW));
 add('the shared sky at the page\'s pixel, the model\'s air',HCHK.sky(SKY));
 add('nwbay\'s species placed by this kit\'s zones',HCHK.borrowed(KGUILIN.BTREES||[],N));
 add('fruit tagged, catalogued and drawn',HCHK.fruit(KGUILIN.SPECIES,KGUILIN.PLANTS,N));
 add('a fruit, a staple and a medicinal plant',HCHK.three(KGUILIN.SPECIES,KGUILIN.PLANTS,N));
 add('no tree on a rim, in water or a paddy; feet on the rock',HCHK.cliffs(KGUILIN.TREES));
 add('the towers are green (domes forested, faces in scrub)',HCHK.towers(KGUILIN.TREES,N,KGUILIN.CLIFF));
 add('the stone forest stands, out of the pond, registered',HCHK.stoneForest(ROCK));
 add('the paddies drawn in their states',HCHK.paddies(KGUILIN.PADDIES,N,WATER_RECS));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),N=_itemCounts(),PL=KGUILIN.PLANTS;
 add('the wadi lifted off its level',HCHK.water(Object.assign({},WATER_RECS,{river:Object.assign({},WATER_RECS.river,{pts:WATER_RECS.river.pts.map((p,i)=>i===5?Object.assign({},p,{y:p.y+1}):p)})}),WATER_DRAW));
 add('no pond',HCHK.water(Object.assign({},WATER_RECS,{pond:null}),WATER_DRAW));
 add('no lake',HCHK.water(Object.assign({},WATER_RECS,{lake:null}),WATER_DRAW));
 add('the sky at another pixel',HCHK.sky({preset:Object.assign({},SKY.preset,{site:{px:0,py:0}})}));
 add('a cliff fig moved against its wall',HCHK.roots(KGUILIN.TREES,(KGUILIN.BTREES||[]).map((T,i,A)=>{if(i!==A.findIndex(t=>t.key==='clifffig'))return T;const N=KGUILIN.nearestFoot(T.x,T.z),dx=N.S.x-T.x,dz=N.S.z-T.z,dl=Math.hypot(dx,dz)||1;return Object.assign({},T,{x:T.x+dx/dl*(N.d-1),z:T.z+dz/dl*(N.d-1)});})));
 add('no cliff figs',HCHK.borrowed((KGUILIN.BTREES||[]).filter(T=>T.key!=='clifffig'),N));
 add('a jungle giant on a tower\'s top',HCHK.borrowed((KGUILIN.BTREES||[]).concat([(()=>{const B=ROCK.find(b=>b.tower),b=B.beds[B.beds.length-1];return {key:'prismgum',x:b.cx+(b.tx||0),z:b.cz+(b.tz||0)};})()]),N));
 add('an edible plant with no catalog fruit and not listed',HCHK.fruit(KGUILIN.SPECIES.map(S=>S.key==='camphor'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{edible:['x']})})}):S),PL,N));
 add('no lotus seed heads drawn',HCHK.fruit(KGUILIN.SPECIES,PL,Object.assign({},N,{lotuspod:0})));
 add('the medicinal plant not medicinal',HCHK.three(KGUILIN.SPECIES,Object.assign({},PL,{orchid:{name:'x',items:PL.orchid.items,tags:Object.assign({},PL.orchid.tags,{harvest:Object.assign({},PL.orchid.tags.harvest,{medicinal:false})})}}),N));
 add('no rice drawn',HCHK.three(KGUILIN.SPECIES,PL,Object.assign({},N,{ricebed:0,ricerows:0})));
 add('a tree moved onto a rim',HCHK.cliffs(KGUILIN.TREES.concat([(()=>{const B=ROCK.find(b=>b.tower),b=B.beds[B.beds.length-1],a=.7,R2=KSTACKS.footR(b,a)*b.tp*(1-b.ch)-.6;return {x:b.cx+b.tx+Math.cos(a)*R2,z:b.cz+b.tz+Math.sin(a)*R2,y0:b.y+b.h};})()])));
 add('a tree in a paddy',HCHK.cliffs(KGUILIN.TREES.concat([(()=>{const P=KGUILIN.PADDIES.find(F=>F.state!=='flooded');return {x:P.x,z:P.z,y0:P.level};})()])));
 add('a tree off the rock\'s top',HCHK.cliffs(KGUILIN.TREES.map((T,i)=>i===KGUILIN.TREES.findIndex(t=>KGUILIN.at(t.x,t.z).rock)?Object.assign({},T,{y0:T.y0+2}):T)));
 add('bare towers (no scrub drawn)',HCHK.towers(KGUILIN.TREES,Object.assign({},N,{scrub:0}),KGUILIN.CLIFF));
 add('a blade standing in the pond',HCHK.stoneForest(ROCK.concat([Object.assign({},ROCK.find(isBlade),{x:POND.x,z:POND.z})])));
 add('a field left undrawn',HCHK.paddies(KGUILIN.PADDIES,Object.assign({},N,{ricebed:(N.ricebed||0)-1}),WATER_RECS));
 return R;}

// ---------------------------------------------------------------- the page, handed to the host
window._registered=REG.length;
KHOST.on(skyView,'view');   /* the shared sky, its lights and fog at the hour (89s-host-sky.js) */
KHOST.take({build:'kguilin',title:'Krator biome — the Hykkousoi hinterlands (k-guilin)',
 hint:'The Hykkousoi hinterlands: limestone towers on the lakeshore by Trigon, the wadi and its paddies, the fengcong, the stone forest',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:10},draw:HOST_DRAW,   /* the reflections switch (89w), the shared sky's pass, then the world (89s-host-sky.js); the page opens at 10:00 */
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'the rock':{match:o=>!!(o.userData&&o.userData.rock)},
  'water':{match:o=>!!(o.name&&/^water:/.test(o.name))||o===(WATER_DRAW&&WATER_DRAW.still)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export(),layout:()=>KGUILIN.records()},
 minimap:{title:'The Hykkousoi hinterlands (k-guilin)'},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome}});
