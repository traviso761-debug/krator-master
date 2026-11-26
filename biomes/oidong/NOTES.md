# Oidong Valley — notes

## The brief (the owner, 2026-10-19)

A new biome: the Oidong Valley, the environs of Longsong and the History Monks (LORE.md 6.15: east of the Vale of Xanadu).
Before anything else SERENE: perhaps the safest biome on the map; despite the grueling and dangerous trek to get here, a
refuge from the harshness of the rest of Krator. Holy plants are common: giant lotuses, sacred figs, peyote buttons, cherry
blossoms. The palette pastel, calm, quietly colourful, somewhat psychedelic. Xanadu plants would not feel out of place and
there should be some overlap. As elsewhere in the far south, alien plants are common, but they take the same palette. A wild
landscape with something of a zen garden about it. The biome interfaces with the crops and fruit modules; medicinal plants
and reagents are common. The owner's references are in `C:/Users/travi/OneDrive/Pictures/krator/oidong/` (28 images: the
lotus and the Victoria pads, the Saiho-ji moss garden, a raked garden with clipped domes, the bamboo avenue, the bead-and-bell
succulents, the rainbow bracket fungus, the pink parasol mushroom, the bodhi tree, the giant blue cap trees, and the marbled
pastel forests).

## How the brief became the kit

| the brief | the kit |
|---|---|
| serene, the safest ground | no fauna; nothing that stings or burns; mirror-still pools; the light clear and cool; the mist slow |
| giant lotuses | the **giant lotus** (species 0): Victoria-sized pads with turned-up rims on the pools, flower stalks taller than a house, flowers, buds and basin-sized seed heads; the ordinary lotus on the pools too |
| sacred figs | the **sacred fig** (1): pale buttressed bole, heart leaves with drip tips, aerial roots, rainbow brackets on the bole; never felled |
| cherry blossom | the **cherry** (2): dark banded trunk, blush and white blossom, petals on the ground and the water, cherries two trees in three |
| peyote buttons | **peyote** (a floor plant): blue-green buttons flush with the gravel flats, a pink crown on the biggest; the monks' seeing reagent |
| pastel, quietly psychedelic | the palette (`PAL`) is pastel throughout and the probe measures it ("a calm palette": every species' leaf and bark set under .5 mean saturation); the psychedelic streak is the iridescent second colours shown at grazing angles (the lilies, the marble lace, the blossom), the lotus trumpet's every-colour fringe, and the **marble birch** (3): a bole painted in swirled bands of every pastel at once, from the owner's marbled-forest references |
| Xanadu overlap | five of Xanadu's species carried over the pass and paled, tagged `shared:'xanadu'`: the cloud pine, the cushion tree, the haze blossom, the lotus trumpet, the wisteria (their builders ported from `biomes/xanadu/src/55-biome-xanadu-trees.js`) |
| alien plants in the same palette | the **chalice tree** (9: a pale column holding one teal cap that spills its water in threads, from the giant-cap reference), the **bell-pod willow** (10: strings of pale beads ending in coral bells, from the succulent references), the **moss-ball tree** (12: moss balls stacked up a gnarled trunk, from the cloud-pruned reference), the giant lotus itself, the stone-blooms, the iridescent lily, the coin vine |
| a zen garden | the pale flats (gravel fans) the wind rakes: the ground shader draws parallel ripples and concentric rings round every standing-stone group; the stones stand in threes, fives and sevens (the probe checks it: never an even number); clipped-looking box domes and cushion trees; cloud pines leaning like bonsai; moss over everything in the shade; the pools as mirrors |
| crops and fruit | every species and plant carries a harvest tag; four catalog fruit (`biomes/FRUIT.md`, the Oidong section: lotus seeds shared with Xanadu, valley cherries, sacred figs, bell-pod beads); `kits/crops` has the biome's zones and fifteen records (the giant lotus root and silk, the cherry, the fig, the beads, bamboo, chalice-rim paper, maple syrup, peyote, sky poppy, snow lotus, ginseng, monk's sage, moon caps, rainbow bracket); mist tea grows here too |
| medicinal plants and reagents | the monks' physic: peyote (seeing), sky poppy (sleep, and the Order's blue dye), snow lotus (the heart and the breath), valley ginseng (tonic), monk's sage (incense, a bitter), moon caps (dreams), rainbow brackets (the long-life tea), the bell-pod's bells (sleep), the lily's root (dreams), the lotus heart (a sedative tea); `MEDICINE-FUEL.md` counts twenty medicinal plants |

