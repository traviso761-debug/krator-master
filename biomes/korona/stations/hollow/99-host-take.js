// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host (station 2: the pitcher hollow)
const VIEWS={
 'The hollow (from the west rim)':[-1150,40,330,200,-150,-60],
 'The hollow (from the air)':[-900,300,500,100,-160,-100],
 'From afar':[-2200,600,2000,0,-120,0],
 'Krator rising':[-400,-150,900,1900,500,-2100],
};
(function(){const TR=(typeof KORONA!=='undefined'&&KORONA.TRAPPED)||[],near=(k,x,z)=>TR.filter(t=>t.key===k).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];
 const me=near('maneater',0,0);if(me)VIEWS['A man-eater']=[me.x+6,me.y+2.6,me.z+4.5,me.x,me.y+1.4,me.z];
 const pj=near('punjipit',0,0);if(pj)VIEWS['A punji pit']=[pj.x+4,pj.y+2,pj.z+3,pj.x,pj.y+.2,pj.z];
 const bt=near('beartrap',0,0);if(bt)VIEWS['A bear-trap plant']=[bt.x+3.5,bt.y+1.8,bt.z+2.5,bt.x,bt.y+.2,bt.z];
 const nt=near('numbthorn',0,0);if(nt)VIEWS['A numb thorn']=[nt.x+4,nt.y+2,nt.z+3,nt.x,nt.y+1,nt.z];
 const td=near('coiltendril',0,0);if(td)VIEWS['A coil tendril']=[td.x+7,td.y+3,td.z+5,td.x,td.y+.6,td.z];
 const gs=near('groundstar',100,100);if(gs)VIEWS['Ground stars on the peat']=[gs.x+5,gs.y+2.5,gs.z+4,gs.x,gs.y,gs.z];
 const bb=near('bloodbulb',-300,200);if(bb)VIEWS['The moor (blood bulbs)']=[bb.x+8,bb.y+2.2,bb.z+6,bb.x-30,bb.y+1,bb.z-20];
 const cb=near('cobralily',-650,0);if(cb)VIEWS['The cobra meadow']=[cb.x+7,cb.y+2.4,cb.z+5,cb.x-20,cb.y+.8,cb.z-10];
 const pl=STAGE.pools[0];if(pl)VIEWS['A sucking pool (trap pads)']=[pl.x+pl.r*1.3,pl.y+8,pl.z+pl.r*1.1,pl.x,pl.y,pl.z];
 const P=STAGE.path,pm=P[Math.floor(P.length/2)];VIEWS['The safe path (the cairns)']=[pm[0]-26,floorH(pm[0],pm[1])+9,pm[1]+30,pm[0]+60,floorH(pm[0],pm[1])+1,pm[1]-70];
 const top=BUTTE.beds[BUTTE.beds.length-1];VIEWS['The rim butte (the summit life)']=[top.cx+40,BUTTE.top+8,top.cz-90,top.cx-60,BUTTE.top-6,top.cz+60];
 const cv=CARVINGS[0];if(cv){const a=Math.atan2(cv.z-BUTTE.z,cv.x-BUTTE.x);VIEWS['The carvings (the Hum on the butte)']=[cv.x+Math.cos(a)*14,cv.y+cv.h*.5,cv.z+Math.sin(a)*14,cv.x,cv.y+cv.h*.5,cv.z];}
 const lf=(typeof KORONA!=='undefined'&&KORONA.nearestTree)?KORONA.nearestTree(1,-700,300):null;if(lf)VIEWS['A lace fan tree (the slopes\' foot)']=[lf.x+14,lf.y0+6,lf.z+10,lf.x,lf.y0+lf.H*.6,lf.z];})();

