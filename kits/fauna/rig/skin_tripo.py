#!/usr/bin/env python3
"""A bat rigged by Tripo's web app, made a kit model: blender --background --python rig/skin_tripo.py -- <key> [tris]

Tripo's web app rigs a creature (bones, weights) but animates only humanoids, so the clips are ours. The kit's set: perch (wings folded, breathing, the head turning), walk (wings
folded, a slow step on the legs), glide and flap, and fold, which goes from spread to folded and is kept to measure. The mesh is decimated to the kit's budget first; Blender's
decimation keeps the weights. Its wings span z and it faces x (rig/pack_skinned.py turns it to face +z); its left shoulder chain comes named Spine_3 and Spine_4.

Reads rig/sources/<key>/raw-tripo.glb, writes skin-tripo.glb and skin-tripo.json (each clip's edge stretch: of the mesh's edges, how far the worst and the 1% longest grow).
"""
import json, math, os, sys
import bpy
import numpy as np
from mathutils import Quaternion, Vector

argv = sys.argv[sys.argv.index('--') + 1:]
HERE = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(HERE, 'sources', argv[0]); TRIS = int(argv[1]) if len(argv) > 1 else 13000
# per side, read off the bind pose (R spans -y in Blender's armature space, the wing plane is y-z, x is the facing): the shoulder's bone, the forearm at the elbow, the wrist, each
# finger's chain from the wrist out, and the membrane's bones. Tripo's two wings are rigged differently: R has two membrane chains on the spare upper-arm bone (bone_27, bone_12 on
# L, both left alone), L has one on the forearm (so it takes the forearm's turn back off) and a thumb (bone_22, left alone)
WING = {'R': dict(arm='bone_26', fore='bone_28', wrist='bone_29', fingers=[['bone_30', 'bone_31', 'bone_32'], ['bone_33', 'bone_34'], ['bone_35', 'bone_36']], web=['bone_37', 'bone_39'], web_on_fore=False),
        'L': dict(arm='tripo::Spine_4', fore='bone_13', wrist='bone_14', fingers=[['bone_15', 'bone_16', 'bone_17'], ['bone_18', 'bone_19'], ['bone_20', 'bone_21']], web=['bone_23'], web_on_fore=True)}
