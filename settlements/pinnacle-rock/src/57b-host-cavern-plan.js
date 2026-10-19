// ================================================================= HOST — the Deep Root cavern's plan (P3d), made before the kits build
// PRD (57-pr-cavern.js) on this page's cap (KSTACKS.topAt on the mesa), with KCAVERN (core/terrain/39-core-cavern.js), the
// kit's rock-cut sizes (CAT.dims) and the tribes in the lore's order (BR_CAMP_TRIBES); the processional joins the town's
// avenue of that name where it ends. Its way is PR's (cleared). Every record is in core/tags before 89f draws it.
const CAVERN=(function(){try{const t0=performance.now(),TOP=MESA_B.top;
 const ground=(x,z)=>{const t=KSTACKS.topAt([MESA_B],x,z);return t>-1e8?t:TOP;};
 const av=TOWN&&TOWN.avenues?TOWN.avenues.find(a=>/processional/.test(a.name)):null,wayEnd=av?av.pts[av.pts.length-1]:null;
 const D=PRD.plan({PR,KC:KCAVERN,ground,top:TOP,dims:(k,v)=>CAT.dims(k,v),tribes:CAT.TRIBES,wayEnd,tags:BIO.tagReg(),seed:null});
 if(D.way)PR.addWay(D.way);D.ms=Math.round(performance.now()-t0);return D;}
 catch(e){reportErr('cavern plan: '+(e&&e.stack||e));return null;}})();
_mark('cavernplan');
