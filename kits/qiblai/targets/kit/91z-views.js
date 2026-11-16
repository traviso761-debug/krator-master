// TARGET: kit — preset views (generated per row and per building by xaAutoViews; the first entry is the opening shot)
const VIEWS=xaAutoViews();
BUDGET.showcase={tris:9000000,calls:900};   // every variant of everything, three mixed streets of whole houses
// the plan's budgets (PLAN.md section 5): 60k triangles for an ordinary building, 250k for the largest (QB_LARGE); a mixed
// street holds a dozen whole houses, so its budget is a quarter's
const QB_LARGE=['qb_court_house','qb_monastery','qb_monastery_half','qb_gate_market_half','qb_temple','qb_hall_decree','qb_great_wheel','qb_treasury','qb_caravanserai','qb_gate_market','qb_ghats','qb_wall_gate'];
for(const k of QB.keys())BUDGET.type[k]=/^qb_street_|^qb_temple_mountain$/.test(k)?'mega':QB_LARGE.indexOf(k)>=0?'medium':'small';
