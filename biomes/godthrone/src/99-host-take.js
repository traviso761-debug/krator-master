// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (core/host/README.md): this fragment only says what
// this page has: its views, the inspector's words (the ground's class, the hazards here, the air) and its checks.
const lightMode=m=>{if(typeof setLightMode==='function')setLightMode(m);};
// THE PRESET VIEWS: [camera xyz, target xyz, light mode], found in the built scene (the vent, the pit's rim, the wall's
// benches, the portal, a hollow with Pele's hair), never aimed at arithmetic alone
const VIEWS={};
(function(){const G=(x,z)=>terrainH(x,z),P=(s,t)=>xzOf(s,t),V=VENT;
 const add=(k,v,mode,o)=>{if(v)VIEWS[k]=Object.assign({v,mode:mode||'day'},o||{});};
 const along=(x0,z0,x1,z1,d)=>{const l=Math.hypot(x1-x0,z1-z0)||1;return[x0+(x1-x0)*d/l,z0+(z1-z0)*d/l];};
 if(STN.key==='vent'){
  // the vent from the floor beside the rampart, across the fissure
  {const c=P(PIT.s-260,PIT.t+170);add('The summit vent',[c[0],G(c[0],c[1])+14,c[1],V.x,V.base+V.h*.7,V.z]);}
  // the fountain: further back, the clock jumped to the next fountain (89b: the hazard's own cycle)
  {const c=P(PIT.s-900,PIT.t+650);add('The fountain',[c[0],G(c[0],c[1])+40,c[1],V.x,V.base+220,V.z],'day',{erupt:true});}
  // down into the crater: the throat's lava
  {const c=along(V.x,V.z,V.x+120,V.z-60,V.r*V.crater*1.05);add('The throat',[c[0],G(c[0],c[1])+9,c[1],V.x,V.lavaY,V.z]);}
  // the pit from its rim, toward the vent
  {const c=P(PIT.s-PIT.rimR+60,PIT.t-650);add('The pit from its rim',[c[0],G(c[0],c[1])+35,c[1],V.x,V.base,V.z]);}
  // from the pit's north-east rim across the floor to the caldera's wall 23 km off
  {const c=P(PIT.s+PIT.rimR+250,PIT.t+300),t=P(1500,0);add('The wall from the pit',[c[0],G(c[0],c[1])+6,c[1],t[0],23400,t[1]]);}
  // the halo: low over the bead sand, the orange near the vent going to black
  {const c=P(PIT.s+700,PIT.t-900);add('The halo',[c[0],G(c[0],c[1])+2.2,c[1],V.x,G(V.x,V.z)+8,V.z]);}
  // Pele's hair: the nearest mat to the vent's view, from a step away
  {let best=null,bd=1e18;const m=new THREE.Matrix4();BIO.baked.forEach(o=>{if(!o.isInstancedMesh||o.name!=='biome:hair')return;
    for(let i=0;i<o.count;i+=3){o.getMatrixAt(i,m);const x=m.elements[12],z=m.elements[14],d=Math.hypot(x-V.x-280,z-V.z+120);if(d<bd){bd=d;best=[x,m.elements[13],z];}}});
   if(best){const c=[best[0]+2.6,best[2]+1.8];add('Pele\'s hair',[c[0],G(c[0],c[1])+1.3,c[1],best[0],best[1],best[2]]);}}
  add('Night, the vent',(function(){const c=along(V.x,V.z,V.x-90,V.z+50,95);return[c[0],G(c[0],c[1])+175,c[1],V.x,V.lavaY,V.z];})(),'night');   /* high enough to see into the crater and along the crack */
  add('Night, the fountain',(function(){const c=P(PIT.s-1100,PIT.t+800);return[c[0],G(c[0],c[1])+60,c[1],V.x,V.base+200,V.z];})(),'night',{erupt:true});
  {const c=P(PIT.s-2600,PIT.t-1800);add('Overview',[c[0],G(c[0],c[1])+1800,c[1],V.x,21200,V.z]);}
  // the sky at noon: the zenith nearly black, the brightest stars by day
  {const c=P(PIT.s+500,PIT.t+2200),t=P(PIT.s+1500,PIT.t+2700);add('The black sky',[c[0],G(c[0],c[1])+3,c[1],t[0],G(c[0],c[1])+700,t[1]]);}
 }else if(STN.key==='wall'){
  // the caldera wall from the floor at its foot
  {const c=P(350,-1300),t=P(2900,-200);add('The caldera wall',[c[0],G(c[0],c[1])+4,c[1],t[0],G(t[0],t[1])+120,t[1]]);}
  // on a bench, along the wall: scarps above and below
  {let best=null;for(let s=1000;s<4200;s+=20){const p=P(s,-1400),o=wallAt(p[0],p[1],{});if(!o.onScarp&&o.scarp===3&&o.u>.3&&o.u<.7){best=s;break;}}
   if(best!=null){const c=P(best,-1400),t=P(best+90,900);add('The terraces',[c[0],G(c[0],c[1])+3,c[1],t[0],G(t[0],t[1])+40,t[1]]);}}
  // a scarp close: its beds and bead horizons, the talus at its foot
  {let best=null;for(let s=1000;s<4200;s+=10){const p=P(s,600),o=wallAt(p[0],p[1],{});if(!o.onScarp&&o.scarp===2&&o.toFoot<60&&o.toFoot>30){best=s;break;}}
   if(best!=null){const c=P(best-40,600),t=P(best+120,650);add('A scarp close',[c[0],G(c[0],c[1])+2,c[1],t[0],G(t[0],t[1])+30,t[1]]);}}
  // the portal, from the caldera's side of the rim
  {const fx=Math.sin(PORTAL.ry),fz=Math.cos(PORTAL.ry),c=[PORTAL.x+fx*70+fz*25,PORTAL.z+fz*70-fx*25];
   add('The sealed portal',[c[0],Math.max(G(c[0],c[1]),PORTAL.top||PORTAL.y)+18,c[1],PORTAL.x,(PORTAL.top||PORTAL.y)+6,PORTAL.z]);}
  // from the rim across the caldera: the vent's fume 23 km off, the far wall 65 km off, the sky black over it
  {const c=P(4300,-2300);add('From the rim',[c[0],G(c[0],c[1])+6,c[1],V.x,22000,V.z]);}
  add('From the rim, fountaining',(function(){const c=P(4350,-1200);return[c[0],G(c[0],c[1])+6,c[1],V.x,22200,V.z];})(),'night',{erupt:true});
  add('Dawn, the wall',(function(){const c=P(-1500,-300),t=P(3200,-600);return[c[0],G(c[0],c[1])+20,c[1],t[0],G(t[0],t[1]),t[1]];})(),'dawn');
  {const c=P(-3600,-1800);add('Overview',[c[0],G(c[0],c[1])+2200,c[1],P(1800,0)[0],23000,P(1800,0)[1]]);}
 }
})();
// THE SERIOUS ERUPTION's views (89c): each sets the time-lapse to its day (lake); every other view turns the scenario off
if(LAKE){const E=LAKE.E,V=VENT,P=PIT,G=(x,z)=>terrainH(x,z),xz=(s,t)=>xzOf(s,t);
 let dd=null;for(let d=0;d<=E.days;d+=.05)if(LAKE.at(d).drowned){dd=d;break;}LAKE.drownDay=dd;
 const rimC=xz(P.s-P.rimR-120,P.t+400),lk=d=>LAKE.at(d).L;
 VIEWS['The eruption, day 1']={v:[rimC[0],G(rimC[0],rimC[1])+60,rimC[1],V.x,lk(1)+60,V.z],mode:'day',lake:1};
 if(dd!=null){const d=Math.min(E.days,dd+2);VIEWS['The lava lake, the vent drowned']={v:[rimC[0],G(rimC[0],rimC[1])+60,rimC[1],V.x,lk(d),V.z],mode:'day',lake:d};}
 VIEWS['Night, the lava lake']={v:[rimC[0],G(rimC[0],rimC[1])+120,rimC[1],V.x,lk(E.days*.4),V.z],mode:'night',lake:E.days*.4};
 const cl=xz(P.s+300,P.t-500);VIEWS['On the lake\'s crust']={v:[cl[0],lk(E.days+10)+12,cl[1],V.x,lk(E.days+10),V.z],mode:'day',lake:E.days+10};
 VIEWS['The frozen lake']={v:[rimC[0],G(rimC[0],rimC[1])+80,rimC[1],V.x,E.Lmax,V.z],mode:'day',lake:E.days+E.crustDays+1};}
