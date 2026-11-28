# Real biome flora for the Catch & the Bowl:
#   1. Mantis's Socotran monsoon pocket (biomes/sedesert/stations/mantis, keyed off rain.png > 160..1,553 mm/yr):
#      Mantis fig (Ficus vasta with buttresses, aerial roots & beard lichen), Dragon's-blood tree (Dracaena cinnabari),
#      Socotran frankincense, Cucumber bottle-tree, Sterculia, wild Pomegranate, Wadi date palm, Mesquite, Bottle tree,
#      Giant candelabra, Desert rose, and walkable understory of spring ferns, aloe/kalanchoe & croton/monsoon grass.
#   2. The Catch's groundwater oases, dead channels, ergs & salt margins (biomes/catch):
#      living & golden Euphrates tugai poplars, bleached dead standing snags, weeping tamarisk, dune broom, saltbush &
#      halophyte brine lamps.
# Loads real 3D prototypes harvested from sedesert-mantis & catch into data/catch-bowl/{flora-mantis,flora-catch}/ via
# KratorWorld.build() onto foliage.gdshader and bark.gdshader; falls back to _plant() proxies only if unexported.
class_name KratorCatchBowlFlora
extends Node3D

const KRand := preload("res://tests/rand/krand.gd")
const SEED := 4409
const CELL := 300.0
const REACH := 9
const NEAR_CELL := 64.0
const NEAR_REACH := 8
const UNDER_CELL := 16.0
const UNDER_REACH := 9
const MOVED := 42.0

const MANTIS_DIR := "res://data/catch-bowl/flora-mantis"
const CATCH_DIR := "res://data/catch-bowl/flora-catch"

# Catch & Mantis height/crown ranges ([min, max] in metres)
const SPECIES := {
	"poplar_live": {"h": [8.0, 16.0], "crown": [4.0, 7.5], "col": Color(0.847, 0.690, 0.188), "bark": Color(0.541, 0.510, 0.463), "trunk": true},
	"poplar_gold": {"h": [8.0, 15.0], "crown": [4.0, 7.2], "col": Color(0.847, 0.690, 0.188), "bark": Color(0.541, 0.510, 0.463), "trunk": true},
	"poplar_dead": {"h": [7.0, 14.0], "crown": [1.2, 2.2], "col": Color(0.784, 0.753, 0.698), "bark": Color(0.784, 0.753, 0.698), "trunk": true},
	"tamarisk": {"h": [3.2, 6.5], "crown": [2.5, 4.5], "col": Color(0.447, 0.502, 0.388), "bark": Color(0.478, 0.439, 0.388), "trunk": false},
	"broom": {"h": [1.1, 2.3], "crown": [0.9, 1.8], "col": Color(0.408, 0.541, 0.302), "bark": Color(0.408, 0.541, 0.302), "trunk": false},
	"saltbush": {"h": [0.6, 1.4], "crown": [0.7, 1.5], "col": Color(0.604, 0.659, 0.596), "bark": Color(0.604, 0.659, 0.596), "trunk": false},
	"brinelamp": {"h": [0.4, 0.9], "crown": [0.5, 1.0], "col": Color(0.541, 0.690, 0.627), "bark": Color(0.878, 0.910, 0.894), "trunk": false},
	# Mantis Socotran monsoon forest & savanna species (biomes/sedesert/stations/mantis)
	"mantis_fig": {"h": [18.0, 28.0], "crown": [17.0, 26.0], "col": Color(0.22, 0.34, 0.15), "bark": Color(0.56, 0.54, 0.50), "trunk": true},
	"dragon_blood": {"h": [11.0, 20.0], "crown": [8.0, 14.0], "col": Color(0.26, 0.38, 0.18), "bark": Color(0.54, 0.48, 0.40), "trunk": true},
	"frankincense": {"h": [5.0, 9.0], "crown": [3.2, 5.2], "col": Color(0.42, 0.48, 0.24), "bark": Color(0.78, 0.74, 0.66), "trunk": true},
	"cucumber_tree": {"h": [4.2, 7.2], "crown": [2.2, 3.6], "col": Color(0.48, 0.60, 0.29), "bark": Color(0.70, 0.69, 0.60), "trunk": true},
	"sterculia": {"h": [7.5, 12.5], "crown": [4.2, 7.2], "col": Color(0.36, 0.48, 0.21), "bark": Color(0.72, 0.64, 0.60), "trunk": true},
	"pomegranate": {"h": [3.2, 6.0], "crown": [2.5, 4.2], "col": Color(0.31, 0.42, 0.16), "bark": Color(0.42, 0.35, 0.29), "trunk": true},
	"date_palm": {"h": [10.0, 20.0], "crown": [5.0, 8.2], "col": Color(0.28, 0.42, 0.19), "bark": Color(0.42, 0.35, 0.27), "trunk": true},
	"mesquite": {"h": [5.0, 13.0], "crown": [5.5, 11.5], "col": Color(0.35, 0.45, 0.22), "bark": Color(0.29, 0.23, 0.18), "trunk": true},
	"bottle_tree": {"h": [7.5, 13.5], "crown": [4.0, 7.0], "col": Color(0.36, 0.46, 0.23), "bark": Color(0.54, 0.50, 0.44), "trunk": true},
	"candelabra": {"h": [16.0, 30.0], "crown": [9.0, 15.0], "col": Color(0.30, 0.42, 0.23), "bark": Color(0.30, 0.42, 0.23), "trunk": true},
	"desert_rose": {"h": [2.5, 4.8], "crown": [2.0, 3.4], "col": Color(0.42, 0.46, 0.26), "bark": Color(0.54, 0.50, 0.47), "trunk": true},
	"mantis_fern": {"h": [0.75, 1.35], "crown": [1.0, 1.6], "col": Color(0.29, 0.48, 0.18), "bark": Color(0.29, 0.48, 0.18), "trunk": false},
	"mantis_aloe": {"h": [0.75, 1.25], "crown": [0.9, 1.4], "col": Color(0.52, 0.38, 0.22), "bark": Color(0.52, 0.38, 0.22), "trunk": false},
	"mantis_croton": {"h": [1.0, 1.75], "crown": [1.2, 2.0], "col": Color(0.46, 0.54, 0.32), "bark": Color(0.46, 0.54, 0.32), "trunk": false},
}

