#!/usr/bin/env python3
"""Export the Godot spike's test data from the built pages (GODOT-PLAN.md Phase 7, "The spike").

    python3 godot/tools/export_spike.py                 # every case
    python3 godot/tools/export_spike.py hyperjungle rift  # some
    python3 godot/tools/export_spike.py --list

Each case loads a built page headless (software GL, so a page takes one to five minutes), waits for
window._ready, calls the page's own exporter, and writes godot/data/<case>/. The cases are chosen to
cover the routes the plan names and to differ from each other:

  hyperjungle  krator-biome JSON (BIO.export), a 300 m tile round a hero hypertree; DataTexture leaf atlases; no LOD chunks
  rift         krator-biome JSON, one tile; every mesh LOD-chunked; hooked materials (irid bark, far impostors)
  girder       glTF (three's own GLTFExporter over a region) plus its material records (KMAT.table) and pack (tex/)
  iziz         krator-atmos JSON (ATMOS.export) for the whole city, plus a glTF region of the city round it
  yuni         KRATOR_EXPORT records (fixtures, core/tags records, one building's interior): ids, tags, nav, no meshes at all

The biome tiles carry their own ground (BIO.export's `ground`, since 2026-10-05). Girder and Iziz also write
terrain.json: the page's ground height sampled on a grid (krator-heightfield, a spike-only stand-in for the
core/terrain bake that Phase 2 plans), since their exports carry no ground of their own.

Needs: pip install playwright (the cloud containers ship Chromium in /opt/pw-browsers).
"""
import argparse, asyncio, base64, functools, glob, http.server, json, os, shutil, socketserver, struct, sys, threading, time

HERE = os.path.dirname(os.path.abspath(__file__))
GODOT = os.path.dirname(HERE)
REPO = os.path.dirname(GODOT)
DATA = os.path.join(GODOT, "data")
THREE = os.path.join(REPO, "kits", "ancients", "three.min.js")
INJECT = [os.path.join(HERE, "vendor", "GLTFExporter.r128.js"), os.path.join(HERE, "spike_export.js")]
STAGE = os.path.join(REPO, "core", "biome", "44-core-stage.js")   # KSTAGE, for pages that do not list it
HOOK = os.path.join(HERE, "stage_hook.js")                         # what the page renders, for the stage's sky
GL_ARGS = ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"]

# the page's ground height, sampled on a grid: [x0, z0, x1, z1], step in metres, the JS expression for h(x, z)
HEIGHT_JS = """([box, step, fn]) => { const h = eval(fn); const nx = Math.floor((box[2]-box[0])/step)+1, nz = Math.floor((box[3]-box[1])/step)+1;
  const a = new Float32Array(nx*nz); for (let j=0;j<nz;j++) for (let i=0;i<nx;i++) a[j*nx+i] = h(box[0]+i*step, box[1]+j*step);
  const u = new Uint8Array(a.buffer); let s=''; for (let i=0;i<u.length;i+=0x8000) s += String.fromCharCode.apply(null, u.subarray(i,i+0x8000));
  return {format:'krator-heightfield', version:0, note:'spike only: sampled from the page, row-major, z rows of x; stands in for the core/terrain bake',
          x0:box[0], z0:box[1], step, nx, nz, heights:{type:'Float32Array', n:a.length, b64:btoa(s)}}; }"""

CASES = {
    "hyperjungle": dict(page="biomes/hyperjungle/dist/hyperjungle.html", kind="biome",
                        box=[12, -897, 312, -597]),   # centred on a hero hypertree (162, -747)
    "rift": dict(page="biomes/rift/dist/rift.html", kind="biome",
                 box=[-450, 150, -150, 450]),
    "girder": dict(page="settlements/girder/girder.html", kind="gltf",
                   box=[-30, -30, 30, 30], height="(x,z)=>_api.terrainH(x,z)", step=1,
                   kmat="girder", tex="settlements/girder/tex"),   # the material library pilot: records and its pack
    "iziz": dict(page="settlements/iziz/dist/iziz.html", kind="atmos",
                 box=[-80, -80, 80, 80], height="(x,z)=>terrainH(x,z)", step=2,
                 hbox=[-440, -620, 620, 450], hstep=4),
    "yuni": dict(page="settlements/yuni/yuni.html", kind="records", building="bld_00005"),
}


