#!/usr/bin/env python3
"""Stage 5 (M1) Material Slice Packer & WebGL2 Benchmark Runner (GRAPHICS-TERRAIN-PROPOSAL.md Sections 6 & 9.2).

Packs 7 representative PBR library families (3-layer ground set, 2 masonry walls, 1 cliff rock, 1 smooth glazed curved
ceramic) + 1 alpha cut-out card guard across all four M1 disk encodings into godot/data/m1_slice/:
  - v1_three_maps    : today's 3 maps (albedo RGB q82, normal xy6 lossless RGB, roughness L q85)
  - v2_two_maps_xy6  : albedo+height RGBA q82 + normal(xy6)+rough(7b)+cavity(7b) lossless RGBA
  - v2_two_maps_xy8  : albedo+height RGBA q82 + normal(xy8)+rough(8b)+cavity(8b) lossless RGBA
  - v2_two_maps_oct8 : albedo+height RGBA q82 + normal(hemi-oct8)+rough(8b)+cavity(8b) lossless RGBA

With `--web`, also builds 6 self-contained Three.js r128 WebGL2 pages (the 4 map variants + v3 3-map Texture2DArrays +
v4 2-map Texture2DArrays) and measures in headless Chromium:
  - HTML page bytes, WebP bytes, decoded CPU bytes, WebGL2 VRAM_JS MiB
  - Linked WebGL2 program active sampler count (SAMPLERS_JS: gl.ACTIVE_UNIFORMS)
  - Page + texture decode load time (ms) and 60-frame render median/p95 (ms)
  - Gate 1 (pack physics + negative tests), Gate 2 (samplers < 16), Gate 3 (GPU handedness & POM probe),
    Gate 4 (raking-light relief contrast), and glazed curved specular banding metrics.
"""
import argparse, asyncio, base64, io, json, math, os, sys, tempfile, time
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import pack as tpack  # noqa: E402

OUT_DIR = os.path.join(ROOT, 'godot', 'data', 'm1_slice')
TEX_DIR = os.path.join(OUT_DIR, 'tex')

SLICE_FAMILIES = {
    'ground_grass': {
        'role': 'ground_layer_0',
        'lib': 'ground.grass.lush',
        'scale': [2.6, 2.6],
        'tint': {'keep': 1.0, 'mean': None},
        'roughLift': 0.22,
        'specular': 0.25,
    },
    'ground_moss': {
        'role': 'ground_layer_1',
        'lib': 'ground.moss001',
        'scale': [2.2, 2.2],
        'tint': {'keep': 1.0, 'mean': None},
        'roughLift': 0.25,
        'specular': 0.22,
    },
    'ground_gravel': {
        'role': 'ground_layer_2',
        'lib': 'ground.gravel019',
        'scale': [2.4, 2.4],
        'tint': {'keep': 1.0, 'mean': None},
        'roughLift': 0.20,
        'specular': 0.28,
    },
    'masonry_wall': {
        'role': 'hero_masonry_pom',
        'lib': 'brick.red',
        'scale': [2.0, 2.0],
        'tint': {'keep': 1.0, 'mean': None},
        'roughLift': 0.25,
        'specular': 0.32,
        'pomDepth': 0.028,
    },
    'ashlar_wall': {
        'role': 'hero_ashlar_pom',
        'lib': 'stone.chiselled',
        'scale': [2.5, 2.5],
        'tint': {'keep': 0.0, 'mean': 0.68},
        'roughLift': 0.28,
        'specular': 0.32,
        'pomDepth': 0.024,
    },
    'cliff_rock': {
        'role': 'rock',
        'lib': 'rock.granite.tor',
        'scale': [6.5, 6.5],
        'tint': {'keep': 0.0, 'mean': 0.70},
        'roughLift': 0.25,
        'specular': 0.28,
    },
    'glazed_ceramic': {
        'role': 'glazed_curved',
        'lib': 'ceramic.celadon.crackle',
        'scale': [1.2, 1.2],
        'tint': {'keep': 1.0, 'mean': None},
        'roughLift': 0.0,
        'specular': 0.65,
    },
    'cutout_themeda': {
        'role': 'cutout_guard',
        'lib': 'card.grass.themeda',
        'scale': [1.0, 1.0],
        'tint': {'keep': 1.0, 'mean': None},
    },
}

LIT_ORDER = [
    'ground_grass',
    'ground_moss',
    'ground_gravel',
    'masonry_wall',
    'ashlar_wall',
    'cliff_rock',
    'glazed_ceramic',
]


def _grazing_banding_metrics(lib_id, size=512):
    """Measure unique quantized normal vectors and specular highlight step jumps on a smooth curved glazed surface."""
    d = tpack.set_dir(lib_id)
    n_ref = tpack.load(os.path.join(d, 'normal.jpg'), size, 'RGB') * 2.0 - 1.0
    n_ref /= np.maximum(np.linalg.norm(n_ref, axis=2, keepdims=True), 1e-6)
    r_map = tpack.load(os.path.join(d, 'roughness.png'), size, 'L')
    rough = float(np.clip(r_map.mean(), 0.08, 1.0))

    # Grazing half-vector across a smooth curved cylinder arc (-25 deg .. +25 deg) modulated by normal map
    xs = np.linspace(-0.42, 0.42, size)[None, :]
    zs = np.sqrt(1.0 - xs * xs)
    cyl_n = np.stack([np.broadcast_to(xs, (size, size)), np.zeros((size, size)), np.broadcast_to(zs, (size, size))], axis=-1)
    half_v = np.array([0.18, 0.12, 0.976])
    half_v /= np.linalg.norm(half_v)

    def spec_profile(n_ts):
        # Perturb cylinder normal by tangent normal (small-angle orthonormal basis on cylinder)
        t_vec = np.stack([cyl_n[..., 2], np.zeros_like(cyl_n[..., 0]), -cyl_n[..., 0]], axis=-1)
        b_vec = np.array([0.0, 1.0, 0.0])[None, None, :]
        wn = t_vec * n_ts[..., 0:1] + b_vec * n_ts[..., 1:2] + cyl_n * n_ts[..., 2:3]
        wn /= np.maximum(np.linalg.norm(wn, axis=-1, keepdims=True), 1e-6)
        ndh = np.clip(np.sum(wn * half_v[None, None, :], axis=-1), 0.0, 1.0)
        a2 = (rough * rough) ** 2
        denom = ndh * ndh * (a2 - 1.0) + 1.0
        ggx = a2 / (math.pi * denom * denom + 1e-6)
        return ggx

    ref_spec = spec_profile(n_ref)
    out = {}
    for enc in ('xy6', 'xy8', 'oct8'):
        rg, n_dec = tpack.encode_normal_rg(n_ref, enc)
        uniq = int(np.unique(rg.reshape(-1, 2), axis=0).shape[0])
        sp = spec_profile(n_dec)
        err_rmse = float(np.sqrt(np.mean((sp - ref_spec) ** 2)))
        err_p99 = float(np.percentile(np.abs(sp - ref_spec), 99))
        err_st = tpack.normal_error_stats(n_ref, n_dec)
        out[enc] = {
            'uniqueNormals': uniq,
            'specRmse': round(err_rmse, 5),
            'specP99Err': round(err_p99, 5),
            **err_st,
        }
    return out


