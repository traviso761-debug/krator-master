// ================================================================= ATMOS — sky presets: the standard Krator sky, and the colour script by sun altitude
// [G data] PRESETS.sky.standard is "the standard Krator skybox" (README.md): the reference site's air and colour
// script, no ridges. A biome's sky is ATMOS.skyPreset('standard', {its overrides}) (SKY-PLAN.md 3.2).
// THE COLOUR SCRIPT (keys) is indexed by the SUN'S ALTITUDE, not the hour, so dawn follows the season and the
// latitude by itself. Colours are display-space [r,g,b] 0..1, like every ATMOS preset; lights are three's legacy units.
//   ATMOS.skyPreset(base, over)   a deep copy of PRESETS.sky[base] with `over` merged in (arrays replaced whole)
//   ATMOS.skyLook(preset, state, weather, eyeY)   the colour script at the state's sun, adjusted for the air's pressure,
//                                 the eclipse and the weather: the lights, fog, exposure and the shader's sky colours;
//                                 eyeY only with preset.air.thin (thin air: the pressure falls with the eye's height)
//   ATMOS.airPressureAt(preset, y)   the air's pressure at height y (atm): preset.air.pressure unless air.thin
// Godot: the same keys feed Environment (tonemap_exposure, fog, ambient) and the two DirectionalLight3Ds.
(function(){const A=ATMOS;
 // key: alt (sun altitude, degrees), zen/hor (sky at the zenith and the horizon), sunHor (the horizon toward the sun),
 // sunC/sunI (the sun light), hemiS/hemiG/hemiI (the hemisphere light), exp (exposure), fog (fog density, x the air's)
 const K=(alt,zen,hor,sunHor,sunC,sunI,hemiS,hemiG,hemiI,exp,fog)=>({alt,zen,hor,sunHor,sunC,sunI,hemiS,hemiG,hemiI,exp,fog});
 A.PRESETS.sky={standard:{
  site:{px:446,py:690},                      // Voth, the reference site (40 S); a biome gives its own pixel
  air:{pressure:1.6,turbidity:1,humidity:.55,dust:[.80,.72,.60],dustK:0},
  keys:[
   K(-18,[.010,.014,.032],[.026,.034,.058],[.026,.034,.058],[0,0,0],0,[.10,.13,.19],[.025,.028,.034],.40,1.05,1),
   K(-11,[.022,.036,.085],[.075,.085,.135],[.13,.10,.14],[0,0,0],0,[.14,.17,.26],[.035,.035,.045],.42,1.05,1),
   K(-5,[.085,.13,.25],[.36,.31,.36],[.86,.50,.30],[.9,.45,.25],0,[.32,.31,.38],[.07,.06,.06],.50,1.0,1.05),
   K(-1,[.18,.27,.46],[.66,.55,.52],[1.0,.64,.36],[1,.55,.30],.35,[.50,.48,.52],[.14,.11,.09],.55,1.0,1.1),
   K(3,[.26,.40,.62],[.80,.71,.63],[1.0,.76,.48],[1,.70,.46],1.15,[.62,.62,.64],[.22,.18,.14],.60,1.0,1.05),
   K(10,[.29,.46,.72],[.77,.80,.81],[.98,.88,.72],[1,.86,.68],1.75,[.70,.74,.78],[.28,.25,.20],.62,1.0,1),
   K(25,[.26,.46,.76],[.72,.80,.86],[.90,.90,.86],[1,.95,.86],2.15,[.74,.80,.86],[.32,.30,.25],.62,1.0,1),
   K(50,[.23,.43,.76],[.70,.79,.87],[.86,.89,.90],[1,.97,.92],2.35,[.75,.82,.90],[.34,.32,.27],.62,1.0,1)],
  // the giant: an ice giant's blues (the owner's references, 2026-10-25); plank multiplies the sky-plankton bands;
  // haze and teal colour the mid-level deck between the white belts, teal on the equator
  giant:{deep:[.07,.19,.55],mid:[.21,.44,.86],pale:[.52,.68,.94],cloud:[.94,.97,1],plank:[.70,1.12,.92],haze:[.40,.63,.96],teal:[.22,.68,.72],rim:[.55,.72,1],night:[.20,.30,.48],ring:[.88,.84,.76],
   shine:[.60,.72,.86],shineI:.42},          // giantshine: the night's key light from the giant, at full phase
  // THE CLOUDS' MOOD (the Ancient's Valley's smog, the owner 2026-11-08: "dark, unnaturally turbulent, coloured, or softly glowing
  // cloudiness"; opt-in, each key absent here so every page's cloud is the cloud it was): a biome adds to clouds
  //   dark        0..1: the cloud's lit colour pulled toward a storm grey, its shadow side blacker
  //   tint        display [r,g,b] the cloud is drawn toward, keeping its own light and shade (a smog brown-purple, a dull red, a
  //               sickly green, an ash grey: ATMOS.MOOD_PALETTE); tintK 0..1 how far (default 1 when a tint is given)
  //   turbulence  0..1, with turbKind 'violent' (a second, faster noise tears the shape and breaks the edges; the default),
  //               'ordered' (unnaturally regular parallel rows of cloud), 'glitched' (two more sheets of cloud sliding on
  //               their own random-walk winds through the first, turning abruptly every few seconds; sheetTint 0..1 colours them
  //               in the tint's complement and its hue-rotated twin) or 'ripple' (rings spreading from an epicentre, turbAt
  //               [x, z], as from a stone dropped in water in slow motion); pace (default 3) is how much faster than the page's
  //               wind the pattern's own motions run, so they read at 1x
  //   glow        0..1 at night (nothing by day): the cloud base lit from below by glowColour (display RGB, default the fires'
  //               orange), the city's fires or the taint; glowKind 'ethereal' (a slow, soft breathe over the whole sky),
  //               'lightning' (frequent flashes under one patch at a time) or 'orbs' (two small bright lights wandering under the
  //               cloud: ball lightning, or something flying) is read by ATMOS.cloudMood, which animates glow and sets glowLocus
  //               [x, z, radius, spread] and glowLocus2 [x, z, radius, on] (a page may set them itself: spread 1 lights the whole sky alike)
  //   mood        true: compile the mood's lines with everything at rest, for a page that drives them later (ATMOS.cloudMood:
  //               the shifting episodes, the owner's "could all be together or separate", sky/89-atmos-k-cloudmood.js)
  clouds:{cover:.32,cumulus:1,cirrus:.55,bank:.35,height:1600,cirrusHeight:9000,scale:2600,drift:.004},
  night:{stars:1,nebula:1,galaxy:1,meteors:1},   // meteors: the shooting stars' rate (0 none; a shower 3 or more)
  fogDensity:.00011,                         // the air's own, x each key's fog
  ridges:[]}};
 // the mood's vocabulary (the shader's uCloudY.x; the palette the episodes draw from: brown, dull red, sickly green, ash grey)
 A.MOOD_TURB={violent:0,ordered:1,glitched:2,ripple:3};
 A.MOOD_PALETTE=[[.42,.33,.30],[.48,.26,.24],[.42,.50,.30],[.46,.45,.44],[.52,.44,.66],[.62,.56,.28]];   // brown, dull red, sickly green, ash, ghostly purple, jaundice yellow
 A.MOOD_GLOW={ethereal:[.55,.78,.72],lightning:[.82,.86,1],orbs:[.90,.96,1]};   // the glow colour by kind when the page names none: a pale teal breathe, a blue-white flash, white lights
 const clone=o=>JSON.parse(JSON.stringify(o));
 const merge=(a,b)=>{for(const k in b){const v=b[k];if(v&&typeof v==='object'&&!Array.isArray(v)&&a[k]&&typeof a[k]==='object'&&!Array.isArray(a[k]))merge(a[k],v);else a[k]=clone(v);}return a;};
 A.skyPreset=(base,over)=>merge(clone(A.PRESETS.sky[base==null?'standard':base]),over||{});

 const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),lum=c=>.3*c[0]+.55*c[1]+.15*c[2],cl=(x,a,b)=>Math.min(b,Math.max(a,x));
 // the colour script at a sun altitude: the two keys either side, smoothly
 const keyAt=(keys,alt)=>{if(alt<=keys[0].alt)return clone(keys[0]);const n=keys.length;if(alt>=keys[n-1].alt)return clone(keys[n-1]);
  let i=0;while(keys[i+1].alt<alt)i++;const a=keys[i],b=keys[i+1],t0=(alt-a.alt)/(b.alt-a.alt),t=t0*t0*(3-2*t0),o={alt};
  for(const k in a)if(k!=='alt')o[k]=Array.isArray(a[k])?mix(a[k],b[k],t):a[k]+(b[k]-a[k])*t;return o;};
 A.skyKeyAt=keyAt;
 // THIN AIR (biomes/godthrone/PLAN.md 2; opt-in): preset.air.thin = {y0, scale} makes the pressure a function of the eye's
 // height, the model's law p = air.pressure * exp(-(y - y0) / scale) (scale default 8000 m: 1.6 atm at sea level, 0.52 at
 // 9 km, 0.07 at the 25 km rim; y0 is the page height where air.pressure holds, default 0). Through the look below it darkens
 // the zenith toward black and lets the bright stars through by day; on top of that, only with air.thin, the sky fill falls
 // away (hemiI: hard, dark shadows), the sun whitens and strengthens, the haze floor goes and the fog falls to nothing.
 // Without air.thin the look is what it was, at every height.
 A.airPressureAt=(P,y)=>{const a=P.air,t=a.thin;if(!t||y==null)return a.pressure;return a.pressure*Math.exp(-(y-(t.y0==null?0:t.y0))/(t.scale==null?8000:t.scale));};
 // core/hazard's ambient bridge (its README, "the ambient bridge"): the pressure field its thin-air row doses by. A page calls
 // it (the Godthrone); guarded, false without KHAZ
 A.provideAir=P=>A.khaz?A.khaz('pressure',(x,y,z)=>A.airPressureAt(P,y)):false;
 // weather: {cover (0..1 extra cloud), grey (0..1 overcast), fog (0..1)}; the weather module's W maps onto it
 // y: the eye's height (the sky host passes the camera's); read only with air.thin
 A.skyLook=function(P,s,w,y){w=w||{};const p=A.airPressureAt(P,y),L=keyAt(P.keys,s.sunAlt);
  // the eclipse: daylight drops to a deep twilight round the giant's ringed rim (21-sky.js: dusk, not night)
  if(s.eclipse>0){const E=keyAt(P.keys,-6),e=s.eclipse*.88;for(const k in E)if(k!=='alt'&&k!=='exp')L[k]=Array.isArray(L[k])?mix(L[k],E[k],e):L[k]+(E[k]-L[k])*e;L.sunI*=1-s.eclipse;}
  // the air: thick air whitens the horizon and milks the zenith; thin air darkens the zenith toward black
  const thick=cl((p-1)*.32,0,.5),thin=cl((1-p)/.85,0,1);
  L.hor=mix(L.hor,[1,1,1].map(v=>v*Math.min(1,lum(L.hor)*1.08)),thick*.6);L.zen=mix(L.zen,L.hor,thick*.45);
  L.zen=mix(L.zen,L.zen.map((v,i)=>v*[.10,.16,.34][i]),thin*.95);L.hor=mix(L.hor,mix(L.hor,L.zen,.5),thin*.6);L.sunHor=mix(L.sunHor,L.hor,thin*.4);
  if(P.air.dustK){L.hor=mix(L.hor,P.air.dust,P.air.dustK*.5);L.sunHor=mix(L.sunHor,P.air.dust,P.air.dustK*.3);}
  // weather: overcast greys the sky and dims the sun; fog thickens the air
  const g=cl(w.grey||0,0,1);if(g){const gr=c=>{const l=lum(c);return mix(c,[l,l,l],g*.8).map(v=>v*(1-.25*g));};L.zen=gr(L.zen);L.hor=gr(L.hor);L.sunHor=gr(L.sunHor);L.sunI*=1-.75*g;L.hemiI*=1+.15*g;}
  L.ext=[.020,.042,.090].map(v=>v*p*(P.air.turbidity==null?1:P.air.turbidity)*(1+2*g));
  L.hazeFloor=cl(.10*p*(1-thin)+.25*g,0,.6);
  L.dayStars=A.ss(.62,.12,p);                // the brightest stars and the nebula's core by day: only in thin air
  L.night=A.ss(-4,-14,s.sunAlt);
  // giantshine: the giant's lit fraction, by night and in an eclipse
  const G=P.giant;L.shineC=G.shine;L.shineI=G.shineI*s.giantLit*Math.max(L.night,s.eclipse*.6)*(1-.7*g);
  L.fogC=mix(L.hor,L.sunHor,.18);L.fogD=P.fogDensity*L.fog*(p/1.6)*(1+6*(w.fog||0));L.cover=cl(P.clouds.cover+(w.cover||0),0,1);
  if(P.air.thin){L.p=p;L.hemiI*=1-.75*thin;L.sunC=mix(L.sunC,[1,1,1],.6*thin);L.sunI*=1+.25*thin;L.hazeFloor*=1-thin;L.fogD*=1-thin*thin;}
  return L;};
})();
