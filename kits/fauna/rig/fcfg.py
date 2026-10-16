"""Per-animal rules for cutting a Meshy flyer into parts. Each classify(C) takes face centroids (N,3) and returns an array of part names.
Axes of the generated models: x across the span, y up, z forward (the head's way)."""
import numpy as np
from scipy.spatial import cKDTree

def quetzal(C, Nf=None):
    x, y, z = C[:, 0], C[:, 1], C[:, 2]; ax = np.abs(x)
    lab = np.full(len(C), 'torso', dtype=object); sd = np.where(x >= 0, 'R', 'L')
    if Nf is not None:   # the membrane across the back stays flat when the torso pitches: only the THIN sheet (a face with an opposite face just beneath it), never the body's own back wall
        cand = np.where((np.abs(Nf[:, 1]) > 0.8) & (ax < 0.16) & (y > -0.07) & (y < 0.04) & (z < -0.02))[0]; T = cKDTree(C)
        thin = np.array([any(j != i and Nf[j] @ Nf[i] < -0.5 for j in T.query_ball_point(C[i], 0.018)) for i in cand], bool)
        lab[cand[thin | (ax[cand] > 0.07)]] = 'midsheet'      # thin sheet, or out on the flanks where the body is not
    lab[(y > 0.0) & (y <= 0.24)] = 'neck'
    lab[(y > 0.24) | ((z > 0.10) & (y > 0.10))] = 'head'
    if Nf is not None: lab[(z < -0.30) & (ax < 0.06) & (y > -0.1)] = 'tail'      # the short spike: it counter-rotates in flight so it trails
    if Nf is not None: lab[(z < -0.25) & (ax > 0.02) & (ax < 0.16) & (y > -0.05)] = 'midsheet'      # the membrane's trailing edge (two thin arcs): stays level with it
    leg = (y < -0.12) & (ax < 0.2)
    for i in np.where(leg)[0]: lab[i] = ('foot' if y[i] < -0.305 else ('legT' if y[i] < -0.235 else 'leg')) + sd[i]
    wing = (ax > 0.13) & (y > -0.09) & (y < 0.07) & ~leg
    for i in np.where(wing)[0]: lab[i] = ('wingO' if ax[i] > 0.47 else 'wing') + sd[i]
    return lab

def bat(C, Nf=None):
    x, y, z = C[:, 0], C[:, 1], C[:, 2]; ax = np.abs(x)
    lab = np.full(len(C), 'torso', dtype=object); sd = np.where(x >= 0, 'R', 'L')
    lab[(y > 0.27) & (ax < 0.16)] = 'head'
    leg = (y < -0.22) & (ax < 0.2)
    for i in np.where(leg)[0]: lab[i] = ('foot' if y[i] < -0.42 else ('legT' if y[i] < -0.34 else 'leg')) + sd[i]
    wing = (ax > 0.21) & ~leg & ~((y > 0.27) & (ax < 0.2)) & ~((y > 0.2) & (ax < 0.27))      # the back wall out to 0.21 stays with the torso
    for i in np.where(wing)[0]: lab[i] = ('wingO' if ax[i] > 0.46 else 'wing') + sd[i]
    return lab

def archaeopteryx(C, Nf=None):
    x, y, z = C[:, 0], C[:, 1], C[:, 2]; ax = np.abs(x)
    lab = np.full(len(C), 'torso', dtype=object); sd = np.where(x >= 0, 'R', 'L')
    lab[(z > 0.62) & (y > 0.25)] = 'neck'
    lab[(z > 0.66) & (y > 0.28)] = 'head'
    lab[z < 0.28] = 'tail'; lab[z < -0.45] = 'tail2'
    leg = (y < 0.0) & (z > 0.25) & (ax < 0.3)
    for i in np.where(leg)[0]: lab[i] = ('foot' if y[i] < -0.44 else ('legT' if y[i] < -0.28 else 'leg')) + sd[i]
    wing = ((ax > 0.2) | ((ax > 0.13) & (y > 0.05))) & (y > -0.02) & (z > 0.1) & ~((z > 0.62) & (y > 0.26) & (ax < 0.26))
    for i in np.where(wing)[0]: lab[i] = ('wingO' if ax[i] > 0.5 else 'wing') + sd[i]
    return lab
