#!/usr/bin/env python3
"""Export real biome flora prototypes (Mantis Socotran monsoon forest + Catch oases) and the four
Catch & Bowl Ancient Arcologies into godot/data/catch-bowl/{flora-mantis,flora-catch,arcologies}/.

Usage:
    python3 openworld/catch-bowl/tools/export_assets_godot.py
    python3 openworld/catch-bowl/tools/export_assets_godot.py --only=flora
    python3 openworld/catch-bowl/tools/export_assets_godot.py --only=arcologies

Prereqs:
    Built HTML pages (temporary in working tree if needed, reverted after export):
      biomes/sedesert/dist/sedesert-mantis.html
      biomes/catch/dist/catch.html
      kits/ancients/dist/{parabola,arckibuz,hill,monolith}.html
"""
import asyncio
import base64
import glob
import json
import os
import shutil
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(REPO, "tools"))

OUT_ROOT = os.path.join(REPO, "godot", "data", "catch-bowl")
SPIKE_INJECT = [
    os.path.join(REPO, "godot", "tools", "vendor", "GLTFExporter.r128.js"),
    os.path.join(REPO, "godot", "tools", "spike_export.js"),
]


def ensure_chrome():
    if os.environ.get("KRATOR_CHROME"):
        return
    c = sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"))
    if c:
        os.environ["KRATOR_CHROME"] = c[-1]
        return
    if os.path.isfile("/usr/bin/google-chrome"):
        os.environ["KRATOR_CHROME"] = "/usr/bin/google-chrome"


def copy_library_packs(H, w, page_abs, out_dir):
    packs = sorted({t["pack"] for t in w.get("textures", []) if t.get("from") == "library"})
    if not packs:
        return 0
    dst = os.path.join(out_dir, "tex")
    shutil.rmtree(dst, ignore_errors=True)
    os.makedirs(dst, exist_ok=True)
    copied = {}
    for name in packs:
        fams = {t["family"] for t in w["textures"] if t.get("pack") == name}
        src = H._pack_dir(name, page_abs, fams)
        if not src:
            for cand in (
                os.path.join(REPO, "biomes", "sedesert", "stations", name, "tex"),
                os.path.join(REPO, "biomes", name, "tex"),
            ):
                if os.path.isfile(os.path.join(cand, "pack.json")):
                    src = cand
                    break
        if not src:
            raise RuntimeError("no tex/pack.json for library pack %s" % name)
        with open(os.path.join(src, "pack.json"), encoding="utf-8") as f:
            pj = json.load(f)
        rename = {}
        for fam in sorted(fams):
            for fn in sorted(set(pj["families"].get(fam, {}).get("files", {}).values())):
                to = fn
                if fn in copied and copied[fn] != name:
                    to = rename[fn] = name + "." + fn
                copied[to] = name
                shutil.copyfile(os.path.join(src, fn), os.path.join(dst, to))
        pjo = os.path.join(dst, "pack.json" if len(packs) == 1 else name + ".pack.json")
        if rename:
            for e in pj["families"].values():
                e["files"] = {k: rename.get(v, v) for k, v in e.get("files", {}).items()}
            with open(pjo, "w", encoding="utf-8", newline="\n") as f:
                json.dump(pj, f, indent=1, sort_keys=True)
        else:
            shutil.copyfile(os.path.join(src, "pack.json"), pjo)
    return sum(os.path.getsize(os.path.join(dst, f)) for f in os.listdir(dst))


