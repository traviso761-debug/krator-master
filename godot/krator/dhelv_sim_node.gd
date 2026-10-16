# The dhelv case's frame: the ramblers posed by KSim.pose at the motion time, and the navigation agent walking from the
# outpost's gate to the temple on the baked mesh (back to the gate when it arrives, and again).
extends Node3D

var model := {}
var people: MultiMesh = null
var t := 0.0
var rate := 1.0
var walker: CharacterBody3D = null
var agent: NavigationAgent3D = null
var goal := Vector3.ZERO
var home := Vector3.ZERO
var speed := 1.4
var _armed := false


func _ready() -> void:
	if walker:
		home = walker.position


func _process(delta: float) -> void:
	t += delta * rate
	if people and not model.is_empty():
		var A: Array = model["actors"]
		for i in A.size():
			var o := KSim.pose(model, A[i], t)
			if o["hidden"]:
				people.set_instance_transform(i, Transform3D(Basis().scaled(Vector3.ZERO), Vector3.ZERO))
				continue
			people.set_instance_transform(i, Transform3D(Basis(Vector3.UP, o["h"]), Vector3(o["x"], o["y"] + 0.83, o["z"])))
			people.set_instance_color(i, Color(0.9, 0.75, 0.4) if o["moving"] else Color(0.55, 0.5, 0.45))


func _physics_process(delta: float) -> void:
	if not agent or not walker:
		return
	if not _armed:   # the map has synced once the agent's path is asked on a later frame
		if NavigationServer3D.map_get_iteration_id(agent.get_navigation_map()) < 2:
			return
		agent.target_position = goal
		_armed = true
		return
	if agent.is_navigation_finished():
		var back := home if walker.position.distance_to(goal) < 3.0 else goal
		agent.target_position = back
		return
	var nxt := agent.get_next_path_position()
	var d := nxt - walker.position
	if d.length() > 0.01:
		walker.position += d.normalized() * minf(d.length(), speed * rate * delta)
		walker.rotation.y = atan2(d.x, d.z)
