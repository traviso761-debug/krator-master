/* ================================================================= THE FLASHING EYE: the Order's head house on the east volcano, as data  [G data]
   settlements/flashing-eye/PLAN.md sections 2 and 3. The owner, 2026-11-16: the east volcano of Erewhon's lake, a cliffside house
   on the cone facing the Rift; the cone gets a vent that flashes (Strombolian, red at night); the cliff band is authored on the
   page; about 320 people; the Eye keeps the council's mirror line by day and is the relay between the Beacon and the capital,
   which reaches it through the Beacon's Rim Post. Everything else is *proposed*.

   Frame: u runs SOUTH along the spur (the crater and the cap on the left of a sheet, the bench, the band and the Rift on the
   right), v EAST (up a sheet), y up from the bench (1,660 m: the spur's crest flattened, section 3.4). Metres. The origin is the
   middle of the Lip, the top edge of the cliff band, at scale-model px 881,1527.1 (200 m south of the bench's grid point
   881,1527). A box is [u0, u1, v0, v1]; a way's point is [u, v, y].
   No THREE, no DOM: read by layout_dump.js (the sheets), test-flashing-eye.js (the rules, 31-fe-rules.js) and the page. */
const FE_LAYOUT = (function () {
  'use strict';
  const frame = {
    px: [881, 1527.1], ground: 1660, uBearing: 180, vBearing: 90, kmPerPx: 2,
    note: 'the Lip: 200 m south of the bench\'s grid point 881,1527 (1,669 m on the model), where the spur breaks from the cap (84 m a km) to the flank (196 m a km). The bench is flattened to 1,660 m (section 3.4)'
  };

  /* the crater: the vent the owner gave the cone (question 3: it flashes). Not yet on the scale model (step F0): the page draws it.
     Centred on the summit's cell, 881,1526: 2.2 km north of the Lip */
  const crater = {
    centre: [-2200, 0], r: 300, depth: 150, rimY: 160, rimH: 20, vent: [-2200, 0], ventR: 18,
    burst: { kind: 'strombolian', every: [600, 1200], flash: 8, note: 'a small burst every 10-20 minutes, red on the plume at night, a puff of ash by day (Stromboli\'s rhythm)' },
    note: '*proposed* 600 m across and 150 m deep (question 3\'s numbers); the rim is the cone\'s, raised by a spatter rampart, the floor lowered'
  };

  /* the cliff band: the front of the cone's last lava flow (a coulee of columnar basalt), authored on the page. The Lip is the
     band's top edge: u = lipK v^2 (it curves back at its ends, so the face turns from about 163 to 197 degrees); the face falls
     `h` m with a batter of `batter` m; a talus leans on its foot; the apron eases back into the model's flank between `merge` m out
     from the Lip (fixed 2026-11-23: the cut ran on down the spur's sides to the Foot House). Its height tapers to nothing over
     the last `taper` m of each end */
  const band = {
    halfLen: 750, lipK: 0.0002, h: 200, batter: 30, talusH: 45, talusRun: 70, apronGrade: 0.04, taper: 160, merge: [600, 1200],
    face: [163, 197], stone: 'rock.columnar',
    note: 'the owner\'s 100-300 m; 200 m recommended (question 4). Section 3.4: the band takes the model\'s 196 m a km of fall in one face'
  };
  const lipU = v => -band.lipK * v * v;

  /* zones: the ground the walls and the band part; a polygon is [[u, v], ...]. The crater is a circle (crater.r) */
  const PRE = { u0: -145, u1: -1, v0: -90, v1: 90 };
  const zones = {
    bench: [[PRE.u0, PRE.v0], [2, PRE.v0], [2, PRE.v1], [PRE.u0, PRE.v1]],   /* to the Lip's face: the Lip Range stands on it */
    cap: [[-1850, -900], [-2, -900], [-2, -92], [-147, -92], [-147, 92], [-2, 92], [-2, 900], [-1850, 900]],
    rim: [[-1965, -260], [-1850, -260], [-1850, 260], [-1965, 260]],
    band: [[-2, -760], [60, -760], [60, 760], [-2, 760]],
    apron: [[60, -1000], [1200, -1000], [1200, 1000], [60, 1000]],
    spur: [[1200, -800], [6300, -800], [6300, 800], [1200, 800]],
    foot: [[6300, -400], [6600, -400], [6600, 400], [6300, 400]]
  };

  /* the terraces (the owner, 2026-11-23: the complex climbs as in the references): the precinct steps up the slope behind the Lip
     in three levels, south to north; y over the bench's 1,660 m. Each building stands on one terrace; a stair on the axis joins them */
  const terraces = [
    { id: 'lower', u0: -46, u1: 0, y: 0, note: 'the Lip terrace: the Lip Range, its towers, the courts' },
    { id: 'middle', u0: -114, u1: -46, y: 4, note: 'the Red Monastery and the ranges round it' },
    { id: 'upper', u0: -150, u1: -114, y: 9, note: 'the Ember Tower, the granary, the infirmary, the Mirror School' }];

  /* the Way of Shrines (the owner, 2026-11-23: "a sequence of rope bridges to reach the main monastery with a shrine on each step"):
     six stacks of columnar basalt standing out of the band's talus and apron (the flow front's eroded columns), each step 30 m
     higher than the last, a shrine on each top. A stair climbs the first from the Stair of the Eye's head; a rope bridge runs from
     each top to the next stack's landing, 15 m higher, and a stair winds up from the landing to its shrine; the last bridge lands
     at the Gate of the Rift on the Lip. The shrines take the Song's last lines, which the Order reads as its promise */
  const STACKS = [[300, -178], [250, -170], [200, -158], [150, -140], [100, -118], [50, -100]];
  const SHRINES = ['the Shrine of Beware', 'the Shrine of the Floating Hair', 'the Shrine of the Flashing Eyes', 'the Shrine of the Circle Thrice', 'the Shrine of Holy Dread', 'the Shrine of the Dome in Air'];
  const bridgeway = {
    name: 'the Way of Shrines', rise: 5, stairRise: 25, sagK: 0.035, maxSpan: 100, maxGrade: 0.25,
    stacks: STACKS.map(([u, v], i) => ({ id: 'stack.' + (i + 1), u, v, r: 14, top: -155 + 30 * i, landing: -155 + 30 * i - 25, shrine: SHRINES[i] })),
    end: { gate: 'gate.rift', at: [-3, -80], y: 0 },
    /* the spur (the owner, 2026-11-23: the stacks "a natural extension of the terrain and cliff face"): an arete of the coulee's
       columns running out of the band under the Gate of the Rift into the apron, its nose at `nose`. Its crest runs through each
       stack's landing (`crestBelow` under it) and dips under each bridge (`notch` under the deck's middle); its flanks fall at
       `flank` (about 60 degrees, the colonnade) to a talus fan (`talusFrac` of the height, at `talusSlope`). The stacks are gendarmes
       rising from it: their columns from the crest to the shrines */
    spur: { nose: [350, -185], crestBelow: 1, notch: 15, crestW: 6, flank: 1.8, talusFrac: 0.35, talusSlope: 0.55 },
    note: 'replaces the Cleft Stair; the mules still go round the band\'s west end. Each stack: a stair of 25 m round its crown from the landing on the spur\'s crest to its shrine; each bridge 5 m up from a shrine to the next landing'
  };

  /* walls: a centre line a -> b, height, thickness. The precinct's south side is the Lip: the Lip Range and two parapets */
  const walls = [
    { id: 'precinct.n', a: [PRE.u0, PRE.v0], b: [PRE.u0, PRE.v1], h: 6, t: 1.6 },
    { id: 'precinct.e', a: [PRE.u0, PRE.v1], b: [-2, PRE.v1], h: 6, t: 1.6 },
    { id: 'precinct.w', a: [-2, PRE.v0], b: [PRE.u0, PRE.v0], h: 6, t: 1.6 },
    { id: 'lip.w', a: [-3, PRE.v0], b: [-3, -75.5], h: 2.4, t: 1.2, parapet: true, note: 'the parapet on the Lip from the south-west tower to the Mirror Tower, the Gate of the Rift in it' },
    { id: 'lip.e', a: [-3, 75.5], b: [-3, PRE.v1], h: 2.4, t: 1.2, parapet: true }];

  /* gates: on a wall, between two zones */
  const gates = [
    { id: 'gate.rift', name: 'the Gate of the Rift (where the Way of Shrines lands)', wall: 'lip.w', at: [-3, -80], w: 2.4, from: 'band', to: 'bench' },
    { id: 'gate.mule', name: 'the Mule Gate', wall: 'precinct.w', at: [-87, PRE.v0], w: 4, from: 'cap', to: 'bench' },
    { id: 'gate.breath', name: 'the Gate of Breath (to the rim)', wall: 'precinct.n', at: [PRE.u0, 0], w: 3.5, from: 'bench', to: 'cap' }];

  /* open ground between zones, crossed by a way (no gate) */
  const links = [
    { from: 'foot', to: 'spur', way: 'stair' }, { from: 'spur', to: 'apron', way: 'stair' },
    { from: 'apron', to: 'band', way: 'bridges' }, { from: 'apron', to: 'cap', way: 'mule' },
    { from: 'cap', to: 'rim', way: 'breath' }];

  /* a part: n (its number on a sheet), zone, box, level (0 ground; -1 cut into the band), storeys, decor 0-4, sheets,
     sleeps {group: n} (the census), beds {guests | pilgrims: n} (not the census), rota (the Rim Watch's bunks), fire, gold */
  const P = (n, id, name, kind, zone, box, o) => Object.assign({ n, id, name, kind, zone, box, level: 0, storeys: 1, decor: 1, sheets: ['E1'], note: '' }, o || {});
  const parts = [
    /* ---- the Lip Range: built on the Lip, its lower two storeys in the band's top (the Potala effect), west to east */
    P(1, 'lip.mirror', 'The Mirror Hall', 'mirror_hall', 'bench', [-14, 0, -60, -30], { range: 'lip', storeys: 4, below: 2, decor: 3, sheets: ['E1', 'L'], balcony: [0, -45], note: 'the readers\' gallery and the balcony on the Lip toward the Beacon (245), Erehwon (284) and the Tears\' camp (197); the mirror stands on its parapet' }),
    P(2, 'lip.books', 'The Book House', 'library', 'bench', [-14, 0, -30, 0], { range: 'lip', storeys: 4, below: 2, decor: 3, sheets: ['E1', 'L'], note: 'the Book of Breaths and the Book of Flashes, the signal books, the Order\'s library' }),
    P(3, 'lip.guests', 'Guest House', 'guest_hall', 'bench', [-14, 0, 0, 30], { range: 'lip', storeys: 4, below: 2, decor: 2, sheets: ['E1', 'L'], sleeps: { lay: 4 }, beds: { guests: 60 }, note: '60 beds: officers, monks of the other houses, pilgrims of rank; its servers' }),
    P(4, 'lip.labrang', 'The Prismarch\'s Hall (audience and council)', 'audience', 'bench', [-14, 0, 30, 60], { range: 'lip', storeys: 4, below: 2, decor: 4, sheets: ['E1', 'L'], note: 'the east end of the range, under the Labrang Tower: the audience hall, the council, his household below' }),
    /* ---- the towers (the owner, 2026-11-23: tall towers as in the references): on the Lip at the range's ends, and at the corners */
    P(23, 'tw.mirror', 'The Mirror Tower', 'tower', 'bench', [-14, -2, -74, -62], { onLip: true, storeys: 8, h: 36, decor: 3, sheets: ['E1', 'L'], style: 'round', note: 'a tall white tower, tapering, a crimson band under its round red cap: the Mirror Hall\'s readers send and read the day line from its lantern' }),
    P(24, 'tw.labrang', 'The Labrang Tower (the crimson Prismarch\'s house)', 'labrang', 'bench', [-14, -2, 62, 74], { onLip: true, storeys: 9, h: 40, decor: 4, sheets: ['E1', 'L'], style: 'bays', sleeps: { prismarch: 10 }, note: 'a tall white tower, its painted window bays one over another, a crimson band, a gallery and a broad red roof: the Prismarch\'s floors, his mirror room at the top (he sits on the council by mirror)' }),
    P(25, 'tw.nw', 'North-west Tower', 'corner_tower', 'bench', [-151, -139, -96, -84], { storeys: 3, h: 18, decor: 2, note: 'a white watch tower under a two-tiered red roof' }),
    P(26, 'tw.ne', 'North-east Tower', 'corner_tower', 'bench', [-151, -139, 84, 96], { storeys: 3, h: 18, decor: 2 }),
    P(27, 'tw.sw', 'South-west Tower (on the Lip)', 'corner_tower', 'bench', [-8, 2, -95, -85], { storeys: 3, h: 18, drop: 30, decor: 2, note: 'on the cliff\'s edge, its battered base down the face' }),
    P(28, 'tw.se', 'South-east Tower (on the Lip)', 'corner_tower', 'bench', [-8, 2, 85, 95], { storeys: 3, h: 18, drop: 30, decor: 2 }),
    /* ---- the bench, behind the range */
    P(5, 'court', 'Monastery Court', 'court', 'bench', [-36, -16, -26, 26], { note: 'before the monastery\'s stair; the great cistern under it (1,000 m3)' }),
    P(42, 'st.lower', 'Stair of the Court (the middle terrace down to the Lip terrace)', 'stair_way', 'bench', [-46, -36, -5, 5], { rise: 4 }),
    P(43, 'st.upper', 'Stair of the Ember (the upper terrace down to the middle)', 'stair_way', 'bench', [-114, -102, -5, 5], { rise: 5 }),
    P(6, 'monastery', 'The Red Monastery (the great monastery, the Order\'s temple)', 'hosted', 'bench', [-100, -48, -26, 26], { storeys: 2, decor: 4, gold: 'crown', sheets: ['E1', 'M1', 'M2', 'MR'], host: { kit: 'settlements/flashing-eye', key: 'qb_fe_temple', v: 0, centre: [-74, 0], front: 'south' }, sleeps: { chapter: 100 }, note: 'the Qiblai kit\'s great-monastery plan (52 x 52 m) built in the revamp\'s style: white ranges under red tiled roofs round the court, the Assembly Hall under a two-tiered roof with the gilt crown, its gate tower facing south to the Rift' }),
    P(7, 'ember', 'The Ember Tower (the Hall of the Ember)', 'ember_hall', 'bench', [-136, -116, -8, 8], { storeys: 6, h: 42, decor: 4, gold: 'sanctum', fire: 'ember', sheets: ['E1', 'H'], sleeps: { lay: 2 }, note: 'on the axis north of the monastery, toward the crater, the tallest roof of the house: a white tower under three red tiers over the hall; the fire lit from the vent burns in its sanctum; its north window frames the plume; its two tenders' }),
    P(8, 'granary', 'Granary', 'store', 'bench', [-138, -118, -84, -64], { storeys: 2, decor: 0, sleeps: { lay: 10 }, note: 'a winter\'s grain (about 25 t); the tea, the salt, the sulfur for the halls\' fumigation' }),
    P(9, 'infirmary', 'Infirmary', 'infirmary', 'bench', [-140, -118, -60, -36], { storeys: 2, decor: 2, sleeps: { lay: 6 }, note: 'the Rim Watch\'s burns and coughs; the old monks' }),
    P(10, 'mulecourt', 'Mule Court', 'court', 'bench', [-112, -62, -86, -50], { note: 'inside the Mule Gate: the loads come off here' }),
    P(11, 'kitchen', 'Great Kitchen', 'kitchen', 'bench', [-112, -92, -46, -30], { storeys: 2, decor: 1, fire: 'ember', sleeps: { lay: 12 }, note: 'its hearth lit from the Ember; the tea coppers; the cooks over it' }),
    P(12, 'refectory', 'Refectory', 'refectory', 'bench', [-88, -60, -46, -30], { decor: 2, note: 'the chapter, the school and the novices at two sittings' }),
    P(13, 'bath', 'Bath House', 'bath', 'bench', [-62, -48, -86, -68], { decor: 1, sleeps: { lay: 2 } }),
    P(14, 'woodstore', 'Juniper and Wood Store', 'store', 'bench', [-60, -48, -64, -50], { decor: 0, note: 'the fire basket\'s juniper and the kitchen\'s wood from the woodlot' }),
    P(15, 'chapter', 'Chapter Range', 'cells', 'bench', [-100, -60, 34, 44], { storeys: 3, decor: 1, sleeps: { chapter: 30 }, note: 'the rest of the chapter, two to a cell; the Master of Novices\' room at its south end' }),
    P(16, 'novices', 'Novices\' Court', 'novices', 'bench', [-104, -64, 52, 82], { storeys: 2, decor: 1, sleeps: { novices: 50 }, note: 'dormitory, school and refectory round a yard' }),
    P(17, 'school', 'The Mirror School', 'mirror_school', 'bench', [-142, -130, 50, 82], { storeys: 2, decor: 2, sleeps: { school: 30 }, note: 'its dormitory, the mirror bench (grinding and silvering), the code room' }),
    P(18, 'founders', 'Chorten of the Founders', 'chorten', 'bench', [-142, -132, 24, 34], { circ: true, decor: 3 }),
    P(19, 'pilgrims', 'Pilgrims\' Court', 'court', 'bench', [-44, -18, 34, 86], { note: 'before the guest house; its tank under it (250 m3)' }),
    /* ---- the gates (on their walls) */
    P(20, 'g.rift', 'Gate of the Rift', 'gatehouse', 'bench', [-7, 1, -84, -76], { decor: 3, note: 'on the Lip, where the last rope bridge lands' }),
    P(21, 'g.mule', 'Mule Gate', 'gatehouse', 'bench', [-92, -82, -94, -86], { storeys: 2, decor: 1, sleeps: { lay: 4 }, note: 'the porters' }),
    P(22, 'g.breath', 'Gate of Breath', 'gatehouse', 'bench', [-150, -140, -5, 5], { storeys: 2, decor: 3, note: 'the north gate, to the rim: the professed only beyond the Threshold Chorten' }),
    /* ---- the cap (outside the wall, sheet E0) */
    P(30, 'byres', 'Byres and Dairy', 'byre', 'cap', [-260, -200, -60, -20], { decor: 0, sheets: ['E0'], sleeps: { lay: 14 }, note: 'the milk herd (milk is a sacrament) and the churn house; the herdsmen' }),
    P(31, 'hives', 'Hives', 'hives', 'cap', [-156, -149, 30, 70], { decor: 0, sheets: ['E0'], note: 'in the lee of the north wall: honey, the other sacrament' }),
    P(32, 'threshing', 'Threshing Floor', 'threshing', 'cap', [-230, -210, 40, 60], { circ: true, decor: 0, sheets: ['E0'] }),
    P(33, 'terr.w', 'Upper Terraces (west)', 'terrace', 'cap', [-560, -300, -220, -50], { decor: 0, sheets: ['E0'], ha: 4.4, note: 'barley and buckwheat on the ash soil of the cap, west of the Way of Breath' }),
    P(41, 'terr.e', 'Upper Terraces (east)', 'terrace', 'cap', [-560, -300, 50, 200], { decor: 0, sheets: ['E0'], ha: 3.9 }),
    P(34, 'woodlot', 'Woodlot Sheds', 'store', 'cap', [-300, -276, -140, -110], { decor: 0, sheets: ['E0'], sleeps: { lay: 6 }, note: 'the woodmen; the cone\'s upper woods are the Order\'s' }),
    P(35, 'captank', 'Cap Tank', 'tank', 'cap', [-190, -176, -120, -100], { decor: 0, sheets: ['E0'], note: 'the cap\'s runoff for the herd and the terraces' }),
    P(36, 'midden', 'Midden', 'midden', 'cap', [-180, -170, -170, -160], { decor: 0, sheets: ['E0'] }),
    P(37, 'shelter', 'The Halfway Shelter', 'shelter', 'cap', [-1010, -1000, 50, 62], { decor: 1, sheets: ['E0'], note: 'on the Way of Breath: a room with a stove (juniper, from the Ember) and the pilgrims\' book' }),
    P(38, 'ch.breath1', 'Chorten of the First Breath', 'chorten', 'cap', [-505, -497, 18, 26], { circ: true, decor: 2, sheets: ['E0'] }),
    P(39, 'ch.breath2', 'Chorten of the Second Breath', 'chorten', 'cap', [-1005, -997, -26, -18], { circ: true, decor: 2, sheets: ['E0'] }),
    P(40, 'ch.breath3', 'Chorten of the Third Breath', 'chorten', 'cap', [-1455, -1447, 18, 26], { circ: true, decor: 2, sheets: ['E0'] }),
    /* ---- the rim (the professed only; sheet P) */
    P(50, 'post', 'The Eye Post', 'eye_post', 'rim', [-1908, -1900, -4, 4], { storeys: 3, h: 12, decor: 3, fire: 'juniper', sheets: ['E0', 'P'], note: 'a stone tower on the crater\'s south rim: the watch room below, the mirror platform on top (the 60 cm speculum), the shuttered fire basket for the night\'s answer' }),
    P(51, 'hut', 'The Watch\'s Hut', 'hut', 'rim', [-1898, -1890, 10, 18], { decor: 1, rota: 4, sheets: ['E0', 'P'], note: 'four bunks: the Rim Watch on duty sleeps here in turns' }),
    P(52, 'threshold', 'The Threshold Chorten', 'chorten', 'rim', [-1872, -1864, -4, 4], { circ: true, decor: 3, sheets: ['E0', 'P'], note: 'where the Open Kora starts; the pilgrims\' way ends here' }),
    /* ---- in the band (level -1: cut into the face) */
    P(60, 'cave.w', 'Meditation Cave (west)', 'cave', 'band', [2, 10, -232, -220], { level: -1, decor: 1, sheets: ['E0', 'S'], y: -70 }),
    P(61, 'cave.c', 'Meditation Cave (the Prismarch\'s)', 'cave', 'band', [2, 10, 140, 152], { level: -1, decor: 2, sheets: ['E0', 'S'], y: -55 }),
    P(62, 'cave.e', 'Meditation Cave (east)', 'cave', 'band', [6, 14, 330, 342], { level: -1, decor: 1, sheets: ['E0', 'S'], y: -95 }),
    /* ---- the apron, the spur and the foot */
    P(70, 'stairhead', 'Chorten at the Stair\'s Head', 'chorten', 'apron', [361, 369, -189, -181], { circ: true, decor: 2, sheets: ['E0'], note: 'where the Stair of the Eye reaches the apron: the mules go west round the band, the pilgrims and the professed up the Way of Shrines' }),
    P(71, 'resthouse', 'The Rest House', 'rest_house', 'spur', [2789, 2811, 18, 38], { storeys: 2, decor: 1, sheets: ['F'], front: 'west', beds: { pilgrims: 24 },
      note: 'at about 1,080 m on the Stair, the road turning at its gate: the pilgrims\' hall and the tea kitchen, the dormitory (24 beds) and the keeper\'s room, the mules\' shed and trough round its yard; kept by two of the Foot House\'s muleteers in turn (their beds are the Foot House\'s)' }),
    P(72, 'foothouse', 'The Foot House', 'foot_house', 'foot', [6370, 6430, -40, 40], { storeys: 2, decor: 2, sheets: ['F'], sleeps: { foot: 40 }, beds: { pilgrims: 120 }, note: 'the Hosteller, the muleteers of the Stair, the storemen, the terraces\' hands; the pilgrims\' hostel (120 beds), the stores, the mule stables (about 40 mules), the gate chorten' }),
    P(73, 'footterr', 'Lower Terraces', 'terrace', 'foot', [6440, 6590, -380, 380], { decor: 0, sheets: ['F'], ha: 3.7 })]
    .concat(bridgeway.stacks.map((S, i) => P(80 + i, 'shrine.' + (i + 1), S.shrine.replace(/^the /, 'The '), 'shrine', S.u < 60 ? 'band' : 'apron', [S.u - 3, S.u + 3, S.v - 3, S.v + 3],
      { level: 2, y: S.top, decor: 3, sheets: ['E0', 'S'], note: 'on the top of ' + S.id + ' (' + (1660 + S.top) + ' m), under a two-tiered red roof' })));

  /* ways (polylines of [u, v, y]); grade is checked on them (31-fe-rules.js) except where `steep` */
  const lin = (pts, y0, y1) => {   /* y along the path's length, y0 to y1 */
    let L = 0; const s = [0];
    for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); s.push(L); }
    return pts.map((p, i) => [p[0], p[1], Math.round((y0 + (y1 - y0) * s[i] / L) * 10) / 10]);
  };
  /* the Stair of the Eye (PLAN.md sections 2.6 and 3.4; drawn by targets/cone/90fl-stair.js): a mule road in switchbacks on the
     spur's broad crest, its corners `A` m either side of it, each leg falling at `grade` or less on the page's ground under it.
     The ground is `ground`: FLASHING_EYE.ground over the scale model, sampled on the page every 200 m down the spur and 100 m
     across its crest (2026-11-23; verify.py's stair-ground checks the page still agrees). Two pieces: from the band's foot (the
     Stair's Head) down to the Rest House's gate, and on to the Foot House's north gate; the last corner before the Rest House and
     the first after it are on the west, so the road turns at the gate and never crosses the yard (the house stands east of it) */
  const stair = {
    A: 160, grade: 0.09, w: 3.5, hairpin: 7, head: [365, -185], rest: [2800, 14], foot: [6436, -46], chortenEvery: 3, chortenOut: 12,
    smooth: { u: [400, 6500], ramp: 100, halfW: 200, skirt: 80 },
    note: 'smooth: the page smooths the crest under the Stair to this table (FLASHING_EYE.stairGround), so the legs keep their grade on the drawn ground. foot: the Foot House\'s south-west corner, past its west range from the north (its gate is in its south range, to the roads); the page links the road to each house\'s gate',
    ground: { u0: 400, du: 200, v0: -200, dv: 100, h: [
      [-224, -212, -212, -212, -224], [-237, -220, -220, -220, -236], [-233, -218, -217, -220, -236], [-237, -231, -233, -231, -237],
      [-268, -270, -271, -273, -270], [-302, -303, -304, -308, -306], [-332, -335, -334, -334, -330], [-369, -373, -376, -376, -375],
      [-417, -415, -419, -424, -428], [-461, -460, -459, -465, -475], [-491, -492, -497, -498, -497], [-528, -534, -536, -539, -536],
      [-573, -575, -575, -576, -575], [-606, -607, -608, -608, -607], [-648, -653, -657, -662, -656], [-684, -701, -707, -709, -710],
      [-719, -724, -731, -750, -757], [-764, -771, -776, -779, -782], [-800, -817, -823, -829, -827], [-842, -844, -848, -850, -853],
      [-895, -902, -902, -904, -907], [-919, -937, -963, -965, -970], [-971, -983, -986, -992, -1010], [-1015, -1031, -1044, -1044, -1047],
      [-1045, -1051, -1057, -1080, -1089], [-1083, -1086, -1094, -1101, -1106], [-1110, -1114, -1123, -1123, -1128], [-1143, -1146, -1152, -1157, -1158],
      [-1167, -1172, -1175, -1178, -1180], [-1191, -1191, -1193, -1198, -1206], [-1214, -1219, -1217, -1222, -1226]] }
  };
  /* the crest's ground as the Stair is laid on it (and as the page smooths it, FLASHING_EYE.stairGround): each row of the table a
     level and a cross-slope fitted to its samples (least squares), the levels eased along the spur ([1, 2, 1]), both interpolated
     between the rows: a ruled surface without the model's hundred-metre bumps */
  const crest = (() => { const G = stair.ground, vs = G.h[0].map((_, j) => G.v0 + j * G.dv), vm = vs.reduce((s, v) => s + v, 0) / vs.length, vv = vs.reduce((s, v) => s + (v - vm) * (v - vm), 0);
    const lv = G.h.map(r => r.reduce((s, y) => s + y, 0) / r.length), sl = G.h.map((r, i) => r.reduce((s, y, j) => s + (vs[j] - vm) * (y - lv[i]), 0) / vv);
    return { vm, sl, lv: lv.map((y, i) => i === 0 || i === lv.length - 1 ? y : (lv[i - 1] + 2 * y + lv[i + 1]) / 4) }; })();
  const stairY = (u, v) => { const G = stair.ground, n = G.h.length - 1, f = Math.max(0, Math.min(n, (u - G.u0) / G.du)), i = Math.min(n - 1, Math.floor(f)), a = f - i;
    return crest.lv[i] + (crest.lv[i + 1] - crest.lv[i]) * a + (crest.sl[i] + (crest.sl[i + 1] - crest.sl[i]) * a) * (v - crest.vm); };
  /* switchbacks from P down to Q: corners alternating side0, -side0, ... at A either side of the crest, each as far down as the
     leg keeps `grade` over every 20 m of it on the table (where the crest's own cross-fall is steeper than that, the leg angles
     back up the spur, never past the last corner on its side and `gap` m); done when Q is in reach so (and the last corner is on
     lastSide, when given). last: the furthest corner down on each side so far, shared by the two pieces */
  const last = { '-1': stair.head[0], '1': -Infinity }, gap = 40;
  const steepest = (a, b) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / 20)); let m = 0;
    for (let k = 1; k <= n; k++) { const p = [a[0] + (b[0] - a[0]) * (k - 1) / n, a[1] + (b[1] - a[1]) * (k - 1) / n], q = [a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n];
      m = Math.max(m, Math.abs(stairY(p[0], p[1]) - stairY(q[0], q[1])) / (L / n)); }
    return m; };
  const switchbacks = (P, Q, side0, lastSide) => {
    const out = [P];
    let c = P, side = side0;
    for (let n = 0; n < 80; n++) {
      if (out.length > 1 && steepest(c, Q) <= stair.grade && (lastSide == null || Math.sign(c[1]) === lastSide)) break;
      const v = side * stair.A, u0 = Math.max(last[side] + gap, c[0] - 150);
      let best = null, least = [Infinity, u0];
      for (let u = u0; u <= Q[0] - 30; u += 5) { const g = steepest(c, [u, v]); if (g <= stair.grade && stairY(u, v) <= stairY(c[0], c[1])) best = u; if (g < least[0]) least = [g, u]; }
      c = [best == null ? least[1] : best, v]; last[side] = c[0]; out.push(c); side = -side;
    }
    return out.concat([Q]);
  };
  const stairRoute = switchbacks(stair.head, stair.rest, 1, -1).concat(switchbacks(stair.rest, stair.foot, -1, -1).slice(1)).reverse()
    .map(p => [p[0], p[1], Math.round(stairY(p[0], p[1]) * 10) / 10]);
  /* the way chortens: on the outside of every chortenEvery-th hairpin, chortenOut m beyond its corner */
  const stairChortens = [];
  stairRoute.forEach((b, i, R) => { if (i === 0 || i === R.length - 1 || i % stair.chortenEvery || (b[0] === stair.rest[0] && b[1] === stair.rest[1])) return;
    const a = R[i - 1], c = R[i + 1], la = Math.hypot(a[0] - b[0], a[1] - b[1]), lc = Math.hypot(c[0] - b[0], c[1] - b[1]);
    const m = [(a[0] - b[0]) / la + (c[0] - b[0]) / lc, (a[1] - b[1]) / la + (c[1] - b[1]) / lc], lm = Math.hypot(m[0], m[1]);
    if (lm < 0.2) return;
    stairChortens.push([Math.round(b[0] - m[0] / lm * stair.chortenOut), Math.round(b[1] - m[1] / lm * stair.chortenOut)]); });
  const ways = [
    { id: 'breath', name: 'the Way of Breath (the bench to the rim)', pilgrims: 'threshold', pts: lin([[-145, 0], [-400, 30], [-560, -40], [-700, 30], [-860, -40], [-1000, 30], [-1160, -40], [-1300, 30], [-1460, -40], [-1600, 30], [-1760, -30], [-1864, 0]], 0, 152) },
    { id: 'bridges', name: 'the Way of Shrines (up the stacks and over the rope bridges to the Gate of the Rift)', steep: true,
      pts: [[365, -185, -210]].concat(...bridgeway.stacks.map(S => (S.landing == null ? [] : [[S.u, S.v, S.landing]]).concat([[S.u, S.v, S.top]])), [[-3, -80, 0]]) },
    { id: 'mule', name: 'the mule road (round the band\'s west end to the Mule Gate)', pts: lin([[365, -185], [410, -270], [330, -340], [150, -480], [190, -860], [120, -960], [30, -870], [-40, -980], [-110, -860], [-150, -700], [-100, -520], [-170, -400], [-110, -260], [-160, -160], [-87, -100], [-87, -91]], -210, 4) },
    { id: 'stair', name: 'the Stair of the Eye (the Foot House up to the band\'s foot, in switchbacks, by the Rest House)', rest: 'resthouse', pts: stairRoute },
    { id: 'kora.lower', name: 'the lower kora (round the monastery, eyes lowered)', pilgrims: 'all', pts: [[-106, 0, 0], [-106, -29, 0], [-16, -29, 0], [-16, 29, 0], [-106, 29, 0], [-106, 0, 0]] },
    { id: 'kora.open', name: 'the Open Kora (the crater\'s rim, three times with eyes open)', professed: true, loop: true,
      pts: Array.from({ length: 25 }, (_, i) => { const a = i / 24 * Math.PI * 2; return [Math.round(crater.centre[0] + Math.cos(a) * (crater.r + 12)), Math.round(crater.centre[1] + Math.sin(a) * (crater.r + 12)), crater.rimY]; }) }];

  /* the sights (tools/sights.py on the scale model 5.1: bilinear ground, the eye's height over its ground, a mark 15 m up,
     Earth's curve with refraction k 0.13, the last kilometre left out). clear = the least gap in metres; must = the Order needs it;
     via = the station that carries the line on */
  const sights = {
    balcony: { part: 'lip.mirror', eyeH: 14, ground: 1660, list: [
      { id: 'beacon', name: 'the Beacon (the gold Order\'s lamp)', px: [853, 1540], km: 61.7, bearing: 245, clear: 46, must: true },
      { id: 'erehwon', name: 'Erehwon', px: [841, 1517], km: 82.5, bearing: 284, clear: 40, must: true },
      { id: 'tears', name: 'the Golden Tears\' camp (through the gap at 868,1571)', px: [850, 1628], km: 211.1, bearing: 197, clear: 54, must: true },
      { id: 'azure', name: 'Grēṭ-Āil (the Azure Dream\'s cove)', px: [846, 1509], km: 78.8, bearing: 297, clear: 20, must: false },
      { id: 'alph', name: 'the Ālph wall\'s crest', px: [951, 1505], km: 146.8, bearing: 72, clear: 13, must: false },
      { id: 'g1', name: 'G1, the Brow post', px: [917, 1648], km: 252.3, bearing: 163, clear: -105, must: false, via: 'beacon' },
      { id: 'tempest', name: 'the House of the Tempest', px: [886, 1619], km: 184.1, bearing: 177, clear: -500, must: false, via: 'beacon' },
      { id: 'qiblai', name: 'Qiblai', px: [922, 1595], km: 158.6, bearing: 149, clear: -2287, must: false, via: 'g1' },
      { id: 'theodiga', name: 'Theodiga', px: [908, 1535], km: 56.3, bearing: 106, clear: -227, must: false }] },
    post: { part: 'post', eyeH: 12, ground: 1838, list: [
      { id: 'beacon', name: 'the Beacon', px: [853, 1540], km: 62.6, bearing: 243, clear: 49, must: true },
      { id: 'erehwon', name: 'Erehwon', px: [841, 1517], km: 82.0, bearing: 283, clear: 63, must: true },
      { id: 'tears', name: 'the Golden Tears\' camp', px: [850, 1628], km: 213.2, bearing: 197, clear: 52, must: true },
      { id: 'azure', name: 'Grēṭ-Āil', px: [846, 1509], km: 77.8, bearing: 296, clear: 53, must: false },
      { id: 'rimpost', name: 'the Beacon\'s Rim Post', px: [856, 1532], km: 51.4, bearing: 257, clear: 42, must: true, note: 'the Beacon session\'s figure on the restored knoll (d1c7d6682), not tools/sights.py\'s +68 on the model before it' },
      { id: 'g1', name: 'G1, the Brow post (+9 m from a 30 m tower: question 14)', px: [917, 1648], km: 254.4, bearing: 164, clear: -2, must: false, via: 'beacon' },
      { id: 'tempest', name: 'the House of the Tempest', px: [886, 1619], km: 186.3, bearing: 177, clear: -435, must: false, via: 'beacon' },
      { id: 'theodiga', name: 'Theodiga', px: [908, 1535], km: 56.9, bearing: 108, clear: -110, must: false }] }
  };

  /* the line (PLAN.md section 2.4): each hop a pair of stations and the least gap between them. By night the Beacon's lamp reaches
     the Eye through its Rim Post (the owner, 2026-11-16) and the Eye's fire basket answers; by day the mirrors run both ways. The
     Beacon's own hops are its layout's (settlements/beacon/src/30-bc-layout.js); G1 to Qiblai is Strongwall's watch line */
  const line = {
    hops: [
      { a: 'beacon', b: 'rimpost', clear: 41, src: 'the Beacon\'s layout: the Rim Post on the middle volcano\'s summit, measured on the restored knoll (d1c7d6682)' },
      { a: 'rimpost', b: 'eye', clear: 42, src: 'the Beacon\'s layout (d1c7d6682); if that volcano is given a vent, its flank at 857,1535: +17 m to the lamp, +12 m to the Eye' },
      { a: 'eye', b: 'erehwon', clear: 63, src: 'the post at 12 m' },
      { a: 'eye', b: 'beacon', clear: 49, src: 'the post at 12 m (the day line)' },
      { a: 'beacon', b: 'g1', clear: 32, src: 'the Beacon\'s layout' },
      { a: 'g1', b: 'qiblai', clear: 36, src: 'PLAN.md section 2.4' },
      { a: 'eye', b: 'tears', clear: 52, src: 'the post at 12 m' }],
    must: [['beacon', 'erehwon'], ['eye', 'qiblai'], ['eye', 'beacon']],
    note: 'the Beacon cannot see Erehwon (-646 m): the Eye is its relay to the capital. On the model before the knoll was restored the Rim Post also saw G1 (+106 m) and the Tempest (+28 m): to re-check on the restored model, for the Beacon\'s session'
  };

  /* water (section 2.5): roofs and paved courts at the rain, the cisterns under the courts */
  const water = {
    rainM: 0.85, runoff: 0.8, litresDay: 25, guestsAvg: 30,
    cisterns: [{ id: 'great', under: 'court', m3: 1000 }, { id: 'guests', under: 'pilgrims', m3: 250 }, { id: 'novices', under: 'novices', m3: 150 }],
    reserveDays: 90
  };

  /* who lives here: the owner's 320 (section 2.1; the tune's xan.flashingeye) */
  const census = { prismarch: 10, chapter: 130, school: 30, novices: 50, lay: 60, foot: 40 };
  const benchGroups = ['prismarch', 'chapter', 'school', 'novices', 'lay'], footGroups = ['foot'];
  const rota = { watch: 24, perWatch: 4, watches: 6, note: 'the Rim Watch: 24 of the chapter in six watches of four, each keeping the rim a week in turn (the hut\'s four bunks hold one watch; 40-fe-watch.js), two awake at a time (their bunks at the bench count, the hut\'s do not)' };

  return { frame, crater, band, lipU, terraces, bridgeway, zones, walls, gates, links, parts, ways, sights, line, water, census, benchGroups, footGroups, rota,
    stair, stairY, stairW: stair.w, stairHairpin: stair.hairpin, stairChortens };
})();
if (typeof module !== 'undefined') module.exports = FE_LAYOUT;