// another station's views (its own fragment, stations/<name>/98-host-*.js, defines STATION_VIEWS)
if(typeof STATION_VIEWS==='function')STATION_VIEWS(VIEWS);
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
if(STN.summit)LCTL.push({button:'Fountain',title:'Jump to the vent\'s next fountain (every '+VENT_CYCLE.period/60+' minutes, for '+VENT_CYCLE.on/60+')',on:()=>VENTS.nextFountain(),m:'-'});
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
 hazards(atLava,atFloor){const ok=!!(atLava&&atLava.doses&&atLava.doses.burn>0&&atFloor&&!(atFloor.records||[]).some(r=>r.k>0)&&atFloor.ambient&&atFloor.ambient.some(a=>a.kind==='thin-air'));
  return{ok,detail:'at the lava: '+JSON.stringify(atLava&&atLava.doses)+'; on the floor: '+(atFloor&&atFloor.records?atFloor.records.length:'?')+' records, ambient '+(atFloor&&atFloor.ambient?atFloor.ambient.map(a=>a.kind+' '+a.k.toFixed(2)).join(', '):'none')}}};
// the fountain: one clock for what burns and what is drawn (the record's cycle, KHAZ; the page's phase, KTRAPS on the same segments)
HCHK.fountain=function(on,idle,pOn,pIdle){const b=h=>h&&h.doses&&h.doses.burn>0;const ok=b(on)&&!b(idle)&&pOn==='on'&&pIdle==='idle';
 return{ok,detail:'200 m over the vent: in a fountain '+JSON.stringify(on&&on.doses)+' (the page: '+pOn+'), between '+JSON.stringify(idle&&idle.doses)+' (the page: '+pIdle+')'};};
