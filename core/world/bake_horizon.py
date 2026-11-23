#!/usr/bin/env python3
"""Bake Stage 3 (S1) 8-azimuth horizon elevation & sky-visibility textures for a streamed Godot openworld case.

Follows GRAPHICS-TERRAIN-PROPOSAL.md Section 5 (S1):
  - Samples WORLD.H on a 250 m grid (or --step) across the case's chunk/place bounds plus a 40 km outer halo so
    distant mountain ranges outside the streamed corridor still cast real horizon shadows into edge valleys.
  - Marches 8 compass azimuths (d = 0..7 -> d * 45 deg in x-z: 0=+E, 2=+S, 4=-W, 6=-N) out to --reach (40,000 m),
    including planetary curvature drop d^2 / (2 * R_planet) optional or flat regional tangent.
  - Stores square-root-encoded horizon tangents: byte = round(255 * sqrt(clamp(tan_theta / max_tan, 0, 1)))
    in two lossless RGBA8 WebP files under <case>/horizon/tex/ (tracked by Git LFS), giving ~0.12 deg precision
    near sunrise/sunset while representing steep 63 deg gorge walls (max_tan = 2.0).
  - Writes <case>/horizon/horizon.json and records "horizon": "horizon/horizon.json" in <case>/index.json.
"""
import argparse, json, math, os, sys, time
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import landshade as LS   # noqa: E402


def _case_bounds(idx):
    xs, zs = [], []
    for c in (idx.get('chunk') or {}).get('list') or []:
        b = c.get('box') or []
        if len(b) == 4:
            xs.extend([float(b[0]), float(b[2])])
            zs.extend([float(b[1]), float(b[3])])
    for p in idx.get('places') or []:
        b = p.get('box') or []
        if len(b) == 4:
            xs.extend([float(b[0]), float(b[2])])
            zs.extend([float(b[1]), float(b[3])])
    return [min(xs), min(zs), max(xs), max(zs)]


def _raymarch_8dir(H_halo, pad, nx, nz, step_m, reach_m, max_tan=2.0, bias_m=0.35):
    """Vectorized 8-azimuth horizon tangent march over [nz, nx] interior of H_halo [nz + 2*pad, nx + 2*pad]."""
    H = H_halo.astype(np.float32, copy=False)
    H0 = H[pad:pad + nz, pad:pad + nx] + np.float32(bias_m)
    hh_h, hh_w = H.shape

    # Geometric distance schedule: fine near the receiver (1.0 * step), growing by 5.5% per tap out to reach_m
    dists = []
    t = float(step_m)
    while t <= reach_m + 1e-3:
        dists.append(t)
        t += max(float(step_m), t * 0.055)

    yi_base = np.arange(pad, pad + nz, dtype=np.float32)[:, None]
    xi_base = np.arange(pad, pad + nx, dtype=np.float32)[None, :]

    out_tans = np.zeros((8, nz, nx), dtype=np.float32)
    for q in range(8):
        ang = q * (math.pi / 4.0)
        dx = math.cos(ang) / float(step_m)
        dz = math.sin(ang) / float(step_m)
        best = np.zeros((nz, nx), dtype=np.float32)
        for dist in dists:
            fx = xi_base + np.float32(dx * dist)
            fz = yi_base + np.float32(dz * dist)
            ix0 = np.clip(np.floor(fx).astype(np.int32), 0, hh_w - 2)
            iz0 = np.clip(np.floor(fz).astype(np.int32), 0, hh_h - 2)
            ax = np.clip(fx - ix0, 0.0, 1.0)
            az = np.clip(fz - iz0, 0.0, 1.0)
            h00 = H[iz0, ix0]
            h10 = H[iz0, ix0 + 1]
            h01 = H[iz0 + 1, ix0]
            h11 = H[iz0 + 1, ix0 + 1]
            hs = (h00 * (1.0 - ax) + h10 * ax) * (1.0 - az) + (h01 * (1.0 - ax) + h11 * ax) * az
            tan_v = (hs - H0) * np.float32(1.0 / dist)
            np.maximum(best, tan_v, out=best)
        out_tans[q] = best
    return out_tans


