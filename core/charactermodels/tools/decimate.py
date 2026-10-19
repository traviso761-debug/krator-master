"""Fewer triangles for a dense item (the flats, the pirate boots), keeping a subset of its own vertices.

simplify(P, T, keep): quadric half-edge collapse. Each step removes one vertex by moving it onto a neighbour that stays,
so every surviving vertex keeps its position and everything else it carries: UV, normal, skin weights and _VIDX (the
MakeHuman vertex its morph deltas are recorded against). Border edges (an opening, or a UV or normal seam, where the
exporter split the vertices) are never moved, so seams and hems hold; a collapse that would flip a triangle, or join
two sheets (the link condition), is refused.

decimate_glb(path, keep): every primitive of a GLB simplified in place (make_mpfb.py, DECIMATE).
"""
import heapq
import json
import struct

import numpy as np

import glbio


def _quadrics(P, T):
    Q = np.zeros((len(P), 4, 4))
    a, b, c = P[T[:, 0]], P[T[:, 1]], P[T[:, 2]]
    n = np.cross(b - a, c - a)
    area = np.linalg.norm(n, axis=1)
    ok = area > 1e-12
    n[ok] /= area[ok, None]
    p = np.concatenate([n, -(n * a).sum(1, keepdims=True)], 1)
    K = p[:, :, None] * p[:, None, :] * (area[:, None, None] * 0.5)
    for k in range(3):
        np.add.at(Q, T[:, k], K)
    return Q


def simplify(P, T, keep=0.25, max_err=2.5e-4):
    """indices T (m x 3) into P reduced to about keep * m triangles, or until a collapse would move the surface by
    more than max_err (metres, roughly); returns the new triangles (into P)"""
    P = np.asarray(P, float)
    T = np.array(T, np.int64)
    m = len(T)
    alive = np.ones(m, bool)
    vt = [set() for _ in range(len(P))]
    for t, tri in enumerate(T):
        for v in tri:
            vt[v].add(t)
    # border and non-manifold edges lock their vertices
    edges = {}
    for t, (a, b, c) in enumerate(T):
        for u, v in ((a, b), (b, c), (c, a)):
            e = (u, v) if u < v else (v, u)
            edges[e] = edges.get(e, 0) + 1
    locked = np.zeros(len(P), bool)
    for (u, v), k in edges.items():
        if k != 2:
            locked[u] = locked[v] = True
    Q = _quadrics(P, T)
    ver = np.zeros(len(P), np.int64)
    gone = np.zeros(len(P), bool)
    heap = []

    def cost(a, b):
        h = np.append(P[b], 1.0)
        return float(h @ (Q[a] + Q[b]) @ h)

    def push(a):
        for t in vt[a]:
            for b in T[t]:
                if b != a and not locked[a]:
                    heapq.heappush(heap, (cost(a, b), int(a), int(b), int(ver[a]), int(ver[b])))
    for a in range(len(P)):
        if vt[a] and not locked[a]:
            push(a)
    live, target = m, int(m * keep)

    def normal(t, a=None, b=None):
        q = [b if x == a else x for x in T[t]]
        n = np.cross(P[q[1]] - P[q[0]], P[q[2]] - P[q[0]])
        return n

    while heap and live > target:
        c, a, b, va, vb = heapq.heappop(heap)
        if gone[a] or gone[b] or va != ver[a] or vb != ver[b] or locked[a]:
            continue
        if c > max_err * max_err:
            break
        shared = vt[a] & vt[b]
        if not shared:
            continue
        # the link condition: the two share exactly the neighbours of the triangles on their edge
        na = {x for t in vt[a] for x in T[t]} - {a}
        nb = {x for t in vt[b] for x in T[t]} - {b}
        opp = {x for t in shared for x in T[t]} - {a, b}
        if (na & nb) != opp:
            continue
        flip = False
        for t in vt[a] - shared:
            n0, n1 = normal(t), normal(t, a, b)
            l0, l1 = np.linalg.norm(n0), np.linalg.norm(n1)
            if l1 < 1e-14 or (l0 > 1e-14 and (n0 @ n1) / (l0 * l1) < 0.3):
                flip = True
                break
        if flip:
            continue
        for t in shared:
            alive[t] = False
            live -= 1
            for x in T[t]:
                vt[x].discard(t)
        for t in list(vt[a]):
            T[t][T[t] == a] = b
            vt[b].add(t)
        vt[a] = set()
        gone[a] = True
        # only b's quadric changed: its edges, both ways, are queued again (a stale entry fails its version check;
        # one whose edge the collapse removed fails the shared-triangle check)
        Q[b] += Q[a]
        ver[b] += 1
        push(b)
        for x in {y for t in vt[b] for y in T[t]} - {b}:
            if not locked[x]:
                heapq.heappush(heap, (cost(x, b), int(x), int(b), int(ver[x]), int(ver[b])))
    return T[alive]


