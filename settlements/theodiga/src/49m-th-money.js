/* ================================================================= THEODIGA TODAY: the money (records; draws nothing)
   [G data] T-money-1 (the owner, 2026-11-16: "Sultanate currency is the qud", relayed by the open-world session; LORE 6.13).
   core/simulation's money (77-sim-6-money.js, PLAN-MONEY.md M0 and M1) on Theodiga's economy (src/49-th-econ.js), as the
   isle demo keeps it (settlements/isle-demo/src/47m-isle-money.js, core/region 47m-region-money.js), for one town:
     THE CURRENCY  the qud, the Sultanate's coin; the Izani Talent beside it (the caravans' and the changers'). The qud's
                   coin and its rate are PROPOSED (the owner named only the coin): a thin struck gold coin of about a gram,
                   twenty to the Talent (0.05, the Kautoan shell's worth, so a day's wage reads alike across the nations)
     THE ACCOUNTS  the town's TREASURY (`treasury:theodiga`), `treasury` quds a person, owning every workplace to start; a
                   WORKPLACE account for every place with a recipe or wares; a HOUSEHOLD account for every home with
                   people, `endow` quds by its class (the kind of home: the square's and the bazaar's merchants middle, the
                   Devisers' lodge rich, the rest poor). The MESSES keep no purse: the arcology's clergy and lay servants
                   are kept by the Dome and the Devisers by their licence, fed from the warehouses, so they draw no wage
                   (`wage` 0 for the mess-fed) and what they take (a tool, a robe, the lamps' butter) is not paid for. Paid
                   as the isles' barracks are, their wages sat unspent and drained the treasury (35,000 quds in two days
                   of a test town). The hostels' pilgrims are guests: no purse, no ration. The money changers' reserves in
                   quds and Talents. Every opening sum is minted and booked, so the books balance from the first snapshot
     M1            every trade earns `wage` quds a rota hour, paid at midnight into its household; prices are each good's
                   labour cost at that wage times a markup, set after `calibrate` days of measuring; a good the town does not
                   make (the road's tea, charcoal and garments) costs its `fallback`. The treasury pays each household a
                   day's keep for each member with no work (core's ration: none here yet, every townsperson in the census
                   works), and covers what a household cannot pay (the dole). The treasury opens with `treasury` quds a
                   person (120, PROPOSED: twice the isles', so it holds a day's wages over its reserve)
   Not here yet: what the caravans pay for the scrap and the iron, and the Devisers' rarities (M3, the Talent's trade);
   the stations (a worker buying a shop) and moving prices (M2).
   TH_MONEY.declare(SIM, o) after TH_ECON.declare -> {currencies, accounts, households, messes, workplaces, treasury}
     o: the tune below, merged (a test's faults)
   TH_MONEY.books(SIM) -> a plain snapshot; TH_MONEY.checks(a, b, ledger) -> [{name, ok, detail}], from two snapshots
     (data only: the test can hand it a fault) */