def bake_case(region_dir, case_dir, step_m=250, reach_m=40000, max_tan=2.0):
    t0 = time.time()
    idx_path = os.path.join(case_dir, 'index.json')
    if not os.path.isfile(idx_path):
        sys.exit('bake_horizon: missing %s' % idx_path)
    idx = json.load(open(idx_path, encoding='utf-8'))
    box = _case_bounds(idx)
    # Snap box outward by 1 step so every chunk/place boundary lies strictly inside texel centers
    x0 = math.floor(box[0] / step_m) * step_m
    z0 = math.floor(box[1] / step_m) * step_m
    x1 = math.ceil(box[2] / step_m) * step_m
    z1 = math.ceil(box[3] / step_m) * step_m
    nx = int(round((x1 - x0) / step_m)) + 1
    nz = int(round((z1 - z0) / step_m)) + 1
    pad = int(math.ceil(reach_m / step_m)) + 2
    halo_box = (x0 - pad * step_m, z0 - pad * step_m, x1 + pad * step_m, z1 + pad * step_m)

    print('bake_horizon: sampling %s over halo %s at %d m (%d x %d)...'
          % (region_dir, halo_box, step_m, nx + 2 * pad, nz + 2 * pad), flush=True)
    H_halo = LS.sample(region_dir, halo_box, step_m, bench=False)[0]
    t_samp = time.time() - t0
    print('  sampled in %.1f s; marching 8 azimuths to %.0f km over %d x %d...' % (t_samp, reach_m / 1000.0, nx, nz), flush=True)

    tans = _raymarch_8dir(H_halo, pad, nx, nz, step_m, reach_m, max_tan=max_tan)
    # Sky visibility diagnostic (Dozier & Frew 1990: V = 1 - mean(sin^2(theta)))
    t2 = tans * tans
    sin2 = t2 / (1.0 + t2)
    sky_vis = 1.0 - np.mean(sin2, axis=0)

    enc = np.clip(np.round(np.sqrt(np.clip(tans / float(max_tan), 0.0, 1.0)) * 255.0), 0, 255).astype(np.uint8)
    hz0 = np.transpose(enc[0:4], (1, 2, 0))   # [nz, nx, 4]
    hz1 = np.transpose(enc[4:8], (1, 2, 0))   # [nz, nx, 4]

    hz_dir = os.path.join(case_dir, 'horizon')
    tex_dir = os.path.join(hz_dir, 'tex')
    os.makedirs(tex_dir, exist_ok=True)
    f0 = os.path.join(tex_dir, 'horizon0.webp')
    f1 = os.path.join(tex_dir, 'horizon1.webp')
    Image.fromarray(hz0, mode='RGBA').save(f0, 'WEBP', lossless=True, method=4)
    Image.fromarray(hz1, mode='RGBA').save(f1, 'WEBP', lossless=True, method=4)

    doc = {
        'format': 'krator-horizon',
        'version': 1,
        'grid_box': [x0, z0, x1, z1],
        'nx': nx,
        'nz': nz,
        'step_m': step_m,
        'reach_m': reach_m,
        'max_tan': max_tan,
        'files': ['tex/horizon0.webp', 'tex/horizon1.webp'],
        'stats': {
            'sky_vis_min': round(float(sky_vis.min()), 4),
            'sky_vis_p10': round(float(np.percentile(sky_vis, 10)), 4),
            'sky_vis_mean': round(float(sky_vis.mean()), 4),
            'max_tan_p95': round(float(np.percentile(tans.max(axis=0), 95)), 4),
            'bytes': os.path.getsize(f0) + os.path.getsize(f1),
        }
    }
    with open(os.path.join(hz_dir, 'horizon.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(doc, f, indent=2)

    idx['horizon'] = 'horizon/horizon.json'
    with open(idx_path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(idx, f, indent=2, sort_keys=True)

    print('  wrote %s (%d x %d, %.2f MB WebP, sky_vis min=%.3f p10=%.3f mean=%.3f) in %.1f s'
          % (hz_dir, nx, nz, doc['stats']['bytes'] / 1048576.0,
             doc['stats']['sky_vis_min'], doc['stats']['sky_vis_p10'], doc['stats']['sky_vis_mean'], time.time() - t0), flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--region', default='openworld/oidong-highrift')
    ap.add_argument('--case', default='godot/data/world-oidong-highrift')
    ap.add_argument('--step', type=int, default=250)
    ap.add_argument('--reach', type=int, default=40000)
    args = ap.parse_args()
    bake_case(os.path.join(ROOT, args.region), os.path.join(ROOT, args.case), step_m=args.step, reach_m=args.reach)


if __name__ == '__main__':
    main()
