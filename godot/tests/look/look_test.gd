# The light rig by tier (krator/look.gd; GODOT-LOOK-PLAN.md sections 5, 6 and 12). Headless: the tables, the switches,
# what `apply` writes to an Environment, a sun and a Viewport, and the sun's shadow texels each tier gives. Each check has
# a negative.
#   godot --headless --path godot --script res://tests/look/look_test.gd     exits 0 when every check passes
extends SceneTree

var fails := 0


class StubSky extends Node:
	var half_res_clouds := false


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


func _initialize() -> void:
	# 1. the tiers: every one carries every key the high tier does
	var keys: Array = (KratorLook.TIERS["high"] as Dictionary).keys()
	var missing := []
	for t in KratorLook.TIER_NAMES:
		for k in keys:
			if not (KratorLook.TIERS[t] as Dictionary).has(k):
				missing.append("%s.%s" % [t, k])
	ok(missing.is_empty() and KratorLook.TIERS.size() == KratorLook.TIER_NAMES.size(), "four tiers, each with the %d keys (%s)" % [keys.size(), ", ".join(PackedStringArray(missing))])
	var odd := KratorLook.tier("ultra")
	ok(str(odd["tier"]) == "high" and odd.has("warning") and not KratorLook.tier("low").has("warning"), "an unknown tier is the high one, and says so")
	var copy := KratorLook.tier("high")
	copy["shadow_max"] = 1.0
	ok(float(KratorLook.TIERS["high"]["shadow_max"]) == 400.0, "a spec is its own copy: changing it leaves the table alone")

	# 2. the sun's shadow texels (the bar's near-shadow row: 3 cm or under in the first split)
	var hi := KratorLook.shadow_texels(KratorLook.tier("high"))
	var lo := KratorLook.shadow_texels(KratorLook.tier("low"))
	var old := KratorLook.shadow_texels(KratorLook.tier("legacy"))
	ok(float(hi[0]) <= 0.03 and float(lo[0]) <= 0.03, "the first split's texel is 3 cm or under on both lanes (high %.1f cm, low %.1f cm)" % [float(hi[0]) * 100.0, float(lo[0]) * 100.0])
	ok(float(old[0]) > 0.2 and float(old[3]) > 2.0, "negative: the rig as it was has a first texel of %.0f cm and a last of %.1f m" % [float(old[0]) * 100.0, float(old[3])])
	ok(hi[0] < hi[1] and hi[1] < hi[2] and hi[2] < hi[3], "texels grow with the splits (%.3f, %.3f, %.3f, %.3f m)" % [hi[0], hi[1], hi[2], hi[3]])
	var wide := KratorLook.tier("high")
	wide["shadow_atlas"] = 4096
	ok(absf(float(KratorLook.shadow_texels(wide)[0]) - 2.0 * float(hi[0])) < 1e-6, "half the atlas, twice the texel")

	# 3. the switches
	var s := KratorLook.from_args(PackedStringArray(["--look=low", "--gi", "--no-ssao", "--shadow=320", "--msaa=4", "--aa=smaa", "--scale=0.5", "--pcss", "--vfog", "--aerial=0.4"]))
	ok(str(s["tier"]) == "low" and bool(s["sdfgi"]) and not bool(s["ssao"]) and float(s["shadow_max"]) == 320.0 and int(s["msaa"]) == 4
		and str(s["aa"]) == "smaa" and float(s["scale"]) == 0.5 and float(s["shadow_angular"]) == 0.5 and bool(s["vfog"]) and float(s["aerial"]) == 0.4,
		"--look and ten switches land on the spec")
	var plain := KratorLook.from_args(PackedStringArray(["--look=high"]))
	ok(not bool(plain["sdfgi"]) and bool(plain["ssao"]) and float(plain["shadow_angular"]) == 0.0, "negative: without a switch the tier's own values stand")
	var au := KratorLook.from_args(PackedStringArray([]))
	ok(str(au["tier"]) in ["low", "high"] and str(au["tier"]) == KratorLook.auto_tier(), "no --look takes the adapter's tier (%s here)" % au["tier"])

	# 4. apply: the environment, the sun and the viewport take the spec
	var env := Environment.new()
	var sun := DirectionalLight3D.new()
	var rep := KratorLook.apply(KratorLook.tier("high"), env, sun, root)
	ok(sun.shadow_enabled and sun.directional_shadow_mode == DirectionalLight3D.SHADOW_PARALLEL_4_SPLITS and sun.directional_shadow_max_distance == 400.0
		and absf(sun.directional_shadow_split_1 - 0.05) < 1e-6 and sun.directional_shadow_blend_splits, "high: the sun's shadow covers 400 m in four blended splits from 0.05")
	ok(env.tonemap_mode == Environment.TONE_MAPPER_AGX and env.ssao_enabled and env.ssil_enabled and env.glow_enabled and not env.sdfgi_enabled
		and not env.volumetric_fog_enabled, "high: AgX, SSAO, SSIL and glow on; SDFGI and volumetric fog wait for their switches")
	ok(root.msaa_3d == Viewport.MSAA_4X and root.scaling_3d_scale == 1.0 and root.anisotropic_filtering_level == Viewport.ANISOTROPY_16X and root.use_debanding,
		"high: 4x MSAA at native scale, 16 taps, debanding")
	ok(root.use_occlusion_culling, "high: occlusion culling on, against the ground's occluders")
	ok(str(rep["tier"]) == "high" and (rep["texels"] as Array).size() == 4 and (rep["set"] as Dictionary).has("env.ssao_enabled"), "apply reports the tier, the texels and what it set")
	ok(sun.shadow_caster_mask == 0xFFFFFFFF, "high: every layer casts the sun's shadow (the indoor shells of an open gallery shade the ground outside it)")
	KratorLook.apply(KratorLook.tier("low"), env, sun, root)
	ok(sun.directional_shadow_max_distance == 250.0 and not sun.directional_shadow_blend_splits and not env.ssil_enabled and not env.glow_enabled
		and root.msaa_3d == Viewport.MSAA_2X and absf(root.scaling_3d_scale - 0.77) < 1e-6 and root.scaling_3d_mode == Viewport.SCALING_3D_MODE_FSR,
		"low: 250 m unblended, no SSIL or glow, 2x MSAA at 0.77 through FSR 1")
	var gi := KratorLook.tier("high")
	gi["sdfgi"] = true
	gi["vfog"] = true
	KratorLook.apply(gi, env, sun, root)
	ok(env.sdfgi_enabled and env.sdfgi_use_occlusion and env.sdfgi_y_scale == Environment.SDFGI_Y_SCALE_75_PERCENT and absf(env.volumetric_fog_gi_inject - 0.3) < 1e-6,
		"with SDFGI and the volumetric fog both on, the fog takes a third of the GI light (the plan's appendix A)")
	KratorLook.apply(KratorLook.tier("legacy"), env, sun, root)
	ok(sun.directional_shadow_max_distance == 2400.0 and absf(env.ssao_radius - 1.4) < 1e-6 and not env.glow_enabled and root.msaa_3d == Viewport.MSAA_4X,
		"negative: the legacy tier is the rig as it was (2,400 m, SSAO 1.4, no glow, 4x MSAA)")
	var st_occ := KratorWorldStream.new()
	KratorLook.apply_stream(KratorLook.tier("high"), st_occ)
	var stream_on := st_occ.occluders
	KratorLook.apply_stream(KratorLook.from_args(PackedStringArray(["--look=high", "--no-occlusion"])), st_occ)
	var stream_off := not st_occ.occluders
	st_occ.free()
	ok(not root.use_occlusion_culling and stream_on and stream_off and bool(KratorLook.from_args(PackedStringArray(["--look=legacy", "--occlusion"]))["occlusion"]),
		"negative: the legacy tier and --no-occlusion leave occlusion culling off, and the stream then makes no occluders")
	var out_cast := KratorLook.from_args(PackedStringArray(["--look=high", "--casters=outdoor"]))
	var all_cast := KratorLook.from_args(PackedStringArray(["--look=high", "--casters=outdoor", "--casters=all"]))
	KratorLook.apply(out_cast, env, sun, root)
	var only_outdoor := sun.shadow_caster_mask == 1
	KratorLook.apply(KratorLook.tier("legacy"), env, sun, root)
	ok(only_outdoor and sun.shadow_caster_mask == 0xFFFFFFFF and int(all_cast["shadow_casters"]) == 0xFFFFFFFF, "--casters=outdoor leaves the indoor layer out of the sun's shadow; --casters=all and every tier put it back")

	# 5. the stream's side: cells and the pixel size an item is culled at
	var st := KratorWorldStream.new()
	KratorLook.apply_stream(KratorLook.tier("low"), st)
	var low_px := st.cells_px
	KratorLook.apply_stream(KratorLook.from_args(PackedStringArray(["--look=high", "--cull-px=3"])), st)
	ok(low_px == 6.0 and st.cells_px == 3.0 and st.cells, "a tier sets the stream's cull size (low 6 px, high 4, a switch 3)")
	KratorLook.apply_stream(KratorLook.tier("legacy"), st)
	var legacy_cells := st.cells
	KratorLook.apply_stream(KratorLook.from_args(PackedStringArray(["--look=high", "--no-cells"])), st)
	ok(not legacy_cells and not st.cells, "negative: the legacy tier and --no-cells leave a place's items whole")
	KratorLook.apply_stream(KratorLook.from_args(PackedStringArray(["--look=legacy", "--cells"])), st)
	ok(st.cells, "--cells turns them on under a tier that has them off")
	st.free()


	# 5b. the camera's side: eye adaptation only when asked, held to a stop either way
	var cam_a := Camera3D.new()
	KratorLook.apply_camera(KratorLook.tier("high"), cam_a)
	var untouched := cam_a.attributes == null
	KratorLook.apply_camera(KratorLook.from_args(PackedStringArray(["--look=high", "--auto-exposure"])), cam_a)
	var ca := cam_a.attributes as CameraAttributesPractical
	ok(untouched and ca != null and ca.auto_exposure_enabled and ca.auto_exposure_min_sensitivity == 50.0 and ca.auto_exposure_max_sensitivity == 200.0,
		"no tier touches the camera; --auto-exposure gives it eye adaptation within one stop")
	cam_a.free()

	# 6. the sky's side: the cloud layers at half resolution on the low tier (shaders/sky_half.gdshader)
	var stub := StubSky.new()
	KratorLook.apply_sky(KratorLook.tier("low"), stub)
	var low_half := stub.half_res_clouds
	KratorLook.apply_sky(KratorLook.tier("high"), stub)
	var high_half := stub.half_res_clouds
	KratorLook.apply_sky(KratorLook.from_args(PackedStringArray(["--look=high", "--sky-half"])), stub)
	ok(low_half and not high_half and stub.half_res_clouds, "the low tier asks the sky for half-resolution clouds; the high one does not, unless --sky-half")
	KratorLook.apply_sky(KratorLook.tier("low"), null)
	KratorLook.apply_sky(KratorLook.tier("low"), sun)   # a node with no such switch is left alone
	stub.free()
	var half_code := FileAccess.get_file_as_string("res://shaders/sky_half.gdshader")
	var full_code := FileAccess.get_file_as_string("res://shaders/sky.gdshader")
	var inc := FileAccess.get_file_as_string("res://shaders/atmos_sky.gdshaderinc")
	ok(half_code.contains("render_mode use_half_res_pass;") and half_code.contains("AT_HALF_RES_PASS") and half_code.contains("atmSkyC(EYEDIR, HALF_RES_COLOR, true)")
		and half_code.contains("atmSkyClouds("), "sky_half.gdshader draws the clouds in the half-resolution pass and hands them to the composite")
	ok(inc.count("vec3 atmSkyC(vec3 d,vec4 atmClIn,bool atmClUse){") == 1 and inc.contains("vec3 atmSky(vec3 d){return atmSkyC(d,vec4(0.0),false);}") and inc.count("atmSkyClouds(d,air)") == 1
		and not full_code.contains("use_half_res_pass") and full_code.contains("atmSky(EYEDIR)"),
		"negative: there is one composite, atmSky is that composite with its own clouds, and sky.gdshader still draws all of it at full size")

	# 7. the caps and the one-line description
	ok(int(KratorLook.CAPS["low"]["prims"]) == 10_000_000 and int(KratorLook.CAPS["high"]["prims"]) == 20_000_000, "the primitive caps are the plan's (10 M and 20 M)")
	ok(KratorLook.describe(KratorLook.tier("high")).contains("shadow 400 m on 8192"), "describe names the tier's shadow: %s" % KratorLook.describe(KratorLook.tier("high")))
	sun.free()
	print("all passed" if fails == 0 else "%d FAILED" % fails)
	quit(1 if fails else 0)