HARVEST_COMMON_JS = r"""
const E = window.EXPORT;
const SC = (typeof BIO !== 'undefined' && BIO.host && BIO.host.scene) ? BIO.host.scene : scene;
SC.traverse(m => { if (m && m.isMesh) m.visible = false; });
BIO.terrainH = () => 0;
BIO.waterH = () => -1e9;
BIO.mask = () => 1;
BIO.clearOf = () => true;

const WMAT = new Map();
function worldMat(m) {
  if (WMAT.has(m)) return WMAT.get(m);
  let w = null;
  const b = m.userData && m.userData.bio;
  if (b && b.kind === 'leaf') {
    const o = b.opts || {};
    w = new THREE.MeshLambertMaterial({ map: m.map, alphaTest: m.alphaTest || 0.42, side: THREE.DoubleSide, vertexColors: true });
    w.name = m.name || 'leaf';
    w.userData.kind = 'leaf';
    w.userData.opts = o;
    w.userData.bio = { kind: 'leaf', key: b.key || null, opts: o };
    if (m.userData && m.userData.lib) w.userData.lib = m.userData.lib;
  } else if (m.isMeshLambertMaterial || m.isMeshPhongMaterial || m.isMeshStandardMaterial || m.isMeshBasicMaterial) {
    w = m.clone();
    w.vertexColors = true;
    w.userData = Object.assign({}, m.userData || {});
    w.userData.kind = b ? b.kind : 'plain';
    if (b) w.userData.bio = b;
  }
  WMAT.set(m, w);
  return w;
}

function clearKit(kn) {
  const R = BIO.kits[kn];
  for (const name of R.order) {
    const it = R.items[name];
    it.m = new BIO.F32(); it.c = new BIO.F32(); it.n = new BIO.F32(); it.c2 = new BIO.F32();
    for (const a in it.x) it.x[a] = new BIO.F32();
    it.k = []; it.count = 0;
  }
  for (const fam in R.buckets) {
    const K = R.buckets[fam];
    K.pos = new BIO.F32(); K.nor = new BIO.F32(); K.uv = new BIO.F32(); K.col = new BIO.F32();
    K.k = []; K.tris = 0;
  }
}

const _m = new THREE.Matrix4(), _nm = new THREE.Matrix3(), _v = new THREE.Vector3(), _n = new THREE.Vector3();
function harvestKit(kn) {
  const R = BIO.kits[kn], G = new Map();
  const grp = m => {
    const w = worldMat(m);
    if (!w) return null;
    let g = G.get(w);
    if (!g) { g = { mat: w, P: [], N: [], U: [], C: [], AN: [], AC: [], aN: false, aC2: false }; G.set(w, g); }
    return g;
  };
  for (const name of R.order) {
    const it = R.items[name];
    if (!it.count) continue;
    const def = R.defs[name], g = grp(def.mat);
    if (g) {
      const geo = def.geo, P = geo.attributes.position.array;
      const N = geo.attributes.normal ? geo.attributes.normal.array : null;
      const U = geo.attributes.uv ? geo.attributes.uv.array : null;
      const VC = geo.attributes.color ? geo.attributes.color.array : null;
      const idx = geo.index ? geo.index.array : null;
      const nV = idx ? idx.length : geo.attributes.position.count;
      const hasN = def.attrs && def.attrs.indexOf('aN') >= 0;
      const hasC2 = def.attrs && def.attrs.indexOf('aC2') >= 0;
      if (hasN) g.aN = true;
      if (hasC2) g.aC2 = true;
      const IM = it.m.a, IC = it.c.a, INN = it.n.a, IC2 = it.c2.a;
      for (let i = 0; i < it.count; i++) {
        _m.fromArray(IM, i * 16); _nm.getNormalMatrix(_m);
        for (let vi = 0; vi < nV; vi++) {
          const k = idx ? idx[vi] : vi;
          _v.set(P[k * 3], P[k * 3 + 1], P[k * 3 + 2]).applyMatrix4(_m);
          g.P.push(_v.x, _v.y, _v.z);
          if (N) { _n.set(N[k * 3], N[k * 3 + 1], N[k * 3 + 2]).applyMatrix3(_nm).normalize(); g.N.push(_n.x, _n.y, _n.z); }
          else g.N.push(0, 1, 0);
          g.U.push(U ? U[k * 2] : 0, U ? U[k * 2 + 1] : 0);
          const r = IC[i * 3], gg = IC[i * 3 + 1], b = IC[i * 3 + 2];
          if (VC) g.C.push(r * VC[k * 3], gg * VC[k * 3 + 1], b * VC[k * 3 + 2]);
          else g.C.push(r, gg, b);
          g.AN.push(hasN ? INN[i * 3] : 0, hasN ? INN[i * 3 + 1] : 1, hasN ? INN[i * 3 + 2] : 0);
          g.AC.push(hasC2 ? IC2[i * 3] : r, hasC2 ? IC2[i * 3 + 1] : gg, hasC2 ? IC2[i * 3 + 2] : b);
        }
      }
    }
  }
  for (const fam in R.buckets) {
    const K = R.buckets[fam];
    if (!K.pos.length) continue;
    const g = grp(K.mat);
    if (g) {
      const P = K.pos.a, N = K.nor.a, U = K.uv.a, C = K.col.a, n = K.pos.length / 3;
      for (let k = 0; k < n; k++) {
        g.P.push(P[k * 3], P[k * 3 + 1], P[k * 3 + 2]);
        g.N.push(N[k * 3], N[k * 3 + 1], N[k * 3 + 2]);
        g.U.push(U[k * 2], U[k * 2 + 1]);
        g.C.push(C[k * 3], C[k * 3 + 1], C[k * 3 + 2]);
        g.AN.push(N[k * 3], N[k * 3 + 1], N[k * 3 + 2]);
        g.AC.push(C[k * 3], C[k * 3 + 1], C[k * 3 + 2]);
      }
    }
  }
  clearKit(kn);
  const parts = [];
  let tris = 0, y1 = 0, rad = 0;
  for (const g of G.values()) {
    if (!g.P.length) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(g.P, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(g.N, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(g.U, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(g.C, 3));
    if (g.mat.userData.kind === 'leaf') {
      if (g.mat.userData.opts && g.mat.userData.opts.aN) geo.setAttribute('aN', new THREE.Float32BufferAttribute(g.AN, 3));
      if (g.mat.userData.opts && g.mat.userData.opts.irid) geo.setAttribute('aC2', new THREE.Float32BufferAttribute(g.AC, 3));
    }
    geo.computeBoundingSphere();
    tris += g.P.length / 9;
    for (let k = 0; k < g.P.length; k += 3) {
      if (g.P[k + 1] > y1) y1 = g.P[k + 1];
      const d = Math.hypot(g.P[k], g.P[k + 2]);
      if (d > rad) rad = d;
    }
    parts.push({ geo, mat: g.mat });
  }
  return { parts, tris, top: y1, radius: rad };
}

const protos = [];
const ident = new THREE.Matrix4().toArray();
function stageProto(pkey, species, name, H, crownR, h) {
  if (!h.parts.length) return;
  const arr = new Float32Array(16); arr.set(ident, 0);
  const attr = new THREE.InstancedBufferAttribute(arr, 16);
  const white = new THREE.InstancedBufferAttribute(new Float32Array([1, 1, 1]), 3);
  for (const part of h.parts) {
    const m = new THREE.InstancedMesh(part.geo, part.mat, 1);
    m.instanceMatrix = attr;
    m.instanceColor = white;
    m.frustumCulled = false;
    m.count = 1;
    m.visible = true;
    m.userData.flora = pkey;
    m.updateMatrix();
    m.updateMatrixWorld(true);
    SC.add(m);
  }
  protos.push({ key: pkey, species, name, H: +H.toFixed(3), crownR: +crownR.toFixed(3), tris: Math.round(h.tris) });
}

const BIO_SWAY = {
  '1.0': [1, [0, 0, 0]], '1': [1, [0, 0, 0]], '0.0': [0, [0, 0, 0]], '0': [0, [0, 0, 0]],
  '(-position.y)': [0, [0, -1, 0]], '(position.y)': [0, [0, 1, 0]],
  '(position.x)': [0, [1, 0, 0]], '(-position.x)': [0, [-1, 0, 0]],
  '(position.z)': [0, [0, 0, 1]], '(-position.z)': [0, [0, 0, -1]]
};
function swayBio(o) {
  if (!o || !('swayW' in o || 'swayA' in o)) return null;
  const e = String(o.swayW == null ? '1.0' : o.swayW).replace(/\s/g, ''), k = BIO_SWAY[e];
  const a = o.swayA == null ? 0.06 : +o.swayA, ax = o.axis == null ? 0 : o.axis | 0;
  return k ? { c: k[0], w: k[1], a, axis: ax } : { text: e, a, axis: ax };
}
function attrF32(a, n) {
  if (!a) return null;
  if (a.isInterleavedBufferAttribute || !(a.array instanceof Float32Array)) {
    const f = new Float32Array(a.count * n);
    for (let i = 0; i < a.count; i++) for (let k = 0; k < n; k++) f[i * n + k] = a.getComponent ? a.getComponent(i, k) : a.array[i * a.itemSize + k];
    return f;
  }
  return a.array.slice(0, a.count * n);
}

function runWorldExport(packName, srcLabel) {
  const instForItem = [], seenMats = [];
  let lastInst = null;
  const matKeys = () => {
    const mk = new Map(); let n = 0;
    SC.traverse(m => {
      if (!m || !m.isMesh || !m.visible) return;
      const mt = m.material;
      if (!mt || mk.has(mt)) return;
      const ud = mt.userData || {}, b = ud.bio || (ud.kind && ud.kind !== 'plain' ? { kind: ud.kind, key: null, opts: ud.opts || null } : null);
      if (b && b.kind && b.kind !== 'plain') mk.set(mt, 'bio_' + b.kind + '_' + (b.key || mt.name || '') + '_' + (n++));
    });
    return mk;
  };
  const scene_ = ctx => ctx.memo('flora-lib', () => {
    const res = E.sceneReader({
      name: packName, source: srcLabel, scene: SC, tags: null, origin: [0, 0, 0], matKeys,
      hooks: m => { seenMats.push(m); return []; },
      ownerOf: m => { if (m !== lastInst) { instForItem.push(m); lastInst = m; } return null; },
      kitOf: m => m.userData && m.userData.flora ? 'flora/' + m.userData.flora + '/' + (m.material && m.material.name || '') + (m.geometry ? '#' + m.geometry.id : '') : null,
      itemKit: kit => kit && kit.indexOf('flora/') === 0 ? 'flora' : 'world',
      skipInstanced: m => m.visible === false || !(m.userData && m.userData.flora) ? 'non-flora' : null,
      skipMesh: () => 'flora-only'
    }).assemble(ctx);
    const matObjById = new Map();
    if (res.materials && seenMats.length === res.materials.length) {
      for (let i = 0; i < seenMats.length; i++) matObjById.set(res.materials[i].id, seenMats[i]);
    }
    const matById = new Map();
    for (const r of (res.materials || [])) {
      matById.set(r.id, r);
      const m = matObjById.get(r.id);
      if (!m) continue;
      const ud = m.userData || {}, b = ud.bio;
      if (!b || !b.kind || b.kind === 'plain') continue;
      r.kind = b.kind;
      const o = b.opts || {};
      if (b.kind === 'leaf') {
        if (!(r.alphaTest > 0)) r.alphaTest = 0.42;
        const swA = o.swayA == null ? 0.06 : +o.swayA;
        r.options = { swayA: swA, axis: 0, aN: false, irid: false };
        r.sway = { c: 0, w: [0, 0.05, 0], a: swA, axis: 0 };
      } else {
        r.options = {};
        r.sway = swayBio(o);
      }
    }
    const items = res.items || [];
    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx], m = instForItem[idx];
      if (!m || !m.geometry) continue;
      const g = m.geometry, mr = matById.get(it.material);
      if (g.attributes.color && !it.geometry.color) {
        const csz = g.attributes.color.itemSize === 4 ? 4 : 3;
        it.geometry.color = E.pack(attrF32(g.attributes.color, csz));
      }
      if (g.attributes.aN && it.geometry.normal && mr && mr.kind === 'leaf') {
        const N = E.unpack(it.geometry.normal), AN = attrF32(g.attributes.aN, 3);
        if (N && AN && N.length === AN.length) {
          for (let i = 0; i < N.length; i += 3) {
            const nx = N[i] * 0.3 + AN[i] * 0.7, ny = N[i + 1] * 0.3 + AN[i + 1] * 0.7, nz = N[i + 2] * 0.3 + AN[i + 2] * 0.7;
            const l = Math.hypot(nx, ny, nz);
            if (l > 1e-6) { N[i] = nx / l; N[i + 1] = ny / l; N[i + 2] = nz / l; }
          }
          it.geometry.normal = E.pack(N);
        }
      }
      if (mr && mr.kind !== 'leaf' && it.geometry.position) {
        const P = E.unpack(it.geometry.position);
        let yMax = 0;
        for (let i = 1; i < P.length; i += 3) if (P[i] > yMax) yMax = P[i];
        if (yMax >= 2.2) {
          for (let i = 0; i < P.length; i += 3) {
            const vy0 = P[i + 1], rxz = Math.hypot(P[i], P[i + 2]);
            if (vy0 <= 0.32) {
              const w = 1 - Math.max(0, vy0) / 0.32, drop = Math.min(4.0, 0.65 + 0.45 * rxz);
              P[i + 1] = vy0 - drop * w;
            }
          }
          it.geometry.position = E.pack(P);
        }
      }
    }
    return res;
  });
    ['items', 'materials', 'textures'].forEach(s => E.register(s, ctx => scene_(ctx)[s], { by: 'biome' }));
  const w = E.world({ box: [-16, -16, 16, 16], sections: ['items', 'materials', 'textures'] });
  if (w.errors && w.errors.length) throw new Error('world export errors: ' + JSON.stringify(w.errors));
  const g = E.glb(w);
  return { protos: { format: 'krator-flora-protos', version: 1, protos }, world: g.json, glb: E.pack(g.glb).b64, glbStats: g.stats };
}
"""

