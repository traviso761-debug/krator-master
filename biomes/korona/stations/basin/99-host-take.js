// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host (station 3: the fertile basin)
const VIEWS={
 'The shore (from the water)':[700,14,200,-200,6,-100],
 'From the air':[-900,320,700,300,0,-100],
 'Krator rising':[-400,30,900,1900,900,-2100],
 'The stream (down to the lake)':[STREAM.x(-300)+20,floorH(STREAM.x(-300),-300)+12,-300,STREAM.x(100),floorH(STREAM.x(100),100)+2,100],
 'The bog corner':[BOG.x+160,floorH(BOG.x,BOG.z)+40,BOG.z+120,BOG.x,floorH(BOG.x,BOG.z),BOG.z],
};
(function(){const KO=typeof KORONA!=='undefined'?KORONA:null,TR=(KO&&KO.TRAPPED)||[],near=(k,x,z)=>TR.filter(t=>t.key===k).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];
 const rf=(KO&&KO.NAMED||[]).filter(t=>t.plant==='rainbowfan'&&NECANYONS.at(t.x,t.z).zone==='floor').sort((a,b)=>Math.hypot(a.x-200,a.z)-Math.hypot(b.x-200,b.z))[0];
 if(rf)VIEWS['The shore meadows (rainbow fans)']=[rf.x+20,rf.y+14,rf.z+16,rf.x-6,rf.y+.4,rf.z-5];   /* from over the drift (it stood inside a lace fan's leaf) */
 const lf=(KO&&KO.nearestTree)?KO.nearestTree(1,300,0):null;if(lf){const H=lf.H||24;VIEWS['A lace fan at the water']=[lf.x+H*1.3,lf.y0+H*1.05,lf.z+H*1.0,lf.x,lf.y0+H*.6,lf.z];}
 const top=BENCH.beds[BENCH.beds.length-1];VIEWS['The bench (the summit life)']=[top.cx+50,BENCH.top+8,top.cz+90,top.cx-50,BENCH.top-6,top.cz-60];
 const cv=CARVINGS[0];if(cv){const a=Math.atan2(cv.z-BENCH.z,cv.x-BENCH.x);VIEWS['The carvings (the lake\'s years)']=[cv.x+Math.cos(a)*14,cv.y+cv.h*.5,cv.z+Math.sin(a)*14,cv.x,cv.y+cv.h*.5,cv.z];}
 const me=near('maneater',BOG.x,BOG.z);if(me)VIEWS['A man-eater (the bog corner)']=[me.x+6,me.y+2.6,me.z+4.5,me.x,me.y+1.4,me.z];
 const cb=near('cobralily',0,0);if(cb)VIEWS['Cobra lilies at a seep']=[cb.x+6,cb.y+2.2,cb.z+4,cb.x-10,cb.y+.8,cb.z-6];
 const st=STAGE.bodies.find(B=>/^shorestack/.test(B.id));if(st)VIEWS['A spire on the shore']=[st.x+120,60,st.z+90,st.x,st.top*.5,st.z];})();

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
  '\nzone '+Z.zone+' · poor '+BIO.field('poor',p.x,p.z).toFixed(2)+' · rich '+BIO.field('rich',p.x,p.z).toFixed(2)+' · wet '+BIO.field('wet',p.x,p.z).toFixed(2)+' · hell '+hell.toFixed(2)+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}

