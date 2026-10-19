// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host (station 5: the lee gorge)
const VIEWS={
 'The gorge':[WADI.x(1300)+30,floorH(WADI.x(1300),1300)+40,1300,WADI.x(-400),floorH(WADI.x(-400),-400)+60,-400],
 'From the air':[-300,520,1500,0,80,-200],
 'Krator rising':[-400,60,900,1900,900,-2100],
 'The spring (the hell at the water)':[SPRING.x+70,floorH(SPRING.x,SPRING.z)+22,SPRING.z+60,SPRING.x,floorH(SPRING.x,SPRING.z)+1,SPRING.z],
 'The wadi':[WADI.x(-700)+16,floorH(WADI.x(-700),-700)+9,-700,WADI.x(-200),floorH(WADI.x(-200),-200)+2,-200],
 'The badlands (hoodoos)':[520,floorH(520,-480)+34,-380,380,floorH(380,-660)+12,-660],
};
(function(){const KO=typeof KORONA!=='undefined'?KORONA:null,TR=(KO&&KO.TRAPPED)||[],near=(k,x,z)=>TR.filter(t=>t.key===k).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];
 const S=(NECANYONS.SEEPS||[]).filter(s=>s.body===0&&s.seep>.6).sort((a,b)=>b.seep-a.seep)[0];
 if(S)VIEWS['A seep line (the only green on the wall)']=[S.x+S.nx*30,S.y+7,S.z+S.nz*30,S.x,S.y-3,S.z];
 const cv=CARVINGS[0];if(cv){const a=Math.atan2(cv.z-WEST.z,cv.x-WEST.x);VIEWS['The carvings (the warning)']=[cv.x+Math.cos(a)*14,cv.y+cv.h*.5,cv.z+Math.sin(a)*14,cv.x,cv.y+cv.h*.5,cv.z];}
 const me=near('maneater',SPRING.x,SPRING.z);if(me)VIEWS['A man-eater at the spring']=[me.x+6,me.y+2.6,me.z+4.5,me.x,me.y+1.4,me.z];
 const pj=near('punjipit',SPRING.x,SPRING.z);if(pj)VIEWS['A punji pit by the water']=[pj.x+4,pj.y+2,pj.z+3,pj.x,pj.y+.2,pj.z];
 const gs=near('greatsundew',-WALLX+WALLHALF,0);if(gs)VIEWS['A great sundew at a seep']=[gs.x+7,gs.y+3,gs.z+5,gs.x,gs.y+1.5,gs.z];
 const D=typeof SEDESERT!=='undefined'&&SEDESERT.TREES;if(D&&D.length){const dr=D.filter(T=>T.sp===0).sort((a,b)=>Math.hypot(a.x-SPRING.x,a.z-SPRING.z)-Math.hypot(b.x-SPRING.x,b.z-SPRING.z))[0]||D[0];
  VIEWS['A dragon tree']=[dr.x+18,dr.y0+8,dr.z+14,dr.x,dr.y0+(dr.H||10)*.6,dr.z];
  const st=D.filter(T=>T.sp===1||T.sp===2).sort((a,b)=>Math.hypot(a.x+200,a.z+300)-Math.hypot(b.x+200,b.z+300))[0];if(st)VIEWS['The stands (candelabra and cardon)']=[st.x+40,st.y0+14,st.z+30,st.x-60,st.y0+8,st.z-50];}})();

