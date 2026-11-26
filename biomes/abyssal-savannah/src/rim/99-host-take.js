// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment says what this page has.
// The views and the checks are the land's (LAND, 44l; a station's own in LAND.views/LAND.checks), the base's checks every land's.
const VIEWS=Object.assign({
 'The savannah':[-900,40,-700,200,10,200],
 'In the grass':[300,2.2,600,700,4,300],
 'Over the land':[-1800,320,1700,300,20,-200],
},LAND.views||{});
(function(){const L=window._land||{},at=(s,dx,dy,dz,ty)=>{if(!s)return;VIEWS[s.label]=[s.x+dx,terrainH(s.x+dx,s.z+dz)+dy,s.z+dz,s.x,terrainH(s.x,s.z)+ty,s.z];};
 at(L.galleryAt,-60,8,-40,12);at(L.outlierAt,-140,6,-90,40);at(L.thornAt,-30,3,-20,6);at(L.palmAt,-40,4,-26,20);at(L.boneAt,-260,20,-200,110);at(L.bloodAt,-30,3,-20,12);
 if(L.moundAt){const m=L.moundAt;VIEWS[m.label]=[m.x-m.h*4,terrainH(m.x,m.z)+3,m.z-m.h*2.5,m.x,terrainH(m.x,m.z)+m.h*.6,m.z];}
 if(LAND.more)LAND.more(VIEWS,L);})();
// the inspector's words: the registered volume under the hit (the smallest), else the hit's own label; a species' harvest tag
function describe(hit){const p=hit.point,o=hit.object;let best=null;
 for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y==null?0:r.y)-2&&p.y<=(r.y==null?0:r.y)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,''):null,S=item?SAVRIM.speciesOfItem(item):null,hv=S&&S.tags?S.tags.harvest:null;
 return(S?S.name+'  ·  '+(o.userData.inspectLabel||item):(best?best.name:(o.userData.inspectLabel||o.name||'mesh')))+
  (hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':''):'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={showcase:Object.assign({tris:11000000,calls:420},LAND.budget||{}),cls:{pass:7000000,host:1500000},
 type:{'savannah/grass':'pass','savannah/trees':'pass','host':'host'}};
const _itemCounts=()=>{const n={};scene.traverse(M=>{if(M.isInstancedMesh&&M.userData.biome){const k=(M.name||'').replace(/^biome:/,'');n[k]=(n[k]==null?0:n[k])+M.count;}});return n;};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),L=window._land||{},n=L.n||{};
 add('the burn mosaic: patches of every age, none in the gallery, the dambos or on the river',(()=>{if(!FIRE)return{ok:false,detail:'no fire history'};
  const ages=[0,0,0,0];let bad=0;for(let i=0;i<4000;i++){const x=(KRAND.unit(KRAND.hash(7,i,1))-.5)*2*TERR.R*.9,z=(KRAND.unit(KRAND.hash(7,i,2))-.5)*2*TERR.R*.9,a=FIRE.ageAt(x,z),Z=zoneW(x,z);
   if((Z.gallery>.95||Z.dambo>.95||Z.rd<RIVER.w*.5)&&a<60)bad++;ages[a<1?0:a<3?1:a<10?2:3]++;}
  return{ok:!bad&&ages[0]>0&&ages[1]>0&&ages[2]>0,detail:'samples by age (<1, 1-3, 3-10, older or never): '+ages.join(', ')+'; burnt where nothing burns: '+bad};})());
 add('the savannah\'s base drawn',(()=>{const need=Object.assign({redoat:20000,borassus:20,gallery:40,mound:20},LAND.need||{}),bad=Object.keys(need).filter(k=>!((n[k]==null?0:n[k])>=need[k]));
  return{ok:!bad.length,detail:Object.keys(need).map(k=>k+' '+(n[k]==null?0:n[k])).join(', ')+(bad.length?'; short: '+bad.join(', '):'')};})());
 add('the grass by the burn\'s age (none on this season\'s ash, full on the old burns)',(()=>{if(!FIRE)return{ok:false,detail:'no fire'};let fresh=0,old=0,fresh0=0,old0=0;
  for(let i=0;i<3000;i++){const x=(KRAND.unit(KRAND.hash(9,i,1))-.5)*2*TERR.R*.8,z=(KRAND.unit(KRAND.hash(9,i,2))-.5)*2*TERR.R*.8,a=FIRE.ageAt(x,z),k=smooth(.25,3,a);if(a<.2){fresh++;if(k<.08)fresh0++;}else if(a>4){old++;if(k>.99)old0++;}}
  return{ok:fresh>0&&fresh0===fresh&&old0===old,detail:fresh+' samples on this season\'s burns (all bare: '+fresh0+'), '+old+' on old ground (all full: '+old0+')'};})());
 add('the seasons bound (H7: the grass bleaches, the monsoon kapoks drop)',(()=>{const m=SAVRIM.MAT.grass,o=m.userData&&m.userData.bio&&m.userData.bio.opts;
  return{ok:!!(o&&o.season)&&!!BIO.SEASON,detail:'grass season '+JSON.stringify(o&&o.season)+'; page season '+(BIO.SEASON?JSON.stringify(BIO.SEASON.value):'none')};})());
 add('the cousins resolve to their source',(()=>{const K=L.kin||[];return{ok:K.every(k=>k.tags&&/^\w[\w-]*\.\w+$/.test(k.tags.kin))&&K.length>=(LAND.kinMin==null?0:LAND.kinMin),detail:K.map(k=>k.key+' <- '+(k.tags&&k.tags.kin)).join(', ')||'none'};})());
 if(LAND.checks)LAND.checks(add,L);
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('a burn mosaic with nothing burnt',(()=>{const H=KFIRE.history({R:600,cell:20,seed:1,wind:[1,0],old:0,height:()=>0,burn:()=>0,fires:[]});
  let n=0;for(let i=0;i<200;i++)if(H.ageAt((i%20)*50-500,Math.floor(i/20)*50-250)<60)n++;return{ok:n>0,detail:n+' burnt samples'};})());
 add('a cousin with no source',(()=>{const r=BIO.kinRecord?BIO.kinRecord({key:'x',H:[1,2]},{},'nokit.none'):null;return{ok:!!(r&&r.kin&&r.kin.kit==='savannarim'),detail:'kin from '+(r&&r.kin&&r.kin.kit)};})());
 if(LAND.negatives)LAND.negatives(add);
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');
KHOST.take({build:'abyssal-savannah-rim',title:LAND.title,hint:LAND.hint,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'landforms':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
  get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  land:()=>window._land}});
// THE SEASON (core/clock, BIO.bindSeason, H7): the monsoon, two seasons, the rains in the southern summer. The grass bleaches toward straw
// in the dry season (SAVRIM.MAT's season), the monsoon kapoks and baobabs drop (the hyperjungle's own, read in place). ?season=0 as before
if(new URLSearchParams(location.search).get('season')!=='0'&&BIO.bindSeason){BIO.bindSeason(null,{sharp:2});if(BIO.bindFlush)BIO.bindFlush(null,{sharp:2});}   /* the flush: the rust miombo's copper at the rains' start (30s) */
if(LAND.after)LAND.after();