def decimate_glb(path, keep=0.25, max_err=2.5e-4):
    """every primitive of the GLB at path simplified (simplify), its unused vertices dropped from every attribute;
    written back in place. Returns (triangles before, after)"""
    j, b = glbio.read_glb(open(path, 'rb').read())
    b = bytes(b)
    blobs, before, after = {}, 0, 0
    for mesh in j['meshes']:
        for p in mesh['primitives']:
            if p.get('mode', 4) != 4 or 'indices' not in p:
                continue
            ia = j['accessors'][p['indices']]
            T = glbio.accessor(j, b, p['indices']).reshape(-1, 3).astype(np.int64)
            P = glbio.accessor(j, b, p['attributes']['POSITION']).astype(float)
            T2 = simplify(P, T, keep, max_err)
            before, after = before + len(T), after + len(T2)
            used = np.unique(T2)
            remap = np.full(len(P), -1, np.int64)
            remap[used] = np.arange(len(used))
            for name, ai in p['attributes'].items():
                a = j['accessors'][ai]
                v = j['bufferViews'][a['bufferView']]
                if v.get('byteStride') or a.get('byteOffset', 0) or sum(1 for x in j['accessors'] if x.get('bufferView') == a['bufferView']) > 1:
                    raise SystemExit('decimate.py: %s %s shares or strides its buffer view' % (path, name))
                arr = glbio.accessor(j, b, ai)
                arr = arr.reshape(len(P), -1)[used]
                dt = {5126: np.float32, 5123: np.uint16, 5121: np.uint8, 5125: np.uint32}[a['componentType']]
                blobs[a['bufferView']] = arr.astype(dt).tobytes()
                a['count'] = len(used)
                if name == 'POSITION':
                    a['min'] = [float(x) for x in arr.min(0)]
                    a['max'] = [float(x) for x in arr.max(0)]
            idx = remap[T2].reshape(-1)
            big = len(used) > 65535
            ia['componentType'] = 5125 if big else 5123
            ia['count'] = len(idx)
            ia.pop('byteOffset', None)
            blobs[ia['bufferView']] = idx.astype(np.uint32 if big else np.uint16).tobytes()
    parts, off = [], 0
    for k, v in enumerate(j['bufferViews']):
        o = v.get('byteOffset', 0)
        data = blobs.get(k, b[o:o + v['byteLength']])
        pad = (-off) % 4
        parts.append(b'\0' * pad)
        off += pad
        v['byteOffset'], v['byteLength'] = off, len(data)
        parts.append(data)
        off += len(data)
    binb = b''.join(parts) + b'\0' * ((-off) % 4)
    j['buffers'] = [{'byteLength': len(binb)}]
    js = json.dumps(j, separators=(',', ':')).encode()
    js += b' ' * ((-len(js)) % 4)
    with open(path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(binb)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + binb)
    return before, after
