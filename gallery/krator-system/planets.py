"""planets.py: the star's other planets (the owner, 2026-10-26) for the Krator System page: their cards (planets.json)
and their globes (pics.json, keys 'p-<key>'), drawn procedurally (no maps yet). Run before build.py when they change.
Orbits: a Sun-like star; the giant (with Krator) at 1 AU, a 365-day year; P = 365 a^1.5 days."""
import base64, io, json, math, os
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
U = '<span class="u">{}</span>'
def P(a): return 365 * a ** 1.5
# key, name, kind, a (AU), e, inclination, radius (km), mass, look, description, seen from Krator
PL = [
 ('ash', 'Ash', 'Dark cratered planet', .32, .08, 3.0, 3400, '0.11 Earths', 'dark',
  "The innermost: a Mars-sized ball of near-black rock, airless and saturated with craters, its dayside baking at about 200 °C. It never strays more than 19° from the sun, so Krator sees it only low in a bright twilight.",
  'A faint grey spark near the sun at dusk or dawn'),
 ('rust', 'Rust', 'Superterrestrial desert', .55, .05, 1.5, 9500, '3.4 Earths', 'rust',
  "A super-Earth half again Earth's width, Mars-like on a larger scale: rust deserts, dry sea basins, canyons and dust storms under a thin, hot carbon-dioxide sky. Too close to the sun to keep its oceans, it lost them long ago. It is half of a double planet: it and Cinder, an Earth-sized partner, go round a point in empty space between them every fourteen days, 400,000 km apart.",
  'A ruddy evening or morning star, up to 33° from the sun; a telescope splits it from Cinder'),
 ('cinder', 'Cinder', "Rust's partner", .55, .05, 1.5, 6100, '0.9 Earths', 'cinder',
  "Rust's twin in the double planet: an Earth-sized, airless world, greyer and redder than Mars, of iron-stained basalt and old craters, with nothing on it but dust. It and Rust are locked face to face, so each hangs fixed in the other's sky.",
  'Beside Rust, a faint grey spark at the limit of the eye'),
 ('veil', 'Veil', 'Cloud world, a garden below', .763, .02, 2.0, 6300, '0.85 Earths', 'cloud',
  "Venus-like from outside, a world of unbroken pale cloud, but not so hot: under a deck that reflects most of the light, a warm, humid green twilight of forests and shallow seas in thick, breathable-looking air, like Tohul. It goes round the sun three times for every two of the giant's years, a resonance that keeps the two from ever meeting.",
  'The brightest star in the sky after the moons: a white morning or evening star up to 50° from the sun'),
 ('crown', 'Crown', 'Jovian giant', 3.4, .05, 1.2, 71000, '2.6 Jupiters', 'jove',
  "The largest planet of the star: a Jupiter-like giant two and a half times Jupiter's mass, cream and ochre belts with a long-lived red storm, and moons of its own. Its pull shaped the inner system.",
  'A steady bright yellow star, through the night when it is opposite the sun'),
 ('frost', 'Frost', 'Ice giant', 9.0, .03, .8, 22000, '11 Earths', 'ice',
  "A small ice giant, cyan and nearly featureless, wrapped in methane haze, with a faint ring. It takes twenty-seven years to go round the sun once.",
  'A faint blue-green star at the limit of the eye'),
 ('wanderer', 'Wanderer', 'Eccentric small planet', 11.8, .5, 17.0, 2400, '0.06 Earths', 'stone',
  "A Mercury-sized rock on a long, tilted ellipse, swinging from 5.9 AU, inside Frost's orbit, out to 17.7 AU. Like Pluto with Neptune it goes round twice for every three of Frost's years, so the two never meet. Probably flung out by Crown early in the system's history.",
  'Only through a telescope'),
]
def card(k):
    key, name, kind, a, e, inc, R, mass, look, desc, seen = k
    p = P(a)
    yr = f'{p:,.0f} {U.format("days")}' if p < 1000 else f'{p / 365:.1f} {U.format("years")}'
    if key == 'cinder':
        return ['p-cinder', name, kind, desc, [['Orbit', f'round Rust, 400,000 {U.format("km")} apart, the pair round the sun at {a:g} {U.format("AU")}'],
                ['Month', f'14 {U.format("days")}, face to face'], ['Radius', f'{R:,} {U.format("km")}'], ['Mass', mass], ['From Krator', seen]]]
    rows = [['Orbit', f'{a:g} {U.format("AU")} · {a * 149.6:,.0f} {U.format("million km")}'], ['Year', yr],
            ['Eccentricity', f'{e:g}' + (f' · {a * (1 - e):.1f} to {a * (1 + e):.1f} {U.format("AU")}' if e >= .1 else '')],
            ['Tilt to the giant\'s orbit', f'{inc:g}°'], ['Radius', f'{R:,} {U.format("km")}'], ['Mass', mass], ['From Krator', seen]]
    return [ 'p-' + key, name, kind, desc, rows ]
json.dump([card(k) for k in PL], open('planets.json', 'w', encoding='utf-8'), ensure_ascii=False)

