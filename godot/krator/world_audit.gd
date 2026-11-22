# 3D scene & stream conversion auditor for Krator -> Godot worlds (standalone krator-world and streamed krator-world-stream).
# Provides 7 automated 3D audits with structured {ok: bool, issues: Array[String], ...} results so tests can assert both
# positive real-world scenes and paired negative mutations:
#   1. audit_materials          resolved shaders/textures, foliage alpha scissor, multiply-blended stain decals, GLES3 guard
#   2. audit_terrain            PBR surface maps, backface ConcavePolygonShape3D, physics raycast vs mesh & tri_height parity
#   3. audit_flora              forbids clunky lv=0 icosahedral blobs, verifies Hero (lv=2) / Mid (lv=1) scale & grounding
#   4. audit_collision_and_seams zero colliders on foliage/floor buckets, stitched place-to-chunk perimeter seam <= 2 mm
#   5. audit_roads              RoadRibbon ground-hugging carriageway & shoulder toes, zero intrusion across bridge spans
#   6. audit_stream_flora       dual-LOD StreamFlora hero+mid activation, uniform 3D basis, zero lod_* uniforms, high-alt cull
#   7. audit_pois               KratorHostUI.resolve_poi loaded ground under eye & target, elevation & ridge line-of-sight
class_name KratorWorldAudit
extends RefCounted

const TERRAIN_SHADER := preload("res://shaders/terrain.gdshader")


static func _ground_mi(w: Node3D) -> MeshInstance3D:
	if w == null or not w.has_meta("ground"):
		return null
	var g = w.get_meta("ground")
	if g is MeshInstance3D:
		return g as MeshInstance3D
	if g is Node3D:
		return (g as Node3D).get_node_or_null("Terrain") as MeshInstance3D
	return null


static func _collect_world_roots(w: Node3D) -> Array:
	var out: Array = [w]
	for sub_nm in ["Arcology", "Monastery"]:
		var sub := w.get_node_or_null(sub_nm) as Node3D
		if sub != null:
			out.append(sub)
	return out


# 1. Materials, textures, foliage alpha_test, and multiply-blended decal stains
static func audit_materials(w: Node3D) -> Dictionary:
	var issues: Array[String] = []
	var checked := 0
	var mul_decals := 0
	var foliage_mats := 0
	for rw in _collect_world_roots(w):
		var root_node := rw as Node3D
		var rep: Dictionary = root_node.get_meta("report", {}) if root_node.has_meta("report") else {}
		var gaps: Dictionary = rep.get("gaps", {})
		for gk in ["format", "load", "export errors", "materials", "hooks", "ground layers"]:
			if gaps.has(gk):
				issues.append("%s: gap '%s': %s" % [root_node.name, gk, str(gaps[gk])])
		var mat_recs := {}
		var wdict: Dictionary = root_node.get_meta("world", {}) if root_node.has_meta("world") else {}
		for mrec in wdict.get("materials", []):
			if mrec is Dictionary and mrec.has("id"):
				mat_recs[str(mrec["id"])] = mrec
		for sec_nm in ["Items", "Buckets"]:
			var sec := root_node.get_node_or_null(sec_nm)
			if sec == null:
				continue
			for ch in sec.get_children():
				if not (ch is GeometryInstance3D):
					continue
				var gi := ch as GeometryInstance3D
				var mat: Material = gi.material_override
				if mat == null and gi is MeshInstance3D and (gi as MeshInstance3D).mesh != null and (gi as MeshInstance3D).mesh.get_surface_count() > 0:
					mat = (gi as MeshInstance3D).mesh.surface_get_material(0)
				if mat == null:
					issues.append("%s/%s: missing material" % [root_node.name, gi.name])
					continue
				checked += 1
				if mat is ShaderMaterial:
					var sm := mat as ShaderMaterial
					if sm.shader == KratorBiome.FOLIAGE:
						foliage_mats += 1
						var at_val = sm.get_shader_parameter("alpha_test")
						var at_f := float(at_val) if (at_val is float or at_val is int) else 0.0
						if at_f <= 0.05:
							issues.append("%s/%s: FOLIAGE shader has alpha_test=%.3f (<= 0.05)" % [root_node.name, gi.name, at_f])
				elif mat is StandardMaterial3D:
					var std := mat as StandardMaterial3D
					var kmeta: Dictionary = std.get_meta("krator", {}) if std.has_meta("krator") else {}
					var mid := str(kmeta.get("material", ""))
					var mrec_d: Dictionary = mat_recs.get(mid, {})
					var expects_add := str(kmeta.get("shader", "")) == "StandardMaterial3D (add)" or str(mrec_d.get("blending", "")) == "additive"
					var expects_mul := not expects_add and (str(kmeta.get("shader", "")) == "StandardMaterial3D (mul)" or str(mrec_d.get("blending", "")) == "multiply")
					if not expects_add and not expects_mul and bool(mrec_d.get("transparent", false)) and float(mrec_d.get("opacity", 1.0)) >= 0.999 and float(mrec_d.get("alphaTest", 0.0)) <= 0.0 and std.albedo_texture != null:
						var timg := std.albedo_texture.get_image()
						if timg != null and timg.detect_alpha() == Image.ALPHA_NONE:
							expects_mul = true
					if expects_add:
						if std.blend_mode != BaseMaterial3D.BLEND_MODE_ADD:
							issues.append("%s/%s: additive material %s uses blend_mode=%d instead of BLEND_MODE_ADD" % [root_node.name, gi.name, mid, int(std.blend_mode)])
					elif expects_mul:
						if std.blend_mode != BaseMaterial3D.BLEND_MODE_MUL:
							issues.append("%s/%s: decal material %s uses blend_mode=%d instead of BLEND_MODE_MUL" % [root_node.name, gi.name, mid, int(std.blend_mode)])
						else:
							mul_decals += 1
	return {
		"ok": issues.is_empty(),
		"issues": issues,
		"checked": checked,
		"mul_decals": mul_decals,
		"foliage_mats": foliage_mats,
	}