const OASIS_SITES := ["Kolli", "Arfwai", "Stair", "Bitta", "Lasso"]

var host: Node3D
var cam: Camera3D
var _mm := {}                       # fallback proxy MultiMeshes (only used when real library is absent)
var _protos := {}                   # pkey ("mantis_fig|0") -> {"H": float, "crown_r": float, "parts": Array}
var _species_variants := {}         # species ("mantis_fig") -> Array[String] of pkeys
var _proto_pools := {}              # pkey -> Array[MultiMeshInstance3D] (near walkable ring, casts shadows)
var _proto_far_pools := {}          # pkey -> Array[MultiMeshInstance3D] (regional mid-ring, no shadow cascade cost)
var _use_real := false
var _last := Vector3(1e12, 1e12, 1e12)
var _wd := PackedFloat32Array()     # distance to water, in samples, over the region grid
var _wn := 0
var _wz := 0
var _said := 0
var _springs: PackedVector2Array = PackedVector2Array()
var _wind_t := 0.0


func _ready() -> void:
	_load_proto_dir(MANTIS_DIR)
	_load_proto_dir(CATCH_DIR)
	_use_real = not _protos.is_empty()
	if _use_real:
		for pkey in _protos:
			_build_proto_pool(pkey)
		print("  flora: loaded %d real 3D biome prototypes (%d species) on foliage/bark shaders" % [_protos.size(), _species_variants.size()])
	else:
		for k in ["poplar_live", "poplar_dead", "tamarisk", "broom", "saltbush", "brinelamp"]:
			var mi := MultiMeshInstance3D.new()
			mi.name = k
			var m := MultiMesh.new()
			m.transform_format = MultiMesh.TRANSFORM_3D
			m.use_colors = true
			m.mesh = _plant(k)
			m.instance_count = 0
			mi.multimesh = m
			var mat := StandardMaterial3D.new()
			mat.vertex_color_use_as_albedo = true
			mat.roughness = 1.0
			mat.specular_mode = BaseMaterial3D.SPECULAR_DISABLED
			mi.material_override = mat
			add_child(mi)
			_mm[k] = mi


