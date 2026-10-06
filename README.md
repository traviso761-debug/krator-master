Note for all builds: when creating new flora or fauna, tag by biome (arid/mild/wet, hypertropic/tropic/temperate/cold, abyssal vs non, riparian vs non vs both), and harvestability/edibility. If making new flora to be part of a park or compound, don’t make it part of the building: make it a separate plant, with tags, then place it - if making a new building set without any biome specified, make a placeholder and expect it to be replaced later. When making furniture, tag by culture and type (table, chair etc); include outdoor furniture and decorations (fountains, statues, benches etc) as furniture for this purpose, tagged indoor, outdoor, or both. When making buildings, tag by culture, type (civic, market/shop, tavern/inn, industry, farm, single-family dwelling, multi-family dwelling, infrastructure, religious, funerary; buildings can have more than one tag eg a funerary temple would be funerary+religious). Keep dependencies as segregated as possible; the idea is it should be easy to swap in one culture's buildings or one biome’s flora without affecting anything else.  Modular is better! It should be as easy as possible for an agent to identify what components need to be exported to place an object in a different artifact.

Write code with an eye to an eventual port to Godot. We want new builds to reference core modules as much as possible rather than building bespoke systems for each build.

When placing streets, paths, and highways, make sure they connect to existing network unless otherwise specified. Ask if unclear.
By default, builds should use the standard Krator skybox with gas giant and sun, +/- relevant local details (distant mountains and volcano position, etc). This will eventually be replaced with a more fully rendered open world.
Open water (bays, lakes, the sea) uses the shared wave field, and standard (PBR) materials take their reflections from the build's own sky: both come from `core/atmos` (`#include <atmos_waves>`, `ATMOS.skylight`; `core/atmos/README.md` says how to take them). Do not write a build's own wave sum or environment map.

**DEV TOOLS**
Add inspector tool to all builds that is toggleable; when on, mousing over shows top level name of asset, classification (building vs flora vs furniture vs life layer etc), tags (biome, culture, .
Add polygon tool that allows user to create copy/pasteable coordinates for debugging and object placement.



**Life/simulation layer**
When building life layer, Voth currently has the most complete example. Its pathing layer should be incorporated into all new builds as soon as life layer is being designed. It also has the most complete and comprehensive collision system which can be used as an example. Never encode a world rule solely in the visual implementation if it could exist as simulation data!

Bad:

if (x > -500 && x < 200 && faction === "screamer") {
    spawnRaid();
}

Good:

Screamer faction
    territory: North Crater
    hostility: Player
    behavior:
        raid hostile settlements

Bad:

merchant walks to this coordinate

Good:

Merchant
    preferred activity: TRADE

Market
    activity: TRADE
    capacity: 20

Bad:

Mav's gatherers walk to these four coordinates.

Good:

Gatherer
    activity: GATHER_FOOD

Jungle region
    resource: FRUIT
    gatherable: true

That is the difference between a procedural scene generator and a procedural world simulator.

**Furniture that is not always drawn is data first.** When a build draws furniture only near the camera (interiors
streamed in and out, anything planned on demand), the drawing is never the furniture's only home. Always:
1. **Records apart from the drawing.** Each building's plan and pieces are a record (id, key, variant, seed, pose,
   room, type, job), computed once by a pure function of the building's inputs, kept whatever is drawn, and read by
   anything that needs them (the simulation's slots, an export) without waiting for the camera.
2. **A camera-independent index.** Every record exists without anyone looking: baked headless into a committed JSON
   file the build inlines (fingerprinted per building, so a stale entry is recomputed instead of trusted), with an
   idle-time fill for what the bake lacks. The lights the pieces carry come from the records too.
3. **Edits as an overlay.** Changes (the owner's, later the player's) are kept as deltas keyed by piece id, applied
   to every read of a record, so they survive a building being dropped and rebuilt; a delta names its piece's key and
   is skipped, not misapplied, when the catalog has changed under it.
Mav's Refuge is the worked example (`settlements/mavs-refuge/src/57a-interiors.js`, `bake_interiors.py`).

Give people and creatures a schedule, or at least the scaffolding for one, even if night/day is not implemented yet. A dummy schedule can have 'null' or the same activity for every hour.
Give them a primary faction (eg, Beast Riders) plus sub faction (eg, Quetzal Tribe) and a job (merchant, farmer, etc)

## Where things are
**Building on Windows:** a `build.py` must name `encoding='utf-8'` on every `open()` (and `newline='\n'`); without it
Python writes the local code page and the page's em dashes become byte 0x97 (Locus shipped so once, Oct 2026). Girder,
Mav's Refuge, Voth and Yuni's `build.py` still write without it.

There is an included skill file, painting-to-3d-world. Read before starting a new settlement or building kit, or when making large change or expansion to existing ones. When pushing changes to the main branch, reread the skill file, and update with any useful lessons from the build, including known pitfalls, ways to overcome them, and ways to better organize and implement builds. If you run into a particularly aggravating or repeat problem and solve it, note it in the file readme so future sessions without context can pick up the trick and note it in the skill file.

`GODOT-PLAN.md` is the repo-wide plan for auditing every module, quarantining the
browser-native code and porting the rest to Godot; read it before adding a core module or
starting a build. `INDEX.md` lists every build and links to each build's own index. `CLAUDE.md`
holds the working rules for agents. `VISUAL-BAR.md` is the look every world is judged against:
the pillars, the banned outcomes, the measured gates, the delta loop and which engine carries
each part; read it before a new build or a lighting or texture pass. Settlements are in `settlements/`, building
kits in `kits/`, biomes in `biomes/`, shared code in `core/`, and open worlds (a region of the scale model at 1:1,
streamed, with the biome kits' flora, the built settlements placed in it as tiles baked from their own pages, and
highways between them) in `openworld/` (`openworld/little-demo/README.md`). The gallery of every
built world is published from `gallery/` (see `gallery/README.md`).

**Keep the Krator Worlds gallery current.** Update it automatically only when you
push a brand new settlement, kit or biome to `main` (or change the location of an old one's
.html render). Add the new pages to `ENTRIES` in `gallery/build_gallery.py` if they are
not listed, run `python3 gallery/build_gallery.py`, and republish `gallery/site/` to
the Krator Worlds artifact at the URL in `gallery/README.md` (same URL, every file
in `gallery/site/worlds/` attached). Do not publish a new artifact.

- A fix delivered to one settlement or biome: republish only that build's files.
- A change wider than that (several builds, shared `core/` code, a refactor): ask
  whether to update the gallery. Do not republish unasked.

When making changes to an existing or in-progress build, particurly after change that has wide impact or when trying to revise broken geometry, provide a link to the local version of the .html render or a mock.html.
