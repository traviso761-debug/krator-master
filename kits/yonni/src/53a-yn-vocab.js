// prefix: yn
// ================================================================= TAGS VOCABULARY REGISTRATION ([G data])
// Register culture 'yonni' ('Yonni Spear-Queens') idempotently on KTAGS.VOCAB for this page so KTAGS.page.audit()
// validates every Yonni building, prop, flora, life, and furniture record without touching shared core/tags/ files.
(function(){
 if(typeof KTAGS==='undefined'||!KTAGS.VOCAB)return;
 const V=KTAGS.VOCAB;
 if(V.cultures.indexOf('yonni')<0)V.cultures.push('yonni');
 if(!V.cultureNames.yonni)V.cultureNames.yonni='Yonni Spear-Queens';
 if(V.catalog&&V.catalog.cultures&&V.catalog.cultures.indexOf('yonni')<0)V.catalog.cultures.push('yonni');
})();