func has_real_protos() -> bool:
	return _use_real


func proto_count() -> int:
	return _protos.size()


func _load_proto_dir(dir_path: String) -> void:
	var pjson := dir_path + "/protos.json"
	var wjson := dir_path + "/world.json"
	if not FileAccess.file_exists(pjson) or not FileAccess.file_exists(wjson):
		return
	var pd = KData.read_json(pjson)
	if not (pd is Dictionary) or not (pd.get("protos") is Array):
		return
	var meta_by_key := {}
	for pr in pd["protos"]:
		if pr is Dictionary and pr.has("key"):
			meta_by_key[str(pr["key"])] = pr
	var lib_w := KratorWorld.build(wjson)
	var items := lib_w.get_node_or_null("Items")
	if items != null:
		for child in items.get_children():
			if not (child is MultiMeshInstance3D):
				continue
			var mmi := child as MultiMeshInstance3D
			var km: Dictionary = mmi.get_meta("krator", {})
			var nm := str(km.get("name", ""))
			if not nm.begins_with("flora/"):
				continue
			var parts_s := nm.split("/")
			if parts_s.size() < 2:
				continue
			var pkey := str(parts_s[1])
			var pm: Dictionary = meta_by_key.get(pkey, {})
			var sp_name := str(pm.get("species", pkey.get_slice("|", 0)))
			if not _protos.has(pkey):
				_protos[pkey] = {
					"species": sp_name,
					"H": maxf(0.35, float(pm.get("H", 8.0))),
					"crown_r": maxf(0.35, float(pm.get("crownR", 3.5))),
					"parts": []
				}
				if not _species_variants.has(sp_name):
					_species_variants[sp_name] = []
				(_species_variants[sp_name] as Array).append(pkey)
			var mm := mmi.multimesh
			if mm != null and mm.mesh != null:
				(_protos[pkey]["parts"] as Array).append({
					"mesh": mm.mesh,
					"material": mmi.material_override,
				})
	lib_w.free()


func _build_proto_pool(pkey: String) -> void:
	var proto: Dictionary = _protos[pkey]
	var sp_name := String(proto.get("species", ""))
	var is_under := sp_name.begins_with("mantis_fern") or sp_name.begins_with("mantis_aloe") or sp_name.begins_with("mantis_croton") or sp_name in ["saltbush", "brinelamp"]
	var near_nodes := []
	var far_nodes := []
	var parts: Array = proto["parts"]
	for pi in parts.size():
		var pt: Dictionary = parts[pi]
		var mat_use: Material = pt["material"]
		if mat_use is ShaderMaterial:
			var sm := (mat_use as ShaderMaterial).duplicate() as ShaderMaterial
			# Our dynamic MultiMeshes do not pack per-instance octahedral aN into INSTANCE_CUSTOM.xy,
			# so use_an=true would decode (0,0)->(0,0,+1) and shadow sunlit tree crowns!
			sm.set_shader_parameter("use_an", false)
			mat_use = sm
		var mi := MultiMeshInstance3D.new()
		mi.name = ("Flora_%s_%d" % [pkey.replace("|", "_"), pi]).validate_node_name()
		var mm := MultiMesh.new()
		mm.transform_format = MultiMesh.TRANSFORM_3D
		mm.use_colors = true
		mm.use_custom_data = false
		mm.mesh = pt["mesh"]
		mm.instance_count = 0
		mi.multimesh = mm
		mi.material_override = mat_use
		mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF if is_under else GeometryInstance3D.SHADOW_CASTING_SETTING_ON
		add_child(mi)
		near_nodes.append(mi)

		var mi_far := MultiMeshInstance3D.new()
		mi_far.name = ("FloraFar_%s_%d" % [pkey.replace("|", "_"), pi]).validate_node_name()
		var mm_far := MultiMesh.new()
		mm_far.transform_format = MultiMesh.TRANSFORM_3D
		mm_far.use_colors = true
		mm_far.use_custom_data = false
		mm_far.mesh = pt["mesh"]
		mm_far.instance_count = 0
		mi_far.multimesh = mm_far
		mi_far.material_override = mat_use
		mi_far.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		mi_far.visibility_range_end = 3000.0
		mi_far.visibility_range_end_margin = 250.0
		mi_far.visibility_range_fade_mode = GeometryInstance3D.VISIBILITY_RANGE_FADE_DISABLED
		add_child(mi_far)
		far_nodes.append(mi_far)
	_proto_pools[pkey] = near_nodes
	_proto_far_pools[pkey] = far_nodes


