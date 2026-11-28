#!/usr/bin/env python3
"""Jimjam — Sacred Solar Acropolis, Solstice Temple (jj_temple_sun), Six Moon Temples & Five (+1) Planetary Shrines.

Runs on settlements/voth/palace/blueprint.py using the shared Jimjam catalog keymap in settlements/jimjam/palace/palace_blueprint.py.
Exact geometric parity with settlements/jimjam/src/74-jj-sacred.js for jj_temple_sun (50 x 86 x 48 m, PH = 6 m, SH = 6 m,
archZ = +16 m, obsZ = -8.5 m, eye = +13.7 m) and exact sky azimuths from core/atmos/sky/89-atmos-e-skymodel.js at
px (745, 546), lat = -34.34 deg S, subGiantLon = 56.27 deg.

    python settlements/jimjam/temples/temples_blueprint.py
"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'voth', 'palace'))
sys.path.insert(0, os.path.join(HERE, '..', 'palace'))
import blueprint as B
from blueprint import R, box, C
import palace_blueprint as PB
from PIL import Image, ImageDraw

OUT = os.path.join(HERE, 'floors')


def temple_floors():
    FL = []

    # ================================================================ T0: Sacred Solar Acropolis Precinct (440 x 420 m)
    # Note: blueprint.py draws v > 0 UP! So u = +x (East right), v = -z (North UP)!
    FL.append(dict(
      id='T0_acropolis', tier=0, R=228, rect=(-230, 210, -210, 210), bar=50,
      title='Sheet T0: Sacred Solar Acropolis — Solstice Temple, Four Calendar Schools & The Raja\'s Eye (+514..518 m)',
      sub=('The walled 440 x 420 m western crown of Jimjam (centred near local (-720, -120)). West parapet: jj_temple_sun '
           '(rotated to Az 244.04 deg WSW) flanked by the twin +-50 deg Veil Elongation Pylons (Az 294.0 deg WNW lakeward, '
           'Az 194.0 deg SSW Cut-ward). Centre: the New Fire Brazier Court and Royal Astronomical Library (jj_library). '
           'East & North: cloisters of the Four Rival Calendar Schools (Eye, Hidden Hand, Outside, and shuttered Eighty-One) '
           'plus the +518 m Raja\'s Eye Observatory Pavilion on the NW bastion (the sole electric-chronograph room here).'),
      axisnote='u = +x (East RIGHT), v = -z (North UP); WSW Solstice ray leaves bottom-left at Az 244.04 deg, Giant ENE upper-right',
      outlines=[(-220, 200, -200, 200, 'brick-retained Acropolis terrace (+514 m)'),
                (-168, -96, 132, 190, 'Raja\'s Eye NW bastion (+518 m)')],
      lines=[
        ([(-100, -20), (-226, -81)], (215, 95, 0), 5, 'Day 350 Sunset Az 244.04 deg WSW'),
        ([(-185, 45), (-226, 63)], (135, 70, 170), 3, 'Veil +50 deg Az 294.0 deg WNW'),
        ([(-155, -105), (-178, -196)], (135, 70, 170), 3, 'Veil -50 deg Az 194.0 deg SSW'),
        ([(-140, 162), (195, 198)], (0, 115, 145), 4, 'Giant Sightline Az 70.5 deg ENE'),
      ],
      doors=[(200, 0), (0, 200), (0, -200)],
      rooms=[
        R(1, 'East Acropolis Processional Gate (from Sunray Plaza)', 'entrance', 186, 202, -16, 16, 4, 'banded-brick pishtaq; torch-runners burst out here at dusk on Day 350 carrying the New Fire'),
        R(2, 'Acropolis Guard & Sandals Porch', 'guard', 176, 200, 16, 42, 1, 'visitors leave leather shoes & weapons; Iron Republic minder barred past the outer court without royal writ'),
        R(3, 'Votive Oil & Saffron Lamp Stall Arcade', 'market', 176, 200, -42, -16, 2, 'pilgrims buy whorl-olive diyas and New-Fire tapers'),
        R(4, 'Court of the New Fire (Nyū Faiyar Maidan)', 'court', -45, 95, -55, 55, 4, 'great bronze mother-brazier relit from the Solstice Sanctuary on Day 350; all 8 districts relight hearths from it'),
        R(5, 'Great Solstice Temple of the Sun (jj_temple_sun — see Sheet T1)', 'solstice_sanctuary', -145, -55, -65, 25, 4, '50 x 86 m landmark rotated to Az 244.04 deg WSW; unobstructed foreground over the West Parapet'),
        C(6, 'Northern Veil +50 deg Elongation Pylon (Az 294.04 deg WNW)', 'astronomers', -185, 45, 8, 3, 'carved Vellai-kal alabaster & Cut-marble sighting cleft aiming across 370 km of open Great Trough Lake'),
        C(7, 'Southern Veil -50 deg Elongation Pylon (Az 194.04 deg SSW)', 'astronomers', -155, -105, 8, 3, 'aimed over Tamarai-aru & the +2.01 deg SSW Cut peaks; records Veil\'s perturbation drift'),
        R(8, 'Royal Astronomical Library & Ephemeris Hall (jj_library)', 'library', -25, 22, 85, 116, 4, '45.5 x 30.6 m gold-domed library; master Long-Count tables, Talian, Rian, Yonni & Dalabite star-charts'),
        R(9, 'School of the Eye (jj_school — Empirical Sighters)', 'school', 50, 120, 85, 155, 3, 'orthodox observational school; brass quadrants, meridian transits, controls daily gnomon bells'),
        R(10, 'School of the Hidden Hand (jj_school — Perturbation Reckoners)', 'school', 50, 120, -155, -85, 3, 'mathematical school modelling unseen gravitational tugs on Veil\'s +-50 deg excursions'),
        R(11, 'School of the Outside (jj_school — Rogue-Body Theorists)', 'school', -45, 25, -165, -95, 3, 'studies the Day Outside & trans-rim anomalies; hosts visiting Yonni, Rian & History-Monk scholars'),
        R(12, 'Shuttered Cloister of the Eighty-One (Suppressed Annex)', 'archive', -90, -45, 95, 140, 1, 'half-walled-up fourth college (81 x 421 = 34,101-day heresy); sealed with royal lead, watched at night'),
        R(13, 'Stepped Acropolis Lotus Cistern', 'pool', 110, 162, -45, 45, 3, 'ritual ablution tank before mounting the New Fire Court'),
        R(14, 'The Raja\'s Eye: Rotating Brass-and-Emerald Dome', 'observatory_dome', -154, -126, 148, 176, 4, '28 x 28 m NW bastion at +518 m; cast Ardent-bronze azimuth ring, Barada-Quay/Talian lens tube, clear to Giant, Companion & Solstice'),
        R(15, 'Raja\'s Eye Electric Chronograph & Micrometer Room', 'electric_chancery', -165, -126, 134, 148, 3, 'clean shielded electric circuit driving quartz transit drums & crosshair illumination'),
        R(16, 'Optical Grinding & Collimation Bench', 'lens_workshop', -126, -98, 142, 176, 2, 'emerald cabochon & soda-silica lens polishing for the Raja\'s Eye quest'),
        R(17, 'Day-Keepers\' Refectory & Pilgrim Disputation Porch', 'servants_hall', 125, 172, 85, 145, 2),
        R(18, 'Kauntavan Dormitory Courts', 'dormitory', 125, 172, -145, -85, 2),
      ]))

    # ================================================================ T1: Great Solstice Temple (jj_temple_sun, 50 x 86 x 48 m)
    # Exact match to src/74-jj-sacred.js! Let u = -z so the 19 m marble front flight (z = +40..+21) is on the LEFT (u = -40..-21),
    # the Solstice Arch (archZ = +16) is at u = -16, the reflecting channel (z = +8.6) at u = -8.6, the sanctuary flight (z = +4..-6)
    # at u = -4..+6, observer threshold (obsZ = -8.5) at u = +8.5, mandapa (z = -10..-23) at u = +10..+23, shikhara shrine
    # (z = -23..-35.8) at u = +23..+35.8, and platform rear (platZ0 = -42) at u = +42! v = +x (-25..+25).
    # We also draw the Long-Count Undercroft inset at v = -56..-30 on the same sheet so both levels of jj_temple_sun read together!
    FL.append(dict(
      id='T1_sun', tier=0, R=54, rect=(-46, 46, -60, 30), bar=10,
      title='Sheet T1: Great Solstice Temple of the Sun (jj_temple_sun, 50 x 86 x 48 m — Az 244.04 deg WSW)',
      sub=('Exact room & deck plan of src/74-jj-sacred.js (u = -z, WSW Solstice Arch on the left; inset below at v = -56..-32 '
           'shows the Long-Count Undercroft inside the PH = 6 m lower platform). On Day 350 at 18:51, the +3.00 deg setting '
           'sun shoots along -u through the r = 4.5 m Solstice Arch, mirrors in the axial water channel, crosses the +12 m '
           'threshold (eye +13.7 m at u = +8.5), and strikes the New-Fire Altar beneath the 8-tier shikhara.'),
      axisnote='u = -z (WSW Solstice Sunset at left u = -40; Shikhara Sanctuary at right u = +36); Undercroft inset below',
      outlines=[(-21, 42, -24, 24, 'lower platform PH = +6.0 m (48 x 63 m)'),
                (6, 38, -15, 15, 'sanctuary podium SH = +12.0 m (30 x 32 m)'),
                (-10, 38, -56, -32, 'Undercroft inset (inside PH = 0..+6 m)')],
      lines=[([(-44, 0), (33, 0)], (220, 100, 0), 4, 'Solstice Ray (Alt +3.00 deg)')],
      doors=[(-40, 0), (10, 0), (-10, -44)],
      dais=(30, 0, 2.2),
      rooms=[
        R(1, 'Lower Marble Processional Flight (38 steps, y = 0..+6 m)', 'stair', -40, -21, -8, 8, 4, 'stairW = 16 m, stairRun = 19 m; flanked at foot by spiral & fleur brick lamp-shafts'),
        R(2, 'Monumental Solstice Gate Arch (archZ = +16 m)', 'entrance', -18.25, -13.75, -10, 10, 4, '20 m wide x 21.5 m high above platform; 9 m round-headed opening (spring +12 m, r = 4.5 m), gold sun discs & onion finial'),
        R(3, 'Platform Forecourt & Circumambulatory Deck (y = +6.0 m)', 'court', -21, 42, -24, 24, 3, 'marble-balustraded deck around the sanctuary podium'),
        R(4, 'Axial Reflecting Water Channel', 'pool', -12.4, -4.8, -3.6, 3.6, 4, 'marble-curbed mirror pool (z = +8.6 m) flanked by 4 ogee/diamond lamp columns; doubles the solstice sun gleam'),
        R(5, 'Upper Sanctuary Flight (30 steps, y = +6..+12 m)', 'stair', -4, 6, -5, 5, 4, '10 x 10 m marble stair ascending to the +12.0 m sanctuary podium'),
        R(6, 'Solstice Observer Portico & Threshold (obsZ = -8.5 m)', 'vestibule', 6, 10, -10, 10, 4, '4 patterned columns; JJ_TEMPLE_OBS eye stands at (u = +8.5, v = 0, y = +13.7 m) for JJ.solsticeCheck()'),
        R(7, 'Gold-Domed Mandapa (Congregation Hall)', 'solstice_sanctuary', 10, 23, -11, 11, 4, '22 x 13 m hall under 8-porthole drum & r = 5.5 m ribbed gold dome; side portholes & whorl-olive lamp trees'),
        R(8, 'Inner Garbhagriha & Eternal New-Fire Hearth (8-Tier Shikhara)', 'solstice_sanctuary', 23, 35.8, -9, 9, 4, '18 x 12.8 m sanctum crowned by 8-tier stepped brick-and-marble shikhara (+48 m); concave gold solar mirror & New-Fire bowl'),
        C(9, 'Front Staged Gold Spire (NW, 4 stages)', 'beacon', -16.5, 19.5, 3.5, 3),
        C(10, 'Front Staged Gold Spire (SW, 4 stages)', 'beacon', -16.5, -19.5, 3.5, 3),
        C(11, 'Rear Staged Gold Spire (NE, 4 stages)', 'beacon', 37.5, 19.5, 3.5, 3),
        C(12, 'Rear Staged Gold Spire (SE, 4 stages)', 'beacon', 37.5, -19.5, 3.5, 3),
        # Inset: Platform Undercroft (y = 0..+6.0 m) drawn cleanly at v = -56..-32
        R(13, 'Undercroft: Vault of the Stone Long-Count Tables', 'archive', 6, 28, -50, -38, 3, 'carved basalt & Cut-marble 91-year Great-Round slabs inside the PH = 6 m podium; consulted by History Monks'),
        R(14, 'Undercroft: Sacred Whorl-Olive Oil & Saffron Treasury', 'store', -10, 6, -55, -45, 1, 'stores the pure cold-pressed oil for Day-350 New-Fire relays'),
        R(15, 'Undercroft: Torch-Runners\' Vestibule & Crypt Stair', 'vestibule', -10, 6, -45, -33, 2, 'grade postern under north platform cheek'),
        R(16, 'Undercroft: Priests\' Vigil Cells & Monsoon Cistern', 'cistern', 28, 38, -55, -33, 0),
      ]))

    # ================================================================ T2: Two-Faced Temple of the Week (Vikku-Kovil, 56 x 44 m)
    FL.append(dict(
      id='T2_week', tier=0, R=34, rect=(-32, 32, -26, 26), bar=10,
      title='Sheet T2: Two-Faced Temple of the Week (Vikku-Kovil, 56 x 44 x 32 m — Az 270 deg W / Az 70.5 deg ENE)',
      sub=('Themed for Iapetus-like Week (7.0 d, half blinding-white ice, half coal-black carbon): the west half (u < 0, '
           'facing Az 270 deg moonset over 227 km of lake) is clad in white Cut marble & Vellai-kal alabaster for oaths, '
           'marriages, and bright-half contracts; the east half (u > 0, angled to Az 70.5 deg Giant-rise) is vitrified '
           'black-clinker brick (brickDark) for debt-stays, mourning, and Double-Dark vigils. Seven Weekday Law-Chambers ring the nave.'),
      axisnote='u < 0 = West Bright Marble Face (Az 270 deg); u > 0 = East Dark Clinker Face (canting to Az 70.5 deg ENE)',
      doors=[(-28, 0), (28, 4)],
      dais=(0, 0, 2.4),
      rooms=[
        R(1, 'Bright-Half West Portico (Cut Marble & Alabaster, Az 270 deg)', 'entrance', -28, -20, -9, 9, 4, 'blinding white marble arcade framing equatorial moonset; open during Week\'s 3.5 bright days'),
        R(2, 'Hall of Bright Oaths & Contract Sealing', 'petition', -20, -4, -10, 10, 4, 'merchants, Serai factors & brides sign dated contracts beneath brass Week-phase balances'),
        R(3, 'Equinox & Albedo-Line Central Rotunda', 'moon_sanctuary', -4, 4, -10, 10, 4, 'floor split sharply along u = 0 in white marble vs black clinker; rotating half-silvered sphere overhead'),
        R(4, 'Hall of Dark Vigils, Forbearance & Penance', 'moon_sanctuary', 4, 20, -10, 10, 3, 'vitrified near-black clinker vaults; packed on Bad-Count days and all 24 hours of the Double Dark'),
        R(5, 'Dark-Half ENE Giant-Sighting Gate (Black Clinker, Az 70.5 deg)', 'entrance', 20, 28, -5, 13, 3, 'canted 19.5 deg north of East to frame Week crossing the Ringed Giant\'s face'),
        R(6, '1st Day Chamber (Van-Sande / Vigil Assessors)', 'office', -20, -11, 10, 20, 2),
        R(7, '2nd Day Chamber (Tu-Mande / Maritime & Barge Pleas)', 'office', -11, -2, 10, 20, 2, 'Hykkousoi & Palewharf charter disputes heard here'),
        R(8, '3rd Day Chamber (Land & Handu Boundary Pleas)', 'office', -2, 7, 10, 20, 2),
        R(9, '4th Day Chamber (Guild & Kiln Tallies)', 'office', 7, 18, 10, 20, 2),
        R(10, '5th Day Chamber (Caravan & Cut-Road Bonds)', 'office', -20, -8, -20, -10, 2),
        R(11, '6th Day Chamber (Dowries & Kinship Registers)', 'office', -8, 5, -20, -10, 2),
        R(12, '7th Day Chamber (Debt-Release & Sabbatical Rolls)', 'office', 5, 18, -20, -10, 2),
        R(13, 'Deed & Seal Strongroom', 'archive', 18, 28, -20, -8, 2),
        R(14, 'Priests\' Sacristy & Lamp Store', 'store', -28, -20, -20, -10, 1),
      ]))

    # ================================================================ T3: 13-Tier Temple of the Thirteen (Tartin-Metu, 64 x 84 m)
    FL.append(dict(
      id='T3_thirteen', tier=0, R=48, rect=(-44, 44, -36, 36), bar=10,
      title='Sheet T3: Thirteen-Tier Temple of the Thirteen (Tartin-Metu, 64 x 84 x 42 m — Az 90 deg E & Az 70.5 deg Pool)',
      sub=('Themed for Titan-like Thirteen (13.0 d orange haze & dark hydrocarbon seas, governing the 7 x 13 = 91-day Kauntu): '
           'an elongated 44 x 18 m polished black-clinker "Tar Sea" Mirror Pool on the east forecourt reflects Thirteen\'s '
           'orange rise (Az 90 deg) and the Giant\'s Double-Dark transit (Az 70.5 deg) before a 13-tier stepped brick pyramid '
           'and 13 Day-Station pilgrim chapels.'),
      axisnote='u < 0 = East Forecourt & Black Tar-Mirror Pool (Az 90 deg / 70.5 deg); u > 0 = 13-Tier Stepped Pyramid',
      doors=[(-42, 0), (0, 32), (0, -32)],
      dais=(22, 0, 3.0),
      rooms=[
        R(1, 'Eastern Moonrise Gopuram Gate (Az 90.0 deg E)', 'entrance', -42, -34, -8, 8, 4, 'frames Thirteen\'s orange-amber disc rising off the eastern monsoon hills'),
        R(2, 'The "Tar Sea" Black-Clinker Mirror Pool', 'pool', -32, 12, -9, 9, 4, '44 x 18 m shallow sheet of still water over jet-black vitrified brick; on Double Dark crowds watch the Giant\'s shadow-transits in the water'),
        R(3, 'North Seven-Plus-Six Station Cloister (Days 1 to 7)', 'kora' if 'kora' in B.EXTRA_PROGRAMS else 'gallery', -34, 10, 12, 22, 3, 'seven vaulted niches where Serai & provincial pilgrims stamp birth-day almanac slips'),
        R(4, 'South Six-Station Cloister (Days 8 to 13)', 'gallery', -34, 10, -22, -12, 3, 'six vaulted niches completing the 13-day Tartin round'),
        R(5, 'Almanac Blessing & Block-Seal Mandapa', 'almanac_press', 12, 20, -14, 14, 4, 'newly printed 91-day Kauntu almanacs are consecrated with saffron paste before sale'),
        R(6, '13-Tier Stepped Pyramid Sanctuary (Garbhagriha of the Count)', 'moon_sanctuary', 20, 40, -16, 16, 4, 'stepped ochre-and-red brick ziggurat rising 42 m in 13 courses; houses the bronze Master Wheel of 91 Teeth'),
        R(7, 'North Pilgrim Dharmashala Loggia', 'dormitory', -34, 8, 22, 32, 1, 'shelters arriving Serai pilgrim families'),
        R(8, 'South Pilgrim Kitchen & Free Rice Distribution Hall', 'kitchen', -34, 8, -32, -22, 1, 'feeds thousands on the Day Outside and Double-Dark eve'),
        R(9, 'Long-Count Concordance Scriptorium', 'scriptorium', 12, 40, 16, 30, 3, 'scribes cross-check 91-day Counts with the nearby Order of Historians Chapterhouse'),
        R(10, 'Saffron, Amber-Glass & Lamp-Oil Vault', 'store', 12, 40, -30, -16, 1),
      ]))

    # ================================================================ T4: Octagonal Temple of Companion (Tunai-Mandapam, 42 x 48 m)
    FL.append(dict(
      id='T4_companion', tier=0, R=30, rect=(-26, 26, -24, 24), bar=10,
      octagon=(-14, 14, -14, 14, 5.8),
      title='Sheet T4: Octagonal Dial-Temple of Companion (Tunai-Mandapam, 42 x 48 x 36 m — Fixed Az 353.3 deg N, Alt +56.1 deg)',
      sub=('Themed for Krator\'s L4 Trojan moon Companion (1.0 d phase cycle, hanging permanently at Az 353.3 deg N, Alt +56.1 deg): '
           'an octagonal yellow-and-red brick rotunda whose dome carries a marble-lined sighting tube fixed at Az 353.3 deg, '
           'Alt +56.1 deg, projecting Companion onto a 13-Sector Brass Birth-Hour Floor Dial beside the 13-Hour Bell Tower.'),
      axisnote='u -> North-by-West fixed Companion azimuth (Az 353.3 deg); v across',
      doors=[(-24, 0), (0, -22)],
      rooms=[
        R(1, 'South Processional Porch & Notary Steps', 'entrance', -24, -14, -7, 7, 3),
        R(2, 'Octagonal Rotunda & 13-Sector Brass Floor Dial', 'dial_rotunda', -14, 14, -14, 14, 4, '28 m octagon; angled dome oculus (Az 353.3 deg N, Alt +56.1 deg) frames Companion 24/7; 13 x 110.8-min hour wedges'),
        C(3, 'Fixed Companion Oculus Projection Plinth', 'astronomers', 2, 0, 3.2, 4, 'polished black-marble mirror basin directly on the 56.1 deg north ray so priests read Companion\'s phase without neck-strain'),
        R(4, '13-Hour Water-Escapement Bell Tower (36 m)', 'beacon', 6, 18, 14, 22, 3, 'clepsydra-regulated bronze gong-wheel striking all 13 Jamtokku daily hours across the city'),
        R(5, 'Birth-Hour & Horoscope Registry', 'office', -14, 6, 14, 22, 3, 'records every citizen\'s birth Companion-hour alongside Week & Thirteen'),
        R(6, 'Inspected Reception Porch for Eternian Quota-Cohorts', 'antechamber', -14, 14, -22, -14, 2, 'Six-Ministries wardens log their numbered Palewharf pilgrim cohorts against the state clock'),
        R(7, 'Standard Weights, Cubit Rods & Gnomon Assay Room', 'weighing', 14, 24, -14, 14, 2, 'calibrates market balances and brass pocket dials'),
      ]))

    # ================================================================ T5: Pendulum Fan-Temple of Day (Pakal-Vasal, 58 x 52 m)
    FL.append(dict(
      id='T5_day', tier=0, R=34, rect=(-30, 30, -28, 28), bar=10,
      title='Sheet T5: Pendulum Fan-Temple of Day (Pakal-Vasal, 58 x 52 x 29 m — Az 88.3 deg E <-> Az 27.0 deg NNE Arc)',
      sub=('Themed for volcanic 12-hour moon Day (which rises in the East at Az 88.3 deg, transits the Giant at Az 70.5 deg, '
           'reaches northern turnaround at Az 27.0 deg NNE / Alt +52.1 deg, and sets back in the East without ever crossing '
           'west!): a 61.3-degree radial fan-court sighting between Twin Turnaround Brazier Pylons and a central Giant-Transit Arch.'),
      axisnote='u -> Az 70.5 deg ENE (Giant centre); v > 0 spreads toward Az 27.0 deg NNE turnaround, v < 0 toward Az 88.3 deg E rise/set',
      lines=[
        ([(-12, 0), (26, 22)], (210, 70, 20), 4, 'NNE Turnaround Az 27.0 deg (Alt +52.1 deg)'),
        ([(-12, 0), (28, 0)], (0, 115, 145), 4, 'Daily Giant Transit Az 70.5 deg'),
        ([(-12, 0), (26, -15)], (210, 70, 20), 4, 'East Rise & Set Az 88.3 deg'),
      ],
      doors=[(-28, 0)],
      rooms=[
        R(1, 'West Kiln-Guild Gate & Clinker Porch', 'entrance', -28, -20, -8, 8, 3, 'vitrified dark-header brick portal opening onto Day District\'s kiln avenues'),
        R(2, 'Sanctuary of the Sacred Kiln-Hearth (Tudor Chimney Dome)', 'moon_sanctuary', -20, -6, -11, 11, 4, 'crowned by a 7-flue ornamental brick chimney; fire damped to cold ash on every 91st-day Double Dark!'),
        R(3, '61.3-Degree Radial Pendulum Sighting Court', 'court', -6, 20, -18, 20, 3, 'inlaid radial brick arcs tracking Day\'s 12 h东-only swing across and behind the Giant'),
        C(4, 'NNE Turnaround Brazier Pylon (Az 27.0 deg, 29 m)', 'beacon', 22, 20, 4.0, 3, 'flares when Day halts at its northernmost turnaround point'),
        C(5, 'East Rise/Set Brazier Pylon (Az 88.3 deg, 29 m)', 'beacon', 22, -16, 4.0, 3, 'marks Day\'s eastern horizon rise and set'),
        R(6, 'Central Giant-Transit Sighting Arch (Az 70.5 deg)', 'pavilion', 20, 27, -6, 6, 4, 'frames Day crossing the Giant\'s 30-degree disc; bell rings the "kiln-blessed hour" for lens & tile pours'),
        R(7, 'Live-Coal & Optical Crucible Blessing Gallery', 'workshop', -26, -6, 11, 24, 2, 'master potters, brickmakers & Raja\'s Eye glassblowers fetch blessed coals in brass censers'),
        R(8, 'Fire-Priests\' Watch & Husk-Briquette Store', 'store', -26, -6, -24, -11, 1),
      ]))

    # ================================================================ T6: Alabaster Occultation-Temple of Two-Day (Marai-Kovil, 48 x 54 m)
    FL.append(dict(
      id='T6_twoday', tier=0, R=32, rect=(-28, 28, -26, 26), bar=10,
      title='Sheet T6: Alabaster Occultation-Temple of Two-Day (Marai-Kovil, 48 x 54 x 24 m — Az 70.5 deg +-15 deg Limbs)',
      sub=('Themed for Two-Day\'s 48-hour cycle and regular occultation behind the Giant: a sunken, hushed Vellai-kal '
           'alabaster-jali court with twin narrow limb-slits framing ingress (Az 55.5 deg) and egress (Az 85.5 deg). '
           'Strict dual-path threshold: public petitioners walk the outer ambulatory into 8 Whispering Booths; coin-veiled '
           'Ruby Dream-Sibyls enter ONLY from the sealed inner cloister behind the jali wall.'),
      axisnote='u -> Az 70.5 deg ENE (Giant occultation disc); Outer Petitioner Ring vs Sealed Inner Sibyl Cloister',
      lines=[
        ([(-6, 0), (26, 8)], (90, 70, 150), 3, 'Giant N Limb Az 55.5 deg'),
        ([(-6, 0), (26, -8)], (90, 70, 150), 3, 'Giant S Limb Az 85.5 deg'),
      ],
      doors=[(-26, 0), (14, 24)],
      rooms=[
        R(1, 'Public Whispering Gate & Silence Vestibule', 'entrance', -26, -18, -7, 7, 3, 'street noise baffled by double curtained brick turns'),
        R(2, 'Outer Petitioner Ambulatory (North)', 'passage', -18, 12, 16, 22, 2, 'petitioners queue quietly in dim whorl-olive lantern light during Two-Day\'s occultation hours'),
        R(3, 'Outer Petitioner Ambulatory (South)', 'passage', -18, 12, -22, -16, 2),
        R(4, 'North Row: 4 Public Petitioner Dream-Booths (Alabaster Jali)', 'dream_oracle', -14, 10, 11, 16, 3, 'petitioner kneels on south face of pierced alabaster screen; never sees the Sibyl'),
        R(5, 'South Row: 4 Public Petitioner Dream-Booths (Alabaster Jali)', 'dream_oracle', -14, 10, -16, -11, 3),
        R(6, 'North Sibyls\' Listening Gallery (Sealed Inner Path)', 'dream_oracle', -14, 10, 6, 11, 4, 'reached ONLY from the Sibyls\' Cloister Door (u = +14, v = +24); coin-veiled Ruby Sibyls interpret dreams'),
        R(7, 'South Sibyls\' Listening Gallery (Sealed Inner Path)', 'dream_oracle', -14, 10, -11, -6, 4),
        R(8, 'Sunken Occultation Pool & Veiled Sanctuary', 'pool', -14, 12, -6, 6, 4, 'dark slate-domed pavilion open ENE toward the twin Giant-limb slits'),
        R(9, 'ENE Giant-Limb Occultation Slit Wall (Az 55.5 deg & Az 85.5 deg)', 'astronomers', 12, 24, -12, 12, 4, 'two razor-edged white-marble slits mark the exact minute Two-Day vanishes behind and emerges from the Giant'),
        R(10, 'Sibyls\' Private Cloister, Dream-Archive & Postern', 'scriptorium', 12, 24, 12, 24, 3, 'sealed inner entry & crimson dream-ledger archive'),
        R(11, 'Sanctuary of the Two-Day "Hidden Children"', 'dormitory', 12, 24, -24, -12, 2, 'trains orphans born under Two-Day\'s occultation as archival clerks & Sibyl novices'),
      ]))

    # ================================================================ T7: Four-Basin Lotus-Tank Temple of Four-Day (Nalu-Kulam, 96 x 96 m)
    FL.append(dict(
      id='T7_fourday', tier=0, R=54, rect=(-50, 50, -50, 50), bar=10,
      title='Sheet T7: Four-Basin Lotus-Tank Temple of Four-Day (Nalu-Kulam, 96 x 96 x 28 m — Az 0.0 deg N Meridian)',
      sub=('Themed for Four-Day\'s ~4.04-day synodic quarters (culminating due North at Az 0.0 deg, Alt +55.66 deg): '
           'a cruciform island sanctuary set inside a 96 x 96 m stepped red-brick lotus tank (kulam) quartered by four '
           'causeways into Four Humoral Bath Basins. Hykkousoi mariners flock here to bathe their rib-gills in 1.51 atm air.'),
      axisnote='North (Az 0.0 deg culmination) is RIGHT (+u); East is DOWN (-v) / West UP (+v)',
      doors=[(-48, 0), (48, 0), (0, 48), (0, -48)],
      rooms=[
        R(1, 'Cruciform Island Sanctuary of the Four Tempers', 'moon_sanctuary', -12, 12, -12, 12, 4, '24 x 24 m marble-trimmed shrine under 4 colour-glazed corner chhatris & central gold dome; North meridian slit at +u'),
        R(2, 'North Meridian Causeway & Culmination Gnomon (Az 0.0 deg)', 'passage', 12, 46, -4, 4, 3, 'tracks Four-Day\'s +55.66 deg meridian transit'),
        R(3, 'South Processional Causeway', 'passage', -46, -12, -4, 4, 3),
        R(4, 'West Causeway', 'passage', -4, 4, 12, 46, 3),
        R(5, 'East Monsoon-Canal Inlet Causeway & Sluice', 'passage', -4, 4, -46, -12, 3, 'fed by 41t eastern bench canal'),
        R(6, 'NW Stepped Lotus Basin I: New Moon / Phlegmatic', 'pool', 4, 38, 4, 38, 3, 'cool lotus-shaded water; Hykkousoi rib-gill immersion ghats'),
        R(7, 'NE Stepped Lotus Basin II: Waxing / Sanguine', 'pool', 4, 38, -38, -4, 3, 'warm sun-facing brick steps; wineweed tonic immersions'),
        R(8, 'SE Stepped Lotus Basin III: Full Moon / Choleric', 'pool', -38, -4, -38, -4, 3, 'saffron & citron-blossom lustral basin'),
        R(9, 'SW Stepped Lotus Basin IV: Waning / Melancholic', 'pool', -38, -4, 4, 38, 3, 'shaded indigo-stone fasting & contemplation steps'),
        R(10, 'NW Humoral Bath & Steam Porch (Bleaching & Vapour)', 'humoral_bath', 38, 48, 12, 48, 2),
        R(11, 'NE Humoral Physic & Blood-Tonic Dispensary', 'humoral_bath', 38, 48, -48, -12, 2),
        R(12, 'SE Saffron & Spice-Physic Hall', 'humoral_bath', -48, -38, -48, -12, 2),
        R(13, 'SW Indigo & Melancholic Apothecary', 'humoral_bath', -48, -38, 12, 48, 2),
      ]))

    # ================================================================ T8: Composite Sheet — Five Planetary Shrines + Uncounted Wanderer
    FL.append(dict(
      id='T8_planets', tier=0, R=58, rect=(-54, 54, -38, 38), bar=10,
      title='Sheet T8: The Five Intramural Planetary Shrines & The Uncounted Wanderer Circle (Comparative Scale)',
      sub=('All six minor celestial shrines of Jimjam drawn at 1:1 comparative scale on one sheet: (1–2) Chapel of Veil '
           '(24 x 20 m, +-50 deg dusk/dawn porches); (3–4) Royal Shrine of Crown (22 x 22 m, 434 d Concordance); (5–6) Twin-Dome '
           'Shrine of Rust & Cinder (26 x 18 m, 14 d binary eyesight trial); (7) Twilight Cell of Ash (16 x 16 m clinker); '
           '(8–9) Long-Reckoner Pavilion of Frost (20 x 20 m, 29 yr cycle); (10) Unroofed Stone Circle of the Wanderer (24 x 24 m).'),
      axisnote='Comparative composite sheet (each shrine sits in its own district per site/jimjam-site.json); scale bar = 10 m',
      outlines=[
        (-50, -24, 12, 34, '1. Chapel of Veil (Week District)'),
        (-12, 12, 12, 36, '2. Royal Shrine of Crown (Sun District)'),
        (22, 50, 14, 34, '3. Twin Shrine of Rust & Cinder (Day District)'),
        (-48, -30, -32, -14, '4. Cell of Ash (Day District)'),
        (-12, 10, -34, -12, '5. Pavilion of Frost (Thirteen District)'),
        (22, 48, -34, -8, '6. Uncounted Wanderer Circle (Izani Enclave)'),
      ],
      rooms=[
        # 1. Veil (24 x 20 m)
        R(1, 'Chapel of Veil: Central Alabaster Sanctuary', 'moon_sanctuary', -44, -30, 14, 32, 4, 'carved Vellai-kal alabaster panels; guild of Cut-marble importers & evening musicians'),
        R(2, 'Veil Twin +-50 deg Sighting Porches (Az 294 deg & Az 194 deg)', 'pavilion', -50, -44, 14, 32, 3, 'canted dusk & dawn loggias sighting Veil\'s northern lake & southern mountain extremes'),
        # 2. Crown (22 x 22 m)
        R(3, 'Royal Shrine of Crown: Gold-Domed Octagon', 'moon_sanctuary', -11, 11, 13, 35, 4, 'yellow brick & gold onion dome; flares during 434-day Crown oppositions (Days of Concordance)'),
        # 3. Rust & Cinder (26 x 18 m)
        R(4, 'Rust Dome (4.2 m Terracotta) & Forge Altar', 'moon_sanctuary', 23, 36, 15, 33, 3, 'larger red-terracotta dome for Rust; Ardent bronze & bog-iron smiths\' vows'),
        R(5, 'Cinder Dome (2.4 m Clinker) & 14-Day Binary Slit', 'astronomers', 36, 49, 15, 33, 3, 'smaller dark-clinker dome; archer recruits test naked-eye resolution of Cinder\'s 14-day elongation'),
        # 4. Ash (16 x 16 m)
        R(6, 'Twilight Cell of Ash (Windowless Clinker Cube)', 'moon_sanctuary', -47, -31, -31, -15, 2, 'vitrified brickDark walls; single razor slit at Az 270 deg W catching fleeting inner-planet Ash'),
        # 5. Frost (20 x 20 m)
        R(7, 'Pavilion of Frost: Verdigris & Slate Ephemeris Hall', 'astronomers', -11, 9, -33, -13, 3, 'cool turquoise tile & slate dome; 29-year outer-planet perturbation tables studied by Yonni/Rian/Yuni guests'),
        # 6. Wanderer (24 x 24 m unroofed)
        C(8, 'Uncounted Circle of the Wanderer (13 Unmortared Stones)', 'court', 35, -21, 11.5, 1, 'intentionally UNROOFED, zero Count wheel; Outside-School & Day-Outside assemblies beside the ruined Izani Palace'),
      ]))

    return FL


def draw_solstice_section():
    """Exact optical & architectural section of src/74-jj-sacred.js (jj_temple_sun)."""
    f_t = B.font(38, True); f = B.font(20); fs = B.font(16); fb = B.font(18, True)
    W, H = 2400, 1260
    img = Image.new('RGB', (W, H), (255, 255, 255))
    dr = ImageDraw.Draw(img)
    dr.text((30, 18), "Longitudinal Section along Solstice Axis u = -z: Great Temple of the Sun (src/74-jj-sacred.js)", font=f_t, fill=(20, 20, 20))
    dr.text((30, 68), "True 1:1 vertical-to-horizontal optical check (sx = sy = 20 px/m): Day 350 Sunset Ray at Alt +3.00 deg (Az 244.04 deg WSW) passes cleanly through the Solstice Arch!", font=f, fill=(70, 70, 70))

    sx = 20.0; sy = 20.0; ox = 1120.0; base = H - 150.0
    def X(u): return ox + u * sx
    def Y(h): return base - h * sy

    # Acropolis pad (+514.0 m ASL)
    dr.rectangle([0, Y(0), W, H], fill=(238, 232, 220))
    dr.line([(0, Y(0)), (W, Y(0))], fill=(110, 90, 70), width=3)
    dr.text((30, Y(0) + 10), "Acropolis West Terrace Pad (+514.0 m ASL, y = 0 m; WSW 4.5 km headland horizon is +0.89 deg)", font=fs, fill=(80, 65, 50))

    # Lower stair (u = -40..-21, y = 0..6) & Lower Platform PH = 6 m (u = -21..+42) with Long-Count Undercroft
    dr.polygon([(X(-40), Y(0)), (X(-21), Y(6)), (X(-21), Y(0))], fill=(185, 185, 185), outline=(40, 40, 40), width=2)
    dr.rectangle([X(-21), Y(6), X(42), Y(0)], fill=(224, 220, 212), outline=(30, 30, 30), width=2)
    dr.rectangle([X(6), Y(5.2), X(28), Y(0.6)], fill=(204, 212, 222), outline=(60, 60, 60), width=2)
    dr.text((X(7), Y(3.6)), "Long-Count Stone-Table Undercroft", font=fs, fill=(30, 40, 60))

    # Monumental Solstice Gate Arch at archZ = +16 => u = -16 (depth 4.5 m -> u = -18.25..-13.75, y = 6..27.5, opening y = 6..22.5!)
    dr.rectangle([X(-18.25), Y(27.5), X(-13.75), Y(6)], fill=(204, 102, 74), outline=(30, 30, 30), width=2)
    dr.rectangle([X(-18.25), Y(22.5), X(-13.75), Y(6)], fill=(246, 248, 252), outline=(180, 140, 60), width=2)
    dr.text((X(-24), Y(30.2)), "Solstice Arch (y = +6..+27.5 m;\naperture crown at y = +22.5 m)", font=fs, fill=(120, 45, 20))

    # Reflecting water channel (u = -12.4..-4.8, y = 6..6.5) & Upper Sanctuary Flight (u = -4..+6, y = 6..12)
    dr.rectangle([X(-12.4), Y(6.5), X(-4.8), Y(6.0)], fill=(150, 208, 240), outline=(40, 90, 130))
    dr.polygon([(X(-4), Y(6)), (X(6), Y(12)), (X(6), Y(6))], fill=(185, 185, 185), outline=(40, 40, 40), width=2)

    # Sanctuary Podium SH = 6 m (u = 6..38, y = 6..12)
    dr.rectangle([X(6), Y(12), X(38), Y(6)], fill=(214, 178, 118), outline=(30, 30, 30), width=2)
    dr.text((X(8), Y(9.6)), "Sanctuary Podium (SY = +12.0 m)", font=fs, fill=(50, 35, 15))

    # Mandapa (u = 10..23, y = 12..21.3) + Drum & Gold Ribbed Dome (y = 21.3..30.7)
    dr.rectangle([X(10), Y(21.3), X(23), Y(12)], fill=(238, 220, 150), outline=(30, 30, 30), width=2)
    dr.rectangle([X(11), Y(25.2), X(22), Y(21.3)], fill=(208, 112, 82), outline=(30, 30, 30), width=2)
    dr.pieslice([X(11), Y(25.2 + 5.5), X(22), Y(25.2 - 5.5)], 180, 360, fill=(238, 192, 58), outline=(30, 30, 30), width=2)
    dr.text((X(10.8), Y(17.5)), "Mandapa", font=fb, fill=(90, 50, 0))

    # 8-Tier Shikhara Shrine (u = 23..35.8, y = 12..21.3 walls + 8 tiers to y = 48.0 m)
    dr.rectangle([X(23), Y(21.3), X(35.8), Y(12)], fill=(232, 204, 132), outline=(30, 30, 30), width=2)
    yy = 21.3
    for i in range(8):
        f_w = 1.0 - i / 9.6
        hw = 5.2 * f_w
        th = 3.15 - i * 0.14
        dr.rectangle([X(29.4 - hw), Y(yy + th), X(29.4 + hw), Y(yy)],
                     fill=(218, 176, 92) if i % 2 else (204, 102, 74), outline=(30, 30, 30), width=1)
        yy += th
    dr.line([(X(29.4), Y(yy)), (X(29.4), Y(48.0))], fill=(210, 160, 20), width=4)
    dr.text((X(31.2), Y(47.5)), "8-Tier Shikhara Kalasha (+48.0 m)", font=fb, fill=(130, 85, 0))

    # Observer eye at u = +8.5, y = +13.7 m & True +3.00 deg Solstice Sunset Ray!
    eye_u, eye_y = 8.5, 13.7
    tan3 = math.tan(math.radians(3.0))
    # Ray goes toward -u (WSW sunset, rising +tan(3 deg) per metre toward -u): y(u) = 13.7 + (8.5 - u) * tan(3 deg)
    u_far = -52.0
    y_far = eye_y + (eye_u - u_far) * tan3
    y_arch = eye_y + (eye_u - (-16.0)) * tan3  # 13.7 + 24.5 * 0.0524 = 14.98 m (right in the middle of the 6..22.5 m arch!)
    dr.line([(X(u_far), Y(y_far)), (X(eye_u), Y(eye_y)), (X(29.4), Y(13.0))], fill=(235, 110, 0), width=4)
    dr.ellipse([X(eye_u) - 6, Y(eye_y) - 6, X(eye_u) + 6, Y(eye_y) + 6], fill=(220, 40, 20), outline=(0, 0, 0), width=2)
    dr.text((X(u_far) + 6, Y(y_far) - 24), "Day 350 Sunset Ray (Az 244.04 deg WSW, Alt +3.00 deg -> crosses arch at y = +15.0 m!)", font=fb, fill=(205, 85, 0))
    dr.text((X(eye_u) - 20, Y(eye_y) + 10), "Observer Eye (+13.7 m)", font=fs, fill=(180, 20, 20))

    return img


def main():
    PB.apply_jj_catalog()
    FL = temple_floors()
    intro = (
      'Generated by `settlements/jimjam/temples/temples_blueprint.py` (on `settlements/voth/palace/blueprint.py` '
      'and `settlements/jimjam/palace/palace_blueprint.py`). Covers the Sacred Solar Acropolis (`T0`), the Great '
      'Solstice Temple `jj_temple_sun` (`T1`, matching `src/74-jj-sacred.js`), all six astrologically aligned Moon '
      'Temples (`T2`–`T7`), and the five (+1) intramural Planetary Shrines (`T8`). Every temple uses traditional '
      '`whorl-olive` oil lamps and braziers extinguished on the 91-day *Double Dark*; clean electric circuits '
      'appear solely in the *Raja\'s Eye* Observatory (`T0 #14–15`).\n'
    )
    fm = os.path.join(HERE, 'FURNITURE.md')
    B.main(floors=FL, out=OUT, here=HERE,
           title='# The Temples & Observatories of Jimjam: Furniture Manifest\n',
           intro=intro, section=draw_solstice_section, zone_R=228)
    with open(fm, encoding='utf-8') as fh:
        lines = fh.read().split('\n')
    with open(fm, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(l for l in lines if not (l.startswith('- `') and l.endswith('(x0)'))) + '\n')


if __name__ == '__main__':
    main()
