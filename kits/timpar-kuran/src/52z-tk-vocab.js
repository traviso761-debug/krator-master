// ================================================================= CORE TAGS VOCAB REGISTRATION ([G data])
// Registers 'timpar-kuran' onto KTAGS.VOCAB right after 52-core-tags-vocab.js loads (without touching shared core files)
// so KTAGS.page.audit() verifies every placed Timpar-Kuran building, totem, shrine and furniture record with 0 problems.
(function(){
 if(typeof KTAGS==='undefined'||!KTAGS.VOCAB)return;
 const V=KTAGS.VOCAB;
 if(V.cultures.indexOf('timpar-kuran')<0)V.cultures.push('timpar-kuran');
 if(V.noCatalog.indexOf('timpar-kuran')<0)V.noCatalog.push('timpar-kuran');
 V.cultureNames['timpar-kuran']='Timpar-Kuran Timber Clans';
})();
