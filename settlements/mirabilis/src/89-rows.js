/* ================================================================= MIRABILIS — terrainH hook & verified camera views ([G data])
   View names strictly exclude apostrophes and colons (tools/check_views.py rule VIEW-NAME, item 30). */
const TITLE = KIT.title;
const FAMILIES = [];

terrainH = function (x, z) {
  return MB_GROUND.h(x, z);
};

function mbView(ex, ez, ey, tx, tz, ty) {
  var gY = MB_GROUND.h(ex, ez);
  var bridgeFloor = (Math.abs(ex) < 7.0 && ez >= -246 && ez <= -140) ? MB_GROUND.MOON_BRIDGE.deckY : gY;
  var minEye = Math.max(gY, bridgeFloor) + 4.2;
  var yEye = ey < minEye ? minEye : ey;
  return [
    +ex.toFixed(2), +yEye.toFixed(2), +ez.toFixed(2),
    +tx.toFixed(2), +ty.toFixed(2), +tz.toFixed(2)
  ];
}

const MB_VIEWS = {
  'Overview': mbView(-680, 680, 3410.0, 20, 80, 3102.0),
  'Yut Moon Bridge and gorge': mbView(-148, -98, 3122.0, 0, -193, 3032.0),
  'Pepar Hom suzerain avenue': mbView(0, 260, 3132.0, -95, 252, 3133.5),
  'Sutar Tawar clock observatory': mbView(334, 114, 3137.0, 422, 95, 3144.0),
  'Kuran Gate and legation': mbView(-545, 260, 3141.0, -480, 224, 3138.0),
  'Yaodong sunny cliff benches': mbView(-275, -162, 3136.0, -265, -28, 3112.0),
  'Yut Ma mill gorge and kilns': mbView(-168, -148, 2951.5, -285, -170, 2948.5),
  'Fulcrum escarpment hoist': mbView(652, 260, 3119.5, 742, 260, 3082.0),
  'Siru Spring stepwell and bath': mbView(338, -44, 3122.5, 338, -84, 3111.5),
  'Night katabatic lanterns': mbView(0, 172, 3132.0, 0, 262, 3134.0)
};