MANTIS_FLORA_JS = (
    "() => {\n"
    + HARVEST_COMMON_JS
    + r"""
  BIO.kit('sedesert');
  SEDESERT.blocked = () => false;
  clearKit('sedesert');
  const SP = SEDESERT.SPECIES;
  const spOf = k => SP.indexOf(SEDESERT.byKey[k]);
  const treeSpecs = [
    ['mantis_fig', 'figv', 2],
    ['dragon_blood', 'dragon', 2],
    ['frankincense', 'incense', 2],
    ['cucumber_tree', 'cucumber', 2],
    ['sterculia', 'sterc', 2],
    ['pomegranate', 'pom', 2],
    ['date_palm', 'palm', 2],
    ['mesquite', 'mesquite', 2],
    ['bottle_tree', 'bottle', 1],
    ['candelabra', 'candelabra', 1],
    ['desert_rose', 'rose', 1],
  ];
  for (const [outKey, spKey, nVar] of treeSpecs) {
    const sp = spOf(spKey);
    if (sp < 0) continue;
    const S = SP[sp];
    for (let v = 0; v < nVar; v++) {
      clearKit('sedesert');
      BIO.fn.reseed(KRAND.hash(7001, 11, sp, v));
      const T = SEDESERT.make(sp, 0, 0, 0);
      if (SEDESERT.ABYSSAL && SEDESERT.ABYSSAL[spKey]) {
        const A = SEDESERT.ABYSSAL[spKey];
        T.H *= A.H; T.rb *= A.rb; T.crownR *= A.crownR;
      }
      SEDESERT.grow(T, 2);
      const h = harvestKit('sedesert');
      stageProto(outKey + '|' + v, outKey, S.name, T.H, T.crownR, h);
    }
  }
  // Undergrowth clumps: Socotran ferns, aloe + kalanchoe, croton + monsoon grass
  {
    clearKit('sedesert');
    BIO.fn.reseed(77101);
    const { rr, TAU } = BIO.fn, { tuft, card, agaveR } = SEDESERT.small;
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * TAU + rr(-0.2, 0.2), d = i ? rr(0.35, 1.1) : 0, h0 = rr(0.65, 1.25);
      tuft('fern', Math.cos(a) * d, 0, Math.sin(a) * d, h0 * 1.3, h0, SEDESERT.leafCol([0x4a7a2e, 0x56883a, 0x3e6a28], 1.2, 0.03));
    }
    const h = harvestKit('sedesert');
    stageProto('mantis_fern|0', 'mantis_fern', 'Socotran spring ferns', Math.max(0.8, h.top), Math.max(1.2, h.radius), h);
  }
  {
    clearKit('sedesert');
    BIO.fn.reseed(77102);
    const { rr, TAU } = BIO.fn, { tuft, agaveR } = SEDESERT.small;
    agaveR(0, 0, 0, SEDESERT.PAL.agaveRed, 0.85);
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * TAU + 0.4, d = rr(0.45, 0.9), h0 = rr(0.6, 1.1);
      tuft('spire', Math.cos(a) * d, 0, Math.sin(a) * d, h0, h0 * 0.4, SEDESERT.leafCol([0xe0602a, 0xf07a30], 1.2, 0.02));
    }
    const h = harvestKit('sedesert');
    stageProto('mantis_aloe|0', 'mantis_aloe', 'Socotran aloe & kalanchoe', Math.max(0.9, h.top), Math.max(1.1, h.radius), h);
  }
  {
    clearKit('sedesert');
    BIO.fn.reseed(77103);
    const { rr, TAU } = BIO.fn, { tuft, card } = SEDESERT.small;
    card('small', 0, 0.55, 0, 1.8, 1.15, SEDESERT.leafCol([0x8a9a7a, 0x96a484], 1.25, 0.03), 0.25);
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * TAU, d = rr(0.6, 1.2), h0 = rr(0.9, 1.45);
      tuft(i === 0 ? 'rankgrass' : 'grass', Math.cos(a) * d, 0, Math.sin(a) * d, h0, h0 * 1.2, SEDESERT.leafCol([0x8a9442, 0x7e8a3e], 1.2, 0.03));
    }
    const h = harvestKit('sedesert');
    stageProto('mantis_croton|0', 'mantis_croton', 'Croton & monsoon savanna grass', Math.max(1.2, h.top), Math.max(1.5, h.radius), h);
  }
  return runWorldExport('sedesert', 'biomes/sedesert (mantis)');
}"""
)