const FT=(()=>{const C=VENT_CYCLE,L=C.period,m=v=>((v%L)+L)%L;return{on:m(C.warn+C.ramp+30-C.offset),idle:m(C.warn+2*C.ramp+C.on+C.after+60-C.offset)};})();
const fountainAt=t=>KHAZ.here(VENT.x,VENT.lavaY+200,VENT.z,t);
const wallSamples=()=>{const o=[];for(let k=0;k<800;k++){const s=1200+(k*19)%3040,t=-2000+(k*37)%3600,p=xzOf(s,t),w=wallAt(p[0],p[1],{});if(!w.onScarp)continue;
 const y=terrainH(p[0],p[1]),a=STRATA.at(p[0],y,p[1]);o.push({recipe:a.recipe,kind:a.kind});}return o;};
const heightsNow=()=>{let rim=-1e9;for(let s=3800;s<5200;s+=10){const p=xzOf(s,0);rim=Math.max(rim,terrainH(p[0],p[1]));}
 const fl=(()=>{const p=xzOf(-200,2600);return terrainH(p[0],p[1]);})(),pf=terrainH(...xzOf(PIT.s+1100,PIT.t+500));return[rim,pf,fl];};
const hazAt=(x,z,y)=>KHAZ.here(x,y,z,0);
function biomeChecks(){return{items:window._biome,phases:window._phases,horizon:window._horizon,vents:VENTS?{glows:VENTS.glows,emitters:VENTS.emitters}:null};}
function hostChecks(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r)),hs=STN.summit?heightsNow():null,pres=P=>ATMOS.airPressureAt(SKY.preset||{air:{pressure:1.6,thin:{y0:0,scale:8000}}},P);
if(STN.summit) add('the caldera\'s heights (4.23)',HCHK.heights(hs[0],hs[1],hs[2]));
 if(STN.vent)add('the halo: orange near the vent, black far',HCHK.halo(FIELD.orange(VENT.x+300,VENT.z),FIELD.orange(...xzOf(PIT.s+4200,PIT.t+1200))));
 (STN.items||['boulder','bomb','stone','hair']).forEach(n=>add('the '+n+'s rest on the ground',HCHK.rests(itemPositions(n,5),terrainH,FIELD.face)));
 if(STN.summit){add('thin air (the sky and core/hazard agree)',HCHK.air(pres(25000),pres(21110)));
 add('the wall is fresh tibasalt',HCHK.rock(wallSamples()));}
 const pf=STN.summit?xzOf(PIT.s+1100,PIT.t+500):null;if(STN.vent)add('the hazards',HCHK.hazards(hazAt(VENT.x,VENT.z,VENT.lavaY+.5),hazAt(pf[0],pf[1],terrainH(pf[0],pf[1])+1.6)));
 if(STN.summit)add('the fountain: intermittent, one clock',HCHK.fountain(fountainAt(FT.on),fountainAt(FT.idle),VENTS.phase(FT.on).state,VENTS.phase(FT.idle).state));
 {const B=window._biome||{},ok=STN.counts?STN.counts(B):STN.vent?B.talus>500&&B.hair>50&&B.bombs>200:STN.summit?B.talus>2000&&B.stones>1000:B.talus>150&&B.stones>1000;add('counts: talus '+B.talus+', bombs '+B.bombs+', hair '+B.hair+', stones '+B.stones,{ok,detail:JSON.stringify(B)});}
 if(typeof STATION_CHECKS==='function')STATION_CHECKS().forEach(c=>R.push(c));
 if(LAKE){add('the lava lake: its level from its volume',HCHK.lake(lakeSamples(),LAKE.E));add('the lava lake: its hazard and its frozen floor',HCHK.lakePage(lakePage()));}
 if(OVF)OVF.verdict(OVF.run()).forEach(c=>add(c.name,c));   /* the lake's overflow (89d, ?overflow only) */
 return R;}
