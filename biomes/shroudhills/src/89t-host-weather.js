// ================================================================= HOST — weather, wind, ATMOS.fogBelt sea-mist shroud & smudge-smoke [web]
{
 const AQ = new URLSearchParams(location.search);
 const AON = function(k){ return AQ.get(k) !== '0'; };
 window._air = { hfog: false, belt: false, raincover: false, smoke: 0 };

 try {
  if (BIO.bindAtmosWind) BIO.bindAtmosWind();
  if (BIO.setA2C) BIO.setA2C(renderer);
 } catch (e) {
  reportErr('air wind/a2c: ' + (e.stack || e));
 }

 if (AON('hfog') && ATMOS.heightFog) {
  try {
   ATMOS.heightFog(Object.assign(
    { falloff: 1 / 620, sun: 0.36, sky: 0.38 },
    SEA ? { mist: { density: 0.0011, y: 7, depth: 15, noise: 0.7 } } : {}
   ));
   window._air.hfog = true;
   if (STAGE.belt && AON('belt') && ATMOS.fogBelt) {
    window._belt = ATMOS.fogBelt(Object.assign({
     extent: [-SR * 1.08, -SR * 1.08, SR * 1.08, SR * 1.08],
     res: 128,
     steps: 8
    }, STAGE.belt));
    window._air.belt = true;
   }
   ATMOS.heightFogScene(scene);
  } catch (e) {
   reportErr('height fog / fogBelt: ' + (e.stack || e));
  }
 }

 if (ATMOS.rainCover) {
  try {
   window._air.raincover = !!ATMOS.rainCover({ renderer: renderer });
  } catch (e) {
   reportErr('rain cover: ' + (e.stack || e));
  }
 }

 // Gentle aromatic myrtle-smudge smoke plumes rising from Yonni Spear-Queen trail braziers
 if (ATMOS.smoke && typeof WORKS !== 'undefined') {
  try {
   const smokePts = [];
   for (let i = 0; i < WORKS.length; i++) {
    if (WORKS[i].kind === 'brazier' && WORKS[i].smokeY != null) {
     smokePts.push([WORKS[i].x, WORKS[i].smokeY, WORKS[i].z, 'hearth']);
    }
   }
   if (smokePts.length) {
    ATMOS.smoke(smokePts);
    window._air.smoke = smokePts.length;
   }
  } catch (e) {}
 }
}

const WEATHER = ATMOS.bindWeather({
 climate: { wet: true },
 sun: sun,
 hemi: HEMI,
 fog: scene.fog,
 grounds: SEA ? [] : [GROUND_MAT],
 mode: STAGE.weather || 'clear'
});
