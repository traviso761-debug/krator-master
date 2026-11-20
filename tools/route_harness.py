#!/usr/bin/env python3
"""Stage 1 Deterministic Route Harness (GRAPHICS-TERRAIN-PROPOSAL.md Section 7 A1, Section 9.2, Section 11 Stage 1).

Runs a deterministic 4-stop route on one track (openworld, ancientsvalley, or interior) across three hours
(12:00 noon, 16:20 late afternoon, 22:00 night), recording at each stop:
  - frame time (median_ms, p95_ms, and gpu_median_ms via EXT_disjoint_timer_query_webgl2 when exposed)
  - draw calls and rendered triangles
  - JS heap MB (performance.memory when exposed)
  - estimated VRAM MB (texture bytes + unique geometry/instance buffer bytes via harness.VRAM_JS)
  - active linked-program sampler count (max and top program via harness.SAMPLERS_JS)
  - worst plant-to-drawn-ground height error (m) within 180 m of the stop (core/drawn KDRAWN / TERRAIN.heightDrawn)
  - optional screenshots per (stop, hour)

Usage:
  # Software GL (container / CI):
  python3 tools/route_harness.py --track openworld --out route-openworld.json --md route-openworld.md
  python3 tools/route_harness.py --track ancientsvalley --out route-av.json --md route-av.md

  # Hardware GPU lanes (Arc / RTX):
  KRATOR_GL=gpu python3 tools/harness.py lock --lane arc -- python3 tools/route_harness.py --track ancientsvalley --shots shots/route-av-arc --out route-av-arc.json
  KRATOR_GL=gpu python3 tools/harness.py lock --lane rtx -- python3 tools/route_harness.py --track ancientsvalley --shots shots/route-av-rtx --out route-av-rtx.json

  # Compare against a recorded baseline (exits 1 if calls, tris, samplers, vram_mb, or plant_err regress past tolerance):
  python3 tools/route_harness.py --compare baseline.json current.json
"""
import argparse, asyncio, json, os, statistics, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import harness as H  # noqa: E402

TRACKS = {
    'openworld': {
        'page': 'openworld/oidong-highrift/dist/oidong-highrift.html',
        'here': 'openworld/oidong-highrift',
        'ready_js': "typeof START==='object'&&START&&START.ready&&typeof CAM==='object'&&CAM",
        'stops': [
            {'id': 'city_block', 'label': 'Longsong Shar village street level', 'kind': 'openworld_hamlet', 'hamlet': 'east', 'dx': 28.0, 'dz': 18.0, 'agl': 2.2, 'ty': 3.0},
            {'id': 'forest_edge', 'label': 'Oidong Valley forest edge', 'kind': 'openworld_xz', 'ex': -266940.0, 'ez': -41910.0, 'agl': 4.5, 'tx': -267060.0, 'tz': -42020.0, 'ty': 8.0},
            {'id': 'door_transition', 'label': 'Longsong Nub lane-to-door threshold', 'kind': 'openworld_hamlet', 'hamlet': 'west', 'dx': 12.0, 'dz': -10.0, 'agl': 1.8, 'ty': 2.2},
            {'id': 'water_ground', 'label': 'Biruk al-Ghaym river & valley water edge', 'kind': 'openworld_xz', 'ex': -154620.0, 'ez': -25380.0, 'agl': 3.2, 'tx': -154760.0, 'tz': -25490.0, 'ty': 0.5},
        ],
    },
    'ancientsvalley': {
        'page': 'biomes/ancientsvalley/dist/ancientsvalley.html',
        'here': 'biomes/ancientsvalley',
        'ready_js': None,
        'stops': [
            {'id': 'city_block', 'label': 'A residential street (city block at street level)', 'kind': 'av_preset', 'preset': 'A residential street'},
            {'id': 'forest_edge', 'label': 'A park gone feral (forest edge)', 'kind': 'av_preset', 'preset': 'A park gone feral'},
            {'id': 'tower_door', 'label': 'Tower entrance threshold (outside to inside)', 'kind': 'av_door', 'fallback': 'Among the towers'},
            {'id': 'water_ground', 'label': 'The core from the water (ground at the water)', 'kind': 'av_preset', 'preset': 'The core from the water'},
        ],
    },
    'interior': {
        'page': 'kits/ancients-interiors/dist/ancients-interiors.html',
        'here': 'kits/ancients-interiors',
        'ready_js': None,
        'stops': [
            {'id': 'hall_entry', 'label': 'Ship hall entry threshold', 'kind': 'preset_idx', 'idx': 0},
            {'id': 'corridor_door', 'label': 'Corridor doorway look-through', 'kind': 'preset_idx', 'idx': 1},
            {'id': 'cabin_room', 'label': 'Furnished cabin interior', 'kind': 'preset_idx', 'idx': 2},
            {'id': 'bridge_deck', 'label': 'Main hall / bridge deck', 'kind': 'preset_idx', 'idx': 3},
        ],
    },
}

