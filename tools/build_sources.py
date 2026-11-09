"""--list-sources: a build reports the repo files it reads, without building (tools/dep_graph.py takes the list).

A build.py imports this module before it reads anything and calls report() once it has read (or resolved) every
fragment it would put in its page, before its first write:

    sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC
    ...
    BSRC.report(paths, vendored=VENDORED.values())   # a no-op unless --list-sources

A build that reads everything before it writes can call report() with nothing: the hook has the list. Builds whose page
is chosen at import call variants(); per-target builds return early from their target loop under BSRC.LISTING and
call report() once after it. A file the build would write beside the page is skipped under BSRC.LISTING.

Under `--list-sources` the import installs an audit hook (sys.addaudithook) that records, until report():
  - every file the build opens for reading (Python imports included: io.open_code raises the same 'open' event);
  - every repo path named in a subprocess's arguments (a build that delegates to another build.py).
Listing a folder is not a read (a build lists core/mask to sort its names without loading it): what the build composes
from a listing it opens, or passes to report().
A read made by another module's code on the build's behalf (kits/catalog/furniture_bundle.py, settlements/isle-demo/
bundles.py kcity_bundle reading core/city) counts as the build's: what it reads ends up in the build's page.

report(*groups, vendored=(), vendor_check=None) adds the paths it is given (files or directories; a dict gives its
values), prints the union, one repo-relative path per line with '/', sorted, and exits 0. `vendored` names the
upstreams a build compares its vendored copies with (--vendor-check): the page carries a copy of them, so they are a
read too, printed as `<path>\tvendored` when the build reads them only that way (DEPS.json lists those edges under
"vendored").
Passing the build's own vendor_check function instead runs it (output dropped) and takes what it reads as the
upstreams, so the list can not fall behind the check.

variants(arglists) runs the build once per variant under --list-sources and takes the union (a build whose page is
chosen at import, such as biomes/throne's --station <name>).

While listing, the build must not write: a write-mode open, a remove or rename under the repo, or a subprocess that is
not the port lint and not itself a --list-sources run, stops it with an error. So a misplaced report() can not build.
"""
import os, sys

FLAG = '--list-sources'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LISTING = FLAG in sys.argv
_seen = set()
_vend = set()   # upstreams of vendored copies (--vendor-check reads them; the page has a copy)
_done = False
_vendoring = False   # inside report()'s run of the build's vendor_check: its reads are upstreams


def _abs(p):
    if isinstance(p, bytes):
        p = os.fsdecode(p)
    if not isinstance(p, str):
        p = os.fspath(p)
    return os.path.normpath(os.path.abspath(p))


def _rel(p):
    """Repo-relative with '/', or None outside the repo."""
    try:
        r = os.path.relpath(_abs(p), ROOT)
    except (TypeError, ValueError):
        return None
    if r == '.' or r.startswith('..'):
        return None
    return r.replace(os.sep, '/')


def _source(rel):
    """A .pyc under __pycache__ stands for its .py."""
    parts = rel.split('/')
    if len(parts) >= 2 and parts[-2] == '__pycache__' and parts[-1].endswith('.pyc'):
        return '/'.join(parts[:-2] + [parts[-1].split('.')[0] + '.py'])
    return rel


def _importing():
    f = sys._getframe(2)
    while f is not None:
        if f.f_code.co_filename.startswith('<frozen importlib'):
            return True
        f = f.f_back
    return False


def _record(path):
    rel = _rel(path)
    if rel is None:
        return
    (_vend if _vendoring else _seen).add(_source(rel))


def _writes(mode, flags):
    if isinstance(mode, str) and any(c in mode for c in 'wax+'):
        return True
    if isinstance(flags, int) and flags & (os.O_WRONLY | os.O_RDWR | os.O_CREAT | os.O_TRUNC | os.O_APPEND):
        return True
    return False


def _stop(what):
    raise RuntimeError('%s: %s before build_sources.report(); move report() above the first write'
                       % (FLAG, what))


