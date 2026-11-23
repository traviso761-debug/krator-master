# THE LIGHT RIG, BY TIER (GODOT-LOOK-PLAN.md sections 5, 6 and 12: C2, C10, L1, L2, L5, L6, N1). One owner for what was
# set by hand in walk.gd, the route harness and the shot scripts: the sun's shadow (distance, splits, atlas, filter), the
# ambient terms (SSAO, SSIL, SDFGI), tone and glow, anti-aliasing and scale. A tier is a plain Dictionary; `apply` writes
# it to an Environment, the sun, a Viewport and the RenderingServer's quality switches, and returns what it set.
#   var spec := KratorLook.from_args(OS.get_cmdline_user_args())      # --look=low|high|photo|legacy and the switches below
#   var rep := KratorLook.apply(spec, env, sun, get_viewport())
# Tiers are the two GPU lanes: `low` is the integrated Arc 140T (the one to design for, GRAPHIC-LOAD.md), `high` the
# RTX 5060; `photo` is for stills and has no budget; `legacy` is the rig as walk.gd set it before (four splits spread over
# 2,400 m), kept so a before and after can be shot from one pose. `auto` picks low on an integrated or software adapter.
# What stays elsewhere: the colour script (krator/sky.gd) goes on driving the sun's colour and energy, the fog's colour
# and density and the exposure by the hour; the indoor mask and the lamp pool are krator/kinteriors_light.gd's.
# Every feature has a switch, as VISUAL-BAR.md asks of any fix:
#   --no-ssao --no-ssil --gi --no-gi --no-glow --pcss --no-pcss --vfog --no-vfog --aerial=<0..1> --no-deband
#   --shadow=<metres> --atlas=<px> --msaa=0|2|4|8 --aa=none|fxaa|smaa|taa|fsr2 --scale=<0.25..2> --fsr1 --aniso=<1..16>
#   --cells --no-cells --cull-px=<pixels> --casters=all --casters=outdoor --sky-half --no-sky-half --occlusion --no-occlusion
#   --no-weather --weather=<0..1.5> --wet=<0..1> --no-detail --detail=<0..1.5> --tangents --no-tangents
#   --room-ambient --no-room-ambient --auto-exposure
# Volumetric fog and aerial perspective belong to the plan's step 6: the tiers carry their values, off until then.
# Values are starting points to tune on the lanes (the plan's section 12 caps are what they are held to).
class_name KratorLook
extends RefCounted

const TIER_NAMES := ["low", "high", "photo", "legacy"]

