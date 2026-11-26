# Activities to clips: the plan (2026-11-25; steps 1-3 done the same day)

The simulation knows what every citizen is doing (an activity id each hour, a trade, a workplace, a tool); the
character kit has 143 clips and 27 props. Nothing joins them yet: Voth tints a stand-in's tunic by activity, and only
Longsong maps a handful of activities to clips (`settlements/longsong/src/69-ls-figures.js` `CLIP(i, act)`). This plan
is the README's next step 2 and GODOT-PLAN.md Phase 5 step 2: one table both runtimes read, and the list of what it
cannot cover yet. Sources: `core/simulation` (SCHEMA.md, ROADMAP.md §8, §26, §29), Voth's tune
(`settlements/voth/targets/voth-city/15-vc-tune.js`: tools, shifts, rooms), the settlements' `activities.json`, the
44 census trades (`tools/trades_census.json`), `core/hamlet` foci, `core/camp` roles and ventures, and the clip and prop
lists here.

## 1. The table (`data/activities.json`, `[G data]`)

One entry per activity id, read by the page (`KCharFigure`) and the Godot twin (`kchar_figure.gd`), and by any
settlement that embodies its sim:

```json
"CRAFT": { "clips": ["hammer_anvil", "ual_interact"], "prop": {"R": "hammer"}, "loop": true,
           "by_trade": { "weavers and dyers": {"clips": ["weave_loom"], "prop": {"R": "shuttle"}},
                         "smiths and craftsmen": {"clips": ["hammer_anvil"], "prop": {"R": "hammer"}} },
           "by_furniture": { "loom": "weave_loom", "anvil": "hammer_anvil", "kiln": "tend_kiln" },
           "vary": "seed", "posture": null }
```

- **clips**: picked by the actor's seed (`vary`), so a crowd of workers is not in step; a one-shot list plays in turn.
- **by_trade** and **by_furniture** override in that order (the furniture the sim seated the actor at wins, then the
  trade, then the default), so CRAFT reads differently at a loom, an anvil and a potter's wheel.
- **prop**: the tool in each hand, from the trade's tool (`sim.items.tools`) when the entry does not name one.
- **posture**: a clip's posture key if an activity wants its own (`data/posture.json` clips already does this per clip).
- **unmapped**: the build lists every activity id the sims use that has no entry, so a new activity shows up as a gap
  instead of an idle.
- Transitions (sit down, stand up, into bed, wake, mount and leave a ladder) come from the clip data's existing
  one-shots, played when the activity changes; `SIM.pose` gains `act` in Godot (`ksim.gd` has none yet).

## 2. Coverage: sim activities

✓ a clip that reads right; ~ a stand-in that will do for now; ✗ a gap.

