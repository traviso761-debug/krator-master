# Stage 7 (GRAPHICS-TERRAIN-PROPOSAL.md section 8, I1-I4): GDScript twin of core/interiors/10-core-roomlight.js
# and Monastery indoor shell / furniture setup. Loaded via preload("res://krator/kinteriors_light.gd").
#   setup_monastery(mon, imeta) -> Dictionary (splits indoor room triangles from exterior facade buckets, bakes I4
#                                  per-vertex corner AO into COLOR.a and room_u into UV2.x / INSTANCE_CUSTOM.x,
#                                  builds non-interpolated room_light_tex, and assigns library_interior.gdshader)
#   update_uniforms(mon, sun_day_factor, lamp_amb_scale, mask_sun, use_corner_ao)
#   pick_pool(imeta, M, lp, room_id, sun_up, max_lights, hero_shadows) -> Array of Dictionary
extends RefCounted

const INTERIOR_SHADER := preload("res://shaders/library_interior.gdshader")
# L4 (GODOT-LOOK-PLAN.md 6.4): the line the ambient variant is made without (ambient_shader)
const AMBIENT_OFF_LINE := "render_mode ambient_light_disabled;"
static var _ambient_shader: Shader = null
const CELL_M := 16.0
const INDOOR_LAYER := 2
# a skylight's pool light this far over the eye at most (KROOMLIGHT.pickPool's o.skyFill default)
const SKY_FILL := 6.0


static func _smooth(a: float, b: float, x: float) -> float:
	var t := clampf((x - a) / maxf(1e-5, b - a), 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)


# Exact GDScript twin of KROOMLIGHT.vertexCornerAO (core/interiors/10-core-roomlight.js)
static func vertex_corner_ao(p: Vector3, n: Vector3, b: PackedFloat32Array, reach := 0.85) -> float:
	if b.size() < 6 or reach <= 0.0:
		return 1.0
	var df := maxf(0.0, p.y - b[1])
	var dc := maxf(0.0, b[4] - p.y)
	var dw := maxf(0.0, p.x - b[0])
	var de := maxf(0.0, b[3] - p.x)
	var dn := maxf(0.0, p.z - b[2])
	var ds := maxf(0.0, b[5] - p.z)
	var f_floor := 1.0 if n.y > 0.65 else (0.62 + 0.38 * _smooth(0.0, reach, df))
	var f_ceil := 1.0 if n.y < -0.65 else (0.68 + 0.32 * _smooth(0.0, reach, dc))
	var f_w := 1.0 if n.x > 0.65 else (0.68 + 0.32 * _smooth(0.0, reach, dw))
	var f_e := 1.0 if n.x < -0.65 else (0.68 + 0.32 * _smooth(0.0, reach, de))
	var f_n := 1.0 if n.z > 0.65 else (0.68 + 0.32 * _smooth(0.0, reach, dn))
	var f_s := 1.0 if n.z < -0.65 else (0.68 + 0.32 * _smooth(0.0, reach, ds))
	return clampf(f_floor * f_ceil * minf(f_w, f_e) * minf(f_n, f_s), 0.44, 1.0)


static func _build_room_light_tex(rtab: Dictionary) -> Dictionary:
	var order: Array = rtab.get("order", [])
	var by_id: Dictionary = rtab.get("byId", {})
	var w := maxi(1, order.size()) + 1
	var img := Image.create_empty(w, 2, false, Image.FORMAT_RGBAF)
	var u_by_id := {}
	for i in order.size():
		var rid := str(order[i])
		var row: Dictionary = by_id.get(rid, {})
		var dl := float(row.get("daylight", 0.0))
		var dt: Array = row.get("daylightTint", [0.85, 0.91, 1.0])
		var la := float(row.get("lampAmbience", 0.06))
		var lc: Array = row.get("lampColor", [1.0, 0.75, 0.43])
		var is_v := 1.0 if bool(row.get("vault", false)) else 0.0
		img.set_pixel(i, 0, Color(dl * float(dt[0]), dl * float(dt[1]), dl * float(dt[2]), la))
		img.set_pixel(i, 1, Color(float(lc[0]), float(lc[1]), float(lc[2]), is_v))
		u_by_id[rid] = (float(i) + 0.5) / float(w)
	# Fallback column at w - 1 for any unassigned indoor piece
	var fb_i := w - 1
	img.set_pixel(fb_i, 0, Color(0.20, 0.22, 0.25, 0.07))
	img.set_pixel(fb_i, 1, Color(1.0, 0.75, 0.43, 0.0))
	var fb_u := (float(fb_i) + 0.5) / float(w)
	return {
		"tex": ImageTexture.create_from_image(img),
		"u_by_id": u_by_id,
		"width": w,
		"fallback_u": fb_u,
	}


