// ================================================================ DAM BASINS — the wind and its dust (PLAN.md, D1)
// A drained lake bed is the dustiest ground there is (the Aral's salt-and-silt storms): the bed's dust (core/atmos
// 3d-dust) lifts wherever the wind there passes the threshold, all over the bed, a third as much off the land above the
// old line. The wind: core/atmos's, at three settings (n semiarid's): calm, a breeze, high; the bed's default is a
// stiff wind (dust in every gust). ?wind=calm|breeze|stiff|high, and g cycles them.
const DB_WIND=(function(){const SCALE={calm:.4,breeze:1,stiff:1.6,high:2.6},ORDER=['calm','breeze','stiff','high'];
 const q=new URLSearchParams(location.search).get('wind');let mode=SCALE[q]!=null?q:'stiff';ATMOS.windScale=SCALE[mode];
 const W={SCALE,get mode(){return mode;},set(m){if(SCALE[m]!=null)mode=m;},cycle(){mode=ORDER[(ORDER.indexOf(mode)+1)%ORDER.length];}};
 ATMOS.hook((t,hr,dt)=>{ATMOS.windScale+=(SCALE[mode]-ATMOS.windScale)*Math.min(1,dt*.4);});   // eases, as n semiarid's
 addEventListener('keydown',e=>{if(e.key.toLowerCase()==='g'){W.cycle();const c=document.getElementById('cap');if(c)c.dataset.wind=mode;}});
 return W;})();
const DB_DUST_MASK=(x,z)=>terrainH(x,z)>.5?.33:1;
ATMOS.dust({color:[.76,.71,.62],mask:DB_DUST_MASK});
