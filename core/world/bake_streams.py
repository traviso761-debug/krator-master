#!/usr/bin/env python3
"""Bake a relief region's small streams into its region.json (`streams`): core/world/PLAN-RELIEF.md, P3 (R6, S5).

    python3 core/world/bake_streams.py <region>                 # trace and write openworld/<region>/data/region.json `streams`
    python3 core/world/bake_streams.py <region> --check         # trace again and compare with region.json (exit 1 if stale)
    python3 core/world/bake_streams.py <region> --dry           # trace and print the counts, write nothing
    python3 core/world/bake_streams.py <region> --world-tiles   # Stage 2 world-tile trace (64 km tiles + 8 km halo + global 2 km inflow)

The streams are traced on the page's own land form (core/world 41's WORLD.flowAt: the model, its cliffs, its hills and
ridges, less the channels' cut), so the bake runs the region's land in node, as bake_sites.py does: the rasters decoded
here (world_data.py, with any old `streams` left out, so a re-bake never reads its own result), core/rand, core/terrain's
noise, core/world 40, 43, 44 and 41. Then WSTREAMS.trace (44-world-streams.js) on a CELL grid over the region's box.
tools/scale-model/cut_site.py runs this after the cut for every region with "relief", so a re-cut keeps its streams.

With `--world-tiles` (or `region.json` `relief.world_tiles: true`, GRAPHICS-TERRAIN-PROPOSAL.md Section 12 item 2),
streams are traced once per fixed 64 km world tile (with an 8 km halo and border inflow from the global 2 km model
accumulation), clipped by directed-step ownership to each tile's `[0, 64 km)` core, and assembled into the region's
world-aligned 250 m stream grid so any two regions overlapping the same place agree identically on stream courses.

The threshold is the cut's own unit (tools/scale-model/extract_region.py CHANNEL_MIN: a cell's rain, at least
RAIN_FLOOR mm, times its area over 16 km2): a stream starts at FRAC of a channel's flow, so it reaches further up a wet
slope than a dry one; it runs wet where the mean rain over its catchment is WET_MM or more (the owner, 2026-11-15)."""
import json, math, os, shutil, subprocess, sys, tempfile
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import world_data as WD   # noqa: E402

CELL = 250.0          # m: the trace's grid (41's hills and ridges reach down to about 400 m); a coarser region's (P8: 1 km cells)
                      # is 0.4 x its cell, so a sub-continental cut does not trace 15 million cells
CHANNEL_MIN = 3.0e4   # tools/scale-model/extract_region.py: the flow a channel starts at
RAIN_FLOOR = 150.0    # mm: as the cut, every cell counts at least this much
FRAC = 1 / 150.0      # a stream starts at this share of a channel's flow: about 3 km2 of catchment at 1000 mm, 21 km2 in a desert
WET_MM = 450.0        # mm: the mean rain over its catchment a stream runs wet from
MIN_LEN = 1500.0      # m: a shorter stream that nothing joins is left out
STEP = 60.0           # m: the curve's step on the page (WSMOOTH.line)
RELAX = 6             # the page's 1-2-1 passes over a line's cells before its curve: D8's staircase (straight runs, 45-degree
                      # jogs) relaxed to the slope's own direction
