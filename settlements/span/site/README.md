# settlements/span/site

`swhighlands-pillars-site.json`: SW highlands station 4's (the pillar rim's) published site record, the one thing Span reads of
the station (`biomes/swhighlands/BIOME-API.md`, "Station 4's site"; format `swhighlands-pillars-site`, version 1). `build.py`
hands it to the page as `SPAN_SITE` (fragment `29a-span-site.js`); `test-span.js` and `layout_dump.js` read it the same way.
The layout (`src/30-span-layout.js`) checks the format and version and stops on any other.

To refresh it after the station changes: open the station's page (`biomes/swhighlands/dist/swhighlands-pillars.html`) and use its
`site` exporter, or run `window._api.site()` there, and write the JSON here. Then `python3 build.py`, `node test-span.js`,
`python3 verify.py dist/span.html --assert`, `python3 span_blueprint.py`.

Exported 2026-10-27 from the station's page built at `claude/swhighlands-s1-04f512` b12ccda53 (the eroded cliff: a caprock over a
badland apron, the rim's `floor` on the apron; 32 towers and 5 arches). Span does not draw the arches.
