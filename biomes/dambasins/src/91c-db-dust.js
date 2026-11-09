// ================================================================ DAM BASINS — the wind and its dust (PLAN.md, D1)
// A drained lake bed is the dustiest ground there is (the Aral's salt-and-silt storms): the bed's dust (core/atmos
// 3d-dust) lifts wherever the wind there passes the threshold, all over the bed, a third as much off the land above the
// old line. The wind: core/atmos's, at three settings (n semiarid's): calm, a breeze, high; the bed's default is a
// stiff wind (dust in every gust). ?wind=calm|breeze|stiff|high, and g cycles them.
const DB_WIND=(function(){const SCALE={calm:.4,breeze:1,stiff:1.6,high:2.6},ORDER=['calm','breeze','stiff','high'];
 const q=new URLSearchParams(location.search).get('wind');let mode=SCALE[q]!=null?q:'stiff';ATMOS.windScale=SCALE[mode];
 // k: the setting's share of the wind, eased toward SCALE[mode]; it multiplies what the weather (91d, core/atmos 4-weather) writes to ATMOS.windScale every
 // tick (2026-11-03, n semiarid's fix: it set the scale outright, the weather's write undid it, and a calm blew as hard as the stiff wind)
 const W={SCALE,k:SCALE[mode],get mode(){return mode;},set(m){if(SCALE[m]!=null)mode=m;},cycle(){mode=ORDER[(ORDER.indexOf(mode)+1)%ORDER.length];}};
 W.apply=()=>{ATMOS.windScale=(ATMOS.W&&ATMOS.W.wind!=null?ATMOS.W.wind:1)*W.k;};   // idempotent: 91d hooks it again after the weather's own write
 ATMOS.hook((t,hr,dt)=>{W.k+=(SCALE[mode]-W.k)*Math.min(1,dt*.4);W.apply();});   // eases, as n semiarid's
 addEventListener('keydown',e=>{if(e.key.toLowerCase()==='g'){W.cycle();const c=document.getElementById('cap');if(c)c.dataset.wind=mode;}});
 return W;})();
const DB_DUST_MASK=(x,z)=>terrainH(x,z)>.5?.33:1;
/* a wet station's bed is forest, not silt (2026-11-08: the east bed in Korona's Af and Aw, DB_SITE.dust false): no dust off it */
if(DB_SITE_DEF.dust!==false)ATMOS.dust({color:[.76,.71,.62],mask:DB_DUST_MASK});
