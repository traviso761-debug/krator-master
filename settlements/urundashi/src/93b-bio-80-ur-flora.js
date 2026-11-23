/* ================================================================= URUNDASHI HIGHLAND FLORA BUILD & TEXTURE WIRING
   [web] Wires packed library detail maps (f_plant, f_fruitSkin) onto SHIGH.MAT (including SHIGH.MAT.far), runs SHIGH.build
   (--station shumar: helixpoplar along Ayn al-Dubnu & moat banks, whorlapricot on sunny south-slope stud/still terraces,
   coiljuniper & ropepine steppe windbreaks, spiralsage & ichu on the Dfb flock-bench), and exposes window._flora (?flora=0 skips). */

window._flora = null;
if (UR_FLORA && new URLSearchParams(location.search).get('flora') !== '0') {
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
        KHOOK.add(m, 'ur-bio-vdet', {
          uniforms: { uUrBioTile: { value: ptile }, uUrBioGain: { value: pgain } },
          fragment: {
            head: 'uniform float uUrBioTile;\nuniform float uUrBioGain;\n',
            at: [{ at: 'map_fragment', replace: '#ifdef USE_MAP\nvec4 texelColor=texture2D(map,vFlWP.xz*uUrBioTile)*0.5+texture2D(map,(vFlWP.xy+vFlWP.zy)*0.5*uUrBioTile)*0.5;texelColor=mapTexelToLinear(texelColor);diffuseColor.rgb*=texelColor.rgb*uUrBioGain;\n#endif' }]
          }
        });
      }
      const shKit = typeof BIO !== 'undefined' && BIO.kits && BIO.kits.shigh;
      const farK = shKit && shKit.buckets && shKit.buckets.far;
      const farM = (farK && farK.mat) || (SHIGH.MAT && SHIGH.MAT.far) || null;
      if (farM && !farM.map) {
        farM.map = Tp.map;
        KHOOK.add(farM, 'ur-bio-fdet', {
          uniforms: { uUrFarTile: { value: ptile }, uUrFarGain: { value: pgain } },
          vertex: {
            head: 'varying vec3 vUrFarWP;\n',
            at: [{ at: 'begin_vertex', after: 'vec4 _urFarP=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\n_urFarP=instanceMatrix*_urFarP;\n#endif\nvUrFarWP=(modelMatrix*_urFarP).xyz;' }]
          },
          fragment: {
            head: 'varying vec3 vUrFarWP;\nuniform float uUrFarTile;\nuniform float uUrFarGain;\n',
            at: [{ at: 'map_fragment', replace: '#ifdef USE_MAP\nvec4 texelColor=texture2D(map,vUrFarWP.xz*uUrFarTile)*0.5+texture2D(map,(vUrFarWP.xy+vUrFarWP.zy)*0.5*uUrFarTile)*0.5;texelColor=mapTexelToLinear(texelColor);diffuseColor.rgb*=texelColor.rgb*uUrFarGain;\n#endif' }]
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
      KHOOK.add(SHIGH.MAT.solid, 'ur-bio-sdet', {
        uniforms: { uUrSolTile: { value: stile }, uUrSolGain: { value: sgain } },
        vertex: {
          head: 'varying vec3 vUrSolWP;\n',
          at: [{ at: 'begin_vertex', after: 'vec4 _urSolP=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\n_urSolP=instanceMatrix*_urSolP;\n#endif\nvUrSolWP=(modelMatrix*_urSolP).xyz;' }]
        },
        fragment: {
          head: 'varying vec3 vUrSolWP;\nuniform float uUrSolTile;\nuniform float uUrSolGain;\n',
          at: [{ at: 'map_fragment', replace: '#ifdef USE_MAP\nvec4 texelColor=texture2D(map,vUrSolWP.xz*uUrSolTile)*0.5+texture2D(map,(vUrSolWP.xy+vUrSolWP.zy)*0.5*uUrSolTile)*0.5;texelColor=mapTexelToLinear(texelColor);diffuseColor.rgb*=texelColor.rgb*uUrSolGain;\n#endif' }]
        }
      });
    }

    SHIGH.IMPOSTORS = false;
    const out = SHIGH.build({ R: UR_FLORA.R, quality: 0.24 });
    const speciesCounts = {};
    if (out.bySpecies) {
      for (const part of out.bySpecies.split(' ')) {
        const kv = part.split(':');
        if (kv.length === 2) speciesCounts[kv[0]] = +kv[1];
      }
    }

    const anchors = [
      { key: 'helixpoplar', pts: [[140, 515], [-160, 610], [565, -180], [-360, 340]], salt: 9621 },
      { key: 'whorlapricot', pts: [[210, 375], [235, 410], [520, 140]], salt: 9622 },
      { key: 'coiljuniper', pts: [[-380, -340], [380, -340], [-520, -140]], salt: 9623 },
      { key: 'ropepine', pts: [[-420, -360], [430, -360], [85, -420]], salt: 9624 }
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
        if (UR_FLORA.mask(ax, az) <= 0) continue;
        if (UR_FLORA.space && UR_FLORA.space.query(ax, az, 3.0).length > 0) continue;
        BIO.fn.reseed(KRAND.hash(a.salt, j, 3));
        const tr = kb.make(ax, urundashiH(ax, az), az);
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
      records: UR_FLORA.tags ? UR_FLORA.tags.records.length : 0,
      spaceCount: UR_FLORA.regs.length,
      ms: Math.round(performance.now() - t0)
    };
  } catch (e) {
    reportErr('flora ' + (e.stack || e));
  }
}
