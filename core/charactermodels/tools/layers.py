# What lies over what, for the tools (make_garments.py's settle, make_mpfb.py's kit, ease.py's table); the figure
# ranks the same way (SLOT_RANK in 50-figure.js and kchar_figure.gd). A part's layer within its item: 0 a skirt,
# 1 a tunic's or robe's hem and flaps, 2 capes, cloaks and mantles; across items the slot's rank counts three layers.
import json
import os

RANK = {'legs': 0, 'torso': 1, 'head': 2}
# items worn over a higher slot's under-layers than their own: kit item 'over' (the figure ranks them by it).
# Pteruges hang from the cuirass over its tunic's skirt, under the cloak
OVER = {'hykk_m_trade_pteruges': 'torso', 'hykk_f_trade_pteruges': 'torso'}
PART_LAYER = {'legs': 0, 'torso': 1, 'head': 2}     # a part's layer when the garment does not say


def rank(iid, slot):
    return RANK.get(OVER.get(iid, slot), 0)


def outfits(sex, peoples=None):
    """[{slot: item id}] for every people and tier of data/peoples.json"""
    p = peoples or os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'peoples.json')
    out = []
    for pe in json.load(open(p, encoding='utf-8'))['peoples']:
        for o in (pe.get('outfits') or {}).get(sex, {}).values():
            out.append({s: i for s, i in o.items() if s in RANK and i})
    return out


def worn_with(iid, sex):
    """the items worn with iid in any outfit, by slot: {other id: its slot}"""
    out = {}
    for o in outfits(sex):
        if iid in o.values():
            for s, i in o.items():
                if i != iid:
                    out[i] = s
    return out
