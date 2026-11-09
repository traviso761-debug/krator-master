#!/usr/bin/env python3
"""The skinned trial: one bat, one mesh, weights. blender --background --python rig/skin_bat.py -- <key> <candidate>

Rigid parts cut skin, and some pose opens the cut (PLAN-MESHY.md, section 1). This takes the other road on the worst case, a bat: the body is never cut. It is decimated whole, the membrane is
rebuilt as one even sheet (section 12 says why), a skeleton is placed from the reference's proportions, and every vertex is weighted to its nearest bones, so the membrane between two fingers
takes a share of each and stretches as they part. Blender's own bone heat refuses a thin sheet, which is why the weights are worked out here.

Writes rig/sources/<key>/skin-<candidate>.glb with the clips glide, flap and fold, and skin-<candidate>.json: for each clip how far any edge of the mesh stretches, the measure that stands in
for closure, since a mesh with no cuts has nothing to open. Landmarks are shares of half the span (x) and the height (z), read off the front reference view.
"""
import json, math, os, sys
import bmesh, bpy
import numpy as np
from mathutils import Matrix, Quaternion, Vector

argv = sys.argv[sys.argv.index('--') + 1:]
HERE = os.path.dirname(os.path.abspath(__file__)); KEY, CAND = argv[0], argv[1]
D = os.path.join(HERE, 'sources', KEY); TRIS = int(argv[2]) if len(argv) > 2 else 11000; TEX = 1024; THIN = 0.03
# (x, z) of each joint on the +x side; a body joint has x = 0
J = {'hip': (0, .30), 'spine': (0, .46), 'chest': (0, .64), 'neck': (0, .72), 'head': (0, .84), 'crown': (0, .95),
     'shoulder': (.2, .66), 'elbow': (.35, .69), 'wrist': (.52, .935), 'k1': (.81, .82), 'k1b': (.986, .63), 'tip1': (.925, .24), 'k2': (.74, .63), 'tip2': (.76, .36), 'k3': (.55, .68), 'tip3': (.58, .42),
     'hipj': (.08, .3), 'knee': (.13, .19), 'ankle': (.17, .04), 'toe': (.25, .0)}
