// ================================================================= HOST — the station's views, the inspector's words and the probe's checks, handed to core/host
// The camera, the loop, the panel and window._api are core/host's; this fragment says what this page has. The presets are FOUND from the layout
// (the greatest live mouth, a husk, the mirror lung if the station has one), and three of them carry the hour of the breath they show:
// the first ten seconds before dawn, the noon draw, and a clear winter night (PLAN.md section 11, station 1's three presets).
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const LIVE=LUNG_L.mouths.filter(M=>M.live&&!M.mirror).sort((a,b)=>b.yield-a.yield||(a.id<b.id?-1:1));
const M0=LIVE[0]||LUNG_L.mouths[0],HUSKM=LUNG_L.mouths.find(M=>!M.live),MIRL=LUNG_L.lungs.find(l=>l.mirror),LAWN0=LUNG_L.lawns.find(W=>M0&&W.lung===M0.lung)||LUNG_L.lawns[0];
const SITES=LUNG.sites(LUNG_L);window.LUNG_SITES=SITES;   /* section 9: the wells and the hamlet's place, plain data for core/hamlet */
const VIEW_TIME={};
const VIEWS={};
const addView=(name,v,time)=>{if(!v||v.some(n=>!isFinite(n)))return;VIEWS[name]=v;if(time)VIEW_TIME[name]=time;};
if(typeof STATION_VIEWS==='function')STATION_VIEWS(addView,{gh,look,M0,HUSKM,MIRL,LAWN0});
else if(M0){const lx=M0.lean[0],lz=M0.lean[1];
 /* the first ten seconds: on rimed turf behind the lip, the giant over a white sea of cloud filling the north, the mouths along the lip about to steam */
 {const cx=M0.x+lx*70+35,cz=M0.z+lz*70+20;addView('The first ten seconds (before dawn)',[cx,gh(cx,cz,1.7),cz,M0.x+1100,gh(cx,cz,-260),M0.z-2600],{hour:5.9});}
 {const cx=M0.x+lx*38-12,cz=M0.z+lz*38;addView('Dawn: the mouths begin to steam',[cx,gh(cx,cz,2.2),cz,M0.x,gh(M0.x,M0.z,M0.r*1.6),M0.z],{hour:6.9});}
 {const cx=M0.x+260,cz=M0.z+300;addView('Noon: a cap cloud over every mouth',[cx,gh(cx,cz,60),cz,M0.x-400,gh(M0.x-400,M0.z,40),M0.z-200],{hour:12.5});}
 {const cx=M0.x+lx*30+8,cz=M0.z+lz*30;addView('A clear winter night: the mouths steam the wrong way',[cx,gh(cx,cz,2.5),cz,M0.x,gh(M0.x,M0.z,M0.r),M0.z],{hour:2,day:MIDWINTER});}
 {const W=M0.well;addView('A mouth and its well (uelos)',look(W.x+W.r*4,W.z+W.r*3,3.5,M0.x,M0.z,M0.r*.8));}
 addView('Into a mouth: the throat comb',[M0.x+lx*2,gh(M0.x,M0.z,M0.r*3.4),M0.z+lz*2+.5,M0.x,gh(M0.x,M0.z,M0.r*.3),M0.z]);
 if(LAWN0){const cx=LAWN0.x+LAWN0.az*LAWN0.w*.9,cz=LAWN0.z-LAWN0.ax*LAWN0.w*.9;addView('The fall-out lawn (Gunglomagos)',look(cx,cz,1.8,LAWN0.x,LAWN0.z,.3));}
 {const cx=M0.x-30,cz=rimZ(M0.x-30)-15;addView('Down the face: the lungs into the cloud',[cx,gh(cx,cz,30),cz,cx-120,CLOUD_Y+250,cz-1400]);}
 {const cz=rimZ(0)-SCARP.run*.78,cx=M0.x+180;addView('Up the face from the cloud',[cx,Math.max(gh(cx,cz,40),CLOUD_Y+90),cz,M0.x,gh(M0.x,M0.z,20),M0.z]);}
 if(HUSKM)addView('A husk\'s top on the lip',look(HUSKM.x+18,HUSKM.z+22,2.5,HUSKM.x,HUSKM.z,HUSKM.r));
 if(MIRL&&MIRL.mouth){const Mm=LUNG_L.mouths.find(m=>m.id===MIRL.mouth);addView('The mirror lung (Levtobređos)',look(Mm.x+25,Mm.z+18,3,Mm.x,Mm.z,Mm.r));}
 addView('From afar',look(-2300,2300,160,300,-400,40));}
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,item=isItem?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&(LUNG.plantOfItem(item)||(typeof SHIGH!=='undefined'?SHIGH.plantOfItem(item):null));
 const S=best&&best.key?LUNG.byKey[best.key]:null,tg=S?S.tags:(PLT?PLT.tags:null);
 let name=isItem?lab+(best?'  (in '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 const cls=S||(item&&/^l/.test(item))?'flora · cliff lungs · native (alien)':isItem?'flora · southern highlands (read in place)':'terrain / water';
 const hand=best&&best.hand!=null?(best.hand<0?'  ·  MIRROR-HANDED (left)':'  ·  right-handed'):'';
 const air=LUNG.atmAt(p.y);
 const hz=typeof KTAGS!=='undefined'&&KTAGS.hazardAt?KTAGS.hazardAt(p.x,p.y,p.z):'';
 return name+'\n'+cls+hand+(tg?'\n'+tg.climate+' · '+tg.aridity+' · spiral: '+tg.spiral+' · Koppen '+tg.koppen.join(' '):'')+(S&&S.how?'\n'+S.how:PLT&&PLT.how?'\n'+PLT.how:'')+
  '\nthe air here '+air.toFixed(2)+' atm (the '+LUNG.bandAt(Math.min(1.6,air)).name+' band)  ·  the breath now '+(window._breath?window._breath.b.toFixed(2):'?')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m'+(hz?'\n'+hz:'');}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert; PLAN.md section 16, L6)
const BUDGET={showcase:{tris:16000000,calls:160},cls:{pass:12000000,host:1500000},
 type:{'shigh/trees':'pass','shigh/floor':'pass','lung/lungs':'pass','lung/meadow':'pass','host':'host'}};
const RINGVOL=()=>REG.filter(r=>r.key==='ring');
const breathAt=(hour,day,W)=>LUNG.breath((day==null?STN.day:day)+hour/24,Object.assign({wet:.9,cloud:.12,wind:7,summer:KCLOCK.season(day==null?STN.day:day,hour).summer},W||{}));
const STEAM_EM={mouths:LIVE_M.map(M=>[M.x,M.z]),bells:LIVE_B.map(B=>[B.x,B.z])};
const steamK=b=>({mouths:Math.min(1,3*Math.max(b,0)),caps:1.2*smooth(.45,.9,b),back:.5*clamp(-b/.2,0,1),bells:clamp(-b/.2,0,1)});
const HCHK={
 // every ring's band is LUNG.bandAt of its birth pressure (the records and the volumes the inspector reads)
 bands(L,V){const bad=[];L.lungs.forEach(l=>l.rings.forEach(R=>{if(R.band!==LUNG.bandAt(R.atm).i)bad.push(R.id);}));V.forEach(v=>{if(v.band!==LUNG.bandAt(v.atm).i)bad.push(v.ring);});
  const n=L.lungs.reduce((s,l)=>s+l.rings.length,0);return{ok:!bad.length&&n>0,detail:bad.length?bad.length+' rings off their band (first '+bad[0]+')':n+' rings, '+V.length+' drawn volumes, each in the band of its birth pressure'};},
 // every lung's rings are monotone in height and pressure, foot to tip
 mono(L){const bad=L.lungs.filter(l=>l.rings.some((R,i)=>i&&(R.a[1]<l.rings[i-1].a[1]-1e-6||R.atm>l.rings[i-1].atm+1e-9))).map(l=>l.id);
  return{ok:!bad.length&&L.lungs.length>0,detail:bad.length?'out of order: '+bad.join(', '):L.lungs.length+' lungs, every one climbing and thinning foot to tip'};},
 // every hazard's state equals LUNG.breath's, at noon, dawn, dusk and a winter night
 hazards(shift){const T=KHAZ.list(),own=T.filter(r=>{const h=KHAZ.of(r);return h&&h.stateFn==='LUNG.breath';});const now=LUNG.now;let bad=0,n=0;
  try{for(const tt of[[12.5,STN.day],[6.9,STN.day],[18.6,STN.day],[2,MIDWINTER]]){const t=tt[1]+tt[0]/24,W={wet:.9,cloud:.12,wind:7,summer:KCLOCK.season(tt[1],tt[0]).summer},b=LUNG.breath(t+(shift||0),W);
    LUNG.now=()=>[t,W];for(const r of own){const h=KHAZ.of(r),s=KHAZ.state(r,0),e=LUNG.roleK(LUNG.roleOf(h),b);n++;if(s.k!==e.k||s.state!==e.state)bad++;}}}finally{LUNG.now=now;}
  return{ok:own.length>0&&!bad,detail:own.length+' hazards on the breath ('+[...new Set(own.map(r=>KHAZ.of(r).kind))].join(', ')+'); '+bad+' of '+n+' states off LUNG.breath at noon, dawn, dusk and a winter night'};},
 // the noon preset shows steam at every live mouth and none at a husk
 noonSteam(em,b){const k=steamK(b),husks=LUNG_L.mouths.filter(M=>!M.live),live=LUNG_L.mouths.filter(M=>M.live);
  const miss=live.filter(M=>!em.mouths.some(e=>Math.hypot(e[0]-M.x,e[1]-M.z)<3)).length,atHusk=husks.filter(M=>em.mouths.some(e=>Math.hypot(e[0]-M.x,e[1]-M.z)<10)).length;
  return{ok:k.mouths>.9&&k.caps>.5&&!miss&&!atHusk&&live.length>0,detail:'at noon (breath '+b.toFixed(2)+') steam '+k.mouths.toFixed(2)+', cap clouds '+k.caps.toFixed(2)+'; '+(live.length-miss)+' of '+live.length+' live mouths steaming, '+atHusk+' of '+husks.length+' husks'};},
 // the winter-night preset shows it at the bells (and the mouths' faint back-steam)
 winterSteam(em,b){const k=steamK(b),bells=LUNG_L.bells.filter(B=>B.live),miss=bells.filter(B=>!em.bells.some(e=>Math.hypot(e[0]-B.x,e[1]-B.z)<3)).length;
  return{ok:b<-.1&&k.bells>.5&&!miss&&k.back>0,detail:'on a clear winter night (breath '+b.toFixed(2)+') the cold breath '+k.bells.toFixed(2)+' at '+(bells.length-miss)+' of '+bells.length+' bells'+(bells.length?'':' (no bell on this station)')+', the mouths\' back-steam '+k.back.toFixed(2)};},
 // nothing of shighlands roots on the cliff weight but a lung
 cliff(T,L){if(typeof SHIGH==='undefined'||!SHIGH.zones)return{ok:true,detail:'no southern highlands on this page'};
  const bad=T.filter(t=>SHIGH.zones(t.x,t.z).cliff>.5);let on=0;L.lungs.forEach(l=>l.pts.forEach(p=>{if(p[1]>CLIP_Y&&SHIGH.zones(p[0],p[2]).cliff>.5)on++;}));
  return{ok:!bad.length&&on>0,detail:bad.length?bad.length+' trees on the cliff weight (first at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' trees, none on the cliff weight; '+on+' lung points on it'};},
 // the mirror lungs under one in thirty, by the rule, and every lung's hand the rule's
 mirror(L,rule){let n=0;const N=30000;for(let i=0;i<N;i++)if(rule(L.world,i)<0)n++;const off=L.lungs.filter((l,i)=>l.hand!==rule(L.world,+l.id.slice(4))).map(l=>l.id);
  return{ok:n>0&&n/N<1/30&&!off.length,detail:'the rule: '+n+' mirror in '+N+' ('+(n/N*100).toFixed(2)+'%); '+L.lungs.filter(l=>l.mirror).length+' of '+L.lungs.length+' on this station'+(off.length?'; off the rule: '+off.join(', '):'')};},
 // the deck and the breath read one day: the deck's day is LUNG.DECK's hours
 deck(rec){if(!DECK)return{ok:true,detail:'no cloud deck on this station'};const d=rec&&rec.day;
  return{ok:!!d&&d.high===LUNG.DECK.high&&d.low===LUNG.DECK.low,detail:d?'the deck laps highest at '+d.high+' h and burns back to '+d.low+' h; LUNG.DECK '+LUNG.DECK.high+'/'+LUNG.DECK.low:'the deck has no day'};},
 // NOTHING GLOWS (the owner, 2026-11-02): no material of the kit's is emissive or additive
 glow(mats){const bad=mats.filter(m=>m.blending===THREE.AdditiveBlending||(m.emissive&&(m.emissive.r+m.emissive.g+m.emissive.b)>0)||(m.emissiveIntensity>0&&m.emissiveMap));
  return{ok:!bad.length&&mats.length>0,detail:bad.length?bad.length+' glowing materials ('+bad.map(m=>m.name||m.type).join(', ')+')':mats.length+' lung materials, none emissive or additive'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
const lungMats=()=>{const s=new Set();scene.traverse(o=>{if(o.isInstancedMesh&&/^biome:l/.test(o.name||'')){const m=o.material;(Array.isArray(m)?m:[m]).forEach(x=>s.add(x));}});return [...s];};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),T=typeof SHIGH!=='undefined'?SHIGH.TREES:[];
 add('every ring\'s band is LUNG.bandAt of its birth pressure',HCHK.bands(LUNG_L,RINGVOL()));
 add('every lung\'s rings climb and thin, foot to tip',HCHK.mono(LUNG_L));
 add('every hazard\'s state is LUNG.breath\'s',HCHK.hazards(0));
 add('the noon preset: steam at every live mouth, none at a husk',HCHK.noonSteam(STEAM_EM,breathAt(12.5)));
 add('the winter-night preset: the cold breath at the bells',HCHK.winterSteam(STEAM_EM,breathAt(2,MIDWINTER)));
 add('nothing of the southern highlands roots on the cliff weight but a lung',HCHK.cliff(T,LUNG_L));
 add('the mirror lungs under one in thirty, by the rule',HCHK.mirror(LUNG_L,LUNG.hand));
 add('the cloud deck and the breath read one day',HCHK.deck(DECK&&DECK.record));
 add('nothing glows',HCHK.glow(lungMats()));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 const L2=JSON.parse(JSON.stringify(LUNG_L));L2.lungs[0].rings[0].band+=2;add('a ring painted two bands off',HCHK.bands(L2,[]));
 const L3=JSON.parse(JSON.stringify(LUNG_L));L3.lungs[0].rings.reverse();add('a lung whose rings run tip to foot',HCHK.mono(L3));
 add('the hazards read against a breath six hours off',HCHK.hazards(.25));
 add('steam at a husk',HCHK.noonSteam({mouths:STEAM_EM.mouths.concat(LUNG_L.mouths.filter(M=>!M.live).map(M=>[M.x,M.z])).concat(LUNG_L.mouths.length&&!LUNG_L.mouths.some(M=>!M.live)?[[0,0]]:[]),bells:STEAM_EM.bells},LUNG_L.mouths.some(M=>!M.live)?breathAt(12.5):breathAt(18.6)));
 add('the cold breath looked for at noon',HCHK.winterSteam(STEAM_EM,breathAt(12.5)));
 if(typeof SHIGH!=='undefined'&&SHIGH.zones){let bx=0,bz=0,bs=-1;LUNG_L.lungs.forEach(l=>l.pts.forEach(p=>{const c=SHIGH.zones(p[0],p[2]).cliff;if(c>bs){bs=c;bx=p[0];bz=p[2];}}));
  add('a tree on the steepest cliff a lung stands on',HCHK.cliff([{x:bx,z:bz,sp:0}],LUNG_L));}
 add('one lung in two mirror-handed',HCHK.mirror(LUNG_L,(w,i)=>i%2?-1:1));
 add('a deck on its own hours',HCHK.deck(DECK?{day:Object.assign({},DECK.record.day,{high:LUNG.DECK.high+3})}:null));
 add('a glowing lung',HCHK.glow([new THREE.MeshBasicMaterial({blending:THREE.AdditiveBlending,name:'test glow'})]));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-3,z:0}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');
const LUNG_HZ_LAYER=typeof KTAGS!=='undefined'&&KTAGS.hazardLayer?KTAGS.hazardLayer({scene}):null;
KHOST.take({build:'clifflung'+(STN.key==='mouths'?'':'-'+STN.key),title:STN.title,
 hint:"The Cliff Lungs: native colonies that lie up the southern Inner Wall's face from the cloud sea to the paramo and breathe the jungle's air up through themselves, on the heat it gives back as it condenses and the sun on their skins. "+STN.name+". Set the hour: dawn steams, noon roars, dusk is silent, a clear winter night runs backward. Nothing glows (ideal type)",
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 onView:k=>{const T=VIEW_TIME[k];if(T&&KHOST.host){KHOST.host.clock.hour=T.hour;KHOST.host.clock.day=T.day==null?STN.day:T.day;}},
 clock:{hour:STN.hour,day:STN.day},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances+'  ·  breath '+(window._breath?window._breath.b.toFixed(2):'?'),
 layers:Object.assign({'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)}},LUNG_HZ_LAYER?{'hazards':LUNG_HZ_LAYER}:{}),
 exporters:{biome:()=>BIO.export(),sites:()=>SITES},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome,lungs:()=>window._lungs,layout:()=>LUNG_L,sites:()=>SITES,breath:()=>window._breath,
 atmos:()=>ATMOS.export(),field:()=>FIELDK.export({box:[-400,-400,400,400]}),
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),atm:+LUNG.atmAt(terrainH(x,z)).toFixed(3)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