function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,''):null;
 const KO=typeof KORONA!=='undefined'?KORONA:null;
 const PLT=item&&((KO&&KO.plantOfItem(item))||NECANYONS.plantOfItem(item)||(HYPERJUNGLE.plantOfItem&&HYPERJUNGLE.plantOfItem(item))),SPx=item&&HYPERJUNGLE.speciesOfItem&&HYPERJUNGLE.speciesOfItem(item);
 const nm=BIO.nameAt?BIO.nameAt(p.x,p.y,p.z):null,NM=nm&&(!best||nm.r<best.r)?nm:null;
 const SB=best&&(NECANYONS.SPECIES.find(s=>best.key===s.key)||(KO&&KO.SPECIES.find(s=>best.key===s.key)));
 const F=PLT||SPx||SB||(NM&&NM.plant?((KO&&KO.PLANTS[NM.plant])||NECANYONS.PLANTS[NM.plant]):null),hv=F&&F.tags?F.tags.harvest:null,tr=F&&F.tags?F.tags.trap:null;
 const Z=NECANYONS.at(p.x,p.z),hell=hellAt(p.x,p.z),pd=KO?KO.pathD(p.x,p.z):1e9;
 return(NM?NM.name:F?F.name:best?best.name:(o.userData.inspectLabel||item||o.name||'mesh'))+'  ·  '+(o.userData.inspectLabel||item||'')+
  (hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')+
  (tr?'\ntrap: '+tr.kind+' · mouth '+tr.mouth+' m · prey up to '+tr.preyMax+(tr.lure?' · lure '+tr.lure:'')+' · danger '+tr.danger+(tr.danger>0?' (HAZARD)':''):'')+
  '\nzone '+Z.zone+' · poor '+BIO.field('poor',p.x,p.z).toFixed(2)+' · wet '+BIO.field('wet',p.x,p.z).toFixed(2)+' · warm '+BIO.field('warm',p.x,p.z).toFixed(2)+' · hell '+hell.toFixed(2)+(pd<30?' · the safe path '+pd.toFixed(0)+' m off':'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}

const BUDGET={
 showcase:{tris:16000000,calls:260},
 cls:{pass:7500000,host:1800000},
 type:{'necanyons/trees':'pass','necanyons/carnivores':'pass','necanyons/floor':'pass','korona/trees':'pass','korona/carnivores':'pass','korona/floor':'pass',
  'jungle/hyper':'pass','jungle/trees':'pass','jungle/floor':'pass','jungle/far':'pass','jungle/dress':'pass','jungle/fauna':'pass','host':'host'},
};
const _itemCounts=()=>{const n={};scene.traverse(M=>{if(M.isInstancedMesh&&M.userData.biome){const k=M.name.replace(/^biome:/,'');n[k]=(n[k]||0)+M.count;}});return n;};
const HCHK={
 maneaters(PL,N,TRP){const keys=Object.keys(PL).filter(k=>PL[k].tags.trap),bad=[],undrawn=[],tame=[];
  keys.forEach(k=>{const t=PL[k].tags.trap;if(!KTRAPS.KINDS[t.kind])bad.push(k);if(t.preyMax==='person'&&!(KTRAPS.catches(t,'person').caught&&t.danger>=.5))tame.push(k);
   if(!PL[k].items.some(i=>N[i]>0)&&!((k==='bladderpool'||k==='trappad')&&!STAGE.pools.some(p=>p.bed))&&!((k==='butterwort'||k==='frosttank')&&!(STAGE.bias&&STAGE.bias[k])))undrawn.push(k);});
  const reg=[...new Set(TRP.filter(t=>t.trap.danger>0).map(t=>t.key))];
  return{ok:keys.length>=8&&!bad.length&&!undrawn.length&&!tame.length&&reg.length>=5,detail:keys.length+' carnivores'+(bad.length?'; not in the vocabulary: '+bad.join(', '):'')+
   (tame.length?'; meant for a person but harmless: '+tame.join(', '):'')+(undrawn.length?'; not drawn: '+undrawn.join(', '):'')+'; dangerous ones registered: '+reg.join(', ')+' ('+TRP.length+' records)'};},
 rule(TRP){const big=TRP.filter(t=>t.trap.danger>=.5&&t.key!=='trappad');let off=0,lo=1;big.forEach(t=>{const h=hellAt(t.x,t.z);lo=Math.min(lo,h);if(h<.3)off++;});
  return{ok:big.length>=20&&off===0,detail:big.length+' dangerous traps; '+off+' on ground that is not poor, wet and warm (lowest hell '+lo.toFixed(2)+')'};},
 // the safe path: no dangerous trap within 3 m of it; cairns along it
 path(TRP,N){const P=STAGE.path;let near=0;TRP.forEach(t=>{if(t.trap.danger>=.3&&t.key!=='bladderpool'&&t.key!=='trappad'&&KORONA.pathD(t.x,t.z)<3)near++;});
  return{ok:near===0&&(N.cairn||0)>=30,detail:near+' dangerous traps on the path; '+(N.cairn||0)+' cairn stones'};},
 // the pools: every sucking pool is a registered trap with pads on it
 pools(TRP,N){const pools=TRP.filter(t=>t.key==='bladderpool').length;return{ok:pools===STAGE.pools.length&&(N.pad||0)>0,detail:pools+' of '+STAGE.pools.length+' pools registered; '+(N.pad||0)+' trap pads'};},
 cliffs(TREES){let rim=0,off=0,worst=0;TREES.forEach(T=>{const Z=NECANYONS.at(T.x,T.z);if(Z.zone==='rim'||Z.zone==='wall')rim++;
   if(Z.rock){const d=Math.abs(T.y0+.25-NECANYONS.top(T.x,T.z));worst=Math.max(worst,d);if(d>.05)off++;}});
  return{ok:rim===0&&off===0&&TREES.length>50,detail:TREES.length+' trees; '+rim+' on a rim or a wall; '+off+' off the rock\'s top (worst '+worst.toFixed(3)+' m)'};},
 carvings(CV){if(!CV.length)return{ok:false,detail:'no carvings'};const c=CV[0];
  return{ok:c.arc>20&&c.hum===true&&Math.abs(c.wallD)<1.5,detail:'arc '+c.arc.toFixed(0)+' m on '+c.body+' bed '+c.bed+', '+c.wallD.toFixed(2)+' m off the wall'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),N=_itemCounts(),KO=KORONA;
 add('man-eaters: trap records, dangerous, drawn, registered',HCHK.maneaters(KO.PLANTS,N,KO.TRAPPED||[]));
 add('the rule: carnivory only where poor, wet and warm',HCHK.rule(KO.TRAPPED||[]));
 add('the safe path is clear and marked',HCHK.path(KO.TRAPPED||[],N));
 add('the sucking pools are traps with pads',HCHK.pools(KO.TRAPPED||[],N));
 add('no tree on a rim; feet on the rock',HCHK.cliffs(NECANYONS.TREES.concat(KO.TREES||[])));
 add('the carvings on the butte',HCHK.carvings(CARVINGS));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),N=_itemCounts(),KO=KORONA,PL=KO.PLANTS;
 add('a man-eater made harmless',HCHK.maneaters(Object.assign({},PL,{maneater:{name:'x',items:PL.maneater.items,tags:Object.assign({},PL.maneater.tags,{trap:KTRAPS.make({kind:'pitfall',preyMax:'person',danger:0})})}}),N,KO.TRAPPED||[]));
 add('a man-eater on the rim (rich)',HCHK.rule((KO.TRAPPED||[]).concat([{key:'maneater',x:-1300,z:-500,trap:KO.TRAPS.maneater}])));
 add('a man-eater on the path',HCHK.path((KO.TRAPPED||[]).concat([{key:'maneater',x:STAGE.path[3][0],z:STAGE.path[3][1],trap:KO.TRAPS.maneater}]),N));
 add('a pool left unregistered',HCHK.pools((KO.TRAPPED||[]).filter((t,i)=>!(t.key==='bladderpool'&&i===(KO.TRAPPED||[]).findIndex(u=>u.key==='bladderpool'))),N));
 add('a tree moved onto a rim',HCHK.cliffs(NECANYONS.TREES.concat([(()=>{const s=NECANYONS.SEEPS[0];return {x:s.x,z:s.z,y0:s.y};})()])));
 add('no carvings',HCHK.carvings([]));
 return R;}

window._registered=REG.length;
KHOST.take({build:'korona',title:'Krator biome — Korona: the pitcher hollow',
 hint:'Korona, station 2: a closed hollow with a wet acid floor. The moor of blood bulbs, the man-eaters and the coil tendrils, the sucking pools, the cobra meadow at the slopes\' foot; keep to the cairns',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'carnivores':{match:o=>{if(!(o.isInstancedMesh&&o.userData&&o.userData.biome))return false;const it=(o.name||'').replace(/^biome:/,''),P=KORONA.plantOfItem(it)||NECANYONS.plantOfItem(it);return !!(P&&P.tags.trap);}},
  'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'the rock':{match:o=>!!(o.userData&&o.userData.rock)},'sky':{objects:()=>[sky,giant,giantRing]}},
 exporters:{biome:()=>BIO.export(),layout:()=>Object.assign(NECANYONS.records(),{carvings:CARVINGS,pools:STAGE.pools,path:STAGE.path})},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome,jungle:()=>window._jungle,korona:()=>window._korona,hell:hellAt}});
