// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says
// what this page has.
const VIEWS={
 'The Li River':[RIVER.x(1250)-30,24,1250,RIVER.x(300),40,300],
 'From afar':[-2500,520,2300,0,120,0],
 'Krator rising':[-500,180,700,1900,900,-2100],
};
// views found from the built layout: the stone forest, the fengcong, a tower's dome, the paddies, the pond, the bend
(function(){const R=ROCK,by=id=>R.find(B=>B.id===id);
 VIEWS['Over the stone forest']=[SF.c[0]+330,120,SF.c[1]+300,SF.c[0]-40,10,SF.c[1]-20];
 // inside the stone forest: a gap among the blades near the middle, looking along it
 {let best=null;for(let k=0;k<40&&!best;k++){const a=k*2.4,r=60+k*3,x=SF.c[0]+Math.cos(a)*r,z=SF.c[1]+Math.sin(a)*r,Z=GUILIN.at(x,z);if(!Z.rock&&Z.footD>2&&Z.footD<6&&pondE(x,z)>1.6)best=[x,z,a];}
  if(best){const y=terrainH(best[0],best[1]);VIEWS['In the stone forest']=[best[0],y+1.7,best[1],best[0]+Math.cos(best[2]+1.6)*40,y+7,best[1]+Math.sin(best[2]+1.6)*40];}}
 VIEWS['The pond in the stone forest']=[POND.x+POND.rx*1.7,POND.level+4,POND.z+POND.rz*1.5,POND.x,POND.level,POND.z];
 const fc=by('fcbase');if(fc)VIEWS['The fengcong']=[fc.x-950,160,fc.z+700,fc.x,90,fc.z];
 const bn=by('bendN');if(bn)VIEWS['A tower at the river\'s edge']=[RIVER.x(-200),18,-200,bn.x,bn.top*.45,bn.z];
 const t=R.filter(B=>/^tower/.test(B.id)).sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))[0];
 if(t){const cb=t.beds[t.beds.length-1];VIEWS['A tower\'s dome (the scrub forest)']=[cb.cx+t.R*.9,t.top+30,cb.cz+t.R*.7,cb.cx,t.top-20,cb.cz];}
 const P=GUILIN.PADDIES.filter(F=>F.state==='green').sort((a,b)=>Math.hypot(a.x-RIVER.x(a.z)-120,a.z)-Math.hypot(b.x-RIVER.x(b.z)-120,b.z))[0];
 if(P)VIEWS['The paddies']=[P.x+60,P.level+9,P.z+50,P.x-60,P.level+20,P.z-60];
 const o=GUILIN.CLIFF.filter(c=>c.kind==='orchid'&&c.up<.4&&!GUILIN.bodies()[c.body].kind.match(/fin|spire/)).sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))[0];
 if(o)VIEWS['A stone orchid on the cliff']=[o.x+o.nx*5,o.y+.8,o.z+o.nz*5,o.x,o.y,o.z];
 const bb=GUILIN.nearestTree&&GUILIN.nearestTree(0,RIVER.x(0)+RIVER.w+10,0);if(bb)VIEWS['Bamboo on the bank']=[bb.x-(bb.x-RIVER.x(bb.z))*.5,RIVER.level(bb.z)+3,bb.z+18,bb.x,bb.y0+6,bb.z];})();

