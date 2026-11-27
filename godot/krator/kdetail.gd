# DETAIL NORMALS AND THE NORMAL MAP'S FRAME (GODOT-LOOK-PLAN.md section 8, M9 and M10; shaders/lib/detail.gdshaderinc).
# One shared array of detail normals, a layer a surface class, made here once from noise (nothing to ship or source): a
# material names its layer and how many detail tiles one tile of its own uv holds; the shader adds the layer's normal
# under six metres. And the switch that puts a normal map on the mesh's own tangents where the mesh has them.
#   KratorDetail.apply(spec)                       # krator/look.gd calls it: detail (strength, 0 is off), tangents
#   KratorDetail.layer_of("stone")  -> 0           # by KratorWeather's classes; -1: the class takes none
#   KratorDetail.scale_for(tile_m)  -> Vector2     # detail tiles a tile of the surface's own uv
# The layers are looks, never placement: nothing on the CPU reads them back.
class_name KratorDetail
extends RefCounted

const SIZE := 256
const TILE_M := 0.32    # metres one detail tile covers
# the layers, in order, and which of KratorWeather's classes take which (a class not listed takes none: lacquer, gilt,
# furniture, a pattern)
const LAYERS := ["stone", "plaster", "wood", "metal", "cloth", "earth"]
const CLASS_LAYER := {"stone": 0, "brick": 0, "roof": 0, "paving": 0, "plaster": 1, "wood": 2, "thatch": 2, "metal": 3, "cloth": 4, "earth": 5}

static var _arr: Texture2DArray = null
static var _imgs: Array[Image] = []


static func layer_of(cls: String) -> int:
	return int(CLASS_LAYER.get(cls, -1))


# detail tiles in one tile of a surface whose own tile is `tile_m` metres (x and y)
static func scale_for(tile_m: Vector2) -> Vector2:
	return Vector2(maxf(tile_m.x, 0.05) / TILE_M, maxf(tile_m.y, 0.05) / TILE_M)


static func _noise(seed_v: int, type: int, cycles: float, octaves: int, w := SIZE, h := SIZE) -> Image:
	var n := FastNoiseLite.new()
	n.noise_type = type
	n.seed = seed_v
	n.frequency = cycles / float(w)
	n.fractal_type = FastNoiseLite.FRACTAL_FBM if octaves > 1 else FastNoiseLite.FRACTAL_NONE
	n.fractal_octaves = octaves
	if type == FastNoiseLite.TYPE_CELLULAR:
		n.cellular_return_type = FastNoiseLite.RETURN_DISTANCE2_SUB
	var img := n.get_seamless_image(w, h, false, false, 0.25, true)
	if img.get_format() != Image.FORMAT_L8:
		img.convert(Image.FORMAT_L8)
	return img


# a short seamless field stretched to the full height, still seamless: resizing clamps at the image's edge, so the field
# is stacked three high, resized, and the middle taken
static func _stretch_v(g: Image) -> Image:
	var w := g.get_width()
	var h := g.get_height()
	var tall := Image.create(w, h * 3, false, g.get_format())
	for k in 3:
		tall.blit_rect(g, Rect2i(0, 0, w, h), Vector2i(0, k * h))
	tall.resize(SIZE, SIZE * 3, Image.INTERPOLATE_CUBIC)
	return tall.get_region(Rect2i(0, SIZE, SIZE, SIZE))


# a height field's tangent-space normal map (Image.bump_map_to_normal_map reads its neighbours across the edge, so a
# seamless field gives a seamless map), with mipmaps
static func _normal_map(height: PackedByteArray) -> Image:
	var out := Image.create_from_data(SIZE, SIZE, false, Image.FORMAT_L8, height)
	out.convert(Image.FORMAT_RGBA8)
	out.bump_map_to_normal_map(6.0)
	out.convert(Image.FORMAT_RGB8)
	out.generate_mipmaps()
	return out