def chromium():
    for k in ("KRATOR_CHROME", "PW_CHROME", "CHROMIUM"):
        if os.environ.get(k):
            return os.environ[k]
    c = sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"))
    return c[-1] if c else None


def unpack(t):
    code = {"Float32Array": "f", "Uint16Array": "H", "Uint32Array": "I"}[t["type"]]
    raw = base64.b64decode(t["b64"])
    return list(struct.unpack("<%d%s" % (t["n"], code), raw)), code


def pack(vals, code, type_name):
    raw = struct.pack("<%d%s" % (len(vals), code), *vals)
    return {"type": type_name, "n": len(vals), "b64": base64.b64encode(raw).decode()}


def compact_buckets(exp):
    """A tile's bucket keeps the build's whole vertex list (biomes/GODOT.md). Drop the vertices its triangles
    do not use, so the file holds the tile and not the build. The importer copes either way."""
    for b in exp["buckets"]:
        g = b["geometry"]
        idx, _ = unpack(g["index"])
        used = sorted(set(idx))
        remap = {v: i for i, v in enumerate(used)}
        nv = unpack(g["position"])[0].__len__() // 3
        for k in ("position", "normal", "uv", "color"):
            if k not in g:
                continue
            vals, code = unpack(g[k])
            size = len(vals) // nv
            out = []
            for v in used:
                out.extend(vals[v * size:(v + 1) * size])
            g[k] = pack(out, code, g[k]["type"])
        new = [remap[v] for v in idx]
        big = len(used) > 65535
        g["index"] = pack(new, "I" if big else "H", "Uint32Array" if big else "Uint16Array")
    return exp


def write_json(path, obj):
    with open(path, "w") as f:
        json.dump(obj, f, separators=(",", ":"))
    return os.path.getsize(path)


