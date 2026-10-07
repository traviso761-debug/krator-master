#!/usr/bin/env python3
"""Krator Gallery: a window that downloads the latest Krator from GitHub, builds the gallery of every Krator world
with the World Menagerie beside it, and serves it (host/README.md has the site map).

  python host/app/krator_gallery.py                       the window (Python 3.11+)
  python host/app/krator_gallery.py --update [--serve]    the same work without a window
        [--build] [--home DIR] [--local-only] [--no-auto]
  python host/app/build_exe.py                            writes host/app/dist/KratorGallery.exe (README.md)

It keeps its own copy of Krator in a folder of its own (default ~/Krator Gallery, the copy in repo/) and never
touches any other checkout. With git on PATH the copy is a shallow, sparse clone (no godot/ or archive/, no LFS
textures), so an update fetches only what changed; without git it downloads main as a ZIP. Then it runs the repo's
own `host/sitectl.py setup` (sync the Menagerie, build the pages a fresh copy lacks, write the gallery) and serves
host/site.toml with host/server.py.

The exe carries its own Python: when a repo script runs another through sys.executable, the exe is called with the
script's path and runs it (run_script), so the computer needs neither Python nor git.
"""
import json, os, queue, re, runpy, shutil, socket, stat, subprocess, sys, threading, time, urllib.request
import webbrowser, zipfile

REPO = 'traviso761-debug/krator-master'
BRANCH = 'main'
SKIP = ('godot/', 'archive/')   # not part of any gallery page: left out of the copy
APP = 'Krator Gallery'
UA = {'User-Agent': 'KratorGallery'}
SETTINGS = (os.path.join(os.environ.get('APPDATA') or os.path.expanduser('~'), 'KratorGallery', 'settings.json')
            if os.name == 'nt' else
            os.path.join(os.environ.get('XDG_CONFIG_HOME') or os.path.expanduser('~/.config'), 'krator-gallery',
                         'settings.json'))
DEFAULT_HOME = os.path.join(os.path.expanduser('~'), 'Krator Gallery')
STATE = '.krator-gallery.json'   # in the home folder: what was downloaded and built; it marks the folder as the app's
NO_WINDOW = getattr(subprocess, 'CREATE_NO_WINDOW', 0)
CHECK_EVERY = 15 * 60   # seconds between looks at GitHub, to update automatically


# ---- the exe as python.exe ------------------------------------------------------------------------------------

def fix_stdio():
    """A windowed exe may start without sys.stdout; the repo's scripts print, so give them the pipe (or nothing)."""
    for fd, name in ((1, 'stdout'), (2, 'stderr')):
        s = getattr(sys, name)
        if s is None:
            try:
                s = open(fd, 'w', encoding='utf-8', errors='replace', buffering=1, closefd=False)
            except OSError:
                s = open(os.devnull, 'w')
            setattr(sys, name, s)
        else:
            try:
                s.reconfigure(encoding='utf-8', errors='replace', line_buffering=True)
            except Exception:
                pass


def pass_stdio():
    """A windowed process's children get no stdout unless it is handed to them: hand it over, so what a script's
    scripts print reaches the log too, and keep a console child (node) from opening a window."""
    init = subprocess.Popen.__init__

    def popen(self, *a, **kw):
        if len(a) <= 1:
            for name in ('stdout', 'stderr'):
                if kw.get(name) is None:
                    try:
                        kw[name] = getattr(sys, name).fileno()
                    except (AttributeError, OSError, ValueError):
                        pass
            kw['creationflags'] = kw.get('creationflags', 0) | NO_WINDOW
        init(self, *a, **kw)
    subprocess.Popen.__init__ = popen


