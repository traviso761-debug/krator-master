#!/usr/bin/env python3
"""Bake a relief region's small streams into its region.json (`streams`): core/world/PLAN-RELIEF.md, P3 (R6, S5).

    python3 core/world/bake_streams.py <region>           # trace and write openworld/<region>/data/region.json `streams`
    python3 core/world/bake_streams.py <region> --check   # trace again and compare with region.json (exit 1 if stale)
    python3 core/world/bake_streams.py <region> --dry     # trace and print the counts, write nothing

The streams are traced on the page's own land form (core/world 41's WORLD.flowAt: the model, its cliffs, its hills and
ridges, less the channels' cut), so the bake runs the region's land in node, as bake_sites.py does: the rasters decoded
here (world_data.py, with any old `streams` left out, so a re-bake never reads its own result), core/rand, core/terrain's
noise, core/world 40, 43, 44 and 41. Then WSTREAMS.trace (44-world-streams.js) on a CELL grid over the region's box.
tools/scale-model/cut_site.py runs this after the cut for every region with "relief", so a re-cut keeps its streams.

The threshold is the cut's own unit (tools/scale-model/extract_region.py CHANNEL_MIN: a cell's rain, at least
RAIN_FLOOR mm, times its area over 16 km2): a stream starts at FRAC of a channel's flow, so it reaches further up a wet
slope than a dry one; it runs wet where the mean rain over its catchment is WET_MM or more (the owner, 2026-11-15)."""
import json, os, subprocess, sys, tempfile

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
JS = [('core', 'rand', '08-core-rand.js'), ('core', 'terrain', '38-core-relief.js'), None,
      ('core', 'world', '40-world-smooth.js'), ('core', 'world', '43-world-relief.js'), ('core', 'world', '44-world-streams.js'),
      ('core', 'world', '41-world-fields.js')]


def node():
    for c in ('node', r'C:\Program Files\nodejs\node.exe'):
        try:
            subprocess.run([c, '--version'], capture_output=True, check=True)
            return c
        except (OSError, subprocess.CalledProcessError):
            pass
    sys.exit('bake_streams: node not found')


def script(region):
    base = os.path.join(ROOT, 'openworld', region)
    parts = ['"use strict";var window=globalThis;\n']
    for j in JS:
        if j is None:
            parts.append(WD.fragment(os.path.join(base, 'data'), 'var WORLD_KITS=[];\n', 'the region (core/world/bake_streams.py)',
                                     'openworld/%s/data, decoded by core/world/world_data.py' % region))
            parts.append('delete WORLD_DATA.meta.streams;\n')   # the land without its streams: what they are traced on
            continue
        if j[-1] == '41-world-fields.js':   # the landform records first (a relief region's buttes, kopjes, its pinned rock)
            for k in WD.land_js(region):
                parts.append('\n// ---- %s\n' % '/'.join(k) + open(os.path.join(ROOT, *k), encoding='utf-8').read())
        parts.append('\n// ---- %s\n' % '/'.join(j) + open(os.path.join(ROOT, *j), encoding='utf-8').read())
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
const CV=WORLD.streams();
R.lines.forEach((L,t)=>{const P=CV[t].pts,V=WSMOOTH.line(WSTREAMS.decode(L,SR),{step:1e12,relax:SR.relax});
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


def main():
    a = sys.argv[1:]
    if not a or a[0] in ('-h', '--help'):
        sys.exit(__doc__)
    region = a[0]
    rj = os.path.join(ROOT, 'openworld', region, 'data', 'region.json')
    M = json.load(open(rj, encoding='utf-8'))
    if not M.get('relief'):
        sys.exit('bake_streams: %s has no relief (openworld/SITES.json "relief"): its land keeps no streams' % region)
    global CELL
    CELL = max(250.0, 0.4 * M['heights'].get('cell_m', 500.0))
    S = trace(region)
    st = S['stats']
    print('streams %s: %d lines (%d wet), %d vertices, %d heads, %d depression cells, %d tarns; ends %s; %d KB' % (
        region, st['lines'], st['wet'], st['vertices'], st['heads'], st['pits'], st['ponds'], json.dumps(st['ends'], sort_keys=True),
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
