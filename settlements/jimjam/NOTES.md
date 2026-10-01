# Jimjam: round notes

## Round 1–2 (ChatGPT)
The skeleton (vendored Ancients/Iziz engine, core materials and sockets), the `JJ` registry, the helper
gallery (walls, arcade, three dome finishes, staged spires, the sunray plaza, the six shaft patterns), nine
first-pass houses, nine furniture pieces and two placeholder plants. The shafts and columns were approved;
the houses were too alike and the textures did not read as brick or marble.

## Round 2b–3 (Claude, Oct 1 2026)
* **Textures.** Three bugs: the brick texture was painted over solid (`source-atop` covered the mortar);
  textures were stretched over whole faces (no world-unit UVs); colour was applied twice (pre-coloured map
  times a red tint). Rebuilt every surface (`60-jj-mat.js`): real bricks with mortar and per-brick variation,
  veined marble ashlar, plaster, dome scales; `jjWorldUV` tiles boxes and cylinders in metres (cylinders
  carry u × 2π; pattern shafts keep a raw geometry so they still wrap). The shader hook is built with
  `new Function` so its source carries K: three.js keys programs on `onBeforeCompile.toString()`, and the
  vendored `kbake` clone drops a custom cache key.
* **Colour.** Plain hex colours on materials are linear in this renderer, so every untextured surface (ground,
  window panes, wood) rendered far too pale; all are converted from sRGB once.
* **Light.** The sheet faces north under a day-350 morning sun at 40° S, with sun shadows that follow the
  camera target; exposure and fill were lowered so the brick keeps its red.
* **Layout.** Rows and views are generated from each def's `row`, so families can be added in parallel.
* **Buildings**, by five agents working in parallel from `AGENT-BRIEF.md`, each in its own fragment: the
  nine houses rebuilt with their own plans and rooflines; eight shops and the `jimjam` culture pack; inn,
  tavern, caravanserai, library, school and amphitheater; the solstice temple, Raja's palace and the sunray
  plaza; fortress, barracks, the modular walls and demo run, farm field, farmhouses, granary, windmill and
  warehouses.
* **Shared fixes after merging**: sockets drew every mesh twice; the dome finial now scales with its dome;
  material objects get their own instance key; `jjSpire` uses round flared marble rings (it read as a
  pagoda); rows are 56 m apart so eye-level cameras stand clear of the row in front.
* **Verified**: build clean, vendor check clean, `--assert` passes (tag audit, NaN sweep, budgets:
  1.78 M triangles, about 530 draw calls), `solsticeCheck()` ok, and front/eye-level/aerial shots of every
  family looked at.

## Round 3b: z-fighting (Oct 1 2026)
Travis saw flicker on the great plaza, the temple and many podiums. Two causes: (1) about 9,200 pairs of
instanced boxes and flat cylinders had coplanar overlapping faces (paving, decks, caps and inlays laid
exactly in the plane of the podium or wall they sit on); (2) depth precision with a 0.25 m near plane is
centimetres at a few hundred metres. Fixes: `src/63-jj-zfix.js` runs before `kbake`, turns every coplanar
overlap into an edge between two faces, and lifts faces largest-first to the lowest free level (1.2 cm a
level, at most 4 levels); repeated until a scan finds none (`window._zfix.remaining` is 0). The renderer
uses a logarithmic depth buffer. Plain meshes (arch rings, lathes, the amphitheater seating) are not
scanned.
