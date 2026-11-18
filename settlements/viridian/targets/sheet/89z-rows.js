// TARGET: sheet — the Order of Viridian Thought's own buildings (src/89qv, 89qw; PLAN.md section 7, step V3) in rows by
// family, front (+z) toward the camera, every variant; and beside them the green monastery as Qiblai draws it (qb_monastery
// at spoke 3, with its tea touches), so the head house's records are judged against the city house of the same Order.
// Built on Xanadu's page (build.py), so every xa_* and qb_* def is registered too; the rows are the Order's only.
const TITLE='Viridian Thought - the head house records';
const XA_VARIANTS=true;   // every def at every variant, v0 first
XA.families=()=>QB.families().filter(F=>/^Viridian Thought/.test(F.family));
const XA_EXTRA=[{key:'qb_monastery',x:0,ry:0,o:{v:3},depth:56,family:'The green monastery in Qiblai (spoke 3)'}];
const SITES=[];
