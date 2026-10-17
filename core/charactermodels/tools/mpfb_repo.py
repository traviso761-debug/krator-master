#!/usr/bin/env python3
"""Fetch the hair and beards tools/mpfb_build.py uses that are not in an asset pack, from the MakeHuman community
asset repository, into MPFB's user data, with the fixes some of them need.

  python3 tools/mpfb_repo.py [<mpfb data dir>]     # default: Blender 4.5's user extension dir

The repository's index is http://www.makehumancommunity.org/sites/default/files/assets.json (asset id -> title,
licence, author, file URLs). Each asset lands in <data>/<hair|clothes>/<mhclo name>/. Licences: CREDITS.md.
"""
import json, os, shutil, subprocess, sys, time, urllib.parse

DATA = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/.config/blender/4.5/extensions/.user/user_default/mpfb/data')
INDEX = 'http://www.makehumancommunity.org/sites/default/files/assets.json'
# asset id -> MPFB folder kind (beards are clothes in MakeHuman)
ASSETS = {3658: 'clothes', 3656: 'clothes', 3657: 'clothes', 3654: 'clothes', 3655: 'clothes', 3659: 'clothes',
          3662: 'hair', 3663: 'hair', 3677: 'hair', 3660: 'hair', 2616: 'hair', 2892: 'hair', 575: 'hair',
          200: 'hair', 3532: 'hair', 3661: 'hair', 3639: 'hair', 3642: 'hair', 3688: 'hair', 2893: 'hair',
          176: 'hair', 74: 'hair', 3542: 'hair'}
# material files that name textures the upload does not carry (or under another name): (folder, sed-like edits)
DROP = ('normalmapTexture', 'aomapTexture', 'displacementTexture')
FIXES = {'Dreads_with_Fade': {'BHL_AfroHairB_BaseColor.png': 'BHL_AfroHairB_Test_BaseColor_Alpha.png'},
         'southernbelleringlets': {'southernbelleringlets.png': 'southernbelleringletstexture1.png'},
         'brunhilde': {'brunhilde.png': 'brunhildetexture.png'}}
COPY = {'Mutton_Chops': ('Goatee', 'BHL_FacialHair_Test_BaseColor_Alpha.png')}   # same author, same texture


def get(url, out):
    for t in range(5):
        if subprocess.run(['curl', '-sS', '-f', '-m', '180', '-o', out, urllib.parse.quote(url, safe=':/')]).returncode == 0:
            return True
        time.sleep(2 ** t)
    return False


def main():
    idx = os.path.join(DATA, '.repo-assets.json')
    if not os.path.exists(idx) and not get(INDEX, idx):
        sys.exit('mpfb_repo.py: cannot fetch ' + INDEX)
    by = {v['nid']: v for v in json.load(open(idx)).values()}
    for nid, kind in ASSETS.items():
        v = by[nid]
        name = os.path.basename(v['files']['mhclo']).rsplit('.', 1)[0]
        d = os.path.join(DATA, kind, name)
        os.makedirs(d, exist_ok=True)
        for k, u in v['files'].items():
            f = os.path.join(d, urllib.parse.unquote(os.path.basename(u)))
            if k not in ('render', 'thumb') and not os.path.exists(f):
                get(u, f)
        if name in COPY:
            src, f = COPY[name]
            shutil.copyfile(os.path.join(DATA, kind, src, f), os.path.join(d, f))
        for m in [f for f in os.listdir(d) if f.endswith('.mhmat')]:
            p = os.path.join(d, m)
            lines = open(p, errors='ignore').read().splitlines()
            out = []
            for ln in lines:
                w = ln.split()
                if w and w[0] in DROP and not os.path.exists(os.path.join(d, os.path.basename(' '.join(w[1:])))):
                    continue
                for a, b in FIXES.get(name, {}).items():
                    ln = ln.replace(a, b)
                out.append(ln)
            open(p, 'w').write('\n'.join(out) + '\n')
        print('%-6s %-8s %-30s %-6s %s' % (nid, kind, name, v['license'], v['username']))


if __name__ == '__main__':
    main()
