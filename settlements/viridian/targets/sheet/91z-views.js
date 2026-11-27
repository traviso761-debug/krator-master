// TARGET: sheet — preset views (generated per row and per building by xaAutoViews; the first entry is the opening shot)
const VIEWS=xaAutoViews();
BUDGET.showcase={tris:3000000,calls:600};   /* fifteen records at every variant and one great monastery */
// the plan's budgets (PLAN.md section 7): the large ones medium, the rest small, the monastery as Qiblai's sheet has it
const VT_LARGE=['qb_vt_wither','qb_vt_roll_fire','qb_vt_physic','qb_vt_still','qb_vt_pack','qb_monastery'];
for(const k of QB.keys())if(/^qb_vt_|^qb_monastery$/.test(k))BUDGET.type[k]=VT_LARGE.indexOf(k)>=0?'medium':'small';
