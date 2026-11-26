# THE WEATHERING STACK'S GODOT SIDE (GODOT-LOOK-PLAN.md section 8, M7; shaders/lib/weather.gdshaderinc). Three things:
#   the shared noise texture (four seamless channels, made here once from FastNoiseLite: nothing to ship or source),
#   the amounts a surface takes by its class (stone, plaster, timber, roof ...), read from a material record's library
#   family, and the three globals the include reads: k_weather (strength, wet), k_weather_noise, k_world_origin.
#   KratorWeather.apply(spec)              # krator/look.gd calls it: the strength by tier, 0 is off
#   KratorWeather.amounts("plaster.limewash.red", "wall")   -> Vector4(drift, run-off and under, moss, top)
#   KratorWeather.set_origin(stream.origin)                 # the stream calls it when it opens and when it rebases
# The noise is a look, never a placement: nothing on the CPU reads it back, so a last-bit difference between machines in
# FastNoiseLite moves nothing.
class_name KratorWeather
extends RefCounted

const NOISE_SIZE := 256
const PERIOD := 4096.0   # metres: every period and axis of the include divides it (weather.gdshaderinc)

# amounts by class: [drift (hue and value), run-off and under-dark, moss and lichen, top bleach]
const CLASSES := {
	"stone": [1.0, 0.8, 0.8, 0.5],
	"plaster": [1.0, 1.0, 0.3, 0.4],
	"brick": [0.9, 0.7, 0.5, 0.4],
	"wood": [0.9, 0.6, 0.35, 0.8],
	"roof": [1.0, 0.5, 1.0, 0.5],
	"thatch": [1.0, 0.3, 0.8, 0.7],
	"paving": [0.9, 0.0, 0.5, 0.3],
	"earth": [0.8, 0.5, 0.3, 0.3],
	"metal": [0.5, 0.7, 0.0, 0.2],
	"cloth": [0.6, 0.3, 0.0, 0.6],
	"painted": [0.5, 0.35, 0.0, 0.2],     # a pattern set: murals, friezes, mosaics, valances
	"glazed": [0.2, 0.15, 0.0, 0.0],      # lacquer, gilt, glazed tile, glass
	"furniture": [0.35, 0.0, 0.0, 0.0],   # the catalog's pieces: no rain reaches them
	"plain": [0.6, 0.4, 0.15, 0.3],       # a record that names no family
}
# a library family's first word (core/materials/library: wood.siding, roof.scale.slate, patterns/order/rug) to its class
const FIRST := {"stone": "stone", "rock": "stone", "plaster": "plaster", "brick": "brick", "wood": "wood", "band": "wood", "roof": "roof",
	"paving": "paving", "earth": "earth", "ground": "earth", "metal": "metal", "cloth": "cloth", "patterns": "painted", "tile": "glazed", "glass": "glazed"}
# a word anywhere in the name that overrides the first
const WORDS := {"lacquer": "glazed", "gilt": "glazed", "glazed": "glazed", "gold": "glazed", "glass": "glazed", "thatch": "thatch", "reed": "thatch"}

static var _noise: ImageTexture = null


# the class of a record: by its library family (`lib`), else by its own family or name
static func class_of(lib, family := "") -> String:
	var name := str(lib) if lib != null and str(lib) != "" else ""
	if name == "":
		var f := str(family)
		if f.begins_with("furniture:"):
			return "furniture"
		name = f
	var low := name.to_lower()
	var parts := low.replace("/", ".").replace("_", ".").replace("-", ".").replace(":", ".").split(".", false)
	for w in parts:
		if WORDS.has(w):
			return WORDS[w]
	if parts.size() > 0 and FIRST.has(parts[0]):
		return FIRST[parts[0]]
	return "plain"


static func amounts(lib, family := "") -> Vector4:
	var a: Array = CLASSES[class_of(lib, family)]
	return Vector4(a[0], a[1], a[2], a[3])


