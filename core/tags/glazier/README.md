# core/tags/glazier: the Glaziers' culture id (opt-in)

`52g-tags-glazier.js` adds the culture id **`glazier`** (display name "Glaziers") to `KTAGS.VOCAB` at load: the Glaziers of
Opal Valley, the third set of the Tungang kit (`kits/tungang/PLAN.md` section 1.4; the owner, 2026-11-11: "the Glaziers'
culture id is `glazier`").

**Why a subfolder.** A new culture is a vocabulary change, and `52-core-tags-vocab.js` reaches every page: adding the id there
changes every build's bytes and so asks for an all-builds rebuild. The owner chose (2026-11-16) to add it opt-in, as
`core/hamlet/fellgang` added the Fellgang row: a build that wants it lists this file after `52-core-tags-vocab.js`, and no other
page changes.

**When it goes.** With the next all-builds rebuild (`TODO.md`, "Ride along with the next all-builds rebuild"): move `'glazier'`
into `CULTURE_NAMES` (and `NO_CATALOG` until a Glazier catalog culture file exists), then delete this folder and drop it from
`kits/tungang/build.py` and `tungang_bundle.py`.

Taken by: `kits/tungang` (its page and its sealed bundle).
