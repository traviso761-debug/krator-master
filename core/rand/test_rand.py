#!/usr/bin/env python3
"""python3 core/rand/test_rand.py: core/rand rebuilt the way krand.gd computes it, checked against golden.json.

Godot is not installed where this repo is built, so this file proves krand.gd's arithmetic instead: it is a line-for-
line transliteration of krand.gd into Python, using the same tricks GDScript needs (64-bit signed ints, so every
32-bit product is split into 16-bit halves and every value is masked to u32; doubles for the noise, in the same
order of operations). If this passes, krand.gd is right unless the transliteration differs from it; krand_test.gd
runs the same vectors inside Godot (godot --headless --script core/rand/krand_test.gd).
"""
import hashlib, json, math, os, struct, sys

M32 = 0xFFFFFFFF
INV = 1.0 / 4294967296.0


def imul(a, b):                       # krand.gd imul(): (a*b) mod 2^32 without a 64-bit overflow
    a &= M32; b &= M32
    return ((a & 0xFFFF) * b + ((((a >> 16) * b) & 0xFFFF) << 16)) & M32


def i32(v):                           # JS ToInt32 of an integer, as u32 bits
    return int(v) & M32


def mix32(h):
    h &= M32
    h ^= h >> 16; h = imul(h, 0x85EBCA6B)
    h ^= h >> 13; h = imul(h, 0xC2B2AE35)
    h ^= h >> 16
    return h


def step(h, v):
    h = imul(h ^ i32(v), 0x9E3779B1)
    return ((h << 13) | (h >> 19)) & M32


def hash_(seed, *vals):
    h = (seed & M32) ^ 0x2545F491
    for v in vals:
        h = step(h, math.floor(v))
    return mix32(h ^ len(vals))


def hash3(seed, a, b, c):
    return mix32(step(step(step((seed & M32) ^ 0x2545F491, a), b), c) ^ 3)


def h3(x, y, z, seed=0):
    return hash3(seed, math.floor(x), math.floor(y), math.floor(z)) * INV


def vnoise(x, y, z, seed=0):
    xi, yi, zi = math.floor(x), math.floor(y), math.floor(z)
    xf, yf, zf = x - xi, y - yi, z - zi
    u = xf * xf * (3 - 2 * xf); v = yf * yf * (3 - 2 * yf); w = zf * zf * (3 - 2 * zf)
    a0 = hash3(seed, xi, yi, zi) * INV; a1 = hash3(seed, xi + 1, yi, zi) * INV
    b0 = hash3(seed, xi, yi + 1, zi) * INV; b1 = hash3(seed, xi + 1, yi + 1, zi) * INV
    c0 = hash3(seed, xi, yi, zi + 1) * INV; c1 = hash3(seed, xi + 1, yi, zi + 1) * INV
    d0 = hash3(seed, xi, yi + 1, zi + 1) * INV; d1 = hash3(seed, xi + 1, yi + 1, zi + 1) * INV
    a = a0 + (a1 - a0) * u; b = b0 + (b1 - b0) * u; c = c0 + (c1 - c0) * u; d = d0 + (d1 - d0) * u
    e = a + (b - a) * v; f = c + (d - c) * v
    return e + (f - e) * w


def fbm(x, y, z, o=3, seed=0):
    a, f, s = 0.0, 1.0, 0.0
    for _ in range(o):
        a += vnoise(x * f, y * f, z * f, seed) / f; s += 1 / f; f *= 2.03
    return a / s


def cell(seed, ix, iz):
    return hash3(seed, ix, iz, 0x51ED)


def child(seed, name):
    h = 0x811C9DC5
    units = struct.unpack('<%dH' % (len(name.encode('utf-16-le')) // 2), name.encode('utf-16-le'))
    for cu in units:
        h = imul(h ^ cu, 0x01000193)
    return hash_(seed, h)


class Stream:
    def __init__(self, seed):
        self.s = seed & M32

    def u32(self):
        s = (self.s + 0x6D2B79F5) & M32
        self.s = s
        t = imul(s ^ (s >> 15), 1 | s)
        t = ((t + imul(t ^ (t >> 7), 61 | t)) & M32) ^ t
        return (t ^ (t >> 14)) & M32

    def next(self):
        return self.u32() * INV

    def range(self, a, b):
        return a + (b - a) * self.next()

    def int(self, a, b):
        return a + math.floor(self.next() * (b - a + 1))


# ---- the vectors: the same recipe as test-rand.js
SEEDS = [0, 1, 2, 3, 7, 11, 42, 99, 1234, 1234567, 2147483647, 2147483648, 4294967295, 2654435769, 31337, 65536,
         16777216, 271828, 314159, 8675309]
NAMES = ['trees', 'rubble', 'a', '', 'Hykkousoi', 'über']
sha = lambda b: hashlib.sha256(b).hexdigest()
u32b = lambda a: struct.pack('<%dI' % len(a), *a)
f64b = lambda a: struct.pack('<%dd' % len(a), *a)


def vectors():
    out = {'streams': [], 'hash': {}, 'noise': {}, 'cell': {}, 'child': []}
    for s in SEEDS:
        st = Stream(s); a = [st.u32() for _ in range(1000)]
        out['streams'].append({'seed': s, 'first': a[:8], 'sha256': sha(u32b(a))})
    g = Stream(99); H = {'one': [], 'two': [], 'three': []}
    for _ in range(1000):
        s = g.u32(); a = g.int(-100000, 100000); b = g.int(-100000, 100000); c = g.int(-100000, 100000)
        H['one'].append(hash_(s, a)); H['two'].append(hash_(s, a, b)); H['three'].append(hash_(s, a, b, c))
    for k, a in H.items():
        out['hash'][k] = {'first': a[:8], 'sha256': sha(u32b(a))}
    g = Stream(2024); N = {'h3': [], 'vnoise': [], 'fbm3': [], 'fbm5': []}
    for i in range(1000):
        x = g.range(-500, 500); y = g.range(-50, 50); z = g.range(-500, 500); s = i % 5
        N['h3'].append(h3(x, y, z, s)); N['vnoise'].append(vnoise(x, y, z, s))
        N['fbm3'].append(fbm(x, y, z, 3, s)); N['fbm5'].append(fbm(x * .01, y * .01, z * .01, 5, s))
    for k, a in N.items():
        out['noise'][k] = {'first': a[:4], 'sha256': sha(f64b(a))}
    g = Stream(7); C = []
    for _ in range(1000):
        s = g.u32(); ix = g.int(-5000, 5000); iz = g.int(-5000, 5000); C.append(cell(s, ix, iz))
    out['cell'] = {'first': C[:8], 'sha256': sha(u32b(C))}
    out['child'] = [[s, n, child(s, n)] for s in SEEDS[:5] for n in NAMES]
    return out


def main():
    gold = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'golden.json'), encoding='utf-8'))
    now = vectors(); bad = 0
    for key in ('streams', 'hash', 'noise', 'cell', 'child'):
        g = gold[key]
        good = now[key] == g
        neg = key == 'streams' and now[key][1:] == g[:-1]
        r = good and not neg
        bad += not r
        print(('PASS  ' if r else 'FAIL  ') + key + ' match golden.json (the krand.gd arithmetic)')
    print(('%d FAILED' % bad) if bad else 'all passed')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
