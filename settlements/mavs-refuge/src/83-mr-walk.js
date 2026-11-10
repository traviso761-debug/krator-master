/* ============================== 25c. THE WALK: core/walk under the doors (KWALK; 2026-11-09) ==============================
   Mav's Refuge's host walker stood on the ground with nothing in its way, so its 1,883 operable doors (core/door, 54-openings.js)
   blocked nothing. Now, once everything is built (and before the host takes the page, 98-start.js, which hands KWALK to the
   walker): every interior unit's plan (57a's MIX.record(i).B: the kit's planBuilding output, the same plan the rooms are
   furnished on) goes into core/walk through the interiors kit's own writer (KratorInteriors.walk.register: each storey's floor,
   each wall as blocks gapped at its doors, each stair), then each door's walk blocks (KDOOR.walk: shut = blocked) and any other
   block standing in an unlocked doorway switched off (KDOOR.clearDoorways: a planned wall where the builder's door stands), as
   Girder's goWalk does. The decks, bridges and trunks are not in it yet (the walker keeps to the ground outside the units).
   Host-side only: no builder (55-arch.js, 56-levels.js, 57a) is touched.
   MRWALK.reach(o): the reachability audit (KWALK.reach): each unit flooded from the step outside each of its unlocked doors (on
   a plane at the door's sill: the deck or the ground it stands on) over the unit's box, with its doors open; returns the floors
   no walker gets to. o.shut: the doors left shut (the negative: a shut door's floors are not reached through it). */
var MRWALK = window.MRWALK = { on: typeof KWALK !== 'undefined' && typeof KratorInteriors !== 'undefined' && !!(KratorInteriors.walk && KratorInteriors.walk.register) && typeof MIX !== 'undefined' && MIX.on };
(function(){
  if(!MRWALK.on) return;
  var t0 = performance.now(), IX = KratorInteriors, out = { units:0, floors:0, blocks:0, strips:0, failed:0 };
  MRWALK.units = [];
  MIX.units.forEach(function(u){ var r = null; try{ r = MIX.record(u.i); }catch(e){ out.failed++; return; } if(!r || !r.B) return;
    var y0 = u.shell.y || 0, w = IX.walk.register({ id:u.id, rooms:[], buildings:[r.B], baseY:y0, item:{ wall:u.shell.wall } }, KWALK, { ground:y0, tag:'mix:'+u.id });
    out.units++; out.floors += w.floors; out.blocks += w.blocks; out.strips += w.strips;
    MRWALK.units.push({ u:u, B:r.B, y0:y0 }); });
  out.doors = KDOOR.walk(KWALK);
  out.cleared = KDOOR.clearDoorways(KWALK);
  out.ms = Math.round(performance.now() - t0);
  window._mrwalk = out;
  /* each unit's box (its storeys' outlines), and its unlocked doors: the ones whose sill stands within 1.5 m of the box, at a storey */
  function box(E){ var b = [1e9, -1e9, 1e9, -1e9]; (E.B.floors || []).forEach(function(F){ F.poly.forEach(function(p){ b[0] = Math.min(b[0], p[0]); b[1] = Math.max(b[1], p[0]); b[2] = Math.min(b[2], p[1]); b[3] = Math.max(b[3], p[1]); }); }); return b; }
  MRWALK.reach = function(o){
    o = o || {}; var res = { units:0, floors:0, reached:0, noDoor:0, capped:0, nodes:0, unreached:[], shut:!!o.shut };
    var was = KDOOR.list.map(function(D){ return D.target; });
    KDOOR.list.forEach(function(D){ if(o.shut) KDOOR.close(D); else KDOOR.open(D, { by:'audit' }); }); for(var k=0;k<60;k++) KDOOR.step(0.1);
    MRWALK.units.forEach(function(E){ var b = box(E); if(!(b[1] > b[0])) return;
      var L = KDOOR.list.filter(function(D){ return !D.locked && D.at[0] > b[0]-1.5 && D.at[0] < b[1]+1.5 && D.at[2] > b[2]-1.5 && D.at[2] < b[3]+1.5 &&
        (E.B.floors || []).some(function(F){ return Math.abs(F.y - D.at[1]) < 1.2; }); });
      var fl = KWALK.floors.filter(function(F){ return F.tag === 'mix:' + E.u.id && /\.floor\./.test(F.name || ''); });
      res.units++; res.floors += fl.length;
      if(!L.length){ res.noDoor++; fl.forEach(function(F){ res.unreached.push(F.name); }); return; }
      var hit = new Set();
      L.forEach(function(D){ var nx = Math.sin(D.yaw), nz = Math.cos(D.yaw), sy = D.at[1];
        var r = KWALK.reach([[D.at[0] + nx*0.9, sy, D.at[2] + nz*0.9]], { ground:function(){ return sy; }, box:[b[0]-4, b[1]+4, b[2]-4, b[3]+4], limit:400000 });
        res.nodes += r.nodes; if(r.capped) res.capped++; r.reached.forEach(function(F){ hit.add(F); }); });
      fl.forEach(function(F){ if(hit.has(F)) res.reached++; else res.unreached.push(F.name); }); });
    KDOOR.list.forEach(function(D, i){ if(was[i] > 0.5) KDOOR.open(D); else KDOOR.close(D); }); for(k=0;k<60;k++) KDOORHOST.tick(0.1);
    res.unreachedN = res.unreached.length; res.unreached = res.unreached.slice(0, 20); return res; };
})();
