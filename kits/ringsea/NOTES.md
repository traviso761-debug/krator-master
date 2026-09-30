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
