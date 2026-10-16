// ================================================================= CORE — simulation 1: factions, organisations, relations, presence
// PLAN.md 4.3. A faction is a polity or a people (LORE.md section 6); an organisation belongs to one (a guild chapter,
// a watch, a household, a caravan company); a relation is DIRECTIONAL, a's stance toward b, and an org-level relation
// overrides its faction's. Presence says how a foreign faction stands in a settlement.
//
//   SIM.faction({id, name, parent?, culture?, colours?, sign?})
//   SIM.org({id, name, faction, kind?, resident?:bool, hostile?})
//   SIM.relation({a, b, stance:'allied'|'friendly'|'cordial'|'neutral'|'wary'|'hostile', trade?, travel?, settle?, trust?})
//   SIM.presence({id, faction, settlement, status:'NONE'|'VISITING'|'TRADING'|'RESIDENT'|'ESTABLISHED'|'PERSECUTED'|'EXPELLED'})
//   SIM.stance(a, b)              a's stance toward b (org ids or faction ids), falling back org -> faction -> 'neutral'
//   SIM.welcome(actorOrOrg, place, act?) true when the place lets them in: place.access 'public' (default) | 'org' (its own
//                                 org only) | 'friendly' (orgs whose stance from the place's org is friendly or better)
(function(root){
  'use strict';
  var SIM = root.SIM;
  var RANK = { hostile:0, wary:1, neutral:2, cordial:3, friendly:4, allied:5 };
  SIM.STANCES = Object.keys(RANK);
  SIM.faction = function(o){ return SIM.add('faction', o); };
  SIM.org = function(o){ if(o.resident==null) o.resident=true; return SIM.add('org', o); };
  SIM.relation = function(o){ if(RANK[o.stance]==null) throw new Error('SIM.relation: unknown stance '+o.stance);
    if(o.id==null) o.id = o.a+'>'+o.b; return SIM.add('relation', o); };
  SIM.presence = function(o){ if(o.id==null) o.id = o.faction+'@'+o.settlement; return SIM.add('presence', o); };
  function factionOf(x){ var O=SIM.R.org[x]; return O ? O.faction : x; }
  function rel(a,b){ var R=SIM.R.relation[a+'>'+b]; return R ? R.stance : null; }
  SIM.stance = function(a, b){
    if(a===b) return 'allied';
    var fa=factionOf(a), fb=factionOf(b);
    if(fa===fb) return 'allied';
    return rel(a,b) || rel(a,fb) || rel(fa,b) || rel(fa,fb) || 'neutral';
  };
  SIM.rank = function(stance){ return RANK[stance]; };
  SIM.welcome = function(who, place, act){
    var org = typeof who==='string' ? who : who.org, acc = place.access || 'public';
    if(acc==='public') return SIM.rank(SIM.stance(place.org||place.faction||org, org)) >= RANK.wary;
    if(acc==='org') return org===place.org;
    if(acc==='friendly') return org===place.org || SIM.rank(SIM.stance(place.org, org)) >= RANK.friendly;
    if(acc==='private'){ if(typeof who==='string') return false; if(who.home===place.id || who.work===place.id) return true;   /* a home: its own people, */
      var g=act && place.guests && place.guests[act], H=g && SIM.R.place[who.home];                                               /* and for an activity it takes guests for, the */
      return !!(H && Math.hypot(H.x-place.x, H.z-place.z) <= g); }                                                                  /* neighbours whose home is within that many metres */
    return false;
  };
})(typeof window!=='undefined'?window:globalThis);