BODY = [('root', 'hip', 'spine', None), ('spine', 'spine', 'chest', 'root'), ('neck', 'chest', 'neck', 'spine'), ('head', 'neck', 'head', 'neck'), ('skull', 'head', 'crown', 'head')]
SIDE = [('arm', 'shoulder', 'elbow', 'neck'), ('fore', 'elbow', 'wrist', 'arm'), ('d1a', 'wrist', 'k1', 'fore'), ('d1b', 'k1', 'k1b', 'd1a'), ('d1c', 'k1b', 'tip1', 'd1b'), ('d2a', 'wrist', 'k2', 'fore'), ('d2b', 'k2', 'tip2', 'd2a'),
        ('d3a', 'wrist', 'k3', 'fore'), ('d3b', 'k3', 'tip3', 'd3a'), ('thigh', 'hipj', 'knee', 'root'), ('shin', 'knee', 'ankle', 'thigh'), ('foot', 'ankle', 'toe', 'shin')]


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.join(D, 'raw-%s.glb' % CAND))
    ob = next(o for o in bpy.context.scene.objects if o.type == 'MESH'); bpy.context.view_layer.objects.active = ob; ob.select_set(True)
    ob.parent = None; bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    n0 = len(ob.data.polygons)
    # a membrane comes as a closed shell a hair thick, and decimating it tears it at any budget this kit can pay. So the flat parts of the wing are taken off the mesh and replaced by one even sheet
    # of triangles, which cannot tear: its colour is the front of the generated wing seen straight on, and alpha cuts its scalloped edge
    me = ob.data; nf = len(me.polygons); Cf = np.zeros(nf * 3); me.polygons.foreach_get('center', Cf); Cf = Cf.reshape(-1, 3)
    x0, z0 = Cf[:, 0].min(), Cf[:, 2].min(); sx = np.ptp(Cf[:, 0]); sz = np.ptp(Cf[:, 2]); xc = x0 + sx / 2; cell = sx / 180; nx, nz = 181, int(sz / cell) + 2
    ix = ((Cf[:, 0] - x0) / cell).astype(int); iz = ((Cf[:, 2] - z0) / cell).astype(int); ymin = np.full((nx, nz), 1e9); ymax = np.full((nx, nz), -1e9); np.minimum.at(ymin, (ix, iz), Cf[:, 1]); np.maximum.at(ymax, (ix, iz), Cf[:, 1])
    O = ymax > -1e8; thin = O & (ymax - ymin < THIN * sx); xs = x0 + (np.arange(nx) + .5) * cell
    def grow(M, k):
        for _ in range(k):
            Q = M.copy(); Q[1:] |= M[:-1]; Q[:-1] |= M[1:]; Q[:, 1:] |= M[:, :-1]; Q[:, :-1] |= M[:, 1:]; M = Q
        return M
    def shrink(M, k):
        return ~grow(~M, k)
    far = np.abs(xs - xc)[:, None] > .1 * sx
    wing = grow(shrink(grow(thin & far, 2), 3), 2) & O      # closed over the fingers, off the odd flat scrap on the body
    gone = wing[ix, iz]; print('wing cells %d, faces taken off %d of %d' % (wing.sum(), gone.sum(), nf))
    base = next(nd.image for mt in me.materials for nd in mt.node_tree.nodes if nd.type == 'TEX_IMAGE' and nd.outputs[0].links and nd.outputs[0].links[0].to_socket.name == 'Base Color')
    w_, h_ = base.size; A_ = np.zeros(w_ * h_ * 4, np.float32); base.pixels.foreach_get(A_); A_ = A_.reshape(h_, w_, 4)
    Uv = np.zeros(len(me.loops) * 2); me.uv_layers[0].data.foreach_get('uv', Uv); Uv = Uv.reshape(-1, 3, 2).mean(1)
    tw, th = 768, int(768 * sz / sx) + 1; px = np.clip(((Cf[:, 0] - x0) / sx * (tw - 1)).astype(int), 0, tw - 1); pz = np.clip(((Cf[:, 2] - z0) / sz * (th - 1)).astype(int), 0, th - 1)
    order = np.argsort(-Cf[:, 1]); Col = np.zeros((th, tw, 3), np.float32); Hit = np.zeros((th, tw), bool)
    ui = np.clip((Uv[:, 0] * w_).astype(int), 0, w_ - 1); vi = np.clip((Uv[:, 1] * h_).astype(int), 0, h_ - 1); Col[pz[order], px[order]] = A_[vi[order], ui[order], :3]; Hit[pz[order], px[order]] = True
    Hit = shrink(grow(Hit, 5), 5)      # the faces are coarser than the pixels: close the gaps between their centres
    for _ in range(12):      # and bleed the colour across them, and under the alpha edge
        for d_, ax_ in ((1, 0), (-1, 0), (1, 1), (-1, 1)):
            R_ = np.roll(Col, d_, ax_); e_ = (Col.sum(2) == 0) & (R_.sum(2) > 0); Col[e_] = R_[e_]
    img = bpy.data.images.new('membrane', tw, th, alpha=True); img.alpha_mode = 'STRAIGHT'; img.pixels.foreach_set(np.dstack([Col, Hit.astype(np.float32)]).ravel()); img.pack()
    mat = bpy.data.materials.new('membrane'); mat.use_nodes = True; nt = mat.node_tree; bs = nt.nodes['Principled BSDF']; tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = img; nt.links.new(tx.outputs[0], bs.inputs['Base Color']); nt.links.new(tx.outputs[1], bs.inputs['Alpha']); bs.inputs['Roughness'].default_value = .75; mat.blend_method = 'CLIP'; mat.alpha_threshold = .5
    bm = bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table(); bmesh.ops.delete(bm, geom=[bm.faces[i] for i in np.where(gone)[0]], context='FACES'); bm.to_mesh(me); bm.free(); me.update()
    f_ = ob.modifiers.new('fur', 'SMOOTH'); f_.factor = .6; f_.iterations = 14; bpy.ops.object.modifier_apply(modifier=f_.name)      # modelled hair turns to flecks when decimated
    m = ob.modifiers.new('reduce', 'DECIMATE'); m.ratio = TRIS / len(me.polygons); bpy.ops.object.modifier_apply(modifier=m.name)
    # the sheet: every third cell of the wing, at the mid-depth of the shell, smoothed
    mid = np.where(thin, (ymin + ymax) / 2, np.nan); keep_ = ~np.isnan(mid); Y = np.where(keep_, mid, 0.); Wt = keep_.astype(float)
    for _ in range(60):
        kY = Y.copy(); kW = Wt.copy()
        for ax_ in (0, 1):
            kY = kY + np.roll(Y, 1, ax_) + np.roll(Y, -1, ax_); kW = kW + np.roll(Wt, 1, ax_) + np.roll(Wt, -1, ax_)
        Y = np.where(kW > 0, kY / np.maximum(kW, 1e-6), 0); Wt = np.minimum(kW, 1)
    step = 3; gx, gz = np.arange(0, nx, step), np.arange(0, nz, step); vid = {}; verts = []; uvs = []; faces = []
    W2 = grow(wing, 3)
    def vert(i, j):
        k = (i, j)
        if k not in vid:
            vid[k] = len(verts); x = x0 + i * cell; z = z0 + j * cell; verts.append((x, float(Y[min(i, nx - 1), min(j, nz - 1)]), z)); uvs.append(((x - x0) / sx, (z - z0) / sz))
        return vid[k]
    for i in gx[:-1]:
        for j in gz[:-1]:
            if W2[i:i + step, j:j + step].any():
                a_, b_, c_, d_ = vert(i, j), vert(i + step, j), vert(i + step, j + step), vert(i, j + step); faces += [(a_, b_, c_), (a_, c_, d_)]
    sh = bpy.data.meshes.new('sheet'); sh.from_pydata(verts, [], faces); sh.update(); uvl = sh.uv_layers.new(); uvl.data.foreach_set('uv', np.array([uvs[v] for f in faces for v in f]).ravel()); sh.materials.append(mat)
    so = bpy.data.objects.new('sheet', sh); bpy.context.collection.objects.link(so); print('sheet %d tris' % len(faces))
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); so.select_set(True); bpy.context.view_layer.objects.active = ob; bpy.ops.object.join()
    # a triangle that decimation stretched across two islands of the atlas smears a crack over the body: it takes one colour, from its own corner
    me = ob.data; lu = me.uv_layers[0].data; Uv = np.zeros(len(lu) * 2); lu.foreach_get('uv', Uv); Uv = Uv.reshape(-1, 2); st = np.zeros(len(me.polygons), int); me.polygons.foreach_get('loop_start', st); ct = np.zeros(len(me.polygons), int); me.polygons.foreach_get('loop_total', ct); bad = 0; mi = np.zeros(len(me.polygons), int); me.polygons.foreach_get('material_index', mi)
    for i in np.where((ct == 3) & (mi != list(me.materials).index(mat)))[0]:
        q = Uv[st[i]:st[i] + 3]
        if np.ptp(q, axis=0).max() > .025:
            Uv[st[i]:st[i] + 3] = q[0]; bad += 1
    lu.foreach_set('uv', Uv.ravel()); print('triangles across the atlas: %d' % bad)
    for mat_ in ob.data.materials:
        for nd in (mat_.node_tree.nodes if mat_ and mat_.use_nodes else []):
            if nd.type == 'TEX_IMAGE' and nd.image and nd.image.name != 'membrane':
                if nd.image is base:      # the atlas's black gutters bleed in at any lower resolution: colour runs out into them first
                    w2, h2 = base.size; I_ = np.zeros(w2 * h2 * 4, np.float32); base.pixels.foreach_get(I_); I_ = I_.reshape(h2, w2, 4); Rg = I_[..., :3]
                    for _ in range(28):
                        for d_, ax_ in ((1, 0), (-1, 0), (1, 1), (-1, 1)):
                            R_ = np.roll(Rg, d_, ax_); e_ = (Rg.sum(2) < .03) & (R_.sum(2) >= .03); Rg[e_] = R_[e_]
                    I_[..., 3] = 1; base.pixels.foreach_set(I_.ravel())
                nd.image.scale(TEX, TEX); nd.image.file_format = 'JPEG'
    me = ob.data; n = len(me.vertices); P = np.zeros(n * 3); me.vertices.foreach_get('co', P); P = P.reshape(-1, 3)
    lo, hi = P.min(0), P.max(0); cx = (lo[0] + hi[0]) / 2; hs = (hi[0] - lo[0]) / 2; h = hi[2] - lo[2]; print('raw %d tris, kept %d; span %.3f height %.3f depth %.3f' % (n0, len(me.polygons), hs * 2, h, hi[1] - lo[1]))

    def place(x, z, s):      # a joint sits in the mesh's own depth there
        p = np.array([cx + s * x * hs, 0, lo[2] + z * h]); d = np.hypot(P[:, 0] - p[0], P[:, 2] - p[2]); near = P[d < max(.035 * hs, d.min() * 1.5), 1]; p[1] = np.median(near); return p
    pts = {}
    for name, (x, z) in J.items():
        for s, sd in ((1, 'L'), (-1, 'R')) if x else ((1, ''),):
            pts[name + sd] = place(x, z, s)
    bones = [(a, b, c, d) for a, b, c, d in BODY]
    for sd in 'LR':
        for a, b, c, d in SIDE:
            bones.append((a + sd, b + sd, c + sd, (d + sd) if d not in ('neck', 'root') else d))
    bpy.ops.object.mode_set(mode='OBJECT'); arm = bpy.data.objects.new('rig', bpy.data.armatures.new('rig')); bpy.context.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='EDIT')
    for nm, a, b, par in bones:
        e = arm.data.edit_bones.new(nm); e.head = Vector(pts[a]); e.tail = Vector(pts[b])
        if par:
            e.parent = arm.data.edit_bones[par]
    bpy.ops.object.mode_set(mode='OBJECT')
    # ---- weights: inverse distance to each bone, four kept, then smoothed along the mesh so no edge jumps
    A = np.array([pts[a] for _, a, _, _ in bones]); B = np.array([pts[b] for _, _, b, _ in bones]); ab = B - A; L2 = (ab * ab).sum(1)
    dist = np.zeros((n, len(bones)))
    for i in range(len(bones)):
        t = np.clip((P - A[i]) @ ab[i] / L2[i], 0, 1); dist[:, i] = np.linalg.norm(P - (A[i] + t[:, None] * ab[i]), axis=1)
    W = 1 / (dist + .012 * h) ** 5
    E = np.zeros(len(me.edges) * 2, int); me.edges.foreach_get('vertices', E); E = E.reshape(-1, 2)
    for _ in range(4):
        S = W.copy(); cnt = np.ones(n); np.add.at(S, E[:, 0], W[E[:, 1]]); np.add.at(S, E[:, 1], W[E[:, 0]]); np.add.at(cnt, E[:, 0], 1); np.add.at(cnt, E[:, 1], 1); W = S / cnt[:, None]
    keep = np.argsort(-W, axis=1)[:, :4]; Wk = np.take_along_axis(W, keep, 1); Wk /= Wk.sum(1, keepdims=True)
    groups = [ob.vertex_groups.new(name=b[0]) for b in bones]
    for v in range(n):
        for j in range(4):
            if Wk[v, j] > .01:
                groups[keep[v, j]].add([v], float(Wk[v, j]), 'REPLACE')
    md = ob.modifiers.new('skin', 'ARMATURE'); md.object = arm; ob.parent = arm
    # ---- clips: an angle about a rest-world axis in the plane of the wing, so + lifts the tip on either side
    rest = {b.name: b.matrix_local.to_quaternion() for b in arm.data.bones}
    def rot(nm, deg):
        ax = Vector((0, -1, 0)) if nm.endswith('L') else Vector((0, 1, 0)); q = rest[nm]; return q.inverted() @ Quaternion(ax, math.radians(deg)) @ q
    def wing(sd, u, f, d1, d2, d3):
        return {'arm' + sd: u, 'fore' + sd: f, 'd1a' + sd: d1, 'd2a' + sd: d2, 'd3a' + sd: d3}
    def glide(t):
        a = 4 * math.sin(2 * math.pi * t); return dict(wing('L', 8 + a, 0, 0, 0, 0), **wing('R', 8 + a, 0, 0, 0, 0))
    def flap(t):
        s = math.sin(2 * math.pi * t); c = math.sin(2 * math.pi * t - 1.0); w = lambda sd: wing(sd, 34 * s, 18 * c, 14 * c, 20 * c, 26 * c); return dict(w('L'), **w('R'))
    def fold(t):
        k = .5 - .5 * math.cos(2 * math.pi * t); w = lambda sd: wing(sd, -70 * k, 118 * k, -118 * k, -132 * k, -140 * k); return dict(w('L'), **w('R'))
    arm.animation_data_create(); ad = arm.animation_data; report = {}
    dg = bpy.context.evaluated_depsgraph_get(); rl = np.linalg.norm(P[E[:, 0]] - P[E[:, 1]], axis=1); Lrest = rl.copy()
    bpy.context.scene.render.fps = 24
    for name, fn, dur in (('glide', glide, 2.0), ('flap', flap, 1.0), ('fold', fold, 4.0)):
        act = bpy.data.actions.new(name); act.use_fake_user = True; ad.action = act; frames = int(dur * 24); worst = 0; p99 = 0
        for f in range(frames + 1):
            ang = fn(f / frames)
            for pb in arm.pose.bones:
                pb.rotation_mode = 'QUATERNION'; pb.rotation_quaternion = rot(pb.name, ang[pb.name]) if pb.name in ang else Quaternion((1, 0, 0, 0)); pb.keyframe_insert('rotation_quaternion', frame=f + 1)
            if f % 3 == 0:
                bpy.context.scene.frame_set(f + 1); dg.update(); e_ob = ob.evaluated_get(dg); em = e_ob.to_mesh(); Q = np.zeros(n * 3); em.vertices.foreach_get('co', Q); Q = Q.reshape(-1, 3); e_ob.to_mesh_clear()
                s = np.linalg.norm(Q[E[:, 0]] - Q[E[:, 1]], axis=1) / np.maximum(Lrest, 1e-6); worst = max(worst, float(s.max())); p99 = max(p99, float(np.quantile(s, .99)))
        report[name] = {'dur': dur, 'edge_stretch_max': round(worst, 3), 'edge_stretch_p99': round(p99, 3)}
        tr = ad.nla_tracks.new(); tr.name = name; st = tr.strips.new(name, 1, act); ad.action = None; st.name = name
    json.dump(dict(report, tris=len(me.polygons), bones=len(bones), raw=n0), open(os.path.join(D, 'skin-%s.json' % CAND), 'w', encoding='utf-8', newline='\n'), indent=1)
    print(report)
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); arm.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(D, 'skin-%s.glb' % CAND), export_format='GLB', use_selection=True, export_skins=True, export_animations=True, export_animation_mode='NLA_TRACKS', export_image_format='AUTO')


main()
