# Voth — pass 5 brief

Four changes, taken from an annotated Overview screenshot. **All four are
planner work.** Every one of them moves layout objects that later passes are
clipped against, so none of them is delegable to a subagent, and they go in
the order below with a re-baseline after each.

Read `API.md` and `SUBAGENT.md` first.

---

## 1. Lighthouse canton (replaces the lighthouse islet)

The islet currently at **(-240, -780)**, kind `'light'` — index 2 in the
`ISLES` list rebuilt in `src/30-layout.js` — becomes a new canton.

- **New canton `Lighthouse`**, `kind:'plat'`, in the same position. Size it
  between the rim cantons and the monumental pair: `r` around 150.
- It carries a **tall lighthouse tower**, almost as tall as Temple. Temple's
  `top` is 156 with a 34 dome, so the lighthouse should reach roughly
  **140–150** above the deck. Slender — a tapering `FR3` or `FR6` spire with a
  lamp housing, not a fat tower.
- **Remove the shoal chain.** The six-islet chain generated off the promontory
  tip (currently indices 8–13, from about (-651,-341) to (-245,-676)) goes
  entirely. It existed to read as the promontory's axis continued; the
  causeway now does that job.
- **Connect it to land by a causeway**, running south-west to the promontory
  shore near the tip at **(-545, -317)** — arc length `S_10` ≈ 8026. Use the
  existing `CAUSEWAYS` mechanism so it gets the same treatment as the others
  (see change 2 — it should be a reclaimed-land causeway, not a span).
- **No chinampas north-west of it.** The bed generator must treat the
  Lighthouse canton as a hard northern limit on that side: nothing beyond it
  going north-west, in addition to the existing rule that beds skirt but do
  not cover the deep middle.

Watch: `cantons-afloat` will now check eleven cantons. The chinampa clearances
read `CANTONS` and `ISLES`, so bed counts will move — that is expected here,
unlike in a chinampa-only pass.

## 2. Reclaimed-land causeways

Six canton-to-shore links become **solid reclaimed land** — earth moles with
revetted edges — rather than elevated bridge decks:

`Arsenal` · `Guild` · `Foreign` · `Granary` · `Market` · `Arena`

Leave alone:
- the **canton-to-canton spans** (`SPANS`) — these stay as bridges
- **Ancestry** and **Port** causeways — not marked, ask before changing
- the two **river bridges** (`RBRIDGES`)

The stepping-stone islets currently generated under the longer causeways
(kind `'step'`) become redundant on any link that is now solid ground; remove
them for those six.

Reclaimed land means the causeway raises the lake bed to just above the
waterline along its length, with a built edge, rather than standing on piers.
Chinampas already clip against causeways — check the clearance still reads
correctly once they are wide solid banks rather than thin decks.

## 3. More clan compounds on the south-west shore

Five more compounds, **inland of the southern shore**, in the stretch between
seven o'clock and five o'clock — arc length roughly **s = 10,000 to 11,300**
(`S_7` = 9968, `CITY_S0` = 11168, `S_5` = 11312), set back from the waterline
rather than on it.

Placement does not need to be exact. Spread them along that arc with the
irregular spacing the existing compounds have.

Each gets the standard treatment: high walls, 2–3 main buildings, a courtyard
or garden. Around each, **a few smaller Velothi buildings**, then a fade into
farmland — the same grain as the existing manors, not a second town.

This is the `manor` / `farm` zone boundary in `zoneAt`, so it may need the
zone to reach slightly further inland there rather than new placement logic
bolted on top. Check that first.

## 4. Extend the slums east

The warren currently stops close to the curtain wall. Extend it **east and
south-east of the walled core, on the north bank of the river** — roughly
world **x 1400–2300, z 400–1400**, subject to what `zoneAt` already says
there.

Same character as the existing warren: dense, small, poor, irregular alleys,
`TONES_POOR`, spilling outward rather than planned. It should thin out at its
outer edge rather than stopping at a line.

Confirm the extent by probing before building — click-to-print coordinates in
the running page, or sample `zoneAt` across that box.

---

## Order and checks

Do these one at a time, building and verifying between each:

```
python3 build.py && \
python3 verify.py voth.html --assert --baseline baseline.json \
        --views "Overview,Promontory,West shore,Chinampas,Slums" --out ./shots
```

1. **Lighthouse canton + shoal chain removal** — biggest change, most
   downstream effects. Re-baseline before moving on.
2. **Reclaimed causeways** — changes what chinampas clip against.
3. **South-west compounds** — placement only.
4. **Slums extension** — placement only.

Expect counters to move on all four; that is the point. What matters is that
only the *expected* ones move. After change 3, `_buildings` and `_compounds`
should move and `_chinampas` should not.

`shore-roundtrip` must keep passing throughout. None of these should touch the
heightmap or the shoreline trace — if a change seems to need that, stop and
say so rather than doing it, because every layout constant in `30-layout.js`
is an arc length along that shore.
