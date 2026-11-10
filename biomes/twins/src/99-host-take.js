// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says what this page has:
// its views (the station's own: STATION_VIEWS in its 98), the inspector's words (the ground's class, the rock's bed, the air and the
// cold, the hazards) and its checks (the kit's here; the station's own: STATION_CHECKS, STATION_NEGATIVES). The Godthrone's, cut to
// what every Twins station shares.
const lightMode=m=>{if(typeof setLightMode==='function')setLightMode(m);};
const VIEWS={};
if(typeof STATION_VIEWS==='function')STATION_VIEWS(VIEWS);
// ---------------------------------------------------------------- the inspector's words
// an item names itself (its label, its class); the ground names its class or the rock's bed; every hit adds the air (pressure, the
// temperature and the ambient hazards: the cold, the thin air) and the placed hazards there (core/hazard)
function groundWords(p){const g=TWINS.groundAt(p.x,p.z,{}),k=TWINS.KEYS.slice().sort((a,b)=>g[b]-g[a])[0];
 const steep=slopeAt(p.x,p.z)>.75,bed=STRATA.at(p.x,p.y,p.z);
 return steep?'the rock: '+bed.kind+' bed of the titanium basalt ('+bed.recipe+')':(g[k]>.2?TWINS.GROUND[k].name:TWINS.GROUND.basalt.name);}
function airWords(p){if(typeof KHAZ==='undefined'||!KHAZ.here)return'';const H=KHAZ.here(p.x,p.y+1,p.z,0);const pa=ATMOS.airPressureAt?ATMOS.airPressureAt(SKY.preset||{air:{pressure:1.6,thin:{y0:0,scale:8000}}},p.y):AIR.at(p.y);
 const T=KHAZ.provided().indexOf('temperature')>=0?' · '+KHAZ_TEMP(p.x,p.y+1,p.z).toFixed(0)+' C':'';
 return '\nair '+pa.toFixed(3)+' atm'+T+(H.ambient&&H.ambient.length?' · '+H.ambient.map(a=>a.kind+' '+(a.k*100).toFixed(0)+'%').join(', '):'');}
