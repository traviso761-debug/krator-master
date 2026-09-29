# Round 2: CIVIC & PARK, plus two new Gaudí buildings   (agent "civic")
Read `briefs2/_common2.md` first. You own `src/59-civic.js`.

The user's verdict: **"hall of records [can have more colorful ornamentation] … make a Yuni style library and a school
building with heavy gaudi influence."**

## 1. Hall of Records: more colour
Today it is one tone of adobe with white egg finials — you said so yourself. Keep the Djenné massing, but paint it the
way Yuni's rich quarter is painted: `paintcol` panels between the pilasters, a `mosaic` string-course at each floor
line and round the parapet, glazed tile in the recessed potige panels, `GILDC` on the finials and door studs, and a
blue-and-white tiled dado at the plinth. Also: your front stair reads as a ramp from a distance — give it real treads
with a shadow line, and a pair of flanking pylons.

## 2. NEW: the Library of Yuni  (`civic_library`, family `civic`, ~52 x 40 m, up to ~7k tris)
**Yuni-style, heavy Gaudí.** This is where the Order's copies live — the everyday library of the city, not the Vault.
Look at `refimg/18-casa-batllo.jpg`, `19-casa-batllo-painted.jpg`, `20-batllo-amatller-street.webp`, `17-sagrada-familia.jpg`.
What it must have:
- a **bone-column loggia** on the +z front: fat columns that swell at the base and branch at the top into the parabolic
  arches they carry (`F.tube` with a rising radius, then two thinner tubes leaning out of each head), exactly the
  Casa Batlló ground floor;
- **lobed openings**: the big front windows are not rectangles — use `F.archwall` with `pointed` around 1.5–1.8 to get a
  fat, soft, almost circular head, set in a heavy moulded surround;
- a **trencadis facade**: the upper wall speckled in `mosaic` whose colour drifts across it (blue and green low, gold
  high), the way the Batlló wall does;
- an **undulating scaled roof**: a wavy ridge running the length of the building, tiled in `tile`/`mosaic` with the
  colour changing along it, and one bulbous turret with a cross-like finial at one end;
- inside the reading hall (you can show it through the loggia, or give the building an open court): a small hypostyle
  of branching columns holding a vaulted ceiling — the Sagrada nave in miniature;
- a `F.roundWindow` rose over the door, and iron-ish balconies with the Batlló mask profile (a horizontal slab with two
  eye holes) on the first floor.

## 3. NEW: the School  (`civic_school`, family `civic`, ~46 x 30 m, single storey, up to ~4k tris)
**Heavy Gaudí, and the reference is Gaudí's own school:** the Sagrada Família Schools building — a plain brick pavilion
whose walls **undulate in plan** (a sine wave, about ±1 m over a 4 m period) and whose roof is a **warped conoid**: the
ridge line waves up and down while the eaves wave in the opposite phase, so the roof is a ruled surface of straight
timbers that looks liquid. Build it with `F.quad` strips along the wave — this is the one asset where the geometry IS
the design, so get the surface right before adding anything else. Then: a small entrance porch on the +z side with a
parabolic arch; brick in `ADOBEREDC` over `adobe` with a whitewashed dado; simple square windows following the wave; a
bell on a little wrought arch at one end; and a walled play yard with two shade trees (`F.tree`) and a mosaic bench
(`F.sector` in the park manner). A second variant with the wave running the other way and a longer plan is welcome.

## 4. Quality pass, from your own list
Archive fin-piers too wide relative to the slots (CCSE is nearer half and half); the bell tower's bell invisible from
outside; gate-lodge window reveals standing proud (`{noReveal:true}` now exists); bathhouse top view never read;
viaduct front never re-shot after the arch rework; `F.tree` now exists, so drop your private tree helpers where they
were only there to avoid the global `rnd()`.
