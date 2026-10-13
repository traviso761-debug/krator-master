// ================================================================= CORE — simulation 6: needs, happiness, efficiency, loyalty
// PLAN.md 8.2 and 8.3; the Voth brief (settlements/streetlab/SIM-ROADMAP.md 1.4, 2.4 items 4 and 5). Opt-in: nothing
// here runs until a world calls SIM.needs(config); a world without it decides exactly as before.
//
//   SIM.needs({ list:[names], rate:{need: per world hour}, fill:{ACT:{need: per hour}}, work:{need: per hour},
//               weight:{need: w}, traits:{name:{need: w multiplier}}, cultures:{name:{fill:{ACT:{..}}}},
//               free:[ACT..] (a role's needs.free its own: an animal's), dwell, jitter, keep, done, interrupt:{need:{at, act, until, max, cool}},
//               bands:[{label, min, eff}], loyalty:{tau, bands:[{label, min}]}, init, secPerMinute, pain })
//   role.needs = { rate:{need: multiplier}, labour: 0..1 }        actor.trait, actor.culture, actor.nd (meters),
//   actor.boost {ACT: multiplier of that activity's fills} (a meal of two foods against one: 77-sim-6-items.js)
//
// A METER per need, 0 (met) to 100 (desperate), rises at `rate` (times the role's multiplier) every world hour, and
// falls by the actor's activity's `fill` (the culture's own table first). WORK adds `work` times the role's `labour`
// (heavy labour: thirst, a little hunger). The meters are advanced lazily: only when the actor decides, or something
// asks (SIM.needsOf), over the stretch since: first the trip (the task's duration over `secPerMinute` motion seconds a
// world minute: nothing fills on the way), then the activity. HAPPINESS is 100 less the weighted mean pain of the
// meters (pain = 100 (m/100)^pain: a meter near full hurts more than two half-full ones); the trait multiplies a
// need's weight (about +-33%: "more happiness from some needs, less unhappiness when they go unmet"). EFFICIENCY is the
// happiness band's `eff` (8.2: a score with bands); LOYALTY drifts toward happiness with time constant `tau` minutes.
//
// THE RESOLVER (SIM.desire): in an hour the schedule gives to one of `free`, the actor does the free activity whose
// fills times its meters (times the weights) is highest and that some open place within reach offers, the scheduled one
// favoured by `keep`; the choice holds `dwell` minutes (plus the actor's index modulo `jitter`). An INTERRUPT takes a worker with labour off WORK when a meter
// reaches `at` (the midday well trip for a drink) until it falls to `until`, at most `max` minutes, then not again for
// `cool` minutes. Deterministic: no draws, ties by the order of `free`.
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.NEED = null;
  SIM.needs = function(o){
    var N = { list:o.list.slice(), idx:{}, rate:[], fill:{}, work:[], weight:[], traits:{}, cultures:{}, free:(o.free||[]).slice(), freeSet:{},
              dwell:o.dwell==null?60:o.dwell, jitter:o.jitter|0, keep:o.keep==null?1.25:o.keep, done:o.done==null?15:o.done, interrupt:[], bands:o.bands||[{ label:'content', min:0, eff:1 }],
              loyalty:o.loyalty||null, init:o.init==null?25:o.init, secPerMinute:o.secPerMinute==null?60:o.secPerMinute, pain:o.pain==null?1.5:o.pain };
    var vec = function(t, d){ return N.list.map(function(n){ return t && t[n]!=null ? t[n] : d; }); };
    N.list.forEach(function(n, i){ N.idx[n]=i; });
    N.rate = vec(o.rate, 0); N.work = vec(o.work, 0); N.weight = vec(o.weight, 1);
    Object.keys(o.fill||{}).forEach(function(act){ N.fill[act]=vec(o.fill[act], 0); });
    Object.keys(o.traits||{}).forEach(function(t){ N.traits[t]=vec(o.traits[t], 1); });
    Object.keys(o.cultures||{}).forEach(function(c){ var F={}; Object.keys((o.cultures[c]||{}).fill||{}).forEach(function(act){ F[act]=vec(o.cultures[c].fill[act], 0); }); N.cultures[c]={ fill:F }; });
    N.free.forEach(function(a){ N.freeSet[a]=1; });
    Object.keys(o.interrupt||{}).forEach(function(n){ var I=o.interrupt[n]; if(N.idx[n]==null) throw new Error('SIM.needs: interrupt on an unknown need '+n);
      N.interrupt.push({ need:n, i:N.idx[n], at:I.at, act:I.act, until:I.until==null?20:I.until, max:I.max==null?45:I.max, cool:I.cool==null?60:I.cool }); });
    N.bands.sort(function(a,b){ return b.min-a.min; });
    if(N.loyalty && N.loyalty.bands) N.loyalty.bands.sort(function(a,b){ return b.min-a.min; });
    N.zero = vec(null, 0);
    SIM.NEED = N; return N;
  };
  function roleRate(a){ var R=SIM.R.role[a.role], m=R && R.needs && R.needs.rate; if(!m) return null; if(!R._nr) R._nr=SIM.NEED.list.map(function(n){ return m[n]!=null?m[n]:1; }); return R._nr; }
  function labour(a){ var R=SIM.R.role[a.role]; return (R && R.needs && R.needs.labour) || 0; }
  /* a role's own free-time choices (an animal's: feed, graze, drink, rest, idle), else the world's `free` */
  function freeOf(a){ var R=SIM.R.role[a.role], F=R && R.needs && R.needs.free; if(!F) return SIM.NEED; if(!R._nf){ R._nf={ free:F, freeSet:{} }; F.forEach(function(x){ R._nf.freeSet[x]=1; }); } return R._nf; }
  function fillOf(a, act){ var N=SIM.NEED, C=a.culture && N.cultures[a.culture]; return (C && C.fill[act]) || N.fill[act] || N.zero; }
  /* the meters' slope (per hour) doing `act` (null: on the way) */
  function slope(a, act, i){ var N=SIM.NEED, rr=roleRate(a), r=N.rate[i]*(rr?rr[i]:1);
    if(act==='WORK') r += N.work[i]*labour(a);
    if(act) r -= fillOf(a, act)[i]*(a.boost && a.boost[act]!=null ? a.boost[act] : 1);   /* a meal worth more than a bite (77-sim-6-items.js) */
    return r; }
  function ensure(a, minute){ var N=SIM.NEED; if(!a.nd){ a.nd = Array.isArray(N.init) ? N.init.slice() : N.list.map(function(){ return N.init; }); }
    if(a.ndT==null){ a.ndT=minute; a.ndFrom=minute; } }
  function run(a, act, mins){ if(mins<=0) return; var nd=a.nd; for(var i=0;i<nd.length;i++){ var v=nd[i]+slope(a, act, i)*mins/60; nd[i]= v<0?0:v>100?100:v; } }
  /* bring the meters to `minute` */
  SIM.needsOf = function(a, minute){
    var N=SIM.NEED; if(!N) return null; minute = minute==null ? SIM.minute() : minute; ensure(a, minute);
    var dt=minute-a.ndT; if(dt<=0) return a.nd;
    var from=a.ndFrom==null?a.ndT:a.ndFrom, trip=Math.max(0, Math.min(minute, from)-a.ndT);
    run(a, null, trip); run(a, a.activity, dt-trip);
    if(N.loyalty){ var h=SIM.happiness(a); a.loyal = a.loyal==null ? h : a.loyal + (h-a.loyal)*(1-Math.exp(-dt/(N.loyalty.tau||4320))); }
    a.ndT=minute; return a.nd;
  };
  /* where a meter would be at `minute` if the actor keeps on (no change to the actor) */
  function peek(a, i, minute){ var dt=minute-a.ndT; if(dt<=0) return a.nd[i]; var from=a.ndFrom==null?a.ndT:a.ndFrom, trip=Math.max(0, Math.min(minute, from)-a.ndT);
    var v=a.nd[i]+slope(a, null, i)*trip/60+slope(a, a.activity, i)*(dt-trip)/60; return v<0?0:v>100?100:v; }
  SIM.happiness = function(a){
    var N=SIM.NEED; if(!N || !a.nd) return null; var T=a.trait && N.traits[a.trait], s=0, w=0;
    for(var i=0;i<a.nd.length;i++){ var wi=N.weight[i]*(T?T[i]:1); if(!wi) continue; s+=wi*100*Math.pow(a.nd[i]/100, N.pain); w+=wi; }
    return w ? 100 - s/w : 100;
  };
  function bandOf(list, v){ for(var i=0;i<list.length;i++) if(v>=list[i].min) return list[i]; return list[list.length-1]; }
  SIM.mood = function(a){ var h=SIM.happiness(a); if(h==null) return null; var B=bandOf(SIM.NEED.bands, h), L=SIM.NEED.loyalty;
    return { happiness:h, band:B.label, eff:(B.eff==null?1:B.eff)*(SIM.ITEMS ? SIM.itemsEff(a) : 1), loyal:a.loyal,   /* a broken tool, a hurt (77-sim-6-items.js) */ loyalty:L && L.bands && a.loyal!=null ? bandOf(L.bands, a.loyal).label : null }; };
  SIM.efficiency = function(a){ var h=SIM.happiness(a); return h==null ? 1 : (bandOf(SIM.NEED.bands, h).eff==null ? 1 : bandOf(SIM.NEED.bands, h).eff); };

  /* ---------------------------------------------------------------- the resolver's clause (SIM.desire) */
  function available(a, act, minute){
    var R=SIM.R.role[a.role], pref=(R.prefers&&R.prefers[act])||{}, hour=Math.floor((minute%1440)/60);
    if(pref.pin==='home'){ var H=SIM.R.place[a.home]; return !!(H && SIM.offers(H, act)); }
    var H2=SIM.R.place[a.home], near=H2 ? [H2.x, H2.z] : (a.at||[0,0]);
    return SIM.placesFor(act, a, hour, { near:near, kinds:pref.kinds, limit:1, maxR:pref.reach!=null?pref.reach:SIM.REACH }).length>0;
  }
  /* Only a question about the present (the stepper's, the decision's) changes the actor: one about another minute (the
     report asking what the rest day will want) reads the meters as they would be and leaves everything as it is */
  SIM.needsDesire = function(a, minute, act){
    var N=SIM.NEED; if(!N || !a.present || a.plan) return act;
    ensure(a, minute); var live = minute===SIM.minute();
    /* an interrupt (the well trip off a labourer's shift) */
    if(N.interrupt.length && act==='WORK' && labour(a)>0){
      if(a.intr){ var I=a.intr; if(peek(a, I.i, minute)<=I.until || minute-a.intrSince>=I.max){ if(!live) return act; a.intr=null; a.intrCool=minute+I.cool; } else return I.act; }
      if(minute>=(a.intrCool||0)) for(var k=0;k<N.interrupt.length;k++){ var J=N.interrupt[k]; if(peek(a, J.i, minute)>=J.at){ if(live){ a.intr=J; a.intrSince=minute; } return J.act; } }
      return act;
    }
    if(a.intr && live){ a.intr=null; }
    var FR=freeOf(a); if(!FR.freeSet[act]) return act;
    /* free time: what the meters ask for, held `dwell` minutes (and the actor's share of `jitter`, so a district's
       choices do not all fall due in one minute) */
    if(a.fr && a.frFor===act && minute>=a.frSince && minute-a.frSince<N.dwell+(N.jitter ? a.k%N.jitter : 0)) return a.fr;
    var nd=a.nd.map(function(v, i){ return peek(a, i, minute); }), T=a.trait && N.traits[a.trait], sc=[];
    FR.free.forEach(function(opt, j){ var F=fillOf(a, opt), s=0; for(var i=0;i<F.length;i++) if(F[i]>0 && nd[i]>N.done) s+=F[i]*nd[i]*N.weight[i]*(T?T[i]:1);
      if(opt===act) s=s*N.keep+1e-6; sc.push([s, j, opt]); });
    sc.sort(function(p, q){ return q[0]-p[0] || p[1]-q[1]; });
    var pick=act;
    for(var m=0;m<sc.length;m++){ if(sc[m][2]===act || available(a, sc[m][2], minute)){ pick=sc[m][2]; break; } }
    if(live){ a.fr=pick; a.frFor=act; a.frSince=minute; }
    return pick;
  };
  /* the soonest minute this clause could answer otherwise (SIM.step's wake): a free choice's dwell running out, a
     labourer's meter reaching an interrupt's `at` (from the steeper of its slope at work and on the way), an interrupt
     under way (each minute), a cool-down ending */
  SIM.needsWake = function(a, minute, act){
    var N=SIM.NEED; if(!N || !a.nd || a.ndT==null) return Infinity; var w=Infinity;
    if(a.intr) return minute+1;
    if(act==='WORK' && N.interrupt.length && labour(a)>0){
      if(a.intrCool && a.intrCool>minute) w=Math.min(w, a.intrCool);
      for(var k=0;k<N.interrupt.length;k++){ var J=N.interrupt[k], v=peek(a, J.i, minute), sl=Math.max(slope(a, null, J.i), slope(a, 'WORK', J.i));
        if(sl>0) w=Math.min(w, minute+Math.max(1, Math.floor((J.at-v)/sl*60))); }
    }
    if(a.fr && a.frFor===act) w=Math.min(w, a.frSince+N.dwell+(N.jitter ? a.k%N.jitter : 0));
    return w;
  };
  /* SIM.decide: the meters brought to now on the old activity; the new one fills from its arrival */
  SIM.needsDecided = function(a, minute, task){
    var N=SIM.NEED; if(!N) return; SIM.needsOf(a, minute);
    a.ndFrom = minute + (task && task.dur ? Math.round(task.dur/N.secPerMinute) : 0);
  };
  /* SIM.jump: the clock moved without the world living it: the meters stay, the gap is not counted */
  SIM.needsJump = function(a, minute){ if(!SIM.NEED) return; ensure(a, minute); a.ndT=minute; a.ndFrom=minute; a.fr=null; a.intr=null; a.intrCool=0; };

  /* ---------------------------------------------------------------- the census of needs */
  /* by `key(actor)` (or all): how many, mean happiness, mean efficiency, the band counts, each need's mean and how many
     have it at `high` or more; the meters brought to `minute` first */
  SIM.needsCensus = function(key, opt){
    var N=SIM.NEED; if(!N) return null; opt=opt||{}; var minute=opt.minute==null?SIM.minute():opt.minute, high=opt.high==null?70:opt.high, out={};
    SIM.all('actor').forEach(function(a){ if(!a.present || a.driven || a.transient || (a.animal && !opt.animals) || (opt.filter && !opt.filter(a))) return; SIM.needsOf(a, minute);
      var k=key ? key(a) : 'all'; if(k==null) return; var G=out[k] || (out[k]={ n:0, happy:0, eff:0, bands:{}, mean:N.list.map(function(){ return 0; }), high:N.list.map(function(){ return 0; }), loyal:0, loyalty:{} });
      var M=SIM.mood(a); G.n++; G.happy+=M.happiness; G.eff+=M.eff; G.bands[M.band]=(G.bands[M.band]||0)+1; if(M.loyal!=null){ G.loyal+=M.loyal; if(M.loyalty) G.loyalty[M.loyalty]=(G.loyalty[M.loyalty]||0)+1; }
      for(var i=0;i<a.nd.length;i++){ G.mean[i]+=a.nd[i]; if(a.nd[i]>=high) G.high[i]++; } });
    Object.keys(out).forEach(function(k){ var G=out[k], n=G.n||1; G.happy=Math.round(G.happy/n*10)/10; G.eff=Math.round(G.eff/n*1000)/1000; G.loyal=Math.round(G.loyal/n*10)/10;
      var mean={}, hi={}; N.list.forEach(function(nm, i){ mean[nm]=Math.round(G.mean[i]/n*10)/10; hi[nm]=G.high[i]; }); G.mean=mean; G.high=hi; });
    return out;
  };
})(typeof window!=='undefined'?window:globalThis);