static func _make_interior_material(src: Material, room_tex: Texture2D, instanced: bool, mat_list: Array) -> ShaderMaterial:
	var sm := ShaderMaterial.new()
	sm.shader = INTERIOR_SHADER
	sm.set_shader_parameter("room_light_tex", room_tex)
	sm.set_shader_parameter("use_instancing_room", instanced)
	sm.set_shader_parameter("use_corner_ao", true)
	sm.set_shader_parameter("sun_day_factor", 1.0)
	sm.set_shader_parameter("lamp_amb_scale", 1.0)
	if src is ShaderMaterial:
		var s := src as ShaderMaterial
		for p in [
			"albedo_tex", "normal_tex", "rough_tex", "nrc_tex",
			"has_albedo", "has_normal", "has_rough", "use_nrc", "normal_enc",
			"cavity_k", "mip_var_lo", "mip_var_hi", "tint",
			"uv_scale", "uv_offset", "normal_scale", "roughness_k", "metal", "specular_k",
			"bu_mix", "bu_macro", "bu_cell", "world_uv", "tile_m", "world_uv_offset",
			"colour", "flip_v", "emission", "unlit", "alpha_test",
			"triplanar", "tri_per_m", "tri_gain"
		]:
			var val = s.get_shader_parameter(p)
			if val != null:
				sm.set_shader_parameter(p, val)
	elif src is StandardMaterial3D:
		var st := src as StandardMaterial3D
		sm.set_shader_parameter("colour", Vector3(st.albedo_color.r, st.albedo_color.g, st.albedo_color.b))
		sm.set_shader_parameter("tint", st.vertex_color_use_as_albedo)
		sm.set_shader_parameter("roughness_k", st.roughness)
		sm.set_shader_parameter("metal", st.metallic)
		sm.set_shader_parameter("specular_k", st.metallic_specular)
		sm.set_shader_parameter("uv_scale", st.uv1_scale)
		sm.set_shader_parameter("uv_offset", st.uv1_offset)
		if st.albedo_texture != null:
			sm.set_shader_parameter("albedo_tex", st.albedo_texture)
			sm.set_shader_parameter("has_albedo", true)
		if st.normal_enabled and st.normal_texture != null:
			sm.set_shader_parameter("normal_tex", st.normal_texture)
			sm.set_shader_parameter("has_normal", true)
			sm.set_shader_parameter("normal_scale", st.normal_scale)
		if st.roughness_texture != null:
			sm.set_shader_parameter("rough_tex", st.roughness_texture)
			sm.set_shader_parameter("has_rough", true)
		if st.emission_enabled:
			var em := st.emission * st.emission_energy_multiplier
			sm.set_shader_parameter("emission", Vector3(em.r, em.g, em.b))
		if st.shading_mode == BaseMaterial3D.SHADING_MODE_UNSHADED:
			sm.set_shader_parameter("unlit", true)
	mat_list.append(sm)
	return sm


static func _build_room_index(imeta: Dictionary, u_by_id: Dictionary, fb_u: float) -> Dictionary:
	var entries := []
	var grid := {}
	var raw_rooms: Array = imeta.get("rooms", [])
	for r in raw_rooms:
		if not (r is Dictionary) or not (r.get("box") is Array):
			continue
		var bx: Array = r["box"]
		if bx.size() < 6:
			continue
		var rid := str(r.get("id", ""))
		var b := PackedFloat32Array([float(bx[0]), float(bx[1]), float(bx[2]), float(bx[3]), float(bx[4]), float(bx[5])])
		var has_c := r.get("circle") is Array and (r["circle"] as Array).size() >= 3
		var c_x := float(r["circle"][0]) if has_c else 0.0
		var c_z := float(r["circle"][1]) if has_c else 0.0
		var c_r := float(r["circle"][2]) if has_c else 0.0
		var idx := entries.size()
		entries.append({
			"id": rid,
			"vault": bool(r.get("vault", false)),
			"b": b,
			"u": float(u_by_id.get(rid, fb_u)),
			"has_c": has_c,
			"cx": c_x,
			"cz": c_z,
			"cr": c_r,
		})
		var gx0 := int(floor((b[0] - 4.0) / CELL_M))
		var gx1 := int(floor((b[3] + 4.0) / CELL_M))
		var gz0 := int(floor((b[2] - 4.0) / CELL_M))
		var gz1 := int(floor((b[5] + 4.0) / CELL_M))
		for gz in range(gz0, gz1 + 1):
			for gx in range(gx0, gx1 + 1):
				var key := Vector2i(gx, gz)
				if not grid.has(key):
					grid[key] = PackedInt32Array()
				var arr: PackedInt32Array = grid[key]
				arr.append(idx)
				grid[key] = arr
	return {"entries": entries, "grid": grid}


