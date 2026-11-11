#!/usr/bin/env python3
"""The cloud GPU lanes (tools/CLOUD-LANE.md): verify.py runs on a rented machine's GPUs, one lane per GPU (vast0, vast1),
queued on this PC like the local lanes (tools/harness.py, gpu_lock).

Both sides are in this file. On this PC, harness.py imports it: the config, the reachability check, the job (a snapshot
commit pushed over SSH, the LFS files the verify needs, the run, the results). On the machine it is the runner: every
call sends this file's bytes ahead of its data and runs it there (`runner.py <cmd>`), so the machine never runs a stale
copy:

    ping                                  is the machine there; its GPUs and lanes (JSON)
    bootstrap                             one-time: Playwright and its Chromium, git-lfs, the bare repo
    prepare <lane> <commit>               lane users and GPU permissions, the lane's clone at <commit>; stdin: the LFS
                                          objects wanted (JSON); prints the ones the machine lacks
    receive                               stdin: a tar of LFS objects (named by oid), checked and stored
    run <lane> <cwd> <script> <stall> -- <args>   the verify, as the lane's user, streaming its output; ends when the
                                          SSH connection does
    results <lane>                        stdout: a tar of what the run wrote, and meta.json (what it read, hashes)

The config (`harness.py cloud on`, KRATOR_CLOUD_CONFIG, default %LOCALAPPDATA%/krator-cloud.json) is never in the repo.
"""
import contextlib, glob, hashlib, io, json, os, re, shlex, shutil, subprocess, sys, tarfile, tempfile, threading, time

CLOUD_RE = re.compile(r"^vast\d+$")   # the launch flags on a cloud lane are harness.CLOUD_LANE_ARGS
TMP =os.path.join(tempfile.gettempdir(), "claude")
STATUS_S = 120          # how long a reachability answer is kept
MAX_FILE = 100 << 20    # an untracked file bigger than this is not sent as a git blob
BOOT = ("import sys,os;n=int(sys.argv[1]);p=sys.argv[2];d=sys.stdin.buffer.read(n);"
        "os.makedirs(os.path.dirname(p),exist_ok=True);t=p+'.%d.tmp'%os.getpid();open(t,'wb').write(d);os.replace(t,p);"
        "sys.argv=[p]+sys.argv[3:];exec(compile(d,p,'exec'),{'__name__':'__main__','__file__':p})")


class CloudDown(RuntimeError):
    """The machine does not answer, or no cloud lane is configured."""


def is_cloud_lane(lane):
    return bool(lane and CLOUD_RE.match(lane))


def lane_index(lane):
    return int(lane[4:])


# --------------------------------------------------------------------------
# This PC: the config and the machine's state
def config_path():
    return os.environ.get("KRATOR_CLOUD_CONFIG") or os.path.join(os.environ.get("LOCALAPPDATA") or TMP, "krator-cloud.json")


MACHINE_KEYS = ("host", "port", "user", "key", "instance", "workspace", "python", "ssh", "git_remote", "lanes", "on")


def _read_config():
    """The config file as stored, in the machines shape (2026-11-11):
        {"lanes": [every lane of every machine that is on],
         "machines": {"<id>": {"host", "port", "user", "key", "instance", "lanes": [in GPU order], "on", ...}}}
    The older single-machine shape (host, port, ... at the top) reads as one machine named by its instance."""
    try:
        with open(config_path(), encoding="utf-8") as fh:
            raw = json.load(fh)
    except (OSError, ValueError):
        return None
    if "machines" not in raw:
        m = {k: raw[k] for k in MACHINE_KEYS if k in raw}
        m.setdefault("lanes", ["vast0", "vast1"])
        raw = {"machines": {str(raw.get("instance") or raw.get("host") or "machine"): m}}
    return raw


def _machine(mid, m):
    m = dict(m, id=mid)
    m.setdefault("workspace", "/workspace")
    m.setdefault("python", "/venv/main/bin/python")
    m.setdefault("user", "root")
    m.setdefault("on", True)
    m.setdefault("lanes", [])
    return m


def machines(any_state=False):
    """Each configured machine (switched on, unless any_state), with defaults filled in and its id."""
    raw = _read_config()
    out = [_machine(mid, m) for mid, m in sorted((raw or {}).get("machines", {}).items())]
    return out if any_state else [m for m in out if m["on"]]


def machine_of(lane):
    """The machine that serves `lane` (switched on), or None."""
    return next((m for m in machines() if lane in m["lanes"]), None)


def load_config(any_state=False):
    """{"lanes": every lane of the machines that are on, "machines": [...]} when any is on (any_state: when the file
    exists at all), else None."""
    ms = machines(any_state)
    if not ms:
        return None
    return {"lanes": [ln for m in ms if m["on"] or any_state for ln in m["lanes"]], "machines": ms}


def save_config(raw):
    """Write the machines shape, with the top-level `lanes` list (every lane of a machine that is on) that other
    tools read."""
    raw = {"lanes": [ln for _mid, m in sorted(raw["machines"].items()) if m.get("on", True) for ln in m.get("lanes", [])],
           "machines": raw["machines"]}
    path = config_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(raw, fh, indent=1)
    for mid in raw["machines"]:
        with contextlib.suppress(OSError):
            os.remove(_status_path(mid))


def _state_dir():
    return os.environ.get("KRATOR_CLOUD_STATE") or TMP


def _status_path(mid):
    return os.path.join(_state_dir(), "krator-cloud-status-%s.json" % re.sub(r"[^\w.-]", "_", str(mid)))


def ssh_argv(cfg):
    if cfg.get("ssh"):
        return list(cfg["ssh"])
    return ["ssh", "-i", os.path.expanduser(cfg["key"]), "-p", str(cfg["port"]), "-o", "BatchMode=yes", "-o", "ConnectTimeout=10",
            "-o", "ServerAliveInterval=30", "-o", "ServerAliveCountMax=6", "-o", "StrictHostKeyChecking=accept-new",
            "-o", "LogLevel=ERROR", "%s@%s" % (cfg["user"], cfg["host"])]


def _ws(cfg, *parts):
    return "/".join([cfg["workspace"].rstrip("/")] + list(parts))


def remote_argv(cfg, cmd, *args):
    """The SSH command that runs this file on the machine as `runner.py <cmd> <args>`, and the bytes to send first."""
    with open(os.path.abspath(__file__), "rb") as fh:
        src = fh.read()
    line = shlex.join([cfg["python"], "-c", BOOT, str(len(src)), _ws(cfg, "lanes", "runner.py"), cmd] + [str(a) for a in args])
    return ssh_argv(cfg) + [line], src


