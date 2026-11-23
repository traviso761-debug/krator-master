// prefix: ds
// ================================================================= DASRI TAGS: opt-in culture id ([G data])
// Registers the culture id `dasri` ("Dasri") on KTAGS.VOCAB inside this kit's page and bundle without touching
// core/tags/52-core-tags-vocab.js (leaving all other committed pages' hashes untouched until the next ride-along rebuild).
(function(){
 'use strict';
 var K=typeof KTAGS!=='undefined'?KTAGS:globalThis.KTAGS;
 if(!K||!K.VOCAB)return;
 var V=K.VOCAB;
 if(V.cultures.indexOf('dasri')<0)V.cultures.push('dasri');
 V.cultureNames.dasri='Dasri';
 if(V.noCatalog&&V.noCatalog.indexOf('dasri')<0)V.noCatalog.push('dasri');
})();