static func _match_room(ridx: Dictionary, p: Vector3, n: Vector3, force_indoor: bool) -> int:
	var grid: Dictionary = ridx["grid"]
	var entries: Array = ridx["entries"]
	var key := Vector2i(int(floor(p.x / CELL_M)), int(floor(p.z / CELL_M)))
	if not grid.has(key):
		return -1
	var cand: PackedInt32Array = grid[key]
	for ri in cand:
		var e: Dictionary = entries[ri]
		var b: PackedFloat32Array = e["b"]
		if p.y < b[1] - 0.08 or p.y > b[4] + 0.12:
			continue
		if p.x < b[0] - 0.25 or p.x > b[3] + 0.25 or p.z < b[2] - 0.25 or p.z > b[5] + 0.25:
			continue
		if bool(e["has_c"]):
			var dx_c := p.x - float(e["cx"])
			var dz_c := p.z - float(e["cz"])
			var cr := float(e["cr"]) + 0.35
			if dx_c * dx_c + dz_c * dz_c > cr * cr:
				continue
		if not force_indoor:
			# Reject exterior upward-facing roof slabs at top of room box
			if n.y > 0.60 and p.y > b[4] - 0.15:
				continue
			# Reject outward-facing exterior walls along room boundary
			var on_edge := absf(p.x - b[0]) < 0.25 or absf(p.x - b[3]) < 0.25 or absf(p.z - b[2]) < 0.25 or absf(p.z - b[5]) < 0.25
			if on_edge and absf(n.y) < 0.50:
				var rcx := 0.5 * (b[0] + b[3])
				var rcz := 0.5 * (b[2] + b[5])
				if (rcx - p.x) * n.x + (rcz - p.z) * n.z < -0.20:
					continue
		return ri
	if force_indoor:
		var best := -1
		var best_d2 := 18.0
		for ri in cand:
			var e2: Dictionary = entries[ri]
			var b2: PackedFloat32Array = e2["b"]
			if p.y < b2[1] - 0.8 or p.y > b2[4] + 0.8:
				continue
			var dx := maxf(0.0, maxf(b2[0] - p.x, p.x - b2[3]))
			var dz := maxf(0.0, maxf(b2[2] - p.z, p.z - b2[5]))
			var d2 := dx * dx + dz * dz
			if d2 < best_d2:
				best_d2 = d2
				best = ri
		return best
	return -1


static func _append_shell_tri(
	va: Vector3, vb: Vector3, vc: Vector3,
	na: Vector3, nb: Vector3, nc: Vector3,
	uva: Vector2, uvb: Vector2, uvc: Vector2,
	ca: Color, cb: Color, cc: Color,
	org_v: Vector3, room_b: PackedFloat32Array, room_u: float,
	subdiv_depth: int,
	out_v: PackedVector3Array, out_n: PackedVector3Array,
	out_uv: PackedVector2Array, out_uv2: PackedVector2Array,
	out_col: PackedColorArray
) -> void:
	if subdiv_depth > 0:
		var lab2 := va.distance_squared_to(vb)
		var lbc2 := vb.distance_squared_to(vc)
		var lca2 := vc.distance_squared_to(va)
		var mx2 := maxf(lab2, maxf(lbc2, lca2))
		if mx2 > 3.4 * 3.4:
			var mab := (va + vb) * 0.5
			var mbc := (vb + vc) * 0.5
			var mca := (vc + va) * 0.5
			var nab := (na + nb).normalized()
			var nbc := (nb + nc).normalized()
			var nca := (nc + na).normalized()
			var uvab := (uva + uvb) * 0.5
			var uvbc := (uvb + uvc) * 0.5
			var uvca := (uvc + uva) * 0.5
			var cab := (ca + cb) * 0.5
			var cbc := (cb + cc) * 0.5
			var cca := (cc + ca) * 0.5
			var nx_d := subdiv_depth - 1
			_append_shell_tri(va, mab, mca, na, nab, nca, uva, uvab, uvca, ca, cab, cca, org_v, room_b, room_u, nx_d, out_v, out_n, out_uv, out_uv2, out_col)
			_append_shell_tri(mab, vb, mbc, nab, nb, nbc, uvab, uvb, uvbc, cab, cb, cbc, org_v, room_b, room_u, nx_d, out_v, out_n, out_uv, out_uv2, out_col)
			_append_shell_tri(mca, mbc, vc, nca, nbc, nc, uvca, uvbc, uvc, cca, cbc, cc, org_v, room_b, room_u, nx_d, out_v, out_n, out_uv, out_uv2, out_col)
			_append_shell_tri(mab, mbc, mca, nab, nbc, nca, uvab, uvbc, uvca, cab, cbc, cca, org_v, room_b, room_u, nx_d, out_v, out_n, out_uv, out_uv2, out_col)
			return
	var ao_a := vertex_corner_ao(va + org_v, na, room_b, 0.85)
	var ao_b := vertex_corner_ao(vb + org_v, nb, room_b, 0.85)
	var ao_c := vertex_corner_ao(vc + org_v, nc, room_b, 0.85)
	out_v.append(va); out_v.append(vb); out_v.append(vc)
	out_n.append(na); out_n.append(nb); out_n.append(nc)
	out_uv.append(uva); out_uv.append(uvb); out_uv.append(uvc)
	out_uv2.append(Vector2(room_u, ao_a)); out_uv2.append(Vector2(room_u, ao_b)); out_uv2.append(Vector2(room_u, ao_c))
	out_col.append(Color(ca.r, ca.g, ca.b, ao_a))
	out_col.append(Color(cb.r, cb.g, cb.b, ao_b))
	out_col.append(Color(cc.r, cc.g, cc.b, ao_c))


