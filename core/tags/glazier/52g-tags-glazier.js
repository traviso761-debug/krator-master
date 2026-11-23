// ================================================================= CORE TAGS — the Glaziers' culture id, opt-in ([G data])
// The Glaziers of Opal Valley (kits/tungang/PLAN.md section 1.4; the owner's answers, round 4: "the Glaziers' culture id is
// glazier"). A new culture is a vocabulary change, and core/tags reaches every page: so the id is added HERE, in a file only a
// build that lists it loads (kits/tungang, the Glaziers' set), and no other page changes. It folds into 52-core-tags-vocab.js
// with the next all-builds rebuild (TODO.md, "Ride along with the next all-builds rebuild"); then this file is deleted.
// Load after 52-core-tags-vocab.js. Idempotent: loading it twice adds the id once.
(function(){
 'use strict';
 var K = typeof KTAGS !== 'undefined' ? KTAGS : globalThis.KTAGS;
 if (!K || !K.VOCAB) throw new Error('core/tags/glazier: load 50-core-tags.js and 52-core-tags-vocab.js first');
 var V = K.VOCAB;
 if (V.cultures.indexOf('glazier') < 0) V.cultures.push('glazier');
 V.cultureNames.glazier = 'Glaziers';
 // no catalog culture file yet (kits/tungang/KNOWN_ISSUES.md): test-tags.js does not look for one
 if (V.noCatalog && V.noCatalog.indexOf('glazier') < 0) V.noCatalog.push('glazier');
})();
