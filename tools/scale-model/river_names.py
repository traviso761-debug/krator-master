#!/usr/bin/env python3
"""Scale model 4.21: names for the rivers in the regions whose tongue is on record (lore/tongues-of-krator.html).

    python3 tools/scale-model/river_names.py <4.21 page.html> <regions.json> <out page.html>

Each river and dry valley of DATA.rivers (edit_rivers.py) lying mostly (half its course or more) inside a region of
TONGUE takes a name in that region's tongue; the others keep their provisional names. Each named course gains `tongue`
and `gloss` (the English the name grew from); the course a tributary joins is renamed in its `to` as well.

The words are English run through each tongue's regular changes (the tongues page, "From English"): Vothic tz-, final
-rh, f/w > v; Izani w > gu, is-, -ar, final -a; Hykkousik ou, ph, -oi; Xanadui retroflexes, nasal vowels, final -r lost;
Yuni clipped in -o and -i; Dalab's creole da-, lost h and s-, -a for -er; Hajlandsk v, je, final devoicing; Tl'aai
b for w/v, ejectives, nasal vowels; Dasri al-, p > b, v > f, g > j and its cousin Tabist a-, p > f, v > b; Zeijani's
emphatics and -um. A name comes from what the course is: salt where it ends in a salt basin, cold from a frozen source,
swift where it falls fast, falls over a cataract, long, the mother of a region's waters, red in a dry land, black in a
wet one, the reed river into a lake, and the settlement it passes; then a pool of plain words (sun, star, gold, bone,
stone...). A word is used once a tongue; when a tongue runs out, two words join. Deterministic.
"""
import io, base64, json, os, sys
import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edit_heights import load   # noqa: E402
from edit_dams import set_data   # noqa: E402

# the region (any layer) whose people name the waters in it, and their tongue (LORE.md section 6, the tongues page)
TONGUE = {'Vothic Kingdom': 'vothic', 'Empire of Iziz': 'izani', 'League of Amphitriton': 'hykkousik',
          'Xanadu Sultanate': 'xanadui', 'Vale of Xanadu': 'xanadui', 'Oidong Valley': 'xanadui',
          'Yuni Emirate': 'yuni', 'Yuni Valley': 'yuni', 'Dalab Council': 'dalab', 'Iron Republic': 'republic',
          'Free Clans': 'republic', 'Beast Riders': 'riders', 'Nomad Country': 'dasri', 'e abysss': 'tabist',
          'Throne/Volcano': 'zeijani', 'Scyvoi': 'scyvoi', 'crater drylands': 'scyvoi', 'Screamer Country': 'screamer'}
# (the Scyvoi range the crater drylands, both of the regions so named, as well as the polity drawn for them; the Screamers
# speak no tongue, so their waters carry the plain English the caravans give them)

