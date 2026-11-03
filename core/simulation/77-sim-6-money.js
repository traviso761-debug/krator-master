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
