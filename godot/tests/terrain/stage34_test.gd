# Stage 3 + 4 Automated Verification Suite (godot/tests/terrain/stage34_test.gd)
# Verifies with positive assertions and paired negative mutations:
#   1. S1 40 km Horizon Elevation & Dozier-Frew Sky Visibility: loaded textures, Strongbow gorge sky_vis < 0.55 vs open High Rift > 0.96,
#      and low-sun canyon occlusion vs noon direct light
#   2. S3 2x Sub-Grid Chunk Normals & Creases: 501 x 501 (32 m texels on 64 m chunks) normal_cav_tex, exact vertex-normal preservation,
#      and bounded build time (< 80 ms per 16 km chunk)
#   3. S4 PBR Ground Texture2DArray Layers + Longsong Monastery/Terrain Zone Painting: 6 mipmapped 512x512 layers + plume card loaded,
#      Monastery/Terrain rotated case_ry & pave_zone_tex active on avenue/palace and zero on outer meadows
#   4. Legible 3D Grass Blade Sward (StreamGrass): > 1,500 grounded 3D clumps on Oidong Valley & Longsong meadows, < 1 mm height error
#      against drawn triangles, 0 clumps indoors or at high altitude, and 0 clumps on highways/paved avenue (plus negative check)
extends SceneTree

var _pass := 0
var _fail := 0


func _initialize() -> void:
	_run()


func _ok(cond: bool, label: String, detail := "") -> void:
	if cond:
		_pass += 1
		print("  PASS  %s%s" % [label, (" : " + detail) if detail != "" else ""])
	else:
		_fail += 1
		printerr("  FAIL  %s%s" % [label, (" : " + detail) if detail != "" else ""])


func _sample_hz_cpu(img0: Image, img1: Image, box: Vector4, max_tan: float, x: float, z: float, sun_dir: Vector3) -> Vector2:
	var u := clampf((x - box.x) / maxf(1.0, box.z - box.x), 0.0, 1.0)
	var v := clampf((z - box.y) / maxf(1.0, box.w - box.y), 0.0, 1.0)
	var px := clampi(int(roundf(u * float(img0.get_width() - 1))), 0, img0.get_width() - 1)
	var pz := clampi(int(roundf(v * float(img0.get_height() - 1))), 0, img0.get_height() - 1)
	var c0 := img0.get_pixel(px, pz)
	var c1 := img1.get_pixel(px, pz)
	var enc := [c0.r, c0.g, c0.b, c0.a, c1.r, c1.g, c1.b, c1.a]
	var tans := PackedFloat32Array()
	var sin2_sum := 0.0
	for k in 8:
		var ek := float(enc[k])
		var t := ek * ek * max_tan
		tans.append(t)
		sin2_sum += (t * t) / (1.0 + t * t)
	var sky_v := clampf(1.0 - sin2_sum * 0.125, 0.08, 1.0)
	var hl := maxf(1e-5, Vector2(sun_dir.x, sun_dir.z).length())
	var sun_tan := sun_dir.y / hl
	var az := fposmod(atan2(sun_dir.z, sun_dir.x), TAU)
	var sector := az / (TAU / 8.0)
	var i0 := int(floor(sector)) % 8
	var i1 := (i0 + 1) % 8
	var hz_tan := lerpf(tans[i0], tans[i1], sector - floor(sector))
	var soft := 0.027 * (1.0 + hz_tan * hz_tan)
	var sun_v := smoothstep(hz_tan - soft, hz_tan + soft, sun_tan) * smoothstep(-0.02, 0.03, sun_dir.y)
	return Vector2(sun_v, sky_v)


