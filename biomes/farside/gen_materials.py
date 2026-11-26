#!/usr/bin/env python3
"""Write materials.json, Farside's adapter onto the material library (core/materials/PLAN.md), from the table below.

    python3 gen_materials.py && python3 ../../tools/textures/pack.py biomes/farside   (from the repo root: the second)

Kept as a table so the slots read beside the kit's MAT keys (src/50-biome-farside-species.js) and the host's layers
(src/47-host-land.js LAYER_KEYS, src/86-host-works.js)."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
FULL = {'keep': 1.0, 'mean': None}
CELL = lambda i, j: [round(i / 3 + .01, 2), round(j / 3 + .01, 2), round((i + 1) / 3 - .01, 2), round((j + 1) / 3 - .01, 2)]


def card(lib, cell=None, keep=1.0, mean=None):
    f = {'lib': lib, 'scale': [1, 1], 'tint': {'keep': keep, 'mean': mean}, 'size': 512}
    if cell: f['cell'] = cell
    return f


def surf(lib, scale, keep=1.0, mean=None, rough=.3, spec=.2, map_only=True):
    f = {'lib': lib, 'scale': [scale, scale], 'tint': {'keep': keep, 'mean': mean}, 'roughLift': rough, 'specular': spec}
    if map_only: f['mapOnly'] = True
    return f


FAM = {
    # THE KIT (50-biome-farside-species.js MAT): the sea flora
    'stipe': surf('bark.kelp.stipe', 1.2, keep=.55, mean=.62),          # the land kelp's stipes (delivered 2026-10-26)
    'snag': surf('wood.silver', 3, keep=1.0),                           # the dead native trees at the front
    'blade0': card('card.kelp.0'), 'blade1': card('card.kelp.3'), 'blade2': card('card.kelp.7'),   # kelp blades (brown, olive)
    'lettuce': card('card.kelp.1'),                                     # sea lettuce: the green sheets of the kelp sheet
    'wine0': card('card.wineweed', CELL(0, 0)), 'wine1': card('card.wineweed', CELL(1, 0)),       # the red sheet, the branching frond
    'wrack': card('card.seaweed', CELL(0, 0), keep=.35, mean=.55),     # storm wrack drapes, tinted olive by the instance
    'eelgrass': card('card.seagrass', CELL(1, 1), keep=.4, mean=.6),
    'coral0': card('card.reef', CELL(2, 2), keep=0.0, mean=.8),         # the spray coral's branching thickets (white, tinted)
    'coral1': card('card.reef', CELL(1, 1), keep=0.0, mean=.8),         # its tube clusters
    'spongecard': card('card.flora.coral', CELL(0, 0)),                 # the fog sponge towers (orange, ochre)
    'heap': surf('ground.wrack', 1.5, keep=1.0),                        # wrack heaps and windrows (delivered 2026-10-26)
    'crust': surf('organic.sponge', .6, keep=1.0),                      # fog sponge crusts on bark and rock (delivered 2026-10-26)
    'brain': surf('organic.coral.brain', .8, keep=.3, mean=.75),        # coral heads on the terraces
    'coralstem': surf('stone.coral', .6, keep=.25, mean=.8),           # the 3D colonies (staghorn, plates, the terrace lips), tinted by the instance
    # THE HOST (88-host-build.js): the native forest's shrub lobes (biomes/nwlowlands' 'lobe' item, untextured in that kit), a
    # grey leaf mass the shrubs' instance colours tint (the owner, 2026-10-26: "shrub lobes need texture")
    'shrub': surf('leaf.understorey', 1.0, keep=0.0, mean=.62, rough=.4, spec=.1),
    # THE HOST (47-host-land.js): the ground's layers, full colour
    'ground.sand': surf('ground.damp_beach_sand', 2.0),
    'ground.wrack': surf('ground.wrack', 1.5),
    'ground.coral': surf('stone.coral', 2.0),
    'ground.rock': surf('rock.wet.dark', 4.0, rough=.2, spec=.35),
    'ground.burn': surf('ground.burn', 2.5),
    'ground.turf': surf('ground.grass.lush', 1.8),
    'ground.floor': surf('ground.moss002', 2.6),
    'ground.bench': surf('ground.bench', 3.0),                          # the tsunami's scour bench, over the rock (delivered 2026-11-10)
    # THE HOST (86-host-works.js): the works' surfaces
    'works.stone': surf('rock.old_stone_wall', 2.0, map_only=False),
    'works.lime': surf('plaster.white_stucco_02', 2.0, map_only=False),
    'works.wood': surf('wood.weathered_brown_planks', 1.5, map_only=False),
}
NOTE = ("Farside's adapter onto the material library (core/materials/PLAN.md), written by gen_materials.py. The kit's slots are "
        "FARSIDE.MAT's keys (src/50-biome-farside-species.js, BIO.libSwap); the ground's layers are 47-host-land.js's; the works' "
        "86-host-works.js's. Cards keep their own colour unless a slot says otherwise (wrack, eelgrass and the coral are tinted by the "
        "instance). The Farside sets delivered 2026-10-26: bark.kelp.stipe, ground.wrack, organic.sponge, card.wineweed; 2026-11-10: "
        "ground.bench (the tsunami's scour bench, the ground's eighth layer, its weight FIELD.bench times the rock's). Run "
        "python3 tools/textures/pack.py biomes/farside after any change, then python3 build.py --all.")
json.dump({'build': 'farside', 'note': NOTE, 'size': 512, 'families': FAM},
          open(os.path.join(HERE, 'materials.json'), 'w', encoding='utf-8', newline='\n'), indent=1)
print('materials.json: %d families' % len(FAM))