# the folded wing, each side found by a search (least edge stretch with every finger tip kept within 0.13 of the body's mid-plane and above the feet): arm, forearm, wrist, the three
# fingers' base bones, the curl of each bone after a finger's first, the membrane bones
FOLD = {'R': (-70, 103, 0, -52, -52, -37, -22, 75), 'L': (-66, 83, 0, -60, -48, -33, -22, 56)}
LEGS = {'L': 'tripo::0_Left_Limb_1', 'R': 'tripo::0_Right_Limb_0'}; KNEES = {'L': 'tripo::0_Left_Limb_2', 'R': 'tripo::0_Right_Limb_1'}; FEET = {'L': 'tripo::0_Left_Limb_3', 'R': 'tripo::0_Right_Limb_2'}; WALK_DUTY, WALK_SWING, WALK_LIFT, WALK_KNEE = .6, 11, 22, 25
# the legs: the rig is not symmetric here either (R has an extra hip bone, bone_53), so the thighs are Limb_1 on L, Limb_0 on R
HEAD = 'tripo::Head_0'; CHEST = 'tripo::Spine_1'; ROOT = 'tripo::Root'; FLY_PITCH, FLY_NECK = 84, -55


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.join(D, 'raw-tripo.glb'))
    arm = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE'); ob = next(o for o in bpy.context.scene.objects if o.type == 'MESH')
    n0 = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    if n0 > TRIS:
        bpy.context.view_layer.objects.active = ob; ob.select_set(True)
        m = ob.modifiers.new('reduce', 'DECIMATE'); m.ratio = TRIS / n0; bpy.ops.object.modifier_apply(modifier=m.name)
    rest = {b.name: b.matrix_local.to_quaternion() for b in arm.data.bones}
    def about(nm, axis, deg=None):      # a turn about a rest-world axis (or a list of (axis, deg), the first applied first), as the bone's own rotation
        turns = [(axis, deg)] if deg is not None else [axis] if isinstance(axis, tuple) else axis; r = Quaternion((1, 0, 0, 0))
        for ax, dg in turns:
            r = Quaternion(Vector(ax), math.radians(dg)) @ r
        q = rest[nm]; return q.inverted() @ r @ q
    def wing(u, f, d, web=0.0, curl=0.0, w=0.0, sides=None):
        """+ lifts either wing's tip (a turn about the facing axis, x, in the wing's plane); d is each finger's base bone, or three of them; curl turns each bone after a finger's
        first. sides gives each side its own (u, f, w, d1, d2, d3, curl, web)"""
        out = {}
        for sd, b in WING.items():
            uu, ff, ww, d1, d2, d3, cc, wb = sides[sd] if sides else (u, f, w, d * 1.0, d * 1.1, d * 1.2, curl, web)
            ax = (-1, 0, 0) if sd == 'R' else (1, 0, 0); out[b['arm']] = (ax, uu); out[b['fore']] = (ax, ff); out[b['wrist']] = (ax, ww)
            for dd, ch in zip((d1, d2, d3), b['fingers']):
                out[ch[0]] = (ax, dd)
                for nb in ch[1:]:
                    out[nb] = (ax, cc)
            for nb in b['web']:
                out[nb] = (ax, wb - (ff if b['web_on_fore'] else 0))
        return out
    folded = lambda k: wing(0, 0, 0, sides={sd: tuple(k * a for a in v) for sd, v in FOLD.items()})
    def perch(t):
        a = folded(1.0); a[CHEST] = ((0, 1, 0), 2 * math.sin(2 * math.pi * t)); a[HEAD] = ((0, 0, 1), 12 * math.sin(2 * math.pi * t)); return a
    def leg_axes(sd):
        """the thigh's swing axis, square to the facing (x) and to the leg from hip to the lowest point of its chain; the turn about it (th0) that brings the foot right under
        the hip, where the stance is centred so the foot keeps its height (centred on the rest pose a slanted leg's foot sinks all through the stance); and the signs of the
        lift (out to the side, about x) and of the knee that raise the foot, tried on the bones"""
        th = arm.data.bones[LEGS[sd]]; chain = [th] + list(th.children_recursive); tip = min(chain, key=lambda b: b.tail_local.z).name
        n = Vector((1, 0, 0)).cross(arm.data.bones[tip].tail_local - th.head_local).normalized()
        fb = arm.data.bones[FEET[sd]]; fset = {fb.name} | {b.name for b in fb.children_recursive}; gi = {g.index: g.name for g in ob.vertex_groups}
        fv = np.array([v.index for v in ob.data.vertices if v.groups and gi[max(v.groups, key=lambda g: g.weight).group] in fset])
        def foot_z(spec):      # the lowest vertex of the foot, on the skinned mesh (a claw reaches past the last bone's tail)
            for pb in arm.pose.bones:
                pb.rotation_mode = 'QUATERNION'; pb.rotation_quaternion = about(pb.name, spec[pb.name]) if pb.name in spec else Quaternion((1, 0, 0, 0))
            dg = bpy.context.evaluated_depsgraph_get(); dg.update(); e = ob.evaluated_get(dg); em = e.to_mesh(); Q = np.zeros(len(em.vertices) * 3); em.vertices.foreach_get('co', Q); e.to_mesh_clear()
            return float(Q.reshape(-1, 3)[fv, 2].min())
        th0 = min(range(-40, 41, 2), key=lambda d: foot_z({LEGS[sd]: [(tuple(n), d)]}))
        lift = max(((1, 0, 0), (-1, 0, 0)), key=lambda ax: foot_z({LEGS[sd]: [(tuple(n), th0), (ax, WALK_LIFT)]}))
        knee = max((1, -1), key=lambda k: foot_z({LEGS[sd]: [(tuple(n), th0), (lift, WALK_LIFT)], KNEES[sd]: [((0, 1, 0), k * WALK_KNEE)]}))
        print('leg', sd, 'th0', th0, 'lift', lift, 'knee', knee); FOOTZ[sd] = foot_z; return tuple(n), th0, lift, knee
    FOOTZ = {}; AX = {sd: leg_axes(sd) for sd in ('L', 'R')}
    def walk(t):
        """wings folded, a waddle: each thigh sweeps back at an even rate while its foot is down (duty 0.6, so the packer can find one speed that keeps it planted) and swings
        forward lifted out to its side, the knee bent; the body rolls toward the planted leg. It faces +x"""
        a = folded(1.0)
        for sd, ph in (('L', t), ('R', (t + .5) % 1)):
            if ph < WALK_DUTY:
                th, up, kn = -WALK_SWING + 2 * WALK_SWING * ph / WALK_DUTY, 0.0, 0.0
            else:
                q = (ph - WALK_DUTY) / (1 - WALK_DUTY); e = math.sin(math.pi * q); th, up, kn = WALK_SWING - 2 * WALK_SWING * (.5 - .5 * math.cos(math.pi * min(1, q / .75))), WALK_LIFT * e, WALK_KNEE * e      # the foot is forward before it comes down
            n, th0, lift, knee = AX[sd]; a[LEGS[sd]] = [(n, th0 + th), (lift, up)]; a[KNEES[sd]] = ((0, 1, 0), knee * kn)
        a[CHEST] = ((1, 0, 0), 3 * math.sin(2 * math.pi * t)); a['__lift'] = RAISE[0]; return a
    # the legs drawn under the hips stand lower than the perch's: raise the body by the difference, so the walk stands on the perch's ground
    RAISE = [0.0]; spec = walk(WALK_DUTY / 2); RAISE[0] = min(FOOTZ[sd](folded(1.0)) for sd in FOOTZ) - min(FOOTZ[sd](spec) for sd in FOOTZ); print('walk raised', round(RAISE[0], 4))
    def fly(u, f, d, curl=0.0):
        """in flight the body is pitched forward (the rig stands upright, so the root turns about the span, y, to bring the head to +x and the belly down; the old Meshy bat flew
        at 83 degrees) and the neck lifts the face to look ahead; the wings beat about the body's long axis (z at rest), + raising either tip, the forearm and fingers
        following. (wing() turns the wing in its own plane: the fold.)"""
        out = {ROOT: ((0, 1, 0), FLY_PITCH), HEAD: ((0, 1, 0), FLY_NECK)}
        for sd, b in WING.items():
            ax = (0, 0, -1) if sd == 'R' else (0, 0, 1); out[b['arm']] = (ax, u); out[b['fore']] = (ax, f)
            for ch in b['fingers']:
                out[ch[0]] = (ax, d)
                for nb in ch[1:]:
                    out[nb] = (ax, curl)
        return out
    clips = (('perch', 4.0, perch), ('walk', 1.2, walk),
             ('glide', 2.0, lambda t: fly(8 + 3 * math.sin(2 * math.pi * t), -2, -4)),
             ('flap', 1.0, lambda t: (lambda s, c: fly(34 * s, 16 * c, 14 * c, 5 * c))(math.sin(2 * math.pi * t), math.sin(2 * math.pi * t - 1.0))),
             ('fold', 4.0, lambda t: folded(.5 - .5 * math.cos(2 * math.pi * t))))
    me = ob.data; n = len(me.vertices); P = np.zeros(n * 3); me.vertices.foreach_get('co', P); P = P.reshape(-1, 3)
    E = np.zeros(len(me.edges) * 2, int); me.edges.foreach_get('vertices', E); E = E.reshape(-1, 2); L0 = np.linalg.norm(P[E[:, 0]] - P[E[:, 1]], axis=1)
    arm.animation_data_create(); ad = arm.animation_data; bpy.context.scene.render.fps = 24; dg = bpy.context.evaluated_depsgraph_get(); report = {}
    for c in list(ad.nla_tracks):
        ad.nla_tracks.remove(c)
    for name, dur, fn in clips:
        act = bpy.data.actions.new(name); act.use_fake_user = True; ad.action = act; frames = int(dur * 24); worst = p99 = 0
        for f in range(frames + 1):
            ang = fn(f / frames)
            pr = arm.pose.bones[ROOT]; pr.location = rest[ROOT].inverted() @ Vector((0, 0, ang.get('__lift', 0.0))); pr.keyframe_insert('location', frame=f + 1)
            for pb in arm.pose.bones:
                pb.rotation_mode = 'QUATERNION'; pb.rotation_quaternion = about(pb.name, ang[pb.name]) if pb.name in ang else Quaternion((1, 0, 0, 0)); pb.keyframe_insert('rotation_quaternion', frame=f + 1)
            if f % 3 == 0:
                bpy.context.scene.frame_set(f + 1); dg.update(); e = ob.evaluated_get(dg); em = e.to_mesh(); Q = np.zeros(len(em.vertices) * 3); em.vertices.foreach_get('co', Q); Q = Q.reshape(-1, 3); e.to_mesh_clear()
                s = np.linalg.norm(Q[E[:, 0]] - Q[E[:, 1]], axis=1) / np.maximum(L0, 1e-6); worst = max(worst, float(s.max())); p99 = max(p99, float(np.quantile(s, .99)))
        report[name] = {'dur': dur, 'edge_stretch_max': round(worst, 3), 'edge_stretch_p99': round(p99, 3)}
        tr = ad.nla_tracks.new(); tr.name = name; st = tr.strips.new(name, 1, act); st.name = name; ad.action = None
    json.dump(dict(report, tris=sum(len(p.vertices) - 2 for p in me.polygons), raw_tris=n0, bones=len(arm.data.bones)), open(os.path.join(D, 'skin-tripo.json'), 'w', encoding='utf-8', newline='\n'), indent=1)
    print(report)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=os.path.join(D, 'skin-tripo.glb'), export_format='GLB', export_skins=True, export_animations=True, export_animation_mode='NLA_TRACKS', export_image_format='JPEG', export_jpeg_quality=85)


main()