TRANSIENT = re.compile(rb"banner exchange|Connection timed out|Connection reset|Connection closed by|kex_exchange_identification", re.I)


def call(cfg, cmd, *args, data=b"", timeout=900, tries=4):
    """One runner call over SSH. vast.ai's SSH proxy now and then drops a connection before the shell starts ("timed
    out during banner exchange", 2026-11-11): such a failure (exit 255, nothing run) is retried, with a growing pause."""
    argv, src = remote_argv(cfg, cmd, *args)
    for i in range(tries):
        try:
            r = subprocess.run(argv, input=src + data, capture_output=True, timeout=timeout)
        except subprocess.TimeoutExpired:
            r = subprocess.CompletedProcess(argv, 255, b"", b"timed out after %d s" % timeout)
        if r.returncode != 255 or not TRANSIENT.search(r.stderr or b"") or i == tries - 1:
            return r
        time.sleep(5 * (i + 1))
    return r


def _err(r):
    return (r.stderr or b"").decode("utf-8", "replace").strip().splitlines()[-1:] or ["exit %d" % r.returncode]


def reachable(cfg, fresh=False):
    """(ok, why): machine `cfg` ran `ping` in the last STATUS_S seconds, or does now (fresh: ask now)."""
    p = _status_path(cfg["id"])
    if not fresh:
        with contextlib.suppress(OSError, ValueError):
            with open(p, encoding="utf-8") as fh:
                s = json.load(fh)
            if time.time() - s["t"] < (STATUS_S if s["ok"] else 30) and s.get("key") == _cfg_key(cfg):   # a failure is rechecked soon: the proxy flakes
                return s["ok"], s.get("why", "")
    r = call(cfg, "ping", timeout=40)
    ok = r.returncode == 0 and b'"ok": true' in r.stdout
    why = "" if ok else "; ".join(_err(r))
    os.makedirs(_state_dir(), exist_ok=True)
    with contextlib.suppress(OSError):
        tmp = p + ".%d.tmp" % os.getpid()
        with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
            json.dump({"t": time.time(), "ok": ok, "why": why, "key": _cfg_key(cfg)}, fh)
        os.replace(tmp, p)
    return ok, why


def mark_down(cfg, why):
    with contextlib.suppress(OSError):
        os.makedirs(_state_dir(), exist_ok=True)
        with open(_status_path(cfg["id"]), "w", encoding="utf-8", newline="\n") as fh:
            json.dump({"t": time.time(), "ok": False, "why": why, "key": _cfg_key(cfg)}, fh)


def _cfg_key(cfg):
    return hashlib.sha1(json.dumps([ssh_argv(cfg), cfg["workspace"]]).encode("utf-8")).hexdigest()[:12]


def lanes_up():
    """The cloud lanes a verify may take now: those of each machine that is on and answers. A machine that does not
    answer drops only its own lanes."""
    return [ln for m in machines() if reachable(m)[0] for ln in m["lanes"]]


def configured_lanes():
    return [ln for m in machines() for ln in m["lanes"]]


# --------------------------------------------------------------------------
# This PC: the job
def _git(root, *a, env=None, check=True, timeout=1800):
    r = subprocess.run(["git", "-C", root] + list(a), capture_output=True, env=env, timeout=timeout)
    if check and r.returncode:
        raise RuntimeError("git %s: %s" % (" ".join(a[:2]), r.stderr.decode("utf-8", "replace").strip()[-400:]))
    return r.stdout.decode("utf-8", "replace").strip()


def _posix_rel(path, root):
    return os.path.relpath(os.path.abspath(path), root).replace(os.sep, "/")


def snapshot(root, build_rel, log=print, tries=3):
    """_snapshot, retried: a session rebuilding its pages while this runs can remove a file under git's feet."""
    for i in range(tries):
        try:
            return _snapshot(root, build_rel, log)
        except RuntimeError as e:
            if i == tries - 1:
                raise
            log("harness: cloud: snapshot failed (%s); again in %d s" % (str(e)[:160], 10 * (i + 1)), flush=True)
            time.sleep(10 * (i + 1))


def _snapshot(root, build_rel, log=print):
    """A commit of the working tree as it is (tracked changes everywhere, new files in the build folder and in tools/, which
    the verify runs on), made on a copy of the index, on top of the last snapshot sent (refs/krator-cloud/base). Nothing
    of the session's own state moves."""
    gd = _git(root, "rev-parse", "--absolute-git-dir")
    os.makedirs(os.path.join(_state_dir(), "krator-cloud"), exist_ok=True)
    idx = os.path.join(_state_dir(), "krator-cloud", "index-%d" % os.getpid())
    shutil.copyfile(os.path.join(gd, "index"), idx)
    env = dict(os.environ, GIT_INDEX_FILE=idx)
    try:
        _git(root, "add", "-u", env=env)
        new = [f for f in _git(root, "ls-files", "-z", "-o", "--exclude-standard", "--", build_rel or ".", "tools").split("\0") if f]
        big = [f for f in new if os.path.getsize(os.path.join(root, f)) > MAX_FILE and "lfs" not in _git(root, "check-attr", "filter", "--", f)]
        if big:
            log("harness: cloud: not sending %d large untracked file(s): %s" % (len(big), ", ".join(big[:4])))
        new = [f for f in new if f not in big]
        for i in range(0, len(new), 200):
            _git(root, "add", "--", *new[i:i + 200], env=env)
        tree = _git(root, "write-tree", env=env)
    finally:
        with contextlib.suppress(OSError):
            os.remove(idx)
    base = _git(root, "rev-parse", "-q", "--verify", "refs/krator-cloud/base^{commit}", check=False)
    head = _git(root, "rev-parse", "--short", "HEAD", check=False)
    return _git(root, "commit-tree", tree, *(["-p", base] if base else []), "-m", "krator cloud lane: %s on %s" % (build_rel, head))


def git_remote(cfg):
    return cfg.get("git_remote") or "ssh://%s@%s:%s%s" % (cfg["user"], cfg["host"], cfg["port"], _ws(cfg, "krator.git"))


def push(cfg, root, commit, lane):
    env = dict(os.environ, GIT_LFS_SKIP_PUSH="1")   # the LFS files go separately (send_lfs): the machine has no LFS server
    if not cfg.get("git_remote"):
        env["GIT_SSH_COMMAND"] = " ".join(shlex.quote(a) for a in ssh_argv(cfg)[:-1]).replace("\\", "/")
    _git(root, "push", "-q", "--no-progress", git_remote(cfg), "+%s:refs/lanes/%s" % (commit, lane), env=env, timeout=7200)
    _git(root, "update-ref", "refs/krator-cloud/base", commit, check=False)


