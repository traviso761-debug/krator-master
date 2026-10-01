// ---------- a second random source for everything added on top of the city: keyed by position or on its own sequence, so the seeded layout above never shifts ----------
const xr=mkRng(20260915),xrr=(a,b)=>a+(b-a)*xr(),xpick=a=>a[Math.floor(xr()*a.length)];
