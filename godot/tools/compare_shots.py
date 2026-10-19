#!/usr/bin/env python3
"""Side-by-side shots: the built web page and the Godot spike, from the same camera, and a score for each pair.

    python3 godot/tools/compare_shots.py                 # every case: shoot both sides, compose, score
    python3 godot/tools/compare_shots.py girder iziz     # some
    python3 godot/tools/compare_shots.py --score         # score the shots already in godot/shots/compare, no new shots
    python3 godot/tools/compare_shots.py world-sedesert world-iziz --report    # the nightly's step: prints, exit 0
    python3 godot/tools/compare_shots.py world-sedesert world-iziz --assert    # exit 1 when a pair scores under the threshold
    python3 godot/tools/compare_shots.py ... --threshold=0.5 --diff=0.1 --hour=21

For each case it loads the page headless, pins the page's main camera at a world eye and target (and reads the
page's field of view and hour), screenshots it, then renders the Godot spike case from the same eye, target, field
of view and hour (tools/shot.sh under Xvfb; the Godot binary directly where there is a display), and writes
godot/shots/compare/<case>.png: web on the left, Godot on the right.
The camera is pinned by fixing its position, rotation and fov fields, so the page's own controls cannot move it
and its LOD and culling follow the pinned view. Godot shows only what the case exported (a tile or a region);
the page shows its whole world.

The score (ROADMAP.md stage 4, "a perceptual metric"): both shots of a pair are the same case, view and size: taken
at 1600 x 900 on both sides, and where they still differ in size (a window clipped to a small screen, a page at
another device pixel ratio) both are downscaled to the smaller before scoring, and the table says so. Each pair gets
  SSIM   structural similarity (Wang 2004) on a grey copy downscaled to SSIM_W px wide, 8 x 8 mean windows, numpy only;
         1 is identical, 0 unrelated, negative is inverted structure. The number the threshold reads.
  MAD    mean absolute difference of the grey pair at the common size, as a fraction of full range (0 to 1).
  diff   the fraction of grey pixels differing by more than --diff (default DIFF_T of full range).
and a difference image, godot/shots/compare/<case>-diff.png (the grey difference, amplified x3; brighter is further
apart), next to the shots and gitignored like them. The table prints the worst SSIM first; scores.json keeps it.
--threshold=<ssim> (default SSIM_T, godot/README.md "Scoring the pairs" says why) and --assert make a pair under it,
or a pair with a shot missing, exit 1. --report prints the same table and always exits 0: the nightly's mode until
the owner has read the first numbers (tools/test_all.py, COMPARE_ASSERT).

Needs: playwright, Pillow, numpy, Xvfb (on a machine with no display), and GODOT (or `godot` on the path).
"""
import asyncio, functools, glob, http.server, json, os, shutil, socketserver, subprocess, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
GODOT_DIR = os.path.dirname(HERE)
REPO = os.path.dirname(GODOT_DIR)
OUT = os.path.join(GODOT_DIR, "shots", "compare")
THREE = os.path.join(REPO, "kits", "ancients", "three.min.js")
GL_ARGS = ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"]
W, H = 1600, 900
SSIM_W = 400     # the grey copy's width for SSIM: 8 x 8 windows on 400 px see 32-px features of the 1600-px shot, the scale at
                 # which a tree, a wall or a water sheet is one thing and a leaf's exact placement is not
SSIM_T = 0.40    # --threshold default (2026-10-18, godot/README.md "Scoring the pairs"): the first pairs scored 0.54 and 0.71; the
                 # failures it must catch scored under 0.32 (a black render 0.00, the wrong case 0.24-0.26, a mirrored camera 0.29-0.31)
DIFF_T = 0.10    # --diff default: a grey pixel counts as differing past 10% of full range (26 of 255)

