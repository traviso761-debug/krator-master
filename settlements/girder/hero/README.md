# Girder · Hero

Girder with Styv, a third-person character you order about, and people to talk to (Phil, for now). Same world, same
fragments; the output is a separate page, `girder-hero.html`. `girder.html` is not touched.

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
| A reply (click, or its number key) | picks it, when the box offers replies |
| Left drag / wheel | orbit / zoom round him (right drag still pans) |
| H | free camera (Girder's fly camera; clicks stop ordering) and back to following |
| G | Girder's first-person walk mode, as before |

## Files

| File | What |
|---|---|
| `../build_hero.py` | wraps `build.py`: checks `cast.json`, adds the fragments below, writes `girder-hero.html` and `hero/build-manifest.json` |
| `cast.json` | the hero, the people and the dialogue: data, see below |
| `88-hero.js` | the body: model loading (`rig`), routing, movement, clips, the follow camera and its collision, `navAudit()`. Read its header |
| `89-talk.js` | the controls, the cast's bodies, name tags, the dialogue box, its portrait and the dialogue runner. Read its header |
| `styv.glb`, `phil.glb` | the models (~3 MB each): one skinned mesh, JPEG textures, clips. Embedded as base64 by name (`HERO_GLB`, generated) |
| `prep_model.py` | makes a GLB from a Meshy export zip (one ~25 MB GLB per clip) |
| `slim_glb.py` | shrinks a GLB to about a third for a size-limited host (`build_hero.py --slim`) |
| `PORT.md` | these files against the Godot plan |

The models were made with:

```
python3 hero/prep_model.py "styv (2).zip" hero/styv.glb idle=Idle_03 walk=Walking run=Running
python3 hero/prep_model.py phil.zip hero/phil.glb idle=Idle_02
```

Styv's export has more clips (Agree_Gesture, Angry_Ground_Stomp_2, Punch_Combo, Punch_Combo_5, Shouting_Angrily,
Stand_Talking_Angry) and Phil's more idles (Idle_3, Idle_4, Idle_6); add any as `name=Suffix` and rebuild.

## Cast and dialogue (`cast.json`)

```json
{
  "hero":   { "id": "styv", "name": "Styv", "model": "styv" },
  "people": [ { "id": "phil", "name": "Phil", "model": "phil", "x": 0, "z": 2.7, "yaw": 0, "talk": "phil" } ],
  "dialogue": {
    "phil": [
      { "say": "Buy me a drink and I'll tell you 'bout my time in the Izani secret service." },
      { "who": "styv", "say": "What's in it for me?" },
      { "say": "The story of the tattoo.", "choose": [
          { "text": "One drink. Talk.", "go": "phil-story" },
          { "text": "Not today.", "go": null } ] }
    ],
    "phil-story": [ { "say": "It was the night of the eclipse..." }, { "go": "phil-end" } ],
    "phil-end":   [ { "who": "styv", "say": "And?" }, { "say": "Another drink and you'll hear the rest." } ]
  }
}
```

(That is a sample; the committed `cast.json` has Phil's one line.)

- **people**: `model` is a `hero/<model>.glb`; `x`, `z` place them on whatever floor is there; `yaw` 0 faces +z (south);
  `talk` is the conversation a right click starts. Someone without `talk` stands there, solid, with no speech bubble.
- **A conversation** is a list of steps, played in order and closed after the last:
  - `{ "say": "..." }`: the person being talked to says it;
  - `{ "who": "<id>", "say": "..." }`: someone else says it (the hero's id, or a person's); the portrait switches to them;
  - `{ "say": "...", "choose": [{ "text": "...", "go": "<conversation>" | null }] }`: the player picks a reply; `go`
    carries on in that conversation, `null` ends it;
  - `{ "go": "<conversation>" }`: carry on there.
  A `note` key is allowed anywhere for comments.
- `build_hero.py` checks the file and stops on a missing model, an unknown `talk`, `go` or `who`, a reply with no text,
  or a step that is none of the shapes above. Try a draft without touching the real file:
  `python3 build_hero.py --cast draft.json --out draft.html`.

Not there yet, and each a small step on this format: remembering what was said (a conversation per visit, flags a
`choose` can set and a step can test), Styv's talking and gesture clips during a conversation, people who walk a
route instead of standing, more than one hero.

## Notes

- **Routing** uses Girder's `NAV` graph without its lift edges, so towers are climbed by the switchback stairs. The
  body uses the walk mode's solids, so it cannot pass through walls, people or off decks. Where the graph is wrong
  it detours on a 0.5 m grid or plans again without those nodes. `window._hero.navAudit()` lists where the graph
  and the solids disagree (`KNOWN_ISSUES.md` has what is left after the 2026-10-05 fixes in `30-layout.js`).
- **The follow camera** tests the walk mode's solids along its line (a scene ray costs 40-200 ms here) and comes in
  close and low under a roof the solids do not model (the hall, houses, shelters, stalls).
- **The portrait** is the scene drawn from a camera in front of the speaker's face, when they start to speak.
- **GLTFLoader** comes from the jsDelivr CDN (three r128's), loaded after the page builds, as three.js itself is. It
  must not `fetch` anything (the gallery's frame blocks it): the models are in the page and their textures load as
  `data:` images (`heroParse` in `88-hero.js`).
- The page is 20.5 MB (Girder alone is 12.5 MB). **The gallery** (https://claude.ai/artifact/UhTfQ2kioZEbrzZR1agHv9,
  its own card, `worlds/girder-hero.html`) takes at most 16 MB a file (the artifact host's limit, not a setting), so it
  gets `python3 build_hero.py --slim --out <dir>/girder-hero.html`: the models slimmed by `slim_glb.py` (1024 px colour
  maps, no normal maps, quantized normals, UVs and weights; about 2 MB for both), the page about 15.7 MB.
- Not done: riding the lifts.
