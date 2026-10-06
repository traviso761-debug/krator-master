# Moves Verge's stand-in figures each frame: every member's pose from KratorVergeSim.pose at the motion time.
extends Node3D

var model := {}
var members := []   # [group index, copy, member index, MeshInstance3D]
var t := 0.0
var rate := 1.0


func _process(delta: float) -> void:
	t += delta * rate
	for e in members:
		var tau := KratorVergeSim.run_time(model, e[0], t, e[1])
		var o := KratorVergeSim.pose(model, e[0], e[2], tau)
		var n: MeshInstance3D = e[3]
		n.visible = o["vis"]
		if o["vis"]:
			n.position = Vector3(o["x"], o["y"] + 0.9, o["z"])
			n.rotation.y = o["yaw"]