# English -> the tongue's word, for each descriptor. Keys are the English; a missing key is a word the tongue lacks.
D_ = {
 'vothic': dict(long='Lonk', red='Ret', black='Blak', white='Vait', cold='Kolt', swift='Vast', salt='Tzolt',
                stone='Tzhon', sun='Tzun', star='Tzhar', gold='Golt', bone='Bon', iron='Airhn', reed='Rit',
                green='Grin', deep='Dip', bright='Brait', old='Olt', falls='Volz', mother='Mïdharh', little='Litl',
                thorn='Thon', snake='Tznek', wolf='Vulv', ash='As', fire='Vairh', moon='Mun', bitter='Bitrh',
                clear='Klirh', slave='Hlev', sky='Khai', blood='Blït', king='Kink', spear='Phirh', tree='Chi',
                strong='Chhong', true='Chu', skull='Khul', sand='Tzant', bend='Bent'),
 'izani': dict(long='Loña', red='Rreda', black='Blaga', white='Guaida', cold='Kolda', swift='Isguifta', salt='Salta',
               stone='Iston', sun='Son', star='Istar', gold='Golda', bone='Bon', iron='Airon', reed='Rrida',
               green='Grin', deep='Diba', bright='Braida', old='Olda', falls='Falz', mother='Modar', little='Lidol',
               thorn='Torn', snake='Isnega', wolf='Gulfa', ash='Ax', fire='Fira', moon='Mun', bitter='Bidar',
               clear='Klir', king='Kiñ', rose='Rroza', queen='Qin', jewel='Jual', emperor='Emparar', wing='Guiñ',
               sky='Iskai', three='Tri', sand='Sanda', bend='Benda', war='Guar'),
 'hykkousik': dict(long='Long', red='Redd', black='Blakk', white='Ouyt', cold='Kould', salt='Solt', stone='Astoun',
                   sun='San', star='Astar', gold='Gould', bone='Boun', iron='Yron', reed='Rid', green='Grin',
                   deep='Dip', bright='Bryt', old='Ould', mother='Mavar', fire='Phyr', moon='Moun', fish='Phis',
                   sea='Si', three='Thri', high='Hy'),
 'xanadui': dict(long='Lõ', red='Reḍ', black='Balāk', white='Wāiṭ', cold='Qol', swift='Siwipṭ', salt='Solṭ',
                 stone='Satõ', sun='Sã', star='Sitār', gold='Ghol', bone='Bhon', iron='Āirã', reed='Rīḍ',
                 green='Girīn', deep='Ḍhīp', bright='Barāiṭ', old='Olḍ', falls='Phols', mother='Mādā', fire='Phāyar',
                 moon='Mũ', snow='Sanõ', ice='Āis', sacred='Sekriḍ', sky='Sakāi', dome='Ḍhom', king='Kĩ',
                 thin='Thin', bitter='Biṭā', clear='Kilīā', jade='Jeḍ'),
 'yuni': dict(long='Longo', red='Reddi', black='Blacko', white='Woiti', cold='Coldi', swift='Quicki', salt='Saltie',
              stone='Stoni', sun='Sunno', star='Starro', gold='Goldi', bone='Bonzo', iron='Oiro', reed='Reedi',
              green='Greeno', deep='Deepo', bright='Broiti', old='Oldi', falls='Fallsi', mother='Mumma',
              little='Liddo', snake='Snakey', sand='Sando', dust='Dusti', bend='Bendo', ghost='Ghosti', crook='Crooki',
              dry='Droi', big='Bigga', rock='Rocko', dingo='Dingo', servo='Servo'),
 'dalab': dict(long='Long', red='Red', black='Blak', white='Wait', cold='Kol', swift='Wif', salt='Sol', stone='Ton',
               sun='Sun', star='Tar', gold='Gol', bone='Bon', iron='Aiyan', reed='Riid', green='Grin', deep='Diip',
               bright='Brait', old='Ol', falls='Fol', mother='Moda', little='Likl', snake='Sneik',
               lizard='Liza', god='Dagod', ranch='Daranch', ash='As', fire='Faya', moon='Mun', bitter='Bita',
               clear='Klia', oak='Ok', corn='Kon', mud='Mod', crooked='Kruki', sweet='Wiit'),
 'republic': dict(long='Lonk', red='Rjet', black='Blak', white='Vajt', cold='Kolt', swift='Svift', salt='Salt',
                  stone='Ston', sun='Sun', star='Star', gold='Golt', bone='Bon', iron='Jern', reed='Rit', green='Grin',
                  deep='Dip', bright='Brajt', old='Olt', falls='Fols', mother='Modr', wolf='Vulf', hammer='Hamr',
                  winter='Vintr', kin='Čin', queen='Kvin', fire='Fajr', high='Haj', rocket='Roket', bell='Bjel',
                  hearth='Hjart'),
 'riders': dict(long='Lǫ', red='Ered', black='Blak', white='Baat\'', cold='Kol', swift='Isbipt\'', salt='Solt\'',
                stone='Istǫ', sun='Są', star='Istar', gold='Gol', bone='Bǫ', iron='Aayą', claw='Tł\'aa', wing='Bį',
                three='Łii', night='Naat\'', horn='Khon', raptor='Araptar', spider='Ispaadar', tiger='Taagar',
                mammoth='Mamuł', quetzal='K\'etsaal', beast='Biist\'', crawler='Tł\'oolar', rain='Erę', hard='Khaad',
                green='Grį', deep='Diip', mother='Madar', fire='Paayar', moon='Mų', falls='Pǫls'),
 'dasri': dict(long='Lonj', red='Rid', black='Balak', white='Wāyṭ', cold='Kold', salt='Ṣolṭ', stone='Isṭōn', sun='Ṣan',
               star='Istār', gold='Jūld', bone='Bōn', sand='Ṣanḍ', thorn='Thorn', snake='Snāk', camel='Qamal',
               bitter='Biṭar', old='Ōld', ghost='Jōst', wind='Wind', jinn='Jinn', palm='Bālm', date='Dayt',
               fire='Fāyar', moon='Mūn', deep='Dīb', mother='Maḍar', green='Jrīn', thirst='Thirst', silver='Silfar',
               cold2='Frost'),
 'tabist': dict(salt='Aṣolṭ', stone='Astun', sun='Aṣan', star='Astar', gold='Aguld', bone='Abun', red='Arid',
                black='Ablak', white='Awayṭ', bitter='Abiṭar', ghost='Agost', fire='Afayar', moon='Amun',
                sand='Aṣanḍ', mother='Tamaḍart', deep='Adib', old='Awold', camel='Aqamal', thorn='Atorn', oil='Awayl'),
 'scyvoi': dict(long='Lon', red='Ret', black='Bılak', white='Vayt', cold='Holt', swift='Sivift', salt='Salt',
                stone='Suton', sun='San', star='Sıtar', gold='Golt', bone='Bon', reed='Rit', green='Girin', deep='Dip',
                bright='Bırayt', old='Olt', falls='Fols', mother='Madır', thorn='Sorn', snake='Sınek', wolf='Vulf',
                ash='Aş', fire='Fayır', moon='Mun', bitter='Bitir', burn='Borun', flame='Filem', smoke='Sumok',
                grass='Gıras', lizard='Lizirt', scythe='Sıkayt', kopje='Hopi', granite='Gıranıt', hawk='Hok', crow='Hurov',
                hunter='Hantır', blood='Bılat', storm='Sutorm', wind='Vin', three='Siri', seed='Sit', dry='Dıray',
                iron='Ayrın', sand='Sant', lost='Los', claw='Hılav', theropod='Seropot', shadow='Şadu', willow='Vilu',
                yellow='Yelu'),
 'screamer': dict(howling='Howling', shrieking='Shrieking', wailing='Wailing', screaming='Screaming',
                  gibbering='Gibbering', raving='Raving', skull='Skull', bone='Bonepile', gutter='Gutter',
                  cutthroat='Cutthroat', rawthroat='Rawthroat', blackmaw='Blackmaw', lastcry='Last Cry',
                  deadman="Dead Man's", gallows='Gallows', hush='Hush', silent='Silent', bleeding='Bleeding',
                  gnashing='Gnashing', snare='Snare', net="Netter's", lasso='Lasso', punji='Punji', taken="Taken Man's",
                  noreturn='No-Return', hollow='Hollow-Eye', grinding='Grinding', madwater="Madman's"),
 'zeijani': dict(fire='Pērum', ash='Ašum', sun='Ṣunum', stone='Ṣṭūnum', gold='Guldum', hidden='Ḫiddanum',
                 sky='Ṣqayum', black='Blaqqum', red='Reddum', smoke='Ṣmūkum', bone='Būnum', throne='Šrūnum',
                 deep='Dīppum', hot='Ḫuṭṭum', light='Lētum', dark='Dāqum'),
}
# more words for the tongues with many waters: beasts, birds, trees, weather, metals, the day and the year, people.
# English: hawk eagle raven owl fox bear boar deer frog eel willow pine fern moss honey milk rain cloud thunder wind
# silver copper glass sword shield crown drum song twin quiet weeping laughing morning evening summer winter giant
# witch hunter widow maiden broken lost
EXTRA_EN = ('hawk eagle raven owl fox bear boar deer frog eel willow pine fern moss honey milk rain cloud thunder wind '
            'silver copper glass sword shield crown drum song twin quiet weeping laughing morning evening summer winter '
            'giant witch hunter widow maiden broken lost').split()
