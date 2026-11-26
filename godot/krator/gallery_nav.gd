# Catalog, LFS-readiness check, and scene router for the Godot-native Krator Worlds Gallery (`res://gallery.tscn`).
# Discovers every build in the repository that has been ported/exported into `godot/data/` or built as a native Godot
# scene, grouped into the Gallery's five registers (`openworld`, `world`, `biome`, `kit`, `lab`).
class_name KratorGalleryNav
extends RefCounted

static var pending_entry: Dictionary = {}
static var opened_from_gallery := false

const SECTIONS := [
	{
		"key": "openworld",
		"title": "Open Worlds & Regions",
		"note": "Continent-scale regions streamed at 1:1 or across multi-province heightfields, with roads, settlements, weather, and live traffic."
	},
	{
		"key": "world",
		"title": "Settlements",
		"note": "Whole towns, arcologies, monasteries, and underground cities: terrain, architecture, interiors, lighting, and timetable simulations."
	},
	{
		"key": "biome",
		"title": "Biomes",
		"note": "Flora, geology, water, and wind-animated ecosystems of Krator's climate zones, independent of any settlement."
	},
	{
		"key": "kit",
		"title": "Building Kits",
		"note": "Architectural kit sheets laying out a culture's buildings, materials, and form studies side by side."
	},
	{
		"key": "lab",
		"title": "Labs & Tools",
		"note": "Interactive character morphing & animation lab (MPFB2 peoples) and the library surface weathering & lighting Look Lab."
	},
]

