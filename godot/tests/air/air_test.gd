# The air (krator/kair.gd; GODOT-LOOK-PLAN.md section 7, F1 to F6). Headless: the keys by the sun and the weather, the
# floor mist lies on, the sources of mist, spray and steam read from a stream's water and vents, what update() sets, and
# the wiring. Each check has a negative. tests/shaders/cook_air_gpu_check.gd draws the mist and the wet ground on a GPU.
#   godot --headless --path godot --script res://tests/air/air_test.gd     exits 0 when every check passes
extends SceneTree

var fails := 0


func ok(c: bool, m: String) -> void:
	print(("ok   " if c else "FAIL ") + m)
	if not c:
		fails += 1


# a stream as the air reads one: ground height, origin, vents, open places and the water under them
class StubStream extends Node3D:
	var index := {"vents": [[1040.0, 3010.0, 300.0]], "roads": []}
	var origin := [1000.0, 2000.0, 3000.0]
	var places_open := {"p": true}
	var trees := 0.0
	func height_at(x: float, z: float) -> float:
		return 2050.0 + 0.1 * absf(x - 1000.0) if absf(x) < 50000.0 else NAN
	func local(x: float, y: float, z: float) -> Vector3:
		return Vector3(x - 1000.0, y - 2000.0, z - 3000.0)
	func flora_near(_c: Vector3) -> float:
		return trees


func _water(stream: Node3D) -> void:
	var w := Node3D.new()
	w.name = "Water"
	stream.add_child(w)
	var pond := MeshInstance3D.new()
	var pm := PlaneMesh.new()
	pm.size = Vector2(40, 24)
	pond.mesh = pm
	pond.position = Vector3(10, 55, 20)
	pond.set_meta("krator", {"kind": "still"})
	w.add_child(pond)
	var fall := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = Vector3(6, 20, 2)
	fall.mesh = bm
	fall.position = Vector3(-30, 60, 0)
	fall.set_meta("krator", {"kind": "fall"})
	w.add_child(fall)
	var flow := MeshInstance3D.new()
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for i in 120:   # a ribbon 600 m long, four vertices a row
		for k in 4:
			st.add_vertex(Vector3(float(i) * 5.0, 50.0, float(k)))
	flow.mesh = st.commit()
	flow.set_meta("krator", {"kind": "flow"})
	w.add_child(flow)
	var puddle := MeshInstance3D.new()
	var tiny := PlaneMesh.new()
	tiny.size = Vector2(2, 2)
	puddle.mesh = tiny
	puddle.set_meta("krator", {"kind": "still"})
	w.add_child(puddle)