static func setup_monastery(mon: Node3D, imeta: Dictionary) -> Dictionary:
	var t0 := Time.get_ticks_usec()
	var rtab: Dictionary = imeta.get("room_table", {})
	if rtab.is_empty():
		return {}
	var tex_d := _build_room_light_tex(rtab)
	var room_tex: ImageTexture = tex_d["tex"]
	var u_by_id: Dictionary = tex_d["u_by_id"]
	var fb_u := float(tex_d["fallback_u"])
	var ridx := _build_room_index(imeta, u_by_id, fb_u)
	var entries: Array = ridx["entries"]
	var mo: Array = mon.get_meta("origin", [0.0, 0.0, 0.0])
	var org_v := Vector3(float(mo[0]), float(mo[1]), float(mo[2]))

	var mat_list: Array = []
	var shell_mat_cache := {}
	var furn_mat_cache := {}

	var shells_root := Node3D.new()
	shells_root.name = "IndoorShells"
	mon.add_child(shells_root)

	var indoor_tris := 0
	var ext_kept_tris := 0
	var split_buckets := 0
	var corner_ao_min := 1.0
	var corner_ao_max := 0.0

	var buckets := mon.get_node_or_null("Buckets")
	if buckets != null:
		for ch in buckets.get_children():
			if not (ch is MeshInstance3D):
				continue
			var mi := ch as MeshInstance3D
			if mi.mesh == null or mi.mesh.get_surface_count() == 0:
				continue
			var km: Dictionary = mi.get_meta("krator", {}) if mi.has_meta("krator") else {}
			var bname := str(km.get("name", ""))
			var blabel := str(km.get("label", ""))
			# Skip unlit, additive, signage, or transparent water-droplet buckets
			if bname.begins_with("pane") or bname.begins_with("glow") or bname.begins_with("v-glyphband") or bname.begins_with("v-field") or bname.begins_with("still") or bname.begins_with("MeshBasicMaterial") or bname.begins_with("awn:") or bname.begins_with("ban:") or bname.begins_with("sign:") or bname.begins_with("em:"):
				continue
			var pure_indoor := blabel.begins_with("interiors:") or bname.begins_with("v-") or bname.begins_with("furniture:")
			var mixed_indoor := not pure_indoor and blabel.find("interiors:") >= 0
			if not pure_indoor and not mixed_indoor:
				continue

			var arr := mi.mesh.surface_get_arrays(0)
			var V: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
			if V.is_empty():
				continue
			var N: PackedVector3Array = arr[Mesh.ARRAY_NORMAL] if arr[Mesh.ARRAY_NORMAL] is PackedVector3Array else PackedVector3Array()
			var UV0: PackedVector2Array = arr[Mesh.ARRAY_TEX_UV] if arr[Mesh.ARRAY_TEX_UV] is PackedVector2Array else PackedVector2Array()
			var COL: PackedColorArray = arr[Mesh.ARRAY_COLOR] if arr[Mesh.ARRAY_COLOR] is PackedColorArray else PackedColorArray()
			var IDX: PackedInt32Array = arr[Mesh.ARRAY_INDEX] if arr[Mesh.ARRAY_INDEX] is PackedInt32Array else PackedInt32Array()
			var has_n := N.size() == V.size()
			var has_uv := UV0.size() == V.size()
			var has_col := COL.size() == V.size()
			var tri_cnt := (IDX.size() if not IDX.is_empty() else V.size()) / 3

			var ind_v := PackedVector3Array()
			var ind_n := PackedVector3Array()
			var ind_uv := PackedVector2Array()
			var ind_uv2 := PackedVector2Array()
			var ind_col := PackedColorArray()
			var ext_idx := PackedInt32Array()

			# Subdivide large planar room shell tris 1 pass so corner creases stay crisp and fast (<1.5 s)
			var subdiv_d := 1 if (bname.begins_with("wall") or bname.begins_with("paving") or bname.begins_with("wood") or bname.begins_with("v-stone") or bname.begins_with("v-paving")) else 0
			var empty_b := PackedFloat32Array()

			for t in tri_cnt:
				var i0 := IDX[t * 3] if not IDX.is_empty() else (t * 3)
				var i1 := IDX[t * 3 + 1] if not IDX.is_empty() else (t * 3 + 1)
				var i2 := IDX[t * 3 + 2] if not IDX.is_empty() else (t * 3 + 2)
				var va := V[i0]; var vb := V[i1]; var vc := V[i2]
				var na := N[i0] if has_n else Vector3.UP
				var nb := N[i1] if has_n else Vector3.UP
				var nc := N[i2] if has_n else Vector3.UP
				var fn := (na + nb + nc).normalized()
				var ctr := (va + vb + vc) * (1.0 / 3.0) + org_v
				var ri := _match_room(ridx, ctr, fn, pure_indoor)
				if ri >= 0 or pure_indoor:
					var rm_b: PackedFloat32Array = entries[ri]["b"] if ri >= 0 else empty_b
					var rm_u: float = float(entries[ri]["u"]) if ri >= 0 else fb_u
					var uva := UV0[i0] if has_uv else Vector2.ZERO
					var uvb := UV0[i1] if has_uv else Vector2.ZERO
					var uvc := UV0[i2] if has_uv else Vector2.ZERO
					var ca := COL[i0] if has_col else Color.WHITE
					var cb := COL[i1] if has_col else Color.WHITE
					var cc := COL[i2] if has_col else Color.WHITE
					_append_shell_tri(va, vb, vc, na, nb, nc, uva, uvb, uvc, ca, cb, cc, org_v, rm_b, rm_u, subdiv_d if ri >= 0 else 0, ind_v, ind_n, ind_uv, ind_uv2, ind_col)
				else:
					ext_idx.append(i0); ext_idx.append(i1); ext_idx.append(i2)

			if ind_v.is_empty():
				continue
			split_buckets += 1
			indoor_tris += ind_v.size() / 3
			for c_chk in ind_col:
				corner_ao_min = minf(corner_ao_min, c_chk.a)
				corner_ao_max = maxf(corner_ao_max, c_chk.a)

			var src_mat: Material = mi.material_override if mi.material_override != null else mi.mesh.surface_get_material(0)
			var imat: ShaderMaterial
			if shell_mat_cache.has(src_mat):
				imat = shell_mat_cache[src_mat]
			else:
				imat = _make_interior_material(src_mat, room_tex, false, mat_list)
				shell_mat_cache[src_mat] = imat

			# Group indoor shell triangles into 36m x 10m x 36m spatial cells so frustum culling and
			# local OmniLight3D dual-paraboloid shadows only process the active room's local ~6k-tri slice.
			var tri_out := ind_v.size() / 3
			var cell_map := {}
			for ti in tri_out:
				var base_v := ti * 3
				var mc := (ind_v[base_v] + ind_v[base_v + 1] + ind_v[base_v + 2]) * (1.0 / 3.0)
				var ckey := Vector3i.ZERO if tri_out <= 1500 else Vector3i(int(floor(mc.x / 36.0)), int(floor(mc.y / 10.0)), int(floor(mc.z / 36.0)))
				if not cell_map.has(ckey):
					cell_map[ckey] = []
				(cell_map[ckey] as Array).append(ti)

			var can_cast := not (bname.begins_with("paving") or bname.begins_with("rug"))
			var ci_idx := 0
			for ckey in cell_map:
				var tris_in_cell: Array = cell_map[ckey]
				var nv_cell := tris_in_cell.size() * 3
				var cv := PackedVector3Array(); cv.resize(nv_cell)
				var cn := PackedVector3Array(); cn.resize(nv_cell)
				var cuv := PackedVector2Array(); cuv.resize(nv_cell)
				var cuv2 := PackedVector2Array(); cuv2.resize(nv_cell)
				var ccol := PackedColorArray(); ccol.resize(nv_cell)
				for k_t in tris_in_cell.size():
					var src_b: int = int(tris_in_cell[k_t]) * 3
					var dst_b := k_t * 3
					for s_k in 3:
						cv[dst_b + s_k] = ind_v[src_b + s_k]
						cn[dst_b + s_k] = ind_n[src_b + s_k]
						cuv[dst_b + s_k] = ind_uv[src_b + s_k]
						cuv2[dst_b + s_k] = ind_uv2[src_b + s_k]
						ccol[dst_b + s_k] = ind_col[src_b + s_k]
				var s_arr := []
				s_arr.resize(Mesh.ARRAY_MAX)
				s_arr[Mesh.ARRAY_VERTEX] = cv
				s_arr[Mesh.ARRAY_NORMAL] = cn
				s_arr[Mesh.ARRAY_TEX_UV] = cuv
				s_arr[Mesh.ARRAY_TEX_UV2] = cuv2
				s_arr[Mesh.ARRAY_COLOR] = ccol
				var imesh := ArrayMesh.new()
				imesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, s_arr)

				var imi := MeshInstance3D.new()
				imi.name = "indoor_%s_%d" % [mi.name, ci_idx]
				ci_idx += 1
				imi.mesh = imesh
				imi.material_override = imat
				imi.layers = INDOOR_LAYER
				imi.visibility_range_end = 160.0
				imi.visibility_range_end_margin = 16.0
				imi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON if can_cast else GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
				imi.set_meta("krator", km)
				if mi.has_meta("krator_record_ids"):
					imi.set_meta("krator_record_ids", mi.get_meta("krator_record_ids"))
				shells_root.add_child(imi)

			if ext_idx.is_empty():
				mi.visible = false
			elif mixed_indoor:
				ext_kept_tris += ext_idx.size() / 3
				var earr := arr.duplicate()
				earr[Mesh.ARRAY_INDEX] = ext_idx
				earr[Mesh.ARRAY_TANGENT] = null
				var emesh := ArrayMesh.new()
				emesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, earr)
				mi.mesh = emesh

	var indoor_nodes: Array = []
	for sc in shells_root.get_children():
		indoor_nodes.append(sc)

	# Upgrade indoor furniture MultiMeshes directly via fmm.buffer (works identically in headless & GPU servers)
	var furn_indoor_inst := 0
	var furn_outdoor_inst := 0
	var m_items := mon.get_node_or_null("Items")
	if m_items != null:
		var item_children := m_items.get_children()
		for ch in item_children:
			if not (ch is MultiMeshInstance3D):
				continue
			var km_i: Dictionary = (ch as Node).get_meta("krator", {}) if (ch as Node).has_meta("krator") else {}
			if str(km_i.get("kit", "")) != "furniture":
				continue
			var fmmi := ch as MultiMeshInstance3D
			var fmm := fmmi.multimesh
			if fmm == null or fmm.instance_count <= 0:
				continue
			var n_inst := fmm.instance_count
			var had_col := fmm.use_colors
			var had_cus := fmm.use_custom_data
			var fstride := 12 + (4 if had_col else 0) + (4 if had_cus else 0)
			var fbuf := fmm.buffer
			if fbuf.size() < n_inst * fstride:
				continue

			var in_rows := PackedInt32Array()
			var in_ru := PackedFloat32Array()
			var in_fao := PackedFloat32Array()
			var out_rows := PackedInt32Array()
			for i in n_inst:
				var fo := i * fstride
				var pos := Vector3(fbuf[fo + 3], fbuf[fo + 7], fbuf[fo + 11])
				# Probe at +0.20 m (and -0.25 m fallback for ceiling-hung lamps) with zero normal so ceiling fixtures match
				var ri_f := _match_room(ridx, pos + org_v + Vector3(0.0, 0.20, 0.0), Vector3.ZERO, false)
				if ri_f < 0:
					ri_f = _match_room(ridx, pos + org_v - Vector3(0.0, 0.25, 0.0), Vector3.ZERO, false)
				if ri_f >= 0:
					var rb: PackedFloat32Array = entries[ri_f]["b"]
					var ru := float(entries[ri_f]["u"])
					var fao := vertex_corner_ao(pos + org_v + Vector3(0.0, 0.25, 0.0), Vector3(0.0, 0.4, 0.0), rb, 0.85)
					in_rows.append(i)
					in_ru.append(ru)
					in_fao.append(clampf(fao + 0.12, 0.65, 1.0))
				else:
					out_rows.append(i)

			if in_rows.is_empty():
				furn_outdoor_inst += out_rows.size()
				continue
			furn_indoor_inst += in_rows.size()
			furn_outdoor_inst += out_rows.size()

			var fsrc: Material = fmmi.material_override
			if fsrc == null and fmm.mesh != null and fmm.mesh.get_surface_count() > 0:
				fsrc = fmm.mesh.surface_get_material(0)
			var fmat: ShaderMaterial
			if furn_mat_cache.has(fsrc):
				fmat = furn_mat_cache[fsrc]
			else:
				fmat = _make_interior_material(fsrc, room_tex, true, mat_list)
				furn_mat_cache[fsrc] = fmat

			# Split out any outdoor Debate Court instances onto a small outdoor sibling MultiMesh
			if not out_rows.is_empty():
				var omm := MultiMesh.new()
				omm.transform_format = MultiMesh.TRANSFORM_3D
				omm.use_colors = had_col
				omm.use_custom_data = had_cus
				omm.mesh = fmm.mesh
				omm.instance_count = out_rows.size()
				var obuf := PackedFloat32Array()
				obuf.resize(out_rows.size() * fstride)
				var opts := PackedVector3Array()
				opts.resize(out_rows.size())
				for oi in out_rows.size():
					var s0 := out_rows[oi] * fstride
					var d0 := oi * fstride
					for q in fstride:
						obuf[d0 + q] = fbuf[s0 + q]
					opts[oi] = Vector3(fbuf[s0 + 3], fbuf[s0 + 7], fbuf[s0 + 11])
				omm.buffer = obuf
				var ommi := MultiMeshInstance3D.new()
				ommi.name = fmmi.name + "_outdoor"
				ommi.multimesh = omm
				ommi.material_override = fmmi.material_override
				ommi.layers = 1
				ommi.visibility_range_end = fmmi.visibility_range_end
				ommi.visibility_range_end_margin = fmmi.visibility_range_end_margin
				ommi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
				ommi.set_meta("furn_pts", opts)
				ommi.set_meta("krator", km_i)
				m_items.add_child(ommi)

			var dst_stride := 12 + (4 if had_col else 0) + 4
			var c_off := 12 + (4 if had_col else 0)
			var f_cells := {}
			for ii in in_rows.size():
				var s0 := in_rows[ii] * fstride
				var fp_v := Vector3(fbuf[s0 + 3], fbuf[s0 + 7], fbuf[s0 + 11])
				var fck := Vector3i.ZERO if in_rows.size() <= 350 else Vector3i(int(floor(fp_v.x / 36.0)), int(floor(fp_v.y / 12.0)), int(floor(fp_v.z / 36.0)))
				if not f_cells.has(fck):
					f_cells[fck] = []
				(f_cells[fck] as Array).append(ii)

			var fci := 0
			for fck in f_cells:
				var idxs_f: Array = f_cells[fck]
				var cnt_f := idxs_f.size()
				var ibuf := PackedFloat32Array()
				ibuf.resize(cnt_f * dst_stride)
				var ipts := PackedVector3Array()
				ipts.resize(cnt_f)
				for k_f in cnt_f:
					var ii_f: int = int(idxs_f[k_f])
					var s0 := in_rows[ii_f] * fstride
					var d0 := k_f * dst_stride
					for q in c_off:
						ibuf[d0 + q] = fbuf[s0 + q]
					ibuf[d0 + c_off] = in_ru[ii_f]
					ibuf[d0 + c_off + 1] = in_fao[ii_f]
					ibuf[d0 + c_off + 2] = 0.0
					ibuf[d0 + c_off + 3] = 0.0
					ipts[k_f] = Vector3(fbuf[s0 + 3], fbuf[s0 + 7], fbuf[s0 + 11])
				var t_mmi: MultiMeshInstance3D
				var t_mm: MultiMesh
				if fci == 0:
					t_mmi = fmmi
					t_mm = fmm
					t_mm.instance_count = 0
					t_mm.use_colors = had_col
					t_mm.use_custom_data = true
					t_mm.instance_count = cnt_f
				else:
					t_mm = MultiMesh.new()
					t_mm.transform_format = MultiMesh.TRANSFORM_3D
					t_mm.use_colors = had_col
					t_mm.use_custom_data = true
					t_mm.mesh = fmm.mesh
					t_mm.instance_count = cnt_f
					t_mmi = MultiMeshInstance3D.new()
					t_mmi.name = "%s_cell_%d" % [fmmi.name, fci]
					t_mmi.multimesh = t_mm
					t_mmi.set_meta("krator", km_i)
					m_items.add_child(t_mmi)
				t_mm.buffer = ibuf
				t_mmi.material_override = fmat
				t_mmi.layers = INDOOR_LAYER
				t_mmi.visibility_range_end = 62.0
				t_mmi.visibility_range_end_margin = 10.0
				t_mmi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
				t_mmi.set_meta("furn_pts", ipts)
				indoor_nodes.append(t_mmi)
				fci += 1

	var ms := (Time.get_ticks_usec() - t0) / 1000.0
	var st := {
		"materials": mat_list,
		"nodes": indoor_nodes,
		"room_tex": room_tex,
		"u_by_id": u_by_id,
		"mask_sun": true,
		"stats": {
			"setup_ms": snappedf(ms, 0.1),
			"rooms": entries.size(),
			"split_buckets": split_buckets,
			"indoor_tris": indoor_tris,
			"exterior_kept_tris": ext_kept_tris,
			"furn_indoor_inst": furn_indoor_inst,
			"furn_outdoor_inst": furn_outdoor_inst,
			"corner_ao_min": snappedf(corner_ao_min, 0.001),
			"corner_ao_max": snappedf(corner_ao_max, 0.001),
		}
	}
	mon.set_meta("stage7_interiors", st)
	return st