# the tier tables. Keys: shadow_* (the sun), ssao*, ssil*, sdfgi*, glow*, vfog*, aerial, tonemap, agx_*, deband, msaa (samples),
# aa ("none", "fxaa", "smaa", "taa", "fsr2"), scale and upscale ("bilinear", "fsr1"), aniso (taps), lod_px (mesh LOD threshold),
# cells and cull_px (krator/cells.gd: a place's items cut into cells, and the size in pixels an item with no range is culled at).
# weather: the weathering stack's strength on library surfaces, 0 is off (krator/kweather.gd, shaders/lib/weather.gdshaderinc);
# wet: how wet the world is, 0..1.
# detail: the strength of the detail normals under six metres, 0 is off; tangents: a normal map on the mesh's own tangent
# frame where the mesh has one (krator/kdetail.gd, shaders/lib/detail.gdshaderinc).
# room_ambient: indoor surfaces take the room's light as their own ambient, not as emission (L4; kinteriors_light.gd).
# auto_exposure: the engine's eye adaptation on the camera, held to a stop either way of the colour script's exposure
# (L5; off in every tier until it is judged on a GPU: `apply_camera`, --auto-exposure).
# occlusion: Godot's occlusion culling on the viewport, against the occluders the stream then makes under each ground
# (krator/occluders.gd). On in low and high: at Longsong's avenue it takes the frame from 37.0 M primitives to 30.4 M
# and from 5,605 draws to 3,319, the picture equal to the bit (2026-11-23). It starts a few frames after a place opens, when the occluder scene has
# committed, so a count taken at once does not show it. Off for stills, where a late pop would show; --no-occlusion.
# sky_half: the sky's cloud layers in its half-resolution pass (shaders/sky_half.gdshader; `apply_sky`).
# shadow_casters: the layers that cast the sun's shadow: all of them in every tier. --casters=outdoor leaves the indoor
# layer out (an interior's shells and furniture, krator/kinteriors_light.gd), which the sun does not light; it is not a
# default because it changes the picture: the open galleries beside Longsong's avenue are indoor shells, and their
# shadow on the verge went with them (1,509 pixels of a 1280 by 720 frame, 2026-11-23). Furniture alone could be left
# out with a layer of its own
const TIERS := {
	"low": {
		"shadow_max": 250.0, "shadow_splits": [0.06, 0.18, 0.45], "shadow_blend": false, "shadow_fade": 0.8,
		"shadow_atlas": 4096, "shadow_filter": RenderingServer.SHADOW_QUALITY_SOFT_LOW, "shadow_angular": 0.0, "shadow_casters": 0xFFFFFFFF,
		"ssao": true, "ssao_quality": RenderingServer.ENV_SSAO_QUALITY_LOW, "ssao_half": true, "ssao_radius": 1.0, "ssao_intensity": 2.0, "ssao_power": 1.5,
		"ssil": false, "ssil_quality": RenderingServer.ENV_SSIL_QUALITY_LOW,
		"sdfgi": false, "sdfgi_cascades": 4, "sdfgi_min_cell": 0.4, "sdfgi_half": true,
		"glow": false, "glow_intensity": 0.3, "glow_bloom": 0.04, "glow_threshold": 1.1,
		"vfog": false, "vfog_density": 0.0006, "vfog_length": 200.0, "vfog_anisotropy": 0.7, "vfog_sun_energy": 1.0, "vfog_volume": 48, "aerial": 0.0,
		"tonemap": Environment.TONE_MAPPER_AGX, "agx_contrast": 1.25, "agx_white": 16.29, "deband": true, "sky_half": true,
		"msaa": 2, "aa": "none", "scale": 0.77, "upscale": "fsr1", "aniso": 8, "lod_px": 2.0, "weather": 1.0, "wet": 0.0, "detail": 0.5, "tangents": true, "room_ambient": true, "auto_exposure": false, "occlusion": true, "cells": true, "cull_px": 6.0,
	},
	"high": {
		"shadow_max": 400.0, "shadow_splits": [0.05, 0.15, 0.40], "shadow_blend": true, "shadow_fade": 0.85,
		"shadow_atlas": 8192, "shadow_filter": RenderingServer.SHADOW_QUALITY_SOFT_MEDIUM, "shadow_angular": 0.0, "shadow_casters": 0xFFFFFFFF,
		"ssao": true, "ssao_quality": RenderingServer.ENV_SSAO_QUALITY_MEDIUM, "ssao_half": true, "ssao_radius": 1.0, "ssao_intensity": 2.0, "ssao_power": 1.5,
		"ssil": true, "ssil_quality": RenderingServer.ENV_SSIL_QUALITY_MEDIUM,
		"sdfgi": false, "sdfgi_cascades": 4, "sdfgi_min_cell": 0.4, "sdfgi_half": true,
		"glow": true, "glow_intensity": 0.35, "glow_bloom": 0.05, "glow_threshold": 1.1,
		"vfog": false, "vfog_density": 0.0006, "vfog_length": 300.0, "vfog_anisotropy": 0.75, "vfog_sun_energy": 1.0, "vfog_volume": 64, "aerial": 0.0,
		"tonemap": Environment.TONE_MAPPER_AGX, "agx_contrast": 1.25, "agx_white": 16.29, "deband": true, "sky_half": false,
		"msaa": 4, "aa": "none", "scale": 1.0, "upscale": "bilinear", "aniso": 16, "lod_px": 1.0, "weather": 1.0, "wet": 0.0, "detail": 0.6, "tangents": true, "room_ambient": true, "auto_exposure": false, "occlusion": true, "cells": true, "cull_px": 4.0,
	},
	"photo": {
		"shadow_max": 500.0, "shadow_splits": [0.04, 0.12, 0.36], "shadow_blend": true, "shadow_fade": 0.9,
		"shadow_atlas": 8192, "shadow_filter": RenderingServer.SHADOW_QUALITY_SOFT_HIGH, "shadow_angular": 0.5, "shadow_casters": 0xFFFFFFFF,
		"ssao": true, "ssao_quality": RenderingServer.ENV_SSAO_QUALITY_HIGH, "ssao_half": false, "ssao_radius": 1.0, "ssao_intensity": 2.0, "ssao_power": 1.5,
		"ssil": true, "ssil_quality": RenderingServer.ENV_SSIL_QUALITY_HIGH,
		"sdfgi": true, "sdfgi_cascades": 6, "sdfgi_min_cell": 0.4, "sdfgi_half": false,
		"glow": true, "glow_intensity": 0.35, "glow_bloom": 0.05, "glow_threshold": 1.1,
		"vfog": true, "vfog_density": 0.0006, "vfog_length": 300.0, "vfog_anisotropy": 0.75, "vfog_sun_energy": 1.0, "vfog_volume": 96, "aerial": 0.45,
		"tonemap": Environment.TONE_MAPPER_AGX, "agx_contrast": 1.25, "agx_white": 16.29, "deband": true, "sky_half": false,
		"msaa": 4, "aa": "smaa", "scale": 1.0, "upscale": "bilinear", "aniso": 16, "lod_px": 0.5, "weather": 1.0, "wet": 0.0, "detail": 0.7, "tangents": true, "room_ambient": true, "auto_exposure": false, "occlusion": false, "cells": true, "cull_px": 2.0,
	},
	# the rig as walk.gd and the route harness set it until 2026-11-23 (GODOT-LOOK-PLAN.md 3.2): the project's 4x MSAA
	"legacy": {
		"shadow_max": 2400.0, "shadow_splits": [0.1, 0.2, 0.5], "shadow_blend": true, "shadow_fade": 0.8,
		"shadow_atlas": 4096, "shadow_filter": RenderingServer.SHADOW_QUALITY_SOFT_LOW, "shadow_angular": 0.0, "shadow_casters": 0xFFFFFFFF,
		"ssao": true, "ssao_quality": RenderingServer.ENV_SSAO_QUALITY_MEDIUM, "ssao_half": true, "ssao_radius": 1.4, "ssao_intensity": 1.55, "ssao_power": 1.5,
		"ssil": false, "ssil_quality": RenderingServer.ENV_SSIL_QUALITY_MEDIUM,
		"sdfgi": false, "sdfgi_cascades": 4, "sdfgi_min_cell": 0.2, "sdfgi_half": false,
		"glow": false, "glow_intensity": 0.3, "glow_bloom": 0.0, "glow_threshold": 1.0,
		"vfog": false, "vfog_density": 0.0, "vfog_length": 64.0, "vfog_anisotropy": 0.2, "vfog_sun_energy": 1.0, "vfog_volume": 64, "aerial": 0.0,
		"tonemap": Environment.TONE_MAPPER_AGX, "agx_contrast": 1.25, "agx_white": 16.29, "deband": false, "sky_half": false,
		"msaa": 4, "aa": "none", "scale": 1.0, "upscale": "bilinear", "aniso": 4, "lod_px": 1.0, "weather": 0.0, "wet": 0.0, "detail": 0.0, "tangents": false, "room_ambient": false, "auto_exposure": false, "occlusion": false, "cells": false, "cull_px": 4.0,
	},
}

