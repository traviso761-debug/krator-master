// ================================================================= HOST — the atmosphere (core/atmos), bound; the wind and the caustic dust
// ATMOS.bindHost: core/atmos's one-time init on this page's frame ticks, ground and camera (core/water and the shared sky
// need it). The hour is the host clock's (the shared sky reads it too: 89s-host-sky.js). THE WIND is ATMOS's, its base
// the stage's prevailing wind (the dawn katabatics off the walls); the foliage sways with it. THE DUST (core/atmos
// 3d-dust): the black storms' alkali dust, lifted off bare dry ground where the wind passes the threshold: the dry lake
// beds' silt and crust most (it burns the eyes and the lungs: PLAN.md section 6a), the sand, the reg; nothing off the
// water or the oasis's wet ground.
ATMOS.PRESETS.wind.base=[WIND[0],WIND[1]];
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>groundAll(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:ATMOS.SKY.viewHour,seed:(STAGE.seed||1)+6100,err:reportErr,viewH:()=>innerHeight});
BIO.host.wind=()=>{const w=ATMOS.U.wind.value;return[w.x,w.y];};
const DUST_MASK=(x,z)=>{if(waterH(x,z)>-1e8)return 0;const F=n=>FC.at(FC.a[n],x,z),w=F('wet');
 return .5*smooth(.5,.25,w)*clamp(.35+.65*Math.max(F('silt'),F('crust'),F('soda')*.8,F('sand')*.6,F('reg')*.4),0,1);};
ATMOS.dust({color:[.82,.74,.6],mask:DUST_MASK});
