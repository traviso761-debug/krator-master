// ================================================================= HOST — the kit's views, inspector words and checks (station 4, the pillar rim)
const lightMode=m=>{if(typeof setLightMode==='function')setLightMode(m);};
const VIEWS={};
(function(){const G=(x,z)=>groundH(x,z);
 const add=(k,v,mode)=>{if(v&&v.every(isFinite))VIEWS[k]={v,mode:mode||'day'};};
 // the overview: from the table's edge west of the watch pillar, over the towers to the floor and Pan Riba
 {const x=-700,z=rimZ(x)-70;add('Overview from the rim',[x,tableTop(x,z)+30,z,150,110,rimZ(150)+380]);}
 // among the towers (refs/01): on the floor at the cliff's foot, looking along it between the towers and up
 {const x=WATCH?WATCH.x-330:-100,z=rimZ(x)+70;add('Among the pillars',[x,G(x,z)+1.8,z,x+420,G(x,z)+150,z+90]);}
 if(WATCH){const a=-2.3,cx=WATCH.x+Math.cos(a)*170,cz=WATCH.z-Math.sin(a)*170;add('The watch pillar',[cx,G(cx,cz)+3,cz,WATCH.x,WATCH.top-30,WATCH.z]);}
 // a tower's top: the one carrying the most anemone trees, from just over its edge
 {const tops=new Map();SWHI.TREES.forEach(T=>{const t=towerTop(T.x,T.z,0);if(t)tops.set(t.B,(tops.get(t.B)||0)+1);});let best=null,n=0;tops.forEach((v,B)=>{if(v>n&&B!==WATCH){n=v;best=B;}});
  if(best){const r=Math.max(best.beds[0].rx,best.beds[0].rz)+18;add("Anemone trees on a pillar's top",[best.x-r,best.top+12,best.z+r*.3,best.x,best.top+4,best.z]);}}
 // the arches: the largest free one from the floor, through its opening; a pierced fin from beside it
 {const A=ARCHES.filter(B=>/floor/.test(B.id)).sort((a,b)=>b.top-a.top)[0];if(A){const ry=A.opening?A.opening.ry:0,d=A.top-A.y0+40,cx=A.x+Math.cos(ry+Math.PI/2)*d,cz=A.z+Math.sin(ry+Math.PI/2)*d;add('A free-standing arch',[cx,G(cx,cz)+2,cz,A.x,A.y0+(A.top-A.y0)*.45,A.z]);}}
 {const A=ARCHES.find(B=>/pillar/.test(B.id));if(A){const d=(A.top-A.y0)*.9+40,cx=A.x+d*.7,cz=A.z+d*.7;add('A pierced fin',[cx,G(cx,cz)+4,cz,A.x,A.y0+(A.top-A.y0)*.35,A.z]);}}
 // the cliff: its caprock over the banded, gullied apron (Paria's kind)
 {let best=null;for(let k=0;k<24;k++){const x=-1400+k*120,z=rimZ(x)+APRON*1.6,near=PILLARS.filter(B=>Math.abs(B.x-x)<170&&B.z<z).length;if(!best||near<best.n)best={x,z,n:near};}
  if(best)add('The cliff and its apron',[best.x,G(best.x,best.z)+30,best.z,best.x+60,TOP-CAP*1.4,rimZ(best.x+60)]);}   /* where the fewest towers stand between */
 // SPAN'S CANYON: from its rim over the Deep Reach, and from the bay up to the reservoir
 {const P=(u,v)=>[CANYON.M[0]+(u-CANYON.u0)*CANYON.n[0]+v*CANYON.t[0],CANYON.M[1]+(u-CANYON.u0)*CANYON.n[1]+v*CANYON.t[1]];
  const a=P(500,240),b=P(-200,0);add("Span's canyon",[a[0],tableTop(a[0],a[1])+60,a[1],b[0],tableTop(b[0],b[1])-150,b[1]]);
  const c=P(-400,-260),d=P(-1600,0);add('The reservoir',[c[0],tableTop(c[0],c[1])+80,c[1],d[0],RESERVOIR.level,d[1]]);}
 // the dried riverbed: from over the canyon's mouth, down it across the floor
 {const P=WADI.pts,a=P[Math.floor(P.length*.08)],b=P[Math.floor(P.length*.6)];add('The dried riverbed',[a.x-60,a.y+70,a.z-40,b.x,b.y,b.z]);}
 // Pan Riba: over its meanders on the floor, looking west along it
 {const p=PAN.pts[Math.floor(PAN.pts.length*.6)],q=PAN.pts[Math.floor(PAN.pts.length*.35)];add('Pan Riba on the floor',[p[0],waterH(p[0],p[1])+28,p[1]+40,q[0],waterH(q[0],q[1])+5,q[1]]);}
 // the floor's flora: cushions and torch spikes in the green between the towers
 {const x=WATCH?WATCH.x+160:200,z=rimZ(x)+BAND*.8;add('The green floor',[x,G(x,z)+2.2,z,x+40,G(x+40,z-30)+1,z-30]);}
 {const x=200,z=rimZ(x)+BAND*1.3;add('Dawn: mist round the towers',[x,G(x,z)+8,z,x-200,190,rimZ(x-200)+120],'dawn');}
 if(typeof SPAN_PREVIEW!=='undefined'&&SPAN_PREVIEW)add('Span on the watch pillar (frozen preview)',SPAN_PREVIEW.view);   /* the preview build only */
 if(typeof SPAN_MASS!=='undefined'&&SPAN_MASS)add('Span massing in its canyon (frozen preview)',SPAN_MASS.view);
 {const x=WATCH?WATCH.x-120:0,z=WATCH?WATCH.z+110:0;add('Night: the pillar rim',[x,G(x,z)+3,z,WATCH?WATCH.x:0,WATCH?WATCH.top-60:150,WATCH?WATCH.z:0],'night');}})();
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
 // the watch pillar's top is flat over a 40 m square (the record; its drawn top is held by KSTACKS.contour's keep) and bare
 watch(B,trees,size){if(!B)return{ok:false,detail:'no watch pillar'};let bad=0,n=0;const h=size/2;for(let i=-4;i<=4;i++)for(let j=-4;j<=4;j++){const x=B.x+i/4*h,z=B.z+j/4*h,s=KSTACKS.at([B],x,z);n++;if(!s||Math.abs(s.top-B.top)>.5)bad++;}
  const on=trees.filter(T=>Math.hypot(T.x-B.x,T.z-B.z)<h).length;return{ok:!bad&&!on,detail:n-bad+'/'+n+' points of a '+size+' m square at '+(ALT0+B.top).toFixed(0)+' m; '+on+' trees on it'};},
 // every tree standing high stands on a tower's top (none in the air beside one, none on a wall)
 tops(trees){const high=trees.filter(T=>T.y0>groundH(T.x,T.z)+20),off=high.filter(T=>!towerTop(T.x,T.z,0));return{ok:high.length>20&&!off.length,detail:high.length+' trees on the tops of the towers, '+off.length+' off a top'};},
 // the arches stand: at least three, each with its opening clear (the ground under the lintel's middle lower than the lintel)
 arches(list){const ok=list.filter(B=>{const o=B.opening;return !!o&&o.y1>o.y0+4;});return{ok:list.length>=3&&ok.length===list.length,detail:list.length+' arches and bridges, '+ok.length+' with an opening'};},
 // the trees on the towers stand on the rock AS DRAWN: a ray down at each one meets the drawn rock within a metre of its foot
 drawn(trees){const ray=new THREE.Raycaster(),rock=[];scene.traverse(o=>{if(o.userData&&o.userData.rock)rock.push(o);});const on=trees.filter(T=>T.y0>groundH(T.x,T.z)+20);let off=0;
  on.forEach(T=>{ray.set(new THREE.Vector3(T.x,T.y0+40,T.z),new THREE.Vector3(0,-1,0));const h=ray.intersectObjects(rock)[0];if(!h||Math.abs(h.point.y-(T.y0+.2))>1)off++;});
  return{ok:on.length>20&&!off,detail:on.length+' trees on the towers, '+off+' more than a metre off the drawn rock'};},
 // the band stands: enough towers, most whole, none over the table's top
 towers(list){const whole=list.filter(B=>B.top-B.y0>TOP*.8),over=list.filter(B=>B.top>tableTop(B.x,B.z)+5);return{ok:list.length>=25&&whole.length>=15&&!over.length,detail:list.length+' towers, '+whole.length+' whole, '+over.length+' standing over the table (a tower is what is left of it)'};}};
