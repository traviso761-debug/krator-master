#!/usr/bin/env python3
"""Split a saved Krator Scale Model page into this build's source: `src/` (the page's markup, style and script, in
fragments) and `data/` (the `DATA` object: each raster as its own PNG or JPEG, each list or object as its own JSON
file, the order and the scalars in `data/model.json`).

    python3 tools/scale-model/model/import_page.py <page.html> [--data-only]

<page.html> is the page as the artifact's `read` saves it (the service's document skeleton round it is dropped) or a
page this build wrote. Run once to set the build up (2026-10-28, from version 90 of the artifact); afterwards only if the
page was changed outside this build, then `build.py --check <page.html>` must pass. `--data-only` leaves `src/` alone.
Writes nothing else. Deterministic.
"""
import base64, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import HERE, SRC, DATA_DIR, ORDER, DATA_PREFIX, strip_wrapper, write_json   # noqa: E402

# where each fragment starts: the first line of the page (after the skeleton) that begins with this text. The DATA line
# sits between '10-panel.html' and '20-decode.js'.
CUTS = [('00-head.html', '<title>'),
        ('10-panel.html', '<div id="stage"></div>'),
        ('20-decode.js', 'const ZONES = '),
        ('21-scene.js', '  // ---- scene ----'),
        ('22-temp-ramp.js', '  // ---- temperature layer'),
        ('23-wind.js', '  // --- wind layer'),
        ('24-temp-map.js', '  const tcv=document.createElement'),
        ('25-zones.js', '  // zone texture'),
        ('26-overlay.js', '  // region overlay: same geometry'),
        ('27-water.js', '  // water surface: one mesh'),
        ('30-vents.js', '  // ---- volcanic vents'),
        ('31-orbit.js', '  // ---- minimal orbit controls'),
        ('32-fly.js', '  // ---- WASD fly'),
        ('33-hover.js', '  // ---- hover readout'),
        ('40-regions.js', '  // ---- regions ----'),
        ('41-region-layers.js', '  // ---- region layers'),
        ('42-labels.js', '  // ---- labels:'),
        ('43-region-list.js', '  function areaKm2('),
        ('44-region-draw.js', '  // drawing'),
        ('45-region-status.js', '  // persistence: shared store'),
        ('50-measure.js', '  // ---- distance ruler'),
        ('51-region-store.js', '  function localSave(){'),
        ('60-settlements.js', '  // ---- settlements layer'),
        ('90-ui.js', '  // ---- UI ----'),
        ('99-tail.html', '</script>')]
RASTER_EXT = {b'\x89PNG': '.png', b'\xff\xd8\xff': '.jpg'}


def split(page):
    lines = page.split('\n')
    k = next(i for i, l in enumerate(lines) if l.startswith(DATA_PREFIX))
    data_line = lines[k]
    starts, at = [], 0
    for name, head in CUTS:
        lo = at if name != '20-decode.js' else k + 1
        i = next(i for i in range(lo, len(lines)) if lines[i].startswith(head))
        if name == '99-tail.html':                   # the last </script>, not the three.js tag's
            i = max(j for j in range(k, len(lines)) if lines[j].startswith(head))
        starts.append(i)
        at = i + 1
    assert starts == sorted(starts) and starts[0] == 0 and starts[2] == k + 1, starts
    assert [n for n, _ in CUTS] == [n for n in ORDER if n != 'DATA']
    frags = {}
    for j, (name, _) in enumerate(CUTS):
        a = starts[j]
        b = starts[j + 1] if j + 1 < len(starts) else len(lines)
        if name == '10-panel.html':
            b = k                                    # the DATA line is the build's, not a fragment's
        body = lines[a:b]
        frags[name] = '\n'.join(body) + ('\n' if b < len(lines) else '')
    return frags, json.loads(data_line[len(DATA_PREFIX):data_line.rindex('}') + 1])


def main():
    path = sys.argv[1]
    page = strip_wrapper(open(path, encoding='utf-8', newline='').read())
    frags, D = split(page)
    if '--data-only' not in sys.argv:
        os.makedirs(SRC, exist_ok=True)
        for name, text in frags.items():
            open(os.path.join(SRC, name), 'w', encoding='utf-8', newline='\n').write(text)
    os.makedirs(DATA_DIR, exist_ok=True)
    order = []
    for key, v in D.items():
        if isinstance(v, str) and len(v) > 1000:     # a raster: base64 PNG or JPEG
            raw = base64.b64decode(v)
            ext = next(e for sig, e in RASTER_EXT.items() if raw.startswith(sig))
            open(os.path.join(DATA_DIR, key + ext), 'wb').write(raw)
            order.append({'key': key, 'file': key + ext})
        elif isinstance(v, (list, dict)):
            write_json(os.path.join(DATA_DIR, key + '.json'), v)
            order.append({'key': key, 'file': key + '.json'})
        else:
            order.append({'key': key, 'value': v})
    write_json(os.path.join(DATA_DIR, 'model.json'), {'keys': order})
    print('src: %d fragments | data: %d keys (%d files)' % (len(frags), len(order), sum('file' in o for o in order)))


if __name__ == '__main__':
    main()
