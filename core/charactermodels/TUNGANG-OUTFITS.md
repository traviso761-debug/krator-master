# The Tungangs' outfits (2026-11-11)

The Rift line's tunnel people for the character kit: four outfits on both bodies, their people, three hand props.
The brief is `kits/tungang/PLAN.md` sections 1.5 and 1.5.1 (branch `claude/tungang-fellgang-kits-a56ece`, commit
`9b92ae8d8`) and `LORE.md` section 6.1. This branch is cut from `claude/garment-defects` at `e5f814a2d`.

Shot sheet: `handoff-shots/tungang-2026-11-11.jpg` (each outfit front and back in the A-pose on both bodies, the four
head pieces, the props in hand, two walks).

## What was built

`tools/garments/cultures/tungang.py` (`build_tungang_kit`, registered as `tungang` in `CULTURE_BUILDERS`), on the
package's types alone; the two hand-made parts (the satchel's box, the glove's palm wrap) carry a role and a side.
24 pieces, 12 a body, ids `tungang_<m|f>_...`:

| Tier (`data/peoples.json`) | Torso | Legs | Head | Gloves |
|---|---|---|---|---|
| `crew` (0.50) | `crew_layers`: dark canvas jacket, the mat's felt as a quilted vest, a grey blanket over the back with its red stripe, a felt cowl, a canvas pouch belt | `trousers` | `hood_goggles_up` | `fingerless` |
| `crew_surface` (0.10) | as the crew | `trousers` | `hood_goggles_down` | `fingerless` |
| `fixer` (0.22) | `fixer_coveralls`: canvas, sleeves rolled, a fungus-leather apron on a halter, a tool belt with a hip spanner and the brass gauge, an amber neckerchief | `fixer_legs` (knee patches) | `goggles_up` | `fingerless` |
| `steward` (0.06) | `steward_tabard`: the faded orange over dark canvas sleeves, bead stripes front and back and round the hip, the berth number on the back (47 the man, 12 the woman), three enamel badges on the left breast | `trousers` | `goggles_up` | none |
| `bookman` (0.12) | `bookman_coat`: the long soot-black coat, brass buttons, a red enamel badge at the collar, the Book's satchel on a cross strap at the right hip | `trousers` | `goggles_up` | none |

Everyone wears `boots` (felt, soled with Ancient tyre). The head pieces are `goggles_up` and `goggles_down`
(bare-headed, the plan's two pieces) and the same pair over the crew's felt hood (`hood_goggles_up`,
`hood_goggles_down`): the head slot holds one piece, so the hood and the goggles cannot be chosen apart.

The people `tungang`: the palest skin and hair stops, pale grey eyes, cropped styles only (`style_share` 1), no
beards, the height slider at -0.75 to -0.45, a little muscle, the eye-size slider at 0.7 to 1.

Props (`tools/make_props.py`, `data/props.json`), at the plan's sizes: `tg_lamp_pole` (1.9 m of conduit, a hook, the
lamp 0.25 m below it, glowing the lamp code's green: the Line), `tg_spanner` (0.85 m, the jaw 0.12 m across),
`tg_bait_tin` (0.25 x 0.15 x 0.10 m, cream enamel, hung from its bail). The satchel is part of the Bookman's coat, not
a hand prop.

One addition to shared code: `paint.py` has a `stencil:<digits>` motif (and `stencil<:`, mirrored) for the berth
numbers. It is a new branch of `motif`; no other culture's strip changes.

## Colours

The plan's hex values, turned linear in the builder (`T`); nothing was added to the shared palette. Three choices of
mine, to confirm:
- **Dark canvas** is `0x45423a`: the plan says "dark canvas" and gives only the canvas (`0x8a8264`), which the Fixers'
  coveralls wear.
- **The berth number sits on a dark canvas patch.** The plan's rust-pink (`0xc88478`) is the same value as the orange
  (`0xc8783e`) and could not be read on the tabard bare.
- **The Fixers' amber neckerchief** is my proposal for their one bright accent (amber is the lamp code's word for
  work). The crew's accent is the blanket's red stripe, the Bookman's the brass and a red badge.

## Checks

On the final build: `python build.py` passes (the kit check, the twin check); `verify.py dist/cosmetic-lab.html
--assert` and `verify.py dist/animation-lab.html --assert` both print `verify: ok`, with the UI inventory unchanged.

`tools/garment_audit.py <out> --match tungang` with `AUDIT_GL=d3d11`: 280 shots, 10 outfits, pixels summed over the
seven clips and four views. **Skin is 0 on every outfit.**

