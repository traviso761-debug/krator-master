# core/door in Godot: KDOOR's records (its export(), `krator-doors`: kinds, pairs, styles) rebuilt as leaves, and KGLASS's
# glass kinds (`kglass:<kind>` materials) as StandardMaterial3D. The twin of core/door/10-core-door.js's KDOOR.leaves (every
# kind: swing, slide, lift with roll and drop, tilt, fold, iris, hatch, and the pairs) and 20-core-glass.js's SPEC;
# godot/tests/door/door_test.gd checks it against the page's own numbers (godot/tools/door_golden.js).
#   KDoor.leaves(rec, open, dir, swing)   every leaf's pose now: [{p: Vector3, ax: Vector3, ang, s: Vector3, size: Vector3}]
#   KDoor.build(doc, opts)                a Node3D "Doors": one Node3D a door (its meta "krator" the record), one MeshInstance3D a
#                                         leaf (a box of its shut size; a glazed style's light a pane in kglass 'clear' on it;
#                                         a hardware style's metal a thin plate each face), posed at the record's `open`
#   KDoor.pose(door_node, open, dir)      the leaves posed again at open (0..1; dir -1: a double-acting door swung the other way)
#   KDoor.glass_material(kind, opt)       the glass kind as a material (cached), from SPEC (or the export's own spec)
#   KDoor.SPEC                            KGLASS.SPEC (the colours are sRGB hex, as the page's)
# Axes: y up, metres, x east, z south (three's and Godot's frames agree); yaw the face's OUTWARD yaw.
class_name KDoor
extends RefCounted

const SWING := 1.75
const SPEC := {
	"clear": {"color": 0xb4ccd2, "opacity": 0.22, "roughness": 0.05, "metalness": 0.1, "emissive": 0x000000, "glow": 0.0, "transparent": true},
	"lit": {"color": 0xffd9a0, "opacity": 0.42, "roughness": 0.3, "metalness": 0.0, "emissive": 0xffb060, "glow": 0.55, "transparent": true},
	"frosted": {"color": 0xdfe7ea, "opacity": 0.62, "roughness": 0.75, "metalness": 0.0, "emissive": 0x000000, "glow": 0.0, "transparent": true},
	"smoked": {"color": 0x2a3a44, "opacity": 0.55, "roughness": 0.04, "metalness": 0.35, "emissive": 0x000000, "glow": 0.0, "transparent": true},
	"stained": {"color": 0x8a3a5a, "opacity": 0.5, "roughness": 0.2, "metalness": 0.0, "emissive": 0x000000, "glow": 0.15, "transparent": true},
	"room": {"color": 0x6e5a46, "opacity": 1.0, "roughness": 0.94, "metalness": 0.0, "emissive": 0x000000, "glow": 0.0, "transparent": false, "srgb": true},
}
# the leaf styles that carry a light of glass, and the ones with hardware (core/door/30-core-door-leaf.js)
const GLAZED := ["glazed", "half", "glass", "scrolled", "glazed+pull", "half+pull", "glazed+ring", "half+ring"]
const HARDWARE := ["banded", "scrolled"]

static var _glass_cache := {}


static func _ease(s: float) -> float:
	return s * s * (3.0 - 2.0 * s)


static func _rot_y(v: Vector3, a: float) -> Vector3:
	var c := cos(a)
	var s := sin(a)
	return Vector3(v.x * c + v.z * s, v.y, -v.x * s + v.z * c)


# Rodrigues' rotation of v about the unit axis k by a (as the page's rotAx)
static func _rot_ax(v: Vector3, k: Vector3, a: float) -> Vector3:
	var c := cos(a)
	var s := sin(a)
	return v * c + k.cross(v) * s + k * k.dot(v) * (1.0 - c)


static func _v(a: Variant) -> Vector3:
	return Vector3(float(a[0]), float(a[1]), float(a[2]))


static func _num(d: Dictionary, k: String, dflt: float) -> float:
	var v: Variant = d.get(k)
	return dflt if v == null else float(v)


static func swing_max(D: Dictionary, sw := SWING) -> float:
	if D.get("swing") != null:
		return float(D["swing"])
	return PI / 2.0 * 0.94 if D.get("kind", "swing") in ["fold", "tilt"] else sw


static func leaf_count(D: Dictionary) -> int:
	return (2 if D.get("kind") == "fold" else 1) * (2 if D.get("pair") == true else 1)


static func leaf_size(D: Dictionary) -> Vector3:
	var w := float(D["w"])
	var h := float(D["h"])
	var t := _num(D, "t", 0.07)
	var pair: bool = D.get("pair") == true
	if D.get("kind") == "lift" and pair:
		return Vector3(w, h / 2.0, t)
	if pair:
		w /= 2.0
	if D.get("kind") == "fold":
		w /= 2.0
	return Vector3(w, h, t)


