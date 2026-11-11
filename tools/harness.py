#!/usr/bin/env python3
"""The shared verify harness (GODOT-PLAN.md Phase 1, ROADMAP.md stage 0b): what every verify.py used to carry as
its own "Harness helpers" block, once. A verify.py imports it:

    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
    from harness import GL_ARGS, LOAD_MS, launch_chromium, local_three, parse_views, serve, STATS_JS

and keeps only what is its own: its asserts, its views, its report. A fix to loading, serving or launching lands
here and reaches every build that imports it.

It also runs on its own, as a smoke test (load each page, wait for `window._ready`, report the error panel, page
errors, draw calls and triangles; exit 1 if any page is dirty or never gets ready):

    python3 tools/harness.py smoke settlements/voth/dist/voth-city.html biomes/rift/dist/rift.html ...

and as a scripted walk (stage 0j): hold real keys along a route and check the walker moved, stayed up and the
console stayed clean:

    python3 tools/harness.py walk settlements/girder/girder.html --route KeyW:20f --start auto --min 2 --dir 0,-1

Locally, KRATOR_GL=gpu launches on the real GPU instead of SwiftShader (`python3 tools/harness.py renderer` says which
renderer a page gets); a verify whose page, verify.py and arguments are unchanged since its last pass is skipped (the
verify cache, below).

and as the exporter's driver (ROADMAP.md stage 2d): core/export's krator-world container written headless for Godot
(world.json, world.glb, the library pack's maps; core/export/README.md):

    python3 tools/harness.py export biomes/sedesert/dist/sedesert.html --out godot/data/world-sedesert --box 80,490,380,790

VERIFY_PAGE (CORE-IMPROVEMENTS.md items 2c, 2d, 3c, 6, 10a, 15, 16). Every verify.py opens its page through `verify_page`,
which owns the GPU lock, the browser, the server and the load, and runs the universal asserts on the way out, so no
verify can pass a broken page:

    async with verify_page(a.html, here=HERE, size=a.size) as V:
        pg, errs, fails = V.page, V.errs, V.fails      # the build's own checks append to fails
        ...
        await V.shot(fn, view=v)                         # screenshot + calls/tris + the eye check for that view
    return V.exit()                                      # prints the universal results, returns the exit code

The universal asserts: the page is not an LFS pointer; it got ready; the error panel and page errors are clean; no
shader compile or WebGL errors in the console (r128 sends them to console.error only); every texture decoded; the real
GPU when KRATOR_GL=gpu; no NaN geometry and no empty registered volume (when the page has the probe, `_api`); no
instanced item past the instance cap (3c); the eye of every view is not inside geometry (10a); the budget in the
build's BUDGETS.json; BIO.capReport and _api.seatSweeps when the page has them; a winding report (item 15, never a
failure). `await V.sheet(out)` or `harness.py sheet <page>` draws every BIO item alone on a grid. A page that fails one today is listed in tools/verify_ratchet.json and only warns; anything not
listed fails. `python3 tools/harness.py ratchet <pages>` reruns the universal asserts and lists a page's failures
(--write records them; a page is taken out of the ratchet at its own rebuild turn).

The GPU lanes (item 16; 2026-11-03): with KRATOR_GL=gpu, verify_page takes a GPU lane's lock, a directory with an
`owner` file. Two lanes: `arc`, the Intel Arc 140T (KRATOR_GPU_LOCK, default <temp>/claude/krator-verify-gpu.lock, the
path every older harness copy takes), and `rtx`, the RTX 5060 (KRATOR_GPU_LOCK_RTX, default
<temp>/claude/krator-verify-gpu-rtx.lock; Chromium gets --force_high_performance_gpu). KRATOR_GPU_LANE picks one: arc,
rtx or auto (whichever frees first); unset, a verify takes auto and a timing run (--timing, perf_views.py,
ground_shots.py) and `harness.py lock` take arc. Waiters queue first come first served (a ticket each in <lock>.queue;
a dead waiter's ticket is dropped; KRATOR_GPU_LOCK_TIMEOUT, default 8 h); a lock someone holds is never taken, except
from a harness that is no longer running. Do not take a lock in bash around a verify; to run another command under one:

    python3 tools/harness.py lock [--lane arc|rtx|auto] [--timeout S] [--stall MIN] -- python3 biomes/godthrone/perf.py ...
    python3 tools/harness.py lock --lane rtx -- godot --path godot ...                # Godot GPU runs (not --headless)
    python3 tools/harness.py lanes                                                    # who holds each lane, who waits

The cloud lanes (2026-11-10; tools/CLOUD-LANE.md, tools/cloud_lane.py): vast0, vast1, one per GPU of a rented machine,
on when %LOCALAPPDATA%/krator-cloud.json says so (`harness.py cloud on|off|status|setup`). Then a verify.py run on the GPU
queues for arc, rtx and the cloud lanes that answer (auto), or for one by name (KRATOR_GPU_LANE=vast0, or cloud for
either); its wrapper takes the lane and, on a cloud lane, sends a snapshot of the working tree and the LFS files it needs
over SSH, streams the run, and brings back what it wrote and a verify cache entry. Timing runs and `lock` stay local. With
no config the harness behaves exactly as before.

The stall watchdog: `lock` runs its command, and a verify.py that imports this harness at its top re-runs itself as a
child (verify_wrap), under run_watched: no output and no file written in its --out folder for KRATOR_GPU_STALL_MIN
(default 25) minutes kills the job's process tree, releases its lock and exits 124 ("STALLED": rerun it). While the
job progresses the owner file is touched each minute: the 30-minute heartbeat. The verify cache: an --assert run that
passed on the same bytes (the page and every file it loaded, the verify.py, this harness, the arguments) prints
"cached pass" and is skipped; --no-cache reruns; failures are never cached (see "The verify wrapper" below).

Every browser the harness launches is recorded by PID (<temp>/claude/krator-harness/<pid>.json); a later harness kills
the browsers of a harness that died, by PID and only when the process is a Chromium.
"""
import asyncio, contextlib, functools, glob, http.server, json, os, re, socketserver, subprocess, sys, tempfile, threading, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Software GL (SwiftShader) by default: the Linux cloud containers and CI have no GPU. KRATOR_GL=gpu runs on the real GPU
# through ANGLE (D3D11 on Windows, Metal on a Mac, OpenGL elsewhere): 2.5x on page loads locally (EFFICIENCY.md, the
# timing run). The renderer a page got is printed by `renderer` below; CI keeps SwiftShader.
SWIFTSHADER_ARGS = ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"]
GPU_ARGS = ["--use-angle=" + ("d3d11" if sys.platform == "win32" else "metal" if sys.platform == "darwin" else "gl"),
            "--enable-gpu", "--enable-webgl", "--ignore-gpu-blocklist"]
GL_ARGS = GPU_ARGS if os.environ.get("KRATOR_GL", "").lower() == "gpu" else SWIFTSHADER_ARGS
RENDERER_JS = ("()=>{try{const g=document.createElement('canvas').getContext('webgl');const e=g&&g.getExtension('WEBGL_debug_renderer_info');"
               "return g?(e?g.getParameter(e.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER)):'no webgl';}catch(err){return 'error: '+err;}}")
# Every page builds its world in one synchronous script, so "load" fires only when the world is built: minutes under
# software GL on a shared box (Dalab's city took 285 s with seven other agents running; 180 s timed Locus out).
LOAD_MS = 900000
# KRATOR_CHROME names a Chromium to launch. The other names are the ones single copies of this harness used before
# they were merged; they still work.
CHROME_ENV = ("KRATOR_CHROME", "PW_CHROME", "PW_CHROMIUM", "CHROME_PATH", "VERIFY_CHROME", "CHROMIUM")
# ready: the world is built (`window._ready`; the open world says it as `WORLD.ready`, Voth's city plan and site
# editor as `_vc.ready` and `_site.ready`), or the error panel has filled
READY_JS = ("window._ready===true || (window.WORLD&&window.WORLD.ready===true) || (window._vc&&window._vc.ready) || "
            "(window._site&&window._site.ready) || (document.getElementById('errs')&&"
            "document.getElementById('errs').textContent.length>0)")
STATS_JS = """()=>{const w={};for(const k of Object.keys(window)){if(!k.startsWith('_')||k==='__THREE__')continue;
 const v=window[k];if(typeof v==='function'||typeof v==='object'&&v&&!Array.isArray(v)&&k==='_api')continue;
 let s=null;try{s=JSON.stringify(v);}catch(e){continue;}w[k]=(s&&s.length<600)?v:'(large)';}
return {errs:document.getElementById('errs')?document.getElementById('errs').textContent:'(no #errs)',
        calls:(typeof renderer!=='undefined')?renderer.info.render.calls:null,
        tris:(typeof renderer!=='undefined')?renderer.info.render.triangles:null,counters:w};}"""

try:   # structure names hold em dashes; the Windows console's default codepage mangles them
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass


# --------------------------------------------------------------------------
# Processes: the GPU lock and the browsers this harness launched (item 16)
TMP = os.path.join(tempfile.gettempdir(), "claude")
GPU_LOCK = os.environ.get("KRATOR_GPU_LOCK") or os.path.join(TMP, "krator-verify-gpu.lock")
# The lanes (2026-11-03): `arc` is the Intel Arc 140T, Chromium's default adapter, on the lock every older harness copy
# takes; `rtx` is the RTX 5060, which headless Chromium takes with --force_high_performance_gpu (ANGLE D3D11 asks DXGI for
# the high-performance adapter; WEBGL_debug_renderer_info then reads "NVIDIA GeForce RTX 5060 Laptop GPU"). Godot runs on
# the RTX too (its default; --gpu-index 1 is the Intel), so a Godot GPU run takes the rtx lane.
GPU_LOCK_RTX = os.environ.get("KRATOR_GPU_LOCK_RTX") or os.path.join(TMP, "krator-verify-gpu-rtx.lock")
LANES = {"arc": GPU_LOCK, "rtx": GPU_LOCK_RTX}
LANE_ARGS = {"arc": [], "rtx": ["--force_high_performance_gpu"]}
LANE_VENDOR = {"arc": "intel", "rtx": "nvidia"}
# The cloud lanes (tools/CLOUD-LANE.md, tools/cloud_lane.py; 2026-11-10): vast0, vast1, ... one per GPU of a rented machine,
# switched on by a config outside the repo. Their locks sit beside arc's and rtx's; only verify.py runs take them.
CLOUD_LANE_NAMES = tuple("vast%d" % i for i in range(16))   # the locks all_locks() looks after, whichever machines serve them
# ANGLE on the NVIDIA driver's EGL: passes real pages on the RTX PRO 5000. ANGLE on Vulkan reports the GPU on a blank page
# but loses the context on a real one (2026-11-10); the Linux default above (--use-angle=gl) falls back to SwiftShader.
CLOUD_LANE_ARGS = ["--use-gl=angle", "--use-angle=gl-egl"]


def is_cloud_lane(lane):
    return bool(lane) and re.match(r"^vast\d+$", lane) is not None


def lock_path(lane):
    return LANES.get(lane) or os.path.join(os.environ.get("KRATOR_CLOUD_STATE") or TMP, "krator-verify-gpu-%s.lock" % lane)


def all_locks():
    """Every lane's lock: the local lanes', then the cloud lanes' (a lock nobody holds is skipped by its readers)."""
    return list(LANES.values()) + [lock_path(ln) for ln in CLOUD_LANE_NAMES]


def lane_vendor(lane):
    return LANE_VENDOR.get(lane) or ("nvidia" if is_cloud_lane(lane) else "")


def _cloud():
    here = os.path.dirname(os.path.abspath(__file__))
    if here not in sys.path:
        sys.path.insert(0, here)
    import cloud_lane
    return cloud_lane
# timing runs stay on arc unless KRATOR_GPU_LANE says otherwise, so their numbers stay comparable
TIMING_SCRIPTS = ("perf_views.py", "ground_shots.py")
STALL_MIN = float(os.environ.get("KRATOR_GPU_STALL_MIN") or 25)
LOCK_POLL = float(os.environ.get("KRATOR_GPU_LOCK_POLL") or 3)
CACHE_DIR = os.environ.get("KRATOR_VERIFY_CACHE_DIR") or os.path.join(os.environ.get("LOCALAPPDATA") or TMP, "krator-verify-cache")
BROWSERS_DIR = os.path.join(TMP, "krator-harness")
CHROME_NAMES = re.compile(r"chrome|chromium|headless_shell", re.I)


def _proc_table():
    """{pid: (ppid, exe name)} for every process: Toolhelp32 on Windows (no psutil here), ps elsewhere."""
    out = {}
    if sys.platform == "win32":
        import ctypes
        from ctypes import wintypes

        class PE(ctypes.Structure):
            _fields_ = [("dwSize", wintypes.DWORD), ("cntUsage", wintypes.DWORD), ("th32ProcessID", wintypes.DWORD),
                        ("th32DefaultHeapID", ctypes.c_void_p), ("th32ModuleID", wintypes.DWORD),
                        ("cntThreads", wintypes.DWORD), ("th32ParentProcessID", wintypes.DWORD),
                        ("pcPriClassBase", ctypes.c_long), ("dwFlags", wintypes.DWORD), ("szExeFile", ctypes.c_wchar * 260)]
        k32 = ctypes.windll.kernel32
        k32.CreateToolhelp32Snapshot.restype = wintypes.HANDLE
        snap = k32.CreateToolhelp32Snapshot(2, 0)
        e = PE()
        e.dwSize = ctypes.sizeof(PE)
        ok = k32.Process32FirstW(snap, ctypes.byref(e))
        while ok:
            out[e.th32ProcessID] = (e.th32ParentProcessID, e.szExeFile)
            ok = k32.Process32NextW(snap, ctypes.byref(e))
        k32.CloseHandle(snap)
        return out
    try:
        for ln in subprocess.run(["ps", "-eo", "pid=,ppid=,comm="], capture_output=True, text=True).stdout.splitlines():
            t = ln.split(None, 2)
            if len(t) == 3:
                out[int(t[0])] = (int(t[1]), t[2])
    except Exception:
        pass
    return out


def pid_alive(pid):
    if not pid:
        return False
    if sys.platform == "win32":
        import ctypes
        h = ctypes.windll.kernel32.OpenProcess(0x1000, False, int(pid))   # PROCESS_QUERY_LIMITED_INFORMATION
        if not h:
            return False
        code = ctypes.c_ulong()
        ctypes.windll.kernel32.GetExitCodeProcess(h, ctypes.byref(code))
        ctypes.windll.kernel32.CloseHandle(h)
        return code.value == 259                                            # STILL_ACTIVE
    try:
        os.kill(int(pid), 0)
    except OSError:
        return False
    # a zombie answers kill(0) but is dead: under a PID 1 that does not reap orphans (a container) a killed job stays one
    try:
        with open('/proc/%d/stat' % int(pid), encoding='utf-8') as f:
            return f.read().rsplit(')', 1)[1].split()[0] != 'Z'
    except (OSError, IndexError):
        return True


def _proc_start(pid):
    """When the process started (epoch seconds), or None where it cannot be read."""
    if sys.platform != "win32":
        return None
    import ctypes
    h = ctypes.windll.kernel32.OpenProcess(0x1000, False, int(pid))
    if not h:
        return None
    t = [ctypes.c_ulonglong() for _ in range(4)]
    ok = ctypes.windll.kernel32.GetProcessTimes(h, *[ctypes.byref(x) for x in t])
    ctypes.windll.kernel32.CloseHandle(h)
    return t[0].value / 1e7 - 11644473600 if ok else None


def _kill_pids(pids, before=None):
    """Kill these PIDs (and their trees) when each is still a Chromium, and (given `before`) started before then, so a
    reused PID is never hit: never by name or pattern (memory: kill by PID)."""
    tab = _proc_table()
    hit = [p for p in pids if p in tab and CHROME_NAMES.search(tab[p][1] or "")
           and not (before and (_proc_start(p) or 0) > before + 2)]
    for p in hit:
        try:
            if sys.platform == "win32":
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(p)], capture_output=True, creationflags=0x08000000)
            else:
                os.kill(p, 9)
        except Exception:
            pass
    return hit


def reap_orphans():
    """Kill the browsers of every harness that died without closing them (stopped verify loops left
    chrome-headless-shell at 500 MB each)."""
    os.makedirs(BROWSERS_DIR, exist_ok=True)
    for f in glob.glob(os.path.join(BROWSERS_DIR, "*.json")):
        try:
            owner = int(os.path.basename(f)[:-5])
            if pid_alive(owner):
                continue
            with open(f, encoding="utf-8") as fh:
                rec = json.load(fh)
            hit = _kill_pids(rec.get("pids", []), before=rec.get("t"))
            if hit:
                print("harness: killed %d orphaned browser process(es) of dead harness %d: %s" % (len(hit), owner, hit), flush=True)
            os.remove(f)
        except Exception:
            pass


