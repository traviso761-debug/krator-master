# GDScript twin of core/world/48h-world-hazards.js (`WHAZ`, [G data], PLAN-HAZARDS.md section 5).
# Evaluates baked open-world site-plan hazards (`plan.hazards`) and way closures (`plan.hazardWays`):
# seasons (including wrap-around winter windows), shape containment & falloff (`sphere`, `cyl`, `box`, `poly`, `front`),
# breakable crusts + `KHAZ.under` pairs, and `exclude_hunter` secrecy for untriggered Stalker triads.
extends RefCounted

const YEAR := 365
const START := 259


static func year_day(clock_day: float) -> int:
	return posmod(START + int(floor(clock_day)), YEAR)


static func _in_range(a: int, b: int, d: int) -> bool:
	return (d >= a and d <= b) if a <= b else (d >= a or d <= b)


static func _r4(v: float) -> float:
	return round(v * 10000.0) / 10000.0


static func in_season(rec: Dictionary, yd: int) -> bool:
	var s = rec.get("season")
	if s == null or not (s is Dictionary):
		return true
	var days = s.get("days")
	if days is Array:
		for r in days:
			if r is Array and r.size() >= 2 and _in_range(int(r[0]), int(r[1]), yd):
				return true
		return false
	return true


static func way_open(plan: Dictionary, way_id: String, yd: int = 0) -> Dictionary:
	var ways: Array = plan.get("hazardWays", plan.get("ways", []))
	var closed := []
	for w in ways:
		if w is Dictionary and str(w.get("way", "")) == way_id and w.get("season") != null and in_season(w, yd):
			closed.append(w)
	return {"open": closed.is_empty(), "closedBy": closed}


static func _poly_dist(pts: Array, x: float, z: float) -> float:
	var inside := false
	var best := 1e18
	var n := pts.size()
	var j := n - 1
	for i in n:
		var xi := float(pts[i][0])
		var zi := float(pts[i][1])
		var xj := float(pts[j][0])
		var zj := float(pts[j][1])
		var dz := zj - zi
		if (zi > z) != (zj > z):
			var denom := dz if absf(dz) > 1e-12 else 1e-12
			if x < (xj - xi) * (z - zi) / denom + xi:
				inside = not inside
		var ex := xj - xi
		var ez := zj - zi
		var l2 := ex * ex + ez * ez
		if l2 <= 0.0:
			l2 = 1.0
		var t := clampf(((x - xi) * ex + (z - zi) * ez) / l2, 0.0, 1.0)
		var d := Vector2(x - xi - ex * t, z - zi - ez * t).length()
		if d < best:
			best = d
		j = i
	return best if inside else -best


