// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says what
// this page has: its views, the inspector's words (the ground's class, the hazards here, the air) and its checks.
const lightMode=m=>{if(typeof setLightMode==='function')setLightMode(m);};
// THE PRESET VIEWS: [camera xyz, target xyz, light mode], found in the built scene (the vent, the pit's rim, the wall's
// benches, the portal, a hollow with Pele's hair), never aimed at arithmetic alone
const VIEWS={};
(function(){const G=(x,z)=>terrainH(x,z),P=(s,t)=>xzOf(s,t),V=VENT;
 const add=(k,v,mode)=>{if(v)VIEWS[k]={v,mode:mode||'day'};};
 const along=(x0,z0,x1,z1,d)=>{const l=Math.hypot(x1-x0,z1-z0)||1;return[x0+(x1-x0)*d/l,z0+(z1-z0)*d/l];};
 // the vent from the floor beside the rampart, across the fissure
 {const c=P(PIT.s-260,PIT.t+170);add('The summit vent',[c[0],G(c[0],c[1])+14,c[1],V.x,V.base+V.h*.7,V.z]);}
 // down into the crater: the throat's lava
 {const c=along(V.x,V.z,V.x+120,V.z-60,V.r*V.crater*1.05);add('The throat',[c[0],G(c[0],c[1])+9,c[1],V.x,V.lavaY,V.z]);}
 // the pit from its rim, toward the vent and the far wall beyond
 {const c=P(PIT.s-PIT.rimR+60,PIT.t-650);add('The pit from its rim',[c[0],G(c[0],c[1])+35,c[1],V.x,V.base,V.z]);}
 // the caldera wall from the floor between the pit and the wall's foot
 {const c=P(350,-1300),t=P(2900,-200);add('The caldera wall',[c[0],G(c[0],c[1])+4,c[1],t[0],G(t[0],t[1])+120,t[1]]);}
 // on a bench, along the wall: scarps above and below
 {let best=null;for(let s=1000;s<4200;s+=20){const p=P(s,-1400),o=wallAt(p[0],p[1],{});if(!o.onScarp&&o.scarp===3&&o.u>.3&&o.u<.7){best=s;break;}}
  if(best!=null){const c=P(best,-1400),t=P(best+90,900);add('The terraces',[c[0],G(c[0],c[1])+3,c[1],t[0],G(t[0],t[1])+40,t[1]]);}}
 // the portal, from the caldera's side of the rim
 {const fx=Math.sin(PORTAL.ry),fz=Math.cos(PORTAL.ry),c=[PORTAL.x+fx*70+fz*25,PORTAL.z+fz*70-fx*25];
  add('The sealed portal',[c[0],Math.max(G(c[0],c[1]),PORTAL.top||PORTAL.y)+18,c[1],PORTAL.x,(PORTAL.top||PORTAL.y)+6,PORTAL.z]);}
 // from the rim across the caldera: the far wall 65 km off, the sky black over it
 {const c=P(4300,-2300),t=P(-40000,-4000);add('From the rim',[c[0],G(c[0],c[1])+6,c[1],t[0],22800,t[1]]);}
 // the halo: low over the bead sand, the orange near the vent going to black
 {const c=P(PIT.s+700,PIT.t-900);add('The halo',[c[0],G(c[0],c[1])+2.2,c[1],V.x,G(V.x,V.z)+8,V.z]);}
 // Pele's hair: the nearest mat to the vent's view, from a step away
 {let best=null,bd=1e18;const m=new THREE.Matrix4();BIO.baked.forEach(o=>{if(!o.isInstancedMesh||o.name!=='biome:hair')return;
   for(let i=0;i<o.count;i+=3){o.getMatrixAt(i,m);const x=m.elements[12],z=m.elements[14],d=Math.hypot(x-V.x-280,z-V.z+120);if(d<bd){bd=d;best=[x,m.elements[13],z];}}});
  if(best){const c=[best[0]+2.6,best[2]+1.8];add('Pele\'s hair',[c[0],G(c[0],c[1])+1.3,c[1],best[0],best[1],best[2]]);}}
 add('Night, the vent',(function(){const c=along(V.x,V.z,V.x-90,V.z+50,95);return[c[0],G(c[0],c[1])+175,c[1],V.x,V.lavaY,V.z];})(),'night');   /* high enough to see into the crater and along the crack */
 add('Dawn, the wall',(function(){const c=P(PIT.s+PIT.rimR-200,PIT.t-300),t=P(3200,-600);return[c[0],G(c[0],c[1])+20,c[1],t[0],G(t[0],t[1]),t[1]];})(),'dawn');
 {const c=P(PIT.s-2600,PIT.t-1800);add('Overview',[c[0],G(c[0],c[1])+2200,c[1],P(400,0)[0],22100,P(400,0)[1]]);}
 // the sky at noon: the zenith nearly black, the brightest stars by day
 {const c=P(-1200,800),t=P(-200,1300);add('The black sky',[c[0],G(c[0],c[1])+3,c[1],t[0],G(c[0],c[1])+700,t[1]]);}
})();
// ---------------------------------------------------------------- the inspector's words
// an item names itself (its label, its class: glass or rock); the ground names its class and the rock's bed; every hit adds
// the hazards there (core/hazard) and the air (pressure, temperature, the ash's sight)
function groundWords(p){const g=GODT.groundAt(p.x,p.z,{}),k=['orange','black','spatter','glass','sublimate','frost'].sort((a,b)=>g[b]-g[a])[0],
  N={orange:'beadOrange',black:'beadBlack',spatter:'spatter',glass:'glass',sublimate:'sublimate',frost:'frost'};
 const steep=slopeAt(p.x,p.z)>.75,bed=STRATA.at(p.x,p.y,p.z);
 return steep?'the rock: '+bed.kind+' bed of the titanium basalt ('+bed.recipe+')':(g[k]>.2?GODT.GROUND[N[k]].name:GODT.GROUND.basalt.name);}
