// TARGET: kit — the Qiblai kit sheet (kits/qiblai/PLAN.md): Qiblai's buildings in rows by family, front (+z) toward the
// camera, every variant, and the mixed streets (89q9-qb-street.js), where they stand between Xanadu houses at every tier.
// Built on Xanadu's page (kits/qiblai/build.py), so every xa_* def is registered too; the sheet's rows are Qiblai's only:
// xaLayout (settlements/xanadu/src/90-scene.js) lays out XA.families(), so this target points that at QB.families().
const TITLE='Qiblai Building Kit';
const XA_VARIANTS=true;   // every def at every variant, v0 first
XA.families=()=>QB.families();
const XA_EXTRA=[];
const SITES=[];
