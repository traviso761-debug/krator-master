// prefix: mc
// ================================================================= TAGS VOCABULARY REGISTRATION ([G data])
// Idempotently registers culture 'molu-che' ('Molu-Che Fossorial Clans of Moleshelf') on KTAGS.VOCAB so KTAGS.page.audit()
// validates every Dikengyuan and Bonduwe building and furniture record cleanly without touching core/tags/.
const mcVocabReady=1;
(function(){
 if(typeof KTAGS==='undefined'||!KTAGS.VOCAB)return;
 const V=KTAGS.VOCAB;
 if(V.cultures.indexOf('molu-che')<0)V.cultures.push('molu-che');
 if(!V.cultureNames['molu-che'])V.cultureNames['molu-che']='Molu-Che Fossorial Clans of Moleshelf';
 if(V.catalog&&V.catalog.cultures&&V.catalog.cultures.indexOf('molu-che')<0)V.catalog.cultures.push('molu-che');
})();