async def run_case(browser, port, name, c, log):
    from playwright.async_api import TimeoutError as PWTimeout  # noqa
    out = os.path.join(DATA, name)
    os.makedirs(out, exist_ok=True)
    pg = await browser.new_page(viewport={"width": 960, "height": 600})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.route("**/three.min.js", lambda r: asyncio.ensure_future(r.fulfill(path=THREE, content_type="application/javascript")))
    await pg.add_init_script(open(HOOK).read())
    t0 = time.time()
    await pg.goto(f"http://127.0.0.1:{port}/{c['page']}", timeout=900000)
    await pg.wait_for_function("window._ready===true", timeout=900000)
    log(f"{name}: built in {time.time() - t0:.0f} s ({len(errs)} page errors)")
    for f in INJECT:
        await pg.add_script_tag(path=f)
    if not await pg.evaluate("typeof KSTAGE !== 'undefined'"):
        await pg.add_script_tag(path=STAGE)
    await pg.wait_for_timeout(1500)   # a few frames, so the hook has seen what the page renders
    files = {}
    if c["kind"] == "biome":
        exp = await pg.evaluate("box => BIO.export({box})", c["box"])   # with the stage (43-core-export-host.js wraps it)
        exp = compact_buckets(exp)
        files["biome.json"] = write_json(os.path.join(out, "biome.json"), exp)
        log(f"{name}: {exp['stats']}")
    elif c["kind"] == "gltf" or c["kind"] == "atmos":
        if c["kind"] == "atmos":
            files["atmos.json"] = write_json(os.path.join(out, "atmos.json"), await pg.evaluate("ATMOS.export({stage: false})"))
        # the stage (KSTAGE): light, fog, tonemapping, the sky from above the region, and the ground's look on the same
        # grid as terrain.json, so the importer can texture the sampled ground
        hb, hs = c.get("hbox", c["box"]), c.get("hstep", c["step"])
        st = await pg.evaluate("""([box, region, step, fn]) => { const h = eval(fn), cx = (region[0] + region[2]) / 2, cz = (region[1] + region[3]) / 2;
            return KSTAGE.capture({ at: [cx, h(cx, cz) + 40, cz], sky: 1024, box, step, ground: h }); }""", [hb, c["box"], hs, c["height"]])
        files["stage.json"] = write_json(os.path.join(out, "stage.json"), st)
        g = await pg.evaluate("([box, name]) => KSPIKE.gltf(box, {name})", [c["box"], name])
        with open(os.path.join(out, "region.glb"), "wb") as f:
            f.write(base64.b64decode(g["b64"]))
        files["region.glb"] = g["bytes"]
        write_json(os.path.join(out, "region.dropped.json"), {"box": c["box"], "stats": g["stats"], "dropped": g["dropped"]})
        if c.get("kmat"):   # the material records (KMAT.table) and the pack the Godot side rebuilds library surfaces from
            files["materials.json"] = write_json(os.path.join(out, "materials.json"), await pg.evaluate("b => KMAT.table(b)", c["kmat"]))
        if c.get("tex"):
            dst = os.path.join(out, "tex")
            shutil.rmtree(dst, ignore_errors=True)
            shutil.copytree(os.path.join(REPO, c["tex"]), dst)
            files["tex/"] = sum(os.path.getsize(os.path.join(dst, f)) for f in os.listdir(dst))
        log(f"{name}: glb {g['stats']} dropped {g['dropped']}")
    elif c["kind"] == "records":
        files["fixtures.json"] = write_json(os.path.join(out, "fixtures.json"), await pg.evaluate("KRATOR_EXPORT.fixtures()"))
        # the core/tags registry (core/tags/README.md): the record every node carries as its "krator" metadata
        files["tags.json"] = write_json(os.path.join(out, "tags.json"), await pg.evaluate("KRATOR_EXPORT.tags()"))
        files["building.json"] = write_json(os.path.join(out, "building.json"),
                                            await pg.evaluate("id => KRATOR_EXPORT.building(id)", c["building"]))
    if c.get("height"):
        hb = c.get("hbox", c.get("box"))
        hf = await pg.evaluate(HEIGHT_JS, [hb, c.get("hstep", c["step"]), c["height"]])
        files["terrain.json"] = write_json(os.path.join(out, "terrain.json"), hf)
    meta = {"case": name, "page": c["page"], "kind": c["kind"], "box": c.get("box"), "files": files,
            "page_errors": errs[:20], "exported": time.strftime("%Y-%m-%d")}
    write_json(os.path.join(out, "meta.json"), meta)
    await pg.close()
    log(f"{name}: " + ", ".join(f"{k} {v / 1e6:.1f} MB" for k, v in files.items()))


async def main(names):
    from playwright.async_api import async_playwright

    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    srv = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=REPO))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    port = srv.server_address[1]
    log = lambda s: print(s, flush=True)
    async with async_playwright() as p:
        exe = chromium()
        browser = await p.chromium.launch(executable_path=exe, args=GL_ARGS) if exe else await p.chromium.launch(args=GL_ARGS)
        # one page at a time: two software-GL builds at once starve each other
        for n in names:
            try:
                await run_case(browser, port, n, CASES[n], log)
            except Exception as e:
                log(f"{n}: FAILED {str(e).splitlines()[0]}")
        await browser.close()
    srv.shutdown()


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cases", nargs="*")
    ap.add_argument("--list", action="store_true")
    a = ap.parse_args()
    if a.list:
        for k, v in CASES.items():
            print(f"{k:12} {v['kind']:8} {v['page']}")
        sys.exit(0)
    bad = [n for n in a.cases if n not in CASES]
    if bad:
        sys.exit(f"unknown case(s) {bad}; --list shows them")
    asyncio.run(main(a.cases or list(CASES)))
