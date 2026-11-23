#!/usr/bin/env python3
"""The smoothing (core/world/40-world-smooth.js, WSMOOTH) called from Python: the cut (tools/scale-model/extract_region.py
--smooth) runs the one JS implementation in node, so the cut, the page and a Godot port read the same functions.

    import smooth as SM
    E2 = SM.heights(E, px=4.0, cell=500.0)                    # a numpy grid smoothed along its contours
    lines = SM.rivers([{'pts': [[x, z, e], ...], 'width': 80, 'name': 'r033', 'ox': ..., 'oz': ...}])
    E2, lines = SM.run(E, {'px': 4, 'cell': 500}, rivers)     # both in one node call

node is found as core/world/bake_sites.py finds it (NODE, the PATH, C:\\Program Files\\nodejs).
"""
import json, os, subprocess, sys, tempfile

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
JS = [os.path.join(ROOT, 'core', 'rand', '08-core-rand.js'), os.path.join(HERE, '40-world-smooth.js')]

DRIVER = r'''
const fs=require('fs');global.window=global;
for(const f of JOB.js)eval(fs.readFileSync(f,'utf8'));
const out={};
if(JOB.grid){const g=JOB.grid,buf=fs.readFileSync(g.path),E=new Float64Array(buf.buffer,buf.byteOffset,g.nx*g.ny);
 const t=Date.now(),R=WSMOOTH.heights(E,g.nx,g.ny,g.opts);fs.writeFileSync(g.out,Buffer.from(R.buffer));out.grid_s=(Date.now()-t)/1000;}
if(JOB.rivers)out.rivers=JOB.rivers.map(r=>WSMOOTH.river(r.pts,r));
if(JOB.lines)out.lines=JOB.lines.map(r=>WSMOOTH.line(r.pts,r));
fs.writeFileSync(JOB.result,JSON.stringify(out));
'''


def node():
    import shutil
    for c in (os.environ.get('NODE'), shutil.which('node'), r'C:\Program Files\nodejs\node.exe'):
        if c and (shutil.which(c) or os.path.isfile(c)):
            return shutil.which(c) or c
    sys.exit('core/world/smooth.py: node not found (set NODE)')


def run(E=None, opts=None, rivers=None, lines=None):
    """(the smoothed grid or None, [each river's curve], [each line's curve]); rivers and lines are dicts with 'pts' and
    WSMOOTH.river's / WSMOOTH.line's options"""
    with tempfile.TemporaryDirectory() as tmp:
        job = {'js': JS, 'result': os.path.join(tmp, 'out.json')}
        if E is not None:
            E = np.ascontiguousarray(E, dtype='<f8')
            ny, nx = E.shape
            p = os.path.join(tmp, 'grid.f64')
            E.tofile(p)
            job['grid'] = {'path': p, 'out': os.path.join(tmp, 'grid.out.f64'), 'nx': nx, 'ny': ny, 'opts': opts or {}}
        if rivers:
            job['rivers'] = rivers
        if lines:
            job['lines'] = lines
        drv = os.path.join(tmp, 'driver.js')
        with open(drv, 'w', encoding='utf-8', newline='\n') as f:
            f.write('const JOB=' + json.dumps(job) + ';\n' + DRIVER)
        r = subprocess.run([node(), '--max-old-space-size=8192', drv], capture_output=True, text=True, encoding='utf-8')
        if r.returncode:
            sys.exit('core/world/smooth.py: node failed\n' + r.stdout + r.stderr)
        res = json.load(open(job['result'], encoding='utf-8'))
        G = np.fromfile(job['grid']['out'], dtype='<f8').reshape(E.shape) if E is not None else None
        return G, res.get('rivers', []), res.get('lines', [])


def heights(E, **opts):
    return run(E, opts)[0]


def rivers(R):
    return run(rivers=R)[1]


def lines(L):
    return run(lines=L)[2]
