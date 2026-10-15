// ================================================================= ISLE DEMO — the kits: which biome kits grow here
// [G data] The open world's kit registry (openworld/little-demo/src/47-world-kits.js says what each entry holds). None
// yet: the Ring Sea isles kit (biomes/ringisles) joins with the flora step (settlements/isle-demo/PLAN.md, P3b). It
// places its own trees and the kits it borrows from through RINGISLES.build; the world's flora wants every species,
// the borrowed ones too, as growable prototypes with a pass table, and the water's passes (lagoon, reef) want the
// world's mask to admit shallow water. Both are that step's work.
var WORLD_KITS=[];
WORLD_KITS.api=k=>k._api||(k._api=(0,eval)(k.global));