# Fallback silhouette proxy mesh (kept for unexported checkouts)
func _plant(key: String) -> ArrayMesh:
	var sp: Dictionary = SPECIES[key]
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var trunk: bool = sp["trunk"]
	if trunk:
		var r := 0.055
		for s in 5:
			var a0 := TAU * float(s) / 5.0
			var a1 := TAU * float(s + 1) / 5.0
			var p0 := Vector3(cos(a0) * r, 0.0, sin(a0) * r)
			var p1 := Vector3(cos(a1) * r, 0.0, sin(a1) * r)
			var q0 := Vector3(cos(a0) * r * 0.45, 0.62, sin(a0) * r * 0.45)
			var q1 := Vector3(cos(a1) * r * 0.45, 0.62, sin(a1) * r * 0.45)
			for v in [p0, p1, q1, p0, q1, q0]:
				st.add_vertex(v)
	var base: float = 0.58 if trunk else 0.02
	var span := 1.0 - base
	var prof := [Vector2(0.0, 0.18), Vector2(0.22, 0.72), Vector2(0.48, 1.0), Vector2(0.75, 0.86), Vector2(1.0, 0.0)]
	for b in 3:
		var a := PI * float(b) / 3.0
		var dx := cos(a)
		var dz := sin(a)
		for i in prof.size() - 1:
			var p0: Vector2 = prof[i]
			var p1: Vector2 = prof[i + 1]
			var y0: float = base + span * p0.x
			var y1: float = base + span * p1.x
			var l0 := Vector3(-dx * p0.y, y0, -dz * p0.y)
			var r0 := Vector3(dx * p0.y, y0, dz * p0.y)
			var l1 := Vector3(-dx * p1.y, y1, -dz * p1.y)
			var r1 := Vector3(dx * p1.y, y1, dz * p1.y)
			for v in [l0, r0, r1, l0, r1, l1]:
				st.add_vertex(v)
	st.generate_normals()
	return st.commit()


func bind(h: Node3D, c: Camera3D) -> void:
	host = h
	cam = c
	_water_field()
	var meta: Dictionary = h.meta if "meta" in h else {}
	var off: Array = meta.get("origin_offset_m", [0, 0])
	for st in meta.get("sites", []):
		var nm := String(st.get("name", ""))
		for o in OASIS_SITES:
			if nm.begins_with(o):
				_springs.append(Vector2(float(st["x"]) - float(off[0]), float(st["z"]) - float(off[1])))
				break
	print("  flora: %d springs from the kit's oases" % _springs.size())


func _water_field() -> void:
	var img := Image.new()
	if img.load("res://data/catch-bowl/water.png") != OK:
		return
	_wn = img.get_width()
	_wz = img.get_height()
	_wd.resize(_wn * _wz)
	var BIG := 1.0e9
	for z in _wz:
		for x in _wn:
			_wd[z * _wn + x] = 0.0 if img.get_pixel(x, z).r > 0.5 else BIG
	for z in _wz:
		for x in _wn:
			var i := z * _wn + x
			var best: float = _wd[i]
			if x > 0:
				best = minf(best, _wd[i - 1] + 1.0)
			if z > 0:
				best = minf(best, _wd[i - _wn] + 1.0)
			if x > 0 and z > 0:
				best = minf(best, _wd[i - _wn - 1] + 1.4142)
			_wd[i] = best
	for z in range(_wz - 1, -1, -1):
		for x in range(_wn - 1, -1, -1):
			var i := z * _wn + x
			var best: float = _wd[i]
			if x < _wn - 1:
				best = minf(best, _wd[i + 1] + 1.0)
			if z < _wz - 1:
				best = minf(best, _wd[i + _wn] + 1.0)
			if x < _wn - 1 and z < _wz - 1:
				best = minf(best, _wd[i + _wn + 1] + 1.4142)
			_wd[i] = best


