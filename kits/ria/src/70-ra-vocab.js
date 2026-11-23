// prefix: ra
// ================================================================= TAGS VOCABULARY REGISTRATION ([G data])
// Idempotently registers culture 'ria' ('Ria Dynasty') on KTAGS.VOCAB so KTAGS.page.audit() validates every Lower Ria
// and Upper Ria building and furniture record cleanly without modifying shared core/tags/ files.
const raVocabReady=1;
(function(){
 if(typeof KTAGS==='undefined'||!KTAGS.VOCAB)return;
 const V=KTAGS.VOCAB;
 if(V.cultures.indexOf('ria')<0)V.cultures.push('ria');
 if(!V.cultureNames.ria)V.cultureNames.ria='Ria Dynasty';
 if(V.catalog&&V.catalog.cultures&&V.catalog.cultures.indexOf('ria')<0)V.catalog.cultures.push('ria');
})();
