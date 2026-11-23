// node core/world/test-travel.js: travel on the open world's links (48t-world-travel.js, phase S5 of
// core/simulation/PROPOSAL-LONGSONG-PINNACLE.md), on two regions' baked plans read in place: the Oidong Valley and the High
// Rift (openworld/oidong-highrift: the Order's road, four links with inns, rest stops and bridges) and the Iziz cluster
// (openworld/iziz-cluster: Mav's Refuge to Girder to Talia). Each check has a negative that must fail.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
global.window = global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'core/world/48t-world-travel.js'), 'utf8'), { filename: '48t-world-travel.js' });
const plan = r => JSON.parse(fs.readFileSync(path.join(ROOT, 'openworld', r, 'plan', 'sites.json'), 'utf8'));
const OH = plan('oidong-highrift'), IZ = plan('iziz-cluster');
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };
const km = m => (m / 1000).toFixed(1) + ' km', d = m => (m / 1440).toFixed(1) + ' d';
const PACK = { kmDay: 25, hours: 8 }, RIDE = { kmDay: 45, hours: 8 };
const G = KTRAVEL.graph([OH, IZ]);
const L = 'sq80bzd7ep', GJ = 'ssinggjar01', MAV = 'skukf2qmmq', GIR = 'seed07', TAL = 'sor1zqih8x';

// 1. the graph: a node for every site and stop, the links cut at their stops, every stretch's length summing to its link's
{ const links = OH.links.concat(IZ.links), stops = links.reduce((n, l) => n + (l.stops || []).length, 0), sites = OH.sites.length + IZ.sites.length;
  const sums = links.map(l => { const s = G.edges.filter(e => e.link === l.id).reduce((a, e) => a + e.length_m, 0); return Math.abs(s - l.length_m); });
  const G2 = KTRAVEL.graph([OH]);
  ok('a node for every site and stop; each link\'s stretches sum to its length', Object.keys(G.nodes).length === sites + stops && G.edges.length === stops + links.length && Math.max(...sums) < 1,
    Object.keys(G2.nodes).length !== sites + stops, Object.keys(G.nodes).length + ' nodes, ' + G.edges.length + ' stretches; worst sum off by ' + Math.max(...sums).toFixed(2) + ' m'); }
// 2. per-leg minutes from the ground: a stretch that climbs takes longer up than down, a flat one the same both ways
{ const E = G.edges.slice().sort((a, b) => (b.up_m - b.down_m) - (a.up_m - a.down_m))[0], up = KTRAVEL.legMinutes(E, 1, PACK), down = KTRAVEL.legMinutes(E, -1, PACK), flat = E.length_m / 1000 / (PACK.kmDay / PACK.hours) * 60;
  ok('the steepest-climbing stretch takes longer up than down, and longer than its flat time', up > down * 1.15 && up > flat, !(KTRAVEL.legMinutes(E, 1, PACK) <= flat),
    E.id + ': ' + km(E.length_m) + ', up ' + Math.round(E.up_m) + ' m, down ' + Math.round(E.down_m) + ' m; ' + Math.round(up) + ' min up, ' + Math.round(down) + ' down, ' + Math.round(flat) + ' flat'); }
// 3. multi-hop: Longsong to the Singing Gjar has no link of its own: by the Caldron House and the Mirror Grange
{ const P = KTRAVEL.path(G, L, GJ, PACK), links = [...new Set(P.legs.map(l => l.link))], N = KTRAVEL.path(G, L, GJ, PACK, { avoid: ['smirrorgrange01'] });
  const want = ['scaldronhouse01', 'smirrorgrange01', 'ssinggjar01'].map(b => (OH.links.find(l => l.id.endsWith('/link/' + b)) || { length_m: NaN }).length_m).reduce((a, n) => a + n, 0);   /* the three links' baked lengths: a re-bake of the roads moves them */
  ok('Longsong to the Singing Gjar: three links, by the Caldron House and the Mirror Grange', links.length === 3 && P.legs[0].a === L && P.legs[P.legs.length - 1].b === GJ && Math.abs(P.length_m - want) < 5,
    N === null, links.join(' > ') + '; ' + km(P.length_m) + ', up ' + Math.round(P.up_m) + ' m'); }
// 4. inns as stops: the pack train sleeps at a caravanserai or a rest stop on most nights of the road, the riders likewise
{ const P = KTRAVEL.path(G, L, GJ, PACK), atStop = P.nights.filter(n => n.kind === 'inn' || n.kind === 'rest').length, camps = P.nights.filter(n => n.kind === 'camp').length;
  const Pr = KTRAVEL.path(G, L, GJ, RIDE);
  const G0 = KTRAVEL.graph([Object.assign({}, OH, { links: OH.links.map(l => Object.assign({}, l, { stops: [] })) })]), P0 = KTRAVEL.path(G0, L, GJ, PACK);
  ok('the nights at the inns and rest stops: most of the pack train\'s nights under a roof', atStop >= 0.8 * P.nights.length && P.days > 20,
    P0.nights.every(n => n.kind !== 'inn' && n.kind !== 'rest'), P.days + ' days (' + atStop + ' nights at a stop, ' + camps + ' camped); the riders ' + Pr.days + ' days'); }
// 5. a door-to-door time: nights x a day plus the last day's march; a faster column is fewer days
{ const P = KTRAVEL.path(G, MAV, TAL, PACK), Pr = KTRAVEL.path(G, MAV, TAL, RIDE);
  ok('Mav\'s Refuge to Talia by Girder: door to door is the nights and the last day\'s march; the riders are quicker', P.legs.some(l => l.b === GIR || l.a === GIR) && P.minutes > (P.days - 1) * 1440 && P.minutes <= (P.days - 1) * 1440 + PACK.hours * 60 + 1e-6 && Pr.days < P.days,
    KTRAVEL.path(G, MAV, TAL, { kmDay: 10, hours: 8 }).days > P.days, d(P.minutes) + ' for the pack train (' + Math.round(P.moving / 60) + ' h on the move), ' + d(Pr.minutes) + ' for riders; ' + km(P.length_m)); }
// 6. the bridges: each stretch knows the bridges on it, and a path lists the ones it crosses
{ const P = KTRAVEL.path(G, L, GJ, PACK), crossed = P.legs.reduce((a, l) => a.concat(l.bridges), []), onRoute = OH.bridges.filter(b => /scaldronhouse01|smirrorgrange01/.test(b.road) && !/sfgtxw10kr/.test(b.road)).length;
  const toStrong = KTRAVEL.path(G, L, 'sfgtxw10kr', PACK).legs.reduce((a, l) => a.concat(l.bridges), []);
  ok('the bridges: the road to the gjar crosses every bridge on its three links and none of Strongbow\'s', crossed.length === onRoute && crossed.every(b => !/sfgtxw10kr/.test(b)),
    toStrong.length === 4, crossed.length + ' bridges crossed; ' + toStrong.length + ' on the road to Strongbow'); }
// 7. no road between two plans' sites: the two regions do not join
{ const P = KTRAVEL.path(G, L, MAV, PACK), G3 = KTRAVEL.graph([OH, IZ], { extra: [{ id: 'planned', a: 'sfgtxw10kr', b: MAV, length_m: 1e6, planned: true }] }), P3 = KTRAVEL.path(G3, L, MAV, PACK);
  ok('two regions not joined have no path between them; a planned leg joins them, marked', P === null && P3 && P3.legs.some(l => l.planned), P3 !== null, P3 ? km(P3.length_m) + ' with the planned leg' : ''); }
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK'); process.exit(bad ? 1 : 0);