# the record's leaf centre when shut (export's p0; a record without one: the sill raised half the height, a hatch's out from its edge)
static func p0_of(D: Dictionary) -> Vector3:
	if D.get("p0") != null:
		return _v(D["p0"])
	var at := _v(D["at"])
	var yaw := float(D.get("yaw", 0.0))
	if D.get("kind") == "hatch":
		return Vector3(at.x + sin(yaw) * float(D["h"]) / 2.0, at.y, at.z + cos(yaw) * float(D["h"]) / 2.0)
	return at + Vector3(0, float(D["h"]) / 2.0, 0)


static func _leaf(p: Vector3, ax: Vector3, ang: float, s: Vector3, size: Vector3) -> Dictionary:
	return {"p": p, "ax": ax, "ang": ang, "s": s, "size": size}


static func leaves(D: Dictionary, open: float, dir := 1.0, sw := SWING) -> Array:
	var e := _ease(open)
	var yaw := float(D.get("yaw", 0.0))
	var u := Vector3(cos(yaw), 0, -sin(yaw))
	var P0 := p0_of(D)
	var sz := leaf_size(D)
	var kind: String = D.get("kind", "swing")
	var pair: bool = D.get("pair") == true
	var w := float(D["w"])
	var h := float(D["h"])
	var one := Vector3.ONE
	var UP := Vector3.UP
	var out: Array = []
	if kind == "lift" and pair:
		var hh := h / 4.0
		var r2 := (h / 2.0 if D.get("rise") == null else float(D["rise"]) / 2.0) * e
		return [_leaf(P0 + Vector3(0, hh + r2, 0), UP, 0.0, one, sz), _leaf(P0 - Vector3(0, hh + r2, 0), UP, 0.0, one, sz)]
	var sides: Array = [-1.0, 1.0] if pair else [1.0 if _num(D, "sign", 1.0) < 0 else -1.0]
	var smax := swing_max(D, sw)
	for jv in sides:
		var j: float = jv
		var half := w / 2.0 if pair else w
		var c0: Vector3 = P0 + u * (w / 4.0 * j) if pair else P0
		var J: Vector3
		if pair:
			J = P0 + u * (w / 2.0 * j)
		elif kind == "swing":
			var hg := _v(D["hinge"])
			J = Vector3(hg.x, P0.y, hg.z)
		else:
			J = P0 + u * (half / 2.0 * j)
		var a := -j * dir * smax * e
		match kind:
			"swing":
				var v := _rot_y(Vector3(c0.x - J.x, 0, c0.z - J.z), a)
				out.append(_leaf(Vector3(J.x + v.x, c0.y, J.z + v.z), UP, a, one, sz))
			"slide":
				out.append(_leaf(c0 + u * (half * e * j), UP, 0.0, one, sz))
			"lift":
				var rise := (h if D.get("rise") == null else float(D["rise"])) * e * (-1.0 if D.get("drop") == true else 1.0)
				if D.get("roll") == true:
					var r := minf(e, 0.97)
					out.append(_leaf(c0 + Vector3(0, h * r / 2.0, 0), UP, 0.0, Vector3(1, 1 - r, 1), sz))
				else:
					out.append(_leaf(c0 + Vector3(0, rise, 0), UP, 0.0, one, sz))
			"tilt":
				var Hd := c0 + Vector3(0, h / 2.0, 0)
				var vt := Vector3(0, -h / 2.0, 0)
				var bt := smax * e
				var n := Vector3(sin(yaw), 0, cos(yaw))
				var sg := 1.0 if _rot_ax(vt, u, 0.1).dot(n) > 0 else -1.0
				out.append(_leaf(Hd + _rot_ax(vt, u, sg * bt), u, sg * bt, one, sz))
			"iris":
				var k := 1.0 - minf(e, 0.98)
				out.append(_leaf(c0, UP, 0.0, Vector3(k, k, 1), sz))
			"fold":
				var q := sz.x
				var v1 := _rot_y(Vector3(-j * u.x * q, 0, -j * u.z * q), a)
				var E := Vector3(J.x + v1.x, J.y, J.z + v1.z)
				var v2 := _rot_y(Vector3(-j * u.x * q, 0, -j * u.z * q), -a)
				out.append(_leaf(Vector3(J.x + v1.x / 2.0, J.y, J.z + v1.z / 2.0), UP, a, one, sz))
				out.append(_leaf(Vector3(E.x + v2.x / 2.0, E.y, E.z + v2.z / 2.0), UP, -a, one, sz))
			"hatch":
				var H := _v(D["at"])
				var vv := c0 - H
				var b := smax * e
				var up := 1.0 if _rot_ax(vv, u, 0.1).y > vv.y else -1.0
				out.append(_leaf(H + _rot_ax(vv, u, up * b), u, up * b, one, sz))
	return out


# a leaf's transform: its shut rotation (the face's yaw; a hatch lies in its floor, its height along the outward line), turned
# `ang` about `ax`, scaled to its size
static func leaf_transform(D: Dictionary, L: Dictionary) -> Transform3D:
	var q0 := Basis(Vector3.UP, float(D.get("yaw", 0.0)))
	if D.get("kind") == "hatch":
		q0 = q0 * Basis(Vector3.RIGHT, PI / 2.0)
	var ax: Vector3 = L["ax"]
	var b := (Basis(ax.normalized(), float(L["ang"])) * q0) if absf(float(L["ang"])) > 0.0 else q0
	var sz: Vector3 = L["size"]
	var s: Vector3 = L["s"]
	return Transform3D(b.scaled_local(Vector3(sz.x * s.x, sz.y * s.y, sz.z * s.z)), L["p"])


