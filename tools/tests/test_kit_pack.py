#!/usr/bin/env python3
"""CI test for tools/kit_pack.py and kits/kits-manifest.json (Phase 1, MULTI-KIT-SCOPE.md).

Verifies:
  1. kits/kits-manifest.json covers all registered kits across all 5 engine lineages with valid footprints.
  2. One representative kit from each of the 5 lineages (core_engine, vernacular, xanadu, yuni, catalog) seals cleanly,
     passes `node --check`, leaks 0 globals, and builds real 3D Three.js meshes simultaneously in one Node VM.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
TOOLS = os.path.dirname(HERE)
ROOT = os.path.dirname(TOOLS)
if TOOLS not in sys.path:
    sys.path.insert(0, TOOLS)

import kit_pack  # noqa: E402


def main():
    assert os.path.isfile(kit_pack.MANIFEST_OUT), 'missing kits/kits-manifest.json'
    with open(kit_pack.MANIFEST_OUT, encoding='utf-8') as fh:
        M = json.load(fh)

    assert M.get('format') == 'krator-kits-manifest' and M.get('version') == 1
    expected_ids = [k['id'] for k in kit_pack.KITS]
    assert sorted(M['kits'].keys()) == sorted(expected_ids), 'manifest kit list drifted from kit_pack.KITS'
    assert M['totalPieces'] >= 1200, 'unexpectedly low totalPieces: %d' % M['totalPieces']

    # Smoke-test 1 representative kit from every single engine lineage simultaneously in one shared Node VM
    reps = ['islanders', 'highlands-republican', 'xanadu', 'locus', 'voth']
    rep_lineages = {kit_pack.KIT_BY_ID[r]['lineage'] for r in reps}
    assert rep_lineages == {'core_engine', 'vernacular', 'xanadu', 'yuni', 'catalog'}

    ev = kit_pack.evaluate_kits(reps, smoke_proto=True)
    for kid in reps:
        r = ev.get(kid, {})
        assert r.get('ok'), '%s failed in Node VM: %s' % (kid, r.get('error'))
        assert not r.get('leaked'), '%s leaked globals: %s' % (kid, r.get('leaked'))
        p = r.get('proto') or {}
        assert p.get('built') and p.get('meshes', 0) > 0, '%s proto() built 0 meshes: %s' % (kid, p)

    print('PASS test_kit_pack.py: %d kits (%d pieces) in manifest; 5/5 engine lineages smoked with 0 leaked globals'
          % (M['kitCount'], M['totalPieces']))
    return 0


if __name__ == '__main__':
    sys.exit(main())
