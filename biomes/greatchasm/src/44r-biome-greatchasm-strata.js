// ================================================================= THE GREAT CHASM — the walls' rock (KSTRATA recipes)  [G data]
// PLAN.md section 2 (proposed, Gemini's): the walls are a layer cake of flood basalt, flow on flow, each tens of metres thick; a flow cools
// into a lower COLONNADE (thick pale columns, grey-brown) under an ENTABLATURE (thin, hackly, near black), topped by a red-brown vesicular
// FLOW TOP; a red BOLE (a fossil soil) parts one eruption from the next. The chaos's mesas carry OCHRE CAPS (the code's paint, l. 4844 of
// build_425_master.py): weathered tuff and palagonite over the basalt. KSTRATA has no flood-basalt recipe (outland-basalt is a red flow
// set, rift-volcanic an ash-parted one), so the chasm has three recipes of its own, core's (core/terrain/35-core-strata.js): chasm-trap (the
// flood basalt), chasm-cap (the ochre caps) and chasm-floor (the floor's komatiite and obsidian, for the Deep's low scarps and hollows).
// the stack every station draws its walls from (a station passes its own range, and the cap where its mesas stand): the flood basalt from
// below the Deep to the crests, its beds dipping a little away from the trench's axis (the back-tilted blocks of the failed rift)
var GCH_STRATA=function(o){o=o||{};const f=[{recipe:'chasm-floor',base:-1600,top:-900},{recipe:'chasm-trap',base:-900,top:o.capBase==null?13000:o.capBase}];
 if(o.capBase!=null)f.push({recipe:'chasm-cap',base:o.capBase,top:o.capTop==null?o.capBase+400:o.capTop},{recipe:'chasm-trap',base:o.capTop==null?o.capBase+400:o.capTop,top:13000});
 return BIO.strata({formations:f,range:[-1600,13000],seed:o.seed==null?9420:o.seed,dip:o.dip||[.94,-.34,.03],warp:[6,1.6],private:true});};
