"""gallery/krator-system: the Krator System (the giant, its moons, Krator and the broken station, their astronomy, and a 3D
orrery). One page, dist/krator-system.html, its own artifact, linked from the gallery's top list: template.html filled with
the globes (pics.json: data URIs drawn from the moon maps, core/materials/library/sky.moon.*), the cards (cards.json), the
orrery (orrery3d.js; three.js r128 from cdnjs) and its maps (maps.json). The numbers are core/atmos's sky model's
(core/atmos/SKY-PLAN.md, on the sky branch until it merges).
    python3 build.py                     rebuild the page
    python3 build.py --globe <atlas>     redraw Krator's globe from the atlas image first"""
import base64, html, io, json, os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
p = json.load(open('pics.json'))


def globe_from(path, centre_u, centre_lat=0.0, N=260):
    """An orthographic globe of an equirectangular map, the view centred on (centre_u, centre_lat deg), lit from the upper left."""
    m = np.asarray(Image.open(path).convert('RGB'), dtype=np.float32) / 255
    H, W, _ = m.shape
    y, x = np.mgrid[0:N, 0:N]; x = (x + 0.5) / N * 2 - 1; y = 1 - (y + 0.5) / N * 2
    r2 = x * x + y * y; z = np.sqrt(np.clip(1 - r2, 0, 1))
    c, s = np.cos(np.radians(centre_lat)), np.sin(np.radians(centre_lat))
    yy = y * c + z * s; zz = -y * s + z * c          # tilt the globe so centre_lat faces the viewer
    lat = np.arcsin(np.clip(yy, -1, 1)); lon = np.arctan2(x, zz)
    u = (centre_u + lon / (2 * np.pi)) % 1.0; v = 0.5 - lat / np.pi
    alb = m[np.clip((v * H).astype(int), 0, H - 1), np.clip((u * W).astype(int), 0, W - 1)]
    L = np.array([-0.62, 0.45, 0.64]); L /= np.linalg.norm(L)
    shade = np.clip(x * L[0] + y * L[1] + z * L[2], 0, 1) * 1.05 + 0.05
    col = np.clip(alb * shade[..., None] * (np.clip(z, 0, 1) ** 0.12)[..., None], 0, 1)
    rim = np.clip(1 - z, 0, 1) ** 3 * 0.35                 # its air: a thin blue limb
    col = np.clip(col + rim[..., None] * np.array([0.35, 0.55, 0.95]) * np.clip(shade, 0.2, 1)[..., None], 0, 1)
    a = np.clip((1 - np.sqrt(r2)) * N * 0.5, 0, 1)
    im = Image.fromarray((np.dstack([col, a]) * 255).astype(np.uint8), 'RGBA'); b = io.BytesIO(); im.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()


# Krator's globe: from the owner's illustrative atlas (not the canonical map), only when asked (--globe <atlas.png>)
if '--globe' in sys.argv:
    p['krator'] = globe_from(sys.argv[sys.argv.index('--globe') + 1], 0.61, -28.0)
    json.dump(p, open('pics.json', 'w'))

t = open('template.html', encoding='utf-8').read()
CSS = """
.orr-cta { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
button { font: 500 13px/1 var(--body); color: var(--bg); background: var(--blue); border: 0; border-radius: 3px; padding: 10px 14px; cursor: pointer; }
button.ghost { background: transparent; color: var(--ink); border: 1px solid var(--line); }
button:focus-visible, select:focus-visible { outline: 2px solid var(--warm); outline-offset: 2px; }
select { font: 13px/1 var(--body); background: var(--panel); color: var(--ink); border: 1px solid var(--line); border-radius: 3px; padding: 8px 10px; }
#orrery { border: 1px solid var(--line); border-radius: 4px; background: #050810; overflow: hidden; }
#orrery .bar { display: flex; flex-wrap: wrap; gap: 10px 14px; align-items: center; padding: 12px 14px; border-bottom: 1px solid var(--line); background: var(--panel); }
#orrery .bar label { font: 500 11px/1 var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--muted); display: flex; gap: 8px; align-items: center; }
#orr-date { margin-left: auto; font: 13px/1.3 var(--mono); text-align: right; font-variant-numeric: tabular-nums; }
#orr { display: block; width: 100%; height: auto; cursor: grab; touch-action: none; }
#orr:active { cursor: grabbing; }
.stage { position: relative; }
#orr-labels { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.orr-lab { position: absolute; left: 0; top: 0; font: 11px/1 var(--mono); color: #c9d2e3; white-space: nowrap; text-shadow: 0 0 3px #000; }
.orr-lab.home { color: var(--blue); }
.orr-hint { font: 11px/1 var(--mono); color: var(--muted); padding: 8px 14px; border-top: 1px solid var(--line); }
.krator .globe { width: 150px; height: 150px; }
"""
if '.orr-cta' not in t:
    t = t.replace('@media (max-width: 760px)', CSS + '@media (max-width: 760px)', 1)
