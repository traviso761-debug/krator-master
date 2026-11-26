// ================================================================= THE TIERS — the steps' rock (KSTRATA recipes)  [G data]
// PLAN.md section 2 (proposed): the Tiers are the eastern sector of Korona's ring faults, dropped in blocks toward the trench. Each block is
// capped by HARD BEDS (basalt flows from the plume's early years over pale sandstones, tuffs and red beds); each riser is a cliff of the hard
// cap over soft slopes, each tread a stripped cap. From the lake the stair reads as a flight of coloured cliffs: the BLACK STEP (the basalt
// over the lake tread, to ~2.2 km), the RED STEP (red beds, to the middle steps), the WHITE STEP (pale sandstone, to the great tread at
// ~3.7 km) and the GREY STEPS (the high steps' tuffs and limestones, to the crown). PLAN.md section 10, amendment 1: ebadlands' staircase
// recipe (S.terrace on the `canyon` beds) is one recipe's beds, not four coloured formations each with its own cap, so the kit adds its
// recipes through the core's own KSTRATA.add, as the Great Chasm adds its flood basalt: data, no drawing, no core change.
// Colours sRGB hex; th metres; hard 0 (clay) .. 1 (quartzite); varnish the share of the dark streaks down the faces (the shader's); a
// `between` kind (a bole, a parting) never follows itself. The soft partings between hard beds are where the ledges stand (KSTRATA.ledge:
// a bench in a soft bed over a hard one): the ledge heath's rows and the band lichen's bands follow them (PLAN.md section 4).
(function(){if(typeof KSTRATA==='undefined')return;
 /* THE FLOOR'S BEDS: grey-green shale and red mudstone under the stair, soft (the lake tread's slopes and the lake bed) */
 KSTRATA.add({name:'tiers-floor',main:'shale',kinds:{
  shale:{p:.45,th:[2,9],col:[0x6e7262,0x666a5a,0x767a6a,0x5e6254],hard:.2,xbed:0,varnish:.1},
  mud:{p:.35,th:[1,6],col:[0x8a5a48,0x7e5040,0x96624e],hard:.15,xbed:0,varnish:.05},
  silt:{p:.2,th:[.5,3],col:[0xa49a82,0x9a907a,0xaea48c],hard:.35,xbed:.3,varnish:.1}},
  fx:{varnish:.2}});
 /* THE BLACK STEP: basalt flows, each a dark hackly flow with a red-brown vesicular top, thin red boles and pale tuff partings between
    eruptions (the soft partings the ledges stand in) */
 KSTRATA.add({name:'tiers-black',main:'flow',kinds:{
  flow:{p:.46,th:[6,24],col:[0x2e2c2a,0x363331,0x282624,0x3c3835],hard:.92,xbed:0,varnish:.45},
  vtop:{p:.18,th:[1,4],col:[0x5a3c30,0x664436,0x4e362c],hard:.5,xbed:0,varnish:.25},
  bole:{p:.16,th:[.4,2.5],col:[0x8a3e2a,0x9a4a30,0x7a3626],hard:.18,xbed:0,varnish:.1,between:true},
  tuff:{p:.2,th:[1,5],col:[0x9a8e78,0xa69a82,0x8e826c],hard:.25,xbed:.2,varnish:.15,between:true}},
  fx:{varnish:.4}});
 /* THE RED STEP: red beds, soft red mudstone and siltstone slopes under hard red sandstone ledges */
 KSTRATA.add({name:'tiers-red',main:'mud',kinds:{
  mud:{p:.42,th:[2,10],col:[0x9a4a34,0x8a4230,0xa6563c,0x7e3c2c],hard:.2,xbed:0,varnish:.1},
  sand:{p:.38,th:[3,14],col:[0xb05e3e,0xbc6a46,0xa45438,0xc4764e],hard:.8,xbed:.6,varnish:.3},
  gyp:{p:.2,th:[.3,1.5],col:[0xd8ccb8,0xe2d8c4,0xccc0aa],hard:.3,xbed:0,varnish:0,between:true}},
  fx:{varnish:.35}});
 /* THE WHITE STEP: pale cross-bedded sandstone in thick hard sets, thin pink partings */
 KSTRATA.add({name:'tiers-white',main:'sand',kinds:{
  sand:{p:.7,th:[8,30],col:[0xe2d4b8,0xd8c8aa,0xeadcc2,0xd0be9e],hard:.85,xbed:.9,varnish:.35},
  pink:{p:.3,th:[1,4],col:[0xd4a88a,0xc89a7c,0xdcb496],hard:.3,xbed:.2,varnish:.1,between:true}},
  fx:{varnish:.4}});
 /* THE GREY STEPS: grey tuffs and limestones of the high steps, frost-shattered */
 KSTRATA.add({name:'tiers-grey',main:'lime',kinds:{
  lime:{p:.55,th:[4,18],col:[0x8a8a86,0x9a9a94,0x7e7e7a,0xa4a49e],hard:.75,xbed:0,varnish:.2},
  tuff:{p:.3,th:[2,8],col:[0xa69e8e,0xb2aa98,0x9a9282],hard:.35,xbed:.2,varnish:.1},
  marl:{p:.15,th:[.5,3],col:[0xb8b0a0,0xc4bcac,0xaca494],hard:.15,xbed:0,varnish:0,between:true}},
  fx:{varnish:.25}});
})();
// The stack the stations draw from (the plan's heights: the Black cap to ~2.2 km, the Red Step to the middle steps' ~2.9 km, the White Step to
// the great tread's ~3.9 km, the Grey Steps above). The beds dip a little south-west, down the stair toward the trench (the tilted blocks).
// o: {seed, dip, range} (a station passes its own)
var TIERS_STRATA=function(o){o=o||{};
 const f=[{recipe:'tiers-floor',base:-1200,top:1000},{recipe:'tiers-black',base:1000,top:2200},{recipe:'tiers-red',base:2200,top:2950},
  {recipe:'tiers-white',base:2950,top:3950},{recipe:'tiers-grey',base:3950,top:8200}];
 return BIO.strata({formations:f,range:o.range||[-1200,8200],seed:o.seed==null?6120:o.seed,dip:o.dip||[.7,-.7,.012],warp:[5,1.4],private:true});};
// the formation (the step's name) at a height, for the inspector's words
var TIERS_STEP=function(y){return y<1000?'the floor\'s shales':y<2200?'the Black Step (basalt flows)':y<2950?'the Red Step (red beds)':y<3950?'the White Step (pale sandstone)':'the Grey Steps (tuffs and limestones)';};
