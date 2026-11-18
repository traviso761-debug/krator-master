"""Deterministic baker for Krator's canonical 3D/2D mini-globe & system maps.

Runs the full 2048x1024 + Scale Model 5.1 GPU synthesis in headless Chromium once,
captures pure unvignetted equirectangular rasters + quantized elevation/climate grids
+ curated pins, updates maps.json['krator'] and pics.json['krator'], and writes
krator_baked.json for embedding into dist/krator-system.html via build.py.

    python3 bake_krator.py <path/to/krator-globe.html>
"""
import base64
import http.server
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile
import threading
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_SRC = os.path.join(HERE, 'krator-globe.html')


def globe_from_pil(im_rgb, centre_u, centre_lat=0.0, N=260):
    """Same orthographic limb-lit render as build.py's globe_from()."""
    m = np.asarray(im_rgb.convert('RGB'), dtype=np.float32) / 255.0
    H, W, _ = m.shape
    y, x = np.mgrid[0:N, 0:N]
    x = (x + 0.5) / N * 2.0 - 1.0
    y = 1.0 - (y + 0.5) / N * 2.0
    r2 = x * x + y * y
    z = np.sqrt(np.clip(1.0 - r2, 0.0, 1.0))
    c, s = np.cos(np.radians(centre_lat)), np.sin(np.radians(centre_lat))
    yy = y * c + z * s
    zz = -y * s + z * c
    lat = np.arcsin(np.clip(yy, -1.0, 1.0))
    lon = np.arctan2(x, zz)
    u = (centre_u + lon / (2.0 * np.pi)) % 1.0
    v = 0.5 - lat / np.pi
    alb = m[np.clip((v * H).astype(int), 0, H - 1), np.clip((u * W).astype(int), 0, W - 1)]
    L = np.array([-0.62, 0.45, 0.64])
    L /= np.linalg.norm(L)
    shade = np.clip(x * L[0] + y * L[1] + z * L[2], 0.0, 1.0) * 1.05 + 0.05
    col = np.clip(alb * shade[..., None] * (np.clip(z, 0.0, 1.0) ** 0.12)[..., None], 0.0, 1.0)
    rim = np.clip(1.0 - z, 0.0, 1.0) ** 3 * 0.35
    col = np.clip(
        col + rim[..., None] * np.array([0.35, 0.55, 0.95]) * np.clip(shade, 0.2, 1.0)[..., None],
        0.0,
        1.0,
    )
    a = np.clip((1.0 - np.sqrt(r2)) * N * 0.5, 0.0, 1.0)
    out = Image.fromarray((np.dstack([col, a]) * 255.0).astype(np.uint8), 'RGBA')
    buf = io.BytesIO()
    out.save(buf, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode('ascii')


BAKE_HOOK_JS = r"""
    // ---- Deterministic Headless Bake Exporter ----
    try {
      const BW = 2048, BH = 1024;
      glCanvas.width = BW;
      glCanvas.height = BH;
      gl.viewport(0, 0, BW, BH);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);
      gl.disable(gl.BLEND);
      gl.useProgram(progGlobe);

      const locPosS = gl.getAttribLocation(progGlobe, 'aPosSin');
      const locPosA = gl.getAttribLocation(progGlobe, 'aPosAzi');
      const locElev = gl.getAttribLocation(progGlobe, 'aElev');
      const locUV   = gl.getAttribLocation(progGlobe, 'aUV');
      gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
      const stride = 9 * 4;
      gl.enableVertexAttribArray(locPosS); gl.vertexAttribPointer(locPosS, 3, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(locPosA); gl.vertexAttribPointer(locPosA, 3, gl.FLOAT, false, stride, 12);
      gl.enableVertexAttribArray(locElev); gl.vertexAttribPointer(locElev, 1, gl.FLOAT, false, stride, 24);
      gl.enableVertexAttribArray(locUV);   gl.vertexAttribPointer(locUV,   2, gl.FLOAT, false, stride, 28);

      gl.uniform1f(gl.getUniformLocation(progGlobe, 'uProjMix'), 0.0);
      gl.uniform1f(gl.getUniformLocation(progGlobe, 'uVex'), 0.0);
      gl.uniform1f(gl.getUniformLocation(progGlobe, 'uIsPatch'), 0.0);
      gl.uniform1f(gl.getUniformLocation(progGlobe, 'uContextMode'), 1.0);
      gl.uniform1f(gl.getUniformLocation(progGlobe, 'uLightMode'), 1.0);
      gl.uniform1f(gl.getUniformLocation(progGlobe, 'uViewMode'), 1.0);
      gl.uniform2f(gl.getUniformLocation(progGlobe, 'uPan2D'), 0.0, 0.0);
      gl.uniform1f(gl.getUniformLocation(progGlobe, 'uZoom2D'), 1.0);
      gl.uniform1f(gl.getUniformLocation(progGlobe, 'uAspect'), 2.0);
      gl.uniform4f(gl.getUniformLocation(progGlobe, 'uMapRect2D'), 0.0, 0.0, 1.0, 1.0);
      gl.uniform1f(gl.getUniformLocation(progGlobe, 'uLightTheme'), 0.0);
      gl.uniform3f(gl.getUniformLocation(progGlobe, 'uSunDir'), 0.0, 0.0, 1.0);
      gl.uniform3f(gl.getUniformLocation(progGlobe, 'uCamPos'), 0.0, 0.0, 3.0);
      gl.uniform1f(gl.getUniformLocation(progGlobe, 'uEclipse'), 0.0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texHeight);
      gl.uniform1i(gl.getUniformLocation(progGlobe, 'uTexHeight'), 1);
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, texGlobalWater);
      gl.uniform1i(gl.getUniformLocation(progGlobe, 'uTexGlobalWater'), 3);

      const modeKeys = ['sat', 'rel', 'clim', 'rain', 'temp'];
      const modePngs = {};
      for (let m = 0; m < modeKeys.length; m++) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texMap[m]);
        gl.uniform1i(gl.getUniformLocation(progGlobe, 'uTexActive'), 0);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, texGlobal[m]);
        gl.uniform1i(gl.getUniformLocation(progGlobe, 'uTexGlobal'), 2);
        gl.uniform1f(gl.getUniformLocation(progGlobe, 'uMapMode'), m);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.finish();
        modePngs[modeKeys[m]] = glCanvas.toDataURL('image/png');
      }

      // Quantize elevation: q in [0..180] -> [-4500..+6300 m] (60 m/step, 0 m = 75 exact!),
      // q in [180..255] -> [+6300..+25050 m] (250 m/step)
      function encodeElevByte(e) {
        if (e <= 6300.0) {
          return Math.max(0, Math.min(180, Math.round((e + 4500.0) / 60.0)));
        }
        return Math.max(180, Math.min(255, Math.round(180.0 + (e - 6300.0) / 250.0)));
      }

      function sampleComposited(latDeg, lonDeg) {
        const g = sampleGlobalAtLatLon(latDeg, lonDeg);
        const dLon = ((lonDeg - (-57.0) + 540.0) % 360.0) - 180.0;
        const py = 1020.0 + (-40.0 - latDeg) * 42.0;
        const px = 718.0 + dLon * (42.0 * Math.cos(latDeg * DEG));
        const uvx = px / 1820.0, uvy = py / 1722.0;
        if (uvx >= 0.0 && uvx <= 1.0 && uvy >= 0.0 && uvy <= 1.0) {
          const m51 = sampleMetaAtPx(px, py);
          const rawE51 = sampleElevAtPx(px, py);
          const isNW51Oc = (m51.isWater && px < 440.0 && py < 610.0 && rawE51 < 25.0);
          const e51 = isNW51Oc ? sampleBathym51(px, py) : rawE51;
          const edgeDist = Math.min(Math.min(uvx, 1.0 - uvx), Math.min(uvy, 1.0 - uvy));
          let blend = 1.0;
          if (edgeDist < 0.20) {
            const u = (((lonDeg + 180.0) % 360.0) + 360.0) % 360.0 / 360.0;
            const v = Math.max(0, Math.min(1, (90.0 - latDeg) / 180.0));
            const ix = (Math.round(u * GW - 0.5) + GW) & (GW - 1);
            const iy = Math.max(0, Math.min(GH - 1, Math.round(v * GH - 0.5)));
            const globSea = globalWaterCov[iy * GW + ix] / 255.0;
            const openSea = (m51.isWater ? 1.0 : 0.0) * globSea;
            const fwLand = 0.036 + 0.010 * Math.sin(latDeg * 0.45) * Math.cos(lonDeg * 0.45) + 0.005 * Math.sin((latDeg + lonDeg) * 1.15);
            const fw = fwLand * (1.0 - openSea) + 0.18 * openSea;
            const ox = Math.max(0.0, fw - Math.min(uvx, 1.0 - uvx));
            const oy = Math.max(0.0, fw - Math.min(uvy, 1.0 - uvy));
            blend = 1.0 - sstep(0.0, fw, Math.hypot(ox, oy));
          }
          const elev = g.elev * (1.0 - blend) + e51 * blend;
          const w51 = m51.isWater ? 255.0 : 0.0;
          const u = (((lonDeg + 180.0) % 360.0) + 360.0) % 360.0 / 360.0;
          const v = Math.max(0, Math.min(1, (90.0 - latDeg) / 180.0));
          const ix = (Math.round(u * GW - 0.5) + GW) & (GW - 1);
          const iy = Math.max(0, Math.min(GH - 1, Math.round(v * GH - 0.5)));
          const wGlob = globalWaterCov[iy * GW + ix];
          const wCov = Math.round(wGlob * (1.0 - blend) + w51 * blend);
          const use51 = blend >= 0.5;
          return {
            elev,
            wCov,
            climIdx: use51 ? m51.climIdx : g.climIdx,
            rainMm: g.rainMm * (1.0 - blend) + m51.rainMm * blend,
            tempC: use51 ? m51.tempC : g.tempC,
            isOcean: use51 ? isNW51Oc : g.isOcean,
            in51: true
          };
        }
        const u = (((lonDeg + 180.0) % 360.0) + 360.0) % 360.0 / 360.0;
        const v = Math.max(0, Math.min(1, (90.0 - latDeg) / 180.0));
        const ix = (Math.round(u * GW - 0.5) + GW) & (GW - 1);
        const iy = Math.max(0, Math.min(GH - 1, Math.round(v * GH - 0.5)));
        return {
          elev: g.elev,
          wCov: globalWaterCov[iy * GW + ix],
          climIdx: g.climIdx,
          rainMm: g.rainMm,
          tempC: g.tempC,
          isOcean: g.isOcean,
          in51: false
        };
      }

      // 512x256 meta PNG (R=elevByte, G=waterCov, B=climIdx, A=255)
      const MW2 = 512, MH2 = 256;
      const metaCv = document.createElement('canvas');
      metaCv.width = MW2; metaCv.height = MH2;
      const metaG = metaCv.getContext('2d');
      const metaIm = metaG.createImageData(MW2, MH2);
      for (let y = 0; y < MH2; y++) {
        const lat = 90.0 - ((y + 0.5) / MH2) * 180.0;
        for (let x = 0; x < MW2; x++) {
          const lon = -180.0 + ((x + 0.5) / MW2) * 360.0;
          const s = sampleComposited(lat, lon);
          const p4 = (y * MW2 + x) * 4;
          metaIm.data[p4]     = encodeElevByte(s.elev);
          metaIm.data[p4 + 1] = s.wCov;
          metaIm.data[p4 + 2] = s.climIdx;
          metaIm.data[p4 + 3] = 255;
        }
      }
      metaG.putImageData(metaIm, 0, 0);

      // 256x128 env PNG (R=rainByte, G=tempByte, B=isOcean*255, A=255)
      const EW = 256, EH = 128;
      const envCv = document.createElement('canvas');
      envCv.width = EW; envCv.height = EH;
      const envG = envCv.getContext('2d');
      const envIm = envG.createImageData(EW, EH);
      for (let y = 0; y < EH; y++) {
        const lat = 90.0 - ((y + 0.5) / EH) * 180.0;
        for (let x = 0; x < EW; x++) {
          const lon = -180.0 + ((x + 0.5) / EW) * 360.0;
          const s = sampleComposited(lat, lon);
          const p4 = (y * EW + x) * 4;
          envIm.data[p4]     = Math.max(0, Math.min(255, Math.round((s.rainMm / 4000.0) * 255.0)));
          envIm.data[p4 + 1] = s.tempC == null ? 0 : Math.max(1, Math.min(255, Math.round(s.tempC + 90.0)));
          envIm.data[p4 + 2] = s.isOcean ? 255 : 0;
          envIm.data[p4 + 3] = 255;
        }
      }
      envG.putImageData(envIm, 0, 0);

      // 5.1 Sinusoidal boundary polyline
      const bounds51 = [];
      const NB = 32;
      for (let i = 0; i <= NB; i++) bounds51.push(pxToLatLon((OW - 1) * (i / NB), 0, 0).map(v => +v.toFixed(2)));
      for (let i = 1; i <= NB; i++) bounds51.push(pxToLatLon(OW - 1, (OH - 1) * (i / NB), 0).map(v => +v.toFixed(2)));
      for (let i = 1; i <= NB; i++) bounds51.push(pxToLatLon((OW - 1) * (1 - i / NB), OH - 1, 0).map(v => +v.toFixed(2)));
      for (let i = 1; i <= NB; i++) bounds51.push(pxToLatLon(0, (OH - 1) * (1 - i / NB), 0).map(v => +v.toFixed(2)));

      // Curated canonical pins: 5.1 cities/arcologies/volcanoes + Lake Capsica Ancient ruins + 25 global provinces
      const pins = [];
      const keepNames = new Set(['Carnelian Pass', 'Farport', 'Voth', 'Ria', 'Ys', 'Erewhon', 'Jimjam', 'Dalab']);
      for (const s of DATA.settlements) {
        if (s.type === 'city' || s.type === 'arcology' || s.type === 'ruined arcology' || keepNames.has(s.name)) {
          const [lt, ln] = pxToLatLon(s.px, s.py, 0);
          pins.push({
            n: s.name,
            k: s.type,
            g: '5.1',
            la: +lt.toFixed(2),
            lo: +ln.toFixed(2),
            el: Math.round(s.elev),
            d: s.notes || ''
          });
        }
      }
      const volcs = [
        { n: 'The Throne', px: DATA.volc.px[0], py: DATA.volc.px[1], el: Math.round(DATA.volc.peak), d: 'Central intra-crater shield volcano (+10.9 km) rising above the Ring Sea into the hypobaric rim.' },
        { n: 'Godthrone', px: DATA.godthrone.px[0], py: DATA.godthrone.px[1], el: Math.round(DATA.godthrone.peak), d: '25.0 km stagnant-lid super-shield on the southern Crater rim, piercing high into the airless O exosphere.' },
        { n: 'The Dome', px: 1351, py: 146.5, el: 6280, d: 'Broad +6.3 km basaltic shield volcano in the NE highlands with a snow-rimmed summit caldera.' }
      ];
      for (const v of volcs) {
        const [lt, ln] = pxToLatLon(v.px, v.py, 0);
        pins.push({ n: v.n, k: 'volcano', g: '5.1', la: +lt.toFixed(2), lo: +ln.toFixed(2), el: v.el, d: v.d });
      }
      const capsRuins = [
        { n: 'Capsica Ring-Citadel', la: 22.1, lo: -14.8, d: 'Submerged-terrace megalithic citadel on Lake Capsica (+2.08 km), built by a distinct Ancient culture that naturalized Earthly green flora here; their descendants may be the ancestors of the cross-sea merchants who arrive at Farport.' },
        { n: 'West Causeway Quay', la: 20.3, lo: -20.6, d: 'Ancient lake-outlet locks and terraced green orchards at the western outlet of Lake Capsica, facing downriver toward the Great NW Ocean sea-lanes to Farport.' },
        { n: 'East Opaline Terraces', la: 22.8, lo: -9.0, d: 'Overgrown stepped botanical terraces of naturalized Earthly green groves on Lake Capsica\'s eastern shore, fading outward into native iridescent blue-green cloud forest.' }
      ];
      for (const r of capsRuins) {
        const sc = sampleComposited(r.la, r.lo);
        pins.push({ n: r.n, k: 'ancient enclave', g: 'capsica', la: r.la, lo: r.lo, el: Math.round(sc.elev), d: r.d });
      }
      for (const p of SKETCH_PROVINCES) {
        const sc = sampleComposited(p.lat, p.lon);
        pins.push({
          n: p.name,
          k: p.kind,
          g: 'prov',
          la: +p.lat.toFixed(2),
          lo: +p.lon.toFixed(2),
          el: Math.round(sc.elev),
          r: p.rDeg,
          d: p.notes
        });
      }

      await fetch('/__bake_upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modes: modePngs,
          metaPng: metaCv.toDataURL('image/png'),
          envPng: envCv.toDataURL('image/png'),
          climClasses: DATA.climateClasses.map(c => [c.code, c.name, c.color]),
          bounds51,
          pins
        })
      });
      document.title = 'BAKE_COMPLETE';
    } catch (err) {
      await fetch('/__bake_error', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: String(err && err.stack ? err.stack : err)
      });
    }
"""


def decode_data_png(uri):
    raw = base64.b64decode(uri.split(',', 1)[1])
    return Image.open(io.BytesIO(raw))


def encode_data_uri(im, fmt, **kwargs):
    buf = io.BytesIO()
    im.save(buf, fmt, **kwargs)
    mime = 'image/webp' if fmt.upper() == 'WEBP' else ('image/jpeg' if fmt.upper() == 'JPEG' else 'image/png')
    return f'data:{mime};base64,' + base64.b64encode(buf.getvalue()).decode('ascii'), len(buf.getvalue())


def main():
    src_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC
    if not os.path.exists(src_path):
        raise SystemExit(f'Source globe HTML not found: {src_path}')

    src_html = open(src_path, encoding='utf-8').read()
    anchor = "    document.getElementById('loadingOverlay').classList.add('hidden');"
    if anchor not in src_html:
        raise SystemExit('Anchor not found in source globe HTML')
    patched_html = src_html.replace(anchor, BAKE_HOOK_JS + '\n' + anchor, 1)

    received = {}
    done_evt = threading.Event()

    class Handler(http.server.BaseHTTPRequestHandler):
        def log_message(self, fmt, *args):
            pass

        def do_GET(self):
            if self.path.startswith('/bake'):
                body = patched_html.encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            else:
                self.send_response(404)
                self.end_headers()

        def do_POST(self):
            length = int(self.headers.get('Content-Length', '0'))
            body = self.rfile.read(length)
            if self.path == '/__bake_upload':
                received['data'] = json.loads(body.decode('utf-8'))
            else:
                received['error'] = body.decode('utf-8', errors='replace')
            self.send_response(200)
            self.end_headers()
            done_evt.set()

    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    port = srv.server_address[1]
    th = threading.Thread(target=srv.serve_forever, daemon=True)
    th.start()

    user_dir = tempfile.mkdtemp(prefix='krator_bake_')
    try:
        cmd = [
            'chromium',
            '--headless',
            '--no-sandbox',
            '--no-proxy-server',
            '--disable-gpu',
            '--enable-unsafe-swiftshader',
            f'--user-data-dir={user_dir}',
            '--window-size=1280,800',
            f'http://127.0.0.1:{port}/bake',
        ]
        proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            if not done_evt.wait(timeout=90):
                raise RuntimeError('Timed out waiting for Chromium bake upload')
        finally:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()
    finally:
        srv.shutdown()
        shutil.rmtree(user_dir, ignore_errors=True)

    if 'error' in received:
        raise RuntimeError('JS bake error:\n' + received['error'])
    payload = received['data']

    sat_2k = decode_data_png(payload['modes']['sat']).convert('RGB')
    rel_2k = decode_data_png(payload['modes']['rel']).convert('RGB')
    clim_2k = decode_data_png(payload['modes']['clim']).convert('RGB')
    rain_2k = decode_data_png(payload['modes']['rain']).convert('RGB')
    temp_2k = decode_data_png(payload['modes']['temp']).convert('RGB')
    meta_im = decode_data_png(payload['metaPng']).convert('RGBA')
    env_im = decode_data_png(payload['envPng']).convert('RGBA')

    # 1. Update maps.json['krator'] (1024x512 JPEG for Three.js orrery) and pics.json['krator'] (260x260 PNG)
    orr_sat = sat_2k.resize((1024, 512), Image.Resampling.LANCZOS)
    orr_uri, orr_bytes = encode_data_uri(orr_sat, 'JPEG', quality=86, optimize=True)

    maps_path = os.path.join(HERE, 'maps.json')
    maps = json.load(open(maps_path, encoding='utf-8'))
    maps['krator'] = orr_uri
    open(maps_path, 'w', encoding='utf-8', newline='\n').write(json.dumps(maps))

    pics_path = os.path.join(HERE, 'pics.json')
    pics = json.load(open(pics_path, encoding='utf-8'))
    # Centre on 56W / 32S (u = (-56 + 180)/360 = 0.344, or 0.355 to frame Crater + Ring Sea + NW Sea)
    pics['krator'] = globe_from_pil(sat_2k, centre_u=0.35, centre_lat=-31.0, N=260)
    open(pics_path, 'w', encoding='utf-8', newline='\n').write(json.dumps(pics))

    # 2. Encode compact Power-of-Two WebP / PNG layers for the interactive Krator mini-globe
    sat_uri, sat_b = encode_data_uri(sat_2k, 'WEBP', quality=81, method=6)
    rel_uri, rel_b = encode_data_uri(rel_2k.resize((1024, 512), Image.Resampling.LANCZOS), 'WEBP', quality=82, method=6)
    clim_uri, clim_b = encode_data_uri(clim_2k.resize((1024, 512), Image.Resampling.LANCZOS), 'WEBP', quality=86, method=6)
    rain_uri, rain_b = encode_data_uri(rain_2k.resize((1024, 512), Image.Resampling.LANCZOS), 'WEBP', quality=80, method=6)
    temp_uri, temp_b = encode_data_uri(temp_2k.resize((1024, 512), Image.Resampling.LANCZOS), 'WEBP', quality=80, method=6)
    meta_uri, meta_b = encode_data_uri(meta_im, 'PNG', optimize=True)
    env_uri, env_b = encode_data_uri(env_im, 'PNG', optimize=True)

    baked = {
        'sat': sat_uri,
        'rel': rel_uri,
        'clim': clim_uri,
        'rain': rain_uri,
        'temp': temp_uri,
        'meta': meta_uri,
        'env': env_uri,
        'climClasses': payload['climClasses'],
        'bounds51': payload['bounds51'],
        'pins': payload['pins'],
    }
    baked_path = os.path.join(HERE, 'krator_baked.json')
    baked_str = json.dumps(baked, separators=(',', ':'))
    open(baked_path, 'w', encoding='utf-8', newline='\n').write(baked_str)

    print(f'orrery maps.json[krator]: {orr_bytes / 1024:.1f} KB (1024x512 JPEG)')
    print(f'pics.json[krator]       : {len(pics["krator"]) / 1024:.1f} KB (260x260 RGBA PNG URI)')
    print(f'baked sat  (2048x1024)  : {sat_b / 1024:.1f} KB')
    print(f'baked rel  (1024x512)   : {rel_b / 1024:.1f} KB')
    print(f'baked clim (1024x512)   : {clim_b / 1024:.1f} KB')
    print(f'baked rain (1024x512)   : {rain_b / 1024:.1f} KB')
    print(f'baked temp (1024x512)   : {temp_b / 1024:.1f} KB')
    print(f'baked meta (512x256 PNG): {meta_b / 1024:.1f} KB')
    print(f'baked env  (256x128 PNG): {env_b / 1024:.1f} KB')
    print(f'pins count              : {len(payload["pins"])}')
    print(f'krator_baked.json total : {len(baked_str) / 1024:.1f} KB')


if __name__ == '__main__':
    main()