// THE LAVA LAKE (89c): the level never falls while it fills and never passes the pit's lip; the volume under it is the volume
// poured (1%); the vent drowns. The page: molten where the lake is, nothing before it; the frozen floor at the level, the ground
// restored after (the field read back exactly)
HCHK.lake=function(S,E){let mono=true,cons=0,over=0;for(let i=1;i<S.length;i++)if(S[i].L<S[i-1].L-1e-6)mono=false;
 S.forEach(s=>{if(s.V>1e6)cons=Math.max(cons,Math.abs(LAKE.V(s.L)-s.V)/s.V);if(s.L>E.Lmax+1e-6)over++;});
 const top=S[S.length-1],ok=mono&&cons<.01&&!over&&top.L>E.Lmax-30&&LAKE.drownDay!=null;
 return{ok,detail:(mono?'rising':'FALLS')+'; volume error '+(cons*100).toFixed(2)+'%; '+over+' levels over the lip; full at '+top.L.toFixed(0)+' m (lip '+E.lip.toFixed(0)+', '+(E.Vmax/1e9).toFixed(1)+' km3 in '+E.days.toFixed(0)+' days at '+E.Q0+' m3/s falling); the vent drowned on day '+(LAKE.drownDay==null?'never':LAKE.drownDay.toFixed(1))};};
HCHK.lakePage=function(r){const ok=r.burnMid>0&&r.burnBefore===0&&Math.abs(r.frozen-r.Lf)<6&&r.restored===0;
 return{ok,detail:'burn on the lake mid-eruption '+r.burnMid+', before it '+r.burnBefore+'; the frozen floor '+r.frozen.toFixed(1)+' m at a level of '+r.Lf.toFixed(1)+'; '+r.restored+' heights off after the restore'};};
