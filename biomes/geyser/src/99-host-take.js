// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const toward=(x,z,tx,tz,d,h,th)=>{const a=Math.atan2(tz-z,tx-x),cx=tx-Math.cos(a)*d,cz=tz-Math.sin(a)*d;return[cx,Math.max(gh(cx,cz,h),waterH(cx,cz)+h),cz,tx,gh(tx,tz,th==null?1:th),tz];};
const GY=k=>LAYOUT.geysers.find(g=>g.key===k),SPR=k=>LAYOUT.springs.find(s=>s.key===k);
const SPI=k=>GEYSER.SPECIES?GEYSER.SPECIES.findIndex(S=>S.key===k):-1;
function nearTree(key,x,z,minH){const T=GEYSER.nearestTree&&GEYSER.nearestTree(SPI(key),x,z,minH);return T||{x:x,z:z,y0:gh(x,z),H:6,crownR:3};}
function atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,1.6),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*(ty==null?.5:ty),T.z];}
const VMODE={},VERUPT={};
const VIEWS={
 'The geyser basin':(function(){const c=[-60,330],t=[0,-330];return[c[0],gh(c[0],c[1],62),c[1],t[0],gh(t[0],t[1],10),t[1]];})(),
 'Geyser Hill':(function(){const g=GY('kettle');return toward(g.x-150,g.z+160,g.x+60,g.z-60,230,16,6);})(),
 'The Old Kettle erupting':(function(){const g=GY('kettle');return toward(g.x-70,g.z+95,g.x,g.z,120,5,24);})(),
 'Grandmother':(function(){const g=GY('grandmother');return toward(g.x+110,g.z+150,g.x,g.z,190,6,28);})(),
 'The Twins and the Lantern':(function(){const g=GY('twins');return toward(g.x+30,g.z+60,g.x,g.z,70,3,6);})(),
 'The Great Prism from above':(function(){const s=SPR('prism');return[s.x+120,s.level+150,s.z+150,s.x,s.level,s.z];})(),
 'The Prism\'s run-off':(function(){const s=SPR('prism'),ch=LAYOUT.runoff.find(c=>c.src==='prism'),p=ch.P[Math.min(ch.P.length-1,18)];return toward(p[0]+6,p[1]+14,s.x,s.z,s.r+40,2.2,0);})(),
 'A funnel pool':(function(){const s=SPR('glory');return toward(s.x+9,s.z+6,s.x,s.z,s.r*2.4,2.4,-1);})(),
 'The acid field':(function(){const a=LAYOUT.acid[0],m=LAYOUT.mud[0];return toward(m.x-26,m.z+22,m.x,m.z,m.r+20,4,0);})(),
 'The dead forest':(function(){const d=LAYOUT.dead[0];return toward(d.x-160,d.z+170,d.x,d.z,200,6,10);})(),
 'The Stair from the beach':(function(){const z=shoreZ(STAIR.x0)-14,x=stairX(z)+30,t=[stairX(520),520];return[x,gh(x,z,2.2),z,t[0],gh(t[0],t[1],2),t[1]];})(),
 'The Stair from above':(function(){const z=560,x=stairX(z);return[x+170,gh(x,z,95),z+150,x,gh(x,z,-4),z-40];})(),
 'Terrace pools':(function(){const z=600,x=stairX(z)+40;return[x+6,gh(x,z,3),z+16,x-4,gh(x-4,z-24,-.5),z-24];})(),
 'Thermophile life':(function(){const T=nearTree('pandan',-300,-120,6);return atTree(T,T.crownR*2.6+6,2.3,1.7,.45);})(),
 'The creek':(function(){const p=CREEK.P[Math.round(CREEK.P.length*.42)],q=CREEK.P[Math.round(CREEK.P.length*.36)];return[p[0]+18,gh(p[0]+18,p[1],3),p[1]+8,q[0],gh(q[0],q[1],0),q[1]];})(),
 'The basin at night':(function(){const c=[420,200],t=[-60,-260];return[c[0],gh(c[0],c[1],40),c[1],t[0],gh(t[0],t[1],10),t[1]];})(),
 'From above':[-1000,1250,1400,0,40,-120],
};
VMODE['The basin at night']='night';
VERUPT['Geyser Hill']='kettle';VERUPT['The Old Kettle erupting']='kettle';VERUPT['Grandmother']='grandmother';VERUPT['The Twins and the Lantern']='twins';VERUPT['The geyser basin']='grandmother';
// a preset that shows a geyser sets it off 8 s before the shot, so its column stands at its height
const goLight=k=>{setLightMode(VMODE[k]||'day');if(VERUPT[k]&&GEYSER.SHOW)GEYSER.erupt(VERUPT[k],GEYSER.SHOW.t-8);};   // the host's onView
// day and night; THE GEYSERS: set one off (the select), all of them, or run to the timetable (the default: each on its own clock)
const GSEL={select:LAYOUT.geysers.filter(g=>g.kind!=='spouter').map(g=>[g.key,g.name.replace(/ \(.*/,'')])};
const GCTL=[{button:'Day',on:()=>setLightMode('day')},{button:'Night',on:()=>setLightMode('night')},GSEL,
 {button:'Erupt',on:()=>GEYSER.erupt(GSEL.el.value,GEYSER.SHOW?GEYSER.SHOW.t:0)},
 {button:'Erupt all',on:()=>LAYOUT.geysers.forEach((g,i)=>GEYSER.erupt(g.key,(GEYSER.SHOW?GEYSER.SHOW.t:0)+i*1.5))}];
// the timetable: each geyser's phase and the seconds to its next column, in a panel of its own
KHOST.panel('timetable','The geysers',null,'right:14px;top:150px').appendChild(document.getElementById('tt'));
const ttEl=document.getElementById('tt');let ttText='',ttAcc=0;
function timetable(dt){ttAcc+=dt;if(ttAcc<.25||!GEYSER.SHOW)return;ttAcc=0;const t=GEYSER.SHOW.t;
 const s='THE GEYSERS (periods shortened)\n'+LAYOUT.geysers.filter(g=>g.kind!=='spouter').map(g=>{const c=GEYSER.cycle(g,t),nm=g.name.replace(/ \(.*/,'');
  return(nm+'                    ').slice(0,18)+(c.phase==='column'?'ERUPTING':c.phase==='steam'?'steam phase':c.phase==='pre'?'preplay':'resting')+(c.phase==='column'?'':'  next '+Math.ceil(c.next)+' s');}).join('\n');
 if(s!==ttText){ttText=s;ttEl.textContent=s;}}
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best2=null;for(const r of REG){if(r.r>900)continue;if(regHas(r,p.x,p.y,p.z)&&(!best2||r.r<best2.r))best2=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,kit=o.userData.kit||'';
 let name=isItem?lab+(best2?'  (under '+best2.name+')':''):(best2?best2.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&kit!=='hyperjungle'&&GEYSER.plantOfItem&&GEYSER.plantOfItem(item);
 const S=best2&&best2.key&&GEYSER.byKeyS&&GEYSER.byKeyS[best2.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const g=GEYSER.at(p.x,p.z,landH(p.x,p.z)),T=Math.round(g.T);
 const cls=best2&&best2.geyser?'a geyser: '+GEYSER.cycle(GEYSER.byKey(best2.geyser),GEYSER.SHOW?GEYSER.SHOW.t:0).phase:best2&&best2.spring?'a hot spring: scalding':best2&&best2.mud?'a mud pot':
  S||(isItem&&kit!=='hyperjungle')?'flora · the geyser kit'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='earth'?' · Earth\'s descendant, adapted to the heat':''):kit==='hyperjungle'?'flora · the hyperjungle':'terrain / water';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.heat+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':''):'')+
  '\nground: '+(g.spring?'hot water':g.terr>.5?'the Stair\'s travertine':g.acid>.5?'acid clay':g.mud>.5?'mud':g.dead>.5?'the dead forest (silica)':g.sinter>.5?'sinter':FIELD.floor(p.x,p.z)>.5?'the basin\'s warm ground':'the jungle')+
  ' · '+T+' degC'+(g.film>.3?' · the run-off':'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside each kit).
const BUDGET={
 showcase:{tris:26000000,calls:300},   // a ceiling, not a target (KNOWN_ISSUES)
 cls:{pass:16000000,host:900000},
 type:{'geyser/sinter':'pass','geyser/trees':'pass','geyser/floor':'pass','geyser/show':'pass','jungle/trees':'pass','jungle/floor':'pass','jungle/fauna':'pass','host':'host'},
};
// every instanced item: [x, y, z, its name, its kit]
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name,M.userData.kit||'']);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const ORIGINS=['earth','krator','native','dead'],HEATS=['splash','hot','warm','margin','acid','dead','water'];
const MINERAL=['biome:bead','biome:sinterknob','biome:stone','biome:boulder'];
const gk=p=>p[4]==='geyser';
const HCHK={
 // nothing lives in the hot water or on the scalding ground (over ~83 degC): only the sinter's own knobs and beads
 scald(P,T){const bp=P.filter(p=>gk(p)&&MINERAL.indexOf(p[3])<0&&GEYSER.at(p[0],p[2]).T>83&&p[1]<terrainH(p[0],p[2])+1.2),bt=T.filter(t=>GEYSER.at(t.x,t.z).T>70);
  return{ok:!bp.length&&!bt.length,detail:bp.length+bt.length?(bt.length+' trees and '+bp.length+' plants on scalding ground ('+[...new Set(bp.map(p=>p[3]))].slice(0,4).join(', ')+')'):'nothing on the scalding ground'};},
 // the run-off cools as it runs, and the big springs' runs reach out
 runoff(R){const bad=R.filter(c=>!(GEYSER.chT(c,0)>GEYSER.chT(c,c.len)+5)),long=R.filter(c=>c.len>=100).length;
  return{ok:!bad.length&&long>=4&&R.length>=12,detail:bad.length?bad.length+' channels that do not cool':R.length+' channels, '+long+' over 100 m, the Prism\'s from '+Math.round(GEYSER.chT(R[0],0))+' to '+Math.round(GEYSER.chT(R[0],R[0].len))+' degC'};},
 // every geyser erupts on its own cycle: a column at its height, a rest with none, the column its share of the period
 cycles(G){const bad=[];for(const g of G){if(g.kind==='spouter')continue;let mx=0,rest=0,col=0;const n=600;for(let i=0;i<n;i++){const c=GEYSER.cycle(g,g.off+i/n*g.period);mx=Math.max(mx,c.water);if(c.phase==='rest'&&c.water===0)rest++;if(c.phase==='column')col++;}
   if(mx<.9||!rest||Math.abs(col/n-g.dur/g.period)>.02)bad.push(g.key);}
  return{ok:!bad.length,detail:bad.length?'off their cycles: '+bad.join(', '):G.filter(g=>g.kind!=='spouter').length+' geysers on their cycles, periods '+G.filter(g=>g.period&&g.kind!=='spouter').map(g=>g.period).join('/')+' s'};},
 // a spring brims at its rim: its level at its rim's lowest ground and over its bowl's floor
 springs(S){const bad=S.filter(s=>{let lo=1e9;for(let k=0;k<32;k++){const a=k/32*TAU;lo=Math.min(lo,terrainH(s.x+Math.cos(a)*s.r*1.04,s.z+Math.sin(a)*s.r*1.04));}return Math.abs(lo-.04-s.level)>.3||terrainH(s.x,s.z)>s.level-.5;});
  return{ok:!bad.length,detail:bad.length?'off their rims: '+bad.map(s=>s.key).join(', '):S.length+' springs brim at their rims'};},
 // the Stair's pools step down to the sea, one under the next
 terraces(L){let dn=0,up=0,big=0;for(let i=1;i<L.length;i++){const d=L[i-1]-L[i];if(d>.01)dn++;if(d>1.5)big++;else if(d<-.45)up++;}
  return{ok:dn>=10&&up===0&&big>=3,detail:up?up+' pools climb':dn+' pools down the Stair, '+big+' tier walls over 1.5 m'};},
 // the dead forest: its snags stand in it, and nothing living of the kit's trees in its heart
 dead(T){const sn=T.filter(t=>GEYSER.SPECIES[t.sp].key==='snag'),out=sn.filter(t=>GEYSER.at(t.x,t.z).dead<.25),live=T.filter(t=>GEYSER.SPECIES[t.sp].key!=='snag'&&GEYSER.at(t.x,t.z).dead>.85);
  return{ok:sn.length>=30&&!out.length&&!live.length,detail:sn.length+' snags'+(out.length?', '+out.length+' out of the dead forest':'')+(live.length?', '+live.length+' living trees in its heart':'')};},
 // the hyperjungle walls the basin in: its trees round it, none on the floor
 jungle(P){const hj=P.filter(p=>p[4]==='hyperjungle'),on=hj.filter(p=>FIELD.floor(p[0],p[2])>.65&&p[1]<terrainH(p[0],p[2])+3);
  return{ok:hj.length>2000&&!on.length,detail:on.length?on.length+' jungle plants on the basin floor':hj.length+' jungle items round the basin'};},
 // the thermophiles: the warm ground's grass, ferns and clubmoss; streamers in the run-off; lilies on the warm water
 thermo(P){const c=n=>P.filter(p=>gk(p)&&p[3]==='biome:'+n),warm=c('grass').concat(c('fern'),c('clubmoss')).filter(p=>{const h=GEYSER.at(p[0],p[2]).heat;return h>.04;}).length,
  st=c('streamer').filter(p=>GEYSER.at(p[0],p[2]).film>.2).length,li=c('lily').length;
  return{ok:warm>=600&&st>=150&&li>=60,detail:warm+' thermophile tufts on warm ground, '+st+' streamers in the run-off, '+li+' kettle lilies'};},
 placed(C){const zero=GEYSER.SPECIES.filter((S,i)=>!(C[i]>0)).map(S=>S.key);
  return{ok:!zero.length,detail:zero.length?'never placed: '+zero.join(', '):GEYSER.SPECIES.length+' species, the scarcest '+Math.min(...C)};},
 tagged(L){const reg=Object.keys(GEYSER.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||HEATS.indexOf(t.heat)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(GEYSER.PLANTS).map(k=>Object.assign({key:k},GEYSER.PLANTS[k]));
const counts=T=>T.reduce((C,t)=>{C[t.sp]++;return C;},GEYSER.SPECIES.map(()=>0));
// the Stair's pools' levels down its axis (a pool lower than the one above it, or level with it; a climb is a fault)
const stairLevels=()=>{const t=LAYOUT.terraces[0],L=[];let last=null;for(let z=STAIR.z0+130;z<shoreZ(STAIR.x0)-30;z+=1){const x=stairX(z)+20;if(terraceMask(x,z)<.99)continue;
 const q=GEYSER.poolAt(t,x,z);if(q.A&&!q.A.sea&&q.A!==last){L.push(q.A.L);last=q.A;}}return L;};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints(),T=GEYSER.TREES||[];
 add('nothing lives on the scalding ground',HCHK.scald(P,T));
 add('the run-off cools as it runs',HCHK.runoff(LAYOUT.runoff));
 add('every geyser erupts on its own cycle',HCHK.cycles(LAYOUT.geysers));
 add('the springs brim at their rims',HCHK.springs(LAYOUT.springs));
 add('the Stair steps down to the sea',HCHK.terraces(stairLevels()));
 add('the dead forest stands dead',HCHK.dead(T));
 add('the hyperjungle walls the basin in',HCHK.jungle(P));
 add('thermophiles on the warm ground and the run-off',HCHK.thermo(P));
 add('every species of the kit placed',HCHK.placed(counts(T)));
 add('every species and plant tagged',HCHK.tagged(GEYSER.SPECIES.concat(plantList())));
 add('preset cameras clear of the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),s=LAYOUT.springs[0],T=GEYSER.TREES||[];
 add('a fern in the Great Prism',HCHK.scald([[s.x,terrainH(s.x,s.z),s.z,'biome:fern','geyser']],[]));
 add('a channel that warms as it runs',HCHK.runoff(LAYOUT.runoff.map((c,i)=>i?c:Object.assign({},c,{T0:20}))));
 add('a geyser with no column',HCHK.cycles(LAYOUT.geysers.map((g,i)=>i?g:Object.assign({},g,{dur:0,_c:null}))));
 add('a spring 2 m over its rim',HCHK.springs([Object.assign({},s,{level:s.level+2})]));
 add('a Stair that climbs',HCHK.terraces(stairLevels().reverse()));
 add('a snag out on the open floor',HCHK.dead(T.concat([{sp:GEYSER.SPECIES.findIndex(S=>S.key==='snag'),x:0,z:-100}])));
 add('a jungle tree on the floor',HCHK.jungle(instPoints().concat([[BASIN.x,terrainH(BASIN.x,BASIN.z),BASIN.z,'biome:trunk','hyperjungle']])));
 add('no thermophiles',HCHK.thermo([]));
 {const C=counts(T);C[0]=0;add('a species never placed',HCHK.placed(C));}
 add('a species with no origin',HCHK.tagged(GEYSER.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-2,z:0}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(timetable);
// the geysers' particles keep their size on screen
KHOST.on(function geyserScale(){if(GEYSER.SHOW)GEYSER.SHOW.setScale(innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360)));},'view');
let HOSTED=null;
HOSTED=KHOST.take({build:'geyser',title:'Krator biome — the geyser basin (the Steampits)',
 hint:"The geyser basin: a basin in the Steampits on the Ring Sea's north shore (~1.5 km below the datum, ~1.9 atm, ~33 °C), cut into the hyperjungle. Geysers on sinter cones erupting on their own cycles, prismatic springs with mat-banded run-off, mud pots and fumaroles, travertine terraces stepping down to the sea, a dead forest drowned in silica at the edges, and the thermophile life of the warm ground (ideal type). N for night, G erupts the geyser nearest the view",
 scene,camera,renderer,ground:terrainH,floor:(x,z)=>Math.max(terrainH(x,z),waterH(x,z)),clear:1.6,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 onView:goLight,controls:GCTL,
 // N: night; G sets off the geyser nearest the view (it wins over the host's G, fly to the pin: KNOWN_ISSUES.md)
 keys:{n:()=>setLightMode(LIGHT_MODE==='night'?'day':'night'),
  g:()=>{if(!GEYSER.SHOW)return;const T=HOSTED.ctl.target;let b=null,bd=1e9;for(const g of LAYOUT.geysers){if(g.kind==='spouter')continue;const d=Math.hypot(g.x-T.x,g.z-T.z);if(d<bd){bd=d;b=g;}}if(b)GEYSER.erupt(b.key,GEYSER.SHOW.t);}},
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},objects:()=>[sky,giant,giantRing]},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 setLightMode,
 biome:()=>window._biome,records:()=>GEYSER.records(),erupt:k=>GEYSER.erupt(k,GEYSER.SHOW?GEYSER.SHOW.t:0),
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const g=GEYSER.at(x,z);['T','heat','sinter','film','acid','dead','spray','terr','bw'].forEach(k=>o[k]=+(+g[k]).toFixed(3));return o;}}});
