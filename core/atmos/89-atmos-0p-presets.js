// ================================================================= ATMOS — presets: every effect's tunable numbers, as plain data
// The particle shaders read these (as uniforms) instead of carrying literals, and ATMOS.export() writes them out, so a
// game engine builds the same effects from the same numbers (core/atmos/GODOT.md). A host may change a value before it
// places the effect. Plain data only: numbers, arrays, strings.
// Colours are [r,g,b] 0..1 in DISPLAY (sRGB) space: the three.js shaders write them straight out; an engine that lights in
// linear space converts them (Godot: a `source_color` uniform, or Color.srgb_to_linear()).
// Sizes are metres (a particle's diameter); px clamps are on-screen pixels; rates are 1/lifetime in seconds.
ATMOS.PRESETS={
 // smoke kinds share one cloud; an emitter names its kind ([x,y,z,'chimney'] or the index 0/1/2)
 smoke:{
  chimney:{index:0,n:12,rate:.11,rise:16,drift:9,wobble:1.2,size:[1.2,5.5],alpha:.35,rainDamp:.5,color:[.46,.44,.42]},
  steam:  {index:1,n:14,rate:.3, rise:9, drift:4,wobble:1.2,size:[.8,3.2], alpha:.32,rainDamp:0, color:[.92,.94,.96]},
  spray:  {index:2,n:16,rate:.45,rise:3.5,drift:1.5,wobble:1.2,size:[.8,3.2],alpha:.32,rainDamp:0,color:[.92,.94,.96]},
  pxMax:256,fadeIn:.12,distFade:.0018,blend:'normal'},
 fireflies:{n:6,spread:5,size:.35,pxMax:24,distFade:.004,color:[.75,1,.35],blend:'add'},
 moths:{n:8,p:.6,max:800,size:.2,pxMax:10,alpha:1,fadeNear:25,fadeFar:70,windHide:[1.6,3.2],color:[1,.87,.6],blend:'add'},
 mist:{n:420,size:[26,60],alpha:.12,distFade:.0012,nearFade:[4,30],night:[.1,.11,.19],day:[.86,.88,.92],pxMax:220,blend:'normal'},
 fogbank:{size:[30,70],alpha:.16,distFade:.0009,nearFade:[3,25],sway:14,night:[.14,.15,.2],day:[.86,.87,.9],pxMax:220,blend:'normal'},
 glow:{pxMin:2,pxMax:240,distFade:.0022,fogFade:.004,fogSwell:.7,rainSwell:.4,gain:1.7,dayFloor:.15,blend:'add'},
 rain:{drops:7000,box:240,fall:60,streak:2.4,slant:.25,windRide:6,fade:[50,120],alpha:.42,color:[.72,.77,.86]},
 // the wind every effect shares: a base vector that veers slowly, scaled by the weather, with gust fronts travelling
 // downwind (atmGust in the shaders, ATMOS.gust in JS)
 wind:{base:[.8,.35],gustAmp:.55,frontSpeed:12,veer:[.22,.021,.1,.057],gust:[[.5,.31,0],[.3,.73,1.3],[.2,1.9,4.1]],
  weather:{clear:1,rain:1.5,storm:2.4,autoRain:.5}},
 // the evening: night(h) ramps over these hours; a light's own on/off ramps take `ramp` hours
 clock:{dawn:[5.5,7.2],dusk:[17.2,18.8],ramp:.3,nightDim:.82}
};