# L4: the indoor shader with the room's light as the surface's own ambient (IRRADIANCE and RADIANCE) in place of
# emission: the same text with its ambient_light_disabled line replaced by the define its fragment() reads. Made once.
static func ambient_shader() -> Shader:
	if _ambient_shader == null:
		var code := INTERIOR_SHADER.code
		if code.contains(AMBIENT_OFF_LINE) and code.contains("#ifdef K_ROOM_AMBIENT"):
			_ambient_shader = Shader.new()
			_ambient_shader.code = code.replace(AMBIENT_OFF_LINE, "#define K_ROOM_AMBIENT")
		else:
			_ambient_shader = INTERIOR_SHADER
	return _ambient_shader


# every indoor material of a monastery onto the ambient variant, or back (krator/look.gd's room_ambient, through the
# stream). Returns how many it set
static func set_room_ambient(mon: Node3D, on: bool) -> int:
	if mon == null or not mon.has_meta("stage7_interiors"):
		return 0
	var st: Dictionary = mon.get_meta("stage7_interiors")
	var sh := ambient_shader() if on else INTERIOR_SHADER
	var n := 0
	for m in st.get("materials", []):
		var sm := m as ShaderMaterial
		if sm != null and (sm.shader == INTERIOR_SHADER or sm.shader == _ambient_shader):
			sm.shader = sh
			n += 1
	st["room_ambient"] = on
	return n


