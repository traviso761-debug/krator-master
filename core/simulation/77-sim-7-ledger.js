// ================================================================= CORE — simulation 7: the ledger (the accounting contract)
// settlements/isle-demo/PLAN-ECONOMY.md, Phase 0; the contract is SCHEMA.md, "The books". Read only: nothing here changes
// a record or draws a number, so a world runs exactly as before. It adds no counters of its own: it reads the stocks'
// states (77-sim-7-stocks.js), the economy's running books (77-sim-6-economy.js), the items' (77-sim-6-items.js), the
// spoilage tally (77-sim-6-govern.js) and the routes (77-sim-6-trade.js).
//
//   SIM.ledgerSnap() -> {version, minute, towns:{key: {good: row}}, sea:{route: {'a>b': {good: n}}}, routes:{route: {shipped, landed}}}
//                       a snapshot of every settlement's books (key '_' on an unkeyed page); plain data, safe to keep,
//                       to JSON and to compare later. A row: unit, owner, total and its states (production, transit,
//                       storage), ordered, inbound, outbound; the running flows made, imported, exported, used, bought,
//                       eaten, spoiled, short
//   SIM.ledger(a, b, opt) -> {ok, problems:[strings], towns:{key: {good: statement}}, routes:{route: {'a>b': {good: leg}}}, sites:{id: {taken, made, amount}}}
//   money (77-sim-6-money.js): the snapshot's `money`, the statement's `money: {towns: {s: {currency: {opening, minted, burned, in, out, closing, residual}}}, currencies}`
//   a site's take less the batches in hand on it (`wip`: taken when the batch starts, made when it ends) is held to what was made
//                       the statement between two snapshots. opt.tol: the residual allowed (0.5: the stocks round to
//                       hundredths). A statement: {unit, owner, opening, made, imported, consumed, spoiled, exported,
//                       closing, residual, abroadOut, abroadIn, inbound, outbound, ordered}. A leg: {shipped, landed,
//                       seaFrom, seaTo}
//
// THE BALANCE, per good and settlement: opening + made + imported - consumed - spoiled - exported = closing. consumed =
// used - bought + eaten - spoiled: `used` counts a household's purchase, which only moves food into its store, and the
// spoilage booked used so older books still balance. Inbound, outbound and ordered stand beside the balance: they are in
// no settlement's closing.
// THE ROUTES. For each leg a>b and good: shipped = landed + the change at sea. A sender's exports are its shipped loads and
// what went abroad (abroadOut, off the map: never negative); a receiver's imports its landed loads and what came from
// abroad (abroadIn: a timer's import or a carrier's lot). So a load is in one settlement, on a route, or off the map,
// once. Deterministic: no draws.
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.LEDGER_VERSION = 1;
  var FLOWS = ['made', 'imported', 'exported', 'used', 'short'];
  function keys(){ return SIM.ECONS ? SIM.ECON_ORDER.slice() : (SIM.ECON ? ['_'] : []); }
  function econOf(k){ return k==='_' ? SIM.ECON : SIM.econ(k); }
  function snapTown(k){
    var E=econOf(k), I=SIM.ITEMS, keyed=k!=='_', St=keyed ? SIM.stocks(k) : SIM.stocks(), B=I ? (keyed ? ((I.statsBy||{})[k]||{}) : I.stats) : {}, out={};
    Object.keys(E.goods).forEach(function(g){ var r=(St && St.by[g])||{}, o={ unit:E.goods[g].unit||'unit', owner:keyed ? k : null, total:r.total||0, production:r.production||0, transit:r.transit||0,
        storage:r.storage||0, ordered:r.ordered||0, inbound:keyed && SIM.tradeInbound ? SIM.tradeInbound(g, k) : 0, outbound:keyed && SIM.tradeOutbound ? SIM.tradeOutbound(g, k) : 0,
        bought:(B.bought||{})[g]||0, eaten:(B.eaten||{})[g]||0, spoiled:(E.spoiled||{})[g]||0 };
      FLOWS.forEach(function(f){ o[f]=(E[f]||{})[g]||0; }); out[g]=o; });
    return out;
  }
  SIM.ledgerSnap = function(){
    var out={ version:SIM.LEDGER_VERSION, minute:SIM.minute(), towns:{}, sea:{}, routes:{} }, T=SIM.TRADE;
    keys().forEach(function(k){ out.towns[k]=snapTown(k); var E=econOf(k), R=E.resSites;
      if(R) Object.keys(R).forEach(function(id){ var S=R[id]; (out.sites||(out.sites={}))[id]={ settlement:k, goods:S.goods.slice(), taken:S.taken, amount:S.amount, regen:S.regen, regrown:S.regrown||0, wip:0 }; });
        Object.keys(E.recipes||{}).forEach(function(pid){ var Rc=E.recipes[pid], Pp=SIM.R.place[pid], Ws=Rc.site!=null && out.sites && out.sites[Rc.site];   /* a batch in hand: its take booked, its out not yet made */
          if(Ws && Rc.batch && Pp && Pp.order) Object.keys(Rc.batch.out).forEach(function(g){ Ws.wip+=Rc.batch.out[g]; }); }); });
    if(T) T.order.forEach(function(id){ var R=T.routes[id], sea=out.sea[id]={};
      R.carriers.forEach(function(C){ if(C.to==null || !C.cargo.length) return; var key=R.stops[C.from].settlement+'>'+R.stops[C.to].settlement, o=sea[key]||(sea[key]={});
        C.cargo.forEach(function(c){ o[c.good]=(o[c.good]||0)+c.n; }); });
      out.routes[id]={ shipped:JSON.parse(JSON.stringify(R.shipped)), landed:JSON.parse(JSON.stringify(R.landed)) }; });
    if(SIM.MONEY && SIM.moneySnap) out.money=SIM.moneySnap();   /* money's accounts and books (77-sim-6-money.js), when a world keeps money */
    return out;
  };
  function v(o, k, g){ return ((o||{})[k]||{})[g]||0; }
  SIM.ledger = function(a, b, opt){
    var tol=opt && opt.tol!=null ? opt.tol : 0.5, out={ ok:true, problems:[], towns:{}, routes:{} }, bad=function(m){ out.ok=false; out.problems.push(m); }, shipOut={}, landIn={};
    if(!a || !b || a.version!==b.version){ bad('the snapshots are of different versions'); return out; }
    Object.keys(b.routes).forEach(function(id){ var Rb=b.routes[id], Ra=a.routes[id]||{}, L=out.routes[id]={}, pairs={};
      [Rb.shipped, Rb.landed, b.sea[id]||{}, a.sea[id]||{}].forEach(function(o){ Object.keys(o).forEach(function(k){ pairs[k]=1; }); });
      Object.keys(pairs).forEach(function(k){ var gs={}, leg=L[k]={};
        [Rb.shipped[k], Rb.landed[k], (b.sea[id]||{})[k], (a.sea[id]||{})[k]].forEach(function(o){ Object.keys(o||{}).forEach(function(g){ gs[g]=1; }); });
        var from=k.split('>')[0], to=k.split('>')[1];
        Object.keys(gs).forEach(function(g){ var sh=v(Rb.shipped, k, g)-v(Ra.shipped, k, g), la=v(Rb.landed, k, g)-v(Ra.landed, k, g), s0=v(a.sea[id], k, g), s1=v(b.sea[id], k, g);
          leg[g]={ shipped:sh, landed:la, seaFrom:s0, seaTo:s1 };
          if(Math.abs(s0+sh-la-s1)>tol) bad(id+' '+k+' '+g+': '+s0+' at sea + '+sh+' shipped - '+la+' landed is not the '+s1+' at sea');
          var so=shipOut[from]||(shipOut[from]={}), li=landIn[to]||(landIn[to]={}); so[g]=(so[g]||0)+sh; li[g]=(li[g]||0)+la; }); }); });
    Object.keys(b.towns).forEach(function(k){ var B=b.towns[k], A=a.towns[k]||{}, T=out.towns[k]={};
      Object.keys(B).forEach(function(g){ var r=B[g], o=A[g]||{}, d=function(f){ return r[f]-(o[f]||0); };
        var spoiled=d('spoiled'), consumed=d('used')-d('bought')+d('eaten')-spoiled, st={ unit:r.unit, owner:r.owner, opening:o.total||0, made:d('made'), imported:d('imported'), consumed:consumed, spoiled:spoiled,
          exported:d('exported'), closing:r.total, inbound:r.inbound, outbound:r.outbound, ordered:r.ordered };
        st.residual=st.closing-(st.opening+st.made+st.imported-st.consumed-st.spoiled-st.exported);
        st.abroadOut=st.exported-((shipOut[k]||{})[g]||0); st.abroadIn=st.imported-((landIn[k]||{})[g]||0); T[g]=st;
        if(Math.abs(st.residual)>tol) bad(k+' '+g+': '+st.opening+' + '+st.made+' made + '+st.imported+' in - '+st.consumed+' consumed - '+st.spoiled+' spoiled - '+st.exported+' out is not the '+st.closing+' held (off by '+st.residual+')');
        if(st.abroadOut<-tol) bad(k+' '+g+': '+(-st.abroadOut)+' shipped by route but never booked exported');
        if(st.abroadIn<-tol) bad(k+' '+g+': '+(-st.abroadIn)+' landed by route but never booked imported');
        if(spoiled>d('used')+tol) bad(k+' '+g+': more spoiled than was booked used'); }); });
    /* a site: what it gave, against what its settlement made of its goods; a finite site's amount by what it gave and regrew */
    Object.keys(b.sites||{}).forEach(function(id){ var S=b.sites[id], A=(a.sites||{})[id], d=S.taken-(A ? A.taken : 0)-((S.wip||0)-(A ? A.wip||0 : 0)), made=0, st=out.towns[S.settlement]||{};   /* less the batches in hand */
      S.goods.forEach(function(g){ made+=(st[g]||{}).made||0; }); (out.sites||(out.sites={}))[id]={ taken:d, made:made, amount:S.amount };
      if(d>made+tol) bad(id+': gave '+d+' but its settlement made '+made+' of '+S.goods.join(', '));
      if(S.amount!=null && A && S.amount>A.amount-d+tol+Math.max(S.regen*Math.ceil((b.minute-a.minute)/1440+1), (S.regrown||0)-(A.regrown||0))) bad(id+': holds more than it gave and regrew'); });   /* `regrown`: what grew back (nightly, or restored: SIM.siteRestore) */
    /* MONEY (77-sim-6-money.js, PLAN-MONEY.md M0): per settlement and currency, opening + minted - burned + in - out = closing,
       exactly (integers); across a currency's settlements, what went out came in; no account below zero; none lost */
    if(b.money && a.money){ var mo=out.money={ towns:{}, currencies:{} };
      Object.keys(b.money.towns).forEach(function(k){ Object.keys(b.money.towns[k]).forEach(function(c){ var B=b.money.towns[k][c], A0=(a.money.towns[k]||{})[c]||{ total:0, minted:0, burned:0, 'in':0, out:0 };
        var st={ opening:A0.total, minted:B.minted-A0.minted, burned:B.burned-A0.burned, 'in':B['in']-A0['in'], out:B.out-A0.out, closing:B.total };
        st.residual=st.closing-(st.opening+st.minted-st.burned+st['in']-st.out); (mo.towns[k]||(mo.towns[k]={}))[c]=st;
        var C=mo.currencies[c]||(mo.currencies[c]={ 'in':0, out:0, minted:0, burned:0 }); C['in']+=st['in']; C.out+=st.out; C.minted+=st.minted; C.burned+=st.burned;
        if(st.residual!==0) bad('money '+(k||'(no settlement)')+' '+c+': '+st.opening+' + '+st.minted+' minted - '+st.burned+' burned + '+st['in']+' in - '+st.out+' out is not the '+st.closing+' held (off by '+st.residual+')'); }); });
      Object.keys(mo.currencies).forEach(function(c){ var C=mo.currencies[c]; if(C['in']!==C.out) bad('money '+c+': '+C.out+' paid out of settlements but '+C['in']+' paid in'); });
      Object.keys(b.money.accounts).forEach(function(id){ if(b.money.accounts[id]<0) bad('money: account '+id+' below zero ('+b.money.accounts[id]+')'); });
      Object.keys(a.money.accounts).forEach(function(id){ if(b.money.accounts[id]==null) bad('money: account '+id+' is gone'); }); }
    return out;
  };
})(typeof window!=='undefined'?window:globalThis);
