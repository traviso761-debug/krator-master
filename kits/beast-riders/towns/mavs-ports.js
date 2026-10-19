/* ======================================================================
   kits/beast-riders/towns/mavs-ports.js: Mav's Refuge's buildings the kit takes (the port table), SEALED INTO Mav's
   Refuge's closure by towns.py after its layout (30-layout.js: MAINS and their slots, PLATS and their rooms, ROOSTS)
   and the hook (hook.js). Each variant names the marks it is drawn by (55-arch.js and 56-levels.js call
   PORT(kind, id, ...)). The gate trees' carvings are chosen as the ramp is carved (56-levels.js gtRamp draws each
   kind), so their table takes every 'gtfacade' mark and picks one of each kind after the run (the mark's id ends in it).
   ====================================================================== */
var BRT_DEFS = (function(){
  var KL = { home:'Home', fancy:'Fine house', shop:'Shop', tavern:'Tavern', inn:'Inn', barracks:'Barracks', armoury:'Armoury',
             mess:'Mess hall', store:'Storehouse', silkhouse:'Silk house', shrine:'Nature shrine' };
  function lots(kind){ var out = [];
    MAINS.forEach(function(P){ P.slots.forEach(function(S, si){ if(S.kind === kind) out.push({ P:P, S:S, id:P.id+'.'+si }); }); });
    return out; }
  var lotVars = ['home','fancy','shop','tavern','inn','barracks','armoury','mess','store','silkhouse'].map(function(k){
    var L = lots(k)[0]; return L && { name: KL[k]+' ('+L.P.name+')', parts:[{ kind:'lot', id:L.id }] }; }).filter(Boolean);
  var shrine = lots('shrine')[0];
  function room(kind){ for(var i=0;i<PLATS.length;i++){ var P=PLATS[i]; if(P.levels.length<2) continue;
      for(var j=0;j<P.rooms.length;j++){ var R=P.rooms[j]; if(R.kind===kind && !R.whole) return { P:P, id:P.id+'.'+j }; } } return null; }
  var RK = { apt:'Apartment front', store:'Store front', work:'Workshop front', web:'Silk room (web)' };
  var rooms = ['apt','store','work','web'].map(function(k){ var r = room(k); return r && { name: RK[k]+' ('+r.P.name+')', parts:[{ kind:'room', id:r.id }] }; }).filter(Boolean);
  function roost(test, name){ for(var i=0;i<ROOSTS.length;i++) if(test(ROOSTS[i])) return { name: name+' ('+ROOSTS[i].plat.name+')', parts:[{ kind:'roost', id:i }] }; return null; }
  var roosts = [roost(function(R){ return R.big; }, 'Great roost'), roost(function(R){ return !R.big && R.plat.main; }, 'Roost'),
                roost(function(R){ return !R.big && !R.plat.main; }, 'Satellite roost')].filter(Boolean);
  var GK = { storehouse:'Carved storehouse', vault:'Strongroom vault', shrine:'Trunk shrine', dorm:'Dormitory', inn:'Ramp-side inn',
             barracks:'Gate barracks', guardpost:'Guard post' };
  var facades = ['storehouse','vault','shrine','dorm','inn','barracks','guardpost'].map(function(k){
    return { name: GK[k], pick: function(marks){ for(var i=0;i<marks.length;i++){ var p = String(marks[i].id).split('.'); if(p[2]===k) return marks[i]; } return null; } }; });
  return [
    { key:'br_port_mavs_lot', name:"Mav's Refuge's deck lots (the ring buildings)", town:'mavs', family:'housing', types:['dwelling-single','shop','tavern','inn'],
      variants: lotVars },
    { key:'br_port_mavs_shrine', name:"Mav's Refuge's nature shrine", town:'mavs', family:'religious', types:['religious'],
      variants: shrine ? [{ name: 'Nature shrine ('+shrine.P.name+')', parts:[{ kind:'lot', id:shrine.id }] }] : [] },
    { key:'br_port_mavs_council', name:"Mav's Refuge's council chamber", town:'mavs', family:'civic', types:['civic'],
      variants:[{ name:'The Council Chamber', parts:[{ kind:'council', id:0 }] }] },
    { key:'br_port_mavs_rain_canopy', name:"Mav's Refuge's rain canopy (over Mav's Crown)", town:'mavs', family:'civic', types:['market','infrastructure'],
      variants:[{ name:'The Rain Canopy', parts:[{ kind:'canopy', id:0 }] }] },
    { key:'br_port_mavs_roost', name:"Mav's Refuge's roosts (landing lips and stalls on a level's rim)", town:'mavs', family:'infrastructure', types:['infrastructure'],
      variants: roosts },
    { key:'br_port_mavs_room_front', name:"Mav's Refuge's room fronts (the levels' rooms)", town:'mavs', family:'housing', types:['dwelling-multi','shop','industry'],
      variants: rooms },
    { key:'br_port_mavs_gate_facade', name:"Mav's Refuge's gate-tree carvings (rooms cut into the gate baobabs)", town:'mavs', family:'housing', types:['dwelling-multi','religious','inn'],
      all:'gtfacade', variants: facades }
  ];
})();
