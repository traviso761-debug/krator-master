#!/usr/bin/env python3
"""Headless WebGL check for the Dilihan vassal-city kit sheet (kits/dilihan/build.py; on kits/iziz-vernacular/sheet_verify.py
and tools/harness.py):

    python3 kits/dilihan/verify.py kits/dilihan/dist/dilihan.html --assert --size 960x600 --out kits/dilihan/shots
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness                                     # noqa: E402  (imported at top: watchdog + verify cache)
sys.path.insert(0, os.path.join(HERE, '..', 'iziz-vernacular'))
import sheet_verify                                # noqa: E402

DEFAULT_VIEWS = (
    'Opening|Overview|Dwellings|Markets and Monsoon Workshops|Civic and Garrison|'
    'Mixed Street - Dilihan and Iziz Vernacular|'
    'U-Plan Courtyard Brick House — eye level|Peristyle Impluvium Villa — eye level|Malqaf Brick Cooling Baths — eye level'
)

EXTRA_JS = r"""() => {
  const R = [];
  /* 1. All 24 dil_* VERN.def buildings registered with culture: 'iziz', style: 'dilihan' */
  const dilKeys = Object.keys(VERN.defs).filter(k => /^dil_/.test(k));
  const badTag = dilKeys.filter(k => {
    const t = VERN.defs[k].tags || {};
    return t.culture !== 'iziz' || t.style !== 'dilihan' || !t.wealth || !t.type || !t.type.length;
  });
  R.push({
    name: 'dilihan-24-defs',
    ok: dilKeys.length === 24 && badTag.length === 0,
    detail: dilKeys.length + '/24 dil_* defs registered, badTag=' + badTag.length
  });

  /* 2. Kiln-brick, mortar, laterite & terracotta tile PBR materials bound */
  const dlMats = ['dlBrick', 'dlBrickDeep', 'dlBrickBand', 'dlBrickOchre', 'dlLaterite', 'dlMortar', 'dlTile'];
  const unbound = KMAT.mode === 'lib' ? dlMats.filter(k => !MAT[k] || !MAT[k].userData || !MAT[k].userData.lib) : [];
  R.push({
    name: 'dilihan-brick-pbr-materials',
    ok: unbound.length === 0,
    detail: unbound.length ? 'unbound MAT: ' + unbound.join(', ') : dlMats.length + ' Jimjam-kin brick/terracotta/mortar sets active'
  });

  /* 3. Mixed Street overlap & footprint separation check across all 4 rows */
  const overlaps = [];
  for (let i = 0; i < SITES.length; i++) {
    const a = SITES[i], da = VERN.defs[a.key];
    for (let j = i + 1; j < SITES.length; j++) {
      const b = SITES[j], db = VERN.defs[b.key];
      const dx = Math.abs(a.x - b.x), dz = Math.abs(a.z - b.z);
      if (dx < (da.w + db.w) * 0.5 - 0.05 && dz < (da.d + db.d) * 0.5 - 0.05) {
        overlaps.push(a.key + '<>' + b.key);
      }
    }
  }
  const mixedRow = SHEET_ROWS.find(r => r.family.indexOf('Mixed Street') === 0);
  const mixedDil = mixedRow ? mixedRow.keys.filter(k => /^dil_/.test(k)).length : 0;
  const mixedVern = mixedRow ? mixedRow.keys.filter(k => /^vern_/.test(k)).length : 0;
  R.push({
    name: 'mixed-street-cohesion-and-zero-overlaps',
    ok: overlaps.length === 0 && mixedDil >= 6 && mixedVern >= 6,
    detail: 'overlaps=' + overlaps.length + ', mixedStreet=(' + mixedDil + ' dil_* + ' + mixedVern + ' vern_*)'
  });

  return R;
}"""

if __name__ == '__main__':
    if '--views' not in sys.argv and '--all-views' not in sys.argv and '--cam' not in sys.argv:
        sys.argv.extend(['--views', DEFAULT_VIEWS])
    sheet_verify.run('dilihan', census=True, extra=EXTRA_JS)