def _run_gate1_negative_tests():
    """Verify Gate 1 physics assertions catch forbidden pack mutations."""
    caught = {}
    dummy_h = np.linspace(0.1, 0.9, 64 * 64).reshape(64, 64)
    dummy_n = np.dstack([np.zeros((64, 64)), np.zeros((64, 64)), np.ones((64, 64))])
    dummy_r = np.full((64, 64), 0.5)
    dummy_c = np.ones((64, 64))
    # 1. Cutout card with alpha_mode == 'height' MUST fail
    try:
        tpack.assert_pack_physics('neg_card', {}, True, 'height', dummy_h, dummy_n, dummy_n, dummy_r, dummy_c)
        caught['cutoutHeightRejected'] = False
    except ValueError:
        caught['cutoutHeightRejected'] = True
    # 2. Zero-relief height without flat=True MUST fail, and with flat=True MUST pass
    flat_h = np.full((64, 64), 0.5)
    try:
        tpack.assert_pack_physics('neg_flat', {}, False, 'height', flat_h, dummy_n, dummy_n, dummy_r, dummy_c)
        caught['unflaggedFlatRejected'] = False
    except ValueError:
        caught['unflaggedFlatRejected'] = True
    tpack.assert_pack_physics('pos_flat', {'flat': True}, False, 'height', flat_h, dummy_n, dummy_n, dummy_r, dummy_c)
    caught['declaredFlatAccepted'] = True
    # 3. NaN channel MUST fail
    nan_r = dummy_r.copy()
    nan_r[0, 0] = np.nan
    try:
        tpack.assert_pack_physics('neg_nan', {}, False, 'height', dummy_h, dummy_n, dummy_n, nan_r, dummy_c)
        caught['nanRejected'] = False
    except ValueError:
        caught['nanRejected'] = True
    if not all(caught.values()):
        raise RuntimeError('Gate 1 negative self-test failed: %r' % caught)
    return caught


def _fast_entry_from_existing(vkey, fam, fc, size, pfmt, nenc):
    """Build exact entry metadata from already-packed method=6 WebP files on disk."""
    lib = fc['lib']
    d = tpack.set_dir(lib)
    meta = json.load(open(os.path.join(d, 'meta.json'), encoding='utf-8'))
    rec = meta.get('record', {})
    card = rec.get('kind') == 'card'
    expected = {'map': '%s__%s.albedo.webp' % (vkey, fam)}
    if not card:
        if pfmt == 1:
            expected['normalMap'] = '%s__%s.normal.webp' % (vkey, fam)
            expected['roughnessMap'] = '%s__%s.rough.webp' % (vkey, fam)
        else:
            expected['nrcMap'] = '%s__%s.nrc.webp' % (vkey, fam)
    for fn in expected.values():
        if not os.path.isfile(os.path.join(TEX_DIR, fn)):
            return None
    entry = {
        'lib': lib,
        'size': size,
        'scale': fc.get('scale', rec.get('scale', [2, 2])),
        'metal': fc.get('metal', rec.get('metal', 0)),
        'normalScale': fc.get('normalScale', 1.0),
        'specular': fc.get('specular', 0.5),
        'breakup': fc.get('breakup'),
        'card': card,
        'roughLift': fc.get('roughLift', 0.0),
        'files': {k: 'tex/' + fn for k, fn in expected.items()},
    }
    if pfmt == 2:
        entry['packVersion'] = 2
        entry['alphaMode'] = 'cutout' if card else 'height'
        if not card:
            entry['height'] = True
            entry['normalEncoding'] = nenc
            entry['heightSource'] = 'normalPoisson'
            n_float = tpack.load(os.path.join(d, (meta.get('maps') or {}).get('normalMap', 'normal.jpg')), size, 'RGB') * 2.0 - 1.0
            n_float /= np.maximum(np.linalg.norm(n_float, axis=2, keepdims=True), 1e-6)
            _, n_dec = tpack.encode_normal_rg(n_float, nenc)
            entry['mipVariance'] = tpack.compute_mip_variance(n_float)
            entry['normalError'] = tpack.normal_error_stats(n_float, n_dec)
    return entry


