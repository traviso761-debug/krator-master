"""Loaded by every Python process tools/build.py starts (it puts this folder on PYTHONPATH and sets KRATOR_INPUTS_DIR).
An audit hook records what the process opens and lists inside the repo, and refuses to read a Git LFS pointer that is
not a page or a bundle (CORE-IMPROVEMENTS.md 2a: a packed pointer builds black surfaces silently). At exit it writes
<KRATOR_INPUTS_DIR>/<pid>.json; tools/build.py merges them into the build's build-inputs.json. Nothing here runs
outside tools/build.py.
"""
import atexit, json, os, sys, threading

_DIR = os.environ.get('KRATOR_INPUTS_DIR')
_ROOT = os.environ.get('KRATOR_ROOT')
if _DIR and _ROOT:
    _reads, _writes, _lists = set(), set(), set()
    _busy = threading.local()
    _WFLAGS = os.O_WRONLY | os.O_RDWR | os.O_APPEND | os.O_CREAT
    _POINTER = b'version https://git-lfs'
    _rootn = os.path.normcase(os.path.abspath(_ROOT))

    def _rel(p):
        try:
            a = os.path.abspath(os.fsdecode(p))
        except Exception:
            return None
        n = os.path.normcase(a)
        if not n.startswith(_rootn + os.sep):
            return None
        r = a[len(_rootn) + 1:].replace(os.sep, '/')
        if r.startswith('.git/') or '/__pycache__/' in r or r.startswith('__pycache__/') or '/node_modules/' in r:
            return None
        return r

    def _refuse(r):
        if r.endswith('.html') or ('/dist/' in r and r.endswith('.js')):
            return False
        a = os.path.join(_ROOT, r)
        try:
            if os.path.getsize(a) > 1024:
                return False
            fd = os.open(a, os.O_RDONLY | getattr(os, 'O_BINARY', 0))
            try:
                return os.read(fd, len(_POINTER)) == _POINTER
            finally:
                os.close(fd)
        except OSError:
            return False

    def _hook(event, args):
        if getattr(_busy, 'on', False):
            return
        if event == 'open':
            p, mode, flags = (list(args) + [None, None, None])[:3]
            if p is None or isinstance(p, int):
                return
            _busy.on = True
            try:
                r = _rel(p)
                if r is None:
                    return
                w = (isinstance(mode, str) and any(c in mode for c in 'wax+')) or \
                    (mode is None and isinstance(flags, int) and flags & _WFLAGS)
                if w:
                    _writes.add(r)
                elif os.path.isfile(os.path.join(_ROOT, r)):
                    if r not in _writes and _refuse(r):
                        sys.stderr.write('\nbuild: %s is a Git LFS pointer, not the file; a page built from it has black '
                                         'surfaces. Run: git lfs pull --include="%s/*"\n' % (r, os.path.dirname(r)))
                        sys.stderr.flush()
                        _dump()
                        os._exit(3)
                    _reads.add(r)
            finally:
                _busy.on = False
        elif event in ('os.listdir', 'os.scandir'):
            p = args[0] if args else '.'
            if p is None:
                p = '.'
            if isinstance(p, int):
                return
            _busy.on = True
            try:
                r = _rel(os.path.join(os.fsdecode(p), 'x'))
                if r is not None:
                    _lists.add(os.path.dirname(r))
            finally:
                _busy.on = False

    def _dump():
        _busy.on = True
        try:
            with open(os.path.join(_DIR, '%d.json' % os.getpid()), 'w', encoding='utf-8') as fh:
                json.dump({'argv': sys.argv, 'reads': sorted(_reads), 'writes': sorted(_writes), 'lists': sorted(_lists)}, fh)
        except Exception:
            pass

    atexit.register(_dump)
    sys.addaudithook(_hook)
