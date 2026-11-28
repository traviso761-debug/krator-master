// ================================================================= HOST — core/atmos binding ([web])
ATMOS.bindHost({
 THREE:THREE,
 scene:scene,
 camera:camera,
 renderer:renderer,
 ticks:TICKS,
 ground:(x,z)=>DRAWN_H(x,z),
 hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:10.6,
 seed:SITE.seed,
 viewH:()=>window.innerHeight
});