_MY_BROWSERS = set()


def _descendants(tab=None):
    tab = tab or _proc_table()
    kids, todo = set(), [os.getpid()]
    while todo:
        q = todo.pop()
        for pid, (pp, name) in tab.items():
            if pp == q and pid not in kids and pid != q:
                kids.add(pid)
                todo.append(pid)
    return kids


def _record_browsers():
    """The Chromium processes under this process (python -> playwright driver -> chrome), written to our record."""
    tab = _proc_table()
    _MY_BROWSERS.update(p for p in _descendants(tab) if CHROME_NAMES.search(tab[p][1] or ""))
    try:
        os.makedirs(BROWSERS_DIR, exist_ok=True)
        with open(os.path.join(BROWSERS_DIR, "%d.json" % os.getpid()), "w", encoding="utf-8", newline="\n") as fh:
            json.dump({"pids": sorted(_MY_BROWSERS), "argv": sys.argv[:4], "t": time.time()}, fh)
    except Exception:
        pass


def _forget_browsers(kill=False):
    if kill and _MY_BROWSERS:   # only those still under this process: a browser closed normally is gone
        _kill_pids(sorted(_MY_BROWSERS & _descendants()))
    _MY_BROWSERS.clear()
    try:
        os.remove(os.path.join(BROWSERS_DIR, "%d.json" % os.getpid()))
    except OSError:
        pass


import atexit
atexit.register(lambda: _forget_browsers(kill=True))


class GpuLockTimeout(RuntimeError):
    pass


def page_crashed(pg):
    """A crashed renderer: an evaluate already waiting on it never returns, so a verify sat on the GPU lock until something
    killed it (swlowlands, 2026-11-02). Say so, give the lock back if this process took it, and leave with exit code 75."""
    print("harness: THE PAGE CRASHED (the renderer died): %s" % pg.url, flush=True)
    _forget_browsers(kill=True)
    for lk in LANES.values():
        _release(lk)
    os._exit(75)


def renderer_pids():
    """The renderers among this process's Chromium processes (by their --type=renderer command line)."""
    tab = _proc_table()
    mine = set(p for p in _descendants(tab) if CHROME_NAMES.search(tab[p][1] or ""))
    if not mine:
        return []
    if sys.platform == "win32":
        ps = "Get-CimInstance Win32_Process -Filter \"Name like '%chrome%'\" | ForEach-Object { \"$($_.ProcessId) $($_.CommandLine)\" }"
        out = subprocess.run(["powershell", "-NoProfile", "-Command", ps], capture_output=True, text=True, errors="replace").stdout
        lines = [ln.split(None, 1) for ln in out.splitlines() if ln.strip()]
        return [int(t[0]) for t in lines if len(t) == 2 and t[0].isdigit() and int(t[0]) in mine and "--type=renderer" in t[1]]
    found = []
    for p in mine:
        with contextlib.suppress(OSError):
            with open("/proc/%d/cmdline" % p, "rb") as fh:
                if b"--type=renderer" in fh.read():
                    found.append(p)
    return found


async def watch_renderer(pg):
    """A renderer can die with no crash event (swlowlands' V8 out of memory, 2026-11-02: most deaths): the browser and the GPU
    process live on and an evaluate waits for ever, on the GPU lock. Poll the renderer's pid; gone is the same as the event."""
    pids = renderer_pids()
    if not pids:
        return
    while True:
        await asyncio.sleep(5)
        if not any(pid_alive(p) for p in pids):
            page_crashed(pg)


def _lock_owner(lock=None):
    try:
        with open(os.path.join(lock or GPU_LOCK, "owner"), encoding="utf-8", errors="replace") as fh:
            return fh.read().strip()
    except OSError:
        return ""


def _release(lock, pid=None):
    """Remove `lock` when the harness holding it is `pid` (default this process); never anyone else's."""
    if re.match(r"harness pid=%d\b" % (pid or os.getpid()), _lock_owner(lock)):
        with contextlib.suppress(OSError):
            os.remove(os.path.join(lock, "owner"))
        with contextlib.suppress(OSError):
            os.rmdir(lock)


def timing_run(argv=None):
    argv = sys.argv if argv is None else argv
    return "--timing" in argv or os.path.basename(argv[0] if argv else "") in TIMING_SCRIPTS


def pick_lane(lane=None):
    """The lane asked for (`lane`, else KRATOR_GPU_LANE): arc, rtx or auto (whichever frees first). Unset: arc for a
    timing run (--timing, perf_views.py, ground_shots.py), auto for everything else."""
    lane = (lane or os.environ.get("KRATOR_GPU_LANE") or "").lower()
    if lane in LANES or lane in ("auto", "cloud") or is_cloud_lane(lane):
        return lane
    return "arc" if timing_run() else "auto"


def _ticket_live(path):
    """A waiter's ticket stands while its process lives (the same process: its start time matches, so a reused PID does
    not count) and it touched the ticket in the last 15 minutes."""
    try:
        with open(path, encoding="utf-8") as fh:
            t = json.load(fh)
        if time.time() - os.path.getmtime(path) > 900 or not pid_alive(t["pid"]):
            return False
        st = _proc_start(t["pid"])
        return not (st and t.get("start") and abs(st - t["start"]) > 2)
    except (OSError, ValueError, KeyError, TypeError):
        return False


def lane_queue(lane):
    """The lane's live tickets, first come first: <lock>.queue/<time_ns>-<pid>.ticket. Dead waiters' tickets are removed."""
    q = lock_path(lane) + ".queue"
    out = []
    for n in sorted(os.listdir(q)) if os.path.isdir(q) else []:
        if not n.endswith(".ticket"):
            continue
        if _ticket_live(os.path.join(q, n)):
            out.append(n)
        else:
            with contextlib.suppress(OSError):
                os.remove(os.path.join(q, n))
    return out


def _owner_note(lock):
    """The holder's heartbeat: minutes since the owner file was touched. A holder without the watchdog (an older harness,
    a bash holder: no lane= in its owner line) never touches it, so that age is only when it took the lock."""
    try:
        age = (time.time() - os.path.getmtime(os.path.join(lock, "owner"))) / 60
    except OSError:
        return ""
    if " lane=" in _lock_owner(lock):
        return " (heartbeat %.0f min ago)" % age
    return " (taken %.0f min ago; no watchdog or heartbeat: check it by hand, CLAUDE.md)" % age


def _lanes_for(lane, cloud):
    """The lanes a waiter queues for. `cloud` (a verify.py run, verify_wrap): auto adds the cloud lanes that answer, and
    cloud or vastN asks for them; anything else never takes a cloud lane (a note, then auto)."""
    if not cloud:
        if lane == "cloud" or is_cloud_lane(lane):
            print("harness: only verify.py runs take the cloud lanes (tools/CLOUD-LANE.md); this one takes a local lane", flush=True)
            lane = "auto"
        return lane, (list(LANES) if lane == "auto" else [lane])
    up = _cloud().lanes_up()
    if lane == "auto":
        return lane, list(LANES) + up
    if lane == "cloud" or is_cloud_lane(lane):
        want = [ln for ln in up if lane == "cloud" or ln == lane]
        if not want:
            cl = _cloud()
            m = cl.machine_of(lane) if lane != "cloud" else None
            if not cl.load_config():
                why = "the cloud lanes are off (harness.py cloud on)"
            elif lane == "cloud":
                why = "no cloud machine answers"
            elif not m:
                why = "no machine that is on serves it (%s)" % ", ".join(cl.configured_lanes())
            else:
                why = "machine %s does not answer: %s" % (m["id"], cl.reachable(m)[1] or "stopped?")
            raise cl.CloudDown("cloud lane %s: %s" % (lane, why))
        return lane, want
    return lane, [lane]


@contextlib.contextmanager
def gpu_lock(timeout=None, what="", lane=None, cloud=False):
    """The GPU locks (HANDOFF-REBUILD.md, "Practical rules"; one per lane, LANES): a directory made with mkdir, an `owner`
    file inside. Waiters queue first come first served (a ticket per waiter in <lock>.queue; a dead waiter's is dropped);
    the head of a lane's queue takes the lock when it is free. An older harness copy that takes the arc lock directly is
    respected: a lock directory someone holds is never taken, except from a harness that is no longer running. `lane`:
    arc, rtx or auto (pick_lane). Waits up to `timeout` s (KRATOR_GPU_LOCK_TIMEOUT, default 8 h), printing its place and
    the holder. Yields the lane taken and sets KRATOR_GPU_LANE_HELD, which launch_chromium reads. Re-entrant: a child of
    the holder (KRATOR_GPU_LOCK_HELD in its environment) does not wait for its parent."""
    if os.environ.get("KRATOR_GPU_LOCK_HELD"):
        yield os.environ.get("KRATOR_GPU_LANE_HELD") or "arc"
        return
    timeout = float(os.environ.get("KRATOR_GPU_LOCK_TIMEOUT") or 28800) if timeout is None else timeout
    lane, lanes = _lanes_for(pick_lane(lane), cloud)
    me = {"pid": os.getpid(), "start": _proc_start(os.getpid()), "what": what[:200], "lanes": lanes}
    name = "%020d-%d.ticket" % (time.time_ns(), os.getpid())
    tickets = [os.path.join(lock_path(ln) + ".queue", name) for ln in lanes]

    def write_tickets():
        for t in tickets:
            os.makedirs(os.path.dirname(t), exist_ok=True)
            with open(t, "w", encoding="utf-8", newline="\n") as fh:
                json.dump(me, fh)
    write_tickets()
    t0, said, got = time.time(), 0, None
    try:
        while got is None:
            places = {}
            for ln in lanes:
                q = lane_queue(ln)
                if name not in q:          # dropped (this process was suspended past 15 minutes): queue again
                    write_tickets()
                    q = lane_queue(ln)
                places[ln] = q.index(name) if name in q else 0
                if places[ln]:
                    continue
                lk = lock_path(ln)
                try:
                    os.mkdir(lk)
                    got = ln
                    break
                except FileExistsError:
                    pass
                owner = _lock_owner(lk)
                m = re.match(r"harness pid=(\d+)", owner)
                if m and not pid_alive(int(m.group(1))):
                    print("harness: %s lock held by a dead harness (%s): taking it over" % (ln, owner), flush=True)
                    with contextlib.suppress(OSError):
                        os.remove(os.path.join(lk, "owner"))
                    with contextlib.suppress(OSError):
                        os.rmdir(lk)
                    with contextlib.suppress(FileExistsError):
                        os.mkdir(lk)
                        got = ln
                        break
            if got:
                break
            for t in tickets:
                with contextlib.suppress(OSError):
                    os.utime(t)
            waited = time.time() - t0
            if waited >= timeout:
                raise GpuLockTimeout("GPU lock (%s) still not free after %.0f s: %s. If a holder is dead (no process of it "
                                     "running), remove its directory; if it is your own shell, stop taking the lock in bash."
                                     % (lane, waited, "; ".join("%s held by %s, place %d" % (ln, _lock_owner(lock_path(ln)) or "(no owner file)",
                                                                                              places.get(ln, 0)) for ln in lanes)))
            if waited >= said:
                print("harness: waiting for the GPU (%s) %.0f s: %s" % (lane, waited, "; ".join(
                    "%s: %d ahead, held by %s%s" % (ln, places.get(ln, 0), _lock_owner(lock_path(ln)) or "(nobody)", _owner_note(lock_path(ln)))
                    for ln in lanes)), flush=True)
                said = waited + 120
            time.sleep(min(LOCK_POLL, 0.5) if 0 in places.values() else LOCK_POLL)   # the head of a queue races older copies, which poll every 5 s
    finally:
        for t in tickets:
            with contextlib.suppress(OSError):
                os.remove(t)
    lk = lock_path(got)
    with open(os.path.join(lk, "owner"), "w", encoding="utf-8", newline="\n") as fh:
        fh.write("harness pid=%d %s lane=%s %s\n" % (os.getpid(), time.strftime("%Y-%m-%dT%H:%M:%S"), got, what))
    os.environ["KRATOR_GPU_LOCK_HELD"] = "harness pid=%d" % os.getpid()
    os.environ["KRATOR_GPU_LANE_HELD"] = got
    try:
        yield got
    finally:
        os.environ.pop("KRATOR_GPU_LOCK_HELD", None)
        os.environ.pop("KRATOR_GPU_LANE_HELD", None)
        _release(lk)


def _tree(root):
    """`root` and every process under it, parents first: children by parent PID, and only those started after their
    parent (a process whose recorded parent is a reused PID is not one). Never by name or by a session id."""
    tab, out, todo = _proc_table(), [root], [root]
    while todo:
        q = todo.pop()
        sq = _proc_start(q)
        for pid, (pp, _n) in tab.items():
            if pp == q and pid not in out and pid != q:
                s = _proc_start(pid)
                if s is not None and sq is not None and s + 1 < sq:
                    continue
                out.append(pid)
                todo.append(pid)
    return out


def kill_tree(root):
    pids = _tree(root)
    for p in reversed(pids):
        with contextlib.suppress(Exception):
            if sys.platform == "win32":
                subprocess.run(["taskkill", "/F", "/PID", str(p)], capture_output=True, creationflags=0x08000000)
            else:
                os.kill(p, 9)
    return pids


def out_dirs(argv, cwd=None):
    """The output folders a command names (--out, --shots, --outdir): the watchdog counts a file written there as progress."""
    out = []
    for i, a in enumerate(argv[:-1]):
        if a in ("--out", "--shots", "--outdir", "--out-dir"):
            out.append(os.path.join(cwd or os.getcwd(), argv[i + 1]))
    return out


def _newest(dirs, cap=20000):
    best, n = 0, 0
    for d in dirs:
        for dp, dn, fn in os.walk(d):
            for f in fn:
                n += 1
                with contextlib.suppress(OSError):
                    best = max(best, os.path.getmtime(os.path.join(dp, f)))
                if n > cap:
                    return best
    return best


def run_watched(argv, stall_min=None, watch=(), env=None, cwd=None, feed=None):
    """Run `argv`, relaying its output, under the stall watchdog: when it writes nothing to stdout or stderr and no file
    in `watch` for `stall_min` minutes (KRATOR_GPU_STALL_MIN, default 25), kill its whole process tree (kill_tree),
    release any GPU lock it holds and return 124. While it progresses, touch the owner file of a lock it or this process
    holds once a minute: the 30-minute heartbeat (CLAUDE.md). `feed`: bytes written to its stdin, which then stays open
    until it ends (a cloud lane's SSH job stops when its stdin closes)."""
    stall = (STALL_MIN if stall_min is None else stall_min) * 60
    p = subprocess.Popen(argv, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env, cwd=cwd,
                         **({} if feed is None else {"stdin": subprocess.PIPE}))
    if feed is not None:
        with contextlib.suppress(OSError):
            p.stdin.write(feed)
            p.stdin.flush()
    last = [time.time()]

    def relay(src, dst):
        while True:
            b = src.read1(65536)
            if not b:
                return
            last[0] = time.time()
            with contextlib.suppress(Exception):
                dst.write(b)
                dst.flush()
    th = [threading.Thread(target=relay, args=(p.stdout, getattr(sys.stdout, "buffer", sys.stdout)), daemon=True),
          threading.Thread(target=relay, args=(p.stderr, getattr(sys.stderr, "buffer", sys.stderr)), daemon=True)]
    for t in th:
        t.start()
    seen, beat = _newest(watch), 0
    tick = max(0.5, min(15.0, stall / 4))
    while True:
        try:
            p.wait(timeout=tick)
            break
        except subprocess.TimeoutExpired:
            pass
        nw = _newest(watch)
        if nw > seen:
            seen, last[0] = nw, time.time()
        now = time.time()
        if now - last[0] > stall:
            pids = kill_tree(p.pid)
            with contextlib.suppress(subprocess.TimeoutExpired):
                p.wait(timeout=10)
            for lk in all_locks():
                _release(lk, p.pid)
            print("\nharness: STALLED: no output and no file written for %.0f min; killed the job's process tree (%s) and released "
                  "its GPU lock. Rerun it (a stall is the GPU hanging, not a failed check)." % (stall / 60, pids), flush=True)
            return 124
        if now - beat >= 60:
            beat = now
            for lk in all_locks():
                if re.match(r"harness pid=(%d|%d)\b" % (os.getpid(), p.pid), _lock_owner(lk)):
                    with contextlib.suppress(OSError):
                        os.utime(os.path.join(lk, "owner"))
    for t in th:
        t.join(5)
    if feed is not None:
        with contextlib.suppress(OSError):
            p.stdin.close()
    return p.returncode


