// ================================================================= HOST — the kit's views, inspector words and checks (station 6, the treeline)
const lightMode=m=>{if(typeof setLightMode==='function')setLightMode(m);};
const VIEWS={};
(function(){const G=(x,z)=>terrainH(x,z),TL=SWHI.TREELINE.treeAlt;
 const add=(k,v,mode)=>{if(v&&v.every(isFinite))VIEWS[k]={v,mode:mode||'day'};};
 const IX=KSPACE.create({cell:30});SWHI.TREES.forEach(T=>IX.insert(T,T.x,T.z,0));const _o=[];const around=(x,z,r)=>IX.query(x,z,r,_o).filter(T=>Math.hypot(T.x-x,T.z-z)<r);
 const specimen=(key,dist,h,lookK,filter)=>{const C=SWHI.TREES.filter(T=>T.sp===SWHI.KEY[key]&&T.lv===2&&(!filter||filter(T)));let best=null;
  C.slice(0,500).forEach(T=>{const crowd=around(T.x,T.z,dist+6).length;if(best&&crowd>=best.crowd)return;for(let q=0;q<16;q++){const a=q/16*Math.PI*2,cx=T.x+Math.cos(a)*dist,cz=T.z+Math.sin(a)*dist;if(BIO.mask(cx,cz)<.1)continue;if(around((cx+T.x)/2,(cz+T.z)/2,dist*.4).some(O=>O!==T&&O.H>4))continue;best={T,crowd,cx,cz};break;}});
  if(!best)return null;const T=best.T;return[best.cx,G(best.cx,best.cz)+h,best.cz,T.x,T.y0+T.H*(lookK||.5),T.z];};
 add('Overview up the ramp',[-1900,G(-1900,-200)+90,-200,1500,G(1500,100)+40,100]);
 add('A whorl column',specimen('whorlcolumn',26,3,.55,T=>T.H>14));
 add('Bottle brushes on a sunny spur',specimen('bottlebrush',18,2.5,.55));
 // the treeline: from just above it looking down over the last krummholz into the woods
 /* the treeline: the highest snow-free whorl column found */
 {const T=SWHI.TREES.filter(T=>T.sp===SWHI.KEY.whorlcolumn&&T.lv===2&&FC.at(FC.a.snow,T.x,T.z)<.15&&FC.at(FC.a.snow,T.x+80,T.z)<.4).sort((a,b)=>b.y0-a.y0)[0];if(T){const cx=T.x+110,cz=T.z+10;add('The treeline',[cx,G(cx,cz)+18,cz,T.x-420,G(T.x-420,T.z)+5,T.z]);   /* from above the line, down the ramp over the last krummholz into the woods */}}
 {const g=SWHI.TREELINE.glass;if(g.length){const T=g[Math.floor(g.length/2)];add('Glass towers on the scree',[T.x-7,G(T.x-7,T.z+3)+1.8,T.z+3,T.x,T.y0+T.H*.6,T.z]);}}
 add('The cirque',[CIRQUE.x-520,CIRQUE.floor+60,CIRQUE.z+60,CIRQUE.x+300,CIRQUE.floor+180,CIRQUE.z]);
 add('Dawn over the woods',[600,G(600,-1100)+25,-1100,-1500,G(-1500,-300)+20,-300],'dawn');
 add('Night: the treeline',[1300,G(1300,200)+6,200,700,G(700,200)+10,200],'night');})();
