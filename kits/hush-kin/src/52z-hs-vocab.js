// ================================================================= CORE TAGS VOCAB REGISTRATION ([G data])
// Registers 'hush-kin' onto KTAGS.VOCAB right after 52-core-tags-vocab.js loads (without touching shared core files)
// so KTAGS.page.audit() verifies every placed Hush-Kin sanctuary building, quartz spire, monolith and furniture record with 0 problems.
(function(){
 if(typeof KTAGS==='undefined'||!KTAGS.VOCAB)return;
 const V=KTAGS.VOCAB;
 if(V.cultures.indexOf('hush-kin')<0)V.cultures.push('hush-kin');
 if(V.noCatalog.indexOf('hush-kin')<0)V.noCatalog.push('hush-kin');
 V.cultureNames['hush-kin']='Hush-Kin Sanctuary Folk';
})();
