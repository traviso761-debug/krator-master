#!/usr/bin/env python3
"""The Beacon: the Order of the Beacon's head house and the Sultan's watch fort over the Rift, as a sheet on Xanadu's page
(PLAN.md section 7, the build's steps 0-1; the owner, 2026-11-23: "have beacon and tempest agents do steps 0-1 of their builds").

The page is Xanadu's, as Strongwall's, Erewhon's and Qiblai's are: settlements/xanadu/build.py --kit takes this folder's kit.json
and targets/. Read in place (kit.json "external"):
  - the layout and its rules, src/30-bc-layout.js and src/31-bc-rules.js (the one source: the sheets and this page draw from it),
    and the lamp's night, src/40-bc-lamp.js, on core/sched;
  - the Xanadui fort (kits/xanadu src/80f-xa-fort-data.js, XFORT; src/80g-xa-fort.js, its drawing): the watch fort on the knoll,
    the lamp's plinth in its keep's place (targets/house/90r: a shim until 80g takes beacon:'ancient', KNOWN_ISSUES.md);
  - the Qiblai kit (kits/qiblai/src): the great monastery in the gold dress (qb_monastery, o.v 2) and its helpers.

The ground (gen/69wb-bc-ground.js, generated here at every build, never edited by hand): the scale model 5.1's heights round
the pin sbeacon00001, px 853,1540, bicubic, as Strongwall's page reads the model:
  near  a 4 km square at 20 m round the pin (the knoll, its spur down to the Rift, the saddle, the middle volcano's foot)
  far   an 80 km square at 500 m (the Rift floor to the south, the rim, Erewhon's lake to the north)
The restored knoll (the owner, 2026-11-16: "Restore the knoll"; the scale-model session's d1c7d6682 on
claude/gemini-trade-reconcile) is overlaid from ground/knoll-patch.json while that line is unmerged here; once merged, the
patch's cells equal the model's and the overlay changes nothing. x east, z south, metres from the pin.

    python3 ../../tools/build.py settlements/beacon      # dist/beacon.html
    KRATOR_GL=gpu python3 verify.py dist/beacon.html --assert --views "Overview,The lamp and the fort gate"
"""
import base64, io, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/door', 'core/terrain', 'core/ruins', 'core/sched')   # through Xanadu's build and kit.json

GEN = os.path.join(HERE, 'gen')
H_PNG = 'tools/scale-model/model/data/h.png'
PATCH = 'settlements/beacon/ground/knoll-patch.json'
PIN = (853.0, 1540.0)                  # the Beacon's pin on the 5.1 canvas (sbeacon00001, SETT_ADDED 5.1e13)
M_PER_PX = 2000.0
NEAR = (-2000.0, 2000.0, -2000.0, 2000.0, 20.0)   # x0, x1, z0, z1, step (m)
FAR = (-40000.0, 40000.0, -40000.0, 40000.0, 500.0)


def heights():
    import numpy as np
    from PIL import Image
    im = np.array(Image.open(os.path.join(ROOT, *H_PNG.split('/'))).convert('RGB')).astype(np.float64)
    with io.open(os.path.join(ROOT, *PATCH.split('/')), encoding='utf-8') as fh:
        patch = json.load(fh)
    n = 0
    for x, y, r, g in patch['cells']:
        if im[y, x, 0] != r or im[y, x, 1] != g:
            im[y, x, 0], im[y, x, 1] = r, g
            n += 1
    return (im[..., 0] * 256 + im[..., 1]) / 65535 * 29600 - 2600, n


def ground_fragment():
    import numpy as np
    from scipy import ndimage as nd
    H, patched = heights()

    def grid(box, unit, base):
        x0, x1, z0, z1, step = box
        nx, nz = int(round((x1 - x0) / step)) + 1, int(round((z1 - z0) / step)) + 1
        zz, xx = np.meshgrid(z0 + step * np.arange(nz), x0 + step * np.arange(nx), indexing='ij')   # rows z (south), columns x (east)
        rows, cols = PIN[1] + zz / M_PER_PX, PIN[0] + xx / M_PER_PX
        h = nd.map_coordinates(H, [rows.ravel(), cols.ravel()], order=3, mode='nearest').reshape(nz, nx)
        q = np.clip(np.round((h - base) / unit), -32768, 32767).astype('<i2')
        return ('{x0:%g,z0:%g,x1:%g,z1:%g,step:%g,nx:%d,nz:%d,unit:%g,base:%g,min:%.1f,max:%.1f,b64:"%s"}'
                % (x0, z0, x1, z1, step, nx, nz, unit, base, float(h.min()), float(h.max()), base64.b64encode(q.tobytes()).decode('ascii')))

    near, far = grid(NEAR, 0.1, 0.0), grid(FAR, 1.0, -3000.0)
    cell = float(H[int(PIN[1]), int(PIN[0])])
    return ('/* BC_GROUND: the Beacon\'s ground from the scale model 5.1 (%s), the restored knoll overlaid (%s: %d cells changed),\n'
            '   bicubic round the pin px %g,%g (settlements/beacon/build.py). GENERATED: edit the model. x east, z south, metres from\n'
            '   the pin; a grid row is one z. cell: the model\'s own height at the pin. [G data] */\n'
            'var BC_GROUND={pin:[%g,%g],cell:%.1f,patched:%d,\n near:%s,\n far:%s};\n'
            % (H_PNG, PATCH, patched, PIN[0], PIN[1], PIN[0], PIN[1], cell, patched, near, far))


def write_gen():
    os.makedirs(GEN, exist_ok=True)
    out = os.path.join(GEN, '69wb-bc-ground.js')
    new = ground_fragment()
    old = io.open(out, encoding='utf-8').read() if os.path.exists(out) else None
    if old != new:
        with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(new)


BSRC.note(H_PNG, PATCH)
if not BSRC.LISTING:
    write_gen()

if '--no-checks' not in sys.argv:
    if subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
        sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

_rc = subprocess.call([sys.executable, os.path.join(ROOT, 'settlements', 'xanadu', 'build.py'), '--kit', HERE] + sys.argv[1:],
                      cwd=os.path.join(ROOT, 'settlements', 'xanadu'))
if not _rc:
    BSRC.report()
sys.exit(_rc)
