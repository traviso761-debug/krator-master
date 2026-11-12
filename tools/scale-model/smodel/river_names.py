"""Culturally & Linguistically Authentic Planetary River Naming Pass (`Scale Model 5.1`):
  - Covers all 26 tongues and dialects documented in `lore/tongues-of-krator.html` & `LORE.md`
    across the entire `1821x1723` (`2 km/cell`) planetary grid:
      1. `vothic`      — Vothic (`Vothic Kingdom`, `Bay of Voth`, `SW Bay`)
      2. `izani`       — Izani (`Empire of Iziz`, `Dilihan Province`, `Shell Province`, `east rim`, `e savannah rim`, `ne rim`, `se savannah rim`, `e inner wall`, `The Cut`)
      3. `hykkousik`   — Hykkousik (`League of Amphitriton`, `NW bay`, `k-guilin`)
      4. `islander`    — Sikau East (`Kautoa`, `East Ring Isles`, `isle demo`)
      5. `islanderw`   — Sikau West (`West Ring isles`, `The Arch`, `Explosive Seamounts`)
      6. `xanadui`     — Xanadui (`Xanadu Sultanate`, `Vale of Xanadu`, `xanadu`, `Oidong Valley`)
      7. `yuni`        — Yuni (`Yuni Emirate`, `Yuni Valley`, `Region 99`, `Siphon Pits`, `Mid Basin`, `Stalker Gate`)
      8. `dalab`       — Dalab (`Dalab Council`, `SW lowlands`, `sw highlands`)
      9. `vrivolci`    — Vrivolci / Free Giants' Low Tongue (`Giant Country`)
     10. `republic`    — Hajlandsk (`Iron Republic`, `Free Clans`, `n highlands`, `n semiarid`)
     11. `painted`     — Painted Men Pitch-Accent Highland Speech (`Painted Men`, `painted highlands`)
     12. `riders`      — Tł'aai (`Inner Crater`, `hyperjungle N`, `hyperjungle S`, `savage hyperjungle`)
     13. `dasri`       — Dasrī (`Nomad Country`, `sedesert`, `e badlands`, `The Catch`, `stalker range`)
     14. `tabist`      — Tabist (`e abysss`, `The Bowl`)
     15. `scyvoi`      — Boruntun (`Scyvoi`, `crater drylands N`, `crater drylands S`)
     16. `screamer`    — Screamer Caravan English (`Screamer Country`)
     17. `zeijani`     — Zeijani / Ash-Speech (`Throne/Volcano`, `Lesser Throne`, `godthrone`, `Steampits`)
     18. `jimjam`      — Jamṭōkku (`Jimjam`, eastern `NW lowlands`)
     19. `eternian`    — Paper Speech / Mã-wè (`Eternal State`, central/western `NW lowlands`, `Ria River Valley`, `Great Double Delta`)
     20. `yusar`       — Yusar Avoidance Speech (`Ancient's Valley`, `Ruins of Nazar`)
     21. `heiland`     — Hayrant Outer-Wall Tongue (`w outer wall`)
     22. `farside`     — Farside Click Dialect (`Farside`)
     23. `argot`       — Matok Northern Traders' Argot (`dam`, `dam 2`, `floodzone`)
     24. `khaay`       — Khaayken Yeti Tongue (`Yeti Kingdom`, `NW outer wall`, `NE Tharn Uplands`)
     25. `talovolci`   — Talovolci Cloud-Giant Tongue (`Talovolci Chiefs`, `s highlands`, `godstep valley`)
     26. `hum`         — Hām / Coyote-Bark Hum (`Korona / NE`, `Arachnoid Canyons`, `The Tiers`, `Coyote Kingdom`, `N Outlands`, `S Outlands`, `Outland Gate`)
     27. `tungang`     — Tungang / Fellgangs Northern English (`Tungang Union`, `Fellgangs`, `rift rim N`, `rift rim S`, `w rift highland`, `The Crook`, `Copper Glacier`, `The Rift`, `Lizardmen`, `High Rift`)
     28. `shumari`     — Shumari Highland Mamluk Tongue (`Shumar`)
  - Preserves all canon/lore-referenced river names (`Dariba`, `Kaskejt Rivr`, `Chimes Riba`, `the Bigga`,
    `Pan Riba`, `Ālph`, `Dip Rivrh`, `Shim Rivrh`, `Drïm Rivrh`, `Tors Rivrh`, `Rrivar Falz`, `Rrivar Grin`,
    `Rrivar Isguifta`, `Rrivar Loña`, `Borun Gulusu`, `Filem Gulusu`, `Sivift Gulusu`, `Bitir Gulusu`,
    `Rīfar al-Bālm`, `K'etsaal Baatar`, and `Ria River`).
"""
import hashlib
import json
import math
import os
import numpy as np
from PIL import Image, ImageDraw


# Canon river names referenced in LORE.md, biomes/*/*.md, and settlements/*/*.md that must never be overwritten
CANON_RIVER_NAMES = {
    'Dariba',
    'Līng-Mā',
    'Kaskejt Rivr',
    'Chimes Riba',
    'the Bigga',
    'Pan Riba',
    'Ālph',
    'Dip Rivrh',
    'Shim Rivrh',
    'Drïm Rivrh',
    'Tors Rivrh',
    'Rrivar Falz',
    'Rrivar Grin',
    'Rrivar Isguifta',
    'Rrivar Loña',
    'Borun Gulusu',
    'Filem Gulusu',
    'Sivift Gulusu',
    'Bitir Gulusu',
    'Rīfar al-Bālm',
    "K'etsaal Baatar",
    'Ria River',
}

# Explicit canon overrides by numeric river ID
CANON_BY_ID = {
    1: ('Dariba', 'dalab', "da riba ('the river') — mother river of the Dalab basin"),
    2: ('Līng-Mā', 'eternian', "Līng (lotus-bell) + Mā (river) — Farport's drowned estuary river"),
    4: ('Kaskejt Rivr', 'republic', "Cascade River ('Kaskejt Rivr') — the stepped cataract river of Cascade"),
    5: ('Chimes Riba', 'dalab', "Chimes River ('Chimes Riba') — the Great Lake outlet gorge plunging past Chimes into the Rift"),
    18: ('Vai Moana', 'islander', "Moana (deep-ocean) + Vai (river) — eastern Ring Isle stream"),
    19: ('the Bigga', 'yuni', "the Bigga ('the Bigger') — mother river of Yuni Valley"),
    22: ('Vai Pou', 'islanderw', "Pou (stone-pillar) + Vai (river) — western Ring Isle & Arch stream"),
    26: ('Pan Riba', 'dalab', "Span River ('Pan Riba') — the mountain gorge river bridged by Span"),
    70: ('Ālph', 'xanadui', "Ālph — the sacred river of Xanadu plunging into the sunless cavern sea"),
    166: ('Vai Toka', 'islander', "Toka (coral-rock) + Vai (river) — Kautoa island river"),
    185: ('Ràv Rìv', 'painted', "Ràv (raven) + Rìv (river) — northern Danxia hogback river of the Painted Men"),
    199: ('Àirn Rìv', 'painted', "Àirn (iron) + Rìv (river) — northwestern stream of the Painted Highlands"),
    208: ('Òk Rìv', 'painted', "Òk (ochre) + Rìv (river) — eastern Painted Canyon river draining toward Korona"),
    352: ("K'etsaal Baatar", 'riders', "Quetzal Water (K'etsaal Baatar) — the Beast Riders' river 11 km from Pinnacle Rock"),
    679: ('Blùd Gèl', 'painted', "Blùd (blood-ochre) + Gèl (wadi) — southern canyon wash of the Painted Men"),
    863: ('Dip Rivrh', 'vothic', "Deep River ('Dip Rivrh') — Almua's navigable harbour river"),
    864: ('Auwai Kura', 'islander', "Kura (red-feather) + Auwai (stream) — East Ring Isles stream"),
    # New N/W Expansion Rivers (`9101..9107`) matching `nw_expansion.py` 1-to-1:
    9101: ('Ria River (Mā-Rīa)', 'eternian', "Ria River / Mā-Rīa ('River of Reeds & Ink') — 2,140 km sinuous Nile-style trunk river from the Eastern Highland Lake to the Great Double Delta"),
    9102: ('Hām-Tsēk (Web-Cleaver River)', 'hum', "Hām-Tsēk ('Web-Cleaver Water') — 890 km canyon river carving through the Northern Korona & Arachnoid Scenic Gorge into the Ria River"),
    9103: ('Tōng-Mā (North Ria Distributary)', 'eternian', "Tōng-Mā ('Northern Reed-Channel') — 235 km northern distributary of the Great Double Delta"),
    9104: ('Sī-Mā (South Ria Distributary)', 'eternian', "Sī-Mā ('Southern Marsh-Channel') — 250 km southern distributary of the Great Double Delta"),
    9105: ('Kopa-Tarn Warra (Crook River)', 'tungang', "Kopa-Tarn Warra ('Copper-Tarn Water') — 980 km emerald-green glacial meltwater river draining the Copper Tarn northward through the Crook"),
    9106: ('Hau-Gèl (Outland Gate River)', 'hum', "Hau-Gèl ('Coyote-Gate River') — 360 km trans-boundary pass river linking the eastern Ria basin through the Outland Gate into northern Outland"),
    9107: ('Pāk-Mā (North Ria Fork)', 'eternian', "Pāk-Mā ('White-Peak Water') — 560 km Blue-Nile-style northern tributary joining the lower Ria River"),
}

