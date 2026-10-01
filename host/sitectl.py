#!/usr/bin/env python3
"""Run the Krator site server without systemd: Windows (through sitectl.bat), macOS, or Linux in the foreground.

Usage:  python host/sitectl.py <command>        (on Windows:  host\\sitectl.bat <command>)

  setup              first run on a fresh clone: sync, build, check, and print the site's URLs
  run                setup if it has never been done, then serve (what double-clicking sitectl.bat does)
  sync [--check]     pull the World Menagerie's pages into menagerie/ and write site.toml (--check: drift only)
  build [--all | --no-build]
                     build the gallery into site/ with local three.js. By default only worlds whose built page is
                     missing are built (the port's, on a fresh clone); --all rebuilds every world (the biomes need
                     node); --no-build builds nothing
  update             sync and build: after a git pull. Page changes are live; restart serve after a config change
  serve [--port N]   run the server in this terminal until Ctrl+C
  check              validate site.toml and list every URL
  url                print the site's URLs
  health             ask the running server if it is up
  firewall           print the command that opens the port to the local network (Windows)

Needs Python 3.11 or later and nothing else. On Linux, ./sitectl does the same and also runs the server as a
systemd user service.
"""
import os, socket, subprocess, sys, tomllib, urllib.request

DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(DIR)
CONFIG = os.path.join(DIR, 'site.toml')
ENV = {**os.environ, 'PYTHONUTF8': '1'}   # every script reads and writes UTF-8, whatever the Windows code page


def run(*args):
    return subprocess.call([sys.executable, *args], env=ENV)


def port():
    with open(os.path.join(DIR, 'krator.toml'), 'rb') as f:
        return tomllib.load(f).get('server', {}).get('port', 8001)


def lan_ips():
    ips = set()
    try:   # the address this machine would reach the LAN from; a UDP connect sends nothing
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('10.255.255.255', 1))
        ips.add(s.getsockname()[0])
        s.close()
    except OSError:
        pass
    try:
        ips.update(socket.gethostbyname_ex(socket.gethostname())[2])
    except OSError:
        pass
    return sorted(ip for ip in ips if not ip.startswith('127.'))


def urls(p=None):
    p = p or port()
    print('http://127.0.0.1:%d/' % p)
    for ip in lan_ips():
        print('http://%s:%d/' % (ip, p))
    return 0


def check(quiet=False):
    if not os.path.isfile(CONFIG):
        print('sitectl: no site.toml yet: run setup (or sync) first', file=sys.stderr)
        return 1
    if quiet:
        r = subprocess.run([sys.executable, os.path.join(DIR, 'server.py'), '--config', CONFIG, '--check'],
                           env=ENV, capture_output=True, text=True)
        if r.returncode:
            sys.stderr.write(r.stdout + r.stderr)
        return r.returncode
    return run(os.path.join(DIR, 'server.py'), '--config', CONFIG, '--check')


def sync(args):
    return run(os.path.join(DIR, 'sync.py'), *args)


def build(args):
    mode = [] if '--all' in args else ['--no-build'] if '--no-build' in args else ['--build-missing']
    return run(os.path.join(ROOT, 'gallery', 'build_gallery.py'), *mode,
               '--out', os.path.join(DIR, 'site'), '--local-three', '/worlds/three.min.js',
               '--lod', os.path.join(DIR, 'lod.toml'))


def serve(args):
    if check(quiet=True):
        return 1
    print('Krator site: Ctrl+C stops it.')
    urls(int(args[args.index('--port') + 1]) if '--port' in args[:-1] else None)
    try:
        return run(os.path.join(DIR, 'server.py'), '--config', CONFIG, *args)
    except KeyboardInterrupt:
        return 0


def health():
    try:
        with urllib.request.urlopen('http://127.0.0.1:%d/healthz' % port(), timeout=5) as r:
            print(r.read().decode().strip())
            return 0
    except OSError as e:
        print('not running on port %d (%s)' % (port(), e), file=sys.stderr)
        return 1


def firewall():
    p = port()
    print('Windows asks once, the first time the server starts: allow Python on Private networks only.')
    print('To open the port yourself instead, run this in a terminal opened "As administrator":')
    print()
    print('  netsh advfirewall firewall add rule name="Krator site %d" dir=in action=allow protocol=TCP '
          'localport=%d profile=private' % (p, p))
    print()
    print('and to close it again:  netsh advfirewall firewall delete rule name="Krator site %d"' % p)
    print('Keep the network set to Private, and never forward this port on the router.')
    return 0


def main_setup():
    for step in (lambda: sync([]), lambda: build([]), lambda: check(quiet=True)):
        if step():
            return 1
    return 0


def main():
    cmd, args = (sys.argv[1], sys.argv[2:]) if len(sys.argv) > 1 else ('help', [])
    if cmd == 'setup':
        if main_setup():
            return 1
        print('\nReady. Start the site with:  sitectl serve   (sitectl.bat on Windows)\nIt will answer at:')
        return urls()
    if cmd == 'run':
        if not os.path.isfile(CONFIG) or not os.path.isdir(os.path.join(DIR, 'site')):
            if main_setup():
                return 1
        return serve(args)
    if cmd == 'update':
        return sync([]) or build(args)
    simple = {'sync': lambda: sync(args), 'build': lambda: build(args), 'serve': lambda: serve(args),
              'check': check, 'url': lambda: urls(), 'urls': lambda: urls(), 'health': health, 'firewall': firewall}
    if cmd in simple:
        return simple[cmd]()
    if cmd in ('help', '-h', '--help'):
        print(__doc__.strip())
        return 0
    print('unknown command: %s (try: sitectl help)' % cmd, file=sys.stderr)
    return 2


if __name__ == '__main__':
    sys.exit(main())
