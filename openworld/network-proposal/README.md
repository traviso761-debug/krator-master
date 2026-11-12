# The proposed Ancient network on scale model 5.1 (2026-11-11)

This folder is the picture and the data behind `../ANCIENT-NETWORK.md` section 8. It is a proposal for the owner's eye
and a reference for the router the scale-model session writes (edit M1). It is **not** the network: that is `network.json`,
once the model carries it.

| File | What |
|---|---|
| `ancient-network-proposal-5.1.jpg` | the picture |
| `net51.json` | the routed network |
| `route51.py` | the router |
| `legs51.py` | the router's last pass: a unique id for every leg (`python legs51.py <folder>` also runs it on its own) |
| `render51.py` | the picture's drawing |
| `setts.py` | extracts `setts.json` (the settlements) from the model's `model/src/60-settlements.js` |
| `setts.json`, `regions.json` | snapshots of the inputs: the settlements from `claude/cool-tereshkova-d594e8` at `7cff97d0c` (2026-11-11), the regions from `model/src/51-region-store.js` |

**`net51.json`** has:
- `nodes`, each `{id, name, type, px, kind: site | dock | tbd}`;
- `routes`, each `{id, line, class: line | branch | trunk | possible | izani | extension, from, to, name, km, tunnel_km, airless_open_km, px, form, up, note}`.
  - `form` and `up` (the keeper) are given per vertex.
  - **`id` is unique to its leg**, for example `rift.theodiga-strongbow` or `span.dalab-span`. An open-world link names the leg it follows by
    this id.
  - `line` is the id the legs of one route share (`rift`, `rift.bowl`, `span`). A route of one leg has `line` equal to its `id`.
  - `legs51.py` assigns these as `route51.py`'s last pass. It can also cut a leg at pass-through points (`SPLIT`), but none is
    cut: the Rift line stops at neither Qiblai nor Longsong.

**`route51.py`** works like this:
- It applies the draft's Ancient cost on a 4 km grid of 5.1's heights: a 4 % ruling grade, tunnel at 6x the surface cost, and
  bridges and causeways at 8x. **Airless cells (over 8 km) can be crossed in tunnel only.**
- The owner's answers of 2026-11-11 decide the nodes.
- The settled lines are pinned. The other trunks are a relative-neighbourhood graph over the route costs.

**`render51.py`** draws `net51.json` over `model/data/t.jpg`.

Both scripts only read the model and edit nothing:

```
cd tools/scale-model
python ../../openworld/network-proposal/route51.py ../../openworld/network-proposal
cd ../..
python openworld/network-proposal/render51.py openworld/network-proposal tools/scale-model/model/data/t.jpg openworld/network-proposal/ancient-network-proposal-5.1.jpg
```
