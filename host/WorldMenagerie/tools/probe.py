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
import socket
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PROBE = r"""<script>window.__probeErrs=[];addEventListener('error',e=>window.__probeErrs.push((e.message||String(e))+' @'+(e.filename||'').split('/').pop()+':'+e.lineno));
// a shader that does not compile is only ever a console.error from three.js, and the mesh silently is not drawn
{const ce=console.error.bind(console);console.error=(...a)=>{const m=a.map(String).join(' ');if(/WebGLProgram|shader error|ERROR: 0:/i.test(m))window.__probeErrs.push('shader: '+m.slice(0,300));ce(...a);};}</script>
<script>// a page may draw a frame in more than one render call (Voth: the sky, then the city), so the shot is taken
// once the task that drew it is over, still before the buffer is cleared
(function(){let rd=null,sc=null,frames=[],last=0;
let wantShot=false,shotTaken=false;
if(window.THREE){const W=THREE.WebGLRenderer;THREE.WebGLRenderer=function(o){const r=new W(o);rd=r;const R0=r.render;r.render=function(scene,cam){sc=scene;window.__probeCam=cam;const t=performance.now();if(last)frames.push(t-last);last=t;const out=R0.call(r,scene,cam);if(wantShot){wantShot=false;shotTaken=true;queueMicrotask(()=>{try{const u=r.domElement.toDataURL('image/jpeg',0.8);fetch('http://127.0.0.1:SHOTPORT/shot',{method:'POST',mode:'no-cors',body:u});}catch(e){}});}return out;};return r;};}
// Ready: the loading overlay is gone (#loading removed, or Voth's #load hidden) and, on a 3D page, 30 frames have
// been drawn since and 1.2 s has passed. WAIT is only the ceiling; a page that never gets there is reported as timed out.
const t0=performance.now();let readyAt=0,framesAt=0;
const loadingGone=()=>{if(document.readyState==='loading')return false;for(const id of ['loading','load']){const e=document.getElementById(id);
 if(e&&e.isConnected){const cs=getComputedStyle(e);if(cs.display!=='none'&&cs.visibility!=='hidden')return false;}}return true;};
const tick=()=>{const now=performance.now();if(!readyAt&&loadingGone()){readyAt=now;framesAt=frames.length;}
 const settled=readyAt&&now-readyAt>1200+SETTLE&&(!rd||frames.length-framesAt>=30);
 if(settled||now-t0>WAIT){finish(!settled);return;}setTimeout(tick,150);};
setTimeout(tick,150);
const rep=o=>{new Image().src='/__probe?'+encodeURIComponent(JSON.stringify(o));};
const sha=async s=>{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');};
const r2=x=>Math.round(x*100)/100;
// --input: a drag to the right across the middle of the canvas, then W held for half a second. Reports which way
// the view turned (+1: to the right, which is the site's convention: the world follows the pointer) and how far
// the camera moved while W was down.
async function inputTest(){const cv=rd&&rd.domElement,cam=window.__probeCam;if(!cv||!cam)return null;
 const V=THREE.Vector3,fwd=()=>{const f=new V();cam.getWorldDirection(f);return f;},pos=()=>cam.getWorldPosition(new V());
 const frames2=n=>new Promise(r=>{let k=0;const f=()=>{if(++k>=n)r();else requestAnimationFrame(f);};requestAnimationFrame(f);});
 const x0=cv.clientWidth/2,y0=cv.clientHeight/2,o={bubbles:true,cancelable:true,pointerId:7,pointerType:'mouse',isPrimary:true};
 const yaw=(a,b)=>-new V().crossVectors(a,b).dot(cam.up);   // + when the view has turned right, about the camera's own up
 // first how far it turns by itself over the same number of frames (a spinning habitat turns with you)
 const b0=fwd();await frames2(12);const drift=yaw(b0,fwd());
 const f0=fwd();cv.dispatchEvent(new PointerEvent('pointerdown',{...o,clientX:x0,clientY:y0,button:0,buttons:1}));
 for(let i=1;i<=8;i++){cv.dispatchEvent(new PointerEvent('pointermove',{...o,clientX:x0+i*10,clientY:y0,button:-1,buttons:1}));await frames2(1);}
 cv.dispatchEvent(new PointerEvent('pointerup',{...o,clientX:x0+80,clientY:y0,button:0,buttons:0}));await frames2(4);
 const turn=yaw(f0,fwd())-drift;
 const p0=pos();dispatchEvent(new KeyboardEvent('keydown',{key:'w',bubbles:true}));await new Promise(r=>setTimeout(r,500));
 dispatchEvent(new KeyboardEvent('keyup',{key:'w',bubbles:true}));await frames2(3);
 return {turn:Math.abs(turn)<1e-4?0:Math.sign(turn),wMoved:Math.round(pos().distanceTo(p0)*10)/10};}
async function finish(timedOut){if(INPUT&&!timedOut){try{window.__probeInput=await inputTest();}catch(e){window.__probeInput={error:String(e)};}}
 if(SHOTPORT&&rd){wantShot=true;await new Promise(r=>{const w=()=>shotTaken?r():setTimeout(w,40);w();setTimeout(r,2000);});}
try{const out={timedOut,readyMs:readyAt?Math.round(readyAt-t0):null};const IZ=window._iz||{};for(const k of ['details','cull','res','fps','IZ','loadMs','lotList','doorList','artPrints'])if(window['_'+k]===undefined&&IZ[k]!==undefined)window['_'+k]=IZ[k];
 out.errors=((document.getElementById('errs')||{}).textContent||'')+(window.__probeErrs.length?' | early: '+window.__probeErrs.join('; '):'');out.three=window.THREE&&THREE.REVISION;
 out.load=(window.LOAD||(typeof LOAD!=='undefined'?LOAD:null)||{}).times||null;out.loadMs=window._loadMs||null;
 out.details=window._details||null;out.hash=location.hash;out.input=window.__probeInput||null;out.cull=window._cull||null;out.res=window._res&&window._res.cur;out.fps=window._fps;
 if(window._IZ&&window._IZ.REG){const B=Object.values(window._IZ.REG).map(r=>r.box);out.atlasRegions=B.length;out.atlasMaxY=Math.max(...B.map(b=>b[1]+b[3]));out.atlasMaxX=Math.max(...B.map(b=>b[0]+b[2]));}
 if(rd&&sc){const inf=rd.info;let n=0,inst=0,cap=0,used=0,pts=0,meshes=0,nocull=0;const mats=new Set();sc.traverse(o=>{n++;if(o.isInstancedMesh){inst++;cap+=o.instanceMatrix.count;used+=o.count;}else if(o.isPoints)pts++;else if(o.isMesh)meshes++;if(o.material)mats.add(o.material);if(o.frustumCulled===false)nocull++;});
  frames=frames.slice(-120);const srt=[...frames].sort((a,b)=>a-b);
  Object.assign(out,{calls:inf.render.calls,triangles:inf.render.triangles,programs:inf.programs.length,textures:inf.memory.textures,objects:n,instanced:inst,instCap:cap,instUsed:used,points:pts,meshes,materials:mats.size,noCull:nocull,
   frameP50:srt.length?+srt[srt.length>>1].toFixed(1):null,frameP95:srt.length?+srt[Math.floor(srt.length*0.95)].toFixed(1):null,canvas:[rd.domElement.width,rd.domElement.height]});}
 if(window._lotList){const L=window._lotList.map(l=>[r2(l.x),r2(l.z),r2(l.w),r2(l.dpt),r2(l.h),Math.round(l.ry*1000)/1000,l.kind,l.fixed?1:0]);out.lots=L.length;out.lotHash=await sha(JSON.stringify(L));}
 // the interface's layout: every visible fixed or absolute element's box, for checking that nothing tramples anything
 try{out.ui=[...document.querySelectorAll('body *')].filter(e=>{const cs=getComputedStyle(e);if(cs.position!=='fixed'&&cs.position!=='absolute'&&e.tagName!=='BUTTON'&&!['timebar','compass','hud','tslider'].includes(e.id))return false;if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0)return false;const r=e.getBoundingClientRect();return r.width>4&&r.height>4&&e.tagName!=='CANVAS';}).map(e=>{const r=e.getBoundingClientRect();return {id:e.id||'',cls:(e.className&&e.className.baseVal===undefined?e.className:'')+'',tag:e.tagName,text:(e.innerText||'').slice(0,40).replace(/\s+/g,' '),x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)};});out.viewport=[innerWidth,innerHeight];}catch(e){out.uiError=String(e);}
 if(window._doorList){out.doors=window._doorList.length;out.doorHash=await sha(JSON.stringify(window._doorList.map(d=>Array.isArray(d)?d.map(v=>typeof v==='number'?r2(v):v):d)));}
 rep(out);}catch(e){rep({probeError:String(e)});}}})();</script>"""