const KHAZ_TEMP=(x,y,z)=>{const own=typeof STATION_TEMP==='function'?STATION_TEMP(x,y,z):null;if(own!=null)return own;const s=SKY.state&&SKY.state.sunDir,e=s?(s.y==null?s[1]:s.y):0;return tempMean(y)+3.5*clamp(e*2.2,-1,1);};
function hazardWords(p){const w=typeof KTAGS!=='undefined'&&KTAGS.hazardAt?KTAGS.hazardAt(p.x,p.y,p.z):'';return w?'\n'+w:'';}
function describe(h0,hits){hits=hits.filter(h=>h.object.visible);if(!hits.length)return '(nothing)';const p=hits[0].point,o=hits[0].object;
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;let name;
 if(isItem){const t=TWINS.tagsOf(lab);name=lab+(t?'\n'+t.cls+'  ·  '+t.tags.climate+' / '+t.tags.aridity:'');}
 else if(GROUND_MESHES.indexOf(o)>=0)name=lab+'\nground: '+groundWords(p);
 else name=lab+(o.userData.host?'\nstructure (host)':'');
 return name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m'+airWords(p)+hazardWords(p);}
const HOST_VIEWS={};for(const k in VIEWS)HOST_VIEWS[k]=VIEWS[k].v;
const LCTL=['day','dawn','night'].map(m=>({button:m[0].toUpperCase()+m.slice(1),title:m==='night'?'Night (N): the torches in the tube, the NW Twin\'s glow':'',on:()=>lightMode(m),m}));
LIGHT_HOOKS.push(m=>{for(const c of LCTL)if(c.el)c.el.classList.toggle('on',c.m===m);});
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={showcase:{tris:9000000,calls:240,rendered:4500000},cls:{pass:7000000,host:6000000},type:{'twins/ground':'pass','host':'host'}};
function itemPositions(name,every){const out=[],m=new THREE.Matrix4();every=every||1;
 BIO.baked.forEach(o=>{if(!o.isInstancedMesh||o.name!=='biome:'+name)return;for(let i=0;i<o.count;i+=every){o.getMatrixAt(i,m);
  const e=m.elements;out.push([e[12],e[13],e[14],Math.hypot(e[0],e[1],e[2])]);}});return out;}
// THE KIT'S CHECKS, each a pure function of its inputs so a broken input can be handed to it (hostNegatives)
const HCHK={
 // the station stands on the map: its ground at the site within 60 m of scale model 5.1's, and the far country the map's own
 site(yHere,yMap,farOff){const ok=Math.abs(yHere-yMap)<60&&farOff<1;return{ok,detail:'the site at '+yHere.toFixed(0)+' m (the map: '+yMap.toFixed(0)+' m); the far country off the map by '+farOff.toFixed(2)+' m at most'};},
 // the loose stuff lies on the ground as drawn: no item floats or is buried (within its own size), none on a face
 rests(P,ground,face){let fl=0,bu=0,onFace=0;for(const p of P){const g=ground(p[0],p[2]),d=p[1]-g;if(d>p[3]*.6+.15)fl++;if(d<-p[3]*.6-.15)bu++;if(face(p[0],p[2])>.6)onFace++;}
  return{ok:fl===0&&bu===0&&onFace<=Math.max(2,P.length*.002),detail:P.length+' sampled: '+fl+' floating, '+bu+' buried, '+onFace+' on a face'};},
 // the air: the pressure the sky draws and core/hazard doses by agrees with the model's law (1.6 exp(-y/8000))
 air(pSky,y){const law=1.6*Math.exp(-y/8000),ok=Math.abs(pSky-law)<.01;return{ok,detail:pSky.toFixed(4)+' atm at '+y.toFixed(0)+' m (the law: '+law.toFixed(4)+')'};},
 // the rock: the faces are the tibasalt recipe (its bead horizons altered to palagonite this low: the recipe's dry-cold line, 8,500 m)
 rock(samples){const bad=samples.filter(s=>s.recipe!=='tibasalt');const kinds={};samples.forEach(s=>kinds[s.kind]=(kinds[s.kind]||0)+1);
  return{ok:samples.length>20&&!bad.length&&kinds.flow>0&&!kinds.bead,detail:samples.length+' face samples: '+JSON.stringify(kinds)+(bad.length?'; '+bad.length+' not tibasalt':'')};},
 // the cold: outside the warm places the air is below freezing and core/hazard's ambient cold is on; inside (a tube, an oasis) it is warm
 cold(out,inn){const ok=!!(out&&out.t<0&&out.cold&&inn&&inn.t>8&&!inn.cold);return{ok,detail:'outside '+(out?out.t.toFixed(1)+' C, cold '+(out.cold?'on':'off'):'?')+'; inside '+(inn?inn.t.toFixed(1)+' C, cold '+(inn.cold?'on':'off'):'?')};}};
/* the faces: where the ground is steeper than the inspector's rock (.75): scanned on each inset at its own step, then over the map at 20 m */
const faceSamples=()=>{const o=[],take=(x,z)=>{if(o.length>=300||slopeAt(x,z)<.75)return;const y=terrainH(x,z),a=STRATA.at(x,y,z);o.push({recipe:a.recipe,kind:a.kind});};
 INSETS.forEach(I=>{for(let z=I.box[1];z<I.box[3];z+=I.st*2)for(let x=I.box[0];x<I.box[2];x+=I.st*2)take(x,z);});
 for(let z=TERR.Z0+50;z<TERR.Z1-50&&o.length<300;z+=20)for(let x=TERR.X0+50;x<TERR.X1-50;x+=20)take(x,z);return o;};
const farOffMap=()=>{let m=0;for(const p of [[12000,0],[-12000,0],[0,14000],[0,-14000],[11000,11000]])m=Math.max(m,Math.abs(baseH(p[0],p[1])-(REGION.y0+REGION.h(p[0],p[1]))));return m;};
const coldAt=(x,y,z)=>{const H=KHAZ.here(x,y,z,0);return{t:KHAZ_TEMP(x,y,z),cold:!!(H.ambient||[]).find(a=>a.kind==='cold'&&a.k>0)};};
function biomeChecks(){return{items:window._biome,phases:window._phases,horizon:window._horizon,station:window._station||null,twins:{emitters:TWIN_CONES.emitters,glows:TWIN_CONES.glows}};}
function hostChecks(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r)),pres=y=>ATMOS.airPressureAt(SKY.preset||{air:{pressure:1.6,thin:{y0:0,scale:8000}}},y);
 add('the station stands on scale model 5.1',HCHK.site(terrainH(0,0),REGION.y0,farOffMap()));
 (STN.items||['boulder','stone']).forEach(n=>add('the '+n+'s rest on the ground',HCHK.rests(itemPositions(n,5),terrainH,FIELD.face)));
 add('the air (the sky and core/hazard agree with the law)',HCHK.air(pres(REGION.y0),REGION.y0));
 add('the faces are titanium basalt',HCHK.rock(faceSamples()));
 if(STN.coldProbe){const P=STN.coldProbe();add('the cold outside, the warm within',HCHK.cold(coldAt(...P.out),coldAt(...P.inn)));}
 {const B=window._biome||{},ok=STN.counts?STN.counts(B):(B.blocks>1000&&B.stones>1000);add('counts: blocks '+B.blocks+', obsidian '+B.obsidian+', stones '+B.stones+', cairns '+B.cairns+', ferns '+B.ferns+', cushions '+B.cushions,{ok,detail:JSON.stringify(B)});}
 if(typeof STATION_CHECKS==='function')STATION_CHECKS().forEach(c=>R.push(c));
 return R;}