EXTRA = {
 'izani': 'Aga Igal Rreivan Aul Fox Ber Bor Dir Froga Il Guilo Pain Fern Mos Oni Milga Rrein Klauda Tondar Guinda '
          'Silvar Kobar Glas Isorda Xilda Kraun Drom Soñ Tuin Qaieda Guibiñ Lafiñ Morniñ Ivniñ Somar Guindar Jaianda '
          'Guicha Ondar Guido Meiden Brogen Losta',
 'dalab': 'Aak Iigl Rebn Oul Fox Bea Boa Dia Frog Iil Wilo Pain Fen Mos Oni Mil Rein Klou Tunda Win Silba Kopa Glas '
          'Sood Shiil Kroun Drom Song Twin Kwaiet Wiipin Laafin Monin Iivnin Suma Winta Jaian Wich Unta Wido Meidn Brokn '
          'Los',
 'dasri': 'Ḥawk Ījal Rāfan Awl Foks Bayr Bōr Dīr Froj Īl Wilō Bāyn Fern Mōṣ Ḥanī Milk Rayn Klawḍ Thandar Wind Silfar '
          'Kobar Jlāṣ Ṣōrḍ Šīld Krawn Dram Ṣōnj Ṭwin Kwāyat Wībinj Lāfinj Mōrninj Īfninj Ṣamar Wintar Jāyant Wič Ḥantar '
          'Widō Maydan Brōkan Lōṣṭ',
 'vothic': 'Hok Ikl Revn Aul Voks Berh Borh Dirh Vrok Il Vilo Pain Vern Mos Hïni Milk Ren Klaut Thïndrh Vint Tzilvrh '
           'Koprh Glas Tzort Sil Kraun - Tzonk Tvin Kvait Vipink Lavink Morhnink Ivnink Tzïmrh Vintrh Shaint Vish '
           'Hïntrh Vido Metn Brokn Lost',
 'xanadui': 'Xāk Īgal Rewan Āul Phāks Bhear Bhōr Ḍhīr Phirog Īl Wilo Pāin Phern Mos Xani Milk Rẽ Kilāuḍ Thanḍā Wĩḍ '
            'Silwā Qopā Gilās Soḍ Śīlḍ Kirāũ Ḍiram Sõ Ṭuwĩ Quāyaṭ Wīpĩ Lāphĩ Morĩ Īwnĩ Samā Wĩṭā Jāyã Wic Xanṭā Wiḍo '
            'Meḍẽ Bhrokẽ Losṭ',
 'riders': 'Khak Iigal Erebę Aul Poks Beer Boor Diir Prog Iil Bilo Paą Pę Mos Khani Milk - Tł\'aud Łandar Bįd Silbar '
           'Kopar Glas Isord Siild Tł\'aų Drum - Tbį K\'aayat\' Biipį Laapį Mǫnį Iibnį Samar Bįtar Jaayąt\' Bich Khąter Bido '
           'Maadę Brokę Lost\'',
 'yuni': 'Hawko Eaglo Ravo Owlo Foxi Bearo Boaro Deero Froggo Eelo Willo Poini Ferno Mozzi Honni Milko Roini Cloudi '
         'Thunda Windi Silvo Coppo Glasso Swordo Shieldo Crowno Drummo Songo Twinno Quoiet Weepo Larfo Arvo Evo Summo '
         'Winto Gianto Witchi Hunto Widdo Maido Brokko Losti',
}
for _t, _w in EXTRA.items():
    for _en, _f in zip(EXTRA_EN, _w.split()):
        if _f != '-' and _en not in D_[_t]:
            D_[_t][_en] = _f