def lfs_files(root, commit, includes):
    """{path: oid} of the LFS files in `commit` under `includes` (paths or folders)."""
    out = {}
    for i in range(0, len(includes), 100):
        txt = _git(root, "lfs", "ls-files", "-l", "-I", ",".join(includes[i:i + 100]), commit, check=False)
        for ln in txt.splitlines():
            m = re.match(r"^([0-9a-f]{64}) [*-] (.+)$", ln.strip())
            if m:
                out[m.group(2)] = m.group(1)
    return out


def needs_path():
    return os.path.join(os.environ.get("KRATOR_VERIFY_CACHE_DIR") or os.path.join(os.environ.get("LOCALAPPDATA") or TMP, "krator-verify-cache"),
                        "cloud-needs.json")


def _load_needs():
    with contextlib.suppress(OSError, ValueError):
        with open(needs_path(), encoding="utf-8") as fh:
            return json.load(fh)
    return {}


def _save_needs(script_rel, paths):
    """Remember what this verify read. Best effort: two jobs ending together race on the file (Windows refuses the
    second rename, 2026-11-11), and a lost note only costs one retried run later."""
    os.makedirs(os.path.dirname(needs_path()), exist_ok=True)
    tmp = needs_path() + ".%d.tmp" % os.getpid()
    for i in range(5):
        try:
            n = _load_needs()
            n[script_rel] = sorted(set(n.get(script_rel, [])) | set(paths))
            with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
                json.dump(n, fh, indent=1)
            os.replace(tmp, needs_path())
            return
        except OSError:
            time.sleep(0.2 * (i + 1))
    with contextlib.suppress(OSError):
        os.remove(tmp)


def wanted(root, commit, build_rel, script_rel, page_rels):
    """{path: oid}: the LFS files of the build folder (other pages in a page's own folder left out), the pages named, and
    what this verify read last time."""
    learned = _load_needs().get(script_rel, [])
    files = lfs_files(root, commit, [build_rel or "."] + page_rels + learned)
    stems = {}
    for p in page_rels:
        d, b = p.rsplit("/", 1) if "/" in p else ("", p)
        stems.setdefault(d, []).append(b[:-5] if b.endswith(".html") else b)
    keep = {}
    for path, oid in files.items():
        d, b = path.rsplit("/", 1) if "/" in path else ("", path)
        if d in stems and path not in page_rels and path not in learned and not any(b == s or b.startswith(s + ".") for s in stems[d]):
            continue
        keep[path] = oid
    return keep


def _lfs_dir(root):
    return os.path.join(_git(root, "rev-parse", "--path-format=absolute", "--git-common-dir"), "lfs", "objects")


def send_lfs(cfg, root, oids, log=print):
    """Send the LFS objects the machine lacks from this PC's store (tar over SSH). Returns (sent, bytes, missing here)."""
    store, have, gone, size = _lfs_dir(root), [], [], 0
    for o in sorted(set(oids)):
        p = os.path.join(store, o[:2], o[2:4], o)
        if os.path.isfile(p):
            have.append((o, p))
            size += os.path.getsize(p)
        else:
            gone.append(o)
    if not have:
        return 0, 0, gone
    argv, src = remote_argv(cfg, "receive")
    errf = tempfile.TemporaryFile()
    pr = subprocess.Popen(argv, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=errf)
    try:
        pr.stdin.write(src)
        with tarfile.open(fileobj=pr.stdin, mode="w|") as tf:
            for o, p in have:
                tf.add(p, arcname=o)
        pr.stdin.close()
    except (BrokenPipeError, OSError):
        pass
    pr.wait()
    errf.seek(0)
    se = errf.read()
    errf.close()
    if pr.returncode:
        raise CloudDown("sending LFS objects: %s" % (se.decode("utf-8", "replace").strip()[-300:] or "exit %d" % pr.returncode))
    return len(have), size, gone


def _remote_args(args, cwd, root, cfg, lane):
    """The verify's arguments for the machine: an --out folder given as an absolute path here becomes the same folder
    relative to the run's folder, or (outside the repo) a folder of the lane's job. Returns (args, {job name: local dir})."""
    out, extra = list(args), {}
    for i, a in enumerate(args[:-1]):
        if a in ("--out", "--shots", "--outdir", "--out-dir") and os.path.isabs(args[i + 1]):
            local = os.path.abspath(args[i + 1])
            rel = os.path.relpath(local, root)
            if os.path.splitdrive(local)[0].lower() == os.path.splitdrive(root)[0].lower() and not rel.startswith(".."):
                out[i + 1] = os.path.relpath(local, cwd).replace(os.sep, "/")
            else:
                name = "out%d" % len(extra)
                extra[name] = local
                out[i + 1] = _ws(cfg, "lanes", lane + ".job", name)
    return out, extra