# 2. Terrain surface maps, backface trimesh collision, and vertical raycast vs mesh/grid triangle parity
static func audit_terrain(w: Node3D, space: PhysicsDirectSpaceState3D = null, require_surface_tex := false) -> Dictionary:
	var issues: Array[String] = []
	var g_mi := _ground_mi(w)
	if g_mi == null or g_mi.mesh == null or g_mi.mesh.get_surface_count() == 0:
		issues.append("%s: missing ground Terrain MeshInstance3D" % (w.name if w != null else "null"))
		return {"ok": false, "issues": issues, "rays": 0, "max_err": INF}

	var sm := g_mi.material_override as ShaderMaterial
	if sm == null:
		sm = g_mi.mesh.surface_get_material(0) as ShaderMaterial
	if require_surface_tex or (sm != null and sm.shader == TERRAIN_SHADER):
		if sm == null or sm.shader != TERRAIN_SHADER:
			issues.append("%s: ground missing terrain.gdshader ShaderMaterial" % w.name)
		else:
			var has_st := bool(sm.get_shader_parameter("has_surface_tex"))
			var alb_tex = sm.get_shader_parameter("albedo_rock_tex")
			var nrm_tex = sm.get_shader_parameter("normal_cav_tex")
			if require_surface_tex and (not has_st or alb_tex == null or nrm_tex == null):
				issues.append("%s: terrain.gdshader missing PBR surface textures (has_surface_tex=%s, albedo=%s, normal=%s)"
					% [w.name, str(has_st), str(alb_tex != null), str(nrm_tex != null)])

	var col_body := g_mi.get_node_or_null("Collision") as StaticBody3D
	if col_body != null:
		var cs := col_body.get_child(0) as CollisionShape3D if col_body.get_child_count() > 0 else null
		var cc := cs.shape as ConcavePolygonShape3D if cs != null else null
		if cc == null:
			issues.append("%s: Terrain/Collision has no ConcavePolygonShape3D" % w.name)
		elif not cc.backface_collision:
			issues.append("%s: Terrain/Collision ConcavePolygonShape3D has backface_collision=false" % w.name)

	var rays := 0
	var max_err := 0.0
	var arr := g_mi.mesh.surface_get_arrays(0)
	var V: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
	var I: PackedInt32Array = arr[Mesh.ARRAY_INDEX]
	var n_tri := I.size() / 3
	if n_tri == 0:
		issues.append("%s: ground mesh has 0 triangles" % w.name)
		return {"ok": false, "issues": issues, "rays": 0, "max_err": INF}

	var has_grid := g_mi.has_meta("grid")
	var step_t := maxi(1, n_tri / 24)
	for ti in range(0, n_tri, step_t):
		if rays >= 24:
			break
		var v0 := V[I[ti * 3]]
		var v1 := V[I[ti * 3 + 1]]
		var v2 := V[I[ti * 3 + 2]]
		var tri_n := (v1 - v0).cross(v2 - v0)
		if tri_n.length() < 1e-4 or absf(tri_n.normalized().y) < 0.25:
			continue
		var lc := (v0 + v1 + v2) / 3.0
		if has_grid:
			var th := KratorWorldStream.terrain_tri_height(g_mi, lc.x, lc.z)
			if is_finite(th):
				var g_err := absf(th - lc.y)
				max_err = maxf(max_err, g_err)
				if g_err > 0.025:
					issues.append("%s: terrain_tri_height differs from mesh triangle by %.3f m at (%.1f, %.1f)" % [w.name, g_err, lc.x, lc.z])
					break
		if space != null and col_body != null and g_mi.is_inside_tree():
			var wc := g_mi.global_transform * lc
			var excl: Array[RID] = []
			var hit_ground := false
			for _attempt in 8:
				var q := PhysicsRayQueryParameters3D.create(Vector3(wc.x, wc.y + 500.0, wc.z), Vector3(wc.x, wc.y - 500.0, wc.z))
				q.exclude = excl
				var hit := space.intersect_ray(q)
				if hit.is_empty():
					break
				var collider = hit.get("collider")
				if collider == col_body:
					var hy := (hit["position"] as Vector3).y
					var r_err := absf(hy - wc.y)
					max_err = maxf(max_err, r_err)
					if r_err > 0.035:
						issues.append("%s: physics raycast y=%.3f differs from mesh y=%.3f (err=%.3f m)" % [w.name, hy, wc.y, r_err])
					hit_ground = true
					break
				elif collider is CollisionObject3D:
					excl.append((collider as CollisionObject3D).get_rid())
				else:
					break
			if not hit_ground:
				issues.append("%s: physics ray missed Terrain/Collision at (%.1f, %.1f)" % [w.name, wc.x, wc.z])
				break
		rays += 1
	return {
		"ok": issues.is_empty(),
		"issues": issues,
		"rays": rays,
		"max_err": max_err,
	}


