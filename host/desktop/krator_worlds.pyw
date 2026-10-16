#!/usr/bin/env python3
"""Krator Worlds: a desktop window for the Krator Worlds gallery, always from the latest `main` on GitHub.

It keeps its own copy of the repository (a shallow clone, without the Git LFS texture images: the built pages carry
their textures), brings it up to date when you ask, builds the gallery from it the way host/sitectl.py does
(gallery/build_gallery.py with local three.js and the level-of-detail bar), serves it on this computer only
(127.0.0.1, its own port) and opens it in your browser. Your working checkout is never touched.

    python host/desktop/krator_worlds.pyw            (or double-click it; pythonw runs it without a console)

Needs Python 3.11+ (tkinter, tomllib) and git. Nothing else. See host/desktop/README.md.
"""
import json, os, queue, shutil, subprocess, sys, threading, time, urllib.request, webbrowser
import tkinter as tk
from tkinter import ttk, messagebox

REPO_URL = os.environ.get('KRATOR_WORLDS_REPO', 'https://github.com/traviso761-debug/krator-master.git')   # the override is for testing
BRANCH = os.environ.get('KRATOR_WORLDS_BRANCH', 'main')
PORT = 8011                     # the LAN site (host/sitectl) has 8001; this one is for this computer only
HOST = '127.0.0.1'
DATA = os.environ.get('KRATOR_WORLDS_HOME') or os.path.join(os.environ.get('LOCALAPPDATA') or os.path.expanduser('~/.local/share'), 'KratorWorlds')
REPO = os.path.join(DATA, 'krator-master')
STATE = os.path.join(DATA, 'state.json')
ENV = {**os.environ, 'PYTHONUTF8': '1', 'GIT_LFS_SKIP_SMUDGE': '1', 'GIT_TERMINAL_PROMPT': '0'}
NOWIN = getattr(subprocess, 'CREATE_NO_WINDOW', 0)   # no console flashing up for each child on Windows
PY = sys.executable
if os.path.basename(PY).lower() == 'pythonw.exe':   # children print: give them the console-less python.exe's twin
    _py = os.path.join(os.path.dirname(PY), 'python.exe')
    PY = _py if os.path.isfile(_py) else PY

GOLD, INK, PAPER, DIM = '#c99a55', '#120e3a', '#e8c98a', '#8a7fae'


def load_state():
    try:
        with open(STATE, encoding='utf-8') as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def save_state(s):
    os.makedirs(DATA, exist_ok=True)
    with open(STATE, 'w', encoding='utf-8') as f:
        json.dump(s, f, indent=1)


def git(*args, cwd=REPO):
    r = subprocess.run(['git', *args], cwd=cwd, env=ENV, capture_output=True, text=True, creationflags=NOWIN)
    if r.returncode:
        raise RuntimeError('git %s: %s' % (' '.join(args), (r.stderr or r.stdout).strip()))
    return r.stdout.strip()


def have_repo():
    return os.path.isdir(os.path.join(REPO, '.git'))


def local_version():
    """(sha, date, subject) of the copy this app has, or None."""
    if not have_repo():
        return None
    out = git('log', '-1', '--format=%H%x1f%cs%x1f%s')
    return tuple(out.split('\x1f', 2))


def remote_sha():
    out = git('ls-remote', REPO_URL, 'refs/heads/' + BRANCH, cwd=DATA if os.path.isdir(DATA) else None)
    return out.split()[0] if out else None


def remote_info(sha):
    """The commit's date and subject from GitHub's API (no clone needed); None if the API is unreachable."""
    try:
        req = urllib.request.Request('https://api.github.com/repos/traviso761-debug/krator-master/commits/' + sha,
                                     headers={'Accept': 'application/vnd.github+json', 'User-Agent': 'krator-worlds'})
        with urllib.request.urlopen(req, timeout=10) as r:
            c = json.load(r)['commit']
        return c['committer']['date'][:10], c['message'].splitlines()[0]
    except Exception:
        return None


