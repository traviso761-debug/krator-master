/* XS1 of settlements/xanadu/STACK-PLAN.md: Xanadu's S4 ground-layer set (godot/tools/ground_layer_sets/xanadu.json) and
   the xanadu route's stops (tools/route_tracks/xanadu.json), checked against the library, the regions' data, the pages'
   views and the kit's blocks. Data only: nothing here is packed or run before Stage 8 (the owner, 2026-11-22).
     node settlements/xanadu/tests/test-xs1-stack.js */
'use strict';
const fs = require('fs'), path = require('path');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');
const rd = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const json = rel => JSON.parse(rd(rel));
const has = rel => fs.existsSync(path.join(ROOT, rel));

/* ---- the S4 set ---- */
// the roles godot/shaders/terrain.gdshader gives the layer indices (claude/vertical-stack: "0=lush grass, 1=forest moss,
// 2=High Rift/alpine turf, 3=gravel/scree, 4=granite, 5=flagstone", picked by base, wet-and-hollow, altitude, the pave zone's
// green and talus, rock, the pave zone's red)
const ROLES = ['base', 'wet', 'high', 'gravel', 'rock', 'pave'];
const GLOBAL0 = { library: 'ground.grass.lush', tile_m: 1.65 };   // pack_ground_layers.py's LAYERS[0] (the stack)
const fields = rd('core/world/41-world-fields.js');
const PAL_KEYS = (fields.slice(fields.indexOf('const PAL={')).match(/\n\s*desert:\s*\{([^}]*)\}/)[1].match(/(\w+):/g) || []).map(k => k.slice(0, -1));
const PROMPTS = rd('core/materials/PROMPTS-NEEDED.md');

function libSet(id) {   /* the library set's maps, each a file (a pointer counts: the set is in the library) */
  const d = 'core/materials/library/' + id, mp = d + '/meta.json';
  if (!has(mp)) return 'no library set ' + id;
  const maps = JSON.parse(rd(mp)).maps || {};
  for (const k of ['map', 'normalMap', 'roughnessMap'])
    if (!maps[k] || !has(path.posix.normalize(d + '/' + maps[k]))) return id + ' has no ' + k;
  return null;
}

function checkSet(S) {
  const e = [];
  if (S.format !== 'krator-ground-layer-set' || S.version !== 1) e.push('format');
  if (!Array.isArray(S.layers) || S.layers.length !== ROLES.length) { e.push('six layers, one a role'); return e; }
  const names = new Set();
  S.layers.forEach((L, i) => {
    if (L.index !== i) e.push('layer ' + i + ' has index ' + L.index);
    if (L.role !== ROLES[i]) e.push('layer ' + i + ' is ' + L.role + ', the shader\'s slot is ' + ROLES[i]);
    if (!(L.tile_m > 0)) e.push(L.name + ': tile_m');
    if (names.has(L.name)) e.push(L.name + ' twice'); names.add(L.name);
    const m = libSet(L.library); if (m) e.push(L.name + ': ' + m);
    (L.palette || []).forEach(k => { if (!PAL_KEYS.includes(k)) e.push(L.name + ': palette slot ' + k + ' is not core/world\'s'); });
  });
  (S.held || []).forEach(H => {
    if (H.owed) {
      if (!PROMPTS.includes('`' + H.library + '`')) e.push(H.name + ': ' + H.library + ' owed but not in PROMPTS-NEEDED.md');
      if (!H.standIn || libSet(H.standIn)) e.push(H.name + ': an owed set needs a stand-in in the library');
    } else if (libSet(H.library)) e.push(H.name + ': ' + libSet(H.library));
  });
  if (!S.plumeCard || !has('core/materials/library/' + S.plumeCard.library + '/meta.json')) e.push('the plume card');
  return e;
}

