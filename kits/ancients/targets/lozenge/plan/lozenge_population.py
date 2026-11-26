"""Population of the quarter-height, terraced Arccube, the Lozenge (kits/ancients/targets/lozenge/89d5-89d8, 2026-10-27).

Floor that has daylight, two kinds:
  FACE ROWS  the sloped faces are flights of one-storey steps (riser 25.6/7 m, tread 14.6 m). Behind every
             riser is one row of homes 14.6 m deep, roofed by the next tread (the field on the upper faces,
             the overhang on the lower). Counted on a 2 m plan grid: one storey per square metre of face plan
             not cut by a well, the spine, the blind corner piers, a court, or (ruin) the bite and the spall.
             Lower-face rows count only where the face is >= LOWMIN m over the plain (nearer the keel it is a
             dim undercroft: works and stores).
  DEEP LIT   everything else within D of open air that is not the face (well walls, the void, the end craters,
             the courts, the ruin's fracture, the piers' four walls): 5 m voxels, Euclidean distance.
Population = lit floor x dwelling share / gross m2 per person.
"""
import math, numpy as np
from scipy.ndimage import distance_transform_edt

STOREY = 25.6 / 7
SQ2 = math.sqrt(2)
LOWMIN = 40.


def build(ruin=False, cell=5., VS=.25, HTT=375., S=1000.):
    RD = S / SQ2; RH = RD * VS; KY = HTT - 2 * RH; CY = KY + RH; HX = S / 2
    BR = [RD, 560, 430, 300, 152]; DPX = [0, 24, 52, 86]
    WWX, WDEP = 40, 60; WQ = RD - WDEP / VS; WT0, WT1 = .036, .964
    WX = [-420 + i * 140 for i in range(7)]
    SPW2, PIERX = 30, 440
    CQX0, CQX1, CQT0, CQT1 = 305, 432, .13, .30
    PRZ, PHX, PHZ, PCHZ = 380, 52, 90, 75
    piers = [(px, pz, PHZ) for pz in (-PRZ, PRZ) for px in (-420, -210, 0, 210, 420)]
    piers += [(px, 0., PCHZ) for px in (-420, 0, 420)]
    if ruin: piers = [p for p in piers if not (p[0] == 420 and p[1] > 0)]
    BX0, BRMAX = -HX - 20, 400
    SPX, SPW, SPT, SPTH = 175, 135, .225, .12

    def holes(X, Z, t, upper):
        h = np.abs(X) > PIERX                       # blind corner piers
        h |= np.abs(X) < SPW2                       # the spine
        w = np.zeros_like(h)
        for i, wx in enumerate(WX):
            if i != 3: w |= np.abs(X - wx) < WWX / 2
        h |= w & (t > WT0) & (t < WT1)
        if upper: h |= (t > CQT0) & (t < CQT1) & (np.abs(X) > CQX0) & (np.abs(X) < CQX1)
        return h

    def bite(X, Y, Z):
        if not ruin: return np.zeros(np.broadcast(X, Y, Z).shape, bool)
        f = np.clip((X - BX0) / (HX - BX0), 0, 1)
        return (Z > 0) & (np.hypot(RD - Z, (Y - CY) / VS) < BRMAX * (.7 + .3 * f ** 1.3))

    # ---- face rows, on a 2 m plan grid ------------------------------------------------
    g = 2.
    xs = np.arange(-HX, HX, g) + g / 2; zs = np.arange(-RD, RD, g) + g / 2
    X, Z = np.meshgrid(xs, zs, indexing='ij')
    rows = {}
    for side in ('upper', 'lower'):
        up = side == 'upper'
        t = np.abs(Z) / (2 * RD) if up else 1 - np.abs(Z) / (2 * RD)
        Y = CY + VS * (RD - np.abs(Z)) * (1 if up else -1)
        keep = ~holes(X, Z, t, up) & ~bite(X, Y, Z)
        if up:
            keep &= (t > .036) & (t < .465)        # FTA..FTE: the terraces
            if ruin: keep &= ~((Z > 0) & (np.hypot((X - SPX) / SPW, (t - SPT) / SPTH) < 1))
        else:
            keep &= (t > .56) & (t < .99576) & (Y >= LOWMIN)   # FTD..TK, and clear of the undercroft
        rows[side] = keep.sum() * g * g
        rows[side + '_plan'] = ((t > .036) & (t < .465) if up else (t > .56)).sum() * g * g

    # ---- deep lit floor, on 5 m voxels -------------------------------------------------
    xs = np.arange(-HX - 2 * cell, HX + 2 * cell, cell) + cell / 2
    zs = np.arange(-RD - 2 * cell, RD + 2 * cell, cell) + cell / 2
    ys = np.arange(-2 * cell, HTT + 6 * cell, cell) + cell / 2
    X, Z, Y = np.meshgrid(xs, zs, ys, indexing='ij')
    q = np.abs(Z) + np.abs(Y - CY) / VS
    dpx = np.where(q >= BR[1], DPX[0], np.where(q >= BR[2], DPX[1], np.where(q >= BR[3], DPX[2], DPX[3])))
    mass = (q <= RD) & (q >= BR[4]) & (np.abs(X) <= HX - dpx)
    with np.errstate(divide='ignore', invalid='ignore'):
        t = np.where(q > 0, (1 - (Y - CY) / (VS * q)) * .5, .5)
    well = np.zeros_like(mass)
    for i, wx in enumerate(WX):
        if i != 3: well |= np.abs(X - wx) < WWX / 2
    well &= (t > WT0) & (t < WT1) & (q > WQ)
    court = (t > CQT0) & (t < CQT1) & (np.abs(X) > CQX0) & (np.abs(X) < CQX1) & (q > RD - 24 / VS)
    mass &= ~well & ~court
    if ruin:
        sp = (Z > 0) & (Y > CY) & (np.hypot((X - SPX) / SPW, (t - SPT) / SPTH) < 1) & (q > RD - 120)
        mass &= ~bite(X, Y, Z) & ~sp
    pier = np.zeros_like(mass)
    for px, pz, hz in piers:
        pier |= (np.abs(X - px) < PHX) & (np.abs(Z - pz) < hz) & (Y > 0) & (Y < CY) & (q > RD)
    solid = mass | pier
    air = ~solid & (Y >= 0)
    # air beside the sloped faces does not count for the mass: the face rows carry it
    faceAir = air & (q > RD) & (np.abs(X) <= HX)
    dOther = distance_transform_edt(~(air & ~faceAir), sampling=cell)
    dAll = distance_transform_edt(~air, sampling=cell)
    band = (RD - q) < STOREY / VS                       # the face rows' own storey
    vol = cell ** 3
    out = dict(rows_upper=rows['upper'], rows_lower=rows['lower'], plan_upper=rows['upper_plan'],
               vol_mass=mass.sum() * vol, vol_pier=pier.sum() * vol, gfa_all=solid.sum() * vol / STOREY)
    for D in (10, 20, 30):
        out[f'deep{D}'] = (mass & ~band & (dOther <= D)).sum() * vol / STOREY
        out[f'pier{D}'] = (pier & (dAll <= D)).sum() * vol / STOREY
    return out


CASES = {'low': (10, .65, 45, 1), 'mid': (20, .70, 30, 1), 'high': (30, .75, 20, 2)}  # D, share, m2/p, face rows deep


if __name__ == '__main__':
    for ruin in (False, True):
        r = build(ruin)
        print('ruin' if ruin else 'whole', {k: round(v / 1e4, 1) for k, v in r.items()}, '(ha)')
        for c, (D, sh, a, nrow) in CASES.items():
            face = (r['rows_upper'] + r['rows_lower']) * nrow
            lit = face + r[f'deep{D}'] + r[f'pier{D}']
            print(f"  {c:4s}: face rows {face/1e4:6.1f} ha + deep {r[f'deep{D}']/1e4:6.1f} + piers {r[f'pier{D}']/1e4:5.1f} "
                  f"= {lit/1e4:6.1f} ha lit; pop {lit*sh/a:9.0f}; per ha of footprint {lit*sh/a/141.4:6.0f}")
