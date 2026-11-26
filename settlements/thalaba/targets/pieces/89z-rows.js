// TARGET: pieces — Thalaba's own pieces (src/89t1-tb-pieces.js: the Rare Devisers' house, the calcarone) and the Dalab
// mission's (the Dalab set's healers' hall, granaries and family compound, read in place from settlements/dalab/src), in rows,
// every variant, front (+z) toward the camera. The page is Xanadu's, so xaLayout (settlements/xanadu/src/90-scene.js) lays
// out XA.families(): this target points it at the two rows.
const TITLE='Thalaba — the Town\'s Own Pieces';
const XA_VARIANTS=true;
XA.families=()=>[{family:'Thalaba',keys:['tb_devisers','tb_calcarone']},{family:'The Dalab mission (the Dalab set)',keys:['dalab_healers','dalab_granaries','dalab_compound']}].filter(F=>F.keys.every(k=>VERN.defs[k]));
const XA_EXTRA=[];
const SITES=[];