EXPOSE = ("window._lots=lots.filter(l=>!l.fixed).length;",
          "window._lots=lots.filter(l=>!l.fixed).length;window._lotList=lots;window._doorList=doors;")   # only needed for pages older than the stage split


def free_port():
    """A port nobody is using right now: ask the OS for one. Seed-derived ports collided (mordor and minastirith
    are both 3019) and a crashed run could leave one held."""
    with socket.socket() as so:
        so.bind(("127.0.0.1", 0))
        return so.getsockname()[1]


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
    ap.add_argument("--port", type=int, default=0, help="server port (default: a free one)")
    ap.add_argument("--json", help="write the full report here")
    ap.add_argument("--query", default="", help="extra URL query, e.g. city=iziz-b")
    ap.add_argument("--hash", default="", help="URL hash, e.g. v=0,720,620,0,20,0&t=12")
    ap.add_argument("--shot", help="save a JPEG of the rendered canvas here (taken just before the report)")
    ap.add_argument("--size", default="1600,900", help="browser window size")
    ap.add_argument("--quiet", action="store_true")
    ap.add_argument("--settle", type=float, default=0, help="seconds more to let it run once it is ready (to catch something part-way through)")
    ap.add_argument("--input", action="store_true", help="after it settles, drag right and hold W; report which way the view turned and how far W moved it")
    ap.add_argument("--no-build", action="store_true", help="do not regenerate src/*/build.js first (the test runner checks it instead)")
    ap.add_argument("--expect", help="golden JSON (tests/golden/iziz-<seed>.json): exit 2 if the layout fingerprint differs")
    ap.add_argument("--save-golden", help="write the layout fingerprint to this golden JSON")
    a = ap.parse_args()

    src = open(a.page, encoding="utf-8").read()
    if EXPOSE[0] in src:
        src = src.replace(EXPOSE[0], EXPOSE[1])
    # the hook goes straight after three.js is loaded, so it can wrap the renderer; a page with no three.js
    # (the front page, the prose pages) gets it at the top of <head> and is only checked for errors
    m3 = re.search(r'<script src="[^"]*three[^"]*"></script>', src)
    if m3:
        cut = m3.end()
    else:
        mh = re.search(r"<head[^>]*>", src)
        cut = mh.end() if mh else 0
    if not a.port:
        a.port = free_port()
    shot_port = free_port() if a.shot else 0
    src = src[:cut] + PROBE.replace("WAIT", str(a.wait * 1000)).replace("INPUT", "true" if a.input else "false").replace("SETTLE", str(int(a.settle * 1000))).replace("SHOTPORT", str(shot_port)) + src[cut:]

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
    srv = cfg.get("server", {})
    lines = [f'[server]\nhost="127.0.0.1"\nport={a.port}\nlog_requests=true\n']
    if srv.get("scenes"):      # the scene list the pages' menagerie menu reads, so the probe exercises it too
        lines.append(f'scenes={json.dumps(srv["scenes"])}\nname={json.dumps(srv.get("name", "World Menagerie"))}\n')
    for r in cfg.get("route", []):
        if not r.get("enabled", True):
            continue
        f = page if r["path"] == "/" else os.path.join(ROOT, r["file"])
        al = json.dumps(r.get("aliases", []))
        extra = ""
        if r.get("scene"):
            extra = (f'scene=true\nkind={json.dumps(r.get("kind", "scene"))}\n'
                     f'blurb={json.dumps(r.get("blurb", ""))}\n')
        lines.append(f'[[route]]\npath={json.dumps(r["path"])}\naliases={al}\nfile={json.dumps(f)}\n{extra}')
    for m in cfg.get("mount", []):
        if m.get("enabled", True):
            lines.append(f'[[mount]]\nprefix={json.dumps(m["prefix"])}\ndir={json.dumps(os.path.join(ROOT, m["dir"]))}\n')
    toml = os.path.join(work, "site.toml")
    open(toml, "w").write("\n".join(lines))

    if not a.no_build:
        subprocess.run([sys.executable, os.path.join(ROOT, "tools", "build-page.py")], stdout=subprocess.DEVNULL)   # build.js current
    shot_srv = None
    if a.shot:
        import http.server, threading, base64
        shot_path = os.path.abspath(a.shot)
        class ShotHandler(http.server.BaseHTTPRequestHandler):
            def do_POST(self):
                body = self.rfile.read(int(self.headers.get("Content-Length", "0"))).decode()
                if body.startswith("data:image/jpeg;base64,"):
                    open(shot_path, "wb").write(base64.b64decode(body.split(",", 1)[1]))
                self.send_response(204); self.end_headers()
            def log_message(self, *args):
                pass
        shot_srv = http.server.HTTPServer(("127.0.0.1", shot_port), ShotHandler)
        threading.Thread(target=shot_srv.serve_forever, daemon=True).start()
    log = open(os.path.join(work, "server.log"), "w+")
    srv = subprocess.Popen([sys.executable, os.path.join(ROOT, "server.py"), "--config", toml], stderr=log, stdout=subprocess.DEVNULL)
    time.sleep(0.8)
    url = f"http://127.0.0.1:{a.port}/?debug" + (f"&seed={a.seed}" if a.seed else "") + (f"&{a.query}" if a.query else "") + (f"#{a.hash}" if a.hash else "")
    fx = subprocess.Popen([ff, "--headless", "--no-remote", f"--window-size={a.size}", "--profile", profile, url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
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
                time.sleep(1.5)   # let the screenshot POST land
                break
    finally:
        if shot_srv:
            shot_srv.shutdown()
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
    if a.shot:
        print("screenshot:", a.shot if os.path.exists(a.shot) else "NOT saved")
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
        if report.get("input"):
            print("input:", json.dumps(report["input"]))
        if report.get("hash"):
            print("hash:", report["hash"])
    fp = {k: report.get(k) for k in ("lots", "lotHash", "doors", "doorHash")}
    if report.get("timedOut"):
        print(f"timed out: the page had not finished building after {a.wait}s")
    if a.save_golden:
        fp["page"] = os.path.basename(a.page)
        fp["seed"] = a.seed
        if a.query:
            fp["query"] = a.query
        if a.hash:
            fp["hash"] = a.hash
        json.dump(fp, open(a.save_golden, "w"), indent=1)
        print("golden written:", a.save_golden)
    if a.expect:
        want = json.load(open(a.expect))
        bad = [k for k in ("lotHash", "doorHash") if want.get(k) != fp.get(k)]
        if bad or not fp.get("lotHash"):
            print(f"LAYOUT CHANGED vs {a.expect}: {', '.join(bad) or 'no fingerprint from page'}")
            return 2
        print(f"layout matches {a.expect}")
    return 1 if report.get("errors") else 0


if __name__ == "__main__":
    sys.exit(main())