def run_job(lane, script, args, cwd=None, cfg=None, run_watched=None, stall_min=None, log=print):
    """Run verify.py `script` with `args` on cloud lane `lane` (its local lock already held). Returns (code, info): info has
    the files the run read (repo-relative), their hashes on the machine, the lane and the renderer, for the verify cache."""
    cfg = cfg or machine_of(lane)
    if not cfg:
        raise CloudDown("no machine that is on serves lane %s (%s)" % (lane, config_path()))
    gpu = cfg["lanes"].index(lane)
    ok, why = reachable(cfg, fresh=True)
    if not ok:
        raise CloudDown("machine %s does not answer (%s): stopped, or its SSH address changed? %s" % (cfg["id"], cfg.get("host", "?"), why))
    cwd = os.path.abspath(cwd or os.getcwd())
    script = os.path.abspath(script)
    root = os.path.abspath(_git(os.path.dirname(script), "rev-parse", "--show-toplevel"))
    script_rel, cwd_rel = _posix_rel(script, root), _posix_rel(cwd, root)
    build_rel = os.path.dirname(script_rel)
    rargs, extra = _remote_args(args, cwd, root, cfg, lane)
    pages = [_posix_rel(os.path.join(cwd, a), root) for a in args if a.endswith(".html") and os.path.isfile(os.path.join(cwd, a))]
    t0 = time.time()
    commit = snapshot(root, build_rel, log)
    push(cfg, root, commit, lane)
    log("harness: cloud %s: snapshot %s pushed (%.0f s)" % (lane, commit[:10], time.time() - t0), flush=True)
    retried = False
    while True:
        want = wanted(root, commit, build_rel, script_rel, pages)
        r = call(cfg, "prepare", lane, gpu, commit, data=json.dumps({"files": want}).encode("utf-8"), timeout=3600)
        if r.returncode:
            raise CloudDown("preparing %s: %s" % (lane, "; ".join(_err(r))))
        prep = json.loads(r.stdout.decode("utf-8").strip().splitlines()[-1])
        if prep["missing"]:
            t1 = time.time()
            n, size, gone = send_lfs(cfg, root, prep["missing"], log)
            log("harness: cloud %s: sent %d LFS file(s), %.1f MB (%.0f s)%s" % (lane, n, size / 1048576, time.time() - t1,
                "; not in this PC's LFS store either: %d" % len(gone) if gone else ""), flush=True)
        argv, src = remote_argv(cfg, "run", lane, gpu, cwd_rel, script_rel, stall_min or 25, "--", *rargs)
        log("harness: cloud %s: running %s %s" % (lane, script_rel, " ".join(rargs)), flush=True)
        code = run_watched(argv, stall_min, feed=src) if run_watched else subprocess.call(argv)
        if code == 255:
            mark_down(cfg, "the connection dropped during a run")
            log("harness: cloud %s: the connection to the machine dropped (ssh exit 255); rerun the verify" % lane, flush=True)
            return 75, None
        res = call(cfg, "results", lane, timeout=3600)
        if res.returncode:
            log("harness: cloud %s: could not fetch the results: %s" % (lane, "; ".join(_err(res))), flush=True)
            return (code or 75), None
        meta = _unpack_results(res.stdout, root, extra, log)
        if meta is None:
            return code or 75, None
        lfs_read = sorted(set(lfs_files(root, commit, meta.get("touched", []))) & set(meta.get("touched", []))) if meta.get("touched") else []
        if lfs_read:
            _save_needs(script_rel, lfs_read)
        if meta.get("pointers") and not retried:
            log("harness: cloud %s: the run read %d LFS file(s) the machine did not have (%s): sending them and running again"
                % (lane, len(meta["pointers"]), ", ".join(meta["pointers"][:3])), flush=True)
            _save_needs(script_rel, meta["pointers"])
            retried = True
            continue
        info = {"touched": meta.get("touched", []), "hashes": meta.get("hashes", {}), "lane": meta.get("lane") or lane,
                "renderer": meta.get("renderer", ""), "harness_key": meta.get("harness_key", ""), "root": root}
        log("harness: cloud %s: done in %.0f s, exit %d" % (lane, time.time() - t0, code), flush=True)
        return code, info


def _unpack_results(blob, root, extra, log):
    try:
        tf = tarfile.open(fileobj=io.BytesIO(blob), mode="r:")
    except tarfile.TarError as e:
        log("harness: cloud: the results are not a tar: %s" % e)
        return None
    meta, n = None, 0
    with tf:
        for m in tf.getmembers():
            if m.name == "meta.json":
                meta = json.loads(tf.extractfile(m).read().decode("utf-8"))
                continue
            if not m.isfile():
                continue
            kind, _, rel = m.name.partition("/")
            parts = rel.split("/")
            if not rel or ".." in parts or rel.startswith("/") or ":" in parts[0]:
                continue
            if kind == "files":
                dst = os.path.join(root, *parts)
            elif kind in extra:
                dst = os.path.join(extra[kind], *parts)
            else:
                continue
            data = tf.extractfile(m).read()
            if data.startswith(b"version https://git-lfs"):
                continue                      # never a pointer over a file here
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            with open(dst, "wb") as fh:
                fh.write(data)
            n += 1
    if meta is not None:
        meta["copied"] = n
    return meta


# --------------------------------------------------------------------------
# This PC: `harness.py cloud ...`
def cli(argv):
    """python3 tools/harness.py cloud on [--machine ID] --host H --port P --key K [--lanes vast2,vast3] [--user root] [--instance N]
       python3 tools/harness.py cloud off|status|setup [--machine ID]        (no --machine: every machine)
    A machine's lanes are listed in its GPUs' order (the first lane on GPU 0). --machine defaults to --instance."""
    cmd = argv[0] if argv else "status"
    opts, it = {}, iter(argv[1:])
    for k in it:
        if k.startswith("--"):
            opts[k[2:]] = next(it, "")
    raw = _read_config() or {"machines": {}}
    mid = opts.pop("machine", None) or opts.get("instance") or (next(iter(raw["machines"])) if len(raw["machines"]) == 1 else None)
    if cmd == "on":
        if not mid:
            print("cloud on: name the machine (--machine ID or --instance N)")
            return 2
        m = raw["machines"].setdefault(str(mid), {})
        for k, v in opts.items():
            if k in MACHINE_KEYS:
                m[k] = [x.strip() for x in v.split(",") if x.strip()] if k == "lanes" else v
        m["on"] = True
        m.setdefault("lanes", ["vast0", "vast1"])
        taken = {ln: o for o, om in raw["machines"].items() if o != str(mid) for ln in om.get("lanes", [])}
        clash = [ln for ln in m["lanes"] if ln in taken]
        bad = [ln for ln in m["lanes"] if not is_cloud_lane(ln)]
        miss = [k for k in ("host", "port", "key") if not m.get(k)]
        if clash or bad or (miss and not m.get("ssh")):
            print("cloud on: %s" % "; ".join(["lane %s is machine %s's" % (ln, taken[ln]) for ln in clash] + ["%s is not vastN" % ln for ln in bad]
                                              + (["give --%s" % ", --".join(miss)] if miss and not m.get("ssh") else [])))
            return 2
        if m.get("port"):
            m["port"] = int(m["port"])
        save_config(raw)
        print("machine %s on: lanes %s (%s)" % (mid, ", ".join(m["lanes"]), config_path()))
        return status(next(x for x in machines() if x["id"] == str(mid)))
    if cmd == "off":
        for k, m in raw["machines"].items():
            if mid is None or k == str(mid):
                m["on"] = False
        if raw["machines"]:
            save_config(raw)
        print("cloud machine(s) %s off: their lanes take no verifies" % (mid or ", ".join(raw["machines"]) or "-"))
        return 0
    ms = [m for m in machines() if mid is None or m["id"] == str(mid)]
    if not ms:
        print("cloud lanes off (no machine on%s: %s). tools/CLOUD-LANE.md" % (" named %s" % mid if mid else "", config_path()))
        return 1
    if cmd in ("status", "setup"):
        return max((status if cmd == "status" else setup)(m) for m in ms)
    print(cli.__doc__)
    return 2


