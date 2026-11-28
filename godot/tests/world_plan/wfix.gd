# GDScript twin of core/world/48f-world-fixtures.js (`WFIX`, [G data], PLAN-SETPIECES.md section 1).
# Reads baked open-world setpiece fixtures (`plan.fixtures`), oriented slot boxes, overlap rules, season checks,
# and plan structural verification (`check`).
extends RefCounted

const WWHaz := preload("whaz.gd")


static func of(plan: Dictionary) -> Dictionary:
	var ver := int(plan.get("version", 1))
	if ver < 3 and not plan.has("fixtures"):
		return {"fixtures": [], "uncut": []}
	return {
		"fixtures": plan.get("fixtures", []),
		"uncut": plan.get("uncut", [])
	}


static func in_season(fix: Dictionary, yd: int) -> bool:
	if not fix.has("season") or fix.get("season") == null:
		return true
	return WWHaz.in_season(fix, yd)


static func box_corners(r: Dictionary, pad: float = 0.0) -> Array:
	var ry := float(r.get("ry", 0.0))
	var c := cos(ry)
	var s := sin(ry)
	var hw := float(r.get("w", 1.0)) * 0.5 + pad
	var hd := float(r.get("d", 1.0)) * 0.5 + pad
	var ux := c * hw
	var uz := -s * hw
	var vx := s * hd
	var vz := c * hd
	var rx := float(r.get("x", 0.0))
	var rz := float(r.get("z", 0.0))
	return [
		[rx - ux - vx, rz - uz - vz],
		[rx + ux - vx, rz + uz - vz],
		[rx + ux + vx, rz + uz + vz],
		[rx - ux + vx, rz - uz + vz]
	]


static func boxes_overlap(a: Dictionary, b: Dictionary, gap: float = 0.0) -> bool:
	var g := gap * 0.5
	var A := box_corners(a, g)
	var B := box_corners(b, g)
	var rya := float(a.get("ry", 0.0))
	var ryb := float(b.get("ry", 0.0))
	var axes := [
		[cos(rya), -sin(rya)],
		[sin(rya), cos(rya)],
		[cos(ryb), -sin(ryb)],
		[sin(ryb), cos(ryb)]
	]
	for ax in axes:
		var a0 := 1e18
		var a1 := -1e18
		var b0 := 1e18
		var b1 := -1e18
		for q in A:
			var t := float(q[0]) * float(ax[0]) + float(q[1]) * float(ax[1])
			a0 = minf(a0, t)
			a1 = maxf(a1, t)
		for q in B:
			var t := float(q[0]) * float(ax[0]) + float(q[1]) * float(ax[1])
			b0 = minf(b0, t)
			b1 = maxf(b1, t)
		if a1 <= b0 + 1e-6 or b1 <= a0 + 1e-6:
			return false
	return true


static func check(plan: Dictionary) -> Dictionary:
	var problems := []
	var F: Array = plan.get("fixtures", [])
	var seen := {}
	var slots_n := 0
	for fx in F:
		if not (fx is Dictionary):
			continue
		var fid := str(fx.get("id", ""))
		if seen.has(fid):
			problems.append(fid + ": duplicate fixture")
		seen[fid] = true
		var slots: Array = fx.get("slots", [])
		if slots.is_empty():
			problems.append(fid + ": no slots")
			continue
		slots_n += slots.size()
		if str(fx.get("on", "ground")) == "tube" and fx.get("tube") is Dictionary:
			var tb: Dictionary = fx.get("tube")
			var anch: Dictionary = fx.get("anchor", {})
			var ay := float(anch.get("y", 0.0))
			var gy := float(tb.get("ground", 0.0))
			if ay >= gy - 1.0:
				problems.append(fid + ": tube fixture floor is not underground")
			if tb.has("ceiling") and tb.get("ceiling") != null and float(tb.get("ceiling")) > gy - 0.5:
				problems.append(fid + ": tube roof breaches surface")
		var non_wall := []
		for sl in slots:
			if sl is Dictionary and not bool(sl.get("wall", false)) and not bool(sl.get("ceiling", false)):
				non_wall.append(sl)
		var ov := 0
		for i in non_wall.size():
			for j in range(i + 1, non_wall.size()):
				if boxes_overlap(non_wall[i], non_wall[j], 0.05):
					ov += 1
		if ov > 0:
			problems.append(fid + ": " + str(ov) + " overlapping slots")
	return {"ok": problems.is_empty(), "problems": problems, "counts": {"fixtures": F.size(), "slots": slots_n}}
