/* ======================================================================
   Yuni common: kit pieces. The hand-built Yuni common pieces live in krator-master-furniture.js;
   this file holds the ones the furniture kit builds from a style sheet, in the palette FPAL['yuni-common']
   (krator-furniture-core.js). Training furniture (FK.ROLES.training, 2026-10).
   ====================================================================== */
const YUNI_COMMON_STYLE = {
  wood: 'timberOak', woodDark: 'timberWalnut', woodLight: 'timberPine', woodFam: 'wood',
  cloth: ['clothMadder', 'clothIndigo', 'clothSaffron', 'clothOchre'], clothFam: 'cloth',
  accent: 'brass', accentFam: 'metal', metal: 'silver', metalFam: 'metal',
  clay: 'stoneClay', clayFam: 'stone', stone: 'stoneLaterite', stoneFam: 'stone', rope: 'ropeFlax', ember: 'ember'
};
FK.set({ culture: 'yuni-common', tier: 'common', roles: 'training', prefix: 'yuni_common_training_', S: YUNI_COMMON_STYLE, names: {
  training_dummy: 'Straw-bound practice post', archery_butt: 'Straw archery butt' } });
