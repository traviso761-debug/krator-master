# Hazardous terrain: research and proposal (2026-10-26)

Research only; nothing built. What exists: danger rides on `trap.danger` (`core/biome/37-core-traps.js`); a `hazard` key is
proposed, not built (`core/tags/PROPOSAL.md`, "A hazard key"; Korona `KNOWN_ISSUES.md`); Korona's pit has `KORONA.pitState`;
the geyser kit has real periods; `KWALK` knows floors and blocks only; crops carry `hazard: 'poison'` as free text.

## The record: `tags.hazard` (`[G data]`, registered in `core/tags` before it is drawn)

```
hazard: {
  kind:   'heat'|'cold'|'gas'|'acid'|'poison'|'fall'|'pit'|'thorn'|'grab'|'drown'|'sink'|'slip'|'crush'|'hunter',
  effect: 'burn'|'freeze'|'suffocate'|'poison'|'corrode'|'bleed'|'hold'|'drown'|null,
  danger: 0..1,            // as the traps use it: .3 hurts, .7 holds a person, 1 kills
  dose:   number,          // effect units per second at the core (a build-up meter fills at this rate)
  shape:  {type:'sphere'|'cyl'|'box'|'poly', r, h, pts}, // metres, from the record's `at`; y0/y1 for a band
  falloff:'none'|'linear'|'smooth', // dose from the core to the edge
  cycle:  {period, on, ramp} | null,   // s; phase from KRAND.hash(id), never a draw (KTRAPS.phase)
  trigger:{by:'step'|'weight'|'near', mass, reset} | null, // kg, s: pits, crusts, snare plants
  move:   {speed, sink, slip} | null,  // speed factor 0..1, sink m/s, slip 0..1 (mud, sand, ice)
  nav:    {travel, enter, avoid, layer}, // Godot's terms: travel multiplier, enter cost (m), avoid = never path
  tell:   {colour, fx, sound, sign}     // the readable warning (see 12)
  stateFn:'KTRAPS.state'|'GEYSER.state'|'KORONA.pitState'|null // the pure function that says "now"
}
```

Defaults by kind live in the vocab (`52-core-tags-vocab.js` `keys.hazard:'object'` plus a `hazardKinds` table), as
`KTRAPS.make` does. Units: metres, seconds, kilograms, degrees C. Export: every record goes out in the tags export
already; the Godot importer makes one `Area3D` per record (shape from `shape`, `monitoring` on, signals feeding a
status component), and writes `nav` into the navigation pass. Queries: `KTAGS.query({hazard:true})`,
`KHAZ.at(x,y,z,t)` (the records covering a point, their dose now), `KHAZ.state(rec,t)`.

## Features, ranked