# the caps the route is held to (GODOT-LOOK-PLAN.md section 12): primitives a frame over every pass, the frame in ms
const CAPS := {
	"low": {"prims": 10_000_000, "frame_ms": 33.3},
	"high": {"prims": 20_000_000, "frame_ms": 16.7},
	"photo": {"prims": 0, "frame_ms": 0.0},
	"legacy": {"prims": 0, "frame_ms": 0.0},
}


# a tier's spec: its own copy, with "tier" naming it. An unknown name is the high tier, and says so in "warning"
static func tier(name: String) -> Dictionary:
	var n := name if TIERS.has(name) else "high"
	var s: Dictionary = (TIERS[n] as Dictionary).duplicate(true)
	s["tier"] = n
	if n != name:
		s["warning"] = "no tier '%s': took high" % name
	return s


# low on an integrated or software adapter (and wherever the adapter is unknown, the headless dummy among them), high on a discrete one
static func auto_tier() -> String:
	var t := RenderingServer.get_video_adapter_type()
	return "high" if t == RenderingDevice.DEVICE_TYPE_DISCRETE_GPU else "low"


# a spec from a command line's user arguments: --look=<tier|auto> first, then each switch on top of it
static func from_args(args: PackedStringArray, default_tier := "auto") -> Dictionary:
	var name := default_tier
	for a in args:
		if a.begins_with("--look="):
			name = a.trim_prefix("--look=")
	if name == "auto":
		name = auto_tier()
	var s := tier(name)
	for a in args:
		if a == "--no-ssao":
			s["ssao"] = false
		elif a == "--no-ssil":
			s["ssil"] = false
		elif a == "--ssil":
			s["ssil"] = true
		elif a == "--gi":
			s["sdfgi"] = true
		elif a == "--no-gi":
			s["sdfgi"] = false
		elif a == "--glow":
			s["glow"] = true
		elif a == "--no-glow":
			s["glow"] = false
		elif a == "--pcss":
			s["shadow_angular"] = 0.5
		elif a == "--no-pcss":
			s["shadow_angular"] = 0.0
		elif a == "--vfog":
			s["vfog"] = true
		elif a == "--no-vfog":
			s["vfog"] = false
		elif a == "--no-deband":
			s["deband"] = false
		elif a == "--fsr1":
			s["upscale"] = "fsr1"
		elif a.begins_with("--aerial="):
			s["aerial"] = clampf(float(a.trim_prefix("--aerial=")), 0.0, 1.0)
		elif a.begins_with("--shadow="):
			s["shadow_max"] = maxf(10.0, float(a.trim_prefix("--shadow=")))
		elif a.begins_with("--atlas="):
			s["shadow_atlas"] = clampi(int(a.trim_prefix("--atlas=")), 1024, 16384)
		elif a.begins_with("--msaa="):
			s["msaa"] = int(a.trim_prefix("--msaa="))
		elif a.begins_with("--aa="):
			s["aa"] = a.trim_prefix("--aa=")
		elif a.begins_with("--scale="):
			s["scale"] = clampf(float(a.trim_prefix("--scale=")), 0.25, 2.0)
		elif a.begins_with("--aniso="):
			s["aniso"] = int(a.trim_prefix("--aniso="))
		elif a == "--no-cells":
			s["cells"] = false
		elif a == "--no-weather":
			s["weather"] = 0.0
		elif a.begins_with("--weather="):
			s["weather"] = clampf(float(a.trim_prefix("--weather=")), 0.0, 1.5)
		elif a.begins_with("--wet="):
			s["wet"] = clampf(float(a.trim_prefix("--wet=")), 0.0, 1.0)
		elif a == "--no-detail":
			s["detail"] = 0.0
		elif a.begins_with("--detail="):
			s["detail"] = clampf(float(a.trim_prefix("--detail=")), 0.0, 1.5)
		elif a == "--tangents":
			s["tangents"] = true
		elif a == "--no-tangents":
			s["tangents"] = false
		elif a == "--room-ambient":
			s["room_ambient"] = true
		elif a == "--no-room-ambient":
			s["room_ambient"] = false
		elif a == "--auto-exposure":
			s["auto_exposure"] = true
		elif a == "--occlusion":
			s["occlusion"] = true
		elif a == "--no-occlusion":
			s["occlusion"] = false
		elif a == "--sky-half":
			s["sky_half"] = true
		elif a == "--no-sky-half":
			s["sky_half"] = false
		elif a == "--casters=all":
			s["shadow_casters"] = 0xFFFFFFFF
		elif a == "--casters=outdoor":
			s["shadow_casters"] = 1
		elif a == "--cells":
			s["cells"] = true
		elif a.begins_with("--cull-px="):
			s["cull_px"] = clampf(float(a.trim_prefix("--cull-px=")), 0.25, 32.0)
	return s