function airWords(p){if(typeof KHAZ==='undefined'||!KHAZ.here)return'';const H=KHAZ.here(p.x,p.y,p.z,0);const pa=ATMOS.airPressureAt?ATMOS.airPressureAt(SKY.preset||{air:{pressure:1.6,thin:{y0:0,scale:8000}}},p.y):AIR.at(p.y);
 return '\nair '+pa.toFixed(3)+' atm'+(H.ambient&&H.ambient.length?' · '+H.ambient.map(a=>a.kind+' '+(a.k*100).toFixed(0)+'%').join(', '):'');}
function hazardWords(p){const w=typeof KTAGS!=='undefined'&&KTAGS.hazardAt?KTAGS.hazardAt(p.x,p.y,p.z):'';return w?'\n'+w:'';}
function describe(h0,hits){hits=hits.filter(h=>h.object.visible);if(!hits.length)return '(nothing)';const p=hits[0].point,o=hits[0].object;
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;let name;
 if(isItem){const t=GODT.tagsOf(lab);name=lab+(t?'\n'+t.cls+'  ·  '+t.tags.climate+' / '+t.tags.aridity:'');}
 else if(GROUND_MESHES.indexOf(o)>=0)name=lab+'\nground: '+groundWords(p);
 else name=lab+(o.userData.host?'\nstructure (host)':'');
 return name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m'+airWords(p)+hazardWords(p);}
const HOST_VIEWS={};for(const k in VIEWS)HOST_VIEWS[k]=VIEWS[k].v;
const LCTL=['day','dawn','night'].map(m=>({button:m[0].toUpperCase()+m.slice(1),title:m==='night'?'Night (N): the vent\'s crack and throat glow':'',on:()=>lightMode(m),m}));
LIGHT_HOOKS.push(m=>{for(const c of LCTL)if(c.el)c.el.classList.toggle('on',c.m===m);});
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
const BUDGET={showcase:{tris:9000000,calls:220,rendered:4500000},cls:{pass:7000000,host:6000000},type:{'godthrone/ground':'pass','host':'host'}};
function itemPositions(name,every){const out=[],m=new THREE.Matrix4();every=every||1;
 BIO.baked.forEach(o=>{if(!o.isInstancedMesh||o.name!=='biome:'+name)return;for(let i=0;i<o.count;i+=every){o.getMatrixAt(i,m);
  const e=m.elements;out.push([e[12],e[13],e[14],Math.hypot(e[0],e[1],e[2])]);}});return out;}
// THE KIT'S CHECKS, each a pure function of its inputs so a broken input can be handed to it (hostNegatives)
const HCHK={
 // the caldera as 4.23 has it: the rim at 25,000 m, the pit's floor ~900 m under the caldera's floor (~22,000)
 heights(rim,pitFloor,floor){const ok=Math.abs(rim-25000)<60&&Math.abs(floor-22010)<60&&Math.abs(floor-pitFloor-900)<70;
  return{ok,detail:'rim '+rim.toFixed(0)+' m, floor '+floor.toFixed(0)+' m, pit floor '+pitFloor.toFixed(0)+' m ('+(floor-pitFloor).toFixed(0)+' m deep)'};},
 // the halo: orange near the vent, black far from it (PLAN.md section 4)
 halo(near,far){const ok=near>.55&&far<.4&&near>far+.25;return{ok,detail:'orange share '+near.toFixed(2)+' near the vent, '+far.toFixed(2)+' 4 km off'};},
 // the loose stuff lies on the ground as drawn: no item floats or is buried (within its own size), none on a scarp's face
 rests(P,ground,face){let fl=0,bu=0,onFace=0;for(const p of P){const g=ground(p[0],p[2]),d=p[1]-g;if(d>p[3]*.6+.15)fl++;if(d<-p[3]*.6-.15)bu++;if(face(p[0],p[2])>.6)onFace++;}
  return{ok:fl===0&&bu===0&&onFace<=Math.max(2,P.length*.002),detail:P.length+' sampled: '+fl+' floating, '+bu+' buried, '+onFace+' on a scarp\'s face'};},
 // thin air: the pressure the sky draws and core/hazard doses by agrees with the model's law
 air(pRim,pPit){const ok=Math.abs(pRim-.0702)<.006&&Math.abs(pPit-.1145)<.008;return{ok,detail:pRim.toFixed(4)+' atm on the rim, '+pPit.toFixed(4)+' on the pit floor'};},
 // the rock: the wall is the tibasalt recipe, fresh (no palagonite above the dry-cold line)
 rock(samples){const bad=samples.filter(s=>s.recipe!=='tibasalt'||s.kind==='palagonite');const kinds={};samples.forEach(s=>kinds[s.kind]=(kinds[s.kind]||0)+1);
  return{ok:!bad.length&&kinds.flow>0&&(kinds.bead||0)+(kinds.beadblack||0)>0,detail:samples.length+' wall samples: '+JSON.stringify(kinds)+(bad.length?'; '+bad.length+' wrong':'')};},
 // the hazards: the throat burns, the crater's gas, the rampart's heat; on the floor far from the vent only the ambient
 hazards(atLava,atFloor){const ok=!!(atLava&&atLava.doses&&atLava.doses.burn>0&&atFloor&&(!atFloor.records||!atFloor.records.length)&&atFloor.ambient&&atFloor.ambient.some(a=>a.kind==='thin-air'));
  return{ok,detail:'at the lava: '+JSON.stringify(atLava&&atLava.doses)+'; on the floor: '+(atFloor&&atFloor.records?atFloor.records.length:'?')+' records, ambient '+(atFloor&&atFloor.ambient?atFloor.ambient.map(a=>a.kind+' '+a.k.toFixed(2)).join(', '):'none')}}};
const wallSamples=()=>{const o=[];for(let k=0;k<160;k++){const s=1200+k*19,t=-2000+(k*37)%3600,p=xzOf(s,t),w=wallAt(p[0],p[1],{});if(!w.onScarp)continue;
 const y=terrainH(p[0],p[1]),a=STRATA.at(p[0],y,p[1]);o.push({recipe:a.recipe,kind:a.kind});}return o;};
const heightsNow=()=>{let rim=-1e9;for(let s=3800;s<5200;s+=10){const p=xzOf(s,0);rim=Math.max(rim,terrainH(p[0],p[1]));}
 const fl=(()=>{const p=xzOf(-200,2600);return terrainH(p[0],p[1]);})(),pf=terrainH(...xzOf(PIT.s+1100,PIT.t+500));return[rim,pf,fl];};
const hazAt=(x,z,y)=>KHAZ.here(x,y,z,0);
function biomeChecks(){return{items:window._biome,phases:window._phases,horizon:window._horizon,vents:{glows:VENTS.glows,emitters:VENTS.emitters}};}
function hostChecks(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r)),hs=heightsNow(),pres=P=>ATMOS.airPressureAt(SKY.preset||{air:{pressure:1.6,thin:{y0:0,scale:8000}}},P);
 add('the caldera\'s heights (4.23)',HCHK.heights(hs[0],hs[1],hs[2]));
 add('the halo: orange near the vent, black far',HCHK.halo(FIELD.orange(VENT.x+300,VENT.z),FIELD.orange(...xzOf(PIT.s+4200,PIT.t+1200))));
 ['boulder','bomb','stone','hair'].forEach(n=>add('the '+n+'s rest on the ground',HCHK.rests(itemPositions(n,5),terrainH,FIELD.face)));
 add('thin air (the sky and core/hazard agree)',HCHK.air(pres(25000),pres(21110)));
 add('the wall is fresh tibasalt',HCHK.rock(wallSamples()));
 const pf=xzOf(PIT.s+1100,PIT.t+500);add('the hazards',HCHK.hazards(hazAt(VENT.x,VENT.z,VENT.lavaY+.5),hazAt(pf[0],pf[1],terrainH(pf[0],pf[1])+1.6)));
 add('counts: talus '+(window._biome||{}).talus+', bombs '+(window._biome||{}).bombs+', hair '+(window._biome||{}).hair,{ok:(window._biome||{}).talus>500&&(window._biome||{}).hair>50&&(window._biome||{}).bombs>200,detail:JSON.stringify(window._biome)});
 return R;}
