Copies of `core/rand/krand.gd`, `krand_test.gd` and `golden.json`: Godot's `res://` cannot reach outside
`godot/`. `core/rand/` is the upstream. After changing it, run `python3 godot/tools/sync_core.py`;
`--check` reports drift.