# Rich metadata for known ported cases; any new directory in `res://data/` is also discovered automatically below!
const CURATED := {
	"stream:world-oidong-highrift": {
		"name": "Xanadu, Oidong & the High Rift",
		"section": "openworld",
		"source": "openworld/oidong-highrift",
		"tag": "1:1 Streamed",
		"scene": "res://walk.tscn",
		"case_path": "res://data/world-oidong-highrift/index.json",
		"blurb": "Streamed 1:1 open world from Strongbow's canyon arcology and the Oidong Great Cataract up the High Rift road to Longsong Monastery, with valley cart traffic and indoor vaults."
	},
	"native:catch-bowl": {
		"name": "The Catch, the Bowl & Stalker Range",
		"section": "openworld",
		"source": "openworld/catch-bowl",
		"tag": "New",
		"scene": "res://catch_bowl.tscn",
		"data_dir": "res://data/catch-bowl",
		"blurb": "Six provinces across 1,284 x 1,058 km (-2,595 m salt pan to +15,527 m Godthrone shoulder): 7 weather modes, 23 surface & lava-tube routes, 7 moving caravan/Ranger rounds, and live ambient hazards."
	},
	"case:world-iziz": {
		"name": "Iziz — Arcology & Vernacular District",
		"section": "world",
		"source": "settlements/iziz",
		"tag": "krator-world",
		"scene": "res://main.tscn",
		"case_id": "world-iziz",
		"blurb": "A district of Iziz through core/export: Ancients megastructure and Vernacular street life, 9,600+ instances, painted ground, doors, windows, and lamps."
	},
	"case:iziz": {
		"name": "Iziz — Evening Atmosphere & Fog Banks",
		"section": "world",
		"source": "settlements/iziz",
		"tag": "Atmos + glTF",
		"scene": "res://main.tscn",
		"case_id": "iziz",
		"blurb": "Whole-city krator-atmos sky, volumetric FogVolume banks, and evening street halos around Iziz's city centre."
	},
	"case:world-longsong": {
		"name": "Longsong — Valley Town",
		"section": "world",
		"source": "settlements/longsong",
		"tag": "krator-world",
		"scene": "res://main.tscn",
		"case_id": "world-longsong",
		"blurb": "The History Monks' valley settlement on the biome core: Xanadu/Oidong architecture, ARCH buckets, still water, and mountain flora."
	},
	"place:sq80bzd7ep-monastery": {
		"name": "Longsong — Head Monastery & Vault",
		"section": "world",
		"source": "settlements/longsong",
		"tag": "Interiors",
		"scene": "res://walk.tscn",
		"case_path": "res://data/world-oidong-highrift/index.json",
		"at": "sq80bzd7ep",
		"data_dir": "res://data/world-oidong-highrift/places/sq80bzd7ep-monastery",
		"blurb": "The Mirror Gate, courtyard halls, butter-lamp interiors, and subterranean relic vault of Longsong's head monastery."
	},
	"place:sfgtxw10kr-arcology": {
		"name": "Strongbow — Canyon Arcology",
		"section": "world",
		"source": "kits/ancients",
		"tag": "Arcology",
		"scene": "res://walk.tscn",
		"case_path": "res://data/world-oidong-highrift/index.json",
		"at": "strongbow",
		"data_dir": "res://data/world-oidong-highrift/places/sfgtxw10kr-arcology",
		"blurb": "Strongbow's spanning canyon megastructure and plateau gateway overlooking the Oidong Great Falls."
	},
	"case:world-isle-kautoa": {
		"name": "Kautoa — Ring Sea Port Capital",
		"section": "world",
		"source": "settlements/isle-demo",
		"tag": "krator-world",
		"scene": "res://main.tscn",
		"case_id": "world-isle-kautoa",
		"blurb": "The Ring Sea Islanders' port capital: Sumba spire roofs over thatch skirts, harbour quays, market streets, and tropical coast."
	},
	"case:world-isle-valapo": {
		"name": "Valapo — Ring Sea Sister Town",
		"section": "world",
		"source": "settlements/isle-demo",
		"tag": "krator-world",
		"scene": "res://main.tscn",
		"case_id": "world-isle-valapo",
		"blurb": "Valapo's coastal village centre and canoe landing from the Isle Demo's two-town sea-trading polity."
	},
	"case:world-yuni": {
		"name": "Yuni — Foundry & Planned Interiors",
		"section": "world",
		"source": "settlements/yuni",
		"tag": "Interiors",
		"scene": "res://main.tscn",
		"case_id": "world-yuni",
		"blurb": "Yuni's Foundry district exported with multi-storey rooms, collision walls, door links, and per-storey navigation meshes."
	},
	"case:yuni": {
		"name": "Yuni — Tagged Records & Interior",
		"section": "world",
		"source": "settlements/yuni",
		"tag": "Records",
		"scene": "res://main.tscn",
		"case_id": "yuni",
		"blurb": "Every Sahel-and-Gaudi building, door, window, and lamp of Yuni as tagged records, with one complete furnished interior."
	},
	"case:qiblai": {
		"name": "Qiblai — Electric South Avenue",
		"section": "world",
		"source": "settlements/qiblai",
		"tag": "Electric Lamps",
		"scene": "res://main.tscn",
		"case_id": "qiblai",
		"blurb": "A 260 m reach of Qiblai's south avenue with utility poles, overhead wires, and pooled OmniLight3D street-lamp halos."
	},
	"case:girder": {
		"name": "Girder — Scrap & Frame Town",
		"section": "world",
		"source": "settlements/girder",
		"tag": "glTF + Lamps",
		"scene": "res://main.tscn",
		"case_id": "girder",
		"blurb": "A 60 m slice of Girder textured from the material library, complete with street lamps and sampled terrain."
	},
	"case:verge": {
		"name": "Verge — Twin Cities & Timetable Sim",
		"section": "world",
		"source": "settlements/verge",
		"tag": "Live Sim",
		"scene": "res://main.tscn",
		"case_id": "verge",
		"blurb": "Upper and lower Verge with caravans, porters, nomads, and patrols driven live by KratorVergeSim's exported timetable."
	},
	"case:dhelv": {
		"name": "Dhelv — Underground Cave City",
		"section": "world",
		"source": "settlements/dhelv",
		"tag": "Navmesh + Sim",
		"scene": "res://main.tscn",
		"case_id": "dhelv",
		"blurb": "The Zeijani cavern capital: carved rooms, walk floors baked to a 3D navmesh with pathfinding agents, and KSim citizens."
	},
	"case:world-sedesert": {
		"name": "SE Desert — Rain-Shadow Pond",
		"section": "biome",
		"source": "biomes/sedesert",
		"tag": "krator-world",
		"scene": "res://main.tscn",
		"case_id": "world-sedesert",
		"blurb": "South-eastern desert tile around the rain-shadow oasis through the unified krator-world container and GPU instancing."
	},
	"case:world-sedesert-falls": {
		"name": "SE Desert — Cataract & Plunge Pool",
		"section": "biome",
		"source": "biomes/sedesert",
		"tag": "Water 3+4",
		"scene": "res://main.tscn",
		"case_id": "world-sedesert-falls",
		"blurb": "The desert river's notch, cataract waterfall, foam, and plunge pool testing core/water phases 3 and 4."
	},
	"case:world-sedesert-wind": {
		"name": "SE Desert — Wind & Sway",
		"section": "biome",
		"source": "biomes/sedesert",
		"tag": "Wind",
		"scene": "res://main.tscn",
		"case_id": "world-sedesert-wind",
		"blurb": "Desert scrub and canyon palms under live wind gusts and vertex-shader foliage motion."
	},
	"case:sedesert": {
		"name": "SE Desert — Baked Field Heightmap",
		"section": "biome",
		"source": "biomes/sedesert",
		"tag": "krator-field",
		"scene": "res://main.tscn",
		"case_id": "sedesert",
		"blurb": "300 m oasis tile on core/terrain's baked krator-field heightmap with exact HeightMapShape3D collision."
	},
	"case:world-nhighlands": {
		"name": "Northern Highlands",
		"section": "biome",
		"source": "biomes/nhighlands",
		"tag": "krator-world",
		"scene": "res://main.tscn",
		"case_id": "world-nhighlands",
		"blurb": " windswept northern highland crags, conifers, and alpine ground layers exported via krator-world."
	},
	"case:hyperjungle": {
		"name": "Hyperjungle — Canopy Tile",
		"section": "biome",
		"source": "biomes/hyperjungle",
		"tag": "krator-biome",
		"scene": "res://main.tscn",
		"case_id": "hyperjungle",
		"blurb": "Dense multi-tier hyperjungle canopy tile with procedural bark/leaf textures and foliage wind hooks."
	},
	"case:rift": {
		"name": "The Rift — Irid Bark & Impostors",
		"section": "biome",
		"source": "biomes/rift",
		"tag": "LOD + Impostors",
		"scene": "res://main.tscn",
		"case_id": "rift",
		"blurb": "LOD-chunked Rift biome tile showcasing iridescent bark shaders and far billboard impostors."
	},
	"case:world-pylon": {
		"name": "Pylon — Vassal Kit Sheet",
		"section": "kit",
		"source": "kits/pylon",
		"tag": "Kit Sheet",
		"scene": "res://main.tscn",
		"case_id": "world-pylon",
		"blurb": "Iziz's vassal arcology city kit: post-Cataclysm buildings imitating the Ancients in white render and Iziz orange."
	},
	"case:world-talia": {
		"name": "Talia — Vassal Kit Sheet",
		"section": "kit",
		"source": "kits/talia",
		"tag": "Kit Sheet",
		"scene": "res://main.tscn",
		"case_id": "world-talia",
		"blurb": "Talia's architectural kit laid out on its inspection sheet with full library detail maps."
	},
	"case:world-eternian": {
		"name": "Eternian — Building Kit Sheet",
		"section": "kit",
		"source": "kits/eternian",
		"tag": "Kit Sheet",
		"scene": "res://main.tscn",
		"case_id": "world-eternian",
		"blurb": "Eternian building kit on the core/engine profile: merged material buckets, roofs, and masonry."
	},
	"case:world-eternian-form": {
		"name": "Eternian — Form Study",
		"section": "kit",
		"source": "kits/eternian",
		"tag": "Form Study",
		"scene": "res://main.tscn",
		"case_id": "world-eternian-form",
		"blurb": "Close-range massing and silhouette study from the Eternian building kit."
	},
	"case:world-eternian-kiln": {
		"name": "Eternian — Kiln Works",
		"section": "kit",
		"source": "kits/eternian",
		"tag": "Works",
		"scene": "res://main.tscn",
		"case_id": "world-eternian-kiln",
		"blurb": "Industrial kiln and chimney piece from the Eternian works row."
	},
	"lab:characters": {
		"name": "Cosmetic & Character Lab",
		"section": "lab",
		"source": "core/charactermodels",
		"tag": "MPFB2 + Clips",
		"scene": "res://character_lab.tscn",
		"data_dir": "res://data/characters",
		"blurb": "Godot twin of core/charactermodels: MakeHuman MPFB2 male, female, and Giant bodies, cultural peoples, morphs, skin/hair tint, and retargeted animations."
	},
	"lab:look": {
		"name": "Material & Weathering Look Lab",
		"section": "lab",
		"source": "core/materials",
		"tag": "Shaders",
		"scene": "res://look_lab.tscn",
		"data_dir": "res://data/world-oidong-highrift/places/sq80bzd7ep",
		"blurb": "Swatches of Krator's heaviest library surfaces (wall, ledge, 35 deg slab, sphere) under low/high/photo lighting tiers and weathering."
	},
}