# the words for a river, a stream (under 50 m3/s) and a dry valley, and how a name is put together
W_ = {
 'vothic': ('Rivrh', 'Chhim', 'Drai'), 'izani': ('Rrivar', 'Istrim', 'Vali'), 'hykkousik': ('Rivar', 'Astrim', 'Gyli'),
 'xanadui': ('Riwā', 'Siṭrīm', 'Ḍrāi'), 'yuni': ('Rivvo', 'Krikki', 'Gulli'), 'dalab': ('riba', 'bruk', 'guli'),
 'republic': ('rivr', 'bek', 'gjel'), 'riders': ('Baatar', 'Baatar', 'Khol'), 'dasri': ('Rīfar', 'Rīfar', 'Wādī'),
 'tabist': ('Aribar', 'Aribar', 'Awadi'), 'zeijani': ('Ribarum', 'Ribarum', 'Gullum'),
 'scyvoi': ('Vatırı', 'Kiriki', 'Gulusu'), 'screamer': ('River', 'Creek', 'Gulch'),
}
EN_WORD = ('river', 'stream', 'dry valley')


def compose(t, desc, word, kind):
    """the name from a descriptor (the tongue's form) and the river word, in the tongue's order"""
    if t == 'izani':
        return '%s %s' % (word, desc)                  # Romance order: Rrivar Rreda
    if t in ('dalab', 'republic'):
        return desc + word                             # one word, as their places are: Tonbruk, Roketstad
    if t == 'dasri':
        return '%s al-%s' % (word, desc)               # Rīfar al-Ṣolṭ
    if t == 'tabist':
        return '%s n %s' % (word, desc)                # Aribar n Aṣolṭ
    if t == 'hykkousik':
        return 'Ve %s %s' % (desc, word)               # Ve Gould Rivar
    return '%s %s' % (desc, word)                      # Tzolt Rivrh, Sitār Riwā, Saltie Rivvo, Tł'aa Baatar


