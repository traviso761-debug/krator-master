// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host (station 6: the hoar table)
const VIEWS={
 'The hoar table':[-1150,60,900,300,0,-300],
 'From the air':[-900,420,1400,0,0,-200],
 'Krator rising':[-400,30,900,1900,900,-2100],
 'The rim (the drop into cloud)':[1380,14,-420,2200,-500,-650],
 'The Mother Cushion':[MOTHER.x-320,MOTHER.h+40,MOTHER.z+260,MOTHER.x,MOTHER.h*.6,MOTHER.z],
 'The frozen tarn':[TARN.x+170,26,TARN.z+140,TARN.x,0,TARN.z],
};
(function(){const KO=typeof KORONA!=='undefined'?KORONA:null,TR=(KO&&KO.TRAPPED)||[],near=(k,x,z)=>TR.filter(t=>t.key===k).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];
 const pool=STAGE.pools[1];if(pool)VIEWS['A melt pool (butterworts)']=[pool.x+pool.r*2.2,pool.y+14,pool.z+pool.r*1.8,pool.x-pool.r*.3,pool.y,pool.z-pool.r*.3];
 const ft=near('frosttank',0,0);if(ft)VIEWS['A frost tank']=[ft.x+3,ft.y+1.6,ft.z+2.2,ft.x,ft.y+.6,ft.z];
 const bw=near('butterwort',0,0);if(bw)VIEWS['Butterworts on a margin']=[bw.x+2.2,bw.y+1.2,bw.z+1.6,bw.x,bw.y,bw.z];
 const sp=near('stormpod',0,0);
 const cv=CARVINGS[0];if(cv){const a=Math.atan2(cv.z-TABLE.z,cv.x-TABLE.x);VIEWS['The carvings (under the rim)']=[cv.x+Math.cos(a)*16,cv.y+cv.h*.5,cv.z+Math.sin(a)*16,cv.x,cv.y+cv.h*.5,cv.z];}
 // a snow bank: the lee hollow with the most snow near the middle
 {let best=null;for(let k=0;k<400;k++){const a=k*2.4,r=200+k*2.2,x=Math.cos(a)*r,z=Math.sin(a)*r,s=STAGE.snowAt(x,z);if(!best||s>best[2])best=[x,z,s];}
  if(best)VIEWS['A snow bank (the lee hollows)']=[best[0]+60,30,best[1]+45,best[0],0,best[1]];}})();