# 3. Static 3D flora in world/place Items: zero clunky lv=0 blobs, valid scale, grounded on gentle terrain
static func audit_flora(w: Node3D, forbid_lv0 := true) -> Dictionary:
	var issues: Array[String] = []
	var hero := 0
	var mid := 0
	var lv0 := 0
	var floating := 0
	var items := w.get_node_or_null("Items")
	var g_mi := _ground_mi(w)
	var has_sub_cut := w.get_node_or_null("Arcology") != null or w.get_node_or_null("Monastery") != null
	if items != null:
		for ch in items.get_children():
			if not (ch is MultiMeshInstance3D):
				continue
			var mmi := ch as MultiMeshInstance3D
			var km: Dictionary = mmi.get_meta("krator", {}) if mmi.has_meta("krator") else {}
			var nm := str(km.get("name", mmi.name))
			var is_fl := str(km.get("kit", "")) == "flora" or nm.begins_with("flora/")
			if not is_fl:
				continue
			var mm := mmi.multimesh
			var n := mm.instance_count if mm != null else 0
			var lv_tag := ""
			if nm.begins_with("flora/"):
				var p1 := nm.split("/")
				if p1.size() >= 2:
					var p2 := p1[1].split("|")
					if p2.size() >= 4:
						lv_tag = str(p2[3])
			if lv_tag == "0":
				lv0 += n if n > 0 else 1
				if forbid_lv0:
					issues.append("%s: forbidden clunky lv=0 flora item '%s' (%d instances)" % [w.name, nm, n])
			elif lv_tag == "1":
				mid += n
			else:
				hero += n
			if mm == null or n == 0:
				continue
			var stride := 12 + (4 if mm.use_colors else 0) + (4 if mm.use_custom_data else 0)
			var buf := mm.buffer
			if buf.size() < n * stride:
				continue
			var tf := Transform3D.IDENTITY
			var pnode: Node = mmi
			while pnode != null and pnode != w:
				if pnode is Node3D:
					tf = (pnode as Node3D).transform * tf
				pnode = pnode.get_parent()
			var sample_step := maxi(1, n / 16)
			for i in range(0, n, sample_step):
				var b0 := i * stride
				var sx := Vector3(buf[b0], buf[b0 + 4], buf[b0 + 8]).length()
				var sy := Vector3(buf[b0 + 1], buf[b0 + 5], buf[b0 + 9]).length()
				if sx < 0.03 or sy < 0.03 or sx > 40.0 or sy > 40.0:
					issues.append("%s/%s: degenerate flora instance scale (%.3f, %.3f)" % [w.name, nm, sx, sy])
					break
				if g_mi != null and g_mi.has_meta("grid") and not has_sub_cut:
					var lpos := tf * Vector3(buf[b0 + 3], buf[b0 + 7], buf[b0 + 11])
					var th := KratorWorldStream.terrain_tri_height(g_mi, lpos.x, lpos.z)
					var th_x := KratorWorldStream.terrain_tri_height(g_mi, lpos.x + 8.0, lpos.z)
					var th_z := KratorWorldStream.terrain_tri_height(g_mi, lpos.x, lpos.z + 8.0)
					if is_finite(th) and is_finite(th_x) and is_finite(th_z):
						var slope := maxf(absf(th_x - th), absf(th_z - th)) / 8.0
						if slope < 0.35 and (lpos.y > th + 5.0 or lpos.y < th - 8.0):
							floating += 1
							if floating <= 2:
								issues.append("%s/%s: ungrounded flora instance y=%.2f vs terrain=%.2f at (%.1f, %.1f)"
									% [w.name, nm, lpos.y, th, lpos.x, lpos.z])
	return {
		"ok": issues.is_empty(),
		"issues": issues,
		"hero": hero,
		"mid": mid,
		"lv0": lv0,
		"floating": floating,
	}