static func inside_shape(rec: Dictionary, x: float, z: float, has_y: bool = false, y: float = 0.0) -> float:
	var h = rec.get("hazard")
	if not (h is Dictionary):
		return -1.0
	var front = h.get("front")
	if front is Dictionary and front.get("path") is Array and (front.get("path") as Array).size() >= 2:
		var P: Array = front.get("path")
		var w := float(front.get("w", 50.0))
		var best := 1e18
		for i in range(1, P.size()):
			var a: Array = P[i - 1]
			var b: Array = P[i]
			var ex := float(b[0]) - float(a[0])
			var ez := float(b[2]) - float(a[2])
			var l2 := ex * ex + ez * ez
			if l2 <= 0.0:
				l2 = 1.0
			var t := clampf(((x - float(a[0])) * ex + (z - float(a[2])) * ez) / l2, 0.0, 1.0)
			var d := Vector2(x - float(a[0]) - ex * t, z - float(a[2]) - ez * t).length()
			if d < best:
				best = d
		return best / (w if w > 0.0 else 1.0) if best <= w else -1.0

	var sz = rec.get("size")
	var sh: Dictionary = h.get("shape") if h.get("shape") is Dictionary else {"type": "box" if sz is Array else "cyl"}
	var ry := float(rec.get("ry", 0.0))
	var c := cos(ry)
	var s := sin(ry)
	var at: Array = rec.get("at", [0.0, 0.0, 0.0])
	var dx := x - float(at[0])
	var dz := z - float(at[2])
	var lx := dx * c - dz * s
	var lz := dx * s + dz * c
	var def_h := float(rec.get("h")) if rec.has("h") and rec.get("h") != null else (float(sz[2]) if sz is Array and sz.size() >= 3 else 4.0)
	var hh := float(sh.get("h")) if sh.has("h") and sh.get("h") != null else def_h
	var y0 := float(sh.get("y0")) if sh.has("y0") and sh.get("y0") != null else 0.0
	var y1 := float(sh.get("y1")) if sh.has("y1") and sh.get("y1") != null else hh
	if has_y:
		var ly := y - float(at[1])
		if ly < y0 or ly > y1:
			return -1.0
	var stype := str(sh.get("type", "cyl"))
	if stype == "sphere":
		var r_def := float(rec.get("r")) if rec.has("r") and rec.get("r") != null else 4.0
		var R := float(sh.get("r")) if sh.has("r") and sh.get("r") != null else r_def
		var dy := (y - float(at[1])) if has_y else 0.0
		var d := Vector3(dx, dy, dz).length()
		return d / (R if R > 0.0 else 1.0) if d <= R else -1.0
	if stype == "box":
		var w_def := float(sz[0]) if sz is Array and sz.size() >= 1 else 4.0
		var d_def := float(sz[1]) if sz is Array and sz.size() >= 2 else 4.0
		var W2 := (float(sh.get("w")) if sh.has("w") and sh.get("w") != null else w_def) * 0.5
		var D2 := (float(sh.get("d")) if sh.has("d") and sh.get("d") != null else d_def) * 0.5
		if absf(lx) > W2 or absf(lz) > D2:
			return -1.0
		return maxf(absf(lx) / (W2 if W2 > 0.0 else 1.0), absf(lz) / (D2 if D2 > 0.0 else 1.0))
	if stype == "poly" and sh.get("pts") is Array and (sh.get("pts") as Array).size() >= 3:
		var sd := _poly_dist(sh.get("pts"), lx, lz)
		if sd < 0.0:
			return -1.0
		var edge := float(sh.get("edge")) if sh.has("edge") and sh.get("edge") != null else 2.0
		return maxf(0.0, 1.0 - sd / edge) if edge > 0.0 else 0.0
	var r_cyl_def := float(rec.get("r")) if rec.has("r") and rec.get("r") != null else 4.0
	var Rc := float(sh.get("r")) if sh.has("r") and sh.get("r") != null else r_cyl_def
	var dc := Vector2(dx, dz).length()
	return dc / (Rc if Rc > 0.0 else 1.0) if dc <= Rc else -1.0


static func _falloff_k(kind: String, f: float) -> float:
	if kind == "none":
		return 1.0
	if kind == "linear":
		return maxf(0.0, 1.0 - f)
	var k := clampf(f, 0.0, 1.0)
	return 1.0 - k * k * (3.0 - 2.0 * k)


static func at(plan: Dictionary, x: float, z: float, opts: Dictionary = {}) -> Array:
	var H: Array = plan.get("hazards", [])
	var has_yd := opts.has("yearDay") and opts.get("yearDay") != null
	var yd := int(opts.get("yearDay", 0))
	var has_y := opts.has("y") and opts.get("y") != null
	var y := float(opts.get("y", 0.0))
	var excl_hunter := bool(opts.get("excludeHunter", false))
	var broken: Dictionary = opts.get("brokenCrusts", {})
	var hits := []
	for r in H:
		if not (r is Dictionary):
			continue
		if has_yd and not in_season(r, yd):
			continue
		var rkind := str(r.get("kind", ""))
		if excl_hunter and rkind == "hunter":
			continue
		var f := inside_shape(r, x, z, has_y, y)
		if f < 0.0:
			continue
		var h: Dictionary = r.get("hazard", {})
		var state_k := 1.0
		var state := "on"
		var sfn := str(h.get("stateFn", ""))
		if sfn == "KHAZ.crust":
			var br := bool(broken.get(str(r.get("id", "")), false))
			state_k = 1.0 if br else 0.0
			state = "broken" if br else "intact"
		elif sfn == "KHAZ.under" and h.get("under") is Dictionary:
			var cid := str((h.get("under") as Dictionary).get("crust", ""))
			var br := bool(broken.get(cid, false))
			state_k = 1.0 if br else 0.0
			state = "on" if br else "held"
		var fk := _falloff_k(str(h.get("falloff", "none")), f)
		var danger := float(h.get("danger")) if h.has("danger") and h.get("danger") != null else 0.5
		var raw_dose := float(h.get("dose")) if h.has("dose") and h.get("dose") != null else 1.0
		hits.append({
			"id": str(r.get("id", "")),
			"kind": rkind,
			"danger": danger,
			"effDanger": _r4(danger * fk * state_k),
			"dose": _r4(raw_dose * fk * state_k),
			"f": _r4(f),
			"state": state,
			"rec": r
		})
	hits.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
		var de := float(b["effDanger"]) - float(a["effDanger"])
		if absf(de) > 1e-9:
			return de < 0.0
		return str(a["id"]) < str(b["id"])
	)
	return hits