DRAWN_SRC_PATH = os.path.join(ROOT, 'core', 'drawn', '10-core-drawn.js')

STOP_EVAL_JS = r"""async ({stop, hours, nFrames, drawnSrc}) => {
  const findRenderer = () => {
    try { if (typeof renderer !== 'undefined' && renderer) return renderer; } catch (e) {}
    try { if (typeof HOST !== 'undefined' && HOST && HOST.renderer) return HOST.renderer; } catch (e) {}
    return (window.HOST && HOST.renderer) || window.renderer || (window._api && _api.renderer) || null;
  };
  const findSceneCam = () => {
    let sc = null, cam = null;
    try { if (typeof scene !== 'undefined' && scene && scene.isScene) sc = scene; } catch (e) {}
    try { if (typeof camera !== 'undefined' && camera && camera.isCamera) cam = camera; } catch (e) {}
    const H = (typeof HOST !== 'undefined' && HOST) || window.HOST || {};
    sc = sc || H.scene || window.scene || (window._api && _api.scene) || null;
    cam = cam || H.camera || window.camera || (window._api && _api.camera) || null;
    return {sc, cam};
  };
  const R = findRenderer();
  const {sc, cam} = findSceneCam();
  if (!R || !sc || !cam) return {error: 'missing renderer, scene, or camera'};

  const pumpOpenWorld = () => {
    if (typeof START !== 'undefined' && START && typeof START.pump === 'function') {
      for (let p = 0; p < 14; p++) {
        if (typeof CAM !== 'undefined' && CAM.update) CAM.update(0.016);
        START.pump(true);
        if (typeof TERRAIN !== 'undefined' && TERRAIN.pending() === 0 && typeof NURSERY !== 'undefined' && NURSERY.queued() === 0) break;
      }
      if (typeof FLORA !== 'undefined' && FLORA.draw) FLORA.draw();
      if (typeof SKY !== 'undefined' && SKY.follow) SKY.follow();
      if (typeof PLACES !== 'undefined' && PLACES.update) PLACES.update();
      if (typeof TOWNS_DRAW !== 'undefined' && TOWNS_DRAW.update) TOWNS_DRAW.update();
    }
    const H = (typeof HOST !== 'undefined' && HOST) || window.HOST;
    if (H && Array.isArray(H.TICKS)) {
      for (let s = 0; s < 4; s++) for (const fn of H.TICKS) { try { fn(0.016, performance.now() / 1000); } catch (e) {} }
    }
  };

  // 1. Position camera at deterministic stop
  let pose = null;
  if (stop.kind === 'openworld_hamlet') {
    const S = WORLD_DATA.sites.sites.find(s => s.name === 'Longsong') || WORLD_DATA.sites.sites[0];
    const H = (S.hamlets || []).find(h => h.id.endsWith(stop.hamlet)) || S.hamlets[0];
    const tx = H.site.x, tz = H.site.z, ex = tx + stop.dx, ez = tz + stop.dz;
    const ghE = WORLD.H(ex, ez, 0), ghT = WORLD.H(tx, tz, 0);
    const ey = ghE + stop.agl, ty = ghT + stop.ty;
    const dx = tx - ex, dz = tz - ez, dist = Math.hypot(dx, dz) || 1;
    CAM.setView(ex, ez, stop.agl, Math.atan2(dx, dz), Math.atan2(ty - ey, dist));
    pumpOpenWorld();
    pose = {eye: [+ex.toFixed(1), +ey.toFixed(1), +ez.toFixed(1)], target: [+tx.toFixed(1), +ty.toFixed(1), +tz.toFixed(1)]};
  } else if (stop.kind === 'openworld_xz') {
    const ex = stop.ex, ez = stop.ez, tx = stop.tx, tz = stop.tz;
    const ghE = WORLD.H(ex, ez, 0), ghT = WORLD.H(tx, tz, 0);
    const ey = ghE + stop.agl, ty = ghT + stop.ty;
    const dx = tx - ex, dz = tz - ez, dist = Math.hypot(dx, dz) || 1;
    CAM.setView(ex, ez, stop.agl, Math.atan2(dx, dz), Math.atan2(ty - ey, dist));
    pumpOpenWorld();
    pose = {eye: [+ex.toFixed(1), +ey.toFixed(1), +ez.toFixed(1)], target: [+tx.toFixed(1), +ty.toFixed(1), +tz.toFixed(1)]};
  } else if (stop.kind === 'av_preset' || stop.kind === 'av_door') {
    let v = null;
    if (stop.kind === 'av_door') {
      if (typeof AVL !== 'undefined' && AVL && Array.isArray(AVL.doors) && AVL.doors.length) {
        const d = AVL.doors[0];
        if (Number.isFinite(d.x) && Number.isFinite(d.y) && Number.isFinite(d.z) && Number.isFinite(d.nx) && Number.isFinite(d.nz)) {
          v = [d.x + d.nx * 5.0, d.y + 1.65, d.z + d.nz * 5.0, d.x - d.nx * 3.0, d.y + 1.55, d.z - d.nz * 3.0];
        }
      }
      if (!v && typeof AV_HOUSE !== 'undefined' && AV_HOUSE && AV_HOUSE.H && AV_HOUSE.H.door) {
        const d = AV_HOUSE.H.door;
        if (Number.isFinite(d.x) && Number.isFinite(d.y) && Number.isFinite(d.z)) {
          v = [d.x, d.y + 1.65, d.z - 5.0, d.x, d.y + 1.50, d.z + 2.0];
        }
      }
    }
    if (!v && typeof STAGE !== 'undefined' && STAGE.views) {
      const V = STAGE.views();
      const k = stop.preset || stop.fallback;
      v = V[k] && (V[k].cam || V[k]);
    }
    if (!v) {
      const btns = [...document.querySelectorAll('#ui button')];
      const b = btns.find(x => x.textContent.trim() === (stop.preset || stop.fallback)) || btns[0];
      if (b) b.click();
    } else {
      cam.position.set(v[0], v[1], v[2]);
      if (typeof controls !== 'undefined' && controls && controls.target) {
        controls.target.set(v[3], v[4], v[5]);
        controls.update();
      } else {
        cam.lookAt(v[3], v[4], v[5]);
      }
    }
    cam.updateMatrixWorld(true);
    pose = {eye: [+cam.position.x.toFixed(1), +cam.position.y.toFixed(1), +cam.position.z.toFixed(1)]};
  } else if (stop.kind === 'preset_idx') {
    const btns = [...document.querySelectorAll('#ui button, button[data-view]')];
    if (btns.length) btns[Math.min(stop.idx || 0, btns.length - 1)].click();
    cam.updateMatrixWorld(true);
    pose = {eye: [+cam.position.x.toFixed(1), +cam.position.y.toFixed(1), +cam.position.z.toFixed(1)]};
  }

  // 2. Plant-to-drawn-ground grounding error within 220 m of camera
  let plantGround = {checked: 0, worst_m: 0.0, p95_m: 0.0, source: 'none'};
  try {
    let drawnFn = null, srcName = 'none';
    if (typeof TERRAIN !== 'undefined' && TERRAIN && typeof TERRAIN.heightDrawn === 'function') {
      drawnFn = (x, z) => TERRAIN.heightDrawn(x, z);
      srcName = 'TERRAIN.heightDrawn';
    } else if (typeof GROUND !== 'undefined' && GROUND && typeof GROUND.meshH === 'function') {
      drawnFn = (x, z) => GROUND.meshH(x, z);
      srcName = 'GROUND.meshH';
    } else {
      if (typeof KDRAWN === 'undefined' && drawnSrc) (0, eval)(drawnSrc);
      const K = window.KDRAWN || (typeof KDRAWN !== 'undefined' ? KDRAWN : null);
      if (K) {
        let srcs = K.sources || [];
        if (!srcs.length) {
          if (!window.__routeDrawnSrcs) {
            sc.updateMatrixWorld(true);
            const auto = [];
            sc.traverse(o => {
              if (o.isMesh && !o.isInstancedMesh && o.visible !== false && ((o.userData && o.userData.ground) || /^(ground|terrain)/i.test(o.name || ''))) {
                const s = K.fromObject(o);
                if (s) auto.push(s);
              }
            });
            window.__routeDrawnSrcs = auto;
          }
          srcs = window.__routeDrawnSrcs;
        }
        if (srcs.length) {
          srcName = 'KDRAWN (' + srcs.length + ' mesh)';
          drawnFn = (x, z) => {
            let best = null;
            for (const s of srcs) { const v = s.h(x, z); if (v !== null && (best === null || v > best)) best = v; }
            return best;
          };
        }
      }
    }
    if (drawnFn) {
      const cx = cam.position.x, cz = cam.position.z, r2 = 220 * 220;
      const errs = [];
      // Open-world FLORA records store {x, y: WORLD.H(x,z) - 0.3, z}; compare intended base height (r.y + 0.3) vs drawn terrain
      if (typeof FLORA !== 'undefined' && FLORA && FLORA.tiles && FLORA.tiles.size > 0) {
        for (const t of FLORA.tiles.values()) {
          for (const rec of (t.recs || [])) {
            if (errs.length >= 400) break;
            const dx = rec.x - cx, dz = rec.z - cz;
            if (dx*dx + dz*dz > r2) continue;
            const gh = drawnFn(rec.x, rec.z);
            if (gh != null && Number.isFinite(gh)) {
              const err = Math.abs((rec.y + 0.3) - gh);
              if (err < 40.0) errs.push(err);
            }
          }
          if (errs.length >= 400) break;
        }
      }
      if (!errs.length) {
        sc.updateMatrixWorld(true);
        sc.traverse(o => {
          if (!o.isInstancedMesh || !o.visible || o.count <= 0 || errs.length >= 400) return;
          const ud = o.userData || {};
          const nm = String(o.name || ud.item || ud.tag || ud.kind || ud.inspectLabel || ud.flora || '').toLowerCase();
          const isPlant = /tree|shrub|palm|fern|bamboo|cedar|pine|birch|grass|flora|herb|bush|kauri|gum|larch/.test(nm) || !!ud.kit || !!ud.flora;
          if (!isPlant) return;
          if (o.geometry) {
            if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
            if (o.geometry.boundingBox && o.geometry.boundingBox.min.y > 1.5) return;
          }
          const m4 = o.matrixWorld.elements, arr = o.instanceMatrix.array;
          const step = Math.max(1, Math.floor(o.count / 60));
          for (let i = 0; i < o.count && errs.length < 400; i += step) {
            const b = i * 16;
            const lx = arr[b + 12], ly = arr[b + 13], lz = arr[b + 14];
            const wx = m4[0]*lx + m4[4]*ly + m4[8]*lz + m4[12];
            const wy = m4[1]*lx + m4[5]*ly + m4[9]*lz + m4[13];
            const wz = m4[2]*lx + m4[6]*ly + m4[10]*lz + m4[14];
            const dx = wx - cx, dz = wz - cz;
            if (dx*dx + dz*dz > r2) continue;
            const gh = drawnFn(wx, wz);
            if (gh != null && Number.isFinite(gh)) {
              const err = Math.abs(wy - gh);
              if (err < 40.0) errs.push(err);
            }
          }
        });
      }
      errs.sort((a, b) => a - b);
      plantGround = {
        checked: errs.length,
        worst_m: errs.length ? +errs[errs.length - 1].toFixed(4) : 0.0,
        p95_m: errs.length ? +errs[Math.floor(errs.length * 0.95)].toFixed(4) : 0.0,
        source: srcName,
      };
    }
  } catch (e) {
    plantGround = {checked: 0, worst_m: 0.0, p95_m: 0.0, source: 'err: ' + String(e).slice(0, 80)};
  }

  // 3. Per-hour frame-time & GPU timer query sweep
  const gl = R.getContext ? R.getContext() : null;
  const tExt = gl && typeof gl.createQuery === 'function' ? gl.getExtension('EXT_disjoint_timer_query_webgl2') : null;
  const setHour = (hr) => {
    try { if (typeof HOST !== 'undefined' && HOST && typeof HOST.sunAt === 'function') HOST.sunAt(hr); } catch (e) {}
    try { if (typeof KCLOCK !== 'undefined' && KCLOCK.setHour) KCLOCK.setHour(hr); } catch (e) {}
    try { if (typeof ATMOS !== 'undefined' && ATMOS.setHour) ATMOS.setHour(hr); } catch (e) {}
    try { if (window._api && typeof _api.setHour === 'function') _api.setHour(hr); } catch (e) {}
    try { if (typeof SKY !== 'undefined' && SKY.follow) SKY.follow(); } catch (e) {}
  };

  const byHour = [];
  for (const hr of hours) {
    setHour(hr);
    if (nFrames > 1) {
      R.render(sc, cam);
      if (gl) gl.finish();
    }

    const cpuMs = [], gpuMs = [];
    for (let f = 0; f < nFrames; f++) {
      let q = null;
      if (tExt) {
        q = gl.createQuery();
        gl.beginQuery(tExt.TIME_ELAPSED_EXT, q);
      }
      const t0 = performance.now();
      R.render(sc, cam);
      if (gl) gl.finish();
      const dt = performance.now() - t0;
      cpuMs.push(dt);
      if (tExt && q) {
        gl.endQuery(tExt.TIME_ELAPSED_EXT);
        const avail = gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE);
        const disj = gl.getParameter(tExt.GPU_DISJOINT_EXT);
        if (avail && !disj) {
          gpuMs.push(gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6);
        }
        gl.deleteQuery(q);
      }
    }
    cpuMs.sort((a, b) => a - b);
    gpuMs.sort((a, b) => a - b);
    const med = (a) => a.length ? +a[Math.floor(a.length * 0.5)].toFixed(2) : null;
    const p95 = (a) => a.length ? +a[Math.min(a.length - 1, Math.floor(a.length * 0.95))].toFixed(2) : null;
    byHour.push({
      hour: hr,
      median_ms: med(cpuMs),
      p95_ms: p95(cpuMs),
      gpu_median_ms: med(gpuMs),
      calls: R.info.render.calls,
      tris: R.info.render.triangles,
    });
  }

  const heapMB = (performance && performance.memory && performance.memory.usedJSHeapSize)
    ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null;

  return {pose, plant_ground: plantGround, heap_mb: heapMB, hours: byHour};
}"""


