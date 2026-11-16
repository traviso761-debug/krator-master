# Girder · Hero (retired 2026-11-10)

Girder with Styv, a third-person character ordered about with the mouse, and people to talk to (Phil in the Assembly
Hall): `build_hero.py` built `girder-hero.html` from Girder's `src/` plus `hero/88-hero.js` (the hero), `hero/89-talk.js`
and `hero/cast.json` (the dialogue).

**Retired by the owner (2026-11-10):** "girder hero can be deprecated and archived. when it comes time to implement PCs
we may want to take code from it but until then we don't need to be keeping it up to date with every change."

Why it stopped working: the hero's walker called Girder's own walk helpers (`wkSupport`, `wkBlocked`, `wkPush`,
`wkNear`, `wkStops`, `wkTopAt`, `WALKER`), which `settlements/girder/src/83-walk.js` dropped on 2026-10-19 when Girder moved
onto `core/walk` (`KWALK`; 5955e47f7). The second integration pass's GPU verify failed it on `wkSupport is not defined`.
A port would read the thin `window._walk` layer 83-walk.js keeps (`support`, `blocked`) or `KWALK` directly.

What moved where:
- the page, `build_hero.py` and `hero/` (the hero, the talk, the cast, the model prep and slim scripts): here. Nothing
  builds from `archive/`: `build_hero.py`'s paths still point at `settlements/girder/`.
- Styv's and Phil's models (`styv.glb`, `phil.glb`): `core/charactermodels/donors/`, because `core/charactermodels`
  uses them (Styv's bind pose is the canonical one in `tools/make_pieces.py`; both are donors in `data/donors.json`).
- the gallery entry (`gallery/build_gallery.py` ENTRIES and MADE) and the hash baseline row are gone; the live gallery
  still shows the hero until its next republish.