def lock_main(argv):
    """python3 tools/harness.py lock [--lane arc|rtx|auto] [--timeout S] [--stall MIN] [--watch DIR] -- <command ...>
    Run a command under a GPU lane's lock (default arc: timing runs stay comparable; Godot's GPU runs take --lane rtx),
    first come first served, under the stall watchdog (run_watched; --stall 0 turns it off). The command sees the lane in
    KRATOR_GPU_LANE_HELD, and a harness launch in it picks that GPU."""
    timeout, lane, stall, watch = None, None, None, []
    while argv and argv[0] in ("--timeout", "--lane", "--stall", "--watch"):
        k, v, argv = argv[0], argv[1], argv[2:]
        if k == "--timeout":
            timeout = float(v)
        elif k == "--lane":
            lane = v
        elif k == "--stall":
            stall = float(v)
        else:
            watch.append(v)
    if argv[:1] == ["--"]:
        argv = argv[1:]
    if not argv:
        print(lock_main.__doc__)
        return 2
    try:
        with gpu_lock(timeout, what=" ".join(argv)[:120], lane=lane or os.environ.get("KRATOR_GPU_LANE") or "arc") as got:
            print("harness: lane %s (%s)" % (got, lock_path(got)), flush=True)
            if stall == 0:
                return subprocess.call(argv)
            return run_watched(argv, stall, watch + out_dirs(argv))
    except GpuLockTimeout as e:
        print("FAILED: " + str(e))
        return 3


def lanes_main(argv):
    """python3 tools/harness.py lanes: each lane's holder, its heartbeat and its queue; the cloud lanes when they are on."""
    cl = _cloud()
    cfg = cl.load_config()
    cloud = list(cfg["lanes"]) if cfg else []
    for ln in list(LANES) + cloud:
        lk = lock_path(ln)
        print("%s  %s\n  held by: %s%s" % (ln, lk, _lock_owner(lk) or ("(free)" if not os.path.isdir(lk) else "(no owner file)"), _owner_note(lk)))
        for n in lane_queue(ln):
            with contextlib.suppress(OSError, ValueError):
                with open(os.path.join(lk + ".queue", n), encoding="utf-8") as fh:
                    t = json.load(fh)
                print("  waiting: pid %s %s" % (t["pid"], t.get("what", "")))
    if not cfg:
        print("cloud lanes: off (tools/CLOUD-LANE.md)")
    for m in cl.machines() if cfg else []:
        ok, why = cl.reachable(m, fresh=True)
        print("cloud lanes %s: machine %s %s" % (", ".join(m["lanes"]), m["id"],
                                                 "answers" if ok else "DOES NOT ANSWER (%s): its lanes take no verifies" % why))
    return 0


def is_gpu():
    return os.environ.get("KRATOR_GL", "").lower() == "gpu"


async def launch_chromium(p, args=GL_ARGS):
    """$KRATOR_CHROME (or an older name in CHROME_ENV), else playwright's own build, else a pinned build under
    /opt/pw-browsers: a cloud container ships one that need not match the pip playwright's pin. The browser's
    processes are recorded by PID, and the orphans of dead harnesses are killed first."""
    reap_orphans()
    b = await _launch(p, args)
    _record_browsers()
    return b


def lane_args(args):
    """`args` plus the held lane's adapter switch (LANE_ARGS) when they launch on the real GPU (ANGLE). On a cloud lane
    (Linux, NVIDIA) the ANGLE backend is replaced by the one that renders there (CLOUD_LANE_ARGS: GL on EGL)."""
    held = os.environ.get("KRATOR_GPU_LANE_HELD") or "arc"
    if is_cloud_lane(held) and any(a.startswith("--use-angle") for a in args):
        return [a for a in args if not a.startswith(("--use-angle", "--use-gl"))] + CLOUD_LANE_ARGS
    extra = LANE_ARGS.get(held, [])
    if any(a.startswith("--use-angle") for a in args):
        return list(args) + [a for a in extra if a not in args]
    return list(args)


async def _launch(p, args):
    args = lane_args(args)
    for k in CHROME_ENV:
        if os.environ.get(k):
            return await p.chromium.launch(executable_path=os.environ[k], args=args)
    try:
        return await p.chromium.launch(args=args)
    except Exception as e:
        if "Executable doesn't exist" not in str(e):
            raise
        for c in ["/opt/pw-browsers/chromium"] + sorted(
                glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"), reverse=True):
            if os.path.exists(c):
                return await p.chromium.launch(executable_path=c, args=args)
        raise


def local_three(folder, here=None):
    """The pinned three.js r128 to serve in place of the CDN copy: the build's own (`here`, the verify.py's folder),
    the page folder's, else the repo's copy in kits/ancients (a build that keeps none still runs offline)."""
    cands = ([os.path.join(here, "three.min.js")] if here else []) + [os.path.join(folder, "three.min.js")]
    cands.append(os.path.join(ROOT, "kits", "ancients", "three.min.js"))
    return next((c for c in cands if os.path.exists(c)), cands[0])


def parse_views(spec, names=()):
    """--views. Names separated by '|' or ';' are taken exactly, so a name may hold commas. Separated by commas,
    consecutive pieces are joined back up whenever that spells an existing preset's name, longest first: so
    "Overview,Town types — row, stacked house, well, tower" is two views."""
    spec = (spec or "").strip()
    if not spec:
        return []
    if "|" in spec or ";" in spec:
        return [v.strip() for v in re.split(r"[|;]", spec) if v.strip()]
    names = set(names or ())
    toks, out, i = spec.split(","), [], 0
    while i < len(toks):
        j = next((j for j in range(len(toks), i + 1, -1) if ",".join(toks[i:j]).strip() in names), i + 1)
        v = ",".join(toks[i:j]).strip()
        if v:
            out.append(v)
        i = j
    return out


class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_GET(self):   # what the page loads goes into the verify cache's key (verify_wrap)
        with contextlib.suppress(Exception):
            f = self.translate_path(self.path)
            if os.path.isfile(f):
                _touched(f)
        return super().do_GET()


@contextlib.contextmanager
def serve(folder):
    """Serve `folder` over HTTP on a free port (not file://: a page sets crossorigin on its three.js script only off
    file:, and the three.js route depends on intercepting it). Yields the port."""
    httpd = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(_Quiet, directory=folder))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    try:
        yield httpd.server_address[1]
    finally:
        httpd.shutdown()
        httpd.server_close()


async def route_three(pg, folder, here=None):
    """Serve three.js from the repo instead of the CDN: offline, pinned to r128."""
    three = local_three(folder, here)
    if os.path.exists(three):
        _touched(three)
        await pg.route("**/three.min.js", lambda route: asyncio.ensure_future(
            route.fulfill(path=three, content_type="application/javascript")))


# Item 2c. r128 reports a shader that does not compile with console.error only, and the mesh does not draw: the page
# builds, the error panel stays clean and the surface is simply missing (crater-drylands lost its ground to a NaN in GLSL).
SHADER_ERR = re.compile(r"THREE\.WebGL(Program|Shader)|shader error|getShaderInfoLog|getProgramInfoLog|ERROR: \d+:\d+|"
                        r"WebGL: INVALID|GL_INVALID|CONTEXT_LOST|context lost", re.I)
SHADER_IGNORE = re.compile(r"GPU stall due to ReadPixels|Automatic fallback to software WebGL|loseContext: context lost", re.I)


GL_CALL_ERR = re.compile(r"WebGL: INVALID|GL_INVALID|CONTEXT_LOST|context lost", re.I)


def gl_errors(lines):
    """The shader and WebGL failures among console (type, text) pairs. A shader that fails is a console.error (r128:
    "THREE.WebGLProgram: shader error"); a program that links with a compiler warning (D3D's X3595 under ANGLE) is a
    console.warn of its info log and draws, so only the GL call errors count as warnings."""
    return [t for k, t in lines if not SHADER_IGNORE.search(t)
            and (k == "error" and SHADER_ERR.search(t) or GL_CALL_ERR.search(t))]
# Every image that fails to decode, attached or not (an LFS pointer packed as a data URL fails here, silently).
IMG_HOOK_JS = """(()=>{ window.__kimgErr=[]; const d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
 if(!d||!d.set) return; Object.defineProperty(HTMLImageElement.prototype,'src',{configurable:true,enumerable:d.enumerable,get:d.get,
 set(v){ if(!this.__kw){ this.__kw=1; this.addEventListener('error',()=>{ const s=String(this.src||'');
   window.__kimgErr.push(s.startsWith('data:')?s.slice(0,40)+'... ('+s.length+' chars)':s.slice(-120)); }); }
   return d.set.call(this,v); }}); })();"""


def watch_console(pg):
    """Collect console errors and warnings on pg.krator_console, from before the page loads, for the whole run."""
    if getattr(pg, "krator_console", None) is not None:
        return pg.krator_console
    pg.krator_console = []
    pg.on("console", lambda m: pg.krator_console.append((m.type, m.text)) if m.type in ("error", "warning") else None)
    pg.on("crash", page_crashed)
    return pg.krator_console


async def open_page(browser, html, port, size="1280x800", here=None, query="", root=None, init=(), ready_js=None, routes=()):
    """A new page on `html`, served on `port` from `root` (default: the page's folder; give the repo root for a page
    that loads siblings by relative path, as kits/ancients-interiors loads ../../catalog/), three.js routed, waiting
    until the world is built (`window._ready`) or the error panel fills. `init`: scripts (paths) run before the page's
    own (godot/tools/stage_hook.js, for KSTAGE); `routes`: (url pattern, handler) pairs set before it loads.
    Returns (page, page_errors, ready)."""
    folder = os.path.dirname(os.path.abspath(html))
    name = os.path.relpath(os.path.abspath(html), os.path.abspath(root or folder)).replace(os.sep, '/')
    W, H = [int(t) for t in size.split("x")]
    pg = await browser.new_page(viewport={"width": W, "height": H})
    pg.set_default_timeout(600000)
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    watch_console(pg)
    await pg.add_init_script(IMG_HOOK_JS)
    for f in init:
        with open(f, encoding='utf-8') as fh:
            await pg.add_init_script(fh.read())
    await route_three(pg, folder, here)
    for pat, fn in routes:
        await pg.route(pat, fn)
    await pg.goto(f"http://127.0.0.1:{port}/{name}{query}", timeout=LOAD_MS)
    ready = True
    try:
        await pg.wait_for_function(ready_js or READY_JS, timeout=580000)
    except Exception:
        ready = False
    return pg, errs, ready


# Pages too big to build whole under software GL: the query a smoke load opens them with (their own verify.py does the
# same). The catalog's contact sheet builds all 1674 pieces otherwise, past any sensible timeout.
SMOKE_QUERY = {'kits/catalog/dist/catalog.html': '?page=indoor'}


async def smoke(pages, settle_ms=2500):
    from playwright.async_api import async_playwright
    bad = 0
    async with async_playwright() as p:
        b = await launch_chromium(p)
        for html in pages:
            t = time.time()
            with serve(ROOT) as port:
                rel = os.path.relpath(os.path.abspath(html), ROOT).replace(os.sep, '/')
                pg, errs, ready = await open_page(b, html, port, root=ROOT, query=SMOKE_QUERY.get(rel, ''))
                await pg.wait_for_timeout(settle_ms)
                try:
                    st = await pg.evaluate(STATS_JS)
                except Exception as e:
                    st = {"errs": "page did not initialise: " + str(e).splitlines()[0], "calls": None, "tris": None}
                await pg.close()
            errs = errs + ["console: " + t for t in gl_errors(pg.krator_console)]
            dirty = bool(st["errs"] and st["errs"] != "(no #errs)") or bool(errs) or not ready
            bad += dirty
            print("%s  %-55s %5.0fs  calls %s  tris %s%s%s" % (
                "FAIL" if dirty else "ok  ", html, time.time() - t, st["calls"], st["tris"],
                "" if ready else "  NOT READY", ("  errs: " + (st["errs"] or "")[:200] + " " + "; ".join(errs[:3])[:300])
                if dirty else ""), flush=True)
        await b.close()
    print("%d pages, %d dirty" % (len(pages), bad))
    return 1 if bad else 0


# --------------------------------------------------------------------------
# verify_page: the universal asserts every verify.py runs (CORE-IMPROVEMENTS.md items 2c, 2d, 3c, 6, 10a, 16)
RATCHET = os.path.join(ROOT, "tools", "verify_ratchet.json")
# The opt-in checks of the 2026-11-11 survey (tools/checks_optin.json; tools/buildlib.py opted_in): a verify.py passes
# verify_page(..., checks=SURVEY) (a new build's template does), the build is listed in tools/checks_optin.json, or
# KRATOR_CHECKS=all. Off, `samplers` is a report and the eye check uses its rays only.
SURVEY = ("samplers", "drawn-ground")
HARD = ("gpu-renderer",)   # never ratcheted: a lane without the GPU is a mistake, not a page's fault (item 22)
SAMPLER_FAIL, SAMPLER_WARN = 16, 15   # item 27: ANGLE on the Arc fails a program AT 16 fragment samplers (ebadlands)
DRAWN_JS_FILE = os.path.join(ROOT, "core", "drawn", "10-core-drawn.js")
INSTANCE_CAP = 250000      # item 3c: one instanced item past this many is a runaway pass (918,541 cobra lilies)
EYE_NEAR = 1.0             # item 10a: a view nearer than this to a solid surface it faces
# The scene and camera of a page: its top-level `scene` and `camera` (a classic script's top-level const is visible to
# evaluate), else window.scene / _api.scene, else any window value that is one.
FIND_JS = """const __kfind=()=>{ let sc=null,cam=null;
 try{ if(typeof scene!=='undefined'&&scene&&scene.isScene) sc=scene; }catch(e){}
 try{ if(typeof camera!=='undefined'&&camera&&camera.isCamera) cam=camera; }catch(e){}
 const A=window._api||{}; sc=sc||(window.scene&&window.scene.isScene?window.scene:null)||(A.scene&&A.scene.isScene?A.scene:null);
 cam=cam||(window.camera&&window.camera.isCamera?window.camera:null)||(A.camera&&A.camera.isCamera?A.camera:null);
 if(!sc||!cam){ for(const k of Object.keys(window)){ let v; try{ v=window[k]; }catch(e){ continue; }
   if(!v||typeof v!=='object') continue; if(!sc&&v.isScene) sc=v; if(!cam&&v.isPerspectiveCamera) cam=v; } }
 return {sc,cam}; };"""
# Item 27: the samplers each LINKED program really has (getActiveUniform: what the GPU kept after #ifdef pruning and dead-code
# removal), not a count of declared maps; the worst first. `samplersOf` in biomes/throne guessed from the shader text and
# overcounted (ringisles).
SAMPLERS_JS = """()=>{ let R=null; try{ R=(typeof renderer!=='undefined'&&renderer)||window.renderer||(window._api&&window._api.renderer); }catch(e){}
 if(!R||!R.info||!R.info.programs||!R.getContext) return null; const gl=R.getContext();
 const S=new Set([0x8B5E,0x8B60,0x8B5F,0x8DC1,0x8B62,0x8DC4,0x8DC5,0x8DCA,0x8DCB,0x8DCC,0x8DCF,0x8DD2,0x8DD3,0x8DD4,0x8DD7]);
 const out=[]; for(const p of R.info.programs){ const g=p.program; if(!g||!gl.getProgramParameter(g,gl.LINK_STATUS)) continue;
  const n=gl.getProgramParameter(g,gl.ACTIVE_UNIFORMS); let k=0; const names=[];
  for(let i=0;i<n;i++){ const u=gl.getActiveUniform(g,i); if(u&&S.has(u.type)){ k+=u.size; names.push(u.name.replace(/\\[0\\]$/,'')); } }
  out.push({name:p.name||'program '+p.id, n:k, names:names.slice(0,20)}); }
 out.sort((a,b)=>b.n-a.n); return {programs:out.length, max:out.length?out[0].n:0, top:out.slice(0,5), units:gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)}; }"""
