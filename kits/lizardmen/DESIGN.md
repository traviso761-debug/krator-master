# The Lizardmen kit: design

*Status: design agreed with the owner, 2026-10-15. Nothing is built yet. Visual references are still to come; where they
contradict this file, they win, and this file is updated.*

The Lizardmen kit will be a city kit (catalog culture `lizardman`) for the Lizardmen of the Rift floor: five dwellings,
the nest hall, the trades, farms, the military buildings, the shrines and monuments, the reliquary and its antechamber.
The scale model already marks their territory (the "Lizardmen" political region in
`openworld/little-demo/source/regions.json`, colour `#5da05c`). The settlement comes later, on the `biomes/rift` floor.

## 1. Lore (Krator's adaptation)

**On Krator.** No one knows where the Lizardmen came from. Some suppose the Ancients warped the human form into them,
as the gene priests of Dalab made the four-armed giants. They are universally hostile and never trade or treat. They are
nearly silent, even among themselves, except for the hiss they make when they charge. They take no captives: the dead
of both sides are butchered like animals. Captives are pointless anyway: their kin always know where they are, and as
slaves they are listless. The History Monks hold contradictory accounts of their origin, but place them on Krator just
after, or even during, the Cataclysm.

**The reliquaries.** They build great cyclopean reliquaries (the Xanadui call them temples). They store strange
constructions in them and otherwise leave them alone. The Monks' sages sense recursive distortions of spacetime coming
from them, growing stronger over the centuries, to an unknown end.

**Rishtowar VII's expedition, 400 years ago.** The Sultan's army, with hired Yuni riflemen and shielded Izani
auxiliaries, found a large village laid out as a spiral around a central hall. There were egg nurseries beside bloated,
sickly-looking Lizardmen. As the Lizardmen were killed, the vanguard felt premonitions of fear, longing and stranger
things. The army breached an isolated reliquary: vast, dusty chambers like a tomb. At that every Lizardman in the Rift
rose in fury. Falling back, the army found the village held by a frenzied army that seemed to have appeared overnight.
The army was destroyed and Rishtowar killed. The eastern Rift floor was not won back for 200 years, when his
great-great-great-grandson took it with ex-Izizian legionaries. Today Xanadu's vigilance is waning and raids reach as
far as the Vale, for livestock, tools and valuables.

**Out of universe: they are the Ophidians of Secret Histories.** Krator's version is smaller and less powerful. What
carries over from that setting:
- **The Coil.** They live time as a spiral in which events recur, cause can follow memory, and some of them know humanity's
  future as their past.
- **The Cataclysm is their Phase Inversion.** The calamity that frayed physics and brought them to Krator is the
  fracture of their Coil. The **Lie** arrived with it: before it they could not assert what they knew to be false, and
  they regard the ability as a contamination. The reliquaries are an attempt to mend the Coil, or to force Krator onto
  it. What that would mean for life that lives linearly is unknown, and probably nothing humans could survive.
- **They are a diminished remnant of an older, greater order.** The village is modest; the reliquaries are of that
  older scale.
- **Pathogenic reproduction.** The offspring is genetically identical to its parent and keeps its memories, but may be
  reborn into another caste. That explains Rishtowar's account:
  - the "sickly" Lizardmen beside the eggs are hosts mid-transfer, so the nest hall's hospice and nursery are one room;
  - their kin can track the dead;
  - the army "overnight" acted on what it already remembered.
- **Identity continuity.** The same mind keeps a building for centuries in successive bodies. Their style never drifts,
  repairs are invisible, and a reed hall is as precise as a stone one.
- **Silence.** Their speech is tonal hissing, partly non-acoustic; the higher castes communicate by projected thought.
- **No clothing.** They wear jewellery, ritual ornaments, headdresses, equipment and armour.

**Left out:** infiltration and disguise, diplomacy, and the Secret Histories factions (Atlantis, the Princes, the
Druadach).

## 2. The look

**Vibe:** primitive yet strangely sophisticated, uncanny and alienating. The kit is ribbed, in places with real bone,
and built on spirals, coils and recursion. Angles are sharp and uncomfortable.