def status(cfg):
    r = call(cfg, "ping", timeout=40)
    if r.returncode or b'"ok": true' not in r.stdout:
        mark_down(cfg, "; ".join(_err(r)))
        print("machine %s: NOT REACHABLE (%s); its lanes %s take no verifies. Stopped? Its SSH port can change after a restart: "
              "cloud on --machine %s --port N." % (cfg["id"], "; ".join(_err(r)), ", ".join(cfg["lanes"]), cfg["id"]))
        return 1
    reachable(cfg, fresh=True)
    s = json.loads(r.stdout.decode("utf-8").strip().splitlines()[-1])
    print("machine %s: reachable; %s" % (cfg["id"], "; ".join(s.get("gpus", [])) or "no GPU seen"))
    for ln in cfg["lanes"]:
        print("  %s: %s" % (ln, s.get("lanes", {}).get(ln, "no job yet")))
    if s.get("missing"):
        print("  not set up: %s (harness.py cloud setup)" % ", ".join(s["missing"]))
    return 0


def setup(cfg):
    """One-time: Playwright and its Chromium on the machine, then the repo seeded from this checkout's tree."""
    print("setup: installing on the machine (a few minutes the first time)...", flush=True)
    argv, src = remote_argv(cfg, "bootstrap", ",".join(cfg["lanes"]))
    p = subprocess.run(argv, input=src)
    if p.returncode:
        return p.returncode
    root = _git(os.path.dirname(os.path.abspath(__file__)), "rev-parse", "--show-toplevel")
    if not _git(root, "rev-parse", "-q", "--verify", "refs/krator-cloud/base", check=False):
        seed = _git(root, "commit-tree", "HEAD^{tree}", "-m", "krator cloud lane seed")
        print("setup: seeding the machine's repo with this tree (the first push sends about 1 GB)...", flush=True)
        push(cfg, root, seed, "seed")
    return status(cfg)


# --------------------------------------------------------------------------
# The machine: the runner (root on the vast.ai container; Linux)
def _sh(cmd, check=True, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, stdin=subprocess.DEVNULL, **kw)
    if check and r.returncode:
        raise RuntimeError("%s: %s" % (" ".join(cmd[:3]), (r.stderr or r.stdout).strip()[-300:]))
    return r.stdout


def _ws_here():
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _gpus(refresh=False):
    """[(index, bus id like 0000:01:00.0, minor, name)]: from lanes/gpus.json, written by the one nvidia-smi run that
    makes it. The driver's ModifyDeviceFiles=1 makes any root process that opens it (nvidia-smi included) reset every
    /dev/nvidiaN to root:root 0666, which undoes the lane pinning (2026-11-11, both machines), so the runner never runs
    nvidia-smi as root again once it has the list: bootstrap refreshes it, and _ensure_lane re-applies the permissions
    straight after."""
    cache = os.path.join(_ws_here(), "lanes", "gpus.json")
    if not refresh:
        with contextlib.suppress(OSError, ValueError, TypeError):
            with open(cache, encoding="utf-8") as fh:
                got = [tuple(g) for g in json.load(fh)]
            if got and all(os.path.exists("/dev/nvidia%d" % g[2]) for g in got):
                return got
    out = _gpus_smi()
    if out:
        with contextlib.suppress(OSError):
            os.makedirs(os.path.dirname(cache), exist_ok=True)
            with open(cache, "w", encoding="utf-8") as fh:
                json.dump(out, fh)
    return out


def _gpus_smi():
    out = []
    with contextlib.suppress(Exception):
        q = _sh(["nvidia-smi", "-q"])
        bus, minor = [], []
        for ln in q.splitlines():
            m = re.match(r"\s*Minor Number\s*:\s*(\d+)", ln)
            if m:
                minor.append(int(m.group(1)))
            m = re.match(r"\s*Bus Id\s*:\s*([0-9A-Fa-f]+:[0-9A-Fa-f]+:[0-9A-Fa-f]+\.[0-9A-Fa-f])", ln)
            if m:
                bus.append(m.group(1).lower()[-12:])
        names = _sh(["nvidia-smi", "--query-gpu=index,name", "--format=csv,noheader"]).strip().splitlines()
        for i, (b, mi) in enumerate(zip(bus, minor)):
            out.append((i, b, mi, names[i].split(",", 1)[1].strip() if i < len(names) else "?"))
    return out


def _lane_user(lane, gpu):
    """The lane's Linux user (kvastN, after the lane) in the group of the GPU it runs on (kgpuG, G its position on this
    machine): on a second machine vast2 runs as kvast2 in kgpu0."""
    return "kvast%d" % lane_index(lane), "kgpu%d" % int(gpu), 2100 + lane_index(lane)


def _ensure_lane(lane, gpu, run_as, gpus):
    """The lane's user and group, its GPU's device nodes (its group alone may open them), its folders and git config."""
    ws = _ws_here()
    user, group, uid = _lane_user(lane, gpu)
    lanes_dir = os.path.join(ws, "lanes")
    clone, tmp = os.path.join(lanes_dir, lane), os.path.join(lanes_dir, lane + ".tmp")
    if run_as:
        import grp, pwd
        if int(gpu) >= len(gpus):
            raise RuntimeError("lane %s on GPU %s: the machine has %d GPU(s)" % (lane, gpu, len(gpus)))
        for i, bus, minor, _n in gpus:     # every GPU's nodes, so no lane user can open another lane's GPU
            if not _group_exists("kgpu%d" % i):
                _sh(["groupadd", "-g", str(2100 + i), "kgpu%d" % i])
            g = grp.getgrnam("kgpu%d" % i).gr_gid
            nodes = ["/dev/nvidia%d" % minor] + [os.path.realpath("/dev/dri/by-path/pci-%s-%s" % (bus, k)) for k in ("card", "render")
                                                 if os.path.exists("/dev/dri/by-path/pci-%s-%s" % (bus, k))]
            for n in nodes:
                st = os.stat(n)
                if st.st_gid != g or st.st_mode & 0o777 != 0o660:
                    os.chown(n, 0, g)
                    os.chmod(n, 0o660)
        try:
            pwd.getpwnam(user)
        except KeyError:
            _sh(["useradd", "-m", "-u", str(uid), "-g", group, "-s", "/bin/bash", user])
        gid = grp.getgrnam(group).gr_gid
        home = os.path.expanduser("~" + user)
        mark = os.path.join(home, ".krator-lane-git")
        if not os.path.exists(mark):
            for c in (["config", "--global", "safe.directory", "*"], ["config", "--global", "lfs.storage", os.path.join(ws, "krator.git", "lfs")],
                      ["lfs", "install", "--skip-repo"]):
                _sh(["runuser", "-u", user, "--", "git"] + c)
            open(mark, "w").close()
    else:
        gid = None
    os.makedirs(lanes_dir, exist_ok=True)
    for d in (clone, tmp):
        if not os.path.isdir(d):
            os.makedirs(d)
            if run_as:
                os.chown(d, uid, gid)
    return clone, tmp, (user if run_as else None)


