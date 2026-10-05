#!/usr/bin/env python3
"""Side-by-side shots: the built web page and the Godot spike, from the same camera.

    python3 godot/tools/compare_shots.py                 # every case
    python3 godot/tools/compare_shots.py girder iziz     # some

For each case it loads the page headless, pins the page's main camera at a world eye and target (and reads the
page's field of view and hour), screenshots it, then renders the Godot spike case from the same eye, target, field
of view and hour (tools/shot.sh), and writes godot/shots/compare/<case>.png: web on the left, Godot on the right.
The camera is pinned by fixing its position, rotation and fov fields, so the page's own controls cannot move it
and its LOD and culling follow the pinned view. Godot shows only what the case exported (a tile or a region);
the page shows its whole world.

Needs: playwright, Pillow, Xvfb, and GODOT (or `godot` on the path).
"""
import asyncio, functools, glob, http.server, json, os, socketserver, subprocess, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
GODOT_DIR = os.path.dirname(HERE)
REPO = os.path.dirname(GODOT_DIR)
OUT = os.path.join(GODOT_DIR, "shots", "compare")
THREE = os.path.join(REPO, "kits", "ancients", "three.min.js")
GL_ARGS = ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"]
W, H = 1600, 900

# target: world [x, z] (y = the ground there + lift); eye: offset from the target's ground point
CASES = {
    "hyperjungle": dict(page="biomes/hyperjungle/dist/hyperjungle.html", ground="BIO.terrainH",
                        target=[162, -747], lift=15, eye=[-60, 25, 70]),
    "rift": dict(page="biomes/rift/dist/rift.html", ground="BIO.terrainH",
                 target=[-300, 300], lift=12, eye=[50, 25, 60]),
    "girder": dict(page="settlements/girder/girder.html", ground="_api.terrainH",
                   target=[-2, 8], lift=2, eye=[-16, 6, 20], hour="_api.skyHour()",
                   set_hour="h => { _api.skySetHour(h); const p = document.getElementById('dnPause'); if (p && !/Resume/.test(p.textContent)) p.click(); }"),
    "iziz": dict(page="settlements/iziz/dist/iziz.html", ground="terrainH",
                 target=[0, 0], lift=10, eye=[90, 60, 110], hour="ATMOS.U.hour.value"),
    "yuni": dict(page="settlements/yuni/yuni.html", ground=None, building="bld_00005",
                 lift=2, eye=[150, 70, 170]),   # outside the Foundry's 146 x 92 m footprint: the records case draws it as a translucent box, and an eye over its roof sees only that
}

# before any page script: record the cameras and what the page renders (godot/tools/stage_hook.js)
INIT = open(os.path.join(HERE, "stage_hook.js")).read()
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
            pg = await br.new_page(viewport={"width": W, "height": H})
            await pg.add_init_script(INIT)
            await pg.route("**/three.min.js", lambda r: asyncio.ensure_future(r.fulfill(path=THREE, content_type="application/javascript")))
            await pg.goto(f"http://127.0.0.1:{srv.server_address[1]}/{c['page']}", timeout=900000)
            await pg.wait_for_function("window._ready===true", timeout=900000)
            if c.get("building"):
                b = json.load(open(os.path.join(GODOT_DIR, "data", "yuni", "fixtures.json")))
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


def godot(n, cam):
    f = lambda v: ",".join("%.3f" % x for x in v)
    args = [os.path.join(HERE, "shot.sh"), n, "shots/compare/%s-godot.png" % n, "--eyew=" + f(cam["eye"]),
            "--atw=" + f(cam["target"]), "--fov=%.3f" % cam["fov"], "--nohud"]
    if cam.get("hour") is not None:
        args.append("--hour=%.3f" % float(cam["hour"]))
    r = subprocess.run(args, capture_output=True, text=True, timeout=600)
    print(n, "godot", "saved" if "saved" in r.stdout else ("FAILED " + r.stdout[-400:]), flush=True)


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
    d.text((w + 18, 10), "%s: Godot 4.5 spike (Compatibility renderer, software GL)" % n, fill=(235, 235, 235))
    out.save(os.path.join(OUT, n + (("-h%g" % HOUR) if HOUR is not None else "") + ".png"))


HOUR = next((float(a.split("=", 1)[1]) for a in sys.argv[1:] if a.startswith("--hour=")), None)

if __name__ == "__main__":
    names = [a for a in sys.argv[1:] if a in CASES] or list(CASES)
    cams = asyncio.run(web(names))
    old = json.load(open(os.path.join(OUT, "cameras.json"))) if os.path.exists(os.path.join(OUT, "cameras.json")) else {}
    old.update(cams)
    json.dump(old, open(os.path.join(OUT, "cameras.json"), "w"), indent=1)
    for n in names:
        if n not in cams:
            continue
        godot(n, cams[n])
        compose(n)
    print("wrote", ", ".join("godot/shots/compare/%s.png" % n for n in names))