| Activity (where) | Clip now | |
|---|---|---|
| SLEEP, REST (bed), WAKE | `lie_bed`, `sleep`, `sleep_toss`, `wake` | ✓ |
| EAT / DRINK (seated, standing) | `ual_consume`, `sit_drink`, `drink` (cup) | ✓ |
| SOCIALIZE, VISIT, RELAX, TALK, TRADE (haggle) | `ual_talk`, `ual_sit_talk`, `ual_arms_folded`, idles | ✓ (more gestures in §6) |
| IDLE, CONTEMPLATE | 14 idles, `mirror`, `dozing` | ✓ |
| BUY, SELL, KEEP_SHOP, KEEP_INN | `ual_talk`, `ual_pickup_table` | ~ (no hand-over: give / take) |
| HAUL, STORE, STORE_FOOD, UNLOAD, DELIVER | `walk_carry`, `ual_carry`, `pick_up`, `pick_up_side`, `push` | ~ (no sack on the shoulder, crate stacking) |
| FARM (hoe, plant, water, harvest, pull crop) | `dig`, `ual_plant`, `ual_water`, `ual_harvest`, `harvest` | ✓ |
| GATHER (fruit, forage) | `pick_fruit`, `collect` | ✓ (basket coming, round 4) |
| MINE, QUARRY, CUT_STONE | `dig` (pickaxe), `ual_chop` | ~ (no maul / sledge swing, no wedge-and-mallet) |
| LOG (felling), lumber | `ual_chop`, `axe_chop` | ~ (no two-man saw, no sawpit) |
| CRAFT at anvil | `hammer_anvil` | ✓ |
| CRAFT other, WORK | `ual_interact`, `ual_repair` | ~ (crafting-at-bench coming, round 4) |
| WEAVE | none | ✗ |
| COOK (hearth, stove, kitchen) | none | ✗ |
| BREW, ALCHEMY | none | ✗ (stir a vat; pour) |
| STUDY, RESEARCH, writing (scribes, clerks, customs) | `sit_floor`, `sit` | ~ (no reading or writing) |
| HEAL (sickbed, herb bench) | `ual_repair` (kneeling) | ~ (no tending a patient, grinding herbs) |
| WORSHIP, PRAY, PRIEST, RITUAL, HONOUR, MOURN | `sit_floor` | ✗ (no kneel-pray, prostration, bow, preach, lament) |
| KORA (circling a shrine), PILGRIM | `walk` | ✓ |
| CHAM (ritual dance), FESTIVAL, SING | none | ✗ (UAL `Dance_Loop`, Meshy has 33 dances) |
| TURN_WHEEL (prayer wheel) | `ual_push` | ~ |
| GUARD, KEEP, WATCH | `combat_idle`, `ual_arms_folded`, `ual_lantern` | ~ (no attention stance, no leaning on a spear) |
| PATROL | `walk`, `spear_walk` | ✓ |
| TRAIN, DRILL (muster ground, dummy, butts) | melee and ranged clips | ✓ for weapons; ✗ sparring pairs, drill in ranks |
| FIGHT (arena, brawl, assault) | melee clips, `ual_punch` | ~ armed ✓, unarmed one clip (§5) |
| DRAW_TOOLS (rack) | `pick_up` | ~ |
| FISH (boat), FISH_SHORE, MEND_NETS | none | ✗ (cast a net, line fishing, net mending seated) |
| TEND_BEASTS, FEED, STABLE, HERD, WATER_CAMELS | `ual_water`, `pick_up` | ✗ (no feeding, grooming, leading by the halter, milking, shearing) |
| FETCH_WATER | `walk_bucket`, `drink` | ✓ |
| HOUSEWORK | none | ✗ (sweep, scrub, beat a rug, hang washing) |
| PLAY (children) | none | ✗ (and no child bodies) |
| RULE, GOVERN, COLLECT_TOLL | `sit` (chair), `ual_talk` | ~ (no throne pose, no proclamation) |
| JAIL, HIDE | `sit_floor`, `ual_crouch` | ~ |
| FENCE, pickpocket, burglary | `ual_talk`, `ual_crouch_walk` | ✗ (no pocket reach, no lock-picking) |
| arrest / resist / surrender | none | ✗ (hands up, hands behind back, restrained) |
| FLEE | `sprint`, `run` | ✓ |
| unrest: grumble, demand, strike | idles, `ual_talk` | ✗ (shouting, fist-shaking, a picket) |
| SCOUT, EXPLORE, SEARCH, INVESTIGATE | `bow_scan`, `ual_crouch_walk` | ~ (no look-around, no crouch-and-inspect) |
| DRIVE, DRIVE_BACK (cart, buggy) | `ual_drive` | ✓ |
| ride a mount, ride aboard (carriage, train) | none | ✗ (no rider clip at all) |
| boat (paddle, row, pole), BOARD_FERRY | none | ✗ |
| ladders, ledges, swimming | `ladder*`, `ual_climb_up`, `swim*` | ✓ |
| hurt, fall, die, get up | 14 clips | ✓ |

## 3. Coverage: the trades' work

The trade sets the default clip for WORK and CRAFT and the tool in hand (`sim.items.tools`):