class App:
    def __init__(self, root):
        self.root, self.q, self.server, self.busy = root, queue.Queue(), None, False
        root.title('Krator Worlds')
        root.configure(bg=INK)
        root.minsize(640, 460)
        root.protocol('WM_DELETE_WINDOW', self.quit)
        st = ttk.Style()
        st.theme_use('clam')
        st.configure('K.TButton', background=INK, foreground=PAPER, bordercolor=GOLD, focuscolor=GOLD,
                     font=('Georgia', 11), padding=(14, 7))
        st.map('K.TButton', background=[('active', '#2a2366'), ('disabled', INK)], foreground=[('disabled', DIM)])
        st.configure('K.Horizontal.TProgressbar', background=GOLD, troughcolor='#221c55', bordercolor=INK)

        tk.Label(root, text='KRATOR WORLDS', bg=INK, fg=GOLD, font=('Georgia', 22)).pack(pady=(18, 2))
        tk.Label(root, text='the gallery, from the latest version on GitHub', bg=INK, fg=DIM,
                 font=('Georgia', 11, 'italic')).pack()
        self.here = tk.Label(root, bg=INK, fg=PAPER, font=('Georgia', 11), justify='left', anchor='w')
        self.there = tk.Label(root, bg=INK, fg=PAPER, font=('Georgia', 11), justify='left', anchor='w')
        self.here.pack(fill='x', padx=24, pady=(16, 0))
        self.there.pack(fill='x', padx=24, pady=(2, 0))

        bar = tk.Frame(root, bg=INK)
        bar.pack(pady=14)
        self.b_open = ttk.Button(bar, text='Open Krator Worlds', style='K.TButton', command=self.open_gallery)
        self.b_update = ttk.Button(bar, text='Get the latest', style='K.TButton', command=self.update)
        self.b_check = ttk.Button(bar, text='Check GitHub', style='K.TButton', command=self.check)
        for b in (self.b_open, self.b_update, self.b_check):
            b.pack(side='left', padx=5)
        self.prog = ttk.Progressbar(root, mode='indeterminate', style='K.Horizontal.TProgressbar')
        self.prog.pack(fill='x', padx=24)

        self.log = tk.Text(root, height=12, bg='#0b0826', fg='#bdb3e0', insertbackground=PAPER, relief='flat',
                           font=('Consolas', 9), wrap='word', state='disabled')
        self.log.pack(fill='both', expand=True, padx=24, pady=(10, 6))
        foot = tk.Frame(root, bg=INK)
        foot.pack(fill='x', padx=24, pady=(0, 12))
        tk.Label(foot, text='Its copy lives in ' + REPO, bg=INK, fg=DIM, font=('Georgia', 9)).pack(side='left')
        if os.name == 'nt':
            ttk.Button(foot, text='Desktop shortcut', style='K.TButton', command=self.shortcut).pack(side='right')

        self.root.after(100, self.pump)
        self.show_local()
        self.check()

    # ------------------------------------------------------------------ plumbing
    def say(self, text):
        self.q.put(('log', text))

    def pump(self):
        try:
            while True:
                kind, val = self.q.get_nowait()
                if kind == 'log':
                    self.log.configure(state='normal')
                    self.log.insert('end', val.rstrip('\n') + '\n')
                    self.log.see('end')
                    self.log.configure(state='disabled')
                elif kind == 'call':
                    val()
        except queue.Empty:
            pass
        self.root.after(100, self.pump)

    def ui(self, fn):
        self.q.put(('call', fn))

    def work(self, label, fn):
        """Run fn on a worker thread with the buttons off and the bar moving."""
        if self.busy:
            return
        self.busy = True
        for b in (self.b_open, self.b_update, self.b_check):
            b.state(['disabled'])
        self.prog.start(12)
        self.say('— ' + label)

        def run():
            try:
                fn()
            except Exception as e:
                self.say('Stopped: %s' % e)
            finally:
                def done():
                    self.busy = False
                    self.prog.stop()
                    for b in (self.b_open, self.b_update, self.b_check):
                        b.state(['!disabled'])
                    self.show_local()
                self.ui(done)
        threading.Thread(target=run, daemon=True).start()

    def stream(self, args, cwd):
        """Run a child, copying its output into the log; raise if it fails."""
        p = subprocess.Popen(args, cwd=cwd, env=ENV, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
                             encoding='utf-8', errors='replace', creationflags=NOWIN)
        for line in p.stdout:
            self.say(line)
        if p.wait():
            raise RuntimeError('%s exited with %d' % (os.path.basename(args[1] if args[0] == PY else args[0]), p.returncode))

    # ------------------------------------------------------------------ status
    def show_local(self):
        v = local_version() if have_repo() else None
        built = os.path.isfile(os.path.join(REPO, 'host', 'site', 'index.html'))
        if not v:
            self.here.configure(text='This computer:  no copy yet. "Get the latest" downloads it (about 1 GB, once).')
        else:
            self.here.configure(text='This computer:  %s  (%s)  %s%s' % (v[0][:8], v[1], v[2][:70],
                                                                     '' if built else '   — not built yet'))

    def check(self):
        def fn():
            sha = remote_sha()
            info = remote_info(sha) if sha else None
            v = local_version()
            same = bool(v and sha and v[0] == sha)
            line = 'GitHub (%s):  %s' % (BRANCH, sha[:8] if sha else '?')
            if info:
                line += '  (%s)  %s' % (info[0], info[1][:70])
            line += '   — you have it' if same else ('   — newer than yours' if v else '')
            self.ui(lambda: self.there.configure(text=line, fg=PAPER if same else GOLD))
            self.say('GitHub has %s; this computer has %s.' % (sha[:8] if sha else 'nothing?', v[0][:8] if v else 'no copy'))
        self.work('Checking GitHub', fn)

    # ------------------------------------------------------------------ update: fetch, then build the site
    def update(self):
        def fn():
            os.makedirs(DATA, exist_ok=True)
            if not have_repo():
                self.say('Downloading the latest %s (one commit, no texture images; this takes a while the first time)…' % BRANCH)
                self.stream(['git', 'clone', '--progress', '--depth', '1', '--branch', BRANCH, '--single-branch', REPO_URL, REPO], DATA)
            else:
                old = local_version()
                self.say('Fetching the latest %s…' % BRANCH)
                self.stream(['git', 'fetch', '--progress', '--depth', '1', 'origin', BRANCH], REPO)
                git('reset', '--hard', 'FETCH_HEAD')
                git('clean', '-fd', '-q')        # untracked leftovers go; ignored files (the built site) stay
                new = local_version()
                self.say('Already up to date.' if old and new and old[0] == new[0] else 'Updated to %s: %s' % (new[0][:8], new[2]))
            self.build()
            st = load_state()
            st['built'] = local_version()[0]
            save_state(st)
            self.say('Ready.')
            if self.server_up():
                self.say('The open gallery shows the new pages on reload.')
        self.work('Getting the latest version', fn)

    def build(self):
        host = os.path.join(REPO, 'host')
        self.say('Building the gallery (only pages GitHub does not carry are built; the rest are reused)…')
        self.stream([PY, os.path.join(host, 'sitectl.py'), 'update'], REPO)

    # ------------------------------------------------------------------ serve and open
    def server_up(self):
        try:
            with urllib.request.urlopen('http://%s:%d/healthz' % (HOST, PORT), timeout=2) as r:
                return r.read().strip() == b'ok'
        except OSError:
            return False

    def open_gallery(self):
        def fn():
            if not os.path.isfile(os.path.join(REPO, 'host', 'site', 'index.html')):
                self.say('No gallery on this computer yet: getting the latest first.')
                self.ui(lambda: self.root.after(50, self.update))
                return
            if not self.server_up():
                host = os.path.join(REPO, 'host')
                self.server = subprocess.Popen([PY, os.path.join(host, 'server.py'), '--config', os.path.join(host, 'site.toml'),
                                                '--host', HOST, '--port', str(PORT)], cwd=host, env=ENV,
                                               stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
                                               encoding='utf-8', errors='replace', creationflags=NOWIN)
                threading.Thread(target=lambda: [self.say(l) for l in self.server.stdout], daemon=True).start()
                for _ in range(50):
                    if self.server_up():
                        break
                    if self.server.poll() is not None:
                        raise RuntimeError('the server stopped (see above)')
                    time.sleep(0.2)
                else:
                    raise RuntimeError('the server did not answer on port %d' % PORT)
            url = 'http://localhost:%d/' % PORT
            self.say('Opening ' + url)
            webbrowser.open(url)
        self.work('Opening the gallery', fn)

    def shortcut(self):
        """A Desktop shortcut that starts this window with pythonw (no console)."""
        pyw = os.path.join(os.path.dirname(sys.executable), 'pythonw.exe')
        target = pyw if os.path.isfile(pyw) else sys.executable
        me = os.path.abspath(__file__)
        if not me.startswith(REPO):   # run from a working checkout: point the shortcut at the app's own copy once it has one
            mine = os.path.join(REPO, 'host', 'desktop', 'krator_worlds.pyw')
            me = mine if os.path.isfile(mine) else me
        ps = ("$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Desktop')+'\\Krator Worlds.lnk');"
              "$s.TargetPath='%s';$s.Arguments='\"%s\"';$s.WorkingDirectory='%s';$s.Description='Krator Worlds gallery';$s.Save()"
              % (target.replace("'", "''"), me.replace("'", "''"), os.path.dirname(me).replace("'", "''")))
        r = subprocess.run(['powershell', '-NoProfile', '-Command', ps], capture_output=True, text=True, creationflags=NOWIN)
        if r.returncode:
            messagebox.showerror('Krator Worlds', 'Could not make the shortcut:\n' + (r.stderr or r.stdout))
        else:
            self.say('Made "Krator Worlds" on the Desktop.')

    def quit(self):
        if self.server and self.server.poll() is None:
            self.server.terminate()
        self.root.destroy()


def main():
    if sys.version_info < (3, 11):
        messagebox.showerror('Krator Worlds', 'Krator Worlds needs Python 3.11 or later.')
        return 1
    if not shutil.which('git'):
        messagebox.showerror('Krator Worlds', 'Krator Worlds needs git (https://git-scm.com).')
        return 1
    root = tk.Tk()
    App(root)
    root.mainloop()
    return 0


if __name__ == '__main__':
    sys.exit(main())
