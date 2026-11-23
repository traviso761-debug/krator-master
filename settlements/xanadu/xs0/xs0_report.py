#!/usr/bin/env python3
"""XS0: fold the run JSONs (g*.json; noshadow.json, a run without ?shadow=1) and fam.json in <work dir> into the raw
XS0-MEASURE.json and print one line per page.

Usage: python3 xs0_report.py <out.json> <work dir>
"""
import glob, json, os, sys

SP = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else os.getcwd()   # the folder with fam.json and the run JSONs
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
CAP = 16 * 2 ** 20
fam = json.load(open(os.path.join(SP, 'fam.json')))
runs = {}
for f in sorted(glob.glob(os.path.join(SP, 'g*.json'))):
    runs.update(json.load(open(f)))
# cloud.json: an earlier XS0-MEASURE.json (the SwiftShader run, f339af03), kept beside each page for comparison
sw = json.load(open(os.path.join(SP, 'cloud.json'), encoding='utf-8')).get('pages', {}) if os.path.isfile(os.path.join(SP, 'cloud.json')) else {}
fs = json.load(open(os.path.join(SP, 'fs.json'))) if os.path.isfile(os.path.join(SP, 'fs.json')) else {}
nos = json.load(open(os.path.join(SP, 'noshadow.json'))) if os.path.isfile(os.path.join(SP, 'noshadow.json')) else {}
ORDER = ['erewhon', 'xanadu-sheet', 'pher', 'kirstabal', 'thalaba', 'thalaba-pieces', 'lightwall', 'qiblai', 'strongwall',
         'flashing-eye', 'viridian', 'viridian-sheet', 'azure-dream', 'azure-dream-summit', 'azure-dream-west-end',
         'azure-dream-north-shore', 'azure-dream-east-end', 'nulab', 'blakhed', 'xanadu-lake-shore', 'xanadu-north-shore', 'xanadu-oidong-highrift']


def fclass(build, f):
    e = fam.get(build, {}).get('families', {}).get(f)
    if e is None:
        return '?', None
    return e['class'] or 'unclassed', e


def fams_of(r):
    seen = {}
    for key in ('families_loaded', 'families_end'):
        for x in (r.get(key) or {}).get('fams', []):
            k = x['build'] + '|' + x['fam']
            s = seen.setdefault(k, {'build': x['build'], 'fam': x['fam'], 'lib': x['lib'], 'drawn': False, 'decoded': False,
                                    'mats': 0, 'alphaTest': 0, 'transparent': False, 'slots': sorted(x['slots'])})
            s['drawn'] |= x['drawn']; s['decoded'] |= x['decoded']; s['mats'] = max(s['mats'], x['mats'])
            s['alphaTest'] = max(s['alphaTest'], x['alphaTest']); s['transparent'] |= x['transparent']
    for s in seen.values():
        c, e = fclass(s['build'], s['fam'])
        s['class'] = c
        s['xs1Class'] = e and e.get('xs1Class')
        s['rule'] = bool(e and e['rule'])
        s['roughMean'] = e and e['roughMean']
        if c not in ('cut-out',) and s['drawn'] and s['alphaTest'] > 0:
            s['cutoutAsDrawn'] = True
        n8 = e and e.get('normal8')
        if n8 and 'xy8' in n8:
            s['xy8_delta'] = n8['xy8'] - n8['xy6']
    return list(seen.values())


def worst(r):
    reads = [x for x in (r.get('reads') or []) + (r.get('views') or []) + ([r['final']] if r.get('final') else []) if x.get('samplers_max') is not None]
    if not reads:
        return None, None, None
    sm = max(x['samplers_max'] for x in reads)
    vr = max(reads, key=lambda x: ((x.get('vram') or {}).get('totalMB') or 0))
    top = (r.get('final') or {}).get('top') or []
    return sm, vr.get('vram'), top


out = {'pages': {}, 'families': fam}
for pid in ORDER:
    r = runs.get(pid)
    if not r:
        continue
    sm, vr, top = worst(r)
    F = fams_of(r) if r.get('families_end') else []
    rec = {k: r.get(k) for k in ('page', 'kind', 'query', 'bytes', 'sidecars', 'ready', 'load_s', 'total_s', 'compile',
                                  'views_available', 'renderer', 'shadow_state', 'errs', 'gl_errors', 'img_errors', 'panel', 'error')}
    rec['samplers_worst'] = sm
    rec['vram_worst'] = vr
    rec['programs_top'] = top
    rec['reads'] = [{k: x.get(k) for k in ('at', 'samplers_max', 'programs', 'vram', 'rinfo', 's', 'error')} for x in (r.get('reads') or []) + (r.get('views') or [])]
    rec['families'] = sorted(F, key=lambda s: (s['class'], s['build'], s['fam']))
    if pid in nos:
        n = nos[pid]
        rec['as_shipped'] = {'query': n.get('query'), 'samplers_worst': worst(n)[0], 'programs_top': (n.get('final') or {}).get('top'),
                             'shadow_state': n.get('shadow_state'), 'vram': worst(n)[1]}
    if pid in sw:
        c = sw[pid]
        rec['swiftshader'] = {'samplers_worst': c.get('samplers_worst'), 'vram_worst': c.get('vram_worst'), 'bytes': c.get('bytes'),
                              'renderer': c.get('renderer')}
    if pid in fs:
        n = fs[pid]
        fr = [x for x in (n.get('reads') or []) if x.get('at') == 'shadow forced on']
        rec['forced_shadow'] = {'samplers_worst': worst(n)[0], 'before': max([x['samplers_max'] for x in (n.get('reads') or [])
                                if x.get('at') != 'shadow forced on' and x.get('samplers_max') is not None] or [None]),
                                'top': fr[0]['top'][:5] if fr else None, 'how': n.get('force_shadow'), 'renderer': n.get('renderer')}
    out['pages'][pid] = rec

if __name__ == '__main__':
    json.dump(out, open(sys.argv[1], 'w', encoding='utf-8', newline='\n'), indent=1, ensure_ascii=False)
    for pid, p in out['pages'].items():
        cls = {}
        for s in p['families']:
            if s['drawn']:
                cls.setdefault(s['class'], []).append(s['fam'])
        sc = max(p['sidecars'].values()) if p['sidecars'] else 0
        print('%-24s %6.2f MiB %3d%%  side max %5.2f MiB  samplers %s (shipped %s)  vram %s  %s' % (
            pid, p['bytes'] / 2 ** 20, 100 * p['bytes'] / CAP, sc / 2 ** 20, p['samplers_worst'],
            (p.get('as_shipped') or {}).get('samplers_worst'), p['vram_worst'],
            {k: len(v) for k, v in cls.items()}))