# Explicit canon overrides by string river ID (for the SE-complex, Labyrinth, and Xanadu cataract rivers)
CANON_BY_STR_ID = {
    'r_sg_vapora_bigga': ('Vapora Riba', 'yuni', "Vapora Riba ('Steam-Gate River') — geothermal headwater of the Bigga rising in the Stalker Gate"),
    'r_mb_siphon_breach': ('Ostrukh Riba', 'yuni', "Ostrukh Riba ('Ostrukh Breach River') — Mid Basin & Siphon Pits overflow channel feeding Lake Ostrukh"),
    'r_hr_verdigris': ('Verdigris Beck', 'tungang', "Verdigris Beck ('Copper-Ice Beck') — High Rift turquoise glacial meltwater stream"),
    'r_hr_jokulhlaup': ('Brant-Fell Gill', 'tungang', "Brant-Fell Gill ('Steep-Fell Jökulhlaup Gorge') — catastrophic glacial outburst gorge descending from the High Rift rim"),
    'r_lab_cat_nw': ('Siphon-Pit Beck', 'tungang', "Siphon-Pit Beck ('Catena Meltwater Beck') — northwestern pit-crater meltwater stream of the Labyrinth"),
    'r_lab_cat_sw': ('Graben-Tarn Gill', 'tungang', "Graben-Tarn Gill ('Southern Catena Gill') — southwestern pit-crater meltwater stream of the Labyrinth"),
    'r_lab_chaos_n': ('Fell-Block Beck', 'tungang', "Fell-Block Beck ('North Chaos Cross-Channel') — anastomosing meltwater channel threading the northern Chaos mesas"),
    'r_lab_chaos_s': ('Shatter-Scarp Gill', 'tungang', "Shatter-Scarp Gill ('South Chaos Cross-Channel') — anastomosing meltwater channel threading the southern Chaos mesas"),
    'r_oidong_cataract': ('Nahr Uydūng', 'xanadui', "Nahr Uydūng ('Oidong Cataract River') — eastern rift river discharging from the Oidong Rift Lake over the Great Eastern Cataract into the Lower Xanadu Lake"),
    'r_xanadu_low_cataracts': ('Nahr ash-Shalālāt', 'xanadui', "Nahr ash-Shalālāt ('River of the Stepped Cataracts') — outflow river descending a series of low cataracts from the Lower Xanadu Lake to the Lizardman Rift Sea"),
}


# Priority-ordered mapping from region name (`r['name']`) to tongue code and priority weight
# Higher priority wins when a river crosses overlapping political/biome polygons.
REGION_TO_TONGUE = {
    # Political / Cultural polities (priority 3)
    'Vothic Kingdom': ('vothic', 3),
    'Bay of Voth': ('vothic', 3),
    'Empire of Iziz': ('izani', 3),
    'Dilihan Province': ('izani', 3),
    'Shell Province': ('izani', 3),
    'League of Amphitriton': ('hykkousik', 3),
    'Kautoa': ('islander', 3),
    'Xanadu Sultanate': ('xanadui', 3),
    'Vale of Xanadu': ('xanadui', 3),
    'Yuni Emirate': ('yuni', 3),
    'Dalab Council': ('dalab', 3),
    'Realm of Dalab': ('dalab', 3),
    'Giant Country': ('vrivolci', 3),
    'Vrivolci': ('vrivolci', 3),
    'Shumar': ('shumari', 4),
    'Greenstep': ('vrivolci', 2),
    'Green Valley': ('vrivolci', 2),
    'Iron Republic': ('republic', 3),
    'Free Clans': ('republic', 3),
    'Painted Men': ('painted', 3),
    'Inner Crater': ('riders', 2),
    'Nomad Country': ('dasri', 3),
    'Scyvoi': ('scyvoi', 3),
    'Screamer Country': ('screamer', 3),
    'Jimjam': ('jimjam', 3),
    'Eternal State': ('eternian', 3),
    'Ruins of Nazar': ('yusar', 3),
    'Yeti Kingdom': ('khaay', 3),
    'Talovolci Chiefs': ('talovolci', 3),
    'Coyote Kingdom': ('hum', 3),
    'Tungang Union': ('tungang', 3),
    'Fellgangs': ('tungang', 3),
    'Lizardmen': ('tungang', 3),

    # Specific Biomes & Valleys (priority 2)
    'SW Bay': ('vothic', 2),
    'east rim': ('izani', 2),
    'e savannah rim': ('izani', 2),
    'ne rim': ('izani', 2),
    'se savannah rim': ('izani', 2),
    'e inner wall': ('izani', 2),
    'the cut': ('izani', 2),
    'The Cut': ('izani', 2),
    'NW bay': ('hykkousik', 2),
    'k-guilin': ('hykkousik', 2),
    'East Ring Isles': ('islander', 2),
    'isle demo': ('islander', 2),
    'West Ring isles': ('islanderw', 2),
    'the arch': ('islanderw', 2),
    'steaming seamounts': ('islanderw', 2),
    'xanadu': ('xanadui', 2),
    'Oidong Valley': ('xanadui', 2),
    'Yuni Valley': ('yuni', 2),
    'Region 99': ('yuni', 2),
    'Loom Chasms': ('yuni', 2),          # region 99's name since 5.1 edit 3 (2026-11-11)
    'Siphon Pits': ('yuni', 2),
    'Mid Basin': ('yuni', 2),
    'Stalker Gate': ('yuni', 2),
    'SW lowlands': ('dalab', 2),
    'sw highlands': ('dalab', 2),
    'n highlands': ('republic', 2),
    'n semiarid': ('republic', 2),
    'painted highlands': ('painted', 2),
    'hyperjungle N': ('riders', 2),
    'hyperjungle S': ('riders', 2),
    'savage hyperjungle': ('riders', 2),
    'sedesert': ('dasri', 2),
    'e badlands': ('dasri', 2),
    'the catch': ('dasri', 2),
    'The Catch': ('dasri', 2),
    'stalker range': ('dasri', 2),
    'e abysss': ('tabist', 2),
    'e abyss': ('tabist', 2),
    'The Bowl': ('tabist', 2),
    'the bowl': ('tabist', 2),
    'crater drylands N': ('scyvoi', 2),
    'crater drylands S': ('scyvoi', 2),
    'abyssal-savannah': ('scyvoi', 1),
    'Throne/Volcano': ('zeijani', 3),
    'Lesser Throne': ('zeijani', 3),
    'godthrone': ('zeijani', 3),
    'Steampits': ('zeijani', 2),
    'ria valley': ('eternian', 2),
    'double delta': ('eternian', 2),
    'NW lowlands': ('eternian', 1),  # split with jimjam on east side
    "ancient's valley": ('yusar', 3),
    "Ancient's Valley": ('yusar', 3),
    'w outer wall': ('heiland', 2),
    'Farside': ('farside', 3),
    'dam': ('argot', 3),
    'dam 2': ('argot', 3),
    'floodzone': ('argot', 2),
    'NW outer wall': ('khaay', 2),
    'tharn uplands': ('khaay', 2),
    's highlands': ('talovolci', 2),
    'godstep valley': ('talovolci', 2),
    'Korona / NE': ('hum', 2),
    'arachnoid canyons': ('hum', 2),
    'Tiers': ('hum', 2),
    'The Tiers': ('hum', 2),
    'N Outlands': ('hum', 2),
    'S Outlands': ('hum', 2),
    'outland gate': ('hum', 2),
    'rift rim N': ('tungang', 2),
    'rift rim S': ('tungang', 2),
    'w rift highland': ('tungang', 2),
    'the crook': ('tungang', 2),
    'copper glacier': ('tungang', 2),
    'Labyrinth': ('tungang', 2),
    'Firebliss Range': ('tungang', 2),
    'rift': ('tungang', 2),
    'The Rift': ('tungang', 2),
    'High Rift': ('tungang', 2),
}


