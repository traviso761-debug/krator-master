# Stage 3 + 4 Global Ground & Horizon Resource Loader (GRAPHICS-TERRAIN-PROPOSAL.md S1 + S4)
# Loads:
#   1. res://data/ground_layers/layers.json -> mipmapped Texture2DArray pair (kgd_albedo_arr, kgd_nr_arr) + card_themeda
#   2. <case_dir>/horizon/horizon.json      -> 8-azimuth 40 km horizon elevation textures (khz_tex0, khz_tex1)
class_name KratorGroundLayers
extends RefCounted

const LAYERS_JSON := "res://data/ground_layers/layers.json"

static var _loaded_s4 := false
static var albedo_arr: Texture2DArray = null
static var nr_arr: Texture2DArray = null
static var plume_tex: Texture2D = null
static var layer_means: PackedVector3Array = PackedVector3Array()
static var s4_vram_bytes := 0

static var _loaded_hz_path := ""
static var hz_tex0: Texture2D = null
static var hz_tex1: Texture2D = null
static var hz_meta: Dictionary = {}
static var hz_vram_bytes := 0


static func _load_webp_image(path: String, gen_mips: bool) -> Image:
	if not FileAccess.file_exists(path):
		return null
	var bytes := FileAccess.get_file_as_bytes(path)
	if bytes.is_empty():
		return null
	var img := Image.new()
	if img.load_webp_from_buffer(bytes) != OK:
		return null
	img.convert(Image.FORMAT_RGBA8)
	if gen_mips:
		img.generate_mipmaps()
	return img


static func ensure_s4() -> bool:
	if _loaded_s4:
		return albedo_arr != null and nr_arr != null
	_loaded_s4 = true
	if not FileAccess.file_exists(LAYERS_JSON):
		RenderingServer.global_shader_parameter_set("kgd_params", Vector4(0.0, 0.0, 0.0, 0.0))
		return false
	var doc = KData.read_json(LAYERS_JSON)
	if not (doc is Dictionary) or not (doc.get("layers") is Array):
		return false
	var base_dir := LAYERS_JSON.get_base_dir()
	var alb_imgs: Array[Image] = []
	var nr_imgs: Array[Image] = []
	layer_means.clear()
	s4_vram_bytes = 0
	for lrec in doc["layers"]:
		# decoded to RGBA8, mipmapped and compressed once (krator/cook.gd)
		var ia := KratorCook.image_file(base_dir + "/" + str(lrec["albedo"]), "albedo", true)
		var inr := KratorCook.image_file(base_dir + "/" + str(lrec["normal_rough"]), "data", true)
		if ia == null or inr == null:
			return false
		s4_vram_bytes += ia.get_data().size() + inr.get_data().size()
		alb_imgs.append(ia)
		nr_imgs.append(inr)
		var ml: Array = lrec.get("mean_linear", [0.2, 0.2, 0.2])
		layer_means.append(Vector3(float(ml[0]), float(ml[1]), float(ml[2])))

	albedo_arr = Texture2DArray.new()
	albedo_arr.create_from_images(alb_imgs)
	nr_arr = Texture2DArray.new()
	nr_arr.create_from_images(nr_imgs)

	if doc.has("plume_card"):
		var ip := KratorCook.image_file(base_dir + "/" + str(doc["plume_card"]), "albedo", true)
		if ip != null:
			s4_vram_bytes += ip.get_data().size()
			plume_tex = ImageTexture.create_from_image(ip)

	RenderingServer.global_shader_parameter_set("kgd_albedo_arr", albedo_arr)
	RenderingServer.global_shader_parameter_set("kgd_nr_arr", nr_arr)
	RenderingServer.global_shader_parameter_set("kgd_params", Vector4(1.0, 1.0, float(alb_imgs.size()), 0.0))
	return true


static func bind_horizon(case_dir: String, index_doc: Dictionary) -> Dictionary:
	var rel := str(index_doc.get("horizon", "horizon/horizon.json"))
	var hpath := case_dir.path_join(rel)
	if not FileAccess.file_exists(hpath):
		clear_horizon()
		return {}
	if _loaded_hz_path == hpath and hz_tex0 != null and hz_tex1 != null:
		_apply_hz_globals()
		return hz_meta
	var doc = KData.read_json(hpath)
	if not (doc is Dictionary) or not (doc.get("files") is Array) or (doc["files"] as Array).size() < 2:
		clear_horizon()
		return {}
	var hdir := hpath.get_base_dir()
	var files: Array = doc["files"]
	var i0 := _load_webp_image(hdir.path_join(str(files[0])), false)
	var i1 := _load_webp_image(hdir.path_join(str(files[1])), false)
	if i0 == null or i1 == null:
		clear_horizon()
		return {}
	hz_vram_bytes = i0.get_data().size() + i1.get_data().size()
	hz_tex0 = ImageTexture.create_from_image(i0)
	hz_tex1 = ImageTexture.create_from_image(i1)
	hz_meta = doc
	_loaded_hz_path = hpath
	_apply_hz_globals()
	return hz_meta


static func _apply_hz_globals() -> void:
	if hz_meta.is_empty() or hz_tex0 == null or hz_tex1 == null:
		clear_horizon()
		return
	var gb: Array = hz_meta.get("grid_box", [0.0, 0.0, 1.0, 1.0])
	var x0 := float(gb[0]); var z0 := float(gb[1])
	var sx := maxf(1.0, float(gb[2]) - x0)
	var sz := maxf(1.0, float(gb[3]) - z0)
	RenderingServer.global_shader_parameter_set("khz_tex0", hz_tex0)
	RenderingServer.global_shader_parameter_set("khz_tex1", hz_tex1)
	RenderingServer.global_shader_parameter_set("khz_box", Vector4(x0, z0, 1.0 / sx, 1.0 / sz))
	RenderingServer.global_shader_parameter_set("khz_params", Vector4(
		float(hz_meta.get("max_tan", 2.0)), 1.0, float(hz_meta.get("nx", 2)), float(hz_meta.get("nz", 2))))


static func clear_horizon() -> void:
	RenderingServer.global_shader_parameter_set("khz_params", Vector4(2.0, 0.0, 2.0, 2.0))
