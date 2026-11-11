/* ==================== core/region 00: the region host's frame (KREGION) [G data] ==================== */
/* core/simulation/PROPOSAL-LONGSONG-PINNACLE.md phase S0 (the owner, 2026-11-11: "make sure S0-S3 are implemented"). The
   region host turns a census, its towns' plans and their villages into economies on core/simulation: places, roles,
   households, producers and carts, the hamlet wiring, the herders, building, crime, founding, money, unrest, refugees,
   the week's checks and the governor's rules. It was the isle demo's page code (settlements/isle-demo/src 40-49, under
   ISLE.*); each fragment here is that code, lifted whole, run on a host object H:

     KREGION.use(H)            the page's host (the isle demo's ISLE; Longsong's LSR): every part loaded after this runs
                               on it at once, where the page's own code ran it before
     KREGION.part(name, fn)    a part of the host (each core/region fragment is one): fn(H) puts its functions on H
     KREGION.install(H)        every part again on another host (a second economy in the same page or test)
     KREGION.parts()           the parts' names, in load order

   A host carries its culture as data: H.TUNE.sim (the isle demo's settlements/isle-demo/src/15-isle-tune.js; Longsong's
   settlements/longsong/src/15-ls-tune.js) and H.TUNE.sim.culture (the row, the faction, the kit's keys: 40, 47h, 47c, 47f,
   47m, 47n read it, the isle's own values when it is absent). No THREE, no DOM: the parts run in node (the isle demo's
   tests run its plan.js). */
var KREGION = (function () {
  var parts = [], host = null;
  return {
    use: function (H) { host = H; return H; },
    host: function () { return host; },
    part: function (name, fn) { parts.push({ name: name, fn: fn }); if (host) fn(host); },
    install: function (H) { parts.forEach(function (p) { p.fn(H); }); return H; },
    parts: function () { return parts.map(function (p) { return p.name; }); }
  };
})();
