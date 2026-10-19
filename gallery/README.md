# gallery/

The shareable gallery of every built world, in four parts (below); it starts at https://claude.ai/artifact/UhTfQ2kioZEbrzZR1agHv9

It is shared as anyone-with-the-link.

## Four artifacts, the worlds by the alphabet (2026-10-16)

The owner (2026-10-16): the world parts are split alphabetically and titled by their range. Today:

- **Krator Worlds A–H**: https://claude.ai/artifact/UhTfQ2kioZEbrzZR1agHv9 (was "Krator Worlds"; anyone with the link)
- **Krator Worlds I–S**: https://claude.ai/artifact/3Q5T4Pswhnf1Hx51xDRV3z (was "Krator Worlds II")
- **Krator Worlds V–Z**: https://claude.ai/artifact/SGLsybd5LJJB6DySmToPKM (new 2026-10-16; private until shared from its page)
- **Krator Biomes and Objects**: https://claude.ai/artifact/CaKSU16sowMsexa3djES5g (the biomes and objects on their own)

One artifact version holds 256 MiB and no file over 16 MiB (build.py writes no file over 15 MB,
`tools/textures/matlib_pack.py` PART_LIMIT). After `build_gallery.py`:

```
python3 gallery/split_site.py --alpha --alone "biome,objects=Krator Biomes and Objects"   --urls "https://claude.ai/artifact/UhTfQ2kioZEbrzZR1agHv9,https://claude.ai/artifact/3Q5T4Pswhnf1Hx51xDRV3z,https://claude.ai/artifact/SGLsybd5LJJB6DySmToPKM"   --link "Krator Biomes and Objects=https://claude.ai/artifact/CaKSU16sowMsexa3djES5g"
```

`--alpha` sorts the world and kit pages by name (a leading "The" or "A" ignored), fills as few parts as fit under 250 MB,
each an even share, and titles each by its first and last letter. A part keeps its own copy of every pack its pages load
(a pack two parts share is in both). `--urls` gives the parts' artifacts in order; each index links to the others under
their range titles. **A range moves when pages are added**: the URLs stay in order (A… first), so republish every part
whose pages changed, with nulls for the files it no longer holds.

Publishing a re-split, learned 2026-10-16:
- copies between artifacts (`files` {artifact, path}) count toward a call's 64 MB, and a version's 256 MiB counts the files
  it keeps: an artifact near the cap must drop files before it takes new ones;
- when two parts each hold packs the other needs, stage the packs in a part with room first, then update each part
  (copies first, nulls with them), then remove the staged copies;
- an HTML page cannot be copied between artifacts: download it (read with a `path`) and upload it.

`worlds/voth.html` (the Voth city plan, 19.3 MB) is over the 16 MB per-file cap: Krator Worlds V–Z carries the live
2026-10-15 copy (11.9 MB) until the page is slimmed or its pack moved beside it.

## Tongues of Krator link (2026-10-15)

`index.template.html` links the Tongues of Krator artifact (https://claude.ai/artifact/FFEn2MEBPxMgqPJkcV6sNt, the
page `lore/tongues-of-krator.html`) under the Scale Model. Only Krator Worlds' index was republished with it (version
75); Krator Worlds II and Krator Biomes and Objects pick it up at their next rebuild.

## Character lab links (2026-10-16)

