## 5u. An Earth biome forked into a Krator one: the Hykkousoi hinterlands (k-guilin, Oct 2026)

`biomes/guilin` was Earth's South China karst (Guilin's towers and Shilin's stone forest on one plain), placed nowhere.
The owner froze it as a reference and asked for Krator's version: the inland tower karst behind the NW bay, on a polygon
they drew on the scale model, keeping guilin's species and adding the bay's. Built in one session as `biomes/k-guilin`.
What held up, and what cost a round:

- **Survey the polygon before the plan, and let it overrule the Earth model.** `tools/scale-model/extract_region.py` on the
  live artifact (read the page with the Artifact tool, export the `regions` and `settlements` collections with
  ArtifactData `out_dir`), then a band survey (height bands, thirds, the water bodies, the rivers, the settlements). The
  Earth source said "humid subtropical, 19 °C, 1 atm"; the model said a +31 °C savanna under 1.8-1.9 atm round a
  3,600 km² lake, with an arcology (Trigon) on its shore. The plan's stage came from the survey (the lake, a seasonal
  wadi in place of the Li, the page set at a named pixel), not from the Earth page.
- **Ask what the model cannot say, early and batched, with a recommendation each.** One four-question round settled the
  spelling (the brief and LORE disagreed: LORE won), what the water body is (fresh, not a sea arm), where the 3 km page
  stands, and whether to read a sibling kit in place. Everything else had a sensible default stated in PLAN.md.
- **"Match the sibling" means its numbers, not its look in general.** nwbay's stacks are KSTACKS towers 42-132 m at
  R = H/2.7; the fork's towers take exactly that (guilin's were 90-250 m), and the towers that stand in the lake carry
  nwbay's waterline notch. Read the sibling's stage code for the rule it actually uses.
- **Reading a kit in place when it never opened a registry.** nwbay's fragments run without `BIO.kit`; on another kit's
  page their item names (trunk2, fungus, bark5) would land in the default registry. Two one-line fragments of the
  reading kit, `BIO.kit('nwbay')` before and `BIO.kitEnd(NWBAY)` after the borrowed fragments, give it its own registry
  and wrap its exports; its pack is read in place too (`matlib_pack.fragment(<its dir>, '<its key>')`), keyed as its
  species file asks KMAT. Place the borrowed species with YOUR zones and THEIR maker (`NWBAY.make`, then
  `NWBAY.plantTrees` grows them as its variants); a species that reads a field the host lacks (nwbay's cliff fig reads
  `karst` for its rim) gets that field bound from your zones, with the same meaning.
- **What the owner's review caught: roots in the air.** A tree on a dome-topped stack whose root spread reaches past the
  rock hangs in the air. Measure each tree's REACH (the cliff fig's plate buttresses on lobes: 6.3 x its bole) against the
  drawn top at 16 angles, recentre inward, reject when nothing fits, and check it after planting with the bole actually
  drawn. A borrowed kit's variants pick their bole from the band whatever the height, so the estimate must be the band's
  maximum, not a height ratio (an estimate from height left 45 of 222 figs failing). Then measure how much room the tops
  have before promising a species on them: these domes held at most 10 m, so the figs moved to the towers' feet (the
  owner's choice of three options put to them).
- **Borrowed trees are a separate list.** Keep them out of the kit's own `TREES` (its checks count species by index) and
  give them their own host check with negatives (all present, figs at a rim, none out of its zone, a giant moved onto a
  tower's top fails).
- **The shared sky changes every raw hex colour.** guilin's far plain ring (`MeshLambertMaterial({color: 0x56663e})`) was
  tuned for a 1.3 sun; under the shared sky's 2.3 sun it rendered near white, and from afar the page sat on a white
  plate. Convert hand colours to linear (`new Color(hex).convertSRGBToLinear()`) as the vertex colours already were, and
  look at the far view after swapping the sky. A red `MeshBasicMaterial` swap in the browser pane found it in one step
  (the raycaster was no help: the host owns the camera).
- **Swapping a borrowed sky and night for the shared one** is three host fragments (`89a` ATMOS.bindHost, `89s` the sky,
  the cloud shade and `ATMOS.bindWeather`, `89w` the water's skylight from `SKY.scene`), `KHOST.on(skyView,'view')` and
  `draw: () => SKY.render()` in the take; the old night check becomes a sky-at-this-pixel check with a negative.
- **A big lake on core/water**: one `WATER.open` over the page's box with its bed baked from the floor and the shore flood
  seeded from the north rim (`seeds: {edge, sides: 'n', points}`), and a flat far water a hair under it, masked off over
  the page's box and the land. The far plain ring then has to dip under the far water where the lake runs on.
- **Never give up a shared lock early.** A wait loop that "breaks after N tries" and then runs anyway also releases a
  lock it never took. Wait as long as it takes, and remove only a lock you created.
