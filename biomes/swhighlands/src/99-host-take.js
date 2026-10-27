// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's; this fragment only says what this page has.
const lightMode=m=>{if(typeof setLightMode==='function')setLightMode(m);};
// THE PRESET VIEWS: [camera xyz, target xyz, light mode], found in the built scene (at a species' most open hero, through the
// arch, up the gorge), never aimed at arithmetic alone
const VIEWS={};
(function(){const G=(x,z)=>terrainH(x,z),TAU=Math.PI*2;
 const add=(k,v,mode)=>{if(v&&v.every(isFinite))VIEWS[k]={v,mode:mode||'day'};};
 const U=(i,k)=>KRAND.unit(KRAND.hash(WORLD,i,k,0x7E3));
 // trees found in the scene, by a KSPACE index of their feet
 const IX=KSPACE.create({cell:40});SWHI.TREES.forEach(T=>IX.insert(T,T.x,T.z,0));const _o=[];
 const around=(x,z,r)=>IX.query(x,z,r,_o).filter(T=>Math.hypot(T.x-x,T.z-z)<r);
 const blocked=(T,cx,cz)=>{for(const O of around((T.x+cx)/2,(T.z+cz)/2,Math.hypot(T.x-cx,T.z-cz)/2+10)){if(O===T||O.H<5)continue;const dx=cx-T.x,dz=cz-T.z,l2=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((O.x-T.x)*dx+(O.z-T.z)*dz)/l2));if(Math.hypot(T.x+dx*t-O.x,T.z+dz*t-O.z)<O.rb*2.2+1.5)return true;}return false;};
 const specimen=(key,dist,h,lookK,filter)=>{const C=SWHI.TREES.filter(T=>T.sp===SWHI.KEY[key]&&T.lv===2&&(!filter||filter(T)));let best=null;
  C.slice(0,600).forEach(T=>{const crowd=around(T.x,T.z,dist+8).length;if(best&&crowd>=best.crowd)return;
   for(let q=0;q<16;q++){const a=q/16*TAU,cx=T.x+Math.cos(a)*dist,cz=T.z+Math.sin(a)*dist;if(BIO.mask(cx,cz)<.1||blocked(T,cx,cz))continue;best={T,crowd,cx,cz};break;}});
  if(!best)return null;const T=best.T;return[best.cx,G(best.cx,best.cz)+h,best.cz,T.x,T.y0+T.H*(lookK||.5),T.z];};
 // the overview: from the arch ridge's crest north of the arch, over the cove and the strike valley to the limestone ridge
 {const cx=crestX(RA,-980),cz=-980;add('Overview from the arch ridge',[cx+40,G(cx+40,cz)+60,cz,700,40,-200]);}
 // through the arch: from the east side of the wind gap, low, the opening framing the west fold
 {const A=BODIES.find(B=>B.kind==='arch'&&B.id==='arch');if(A){const o=A.opening;add('The arch',[A.x+70,G(A.x+70,A.z)+6,A.z+8,A.x-200,o.y0+(o.y1-o.y0)*.5,A.z]);}}
 // the bald: its pillar cap from the turf, and under it looking up
 {const T=SWHI.TREES.find(T=>T.bald);if(T){const a=Math.atan2(-1,.4),cx=T.x+Math.cos(a)*55,cz=T.z+Math.sin(a)*55;add('The bald and its pillar cap',[cx,G(cx,cz)+3,cz,T.x,T.y0+T.H*.55,T.z]);
  add('Under the pillar cap',[T.x+T.crownR*.5,G(T.x+T.crownR*.5,T.z)+1.7,T.z+2,T.x,T.y0+T.H*.88,T.z]);
  add('The last farm from the bald',[T.x+30,G(T.x+30,T.z-60)+4,T.z-60,(FARM.x0+FARM.x1)/2,terrainH((FARM.x0+FARM.x1)/2,-2000)+5,-2050]);}}
 // the cove: at eye height among the lattice oaks and the bead cones
 {const C=SWHI.TREES.filter(T=>T.sp===SWHI.KEY.latticeoak&&T.lv===2&&Math.hypot(T.x-COVE.x,T.z-COVE.z)<180);const T=C[Math.floor(C.length/2)];
  /* a clearing in the cove: no tree within 9 m, the camera looking at the nearest hero 25-45 m off */
  let v=null;for(let i=0;i<400&&!v;i++){const cx=COVE.x+(U(i,1)-.5)*COVE.rx*1.2,cz=COVE.z+(U(i,2)-.5)*COVE.rz*1.2;if(BIO.mask(cx,cz)<.3||around(cx,cz,9).length)continue;
   const L=around(cx,cz,45).filter(O=>O.sp===SWHI.KEY.latticeoak&&Math.hypot(O.x-cx,O.z-cz)>25);if(!L.length)continue;const O=L[0];v=[cx,G(cx,cz)+1.7,cz,O.x,O.y0+O.H*.45,O.z];}
  if(!v&&T)v=[T.x+14,G(T.x+14,T.z+10)+1.7,T.z+10,T.x-40,T.y0+T.H*.6,T.z-30];
  if(v){add('In the cove',v);add('Night: the cove',v,'night');}}
 add('A lattice oak',specimen('latticeoak',34,4,.6));
 add('Bead cones',specimen('beadcone',14,2,.6));
 /* ?sheet=pillars: station 4's flora laid out on the bald (57-biome-swhighlands-pillars.js), the row of anemone trees and the beds before it */
 {const S=window._biome&&window._biome.sheet;if(S){const T0=S.trees[0],T5=S.trees[S.trees.length-1],mx=(T0.x+T5.x)/2,mz=(T0.z+T5.z)/2;
  add('Station 4 flora: the anemone trees',[mx,G(mx,mz-34)+5,mz-34,mx,G(mx,mz)+5,mz]);
  const b=S.beds,c=b.torch;add('Station 4 flora: the floor',[c[0],G(c[0],c[1]-20)+4.5,c[1]-20,c[0],G(c[0],c[1])+.4,c[1]]);}}
 // the river cave: on the valley floor in front of the bite, the chevron cliff over the mouth
 add('The river cave',[BITE.x-150,Math.max(G(BITE.x-150,BITE.z+20),BITE.floor)+16,BITE.z+20,BITE.x+BITE.r,BITE.floor+22,BITE.z]);
 // the gorge: from beside the sink, up the gorge through the three bridges
 {const K=GORGE.sink;add('The gorge and its bridges',[K.x-26,K.level+9,K.z-10,GP[1][0],GORGE.segs[1].ya+10,GP[1][1]]);}
 // the water gap: on the river upstream of the gap, looking west through the notch
 {const i=RIVER.pts.findIndex(p=>p[1]>560),p=RIVER.pts[Math.max(0,i)];add('The water gap',[p[0]+30,RIVER.y[Math.max(0,i)]+8,p[1]-30,WG_B[0],RIVER.y[Math.max(0,i)]+20,WG_B[1]]);}
 // the river down the strike valley
 {const i=Math.floor(RIVER.pts.length*.35),p=RIVER.pts[i],q=RIVER.pts[i+8];add('The fold river',[p[0]+6,RIVER.y[i]+2.2,p[1],q[0],RIVER.y[i+8]+1.5,q[1]]);}
 // dawn: the mist in the strike valley from the limestone ridge's flank
 add('Dawn: mist in the valley',[1050,G(1050,-150)+30,-150,200,10,-700],'dawn');
})();
// ---------------------------------------------------------------- the inspector's words
function tagText(t){if(!t)return'';const g=t.tags,h=g.harvest||{};return '\n'+t.cls+'  ·  '+g.climate+' / '+g.aridity+' / '+(g.abyssal?'abyssal':'non-abyssal')+' / riparian: '+g.riparian+
 '\nharvest: wood '+h.wood+(h.edible&&h.edible.length?' · edible: '+h.edible.join(', '):' · not edible')+(h.medicinal?' · medicinal':'')+(h.notes?'\n'+h.notes:'');}