const BUDGET={
 showcase:{tris:16000000,calls:260},
 cls:{pass:7500000,host:1800000},
 type:{'necanyons/trees':'pass','necanyons/carnivores':'pass','necanyons/floor':'pass','korona/trees':'pass','korona/carnivores':'pass','korona/floor':'pass',
  'jungle/hyper':'pass','jungle/trees':'pass','jungle/floor':'pass','jungle/far':'pass','jungle/dress':'pass','jungle/fauna':'pass','host':'host'},
};
const _itemCounts=()=>{const n={};scene.traverse(M=>{if(M.isInstancedMesh&&M.userData.biome){const k=M.name.replace(/^biome:/,'');n[k]=(n[k]||0)+M.count;}});return n;};
const HCHK={
 // the idyllic end of the rule: no dangerous trap stands on rich ground; what traps there are stand in the bog corner
 rule(TRP){const big=TRP.filter(t=>t.trap.danger>=.5);let off=0,out=0;big.forEach(t=>{if(BIO.field('rich',t.x,t.z)>.5)off++;if(Math.hypot(t.x-BOG.x,t.z-BOG.z)>BOG.r*1.5)out++;});
  return{ok:off===0&&out===0,detail:big.length+' dangerous traps; '+off+' on rich ground; '+out+' outside the bog corner'};},
 // the reagents in meadows: rainbow fans on the shore floor, many, all on rich ground
 meadows(NAMED){const on=NAMED.filter(t=>t.plant==='rainbowfan'&&NECANYONS.at(t.x,t.z).zone==='floor');let poor=0;on.forEach(t=>{if(BIO.field('rich',t.x,t.z)<.5)poor++;});
  return{ok:on.length>=20&&poor===0,detail:on.length+' rainbow-fan drifts named on the shore, '+poor+' on poor ground'};},
 cliffs(TREES){let rim=0,off=0,worst=0;TREES.forEach(T=>{const Z=NECANYONS.at(T.x,T.z);if(Z.zone==='rim'||Z.zone==='wall')rim++;
   if(Z.rock){const d=Math.abs(T.y0+.25-NECANYONS.top(T.x,T.z));worst=Math.max(worst,d);if(d>.05)off++;}});
  return{ok:rim===0&&off===0&&TREES.length>50,detail:TREES.length+' trees; '+rim+' on a rim or a wall; '+off+' off the rock\'s top (worst '+worst.toFixed(3)+' m)'};},
 carvings(CV){if(!CV.length)return{ok:false,detail:'no carvings'};const c=CV[0];
  return{ok:c.arc>20&&c.hum===true&&Math.abs(c.wallD)<1.5,detail:'arc '+c.arc.toFixed(0)+' m on '+c.body+' bed '+c.bed+', '+c.wallD.toFixed(2)+' m off the wall'};},
 // the lake stands where the stage says, and nothing roots in it
 lake(N){let wet=0;(KORONA.TREES||[]).concat(NECANYONS.TREES||[]).forEach(T=>{if(lakeD(T.x,T.z)<-2)wet++;});return{ok:wet===0&&STAGE.pools[0].y===0,detail:wet+' trees in the lake; level '+STAGE.pools[0].y};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),N=_itemCounts(),KO=KORONA;
 add('the rule: no dangerous trap on rich ground; the traps in the bog corner',HCHK.rule(KO.TRAPPED||[]));
 add('the reagents in meadows on the shore',HCHK.meadows(KO.NAMED||[]));
 add('no tree on a rim; feet on the rock',HCHK.cliffs(NECANYONS.TREES.concat(KO.TREES||[])));
 add('the carvings on the bench',HCHK.carvings(CARVINGS));
 add('the lake: nothing roots in it',HCHK.lake(N));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),N=_itemCounts(),KO=KORONA;
 add('a man-eater on the shore meadow',HCHK.rule((KO.TRAPPED||[]).concat([{key:'maneater',x:200,z:0,trap:KO.TRAPS.maneater}])));
 add('a reagent drift in the bog',HCHK.meadows((KO.NAMED||[]).concat([{plant:'rainbowfan',x:BOG.x,z:BOG.z}])));
 add('a tree moved onto a rim',HCHK.cliffs(NECANYONS.TREES.concat([(()=>{const s=NECANYONS.SEEPS[0];return {x:s.x,z:s.z,y0:s.y};})()])));
 add('no carvings',HCHK.carvings([]));
 add('a tree in the lake',(()=>{const T=KORONA.TREES;T.push({x:900,z:0,y0:0});const r=HCHK.lake(N);T.pop();return r;})());
 return R;}

window._registered=REG.length;
KHOST.take({build:'korona',title:'Krator biome — Korona: the fertile basin',
 hint:'Korona, station 3: the Tiers\' lake and its shore meadows, where the rule turns kind: reagents in drifts, lace fans at the water, the rainforest behind; one bog corner keeps the traps',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'carnivores':{match:o=>{if(!(o.isInstancedMesh&&o.userData&&o.userData.biome))return false;const it=(o.name||'').replace(/^biome:/,''),P=KORONA.plantOfItem(it)||NECANYONS.plantOfItem(it);return !!(P&&P.tags.trap);}},
  'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'the rock':{match:o=>!!(o.userData&&o.userData.rock)},'sky':{objects:()=>[sky,giant,giantRing]}},
 exporters:{biome:()=>BIO.export(),layout:()=>Object.assign(NECANYONS.records(),{carvings:CARVINGS,pools:STAGE.pools})},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome,jungle:()=>window._jungle,korona:()=>window._korona,hell:hellAt}});