CATCH_FLORA_JS = (
    "() => {\n"
    + HARVEST_COMMON_JS
    + r"""
  BIO.kit('catch');
  CATCH.blocked = () => false;
  clearKit('catch');
  const SP = CATCH.SPECIES, { rr, ri, TAU, qEuler } = BIO.fn, { bright, vary } = BIO.col;
  const newSt = () => ({ trunk: 0, limb: 0, far: 0, leaves: 0 });
  // Living Euphrates tugai poplar (2 variants), golden poplar (1), dead standing poplar snag (2)
  for (let v = 0; v < 2; v++) {
    clearKit('catch');
    BIO.fn.reseed(KRAND.hash(7002, 1, v));
    const S = SP[0], H = rr(S.H[0], S.H[1]), rb = rr(S.rb[0], S.rb[1]), crownR = rr(S.crownR[0], S.crownR[1]);
    CATCH.B[0]({ x: 0, z: 0, y0: -0.3, sp: 0, H, rb, crownR, dead: false, gold: false, seed: 100 + v }, newSt(), 2);
    const h = harvestKit('catch');
    stageProto('poplar_live|' + v, 'poplar_live', 'Euphrates poplar (tugai)', H, crownR, h);
  }
  {
    clearKit('catch');
    BIO.fn.reseed(KRAND.hash(7002, 2, 0));
    const S = SP[0], H = rr(S.H[0], S.H[1]), rb = rr(S.rb[0], S.rb[1]), crownR = rr(S.crownR[0], S.crownR[1]);
    CATCH.B[0]({ x: 0, z: 0, y0: -0.3, sp: 0, H, rb, crownR, dead: false, gold: true, seed: 201 }, newSt(), 2);
    const h = harvestKit('catch');
    stageProto('poplar_gold|0', 'poplar_gold', 'Euphrates poplar (autumn gold)', H, crownR, h);
  }
  for (let v = 0; v < 2; v++) {
    clearKit('catch');
    BIO.fn.reseed(KRAND.hash(7002, 3, v));
    const S = SP[0], H = rr(S.H[0], S.H[1]) * 0.78, rb = rr(S.rb[0], S.rb[1]), crownR = rr(S.crownR[0], S.crownR[1]) * 0.65;
    CATCH.B[0]({ x: 0, z: 0, y0: -0.3, sp: 0, H, rb, crownR, dead: true, gold: false, seed: 300 + v }, newSt(), 2);
    const h = harvestKit('catch');
    stageProto('poplar_dead|' + v, 'poplar_dead', 'Dead standing tugai poplar', H, crownR, h);
  }
  // Salt cedar / tamarisk (2 variants)
  for (let v = 0; v < 2; v++) {
    clearKit('catch');
    BIO.fn.reseed(KRAND.hash(7002, 4, v));
    const S = SP[1], H = rr(S.H[0], S.H[1]), rb = rr(S.rb[0], S.rb[1]), crownR = rr(S.crownR[0], S.crownR[1]);
    CATCH.B[1]({ x: 0, z: 0, y0: -0.2, sp: 1, H, rb, crownR, seed: 400 + v }, newSt(), 2);
    const h = harvestKit('catch');
    stageProto('tamarisk|' + v, 'tamarisk', 'Salt cedar (tamarisk)', H, crownR, h);
  }
  // Dune broom shrub, saltbush, brine lamps
  {
    clearKit('catch');
    BIO.fn.reseed(78201);
    const h0 = 2.1;
    BIO.put('broom', [0, -0.05, 0], qEuler(0, 0.4, 0), [h0, h0, h0], CATCH.C(0xffffff));
    const h = harvestKit('catch');
    stageProto('broom|0', 'broom', 'Dune broom shrub', h0, h0 * 0.6, h);
  }
  {
    clearKit('catch');
    BIO.fn.reseed(78202);
    const vc = set => bright(vary(BIO.fn.pick(set), 0.03, 0.1, 0.06), 1.1);
    BIO.put('saltbush0', [0, -0.08, 0], qEuler(0, 0.2, 0), [1.5, 1.3, 1.5], CATCH.col('saltbush', vc(CATCH.PAL.saltbush)));
    BIO.put('saltbush2', [0.85, -0.08, 0.4], qEuler(0, 2.1, 0), [1.1, 0.95, 1.1], CATCH.col('saltbush', vc(CATCH.PAL.saltbush)));
    const h = harvestKit('catch');
    stageProto('saltbush|0', 'saltbush', 'Saltbush', 1.3, 1.4, h);
  }
  {
    clearKit('catch');
    BIO.fn.reseed(78203);
    const vc = set => bright(vary(BIO.fn.pick(set), 0.03, 0.1, 0.06), 1.1);
    for (let k = 0; k < 3; k++) {
      const a = k * 2.09, d = k ? 0.75 : 0, s = 0.85;
      BIO.put('brinelamp' + k, [Math.cos(a) * d, -0.04, Math.sin(a) * d], qEuler(0, a, 0), [s, s, s], CATCH.col('brinelamp', vc(CATCH.PAL.brinelamp)));
    }
    const h = harvestKit('catch');
    stageProto('brinelamp|0', 'brinelamp', 'Brine lamps (halophyte)', 0.9, 1.2, h);
  }
  return runWorldExport('catch', 'biomes/catch');
}"""
)