def _group_exists(name):
    import grp
    try:
        grp.getgrnam(name)
        return True
    except KeyError:
        return False


def _as(user, cmd):
    return (["runuser", "-u", user, "--"] + cmd) if user else cmd


def _store():
    return os.path.join(_ws_here(), "krator.git", "lfs", "objects")


def _run_as_flag():
    return os.environ.get("KRATOR_LANE_RUN_AS", "1") != "0" and hasattr(os, "geteuid") and os.geteuid() == 0


def r_ping(argv):
    lanes, held, missing = {}, {}, []
    for f in sorted(os.listdir(os.path.join(_ws_here(), "lanes"))) if os.path.isdir(os.path.join(_ws_here(), "lanes")) else []:
        if f.endswith(".job") and os.path.isfile(os.path.join(_ws_here(), "lanes", f, "meta.json")):
            with contextlib.suppress(Exception):
                with open(os.path.join(_ws_here(), "lanes", f, "meta.json"), encoding="utf-8") as fh:
                    m = json.load(fh)
                lanes[f[:-4]] = "last job %s exit %s at %s" % (m.get("script", "?"), m.get("code"), m.get("ended", "?"))
        if f.endswith(".flock"):
            held[f[:-6]] = _flock_busy(os.path.join(_ws_here(), "lanes", f))
    for k, v in held.items():
        if v:
            lanes[k] = "running a job; " + lanes.get(k, "")
    if not os.path.isdir(os.path.join(_ws_here(), "krator.git")):
        missing.append("the repo")
    if not (os.path.isdir("/opt/pw-browsers") or not _run_as_flag()):
        missing.append("Chromium")
    gpus = _gpus() if _run_as_flag() else []   # a lane machine (root); a stand-in machine's nvidia-smi is another job's GPU
    print(json.dumps({"ok": True, "gpus": ["%d %s (%s)" % (i, n, b) for i, b, _m, n in gpus], "lanes": lanes, "missing": missing}))
    return 0


def _flock_busy(path):
    try:
        import fcntl
    except ImportError:
        return False
    with open(path, "a") as fh:
        try:
            fcntl.flock(fh, fcntl.LOCK_EX | fcntl.LOCK_NB)
            fcntl.flock(fh, fcntl.LOCK_UN)
            return False
        except OSError:
            return True


def r_bootstrap(argv):
    lanes = [x for x in (argv[0] if argv else "").split(",") if x]   # this machine's lanes, in GPU order
    py, ws = sys.executable, _ws_here()
    env = dict(os.environ, PLAYWRIGHT_BROWSERS_PATH="/opt/pw-browsers")
    steps = [[py, "-m", "pip", "install", "-q", "--root-user-action=ignore", "playwright"],
             [py, "-m", "playwright", "install", "--with-deps", "chromium"]]
    for s in steps:
        print("bootstrap: " + " ".join(s[1:]), flush=True)
        if subprocess.call(s, env=env):
            return 1
    _sh(["chmod", "-R", "a+rX", "/opt/pw-browsers"])
    _sh(["git", "config", "--global", "safe.directory", "*"])
    if not os.path.isdir(os.path.join(ws, "krator.git")):
        _sh(["git", "init", "-q", "--bare", os.path.join(ws, "krator.git")])
    for d in ("objects", "tmp"):
        os.makedirs(os.path.join(ws, "krator.git", "lfs", d), exist_ok=True)
    os.chmod(os.path.join(ws, "krator.git", "lfs", "tmp"), 0o1777)
    os.makedirs(os.path.join(ws, "lanes"), exist_ok=True)
    gpus = _gpus(refresh=True)
    for i, ln in enumerate((lanes or ["vast%d" % g[0] for g in gpus])[:len(gpus)]):
        _ensure_lane(ln, i, _run_as_flag(), gpus)
    print("bootstrap: done; %d GPU(s)" % len(gpus), flush=True)
    return 0


def r_prepare(argv):
    """The lane's clone at <commit>, LFS files as pointers (the store has few of them); the files this job wants are
    smudged by `run` once their objects are here. A checkout that fails rebuilds the clone from scratch, once."""
    lane, gpu, commit = argv[0], int(argv[1]), argv[2]
    want = json.loads(sys.stdin.buffer.read().decode("utf-8") or "{}").get("files", {})
    run_as = _run_as_flag()
    clone, _tmp, user = _ensure_lane(lane, gpu, run_as, _gpus() if run_as else [])
    bare = os.path.join(_ws_here(), "krator.git")
    git = ["env", "GIT_LFS_SKIP_SMUDGE=1", "git"] if user else ["git"]   # runuser does not pass the environment on
    env = dict(os.environ, GIT_LFS_SKIP_SMUDGE="1")
    for attempt in (0, 1):
        try:
            if not os.path.isdir(os.path.join(clone, ".git")):
                _sh(_as(user, git + ["clone", "-q", "--shared", "-n", bare, clone]), env=env)
                if not run_as:
                    _sh(["git", "-C", clone, "config", "lfs.storage", os.path.join(bare, "lfs")])
            # git-lfs filter-process is killed by git on this machine (2026-11-10, git-lfs 3.4.1: "died of signal 15", no
            # error logged), so the clone checks LFS files out as their pointers and _smudge copies the objects in.
            for k, v in (("filter.lfs.process", ""), ("filter.lfs.smudge", ""), ("filter.lfs.clean", "git-lfs clean -- %f"),
                         ("filter.lfs.required", "false")):
                _sh(_as(user, ["git", "-C", clone, "config", k, v]))
            _sh(_as(user, git + ["-C", clone, "fetch", "-q", "--no-tags", "origin", "refs/lanes/%s" % lane]), env=env)
            _sh(_as(user, git + ["-C", clone, "-c", "advice.detachedHead=false", "checkout", "-q", "-f", "--detach", commit]), env=env)
            break
        except RuntimeError as e:
            if attempt:
                raise
            print("prepare: %s; rebuilding the lane's clone" % e, file=sys.stderr)
            for f in os.listdir(clone):
                p = os.path.join(clone, f)
                shutil.rmtree(p) if os.path.isdir(p) and not os.path.islink(p) else os.remove(p)
    with open(os.path.join(os.path.dirname(clone), lane + ".want.json"), "w", encoding="utf-8") as fh:
        json.dump(want, fh)
    store = _store()
    missing = sorted({o for o in want.values() if not os.path.isfile(os.path.join(store, o[:2], o[2:4], o))})
    print(json.dumps({"missing": missing}))
    return 0


