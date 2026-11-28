// node core/region/tests/test-bowl-join.js — step S2's second half (openworld/catch-bowl/PLAN-SIM.md section 3c): the
// Bowl joined to the Catch-joined valley, and THE TRAIN OF JABAL COMING HOME. CATCH_TUNE carries the Dasri as an off-map
// pool, `gate.dasri`, standing at px 1225,1149 — which is Jabal's own cell, because the pool was only ever a stand-in
// for a city that was not on the map. With the Bowl joined it is one, so the stand-in goes and both of the Train's
// rounds load at Jabal instead.
//
// Kept apart from test-bowl.js because the join needs all three tunes (Xanadu, the Catch, the Bowl) and so a joined run,
// which is minutes rather than seconds. test-bowl.js stays fast and covers the Bowl on its own.
// Each negative is a pair (tools/ktest.js).
const fs=require('fs'),path=require('path');
const T=require('../../../tools/ktest.js')(__filename);
global.window=global;
const ROOT=path.join(__dirname,'..','..','..'),rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const load=()=>{(0,eval)(rd('core/clock/20-core-clock.js'));
 fs.readdirSync(path.join(ROOT,'core','simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().forEach(f=>(0,eval)(rd('core/simulation/'+f)));
 (0,eval)(rd('core/region/00-region-core.js'));const H={TUNE:{sim:{}}};KREGION.use(H);(0,eval)(rd('core/region/50-region-valley.js'));
 (0,eval)(rd('core/rand/08-core-rand.js'));
 fs.readdirSync(path.join(ROOT,'core','space')).filter(f=>/^\d.*\.js$/.test(f)).sort().forEach(f=>(0,eval)(rd('core/space/'+f)));
 fs.readdirSync(path.join(ROOT,'core','camp')).filter(f=>/^\d/.test(f)).sort().forEach(f=>(0,eval)(rd('core/camp/'+f)));
 (0,eval)(rd('core/region/data/catch-tune.js'));(0,eval)(rd('core/region/data/bowl-tune.js'));return H;};
const PLAN=JSON.parse(rd('openworld/xanadu-oidong-highrift/plan/sites.json'));
const t=n=>(n/1000).toFixed(1)+' t';
const JABAL='sa5o6dvjdv',POOL='gate.dasri',MANTIS='slw9dufqfs',SOLTA='s0zgu7u6yb';

/* the three plans, in the order EAST_RIFT joins them: Xanadu, then the Catch into Xanadu's frame, then the Bowl */
function build(o){const H=load();(0,eval)(rd('core/region/data/xan-tune.js'));
 const CV=CATCH_TUNE.join(XAN_TUNE.valley(PLAN,{}),o||{});
 return{H,CV,V:BOWL_TUNE.join(CV,o||{})};}
function runJoined(days,o,edit){const{H,CV,V}=build(o);if(edit)edit(V);
 const S=H.simValley(V),a=SIM.ledgerSnap();H.valleyRun(days*1440,60);const b=SIM.ledgerSnap();
 return{H,CV,V,S,B:H.valleyBooks().towns,trade:SIM.tradeReport()||{},ledger:SIM.ledger(a,b,{tol:1})};}

/* ---- the structure first: it costs nothing and it is what the step is for */
const{CV:CV0,V:V0}=build({});
const sid=V=>V.settlements.map(s=>s.id),rid=V=>V.roads.map(r=>r.id);
const road=(V,id)=>V.roads.find(r=>r.id===id);

// 1: the Bowl's places and roads are all there, on top of everything the Catch join already had
{const ids=sid(V0),want=['sa5o6dvjdv','slw9dufqfs','s0zgu7u6yb','skz25tuq0w','scyeauyek7','sq11desertw7',
  'slw9dufqfs.ring','skz25tuq0w.ring'];
 const roads=rid(V0),trade=BOWL_TUNE.trade.map(r=>r.id).concat(['lane.slw9dufqfs','lane.skz25tuq0w']);
 const good=want.every(x=>ids.indexOf(x)>=0)&&trade.every(x=>roads.indexOf(x)>=0)
  &&ids.length===sid(CV0).length+want.length-1;   /* -1: the pool goes */
 T.ok('S2: the Bowl\'s eight settlements and seven roads join the Catch-joined valley, and the valley grows by exactly those less the pool',good,
  sid(CV0).length+' settlements joined -> '+ids.length+'; the Bowl\'s roads: '+trade.filter(x=>roads.indexOf(x)>=0).length+' of '+trade.length);
 T.neg('a join that dropped a Bowl place is not the whole Bowl',
  x=>want.every(w=>x.indexOf(w)>=0),ids.filter(x=>x!=='scyeauyek7'),ids);}

// 2: the pool is gone and Jabal is there in its place — the step's whole point
{const ids=sid(V0),gone=ids.indexOf(POOL)<0,here=ids.indexOf(JABAL)>=0;
 const pooled=sid(CV0).indexOf(POOL)>=0;   /* it WAS there before the Bowl joined */
 T.ok('S2: the Dasri\'s off-map pool goes and Jabal stands in its place, on the cell the pool was standing on',pooled&&gone&&here&&V0._bowl.pooled,
  'before the join: '+(pooled?'gate.dasri present':'no pool')+'; after: '+(gone?'gone':'STILL THERE')+', Jabal '+(here?'present':'MISSING'));
 T.neg('a valley that still carries the stand-in has not brought the Train home',
  x=>x.indexOf(POOL)<0,sid(CV0),ids);}

/* 3: THE TRAIN HAS TWO ROUNDS AND ONLY ONE OF THEM WAS EVER HOMED ON THE POOL. `caravan.train` starts at the pool and
      runs north over the Twins to Strongbow, so it re-homes on Jabal. `caravan.train.salt` starts at the PANS
      (`svhmyhf33w`, Salt al-Ban on the Catch floor) and never touched the pool, so it is untouched and should be: the
      pans stand on the southbound road, where Solta stands 500 km north in the Bowl. That is the division the geography
      gives -- SOLTA'S SALT FEEDS THE BOWL, THE CATCH PANS' SALT FEEDS THE EXPORT ROAD -- and it is why Solta's salt
      reaches Strongbow only by way of Jabal and the Train's own round, not by joining the salt run. */
{const HOMED='caravan.train',PANS='caravan.train.salt';
 const rehomed=(V0._bowl||{}).rehomed||[];
 const R=road(V0,HOMED),A=road(CV0,HOMED);
 const onJabal=!!R&&R.stops[0]===JABAL&&R.stops.indexOf(POOL)<0;
 /* AND THE RE-MEASURED HOME LEGS COME OUT THE SAME, which is the proof rather than a disappointment: the pool's own
    declared distance was measured from px 1225,1149 and Jabal stands on that cell, so a fresh measurement from Jabal
    must agree. Assert that it does, against a measurement taken here from the joined valley's own positions -- that
    tests the arithmetic ran, where comparing the two legs alone would pass on a leg simply copied over. */
 const by={};V0.settlements.forEach(s=>{by[s.id]=s;});
 const km=(x,y)=>Math.hypot(by[x].x-by[y].x,by[x].z-by[y].z)/1000*BOWL_TUNE.winding;
 const mins=d=>Math.max(240,Math.round(d/BOWL_TUNE.speed*1440));
 const n=R?R.stops.length:0;
 const homeIdx=R?R.stops.map((s,i)=>i).filter(i=>R.stops[i]===JABAL||R.stops[(i+1)%n]===JABAL):[];
 const legsMeasured=homeIdx.length>0&&homeIdx.every(i=>{const a2=R.stops[i],b2=R.stops[(i+1)%n];
  return Math.abs(R.legs[i]-mins(km(a2,b2)))<=1;});
 const legsUnchanged=!!A&&!!A.legs&&homeIdx.every(i=>Math.abs(A.legs[i]-R.legs[i])<=60);
 const pansNeverPooled=(road(CV0,PANS).stops||[]).indexOf(POOL)<0&&road(CV0,PANS).stops[0]==='svhmyhf33w';
 const others=rid(V0).filter(id=>/^caravan\./.test(id)&&id!==HOMED);
 const othersUntouched=others.every(id=>{const X=road(CV0,id),Yq=road(V0,id);
  return JSON.stringify(X.stops)===JSON.stringify(Yq.stops)&&JSON.stringify(X.legs)===JSON.stringify(Yq.legs);});
 T.ok('S2: the Train\'s round re-homes on Jabal with its home legs re-measured; its salt run started at the pans and is rightly untouched, as are the four pass groups\'',
  rehomed.length===1&&rehomed[0]===HOMED&&onJabal&&legsMeasured&&legsUnchanged&&pansNeverPooled&&othersUntouched,
  'rehomed: '+rehomed.join(', ')+'; its '+homeIdx.length+' home legs re-measured from Jabal and unchanged within the hour'
  +(homeIdx.length?' ('+homeIdx.map(i=>Math.round(A.legs[i]/1440)+'d -> '+Math.round(R.legs[i]/1440)+'d').join(', ')+')':'')
  +'; the salt run still starts at '+road(V0,PANS).stops[0]+'; untouched: '+others.map(x=>x.slice(8)).join(', '));
 T.neg('a round still stopping at the pool has not been re-homed',
  x=>x.stops.indexOf(POOL)<0,road(CV0,HOMED),R);}

// 4: Jabal takes the pool's warehouse, at the larger of the two per good
{const P=CV0.settlements.find(s=>s.id===POOL),J=V0.settlements.find(s=>s.id===JABAL);
 const keys=Object.keys((P||{}).start||{});
 const kept=keys.every(g=>(J.start[g]||0)>=((P.start||{})[g]||0));
 const own=Object.keys((CV0.settlements.find(s=>s.id===JABAL)||{start:{}}).start||{});   /* Jabal is not in CV0 at all */
 T.ok('S2: Jabal keeps the Dasri masters\' warehouse — every good the pool held, at the larger of the two',!!P&&!!J&&keys.length>0&&kept,
  (P?keys.length+' goods came off the pool ('+keys.slice(0,5).join(', ')+')':'no pool')+'; Jabal was not in the Catch join at all ('+own.length+' goods of its own there)');
 T.neg('a Jabal that lost the pool\'s stock cannot load the Train',
  x=>Object.keys((P.start||{})).every(g=>(x[g]||0)>=(P.start[g]||0)),{grain:1},J.start);}

// 5: goods, factions and calendar windows merged, and nothing of the Catch's lost
{const g=Object.keys(V0.goods),cg=Object.keys(CV0.goods),bg=Object.keys(BOWL_TUNE.goods);
 const f=V0.factions.map(x=>x.id),w=Object.keys(V0.calendar.windows);
 const good=cg.every(x=>g.indexOf(x)>=0)&&bg.every(x=>g.indexOf(x)>=0)
  &&BOWL_TUNE.factions.every(x=>f.indexOf(x.id)>=0)
  &&Object.keys(BOWL_TUNE.calendar.windows).every(x=>w.indexOf(x)>=0)
  &&Object.keys(CV0.calendar.windows).every(x=>w.indexOf(x)>=0);
 T.ok('S2: the join merges goods, factions and calendar windows and loses none of the Catch\'s',good,
  g.length+' goods, '+f.length+' factions, windows: '+w.join(', '));
 T.neg('a join that dropped the Catch\'s windows is not a join',
  x=>Object.keys(CV0.calendar.windows).every(k=>x.indexOf(k)>=0),Object.keys(BOWL_TUNE.calendar.windows),w);}

// 6: the wary pair survives the merge — the Train against Mantis's houses
{const wary=V0.relations.filter(r=>r.stance==='wary');
 const pair=wary.some(r=>(r.a==='train'&&r.b==='mantishouses')||(r.a==='mantishouses'&&r.b==='train'));
 T.ok('S2: the Train and Mantis\'s Izani houses stay wary of each other through the join',pair,
  wary.length+' wary rows in the joined valley');
 /* the predicate has to test the STANCE, not just that the pair exists: the row survives a blanket friendly, which is
    how this negative first passed on its own faulty input */
 T.neg('a joined valley where the pair has gone friendly has lost the Bowl\'s grievance',
  x=>x.some(r=>r.stance==='wary'&&((r.a==='train'&&r.b==='mantishouses')||(r.a==='mantishouses'&&r.b==='train'))),
  V0.relations.map(r=>Object.assign({},r,{stance:'friendly'})),V0.relations);}

/* ---- then it has to RUN. A short run: the structure above is what S2 changed, and a joined year over three tunes is
   twenty-odd minutes. 120 days is enough to prove the valley loads, the clock turns and the books balance. */
const t0=Date.now(),J=runJoined(120);
console.log('120 days of Xanadu, the Catch and the Bowl joined in '+((Date.now()-t0)/1000).toFixed(0)+' s: '
 +J.S.order.length+' settlements, '+J.V.settlements.reduce((n,s)=>n+s.people,0)+' people');
T.ok('S2: the joined valley runs with no problems reported',!J.S.problems.length,
 J.S.problems.slice(0,3).join('; ')||'none');
T.ok('S2: the joined books balance over all three tunes, every settlement, road and good',J.ledger.ok,
 J.ledger.ok?'all goods':J.ledger.problems.slice(0,3).join('; '));
/* the Train sails from Jabal, not from a pool that no longer exists -- and its salt run still sails from the pans,
   which is the division check 3 records: Solta's salt feeds the Bowl, the Catch pans' feeds the export road */
{const TR=(J.trade||{})['caravan.train']||{},SR=(J.trade||{})['caravan.train.salt']||{};
 const tStops=(road(J.V,'caravan.train')||{}).stops||[],sStops=(road(J.V,'caravan.train.salt')||{}).stops||[];
 const good=tStops[0]===JABAL&&(TR.carriers||[]).length>0&&sStops[0]==='svhmyhf33w'&&(SR.carriers||[]).length>0;
 T.ok('S2: in the joined valley the Train\'s round sails out of Jabal and its salt run still out of the pans, both with carriers on the road',good,
  'the round from '+(tStops[0]||'?')+' ('+(TR.carriers||[]).length+' carriers, '+(TR.voyages||0)+' voyages in 120 days); '
  +'the salt run from '+(sStops[0]||'?')+' ('+(SR.carriers||[]).length+' carriers, '+(SR.voyages||0)+' voyages)');
 T.neg('a round whose first stop is still the pool is the unjoined one',
  x=>x[0]===JABAL,(road(J.CV,'caravan.train')||{stops:[]}).stops,tStops);}
T.done();
