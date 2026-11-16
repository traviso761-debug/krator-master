// TARGET engines: the twenty engines watched by core/ruins (the owner, 2026-11-10: "do a quality pass on the new ancient engines focusing on
// disconnected geometry and making sure detached pieces lie on the ground properly", then "make this check part of the default creation process
// for ruined structures"). Each engine is watched over its own reach on the sheet's flat plain (y 0); the shared verify harness asserts every
// watched structure (no piece touching nothing, every wreck on its lowest points within 0.3 m above to 1 m below the ground) and the module's
// self-test as the negative. Decoration (the kit's moss, vines, stains, rubble, trees, figures) is the kit's own and is left out by KRUINS.
const EN3={KEYS:['coil','procession','mortar','vigil','receiver','loom','iris','hive','star','abacus'],
 R:{coil:175,procession:470,mortar:280,vigil:160,receiver:450,loom:280,iris:140,hive:190,star:200,abacus:440}};
/* and the first ten (8ah, 8ai), over their sheet rows' reach (ROWS r: the greening's radius; the Harrow's fallen wheel lies past it) */
EN3.R.harrow=470;
EN3.FIRST=['harrow','strider','breech','gyre','press','sleeper','carapace','retorts','needle','ram'];
EN3.KEYS.concat(EN3.FIRST).forEach(k=>{const S=EN_SITE[k]||(ROWS[k]&&{x:ROWS[k].s,z:ROWS[k].z});if(!S)return;const r=EN3.R[k]==null?ROWS[k].r:EN3.R[k];KRUINS.watch(scene,{name:'the engine '+k,inside:(x,z)=>Math.hypot(x-S.x,z-S.z)<r,ground:()=>0});});
