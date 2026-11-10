// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says what this
// page has: its views (the station's own: STATION_VIEWS), the inspector's words (the ground's class, the rock's bed, the hazards,
// the air) and its checks. Started from biomes/godthrone's.
const lightMode=m=>{if(typeof setLightMode==='function')setLightMode(m);};
const VIEWS={};
if(typeof STATION_VIEWS==='function')STATION_VIEWS(VIEWS);
// ---------------------------------------------------------------- the inspector's words
function groundWords(p){const g=GSTEP.groundAt(p.x,p.z,{}),k=GSTEP.CLASSES.slice().sort((a,b)=>g[b]-g[a])[0];
 const steep=slopeAt(p.x,p.z)>.75,bed=STRATA.at(p.x,p.y,p.z),fl=typeof STAIR!=='undefined'&&STAIR.kind==='stair'&&typeof swell==='function'?KRELIEF.flowAt(STAIR,p.y-swell(p.x,p.z)):null;   /* a station with no stair of its own */
 return steep?'the rock: '+bed.kind+' bed of the titanium basalt ('+bed.recipe+')'+(fl?', a flow\'s '+fl.part:''):(g[k]>.2?GSTEP.GROUND[k].name:GSTEP.GROUND.basalt.name);}
function airWords(p){if(typeof KHAZ==='undefined'||!KHAZ.here)return'';const H=KHAZ.here(p.x,p.y,p.z,0);const pa=ATMOS.airPressureAt?ATMOS.airPressureAt(SKY.preset||{air:{pressure:1.6,thin:{y0:0,scale:8000}}},p.y):AIR.at(p.y);
 return '\nair '+pa.toFixed(3)+' atm'+(H.ambient&&H.ambient.length?' · '+H.ambient.map(a=>a.kind+' '+(a.k*100).toFixed(0)+'%').join(', '):'');}
function hazardWords(p){const w=typeof KTAGS!=='undefined'&&KTAGS.hazardAt?KTAGS.hazardAt(p.x,p.y,p.z):'';return w?'\n'+w:'';}
function describe(h0,hits){hits=hits.filter(h=>h.object.visible);if(!hits.length)return '(nothing)';const p=hits[0].point,o=hits[0].object;
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;let name;
 if(isItem){const t=GSTEP.tagsOf(lab);name=lab+(t?'\n'+t.cls+'  ·  '+t.tags.climate+' / '+t.tags.aridity:'');}
 else if(GROUND_MESHES.indexOf(o)>=0)name=lab+'\nground: '+groundWords(p);
 else name=lab+(o.userData.host?'\nstructure (host)':'');
 return name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m'+airWords(p)+hazardWords(p);}
const HOST_VIEWS={};for(const k in VIEWS)HOST_VIEWS[k]=VIEWS[k].v;
const LCTL=['day','dawn','night'].map(m=>({button:m[0].toUpperCase()+m.slice(1),title:'',on:()=>lightMode(m),m}));
LIGHT_HOOKS.push(m=>{for(const c of LCTL)if(c.el)c.el.classList.toggle('on',c.m===m);});
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
/* a station's passes (GSTEP.PASSES) and its read-in-place neighbours are typed by STN.budgetTypes {type: class}; STN.budget overrides the showcase */
const BUDGET={showcase:Object.assign({tris:9000000,calls:220,rendered:4500000},STN.budget||{}),cls:{pass:7000000,host:6000000},
 type:Object.assign({'godstep/ground':'pass','host':'host'},STN.budgetTypes||{})};
function itemPositions(name,every){const out=[],m=new THREE.Matrix4();every=every||1;
 BIO.baked.forEach(o=>{if(!o.isInstancedMesh||o.name!=='biome:'+name)return;for(let i=0;i<o.count;i+=every){o.getMatrixAt(i,m);
  const e=m.elements;out.push([e[12],e[13],e[14],Math.hypot(e[0],e[1],e[2])]);}});return out;}
// THE KIT'S CHECKS, each a pure function of its inputs so a broken input can be handed to it (hostNegatives)
const HCHK={
 // the loose stuff lies on the ground as drawn: no item floats or is buried (within its own size), none on a riser's face
 rests(P,ground,face){let fl=0,bu=0,onFace=0;for(const p of P){const g=ground(p[0],p[2]),d=p[1]-g;if(d>p[3]*.6+.15)fl++;if(d<-p[3]*.6-.15)bu++;if(face(p[0],p[2])>.6)onFace++;}
  return{ok:fl===0&&bu===0&&onFace<=Math.max(2,P.length*.004),detail:P.length+' sampled: '+fl+' floating, '+bu+' buried, '+onFace+' on a riser\'s face'};}};
function biomeChecks(){return{items:window._biome,phases:window._phases,horizon:window._horizon,water:window._water};}
function hostChecks(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r));
 (STN.items||['boulder','stone']).forEach(n=>add('the '+n+'s rest on the ground',HCHK.rests(itemPositions(n,5),terrainH,FIELD.face)));
 {const B=window._biome||{},ok=STN.counts?STN.counts(B):B.talus>150&&B.stones>500;add('counts: talus '+B.talus+' ('+B.columns+' columns), stones '+B.stones+', cushions '+B.cushions+', crusts '+B.crusts+', moss '+B.moss+', cairns '+B.cairns,{ok,detail:JSON.stringify(B)});}
 if(typeof STATION_CHECKS==='function')STATION_CHECKS().forEach(c=>R.push(c));
 return R;}
function hostNegatives(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail});
 add('the blocks lifted 3 m off the ground',HCHK.rests(itemPositions('boulder',5).map(p=>[p[0],p[1]+3,p[2],p[3]]),terrainH,FIELD.face));
 if(typeof STATION_NEGATIVES==='function')STATION_NEGATIVES().forEach(c=>R.push(c));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');
KHOST.take({build:'godstep',title:STN.title,hint:STN.hint,
 scene,camera,renderer,ground:terrainH,clear:1.6,
 minR:2,maxR:60000,registry:REG,views:HOST_VIEWS,ticks:TICKS,
 onView:k=>{lightMode(VIEWS[k].mode);},controls:LCTL,
 keys:{n:()=>lightMode((typeof LIGHT_MODE!=='undefined'&&LIGHT_MODE==='night')?'day':'night')},
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'hazards':KTAGS.hazardLayer(),'loose stuff and pioneers':{match:o=>!!(o.userData&&o.userData.biome)},'far country':{objects:()=>[FAR.mesh]}},
 exporters:{biome:()=>BIO.export()},
 minimap:{title:STN.minimap||'Godstep valley'},
 budget:BUDGET,types:()=>BIO.stats,
 probeSample:4000,
 api:{hostChecks,hostNegatives,biomeChecks,itemPositions,
  regOccupancy(){const n=new Array(REG.length).fill(0);const P=KHOST.probe.probePoints();
   REG.forEach((r,i)=>{if(r.far||r.ground||r.path){n[i]=1;return;}for(const p of P){const dx=p[0]-r.x,dz=p[2]-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=(r.y||0)-2&&p[1]<=(r.y||0)+r.h+5)n[i]++;}});
   return REG.map((r,i)=>({name:r.name,type:r.kind,n:n[i]}));},
  get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome}});