# Item 28: the eye against the ground as drawn (core/drawn, KDRAWN.h): the page's own KDRAWN sources when it registers them,
# else its ground meshes (userData.ground, or named ground / terrain), read triangle by triangle. The ray rule misses an eye
# under the ground when something solid lies below it (a seabed, a cave floor); this does not.
DRAWN_EYE_JS = "(src)=>{" + FIND_JS + """
 const {sc,cam}=__kfind(); if(!sc||!cam) return {skipped:'no scene or camera'};
 if(typeof KDRAWN==='undefined'){ (0,eval)(src); }
 const K=window.KDRAWN||KDRAWN; let srcs=K.sources, from='KDRAWN sources registered by the page';
 if(!srcs.length){ if(!window.__kdrawnAuto){ const a=[]; sc.updateMatrixWorld(true); sc.traverse(o=>{ if(o.isMesh&&!o.isInstancedMesh&&o.visible!==false&&((o.userData&&o.userData.ground)||/^(ground|terrain)/i.test(o.name||''))){ const s=K.fromObject(o); if(s){ s.name=o.name||'ground'; a.push(s); } } }); window.__kdrawnAuto=a; }
  srcs=window.__kdrawnAuto; from='ground meshes ('+srcs.map(s=>s.name).slice(0,4).join(', ')+')'; }
 if(!srcs.length) return {skipped:'no ground source: register KDRAWN.add(KDRAWN.grid(...)) or name the ground mesh ground'};
 cam.updateMatrixWorld(); const e=cam.matrixWorld.elements, x=e[12], y=e[13], z=e[14]; let h=null;
 for(const s of srcs){ const v=s.h(x,z); if(v!==null&&(h===null||v>h)) h=v; }
 return {from, h, eye:[+x.toFixed(2),+y.toFixed(2),+z.toFixed(2)], under:h!==null&&y<h}; }"""
SAMPLE_JS = "()=>{ try{ return {calls:renderer.info.render.calls, tris:renderer.info.render.triangles}; }catch(e){ return null; } }"
UNIVERSAL_JS = "(cap)=>{" + FIND_JS + """
 const {sc}=__kfind(); const A=window._api||null; const R={scene:!!sc};
 R.panel=document.getElementById('errs')?document.getElementById('errs').textContent:null;
 R.imgErr=(window.__kimgErr||[]).slice(0,8); R.imgErrN=(window.__kimgErr||[]).length;
 const bad=[]; let n=0;
 if(sc){ const seen=new Set();
  const chk=(t,where)=>{ if(!t||!t.isTexture||seen.has(t)) return; seen.add(t); n++;
   if(t.isDataTexture||t.isDataTexture2DArray||t.isDataTexture3D||t.isDepthTexture||t.isCompressedTexture||t.isVideoTexture) return;
   const ims=t.isCubeTexture?(t.image||[]):[t.image];
   if(t.isCubeTexture&&!ims.length){ bad.push(where+' (cube, no faces)'); return; }
   for(const im of ims){ if(!im){ bad.push(where+' (no image)'); return; }
    let w=im.width,h=im.height;
    if(typeof HTMLImageElement!=='undefined'&&im instanceof HTMLImageElement){ if(!im.complete){ bad.push(where+' (still loading)'); return; } w=im.naturalWidth; h=im.naturalHeight; }
    if(!(w>=2&&h>=2)){ bad.push(where+' '+w+'x'+h); return; } } };
  const scan=(m)=>{ for(const k in m){ let v; try{ v=m[k]; }catch(e){ continue; } if(v&&v.isTexture) chk(v,(m.name||m.type)+'.'+k); }
   if(m.uniforms) for(const k in m.uniforms){ const v=m.uniforms[k]&&m.uniforms[k].value;
    if(v&&v.isTexture) chk(v,(m.name||m.type)+'.uniforms.'+k); else if(Array.isArray(v)) v.forEach((x,i)=>{ if(x&&x.isTexture) chk(x,(m.name||m.type)+'.uniforms.'+k+'['+i+']'); }); } };
  sc.traverse(o=>{ const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]); for(const m of ms) scan(m); });
  if(sc.background&&sc.background.isTexture) chk(sc.background,'scene.background');
  if(sc.environment&&sc.environment.isTexture) chk(sc.environment,'scene.environment'); }
 R.tex={n, bad:bad.slice(0,8), badN:bad.length};
 R.nan=(A&&typeof A.nanSweep==='function')?(()=>{ try{ const s=A.nanSweep(); return {meshes:s.meshes, instances:s.instances,
   first:JSON.stringify((s.firstInstances||[]).concat(s.first||[])).slice(0,300)}; }catch(e){ return {error:String(e)}; } })():null;
 R.occ=(A&&typeof A.regOccupancy==='function')?(()=>{ try{ const o=A.regOccupancy(); const e=o.filter(x=>x.n===0);
   return {n:o.length, empty:e.length, names:e.slice(0,6).map(x=>x.name)}; }catch(e){ return {error:String(e)}; } })():null;
 R.ruins=(typeof KRUINS!=='undefined'&&typeof KRUINS.report==='function'&&KRUINS.watched&&KRUINS.watched.length)?(()=>{ try{ return {rep:KRUINS.report(), neg:KRUINS.selfTest()}; }catch(e){ return {error:String(e)}; } })():null;
 const over=[]; let src=null; const B=(typeof BIO!=='undefined')?BIO:(window.BIO||null);
 if(B&&typeof B.capReport==='function'){ src='BIO.capReport'; try{ for(const r of (B.capReport()||[])) over.push((r.kit?r.kit+'/':'')+(r.item||'?')+' '+r.count+' > '+r.cap+(r.why?' ('+r.why+')':' (no capWhy)')); }catch(e){ over.push('capReport threw: '+e); } }
 else if(sc){ src='scene scan, cap '+cap; sc.traverse(o=>{ if(o.isInstancedMesh&&o.count>cap&&!(o.userData&&o.userData.capOk))
   over.push((o.name||(o.userData&&(o.userData.item||o.userData.tag))||o.geometry.type)+' '+o.count); }); }
 R.cap={src, over:over.slice(0,8), overN:over.length};
 R.seat=(A&&typeof A.seatSweeps==='function')?(()=>{ try{ const S=A.seatSweeps(), o={}; for(const k of ['contact','clear','doors','stairs']){ const x=S[k]||{};
   o[k]={n:x.n, nFails:x.nFails||0, first:JSON.stringify((x.fails||[]).slice(0,2)).slice(0,160)}; } o.neg=!S.contact||S.contact.neg===true; return o; }catch(e){ return {error:String(e)}; } })():null;
 try{ R.sceneTris=(A&&A.totals&&A.totals.tris!=null)?A.totals.tris:null; }catch(e){ R.sceneTris=null; }
 return R; }"""
# Item 10a: from the eye, rays up, down and four ways level, against the solid meshes drawn (instances prefiltered by
# their bounds; materials made two-sided only for the duration of the call, so a ray sees the inside of a closed mesh).
# Fails when the eye is inside a closed mesh (four of six rays meet a back face first), under the drawn ground (the ray
# up meets the underside and the ray down meets nothing), inside foliage (five of six rays meet a cut-out within 2 m),
# or nearer than EYE_NEAR to a solid surface it looks at.
EYE_JS = "(opt)=>{" + FIND_JS + """
 const {sc,cam}=__kfind(); if(!sc||!cam||typeof THREE==='undefined') return {skipped:'no scene, camera or THREE reachable from the page'};
 sc.updateMatrixWorld(); cam.updateMatrixWorld();
 const eye=new THREE.Vector3().setFromMatrixPosition(cam.matrixWorld), fwd=new THREE.Vector3(); cam.getWorldDirection(fwd);
 const list=[]; const vis=o=>{ if(!o.visible) return; if(o.isMesh&&o.material&&o.geometry&&o.geometry.attributes&&o.geometry.attributes.position&&!o.isSkinnedMesh) list.push(o); for(const c of o.children) vis(c); }; vis(sc);
 const solid=m=>m&&m.visible!==false&&!m.transparent&&m.depthWrite!==false&&m.colorWrite!==false;
 const cut=m=>m&&m.alphaTest>0;
 const sides=new Map(); for(const o of list) for(const m of (Array.isArray(o.material)?o.material:[o.material])) if(m&&!sides.has(m)) sides.set(m,m.side);
 const rc=new THREE.Raycaster(), tmp=new THREE.Mesh(), im=new THREE.Matrix4(), nrm=new THREE.Vector3();
 const nameOf=o=>o.name||(o.userData&&(o.userData.item||o.userData.tag||o.userData.kind||o.userData.name))||(o.parent&&o.parent.name)||o.geometry.type;
 const matOf=h=>Array.isArray(h.object.material)?h.object.material[h.face?h.face.materialIndex:0]:h.object.material;
 function cast(dir,far){ rc.set(eye,dir); rc.near=0; rc.far=far; const hits=[];
  for(const o of list){ const ms=Array.isArray(o.material)?o.material:[o.material]; if(!ms.some(solid)) continue;
   if(o.isInstancedMesh){ const g=o.geometry; if(!g.boundingSphere) g.computeBoundingSphere(); const R0=g.boundingSphere.radius, c=g.boundingSphere.center;
    const a=o.instanceMatrix.array, e=o.matrixWorld.elements, ws=o.matrixWorld.getMaxScaleOnAxis();
    for(let i=0;i<o.count;i++){ const j=i*16;
     const lx=a[j]*c.x+a[j+4]*c.y+a[j+8]*c.z+a[j+12], ly=a[j+1]*c.x+a[j+5]*c.y+a[j+9]*c.z+a[j+13], lz=a[j+2]*c.x+a[j+6]*c.y+a[j+10]*c.z+a[j+14];
     const px=e[0]*lx+e[4]*ly+e[8]*lz+e[12]-eye.x, py=e[1]*lx+e[5]*ly+e[9]*lz+e[13]-eye.y, pz=e[2]*lx+e[6]*ly+e[10]*lz+e[14]-eye.z;
     const s=Math.max(Math.hypot(a[j],a[j+1],a[j+2]),Math.hypot(a[j+4],a[j+5],a[j+6]),Math.hypot(a[j+8],a[j+9],a[j+10]))*ws*R0;
     let t=px*dir.x+py*dir.y+pz*dir.z; if(t<-s||t>far+s) continue; t=Math.max(0,Math.min(far,t));
     const dx=px-dir.x*t, dy=py-dir.y*t, dz=pz-dir.z*t; if(dx*dx+dy*dy+dz*dz>s*s) continue;
     tmp.geometry=g; tmp.material=o.material; im.fromArray(a,j); tmp.matrixWorld.multiplyMatrices(o.matrixWorld,im);
     const k0=hits.length; tmp.raycast(rc,hits); for(let k=k0;k<hits.length;k++){ hits[k].object=o; hits[k].instanceId=i; hits[k].__m=tmp.matrixWorld.clone(); } }
   } else { const k0=hits.length; o.raycast(rc,hits); for(let k=k0;k<hits.length;k++) hits[k].__m=o.matrixWorld; } }
  const out=[]; for(const h of hits){ const m=matOf(h); if(!solid(m)) continue; let kind='two';
   if(h.face&&sides.get(m)!==THREE.DoubleSide){ nrm.copy(h.face.normal).transformDirection(h.__m); let back=nrm.dot(dir)>0; if(sides.get(m)===THREE.BackSide) back=!back; kind=back?'back':'front'; }
   out.push({d:h.distance, kind, cut:cut(m), name:nameOf(h.object)}); }
  out.sort((x,y)=>x.d-y.d); return out; }
 const R={eye:[+eye.x.toFixed(1),+eye.y.toFixed(1),+eye.z.toFixed(1)]};
 try{ for(const m of sides.keys()) m.side=THREE.DoubleSide;
  const axes=[[0,1,0],[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]].map(v=>new THREE.Vector3(v[0],v[1],v[2]));
  const first=axes.map((d,i)=>{ const hs=cast(d,i<2?2000:opt.far); return {solid:hs.find(h=>!h.cut)||null, any:hs[0]||null}; });
  const backs=first.filter(f=>f.solid&&f.solid.kind==='back'&&f.solid.d<=opt.far);
  if(backs.length>=4) R.inside=[...new Set(backs.map(f=>f.solid.name))].slice(0,4).join(', ');
  if(first[0].solid&&first[0].solid.kind==='back'&&!first[1].solid) R.under=first[0].solid.name+' ('+first[0].solid.d.toFixed(1)+' m above)';
  const leaf=first.filter(f=>f.any&&f.any.cut&&f.any.d<2);
  if(leaf.length>=5) R.foliage=[...new Set(leaf.map(f=>f.any.name))].slice(0,3).join(', ');
  const ahead=cast(fwd.normalize(),opt.near).find(h=>!h.cut&&h.kind!=='back');
  if(ahead) R.near=ahead.name+' at '+ahead.d.toFixed(2)+' m';
 } finally { for(const [m,s] of sides) m.side=s; }
 return R; }"""


# Item 15, nwbay's sweep: of each solid one-sided geometry drawn, the share of its faces pointing out from its centre, and the
# share pointing up. Few of either: inside-out, the faces you see are culled (a ground or a bowl faces up and is not listed).
# A report, not a failure: a hollow a camera stands in reads the same. Run from here, so it reaches every page with no page
# bytes moved.
WINDING_JS = "(opt)=>{" + FIND_JS + """
 const {sc}=__kfind(); if(!sc||typeof THREE==='undefined') return null; sc.updateMatrixWorld();
 const seen=new Set(), out=[]; let n=0; const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),e=new THREE.Vector3(),f=new THREE.Vector3(),m=new THREE.Vector3(),ctr=new THREE.Vector3();
 sc.traverse(o=>{ if(!o.isMesh||o.isSkinnedMesh||!o.geometry||!o.geometry.attributes||!o.geometry.attributes.position||o.visible===false) return;
  const M=o.material; if(Array.isArray(M)||!M||M.side!==THREE.FrontSide||M.transparent||M.alphaTest>0||M.depthWrite===false||M.colorWrite===false) return;
  const g=o.geometry, key=g.uuid+(o.matrixWorld.determinant()<0?'-':''); if(seen.has(key)) return; seen.add(key);
  const P=g.attributes.position, I=g.index, tris=(I?I.count:P.count)/3|0; if(tris<(opt.minTris||12)) return; n++;
  if(!g.boundingBox) g.computeBoundingBox(); g.boundingBox.getCenter(ctr);
  const st=Math.max(1,Math.floor(tris/(opt.sample||6000))); let t=0,up=0,outw=0; const flip=o.matrixWorld.determinant()<0?-1:1;
  for(let i=0;i<tris;i+=st){ const j=i*3, i0=I?I.getX(j):j, i1=I?I.getX(j+1):j+1, i2=I?I.getX(j+2):j+2;
   a.fromBufferAttribute(P,i0); b.fromBufferAttribute(P,i1); c.fromBufferAttribute(P,i2); e.subVectors(b,a); f.subVectors(c,a); e.cross(f); if(e.lengthSq()<1e-12) continue; e.normalize().multiplyScalar(flip);
   m.copy(a).add(b).add(c).multiplyScalar(1/3).sub(ctr); t++; if(e.dot(m)>0) outw++; if(e.y>.2) up++; }
  if(t&&outw/t<(opt.out||.25)&&up/t<(opt.up||.5)) out.push({name:o.name||(o.userData&&(o.userData.item||o.userData.tag))||(o.parent&&o.parent.name)||g.type,tris,out:+(outw/t).toFixed(2),up:+(up/t).toFixed(2)}); });
 return {n, suspects:out.sort((x,y)=>y.tris-x.tris).slice(0,12), suspectN:out.length}; }"""
