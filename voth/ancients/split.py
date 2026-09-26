#!/usr/bin/env python3
"""One-shot: cut .origin.html (the single-file kit) into src/ fragments.

Run once, at the start of the refactor. It is kept in the repo only so the
split is reproducible and reviewable — after this, src/ is the source of
truth and .origin.html is a reference.

The cut points are the section banners already in the file. Fragments are
strictly contiguous line ranges in the original order: no statement is ever
moved. That matters because top-level order is load-bearing here —
kdef() calls fix the InstancedMesh bake order, and the TEX/MAT literals must
exist before the kdef()s that name them. build.py asserts the concatenation
is byte-identical to .origin.html, so a bad cut cannot go unnoticed.
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ORIGIN = os.path.join(HERE, '.origin.html')
SRC = os.path.join(HERE, 'src')

# (first_line, last_line, filename)  -- 1-based, inclusive, contiguous, gapless
CUTS = [
    (   1,   20, '00-head.html'),
    (  21,   39, '10-core.js'),
    (  40,   70, '20-textures.js'),
    (  71,   94, '22-materials.js'),
    (  95,  117, '30-kit.js'),
    ( 118,  149, '32-surfaces.js'),
    ( 150,  172, '34-kitdefs.js'),
    ( 173,  202, '36-decor.js'),
    ( 203,  221, '38-helpers2.js'),
    ( 222,  252, '40-factory-extras.js'),
    ( 253,  284, '42-offices.js'),
    ( 285,  313, '44-starport.js'),
    ( 314,  342, '46-bunker.js'),
    ( 343,  367, '48-library.js'),
    ( 368,  376, '50-registry.js'),
    ( 377,  464, '52-sky-abc.js'),
    ( 465,  484, '54-mat-concrete.js'),
    ( 485,  509, '56-sky-d.js'),
    ( 510,  531, '57-sky-e.js'),
    ( 532,  553, '58-sky-f.js'),
    ( 554,  594, '60-gate.js'),
    ( 595,  631, '62-robotics.js'),
    ( 632,  663, '64-houses-def.js'),
    ( 664,  679, '66-office-c.js'),
    ( 680,  690, '68-mat-v5.js'),
    ( 691,  727, '70-sky-g.js'),
    ( 728,  747, '71-sky-h.js'),
    ( 748,  773, '72-datacenter.js'),
    ( 774,  797, '73-police.js'),
    ( 798,  821, '74-hospital.js'),
    ( 822,  849, '75-hotel.js'),
    ( 850,  902, '76-campus.js'),
    ( 903,  953, '77-dam.js'),
    ( 954,  971, '78-factory-silo.js'),
    ( 972, 1007, '79-government.js'),
    (1008, 1015, '80-aa-battery.js'),
    (1016, 1048, '81-houses-abc.js'),
    (1049, 1087, '82-apartments.js'),
    (1088, 1111, '83-amphitheater.js'),
    (1112, 1137, '84-fuel.js'),
    (1138, 1161, '85-radar.js'),
    (1162, 1185, '86-dish.js'),
    (1186, 1221, '87-mega.js'),
    (1222, 1285, '88-factory.js'),
    (1286, 1344, '89-lab.js'),
    (1345, 1386, '90-scene.js'),
    (1387, 1448, '92-camera.js'),
    (1449, 1451, '99-tail.html'),
]


def main():
    if not os.path.exists(ORIGIN):
        sys.exit('missing %s' % ORIGIN)
    raw = open(ORIGIN, encoding='utf-8', newline='').read()
    # keepends so the join is exact, including the missing final newline
    lines = raw.splitlines(keepends=True)
    n = len(lines)

    prev_end = 0
    for a, b, name in CUTS:
        if a != prev_end + 1:
            sys.exit('cut list has a gap/overlap at %s (expected start %d, got %d)'
                     % (name, prev_end + 1, a))
        prev_end = b
    if prev_end != n:
        sys.exit('cut list ends at line %d but the file has %d lines' % (prev_end, n))

    os.makedirs(SRC, exist_ok=True)
    for a, b, name in CUTS:
        body = ''.join(lines[a - 1:b])
        with open(os.path.join(SRC, name), 'w', encoding='utf-8', newline='') as fh:
            fh.write(body)

    rebuilt = ''.join(open(os.path.join(SRC, name), encoding='utf-8', newline='').read()
                      for _, _, name in CUTS)
    if rebuilt != raw:
        sys.exit('FAIL: reassembled fragments differ from the original')
    print('split %d lines into %d fragments; reassembly is byte-identical' % (n, len(CUTS)))


if __name__ == '__main__':
    main()
