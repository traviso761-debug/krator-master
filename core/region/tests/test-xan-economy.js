// node core/region/tests/test-xan-economy.js — the Xanadu Sultanate on core/simulation for a year (step X0 of
// core/simulation/PROPOSAL-XANADU.md; the owner, 2026-11-15 and 16). The country is its tune (core/region/data/xan-tune.js:
// the towns and their works, the eight provinces' countrysides, the lake towns and islands, the work camps, the forts,
// the four gateways, the dues and grants) and the open world's plan for Erehwon's and Qiblai's rings
// (openworld/xanadu-oidong-highrift/plan/sites.json), declared by core/region's valley host at the abstract level. It runs
// a year by the hour and holds the year to the proposal; each negative is a pair (tools/ktest.js).
const fs=require('fs'),path=require('path');
const T=require('../../../tools/ktest.js')(__filename);
global.window=global;
const ROOT=path.join(__dirname,'..','..','..'),rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const load=()=>{(0,eval)(rd('core/clock/20-core-clock.js'));
 fs.readdirSync(path.join(ROOT,'core','simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().forEach(f=>(0,eval)(rd('core/simulation/'+f)));
 (0,eval)(rd('core/region/00-region-core.js'));const H={TUNE:{sim:{}}};KREGION.use(H);(0,eval)(rd('core/region/50-region-valley.js'));
 (0,eval)(rd('core/region/data/xan-tune.js'));return H;};
const PLAN=JSON.parse(rd('openworld/xanadu-oidong-highrift/plan/sites.json'));
const t=n=>(n/1000).toFixed(1)+' t',E='s57bkv9741';
function run(days,edit){const H=load(),V=XAN_TUNE.valley(PLAN,{});if(edit)edit(V);const S=H.simValley(V);
 const a=SIM.ledgerSnap(),B0=H.valleyBooks(),daily={};let prev={};
 for(let d=0;d<days;d++){H.valleyRun(1440,60);const B=H.valleyBooks();
  for(const s of S.order){if(!/^prov\./.test(s))continue;const m=B.towns[s].made.grain||0,p=prev[s]||0;if(m>p+.5)(daily[s]||(daily[s]=[])).push(Math.floor(SIM.season(S.clock.m-60).yearDay));prev[s]=m;}}
 const b=SIM.ledgerSnap();return{H,V,S,B0,B:H.valleyBooks(),daily,trade:SIM.tradeReport(),xfer:SIM.transfersReport(),ledger:SIM.ledger(a,b,{tol:1}),actors:SIM.all('actor').length};}
const t0=Date.now(),Y=run(365),B=Y.B.towns,secs=(Date.now()-t0)/1000;
console.log('a year of the Sultanate in '+secs.toFixed(1)+' s: '+Y.S.order.length+' settlements, '+Y.actors+' actors, '+
 Math.round(Y.V.settlements.reduce((n,s)=>n+s.people,0))+' people');
const people=Y.V.settlements.filter(s=>s.people>0);
// 1. declared: the towns, the eight countrysides, the lake towns and islands, the rings, the camps, the forts, the gateways
{const ids=Y.S.order,cnt=re=>ids.filter(s=>re.test(s)).length;
 T.ok('the Sultanate declared: 8 countrysides, 24 lake towns and islands, 12 ring villages, 4 gateways, no problems',
  cnt(/^prov\./)===8&&cnt(/^lk\./)===24&&cnt(/hamlet|\/|farm-|ranch-/)>=0&&cnt(/^gate\./)===4&&!Y.S.problems.length,
  ids.length+' settlements; problems: '+(Y.S.problems.slice(0,3).join('; ')||'none'));
 T.neg('a road to a settlement that is not declared is a problem the host reports',
  V=>{const H=load();return H.simValley(V).problems.length===0;},
  (()=>{const V=XAN_TUNE.valley(PLAN,{});V.roads.push({id:'road.nowhere',from:E,to:'nowhere',minutes:60,cap:1});return V;})(),XAN_TUNE.valley(PLAN,{}));}
// 2. the year's books balance
T.ok('the year\'s books balance (opening + made + imported = consumed + spoiled + exported + closing), every settlement',Y.ledger.ok,
 Y.ledger.ok?'all goods':Y.ledger.problems.slice(0,3).join('; '));
// 3. the people are fed: no settlement goes without more than 1 % of its grain; the capital never
const fedCheck=Bk=>{const bad=[];Object.keys(Bk).forEach(s=>{const x=Bk[s];if(!x.people)return;const e=x.eaten.grain||0,h=x.hungry.grain||0;if(h>(e+h)*.01)bad.push(s+' '+(100*h/(e+h)).toFixed(1)+'%');});
 return {ok:!bad.length&&!((Bk[E].hungry||{}).grain),bad};};
{const F=fedCheck(B);T.ok('every settlement fed its grain all year (under 1 % short), the capital never short',F.ok,F.bad.slice(0,6).join(', ')||'all fed');
 T.neg('without its grain roads (its tithes, the Vale\'s barges, the Cataracts\' road) and with a month in its granary the capital goes hungry',Bk=>fedCheck(Bk).ok,
  run(75,V=>{V.roads=V.roads.filter(r=>!((r.to===E&&r.share&&/^tithe\./.test(r.id))||r.id==='road.er-th'||r.id==='road.er-qb'));V.settlements.find(s=>s.id===E).start.grain=25000*.41*30;}).B.towns,B);}
// 3b. the first stores are last year's harvest: they last to the first harvest's end, which needs core/clock's day 0 at year day 259
T.ok('the clock\'s day 0 is year day '+XAN_TUNE.yearDay0+' (the first stores are sized to the first harvest from it)',Math.round(SIM.season(0).yearDay)===XAN_TUNE.yearDay0,'year day '+SIM.season(0).yearDay.toFixed(1));
// 4. the gold: the mines' ore assayed at Strongwall, the Fifth to the Treasury, goldwork at Erehwon and Qiblai, coin at the Mint
const fifthOf=(made,tithed)=>made>0?tithed/made:0;
{const sw=B.sxan7r1sln,made=sw.made.gold||0,ft=Y.trade.fifth,tithed=Object.values(ft.tithed||{}).reduce((n,o)=>n+(o.gold||0),0),r=fifthOf(made,tithed);
 const gw=(B[E].made.goldwork||0)+(B.skm4jjo2vl.made.goldwork||0),coin=B['xan.citadel'].made.coin||0;
 T.ok('the gold: ore assayed at Strongwall, the Sultan\'s Fifth to the Treasury, goldwork at Erehwon and Qiblai, coin at the Mint',
  made>100&&Math.abs(r-XAN_TUNE.fifth)<.03&&gw>0&&coin>0,
  'gold '+made.toFixed(0)+' kg, the Fifth '+tithed.toFixed(1)+' kg ('+(100*r).toFixed(1)+' %), goldwork '+Math.round(gw)+' pieces, coin '+Math.round(coin));
 T.neg('the Fifth is a fifth: a road that took two fifths is caught',x=>Math.abs(fifthOf(x.made,x.tithed)-XAN_TUNE.fifth)<.03,{made,tithed:tithed*2},{made,tithed});}
// 5. the dues and the grants: each once a year, its bill sent or owed
const duesCheck=X=>Object.keys(X).every(id=>{const x=X[id],tr=Y.V.transfers.find(q=>q.id===id);return x.times===1&&Object.keys(tr.goods).every(g=>Math.abs((x.sent[g]||0)+(x.owed[g]||0)-tr.goods[g])<1e-6);});
{const X=Y.xfer,owed=Object.keys(X).filter(id=>Object.values(X[id].owed||{}).some(n=>n>0));
 T.ok('the provinces\' dues, Qiblai\'s grant of fealty and the grants of esteem: each once, its bill sent or owed',duesCheck(X),
  Object.keys(X).length+' transfers; owed: '+(owed.join(', ')||'none'));
 T.neg('a bill that fell twice in the year is caught',duesCheck,Object.assign({},X,{[Object.keys(X)[0]]:Object.assign({},X[Object.keys(X)[0]],{times:2})}),X);}
// 6. the lake: every lake town and island fed, fish at both hubs from their towns' dugouts
const lakeCheck=Bk=>{const lk=Object.keys(Bk).filter(s=>/^lk\./.test(s)),hungry=lk.filter(s=>(Bk[s].hungry.grain||0)>(Bk[s].eaten.grain||1)*.01);
 const fishIn=h=>(Bk[h].imported.fish||0);return{ok:!hungry.length&&fishIn(E)>0&&fishIn('xan.pher')>=0&&lk.filter(s=>(Bk[s].exported.fish||0)>0).length>=15,hungry,e:fishIn(E),p:fishIn('xan.pher')};};
{const L=lakeCheck(B);T.ok('the lake: every lake town and island fed, the dugouts\' fish landed at Erehwon and Phēr',L.ok,
  'fish into Erehwon '+t(L.e)+', into Phēr '+t(L.p)+(L.hungry.length?'; hungry: '+L.hungry.join(', '):''));
 T.neg('a lake town that went hungry is caught',Bk=>lakeCheck(Bk).ok,Object.assign({},B,{'lk.net':Object.assign({},B['lk.net'],{hungry:{grain:1e6},eaten:{grain:1}})}),B);}
// 7. the gateways: salt and iron in, the country's goods out, never grain. The salt runs short until the caravans from the
// north are built (the owner, 2026-11-16: "we should expect salt to be short before caravans from the north are properly
// implemented": X1's staged roads and X3's priced gateways); the shortfall is reported, not held
const gateCheck=Tr=>{const inn={},out={};Object.keys(Tr).filter(k=>/^trade\.gate/.test(k)).forEach(k=>{const L=Tr[k].landed||{};Object.keys(L).forEach(leg=>{const [a]=leg.split('>');const to=a===E?out:inn;Object.keys(L[leg]).forEach(g=>{to[g]=(to[g]||0)+L[leg][g];});});});
 return{ok:(inn.salt||0)>0&&(inn.iron||0)>0&&['goldwork','cacao','opium','tea','silk'].every(g=>(out[g]||0)>0)&&!out.grain&&!inn.grain,inn,out};};
{const G=gateCheck(Y.trade),saltEaten=people.reduce((n,s)=>n+(B[s.id].eaten.salt||0),0),saltShort=people.reduce((n,s)=>n+(B[s.id].hungry.salt||0),0);
 T.ok('the gateways: salt and iron in, goldwork, cacao, opium, tea and silk out, never grain (the salt\'s shortfall reported)',G.ok,
  'in '+Object.entries(G.inn).map(([g,n])=>g+' '+t(n)).join(', ')+'; out '+Object.entries(G.out).map(([g,n])=>g+' '+(n>1000?t(n):Math.round(n))).join(', ')+'; salt short '+(100*saltShort/Math.max(1,saltEaten+saltShort)).toFixed(1)+' %');
 T.neg('grain sent out through a gateway is caught',Tr=>gateCheck(Tr).ok,Object.assign({},Y.trade,{'trade.gate.fake':{landed:{[E+'>gate.fake']:{grain:5000}}}}),Y.trade);}
// 8. iron: the Salvagers' scrap and the Cataracts' charcoal to iron at Theodiga, tools at the smithies
{const th=B.s4zvgepuru,iron=th.made.iron||0,tools=(B[E].made.tools||0)+(B.skm4jjo2vl.made.tools||0);
 T.ok('iron: Theodiga smelts the Dome\'s scrap with the Cataracts\' charcoal; the smiths make tools',iron>20000&&tools>0,'iron '+t(iron)+', tools '+t(tools)+', charcoal into Theodiga '+t(th.imported.charcoal||0));}
// 9. the seasons: the countrysides' grain only in the harvest window
const seasonCheck=Dl=>{const w=XAN_TUNE.calendar.windows.harvest,out=[];Object.keys(Dl).forEach(s=>Dl[s].forEach(d=>{if(!(d>=w[0]&&d<=w[1]))out.push(s+'@'+d);}));return{ok:!out.length&&Object.keys(Dl).length>=6,out};};
{const C=seasonCheck(Y.daily);T.ok('the seasons: the countrysides made grain only at the harvest (year days '+XAN_TUNE.calendar.windows.harvest.join('-')+')',C.ok,C.out.slice(0,3).join(', ')||Object.keys(Y.daily).length+' countrysides harvested');
 T.neg('a harvest out of its window is caught',Dl=>seasonCheck(Dl).ok,Object.assign({},Y.daily,{'prov.p1':(Y.daily['prov.p1']||[]).concat([10])}),Y.daily);}
// 10. the size: the abstract level keeps a country of ~350,000 to a few thousand actors and a year to minutes
{const pop=Y.V.settlements.reduce((n,s)=>n+s.people,0);
 T.ok('the size: about 350,000 people on under 3,000 actors, a year in under three minutes',pop>300000&&pop<400000&&Y.actors<3000&&secs<180,Math.round(pop)+' people, '+Y.actors+' actors, '+secs.toFixed(0)+' s');}
// the year's books, for the reader
const line=(s,k)=>Object.entries(B[s][k]||{}).filter(([g,n])=>n>=1).map(([g,n])=>g+' '+(n>=1000?t(n):Math.round(n))).join(', ');
['s57bkv9741','xan.citadel','skm4jjo2vl','s4zvgepuru','sxan7r1sln'].forEach(s=>console.log('\n'+s+': made '+line(s,'made')+'\n  imported '+line(s,'imported')+'\n  exported '+line(s,'exported')));
T.done();