const SKIP_DIRS := {
	"ground_layers": true,
	"isle": true,
	"kits": true,
	"m1_slice": true,
	"sky": true,
	"strongbow": true,
	"world-lod": true,
}


static func is_lfs_pointer(res_path: String) -> bool:
	if not FileAccess.file_exists(res_path):
		return false
	var f := FileAccess.open(res_path, FileAccess.READ)
	if f == null:
		return false
	var head := f.get_buffer(min(48, f.get_length())).get_string_from_ascii()
	f.close()
	return head.begins_with("version https://git-lfs")


static func inspect_data_dir(dir_path: String) -> Dictionary:
	var dir := dir_path.trim_suffix("/")
	var total_bytes := 0
	var ptr_files := PackedStringArray()
	var d := DirAccess.open(dir)
	if d == null:
		return {"exists": false, "ready": false, "mb": 0.0, "pointers": ptr_files}
	d.list_dir_begin()
	var nm := d.get_next()
	while nm != "":
		if not nm.begins_with(".") and not nm.ends_with(".import") and not nm.ends_with(".uid"):
			var full := dir + "/" + nm
			if d.current_is_dir():
				var sub := DirAccess.open(full)
				if sub != null:
					sub.list_dir_begin()
					var snm := sub.get_next()
					var checked := 0
					while snm != "":
						if not snm.begins_with(".") and not snm.ends_with(".import") and not snm.ends_with(".uid"):
							var sfull := full + "/" + snm
							if not sub.current_is_dir() and FileAccess.file_exists(sfull):
								var sf := FileAccess.open(sfull, FileAccess.READ)
								if sf != null:
									total_bytes += int(sf.get_length())
									sf.close()
								if checked < 6 and is_lfs_pointer(sfull):
									ptr_files.append(sfull)
								checked += 1
						snm = sub.get_next()
					sub.list_dir_end()
			else:
				var f := FileAccess.open(full, FileAccess.READ)
				if f != null:
					total_bytes += int(f.get_length())
					f.close()
				if is_lfs_pointer(full):
					ptr_files.append(full)
		nm = d.get_next()
	d.list_dir_end()
	return {
		"exists": true,
		"ready": ptr_files.is_empty(),
		"mb": float(total_bytes) / (1024.0 * 1024.0),
		"pointers": ptr_files,
	}


