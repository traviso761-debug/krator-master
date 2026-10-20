// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host (station 1: the tepui)
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says
// what this page has.
const VIEWS={
 'The table':[1700,420,1500,TABLE.x,TABLE.y0+300,TABLE.z],
 'From afar':[-2500,500,2300,TABLE.x,TABLE.y0+250,TABLE.z],
 'Krator rising':[-400,120,900,1900,900,-2100],
 'The stream':[STREAM.x(900)+22,floorH(STREAM.x(900),900)+16,900,STREAM.x(400),floorH(STREAM.x(400),400)+2,400],
};
// views found from the built layout: the summit, the shoulder, a seep line, the carvings, the stacks, the hell
(function(){const T=TABLE,top=T.beds[T.beds.length-1];
 VIEWS['The summit (the pavement and its bogs)']=[top.cx+30,T.top+9,top.cz+120,top.cx-200,T.top-30,top.cz-260];
 const sh=T.beds.find((b,i)=>i>0&&T.beds[i].tier===1)||T.beds[1],shA=-2.1,shR=KSTACKS.footR(T.beds[sh.k-1],shA)*.9;
 VIEWS['The shoulder (under the summit\'s wall)']=[T.beds[sh.k-1].cx+Math.cos(shA)*shR,sh.y+10,T.beds[sh.k-1].cz+Math.sin(shA)*shR,T.beds[sh.k-1].cx+Math.cos(shA+.5)*shR,sh.y+4,T.beds[sh.k-1].cz+Math.sin(shA+.5)*shR];
 const S=(NECANYONS.SEEPS||[]).filter(s=>s.body===0&&s.seep>.6).sort((a,b)=>b.seep-a.seep)[0];
 if(S)VIEWS['A seep line (the hanging gardens)']=[S.x+S.nx*30,S.y+7,S.z+S.nz*30,S.x,S.y-3,S.z];
 const cv=CARVINGS[0];if(cv){const a=Math.atan2(cv.z-T.z,cv.x-T.x);VIEWS['The carvings (the Hum on the wall)']=[cv.x+Math.cos(a)*16,cv.y+cv.h*.5,cv.z+Math.sin(a)*16,cv.x,cv.y+cv.h*.5,cv.z];}
 const st=STAGE.bodies.find(B=>/^gorgestack/.test(B.id));if(st)VIEWS['The stacks (a fallen rim)']=[st.x+260,120,st.z+200,st.x,st.top*.6,st.z];
 const me=(typeof KORONA!=='undefined'&&KORONA.TRAPPED||[]).filter(t=>t.key==='maneater').sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))[0];
 if(me)VIEWS['A man-eater (the hell at the walls\' feet)']=[me.x+6,me.y+2.6,me.z+4.5,me.x,me.y+1.4,me.z];
 {const TR=(typeof KORONA!=='undefined'&&KORONA.TRAPPED)||[],near=(k,x,z)=>TR.filter(t=>t.key===k).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];
 const pj=near('punjipit',0,0);if(pj)VIEWS['A punji pit']=[pj.x+4,pj.y+2,pj.z+3,pj.x,pj.y+.2,pj.z];
 const bt=near('beartrap',0,0);if(bt)VIEWS['A bear-trap plant']=[bt.x+3.5,bt.y+1.8,bt.z+2.5,bt.x,bt.y+.2,bt.z];
 const nt=near('numbthorn',0,0);if(nt)VIEWS['A numb thorn']=[nt.x+4,nt.y+2,nt.z+3,nt.x,nt.y+1,nt.z];
 }
 const gs=(typeof KORONA!=='undefined'&&KORONA.TRAPPED||[]).filter(t=>t.key==='greatsundew')[0];
 if(gs)VIEWS['A great sundew']=[gs.x+7,gs.y+3,gs.z+5,gs.x,gs.y+1.5,gs.z];
 const rf=(typeof KORONA!=='undefined'&&KORONA.NAMED||[]).filter(t=>t.plant==='rainbowfan')[0];
 if(rf)VIEWS['The rainbow fans (a reagent, in a summit pocket)']=[rf.x+3,rf.y+1.6,rf.z+2.4,rf.x,rf.y+.4,rf.z];
 const lf=(typeof KORONA!=='undefined'&&KORONA.nearestTree)?KORONA.nearestTree(1,-700,-200):null;
 if(lf)VIEWS['A lace fan tree']=[lf.x+14,lf.y0+6,lf.z+10,lf.x,lf.y0+lf.H*.6,lf.z];
 const fig=NECANYONS.nearestTree&&NECANYONS.nearestTree(1,TABLE.x,TABLE.z);if(fig)VIEWS['A stack fig on a ledge']=[fig.x+(fig.x-fig.body.x)*.08+6,fig.y0+4,fig.z+(fig.z-fig.body.z)*.08+6,fig.x,fig.y0-6,fig.z];})();