def _hook(event, args):
    if _done:
        return
    if event == 'open':
        path, mode, flags = (tuple(args) + (None, None, None))[:3]
        if isinstance(path, int) or path is None:
            return
        if _writes(mode, flags):
            if _rel(path) is not None and not _importing() and '__pycache__' not in _rel(path).split('/'):
                _stop('a write to %s' % _rel(path))
            return
        _record(path)
    elif event in ('os.remove', 'os.rename', 'os.rmdir', 'shutil.rmtree', 'shutil.move'):
        if args and not isinstance(args[0], int) and _rel(args[0]) is not None and not _importing():
            _stop('%s on %s' % (event, _rel(args[0])))
    elif event == 'subprocess.Popen':
        argv = args[1] if len(args) > 1 else None
        if isinstance(argv, (str, bytes)):   # on Windows the event carries the command line as one string
            import shlex
            argv = shlex.split(os.fsdecode(argv).replace('\\', '/'))
        elif argv is None:
            argv = []
        argv = [os.fsdecode(a) if isinstance(a, bytes) else str(a) for a in argv]
        if FLAG not in argv and not any(a.replace('\\', '/').endswith('tools/check_port.py') for a in argv):
            _stop('a subprocess (%s)' % ' '.join(argv[:3]))
        for a in argv[1:]:
            if os.path.exists(a) and _rel(a) is not None:
                _record(a)


if LISTING:
    sys.addaudithook(_hook)


def _flat(groups):
    for g in groups:
        if g is None:
            continue
        if isinstance(g, (str, bytes, os.PathLike)):
            yield g
        elif isinstance(g, dict):
            for v in _flat([g.values()]):
                yield v
        else:
            for v in _flat(list(g)):
                yield v


def _add(groups, into):
    for p in _flat(groups):
        rel = _rel(p)
        if rel is not None:
            into.add(_source(rel))


def note(*groups, vendored=()):
    """Add paths to the list without reporting yet (a build that resolves several pages in turn)."""
    if LISTING:
        _add(groups, _seen)
        _add([vendored], _vend)


def variants(arglists):
    """A build whose page is chosen by its arguments at import (biomes/throne --station <name>): under --list-sources,
    run the build once more per variant (`build.py --list-sources <args>`) and take each one's list into this one.
    Call it right after the import; in the variant runs themselves it does nothing."""
    if not LISTING or os.environ.get('KRATOR_LIST_VARIANT'):
        return
    import subprocess
    env = dict(os.environ, KRATOR_LIST_VARIANT='1')
    for args in arglists:
        r = subprocess.run([sys.executable, os.path.abspath(sys.argv[0]), FLAG] + list(args), capture_output=True,
                           text=True, encoding='utf-8', errors='replace', env=env,
                           cwd=os.path.dirname(os.path.abspath(sys.argv[0])))
        if r.returncode:
            sys.stderr.write(r.stdout + r.stderr)
            sys.exit('%s %s failed' % (FLAG, ' '.join(args)))
        for line in r.stdout.splitlines():
            path, _, kind = line.strip().partition('\t')
            if path:
                (_vend if kind == 'vendored' else _seen).add(path)


def report(*groups, vendored=(), vendor_check=None):
    """Under --list-sources: add these paths, print every path read, exit 0. Otherwise do nothing.
    vendor_check: the build's own --vendor-check function, run here with its output dropped: every file it reads is
    an upstream (the same as naming them in `vendored`). A path that is only a vendored upstream is printed with a tab
    and `vendored` after it."""
    global _done, _vendoring
    if not LISTING:
        return
    note(*groups, vendored=vendored)
    if vendor_check is not None:
        import contextlib, io
        _vendoring = True
        try:
            with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                vendor_check()
        except SystemExit:
            pass
        finally:
            _vendoring = False
    _done = True
    out = sorted(_seen | _vend)
    sys.stdout.write(''.join(p + ('\tvendored' if p not in _seen else '') + '\n' for p in out))
    sys.stdout.flush()
    os._exit(0)   # nothing after report() may run: atexit handlers, a trailing KNOWN_ISSUES print