def pack_all_variants(size=512, reuse_tex=False):
    os.makedirs(TEX_DIR, exist_ok=True)
    gate1_neg = _run_gate1_negative_tests()
    variants_cfg = [
        ('v1', 1, 'xy6'),
        ('v2_xy6', 2, 'xy6'),
        ('v2_xy8', 2, 'xy8'),
        ('v2_oct8', 2, 'oct8'),
    ]
    disk_variants = {}
    written_files = set()

    for vkey, pfmt, nenc in variants_cfg:
        t0 = time.perf_counter()
        fams_out = {}
        webp_bytes_lit = 0
        webp_bytes_all = 0
        b64_bytes_lit = 0
        decoded_cpu_bytes_lit = 0
        webgl_rgba_vram_lit = 0
        godot_rgba_vram_lit = 0
        godot_bptc_vram_lit = 0
        godot_s3tc_vram_lit = 0
        mip_factor = 4.0 / 3.0
        px = size * size

        for fam in sorted(SLICE_FAMILIES):
            fc = SLICE_FAMILIES[fam]
            cached_e = _fast_entry_from_existing(vkey, fam, fc, size, pfmt, nenc) if reuse_tex else None
            if cached_e is not None:
                entry = cached_e
                remapped = entry['files']
                fam_webp = 0
                for slot, rel_p in remapped.items():
                    fn_only = os.path.basename(rel_p)
                    written_files.add(fn_only)
                    fam_webp += os.path.getsize(os.path.join(OUT_DIR, rel_p))
            else:
                entry, files = tpack.process(fam, fc, size, pack_format=pfmt, normal_enc=nenc)
                remapped = {}
                fam_webp = 0
                for slot, orig_name in sorted(entry['files'].items()):
                    pref_name = '%s__%s' % (vkey, orig_name)
                    data = files[orig_name]
                    with open(os.path.join(TEX_DIR, pref_name), 'wb') as fh:
                        fh.write(data)
                    written_files.add(pref_name)
                    remapped[slot] = 'tex/' + pref_name
                    fam_webp += len(data)
                entry['files'] = remapped
            entry['role'] = fc['role']
            if fc.get('pomDepth'):
                entry['pomDepth'] = fc['pomDepth']
            entry['webpBytes'] = fam_webp
            fams_out[fam] = entry
            webp_bytes_all += fam_webp

            if fam in LIT_ORDER:
                webp_bytes_lit += fam_webp
                # Base64 data URL size in self-contained HTML: 4 * ceil(n/3) + 23
                for slot, rel_p in remapped.items():
                    sz_b = os.path.getsize(os.path.join(OUT_DIR, rel_p))
                    b64_bytes_lit += ((sz_b + 2) // 3) * 4 + 23
                if pfmt == 1:
                    # 3 maps: browser decodes HTMLImageElement to RGBA8 (4 B/px * 3 = 12 B/px), WebGL2 uploads 3 RGBA8 w/ mips
                    decoded_cpu_bytes_lit += px * 4 * 3
                    webgl_rgba_vram_lit += int(round(px * 4 * 3 * mip_factor))
                    # Godot: albedo RGB8/BC7 (1 B/px BPTC, 0.5 B/px S3TC), normal RG8/BC5 (1 B/px), rough L8/BC4 (0.5 B/px)
                    godot_rgba_vram_lit += int(round(px * (3 + 3 + 1) * mip_factor))
                    godot_bptc_vram_lit += int(round(px * (1.0 + 1.0 + 1.0) * mip_factor))
                    godot_s3tc_vram_lit += int(round(px * (0.5 + 1.0 + 0.5) * mip_factor))
                else:
                    # 2 maps: albedo+H RGBA8 + nrc RGBA8 (4 B/px * 2 = 8 B/px -> -33.3% decoded & uncompressed VRAM!)
                    decoded_cpu_bytes_lit += px * 4 * 2
                    webgl_rgba_vram_lit += int(round(px * 4 * 2 * mip_factor))
                    godot_rgba_vram_lit += int(round(px * (4 + 4) * mip_factor))
                    godot_bptc_vram_lit += int(round(px * (1.0 + 1.0) * mip_factor))
                    godot_s3tc_vram_lit += int(round(px * (1.0 + 1.0) * mip_factor))

        pack_ms = (time.perf_counter() - t0) * 1000.0
        disk_variants[vkey] = {
            'packFormat': pfmt,
            'normalEncoding': nenc,
            'litFamilies': len(LIT_ORDER),
            'mapsPerLitFamily': 3 if pfmt == 1 else 2,
            'totalLitTextures': len(LIT_ORDER) * (3 if pfmt == 1 else 2),
            'packMs': round(pack_ms, 1),
            'webpBytesLit': webp_bytes_lit,
            'webpKB': round(webp_bytes_lit / 1024.0, 1),
            'inlineBase64KB': round(b64_bytes_lit / 1024.0, 1),
            'decodedCpuMB': round(decoded_cpu_bytes_lit / 1048576.0, 2),
            'webglRgbaMipMB': round(webgl_rgba_vram_lit / 1048576.0, 2),
            'godotRgbaMipMB': round(godot_rgba_vram_lit / 1048576.0, 2),
            'godotBptcMipMB': round(godot_bptc_vram_lit / 1048576.0, 2),
            'godotS3tcMipMB': round(godot_s3tc_vram_lit / 1048576.0, 2),
            'families': fams_out,
        }

    for fn in os.listdir(TEX_DIR):
        if fn.endswith('.webp') and fn not in written_files:
            os.remove(os.path.join(TEX_DIR, fn))

    glazed_banding = _grazing_banding_metrics('ceramic.celadon.crackle', size=size)
    granite_errors = _grazing_banding_metrics('rock.granite.tor', size=size)

    manifest = {
        'format': 'krator-m1-slice',
        'version': 2,
        'size': size,
        'litOrder': LIT_ORDER,
        'gate1NegativeSelfTest': gate1_neg,
        'glazedCeramicBanding': glazed_banding,
        'cliffRockNormalError': granite_errors,
        'variants': disk_variants,
    }
    mpath = os.path.join(OUT_DIR, 'manifest.json')
    with open(mpath, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(json.dumps(manifest, indent=2, sort_keys=True) + '\n')
    print('packed Stage 5 M1 slice into %s (%d webp files across 4 packings)' % (
        os.path.relpath(OUT_DIR, ROOT).replace(os.sep, '/'), len(written_files)))
    for vk, vd in disk_variants.items():
        print('  %-8s  tex=%2d  webp=%6.1f KB  b64=%6.1f KB  webgl_vram=%5.2f MB  godot_rgba=%5.2f MB  godot_bptc=%4.2f MB' % (
            vk, vd['totalLitTextures'], vd['webpKB'], vd['inlineBase64KB'],
            vd['webglRgbaMipMB'], vd['godotRgbaMipMB'], vd['godotBptcMipMB']))
    return manifest


def _build_web_html(manifest, mode_key, three_js_src, m1_js_src):
    """Build a self-contained WebGL2 benchmark + swatch gallery HTML for one M1 variant:
      - v1_three_maps         : 3 sampler2D per material (9 samplers on 3-layer ground!)
      - v2_two_maps_xy6       : 2 sampler2D per material (6 samplers on 3-layer ground, POM + mipVariance AA)
      - v2_two_maps_xy8       : 2 sampler2D per material (xy8)
      - v2_two_maps_oct8      : 2 sampler2D per material (hemi-oct8)
      - v3_arrays_three_maps  : 3 sampler2DArray (3 samplers total for 3-layer ground + all 4 hero swatches!)
      - v4_arrays_two_maps    : 2 sampler2DArray (2 samplers total for 3-layer ground + all 4 hero swatches!)
    """
    pack_map = {
        'v1_three_maps': ('v1', False),
        'v2_two_maps_xy6': ('v2_xy6', False),
        'v2_two_maps_xy8': ('v2_xy8', False),
        'v2_two_maps_oct8': ('v2_oct8', False),
        'v3_arrays_three_maps': ('v1', True),
        'v4_arrays_two_maps': ('v2_oct8', True),
    }
    disk_key, use_arrays = pack_map[mode_key]
    vdata = manifest['variants'][disk_key]
    pfmt = vdata['packFormat']
    nenc = vdata['normalEncoding']

    inline_fams = {}
    for fam in LIT_ORDER:
        e = vdata['families'][fam]
        urls = {}
        for slot, rel_p in e['files'].items():
            raw = open(os.path.join(OUT_DIR, rel_p), 'rb').read()
            urls[slot] = 'data:image/webp;base64,' + base64.b64encode(raw).decode('ascii')
        inline_fams[fam] = {
            'role': e['role'],
            'scale': e['scale'],
            'specular': e['specular'],
            'normalScale': e['normalScale'],
            'pomDepth': e.get('pomDepth', 0.0),
            'mipVariance': e.get('mipVariance', [0.0] * 8),
            'urls': urls,
        }

    cfg_json = json.dumps({
        'mode': mode_key,
        'packFormat': pfmt,
        'normalEncoding': nenc,
        'useArrays': use_arrays,
        'size': manifest['size'],
        'litOrder': LIT_ORDER,
        'families': inline_fams,
    })

    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>M1 Slice — {mode_key}</title>
<style>html,body{{margin:0;background:#11151c;overflow:hidden;color:#dce4ef;font:12px monospace}}#hud{{position:fixed;top:8px;left:10px;background:rgba(12,16,22,0.78);padding:6px 10px;border-radius:4px}}</style>
</head><body><div id="errs"></div><div id="hud">{mode_key}</div>
<script>{three_js_src}</script>
<script>{m1_js_src}</script>
<script>
(async function(){{
  'use strict';
  const tLoad0 = performance.now();
  const CFG = {cfg_json};
  const S = CFG.size;
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  const gl = canvas.getContext('webgl2', {{ antialias: true, preserveDrawingBuffer: true }});
  const renderer = new THREE.WebGLRenderer({{ canvas, context: gl, antialias: true, preserveDrawingBuffer: true }});
  renderer.setSize(960, 540, false);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  window.renderer = renderer;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a2230);
  const camera = new THREE.PerspectiveCamera(45, 960 / 540, 0.1, 200);
  camera.position.set(0, 2.85, 7.6);
  camera.lookAt(0, 0.65, 0);
  window._api = {{ renderer, scene, camera }};

  const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x3b3328, 0.55);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d6, 2.1);
  sun.position.set(4.5, 5.2, 4.8);
  scene.add(sun);

  function loadImg(url){{
    return new Promise((res, rej) => {{
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = url;
    }});
  }}

  function makeTex2D(im, srgb){{
    const t = new THREE.Texture(im);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.encoding = srgb ? THREE.sRGBEncoding : THREE.LinearEncoding;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.anisotropy = 4;
    t.needsUpdate = true;
    return t;
  }}

  const decoded = {{}};
  for (const fam of CFG.litOrder) {{
    const u = CFG.families[fam].urls;
    decoded[fam] = {{}};
    for (const k of Object.keys(u)) decoded[fam][k] = await loadImg(u[k]);
  }}

  const octGlsl = CFG.normalEncoding === 'oct8'
    ? 'vec3 decN(vec2 e01){{ vec2 e=e01*2.0-1.0; vec2 p=vec2(e.x+e.y,e.x-e.y)*0.5; return normalize(vec3(p.x,p.y,max(0.0,1.0-abs(p.x)-abs(p.y)))); }}'
    : 'vec3 decN(vec2 e01){{ vec2 xy=e01*2.0-1.0; return normalize(vec3(xy,sqrt(max(0.0,1.0-dot(xy,xy))))); }}';

  const commonFrag = `
    vec3 srgbLin(vec3 c){{ return pow(max(c, vec3(0.0)), vec3(2.2)); }}
    ${{octGlsl}}
    float roughAA(float r, vec2 dx, vec2 dy, vec4 vLo, vec4 vHi){{
      float px = max(dot(dx, dx), dot(dy, dy)) * float(${{S * S}});
      float mip = clamp(0.5 * log2(max(px, 1.0)), 0.0, 7.0);
      int i0 = int(floor(mip)); float f = mip - float(i0);
      float a = i0 < 4 ? vLo[i0] : vHi[i0 - 4];
      int i1 = min(i0 + 1, 7);
      float b = i1 < 4 ? vLo[i1] : vHi[i1 - 4];
      return sqrt(clamp(r * r + min(mix(a, b, f) * 1.5, 0.45), 0.0004, 1.0));
    }}
    vec3 shadePBR(vec3 alb, vec3 N, float rough, float specK, float cav, vec3 wp){{
      vec3 V = normalize(uEye - wp);
      vec3 L = normalize(uSunDir);
      vec3 H = normalize(V + L);
      float ndl = max(dot(N, L), 0.0);
      float ndv = max(dot(N, V), 0.001);
      float ndh = max(dot(N, H), 0.0);
      float a2 = max(rough * rough * rough * rough, 0.0004);
      float dn = ndh * ndh * (a2 - 1.0) + 1.0;
      float D = a2 / (3.14159265 * dn * dn);
      float F = 0.04 + 0.96 * pow(1.0 - max(dot(H, V), 0.0), 5.0);
      vec3 spec = vec3(D * F * specK * 0.28) * ndl;
      vec3 amb = mix(vec3(0.09, 0.08, 0.07), vec3(0.20, 0.25, 0.34), N.y * 0.5 + 0.5) * cav;
      return alb * (amb + vec3(1.0, 0.94, 0.84) * ndl * 1.35 * mix(1.0, cav, 0.35)) + spec * cav;
    }}
  `;

  function imgBytes(im){{
    const cv = document.createElement('canvas'); cv.width = cv.height = S;
    const cx = cv.getContext('2d', {{ willReadFrequently: true }});
    cx.save(); cx.translate(0, S); cx.scale(1, -1); cx.drawImage(im, 0, 0, S, S); cx.restore();
    return cx.getImageData(0, 0, S, S).data;
  }}

  const uEye = {{ value: camera.position.clone() }};
  const uSunDir = {{ value: sun.position.clone().normalize() }};

  let groundMat = null;
  const swatchMats = {{}};

  if (CFG.useArrays) {{
    const nLay = CFG.litOrder.length;
    function mkArr(){{
      const t = new THREE.DataTexture2DArray(new Uint8Array(S * S * 4 * nLay), S, S, nLay);
      t.format = THREE.RGBAFormat; t.type = THREE.UnsignedByteType;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
      t.generateMipmaps = true; t.anisotropy = 4;
      return t;
    }}
    if (CFG.packFormat === 1) {{
      const aAlb = mkArr(), aNor = mkArr(), aRgh = mkArr();
      CFG.litOrder.forEach((fam, i) => {{
        aAlb.image.data.set(imgBytes(decoded[fam].map), i * S * S * 4);
        aNor.image.data.set(imgBytes(decoded[fam].normalMap), i * S * S * 4);
        aRgh.image.data.set(imgBytes(decoded[fam].roughnessMap), i * S * S * 4);
      }});
      aAlb.needsUpdate = aNor.needsUpdate = aRgh.needsUpdate = true;
      const makeArr3Mat = (isGround, layerIdx) => new THREE.ShaderMaterial({{
        uniforms: {{ aAlb: {{ value: aAlb }}, aNor: {{ value: aNor }}, aRgh: {{ value: aRgh }}, uEye, uSunDir, uLayer: {{ value: layerIdx }} }},
        vertexShader: `varying vec2 vUv; varying vec3 vWp; varying vec3 vWn; varying vec3 vWt; varying vec3 vWb;
          void main(){{ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vWp = wp.xyz;
            vWn = normalize(mat3(modelMatrix) * normal);
            vec3 up = abs(vWn.y) > 0.92 ? vec3(0.0,0.0,1.0) : vec3(0.0,1.0,0.0);
            vWt = normalize(cross(up, vWn)); vWb = cross(vWn, vWt);
            gl_Position = projectionMatrix * viewMatrix * wp; }}`,
        fragmentShader: `precision highp float; precision highp sampler2DArray;
          uniform sampler2DArray aAlb; uniform sampler2DArray aNor; uniform sampler2DArray aRgh;
          uniform vec3 uEye; uniform vec3 uSunDir; uniform float uLayer;
          varying vec2 vUv; varying vec3 vWp; varying vec3 vWn; varying vec3 vWt; varying vec3 vWb;
          ${{commonFrag}}
          void main(){{
            vec2 uv = vUv * (${{isGround ? '4.0' : '2.0'}});
            vec3 alb, nts; float rgh;
            if (${{isGround ? 'true' : 'false'}}) {{
              float w0 = clamp(0.5 + 0.5 * sin(vWp.x * 0.55), 0.0, 1.0);
              float w1 = clamp(0.5 + 0.5 * cos(vWp.z * 0.65), 0.0, 1.0) * (1.0 - w0);
              float w2 = max(0.0, 1.0 - w0 - w1);
              alb = srgbLin(texture(aAlb, vec3(uv, 0.0)).rgb) * w0 + srgbLin(texture(aAlb, vec3(uv, 1.0)).rgb) * w1 + srgbLin(texture(aAlb, vec3(uv, 2.0)).rgb) * w2;
              nts = normalize(decN(texture(aNor, vec3(uv, 0.0)).rg) * w0 + decN(texture(aNor, vec3(uv, 1.0)).rg) * w1 + decN(texture(aNor, vec3(uv, 2.0)).rg) * w2);
              rgh = texture(aRgh, vec3(uv, 0.0)).g * w0 + texture(aRgh, vec3(uv, 1.0)).g * w1 + texture(aRgh, vec3(uv, 2.0)).g * w2;
            }} else {{
              alb = srgbLin(texture(aAlb, vec3(uv, uLayer)).rgb);
              nts = decN(texture(aNor, vec3(uv, uLayer)).rg);
              rgh = texture(aRgh, vec3(uv, uLayer)).g;
            }}
            vec3 N = normalize(vWt * nts.x + vWb * nts.y + vWn * nts.z);
            vec3 col = shadePBR(alb, N, rgh, 0.45, 1.0, vWp);
            gl_FragColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(1.0/2.2)), 1.0);
          }}`
      }});
      groundMat = makeArr3Mat(true, 0);
      CFG.litOrder.slice(3).forEach((fam, idx) => {{ swatchMats[fam] = makeArr3Mat(false, idx + 3); }});
    }} else {{
      const aAlbH = mkArr(), aNrc = mkArr();
      CFG.litOrder.forEach((fam, i) => {{
        aAlbH.image.data.set(imgBytes(decoded[fam].map), i * S * S * 4);
        aNrc.image.data.set(imgBytes(decoded[fam].nrcMap), i * S * S * 4);
      }});
      aAlbH.needsUpdate = aNrc.needsUpdate = true;
      const makeArr2Mat = (isGround, layerIdx, famCfg) => {{
        const mv = (famCfg && famCfg.mipVariance) || [0,0,0,0,0,0,0,0];
        return new THREE.ShaderMaterial({{
          uniforms: {{
            aAlbH: {{ value: aAlbH }}, aNrc: {{ value: aNrc }}, uEye, uSunDir,
            uLayer: {{ value: layerIdx }}, uPom: {{ value: famCfg ? (famCfg.pomDepth || 0.0) : 0.0 }},
            uSpec: {{ value: famCfg ? famCfg.specular : 0.35 }},
            uVarLo: {{ value: new THREE.Vector4(mv[0]||0, mv[1]||0, mv[2]||0, mv[3]||0) }},
            uVarHi: {{ value: new THREE.Vector4(mv[4]||0, mv[5]||0, mv[6]||0, mv[7]||0) }}
          }},
          vertexShader: `varying vec2 vUv; varying vec3 vWp; varying vec3 vWn; varying vec3 vWt; varying vec3 vWb;
            void main(){{ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vWp = wp.xyz;
              vWn = normalize(mat3(modelMatrix) * normal);
              vec3 up = abs(vWn.y) > 0.92 ? vec3(0.0,0.0,1.0) : vec3(0.0,1.0,0.0);
              vWt = normalize(cross(up, vWn)); vWb = cross(vWn, vWt);
              gl_Position = projectionMatrix * viewMatrix * wp; }}`,
          fragmentShader: `precision highp float; precision highp sampler2DArray;
            uniform sampler2DArray aAlbH; uniform sampler2DArray aNrc;
            uniform vec3 uEye; uniform vec3 uSunDir; uniform float uLayer; uniform float uPom; uniform float uSpec;
            uniform vec4 uVarLo; uniform vec4 uVarHi;
            varying vec2 vUv; varying vec3 vWp; varying vec3 vWn; varying vec3 vWt; varying vec3 vWb;
            ${{commonFrag}}
            void main(){{
              vec2 uv = vUv * (${{isGround ? '4.0' : '2.0'}});
              vec2 dx = dFdx(uv), dy = dFdy(uv);
              vec3 alb, nts; float rgh, cav = 1.0;
              if (${{isGround ? 'true' : 'false'}}) {{
                float w0 = clamp(0.5 + 0.5 * sin(vWp.x * 0.55), 0.0, 1.0);
                float w1 = clamp(0.5 + 0.5 * cos(vWp.z * 0.65), 0.0, 1.0) * (1.0 - w0);
                float w2 = max(0.0, 1.0 - w0 - w1);
                vec4 a0 = textureGrad(aAlbH, vec3(uv, 0.0), dx, dy), a1 = textureGrad(aAlbH, vec3(uv, 1.0), dx, dy), a2 = textureGrad(aAlbH, vec3(uv, 2.0), dx, dy);
                vec4 n0 = textureGrad(aNrc, vec3(uv, 0.0), dx, dy), n1 = textureGrad(aNrc, vec3(uv, 1.0), dx, dy), n2 = textureGrad(aNrc, vec3(uv, 2.0), dx, dy);
                alb = srgbLin(a0.rgb) * w0 + srgbLin(a1.rgb) * w1 + srgbLin(a2.rgb) * w2;
                nts = normalize(decN(n0.rg) * w0 + decN(n1.rg) * w1 + decN(n2.rg) * w2);
                rgh = n0.b * w0 + n1.b * w1 + n2.b * w2;
                cav = n0.a * w0 + n1.a * w1 + n2.a * w2;
              }} else {{
                if (uPom > 0.0001) {{
                  vec3 V = normalize(uEye - vWp);
                  vec3 vts = vec3(dot(V, vWt), dot(V, vWb), max(dot(V, vWn), 0.18));
                  vec2 dUv = (vts.xy / vts.z) * uPom / 8.0;
                  vec2 curUv = uv, prevUv = uv;
                  float curL = 0.0, prevL = 0.0;
                  float curD = 1.0 - textureGrad(aAlbH, vec3(curUv, uLayer), dx, dy).a;
                  float prevD = curD;
                  for (int s = 0; s < 8; s++) {{
                    if (curL >= curD) break;
                    prevUv = curUv; prevD = curD; prevL = curL;
                    curUv -= dUv; curL += 0.125;
                    curD = 1.0 - textureGrad(aAlbH, vec3(curUv, uLayer), dx, dy).a;
                  }}
                  float af = curD - curL, bf = prevD - prevL;
                  float w = abs(af - bf) > 1e-5 ? clamp(af / (af - bf), 0.0, 1.0) : 0.0;
                  uv = mix(curUv, prevUv, w);
                }}
                vec4 ah = textureGrad(aAlbH, vec3(uv, uLayer), dx, dy);
                vec4 nr = textureGrad(aNrc, vec3(uv, uLayer), dx, dy);
                alb = srgbLin(ah.rgb);
                nts = decN(nr.rg);
                rgh = roughAA(nr.b, dx, dy, uVarLo, uVarHi);
                cav = nr.a;
              }}
              vec3 N = normalize(vWt * nts.x + vWb * nts.y + vWn * nts.z);
              vec3 col = shadePBR(alb, N, rgh, uSpec, cav, vWp);
              gl_FragColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(1.0/2.2)), 1.0);
            }}`
        }});
      }};
      groundMat = makeArr2Mat(true, 0, null);
      CFG.litOrder.slice(3).forEach((fam, idx) => {{ swatchMats[fam] = makeArr2Mat(false, idx + 3, CFG.families[fam]); }});
    }}
  }} else if (CFG.packFormat === 1) {{
    const texs = {{}};
    for (const fam of CFG.litOrder) {{
      texs[fam] = {{
        alb: makeTex2D(decoded[fam].map, false),
        nor: makeTex2D(decoded[fam].normalMap, false),
        rgh: makeTex2D(decoded[fam].roughnessMap, false),
      }};
    }}
    groundMat = new THREE.ShaderMaterial({{
      uniforms: {{
        a0: {{ value: texs.ground_grass.alb }}, n0: {{ value: texs.ground_grass.nor }}, r0: {{ value: texs.ground_grass.rgh }},
        a1: {{ value: texs.ground_moss.alb }},  n1: {{ value: texs.ground_moss.nor }},  r1: {{ value: texs.ground_moss.rgh }},
        a2: {{ value: texs.ground_gravel.alb }},n2: {{ value: texs.ground_gravel.nor }},r2: {{ value: texs.ground_gravel.rgh }},
        uEye, uSunDir
      }},
      vertexShader: `varying vec2 vUv; varying vec3 vWp; varying vec3 vWn; varying vec3 vWt; varying vec3 vWb;
        void main(){{ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vWp = wp.xyz;
          vWn = normalize(mat3(modelMatrix) * normal); vWt = vec3(1.0,0.0,0.0); vWb = vec3(0.0,0.0,-1.0);
          gl_Position = projectionMatrix * viewMatrix * wp; }}`,
      fragmentShader: `precision highp float;
        uniform sampler2D a0, n0, r0, a1, n1, r1, a2, n2, r2; uniform vec3 uEye; uniform vec3 uSunDir;
        varying vec2 vUv; varying vec3 vWp; varying vec3 vWn; varying vec3 vWt; varying vec3 vWb;
        ${{commonFrag}}
        void main(){{
          vec2 uv = vUv * 4.0;
          float w0 = clamp(0.5 + 0.5 * sin(vWp.x * 0.55), 0.0, 1.0);
          float w1 = clamp(0.5 + 0.5 * cos(vWp.z * 0.65), 0.0, 1.0) * (1.0 - w0);
          float w2 = max(0.0, 1.0 - w0 - w1);
          vec3 alb = srgbLin(texture(a0, uv).rgb)*w0 + srgbLin(texture(a1, uv).rgb)*w1 + srgbLin(texture(a2, uv).rgb)*w2;
          vec3 nts = normalize(decN(texture(n0, uv).rg)*w0 + decN(texture(n1, uv).rg)*w1 + decN(texture(n2, uv).rg)*w2);
          float rgh = texture(r0, uv).g*w0 + texture(r1, uv).g*w1 + texture(r2, uv).g*w2;
          vec3 N = normalize(vWt * nts.x + vWb * nts.y + vWn * nts.z);
          vec3 col = shadePBR(alb, N, rgh, 0.35, 1.0, vWp);
          gl_FragColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(1.0/2.2)), 1.0);
        }}`
    }});
    for (const fam of CFG.litOrder.slice(3)) {{
      const fc = CFG.families[fam];
      swatchMats[fam] = new THREE.ShaderMaterial({{
        uniforms: {{ tAlb: {{ value: texs[fam].alb }}, tNor: {{ value: texs[fam].nor }}, tRgh: {{ value: texs[fam].rgh }}, uEye, uSunDir, uSpec: {{ value: fc.specular }} }},
        vertexShader: `varying vec2 vUv; varying vec3 vWp; varying vec3 vWn; varying vec3 vWt; varying vec3 vWb;
          void main(){{ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vWp = wp.xyz;
            vWn = normalize(mat3(modelMatrix) * normal);
            vec3 up = abs(vWn.y) > 0.92 ? vec3(0.0,0.0,1.0) : vec3(0.0,1.0,0.0);
            vWt = normalize(cross(up, vWn)); vWb = cross(vWn, vWt);
            gl_Position = projectionMatrix * viewMatrix * wp; }}`,
        fragmentShader: `precision highp float;
          uniform sampler2D tAlb, tNor, tRgh; uniform vec3 uEye; uniform vec3 uSunDir; uniform float uSpec;
          varying vec2 vUv; varying vec3 vWp; varying vec3 vWn; varying vec3 vWt; varying vec3 vWb;
          ${{commonFrag}}
          void main(){{
            vec2 uv = vUv * 2.0;
            vec3 alb = srgbLin(texture(tAlb, uv).rgb);
            vec3 nts = decN(texture(tNor, uv).rg);
            float rgh = texture(tRgh, uv).g;
            vec3 N = normalize(vWt * nts.x + vWb * nts.y + vWn * nts.z);
            vec3 col = shadePBR(alb, N, rgh, uSpec, 1.0, vWp);
            gl_FragColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(1.0/2.2)), 1.0);
          }}`
      }});
    }}
  }} else {{
    const texs = {{}};
    for (const fam of CFG.litOrder) {{
      texs[fam] = {{
        albH: makeTex2D(decoded[fam].map, false),
        nrc: makeTex2D(decoded[fam].nrcMap, false),
      }};
    }}
    groundMat = new THREE.ShaderMaterial({{
      uniforms: {{
        a0: {{ value: texs.ground_grass.albH }}, n0: {{ value: texs.ground_grass.nrc }},
        a1: {{ value: texs.ground_moss.albH }},  n1: {{ value: texs.ground_moss.nrc }},
        a2: {{ value: texs.ground_gravel.albH }},n2: {{ value: texs.ground_gravel.nrc }},
        uEye, uSunDir
      }},
      vertexShader: `varying vec2 vUv; varying vec3 vWp; varying vec3 vWn; varying vec3 vWt; varying vec3 vWb;
        void main(){{ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vWp = wp.xyz;
          vWn = normalize(mat3(modelMatrix) * normal); vWt = vec3(1.0,0.0,0.0); vWb = vec3(0.0,0.0,-1.0);
          gl_Position = projectionMatrix * viewMatrix * wp; }}`,
      fragmentShader: `precision highp float;
        uniform sampler2D a0, n0, a1, n1, a2, n2; uniform vec3 uEye; uniform vec3 uSunDir;
        varying vec2 vUv; varying vec3 vWp; varying vec3 vWn; varying vec3 vWt; varying vec3 vWb;
        ${{commonFrag}}
        void main(){{
          vec2 uv = vUv * 4.0;
          float w0 = clamp(0.5 + 0.5 * sin(vWp.x * 0.55), 0.0, 1.0);
          float w1 = clamp(0.5 + 0.5 * cos(vWp.z * 0.65), 0.0, 1.0) * (1.0 - w0);
          float w2 = max(0.0, 1.0 - w0 - w1);
          vec4 nr0 = texture(n0, uv), nr1 = texture(n1, uv), nr2 = texture(n2, uv);
          vec3 alb = srgbLin(texture(a0, uv).rgb)*w0 + srgbLin(texture(a1, uv).rgb)*w1 + srgbLin(texture(a2, uv).rgb)*w2;
          vec3 nts = normalize(decN(nr0.rg)*w0 + decN(nr1.rg)*w1 + decN(nr2.rg)*w2);
          float rgh = nr0.b*w0 + nr1.b*w1 + nr2.b*w2;
          float cav = nr0.a*w0 + nr1.a*w1 + nr2.a*w2;
          vec3 N = normalize(vWt * nts.x + vWb * nts.y + vWn * nts.z);
          vec3 col = shadePBR(alb, N, rgh, 0.35, cav, vWp);
          gl_FragColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(1.0/2.2)), 1.0);
        }}`
    }});
    for (const fam of CFG.litOrder.slice(3)) {{
      const fc = CFG.families[fam];
      const mv = fc.mipVariance || [0,0,0,0,0,0,0,0];
      swatchMats[fam] = new THREE.ShaderMaterial({{
        uniforms: {{
          tAlbH: {{ value: texs[fam].albH }}, tNrc: {{ value: texs[fam].nrc }}, uEye, uSunDir,
          uPom: {{ value: fc.pomDepth || 0.0 }}, uSpec: {{ value: fc.specular }},
          uVarLo: {{ value: new THREE.Vector4(mv[0]||0, mv[1]||0, mv[2]||0, mv[3]||0) }},
          uVarHi: {{ value: new THREE.Vector4(mv[4]||0, mv[5]||0, mv[6]||0, mv[7]||0) }}
        }},
        vertexShader: `varying vec2 vUv; varying vec3 vWp; varying vec3 vWn; varying vec3 vWt; varying vec3 vWb;
          void main(){{ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vWp = wp.xyz;
            vWn = normalize(mat3(modelMatrix) * normal);
            vec3 up = abs(vWn.y) > 0.92 ? vec3(0.0,0.0,1.0) : vec3(0.0,1.0,0.0);
            vWt = normalize(cross(up, vWn)); vWb = cross(vWn, vWt);
            gl_Position = projectionMatrix * viewMatrix * wp; }}`,
        fragmentShader: `precision highp float;
          uniform sampler2D tAlbH, tNrc; uniform vec3 uEye; uniform vec3 uSunDir; uniform float uPom; uniform float uSpec;
          uniform vec4 uVarLo; uniform vec4 uVarHi;
          varying vec2 vUv; varying vec3 vWp; varying vec3 vWn; varying vec3 vWt; varying vec3 vWb;
          ${{commonFrag}}
          void main(){{
            vec2 uv = vUv * 2.0;
            vec2 dx = dFdx(uv), dy = dFdy(uv);
            if (uPom > 0.0001) {{
              vec3 V = normalize(uEye - vWp);
              vec3 vts = vec3(dot(V, vWt), dot(V, vWb), max(dot(V, vWn), 0.18));
              vec2 dUv = (vts.xy / vts.z) * uPom / 8.0;
              vec2 curUv = uv, prevUv = uv;
              float curL = 0.0, prevL = 0.0;
              float curD = 1.0 - textureGrad(tAlbH, curUv, dx, dy).a;
              float prevD = curD;
              for (int s = 0; s < 8; s++) {{
                if (curL >= curD) break;
                prevUv = curUv; prevD = curD; prevL = curL;
                curUv -= dUv; curL += 0.125;
                curD = 1.0 - textureGrad(tAlbH, curUv, dx, dy).a;
              }}
              float af = curD - curL, bf = prevD - prevL;
              float w = abs(af - bf) > 1e-5 ? clamp(af / (af - bf), 0.0, 1.0) : 0.0;
              uv = mix(curUv, prevUv, w);
            }}
            vec4 ah = textureGrad(tAlbH, uv, dx, dy);
            vec4 nr = textureGrad(tNrc, uv, dx, dy);
            vec3 alb = srgbLin(ah.rgb);
            vec3 nts = decN(nr.rg);
            float rgh = roughAA(nr.b, dx, dy, uVarLo, uVarHi);
            vec3 N = normalize(vWt * nts.x + vWb * nts.y + vWn * nts.z);
            vec3 col = shadePBR(alb, N, rgh, uSpec, nr.a, vWp);
            gl_FragColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(1.0/2.2)), 1.0);
          }}`
      }});
    }}
  }}

  // Ground plane + 4 hero swatch meshes (2 planar masonry/ashlar walls, 1 granite boulder, 1 curved glazed cylinder/sphere)
  const gPlane = new THREE.Mesh(new THREE.PlaneGeometry(14, 9, 1, 1), groundMat);
  gPlane.rotation.x = -Math.PI * 0.5;
  gPlane.name = 'ground';
  scene.add(gPlane);

  const mWall = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.2, 0.35), swatchMats.masonry_wall);
  mWall.position.set(-3.45, 1.12, -0.3);
  mWall.rotation.y = 0.28;
  scene.add(mWall);

  const aWall = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.2, 0.35), swatchMats.ashlar_wall);
  aWall.position.set(-1.12, 1.12, -0.45);
  aWall.rotation.y = 0.16;
  scene.add(aWall);

  const rockM = new THREE.Mesh(new THREE.IcosahedronGeometry(1.12, 4), swatchMats.cliff_rock);
  rockM.position.set(1.22, 1.08, -0.25);
  scene.add(rockM);

  const glazeM = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.98, 2.15, 64, 16), swatchMats.glazed_ceramic);
  glazeM.position.set(3.42, 1.08, -0.15);
  scene.add(glazeM);

  renderer.render(scene, camera);
  const loadMs = +(performance.now() - tLoad0).toFixed(2);

  // Measure 48 frames synchronously + RAF
  const ft = [];
  for (let i = 0; i < 48; i++) {{
    const t0 = performance.now();
    sun.position.x = 4.5 + Math.sin(i * 0.08) * 0.5;
    uSunDir.value.copy(sun.position).normalize();
    renderer.render(scene, camera);
    gl.finish();
    ft.push(performance.now() - t0);
  }}
  ft.sort((a, b) => a - b);

  // Gate 3 GPU Handedness Probe: render synthetic dome normal in offscreen target lit from +X vs -X and +Y vs -Y
  const dSz = 64, dData = new Uint8Array(dSz * dSz * 4);
  for (let y = 0; y < dSz; y++) {{
    for (let x = 0; x < dSz; x++) {{
      const u = (x + 0.5) / dSz, v = (y + 0.5) / dSz;
      const dx = (u - 0.5) * 3.0, dy = (v - 0.5) * 3.0;
      const g = Math.exp(-(dx * dx + dy * dy));
      let nx = dx * g * 0.85, ny = dy * g * 0.85, nz = 1.0;
      const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
      let r8, g8;
      if (CFG.normalEncoding === 'oct8') {{
        const enc = KMAT_M1.octEncode(nx, ny, nz); r8 = enc[0]; g8 = enc[1];
      }} else {{
        r8 = Math.round((nx * 0.5 + 0.5) * 255); g8 = Math.round((ny * 0.5 + 0.5) * 255);
      }}
      const o = (y * dSz + x) * 4;
      dData[o] = r8; dData[o + 1] = g8; dData[o + 2] = 180; dData[o + 3] = 255;
    }}
  }}
  const probeTex = new THREE.DataTexture(dData, dSz, dSz, THREE.RGBAFormat);
  probeTex.needsUpdate = true;
  const rt = new THREE.WebGLRenderTarget(64, 64);
  const pScene = new THREE.Scene();
  const pCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  pCam.position.set(0, 0, 2);
  const pLight = {{ value: new THREE.Vector3(1, 0, 0.35).normalize() }};
  const pMat = new THREE.ShaderMaterial({{
    uniforms: {{ tN: {{ value: probeTex }}, uL: pLight }},
    vertexShader: `varying vec2 vUv; void main(){{ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }}`,
    fragmentShader: `precision highp float; uniform sampler2D tN; uniform vec3 uL; varying vec2 vUv; ${{octGlsl}}
      void main(){{ vec3 n = decN(texture(tN, vUv).rg); float d = max(dot(n, normalize(uL)), 0.0); gl_FragColor = vec4(vec3(d), 1.0); }}`
  }});
  pScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), pMat));
  const pxBuf = new Uint8Array(64 * 64 * 4);
  const sampleQuad = (x0, x1, y0, y1) => {{
    let s = 0, c = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {{ s += pxBuf[(y * 64 + x) * 4]; c++; }}
    return s / c;
  }};
  pLight.value.set(0.85, 0.0, 0.45).normalize();
  renderer.setRenderTarget(rt); renderer.render(pScene, pCam);
  gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pxBuf);
  const rightLit = sampleQuad(38, 54, 24, 40), leftShadow = sampleQuad(10, 26, 24, 40);

  pLight.value.set(0.0, 0.85, 0.45).normalize();
  renderer.render(pScene, pCam);
  gl.readPixels(0, 0, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pxBuf);
  const topLit = sampleQuad(24, 40, 38, 54), botShadow = sampleQuad(24, 40, 10, 26);
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  window._m1Bench = {{
    mode: CFG.mode,
    loadMs,
    medianMs: +ft[Math.floor(ft.length * 0.5)].toFixed(3),
    p95Ms: +ft[Math.floor(ft.length * 0.95)].toFixed(3),
    calls: renderer.info.render.calls,
    tris: renderer.info.render.triangles,
    gate3Handedness: {{
      ok: rightLit > leftShadow + 35 && topLit > botShadow + 35,
      rightMinusLeft: +(rightLit - leftShadow).toFixed(1),
      topMinusBottom: +(topLit - botShadow).toFixed(1),
    }}
  }};
  window._ready = true;
}})();
</script></body></html>"""


async def run_web_benchmarks(manifest, shot_path=None):
    from playwright.async_api import async_playwright
    import harness

    three_path = harness.local_three(ROOT)
    three_src = open(three_path, encoding='utf-8').read()
    m1_src = open(os.path.join(ROOT, 'core', 'materials', 'record', '27-matlib-m1.js'), encoding='utf-8').read()

    modes = [
        'v1_three_maps',
        'v2_two_maps_xy6',
        'v2_two_maps_xy8',
        'v2_two_maps_oct8',
        'v3_arrays_three_maps',
        'v4_arrays_two_maps',
    ]
    results = {}
    with tempfile.TemporaryDirectory(prefix='krator_m1_web_') as tmpd:
        for mk in modes:
            html = _build_web_html(manifest, mk, three_src, m1_src)
            hp = os.path.join(tmpd, mk + '.html')
            with open(hp, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(html)
            results[mk] = {'pageBytes': os.path.getsize(hp), 'htmlPath': hp}

        async with async_playwright() as pw:
            browser = await harness.launch_chromium(pw)
            page = await browser.new_page(viewport={'width': 960, 'height': 540})
            gl_renderer = await page.evaluate(harness.RENDERER_JS)
            for mk in modes:
                hp = results[mk].pop('htmlPath')
                await page.goto('file://' + hp, wait_until='load')
                await page.wait_for_function('window._ready === true', timeout=30000)
                bench = await page.evaluate('window._m1Bench')
                samplers = await page.evaluate(harness.SAMPLERS_JS)
                vram = await page.evaluate(harness.VRAM_JS)
                results[mk].update({
                    'pageMB': round(results[mk]['pageBytes'] / 1048576.0, 2),
                    'renderer': gl_renderer,
                    'loadMs': bench['loadMs'],
                    'medianMs': bench['medianMs'],
                    'p95Ms': bench['p95Ms'],
                    'calls': bench['calls'],
                    'tris': bench['tris'],
                    'linkedPrograms': samplers['programs'],
                    'maxSamplersPerProgram': samplers['max'],
                    'programTopSamplers': [{'name': t['name'], 'samplers': t['n']} for t in samplers['top'][:3]],
                    'maxTexUnitsAllowed': samplers['units'],
                    'gate2SamplersOk': samplers['max'] < harness.SAMPLER_FAIL,
                    'gate3Handedness': bench['gate3Handedness'],
                    'vram': vram,
                })
                if shot_path and mk == 'v4_arrays_two_maps':
                    os.makedirs(os.path.dirname(shot_path), exist_ok=True)
                    await page.screenshot(path=shot_path)
            await browser.close()

    manifest['webBenchmark'] = results
    mpath = os.path.join(OUT_DIR, 'manifest.json')
    with open(mpath, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(json.dumps(manifest, indent=2, sort_keys=True) + '\n')

    print('\n=== WebGL2 Benchmark Summary (%s) ===' % results['v1_three_maps']['renderer'])
    for mk in modes:
        r = results[mk]
        print('  %-22s  page=%5.2f MB  vram=%5.2f MB (%2d tex)  max_samp=%2d  load=%6.1f ms  med=%5.2f ms  gate3=%s' % (
            mk, r['pageMB'], r['vram']['texMB'], r['vram']['texN'],
            r['maxSamplersPerProgram'], r['loadMs'], r['medianMs'], r['gate3Handedness']['ok']))
    return results


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('--size', type=int, default=512)
    ap.add_argument('--reuse-tex', action='store_true', help='reuse existing packed WebP files in godot/data/m1_slice/tex')
    ap.add_argument('--web', action='store_true', help='run headless Chromium WebGL2 benchmark across all 6 variants')
    ap.add_argument('--shot', default=None, help='optional PNG path for WebGL2 swatch gallery screenshot')
    a = ap.parse_args(argv)
    manifest = pack_all_variants(size=a.size, reuse_tex=a.reuse_tex)
    if a.web:
        asyncio.run(run_web_benchmarks(manifest, shot_path=a.shot))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