| Trades (census unless +) | Work clip | Tool prop | |
|---|---|---|---|
| farmhands and ploughmen; chinampa growers; monks and lay brothers | `dig`, `ual_plant`, `harvest` | hoe ✓, spade ✗ | ~ |
| orchardmen | `pick_fruit` | shears ✗, basket (r4) | ~ |
| mushroom growers | `ual_harvest` | knife ✗ | ~ |
| granary keepers and millers | `ual_carry`, `walk_carry` | sack ✗ | ✗ milling (pour, sweep the floor) |
| beetle herders; swineherds and duck keepers; dairymen; grooms | none | goad ✗, knife ✗ | ✗ herding, feeding, milking, churning |
| bakers; cooks; innkeepers and servers; household service | none | peel ✗, ladle ✗ | ✗ kneading, the oven peel, stirring, serving |
| butchers | `ual_chop` | cleaver ✗ | ~ |
| brewers | none | paddle ✗ | ✗ stirring a vat |
| weavers and dyers | none | shuttle ✗ | ✗ the loom, the dye vat |
| tanners | `ual_repair` | scraper ✗ | ✗ scraping a hide on a beam |
| smiths and craftsmen; armourers; guild masters | `hammer_anvil` | hammer ✓ | ✓ (bellows, quench ✗) |
| shipwrights and boatbuilders; industrial workers | `hammer_anvil`, `ual_repair` | hammer ✓, saw ✗, adze ✗ | ~ |
| power-house stokers and engineers | none | shovel ✗ | ✗ stoking |
| miners | `dig` | pickaxe ✓ | ✓ |
| quarrymen and masons | `dig`, `hammer_anvil` | maul ✗, chisel ✗ | ~ |
| fishers | none | net ✗, rod ✗ | ✗ |
| dockers and stevedores; porters and warehousemen | `walk_carry`, `ual_carry` | hook ✗, sack ✗, crate ✗ | ~ |
| river bargemen and quay hands; ferrymen | none | oar ✗, pole ✗ | ✗ |
| coast guard; town guard; soldiers; Ordinator garrison; jailers | combat and patrol clips | weapons ✓ | ✓ (attention, salute ✗) |
| lighthouse keepers | `ual_lantern` | torch ✓ | ✓ |
| shopkeepers; market traders | `ual_talk`, `ual_pickup_table` | coin ✗ | ~ (give / take ✗) |
| healers and nurses | `ual_repair` | lancet ✗, mortar ✗ | ~ |
| customs officers and clerks; guild officers; teachers and scholars; + clerks, scribes | `sit` | quill ✗, book ✗, scroll ✗ | ✗ writing, reading |
| envoys and embassy staff; palace staffs and officials | `ual_talk` | none | ~ (bows, proclamation ✗) |
| temple priests; shrine keepers; priests and undertakers; + necropolis keepers | `sit_floor` | censer ✗, staff ✗ | ✗ |
| + gladiators and arena keepers | melee clips | weapons ✓ | ✓ armed, ✗ unarmed (§5) |
| hamlets: salt rakers | none | rake ✗ | ✗ raking |
| hamlets: lumber (felling, sawpit, charcoal) | `ual_chop` | axe ✓, saw ✗ | ~ |
| camps: hunter, gatherer, hidemaker, shaman, tackmaker, cartwright | bow clips, `collect`, `ual_repair` | knife ✗, drum ✗ | ~ |

## 4. Events

| Event (where) | Clips | |
|---|---|---|
| worship services, the noon sacrifice, rest-day procession (Voth SIM-ROADMAP) | walk; kneel-pray ✗, bow ✗, raise arms ✗ | ✗ |
| festival (Longsong, Xanadu seasons) | dances ✗ (UAL `Dance_Loop`, Meshy 33), cheering ✗ (Meshy has several) | ✗ |
| funeral (Dhelv MOURN, KEEP_DEAD; Voth HONOUR) | kneel ✗, lament ✗, a bier carried by four ✗ | ✗ (no wedding or funeral event exists in the sim yet) |
| market day | talk, give / take ✗, carry | ~ |
| crime: alarm, arrest, resist, jail | point and shout ✗, run, hands up ✗, restrained ✗, `sit_floor` | ✗ |
| unrest: demand, strike | shouting ✗, fist-shake ✗, picket stand ✗ | ✗ |
| raid, caravan, expedition, war (camp ventures) | walk, ride ✗, march in step ✗, melee and ranged | ~ |
| siege (later) | carry a ladder ✗, ram crew ✗, siege engines ✗ | ✗ |
| arena bouts | melee; unarmed (§5); victory and taunt ✗ (Meshy has them) | ~ |
| construction (`77-sim-6-build`) | `hammer_anvil`, `ual_repair`, `walk_carry`; hoist ✗, laying stone ✗ | ~ |
| harvest, sowing seasons | farm clips | ✓ |

