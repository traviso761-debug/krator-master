/* ================================================================= AMARO HIGHLAND FLORA BUILD & TEXTURE WIRING (Step A2)
   [web] Wires packed library detail maps (f_plant, f_fruitSkin) onto SHIGH.MAT, runs SHIGH.build (--station shumar:
   helixpoplar along confluence rivers, whorlapricot on sunny canyon shelves, coiljuniper & ropepine on cliff rims,
   spiralsage & ichu on dry steppe), guarantees landmark riparian/rim specimens, and exposes window._flora (?flora=0 skips). */

window._flora = null;
if (AM_FLORA && new URLSearchParams(location.search).get('flora') !== '0') {
  const t0 = performance.now();
  try {
    const Lp = typeof KMAT !== 'undefined' && KMAT.mode === 'lib' ? KMAT.packed(KIT.pack, 'f_plant') : null;
    if (Lp && Lp.map && typeof KHOOK !== 'undefined' && SHIGH.MAT) {
      const Tp = KMAT.textures(Lp, { aniso: TEXANISO });
      const pgain = 1 / Math.max(0.05, Math.pow(Lp.mean == null ? 0.55 : Lp.mean, 2.2));
      const ptile = 1 / ((Lp.scale && Lp.scale[0]) == null ? 0.6 : Lp.scale[0]);
      for (const mk of ['vcol', 'vsway', 'vhang']) {
        const m = SHIGH.MAT[mk];
        if (!m || m.map) continue;
        m.map = Tp.map;
        KHOOK.add(m, 'am-bio-vdet', {
          uniforms: { uAmBioTile: { value: ptile }, uAmBioGain: { value: pgain } },
          fragment: {
            head: 'uniform float uAmBioTile;\nuniform float uAmBioGain;\n',
            at: [{ at: 'map_fragment', replace: '#ifdef USE_MAP\nvec4 texelColor=texture2D(map,vFlWP.xz*uAmBioTile)*0.5+texture2D(map,(vFlWP.xy+vFlWP.zy)*0.5*uAmBioTile)*0.5;texelColor=mapTexelToLinear(texelColor);diffuseColor.rgb*=texelColor.rgb*uAmBioGain;\n#endif' }]
          }
        });
      }
      const shKit = typeof BIO !== 'undefined' && BIO.kits && BIO.kits.shigh;
      const farK = shKit && shKit.buckets && shKit.buckets.far;
      const farM = (farK && farK.mat) || (SHIGH.MAT && SHIGH.MAT.far) || null;
      if (farM && !farM.map) {
        farM.map = Tp.map;
        KHOOK.add(farM, 'am-bio-fdet', {
          uniforms: { uAmFarTile: { value: ptile }, uAmFarGain: { value: pgain } },
          vertex: {
            head: 'varying vec3 vAmFarWP;\n',
            at: [{ at: 'begin_vertex', after: 'vec4 _amFarP=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\n_amFarP=instanceMatrix*_amFarP;\n#endif\nvAmFarWP=(modelMatrix*_amFarP).xyz;' }]
          },
          fragment: {
            head: 'varying vec3 vAmFarWP;\nuniform float uAmFarTile;\nuniform float uAmFarGain;\n',
            at: [{ at: 'map_fragment', replace: '#ifdef USE_MAP\nvec4 texelColor=texture2D(map,vAmFarWP.xz*uAmFarTile)*0.5+texture2D(map,(vAmFarWP.xy+vAmFarWP.zy)*0.5*uAmFarTile)*0.5;texelColor=mapTexelToLinear(texelColor);diffuseColor.rgb*=texelColor.rgb*uAmFarGain;\n#endif' }]
          }
        });
      }
    }
    const Ls = typeof KMAT !== 'undefined' && KMAT.mode === 'lib' ? KMAT.packed(KIT.pack, 'f_fruitSkin') : null;
    if (Ls && Ls.map && typeof KHOOK !== 'undefined' && SHIGH.MAT && SHIGH.MAT.solid && !SHIGH.MAT.solid.map) {
      const Ts = KMAT.textures(Ls, { aniso: TEXANISO });
      const sgain = 1 / Math.max(0.05, Math.pow(Ls.mean == null ? 0.6 : Ls.mean, 2.2));
      const stile = 1 / ((Ls.scale && Ls.scale[0]) == null ? 0.15 : Ls.scale[0]);
      SHIGH.MAT.solid.map = Ts.map;
      KHOOK.add(SHIGH.MAT.solid, 'am-bio-sdet', {
        uniforms: { uAmSolTile: { value: stile }, uAmSolGain: { value: sgain } },
        vertex: {
          head: 'varying vec3 vAmSolWP;\n',
          at: [{ at: 'begin_vertex', after: 'vec4 _amSolP=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\n_amSolP=instanceMatrix*_amSolP;\n#endif\nvAmSolWP=(modelMatrix*_amSolP).xyz;' }]
        },
        fragment: {
          head: 'varying vec3 vAmSolWP;\nuniform float uAmSolTile;\nuniform float uAmSolGain;\n',
          at: [{ at: 'map_fragment', replace: '#ifdef USE_MAP\nvec4 texelColor=texture2D(map,vAmSolWP.xz*uAmSolTile)*0.5+texture2D(map,(vAmSolWP.xy+vAmSolWP.zy)*0.5*uAmSolTile)*0.5;texelColor=mapTexelToLinear(texelColor);diffuseColor.rgb*=texelColor.rgb*uAmSolGain;\n#endif' }]
        }
      });
    }

    SHIGH.IMPOSTORS = false;
    const out = SHIGH.build({ R: AM_FLORA.R, quality: 0.30 });
    const speciesCounts = {};
    if (out.bySpecies) {
      for (const part of out.bySpecies.split(' ')) {
        const kv = part.split(':');
        if (kv.length === 2) speciesCounts[kv[0]] = +kv[1];
      }
    }

    /* Guarantee landmark riparian poplars, shelf apricots, and rim pines/junipers where cell jitter missed a ledge */
    const anchors = [
      { key: 'helixpoplar', pts: [[-110, -905], [-85, -900], [185, -895], [215, -902]], salt: 8621 },
      { key: 'whorlapricot', pts: [[135, -622], [385, -625], [-345, -660]], salt: 8622 },
      { key: 'coiljuniper', pts: [[455, -432], [1135, -428], [-440, -432]], salt: 8623 },
      { key: 'ropepine', pts: [[-855, -395], [-835, -245], [1155, -415]], salt: 8624 }
    ];
    let addedHeroes = 0;
    for (let i = 0; i < anchors.length; i++) {
      const a = anchors[i];
      if ((speciesCounts[a.key] == null ? 0 : speciesCounts[a.key]) >= 2) continue;
      const kb = BIO.kitBuilder('shigh', a.key);
      if (!kb) continue;
      for (let j = 0; j < a.pts.length; j++) {
        const ax = a.pts[j][0] + (KRAND.unit(KRAND.hash(a.salt, j, 1)) - 0.5) * 4.0;
        const az = a.pts[j][1] + (KRAND.unit(KRAND.hash(a.salt, j, 2)) - 0.5) * 4.0;
        if (AM_FLORA.mask(ax, az) <= 0) continue;
        if (AM_FLORA.space && AM_FLORA.space.query(ax, az, 3.0).length > 0) continue;
        BIO.fn.reseed(KRAND.hash(a.salt, j, 3));
        const tr = kb.make(ax, amaroH(ax, az), az);
        BIO.fn.reseed(tr.seed * 7919 + 17);
        kb.grow(tr, 2);
        speciesCounts[a.key] = (speciesCounts[a.key] == null ? 0 : speciesCounts[a.key]) + 1;
        addedHeroes++;
      }
    }

    const baked = BIO.bake();
    FRAME_HOOKS.push(() => {
      camera.updateMatrixWorld();
      BIO.lodTick(camera);
    });
    const under = out.under || {};
    const totalPlants = (under.sage == null ? 0 : under.sage) + (under.bunch == null ? 0 : under.bunch) +
      (under.tussocks == null ? 0 : under.tussocks) + (under.ferns == null ? 0 : under.ferns) +
      (under.albuca == null ? 0 : under.albuca) + (under.flowers == null ? 0 : under.flowers) +
      (under.rosettes == null ? 0 : under.rosettes);
    window._flora = {
      kit: 'shighlands',
      station: SHIGH.STATION || 'shumar',
      trees: out.trees + addedHeroes,
      species: speciesCounts,
      under: under,
      plants: totalPlants,
      instances: baked ? baked.inst : 0,
      records: AM_FLORA.tags ? AM_FLORA.tags.records.length : 0,
      spaceCount: AM_FLORA.regs.length,
      ms: Math.round(performance.now() - t0)
    };
  } catch (e) {
    reportErr('flora ' + (e.stack || e));
  }
}