const lakeSamples=()=>{const o=[];for(let d=0;d<=LAKE.E.days;d+=LAKE.E.days/200)o.push(LAKE.at(d));return o;};
const lakePage=()=>{const ov=OVF&&OVF.active;if(OVF)OVF.active=false;   /* 89c's own lake, without 89d's overflow */
 const was=LAKE.day,E=LAKE.E,p=xzOf(PIT.s+500,PIT.t-400),h0=Float32Array.from(GROUND_F.heights);
 LAKE.set(E.days*.4);const s=LAKE.state,a=KHAZ.here(p[0],s.L+1,p[1],0),burnMid=(a.doses&&a.doses.burn)||0;
 LAKE.set(null);const b=KHAZ.here(p[0],LAKE.at(E.days*.4).L+1,p[1],0),burnBefore=(b.doses&&b.doses.burn)||0;
 const Lf=LAKE.at(E.days+E.crustDays+1).L;LAKE.set(E.days+E.crustDays+1);const frozen=terrainH(p[0],p[1]);
 LAKE.set(null);let restored=0;for(let k=0;k<h0.length;k++)if(GROUND_F.heights[k]!==h0[k])restored++;
 LAKE.set(was);if(OVF)OVF.active=ov;return{burnMid,burnBefore,frozen,Lf,restored};};
function hostNegatives(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail}),hs=STN.summit?heightsNow():null;
if(STN.summit){ add('the pit as deep as the floor (a flat caldera)',HCHK.heights(hs[0],hs[2],hs[2]));
 add('the halo all black',HCHK.halo(.1,.1));
 add('the blocks lifted 3 m off the ground',HCHK.rests(itemPositions('boulder',5).map(p=>[p[0],p[1]+3,p[2],p[3]]),terrainH,FIELD.face));
 add('the sea-level pressure on the rim',HCHK.air(1.6,1.6));
 add('the wall turned to palagonite',HCHK.rock(wallSamples().map(s=>Object.assign({},s,{kind:'palagonite'}))));
 add('no lava in the throat',HCHK.hazards({doses:{}},hazAt(...xzOf(PIT.s+1100,PIT.t+500),22000)));
 add('the fountain always on (no cycle)',HCHK.fountain(fountainAt(FT.on),fountainAt(FT.on),'on','on'));
 if(LAKE){const S=lakeSamples();add('the lake over the pit\'s lip',HCHK.lake(S.map((s,i)=>i===S.length-1?Object.assign({},s,{L:LAKE.E.lip+5}):s),LAKE.E));
  add('the lake\'s floor left re-baked after the restore',HCHK.lakePage(Object.assign(lakePage(),{restored:12})));}}
 if(OVF){const r=OVF.run(),neg=(n,o)=>{const v=OVF.verdict(Object.assign({},r,o))[n];add(v.name+' (broken)',v);};
  neg(2,{cos:-1,farShare:.5});neg(1,{mass:Object.assign({},r.mass,{error:r.mass.erupted*.01})});neg(3,{raised:0});neg(4,{mid:Object.assign({},r.mid,{farBurn:5})});neg(5,{gpu:{mass:1.1,dh:1,dT:0,molten:[0,0]}});neg(6,{off:12});neg(0,{out:0});}
 if(typeof STATION_NEGATIVES==='function')STATION_NEGATIVES().forEach(c=>R.push(c));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');
