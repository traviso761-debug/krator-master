# Hexahedron — village of the Screamers

Forked from the `ancients` kit. One target, `screamers`, building one settlement:
a tribal village in and under the ruined Hexahedron arcology, in the northern
part of the central crater, hyperjungle, the great volcano far to the south.

    python build.py --target screamers
    python verify.py dist/screamers.html --assert --all-views --out ./shots/x

## Why this forked ancients and not Girder

Girder is the jungle lineage and has the things this brief wants -- sky, life
layer, overgrowth, flyers -- but it is ~7 800 lines against a different kit
(PAL/FAMMAT, its own tube and merged-bucket builders). The Hexahedron is 340
lines that depend on the whole ancients helper ecosystem: gridSurface, lathe,
the kdef/kput instancing kit, holeFn, the decor samplers, the concrete
materials. Porting one building into Girder is not obviously cheaper than
porting Girder's world into ancients, and the only capability ancients actually
lacks is animation, which is a few hundred lines rather than eight thousand.
The jungle look is reproduced from the shared Krator palette canon.

## Orientation

+x east, +z SOUTH (Krator canon). The volcano stands at +z, so the hero cameras
sit north of the settlement and look back across it toward the mountain.