def run_script(path, args):
    """Run a repo script as `python path args` would: build_gallery.py runs each build.py this way."""
    if getattr(sys, 'frozen', False) and os.name == 'nt':
        pass_stdio()
    sys.argv = [path, *args]
    sys.path.insert(0, os.path.dirname(os.path.abspath(path)))
    try:
        runpy.run_path(path, run_name='__main__')
    except SystemExit as e:
        if e.code is None or isinstance(e.code, int):
            return e.code or 0
        print(e.code, file=sys.stderr)
        return 1
    return 0


# ---- the work, with no window ---------------------------------------------------------------------------------

class Failed(Exception):
    pass


def rmtree(path):
    def writable(fn, p, _):   # git's object files are read-only on Windows
        os.chmod(p, stat.S_IWRITE)
        fn(p)
    if os.path.exists(path):
        if sys.version_info >= (3, 12):
            shutil.rmtree(path, onexc=writable)
        else:
            shutil.rmtree(path, onerror=writable)


def short(sha):
    return (sha or '')[:8]


class Krator:
    """Download, build and serve. log(text, progress=False) reports; a progress line replaces the one before it."""

    def __init__(self, home, log, local_only=False):
        self.home = os.path.abspath(home)
        self.repo = os.path.join(self.home, 'repo')
        self.log = log
        self.local_only = local_only
        self.server = None
        self.port = None

    # -- state

    def state(self):
        try:
            with open(os.path.join(self.home, STATE), encoding='utf-8') as f:
                return json.load(f)
        except (OSError, ValueError):
            return {}

    def save_state(self, **kw):
        st = {**self.state(), **kw}
        os.makedirs(self.home, exist_ok=True)
        with open(os.path.join(self.home, STATE), 'w', encoding='utf-8') as f:
            json.dump(st, f, indent=1)
        return st

    def ours(self):
        """The app only ever replaces a folder it made: an empty or absent one, or one with its state file."""
        h = self.home
        return not os.path.exists(h) or os.path.isfile(os.path.join(h, STATE)) or (os.path.isdir(h) and not os.listdir(h))

    def site_ready(self):
        host = os.path.join(self.repo, 'host')
        return os.path.isfile(os.path.join(host, 'site.toml')) and os.path.isfile(os.path.join(host, 'site', 'index.html'))

    # -- running things

    def run(self, cmd, cwd=None, env=None):
        p = subprocess.Popen(cmd, cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                             stdin=subprocess.DEVNULL, creationflags=NO_WINDOW)
        self.pump(p.stdout)
        return p.wait()

    def pump(self, stream):
        """Lines to log; a line ended by a bare \\r (git's counters) is progress."""
        buf = b''
        while True:
            chunk = stream.read1(65536) if hasattr(stream, 'read1') else stream.read(4096)
            if not chunk:
                break
            buf += chunk
            parts = re.split(rb'(\r\n|\r|\n)', buf)
            buf = parts.pop()
            for text, end in zip(parts[0::2], parts[1::2]):
                self.log(text.decode('utf-8', 'replace'), progress=(end == b'\r'))
        if buf:
            self.log(buf.decode('utf-8', 'replace'))

    def py(self, script, *args, cwd=None):
        env = {**os.environ, 'PYTHONUTF8': '1', 'PYTHONUNBUFFERED': '1'}
        return self.run([sys.executable, script, *args], cwd=cwd or os.path.dirname(script), env=env)

    def git(self, *args):
        env = {**os.environ, 'GIT_LFS_SKIP_SMUDGE': '1', 'GIT_TERMINAL_PROMPT': '0'}
        if self.run(['git', '-c', 'core.longpaths=true', *args], env=env):
            raise Failed('git %s failed: see the log above' % next(a for a in args if a in (
                'clone', 'fetch', 'reset', 'sparse-checkout', 'checkout')))

    # -- GitHub

    def latest(self):
        req = urllib.request.Request('https://api.github.com/repos/%s/commits/%s' % (REPO, BRANCH),
                                     headers={**UA, 'Accept': 'application/vnd.github+json'})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                d = json.load(r)
        except OSError as e:
            raise Failed('could not reach GitHub (%s)' % e)
        c = d['commit']
        return {'commit': d['sha'], 'date': c['committer']['date'][:10], 'message': c['message'].splitlines()[0]}

    def fetch(self, head):
        if shutil.which('git'):
            self.fetch_git()
            r = subprocess.run(['git', '-C', self.repo, 'rev-parse', 'HEAD'], capture_output=True, text=True,
                               creationflags=NO_WINDOW)
            return r.stdout.strip() or head['commit'], 'git'
        self.fetch_zip(head['commit'])
        return head['commit'], 'zip'

    def fetch_git(self):
        if os.path.isdir(os.path.join(self.repo, '.git')):
            self.log('Fetching what changed on GitHub...')
            self.git('-C', self.repo, 'fetch', '--depth', '1', '--progress', 'origin', BRANCH)
            self.git('-C', self.repo, 'reset', '--hard', 'FETCH_HEAD')
            return
        self.log('Downloading Krator with git (the first time takes a while: about 900 MB)...')
        new = self.repo + '.new'
        rmtree(new)
        self.git('clone', '--depth', '1', '--filter=blob:none', '--no-checkout', '--single-branch',
                 '--branch', BRANCH, '--progress', 'https://github.com/%s.git' % REPO, new)
        self.git('-C', new, 'sparse-checkout', 'set', '--no-cone', '/*', *('!/' + s for s in SKIP))
        self.git('-C', new, 'checkout', '--progress', BRANCH)
        self.swap(new)

    def fetch_zip(self, sha):
        self.log('git is not installed: downloading Krator as a ZIP (all of it, every update)...')
        tmp = os.path.join(self.home, 'download.zip')
        req = urllib.request.Request('https://codeload.github.com/%s/zip/%s' % (REPO, sha), headers=UA)
        try:
            with urllib.request.urlopen(req, timeout=60) as r, open(tmp, 'wb') as f:
                total, got, shown = int(r.headers.get('Content-Length') or 0), 0, 0
                while True:
                    chunk = r.read(1 << 20)
                    if not chunk:
                        break
                    f.write(chunk)
                    got += len(chunk)
                    if time.time() - shown > 0.5:
                        shown = time.time()
                        self.log('Downloaded %.0f MB%s' % (got / 1048576, ' of %.0f' % (total / 1048576) if total else ''),
                                 progress=True)
        except OSError as e:
            raise Failed('the download failed (%s)' % e)
        self.log('Downloaded %.0f MB' % (got / 1048576))
        new = self.repo + '.new'
        rmtree(new)
        with zipfile.ZipFile(tmp) as z:
            infos = z.infolist()
            top = infos[0].filename.split('/')[0] + '/'
            for i, info in enumerate(infos):
                rel = info.filename[len(top):]
                if not rel or info.is_dir() or rel.startswith(SKIP):
                    continue
                dest = os.path.join(new, *rel.split('/'))
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                with z.open(info) as src, open(dest, 'wb') as dst:
                    shutil.copyfileobj(src, dst, 1 << 20)
                if i % 200 == 0:
                    self.log('Unpacking: %d of %d files' % (i, len(infos)), progress=True)
        self.log('Unpacked %d files' % len(infos))
        os.remove(tmp)
        self.swap(new)

    def swap(self, new):
        old = self.repo + '.old'
        rmtree(old)
        if os.path.exists(self.repo):
            os.rename(self.repo, old)
        os.rename(new, self.repo)
        rmtree(old)

    def clear_stale(self):
        """The pages a build makes that the repo does not carry (Ys, the Port: their dist/ is ignored) survive a git
        update; remove every ignored file in the builds' dist/ so the build makes them again from the new sources,
        a new build's too. A ZIP copy is new each time."""
        if os.path.isdir(os.path.join(self.repo, '.git')):
            subprocess.run(['git', '-C', self.repo, 'clean', '-fdqX', '--', *('%s/*/dist' % top for top in
                            ('settlements', 'openworld', 'biomes', 'kits'))], capture_output=True, creationflags=NO_WINDOW)

    # -- the steps

    def update(self, force=False):
        if not self.ours():
            raise Failed('%s already holds other files. Choose an empty folder (or the one this app made): the '
                         'app replaces what is in it.' % self.home)
        self.log('Asking GitHub for the latest %s...' % BRANCH)
        head = self.latest()
        st = self.state()
        self.log('Latest: %s, %s: %s' % (short(head['commit']), head['date'], head['message']))
        if not force and st.get('commit') == head['commit'] and st.get('built') and self.site_ready():
            self.log('This copy is already the latest and built.')
            return st
        self.stop_server()
        os.makedirs(self.home, exist_ok=True)
        self.save_state()
        commit, how = self.fetch(head)
        changed = commit != st.get('commit')
        self.save_state(commit=commit, date=head['date'], message=head['message'], method=how, built=False)
        if changed:
            self.clear_stale()
        return self.build()

    def update_if_new(self):
        """For the timer: update only when main has moved on, and serve again if it was serving. True if it did."""
        if not self.state().get('commit'):
            return False   # the first download is the button's: the folder may still be about to change
        head = self.latest()
        st = self.state()
        if st.get('commit') == head['commit'] and st.get('built') and self.site_ready():
            return False
        was = self.serving()
        self.log('GitHub has %s (%s): updating.' % (short(head['commit']), head['message']))
        try:
            self.update()
        finally:   # a failed update still serves what is built
            if was and not self.serving() and self.site_ready():
                self.serve()
        return True

    def build(self):
        sitectl = os.path.join(self.repo, 'host', 'sitectl.py')
        if not os.path.isfile(sitectl):
            raise Failed('nothing downloaded yet')
        self.stop_server()
        self.log('Building: the Menagerie\'s pages, then every page this copy lacks (Ys, the Port), then the gallery...')
        t = time.time()
        if self.py(sitectl, 'setup', cwd=os.path.join(self.repo, 'host')):
            raise Failed('the build failed: see the log above')
        self.log('Built in %.0f s.' % (time.time() - t))
        return self.save_state(built=True, built_at=time.strftime('%Y-%m-%d %H:%M'))

    # -- the server

    def serving(self):
        return self.server is not None and self.server.poll() is None

    def free_port(self, start):
        host = '127.0.0.1' if self.local_only else '0.0.0.0'
        for p in range(start, start + 50):
            with socket.socket() as s:
                try:
                    s.bind((host, p))
                    return p
                except OSError:
                    continue
        raise Failed('no free port from %d' % start)

    def serve(self):
        if self.serving():
            return self.url()
        if not self.site_ready():
            raise Failed('nothing built yet: download and build first')
        host = os.path.join(self.repo, 'host')
        sitectl = runpy.run_path(os.path.join(host, 'sitectl.py'), run_name='sitectl')
        self.port = self.free_port(sitectl['port']())
        if not self.local_only:
            sitectl['address'](self.port)   # address.json: what the /share page shows other devices
        cmd = [sys.executable, os.path.join(host, 'server.py'), '--config', os.path.join(host, 'site.toml'),
               '--port', str(self.port)] + (['--host', '127.0.0.1'] if self.local_only else [])
        self.server = subprocess.Popen(cmd, cwd=host, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                       stdin=subprocess.DEVNULL, creationflags=NO_WINDOW,
                                       env={**os.environ, 'PYTHONUTF8': '1', 'PYTHONUNBUFFERED': '1'})
        threading.Thread(target=self.pump, args=(self.server.stdout,), daemon=True).start()
        for _ in range(60):
            try:
                with urllib.request.urlopen('http://127.0.0.1:%d/healthz' % self.port, timeout=2):
                    self.log('Serving at %s' % self.url())
                    return self.url()
            except OSError:
                if self.server.poll() is not None:
                    raise Failed('the server stopped: see the log above')
                time.sleep(0.5)
        raise Failed('the server did not answer')

    def url(self):
        return 'http://localhost:%d/' % self.port

    def menagerie(self):
        """The Menagerie's front page on the site, as host/krator.toml moves it ([sync] menagerie_index)."""
        import tomllib
        try:
            with open(os.path.join(self.repo, 'host', 'krator.toml'), 'rb') as f:
                return tomllib.load(f)['sync'].get('menagerie_index', '/menagerie').lstrip('/')
        except (OSError, KeyError, ValueError):
            return 'menagerie'

    def lan_urls(self):
        if self.local_only or not self.serving():
            return []
        try:
            with open(os.path.join(self.repo, 'host', 'address.json'), encoding='utf-8') as f:
                return json.load(f).get('urls', [])
        except (OSError, ValueError):
            return []

    def stop_server(self):
        if self.serving():
            if os.name == 'nt':   # the exe may have a child of its own: end the whole tree
                subprocess.run(['taskkill', '/T', '/F', '/PID', str(self.server.pid)], capture_output=True,
                               creationflags=NO_WINDOW)
            else:
                self.server.terminate()
            try:
                self.server.wait(10)
            except subprocess.TimeoutExpired:
                self.server.kill()
            self.log('Server stopped.')
        self.server = None