# Generic water/stream/wadi words per tongue (`lore/tongues-of-krator.html`):
# `(river_word, stream_word, wadi_word, order)` where `order` is `'GW'` (Generic + Word) or `'WG'` (Word + Generic)
TONGUE_GENERICS = {
    'vothic':     ('Rivrh',    'Brük',     'Gülch',    'WG'),
    'izani':      ('Rrivar',   'Bruk',     'Guli',     'GW'),
    'hykkousik':  ('Rhyver',   'Brouk',    'Ghouly',   'WG'),
    'islander':   ('Vai',      'Auwai',    'awa',      'GW'),
    'islanderw':  ('Vai',      'Hau',      'Kaha',     'GW'),
    'xanadui':    ('Riwā',     'Siṭrīm',   'Ḍrāi',     'WG'),
    'yuni':       ('Riba',     'Bruk',     'Guli',     'WG'),
    'dalab':      ('Riba',     'Bruk',     'Guli',     'WG'),
    'vrivolci':   ('Riba',     'Bruk',     'Guli',     'WG'),
    'republic':   ('Rivr',     'Bruk',     'Guli',     'WG'),
    'painted':    ('Rìv',      'Bèk',      'Gèl',      'WG'),
    'riders':     ('Baatar',   'Buruuk',   'Kuli',     'WG'),
    'dasri':      ('Rīfar',    'al-Bīruk', 'Wādī',     'GW'),
    'tabist':     ('Rvr',      'Brk',      'Gl',       'GW'),
    'scyvoi':     ('Riviri',   'Buruku',   'Gulusu',   'WG'),
    'screamer':   ('Run',      'Creek',    'Wash',     'WG'),
    'zeijani':    ('Nāru',     'Palgu',    'ḫarru',    'GW'),
    'jimjam':     ('āṟu',      'ōṭai',     'kāl',      'WG'),
    'eternian':   ('Mā',       'Kē',       'Kū',       'WG'),
    'yusar':      ('Waywater', 'Runbrook', 'Cutdry',   'WG'),
    'heiland':    ('Ripar',    'Puruk',    'Kuri',     'WG'),
    'farside':    ('qRiba',    'cBruk',    'xGuli',    'WG'),
    'argot':      ('Rivar',    'Kriki',    'Guli',     'WG'),
    'khaay':      ("Baa'ar",   'Bïruuq',   'Quli',     'WG'),
    'talovolci':  ('Rivros',   'Brucos',   'Gilva',    'WG'),
    'hum':        ('Hām',      'Kē',       'Gèl',      'WG'),
    'tungang':    ('Warra',    'Beck',     'Gill',     'WG'),
    'shumari':    ('Nārun',    'Buruqu',   'Ḫarrun',   'WG'),
}


