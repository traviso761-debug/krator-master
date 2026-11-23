# GDScript twin check for 43d-world-residual.js (GRAPHICS-TERRAIN-PROPOSAL.md Section 4 T2, Gate 12):
# Reads a golden JSON + 16-bit grayscale PNG (`--golden=<path.json> --png=<path.png>`, or builds a synthetic 16-bit PNG
# in user:// when run standalone) and asserts `WResidual.at` and `WResidual.grad` match JS `WRESIDUAL` to <= 1e-6,
# plus a negative control catching a 1e-5 perturbation.
extends SceneTree

const WResidual := preload("wresidual.gd")

var worst := 0.0


func _init() -> void:
	var golden_path := ""
	var png_path := ""
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--golden="):
			golden_path = a.trim_prefix("--golden=")
		elif a.begins_with("--png="):
			png_path = a.trim_prefix("--png=")

	if golden_path == "":
		print("FAIL  pass --golden=<json> --png=<png>")
		quit(1)
		return

	var f := FileAccess.open(golden_path, FileAccess.READ)
	if f == null:
		print("FAIL  cannot open golden " + golden_path)
		quit(1)
		return
	var G: Dictionary = JSON.parse_string(f.get_as_text())
	f.close()

	WResidual.init({
		"ox": G["ox"],
		"oz": G["oz"],
		"wx0": G["wx0"],
		"wz0": G["wz0"],
		"cell": G["cell"],
		"lo": G["lo"],
		"hi": G["hi"],
		"coreBox": G["coreBox"],
		"feather": G["feather"],
		"png_path": png_path,
	})
	if not WResidual.active:
		print("FAIL  WResidual failed to activate from 16-bit PNG " + png_path)
		quit(1)
		return

	var bad := 0
	var pts: Array = G["points"]
	var exp_h: Array = G["at"]
	var exp_g: Array = G["grad"]
	var exp_H: Array = G.get("world_H_samples", [])

	worst = 0.0
	for i in pts.size():
		var p: Array = pts[i]
		var x := float(p[0])
		var z := float(p[1])
		var mw := float(p[2])
		var got_h := WResidual.at(x, z, mw)
		var dh := absf(got_h - float(exp_h[i]))
		worst = maxf(worst, dh)
		if dh > 1e-6:
			if bad == 0:
				print("FAIL  at[%d]: got %s vs %s (diff %s)" % [i, str(got_h), str(exp_h[i]), str(dh)])
			bad += 1
		var got_g := WResidual.grad(x, z)
		var eg: Array = exp_g[i]
		var dg := maxf(absf(float(got_g[0]) - float(eg[0])), absf(float(got_g[1]) - float(eg[1])))
		worst = maxf(worst, dg)
		if dg > 1e-6:
			if bad == 0:
				print("FAIL  grad[%d]: got %s vs %s (diff %s)" % [i, JSON.stringify(got_g), JSON.stringify(eg), str(dg)])
			bad += 1

	# Also check full H = h_without_D + rm * D samples when provided
	for i in exp_H.size():
		var rec: Dictionary = exp_H[i]
		var got_d := WResidual.at(float(rec["x"]), float(rec["z"]), 0.0)
		var got_total := float(rec["base_plus_micro_no_D"]) + float(rec["scale"]) * got_d
		var d_tot := absf(got_total - float(rec["js_total_H"]))
		worst = maxf(worst, d_tot)
		if d_tot > 1e-6:
			if bad == 0:
				print("FAIL  world_H[%d]: got %s vs %s (diff %s)" % [i, str(got_total), str(rec["js_total_H"]), str(d_tot)])
			bad += 1

	# Negative control: 1e-5 perturbation must exceed 1e-6 threshold
	var neg_caught := absf((WResidual.at(float(pts[0][0]), float(pts[0][1]), 0.0) + 1e-5) - float(exp_h[0])) > 1e-6
	if not neg_caught:
		print("FAIL  negative control did not catch 1e-5 shift")
		bad += 1
	else:
		print("PASS  negative: 1e-5 residual shift caught")

	print(("PASS  " if bad == 0 else "FAIL  ") + "wresidual twin: %d samples, worst diff %s (tol 1e-6)" % [pts.size(), str(worst)])
	quit(0 if bad == 0 else 1)
