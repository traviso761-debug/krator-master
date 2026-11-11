// ================================================================= HOST — the kit's views, inspector words and checks (station 2, the rain wall)
const lightMode=m=>{if(typeof setLightMode==='function')setLightMode(m);};
const VIEWS={};
(function(){const G=(x,z)=>terrainH(x,z);
 const add=(k,v,mode)=>{if(v&&v.every(isFinite))VIEWS[k]={v,mode:mode||'day'};};
 const IX=KSPACE.create({cell:30});SWHI.TREES.forEach(T=>IX.insert(T,T.x,T.z,0));const _o=[];const around=(x,z,r)=>IX.query(x,z,r,_o).filter(T=>Math.hypot(T.x-x,T.z-z)<r);
 const specimen=(key,dist,h,lookK,filter)=>{const C=SWHI.TREES.filter(T=>T.sp===SWHI.KEY[key]&&T.lv===2&&(!filter||filter(T)));let best=null;
  C.slice(0,500).forEach(T=>{const crowd=around(T.x,T.z,dist+6).length;if(best&&crowd>=best.crowd)return;for(let q=0;q<16;q++){const a=q/16*Math.PI*2,cx=T.x+Math.cos(a)*dist,cz=T.z+Math.sin(a)*dist;if(BIO.mask(cx,cz)<.1)continue;if(around((cx+T.x)/2,(cz+T.z)/2,dist*.4).some(O=>O!==T&&O.H>4))continue;best={T,crowd,cx,cz};break;}});
  if(!best)return null;const T=best.T;return[best.cx,G(best.cx,best.cz)+h,best.cz,T.x,T.y0+T.H*(lookK||.5),T.z];};
 // the overview: from over the valley below the dam, up the lake
 {const x=SLIDE.x-520,z=axisZ(x)-160;add('The landslide lake behind its dam',[x,LAKE.crest+150,z,1000,LAKE.level,axisZ(1000)]);}
 // the dam: on its back by its biggest megablock
 {const B=RUNOUT.blocks.slice().sort((a,b)=>b.r-a.r)[0];if(B){const a=Math.atan2(B.z-axisZ(B.x),B.x-SLIDE.x+1),cx=B.x-Math.cos(a)*(B.r+40),cz=B.z-Math.sin(a)*(B.r+40);add('The dam, its hummocks and a megablock',[cx,G(cx,cz)+6,cz,B.x,G(B.x,B.z)+4,B.z]);}}
 add('Stilt pod trees on the scar',specimen('stiltpod',18,2.5,.6));
 add('Shelf coral on the fresh boulders',specimen('shelfcoral',14,2,.55));
 add('Weeping wisps in the cloud forest',specimen('weepingwisp',24,3,.55));
 {const T=SWHI.TREES.find(T=>T.sp===SWHI.KEY.fishingbridge);if(T){const mx=(T.x+T.x2)/2,mz=(T.z+T.z2)/2,r=streamNear(mx,mz),i=r?r.i:0,p=SEEP.pts[Math.max(0,i-3)];
  add('The fishing bridge over the seep',[p[0],SEEP.y[Math.max(0,i-3)]+2.2,p[1]+3,mx,SEEP.y[i]+2.5,mz]);}}
 // the thread of falls: from the lower valley up to the lip
 {const x=LIP.x-300,z=axisZ(x)+40;add('The seep falls over the hanging lip',[x,G(x,z)+30,z,LIP.x+20,floorY(LIP.x+20)-30,axisZ(LIP.x)]);}
 {const S=(SWHI.SNAGS||[]).slice().sort((a,b)=>a.x-b.x);if(S.length){const s=S[Math.floor(S.length*.4)],x=s.x-55,z=s.z+20;add('Drowned trees in the lake',[x,LAKE.level+4,z,s.x+30,LAKE.level+4,s.z-5]);}}
 {const P=PINNACLES[Math.floor(PINNACLES.length/2)];if(P){const x=P.x+70,z=P.z+60;add('Fluted pinnacles over the scar',[x,G(x,z)+12,z,P.x,(P.y0+P.top)*.5,P.z]);}}
 {const g=itemPositions('glowtubes',3).filter(p=>Math.abs(p[2]-axisZ(p[0]))<500);if(g.length){const p=g[Math.floor(g.length/2)];add('Glow tubes on the forest floor at night',[p[0]+5,G(p[0]+5,p[2]+3)+1.6,p[2]+3,p[0],p[1]+.6,p[2]],'night');}}
 add('Cloud on the lake at dawn',[SLIDE.x-60,LAKE.crest+25,axisZ(SLIDE.x)-60,1200,LAKE.level+10,axisZ(1200)],'dawn');})();