| Outfit | under | inside | hole |
|---|---|---|---|
| man, crew | 6908 | 10784 | 906 |
| man, crew on the surface | 6891 | 10793 | 655 |
| man, fixer | 0 | 17766 | 1969 |
| man, steward | 2421 | 2302 | 600 |
| man, bookman | 2227 | 9289 | 1417 |
| woman, crew | 7907 | 15439 | 909 |
| woman, crew on the surface | 7825 | 15693 | 677 |
| woman, fixer | 0 | 15956 | 1765 |
| woman, steward | 0 | 3889 | 541 |
| woman, bookman | 1261 | 3708 | 892 |

What the numbers are:
- **The crew's "under"** is the trouser legs through the jacket at the outer hips, most of it in the A-pose (2029 px
  the man, 5192 the woman). Both are the same dark canvas, so it does not show on a textured shot. The tubes' sides
  hang from the hips' width (`hang_side`), which took the steward's from 5415 to 2421 and the woman's to 0.
- **The Fixers' "inside"** is the apron: an open panel over the thighs shows its back in a crouch and a run (the
  man's crouch alone is 6213).
- **The crew's "inside"** is the blanket (a cape over the back) and the cowl.
- These sit in the range of the kit's other outfits (the Yuni peasant man's "under" is 6368 after its fix).

## What the body could not express (owed, not faked)

- **Eyeshine.** The eye material has no emissive or reflective term.
- **Finger length.** No morph lengthens the fingers.
- **Eyes past the morph.** `eye-scale-decr-incr` at its top is as large as they go.
- **An exact 0.94.** The height slider stands in for it (the man at -0.6 stands 165 cm); it is a MakeHuman height
  morph, not a uniform scale, and I did not measure the ratio against each body's neutral height.
- **The bead shader.** A garment GLB has one opaque material, so the beads are painted (`0xdcdcd4` on a shadow tone)
  and take the garment's own gloss. The retroreflective flash is a shader for later.
- **Visor glass at 60 %.** For the same reason the lenses are opaque `0x2e3438`.
- **No lamp glows on a garment.** Only the lamp pole's lamp is emissive (a prop material).

## Owed and known faults

- **The hood's crown, fixed in the type (2026-11-15).** The hoods showed a slit of scalp from the brow to the crown
  (the owner's catch; my shots were at eye level and missed it). `types/headgear.py` `hood` now welds its two edges
  where the face opening is shut. The Tungang hoods are rebuilt and shut (the sheet's last row), and so are the
  seventeen other head pieces built on `hood` (eleven on the man, six on the woman: the Voth priest and chosen, the
  Yusar electropriest and electromonk, three Geomancers, the nomad patriarch, the Order's lancer and keeper, the Yuni
  scout cowl): `handoff-shots/hoods-crown-2026-11-15.jpg`, each from above. Only those head pieces were rewritten;
  the other 69 pieces their builders make were put back byte for byte, and no kit entry changed. To look at: the Voth
  priest's helm shows ragged red patches of its cowl through the gold at the crown, and I have no shot from before
  the fix to say whether they are new.
- **A fringe covers the bare-headed goggles.** On the woman's `short03` the hair lies over one cup of `goggles_up`
  and `goggles_down` (the sheet's third row, right). The goggles do not hide hair (`covers_hair` would take all of
  it); the people's styles need a pass for the ones that clear the brow, or the goggles a hair mask.
- **Small dark patches at the steward's hips** (the trouser legs through the tabard, both bodies in the A-pose) are
  smaller than they were but still on the sheet.
- **Hems bell out in the A-pose** (the jacket, the tabard, the coat): the tube hangs over legs set apart. It closes in
  the idle and the walk. The same holds for the kit's other long tops.
- **The pouch belt's pouches** stand off as almond shapes; they are the type's (`pouch_belt`).
- **The hip spanner is short** (17 cm, tucked through the belt): a part hung below the crotch is gathered into the
  skirt's weights and crushed. The long spanner is the prop.
- **The props** were checked in one idle shot each. No clip names them in `data/clips.json`, so no clip puts them in a
  hand by itself, and the bait tin's hang and the pole's second hand are untested in the other clips.
- **The Godot twin** was not run.
- **Thumbnails**: `tools/thumbs.mjs` could not run here (no node `playwright`), so the lab's chips show names.
- Later work, untouched: the Glaziers, the Kradz caver, the Fellgangs.

## To rebuild

```
python tools/garments/build_all.py tungang
python tools/make_props.py
python build.py
python verify.py dist/cosmetic-lab.html --assert
python verify.py dist/animation-lab.html --assert
```

The pieces (`pieces/`) are not in Git: this checkout's came from `../krator-garments`, plus the 24 built here and the
three props. Nothing is pushed, merged or published.