def _smudge(clone, lane, user):
    """Write the wanted LFS files whose objects the store has over their pointers (what git-lfs's smudge does). The index
    is left alone: the next checkout -f puts the pointers back where the snapshot changed them."""
    try:
        with open(os.path.join(os.path.dirname(clone), lane + ".want.json"), encoding="utf-8") as fh:
            want = json.load(fh)
    except (OSError, ValueError):
        return
    store, done = _store(), []
    for path, o in sorted(want.items()):
        src, dst = os.path.join(store, o[:2], o[2:4], o), os.path.join(clone, *path.split("/"))
        if not os.path.isfile(src) or not os.path.isfile(dst):
            continue
        with open(dst, "rb") as fh:
            head = fh.read(200)
        if not head.startswith(b"version https://git-lfs") or o.encode("ascii") not in head:
            continue                       # already the content (or not this object's pointer)
        st = os.stat(dst)
        tmp = dst + ".krator-smudge"
        shutil.copyfile(src, tmp)
        with contextlib.suppress(AttributeError, OSError):
            os.chown(tmp, st.st_uid, st.st_gid)
        os.replace(tmp, dst)
        done.append(path)
    return done


def r_receive(argv):
    store = _store()
    tmpd = os.path.join(os.path.dirname(store), "tmp")
    os.makedirs(tmpd, exist_ok=True)
    n = 0
    with tarfile.open(fileobj=sys.stdin.buffer, mode="r|") as tf:
        for m in tf:
            if not m.isfile() or not re.match(r"^[0-9a-f]{64}$", m.name):
                continue
            t = os.path.join(tmpd, "%s.%d" % (m.name, os.getpid()))
            h = hashlib.sha256()
            src = tf.extractfile(m)
            with open(t, "wb") as fh:
                for b in iter(lambda: src.read(1 << 20), b""):
                    h.update(b)
                    fh.write(b)
            if h.hexdigest() != m.name:
                os.remove(t)
                print("receive: %s does not hash to its name: dropped" % m.name, file=sys.stderr)
                continue
            d = os.path.join(store, m.name[:2], m.name[2:4])
            os.makedirs(d, exist_ok=True)
            os.chmod(t, 0o644)
            os.replace(t, os.path.join(d, m.name))
            n += 1
    with contextlib.suppress(Exception):
        for dp, dn, _fn in os.walk(store):
            for x in dn:
                os.chmod(os.path.join(dp, x), 0o755)
    print(json.dumps({"stored": n}))
    return 0


