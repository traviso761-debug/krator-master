// ================================================================= THE NIGHT GLOW (PLAN.md section 2): a town lit from inside
// By day a Khaayken town is a set of pale hills; at night the ice lenses glow amber with the lamps behind them and the
// pycrete shells, thin at the crown, take a faint warm light. 91n-night.js (vendored) turns the night on; this wraps it,
// so the engine stays the Scyvoi kit's, and sets the kit's own lit materials: the ice and gut panes strongly, the pycrete a
// little (the lamps' light through a shell of cloudy ice).
const YT_NIGHT_GLOW={ice:[.08,1.8],gut:[.12,1.2],course:[0,.1],pycrete:[0,.07]};
const _ytNightSet0=nightSet;
nightSet=function(on){_ytNightSet0(on);
 for(const k in YT_NIGHT_GLOW){const m=MAT[k];if(!m)continue;if(!m.emissive||m.emissive.getHex()===0)m.emissive=new THREE.Color(0xffb468);m.emissiveIntensity=YT_NIGHT_GLOW[k][on?1:0];}};
