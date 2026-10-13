# The shader library's hook table (godot/README.md, "The shader library"; GODOT-PLAN.md Phase 3). A material record's
# `hook` (core/materials/record KMAT, core/export's materials: 'world-uv', 'world-uv+cloth-sway', the biome kinds 'leaf',
# 'irid', ...) names library shaders; this resolves it to the includes in shaders/lib/, each the twin of one three.js
# hook. A hook nothing here knows is reported, never guessed.
class_name KHooks
extends RefCounted

const LIB := "res://shaders/lib/"

# id -> the include, the three.js hook it answers (the one in core/ first), the record fields it reads, and the spike
# shader that draws it today
const TABLE := {
	"world-uv": {"three": "core/materials/opt/69a-world-uv.js vWorldUV; settlements/girder/src/45-kit.js applyWorldUV; the biome hosts' ground layers (45-host-stage.js, via core/export EXPORT.groundLayers)",
		"fields": ["scale", "layers", "weights"], "drawn_by": ["library.gdshader", "ground.gdshader"]},
	"breakup": {"three": "core/materials/record/25-matlib-host.js KMAT.breakupHook", "fields": ["breakup"], "drawn_by": ["library.gdshader"]},
	"foliage": {"three": "core/biome/30-core-foliage.js BIO.foliageHook", "fields": ["sway", "options", "alphaTest"], "drawn_by": ["foliage.gdshader"]},
	"bark": {"three": "the biome kits' bark kinds (BIO.iridBarkMat, barkMat2, RIFT.farMat, SWLOW.farMat, the nhighlands bulbs); core/biome/42-core-export.js names them",
		"fields": ["kind", "options"], "drawn_by": ["bark.gdshader"]},
	"cloth-sway": {"three": "settlements/girder/src/45-kit.js applyClothSway (Voth's 45-kit.js the same; no core/ copy)", "fields": [], "drawn_by": []},
	"flag": {"three": "kits/ringsea/src/40-rs-core.js RS_AUX_GLSL, rsAuxVS (no core/ copy)", "fields": [], "drawn_by": []},
	"glass": {"three": "core/materials/22-materials.js MAT.glass onBeforeCompile (GLASS FRESNEL)", "fields": [], "drawn_by": []},
	"coursing": {"three": "none yet: the TEX kind 'coursing' (core/materials/PLAN.md, From spiderbench) waits for its pilot", "fields": ["coursing"], "drawn_by": []},
	"water": {"three": "core/water/50-core-water-draw.js WATER.glsl, WATER.draw", "fields": ["(core/export's water section)"], "drawn_by": ["water.gdshader"]},
}

# names the exports use for a library hook: the biome export's material kinds (core/biome/42-core-export.js HOOK_KINDS)
# and the islanders' flutter
const ALIASES := {"leaf": "foliage", "irid": "bark", "gloss": "bark", "far": "bark", "hang": "bark", "cloth-flutter": "cloth-sway"}


static func include(id: String) -> String:
	return LIB + id + ".gdshaderinc"


# a record's hook ('a+b', an alias, null) -> {ids: [library ids], unknown: [names no library shader answers]}
static func resolve(hook) -> Dictionary:
	var out := {"ids": [], "unknown": []}
	if hook == null or str(hook) == "":
		return out
	for part in str(hook).split("+", false):
		var p := part.strip_edges()
		var id: String = ALIASES.get(p, p)
		if TABLE.has(id):
			if not (id in out["ids"]):
				out["ids"].append(id)
		elif not (p in out["unknown"]):
			out["unknown"].append(p)
	return out


# every hook in a list of material records -> {hook: ids}, and the names nothing answers (for an importer's report)
static func survey(materials: Array) -> Dictionary:
	var by := {}
	var unknown := []
	for m in materials:
		var h = m.get("hook")
		if h == null or by.has(str(h)):
			continue
		var r := resolve(h)
		by[str(h)] = r["ids"]
		for u in r["unknown"]:
			if not (u in unknown):
				unknown.append(u)
	return {"hooks": by, "unknown": unknown}