static func update_uniforms(mon: Node3D, sun_day_factor: float, lamp_amb_scale: float, mask_sun := true, use_corner_ao := true) -> void:
	if mon == null or not mon.has_meta("stage7_interiors"):
		return
	var st: Dictionary = mon.get_meta("stage7_interiors")
	var mats: Array = st.get("materials", [])
	for m in mats:
		var sm := m as ShaderMaterial
		if sm != null:
			sm.set_shader_parameter("sun_day_factor", sun_day_factor)
			sm.set_shader_parameter("lamp_amb_scale", lamp_amb_scale)
			sm.set_shader_parameter("use_corner_ao", use_corner_ao)
	if bool(st.get("mask_sun", true)) != mask_sun:
		st["mask_sun"] = mask_sun
		var want_layer := INDOOR_LAYER if mask_sun else (1 | INDOOR_LAYER)
		for nd in st.get("nodes", []):
			if nd is VisualInstance3D:
				(nd as VisualInstance3D).layers = want_layer


# Exact GDScript twin of KROOMLIGHT.pickPool (Stage 7 I3: room-gated near-light pool + 2 shadowed hero lamps)
static func pick_pool(
	imeta: Dictionary,
	M: Dictionary,
	lp: Vector3,
	room_id: String,
	sun_up: float,
	max_lights: int,
	hero_shadows := 2
) -> Array:
	var rtab: Dictionary = imeta.get("room_table", {})
	var by_id: Dictionary = rtab.get("byId", {})
	if room_id == "" or not by_id.has(room_id):
		return []
	var row: Dictionary = by_id[room_id]
	var allowed := {room_id: 1}
	for p in row.get("portals", []):
		var pid := str(p)
		if not allowed.has(pid):
			allowed[pid] = 2

	var mat_at: Array = M.get("at", [0.0, 0.0, 0.0])
	var m_orig := Vector3(float(mat_at[0]), float(mat_at[1]), float(mat_at[2]))
	var ry := float(M.get("ry", 0.0))
	var m_rot := Basis(Vector3.UP, ry)
	var Ldict: Dictionary = imeta.get("lights", {})
	var night_k := 1.0 - clampf(sun_up, 0.0, 1.0)

	var w_cand := []
	if sun_up > 0.06 and not bool(row.get("vault", false)):
		for wl in Ldict.get("windows", []):
			if not (wl is Array) or (wl as Array).size() < 4:
				continue
			var wr := str(wl[3])
			if not allowed.has(wr):
				continue
			var tier: int = int(allowed[wr])
			var wp := Vector3(float(wl[0]), float(wl[1]), float(wl[2]))
			# optional [4] aperture (the open share: a jali), [5] sky (1: a skylight, a column of light down from wp):
			# as core/interiors/10-core-roomlight.js pickPool; a 4-element window is what it was
			var ap := float(wl[4]) if (wl as Array).size() > 4 else 1.0
			var sky := (wl as Array).size() > 5 and int(wl[5]) == 1
			var d2 := wp.distance_squared_to(lp)
			if sky:
				var up := maxf(0.0, lp.y - wp.y)
				d2 = (wp.x - lp.x) * (wp.x - lp.x) + up * up + (wp.z - lp.z) * (wp.z - lp.z)
				wp.y = minf(wp.y, lp.y + SKY_FILL)
			if d2 > 26.0 * 26.0:
				continue
			var pen := 1.0 if tier == 1 else 3.2
			w_cand.append({
				"score": d2 * pen,
				"reg_pos": m_orig + m_rot * wp,
				"color": Color(0.88, 0.93, 1.0),
				"energy": 1.25 * sun_up * (1.0 if tier == 1 else 0.55) * ap,
				"range": 15.0,
				"shadow": false,
				"kind": "window",
				"room": wr,
			})
		w_cand.sort_custom(func(a, b): return float(a["score"]) < float(b["score"]))

	var chosen := []
	var max_w := mini(4, max_lights / 2)
	for wi in mini(max_w, w_cand.size()):
		chosen.append(w_cand[wi])

	var eff_night := maxf(night_k, clampf(1.0 - float(row.get("daylight", 0.0)) * 4.0, 0.0, 1.0))
	var l_cand := []
	for rl in Ldict.get("lamps", []):
		if not (rl is Array) or (rl as Array).size() < 6:
			continue
		var lr := str(rl[5])
		if not allowed.has(lr):
			continue
		var ltier: int = int(allowed[lr])
		var rp := Vector3(float(rl[0]), float(rl[1]), float(rl[2]))
		var ld2 := rp.distance_squared_to(lp)
		if ld2 > 28.0 * 28.0:
			continue
		var amp := float(rl[3])
		var lrng := maxf(7.5, float(rl[4]) * 1.18)
		var lpen := 0.5 if ltier == 1 else 2.8
		l_cand.append({
			"score": ld2 * lpen / maxf(0.35, amp),
			"in_eye_room": ltier == 1,
			"reg_pos": m_orig + m_rot * rp,
			"color": Color(1.0, 0.76, 0.44),
			"energy": amp * (0.78 + 1.15 * eff_night) * (1.0 if ltier == 1 else 0.6),
			"range": lrng,
			"shadow": false,
			"kind": "lamp",
			"room": lr,
		})
	l_cand.sort_custom(func(a, b): return float(a["score"]) < float(b["score"]))

	var rem := maxi(0, max_lights - chosen.size())
	var shad_left := hero_shadows
	for qi in mini(rem, l_cand.size()):
		var pick: Dictionary = l_cand[qi]
		if bool(pick["in_eye_room"]) and shad_left > 0:
			pick["shadow"] = true
			pick["reg_pos"] = (pick["reg_pos"] as Vector3) - Vector3(0.0, 0.24, 0.0)
			shad_left -= 1
		chosen.append(pick)
	return chosen