function hostNegatives(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail});
 add('the station 500 m off the map',HCHK.site(terrainH(0,0)+500,REGION.y0,0));
 add('the blocks lifted 3 m off the ground',HCHK.rests(itemPositions('boulder',5).map(p=>[p[0],p[1]+3,p[2],p[3]]),terrainH,FIELD.face));
 add('sea-level pressure on the station',HCHK.air(1.6,REGION.y0));
 add('the faces turned to another rock',HCHK.rock(faceSamples().map(s=>Object.assign({},s,{recipe:'canyon'}))));
 if(STN.coldProbe){const P=STN.coldProbe();add('the tube as cold as the scree',HCHK.cold(coldAt(...P.out),coldAt(...P.out)));}
 if(typeof STATION_NEGATIVES==='function')STATION_NEGATIVES().forEach(c=>R.push(c));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');
KHOST.take({build:'twins',title:STN.title,hint:STN.hint,
 scene,camera,renderer,ground:terrainH,clear:1.6,floor:typeof STATION_FLOOR==='function'?STATION_FLOOR:undefined,   /* the tubes: the eye may stand on their floors under the slope */
 minR:2,maxR:60000,registry:REG,views:HOST_VIEWS,ticks:TICKS,
 onView:k=>{lightMode(VIEWS[k].mode);if(VIEWS[k].hour!=null){const c=KHOST.host&&KHOST.host.clock;if(c&&c.set)c.set(VIEWS[k].hour);}},controls:LCTL,
 keys:{n:()=>lightMode((typeof LIGHT_MODE!=='undefined'&&LIGHT_MODE==='night')?'day':'night')},
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'hazards':KTAGS.hazardLayer(),'loose stuff':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'far country':{objects:()=>[FAR.mesh]}},
 exporters:{biome:()=>BIO.export()},
 minimap:{title:STN.minimap||'The Twins'},
 budget:BUDGET,types:()=>BIO.stats,
 probeSample:4000,
 api:{hostChecks,hostNegatives,biomeChecks,itemPositions,
  regOccupancy(){const n=new Array(REG.length).fill(0);const P=KHOST.probe.probePoints();
   REG.forEach((r,i)=>{if(r.far||r.ground){n[i]=1;return;}for(const p of P){const dx=p[0]-r.x,dz=p[2]-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=(r.y||0)-2&&p[1]<=(r.y||0)+r.h+5)n[i]++;}});
   return REG.map((r,i)=>({name:r.name,type:r.kind,n:n[i]}));},
  get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome}});
