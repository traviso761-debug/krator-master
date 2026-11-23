// prefix: dv
// ================================================================= TAGS VOCABULARY REGISTRATION ([G data])
// Register culture 'dzagh-vardzi' ('Petty Gorge-Kingdoms of Dzagh-Vardzi') idempotently on KTAGS.VOCAB for this page so
// KTAGS.page.audit() validates every Dzagh-Vardzi building, prop, flora, life, and furniture record without touching shared core/tags/ files.
(function(){
 if(typeof KTAGS==='undefined'||!KTAGS.VOCAB)return;
 const V=KTAGS.VOCAB;
 if(V.cultures.indexOf('dzagh-vardzi')<0)V.cultures.push('dzagh-vardzi');
 if(!V.cultureNames['dzagh-vardzi'])V.cultureNames['dzagh-vardzi']='Petty Gorge-Kingdoms of Dzagh-Vardzi';
 if(V.catalog&&V.catalog.cultures&&V.catalog.cultures.indexOf('dzagh-vardzi')<0)V.catalog.cultures.push('dzagh-vardzi');
})();