BLOCK = """    <div class="orr-cta"><button id="orr-btn" type="button" aria-controls="orrery" aria-expanded="false">Show the system in motion</button><span class="note">A top-down model, seen from above Krator's north pole.</span></div>
    <div id="orrery" hidden>
      <div class="bar">
        <button id="orr-play" type="button" class="ghost">Pause</button>
        <label for="orr-speed">Speed <select id="orr-speed"><option value="1">1 hour a second</option><option value="6" selected>6 hours a second</option><option value="24">1 day a second</option><option value="96">4 days a second</option><option value="336">2 weeks a second</option></select></label>
        <label for="orr-scale">Distances <select id="orr-scale"><option value="sqrt" selected>compressed</option><option value="lin">true scale</option></select></label>
        <div id="orr-date"></div>
      </div>
      <div class="stage"><canvas id="orr" width="1100" height="700" aria-label="A 3D model of the giant, its rings and its seven moons in motion; drag to turn it, scroll or pinch to zoom"></canvas><div id="orr-labels"></div></div>
      <div class="orr-hint">Drag to turn, scroll or pinch to zoom; double-click a moon to follow it close up, the giant or empty space to come back. The moons are drawn larger than life so they can be seen.</div>
    </div>
"""
if 'orr-btn' not in t:
    t = t.replace('    <p class="note">Distances are drawn to scale', BLOCK + '    <p class="note">Distances are drawn to scale', 1)
KR_OLD = '    <div><div class="eyebrow">You are here</div><h2 id="k-h">Krator</h2></div>'
KR_NEW = ('    <div style="display:grid;gap:12px;justify-items:start"><div><div class="eyebrow">You are here</div><h2 id="k-h">Krator</h2></div>'
          '<img class="globe" data-body="krator" src="{{krator}}" alt="Krator, its crater and the Throne at the centre, the Ring Sea round it, seas to the west" width="150" height="150">'
          '<span class="note" style="font-size:12px">An illustrative map, not the canonical world map</span></div>')
t = t.replace(KR_OLD, KR_NEW, 1)
t = t.replace('{{krator}}', p['krator'])
# the cards (the same text as before), each globe tagged for the orrery
M = json.load(open('cards.json', encoding='utf-8'))
cards = []
for key, name, kind, desc, rows in M:
    dl = ''.join(f'<dt>{a}</dt><dd>{b}</dd>' for a, b in rows)
    cards.append(f'<article class="card"><header><img data-body="{key}" src="{p[key]}" alt="{html.escape(name)}, rendered from its map" width="112" height="112"><div><h3>{name}</h3><span class="tag">{kind}</span></div></header><p>{html.escape(desc)}</p><dl>{dl}</dl></article>')
t = t.replace('{{giant}}', p['giant']).replace('{{cards}}', '\n      '.join(cards))
maps = json.load(open('maps.json'))
t = t.rstrip() + '\n<script>window.ORR_MAPS=' + json.dumps(maps) + ';</script>\n' + open('orrery3d.js', encoding='utf-8').read()
t = t.replace('A top-down model, seen from above Krator\'s north pole.', 'A 3D model you can turn: every moon at its real period, lit by the sun.')
os.makedirs('dist', exist_ok=True)
open(os.path.join('dist', 'krator-system.html'), 'w', encoding='utf-8', newline='\n').write(t)
print(len(t) // 1024, 'KB')
