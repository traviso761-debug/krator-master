// TARGET: showcase - every registered segment, one continuous run per decay
// (intact, then natural coast, ruined, coast, reclaimed), sorted by key, with
// z offsets cycled from PORT_DZSEQ so flush joints and 20 / 40 m steps all
// appear. Run ends meet untouched natural coast. Nothing here names a
// segment: a new fragment that calls PORT_SEG appears here by itself.
// Vessels are not tiled here; a slip/berth segment places them (opt.vessels).
const TITLE='Krator Ancient Port — showcase';
const PORT_LAYOUT_DEF=portLayoutShowcase({decays:[0,1,3],gap:440});
