// TARGET: sheet — the damaged and ruined forts watched by core/ruins (settlements/strongwall/PLAN.md section 5.6; the owner,
// 2026-11-10: every ruined structure is watched). After the sheet's bake (90-vsheet-scene.js: SITE_GROUPS), each fort site in
// a damaged or ruined state (o.v 1, 2 of a def with `xfort`) is watched as the scene within its lot; the verify harness then
// asserts nothing floats and every fallen piece lies on its lowest points. Its rubble heaps are decoration (userData.decor).
if(typeof KRUINS!=='undefined')for(const SG of SITE_GROUPS){const S=SG.S,D=VERN.defs[S.key];if(!D||!D.xfort||!((S.o&&S.o.v)|0))continue;
 const hw=D.w/2,hd=D.d/2;KRUINS.watch(scene,{name:D.name+' — '+XF_STATES[S.o.v],inside:(x,z)=>Math.abs(x-S.x)<hw&&Math.abs(z-S.z)<hd,ground:()=>0});}
