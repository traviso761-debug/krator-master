// prefix: ec
// ================================================================= SHUANG-ZHA — terrainH hook & verified camera views ([G data])
// View names strictly exclude apostrophes and colons (check_views.py rule VIEW-NAME, item 30).
const TITLE = KIT.title;
const FAMILIES = [];

terrainH = function (x, z) {
  return EC_GROUND.h(x, z);
};

function ecViewUS(eu, es, ey, tu, ts, ty) {
  var ep = EC_GROUND.at(eu, es), tp = EC_GROUND.at(tu, ts);
  var floorY = Math.max(EC_GROUND.h(ep[0], ep[1]), EC_GROUND.poundWaterAt(ep[0], ep[1])) + 3.6;
  var yEye = ey < floorY ? floorY : ey;
  return [
    +ep[0].toFixed(2), +yEye.toFixed(2), +ep[1].toFixed(2),
    +tp[0].toFixed(2), +ty.toFixed(2), +tp[1].toFixed(2)
  ];
}

const EC_VIEWS = {
  'Overview': ecViewUS(-520, -680, 295.0, 10, 60, 53.0),
  'Twin locks L1 flight': ecViewUS(-5.5, -428, 56.5, 0, -368, 49.5),
  'Barge transiting lock': ecViewUS(-11.8, -412, 53.2, -4.8, -384, 46.8),
  'Upper locks L2 and basin': ecViewUS(5.5, 362, 62.5, 0, 412, 56.0),
  'Lok Ma stone aqueduct': ecViewUS(-58, 646, 66.0, 0, 682, 56.5),
  'Trunk canal and bridges': ecViewUS(0, -238, 58.2, 0, -145, 54.0),
  'Turning basin and granaries': ecViewUS(0, -48, 66.0, 0, 6, 54.0),
  'Jing Hai harbour and drydock': ecViewUS(-40, -585, 68.0, -20, -430, 48.0),
  'Intake weir on Hak Ma': ecViewUS(96, 845, 72.0, 142, 896, 60.5),
  'Night lanterns': ecViewUS(-3.5, 58, 57.5, 0, -4, 54.0)
};
