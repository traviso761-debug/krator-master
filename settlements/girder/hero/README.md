# Girder · Hero

Girder with Styv, a third-person character you order about, and Phil to talk to. Same world, same fragments; the
output is a separate page, `girder-hero.html`. `girder.html` is not touched.

```
cd settlements/girder
python3 build_hero.py                      # writes girder-hero.html
```

## Controls

| Input | Does |
|---|---|
| Right click | Styv walks there (a ring marks the spot) |
| Double right click | runs there |
| Hover someone | their name and a speech-bubble icon, if they have something to say |
| Right click them | Styv walks up, they turn to each other, the dialogue box opens |
| Any click (or Space / Enter) | next line; closes after the last. Esc closes |
| Left drag / wheel | orbit / zoom round him (right drag still pans) |
| H | free camera (Girder's fly camera; clicks stop ordering) and back to following |
| G | Girder's first-person walk mode, as before |

## Files

| File | What |
|---|---|
| `../build_hero.py` | wraps `build.py`: adds the fragments below, writes `girder-hero.html` and `hero/build-manifest.json` |
| `88-hero.js` | the body: model loading (`rig`), routing, movement, clips, the follow camera and its collision. Read its header |
| `89-talk.js` | the controls, the cast (`TALK_PEOPLE`), name tags, the dialogue box and its portrait. Read its header |
| `styv.glb`, `phil.glb` | the models (~3 MB each): one skinned mesh, JPEG textures, clips. Embedded as base64 by name (`HERO_GLB`, generated) |
| `prep_model.py` | makes a GLB from a Meshy export zip (one ~25 MB GLB per clip) |

The models were made with:

```
python3 hero/prep_model.py "styv (2).zip" hero/styv.glb idle=Idle_03 walk=Walking run=Running
python3 hero/prep_model.py phil.zip hero/phil.glb idle=Idle_02
```

Styv's export has more clips (Agree_Gesture, Angry_Ground_Stomp_2, Punch_Combo, Punch_Combo_5, Shouting_Angrily,
Stand_Talking_Angry) and Phil's more idles (Idle_3, Idle_4, Idle_6); add any as `name=Suffix` and rebuild.

**Adding someone to talk to:** pack their model into `hero/<id>.glb`, add a row to `TALK_PEOPLE` at the top of
`89-talk.js` (`{ id, name, model, x, z, yaw, lines:[...] }`), rebuild. Phil stands in the assembly hall, south of
the hearth, facing the south door.

## Notes

- **Routing** uses Girder's `NAV` graph without its lift edges, so towers are climbed by the switchback stairs. The
  body uses the walk mode's solids, so it cannot pass through walls, people or off decks. Where the graph is wrong
  it detours on a 0.5 m grid or plans again without those nodes.
- **The follow camera** tests the walk mode's solids along its line (a scene ray costs 40-200 ms here) and comes in
  close and low under a roof the solids do not model (the hall, houses, shelters, stalls).
- **The portrait** is the scene drawn from a camera in front of the speaker's face, once, when the box opens.
- **GLTFLoader** comes from the jsDelivr CDN (three r128's), loaded after the page builds, as three.js itself is.
- The page is 20.5 MB (Girder alone is 12.5 MB). **The gallery** (https://claude.ai/artifact/UhTfQ2kioZEbrzZR1agHv9,
  `worlds/girder.html`) takes at most 16 MB a file, so it gets a page that fetches the models from beside itself:
  `python3 build_hero.py --models-url girder- --out <dir>/girder.html` writes the page and, beside it,
  `girder-styv.glb.txt` and `girder-phil.glb.txt` (the GLBs as base64 text: the gallery serves only web types, not
  `.glb`); publish all three (12.4 MB + 2 × 4 MB). Fetching needs a web server: that page does not work opened from disk.
- Not done: riding the lifts, Styv using his gesture or talking clips in conversation, branching dialogue.