func water_km(x: float, z: float) -> float:
	if _wn == 0:
		return 999.0
	var best := 999.0
	if _wn > 0:
		var ix := clampi(int(x / 2000.0), 0, _wn - 1)
		var iz := clampi(int(z / 2000.0), 0, _wz - 1)
		best = _wd[iz * _wn + ix] * 2.0
	for sp in _springs:
		best = minf(best, Vector2(x - sp.x, z - sp.y).length() / 1000.0)
	return best


func _process(dt: float) -> void:
	if host == null or cam == null:
		return
	_wind_t += dt
	var w_scale := 1.0
	var s_light := 1.0
	if "fx" in host and host.fx != null:
		var row: Dictionary = host.fx.row()
		w_scale = clampf(float(row.get("wind", 1.0)), 0.3, 2.2)
		s_light = clampf(float(row.get("sun", 1.0)), 0.2, 1.3)
	RenderingServer.global_shader_parameter_set("atm_time", _wind_t)
	RenderingServer.global_shader_parameter_set("atm_wind", Vector2(0.80 * w_scale, -0.60 * w_scale))
	RenderingServer.global_shader_parameter_set("atm_light", s_light)
	var p := cam.global_position
	if Vector2(p.x - _last.x, p.z - _last.z).length() < MOVED:
		return
	_last = p
	_rebuild(p)


func _rain_at(x: float, z: float) -> float:
	if host != null and host.has_method("rain_mm_at"):
		if host.has_method("height_at") and float(host.height_at(x, z)) > 850.0:
			return 0.0
		return float(host.rain_mm_at(x, z))
	return 0.0


func _slope_at(x: float, z: float, d := 180.0) -> float:
	var sx: float = (host.height_at(x + d, z) - host.height_at(x - d, z)) / (2.0 * d)
	var sz: float = (host.height_at(x, z + d) - host.height_at(x, z - d)) / (2.0 * d)
	return sqrt(sx * sx + sz * sz)


func _append_instance(tf_map: Dictionary, col_map: Dictionary, species: String, jx: float, gy: float, jz: float, hh: float, cr: float, yaw: float, sh: float, var_hash: int) -> void:
	if _use_real:
		var vars: Array = _species_variants.get(species, [])
		if vars.is_empty():
			return
		var pkey := String(vars[posmod(var_hash, vars.size())])
		var proto: Dictionary = _protos[pkey]
		var sc := clampf(hh / maxf(float(proto["H"]), 0.35), 0.55, 1.55)
		var wj := 0.90 + 0.20 * KRand.unit(KRand.mix32(var_hash + 91))
		var b := Basis(Vector3.UP, yaw).scaled(Vector3(sc * wj, sc, sc * wj))
		(tf_map[pkey] as Array).append(Transform3D(b, Vector3(jx, gy, jz)))
		(col_map[pkey] as Array).append(Color(sh, sh, sh, 1.0))
	elif _mm.has(species):
		var sp: Dictionary = SPECIES[species]
		var b2 := Basis(Vector3.UP, yaw).scaled(Vector3(cr, hh, cr))
		(tf_map[species] as Array).append(Transform3D(b2, Vector3(jx, gy, jz)))
		var c: Color = sp["col"]
		(col_map[species] as Array).append(Color(c.r * sh, c.g * sh, c.b * sh, 1.0))