// ---------------------------------------------------------------- the inspector's words: a plant names its species, its harvest and, on a carnivore, its trap
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,''):null;
 const KO=typeof KORONA!=='undefined'?KORONA:null;
 const PLT=item&&((KO&&KO.plantOfItem(item))||NECANYONS.plantOfItem(item)||(HYPERJUNGLE.plantOfItem&&HYPERJUNGLE.plantOfItem(item))),SPx=item&&HYPERJUNGLE.speciesOfItem&&HYPERJUNGLE.speciesOfItem(item);
 const nm=BIO.nameAt?BIO.nameAt(p.x,p.y,p.z):null,NM=nm&&(!best||nm.r<best.r)?nm:null;
 const SB=best&&(NECANYONS.SPECIES.find(s=>best.key===s.key)||(KO&&KO.SPECIES.find(s=>best.key===s.key)));
 const F=PLT||SPx||SB||(NM&&NM.plant?((KO&&KO.PLANTS[NM.plant])||NECANYONS.PLANTS[NM.plant]):null),hv=F&&F.tags?F.tags.harvest:null,tr=F&&F.tags?F.tags.trap:null;
 const Z=NECANYONS.at(p.x,p.z),hell=hellAt(p.x,p.z);
 return(NM?NM.name:F?F.name:best?best.name:(o.userData.inspectLabel||item||o.name||'mesh'))+'  ·  '+(o.userData.inspectLabel||item||'')+
  (hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')+
  (tr?'\ntrap: '+tr.kind+' · mouth '+tr.mouth+' m · prey up to '+tr.preyMax+(tr.lure?' · lure '+tr.lure:'')+' · danger '+tr.danger+(tr.danger>0?' (HAZARD)':''):'')+
  '\nzone '+Z.zone+' · poor '+BIO.field('poor',p.x,p.z).toFixed(2)+' · wet '+BIO.field('wet',p.x,p.z).toFixed(2)+' · warm '+BIO.field('warm',p.x,p.z).toFixed(2)+' · hell '+hell.toFixed(2)+(Z.seep>.05?' · seep '+Z.seep.toFixed(2):'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}

// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:16000000,calls:260},
 cls:{pass:7500000,host:1800000},
 type:{'necanyons/trees':'pass','necanyons/carnivores':'pass','necanyons/floor':'pass','korona/trees':'pass','korona/carnivores':'pass','korona/floor':'pass',
  'jungle/hyper':'pass','jungle/trees':'pass','jungle/floor':'pass','jungle/far':'pass','jungle/dress':'pass','jungle/fauna':'pass','host':'host'},
};
const _itemCounts=()=>{const n={};scene.traverse(M=>{if(M.isInstancedMesh&&M.userData.biome){const k=M.name.replace(/^biome:/,'');n[k]=(n[k]||0)+M.count;}});return n;};
const HCHK={
 // the man-eaters: every Korona trap is in the vocabulary; the ones meant for a person catch one and carry a danger (the
 // hazard); each is drawn; the dangerous ones are registered one by one with their trap
 maneaters(PL,N,TRP){const keys=Object.keys(PL).filter(k=>PL[k].tags.trap),bad=[],undrawn=[],tame=[];
  keys.forEach(k=>{const t=PL[k].tags.trap;if(!KTRAPS.KINDS[t.kind])bad.push(k);if(t.preyMax==='person'&&!(KTRAPS.catches(t,'person').caught&&t.danger>=.5))tame.push(k);
   if(!PL[k].items.some(i=>N[i]>0)&&!((k==='bladderpool'||k==='trappad')&&!STAGE.pools.some(p=>p.bed))&&!((k==='butterwort'||k==='frosttank')&&!(STAGE.bias&&STAGE.bias[k])))undrawn.push(k);});
  const reg=[...new Set(TRP.filter(t=>t.trap.danger>0).map(t=>t.key))];
  return{ok:keys.length>=8&&!bad.length&&!undrawn.length&&!tame.length&&reg.length>=3,detail:keys.length+' carnivores'+(bad.length?'; not in the vocabulary: '+bad.join(', '):'')+
   (tame.length?'; meant for a person but harmless: '+tame.join(', '):'')+(undrawn.length?'; not drawn: '+undrawn.join(', '):'')+'; dangerous ones registered: '+reg.join(', ')+' ('+TRP.length+' records)'};},
 // THE RULE: a man-eater stands only where the ground is poor, wet and warm (the hell field above its threshold)
 rule(TRP){const big=TRP.filter(t=>t.trap.danger>=.5);let off=0,lo=1;big.forEach(t=>{const h=hellAt(t.x,t.z);lo=Math.min(lo,h);if(h<.3)off++;});
  return{ok:big.length>0&&off===0,detail:big.length+' dangerous traps; '+off+' on ground that is not poor, wet and warm (lowest hell '+lo.toFixed(2)+')'};},
 // the reagent: the rainbow fan is drawn, medicinal, and only where the summit's pockets are (low poor)
 reagent(PL,N,NAMED){const rf=PL.rainbowfan,n=rf.items.reduce((s,i)=>s+(N[i]||0),0),on=NAMED.filter(t=>t.plant==='rainbowfan');let off=0;
  on.forEach(t=>{if(BIO.field('poor',t.x,t.z)>.75)off++;});
  return{ok:!!(rf&&rf.tags.harvest.medicinal&&n>0&&on.length>0&&off===0),detail:'rainbow fans drawn '+n+', named '+on.length+', '+off+' on poor ground'};},
 // the cliff rule: no tree roots on a rim or under a wall; a tree on the rock stands on the rock's drawn top (both kits)
 cliffs(TREES){let rim=0,off=0,worst=0;TREES.forEach(T=>{const Z=NECANYONS.at(T.x,T.z);if(Z.zone==='rim'||Z.zone==='wall')rim++;
   if(Z.rock){const d=Math.abs(T.y0+.25-NECANYONS.top(T.x,T.z));worst=Math.max(worst,d);if(d>.05)off++;}});
  return{ok:rim===0&&off===0&&TREES.length>50,detail:TREES.length+' trees; '+rim+' on a rim or a wall; '+off+' off the rock\'s top (worst '+worst.toFixed(3)+' m)'};},
 // the carvings: a strip on the wall, registered as a carving record, its middle on the bed's face
 carvings(CV){if(!CV.length)return{ok:false,detail:'no carvings'};const c=CV[0];
  return{ok:c.arc>20&&c.hum===true&&Math.abs(c.wallD)<1.5,detail:'arc '+c.arc.toFixed(0)+' m on '+c.body+' bed '+c.bed+', '+c.wallD.toFixed(2)+' m off the wall'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),N=_itemCounts(),KO=KORONA;
 add('man-eaters: trap records, dangerous, drawn, registered',HCHK.maneaters(KO.PLANTS,N,KO.TRAPPED||[]));
 add('the rule: carnivory only where poor, wet and warm',HCHK.rule(KO.TRAPPED||[]));
 add('the reagent: rainbow fans in the summit pockets',HCHK.reagent(KO.PLANTS,N,KO.NAMED||[]));
 add('no tree on a rim; feet on the rock',HCHK.cliffs(NECANYONS.TREES.concat(KO.TREES||[])));
 add('the carvings on the wall',HCHK.carvings(CARVINGS));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),N=_itemCounts(),KO=KORONA,PL=KO.PLANTS;
 add('a man-eater made harmless',HCHK.maneaters(Object.assign({},PL,{maneater:{name:'x',items:PL.maneater.items,tags:Object.assign({},PL.maneater.tags,{trap:KTRAPS.make({kind:'pitfall',preyMax:'person',danger:0})})}}),N,KO.TRAPPED||[]));
 add('a carnivore not drawn',HCHK.maneaters(PL,Object.assign({},N,{[PL.bloodbulb.items[0]]:0,[PL.bloodbulb.items[1]]:0,[PL.bloodbulb.items[2]]:0}),KO.TRAPPED||[]));
 add('a man-eater on the summit (rich, cool)',HCHK.rule((KO.TRAPPED||[]).concat([{key:'maneater',x:TABLE.x,z:TABLE.z,trap:KO.TRAPS.maneater}])));
 {let bare=null;for(let k=0;k<400&&!bare;k++){const a=k*2.4,r=80+k*.9,x=TABLE.x+Math.cos(a)*r,z=TABLE.z+Math.sin(a)*r;if(NECANYONS.at(x,z).zone==='cap'&&BIO.field('poor',x,z)>.8)bare={plant:'rainbowfan',x,z};}
  add('the reagent on bare pavement',HCHK.reagent(PL,N,(KO.NAMED||[]).concat([bare||{plant:'rainbowfan',x:760,z:520}])));}
 add('a tree moved onto a rim',HCHK.cliffs(NECANYONS.TREES.concat([(()=>{const s=NECANYONS.SEEPS[0];return {x:s.x,z:s.z,y0:s.y};})()])));
 add('no carvings',HCHK.carvings([]));
 return R;}

// ---------------------------------------------------------------- the page, handed to the host
window._registered=REG.length;
KHOST.take({build:'korona',title:'Krator biome — Korona: the tepui',
 hint:'Korona, station 1: a tepui over its gorge. The summit pavement and its bogs, the hanging gardens on the ledges, the Hum carved on the wall; the man-eaters at the walls\' feet',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'carnivores':{match:o=>{if(!(o.isInstancedMesh&&o.userData&&o.userData.biome))return false;const it=(o.name||'').replace(/^biome:/,''),P=KORONA.plantOfItem(it)||NECANYONS.plantOfItem(it);return !!(P&&P.tags.trap);}},
  'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'the rock':{match:o=>!!(o.userData&&o.userData.rock)},'sky':{objects:()=>[sky,giant,giantRing]}},
 exporters:{biome:()=>BIO.export(),layout:()=>Object.assign(NECANYONS.records(),{carvings:CARVINGS,pools:STAGE.pools,air:STAGE.air})},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome,jungle:()=>window._jungle,korona:()=>window._korona,hell:hellAt}});
