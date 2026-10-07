#!/usr/bin/env python3
"""Build host/app/dist/KratorGallery.exe from krator_gallery.py with PyInstaller (pip install pyinstaller).

The exe stands in for python.exe when it runs the repo's scripts (krator_gallery.run_script), so it carries the whole
standard library, not only what krator_gallery.py imports: a build.py that imports a module nothing here does still
runs. It runs in UTF-8 mode and unbuffered, as host/sitectl.py runs the scripts (PYTHONUTF8), since a frozen
Python ignores the PYTHON* environment variables.
"""
import importlib.util, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
LEAVE_OUT = {'idlelib', 'turtledemo', 'test', 'lib2to3', 'ensurepip', 'venv', 'pydoc_data', 'antigravity', 'this',
             '__phello__', 'turtle', 'tkinter.test'}

SPEC = r'''
from PyInstaller.utils.hooks import collect_submodules
hidden = []
for m in %(modules)r:
    hidden += [m] + collect_submodules(m, filter=lambda n: '.test' not in n and '.idle_test' not in n)
a = Analysis([%(script)r], hiddenimports=hidden, excludes=%(leave_out)r)
pyz = PYZ(a.pure)
exe = EXE(pyz, a.scripts, a.binaries, a.datas,
          [('u', None, 'OPTION'), ('X utf8', None, 'OPTION')],
          name='KratorGallery', console=False, upx=False)
'''


def stdlib():
    out = []
    for m in sorted(sys.stdlib_module_names):
        if m in LEAVE_OUT or m.startswith('_test'):
            continue
        try:
            if importlib.util.find_spec(m) is not None:   # posix-only modules are absent on Windows
                out.append(m)
        except (ImportError, ValueError):
            pass
    return out


def main():
    spec = os.path.join(HERE, 'build', 'KratorGallery.spec')
    os.makedirs(os.path.dirname(spec), exist_ok=True)
    with open(spec, 'w', encoding='utf-8') as f:
        f.write(SPEC % {'modules': stdlib(), 'script': os.path.join(HERE, 'krator_gallery.py'),
                        'leave_out': sorted(LEAVE_OUT)})
    r = subprocess.call([sys.executable, '-m', 'PyInstaller', '--noconfirm', '--clean',
                         '--distpath', os.path.join(HERE, 'dist'), '--workpath', os.path.join(HERE, 'build'), spec])
    if r == 0:
        exe = os.path.join(HERE, 'dist', 'KratorGallery.exe')
        print('wrote %s (%.1f MB)' % (exe, os.path.getsize(exe) / 1048576))
    return r


if __name__ == '__main__':
    sys.exit(main())
