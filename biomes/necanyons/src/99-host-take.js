// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says
// what this page has.
const VIEWS={
 'The canyons':[1650,560,1500,150,180,-150],
 'From afar':[-2600,420,2300,0,200,0],
 'Krator rising':[-500,180,700,1900,900,-2100],
 'The creek':[CREEK.x(900)+20,floorH(CREEK.x(900),900)+14,900,CREEK.x(400),20,400],
};
// views found from the built layout: the Bench's fins, a seep line, a wall's foot, the High Cap, a tower
(function(){const R=ROCK,by=id=>R.find(B=>B.id===id),bench=by('bench'),hc=by('highcap');
 const fin=R.find(B=>/^benchfin/.test(B.id));
 if(fin){const a=Math.atan2(fin.z-bench.z,fin.x-bench.x);VIEWS['The Bench\'s fins (roost height)']=[fin.x+Math.cos(a)*120,fin.top+25,fin.z+Math.sin(a)*120,fin.x,fin.top-20,fin.z];}
 const gd=R.find(B=>/^benchgarden/.test(B.id));if(gd)VIEWS['The Bench\'s garden']=[gd.x+60,gd.y0+12,gd.z+70,gd.x,gd.y0+25,gd.z];
 const S=(NECANYONS.SEEPS||[]).filter(s=>s.body===0&&s.seep>.6).sort((a,b)=>Math.hypot(a.x-500,a.z-100)-Math.hypot(b.x-500,b.z-100))[0];
 if(S)VIEWS['A seep line (the hanging gardens)']=[S.x+S.nx*28,S.y+6,S.z+S.nz*28,S.x,S.y-3,S.z];
 const cj=(NECANYONS.TRAPPED||[]).filter(t=>t.key==='clapjaw').sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))[0];
 if(cj)VIEWS['Clapjaws in the damp sand']=[cj.x+2.2,cj.y+1.4,cj.z+1.6,cj.x,cj.y+.1,cj.z];
 const mc=(NECANYONS.TRAPPED||[]).filter(t=>t.key==='monkeycup').sort((a,b)=>Math.hypot(a.x-400,a.z)-Math.hypot(b.x-400,b.z))[0];
 if(mc){const Z=NECANYONS.at(mc.x+1,mc.z),B=Z.B||ROCK[0],a=Math.atan2(mc.z-B.z,mc.x-B.x);VIEWS['A monkeycup vine']=[mc.x+Math.cos(a)*11+Math.sin(a)*4,mc.y+3,mc.z+Math.sin(a)*11-Math.cos(a)*4,mc.x,mc.y+5,mc.z];}
 if(hc){const cb=hc.beds[hc.beds.length-1];VIEWS['The High Cap (dry)']=[cb.cx+40,hc.top+6,cb.cz+60,cb.cx-60,hc.top-4,cb.cz-80];}
 const pt=(NECANYONS.TRAPPED||[]).filter(t=>t.key==='potholewort')[0];if(pt)VIEWS['A rain pool on the cap']=[pt.x+4,pt.y+2.2,pt.z+3,pt.x,pt.y,pt.z];
 const tw=by('tower0');if(tw)VIEWS['A tower out of the jungle']=[tw.x+260,140,tw.z+200,tw.x,tw.top*.6,tw.z];
 const fig=NECANYONS.nearestTree&&NECANYONS.nearestTree(1,500,0);if(fig)VIEWS['A stack fig on a ledge']=[fig.x+(fig.x-fig.body.x)*.08+6,fig.y0+4,fig.z+(fig.z-fig.body.z)*.08+6,fig.x,fig.y0-6,fig.z];})();