# 4. Foliage/floor bucket collision exclusion & stitched place-to-chunk outer perimeter seam continuity
static func audit_collision_and_seams(stream: KratorWorldStream) -> Dictionary:
	var issues: Array[String] = []
	var foliage_colliders := 0
	var max_seam_err := 0.0
	var seam_verts := 0

	var all_cases: Array = []
	for cid in stream.chunks:
		all_cases.append(stream.chunks[cid])
	for pid in stream.places_open:
		all_cases.append(stream.places_open[pid])

	for cw in all_cases:
		var w := cw as Node3D
		var g_mi := _ground_mi(w)
		if g_mi != null:
			var cbody := g_mi.get_node_or_null("Collision") as StaticBody3D
			if cbody != null and cbody.get_child_count() > 0:
				var cshape := (cbody.get_child(0) as CollisionShape3D).shape as ConcavePolygonShape3D
				if cshape != null and not cshape.backface_collision:
					issues.append("%s: Terrain ConcavePolygonShape3D backface_collision=false" % w.name)
		var bk := w.get_node_or_null("Buckets")
		if bk != null:
			for b in bk.get_children():
				if b is MeshInstance3D and KratorWorldStream._is_foliage_bucket(b as MeshInstance3D):
					if (b as MeshInstance3D).get_node_or_null("Collision") != null:
						foliage_colliders += 1
						issues.append("%s/%s: foliage/floor bucket carries blocking Collision body" % [w.name, b.name])

	var cstep := float(stream.index["chunk"]["step"])
	for pid in stream.places_open:
		var pw: Node3D = stream.places_open[pid]
		var pinfo := stream.place(str(pid))
		var pbox: Array = pinfo.get("box", [])
		var pmi := _ground_mi(pw)
		if pmi == null or pmi.mesh == null or pbox.size() < 4:
			continue
		var po: Array = pw.get_meta("origin", [0.0, 0.0, 0.0])
		var V: PackedVector3Array = pmi.mesh.surface_get_arrays(0)[Mesh.ARRAY_VERTEX]
		var bx0 := float(pbox[0]); var bz0 := float(pbox[1]); var bx1 := float(pbox[2]); var bz1 := float(pbox[3])
		for v in V:
			var wx := float(v.x) + float(po[0])
			var wz := float(v.z) + float(po[2])
			var on_x := absf(wx - bx0) < 0.05 or absf(wx - bx1) < 0.05
			var on_z := absf(wz - bz0) < 0.05 or absf(wz - bz1) < 0.05
			if not on_x and not on_z:
				continue
			var wy := float(v.y) + float(po[1])
			# Probe the covering or adjacent chunk just 0.25 m outside the place border along the shared 64 m cell edge
			var probe_x := wx - 0.25 if absf(wx - bx0) < 0.05 else (wx + 0.25 if absf(wx - bx1) < 0.05 else wx)
			var probe_z := wz - 0.25 if absf(wz - bz0) < 0.05 else (wz + 0.25 if absf(wz - bz1) < 0.05 else wz)
			var cid := stream.covering(probe_x, probe_z)
			if cid == "":
				cid = stream.covering(wx, wz)
			if cid == "":
				continue
			var cw: Node3D = stream.chunks[cid]
			var cmi := _ground_mi(cw)
			if cmi == null or not cmi.has_meta("grid"):
				continue
			var co: Array = cw.get_meta("origin", [0.0, 0.0, 0.0])
			var cg: Dictionary = cmi.get_meta("grid")
			var ch: PackedFloat32Array = cg["h"]
			var cnx := int(cg["nx"])
			var cnz := int(cg["nz"])
			var cx0 := float(cg["x0"]) + float(co[0])
			var cz0 := float(cg["z0"]) + float(co[2])
			var fi := clampf((wx - cx0) / cstep, 0.0, float(cnx - 1))
			var fj := clampf((wz - cz0) / cstep, 0.0, float(cnz - 1))
			var ch_y := NAN
			if on_x and not on_z:
				var i_edge := int(roundf(fi))
				var j0 := mini(int(floor(fj)), cnz - 2)
				var tv := fj - float(j0)
				if i_edge >= 0 and i_edge < cnx and absf(fi - float(i_edge)) < 0.01:
					ch_y = lerpf(ch[j0 * cnx + i_edge], ch[(j0 + 1) * cnx + i_edge], tv) + float(co[1])
			elif on_z and not on_x:
				var j_edge := int(roundf(fj))
				var i0 := mini(int(floor(fi)), cnx - 2)
				var tu := fi - float(i0)
				if j_edge >= 0 and j_edge < cnz and absf(fj - float(j_edge)) < 0.01:
					ch_y = lerpf(ch[j_edge * cnx + i0], ch[j_edge * cnx + i0 + 1], tu) + float(co[1])
			else:
				var ic := int(roundf(fi))
				var jc := int(roundf(fj))
				if ic >= 0 and ic < cnx and jc >= 0 and jc < cnz and absf(fi - float(ic)) < 0.01 and absf(fj - float(jc)) < 0.01:
					ch_y = ch[jc * cnx + ic] + float(co[1])
			if is_finite(ch_y):
				var err := absf(wy - ch_y)
				max_seam_err = maxf(max_seam_err, err)
				seam_verts += 1
				if err > 0.0025:
					issues.append("place %s seam crack %.4f m against chunk %s at (%.1f, %.1f)" % [str(pid), err, cid, wx, wz])
					break

	return {
		"ok": issues.is_empty(),
		"issues": issues,
		"foliage_colliders": foliage_colliders,
		"seam_verts": seam_verts,
		"max_seam_err": max_seam_err,
	}


