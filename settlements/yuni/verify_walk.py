#!/usr/bin/env python3
"""Scripted walk-through for the working doors and interiors (76-doors.js).

Loads a target headless, walks up to a door, lets it open, takes a shot through the doorway,
walks in, takes a shot inside, climbs the stair if there is one, then a cutaway from above.
Prints window._doors.stats() after each step and the error panel at the end.

  python3 verify_walk.py yuni-assets.html [--asset mid_washed_house] [--variant 1] [--out shots] [--hour 21]
"""
import argparse, asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
from harness import verify_page, Abort

PICK = """([key, v])=>{ const b=FIX.buildings.find(b=>b.asset===key && b.variant===v && _interiors.plan(b.id));
  if(!b) return null; const P=_interiors.plan(b.id); const d=P.doors.find(d=>d.kind==='exterior'); return {bid:b.id, door:d.id, stairs:P.stairs.length,
  rooms:P.rooms.map(r=>r.kind+'@'+r.lvl), furn:P.furniture.length}; }"""

async def hold(pg, key, ms):
    """walk for ms of SIMULATED time at a fixed step (headless frames are far too slow for real time)"""
    await pg.evaluate("([k,s])=>_doors.sim(k,s)", [key, ms/1000.0])

async def run(a):
    os.makedirs(a.out, exist_ok=True)
    async with verify_page(a.html, here=HERE, size="1100x720", query=a.query, settle_ms=0) as V:
        pg = V.page
        pg.set_default_timeout(300000)
        if a.hour is not None:
            await pg.evaluate("(h)=>{ _api.skySetHour(h); if(window._sky && _sky.setRate) _sky.setRate(0); }", a.hour)
        info = await pg.evaluate(PICK, [a.asset, a.variant])
        print("target:", json.dumps(info))
        if not info:
            print("no planned interior for", a.asset, a.variant); raise Abort(2)
        async def stats(tag):
            s = await pg.evaluate("()=>_doors.stats()")
            print(f"[{tag}]", json.dumps(s))
            return s
        async def shot(tag):
            path = os.path.join(a.out, f"walk-{a.asset}-{a.variant}-{tag}.png")
            await V.shot(path, view=tag); print("shot", path)
        await pg.evaluate("(id)=>_doors.walkTo(id)", info["door"])
        await pg.wait_for_timeout(2500)
        await hold(pg, "w", 700)                       # step up to the door: it opens
        await pg.wait_for_timeout(2500)
        await stats("at the door"); await shot("1-doorway")
        await hold(pg, "w", 1800)                      # walk in
        await pg.evaluate("()=>{ _dbg.ctl.theta += 0.9; _dbg.ctl.phi = 1.62; }")
        await pg.wait_for_timeout(1500)
        s = await stats("inside")
        await shot("2-inside")
        await pg.evaluate("()=>{ _dbg.ctl.theta -= 0.9; }")
        await pg.evaluate("()=>{ _dbg.ctl.theta += Math.PI; _dbg.applyCam(); }")
        await pg.wait_for_timeout(900); await shot("3-inside-looking-out")
        if info["stairs"]:
            await pg.evaluate("""(bid)=>{ const P=_interiors.plan(bid), s=P.stairs[0], g=P.groups[s.group], b=FIX.byId[bid];
              const foot=g.RF(s.u, s.va-0.5), top=g.RF(s.u, s.vb), W=_doors.WALK;
              const f=[b.x+foot[0]*Math.cos(b.yaw)+foot[1]*Math.sin(b.yaw), b.z-foot[0]*Math.sin(b.yaw)+foot[1]*Math.cos(b.yaw)];
              const t=[b.x+top[0]*Math.cos(b.yaw)+top[1]*Math.sin(b.yaw), b.z-top[0]*Math.sin(b.yaw)+top[1]*Math.cos(b.yaw)];
              W.x=f[0]; W.z=f[1]; W.bid=bid; W.lvl=0; _dbg.ctl.theta=Math.atan2(f[1]-t[1], f[0]-t[0]); _dbg.ctl.phi=1.45; }""", info["bid"])
            await hold(pg, "w", 4200)
            await pg.evaluate("()=>{ _dbg.ctl.theta += 2.4; _dbg.ctl.phi = 1.7; }")
            await pg.wait_for_timeout(800)
            await stats("after the stair"); await shot("4-upstairs")
        ex = await pg.evaluate("(bid)=>JSON.stringify(KRATOR_EXPORT.building(bid), null, 1)", info["bid"])
        xp = os.path.join(a.out, f"export-{a.asset}-{a.variant}.json"); open(xp, "w", encoding="utf-8", newline="\n").write(ex); print("export", xp, len(ex), "bytes")
        await pg.evaluate("()=>{ _doors.walk(false); _doors.cutaway(true); }")
        await pg.evaluate("(bid)=>{ const b=FIX.byId[bid]; _dbg.setView(b.x-b.w*0.6, b.y+Math.max(b.w,b.d)*1.1, b.z-b.d*0.9, b.x, b.y, b.z); }", info["bid"])
        await pg.wait_for_timeout(3500)
        await stats("cutaway"); await shot("5-cutaway")
    return V.exit()

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("html"); ap.add_argument("--asset", default="mid_washed_house"); ap.add_argument("--variant", type=int, default=1)
    ap.add_argument("--out", default="shots"); ap.add_argument("--hour", type=float, default=None)
    ap.add_argument("--query", default="", help="appended to the page URL, e.g. ?mat=proc for the look before the material library")
    sys.exit(asyncio.run(run(ap.parse_args())))
