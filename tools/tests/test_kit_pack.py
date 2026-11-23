#!/usr/bin/env python3
"""CI test for tools/kit_pack.py and kits/kits-manifest.json (Phase 1, MULTI-KIT-SCOPE.md).

Verifies:
  1. kits/kits-manifest.json covers all registered kits across all 5 engine lineages with valid footprints.
  2. One representative kit from each of the 5 lineages (core_engine, vernacular, xanadu, yuni, catalog) seals cleanly,
     passes `node --check`, leaks 0 globals, and builds real 3D Three.js meshes simultaneously in one Node VM.
"""
import json, os, sys, tempfile

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

    # 1. Phase 1: Smoke-test 1 representative kit from every single engine lineage simultaneously in one shared Node VM
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

    # 2. Phase 3: Sidecar emission (<15 MB per file, shared pack deduplication between iziz-vernacular & pylon)
    with tempfile.TemporaryDirectory() as td_side:
        idx = kit_pack.emit_sidecars(td_side, ['islanders', 'iziz-vernacular', 'pylon'], include_textures=True)
        assert idx['maxFileBytes'] <= idx['partLimitBytes'], 'sidecar exceeded 15 MB budget: %d' % idx['maxFileBytes']
        assert sorted(idx['packs'].keys()) == ['islanders', 'iziz'], 'expected shared iziz pack deduplication'
        assert len(idx['packs']['islanders']['files']) >= 2, '28 MB islanders pack must split into <=15 MB chunks'
        for pf in idx['packs']['islanders']['files']:
            assert os.path.isfile(os.path.join(td_side, *pf.split('/')))

    # 3. Phase 4: Headless per-kit Godot .glb prototype libraries across all 5 engine lineages
    with tempfile.TemporaryDirectory() as td_glb:
        summary = kit_pack.export_kit_glbs(td_glb, reps, max_pieces=2, variants=1)
        for kid in reps:
            s = summary[kid]
            assert s['ok'] and s['protos'] >= 2 and s['tris'] > 0 and s['gltfMeshes'] > 0
            glb_bytes = open(os.path.join(td_glb, kid + '.glb'), 'rb').read()
            gjson = kit_pack.validate_glb_bytes(glb_bytes)
            assert any((m.get('extras') or {}).get('krator_pack') is not None for m in gjson.get('materials', []))
            meta = json.load(open(os.path.join(td_glb, kid + '.glb.json'), encoding='utf-8'))
            assert meta['protoCount'] == s['protos']
            for _pk, pm in meta['prototypes'].items():
                for surf in pm['surfaces']:
                    q = surf['quantiles']
                    assert len(q) == 21 and q[0] == 0 and q[-1] == surf['tris']
                    assert all(q[i] <= q[i + 1] for i in range(20)), 'non-monotonic quantiles in %s' % kid
                    assert sum(surf['phases']) == surf['tris'], 'phase counts != tris in %s' % kid

    print('PASS test_kit_pack.py: Phases 1/3/4 green (%d kits, <=15 MB split sidecars, 5/5 lineage .glb exports verified)'
          % M['kitCount'])
    return 0


if __name__ == '__main__':
    sys.exit(main())