def compose_place(t, place, word):
    """a course named for the settlement it passes"""
    if t == 'izani':
        return '%s de %s' % (word, place)
    if t == 'xanadui':
        return '%s-bi %s' % (place, word)              # by-case: the river by the place
    if t in ('dalab', 'republic'):
        return place + ' ' + word.capitalize()
    if t == 'dasri':
        return '%s %s' % (word, place)
    if t == 'tabist':
        return '%s n %s' % (word, place)
    if t == 'hykkousik':
        return '%s %s' % (place, word)
    return '%s %s' % (place, word)


# Fixed river names the lore has settled ahead of the model: the river at Almua's mouth is 'Dip Rivrh', the Deep river
# (the owner, 2026-10-18; settlements/almua/PLAN.md). No course reaches Almua in 4.21; when one is drawn, give it this
# name rather than one from the pool.
# a settlement's name in the tongue, where the record gives one
# (English place names run through the same changes: Girder is gördar in Tl'aai on the record, Hook loses its h and
# takes -a with k voiced in Izani, Span loses s- before a stop in Dalab, Strongwall breaks s+t with a vowel in Xanadui)
PLACE = {'Shade': {'dasri': 'Šayd', 'tabist': 'Tašayt'}, 'Girder': {'riders': 'Gördar'}, 'Hook': {'izani': 'Uga'},
         'Span': {'dalab': 'Pan'}, 'Drum': {'vothic': 'Drïm', 'scyvoi': 'Durum'}, 'Torus': {'vothic': 'Tors'}, 'Wing': {'vothic': 'Vink'},
         'Longsong': {'xanadui': 'Lõsõ'}, 'Strongwall': {'xanadui': 'Siṭrõwāl'}, 'Cascade': {'republic': 'Kaskejt'},
         'Reed': {'dasri': 'Rīd'}, 'Verge': {'tabist': 'Aberj'}}