static func _pretty_slug(raw: String) -> String:
	var s := raw.trim_prefix("world-").replace("-", " ").replace("_", " ")
	var parts := s.split(" ", false)
	var out := PackedStringArray()
	for p in parts:
		out.append(p.substr(0, 1).to_upper() + p.substr(1))
	return " ".join(out) if not out.is_empty() else raw


static func _finalize_entry(id: String, base: Dictionary) -> Dictionary:
	var e := base.duplicate(true)
	e["id"] = id
	var data_dir := str(e.get("data_dir", ""))
	if data_dir == "":
		if e.has("case_path"):
			data_dir = str(e["case_path"]).get_base_dir()
		elif e.has("case_id"):
			data_dir = "res://data/" + str(e["case_id"])
	e["data_dir"] = data_dir

	# Pull extra stats/source from meta.json if present
	var mpath := data_dir + "/meta.json"
	if data_dir != "" and FileAccess.file_exists(mpath) and not is_lfs_pointer(mpath):
		var m = KData.read_json(mpath)
		if m is Dictionary:
			if str(e.get("source", "")) == "" and m.has("page"):
				var pg := str(m["page"]).split("/")
				if pg.size() >= 2:
					e["source"] = pg[0] + "/" + pg[1]
			if m.get("stats") is Dictionary:
				var st: Dictionary = m["stats"]
				e["tris"] = int(st.get("triangles", 0))
				e["records"] = int(st.get("records", 0))

	var info := inspect_data_dir(data_dir) if data_dir != "" else {"exists": true, "ready": true, "mb": 0.1, "pointers": PackedStringArray()}
	# Character lab needs at least one body's pieces (`res://data/characters/mpfb_male` or `pieces/`) not to be LFS pointers
	if id == "lab:characters":
		# the bodies' pieces are gitignored (built by make_mpfb.py, copied in by godot/tools/sync_core.py), not LFS
		var has_pieces := FileAccess.file_exists("res://data/characters/pieces/mpfb_male/body.glb") or DirAccess.dir_exists_absolute("res://data/characters/pieces/mpfb_male")
		info["ready"] = bool(info["ready"]) and has_pieces
		if not has_pieces:
			e["lfs_hint"] = "python3 core/charactermodels/tools/make_mpfb.py && python3 godot/tools/sync_core.py"
	e["exists"] = bool(info["exists"])
	e["ready"] = bool(info["ready"])
	e["mb"] = float(info["mb"])
	e["pointers"] = info["pointers"]
	if not e["ready"] and not e.has("lfs_hint"):
		var rel_dir := data_dir.replace("res://", "godot/")
		e["lfs_hint"] = "git lfs pull --include=\"%s/**\"" % rel_dir
	return e