function hostChecks(){return[Object.assign({name:'the watch pillar: its top flat and held'},HCHK.watch(WATCH,SWHI.TREES,40)),Object.assign({name:'the trees of the towers stand on their tops'},HCHK.tops(SWHI.TREES)),
 Object.assign({name:'the pillar rim stands'},HCHK.towers(PILLARS.filter(B=>!B.isArch))),Object.assign({name:'the arches and bridges stand'},HCHK.arches(ARCHES)),Object.assign({name:'the trees of the towers on the drawn rock'},HCHK.drawn(SWHI.TREES))];}
function hostNegatives(){const r=(name,c)=>({name,failed:!c.ok,detail:c.detail});const small=PILLARS.filter(B=>B!==WATCH).sort((a,b)=>a.R-b.R)[0];
 return[r('a narrow tower for the watch',HCHK.watch(small,[],40)),
  r('a tree in the air by a tower',HCHK.tops(SWHI.TREES.concat([{x:WATCH?WATCH.x+Math.max(WATCH.beds[0].rx,WATCH.beds[0].rz)+6:0,z:WATCH?WATCH.z:0,y0:(WATCH?WATCH.top:200)-10,H:6}]))),
  r('no towers',HCHK.towers([])),r('an arch with its opening filled',HCHK.arches(ARCHES.map(B=>Object.assign({},B,{opening:null})))),r('a tree raised off its tower',HCHK.drawn(SWHI.TREES.map((T,i)=>i?T:Object.assign({},T)).concat(SWHI.TREES.filter(T=>towerTop(T.x,T.z,0)).slice(0,1).map(T=>Object.assign({},T,{y0:T.y0+4})))))];}
