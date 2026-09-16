#!/usr/bin/env python3
"""Load the city page in headless Firefox and report what it did.

  tools/probe.py                       metrics for iziz.html at the default seed
  tools/probe.py --seed 42 --wait 20   a different city, shorter settle time
  tools/probe.py --page old.html       any copy of the page (e.g. from git show)
  tools/probe.py --json out.json       also save the full report

The report has: errors shown on the page, build stage timings, draw calls, triangles,
programs, frame times, the adaptive resolution the GPU settled at, window._details,
and a fingerprint (SHA-256) of the building layout and door list. Two runs with the
same fingerprint built the same city.

Needs: firefox (snap or native), the project's server.py and site.toml.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PROBE = r"""<script>(function(){const W=THREE.WebGLRenderer;let rd=null,sc=null,frames=[],last=0;
THREE.WebGLRenderer=function(o){const r=new W(o);rd=r;const R0=r.render;r.render=function(scene,cam){sc=scene;const t=performance.now();if(last)frames.push(t-last);last=t;return R0.call(r,scene,cam);};return r;};
const rep=o=>{new Image().src='/__probe?'+encodeURIComponent(JSON.stringify(o));};
const sha=async s=>{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');};
const r2=x=>Math.round(x*100)/100;
setTimeout(async()=>{try{const out={};
 out.errors=(document.getElementById('errs')||{}).textContent||'';
 out.load=(typeof LOAD!=='undefined'&&LOAD.times)||null;out.loadMs=window._loadMs||null;
 out.details=window._details||null;out.cull=window._cull||null;out.res=window._res&&window._res.cur;out.fps=window._fps;
 if(window._IZ&&window._IZ.REG){const B=Object.values(window._IZ.REG).map(r=>r.box);out.atlasRegions=B.length;out.atlasMaxY=Math.max(...B.map(b=>b[1]+b[3]));out.atlasMaxX=Math.max(...B.map(b=>b[0]+b[2]));}
 if(rd){const inf=rd.info;let n=0,inst=0,cap=0,used=0,pts=0,meshes=0,nocull=0;const mats=new Set();sc.traverse(o=>{n++;if(o.isInstancedMesh){inst++;cap+=o.instanceMatrix.count;used+=o.count;}else if(o.isPoints)pts++;else if(o.isMesh)meshes++;if(o.material)mats.add(o.material);if(o.frustumCulled===false)nocull++;});
  frames=frames.slice(-120);const srt=[...frames].sort((a,b)=>a-b);
  Object.assign(out,{calls:inf.render.calls,triangles:inf.render.triangles,programs:inf.programs.length,textures:inf.memory.textures,objects:n,instanced:inst,instCap:cap,instUsed:used,points:pts,meshes,materials:mats.size,noCull:nocull,
   frameP50:srt.length?+srt[srt.length>>1].toFixed(1):null,frameP95:srt.length?+srt[Math.floor(srt.length*0.95)].toFixed(1):null,canvas:[rd.domElement.width,rd.domElement.height]});}
 if(window._lotList){const L=window._lotList.map(l=>[r2(l.x),r2(l.z),r2(l.w),r2(l.dpt),r2(l.h),Math.round(l.ry*1000)/1000,l.kind,l.fixed?1:0]);out.lots=L.length;out.lotHash=await sha(JSON.stringify(L));}
 if(window._doorList){out.doors=window._doorList.length;out.doorHash=await sha(JSON.stringify(window._doorList.map(d=>Array.isArray(d)?d.map(v=>typeof v==='number'?r2(v):v):d)));}
 rep(out);}catch(e){rep({probeError:String(e)});}},WAIT);})();</script>"""

EXPOSE = ("window._lots=lots.filter(l=>!l.fixed).length;",
          "window._lots=lots.filter(l=>!l.fixed).length;window._lotList=lots;window._doorList=doors;")


def firefox_cmd():
    ff = shutil.which("firefox")
    if not ff:
        sys.exit("firefox not found")
    snap = os.path.realpath(ff).startswith("/snap/") or "/snap/" in open(ff, "rb").read(4096).decode("latin1")
    return ff, snap


def kill_firefox(pid, snap):
    if snap:
        subprocess.run(["snap", "run", "--shell", "firefox", "-c", f"kill {pid}"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    else:
        subprocess.run(["kill", str(pid)], stderr=subprocess.DEVNULL)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--page", default=os.path.join(ROOT, "iziz.html"), help="HTML file to probe")
    ap.add_argument("--seed", type=int, default=None)
    ap.add_argument("--wait", type=int, default=30, help="seconds to let the page run before reporting")
    ap.add_argument("--port", type=int, default=8123)
    ap.add_argument("--json", help="write the full report here")
    ap.add_argument("--quiet", action="store_true")
    a = ap.parse_args()

    src = open(a.page, encoding="utf-8").read()
    if "<script src=" not in src:
        sys.exit("page has no three.js script tag to hook")
    if EXPOSE[0] in src:
        src = src.replace(EXPOSE[0], EXPOSE[1])
    cut = src.index("</script>") + len("</script>")
    src = src[:cut] + PROBE.replace("WAIT", str(a.wait * 1000)) + src[cut:]

    ff, snap = firefox_cmd()
    home = os.path.expanduser("~")
    work = tempfile.mkdtemp(prefix="iziz-probe-", dir=os.path.join(home, "snap/firefox/common") if snap and os.path.isdir(os.path.join(home, "snap/firefox/common")) else None)
    profile = os.path.join(work, "profile")
    os.mkdir(profile)
    page = os.path.join(work, "page.html")
    open(page, "w", encoding="utf-8").write(src)

    # the real site config, with "/" pointing at the instrumented copy
    import tomllib
    cfg = tomllib.load(open(os.path.join(ROOT, "site.toml"), "rb"))
    lines = [f'[server]\nhost="127.0.0.1"\nport={a.port}\nlog_requests=true\n']
    for r in cfg.get("route", []):
        if not r.get("enabled", True):
            continue
        f = page if r["path"] == "/" else os.path.join(ROOT, r["file"])
        al = json.dumps(r.get("aliases", []))
        lines.append(f'[[route]]\npath={json.dumps(r["path"])}\naliases={al}\nfile={json.dumps(f)}\n')
    for m in cfg.get("mount", []):
        if m.get("enabled", True):
            lines.append(f'[[mount]]\nprefix={json.dumps(m["prefix"])}\ndir={json.dumps(os.path.join(ROOT, m["dir"]))}\n')
    toml = os.path.join(work, "site.toml")
    open(toml, "w").write("\n".join(lines))

    log = open(os.path.join(work, "server.log"), "w+")
    srv = subprocess.Popen([sys.executable, os.path.join(ROOT, "server.py"), "--config", toml], stderr=log, stdout=subprocess.DEVNULL)
    time.sleep(0.8)
    url = f"http://127.0.0.1:{a.port}/?debug" + (f"&seed={a.seed}" if a.seed else "")
    fx = subprocess.Popen([ff, "--headless", "--no-remote", "--window-size=1600,900", "--profile", profile, url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    report = None
    deadline = time.time() + a.wait + 60
    try:
        while time.time() < deadline:
            time.sleep(1)
            log.seek(0)
            for line in log:
                m = re.search(r"GET /__probe\?(\S+)", line)
                if m:
                    report = json.loads(urllib.parse.unquote(m.group(1)))
                    break
            if report:
                break
    finally:
        pid = subprocess.run(["pgrep", "-f", profile], capture_output=True, text=True).stdout.split()
        for p in pid:
            kill_firefox(p, snap)
        fx.wait(timeout=10) if fx.poll() is None else None
        srv.terminate()
        srv.wait(timeout=5)
        time.sleep(0.5)
        shutil.rmtree(work, ignore_errors=True)

    if not report:
        sys.exit("no report from the page (did it load? try --wait 60)")
    if a.json:
        json.dump(report, open(a.json, "w"), indent=1)
    if not a.quiet:
        e = report.get("errors", "")
        print("errors:", "none" if not e else e.strip()[:400])
        keys = ["loadMs", "atlasRegions", "atlasMaxX", "atlasMaxY", "calls", "triangles", "programs", "textures", "objects", "instanced", "instCap", "instUsed", "noCull", "frameP50", "frameP95", "res", "fps", "lots", "lotHash", "doors", "doorHash"]
        for k in keys:
            if k in report:
                print(f"{k}: {report[k]}")
        if report.get("load"):
            top = sorted(report["load"], key=lambda t: -t["ms"])[:5]
            print("slowest stages:", ", ".join(f"{t['stage']} {t['ms']}ms" for t in top))
        if report.get("cull"):
            print("cull:", json.dumps(report["cull"]))
        if report.get("details"):
            print("details:", json.dumps(report["details"]))
    return 1 if report.get("errors") else 0


if __name__ == "__main__":
    sys.exit(main())
