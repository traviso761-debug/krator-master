// ================================================================= HOST — every record registered before anything is drawn
// core/tags (KTAGS): the page's registry is the layout's records (LEDGE.tags: every deck, part, lift and wreck heap, with its
// culture, state and holder), made before the shell (8la), the towns (8lb) and the ruin (8lc) are drawn; the inspector and the
// minimap read it as KTAGS.page.
const LTAGS=(function(){const T=KTAGS.create({build:'ledge'});KTAGS.page=T;const recs=LEDGE.tags(LEDGE_LAYOUT,T);return {T,recs};})();