const SET = json('godot/tools/ground_layer_sets/xanadu.json');
const setErr = checkSet(SET);
T.ok('the xanadu S4 set: six layers in the shader\'s six roles, each set in the library with its three maps', setErr.length === 0, setErr.join('; '));
T.ok('its layer 0 is the global set\'s layer 0 (a region on two styles meets without a seam)',
  SET.layers[0].library === GLOBAL0.library && SET.layers[0].tile_m === GLOBAL0.tile_m);
T.ok('it is keyed by the xanadu overlay, in every Xanadu region\'s data', SET.set === 'xanadu' && SET.style.overlay === 'xanadu' &&
  SET.regions.every(r => (json(r + '/data/region.json').biomes || []).some(b => String(b.name).toLowerCase() === 'xanadu')));
{
  // after Stage 8 merges the stack, core/world names the overlay's style and palette: then they must be the set's
  const bg = fields.match(/'xanadu':\[\s*'(\w+)',\s*'(\w+)'\s*\]/);
  T.ok('core/world maps the xanadu overlay to the set\'s style and palette (once the stack is merged)',
    !bg || (bg[1] === SET.style.worldStyle && bg[2] === SET.style.palette), bg ? bg[0] : 'not merged yet');
}
T.ok('the brief\'s grounds each have a layer: lake shore, terraces, valley floor, courtyard paving, alpine, and the caldera rock',
  ['lake_shore', 'terrace', 'valley_floor', 'court_paving', 'alpine', 'caldera_rock'].every(n => SET.layers.some(L => L.name === n)));
T.ok('the paving layer takes the set the Xanadu kit\'s court tiles take (xTiles)',
  SET.layers[5].library === json('kits/xanadu/materials.json').families.xTiles.lib);

const clone = o => JSON.parse(JSON.stringify(o));
const setClean = S => checkSet(S).length === 0;
const swap = clone(SET); [swap.layers[1], swap.layers[3]] = [swap.layers[3], swap.layers[1]];
T.neg('a layer out of its shader slot is caught', setClean, swap, SET);
const missing = clone(SET); missing.layers[4].library = 'rock.no.such.tuff';
T.neg('a layer whose library set is not there is caught', setClean, missing, SET);
const seven = clone(SET); seven.layers.push(Object.assign(clone(SET.layers[2]), { index: 6, name: 'extra' }));
T.neg('a seventh layer is caught (six, so the shader\'s slots and samplers do not move)', setClean, seven, SET);
const owed = clone(SET); owed.held[0].library = 'ground.paddy.unprompted';
T.neg('an owed set with no prompt in PROMPTS-NEEDED.md is caught', setClean, owed, SET);
const pal = clone(SET); pal.layers[2].palette = ['alpine'];
T.neg('a palette slot core/world does not have is caught', setClean, pal, SET);

/* ---- the route ---- */
const ROUTE = json('tools/route_tracks/xanadu.json');
const IDS = ['city_block', 'water_ground', 'forest_edge', 'door_transition'];   // the stack's four stops
const buildOf = page => page.split('/dist/')[0];
function viewIn(page, name) {   /* the page's views fragment names the view: V['name'] in its build's targets/ or src/ */
  const lit = "V['" + name + "']";
  const walk = d => !has(d) ? false : fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).some(f =>
    f.isDirectory() ? walk(d + '/' + f.name) : f.name.endsWith('.js') && rd(d + '/' + f.name).includes(lit));
  return walk(buildOf(page) + '/targets') || walk(buildOf(page) + '/src');
}
const kitBlocks = fs.readdirSync(path.join(ROOT, 'kits/xanadu/src')).filter(f => f.endsWith('.js')).map(f => rd('kits/xanadu/src/' + f)).join('\n');
const regionOf = page => page.startsWith('openworld/') ? buildOf(page) : null;
const sitesOf = reg => new Set((json(reg + '/data/region.json').sites || []).map(s => s.id));