// ---------------------------------------------------------------- the inspector's words: a plant names its species, its
// harvest (biomes/FRUIT.md) and, on a carnivore, its trap
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&(NECANYONS.plantOfItem(item)||(HYPERJUNGLE.plantOfItem&&HYPERJUNGLE.plantOfItem(item))),SPx=item&&HYPERJUNGLE.speciesOfItem&&HYPERJUNGLE.speciesOfItem(item);
 const nm=BIO.nameAt?BIO.nameAt(p.x,p.y,p.z):null,NM=nm&&(!best||nm.r<best.r)?nm:null;
 const SB=best&&NECANYONS.SPECIES.find(s=>best.key===s.key),F=PLT||SPx||SB||(NM&&NM.plant?NECANYONS.PLANTS[NM.plant]:null),hv=F&&F.tags?F.tags.harvest:null,tr=F&&F.tags?F.tags.trap:null;
 const Z=NECANYONS.at(p.x,p.z);
 return(NM?NM.name:F?F.name:best?best.name:(o.userData.inspectLabel||item||o.name||'mesh'))+'  ·  '+(o.userData.inspectLabel||item||'')+
  (hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')+
  (tr?'\ntrap: '+tr.kind+' · mouth '+tr.mouth+' m · prey up to '+tr.preyMax+(tr.lure?' · lure '+tr.lure:'')+' · danger '+tr.danger:'')+
  '\nzone '+Z.zone+(Z.seep>.05?' · seep '+Z.seep.toFixed(2):'')+(Z.pan>.05?' · pan':'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}

// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:14000000,calls:220},
 cls:{pass:6500000,host:1200000},
 type:{'necanyons/trees':'pass','necanyons/carnivores':'pass','necanyons/floor':'pass','jungle/hyper':'pass','jungle/trees':'pass','jungle/floor':'pass','jungle/far':'pass','jungle/dress':'pass','jungle/fauna':'pass','host':'host'},
};
// edible plants the catalog has no piece for (named, not hidden: FRUIT.md); the carnivores a page must draw
const FRUIT_NOT_DRAWN=['fanpalm','fonio','sunpitcher'];
const _itemCounts=()=>{const n={};scene.traverse(M=>{if(M.isInstancedMesh&&M.userData.biome){const k=M.name.replace(/^biome:/,'');n[k]=(n[k]||0)+M.count;}});return n;};
const HCHK={
 // fruit: every species and plant carries a harvest tag; every edible one names a catalog piece (or is listed as not
 // drawn); every catalog fruit the kit names is drawn by its item
 fruit(SP,PL,N){const all=SP.map(S=>[S.key,S.tags]).concat(Object.keys(PL).map(k=>[k,PL[k].tags]));
  const untagged=all.filter(e=>!e[1].harvest).map(e=>e[0]);
  const miss=all.filter(e=>e[1].harvest&&e[1].harvest.edible.length&&!e[1].harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(e[0])<0).map(e=>e[0]);
  const keys=[...new Set(all.map(e=>e[1].harvest&&e[1].harvest.fruit).filter(Boolean))],undrawn=keys.filter(k=>!(N[NECANYONS.FRUIT_ITEMS[k]]>0));
  return{ok:!untagged.length&&!miss.length&&!undrawn.length&&keys.length>=2,detail:(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+
   (undrawn.length?'catalogued but not drawn: '+undrawn.join(', ')+'; ':'')+all.length+' tagged; drawn: fig '+(N.fig||0)+', plum '+(N.plum||0)};},
 // the brief's three: a fruit (the stack fig), a staple (fonio), a medicinal plant (rimdew), each drawn
 three(SP,PL,N){const fig=SP.find(s=>s.key==='stackfig'),fon=PL.fonio,dew=PL.rimdew;
  const ok=!!(fig&&fig.tags.harvest.fruit&&N.fig>0&&fon&&fon.tags.harvest.edible.length&&N.fonio>0&&dew&&dew.tags.harvest.medicinal&&(N.sundewR||0)+(N.sundewF||0)>0);
  return{ok,detail:'fruit stackfig ('+(N.fig||0)+' figs), staple fonio ('+(N.fonio||0)+' tufts), medicinal rimdew ('+((N.sundewR||0)+(N.sundewF||0)+(N.sundewB||0))+')'};},
 // the carnivores: each has a trap record in the vocabulary, none can hold a person, each is drawn, and most are registered
 carnivores(PL,N,TRP){const keys=Object.keys(PL).filter(k=>PL[k].tags.trap),bad=[],undrawn=[];
  keys.forEach(k=>{const t=PL[k].tags.trap;if(!KTRAPS.KINDS[t.kind]||KTRAPS.catches(t,'person').caught||t.danger!==0)bad.push(k);if(!PL[k].items.some(i=>N[i]>0))undrawn.push(k);});
  const reg=[...new Set(TRP.map(t=>t.key))];
  return{ok:keys.length>=7&&!bad.length&&!undrawn.length&&reg.length>=6,detail:keys.length+' carnivores'+(bad.length?'; a trap that could hold a person or is not in the vocabulary: '+bad.join(', '):'')+
   (undrawn.length?'; not drawn: '+undrawn.join(', '):'')+'; registered with their traps: '+reg.join(', ')+' ('+TRP.length+' patches)'};},
 // the cliff rule: no tree roots on a rim or under a wall; a tree on the rock stands on the rock's drawn top
 cliffs(TREES){let rim=0,off=0,worst=0;TREES.forEach(T=>{const Z=NECANYONS.at(T.x,T.z);if(Z.zone==='rim'||Z.zone==='wall')rim++;
   if(Z.rock){const d=Math.abs(T.y0+.25-NECANYONS.top(T.x,T.z));worst=Math.max(worst,d);if(d>.05)off++;}});
  return{ok:rim===0&&off===0&&TREES.length>50,detail:TREES.length+' trees; '+rim+' on a rim or a wall; '+off+' off the rock\'s top (worst '+worst.toFixed(3)+' m)'};},
 // the clapjaws move: their lobes carry a trap phase and a side each
 snaps(list){const m=list||[];if(!list)scene.traverse(M=>{if(M.isInstancedMesh&&/lobe$/.test(M.name))m.push(M);});let n=0,sides=0;
  m.forEach(M=>{const a=M.geometry.getAttribute('aTrap');if(!a)return;for(let i=0;i<a.count;i++){n++;if(a.getY(i)!==0)sides++;}});
  return{ok:n>0&&sides===n,detail:n+' lobes, '+sides+' hinged'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),N=_itemCounts();
 add('fruit tagged, catalogued and drawn',HCHK.fruit(NECANYONS.SPECIES,NECANYONS.PLANTS,N));
 add('a fruit, a staple and a medicinal plant',HCHK.three(NECANYONS.SPECIES,NECANYONS.PLANTS,N));
 add('carnivores: trap records, harmless to a person, drawn, registered',HCHK.carnivores(NECANYONS.PLANTS,N,NECANYONS.TRAPPED||[]));
 add('no tree on a rim; feet on the rock',HCHK.cliffs(NECANYONS.TREES));
 add('the clapjaws\' lobes hinge',HCHK.snaps());
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),N=_itemCounts(),PL=NECANYONS.PLANTS;
 add('a fruiting species with no catalog fruit',HCHK.fruit(NECANYONS.SPECIES.map(S=>S.key==='stackfig'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),PL,N));
 add('no figs drawn',HCHK.fruit(NECANYONS.SPECIES,PL,Object.assign({},N,{fig:0})));
 add('the medicinal plant not medicinal',HCHK.three(NECANYONS.SPECIES,Object.assign({},PL,{rimdew:{name:'x',items:PL.rimdew.items,tags:Object.assign({},PL.rimdew.tags,{harvest:Object.assign({},PL.rimdew.tags.harvest,{medicinal:false})})}}),N));
 add('a carnivore that can hold a person',HCHK.carnivores(Object.assign({},PL,{clapjaw:{name:'x',items:PL.clapjaw.items,tags:Object.assign({},PL.clapjaw.tags,{trap:KTRAPS.make({kind:'grab',preyMax:'person',danger:.5})})}}),N,NECANYONS.TRAPPED||[]));
 add('a carnivore not drawn',HCHK.carnivores(PL,Object.assign({},N,{tube:0}),NECANYONS.TRAPPED||[]));
 add('a tree moved onto a rim',HCHK.cliffs(NECANYONS.TREES.concat([(()=>{const s=NECANYONS.SEEPS[0];return {x:s.x,z:s.z,y0:s.y};})()])));
 add('a tree off the rock\'s top',HCHK.cliffs(NECANYONS.TREES.map((T,i)=>i===NECANYONS.TREES.findIndex(t=>NECANYONS.at(t.x,t.z).rock)?Object.assign({},T,{y0:T.y0+2}):T)));
 add('lobes with no hinge',HCHK.snaps([{geometry:{getAttribute:()=>({count:4,getY:()=>0})}}]));
 return R;}

// ---------------------------------------------------------------- the page, handed to the host
window._registered=REG.length;
KHOST.take({build:'necanyons',title:'Krator biome — the north-eastern canyons',
 hint:'The north-eastern canyons: red sandstone benches, caps and stacks out of the hyperjungle; the first carnivorous plants',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'carnivores':{match:o=>!!(o.isInstancedMesh&&o.userData&&o.userData.biome&&NECANYONS.plantOfItem((o.name||'').replace(/^biome:/,''))&&NECANYONS.plantOfItem((o.name||'').replace(/^biome:/,'')).tags.trap)},
  'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'the rock':{match:o=>!!(o.userData&&o.userData.rock)},'sky':{objects:()=>[sky,giant,giantRing]}},
 exporters:{biome:()=>BIO.export(),layout:()=>NECANYONS.records()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome,jungle:()=>window._jungle}});