def _content_oid(path):
    """An LFS file's oid: the sha256 of its content, or the oid its pointer names when it is one."""
    with open(path, "rb") as fh:
        head = fh.read(200)
        m = re.match(rb"version https://git-lfs\S*\noid sha256:([0-9a-f]{64})", head)
        if m:
            return m.group(1).decode("ascii")
        h = hashlib.sha256(head)
        for b in iter(lambda: fh.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()


def object_ids(root, rels, user=None):
    """{rel: an id of the file's content that this PC (CRLF checkouts, LFS filter on) and the machine (LF, LFS files
    copied in by _smudge) agree on}: an LFS file's oid, else git's object id with line endings normalized."""
    if not rels:
        return {}
    r = subprocess.run(_as(user, ["git", "-C", root, "check-attr", "-z", "--stdin", "filter"]), input="\0".join(rels).encode("utf-8"),
                       capture_output=True)
    f = r.stdout.decode("utf-8", "replace").split("\0") if r.returncode == 0 else []
    lfs = {f[i] for i in range(0, len(f) - 2, 3) if f[i + 2] == "lfs"}
    out = {rel: "lfs:" + _content_oid(os.path.join(root, rel)) for rel in rels if rel in lfs}
    rest = [rel for rel in rels if rel not in lfs]
    if rest:
        r = subprocess.run(_as(user, ["git", "-C", root, "hash-object", "--stdin-paths"]), input="\n".join(rest).encode("utf-8"),
                           capture_output=True)
        ids = r.stdout.decode("utf-8").split()
        if r.returncode or len(ids) != len(rest):
            return {}
        out.update(zip(rest, ids))
    return out


def _kill_group(p):
    if os.name == "nt":
        subprocess.run(["taskkill", "/F", "/T", "/PID", str(p.pid)], capture_output=True)
    else:
        import signal
        with contextlib.suppress(OSError):
            os.killpg(p.pid, signal.SIGKILL)
    with contextlib.suppress(Exception):
        p.wait(10)


def r_run(argv):
    lane, gpu, cwd_rel, script_rel, stall = argv[0], int(argv[1]), argv[2], argv[3], float(argv[4])
    args = argv[6:] if argv[5:6] == ["--"] else argv[5:]
    run_as = _run_as_flag()
    clone, tmp, user = _ensure_lane(lane, gpu, run_as, _gpus() if run_as else [])
    lanes_dir = os.path.dirname(clone)
    lockf = open(os.path.join(lanes_dir, lane + ".flock"), "a")
    with contextlib.suppress(ImportError):
        import fcntl
        said = 0
        t0 = time.time()
        while True:
            try:
                fcntl.flock(lockf, fcntl.LOCK_EX | fcntl.LOCK_NB)
                break
            except OSError:
                if time.time() - t0 >= said:
                    print("harness: cloud %s: the machine's lane lock is busy (another PC?): waiting" % lane, flush=True)
                    said += 120
                time.sleep(2)
    _smudge(clone, lane, user)
    job =os.path.join(lanes_dir, lane + ".job")
    shutil.rmtree(job, ignore_errors=True)
    os.makedirs(job)
    if user:
        _sh(["chown", "-R", "%s:%s" % (user, _lane_user(lane, gpu)[1]), job, tmp])
    touched = os.path.join(job, "touched.jsonl")
    nodes = sorted(glob.glob("/opt/nvm/versions/node/*/bin"))   # the vast base image's node (nvm), off the non-login PATH; some verifies run node
    env = {"HOME": os.path.expanduser("~" + user) if user else os.environ.get("HOME", ""),
           "PATH": os.pathsep.join([os.path.dirname(sys.executable)] + nodes[-1:] + [os.environ.get("PATH", "")]),
           "PLAYWRIGHT_BROWSERS_PATH": os.environ.get("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers"), "TMPDIR": tmp, "KRATOR_GL": "gpu",
           "KRATOR_GPU_LOCK_HELD": "cloud lane %s" % lane, "KRATOR_GPU_LANE_HELD": lane, "KRATOR_VERIFY_WRAP": "0",
           "KRATOR_VERIFY_TOUCHED": touched, "PYTHONUNBUFFERED": "1", "PYTHONIOENCODING": "utf-8", "LANG": "C.UTF-8"}
    if os.name == "nt":
        env = dict(os.environ, **{k: v for k, v in env.items() if k not in ("HOME", "PLAYWRIGHT_BROWSERS_PATH", "TMPDIR")})
        cmd = [sys.executable, os.path.join(clone, script_rel)] + args
    else:
        cmd = _as(user, ["env", "-i"] + ["%s=%s" % kv for kv in env.items()] + [sys.executable, os.path.join(clone, script_rel)] + args)
    start = time.time()
    p = subprocess.Popen(cmd, cwd=os.path.join(clone, cwd_rel), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL,
                         env=env if os.name == "nt" else None, **({} if os.name == "nt" else {"start_new_session": True}))
    last, why = [time.time()], []

    def relay():
        for b in iter(lambda: p.stdout.read1(65536), b""):
            last[0] = time.time()
            with contextlib.suppress(Exception):
                sys.stdout.buffer.write(b)
                sys.stdout.buffer.flush()

    def caller():    # the SSH connection: when this PC stops listening, the run stops
        with contextlib.suppress(Exception):
            while sys.stdin.buffer.read(65536):
                pass
        if p.poll() is None:
            why.append("the connection closed")
            _kill_group(p)
    th = threading.Thread(target=relay, daemon=True)
    th.start()
    threading.Thread(target=caller, daemon=True).start()
    code = None
    while code is None:
        try:
            code = p.wait(timeout=5)
        except subprocess.TimeoutExpired:
            if time.time() - last[0] > stall * 60:
                why.append("stalled")
                _kill_group(p)
                code = 124
    th.join(5)
    if "stalled" in why:
        print("\nharness: cloud %s: STALLED on the machine: no output for %.0f min; the job was killed. Rerun it." % (lane, stall), flush=True)
        code = 124
    elif why:
        code = 130
    elif code < 0:
        code = 1
    _collect(clone, job, lane, script_rel, cwd_rel, start, code, touched, user)
    sys.stdout.flush()
    os._exit(code)   # not through interpreter shutdown: the connection thread is still blocked reading stdin


def _wrote(clone, tops, start):
    """Files under `tops` the run wrote: modified at or after `start`, which is taken after the checkout and the smudge,
    so nothing the snapshot put there comes back. An LFS pointer never comes back (a run does not write one)."""
    out = set()
    for top in tops:
        for dp, dn, fn in os.walk(os.path.join(clone, top)):
            dn[:] = [d for d in dn if d not in (".git", "__pycache__")]
            for f in fn:
                p = os.path.join(dp, f)
                with contextlib.suppress(OSError):
                    if os.path.getmtime(p) >= start:
                        with open(p, "rb") as fh:
                            if fh.read(40).startswith(b"version https://git-lfs"):
                                continue
                        out.add(os.path.relpath(p, clone).replace(os.sep, "/"))
    return out


def _collect(clone, job, lane, script_rel, cwd_rel, start, code, touched, user=None):
    """meta.json for the results: what the run read (repo-relative), which of those were LFS pointers here, their hashes
    and the verify's neighbours' and the harness's, the renderer, and every file it wrote."""
    reads, info = [], {}
    with contextlib.suppress(OSError):
        with open(touched, encoding="utf-8") as fh:
            for ln in fh:
                with contextlib.suppress(ValueError):
                    r = json.loads(ln)
                    if "f" in r:
                        rel = os.path.relpath(r["f"], clone).replace(os.sep, "/")
                        if not rel.startswith("..") and rel not in reads:
                            reads.append(rel)
                    else:
                        info.update(r)
    here = os.path.dirname(script_rel)
    hashed = set(reads)
    fp = subprocess.run(_as(user, [sys.executable, "-c", "import sys; sys.path.insert(0, sys.argv[1]); import harness; "
                                   "print(harness.result_fingerprint())", os.path.join(clone, "tools")]),
                        capture_output=True, text=True, stdin=subprocess.DEVNULL)
    info["harness_key"] = fp.stdout.strip().splitlines()[-1] if fp.returncode == 0 and fp.stdout.strip() else ""
    with contextlib.suppress(OSError):
        for f in os.listdir(os.path.join(clone, here)):
            if f.endswith((".py", ".json")) and os.path.isfile(os.path.join(clone, here, f)):
                hashed.add((here + "/" + f) if here else f)
    pointers = []
    present = [rel for rel in sorted(hashed) if os.path.isfile(os.path.join(clone, rel))]
    for rel in present:
        with open(os.path.join(clone, rel), "rb") as fh:
            if fh.read(64).startswith(b"version https://git-lfs"):
                pointers.append(rel)
    hashes = object_ids(clone, present, user)
    wrote = [("files/" + rel, os.path.join(clone, rel)) for rel in sorted(_wrote(clone, sorted({here or ".", cwd_rel or "."}), start))]
    for d in os.listdir(job):
        if d.startswith("out") and os.path.isdir(os.path.join(job, d)):
            for dp, dn, fn in os.walk(os.path.join(job, d)):
                for f in fn:
                    wrote.append((os.path.relpath(os.path.join(dp, f), job).replace(os.sep, "/"), os.path.join(dp, f)))
    meta = {"lane": info.get("lane") or lane, "renderer": info.get("renderer", ""), "harness_key": info.get("harness_key", ""), "touched": reads, "hashes": hashes, "pointers": pointers,
            "wrote": sorted(dict(wrote)), "script": script_rel, "code": code, "ended": time.strftime("%Y-%m-%dT%H:%M:%S")}
    with open(os.path.join(job, "wrote.json"), "w", encoding="utf-8") as fh:
        json.dump(dict(wrote), fh)
    with open(os.path.join(job, "meta.json"), "w", encoding="utf-8") as fh:
        json.dump(meta, fh)


def r_results(argv):
    lane = argv[0]
    job = os.path.join(_ws_here(), "lanes", lane + ".job")
    with open(os.path.join(job, "wrote.json"), encoding="utf-8") as fh:
        wrote = json.load(fh)
    with tarfile.open(fileobj=sys.stdout.buffer, mode="w|") as tf:
        tf.add(os.path.join(job, "meta.json"), arcname="meta.json")
        for arc, p in sorted(wrote.items()):
            with contextlib.suppress(OSError):
                tf.add(p, arcname=arc)
    sys.stdout.buffer.flush()
    return 0


RUNNER = {"ping": r_ping, "bootstrap": r_bootstrap, "prepare": r_prepare, "receive": r_receive, "run": r_run, "results": r_results}

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in RUNNER:
        try:
            sys.exit(RUNNER[sys.argv[1]](sys.argv[2:]))
        except Exception as e:     # one line on stderr for this PC to show; never exit 255 (that is SSH's own)
            print("runner %s: %s: %s" % (sys.argv[1], type(e).__name__, e), file=sys.stderr)
            sys.exit(3)
    print(__doc__)
