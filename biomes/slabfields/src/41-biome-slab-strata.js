// ================================================================= THE SLABFIELDS — the flood basalt's beds (PLAN.md sections 6 and 14)  [G data]
// The Siphon Pits' flood basalt as KSTRATA draws it on a slab's cliff (core/terrain 35; KSTRATA.add, a recipe of this kit's own). Thick flows,
// each a colonnade of columns under a hackly entablature; a vesicular, oxidised flow top a metre or a few thick; between eruptions a red bole (the
// soil that formed on the flow top, baked by the next flow) and here and there a pale tuff from the maars. The Anvil tilted them 7 degrees south
// with its ramp (the stage's dip), so on the north cliff they read near level, stepping up the face as ledges. Plain data: no THREE, no DOM.
var SLAB_STRATA=KSTRATA.add({name:'slab-floodbasalt',main:'flow',kinds:{
 flow:{p:.58,th:[8,32],col:[0x3e3a36,0x47423c,0x36322e,0x4a443d],hard:.95,xbed:0,varnish:.25},
 top:{p:.2,th:[1,4],col:[0x5a3e34,0x66463a,0x4e382f],hard:.5,xbed:0,varnish:.3},
 bole:{p:.13,th:[.3,1.6],col:[0x8a3a26,0x9a4630,0x7a3222],hard:.2,xbed:0,varnish:.1,between:true},
 tuff:{p:.09,th:[.5,3],col:[0xa89a80,0xb4a88c,0x9c8e74],hard:.3,xbed:0,varnish:.05,between:true}},
 fx:{columns:1,varnish:.3}});