// ---------------------------------------------------------------- the inspector's words: a plant names its species and its
// harvest (biomes/FRUIT.md); a paddy its state and crop
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&GUILIN.plantOfItem(item);
 const nm=BIO.nameAt?BIO.nameAt(p.x,p.y,p.z):null,NM=nm&&(!best||nm.r<best.r)?nm:null;
 const SB=best&&GUILIN.SPECIES.find(s=>best.key===s.key),F=PLT||SB||(NM&&NM.plant?GUILIN.PLANTS[NM.plant]:null),hv=F&&F.tags?F.tags.harvest:null;
 const Z=GUILIN.at(p.x,p.z),pd=Z.paddy||GUILIN.paddyAt(p.x,p.z);
 return(NM?NM.name:F?F.name:best?best.name:(o.userData.inspectLabel||item||o.name||'mesh'))+'  ·  '+(o.userData.inspectLabel||item||'')+
  (hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')+
  (pd?'\npaddy '+pd.id+' · '+pd.state+' · crop '+pd.crop+' (kits/crops)':'')+
  '\nzone '+Z.zone+(Z.rock?' · '+(Z.up*100).toFixed(0)+'% up its tower':'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}

// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:14000000,calls:220},
 cls:{pass:6500000,host:2600000},
 type:{'guilin/trees':'pass','guilin/cliffs':'pass','guilin/floor':'pass','host':'host'},
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
  const keys=[...new Set(all.map(e=>e[1].harvest&&e[1].harvest.fruit).filter(Boolean))],undrawn=keys.filter(k=>!(N[GUILIN.FRUIT_ITEMS[k]]>0));
  return{ok:!untagged.length&&!miss.length&&!undrawn.length&&keys.length>=1,detail:(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+
   (undrawn.length?'catalogued but not drawn: '+undrawn.join(', ')+'; ':'')+all.length+' tagged; drawn: lotus seed heads '+(N.lotuspod||0)+', pomelos '+(N.pomelo||0)};},
 // the brief's three: a fruit (the pomelo), the staple (rice, in the paddies), a medicinal plant (the stone orchid), each drawn
 three(SP,PL,N){const pom=SP.find(s=>s.key==='pomelo'),rice=PL.rice,orc=PL.orchid;
  const ok=!!(pom&&pom.tags.harvest.edible.length&&N.pomelo>0&&rice&&rice.tags.harvest.edible.length&&rice.tags.crop==='rice'&&(N.ricebed||0)+(N.ricerows||0)>0&&orc&&orc.tags.harvest.medicinal&&N.orchid>0);
  return{ok,detail:'fruit pomelo ('+(N.pomelo||0)+'), staple rice ('+((N.ricebed||0)+(N.ricerows||0))+' fields, '+(N.rice||0)+' tufts), medicinal stone orchid ('+(N.orchid||0)+')'};},
 // the cliff rule: no tree roots on a rim, under a wall, in water or in a paddy; a tree on the rock stands on the rock's drawn top
 cliffs(TREES){let bad=0,wet=0,off=0,worst=0;TREES.forEach(T=>{const Z=GUILIN.at(T.x,T.z);if(Z.zone==='rim'||Z.zone==='wall'||Z.zone==='cliff')bad++;if(Z.zone==='water'||Z.zone==='paddy')wet++;
   if(Z.rock){const d=Math.abs(T.y0+.25-GUILIN.top(T.x,T.z));worst=Math.max(worst,d);if(d>.05)off++;}});
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
// the water: core/water's records (the river a flow line on its level, the pond and the wet paddies still) and drawn
HCHK.water=(W,D)=>{if(!W)return{ok:false,detail:'no core/water records'};const c=W.river;let worst=0;
 if(c)c.pts.forEach(p=>{worst=Math.max(worst,Math.abs(p.y-RIVER.level(p.z)));});
 const ok=!!c&&c.kind==='flow'&&worst<.01&&!!W.pond&&W.pond.kind==='still'&&W.paddies.every(S=>S.kind==='still')&&!!D&&!!D.river&&!!D.still;
 return{ok,detail:(c?'the river: '+c.pts.length+' points, off its level by '+worst.toFixed(3)+' m':'no river')+'; the pond '+(W.pond?W.pond.kind:'missing')+'; '+W.paddies.length+' paddies; drawn: '+(D?Object.keys(D).join(', '):'none')};};
// the night: midnight's key light is the giant's and dim, the dome and the fog dark; noon's are the page's own
HCHK.night=N=>{const h0=N.hourNow;N.hour(0);const n={i:sun.intensity,sky:sky.material.color.getHSL({}).l,fog:scene.fog.color.getHSL({}).l,f:N.f};
 N.hour(13);const d={i:sun.intensity,sky:sky.material.color.getHSL({}).l,fog:scene.fog.color.getHSL({}).l,f:N.f};N.hour(h0);
 return{ok:n.f===1&&d.f===0&&n.i<d.i*.3&&n.sky<.3&&n.fog<.2&&d.sky>.9,detail:'midnight: key '+n.i.toFixed(2)+', dome '+n.sky.toFixed(2)+', fog '+n.fog.toFixed(2)+'; noon: key '+d.i.toFixed(2)+', dome '+d.sky.toFixed(2)};};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),N=_itemCounts();
 add('the river, the pond and the paddies on core/water',HCHK.water(WATER_RECS,WATER_DRAW));
 add('the night darkens the light, the dome and the fog',HCHK.night(NIGHT));
 add('fruit tagged, catalogued and drawn',HCHK.fruit(GUILIN.SPECIES,GUILIN.PLANTS,N));
 add('a fruit, a staple and a medicinal plant',HCHK.three(GUILIN.SPECIES,GUILIN.PLANTS,N));
 add('no tree on a rim, in water or a paddy; feet on the rock',HCHK.cliffs(GUILIN.TREES));
 add('the towers are green (domes forested, faces in scrub)',HCHK.towers(GUILIN.TREES,N,GUILIN.CLIFF));
 add('the stone forest stands, out of the pond, registered',HCHK.stoneForest(ROCK));
 add('the paddies drawn in their states',HCHK.paddies(GUILIN.PADDIES,N,WATER_RECS));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),N=_itemCounts(),PL=GUILIN.PLANTS;
 add('the river lifted off its level',HCHK.water(Object.assign({},WATER_RECS,{river:Object.assign({},WATER_RECS.river,{pts:WATER_RECS.river.pts.map((p,i)=>i===5?Object.assign({},p,{y:p.y+1}):p)})}),WATER_DRAW));
 add('no pond',HCHK.water(Object.assign({},WATER_RECS,{pond:null}),WATER_DRAW));
 add('a night that does not darken',HCHK.night({hourNow:12,f:0,hour(h){this.hourNow=h;this.f=h<6?1:0;}}));
 add('an edible plant with no catalog fruit and not listed',HCHK.fruit(GUILIN.SPECIES.map(S=>S.key==='camphor'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{edible:['x']})})}):S),PL,N));
 add('no lotus seed heads drawn',HCHK.fruit(GUILIN.SPECIES,PL,Object.assign({},N,{lotuspod:0})));
 add('the medicinal plant not medicinal',HCHK.three(GUILIN.SPECIES,Object.assign({},PL,{orchid:{name:'x',items:PL.orchid.items,tags:Object.assign({},PL.orchid.tags,{harvest:Object.assign({},PL.orchid.tags.harvest,{medicinal:false})})}}),N));
 add('no rice drawn',HCHK.three(GUILIN.SPECIES,PL,Object.assign({},N,{ricebed:0,ricerows:0})));
 add('a tree moved onto a rim',HCHK.cliffs(GUILIN.TREES.concat([(()=>{const B=ROCK.find(b=>b.tower),b=B.beds[B.beds.length-1],a=.7,R2=KSTACKS.footR(b,a)*b.tp*(1-b.ch)-.6;return {x:b.cx+b.tx+Math.cos(a)*R2,z:b.cz+b.tz+Math.sin(a)*R2,y0:b.y+b.h};})()])));
 add('a tree in a paddy',HCHK.cliffs(GUILIN.TREES.concat([(()=>{const P=GUILIN.PADDIES.find(F=>F.state!=='flooded');return {x:P.x,z:P.z,y0:P.level};})()])));
 add('a tree off the rock\'s top',HCHK.cliffs(GUILIN.TREES.map((T,i)=>i===GUILIN.TREES.findIndex(t=>GUILIN.at(t.x,t.z).rock)?Object.assign({},T,{y0:T.y0+2}):T)));
 add('bare towers (no scrub drawn)',HCHK.towers(GUILIN.TREES,Object.assign({},N,{scrub:0}),GUILIN.CLIFF));
 add('a blade standing in the pond',HCHK.stoneForest(ROCK.concat([Object.assign({},ROCK.find(isBlade),{x:POND.x,z:POND.z})])));
 add('a field left undrawn',HCHK.paddies(GUILIN.PADDIES,Object.assign({},N,{ricebed:(N.ricebed||0)-1}),WATER_RECS));
 return R;}

// ---------------------------------------------------------------- the page, handed to the host
window._registered=REG.length;
KHOST.take({build:'guilin',title:'Krator biome — Guilin, the South China karst',
 hint:'Guilin: limestone towers over the Li River and its paddies, the fengcong, and the stone forest. N for night',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 // the world hour (the panel's slider, ?hour=): the night's light, fog and dome (89n-host-night.js); N flips noon and midnight
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},hour:h=>NIGHT.hour(h)},
 clock:{hour:10},keys:{n:()=>NIGHT.flip()},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'the rock':{match:o=>!!(o.userData&&o.userData.rock)},
  'water':{match:o=>!!(o.name&&/^water:/.test(o.name))||o===(WATER_DRAW&&WATER_DRAW.still)},'sky':{objects:()=>[sky,giant,giantRing]}},
 exporters:{biome:()=>BIO.export(),layout:()=>GUILIN.records()},
 minimap:{title:'Guilin, the South China karst'},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome}});