function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,''):null;
 const KO=typeof KORONA!=='undefined'?KORONA:null,EH=typeof EHIGH!=='undefined'?EHIGH:null;
 const PLT=item&&((KO&&KO.plantOfItem(item))||NECANYONS.plantOfItem(item)||(EH&&EH.plantOfItem&&EH.plantOfItem(item))),SPx=item&&EH&&EH.speciesOfItem&&EH.speciesOfItem(item);
 const nm=BIO.nameAt?BIO.nameAt(p.x,p.y,p.z):null,NM=nm&&(!best||nm.r<best.r)?nm:null;
 const SB=best&&(NECANYONS.SPECIES.find(s=>best.key===s.key)||(KO&&KO.SPECIES.find(s=>best.key===s.key))||(EH&&EH.SPECIES&&EH.SPECIES.find(s=>best.key===s.key)));
 const F=PLT||SPx||SB||(NM&&NM.plant?((KO&&KO.PLANTS[NM.plant])||NECANYONS.PLANTS[NM.plant]):null),hv=F&&F.tags?F.tags.harvest:null,tr=F&&F.tags?F.tags.trap:null;
 const Z=NECANYONS.at(p.x,p.z),hell=hellAt(p.x,p.z);
 return(NM?NM.name:F?F.name:best?best.name:(o.userData.inspectLabel||item||o.name||'mesh'))+'  ·  '+(o.userData.inspectLabel||item||'')+
  (hv?'\nharvest: wood '+hv.wood+' · edible '+((hv.edible||[]).join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')+
  (tr?'\ntrap: '+tr.kind+' · mouth '+tr.mouth+' m · prey up to '+tr.preyMax+(tr.lure?' · lure '+tr.lure:'')+' · danger '+tr.danger+(tr.danger>0?' (HAZARD)':''):'')+
  '\nzone '+Z.zone+' · poor '+BIO.field('poor',p.x,p.z).toFixed(2)+' · wet '+BIO.field('wet',p.x,p.z).toFixed(2)+' · bog '+BIO.field('bog',p.x,p.z).toFixed(2)+' · snow '+STAGE.snowAt(p.x,p.z).toFixed(2)+' · hell '+hell.toFixed(2)+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}

const BUDGET={
 showcase:{tris:16000000,calls:260},
 cls:{pass:7500000,host:1800000},
 type:{'korona/trees':'pass','korona/carnivores':'pass','korona/floor':'pass','ehigh/trees':'pass','ehigh/floor':'pass','host':'host'},
};
const _itemCounts=()=>{const n={};scene.traverse(M=>{if(M.isInstancedMesh&&M.userData.biome){const k=M.name.replace(/^biome:/,'');n[k]=(n[k]||0)+M.count;}});return n;};
const HCHK={
 // the cold: nothing on the table eats more than a fly: no trap of danger .5 or more
 cold(TRP){const big=TRP.filter(t=>t.trap.danger>=.5);const small=TRP.filter(t=>t.key==='frosttank'||t.key==='butterwort');
  return{ok:big.length===0&&small.length>=20,detail:big.length+' dangerous traps (none allowed above the cloud); '+small.length+' cold traps registered'};},
 // the melt pools and the wet hollows: butterworts and frost tanks there and nowhere else
 pools(TRP){const c=TRP.filter(t=>t.key==='frosttank'||t.key==='butterwort');let off=0;c.forEach(t=>{if(poolD(t.x,t.z)>140&&STAGE.bogAt(t.x,t.z)<.4)off++;});
  return{ok:c.length>0&&off===0,detail:c.length+' cold traps, '+off+' away from the melt pools and the wet hollows'};},
 // the highlands' cushions grow on the top, off the pools and off the Mother Cushion
 cushions(EH){const T=(EH&&EH.TREES)||[];let wet=0,mother=0;T.forEach(t=>{if(poolD(t.x,t.z)<0)wet++;if(motherK(t.x,t.z)>.6)mother++;});
  return{ok:T.length>80&&wet===0&&mother===0,detail:T.length+' highlands plants; '+wet+' in a pool, '+mother+' on the Mother Cushion'};},
 // the snow lies on the lee: more snow on the south-east half than the north-west
 snow(){let lee=0,wind=0,n=0;for(let k=0;k<600;k++){const a=k*2.4,r=100+k*1.9,x=Math.cos(a)*r,z=Math.sin(a)*r;if(!NECANYONS.rockAt(x,z))continue;n++;const s=STAGE.snowAt(x,z);if((x+z)>0)lee+=s;else wind+=s;}
  return{ok:n>100&&lee>wind*3,detail:'snow weight lee '+lee.toFixed(1)+', windward '+wind.toFixed(1)+' over '+n+' samples'};},
 carvings(CV){if(!CV.length)return{ok:false,detail:'no carvings'};const c=CV[0];
  return{ok:c.arc>20&&c.hum===true&&Math.abs(c.wallD)<1.5,detail:'arc '+c.arc.toFixed(0)+' m on '+c.body+' bed '+c.bed+', '+c.wallD.toFixed(2)+' m off the wall'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),KO=KORONA,EH=typeof EHIGH!=='undefined'?EHIGH:null;
 add('the cold: nothing eats more than a fly',HCHK.cold(KO.TRAPPED||[]));
 add('the cold traps keep to the melt pools',HCHK.pools(KO.TRAPPED||[]));
 add('the highlands\' cushions grow on the top',HCHK.cushions(EH));
 add('the snow lies on the lee',HCHK.snow());
 add('the carvings under the rim',HCHK.carvings(CARVINGS));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),KO=KORONA,EH=typeof EHIGH!=='undefined'?EHIGH:null;
 add('a man-eater on the table',HCHK.cold((KO.TRAPPED||[]).concat([{key:'maneater',x:0,z:0,trap:KO.TRAPS.maneater}])));
 add('a frost tank far from any pool',HCHK.pools((KO.TRAPPED||[]).concat([{key:'frosttank',x:900,z:900,trap:KO.TRAPS.frosttank}])));
 add('a cushion in the tarn',HCHK.cushions({TREES:((EH&&EH.TREES)||[]).concat([{x:TARN.x,z:TARN.z}])}));
 add('no carvings',HCHK.carvings([]));
 return R;}

window._registered=REG.length;
KHOST.take({build:'korona',title:'Krator biome — Korona: the hoar table',
 hint:'Korona, station 6: a tepui summit above the cloud in the high cold country: cushions and snow wool leaning toward the giant, melt pools with butterworts and frost tanks, snow in the lee hollows, the ice tribes\' road-marks under the rim',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'carnivores':{match:o=>{if(!(o.isInstancedMesh&&o.userData&&o.userData.biome))return false;const it=(o.name||'').replace(/^biome:/,''),P=KORONA.plantOfItem(it)||NECANYONS.plantOfItem(it);return !!(P&&P.tags.trap);}},
  'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'the rock':{match:o=>!!(o.userData&&o.userData.rock)},'sky':{objects:()=>[sky,giant,giantRing]}},
 exporters:{biome:()=>BIO.export(),layout:()=>Object.assign(NECANYONS.records(),{carvings:CARVINGS,pools:STAGE.pools,air:STAGE.air})},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  high:()=>window._high,korona:()=>window._korona,hell:hellAt}});