# target: world [x, z] (y = the ground there + lift); eye: offset from the target's ground point
CASES = {
    "hyperjungle": dict(page="biomes/hyperjungle/dist/hyperjungle.html", ground="BIO.terrainH",
                        target=[-570, -266], lift=15, eye=[-60, 25, 70]),
    "rift": dict(page="biomes/rift/dist/rift.html", ground="BIO.terrainH",
                 target=[-300, 300], lift=12, eye=[50, 25, 60]),
    # M4: the sedesert tile through core/export (krator/world_import.gd), round the rain-shadow pond, the eye inside the tile
    "world-sedesert": dict(page="biomes/sedesert/dist/sedesert.html", ground="BIO.terrainH",
                           target=[230, 640], lift=4, eye=[-75, 30, 95]),
    # core/water phases 3 and 4: sedesert's notch through core/export (box 2850,-320,3450,280): the river's last reach, the
    # cataract arcing off the lip into the Abyss, its plunge pool; the eye 250 m over the lip, out over the Abyss inside the tile,
    # looking down on the notch: the river's last reach coming over the lip and the curtain falling away under it
    "world-sedesert-falls": dict(page="biomes/sedesert/dist/sedesert.html", ground="BIO.terrainH",
                                 target=[3150, -4], lift=0, eye=[200, 250, 100]),
    # M5: a district of Iziz through core/export, inside the south gate (box -120,292,120,532), the eye in the tile looking at the gate
    "world-iziz": dict(page="settlements/iziz/dist/iziz.html", ground="terrainH",
                       target=[0, 470], lift=8, eye=[-55, 22, -95], hour="ATMOS.U.hour.value"),
    "girder": dict(page="settlements/girder/girder.html", ground="_api.terrainH",
                   target=[-2, 8], lift=2, eye=[-16, 6, 20], hour="_api.skyHour()",
                   set_hour="h => { _api.skySetHour(h); const p = document.getElementById('dnPause'); if (p && !/Resume/.test(p.textContent)) p.click(); }"),
    "iziz": dict(page="settlements/iziz/dist/iziz.html", ground="terrainH",
                 target=[0, 0], lift=10, eye=[90, 60, 110], hour="ATMOS.U.hour.value"),
    "yuni": dict(page="settlements/yuni/yuni.html", ground=None, building="bld_00005",
                 lift=2, eye=[150, 70, 170]),   # outside the Foundry's 146 x 92 m footprint: the records case draws it as a translucent box, and an eye over its roof sees only that
}

# before any page script: record the cameras and what the page renders (godot/tools/stage_hook.js)
INIT = open(os.path.join(HERE, "stage_hook.js"), encoding="utf-8").read()
PIN = r"""([E, Tg]) => {
  const c = window.__cams[0]; if (!c) return null;
  const fov = c.fov;
  c.position.set(E[0], E[1], E[2]); c.up.set(0, 1, 0); c.lookAt(Tg[0], Tg[1], Tg[2]);
  const p = c.position.clone(), q = c.quaternion.clone(), e = new THREE.Euler().setFromQuaternion(q);
  const fix = (o, ks, vs) => ks.forEach((k, i) => Object.defineProperty(o, k, { get: () => vs[i], set: () => {}, configurable: true }));
  fix(c.position, ['x', 'y', 'z'], [p.x, p.y, p.z]);
  fix(c.quaternion, ['_x', '_y', '_z', '_w'], [q.x, q.y, q.z, q.w]);
  fix(c.rotation, ['_x', '_y', '_z'], [e.x, e.y, e.z]);
  fix(c, ['fov'], [fov]); c.updateProjectionMatrix();
  // only the canvas: hide every element that is not a canvas or a canvas's ancestor
  const keep = new Set(); document.querySelectorAll('canvas').forEach(cv => { for (let n = cv; n; n = n.parentElement) keep.add(n); });
  document.querySelectorAll('body *').forEach(n => { if (!keep.has(n)) n.style.setProperty('display', 'none', 'important'); });
  return { fov, cams: window.__cams.length };
}"""