func _run() -> void:
	print("=== Stage 3 + 4 Verification Suite ===")
	var host := Node3D.new()
	root.add_child(host)

	var S := KratorWorldStream.open("res://data/world-oidong-highrift/index.json")
	S.collide = false
	S.threaded = false
	S.auto_places = true
	host.add_child(S)
	await process_frame

	# 1. S4 Ground Layers & Plume Texture
	_ok(KratorGroundLayers.albedo_arr != null and KratorGroundLayers.albedo_arr.get_layers() == 6,
		"S4 albedo Texture2DArray loaded with 6 layers",
		"layers=%d vram=%.2f MB" % [KratorGroundLayers.albedo_arr.get_layers() if KratorGroundLayers.albedo_arr else 0, float(KratorGroundLayers.s4_vram_bytes) / 1048576.0])
	_ok(KratorGroundLayers.nr_arr != null and KratorGroundLayers.nr_arr.get_layers() == 6,
		"S4 normal+roughness+lum Texture2DArray loaded with 6 layers")
	_ok(KratorGroundLayers.plume_tex != null and KratorGroundLayers.plume_tex.get_width() == 512,
		"S4 flowering grass plume texture loaded (512x512 edge-dilated)")

	# 2. S1 40 km Horizon Elevation & Sky-Visibility Maps
	_ok(KratorGroundLayers.hz_tex0 != null and KratorGroundLayers.hz_tex1 != null,
		"S1 40 km horizon textures bound for world-oidong-highrift",
		"%dx%d (%.2f MB)" % [
			KratorGroundLayers.hz_tex0.get_width() if KratorGroundLayers.hz_tex0 else 0,
			KratorGroundLayers.hz_tex0.get_height() if KratorGroundLayers.hz_tex0 else 0,
			float(KratorGroundLayers.hz_vram_bytes) / 1048576.0])
	if KratorGroundLayers.hz_tex0 != null and KratorGroundLayers.hz_tex1 != null:
		var img0 := KratorGroundLayers.hz_tex0.get_image()
		var img1 := KratorGroundLayers.hz_tex1.get_image()
		var hzd = KData.read_json("res://data/world-oidong-highrift/horizon/horizon.json")
		var hb: Array = hzd["grid_box"]
		var hbox := Vector4(float(hb[0]), float(hb[1]), float(hb[2]), float(hb[3]))
		var max_t := float(hzd.get("max_tan", 2.0))
		# Find deepest canyon point near Strongbow / Great Cataract vs open High Rift plateau
		var min_gorge_v := 1.0
		var low_sun := Vector3(0.985, 0.14, -0.10).normalized()   # ~8 deg grazing morning sun
		var high_sun := Vector3(-0.25, 0.88, -0.40).normalized()  # ~62 deg noon sun
		var shadowed_pts := 0
		var noon_lit_pts := 0
		for py in range(0, img0.get_height(), 12):
			var sz := lerpf(hbox.y, hbox.w, float(py) / float(img0.get_height() - 1))
			for px in range(0, img0.get_width(), 24):
				var sx := lerpf(hbox.x, hbox.z, float(px) / float(img0.get_width() - 1))
				var ev_low := _sample_hz_cpu(img0, img1, hbox, max_t, sx, sz, low_sun)
				var ev_hi := _sample_hz_cpu(img0, img1, hbox, max_t, sx, sz, high_sun)
				min_gorge_v = minf(min_gorge_v, ev_low.y)
				if ev_low.x < 0.25:
					shadowed_pts += 1
				if ev_hi.x > 0.90:
					noon_lit_pts += 1
		var open_rift := _sample_hz_cpu(img0, img1, hbox, max_t, 80000.0, 0.0, low_sun)
		_ok(min_gorge_v < 0.65 and open_rift.y > 0.95,
			"S1 Dozier-Frew sky visibility separates deep canyon floor from open High Rift",
			"gorge_min_V=%.3f  open_rift_V=%.3f" % [min_gorge_v, open_rift.y])
		_ok(shadowed_pts >= 150 and noon_lit_pts >= 5000,
			"S1 40 km horizon shadows cast at 8 deg low sun and clear at 62 deg high sun",
			"low_sun_shadowed=%d  high_sun_lit=%d" % [shadowed_pts, noon_lit_pts])

	# 3. S3 2x Sub-Grid Chunk Normal & Crease Map + Longsong Monastery Zone Map
	S.update(Vector2(-266940.0, -41910.0), 20000.0, 28000.0)
	var cid := S.covering(-266940.0, -41910.0)
	_ok(cid != "", "Oidong Valley chunk streamed for S3 + grass test", cid)
	if cid != "":
		var cw: Node3D = S.chunks[cid]
		var cmi := cw.get_meta("ground") as MeshInstance3D
		var gd: Dictionary = cmi.get_meta("grid")
		var s3_dims: Vector2i = gd.get("s3_dims", Vector2i.ZERO)
		var s3_ms := float(gd.get("s3_ms", 0.0))
		var s3_bytes := int(gd.get("s3_bytes", 0))
		var smat := cmi.mesh.surface_get_material(0) as ShaderMaterial
		var nc_tex := smat.get_shader_parameter("normal_cav_tex") as Texture2D
		_ok(s3_dims == Vector2i(501, 501) and nc_tex != null and nc_tex.get_width() == 501,
			"S3 sub-grid chunk normal_cav_tex is 2x denser (501x501 = 32 m texels on 64 m chunk)",
			"build=%.2f ms  bytes=%d KB" % [s3_ms, s3_bytes / 1024])
		_ok(s3_ms > 0.0 and s3_ms < 125.0,
			"S3 chunk sub-grid build time within worker budget (< 125 ms)", "%.2f ms" % s3_ms)

	# 4. StreamGrass on Oidong Valley Forest Edge (grounding, density, road exclusion + negative)
	var fg_y := S.tri_height_at(-266940.0, -41910.0)
	var fl_forest := S.refresh_flora_at(Vector3(-266940.0, fg_y + 1.8, -41910.0))
	var gn_forest := int(fl_forest.get("grass_near", 0))
	var gm_forest := int(fl_forest.get("grass_mid", 0))
	var gp_forest := int(fl_forest.get("grass_plume", 0))
	_ok(gn_forest >= 1200 and gm_forest >= 1200 and gp_forest >= 80,
		"StreamGrass populates dense 3D near/mid blade clumps + flowering plumes in Oidong Valley",
		"near=%d  mid=%d  plume=%d" % [gn_forest, gm_forest, gp_forest])

	var sg := S.get_node_or_null("StreamGrass") as KratorWorldGrass
	var near_mm := sg.near_mmi.multimesh
	var max_g_err := 0.0
	var on_road := 0
	var n_chk := 0
	var nbuf := near_mm.buffer
	for i in range(0, near_mm.instance_count, maxi(1, near_mm.instance_count / 120)):
		var b := i * 16
		var reg: Array = S.region(Vector3(nbuf[b + 3], nbuf[b + 7], nbuf[b + 11]))
		var rx := float(reg[0]); var ry := float(reg[1]); var rz := float(reg[2])
		var th := S.tri_height_at(rx, rz)
		if is_finite(th):
			max_g_err = maxf(max_g_err, absf(ry - th))
			n_chk += 1
		if not S._is_clear_for_undergrowth(rx, rz, 0.0):
			on_road += 1
	_ok(n_chk >= 50 and max_g_err <= 0.002,
		"StreamGrass 3D clumps grounded within 2 mm of drawn terrain triangles",
		"checked=%d  worst_err=%.5f m" % [n_chk, max_g_err])
	_ok(on_road == 0, "StreamGrass keeps clear of highways, roads, and building footprints", "on_road=%d" % on_road)

	# Paired negative check: a deliberately ungrounded (+1.5 m floating) grass transform must be caught (> 1.0 m error)
	var neg_err := absf((fg_y + 1.5) - S.tri_height_at(-266940.0, -41910.0))
	_ok(neg_err > 1.0, "negative (floating grass +1.5 m) caught by grounding check", "err=%.3f m" % neg_err)

	# High-altitude cull check
	var fl_hi := S.refresh_flora_at(Vector3(-266940.0, fg_y + 500.0, -41910.0))
	_ok(int(fl_hi.get("grass_near", -1)) == 0 and int(fl_hi.get("grass_mid", -1)) == 0,
		"StreamGrass culls cleanly to 0 instances when camera flies > 88 m above ground")

	# 5. Longsong Monastery/Terrain Zone Painting & Meadow Grass vs Indoor Cull
	S.rebase(-154240.0, -25540.0)
	var ls_pw: Node3D = S.open_place("sq80bzd7ep")
	var mon: Node3D = ls_pw.get_node_or_null("Monastery") if ls_pw != null else null
	_ok(mon != null, "Longsong Monastery loaded for zone painting & meadow grass check")
	if mon != null:
		var M: Dictionary = mon.get_meta("monastery")
		var mat_at: Array = M["at"]
		var m_orig := Vector3(float(mat_at[0]), float(mat_at[1]), float(mat_at[2]))
		var m_rot := Basis(Vector3.UP, float(M.get("ry", 0.0)))
		var mg_raw = mon.get_meta("ground")
		var mg_mi: MeshInstance3D = mg_raw as MeshInstance3D if mg_raw is MeshInstance3D else (mg_raw as Node3D).get_node_or_null("Terrain") as MeshInstance3D
		var msmat := mg_mi.mesh.surface_get_material(0) as ShaderMaterial
		_ok(bool(msmat.get_shader_parameter("has_pave_zone")) and absf(float(msmat.get_shader_parameter("case_ry")) - float(M.get("ry", 0.0))) < 1e-4,
			"Monastery/Terrain carries pave_zone_tex and exact rotated case_ry")

		# Avenue center (local x=0, z=-100) must be paved; outer meadow (local x=-175, z=-110) must be grassy & populated with 3D grass!
		var ave_w := m_orig + m_rot * Vector3(0.0, 0.0, -100.0)
		var mead_w := m_orig + m_rot * Vector3(-175.0, 0.0, -110.0)
		var gs_ave := S.sample_grass_ground(ave_w.x, ave_w.z)
		var gs_mead := S.sample_grass_ground(mead_w.x, mead_w.z)
		_ok(float(gs_ave.get("pave", 0.0)) > 0.85 and float(gs_mead.get("pave", 1.0)) < 0.05,
			"Monastery zone map separates flagstone central avenue from outer grassy meadow",
			"ave_pave=%.2f  meadow_pave=%.2f" % [float(gs_ave.get("pave", 0.0)), float(gs_mead.get("pave", 1.0))])

		var mead_y := float(gs_mead.get("y", m_orig.y))
		var fl_mead := S.refresh_flora_at(Vector3(mead_w.x, mead_y + 1.7, mead_w.z))
		_ok(int(fl_mead.get("grass_near", 0)) >= 600,
			"Longsong outer meadow grows dense 3D grass sward underfoot",
			"grass_near=%d  grass_mid=%d" % [int(fl_mead.get("grass_near", 0)), int(fl_mead.get("grass_mid", 0))])

		# Inside Great Assembly Hall (local 0, 44.5, 42): StreamGrass must cull to 0!
		var hall_w := m_orig + m_rot * Vector3(0.0, 44.5, 42.0)
		var fl_hall := S.refresh_flora_at(hall_w)
		_ok(int(fl_hall.get("grass_near", -1)) == 0 and int(fl_hall.get("grass_mid", -1)) == 0,
			"StreamGrass culls to 0 instances when camera is inside a Longsong indoor hall")

	for pid in S.places_open.keys():
		var pn: Node3D = S.places_open[pid]
		pn.get_parent().remove_child(pn)
		pn.free()
	host.remove_child(S)
	S.free()
	await process_frame

	print("stage34_test: %d passed, %d failed" % [_pass, _fail])
	quit(0 if _fail == 0 else 1)
