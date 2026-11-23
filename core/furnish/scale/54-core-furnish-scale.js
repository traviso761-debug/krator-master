/* ================================================================= CORE FURNISH: the per-culture scale ([G data])
   Some peoples are not a human's size, and their rooms and the furniture in them are drawn to their measure: the
   Tungangs at 0.94 (kits/tungang/PLAN.md 3.1, TG.SCALE), the Khaayken at 1.15 (kits/yeti/PLAN.md: YT.SCALE). The
   catalog draws every piece at a human's measure; this fragment scales a piece where it is placed, so one constant
   per culture does it and no culture file carries a scattered number.
   OPT-IN: a page takes it by listing this file after 50-core-furnish.js. It lives in core/furnish/scale/ because Girder,
   Mav's Refuge and Highlands take every numbered file of core/furnish/ itself. A page that does not list it draws as
   before (its hash unchanged); a page that lists it scales only the cultures in KFURN.SCALE.
   THE RULE: a piece placed in a room of a scaled culture takes that culture's scale (the generic and scrap pieces a
   Tungang hold falls back on are cut to its people too); a piece of a scaled culture placed anywhere else takes its
   own culture's scale; everything else is 1.
     KFURN.SCALE                          { culture: s }: tungang 0.94, glazier 0.94, khaayken 1.15
     KFURN.scaleOf(roomCulture, pieceCulture) -> s
     KFURN.scaleRec(rec, entry, roomCulture)  -> rec, with rec.s set when s is not 1 (a cfg.finish or onRecord calls it;
                                             a draw adapter that sees rec.s scales the piece about its origin)
     KFURN.scaleAdapter(adapter, s)       -> a kits/interiors adapter (API.md section 2) whose pieces are s times the
                                             size: dims, top, lights scaled, the built object scaled about its origin
                                             (its `scale.multiplyScalar` when the host object has one: a three.js
                                             Object3D; a Godot host scales its node). s = 1 returns the adapter itself
     KFURN.adapterFor(adapter, room)      -> scaleAdapter(adapter, scaleOf(room.culture)), cached per adapter and s
   Clearance is NOT scaled: the walker radius and the door swings are the room's, so a scaled room is audited with the
   same margins. The pieces' anchors are unchanged (a wall piece's back stays on its wall: the scale is about the
   footprint centre on the floor, the catalog's origin, so the back moves in by d(1 - s)/2 and the placer, which reads
   the scaled dims, sets it back on the wall). */
(function(){
'use strict';
if(typeof KFURN === 'undefined') throw new Error('54-core-furnish-scale: load 50-core-furnish.js first');
KFURN.SCALE = { tungang: 0.94, glazier: 0.94, khaayken: 1.15 };
KFURN.scaleOf = function(roomCulture, pieceCulture){
  const T = KFURN.SCALE;
  if(roomCulture != null && T[roomCulture] != null) return T[roomCulture];
  if(pieceCulture != null && T[pieceCulture] != null) return T[pieceCulture];
  return 1;
};
KFURN.scaleRec = function(rec, A, roomCulture){
  const s = KFURN.scaleOf(roomCulture, A ? A.culture : null);
  if(s !== 1) rec.s = s;
  return rec;
};
function r4(v){ return Math.round(v * 1e4) / 1e4; }
KFURN.scaleAdapter = function(A, s){
  if(s == null || s === 1) return A;
  const out = Object.create(A);
  out.scale = s;
  out.dims = function(key, v){ const d = A.dims(key, v); return d ? { w: r4(d.w * s), d: r4(d.d * s), h: r4(d.h * s) } : d; };
  if(A.top) out.top = function(key, v){ const t = A.top(key, v); return t == null ? t : r4(t * s); };
  out.anchorY = function(key, v, at){
    /* floor and surface pieces stand where they stood; a ceiling piece keeps its top at the ceiling; a hung wall piece
       is lifted as if the room were the people's own size (eye height 1.6 s) */
    const y = A.anchorY(key, v, at), f = at && at.floorY != null ? at.floorY : 0;
    if(y === f || (at && y === at.surfaceY)) return y;
    if(at && at.ceilingY != null){ const h = A.dims(key, v).h; if(Math.abs(y - (at.ceilingY - h)) < 1e-6) return r4(at.ceilingY - h * s); }
    return r4(f + (y - f) * s);
  };
  if(A.lights) out.lights = function(key, v, o){
    return (A.lights(key, v, o) || []).map(function(l){
      return Object.assign({}, l, { lx: r4(l.lx * s), ly: r4(l.ly * s), lz: r4(l.lz * s), distance: l.distance == null ? l.distance : r4(l.distance * s) }); });
  };
  out.build = function(p, room){
    const g = A.build(p, room);
    /* about the placement point P, whatever frame the host built in (the catalog builds its group at the world origin with
       its children placed in world metres): position' = P + s (position - P), so every vertex goes to P + s (v - P) */
    if(g && g.scale && typeof g.scale.multiplyScalar === 'function'){
      g.scale.multiplyScalar(s);
      if(g.position){ const px = p.x == null ? 0 : p.x, py = p.y == null ? 0 : p.y, pz = p.z == null ? 0 : p.z;
        g.position.x = px + s * (g.position.x - px); g.position.y = py + s * (g.position.y - py); g.position.z = pz + s * (g.position.z - pz); }
      if(g.updateMatrixWorld) g.updateMatrixWorld(true);
    }
    if(g && g.userData && g.userData.interior) g.userData.interior.scale = s;
    return g;
  };
  return out;
};
const cache = typeof WeakMap === 'function' ? new WeakMap() : null;
KFURN.adapterFor = function(A, room){
  const s = KFURN.scaleOf(room ? room.culture : null, null);
  if(s === 1 || !cache) return KFURN.scaleAdapter(A, s);
  let m = cache.get(A); if(!m){ m = {}; cache.set(A, m); }
  return m[s] || (m[s] = KFURN.scaleAdapter(A, s));
};
if(typeof module !== 'undefined' && module.exports) module.exports = KFURN;
})();