NO_RENDER_INIT_JS = r"""
(() => {
  const wrapWR = fn => {
    if (!fn || fn._wrappedNoRender) return fn;
    const W = function(...args) {
      const inst = new fn(...args);
      inst.render = function() {};
      inst.compile = function() {};
      return inst;
    };
    W.prototype = fn.prototype;
    W._wrappedNoRender = true;
    return W;
  };
  let _T = undefined;
  Object.defineProperty(window, 'THREE', {
    configurable: true,
    get() { return _T; },
    set(v) {
      _T = v;
      if (v && typeof v === 'object') {
        let _WR = wrapWR(v.WebGLRenderer);
        Object.defineProperty(v, 'WebGLRenderer', {
          configurable: true,
          enumerable: true,
          get() { return _WR; },
          set(fn) { _WR = wrapWR(fn); }
        });
      }
    }
  });
})();
"""


async def evaluate_big_async(pg, js, arg, chunk=4 << 20):
    n = await pg.evaluate(
        "async ([js, arg]) => { const f = (0, eval)(js); const r = await f(arg); window.__kbig = JSON.stringify(r); return window.__kbig.length; }",
        [js, arg],
    )
    parts = []
    for i in range(0, n, chunk):
        parts.append(await pg.evaluate("([i, k]) => window.__kbig.slice(i, i + k)", [i, chunk]))
    await pg.evaluate("() => { window.__kbig = null; }")
    return json.loads("".join(parts))