**Avoid:**
- Orcish construction: savage, ramshackle, spiked, lashed junk. Everything here is precise.
- Warhammer's reptilio-Aztec: no stepped pyramids or temple stairs, no feathered serpents, no gold and jade.

**Sources:**
- Shang and Zhou bronzes: the *leiwen* thunder pattern and *taotie* masks.
- Shang oracle-bone script.
- Mohenjo-daro: baked brick, grid precision, the Great Granary, square stamp seals, an undeciphered script.

### 2.1 The angular spiral

The answer to "spirals, but sharp angles" is the **leiwen**, a squared spiral, recursive and space-filling. It is the
kit's one shape, used at every scale:

| Scale | Use |
|---|---|
| Settlement | a squared (square or rhombic) spiral of buildings winding in to the nest hall |
| Building | chambers in a whorl, each scaled by **1.25** from the last and turned at an awkward angle (75° or 105°); nothing meets at 90° |
| Facade | leiwen panels, carved or lacquered |
| Glyph | the script's strokes are small squared spirals |

- **The village inside itself:** the seer's hall holds a carved model of the village, seer's hall included.
- **Taotie masks:** faces that dissolve into pattern. These are the uncanny figurative ornament, never reptilian
  portraits.

### 2.2 Rules of form

- **Battered walls that lean wrong:** inward on one face, outward on another.
- **No human-sized openings.** Openings are triangular or rhombic, with raised thresholds and no windows at human eye
  height. Doors are sized by caste (section 3).