# the stream's side of a spec: whether a place's items are cut into cells, and at what size an item is culled
# the camera's side (L5): eye adaptation, a stop either way of what the colour script set (krator/sky.gd drives
# Environment.tonemap_exposure by the hour; this moves on top of it). Forward+ and Mobile only. Off, the camera is left alone
static func apply_camera(spec: Dictionary, cam: Camera3D) -> void:
	if cam == null or not bool(spec.get("auto_exposure", false)):
		return
	var ca := cam.attributes as CameraAttributesPractical
	if ca == null:
		ca = CameraAttributesPractical.new()
		cam.attributes = ca
	ca.auto_exposure_enabled = true
	ca.auto_exposure_scale = 0.4
	ca.auto_exposure_speed = 0.6
	ca.auto_exposure_min_sensitivity = 50.0     # ISO 100 is no change: one stop down
	ca.auto_exposure_max_sensitivity = 200.0    # and one stop up


# the sky's side (krator/sky.gd): its cloud layers at half resolution or full
static func apply_sky(spec: Dictionary, sky: Node) -> void:
	if sky != null and "half_res_clouds" in sky:
		sky.half_res_clouds = bool(spec.get("sky_half", false))


static func apply_stream(spec: Dictionary, stream: KratorWorldStream) -> void:
	if stream == null:
		return
	stream.cells = bool(spec.get("cells", true)) and OS.get_environment("KRATOR_CELLS") != "0"
	stream.cells_px = float(spec.get("cull_px", 4.0))
	stream.room_ambient = bool(spec.get("room_ambient", false))
	stream.occluders = bool(spec.get("occlusion", false)) and OS.get_environment("KRATOR_OCCLUDERS") != "0"


