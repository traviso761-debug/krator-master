# THE ROWS PAST THEIR RANGE, NOT SUBMITTED (2026-10-27; the export-godot-cull note's "next lever"). A chunk node that culls by row
# (KratorWorld._lod_uniforms, lib/lod.gdshaderinc mode 1: every row measured from the chunk's box) holds its rows longest range
# first, so the rows still in range at a camera are a prefix: this sets each such node's MultiMesh.visible_instance_count to that
# prefix every frame, as three's lodTick sets an InstancedMesh's count. The rows past it were collapsed by the shader already (the
# same pixels); now their vertices do not run. Loose nodes (mode 2, measured per instance) and buckets keep the shader's cull alone.
# KratorWorld.build attaches one to each world; KRATOR_ROWPREFIX=0 leaves it off (an A/B).
class_name KLodPrefix
extends Node

var nodes: Array = []   # [MultiMeshInstance3D, box Vector4, y Vector4, r Vector4, e Vector4, count]
var shown := 0          # rows submitted at the last frame, over every node (perf_capture reads it)
var total := 0


# the nodes under `under` that cull by row from their chunk box (mode 1)
static func attach(root: Node3D, under: Node) -> KLodPrefix:
	var p := KLodPrefix.new()
	p.name = "LodPrefix"
	for n in under.get_children():
		var mmi := n as MultiMeshInstance3D
		if mmi == null or mmi.multimesh == null:
			continue
		var y = mmi.get_instance_shader_parameter("lod_y")
		if not (y is Vector4) or absf(y.w - 1.0) > 0.25:
			continue
		p.nodes.append([mmi, mmi.get_instance_shader_parameter("lod_box"), y, mmi.get_instance_shader_parameter("lod_r"),
			mmi.get_instance_shader_parameter("lod_e"), mmi.multimesh.instance_count])
		p.total += mmi.multimesh.instance_count
	root.add_child(p)
	return p


# the shader's distance (klod, mode 1): from the camera to the chunk's box (x0, z0, x1, z1) between the rows' heights y0..y1
static func box_distance(box: Vector4, y: Vector4, cam: Vector3) -> float:
	var lo := Vector3(box.x, y.x, box.y)
	var hi := Vector3(box.z, y.y, box.w)
	return (lo - cam).max(Vector3.ZERO).max(cam - hi).length()


# how many leading rows are in range at distance d: the end row of the last range that still reaches d (ranges longest first)
static func prefix(r: Vector4, e: Vector4, count: int, d: float) -> int:
	var vis := 0
	for k in 4:
		if r[k] >= d and r[k] < 1e8:
			vis = int(minf(e[k], float(count)))
		else:
			break
	return vis


func _process(_dt: float) -> void:
	var cam := get_viewport().get_camera_3d()
	if cam == null:
		return
	var c := cam.global_position
	shown = 0
	for n in nodes:
		var mmi: MultiMeshInstance3D = n[0]
		var count: int = n[5]
		var vis := prefix(n[3], n[4], count, box_distance(n[1], n[2], c))
		mmi.multimesh.visible_instance_count = -1 if vis >= count else vis
		shown += vis
