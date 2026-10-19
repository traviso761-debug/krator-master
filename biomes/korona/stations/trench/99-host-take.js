// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host (station 4: the trenches)
const VIEWS={
 'The crest (looking north to the prow)':[crestX(1350)+60,floorH(crestX(1350),1350)+70,1350,PROW.x,PROW.top-60,PROW.z],
 'The crest (looking south)':[crestX(-640)+10,floorH(crestX(-640),-640)+30,-640,crestX(900),floorH(crestX(900),900)+10,900],
 'The windward face':[-1300,-150,300,-300,220,-100],
 'The lee (the rain shadow)':[1250,-120,-300,300,240,100],
 'The salt (from the crest)':[crestX(300)-30,floorH(crestX(300),300)+20,300,-2400,-440,300],
 'From the air':[-1100,700,1400,0,100,-200],
 'Krator rising':[-400,-100,900,1900,900,-2100],
};
(function(){const KO=typeof KORONA!=='undefined'?KORONA:null,TR=(KO&&KO.TRAPPED)||[],near=(k,x,z)=>TR.filter(t=>t.key===k).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];
 const fin=STAGE.bodies.find(B=>/^crestfin/.test(B.id));if(fin)VIEWS['The fins on the crest']=[fin.x+90,fin.top+20,fin.z+70,fin.x,fin.top-20,fin.z];
 const top=PROW.beds[PROW.beds.length-1];VIEWS['The prow (the summit life)']=[top.cx+40,PROW.top+8,top.cz+80,top.cx-40,PROW.top-6,top.cz-50];
 const cv=CARVINGS[0];if(cv){const a=Math.atan2(cv.z-PROW.z,cv.x-PROW.x);VIEWS['The carvings (the road-marks)']=[cv.x+Math.cos(a)*14,cv.y+cv.h*.5,cv.z+Math.sin(a)*14,cv.x,cv.y+cv.h*.5,cv.z];}
 const gs=near('greatsundew',-500,200);if(gs)VIEWS['A great sundew on the face']=[gs.x+7,gs.y+3,gs.z+5,gs.x,gs.y+1.5,gs.z];
 const me=near('maneater',-1000,0);if(me)VIEWS['A man-eater low on the face']=[me.x+6,me.y+2.6,me.z+4.5,me.x,me.y+1.4,me.z];
 const lf=(KO&&KO.nearestTree)?KO.nearestTree(1,-700,0):null;if(lf)VIEWS['A lace fan in a gully']=[lf.x+14,lf.y0+6,lf.z+10,lf.x,lf.y0+lf.H*.6,lf.z];
 const sp=STAGE.bodies.find(B=>/^facestack/.test(B.id));if(sp)VIEWS['A spire on the windward face']=[sp.x+100,sp.y0+60,sp.z+80,sp.x,sp.y0+sp.top*.0+(sp.top-sp.y0)*.5,sp.z];})();

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
  '\nzone '+Z.zone+' · windward '+STAGE.windward(p.x,p.z).toFixed(2)+' · poor '+BIO.field('poor',p.x,p.z).toFixed(2)+' · wet '+BIO.field('wet',p.x,p.z).toFixed(2)+' · warm '+BIO.field('warm',p.x,p.z).toFixed(2)+' · hell '+hell.toFixed(2)+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}

const BUDGET={
 showcase:{tris:16000000,calls:260},
 cls:{pass:7500000,host:1800000},
 type:{'necanyons/trees':'pass','necanyons/carnivores':'pass','necanyons/floor':'pass','korona/trees':'pass','korona/carnivores':'pass','korona/floor':'pass',
  'jungle/hyper':'pass','jungle/trees':'pass','jungle/floor':'pass','jungle/far':'pass','jungle/dress':'pass','jungle/fauna':'pass','host':'host'},
};
const _itemCounts=()=>{const n={};scene.traverse(M=>{if(M.isInstancedMesh&&M.userData.biome){const k=M.name.replace(/^biome:/,'');n[k]=(n[k]||0)+M.count;}});return n;};
const HCHK={
 // the rain line: the life is on the windward face; the lee carries almost none of the kit's plants; the salt none
 rainline(TRP,TREES){let lee=0,wind=0,salt=0;const all=TRP.map(t=>[t.x,t.z]).concat(TREES.map(T=>[T.x,T.z]));
  all.forEach(p=>{if(floorH(p[0],p[1])<-400)salt++;else if(STAGE.windward(p[0],p[1])<.3)lee++;else wind++;});
  return{ok:salt===0&&wind>lee*4&&wind>100,detail:wind+' on the windward face, '+lee+' on the lee, '+salt+' on the salt'};},
 rule(TRP){const big=TRP.filter(t=>t.trap.danger>=.5);let off=0,lo=1;big.forEach(t=>{const h=hellAt(t.x,t.z);lo=Math.min(lo,h);if(h<.3)off++;});
  return{ok:big.length>0&&off===0,detail:big.length+' dangerous traps; '+off+' on ground that is not poor, wet and warm (lowest hell '+lo.toFixed(2)+')'};},
 cliffs(TREES){let rim=0,off=0,worst=0;TREES.forEach(T=>{const Z=NECANYONS.at(T.x,T.z);if(Z.zone==='rim'||Z.zone==='wall')rim++;
   if(Z.rock){const d=Math.abs(T.y0+.25-NECANYONS.top(T.x,T.z));worst=Math.max(worst,d);if(d>.05)off++;}});
  return{ok:rim===0&&off===0&&TREES.length>50,detail:TREES.length+' trees; '+rim+' on a rim or a wall; '+off+' off the rock\'s top (worst '+worst.toFixed(3)+' m)'};},
 carvings(CV){if(!CV.length)return{ok:false,detail:'no carvings'};const c=CV[0];
  return{ok:c.arc>20&&c.hum===true&&Math.abs(c.wallD)<1.5,detail:'arc '+c.arc.toFixed(0)+' m on '+c.body+' bed '+c.bed+', '+c.wallD.toFixed(2)+' m off the wall'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),KO=KORONA;
 add('the rain line: life on the windward face, none on the salt',HCHK.rainline(KO.TRAPPED||[],NECANYONS.TREES.concat(KO.TREES||[])));
 add('the rule: carnivory only where poor, wet and warm',HCHK.rule(KO.TRAPPED||[]));
 add('no tree on a rim; feet on the rock',HCHK.cliffs(NECANYONS.TREES.concat(KO.TREES||[])));
 add('the carvings on the prow',HCHK.carvings(CARVINGS));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),KO=KORONA;
 add('a tree on the salt',HCHK.rainline(KO.TRAPPED||[],NECANYONS.TREES.concat(KO.TREES||[]).concat([{x:-1500,z:0}])));
 add('a man-eater on the crest',HCHK.rule((KO.TRAPPED||[]).concat([{key:'maneater',x:crestX(200),z:200,trap:KO.TRAPS.maneater}])));
 add('a tree moved onto a rim',HCHK.cliffs(NECANYONS.TREES.concat([(()=>{const s=NECANYONS.SEEPS[0];return {x:s.x,z:s.z,y0:s.y};})()])));
 add('no carvings',HCHK.carvings([]));
 return R;}

window._registered=REG.length;
KHOST.take({build:'korona',title:'Krator biome — Korona: the trenches',
 hint:'Korona, station 4: a ring ridge\'s crest between two arms of the salt lake: wet and alive on its windward face, bare on its lee, the salt below where nothing grows',
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
