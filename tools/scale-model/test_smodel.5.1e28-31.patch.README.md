# `test_smodel.5.1e28-31.patch` — held, not applied (2026-11-25)

`tests/test_smodel.py` section 21's update for scale-model **edits 28-31** (`edit_528_twins.py`,
`edit_529_godsgate_pin.py`, `edit_530_seow_rescale.py`, `edit_531_catchbowl_records.py`, all four in this folder).
Written by the scale-model session, which applied the edits and the test together on its own branch and **could not
push** — it held read-only access to the repository, so neither its edited `model/data/` nor its commit ever left its
container. The scripts came here as text and are committed; the edited rasters could not, being binary.

**So the test is held as a patch rather than applied, because it asserts the model AFTER those edits** — the Twins gone,
the two salt works landed at 1080,1428 and 1169,1150, Bāb al-Hawa at 1027,1258, Esper named, Parabola typed `arcology`
at 970,1186. The `model/data/` in this branch is **unedited 5.1**, so applying it now would make `test_smodel.py` fail
on work that has not been done here. A knowingly red test is worse than a patch with a note.

**To land it:**

```
python3 tools/scale-model/edit_528_twins.py
python3 tools/scale-model/edit_529_godsgate_pin.py
python3 tools/scale-model/edit_530_seow_rescale.py        # the raster edit
python3 tools/scale-model/edit_531_catchbowl_records.py
git apply tools/scale-model/test_smodel.5.1e28-31.patch
python3 tools/scale-model/tests/test_smodel.py            # was 400 passed / 0 failed on the authoring branch
```

then delete this patch and this note. Each script refuses to run twice, and each is keyed to model 5.1: on a new model
they **assert or refuse rather than mis-applying** (`edit_530` re-derives the province's break by sweeping every split
from x 1030 to 1100 and stops unless it is at 1056; the record edits refuse on their batch markers; `edit_529` checks
the live pin is still at 1028,1246).

**The scripts' hashes are VERIFIED (2026-11-25)** and they are safe to run. They reached this branch through the
session-to-session message relay, which HTML-escaped every `<`, `>` and `&`, so they were hand-unescaped here — but all
four sha256 sums match the authoring session's exactly:

```
a1f63e153458874e54aa9a2f9aa07158ceef813ec5fd5c3799941e3a3da804ad  edit_528_twins.py                 134 lines /  7,864 bytes
5264ae0fca370aeb5bf4cbf7fb3036259dd114751f73a1e6d5f0bfe2d09ba3fa  edit_529_godsgate_pin.py          186 / 12,310
a803d89807c06983339d2d5df65c93672f58cf29b3236b2e33457d21ce57558c  edit_530_seow_rescale.py          403 / 26,814
247bb7da971f099ee97611c296eb31b1e02903fc8684e2fb5d9ce7511715903d  edit_531_catchbowl_records.py     277 / 17,816
```

1,000 lines and 64,804 bytes in all. That match is stronger evidence than it looks: the originals carry **trailing
whitespace on 1, 3, 11 and 2 lines** respectively and each ends in exactly one newline, so a sha256 match means the
hand-unescaping reproduced the incidental whitespace as well as the code. There is no room left for a `<=` that should
be `<`, or a dropped `&` in `guard = prov & (swath | amph | whas | beds)`. **One line has since been changed on
purpose** — `edit_531`'s bore assertion, below — so that file no longer matches its hash.

**A new scale model is also being made** (the owner, 2026-11-25), which may make all of this a re-run against new
ground. That is the reason the edits are not being applied here on anyone's initiative: `openworld/catch-bowl/PLAN.md`
section 13 and `openworld/catch-bowl/MAP-EDITS.md` carry the order of work.
