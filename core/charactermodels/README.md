# core/charactermodels

The character editor and the data a city needs to populate itself: two MakeHuman bodies (a man and a woman), and the
Giant made from the man's (Giants, below), whose face, build and ancestry morph, with library clothes, hair and beards that follow the morphs, a skin tone and a hair
colour, and **peoples** (`data/peoples.json`) that keep a culture's strangers within its range (Chichani: ashen-brown
skin and dark hair; Beast Riders: Asiatic or Amerindian, blond to brown hair). One record per citizen; no separate
model per person. Body mods (a second pair of arms, flesh or cybernetic; rib gills) go on any of them. Two pages are
built over the same pieces:

- **Cosmetic Lab** (`dist/cosmetic-lab.html`): one figure and every cosmetic choice (people, face, hair and colour, beard,
  skin, eyes, build, clothes and dye), with the idle, walk and run to see clothes move. It is the start of the player
  character editor. Its Record tab draws **strangers in bulk** for NPCs (`KCHAR.crowd`): a people, a count and a seed
  give the same crowd every time, and each record keeps the seed that redraws it. The same draw runs outside the
  browser: `node tools/npcs.js --people chichani --count 200 --seed 1 > npcs.json` (`--list` names the peoples).
- **Animation Lab** (`dist/animation-lab.html`): each body three ways (neutral; short and broad; tall and lanky: `CAST`
  and `BUILD` in `src/92-animlab.js`), all six in the same plain clothes, side by side. A clip from the ledger plays on
  all six in step with the props it holds; pause, slow down, scrub, step a frame, swap the prop, show one body or
  both, orbit or close in on one figure; the Giants filter shows three giants instead (flesh arms, cybernetic arms,
  two arms), with menus for the mods everyone wears and what the lower hands hold. One-shots repeat. Each clip gets a review mark (good, needs work, broken),
  the bodies it looks wrong on and a note. The published lab keeps them in its shared store (collection `reviews`, one
  document per clip, which Claude reads); run locally it keeps them in the browser.

```
cd core/charactermodels
blender -b --python tools/make_garments.py -- male [--render <dir>] # the Voth clothing, into MPFB's user data
blender -b --python tools/mpfb_build.py -- male <export dir>      # Blender 4.5 + MPFB2 + the asset packs (below)
python3 tools/make_mpfb.py male <export dir>                       # -> pieces/mpfb_male/, data/mpfb_male/
python3 tools/make_mpfb.py giant <the man's export dir>            # -> pieces/mpfb_giant/, data/mpfb_giant/ (tools/giant.py)
python3 build.py [--thumbs]                                        # dist/cosmetic-lab.html, dist/animation-lab.html (+ .artifact.html); runs tests/test-rig.js
python3 verify.py dist/cosmetic-lab.html --assert [--out shots/]
python3 verify.py dist/animation-lab.html --assert
node tests/make-golden.js && python3 ../../godot/tools/sync_core.py     # after a change to 10-rig.js, data/ or the pieces
godot --headless --path ../../godot --script res://tests/character/kchar_test.gd
```