`index.template.html` links the two labs of `core/charactermodels` after the Throne: the Cosmetic Lab
(https://claude.ai/artifact/VaNLVcaDZaYHAHpEgxKsSw) and the Animation Lab (https://claude.ai/artifact/WStXx16aNHT63stCoz331x).
They stay their own artifacts (each loads about 240 MB of pieces beside its page) and are not built by
`build_gallery.py` (core/ is not discovered). They were published private: a gallery viewer opens them only once the
owner shares them (each page's Share menu). Only Krator Worlds A–H's index was republished with the two links (version 86, the
published index edited in place); the other parts pick them up at their next rebuild.

## Update it

```
python3 gallery/build_gallery.py        # rebuilds every listed build, then writes gallery/site/
```

Then ask Claude to republish `gallery/site/index.html` to the URL above, with
every file in `gallery/site/worlds/` attached. One publish carries at most
64 MB; the site is larger than that, so publish it in two or more calls to the same
URL (files a call leaves out are kept, so later calls only need the rest). `gallery/site/` is not committed.

To add a world, add a line to `ENTRIES` in `build_gallery.py`. The page itself
is `index.template.html`; the script fills in the entry list.

A new build is listed even before it has a line (2026-10-07): a build in `settlements/`, `openworld/`, `biomes/` or
`kits/` with no page in `ENTRIES` gets its pages listed, tagged new. One page joins its kind's section; several make
a section of their own after it, named from the pages' `<title>`s and
described by the first paragraph of the build's `README.md` or `INDEX.md`. An `ENTRIES` line replaces all of that
(section, name, blurb); `UNLISTED` keeps a build out; `--no-discover` lists `ENTRIES` only. Builds that already have
a page listed are never extended, so pages left out of a listed build (Iziz's `w-a`, the Port's `lb*`) stay out.

Each section is in alphabetical order by name, a leading "The" or "A" ignored, whatever the order of `ENTRIES`.
The Ancients kit's pages (`kits/ancients/`, but not its arcologies) are the section `ancients`, "Ancient city kits".

## The Throne: its own artifact (2026-10-07)

The Throne's eleven stations (`biomes/throne`) are published as their own artifact, https://claude.ai/artifact/TJaH7TYHoZf4p56C1i5xcX ("The Throne
Stations"), which the Krator Worlds index links to under the scale model. Together they are too big for this one: an
artifact version holds at most 256 MB, and Krator Worlds was about 230 MB.

`build_gallery.py` lists the Throne in `ELSEWHERE`: it leaves it out of `gallery/site/` and keeps it in any other
`--out` site (the LAN host's).

To update it:

```
python3 gallery/build_throne.py --build     # rebuilds the eleven stations, writes gallery/throne-site/
```

Then publish to the URL above:
- `gallery/throne-site/index.html` as the page;
- every file in `gallery/throne-site/worlds/` attached: eleven pages of 0.35 to 0.52 MB, and the shared library maps
  `throne.tex.throne.js` (13.7 MB) and `throne.tex.hyperjungle.js` (3.0 MB), about 20 MB in one call.

The pages load the maps through `<script src>` tags. Without them a station runs on its procedural maps and says so on
the console.

## The Ancients and the Port: their own artifact (2026-10-07)

The Ancients kit's pages (the city kits and the arcologies, `kits/ancients`) and the Ancient Port (`settlements/port`)
are published as their own artifact, https://claude.ai/artifact/As2ZG7F8ee3Dx4Dr87FkR1 ("The Ancients and the Port":
61 pages, 103 MB with their two shared library packs), which the Krator Worlds index links to under the Throne. With them
Krator Worlds hit the artifact's 256 MiB a version once Locus and Mungo took the material library.

`build_gallery.py` lists both builds in `ELSEWHERE`: it leaves their `ENTRIES` lines out of `gallery/site/` (and does not
build them for it) and keeps them in any other `--out` site (the LAN host's). Their names, blurbs and sections stay in
`ENTRIES`. To update:

```
python3 gallery/build_ancients.py --build     # rebuilds kits/ancients and settlements/port, writes gallery/ancients-site/
```

Then publish `gallery/ancients-site/index.html` to the URL above with every file in `gallery/ancients-site/worlds/`, in
two calls of under 64 MB (the shared packs `ancients.tex.ancients.js` and `port.tex.port.js` go in the first). The
artifact is private until shared from its page's Share menu.

## Girder Hero (MADE)

`worlds/girder-hero.html` is in `ENTRIES` again (2026-10-07). Its page is not one a `build.py` writes: `MADE` in
`build_gallery.py` names the command that makes it (`build_hero.py --slim --out hero/dist/girder-hero.html`, run in
`settlements/girder`; `hero/dist/` is not committed). A full rebuild had dropped the card because the line was missing.

## Published (2026-10-02)

Rebuilt with the Ys kit sheet, the Ys mockup and the nwbay biome added to `ENTRIES` (102 pages, 135.4 MB) and
republished to the URL above as version 36 (103 files, every page current with `main` at ff6252ed; this also
closes the 2026-10-01 item below). The publish went in three calls of under 64 MB to the same URL; files left
out of a call are kept. `gallery/site/` is a build output and is not committed; `python3 gallery/build_gallery.py
--build-missing` remakes it in about a minute.

Version 37 (2026-10-02): `worlds/iziz.html` replaced with the city on the world clock (Run time / Hold time in the
toolbar, `core/clock`), from `main` at ce6fb1ea. The index and every other page are as in version 36.

Version 38 (2026-10-02): a "Krator Scale Model" section with a link to the scale model artifact added under the header
(`index.template.html`); only the index page was republished.

Version 39 (2026-10-03): `worlds/girder.html` replaced with Girder on the material library (library textures with
the tiling break-up, leaf and flower cards, the fruit stalls, tone mapping and contact shading; `?mat=proc` shows
the old look), from `main` at 01f78aa3, with the index regenerated (Girder now 6.3 MB). Every other page is as in
version 36 to 38.

Version 40 (2026-10-05): `worlds/girder.html` replaced with Girder dressed in the full Beast Rider texture set (detail maps on the
furniture and mounts, the village dressing families, the extra cards; 12.2 MB), from branch `claude/beast-rider-textures` at d4f6c391,
with the index's Girder entry updated (size, blurb). Every other page is as in version 39. The Material Demo Kit
(https://claude.ai/artifact/PiddSxzJWKzfzRu9nycrXL) was republished the same day with the 2026-10-05 sets (version 6).

Version 41 (2026-10-05): `worlds/girder.html` replaced with Girder Hero (play as Styv, talk to Phil in the Assembly Hall;
`settlements/girder/hero/README.md`), from `main` at 5dc478e2, built with `build_hero.py --models-url girder-` because the
embedded page (20.5 MB) is over the 16 MB per-file limit: the page (12.4 MB) fetches `worlds/girder-styv.glb.txt` and
`worlds/girder-phil.glb.txt` (base64; `.glb` is not a served type). The index's Girder entry was updated (blurb, 20.0 MB,
source). `build_gallery.py` still lists plain `girder.html`; a full rebuild would put the plain page back.
That version failed in the gallery ("hero: styv: Failed to fetch"): the gallery's frame cannot fetch files published
beside a page.

Version 42 (2026-10-05): Girder Hero as its own card. `worlds/girder.html` is plain Girder again (the page committed on
`main`, 12.3 MB); a new "Girder · Hero" entry after it opens `worlds/girder-hero.html`, built from `main` at df74443b with
`build_hero.py --slim` (the models slimmed and embedded, 15.0 MB). `worlds/girder-styv.glb.txt` and
`worlds/girder-phil.glb.txt` were removed. The hero entry is not in `build_gallery.py`'s `ENTRIES` (it needs the
`--slim` build); a full rebuild leaves it out, so republish it by hand as above.

Version 43 (2026-10-05): `worlds/girder-hero.html` replaced (`main` at 0989ccf2). Version 42's page still failed in the
gallery ("Failed to fetch"): GLTFLoader fetched the models' embedded textures as blob: URLs and the gallery's frame
blocks fetch. The hero now loads them as data: images through an <img>. Checked headless under `connect-src 'none'`.

Version 44 (2026-10-05): `worlds/girder.html` and `worlds/girder-hero.html` replaced from `main` at 6728d4f6: Girder's walk
graph corrected against its walk solids (the villagers walk the galleries inside the columns), and the hero's cast and
dialogue read from `settlements/girder/hero/cast.json`. Index sizes 12.4 and 15.0 MB.

## Open (2026-10-01) — closed by the 2026-10-02 republish

The published gallery predates the 2026-10-01 known-issues sweep merged to `main` (`ed2e893`): every build changed
(LOD, night lighting, Locus bridges/paddies/grid, Yuni interiors and caravans, Abyss kit fixes, materials and
vendoring). `gallery/site/` was rebuilt (98 pages, 118.9 MB) but not republished. Republish it to the URL above.

Version 45 (2026-10-05): `worlds/ys.html` added, the Ys city at the close of phase 3 (the drowned and reclaimed Ancient
hosts with their grown pods, the bridge graph, the harbours, the river, the north-west bay biome, the foreign quarter,
the building editor), with `worlds/ys-kit.html` and `worlds/ys-mock.html` replaced by their current builds and the index
regenerated (Ys 5.9 MB), from `main` at a7f371b6. Every other page is as in version 44. One publish call.

Version 46 (2026-10-05): `worlds/mungo.html` added (Mungo, the reed-lake trade village on `core/simulation`) and
`worlds/motor-vehicles.html` (the Motor Vehicles kit, the Geomancers' dune buggy), with the index regenerated, from
`main` at 199cfdfe. Every other page is as in version 45: Locus (now on the shared core, with its buggy park), the
Locus and Eastern Abyssal kits, Reed Lake (Reed's Local), Shade (its life on `core/simulation`), the catalog, the
interiors and the eastern-abyss biome changed on `main` too and were not republished. One publish call.

Version 47 (2026-10-05): `worlds/yuni.html`, `worlds/yuni-kit.html` and `worlds/yuni-plants.html` replaced with Yuni on
the material library (24 families, the interiors included), the world clock (held; Run time) and the minimap (M), 7.3 MB
each; `worlds/krator-catalog.html` replaced with the catalog's 1520 pieces (Yuni's six interiors pieces re-harvested). From
`main` at 23ef6be7, with the index regenerated (Yuni's blurb and size, the catalog's count). Every other page is as in
version 46. One publish call.

Version 48 (2026-10-05): `worlds/mavs-refuge.html` replaced with Mav's Refuge's interiors (every lot, level room and hut
planned and furnished, kept as data with the bake inlined; real windows; interior lamps and hearths), 3.2 MB, from `main`
at b64cf395. The index changes only Mav's card (blurb and size). Every other page is as in version 47. One publish call.

Version 49 (2026-10-05): `worlds/verge.html` added (Verge, the Yuni-culture city on the abyss's rim, 2.7 MB) and
`worlds/little-demo.html` (the eastern desert at 1:1 with the biome kits' flora and its highways, 4.8 MB), with the index
regenerated. The Little Demo's six settlement tiles are not in the gallery (the frame blocks fetch): there the world runs
without its towns, and its own artifact carries them. Every other page is as in version 48. One publish call.

Version 50 (2026-10-05): `worlds/iziz-mechs.html` added (Iziz war-walkers: the Mechs kit, ten animated Iziz mechs and the
Supply Train Castra, 1.6 MB), with the index regenerated, from `main` at 8d8bf38d. Every other page is as in version 49.
One publish call.

Version 51 (2026-10-06): `worlds/ebadlands.html` added (the eastern badlands biome kit, 3.6 MB: sulphur flats, painted
badlands, a Zion canyon with a hanging-garden ruin, pine and spruce-fir to the ice; the library textures; trees as variants),
`worlds/krator-catalog.html` (1526 pieces: the badlands fruit) and `worlds/little-demo.html` (the badlands kit's flora on
the 'e badlands' overlay), with the index regenerated, from `main` after 8cf1c981. Every other page is as in version 50.
One publish call.

Version 52 (2026-10-06): `worlds/yuni.html`, `worlds/yuni-kit.html` and `worlds/yuni-plants.html` replaced with Yuni's
wild valley planted by the eastern badlands kit, its Zion side (oak, maple, cottonwood galleries, pine on the walls, hanging
gardens on the butte), 7.4 MB each, from `main` at 8ef7ea7d, with the index's Yuni entry updated (blurb, sizes). The live
index (version 51, published by another session after 1d088377) was merged: every other entry is as it was. One publish call.
Version 53 (2026-10-06): `worlds/nwbay.html` replaced with the north-west bay fixed and extended (the inside-out karst stacks
turned right way out; a tsingy of knife-edged fins with spinewands and rock bottles, a tiankeng with traveller's fans, two
cenotes, avenue baobabs; hero trees as six grown variants per species), 0.3 MB, from `main` at cf3e2206. The live index
(version 52) was kept: only the North-west bay card changed (blurb, "new"). One publish call.

Version 54 (2026-10-06): `worlds/iziz-mechs.html` replaced with the Mechs kit and its eleventh mech, the Talpa (an Ancient
tunnel borer with a rotary polybolos and crescent vanes, a rider in a saddle on its back), 1.6 MB, from `main` at 389f79c8.
The live index (version 53) was kept: only the Iziz war-walkers card changed (blurb, size). One publish call.
Version 55 (2026-10-06): `worlds/crater-drylands.html` added (the crater drylands biome kit, 3.2 MB: the fire mosaic in the
Throne's rain shadow, char, the superbloom, regrowth and old scrub from the kit's own fire model; prism mallees, pyre pillars,
frill-trees; granite kopjes; the library textures), from `main` at a2547d72. The live index (version 54) was kept: only the
Crater drylands card was added. One publish call.
Version 56 (2026-10-06): `worlds/scyvoi.html` added (the Scyvoi kit, 11.8 MB: five small and five large tents, the chief's great tent
and carved vardo, the shaman's lodge, smithy and supply tents, all furnished with a cut-away; salamanders, chariots and carts,
tethering; the Baelu fire redoubt) and `worlds/krator-catalog.html` replaced (1635 pieces: the Scyvoi furniture culture), from
`main` at 34d77bca. The live index (version 55) was kept: the Scyvoi card was added and the Master catalog card updated. One publish call.
Version 57 (2026-10-06): `worlds/crater-drylands.html` replaced with the crater drylands' live fire (F, then click, or the view
"A wildfire running": the fire runs downwind through the old fuel, burns the scrub away and leaves char and smoke), 3.3 MB, from
`main` at 843864e1. The live index (version 56) was kept: only the Crater drylands card changed (blurb, size). One publish call.
Version 58 (2026-10-06): `worlds/fauna.html` added (the Fauna kit, 0.5 MB: 48 species, every animal of Krator gathered and
tagged by biome, diet, temperament, traits, yields and life), `worlds/scyvoi.html` replaced (goats from the fauna kit, the
hidemaker's tent) and `worlds/krator-catalog.html` replaced (the Scyvoi tanning pieces), from `main` at the fauna kit merge.
The live index (version 57) was kept: the Fauna card was added and the Scyvoi card's blurb updated. One publish call.
Version 59 (2026-10-06): `worlds/shighlands.html` added (the southern highlands biome kit, 0.2 MB: the spiral biome, a cloud forest
above the cloud sea and a paramo of giant rosettes, every plant a spiral turning the same way), from `main` at the southern
highlands merge (1a34da92). The live index (version 58) was kept: only the Southern highlands card was added. One publish call.
Version 60 (2026-10-06): `worlds/fauna.html` (0.7 MB) and `worlds/scyvoi.html` (12.1 MB) replaced with the fauna quality pass
(every species reviewed and refined, surfaces on their own material families, better fur and skin maps), from `main` at ec5eb622.
The live index (version 59, the southern highlands) was kept: only the Fauna and Scyvoi cards' sizes changed. One publish call.
Version 61 (2026-10-06): `worlds/ehighlands.html` added (the eastern highlands biome kit, 1.5 MB: the cushion plateau in thin air,
everything growing toward the giant; poured cushions and the Mother Cushion, woolbacks, thorn cushions, vigil spikes, ragbark gullies, glass
towers, a cushion bog, a frozen tarn and a geyser field; ten library textures), from `main` at 10e85603. The live index (version 60) was
kept: only the Eastern highlands card was added. One publish call.
Version 62 (2026-10-06): `worlds/noahs-regret.html` added (Noah's Regret, 5.8 MB: the Ancient floating harbour aground on the
Ring Sea's south shore, Bloody Ruephus's pirate base; ring hull, flooded holds, four decks of cabins, the atrium, bridge, dining and engine
rooms, the Ancient deck buildings, all furnished, with a deck cut-away), from `main` at the Noah's Regret merge. The live index (version 61)
was kept: only the Noah's Regret card was added, after Ys. One publish call.
Version 63 (2026-10-07): `worlds/noahs-regret.html` replaced (5.9 MB: the catamaran, two hulls joined at the bow with the harbour
open astern, the liner mole and finger piers, terraced sterns, twin engine rooms, two crew messes, the greenhouse, fifteen ship's rooms;
the forecourt plaza, terraces and grand stair up to the bridge house with the bridge on top) and `worlds/ancients-interiors.html` added
(the Ancients interiors kit, 1.4 MB: fourteen ship's halls in two dresses, the ship's rooms and cabins, every room audited), from `main`
at 29f93c3. The live index (version 62) was kept: the Noah's Regret card updated (blurb, size) and the Ancients interiors card added after
the Interiors walk-through. The Master catalog card (now 1655 pieces) was not touched. One publish call.
Version 64 (2026-10-07): the index gained a "The Throne" link under the scale model, to the Throne's own artifact
(https://claude.ai/artifact/TJaH7TYHoZf4p56C1i5xcX, version 1: the eleven stations and their shared library maps, 20.3 MB,
from `main` at 3b5eec20 with the sidecar build). The index was edited from the live version 63, so its sections and
cards are as they were. No world page changed. One publish call.
Version 65 (2026-10-07): `worlds/motor-vehicles.html` replaced (0.7 MB: five vehicles of five cultures, the Geomancer
buggy, the Republic salvage crawler, the Izani six-wheeler, the abyssal caravan truck and the Post-Apoc tracked hab,
textured from the library, tracks that run), packaged with `build_gallery.bundle()`, from `main` at d6c83a43 rebuilt
(the committed page was stale against the catalog core). The live index (version 64) was kept: only the Motor
Vehicles card changed (blurb, size). One publish call. **Not replaced, for the artifact's 256 MiB a version (about
245 MB used before this):** Locus, Locus buildings and Eastern Abyssal buildings (now 13.7 MB each: Locus inlines its
library maps, about 35 MB more for the three) and Mungo (3.2 MB plus 19.7 MB of sidecars, about 20 MB more). The
live copies are the version-46 builds (untextured; their buggy is the first one). Room for them needs pages
dropped or slimmed, or Locus on sidecars (its three pages would share one set of maps).
Version 66 (2026-10-07): the Ancients and the Port moved out to their own artifact (above): their 61 cards and pages
removed, and a link section under the Throne added (`index.template.html` too). Girder Hero's card is back (its page,
16.0 MB, rebuilt with `build_hero.py --slim` from `main` at ec33b8dc), and Locus, Locus buildings and Eastern Abyssal
buildings replaced with their current builds (13.1 MB each: Locus on the material library). The index was edited from
the live version 65. Version 67: Mungo replaced (3.0 MB and its three sidecars, `mungo.tex.*.js`, 21.8 MB in all; a card's
size now counts the sidecars a page loads). The artifact is about 208 MB.
Version 68 (2026-10-07): `worlds/desert-nomads.html` (8.4 MB) and `worlds/ash-nomads.html` (8.9 MB) added (the nomad split:
the Desert Nomads' goat-hair, caidal, square and Tuareg tents, sheikh, seer and hookah tents, camels, horses and lizards; the Ash
Nomads' blue-led spire and dome tents, the chieftain's five-spired tent, the assembly under the gas giant emblem, beetles and
millipedes), `worlds/scyvoi.html` replaced (13.3 MB: Tibetan appliqué tents and halls, the shaman's ger, the cartwright's tent, bison
and cattle), `worlds/fauna.html` (0.8 MB: 51 species) and `worlds/krator-catalog.html` (1.6 MB: 1932 pieces, the Ash Nomads, the
desert nomads' pieces, training furniture) replaced, from `main` at b5badc0c. The live index (version 67) was kept: the two cards
added after Scyvoi, the Scyvoi, Fauna and Master catalog cards updated. One publish call; about 228 MB.
Version 69 (2026-10-10): `worlds/geyser.html` added (the geyser basin, `biomes/geyser`: 0.4 MB and its two sidecars,
`geyser.tex.geyser.js` and `geyser.tex.hyperjungle.js`, 6.2 MB in all), from `main` at 4c1a53d9. The live index (version 68)
was kept, its card added after the Eastern highlands. One publish call. The Voth item below is still pending.
Pending (2026-10-14, the owner): the first Voth (`voth.html`, now `archive/voth-first/`) is retired from the gallery, and the
city plan on `core/city` (`settlements/voth/dist/voth-city.html`) is now simply "Voth", under the old slug
(`worlds/voth.html`, so links keep working). `ENTRIES` says so; it goes out with the next gallery rebuild: the index
(the live one's Voth card retitled and re-described, no second Voth card) and the one page, in one call.

Rebuilt 2026-10-15 from `main` at 058a5740 (the Roketstad, Verge, Godot viewer and hung-cloths merges, 26 builds rebuilt):
all three parts republished with every page that differed from the live copy. Krator Worlds version 78 (three calls; Fauna,
Highlands and Roketstad moved out to II, Girder, Girder · Hero, Scyvoi and Screamer furniture moved in), Krator Worlds II
version 9 (three calls), Krator Biomes and Objects version 5 (two calls). This also shipped the pending Voth item above:
`worlds/voth.html` is the `core/city` plan, its card retitled "Voth". Krator Worlds II is private (owner only) while the
other two are anyone-with-the-link: share it from its page's Share menu for its link to open for others.

Rebuilt 2026-10-16 from `main` at d010d53b (the Lizardmen kit, the Voth citadel and interiors merges): every page that
differed from the live copy republished. Krator Worlds version 81 (three calls: `worlds/lizardmen.html` and its two packs
added, Fauna moved in from II, Ash Nomads moved out to II), Krator Worlds II version 11 (two calls), Krator Biomes and
Objects version 7 (two calls). **Pending: `worlds/voth.html`** (`settlements/voth/dist/voth-city.html`) is now 19.3 MB, over
the artifact's 16 MB per-file cap, so Krator Worlds keeps its 2026-10-15 copy (11.9 MB) until the Voth page is slimmed or
its pack moved beside it (`tools/textures/matlib_pack.py`); its card was regenerated with the new blurb and size.

Version 8 of Krator Biomes and Objects (2026-10-16): `worlds/hyperjungle.html` replaced (3.7 MB, from `main` at 952944c9:
hero limbs and young trunks on their own species' bark, the plant-naming inspector, the brook as water). The live index
(version 7) was kept unchanged. One publish call.

Rebuilt 2026-10-16 from `main` at 9ee3373c (the isle demo merge): **Krator Biomes and Objects version 9** (one call):
`worlds/ringisles.html` (the Ring Sea isles biome, `biomes/ringisles`) and its six packs added, the index regenerated with
its card; no other page republished (the rest differ from the live copies only by the link bar). The world parts that waited on a third artifact went out the same day (below).

Republished 2026-10-16 from `main` at aea22429, split alphabetically (the owner): Krator Worlds A–H version 85 (was
Krator Worlds), Krator Worlds I–S version 15 (was Krator Worlds II), Krator Worlds V–Z version 6 (new), Krator Biomes
and Objects version 11 (every page rebuilt with core/biome's name index, the new index). Every file checked against the
split by name and size. New in the gallery: the Islanders kit's trade buildings and mines, the Resources kit and the Isle
Demo open world (I–S), Ring Sea isles (Biomes and Objects).

Krator Worlds I–S version 16 (2026-10-18): the Pylon kit added (`worlds/pylon.html`, 1.9 MB, from `claude/vassal-kits` at
1e3177b4, the kit through P5, the governor's palace), its card in the live index (version 15's index with one entry added,
its `ENTRIES` line now in `build_gallery.py`). The page loads `worlds/iziz.tex.iziz.js`, which the part already carried
(the same size as the local pack). Every other file is as in version 15.

Republished 2026-10-18 from `main` at e6e5ce6c (`build_gallery.py --build-missing`, which only made `settlements/girder/hero/dist/girder-hero.html`; never a full rebuild on Windows, which changes bytes and fails on Xanadu). Discover listed six builds new to the gallery (Crops, Dhelv, Hook, Talia, Zeijani were new; Islanders was already live), so the ranges moved: V-Z is now **S-Z** (Shade moved in from I-S). Krator Worlds A-H version 87 (one call: Crops, Hook and its pack added; Dhelv, Fauna, nomads and others re-bundled), Krator Worlds I-S version 18 (two calls; Shade dropped; Resources, Islanders, Isle Demo, Post-Apoc, Pylon, Iziz, Ringisles pack re-bundled), Krator Worlds S-Z version 7 (one call, was V-Z; Talia, its pack and the Iziz pack added, Shade added), Krator Biomes and Objects version 13 (two calls; Ring Sea isles, Geyser and the pages that differ by the link bar). Pages were uploaded from `gallery/site-N/`; pages whose size matched the live copy were left out. `worlds/voth.html` in S-Z stays the live 11.9 MB copy (the new page is 19.3 MB, over the cap). Talia and Pylon: Pylon has an `ENTRIES` line, Talia (and Crops, Dhelv, Hook, Zeijani) are listed by discover only. Sharing was not changed (S-Z is still private).

Krator Biomes and Objects version 15 (2026-10-19): the Oidong Valley added (`worlds/oidong.html`, its card inserted into the live index) and `worlds/nhighlands.html` replaced (lichen birch bark, full host interface). Only the index, those two pages: one call. The live index was edited in place, so the other parts keep their old range titles (A-H, I-S, S-Z); a fresh `split_site.py` now gives A-H, H-R, R-Z. Roketstad (`settlements/highlands`) was not rebuilt.