# the globes: an orthographic sphere lit from the upper left, its surface from value noise by kind
def vnoise(x, y, seed):
    xi, yi = np.floor(x).astype(int), np.floor(y).astype(int); fx, fy = x - xi, y - yi
    def h(i, j): v = (i * 374761393 + j * 668265263 + seed * 982451653) & 0xffffffff; v = (v ^ (v >> 13)) * 1274126177 & 0xffffffff; return ((v ^ (v >> 16)) & 0xffffffff) / 4294967296.0
    u, w = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    return (h(xi, yi) * (1 - u) + h(xi + 1, yi) * u) * (1 - w) + (h(xi, yi + 1) * (1 - u) + h(xi + 1, yi + 1) * u) * w
def fbm(x, y, seed, oct=5):
    v, a, n = 0, .5, 0
    for o in range(oct): v = v + a * vnoise(x, y, seed + o); n += a; x, y, a = x * 2.03 + 1.7, y * 2.03 + 9.2, a * .5
    return v / n
def globe(kind, N=260):
    y, x = np.mgrid[0:N, 0:N]; x = (x + .5) / N * 2 - 1; y = 1 - (y + .5) / N * 2
    r2 = x * x + y * y; z = np.sqrt(np.clip(1 - r2, 0, 1)); lat = np.arcsin(np.clip(y, -1, 1)); lon = np.arctan2(x, z)
    u, v = lon * 3, lat * 3
    if kind == 'dark':
        n = fbm(u * 2, v * 2, 11); c = .10 + .10 * n
        cr = np.zeros_like(n)
        for i in range(40):
            cx, cy, rr = math.sin(i * 7.1) * 2.7, math.cos(i * 3.7) * 1.4, .08 + .25 * abs(math.sin(i * 1.3)) ** 3
            d = np.hypot(u - cx, v - cy) / rr; cr += np.where(d < 1, -.05 + .09 * np.exp(-((d - .95) / .08) ** 2), 0)
        col = np.dstack([c + cr, c * .97 + cr, c * .93 + cr])
    elif kind == 'cinder':
        n = fbm(u * 2.2, v * 2.2, 71); m = fbm(u * 6, v * 6, 75, 4)
        cr = np.zeros_like(n)
        for i in range(24):
            cx, cy, rr = math.sin(i * 5.3) * 2.6, math.cos(i * 2.9) * 1.3, .1 + .3 * abs(math.sin(i * 1.7)) ** 3
            d = np.hypot(u - cx, v - cy) / rr; cr += np.where(d < 1, -.04 + .07 * np.exp(-((d - .95) / .1) ** 2), 0)
        col = np.dstack([.42 + .14 * n + .05 * m + cr, .33 + .10 * n + .03 * m + cr, .31 + .08 * n + cr])
    elif kind == 'rust':
        n = fbm(u * 1.5, v * 1.5, 21); m = fbm(u * 5, v * 5, 25, 4)
        basin = np.clip((.42 - n) * 4, 0, 1)
        col = np.dstack([.62 + .2 * m - .22 * basin, .30 + .12 * m - .12 * basin, .16 + .06 * m - .05 * basin])
        cap = np.clip((np.abs(lat) - 1.25) * 6, 0, 1)[..., None]; col = col * (1 - cap) + .85 * cap
    elif kind == 'cloud':
        w = fbm(u * 1.2, v * 3, 31, 4); n = fbm(u * 2 + w * 2, v * 6, 33, 5)
        col = np.dstack([.90 + .06 * n, .88 + .05 * n, .78 + .04 * n])
    elif kind == 'jove':
        w = fbm(u * 2, v * 4, 41, 4); b = np.sin(lat * 13 + w * 2.0)
        col = np.dstack([.80 + .12 * b, .66 + .12 * b, .48 + .10 * b])
        sd = np.hypot((lon - .5) / .32, (lat + .38) / .14); spot = np.clip(1 - sd, 0, 1)[..., None]
        col = col * (1 - spot) + np.array([.72, .32, .22]) * spot
    elif kind == 'ice':
        n = fbm(u, v * 5, 51, 3); col = np.dstack([.55 + .04 * n, .80 + .04 * n, .86 + .03 * n])
    else:
        n = fbm(u * 2.5, v * 2.5, 61); col = np.dstack([.52 + .14 * n, .47 + .12 * n, .40 + .10 * n])
    L = np.array([-.62, .45, .64]); L /= np.linalg.norm(L)
    shade = np.clip(x * L[0] + y * L[1] + z * L[2], 0, 1) * 1.05 + .04
    col = np.clip(col * shade[..., None], 0, 1)
    if kind in ('cloud', 'ice', 'jove', 'rust'):
        rim = np.clip(1 - z, 0, 1) ** 3 * (.3 if kind != 'rust' else .15)
        tint = {'cloud': [.95, .9, .8], 'ice': [.6, .85, .95], 'jove': [.9, .8, .6], 'rust': [.9, .6, .45]}[kind]
        col = np.clip(col + rim[..., None] * np.array(tint) * np.clip(shade, .2, 1)[..., None], 0, 1)
    a = np.clip((1 - np.sqrt(r2)) * N * .5, 0, 1)
    im = Image.fromarray((np.dstack([col, a]) * 255).astype(np.uint8), 'RGBA'); b = io.BytesIO(); im.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
pics = json.load(open('pics.json'))
for k in PL: pics['p-' + k[0]] = globe(k[8])
json.dump(pics, open('pics.json', 'w'))
print(len(PL), 'planets')