# the pool after the course's own traits, per tongue (each tongue's favourite things first)
POOL = {
 'vothic': ['sun', 'star', 'gold', 'blood', 'spear', 'skull', 'king', 'slave', 'bone', 'stone', 'tree', 'strong', 'true',
            'sky', 'thorn', 'snake', 'wolf', 'moon', 'iron', 'green', 'bright', 'old', 'clear', 'bitter', 'ash',
            'little', 'bend', 'sand', 'fire', 'deep', 'white'],
 'izani': ['rose', 'king', 'queen', 'emperor', 'jewel', 'gold', 'star', 'sun', 'wing', 'war', 'three', 'sky', 'wolf',
           'iron', 'bone', 'stone', 'thorn', 'snake', 'moon', 'green', 'bright', 'old', 'clear', 'bitter', 'ash',
           'little', 'bend', 'sand', 'fire', 'deep', 'white'],
 'hykkousik': ['high', 'fish', 'sea', 'three', 'gold', 'sun', 'star', 'moon', 'stone', 'iron', 'bone', 'green', 'old'],
 'xanadui': ['sacred', 'jade', 'dome', 'king', 'moon', 'ice', 'snow', 'sky', 'gold', 'sun', 'star', 'stone', 'bone',
             'iron', 'green', 'bright', 'old', 'clear', 'thin', 'bitter', 'fire', 'deep', 'white'],
 'yuni': ['servo', 'dingo', 'ghost', 'crook', 'rock', 'dust', 'sun', 'star', 'gold', 'bone', 'iron', 'snake',
          'green', 'bright', 'old', 'little', 'bend', 'sand', 'deep', 'white', 'stone'],
 'dalab': ['god', 'ranch', 'lizard', 'oak', 'corn', 'mud', 'sweet', 'crooked', 'sun', 'star', 'gold', 'bone', 'iron',
           'thorn', 'snake', 'moon', 'green', 'bright', 'old', 'clear', 'bitter', 'ash', 'little', 'fire', 'deep',
           'white', 'stone'],
 'republic': ['iron', 'hammer', 'rocket', 'wolf', 'winter', 'kin', 'queen', 'bell', 'hearth', 'high', 'fire', 'star',
              'sun', 'gold', 'bone', 'green', 'bright', 'old', 'deep', 'white', 'stone'],
 'riders': ['claw', 'wing', 'raptor', 'quetzal', 'tiger', 'spider', 'mammoth', 'crawler', 'beast', 'horn', 'three',
            'night', 'rain', 'hard', 'sun', 'star', 'moon', 'gold', 'bone', 'iron', 'stone', 'green', 'deep', 'fire',
            'white'],
 'dasri': ['camel', 'ghost', 'jinn', 'thirst', 'palm', 'date', 'wind', 'thorn', 'snake', 'silver', 'sand', 'sun', 'star',
           'moon', 'gold', 'bone', 'stone', 'fire', 'old', 'bitter', 'green', 'white', 'black'],
 'tabist': ['oil', 'ghost', 'camel', 'thorn', 'sand', 'sun', 'star', 'moon', 'gold', 'bone', 'stone', 'fire', 'old',
            'bitter', 'white', 'black'],
 'scyvoi': ['burn', 'flame', 'smoke', 'grass', 'lizard', 'scythe', 'kopje', 'granite', 'theropod', 'ash', 'fire',
            'seed', 'hawk', 'crow', 'claw', 'hunter', 'blood', 'storm', 'wind', 'three', 'shadow', 'willow', 'yellow',
            'sun', 'star', 'moon', 'gold', 'bone', 'stone', 'iron', 'wolf', 'snake', 'thorn', 'lost', 'old', 'deep',
            'white', 'black'],
 'screamer': ['howling', 'shrieking', 'wailing', 'screaming', 'skull', 'cutthroat', 'blackmaw', 'deadman', 'gibbering',
              'raving', 'bone', 'gutter', 'rawthroat', 'lastcry', 'gallows', 'hush', 'silent', 'bleeding', 'gnashing',
              'snare', 'net', 'lasso', 'punji', 'taken', 'noreturn', 'hollow', 'grinding', 'madwater'],
 'zeijani': ['hidden', 'throne', 'ash', 'smoke', 'light', 'dark', 'sun', 'stone', 'gold', 'sky', 'bone', 'hot', 'deep'],
}
EN = {'cold2': 'frost'}
for _t in EXTRA:
    POOL[_t] = POOL[_t] + [e for e in EXTRA_EN if e not in POOL[_t]]


