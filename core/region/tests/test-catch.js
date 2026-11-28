// node core/region/tests/test-catch.js — the Catch, its oases and the Twins on core/simulation (steps C0-C2 of
// core/simulation/PROPOSAL-CATCH.md; the owner, 2026-11-16). C0: the crossing's places (core/region/data/catch-tune.js)
// declared by core/region's valley host at the abstract level, on their own make and a stocked start, for a year. C1: a
// round whose legs take their own time (SIM.trade's `legs`). C2: a caravan's beasts watered and fed at each stop
// (SIM.trade's `provision`), and a dry oasis that costs it beasts. Each negative is a pair (tools/ktest.js).
const fs=require('fs'),path=require('path');
const T=require('../../../tools/ktest.js')(__filename);
global.window=global;
const ROOT=path.join(__dirname,'..','..','..'),rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const load=()=>{(0,eval)(rd('core/clock/20-core-clock.js'));
 fs.readdirSync(path.join(ROOT,'core','simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().forEach(f=>(0,eval)(rd('core/simulation/'+f)));
 (0,eval)(rd('core/region/00-region-core.js'));const H={TUNE:{sim:{}}};KREGION.use(H);(0,eval)(rd('core/region/50-region-valley.js'));
 (0,eval)(rd('core/region/data/catch-tune.js'));return H;};
const t=n=>(n/1000).toFixed(1)+' t',STAIR='s2o8f4p123';
function run(days,edit){const H=load(),V=CATCH_TUNE.valley({});if(edit)edit(V);const S=H.simValley(V);
 const a=SIM.ledgerSnap();H.valleyRun(days*1440,60);const b=SIM.ledgerSnap(),sites={};
 S.order.forEach(s=>(SIM.sitesReport(s)||[]).forEach(x=>{sites[x.id]=Object.assign({settlement:s},x);}));
 return{H,V,S,B:H.valleyBooks().towns,trade:SIM.tradeReport()||{},ledger:SIM.ledger(a,b,{tol:1}),sites};}
const t0=Date.now(),Y=run(365),B=Y.B;
console.log('a year of the Catch in '+((Date.now()-t0)/1000).toFixed(1)+' s: '+Y.S.order.length+' settlements, '+Y.V.settlements.reduce((n,s)=>n+s.people,0)+' people');

// ---- C0: the places
// 1. declared: Stair and its Brotherhood house, the oases (Kolli's and Lasso's two keepers each), the salt works, the six
//    Twins stations, the White Gills; Stair's 750 and the oases at the owner's numbers
{const P=id=>Y.V.settlements.find(s=>s.id===id),pp=ids=>ids.reduce((n,id)=>n+(P(id)?P(id).people:0),0);
 const good=Y.S.order.length===17&&!Y.S.problems.length&&pp([STAIR,'horns.stair'])===750&&pp(['scatchkolli01','scatchkolli01.goldanda'])===80&&
  pp(['scatcharfwai01'])===60&&pp(['scatchbitta01'])===40&&pp(['scatchlasso01','scatchlasso01.geo'])===100;
 T.ok('the Catch declared: Stair 750 with the Brotherhood\'s house, Kolli 80, Arfwai 60, Bitta 40, Lasso 100, the salt works, Bab al-Hawa 120, the Twins\' six stations, the White Gills; no problems',good,
  Y.S.order.length+' settlements; problems: '+(Y.S.problems.slice(0,3).join('; ')||'none'));}
// 2. the year's books balance
T.ok('the year\'s books balance, every settlement and good',Y.ledger.ok,Y.ledger.ok?'all goods':Y.ledger.problems.slice(0,3).join('; '));
// 3. fed and watered: no place goes without more than 1 % of its grain or its water over the year (the stocked start)
const fedCheck=Bk=>{const bad=[];Object.keys(Bk).forEach(s=>{const x=Bk[s];if(!x.people)return;['grain','water'].forEach(g=>{const e=x.eaten[g]||0,h=x.hungry[g]||0;if(h>(e+h)*.01)bad.push(s+' '+g+' '+(100*h/(e+h)).toFixed(1)+'%');});});return{ok:!bad.length,bad};};
{const f=fedCheck(B);T.ok('every place fed and watered all year (under 1 % short)',f.ok,f.bad.slice(0,4).join('; ')||'none short');
 const D=run(30,V=>{const s=V.settlements.find(x=>x.id==='scatchbitta01');s.works.find(w=>w.kind==='well').site={kind:'aquifer',amount:0,regen:0};s.start.water=0;});
 T.neg('an oasis whose aquifer is dry goes thirsty',Bk=>fedCheck(Bk).ok,D.B,B);}
// 4. the wells: each draws only what is used (its cistern full, its aquifer whole at the year's end), and Stair's springs
//    hold the town's water many times over
{const wells=Object.values(Y.sites).filter(x=>x.kind==='aquifer'),low=wells.filter(x=>x.amount<x.start*.5);
 const st=B[STAIR],made=st.made.water||0,used=st.used.water||0;
 const good=wells.length===16&&!low.length&&made>=used;
 T.ok('16 wells draw what their people use and hold their aquifers (none under half at the year\'s end)',good,
  wells.length+' wells; low: '+(low.map(x=>x.settlement+' '+Math.round(x.amount)).join(', ')||'none')+'; Stair drew '+Math.round(made/1000)+' m3, used '+Math.round(used/1000)+' m3');}
// 5. the salt works: the Train's pans make the year's salt, soda, potash, saltpeter and gypsum in the cool months
const pansCheck=Bk=>{const m=Bk.svhmyhf33w.made,P=CATCH_TUNE.places.find(p=>p.id==='svhmyhf33w').pans;return Object.keys(P).every(g=>(m[g]||0)>=P[g]*.8&&(m[g]||0)<=P[g]*1.1);};
{const m=B.svhmyhf33w.made;T.ok('the salt works make their season: salt, soda, potash, saltpeter and gypsum within a fifth of the plan',pansCheck(B),
  ['salt','soda','potash','saltpeter','gypsum'].map(g=>g+' '+t(m[g]||0)).join(', '));
 const D=run(365,V=>{V.calendar={windows:{pans:[300,301]}};});
 T.neg('pans that are only worked a day make too little',pansCheck,D.B,B);}

// ---- C1 and C2: a caravan round with legs of their own length, its beasts provisioned at each stop. A test round: Stair,
//      Bitta, Lasso, Catch-Lookout Spring and back (44, 39, 59 and about 65 km at a pack train's 30 km a day), carrying
//      nothing (each stop sends no goods), so only its beasts draw on the places
const LEGS=[2160,1872,2880,3168],STOPS=[STAIR,'scatchbitta01','scatchlasso01','twins.lookout'],STAY=60;
const caravan=(o)=>V=>{V.roads.push(Object.assign({id:'test.caravan',stops:STOPS,legs:LEGS,cap:12000,carriers:1,want:10,goods:Object.fromEntries(STOPS.map(s=>[s,[]]))},o||{}));};
/* the departures a timer carrier makes by the end of `mins`: the host's first step is at minute 60, then it waits its
   stay at stop 0, then leg, stay, leg ... */
const expectVoyages=(legs,mins)=>{let m=60+STAY,i=0,n=0;while(m<=mins){n++;m+=legs[i]+STAY;i=(i+1)%legs.length;}return n;};
{const C=run(30,caravan()),R=C.trade['test.caravan'],want=expectVoyages(LEGS,30*1440);
 T.ok('C1: a round whose legs take their own time (2, 1.3, 2 and 2.2 days) sails as many legs in 30 days as its timetable gives',R&&R.voyages===want,
  (R?R.voyages:'none')+' voyages, the timetable '+want);
 const U=run(30,caravan({legs:undefined,minutes:LEGS[0]})),RU=U.trade['test.caravan'];
 T.neg('a round on one passage time for every leg is caught',x=>x&&x.voyages===want,RU,R);}
{const C=run(60,caravan({provision:CATCH_TUNE.caravan})),R=C.trade['test.caravan'],P=R&&R.provisioned||{};
 const allFed=r=>r&&STOPS.every(s=>(r.provisioned[s]||{}).water>0&&(r.provisioned[s]||{}).fodder>0)&&r.died===0;
 T.ok('C2: the caravan\'s 40 beasts water and feed at every stop of its round, and none die',allFed(R),
  STOPS.map(s=>s+' '+Math.round(((P[s]||{}).water||0)/1000)+' m3 water, '+t((P[s]||{}).fodder||0)+' fodder').join('; ')+'; died '+(R?R.died:'?'));
 /* the oases' books carry the draw: Bitta's water used is its people's and the caravan's */
 const bitta=C.B.scatchbitta01,drew=(P.scatchbitta01||{}).water||0,own=40*8*60;
 T.ok('C2: the oases sell what the beasts drink: Bitta\'s water used is its own people\'s and the caravan\'s',Math.abs((bitta.used.water||0)-drew-own)<=own*.05+60,
  'used '+Math.round(bitta.used.water||0)+' l; the caravan '+Math.round(drew)+', its people about '+own);
 const D=run(60,V=>{caravan({provision:CATCH_TUNE.caravan})(V);const s=V.settlements.find(x=>x.id==='scatchbitta01');
  s.works.forEach(w=>{if(w.kind==='well')w.site={kind:'aquifer',amount:0,regen:0};if(w.kind==='reed-bed')w.site={kind:'reeds',amount:0,regen:0};});s.start.water=0;s.start.fodder=0;}),RD=D.trade['test.caravan'];
 const lost=r=>r&&r.died>0&&(r.dry.scatchbitta01||{}).water>0&&r.remounted>0;
 T.ok('C2: a dry oasis costs a caravan: at a dry Bitta its beasts go unwatered, half the unwatered die, and it remounts at home',lost(RD),
  RD?'died '+RD.died+', remounted '+RD.remounted+', short at Bitta '+Math.round(((RD.dry.scatchbitta01||{}).water||0)/1000)+' m3':'no route');
 T.neg('a caravan that loses no beasts at a dry oasis is caught',lost,R,RD);}
/* S3-87a: a loss with `every: 0` is read as every passage (1), so `spare` still holds: `every: 0, spare: 1` spares every passage.
   It was (n - 1) % 0 = NaN, never under `spare`, so every passage killed */
{const lossRun=o=>run(30,caravan({provision:CATCH_TUNE.caravan,losses:[Object.assign({legs:[0,1,2,3],share:.1,why:'test'},o)]})),
  dead=C=>(C.S.losses['test.caravan']||[]).length;
 const Z=lossRun({every:0,spare:1}),K=lossRun({every:1,spare:0});
 T.ok('a loss with every 0 and spare 1 spares every passage: no beasts lost in 30 days',dead(Z)===0,dead(Z)+' losses');
 T.neg('the loss count tells a spared caravan from one losing beasts on every passage',C=>dead(C)===0,K,Z);}

// ---- C3-C5: the crossing joined to Xanadu (CATCH_TUNE.join): the groups' caravans in place of Xanadu's four Catch
//      gateways, the Twins' routes and tally, the seasons and hazards. A year, every departure recorded by the hour
const PLAN=JSON.parse(rd('openworld/xanadu-oidong-highrift/plan/sites.json'));
function runJoined(days,o,edit){const H=load();(0,eval)(rd('core/region/data/xan-tune.js'));
 const V=CATCH_TUNE.join(XAN_TUNE.valley(PLAN,{}),o);if(edit)edit(V);const S=H.simValley(V),deps=[],seen={};
 const a=SIM.ledgerSnap();
 for(let h=0;h<days*24;h++){H.valleyRun(60,60);const m=S.clock.m;
  Object.keys(SIM.TRADE.routes).forEach(id=>{if(!/^caravan\./.test(id)||!SIM.TRADE.routes[id].legs)return;SIM.TRADE.routes[id].carriers.forEach(C=>{const k=id+'#'+C.k;
   if(C.phase==='sail'&&seen[k]!==C.from+'@'+C.eta){seen[k]=C.from+'@'+C.eta;const dm=C.eta-(SIM.TRADE.routes[id].legs[C.from]);deps.push({id,k:C.k,from:C.from,m:dm,storm:SIM.inSeason('storms',dm),col:SIM.inSeason('col',dm)});}});});}
 const b=SIM.ledgerSnap(),Bk=H.valleyBooks().towns;
 const site=SIM.econ('scatcharfwai01').resSites['scatcharfwai01.well.site'],dry={regen:site?site.regen:null,open:SIM.inSeason('dry',S.clock.m)};
 return{H,V,S,B:Bk,deps,dry,trade:SIM.tradeReport(),ledger:SIM.ledger(a,b,{tol:1}),cuts:JSON.parse(JSON.stringify(S.cuts)),losses:JSON.parse(JSON.stringify(S.losses||{}))};}
const t1=Date.now(),J=runJoined(365),JB=J.B,road=id=>J.V.roads.find(r=>r.id===id);
console.log('a year of Xanadu and the Catch joined in '+((Date.now()-t1)/1000).toFixed(0)+' s: '+J.S.order.length+' settlements');
const GROUPS=CATCH_TUNE.groups.map(g=>'caravan.'+g.id),landedAt=(Tr,ids,at)=>{const o={};ids.forEach(id=>{const L=(Tr[id]||{}).landed||{};Object.keys(L).forEach(l=>{if(l.split('>')[1]!==at)return;for(const g in L[l])o[g]=(o[g]||0)+L[l][g];});});return o;};
// C3. 1: the gateways' long roads are gone, the five groups' rounds and the Train's salt run are on, no problems
{const ids=J.V.roads.map(r=>r.id),good=!ids.some(i=>/^trade\.gate\.(iziz|dasri|yuni|geomancers)$/.test(i))&&GROUPS.concat(['caravan.train.salt']).every(i=>ids.indexOf(i)>=0)&&!J.S.problems.length;
 T.ok('C3: Xanadu\'s four Catch gateways become the five groups\' caravan rounds (Getmastarz, Goldanda, the Train, Yuni\'s Guild, the Geomancers) and the Train\'s salt run; no problems',good,
  ids.filter(i=>/^caravan\./.test(i)).join(', ')+'; problems: '+(J.S.problems.slice(0,2).join('; ')||'none'));}
T.ok('C3: the joined year\'s books balance, every settlement, road and good',J.ledger.ok,J.ledger.ok?'all goods':J.ledger.problems.slice(0,3).join('; '));
{const f=fedCheck(JB);T.ok('C3: every settlement of Xanadu and the Catch fed and watered all year (under 1 % short)',f.ok,f.bad.slice(0,4).join('; ')||'none short');}
// 2: salt, iron and arms reach Strongbow and Qiblai; Xanadu's exports reach the homes
const reachCheck=(Tr,Bk)=>{const sb=landedAt(Tr,GROUPS.concat(['caravan.train.salt']),'sfgtxw10kr'),q=Bk.skm4jjo2vl.imported,homes=['gate.iziz','gate.dasri','gate.yuni','gate.geomancers'];
 const home=homes.map(h=>landedAt(Tr,GROUPS,h)),good=(sb.salt||0)>100000&&(sb.iron||0)>0&&(sb.arms||0)>0&&(q.salt||0)>0&&(q.iron||0)>0&&home.every(o=>Object.values(o).reduce((a,b)=>a+b,0)>0);
 return{ok:good,sb,q,home,homes};};
{const r=reachCheck(J.trade,JB);
 T.ok('C3: salt, iron and arms reach Strongbow and Qiblai, and Xanadu\'s exports reach every home (Iziz, the Dasri, Yuni, the Geomancers)',r.ok,
  'Strongbow landed salt '+t(r.sb.salt||0)+', iron '+t(r.sb.iron||0)+', arms '+Math.round(r.sb.arms||0)+'; Qiblai imported salt '+t(r.q.salt||0)+', iron '+t(r.q.iron||0)+'; homes '+r.homes.map((h,i)=>h+' '+t(Object.values(r.home[i]).reduce((a,b)=>a+b,0))).join(', '));
 const N=runJoined(120,{},V=>{V.roads=V.roads.filter(x=>!/^caravan\./.test(x.id));});
 T.neg('a valley without the caravans is caught (nothing crosses)',x=>reachCheck(x.trade,x.B).ok,N,J);}
// 3: Stair and the oases live on the trade: Stair's bread comes off the caravans, every peopled oasis is sold to
{const st=JB.s2o8f4p123,oases=['scatchkolli01','scatchkolli01.goldanda','scatcharfwai01','scatchbitta01','scatchlasso01','scatchlasso01.geo','twins.sinter','twins.brazier','twins.lookout'];
 const good=(st.imported.grain||0)>=(st.eaten.grain||0)*.8&&oases.every(s=>(JB[s].imported.grain||0)>0);
 T.ok('C3: Stair lives on the trade (the caravans land at least four fifths of the grain it eats) and every peopled oasis on the road is sold its bread',good,
  'Stair imported '+t(st.imported.grain||0)+' of grain, ate '+t(st.eaten.grain||0)+'; the oases: '+oases.map(s=>s.replace(/^scatch|^twins\./,'')+' '+t(JB[s].imported.grain||0)).join(', '));}
// 4: the two Iziz houses each carry Iziz's trade; the Train's pans' salt reaches Strongbow
{const g=landedAt(J.trade,['caravan.getmastarz'],'sfgtxw10kr'),d=landedAt(J.trade,['caravan.goldanda'],'sfgtxw10kr'),s=landedAt(J.trade,['caravan.train.salt'],'sfgtxw10kr');
 T.ok('C3: both Iziz houses land at Strongbow, and the Train brings the Catch\'s salt, soda and potash up from its pans',(g.iron||0)>0&&(d.iron||0)>0&&(s.salt||0)>100000&&(s.soda||0)>0&&(s.potash||0)>0,
  'Getmastarz iron '+t(g.iron||0)+', Goldanda iron '+t(d.iron||0)+'; the pans: salt '+t(s.salt||0)+', soda '+t(s.soda||0)+', potash '+t(s.potash||0));}
// C4. 1: the routes: the Iziz houses' pack trains by Route A's tubes (the Hall), the wagons by Route B's oases (the Brazier)
{const via=(id,st)=>road(id).stops.indexOf(st)>=0,good=via('caravan.getmastarz','twins.hall')&&via('caravan.goldanda','twins.hall')&&!via('caravan.getmastarz','twins.brazier')&&
  ['caravan.train','caravan.yuniguild','caravan.geomancer','caravan.train.salt'].every(id=>via(id,'twins.brazier')&&!via(id,'twins.hall'));
 T.ok('C4: the Iziz houses\' pack trains cross by Route A\'s tubes and the Hall of the Tally-Marks; the Train\'s, Yuni\'s and the Geomancers\' wagons by Route B\'s oases and the Brazier',good,
  GROUPS.map(id=>id.slice(8)+': '+road(id).stops.filter(s=>/^twins\./.test(s)).slice(0,5).map(s=>s.slice(6)).join('>')).join('; '));}
// 2: the Split Tally lands at both points, the gate and the shrine (the Hall on Route A, the Brazier on B), and outbound at Stair
const tallyCheck=(cuts,id,shrine)=>{const k=Object.keys((cuts[id]||{}).taken||{});return k.some(x=>x.indexOf('twins.sinter:')===0)&&k.some(x=>x.indexOf(shrine+':')===0);};
{const both=tallyCheck(J.cuts,'caravan.getmastarz','twins.hall')&&tallyCheck(J.cuts,'caravan.goldanda','twins.hall')&&tallyCheck(J.cuts,'caravan.train.salt','twins.brazier')&&tallyCheck(J.cuts,'caravan.yuniguild','twins.brazier');
 const sum=(id,at)=>Object.entries((J.cuts[id]||{}).taken||{}).filter(([k])=>k.indexOf(at+':')===0).reduce((n,[,v])=>n+v,0),out=GROUPS.reduce((n,id)=>n+sum(id,'horns.stair'),0);
 T.ok('C4: the Brotherhood\'s Split Tally lands at both points, the gate (Sinter-Gate) and the shrine (the Hall or the Brazier), and its outbound half at Stair',both&&out>0,
  'Getmastarz: gate '+t(sum('caravan.getmastarz','twins.sinter'))+', Hall '+t(sum('caravan.getmastarz','twins.hall'))+'; the Train\'s salt: gate '+t(sum('caravan.train.salt','twins.sinter'))+', Brazier '+t(sum('caravan.train.salt','twins.brazier'))+'; outbound at Stair '+t(out));}
// 3: a caravan that refuses the guides: no tally, and the Twins take part of its train (two crossings in three)
{const U=runJoined(365,{unguided:['goldanda']}),ev=(L,id)=>(L[id]||[]).filter(x=>/unguided/.test(x.why));
 const unguided=(x)=>ev(x.losses,'caravan.goldanda').length>0&&!tallyCheck(x.cuts,'caravan.goldanda','twins.hall');
 T.ok('C4: Goldanda\'s caravans crossing without the guides pay no tally and lose beasts on the Twins',unguided(U),
  ev(U.losses,'caravan.goldanda').length+' losses, '+ev(U.losses,'caravan.goldanda').reduce((n,x)=>n+x.dead,0)+' beasts; tally '+(tallyCheck(U.cuts,'caravan.goldanda','twins.hall')?'paid':'none'));
 T.neg('a guided caravan is not taken for an unguided one',unguided,J,U);}
// C5. 1: the spring black storms hold the caravans off the Catch floor: no train sets out across it while they blow; they
//      wait them out where they are, at Stair and Kolli (and Arfwai) among them
const stormCheck=x=>{let crossed=0,waited=0;GROUPS.concat(['caravan.train.salt']).forEach(id=>{const Rd=x.V.roads.find(r=>r.id===id),fl=Rd._legs.floor;waited+=(x.trade[id].waited||0);
  x.deps.filter(d=>d.id===id&&fl.indexOf(d.from)>=0).forEach(d=>{if(d.storm)crossed++;});});return{ok:crossed===0&&waited>0,crossed,waited};};
{const s=stormCheck(J);T.ok('C5: the spring storms close the Catch floor: no caravan sets out across it while they blow, and they wait them out',s.ok,
  s.crossed+' departures across the floor in the storms; '+s.waited+' carrier-hours waited');
 const Q=runJoined(365,{hazards:false});
 T.neg('caravans that cross the floor in the storms are caught',x=>stormCheck(x).ok,Q,J);}
// 2: winter shuts the col to Route B (the wagons wait) while Route A's tubes stay open to the pack trains
{let bIn=0,aIn=0;J.deps.forEach(d=>{const Rd=road(d.id);if(!d.col)return;if(Rd._legs.colB&&Rd._legs.colB.indexOf(d.from)>=0)bIn++;if(/getmastarz|goldanda/.test(d.id)&&Rd._legs.twins.indexOf(d.from)>=0)aIn++;});
 T.ok('C5: winter shuts the Twins\' col to Route B\'s wagons, and Route A\'s pack trains still cross by the tubes',bIn===0&&aIn>0,
  bIn+' Route B departures in the col\'s winter; '+aIn+' Route A crossings legs');}
// 3: the Stalkers take stragglers on the Catch floor, never from the Geomancers (their explosives); the col's gales on Route A
{const L=J.losses,n=(id,re)=>(L[id]||[]).filter(x=>re.test(x.why)).length,good=n('caravan.getmastarz',/Stalkers/)>0&&n('caravan.train',/Stalkers/)>0&&n('caravan.geomancer',/Stalkers/)===0&&n('caravan.getmastarz',/gales/)>0;
 T.ok('C5: the Stalkers take stragglers off the Catch floor (never the Geomancers\', who carry explosives), and the col\'s gales take from Route A\'s trains',good,
  GROUPS.map(id=>id.slice(8)+' '+n(id,/Stalkers/)+'/'+n(id,/gales/)).join(', ')+' (Stalkers/gales)');}
// 4: Arfwai found dry in late summer: its well's recharge cut while the dry window is open
{const st=CATCH_TUNE.places.find(p=>p.id==='scatcharfwai01').well[0],Sd=J.V.siteSeasons.find(q=>q.settlement==='scatcharfwai01');
 const site={regen:J.dry.regen},open=J.dry.open;
 T.ok('C5: Arfwai\'s well runs low in late summer: its recharge cut to '+Math.round(CATCH_TUNE.hazards.dryRegen*100)+' % while the dry window is open',!!Sd&&Sd.regen===CATCH_TUNE.hazards.dryRegen&&site.regen!=null&&Math.abs(site.regen-(open?st*Sd.regen:st))<1e-6,
  'the window '+JSON.stringify(CATCH_TUNE.hazards.windows.dry)+', its recharge now '+(site?site.regen:'?')+' l a day ('+(open?'open':'closed')+')');}
// ---- S1 (openworld/catch-bowl/PLAN-SIM.md section 2): the Godsgate's caravanserai on the north road. Bab al-Hawa is
//      the pass's only safe night: snowmelt at the divide, and BARNS - hay carried up 2,400 m and stacked through the
//      summer, since nothing is cut at 3,590 m. It was first written with no fodder at all, on the reasoning that the
//      trains would haul its fodder as freight; that made it a sink the beasts could never be fed from, because
//      SIM.trade provisions at EVERY stop, and it cost a trade route (PLAN-SIM.md 2x and 2y). The checks below are
//      written round that: a stop on a caravan road needs a water number AND a fodder number.
const BAH='godsgate.babalhawa';
// 1: it is declared, on the four Godsgate groups' rounds, and the Train's is untouched (it comes out of Jabal, not over the pass)
{const P=CATCH_TUNE.places.find(p=>p.id===BAH),onIt=GROUPS.filter(id=>(road(id).stops||[]).indexOf(BAH)>=0);
 const train=(road('caravan.train')||{}).stops||[],salt=(road('caravan.train.salt')||{}).stops||[];
 T.ok('S1: Bab al-Hawa is declared at the Godsgate with its snowmelt and its barns, on the four groups that cross the pass and on neither of the Train\'s rounds',
  !!P&&P.kind==='serai'&&!!P.well&&P.fodder>0&&onIt.length===4&&train.indexOf(BAH)<0&&salt.indexOf(BAH)<0,
  (P?P.people+' people, well '+P.well[0]+' l a day, barns '+(P.fodder||'NONE')+' kg a day':'missing')+'; on '+onIt.map(x=>x.slice(8)).join(', '));
 T.neg('a stop on a caravan road with a well and no fodder is caught: the beasts draw there every passage, so it is a sink that can never be filled',
  x=>{const q=x.find(p=>p.id===BAH);return !!q&&!!q.well&&q.fodder>0;},
  CATCH_TUNE.places.map(p=>{if(p.id!==BAH)return p;const d=Object.assign({},p);delete d.fodder;return d;}),CATCH_TUNE.places);}
// 2: the long home leg is cut at the pass, and the recorded totals of section 1c survive the cut
{const Rd=road('caravan.getmastarz'),i=Rd.stops.indexOf(BAH),k=Rd.stops.indexOf('scatchkolli01');
 const home=Rd.legs[Rd.stops.indexOf('gate.iziz')],pass=Rd.legs[i],dayKm=CATCH_TUNE.speed;
 const km=m=>Math.round(m/1440*dayKm),total=km(home)+km(pass);
 T.ok('S1: the Godsgate cuts the Iziz houses\' home leg in two, and the two together still measure the 1,232 km of the proposal\'s section 1c',
  i>=0&&k===i+1&&home>0&&pass>0&&Math.abs(total-1040)<60,
  'home to the pass '+km(home)+' km, the pass to Kolli '+km(pass)+' km, together '+total+' km (was one leg of 1,040 km)');
 T.neg('a round whose first northern stop is Kolli has no pass leg',
  x=>x.stops.indexOf(BAH)>=0&&x.stops.indexOf(BAH)+1===x.stops.indexOf('scatchkolli01'),
  Object.assign({},Rd,{stops:Rd.stops.filter(s=>s!==BAH)}),Rd);}
/* 3: EVERY halt waters and feeds. SIM.trade draws the beasts' water and fodder at every stop, not only at the ones
      named in `halts` ("the beasts water and feed whether or not the stop trades", 77-sim-6-trade.js), so a stop with a
      well and no fodder taxes every train that passes and reports the shortfall against itself. This is the general
      form of the bug Bab al-Hawa was: core/simulation/SCHEMA.md carries the rule. `fodder` left `forHalts` with the
      barns, so the trains no longer haul it as freight -- which is capacity the trade goods get back. */
{const byId={};CATCH_TUNE.places.forEach(p=>{byId[p.id]=p;});
 const bad=[];let seen=0;
 GROUPS.concat(['caravan.train.salt']).forEach(id=>{const Rd=road(id);(Rd.halts||[]).forEach(i=>{const q=byId[Rd.stops[i]];
  if(!q)return;   /* a halt in Xanadu's own settlements, not this tune's to declare */
  seen++;if(!q.well||!(q.fodder>0))bad.push(id.slice(8)+' at '+Rd.stops[i]);});});
 T.ok('S1: every halt this tune declares waters AND feeds its beasts, so no round provisions at a sink',seen>0&&bad.length===0,
  seen+' halt passages checked over '+(GROUPS.length+1)+' rounds; '+(bad.length?'SINKS: '+bad.slice(0,4).join(', '):'none without both a well and fodder'));
 T.neg('a halt with a well and no fodder is caught wherever it is on the round',
  x=>{const bd=[];(x.halts||[]).forEach(i=>{const q=x._by[x.stops[i]];if(q&&(!q.well||!(q.fodder>0)))bd.push(i);});return bd.length===0;},
  Object.assign({},road(GROUPS[0]),{_by:Object.assign({},byId,{[BAH]:Object.assign({},byId[BAH],{fodder:0})})}),
  Object.assign({},road(GROUPS[0]),{_by:byId}));
 T.ok('S1: fodder no longer rides as freight for the halts, now that the pass has barns of its own',
  GROUPS.every(id=>(road(id).forHalts||[]).indexOf('fodder')<0),
  'forHalts: '+(road(GROUPS[0]).forHalts||[]).join(', '));}
// 4: the pass sells to the trains that stop (it is a peopled halt), and it buys its whole table off them
{const Rd=road('caravan.getmastarz'),i=Rd.stops.indexOf(BAH),sells=(Rd.sells||[]).indexOf(i)>=0,halts=(Rd.halts||[]).indexOf(i)>=0;
 const B=JB[BAH],bought=B?Object.keys(B.imported||{}).filter(g=>(B.imported[g]||0)>0):[];
 T.ok('S1: the pass is a selling halt on the round, and a year leaves it fed from the trains it serves',sells&&halts&&bought.length>0,
  'halt '+halts+', sells '+sells+'; a year imported '+(bought.length?bought.map(g=>g+' '+t(B.imported[g])).join(', '):'nothing'));
 T.neg('a stop that is not a selling halt does not live off the trade',
  x=>(x.sells||[]).indexOf(x.stops.indexOf(BAH))>=0,Object.assign({},Rd,{sells:(Rd.sells||[]).filter(k=>k!==i)}),Rd);}
// 5: the God-Bore costs the pass's legs all year, and the rime whiteouts cost them in winter only
{const L=J.losses,n=re=>GROUPS.reduce((a,id)=>a+(L[id]||[]).filter(x=>re.test(x.why)).length,0);
 const bore=n(/God-Bore/),white=n(/whiteout/),W=CATCH_TUNE.hazards.windows.whiteout;
 /* the God-Bore is nightly, so a year must show it. The whiteouts are a WINDOWED roll on the pass's legs only, and a
    train crosses the pass about twice a year: a year holds under one expected whiteout loss, so demanding one would be
    demanding a die come up. Assert instead that the rule is declared on the right legs with the right window. */
 /* ...and on the PASS groups only. The Train of Jabal comes out of Jabal and never crosses the Godsgate, so it has no
    `godsgate` legs and must carry no whiteout rule: requiring one of every group was this check's own bug. */
 const pass=GROUPS.filter(id=>((road(id)._legs||{}).godsgate||[]).length>0);
 const decl=pass.length===4&&pass.every(id=>{const Rd=road(id),gg=Rd._legs.godsgate;
  const w=(Rd.losses||[]).find(x=>/whiteout/.test(x.why));
  return !!w&&w.window==='whiteout'&&w.legs.length===gg.length;})
  &&GROUPS.filter(id=>pass.indexOf(id)<0).every(id=>!(road(id).losses||[]).some(x=>/whiteout/.test(x.why)));
 T.ok('S1: the God-Bore takes beasts in the Godsgate all year, and the rime whiteouts are declared on the pass\'s legs in its winter window',bore>0&&decl,
  bore+' God-Bore losses and '+white+' whiteout losses this year (the window '+JSON.stringify(W)+'; a train crosses the pass about twice a year, so a whiteout loss is under one a year in expectation)');
 const Q=runJoined(365,{hazards:false});
 T.neg('with the hazards off the Godsgate costs nothing',
  x=>GROUPS.reduce((a,id)=>a+((x.losses[id]||[]).filter(y=>/God-Bore|whiteout/.test(y.why)).length),0)>0,Q,J);}
/* ---- ALL FIVE LEAVE IN TURN, AND THEIR ORDER IS HOW FAR THEY COME (the owner, 2026-11-25: first "can we stagger
   house departures so they don't step on each other like that", then "we would probably expect them to arrive at
   different times as caravans may be coming from as far as Iziz, Jabal, Verge, or Yuni").
   The first version staggered only the two houses sharing a pool and left every other group on the same hour; S4
   measured what that costs (PLAN-SIM.md 6b). Now the four home pools take an even slice of CATCH_TUNE.muster each,
   ORDERED BY THEIR HOME LEG -- Jabal's 684 km first, the Geomancers' 1,017 km last -- and the two Iziz houses split
   their own slice. So the expected phases at a 60-day muster are 0, 15, 23, 30 and 45 days. */
{const R=CATCH_TUNE.groups.map(g=>({id:g.id,pool:g.pool,r:road('caravan.'+g.id)})).filter(x=>x.r);
 const off=x=>x.r.offset||0,days=x=>Math.round(off(x)/1440);
 const byPool={};R.forEach(x=>{(byPool[x.pool]=byPool[x.pool]||[]).push(x);});
 const pools=Object.keys(byPool),slice=CATCH_TUNE.muster*1440/pools.length;
 /* every pool on its own slice, no two pools together, and the shared pool's two houses apart but inside one slice */
 const perPool=pools.map(p=>Math.min.apply(null,byPool[p].map(off)));
 const spread=perPool.slice().sort((a,b)=>a-b);
 const distinct=spread.every((v,i)=>i===0||v-spread[i-1]>=slice-1);
 const iz=byPool['gate.iziz'].map(off).sort((a,b)=>a-b);
 const housesApart=iz.length===2&&iz[1]-iz[0]>0&&iz[1]-iz[0]<=slice;
 const nearestFirst=Math.min.apply(null,byPool['gate.dasri'].map(off))===0;
 const widest=Math.max.apply(null,R.map(off));
 const good=distinct&&housesApart&&nearestFirst&&widest>=slice*(pools.length-1)-1&&widest<CATCH_TUNE.muster*1440;
 T.ok('all five groups leave in turn over the '+CATCH_TUNE.muster+'-day muster, the four pools a slice apart in order of how far they come, and the two Iziz houses sharing their slice',good,
  R.sort((a,b)=>off(a)-off(b)).map(x=>x.id+' day '+days(x)).join(', ')+'; a slice is '+Math.round(slice/1440)+' d');
 T.neg('two pools leaving on the same day are not spread over the muster',
  x=>{const s=x.slice().sort((a,b)=>a-b);return s.every((v,i)=>i===0||v-s[i-1]>=slice-1);},
  perPool.map(()=>0),perPool);}
// and the point of it: both houses now land iron at Strongbow, neither starved by the other
{const g=landedAt(J.trade,['caravan.getmastarz'],'sfgtxw10kr'),d=landedAt(J.trade,['caravan.goldanda'],'sfgtxw10kr');
 T.ok('with the houses staggered, BOTH land iron at Strongbow: neither rival is starved of the pool by the other',(g.iron||0)>0&&(d.iron||0)>0,
  'Getmastarz iron '+t(g.iron||0)+', Goldanda iron '+t(d.iron||0));
 T.neg('a house that lands nothing has been starved',x=>(x.a||0)>0&&(x.b||0)>0,{a:4000,b:0},{a:4000,b:1500});}
T.done();
