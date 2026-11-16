// node settlements/longsong/tests/test-ls-economy.js — Longsong's valley on core/simulation for a year (phase S3 of
// core/simulation/PROPOSAL-LONGSONG-PINNACLE.md; the owner, 2026-11-11). The valley is the open world's plan
// (openworld/oidong-highrift/plan/sites.json: the ring of 15, the Order's three houses in the High Rift and their work
// camps), declared by core/region's valley host (core/region/50-region-valley.js) from Longsong's culture table
// (src/15-ls-tune.js), at the abstract level, with the seasons (77-sim-6-season.js), the tithe roads (SIM.trade `share`),
// the caravan to Xanadu and the grant of fealty and the grants of esteem (77-sim-6-transfer.js). It runs a year by the
// hour and holds the year to the proposal: each check with a negative.
const fs=require('fs'),path=require('path');
global.window=global;
const ROOT=path.join(__dirname,'..','..','..'),rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const load=()=>{(0,eval)(rd('core/clock/20-core-clock.js'));
 fs.readdirSync(path.join(ROOT,'core','simulation')).filter(f=>/^77-sim-.*\.js$/.test(f)).sort().forEach(f=>(0,eval)(rd('core/simulation/'+f)));
 (0,eval)(rd('core/region/00-region-core.js'));const H={TUNE:{sim:{}}};KREGION.use(H);(0,eval)(rd('core/region/50-region-valley.js'));
 (0,eval)(rd('settlements/longsong/src/15-ls-tune.js'));return H;};
const PLAN=JSON.parse(rd('openworld/oidong-highrift/plan/sites.json'));
let bad=0;const ok=(name,pass,neg,detail)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(detail?'  ('+detail+')':'')+(neg?' (its negative passed)':''));};
const t=n=>(n/1000).toFixed(1)+' t';
function year(o){o=o||{};const H=load(),V=LS_TUNE.valley(PLAN,o);if(o.edit)o.edit(V);const S=H.simValley(V);
 const daily={},a=SIM.ledgerSnap(),b0=H.valleyBooks();let prev={};
 for(let d=0;d<365;d++){H.valleyRun(1440,60);const B=H.valleyBooks();
  for(const s of S.order){const m=B.towns[s].made.grain||0,p=prev[s]||0;if(m>p+.5)(daily[s]||(daily[s]=[])).push(Math.floor(SIM.season(S.clock.m-60).yearDay));prev[s]=m;}}
 const b=SIM.ledgerSnap();return{H,V,S,a,b,B0:b0,B:H.valleyBooks(),daily,trade:SIM.tradeReport(),xfer:SIM.transfersReport(),ledger:SIM.ledger(a,b,{tol:1})};}
const t0=Date.now(),Y=year(),L='sq80bzd7ep',B=Y.B.towns,Ls=B[L];
console.log('a year of the valley in '+((Date.now()-t0)/1000).toFixed(1)+' s: '+Y.S.order.length+' settlements, '+SIM.all('actor').length+' actors');
// 1. declared: the house, the ring of 15, the Order's three houses and their camps, the Xanadu market
{const ring=Y.V.settlements.filter(s=>s.parent===L&&/hamlet/.test(s.id));
 ok('the valley declared from the open world\'s plan: the house, 15 villages, the rift\'s houses and camps, the market',Y.S.order.length===25&&ring.length===15&&!Y.S.problems.length,false,
  Y.S.order.length+' settlements, '+ring.length+' in the ring; problems: '+(Y.S.problems.slice(0,3).join('; ')||'none'));}
// 2. the books balance over the year, every settlement, every good
{const Lg=Y.ledger;
 ok('the year\'s books balance (opening + made + imported = consumed + spoiled + exported + closing), every settlement',Lg.ok,false,Lg.ok?'all goods':Lg.problems.slice(0,3).join('; '));}