func _initialize() -> void:
	var A := KratorAir
	var hi := KratorLook.tier("high")
	# 1. the keys
	var dawn := A.keys(6.0, 4.0, {}, hi)
	var noon := A.keys(50.0, 12.0, {}, hi)
	var dusk := A.keys(6.0, 20.5, {}, hi)
	var night := A.keys(-30.0, 23.0, {}, hi)
	ok(float(dawn["mist"]) > 0.8 and float(noon["mist"]) == 0.0 and float(dusk["mist"]) > 0.2 and float(dusk["mist"]) < float(dawn["mist"]) and float(night["mist"]) > 0.1 and float(night["mist"]) < float(dusk["mist"]),
		"mist is the dawn's (%.2f), less at dusk (%.2f), a little by night (%.2f), none at noon" % [dawn["mist"], dusk["mist"], night["mist"]])
	ok(float(noon["mist_density"]) == 0.0 and float(dawn["mist_density"]) > 0.003 and float(dawn["mist_scale"]) < float(noon["mist_scale"]), "its density at the floor follows, and the layer lies lower at dawn")
	ok(float(dawn["vfog_density"]) > 3.0 * float(noon["vfog_density"]) and float(noon["vfog_density"]) > 0.0 and float(dawn["vfog_sun"]) > float(noon["vfog_sun"]) and float(noon["vfog_sun"]) >= 2.0,
		"the volumetric fog is thin by day with a bright sun in it (shafts without a veil), denser at dawn")
	var foggy := A.keys(50.0, 12.0, {"fog": 1.0}, hi)
	var after := A.keys(50.0, 12.0, {"wet": 1.0}, hi)
	var raining := A.keys(50.0, 12.0, {"wet": 1.0, "rain": 1.0}, hi)
	ok(float(foggy["mist"]) > 0.8 and float(after["mist"]) > 0.2 and float(raining["mist"]) == 0.0 and float(raining["vfog_density"]) > float(noon["vfog_density"]),
		"the weather's fog brings mist at noon, a wet world after rain a little, and rain itself thickens the near air instead")
	var off := hi.duplicate()
	off["mist"] = 0.0
	ok(float(A.keys(6.0, 4.0, {}, off)["mist_density"]) == 0.0 and float(A.keys(6.0, 4.0, {}, KratorLook.tier("legacy"))["mist_density"]) == 0.0, "negative: with the look's mist at 0 there is none at any hour")
	var mono := true
	var last := 2.0
	for alt in [0.0, 4.0, 8.0, 12.0, 16.0, 20.0]:
		var m: float = A.keys(alt, 5.0, {}, hi)["mist"]
		mono = mono and m <= last + 1e-9
		last = m
	ok(mono and last == 0.0, "through a morning the mist only thins as the sun climbs, and is gone by 20 degrees")

	# 2. the floor
	var S := StubStream.new()
	root.add_child(S)
	ok(absf(A.floor_near(S, Vector3(1000.0, 0.0, 0.0)) - 2050.0) < 1e-3 and A.floor_near(S, Vector3(2000.0, 0.0, 0.0)) < S.height_at(2000.0, 0.0) - 60.0,
		"the floor is the lowest ground within 1,200 m: from a slope it is the valley below")
	ok(is_nan(A.floor_near(S, Vector3(9e6, 0.0, 0.0))), "negative: where the stream has no ground there is no floor")

	# 3. the sources
	_water(S)
	var src := A.sources_of(S)
	var kinds := {}
	for s in src:
		kinds[s["kind"]] = int(kinds.get(s["kind"], 0)) + 1
	ok(int(kinds.get("vent", 0)) == 1 and int(kinds.get("still", 0)) == 1 and int(kinds.get("fall", 0)) == 1 and int(kinds.get("stream", 0)) >= 7 and int(kinds.get("stream", 0)) <= 10,
		"a vent, a pond, a fall and a point every %d m along a 600 m stream are sources (%s)" % [int(A.STREAM_STEP), JSON.stringify(kinds)])
	var pond_at := Vector3.ZERO
	for s in src:
		if s["kind"] == "still":
			pond_at = s["at"]
	ok(pond_at.distance_to(Vector3(1010.0, 2055.0, 3020.0)) < 0.01, "a source stands in region metres: the node's place plus the stream's origin")
	ok(int(kinds.get("still", 0)) == 1, "negative: a pool under 3 m across is not one")
	var marked := Node3D.new()
	marked.set_meta("marks", [{"kind": "smoke", "at": [1005.0, 2062.0, 3010.0], "r": 0.3, "source": "chimney"}, {"kind": "sill", "at": [1005.0, 2058.0, 3010.0], "yaw": 0.0, "w": 0.8}])
	S.add_child(marked)
	var src2 := A.sources_of(S)
	var smokes := 0
	for s in src2:
		smokes += 1 if s["kind"] == "smoke" and (s["at"] as Vector3).distance_to(Vector3(1005.0, 2062.0, 3010.0)) < 0.01 else 0
	ok(smokes == 1 and src2.size() == src.size() + 1, "a chimney an export marks is a source of smoke; a sill is not")
	marked.free()

	# 4. update(): the environment, the mist pass, the pool
	var air := A.make(hi)
	root.add_child(air)
	var env := Environment.new()
	var sun := DirectionalLight3D.new()
	KratorLook.apply(hi, env, sun, root)
	env.fog_light_color = Color(0.5, 0.6, 0.7)
	var cam := Vector3(1010.0, 2057.0, 3020.0)
	air.update(env, sun, {"sunAlt": 6.0, "sunDir": Vector3(0.9, 0.1, 0.4).normalized()}, 4.0, {}, S, cam, 0.6)
	var mv: Vector4 = air.mist_mat.get_shader_parameter("mist")
	ok(air.mist_quad.visible and absf(mv.x - float(dawn["mist_density"])) < 1e-7 and absf(mv.y - (2050.0 - 2000.0)) < 1.0 and absf(mv.z - float(dawn["mist_scale"])) < 1e-3,
		"at dawn the mist pass is on, with the floor in the scene's own frame (%.1f) and the keys' density and scale" % mv.y)
	ok(absf(env.volumetric_fog_density - float(dawn["vfog_density"])) < 1e-9 and absf(sun.light_volumetric_fog_energy - float(dawn["vfog_sun"])) < 1e-6, "the volumetric fog and the sun's share of it take the keys")
	ok(int(air.stats["sources"]) == src.size() and int(air.stats["volumes"]) > 3 and int(air.stats["volumes"]) < src.size() and int(air.stats["volumes"]) <= int(hi["fog_volume_max"]),
		"fog volumes stand on the sources within the fog's reach, not the ones past it (%d of %d)" % [air.stats["volumes"], src.size()])
	var steam := 0
	for c in air.get_children():
		steam += 1 if c is GPUParticles3D else 0
	ok(int(air.stats["emitters"]) == 2 and steam == 2, "the vent and the fall each have an emitter")
	air.update(env, sun, {"sunAlt": 50.0, "sunDir": Vector3.UP}, 12.0, {}, S, cam, 0.6)
	ok(not air.mist_quad.visible and absf(env.volumetric_fog_density - float(noon["vfog_density"])) < 1e-9, "negative: at noon the mist pass is off and the fog thin")
	air.indoors = true
	for _i in 8:
		air.update(env, sun, {"sunAlt": 6.0, "sunDir": Vector3.UP}, 4.0, {}, S, cam, 0.6)
	ok(not air.mist_quad.visible, "negative: indoors the mist stays outside, at any hour")
	air.indoors = false
	# leaves fall only among trees
	S.trees = 0.0
	air._since = 1e9
	air.update(env, sun, {"sunAlt": 50.0}, 12.0, {}, S, cam, 0.6)
	var none: int = air.stats["leaves"]
	S.trees = 5.0
	air._since = 1e9
	air.update(env, sun, {"sunAlt": 50.0}, 12.0, {}, S, cam, 0.6)
	ok(none == 0 and int(air.stats["leaves"]) == int(hi["leaves"]), "leaves come down only where trees stand within 30 m")
	# F6: one wetness
	air.update(env, sun, {"sunAlt": 50.0}, 12.0, {"wet": 0.8}, S, cam, 0.6)
	ok(absf(air.wet - 0.8) < 1e-6 and env.ssr_enabled, "a wet world: the air hands one number on, and the high tier turns reflections on")
	air.update(env, sun, {"sunAlt": 50.0}, 12.0, {}, S, cam, 0.6)
	ok(air.wet == 0.0 and not env.ssr_enabled, "negative: dry, no reflections pass is paid for")
	# the low tier: no volumes
	var low_air := A.make(KratorLook.tier("low"))
	root.add_child(low_air)
	var env_lo := Environment.new()
	KratorLook.apply(KratorLook.tier("low"), env_lo, sun, root)
	low_air.update(env_lo, sun, {"sunAlt": 6.0}, 4.0, {}, S, cam, 0.6)
	ok(low_air.mist_quad.visible and int(low_air.stats["volumes"]) == 0 and not env_lo.volumetric_fog_enabled, "negative: the low tier has the mist and no fog volumes")

	# 5. the wiring
	var mist := FileAccess.get_file_as_string("res://shaders/air_mist.gdshader")
	var terr := FileAccess.get_file_as_string("res://shaders/terrain.gdshader")
	var walk := FileAccess.get_file_as_string("res://walk.gd")
	ok(mist.contains("hint_depth_texture") and mist.contains("depth_test_disabled") and mist.contains("is_sky") and terr.contains("atm_wet") and terr.contains("puddle"),
		"the mist pass reads the depth and leaves the sky; the terrain answers atm_wet with standing water")
	ok(walk.contains("KratorAir.make(look)") and walk.find("air.update(") > walk.find("sky_node._update()"), "the walk updates the air after the sky")
	print("all passed" if fails == 0 else "%d FAILED" % fails)
	quit(1 if fails else 0)