function checkPose(P, route) {
  const e = [];
  if (!P || !route.kinds[P.kind]) return ['unknown kind ' + (P && P.kind)];
  if (!has(P.page)) e.push('no page ' + P.page);
  if (P.kind === 'page_view' && !viewIn(P.page, P.view)) e.push(P.page + ' has no view ' + P.view);
  if (P.kind === 'page_block' && !kitBlocks.includes("key:'" + P.block + "'")) e.push('no kit block ' + P.block);
  if (P.kind === 'page_block' && !(P.eye && P.eye.length === 3 && P.target && P.target.length === 3)) e.push('a block pose is eye and target');
  if (P.kind.startsWith('openworld_site')) {
    const reg = regionOf(P.page);
    if (!reg) return e.concat(['a site stop runs on a region page']);
    const S = sitesOf(reg);
    if (!S.has(P.site)) e.push(reg + ' has no site ' + P.site);
    if (P.kind === 'openworld_site_shore') {
      if ((P.toward == null) === (P.bearing == null)) e.push('a shore stop goes toward a site or on a bearing');
      if (P.toward != null && !S.has(P.toward)) e.push(reg + ' has no site ' + P.toward);
      if (!(P.look > 0)) e.push('look');
    }
    if (!(P.agl > 0)) e.push('agl');
  }
  return e;
}
function checkRoute(R) {
  const e = [];
  if (R.track !== 'xanadu' || JSON.stringify(R.hours) !== '[12,16.33,22]') e.push('the track and the stack\'s three hours');
  if (JSON.stringify(R.stops.map(s => s.id).sort()) !== JSON.stringify(IDS.slice().sort())) e.push('the four stops');
  R.stops.forEach(s => {
    checkPose(s.web, R).forEach(x => e.push(s.id + ': ' + x));
    if (!s.godot || !/^world-xanadu-/.test(s.godot.case)) e.push(s.id + ': a Godot case of a Xanadu region');
    if (s.fallback) checkPose(s.fallback.web, R).forEach(x => e.push(s.id + ' (fallback): ' + x));
  });
  return e;
}
const routeErr = checkRoute(ROUTE);
T.ok('the xanadu route: four stops at the three hours, each on a page, view, block or site that exists', routeErr.length === 0, routeErr.join('; '));
T.ok('the city block and the door are in Erewhon\'s citadel', ROUTE.stops.filter(s => /city_block|door_transition/.test(s.id))
  .every(s => s.web.page === 'settlements/xanadu/dist/erewhon.html'));
{
  // XS2's room graph (claude/citadel-room-graph) names the Vizier's garden-face arches cit.vizier.d.loggia.garden.<n>: the
  // door stop takes the middle one, and its pose stands outside it (block z over the arches' 10) looking in (under it)
  const D = ROUTE.stops.find(s => s.id === 'door_transition');
  T.ok('the door stop crosses XS2\'s portal from the Vizier\'s garden into its loggia',
    /^cit\.vizier\.d\.loggia\.garden\.\d+$/.test(D.door) && D.web.eye[2] > 10 && D.web.target[2] < 10, D.door);
}

const routeClean = R => checkRoute(R).length === 0;
const badSite = clone(ROUTE); badSite.stops.find(s => s.id === 'forest_edge').web.site = 'sxanlknosuch01';
T.neg('a stop on a site the region does not have is caught', routeClean, badSite, ROUTE);
const badView = clone(ROUTE); badView.stops.find(s => s.id === 'city_block').web.view = 'Citadel — the Golden Stair';
T.neg('a stop on a view the page does not name is caught', routeClean, badView, ROUTE);
const badBlock = clone(ROUTE); badBlock.stops.find(s => s.id === 'door_transition').web.block = 'xa_cit_wazir';
T.neg('a stop on a block the kit does not define is caught', routeClean, badBlock, ROUTE);
const both = clone(ROUTE); both.stops.find(s => s.id === 'water_ground').web.bearing = 90;
T.neg('a shore stop with both a site and a bearing is caught', routeClean, both, ROUTE);
const three = clone(ROUTE); three.stops.pop();
T.neg('a route without the stack\'s four stops is caught', routeClean, three, ROUTE);

T.done();
