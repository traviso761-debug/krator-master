// ================================================================= HOST — the hold (station 1: the Stilled Ground)
// [web] PLAN.md section 17. The stage (46z) made the hold, one core/anomaly time record over the basin's centre, and read elapsed off it for the
// plan, the fields and the forest. Here, once core/tags is loaded (50-53: BIO.tagReg makes the build's registry from it) and before the kits draw (88), the record goes into it with its `time` hazard (KANOM.register),
// before anything of the kits is drawn (PLAN-ANOMALIES.md 2: records first). The walk, the time owed and the held moment are S2 and S3.
/* BIO.host.tags is the build's name until the core makes the registry at first use; BIO.tagReg() makes it and hands it over */
STAGE.holdTags=null;
{const T=typeof BIO.tagReg==='function'?BIO.tagReg():null;
 if(typeof KANOM!=='undefined'&&T&&typeof T.add==='function'){try{STAGE.holdTags=KANOM.register(T);}catch(e){reportErr('the hold: '+(e.message||e));}}
 else reportErr('the hold: no core/anomaly or no core/tags registry on this page');}
