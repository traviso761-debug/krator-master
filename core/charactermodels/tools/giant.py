"""The Giants of Dalab (LORE.md: engineered at Dalab, about 3.8 m, green; the priests' temple guards have four arms,
the street patrols two) and the Free Giants of Giant Country (those who rebelled and left).

make_mpfb.py giant <the man's export> builds data/mpfb_giant and pieces/mpfb_giant from the man's MakeHuman export:
the same base and morphs, the items in ITEMS, and the mods every body has (mods.py: a temple guard wears the flesh
pair of arms). The pages make him big (kit.scale) and slow the man's clips (kit.anims) to a giant's pace."""

SCALE = 2.0            # the pages' scale for the whole figure: the man's 1.78 m base -> about 3.6 m, 3.4-4.1 with the sliders
# the man's items a giant wears: the Dalab commoner's kilt and sandals, a loincloth, the bead cap and sun sash, the
# giants' own (giant_*: the temple guard's four-armed harness, the Free Giants' Gaulish clothes), a few hair styles
# and beards
ITEMS = {'dalab_m_peasant_kilt', 'voth_m_peasant_maxtlatl', 'dalab_m_sandals', 'dalab_m_noble_sandals', 'dalab_m_trade_cap',
         'dalab_m_peasant_sash', 'short02', 'short04', 'cortu_short_messy_hair', 'afro01', 'braid01', 'long01', 'ponytail01',
         'wdg_scruffy_beard', 'elvs_scruffy_beard1', 'grinsegold_full_beard', 'grinsegold_moustache',
         'rehmanpolanski_moustache_viking', 'rehmanpolanski_beard_viking'}
PREFIX = 'giant_'      # any of the man's items whose id starts so is a giant's too


def wears(iid):
    return iid in ITEMS or iid.startswith(PREFIX)


def kit_extra():
    """what kit.json says of a giant beyond the man's kit: the scale and whose clips to play"""
    return {'label': 'Giant', 'scale': SCALE, 'anims': 'mpfb_male'}
