/* ================================================================= AMARO GODOT EXPORT ADAPTER (core/export, Step A2)
   [G data] Registers Amaro's heightfield, KCITY + KHAMLET placement records, merged hero/infrastructure buckets, and
   standard PBR material records onto EXPORT / EXPORT_QUEUE for `tools/harness.py export`. */

(function (R) {
  const reg = a => {
    if (typeof EXPORT !== 'undefined' && EXPORT && EXPORT.register) EXPORT.register.apply(null, a);
    else (R.EXPORT_QUEUE = R.EXPORT_QUEUE || []).push(a);
  };

  reg(['terrain', ctx => EXPORT.terrain(ctx.box || [-600, -1050, 1150, 350], { h: (x, z) => amaroH(x, z), step: 8 }), { by: 'shumar' }]);

  reg(['city', ctx => {
    const C = AM_CITY.get();
    const Rg = AM_RING.get();
    const inB = (x, z) => !ctx.box || ctx.inBox(x, z);
    return {
      settlement: 'ssgsv5zbd2',
      name: 'Amaro',
      datum: AM.DATUM,
      worldFrame: amaroWorldFrame(),
      census: C.census,
      ringPeople: Rg.people,
      lots: C.lots.concat(Rg.lots).filter(b => inB(b.x, b.z)).map(b => ({
        id: b.id,
        key: b.key,
        v: b.v,
        district: b.district,
        simId: b.simId,
        caste: b.caste,
        kind: b.kind,
        x: b.x,
        y: b.y,
        z: b.z,
        ry: b.ry,
        w: b.w,
        d: b.d,
        h: b.h,
        drop: b.drop,
        hero: !!b.hero,
        vacant: !!b.vacant,
        skyline: !!b.skyline,
        workId: b.workId || null,
        people: b.people
      })),
      ways: C.ways.concat(Rg.ways).map(w => ({ kind: w.kind, w: w.w, district: w.district, pts: w.pts }))
    };
  }, { by: 'shumar' }]);

  reg(['buckets', ctx => {
    const out = [], seen = {};
    if (typeof WORLD === 'undefined' || !WORLD) return out;
    WORLD.traverse(m => {
      const mk = m.userData && m.userData.mk;
      if (!m.isMesh || m.isInstancedMesh || !mk || !m.geometry || !m.geometry.index) return;
      const g = m.geometry, P = g.attributes.position.array, I = g.index.array, k = [];
      for (let t = 0; t < I.length; t += 3) {
        const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
        if (!ctx.box || ctx.inBox((P[a] + P[b] + P[c]) / 3, (P[a + 2] + P[b + 2] + P[c + 2]) / 3)) k.push(I[t], I[t + 1], I[t + 2]);
      }
      if (!k.length) return;
      const idx = Uint32Array.from(k), A = {};
      for (const n of ['position', 'normal', 'uv', 'color']) {
        const at = g.attributes[n];
        if (at) A[n] = [at.array, at.itemSize];
      }
      const c = EXPORT.compact(A, idx), geo = {};
      for (const n in c.arrays) geo[n] = EXPORT.pack(c.arrays[n]);
      geo.index = EXPORT.pack(c.index);
      const n = seen[mk] = (seen[mk] || 0) + 1;
      out.push({
        id: 'b:' + KIT.pack + ':' + mk + (n > 1 ? '~' + n : ''),
        name: mk,
        kit: KIT.pack,
        label: mk,
        material: KIT.pack + ':' + mk,
        lod: null,
        triangles: idx.length / 3,
        geometry: geo,
        compacted: { vertices: c.vertices, dropped: c.dropped }
      });
    });
    return out;
  }, { by: 'shumar' }]);

  reg(['materials', () => {
    const out = [], seen = {};
    if (typeof WORLD === 'undefined' || !WORLD) return out;
    WORLD.traverse(m => {
      const mk = m.userData && m.userData.mk;
      if (!m.isMesh || !mk || seen[mk]) return;
      seen[mk] = 1;
      const M = m.material, em = M.emissive && (M.emissive.r || M.emissive.g || M.emissive.b);
      out.push({
        id: KIT.pack + ':' + mk,
        name: mk,
        family: mk,
        source: KIT.pack,
        kind: 'standard',
        kmat: 'kmat:' + KIT.pack + ':' + mk,
        colour: '#' + (M.color ? M.color.getHexString() : 'ffffff'),
        roughness: M.roughness == null ? 1 : M.roughness,
        metal: M.metalness == null ? 0 : M.metalness,
        specular: 0.5,
        emissive: em ? '#' + M.emissive.getHexString() : null,
        emissiveIntensity: M.emissiveIntensity == null ? 1 : M.emissiveIntensity,
        doubleSided: M.side === 2,
        transparent: !!M.transparent,
        opacity: M.opacity == null ? 1 : M.opacity,
        alphaTest: M.alphaTest == null ? 0 : M.alphaTest,
        vertexColours: !!M.vertexColors,
        tint: true,
        unlit: !!M.isMeshBasicMaterial,
        hook: null,
        worldUV: null,
        scale: [1, 1],
        lib: (() => {
          const L = SV_LIB[mk] && KMAT.mode === 'lib' ? KMAT.packed(KIT.pack, SV_LIB[mk]) : null;
          return (L && L.lib) || null;
        })(),
        breakup: null,
        normalScale: 1,
        map: null,
        normalMap: null,
        roughnessMap: null
      });
    });
    return out;
  }, { by: 'shumar' }]);
})(window);
