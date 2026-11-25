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

**Do not run them until the scripts' hashes are confirmed against the authoring session's** — they reached this branch
through the session-to-session message relay, which HTML-escaped every `<`, `>` and `&`, so they are a hand-unescaped
reconstruction. The two station-stage files of the same relay were applied as a `git diff` instead and so had their
context lines verified by `git apply`; these four did not, having arrived as whole files.

**A new scale model is also being made** (the owner, 2026-11-25), which may make all of this a re-run against new
ground. That is the reason the edits are not being applied here on anyone's initiative: `openworld/catch-bowl/PLAN.md`
section 13 and `openworld/catch-bowl/MAP-EDITS.md` carry the order of work.
