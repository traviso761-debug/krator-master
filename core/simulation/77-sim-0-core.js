// ================================================================= CORE — simulation 0: SIM, the host binding, the registries
// core/simulation/PLAN.md, Phase 1 (first consumer: settlements/mungo). The world as DATA: factions, organisations,
// relations, places that offer activities in slots, roles with hour-by-hour schedules, actors, groups, events, and
// the navigation layers they move on. Decisions are STEPPED once per simulated minute from SIM's own seeded stream;
// motion between decisions is a pure function of time (77-sim-5-motion.js). No THREE, no DOM: the build's own
// fragments (its "embodiment") read SIM and draw. Record shapes are SCHEMA.md's; SIM.export() writes them back out.
//
//   SIM.init({ seed, hour:()=>0..24, day:()=>int, t:()=>motion seconds, err:(msg)=>{} })     the host binding
//   SIM.rng                       the stream decisions draw from (KRAND.stream when core/rand is loaded)
//   SIM.minute()                  the world minute: day*1440 + floor(hour*60)
//   SIM.sched([[h, ACT], ...])    a schedule as spans -> 24 hourly activities (Shade's form); 24-arrays pass through
//   SIM.add(kind, rec)            register a record of a kind (activity faction org relation place role actor group
//                                 event port transport); a duplicate id throws. The typed helpers below call it.
//   SIM.get(kind, id) / SIM.all(kind)
//   SIM.load(json)                the hand-edited overlay (PLAN.md 4.2): a record with a known id overrides it field by
//                                 field, a new id is added, {id, remove:true} deletes; then every reference is checked
//   SIM.check()                   unknown references -> SIM.problems (and the host's err), returns the list
//   SIM.logEvent(kind, data)      the decision log (a ring of SIM.LOG_MAX), what the export carries
(function(root){
  'use strict';
  var KINDS = ['activity','faction','org','relation','presence','place','role','actor','group','event','port','transport'];
  var SIM = { version:1, R:{}, order:{}, problems:[], LOG:[], LOG_MAX:6000, host:null, rng:null, routeFail:[] };
  KINDS.forEach(function(k){ SIM.R[k] = {}; SIM.order[k] = []; });

  function mulberry(seed){ var s=seed>>>0; return { next:function(){ s=(s+0x6D2B79F5)|0; var t=Math.imul(s^(s>>>15),1|s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; },
    state:function(){ return s>>>0; }, setState:function(v){ s=v>>>0; } }; }
  function stream(seed){ var K=root.KRAND; var s = K && K.stream ? K.stream(seed) : mulberry(seed);
    if(!s.range) s.range=function(a,b){ return a+(b-a)*s.next(); };
    if(!s.int) s.int=function(a,b){ return a+Math.floor(s.next()*(b-a+1)); };
    if(!s.pick) s.pick=function(arr){ return arr[Math.floor(s.next()*arr.length)%arr.length]; };
    if(!s.chance) s.chance=function(p){ return s.next()<p; };
    return s; }
  SIM.stream = stream;

  SIM.init = function(o){
    o = o || {};
    SIM.host = { hour:o.hour||function(){ return 12; }, day:o.day||function(){ return 0; }, t:o.t||function(){ return 0; },
                 err:o.err||function(m){ if(typeof console!=='undefined') console.warn('SIM: '+m); } };
    SIM.seed = (o.seed==null ? 1 : o.seed)>>>0;
    SIM.rng = stream(SIM.seed);
    return SIM;
  };
  SIM.init({});
  SIM.err = function(m){ SIM.problems.push(m); SIM.host.err(m); };
  SIM.hour = function(){ return SIM.host.hour(); };
  SIM.minute = function(){ return SIM.host.day()*1440 + Math.floor(SIM.host.hour()*60); };
  SIM.time = function(){ return SIM.host.t(); };

  SIM.sched = function(spans){
    if(spans && spans.length===24 && typeof spans[0]==='string') return spans.slice();
    if(!spans || !spans.length) throw new Error('SIM.sched: empty schedule');
    var out=new Array(24), a=spans[spans.length-1][1];
    for(var h=0;h<24;h++){ for(var i=0;i<spans.length;i++) if(spans[i][0]===h) a=spans[i][1]; out[h]=a; }
    return out;
  };

  SIM.add = function(kind, rec){
    if(!SIM.R[kind]) throw new Error('SIM.add: unknown kind '+kind);
    if(!rec || rec.id==null) throw new Error('SIM.add('+kind+'): a record needs an id');
    if(SIM.R[kind][rec.id]) throw new Error('SIM.add('+kind+'): duplicate id '+rec.id);
    SIM.R[kind][rec.id] = rec; SIM.order[kind].push(rec.id); return rec;
  };
  SIM.get = function(kind, id){ return SIM.R[kind] ? SIM.R[kind][id] : undefined; };
  SIM.all = function(kind){ var R=SIM.R[kind]; return SIM.order[kind].filter(function(id){ return R[id]; }).map(function(id){ return R[id]; }); };
  SIM.remove = function(kind, id){ delete SIM.R[kind][id]; };

  /* the overlay: what a hand-edited world/*.json says wins over what the geometry registered */
  var PLURAL = { activities:'activity', factions:'faction', orgs:'org', organizations:'org', relations:'relation', presence:'presence',
                 places:'place', roles:'role', actors:'actor', population:'role', groups:'group', events:'event', ports:'port', transports:'transport' };
  SIM.load = function(json){
    var n={ added:0, overridden:0, removed:0 };
    Object.keys(json||{}).forEach(function(file){
      var kind = PLURAL[file] || file; if(!SIM.R[kind]){ SIM.err('load: unknown record kind "'+file+'"'); return; }
      (json[file]||[]).forEach(function(r){
        if(r.id==null && kind==='relation' && r.a!=null && r.b!=null) r.id = r.a+'>'+r.b;            /* SCHEMA.md: the id defaults */
        if(r.id==null && kind==='presence' && r.faction!=null && r.settlement!=null) r.id = r.faction+'@'+r.settlement;
        if(r.id==null){ SIM.err('load: a '+kind+' record without an id ('+(r._src||'?')+')'); return; }
        var cur = SIM.R[kind][r.id];
        if(r.remove){ if(cur){ SIM.remove(kind, r.id); n.removed++; } else SIM.err('load: remove of unknown '+kind+' '+r.id+' ('+(r._src||'?')+')'); return; }
        if(cur){ for(var k in r) if(k!=='id') cur[k]=r[k]; if(cur.sched && !Array.isArray(cur.sched[0]) && cur.sched.length!==24) cur.sched=SIM.sched(cur.sched); n.overridden++; }
        else { var rec={}; for(var k2 in r) rec[k2]=r[k2];
          var mk={ activity:SIM.activity, faction:SIM.faction, org:SIM.org, relation:SIM.relation, presence:SIM.presence, place:SIM.place, role:SIM.role, actor:SIM.actor, group:SIM.group, event:SIM.event, port:SIM.port, transport:SIM.transport }[kind];
          (mk || function(o){ return SIM.add(kind, o); })(rec); n.added++; }
      });
    });
    SIM.normalize();
    SIM.lastLoad = n; return n;
  };
  /* schedules given as spans become 24-arrays; places' activities become {ACT: slots} */
  SIM.normalize = function(){
    SIM.all('role').forEach(function(R){ if(R.sched && R.sched.length && Array.isArray(R.sched[0])) R.sched = SIM.sched(R.sched); });
    SIM.all('actor').forEach(function(A){ if(A.sched && A.sched.length && Array.isArray(A.sched[0])) A.sched = SIM.sched(A.sched); });
    SIM.all('place').forEach(function(P){ if(Array.isArray(P.activities)){ var o={}; P.activities.forEach(function(a){ o[a]=P.capacity||1; }); P.activities=o; } });
  };
  /* every reference resolves, or it is a problem with a name */
  SIM.check = function(){
    var out=[], A=SIM.R.activity, F=SIM.R.faction, O=SIM.R.org, P=SIM.R.place, Ro=SIM.R.role;
    function need(ok, msg){ if(!ok) out.push(msg); }
    SIM.all('org').forEach(function(o){ need(!o.faction || F[o.faction], 'org '+o.id+': unknown faction '+o.faction); });
    SIM.all('relation').forEach(function(r){ need(F[r.a]||O[r.a], 'relation: unknown party '+r.a); need(F[r.b]||O[r.b], 'relation: unknown party '+r.b); });
    SIM.all('place').forEach(function(p){ Object.keys(p.activities||{}).forEach(function(a){ need(A[a], 'place '+p.id+': unknown activity '+a); }); need(!p.org || O[p.org], 'place '+p.id+': unknown org '+p.org); });
    SIM.all('role').forEach(function(r){ need(!r.org || O[r.org], 'role '+r.id+': unknown org '+r.org); (r.sched||[]).forEach(function(a,h){ need(A[a], 'role '+r.id+' at '+h+':00: unknown activity '+a); }); });
    SIM.all('actor').forEach(function(a){ need(Ro[a.role], 'actor '+a.id+': unknown role '+a.role); need(!a.home || P[a.home], 'actor '+a.id+': unknown home '+a.home); need(!a.work || P[a.work], 'actor '+a.id+': unknown work place '+a.work); });
    SIM.all('event').forEach(function(e){ (e.from||[]).concat(Array.isArray(e.to)?e.to:[]).forEach(function(p){ need(SIM.R.port[p], 'event '+e.id+': unknown port '+p); }); need(!e.to || Array.isArray(e.to) || e.to==='other', 'event '+e.id+': to must be a port list or "other"'); (e.legs||[]).forEach(function(l){ need(A[l.activity], 'event '+e.id+': unknown activity '+l.activity); }); });
    SIM.all('transport').forEach(function(t){ need(SIM.nav.layers[t.layer], 'transport '+t.id+': unknown layer '+t.layer); need(!t.faction || F[t.faction], 'transport '+t.id+': unknown faction '+t.faction); need(!t.org || O[t.org], 'transport '+t.id+': unknown org '+t.org);
      (t.stops||[]).forEach(function(s){ need(s.indexOf('port:')===0 ? SIM.R.port[s.slice(5)] : P[s], 'transport '+t.id+': unknown stop '+s); }); });
    out.forEach(function(m){ SIM.err(m); });
    return out;
  };

  SIM.logEvent = function(kind, data){
    var e = { m:SIM.minute(), kind:kind }; if(data) for(var k in data) e[k]=data[k];
    SIM.LOG.push(e); if(SIM.LOG.length > SIM.LOG_MAX) SIM.LOG.splice(0, SIM.LOG.length-SIM.LOG_MAX);
    return e;
  };
  root.SIM = SIM;
})(typeof window!=='undefined'?window:globalThis);