function hostNegatives(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail}),hs=heightsNow();
 add('the pit as deep as the floor (a flat caldera)',HCHK.heights(hs[0],hs[2],hs[2]));
 add('the halo all black',HCHK.halo(.1,.1));
 add('the blocks lifted 3 m off the ground',HCHK.rests(itemPositions('boulder',5).map(p=>[p[0],p[1]+3,p[2],p[3]]),terrainH,FIELD.face));
 add('the sea-level pressure on the rim',HCHK.air(1.6,1.6));
 add('the wall turned to palagonite',HCHK.rock(wallSamples().map(s=>Object.assign({},s,{kind:'palagonite'}))));
 add('no lava in the throat',HCHK.hazards({doses:{}},hazAt(...xzOf(PIT.s+1100,PIT.t+500),22000)));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');
KHOST.take({build:'godthrone',title:'Krator Godthrone: the summit vent',
 hint:'The Godthrone\'s summit (station 1, ideal type): the caldera at 22-25 km in a tenth of an atmosphere, the nested pit and its fuming vent, the orange and black glass halo, the terraced titanium-basalt wall, the sealed portal on the rim. N for night',
 scene,camera,renderer,ground:terrainH,clear:1.6,minR:2,maxR:60000,registry:REG,views:HOST_VIEWS,ticks:TICKS,
 onView:k=>lightMode(VIEWS[k].mode),controls:LCTL,
 keys:{n:()=>lightMode((typeof LIGHT_MODE!=='undefined'&&LIGHT_MODE==='night')?'day':'night')},
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'hazards':KTAGS.hazardLayer(),'loose stuff':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'far country':{objects:()=>[FAR.mesh]}},
 exporters:{biome:()=>BIO.export()},
 minimap:{title:'The Godthrone\'s summit'},
 budget:BUDGET,types:()=>BIO.stats,
 probeSample:4000,
 api:{hostChecks,hostNegatives,biomeChecks,itemPositions,
  regOccupancy(){const n=new Array(REG.length).fill(0);const P=KHOST.probe.probePoints();
   REG.forEach((r,i)=>{if(r.far||r.ground){n[i]=1;return;}for(const p of P){const dx=p[0]-r.x,dz=p[2]-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=(r.y||0)-2&&p[1]<=(r.y||0)+r.h+5)n[i]++;}});
   return REG.map((r,i)=>({name:r.name,type:r.kind,n:n[i]}));},
  get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome}});
// the Weather selector in the host's panel (ATMOS.bindWeather finds KHOST.ui once it exists)
