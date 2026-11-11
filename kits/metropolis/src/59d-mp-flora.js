// ================================================================= METROPOLIS — plants vended from the biome kits  [draw]
// The owner, 2026-11-03: the Terrarium takes plants vended from the southwestern and northwestern lowlands, importing as little of the kits as
// possible. build.py reads each kit's species and trees in place (and the southwest's floor, for its floor plants), with its last fragment for
// BIO.kitEnd; no pass of theirs runs, no dress, no library pack (each keeps its procedural maps). A record names what to plant by the kit's own
// name for it: 'swlowlands.magnolia' a tree (SWLOW.treeAt), 'nwlowlands.treefern' a tree by core/biome's builder lookup (BIO.kitBuilder: the
// kit's make and grow), 'swlowlands:fern' one of the southwest's floor plants (SWLOW.plantAt). The plants grow into the two kits' registries and
// are baked into a group of the hero's own (the other kits on the page, the impostors', are left out of that bake); the registry entries the
// kits' trees add are taken back off. A kit not on the page plants nothing, and the record's design keeps its own stand-ins.
MP.flora = {
  KITS: ['swlowlands', 'nwlowlands'],
  ok: function () { return typeof BIO !== 'undefined' && !!BIO.kits && MP.flora.KITS.some(function (k) { return !!(BIO.kits[k] && BIO.kits[k].api); }); },
  /* one record into its kit's registry: {ref, x, y, z, scale, seed} */
  put: function (p) {
    if (BIO.fn && BIO.fn.reseed && p.seed != null) BIO.fn.reseed(p.seed);
    const col = p.ref.indexOf(':'), dot = p.ref.indexOf('.');
    if (col > 0) {
      const kit = p.ref.slice(0, col), kind = p.ref.slice(col + 1);
      return kit === 'swlowlands' && typeof SWLOW !== 'undefined' && SWLOW.plantAt ? SWLOW.plantAt(kind, p.x, p.y, p.z, { seed: p.seed, lv: 2 }) : false;
    }
    const kit = p.ref.slice(0, dot), key = p.ref.slice(dot + 1);
    if (kit === 'swlowlands' && typeof SWLOW !== 'undefined' && SWLOW.treeAt) return SWLOW.treeAt(key, p.x, p.y, p.z, { scale: p.scale, seed: p.seed });
    const b = BIO.kitBuilder(kit, key); if (!b) return false;
    const T = b.make(p.x, p.y, p.z); if (p.scale != null) { T.H *= p.scale; T.crownR *= p.scale; T.rb *= p.scale; }
    b.grow(T, 2); return T;
  },
  /* the records planted and baked into a group of their own; the page's registry and the kits' own lists left as they were */
  grow: function (list) {
    const G = new THREE.Group(); G.name = 'flora'; if (!list || !list.length || !MP.flora.ok()) return G;
    const r0 = typeof REG !== 'undefined' ? REG.length : 0, o0 = BIO.owner, rg = BIO.range, saved = BIO.kits, sc = BIO.host.scene, mine = {};
    let n = 0, bad = 0;
    BIO.owner = null; BIO.range = null;
    try {
      list.forEach(p => { try { if (MP.flora.put(p)) n++; } catch (e) { bad++; } });
      MP.flora.KITS.forEach(k => { if (saved[k]) mine[k] = saved[k]; });
      BIO.kits = mine; BIO.host.scene = G; BIO.bake();
    } finally {
      BIO.kits = saved; BIO.host.scene = sc; BIO.owner = o0; BIO.range = rg;
      if (typeof REG !== 'undefined') REG.length = r0;
      if (typeof SWLOW !== 'undefined' && SWLOW.TREES) SWLOW.TREES.length = 0;
    }
    G.userData.flora = { planted: n, failed: bad, asked: list.length };
    return G;
  }
};
/* a design's planting (its record's flora(state): the Terrarium's forest deck), added to its hero after the ruin is cut, so a ruin's plants
   stand whole over it */
MP.floraDress = function (G, family, state) {
  const F = MP.FAMILY && MP.FAMILY[family]; if (!F || typeof F.flora !== 'function' || !MP.flora.ok()) return G;
  const P = MP.flora.grow(F.flora(state || 'intact')); G.add(P); G.userData.flora = P.userData.flora; return G;
};
