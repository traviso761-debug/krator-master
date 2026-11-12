// The Line's cars for riding's node tests: kits/motor-vehicles' built bundle (dist/krator-vehicles.js, every culture, the line's
// included) loaded under a stand-in THREE, so KratorVehicles.dataOf(key, variant) gives each car's records (data.ride) with no
// geometry built. Test-only: the page bundles the real thing (build.py: vehicle_bundle.bundle(['ancient', 'line', 'tungang'])).
// The bundle is a build output (in Git LFS): test_all.py runs these tests after the builds (NODE_AFTER_BUILD).
//   const KV = require('./lab/kv-node.js')     -> KratorVehicles (or throws, naming the missing bundle)
const fs = require('fs'), path = require('path');
const BUNDLE = path.join(__dirname, '..', '..', '..', '..', 'kits', 'motor-vehicles', 'dist', 'krator-vehicles.js');
if (!global.KratorVehicles) {
  const head = fs.existsSync(BUNDLE) ? fs.readFileSync(BUNDLE, 'utf8') : '';
  if (!head || head.startsWith('version https://git-lfs')) throw new Error('kv-node: ' + BUNDLE + ' is missing or an LFS pointer (python3 tools/build.py kits/motor-vehicles, or git lfs pull)');
  /* any THREE member is callable and constructible, and anything read off it is the same stand-in: enough to register records */
  const stub = new Proxy(function () {}, { get: (t, k) => (k === 'prototype' ? {} : stub), construct: () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : stub) }), apply: () => stub });
  const hadThree = 'THREE' in global, three = global.THREE;
  global.THREE = stub;
  (0, eval)(head);
  if (hadThree) global.THREE = three; else delete global.THREE;
  global.KratorVehicles = KratorVehicles;
}
module.exports = global.KratorVehicles;
