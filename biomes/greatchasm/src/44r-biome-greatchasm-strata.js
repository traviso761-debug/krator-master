// ================================================================= THE GREAT CHASM — the walls' rock (KSTRATA recipes)  [G data]
// PLAN.md section 2 (proposed, Gemini's): the walls are a layer cake of flood basalt, flow on flow, each tens of metres thick; a flow cools
// into a lower COLONNADE (thick pale columns, grey-brown) under an ENTABLATURE (thin, hackly, near black), topped by a red-brown vesicular
// FLOW TOP; a red BOLE (a fossil soil) parts one eruption from the next. The chaos's mesas carry OCHRE CAPS (the code's paint, l. 4844 of
// build_425_master.py): weathered tuff and palagonite over the basalt. KSTRATA has no flood-basalt recipe (outland-basalt is a red flow
// set, rift-volcanic an ash-parted one), so the kit adds its two through the core's own KSTRATA.add: data, no drawing. Colours sRGB hex; th
// metres; hard 0 (clay) .. 1 (quartzite); varnish the desert varnish's share (the shader's).
(function(){if(typeof KSTRATA==='undefined')return;
 KSTRATA.add({name:'chasm-trap',main:'entab',kinds:{
  colon:{p:.3,th:[8,30],col:[0x6e6a62,0x7a746a,0x645f58,0x847c70],hard:.95,xbed:0,varnish:.6},
  entab:{p:.36,th:[6,40],col:[0x2c2a29,0x353230,0x242322,0x3a3633],hard:.9,xbed:0,varnish:.4},
  ftop:{p:.2,th:[1,5],col:[0x5a3a2c,0x6a4232,0x4e3428],hard:.45,xbed:0,varnish:.3},
  bole:{p:.14,th:[.4,3],col:[0x8a3a24,0x9a4428,0x7a3220],hard:.2,xbed:0,varnish:.1,between:true}},
  fx:{varnish:.5}});
 KSTRATA.add({name:'chasm-cap',main:'tuff',kinds:{
  tuff:{p:.5,th:[2,12],col:[0xb08a4a,0xc09a56,0xa47e40,0xbe9450],hard:.35,xbed:.2,varnish:.5},
  palag:{p:.3,th:[1,6],col:[0x9a7a3a,0x8e6e34,0xa88440],hard:.3,xbed:0,varnish:.4},
  ash:{p:.2,th:[.3,2],col:[0xd8c49a,0xe2d0a8,0xccb88e],hard:.15,xbed:0,varnish:0,between:true}},
  fx:{varnish:.5}});
 /* the floor's dark ground (komatiite and obsidian, the code's paint): a thin glassy flow set, for the Deep's low scarps and hollows */
 KSTRATA.add({name:'chasm-floor',main:'kom',kinds:{
  kom:{p:.55,th:[1,8],col:[0x2a2c26,0x323428,0x26281f,0x3a3a30],hard:.85,xbed:0,varnish:.7},
  glass:{p:.2,th:[.2,1.2],col:[0x141416,0x1c1a1e,0x101012],hard:.9,xbed:0,varnish:0},
  salt:{p:.25,th:[.1,.8],col:[0xd8d0c0,0xe2dccc,0xccc2b0],hard:.1,xbed:0,varnish:0,between:true}},
  fx:{varnish:.4}});
})();
// the stack every station draws its walls from (a station passes its own range, and the cap where its mesas stand): the flood basalt from
// below the Deep to the crests, its beds dipping a little away from the trench's axis (the back-tilted blocks of the failed rift)
var GCH_STRATA=function(o){o=o||{};const f=[{recipe:'chasm-floor',base:-1600,top:-900},{recipe:'chasm-trap',base:-900,top:o.capBase==null?13000:o.capBase}];
 if(o.capBase!=null)f.push({recipe:'chasm-cap',base:o.capBase,top:o.capTop==null?o.capBase+400:o.capTop},{recipe:'chasm-trap',base:o.capTop==null?o.capBase+400:o.capTop,top:13000});
 return BIO.strata({formations:f,range:[-1600,13000],seed:o.seed==null?9420:o.seed,dip:o.dip||[.94,-.34,.03],warp:[6,1.6],private:true});};