**1. The hazard key and `KHAZ` queries. [FINAL REBUILD]** The key above in `core/tags`, plus a small `core/hazard/20-core-hazard.js`
(`[G data]`): `make`, `at`, `state`, `dose`. Adds one question every walker, quest and NPC can ask; Korona's `reg` is one line.
Cost: a core/tags change, so every build listing the vocab rebuilds (35+), which the final rebuild does anyway. Godot: `Area3D`
per record, a `KHazard` autoload with the same functions (`ktags.gd` pattern). Effort S-M.
Sources: [Area3D](https://docs.godotengine.org/en/4.2/classes/class_area3d.html), [Unreal Nav Modifier](https://dev.epicgames.com/documentation/en-us/unreal-engine/overview-of-how-to-modify-the-navigation-mesh-in-unreal-engine).

**2. Hazard overlay and inspector. [FINAL REBUILD]** A host toggle draws each record's shape tinted by danger and kind, and
the inspector shows the record and its live state. Adds a way to judge placement on the pages before any gameplay exists.
Cost: host only (`core/tags/53-core-tags-host.js`, the inspector `93-host-inspect`). Godot: a debug draw of the Areas. S.
Source: [Monster Hunter's hazard map filter](https://monsterhunterworld.wiki.fextralife.com/hazards).

**3. One clock for cyclic hazards. [FINAL REBUILD]** Generalise `KTRAPS.state`/`phase` to `KHAZ.state(rec,t)`: geysers,
vents, fumaroles, tides, pit membranes, all phased by id hash. Adds hazards that are readable because they repeat
(wait, warn, erupt). Cost: low; the geyser kit and the Throne point their `stateFn` at it. Godot: the same maths in GDScript
toggling `Area3D.monitoring`. S. Source: [readability, telegraph >= 500 ms](https://www.theseus.fi/handle/10024/900621).

**4. Navigation costs in the walk export. [FINAL REBUILD]** `KWALK.export()` gains a `zones` list from `hazard.nav`, so NPC
paths go round acid pools and through mud only when shorter. Cost: `core/walk/20-core-walk.js` export plus its test. Godot:
`NavigationRegion3D` `travel_cost`/`enter_cost` and `navigation_layers` (avoid = a layer agents do not ask for). M.
Sources: [NavigationRegion3D](https://docs.godotengine.org/en/4.2/classes/class_navigationregion3d.html), [NavArea_Obstacle](https://docs.unrealengine.com/5.0/en-US/PythonAPI/class/NavArea_Obstacle.html).

**5. Movement surfaces.** Mud, sand, scree, ice, deep snow, bog, quicksand as surface records (`move`) painted from biome
data on `core/mask` (slope, wetness, grain). Adds terrain that tires and slows, the core of Death Stranding's walking. Cost:
`core/walk` reads `move`; biome kits paint. Godot: a surface lookup under the character; nav `travel_cost`. M.
Sources: [RimWorld path cost 13/(13+c)](https://rimworldwiki.com/wiki/Soil), [Death Stranding](https://www.giantbomb.com/games/3030-54232/).

**6. Status build-up.** Doses fill a meter per effect that drains when out of range; full meter applies the effect. Adds
tension without instant death, and armour/remedy hooks (crops' poison, cures). Cost: plain functions in `core/hazard`.
Godot: a `StatusComponent` node. M. Source: [Elden Ring status](https://eldenring.wiki.fextralife.com/Status+Effect).

**7. Ambient temperature and air.** A field from altitude, hour, weather (`core/atmos`) plus hazard sources (lava, vents,
CO2 hollows), read as heat, cold, suffocation. Adds BotW-style regions where gear matters. Cost: `core/atmos` gives
`tempAt`; hazards add. Godot: the same function per tick. M.
Sources: [BotW temperature](https://zeldawiki.wiki/wiki/Temperature), [Valheim cold and wet](https://gamewith.net/valheim/article/show/25091).

**8. Thin ice from the climate.** Ice thickness h = a*sqrt(freezing degree days) per lake; under ~10-15 cm a `sink` hazard
with a crack tell. Cost: the `core/water` ice kind already on the Stage 1 table; nwouterwall first. Godot: a weight trigger. M.
Sources: [Stefan's equation](https://en.wikipedia.org/wiki/Stefan%27s_equation), [safe ice](https://www.theweathernetwork.com/en/news/weather/seasonal/how-thick-does-ice-have-to-get-to-be-safe-to-walk-or-skate-on).

**9. Triggered ground: pits, crusts, collapse.** `trigger` on records: Korona's punji pit, sedesert salt crust, crevasse
bridges, undercut banks, with reset times. Cost: `KTRAPS` and the kits. Godot: `body_entered` plus mass check. M.
Source: [DF cave-ins](https://dwarffortresswiki.org/index.php/Cavein).

**10. Moving weather hazards.** Ash storms, blizzards, acid rain as moving volumes from `core/atmos` weather, exposure
damaging cargo and people (timefall). Cost: weather export gains a hazard record. Godot: a moving `Area3D`. M.

**11. Hunters as hazards.** Stalkers under sand, man-eaters: a `hunter` record bound to a fauna id, with a tell (sand
ripple). Cost: `kits/mechs`, fauna motion. Godot: AI, not an Area. L.

**12. A tell palette.** One table of colours, particles, sounds and signs per kind (heat orange glow, gas yellow-green
haze, acid lime, thin ice white cracks), checked by a test that every record has a tell. S.
Source: [environment language](https://80.lv/articles/defining-environment-language-for-video-games/).

## Why 1-4 go into the final rebuild

They are the core changes (`core/tags`, `core/hazard`, `core/walk` export, the host) that every biome must be rebuilt to
take, and the final rebuild is that rebuild; they are records and readers only, so they move no look, and the hash baseline
changes only where a kit registers hazards. 5-12 build on them later, one kit at a time.
