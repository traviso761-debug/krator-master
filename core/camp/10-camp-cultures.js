/* ==================== core/camp 10: the culture rows (plain data, [G data]) ==================== */
/* core/camp/PLAN.md section 3. A culture row says how a band of that culture lives in its tents: which of its kit's keys
   is a dwelling, a sleeping tent, the chief's, the council's, a trade's workshop or a pen, how many people a household
   is, and who works where. WHAT a band pitches (how many of each tent) is its program, {tents, pens, hedge, pasture}
   in the shape the Beast Riders' kit writes it (kits/beast-riders/src/79-br-camp.js BR_CAMP[tribe].grounds.lower): the
   host passes it in, so core/camp reads no kit's globals.
     kind(key)         'chief' | 'council' | 'shrine' | 'dwelling' | 'sleep' | 'trade' | 'pen' | null (a key it does not know)
     households[key]   households a dwelling holds (the chief's pavilion holds the chief's)
     household         [lo, hi] people a household; chiefHousehold the same for the chief's
     sleepers          [lo, hi] young riders a sleeping tent holds (they belong to no household's tent)
     work[key]         {role, n}: the people a workshop, shrine or pen employs (taken from the band's adults)
     elderShare        the chance a household keeps an elder
     mountsPer         mounts a rider (the rest of the kennel's stock is young or breeding)
     wind              [x, z] the way the wind blows TO (the pens and the pasture go downwind of the tents): the crater's
                       westerlies blow from the north-west (the scale model's wind layer), so to the south-east
     formation         the camp's default layout: 'ring' (doors round a common) or 'horseshoe' (open toward the way in) */
globalThis.KCAMP = globalThis.KCAMP || {version: 1};
KCAMP.CULTURES = KCAMP.CULTURES || {};
KCAMP.CULTURES['beast-rider'] = {
  kind: function (k) {
    if (/^br_tent_chief/.test(k)) return 'chief';
    if (/^br_tent_council/.test(k)) return 'council';
    if (/^br_tent_shrine/.test(k)) return 'shrine';
    if (/^br_tent_dome_(family|double)|^br_tent_silk_house/.test(k)) return 'dwelling';
    if (/^br_tent_dome_small/.test(k)) return 'sleep';
    if (/^br_tent_(smithy|tackmaker|hidemaker|trader|shaman|spinning_shed)/.test(k)) return 'trade';
    if (/^br_tent_(kennel_row|corral|lunge_ring|breaking_pen|training_yard|hitch_line|feed_shelter|perch_frame|crawler_shed|mammoth_paddock|spider_grove|pond_nets|net_house)/.test(k)) return 'pen';
    return null;
  },
  households: {br_tent_chief: 1, br_tent_dome_family: 1, br_tent_dome_double: 2, br_tent_silk_house: 1},
  household: [5, 8], chiefHousehold: [7, 9], sleepers: [3, 4],
  work: {
    br_tent_smithy: {role: 'smith', n: 1}, br_tent_tackmaker: {role: 'tackmaker', n: 1}, br_tent_hidemaker: {role: 'hidemaker', n: 1},
    br_tent_trader: {role: 'trader', n: 1}, br_tent_shaman: {role: 'healer', n: 1}, br_tent_shrine: {role: 'shaman', n: 1},
    br_tent_spinning_shed: {role: 'spinner', n: 2},
    br_tent_kennel_row: {role: 'trainer', n: 2}, br_tent_corral: {role: 'herder', n: 1}, br_tent_lunge_ring: {role: 'trainer', n: 1},
    br_tent_breaking_pen: {role: 'trainer', n: 1}, br_tent_training_yard: {role: 'trainer', n: 1}, br_tent_feed_shelter: {role: 'herder', n: 1},
    br_tent_perch_frame: {role: 'trainer', n: 1}, br_tent_crawler_shed: {role: 'herder', n: 1}, br_tent_mammoth_paddock: {role: 'herder', n: 2}
  },
  elderShare: 0.45, mountsPer: 1.25, wind: [0.7071, 0.7071], formation: 'ring'
};