MEANDER = {'amp': 26.0, 'wave': 140.0}   # m: the page's wander between the relaxed cells (WSMOOTH.curve's meander, zero at each)
INCISE = {'k': 8.0, 'sigma': 1.5, 'iters': 2}   # the trace's incision (44-world-streams.js): m per decade of flow, cells
N8 = [(-1, -1), (0, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (0, 1), (1, 1)]
JS = [('core', 'rand', '08-core-rand.js'), ('core', 'terrain', '38-core-relief.js'), None,
      ('core', 'world', '40-world-smooth.js'), ('core', 'world', '43-world-relief.js'), ('core', 'world', '43m-world-micro.js'),
      ('core', 'world', '43d-world-residual.js'), ('core', 'world', '44-world-streams.js'),
      ('core', 'world', '41-world-fields.js')]


def node():
    for c in ('node', r'C:\Program Files\nodejs\node.exe'):
        try:
            subprocess.run([c, '--version'], capture_output=True, check=True)
            return c
        except (OSError, subprocess.CalledProcessError):
            pass
    sys.exit('bake_streams: node not found')


def _read_opt_js(rel_tuple):
    p = os.path.join(ROOT, *rel_tuple)
    if not os.path.isfile(p):
        return ''
    return '\n// ---- %s\n' % '/'.join(rel_tuple) + open(p, encoding='utf-8').read()


def script(region):
    base = region if os.path.isfile(os.path.join(region, 'region.json')) else os.path.join(ROOT, 'openworld', region, 'data')
    reg_name = os.path.basename(os.path.dirname(os.path.abspath(base))) if os.path.basename(base) == 'data' else region
    parts = ['"use strict";var window=globalThis;\n']
    for j in JS:
        if j is None:
            parts.append(WD.fragment(base, 'var WORLD_KITS=[];\n', 'the region (core/world/bake_streams.py)',
                                     '%s, decoded by core/world/world_data.py' % base.replace(os.sep, '/')))
            parts.append('delete WORLD_DATA.meta.streams;\n')   # the land without its streams: what they are traced on
            continue
        if j[-1] == '41-world-fields.js':   # the landform records first (a relief region's buttes, kopjes, its pinned rock)
            for k in WD.land_js(reg_name):
                parts.append(_read_opt_js(k))
        parts.append(_read_opt_js(j))
    parts.append(r'''
WORLD.init(WORLD_R);
const O=%s;
const B=WORLD.box(),cell=O.cell,x0=Math.ceil(B[0]/cell)*cell,z0=Math.ceil(B[1]/cell)*cell;
const nx=Math.floor((B[2]-x0)/cell)+1,ny=Math.floor((B[3]-z0)/cell)+1,n=nx*ny;
const E=new Float32Array(n),K=new Uint8Array(n),RW=new Float32Array(n),RM=new Float32Array(n),F={},wcell=cell*cell/1e6/16;
let inside=0;
for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const c=j*nx+i,x=x0+i*cell,z=z0+j*cell;
 if(!WORLD.inside(x,z)){K[c]=3;E[c]=WORLD.baseH(x,z);continue;}
 WORLD.flowAt(x,z,F);E[c]=F.h;K[c]=F.K;RM[c]=F.rain;RW[c]=Math.max(F.rain,O.floor)*wcell;inside++;}
const R=WSTREAMS.trace({nx,ny,cell,x0,z0,E,K,RW,RM,amin:O.chan_min*O.frac,chanMin:O.chan_min,wetMM:O.wet_mm,minLen:O.min_len,incise:O.incise});
const ends={};let verts=0,wet=0;for(const L of R.lines){ends[L.e]=(ends[L.e]||0)+1;verts+=L.s.length;wet+=L.w;}
const SR={version:1,by:'core/world/44-world-streams.js (core/world/bake_streams.py)',
 cell,x0,z0,grid:[nx,ny],step:O.step,relax:O.relax,meander:Object.assign({seed:WORLD_DATA.meta.relief.seed},O.meander)};
// the beds: the ground along the curve the page draws (41's streamCurves: WORLD.streams()), the lowest so far from the head,
// read at each cell's own point of the curve (the curve's samples between two relaxed cells: ceil(chord / step))
SR.lines=R.lines;WORLD_DATA.meta.streams=SR;
const CV=WORLD.streams();if(WORLD.setMicroFine)WORLD.setMicroFine(false);   /* the beds under the page's stream corridor: the micro-relief's fine gullies off (PLAN-MICRO.md) */
R.lines.forEach((L,t)=>{const P=CV[t].pts,V=CV[t].verts||WSMOOTH.line(WSTREAMS.decode(L,SR),{step:1e12,relax:SR.relax});
 let lo=1e9;const g=P.map(p=>lo=Math.min(lo,WORLD.Hbare(p[0],p[1],0)));
 const B=[g[0]];let idx=0;for(let k=0;k<V.length-1;k++){idx+=Math.max(1,Math.ceil(Math.hypot(V[k+1][0]-V[k][0],V[k+1][1]-V[k][1])/SR.step));B.push(g[Math.min(idx,g.length-1)]);}
 if(B.length!==L.s.length)throw new Error('bake_streams: line '+t+' has '+L.s.length+' cells and '+B.length+' beds');
 WSTREAMS.rebed(L,B);});
delete SR.lines;   /* written last */
process.stdout.write(JSON.stringify(Object.assign(SR,{amin:O.chan_min*O.frac,chan_min:O.chan_min,rain_floor:O.floor,wet_mm:O.wet_mm,min_len:O.min_len,incise:O.incise,
 stats:{cells_inside:inside,stream_cells:R.cells,heads:R.heads,pits:R.pits,lines:R.lines.length,vertices:verts,wet,ends,ponds:R.ponds.length},
 ponds:R.ponds,
 note:'core/world/PLAN-RELIEF.md P3: 44-world-streams.js says how a line is encoded; 41 decodes, curves and carves them',
 lines:R.lines})));
''' % json.dumps({'cell': CELL, 'chan_min': CHANNEL_MIN, 'frac': FRAC, 'floor': RAIN_FLOOR, 'wet_mm': WET_MM, 'min_len': MIN_LEN, 'step': STEP, 'relax': RELAX, 'meander': MEANDER, 'incise': INCISE}))
    return ''.join(parts)


def trace(region):
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(script(region))
        tmp = f.name
    try:
        r = subprocess.run([node(), '--stack-size=8000', '--max-old-space-size=6000', tmp], capture_output=True, text=True, encoding='utf-8')
    finally:
        os.remove(tmp)
    if r.returncode:
        sys.exit('bake_streams: node failed:\n' + r.stderr[-4000:])
    return json.loads(r.stdout)


def _clip_line_to_core(L, halo_n, core_n):
    """Split a tile-traced line `L` into sub-lines consisting of directed steps whose starting cell `(i, j)` lies in
    `[halo_n, halo_n + core_n)` x `[halo_n, halo_n + core_n)`. Returns sub-lines in tile-core coordinates `0..core_n`."""
    i, j = int(L['h'][0]), int(L['h'][1])
    b = int(L['b'])
    dbs = [int(x) for x in L['db'].split(',')] if L['db'] else []
    cells = [(i, j, L['s'][0], b)]
    for k, ch_d in enumerate(L['d']):
        di, dj = N8[int(ch_d)]
        i += di
        j += dj
        b -= dbs[k]
        cells.append((i, j, L['s'][k + 1], b))

    in_core = lambda ii, jj: (halo_n <= ii < halo_n + core_n) and (halo_n <= jj < halo_n + core_n)
    out = []
    k = 0
    m = len(cells) - 1
    while k < m:
        if not in_core(cells[k][0], cells[k][1]):
            k += 1
            continue
        k0 = k
        while k < m and in_core(cells[k][0], cells[k][1]):
            k += 1
        # Step range [k0 .. k-1], vertices [k0 .. k]
        sub = cells[k0:k + 1]
        d_sub = L['d'][k0:k]
        s_sub = ''.join(c[2] for c in sub)
        b0 = sub[0][3]
        db_sub = ','.join(str(sub[q][3] - sub[q + 1][3]) for q in range(len(sub) - 1))
        end_code = L['e'] if k == m else 'x'
        out.append({
            'h': [sub[0][0] - halo_n, sub[0][1] - halo_n],
            'd': d_sub,
            'b': b0,
            'db': db_sub,
            's': s_sub,
            'w': L['w'],
            'e': end_code,
        })
    return out


def trace_world_tile(tx, tz, cache_dir=None, relief_micro=2, relief_seed=5391948, extra_pins_region=None):
    """Trace one canonical 64 km world tile `(tx, tz)` at 250 m with an 8 km halo (`320 x 320` grid) and border inflow
    from the global 2 km accumulation, returning `{tx, tz, cell: 250.0, wx0, wz0, lines, ponds, stats}` in tile-core
    coordinates `[0..256]` (`wx = tx * 64000 + i * 250`)."""
    import world_tiles as WT
    if cache_dir:
        os.makedirs(cache_dir, exist_ok=True)
        cache_json = os.path.join(cache_dir, 'streams_t_%d_%d_m%d.json' % (tx, tz, relief_micro))
        if os.path.isfile(cache_json):
            return json.load(open(cache_json, encoding='utf-8'))

    td = tempfile.mkdtemp(prefix='krator_wt_%d_%d_' % (tx, tz))
    try:
        tmeta = WT.extract_world_tile_data(tx, tz, td, halo_px=WT.HALO_PX, upsample=4.0,
                                           relief_micro=relief_micro, relief_seed=relief_seed)
        ox = tmeta['frame']['origin_px'][0] * WT.M_PER_PX
        oz = tmeta['frame']['origin_px'][1] * WT.M_PER_PX
        cell = WT.CELL_M
        halo_n = WT.HALO_N
        core_n = WT.CORE_N
        nx = ny = core_n + 2 * halo_n  # 320
        wx0 = tx * WT.TILE_M - WT.HALO_M
        wz0 = tz * WT.TILE_M - WT.HALO_M
        x0_loc = wx0 - ox
        z0_loc = wz0 - oz

        # Global 2 km inflow along the 1-cell border inside the halo (i=1, i=nx-2, j=1, j=ny-2)
        inflow = []
        pts_w = []
        ij_list = []
        for j in range(1, ny - 1):
            for i in range(1, nx - 1):
                if i in (1, nx - 2) or j in (1, ny - 2):
                    ij_list.append((i, j))
                    pts_w.append((wx0 + i * cell, wz0 + j * cell))
        wx_a = np.array([p[0] for p in pts_w], dtype=np.float64)
        wz_a = np.array([p[1] for p in pts_w], dtype=np.float64)
        _, acc_ch = WT.sample_global_inflow(wx_a, wz_a)
        for (i, j), ach in zip(ij_list, acc_ch):
            if ach >= CHANNEL_MIN * FRAC * 0.5 and ach < CHANNEL_MIN:
                inflow.append([int(j * nx + i), round(float(ach), 2)])

        parts = ['"use strict";var window=globalThis;\n']
        for j_item in JS:
            if j_item is None:
                parts.append(WD.fragment(td, 'var WORLD_KITS=[];\n', 'world_tile_%d_%d' % (tx, tz), td.replace(os.sep, '/')))
                continue
            if j_item[-1] == '41-world-fields.js':
                for k in WD.land_js(extra_pins_region or ''):
                    parts.append(_read_opt_js(k))
            parts.append(_read_opt_js(j_item))

        cfg = {
            'nx': nx, 'ny': ny, 'cell': cell, 'x0': x0_loc, 'z0': z0_loc,
            'halo_n': halo_n, 'core_n': core_n,
            'chan_min': CHANNEL_MIN, 'frac': FRAC, 'floor': RAIN_FLOOR,
            'wet_mm': WET_MM, 'min_len': MIN_LEN, 'step': STEP, 'relax': RELAX,
            'meander': MEANDER, 'incise': INCISE, 'inflow': inflow,
        }
        parts.append(r"""
WORLD.init(WORLD_R);
const O=%s;
const nx=O.nx,ny=O.ny,n=nx*ny,cell=O.cell,x0=O.x0,z0=O.z0,wcell=cell*cell/1e6/16;
const E=new Float32Array(n),K=new Uint8Array(n),RW=new Float32Array(n),RM=new Float32Array(n),F={};
let inside=0;
for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
 const c=j*nx+i,x=x0+i*cell,z=z0+j*cell;
 WORLD.flowAt(x,z,F);E[c]=F.h;K[c]=(F.K===3?0:F.K);RM[c]=F.rain;RW[c]=Math.max(F.rain,O.floor)*wcell;inside++;
}
// Add upstream catchment weight along the halo perimeter from the global 2 km model accumulation
for(const [c,ach] of O.inflow){if(!K[c])RW[c]+=ach;}
const R=WSTREAMS.trace({nx,ny,cell,x0,z0,E,K,RW,RM,amin:O.chan_min*O.frac,chanMin:O.chan_min,wetMM:O.wet_mm,minLen:O.min_len,incise:O.incise});
const SR={version:1,cell,x0,z0,grid:[nx,ny],step:O.step,relax:O.relax,meander:Object.assign({seed:WORLD_DATA.meta.relief.seed},O.meander)};
SR.lines=R.lines;WORLD_DATA.meta.streams=SR;
const CV=WORLD.streams();if(WORLD.setMicroFine)WORLD.setMicroFine(false);
R.lines.forEach((L,t)=>{const P=CV[t].pts,V=WSMOOTH.line(WSTREAMS.decode(L,SR),{step:1e12,relax:SR.relax});
 let lo=1e9;const g=P.map(p=>lo=Math.min(lo,WORLD.Hbare(p[0],p[1],0)));
 const B=[g[0]];let idx=0;for(let k=0;k<V.length-1;k++){idx+=Math.max(1,Math.ceil(Math.hypot(V[k+1][0]-V[k][0],V[k+1][1]-V[k][1])/SR.step));B.push(g[Math.min(idx,g.length-1)]);}
 WSTREAMS.rebed(L,B);});
process.stdout.write(JSON.stringify({lines:R.lines,ponds:R.ponds,cells:R.cells,heads:R.heads,pits:R.pits}));
""" % json.dumps(cfg))
        js_file = os.path.join(td, 'trace_tile.js')
        with open(js_file, 'w', encoding='utf-8', newline='\n') as f:
            f.write(''.join(parts))
        r = subprocess.run([node(), '--stack-size=8000', '--max-old-space-size=6000', js_file],
                           capture_output=True, text=True, encoding='utf-8')
        if r.returncode != 0:
            raise RuntimeError('trace_world_tile (%d,%d) failed:\n%s' % (tx, tz, r.stderr[-3000:]))
        raw = json.loads(r.stdout)

        core_lines = []
        for L in raw['lines']:
            core_lines.extend(_clip_line_to_core(L, halo_n, core_n))

        core_ponds = []
        for P in raw['ponds']:
            ci, cj = P['c'][0] - halo_n, P['c'][1] - halo_n
            if not (0 <= ci < core_n and 0 <= cj < core_n):
                continue
            rows_out = []
            for tok in P['r'].split(';'):
                rj_s, rng_s = tok.split(':')
                i0_s, i1_s = rng_s.split('-')
                rj = int(rj_s) - halo_n
                ri0 = max(0, int(i0_s) - halo_n)
                ri1 = min(core_n - 1, int(i1_s) - halo_n)
                if 0 <= rj < core_n and ri0 <= ri1:
                    rows_out.append('%d:%d-%d' % (rj, ri0, ri1))
            if rows_out:
                core_ponds.append({'c': [ci, cj], 'l': P['l'], 'd': P['d'], 'r': ';'.join(rows_out)})

        out = {
            'format': 'krator-world-tile-streams',
            'version': 1,
            'tx': tx,
            'tz': tz,
            'cell': cell,
            'core_n': core_n,
            'wx0': tx * WT.TILE_M,
            'wz0': tz * WT.TILE_M,
            'lines': core_lines,
            'ponds': core_ponds,
        }
        if cache_dir:
            with open(cache_json, 'w', encoding='utf-8', newline='\n') as f:
                json.dump(out, f, separators=(',', ':'))
        return out
    finally:
        shutil.rmtree(td, ignore_errors=True)


def trace_region_from_world_tiles(region_or_data, cache_dir=None, relief_micro=None):
    """Assemble `region.json` `streams` for `region_or_data` from fixed 64 km world tiles (`WT.tiles_for_region`),
    translating tile-core 250 m cells into the region's local `(x0, z0, grid)` frame and filtering to `mask.png`."""
    import world_tiles as WT
    data_dir = region_or_data if os.path.isfile(os.path.join(region_or_data, 'region.json')) else os.path.join(ROOT, 'openworld', region_or_data, 'data')
    reg_name = os.path.basename(os.path.dirname(os.path.abspath(data_dir))) if os.path.basename(data_dir) == 'data' else ''
    M = WD.meta(data_dir)
    R = WD.arrays(data_dir)
    mc = relief_micro if relief_micro is not None else (2 if M.get('relief', {}).get('micro') == 2 else 1)
    seed = M.get('relief', {}).get('seed', 5391948)

    cx, cy = M['frame']['origin_px']
    ox, oz = cx * WT.M_PER_PX, cy * WT.M_PER_PX
    bx0, by0, bx1, by1 = M['frame']['box_px']
    W, H = M['frame']['size_px']
    mask = R['mask'].reshape(H, W) > 127

    cell = WT.CELL_M
    x0 = math.ceil(((bx0 - cx) * WT.M_PER_PX) / cell) * cell
    z0 = math.ceil(((by0 - cy) * WT.M_PER_PX) / cell) * cell
    x1 = (bx1 - cx) * WT.M_PER_PX
    z1 = (by1 - cy) * WT.M_PER_PX
    nx = int(math.floor((x1 - x0) / cell)) + 1
    ny = int(math.floor((z1 - z0) / cell)) + 1

    def inside_local(x, z):
        u = int(min(max(0, round(cx + x / WT.M_PER_PX - bx0)), W - 1))
        v = int(min(max(0, round(cy + z / WT.M_PER_PX - by0)), H - 1))
        return bool(mask[v, u])

    tiles = WT.tiles_for_region(data_dir)
    reg_lines = []
    reg_ponds = []
    ends = {}
    verts = 0
    wet = 0
    for tx, tz in tiles:
        ts = trace_world_tile(tx, tz, cache_dir=cache_dir, relief_micro=mc, relief_seed=seed,
                              extra_pins_region=reg_name if reg_name in WD.PINS else None)
        # Integer offset from tile core (0, 0) to region stream grid (x0, z0)
        di0 = int(round((ts['wx0'] - ox - x0) / cell))
        dj0 = int(round((ts['wz0'] - oz - z0) / cell))

        for L in ts['lines']:
            hi, hj = L['h'][0] + di0, L['h'][1] + dj0
            # Keep line if any vertex of the line falls inside the region's polygon
            ii, jj = hi, hj
            any_in = (0 <= ii < nx and 0 <= jj < ny and inside_local(x0 + ii * cell, z0 + jj * cell))
            if not any_in:
                for ch_d in L['d']:
                    step_ij = N8[int(ch_d)]
                    ii += step_ij[0]
                    jj += step_ij[1]
                    if 0 <= ii < nx and 0 <= jj < ny and inside_local(x0 + ii * cell, z0 + jj * cell):
                        any_in = True
                        break
            if not any_in:
                continue
            L_reg = dict(L, h=[hi, hj])
            reg_lines.append(L_reg)
            ends[L_reg['e']] = ends.get(L_reg['e'], 0) + 1
            verts += len(L_reg['s'])
            wet += int(L_reg['w'])

        for P in ts['ponds']:
            pi, pj = P['c'][0] + di0, P['c'][1] + dj0
            if not (0 <= pi < nx and 0 <= pj < ny and inside_local(x0 + pi * cell, z0 + pj * cell)):
                continue
            rows_reg = []
            for tok in P['r'].split(';'):
                rj_s, rng_s = tok.split(':')
                i0_s, i1_s = rng_s.split('-')
                rj = int(rj_s) + dj0
                ri0 = max(0, int(i0_s) + di0)
                ri1 = min(nx - 1, int(i1_s) + di0)
                if 0 <= rj < ny and ri0 <= ri1:
                    rows_reg.append('%d:%d-%d' % (rj, ri0, ri1))
            if rows_reg:
                reg_ponds.append({'c': [pi, pj], 'l': P['l'], 'd': P['d'], 'r': ';'.join(rows_reg)})

    inside_cells = int(mask.sum() * ((WT.M_PER_PX / cell) ** 2))
    SR = {
        'version': 1,
        'world_tiles': [list(t) for t in tiles],
        'by': 'core/world/44-world-streams.js (core/world/bake_streams.py --world-tiles)',
        'cell': cell,
        'x0': x0,
        'z0': z0,
        'grid': [nx, ny],
        'step': STEP,
        'relax': RELAX,
        'meander': dict({'seed': seed}, **MEANDER),
        'amin': CHANNEL_MIN * FRAC,
        'chan_min': CHANNEL_MIN,
        'rain_floor': RAIN_FLOOR,
        'wet_mm': WET_MM,
        'min_len': MIN_LEN,
        'incise': INCISE,
        'stats': {
            'tiles': len(tiles),
            'cells_inside': inside_cells,
            'stream_cells': verts,
            'heads': len(reg_lines),
            'pits': len(reg_ponds),
            'lines': len(reg_lines),
            'vertices': verts,
            'wet': wet,
            'ends': ends,
            'ponds': len(reg_ponds),
        },
        'ponds': reg_ponds,
        'note': 'World-tile stream trace (64 km tiles + 8 km halo + global 2 km inflow): region-independent courses',
        'lines': reg_lines,
    }
    return SR


def main():
    a = sys.argv[1:]
    if not a or a[0] in ('-h', '--help'):
        sys.exit(__doc__)
    region = a[0]
    rj = os.path.join(region, 'region.json') if os.path.isfile(os.path.join(region, 'region.json')) else os.path.join(ROOT, 'openworld', region, 'data', 'region.json')
    M = json.load(open(rj, encoding='utf-8'))
    if not M.get('relief'):
        sys.exit('bake_streams: %s has no relief (openworld/SITES.json "relief"): its land keeps no streams' % region)
    use_tiles = ('--world-tiles' in a) or bool(M['relief'].get('world_tiles'))
    cache_dir = a[a.index('--tile-cache') + 1] if '--tile-cache' in a else None
    global CELL
    CELL = max(250.0, 0.4 * M['heights'].get('cell_m', 500.0))
    S = trace_region_from_world_tiles(os.path.dirname(rj), cache_dir=cache_dir) if use_tiles else trace(region)
    st = S['stats']
    print('streams %s%s: %d lines (%d wet), %d vertices, %d heads, %d depression cells, %d tarns; ends %s; %d KB' % (
        region, ' [world-tiles]' if use_tiles else '',
        st['lines'], st['wet'], st['vertices'], st['heads'], st['pits'], st['ponds'], json.dumps(st['ends'], sort_keys=True),
        len(json.dumps(S['lines'], separators=(',', ':'))) // 1024))
    if '--dry' in a:
        return
    if '--check' in a:
        same = M.get('streams') == S
        print('  check: %s' % ('same' if same else 'STALE (run python3 core/world/bake_streams.py %s)' % region))
        sys.exit(0 if same else 1)
    M['streams'] = S
    with open(rj, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(M, f, ensure_ascii=False, indent=1)
    print('  -> %s' % os.path.relpath(rj, ROOT).replace(os.sep, '/'))


if __name__ == '__main__':
    main()
