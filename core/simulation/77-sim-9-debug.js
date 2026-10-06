// ================================================================= CORE — simulation 9: audits and the census (window._sim)
// Shade's audits, lifted (PLAN.md Phase 1): every activity a schedule asks for is offered somewhere; for each hour, the
// residents who want each activity fit the slots that offer it; every place is reachable on its layer from the host's
// reference point; plus the live census (who is doing what, how many moving, how many indoors).
//
//   SIM.REF = {layer, x, z, ports?}  the host's reference point for reachability (its market, its hub); ports:true also
//                                  routes to every port on its layer ('port:<id>' in unroutable when it cannot)
//   SIM.audit() -> {people, places, roles, transients, unknownActivities, capacity:[{hour, activity, want, slots, short}], unroutable, routeFail}
//                                  capacity fills each hour's wants into the open slots, the activity fewest places offer
//                                  first (Shade's order), a place's `cap` shared by all its activities; without caps that
//                                  is want > slots. SOCIALIZE, REST, IDLE fill last and are not reported (they fall back),
//                                  so a tie never lets them take a quarter's room before a meal or a bed
//   SIM.audits.push(fn(out))       a build's own checks (Shade's only way up, its convoy, its commutes) add their fields to
//                                  the same report
//   SIM.census(t) -> {byActivity, byRole, moving, hidden, present, groups, decisionsLogged}
//   window._sim = {audit, census, export, problems, log}
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.REF = null;
  SIM.audits = [];
  SIM.audit = function(){
    var A=SIM.R.activity, places=SIM.all('place'), res=SIM.all('actor').filter(function(a){ return !a.transient; });
    var out={ people:res.length, transients:SIM.all('actor').length-res.length, places:places.length, roles:SIM.all('role').length, unknownActivities:[], capacity:[], unroutable:[], routeFail:SIM.routeFail.length };
    var offered={}; places.forEach(function(P){ Object.keys(P.activities).forEach(function(k){ offered[k]=(offered[k]||0)+P.activities[k]; if(!A[k]) out.unknownActivities.push(P.id+':'+k); }); });
    SIM.all('role').forEach(function(R){ var seen={}; (R.sched||[]).forEach(function(a){ if(seen[a]) return; seen[a]=1;
      if(!A[a]) out.unknownActivities.push(R.id+':'+a+' (no such activity)');
      else if(!offered[a] && SIM.FALLBACK.indexOf(a)<0 && !(R.fallback&&R.fallback[a])) out.unknownActivities.push(R.id+':'+a+' (offered nowhere)'); }); });
    for(var h=0;h<24;h++){ var want={}; res.forEach(function(a){ var s=a.sched||SIM.R.role[a.role].sched; if(!s) return; want[s[h]]=(want[s[h]]||0)+1; });
      var acts=Object.keys(want), open={}, room={}, short={}, slots={};
      acts.forEach(function(k){ open[k]=places.filter(function(P){ return SIM.offers(P,k) && SIM.isOpen(P,k,h); }); slots[k]=0; open[k].forEach(function(P){ slots[k]+=P.activities[k]; }); });
      places.forEach(function(P){ if(P.cap!=null) room[P.id]=P.cap; });
      var fb=function(k){ return SIM.FALLBACK.indexOf(k)>=0 ? 1 : 0; };
      acts.slice().sort(function(a,b){ return fb(a)-fb(b) || open[a].length-open[b].length || (a<b?-1:1); }).forEach(function(k){ var need=want[k];
        open[k].forEach(function(P){ if(need<=0) return; var t=Math.min(need, P.activities[k], P.cap!=null ? room[P.id] : Infinity); if(P.cap!=null) room[P.id]-=t; need-=t; });
        short[k]=need; });
      acts.forEach(function(k){ if(short[k] > 0 && SIM.FALLBACK.indexOf(k)<0) out.capacity.push({ hour:h, activity:k, want:want[k], slots:slots[k], short:short[k] }); }); }
    if(SIM.REF){ places.forEach(function(P){ var lay = P.layer==='water' ? null : (P.layer||'pedestrian'); if(!lay || !SIM.nav.layers[lay]) return;
      var r=SIM.nav.route(lay, SIM.REF, P.door, {}); if(!r) out.unroutable.push(P.id); });
      if(SIM.REF.ports) SIM.all('port').forEach(function(Pt){ if(!SIM.nav.layers[Pt.layer]) return;
        if(!SIM.nav.route(Pt.layer, SIM.REF, { x:Pt.x, z:Pt.z }, {})) out.unroutable.push('port:'+Pt.id); }); }
    SIM.audits.forEach(function(f){ f(out); });
    return out;
  };
  SIM.census = function(t){
    t = t==null ? SIM.time() : t;
    var o={ byActivity:{}, byRole:{}, moving:0, hidden:0, present:0, groups:SIM.all('group').length, decisionsLogged:SIM.LOG.length, problems:SIM.problems.length };
    SIM.all('actor').forEach(function(a){ if(!a.present) return; o.present++; var p=SIM.pose(a, t);
      o.byActivity[a.activity||'?']=(o.byActivity[a.activity||'?']||0)+1; o.byRole[a.role]=(o.byRole[a.role]||0)+1; if(p.moving) o.moving++; if(p.hidden) o.hidden++; });
    return o;
  };
  root._sim = { audit:function(){ return SIM.audit(); }, census:function(){ return SIM.census(); }, export:function(o){ return SIM.export(o); },
    problems:SIM.problems, log:function(n){ return SIM.LOG.slice(-(n||40)); }, nav:function(){ return SIM.nav.stats(); }, routeFail:SIM.routeFail };
})(typeof window!=='undefined'?window:globalThis);