# Authentic vocabulary stems per tongue (`(local_form, english_gloss)`), grouped by semantic category
# so every river's name reflects its actual geography (elevation, temperature, slope, length, climate).
TONGUE_LEXICON = {
    'vothic': [
        ('Shvarts', 'black'), ('Vayt', 'white'), ('Gowld', 'gold'), ('Silvr', 'silver'),
        ('Kowld', 'cold'), ('Dip', 'deep'), ('Brant', 'burnt'), ('Shtown', 'stone'),
        ('Ayrn', 'iron'), ('mist', 'mist'), ('Zalt', 'salt'), ('Grin', 'green'),
        ('Rawt', 'red'), ('klir', 'clear'), ('Sharf', 'sharp'), ('brayt', 'bright'),
        ('Stil', 'still'), ('Vind', 'wind'), ('Flint', 'flint'), ('Shifer', 'slate'),
        ('Krown', 'crown'), ('Hafn', 'harbour'), ('Brik', 'bridge'), (' Turm', 'tower'),
    ],
    'izani': [
        ('Grin', 'green'), ('Falz', 'falls'), ('Isguifta', 'swift'), ('Loña', 'long'),
        ('Blaca', 'black'), ('Guaita', 'white'), ('Rreda', 'red'), ('Goulda', 'gold'),
        ('Cistal', 'crystal'), ('Dippa', 'deep'), ('Caulda', 'cold'), ('Stona', 'stone'),
        ('Salta', 'salt'), ('Mista', 'mist'), ('onda', 'wave'), ('Sola', 'sun'),
        ('stara', 'star'), ('airon', 'iron'), ('coper', 'copper'), ('brij', 'bridge'),
        ('geit', 'gate'), ('taur', 'tower'), ('クラウン', 'crown'), ('rrija', 'ridge'),
        ('clifa', 'cliff'), ('valle', 'valley'), ('pina', 'pine'), ('cedra', 'cedar'),
    ],
    'hykkousik': [
        ('Pheurle', 'pearl'), ('Gould', 'gold'), ('Sylver', 'silver'), ('Mhist', 'mist'),
        ('Klaer', 'clear'), ('Dhyp', 'deep'), ('Khould', 'cold'), ('Sthoun', 'stone'),
        ('Gryn', 'green'), ('Bhlak', 'black'), ('Whyt', 'white'), ('Rhed', 'red'),
        ('Shael', 'shell'), ('Khoral', 'coral'), ('Lhyght', 'light'), ('Stahr', 'star'),
        ('Sahl', 'salt'), ('Vhynd', 'wind'), ('Khaev', 'cave'), ('Thour', 'tower'),
        ('Bhridj', 'bridge'), ('Phort', 'port'), ('Khrown', 'crown'), ('Ghaet', 'gate'),
    ],
    'islander': [
        ('Tai', 'sea-tide'), ('Moana', 'deep-ocean'), ('Ahi', 'fire'), ('Pō', 'night'),
        ('Ao', 'dawn-cloud'), ('Kura', 'red-feather'), ('Tea', 'white-foam'), ('Uri', 'dark-reef'),
        ('Matangi', 'trade-wind'), ('Toka', 'coral-rock'), ('Rimu', 'sea-kelp'), ('Hina', 'moonlight'),
        ('Rā', 'sun'), ('Fetu', 'star'), ('Kone', 'sand'), ('Puna', 'spring'),
        ('Maire', 'clear'), ('Taniwha', 'reef-spirit'), ('Niu', 'palm'), ('One', 'beach'),
    ],
    'islanderw': [
        ('Pou', 'stone-pillar'), ('Ahi', 'volcanic-fire'), ('Hau', 'gale-wind'), ('Tai', 'tide-race'),
        ('Kehu', 'sea-smoke'), ('Pango', 'black-basalt'), ('Mā', 'white-surf'), ('Kura', 'red-scoria'),
        ('Moana', 'blue-trench'), ('Toka', 'seamount-crag'), ('Puna', 'hot-spring'), ('Ao', 'cloud-arch'),
        ('Rā', 'sun-arch'), ('Wai', 'fresh-pool'), ('Papa', 'ledge'), ('Roa', 'long-ridge'),
    ],
    # Xanadui is English worn to sound Nepali or Persian (the tongues sheet, the owner 2026-11-03): t d > ṭ ḍ,
    # f > ph, v w > w, b d g before a long vowel breathed (bh ḍh gh), k before o u > q, s + consonant broken
    # (stone > Satõ), final -n -ng a nasal vowel, final -r lost; the adjective goes first, as in the 4.21-4.23
    # layer's Reḍ Riwā, Wāiṭ Ḍrāi, Solṭ Siṭrīm, Bhon Ḍrāi (history/river_names.py has the same words)
    'xanadui': [
        ('Reḍ', 'red'), ('Wāiṭ', 'white'), ('Balāk', 'black'), ('Qol', 'cold'),
        ('Solṭ', 'salt'), ('Satõ', 'stone'), ('Sã', 'sun'), ('Sitār', 'star'),
        ('Ghol', 'gold'), ('Silwā', 'silver'), ('Bhon', 'bone'), ('Āirã', 'iron'),
        ('Girīn', 'green'), ('Ḍhīp', 'deep'), ('Barāiṭ', 'bright'), ('Kilīā', 'clear'),
        ('Sanõ', 'snow'), ('Āis', 'ice'), ('Sakāi', 'sky'), ('Kilāuḍ', 'cloud'),
        ('Wĩḍ', 'wind'), ('Mũ', 'moon'), ('Sekriḍ', 'sacred'), ('Jeḍ', 'jade'),
        ('Ḍhom', 'dome'), ('Keb', 'cave'),
    ],
    'yuni': [
        ('Sista', 'Sister'), ('Brada', 'Brother'), ('Gould', 'Gold'), ('Silba', 'Silver'),
        ('Reda', 'Red'), ('Waita', 'White'), ('Blaka', 'Black'), ('Grina', 'Green'),
        ('Dipa', 'Deep'), ('Kould', 'Cold'), ('Stoun', 'Stone'), ('Solt', 'Salt'),
        ('Klira', 'Clear'), ('Swifta', 'Swift'), ('Braita', 'Bright'), ('Longa', 'Long'),
        ('Mista', 'Mist'), ('Winda', 'Wind'), ('Suna', 'Sun'), ('Stara', 'Star'),
        ('Kopa', 'Copper'), ('Aina', 'Iron'), ('Spindl', 'Spindle'), ('Teris', 'Terrace'),
    ],
    'dalab': [
        ('Blak', 'black'), ('Wait', 'white'), ('Red', 'red'), ('Grin', 'green'),
        ('Gould', 'gold'), ('Silba', 'silver'), ('Dip', 'deep'), ('Kould', 'cold'),
        ('Stoun', 'stone'), ('Aian', 'iron'), ('Misti', 'misty'), ('Klir', 'clear'),
        ('Swift', 'swift'), ('Long', 'long'), ('Brod', 'broad'), ('Brait', 'bright'),
        ('Solt', 'salt'), ('Wind', 'wind'), ('Sun', 'sun'), ('Star', 'star'),
        ('Ridj', 'ridge'), ('Vali', 'valley'), ('Fols', 'falls'), ('Geit', 'gate'),
    ],
    'vrivolci': [
        ('Spirla', 'spiral'), ('Uaros', 'high-crag'), ('Rixos', 'king-stone'), ('Stanos', 'standing-stone'),
        ('Viros', 'true-giant'), ('Uatera', 'water-leap'), ('Clodos', 'cloud-bench'), ('Ixos', 'ice-peak'),
        ('Gedos', 'spear-ridge'), ('Vrivolci', 'free-clan'), ('Branos', 'raven'), ('Tarvos', 'bull-tor'),
        ('Dubnos', 'deep-hollow'), ('vindos', 'white-snow'), ('dervos', 'oak-wood'), ('carnos', 'cairn'),
    ],
    'republic': [
        ('Ajrn', 'iron'), ('Stoun', 'stone'), ('Kould', 'cold'), ('Gould', 'gold'),
        ('Silvr', 'silver'), ('Blak', 'black'), ('Wajt', 'white'), ('Grin', 'green'),
        ('Red', 'red'), ('Dip', 'deep'), ('Klir', 'clear'), ('Swift', 'swift'),
        ('Frost', 'frost'), ('Snou', 'snow'), ('Krags', 'crag'), ('Ford', 'ford'),
        ('Bridž', 'bridge'), ('ミル', 'mill'), ('Forž', 'forge'), ('Hamer', 'hammer'),
        ('パイン', 'pine'), ('Birč', 'birch'), (' ग्रेनाइट', 'granite'), ('Slajt', 'slate'),
    ],
    'painted': [
        ('Ràv', 'raven'), ('Wìn', 'wind'), ('Sùn', 'sun'), ('Àirn', 'iron'),
        ('Sòl', 'salt'), ('Kìng', 'king'), ('Hànd', 'hand'), ('Wòr', 'war'),
        ('Stòn', 'stone'), ('Gòld', 'gold'), ('Rèd', 'red'), ('Wàit', 'white'),
        ('Blàk', 'black'), ('Grìn', 'green'), ('Kòld', 'cold'), ('Dìp', 'deep'),
        ('Bòn', 'bone'), ('Ash', 'ash'), ('Cràg', 'crag'), ('Flìnt', 'flint'),
        ('Òk', 'ochre'), ('Blùd', 'blood'), ('Skài', 'sky'), ('Stàr', 'star'),
    ],
    'riders': [
        ("K'etsaal", 'quetzal'), ('Tł\'aai', 'canopy'), ('Ch\'il', 'vine'), ('Tsé', 'tepui-stone'),
        ('Tó', 'spring-water'), ('Kǫ\'', 'sun-fire'), ('Yas', 'cloud-mist'), ('Łání', 'many-falls'),
        ('Dootł\'izh', 'jade-green'), ('Łichíí\'', 'laterite-red'), ('Łizhin', 'black-water'), ('Łigai', 'white-foam'),
        ('Béesh', 'obsidian'), ('Na\'ashǫ́\'ii', 'caiman'), ('Dził', 'whaleback-ridge'), ('Tsékooh', 'sinkhole-gorge'),
        ('Níłch\'i', 'monsoon-wind'), ('Sǫ\'', 'star'), ('Jóhonaa\'éí', 'sun'), ('Tł\'éé\'', 'night-jungle'),
    ],
    'dasri': [
        ('al-Bālm', 'date-palm'), ('al-Raml', 'red-sand'), ('al-Milḥ', 'salt-crust'), ('al-Ṣakhr', 'sandstone-mesa'),
        ('al-Shams', 'sun-scorch'), ('al-Rīḥ', 'simoom-wind'), ('al-Layl', 'star-night'), ('al-Dhahab', 'gold-dust'),
        ('al-Naḥās', 'copper-stain'), ('al-Qaṣr', 'butte-fortress'), ('al-Sarāb', 'mirage'), ('al-Ghubār', 'dust-plume'),
        ('al-Qamar', 'crescent-moon'), ('al-Bīr', 'cistern-well'), ('al-Jabal', 'escarpment'), ('al-Nar', 'ember'),
        ('al-Zulāl', 'cool-oasis'), ('al-Ḥajar', 'black-basalt'), ('al-Kawkab', 'falling-star'), ('al-Salsal', 'dry-clay'),
    ],
    'tabist': [
        ('Mlh', 'halite-salt'), ('Kbrt', 'sulfur'), ('Šms', 'sun-furnace'), ('Ṣḫr', 'fault-scarp'),
        ('Nḥs', 'copper-brine'), ('Rml', 'gypsum-sand'), ('Ḍbb', 'pressure-haze'), ('ʿyn', 'artesian-seep'),
        ('Ǧbl', 'horsts'), ('Ḥmm', 'hot-brine'), ('Qmr', 'moon-pan'), ('Nǧm', 'star-crust'),
        ('Ḥdd', 'iron-oxide'), ('Ḏhb', 'ochre-gold'), ('Fḍḍ', 'silver-sylvite'), ('Bḥr', 'sunken-sea'),
    ],
    'scyvoi': [
        ('Borun', 'burnt-grass'), ('Filem', 'flame'), ('Sivift', 'swift'), ('Bitir', 'bitter'),
        ('Karun', 'black-stone'), ('Akun', 'white-salt'), ('Kizil', 'red-cuesta'), ('Yesil', 'gallery-green'),
        ('Altin', 'gold-dust'), ('Demir', 'ironstone'), ('Kumun', 'sand-sheet'), ('Kayan', 'kopje-rock'),
        ('Yelun', 'dry-wind'), ('Gunes', 'sun-baked'), ('Yildiz', 'star'), ('Derin', 'deep-gully'),
        ('Serin', 'cool-spring'), ('Tuzun', 'salt-pan'), ('Bozun', 'grey-steppe'), (' Cakmak', 'flint'),
    ],
    'screamer': [
        ('Dusty', 'dusty'), ('Red', 'red'), ('Dry', 'dry'), ('Saline', 'saline'),
        ('Wagon', 'wagon'), ('Caravan', 'caravan'), ('Lantern', 'lantern'), ('Mirage', 'mirage'),
        ('Cairn', 'cairn'), ('alkali', 'alkali'), ('Gypsum', 'gypsum'), ('Ochre', 'ochre'),
        ('Sundown', 'sundown'), ('Noon', 'noon'), ('Broken', 'broken'), ('Lost', 'lost'),
    ],
    'zeijani': [
        ('Šurpu', 'cinder-burn'), ('Qarnu', 'horn-vent'), ('Nūru', 'magma-glow'), ('Dhelv', 'fissure-vault'),
        ('ṭūbu', 'basalt-tube'), ('Šaplu', 'deep-under'), ('Girru', 'lava-fire'), ('Eperu', 'ash-fall'),
        ('Kibrītu', 'brimstone'), ('Anzû', 'fumarole-plume'), ('ṣalmu', 'obsidian-black'), ('peṣû', 'sinter-white'),
        ('sāmu', 'scoria-red'), ('ellu', 'steam-clear'), ('dannu', 'strong-wall'), ('šadû', 'caldera-rim'),
    ],
    'jimjam': [
        ('Veḷḷi', 'silver'), ('Poṉ', 'gold'), ('Karuppu', 'black-silt'), ('Ceṅ', 'red-clay'),
        ('Pacum', 'green-paddy'), ('Nīla', 'blue-lotus'), ('Periya', 'great'), ('Ciṉṉa', 'little'),
        ('Kuḷir', 'cool'), ('Vēka', 'swift'), ('Āḻa', 'deep'), ('Uppu', 'brackish'),
        ('Kal', 'granite-stone'), ('Mūṅkil', 'bamboo'), ('Tāmarai', 'lotus'), ('Mēkam', 'monsoon-cloud'),
    ],
    'eternian': [
        ('Pāk', 'white-jade'), ('Hāk', 'black-ink'), ('Hōng', 'vermilion'), ('Tsēng', 'celadon-green'),
        ('Kām', 'gold-leaf'), ('Ngān', 'silver-thread'), ('Chī', 'paper-scroll'), ('Lōk', 'willow-terrace'),
        ('Wūn', 'cloud-mist'), ('Fūng', 'north-wind'), ('Sēk', 'stone-weir'), ('Chīng', 'clear-mirror'),
        ('Sām', 'deep-pool'), ('Chūng', 'middle-dyke'), ('Tōng', 'eastern-reed'), ('Sī', 'western-marsh'),
        ('Līng', 'lotus-bell'), ('Mō', 'ink-stone'), ('Yūt', 'moon-bridge'), ('Sīng', 'star-lantern'),
    ],
    'yusar': [
        ('Lightsun', 'sun-light'), ('Stonered', 'red-stone'), ('Glassblue', 'blue-glass'), ('Watchstill', 'still-watch'),
        ('Sleepdown', 'down-sleep'), ('Walkcrook', 'crooked-walk'), ('Sideout', 'outside'), ('Turnback', 'back-turn'),
        ('Fallhigh', 'high-fall'), ('Coldkeep', 'keep-cold'), ('Saltwhite', 'white-salt'), ('Ashgrey', 'grey-ash'),
        ('Ironblack', 'black-iron'), ('Golddeep', 'deep-gold'), ('Windlow', 'low-wind'), ('Shadowlong', 'long-shadow'),
    ],
    'heiland': [
        ('Sutar', 'star'), ('Korut', 'cold'), ('Payar', 'fire'), ('San', 'sun'),
        ('Hay', 'high'), ('Par', 'far'), ('Suno', 'snow'), ('Aisu', 'ice'),
        ('Suton', 'stone'), ('Kuruk', 'crooked'), ('Waito', 'white'), ('Burak', 'black'),
        ('Reto', 'red'), ('Kurin', 'green'), ('irun', 'iron'), ('Koruto', 'gold'),
        ('Misu', 'mist'), ('Winto', 'wind'), ('Tipu', 'deep'), ('Sori', 'slump-bench'),
    ],
    'farside': [
        ('cKould', 'cold-click'), ('qStoun', 'stone-click'), ('xWinda', 'wind-click'), ('ɓRiba', 'deep-implosive'),
        ('ɗGould', 'gold-implosive'), ('cWaita', 'white-foam'), ('qBlaka', 'black-shale'), ('xMista', 'sea-fog'),
        ('cSolt', 'salt-spray'), ('qAina', 'iron-sand'), ('xKlira', 'clear-pebble'), ('ɓSuna', 'west-sun'),
        ('ɗStara', 'outer-star'), ('cFols', 'bench-falls'), ('qRidj', 'terrace-ridge'), ('xBrod', 'broad-wash'),
    ],
    'argot': [
        ('Xipa', 'ship-hull'), ('Raida', 'raider'), ('Golda', 'gold'), ('Pepa', 'paper-treaty'),
        ('Mape', 'chart-map'), ('Gete', 'spillway-gate'), ('Roda', 'portage-road'), ('Kamandar', 'commander'),
        ('Barada', 'brother-crew'), ('Ankra', 'anchor'), ('Kebla', 'cable-chain'), ('Timba', 'drift-timber'),
        ('bretša', 'breach-coulee'), ('katarak', 'cataract'), ('yardang', 'wind-keel'), ('balsa', 'raft'),
    ],
    'khaay': [
        ('Qoold', 'bitter-cold'), ('Lheek', 'tundra-lake'), ('Aays', 'blue-ice'), ('Ïsnoo', 'drift-snow'),
        ('Ïstaar', 'polar-star'), ('Paayar', 'hearth-fire'), ('Goold', 'gold-nugget'), ('Qaribuu', 'caribou'),
        ('Musïq', 'musk-ox'), ('Khaay', 'yeti-peak'), ('Ïstoon', 'permafrost-stone'), ('Waayt', 'white-rime'),
        ('Bïlaaq', 'black-lichen'), ('Gïriin', 'moss-green'), ('Wïïnd', 'katabatic-wind'), ('Mïïst', 'ice-fog'),
    ],
    'talovolci': [
        ('Spirla', 'spiral-whorl'), ('Clodos', 'cloud-sea'), ('Ixos', 'glacier-ice'), ('Stanos', 'menhir-stone'),
        ('Viros', 'giant-stride'), ('Sunos', 'high-sun'), ('Starros', 'zenith-star'), ('Goldos', 'sun-gold'),
        ('Gedos', 'lightning-spear'), ('Vindos', 'white-mist'), ('Dubnos', 'deep-chasm'), ('Dervos', 'moss-oak'),
        ('Branos', 'cloud-raven'), ('Nemetos', 'sacred-grove'), ('Dunon', 'tor-citadel'), ('Magos', 'paramo-plain'),
    ],
    'hum': [
        ('Hau', 'coyote-hound'), ('Tsēk', 'cleaver-stone'), ('Kām', 'copper-gold'), ('Pāk', 'white-mesa'),
        ('Hāk', 'black-basalt'), ('Hōng', 'red-sandstone'), ('Chīng', 'clear-pool'), ('Fūng', 'canyon-wind'),
        ('Lōk', 'step-bench'), ('Kū', 'spider-web'), ('Sēk', 'chasm-wall'), ('Mō', 'Dry-mist'),
        ('Yūt', 'howling-moon'), ('Sīng', 'night-star'), ('Tōng', 'east-gate'), ('Sī', 'west-pass'),
        ('Lām', 'ring-dike'), ('Wūn', 'cloud-ledge'), ('Chūng', 'middle-tier'), ('Sām', 'deep-notch'),
    ],
    'tungang': [
        ('Stuan', 'stone'), ('Gowd', 'gold'), ('Kowd', 'cold'), ('Fah', 'far'),
        ('Neet', 'night'), ('Leet', 'light'), ('Kual', 'coal'), ('Tlahn', 'iron-clan'),
        ('Tkyoob', 'Cube'), ('Yan', 'First'), ('Tyan', 'Second'), ('Tethera', 'Third'),
        ('Methera', 'Fourth'), ('Pimp', 'Fifth'), ('Howe', 'howe-mound'), ('Garth', 'garth-enclosure'),
        ('Fell', 'high-fell'), ('Tarn', 'mountain-tarn'), ('Kruk', 'crook-bend'), ('Kopa', 'copper-ice'),
        ('Blek', 'black-shale'), ('Weyt', 'white-water'), ('Deyp', 'deep-gill'), ('Brant', 'steep-brow'),
    ],
    'shumari': [
        ('Šubaru', 'sword-caste'), ('Urudīru', 'ordeal'), ('Suṭāru', 'star'), ('Ṣunun', 'sun'),
        ('Gurudun', 'gold'), ('Širubun', 'silver'), ('Suṭōnun', 'stone'), ('Qōrudu', 'cold'),
        ('ʾAyrun', 'iron'), ('Dīpun', 'deep'), ('Ḫayun', 'high'), ('Purī', 'free'),
        ('Ṭirānu', 'cadet-train'), ('Bētun', 'hearth-house'), ('Dōriyan', 'old-shore'), ('Nazāru', 'ruin-kin'),
        ('Šumāru', 'highland-watch'), ('Qappu', 'crest-keep'), ('Kattu', 'blade-cut'), ('Wārun', 'war-host'),
        ('Ṣōrun', 'salt-rime'), ('Mīṣu', 'mist'), ('Pāyaru', 'beacon-fire'), ('Gēdun', 'giant-spear'),
    ],
}


