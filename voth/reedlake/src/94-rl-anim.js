// ---------------------------------------------------------------- animation: the lake's ripples drift (the water map scrolls slowly)
FRAME_HOOKS.push((dt,now)=>{TEX.rlWater.offset.x=(now*.000012)%1;TEX.rlWater.offset.y=(now*.000007)%1;});
window._water=1;
