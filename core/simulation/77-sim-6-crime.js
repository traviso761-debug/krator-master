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
//   SIM.crimeStep(minute)        SIM.step's, hourly: every criminal's chances, then the unhappy's fights
//   SIM.crimeReport(s?) -> {criminals, jailed:[{actor, place, until, crime}], stats:{attempts, done, seen, arrested,
//                         resisted, escaped, by kind; stolen (servings), hurt, served}}
//   SIM.jailed(a, minute?) -> true while an actor is held
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
    var C={ cfg:o, seed:o.seed==null?0:o.seed, crooks:[], isCrook:{}, stats:{}, held:{}, quiet:{}, towns:{}, guards:{}, events:[] };
    var act=(o.jail&&o.jail.act)||'JAIL'; if(SIM.R.activity && !SIM.R.activity[act]) SIM.activity({ id:act });
    var guard=o.guard||function(){ return false; }, who=o.who||function(){ return true; };
    SIM.all('actor').slice().sort(function(a, b){ return a.k-b.k; }).forEach(function(a){
      if(a.driven || guard(a) || !who(a)) return;
      if(hash(C.seed, 911, a.k)<(o.share==null?0.001:o.share)){ C.crooks.push(a.id); C.isCrook[a.id]=1; } });
    SIM.CRIME=C; return C;
  };
  function statsOf(s){ var C=SIM.CRIME, k=s==null?'':s; return C.stats[k]||(C.stats[k]={ attempts:{}, done:{}, seen:{}, arrested:{}, escaped:{}, resisted:0, stolen:0, hurt:0, served:0 }); }
  function town(a){ return SIM.R.settlement ? SIM.settlementOf(a) : null; }
  function abstractTown(s){ return !!(SIM.ABSTRACT && s!=null && SIM.ABSTRACT[s]); }
  function people(s){ var C=SIM.CRIME, k=s==null?'':s; if(C.towns[k]) return C.towns[k];
    var L=SIM.all('actor').filter(function(a){ return !a.driven && (s==null || SIM.settlementOf(a)===s); }).sort(function(a, b){ return a.k-b.k; });
    return (C.towns[k]=L); }
  function guardsOf(s){ var C=SIM.CRIME, k=s==null?'':s; if(C.guards[k]) return C.guards[k]; var g=C.cfg.guard||function(){ return false; };
    return (C.guards[k]=people(s).filter(function(a){ return g(a); })); }
  SIM.jailed = function(a, minute){ var m=minute==null?SIM.minute():minute, C=SIM.CRIME; return !!(C && a.cmd && a.cmd.by==='jail' && m<a.cmd.until); };
  function actNow(a, minute){ if(!abstractTown(town(a))) return a.activity; var s=SIM.schedOf(a, minute); return s ? s[Math.floor((minute%1440)/60)] : null; }

  /* the odds it is seen, by the witnesses where it happens */
  function seenOdds(w, g, hour, sleepers){ var S=SIM.CRIME.cfg.seen||{};
    var p=(S.base==null?0.05:S.base)+(S.perWitness==null?0.03:S.perWitness)*w+(S.guard==null?0.5:S.guard)*g+(S.sleeper==null?0.02:S.sleeper)*(sleepers||0);
    if(inHours(hour, S.nightHours||[21, 5])) p*=(S.night==null?0.4:S.night);
    return Math.min(S.max==null?0.95:S.max, p); }
  function witnesses(P, a, v){ var w=0, g=0, gd=SIM.CRIME.cfg.guard||function(){ return false; };
    Object.keys(P.who||{}).forEach(function(id){ if(id===a.id || (v && id===v.id)) return; var x=SIM.R.actor[id]; if(!x) return; if(gd(x)) g++; else w++; }); return { w:w, g:g }; }
  /* the alarm: the nearest guard on duty comes (presented), or the town's guards a head (abstract) */
  function arrestOdds(a, at, s, minute){ var C=SIM.CRIME, A=C.cfg.arrest||{}, acts=C.cfg.guardActs||['WORK'], base=A.base==null?0.6:A.base;
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
    if(!(hash(C.seed, 917, a.k, minute, KIND[kind])<R.p)){ bump(st.escaped, kind); return false; }
    var P=jailFor(s, at); if(!P){ bump(st.escaped, kind); return false; }
    var res=hash(C.seed, 919, a.k, minute)<(J.resist==null?0.15:J.resist), days=res ? (J.resistDays==null?30:J.resistDays) : (J.days==null?7:J.days);
    if(res) st.resisted++; bump(st.arrested, kind);
    SIM.command(a, { act:J.act||'JAIL', place:P.id, until:minute+days*1440, by:'jail' });
    C.held[a.id]={ place:P.id, until:minute+days*1440, crime:kind, since:minute, resisted:res };
    note('arrest', { actor:a.id, crime:kind, jail:P.id, days:days, guard:R.guard ? R.guard.id : null });
    return true; }
  function meter(a, n, minute){ if(!SIM.NEED || SIM.NEED.idx.material==null) return; SIM.needsOf(a, minute); var i=SIM.NEED.idx.material; a.nd[i]=Math.max(0, Math.min(100, a.nd[i]+n)); }

  /* ---------------------------------------------------------------- the crimes */
  function pickpocket(a, minute, hour, cfg, st){ var s=town(a), abs=abstractTown(s), A=SIM.CRIME.cfg.abstract||{}, C=SIM.CRIME;
    var act=actNow(a, minute); if(!act || (cfg.acts||['BUY', 'SOCIALIZE', 'IDLE']).indexOf(act)<0 || !inHours(hour, cfg.hours)) return;
    var P=null, v=null, W;
    if(abs){ if(!(hash(C.seed, 921, a.k, minute)<(A.atShare==null?0.3:A.atShare))) return;
      var L=people(s); v=L[Math.floor(hash(C.seed, 923, a.k, minute)*L.length)]; if(!v || v===a) return; W={ w:A.witnesses==null?6:A.witnesses, g:0 }; }
    else { P=SIM.R.place[a.place]; if(!P || (cfg.at && cfg.at.indexOf(P.kind)<0) || !a.task || SIM.time()<a.task.arrive) return;
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
    Object.keys(H.store).sort().forEach(function(f){ var k=Math.floor((H.store[f]||0)*(cfg.share==null?0.3:cfg.share)); if(k>0){ H.store[f]-=k; Mine.store[f]=(Mine.store[f]||0)+k; n+=k; } });
    bump(st.done, 'burglary'); st.stolen+=n; note('crime', { actor:a.id, crime:'burglary', home:H.id, servings:n }); }
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
      if(K.pickpocket) pickpocket(a, minute, hour, K.pickpocket, st);
      if(K.burglary && !SIM.jailed(a, minute)) burglary(a, minute, hour, K.burglary, st); });
    if(K.assault) SIM.all('actor').forEach(function(a){ assault(a, minute, hour, K.assault, statsOf(town(a))); });   /* anyone unhappy, criminal or not */
  };
  SIM.crimeEvents = function(since){ var C=SIM.CRIME; if(!C) return []; return C.events.filter(function(e){ return since==null || e.m>=since; }).map(function(e){ return Object.assign({}, e); }); };
  SIM.crimeReport = function(s){ var C=SIM.CRIME; if(!C) return null; var crooks=C.crooks.filter(function(id){ var a=SIM.R.actor[id]; return a && (s==null || SIM.settlementOf(a)===s); });
    var jailed=Object.keys(C.held).filter(function(id){ return s==null || SIM.settlementOf(SIM.R.actor[id])===s; }).sort().map(function(id){ var J=C.held[id]; return { actor:id, place:J.place, until:J.until, crime:J.crime, resisted:J.resisted }; });
    var st=s==null ? C.stats : C.stats[s]; return JSON.parse(JSON.stringify({ criminals:crooks.length, crooks:crooks, jailed:jailed, stats:st||statsOf(s) })); };
})(typeof window!=='undefined'?window:globalThis);
