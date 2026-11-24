// ================================================================= THE TIERS — the steps' rock (KSTRATA recipes)  [G data]
// PLAN.md section 2 (proposed): the Tiers are the eastern sector of Korona's ring faults, dropped in blocks toward the trench. Each block is
// capped by HARD BEDS (basalt flows from the plume's early years over pale sandstones, tuffs and red beds); each riser is a cliff of the hard
// cap over soft slopes, each tread a stripped cap. From the lake the stair reads as a flight of coloured cliffs: the BLACK STEP (the basalt
// over the lake tread, to ~2.2 km), the RED STEP (red beds, to the middle steps), the WHITE STEP (pale sandstone, to the great tread at
// ~3.7 km) and the GREY STEPS (the high steps' tuffs and limestones, to the crown). PLAN.md section 10, amendment 1: ebadlands' staircase
// recipe (S.terrace on the `canyon` beds) is one recipe's beds, not four coloured formations each with its own cap, so the steps take five
// recipes of their own, core's (core/terrain/35-core-strata.js): tiers-floor, tiers-black, tiers-red, tiers-white, tiers-grey. The soft
// partings between hard beds are where the ledges stand (KSTRATA.ledge: a bench in a soft bed over a hard one): the ledge heath's rows and
// the band lichen's bands follow them (PLAN.md section 4).
// The stack the stations draw from (the plan's heights: the Black cap to ~2.2 km, the Red Step to the middle steps' ~2.9 km, the White Step to
// the great tread's ~3.9 km, the Grey Steps above). The beds dip a little south-west, down the stair toward the trench (the tilted blocks).
// o: {seed, dip, range} (a station passes its own)
var TIERS_STRATA=function(o){o=o||{};
 const f=[{recipe:'tiers-floor',base:-1200,top:1000},{recipe:'tiers-black',base:1000,top:2200},{recipe:'tiers-red',base:2200,top:2950},
  {recipe:'tiers-white',base:2950,top:3950},{recipe:'tiers-grey',base:3950,top:8200}];
 return BIO.strata({formations:f,range:o.range||[-1200,8200],seed:o.seed==null?6120:o.seed,dip:o.dip||[.7,-.7,.012],warp:[5,1.4],private:true});};
// the formation (the step's name) at a height, for the inspector's words
var TIERS_STEP=function(y){return y<1000?'the floor\'s shales':y<2200?'the Black Step (basalt flows)':y<2950?'the Red Step (red beds)':y<3950?'the White Step (pale sandstone)':'the Grey Steps (tuffs and limestones)';};
