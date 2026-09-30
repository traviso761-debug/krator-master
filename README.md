Note for all builds: when creating new flora or fauna, tag by biome (arid/mild/wet, hypertropic/tropic/temperate/cold, abyssal vs non, riparian vs non vs both). If making new flora to be part of a park or compound, don’t make it part of the building: make it a separate plant, with tags, then place it - if making a new building set without biome specified, make a placeholder and expect it to be replaced. When making furniture, tag by culture and type (table, chair etc); include outdoor furniture and decorations (fountains, statues, benches etc) as furniture for this purpose, tagged indoor, outdoor, or both. When making buildings, tag by culture, type (civic, market/shop, tavern/inn, industry, farm, single-family dwelling, multi-family dwelling, infrastructure, religious, funerary; buildings can have more than one tag eg a funerary temple would be funerary+religious). Keep dependencies as segregated as possible; the idea is it should be easy to swap in one culture's buildings or one biome’s flora without affecting anything else.  Modular is better! It should be as easy as possible for an agent to identify what components need to be exported to place an object in a different artifact.

Add inspector tool to all builds that is toggleable; when on, mousing over shows top level name of asset, classification (building vs flora vs furniture vs life layer etc), and tags.
Add polygon tool that allows user to create copy/pasteable coordinates for debugging and object placement.
When placing streets, paths, and highways, make sure they connect to existing network unless otherwise specified. Ask if unclear.
By default, builds should use the standard Krator skybox with gas giant and sun, +/- relevant local details (distant mountains and volcano position, etc).

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

There is an included skill file, painting-to-3d-world. Read before starting a new settlement or building kit, or when making large change or expansion to existing ones. When pushing changes to the main branch, reread the skill file, and update with any useful lessons from the build, including known pitfalls, ways to overcome them, and ways to better organize and implement builds. If you run into a particularly aggravating or repeat problem and solve it, note it in the file readme so future sessions without context can pick up the trick and note it in the skill file.

## Where things are

`INDEX.md` lists every build and links to each build's own index. `CLAUDE.md`
holds the working rules for agents. Settlements are in `settlements/`, building
kits in `kits/`, biomes in `biomes/`, shared code in `core/`. The gallery of every
built world is published from `gallery/` (see `gallery/README.md`).

**Keep the Krator Worlds gallery current.** Whenever you push a new or changed
settlement, building kit or biome to `main`, update the gallery in the same
session: add the new page to `ENTRIES` in `gallery/build_gallery.py` if it is not
listed, run `python3 gallery/build_gallery.py`, and republish `gallery/site/` to
the Krator Worlds artifact at the URL in `gallery/README.md` (same URL, every file
in `gallery/site/worlds/` attached). Do not publish a new artifact.
