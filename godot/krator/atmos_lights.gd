# Runs the atmosphere's lights from the Atmos clock: each child light carries meta "hours" ([on, off]) and a base
# energy; braziers flicker, searchlights sweep, beacons spin. Built by krator/atmos_import.gd.
extends Node3D


func _process(_d: float) -> void:
	var h: float = Atmos.hour
	var t: float = Atmos.t
	for c in get_children():
		if not (c is Light3D):
			continue
		var l := c as Light3D
		var hours: Array = l.get_meta("hours", [0, 0])
		var k: float = Atmos.glow_lit(h, float(hours[0]), float(hours[1]))   # the beacon (on 0) always, the rest by their hours
		var e: float = l.get_meta("energy", 1.0) * k
		match l.get_meta("kind", ""):
			"brazier":
				e *= 0.85 + 0.15 * sin(t * 11.0 + l.position.x) * sin(t * 7.3 + l.position.z)
			"searchlight":
				var base: float = l.get_meta("heading", 0.0)
				var sweep: float = l.get_meta("sweep", 0.0)
				l.rotation.y = -(base + sweep * sin(t * 0.25 + l.position.x * 0.01)) - PI * 0.5
			"beacon":
				l.rotation.y = t * float(l.get_meta("spin", 1.0))
		l.light_energy = e
		l.visible = k > 0.001
