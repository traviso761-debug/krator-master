# Notes

## 2026-09-30: first pass
Twelve vessels from Travis's references (Dragons 2 ship and sketches, the Atlantis galley,
traditional boats of Asia and of Polynesia, the fantasy junk sheet), assigned to cultures of
the Ring Sea. One parametric hull (superellipse sections, sheer, rocker, rake, transom, lateral
offset for twin hulls and floats) serves all twelve; sails are ruled surfaces painted on a canvas
fitted to their own 2D outline, so borders follow the edges. ~280k triangles and ~110 draw calls
for the whole sheet.

Lessons: a `//` comment inserted mid-line by a scripted edit silently swallowed the statement
after it (`TSTAT.cur=k`), emptying the per-type stats with a clean error panel; the new
`oars-reach-water` check sampled mid-stroke until each bank was posed at its catch first.

## 2026-09-30: round 2 (Travis's notes)
Reassigned to cultures that sail: trireme and scroll-sail galley to the Hykkousoi, the junk to the Voth
Ordinators (brown-black lacquer, shared by the chitin bireme), the dragon boat to Xanadu with a new
figurehead (`rsDruk`). Iron Republic (landlocked) replaced by an Iziz turtle ship; the salvagers' bireme by
a converted Ancient tug. Swan neck and tail now grow out of the hull; karakoa fighting deck laid solid;
dhoni given a mizzen, chevrons, rods and drying fish. Five new: Hykkousoi siege hexareme, Xanadu baghlah,
Iziz wheel galley (animated wheels), Beast-Rider rookery raft (with flyers), Islander lakatoi.

New invariant `sails-clear-cabins` found the junk's sails through its sterncastle (29 points) and the
galley's through its cabin; both fixed by raising the feet / stepping the mizzen on the castle.
Lesson: vertex colours are linear, so dark hexes render mid-tone; convert them (API.md, Colour).

## 2026-09-30: round 3
Flagship back on its green and gold-wave sails. Iziz ships in the core/sockets livery (orange field, teal
edge, sun disc): turtle ship with orange trim and a boxy superellipse shell, wheel galley with orange
housings, bands, window frames and sun discs. Chitin bireme in the Voth livery (blue fan sails, ash
diamond), blue eyes. The baghlah became the Hykkousoi pearler (diving booms, divers, oyster baskets).
Galley sails no longer overlap. New invariant `sails-clear-sails` (verified: it fails on the old galley,
and it caught the chitin fans and the baghlah lateens, both fixed). Four cargo ships: Voth hulk,
Hykkousoi corbita, Xanadu carrack, Iziz salvage lighter.

## 2026-10-01: the sea moves
The sea is one plane displaced in its vertex shader by four travelling sines (70, 43, 27 and 17 m, deep-water speed,
0.28 m down to 0.05 m), fading flat beyond 440-600 m; its grid is 6 m over the roadstead and stretches to the horizon
(240x240, ~115k triangles). Every hull rides the SAME function (`rsSeaH` on the CPU, `rsSwellGLSL()` on the GPU):
heave from five samples, pitch and roll from their slopes, so long ships average the short waves and canoes follow
them. Sails were already double-sided; they now flutter in the vertex shader, along the belly side only (so the cloth
never swings back through its mast), weighted by the belly profile so the spars, the luff and junk battens stay put;
the flutter vector rides in the sails' unused vertex colour, so `rsBake` needed no new attribute. The **Under way**
toggle (off by default) sails the fleet east at 1.8 m/s, wrapping round each row, with a Kelvin wake strip per vessel
(one InstancedMesh) riding the swell; vessel views follow their vessel.

Overview before: 199 draw calls, 0.52M triangles. After: 199 draw calls, 0.64M triangles (the sea grid);
Opening 189 calls, 0.57M. Under way adds the one wake call (Overview 190 calls at t=40 s, as vessels move). All verify checks pass.
Lesson: the build's name rule rejects a top-level-looking `g=` even inside an IIFE; name such locals distinctly.

## 2026-10-01: the sea, the rig and the decks (KNOWN_ISSUES round)
The swell is now Gerstner: the four waves keep their amplitudes but gain steepness (0.32, 0.26, 0.18, 0.12), so crests
sharpen and troughs flatten. The CPU finds the height at a world point by Newton on the horizontal map (3 steps, exact to
2e-5 m; plain fixed-point needed 6+ for 2 mm), the wake's GLSL by 2. The sea shades its normal and its whitecaps (where the
Jacobian of the horizontal map drops) per pixel at the rest point, each wave faded where it is finer than a pixel, so the
far sea swells to the horizon although the grid's displacement fades out beyond ~600 m. Sail flutter is zero on every
edge (ropes stay on their clews); pennants flutter and swing to the apparent wind; rigs trim about their masts through
per-vertex pivot attributes and a per-vessel material clone (no draw calls). Under way is a racetrack per row: one train
per track, so nothing crosses, nothing pops, and turning it off runs each train home along its own track. Labels and
preset views follow. Walk mode stands on a per-vessel heightfield + body-bin grid built lazily from the baked meshes;
`_api.decks()` publishes it. Verify poses the fleet at several times at rest and under way.

Overview before: 199 draw calls, 0.64M triangles. After: 199 calls, 0.64M (Opening 189, 0.57M): the trim and flags are
material clones, the whitecaps a fragment term. Under way at t=51 s: Overview 191 calls, 0.62M. 20 checks pass, 9 new.
Lessons: rsSailWind and the trim shader both declared `uRsTime` (guard it with `RS_UTIME`); a `//` comment inserted
mid-line by a scripted edit swallowed the rest of the line again (syntax error, page never ready): use `/* */`. A hollow
mast leaves its centre cell empty: the walker's body tests the cell and its four neighbours. Boarding from the water must
ignore the waterline foam ring and the wales, or the walker stands on them inside the hull.

