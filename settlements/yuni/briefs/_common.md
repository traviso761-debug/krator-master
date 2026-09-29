# Common ground for every Yuni asset agent

You are one of several agents building the BUILDING KIT for Yuni, a procedurally generated Three.js city. The planner
(another Claude) owns the world, the engine and the contract; you own ONE source fragment and nothing else.

* Your private working copy is the directory this brief sits in (`..`). Work only there. Other agents have their own copies.
* READ FIRST, in this order: `API.md` (the contract — everything you may call), `src/53-assets.js` (the frame `F`),
  `src/55-mid-example.js` (the reference asset: copy its shape), then skim `src/05-palette.js` (colours + families) and
  `src/50-structure.js` (ARCHWALL / ARCHBAND / BLUNT_TOWER) and the top of `src/45-kit.js` (the primitives).
* Reference photographs the user supplied are in `refimg/` — LOOK at the ones your brief names (use the Read tool on the image).
* You write ONLY the fragment file(s) named under "You own". Do not edit any other file in `src/`, nor build.py / verify.py.
  If you need something the contract lacks (a colour, a family, a frame call), say so in your report and work around it.
* Write your fragment to disk EARLY (first asset working), build, verify, look, then grow it asset by asset. If you are cut
  off mid-way the planner can only recover what is on disk.
* Build + look loop (from your copy's root):
    python3 build.py
    ./run.sh LOG yuni-assets.html --assert --all-views --out shots        # then poll:  ls LOG.done ; cat LOG.txt
    ./run.sh LOG yuni-assets.html --cam "cx,cy,cz,tx,ty,tz" --cam-name close --out shots
  Get asset positions with:  python3 verify.py yuni-assets.html --eval "()=>_api.SHEET_ITEMS.map(i=>[i.name,i.x|0,i.z|0,i.w,i.d,i.h])"
  On the sheet every asset's FRONT faces NORTH (-z), so put your camera NORTH of it (smaller z) looking south; a good
  close-up is ~1.2 x the asset's width away, 3-8 m up. Never run two verifies at once. This machine has 2 cores and is SHARED with four other agents doing the same thing, so a run
  takes 1-4 minutes: batch all your close-ups into ONE run (`--cam` is repeatable: `--cam a --cam b --cam c`, files close0.png,
  close1.png...), poll with `sleep 30; ls LOG.done`, and do not burn runs on things you can reason out. `--hour 21.5` = night.
* Done when: build passes; error panel clean; every asset (every variant) looked at from the front and from above in a
  screenshot YOU have read, and it looks like the thing it is named after, at human scale (the 1.75 m figure beside
  each asset is your ruler), sitting on the ground, inside its footprint, with no z-fighting, no floating parts, no
  see-through shells. Doors face +z (north on the sheet). Be honest in the report about what still looks wrong.
* Aesthetic bar: these are for a user with a strong eye who supplied photo references. Silhouette first (curves, domes,
  pinnacles, battered walls, parabolic arches), then the two or three details that make the type unmistakable, then
  colour/pattern by wealth. Blocky boxes with a label are a failure. But mind the triangle budgets in API.md — the city
  multiplies everything by thousands.
