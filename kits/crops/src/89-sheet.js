/* ==================== the Crops kit: the sheet (a browser page: every crop by what a biome or a point can grow) ==================== */
(function () {
  const app = document.getElementById('app');
  const el = (t, a, kids) => { const e = document.createElement(t); for (const k in a || {}) { if (k === 'text') e.textContent = a[k]; else e.setAttribute(k, a[k]); } (kids || []).forEach(c => e.appendChild(c)); return e; };
  const state = {biome: 'swlowlands', dark: false, sealed: false, nodes: false, group: ''};
  const opts = () => ({works: (state.dark ? ['dark-beds'] : []).concat(state.sealed ? ['sealed-beds'] : []), nodes: state.nodes ? ['iron', 'copper', 'sulfur', 'oil'] : []});
  function draw() {
    app.innerHTML = '';
    const bsel = el('select', {id: 'biome'}, Object.keys(CROPS.BIOMES).map(b => el('option', Object.assign({value: b}, b === state.biome ? {selected: ''} : {}, {text: b}))));
    bsel.onchange = () => { state.biome = bsel.value; draw(); };
    const gsel = el('select', {id: 'group'}, [el('option', {value: '', text: 'every group'})].concat(Array.from(new Set(Object.values(CROPS.BUCKETS).map(b => b.group))).map(g => el('option', Object.assign({value: g}, g === state.group ? {selected: ''} : {}, {text: g})))));
    gsel.onchange = () => { state.group = gsel.value; draw(); };
    const chk = (k, label) => { const i = el('input', Object.assign({type: 'checkbox'}, state[k] ? {checked: ''} : {})); i.onchange = () => { state[k] = i.checked; draw(); }; return el('label', {}, [i, el('span', {text: label})]); };
    const B = CROPS.BIOMES[state.biome];
    app.appendChild(el('h1', {text: 'Crops Kit'}));
    app.appendChild(el('p', {class: 'sub', text: 'What a biome can plausibly grow or make, by warmth, air pressure and aridity (kits/crops/PLAN.md). Badges: wild = native there; rain = rain-fed; irrigated; bed = a dark works the settlement has; node = a mineral dye whose node is in reach.'}));
    app.appendChild(el('div', {class: 'bar'}, [el('label', {}, [el('span', {text: 'biome'}), bsel]), el('label', {}, [el('span', {text: 'group'}), gsel]),
      chk('dark', 'has dark beds'), chk('sealed', 'has sealed beds'), chk('nodes', 'has iron, copper, sulfur and oil nodes'),
      el('span', {class: 'mt', text: 'air: ' + CROPS.ATM[B.atm] + (B.atmNote ? ' (inferred)' : '') + ' · zones: ' + Object.keys(B.zones).join(', ')})]));
    const res = CROPS.forBiome(state.biome, opts());
    const pal = CROPS.palette(state.biome, opts()), grown = CROPS.palette(state.biome, Object.assign({grow: true}, opts()));
    app.appendChild(el('p', {class: 'pal'}, [el('b', {text: 'Dyes it has: '}), document.createTextNode(pal.colours.join(', ') || 'none'),
      document.createTextNode(' · could grow: ' + grown.colours.join(', ') + ' · plaid (own dyes): ' + (CROPS.canPlaid(state.biome, opts()) ? 'yes' : 'no'))]));
    const byGroup = {};
    res.forEach(r => { const g = CROPS.BUCKETS[r.crop.bucket].group; if (!state.group || state.group === g) (byGroup[g] = byGroup[g] || {})[r.crop.bucket] = (byGroup[g][r.crop.bucket] || []).concat([r]); });
    Object.keys(byGroup).sort().forEach(g => {
      app.appendChild(el('h2', {class: 'grp', text: g}));
      Object.keys(byGroup[g]).sort().forEach(b => {
        app.appendChild(el('div', {class: 'bk', text: b + ' · ' + CROPS.BUCKETS[b].what}));
        app.appendChild(el('div', {class: 'grid'}, byGroup[g][b].sort((x, y) => CROPS.HOW_RANK[y.how] - CROPS.HOW_RANK[x.how] || (x.crop.id < y.crop.id ? -1 : 1)).map(r => {
          const c = r.crop, src = c.card && CROPS.CARDS[c.card];
          return el('div', {class: 'c', 'data-id': c.id}, [el('div', {class: 'im'}, src ? [el('img', {src: src, alt: c.name})] : []), el('div', {class: 'nm', text: c.name}),
            el('span', {class: 'tag t-' + r.how, text: r.how + (r.zone ? ' · ' + r.zone : '')}),
            el('div', {class: 'mt', text: CROPS.WARMTH[c.warmth[0]] + '–' + CROPS.WARMTH[c.warmth[1]] + ' · ' + CROPS.ARID[c.arid[0]] + '–' + CROPS.ARID[c.arid[1]] + (c.colour ? ' · ' + c.colour : '')})]);
        })));
      });
    });
  }
  window._api = {CROPS: CROPS, draw: draw, state: state, count: () => document.querySelectorAll('.c').length};
  try { draw(); window._ready = true; } catch (e) { document.getElementById('errs').textContent = String(e && e.stack || e); }
})();
