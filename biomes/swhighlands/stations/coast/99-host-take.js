// ================================================================= HOST — the kit's views, inspector words and checks (station 5, the fan coast)
const lightMode=m=>{if(typeof setLightMode==='function')setLightMode(m);};
const VIEWS={};
(function(){const G=(x,z)=>groundH(x,z);
 const add=(k,v,mode)=>{if(v&&v.every(isFinite))VIEWS[k]={v,mode:mode||'day'};};
 const IX=KSPACE.create({cell:30});SWHI.TREES.forEach(T=>IX.insert(T,T.x,T.z,0));const _o=[];const around=(x,z,r)=>IX.query(x,z,r,_o).filter(T=>Math.hypot(T.x-x,T.z-z)<r);
 const specimen=(key,dist,h,lookK,filter)=>{const C=SWHI.TREES.filter(T=>T.sp===SWHI.KEY[key]&&T.lv===2&&(!filter||filter(T)));let best=null;
  C.slice(0,500).forEach(T=>{const crowd=around(T.x,T.z,dist+6).length;if(best&&crowd>=best.crowd)return;for(let q=0;q<16;q++){const a=q/16*Math.PI*2,cx=T.x+Math.cos(a)*dist,cz=T.z+Math.sin(a)*dist;if(BIO.mask(cx,cz)<.1)continue;best={T,crowd,cx,cz};break;}});
  if(!best)return null;const T=best.T;return[best.cx,G(best.cx,best.cz)+h,best.cz,T.x,T.y0+T.H*(lookK||.5),T.z];};
 // the overview: from the scarp over the middle wadi's fan delta to the sea
 {const F=WADI_RECS[1].fan;if(F){const x=F.x-900,z=F.z-300;add('The fan delta from the scarp',[x,G(x,z)+40,z,F.x+250,0,F.z]);}}
 // a fan delta from the beach beside it, its cobble front running into the sea
 {const F=WADI_RECS[2].fan;if(F){const z=F.z-F.r*.9,x=coastX(z)-6;add('A fan delta from the beach',[x,G(x,z)+2.2,z,F.x+F.r*.4,0,F.z]);}}
 // the sea arches: from the beach, through the opening along the shore
 /* from out in the surf, square to the span, through the opening toward the beach */
 ROCKS.filter(B=>B.isArch).forEach((B,i)=>{const d=B.top-B.y0+45,x=B.x+d,z=B.z+(i?-8:8);add(i?'The southern sea arch':'The northern sea arch',[x,2.4,z,B.x-20,B.y0+(B.top-B.y0)*.35,B.z]);});
 // the flysch platforms at low water: its ribs running out to sea
 {const P=PLATFORMS[0],z=(P.z0+P.z1)/2+30,x=coastX(z)-25;add('The flysch platforms',[x,Math.max(G(x,z),0)+4,z,x+90,-.5,z-20]);}
 add('Star-fruit caudex on a ledge',specimen('starcaudex',7,1.6,.5));
 add('Coral melons in a wadi',specimen('coralmelon',8,1.7,.5));
 {const Y=(STATION_KIN.yucca||[]).filter(T=>T.lv===2),T=Y[Math.floor(Y.length/2)];if(T)add('Chaparral yuccas on the scarp',[T.x+9,G(T.x+9,T.z+4)+1.8,T.z+4,T.x,T.y0+T.H*.5,T.z]);}
 {const Y=(STATION_KIN.swordspire||[]).filter(T=>T.lv===2),T=Y[Math.floor(Y.length/2)];if(T)add('Sword spires (the glaucous cousin)',[T.x+6,G(T.x+6,T.z+3)+1.6,T.z+3,T.x,T.y0+T.H*.5,T.z]);}
 {const z=-200,x=coastX(z)+600;add('The scarp from the sea',[x,40,z,coastX(z)-1600,700,z+100]);}
 {const z=300,x=coastX(z)-300;add('Dawn over the Ring Sea',[x,G(x,z)+25,z,x+2000,30,z-300],'dawn');}
 {const z=760,x=coastX(z)-20;add('The beach at night',[x,G(x,z)+2,z,x+200,1,z+30],'night');}})();
