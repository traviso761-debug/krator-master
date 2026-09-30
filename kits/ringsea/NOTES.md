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
