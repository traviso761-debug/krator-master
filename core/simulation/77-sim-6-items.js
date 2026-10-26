// ================================================================= CORE — simulation 6: items, inventory, equipment, shopping
// The Voth brief (settlements/voth/SIM-ROADMAP.md 1.5, 2.5: phase D). Opt-in: nothing here runs until a world calls
// SIM.items(config); a world without it decides exactly as before.
//
//   SIM.items({ kinds:{id:{cat, slot?, layer?, life?, workLife?, material?, food?, quality?, good?, per?}}, free:[ACT..], secPerMinute, mins,
//               cool, stale, meal:{mult, single, none, mess, rich}, lack, hurt, heal, low, days, meals, perMeal,
//               treat:{at, items:[[least wealth, item], ...]}, eatOut:{base, wealth}, retry? (minutes) })
//   SIM.shop(placeId, [item ids])      what a place sells (abstract stock, every purchase logged, unless the economy is on)
//   SIM.give(a, item, n) / SIM.equip(a, item, wear) / SIM.owns(a, item)
//   actor: issued (its keeper replaces what wears out; it runs no errands: the slaves), inv {item: n} (unbounded;
//          clothes kept at home), eq {position: {k, w}}, wears [items it keeps], sets (how
//          many of each), keep {item: n} (its own count for one: a soldier's one cuirass), tool
//          {k, w} (owned) or toolRack (drawn at work), hurt (the day hurt), errand
//   place: store {food: servings} (a household's), mess (fed by its institution)
//
// SLOTS: torso and legs take one clothing item ('torso', 'legs') and one armour item ('torso+', 'legs+'); feet take
// shoes or armoured boots (one: 'feet'); head a hat, hood or helmet ('head'); each hand one thing ('lhand', 'rhand').
// WEAR is lazy, per actor, at the first decision of a day: every worn item with a `life` (days) wears 1/life a day; worn
// out it goes and a spare from home takes its place. A tool wears by the worked hour (`workLife` hours); worn out at
// work, it is replaced at once, DURING WORK TIME (an errand that takes the worker off WORK to a shop selling it). With
// fewer sets of a clothing item than the actor keeps, it buys one on its time off, and the material meter (77-sim-6-
// needs.js) rises by `lack` a day for each set missing. A worked day carries a `hurt` chance (a hash of the actor and
// the day): hurt, it buys a poultice on its time off (or heals in `heal` days).
// ERRANDS: one at a time; `when` 'work' (in an hour of WORK) or 'free' (in an hour of one of `free`, once a seller is
// open and within reach: looked at once an hour); its place the
// nearest within reach that sells the item and has room (BUY); `mins` minutes there complete it (the item bought, the
// purchase logged by place and item; a luxury or household good fills material); none within reach, it is dropped and
// not tried again for `cool` minutes. FOOD: a household's store (servings by food) feeds its meals at home: two foods
// make a meal (`meal.mult` times the meal's fills, and `rich` times the actor's wealth more, times the foods' mean
// `quality`: cheese over milk), one food `single`, none
// `none`; a mess (`mess`) and a tavern or stall serve a full meal (77-sim-6-needs.js: the actor's `boost` of EAT). EATING
// OUT: at the start of a meal an actor eats at the nearest open seller of the item 'meal' (a tavern, a stall) by a hash
// under `eatOut.base` + `eatOut.wealth` times its wealth, or when its household's store cannot make a meal; none open,
// it eats at home. A store with less than `low` days for its people sends one of them to buy `days` days of the foods
// the nearest seller sells. STOCK (with 77-sim-6-economy.js on): a purchase draws its kind's `good` (`per` units) from
// the settlement's warehouses, all or nothing (none: the errand fails and cools); food buys what the warehouses hold;
// food buys what the warehouses hold, the foods in proportion to their stock, or to the town's diet (SIM.itemsDiet)
// (one short: more of the others); a meal
// out or at a mess draws a meal's food (SIM.economyMeal: none, a `none` meal). Deterministic: no draws
// (hashes), and only a question about the present changes an actor.
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.ITEMS = null;
  var POS = ['torso', 'torso+', 'legs', 'legs+', 'feet', 'head', 'lhand', 'rhand'];
  function hash(a, b, c){ var h=Math.imul((a|0)^0x9e3779b9, 0x85ebca6b) ^ Math.imul((b|0)+0x632be5ab, 0xc2b2ae35) ^ Math.imul((c|0)+0x27d4eb2f, 0x165667b1);
    h^=h>>>15; h=Math.imul(h, 0x2c1b3c6d); h^=h>>>12; h=Math.imul(h, 0x297a2d39); h^=h>>>15; return (h>>>0)/4294967296; }
  SIM.itemHash = hash;
  SIM.items = function(o){
    var I = { kinds:{}, sellers:{}, sells:{}, free:{}, spm:o.secPerMinute==null?60:o.secPerMinute, mins:o.mins==null?15:o.mins, cool:o.cool==null?120:o.cool,
              stale:o.stale==null?1440:o.stale, meal:Object.assign({ mult:3, single:1, none:0.2, mess:3 }, o.meal||{}), lack:o.lack||0, hurt:o.hurt||0, heal:o.heal==null?3:o.heal,
              treat:o.treat||null, eatOut:o.eatOut||null, retry:o.retry==null?0:o.retry, low:o.low==null?1:o.low, days:o.days==null?3:o.days, perMeal:o.perMeal==null?2:o.perMeal, meals:o.meals==null?2:o.meals,
              stats:{ bought:{}, byShop:{}, issued:{}, errands:{}, done:{}, failed:{}, noShop:{}, trip:{}, broken:0, brokenBy:{}, brokenAtWork:0, replacedAtWork:0, hurt:0, healed:0, poultice:0, worn:{}, eaten:{}, meals:{ meal:0, single:0, none:0, bought:0, mess:0, out:0 }, outOf:{} } };
    Object.keys(o.kinds||{}).forEach(function(k){ var K=Object.assign({ id:k }, o.kinds[k]); if(K.slot && POS.indexOf(K.slot)<0 && K.slot!=='torso' && K.slot!=='legs') throw new Error('SIM.items: '+k+': unknown slot '+K.slot); I.kinds[k]=K; });
    (o.free||[]).forEach(function(a){ I.free[a]=1; });
    I.foods = Object.keys(I.kinds).filter(function(k){ return I.kinds[k].food; });
    SIM.ITEMS = I; return I;
  };
  SIM.shop = function(placeId, items){ var I=SIM.ITEMS; if(!I) return; I.sells[placeId]=items.slice();
    items.forEach(function(k){ if(!I.kinds[k]) throw new Error('SIM.shop '+placeId+': unknown item '+k); (I.sellers[k]||(I.sellers[k]=[])).push(placeId); }); I._food=null; };
  function sellersOf(item){ var I=SIM.ITEMS; if(item!=='food') return I.sellers[item]||[];
    if(!I._food){ var s={}; I.foods.forEach(function(f){ (I.sellers[f]||[]).forEach(function(id){ s[id]=1; }); }); I._food=Object.keys(s); } return I._food; }
  SIM.sellersOf = sellersOf;
  function pos(K){ return K.slot + ((K.slot==='torso' || K.slot==='legs') && K.layer==='armour' ? '+' : ''); }
  SIM.give = function(a, k, n){ a.inv=a.inv||{}; a.inv[k]=(a.inv[k]||0)+(n==null?1:n); if(a.inv[k]<=0) delete a.inv[k]; };
  SIM.equip = function(a, k, w){ var K=SIM.ITEMS.kinds[k]; if(!K || !K.slot) throw new Error('SIM.equip: '+k+' is not worn');
    a.eq=a.eq||{}; var p=pos(K); if(a.eq[p]) SIM.give(a, a.eq[p].k, 1); a.eq[p]={ k:k, w:w||0 }; return p; };
  SIM.owns = function(a, k){ var n=(a.inv && a.inv[k]) || 0; if(a.eq) POS.forEach(function(p){ if(a.eq[p] && a.eq[p].k===k) n++; }); if(a.tool && a.tool.k===k) n++; return n; };
  /* the slot rules, for an audit: -> the broken ones */
  SIM.itemsCheck = function(a){ var out=[], I=SIM.ITEMS; if(!a.eq) return out;
    Object.keys(a.eq).forEach(function(p){ var e=a.eq[p]; if(!e) return; var K=I.kinds[e.k]; if(POS.indexOf(p)<0) out.push(p+': no such position');
      else if(!K || !K.slot) out.push(p+': '+e.k+' is not worn'); else if(pos(K)!==p) out.push(p+': '+e.k+' belongs on '+pos(K)); if(!(e.w>=0 && e.w<1)) out.push(p+': wear '+e.w); });
    return out; };
  function stat(o, k, n){ o[k]=(o[k]||0)+(n==null?1:n); }
  /* a counter the stocks read (77-sim-7-stocks.js CUM): on a page with settlements, booked to the actor's town as well (I.statsBy[key]) */
  /* a meal's count (stats.meals: at home, single, bought, at a mess, out, none, fine), by town as well on a page with settlements */
  function mealBook(t, k){ var I=SIM.ITEMS; I.stats.meals[k]=(I.stats.meals[k]||0)+1; if(!SIM.ECONS || t==null) return;
    var B=I.statsBy||(I.statsBy={}), T=B[t]||(B[t]={}); var M=T.meals||(T.meals={ meal:0, single:0, none:0, bought:0, mess:0, out:0 }); M[k]=(M[k]||0)+1; }
  function mealStat(a, k){ mealBook(SIM.ECONS ? SIM.settlementOf(a) : null, k); }
  function book(t, key, k, n){ var I=SIM.ITEMS; stat(I.stats[key], k, n); if(!SIM.ECONS || t==null) return;
    var B=I.statsBy||(I.statsBy={}), T=B[t]||(B[t]={}); stat(T[key]||(T[key]={}), k, n); }
  function cum(a, key, k, n){ book(SIM.ECONS ? SIM.settlementOf(a) : null, key, k, n); }
  function anchor(a){ var H=SIM.R.place[a.home]; return H ? [H.x, H.z] : (a.at || [0,0]); }

  /* ---------------------------------------------------------------- the day: wear, the clothes kept, a hurt */
  function day(a, d){
    var I=SIM.ITEMS;
    for(var dd=(a.itDay==null ? d : a.itDay)+1; dd<=d; dd++){                  /* a first look wears nothing */
      if(a.eq) POS.forEach(function(p){ var e=a.eq[p]; if(!e) return; var K=I.kinds[e.k]; if(!K.life) return; e.w += 1/K.life;
        if(e.w>=1){ cum(a, 'worn', e.k); a.eq[p]=null; if(a.inv && a.inv[e.k]>0){ SIM.give(a, e.k, -1); a.eq[p]={ k:e.k, w:0 }; }
          else if(a.issued){ a.eq[p]={ k:e.k, w:0 }; cum(a, 'issued', e.k); } } });                  /* its keeper issues another */
      if(a.hurt!=null && dd-a.hurt>=I.heal){ a.hurt=null; I.stats.healed++; }
      if(a.workedDay===dd-1 && a.hurt==null && I.hurt && hash(a.k, dd, 7)<I.hurt){ a.hurt=dd; I.stats.hurt++; }
    }
    a.itDay=d;
    /* the clothes kept: a set short is bought on time off, and the material meter feels it */
    var short=0, want=null; (a.wears||[]).forEach(function(k){ var n=SIM.owns(a, k), keep=(a.keep && a.keep[k]) || a.sets || 1; if(n < keep){ short += keep-n; if(!want) want=k; } });
    if(short && I.lack && SIM.NEED && SIM.NEED.idx.material!=null){ SIM.needsOf(a, d*1440); var mi=SIM.NEED.idx.material; a.nd[mi]=Math.min(100, a.nd[mi]+I.lack*short); }
    if(!a.errand && !a.issued){ if(a.hurt!=null && !a.owesP) errand(a, 'poultice', 'free', d*1440); else if(want) errand(a, want, 'free', d*1440);
      /* a treat: the material meter high, the best luxury or household good its wealth reaches */
      else if(I.treat && SIM.NEED && SIM.NEED.idx.material!=null && a.nd && a.nd[SIM.NEED.idx.material]>=I.treat.at){
        var best=null; I.treat.items.forEach(function(t){ if((a.wealth||0)>=t[0]) best=t[1]; }); if(best) errand(a, best, 'free', d*1440); } }
  }
  function errand(a, item, when, minute){
    var I=SIM.ITEMS; if(a.errCool && minute<a.errCool) return false;
    if(!sellersOf(item).length){ stat(I.stats.noShop, item); if(item==='poultice') a.owesP=true; return false; }
    a.errand={ act:'BUY', item:item, when:when, since:minute }; stat(I.stats.errands, item); return true;
  }
  SIM.errand = function(a, item, when){ return errand(a, item, when||'free', SIM.minute()); };
  /* THE DIET (opt-in: SIM.itemsDiet(town, {food: share})): a household buys each named food at its share of its days of
     food (an imported food eaten at its planned share, not at whatever share of the shelves the canoes fill: a share by
     stock would feed on itself, the more landed the more eaten and wanted), the rest by the warehouses' stock as ever;
     split by largest remainders, so a small share is bought too; a food out, the others make up the lack. Without one
     (or for a town without one), by the warehouses' stock, the remainder to the first, as before */
  SIM.itemsDiet = function(town, shares){ var I=SIM.ITEMS; if(!I) return; (I.diet||(I.diet={}))[town==null ? '_' : town]=shares; };
  function split(foods, town, need){ var I=SIM.ITEMS, D=I.diet && I.diet[town==null ? '_' : town], cut=0;
    var st=foods.map(function(f){ return SIM.ECON ? SIM.stockOf(f)+1 : 1; });
    if(!D){ var ws=st.reduce(function(x, y){ return x+y; }, 0), sh=foods.map(function(f, i){ var n=Math.floor(need*st[i]/ws); cut+=n; return n; }); sh[0]+=need-cut; return sh; }
    var named=0, rest=0; foods.forEach(function(f, i){ if(D[f]!=null) named+=D[f]; else rest+=st[i]; });
    var x=foods.map(function(f, i){ return need*(D[f]!=null ? D[f] : rest>0 ? Math.max(0, 1-named)*st[i]/rest : 0); });
    var out=x.map(function(v){ var n=Math.floor(v); cut+=n; return n; }), ord=x.map(function(v, i){ return i; }).sort(function(p, q){ return (x[q]-Math.floor(x[q]))-(x[p]-Math.floor(x[p])) || p-q; });
    for(var k=0; k<need-cut && k<ord.length; k++) out[ord[k]]++;
    return out; }
  /* RETRY (opt-in: `retry` minutes): a worker whose tool wore through and whose errand for another failed (the town out of
     tools) asks again every `retry` minutes of work, once the errand has cooled; without it the worker stays at half
     pace. SIM.step's last act (after the world's minute and the economies' rules) */
  SIM.itemsRetry = function(minute){ var I=SIM.ITEMS; if(!I || !I.retry || minute % I.retry) return;
    SIM.all('actor').forEach(function(a){ if(a.toolNeed && !a.errand && a.present && a.activity==='WORK') errand(a, a.toolNeed, 'work', minute); }); };
  /* a purchase draws on the shop's settlement's store (P7a: keyed economies); an unkeyed page calls complete0 as before */
  function complete(a, E, minute){ return SIM.ECONS ? SIM.withEcon(SIM.settlementOf(E.place), function(){ return complete0(a, E, minute); }) : complete0(a, E, minute); }
  function complete0(a, E, minute){
    var I=SIM.ITEMS, P=SIM.R.place[E.place], sold=(I.sells[E.place]||[]), K=I.kinds[E.item];
    stat(I.stats.done, E.item); var tr=I.stats.trip[E.item]||(I.stats.trip[E.item]={ n:0, mins:0, max:0 }); tr.n++; tr.mins+=E.trip; tr.max=Math.max(tr.max, E.trip);
    var bs=I.stats.byShop[E.place]||(I.stats.byShop[E.place]={});
    if(E.item==='food'){
      var H=SIM.R.place[a.home], foods=I.foods.filter(function(f){ return sold.indexOf(f)>=0; }), need=Math.ceil((H && H.people || 1)*I.meals*I.perMeal*I.days);
      if(H && foods.length){ H.store=H.store||{}; var lack=0, buy=function(f, n){ H.store[f]=(H.store[f]||0)+n; cum(a, 'bought', f, n); stat(bs, f, n); };
        var share=split(foods, SIM.ECON && SIM.ECON.settlement, need);   /* by what is on the shelf (the warehouses' stock), or the town's diet */
        foods.forEach(function(f, i){ var n=share[i];
          if(SIM.ECON){ var got=SIM.supply(f, n); if(got<n){ cum(a, 'outOf', f, n-got); lack+=n-got; } n=got; }   /* the settlement's store (77-sim-6-economy.js): it can be out */
          buy(f, n); });
        for(var fi=0; fi<foods.length && lack>0; fi++){ var more=SIM.supply(foods[fi], lack); if(more){ buy(foods[fi], more); lack-=more; } } }   /* one food out: more of the others it sells */
      if(H && H.shopper===a.id) H.shopper=null;
    } else {
      if(SIM.ECON && K.good && !SIM.supply(K.good, K.per==null?1:K.per, true)){   /* out of what it is made of: the errand fails, tried again later */
        cum(a, 'outOf', E.item); stat(I.stats.failed, E.item); a.errand=null; a.errCool=minute+I.cool; a.wanted=null; return; }
      cum(a, 'bought', E.item); stat(bs, E.item);
      if(K.cat==='medicine'){ a.hurt=null; a.owesP=false; I.stats.poultice++; I.stats.healed++; }
      else if(K.cat==='tool'){ a.tool={ k:E.item, w:0 }; a.toolNeed=null; if(E.when==='work') I.stats.replacedAtWork++; }
      else if(K.slot){ var p=pos(K); if(!a.eq || !a.eq[p]) SIM.equip(a, E.item, 0); else SIM.give(a, E.item, 1); }
      else SIM.give(a, E.item, 1);
      if(K.material && SIM.NEED && SIM.NEED.idx.material!=null){ SIM.needsOf(a, minute); var mi=SIM.NEED.idx.material; a.nd[mi]=Math.max(0, a.nd[mi]-K.material); }
    }
    a.errand=null; a.wanted=null;
  }

  /* ---------------------------------------------------------------- the resolver's clause (SIM.desire, before the needs') */
  SIM.itemsDesire = function(a, minute, act){
    var I=SIM.ITEMS; if(!I || !a.present || a.plan) return act;
    var live = minute===SIM.minute();
    if(live){
      var d=Math.floor(minute/1440); if(a.itDay!==d) day(a, d);
      /* the tool wears by the worked hour; worn out at work, it is replaced now */
      if(act==='WORK' && a.activity==='WORK' && a.arrM!=null && minute>=a.arrM){ a.workedDay=d;
        if(a.tool){ var K=I.kinds[a.tool.k], dw=a.wkT==null ? 0 : minute-a.wkT; if(dw<0 || dw>90) dw=0;   /* minutes at work since last asked (the step's wake: at most an hour), not a gap */
          if(K.workLife) a.tool.w += dw/60/K.workLife;
          if(a.tool.w>=1){ var k=a.tool.k; a.tool=null; a.toolNeed=k; I.stats.broken++; cum(a, 'brokenBy', k); I.stats.brokenAtWork++; if(a.errand && a.errand.when!=='work') a.errand=null; errand(a, k, 'work', minute); } }
        a.wkT=minute; }
      else a.wkT=null;
      var E=a.errand;
      if(E && E.item==='meal' && act!=='EAT'){ if(E.place) stat(I.stats.done, 'meal'); a.errand=null; E=null; }   /* the meal out is over with its hour */
      if(E){
        if(E.item!=='meal' && E.place && a.activity===E.act && a.place===E.place && a.arrM!=null && minute>=a.arrM+I.mins){ complete(a, E, minute); E=null; }
        else if(minute-E.since>I.stale){ if(E.item==='food'){ var H0=SIM.R.place[a.home]; if(H0 && H0.shopper===a.id) H0.shopper=null; } a.errand=null; E=null; }
      }
      /* a household's food: the first of its people with time off goes when the store runs low */
      var hr=Math.floor(minute/60);
      /* a meal out: at the start of a meal, by a hash and the actor's wealth (`eatOut`), or when the household's store
         cannot make a meal; at a seller of 'meal' (a tavern, a stall) */
      if(!a.errand && act==='EAT' && a.activity!=='EAT' && I.eatOut && sellersOf('meal').length){ var Hm=SIM.R.place[a.home];
        if(Hm && !Hm.mess && a.mealH!==hr){ a.mealH=hr; var st0=Hm.store||{}, kinds=0; for(var f0 in st0) if(st0[f0]>0) kinds++;
          if(kinds<2 || hash(a.k, hr, 11) < I.eatOut.base + I.eatOut.wealth*(a.wealth||0)){ a.errand={ act:'EAT', item:'meal', when:'EAT', since:minute }; stat(I.stats.errands, 'meal'); a.errOkH=null; } } }
      if(!a.errand && (I.free[act]) && I.foods.length && a.foodH!==hr){ a.foodH=hr; var H=SIM.R.place[a.home];   /* the store looked at once an hour */
        if(H && !H.mess && H.store && H.people && (!H.shopper || !SIM.R.actor[H.shopper] || !SIM.R.actor[H.shopper].errand)){
          var tot=0; for(var f in H.store) tot+=H.store[f];
          if(tot < H.people*I.meals*I.perMeal*I.low && errand(a, 'food', 'free', minute)) H.shopper=a.id; } }
    }
    var E2=a.errand; if(!E2) return act;
    if(E2.when==='work' ? act==='WORK' : E2.when==='free' ? I.free[act] : act===E2.when){
      /* only when a seller is open and within reach (asked once an hour): the errand waits for the shops to open (a
         meal out with none open is eaten at home) */
      if(live){ var h2=Math.floor(minute/60); if(a.errOkH!==h2){ a.errOkH=h2; a.errOk=!!SIM.itemsChoose(a, E2.act, h2%24); } }
      if(a.errOk===false && E2.item==='meal'){ if(live) a.errand=null; return act; }
      return a.errOk===false ? act : E2.act; }
    return act;
  };
  /* the soonest minute this clause could answer otherwise (SIM.step's wake): an errand done at its shop, an errand gone
     stale, a tool worn through at work (the hours, the day, the shops' opening are the hour's: the step wakes on it) */
  SIM.itemsWake = function(a, minute, act){
    var I=SIM.ITEMS; if(!I) return Infinity; var w=Infinity, E=a.errand;
    if(E){ if(E.place && E.item!=='meal' && a.arrM!=null) w=Math.min(w, a.arrM+I.mins); w=Math.min(w, E.since+I.stale+1); }
    if(act==='WORK' && a.tool){ var K=I.kinds[a.tool.k]; if(K.workLife) w=Math.min(w, minute+Math.max(1, Math.floor((1-a.tool.w)*K.workLife*60))); }
    if(act==='WORK' && a.arrM!=null && a.arrM>minute) w=Math.min(w, a.arrM);   /* the tool starts wearing when it arrives */
    return w;
  };
  /* SIM.choose for an errand: the nearest seller within reach with room */
  SIM.itemsChoose = function(a, act, hour){
    var E=a.errand; if(!E || E.act!==act) return undefined;
    var W=E.when==='work' && SIM.R.place[a.work], near = W ? [W.x, W.z] : anchor(a), c=SIM.placesFor(act, a, hour, { near:near, ids:sellersOf(E.item), exclude:a.bad });
    if(SIM.REACH!=null) c=c.filter(function(P){ return Math.hypot(P.x-near[0], P.z-near[1])<=SIM.REACH; });
    var town=SIM.R.settlement ? SIM.settlementOf(a) : null; if(town!=null){ var own=c.filter(function(P){ return P.settlement===town; }); if(own.length) c=own; }   /* a seller in its own town first (P7a) */
    return c[0] || null;
  };
  /* SIM.decide: where it arrives (world minutes), the errand's place, its meal; an errand no place took is dropped */
  SIM.itemsDecided = function(a, minute, task, P, act, want){
    var I=SIM.ITEMS; if(!I) return;
    if(task) a.arrM = minute + (task.dur ? Math.round(task.dur/I.spm) : 0);
    var E=a.errand;
    if(E && want===E.act && act!==E.act){ stat(I.stats.failed, E.item); if(E.item==='food'){ var H=SIM.R.place[a.home]; if(H && H.shopper===a.id) H.shopper=null; }
      a.errand=null; a.errCool=minute+I.cool; a.wanted=null; }
    else if(E && act===E.act && P){ E.place=P.id; E.trip=task ? a.arrM-minute : 0; }   /* staying put: no trip */
    if(act==='EAT' && P){ a.boost=a.boost||{}; a.boost.EAT = meal(a, P); }
  };
  /* a meal out draws on the settlement of the place it is eaten at (P7a) */
  function meal(a, P){ return SIM.ECONS ? SIM.withEcon(SIM.settlementOf(P.id), function(){ return meal0(a, P); }) : meal0(a, P); }
  function meal0(a, P){
    var I=SIM.ITEMS, M=I.meal;
    var fine = 1 + (M.rich||0)*(a.wealth||0);                                     /* a richer table: more filling, more relaxing */
    if((P.id!==a.home || P.mess) && SIM.ECON && !SIM.economyMeal()){ mealStat(a, 'out'); return M.none; }   /* the kitchen draws on the settlement's store (77-sim-6-economy.js) */
    if(P.id!==a.home){ mealStat(a, 'bought'); stat(I.stats.byShop[P.id]||(I.stats.byShop[P.id]={}), 'meal'); return M.mult*fine; }   /* a tavern, a stall: a meal bought */
    if(P.mess){ mealStat(a, 'mess'); return M.mess; }
    var st=P.store; if(!st || !I.foods.length){ mealStat(a, 'none'); return M.none; }
    var have=I.foods.filter(function(f){ return st[f]>0; }).sort(function(x, y){ return st[y]-st[x] || (x<y?-1:1); });
    var sz=SIM.economySeasoning ? SIM.economySeasoning() : 1, Q=function(f){ var K=I.kinds[f]; return (K && K.quality!=null ? K.quality : 1)*sz; };   /* a better food (cheese) makes a better meal; a seasoned one too (77-sim-6-govern.js) */
    if(have.length>=2){ st[have[0]]--; st[have[1]]--; cum(a, 'eaten', have[0]); cum(a, 'eaten', have[1]); mealStat(a, 'meal'); if(Q(have[0])>1 || Q(have[1])>1) mealStat(a, 'fine'); return M.mult*fine*(Q(have[0])+Q(have[1]))/2; }
    if(have.length===1){ st[have[0]]--; cum(a, 'eaten', have[0]); mealStat(a, 'single'); return M.single*Q(have[0]); }
    mealStat(a, 'none'); return M.none;
  }
  /* the items' share of a worker's efficiency: a broken tool, a hurt */
  /* THE ABSTRACT LEVEL (77-sim-7-lod.js): `hrs` hours of a household's life in a town nobody watches, booked as the
     presented town books them. Its `people` (else its residents) eat `meals` a day, each meal one serving of the two
     foods its store holds most of (one: a single, none: none); a mess draws its meals on the warehouses. A store under
     `low` days buys `days` days of the foods the town's sellers sell, in proportion to the warehouses' stock (one out:
     more of the others). No meals out; the wear, the tools, the hurt and the errands they make are the person's
     abstract day (SIM.itemsAbstractDay) */
  SIM.itemsAbstractHome = function(P, hrs, town, res){
    var I=SIM.ITEMS; if(!I || !I.foods.length) return; var ppl=P.people || res || 0; if(!ppl) return;
    var due=ppl*I.meals*hrs/24+(P.absMeal||0), n=Math.floor(due); P.absMeal=due-n;
    var st=P.store||(P.store={});
    for(var i=0;i<n;i++){
      if(P.mess){ mealBook(town, SIM.ECON && !SIM.economyMeal() ? 'out' : 'mess'); continue; }
      var have=I.foods.filter(function(f){ return st[f]>0; }).sort(function(x, y){ return st[y]-st[x] || (x<y?-1:1); });
      if(have.length>=2){ st[have[0]]--; st[have[1]]--; book(town, 'eaten', have[0], 1); book(town, 'eaten', have[1], 1); mealBook(town, 'meal'); }
      else if(have.length===1){ st[have[0]]--; book(town, 'eaten', have[0], 1); mealBook(town, 'single'); }
      else mealBook(town, 'none'); }
    if(P.mess || !SIM.ECON) return;
    var tot=0; for(var f in st) tot+=st[f]; if(tot >= ppl*I.meals*I.perMeal*I.low) return;
    var sold=I.townFoods && I.townFoods[town]; if(!sold){ var u={}; Object.keys(I.sells).forEach(function(id){ if(SIM.settlementOf(id)!==town) return; I.sells[id].forEach(function(k){ if(I.kinds[k] && I.kinds[k].food) u[k]=1; }); });
      sold=(I.townFoods||(I.townFoods={}))[town]=I.foods.filter(function(f){ return u[f]; }); }
    var foods=sold.length ? sold : I.foods, need=Math.ceil(ppl*I.meals*I.perMeal*I.days), lack=0;
    var share=split(foods, town, need);
    var buy=function(f, k){ st[f]=(st[f]||0)+k; book(town, 'bought', f, k); };
    foods.forEach(function(f, i){ var k=share[i], got=SIM.supply(f, k); if(got<k){ book(town, 'outOf', f, k-got); lack+=k-got; } if(got) buy(f, got); });
    for(var fi=0; fi<foods.length && lack>0; fi++){ var more=SIM.supply(foods[fi], lack); if(more){ buy(foods[fi], more); lack-=more; } }
  };
  /* THE ABSTRACT DAY (77-sim-7-lod.js, at the first hour of each day a town is abstract): a person's yesterday as the
     watched town would have lived it, without a step: its tool worn by the hours its schedule gave to WORK (worn out, it
     wants another), the worked day marked (a hurt's chance), the material meter risen at its rate; then the day's wear
     (day(): the clothes worn, a hurt healed or taken, an errand for a short set, a poultice or a treat); and the errand
     done at once at the seller nearest its home in its own town (no trip; out of stock, it fails and cools as watched).
     Food and meals out stay the household's (SIM.itemsAbstractHome) */
  SIM.itemsAbstractDay = function(a, d, town){
    var I=SIM.ITEMS; if(!I || !a.present || a.driven || a.plan) return; if(a.itDay==null) a.itDay=d-1; if(a.itDay>=d) return;   /* lowered before it ever decided: from yesterday */
    var s=SIM.schedOf(a, (d-1)*1440), hw=0; if(s) for(var h=0;h<24;h++) if(s[h]==='WORK') hw++;
    var job=a.work!=null ? a.work : (a.mem && a.mem.WORK);
    if(hw && job!=null){ a.workedDay=d-1;
      if(a.tool){ var K=I.kinds[a.tool.k]; if(K.workLife) a.tool.w += hw/K.workLife;
        if(a.tool.w>=1){ var k=a.tool.k; a.tool=null; a.toolNeed=k; I.stats.broken++; cum(a, 'brokenBy', k); if(a.errand && a.errand.when!=='work') a.errand=null; errand(a, k, 'work', d*1440); } }
      else if(a.toolNeed && !a.errand) errand(a, a.toolNeed, 'work', d*1440); }
    if(SIM.NEED && SIM.NEED.idx.material!=null) SIM.needsDrift(a, ['material'], 1440*(d-a.itDay));
    if(a.errCool!=null && a.errCool<d*1440) a.errCool=null;
    day(a, d);
    var E=a.errand; if(!E) return;
    if(E.item==='food' || E.item==='meal'){ a.errand=null; return; }
    var H=anchor(a), best=null, bd=Infinity;
    sellersOf(E.item).forEach(function(id){ var P=SIM.R.place[id]; if(!P || SIM.settlementOf(id)!==town) return; var dd=Math.hypot(P.x-H[0], P.z-H[1]); if(dd<bd){ bd=dd; best=id; } });
    if(best==null){ stat(I.stats.failed, E.item); a.errand=null; a.errCool=d*1440+I.cool; return; }
    E.place=best; E.trip=0; complete(a, E, d*1440);
  };
  SIM.itemsEff = function(a){ var I=SIM.ITEMS; if(!I) return 1; return (a.toolNeed ? 0.5 : 1) * (a.hurt!=null ? 0.7 : 1); };
  SIM.itemsJump = function(a, minute){ if(!SIM.ITEMS) return; if(a.itDay==null) a.itDay=Math.floor(minute/1440); a.wkT=null; };
})(typeof window!=='undefined'?window:globalThis);
