// ================================================================= CORE — simulation 6: scheduled fixed transfers
// PROPOSAL-LONGSONG-PINNACLE.md section 2, flow 5, and phase S3 (the owner, 2026-11-11): the grant of fealty and the grants
// of esteem. A transfer bound by tradition: a fixed bill of goods (and coin) from one settlement to another on a fixed
// day, never priced and never answering scarcity. It is the inflexible way two settlements trade; SIM.trade is the
// flexible one. PLAN-MONEY.md's M5 (the tribute) is this kind of transfer. Opt-in: nothing runs until a world calls
// SIM.transfer.
//
//   SIM.transfer({id, from, to, goods: {good: n}, every (days between them: 365), first (the first day it falls due:
//                 0), hour (6), season? (a window or quarter of 77-sim-6-season.js: due on its first hour, each year,
//                 instead of `first`/`every`), money?: {n, why} (coin from the sender's account to the receiver's, when
//                 core money is on: SIM.pay), owed? ('carry': a short bill is owed and added to the next, the default;
//                 'drop': forgiven)})
//   SIM.transfersReport(id?) -> {id: {from, to, times, sent: {good: n}, landed: {good: n}, owed: {good: n}, paid,
//                 last (the minute it last fell), next}}
// FALLING DUE (a step hook, so a world stepped by the hour still meets it): the sender's warehouses give what they hold
// of each good up to the bill (SIM.economyTake, booked 'exported'); the receiver lands it (SIM.economyLand, booked
// 'imported'), so each settlement's books balance and the goods are never in two places. What the sender could not give
// is owed (`owed`). The bill itself never changes. Deterministic: no draws.
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.TRANSFER = null;
  function stat(o, k, n){ o[k]=(o[k]||0)+(n==null?1:n); }
  SIM.transfer = function(o){
    if(!o || !o.id || o.from==null || o.to==null) throw new Error('SIM.transfer: id, from and to');
    var T=SIM.TRANSFER||(SIM.TRANSFER={ list:{}, order:[] });
    if(T.list[o.id]) throw new Error('SIM.transfer '+o.id+': made already');
    var X={ id:o.id, from:o.from, to:o.to, goods:Object.assign({}, o.goods||{}), every:o.every==null ? 365 : o.every, hour:o.hour==null ? 6 : o.hour,
            season:o.season==null ? null : o.season, money:o.money||null, owedRule:o.owed||'carry', times:0, sent:{}, landed:{}, owed:{}, paid:0, last:null, inSeason:false };
    X.next=X.season==null ? (o.first==null ? 0 : o.first)*1440+X.hour*60 : null;
    T.list[X.id]=X; T.order.push(X.id); return X;
  };
  function fall(X, minute){
    var bill={};   /* the fixed bill, with what was owed */
    Object.keys(X.goods).forEach(function(g){ bill[g]=X.goods[g]+(X.owedRule==='carry' ? (X.owed[g]||0) : 0); });
    var got={};
    SIM.withEcon(X.from, function(){ Object.keys(bill).sort().forEach(function(g){ var n=bill[g]>0 ? SIM.economyTake(g, bill[g]) : 0;
      if(n>0){ SIM.economyBook('exported', g, n); stat(X.sent, g, n); got[g]=n; } X.owed[g]=X.owedRule==='carry' ? bill[g]-n : 0; }); });
    SIM.withEcon(X.to, function(){ Object.keys(got).sort().forEach(function(g){ if(SIM.economyLand(g, got[g], null)==null) return;
      SIM.economyBook('imported', g, got[g]); stat(X.landed, g, got[g]); }); });
    if(X.money && SIM.MONEY && SIM.pay){ var fa='treasury:'+X.from, ta='treasury:'+X.to;
      try{ if(SIM.pay(fa, ta, X.money.n, X.money.why||X.id)) X.paid+=X.money.n; }catch(e){ SIM.err('SIM.transfer '+X.id+': '+(e&&e.message||e)); } }
    X.times++; X.last=minute;
    SIM.logEvent('transfer', { id:X.id, from:X.from, to:X.to, goods:got });
  }
  function step(minute){
    var T=SIM.TRANSFER; if(!T) return;
    T.order.forEach(function(id){ var X=T.list[id];
      if(X.season!=null){ var on=SIM.inSeason ? SIM.inSeason(X.season, minute) : false, hr=Math.floor((minute%1440)/60);
        if(on && !X.inSeason && hr>=X.hour){ X.inSeason=true; fall(X, minute); } else if(!on) X.inSeason=false; return; }
      while(minute>=X.next){ fall(X, minute); X.next+=X.every*1440; } });
  }
  SIM.transfersReport = function(id){
    var T=SIM.TRANSFER; if(!T) return null; var out={};
    T.order.forEach(function(k){ if(id!=null && k!==id) return; var X=T.list[k];
      out[k]={ from:X.from, to:X.to, times:X.times, sent:Object.assign({}, X.sent), landed:Object.assign({}, X.landed), owed:Object.assign({}, X.owed), paid:X.paid, last:X.last, next:X.next }; });
    return id!=null ? out[id] || null : out;
  };
  SIM.stepHooks = SIM.stepHooks || [];
  SIM.stepHooks.push(function(minute){ if(SIM.TRANSFER) step(minute); });
})(typeof window!=='undefined'?window:globalThis);
