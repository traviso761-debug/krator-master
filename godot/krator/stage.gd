# The page's stage (KSTAGE.capture, core/biome/44-core-stage.js: carried by BIO.export as `stage`, and written as
# stage.json beside a glTF region) applied to the spike's Environment and lights: the tonemapper and exposure, the
# sky panorama the page rendered, ambient from its hemisphere and ambient lights, its sun and fill lights, its fog.
# The record's colours are three's linear working values; Godot's light, fog and ambient colours are sRGB.
extends RefCounted

const TONE := {"ACESFilmic": Environment.TONE_MAPPER_ACES, "Reinhard": Environment.TONE_MAPPER_REINHARDT,
	"Cineon": Environment.TONE_MAPPER_FILMIC, "Linear": Environment.TONE_MAPPER_LINEAR, "None": Environment.TONE_MAPPER_LINEAR}


static func _srgb(hex) -> Color:
	return Color.html(str(hex)).linear_to_srgb() if hex != null else Color.WHITE


# -> the base values the spike's clock and weather scale ({sun, ambient, fog_density, fog_colour}), and a report
static func apply(st: Dictionary, env: Environment, sun: DirectionalLight3D, parent: Node) -> Dictionary:
	var out := {"report": {}}
	var r = st.get("renderer")
	if r is Dictionary:
		env.tonemap_mode = TONE.get(str(r.get("toneMapping")), Environment.TONE_MAPPER_FILMIC)
		env.tonemap_exposure = float(r.get("exposure", 1.0))
	var sky = st.get("sky")
	if sky is Dictionary and sky.has("png"):
		var tex := KData.texture_from_data_url(sky["png"])
		var pm := PanoramaSkyMaterial.new()
		pm.panorama = tex
		pm.filter = true
		env.sky.sky_material = pm
		env.background_mode = Environment.BG_SKY
		out["report"]["sky"] = "the page's sky panorama, from %s (nearer than %s m left out)" % [str(sky.get("at")), str(sky.get("near"))]
	var L: Dictionary = st.get("lights", {})
	var amb := Color(0, 0, 0)
	var amb_e := 0.0
	for h in L.get("hemisphere", []):   # three's hemisphere light: sky colour from above, ground colour from below
		var c := Color.html(h["sky"]).lerp(Color.html(h["ground"]), 0.4)
		amb += c * float(h["intensity"])
		amb_e += float(h["intensity"])
	for a in L.get("ambient", []):
		amb += Color.html(a["colour"]) * float(a["intensity"])
		amb_e += float(a["intensity"])
	if amb_e > 0.0:
		env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
		env.ambient_light_color = (amb / amb_e).linear_to_srgb()
		env.ambient_light_energy = amb_e
	out["ambient"] = env.ambient_light_energy
	var dl: Array = L.get("directional", [])
	for i in dl.size():
		var d: Dictionary = dl[i]
		var l: DirectionalLight3D = sun if i == 0 else DirectionalLight3D.new()
		var dir := Vector3(float(d["dir"][0]), float(d["dir"][1]), float(d["dir"][2])).normalized()
		if i > 0:
			l.name = "Fill%d" % i
			parent.add_child(l)
		l.look_at_from_position(Vector3.ZERO, dir, Vector3.UP if abs(dir.y) < 0.99 else Vector3.FORWARD)
		l.light_color = _srgb(d["colour"])
		l.light_energy = float(d["intensity"])   # three's legacy lights and Godot's energy both light an albedo fully at 1
		l.shadow_enabled = bool(d.get("shadow", false)) if i > 0 else true   # the spike keeps the sun's shadows for depth
	out["sun"] = sun.light_energy
	var f = st.get("fog")
	if f is Dictionary:
		env.fog_enabled = true
		env.fog_light_color = _srgb(f["colour"])
		env.fog_sky_affect = 0.0          # the panorama already holds the page's hazed horizon
		env.fog_aerial_perspective = 0.0
		if f["type"] == "exp2":           # three: 1 - exp(-(d z)^2); Godot: 1 - exp(-g z). Equal at 50 %: g = 0.8326 d
			env.fog_mode = Environment.FOG_MODE_EXPONENTIAL
			env.fog_density = 0.8326 * float(f["density"])
		else:
			env.fog_mode = Environment.FOG_MODE_DEPTH
			env.fog_depth_begin = float(f["near"])
			env.fog_depth_end = float(f["far"])
			env.fog_density = 1.0
	else:
		env.fog_enabled = false
	out["fog_density"] = env.fog_density
	out["fog_colour"] = env.fog_light_color
	out["report"]["lights"] = "%d directional, %d hemisphere, %d ambient, %d point lights (points not carried)" % [dl.size(),
		L.get("hemisphere", []).size(), L.get("ambient", []).size(), int(L.get("points", 0))]
	return out
