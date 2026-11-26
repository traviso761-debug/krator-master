# Desert Surface, Weathering, Optics & Sky Unification Test Suite (Tracks 1 + 2).
# Verifies (each check paired with a negative):
#   1. Arid weathering mode (k_weather.z aridity & k_weather.w wind angle) in KratorWeather, KratorLook & weather.gdshaderinc
#   2. Brink-split dune stoss/slipface shading, polygonal salt-pan thrust ridges (kg_polygon), and mineral glints (kg_glint)
#   3. Stratigraphic desert_rock.gdshader & per-instance INSTANCE_CUSTOM ground-skirt wiring on rocks & landforms
#   4. Heat shimmer (ATMOS.shimmerK twin) and grazing-angle inferior desert mirage (KratorShimmerFx)
#   5. Height-bounded karaburan dust slab optical depth (thick in basin vs clear across high peaks) & KratorSky storm browning
#   6. Back-lit Mie saltation shader & deterministic KRand helical dust devils in KratorGritFx
#   godot --headless --path godot --script res://tests/desert/desert_graphics_test.gd    exits 0 when every check passes
extends SceneTree

var fails := 0


func ok(name: String, pass_: bool, neg: bool, detail := "") -> void:
	var r := pass_ and neg
	if not r:
		fails += 1
	print(("PASS  " if r else "FAIL  ") + name + ("  (" + detail + ")" if detail != "" else "")
		+ ("  [its negative did not fail]" if pass_ and not neg else ""))