def chromium():
    c = sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"))
    return os.environ.get("KRATOR_CHROME") or (c[-1] if c else None)


async def web(names):
    from playwright.async_api import async_playwright

    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    srv = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Q, directory=REPO))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    cams = {}
    async with async_playwright() as p:
        exe = chromium()
        br = await (p.chromium.launch(executable_path=exe, args=GL_ARGS) if exe else p.chromium.launch(args=GL_ARGS))
        for n in names:
          try:
            c = CASES[n]
            pg = await br.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)   # 1600 x 900 on both sides
            await pg.add_init_script(INIT)
            await pg.route("**/three.min.js", lambda r: asyncio.ensure_future(r.fulfill(path=THREE, content_type="application/javascript")))
            await pg.goto(f"http://127.0.0.1:{srv.server_address[1]}/{c['page']}", timeout=900000)
            await pg.wait_for_function("window._ready===true", timeout=900000)
            if c.get("building"):
                b = json.load(open(os.path.join(GODOT_DIR, "data", "yuni", "fixtures.json"), encoding="utf-8"))
                rec = next(x for x in b["buildings"] if x["id"] == c["building"])
                tx, ty, tz = rec["x"], rec["y"], rec["z"]
            else:
                tx, tz = c["target"]
                ty = await pg.evaluate(f"([x, z]) => {c['ground']}(x, z)", [tx, tz])
            target = [tx, ty + c["lift"], tz]
            eye = [tx + c["eye"][0], ty + c["eye"][1], tz + c["eye"][2]]
            info = await pg.evaluate(PIN, [eye, target])
            if HOUR is not None and c.get("set_hour"):   # --hour=h: both sides at that hour (a night pair shows the lamps)
                await pg.evaluate(c["set_hour"], HOUR)
                await pg.wait_for_timeout(1500)
            hour = await pg.evaluate(c["hour"]) if c.get("hour") else None
            await pg.wait_for_timeout(6000)   # LOD, culling and late textures settle on the pinned view
            os.makedirs(OUT, exist_ok=True)
            await pg.screenshot(path=os.path.join(OUT, n + "-web.png"), timeout=600000)   # one frame of a big world under software GL can take a minute
            cams[n] = {"eye": eye, "target": target, "fov": info["fov"] if info else 60, "hour": hour}
            print(n, "web", json.dumps(cams[n]), flush=True)
            await pg.close()
          except Exception as e:
            print(n, "web FAILED", str(e).splitlines()[0], flush=True)
        await br.close()
    srv.shutdown()
    return cams


def godot_bin():
    return os.environ.get("GODOT") or shutil.which("godot") or "godot"


def godot(n, cam):
    f = lambda v: ",".join("%.3f" % x for x in v)
    rel = "shots/compare/%s-godot.png" % n
    opts = ["--eyew=" + f(cam["eye"]), "--atw=" + f(cam["target"]), "--fov=%.3f" % cam["fov"], "--nohud"]
    if cam.get("hour") is not None:
        opts.append("--hour=%.3f" % float(cam["hour"]))
    if shutil.which("xvfb-run"):   # no display: tools/shot.sh (Xvfb + the Compatibility renderer on llvmpipe)
        args = [os.path.join(HERE, "shot.sh"), n, rel] + opts
    else:   # a desktop: the binary itself, the Compatibility renderer, as shot.sh would
        os.makedirs(os.path.join(GODOT_DIR, "shots"), exist_ok=True)
        open(os.path.join(GODOT_DIR, "shots", ".gdignore"), "a").close()
        args = [godot_bin(), "--path", GODOT_DIR, "--rendering-method", "gl_compatibility", "--rendering-driver", "opengl3",
                "--", "--case=" + n, "--shot=" + rel] + opts
    try:
        r = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=600)
        out = r.stdout or ""
    except Exception as e:
        out = "FAILED " + str(e)
    print(n, "godot", "saved" if "saved" in out else ("FAILED " + out[-400:]), flush=True)