static func discover_entries() -> Array:
	var entries: Array = []
	var covered_dirs := {}

	# 1. Add all curated entries whose files/scenes exist in the checkout
	for id in CURATED:
		var raw: Dictionary = CURATED[id]
		var scene_p := str(raw.get("scene", ""))
		if scene_p != "" and not FileAccess.file_exists(scene_p):
			continue
		var fin := _finalize_entry(id, raw)
		if not bool(fin["exists"]):
			continue
		entries.append(fin)
		if str(fin.get("data_dir", "")) != "":
			covered_dirs[str(fin["data_dir"])] = true

	# 2. Auto-discover any additional exported builds in `res://data/*` (e.g. `world-pinnacle`, new `world-*` exports)
	var d := DirAccess.open("res://data")
	if d != null:
		d.list_dir_begin()
		var nm := d.get_next()
		var extra_names := PackedStringArray()
		while nm != "":
			if d.current_is_dir() and not nm.begins_with(".") and not SKIP_DIRS.has(nm):
				var full := "res://data/" + nm
				if not covered_dirs.has(full):
					extra_names.append(nm)
			nm = d.get_next()
		d.list_dir_end()
		extra_names.sort()
		for nm2 in extra_names:
			var full2 := "res://data/" + nm2
			if FileAccess.file_exists(full2 + "/index.json"):
				entries.append(_finalize_entry("stream:" + nm2, {
					"name": _pretty_slug(nm2) + " (Streamed Region)",
					"section": "openworld",
					"source": "openworld/" + nm2.trim_prefix("world-"),
					"tag": "1:1 Streamed",
					"scene": "res://walk.tscn",
					"case_path": full2 + "/index.json",
					"blurb": "Streamed 1:1 open-world region discovered in godot/data/%s." % nm2,
				}))
			elif FileAccess.file_exists(full2 + "/world.json") or FileAccess.file_exists(full2 + "/biome.json") or FileAccess.file_exists(full2 + "/region.glb"):
				var sec := "world"
				var m = KData.read_json(full2 + "/meta.json") if FileAccess.file_exists(full2 + "/meta.json") else null
				if m is Dictionary and m.has("page"):
					var pg := str(m["page"])
					if pg.begins_with("biomes/"):
						sec = "biome"
					elif pg.begins_with("kits/"):
						sec = "kit"
				entries.append(_finalize_entry("case:" + nm2, {
					"name": _pretty_slug(nm2),
					"section": sec,
					"source": "",
					"tag": "Ported",
					"scene": "res://main.tscn",
					"case_id": nm2,
					"blurb": "Ported Godot build discovered in godot/data/%s." % nm2,
				}))

	# 3. Auto-discover standalone place exports inside `res://data/world-oidong-highrift/places/*`
	var pd := DirAccess.open("res://data/world-oidong-highrift/places")
	if pd != null:
		pd.list_dir_begin()
		var pnm := pd.get_next()
		var pnames := PackedStringArray()
		while pnm != "":
			if pd.current_is_dir() and not pnm.begins_with("."):
				var pfull := "res://data/world-oidong-highrift/places/" + pnm
				if not covered_dirs.has(pfull) and FileAccess.file_exists(pfull + "/world.json"):
					pnames.append(pnm)
			pnm = pd.get_next()
		pd.list_dir_end()
		pnames.sort()
		for pnm2 in pnames:
			var pfull2 := "res://data/world-oidong-highrift/places/" + pnm2
			entries.append(_finalize_entry("place_world:" + pnm2, {
				"name": "Oidong Place — " + _pretty_slug(pnm2),
				"section": "world",
				"source": "openworld/oidong-highrift",
				"tag": "Place Box",
				"scene": "res://main.tscn",
				"case_id": "world-oidong-highrift/places/" + pnm2,
				"data_dir": pfull2,
				"blurb": "Standalone 1:1 settlement/hamlet place box from Xanadu-Oidong-Highrift (%s)." % pnm2,
			}))

	return entries


static func open_entry(tree: SceneTree, entry: Dictionary) -> int:
	if tree == null or entry.is_empty():
		return ERR_INVALID_PARAMETER
	pending_entry = entry.duplicate(true)
	opened_from_gallery = true
	var scene_path := str(entry.get("scene", "res://main.tscn"))
	return tree.change_scene_to_file(scene_path)


static func return_to_gallery(tree: SceneTree) -> int:
	if tree == null:
		return ERR_INVALID_PARAMETER
	pending_entry = {}
	opened_from_gallery = false
	if FileAccess.file_exists("res://gallery.tscn"):
		return tree.change_scene_to_file("res://gallery.tscn")
	return ERR_FILE_NOT_FOUND
