// ================================================================= CORE FURNISH — the page's switches ([web])
// The one browser read in core/furnish: the query string. ?furniture=0 places nothing (the records are still
// kept); the interiors are ?interiors=1 to turn on (most builds: roofs hide them) or ?interiors=0 to turn off
// (Girder, whose interiors are on by default).
//
//   KFURN.flags(interiorsByDefault)   -> { on, interiorsOn }: pass it straight into KFURN.create
(function(){
'use strict';
if(typeof KFURN === 'undefined') throw new Error('53-core-furnish-host: load 50-core-furnish.js first');
KFURN.flags = function(interiorsByDefault){
  const q = location.search;
  return { on: !/[?&]furniture=0\b/.test(q),
    interiorsOn: interiorsByDefault ? !/[?&]interiors=0\b/.test(q) : /[?&]interiors=1\b/.test(q) };
};
})();
