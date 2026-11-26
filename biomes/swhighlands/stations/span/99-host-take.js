// ================================================================= HOST — the kit's views, inspector words and checks (station 3, Span's tableland)
// On the pillar rim's ground (stations/pillars): the inspector's words and the probe's API as station 4's; the views and the checks are
// the tableland's (the slickrock, its slots and domes, the hanging swamps, Span's canyon and reservoir, the twin falls).
const lightMode=m=>{if(typeof setLightMode==='function')setLightMode(m);};
const VIEWS={};
(function(){const G=(x,z)=>groundH(x,z);
 const add=(k,v,mode)=>{if(v&&v.every(isFinite))VIEWS[k]={v,mode:mode||'day'};};
 const P=(u,v)=>[CANYON.M[0]+(u-CANYON.u0)*CANYON.n[0]+v*CANYON.t[0],CANYON.M[1]+(u-CANYON.u0)*CANYON.n[1]+v*CANYON.t[1]];
 const IX=KSPACE.create({cell:30});SWHI.TREES.forEach(T=>IX.insert(T,T.x,T.z,0));const _o=[];const around=(x,z,r)=>IX.query(x,z,r,_o).filter(T=>Math.hypot(T.x-x,T.z-z)<r);
 // the overview: from over the table north of the rim, across the slots and domes to the canyon's rim
 {const x=-200,z=rimZ(x)-900;add('Overview of the tableland',[x,tableTop(x,z)+70,z,-900,tableTop(-900,rimZ(-900)-300),rimZ(-900)-300]);}
 // Span's canyon: from its northern rim along the reach (the arcology's ground: settlements/span draws it)
 {const a=P(700,230),b=P(0,-20);add('Span canyon (the arcology ground)',[a[0],tableTop(a[0],a[1])+25,a[1],b[0],tableTop(b[0],b[1])-140,b[1]]);
  const c=P(-500,-250),d=P(-1650,0);add('The reservoir above the canyon',[c[0],tableTop(c[0],c[1])+40,c[1],d[0],RESERVOIR.level,d[1]]);}
 // a hanging swamp: its seep pool with the most cell lamps round it, from beside it at eye height
 {const L=itemPositions('celllamp');let best=null,bn=0;SEEP_POOLS.forEach(Q=>{const n=L.filter(p=>Math.hypot(p[0]-Q.x,p[2]-Q.z)<Q.r+1.5).length;if(n>bn){bn=n;best=Q;}});
  if(best){let v=null;for(let k=0;k<16&&!v;k++){const a=k/16*TAU,cx=best.x+Math.cos(a)*(best.r+7),cz=best.z+Math.sin(a)*(best.r+7);if(slopeAt(cx,cz)<.5&&G(cx,cz)<best.level+4)v=[cx,G(cx,cz)+1.7,cz,best.x,best.level+.4,best.z];}
   add('A hanging swamp and its seep pool',v||[best.x+best.r+6,best.level+2,best.z,best.x,best.level+.4,best.z]);add('Cell lamps in a seep pool',[best.x+best.r*.9+1.2,best.level+1.1,best.z+.6,best.x,best.level,best.z]);}}
 // the domes: an anemone tree on a beehive dome, with the most open view
 {const C=SWHI.TREES.filter(T=>T.sp===SWHI.KEY.anemonetree&&T.lv===2&&FIELD.dome(T.x,T.z)>.3);let best=null;
  C.slice(0,500).forEach(T=>{const n=around(T.x,T.z,20).length;if(best&&n>=best.n)return;for(let q=0;q<12;q++){const a=q/12*TAU,cx=T.x+Math.cos(a)*16,cz=T.z+Math.sin(a)*16;if(slopeAt(cx,cz)>.5)continue;best={T,n,cx,cz};break;}});
  if(best)add('Anemone trees on the beehive domes',[best.cx,G(best.cx,best.cz)+3,best.cz,best.T.x,best.T.y0+best.T.H*.5,best.T.z]);}
 // a slot canyon: the deepest open joint on the table, from its floor looking along it
 {let best=null;for(let i=0;i<TL.N;i+=2)for(let j=0;j<TL.N;j+=2){const k=j*TL.N+i,c=TL.a.cut[k];if(c<25||c>110)continue;const x=TERR.X0+i/(TL.N-1)*(TERR.X1-TERR.X0),z=TERR.Z0+j/(TL.N-1)*(TERR.Z1-TERR.Z0);
   if(zone(x,z)>.27||Math.abs(canyonUV(x,z)[1])<300||slopeAt(x,z)>.45)continue;if(!best||c>best.c)best={x,z,c};}
  if(best){const a=JOINTS.angle,dx=Math.cos(a),dz=Math.sin(a),dir=G(best.x+dx*12,best.z+dz*12)<G(best.x-dx*12,best.z-dz*12)+2?1:-1,tx=best.x+dir*dx*40,tz=best.z+dir*dz*40;
   add('A slot canyon',[best.x,G(best.x,best.z)+1.7,best.z,tx,G(tx,tz)+5,tz]);}}
 // the twin falls: from the floor below the rim, up at the two threads over the caprock
 {const A=TWIN[0].falls[0],B=TWIN[1].falls[0];if(A&&B){let fx=(TWIN[0].pts[TWIN[0].pts.length-1][0]+TWIN[1].pts[TWIN[1].pts.length-1][0])/2;const lx=(TWIN[0].pts[0][0]+TWIN[1].pts[0][0])/2;
  /* from out on the floor, the first place whose sight line to the falls passes no tower */
  const rimAt=C=>C.pts.find(p=>zone(p[0],p[1])>=.3)||C.pts[C.pts.length-1],ra=rimAt(TWIN[0]),rb=rimAt(TWIN[1]);fx=(ra[0]+rb[0])/2;   /* where the streams go over */
  const tz=(ra[1]+rb[1])/2,ty=groundH(fx,tz)-45;let cam=null;for(const dz of [450,600,750,900])for(const dx of [0,-120,120,-240,240]){if(cam)break;const x=fx+dx,z=tz+dz,y=G(x,z)+25;let clear=true;
   for(let s=.08;s<.92&&clear;s+=.04){const px=x+(fx-x)*s,pz=z+(tz-z)*s,py=y+(ty-y)*s,t=towerTop(px,pz,0);if(nearTower(px,pz,3)&&(!t||t.top>py-2))clear=false;}if(clear)cam=[x,y,z];}
  if(!cam)cam=[fx,G(fx,tz+600)+60,tz+600];add('The twin falls over the rim',[cam[0],cam[1],cam[2],fx,ty,tz]);
  const t=TWIN[0].pts[Math.floor(TWIN[0].pts.length*.4)];add('The twin falls streams on the slickrock',[t[0]+30,G(t[0]+30,t[1]-30)+4,t[1]-30,t[0],G(t[0],t[1]),t[1]+40]);}}
 {const C=(STATION_KIN.cedar||[]).filter(T=>T.lv===2),T=C[Math.floor(C.length/2)];if(T){const x=T.x+T.crownR*2.2,z=T.z+T.crownR*.8;add('A tier cedar on the slickrock',[x,G(x,z)+3,z,T.x,T.y0+T.H*.5,T.z]);}}
 {const C=(STATION_KIN.madrone||[]).filter(T=>T.lv===2),T=C[Math.floor(C.length/2)];if(T){const x=T.x+T.crownR*2,z=T.z-T.crownR;add('A flayed madrone on the sunny side',[x,G(x,z)+2.5,z,T.x,T.y0+T.H*.4,T.z]);}}
 {const x=-300,z=rimZ(x)-500;add('Torch spikes on the slickrock',[x,G(x,z)+2.2,z,x+40,G(x+40,z+25)+.6,z+25]);}
 {const x=-600,z=rimZ(x)-150;add('Dawn over the tableland',[x,tableTop(x,z)+20,z,x+900,tableTop(x+900,z-400),z-400],'dawn');}
 {const Q=SEEP_POOLS[0];if(Q)add('The cell lamps at night',[Q.x+Q.r+5,Q.level+1.8,Q.z,Q.x,Q.level,Q.z],'night');}})();
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
 // the twin falls: each starts on the table, ends on the floor below the rim, never climbs, and falls over the caprock
 twin(T){const bad=T.filter(C=>{const a=C.pts[0],b=C.pts[C.pts.length-1],up=C.y.some((y,i)=>i&&y>C.y[i-1]+1e-6),drop=Math.max(0,...C.falls.map(F=>F.drop||0));
   return !(zone(a[0],a[1])<.3&&zone(b[0],b[1])>.32&&!up&&C.falls.length>=1&&drop>40);});
  return{ok:T.length===2&&!bad.length,detail:T.map(C=>C.name+': '+(C.y[0]-C.y[C.y.length-1]).toFixed(0)+' m over '+C.LEN.toFixed(0)+' m, '+C.falls.length+' fall(s)').join('; ')+(bad.length?'; '+bad.length+' bad':'')};},
 // the hanging swamps are cut into the table: every seep pool on a ledge or a slot's floor 18 m and more under the slickrock
 swamps(P){const shallow=P.filter(Q=>tableTop(Q.x,Q.z)-Q.level<18);return{ok:P.length>=5&&!shallow.length,detail:P.length+' seep pools, '+shallow.length+' on the open top; the shallowest '+(P.length?Math.min(...P.map(Q=>tableTop(Q.x,Q.z)-Q.level)).toFixed(0):'?')+' m into the table'};},
 // the cell lamps are in the pools
 lamps(L){const out=L.filter(p=>!seepPoolAt(p[0],p[2]));return{ok:L.length>=15&&out.length<=L.length*.05,detail:L.length+' cell lamps, '+out.length+' out of a seep pool'};}};