// 3. the house is fed by its valley through winter and spring, and ends the year with its stores
{const open=Y.B0.towns[L].stock.grain||0,close=Ls.stock.grain||0,hungry=Ls.hungry.grain||0;
 const N=year({ring:['east','west','herders']}),Nl=N.B.towns[L];
 ok('Longsong is fed by its own valley: never short of grain all year, its granary as full at the year\'s end',hungry===0&&close>=open*.85,(Nl.hungry.grain||0)===0,
  'opened '+t(open)+', closed '+t(close)+', went without '+t(hungry)+'; with the old ring of three it went without '+t(Nl.hungry.grain||0));}
// 4. the tithe: two thirds of the farming villages' surplus, a share of what they made, on their OUT roads
{const R=Y.trade;let tg=0,est=0;Object.keys(R).filter(k=>/^tithe\.sq80bzd7ep/.test(k)).forEach(k=>{const tw=R[k].tithed||{};Object.keys(tw).forEach(leg=>{tg+=tw[leg].grain||0;});});
 Y.V.settlements.filter(s=>s.parent===L&&s.works[0].kind==='farmstead').forEach(s=>{const hh=PLAN.sites[0].hamlets.find(h=>h.id.replace(/\//g,'.')===s.id).census.households,made=hh*LS_TUNE.netKgHH(1),own=s.people*LS_TUNE.diet.village.grain*365;est+=(made-own)*LS_TUNE.farm.tithe;});
 ok('the tithe on the villages\' roads: two thirds of their surplus grain, within a tenth of the estimate',Math.abs(tg-est)<est*.1,tg<1,'tithed '+t(tg)+' against '+t(est));}
// 5. the seasons: the ring's fields made grain only at the harvest; the herds up to the summer pasture and down again
{const win=LS_TUNE.calendar.windows.harvest,outside=[];Object.keys(Y.daily).forEach(s=>{if(!/hamlet/.test(s))return;Y.daily[s].forEach(d=>{if(!(d>=win[0]&&d<=win[1]))outside.push(s+'@'+d);});});
 const moves=Y.S.moves,herds=Y.V.settlements.reduce((n,s)=>n+s.works.filter(w=>w.pasture).length,0);
 ok('the seasons: the fields made grain only at the harvest (year days '+win[0]+'-'+win[1]+'), every herd up to its summer pasture and home',outside.length===0&&Object.keys(Y.daily).length>10&&moves.length===2*herds,
  outside.length>0||moves.length<2,outside.slice(0,3).join(', ')+(outside.length?'; ':'')+moves.length+' herd moves for '+herds+' herds');}
// 6. the grant of fealty and the grants of esteem: once each, the fixed bill each way
{const X=Y.xfer,f=X.fealty,e=X.esteem,F=LS_TUNE.fealty,same=(a,b)=>Object.keys(b).every(g=>Math.abs((a[g]||0)-b[g])<1e-6);
 const N=year({edit:V=>{V.settlements.find(s=>s.id===L).start.books=5000;}}),NX=N.xfer;
 ok('the grant of fealty and the grants of esteem: each once a year, exactly its fixed bill, landed at the other end',f.times===1&&e.times===1&&same(f.sent,F.bill)&&same(f.landed,F.bill)&&same(e.landed,F.esteem),
  !same(NX.fealty.sent,f.sent),'fealty '+JSON.stringify(f.sent)+'; esteem '+JSON.stringify(e.landed)+'; with far more books in store the same bill went');}
// 7. the caravan: salt, iron, tea and gold in; books, paper, silk, saffron and lenses out; never grain
{const C=Y.trade.caravan,inn=C.landed['xanadu-market>'+L]||{},out=C.landed[L+'>xanadu-market']||{};
 const allIn=Object.keys(inn).every(g=>LS_TUNE.caravan.in.indexOf(g)>=0),allOut=Object.keys(out).every(g=>LS_TUNE.caravan.out.indexOf(g)>=0);
 ok('the caravan carries salt and iron in and books and lenses out, never grain',allIn&&allOut&&inn.salt>0&&inn.iron>0&&out.books>0&&out.lenses>0&&!inn.grain&&!out.grain,(out.grain||inn.grain)>0,
  'in '+JSON.stringify(Object.fromEntries(Object.entries(inn).map(([g,n])=>[g,Math.round(n)])))+'; out '+JSON.stringify(Object.fromEntries(Object.entries(out).map(([g,n])=>[g,Math.round(n)]))));}
// 8. the Order's houses in the rift: the gjar fed by the Beck Fields and the grange, its crystal at Longsong's lens house
{const G=B.ssinggjar01,R=Y.trade['order.gjar-longsong'],cr=((R.landed||{})['ssinggjar01>'+L]||{}).crystal||0;
 ok('the Singing Gjar fed all year (the Beck Fields\' grain and the Mirror Grange\'s), its crystal ground into lenses at Longsong',(G.hungry.grain||0)===0&&cr>0&&(Ls.made.lenses||0)>0,false,
  'went without '+t(G.hungry.grain||0)+'; crystal landed '+Math.round(cr)+' kg; lenses made '+Math.round(Ls.made.lenses||0));}
// 9. no heavy industry: the Order's works are light crafts and relic work
{const kinds=[...new Set(Y.V.settlements.filter(s=>s.faction==='order').flatMap(s=>s.works.map(w=>w.kind)))],heavy=kinds.filter(k=>LS_TUNE.heavy.indexOf(k)>=0);
 ok('the Order keeps light crafts and relic work and no heavy industry (the owner, 2026-11-11)',!heavy.length,['foundry'].some(k=>LS_TUNE.heavy.indexOf(k)<0),kinds.join(', '));}
// 10. the long run (2026-11-12, the owner: "what happens to needs, stocks, happiness and resources over time"): three years,
// the valley keeps itself fed. The food the valley eats (grain, dairy, salt, tea) goes short by under 1.5 % in the third
// year and by no more than a quarter over the second's. The negative: the long roads without their `want` (the host's
// one-week horizon, the tune before 2026-11-12) let the caravan bring a quarter of the salt and the houses in the rift
// starve from the second year
function years(n,edit){const H=load(),V=LS_TUNE.valley(PLAN,{});if(edit)edit(V);H.simValley(V);const yr=[];let p=H.valleyBooks();
 for(let y=0;y<n;y++){H.valleyRun(1440*365,60);const B=H.valleyBooks();let us=0,sh=0;
  for(const s in B.towns)for(const g of ['grain','dairy','salt','tea']){us+=(B.towns[s].used[g]||0)-((p.towns[s].used||{})[g]||0);sh+=(B.towns[s].short[g]||0)-((p.towns[s].short||{})[g]||0);}
  yr.push({used:us,short:sh,share:us>0?sh/us:1});p=B;}
 return yr;}
{const Y3=years(3),N3=years(3,V=>V.roads.forEach(R=>{delete R.want;})),pass=y=>y[2].share<.015&&y[2].short<=y[1].short*1.25+1000;
 ok('three years: the valley stays fed (the third year\'s food under 1.5 % short, not growing)',pass(Y3),pass(N3),
  Y3.map((y,i)=>'year '+(i+1)+' '+(100*y.share).toFixed(2)+' % short').join(', ')+'; without the long roads\' want: '+N3.map(y=>(100*y.share).toFixed(2)+' %').join(', '));}
// the year's books, for the reader
console.log('\nLongsong: made '+Object.entries(Ls.made).map(([g,n])=>g+' '+Math.round(n)).join(', ')+'\n  imported '+Object.entries(Ls.imported).map(([g,n])=>g+' '+Math.round(n)).join(', ')+'\n  exported '+Object.entries(Ls.exported).map(([g,n])=>g+' '+Math.round(n)).join(', ')+'\n  ate '+Object.entries(Ls.eaten).map(([g,n])=>g+' '+Math.round(n)).join(', '));
console.log(bad?'\n'+bad+' FAILED':'\nOK');process.exit(bad?1:0);