def compose(n):
    from PIL import Image, ImageDraw
    a = Image.open(os.path.join(OUT, n + "-web.png")).convert("RGB")
    b = Image.open(os.path.join(OUT, n + "-godot.png")).convert("RGB")
    w, h = 960, 540
    out = Image.new("RGB", (w * 2 + 8, h + 34), (24, 24, 24))
    out.paste(a.resize((w, h)), (0, 34))
    out.paste(b.resize((w, h)), (w + 8, 34))
    d = ImageDraw.Draw(out)
    d.text((10, 10), "%s: web (three.js r128, the built page)" % n, fill=(235, 235, 235))
    gl = "software GL" if shutil.which("xvfb-run") else "the machine's GPU"
    d.text((w + 18, 10), "%s: Godot %s (Compatibility renderer, %s)" % (n, GODOT_VERSION, gl), fill=(235, 235, 235))
    out.save(os.path.join(OUT, n + (("-h%g" % HOUR) if HOUR is not None else "") + ".png"))


# ---- the metric -------------------------------------------------------------------------------------------------

def _box_mean(x, k):
    """The mean of every k x k window of x (valid windows only), by summed-area table: numpy only."""
    import numpy as np
    s = np.cumsum(np.cumsum(np.pad(x, ((1, 0), (1, 0))), axis=0), axis=1)
    return (s[k:, k:] - s[:-k, k:] - s[k:, :-k] + s[:-k, :-k]) / float(k * k)


def ssim(a, b, k=8):
    """Mean SSIM of two grey float arrays in [0, 1], k x k mean windows (Wang et al. 2004, C1 = 0.01^2, C2 = 0.03^2)."""
    c1, c2 = 0.01 ** 2, 0.03 ** 2
    ma, mb = _box_mean(a, k), _box_mean(b, k)
    va, vb, cov = _box_mean(a * a, k) - ma * ma, _box_mean(b * b, k) - mb * mb, _box_mean(a * b, k) - ma * mb
    s = ((2 * ma * mb + c1) * (2 * cov + c2)) / ((ma * ma + mb * mb + c1) * (va + vb + c2))
    return float(s.mean())


def score(n, diff_t=DIFF_T):
    """Score one pair: both shots to a common size (the smaller of the two), grey; SSIM on a SSIM_W-wide copy, MAD and the
    differing fraction at the common size; the difference image. None when a shot is missing."""
    import numpy as np
    from PIL import Image
    pa, pb = os.path.join(OUT, n + "-web.png"), os.path.join(OUT, n + "-godot.png")
    if not (os.path.isfile(pa) and os.path.isfile(pb)):
        return None
    a, b = Image.open(pa).convert("L"), Image.open(pb).convert("L")
    sizes = [a.size, b.size]
    cw, ch = min(a.size[0], b.size[0]), min(a.size[1], b.size[1])
    if a.size != (cw, ch):
        a = a.resize((cw, ch), Image.LANCZOS)
    if b.size != (cw, ch):
        b = b.resize((cw, ch), Image.LANCZOS)
    ga = np.asarray(a, dtype=np.float64) / 255.0
    gb = np.asarray(b, dtype=np.float64) / 255.0
    d = np.abs(ga - gb)
    sw, sh = SSIM_W, max(8, round(ch * SSIM_W / cw))
    sa = np.asarray(a.resize((sw, sh), Image.LANCZOS), dtype=np.float64) / 255.0
    sb = np.asarray(b.resize((sw, sh), Image.LANCZOS), dtype=np.float64) / 255.0
    Image.fromarray(np.clip(d * 3.0 * 255.0, 0, 255).astype(np.uint8), "L").save(os.path.join(OUT, n + "-diff.png"))
    return {"case": n, "ssim": ssim(sa, sb), "mad": float(d.mean()), "diff": float((d > diff_t).mean()), "diff_t": diff_t,
            "size": [cw, ch], "sizes": sizes, "ssim_size": [sw, sh], "resized": sizes[0] != sizes[1]}


