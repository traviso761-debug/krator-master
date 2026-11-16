// TARGET: segment - the dev view of ONE registered segment (or vessel).
//
// MAKE YOUR OWN COPY to develop in: copy this directory to targets/<name>/,
// set PORT_ONLY below to your key and TITLE to match, and build it with
//   python3 build.py --target <name>
// It shows your key in each of its decays, one run per decay: flanked by a
// plain `quay` on each side (the west one flush, the east one set back
// PORT_NBDZ[1] m, so both a flush joint and a step are exercised), with
// natural coast beyond. A vessel key is shown moored off three quays.
// build.py discovers targets by their 89z-rows.js; there is nothing to register.
const PORT_ONLY='pier';
const TITLE='Krator Ancient Port — segment: pier';
const PORT_NBDZ=[0,-20];
const PORT_LAYOUT_DEF=portLayoutSegment(PORT_ONLY,{nbdz:PORT_NBDZ});