## 5. Hand-to-hand

**Now**: one punch (`ual_punch`), the hits, falls and dodges. Arena gladiators, brawls (the crime system's assault),
Screamer raids with nets and lassos, and the player's own fights all want more.

**Free, already on disk** (Quaternius UAL, CC0): `UAL1:Punch_Jab`, `UAL1:Punch_Cross`, `UAL2:Melee_Hook_Rec` (the
hook's recovery, chains after `ual_punch`), `UAL2:Zombie_Scratch` (a clawing swipe: animal-folk, ghouls). Add them to
`data/clips.json` and rebuild `anims.glb`; no cost.

**Meshy's library** (154 fighting actions; fetched onto our rigged donor by `tools/meshy.py anims`, 3 credits an
action, retargeted like the rest). A set of about 24 that makes an unarmed fighter:

- guard and footwork: Boxing Practice (guard idle), ForwardLeft / ForwardRight Run Fight, Boxing Warm-up, Chest Pound Taunt
- strikes from guard: Left Jab, Right Jab, Left Hook, Left Short Hook, Right Uppercut, Left Uppercut, Right Upper Hook (they start
  and end in the same guard, so they chain)
- combos: Punch Combo 1-3, Dodge and Counter, Counterstrike
- knees, elbows, kicks: Elbow Strike, Boxing Guard Step Knee Strike, Spartan Kick (front push kick), Roundhouse Kick, Leg Sweep
- throws: Over Shoulder Throw, Grip and Throw Down (one-sided: the thrown partner needs a paired fall, below)
- defence and reactions: Block3-Block6 (unarmed guards), Face Punch Reaction, Face Punch Reaction 1, Slap Reaction, BeHit FlyUp

About 72 credits for the set; the flashier kicks (Lunge Spin Kick, Rising Flying Kick, Backflip and Hooks) are left
out unless a culture wants them (a Kung Fu monk order would).

**Two-person contact** is the hard part: throws, grapples, arrests and the Screamers' nets need a pair that meets
(attacker and victim in step). No library has paired clips we can use; the plan is the two-hand solve's approach:
the victim plays a hit or fall clip timed to the attacker's contact event, and a short reach pass puts the attacker's
hands on the victim's shoulders or wrists. Clip data gets an event (`contact: [t, hand, target joint]`) the way bow
clips have `nock`.

**Culture flavour**: gladiators (Voth's arena) box and wrestle; the Order of Historians and the Longsong monks would
suit a kung-fu set; the Iron Republic's drill wants a bayonet and rifle-butt set (the long-gun props exist).

## 6. Sources for the rest

- **Meshy** covers gestures and social life well: bows (Formal Bow, Gentlemans Bow), waving, cheering, clapping, pointing,
  talking (Talk Passionately, Stand Talking Angry, Shouting Angrily, Angry Stomp, Finger Wag No, Shrug, Scheming Hand
  Rub), kneeling (Kneel on One Knee and Stand), sitting and lying variants, sleeping (Sleep on Desk, Sit and Doze Off),
  33 dances, 15 spell casts (the Geomancers and the Machine Talkers' Call), Skip Forward (children), Female Walk Pick
  Put in Pocket (pickpocket), Head Hold in Pain, Catching Breath. It has almost no trades: no rowing, riding,
  cooking, sawing, sweeping, writing, praying or fishing.
- **Made clips** (`make_pieces.derived_clips`, as dig and hammer at anvil were made): a base pose from a captured clip
  (standing idle, sit, kneel, crouch) and the arms posed by a two-bone solve frame by frame round the tool's path.
  This is the way for every trade gap: stir (pot, vat, dye), knead, oven peel, saw (one-man, two-man, sawpit), plane,
  rake, sweep, scrape a hide, weave (shuttle and beater), write and read (seated, quill and book), cast a net and haul
  it in, line fishing, mend nets, row and paddle (seated, both arms), pole a barge, stoke with a shovel, pour, milk,
  churn, lead by a halter, kneel and pray, prostrate, raise both arms (invocation), hands up, hands behind the back.
- **Riding** needs a rider base pose (seated astride, legs round a girth width from the mount's tack anchor:
  `KratorFauna.profile` saddle) and the mount's gait driving a small hip and spine sway; reins in the hands. The
  Riding branch's seats (`claude/clever-rhodes-cb3fec`, not on main) give the passenger side.
- **Children** need bodies before clips (MakeHuman's age slider stops at adults here).

## 7. Props to add (`tools/make_props.py`)

From the trades' tools and the gaps: knife, cleaver, ladle, wooden spoon or stirring paddle, peel, shears, spade,
shovel, rake, saw (one-man and two-man), adze, maul and chisel, scraper, shuttle, net, fishing rod, oar, pole, goad,
halter rope, sack, crate, basket (round 4), cart (round 4), book, scroll, quill, coin purse, censer, staff, drum,
lancet and mortar. Each in the grip frame (+Y along the handle, +Z the fingers, +X out of the palm), like the 27 now.

## 8. Order of work

1. **Done (2026-11-25).** `data/activities.json` with today's clips (sections 2-4's ✓ and ~ rows), the lookup in both
   runtimes (`KCHAR.activity`, `KChar.activity`; 1568 golden cases), the unmapped list (`tests/check_activities.py`:
   none unmapped; 39 entries marked `gap`), and Longsong's figures on it (its `CLIP()` reads the table). Voth's
   citizens are not on it yet: they are the next consumer.
2. **Done.** The free clips: UAL's jab, cross, hook recovery, scratch (`claw_swipe`), dance, spell cast and held
   ready, formal walk, leaning on a rail (`lean_rail`), nod. The table uses them (CHAM and FESTIVAL dance, SOCIALIZE
   nods, LOAF leans).
3. **Done.** Hand-to-hand from Meshy: the 30 actions of §5 (90 credits: 3 each; Boxing Warm-up and Block6 left out,
   Block3-5 in), group `unarmed` ("Hand to hand") and three hit reactions; BRAWL and HURT in the table, FIGHT and
   TRAIN with a `brawler` role. The contact event: `contact: [[t, end, target], ...]` on 22 strike and throw clips,
   found by `tools/contacts.py` (forward kinematics: the striking hand's, foot's, elbow's or knee's reach peaks;
   a single strike keeps one, a throw its grip); the figure calls `onContact` (JS) and emits `contact` (Godot) as the
   clip passes each. Not yet: the victim's timed reaction and the reach pass onto them (a game's, or the next step).
4. **Done (2026-11-26).** The social and ceremonial set from Meshy, 19 actions (57 credits), group `social`: formal and
   courtly bows, kneel on one knee, agree, shrug, wave and big wave, orate, talk with open hands, argue, shout, three
   cheers, a seated clap, a fist pump, a joyful dance, answering seated, an angry stomp (Meshy's pop and hip-hop
   dances left out). The table uses them: PRIEST orates, SELL calls with open hands, WORSHIP and HONOUR kneel and bow,
   FESTIVAL cheers and dances (claps on a bench), DEBATE answers and argues; new GREET, ARGUE and CHEER. Still gaps:
   prostration, raised arms, head-in-hands lament, standing applause, each culture's folk dances.
5. **Done (2026-11-26).** Made clips for the trades (`tools/trade_clips.py`, derive `trade`): cook and stir, a sack
   on the shoulder (walking), give, take, write and read (at a desk), kneel and pray, row and paddle, sweep, saw, weave
   at a loom, cast a net, scatter feed, lead a beast (walking), milk: 16, on the idle, the chair, the stool or the walk.
   The table plays them (COOK, HAUL, BUY, SELL, STUDY, WORSHIP, FISH, FISH_SHORE, HOUSEWORK, carpentry, LOG, WEAVE, FEED,
   HERD, STABLE; new ROW and MILK). The hands that would hold a tool close into fists: the props are owed (section 7:
   ladle, sack, quill, book, oars, paddle, broom, saw, net, feed bag), and so are a desk, a loom and a beast to work at.
6. Riding (a made rider pose per tack anchor), then two-person carries (bier, crate, ladder), then children.

Each step: check all six bodies in the Animation Lab, keep the Godot twin in step, and add the new clips to the
review ledger so the owner marks them like the rest.