# a height field (bytes, one a pixel) for a layer
static func _height(layer: String) -> PackedByteArray:
	var out := PackedByteArray()
	out.resize(SIZE * SIZE)
	match layer:
		"stone":      # pits and grain: cells under a fine field
			var a := _noise(11, FastNoiseLite.TYPE_CELLULAR, 14.0, 1).get_data()
			var b := _noise(12, FastNoiseLite.TYPE_SIMPLEX, 30.0, 3).get_data()
			for i in out.size():
				out[i] = int(clampf(0.55 * a[i] + 0.45 * b[i], 0.0, 255.0))
		"plaster":    # a trowelled skin: soft, low
			var a := _noise(21, FastNoiseLite.TYPE_SIMPLEX, 10.0, 4).get_data()
			for i in out.size():
				out[i] = int(128.0 + (float(a[i]) - 128.0) * 0.55)
		"wood":       # grain along v: a field eight times as long as it is wide
			out = _stretch_v(_noise(31, FastNoiseLite.TYPE_SIMPLEX, 40.0, 2, SIZE, SIZE / 8)).get_data()
		"metal":      # hammered and brushed: shallow cells
			var a := _noise(41, FastNoiseLite.TYPE_CELLULAR, 9.0, 1).get_data()
			var b := _stretch_v(_noise(42, FastNoiseLite.TYPE_SIMPLEX, 60.0, 1, SIZE, SIZE / 16)).get_data()
			for i in out.size():
				out[i] = int(128.0 + (float(a[i]) - 128.0) * 0.30 + (float(b[i]) - 128.0) * 0.18)
		"cloth":      # a plain weave: warp over weft, 32 threads a tile
			for y in SIZE:
				for x in SIZE:
					var u := float(x) / float(SIZE) * 32.0
					var v := float(y) / float(SIZE) * 32.0
					var over := (int(floor(u)) + int(floor(v))) % 2 == 0
					var warp := sin(fposmod(u, 1.0) * PI)
					var weft := sin(fposmod(v, 1.0) * PI)
					out[y * SIZE + x] = int(clampf((warp * (1.0 if over else 0.55) + weft * (0.55 if over else 1.0)) * 0.5, 0.0, 1.0) * 255.0)
		_:            # earth: clods and grit
			var a := _noise(61, FastNoiseLite.TYPE_SIMPLEX, 8.0, 5).get_data()
			var b := _noise(62, FastNoiseLite.TYPE_CELLULAR, 22.0, 1).get_data()
			for i in out.size():
				out[i] = int(clampf(0.7 * a[i] + 0.3 * b[i], 0.0, 255.0))
	return out


# the layers' images: a tangent-space normal map each (RGB8, with mipmaps), in LAYERS' order. Made once.
static func layer_images() -> Array[Image]:
	if _imgs.is_empty():
		for layer in LAYERS:
			_imgs.append(_normal_map(_height(layer)))
	return _imgs


# the array the shader samples: a layer a class. Made once.
static func texture_array() -> Texture2DArray:
	if _arr == null:
		_arr = Texture2DArray.new()
		_arr.create_from_images(layer_images())
	return _arr


# the globals, from a look (krator/look.gd): detail (the strength, 0 is off) and tangents (the mesh's own frame)
static func apply(spec: Dictionary) -> void:
	var k := clampf(float(spec.get("detail", 0.0)), 0.0, 1.5)
	if k > 0.0:
		RenderingServer.global_shader_parameter_set("k_detail_arr", texture_array())
	RenderingServer.global_shader_parameter_set("k_surface", Vector4(k, 1.0 if bool(spec.get("tangents", false)) else 0.0, 0.0, 0.0))


# a material's detail parameters, by its surface class and its own tile (metres): the world importer and KratorKmat call it
static func set_on(sm: ShaderMaterial, cls: String, tile_m: Vector2) -> void:
	sm.set_shader_parameter("detail_layer", float(layer_of(cls)))
	sm.set_shader_parameter("detail_scale", scale_for(tile_m))