# 5. Ground-hugging 3D RoadRibbon carriageway, shoulder toes, and bridge-span clearance
static func audit_roads(stream: KratorWorldStream) -> Dictionary:
	var issues: Array[String] = []
	var ribbons := 0
	var buried := 0
	var floating_toes := 0
	var span_intrusions := 0

	var span_mids: Array[Vector2] = []
	for rd in stream.index.get("roads", []):
		var pts: Array = rd.get("pts", [])
		for sp in rd.get("spans", []):
			if sp is Array and (sp as Array).size() >= 2:
				var s0 := maxi(0, int(sp[0]))
				var s1 := mini(pts.size() - 1, int(sp[1]))
				if s1 > s0 and pts.size() >= 2:
					var p_a: Array = pts[s0]
					var p_b: Array = pts[s1]
					var mx := 0.5 * (float(p_a[0]) + float(p_b[0]))
					var mz := 0.5 * (float(p_a[1]) + float(p_b[1]))
					if Vector2(float(p_a[0]), float(p_a[1])).distance_to(Vector2(float(p_b[0]), float(p_b[1]))) >= 18.0:
						span_mids.append(Vector2(mx, mz))

	var all_cases: Array = []
	for cid in stream.chunks:
		all_cases.append(stream.chunks[cid])
	for pid in stream.places_open:
		all_cases.append(stream.places_open[pid])

	for cw in all_cases:
		var w := cw as Node3D
		var rmi := w.get_node_or_null("RoadRibbon") as MeshInstance3D
		var g_mi := _ground_mi(w)
		if rmi == null or rmi.mesh == null or g_mi == null:
			continue
		ribbons += 1
		var o: Array = w.get_meta("origin", [0.0, 0.0, 0.0])
		var arr := rmi.mesh.surface_get_arrays(0)
		var V: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
		var UV: PackedVector2Array = arr[Mesh.ARRAY_TEX_UV]
		if V.size() != UV.size() or V.is_empty():
			issues.append("%s/RoadRibbon: empty or mismatched vertex/UV arrays" % w.name)
			continue
		var step_v := maxi(1, V.size() / 160)
		for i in range(0, V.size(), step_v):
			var lv := V[i] + rmi.position
			var uvx := absf(UV[i].x)
			var th := KratorWorldStream.terrain_tri_height(g_mi, lv.x, lv.z)
			if is_finite(th):
				if uvx <= 1.0 and lv.y < th - 0.04:
					buried += 1
					if buried <= 2:
						issues.append("%s/RoadRibbon: carriageway vertex buried %.3f m under terrain" % [w.name, th - lv.y])
				elif uvx >= 1.8 and absf(lv.y - th) > 0.45:
					floating_toes += 1
					if floating_toes <= 2:
						issues.append("%s/RoadRibbon: shoulder toe off terrain by %.3f m" % [w.name, lv.y - th])
		# Check ALL carriageway crown vertices against bridged river span midpoints
		if not span_mids.is_empty():
			for i in V.size():
				if absf(UV[i].x) > 0.5:
					continue
				var lv2 := V[i] + rmi.position
				var wx := float(lv2.x) + float(o[0])
				var wz := float(lv2.z) + float(o[2])
				var pt2 := Vector2(wx, wz)
				for smid in span_mids:
					if pt2.distance_to(smid) < 6.0:
						span_intrusions += 1
						if span_intrusions == 1:
							issues.append("%s/RoadRibbon: road ribbon intrudes onto bridge span midpoint (%.1f, %.1f)" % [w.name, smid.x, smid.y])
						break
				if span_intrusions > 0:
					break

	if ribbons == 0:
		issues.append("stream has 0 RoadRibbon meshes across %d cases" % all_cases.size())
	return {
		"ok": issues.is_empty(),
		"issues": issues,
		"ribbons": ribbons,
		"buried": buried,
		"floating_toes": floating_toes,
		"span_intrusions": span_intrusions,
	}