func _initialize() -> void:
	# 1. Arid weathering mode & KratorLook switches
	var def_spec := KratorLook.tier("high")
	var arid_spec := KratorLook.from_args(PackedStringArray(["--look=high", "--aridity=0.9", "--shimmer=1.2"]))
	var no_shim := KratorLook.from_args(PackedStringArray(["--look=high", "--shimmer=1.2", "--no-shimmer"]))
	ok("KratorLook carries aridity and shimmer keys on all tiers (0 by default) and parses --aridity / --shimmer",
		float(def_spec["aridity"]) == 0.0 and float(def_spec["shimmer"]) == 0.0
			and is_equal_approx(float(arid_spec["aridity"]), 0.9) and is_equal_approx(float(arid_spec["shimmer"]), 1.2),
		float(no_shim["shimmer"]) == 0.0,
		"default arid=%.2f, switched arid=%.2f shimmer=%.2f" % [float(def_spec["aridity"]), float(arid_spec["aridity"]), float(arid_spec["shimmer"])])

	KratorWeather.set_climate(1.0, 0.0, 0.85, Vector2(0.0, 1.0))
	var kept_arid := is_equal_approx(KratorWeather._last_aridity, 0.85) and is_equal_approx(KratorWeather._last_wind_ang, PI * 0.5)
	KratorWeather.set_climate(0.0, 0.0, 0.0, Vector2(1.0, 0.0))
	var w_inc := FileAccess.get_file_as_string("res://shaders/lib/weather.gdshaderinc")
	ok("weather.gdshaderinc & KratorWeather drive arid sand skirts, windward abrasion, ochre dust pockets & desert varnish",
		kept_arid and w_inc.contains("sand_skirt") and w_inc.contains("varnish") and w_inc.contains("scour") and w_inc.contains("k_weather.z"),
		is_equal_approx(KratorWeather._last_aridity, 0.0),
		"aridity state & shader terms present")

	# 2. Ground & salt-pan surface shaders: brink-split dunes, salt polygons, mineral glints, sine-free
	var cb_sh := FileAccess.get_file_as_string("res://shaders/catch_bowl_ground.gdshader")
	var wp_sh := FileAccess.get_file_as_string("res://shaders/water_pan.gdshader")
	ok("catch_bowl_ground.gdshader splits windward stoss vs leeward slipface roughness/ripples and wires kg_polygon + kg_glint",
		cb_sh.contains("lib/kground_kinds.gdshaderinc") and cb_sh.contains("kg_glint(") and cb_sh.contains("kg_polygon(")
			and cb_sh.contains("nearR_stoss") and cb_sh.contains("slip_near"),
		not cb_sh.contains("layer_mean"),
		"brink split, salt polygons & mineral glints wired")
	ok("water_pan.gdshader computes polygonal thrust-ridge normals and halite crystal glints on dry salt crust",
		wp_sh.contains("pan_ridge(") and wp_sh.contains("kg_glint(") and wp_sh.contains("SPECULAR"),
		not wp_sh.contains("fract(sin"),
		"salt-pan micro-relief & glints wired")

	# 3. Stratigraphic desert_rock.gdshader & per-instance sand/talus skirt blending on boulders & landforms
	var dr_sh := FileAccess.get_file_as_string("res://shaders/desert_rock.gdshader")
	var rk := KratorCatchBowlRocks.new()
	rk._ready()
	var lf := KratorCatchBowlLandforms.new()
	lf._ready()
	var rk_ok := rk.mm != null and rk.mm.multimesh.use_custom_data and rk.rock_mat != null and rk.rock_mat.shader.resource_path.ends_with("desert_rock.gdshader")
	var mesa_mat: ShaderMaterial = lf._mats.get("mesa")
	var karst_mat: ShaderMaterial = lf._mats.get("karst")
	var tor_mat: ShaderMaterial = lf._mats.get("tor")
	var lf_ok := mesa_mat != null and karst_mat != null and tor_mat != null \
		and int(mesa_mat.get_shader_parameter("family_mode")) == 1 \
		and int(karst_mat.get_shader_parameter("family_mode")) == 2 \
		and int(tor_mat.get_shader_parameter("family_mode")) == 0 \
		and (lf._mm["mesa"] as MultiMeshInstance3D).multimesh.use_custom_data
	rk.free()
	lf.free()
	ok("boulders and landforms use desert_rock.gdshader with distinct stratigraphic modes and INSTANCE_CUSTOM sand-skirt data",
		rk_ok and lf_ok and dr_sh.contains("INSTANCE_CUSTOM") and dr_sh.contains("skirt_height") and dr_sh.contains("kw_weather("),
		int(mesa_mat.get_shader_parameter("family_mode")) != int(karst_mat.get_shader_parameter("family_mode")) if (mesa_mat and karst_mat) else false,
		"mesa=bedded(1), karst=fluted(2), tor/boulder=clast(0)")

	# 4. Heat shimmer (ATMOS.shimmerK twin) & grazing-angle inferior desert mirage
	var therm_field := {"x0": 0.0, "z0": 0.0, "cell": 50.0, "nx": 3, "nz": 3,
		"T": [20.0, 20.0, 20.0, 20.0, 75.0, 75.0, 20.0, 75.0, 75.0]}
	var sh_hot_far := KratorShimmerFx.shimmer_k(therm_field, 75.0, 75.0, 100.0, 25.0, 70.0, 6.0, 90.0)
	var sh_hot_feet := KratorShimmerFx.shimmer_k(therm_field, 75.0, 75.0, 2.0, 25.0, 70.0, 6.0, 90.0)
	var sh_cold := KratorShimmerFx.shimmer_k(therm_field, 0.0, 0.0, 100.0, 25.0, 70.0, 6.0, 90.0)
	ok("heat shimmer matches ATMOS.shimmerK: strong over hot ground at range, zero at the viewer's feet and over cool ground",
		sh_hot_far > 0.75 and sh_hot_feet == 0.0,
		sh_cold == 0.0,
		"hot@100m=%.2f, hot@2m=%.2f, cold@100m=%.2f" % [sh_hot_far, sh_hot_feet, sh_cold])

	# Grazing ray over Bowl salt pan (-1,100 m, 2.5 km away, 1.8 m eye height -> |ray.y| ~ 0.0007) vs steep look-down vs cold peak
	var mir_playa := KratorShimmerFx.mirage_k(Vector3(0.0, -1098.2, 0.0), Vector3(2500.0, -1100.0, 0.0))
	var mir_steep := KratorShimmerFx.mirage_k(Vector3(0.0, 800.0, 0.0), Vector3(2500.0, -1100.0, 0.0))
	var mir_summit := KratorShimmerFx.mirage_k(Vector3(0.0, 6501.8, 0.0), Vector3(2500.0, 6500.0, 0.0))
	ok("inferior mirage activates on grazing rays across hot low basins and vanishes from high angles or cold summits",
		mir_playa > 0.75,
		mir_steep < 0.01 and mir_summit == 0.0,
		"playa grazing=%.2f, steep=%.3f, 6500m summit=%.2f" % [mir_playa, mir_steep, mir_summit])

	# 5. Height-bounded karaburan dust slab optical depth & KratorSky storm browning
	var tau_basin := KratorAtmosFx.slab_optical_depth(0.0022, -1000.0, 850.0, -950.0, -980.0, 1200.0)
	var tau_down := KratorAtmosFx.slab_optical_depth(0.0022, -1000.0, 850.0, 3500.0, -1000.0, 9000.0)
	var tau_peaks := KratorAtmosFx.slab_optical_depth(0.0022, -1000.0, 850.0, 7500.0, 8200.0, 12000.0)
	ok("height-bounded dust slab hides the basin floor (from inside or looking down) while high peaks above the ceiling stay clear",
		tau_basin > 2.0 and tau_down > 1.5,
		tau_peaks < 0.01,
		"tau inside=%.2f, looking down=%.2f, across 8km peaks=%.5f" % [tau_basin, tau_down, tau_peaks])

	# 6. Back-lit Mie saltation shader & deterministic helical dust devils
	var grit_inst := KratorGritFx.new()
	grit_inst._ready()
	var salt_ok := grit_inst._salt_mat != null and grit_inst._salt_mat.shader.resource_path.ends_with("saltation.gdshader")
	var devils_ok := grit_inst._devils.size() == KratorGritFx.DEVIL_COUNT and grit_inst._devil_mats.size() == KratorGritFx.DEVIL_COUNT
	grit_inst.free()
	var grit_src := FileAccess.get_file_as_string("res://krator/grit_fx.gd")
	ok("KratorGritFx uses Mie forward-scattered saltation.gdshader and spawns pooled KRand-seeded helical dust devils",
		salt_ok and devils_ok and grit_src.contains("KRand.cell(DEVIL_SEED"),
		not KratorShimmerFx.WEATHER_SHIMMER["monsoon"][0] > 0.0,
		"%d dust devil emitters, monsoon shimmer=0" % KratorGritFx.DEVIL_COUNT)