# ---- the window -----------------------------------------------------------------------------------------------

def load_settings():
    try:
        with open(SETTINGS, encoding='utf-8') as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def save_settings(d):
    try:
        os.makedirs(os.path.dirname(SETTINGS), exist_ok=True)
        with open(SETTINGS, 'w', encoding='utf-8') as f:
            json.dump(d, f, indent=1)
    except OSError:
        pass


def window(home, local_only, auto=True):
    import tkinter as tk
    from tkinter import ttk, filedialog, messagebox
    from tkinter.scrolledtext import ScrolledText

    root = tk.Tk()
    root.title(APP)
    root.geometry('900x600')
    root.minsize(640, 420)
    q = queue.Queue()
    k = Krator(home, lambda text, progress=False: q.put((text, progress)), local_only)
    busy = tk.BooleanVar(value=False)
    home_v = tk.StringVar(value=k.home)
    lan_v = tk.BooleanVar(value=not local_only)
    auto_v = tk.BooleanVar(value=auto)
    here_v, there_v, serve_v = tk.StringVar(), tk.StringVar(value='GitHub: checking...'), tk.StringVar()
    latest, github_error = {}, ['']

    frm = ttk.Frame(root, padding=10)
    frm.pack(fill='both', expand=True)
    frm.columnconfigure(1, weight=1)
    ttk.Label(frm, text='Folder').grid(row=0, column=0, sticky='w')
    ttk.Entry(frm, textvariable=home_v, state='readonly').grid(row=0, column=1, sticky='ew', padx=6)
    change_b = ttk.Button(frm, text='Change...')
    change_b.grid(row=0, column=2)
    ttk.Label(frm, textvariable=here_v).grid(row=1, column=0, columnspan=3, sticky='w', pady=(8, 0))
    ttk.Label(frm, textvariable=there_v).grid(row=2, column=0, columnspan=3, sticky='w')
    bar = ttk.Frame(frm)
    bar.grid(row=3, column=0, columnspan=3, sticky='w', pady=8)
    update_b = ttk.Button(bar, text='Download latest and build')
    open_b = ttk.Button(bar, text='Open gallery')
    menagerie_b = ttk.Button(bar, text='Open Menagerie')
    stop_b = ttk.Button(bar, text='Stop server')
    build_b = ttk.Button(bar, text='Rebuild')
    folder_b = ttk.Button(bar, text='Open folder')
    for b in (update_b, open_b, menagerie_b, stop_b, build_b, folder_b):
        b.pack(side='left', padx=(0, 6))
    ticks = ttk.Frame(frm)
    ticks.grid(row=4, column=0, columnspan=3, sticky='w')
    ttk.Checkbutton(ticks, text='Update automatically (checks GitHub every %d minutes)' % (CHECK_EVERY // 60),
                    variable=auto_v, command=lambda: remember()).pack(side='left', padx=(0, 18))
    ttk.Checkbutton(ticks, text='Let phones and other computers on this network open it', variable=lan_v,
                    command=lambda: setattr(k, 'local_only', not lan_v.get()) or remember()).pack(side='left')
    log = ScrolledText(frm, height=20, font=('Consolas', 9) if os.name == 'nt' else 'TkFixedFont', wrap='word', state='disabled')
    log.grid(row=5, column=0, columnspan=3, sticky='nsew', pady=(8, 4))
    frm.rowconfigure(5, weight=1)
    ttk.Label(frm, textvariable=serve_v, foreground='#235').grid(row=6, column=0, columnspan=3, sticky='w')
    progress_line = [False]

    def remember():
        save_settings({'home': k.home, 'local_only': k.local_only, 'auto': auto_v.get()})

    def write(text, progress):
        log.configure(state='normal')
        if progress_line[0]:
            log.delete('end-2l linestart', 'end-1c')
        log.insert('end', text + '\n')
        progress_line[0] = progress
        if int(log.index('end-1c').split('.')[0]) > 4000:
            log.delete('1.0', '1000.0')
        log.see('end')
        log.configure(state='disabled')

    def refresh():
        st = k.state()
        if st.get('commit'):
            here_v.set('This computer: %s, %s: %s%s' % (short(st['commit']), st.get('date', ''), st.get('message', ''),
                       '' if st.get('built') and k.site_ready() else '   (not built)'))
        else:
            here_v.set('This computer: nothing downloaded yet')
        if github_error[0]:
            there_v.set('GitHub: %s' % github_error[0])
        elif latest:
            same = latest['commit'] == st.get('commit')
            there_v.set('GitHub %s: %s, %s%s' % (BRANCH, short(latest['commit']), latest['date'],
                        '   (this is what you have)' if same else '   NEW: ' + latest['message']))
        if k.serving():
            lan = k.lan_urls()
            serve_v.set('Serving at %s%s' % (k.url(), ('   other devices: ' + '  '.join(lan)) if lan else ''))
        else:
            serve_v.set('Not serving: "Open gallery" starts the server.')
        b = busy.get()
        for w in (update_b, change_b):
            w.state(['disabled' if b else '!disabled'])
        build_b.state(['disabled' if b or not os.path.isfile(os.path.join(k.repo, 'host', 'sitectl.py')) else '!disabled'])
        for w in (open_b, menagerie_b):
            w.state(['disabled' if b or not k.site_ready() else '!disabled'])
        stop_b.state(['!disabled' if k.serving() and not b else 'disabled'])

    def poll():
        try:
            while True:
                write(*q.get_nowait())
        except queue.Empty:
            pass
        refresh()
        root.after(150, poll)

    def task(fn, then_open=None, quiet=False):
        """Run fn off the window's thread; then_open: a page of the site to open after ('' is the gallery); quiet:
        a failure goes to the log only (the timer's: no dialog every 15 minutes while offline)."""
        busy.set(True)
        refresh()

        def go():
            try:
                fn()
                if then_open is not None:
                    webbrowser.open(k.serve() + then_open)
            except Failed as e:
                k.log('Stopped: %s' % e)
                if not quiet:
                    root.after(0, lambda: messagebox.showerror(APP, str(e)))
            except Exception as e:   # a bug: show it rather than vanish
                k.log('Error: %r' % e)
                root.after(0, lambda: messagebox.showerror(APP, repr(e)))
            finally:
                root.after(0, lambda: busy.set(False))
        threading.Thread(target=go, daemon=True).start()

    def check_github():
        try:
            latest.update(k.latest())
            github_error[0] = ''
        except Failed as e:
            github_error[0] = str(e)

    def tick():
        """At start and every CHECK_EVERY seconds: what GitHub has, and with "Update automatically" ticked, update to
        it (rebuild, and serve again if serving). Skipped while a button's work is running."""
        if not busy.get():
            if auto_v.get() and k.state().get('commit') and k.ours():
                task(lambda: check_github() or k.update_if_new(), quiet=True)
            else:
                threading.Thread(target=check_github, daemon=True).start()
        root.after(CHECK_EVERY * 1000, tick)

    def change():
        d = filedialog.askdirectory(initialdir=os.path.dirname(k.home), title='Where should Krator Gallery keep its copy?')
        if not d:
            return
        d = os.path.abspath(d)
        probe = Krator(d, k.log)
        if not probe.ours():   # a folder with other things in it: keep the copy in a new folder inside it
            d = os.path.join(d, APP)
        k.stop_server()
        k.home, k.repo = d, os.path.join(d, 'repo')
        home_v.set(d)
        remember()

    def open_folder():
        os.makedirs(k.home, exist_ok=True)
        if os.name == 'nt':
            os.startfile(k.home)
        else:
            subprocess.Popen(['open' if sys.platform == 'darwin' else 'xdg-open', k.home])

    def close():
        k.stop_server()
        root.destroy()

    change_b.configure(command=change)
    update_b.configure(command=lambda: task(k.update, then_open=''))
    build_b.configure(command=lambda: task(k.build, then_open=''))
    open_b.configure(command=lambda: task(lambda: None, then_open=''))
    menagerie_b.configure(command=lambda: task(lambda: None, then_open=k.menagerie()))
    stop_b.configure(command=lambda: task(k.stop_server))
    folder_b.configure(command=open_folder)
    root.protocol('WM_DELETE_WINDOW', close)
    k.log('%s keeps its copy of Krator in %s' % (APP, k.home))
    if not k.site_ready():
        k.log('Press "Download latest and build" to get Krator and the World Menagerie.')
    poll()
    tick()
    root.mainloop()


# ---- without a window -----------------------------------------------------------------------------------------

def headless(args, home, local_only):
    def log(text, progress=False):
        print(text, end='\r' if progress else '\n', flush=True)
    k = Krator(home, log, local_only)
    try:
        if '--update' in args:
            k.update(force='--force' in args)
        if '--build' in args:
            k.build()
        if '--serve' in args:
            url = k.serve()
            webbrowser.open(url)
            auto = '--no-auto' not in args
            print('Ctrl+C stops the server.%s' % (' GitHub is checked every %d minutes; a new main is fetched, '
                  'built and served (--no-auto: never).' % (CHECK_EVERY // 60) if auto else ''))
            due = time.time() + CHECK_EVERY
            while k.serving():
                time.sleep(1)
                if auto and time.time() > due:
                    due = time.time() + CHECK_EVERY
                    try:
                        k.update_if_new()
                    except Failed as e:   # offline for a while: what is built is still served
                        print('update skipped: %s' % e, file=sys.stderr)
    except Failed as e:
        print('stopped: %s' % e, file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        pass
    finally:
        k.stop_server()
    return 0


def main():
    if len(sys.argv) > 1 and sys.argv[1].lower().endswith('.py'):
        fix_stdio()
        return run_script(sys.argv[1], sys.argv[2:])
    args = sys.argv[1:]
    settings = load_settings()
    home = args[args.index('--home') + 1] if '--home' in args[:-1] else settings.get('home', DEFAULT_HOME)
    local_only = '--local-only' in args or settings.get('local_only', False)
    if {'--update', '--build', '--serve'} & set(args):
        fix_stdio()
        return headless(args, home, local_only)
    window(home, local_only, settings.get('auto', True))
    return 0


if __name__ == '__main__':
    sys.exit(main())