function biomeChecks(){const R={},sp=SWHI.SPECIES.filter(S=>S.station==='pillars');
 R.missing=sp.filter(S=>!SWHI.TREES.some(T=>T.sp===SWHI.KEY[S.key])).map(S=>S.key);R.bySpecies=sp.map(S=>S.key+':'+SWHI.TREES.filter(T=>T.sp===SWHI.KEY[S.key]).length).join(' ');
 R.treesOnCliffs=SWHI.TREES.filter(T=>T.lv>0&&!towerTop(T.x,T.z,0)&&FC.at(FC.a.slope,T.x,T.z)>1.2).length;R.towers=PILLARS.length;R.pillarTris=window._pillarTris;
 R.floor={cushion:itemPositions('cushion').length,torch:itemPositions('torch').length,beadcoral:itemPositions('beadcoral').length,turf:itemPositions('turf').length};return R;}
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');
KHOST.take({build:'swhighlands-pillars',title:'Krator SW Highlands: the pillar rim',
 hint:'The SW highlands, station 4: the pillar rim, where the tableland of Span breaks down into red and white towers in mist (2.3-2.6 km). Anemone trees on the tops of the towers and the fallen blocks, cushion sponges, torch spikes and bead coral on the green floor, Pan Riba meandering across it; the top of the watch pillar held for a post. N for night',
 scene,camera,renderer,ground:groundH,clear:1.6,minR:2,maxR:9000,registry:REG,views:HOST_VIEWS,ticks:TICKS,onView:k=>lightMode(VIEWS[k].mode),controls:LCTL,
 keys:{n:()=>lightMode((typeof LIGHT_MODE!=='undefined'&&LIGHT_MODE==='night')?'day':'night')},clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'rings':{objects:()=>[giantRing]}},exporters:{biome:()=>BIO.export(),site:()=>SWHI_PILLARS_SITE},minimap:{title:'The pillar rim'},
 budget:BUDGET,types:()=>BIO.stats,probeSample:4000,
 api:{hostChecks,hostNegatives,
  regOccupancy(){const n=new Array(REG.length).fill(0);const P=KHOST.probe.probePoints();REG.forEach((r,i)=>{if(r.kind==='tree'){n[i]=1;return;}for(const p of P){const dx=p[0]-r.x,dz=p[2]-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=(r.y||0)-2&&p[1]<=(r.y||0)+r.h+5)n[i]++;}});return REG.map((r,i)=>({name:r.name,type:r.kind,n:n[i]}));},
  get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biomeChecks,itemPositions,biome:()=>window._biome,site:()=>SWHI_PILLARS_SITE}});
