// ================================================================= GODSTEP — the pit's upper wall: red oxidised scoria (KSTRATA.add)  [G data]
// PLAN.md section 4, "The vent pit": the pit crater's walls are stacked tibasalt (src/35g's godstep-thin: the bead partings already palagonite) with
// RED OXIDISED SCORIA on the upper wall, the vent's last spatter and cinder, oxidised when it was fresh and hot. A recipe of its own: core's
// outland-basalt's scoria and bole kinds on a thin dark flow, the scoria the main kind. Data only.
(function(){const T=KSTRATA.recipe('tibasalt'),K={};
 K.scoria={p:.5,th:[1,6],col:[0x7a3326,0x8a3d2a,0x6a2c22,0x93452e],hard:.35,xbed:0,varnish:0};
 K.flow=Object.assign({},T.kinds.flow,{p:.3,th:[1,6]});
 K.bole={p:.2,th:[.2,1.2],col:[0xa0402a,0xae4a30,0x963c28],hard:.2,xbed:0,varnish:0,between:true};
 KSTRATA.add({name:'godstep-scoria',main:'scoria',kinds:K,fx:{}});})();
