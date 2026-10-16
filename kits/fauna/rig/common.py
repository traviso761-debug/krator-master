import json, struct, numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components

def load(path):
    b = open(path, 'rb').read(); jl = struct.unpack('<I', b[12:16])[0]
    J = json.loads(b[20:20 + jl]); BIN = b[20 + jl + 8:]
    def acc(i):
        a = J['accessors'][i]; v = J['bufferViews'][a['bufferView']]
        n = {'VEC3': 3, 'VEC2': 2, 'SCALAR': 1}[a['type']]; dt = {5126: '<f4', 5125: '<u4', 5123: '<u2'}[a['componentType']]
        return np.frombuffer(BIN, dt, a['count'] * n, v['byteOffset'] + a.get('byteOffset', 0)).reshape(-1, n).copy()
    at = J['meshes'][0]['primitives'][0]
    P = acc(at['attributes']['POSITION']); N = acc(at['attributes']['NORMAL']); UV = acc(at['attributes']['TEXCOORD_0'])
    F = acc(at['indices']).reshape(-1, 3).astype(np.int64)
    return J, BIN, P, N, UV, F

def weld_ids(P):
    _, w = np.unique(np.round(P, 4), axis=0, return_inverse=True); return w.reshape(-1)

def face_components(F, faces_sel, W):
    """connected components over the selected faces, using welded vertex ids; returns per-selected-face labels"""
    Fs = W[F[faces_sel]]
    n = W.max() + 1
    g = coo_matrix((np.ones(len(Fs) * 3), (np.r_[Fs[:, 0], Fs[:, 1], Fs[:, 2]], np.r_[Fs[:, 1], Fs[:, 2], Fs[:, 0]])), shape=(n, n))
    _, lab = connected_components(g, directed=False)
    return lab[Fs[:, 0]]