static func _hex(c: int) -> Color:
	return Color8((c >> 16) & 255, (c >> 8) & 255, c & 255)


# a glass kind as a StandardMaterial3D: alpha blending with the spec's opacity (the page sorts its panes after the opaque scene with
# depth writes off; Godot's alpha pass does the same), roughness and metalness, the glow as emission. 'room' is the opaque card.
static func glass_material(kind: String, opt := {}, spec := {}) -> StandardMaterial3D:
	var S: Dictionary = spec.get(kind, SPEC.get(kind, {}))
	if S.is_empty():
		push_warning("KDoor.glass_material: no kind " + kind)
		S = SPEC["clear"]
	var col: int = int(opt.get("color", S["color"]))
	var em: int = int(opt.get("emissive", col if int(S["emissive"]) == 0 else int(S["emissive"])))
	var key := "%s:%d:%d:%s" % [kind, col, em, S["opacity"]]
	if _glass_cache.has(key):
		return _glass_cache[key]
	var m := StandardMaterial3D.new()
	m.resource_name = "kglass:" + kind
	var c := _hex(col)
	m.roughness = float(S["roughness"])
	m.metallic = float(S["metalness"])
	if S.get("transparent", false):
		c.a = float(S["opacity"])
		m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		m.cull_mode = BaseMaterial3D.CULL_DISABLED
		m.depth_draw_mode = BaseMaterial3D.DEPTH_DRAW_OPAQUE_ONLY
	m.albedo_color = c
	if float(S.get("glow", 0.0)) > 0.0:
		m.emission_enabled = true
		m.emission = _hex(em)
		m.emission_energy_multiplier = float(S["glow"])
	m.set_meta("krator", {"kglass": kind})
	_glass_cache[key] = m
	return m


# a material name from an export: 'kglass:<kind>' (the page's KGLASS materials) is the glass kind; anything else null
static func material_for_name(name: String) -> Material:
	if not name.begins_with("kglass:"):
		return null
	var kind := name.substr(7)
	if kind == "room-lit":   # the room card lit at night (the Ancients' kit: its card's glow on, 8zo-anc-open.js)
		var m := glass_material("room").duplicate() as StandardMaterial3D
		m.resource_name = "kglass:room-lit"
		m.emission_enabled = true
		m.emission = _hex(0xffb060)
		m.emission_energy_multiplier = 1.1
		return m
	return glass_material(kind)


static func _leaf_mat(style: Variant) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = Color8(0x7a, 0x5a, 0x3e)
	m.roughness = 0.8
	m.resource_name = "door leaf " + str(style if style != null else "flat")
	return m


static func build(doc: Dictionary, opts := {}) -> Node3D:
	var root := Node3D.new()
	root.name = "Doors"
	var sw := float(doc.get("swing", SWING))
	var wood := _leaf_mat(null)
	var brass := StandardMaterial3D.new()
	brass.albedo_color = Color8(0xb8, 0x91, 0x3f)
	brass.metallic = 0.85
	brass.roughness = 0.32
	var box := BoxMesh.new()
	box.size = Vector3.ONE
	var pane := BoxMesh.new()
	pane.size = Vector3(0.74, 0.42, 0.12)
	var plate := BoxMesh.new()
	plate.size = Vector3(0.9, 0.05, 1.3)
	for D in doc["doors"]:
		var dn := Node3D.new()
		dn.name = String(D["id"]).replace(".", "_").replace("/", "_").replace(":", "_").replace("@", "_")
		dn.set_meta("krator", D)
		dn.set_meta("swing", sw)
		var st: Variant = D.get("style")
		var n := leaf_count(D)
		for i in n:
			var mi := MeshInstance3D.new()
			mi.name = "leaf_%d" % i
			mi.mesh = box
			mi.material_override = wood
			if st != null and String(st) in GLAZED:
				var g := MeshInstance3D.new()
				g.name = "glass"
				g.mesh = pane
				g.position = Vector3(0, 0.2, 0)
				g.material_override = glass_material("clear")
				mi.add_child(g)
			if st != null and (String(st) in HARDWARE or String(st).contains("+")):
				var hw := MeshInstance3D.new()
				hw.name = "hardware"
				hw.mesh = plate
				hw.material_override = brass
				mi.add_child(hw)
			dn.add_child(mi)
		pose(dn, float(D.get("open", 0.0)))
		root.add_child(dn)
	return root


static func pose(dn: Node3D, open: float, dir := 1.0) -> void:
	var D: Dictionary = dn.get_meta("krator")
	var LL := leaves(D, open, dir, float(dn.get_meta("swing", SWING)))
	for i in mini(LL.size(), dn.get_child_count()):
		(dn.get_child(i) as Node3D).transform = leaf_transform(D, LL[i])
