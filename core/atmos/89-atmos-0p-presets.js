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
 clock:{dawn:[5.5,7.2],dusk:[17.2,18.8],ramp:.3,nightDim:.82},
 // THE WAVE FIELD (89-atmos-a-waves.js): open water as three families of travelling waves. A wave is [kx,kz,c,a]: its
 // wave vector in radians per metre, c whole cycles per `period` seconds (the clock the shaders read wraps at `period`,
 // so whole cycles make the wrap seamless), and its share of the family. chop (12-21 m) only shades, near the camera;
 // mid (44-70 m) shades out to a kilometre; swell (150-180 m) is the one a coarse water mesh can displace. group is the
 // slow envelope that gathers waves into sets, warp the slow bend of every crest line ([kx,kz,c], warpAmp metres).
 // amp is the half-height scale in metres; gain multiplies it per family; groupMix [floor,depth] is how far the group
 // envelope swells and calms each family; fade [near,far] metres of camera distance retires a family before its
 // wavelength drops under a pixel; tilt turns slope into shading normal. From World of ClaudeCraft (MIT).
 waves:{period:600,amp:.22,tilt:1.77,warpAmp:6,
  chop:[[.24,.18,86,.5],[-.16,.27,117,.32],[.44,-.31,162,.18]],
  mid:[[.1015,.0369,62,.45],[-.0248,.1406,72,.33],[.0735,-.0515,79,.22]],
  swell:[[.0364,.0209,44,.46],[-.0119,.0328,38,.33],[.024,.0343,50,.21]],
  group:[[.021,.013,14],[-.011,.024,11],[.0152,-.0262,17]],
  warp:[[.0141,-.0083,9],[.0067,.0126,7]],
  gain:{chop:1,mid:4,swell:2},groupMix:{chop:[.55,.9],mid:[.45,.75],swell:[.5,.8]},
  crestMix:{chop:[.35,.65],mid:[.32,.58],swell:[0,.45]},crestNorm:.72,skip:.01,
  fade:{chop:[150,480],mid:[420,1100],swell:[1400,3000]}},
 // THE SKY'S LIGHT (89-atmos-b-skylight.js): the sky scene captured into a cube map of `size` px a side, prefiltered and
 // set as scene.environment. It recaptures when the hour moves stepH hours (or the host's key changes), at most once every
 // `every` frames. specular and diffuse scale the map's two terms on standard materials (diffuse is compiled in: set it
 // before the first frame; 0 keeps a build's tuned hemisphere and ambient fill as the only diffuse light). groundK scales
 // the ground colour the host passes for the lower half of the capture.
 skylight:{size:128,stepH:.2,every:30,specular:1,diffuse:0,groundK:1},
 // THE CLOUD DECK (89-atmos-d-clouddeck.js): a sea of cloud seen from above, the dense air of a basin pooled below a
 // wall (the southern highlands' hyperjungle deck). Its relief is GRADIENT NOISE (fBm) on a lattice that repeats every
 // `lattice` cells, hashed by integers (bit-exact in every engine), so no straight crest anywhere: billows [div, amp] are
 // octaves of cell `cell`/div metres; their sum (over the total amp, times `gain`) is heaped by `heap` (the tops round,
 // the troughs flatten) between `down` and `up` metres about the deck's level. warp {amp, seedA, seedB} bends the billows
 // with a second noise of cell `cell` that drifts its own way (`evolve`), so the cloud changes shape as it goes; drift is
 // the billows' own. drift and evolve are whole lattice periods per clock `period` ([cells of `cell`*lattice in x, in z]),
 // so the clock's wrap is seamless. puff: the billows and the detail as BILLOW noise, 2|n| - 0.5 (rounded domes with sharp
 // creases between them, as cumulus tops seen from above), not plain noise (smooth swells, which read as water). detail (detailAmp metres) only shades, faded out by camera distance (fade [near,far]);
 // tilt turns slope into the shading normal. top and shade are the lit and hollow colours (display sRGB). ground: where
 // the ground rises through the deck it thins from alpha 1 at ground[1] metres of clearance to 0 at ground[0]. mesh: a
 // grid of `cells` a side, `radius` metres round the camera, snapped to `snap`; clear: the ground's height round the camera
 // on `size` a side over `span` metres, resampled at each snap. fogK thins the scene's fog on the deck.
 clouddeck:{period:51200,lattice:64,cell:640,drift:[2,-1],evolve:[-1,2],up:44,down:26,heap:2.1,tilt:3.2,gain:2.25,puff:true,
  billows:[[1,.5],[2,.28],[4,.15],[8,.07]],warp:{amp:230,seedA:21,seedB:22},
  detail:[[10,.5],[20,.32],[40,.18]],detailAmp:2.5,
  fade:[600,2500],top:[.99,.985,.97],shade:[.49,.56,.66],ground:[-6,45],fogK:.55,
  mesh:{radius:9000,cells:180,snap:300},clear:{size:160,span:5200}}
};