// the bed under a rock or ground hit (KSTRATA: the beds the shader draws)
function bedText(p,o){if(!o.userData||!(o.userData.rock||o===GROUND||GROUND_INSETS.indexOf(o)>=0))return'';try{const s=STRATA.surface(p.x,p.y,p.z,.5);return s?'\nbed: '+s.kind+' ('+s.recipe+', hard '+(+s.hard).toFixed(2)+')':'';}catch(e){return'';}}
function describe(h0,hits){hits=hits.filter(h=>h.object.visible);if(!hits.length)return '(nothing)';const p=hits[0].point,o=hits[0].object;
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,isBole=!o.isInstancedMesh&&o.userData.biome;
 let name,tags=null;
 if(isItem){tags=SWHI.tagsOf(lab);name=lab+(best&&best.kind==='tree'?'  (on '+best.name+')':'');if(!tags&&best&&best.kind==='tree')tags=SWHI.tagsOf(best.name);}
 else if(isBole&&best&&best.kind==='tree'){name=best.name+'  ·  '+lab;tags=SWHI.tagsOf(best.name);}
 else{name=(best?best.name+'  ·  ':'')+lab+(o.userData.host?'\nstructure (host)':'');}
 return name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  ('+(ALT0+p.y).toFixed(0)+' m above the sea)  range '+camera.position.distanceTo(p).toFixed(0)+' m'+tagText(tags)+bedText(p,o);}
const HOST_VIEWS={};for(const k in VIEWS)HOST_VIEWS[k]=VIEWS[k].v;
const LCTL=['day','dawn','night'].map(m=>({button:m[0].toUpperCase()+m.slice(1),title:'',on:()=>lightMode(m),m}));
if(typeof LIGHT_HOOKS!=='undefined')LIGHT_HOOKS.push(m=>{for(const c of LCTL)if(c.el)c.el.classList.toggle('on',c.m===m);});
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={
 showcase:{tris:30000000,calls:420,rendered:12000000},
 cls:{pass:20000000,host:5000000},
 type:{'swhighlands/trees':'pass','swhighlands/floor':'pass','host':'host'},
};
function itemPositions(name,every){const out=[],m=new THREE.Matrix4();every=every||1;const c=name.indexOf(':'),lab=c<0?null:name.slice(c+1);if(c>=0)name=name.slice(0,c);
 BIO.baked.forEach(o=>{if(!o.isInstancedMesh||o.name!=='biome:'+name)return;for(let i=0;i<o.count;i+=every){if(lab!=null&&BIO.instLabel(o,i)!==lab)continue;o.getMatrixAt(i,m);out.push([m.elements[12],m.elements[13],m.elements[14]]);}});return out;}
// THE CHECKS, each a plain function of the data so a broken input can be fed to it (hostNegatives)
const HCHK={
 // every water course descends: its surface never climbs downstream
 descend(courses){const bad=courses.filter(C=>C.y.some((y,i)=>i&&y>C.y[i-1]+1e-6)).map(C=>C.name);
  return{ok:!bad.length,detail:bad.length?'climbs: '+bad.join(', '):courses.map(C=>C.name+' '+(C.y[0]-C.y[C.y.length-1]).toFixed(1)+' m over '+(C.LEN/1000).toFixed(2)+' km').join('; ')};},
 // the bald: one pillar cap at its middle, no lattice oak or bead cone within 60% of its radius
 bald(trees,B){const caps=trees.filter(T=>T.sp===SWHI.KEY.pillarcap&&Math.hypot(T.x-B.x,T.z-B.z)<B.r),inn=trees.filter(T=>T.sp!==SWHI.KEY.pillarcap&&Math.hypot(T.x-B.x,T.z-B.z)<B.r*.6);
  return{ok:caps.length===1&&!inn.length,detail:caps.length+' pillar cap(s) on the bald, '+inn.length+' other trees inside 60% of its radius'};},
 // the gorge: three falls, each with its natural bridge over it, every bridge's opening taller than its fall
 bridges(falls,bodies){const br=bodies.filter(B=>B.key==='rock.bridge'),miss=falls.filter(F=>!br.some(B=>B.fall===F&&B.opening.y1>F.top));
  return{ok:falls.length>=3&&br.length===falls.length&&!miss.length,detail:falls.length+' falls, '+br.length+' bridges'+(miss.length?', '+miss.length+' fall(s) without a bridge over them':'')};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('every water course descends',HCHK.descend(COURSES));
 add('the bald holds one pillar cap',HCHK.bald(SWHI.TREES,BALD));
 add('a natural bridge over each of the gorge\'s falls',HCHK.bridges(GORGE.falls,BODIES));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('a course whose surface climbs',HCHK.descend(COURSES.map((C,k)=>k?C:Object.assign({},C,{y:C.y.map((y,i)=>i===5?y+3:y)}))));
 add('a lattice oak planted on the bald',HCHK.bald(SWHI.TREES.concat([{sp:SWHI.KEY.latticeoak,x:BALD.x+5,z:BALD.z}]),BALD));
 add('a fall with no bridge',HCHK.bridges(GORGE.falls,BODIES.filter(B=>B.fall!==GORGE.falls[1])));
 return R;}
function biomeChecks(){const R={};
 /* this station's species (station 1: the ring folds) */
 R.missing=SWHI.SPECIES.filter((S,i)=>S.station==='folds'&&!SWHI.TREES.some(T=>T.sp===i)).map(S=>S.key);
 R.bySpecies=SWHI.SPECIES.filter(S=>S.station==='folds').map(S=>S.key+':'+SWHI.TREES.filter(T=>T.sp===SWHI.KEY[S.key]).length).join(' ');
 R.treesInWater=SWHI.TREES.filter(T=>BIO.depth(T.x,T.z)>.05).length;
 const FLOOR=['moss','club','turf','bheath','bcoral'];let wet=0,n=0;FLOOR.forEach(it=>itemPositions(it,7).forEach(p=>{n++;if(BIO.depth(p[0],p[2])>.35)wet++;}));R.floorInWater={wet,of:n};
 R.treesOnCliffs=SWHI.TREES.filter(T=>T.lv>0&&T.sp!==SWHI.KEY.pillarcap&&FC.at(FC.a.slope,T.x,T.z)>1.2).length;
 R.arch=BODIES.some(B=>B.id==='arch');R.cave=CAVE_MESHES.length;R.bridges=BODIES.filter(B=>B.key==='rock.bridge').length;R.falls=GORGE_FALLS.length;
 R.fruit={parasols:itemPositions('parasol').length,eggs:itemPositions('eggs').length,bulbs:itemPositions('pbulb').length};
 R.bald={heath:itemPositions('bheath').filter(p=>Math.hypot(p[0]-BALD.x,p[2]-BALD.z)<BALD.r).length,coral:itemPositions('bcoral').filter(p=>Math.hypot(p[0]-BALD.x,p[2]-BALD.z)<BALD.r).length};
 R.farmWalls=FARM_WALLS?FARM_WALLS.lenM:0;
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89s-host-sky.js) */
KHOST.take({build:'swhighlands',title:'Krator SW Highlands: the ring folds',
 hint:'The SW highlands, station 1: the ring folds. Native fungoid life on long even ridges: lattice oaks and bead cones in the cove, one pillar cap on its bald, an arch in a wind gap, a water gap, the river cave under a chevron fold, a gorge falling through natural bridges, the Iron Republic\'s last farm. N for night',
 scene,camera,renderer,ground:terrainH,clear:1.6,minR:2,maxR:9000,registry:REG,views:HOST_VIEWS,ticks:TICKS,
 onView:k=>lightMode(VIEWS[k].mode),controls:LCTL,
 keys:{n:()=>lightMode((typeof LIGHT_MODE!=='undefined'&&LIGHT_MODE==='night')?'day':'night')},
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'rock and structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 minimap:{title:'The ring folds'},
 budget:BUDGET,types:()=>BIO.stats,
 probeSample:4000,
 api:{hostChecks,hostNegatives,
  regOccupancy(){const n=new Array(REG.length).fill(0);const P=KHOST.probe.probePoints();
   REG.forEach((r,i)=>{if(r.kind==='tree'){n[i]=1;return;}for(const p of P){const dx=p[0]-r.x,dz=p[2]-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=(r.y||0)-2&&p[1]<=(r.y||0)+r.h+5)n[i]++;}});
   return REG.map((r,i)=>({name:r.name,type:r.kind,n:n[i]}));},
  get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biomeChecks,itemPositions,
  biome:()=>window._biome}});
