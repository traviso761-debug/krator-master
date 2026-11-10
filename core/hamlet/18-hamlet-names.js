/* ==================== core/hamlet 18: dealing the hamlets' names (plain data, [G data]) ==================== */
/* The owner (2026-11-09): "hamlets will have names randomly generated at load-in/founding from a long list of potential
   names genned from the conlangs". The lists are 16-hamlet-names.js (KHAMLET.NAMES[culture], written by
   tools/names/<tongue>.py from lore/tongues-of-krator.html); a name is drawn by a hash of the world seed and the hamlet's
   id (core/rand: the same hamlet gets the same name on every page and in Godot, and a hamlet founded later draws its own
   without moving anyone else's), skipping names already taken, so no two hamlets of a world share one.
     KHAMLET.hamletName(culture, world, id, used)  -> {name, gloss} or null (no list for the culture); `used`: the names
                                                     taken so far (an object name -> true), updated with the draw
     KHAMLET.dealNames(culture, world, ids)        -> {id: {name, gloss}}: the ids in the order given, each its own draw */
KHAMLET.hamletName = function (culture, world, id, used) {
  var L = KHAMLET.NAMES && KHAMLET.NAMES[culture]; if (!L || !L.length) return null;
  var K = KRAND, h = K.hash(K.child(world >>> 0, 'hamlet-names'), KHAMLET.idHash(id)), n = L.length, start = h % n;
  for (var k = 0; k < n; k++) { var r = L[(start + k) % n]; if (used && used[r.name]) continue; if (used) used[r.name] = true; return { name: r.name, gloss: r.gloss }; }
  var r2 = L[start]; return { name: r2.name, gloss: r2.gloss };   /* every name taken: the list is too short for the world; a repeat */
};
KHAMLET.dealNames = function (culture, world, ids) {
  var used = {}, out = {};
  ids.forEach(function (id) { out[id] = KHAMLET.hamletName(culture, world, id, used); });
  return out;
};