# The item sheet (the card audit, 2026-10-27; swhighlands' ?sheet= lifted out of one build): every baked BIO item alone on a grid
# at full detail, from its own mesh (its attributes, its first instance's colour), scaled to fit the cell, on a plain floor in
# plain daylight, so a check looks at the plant and not at numbers. A far version that is an item of its own
# (BIO.impostorItem) gets its own cell. Its own scene and camera: the page's loop keeps running and draws them instead (it
# resets the world's camera and LOD every frame). Run it last.
SHEET_JS = "(opt)=>{" + FIND_JS + """
 const {sc}=__kfind(); if(!sc||typeof renderer==='undefined') return null;
 const seen={}; sc.traverse(o=>{ if(!o.isInstancedMesh||!/^biome:/.test(o.name||'')) return; const id=(o.userData.kit||'')+'/'+o.name.slice(6); if(!seen[id]||o.count>seen[id].count) seen[id]=o; });
 const items=Object.keys(seen).sort().map(id=>({id,src:seen[id]})), page=items.slice(opt.from,opt.from+opt.per);
 const cols=Math.ceil(Math.sqrt(opt.per*1.6)), rows=Math.ceil(opt.per/cols), S=10, labels=[], one=new THREE.Matrix4();
 const W=new THREE.Scene(); W.background=new THREE.Color(0x8fa3b5);
 if(sc.fog){ W.fog=sc.fog.clone(); W.fog.density=1e-7; W.fog.near=1e6; W.fog.far=1e7; }   /* thinned, not removed: core/atmos' fog chunk reads its uniforms */
 W.add(new THREE.HemisphereLight(0xffffff,0x6a6a60,1.1)); const sun=new THREE.DirectionalLight(0xffffff,1.6); sun.position.set(.6,1,.5); W.add(sun);
 const fl=new THREE.Mesh(new THREE.PlaneGeometry(cols*S+20,rows*S+20).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x8a8478})); fl.position.y=-.02; W.add(fl);
 const c0=new THREE.Color(); page.forEach((p,i)=>{ const g=p.src.geometry; if(!g.boundingBox) g.computeBoundingBox(); const bb=g.boundingBox, sz=new THREE.Vector3(); bb.getSize(sz); const big=Math.max(sz.x,sz.y,sz.z)||1, k=7/big;
  const im=new THREE.InstancedMesh(g,p.src.material,1); one.makeScale(k,k,k); one.setPosition(0,-bb.min.y*k,0); im.setMatrixAt(0,one); im.instanceMatrix.needsUpdate=true; im.frustumCulled=false;
  if(p.src.instanceColor){ p.src.getColorAt(0,c0); im.setColorAt(0,c0); }
  const col=i%cols, row=Math.floor(i/cols); im.position.set((col-(cols-1)/2)*S,0,(row-(rows-1)/2)*S); W.add(im);
  labels.push({x:im.position.x,z:im.position.z,t:p.id+'  '+big.toFixed(1)+' m  x'+p.src.count}); });
 const a=innerWidth/innerHeight, cam=new THREE.PerspectiveCamera(35,a,.5,2000), w=cols*S, h=rows*S; cam.position.set(0,Math.max(w/a,h)*1.75,h*.8); cam.lookAt(0,1.5,0); cam.updateMatrixWorld();
 window.__ksheetRender=window.__ksheetRender||renderer.render.bind(renderer); const r0=window.__ksheetRender; renderer.render=()=>r0(W,cam); r0(W,cam);
 let el=document.getElementById('__ksheetLabels'); if(!el){ el=document.createElement('div'); el.id='__ksheetLabels'; el.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:99999;font:10px sans-serif;color:#fff;text-shadow:0 0 2px #000'; document.body.appendChild(el);
  for(const c of [...document.body.children]) if(c!==el&&c.tagName!=='CANVAS'&&c.tagName!=='SCRIPT') c.style.display='none'; }
 el.innerHTML=''; const v=new THREE.Vector3(); for(const L of labels){ v.set(L.x,0,L.z+S*.42).project(cam); const d=document.createElement('div'); d.textContent=L.t; d.style.cssText='position:absolute;transform:translateX(-50%);white-space:nowrap;left:'+((v.x+1)*50)+'%;top:'+((1-v.y)*50)+'%'; el.appendChild(d); }
 return {total:items.length, shown:page.length}; }"""


def _repo_root(path):
    d = os.path.dirname(os.path.abspath(path))
    while True:
        if os.path.exists(os.path.join(d, "tools", "harness.py")):
            return d
        up = os.path.dirname(d)
        if up == d:
            return ROOT
        d = up


def _page_key(html):
    return os.path.relpath(os.path.abspath(html), _repo_root(html)).replace(os.sep, "/")


def is_lfs_pointer(path):
    try:
        with open(path, "rb") as fh:
            return fh.read(64).startswith(b"version https://git-lfs")
    except OSError:
        return False