var TH_MONEY=(function(){
 const S='theodiga';
 const TUNE={currencies:{talent:{name:'Izani Talent',talent:1,unit:'talent'},qud:{name:'Xanadu quds',talent:.05,unit:'qud'}},
  spread:.03,treasury:120,endow:{poor:300,middle:800,rich:3000},changers:{qud:20000,talent:1000},
  m1:{wage:6,calibrate:{after:2,days:3},ration:true,fallback:{_:30,tea:2,charcoal:20,garments:60}}};
 const CLASS={'home:square':'middle','home:bazaar':'middle','home:bore':'rich'};
 const clsOf=P=>CLASS[P.kind]||'poor';
 let LAST=null;
 function declare(SIM,o){if(!SIM.money||!SIM.econ||!SIM.econ(S))return null;
  const T=Object.assign({},TUNE,o||{}),M1=Object.assign({},TUNE.m1,(o&&o.m1)||{}),FB=M1.fallback;
  SIM.money({currencies:T.currencies,spread:T.spread,m1:{wage:a=>{const H=SIM.R.place[a.home];return H&&H.mess?0:M1.wage;},priceWage:M1.wage,calibrate:M1.calibrate,ration:M1.ration!==false,
   fallback:g=>FB[g]==null?FB._:FB[g]}});
  const out={currencies:Object.keys(T.currencies),households:[],messes:[],workplaces:[],treasury:'treasury:'+S};
  Object.keys(T.changers||{}).forEach(c=>{if(SIM.acct('changer:'+c)&&T.changers[c]>0)SIM.mint('changer:'+c,T.changers[c],'reserve');});
  const mint=(id,n,why)=>n>0?SIM.mint(id,Math.round(n),why):0;
  const people={};for(const a of SIM.all('actor'))if(!a.driven&&a.home!=null&&SIM.settlementOf(a)===S)people[a.home]=(people[a.home]||0)+1;
  const pop=Object.keys(people).reduce((n,k)=>n+people[k],0);
  SIM.account({id:out.treasury,owner:S,kind:'treasury',currency:'qud',settlement:S,name:'the treasury of Theodiga'});
  mint(out.treasury,T.treasury*pop,'reserve');
  const E=SIM.econ(S),I=SIM.ITEMS;
  const places=SIM.all('place').filter(P=>P.settlement===S).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
  for(const P of places){
   if(people[P.id]&&P.kind!=='hostel'){
    if(P.mess)out.messes.push(P.id);
    else{SIM.account({id:'hh:'+P.id,owner:P.id,kind:'household',currency:'qud',settlement:S});mint('hh:'+P.id,T.endow[clsOf(P)]||0,'endowment');out.households.push(P.id);}}
   if((E.recipes&&E.recipes[P.id])||(I&&I.sells&&I.sells[P.id]&&I.sells[P.id].length)){
    SIM.account({id:'wp:'+P.id,owner:P.id,kind:'workplace',currency:'qud',settlement:S,ownedBy:out.treasury});out.workplaces.push(P.id);}}
  SIM.moneyPrices(S);
  out.accounts=SIM.accounts().length;LAST=out;return out;}
 /* a plain snapshot: the accounts, the town's day rows, its prices and costs, what each good is made from */
 function books(SIM){const M=SIM.MONEY;if(!M||!LAST)return null;const C=M.m1,E=SIM.econ(S);
  const acc=SIM.accounts().map(A=>({id:A.id,kind:A.kind,currency:A.currency,settlement:A.settlement,ownedBy:A.ownedBy,balance:A.balance}));
  const made={};Object.keys(E.recipes).forEach(id=>{const R=E.recipes[id];if(R&&R.out)R.out.forEach(g=>{made[g]=1;});});
  return {minute:SIM.minute(),live:!!(C&&C.live),accounts:acc,expect:{households:LAST.households.slice(),messes:LAST.messes.slice(),workplaces:LAST.workplaces.slice(),treasury:LAST.treasury},
   days:C?(SIM.moneyM1(S).days[S]||[]).map(d=>Object.assign({},d)):[],today:C?Object.assign({},SIM.moneyM1(S).today[S]||{}):{},markup:C&&C.markup[S]!=null?C.markup[S]:null,
   prices:C&&C.price[S]?Object.assign({},C.price[S]):{},costs:C&&C.cost[S]?Object.assign({},C.cost[S]):{},
   inputs:JSON.parse(JSON.stringify(E.inputs||{})),made,report:SIM.moneyReport(S),ledger:SIM.ledgerSnap?SIM.ledgerSnap():null};}
 /* the checks over two snapshots (b after a, both after the market opened); `ledger`: core's SIM.ledger(a.ledger, b.ledger) */
 function checks(a,b,ledger){const res=[],ok=(name,pass,detail)=>res.push({name,ok:!!pass,detail});
  const byId={};b.accounts.forEach(A=>{byId[A.id]=A;});const miss=[];
  b.expect.households.forEach(h=>{const A=byId['hh:'+h];if(!A||A.currency!=='qud'||A.settlement!==S)miss.push('hh:'+h);});b.expect.messes.forEach(h=>{if(byId['hh:'+h])miss.push('hh:'+h+' (a mess keeps no purse)');});
  b.expect.workplaces.forEach(p=>{const A=byId['wp:'+p];if(!A||A.currency!=='qud'||A.ownedBy!==b.expect.treasury)miss.push('wp:'+p);});
  if(!byId[b.expect.treasury])miss.push(b.expect.treasury);
  ok('every household, workplace and the treasury has its account in quds, every workplace the treasury\'s; the messes none',!miss.length&&b.expect.households.length>0,
   miss.length?miss.length+' missing or wrong: '+miss.slice(0,4).join(', '):b.expect.households.length+' households, '+b.expect.workplaces.length+' workplaces; '+b.expect.messes.length+' messes kept by the Dome and the licence');
  const neg=b.accounts.filter(A=>A.balance<0).map(A=>A.id);
  const sup=Object.keys((b.report||{}).currencies||{}).map(c=>b.report.currencies[c].supply+' '+c).join(', ');
  ok('nobody holds less than nothing',!neg.length,neg.length?neg.slice(0,4).join(', '):sup);
  ok('the town\'s money is what its books say (the ledger)',!!ledger&&ledger.ok&&!!ledger.money,ledger&&ledger.ok?'balanced':(ledger?ledger.problems.slice(0,3).join('; '):'no ledger'));
  /* M1 */
  const bad=[];Object.keys(b.prices).forEach(g=>{const p=b.prices[g];if(!(p>=1)||Math.floor(p)!==p)bad.push(g+' '+p);
   const In=b.inputs[g];if(b.made[g]&&In&&b.costs[g]!=null){const ic=Object.keys(In).reduce((n,i)=>n+In[i]*(b.costs[i]||0),0);if(b.costs[g]<ic-1e-9)bad.push(g+' costs less than its inputs');}});
  const P=b.prices;ok('prices whole, at least 1, each made good dearer than its inputs',b.live&&Object.keys(P).length>0&&!bad.length,
   bad.length?bad.slice(0,4).join('; '):'markup '+(b.markup||1).toFixed(2)+': grain '+P.grain+', milk '+P.milk+', bread '+P.bread+', butter '+P.butter+', tea '+P.tea+', iron '+P.iron+', garments '+P.garments+', a meal out '+P.meal);
  /* the paid days between the snapshots: the history rows after a's, and the day under way (b's open row less a's) */
  const sub=(x,y)=>{const o={};Object.keys(x).forEach(k=>{if(typeof x[k]==='number')o[k]=x[k]-(typeof y[k]==='number'?y[k]:0);});return o;};
  const D=b.days.slice(a.days.length).concat([sub(b.today||{},a.today||{})]);let w=0,sp=0,dl=0,un=0,ra=0;D.forEach(d=>{w+=(d.wages||0)+(d.ration||0)+(d.takings||0)-(d.cover||0)-(d.placeBought||0);sp+=d.spent||0;dl+=d.dole||0;un+=d.unpaid||0;ra+=d.ration||0;});
  const bal=X=>{const o={};X.accounts.forEach(A=>{if(A.kind==='household'||A.kind==='mess')o[A.id]=A.balance;});return o;},h0=bal(a),h1=bal(b);
  const dh=Object.keys(h1).reduce((n,id)=>n+h1[id]-(h0[id]||0),0);
  ok('the circular flow: wages + rations = what the households spent + what they saved',a.live&&D.length>0&&w===sp+dh,(D.length-1)+' paid days and the day under way: '+w+' = '+sp+' + '+dh+(w===sp+dh?'':' (NOT)'));
  ok('the wage bill paid in full every day (the treasury and its workplaces never short)',D.length>0&&un===0&&w>0,un?un+' quds of wages or purchases unpaid':'wages and rations '+w+', the dole '+dl+' ('+(sp+dl>0?Math.round(100*dl/(sp+dl)):0)+'% of what was bought), rations '+ra);
  const tre=X=>X.accounts.filter(A=>A.settlement===S&&(A.kind==='treasury'||A.kind==='workplace')).reduce((n,A)=>n+A.balance,0),dt=tre(b)-tre(a);
  ok('the treasury breaks even, near enough (within a quarter of what it paid out)',w>0&&Math.abs(dt)<=.25*w,(dt>=0?'+':'')+dt+' on '+w+' paid out; the treasury holds '+(b.accounts.find(A=>A.id===b.expect.treasury)||{}).balance+', due in rations '+D.reduce((n,d)=>n+(d.rationDue||0),0));
  return res;}
 return {declare,books,checks,TUNE,CLASS};
})();
