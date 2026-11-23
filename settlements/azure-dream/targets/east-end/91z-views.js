// TARGET: east-end — camera presets [camX,camY,camZ, targetX,targetY,targetZ], and the page's budgets
const VIEWS=AD_V.v&&AD_V.v.records?adVillageViews(AD_V):{'Overview':[300,120,300,0,0,0]};
BUDGET.showcase={tris:16000000,calls:2400};BUDGET.cls.city=16000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';