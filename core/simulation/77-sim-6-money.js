// ================================================================= CORE — simulation 6: money (accounts and the books)
// core/simulation/PLAN-MONEY.md, M0 (the owner's answers of 2026-11-03: each nation its own currency, the Izani Talent the
// trade's money; an account and an owner for every workplace). Opt-in: nothing here runs until a world calls
// SIM.money(config), and nothing here draws a number or changes a record but the accounts, so a world that does not
// call it runs exactly as before.
//
// MONEY IS A BOOK ENTRY (the lesson of Dwarf Fortress's coins carried about): an account holds an integer balance in its
// currency's smallest unit. Every movement is one of four, each booked by its `why`:
//   SIM.mint(acct, n, why)            a FAUCET: money made (an opening endowment, a mint, a foreign buyer's coin)
//   SIM.burn(acct, n, why, whole?)    a SINK: money gone (lost, offered, paid off the map) -> what left
//   SIM.pay(from, to, n, why, whole?) a TRANSFER within one currency: neither made nor lost -> what moved. `whole`: all of
//                                     n or nothing; else as much as `from` holds. An account never goes below zero
//   SIM.exchange(from, to, n, why)    between currencies, through the money changers: `from` pays n to the changer of its
//                                     currency, the changer of `to`'s pays the value at the rates to the Talent, less
//                                     the `spread` (the changers' living) -> what `to` got. Two transfers, so each
//                                     currency is conserved; refused whole when the changer cannot pay
// Only mint and burn change a currency's supply (the faucets and sinks of PLAN-MONEY.md section 1; the closed loop with
// no drain was Ultima Online's failure).
//
//   SIM.money({currencies: {id: {name, talent (its value in Talents), unit?}}, spread? (0.03), changers? (true)}) -> SIM.MONEY
//   SIM.account({id, owner, kind, currency, settlement?, ownedBy?, name?}) -> the account (balance 0: SIM.mint gives it
//                                     money). kind: household, workplace, treasury, guild, changer, foreign, player, other.
//                                     ownedBy: the account of a workplace's owner (the treasury to start: PLAN-MONEY 2a)
//   SIM.acct(id) -> the account       SIM.accounts(q?) -> those matching {kind, settlement, currency, ownedBy}
//   SIM.moneyReport(settlement?) -> {currencies: {id: {supply, accounts, minted: {why}, burned: {why}, paid: {why}}},
//                                     towns: {s: {id: {total, minted, burned, in, out}}}}: the monthly report's numbers
//   SIM.moneySnap() -> plain data for the ledger (77-sim-7-ledger.js: SIM.ledgerSnap carries it as `money`)
// WAGES, PRICES AND PURCHASES (PLAN-MONEY.md M1, opt-in by SIM.money's `m1`): money is measured, not yet a limit on
// anything (a household that cannot pay is fed on its treasury's dole, booked), so the goods' economy runs as before.
//   m1: {wage(a) -> money an hour (the rota's hours, paid at midnight), priceWage (the wage prices are costed at),
//        fallback (a good no settlement of the currency makes), calibrate (n days, true 1, or {after, days}: a warm-up of
//        `after` days, then `days` days that measure; none of them pay a purchase, then each settlement's markup is set so its households' spending at cost x markup equals its wage
//        bill over them, and prices are fixed),
//        ration (true: THE CHIEF'S REDISTRIBUTION: the treasury pays each household, at midnight, after the wages, a day's
//        keep for each member with no work (the calibration's cost of a person's day, at the markup), or the same share of it
//        for every household when the treasury holds less (it shares out what it holds over `keep` days of wages, 1: `rationShare`), and the markup is set so the wage bill
//        buys the earners' own keep: so a wage keeps its earner, the ration the rest, and the treasury balances),
//        household(homeId), seller(placeId), treasury(s) -> account ids (default 'hh:', 'wp:', 'treasury:' + id)}
//   SIM.moneyPrices(s) -> {good: price}: each good's LABOUR COST (its makers' worker-hours a unit at `priceWage`, the
//                          mean over its makers, plus its inputs' costs, down the chain), times the settlement's markup,
//                          whole and at least 1; a meal out is its `perMeal` servings at the mean food price
//   SIM.moneyBuy(home, sellerPlace, good, n, s)  a household's purchase: paid to the seller (else the treasury), whole;
//                          what it cannot pay the treasury pays (`dole`; from its own shelves, given: counted, no money
//                          moves). The items call it (77-sim-6-items.js)
//   SIM.moneyStep(minute)  SIM.step's, at midnight: the calibration; the day's takings swept to the workplaces' owners;
//                          the payroll (each employed person's rota hours of the day before, not while held; from its
//                          workplace's account, its owner covering what the till lacks); the rations
//   SIM.moneyM1(s) -> {markup, live, wages, spent, dole, atCost} the day's numbers by settlement
//   m2: {k, lo, hi, smooth, level: {gain, step} | false} (opt-in, PLAN-MONEY.md M2): prices that move, each night (m2Day below)
//   ration: on by default with m1 (the owner, 2026-11-03: the chief's redistribution everywhere until households are true
//        households); `ration: false` turns it off
// THE BOOKS, per settlement and currency: opening + minted - burned + in - out = closing, where in and out are payments
// between accounts of two settlements (an account with no settlement is the crater's: '' in the books). Across the
// settlements of a currency, what went out is what came in.
(function(G){
  'use strict';
  var SIM=G.SIM;
  function int(n, what){ if(!(typeof n==='number' && isFinite(n) && Math.floor(n)===n && n>=0)) throw new Error('SIM money: '+what+' must be a whole number >= 0, not '+n); return n; }
  function bump(o, k, n){ o[k]=(o[k]||0)+n; }
  function key(s){ return s==null ? '' : s; }
  function book(s, c){ var M=SIM.MONEY, T=M.books[key(s)]||(M.books[key(s)]={}); return T[c]||(T[c]={ minted:0, burned:0, 'in':0, out:0 }); }
  function flows(c){ var M=SIM.MONEY; return M.flows[c]||(M.flows[c]={ minted:{}, burned:{}, paid:{} }); }

  SIM.money = function(o){
    var M={ cur:{}, acc:{}, order:[], books:{}, flows:{}, spread:o.spread==null ? 0.03 : o.spread };
    if(o.m1) M.m1={ wage:o.m1.wage||null, priceWage:o.m1.priceWage==null ? 1 : o.m1.priceWage, fallback:o.m1.fallback, calibrate:o.m1.calibrate===true ? 1 : typeof o.m1.calibrate==='object' && o.m1.calibrate ? (o.m1.calibrate.days|0) : (o.m1.calibrate|0), calAfter:o.m1.calibrate && typeof o.m1.calibrate==='object' ? (o.m1.calibrate.after|0) : 0, live:!o.m1.calibrate, cal:{}, sweep:o.m1.sweep,
      household:o.m1.household, seller:o.m1.seller, treasury:o.m1.treasury, cost:{}, price:{}, markup:{}, day:{}, history:{}, busyTown:{}, ration:{}, rationOn:o.m1.ration!==false, keep:o.m1.keep, perKeep:{}, rel:{}, cpi:{},
      m2:o.m2 ? { k:o.m2.k==null ? 0.5 : o.m2.k, lo:o.m2.lo==null ? 0.5 : o.m2.lo, hi:o.m2.hi==null ? 2 : o.m2.hi, smooth:o.m2.smooth==null ? 3 : o.m2.smooth,
        gain:(o.m2.level||{}).gain==null ? 0.5 : o.m2.level.gain, step:(o.m2.level||{}).step==null ? 0.05 : o.m2.level.step, level:o.m2.level!==false } : null };
    Object.keys(o.currencies||{}).forEach(function(c){ var C=o.currencies[c]; if(!(C.talent>0)) throw new Error('SIM.money: currency '+c+' needs its value in Talents');
      M.cur[c]={ id:c, name:C.name||c, talent:C.talent, unit:C.unit||c }; });
    SIM.MONEY=M;
    if(o.changers!==false) Object.keys(M.cur).forEach(function(c){ SIM.account({ id:'changer:'+c, owner:'changers', kind:'changer', currency:c, name:'the money changers ('+M.cur[c].name+')' }); });
    return M;
  };
  SIM.account = function(o){
    var M=SIM.MONEY; if(!M) throw new Error('SIM.account: call SIM.money first'); if(!o.id) throw new Error('SIM.account: an id');
    if(!M.cur[o.currency]) throw new Error('SIM.account '+o.id+': unknown currency '+o.currency);
    if(M.acc[o.id]) throw new Error('SIM.account: duplicate id '+o.id);
    var A={ id:o.id, owner:o.owner==null ? null : o.owner, kind:o.kind||'other', currency:o.currency, settlement:o.settlement==null ? null : o.settlement,
      ownedBy:o.ownedBy==null ? null : o.ownedBy, name:o.name||null, balance:0 };
    M.acc[o.id]=A; M.order.push(o.id); return A;
  };
  SIM.acct = function(id){ var M=SIM.MONEY; return M ? M.acc[id]||null : null; };
  SIM.accounts = function(q){ var M=SIM.MONEY; if(!M) return []; q=q||{};
    return M.order.map(function(id){ return M.acc[id]; }).filter(function(A){
      return (q.kind==null || A.kind===q.kind) && (q.settlement===undefined || A.settlement===q.settlement) && (q.currency==null || A.currency===q.currency) && (q.ownedBy==null || A.ownedBy===q.ownedBy); }); };
  function get(id){ var A=SIM.MONEY && SIM.MONEY.acc[id]; if(!A) throw new Error('SIM money: unknown account '+id); return A; }

  SIM.mint = function(id, n, why){ var A=get(id); int(n, 'a mint'); if(!n) return 0; A.balance+=n; book(A.settlement, A.currency).minted+=n; bump(flows(A.currency).minted, why||'minted', n); return n; };
  SIM.burn = function(id, n, why, whole){ var A=get(id); int(n, 'a burn'); var k=whole ? (A.balance>=n ? n : 0) : Math.min(n, A.balance); if(!k) return 0;
    A.balance-=k; book(A.settlement, A.currency).burned+=k; bump(flows(A.currency).burned, why||'burned', k); return k; };
  SIM.pay = function(from, to, n, why, whole){ var F=get(from), T=get(to); int(n, 'a payment');
    if(F.currency!==T.currency) throw new Error('SIM.pay '+from+' > '+to+': '+F.currency+' to '+T.currency+' (use SIM.exchange)');
    var k=whole ? (F.balance>=n ? n : 0) : Math.min(n, F.balance); if(!k || from===to) return 0;
    F.balance-=k; T.balance+=k; bump(flows(F.currency).paid, why||'paid', k);
    if(key(F.settlement)!==key(T.settlement)){ book(F.settlement, F.currency).out+=k; book(T.settlement, T.currency)['in']+=k; }
    return k; };
  SIM.exchange = function(from, to, n, why){ var M=SIM.MONEY, F=get(from), T=get(to); int(n, 'an exchange');
    if(F.currency===T.currency) return SIM.pay(from, to, n, why, true);
    var CF=M.acc['changer:'+F.currency], CT=M.acc['changer:'+T.currency]; if(!CF || !CT) throw new Error('SIM.exchange: no money changers for '+F.currency+' and '+T.currency);
    var got=Math.floor(n*M.cur[F.currency].talent/M.cur[T.currency].talent*(1-M.spread));
    if(!n || F.balance<n || CT.balance<got || !got) return 0;   /* whole, or not at all */
    SIM.pay(from, CF.id, n, (why||'exchange')+' (in)', true); SIM.pay(CT.id, to, got, (why||'exchange')+' (out)', true);
    return got; };

  /* ---------------------------------------------------------------- M1: prices, wages, purchases */
  function m1(){ var M=SIM.MONEY; return M && M.m1; }
  function ids(s){ var C=m1(); return { hh:C.household || function(h){ return 'hh:'+h; }, wp:C.seller || function(p){ return 'wp:'+p; }, tre:C.treasury || function(t){ return 'treasury:'+t; } }; }
  function day1(s){ var C=m1(), k=key(s); return C.day[k]||(C.day[k]={ wages:0, ration:0, rationDue:0, rationShare:null, spent:0, dole:0, atCost:0, paid:0, hours:0, unpaid:0 }); }
  function econKey(s){ return SIM.ECONS ? SIM.econ(s) : SIM.ECON; }
  function costIn(o, g){ var C=m1(), k=key(o); if(C.cost[k]) return C.cost[k][g]; if(C.busyTown[k]) return null; C.busyTown[k]=1; var c=costs(o); C.busyTown[k]=0; C.cost[k]=c; return c[g]; }
  function makes(o, g){ var E=econKey(o); return !!E && Object.keys(E.recipes).some(function(id){ var R=E.recipes[id]; return R && !R.herd && R.out && R.out.indexOf(g)>=0; }); }
  function costs(s){ var C=m1(), E=econKey(s), memo={}, busy={}, hrs={};
    if(!E) return {};
    Object.keys(E.recipes).forEach(function(id){ var R=E.recipes[id]; if(!R || R.herd || !R.out || !R.out.length) return;
      var base=(E.govern && E.govern.rates && E.govern.rates[id]!=null) ? E.govern.rates[id] : R.rate, St=R.site!=null && E.resSites ? E.resSites[R.site] : null, y=St ? St.yield : 1;
      if(!(base>0)) return;
      R.out.forEach(function(g){ var per=R.batch ? base*(R.batch.out[g]||0)*y : base*y; if(per>0) (hrs[g]||(hrs[g]=[])).push(1/per); }); });
    function cost(g){ if(memo[g]!=null) return memo[g]; if(busy[g]) return 0; busy[g]=1;
      var H=hrs[g], c;
      if(!H){ c=null; (SIM.ECON_ORDER||[]).forEach(function(o){ if(c==null && o!==s && makes(o, g)){ var x=costIn(o, g); if(x>0) c=x; } });   /* made elsewhere: its cost where it is made */
        if(c==null) c=typeof C.fallback==='function' ? C.fallback(g) : (C.fallback==null ? 10 : C.fallback); }
      else { var h=H.reduce(function(a, b){ return a+b; }, 0)/H.length, In=E.inputs[g]||{}; c=C.priceWage*h; Object.keys(In).forEach(function(i){ c+=In[i]*cost(i); }); }
      busy[g]=0; return (memo[g]=c); }
    var out={}; Object.keys(E.goods).forEach(function(g){ out[g]=cost(g); });
    var F=(E.meal && E.meal.foods) || [], per=(E.meal && E.meal.per) || 2;
    if(F.length) out.meal=per*F.reduce(function(a, f){ return a+(out[f]||0); }, 0)/F.length;
    return out; }
  SIM.moneyPrices = function(s){ var C=m1(); if(!C) return null; var k=key(s); if(!C.cost[k]) costIn(s, null); var c=C.cost[k], mk=C.markup[k]==null ? 1 : C.markup[k], P=C.price[k]={};
    var R=C.rel[k]||{}; Object.keys(c).forEach(function(g){ P[g]=Math.max(1, Math.round(c[g]*mk*(R[g]==null ? 1 : R[g]))); }); return P; };   /* M2: times its scarcity (rel) */
  function priceOf(s, g){ var C=m1(), k=key(s); if(!C.price[k]) SIM.moneyPrices(s); var p=C.price[k][g]; return p==null ? null : p; }
  SIM.moneyBuy = function(home, place, g, n, s){ var C=m1(); if(!C || !(n>0)) return 0; var M=SIM.MONEY, I=ids(s), D=day1(s), k=key(s);
    if(!C.cost[k]) costIn(s, null); var cst=C.cost[k][g]; if(cst!=null) D.atCost+=cst*n;
    if(!C.live) return 0;   /* the calibration day: measured, not paid */
    var p=priceOf(s, g); if(p==null) return 0; var due=p*n, buyer=I.hh(home), seller=place!=null && M.acc[I.wp(place)] ? I.wp(place) : I.tre(s);
    if(!M.acc[buyer] || !M.acc[seller]) return 0;
    var got=SIM.pay(buyer, seller, due, 'purchase'); D.spent+=got; var rest=due-got; if(!rest) return got;   /* what it holds, then the dole for the rest */
    if(seller===I.tre(s)){ D.dole+=rest; return got; }   /* the treasury's own shelves: the rest given, no money moves */
    var dole=SIM.pay(I.tre(s), seller, rest, 'dole', true); if(dole) D.dole+=dole; else D.unpaid+=rest; return got; };
  SIM.moneyM1 = function(s){ var C=m1(); if(!C) return null; var out={}; Object.keys(C.history).forEach(function(k){ if(s===undefined || k===key(s)) out[k]=C.history[k].slice(); });
    return { markup:Object.assign({}, C.markup), ration:Object.assign({}, C.ration), live:C.live, days:out, today:JSON.parse(JSON.stringify(C.day)) }; };
  /* the payroll and the calibration, at midnight */
  SIM.moneyStep = function(minute){ var C=m1(); if(!C || minute%1440 || minute===0) return; var M=SIM.MONEY, prev=minute-1440;
    if(!C.live && C.calibrate){   /* the calibration days measured: the markup that makes the households' spending the wage bill */
      if(Math.floor(prev/1440)>=C.calAfter) Object.keys(C.day).forEach(function(k){   /* after the warm-up (the opening restock's waves) */ var D=C.day[k], A=C.cal[k]||(C.cal[k]={ wb:0, atCost:0, people:0, earners:0 }), wb=0;
        SIM.all('actor').forEach(function(a){ if(a.driven || a.work==null || !a.present || key(SIM.R.settlement ? SIM.settlementOf(a) : null)!==k) return; var sc=SIM.schedOf(a, prev), h=0; if(sc) for(var i=0;i<24;i++) if(sc[i]==='WORK') h++; wb+=h*(C.wage ? C.wage(a) : 1); });
        var n=0, e=0; SIM.all('actor').forEach(function(a){ if(a.driven || !a.present || a.home==null || key(SIM.R.settlement ? SIM.settlementOf(a) : null)!==k) return; n++; if(a.work!=null) e++; });
        A.wb+=wb; A.atCost+=D.atCost; A.people+=n; A.earners+=e; A.days=(A.days||0)+1; });
      if(Math.floor(minute/1440)>=C.calAfter+C.calibrate){ Object.keys(C.cal).forEach(function(k){ var A=C.cal[k], per=A.people>0 ? A.atCost/A.people : 0;   /* a person's day at cost */
          var base=C.rationOn ? per*A.earners : A.atCost;   /* with the ration: the wage bill buys the earners' own keep; the treasury the rest */
          C.markup[k]=base>0 ? Math.max(1, A.wb/base) : 1; C.perKeep[k]=per; if(C.rationOn) C.ration[k]=Math.round(per*C.markup[k]); SIM.moneyPrices(k==='' ? null : k); }); C.live=true; C.opened=Math.floor(minute/1440); } }   /* the market opens: the last measured day's wages and rations are paid now */
    if(C.sweep!==false) Object.keys(M.acc).forEach(function(id){ var A=M.acc[id]; if(A.kind==='workplace' && A.ownedBy && A.balance>0 && M.acc[A.ownedBy]) SIM.pay(id, A.ownedBy, A.balance, 'takings'); });   /* the day's takings to their owners first: they pay the day's wages */
    if(C.live) SIM.all('actor').forEach(function(a){ if(a.driven || a.work==null || !a.present) return; var s=SIM.R.settlement ? SIM.settlementOf(a) : null; if(s!=null && !M.acc[ids(s).tre(s)]) return;
      if(a.cmd && a.cmd.by==='jail' && a.cmd.until>prev) return;   /* held: no wage */
      var sc=SIM.schedOf(a, prev), h=0; if(sc) for(var i=0;i<24;i++) if(sc[i]==='WORK') h++; if(!h) return;
      var w=Math.round(h*(C.wage ? C.wage(a) : 1)); if(!(w>0)) return;
      var I=ids(s), payer=M.acc[I.wp(a.work)] ? I.wp(a.work) : I.tre(s), to=I.hh(a.home); if(!M.acc[to]) return;
      var P=M.acc[payer]; if(P.balance<w && P.ownedBy && M.acc[P.ownedBy]) SIM.pay(P.ownedBy, payer, w-P.balance, 'cover', true);
      var paid=SIM.pay(payer, to, w, 'wage', true), D=day1(s); D.wages+=paid; D.hours+=h; if(!paid) D.unpaid+=w; });
    if(C.live && C.rationOn){ var dep={}; SIM.all('actor').forEach(function(a){ if(a.driven || !a.present || a.home==null || a.work!=null) return; if(a.cmd && a.cmd.by==='jail' && a.cmd.until>prev) return; dep[a.home]=(dep[a.home]||0)+1; });
      var due={}; Object.keys(dep).forEach(function(h){ var s=SIM.R.settlement ? SIM.settlementOf(h) : null, k=key(s); if(C.ration[k]>0) due[k]=(due[k]||0)+C.ration[k]*dep[h]; });
      var share={}; Object.keys(due).forEach(function(k){ var T=M.acc[ids(k==='' ? null : k).tre(k==='' ? null : k)], keep=(C.keep==null ? 1 : C.keep)*(day1(k==='' ? null : k).wages||0);   /* a day's wages kept in hand */
        share[k]=T && due[k]>0 ? Math.max(0, Math.min(1, (T.balance-keep)/due[k])) : 0;   /* what the treasury holds over that, shared out */
        var D=day1(k==='' ? null : k); D.rationDue=(D.rationDue||0)+due[k]; D.rationShare=share[k]; });
      Object.keys(dep).sort().forEach(function(h){ var s=SIM.R.settlement ? SIM.settlementOf(h) : null, k=key(s), r=C.ration[k], I=ids(s); if(!(r>0) || !M.acc[I.hh(h)] || !M.acc[I.tre(s)]) return;
        var n=Math.floor(r*dep[h]*share[k]); if(n>0){ var paid=SIM.pay(I.tre(s), I.hh(h), n, 'ration', true), D=day1(s); D.ration=(D.ration||0)+paid; } }); }   /* the chief's redistribution: each member with no work its keep */
    Object.keys(C.day).forEach(function(k){ (C.history[k]||(C.history[k]=[])).push(Object.assign({ day:Math.floor(prev/1440), markup:C.markup[k]==null ? 1 : C.markup[k] }, C.day[k])); });
    if(C.live && C.m2) Object.keys(C.day).forEach(function(k){ m2Day(k, C.day[k]); });
    C.day={}; };
  /* M2: PRICES THAT MOVE, at midnight after the payroll and the rations (PLAN-MONEY.md M2):
     - a good's SCARCITY: rel = (target / position)^k, clamped to [lo, hi], eased in over `smooth` days, from the governor's
       view of the good (77-sim-6-govern.js: its target, days of cover of its demand, and its whole supply line); a good the
       town does not govern keeps 1;
     - the PRICE LEVEL: the town's markup moves toward what makes its takings (the households' spending) meet its wage bill
       and the full rations due, both smoothed over `smooth` days (a town restocks in lumps): x(1 + gain x (owed - took) / owed), at most `step` a day; the ration a dependant, a
       day's keep, moves with it (the wages do not: a flat wage, the owner's call of 2026-11-03).
     Prices are whole, at least 1. The households buy what they need whatever the price (no elasticity yet), so the goods'
     economy runs as before; a dearer good makes its seller's takings larger, not the town hungrier */
  function m2Day(k, D){ var C=m1(), Z=C.m2, s=k==='' ? null : k, E=econKey(s), R=C.rel[k]||(C.rel[k]={});
    var V=E && E.govern && E.govern.view; if(V) Object.keys(V).forEach(function(g){ var v=V[g]; if(!(v && v.target>0)) return;
      var r=Math.pow(v.target/Math.max(v.pos, 1e-6), Z.k), want=Math.max(Z.lo, Math.min(Z.hi, r)), cur=R[g]==null ? 1 : R[g]; R[g]=cur+(want-cur)/Math.max(1, Z.smooth); });
    if(Z.level){ var A=(C.ema||(C.ema={}))[k]||(C.ema[k]={ owed:null, took:null }), o0=(D.wages||0)+(D.rationDue||0), t0=D.spent||0;   /* smoothed over `smooth` days: a town restocks in lumps */
      A.owed=A.owed==null ? o0 : A.owed+(o0-A.owed)/Math.max(1, Z.smooth); A.took=A.took==null ? t0 : A.took+(t0-A.took)/Math.max(1, Z.smooth);
      var owed=A.owed, took=A.took;
      if(owed>0){ var f=1+Math.max(-Z.step, Math.min(Z.step, Z.gain*(owed-took)/owed)); C.markup[k]=Math.max(1, (C.markup[k]==null ? 1 : C.markup[k])*f);
        if(C.rationOn && C.perKeep[k]!=null) C.ration[k]=Math.round(C.perKeep[k]*C.markup[k]); } }
    SIM.moneyPrices(s);
    var F=(E && E.meal && E.meal.foods) || [], P=C.price[k]||{}, c=C.cost[k]||{}, n=0, d=0; F.forEach(function(f){ if(P[f]!=null && c[f]>0){ n+=P[f]; d+=c[f]; } });
    var H=C.history[k]; if(H && H.length){ H[H.length-1].cpi=d>0 ? n/d : null; H[H.length-1].markupAfter=C.markup[k]; H[H.length-1].rationAfter=C.ration[k]; } }

  SIM.moneyReport = function(s){ var M=SIM.MONEY; if(!M) return null; var out={ currencies:{}, towns:{} };
    Object.keys(M.cur).forEach(function(c){ var F=flows(c), sup=0, n=0; M.order.forEach(function(id){ var A=M.acc[id]; if(A.currency!==c || (s!==undefined && A.settlement!==s)) return; sup+=A.balance; n++; });
      out.currencies[c]={ name:M.cur[c].name, talent:M.cur[c].talent, supply:sup, accounts:n, minted:Object.assign({}, F.minted), burned:Object.assign({}, F.burned), paid:Object.assign({}, F.paid) }; });
    Object.keys(M.books).forEach(function(k){ if(s!==undefined && k!==key(s)) return; out.towns[k]={}; Object.keys(M.books[k]).forEach(function(c){ var B=M.books[k][c], t=0;
      M.order.forEach(function(id){ var A=M.acc[id]; if(A.currency===c && key(A.settlement)===k) t+=A.balance; }); out.towns[k][c]=Object.assign({ total:t }, B); }); });
    return out; };
  SIM.moneySnap = function(){ var M=SIM.MONEY; if(!M) return null; var acc={}, towns={};
    M.order.forEach(function(id){ var A=M.acc[id]; acc[id]=A.balance; var T=towns[key(A.settlement)]||(towns[key(A.settlement)]={}), r=T[A.currency]||(T[A.currency]={ total:0, minted:0, burned:0, 'in':0, out:0 }); r.total+=A.balance; });
    Object.keys(M.books).forEach(function(k){ Object.keys(M.books[k]).forEach(function(c){ var T=towns[k]||(towns[k]={}), r=T[c]||(T[c]={ total:0, minted:0, burned:0, 'in':0, out:0 }), B=M.books[k][c];
      r.minted=B.minted; r.burned=B.burned; r['in']=B['in']; r.out=B.out; }); });
    return { accounts:acc, towns:towns }; };
})(typeof window!=='undefined'?window:globalThis);