- **Odd counts:** 7, 11 or 13 ribs, posts or bays, never 4, 6 or 8.
- **Twist:** each course or storey of a tower turns a few degrees past the one below (the obelisks, the windmill tower,
  the Interpreters' house).
- **Paired chirality:** clockwise and counter-clockwise spirals always come as mirrored pairs (the Coil forward and
  back), on stelae, doorposts and panels.
- **The flaw.** Every leiwen band has exactly one deliberate break: the fracture, and the Lie. It is the only
  irregularity in a perfect pattern.
- **Two-way weathering.** Some structures look half-built and half-ruined at once, so it can't be told which way they
  are going. This is a weathering parameter that runs both ways, not damage.
- **Silence made visible.** No banners, drums, horns, gongs or signal fires anywhere, the barracks and mustering ground
  included. An optional extra: a rack of bronze bells (after the bianzhong) with no clappers.
- **The spiral eye.** Spiral pupils mark the high castes, so status is shown by spiral-eye oculi and pupils carved at
  the centre of leiwen panels. The more important the building, the more eyes it has.

### 2.3 Ribbing and materials

- **Ribs are an exoskeleton**, outside the skin, bundled reed or bent cane. They cross at the ridge and run on past it,
  so a roof reads as a ribcage left open. Arches are pointed, never round (round reed arches read as Marsh Arab
  mudhifs).
- **Bone** on the important buildings: hexapod ribs and vertebrae, and human and Lizardman bone from the bone hall's
  stock (section 5), lashed precisely.
- **Plant:** reed bundles, split cane, woven mats and screens, fibre-tempered mud, and **lacquer**. Black and oxblood
  lacquer goes on bone and reed. High-caste lacquer has an iridescent sheen, to match the Rift's iridescent bark
  (`BIO.iridBarkMat`).
- **Stone**, by tier:
  - baked brick for the middle tier (Mohenjo-daro plinths and drains);
  - dressed polygonal masonry for the large buildings: stones with too many sides, fitted perfectly;
  - near-blank monolithic stone for the reliquary.
- **Bronze only, no iron or steel:** verdigris fittings, ding-like ritual vessels, jewellery, armour.
- **Palette:** bone white, reed ochre, black lacquer; verdigris and turquoise lead; oxblood is the only warm colour;
  grey-green basalt for the stone.

### 2.4 Writing

Their script is pictographic and phonetic in one. It is laid out as a spiral and reads both inward and outward, with a
different meaning each way. A repeated glyph means an event that recurs. One glyph can be a creature, a principle and a
grammatical role at once. It never depicts a human face.

**The five base glyphs:**

| Glyph | Meaning |
|---|---|
| serpent | serpent consciousness, the Lizardmen themselves |
| memory | memory, recurrence |
| node | a temporal crossing |
| Coil | the spiral of time |
| fracture | the inversion, the Lie |

The Secret Histories fragment uses Unicode placeholders for these; they are not the look.

- **The script itself:** inscriptions are generated (seeded through `core/rand`) from the five glyphs and a larger set
  built from the same angular strokes. The feel is Indus seal and oracle bone, not Egyptian. No human can read it.
- **Turned stelae:** some stelae are turned to face the ground or a wall, or wrapped in reed matting. These are texts
  whose meaning "changed retroactively", which the high castes refuse to read.
- **The fragment's translation**, for any in-world text: "The Coil remembers what the flesh forgets. We move again
  through what has already happened. The pattern remains." Since the fracture, it reads as "...but corrupted."

## 3. The six castes

Caste is set at rebirth and can change between incarnations. The heights run from 4 ft (1.22 m) to a Dalab giant (3.8 m,
`settlements/dalab/src/69e-dalab-helpers.js`). Each caste is **1.25** times the one below: the bodies follow the same
ratio as the chambers.

| # | Height | Caste (proposed roles) |
|---|---|---|
| 1 | 1.22 m, slender | **Tenders**: nest hall attendants, scribes and carvers of inscriptions, lacquer work |
| 2 | 1.53 m | **Makers**: bronze, reed and bone crafts |
| 3 | 1.92 m | **Drovers**: farming, herding, hauling |
| 4 | 2.41 m | **Line warriors** |
| 5 | 3.03 m | **Interpreters**: seers and strategists, spiral pupils, the highest caste |
| 6 | 3.80 m | **Bulwarks**: shock troops and heavy labour |

The roles are a proposal for the owner to confirm. The highest caste is deliberately not the largest: rank is a phase
you pass through, not a size.

**Doors by caste.** A caste's own building has openings sized for that caste: a Tender's 1.4 m slit door that a human
must stoop through, a Bulwark's 4.2 m door. Shared buildings (the nest hall, the craft halls, the reliquary) have
**nested portals**: a 3.8 m portal holds a 3.0 m door, which holds a 2.4 m door, and so on down to a 1.2 m wicket, each
1/1.25 of the last. This is the kit's signature detail.

## 4. Manifest

**Dwellings, mostly communal, one per caste group:**
1. **The Tenders' cell-warren:** many small low cells in a whorl.
2. **The Makers' quarters**, built into the craft halls.
3. **The Drovers' long house:** an exoskeletal rib house with odd-count bays.
4. **The warriors' lodge**, for castes 4 and 6 together, with two sizes of opening.
5. **The Interpreters' house:** a narrow twisted stone tower with spiral-eye oculi.

**The nest hall and hospice,** where the cycle turns from old to new to old. Its plan is a **Fermat spiral**: two
interleaved arms that meet at the centre.
- The in-arm is a sequence of incubation chambers where the hosts lie.
- The eggs are at the turn, at the centre.
- The out-arm carries the new out.

The pathogen is spore-like, so the nest hall borrows the Rift's spore flora and looks partly grown rather than built.
It is shared by every caste, so its openings are nested.

**Trades.** There are no shops. Combined crafting and storage halls mix related trades:
- **Bronze and stone:** casting (crucibles, moulds) and stonecutting, with an armourer's corner (lamellae drying on
  lacquer racks, cord, rivets).
- **Reed, weaving and lacquer:** mats, screens, baskets and lacquerware. No garments.
- **Bone:** butchery, tanning and bone carving (section 5).
- **Pottery and yam stores.**

**Food:**
- **A windmill:** a vertical-axis Persian panemone, reed-mat sails on an upright shaft inside a walled slot, turning.
- **A granary** after the Great Granary of Mohenjo-daro: a brick podium with air channels under a reed superstructure.
- **Farms.** The crops are carrot frill greens, trumpet pods, Rift Yam and edible Rift flora; all are new and owed to the
  biome or fruit work.
- **Livestock and draught animals:** native hexapods and frilled lizards, taken from `kits/fauna` (the frilled lizard,
  the burden beast and the large hexapods).

**Military:**
- **Barracks:** armour stands in six sizes (an empty suit per caste, a 1.25 step down the wall), racks of bronze
  dagger-axes (*ge*), *ji* and spears, and headdress stands.