async def run_route(args):
    from playwright.async_api import async_playwright
    os.environ.setdefault('KRATOR_CHROME', '/usr/bin/chromium')
    cfg = TRACKS[args.track]
    page_abs = os.path.join(ROOT, args.page or cfg['page'])
    hours = [float(x) for x in args.hours.split(',') if x.strip()]
    drawn_src = open(DRAWN_SRC_PATH, encoding='utf-8').read() if os.path.isfile(DRAWN_SRC_PATH) else ''

    # On software GL use modern ANGLE SwiftShader flags and enable precise memory info
    gl_args = list(H.GL_ARGS)
    if not H.is_gpu():
        gl_args = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']
    gl_args.append('--enable-precise-memory-info')

    if args.shots:
        os.makedirs(args.shots, exist_ok=True)

    t_boot0 = time.time()
    async with async_playwright() as p:
        b = await H.launch_chromium(p, gl_args)
        try:
            with H.serve(ROOT) as port:
                pg, errs, ready = await H.open_page(
                    b, page_abs, port, size=args.size, root=ROOT,
                    ready_js=cfg['ready_js']
                )
                if not ready:
                    raise RuntimeError('Page never became ready: ' + page_abs)
                await pg.wait_for_function('!window._texPending', timeout=180000)
                # Pause free-running RAF after boot so deterministic renders & frame timings are clean
                await pg.evaluate("() => { window.__routeOrigRAF = window.requestAnimationFrame; window.requestAnimationFrame = () => 0; }")
                load_s = round(time.time() - t_boot0, 2)
                renderer_str = await pg.evaluate(H.RENDERER_JS)

                stops_out = []
                for st in cfg['stops']:
                    res = await pg.evaluate(STOP_EVAL_JS, {
                        'stop': st,
                        'hours': hours,
                        'nFrames': args.frames,
                        'drawnSrc': drawn_src,
                    })
                    if args.shots and not res.get('error'):
                        for h_entry in res['hours']:
                            hr = h_entry['hour']
                            await pg.evaluate("""(hr) => {
                                try { if (typeof KCLOCK !== 'undefined' && KCLOCK.setHour) KCLOCK.setHour(hr); } catch (e) {}
                                try { if (typeof ATMOS !== 'undefined' && ATMOS.setHour) ATMOS.setHour(hr); } catch (e) {}
                                const R = (window.HOST && HOST.renderer) || (typeof renderer !== 'undefined' ? renderer : null);
                                const sc = (window.HOST && HOST.scene) || (typeof scene !== 'undefined' ? scene : null);
                                const cam = (window.HOST && HOST.camera) || (typeof camera !== 'undefined' ? camera : null);
                                if (R && sc && cam) R.render(sc, cam);
                            }""", hr)
                            fn = os.path.join(args.shots, '%s_%s_h%04.1f.png' % (args.track, st['id'], hr))
                            await pg.screenshot(path=fn)
                            h_entry['shot'] = os.path.relpath(fn, ROOT).replace(os.sep, '/')

                    vram = await pg.evaluate(H.VRAM_JS)
                    samplers = await pg.evaluate(H.SAMPLERS_JS)
                    stops_out.append({
                        'id': st['id'],
                        'label': st['label'],
                        'pose': res.get('pose'),
                        'heap_mb': res.get('heap_mb'),
                        'vram': vram,
                        'samplers_max': samplers['max'] if samplers else None,
                        'samplers_top': samplers['top'][:2] if samplers else [],
                        'plant_ground': res.get('plant_ground'),
                        'hours': res.get('hours', []),
                    })
                    h0 = res.get('hours', [{}])[0]
                    print('stop %-16s  calls=%-5s tris=%-9s med=%s ms  vram=%s MB  samplers=%s  plant_err=%.3f m' % (
                        st['id'], h0.get('calls'), h0.get('tris'), h0.get('median_ms'),
                        vram['totalMB'] if vram else '-', samplers['max'] if samplers else '-',
                        (res.get('plant_ground') or {}).get('worst_m', 0.0)), flush=True)

                await pg.close()
        finally:
            await b.close()

    report = {
        'format': 'krator-route-baseline',
        'version': 1,
        'track': args.track,
        'page': os.path.relpath(page_abs, ROOT).replace(os.sep, '/'),
        'page_bytes': os.path.getsize(page_abs),
        'renderer': renderer_str,
        'lane': os.environ.get('KRATOR_GPU_LANE_HELD') or ('gpu' if H.is_gpu() else 'software'),
        'size': args.size,
        'load_s': load_s,
        'stops': stops_out,
    }
    if args.out:
        os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
        with open(args.out, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(report, f, indent=2)
        print('wrote', args.out)
    if args.md:
        os.makedirs(os.path.dirname(os.path.abspath(args.md)), exist_ok=True)
        with open(args.md, 'w', encoding='utf-8', newline='\n') as f:
            f.write(to_markdown(report))
        print('wrote', args.md)
    return report


def to_markdown(rep):
    lines = [
        '# Deterministic Route Report — `%s`' % rep['track'],
        '',
        '- **Page:** `%s` (`%.2f MB`)' % (rep['page'], rep['page_bytes'] / 1048576.0),
        '- **Renderer:** `%s` (lane `%s`, `%s`, boot `%.2f s`)' % (rep['renderer'], rep['lane'], rep['size'], rep['load_s']),
        '',
        '| Stop | Hour | Calls | Triangles | Median (ms) | p95 (ms) | Heap (MB) | VRAM Est. (MB) | Tex / Geom (MB) | Max Samplers | Worst Plant Err (m) |',
        '|---|---:|---:|---:|---:|---:|---:|---:|---|---:|---:|',
    ]
    for s in rep['stops']:
        vr = s.get('vram') or {}
        pg_err = (s.get('plant_ground') or {}).get('worst_m', 0.0)
        for h in s.get('hours', []):
            lines.append('| `%s` | `%.2f` | `%s` | `%s` | `%s` | `%s` | `%s` | `%s` | `%s / %s` | `%s` | `%.3f` |' % (
                s['id'], h['hour'], h.get('calls'), h.get('tris'), h.get('median_ms'), h.get('p95_ms'),
                s.get('heap_mb') if s.get('heap_mb') is not None else '-',
                vr.get('totalMB', '-'), vr.get('texMB', '-'), vr.get('geomMB', '-'),
                s.get('samplers_max', '-'), pg_err))
    lines.append('')
    return '\n'.join(lines)


def compare_baselines(base_path, cur_path, tol_pct=10.0, plant_tol_m=0.25):
    """Compare a current route JSON against a baseline JSON; returns (ok, messages)."""
    B = json.load(open(base_path, encoding='utf-8'))
    C = json.load(open(cur_path, encoding='utf-8'))
    b_stops = {s['id']: s for s in B.get('stops', [])}
    msgs, fails = [], []
    for cs in C.get('stops', []):
        sid = cs['id']
        bs = b_stops.get(sid)
        if not bs:
            continue
        # Samplers hard ceiling: must not exceed baseline or 15
        bs_sm, cs_sm = bs.get('samplers_max') or 0, cs.get('samplers_max') or 0
        if cs_sm > max(bs_sm, 15):
            fails.append('%s: samplers_max rose %d -> %d' % (sid, bs_sm, cs_sm))
        # VRAM ceiling
        bs_vr = (bs.get('vram') or {}).get('totalMB') or 0.0
        cs_vr = (cs.get('vram') or {}).get('totalMB') or 0.0
        if bs_vr > 0 and cs_vr > bs_vr * (1.0 + tol_pct / 100.0):
            fails.append('%s: vram_mb rose %.2f -> %.2f MB (> +%.1f%%)' % (sid, bs_vr, cs_vr, tol_pct))
        # Calls & triangles at first hour
        if bs.get('hours') and cs.get('hours'):
            bh, ch = bs['hours'][0], cs['hours'][0]
            for k in ('calls', 'tris'):
                bv, cv = bh.get(k) or 0, ch.get(k) or 0
                if bv > 0 and cv > bv * (1.0 + tol_pct / 100.0):
                    fails.append('%s: %s rose %d -> %d (> +%.1f%%)' % (sid, k, bv, cv, tol_pct))
        # Plant grounding error
        bp = (bs.get('plant_ground') or {}).get('worst_m') or 0.0
        cp = (cs.get('plant_ground') or {}).get('worst_m') or 0.0
        if cp > max(bp + plant_tol_m, 1.0):
            fails.append('%s: worst_plant_ground_err_m rose %.3f -> %.3f m' % (sid, bp, cp))
        msgs.append('%s: calls %s->%s, vram %s->%s MB, samplers %s->%s, plant_err %.3f->%.3f m' % (
            sid,
            bs['hours'][0]['calls'] if bs.get('hours') else '-',
            cs['hours'][0]['calls'] if cs.get('hours') else '-',
            bs_vr, cs_vr, bs_sm, cs_sm, bp, cp))
    return len(fails) == 0, msgs, fails


def main(argv=None):
    ap = argparse.ArgumentParser(description='Krator Stage 1 Deterministic Route Harness')
    ap.add_argument('--track', choices=sorted(TRACKS), default='openworld')
    ap.add_argument('--page', default='', help='Override built HTML path')
    ap.add_argument('--hours', default='12.0,16.33,22.0')
    ap.add_argument('--frames', type=int, default=5)
    ap.add_argument('--size', default='960x540')
    ap.add_argument('--shots', default='')
    ap.add_argument('--out', default='')
    ap.add_argument('--md', default='')
    ap.add_argument('--compare', nargs=2, metavar=('BASELINE', 'CURRENT'))
    args = ap.parse_args(argv)

    if args.compare:
        ok, msgs, fails = compare_baselines(args.compare[0], args.compare[1])
        for m in msgs:
            print('  info ', m)
        for f in fails:
            print('  FAIL ', f)
        print('route compare:', 'PASS' if ok else 'FAIL (%d regression(s))' % len(fails))
        return 0 if ok else 1

    asyncio.run(run_route(args))
    return 0


if __name__ == '__main__':
    sys.exit(main())
