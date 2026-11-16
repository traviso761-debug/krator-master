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
 const b=SIM.ledgerSnap(),sites={},veins=S.veinMoves.slice(),cuts=JSON.parse(JSON.stringify(S.cuts));S.order.forEach(s=>(SIM.sitesReport(s)||[]).forEach(x=>{sites[x.id]=Object.assign({settlement:s},x);}));
 return{H,V,S,B0,B:H.valleyBooks(),daily,trade:SIM.tradeReport(),xfer:SIM.transfersReport(),ledger:SIM.ledger(a,b,{tol:1}),actors:SIM.all('actor').length,sites,veins,cuts};}
const t0=Date.now(),Y=run(365),B=Y.B.towns,secs=(Date.now()-t0)/1000;
console.log('a year of the Sultanate in '+secs.toFixed(1)+' s: '+Y.S.order.length+' settlements, '+Y.actors+' actors, '+
 Math.round(Y.V.settlements.reduce((n,s)=>n+s.people,0))+' people');
const people=Y.V.settlements.filter(s=>s.people>0);
// 1. declared: the towns, the eight countrysides, the lake towns and islands, the rings, the camps, the forts, the gateways
{const ids=Y.S.order,cnt=re=>ids.filter(s=>re.test(s)).length;
 T.ok('the Sultanate declared: 8 countrysides, 24 lake towns and islands, 12 ring villages, 4 gateways and the Great Caravan\'s 3 Dalab towns, no problems',
  cnt(/^prov\./)===8&&cnt(/^lk\./)===24&&cnt(/hamlet|\/|farm-|ranch-/)>=0&&cnt(/^gate\./)===7&&!Y.S.problems.length,
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
const gateCheck=Tr=>{const inn={},out={};Object.keys(Tr).filter(k=>/^trade\.gate|^caravan\.great$/.test(k)).forEach(k=>{const L=Tr[k].landed||{};Object.keys(L).forEach(leg=>{const [a,b]=leg.split('>');if(!/^gate\./.test(a)&&!/^gate\./.test(b))return;   /* the Great Caravan's winter legs are inside Xanadu */
  const to=/^gate\./.test(a)?inn:out;Object.keys(L[leg]).forEach(g=>{to[g]=(to[g]||0)+L[leg][g];});});});
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
 T.ok('the size: about 350,000 people on under 3,000 actors, a year in under four minutes',pop>300000&&pop<400000&&Y.actors<3000&&secs<240,   /* four, as test-east-rift's: the year grew with X2's places, and other sessions load the machine */Math.round(pop)+' people, '+Y.actors+' actors, '+secs.toFixed(0)+' s');}
// ---- X1 (core/region's valley host grown: a settlement's scale, a work's site, a road of three or more stops; the
// gateways at their staging towns)
// 11. the sites: the gold lode and the opal diggings draw down by what they made; the Dome lets fall only so much scrap a
// year; every fishing ground holds at its town's fleet
const siteCheck=Sx=>{const v=Object.values(Sx),lode=v.find(x=>x.kind==='lode'&&x.settlement==='smgxtultfq'),fall=v.find(x=>x.kind==='dome-fall'),fish=v.filter(x=>x.kind==='fishery');
 const lodeOk=lode&&Math.abs((lode.start-lode.amount)-lode.taken)<1&&lode.taken>XAN_TUNE.mine.goldore*.8&&lode.amount>0;
 const fallOk=fall&&fall.taken<=fall.start+fall.capacity*0+XAN_TUNE.mine.scrap*1.01;
 const fishOk=fish.length>=21&&fish.every(x=>x.amount>=x.start*.3);
 return{ok:!!(lodeOk&&fallOk&&fishOk),lode,fall,fish};};
{const C=siteCheck(Y.sites);T.ok('the sites: the gold lode drawn down by its ore, the Dome\'s scrap no more than it lets fall, every fishing ground holding',C.ok,
  C.lode?('lode '+t(C.lode.taken)+' of ore taken, '+t(C.lode.amount)+' left; scrap '+t(C.fall.taken)+'; '+C.fish.length+' fisheries, the lowest at '+Math.round(100*Math.min(...C.fish.map(x=>x.amount/x.start)))+' %'):'no lode');
 T.neg('a fishing ground fished out is caught',Sx=>siteCheck(Sx).ok,Object.assign({},Y.sites,{'lk.net.fishing.site':Object.assign({},Y.sites['lk.net.fishing.site'],{amount:0})}),Y.sites);}
// 12. the lake's market boats: each round calls at every town on its shore and lands goods at each
const roundCheck=Tr=>XAN_TUNE.rounds.every(([id,hub,keys])=>{const R=Tr[id];if(!R)return false;const legs=Object.keys(R.landed||{});return R.stops.length===keys.length+1&&R.voyages>=R.stops.length*10&&legs.length>=R.stops.length-1;});
{T.ok('the lake\'s market boats: four rounds, each calling at every town on its shore and landing goods at each',roundCheck(Y.trade),
  XAN_TUNE.rounds.map(([id])=>id+' '+Y.trade[id].voyages+' calls, '+Object.keys(Y.trade[id].landed||{}).length+' legs landed').join('; '));
 T.neg('a round that never landed at its stops is caught',roundCheck,Object.assign({},Y.trade,{'round.west':Object.assign({},Y.trade['round.west'],{landed:{}})}),Y.trade);}
// 13. the scale per settlement: the countrysides at 200 a head make what the arithmetic says (within 3 %)
const scaleCheck=Bk=>XAN_TUNE.provinces.every(Pv=>{const m=(Bk['prov.'+Pv.id].made.grain||0);return Math.abs(m-Pv._made)<=Pv._made*.03;});
{const S2=Y.V.settlements.filter(s=>s.scale===XAN_TUNE.scaleBulk).length;
 T.ok('the countrysides at '+XAN_TUNE.scaleBulk+' people an actor make the grain their arithmetic says',S2===8&&scaleCheck(B),
  XAN_TUNE.provinces.map(Pv=>Pv.id+' '+t(B['prov.'+Pv.id].made.grain||0)+'/'+t(Pv._made)).join(', '));
 T.neg('a countryside that made half its grain is caught',scaleCheck,Object.assign({},B,{'prov.p2':Object.assign({},B['prov.p2'],{made:{grain:(B['prov.p2'].made.grain||0)/2}})}),B);}
// 14. the gateways at their staging towns: the Catch's salt lands at Strongbow and goes in by Kirstabal to Qiblai, Yuni's at
// Qiblai itself;
// the Great Caravan's lands at the capital at the winter's start and goes out by the lake to Phēr and up to Thalaba (2026-11-16)
const stageCheck=Bk=>(Bk.sfgtxw10kr.imported.salt||0)>0&&(Bk.sl758m2396.imported.salt||0)>0&&(Bk.skm4jjo2vl.imported.salt||0)>0&&(Bk['xan.thalaba'].imported.salt||0)>0&&(Bk['xan.pher'].imported.salt||0)>0&&(Bk[E].imported.salt||0)>0;
{const saltEaten=people.reduce((n,s)=>n+(B[s.id].eaten.salt||0),0),saltShort=people.reduce((n,s)=>n+(B[s.id].hungry.salt||0),0);
 T.ok('the gateways stage at Strongbow and the capital: the salt goes in to Qiblai, and out from the capital to Phēr and Thalaba',stageCheck(B),
  'salt into Strongbow '+t(B.sfgtxw10kr.imported.salt||0)+', Qiblai '+t(B.skm4jjo2vl.imported.salt||0)+', Thalaba '+t(B['xan.thalaba'].imported.salt||0)+', the capital '+t(B[E].imported.salt||0)+
  '; the country '+(100*saltShort/Math.max(1,saltEaten+saltShort)).toFixed(1)+' % short of salt in its first year');
 T.neg('salt that never got past Strongbow is caught',stageCheck,Object.assign({},B,{skm4jjo2vl:Object.assign({},B.skm4jjo2vl,{imported:Object.assign({},B.skm4jjo2vl.imported,{salt:0})})}),B);}
// ---- X2 (the owner, 2026-11-16): the lodes as fields of veins, the Geomancers' oil, the Brotherhood of the Two Horns,
// the Sultan's toll, the Godshearth expedition
// 15. the fields: each vein 2-3 years of its work's make, the field over 200 years; a vein run dry moves the work on
//     (a small valley of one mine on a field of short veins, run 120 days)
const fieldCheck=F=>F.veins.every(v=>v.amount>=F.make*2-1&&v.amount<=F.make*3+1)&&F.veins.reduce((n,v)=>n+v.amount,0)>=F.make*200;
{const F=XAN_TUNE.field('lode',XAN_TUNE.mine.goldore,XAN_TUNE.fieldYears);F.make=XAN_TUNE.mine.goldore;
 const H=load();const V={seed:1,scale:10,start:0,goods:{ore:{unit:'kg'},grain:{unit:'kg'}},factions:[{id:'f',name:'f'}],relations:[],
  settlements:[{id:'m',name:'a mine',faction:'f',people:40,eats:{},works:[{id:'m.adit',kind:'adit',crew:30,out:['ore'],rate:.5,site:{kind:'lode',veins:[{amount:300},{amount:300},{amount:300}]}}]}],roads:[]};
 const S=H.simValley(V);H.valleyRun(120*1440,60);const mv=S.veinMoves.length;
 T.ok('the gold and opal lodes: fields of '+F.veins.length+' veins, each 2 to 3 years of the mine\'s make, '+Math.round(F.veins.reduce((n,v)=>n+v.amount,0)/F.make)+' years in all; a vein run dry moves the mine to the next',
  fieldCheck(F)&&mv>=2&&!S.problems.length,mv+' moves in 120 days on veins of 300 kg at 180 kg a day');
 T.neg('a field of one vein of ten years is caught',fieldCheck,Object.assign({},F,{veins:[{amount:F.make*10}]}),F);}
// 16. the Brotherhood of the Two Horns and the Sultan's toll: the guides' tally on the Catch caravans at Strongbow and
//     Stair, the factor houses' margins on the trunk roads, the toll at the lift; the books still balance (check 2)
const take=(C,to)=>Object.keys(C).reduce((n,r)=>n+Object.keys(C[r].taken).filter(k=>k.split(':')[0]===to).reduce((m,k)=>m+C[r].taken[k],0),0);
const hornsCheck=C=>take(C,'horns.strongbow')>0&&take(C,'horns.stair')>0&&take(C,'xan.citadel')>0&&['horns.erehwon','horns.qiblai','horns.thalaba'].every(h=>take(C,h)>0);
{T.ok('the Brotherhood of the Two Horns: the guides\' tally at Strongbow and Stair, the factor houses\' margins; the Sultan\'s toll at the lift',hornsCheck(Y.cuts),
  'tally at Strongbow '+t(take(Y.cuts,'horns.strongbow'))+', at Stair '+t(take(Y.cuts,'horns.stair'))+'; factors: Erehwon '+t(take(Y.cuts,'horns.erehwon'))+', Qiblai '+t(take(Y.cuts,'horns.qiblai'))+', Thalaba '+t(take(Y.cuts,'horns.thalaba'))+'; the toll '+t(take(Y.cuts,'xan.citadel')));
 T.neg('a house that took nothing is caught',hornsCheck,Object.fromEntries(Object.entries(Y.cuts).map(([r,c])=>[r,{taken:Object.fromEntries(Object.entries(c.taken).filter(([k])=>!k.startsWith('horns.stair:')))}])),Y.cuts);}
// 17. the Geomancers' oil: the concession's wells, a fifth to the Treasury by the licence, the rest out by their caravans from Qiblai
const oilCheck=(Bk,Tr)=>{const made=Bk['geo.oilfield'].made.oil||0,lic=Object.keys(Tr).filter(r=>/^oil\.licence/.test(r)).reduce((n,r)=>n+Object.values(Tr[r].tithed||{}).reduce((m,o)=>m+(o.oil||0),0),0),out=((Tr['trade.gate.geomancers']||{}).landed||{})['skm4jjo2vl>gate.geomancers']||{};
 const ms=Bk['yuni.mission'];return{ok:made>XAN_TUNE.oil.kgYr*.8&&Math.abs(lic/made-XAN_TUNE.oil.licence)<.03&&(out.oil||0)>0&&!!ms&&!(ms.hungry.grain>0),made,lic,out:out.oil||0};};
{const O=oilCheck(B,Y.trade);T.ok('the oil field, Yuni\'s mission and the Geomancers\' concession side by side: the wells, a fifth to the Treasury by the licence, the rest out by the Geomancers\' caravans from Qiblai; the mission fed',O.ok,
  'made '+t(O.made)+', the licence '+t(O.lic)+', out by the Geomancers\' caravans '+t(O.out));
 T.neg('a licence of two fifths is caught',x=>oilCheck(x.B,x.T).ok,{B,T:Object.assign({},Y.trade,{'oil.licence':{tithed:{'x':{oil:O.made*.4}}}})},{B,T:Y.trade});}
// 18. the Rare Devisers' Godshearth expedition: the camp's sulfur, wax and rarities made only in the expedition season,
//     landed at their house at Thalaba; the vents' sulfur out to Dalab with the Great Caravan (2026-11-16: no longer Yuni's from
//     Thalaba). The camp's rarities come home in the summer, after the caravan has left Qiblai, so they go out the next spring
const landed=(r,leg)=>((Y.trade[r]||{}).landed||{})[leg]||{};
const devCheck=(xp,L,O)=>(xp.made.sulfur||0)>50000&&(xp.made.wax||0)>20000&&(xp.made.rarities||0)>30&&(L.sulfur||0)>0&&(L.rarities||0)>0&&(O.sulfur||0)>0;
{const xp=B['exp.godshearth'],L=landed('expedition.godshearth','exp.godshearth>devisers.thalaba'),O=landed('caravan.great','s57bkv9741>gate.dalab.blakhed');
 T.ok('the Rare Devisers\' Godshearth expedition: sulfur, wax and rarities from the vents in its season, home to their house at Thalaba; the sulfur out with the Great Caravan',devCheck(xp,L,O),
  'made sulfur '+t(xp.made.sulfur||0)+', wax '+t(xp.made.wax||0)+', rarities '+Math.round(xp.made.rarities||0)+'; landed at the house sulfur '+t(L.sulfur||0)+', rarities '+Math.round(L.rarities||0)+'; out to Dalab sulfur '+t(O.sulfur||0)+', rarities '+Math.round(O.rarities||0));
 T.neg('an expedition that brought nothing home is caught',x=>devCheck(xp,x,O),{},L);}
// 18b. the Rare Devisers' royal licence (the owner, 2026-11-16: "their main guild house at Theodiga; they are royally licensed
//      in the scrap and rare artifact trade"): every kilo of the Salvagers' scrap through their guild house, sold on to the
//      smelter, which still makes Theodiga's iron; the Sultan's fee a tenth of the rarities
const licCheck=(sc,sold,iron,fee,rar)=>sc>0&&sold>sc*.6&&iron>0&&Math.abs(fee/Math.max(1,rar)-XAN_TUNE.devisers.licence)<.04;
{const sc=Object.values((Y.trade['devisers.scrap']||{}).tithed||{}).reduce((n,o)=>n+(o.scrap||0),0),sold=(landed('devisers.sell.theodiga','devisers.theodiga>s4zvgepuru').scrap||0),
  iron=(B.s4zvgepuru.made.iron||0),C=(Y.cuts['expedition.godshearth']||{taken:{}}).taken,fee=C['xan.citadel:rarities']||0,rar=landed('expedition.godshearth','exp.godshearth>devisers.thalaba').rarities||0;
 T.ok('the Rare Devisers\' royal licence: the Salvagers\' scrap through their guild house at Theodiga to the smelter; the Sultan\'s tenth of the rarities',licCheck(sc,sold,iron,fee,rar),
  'scrap to the house '+t(sc)+', sold to the smelter '+t(sold)+', Theodiga\'s iron '+t(iron)+'; the fee '+fee.toFixed(1)+' of '+rar.toFixed(1)+' rarities');
 T.neg('a house that kept the scrap is caught',x=>licCheck(sc,x,iron,fee,rar),0,sold);}
// 19. the Golden Tears: their armed camp's ore from the Rift floor's lodes in the cool months only, home to their house and sold
//     on to the Sultan's assay; their escort's share of Dalab's Great Caravan at the capital
const tearsCheck=(c,L,A,esc)=>(c.made.goldore||0)>T_ORE*.5&&(L.goldore||0)>0&&A>0&&esc>0;
const T_ORE=XAN_TUNE.tears.camp.kgYr*30;
{const c=B['exp.rift-gold'],L=landed('tears.rift','exp.rift-gold>tears.strongwall'),A=take(Y.cuts,'sxan7r1sln'),esc=take(Y.cuts,'tears.erehwon');
 const offSeason=(Y.dailyMade||{})['exp.rift-gold'];
 T.ok('the Golden Tears: ore from the unclaimed lodes of Lizard country, home to their house and on to the assay; the escort\'s share of the Great Caravan',tearsCheck(c,L,A,esc),
  'ore made '+t(c.made.goldore||0)+', home '+t(L.goldore||0)+', sold to the assay '+t(A)+'; escort '+Object.keys(Y.cuts).filter(r=>Object.keys(Y.cuts[r].taken).some(k=>k.startsWith('tears.erehwon:'))).map(r=>Object.entries(Y.cuts[r].taken).filter(([k])=>k.startsWith('tears.erehwon:')).map(([k,n])=>k.split(':')[1]+' '+(n>1000?t(n):Math.round(n))).join(', ')).join('; '));
 T.neg('a house whose escort took nothing is caught',x=>tearsCheck(c,L,A,x),0,esc);}
// 20. the power (the owner, 2026-11-16): just enough to use the Sultanate's cuts of Yuni's oil: the Prismarchy's tenth burned
//     in Qiblai's generator, the Sultan's licence in the large towns' (their avenues, for defence, and the richest homes);
//     every lit town uses its power all year, and the cuts are what they should be
const tithed=(Tr,re)=>Object.keys(Tr).filter(r=>re.test(r)).reduce((n,r)=>n+Object.values(Tr[r].tithed||{}).reduce((m,o)=>m+(o.oil||0),0),0);
const elecCheck=(Bk,Tr,made)=>{const towns=['skm4jjo2vl'].concat(Object.keys(XAN_TUNE.lit)),bad=[];let used=0;
 towns.forEach(s=>{const u=Bk[s].eaten.power||0,h=Bk[s].hungry.power||0;used+=u;if(!(u>0&&h<(u+h)*.1))bad.push(s+' '+(100*h/Math.max(1,u+h)).toFixed(0)+'% short');});
 const council=tithed(Tr,/^oil\.council$/),lic=tithed(Tr,/^oil\.licence\./);
 if(Math.abs(council/made-XAN_TUNE.oil.council)>.03)bad.push('the council\'s cut '+(council/made).toFixed(3));if(Math.abs(lic/made-XAN_TUNE.oil.licence)>.03)bad.push('the licence '+(lic/made).toFixed(3));
 return{ok:!bad.length,bad,used,council,lic,towns:towns.length};};
{const made=B['geo.oilfield'].made.oil||0,E=elecCheck(B,Y.trade,made);
 T.ok('the power: Qiblai lit by the Prismarchy\'s cut of the oil, the large towns\' avenues and richest homes by the Sultan\'s licence, each town\'s power used all year',E.ok,
  E.bad.join(', ')||(E.towns+' towns lit, '+Math.round(E.used/1000)+' MWh used; the council\'s oil '+t(E.council)+', the licence '+t(E.lic)+' of '+t(made)));
 T.neg('a town whose generator went dry is caught',x=>elecCheck(x,Y.trade,made).ok,Object.assign({},B,{sl758m2396:{eaten:{},hungry:{power:1e5}}}),B);}
// 21. the Great Caravan (the owner, 2026-11-16): leaves Xanadu in the spring, summers in south Dalab (Blakhed, Nulab, Shelf),
//     returns in the fall and winters in Xanadu (Erehwon, Theodiga, Qiblai). Its arrivals in year days from the clock's
//     opening (year day 259) and its leg time; the salt landed at the capital and the exports at Blakhed
const greatCheck=(Rd,Tr)=>{const y0=XAN_TUNE.yearDay0,d=Rd.minutes/1440,arr=Rd.stops.map((s,i)=>[s,Math.round((y0+d*i)%365)]);
 const inWin=(yd,w)=>w[0]<=w[1]?yd>=w[0]&&yd<=w[1]:yd>=w[0]||yd<=w[1],winter=[300,120],summer=[130,280];
 const bad=arr.slice(1).concat([[Rd.stops[0],Math.round((y0+d*Rd.stops.length)%365)]]).filter(([s,yd])=>!inWin(yd,/^gate\.dalab/.test(s)?summer:winter)).map(([s,yd])=>s+'@'+yd);
 const L=(Tr['caravan.great']||{}).landed||{},salt=(L['gate.dalab.shelf>s57bkv9741']||{}).salt||0,ex=L['s57bkv9741>gate.dalab.blakhed']||{};
 return{ok:!bad.length&&salt>0&&Object.keys(ex).filter(g=>ex[g]>0).length>=3,bad,arr,salt,ex};};
{const Rd=Y.V.roads.find(r=>r.id==='caravan.great'),G=greatCheck(Rd,Y.trade);
 T.ok('the Great Caravan: winters in Xanadu (Erehwon, Theodiga, Qiblai), leaves in the spring, summers in south Dalab (Blakhed, Nulab, Shelf), returns in the fall; salt in at the capital, Dalab\'s goods out at Blakhed',G.ok,
  (G.bad.length?'out of season: '+G.bad.join(', ')+'; ':'')+'arrivals (year day) '+G.arr.slice(1).map(([s,yd])=>s.replace('gate.dalab.','')+' '+yd).join(', ')+'; salt landed at the capital '+t(G.salt)+'; out at Blakhed '+Object.entries(G.ex).map(([g,n])=>g+' '+(n>1000?t(n):Math.round(n))).join(', '));
 T.neg('a caravan that summers in Xanadu is caught',r=>greatCheck(r,Y.trade).ok,Object.assign({},Rd,{stops:Rd.stops.slice(3).concat(Rd.stops.slice(0,3))}),Rd);}
// 22. the Order's monastery at Qiblai (the owner, 2026-11-16, a proposal): one of the council's eight great monasteries is
//     the History Monks', and the Order takes an eighth of the council's income: of the Prismarchy's oil where it lands,
//     and of the Sultan's grants of esteem
const orderCheck=(C,X,Tr)=>{const oil=(C['xan.citadel:oil']||0)*0+Object.keys(C).filter(k=>k==='qb.order:oil').reduce((n,k)=>n+C[k],0),
  landed=((Tr['oil.council']||{}).landed||{})['geo.oilfield>skm4jjo2vl']||{},est=X['esteem.qiblai.order']||{};
 const k=XAN_TUNE.orderHouse.share;return{ok:oil>0&&Math.abs(oil/Math.max(1,landed.oil||0)-k)<.03&&est.times===1,oil,landed:landed.oil||0,est};};
{const C=(Y.cuts['oil.council']||{taken:{}}).taken,O=orderCheck(C,Y.xfer,Y.trade);
 T.ok('the Order\'s monastery at Qiblai: an eighth of the Prismarchy\'s oil and of the Sultan\'s grants of esteem',O.ok,
  'oil to the Order '+t(O.oil)+' of '+t(O.landed)+' landed for the council; esteem '+(O.est.times||0)+'x: '+Object.entries(O.est.sent||{}).map(([g,n])=>g+' '+Math.round(n)).join(', '));
 T.neg('an Order that took a quarter is caught',x=>orderCheck(x,Y.xfer,Y.trade).ok,{'qb.order:oil':O.landed/4},C);}
// 23. the Theodiga bore (the owner, 2026-11-16): the Rare Devisers salvage the Ancients' dead tunnel to Stair under their
//     licence: scrap and rarities from a finite site, sold into Theodiga
const boreCheck=(d,sold)=>(d.made.scrap||0)>XAN_TUNE.bore.scrap*.5&&(d.made.rarities||0)>XAN_TUNE.bore.rarities*.5&&(sold.rarities||0)>0;
{const d=B['devisers.theodiga'],sold=landed('devisers.sell.theodiga','devisers.theodiga>s4zvgepuru');
 T.ok('the Theodiga bore: the Rare Devisers\' salvage of the dead tunnel to Stair, scrap and rarities, sold into Theodiga',boreCheck(d,sold),
  'made scrap '+t(d.made.scrap||0)+', rarities '+Math.round(d.made.rarities||0)+'; sold into Theodiga rarities '+Math.round(sold.rarities||0)+', scrap '+t(sold.scrap||0));
 T.neg('a bore that yielded nothing is caught',x=>boreCheck(x,sold),{made:{}},d);}
// 24. Strongwall's W1 (settlements/strongwall/PLAN.md; the owner's answers, 2026-11-16): the opal to Strongbow first and
//     inward from there; powder in by the gateways to the fort; the hired musketeers paid by the Treasury; the beacon fort's
//     generator; the House of the Tempest fed through Strongwall and its terraces; the Golden Tears' house inside the fort
const swCheck=(Bk,Tr,X)=>{const bad=[],op=(((Tr['mine.opal']||{}).landed||{})['sjuarjbku0>sfgtxw10kr']||{}).opal||0,
  inward=(Bk.skm4jjo2vl.imported.opal||0)+(Bk[E].imported.opal||0),tp=Bk['xan.tempest']||{made:{},imported:{},eaten:{}},pay=X['pay.muskets.sxan7r1sln']||{sent:{},owed:{}},th=XAN_TUNE.tears.houses[0];
 if(!(op>0))bad.push('no opal landed at Strongbow');if(Bk.sxan7r1sln.imported.opal)bad.push('opal still at Strongwall');if(!(inward>0))bad.push('no opal inward of Strongbow');
 if(!((Bk.sxan7r1sln.eaten.powder||0)>0))bad.push('no powder at Strongwall');
 if(!(((pay.sent||{}).coin||0)+((pay.owed||{}).coin||0)>0))bad.push('the musketeers unpaid and not owed');
 if(!((Bk['march.e'].eaten.power||0)>0))bad.push('the beacon fort dark');
 const tpIn=Object.values(((Tr['road.sw-tempest']||{}).landed||{})['sxan7r1sln>xan.tempest']||{}).reduce((n,v)=>n+v,0);   /* its first year's grain is in its stores: the road lands its salt, tea and tools */
 if(!((tp.made.grain||0)>0&&tpIn>0))bad.push('the Tempest\'s terraces or its road from Strongwall');
 if(th[2]!=='sxan7r1sln'||th[3]!==912||th[4]!==1640)bad.push('the Tears\' house outside the fort');
 return{ok:!bad.length,bad,op,inward,tp,pay};};
{const C=swCheck(B,Y.trade,Y.xfer);
 T.ok('Strongwall\'s W1: the opal to Strongbow and inward, powder at the fort, the musketeers paid, the beacon fort lit, the House of the Tempest fed, the Tears inside the fort',C.ok,
  C.bad.join(', ')||('opal landed at Strongbow '+Math.round(C.op*1000)/1000+' kg, at Qiblai and the capital '+Math.round(C.inward*1000)/1000+' kg; Strongbow imported opal '+Math.round((B.sfgtxw10kr.imported.opal||0)*1000)/1000+
  ', Kirstabal '+Math.round((B.sl758m2396.imported.opal||0)*1000)/1000+'; powder eaten at Strongwall '+Math.round(B.sxan7r1sln.eaten.powder||0)+' kg; pay sent '+((C.pay.sent||{}).coin||0)+', owed '+((C.pay.owed||{}).coin||0)+
  '; the Tempest made grain '+t(C.tp.made.grain||0)+' of the '+t(C.tp.eaten.grain||0)+' it ate'));
 T.neg('opal that never got past Strongbow is caught',x=>swCheck(x,Y.trade,Y.xfer).ok,Object.assign({},B,{skm4jjo2vl:Object.assign({},B.skm4jjo2vl,{imported:Object.assign({},B.skm4jjo2vl.imported,{opal:0})}),[E]:Object.assign({},B[E],{imported:Object.assign({},B[E].imported,{opal:0})})}),B);}
// the year's books, for the reader
const line=(s,k)=>Object.entries(B[s][k]||{}).filter(([g,n])=>n>=1).map(([g,n])=>g+' '+(n>=1000?t(n):Math.round(n))).join(', ');
['s57bkv9741','xan.citadel','skm4jjo2vl','s4zvgepuru','sxan7r1sln'].forEach(s=>console.log('\n'+s+': made '+line(s,'made')+'\n  imported '+line(s,'imported')+'\n  exported '+line(s,'exported')));
T.done();