def load_ratchet():
    try:
        with open(RATCHET, encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return {"pages": {}}


def load_budget(here, html):
    """The page's ceilings from <build>/BUDGETS.json (CORE-IMPROVEMENTS.md item 3d; core-tools writes and lints it):
    {"pages": {"<page file name>" or "*": {"tris": n, "calls": n, "bytes": n, "scene_tris": n, "why": ...}}}.
    tris and calls are the worst rendered over the views visited; scene_tris is the probe's whole-scene count."""
    f = os.path.join(here, "BUDGETS.json")
    if not os.path.isfile(f):
        return None, "no BUDGETS.json"
    with open(f, encoding="utf-8") as fh:
        d = json.load(fh)
    pages = d.get("pages", d)
    base = os.path.basename(html)
    for k in (base, os.path.splitext(base)[0], "*"):
        if isinstance(pages.get(k), dict):
            return pages[k], "BUDGETS.json[%s]" % k
    return None, "BUDGETS.json has no entry for %s" % base


def survey_checks(here, checks=None):
    """The survey's opt-in checks (SURVEY) this verify runs: `checks` (SURVEY, a name, or names), plus those the build is
    listed for in tools/checks_optin.json, plus KRATOR_CHECKS."""
    want = set()
    if checks:
        want.update([checks] if isinstance(checks, str) else checks)
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    try:
        import buildlib
        b = os.path.relpath(os.path.abspath(here or "."), ROOT).replace(os.sep, "/")
        want.update(c for c in SURVEY if buildlib.opted_in(c, None if b.startswith("..") else b))
    except Exception:
        pass
    return {c for c in want if c in SURVEY}


def page_sources(html):
    """Item 31: (state, reasons, rebuild command, source hash) for a built page, from its build's build-inputs.json:
    'current' when every input of the run that wrote it is unchanged, 'stale' when one moved (tools/check_stale.py's
    reading; docs and import-path listings do not count), 'unrecorded' when the page differs from what that run wrote.
    None when no manifest records the page."""
    import hashlib
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    try:
        import buildlib, check_stale
    except Exception:
        return None
    page = buildlib.rel(html)
    if not page:
        return None
    d = os.path.dirname(page)
    while d and not os.path.isfile(os.path.join(ROOT, d, buildlib.MANIFEST)):
        d = os.path.dirname(d)
    if not d:
        return None
    m = buildlib.load_manifest(d) or {}
    cmd = next((c for c, r in m.get("runs", {}).items() if page in r.get("outputs", {})), None)
    if cmd is None:
        return None
    run = m["runs"][cmd]
    src = hashlib.sha256(json.dumps(sorted((p, check_stale.h(p)) for p in run.get("inputs", {}))).encode("utf-8")).hexdigest()
    check_stale._hash.clear()
    for key, why, line in check_stale.check(d):
        if key.endswith(" " + cmd) or key.endswith(": STALE " + cmd) or key.endswith(": UNRECORDED " + cmd):
            if ": STALE " in key:
                return ("stale", [w.strip() for w in why], line, src)
            if ": UNRECORDED " in key and page in " ".join(why):
                return ("unrecorded", why, line, src)
    return ("current", [], None, src)


class Abort(Exception):
    """Raised inside `async with verify_page(...)` to stop the build's own checks early with an exit code (the page did
    not initialise): the universal asserts still run, and V.exit() returns the code."""

    def __init__(self, code=2):
        Exception.__init__(self, code)
        self.code = code


class VerifyPage:
    """What verify_page yields: the page, its page errors and the build's own fails list, and the views it visits."""

    def __init__(self, html, here, checks=None):
        self.html, self.here, self.key = os.path.abspath(html), here, _page_key(html)
        self.checks = survey_checks(here, checks)
        self.renderer = None
        self.page = self.browser = self.port = self.code = None
        self.errs, self.fails, self.ready = [], [], False
        self.samples, self.eyes, self.universal = [], [], []   # (view, calls, tris); (view, result); (name, ok, detail)
        self.winding = None

    async def sample(self, view):
        s = await self.page.evaluate(SAMPLE_JS)
        if s:
            self.samples.append((view, s["calls"], s["tris"]))
        return s

    async def eye(self, view):
        """The eye check (item 10a) at the camera as it is now, under the view's name; with the drawn-ground check
        (item 28) the eye is also measured against the ground as drawn (core/drawn)."""
        try:
            r = await self.page.evaluate(EYE_JS, {"near": EYE_NEAR, "far": 50})
        except Exception as e:
            r = {"skipped": "eye check threw: " + str(e).splitlines()[0][:200]}
        if "drawn-ground" in self.checks and not r.get("skipped"):
            try:
                with open(DRAWN_JS_FILE, encoding="utf-8") as fh:
                    d = await self.page.evaluate(DRAWN_EYE_JS, fh.read())
            except Exception as e:
                d = {"skipped": "drawn-ground threw: " + str(e).splitlines()[0][:200]}
            if d.get("under"):
                r["drawn"] = "under the drawn ground: eye y %.2f, ground %.2f (%s)" % (d["eye"][1], d["h"], d["from"])
            r["drawnNote"] = d.get("skipped") or ("drawn ground %.2f m below the eye (%s)" % (d["eye"][1] - d["h"], d["from"]) if d.get("h") is not None else "off the drawn ground")
        self.eyes.append((view, r))
        return r

    async def shot(self, path, view=None, **kw):
        """Screenshot, then the calls and triangles at this view and its eye check. Use it for every preset view."""
        await self.page.screenshot(path=path, **kw)
        name = view or os.path.splitext(os.path.basename(path))[0]
        await self.sample(name)
        await self.eye(name)

    async def sheet(self, out, per=24, settle_ms=1500):
        """The item sheet: <out>/items-NN.png, every BIO item alone on a grid, `per` to a picture. It takes the page over,
        so call it after the build's checks and views. Returns the pictures written ([] on a page with no BIO)."""
        os.makedirs(out, exist_ok=True)
        shots, i = [], 0
        while True:
            r = await self.page.evaluate(SHEET_JS, {"from": i, "per": per})
            if not r or not r["shown"]:
                return shots
            await self.page.wait_for_timeout(settle_ms)
            fn = os.path.join(out, "items-%02d.png" % (i // per))
            await self.page.screenshot(path=fn)
            shots.append(fn)
            i += per
            if i >= r["total"]:
                return shots

    async def run_universal(self):
        U, pg = self.universal, self.page
        U.append(("page-ready", self.ready, "ready" if self.ready else "never set window._ready (and the error panel stayed empty)"))
        try:
            await pg.wait_for_function("!window._texPending", timeout=120000)
        except Exception:
            U.append(("textures-decoded", False, "window._texPending still set after 120 s"))
        try:
            await self.sample("final")
            R = await pg.evaluate(UNIVERSAL_JS, INSTANCE_CAP)
        except Exception as e:
            U.append(("page-alive", False, "the page could not be read: " + str(e).splitlines()[0][:200]))
            R = None
        cons = getattr(pg, "krator_console", [])
        sh = gl_errors(cons)
        U.append(("shader-errors", not sh, "%d shader or WebGL errors in the console: %s" % (len(sh), " | ".join(t[:160] for t in sh[:3]))
                  if sh else "console clean of shader and WebGL errors (%d other errors or warnings)" % len(cons)))
        try:
            bad = await pg.evaluate("() => typeof KHOOK === 'undefined' ? null : KHOOK.checkPrograms().map(r => r.kind === 'anchor' ? r.layer + ': ' + r.anchor : 'program ' + r.name + ': ' + (r.programLog || r.fragmentLog || r.vertexLog).slice(0, 120))")
        except Exception:
            bad = None
        if bad is not None:
            U.append(("shader-programs", not bad, "; ".join(bad[:3])[:300] if bad else "every program linked, no anchor missed (KHOOK.checkPrograms)"))
        U.append(("page-errors", not self.errs, "; ".join(self.errs[:3])[:300] if self.errs else "none"))
        if R:
            panel = R["panel"]
            U.append(("error-panel", not panel, repr(panel[:300]) if panel else ("clean" if panel is not None else "(no #errs element)")))
            t = R["tex"]
            ok = not t["badN"] and not R["imgErrN"]
            U.append(("textures-decoded", ok, ("%d of %d textures not decoded: %s; %d images failed to decode: %s (an LFS pointer? "
                      "git lfs pull the build's tex/)" % (t["badN"], t["n"], ", ".join(t["bad"]), R["imgErrN"], ", ".join(R["imgErr"])))
                      if not ok else "%d textures, all decoded%s" % (t["n"], "" if R["scene"] else " (no scene reachable: images only)")))
            if R["nan"] is not None:
                n = R["nan"]
                U.append(("no-nan-geometry", not n.get("error") and not n.get("meshes") and not n.get("instances"),
                          n.get("error") or ("%s instanced items, %s meshes at NaN: %s" % (n["instances"], n["meshes"], n["first"])
                                             if n["meshes"] or n["instances"] else "clean")))
            if R["occ"] is not None:
                o = R["occ"]
                U.append(("registered-volumes-non-empty", not o.get("error") and not o.get("empty"),
                          o.get("error") or ("%d empty of %d: %s" % (o["empty"], o["n"], " | ".join(o["names"])) if o["empty"]
                                             else "%d volumes, none empty" % o["n"])))
            if R.get("ruins") is not None:   # core/ruins: every ruined structure the page watches (KRUINS.watch): nothing floats, every wreck lies on the ground
                ru = R["ruins"]
                if ru.get("error"):
                    U.append(("ruins", False, "the ruins check threw: " + ru["error"][:200]))
                else:
                    for r in ru["rep"]:
                        U.append(("ruins: " + r["name"], r["ok"], r["detail"][:400]))
                    U.append(("ruins: negative (core/ruins selfTest)", ru["neg"]["ok"], ru["neg"]["detail"]))
            if R["seat"] is not None:   # core-seat's sweeps (core/host/95b-host-seat.js, core/terrain/SEAT.md), when the page takes them
                st = R["seat"]
                bad = [k for k in ("contact", "clear", "doors", "stairs") if not st.get("error") and st[k]["nFails"]]
                U.append(("seat-sweeps", not st.get("error") and not bad and st.get("neg", False),
                          st.get("error") or ("; ".join("%s %s of %s: %s" % (k, st[k]["nFails"], st[k]["n"], st[k]["first"]) for k in bad)
                                              or ("the contact control did not read as floating" if not st["neg"]
                                                  else ", ".join("%s %s" % (k, st[k]["n"]) for k in ("contact", "clear", "doors", "stairs"))))))
            c = R["cap"]
            if c["src"]:
                U.append(("instance-cap", not c["overN"], ("%d items past the cap (%s): %s" % (c["overN"], c["src"], ", ".join(c["over"])))
                          if c["overN"] else "none past the cap (%s)" % c["src"]))
        try:
            w = await pg.evaluate(WINDING_JS, {})
        except Exception as e:
            w = {"error": str(e).splitlines()[0][:200]}
        self.winding = w
        if w is not None:
            U.append(("winding", True, w.get("error") or ("%d of %d geometries look inside-out (a report): %s" % (w["suspectN"], w["n"], ", ".join(
                "%s out %.2f up %.2f, %d tris" % (x["name"], x["out"], x["up"], x["tris"]) for x in w["suspects"][:6]))
                if w["suspectN"] else "%d geometries, none inside-out" % w["n"])))
        try:   # the one key map and the one walk mode (core/host/92k-host-keys.js), on a page that takes them
            kw = await pg.evaluate("() => (typeof KHOST === 'undefined' || !KHOST.keysCheck) ? null : "
                                   "{keys: KHOST.keysCheck(), walk: KHOST.walkCheck ? KHOST.walkCheck() : null}")
        except Exception as e:
            kw = {"error": str(e).splitlines()[0][:200]}
        if kw is not None:
            if kw.get("error"):
                U.append(("one-key-map", False, kw["error"]))
            else:
                k = kw["keys"]
                bad = k["words"] + k["clashes"]
                U.append(("one-key-map", not bad, "; ".join(bad)[:300] if bad else "standard controls %s in the key map's words, no clash"
                          % (", ".join(k["std"]) or "(none)")))
                w = kw.get("walk")
                if w is not None:
                    if not w.get("walk"):
                        U.append(("walk", True, "the ground only (the page hands the camera no KWALK)"))
                    else:
                        fl, bl = w.get("floor"), w.get("block")
                        ok = (fl is None or fl["ok"]) and (bl is None or bl["ok"])
                        U.append(("walk", ok, "KWALK %d floors, %d blocks; %s; %s" % (
                            w["floors"], w["blocks"],
                            ("stood on the floor at %s (feet %s)" % (fl["at"], fl["feet"])) if fl and fl["ok"] else
                            ("did NOT stand on the floor at %s (feet %s)" % (fl["at"], fl["feet"]) if fl else "no raised floor to stand on"),
                            ("a wall stopped the walker %s m on, %s m from its face" % (bl["moved"], bl["gap"])) if bl and bl["ok"] else
                            ("the walker was NOT stopped by %s: from %s to %s" % (bl["box"], bl["from"], bl["end"]) if bl else "no wall with clear ground before it"))))
        held = os.environ.get("KRATOR_GPU_LOCK_HELD")
        if is_gpu() or held:
            rn = self.renderer
            if not rn:
                try:
                    rn = await pg.evaluate(RENDERER_JS)
                except Exception as e:
                    rn = "unknown: " + str(e)[:80]
            ln = os.environ.get("KRATOR_GPU_LANE_HELD") or ""   # the vendor is checked only where a lane was taken
            if not is_gpu():   # item 22: seven sessions ran a "GPU verify" in SwiftShader under a lane lock
                U.append(("gpu-renderer", False, "a GPU lane lock is held (lane %s) but KRATOR_GL is not gpu, so this ran in %s: "
                          "rerun as KRATOR_GL=gpu python3 tools/harness.py lock --lane %s -- python3 verify.py ..." % (ln or "?", rn, ln or "auto")))
            else:
                U.append(("gpu-renderer", "swiftshader" not in rn.lower() and lane_vendor(ln) in rn.lower(), "lane %s: %s" % (ln or "-", rn)))
            _touched({"lane": ln, "renderer": rn})
        try:   # item 27
            sm = await pg.evaluate(SAMPLERS_JS)
        except Exception as e:
            sm = {"error": str(e).splitlines()[0][:200]}
        if sm is not None:
            on = "samplers" in self.checks
            if sm.get("error"):
                U.append(("samplers", not on, ("" if on else "report: ") + "could not read the programs: " + sm["error"]))
            else:
                top = "; ".join("%s %d (%s)" % (t["name"], t["n"], ", ".join(t["names"][:8])) for t in sm["top"][:3] if t["n"] >= SAMPLER_WARN) or (
                    "worst %s %d" % (sm["top"][0]["name"], sm["top"][0]["n"]) if sm["top"] else "no programs")
                msg = "%d linked programs, the most samplers %d (fail at %d, warn at %d; this GL allows %s): %s" % (
                    sm["programs"], sm["max"], SAMPLER_FAIL, SAMPLER_WARN, sm["units"], top)
                if not on:
                    U.append(("samplers", True, "report: " + msg + ' (opt in: tools/checks_optin.json "samplers")'))
                elif sm["max"] >= SAMPLER_FAIL:
                    U.append(("samplers", False, msg))
                else:
                    U.append(("samplers", True, ("WARN: " if sm["max"] >= SAMPLER_WARN else "") + msg))
        if not self.eyes:
            await self.eye("as loaded")
        for v, r in self.eyes:
            if r.get("skipped"):
                U.append(("eye:" + v, True, "skipped: " + r["skipped"]))
                continue
            bad = [k + " " + r[k] for k in ("inside", "under", "foliage", "near", "drawn") if r.get(k)]
            U.append(("eye:" + v, not bad, ("eye %s: %s" % (r["eye"], "; ".join(bad))) if bad else "clear at %s%s" % (
                r["eye"], "; " + r["drawnNote"] if r.get("drawnNote") else "")))
        b, src = load_budget(self.here, self.html)
        if b is None:
            U.append(("budget", True, src))
        else:
            over, got = [], []
            wc = max(self.samples, key=lambda s: s[1] or 0) if self.samples else None
            wt = max(self.samples, key=lambda s: s[2] or 0) if self.samples else None
            vals = {"calls": (wc[1], wc[0]) if wc else None, "tris": (wt[2], wt[0]) if wt else None,
                    "bytes": (os.path.getsize(self.html), "page"), "scene_tris": (R.get("sceneTris"), "probe") if R else None}
            for k in ("tris", "calls", "bytes", "scene_tris"):
                lim = b.get(k)
                if lim is None or not vals.get(k) or vals[k][0] is None:
                    continue
                got.append("%s %s/%s (%s)" % (k, vals[k][0], lim, vals[k][1]))
                if vals[k][0] > lim:
                    over.append("%s %s > %s at %s" % (k, vals[k][0], lim, vals[k][1]))
            U.append(("budget", not over, ("%s: " % src) + ("; ".join(over) if over else ", ".join(got) or "nothing measured")))

    def exit(self, code=None):
        """Print the universal asserts against the ratchet, fold them into the build's own fails, print the verdict and
        return the exit code (`code` overrides it, as the old `return 2` for a page that never initialised)."""
        rat = load_ratchet().get("pages", {}).get(self.key, {})
        print("\n--- universal asserts (tools/harness.py verify_page) ---")
        for name, ok, detail in self.universal:
            known = name not in HARD and (name in rat or (name.startswith("eye:") and "eye:*" in rat))
            tag = ("  REPORT" if detail.startswith("report: ") else "  WARN  " if detail.startswith("WARN: ") else "  PASS  ") if ok else (
                "  KNOWN " if known else "  FAIL  ")
            print(tag + name + " : " + detail)
            if not ok and not known:
                self.fails.append("universal " + name)
        fixed = [n for n in rat if n != "eye:*" and any(u[0] == n and u[1] for u in self.universal)]
        if fixed:
            print("  ratchet: %s passes now; take it out of tools/verify_ratchet.json (harness.py ratchet --write %s)" % (", ".join(fixed), self.key))
        code = self.code if code is None else code
        if self.fails:
            print("\nFAILED: " + "; ".join(self.fails))
            return code or 1
        st = page_sources(self.html)
        if st and st[0] == "stale":   # item 31: a pass on a page its sources have moved past proves nothing about src/
            print("\nOK, but a STALE PASS: %s was built before its sources moved (%s); rebuild: %s" % (self.key, "; ".join(st[1][:4]), st[2]))
        else:
            print("\nOK")
        return code or 0


@contextlib.asynccontextmanager
async def verify_page(html, here=None, size="1280x800", query="", root=None, init=(), settle_ms=2500, lock=True, args=None,
                      ready_js=None, routes=(), checks=None):
    """Open `html` for a verify and run the universal asserts after the build's own (see the module docstring).
    here: the build's folder (its BUDGETS.json, its three.min.js); root: the folder to serve (default the page's);
    ready_js: the page's own ready test when it is not one READY_JS knows (the error panel filling still counts);
    routes: what the page loads from elsewhere (open_page); checks: the survey's opt-in checks for this run (SURVEY, or
    names from it; tools/checks_optin.json adds the build's own)."""
    html = os.path.abspath(html)
    folder = os.path.dirname(html)
    if here is None:
        here = os.path.dirname(folder) if os.path.basename(folder) == "dist" else folder
    V = VerifyPage(html, here, checks)
    for f in (html, os.path.join(here, "BUDGETS.json"), RATCHET):
        if os.path.isfile(f):
            _touched(f)
    if is_lfs_pointer(html):
        V.universal.append(("lfs-pointer", False, "%s is a Git LFS pointer, not a page: git lfs pull --include=\"%s\"" % (V.key, V.key)))
        raise SystemExit(V.exit())
    from playwright.async_api import async_playwright
    lk = gpu_lock(what=V.key) if (lock and is_gpu()) else contextlib.nullcontext()
    try:
        lk.__enter__()
    except GpuLockTimeout as e:
        print("FAILED: " + str(e))
        raise SystemExit(3)
    try:
        async with async_playwright() as p:
            V.browser = await launch_chromium(p, args or GL_ARGS)
            try:   # item 22: the renderer first, so a log says at its head where the page ran
                p0 = await V.browser.new_page()
                V.renderer = await p0.evaluate(RENDERER_JS)
                await p0.close()
            except Exception as e:
                V.renderer = "unknown: " + str(e).splitlines()[0][:80]
            print("harness: renderer %s; lane %s; KRATOR_GL=%s%s" % (
                V.renderer, os.environ.get("KRATOR_GPU_LANE_HELD") or "none", "gpu" if is_gpu() else "swiftshader (software)",
                "; survey checks: " + ", ".join(sorted(V.checks)) if V.checks else ""), flush=True)
            try:
                with serve(root or folder) as port:
                    V.port = port
                    V.page, V.errs, V.ready = await open_page(V.browser, html, port, size=size, here=here, query=query, root=root, init=init, routes=routes,
                                                              ready_js=ready_js and "(%s) || (%s)" % (ready_js, READY_JS))
                    if not V.ready:
                        print("timed out waiting for the page to build")
                    await V.page.wait_for_timeout(settle_ms)
                    watch = asyncio.ensure_future(watch_renderer(V.page))
                    try:
                        yield V
                    except Abort as e:
                        V.code = e.code
                    finally:
                        try:
                            await V.run_universal()
                        except Exception as e:
                            V.universal.append(("universal-run", False, "the universal asserts threw: " + str(e).splitlines()[0][:300]))
                        watch.cancel()
            finally:
                with contextlib.suppress(Exception):
                    await V.browser.close()
        _forget_browsers()
    finally:
        lk.__exit__(None, None, None)


RATCHET_DOC = ("The universal verify asserts (tools/harness.py verify_page) each page failed when they were introduced. "
               "A listed assert only warns for that page; anything else fails. Take a page's entries out at its own "
               "rebuild turn, once fixed: python3 tools/harness.py ratchet --write <page>.")


async def sheet_main(argv):
    """python3 tools/harness.py sheet <page.html> [--out shots/sheet] [--per 24]: the item sheet on its own (VerifyPage.sheet)."""
    out = argv[argv.index("--out") + 1] if "--out" in argv else "shots/sheet"
    per = int(argv[argv.index("--per") + 1]) if "--per" in argv else 24
    page = next(a for i, a in enumerate(argv) if not a.startswith("--") and not (i and argv[i - 1] in ("--out", "--per")))
    async with verify_page(page, root=_repo_root(page)) as V:
        await V.eye("as loaded")   # the sheet takes the renderer
        shots = await V.sheet(out, per)
        print("\n".join(shots) or "no BIO items on this page")
    return V.exit()


async def ratchet_main(argv):
    """python3 tools/harness.py ratchet [--write] [--views auto] <page.html ...>
    Run the universal asserts alone on each page (the eye check at the page's opening view, and with --views auto at
    each of its #ui preset buttons, at most 16) and print what fails. --write records each page's failures in
    tools/verify_ratchet.json (replacing that page's entry: a page that passes leaves the ratchet)."""
    write = "--write" in argv
    auto = "--views" in argv and argv[argv.index("--views") + 1] == "auto"
    pages = [a for i, a in enumerate(argv) if not a.startswith("--") and not (i and argv[i - 1] == "--views")]
    worst = 0
    for html in pages:
        t0, key, V = time.time(), _page_key(html), None
        if is_lfs_pointer(html):
            print("skip  %-60s an LFS pointer here (not built)" % key, flush=True)
            continue
        try:
            async with verify_page(html, root=_repo_root(html), query=SMOKE_QUERY.get(key, "")) as V:
                if auto:
                    names = await V.page.evaluate("()=>[...document.querySelectorAll('#ui button')].map(b=>b.textContent.trim()).filter(Boolean)")
                    for v in names[:16]:
                        await V.page.evaluate("(v)=>{const b=[...document.querySelectorAll('#ui button')].find(b=>b.textContent.trim()===v); if(b) b.click();}", v)
                        await V.page.wait_for_timeout(900)
                        await V.sample(v)
                        await V.eye(v)
        except SystemExit:
            pass
        except Exception as e:
            print("FAIL  %-60s the run threw: %s" % (key, str(e).splitlines()[0][:200]), flush=True)
            worst = 1
            continue
        bad = {n: d[:200] for n, ok, d in (V.universal if V else []) if not ok}
        worst = max(worst, 1 if bad else 0)
        print("%s  %-60s %4.0fs  %s" % ("FAIL" if bad else "ok  ", key, time.time() - t0, "; ".join("%s: %s" % (k, v[:120]) for k, v in bad.items())), flush=True)
        if write:
            rat = load_ratchet()   # re-read: several runs may write in turn
            rat.setdefault("pages", {})
            if bad:
                # the views a page's own verify visits are not all its #ui buttons, so a view's failure is listed for the page
                eyes = sorted(k for k in bad if k.startswith("eye:"))
                rec = {k: v for k, v in bad.items() if not k.startswith("eye:")}
                if eyes:
                    rec["eye:*"] = "%d views: %s" % (len(eyes), "; ".join(e[4:] + " " + bad[e][:80] for e in eyes[:3]))[:200]
                rat["pages"][key] = {k: time.strftime("%Y-%m-%d") + ": " + v for k, v in sorted(rec.items())}
            else:
                rat["pages"].pop(key, None)
            rat["_doc"] = RATCHET_DOC
            with open(RATCHET, "w", encoding="utf-8", newline="\n") as fh:
                json.dump(rat, fh, indent=1, sort_keys=True)
                fh.write("\n")
    return worst


POSE_JS = """()=>{ if(window._walk&&typeof window._walk.pose==='function'&&window._walk.on) return Object.assign({mode:'walk'}, window._walk.pose());
 const c=(typeof camera!=='undefined')?camera:null; if(!c) return null;
 return {mode:'camera', x:c.position.x, y:c.position.y, z:c.position.z}; }"""


# A start on open ground: the nearest point to the origin (a spiral out to 120 m) where the walker, set down by its
# own setPose, stands on the terrain and nothing blocks the 6 m ahead of it at yaw 0 (forward is -z). Needs the
# walker's own API (window._walk.setPose and .blocked, as Girder's): a page's terrainH is not reachable from outside
# its script. null when the page has none, and the walk starts where it spawns.
AUTO_START_JS = """()=>{ const w=window._walk; if(!w||typeof w.blocked!=='function'||typeof w.setPose!=='function') return null;
 const stand=(x,z)=>{ const p=w.setPose(x,z,0); return p&&/terrain|ground/i.test(p.support||'')?p:null; };
 for(let r=0;r<=120;r+=4){ const n=Math.max(1,Math.round(r*1.5)); for(let a=0;a<n;a++){ const t=a/n*Math.PI*2, x=r*Math.cos(t), z=r*Math.sin(t);
  const p=stand(x,z); if(!p) continue; let ok=true;
  for(let d=0.5;d<=6&&ok;d+=0.5){ const q=stand(x,z-d); if(!q||Math.abs(q.feet-p.feet)>1.5||w.blocked(x,z-d,q.feet)) ok=false; }
  if(ok) return [x,z,0]; } } return null; }"""


def parse_route(spec):
    """'KeyW:30f,KeyD:600,KeyW+ShiftLeft:10f' -> [(['KeyW'], '30f'), (['KeyD'], 600), (['KeyW', 'ShiftLeft'], '10f')].
    A step is held for N rendered frames ('30f') or N milliseconds ('600'). Prefer frames: a walker moves per frame
    (dt capped at 0.1 s), and under software GL a frame can take seconds (Girder in walk mode: one frame in 4 s)."""
    out = []
    for part in (spec or '').split(','):
        part = part.strip()
        if part:
            keys, n = part.rsplit(':', 1)
            out.append((keys.split('+'), n if n.endswith('f') else int(n)))
    return out


FRAMES_JS = "()=>{ if(window._hxFrames==null){ window._hxFrames=0; (function f(){ window._hxFrames++; requestAnimationFrame(f); })(); } return window._hxFrames; }"


async def walk(pg, route, start=None, settle_ms=400):
    """The scripted walk (ROADMAP.md stage 0j, from OhMyGame's QA skill: "build success establishes compilation, not a
    playtest"): put the build in walk mode if it has one (`window._walk`, Girder and Verge), optionally at
    start = (x, z, yaw), then hold real keys through the browser, step by step. Returns (pose before, pose after,
    console errors). The caller judges the poses: frame times under software GL are uneven, so a check is a minimum
    distance in a direction and a ground test, not an exact end point."""
    cons = []
    pg.on('console', lambda m: cons.append(m.text) if m.type == 'error' else None)
    if start == 'auto':
        start = await pg.evaluate(AUTO_START_JS)
    await pg.evaluate("(s)=>{ const w=window._walk; if(w&&typeof w.toggle==='function'){ w.toggle(true); if(s) w.setPose(s[0], s[1], s[2]); } }",
                      list(start) if start else None)
    await pg.wait_for_timeout(settle_ms)
    await pg.mouse.click(5, 5)            # the page has focus for key events (a corner, away from the panels)
    before = await pg.evaluate(POSE_JS)
    await pg.evaluate(FRAMES_JS)
    for keys, n in route:
        for k in keys:
            await pg.keyboard.down(k)
        if isinstance(n, str):             # frames: hold until the page has drawn n more (at most 20 minutes)
            f0 = await pg.evaluate(FRAMES_JS)
            await pg.wait_for_function("(t)=>window._hxFrames>=t", arg=f0 + int(n[:-1]), timeout=1200000)
        else:
            await pg.wait_for_timeout(n)
        for k in reversed(keys):
            await pg.keyboard.up(k)
    await pg.wait_for_timeout(settle_ms)
    after = await pg.evaluate(POSE_JS)
    return before, after, cons


async def walk_main(argv):
    """python3 tools/harness.py walk <page> --route KeyW:20f [--start x,z,yaw] [--min 2] [--dir dx,dz] [--query ?..]
    Exit 1 unless the page loads clean, the walker moves at least --min metres (along --dir when given), stays above
    the ground it started on minus 3 m, and the console stays clean."""
    import argparse
    from playwright.async_api import async_playwright
    ap = argparse.ArgumentParser(prog='harness.py walk')
    ap.add_argument('html'); ap.add_argument('--route', required=True); ap.add_argument('--start')
    ap.add_argument('--min', type=float, default=2.0); ap.add_argument('--dir'); ap.add_argument('--query', default='')
    a = ap.parse_args(argv)
    start = 'auto' if a.start == 'auto' else ([float(v) for v in a.start.split(',')] if a.start else None)
    fails = []
    async with async_playwright() as p:
        b = await launch_chromium(p)
        with serve(ROOT) as port:
            pg, errs, ready = await open_page(b, a.html, port, root=ROOT, query=a.query)
            if not ready:
                fails.append('page never ready')
            before, after, cons = await walk(pg, parse_route(a.route), start)
            panel = await pg.evaluate("document.getElementById('errs')?document.getElementById('errs').textContent:''")
        await b.close()
    print('before', before); print('after ', after)
    if not before or not after:
        fails.append('no camera or walker to read')
    else:
        dx, dz = after['x'] - before['x'], after['z'] - before['z']
        if a.dir:
            ux, uz = [float(v) for v in a.dir.split(',')]
            n = (ux * ux + uz * uz) ** 0.5 or 1
            moved = (dx * ux + dz * uz) / n
        else:
            moved = (dx * dx + dz * dz) ** 0.5
        print('moved %.2f m%s' % (moved, ' along %s' % a.dir if a.dir else ''))
        if moved < a.min:
            fails.append('moved %.2f m, under %.2f' % (moved, a.min))
        if before.get('mode') == 'walk' and after.get('feet', 0) < before.get('feet', 0) - 3:
            fails.append('fell %.1f m' % (before['feet'] - after['feet']))
    if panel:
        fails.append('error panel: ' + panel[:200])
    if errs or cons:
        fails.append('console: ' + '; '.join((errs + cons)[:3])[:300])
    print('FAILED: ' + '; '.join(fails) if fails else 'OK')
    return 1 if fails else 0


EXPORT_FILES = [os.path.join(ROOT, 'core', 'export', f) for f in ('07-core-export.js', '09-core-export-adapters.js')]
STAGE_HOOK = os.path.join(ROOT, 'godot', 'tools', 'stage_hook.js')
STAGE_JS = os.path.join(ROOT, 'core', 'biome', '44-core-stage.js')
EXPORT_JS = """([opt, split]) => { const w = EXPORT.world(opt);
  const chk = EXPORT.check(w, { uid: (typeof KTAGS !== 'undefined' && KTAGS) ? KTAGS.uid : null, profile: opt.profile || null });
  if (!split) return { world: w, check: chk };
  const g = EXPORT.glb(w);
  return { world: g.json, glb: EXPORT.pack(g.glb).b64, glbStats: g.stats, check: chk }; }"""
PROFILE_JS = """([opt, profile]) => { const w = EXPORT.world(opt);
  const chk = EXPORT.check(w, { uid: (typeof KTAGS !== 'undefined' && KTAGS) ? KTAGS.uid : null, profile });
  const sections = {}; for (const k in w.sections) sections[k] = w.sections[k].status;
  return { sections, errors: w.errors, stats: w.stats, check: chk }; }"""


async def evaluate_big(pg, js, arg, chunk=4 << 20):
    """pg.evaluate(js, arg) for a result too big to come back in one piece: the page keeps the result as one JSON string
    and Python pulls it in slices of `chunk` characters. One evaluate returning a large object took over 25 minutes on
    nhighlands' 2.4 km export (2026-10-26) where the page's own work was seconds; the slices take seconds too."""
    n = await pg.evaluate("([js, arg]) => { const f = (0, eval)(js); window.__kbig = JSON.stringify(f(arg)); return window.__kbig.length; }", [js, arg])
    parts = []
    for i in range(0, n, chunk):
        parts.append(await pg.evaluate("([i, k]) => window.__kbig.slice(i, i + k)", [i, chunk]))
    await pg.evaluate("() => { window.__kbig = null; }")
    return json.loads(''.join(parts))


async def inject_export(pg):
    """core/export and the stage module into a page whose build does not list them (the Throne and its stations, Verge:
    core/export/README.md, "Not done"): their modules queued their parts in EXPORT_QUEUE, which 07 drains on load.
    Each file goes in only where the page lacks it. Returns the names injected (empty on a page that embeds both)."""
    injected = []
    if not await pg.evaluate("typeof EXPORT !== 'undefined'"):
        for f in EXPORT_FILES:
            await pg.add_script_tag(path=f)
        injected.append('core/export')
    if not await pg.evaluate("typeof KSTAGE !== 'undefined'"):   # a page without the stage module (Iziz)
        await pg.add_script_tag(path=STAGE_JS)
        injected.append('core/biome/44-core-stage.js')
    return injected


async def check_profile(pg, box, profile, opt=None, inject=False):
    """The export profile check a verify.py --assert runs (core/export/README.md, "Profiles"; ROADMAP.md section 11,
    item 1): EXPORT.world over the case's box, then EXPORT.check with the sections the case must fill. Waits for the
    library textures first, as `export` does. Returns (ok, lines): ok is false when a required section is missing or
    not what the profile asks (a stub, empty, sampled terrain), a section errored or a join failed; the lines say
    which, the first one the statuses. opt: more for EXPORT.world (sky: a small panorama keeps the check quick).
    inject: a page built without core/export (the Throne, whose station 1 is at its page-size ceiling) gets it injected
    here the way `export` injects it (inject_export), so the verify proves the route the export takes; without it such a
    page fails with the message below, as before."""
    if not inject and not await pg.evaluate("typeof EXPORT !== 'undefined'"):
        return False, ['core/export is not in the page (its build.py does not list 07-core-export.js)']
    try:
        await pg.wait_for_function("!window._texPending", timeout=180000)
    except Exception:
        return False, ['library textures still decoding after 180 s']
    injected = await inject_export(pg)
    o = dict(opt or {})
    o['box'] = list(box)
    o.setdefault('sky', 64)   # the stage's sky panorama: 64 px is enough for the check (256 was 37 s of Rift's verify under
                              # SwiftShader, EFFICIENCY.md); the export step itself keeps its own size
    r = await pg.evaluate(PROFILE_JS, [o, list(profile)])
    chk, lines = r['check'], []
    if injected:
        lines.append('injected: ' + ', '.join(injected) + ' (the page does not embed them; tools/harness.py export does the same)')
    lines.append('sections: ' + ', '.join('%s %s' % (k, v) for k, v in r['sections'].items()))
    lines.append('profile ' + ','.join(profile) + ': ' + json.dumps(chk['joins'].get('profile')) + '; stats ' + json.dumps(r['stats']))
    ok = chk['ok'] and not r['errors']
    for e in r['errors']:
        lines.append('section error: ' + json.dumps(e)[:300])
    for p in chk['problems'][:8]:
        lines.append('problem: ' + p)
    return ok, lines


def _pack_dir(name, page):
    """The build folder whose tex/pack.json is the library pack `name` (the page's own build first)."""
    d = os.path.dirname(os.path.abspath(page))
    if os.path.basename(d) == 'dist':
        d = os.path.dirname(d)
    cands = [d] + sorted(os.path.dirname(os.path.dirname(p)) for p in glob.glob(os.path.join(ROOT, '*', '*', 'tex', 'pack.json')))
    for c in cands:
        pj = os.path.join(c, 'tex', 'pack.json')
        if os.path.isfile(pj):
            with open(pj, encoding='utf-8') as f:
                if json.load(f).get('build') == name:
                    return os.path.join(c, 'tex')
    return None


async def export_main(argv):
    """python3 tools/harness.py export <page> --out godot/data/<case>/ [--box x0,z0,x1,z1] [--sections a,b] [--sky 1024]
                                             [--json] [--query ?..]
    The krator-world container (core/export/README.md) written headless: load the page, wait for it and its library
    textures, call EXPORT.world({box, sections}) and EXPORT.check, and write <out>/world.json (everything but the meshes)
    and <out>/world.glb (the meshes: EXT_mesh_gpu_instancing), or one world.json with the meshes inline (--json); the
    library packs the textures name by reference are copied to <out>/tex/; <out>/meta.json says where it came from.
    A page built without core/export gets it injected (its modules queued their parts). Exit 1 when the page is not
    ready or dirty, a section reported an error, or a join failed."""
    import argparse, shutil
    from playwright.async_api import async_playwright
    ap = argparse.ArgumentParser(prog='harness.py export')
    ap.add_argument('html'); ap.add_argument('--out', required=True); ap.add_argument('--box'); ap.add_argument('--sections')
    ap.add_argument('--sky', type=int); ap.add_argument('--json', action='store_true'); ap.add_argument('--query', default='')
    ap.add_argument('--profile', help='the sections the case must fill (core/export/README.md, "Profiles"): a,b,c=field,d?')
    a = ap.parse_args(argv)
    opt = {}
    if a.box:
        opt['box'] = [float(v) for v in a.box.split(',')]
    if a.sections:
        opt['sections'] = [s.strip() for s in a.sections.split(',') if s.strip()]
    if a.profile:
        opt['profile'] = [s.strip() for s in a.profile.split(',') if s.strip()]
    if a.sky is not None:
        opt['sky'] = a.sky
    out = os.path.abspath(a.out)
    os.makedirs(out, exist_ok=True)
    fails, t0 = [], time.time()
    async with async_playwright() as p:
        b = await launch_chromium(p)
        with serve(ROOT) as port:
            pg, errs, ready = await open_page(b, a.html, port, size='960x600', root=ROOT, query=a.query, init=[STAGE_HOOK])
            if not ready:
                fails.append('page never ready')
            print('%s: built in %.0f s (%d page errors)' % (a.html, time.time() - t0, len(errs)), flush=True)
            try:   # the library maps decode asynchronously (core/materials/record/25-matlib-host.js counts them)
                await pg.wait_for_function("!window._texPending", timeout=180000)
            except Exception:
                fails.append('library textures still decoding after 180 s')
            injected = await inject_export(pg)
            await pg.wait_for_timeout(1500)   # a few frames, so the stage hook has seen what the page renders
            t1 = time.time()
            res = await evaluate_big(pg, EXPORT_JS, [opt, not a.json])
            panel = await pg.evaluate("document.getElementById('errs')?document.getElementById('errs').textContent:''")
            await pg.close()
        await b.close()
    w = res['world']
    files = {}

    def dump(name, obj):
        with open(os.path.join(out, name), 'w', encoding='utf-8', newline='\n') as f:
            json.dump(obj, f, separators=(',', ':'))
        files[name] = os.path.getsize(os.path.join(out, name))
    dump('world.json', w)
    if not a.json:
        import base64
        with open(os.path.join(out, 'world.glb'), 'wb') as f:
            f.write(base64.b64decode(res['glb']))
        files['world.glb'] = os.path.getsize(os.path.join(out, 'world.glb'))
    packs = sorted({t['pack'] for t in w.get('textures', []) if t.get('from') == 'library'})
    if packs:
        dst = os.path.join(out, 'tex')
        shutil.rmtree(dst, ignore_errors=True)
        os.makedirs(dst)
        copied = {}
        for name in packs:
            src = _pack_dir(name, a.html)
            if not src:
                fails.append('no tex/pack.json for library pack %s' % name)
                continue
            with open(os.path.join(src, 'pack.json'), encoding='utf-8') as f:
                pj = json.load(f)
            used = {t['family'] for t in w['textures'] if t.get('pack') == name}
            rename = {}
            for fam in sorted(used):
                for fn in sorted(set(pj['families'].get(fam, {}).get('files', {}).values())):
                    to = fn
                    if fn in copied and copied[fn] != name:   # several packs share tex/: a name another pack took is
                        to = rename[fn] = name + '.' + fn     # copied as <pack>.<name>, and this pack's pack.json says so
                        if to in copied:
                            fails.append('library packs %s and %s both name %s' % (copied[to], name, to))
                    copied[to] = name
                    shutil.copyfile(os.path.join(src, fn), os.path.join(dst, to))
            pjo = os.path.join(dst, 'pack.json' if len(packs) == 1 else name + '.pack.json')
            if rename:
                for e in pj['families'].values():
                    e['files'] = {k: rename.get(v, v) for k, v in e.get('files', {}).items()}
                with open(pjo, 'w', encoding='utf-8', newline='\n') as f:
                    json.dump(pj, f, indent=1, sort_keys=True)
            else:
                shutil.copyfile(os.path.join(src, 'pack.json'), pjo)
        files['tex/'] = sum(os.path.getsize(os.path.join(dst, f)) for f in os.listdir(dst))
    chk = res['check']
    meta = {'case': os.path.basename(out.rstrip('/\\')), 'page': os.path.relpath(os.path.abspath(a.html), ROOT).replace(os.sep, '/'),
            'kind': 'world', 'route': 'tools/harness.py export (core/export)', 'box': opt.get('box'), 'sections': w['sections'],
            'files': files, 'injected': injected, 'stats': w['stats'], 'glb': res.get('glbStats'), 'check': chk['joins'],
            'page_errors': errs[:20], 'exported': time.strftime('%Y-%m-%d')}
    dump('meta.json', meta)
    if errs or panel:
        fails.append('page errors: ' + '; '.join(errs[:3])[:300] + (' panel: ' + panel[:200] if panel else ''))
    if w['errors']:
        fails.append('section errors: ' + json.dumps(w['errors'])[:400])
    if not chk['ok']:
        fails.append('joins: ' + '; '.join(chk['problems'][:5]))
    print('exported in %.0f s: %s' % (time.time() - t1, json.dumps(w['stats'])))
    print('sections: ' + ', '.join('%s %s' % (k, v['status']) for k, v in w['sections'].items()))
    print('joins: ' + json.dumps(chk['joins']))
    if a.profile:
        print('profile ' + ','.join(opt['profile']) + ': ' + ('met' if chk['joins'].get('profile', {}).get('met') == len(opt['profile']) else 'NOT MET'))
    if res.get('glbStats'):
        print('glb: ' + json.dumps(res['glbStats']))
    print('wrote ' + ', '.join('%s %.1f MB' % (k, v / 1e6) for k, v in files.items()) + ' in ' + os.path.relpath(out, ROOT).replace(os.sep, '/'))
    print('FAILED: ' + ' | '.join(fails) if fails else 'OK')
    return 1 if fails else 0


async def renderer_main():
    """Print the WebGL renderer the launcher gives a page (KRATOR_GL=gpu should name the GPU, not SwiftShader)."""
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await launch_chromium(p)
        pg = await b.new_page()
        print('KRATOR_GL=%s  renderer: %s' % (os.environ.get('KRATOR_GL', ''), await pg.evaluate(RENDERER_JS)))
        await b.close()
    return 0


# --------------------------------------------------------------------------
# The verify wrapper (2026-11-03): a verify.py that imports this harness at its top re-runs itself as a child under
# run_watched (the stall watchdog), and skips a run that already passed on the same bytes (the verify cache).
#
# The cache key: every file the run read (the pages it opened, every file the page server handed out, three.js, the
# build's BUDGETS.json, the ratchet), the verify.py and the .py and .json files beside it, the arguments, KRATOR_GL, and
# the part of this harness that can change a verify's result (result_fingerprint: the page server, the launcher and its
# flags, the checks, VERIFY_CACHE_VERSION; not the queue, locks, watchdog, cloud transport, lanes listing or this cache,
# owner 2026-11-11). It is taken from the parsed code, so comments and docstrings never move it; a top-level name not in
# NOT_IN_KEY counts, so new code is in the key unless someone says otherwise (tools/tests/test_cache_key.py). Bump
# VERIFY_CACHE_VERSION for a change outside this file that can change results (the pinned Chromium, for one).
# A pass is recorded per page and argument list in CACHE_DIR (%LOCALAPPDATA%/krator-verify-cache), with
# the lane and the GPU that produced it; a failure is never recorded. Only --assert runs are cached (a run without it
# is for looking), never a timing run; --no-cache (or KRATOR_VERIFY_CACHE=0) reruns; KRATOR_VERIFY_WRAP=0 runs the
# verify in place, with neither the watchdog nor the cache. A file the verify reads itself without the harness (a
# route handler's file) is outside the key: its verify.py beside it is in it.

VERIFY_CACHE_VERSION = 1
# Top-level names that cannot change what a verify finds: processes, the lanes' locks and queue, the watchdog, the cloud
# transport, the lanes listing and this cache and wrapper. Everything else in this file is in the key.
NOT_IN_KEY = frozenset((
    "TMP", "GPU_LOCK", "GPU_LOCK_RTX", "LANES", "CLOUD_LANE_NAMES", "TIMING_SCRIPTS", "STALL_MIN", "LOCK_POLL", "CACHE_DIR",
    "BROWSERS_DIR", "CHROME_NAMES", "_MY_BROWSERS",
    "lock_path", "all_locks", "_cloud", "_proc_table", "pid_alive", "_proc_start", "_kill_pids", "reap_orphans", "_descendants",
    "_record_browsers", "_forget_browsers", "GpuLockTimeout", "_lock_owner", "_release", "timing_run", "pick_lane", "_ticket_live",
    "lane_queue", "_owner_note", "_lanes_for", "gpu_lock", "_tree", "kill_tree", "out_dirs", "_newest", "run_watched", "lock_main",
    "lanes_main", "NOT_IN_KEY", "result_fingerprint", "_touched", "_sha_file", "_rel", "cache_args", "cache_entry_path", "cache_hash",
    "cache_lookup", "cache_record", "verify_wrap", "_verify_routed", "_cache_cloud_pass", "_run_child", "_imported_at_top_of_main",
    "_maybe_wrap_verify", "_watch_parent"))
_FINGERPRINT = {}


def result_fingerprint(src=None):
    """A hash of the result-relevant code of this harness (see the comment above): the module parsed, its docstrings,
    the `if __name__` block and every top-level definition or assignment named in NOT_IN_KEY dropped, the rest dumped
    without positions. `src`: another copy's text (the tests)."""
    import ast, hashlib
    if src is None and "self" in _FINGERPRINT:
        return _FINGERPRINT["self"]
    text = src
    if text is None:
        with open(os.path.abspath(__file__), encoding="utf-8") as fh:
            text = fh.read()
    keep = []
    for n in ast.parse(text).body:
        if isinstance(n, ast.Expr) and isinstance(n.value, ast.Constant) and isinstance(n.value.value, str):
            continue
        if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)) and n.name in NOT_IN_KEY:
            continue
        if isinstance(n, (ast.Assign, ast.AnnAssign)):
            names = [t.id for t in (n.targets if isinstance(n, ast.Assign) else [n.target]) if isinstance(t, ast.Name)]
            if names and all(x in NOT_IN_KEY for x in names):
                continue
        if isinstance(n, ast.Expr) and isinstance(n.value, ast.Call) and getattr(n.value.func, "id", "") in NOT_IN_KEY:
            continue
        if isinstance(n, ast.If) and "__name__" in ast.dump(n.test):
            continue
        keep.append(n)
    for n in keep:
        for d in ast.walk(n):
            body = getattr(d, "body", None)
            if isinstance(d, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)) and body and isinstance(body[0], ast.Expr) \
                    and isinstance(body[0].value, ast.Constant) and isinstance(body[0].value.value, str):
                d.body = body[1:] or [ast.Pass()]
    fp = hashlib.sha256(ast.dump(ast.Module(body=keep, type_ignores=[])).encode("utf-8")).hexdigest()
    if src is None:
        _FINGERPRINT["self"] = fp
    return fp