static func _msaa(samples: int) -> int:
	if samples >= 8:
		return Viewport.MSAA_8X
	if samples >= 4:
		return Viewport.MSAA_4X
	if samples >= 2:
		return Viewport.MSAA_2X
	return Viewport.MSAA_DISABLED


static func _aniso(taps: int) -> int:
	if taps >= 16:
		return Viewport.ANISOTROPY_16X
	if taps >= 8:
		return Viewport.ANISOTROPY_8X
	if taps >= 4:
		return Viewport.ANISOTROPY_4X
	if taps >= 2:
		return Viewport.ANISOTROPY_2X
	return Viewport.ANISOTROPY_DISABLED


# The sun's shadow texel in each split, metres, for a camera of vertical field `fov_deg` and `aspect`: each split's slice
# of the view is fitted in a square the size of its bounding sphere (the engine keeps shadows stable that way), and four
# splits share the atlas as halves. The bar's near-shadow row reads the first number (3 cm or under within 15 m).
static func shadow_texels(spec: Dictionary, fov_deg := 58.0, aspect := 16.0 / 9.0, near := 0.3) -> Array:
	var D := float(spec["shadow_max"])
	var sp: Array = spec["shadow_splits"]
	var edges := [near, D * float(sp[0]), D * float(sp[1]), D * float(sp[2]), D]
	var th := tan(deg_to_rad(fov_deg) * 0.5)
	var per_split := float(spec["shadow_atlas"]) * 0.5
	var out := []
	for i in 4:
		var n := float(edges[i])
		var f := float(edges[i + 1])
		var h := f * th
		var w := h * aspect
		var half := (f - n) * 0.5
		var radius := sqrt(w * w + h * h + half * half)
		out.append(2.0 * radius / per_split)
	return out


