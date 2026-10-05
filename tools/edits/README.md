# Edit queue: point at the world, leave a note for Claude

Instead of describing "the third house left of the bridge" in chat, click it.

```
python3 tools/edits/serve.py            # http://127.0.0.1:8765/
```

Open any built page through it, e.g. `http://127.0.0.1:8765/settlements/girder/girder.html`. Then
**Alt+click** a spot (or press **Edit** at the bottom right, then click), type what should change and press
**Ctrl+Enter**. The request lands in `edits/pending/<time>--<build>.json` (git-ignored). Tell Claude
"apply the pending edits".

Each record holds the note, the page and build, the hit point and face normal, the instance id, the hit
object and its parents (name, type, userData, shortened), the build's own inspector text (`inspectFn` /
`inspectLabel`, and the visible `#insp` / `#inspectTip` tooltip), and the camera position and target.

## For Claude

```
python3 tools/edits/pending.py [settlements/girder]    # notes, objects, likely src/ fragments
python3 tools/edits/pending.py --show <id>             # the full record
python3 tools/edits/pending.py --done <id> ...         # after the change is built and verified
```

The "likely" fragments are the build's `src/` files that mention the most of the object's names and labels:
a lead, not a proof. Use the point and the build's registry (sites, `REG`) to confirm. Apply the change in
`src/` as usual (CLAUDE.md), rebuild, verify, then mark it done. If a note is ambiguous, ask the owner.

## How it works

`serve.py` serves the repo unchanged and adds `<script src="/__edits.js"></script>` to each HTML page as it
sends it, so no build includes `edit-queue.js` and no hash, port baseline or gallery page changes. The
script waits for the build's `scene`, `camera` and `renderer` globals (28 of the 30 builds have them; the
catalog and interiors kits keep theirs in a closure, so the queue stays off there) and raycasts on its own,
in the capture phase, so the build's inspector and polygon tool never see an Alt+click.

Without the server (a `file://` page, the gallery) a queued note is copied to the clipboard as a JSON block
to paste into chat.