**Publishing the labs.** Each page fetches `pieces/<body>/<piece>.txt` beside it: the GLB, and on a second line the
piece's morph deltas. A piece published before the two lines were one file still has its deltas in a
`<piece>.morph.txt` of its own, and the pages fall back to it. Never remove a `.morph.txt` from a published lab
without sending its piece's `.txt` again in the same publish: the piece would lose its morphs, and every body but
the neutral one would show it at the neutral size (hair off the head, shirts off the torso, holes at the joints).
A version holds at most 511 files, so send the changed pieces (compare `build-manifest.json` with the last published
commit's) rather than all of them.

## A core module: where it goes next

This was `kits/characters` until 2026-10-16. It moved to `core/` because it is meant to be shared: the bodies, the
records, the peoples and the clips are what every settlement's citizens will be drawn from. It is still a build of its
own (`build.py`, `src/`, `dist/`: the two labs), which `tools/make_index.py` and `tools/audit_port.py` list through
`CORE_BUILDS`; no settlement includes its fragments yet.

**Lessons learned** are kept in the `character-modeling` skill (`.claude/skills/character-modeling/`, zipped as
`character-modeling.skill` at the repo root): read it before working here, and add to it when a fix teaches something
(the root `README.md`, "Skills", says how to keep the two copies in step).

**The plan** (GODOT-PLAN.md Phase 5, "Bodies for the citizens"):

1. **Replace the citizen stand-ins.** A settlement's life layer draws each citizen's record from its people
   (`KCHAR.stranger` / `KCHAR.crowd` with the citizen's id as seed, so the same citizen always looks the same), dressed
   by class (peasant, trade, court) from `data/peoples.json`. The figure (`50-figure.js`) and its pieces replace the
   stand-in mesh; the simulation keeps deciding where a citizen is and what it does (`core/simulation`), the figure
   only shows it. Crowds need a cost plan first: instancing or impostors past a few dozen figures, LOD (a lighter
   body and fewer cloth chains far off), and the pieces' download budget.
2. **Line up the work tasks with clips.** Map each activity (`core/simulation/ROADMAP.md` §26, the portable
   primitives, plus a build's own: FETCH_WATER, HERD, SMITH, TRADE, SLEEP...) to a clip, a prop and a loop or one-shot
   in a table beside `data/clips.json`, and list the activities with no clip. Fill the gaps from the libraries
   already used (Meshy's animation library, Quaternius UAL), Mixamo clips the owner supplies, or made clips
   (`derive`, as the hammer, dig and thrusts are).
3. **A quality pass, before citizens use it at scale:** clothing (skin and under-layers through garments at the
   slider ends, sleeves, hems in motion, the generated garments' tailoring), posture (the retarget's straightened
   spine is offset after the clip, not fixed in the retarget: `KNOWN_ISSUES.md`; the Animation Lab's Posture panel
   writes `data/posture.json`), and animation (hands through hips on heavy builds, made clips that read as made,
   the review marks in the Animation Lab).

## How it works

| Step | Where | What |
|---|---|---|
| 1. Blender | `tools/mpfb_build.py` | Builds an MPFB human (Mixamo rig, `detailed_helpers` so the rig lands right), loads the brows, lashes, eyes and every library item in `ITEMS` (clothes per slot, hair, beards: MakeHuman fits each to the body and interpolates its weights from it), exports the base and each item as a GLB on the same rig, with a `_VIDX` attribute (each vertex's Blender index) and each item's delete group. Then, per slider end (macros: age, muscle, weight, height, proportions, and bust and firmness on the woman; the three ancestry shares; 35 face targets), it sets the target, lets MPFB refit the rig and every item, and records how far each vertex of every mesh and each joint moved: `morphs.npz`. |
| 2. Pack | `tools/make_mpfb.py` | Per GLB: shrinks the textures, makes the skin, hair and iris textures neutral (the page multiplies the colours in: `kit.tint`; the irises' mask rides in the eye texture's alpha), drops alpha channels that hold nothing, stores hair as grey + alpha, sets cut-out or opaque alpha (Blender's exporter marks everything BLEND), drops normal maps that are colour images; the few items far denser than they look (`DECIMATE`: the flats and the pirate boots, twice the body's triangles a pair) keep a tenth of their triangles (`tools/decimate.py`: quadric collapse onto their own vertices, so UVs, weights and the morph deltas still match; borders and seams held). Delete groups become a bitset over the skin's triangles; an item with none gets one from rays cast out and in from the skin (`covered()`), and a top with one gets those rays' triangles too (its delete group stops short of the shoulders and chest in places, where the skin came through). Hair and beard textures are made neutral with their clear texels filled at the mean grey (left black, they darkened the mips and the thin beards drew darker than the hair). For the Godot twin it also writes `<id>.gshapes.bin` (GSH1: per surface and target the shape whole as float32, its positions and its normals turned as the target turns the faces, which Godot blends NORMALIZED, the linear blend the page gets by re-summing normals; the skin's cover regions, by the items that cover each, which Godot joins into one surface and hides by region; the ground). The deltas become one `KMR1` file per GLB (`<id>.morph.bin`: per mesh, per target, the vertices that move, int16 at 0.1 mm); the joint deltas, sliders and ancestry go into `data/mpfb_<body>/kit.json`. Clips are retargeted onto the rig (`make_pieces.write_anims`). |
| 3. Record | `src/10-rig.js` | `KCHAR.morphWeights(record)`: one weight per target (a slider at v < 0 weighs its minus end by -v, at v > 0 its plus end by v, times its reach; ancestry weighs each race by its share minus the base's). `KCHAR.morphJoints`: each joint's rest moves by the weighted sum of its deltas. `KCHAR.stranger(seed, kit, people)`: a record drawn from a people's ranges with `KRAND`. |
| 4. Figure | `src/50-figure.js` | Blends each live mesh's deltas on the CPU (`_vidx` maps a glTF vertex to its Blender vertex; a seam's halves move together), re-sums normals over source vertices, moves each bone's rest and its inverse bind by the joint delta (`IBM * T(-d)`, so the skinned rest is exactly the morphed mesh), keeps the feet on the ground, hides the skin under worn items, and tints skin, brows, hair and beard. |
| 5. Pages | `src/90-editor.js`, `src/92-animlab.js` | The Cosmetic Lab: Gear (clothes, dye), Head (people, skin tone, hair, hair colour, beard, eye colour), Body (ancestry, build), Face (35 sliders), Record (the record as text, roll a stranger, strangers in bulk). The Animation Lab: six figures, the clips, review marks. |

**The record**: `{ body:'mpfb_male', armour:{head, torso, legs, feet}, hair, beard, skin:'#rrggbb', hair_color:'#rrggbb', eye_color:'#rrggbb',
morph:{ <slider>: -1..1 }, ancestry:{african, asian, caucasian}, people, dye:{slot: '#rrggbb'} }`. Colours are albedo.

**Clips** (`data/clips.json`, about 140 in each body's `anims.glb`): walk, run and the idles, plus actions grouped
as move, melee, ranged, block and dodge, hit and fall, swim, ladder, daily life and work. Two sources, both retargeted
onto the rig by `make_pieces.write_anims` (bone directions matched, hips motion scaled by height):
Meshy's animation library (`meshy` ids, fetched on the scout donor's rig with `tools/meshy.py anims`, 3 credits each:
`donors/anims/actions*.glb`) and Quaternius's Universal Animation Library 1 and 2 (`ual`, CC0:
`donors/anims/UAL*.glb`, an Unreal-style skeleton mapped by `NAME_MAP`). `loop: false` clips play once and go back
to the last loop. Loops play in place: their drift over a cycle is taken out and kept as `root_speed` (m/s, in
`skeleton.json`'s clip list) for a game to move the character by; one-shots (rolls, knockdowns) keep their motion.
Neither library has hoeing, hammering, a pickaxe or a straight thrust, so some clips are made (`derive` in
`data/clips.json`, `make_pieces.derived_clips`, posed with `_Rig`: forward kinematics on the canonical skeleton, a
two-bone solve per arm, the hand turned to hold its prop a given way). **Hammer at anvil**, on the standing idle: the
spine leans into each blow, the right hand lifts the hammer over the shoulder and brings it down onto an anvil just
below the hips in front (the handle forward and the face down as it lands), and the left hand rests on the work.
**Dig (hoe, pickaxe)**, on the standing idle: both hands on the handle, lifted over the right shoulder with the head
swung back and brought down in front as the spine bends into it (it was the one-handed heavy swing looped, its left
arm across the chest). **Thrust / stab** (dagger, sword), from the combat stance: the hand drawn back to the ribs and
driven straight forward at chest height, the point leading, the right shoulder turned into it (Meshy's 'Thrust Slash'
stabbed overhand, the point up). **Spear thrust**: the same underhand, the right hand at the hip on the butt end and the
left forward on the shaft. **Spear advance** keeps Meshy's 'Spear Walk' legs and body (fetched as `spear_walk@src`, a
source only) with the arms at the spear thrust's guard (it held the spear with the right hand behind the back).
**Props** (`tools/make_props.py` -> `pieces/props/*.glb`, `data/props.json`): 18 hand-held things built from
primitives (sword, dagger, axe, mace, war hammer, spear, shield, bow, crossbow, rifle, pistol, pickaxe, hoe, hammer,
bucket, cup, lantern, torch) and an arrow, each modelled in the grip frame: +Y along the handle out past the index
finger, +Z the way the fingers point, +X out of the palm. `make_mpfb.py hands()` measures that frame on each body's rest
hand (skeleton.json `hands`: the grip in the hand bone's space, the arm's three bones, and per grip style, per finger
joint, the rotation that closes the hand: `fist` round a handle, `trigger` with the index finger along a gun, `wide`
round a cup; a prop's `grip` picks one). A clip's `hold` in `data/clips.json` names the props each hand may take,
default first; `fig.hold({R, L, both})` hangs the GLBs under the hand bones and curls those fingers after every frame
of the clip; the Animation Lab's Holding picker swaps the right hand's prop among the clip's choices. The shield is
held by its centre grip with the board out past the back of the hand (made the other way, every clip faced its boss
into the body); in a lower hand a prop with `low_turn` turns about its handle so the shield stands up, board out.

*Two hands.* A clip's `two_hands` names the props the left hand also holds in it (the spear, the rifle and crossbow,
the hoe, the axe, the war hammer and the mace in the clips made for them, and the two-handed parry). A prop's
`support` is a segment of its handle; each frame the left hand goes to the point of it nearest where the clip has the
hand (within the arm's reach, a hand's width from the right hand), turned round the handle so its fingers point away
from the shoulder, and a two-bone solve (upper arm, forearm; the elbow kept on the side the clip bends it) brings the
arm there. When the left arm cannot reach, the right brings the prop toward the left shoulder by the shortfall (up to
45 cm) and both reach; if the hands are still too far apart the arms ease back to the clip's own pose
(`fig.reach` says how far short the hand fell).
*The bow* has no modelled string: the figure draws it between the limb tips (`string`), through the right hand while
that hand is behind the bow and near its middle, turns the bow about its handle to face the drawing hand, and nocks
the arrow once the string is pulled (`fig.drawn`).

**Voth clothing** (`tools/make_garments.py`, Blender + MPFB): the Chichani's own clothes in three classes per body,
made here as MakeHuman clothes (so MPFB fits, weights and morphs them like the library's): peasants in undyed maguey
and cotton (a field cloak and loincloth; a plain huipil and wrap skirt; maguey sandals), tradesfolk in dyed cotton with
banded hems and step frets (a sashed xicolli over a wrap kilt under a shoulder mantle; a banded huipil over an ankle
skirt; heeled sandals laced up the shin), and the court in Voth's purple and ash-white with crimson, gold and quetzal
green (a robe with bell sleeves, a feathered mantle, a gold collar and a cloak over a long skirt and apron; a huipil
under a pointed quechquemitl cape over a two-tier skirt; gilded sandals and greaves). Aztec cut, Dunmer layering.
Headgear is its own slot (`head`): tradesfolk wear a wrapped head cloth with a hanging tail (it hides the hair: kit
item `covers_hair`), the court a gold band with a quetzal-feather fan that sways. Headgear only comes with a people's
outfit; a random stranger never draws it. Every Voth item carries `culture: 'chichani'` in the kit, so only Chichani
strangers draw them (`KCHAR.stranger`).
**Fabrics.** Every part is painted (colours, bands, motifs) and then takes a material-library set's grain, multiplied
into its colours at a clothing tile size (`FABRIC`, 12 to 30 cm a tile): the set comes from the paint's base colour
(`FABRIC_OF`: maguey burlap, linen, coarse cotton, the Republic's wool and quilting, velvet, silk, bazin, leather,
buckskin, fur, felt, nacre, the metals; a plain weave otherwise) or `P(fabric=)`, and boots and sandals take leather.
Named per garment: plaited straw for the petasos and the Fulani cone, astrakhan for both papakhas, brass braid for the
Hall's festive epaulettes and the Free Giants' torc, glass beads for the Dalab bead cap and the Beast Riders' bead
belt (and the `beads` motif), oiled cloth for the Izani rain hood.
The cross-stitch, Saxon rosette, bogolan and feather motifs take their stitches from the pattern sheets
(`SHEETS`), recoloured in each garment's own two colours. The sets and their sources: `prompt-clothes.md`.
Each garment is built on the body from lofted parts: rings cast out from an axis (the spine, an arm through its
elbow, a foot) to the skin and set off it; below a hang line a ring only grows (cloth falls straight from the chest
or the hips instead of hugging the waist) and spans hollows (its convex hull: between the breasts, round both legs);
tunics are fitted to the skin without the arms, so the arms pass through armholes the sleeves cover; mantles and
capes are fitted over the arms. Rows below the crotch match MakeHuman's skirt helper, and `make_mpfb.py` pools the
legs' skin weights below the crotch (`skirt_weights`), so a skirt or a robe's hem swings as one piece instead of
parting round each thigh.
The textures are painted in the same script (woven grain, hem bands, step frets, zigzags, the diamond of Voth,
feather scales). `--render <dir>` loads the garments back through MPFB and renders each class front, side and back.
`data/peoples.json` gives the Chichani `outfits` per class (torso, legs, feet and, above the peasants, head) and `tiers` (60 % peasants, 30 % tradesfolk, 10 % court):
their strangers and crowds are dressed by class (`record.tier`), and the Cosmetic Lab's Gear tab puts any of the six
outfits on with one chip. Its Wardrobe row narrows the clothing pickers to one people's clothes (the kit item's
`culture`), MakeHuman's library (no culture) or all of them; picking a people on the Head tab opens its wardrobe.

**Izani clothing** (the same tool, `iziz_*`): Iziz's people, science fantasy without the machines (a thousand years
in the Ancients' ruins, in a rain jungle; LORE.md 6.2, `settlements/iziz/DESIGN.md`). Commoners in undyed oat and moss:
a wrap tunic with a sash and its hanging end, bark-brown field trousers, shoes with cloth wound up the shin, and a rain
hood with a cowl (it hides the hair). The guilds (salvagers, hunters, the Watch) in sand under saddle leather: a tunic
under a long open-fronted coat with a standing collar, a belt with pouches, a plate of salvaged Ancient hex armour on
the left shoulder, slate trousers tucked into tall boots. The court in verdigris and cream with copper: a long robe with
bell sleeves, a high collar, the sun of Iziz woven down the front as a tabard and a sun-orange cape (a gown with a
floor-length train over a cream skirt for women), soft court boots, and a sun crown: a gold circlet with the palace's
orb at the brow and a rigid sun halo of copper rays behind the head. The parts the Voth set lacked are in the tool:
`trousers` (a seat and two legs through the knees), `boots` (sole, shaft and a foot closed past the toes, roomy at the
top so trousers tuck in), `hood`, `blob` (pouches, the orb), `pauldron`, and paint `panels` (a column of motif down a
tube: the woven tabard). Made clothes that hang (tunics, coats, robes, skirts, not trousers: `make_mpfb.hangs`) pool
their leg weights, are pushed out of the legs and hide no skin below half height; `culture` comes from the prefix.
`data/peoples.json` dresses Izani strangers by class: 55 % commoners, 32 % guild, 13 % court.

**Beast Rider and Hykkousoi clothing** (`beast_*`, `hykk_*`). The Beast Riders are Mongol and Apache:
- **Tribesfolk:** a fringed buckskin shirt with a bead yoke, leggings and a breechcloth, knee moccasins, a headband
  with a tail.
- **Riders:** the deel (the wrap coat, its closure off to the right), a sash under a stack of animal belts (tiger,
  snake, teeth, claw) with trophies hanging, a bandolier of teeth, a fur pauldron, riding boots, a fur-brimmed hat
  with a spike and two quills.
- **Chiefs:** the tribes' green deel with a quetzal mantle and outsized bone pauldrons (men), under bone horns on a
  fur cap (men) or the Khalkha winged headdress hung with beads (women).

The Hykkousoi are Greek and Roman, of the sea:
- **Sailors:** the exomis, pinned over the left shoulder so the right and its gills are bare (a short chiton for
  women), a rope belt, sea sandals, a broad petasos.
- **Marines:** a cuirass of nacre ribs (pink and green by turns) over a tunic, nacre pauldrons, a short cloak, a
  strip skirt, laced sandals with bronze greaves, a bronze helmet with a sea-blue crest.
- **The Archon's court:** a long sea-linen chiton, a nacre shell collar, the himation across from the left shoulder,
  a cloak, gilded sandals, and a diadem with the wave-sun as a scallop behind the head.

**Dalab and Yuni clothing** (`dalab_*`, `yuni_*`). Dalab is Cahokian earth and Tiwanaku stone, and its people are
green (the photosynthesis mod):
- **Commoners** dress for the sun, the skin bare to it: a kilt or wrap skirt with the step fret, a sash from the left
  shoulder, bead armbands, and a breast band for women.
- **Traders:** a sleeveless terracotta tabard with a turquoise step panel, a belt with pouches, calf trousers, laced
  sandals, a bead cap.
- **Genepriests:** white with the holy red, The God's eye woven down the front, a gold pectoral of rays, bell sleeves,
  a red train for women, and the mitre of the Eye (a tall gold mitre with the one great eye on its face before a halo
  of rays).

Yuni is Sahelian, with Gaudi and Burmecia for the families:
- **Commoners** in bogolan mud-cloth: a boubou or blouse, loose trousers or an indigo wrapper, a Fulani cone hat or a
  head wrap.
- **Merchants:** the grand boubou (one great sheet over the arms from the shoulders to the shins, its chest worked in
  yellow), under-trousers, babouches, a kufi or a towering gele.
- **The families:** a gown banded in trencadis mosaic, a scalloped mosaic collar, bell sleeves, silk babouches, and the
  hyperboloid of Yuni as a hat.

**Iron Republic clothing** (`rep_*`, `iron_republic`). The Republic was born of a legion's mutiny (LORE.md 6.3) and is
austere and military: its citizens dress as a citizen army, in field grey, drab and iron black wool cut like uniforms,
the Republic's red only as piping and collar tabs, brass only on buttons and buckles, no folk ornament:
- **Citizens:** a grey wool tunic with a standing collar piped red, a button placket and a belt, grey trousers, tall
  black boots, a cloth cap with a red band; for women a plain dark wool dress to mid-calf with a high collar, a belt,
  a drab apron and a plain headscarf.
- **Guildsfolk** (Salvagers, Smiths, Mechanics, Rocketeers), men and women alike: a quilted drab jacket with iron
  salvage plates on the shoulders, a leather apron, a belt with pouches, breeches or a work skirt, work boots, an
  ushanka.
- **The Hall of the Republic:** a double-breasted iron-black greatcoat with two rows of brass buttons, red piping,
  the triskelion of sword-arms small on the collar, plain epaulettes, a leather cross-belt, breeches or a black skirt,
  riding boots and a grey papakha with a red crown.
**Its festive dress** (`rep_*_fest_*`, tiers `*_fest`, about one stranger in ten; an alternative set beside the
austere one, for feast days, weddings and the Hall's ceremonies): the Republic's folk side, Russian and Transylvanian
Saxon. Citizens in a linen kosovorotka worked in red cross-stitch with a red sash, grey-blue trousers, felt boots and
a felt cap with a fur band; women in a red sarafan over a linen blouse, a black apron with a rosette border, a red
headscarf. Guildsfolk in the ochre quilted jacket and brown breeches; women in the long belted Saxon coat in red, a
black skirt with a rosette band and the Borten (the tall black velvet cylinder with ribbons behind). The Hall in
state: a red greatcoat frogged in ochre with a row of triskelions at the hem and cuffs, epaulettes, a cream sash,
cream breeches, a black papakha with a red crown; women in a red velvet gown, a lace collar, a fur-edged cape and
the kokoshnik.
Motifs added for them: `buttons`, `buttons2`, `quilt`, `triskele`, `frog`, `cross` (Slavic cross-stitch), `rose`
(a Saxon rosette). The caps, headscarves, ushankas and papakhas cover the hair (`COVERS_HAIR`); the Borten and the
kokoshnik leave it showing. The textures these clothes (and every culture's) want are in `prompt-clothes.md`: the
library sets they can use as they are, and prompts for the gaps.

Shapes added for them: `tower_hat` (a hat that rises from a band fitted to the head with any profile: the mitre, the
hyperboloid), `eye_disc`, `armbands`; motifs `trencadis`, `bogolan`, `eye`.

All these sets follow the look LORE.md section 5 sets for every culture, Moebius and Jodorowsky's Dune: one big shape per
figure, flat calm colour fields with one accent, organic ornament. The tool's shapes for it: `band` (a tilted band:
bandoliers, the exomis strap, the himation), `horn`, `wing`, `brim`, `collar_disc`, `crest`, `pendants`,
`animal_belts`.

**Body mods** (`tools/mods.py`, `tools/arms2.py`): what a genetic or cybernetic mod adds to a body, worn like an
item (kit items in slot `mods`, the Cosmetic Lab's *Body mods* chips, `rec.mods`). Every body's skeleton carries a
second pair of arms' joints (`Left2Shoulder`, `Left2Arm` ... `Right2HandThumb3`), whether a mod uses them or not. The
copy hangs lower than the upper pair (out of the lower ribs on any torso: `arms2.drop`, 25 cm on the man and the
giant, 20 cm on the woman's shorter torso) and nearer the axis, from Spine2 (`arms2.fwd`: 1.5 cm ahead of the upper
pair on the woman, 1.5 cm behind it on the man's deeper chest), and 30 degrees steeper (`HANG`, near its
usual pose); the joints get their sources' morph deltas (`morph_kit`), capsules (cloth, push) and grips (`hands.L2`,
`hands.R2`). So the clips, the grips and the lower-arm controller are the same on every body, and nothing is drawn on
the joints until a mod is worn:
- `mod_arms_flesh`, the genetic pair: each arm's skin and nails copied onto the lower joints. Its root is
  shrink-wrapped onto the ribs and takes the torso's weights, fading over 9 cm from its open edge, so the arm grows out
  of the side of the ribs and bends with them.
- The cybernetic pairs, one builder (`cyber_arms`) and three designs (`CYBER`): jointed limbs, each part rigid on its
  bone, on a mount plate on the ribs, sized to the body's own arm (`ARM_REF`, the man's), so they fit the woman too.
  `mod_arms_cyber` bronze plates with steel joints and five fingers; `mod_arms_loader` heavy steel with hazard-yellow
  bands, hydraulic rams along each segment and three-fingered claws; `mod_arms_surgical` slim white ceramic with teal
  bands, a cable bundle from the mount into the shoulder and fine fingers. Each joint is a ball wider than the plate
  ends that run into it, so a bend shows ball rather than a gap. A new design is a `CYBER` entry and a `MODS` row.
  Their textures are prompts in `core/materials/PLAN.md` (Characters: cybernetic arms and the giants' metal). The Animation Lab's Body mods menu puts any of them on the whole cast.
- The replacement pairs (`mod_arms_cyber_up`, `mod_arms_loader_up`, `mod_arms_surgical_up`, group `arms_up`): the
  same three designs in place of the body's own arms, on its own arm joints, with a dome on each shoulder over the
  edge of the skin they replace. The item's `hide` is that skin (`arm_skin`: every triangle weighted at least half to
  the arm below the shoulder), which `KCHAR.hidden` (and Godot's) leaves out like a worn item's; the fingers are thick
  enough to hold the body's own nails inside. They wear with any lower pair (`Four bronze arms` in the Animation Lab).
- `mod_gills`, rib gills: four slits a side over the ribs (from the lower ribs up toward the armpit), a lip of skin over a dark slit, ray-cast onto the body. The
  Hykkousoi have them (`peoples.json` `mods`: all their strangers); anyone else can wear them.

A mod's vertices name the MakeHuman vertex whose deltas move them (`_VIDX`), so the sliders reshape them with the body;
the flesh arms and the gills take the skin tint. A mod says what it grants (`grants.arms` 4, `grants.gills`) and its
group (one pair of arms at a time). `KCHAR.arms(rec, kit)` is 4 when a worn mod grants it. No clip moves the lower
arms: the figure drives them from the upper pair after each clip (`arms2` in `50-figure.js`, `_arms2` in
`kchar_figure.gd`), only when the body has four. In most clips they keep a guard of their own (forearms forward, hands
loosely closed before the belly) and take a share of the upper arms' motion by clip group (`SHARE`: a walk or a block
half of it, a blow or a shot little); in climbing, swimming and falling they copy the upper arms whole. They follow
with a lag of 0.09 s, and `bodyFix` keeps them out of the body, the thighs and the upper arms. `hold({ R2, L2 })` puts
props in the lower hands.

*Why not hidden arms baked into every body?* Invisible geometry costs every figure its vertices and morph deltas, and
one fixed pair could not be both flesh and machine. The joints are cheap (some 40 bones that nothing weights until a
mod does), so they are always there; the geometry comes with the mod.

*Four-armed clothing.* Torso items carry an arm count (kit item `arms`, 2 when absent). A four-armed body wears only
four-armed tops, a two-armed body never (`KCHAR.fits`: the wardrobe hides the rest, a stranger is not drawn in them, a
torso that stops fitting when a mod goes on comes off). In `make_garments.py`, `four_armed` opens a top where each
lower arm comes out of the ribs (its holes' vertices dropped, listed in `.cloth.json` `gone` so the cloth chains still
find theirs; straps, belts and jewellery are never opened), `sleeves2` and `armbands2` fit sleeves and bands to
where the lower pair hangs, and `make_mpfb.py` (`mods.fit_four`) gives the lower sleeves the flesh arms' weights,
then splits them into a piece of their own (`mods.split_lower`, kit item `sleeves2`): `KCHAR.parts` draws it over
flesh arms and leaves it off a cybernetic pair (a mod with `bare`). The two-armed library and culture tops have no
four-armed version: only the giants' clothes do, since giants are the four-armed people a city meets.

**Giants** (`tools/giant.py`, `make_mpfb.py giant`): LORE.md's engineered giants, green and about 3.6 m (3.4 to 4.1
with the sliders). A giant is the man's MakeHuman body, built again from his export, with two changes:
- **Big and slow.** `kit.scale` (2.0) scales the whole figure, and its clips play at 1 / sqrt(scale) of their speed (a
  pendulum's pace, `fig.cadence`): a giant walks as something heavy does. A game moving one by a clip's `root_speed`
  multiplies it by sqrt(scale).
- **The man's clips** (`kit.anims`: no anims.glb of its own).

Its four arms are the flesh mod. NPC giants are of two peoples (`data/peoples.json`):
- **Giants of Dalab** (`giants`): street patrols (70 %, two-armed, the Dalab kilt, sash and sandals) and the priests'
  temple guards (30 %, the flesh pair; the god's harness: a gold pectoral of rays, red straps crossing to a gold belt,
  gold bands on all four arms, `giant_dalab_m_harness4`).
- **Free Giants** (`free_giants`), who rebelled and left for Giant Country, dressed as Gauls (weld-yellow and woad
  wool in madder checks, `tartan` and `knot` motifs): clansmen in a belted long-sleeved tunic, checked braccae and
  wrapped boots (55 %); four-armed clansmen (15 %, the tunic with four sleeves); warriors (22 %, four-armed: a hide
  jerkin, a baldric, bronze bands on all four arms, the horned bronze helmet); chiefs (8 %, four-armed: a woad tunic
  in black checks, a madder sagum pinned with a bronze brooch, a gold torc). The four-armed among them are temple
  guards who escaped.
The giants' own clothes (`giant_*`, made on the man's body) are worn only by the giant; of the man's items the giant
wears a few (the Dalab kilt and sandals, the Voth loincloth, the bead cap, the sun sash, some hair and beards: kit
culture `giants`).

**Cloth** (spring-bone chains): the Voth garments' hanging parts swing. `make_garments.py` picks chains on each
garment as it builds it (every ~7.5 cm round a skirt or robe hem, ~10 cm across a cape, flap or apron; a bone per
~12 cm, shorter near the top), from the row where the cloth starts to hang down to the hem (a robe or dress that
reaches below the crotch hangs at the back from just under the seat, not from the chest or waist, so the buttocks
never push through it), each chain hanging from
the spine joint above it, and writes them beside the garment (`<id>.cloth.json`). `make_mpfb.py cloth_bones` turns
them into joints of the garment's GLB ('cloth:<item>:<chain>:<bone>', inverse bind T(-p) at an anchor vertex) and
weights the cloth below each chain's top to the two chains either side and the bone of its stretch, except cloth that
lies on the body: within 4 cm of the skin it keeps the body's own weights, fading to the chains' by 9 cm (`CONTACT`),
so a tilma lying on the back, a mantle over the shoulders and a skirt's band over the hips move with them (on chains
held by the chest a cloak swung into the small of the back as the idle leaned forward); never over the legs, where a
skirt lying on a thigh must leave it as the leg swings, nor for a legs item at all (a loincloth's back flap took each
buttock's weights and pinched to a strip as the legs stood). A mantle or a cape (layer 2) lies on the garment's own
layers under it as on the skin (over a tunic's shoulders or a bone plate it stood more than 4 cm off the skin, went to
chains held by the spine, and the shoulders came out through it as the arms came down from the A-pose), and where it
hangs clear of both it takes none of the arm's weight, the collarbone's instead (a cape's side edge took the A-posed
upper arm's and swung out as the arm came down); within 1 cm of that cloth it takes its weights outright, fading out by
5 cm, so the two move as one. Only cloth that does not hang counts (a tunic above its chains, a plate, a collar): a cape
counted as lying on a robe's swinging back took the hips' and thighs' weights and the robe swung through it; nor does
the skin of an arm (a cape's flared side near the A-posed forearm took its weights). `kit.json` keeps
per chain its parent joint and anchor vertices, and `skeleton.json colliders` the body's capsules (thighs, shins,
pelvis, chest, arms: a base radius and its change per morph target, `KCHAR.colliders`; for the push a radius at each
end, `ra` and `rb`, since a limb tapers; and the seat, a pair of upright capsules behind the hip joints that cover the
buttocks, whose ends are rest points carried by the Hips joint, `pa` and `pb`). The figure (`50-figure.js`
cloth section; `kchar_figure.gd _cloth_*`) reads each chain's rest off the morphed garment. **The rest follows the
body, not the A-pose** (`HANDOFF-CLOTHING.md`, 1): `kit.json` keeps per chain point the garment's own body weights
from before the chains took the cloth (`bw`, `make_mpfb.py cloth_bones`), and while a clip plays a chain wholly above
the hip joint rests where those weights (not the legs') put each of its points in the current pose, and one reaching
below the hips keeps the shape it hangs in from its parent joint and moves with its top point (`rigidTargets`,
`_rigid`; the chain's root joint is placed there each frame). Held rigid by the chest, a mantle's back stayed where
it was fitted while the spine under it bent in the clip and the posture pass drew the shoulders back, and the tunic it
covers came out through it over the whole upper back; followed point by point below the hips, a robe's skirt bunched
at the legs and its cape went round to the front in a stride. In the A-pose (no clip, no posture) the chains rest as
fitted (`posedRests` also reads the postured bind rest, `placeChains`). So a broad or tall body's
skirt hangs from its own hips, then runs every chain point as a Verlet particle at 60 Hz: pulled to its rest
by the part's stiffness (mantles stiff, capes loose), under Krator's gravity (7.4 m/s²) and the drag of Voth's dense
air, with the wind of a walk or run played in place (its `root_speed`), kept to its length, near its neighbours round
a skirt, out of the capsules (not the arms': an elbow hanging at the waist pushed one chain of a cape's edge out and
the cloth below it swung away alone as a spike; the push keeps vertices out of the arms) and above the floor; each bone then turns to the next point. A point inside a limb
that lies across the cloth's fall (a seated thigh, a raised arm) leaves on the side of the point above it, so the
chain drapes over the limb; along an upright leg it leaves on the side away from the body's axis, so cloth never
ends up behind a leg in a stride (the legs only: on the trunk, the chest leaning forward in a clip, that threw a mantle's
points through the body; and not for a point whose rest lies on the thigh's inner side, between the legs, which it threw
out through the thigh). A point is pushed no further out of a capsule than its own rest lies (a robe's chain roots sit
inside the trunk's capsules, and a full push threw the point below each sideways: a Z at every chain's top, the fold),
but out of a leg at least to the bare limb (a skirt's rest follows the hips, and a thigh swung forward over it would take
the cloth in). The seat's two capsules count as one across the buttocks for the chains. `verify.py` measures the fold
on the court robe and skirt (chain segments past 1.5 rad of their rest, idle and walk: 0) and `kchar_test.gd` the same
in Godot. `fig.cloth = false` hangs
them rigid (the Animation Lab's Cloth button). Each part has a `layer` (0 a skirt, 1 a robe's hem, a flap or a
skirt's over-tier, 2 a cape, a mantle or headgear), within its item's slot (legs under torso under head: the figure
adds 3 x the slot's rank, so a breechcloth's flap stays under a shirt's skirt): a chain point stays 3 cm outside the
lower layers' chains near it,
measured out from the body's axis (`layered`). Inside one garment a skirt under an over-tier or apron goes further:
`make_mpfb.py cover_weights` gives each covered vertex the weights of the outer part's nearest vertex, so where the
two overlap they move as one and cannot cross. The same goes for a part that does not hang under one that hangs over
the arms (layer 2: the grand boubou's under-tunic under its sheet, a robe's body under its mantle or cape): each of its
vertices with the outer part within 8 cm straight outward of it takes that part's weights (in full within 5 cm), so a
seated or crouching body cannot carry it out through the sheet the chains hold. Sleeves (weighted to the arms) and
what lies outside the outer part (a belt across an open coat's gap) keep their own.

**Clipping** (both runtimes, every frame after the clip): a garment marked `loose` in the kit (the Voth tunics, robes
and skirts, the kimono, the long skirts) has every vertex pushed out of the thighs, shins and feet on the GPU after
skinning (`pushOut` / `kchar_push.gdshader`, which in Godot also carries the garment's own look: albedo, alpha
cutoff, normal map), so a knee cannot come through between two chains, and out of the seat, so a robe's back covers
the buttocks. Each capsule's radius runs from `ra` to `rb` along it (the thigh from about 12 cm at the hip to 8 cm
at the knee, the shin from 8.6 cm at the calf to 5.3 at the ankle on the man): at one radius the calves and the tops
of the thighs came through the robes. The upper arms and forearms keep one radius (tapered, they drew a tunic's
sleeve and the mantle over it into the same shell, and the mantle broke up jagged). They are hard
capsules in the same pass (only what is inside them moves), so a raised arm lifts a mantle's or a cape's hem. The push is a soft
band, not a projection (a vertex d from the bone within r + 1.5 cm lands at r - 1.5 cm + d x 3 cm / (r + 1.5 cm)), so
two tiers keep their order and cloth that already lies right barely moves (a 4 cm shell outside r moved everything
within 4 cm of a capsule out by up to 3 cm, and a loincloth's flaps, a kilt's seat and a robe's back crumpled at
rest); a thigh pushes nothing behind it in its top third (its capsule runs down the femur, toward the outside of the thigh,
and at the radius that covers the flesh within it took in the buttock: the seat covers that), though in front it
does (else a kimono showed wide harem pants at the hips); a garment of a band and flaps alone (`make_mpfb.py FLAPS`:
the loincloth) is not pushed at all, its chains keep it off the legs (pushed, a flap between the thighs in a stride
went out of each sideways and its corners stood out like wings); a vertex inside a leg leaves on the side away from the body's axis, never behind the knee; and a
torso garment's shell is 2 cm wider (at 1.2 cm a bent knee's thigh came through a gown's front), so a robe's hem
lies over the skirt under it, and 3.5 cm wider again over
trousers (at 2 cm a stride's knee came through a deel's front; trousers stand further out of the capsules than a skirt's chains). The chains collide the same way,
and still do with cloth off (no swing then: each frame starts from the rigid rest). A top that closes round the waist
(kit item `tucks`, `make_mpfb.py encloses()`: rays out from the hips meet it all round; an open cloak or a cropped top
does not) has the trousers or skirt under it tucked: their band above the hips drawn in toward the body's axis by up
to 2.5 cm, so a waistband stays under the top in any pose. Under a loose top that reaches below the knees (kit item
`long`: a robe, the kimono) trousers below the hips are drawn in to within 8 mm of the legs' capsules (their
tapered radii; each vertex to its nearest capsule only: drawn to all six, a shin's was pulled into a ball round the
knee and the inside of each leg toward the other, and the court's legs came out thin), so wide ones (harem pants)
stay under it (`kcS`): at one radius per capsule they sank into the calves
and the court's legs read thin, and drawn in less (2.5 cm) they came out through the robes' knees. Boots under such a
top are drawn in to within 1.4 cm (`kcSF`; Godot sets `kcS` on the feet part), whatever the legs wear: the hero boots'
cuffs came through the kimono's hem at the shins. Breeches and braccae have legs, so like trousers they are not
`loose` and their weights do not pool below the crotch (`make_mpfb.py hangs`): marked as skirts, the Republic's
breeches and the giants' braccae were pushed off the thighs and swung as one sheet.
**Headgear** moves with the head: `make_mpfb.py head_weights` gives every vertex of a head item above the neck the
Head joint's weight alone (MakeHuman weights a garment from the skin nearest it, so a broad brim, a wing or an ear
flap took the shoulders' and arms' weights and bent as they moved), and so does every piece of it that reaches no
lower than the neck joint (the chieftess's wing tips and the bead strands under them hung below the cut and trailed
out to the shoulders as long streamers); a hood's cowl and a headband's tails, lower, keep following the neck.
**The feet roll on their balls**: `toesFlat` (`_toes_flat`) turns each toe joint up after the clip until a point 6
cm ahead of it (scaled with the figure) is no lower than the ground, so a clip that stands on the ball of a foot does
not push the toes, and a sandal's sole with them, down into it.
`bodyFix` turns an upper arm or forearm out when the clip puts an elbow or hand inside the pelvis, chest or its own
thigh (a heavy body in a clip made for a slight one), and turns two thighs apart when they overlap.

**Posture** (both runtimes, first after the clip): the clips, retargeted onto MakeHuman's curved spine, stand with
the chest pushed forward and the upper body leaning back, so the spine is bent forward: the woman about 22 degrees (6,
8 and 8 on Spine, Spine1 and Spine2), the man and the giant about 30 (6, 12 and 12: his chest jutted further); the neck
takes back half of it so the head does not drop and the shoulders are dropped 9 and
drawn back 10 degrees. The upper arms keep the way the clip points them, so a thrust or a held spear still aims where
the clip aims it. A clip that already stoops (the standing idle) stoops a little more. The numbers are in
`data/posture.json` (`bodies`: degrees per joint for `mpfb_male` and `mpfb_female`; the giant takes the man's), which
both runtimes read; each figure's live copy is `fig.posture`. **The Animation Lab's Posture panel** (under the review
marks) sets them by hand: a slider per joint for the body chosen, every figure of that body changing at once, in every
clip. Copy JSON gives the numbers back to paste into `posture.json`'s `bodies`; Apply JSON takes pasted numbers. The
panel keeps its numbers in the browser until Reset, which goes back to the file.
**Every frame starts from the clip** (`50-figure.js update`): three's mixer writes a bone only when its value changes,
so on a still frame (paused, scrubbed, a held pose) the passes after the clip turned last frame's already-turned bone
again; each bone is put back to the mixer's own output before the mixer runs. The hips' position track is taken out
of the clips and applied by `hipsTrack` from the rest by each playing clip's weight: left to the mixer, a still or slow
one (driving, kneeling to repair, lying dead) was written on some frames and not others and the figure shook between
the clip and standing. Godot's player writes every track each frame and needs neither.

**Peoples** (`data/peoples.json`): per culture, ancestry ranges, skin colour stops (a stranger falls anywhere along
them), hair and eye colours, the age at which hair greys, beard odds, slider ranges that override the default spread, and
preferred hairstyles per body. The Chichani and Beast Rider entries follow the owner's notes; the rest are proposals
from LORE.md's references, there to be changed.

**Setting up the Blender half** (nothing of it is in the repo, and `pieces/` is gitignored, so a fresh machine
rebuilds the pieces from here). Blender 4.5 LTS from download.blender.org/release (the Linux tarball runs headless
as is); MPFB from extensions.blender.org/add-ons/mpfb, installed with
`blender -b --python-expr "import bpy; bpy.ops.extensions.package_install_files(filepath='mpfb.zip', repo='user_default')"`;
the packs below from static.makehumancommunity.org/assets/assetpacks, and `python3 tools/mpfb_repo.py` for the hair
and beards that come from the community asset repository instead (it applies the texture-name fixes some need), and
`make_garments.py` per body for the Voth clothing. Then per body: `mpfb_build.py` (about 10
minutes: it refits every item once per slider end), `make_mpfb.py`, `build.py`.

**Asset packs** (load them into MPFB once: `bpy.ops.mpfb.load_pack(filepath=...)`): makehuman_system_assets, hair01,
eyebrows01, shirts01, pants01, skirts01, dress01, shoes01, suits01 (CC0); bodyparts05 (beards, CC0); hair02, hair03,
bodyparts06 (CC-BY: `CREDITS.md`).

## Files

| File | What | Port tag |
|---|---|---|
| `src/00-head.html` | the Cosmetic Lab's shell and styles | [web] |
| `src/01-animlab.html` | the Animation Lab's shell and styles | [web] |
| `src/10-rig.js` | `KCHAR`: records, morph weights and joints, strangers, pose (the Meshy kit's sliders), parts, hidden skin. No three.js, no DOM | [G data], twin `godot/krator/character/kchar.gd` (held to it by `tests/golden-mpfb.json`) |
| `src/50-figure.js` | `KCharFigure`: bones from `skeleton.json`, pieces bound to them, CPU morphs, tint, clips | [draw], twin `kchar_figure.gd` (blend shapes from `<piece>.gshapes.bin`) |
| `src/90-editor.js` | the Cosmetic Lab: stage, camera, panel, strangers in bulk; `window._kchar` for `verify.py` | [web] |
| `src/92-animlab.js` | the Animation Lab: the cast of six, the clip ledger, playback, review marks; `window._lab` for `verify.py` | [web] |
| `data/peoples.json` | the peoples (hand-written) | [G data] |
| `data/clips.json` | the action clips: source (Meshy id or UAL clip), label, group, loop, hold, two_hands (hand-written) | [G data] |
| `data/props.json`, `tools/make_props.py` | the hand-held props (grip style, two-handed support, bow string) and the script that builds them | [G data] |
| `data/posture.json` | the posture pass's angles per body (spine, neck, head, shoulder drop and back); the Animation Lab's Posture panel writes its JSON | [G data] |
| `donors/anims/` | the clip sources: Meshy batches (`idles*`, `actions*`, with their request records) and the UAL libraries (CC0, `UAL_License.txt`) | |
| `data/mpfb_<body>/` | `kit.json` (items, hide bitsets, morph sliders and joint deltas, tint) and `skeleton.json` (made by `make_mpfb.py`) | [G data] |
| `pieces/mpfb_<body>/` | `base.glb`, one GLB per item, `anims.glb`, and a `.morph.bin` per GLB (gitignored: rebuilt from the Blender export) | |
| `tools/mpfb_build.py`, `tools/make_mpfb.py` | the two halves of the pipeline | |
| `tools/giant.py` | the Giants: scale, cadence and what they wear (`make_mpfb.py giant`) | |
| `tools/mods.py`, `tools/arms2.py` | the body mods (flesh and cybernetic arms, rib gills), the lower-arm joints every body has, four-armed garments' weights | |
| `tools/decimate.py` | fewer triangles for a dense item, on a subset of its own vertices (`make_mpfb.py DECIMATE`) | |
| `tools/make_garments.py` | the Voth, Izani, Beast Rider, Hykkousoi, Dalab, Yuni, Iron Republic and Giants' clothing: lofted garments, their textures, written as MakeHuman clothes (run before `mpfb_build.py`) | |
| `tools/thumbs.mjs` | the chip pictures (`dist/thumbs/`) | |
| `tools/npcs.js` | strangers in bulk from the command line (`KCHAR.crowd`) | |
| `tests/test-rig.js` | node test of `KCHAR` (build.py runs it) | |
| `tests/make-golden.js` | writes `golden-mpfb.json` (morphs, strangers, parts), which `godot/tests/character/kchar_test.gd` checks Godot against | |
| `CREDITS.md` | the CC-BY items | |

## The earlier Meshy kit

Before MakeHuman, characters were Meshy outfits fitted onto one skeleton and cut into slots (`tools/meshy.py`,
`make_pieces.py`, `make_kit.py`, `data/male`, `data/female`, `data/sliders.json`). Fitting garments made for another
body never got loose clothing right; MakeHuman fits each garment to the body it is worn on. That code still builds
(`python3 build.py --meshy` packs those bodies too), and `make_pieces.py`'s retargeting and `make_kit.py`'s ray test
are used by the MakeHuman pipeline.
