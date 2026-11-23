// ================================================================= GODSTEP — its strata recipes beyond core's (KSTRATA.add)  [G data]
// The whole valley is below the Godthrone's 8,500 m dry-cold line (PLAN.md section 2, "Weathering by the climate"), so every bead
// parting in its flows IS palagonite: ochre, soft, recessed. Core's tibasalt-ponded and tibasalt reach that by an alteration below
// the line; a stack of a front's flows as formations (45b: one a flow, after the stair's flowTops) would carry one alteration a
// formation, and KSTRATA.shade takes at most four. So the valley's own recipes are core's with the alteration already done: the bead
// kind replaced by palagonite (its share, its thickness, between the flows), no alter list. Data only.
(function(){const mk=(name,from)=>{const T=KSTRATA.recipe(from),K={};for(const k in T.kinds)K[k]=Object.assign({},T.kinds[k]);
  K.palagonite=Object.assign({},K.palagonite,{p:K.bead.p+(K.beadblack?K.beadblack.p:0),th:K.bead.th,between:true});delete K.bead;delete K.beadblack;
  KSTRATA.add({name,main:T.main||'flow',kinds:K,fx:Object.assign({},T.fx)});};
 mk('godstep-ponded','tibasalt-ponded');mk('godstep-thin','tibasalt');})();