function tagText(t){if(!t)return'';const g=t.tags,h=g.harvest||{};return '\n'+t.cls+'  ·  '+g.climate+' / '+g.aridity+' / '+(g.abyssal?'abyssal':'non-abyssal')+'\nharvest: wood '+h.wood+(h.edible&&h.edible.length?' · edible: '+h.edible.join(', '):' · not edible')+(h.notes?'\n'+h.notes:'');}
function describe(h0,hits){hits=hits.filter(h=>h.object.visible);if(!hits.length)return '(nothing)';const p=hits[0].point,o=hits[0].object;
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;let name,tags=null;
 if(isItem){tags=SWHI.tagsOf(lab);name=lab+(best&&best.kind==='tree'?'  (on '+best.name+')':'');if(!tags&&best&&best.kind==='tree')tags=SWHI.tagsOf(best.name);}
 else{name=(best?best.name+'  ·  ':'')+lab;if(best&&best.kind==='tree')tags=SWHI.tagsOf(best.name);}
 let bed='';if(o===GROUND||(o.userData&&o.userData.rock)){try{const s=STRATA.surface(p.x,p.y,p.z,.5);if(s)bed='\nbed: '+s.kind+' ('+s.recipe+')';}catch(e){}}
 return name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  ('+(ALT0+p.y).toFixed(0)+' m above the sea)  range '+camera.position.distanceTo(p).toFixed(0)+' m'+tagText(tags)+bed;}
const HOST_VIEWS={};for(const k in VIEWS)HOST_VIEWS[k]=VIEWS[k].v;
const LCTL=['day','dawn','night'].map(m=>({button:m[0].toUpperCase()+m.slice(1),title:'',on:()=>lightMode(m),m}));
if(typeof LIGHT_HOOKS!=='undefined')LIGHT_HOOKS.push(m=>{for(const c of LCTL)if(c.el)c.el.classList.toggle('on',c.m===m);});
const BUDGET={showcase:{tris:30000000,calls:420,rendered:12000000},cls:{pass:20000000,host:5000000},type:{'swhighlands/trees':'pass','host':'host'}};
function itemPositions(name,every){const out=[],m=new THREE.Matrix4();every=every||1;BIO.baked.forEach(o=>{if(!o.isInstancedMesh||o.name!=='biome:'+name)return;for(let i=0;i<o.count;i+=every){o.getMatrixAt(i,m);out.push([m.elements[12],m.elements[13],m.elements[14]]);}});return out;}
// THE CHECKS, each a plain function of the data, with a broken input that must fail
const HCHK={
 // each fan delta: its cone over the sea's level on land, and its front on under the water (the ground there over the shoreface's)
 fans(recs){const bad=recs.filter(R=>{const F=R.fan;if(!F)return true;const a=F.dir;let on=0,under=0;   /* down the fan's axis: cobble over the sea's level, then fill on the shoreface under it */
   for(let t=.05;t<=1.001;t+=.05){const x=F.x+Math.cos(a)*F.r*t,z=F.z+Math.sin(a)*F.r*t,g=groundH(x,z);if(g>.5)on++;else if(g<0&&g>scarp0(x,z)+2)under++;}return !(on>0&&under>0);});
  return{ok:recs.length===3&&!bad.length,detail:recs.length+' wadis, '+(recs.length-bad.length)+' fan deltas building out under the sea'};},
 // the sea arches stand with their openings clear
 arches(list){const ok=list.filter(B=>B.opening&&B.opening.y1>B.opening.y0+4);return{ok:list.length===2&&ok.length===2,detail:list.length+' sea arches, '+ok.length+' with an opening'};},
 // nothing rooted in the sea
 dry(trees){const wet=trees.filter(T=>groundH(T.x,T.z)<.3);return{ok:trees.length>50&&!wet.length,detail:trees.length+' plants, '+wet.length+' rooted under the sea\'s level'};}};
const ALLT=()=>SWHI.TREES.concat(...Object.values(STATION_KIN));
function hostChecks(){return[Object.assign({name:'the fan deltas build out into the sea'},HCHK.fans(WADI_RECS)),Object.assign({name:'the sea arches stand'},HCHK.arches(ROCKS.filter(B=>B.isArch))),
 Object.assign({name:'nothing rooted in the sea'},HCHK.dry(ALLT()))];}
function hostNegatives(){const r=(name,c)=>({name,failed:!c.ok,detail:c.detail});
 return[r('a wadi with no fan',HCHK.fans(WADI_RECS.map((R,k)=>k?R:Object.assign({},R,{fan:null})))),r('an arch with its opening filled',HCHK.arches(ROCKS.filter(B=>B.isArch).map(B=>Object.assign({},B,{opening:null})))),
  r('a caudex in the surf',HCHK.dry(ALLT().concat([{x:coastX(-300)+150,z:-300}])))];}
function biomeChecks(){const R={},sp=SWHI.SPECIES.filter(S=>S.station==='coast');
 R.missing=sp.filter(S=>!SWHI.TREES.some(T=>T.sp===SWHI.KEY[S.key])).map(S=>S.key);
 const kin=['yucca','swordspire'].filter(k=>!(STATION_KIN[k]||[]).length);R.missing=R.missing.concat(kin);
 R.bySpecies=sp.map(S=>S.key+':'+SWHI.TREES.filter(T=>T.sp===SWHI.KEY[S.key]).length).concat(['yucca','swordspire'].map(k=>k+':'+(STATION_KIN[k]||[]).length)).join(' ');
 R.treesOnCliffs=SWHI.TREES.filter(T=>T.lv>0&&FC.at(FC.a.slope,T.x,T.z)>1.3).length;R.treesInWater=ALLT().filter(T=>groundH(T.x,T.z)<.3).length;
 R.floor={arrow:itemPositions('arrowheads').length,frill:itemPositions('frill').length,slug:itemPositions('tslug').length,flame:itemPositions('flame').length};R.rocks=ROCKS.length;return R;}
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');
KHOST.take({build:'swhighlands-coast',title:'Krator SW Highlands: the fan coast',
 hint:'The SW highlands, station 5: the fan coast, in the crest\'s rain shadow. The dry scarp falls to the Ring Sea; its wadis build fan deltas into it; sea arches, stacks and flysch platforms on a sand beach; star-fruit caudex, coral melons, arrowheads, the crater drylands\' yucca and sword spires. N for night',
 scene,camera,renderer,ground:groundH,clear:1.6,minR:2,maxR:9000,registry:REG,views:HOST_VIEWS,ticks:TICKS,onView:k=>lightMode(VIEWS[k].mode),controls:LCTL,
 keys:{n:()=>lightMode((typeof LIGHT_MODE!=='undefined'&&LIGHT_MODE==='night')?'day':'night')},clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'rock':{match:o=>!!(o.userData&&o.userData.rock)},'rings':{objects:()=>[giantRing]}},exporters:{biome:()=>BIO.export()},minimap:{title:'The fan coast'},
 budget:BUDGET,types:()=>BIO.stats,probeSample:4000,
 api:{hostChecks,hostNegatives,
  regOccupancy(){const n=new Array(REG.length).fill(0);const P=KHOST.probe.probePoints();REG.forEach((r,i)=>{if(r.kind==='tree'){n[i]=1;return;}for(const p of P){const dx=p[0]-r.x,dz=p[2]-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=(r.y||0)-2&&p[1]<=(r.y||0)+r.h+5)n[i]++;}});return REG.map((r,i)=>({name:r.name,type:r.kind,n:n[i]}));},
  get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biomeChecks,itemPositions,biome:()=>window._biome}});