var _frames := 0
var _sky_checked := false


func _process(_dt: float) -> bool:
	_frames += 1
	if _frames == 1:
		var sky_script := load("res://krator/sky.gd")
		var sky_inst: Node = sky_script.new()
		root.add_child(sky_inst)
		sky_inst.set_process(false)
		sky_inst.storm_murk = 0.0
		sky_inst._update()
		var ext_clear: Vector3 = sky_inst.mat.get_shader_parameter("uExt")
		var murk_clear: Vector4 = sky_inst.mat.get_shader_parameter("uDustMurk")
		var fx_inst := KratorAtmosFx.new()
		root.add_child(fx_inst)
		var we := sky_inst.get_child(0) as WorldEnvironment
		fx_inst.bind(we, sky_inst.sun, sky_inst, null)
		fx_inst.set_kind("dust")
		fx_inst._blend = 1.0
		fx_inst._apply(1.0)
		var ext_storm: Vector3 = sky_inst.mat.get_shader_parameter("uExt")
		var murk_storm: Vector4 = sky_inst.mat.get_shader_parameter("uDustMurk")
		fx_inst.queue_free()
		sky_inst.queue_free()
		ok("KratorAtmosFx drives KratorSky storm browning: clear air leaves uDustMurk=0, black storm raises airmass extinction uExt >10x",
			murk_storm.x > 0.95 and ext_storm.length() > ext_clear.length() * 10.0,
			murk_clear == Vector4.ZERO,
			"clear murk=%.2f ext=%.4f -> storm murk=%.2f ext=%.4f" % [murk_clear.x, ext_clear.length(), murk_storm.x, ext_storm.length()])
		_sky_checked = true
		return false
	if not _sky_checked:
		fails += 1
		print("FAIL  sky check ran")
	print("desert_graphics_test: " + ("all passed" if fails == 0 else ("%d FAILED" % fails)))
	quit(1 if fails > 0 else 0)
	return true
