# Known issues

- Vendored drift from `settlements/reedlake/src`: `93-labels.js` also labels `cls:'vessel'` and shrinks the font before truncating a long name; `92-camera.js` starts with the Labels button off. `00-head.html` has its own title.
- Vessels ride at anchor while their oars stroke: there is no forward motion or wake yet.
- The sea is a flat plane with a scrolled normal map; hulls heave and roll, the water does not.
- Sails are single-sided cloth with no wind animation.
- No life-layer pathing or collision; decks are not walkable surfaces for the walk mode.
