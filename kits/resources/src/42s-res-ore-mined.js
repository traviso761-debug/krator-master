// prefix: res
// ================================================================= THE MINED GOODS OF GEMINI'S TRADE MODEL: ten more kinds
// The owner (2026-11-16): "build nodes for mineable resources from the Gemini trade docs, that do not already have one".
// openworld/TRADE-GEMINI.md and tools/scale-model/gemini_trade_model.py trade these goods out of the ground; each kind below
// is one of them, or the mined part of one (the good it feeds is `good`, Gemini's id). All dug by a MINE (bitumen too: a
// pitch lake is cut in blocks, not pumped; oil stays the derrick's). Emeralds and turquoise (Gemini's `gems`) are the Coyote
// Men kit's (kits/coyote). Zinc (Gemini `zinc`) is not here: its node and geology layer are on the rift battery's branch
// (origin/claude/rift-battery-biome 79d3a4500, the owner, 2026-11-12: 42r and 44r, node-zinc-*). Plain data, as
// 42r-res-ore.js; the nodes are drawn in 44s (metals), 44t (gems) and 44u (ground).
//   lodestone   Gemini `magnets`: the Compass Hills' magnetised iron ore; the Arch's lightning-struck magnetite
//   peat        Gemini `peat`: blanket-bog peat, fuel and the malting kilns' smoke
//   silica      Gemini `silica-sand`: washed white quartz sand (glass chain leg 1)
//   quartz      Gemini `gems` (High Rift and Singing Gjar optical quartz, chalcedony) and `silica-sand`'s vein-quartz:
//               a quartz reef with crystal pockets
//   alabaster   Gemini `alabaster`: Jimjam's gypsum-alabaster, quarried (gypsum's massive, translucent kind)
//   bitumen     Gemini `pitch-tar`'s mineral leg: the Ring Isles' tar-black bitumen
//   opal        Gemini `gems` and `photonic-opals`: Opal Valley's black, fire and photonic opal (biomes/opalvalley's
//               diggings carry {kind:'opal', grade} in this shape)
//   diamond     Gemini `gems`: the Korona Hoar-Table's quartzite-conglomerate paleoplacer diamonds, garnets folded in
//   jade        Gemini `frost-coral`'s Verdigris Jade (the Crook, off the map) and the Arch's nephrite at serpentinite contacts
//   amber       Gemini `ria-amber` (the Ria Valley, off the map) and `abyss-lac`'s swamp-amber: fossil resin dug from its bed
Object.assign(RES_ORE.kinds,{
 lodestone:{item:'lodestone',name:'lodestone',cls:'metal',works:'mine',good:'magnets'},
 peat:{item:'peat',name:'peat',cls:'fuel',works:'mine',good:'peat'},
 silica:{item:'silica_sand',name:'quartz sand',cls:'mineral',works:'mine',good:'silica-sand'},
 quartz:{item:'quartz_crystal',name:'rock crystal',cls:'gem',works:'mine',good:'gems'},
 alabaster:{item:'alabaster',name:'alabaster',cls:'stone',works:'mine',good:'alabaster'},
 bitumen:{item:'bitumen',name:'bitumen',cls:'fuel',works:'mine',good:'pitch-tar'},
 opal:{item:'opal',name:'opal',cls:'gem',works:'mine',good:'gems'},
 diamond:{item:'diamond',name:'diamond',cls:'gem',works:'mine',good:'gems'},
 jade:{item:'jade',name:'jade',cls:'gem',works:'mine',good:'frost-coral'},
 amber:{item:'amber',name:'amber',cls:'gem',works:'mine',good:'ria-amber'}});