function tagText(t){if(!t)return'';const g=t.tags,h=g.harvest||{};return '\n'+t.cls+'  ·  '+g.climate+' / '+g.aridity+' / '+(g.abyssal?'abyssal':'non-abyssal')+'\nharvest: wood '+h.wood+(h.edible&&h.edible.length?' · edible: '+h.edible.join(', '):' · not edible')+(h.notes?'\n'+h.notes:'');}
function describe(h0,hits){hits=hits.filter(h=>h.object.visible);if(!hits.length)return '(nothing)';const p=hits[0].point,o=hits[0].object;
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;let name,tags=null;
 if(isItem){tags=SWHI.tagsOf(lab);name=lab+(best&&best.kind==='tree'?'  (on '+best.name+')':'');if(!tags&&best&&best.kind==='tree')tags=SWHI.tagsOf(best.name);}
 else{name=(best?best.name+'  ·  ':'')+lab;if(best&&best.kind==='tree')tags=SWHI.tagsOf(best.name);}
 let bed='';if(o===GROUND){try{const s=STRATA.surface(p.x,p.y,p.z,.5);if(s)bed='\nbed: '+s.kind+' ('+s.recipe+')';}catch(e){}}
 return name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  ('+(ALT0+p.y).toFixed(0)+' m above the sea)  range '+camera.position.distanceTo(p).toFixed(0)+' m'+tagText(tags)+bed;}
const HOST_VIEWS={};for(const k in VIEWS)HOST_VIEWS[k]=VIEWS[k].v;
const LCTL=['day','dawn','night'].map(m=>({button:m[0].toUpperCase()+m.slice(1),title:'',on:()=>lightMode(m),m}));
if(typeof LIGHT_HOOKS!=='undefined')LIGHT_HOOKS.push(m=>{for(const c of LCTL)if(c.el)c.el.classList.toggle('on',c.m===m);});
const BUDGET={showcase:{tris:30000000,calls:420,rendered:12000000},cls:{pass:20000000,host:5000000},type:{'swhighlands/trees':'pass','host':'host'}};
function itemPositions(name,every){const out=[],m=new THREE.Matrix4();every=every||1;BIO.baked.forEach(o=>{if(!o.isInstancedMesh||o.name!=='biome:'+name)return;for(let i=0;i<o.count;i+=every){o.getMatrixAt(i,m);out.push([m.elements[12],m.elements[13],m.elements[14]]);}});return out;}
// THE CHECKS, each a plain function of the data, with a broken input that must fail
const HCHK={
 // the treeline holds: no whorl column's foot more than 80 m over it, and the last 150 m are krummholz (none over 12 m there)
 treeline(trees){const W=trees.filter(T=>T.sp===SWHI.KEY.whorlcolumn),tl=SWHI.TREELINE.treeAlt,over=W.filter(T=>ALT0+T.y0>tl+80),tall=W.filter(T=>ALT0+T.y0>tl-20&&T.H>12);
  return{ok:W.length>50&&!over.length&&!tall.length,detail:W.length+' whorl columns, the highest foot '+Math.round(ALT0+Math.max(...W.map(T=>T.y0)))+' m; '+over.length+' over the line, '+tall.length+' tall ones in its last band'};},
 // the bottle brushes keep to the sunny side
 sunny(trees){const Bt=trees.filter(T=>T.sp===SWHI.KEY.bottlebrush),m=Bt.reduce((s,T)=>s+BIO.field('north',T.x,T.z),0)/Math.max(1,Bt.length);
  return{ok:Bt.length>20&&m>.05,detail:Bt.length+' bottle brushes, their mean aspect '+m.toFixed(2)+' (+1 a north-facing, sunny slope)'};},
 // the glass towers stand above the treeline, on the fellfield
 glass(g){const low=g.filter(T=>ALT0+T.y0<SWHI.TREELINE.treeAlt);return{ok:g.length>10&&!low.length,detail:g.length+' glass towers, '+low.length+' below the treeline'};}};
function hostChecks(){return[Object.assign({name:'the treeline holds'},HCHK.treeline(SWHI.TREES)),Object.assign({name:'bottle brushes on the sunny spurs'},HCHK.sunny(SWHI.TREES)),
 Object.assign({name:'glass towers above the treeline'},HCHK.glass(SWHI.TREELINE.glass))];}
function hostNegatives(){const r=(name,c)=>({name,failed:!c.ok,detail:c.detail});
 return[r('a whorl column high on the fellfield',HCHK.treeline(SWHI.TREES.concat([{sp:SWHI.KEY.whorlcolumn,x:0,z:0,y0:SWHI.TREELINE.treeAlt-ALT0+200,H:8}]))),
  r('the bottle brushes on the shaded side',HCHK.sunny(SWHI.TREES.filter(T=>T.sp!==SWHI.KEY.bottlebrush||BIO.field('north',T.x,T.z)<-.2))),
  r('a glass tower in the woods',HCHK.glass(SWHI.TREELINE.glass.concat([{y0:0,H:2}])))];}
function biomeChecks(){const R={},sp=SWHI.SPECIES.filter(S=>S.station==='treeline');
 R.missing=sp.filter(S=>!SWHI.TREES.some(T=>T.sp===SWHI.KEY[S.key])).map(S=>S.key);R.bySpecies=sp.map(S=>S.key+':'+SWHI.TREES.filter(T=>T.sp===SWHI.KEY[S.key]).length).join(' ');
 R.treesOnCliffs=SWHI.TREES.filter(T=>T.lv>0&&FC.at(FC.a.slope,T.x,T.z)>1.2).length;R.treesOnSnow=SWHI.TREES.filter(T=>FC.at(FC.a.snow,T.x,T.z)>.6).length;
 R.floor={glassleaf:itemPositions('glassleaf').length,stones:itemPositions('stone').length,whorls:itemPositions('whorl').length,brush:itemPositions('brush').length};R.glassTowers=SWHI.TREELINE.glass.length;return R;}
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');
KHOST.take({build:'swhighlands-treeline',title:'Krator SW Highlands: the treeline',
 hint:'The SW highlands, station 6: the treeline under the crest (3.4-4.7 km). Bottle brushes on the sunny spurs, whorl columns in the shade up to the treeline, glass leaf, the fellfield and its glass towers, a cirque with snow. N for night',
 scene,camera,renderer,ground:terrainH,clear:1.6,minR:2,maxR:9000,registry:REG,views:HOST_VIEWS,ticks:TICKS,onView:k=>lightMode(VIEWS[k].mode),controls:LCTL,
 keys:{n:()=>lightMode((typeof LIGHT_MODE!=='undefined'&&LIGHT_MODE==='night')?'day':'night')},clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'rings':{objects:()=>[giantRing]}},exporters:{biome:()=>BIO.export()},minimap:{title:'The treeline'},
 budget:BUDGET,types:()=>BIO.stats,probeSample:4000,
 api:{hostChecks,hostNegatives,
  regOccupancy(){const n=new Array(REG.length).fill(0);const P=KHOST.probe.probePoints();REG.forEach((r,i)=>{if(r.kind==='tree'){n[i]=1;return;}for(const p of P){const dx=p[0]-r.x,dz=p[2]-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=(r.y||0)-2&&p[1]<=(r.y||0)+r.h+5)n[i]++;}});return REG.map((r,i)=>({name:r.name,type:r.kind,n:n[i]}));},
  get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biomeChecks,itemPositions,biome:()=>window._biome}});