# 6. Dual-LOD 3D StreamFlora: hero + mid pools active at ground level, uniform 3D basis, zero lod_* uniforms, high-alt cull
static func audit_stream_flora(stream: KratorWorldStream, probe_xz: Vector2) -> Dictionary:
	var issues: Array[String] = []
	if stream.covering(probe_xz.x, probe_xz.y) == "":
		stream.update(probe_xz, 20000.0, 28000.0)
	var gh := stream.tri_height_at(probe_xz.x, probe_xz.y)
	if not is_finite(gh):
		gh = stream.height_at(probe_xz.x, probe_xz.y)
	if not is_finite(gh):
		issues.append("StreamFlora probe (%.1f, %.1f) has no loaded terrain" % [probe_xz.x, probe_xz.y])
		return {"ok": false, "issues": issues, "hero": 0, "mid": 0}

	var stats := stream.refresh_flora_at(Vector3(probe_xz.x, gh + 2.0, probe_xz.y), 240.0, 2600.0)
	var hero := int(stats.get("hero", 0))
	var mid := int(stats.get("mid", 0))
	if hero <= 0 or mid <= 0:
		issues.append("StreamFlora at (%.0f, %.0f) expected hero>0 and mid>0, got hero=%d mid=%d" % [probe_xz.x, probe_xz.y, hero, mid])

	var sf_root := stream.get_node_or_null("StreamFlora")
	if sf_root == null:
		issues.append("missing StreamFlora node")
	else:
		for ch in sf_root.get_children():
			if not (ch is MultiMeshInstance3D):
				continue
			var mmi := ch as MultiMeshInstance3D
			var mm := mmi.multimesh
			if mm == null or mm.instance_count == 0 or not mmi.visible:
				continue
			var lv := int(mmi.get_meta("flora_lv", -1))
			if lv != 1 and lv != 2:
				issues.append("StreamFlora/%s: forbidden flora_lv=%d" % [mmi.name, lv])
			var ly_p = mmi.get_instance_shader_parameter("lod_y")
			if ly_p is Vector4 and (ly_p as Vector4).w > 0.5:
				issues.append("StreamFlora/%s: carries active lod_y instance shader uniform (breaks StreamFlora visibility)" % mmi.name)
			var stride := 12 + (4 if mm.use_colors else 0) + (4 if mm.use_custom_data else 0)
			var buf := mm.buffer
			var step_i := maxi(1, mm.instance_count / 8)
			for i in range(0, mm.instance_count, step_i):
				var b0 := i * stride
				var sx := Vector3(buf[b0], buf[b0 + 4], buf[b0 + 8]).length()
				var sy := Vector3(buf[b0 + 1], buf[b0 + 5], buf[b0 + 9]).length()
				var sz := Vector3(buf[b0 + 2], buf[b0 + 6], buf[b0 + 10]).length()
				if sy < 0.08 or absf(sx - sy) > sy * 0.03 or absf(sz - sy) > sy * 0.03:
					issues.append("StreamFlora/%s: non-uniform or degenerate basis scale (%.3f, %.3f, %.3f)" % [mmi.name, sx, sy, sz])
					break

	var hi := stream.refresh_flora_at(Vector3(probe_xz.x, gh + 5000.0, probe_xz.y), 240.0, 2600.0)
	if int(hi.get("hero", 0)) != 0 or int(hi.get("mid", 0)) != 0:
		issues.append("StreamFlora at +5000 m altitude failed to cull: %s" % JSON.stringify(hi))
	stream.refresh_flora_at(Vector3(probe_xz.x, gh + 2.0, probe_xz.y), 240.0, 2600.0)

	return {
		"ok": issues.is_empty(),
		"issues": issues,
		"hero": hero,
		"mid": mid,
	}


