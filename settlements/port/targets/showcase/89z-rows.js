// TARGET: showcase - every registered segment, one continuous run per decay
// (intact, then natural coast, ruined, coast, reclaimed), sorted by key, with
// z offsets cycled from PORT_DZSEQ so flush joints and 20 / 40 m steps all
// appear. Run ends meet untouched natural coast. Nothing here names a
// segment: a new fragment that calls PORT_SEG appears here by itself.
// Vessels are not tiled here; a slip/berth segment places them (opt.vessels).
const TITLE='Krator Ancient Port — showcase';
const PORT_LAYOUT_DEF=portLayoutShowcase({decays:[0,1,3],gap:440});
// A different vessel in each run's deep-water berth, so the fleet is on show:
// the giant container ship intact, the carrier ruined, the mid-size ship
// reclaimed. The berth falls back to the carrier if a key is not registered.
{const FLEET={0:'vsGiant',1:'slCarrier',3:'vsPanamax'};
 for(const it of PORT_LAYOUT_DEF.items)if(it.key==='slBerth')it.vessel=FLEET[it.d]||null;}