function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,''):null;
 const KO=typeof KORONA!=='undefined'?KORONA:null,SD=typeof SEDESERT!=='undefined'?SEDESERT:null;
 const PLT=item&&((KO&&KO.plantOfItem(item))||NECANYONS.plantOfItem(item)||(SD&&SD.plantOfItem&&SD.plantOfItem(item))),SPx=item&&SD&&SD.speciesOfItem&&SD.speciesOfItem(item);
 const nm=BIO.nameAt?BIO.nameAt(p.x,p.y,p.z):null,NM=nm&&(!best||nm.r<best.r)?nm:null;
 const SB=best&&(NECANYONS.SPECIES.find(s=>best.key===s.key)||(KO&&KO.SPECIES.find(s=>best.key===s.key))||(SD&&SD.SPECIES&&SD.SPECIES.find(s=>best.key===s.key)));
 const F=PLT||SPx||SB||(NM&&NM.plant?((KO&&KO.PLANTS[NM.plant])||NECANYONS.PLANTS[NM.plant]):null),hv=F&&F.tags?F.tags.harvest:null,tr=F&&F.tags?F.tags.trap:null;
 const Z=NECANYONS.at(p.x,p.z),hell=hellAt(p.x,p.z);
 return(NM?NM.name:F?F.name:best?best.name:(o.userData.inspectLabel||item||o.name||'mesh'))+'  ·  '+(o.userData.inspectLabel||item||'')+
  (hv?'\nharvest: wood '+hv.wood+' · edible '+((hv.edible||[]).join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')+
  (tr?'\ntrap: '+tr.kind+' · mouth '+tr.mouth+' m · prey up to '+tr.preyMax+(tr.lure?' · lure '+tr.lure:'')+' · danger '+tr.danger+(tr.danger>0?' (HAZARD)':''):'')+
  '\nzone '+Z.zone+' · poor '+BIO.field('poor',p.x,p.z).toFixed(2)+' · wet '+BIO.field('wet',p.x,p.z).toFixed(2)+' · oasis '+BIO.field('oasis',p.x,p.z).toFixed(2)+' · hell '+hell.toFixed(2)+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}

const BUDGET={
 showcase:{tris:16000000,calls:260},
 cls:{pass:7500000,host:1800000},
 type:{'necanyons/trees':'pass','necanyons/carnivores':'pass','necanyons/floor':'pass','korona/trees':'pass','korona/carnivores':'pass','korona/floor':'pass',
  'desert/trees':'pass','desert/floor':'pass','desert/fauna':'pass','desert/dress':'pass','host':'host'},
};
const _itemCounts=()=>{const n={};scene.traverse(M=>{if(M.isInstancedMesh&&M.userData.biome){const k=M.name.replace(/^biome:/,'');n[k]=(n[k]||0)+M.count;}});return n;};
const HCHK={
 // the water hole is the hell: every dangerous trap stands within reach of the spring, and none far from it
 // (or at a wall's foot under a seep line: the other wet ground in the gorge)
 spring(TRP){const big=TRP.filter(t=>t.trap.danger>=.5);let far=0,atSpring=0;big.forEach(t=>{if(springD(t.x,t.z)<260)atSpring++;else if(NECANYONS.footD(t.x,t.z)>=60)far++;});
  return{ok:big.length>=10&&atSpring>=10&&far===0,detail:big.length+' dangerous traps, '+atSpring+' at the spring, '+far+' on the dry floor away from it'};},
 rule(TRP){const big=TRP.filter(t=>t.trap.danger>=.5);let off=0,lo=1;big.forEach(t=>{const h=hellAt(t.x,t.z);lo=Math.min(lo,h);if(h<.3)off++;});
  return{ok:big.length>0&&off===0,detail:big.length+' dangerous traps; '+off+' on ground that is not poor, wet and warm (lowest hell '+lo.toFixed(2)+')'};},
 // the desert grows: the eastern desert's kit stands on the floor, off the rock and the water
 desert(D){const T=(D&&D.TREES)||[];let rock=0,wet=0;T.forEach(t=>{if(NECANYONS.rockAt(t.x,t.z))rock++;if(springD(t.x,t.z)<SPRING.r)wet++;});
  return{ok:T.length>150&&rock===0&&wet===0,detail:T.length+' desert trees; '+rock+' on the rock, '+wet+' in the spring'};},
 cliffs(TREES){let rim=0,off=0,worst=0;TREES.forEach(T=>{const Z=NECANYONS.at(T.x,T.z);if(Z.zone==='rim'||Z.zone==='wall')rim++;
   if(Z.rock){const d=Math.abs(T.y0+.25-NECANYONS.top(T.x,T.z));worst=Math.max(worst,d);if(d>.05)off++;}});
  return{ok:rim===0&&off===0&&TREES.length>50,detail:TREES.length+' trees; '+rim+' on a rim or a wall; '+off+' off the rock\'s top (worst '+worst.toFixed(3)+' m)'};},
 carvings(CV){if(!CV.length)return{ok:false,detail:'no carvings'};const c=CV[0];
  return{ok:c.arc>20&&c.hum===true&&Math.abs(c.wallD)<1.5,detail:'arc '+c.arc.toFixed(0)+' m on '+c.body+' bed '+c.bed+', '+c.wallD.toFixed(2)+' m off the wall'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),KO=KORONA,SD=typeof SEDESERT!=='undefined'?SEDESERT:null;
 add('the water hole is the hell: every dangerous trap within reach of the spring',HCHK.spring(KO.TRAPPED||[]));
 add('the rule: carnivory only where poor, wet and warm',HCHK.rule(KO.TRAPPED||[]));
 add('the desert grows on the floor, off the rock and the water',HCHK.desert(SD));
 add('no tree on a rim; feet on the rock',HCHK.cliffs(NECANYONS.TREES.concat(KO.TREES||[])));
 add('the carvings on the west wall',HCHK.carvings(CARVINGS));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),KO=KORONA,SD=typeof SEDESERT!=='undefined'?SEDESERT:null;
 add('a man-eater far from the spring',HCHK.spring((KO.TRAPPED||[]).concat([{key:'maneater',x:-400,z:-900,trap:KO.TRAPS.maneater}])));
 add('a man-eater on the dry scrub',HCHK.rule((KO.TRAPPED||[]).concat([{key:'maneater',x:-400,z:-900,trap:KO.TRAPS.maneater}])));
 add('a desert tree in the spring',HCHK.desert({TREES:((SD&&SD.TREES)||[]).concat([{x:SPRING.x,z:SPRING.z}])}));
 add('a tree moved onto a rim',HCHK.cliffs(NECANYONS.TREES.concat([(()=>{const s=NECANYONS.SEEPS[0];return {x:s.x,z:s.z,y0:s.y};})()])));
 add('no carvings',HCHK.carvings([]));
 return R;}

window._registered=REG.length;
KHOST.take({build:'korona',title:'Krator biome — Korona: the lee gorge',
 hint:'Korona, station 5: a dry gorge in a ring\'s rain shadow, the eastern desert\'s flora under tepui walls; one spring, and every trap in Korona round it',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'carnivores':{match:o=>{if(!(o.isInstancedMesh&&o.userData&&o.userData.biome))return false;const it=(o.name||'').replace(/^biome:/,''),P=KORONA.plantOfItem(it)||NECANYONS.plantOfItem(it);return !!(P&&P.tags.trap);}},
  'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'the rock':{match:o=>!!(o.userData&&o.userData.rock)},'sky':{objects:()=>[sky,giant,giantRing]}},
 exporters:{biome:()=>BIO.export(),layout:()=>Object.assign(NECANYONS.records(),{carvings:CARVINGS,pools:STAGE.pools,air:STAGE.air})},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome,desert:()=>window._desert,korona:()=>window._korona,hell:hellAt}});