KHOST.take({build:'godthrone',title:STN.title,hint:STN.hint,
 scene,camera,renderer,ground:terrainH,clear:1.6,floor:typeof STATION_FLOOR==='function'?STATION_FLOOR:undefined,   /* the tube's vault: the eye may stand on its floor under the plan */
 minR:2,maxR:60000,registry:REG,views:HOST_VIEWS,ticks:TICKS,
 onView:k=>{lightMode(VIEWS[k].mode);if(VIEWS[k].hour!=null){const c=KHOST.host&&KHOST.host.clock;if(c&&c.set)c.set(VIEWS[k].hour);}   /* a view at its own hour (the Red Gill's breath) */
  if(VIEWS[k].erupt)VENTS.nextFountain();if(LAKE){LAKE.set(VIEWS[k].lake==null?null:VIEWS[k].lake);if(LAKE.ui)LAKE.ui.sync();}},controls:LCTL,
 keys:{n:()=>lightMode((typeof LIGHT_MODE!=='undefined'&&LIGHT_MODE==='night')?'day':'night')},
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'hazards':KTAGS.hazardLayer(),'loose stuff':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'far country':{objects:()=>[FAR.mesh]}},
 exporters:{biome:()=>BIO.export()},
 minimap:{title:STN.minimap||'The Godthrone\'s summit'},
 budget:BUDGET,types:()=>BIO.stats,
 probeSample:4000,
 api:{hostChecks,hostNegatives,biomeChecks,itemPositions,
  regOccupancy(){const n=new Array(REG.length).fill(0);const P=KHOST.probe.probePoints();
   REG.forEach((r,i)=>{if(r.far||r.ground){n[i]=1;return;}for(const p of P){const dx=p[0]-r.x,dz=p[2]-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=(r.y||0)-2&&p[1]<=(r.y||0)+r.h+5)n[i]++;}});
   return REG.map((r,i)=>({name:r.name,type:r.kind,n:n[i]}));},
  get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
  biome:()=>window._biome}});
// the Weather selector in the host's panel (ATMOS.bindWeather finds KHOST.ui once it exists)
// THE TIME-LAPSE of a serious eruption (89c): a button that starts and stops the scenario, a slider over its days (the eruption,
// the crust closing, the frozen lake), play; the line under it says the day, the rate, the level and the state
if(LAKE)(function(){const E=LAKE.E,total=E.days+E.crustDays+3,ui=KHOST.ui||document.getElementById('ui');if(!ui)return;
 const box=document.createElement('div');box.style.cssText='margin:6px 0;display:flex;flex-wrap:wrap;gap:6px;align-items:center';
 const on=document.createElement('button');on.textContent='Serious eruption';on.title='A flood-basalt eruption fills the pit with a lava lake ('+(E.Vmax/1e9).toFixed(1)+' km3 in '+E.days.toFixed(0)+' days); no overflow';
 const play=document.createElement('button');play.textContent='Play';
 const sl=document.createElement('input');sl.type='range';sl.min=0;sl.max=1000;sl.value=0;sl.style.width='160px';
 const out=document.createElement('div');out.style.cssText='flex-basis:100%;font:12px ui-monospace,monospace;opacity:.9';
 box.append(on,play,sl,out);ui.appendChild(box);
 if(OVF){OVF.ui(box,d=>go(d));KHOST.on(OVF.tick,'view');}   /* the overflow's checkbox (89d, ?overflow only) */
 let playing=false;
 const show=()=>{const s=LAKE.state;on.classList.toggle('on',LAKE.day!=null);play.textContent=playing?'Pause':'Play';
  out.textContent=s?('day '+s.day.toFixed(1)+' · '+s.phase+' · '+Math.round(s.Q).toLocaleString()+' m3/s · level '+s.L.toFixed(0)+' m ('+(s.L-E.L0).toFixed(0)+' m deep)'+(s.drowned?' · the vent drowned':'')+' · crust '+Math.round(s.crust*100)+'%'+(OVF&&OVF.active&&s.poured!=null?OVF.words(s):'')):'the vent as it is (fuming, fountaining now and then)';};
 const go=d=>{LAKE.set(d);if(d!=null)sl.value=Math.round(d/total*1000);show();};
 LAKE.ui={sync:()=>{if(LAKE.day!=null)sl.value=Math.round(LAKE.day/total*1000);else playing=false;show();}};
 on.onclick=()=>{if(LAKE.day==null)go(0);else{playing=false;go(null);}};
 sl.oninput=()=>go(sl.value/1000*total);
 play.onclick=()=>{if(LAKE.day==null)go(0);playing=!playing;show();};
 KHOST.on(dt=>{if(!playing||LAKE.day==null)return;const d=LAKE.day+(dt||0)*total/45;if(d>=total){playing=false;go(total);}else go(d);},'view');   /* the whole time-lapse in 45 s */
 show();})();