def build_tongue_grid(regs_exp, shape=(1723, 1821)):
    """Rasterize `regs_exp` onto `(1723, 1821)` to assign every cell its highest-priority cultural tongue."""
    OH, OW = shape
    tongue_list = sorted(TONGUE_GENERICS.keys())
    t_to_id = {t: i + 1 for i, t in enumerate(tongue_list)}
    id_to_t = {i + 1: t for i, t in enumerate(tongue_list)}

    t_grid = np.zeros((OH, OW), dtype=np.uint8)
    p_grid = np.zeros((OH, OW), dtype=np.uint8)

    for r in regs_exp:
        nm = r.get('name', '').strip()
        if nm not in REGION_TO_TONGUE:
            continue
        t_code, prio = REGION_TO_TONGUE[nm]
        pts = r.get('points') or []
        if len(pts) < 3:
            continue
        img = Image.new('L', (OW, OH), 0)
        ImageDraw.Draw(img).polygon([(float(p[0]), float(p[1])) for p in pts], fill=1)
        m = np.array(img, dtype=bool)

        # Special split inside `NW lowlands`: eastern side (`X >= 585`) is `jimjam`, western/central is `eternian`
        if nm == 'NW lowlands':
            Y_i, X_i = np.indices((OH, OW))
            m_jj = m & (X_i >= 585)
            m_et = m & (X_i < 585)
            upd_jj = m_jj & (prio >= p_grid)
            t_grid[upd_jj] = t_to_id['jimjam']
            p_grid[upd_jj] = prio
            upd_et = m_et & (prio >= p_grid)
            t_grid[upd_et] = t_to_id['eternian']
            p_grid[upd_et] = prio
            continue

        upd = m & (prio >= p_grid)
        t_grid[upd] = t_to_id[t_code]
        p_grid[upd] = prio

    return t_grid, id_to_t


