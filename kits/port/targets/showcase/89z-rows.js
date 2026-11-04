// TARGET: showcase - every registered segment, one continuous run per decay
// (intact, then natural coast, ruined, coast, reclaimed), sorted by key, with
// z offsets cycled from PORT_DZSEQ so flush joints and 20 / 40 m steps all
// appear. Run ends meet untouched natural coast. Nothing here names a
// segment: a new fragment that calls PORT_SEG appears here by itself -
// coastal segments in the runs, place:'land' blocks in a row behind each
// run's middle, place:'sea' platforms chained off the great pier's end.
//
// THE FLEET: every registered vessel in every decay. The great pier's slip
// holds the giant container ship and the deep-water berth the drone carrier
// (the only berth it fits); the Panamax and the feeder lie alongside the sea
// platforms (east / west faces), or off the pier head when no platform is
// registered; the submarine pen places the submarine itself.
const TITLE='Krator Ancient Port — showcase';
const PORT_LAYOUT_DEF=portLayoutShowcase({decays:[0,1,3],gap:440,
 slip:{pier:'vsGiant',slBerth:'slCarrier'},moor:{E:'vsPanamax',W:'vsFeeder'}});
