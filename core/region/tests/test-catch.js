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
 const good=Y.S.order.length===16&&!Y.S.problems.length&&pp([STAIR,'horns.stair'])===750&&pp(['scatchkolli01','scatchkolli01.goldanda'])===80&&
  pp(['scatcharfwai01'])===60&&pp(['scatchbitta01'])===40&&pp(['scatchlasso01','scatchlasso01.geo'])===100;
 T.ok('the Catch declared: Stair 750 with the Brotherhood\'s house, Kolli 80, Arfwai 60, Bitta 40, Lasso 100, the salt works, the Twins\' six stations, the White Gills; no problems',good,
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
 const good=wells.length===15&&!low.length&&made>=used;
 T.ok('15 wells draw what their people use and hold their aquifers (none under half at the year\'s end)',good,
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
T.done();