def traits(r, clim, temp):
    """the descriptors the course's own data suggest, best first"""
    out = []
    drop = r['source_m'] - r['mouth_m']
    steep = drop / max(r['length_km'], 1)
    bed = r['bed_m']
    cataract = max([a - b for a, b in zip(bed[:-1], bed[1:])] + [0])
    to = r['to']
    if r.get('_mother'):
        out.append('mother')
    if 'basin_m' in to or (clim[-1][:1] in 'BX' and 'lake_m' in to):
        out.append('salt')
    if cataract > 500:
        out.append('falls')
    if temp[0] < 2:
        out += ['cold', 'cold2', 'white']
    if steep > 15:
        out.append('swift')
    if r['length_km'] >= 150:
        out.append('long')
    if 'lake_m' in to and clim[-1][:1] in 'ACD':
        out.append('reed')
    if clim[len(clim) // 2][:1] in 'BX':
        out += ['red', 'sand', 'bitter']
    if clim[len(clim) // 2][:1] == 'A':
        out += ['black', 'green']
    if r['source_m'] > 2500:
        out.append('stone')
    if r['q_mouth_m3s'] >= 300:
        out.append('deep')
    return out


def main():
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    page, rpath, out = sys.argv[1:4]
    lines, li, D = load(page)
    RL = json.load(open(rpath, encoding='utf8'))
    OW, OH = D['fullW'], D['fullH']
    masks = {}
    for nm in TONGUE:
        docs = [r for r in RL if r['name'].strip() == nm]
        if not docs:
            sys.exit('no region named %r' % nm)
        for r in docs:
            im = Image.new('L', (OW, OH), 0)
            ImageDraw.Draw(im).polygon([tuple(p) for p in r['points']], fill=1)
            masks[(nm, r['id'])] = np.array(im).astype(bool)
    CL = [c['code'] for c in D['climate']['classes']]
    cls = np.array(Image.open(io.BytesIO(base64.b64decode(D['c']))).convert('L'))
    tm = np.array(Image.open(io.BytesIO(base64.b64decode(D['tm']))).convert('L')).astype(int) - 90
    at = lambda a, p: a[min(OH - 1, int(round(p[1]))), min(OW - 1, int(round(p[0])))]
    rivers = D['rivers']
    # each course's tongue: the smallest TONGUE region holding half its course or more
    for r in rivers:
        best = None
        for nm, m in masks.items():
            share = sum(at(m, p) for p in r['px']) / len(r['px'])
            if share >= .5 and (best is None or m.sum() < best[1]):
                best = (nm, m.sum())
        r['_t'] = TONGUE[best[0][0]] if best else None
    used = {t: set() for t in W_}
    names = {t: set() for t in W_}
    # rivers by flow, then dry valleys by catchment; the largest river of each tongue is its 'mother'
    order = sorted([r for r in rivers if r['_t']], key=lambda r: (r['kind'] != 'river',
                   -(r['q_mouth_m3s'] if r['kind'] == 'river' else r['catchment_km2'])))
    seen_mother = set()
    report = []
    for r in order:
        t = r['_t']
        if r['kind'] == 'river' and t not in seen_mother:
            r['_mother'] = True
            seen_mother.add(t)
        k = 2 if r['kind'] == 'wadi' else (1 if r['q_mouth_m3s'] < 50 else 0)
        word = W_[t][k]
        name = gloss = None
        if r['name'] == 'Yuni river':
            name, gloss = 'Yuni river', 'the Yuni river (its name on the record)'
        elif t == 'xanadui' and r.get('_mother'):
            name, gloss = 'Ālph', "the Alph, Kubla Khan's sacred river: an Ancient name the Xanadui kept"
        elif t == 'dalab' and r.get('_mother'):
            name, gloss = 'Dariba', 'the river (da- the, riba river): the river of the Dalab country'
        elif t == 'yuni' and r.get('_mother'):
            name, gloss = 'the Bigga', 'the big one (Yuni clips the word, as it does Labbo and Deppo)'
        if name is None:
            for s in r.get('settlements', []):
                if s in used[t]:
                    continue
                place = PLACE.get(s, {}).get(t, s)
                name = compose_place(t, place, word)
                gloss = '%s %s' % (s, EN_WORD[k])
                used[t].add(s)
                break
        if name is None:
            clim = [CL[int(at(cls, p))] for p in r['px']]
            temp = [int(at(tm, p)) for p in r['px']]
            cand = (traits(r, clim, temp) if t != 'screamer' else []) + POOL[t]
            for d in cand:
                if d in D_[t] and d not in used[t]:
                    used[t].add(d)
                    name = compose(t, D_[t][d], word, r['kind'])
                    gloss = '%s %s' % (EN.get(d, d), EN_WORD[k])
                    if t == 'screamer':
                        gloss = "the caravans' name: the Screamers name nothing"
                    break
        if name is None:                                   # the tongue's words are spent: two join
            words = [d for d in POOL[t] + list(D_[t]) if d in D_[t]]
            for a in words:
                for b in words:
                    if a != b and (a, b) not in used[t]:
                        used[t].add((a, b))
                        name = compose(t, D_[t][a] + ('' if t in ('dalab', 'republic') else ' ') + D_[t][b], word, r['kind'])
                        gloss = '%s %s %s' % (EN.get(a, a), EN.get(b, b), EN_WORD[k])
                        break
                if name:
                    break
        assert name not in names[t], name
        names[t].add(name)
        report.append((t, r['id'], r['name'], name, gloss, r['kind'], r['q_mouth_m3s']))
        r['name'], r['tongue'], r['gloss'] = name, t, gloss
    byid = {r['id']: r for r in rivers}
    for r in rivers:
        for k_ in ('_t', '_mother'):
            r.pop(k_, None)
        if r['to'].get('river') in byid:
            r['to']['name'] = byid[r['to']['river']]['name']
    s = set_data(lines[li], 'rivers', rivers)
    lines[li] = s
    open(out, 'w', encoding='utf8').write('\n'.join(lines))
    stem = os.path.splitext(out)[0]
    with open(stem + '.names.md', 'w', encoding='utf-8', newline='\n') as f:
        f.write('# River names, scale model 4.21\n\nFrom `tools/scale-model/river_names.py`: the tongue, the name, what it '
                'grew from, and the mean flow at the mouth (m3/s; dry valleys have none to speak of).\n')
        for t in W_:
            rows = [x for x in report if x[0] == t]
            if not rows:
                continue
            f.write('\n## %s (%d)\n\n| id | name | from the English | kind | flow |\n|---|---|---|---|---|\n' % (t, len(rows)))
            for x in rows:
                f.write('| %s | %s | %s | %s | %s |\n' % (x[1], x[3], x[4], 'dry valley' if x[5] == 'wadi' else 'river',
                                                          '' if x[5] == 'wadi' else round(x[6])))
    print('named %d courses in %d tongues; %d keep their provisional names' % (
        len(report), len({x[0] for x in report}), len(rivers) - len(report)))
    for t in W_:
        rows = [x for x in report if x[0] == t]
        if rows:
            print('  %-10s %3d  e.g. %s' % (t, len(rows), '; '.join('%s (%s)' % (x[3], x[4]) for x in rows[:4])))


if __name__ == '__main__':
    main()
