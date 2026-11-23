// ================================================================= HOST — wind, A2C, rhythmic wave-compressed blowhole plumes & mist [web]
let BLOWHOLE_PLUMES = null;

{
 const AQ = new URLSearchParams(location.search);
 const AON = function(k){ return AQ.get(k) !== '0'; };
 window._air = { hfog: false, blowholePlumes: 0, volcanicGeysers: 0 };

 try {
  if (BIO.bindAtmosWind) BIO.bindAtmosWind();
  if (BIO.setA2C) BIO.setA2C(renderer);
 } catch (e) {
  reportErr('air wind/a2c: ' + (e.stack || e));
 }

 if (AON('hfog') && ATMOS.heightFog) {
  try {
   const mistOpt = STAGE.key === 'plug'
    ? { density: 0.0014, y: 120, depth: 85, noise: 0.75 }
    : (STAGE.key === 'strait'
       ? { density: 0.0012, y: 10, depth: 24, noise: 0.72 }
       : { density: 0.0007, y: 6, depth: 14, noise: 0.65 });
   ATMOS.heightFog({ falloff: 1 / 680, sun: 0.36, sky: 0.38, mist: mistOpt });
   ATMOS.heightFogScene(scene);
   window._air.hfog = true;
  } catch (e) {
   reportErr('heightFog: ' + (e.stack || e));
  }
 }

 if (ATMOS.rainCover) {
  try { ATMOS.rainCover({ renderer: renderer }); } catch (e) {}
 }

 /* Rhythmic pneumatic ocean wave-compression blowhole spray plumes on Station 2 (rampart) — ZERO volcanic geysers! */
 if (STAGE.key === 'rampart' && STAGE.blowholes && STAGE.blowholes.length && ATMOS.smoke) {
  try {
   const emitters = [];
   for (let i = 0; i < STAGE.blowholes.length; i++) {
    const bh = STAGE.blowholes[i];
    if (bh.phys && bh.phys.active) {
     emitters.push([bh.x, bh.y + 0.4, bh.z, 'spray']);
     /* Secondary compressed-mist crown ring slightly above orifice */
     emitters.push([bh.x + 0.6, bh.y + 2.2, bh.z - 0.4, 'spray']);
    }
   }
   if (emitters.length) {
    BLOWHOLE_PLUMES = ATMOS.smoke(emitters, { n: 56 });
    if (BLOWHOLE_PLUMES && BLOWHOLE_PLUMES.material && BLOWHOLE_PLUMES.material.uniforms && BLOWHOLE_PLUMES.material.uniforms.SA) {
     /* Set spray index (2) vertical jet rise to match BATTER_PHYS.blowholeAt (~20 m in Calm, ~32 m in Gale) */
     const sa = BLOWHOLE_PLUMES.material.uniforms.SA.value;
     if (sa[2]) {
      sa[2].x = 0.28; /* 3.5 s pneumaticroller burst cycle */
      sa[2].y = 19.5; /* 19.5 m compression-spray rise */
      sa[2].w = 0.68;
     }
    }
    window._air.blowholePlumes = STAGE.blowholes.length;
   }
  } catch (e) {
   reportErr('blowhole spray: ' + (e.stack || e));
  }
 }
}

const WEATHER = ATMOS.bindWeather({
 climate: { wet: true },
 sun: SUN_LIGHT,
 hemi: HEMI_LIGHT,
 fog: scene.fog,
 grounds: SEA ? [] : [GROUND_MAT],
 mode: 'clear'
});
