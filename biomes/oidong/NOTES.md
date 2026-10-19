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

## The showcase

One 5.2 km length of the valley (`45-host-stage.js`): the axis runs east-west; the floor a kilometre wide between walls that
rise in benches to ranges off the map; four still pools on the floor (the Mirror the largest, in the west) linked by a painted
stream; gravel fans off the south wall (the raked flats); **Longsong's rock**, a flat-topped knoll north of the axis mid-valley
with a cliff on its east face (the blueprint's hermits' cliff), kept bare for the monastery (`settlements/longsong`); the head
in the east steps up 70 m at the cataract, whose spray is the `mist` field (the chalice trees' home); the west edge runs out
toward Xanadu. The light is the shighlands' rig (sun at azimuth 305, altitude 36), the sky a deep cool blue with snow ranges
all round, the cataract's thread on the east wall and the Throne far off over the western pass.

## Lessons

- **Pastel barks saturate the core's tint.** `BIO.col.tint` divides a bark colour by the canvas's mean grey (the other kits
  write their bark colours a stop dark for this); a pastel written as it is clips to white. This kit scales the tint
  (`barkCol`: k .4) and brightens its foliage clumps (`clumpAt`: ao x1.3) instead of darkening its palette, so the species
  tables read as the colours they are.
- **A raised fan hides a pool from a camera on it.** Two presets looked across the flats at a pool and saw only sand; the pool
  presets now stand on the north bank and on Longsong's rock.
- **The bead strings reach the water.** A hanging ribbon's length must be clamped to the drop to the ground or the water
  under it, or the probe's drowned-instance check finds its bell in the pool.
