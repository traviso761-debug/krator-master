## 5v. A biome that is mostly a rule laid over another kit's flora (the Cut, Oct 2026)

The Cut (`biomes/cut`) is the bowl an Ancient eigenweapon left in the Inner Wall: its flora is warped, more toward the
centre, mostly harmlessly. Built in one session as three stations (the floor by the lake, the wall over the crater mouth,
the cut face at the lip), most of its trees are another kit's (`biomes/nwlowlands`, `biomes/nhighlands`, read in place), with
five natives of its own. What held up:

- **Ask the owner first, in one batch, and build what does not wait on the answers.** Four questions before the first fragment
  (the lore's wording, how a culture's camp is drawn in a biome kit, the one surface with no texture, the scope); the owner
  answered in a minute and changed two (the camp as props *tagged for a future settlement kit*; a new texture, not a
  reuse). The prompt went into `PROMPTS-NEEDED.md` at once; the owner pasted the image back in the same session, so it was
  processed, judged on a contact sheet and wired before the station that needs it.
- **The rule is data, tested in node before any page.** The warp is one fragment with no three.js (`41-cut-field.js`: the
  bowl, the field, each effect as a plain function of position) and a node test that pins it: strength 1 at the centre and
  0 at the lip on every bearing, unit and orthogonal axes, the rings alternating, and a fingerprint of the warp's draws for
  2,000 plants (every draw a KRAND hash of where the plant stands, so the fingerprint is the same on every run and machine).
  The page's checks then test the rule where it was applied (every culm leaning along the field by its angle; a grove's
  nodes on one set of levels; three melon sizes and the stuck share; no two lichen circles touching), each with a broken
  input that must fail.
- **Warp another kit without editing it.** A runtime-LOD kit sets `BIO.owner = [foot]` before it builds each tree; an
  accessor on `BIO.owner`, installed only while that kit's `buildTrees` runs, sees each new foot, so the span of instances and
  bucket triangles since the last foot is exactly one tree. Transform the span about its foot (lean, stretch, the dense air's
  habit, the size step), take a bite out of its foliage, or truncate the whole span (the station keeps only the species the
  plan names for its ring). Two things follow a moved tree: its **registered volume** (move and widen it, or the probe's
  "registered volumes non-empty" fails on the leaned ones) and its name (a dropped tree must not stay registered).
- **The survey is the ground; a sky ridge is a curtain.** Each page reads the bowl from one function on the 4.22 survey
  (lip radius and height by bearing, the floor's cap whose low contours are the lakes), so the station's terrain, its far
  ground and its horizon agree. The first horizon was the shared sky's ridges cast from that function: fine looking up at
  walls, wrong looking *down* from the lip, because a ridge layer covers everything below its crest (the floor 6 km below
  came out in the far walls' colour). The whole bowl is now a coarse vertex-coloured skirt to 120 km (lakes, salt, green
  walls, bare faces, snow), the camera's far plane reaching it, and the ridges carry only the land past it. Check the
  skirt's winding: culled backwards it is invisible and the sky's pale horizon shows through, which looks like snow.
- **Budget by tiers from the first look.** One dense culm mesh at every range was 21M triangles held; three LOD tiers on
  the core's runtime ranges (near in full, mid with two rows an internode, far one row) and sprays thinning with distance
  made it 9M held, 3-4M drawn. Count what a planner places before drawing it: the melon terraces' first plan was 186,000
  fruit (33M triangles).
- **Pitfalls with their fix.** A set filed under `leaf` (`leaf.forest_leaves_02`) loads clamped through `KMAT.textures`, like a
  card: as a tiled ground layer it smears into regular stripes, so set `RepeatWrapping` yourself (find it by zeroing the
  layer weights, then the layers one by one). A procedural detail map that does not tile shows its seam every tile: take the
  library's `groundDetail`. Pages in a hidden browser pane do not render: read `SKY.state` only after calling the view
  subscriber yourself, or a "dusk" view reports the sun from the last frame drawn. A culm's geometry tapers to a tip: a cut
  length (a stack in a camp) needs a flag for square ends, or the stacks look like pencils.
