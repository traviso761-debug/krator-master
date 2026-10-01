"""Geometry the generators share: decimetre packing for the map files, rectangles, easing, line simplification.

These were copied into every make-*.py; they are here once. The two ways the copies of `simplify` differed are
both kept, because the maps already generated depend on them (see `simplify`).
"""
import math


def q(v):
    """Metres to the integer decimetres the map files store."""
    return int(round(v * 10))


def flat(pts, eps=0.0):
    """[(x, z), ...] in metres to the flat decimetre list the map files store. `eps` is unused (an old signature)."""
    out = []
    for x, z in pts:
        out += [q(x), q(z)]
    return out


def rect(cx, cz, w, d, rot=0.0):
    """The corners of a w x d rectangle centred on (cx, cz), turned by rot."""
    c, s = math.cos(rot), math.sin(rot)
    return [(cx + x * c - z * s, cz + x * s + z * c) for x, z in
            ((-w / 2, -d / 2), (w / 2, -d / 2), (w / 2, d / 2), (-w / 2, d / 2))]


def smoothstep(a, b, v):
    if a == b:
        return 0.0
    t = max(0.0, min(1.0, (v - a) / (b - a)))
    return t * t * (3 - 2 * t)


def simplify(pts, eps=1.0, closed="distance"):
    """Douglas-Peucker, iteratively (a lake shore can be ten thousand points and recursion runs out first).

    `closed` is what happens when the two ends coincide, as they do on a closed ring, so the chord between them
    has no length: "distance" measures each point's distance from that end (the invented cities' generators),
    "drop" treats every point as on the chord and keeps only the ends (build-osm-city and Yellowstone). The
    maps already generated were made each way, so both stay."""
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i0, i1 = stack.pop()
        ax, az = pts[i0]
        bx, bz = pts[i1]
        dx, dz = bx - ax, bz - az
        L = math.hypot(dx, dz)
        worst, wi = 0.0, 0
        for i in range(i0 + 1, i1):
            px, pz = pts[i]
            if L:
                d = abs(dx * (az - pz) - dz * (ax - px)) / L
            else:
                d = math.hypot(px - ax, pz - az) if closed == "distance" else 0.0
            if d > worst:
                worst, wi = d, i
        if worst > eps:
            keep[wi] = True
            stack += [(i0, wi), (wi, i1)]
    return [p for p, k in zip(pts, keep) if k]