def infer_river_tongue(r, t_grid, id_to_t, setts_exp):
    """Determine the authentic tongue for river `r` on the `1821x1723` grid."""
    OH, OW = t_grid.shape
    pts = r.get('px') or []
    if not pts:
        return 'dalab'

    # Sample along the river course (giving double weight to the lower/mouth half where settlements cluster)
    votes = {}
    n_pts = len(pts)
    for idx_p, (px, py) in enumerate(pts):
        ix = min(OW - 1, max(0, int(round(px))))
        iy = min(OH - 1, max(0, int(round(py))))
        tid = int(t_grid[iy, ix])
        if tid > 0:
            t_code = id_to_t[tid]
            w = 2 if idx_p >= n_pts // 2 else 1
            votes[t_code] = votes.get(t_code, 0) + w

    if votes:
        return max(votes.items(), key=lambda kv: kv[1])[0]

    # Fallback: check nearest settlement or quadrant on `1821x1723`
    mx, my = pts[len(pts) // 2]
    if my < 420:
        if mx > 1250:
            return 'khaay' if my < 240 else 'hum'
        if mx > 880:
            return 'hum'
        if mx < 460:
            return 'islanderw'
        return 'eternian'
    if mx < 380:
        if my < 760:
            return 'farside'
        if my < 1100:
            return 'heiland'
        return 'tungang'
    if mx > 1380:
        if my < 820:
            return 'hum'
        return 'dasri'
    return 'dalab'


def format_river_name(tongue, stem, generic, order, rid):
    """Combine `stem` and `generic` according to the tongue's morphological rules."""
    stem_c = stem.strip()
    if tongue == 'republic' and stem_c in {'パイン', 'ミル', 'ग्रेनाइट'}:
        stem_c = {'パイン': 'Pajn', 'ミル': 'Mil', 'ग्रेनाइट': 'Granit'}[stem_c]
    if tongue == 'izani' and stem_c == 'クラウン':
        stem_c = 'Craun'

    if tongue == 'dasri':
        # Arabic-style idafa: `Rīfar al-Raml` or `Wādī al-Milḥ`
        if not stem_c.startswith('al-'):
            stem_c = 'al-' + stem_c
        return f'{generic} {stem_c}'

    if tongue == 'xanadui':
        # Xanadui (the tongues sheet): the adjective first, as `Reḍ Riwā`, `Solṭ Siṭrīm`, `Bhon Ḍrāi`
        return f'{stem_c} {generic}'

    if tongue == 'zeijani':
        # Akkadian construct state: `Nāru-Šurpu`, `Palgu-Qarnu`, `ḫarru-Kibrītu`
        return f'{generic}-{stem_c.capitalize()}'

    if tongue == 'jimjam':
        # Dravidian agglutinative compound: `Veḷḷiyāṟu`, `Poṉṉōṭai`, `Karuppukkāl`
        return f'{stem_c}-{generic}'

    if tongue == 'eternian':
        # Hyphenated monosyllabic tone-compound: `Pāk-Mā`, `Lōk-Kē`, `Sēk-Kū`
        return f'{stem_c}-{generic}'

    if tongue == 'hum':
        # Hām / Coyote-Bark monosyllabic compound: `Hau-Hām`, `Tsēk-Kē`, `Pāk-Gèl`
        return f'{stem_c}-{generic}'

    if tongue == 'shumari':
        # Shumari Akkadian-Japanese highland compound: `Šubaru-Nārun`, `Urudīru-Buruqu`, `Suṭōnun-Ḫarrun`
        return f'{stem_c}-{generic}'

    if tongue == 'vrivolci':
        # Free Giants compound: `Spirlariba`, `Uarosbruk`, `Stanosguli`
        return f'{stem_c}{generic.lower()}'

    if tongue == 'yusar':
        # Yusar head-first avoidance compound: `Waywater Lightsun`, `Runbrook Stonered`, `Cutdry Ashgrey`
        return f'{generic} {stem_c}'

    if order == 'GW':
        return f'{generic} {stem_c}'
    return f'{stem_c} {generic}'


def _rid_num(rid):
    """Extract deterministic numeric ID from `'r001'` -> `1` or `9101` -> `9101`."""
    if isinstance(rid, int):
        return rid
    s = str(rid).strip()
    if (s.startswith('r') or s.startswith('R')) and s[1:].isdigit():
        return int(s[1:])
    try:
        return int(s)
    except ValueError:
        h = hashlib.sha256(s.encode('utf-8')).digest()
        return 100000 + (int.from_bytes(h[:4], 'big') % 100000)


FROZEN_NAMES_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frozen_river_names.json')


def _stable_river_seed(rid_str, tng, mod_a, mod_b):
    """Deterministic `(seed_idx, q_seed)` keyed solely on `(river_id, tongue)` via SHA-256."""
    digest = hashlib.sha256(f'{rid_str}:{tng}'.encode('utf-8')).digest()
    seed_a = int.from_bytes(digest[:4], 'big') % max(1, mod_a)
    seed_b = int.from_bytes(digest[4:8], 'big') % max(1, mod_b)
    return seed_a, seed_b


def drains_to(to):
    """the table's "Drains To": a river's name, a sea's, a lake's or basin's level; '—' where the record says only where it ends"""
    to = to or {}
    if to.get('name'):
        return to['name']
    if to.get('river'):
        return str(to['river'])
    if to.get('sea') or to.get('kind') == 'sea':
        return to.get('sea') or 'sea'
    if 'lake_m' in to:
        return 'lake (%s m%s)' % (format(int(to['lake_m']), ','), ', through' if to.get('through') else '')
    if 'basin_m' in to:
        return 'basin (%s m)' % format(int(to['basin_m']), ',')
    if 'below_lake_m' in to:
        return 'ends below a lake (%s m)' % format(int(to['below_lake_m']), ',')
    return to.get('kind') or '—'


def rename_all_rivers_culturally(rivers_exp, regs_exp, setts_exp, En_exp=None, markdown_out_path=None, old_rivers=None):
    """Assign culturally and linguistically authentic names across all 27 tongues to `rivers_exp`.

    Names are keyed strictly on `(river id, tongue)` via SHA-256 and processed in fixed ID order
    so that editing a river's course (`px`), length (`length_km`), or list order never changes any river's name.
    """
    t_grid, id_to_t = build_tongue_grid(regs_exp, shape=(1723, 1821))

    frozen_map = {}
    if os.path.exists(FROZEN_NAMES_PATH):
        try:
            with open(FROZEN_NAMES_PATH, encoding='utf-8') as f:
                frozen_map = json.load(f)
        except Exception:
            frozen_map = {}

    old_name_by_id = {}
    if old_rivers:
        for orv in old_rivers:
            old_name_by_id[str(orv.get('id'))] = (orv.get('name') or '').strip()

    used_names = set()
    id_to_river = {str(r['id']): r for r in rivers_exp}

    # Pass 1: Normalize metadata (`length_km`, `kind`), record `old_name`, and lock in all canon / fixed rivers first
    # Process in fixed ID order for complete determinism
    rivers_in_id_order = sorted(rivers_exp, key=lambda r: (_rid_num(r['id']), str(r['id'])))
    canon_ids = set()
    for r in rivers_in_id_order:
        rid_str_0 = str(r['id'])
        if 'old_name' not in r:
            if rid_str_0 in old_name_by_id:
                r['old_name'] = old_name_by_id[rid_str_0]
            elif _rid_num(r['id']) >= 9100:
                r['old_name'] = '(5.1 expansion)'
            else:
                r['old_name'] = (r.get('name') or '').strip()
        if r.get('length_km') is None and r.get('len_km') is not None:
            r['length_km'] = float(r['len_km'])
        elif r.get('length_km') is None:
            pts_r = r.get('px') or []
            if len(pts_r) >= 2:
                r['length_km'] = round(sum(
                    math.hypot(pts_r[i][0] - pts_r[i - 1][0], pts_r[i][1] - pts_r[i - 1][1]) * 2.0
                    for i in range(1, len(pts_r))
                ), 1)
            else:
                r['length_km'] = 12.0
        if not r.get('kind'):
            r['kind'] = 'river'

        rid_str = str(r['id'])
        rid = _rid_num(r['id'])
        cur_name = (r.get('name') or '').strip()
        if rid_str in CANON_BY_STR_ID:
            nm, tng, gls = CANON_BY_STR_ID[rid_str]
            r['name'] = nm
            r['tongue'] = tng
            r['gloss'] = gls
            r['name_fixed'] = True
            used_names.add(nm.lower())
            canon_ids.add(rid_str)
        elif isinstance(r['id'], int) and rid in CANON_BY_ID:
            nm, tng, gls = CANON_BY_ID[rid]
            r['name'] = nm
            r['tongue'] = tng
            r['gloss'] = gls
            r['name_fixed'] = True
            used_names.add(nm.lower())
            canon_ids.add(rid_str)
        elif rid_str.startswith('r') and rid_str[1:].isdigit() and rid in CANON_BY_ID:
            nm, tng, gls = CANON_BY_ID[rid]
            r['name'] = nm
            r['tongue'] = tng
            r['gloss'] = gls
            r['name_fixed'] = True
            used_names.add(nm.lower())
            canon_ids.add(rid_str)
        elif r.get('name_fixed') or cur_name in CANON_RIVER_NAMES:
            if not r.get('tongue'):
                r['tongue'] = infer_river_tongue(r, t_grid, id_to_t, setts_exp)
            used_names.add(cur_name.lower())
            canon_ids.add(rid_str)

    # Sort remaining rivers strictly in fixed ID order (never by `length_km` or coordinates)
    remaining = [r for r in rivers_in_id_order if str(r['id']) not in canon_ids]

    tongue_counts = {}
    for r in rivers_in_id_order:
        if str(r['id']) in canon_ids:
            tng = r.get('tongue') or 'dalab'
            tongue_counts[tng] = tongue_counts.get(tng, 0) + 1

    # Secondary qualifier prefixes/numerals per tongue for disambiguating minor streams/wadis when a tongue has >20 courses
    SECONDARY_QUALIFIERS = {
        'vothic':    [('Owr', 'upper'), ('Nidr', 'lower'), ('Grots', 'great'), ('Litl', 'little'), ('Nord', 'north'), ('Zud', 'south'), ('Ost', 'east'), ('Vest', 'west')],
        'izani':     [('Alta', 'high'), ('Baja', 'low'), ('Gran', 'great'), ('Pica', 'little'), ('Norta', 'north'), ('Suda', 'south'), ('Esta', 'east'), ('Oesta', 'west')],
        'hykkousik': [('Hyghe', 'high'), ('Lhou', 'low'), ('Graet', 'great'), ('Lyttle', 'little'), ('Nhor', 'north'), ('Soud', 'south'), ('Aest', 'east'), ('Whest', 'west')],
        'islander':  [('Runga', 'upper'), ('Raro', 'lower'), ('Nui', 'great'), ('Iti', 'little'), ('Tonga', 'south'), ('Tokerau', 'north')],
        'islanderw': [('Runga', 'upper'), ('Raro', 'lower'), ('Nui', 'great'), ('Iti', 'little'), ('Rāwhiti', 'east'), ('Tua', 'outer')],
        'xanadui':   [('Xāi', 'upper'), ('Lo', 'lower'), ('Garēṭ', 'great'), ('Liṭal', 'little'), ('North', 'north'), ('Sāuth', 'south')],
        'yuni':      [('Apa', 'upper'), ('Loua', 'lower'), ('Biga', 'great'), ('Likl', 'little'), ('Norta', 'north'), ('Sauta', 'south'), ('Ista', 'east'), ('Westa', 'west')],
        'dalab':     [('Apa', 'upper'), ('Loua', 'lower'), ('Big', 'great'), ('Likl', 'little'), ('Nort', 'north'), ('Saut', 'south'), ('Ist', 'east'), ('West', 'west')],
        'vrivolci':  [('Uxo', 'upper'), ('Ande', 'lower'), ('Mago', 'great'), ('Brigo', 'high'), ('Are', 'fore'), ('Ate', 'back')],
        'republic':  [('Ovr', 'upper'), ('Nidr', 'lower'), ('Grejt', 'great'), ('Litl', 'little'), ('Nort', 'north'), ('Saut', 'south'), ('Ist', 'east'), ('West', 'west')],
        'painted':   [('Hàj', 'high'), ('Lò', 'low'), ('Bìg', 'great'), ('Smòl', 'small'), ('Nòr', 'north'), ('Sàu', 'south'), ('Ìst', 'east'), ('Wèst', 'west')],
        'riders':    [('Deigo', 'upper'), ('Yaago', 'lower'), ('Tsoh', 'great'), ('Yázhí', 'little'), ('Náhookǫs', 'north'), ('Shádi\'ááh', 'south')],
        'dasri':     [('al-Fawq', 'upper'), ('al-Taḥt', 'lower'), ('al-Kabīr', 'great'), ('al-Ṣaghīr', 'little'), ('al-Sharq', 'east'), ('al-Gharb', 'west')],
        'tabist':    [('ʿly', 'upper'), ('Sfl', 'lower'), ('Kbr', 'great'), ('Ṣġr', 'little'), ('Šml', 'north'), ('Ǧnb', 'south')],
        'scyvoi':    [('Ustu', 'upper'), ('Altu', 'lower'), ('Buyuk', 'great'), ('Kucuk', 'little'), ('Kuzey', 'north'), ('Guney', 'south'), ('Dogu', 'east'), ('Bati', 'west')],
        'screamer':  [('Upper', 'upper'), ('Lower', 'lower'), ('Big', 'big'), ('Little', 'little'), ('North', 'north'), ('South', 'south'), ('East', 'east'), ('West', 'west')],
        'zeijani':   [('Elû', 'upper'), ('Šaplû', 'lower'), ('Rabû', 'great'), ('Ṣeḫru', 'little'), ('Iltānu', 'north'), ('Šūtu', 'south')],
        'jimjam':    [('Mēl', 'upper'), ('Kīḻ', 'lower'), ('Perum', 'great'), ('Ciṟu', 'little'), ('Vaṭa', 'north'), ('Teṉ', 'south')],
        'eternian':  [('Sāng', 'upper'), ('Hā', 'lower'), ('Tāi', 'great'), ('Sīu', 'little'), ('Pāk', 'north'), ('Nām', 'south'), ('Tōng', 'east'), ('Sī', 'west')],
        'yusar':     [('Highside', 'upper'), ('Lowside', 'lower'), ('Wideway', 'great'), ('Smallway', 'little'), ('Northway', 'north'), ('Southway', 'south')],
        'heiland':   [('Apu', 'upper'), ('Rawa', 'lower'), ('Piku', 'great'), ('Ritur', 'little'), ('Nuto', 'north'), ('Sauto', 'south')],
        'farside':   [('cApa', 'upper'), ('qLoua', 'lower'), ('xBiga', 'great'), ('ɓLikl', 'little'), ('ɗNort', 'north'), ('cSaut', 'south')],
        'argot':     [('Topa', 'upper'), ('Bota', 'lower'), ('Granda', 'great'), ('Pikina', 'little'), ('Norta', 'north'), ('Suda', 'south')],
        'khaay':     [('Haay', 'upper'), ('Loo', 'lower'), ('Bïïg', 'great'), ('Lïtl', 'little'), ('Noor', 'north'), ('Suut', 'south')],
        'talovolci': [('Uxo', 'upper'), ('Ande', 'lower'), ('Marios', 'great'), ('Bccos', 'little'), ('Touto', 'north'), ('Dexso', 'south')],
        'hum':       [('Sāng', 'upper'), ('Hā', 'lower'), ('Tāi', 'great'), ('Sīu', 'little'), ('Pāk', 'north'), ('Nām', 'south'), ('Tōng', 'east'), ('Sī', 'west')],
        'tungang':   [('Haa', 'high'), ('Laa', 'low'), ('Muckle', 'great'), ('Lile', 'little'), ('Noth', 'north'), ('Sooth', 'south'), ('Yist', 'east'), ('Wist', 'west')],
        'shumari':   [('ʾElū', 'upper'), ('Šaplū', 'lower'), ('Gurēṭu', 'great'), ('Ṣīru', 'little'), ('Nōšu', 'north'), ('Ṣūšu', 'south'), ('ʾĪṣu', 'east'), ('Weṣu', 'west')],
    }

    for r in remaining:
        rid_str = str(r['id'])
        rid = _rid_num(r['id'])
        existing_tng = r.get('tongue')
        def_tng_key = f'{rid_str}:__tongue__'
        if existing_tng and existing_tng in TONGUE_GENERICS:
            tng = existing_tng
        else:
            inferred_tng = infer_river_tongue(r, t_grid, id_to_t, setts_exp)
            if inferred_tng == 'shumari':
                tng = 'shumari'
            elif def_tng_key in frozen_map and frozen_map[def_tng_key] in TONGUE_GENERICS:
                tng = frozen_map[def_tng_key]
            else:
                tng = inferred_tng
        r['tongue'] = tng
        frozen_map[def_tng_key] = tng

        freeze_key = f'{rid_str}:{tng}'
        if freeze_key in frozen_map:
            f_entry = frozen_map[freeze_key]
            f_name = f_entry.get('name', '').strip()
            if f_name and f_name.lower() not in used_names:
                r['name'] = f_name
                r['gloss'] = f_entry.get('gloss', '')
                used_names.add(f_name.lower())
                tongue_counts[tng] = tongue_counts.get(tng, 0) + 1
                continue

        kind = r.get('kind', 'perennial')
        order_num = int(r.get('order') or 1)

        riv_w, str_w, wad_w, word_order = TONGUE_GENERICS[tng]
        if kind == 'wadi':
            generic = wad_w
            generic_en = 'wadi'
        elif order_num >= 2 or rid <= 220 or (9100 <= rid < 100000):
            generic = riv_w
            generic_en = 'river'
        else:
            generic = str_w
            generic_en = 'stream'

        lex = TONGUE_LEXICON[tng]
        quals = SECONDARY_QUALIFIERS[tng]

        # Deterministic starting index keyed strictly on `(river id, tongue)` via SHA-256
        seed_idx, q_seed = _stable_river_seed(rid_str, tng, len(lex), len(quals))

        chosen_name = None
        chosen_gloss = None

        # Try unprefixed stems first
        for step in range(len(lex)):
            stem, gls_en = lex[(seed_idx + step) % len(lex)]
            cand = format_river_name(tng, stem, generic, word_order, rid)
            if cand.lower() not in used_names:
                chosen_name = cand
                chosen_gloss = f"{stem} ({gls_en}) + {generic} ({generic_en})"
                break

        # If all primary stems for this generic are taken in this tongue, combine with a directional/size qualifier
        if chosen_name is None:
            for q_step in range(len(quals)):
                q_loc, q_en = quals[(q_seed + q_step) % len(quals)]
                for step in range(len(lex)):
                    stem, gls_en = lex[(seed_idx + step) % len(lex)]
                    if tng in {'eternian', 'hum', 'zeijani', 'jimjam', 'shumari'}:
                        comp_stem = f'{q_loc}-{stem}'
                    elif tng == 'dasri':
                        comp_stem = f'{stem} {q_loc}'
                    else:
                        comp_stem = f'{q_loc} {stem}'
                    cand = format_river_name(tng, comp_stem, generic, word_order, rid)
                    if cand.lower() not in used_names:
                        chosen_name = cand
                        chosen_gloss = f"{q_loc} ({q_en}) + {stem} ({gls_en}) + {generic} ({generic_en})"
                        break
                if chosen_name is not None:
                    break

        # Final fallback (guaranteed unique)
        if chosen_name is None:
            stem, gls_en = lex[seed_idx]
            chosen_name = f"{format_river_name(tng, stem, generic, word_order, rid)} {rid}"
            chosen_gloss = f"{stem} ({gls_en}) + {generic} ({generic_en})"

        r['name'] = chosen_name
        r['gloss'] = chosen_gloss
        used_names.add(chosen_name.lower())
        tongue_counts[tng] = tongue_counts.get(tng, 0) + 1
        frozen_map[freeze_key] = {'name': chosen_name, 'gloss': chosen_gloss}

    if markdown_out_path or not os.path.exists(FROZEN_NAMES_PATH):
        try:
            with open(FROZEN_NAMES_PATH, 'w', encoding='utf-8', newline='\n') as f:
                json.dump(frozen_map, f, ensure_ascii=False, indent=2, sort_keys=True)
                f.write('\n')
        except Exception:
            pass

    # Pass 2: Update `r['to']['name']` for all tributaries that drain into another river
    num_to_river = {_rid_num(r['id']): r for r in rivers_exp if isinstance(r['id'], int) or (str(r['id']).startswith('r') and str(r['id'])[1:].isdigit())}
    for r in rivers_exp:
        to_info = r.get('to')
        if isinstance(to_info, dict):
            target_id = to_info.get('river') if to_info.get('river') is not None else to_info.get('id')
            if target_id is not None:
                if str(target_id) in id_to_river:
                    to_info['name'] = id_to_river[str(target_id)]['name']
                elif _rid_num(target_id) in num_to_river:
                    to_info['name'] = num_to_river[_rid_num(target_id)]['name']

    # Write markdown summary table if requested
    if markdown_out_path:
        lines = [
            '# Rivers & Wadis of Krator — Scale Model 5.1 (All 27 Cultural Tongues & Dialects)',
            '',
            f'Total named courses: **{len(rivers_exp)}** (`0` unnamed placeholders remaining).',
            '',
            '## Summary by Tongue',
            '',
            '| Tongue Code | Courses Named | Example Courses |',
            '| :--- | ---: | :--- |',
        ]
        for tng in sorted(tongue_counts.keys(), key=lambda k: -tongue_counts[k]):
            ex = [
                f"`{r['name']}` ({r['length_km']:.0f} km)"
                for r in sorted(
                    [rv for rv in rivers_exp if rv.get('tongue') == tng],
                    key=lambda x: -float(x.get('length_km') or 0.0)
                )[:4]
            ]
            lines.append(f"| `{tng}` | {tongue_counts[tng]} | {', '.join(ex)} |")

        lines.extend([
            '',
            '## Major Rivers & Wadis (`>= 120 km` or Canon/Expansion)',
            '',
            '| ID | 4.21/4.23 Old Name | 5.1 New Name | Tongue | Kind | Length (km) | Source -> Mouth (m) | Drains To | Gloss |',
            '| ---: | :--- | :--- | :--- | :--- | ---: | :--- | :--- | :--- |',
        ])
        major = [
            r for r in rivers_exp
            if float(r.get('length_km') or 0.0) >= 120.0 or str(r['id']) in canon_ids or _rid_num(r['id']) >= 9100
        ]
        major.sort(key=lambda r: (-float(r.get('length_km') or 0.0), _rid_num(r['id'])))
        for r in major:
            to_str = drains_to(r.get('to'))
            old_nm = r.get('old_name') or '—'
            lines.append(
                f"| `{r['id']}` | `{old_nm}` | **{r['name']}** | `{r.get('tongue')}` | {r.get('kind')} "
                f"| {float(r.get('length_km') or 0.0):.0f} | `{r.get('source_m', 0):.0f} -> {r.get('mouth_m', 0):.0f}` "
                f"| {to_str} | {r.get('gloss', '')} |"
            )

        lines.extend([
            '',
            '## Complete Cross-Reference Table (All Courses by ID)',
            '',
            '| ID | 4.21/4.23 Old Name | 5.1 New Name | Tongue | Kind | Length (km) | Source -> Mouth (m) | Drains To | Gloss |',
            '| ---: | :--- | :--- | :--- | :--- | ---: | :--- | :--- | :--- |',
        ])
        all_sorted = sorted(rivers_exp, key=lambda r: _rid_num(r['id']))
        for r in all_sorted:
            to_str = drains_to(r.get('to'))
            old_nm = r.get('old_name') or '—'
            lines.append(
                f"| `{r['id']}` | `{old_nm}` | **{r['name']}** | `{r.get('tongue')}` | {r.get('kind')} "
                f"| {float(r.get('length_km') or 0.0):.0f} | `{r.get('source_m', 0):.0f} -> {r.get('mouth_m', 0):.0f}` "
                f"| {to_str} | {r.get('gloss', '')} |"
            )
        with open(markdown_out_path, 'w', encoding='utf-8', newline='\n') as f:
            f.write('\n'.join(lines) + '\n')

    return rivers_exp, tongue_counts
