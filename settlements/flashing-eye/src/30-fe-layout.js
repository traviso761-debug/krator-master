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
     `h` m with a batter of `batter` m; a talus leans on its foot; the apron eases into the model's flank `merge` m out. Its height
     tapers to nothing over the last `taper` m of each end */
  const band = {
    halfLen: 750, lipK: 0.0002, h: 200, batter: 30, talusH: 45, talusRun: 70, apronGrade: 0.04, taper: 160,
    face: [163, 197], stone: 'rock.columnar',
    cleft: { v: -75, w: 10, depth: 40, flights: 19, note: 'the Cleft Stair climbs in a cleft of the colonnade under the Gate of the Rift (Taktsang\'s way)' },
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

  /* walls: a centre line a -> b, height, thickness. The precinct's south side is the Lip: the Lip Range and two parapets */
  const walls = [
    { id: 'precinct.n', a: [PRE.u0, PRE.v0], b: [PRE.u0, PRE.v1], h: 6, t: 1.6 },
    { id: 'precinct.e', a: [PRE.u0, PRE.v1], b: [-2, PRE.v1], h: 6, t: 1.6 },
    { id: 'precinct.w', a: [-2, PRE.v0], b: [PRE.u0, PRE.v0], h: 6, t: 1.6 },
    { id: 'lip.w', a: [-3, PRE.v0], b: [-3, -60], h: 2.4, t: 1.2, parapet: true, note: 'the parapet on the Lip west of the range, the Gate of the Rift in it' },
    { id: 'lip.e', a: [-3, 60], b: [-3, PRE.v1], h: 2.4, t: 1.2, parapet: true }];

  /* gates: on a wall, between two zones */
  const gates = [
    { id: 'gate.rift', name: 'the Gate of the Rift (the head of the Cleft Stair)', wall: 'lip.w', at: [-3, -75], w: 2.4, from: 'band', to: 'bench' },
    { id: 'gate.mule', name: 'the Mule Gate', wall: 'precinct.w', at: [-87, PRE.v0], w: 4, from: 'cap', to: 'bench' },
    { id: 'gate.breath', name: 'the Gate of Breath (to the rim)', wall: 'precinct.n', at: [PRE.u0, 0], w: 3.5, from: 'bench', to: 'cap' }];

  /* open ground between zones, crossed by a way (no gate) */
  const links = [
    { from: 'foot', to: 'spur', way: 'stair' }, { from: 'spur', to: 'apron', way: 'stair' },
    { from: 'apron', to: 'band', way: 'cleft' }, { from: 'apron', to: 'cap', way: 'mule' },
    { from: 'cap', to: 'rim', way: 'breath' }];

  /* a part: n (its number on a sheet), zone, box, level (0 ground; -1 cut into the band), storeys, decor 0-4, sheets,
     sleeps {group: n} (the census), beds {guests | pilgrims: n} (not the census), rota (the Rim Watch's bunks), fire, gold */
  const P = (n, id, name, kind, zone, box, o) => Object.assign({ n, id, name, kind, zone, box, level: 0, storeys: 1, decor: 1, sheets: ['E1'], note: '' }, o || {});
  const parts = [
    /* ---- the Lip Range: built on the Lip, its lower two storeys in the band's top (the Potala effect), west to east */
    P(1, 'lip.mirror', 'The Mirror Hall', 'mirror_hall', 'bench', [-14, 0, -60, -30], { range: 'lip', storeys: 4, below: 2, decor: 3, sheets: ['E1', 'L'], balcony: [0, -45], note: 'the readers\' gallery and the balcony on the Lip toward the Beacon (245), Erehwon (284) and the Tears\' camp (197); the mirror stands on its parapet' }),
    P(2, 'lip.books', 'The Book House', 'library', 'bench', [-14, 0, -30, 0], { range: 'lip', storeys: 4, below: 2, decor: 3, sheets: ['E1', 'L'], note: 'the Book of Breaths and the Book of Flashes, the signal books, the Order\'s library' }),
    P(3, 'lip.guests', 'Guest House', 'guest_hall', 'bench', [-14, 0, 0, 30], { range: 'lip', storeys: 4, below: 2, decor: 2, sheets: ['E1', 'L'], sleeps: { lay: 4 }, beds: { guests: 60 }, note: '60 beds: officers, monks of the other houses, pilgrims of rank; its servers' }),
    P(4, 'lip.labrang', 'The Labrang (the crimson Prismarch\'s house)', 'labrang', 'bench', [-14, 0, 30, 60], { range: 'lip', storeys: 4, below: 2, decor: 4, sheets: ['E1', 'L'], sleeps: { prismarch: 10 }, note: 'the east end of the range, four storeys over the Rift; his mirror room on the top floor (he sits on the council by mirror)' }),
    /* ---- the bench, behind the range */
    P(5, 'court', 'Monastery Court', 'court', 'bench', [-44, -18, -26, 26], { note: 'before the monastery\'s gate; the great cistern under it (1,000 m3)' }),
    P(6, 'monastery', 'The Red Monastery (the great monastery, crimson dress)', 'hosted', 'bench', [-100, -48, -26, 26], { storeys: 2, decor: 4, gold: 'crown', sheets: ['E1', 'M1', 'M2', 'MR'], host: { kit: 'kits/qiblai', key: 'qb_monastery', v: 0, centre: [-74, 0], front: 'south' }, sleeps: { chapter: 100 }, note: 'the kit\'s block whole (52 x 52 m), QSPOKE[0], its gate facing south to the Rift, the gilt crown on the Assembly Hall' }),
    P(7, 'ember', 'The Hall of the Ember', 'ember_hall', 'bench', [-128, -108, -8, 8], { storeys: 2, decor: 4, gold: 'sanctum', fire: 'ember', sheets: ['E1', 'H'], sleeps: { lay: 2 }, note: 'on the axis north of the monastery, toward the crater: the fire lit from the vent burns in its sanctum; its north window frames the plume; its two tenders' }),
    P(8, 'granary', 'Granary', 'store', 'bench', [-140, -118, -86, -64], { storeys: 2, decor: 0, sleeps: { lay: 10 }, note: 'a winter\'s grain (about 25 t); the tea, the salt, the sulfur for the halls\' fumigation' }),
    P(9, 'infirmary', 'Infirmary', 'infirmary', 'bench', [-140, -118, -60, -36], { storeys: 2, decor: 2, sleeps: { lay: 6 }, note: 'the Rim Watch\'s burns and coughs; the old monks' }),
    P(10, 'mulecourt', 'Mule Court', 'court', 'bench', [-112, -62, -86, -50], { note: 'inside the Mule Gate: the loads come off here' }),
    P(11, 'kitchen', 'Great Kitchen', 'kitchen', 'bench', [-112, -92, -46, -30], { storeys: 2, decor: 1, fire: 'ember', sleeps: { lay: 12 }, note: 'its hearth lit from the Ember; the tea coppers; the cooks over it' }),
    P(12, 'refectory', 'Refectory', 'refectory', 'bench', [-88, -60, -46, -30], { decor: 2, note: 'the chapter, the school and the novices at two sittings' }),
    P(13, 'bath', 'Bath House', 'bath', 'bench', [-56, -40, -86, -68], { decor: 1, sleeps: { lay: 2 } }),
    P(14, 'woodstore', 'Juniper and Wood Store', 'store', 'bench', [-56, -40, -62, -50], { decor: 0, note: 'the fire basket\'s juniper and the kitchen\'s wood from the woodlot' }),
    P(15, 'chapter', 'Chapter Range', 'cells', 'bench', [-100, -60, 34, 44], { storeys: 3, decor: 1, sleeps: { chapter: 30 }, note: 'the rest of the chapter, two to a cell; the Master of Novices\' room at its south end' }),
    P(16, 'novices', 'Novices\' Court', 'novices', 'bench', [-104, -64, 52, 82], { storeys: 2, decor: 1, sleeps: { novices: 50 }, note: 'dormitory, school and refectory round a yard' }),
    P(17, 'school', 'The Mirror School', 'mirror_school', 'bench', [-140, -104, 74, 86], { storeys: 2, decor: 2, sleeps: { school: 30 }, note: 'its dormitory, the mirror bench (grinding and silvering), the code room' }),
    P(18, 'founders', 'Chorten of the Founders', 'chorten', 'bench', [-140, -130, 40, 50], { circ: true, decor: 3 }),
    P(19, 'pilgrims', 'Pilgrims\' Court', 'court', 'bench', [-50, -18, 34, 86], { note: 'before the guest house; its tank under it (250 m3)' }),
    /* ---- the gates (on their walls) */
    P(20, 'g.rift', 'Gate of the Rift', 'gatehouse', 'bench', [-7, 1, -80, -70], { decor: 3, note: 'at the head of the Cleft Stair, on the Lip' }),
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
    P(70, 'stairhead', 'Chorten at the Stair\'s Head', 'chorten', 'apron', [116, 124, -104, -96], { circ: true, decor: 2, sheets: ['E0'], note: 'where the Stair of the Eye meets the band\'s foot: the mules go west round the band, the professed up the Cleft' }),
    P(71, 'resthouse', 'The Rest House', 'shelter', 'spur', [2790, 2810, 20, 40], { decor: 1, sheets: ['F'], note: 'at about 1,080 m on the Stair' }),
    P(72, 'foothouse', 'The Foot House', 'foot_house', 'foot', [6370, 6430, -40, 40], { storeys: 2, decor: 2, sheets: ['F'], sleeps: { foot: 40 }, beds: { pilgrims: 120 }, note: 'the Hosteller, the muleteers of the Stair, the storemen, the terraces\' hands; the pilgrims\' hostel (120 beds), the stores, the mule stables (about 40 mules), the gate chorten' }),
    P(73, 'footterr', 'Lower Terraces', 'terrace', 'foot', [6440, 6590, -380, 380], { decor: 0, sheets: ['F'], ha: 3.7 })];

  /* ways (polylines of [u, v, y]); grade is checked on them (31-fe-rules.js) except where `steep` */
  const lin = (pts, y0, y1) => {   /* y along the path's length, y0 to y1 */
    let L = 0; const s = [0];
    for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); s.push(L); }
    return pts.map((p, i) => [p[0], p[1], Math.round((y0 + (y1 - y0) * s[i] / L) * 10) / 10]);
  };
  /* switchbacks down a slope: legs across it (+-amp of v) each `du` further down, from (u0, v0) to (u1, v1) */
  const zig = (u0, v0, u1, v1, du, amp) => { const out = [[u0, v0]]; let u = u0, k = 0; while (u < u1 - 1e-6) { u = Math.min(u1, u + du); out.push([u, (k++ % 2 ? -amp : amp) + v0]); } out[out.length - 1][1] = v1; return out; };
  const ways = [
    { id: 'breath', name: 'the Way of Breath (the bench to the rim)', pilgrims: 'threshold', pts: lin([[-145, 0], [-400, 30], [-560, -40], [-700, 30], [-860, -40], [-1000, 30], [-1160, -40], [-1300, 30], [-1460, -40], [-1600, 30], [-1760, -30], [-1864, 0]], 0, 152) },
    { id: 'cleft', name: 'the Cleft Stair (up the band in its cleft)', steep: true, pts: [[118, -100, -205], [60, -84, -200], [30, -75, -150], [12, -75, -70], [-3, -75, 0]] },
    { id: 'mule', name: 'the mule road (round the band\'s west end to the Mule Gate)', pts: lin([[124, -104], [150, -480], [190, -860], [120, -960], [30, -870], [-40, -980], [-110, -860], [-150, -700], [-100, -520], [-170, -400], [-110, -260], [-160, -160], [-87, -100], [-87, -91]], -205, 0) },
    { id: 'stair', name: 'the Stair of the Eye (the Foot House up to the band\'s foot, in switchbacks)', pts: lin(zig(124, -100, 6370, 0, 255, 260).reverse(), -1200, -205) },
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
      { id: 'rimpost', name: 'the Beacon\'s Rim Post', px: [856, 1532], km: 51.4, bearing: 257, clear: 68, must: true },
      { id: 'g1', name: 'G1, the Brow post (+9 m from a 30 m tower: question 14)', px: [917, 1648], km: 254.4, bearing: 164, clear: -2, must: false, via: 'beacon' },
      { id: 'tempest', name: 'the House of the Tempest', px: [886, 1619], km: 186.3, bearing: 177, clear: -435, must: false, via: 'beacon' },
      { id: 'theodiga', name: 'Theodiga', px: [908, 1535], km: 56.9, bearing: 108, clear: -110, must: false }] }
  };

  /* the line (PLAN.md section 2.4): each hop a pair of stations and the least gap between them. By night the Beacon's lamp reaches
     the Eye through its Rim Post (the owner, 2026-11-16) and the Eye's fire basket answers; by day the mirrors run both ways. The
     Beacon's own hops are its layout's (settlements/beacon/src/30-bc-layout.js); G1 to Qiblai is Strongwall's watch line */
  const line = {
    hops: [
      { a: 'beacon', b: 'rimpost', clear: 60, src: 'tools/sights.py (the Rim Post at 12 m)' },
      { a: 'rimpost', b: 'eye', clear: 68, src: 'the post at 12 m' },
      { a: 'eye', b: 'erehwon', clear: 63, src: 'the post at 12 m' },
      { a: 'eye', b: 'beacon', clear: 49, src: 'the post at 12 m (the day line)' },
      { a: 'beacon', b: 'g1', clear: 32, src: 'the Beacon\'s layout' },
      { a: 'g1', b: 'qiblai', clear: 36, src: 'PLAN.md section 2.4' },
      { a: 'eye', b: 'tears', clear: 52, src: 'the post at 12 m' }],
    must: [['beacon', 'erehwon'], ['eye', 'qiblai'], ['eye', 'beacon']],
    note: 'the Beacon cannot see Erehwon (-646 m): the Eye is its relay to the capital. The Rim Post also sees G1 (+106 m) and the Tempest (+28 m): a second road to the south, for the Beacon\'s session'
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
  const rota = { watch: 24, perWatch: 4, watches: 6, note: 'the Rim Watch: 24 of the chapter on rota, a week on the rim and three weeks down; four on the rim at a time (their bunks at the bench count, the hut\'s do not)' };

  return { frame, crater, band, lipU, zones, walls, gates, links, parts, ways, sights, line, water, census, benchGroups, footGroups, rota };
})();
if (typeof module !== 'undefined') module.exports = FE_LAYOUT;
