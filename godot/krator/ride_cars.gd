# Riding's cars in Godot (core/simulation/PLAN-RIDING.md section 7): each car an AnimatableBody3D (sync_to_physics) posed
# every physics frame by KRide.car_pose, the page's own function, its collision the car's walk records in its own frame
# (KWALKFRAME.export: floors as thin boxes, blocks as boxes; a door's block switched off and its step plate on inside the
# door window), each door a NavigationLink3D on the car enabled by the window (KRide.door_open). A CharacterBody3D standing
# on a car floor rides it by the platform velocity Godot applies; an NPC rides by KRide.pose.
#   var R := RideCars.build(M)       M: SIM.rideExportMotion's data with `walk` (the frames) and `ride` (the sources)
#   R.set_time(t)                    motion seconds: poses every car, switches its doors
class_name RideCars
extends Node3D

var M: Dictionary
var cars := []   # [{body, si, k, doors: {id: {block: CollisionShape3D, plate: CollisionShape3D, link: NavigationLink3D}}}]


static func _box(parent: Node, x0: float, x1: float, y0: float, y1: float, z0: float, z1: float) -> CollisionShape3D:
	var s := CollisionShape3D.new()
	var b := BoxShape3D.new()
	b.size = Vector3(absf(x1 - x0), maxf(absf(y1 - y0), 0.02), absf(z1 - z0))
	s.shape = b
	s.position = Vector3((x0 + x1) / 2.0, (y0 + y1) / 2.0, (z0 + z1) / 2.0)
	parent.add_child(s)
	return s


static func build(data: Dictionary) -> RideCars:
	var R := RideCars.new()
	R.name = "RideCars"
	R.M = data
	var idx := {}
	var srcs: Array = data["ride"]["sources"]
	for i in srcs.size():
		idx[srcs[i]["id"]] = i
	for F in data["walk"]["frames"]:
		var src = F.get("source")
		if not (src is Dictionary) or not idx.has(src["ride"]):
			continue
		var si: int = idx[src["ride"]]
		var k := int(src["k"])
		var body := AnimatableBody3D.new()
		body.name = String(F["id"]).replace(".", "_")
		body.sync_to_physics = true
		R.add_child(body)
		var doors := {}
		for f in F["floors"]:
			if f["kind"] != "rect":
				continue
			var r: Array = f["rect"]
			var sh := _box(body, r[0], r[1], float(f["y"]) - 0.1, float(f["y"]), r[2], r[3])
			if f.get("off", false):
				sh.disabled = true
			var nm := String(f.get("name", ""))
			if nm.begins_with("plate "):
				doors[nm.substr(6)] = {"plate": sh}
		for b in F["blocks"]:
			var bx: Array = b["box"]
			var sh := _box(body, bx[0], bx[1], bx[4], bx[5], bx[2], bx[3])
			var tg := String(b["tag"])
			if tg.begins_with("door:"):   # a door's block, tagged with its door's id
				var e: Dictionary = doors.get(tg.substr(5), {})
				e["block"] = sh
				doors[tg.substr(5)] = e
		for D in srcs[si]["cars"][k]["doors"]:
			var side := float(D["side"])
			var at: Array = D["at"]
			var link := NavigationLink3D.new()
			link.bidirectional = true
			link.start_position = Vector3(float(at[0]) + side * 0.6, float(at[1]), float(at[2]))
			link.end_position = Vector3(float(at[0]) - side * 0.45, float(at[1]), float(at[2]))
			link.enabled = false
			body.add_child(link)
			var e2: Dictionary = doors.get(String(D["id"]), {})
			e2["link"] = link
			doors[String(D["id"])] = e2
		R.cars.append({"body": body, "si": si, "k": k, "doors": doors})
	return R


func car_transform(si: int, k: int, t: float) -> Transform3D:
	var P := KRide.car_pose(M["ride"]["sources"][si], k, t)
	var basis := Basis(Vector3.UP, float(P["yaw"])) * Basis(Vector3.RIGHT, -float(P["pitch"]))
	return Transform3D(basis, Vector3(P["x"], P["y"], P["z"]))


func set_time(t: float) -> void:
	for c in cars:
		var body: AnimatableBody3D = c["body"]
		var T := car_transform(c["si"], c["k"], t)
		if body.is_inside_tree():
			body.global_transform = T
		else:
			body.transform = T   # before the tree is live (a test's _initialize): RideCars sits at the origin
		var S: Dictionary = M["ride"]["sources"][c["si"]]
		for id in c["doors"]:
			var e: Dictionary = c["doors"][id]
			var open := KRide.door_open(S, c["k"], id, t)
			if e.has("block"):
				(e["block"] as CollisionShape3D).disabled = open
			if e.has("plate"):
				(e["plate"] as CollisionShape3D).disabled = not open
			if e.has("link"):
				(e["link"] as NavigationLink3D).enabled = open