function hostChecks(){return[Object.assign({name:'the twin falls leave the tableland'},HCHK.twin(TWIN)),Object.assign({name:'the hanging swamps are cut into the table'},HCHK.swamps(SEEP_POOLS)),
 Object.assign({name:'the cell lamps stand in the seep pools'},HCHK.lamps(itemPositions('celllamp')))];}
function hostNegatives(){const r=(name,c)=>({name,failed:!c.ok,detail:c.detail});
 return[r('a stream that climbs',HCHK.twin(TWIN.map((C,k)=>k?C:Object.assign({},C,{y:C.y.map((y,i)=>i===3?y+4:y)})))),
  r('a seep pool on the open slickrock',HCHK.swamps(SEEP_POOLS.concat([{x:-300,z:rimZ(-300)-500,r:3,level:tableTop(-300,rimZ(-300)-500)-1}]))),
  r('cell lamps on dry rock',HCHK.lamps(itemPositions('celllamp').map(p=>[p[0]+40,p[1],p[2]+40])))];}
function biomeChecks(){const R={},sp=['anemonetree'];
 R.missing=sp.filter(k=>!SWHI.TREES.some(T=>T.sp===SWHI.KEY[k])).concat(['madrone'].filter(k=>!(STATION_KIN[k]||[]).length));
 R.bySpecies=sp.map(k=>k+':'+SWHI.TREES.filter(T=>T.sp===SWHI.KEY[k]).length).concat(['cedar','madrone'].map(k=>k+':'+(STATION_KIN[k]||[]).length)).join(' ');
 R.treesOnCliffs=SWHI.TREES.filter(T=>T.lv>0&&!towerTop(T.x,T.z,0)&&FC.at(FC.a.slope,T.x,T.z)>1.2).length;R.towers=PILLARS.length;
 R.floor={lamp:itemPositions('celllamp').length,reed:itemPositions('wingreed').length,trumpets:itemPositions('trumpets').length,torch:itemPositions('torch').length,beadcoral:itemPositions('beadcoral').length,cushion:itemPositions('cushion').length};
 R.pools=SEEP_POOLS.length;R.falls=TWIN.reduce((s,C)=>s+C.falls.length,0);return R;}
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');
KHOST.take({build:'swhighlands-span',title:'Krator SW Highlands: Span\'s tableland',
 hint:'The SW highlands, station 3: Span\'s tableland (2.3-2.6 km). Slot canyons in the pillar sandstone, beehive domes with anemone trees, hanging swamps on the seepage ledges (cell lamps in the seep pools, wing reeds, bulb trumpets), torch spikes on the slickrock, the twin falls over the rim, Span\'s canyon and its reservoir (the arcology is settlements/span\'s). N for night',
 scene,camera,renderer,ground:groundH,clear:1.6,minR:2,maxR:9000,registry:REG,views:HOST_VIEWS,ticks:TICKS,onView:k=>lightMode(VIEWS[k].mode),controls:LCTL,
 keys:{n:()=>lightMode((typeof LIGHT_MODE!=='undefined'&&LIGHT_MODE==='night')?'day':'night')},clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'rings':{objects:()=>[giantRing]}},exporters:{biome:()=>BIO.export(),site:()=>SWHI_PILLARS_SITE},minimap:{title:'Span\'s tableland'},
 budget:BUDGET,types:()=>BIO.stats,probeSample:4000,
 api:{hostChecks,hostNegatives,
  regOccupancy(){const n=new Array(REG.length).fill(0);const P=KHOST.probe.probePoints();REG.forEach((r,i)=>{if(r.kind==='tree'){n[i]=1;return;}for(const p of P){const dx=p[0]-r.x,dz=p[2]-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=(r.y||0)-2&&p[1]<=(r.y||0)+r.h+5)n[i]++;}});return REG.map((r,i)=>({name:r.name,type:r.kind,n:n[i]}));},
  get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biomeChecks,itemPositions,biome:()=>window._biome,site:()=>SWHI_PILLARS_SITE}});
