// ---------------------------------------------------------------- animation: the troughs' and wallows' water map drifts
// The lake is core/water's (90w-rl-lake.js) and runs on core/atmos's clock, which FRAME_HOOKS drives. MAT.rlWater is left on
// the small still waters inside the islands (hRLWaterB: troughs, the wallow; core/water's still kind, Phase 4); its map
// scrolls whole tiles per wave period on the same clock, so it wraps without a jump.
FRAME_HOOKS.push(()=>{if(typeof ATMOS==='undefined'||!ATMOS.U||!ATMOS.U.waveTime)return;const wt=ATMOS.U.waveTime.value,per=WATER.period();
 TEX.rlWater.offset.set(WATER.fr(wt*7/per),WATER.fr(wt*4/per));});
window._water=1;