## The dark evergreens (the owner, 2026-10-19)

After the first builds the owner found the balance a little too pastel and asked for three new species with darker green
foliage for contrast: the **temple cedar** (14: a red-barked column of dark needles in tiers, the temple timber and incense
wood, in the shade, the mist and up the terraces), the **camphor laurel** (15: a heavy grey bole under a great dark glossy
dome, the darkest shade on the floor; its camphor is a reagent in `kits/crops`) and the **pagoda fir** (16, alien: level
whorls of blue-green needle plates like a pagoda's roofs, smaller to the spire, on the terraces and the crags). They pass
the calm-palette check (low saturation, low lightness) while breaking the pastel field.

## The diversity pass (the owner, 2026-10-26)

"Add a diversity pass ... adding flora based off these pics": eight reference pictures split between Xanadu and Oidong.
Oidong took four, stylised and kept in the valley's calm palette:

| the picture | the kit |
|---|---|
| a low sinuous bonsai trunk with tall stems of flat tiered olive pads (concept art) | the **cloud-pad tree** (17): the trunk snakes along the ground, two or three thin stems rise from it, each with level pads on short side shoots, the TOP pad the widest (where the moss-ball tree stacks balls and the pagoda fir narrows, this one widens); on the flats in the wind, the terraces and the crag edges |
| very tall thin trunks of stacked teal dome canopies ending in a spire, in groups (concept art) | the **stupa tree** (18): named for the shape the monks build; groups of three to five of different heights, bulb saplings at the first one's foot; in the mist at the valley's head and the moss woods |
| a leaning tree whose trunk is an openwork lattice, limbs ending in saucers of blue umbrella fronds (a painting) | the **lattice tree** (19): a landmark, at most four in the valley, 700 m apart on the open floor; holy (each has a name and a keeper) |
| real trunks carved in dark target rings and scalloped diamonds | the **carved bark** (bark kind 7) of the cloud-pad tree: the monks read it like script. A procedural stand-in until the library has `bark.carved` (`core/materials/PROMPTS-NEEDED.md` section 19) |

All three are placed from core/rand after every older pass (`55-biome-oidong-trees.js`, `placeNew`): nothing that stood
before them moved. Presets: 'Cloud-pad trees', 'Carved bark', 'Stupa trees in the mist', 'A lattice tree'.

## The showcase

One 5.2 km length of the valley (`45-host-stage.js`): the axis runs east-west; the floor a kilometre wide between walls that
rise in benches to ranges off the map; four still pools on the floor (the Mirror the largest, in the west) linked by a painted
stream; gravel fans off the south wall (the raked flats); **Longsong's rock**, a flat-topped knoll north of the axis mid-valley
with a cliff on its east face (the blueprint's hermits' cliff), kept bare for the monastery (`settlements/longsong`); the head
in the east steps up 70 m at the cataract, whose spray is the `mist` field (the chalice trees' home); the west edge runs out
toward Xanadu. The light is the shighlands' rig (sun at azimuth 305, altitude 36), the sky a deep cool blue with snow ranges
all round, the cataract's thread on the east wall and the Throne far off over the western pass.

**A host elsewhere in the valley** (2026-10-19, `settlements/longsong`): `82-host-sky.js` takes an optional
`OIDONG_SKY = {head, pass, throne, cataract}` (azimuths in degrees; `cataract: false` for none), set before it runs; the side
walls stand at head +-90. Without it the showcase is drawn as before (head 90, pass 270, Throne 285, the cataract).

## Lessons

- **Pastel barks saturate the core's tint.** `BIO.col.tint` divides a bark colour by the canvas's mean grey (the other kits
  write their bark colours a stop dark for this); a pastel written as it is clips to white. This kit scales the tint
  (`barkCol`: k .4) and brightens its foliage clumps (`clumpAt`: ao x1.3) instead of darkening its palette, so the species
  tables read as the colours they are.
- **A raised fan hides a pool from a camera on it.** Two presets looked across the flats at a pool and saw only sand; the pool
  presets now stand on the north bank and on Longsong's rock.
- **The bead strings reach the water.** A hanging ribbon's length must be clamped to the drop to the ground or the water
  under it, or the probe's drowned-instance check finds its bell in the pool.

## The vents on the north rim (canon, the owner, 2026-11-02; biomes/hearths/PLAN.md section 5)

The valley's pools are kept open by the vents on its north rim: the Cold Hearths (4,333 m) and the lower vent (3,322 m) on scale model 5.1 are the
chilly valley's own warmth, the reason its mirror-still pools never freeze. The sentence's wording for `LORE.md` 6.15 is still a proposal; the
Cold Hearths are station 3 (`--station hearths`).

## Fauna (proposed 2026-11-11, the owner's ask: peaceful animals)

The owner (2026-11-11): Oidong should have some fauna after all, **peaceful and never aggressive to people**: a black bear, the yak,
and some peaceful grazers and flyers. This replaces the old "no fauna" rule. The valley stays the safest ground on Krator,
because nothing here hunts people, guards against them or stings. Drawn by `kits/fauna`, tagged `oidong`, placed by `FAUNALANDS`.
Proposed, nothing built yet.

**The rule.** Every animal tagged `oidong` has `temperament` `'docile'` or `'skittish'` and `aggression` 0 toward people. It has no
predator role that touches people or their stock. The bear eats fruit, nuts and roots and shrugs people off. A host check fails any
`oidong` animal with aggression > 0 or temperament `'defensive'` or `'aggressive'` (with a negative: a planted aggressive entry
must fail).

| Role | Animal | Status | Where | What it is |
|---|---|---|---|---|
| big animal (omnivore, browses) | **moon bear** | **new, unique** | the cherry groves, the sacred figs, the camphor shade, the lotus margins | an Asiatic black bear (`faWdQuad`, a heavy round build with a shaggy ruff), black with a cream crescent on the chest. It eats fallen cherries, figs, lotus seeds and the bell-pod beads, and digs roots on the terraces. Docile, aggression 0: it ambles past pilgrims and sleeps in the moss. The monks leave the windfall under the oldest cherry for it. Low `fleeDistance`, slow `speed`, `schedule` dawn and dusk |
| grazer | *yak* | shared (xanadu; domestic) | the monks' dairy round Longsong and the monasteries; the upper meadows | the dairy the known issues ask for: butter for the lamps, milk and cheese. Herds of 6-12, a herder's bell variant if the kit adds one |
| grazer | **pool deer** | **new, unique** | the pools' shallows and the moss gardens | a small tuskless water deer (`faWdQuad`, `sleek`), soft fawn-grey with pale dapples that pick up the pastel palette's iridescent second colour at grazing angles. It wades the pools to eat the lotus pads and grazes the moss. Skittish but tame near the monasteries, in pairs and small family groups. It is the valley's own, as the giant lotus is |
| grazer | *plateau-kiang* | shared (xanadu) | the gravel flats and the BSk at the valley's dry west end | Xanadu's wild ass comes over the pass with Xanadu's plants. Skittish |
| flyer | **mist crane** | **new, unique** | the pools, the gravel flats, the marsh margins; flying over the mist in lines | a tall pale crane (`faHiBird`, a wader build), white and pearl-grey with a soft rose crown: **the pools' birds** the known issues ask for. Pairs dance on the gravel flats in spring. Holy to the monks; never hunted |
| flyer | **petal moth** | **new, unique** | the cherry and haze-blossom groves, at dusk | a moth with a 20-30 cm span, blush and white like the blossom, so a swarm over a grove reads as petals blowing upward. Feeds on the lotus trumpet's nectar. Built as one of the hyperjungle file's moths in the valley's palette |
| flyer | *giant-honeybee* | shared (domestic) | the monks' hives on the terraces | the Order's honey and wax; docile |
| flyer | *bone-eater* | shared (xanadu) | high over the walls only | a harmless scavenger on the rims, never on the floor |
| water | **lotus carp** | **new, unique** | the pools under the giant lotus | a large pastel carp (`faWdFish`): cream, peach and slate, after koi gone wild over centuries. The monks feed them; they rise at a footfall on the pool's edge |
| water | *ice-lake-char* | shared (xanadu) | the cold tarns of the upper valley and the passes | |

**Left out on purpose:** Xanadu's **cloud leopard** (a predator; it stays on Xanadu's side of the pass) and anything that stings.
The Cold Hearths' fauna (`biomes/hearths`, station 3) is the Hearths' and stays inside the vents' discs.

**Fit with the kit.** `FAUNALANDS` gets a land `oidong.floor` with no predator density (`density: {predator: 0}`) and low grazer
density, so the valley reads as quiet: a bear in a grove, a pair of deer at a pool, a crane line overhead, not herds. The moon bear,
pool deer and mist crane are good first users of `ANIMAL_KIN` if it lands first: the moon bear as a cousin of the shore bear
(smaller, black, a chest crescent, docile), the pool deer of the marsh deer, the mist crane of a wader.