SCENE_READER_JS = os.path.join(REPO, "core", "export", "10-core-export-scene.js")


async def export_flora_pack(H, browser, port, page_rel, js_code, out_dir):
    t0 = time.time()
    shutil.rmtree(out_dir, ignore_errors=True)
    os.makedirs(out_dir, exist_ok=True)
    page_abs = os.path.join(REPO, page_rel)
    init_file = os.path.join(out_dir, "_norender.js")
    with open(init_file, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(NO_RENDER_INIT_JS)
    pg, errs, ready = await H.open_page(browser, page_abs, port, size="960x600", root=REPO, query="?q=0&diet=0", init=[init_file])
    os.remove(init_file)
    if not ready:
        raise RuntimeError(f"page never ready: {page_rel} (errs={errs[:3]})")
    await pg.wait_for_function("!window._texPending", timeout=120000)
    await pg.evaluate("() => { window.requestAnimationFrame = () => 0; }")
    await H.inject_export(pg)
    if not await pg.evaluate("typeof EXPORT !== 'undefined' && typeof EXPORT.sceneReader === 'function'"):
        await pg.add_script_tag(path=SCENE_READER_JS)
    res = await evaluate_big_async(pg, js_code, None)
    await pg.close()
    w = res["world"]
    protos_doc = res["protos"]
    with open(os.path.join(out_dir, "world.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(w, f, separators=(",", ":"))
    with open(os.path.join(out_dir, "world.glb"), "wb") as f:
        f.write(base64.b64decode(res["glb"]))
    with open(os.path.join(out_dir, "protos.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(protos_doc, f, indent=1)
    tex_sz = copy_library_packs(H, w, page_abs, out_dir)
    glb_sz = os.path.getsize(os.path.join(out_dir, "world.glb"))
    print(
        f"  {os.path.relpath(out_dir, REPO).replace(os.sep, '/')}: "
        f"{len(protos_doc['protos'])} protos, {len(w.get('items', []))} items, "
        f"glb {glb_sz / 1e6:.2f} MB, tex {tex_sz / 1e6:.2f} MB in {time.time() - t0:.1f}s ({len(errs)} page errs)",
        flush=True,
    )


ARCOLOGY_CASES = [
    {
        "key": "parabola",
        "site_id": "scyeauyek7",
        "site_name": "Parabola",
        "page": "kits/ancients/dist/parabola.html",
        "sx": 1700.0,
        "sz": 0.0,
        "half": 1220.0,
        "ruined": True,
        "yaw_deg": 0.0,
    },
    {
        "key": "arckibuz",
        "site_id": "skz25tuq0w",
        "site_name": "Arcbeam",
        "page": "kits/ancients/dist/arckibuz.html",
        "sx": 0.0,
        "sz": 0.0,
        "half": 470.0,
        "ruined": False,
        "yaw_deg": 24.0,
    },
    {
        "key": "hill",
        "site_id": "s2o8f4p123",
        "site_name": "Stair",
        "page": "kits/ancients/dist/hill.html",
        "sx": 2600.0,
        "sz": 0.0,
        "half": 2150.0,
        "ruined": True,
        "yaw_deg": -35.0,
    },
    {
        "key": "monolith",
        "site_id": "sodpa02bfv",
        "site_name": "Unmarked Ancient Ruin",
        "page": "kits/ancients/dist/monolith.html",
        "sx": 2400.0,
        "sz": 0.0,
        "half": 1150.0,
        "ruined": True,
        "unlabelled": True,
        "yaw_deg": 18.0,
    },
]

PREP_ARCOLOGY_JS = r"""async ([sx, sz, half, ruined, name]) => {
  scene.updateMatrixWorld(true);
  scene.traverse(o => {
    if (!o || !o.isMesh) return;
    const nm = (o.name || '') + ' ' + ((o.parent && o.parent.name) || '');
    if (o.userData && o.userData.probeSkip) { o.visible = false; return; }
    if (/\b(sky|giant|groundM|ix_)\b/i.test(nm)) { o.visible = false; return; }
    const m = Array.isArray(o.material) ? o.material[0] : o.material;
    if (m && (m.isShaderMaterial || m.isRawShaderMaterial)) { o.visible = false; return; }
    if (!o.isInstancedMesh && o.geometry) {
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      const bb = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
      const wx = bb.max.x - bb.min.x, wz = bb.max.z - bb.min.z, wy = bb.max.y - bb.min.y;
      if ((wx > 5500 || wz > 5500) && wy < 5.0) { o.visible = false; return; }
    }
    if (ruined && m && m.emissive) {
      m.emissive.setHex(0x000000);
      m.emissiveIntensity = 0;
    }
  });
  scene.position.set(-sx, 0, -sz);
  scene.updateMatrix();
  scene.updateMatrixWorld(true);
  const box = [-half, -half, half, half];
  return await KSPIKE.gltf(box, { name, maxTextureSize: 1024 });
}"""


async def export_arcologies(H, browser, port, out_dir):
    shutil.rmtree(out_dir, ignore_errors=True)
    os.makedirs(out_dir, exist_ok=True)
    init_file = os.path.join(out_dir, "_norender.js")
    with open(init_file, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(NO_RENDER_INIT_JS)
    manifest = {"format": "krator-catch-bowl-arcologies", "version": 1, "arcologies": []}
    used_libs = set()
    for c in ARCOLOGY_CASES:
        t0 = time.time()
        page_abs = os.path.join(REPO, c["page"])
        pg, errs, ready = await H.open_page(browser, page_abs, port, size="960x600", root=REPO, init=[init_file])
        if not ready:
            raise RuntimeError(f"arcology page never ready: {c['page']} (errs={errs[:3]})")
        await pg.wait_for_function("!window._texPending", timeout=180000)
        await pg.evaluate("() => { window.requestAnimationFrame = () => 0; }")
        for f in SPIKE_INJECT:
            await pg.add_script_tag(path=f)
        g = await evaluate_big_async(pg, PREP_ARCOLOGY_JS, [c["sx"], c["sz"], c["half"], bool(c["ruined"]), c["key"]])
        await pg.close()
        raw = base64.b64decode(g["b64"])
        glb_path = os.path.join(out_dir, c["key"] + ".glb")
        with open(glb_path, "wb") as f:
            f.write(raw)
        # Inspect glTF JSON header to gather referenced library material names
        jl = int.from_bytes(raw[12:16], "little")
        gjson = json.loads(raw[20 : 20 + jl].decode("utf-8"))
        for mat in gjson.get("materials", []):
            ex = mat.get("extras", {})
            if isinstance(ex, dict) and ex.get("lib"):
                used_libs.add(ex["lib"])
        rec = {
            "key": c["key"],
            "site_id": c["site_id"],
            "site_name": c["site_name"],
            "glb": c["key"] + ".glb",
            "bytes": len(raw),
            "half_m": c["half"],
            "ruined": bool(c["ruined"]),
            "unlabelled": bool(c.get("unlabelled", False)),
            "yaw_deg": c["yaw_deg"],
            "stats": g["stats"],
        }
        manifest["arcologies"].append(rec)
        print(
            f"  arcology {c['key']} ({c['site_name']} / {c['site_id']}): "
            f"{len(raw) / 1e6:.2f} MB, stats={g['stats']} in {time.time() - t0:.1f}s ({len(errs)} errs)",
            flush=True,
        )
    if os.path.exists(init_file):
        os.remove(init_file)

    # Copy only referenced families from kits/ancients/tex into arcologies/tex
    src_tex = os.path.join(REPO, "kits", "ancients", "tex")
    dst_tex = os.path.join(out_dir, "tex")
    os.makedirs(dst_tex, exist_ok=True)
    with open(os.path.join(src_tex, "pack.json"), encoding="utf-8") as f:
        pj = json.load(f)
    kept_fams = {}
    copied_files = set()
    for fam, info in pj.get("families", {}).items():
        if info.get("lib") in used_libs:
            kept_fams[fam] = info
            for fn in info.get("files", {}).values():
                if fn not in copied_files and os.path.isfile(os.path.join(src_tex, fn)):
                    shutil.copyfile(os.path.join(src_tex, fn), os.path.join(dst_tex, fn))
                    copied_files.add(fn)
    pj_out = dict(pj)
    pj_out["families"] = kept_fams
    with open(os.path.join(dst_tex, "pack.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(pj_out, f, indent=1, sort_keys=True)
    tex_bytes = sum(os.path.getsize(os.path.join(dst_tex, fn)) for fn in os.listdir(dst_tex))
    manifest["tex_families"] = len(kept_fams)
    manifest["tex_bytes"] = tex_bytes
    with open(os.path.join(out_dir, "arcologies.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(manifest, f, indent=1)
    print(f"  arcologies/tex: {len(kept_fams)} families, {tex_bytes / 1e6:.2f} MB", flush=True)


async def amain(only):
    import harness as H
    from playwright.async_api import async_playwright

    ensure_chrome()
    gl_args = ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"]
    async with async_playwright() as p:
        browser = await H.launch_chromium(p, args=gl_args)
        with H.serve(REPO) as port:
            if only in (None, "flora"):
                print("Exporting Mantis + Catch biome flora prototypes...", flush=True)
                await export_flora_pack(
                    H,
                    browser,
                    port,
                    "biomes/sedesert/dist/sedesert-mantis.html",
                    MANTIS_FLORA_JS,
                    os.path.join(OUT_ROOT, "flora-mantis"),
                )
                await export_flora_pack(
                    H,
                    browser,
                    port,
                    "biomes/catch/dist/catch.html",
                    CATCH_FLORA_JS,
                    os.path.join(OUT_ROOT, "flora-catch"),
                )
            if only in (None, "arcologies"):
                print("Exporting Catch & Bowl Ancient Arcologies...", flush=True)
                await export_arcologies(H, browser, port, os.path.join(OUT_ROOT, "arcologies"))
        await browser.close()


def main():
    only = None
    for a in sys.argv[1:]:
        if a.startswith("--only="):
            only = a.split("=", 1)[1]
    asyncio.run(amain(only))


if __name__ == "__main__":
    main()