# Write a spec to the scene. env and sun come from krator/sky.gd (or any rig); vp is the viewport that draws the world.
# Returns {tier, set: {property: value}, texels: [m a split], warning?}. Safe headless: the server calls do nothing there.
static func apply(spec: Dictionary, env: Environment, sun: DirectionalLight3D, vp: Viewport) -> Dictionary:
	var rep := {"tier": str(spec.get("tier", "?")), "set": {}, "texels": shadow_texels(spec)}
	if spec.has("warning"):
		rep["warning"] = spec["warning"]
	var S: Dictionary = rep["set"]
	if sun != null:
		var sp: Array = spec["shadow_splits"]
		sun.shadow_enabled = true
		sun.directional_shadow_mode = DirectionalLight3D.SHADOW_PARALLEL_4_SPLITS
		sun.directional_shadow_max_distance = float(spec["shadow_max"])
		sun.directional_shadow_split_1 = float(sp[0])
		sun.directional_shadow_split_2 = float(sp[1])
		sun.directional_shadow_split_3 = float(sp[2])
		sun.directional_shadow_blend_splits = bool(spec["shadow_blend"])
		sun.directional_shadow_fade_start = float(spec["shadow_fade"])
		sun.light_angular_distance = float(spec["shadow_angular"])
		sun.shadow_caster_mask = int(spec["shadow_casters"])
		sun.light_volumetric_fog_energy = float(spec["vfog_sun_energy"])
		S["sun.directional_shadow_max_distance"] = sun.directional_shadow_max_distance
		S["sun.light_angular_distance"] = sun.light_angular_distance
	KratorWeather.apply(spec)
	KratorDetail.apply(spec)
	S["k_weather"] = float(spec.get("weather", 0.0))
	RenderingServer.directional_shadow_atlas_set_size(int(spec["shadow_atlas"]), true)
	RenderingServer.directional_soft_shadow_filter_set_quality(int(spec["shadow_filter"]))
	S["shadow_atlas"] = int(spec["shadow_atlas"])
	if env != null:
		env.tonemap_mode = int(spec["tonemap"])
		env.tonemap_agx_contrast = float(spec["agx_contrast"])
		env.tonemap_agx_white = float(spec["agx_white"])
		env.ssao_enabled = bool(spec["ssao"])
		env.ssao_radius = float(spec["ssao_radius"])
		env.ssao_intensity = float(spec["ssao_intensity"])
		env.ssao_power = float(spec["ssao_power"])
		env.ssil_enabled = bool(spec["ssil"])
		env.sdfgi_enabled = bool(spec["sdfgi"])
		if env.sdfgi_enabled:
			env.sdfgi_cascades = int(spec["sdfgi_cascades"])
			env.sdfgi_min_cell_size = float(spec["sdfgi_min_cell"])
			env.sdfgi_use_occlusion = true
			env.sdfgi_read_sky_light = true
			env.sdfgi_y_scale = Environment.SDFGI_Y_SCALE_75_PERCENT
			env.sdfgi_bounce_feedback = 0.5
		env.glow_enabled = bool(spec["glow"])
		if env.glow_enabled:
			env.glow_intensity = float(spec["glow_intensity"])
			env.glow_bloom = float(spec["glow_bloom"])
			env.glow_hdr_threshold = float(spec["glow_threshold"])
			env.glow_blend_mode = Environment.GLOW_BLEND_MODE_SCREEN
		env.volumetric_fog_enabled = bool(spec["vfog"])
		if env.volumetric_fog_enabled:
			env.volumetric_fog_density = float(spec["vfog_density"])
			env.volumetric_fog_length = float(spec["vfog_length"])
			env.volumetric_fog_anisotropy = float(spec["vfog_anisotropy"])
			env.volumetric_fog_ambient_inject = 0.5
			# SDFGI lights the fog as well: at the default inject of 1 the air washed the frame out (the plan's appendix A)
			env.volumetric_fog_gi_inject = 0.3 if env.sdfgi_enabled else 1.0
		env.fog_aerial_perspective = float(spec["aerial"])
		for k in ["ssao_enabled", "ssil_enabled", "sdfgi_enabled", "glow_enabled", "volumetric_fog_enabled", "tonemap_mode", "fog_aerial_perspective"]:
			S["env." + k] = env.get(k)
	RenderingServer.environment_set_ssao_quality(int(spec["ssao_quality"]), bool(spec["ssao_half"]), 0.5, 2, 50.0, 300.0)
	RenderingServer.environment_set_ssil_quality(int(spec["ssil_quality"]), true, 0.5, 4, 50.0, 300.0)
	RenderingServer.gi_set_use_half_resolution(bool(spec["sdfgi_half"]))
	RenderingServer.environment_set_sdfgi_frames_to_update_light(RenderingServer.ENV_SDFGI_UPDATE_LIGHT_IN_16_FRAMES)
	var vv := int(spec["vfog_volume"])
	RenderingServer.environment_set_volumetric_fog_volume_size(vv, vv)
	RenderingServer.environment_set_volumetric_fog_filter_active(true)
	if vp != null:
		vp.msaa_3d = _msaa(int(spec["msaa"]))
		var aa := str(spec["aa"])
		vp.screen_space_aa = Viewport.SCREEN_SPACE_AA_SMAA if aa == "smaa" else (Viewport.SCREEN_SPACE_AA_FXAA if aa == "fxaa" else Viewport.SCREEN_SPACE_AA_DISABLED)
		vp.use_taa = aa == "taa"
		if aa == "fsr2":
			vp.scaling_3d_mode = Viewport.SCALING_3D_MODE_FSR2
		elif str(spec["upscale"]) == "fsr1":
			vp.scaling_3d_mode = Viewport.SCALING_3D_MODE_FSR
		else:
			vp.scaling_3d_mode = Viewport.SCALING_3D_MODE_BILINEAR
		vp.scaling_3d_scale = float(spec["scale"])
		vp.use_debanding = bool(spec["deband"])
		vp.anisotropic_filtering_level = _aniso(int(spec["aniso"]))
		vp.mesh_lod_threshold = float(spec["lod_px"])
		vp.use_occlusion_culling = bool(spec["occlusion"])
		S["vp.use_occlusion_culling"] = vp.use_occlusion_culling
		S["vp.msaa_3d"] = vp.msaa_3d
		S["vp.scaling_3d_scale"] = vp.scaling_3d_scale
		S["vp.scaling_3d_mode"] = vp.scaling_3d_mode
		S["vp.screen_space_aa"] = vp.screen_space_aa
		S["vp.use_taa"] = vp.use_taa
	return rep


# one line for a log or a HUD
static func describe(spec: Dictionary) -> String:
	var tx := shadow_texels(spec)
	return "look %s: shadow %d m on %d (texel %.1f cm), msaa %dx, aa %s, scale %.2f, ssao %s, ssil %s, gi %s, glow %s, vfog %s; cells %s, occlusion %s, weather %.1f, detail %.1f, tangents %s" % [
		str(spec.get("tier", "?")), int(spec["shadow_max"]), int(spec["shadow_atlas"]), float(tx[0]) * 100.0, int(spec["msaa"]), str(spec["aa"]),
		float(spec["scale"]), _on(spec["ssao"]), _on(spec["ssil"]), _on(spec["sdfgi"]), _on(spec["glow"]), _on(spec["vfog"]),
		_on(spec.get("cells", false)), _on(spec.get("occlusion", false)), float(spec.get("weather", 0.0)), float(spec.get("detail", 0.0)), _on(spec.get("tangents", false))]


static func _on(v) -> String:
	return "on" if bool(v) else "off"