function tagText(t){if(!t)return'';const g=t.tags,h=g.harvest||{};return '\n'+t.cls+'  ·  '+g.climate+' / '+g.aridity+' / '+(g.abyssal?'abyssal':'non-abyssal')+'\nharvest: wood '+h.wood+(h.edible&&h.edible.length?' · edible: '+h.edible.join(', '):' · not edible')+(h.notes?'\n'+h.notes:'');}
function describe(h0,hits){hits=hits.filter(h=>h.object.visible);if(!hits.length)return '(nothing)';const p=hits[0].point,o=hits[0].object;
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;let name,tags=null;
 if(isItem){tags=SWHI.tagsOf(lab);name=lab+(best&&best.kind==='tree'?'  (on '+best.name+')':'');if(!tags&&best&&best.kind==='tree')tags=SWHI.tagsOf(best.name);}
 else{name=(best?best.name+'  ·  ':'')+lab;if(best&&best.kind==='tree')tags=SWHI.tagsOf(best.name);}
 let bed='';if(o===GROUND||o.userData.rock){try{const s=STRATA.surface(p.x,p.y,p.z,.5);if(s)bed='\nbed: '+s.kind+' ('+s.recipe+')';}catch(e){}}
 return name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  ('+(ALT0+p.y).toFixed(0)+' m above the sea)  range '+camera.position.distanceTo(p).toFixed(0)+' m'+tagText(tags)+bed;}
const HOST_VIEWS={};for(const k in VIEWS)HOST_VIEWS[k]=VIEWS[k].v;
const LCTL=['day','dawn','night'].map(m=>({button:m[0].toUpperCase()+m.slice(1),title:'',on:()=>lightMode(m),m}));
if(typeof LIGHT_HOOKS!=='undefined')LIGHT_HOOKS.push(m=>{for(const c of LCTL)if(c.el)c.el.classList.toggle('on',c.m===m);});
const BUDGET={showcase:{tris:30000000,calls:420,rendered:12000000},cls:{pass:20000000,host:5000000},type:{'swhighlands/trees':'pass','host':'host'}};
function itemPositions(name,every){const out=[],m=new THREE.Matrix4();every=every||1;BIO.baked.forEach(o=>{if(!o.isInstancedMesh||o.name!=='biome:'+name)return;for(let i=0;i<o.count;i+=every){o.getMatrixAt(i,m);out.push([m.elements[12],m.elements[13],m.elements[14]]);}});return out;}
// THE CHECKS, each a plain function of the data, with a broken input that must fail
const HCHK={
 // the lake seeps through its dam, never over it: its level under the dam's lowest crest across the valley
 seeps(L){return{ok:L.level<L.crest-4,detail:'the lake at '+Math.round(ALT0+L.level)+' m, the dam\'s lowest crest '+Math.round(ALT0+L.crest)+' m ('+(L.crest-L.level).toFixed(1)+' m of freeboard)'};},
 // the seep descends, and falls over the lip
 descend(C,falls){const up=C.y.some((y,i)=>i&&y>C.y[i-1]+1e-6),drop=C.y[0]-C.y[C.y.length-1];
  return{ok:!up&&falls.length>=1&&drop>LIP.drop*.8,detail:(up?'climbs; ':'')+drop.toFixed(0)+' m over '+(C.LEN/1000).toFixed(2)+' km, '+falls.length+' fall(s) at the lip'};},
 // the fishing bridge is rooted on both banks, the seep between its feet
 bridge(trees){const T=trees.find(T=>T.sp===SWHI.KEY.fishingbridge);if(!T)return{ok:false,detail:'no fishing bridge'};
  const a=streamNear(T.x,T.z),b=streamNear(T.x2,T.z2),m=streamNear((T.x+T.x2)/2,(T.z+T.z2)/2);const ok=!!a&&!!b&&!!m&&a.dd>0&&b.dd>0&&m.dd<0;
  return{ok,detail:'its feet '+(a?a.dd.toFixed(1):'?')+' and '+(b?b.dd.toFixed(1):'?')+' m from the water\'s edge, its middle '+(m?(-m.dd).toFixed(1):'?')+' m in over the seep'};},
 // the drowned trees stand in the lake
 snags(S){const dry=S.filter(s=>!(waterH(s.x,s.z)>terrainH(s.x,s.z)+.4));return{ok:S.length>=20&&!dry.length,detail:S.length+' drowned trees, '+dry.length+' on dry ground'};}};
function hostChecks(){return[Object.assign({name:'the lake seeps through its dam'},HCHK.seeps(LAKE)),Object.assign({name:'the seep descends and falls over the lip'},HCHK.descend(SEEP,SEEP_FALLS)),
 Object.assign({name:'the fishing bridge spans the seep'},HCHK.bridge(SWHI.TREES)),Object.assign({name:'the drowned trees stand in the lake'},HCHK.snags(SWHI.SNAGS||[]))];}
function hostNegatives(){const r=(name,c)=>({name,failed:!c.ok,detail:c.detail});
 return[r('a lake over its dam\'s crest',HCHK.seeps({level:LAKE.crest+1,crest:LAKE.crest})),r('a seep that climbs',HCHK.descend(Object.assign({},SEEP,{y:SEEP.y.map((y,i)=>i===4?y+5:y)}),SEEP_FALLS)),
  r('a fishing bridge with both feet in the water',HCHK.bridge(SWHI.TREES.map(T=>T.sp===SWHI.KEY.fishingbridge?Object.assign({},T,{x2:(T.x+T.x2)/2,z2:(T.z+T.z2)/2}):T))),
  r('a drowned tree on the bank',HCHK.snags((SWHI.SNAGS||[]).concat([{x:SLIDE.x-200,z:-1300}])))];}
function biomeChecks(){const R={},sp=SWHI.SPECIES.filter(S=>S.station==='rainwall');
 R.missing=sp.filter(S=>!SWHI.TREES.some(T=>T.sp===SWHI.KEY[S.key])).map(S=>S.key);R.bySpecies=sp.map(S=>S.key+':'+SWHI.TREES.filter(T=>T.sp===SWHI.KEY[S.key]).length).join(' ');
 R.treesInWater=SWHI.TREES.filter(T=>T.sp!==SWHI.KEY.fishingbridge&&BIO.depth(T.x,T.z)>.05).length;
 R.treesOnCliffs=SWHI.TREES.filter(T=>T.lv>0&&FC.at(FC.a.slope,T.x,T.z)>1.25).length;
 const mean=(k,f)=>{const L=SWHI.TREES.filter(T=>T.sp===SWHI.KEY[k]);return L.length?L.reduce((s,T)=>s+FC.at(FC.a[f],T.x,T.z),0)/L.length:0;};
 R.stiltOnScar=mean('stiltpod','scar');R.shelfByBoulders=mean('shelfcoral','boulder');
 R.floor={glow:itemPositions('glowtubes').length,triplets:itemPositions('triplets').length,moss:itemPositions('moss').length};R.snags=(SWHI.SNAGS||[]).length;R.pinnacles=PINNACLES.length;return R;}
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');
/* the land in the lake (core/water/ext/58; the owner, 2026-11-01): off at page load, for the tri counts; the panel's button or ?mirror=probe|live */
const MIRROR=WATER.mirrorSwitch&&LAKE_DRAW&&LAKE_DRAW.mesh?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[LAKE_DRAW.mesh.material],
 level:LAKE.level,center:[900,axisZ(900)],radius:900,far:3200,tree:o=>o.name==='biome:impRainwall',hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;
KHOST.take({build:'swhighlands-rainwall',title:'Krator SW Highlands: the rain wall',
 hint:'The SW highlands, station 2: the rain wall and the landslide lake (2.7-3.4 km, in cloud). A rock avalanche has dammed the valley: the lake behind it, its drowned trees, the seep through the dam and its falls over the hanging lip, stilt pod trees on the fresh scar, shelf coral on the boulders, weeping wisps, a fishing bridge over the seep, fluted pinnacles. N for night',
 scene,camera,renderer,ground:terrainH,clear:1.6,minR:2,maxR:9000,registry:REG,views:HOST_VIEWS,ticks:TICKS,onView:k=>lightMode(VIEWS[k].mode),controls:LCTL,
 keys:{n:()=>lightMode((typeof LIGHT_MODE!=='undefined'&&LIGHT_MODE==='night')?'day':'night')},clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'rock':{match:o=>!!(o.userData&&o.userData.rock)},'rings':{objects:()=>[giantRing]}},exporters:{biome:()=>BIO.export()},minimap:{title:'The rain wall'},
 budget:BUDGET,types:()=>BIO.stats,probeSample:4000,
 api:{hostChecks,hostNegatives,
  regOccupancy(){const n=new Array(REG.length).fill(0);const P=KHOST.probe.probePoints();REG.forEach((r,i)=>{if(r.kind==='tree'){n[i]=1;return;}for(const p of P){const dx=p[0]-r.x,dz=p[2]-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=(r.y||0)-2&&p[1]<=(r.y||0)+r.h+5)n[i]++;}});return REG.map((r,i)=>({name:r.name,type:r.kind,n:n[i]}));},
  get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biomeChecks,itemPositions,biome:()=>window._biome}});
