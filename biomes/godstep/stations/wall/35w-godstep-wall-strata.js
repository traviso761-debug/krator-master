// ================================================================= GODSTEP — the north wall's rock (KSTRATA.add)  [G data]
// PLAN.md section 2: the wall is a stack of the valley's ponded flows, its bead partings palagonite (below the dry-cold line, as everywhere
// here: src/35g's godstep-ponded) and, with ~1,000 mm of rain, LATERITE STILL FORMING: the flows' tops weathered red under the forest,
// living laterite in the cliffs (tibasalt-ponded's laterite kind). So the wall's recipe is godstep-ponded with a laterite rind laid between
// the flows beside the palagonite: the cliffs read black colonnades banded ochre and red. Data only.
(function(){const T=KSTRATA.recipe('godstep-ponded'),K={};for(const k in T.kinds)K[k]=Object.assign({},T.kinds[k]);
 const pal=K.palagonite;K.palagonite=Object.assign({},pal,{p:pal.p*.6});
 K.laterite=Object.assign({},K.laterite,{p:pal.p*.55,th:[1,5],between:true});K.flow=Object.assign({},K.flow,{p:K.flow.p-pal.p*.15});
 KSTRATA.add({name:'godstep-wall',main:T.main||'flow',kinds:K,fx:Object.assign({},T.fx)});})();
