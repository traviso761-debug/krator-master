// ================================================================= HOST — STATION gills: Alph's breath (Ālph-bi Bhlo), the fountain forced by the out-breath
// Canon (the owner, 2026-11-02; biomes/gills/PLAN.md section 5): the breath is what makes Alph's fountain burst, "momently forced" once a day at the hour of
// the giant's nod. The Vale's fountain (src/89x) bursts every few seconds all day; here the same WATER.geyser (style 'fountain', core/water/geyser) bursts
// only through the out-breath: its drops are drawn while GILLS.breath is over .03, their size and the column's light scaled by it, so it rises with the Bhlo,
// stands through its three hours and sinks away into the pool with the Suq. The cycle within a burst stays the geyser's own (a pure function of the clock).
const FOUNTAIN_W=WATER.geyser({key:'xanadu-gills-fountain',name:'Alph\'s breath (Ālph-bi Bhlo)',vents:[[STATION_GILLS.HEAD[0],STATION_GILLS.HEAD[1]]],top:STATION_GILLS.POOLY,H:90,style:'fountain',spread:.24,
 period:4.8,pre:.6,dur:3,steam:.4,off:0,pool:4,world:23});
const FOUNTAIN_U={uScale:{value:900}};
const FOUNTAIN=WATER.drawGeyser(FOUNTAIN_W,{THREE,scene,uniforms:FOUNTAIN_U,fog:scene.fog,wind:[.6,.6],gravity:7.4,mats:new Map()}).points;   /* 0.75 g */
FOUNTAIN.userData.inspectLabel='Alph\'s breath (Ālph-bi Bhlo): the river forced up on the out-breath';
const gillsClockT=()=>{const c=typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash),d0=m?+decodeURIComponent(m[1])||0:0;
 return c?d0+(c.day||0)+c.hour/24:d0+ATMOS.SKY.viewHour/24;};
TICKS.push(()=>{const b=GILLS.breath(gillsClockT());FOUNTAIN.visible=b>.03;FOUNTAIN_U.uScale.value=innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360))*Math.max(.05,b);});
