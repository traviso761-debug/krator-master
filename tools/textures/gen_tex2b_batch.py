"""Writes tools/textures/batches/owner-tex2b-2026-10-18*.json: the Talia and Pylon textures of tex2.zip (the batch is the record)."""
import json
GEN = "supplied by the owner (Downloads/tex2.zip, 2026-10-18), for the Talia and Pylon kits"
def src(t, reuse): return {"generator": GEN, "licence": "generated for this project by its owner", "original_title": t, "prompt": "kits/talia/PLAN.md section 7 / kits/pylon/PLAN.md section 8 (no prompt written: the owner generated it)", "reuse": reuse}
def rec(i, fam, sc, t, reuse, tint=False, rough=0.8): return {"id": i, "family": fam, "colour": "#ffffff", "roughness": rough, "metal": 0, "scale": list(sc), "tint": tint, "_source": src(t, reuse)}
SO = {"pattern": False, "seam_axes": "xy", "delight": 0.5, "lift": 0.08, "normal_strength": 1.0, "rough": 0.75, "rough_var": 0.2, "size": 1024}
S = [
 {"src": "Golden Amber Mosaic Tiles.png", "out": "core/materials/library/mosaic.orange.honeycomb", "record": rec("mosaic.orange.honeycomb", "mosaic", (1.2, 1.2), "Golden Amber Mosaic Tiles.png", "Talia's orange honeycomb-mosaic vaults; any amber tessera"), "options": dict(SO, rough=0.5)},
 {"src": "Weathered Terracotta Peeling Wall Texture.png", "out": "core/materials/library/render.orange.worn", "record": rec("render.orange.worn", "plaster", (2.0, 2.0), "Weathered Terracotta Peeling Wall Texture.png", "worn orange render with grey patches (Talia's old quarter, Pylon's painted render)"), "options": dict(SO)},
 {"src": "Weathered Hexagonal Ceramic Tile Texture.png", "out": "core/materials/library/tile.hex.ceramic", "record": rec("tile.hex.ceramic", "tile", (1.2, 1.2), "Weathered Hexagonal Ceramic Tile Texture.png", "hex paving and floors (Pylon)"), "options": dict(SO, rough=0.55)},
 {"src": "meander-band.png", "out": "core/materials/patterns/talia/meander", "record": rec("talia/meander", "stone", (3.0, 1.0), "Greek Key on Burnt Orange Marble.png (cropped to the band)", "meander border strip: Talia's paving and cloister floors, friezes"), "options": dict(SO, pattern=True, seam_axes="x", keep_aspect=True)},
]
json.dump(S, open("tools/textures/batches/owner-tex2b-2026-10-18.json", "w", encoding="utf-8", newline="\n"), indent=1)
CO = {"size": 1024, "anchor": "center", "pad": 0.02, "key": "#ff00ff", "spill": "all", "key_lo": 60, "key_hi": 170}
def card(f, i, t, reuse, o=None):
    return {"src": f, "out": "core/materials/patterns/" + i if i.startswith(("talia/", "pylon/")) else "core/materials/library/" + i,
            "record": rec(i, "stone", (1, 1), t, reuse), "options": dict(CO, **(o or {}))}
C = [
 card("Magenta Arabesque Stone Lattice.png", "talia/jali-arabesque", "Magenta Arabesque Stone Lattice.png", "jali screens (cut-out): Talia's rich houses and temple"),
 card("Magenta Geometric Stone Lattice.png", "talia/jali-geometric", "Magenta Geometric Stone Lattice.png", "jali screens (cut-out)"),
 card("Symmetrical Stained-Glass Rose Window.png", "talia/rose-star", "Symmetrical Stained-Glass Rose Window.png", "the star rose window disc (talia-temple); any round stained-glass window"),
 card("Industrial Honeycomb Grid on Magenta.png", "pylon/hex-grille", "Industrial Honeycomb Grid on Magenta.png", "hex grilles and hex-lattice domes (Pylon): a cut-out"),
]
json.dump(C, open("tools/textures/batches/owner-tex2b-2026-10-18-cards.json", "w", encoding="utf-8", newline="\n"), indent=1)