# 7. Points of Interest: loaded terrain under eye & target, ground clearance, and unobstructed ridge line-of-sight
static func audit_pois(stream: KratorWorldStream, pois: Array) -> Dictionary:
	var issues: Array[String] = []
	var checked := 0
	for p in pois:
		if not (p is Dictionary):
			continue
		var r := KratorHostUI.resolve_poi(stream, p as Dictionary)
		var lbl := str(r.get("label", "?"))
		var eye: Vector3 = r["eye"]
		var target: Vector3 = r["target"]
		var as_walk := bool(r.get("walk", false))
		var gh_e := stream.height_at(eye.x, eye.z)
		var gh_t := stream.height_at(target.x, target.z)
		checked += 1
		if not is_finite(gh_e) or not is_finite(gh_t):
			issues.append("POI '%s': unloaded void ground (eye_h=%s, target_h=%s)" % [lbl, str(gh_e), str(gh_t)])
			continue
		if bool(r.get("exact", false)) or str(r.get("kind", "")) in ["interior", "vault", "monastery_ext"]:
			if eye.distance_to(target) < 0.35:
				issues.append("POI '%s': degenerate zero-length view vector" % lbl)
			continue
		if as_walk:
			if eye.y < gh_e + 1.2:
				issues.append("POI '%s': walk eye %.1f m underground/too low vs ground %.1f m" % [lbl, eye.y, gh_e])
		else:
			if eye.y < gh_e + 5.0:
				issues.append("POI '%s': overlook eye %.1f m < ground+5 m (%.1f m)" % [lbl, eye.y, gh_e])
				continue
			for s in range(1, 15):
				var t := float(s) / 16.0
				if t > 0.88:
					break
				var sx := lerpf(eye.x, target.x, t)
				var sz := lerpf(eye.z, target.z, t)
				var sh := stream.height_at(sx, sz)
				var ray_y := lerpf(eye.y, target.y, t)
				if is_finite(sh) and ray_y < sh - 1.0:
					issues.append("POI '%s': ridge occludes line of sight at t=%.2f (ray %.1f m < ridge %.1f m)" % [lbl, t, ray_y, sh])
					break
	if checked == 0:
		issues.append("0 POIs audited")
	return {
		"ok": issues.is_empty(),
		"issues": issues,
		"checked": checked,
	}