# one seamless field as bytes (one a pixel): FastNoiseLite's own seamless image, `cycles` features across the tile
static func _field(seed_v: int, cycles: float, octaves: int) -> PackedByteArray:
	var n := FastNoiseLite.new()
	n.noise_type = FastNoiseLite.TYPE_SIMPLEX
	n.seed = seed_v
	n.frequency = cycles / float(NOISE_SIZE)
	n.fractal_type = FastNoiseLite.FRACTAL_FBM
	n.fractal_octaves = octaves
	n.fractal_lacunarity = 2.0
	n.fractal_gain = 0.5
	var img := n.get_seamless_image(NOISE_SIZE, NOISE_SIZE, false, false, 0.25, true)
	if img.get_format() != Image.FORMAT_L8:
		img.convert(Image.FORMAT_L8)
	return img.get_data()


# the shared texture: R slow drift, G patches (hue, moss), B streak source, A grain. Made once.
static func noise_texture() -> ImageTexture:
	if _noise != null:
		return _noise
	var chans := [_field(1107, 3.0, 3), _field(2203, 2.0, 2), _field(3301, 11.0, 2), _field(4409, 24.0, 3)]
	var data := PackedByteArray()
	data.resize(NOISE_SIZE * NOISE_SIZE * 4)
	for i in NOISE_SIZE * NOISE_SIZE:
		data[i * 4] = chans[0][i]
		data[i * 4 + 1] = chans[1][i]
		data[i * 4 + 2] = chans[2][i]
		data[i * 4 + 3] = chans[3][i]
	var img := Image.create_from_data(NOISE_SIZE, NOISE_SIZE, false, Image.FORMAT_RGBA8, data)
	img.generate_mipmaps()
	_noise = ImageTexture.create_from_image(img)
	return _noise


static var _last_aridity := 0.0
static var _last_wind_ang := 0.0


# the globals, from a look (krator/look.gd): weather (the stack's strength, 0 is off), wet, aridity, and optional wind
static func apply(spec: Dictionary) -> void:
	var k := clampf(float(spec.get("weather", 0.0)), 0.0, 1.5)
	if k > 0.0:
		RenderingServer.global_shader_parameter_set("k_weather_noise", noise_texture())
	_last_aridity = clampf(float(spec.get("aridity", 0.0)), 0.0, 1.0)
	_last_wind_ang = float(spec.get("wind_angle", _last_wind_ang))
	RenderingServer.global_shader_parameter_set("k_weather", Vector4(k, clampf(float(spec.get("wet", 0.0)), 0.0, 1.0), _last_aridity, _last_wind_ang))


# how wet the world is, 0..1 (krator/sky.gd's weather.wet, when a host passes it on); keeps current aridity & wind angle
static func set_wet(k: float, wet: float) -> void:
	RenderingServer.global_shader_parameter_set("k_weather", Vector4(clampf(k, 0.0, 1.5), clampf(wet, 0.0, 1.0), _last_aridity, _last_wind_ang))


# full climate update for arid/desert hosts: strength, wetness, aridity (0 temperate .. 1 desert), and wind vector
static func set_climate(k: float, wet: float, aridity: float, wind := Vector2(1.0, 0.0)) -> void:
	if k > 0.0:
		RenderingServer.global_shader_parameter_set("k_weather_noise", noise_texture())
	_last_aridity = clampf(aridity, 0.0, 1.0)
	if wind.length_squared() > 1e-6:
		_last_wind_ang = atan2(wind.y, wind.x)
	RenderingServer.global_shader_parameter_set("k_weather", Vector4(clampf(k, 0.0, 1.5), clampf(wet, 0.0, 1.0), _last_aridity, _last_wind_ang))


# the stream's origin ([x, y, z], metres), so the noise stays on the world across a rebase
static func set_origin(origin: Array) -> void:
	RenderingServer.global_shader_parameter_set("k_world_origin", origin_mod(origin))


static func origin_mod(origin: Array) -> Vector3:
	if origin.size() < 3:
		return Vector3.ZERO
	return Vector3(fposmod(float(origin[0]), PERIOD), float(origin[1]), fposmod(float(origin[2]), PERIOD))
