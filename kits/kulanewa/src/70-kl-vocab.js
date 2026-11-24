// prefix: kl
// ================================================================= TAGS VOCABULARY REGISTRATION ([G data])
// Idempotently registers culture 'kulanewa' ('The Kulanewa Free-Towns') on KTAGS.VOCAB so KTAGS.page.audit() validates every
// Karum Ledger-Syndicate and Kula-Na Ikki Covenant-Commune building and furniture record cleanly without touching core/tags/.
const klVocabReady=1;
(function(){
 if(typeof KTAGS==='undefined'||!KTAGS.VOCAB)return;
 const V=KTAGS.VOCAB;
 if(V.cultures.indexOf('kulanewa')<0)V.cultures.push('kulanewa');
 if(!V.cultureNames.kulanewa)V.cultureNames.kulanewa='The Kulanewa Free-Towns';
 if(V.catalog&&V.catalog.cultures&&V.catalog.cultures.indexOf('kulanewa')<0)V.catalog.cultures.push('kulanewa');
})();
