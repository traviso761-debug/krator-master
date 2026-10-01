# Known issues

- Vendored drift from `settlements/reedlake/src`: `93-labels.js` also labels `cls:'vessel'` and shrinks the font before truncating a long name; `92-camera.js` starts with the Labels button off. `00-head.html` has its own title.
- No life-layer pathing or collision; decks are not walkable surfaces for the walk mode.
- The swell is a heightfield of four sines (no Gerstner crests, no whitecaps); it fades flat 440-600 m from the
  roadstead's centre, so the far sea is the old flat plane with the scrolled normal map.
- Sail flutter moves only the cloth (at most 0.12 m, along the belly side): sheets, ropes and edge tubes stay at the
  rest pose, so a rope's end can sit a few centimetres off a fluttering clew. Pennants and flags do not move.
  The sails do not trim to the wind or the heading.
- Under way: every vessel makes the same speed and wraps round its row, so it pops from the east end of the row to
  the west end (and a preset view following it jumps with it). Labels are baked at station and do not follow.
  Turning it off puts every vessel back on station at once. Heading is always east; there is no turning.
- The verify invariants (vessels-float, no-vessel-overlap, sails-*) check the rest pose at station, not the swell
  or under-way poses.
