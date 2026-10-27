# settlements/span/site

`swhighlands-pillars-site.json`: SW highlands station 4's (the pillar rim's) published site record, the one thing Span reads of
the station (`biomes/swhighlands/BIOME-API.md`, "Station 4's site"; format `swhighlands-pillars-site`, version 1). `build.py`
hands it to the page as `SPAN_SITE` (fragment `29a-span-site.js`); `test-span.js` and `layout_dump.js` read it the same way.
The layout (`src/30-span-layout.js`) checks the format and version and stops on any other.

To refresh it after the station changes: open the station's page (`biomes/swhighlands/dist/swhighlands-pillars.html`) and use its
`site` exporter, or run `window._api.site()` there, and write the JSON here. Then `python3 build.py`, `node test-span.js`,
`python3 verify.py dist/span.html --assert`, `python3 span_blueprint.py`.

Exported 2026-10-27 from the station's page built at `claude/swhighlands-s1-04f512` c5dadb8c5 (no trench at the cliff's foot; the slots capped at the
caprock's depth): the table falling toward its edge
(the watch top 225.5 over y0), Span's canyon and reservoir carved by the station in the frame it publishes (`canyon`: M, n, t, u0,
which the layout reads instead of computing), 39 towers and 5 arches (Span draws no arches), `rimFine` (5 m) and `ground` (the
surface as drawn round the watch pillar and its cliff, 2 m, on both sides of the rim: only towers and arches are bodies).
