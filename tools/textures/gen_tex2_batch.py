"""Writes tools/textures/batches/owner-tex2-2026-10-18.json (the tex2.zip delivery). Run once; the batch is the record."""
import json
CARD_OPT = {"size": 1024, "anchor": "center", "pad": 0.02, "key": "#ff00ff", "spill": "all", "key_lo": 60, "key_hi": 170}
GEN = "supplied by the owner (Downloads/tex2.zip, 2026-10-18)"
PR = "core/materials/PROMPTS-NEEDED.md, `%s`"
# (src, id, family, scale m, tint, rough, reuse, extra)
T = [
 ("Layered Coal Seam Texture.png", "rock.coal", "rock", 1.5, "coal heaps, a mine's spoil, any coal face"),
 ("Iridescent Oil-Slick Mud Texture.png", "ground.tar.seep", "ground", 3.0, "tar pits, a boatyard's pitch ground, a derrick's spill"),
 ("White Mineral Crust on Cracked Earth.png", "ground.efflorescence", "ground", 2.0, "saltpeter caves, nitre beds, salt-bloomed earthen walls"),
 ("Malachite and Azurite Rock Texture.png", "rock.malachite", "rock", 1.5, "copper mine faces, verdigris-stained rock"),
 ("Gold-Flecked Quartz Vein in Dark Stone.png", "rock.quartz.vein", "rock", 1.5, "quartz reefs, gold diggings"),
 ("Tin-Bearing Granite Quartz Vein Texture.png", "rock.cassiterite", "rock", 1.5, "tin mine faces, greisen, tin-bearing granite"),
 ("Seamless Galena Quartz Crystal Texture.png", "rock.galena", "rock", 1.5, "silver and lead mine faces, galena veins"),
 ("Rusted Honeycomb Iron Ore Texture.png", "rock.gossan", "rock", 2.0, "iron mine faces, ironstone, rust-red weathered ground"),
 ("Pink and Purple Pegmatite Crystal Texture.png", "rock.pegmatite", "rock", 1.5, "pegmatite dykes, a rare-earth mine's face"),
 ("Recycled Glass Bottle Mosaic Wall.png", "glass.bottle.wall", "glass", 1.28, "Post-Apoc's bottle walls; any bottle-built wall"),
 ("Sandy Seabed Seagrass Texture.png", "ground.lagoon.seagrass", "ground", 4.0, "a warm shallow sea floor"),
 ("Seamless Coral Reef Rock Texture.png", "ground.reef.flat", "ground", 3.0, "reef flat, tide-pool bench, a coral quarry's floor"),
 ("Seamless Brain Coral Maze Texture.png", "organic.coral.brain", "organic", 0.8, "coral heads (brain and table), tinted by instance colour"),
]
C = [
 ("Nine Isolated Seagrass Clumps.png", "card.seagrass", "eelgrass, any submerged meadow"),
 ("Nine Ivy Clippings on Magenta Grid.png", "card.creeper.beach", "any creeper over sand or rock"),
 ("Botanical Sprig Grid on Magenta.png", "card.naupaka", "any fleshy coastal shrub"),
 ("Sea Grape Leaf Sprite Grid.png", "card.seagrape", "any big round-leaved shrub"),
 ("Tropical Leaf and Fruit Grid.png", "card.breadfruit", "any big lobed tropical leaf"),
 ("Nine Feathery Botanical Sprigs.png", "card.tamarisk", "she-oak needles, any feathery shrub"),
 ("Tropical Leaf Sprigs Grid.png", "card.croptree.glossy", "any glossy evergreen (citrus, bay, mangrove)"),
]
out = []
for src, i, fam, sc, reuse in T:
    rec = {"id": i, "family": fam, "colour": "#ffffff", "roughness": 0.8, "metal": 0, "scale": [sc, sc], "tint": i == "organic.coral.brain",
           "_source": {"generator": GEN, "licence": "generated for this project by its owner", "prompt": PR % i,
                      "original_title": src, "reuse": reuse}}
    opt = {"pattern": False, "seam_axes": "xy", "delight": 0.5, "lift": 0.08, "normal_strength": 1.0, "rough": 0.75, "rough_var": 0.2, "size": 1024}
    if i == "organic.coral.brain": opt["mute"] = 0.6
    if i == "ground.tar.seep": opt["dark_gloss"] = 0.5
    out.append({"src": src, "out": "core/materials/library/" + i, "record": rec, "options": opt})
json.dump(out, open("tools/textures/batches/owner-tex2-2026-10-18.json", "w", encoding="utf-8", newline="\n"), indent=1)
cards = []
for src, i, reuse in C:
    cards.append({"src": src, "out": "core/materials/library/" + i,
      "record": {"id": i, "family": "leaf", "colour": "#ffffff", "roughness": 0.8, "metal": 0, "scale": [1, 1], "tint": True,
        "_source": {"generator": GEN, "licence": "generated for this project by its owner", "prompt": PR % i, "original_title": src,
                    "reuse": reuse, "note": "a nine-cell sheet: hosts show one cell (the pack entry's cell)"}},
      "options": dict(CARD_OPT)})
json.dump(cards, open("tools/textures/batches/owner-tex2-2026-10-18-cards.json", "w", encoding="utf-8", newline="\n"), indent=1)
