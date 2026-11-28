# KCombatHitbox: Bone-attached weapon/unarmed strike hitbox & 7-zone hurtbox Area3D helper.
# Driven by KCombatBrain ACTIVE frames or AnimationPlayer method tracks via enable_window() / disable_window().
class_name KCombatHitbox
extends Area3D

enum Role { HITBOX, HURTBOX }

const ZONE_BONE_CANDIDATES := {
	"head": ["Head", "Neck"],
	"chest": ["Spine2", "Spine1", "UpperChest", "Chest"],
	"stomach": ["Spine", "Hips"],
	"left_arm": ["LeftForeArm", "LeftArm", "LeftHand"],
	"right_arm": ["RightForeArm", "RightArm", "RightHand"],
	"left_leg": ["LeftLeg", "LeftUpLeg", "LeftFoot"],
	"right_leg": ["RightLeg", "RightUpLeg", "RightFoot"],
}

const ZONE_RADII := {
	"head": Vector2(0.13, 0.24),
	"chest": Vector2(0.18, 0.34),
	"stomach": Vector2(0.16, 0.28),
	"left_arm": Vector2(0.08, 0.34),
	"right_arm": Vector2(0.08, 0.34),
	"left_leg": Vector2(0.10, 0.44),
	"right_leg": Vector2(0.10, 0.44),
}

signal strike_overlapped(defender_fighter: Node, hit_zone: String, hitbox: KCombatHitbox)
signal window_toggled(is_active: bool, zone_hint: String)

@export var role: Role = Role.HITBOX
@export var zone: String = "chest"
var zone_hint: String = "chest"
var active_window: bool = false
var owner_fighter: Node = null
var _already_hit: Dictionary = {}


func _init(p_role: Role = Role.HITBOX, p_zone: String = "chest", p_owner: Node = null) -> void:
	role = p_role
	zone = p_zone
	zone_hint = p_zone
	owner_fighter = p_owner
	monitorable = (role == Role.HURTBOX)
	monitoring = false
	area_entered.connect(_on_area_entered)


func ensure_capsule_shape(radius: float = 0.10, height: float = 0.36, local_offset: Vector3 = Vector3.ZERO) -> CollisionShape3D:
	for ch in get_children():
		if ch is CollisionShape3D:
			return ch
	var cs := CollisionShape3D.new()
	var cap := CapsuleShape3D.new()
	cap.radius = maxf(0.02, radius)
	cap.height = maxf(cap.radius * 2.0, height)
	cs.shape = cap
	cs.position = local_offset
	add_child(cs)
	return cs


func enable_window(p_zone_hint: String = "chest") -> void:
	if role != Role.HITBOX:
		return
	zone_hint = p_zone_hint if p_zone_hint != "" else "chest"
	_already_hit.clear()
	active_window = true
	monitoring = true
	window_toggled.emit(true, zone_hint)


func disable_window() -> void:
	if role != Role.HITBOX:
		return
	active_window = false
	monitoring = false
	_already_hit.clear()
	window_toggled.emit(false, zone_hint)


func register_manual_overlap(other_hurtbox: KCombatHitbox) -> bool:
	if not active_window or role != Role.HITBOX or other_hurtbox == null:
		return false
	return _try_emit_hit(other_hurtbox)


func _on_area_entered(other: Area3D) -> void:
	if not active_window or role != Role.HITBOX:
		return
	if other is KCombatHitbox:
		_try_emit_hit(other as KCombatHitbox)


func _try_emit_hit(hurt: KCombatHitbox) -> bool:
	if hurt.role != Role.HURTBOX:
		return false
	if hurt.owner_fighter != null and hurt.owner_fighter == owner_fighter:
		return false
	var target_key: Variant = hurt.owner_fighter if hurt.owner_fighter != null else hurt
	if _already_hit.has(target_key):
		return false
	_already_hit[target_key] = true
	var resolved_zone := hurt.zone if hurt.zone != "" else zone_hint
	strike_overlapped.emit(hurt.owner_fighter, resolved_zone, self)
	return true


static func attach_weapon_hitbox(skeleton: Skeleton3D, owner_node: Node, bone_name: String = "RightHand", radius: float = 0.11, length: float = 0.55) -> KCombatHitbox:
	var hb := KCombatHitbox.new(Role.HITBOX, "chest", owner_node)
	hb.name = "Hitbox_" + bone_name
	hb.ensure_capsule_shape(radius, length, Vector3(0.0, length * 0.35, 0.0))
	if skeleton != null:
		var b_idx := skeleton.find_bone(bone_name)
		if b_idx >= 0:
			var att := BoneAttachment3D.new()
			att.name = "HitAttach_" + bone_name
			skeleton.add_child(att)
			att.bone_idx = b_idx
			att.add_child(hb)
			return hb
		skeleton.add_child(hb)
	elif owner_node != null:
		owner_node.add_child(hb)
	return hb


static func attach_7zone_hurtboxes(skeleton: Skeleton3D, owner_node: Node) -> Dictionary:
	var zones := {}
	for z in KCombatStats.LIMBS:
		var dims: Vector2 = ZONE_RADII.get(z, Vector2(0.12, 0.30))
		var hurt := KCombatHitbox.new(Role.HURTBOX, z, owner_node)
		hurt.name = "Hurtbox_" + z
		hurt.ensure_capsule_shape(dims.x, dims.y)
		var placed := false
		if skeleton != null:
			for cand in ZONE_BONE_CANDIDATES.get(z, []):
				var b_idx := skeleton.find_bone(cand)
				if b_idx >= 0:
					var att := BoneAttachment3D.new()
					att.name = "HurtAttach_" + z
					skeleton.add_child(att)
					att.bone_idx = b_idx
					att.add_child(hurt)
					placed = true
					break
			if not placed:
				skeleton.add_child(hurt)
		elif owner_node != null:
			owner_node.add_child(hurt)
		zones[z] = hurt
	return zones