def _touched(rec):
    """In a wrapped verify, note a file the run read (a path) or the lane and renderer (a dict) for the parent."""
    f = os.environ.get("KRATOR_VERIFY_TOUCHED")
    if not f:
        return
    with contextlib.suppress(OSError):
        with open(f, "a", encoding="utf-8", newline="\n") as fh:
            fh.write(json.dumps(rec if isinstance(rec, dict) else {"f": os.path.abspath(rec)}) + "\n")


def _sha_file(path):
    import hashlib
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for b in iter(lambda: fh.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()


def _rel(path, root):
    path = os.path.abspath(path)
    r = os.path.relpath(path, root) if os.path.splitdrive(path)[0].lower() == os.path.splitdrive(root)[0].lower() else path
    return path if r.startswith("..") else r.replace(os.sep, "/")


def cache_args(args, root, cwd=None):
    """The arguments with every one that names an existing file or folder made repo-relative (the same run from another
    folder or worktree is the same run)."""
    cwd = cwd or os.getcwd()
    outs = {i + 1 for i, a in enumerate(args) if a in ("--out", "--shots", "--outdir", "--out-dir")}   # where shots go is not the check
    return ["*" if i in outs else _rel(os.path.join(cwd, a), root) if not a.startswith("-") and os.path.exists(os.path.join(cwd, a)) else a
            for i, a in enumerate(args)]


def cache_entry_path(script_rel, args_n):
    import hashlib
    page = next((os.path.basename(a) for a in args_n if a.endswith(".html")), os.path.basename(os.path.dirname(script_rel)) or "verify")
    d = hashlib.sha1(json.dumps([script_rel, args_n]).encode("utf-8")).hexdigest()[:16]
    return os.path.join(CACHE_DIR, "%s-%s.json" % (re.sub(r"[^\w.-]", "_", page), d))


def cache_hash(root, files, args_n):
    """The key over the files' current bytes, this harness's result fingerprint, the arguments and KRATOR_GL; None if a
    file is gone."""
    import hashlib
    h = hashlib.sha256()
    for rel in sorted(set(files)):
        p = rel if os.path.isabs(rel) else os.path.join(root, rel)
        if not os.path.isfile(p):
            return None
        h.update(("%s\0%s\n" % (rel, _sha_file(p))).encode("utf-8"))
    h.update(("harness:" + result_fingerprint()).encode("utf-8"))
    h.update(json.dumps([args_n, os.environ.get("KRATOR_GL", "").lower()]).encode("utf-8"))
    return h.hexdigest()


def cache_lookup(script, args, cwd=None):
    """The recorded pass for this verify and arguments when every file in it still has the bytes it had, else None."""
    root = _repo_root(script)
    args_n = cache_args(args, root, cwd)
    try:
        with open(cache_entry_path(_rel(script, root), args_n), encoding="utf-8") as fh:
            e = json.load(fh)
    except (OSError, ValueError):
        return None
    return e if e.get("hash") and e["hash"] == cache_hash(root, e.get("files", []), args_n) else None


def cache_record(script, args, touched_lines, cwd=None):
    """Record a pass: the files the run read (`touched_lines`, the child's notes) plus the verify.py and its neighbours."""
    root = _repo_root(script)
    args_n = cache_args(args, root, cwd)
    here = os.path.dirname(os.path.abspath(script))
    files, info = set(), {}
    for f in os.listdir(here):
        if f.endswith((".py", ".json")) and os.path.isfile(os.path.join(here, f)):
            files.add(_rel(os.path.join(here, f), root))
    for ln in touched_lines:
        with contextlib.suppress(ValueError):
            r = json.loads(ln)
            if "f" in r:
                if os.path.isfile(r["f"]):
                    files.add(_rel(r["f"], root))
            else:
                info.update(r)
    h = cache_hash(root, files, args_n)
    if not h:
        return None
    e = {"script": _rel(script, root), "args": args_n, "hash": h, "files": sorted(files), "passed": time.strftime("%Y-%m-%dT%H:%M:%S"),
         "lane": info.get("lane") or ("gpu (no lane)" if is_gpu() else "swiftshader"), "renderer": info.get("renderer", "")}
    page = next((a for a in args_n if a.endswith(".html")), None)   # item 31: the page's sources when it passed
    st = page_sources(os.path.join(root, page)) if page else None
    if st:
        e["sources"], e["sources_hash"] = st[0], st[3]
    path = cache_entry_path(e["script"], args_n)
    os.makedirs(CACHE_DIR, exist_ok=True)
    tmp = path + ".%d.tmp" % os.getpid()
    with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(e, fh, indent=1)
    os.replace(tmp, path)
    return e


def verify_wrap(script, args, no_cache=False):
    """Run verify.py `script` with `args` as a child under the watchdog, after the cache (see above). Returns its code."""
    cacheable = (not no_cache and "--assert" in args and not timing_run([script] + args)
                 and os.environ.get("KRATOR_VERIFY_CACHE", "1") != "0")
    if cacheable:
        e = cache_lookup(script, args)
        if e:
            page = next((a for a in e["args"] if a.endswith(".html")), None)
            st = page_sources(os.path.join(_repo_root(script), page)) if page else None
            stale = st and st[0] == "stale"   # item 31: the page's sources moved since it was built
            print("harness: cached %spass: %s %s passed %s on the same bytes (lane %s%s); nothing rerun, no shots written. "
                  "--no-cache to rerun." % ("STALE " if stale else "", e["script"], " ".join(e["args"]), e["passed"], e["lane"],
                                             ", " + e["renderer"] if e.get("renderer") else ""), flush=True)
            if stale:
                print("harness: STALE PASS: the page was built before its sources moved (%s); rebuild: %s" % ("; ".join(st[1][:4]), st[2]), flush=True)
            return 0
    if is_gpu() and not timing_run([script] + args) and _cloud().load_config():
        return _verify_routed(script, args, cacheable)
    return _run_child(script, args, cacheable)


def _verify_routed(script, args, cacheable):
    """The cloud lanes are on: this wrapper takes the lane (auto: the first of arc, rtx and the cloud lanes to free), then
    runs the verify here (the child finds the lock held) or on the machine (cloud_lane.run_job). A machine that does not
    answer drops out of auto; asked for by name it fails with exit 3."""
    cl = _cloud()
    page = next((a for a in args if a.endswith(".html")), "")
    what = _rel(os.path.join(os.getcwd(), page), _repo_root(script)) if page else _rel(script, _repo_root(script))
    for attempt in (0, 1):
        try:
            with gpu_lock(what=what, cloud=True) as got:
                if not is_cloud_lane(got):
                    return _run_child(script, args, cacheable)
                print("harness: on the %s lane (the cloud machine)" % got, flush=True)
                code, info = cl.run_job(got, script, args, cwd=os.getcwd(), run_watched=run_watched)
        except GpuLockTimeout as e:
            print("FAILED: " + str(e), flush=True)
            return 3
        except cl.CloudDown as e:
            if pick_lane() == "auto" and not attempt and cl.load_config():
                print("harness: %s; taking a local lane" % e, flush=True)
                continue
            print("FAILED: %s (tools/CLOUD-LANE.md)" % e, flush=True)
            return 3
        if code == 0 and cacheable and info:
            _cache_cloud_pass(script, args, info)
        return code
    return 3


def _cache_cloud_pass(script, args, info):
    """Record a cloud pass in the local verify cache, when every file the machine read has the same content here (git's
    object ids, so a CRLF checkout here matches the machine's LF one)."""
    root, hashes = info["root"], info.get("hashes", {})
    if not hashes:
        print("harness: not cached: the machine sent no hashes", flush=True)
        return
    if info.get("harness_key") != result_fingerprint():   # the machine ran a harness whose checks differ from this one's
        print("harness: not cached: the harness on the machine checks differently from this one (result fingerprint %s, here %s)"
              % ((info.get("harness_key") or "none")[:12], result_fingerprint()[:12]), flush=True)
        return
    here = _cloud().object_ids(root, [rel for rel in hashes if os.path.isfile(os.path.join(root, rel))])
    changed = [rel for rel, h in hashes.items() if here.get(rel) != h]
    if changed:
        print("harness: not cached: %d file(s) changed here during the cloud run (%s)" % (len(changed), ", ".join(changed[:3])), flush=True)
        return
    lines = [json.dumps({"f": os.path.join(root, rel)}) for rel in info.get("touched", [])]
    lines.append(json.dumps({"lane": info.get("lane"), "renderer": info.get("renderer", "")}))
    with contextlib.suppress(Exception):
        cache_record(script, args, lines)


def _run_child(script, args, cacheable):
    os.makedirs(BROWSERS_DIR, exist_ok=True)
    touched = os.path.join(BROWSERS_DIR, "touched-%d.jsonl" % os.getpid())
    with contextlib.suppress(OSError):
        os.remove(touched)
    env = dict(os.environ, KRATOR_VERIFY_CHILD="%d:%s" % (os.getpid(), _proc_start(os.getpid()) or ""), KRATOR_VERIFY_TOUCHED=touched, PYTHONUNBUFFERED="1", PYTHONIOENCODING="utf-8")
    try:
        code = run_watched([sys.executable, script] + args, watch=out_dirs(args), env=env)
        if code == 0 and cacheable:
            try:
                with open(touched, encoding="utf-8") as fh:
                    lines = fh.read().splitlines()
            except OSError:
                lines = []
            with contextlib.suppress(Exception):
                cache_record(script, args, lines)
        return code
    finally:
        with contextlib.suppress(OSError):
            os.remove(touched)


def _imported_at_top_of_main():
    f = sys._getframe(1)
    while f:
        if f.f_globals.get("__name__") == "__main__":
            return f.f_code.co_name == "<module>"
        f = f.f_back
    return False


def _maybe_wrap_verify():
    """A verify.py run as the main script, importing this harness at its top level, on the GPU or with --assert: hand it
    to verify_wrap and leave with its code. Never in the child itself, and never with KRATOR_VERIFY_WRAP=0."""
    if os.environ.get("KRATOR_VERIFY_CHILD"):
        _watch_parent(os.environ["KRATOR_VERIFY_CHILD"])
        return
    mf = getattr(sys.modules.get("__main__"), "__file__", None)
    if not mf or os.path.basename(mf) != "verify.py":
        return
    no_cache = "--no-cache" in sys.argv
    sys.argv[:] = [a for a in sys.argv if a != "--no-cache"]   # the verify's own argparse never sees it
    if os.environ.get("KRATOR_VERIFY_WRAP", "1") == "0" or not _imported_at_top_of_main():
        return
    args = sys.argv[1:]
    if not (is_gpu() or "--assert" in args):
        return
    sys.stdout.flush()
    sys.exit(verify_wrap(os.path.abspath(mf), args, no_cache))


def _watch_parent(spec):
    """In the wrapped child: when the wrapper is gone (stopped by PID), close this run's browsers, give back its GPU lock
    and leave, so no verify runs on unwatched holding a lane."""
    pid, _, st = spec.partition(":")

    def gone():
        if not pid_alive(int(pid)):
            return True
        now = _proc_start(int(pid))
        return bool(st and now and abs(now - float(st)) > 2)

    def loop():
        while not gone():
            time.sleep(5)
        with contextlib.suppress(Exception):   # the wrapper held our stdout: a print can fail on the broken pipe
            print("harness: the verify wrapper (pid %s) is gone: stopping this run" % pid, flush=True)
        with contextlib.suppress(Exception):
            _forget_browsers(kill=True)
        for lk in all_locks():
            _release(lk)
        os._exit(130)
    with contextlib.suppress(ValueError):
        int(pid)
        threading.Thread(target=loop, daemon=True).start()


_maybe_wrap_verify()


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "renderer":
        sys.exit(asyncio.run(renderer_main()))
    if len(sys.argv) > 2 and sys.argv[1] == "export":
        sys.exit(asyncio.run(export_main(sys.argv[2:])))
    if len(sys.argv) > 2 and sys.argv[1] == "smoke":
        sys.exit(asyncio.run(smoke(sys.argv[2:])))
    if len(sys.argv) > 2 and sys.argv[1] == "walk":
        sys.exit(asyncio.run(walk_main(sys.argv[2:])))
    if len(sys.argv) > 2 and sys.argv[1] == "sheet":
        sys.exit(asyncio.run(sheet_main(sys.argv[2:])))
    if len(sys.argv) > 2 and sys.argv[1] == "ratchet":
        sys.exit(asyncio.run(ratchet_main(sys.argv[2:])))
    if len(sys.argv) > 2 and sys.argv[1] == "lock":
        sys.exit(lock_main(sys.argv[2:]))
    if len(sys.argv) > 1 and sys.argv[1] == "lanes":
        sys.exit(lanes_main(sys.argv[2:]))
    if len(sys.argv) > 1 and sys.argv[1] == "cloud":
        sys.exit(_cloud().cli(sys.argv[2:]))
    print(__doc__)
