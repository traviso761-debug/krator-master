// ================================================================= HOST — every record registered before anything is drawn
// core/tags (KTAGS): the page's registry is the layout's records (SHELF.tags: every deck, part, lift and wreck heap, with its culture, state
// and holder), made before the shell (8sa), the towns (8sb) and the wreck (8sc) are drawn; the inspector and the minimap read it as KTAGS.page.
const STAGS=(function(){const T=KTAGS.create({build:'shelf'});KTAGS.page=T;const recs=SHELF.tags(SHELF_LAYOUT,T);return {T,recs};})();