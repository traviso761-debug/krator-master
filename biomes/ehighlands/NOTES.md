# Eastern highlands — notes

## The brief (the owner, Oct 2026)

The eastern highlands (`ehighlands` in `biomes/WORLD.md`): a biome distinct from the rest of the world, worked out in
the chat of 2026-10-06. The owner chose a **cushion plateau**: an altiplano, which also fits the region's Koppen class
(cold steppe and tundra), at about 0.6 atm.

- **The Andean puna** as the base: cushions, giant spike rosettes, red-barked woods in the gullies, golden bunchgrass.
- **A giant llareta, "suitably oversized for this planet"**: one cushion grown over a whole hill (the Mother Cushion).
- **New Zealand's vegetable sheep** and **the thorn cushions** of the tragacanth belt (Spain to Iran) as other species.
- **Everything faces the giant.** Krator is tidally locked and the giant hangs fixed in the north-east; the plants grow
  toward it. It is the one alien note, and it is what tells this country from every other.
- **One plant makes a chemical** that a caterpillar and a fungus work into something mostly harmless and prized (the
  caterpillar fungus), while the bees that work the same plant make a far more toxic honey (mad honey).
- The Himalayan accents from the same chat: the glass tower (the noble rhubarb's greenhouse of bracts), snow wool
  (the snow lotus), sedge turf cracked into polygons.

What was avoided, because other kits already have it: flamingos, rheas and coloured salt lagoons (the Abyss and the
Rift), glowing plants (the northern highlands, the desert, the NW lowlands), Reed Lake's Andean geometry (a lore link
is open: the lake people may have come down from this plateau).

## How the ideas became species

| idea | species |
|---|---|
| llareta (*Azorella compacta*) | the **poured cushion** (`cushion`): a lumpy lime dome of tiny rosettes, poured over boulders; and **the Mother Cushion**, one plant over a 520 m hill |
| vegetable sheep (*Raoulia*, *Haastia*) | the **woolback** (`woolback`): a heap of grey-white woolly lobes, a sheep lying down from afar |
| thorn cushions (*Astragalus*, *Acantholimon*) | the **thorn cushion** (`thorn`): a spiny hemisphere, a crust of pink flowers on its giant side; tapped for gum |
| *Puya raimondii* | the **vigil spike** (`vigil`): a rosette on a skirted trunk for decades, then a 17 m spike, then a dark torch. Stands flower together |
| *Polylepis* (queñua) | the **ragbark** (`ragbark`): gnarled trees in the gullies, rust-red bark peeling in papery layers |
| *Rheum nobile* | the **glass tower** (`glasstower`): a spire of translucent bracts, lit from within when backlit |
| *Oreocereus* | the **hoar cereus** (`cereus`): white-haired columns, red flowers on the giant side |
| ichu, *Kobresia* turf, *Distichia* bogs, tola, snow lotus, gentians, Andean crustose lichens | the floor (`EHIGH.PLANTS`) |
| caterpillar fungus | **wormwick**: stalks in the turf round the glass towers |
| mad honey | **tower honey**: wild combs on the cliffs of the gullies and the tors |

## The giant

`EHIGH.GIANT` is the unit vector on the ground toward the giant (azimuth 66, `LORE.md`); `EHIGH.setGiant(az)` changes
it (a world far round Krator from the crater would see the giant elsewhere). Every builder turns its plant toward it
and records the bearing on the plant (`T.lean`):

- the cushions (poured, woolback, thorn, the bog's quilt) are lopsided: higher and steeper on the giant's side
  (`dome()` in 50: +x is the giant side, the builder yaws +x toward it);
- the vigil spikes, the glass towers and the cereus columns tilt toward it (`S.lean`, 10-17 degrees);
- the ragbark's trunks lean toward it and most of its limbs grow out on that side;
- the Mother Cushion's crown sits 62 m toward the giant, its giant side short and steep, and its skin is greenest
  there; the impostors lean too.

The probe checks every plant's bearing is within 40 degrees of the giant's, with a negative control.

## The chemistry (the owner's idea, named here: rename freely)

The glass towers make **pallidine** (a placeholder name), a bitter alkaloid, in their bracts and roots.
- Moth larvae feed on the roots and store it. A fungus infects them and works most of it into a milder tonic; its
  stalks come up in the turf round the towers: **wormwick**, worth its weight in silver in the lowland cities. The clans
  fight over the slopes in the spring.
- Wild bees work the towers' hidden flowers and carry the pallidine whole into their honey: **tower honey**, the
  dangerous version.

The kit draws both: wormwick 3-22 m round the glass towers near the spine, combs hung on sheer rock in the gullies and
on the low tors. The probe checks every wormwick is within 25 m of a tower.

## The showcase

One 5.2 km disc of the plateau (`45-host-stage.js`): the puna at 215-240 m; the Mother Cushion north-east of the centre;
the bofedal (a cushion bog with 34 pools) in the west with the frozen tarn at its end; the range in the south climbing
to ~700 m, its north face the sunward one, two gullies cut into it, the west one carrying the stream down to the bog;
the geyser field in the east (six vents; the Old Kettle erupts every 34 s); five basalt tors.

The light is thin air's: a deep blue zenith, a hard white sun, weak blue fill, almost no haze (`FogExp2` .000042);
snow-capped volcanoes on every horizon, one with a plume, two with lenticular clouds. The giant is crisp, its night side
dark. This year's flowering stand of vigil spikes is the host's choice (`FLOWERING`, on the dry slope); other stands
flower or stand as torches by the kit's own patches.

## Acceptance frames and the budget

- Vista: **The Mother Cushion, under the giant** (the dome on the plain, the giant over it).
- Ground level: **Every spike leans to the giant** (a flowering stand on the dry slope, every spike tilted one way).

`python3 verify.py dist/ehighlands.html --assert --views "The Mother Cushion, under the giant|Every spike leans to the giant"`.

Measured at q=1 (2026-10-06): about 15.4M scene triangles, 32-73 draw calls, 663k instances (`BUDGET.showcase` is 16M).
The close ichu grid is most of the floor's instances (6 triangles each); the cereus's 24-sided ribbed lathes are most
of the trunks. Software GL (verify.py) closed the browser once mid-run on a view that passed alone: the flake its
header warns of.

## Rules carried over

- **No plants on layered cliff faces** (the owner, Oct 2026): every zone is multiplied by `1-cliff`. Checked by the
  probe, with the gully's steepest wall as the negative.
- Fauna goes to the one fauna kit (`biomes/README.md`): none here (vicuña, viscacha and the condor wait for it).