def table(rows, names, threshold):
    """Print the scores, the worst SSIM first, then the pairs with a shot missing; return the names that fail."""
    rows = sorted(rows, key=lambda r: r["ssim"])
    missing = [n for n in names if n not in {r["case"] for r in rows}]
    print("\n%-22s %6s %6s %7s  %s" % ("case", "SSIM", "MAD", "diff>%.2f" % (rows[0]["diff_t"] if rows else DIFF_T), "size (web, godot)"))
    for r in rows:
        note = "%dx%d" % tuple(r["size"])
        if r["resized"]:
            note += "  both downscaled to the smaller from %dx%d, %dx%d" % (tuple(r["sizes"][0]) + tuple(r["sizes"][1]))
        flag = "" if r["ssim"] >= threshold else "   BELOW %.2f" % threshold
        print("%-22s %6.3f %6.3f %6.1f%%  %s%s" % (r["case"], r["ssim"], r["mad"], 100 * r["diff"], note, flag))
    for n in missing:
        print("%-22s %6s %6s %7s  a shot is missing (web or godot failed)" % (n, "-", "-", "-"))
    print("SSIM on a grey %d-px-wide copy, 8x8 mean windows; MAD and diff at the common size, grey, fraction of full range; diff images: %s/<case>-diff.png"
          % (SSIM_W, os.path.relpath(OUT, REPO).replace(os.sep, "/")))
    return [r["case"] for r in rows if r["ssim"] < threshold] + missing


def _godot_version():
    try:
        return subprocess.run([godot_bin(), "--version"], capture_output=True, text=True, timeout=60).stdout.strip().split(".stable")[0]
    except Exception:
        return "?"


def _opt(name, default, argv):
    v = next((a.split("=", 1)[1] for a in argv if a.startswith("--%s=" % name)), None)
    return default if v is None else float(v)


HOUR = next((float(a.split("=", 1)[1]) for a in sys.argv[1:] if a.startswith("--hour=")), None)
GODOT_VERSION = _godot_version() if "--score" not in sys.argv[1:] else "?"

if __name__ == "__main__":
    argv = sys.argv[1:]
    names = [a for a in argv if a in CASES] or list(CASES)
    bad = [a for a in argv if not a.startswith("--") and a not in CASES]
    if bad:
        sys.exit("unknown case(s): %s (cases: %s)" % (", ".join(bad), ", ".join(CASES)))
    threshold, diff_t = _opt("threshold", SSIM_T, argv), _opt("diff", DIFF_T, argv)
    if "--score" not in argv:
        cams = asyncio.run(web(names))
        cj = os.path.join(OUT, "cameras.json")
        old = json.load(open(cj, encoding="utf-8")) if os.path.exists(cj) else {}
        old.update(cams)
        os.makedirs(OUT, exist_ok=True)
        json.dump(old, open(cj, "w", encoding="utf-8", newline="\n"), indent=1)
        for n in names:
            if n not in cams:
                continue
            godot(n, cams[n])
            if os.path.isfile(os.path.join(OUT, n + "-godot.png")):
                compose(n)
        print("wrote", ", ".join("godot/shots/compare/%s.png" % n for n in names if n in cams))
    rows = [r for r in (score(n, diff_t) for n in names) if r]
    fails = table(rows, names, threshold)
    if rows:
        json.dump({"threshold": threshold, "pairs": rows}, open(os.path.join(OUT, "scores.json"), "w", encoding="utf-8", newline="\n"), indent=1)
    if fails and "--assert" in argv:
        print("FAIL: %s" % ", ".join(fails))
        sys.exit(1)
    if fails and "--report" in argv:
        print("report only: %s would fail --assert" % ", ".join(fails))