- **A mustering ground:** ranks marked by stone posts on a spiral grid, with no signal equipment.

**Specialists and stores:**
- **The seer's hall**, holding the model of the village.
- **The medicine hut.**
- **The warehouse:** plunder from the Vale kept but unused (steel blades they cannot make or mend, tools, valuables),
  sorted by an order only they understand.

**Monuments:**
- **The ley line shrine:** the one straight, linear thing in the town, aimed at the reliquary.
- **The stone circle**, which is a phyllotaxis spiral (stones every 137.5°): a ring from the ground, not from above.
- **Stelae and obelisks:** twisted obelisks; stelae with mirrored-chirality inscriptions; some stelae turned or wrapped
  (section 2.4).

**The reliquary**, isolated from the village and built in the older order's scale, dwarfing it:
- Cyclopean polygonal masonry, battered, windowless.
- The only way in is one squared-spiral passage wound into the mass.
- At its mouth stands one great stela with the Coil and fracture glyphs side by side.
- It carries Rishtowar's breach, repaired seamlessly: the same minds put back the same stones, and the only sign is
  that those stones are cleaner.

**The antechamber**, vast, dusty and tomb-like:
- **Dust falls upward**, slowly, in still air.
- **Relics:** nested bronze rings like an armillary sphere whose rings do not share a centre, coiled bronze armatures,
  and one object that holds a smaller copy of itself.
- **The distortion:** a faint recursive shimmer or Droste effect, growing toward the inner door (a shader).
- **The Xanadui footprints,** 400 years old and preserved in the dust. They lead in and not out.
- **The inner door is shut.** Nothing is built past it.

## 5. The butchery: grim

The bone hall treats every body as matter: no ritual and no trophies.
- **Carcasses on hooks, sorted by part:** human, Lizardman and hexapod side by side, getting the same treatment.
- **Hides on frames,** human hides among them.
- **Bone sorted into stock bins** by length and curvature.

That stock feeds the bone ribs of the important buildings, so the bone in the architecture comes partly from their
enemies and their own dead. To a people who are reborn, a body is material.

Drawn dried and brown rather than fresh and red. Human silhouettes are recognisable (skulls, ribcages, limbs on hooks),
with no splatter. The horror is in how orderly it is.

## 6. Furniture (catalog culture `lizardman`)

Whole familiar categories are missing: no wardrobes, clothes chests or garment looms, and no human-height seats or
tables. What there is:
- **Armour:** stands in six sizes, lamellar racks.
- **Weapons:** racks of *ge*, *ji* and spears.
- **Headdress and jewellery stands.**
- **Sleeping:** caste-sized sleeping troughs and mats.
- **Vessels:** ding-like bronze vessels, lacquerware.
- **Inscription:** writing slabs and seal blocks.
- **Nest hall:** incubation cradles and egg racks.
- **Trade items:** each hall's tools.

## 7. How it will be built

- **The kit:** `kits/lizardmen`, a new catalog culture with a verified kit sheet (`build.py`, `verify.py --assert`). It
  forks the Islanders kit's engine, the closest manifest, which is itself the Scyvoi engine vendored. Follow the repo
  rules in `CLAUDE.md`:
  - placement on `core/rand` and `core/mask`;
  - every piece registered in `core/tags` before it is drawn;
  - no copied infrastructure.
- **The settlement**, later, on `biomes/rift`, inside the Lizardmen region. Its layout goes on `core/city`. A spiral
  street plan probably needs a new street generator there, which belongs to the city-layout work, so it must be agreed
  with that workstream first.
- **Textures:** reed bundle, lacquer (black, oxblood, iridescent), polygonal basalt masonry, baked brick, verdigris
  bronze and bone are probably not all in `core/materials/library`. Any gap goes into `core/materials/PROMPTS-NEEDED.md`
  with a prompt; it is not papered over.

## 8. Open

- **Visual references:** from the owner, next. They decide how abstract the ornament is, from clean Shang-bronze
  graphic pattern to something busier and more organic.
- **The caste roles** in section 3 are proposed, not confirmed.
- **Lizardman figures** to size doors and furniture against (fauna or a figure kit).
- **The new crops,** in the biome or fruit work.