func _rebuild(p: Vector3) -> void:
	var tf := {}
	var cols := {}
	var tf_far := {}
	var cols_far := {}
	if _use_real:
		for pkey in _protos:
			tf[pkey] = []
			cols[pkey] = []
			tf_far[pkey] = []
			cols_far[pkey] = []
	else:
		for k in _mm:
			tf[k] = []
			cols[k] = []

	var near_r := NEAR_CELL * float(NEAR_REACH)
	# 1. Outer regional ring (CELL = 300 m, up to 2.7 km; routed to _proto_far_pools so distant trees skip shadow cascades)
	var cx := int(floor(p.x / CELL))
	var cz := int(floor(p.z / CELL))
	for dz in range(-REACH, REACH + 1):
		for dx in range(-REACH, REACH + 1):
			var ix := cx + dx
			var iz := cz + dz
			var h0 := KRand.cell(SEED, ix, iz)
			var u0 := KRand.unit(h0)
			var x := (float(ix) + KRand.unit(KRand.mix32(h0 + 11))) * CELL
			var z := (float(iz) + KRand.unit(KRand.mix32(h0 + 12))) * CELL
			var dist_p := Vector2(x - p.x, z - p.z).length()
			if dist_p > CELL * float(REACH):
				continue
			var rain_mm := _rain_at(x, z)
			var wkm := water_km(x, z)
			if dist_p < near_r * 0.94 and (rain_mm > 900.0 or wkm < 10.0):
				continue
			var g: float = host.height_at(x, z)
			var slope := _slope_at(x, z, CELL * 0.8)
			var key := ""
			if rain_mm >= 900.0 and _use_real:
				# Prefer lighter distant silhouettes with occasional emergent fig/dragon landmarks on the horizon
				var u_far := 0.08 + 0.92 * KRand.unit(KRand.mix32(h0 + 31))
				key = _mantis_species_for(rain_mm, slope, u0, u_far)
			else:
				var clump := KRand.unit(KRand.cell(SEED + 77, ix >> 2, iz >> 2))
				key = _species_for(g, slope, wkm, u0)
				if key == "poplar_live" and _use_real and KRand.unit(KRand.mix32(h0 + 19)) < 0.35:
					key = "poplar_gold"
				if (key == "poplar_live" or key == "poplar_gold" or key == "poplar_dead" or key == "tamarisk") and clump < 0.42:
					key = ""
			if key == "" or not SPECIES.has(key):
				continue
			var n := 1 if _use_real else (1 + int(u0 * 23.0) % 3)
			for j in n:
				var h := KRand.mix32(h0 + j * 40503)
				var jx := x + (KRand.unit(h) - 0.5) * CELL * 0.82
				var jz := z + (KRand.unit(KRand.mix32(h + 1)) - 0.5) * CELL * 0.82
				var gy: float = host.height_at(jx, jz)
				var sp: Dictionary = SPECIES[key]
				var hh: float = lerpf(sp["h"][0], sp["h"][1], KRand.unit(KRand.mix32(h + 2)))
				var cr: float = lerpf(sp["crown"][0], sp["crown"][1], KRand.unit(KRand.mix32(h + 3)))
				var yaw := KRand.unit(KRand.mix32(h + 4)) * TAU
				var sh := 0.88 + 0.24 * KRand.unit(KRand.mix32(h + 5))
				if _use_real:
					_append_instance(tf_far, cols_far, key, jx, gy, jz, hh, cr, yaw, sh, h)
				else:
					_append_instance(tf, cols, key, jx, gy, jz, hh, cr, yaw, sh, h)

	# 2. Walkable near-camera canopy ring (64 m cells within 512 m) for Mantis monsoon woodland & Catch oases
	var cam_rain := _rain_at(p.x, p.z)
	var cam_wkm := water_km(p.x, p.z)
	if _use_real and (cam_rain > 860.0 or cam_wkm < 14.0):
		var ncx := int(floor(p.x / NEAR_CELL))
		var ncz := int(floor(p.z / NEAR_CELL))
		for dz in range(-NEAR_REACH, NEAR_REACH + 1):
			for dx in range(-NEAR_REACH, NEAR_REACH + 1):
				var ix := ncx + dx
				var iz := ncz + dz
				var h0 := KRand.cell(SEED + 509, ix, iz)
				var x := (float(ix) + KRand.unit(KRand.mix32(h0 + 7))) * NEAR_CELL
				var z := (float(iz) + KRand.unit(KRand.mix32(h0 + 9))) * NEAR_CELL
				if Vector2(x - p.x, z - p.z).length() > near_r:
					continue
				var r_mm := _rain_at(x, z)
				var wkm2 := water_km(x, z)
				var slope2 := _slope_at(x, z, 60.0)
				var u0 := KRand.unit(h0)
				var u1 := KRand.unit(KRand.mix32(h0 + 17))
				var key2 := ""
				if r_mm >= 900.0:
					key2 = _mantis_species_for(r_mm, slope2, u0, u1)
				elif wkm2 < 10.0:
					key2 = _species_for(host.height_at(x, z), slope2, wkm2, u0)
					if key2 == "poplar_live" and u1 < 0.32:
						key2 = "poplar_gold"
				if key2 == "" or not SPECIES.has(key2):
					continue
				var hj := KRand.mix32(h0 + 19937)
				var jx := x + (KRand.unit(hj) - 0.5) * NEAR_CELL * 0.76
				var jz := z + (KRand.unit(KRand.mix32(hj + 1)) - 0.5) * NEAR_CELL * 0.76
				var gy: float = host.height_at(jx, jz)
				var sp2: Dictionary = SPECIES[key2]
				var hh2: float = lerpf(sp2["h"][0], sp2["h"][1], KRand.unit(KRand.mix32(hj + 2)))
				var cr2: float = lerpf(sp2["crown"][0], sp2["crown"][1], KRand.unit(KRand.mix32(hj + 3)))
				var yaw2 := KRand.unit(KRand.mix32(hj + 4)) * TAU
				var sh2 := 0.90 + 0.20 * KRand.unit(KRand.mix32(hj + 5))
				_append_instance(tf, cols, key2, jx, gy, jz, hh2, cr2, yaw2, sh2, hj)

	# 3. Walkable Mantis understory ring (16 m cells within 144 m: ferns, Socotran aloe/kalanchoe & croton/monsoon grass)
	if _use_real and cam_rain > 900.0:
		var ucx := int(floor(p.x / UNDER_CELL))
		var ucz := int(floor(p.z / UNDER_CELL))
		var under_r := UNDER_CELL * float(UNDER_REACH)
		for dz in range(-UNDER_REACH, UNDER_REACH + 1):
			for dx in range(-UNDER_REACH, UNDER_REACH + 1):
				var ix := ucx + dx
				var iz := ucz + dz
				var h0 := KRand.cell(SEED + 1301, ix, iz)
				var x := (float(ix) + KRand.unit(KRand.mix32(h0 + 3))) * UNDER_CELL
				var z := (float(iz) + KRand.unit(KRand.mix32(h0 + 5))) * UNDER_CELL
				if Vector2(x - p.x, z - p.z).length() > under_r:
					continue
				var r_mm := _rain_at(x, z)
				if r_mm < 900.0 or _slope_at(x, z, 40.0) > 0.34:
					continue
				var u0 := KRand.unit(h0)
				if u0 < 0.32:
					continue
				var usel := KRand.unit(KRand.mix32(h0 + 13))
				var ukey := "mantis_croton"
				if r_mm >= 1220.0 and usel < 0.42:
					ukey = "mantis_fern"
				elif usel < 0.68:
					ukey = "mantis_aloe"
				var spu: Dictionary = SPECIES[ukey]
				var gy: float = host.height_at(x, z)
				var hhu: float = lerpf(spu["h"][0], spu["h"][1], KRand.unit(KRand.mix32(h0 + 21)))
				var cru: float = lerpf(spu["crown"][0], spu["crown"][1], KRand.unit(KRand.mix32(h0 + 23)))
				var yawu := KRand.unit(KRand.mix32(h0 + 29)) * TAU
				_append_instance(tf, cols, ukey, x, gy, z, hhu, cru, yawu, 0.92 + 0.16 * usel, h0)

	var tally := []
	if _use_real:
		for pkey in _proto_pools:
			var arr: Array = tf[pkey]
			var carr: Array = cols[pkey]
			var nodes: Array = _proto_pools[pkey]
			for ni in nodes.size():
				var mi := nodes[ni] as MultiMeshInstance3D
				var m: MultiMesh = mi.multimesh
				m.instance_count = arr.size()
				for i in arr.size():
					m.set_instance_transform(i, arr[i])
					m.set_instance_color(i, carr[i])
				mi.visible = arr.size() > 0

			var far_arr: Array = tf_far[pkey]
			var far_carr: Array = cols_far[pkey]
			var far_nodes: Array = _proto_far_pools[pkey]
			for ni in far_nodes.size():
				var mi_f := far_nodes[ni] as MultiMeshInstance3D
				var m_f: MultiMesh = mi_f.multimesh
				m_f.instance_count = far_arr.size()
				for i in far_arr.size():
					m_f.set_instance_transform(i, far_arr[i])
					m_f.set_instance_color(i, far_carr[i])
				mi_f.visible = far_arr.size() > 0

			var total_n := arr.size() + far_arr.size()
			if total_n > 0:
				tally.append("%s %d" % [pkey, total_n])
	else:
		for k in _mm:
			var m2: MultiMesh = _mm[k].multimesh
			var arr2: Array = tf[k]
			m2.instance_count = arr2.size()
			for i in arr2.size():
				m2.set_instance_transform(i, arr2[i])
				m2.set_instance_color(i, cols[k][i])
			if arr2.size() > 0:
				tally.append("%s %d" % [k, arr2.size()])
	if _said < 3:
		_said += 1
		print("  flora at %d,%d: rain %.0f mm, water %.1f km, %s" % [int(p.x / 2000.0), int(p.z / 2000.0),
			cam_rain, cam_wkm, ", ".join(tally) if tally.size() else "NOTHING"])


