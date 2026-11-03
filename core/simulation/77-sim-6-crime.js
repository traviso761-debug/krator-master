// ================================================================= CORE — simulation 6: crime and punishment
// The Voth brief (settlements/voth/SIM-ROADMAP.md 1.7, phase F item 1): "1 in 1000 citizens is a criminal (burglary,
// pickpocketing at markets); better odds unobserved, much better at night. Caught: the victim shouts, guards converge,
// the criminal flees; arrested: the nearest watchhouse, garrison or fortress, one week. Assault: fights from unhappy
// citizens; guards arrest the instigator (complies: 1 week; resists: 1 month)." Proved first on the isle demo (owner,
// 2026-11-02: get the isle demo right, then backport). Opt-in: nothing here runs until a world calls SIM.crime(config);
// it draws nothing from SIM.rng (every roll is a hash of the world's seed, the person and the hour), so a page that
// turns it on moves no other taker's trace.
//
//   SIM.crime({ seed, share, who(a)?, guard(a), jails:[place kinds], guardActs:[acts], crimes:{...}, seen:{...},
//               arrest:{...}, jail:{...}, abstract:{...} }) -> SIM.CRIME
//     share        the criminals among those `who` allows (default: every present, undriven actor not a guard): picked by
//                  a hash of the person, so the same people at every load
//     crimes       by kind, each opt-in by its key:
//       pickpocket {acts, at:[place kinds], hours:[from, to], chance, loss, gain}  a criminal in a free hour at a market
//                  (presented: at a place of `at` with someone else there; abstract: `abstract.atShare` of its hours in
//                  `acts`) tries `chance` an hour; done, the victim's material meter rises `loss`, the thief's falls `gain`
//       burglary   {hours, chance, share}  at night a criminal breaks into another household of its town (a hash picks it)
//                  and carries off `share` of each food in its store to its own home's
//       assault    {below, acts, chance}  anyone (criminal or not) whose happiness is under `below`, in an hour of `acts`
//                  among company, starts a fight `chance` an hour: the victim is hurt (the items' hurt: a poultice, or
//                  `heal` days); never unseen, so its instigator is arrested if a guard comes
//     seen         {base, perWitness, guard, night, max, nightHours:[from, to]}: the odds a crime is seen: base +
//                  perWitness a witness (+ guard a guard among them), times `night` in the night hours, at most max. A
//                  burglary's witnesses are the household asleep, each counted `sleeper`. Seen, it fails (the victim
//                  shouts) and the alarm goes up; unseen, it is done
//     arrest       {reach, base, ratio, respond}: on an alarm the nearest guard on duty (`guard(a)`, its activity in
//                  `guardActs`) within `reach` m arrests with base x (1 - d / reach) (presented; it is sent there for
//                  `respond` minutes); abstract: base x min(1, guards on duty a head / `ratio`)
//     jail         {act, days, resist, resistDays, lieLow}: the arrested are held at the nearest place of `jails` in their town
//                  for `days` (`resist` of them resist: `resistDays`), by SIM.command (act `act`, registered if new): they
//                  do not work, at either level; let go, a criminal lies low `lieLow` days (2) before it tries again
//     abstract     {atShare, witnesses}: the odds for a town nobody watches (no places held): the share of a free hour
//                  spent where pickpockets work, the witnesses assumed there
//     guild        {kinds, hideReach, hideMins, abstractHide, items, fence:{acts, mins, perServing, perItem}} (opt-in; owner,
//                  2026-11-02): THE THIEVES' GUILD, one a town: the place of `kinds` (a tavern) farthest from the town's
//                  nearest jail. HIDING: on an alarm, a criminal nearer the guild (within `hideReach` m) than the guard is to
//                  it runs there and hides `hideMins` (abstract: `abstractHide` of them); nobody is arrested while hidden,
//                  and nobody works a pocket inside the guild. LOOT: a burglary takes, besides the food (into the thief's
//                  home store, still the town's), `items` spare things from the household (clothes kept at home); a
//                  thief carrying loot goes to the guild in a free hour (`fence.acts`; presented: SIM.command there for
//                  `fence.mins` past the next hour) and FENCES it: the food into the guild's store (its stash), the things into its `stash`,
//                  the thief's material meter down `perServing` a serving and `perItem` a thing. Arrested, a thief's
//                  unfenced loot goes back to the household it came from
//   SIM.crimeStep(minute)        SIM.step's, hourly: every criminal's chances, then the unhappy's fights
//   SIM.crimeReport(s?) -> {criminals, jailed:[{actor, place, until, crime}], stats:{attempts, done, seen, arrested,
//                         resisted, escaped, by kind; stolen (servings), hurt, served}}
//   SIM.jailed(a, minute?) -> true while an actor is held          SIM.hidden(a, minute?) -> true while hidden at the guild
//   SIM.guildOf(settlement) -> the guild's place                    SIM.crimeHide(a) -> hides it if within reach of its guild
//   SIM.crimeFence(a) -> fences its loot if it is at its guild       SIM.crimeLoot(a, {from, food, items}) adds a lot it carries
//   SIM.crimeAlarm(a, kind, at) -> a crime of the world's own (the player's) seen: the alarm, the hiding, perhaps an arrest
//   SIM.crimeEvents(since?) -> the crime's own events (crime, alarm, arrest) since a minute: SIM.LOG is trimmed, these are kept
(function(G){
  'use strict';
  var SIM=G.SIM;
  function hash(){ var h=0x2545F491; for(var i=0;i<arguments.length;i++){ h=Math.imul(h^(arguments[i]|0), 0x85EBCA6B); h^=h>>>13; h=Math.imul(h, 0xC2B2AE35); h^=h>>>16; } return (h>>>0)/4294967296; }
  var KIND={ pickpocket:1, burglary:2, assault:3 };
  function inHours(h, H){ if(!H) return true; return H[0]<=H[1] ? (h>=H[0] && h<H[1]) : (h>=H[0] || h<H[1]); }
  function bump(o, k, n){ o[k]=(o[k]||0)+(n==null?1:n); }
  /* an event: into the sim's log, and the crime's own (SIM.LOG is trimmed; this keeps the last 20,000) */
  function note(kind, d){ var e=SIM.logEvent(kind, d), E=SIM.CRIME.events; E.push(e); if(E.length>25000) E.splice(0, E.length-20000); return e; }

  SIM.crime = function(o){
    var C={ cfg:o, seed:o.seed==null?0:o.seed, crooks:[], isCrook:{}, stats:{}, held:{}, quiet:{}, towns:{}, guards:{}, events:[], guild:{}, hiding:{} };
    [(o.jail&&o.jail.act)||'JAIL', 'HIDE', 'FENCE'].forEach(function(act){ if(SIM.R.activity && !SIM.R.activity[act]) SIM.activity({ id:act }); });
    var guard=o.guard||function(){ return false; }, who=o.who||function(){ return true; };
    SIM.all('actor').slice().sort(function(a, b){ return a.k-b.k; }).forEach(function(a){
      if(a.driven || guard(a) || !who(a)) return;
      if(hash(C.seed, 911, a.k)<(o.share==null?0.001:o.share)){ C.crooks.push(a.id); C.isCrook[a.id]=1; } });
    SIM.CRIME=C;
    if(o.guild){ var towns={}; SIM.all('place').forEach(function(P){ towns[SIM.R.settlement ? SIM.settlementOf(P.id) : '']=1; });
      Object.keys(towns).sort().forEach(function(k){ var s=k==='' || k==='null' || k==='undefined' ? null : k, best=null, bd=-1;
        SIM.all('place').forEach(function(P){ if(o.guild.kinds.indexOf(P.kind)<0 || (s!=null && SIM.settlementOf(P.id)!==s)) return;
          var J=jailFor(s, P), d=J ? Math.hypot(J.x-P.x, J.z-P.z) : 0; if(d>bd || (d===bd && P.id<best.id)){ bd=d; best=P; } });   /* the den farthest from the law */
        if(best){ C.guild[s==null ? '' : s]=best.id; best.guild=true; } }); }
    return C;
  };
  function statsOf(s){ var C=SIM.CRIME, k=s==null?'':s; return C.stats[k]||(C.stats[k]={ attempts:{}, done:{}, seen:{}, arrested:{}, escaped:{}, hid:{}, resisted:0, stolen:0, taken:0, hurt:0, served:0, fenced:0, fencedItems:0, recovered:0, recoveredItems:0 }); }
  function town(a){ return SIM.R.settlement ? SIM.settlementOf(a) : null; }
  function abstractTown(s){ return !!(SIM.ABSTRACT && s!=null && SIM.ABSTRACT[s]); }
  function people(s){ var C=SIM.CRIME, k=s==null?'':s; if(C.towns[k]) return C.towns[k];
    var L=SIM.all('actor').filter(function(a){ return !a.driven && (s==null || SIM.settlementOf(a)===s); }).sort(function(a, b){ return a.k-b.k; });
    return (C.towns[k]=L); }
  function guardsOf(s){ var C=SIM.CRIME, k=s==null?'':s; if(C.guards[k]) return C.guards[k]; var g=C.cfg.guard||function(){ return false; };
    return (C.guards[k]=people(s).filter(function(a){ return g(a); })); }
  SIM.jailed = function(a, minute){ var m=minute==null?SIM.minute():minute, C=SIM.CRIME; return !!(C && a.cmd && a.cmd.by==='jail' && m<a.cmd.until); };
  SIM.hidden = function(a, minute){ var m=minute==null?SIM.minute():minute, C=SIM.CRIME; return !!(C && C.hiding[a.id]!=null && m<C.hiding[a.id]); };
  SIM.guildOf = function(s){ var C=SIM.CRIME; if(!C) return null; var id=C.guild[s==null ? '' : s]; return id!=null ? SIM.R.place[id] : null; };
  function actNow(a, minute){ if(!abstractTown(town(a))) return a.activity; var s=SIM.schedOf(a, minute); return s ? s[Math.floor((minute%1440)/60)] : null; }

  /* the odds it is seen, by the witnesses where it happens */
  function seenOdds(w, g, hour, sleepers){ var S=SIM.CRIME.cfg.seen||{};
    var p=(S.base==null?0.05:S.base)+(S.perWitness==null?0.03:S.perWitness)*w+(S.guard==null?0.5:S.guard)*g+(S.sleeper==null?0.02:S.sleeper)*(sleepers||0);
    if(inHours(hour, S.nightHours||[21, 5])) p*=(S.night==null?0.4:S.night);
    return Math.min(S.max==null?0.95:S.max, p); }
  function witnesses(P, a, v){ var w=0, g=0, gd=SIM.CRIME.cfg.guard||function(){ return false; };
    Object.keys(P.who||{}).forEach(function(id){ if(id===a.id || (v && id===v.id)) return; var x=SIM.R.actor[id]; if(!x) return; if(gd(x)) g++; else w++; }); return { w:w, g:g }; }
  /* the alarm: the nearest guard on duty comes (presented), or the town's guards a head (abstract) */
  function arrestOdds(a, at, s, minute){ var C=SIM.CRIME, A=C.cfg.arrest||{}, acts=C.cfg.guardActs||['WORK'], base=(A.base==null?0.6:A.base)*(SIM.UNREST ? SIM.unrestArrest(s) : 1);   /* a grumbling town hides its own (77-sim-6-unrest.js) */
    if(abstractTown(s)){ var on=0, h=Math.floor((minute%1440)/60); guardsOf(s).forEach(function(x){ var sc=SIM.schedOf(x, minute); if(sc && acts.indexOf(sc[h])>=0 && !SIM.jailed(x, minute)) on++; });
      var pop=people(s).length||1; return { p:base*Math.min(1, (on/pop)/(A.ratio==null?1/150:A.ratio)), guard:null, d:null }; }
    var best=null, bd=Infinity, reach=A.reach==null?300:A.reach;
    guardsOf(s).forEach(function(x){ if(!x.present || acts.indexOf(x.activity)<0 || SIM.jailed(x, minute)) return; var p=SIM.pose(x, SIM.time(), { cheap:true }), d=Math.hypot(p.x-at.x, p.z-at.z); if(d<bd){ bd=d; best=x; } });
    if(!best || bd>reach) return { p:0, guard:null, d:best ? Math.round(bd) : null };
    return { p:base*(1-bd/reach), guard:best, d:Math.round(bd) }; }
  function jailFor(s, at){ var kinds=SIM.CRIME.cfg.jails||[], best=null, bd=Infinity;
    SIM.all('place').forEach(function(P){ if(kinds.indexOf(P.kind)<0 || (s!=null && SIM.settlementOf(P.id)!==s)) return; var d=Math.hypot(P.x-at.x, P.z-at.z); if(d<bd){ bd=d; best=P; } });
    return best; }
  /* seen: the alarm, perhaps an arrest */
  function alarm(a, kind, at, s, minute, st){ var C=SIM.CRIME, J=C.cfg.jail||{}, R=arrestOdds(a, at, s, minute);
    bump(st.seen, kind); note('alarm', { actor:a.id, crime:kind, guard:R.guard ? R.guard.id : null, d:R.d });
    if(R.guard && !abstractTown(s)) SIM.command(R.guard, { act:R.guard.activity, place:at.place || null, mins:(C.cfg.arrest||{}).respond==null ? 30 : C.cfg.arrest.respond, by:'alarm' });
    if(hide(a, s, minute, R.d, kind)){ bump(st.hid, kind); bump(st.escaped, kind); return false; }   /* into the guild: out of reach */
    if(!(hash(C.seed, 917, a.k, minute, KIND[kind])<R.p)){ bump(st.escaped, kind); return false; }
    var P=jailFor(s, at); if(!P){ bump(st.escaped, kind); return false; }
    var res=hash(C.seed, 919, a.k, minute)<(J.resist==null?0.15:J.resist), days=res ? (J.resistDays==null?30:J.resistDays) : (J.days==null?7:J.days);
    if(res) st.resisted++; bump(st.arrested, kind); recover(a, st);
    SIM.command(a, { act:J.act||'JAIL', place:P.id, until:minute+days*1440, by:'jail' });
    C.held[a.id]={ place:P.id, until:minute+days*1440, crime:kind, since:minute, resisted:res };
    note('arrest', { actor:a.id, crime:kind, jail:P.id, days:days, guard:R.guard ? R.guard.id : null });
    return true; }
  /* THE GUILD: hiding there; the loot carried, fenced there or recovered on arrest */
  function hide(a, s, minute, guardD, kind){ var C=SIM.CRIME, Gc=C.cfg.guild, P=SIM.guildOf(s); if(!Gc || !P) return false;
    if(abstractTown(s)){ if(!(hash(C.seed, 951, a.k, minute)<(Gc.abstractHide==null?0.5:Gc.abstractHide))) return false; }
    else { var q=SIM.pose(a, SIM.time(), { cheap:true }), d=Math.hypot(q.x-P.x, q.z-P.z); if(d>(Gc.hideReach==null?300:Gc.hideReach) || (guardD!=null && guardD<=d)) return false; }
    var until=minute+(Gc.hideMins==null?120:Gc.hideMins); C.hiding[a.id]=until;
    SIM.command(a, { act:'HIDE', place:P.id, until:until, by:'hide' }); note('hide', { actor:a.id, crime:kind || null, guild:P.id, until:until }); return true; }
  function lotsOf(a){ return a.loot && a.loot.length ? a.loot : null; }
  function recover(a, st){ var L=lotsOf(a); if(!L) return; var Mine=SIM.R.place[a.home];
    L.forEach(function(lot){ var H=SIM.R.place[lot.from]; Object.keys(lot.food||{}).sort().forEach(function(f){ var n=Math.min(lot.food[f], Mine && Mine.store ? Mine.store[f]||0 : 0);
        if(n>0 && H){ Mine.store[f]-=n; H.store=H.store||{}; H.store[f]=(H.store[f]||0)+n; st.recovered+=n; } });
      (lot.items||[]).forEach(function(t){ var o=SIM.R.actor[t.owner]; if(o){ SIM.give(o, t.item, 1); st.recoveredItems++; } }); });
    a.loot=null; note('recovered', { actor:a.id }); }
  function fenceNow(a, minute, st){ var C=SIM.CRIME, F=(C.cfg.guild||{}).fence||{}, L=lotsOf(a), P=SIM.guildOf(town(a)); if(!L || !P) return null;
    var Mine=SIM.R.place[a.home], n=0, k=0; P.store=P.store||{}; P.stash=P.stash||{};
    L.forEach(function(lot){ Object.keys(lot.food||{}).sort().forEach(function(f){ var q=Math.min(lot.food[f], Mine && Mine.store ? Mine.store[f]||0 : 0);   /* what the household has not eaten */
        if(q>0){ Mine.store[f]-=q; P.store[f]=(P.store[f]||0)+q; n+=q; } });
      (lot.items||[]).forEach(function(t){ P.stash[t.item]=(P.stash[t.item]||0)+1; k++; }); });
    a.loot=null; st.fenced+=n; st.fencedItems+=k;
    meter(a, -((F.perServing==null?0.2:F.perServing)*n+(F.perItem==null?8:F.perItem)*k), minute);
    note('fence', { actor:a.id, guild:P.id, servings:n, items:k }); return { servings:n, items:k }; }
  function fenceStep(a, minute, st){ var C=SIM.CRIME, F=(C.cfg.guild||{}).fence||{}, P=SIM.guildOf(town(a)); if(!lotsOf(a) || !P) return;
    if(abstractTown(town(a))){ var act=actNow(a, minute); if(act && (F.acts||['SOCIALIZE', 'IDLE', 'BUY']).indexOf(act)>=0) fenceNow(a, minute, st); return; }
    if(a.place===P.id && a.task && SIM.time()>=a.task.arrive){ fenceNow(a, minute, st); return; }   /* there (hiding, or come to sell) */
    if(a.cmd && minute<a.cmd.until) return;
    if((F.acts||['SOCIALIZE', 'IDLE', 'BUY']).indexOf(a.activity)>=0) SIM.command(a, { act:'FENCE', place:P.id, until:minute+60+(F.mins==null?30:F.mins), by:'fence' }); }   /* there past the next hour's look, when it sells */
  function meter(a, n, minute){ if(!SIM.NEED || SIM.NEED.idx.material==null) return; SIM.needsOf(a, minute); var i=SIM.NEED.idx.material; a.nd[i]=Math.max(0, Math.min(100, a.nd[i]+n)); }

  /* ---------------------------------------------------------------- the crimes */
  function pickpocket(a, minute, hour, cfg, st){ var s=town(a), abs=abstractTown(s), A=SIM.CRIME.cfg.abstract||{}, C=SIM.CRIME;
    var act=actNow(a, minute); if(!act || (cfg.acts||['BUY', 'SOCIALIZE', 'IDLE']).indexOf(act)<0 || !inHours(hour, cfg.hours)) return;
    var P=null, v=null, W;
    if(abs){ if(!(hash(C.seed, 921, a.k, minute)<(A.atShare==null?0.3:A.atShare))) return;
      var L=people(s); v=L[Math.floor(hash(C.seed, 923, a.k, minute)*L.length)]; if(!v || v===a) return; W={ w:A.witnesses==null?6:A.witnesses, g:0 }; }
    else { P=SIM.R.place[a.place]; if(!P || P.guild || (cfg.at && cfg.at.indexOf(P.kind)<0) || !a.task || SIM.time()<a.task.arrive) return;   /* never in the guild: its own rule */
      var ids=Object.keys(P.who||{}).filter(function(id){ return id!==a.id; }).sort(); if(!ids.length) return;
      v=SIM.R.actor[ids[Math.floor(hash(C.seed, 923, a.k, minute)*ids.length)]]; if(!v || (C.cfg.guard && C.cfg.guard(v))) return; W=witnesses(P, a, v); }
    if(!(hash(C.seed, 925, a.k, minute)<(cfg.chance==null?0.05:cfg.chance))) return;
    bump(st.attempts, 'pickpocket');
    var at=P ? { x:P.x, z:P.z, place:P.id } : SIM.pose(v, SIM.time(), { cheap:true });
    if(hash(C.seed, 927, a.k, minute)<seenOdds(W.w, W.g, hour)){ alarm(a, 'pickpocket', at, s, minute, st); return; }
    bump(st.done, 'pickpocket'); meter(v, cfg.loss==null?15:cfg.loss, minute); meter(a, -(cfg.gain==null?15:cfg.gain), minute);
    note('crime', { actor:a.id, crime:'pickpocket', victim:v.id, place:P ? P.id : null }); }
  function burglary(a, minute, hour, cfg, st){ var s=town(a), C=SIM.CRIME;
    if(!inHours(hour, cfg.hours||[1, 4])) return;
    if(!(hash(C.seed, 931, a.k, minute)<(cfg.chance==null?0.02:cfg.chance))) return;
    var homes=people(s).map(function(x){ return x.home; }).filter(function(h, i, L){ return h!=null && h!==a.home && L.indexOf(h)===i; }).sort();
    if(!homes.length) return; var H=SIM.R.place[homes[Math.floor(hash(C.seed, 933, a.k, minute)*homes.length)]]; if(!H || !H.store) return;
    bump(st.attempts, 'burglary');
    var sl=abstractTown(s) ? (H.people||0) : Object.keys(H.who||{}).length, at={ x:H.x, z:H.z, place:H.id };
    if(hash(C.seed, 935, a.k, minute)<seenOdds(0, 0, hour, sl)){ alarm(a, 'burglary', at, s, minute, st); return; }
    var Mine=SIM.R.place[a.home], n=0; if(!Mine) return; Mine.store=Mine.store||{};
    var lot={ from:H.id, food:{}, items:[] };
    Object.keys(H.store).sort().forEach(function(f){ var k=Math.floor((H.store[f]||0)*(cfg.share==null?0.3:cfg.share)); if(k>0){ H.store[f]-=k; Mine.store[f]=(Mine.store[f]||0)+k; n+=k; lot.food[f]=k; } });
    var G=C.cfg.guild, ni=G ? (G.items==null?1:G.items) : 0;   /* and the spare things kept at home (with a guild to fence them) */
    if(ni) people(s).filter(function(x){ return x.home===H.id && x.inv; }).forEach(function(x){ Object.keys(x.inv).sort().forEach(function(it){ while(lot.items.length<ni && x.inv[it]>0){ x.inv[it]--; lot.items.push({ item:it, owner:x.id }); } }); });
    if(G) (a.loot||(a.loot=[])).push(lot);
    bump(st.done, 'burglary'); st.stolen+=n; st.taken+=lot.items.length; note('crime', { actor:a.id, crime:'burglary', home:H.id, servings:n, items:lot.items.length }); }
  function assault(a, minute, hour, cfg, st){ var s=town(a), C=SIM.CRIME; if(!SIM.NEED || a.driven || !a.present || SIM.jailed(a, minute)) return;
    if(C.cfg.guard && C.cfg.guard(a)) return;
    var act=actNow(a, minute); if(!act || (cfg.acts||['SOCIALIZE']).indexOf(act)<0) return;
    if(!(hash(C.seed, 941, a.k, minute)<(cfg.chance==null?0.01:cfg.chance))) return;   /* the cheap roll first: the happiness only for the few */
    var h=SIM.happiness(a); if(h==null || h>=(cfg.below==null?30:cfg.below)) return;
    var v=null, P=null, abs=abstractTown(s), W;
    if(abs){ var L=people(s); v=L[Math.floor(hash(C.seed, 943, a.k, minute)*L.length)]; W={ w:(C.cfg.abstract||{}).witnesses==null?6:C.cfg.abstract.witnesses, g:0 }; }
    else { P=SIM.R.place[a.place]; if(!P) return; var ids=Object.keys(P.who||{}).filter(function(id){ return id!==a.id; }).sort(); if(!ids.length) return;
      v=SIM.R.actor[ids[Math.floor(hash(C.seed, 943, a.k, minute)*ids.length)]]; W=witnesses(P, a, v); }
    if(!v || v===a) return; bump(st.attempts, 'assault'); bump(st.done, 'assault');
    if(SIM.ITEMS && v.hurt==null){ v.hurt=Math.floor(minute/1440); SIM.ITEMS.stats.hurt++; st.hurt++; }
    note('crime', { actor:a.id, crime:'assault', victim:v.id, place:P ? P.id : null });
    alarm(a, 'assault', P ? { x:P.x, z:P.z, place:P.id } : SIM.pose(v, SIM.time(), { cheap:true }), s, minute, st); }   /* a fight is always seen */

  SIM.crimeStep = function(minute){ var C=SIM.CRIME; if(!C || minute%60) return; var hour=Math.floor((minute%1440)/60), K=C.cfg.crimes||{};
    Object.keys(C.held).forEach(function(id){ var J=C.held[id]; if(minute>=J.until){ statsOf(SIM.settlementOf(SIM.R.actor[id]||id)).served++; delete C.held[id];
      C.quiet[id]=J.until+1440*((C.cfg.jail||{}).lieLow==null ? 2 : C.cfg.jail.lieLow); } });   /* let go: it lies low a while */
    C.crooks.forEach(function(id){ var a=SIM.R.actor[id]; if(!a || !a.present || a.driven || SIM.jailed(a, minute) || (C.quiet[id]!=null && minute<C.quiet[id])) return; var st=statsOf(town(a));
      if(C.cfg.guild) fenceStep(a, minute, st);
      if(SIM.hidden(a, minute)) return;   /* lying hidden at the guild */
      if(K.pickpocket) pickpocket(a, minute, hour, K.pickpocket, st);
      if(K.burglary && !SIM.jailed(a, minute)) burglary(a, minute, hour, K.burglary, st); });
    Object.keys(C.hiding).forEach(function(id){ if(minute>=C.hiding[id]) delete C.hiding[id]; });
    if(K.assault) SIM.all('actor').forEach(function(a){ assault(a, minute, hour, K.assault, statsOf(town(a))); });   /* anyone unhappy, criminal or not */
  };
  /* for the world's own actors (the player): hide, fence, carry loot, raise an alarm on a crime the world saw */
  SIM.crimeHide = function(a){ var C=SIM.CRIME; if(!C || !C.cfg.guild) return false; var m=SIM.minute(), s=town(a), P=SIM.guildOf(s); if(!P) return false;
    var q=SIM.pose(a, SIM.time(), { cheap:true }); if(Math.hypot(q.x-P.x, q.z-P.z)>(C.cfg.guild.hideReach==null?300:C.cfg.guild.hideReach)) return false;
    return hide(a, s, m, null, null); };
  SIM.crimeFence = function(a){ var C=SIM.CRIME, P=C && SIM.guildOf(town(a)); if(!P || !lotsOf(a)) return null; var q=SIM.pose(a, SIM.time(), { cheap:true });
    if(!abstractTown(town(a)) && Math.hypot(q.x-P.x, q.z-P.z)>(P.r||0)+30) return null; return fenceNow(a, SIM.minute(), statsOf(town(a))); };
  SIM.crimeLoot = function(a, lot){ (a.loot||(a.loot=[])).push({ from:lot.from, food:Object.assign({}, lot.food||{}), items:(lot.items||[]).slice() }); return a.loot; };
  SIM.crimeAlarm = function(a, kind, at){ var C=SIM.CRIME; if(!C) return null; var m=SIM.minute(), s=town(a), where=at || SIM.pose(a, SIM.time(), { cheap:true });
    return alarm(a, kind || 'crime', where, s, m, statsOf(s)); };
  SIM.crimeEvents = function(since){ var C=SIM.CRIME; if(!C) return []; return C.events.filter(function(e){ return since==null || e.m>=since; }).map(function(e){ return Object.assign({}, e); }); };
  SIM.crimeReport = function(s){ var C=SIM.CRIME; if(!C) return null; var crooks=C.crooks.filter(function(id){ var a=SIM.R.actor[id]; return a && (s==null || SIM.settlementOf(a)===s); });
    var jailed=Object.keys(C.held).filter(function(id){ return s==null || SIM.settlementOf(SIM.R.actor[id])===s; }).sort().map(function(id){ var J=C.held[id]; return { actor:id, place:J.place, until:J.until, crime:J.crime, resisted:J.resisted }; });
    var st=s==null ? C.stats : C.stats[s], m=SIM.minute(), G=SIM.guildOf(s);
    var hiding=Object.keys(C.hiding).filter(function(id){ return m<C.hiding[id] && (s==null || SIM.settlementOf(SIM.R.actor[id])===s); }).sort();
    var carrying=crooks.filter(function(id){ return lotsOf(SIM.R.actor[id]); });
    return JSON.parse(JSON.stringify({ criminals:crooks.length, crooks:crooks, jailed:jailed, stats:st||statsOf(s), guild:G ? { place:G.id, kind:G.kind, store:G.store||{}, stash:G.stash||{} } : null,
      hiding:hiding, carrying:carrying })); };
})(typeof window!=='undefined'?window:globalThis);