# Mantis's Socotran monsoon forest & savanna species rule (900..1,553 mm/yr pocket on the Bowl's SW shore)
func _mantis_species_for(rain_mm: float, slope: float, u: float, u_sp: float) -> String:
	if slope > 0.36 or rain_mm < 900.0:
		return ""
	if rain_mm >= 1260.0:
		# Lush Socotran monsoon forest: emergent Ficus vasta giants, Dracaena groves, Sterculia, Frankincense, Pomegranate & Palms
		if u < 0.24:
			return ""
		if u_sp < 0.14:
			return "mantis_fig"
		if u_sp < 0.36:
			return "dragon_blood"
		if u_sp < 0.56:
			return "sterculia"
		if u_sp < 0.74:
			return "frankincense"
		if u_sp < 0.88:
			return "pomegranate"
		return "date_palm"
	if rain_mm >= 1060.0:
		# Monsoon woodland & upper slopes: Dragon's-blood groves, Frankincense, Cucumber bottle-trees, Palms & Mesquite
		if u < 0.42:
			return ""
		if u_sp < 0.30:
			return "dragon_blood"
		if u_sp < 0.48:
			return "frankincense"
		if u_sp < 0.64:
			return "cucumber_tree"
		if u_sp < 0.78:
			return "mesquite"
		if u_sp < 0.90:
			return "date_palm"
		return "bottle_tree"
	# Savanna fringe (900..1,060 mm): Cucumber trees, Bottle trees, Giant candelabra, Mesquite & Desert rose
	if u < 0.66:
		return ""
	if u_sp < 0.28:
		return "mesquite"
	if u_sp < 0.50:
		return "cucumber_tree"
	if u_sp < 0.68:
		return "bottle_tree"
	if u_sp < 0.84:
		return "candelabra"
	return "desert_rose"


# The Catch kit's dry-basin groundwater rule (biomes/catch): kept exact for catch_bowl_test.gd check #18
func _species_for(g: float, slope: float, wkm: float, u: float) -> String:
	if slope > 0.12:
		return ""                                   # no life on the scarps
	if g < -800.0 and slope < 0.03:
		# the salt pan: halophytes only, and thinly
		if u > 0.93:
			return "brinelamp"
		if u > 0.84:
			return "saltbush"
		return ""
	if wkm < 8.0:
		# the tugai, where the groundwater still is: the only green in the region
		if u > 0.62:
			return "poplar_live"
		if u > 0.5:
			return "tamarisk"
		return ""
	if wkm < 40.0:
		# the dead channels: the water table fell and the poplars died standing, as the kit says they do
		if u > 0.88:
			return "poplar_dead"
		if u > 0.78:
			return "tamarisk"
		if u > 0.66:
			return "broom"
		return ""
	if g < 2600.0:
		# the open sand and reg: the dune shrub, and saltbush on the margins
		if u > 0.90:
			return "broom"
		if u > 0.86:
			return "saltbush"
		return ""
	return ""
