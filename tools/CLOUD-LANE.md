# Cloud GPU lanes

Extra GPU lanes for `verify.py` runs, on a rented machine (vast.ai), beside the two local lanes `arc` and `rtx`
(`tools/harness.py`, "The GPU lanes"). Set up 2026-11-10 on instance 60132164: two NVIDIA RTX PRO 5000 Blackwell,
lanes `vast0` and `vast1`, one per GPU.

## What a session does

Nothing new. With the cloud lanes switched on (below), a `KRATOR_GL=gpu` verify that takes `auto` (the default) waits
in the queues of all four lanes and takes whichever frees first. `KRATOR_GPU_LANE=vast0` (or `vast1`) asks for one;
`KRATOR_GPU_LANE=cloud` for either cloud lane. The output streams back as it runs; shots and anything else the verify
writes come back to the same paths; a pass goes into the local verify cache.

    python3 tools/harness.py lanes                 # every lane's holder and queue, and whether the machine answers
    python3 tools/harness.py cloud status          # the machine: reachable, its GPUs, each lane's last job
    python3 tools/harness.py cloud on|off          # switch the cloud lanes on or off for every session on this PC

Only `verify.py` runs go to the cloud. Timing runs (`--timing`, `perf_views.py`, `ground_shots.py`) stay on `arc`, and
`harness.py lock` runs its command on a local lane: their numbers and Godot runs are this PC's.

## How it works

**Local queue, as for the local lanes.** Each cloud lane has a lock directory and a `.queue` folder in the same temp
folder as `arc` and `rtx` (`krator-verify-gpu-vast0.lock`): the same tickets, first come first served, the same owner
line, heartbeat and watchdog. Every session that uses the machine runs on this PC, so the local lock is the lane. The
machine keeps a second lock per lane (`flock`) as a guard.

**The bytes go up as git objects and LFS files, over SSH** (the owner's choice, 2026-11-10: no deploy key; the
machine holds no credential to the repo). For each job:

1. A snapshot commit of the session's working tree: its index copied to a temp index, `git add -u` (every tracked
   change, built pages included) and `git add -A` in the verify's build folder (new files), `git write-tree`,
   `git commit-tree` on top of the last snapshot pushed (`refs/krator-cloud/base`, a local ref kept so git sends
   only what changed). The session's index, branch and stash are not touched; uncommitted pages verify too.
2. `git push` of that commit to the machine's bare repo (`/workspace/krator.git`, ref `refs/lanes/<lane>`).
3. The LFS files the verify needs: everything LFS in the verify's build folder, except other pages in the page's
   own folder (files not named after the page), plus the LFS files the same verify read last time. The machine
   says which objects it lacks; this PC sends those from its `.git/lfs/objects` (tar over SSH). Objects stay in
   the machine's store, so each is sent once.
4. The lane's clone on the machine (`/workspace/lanes/<lane>`, owned by the lane's user) checks the snapshot out with
   LFS files as their pointers, and the runner copies the objects the job wants over them. (git-lfs's batch filter is
   off in these clones: on this machine git kills `git-lfs filter-process` with no error logged, 2026-11-10.)
5. The verify runs there with the same arguments, from the same folder, as the lane's Linux user, under
   `KRATOR_GL=gpu` and the lane's Chromium flags (`--use-gl=angle --use-angle=gl-egl`). Its output streams back.
6. Results come back: every file the run wrote in the verify's build folder or its `--out` folders (by modification
   time, after the checkout; never an LFS pointer), the files it read and their content ids. If it read an LFS file
   the machine did not have (a pointer), that file is sent and the verify runs once more, and it is sent up front the
   next time (`cloud-needs.json` beside the verify cache).
7. A pass (an `--assert` run without `--no-cache`, as locally) is recorded in the local verify cache, lane `vast0`,
   when every file it read still has, here, the content the machine verified: an LFS file by its oid, a text file by
   git's object id (so this PC's CRLF checkouts match the machine's LF ones). It also needs the machine's harness to
   check the same way as this PC's: its `result_fingerprint` must match.

**The cache key and the harness** (owner, 2026-11-11). The key takes only the part of `tools/harness.py` that can change
a verify's result: `harness.result_fingerprint()`, a hash of the parsed code without docstrings, comments, the
`__main__` block or the names in `NOT_IN_KEY` (the queue, locks, watchdog, cloud routing, lanes listing and the cache
itself). Editing the transport or the queue therefore keeps every pass; editing the launcher's flags, the page server or
a check drops them. New top-level code counts unless it is added to `NOT_IN_KEY`. `VERIFY_CACHE_VERSION` is bumped for a
change outside the file that can change results (a new pinned Chromium). `tools/tests/test_cache_key.py` checks both
directions. Caches only match between harness copies with the same fingerprint: until this branch is on `main`, a cloud
pass made here does not count for a session on `main`'s harness, nor the reverse.

**One GPU per lane.** Neither ANGLE nor the NVIDIA driver takes a device switch that tells two identical GPUs apart
(CUDA_VISIBLE_DEVICES, DRI_PRIME, EGL_VISIBLE_DEVICES and the Vulkan loader's filters were tried). Each lane runs as
its own user (`kvastN`, after the lane) in the group of the GPU it runs on (`kgpuG`, G its position in the machine's
`lanes`), and that group alone can open the GPU's `/dev/nvidiaN` and DRM nodes. The runner sets these permissions
before every job (the container resets `/dev` when it restarts). `gpu-renderer` checks the vendor is NVIDIA.
**Never run `nvidia-smi` (or anything NVIDIA) as root on a lane machine while it serves:** the drivers here have
`ModifyDeviceFiles: 1`, so any root process that opens the driver resets every `/dev/nvidiaN` to `root:root 0666`, and
every lane can then open every GPU (they still render on NVIDIA, but may share one GPU). The runner reads the GPU list
from `lanes/gpus.json`, which `cloud setup` writes with the one root `nvidia-smi` it runs, and re-applies the
permissions. To look at a lane's GPU, ask as its user: `runuser -u kvast2 -- nvidia-smi` shows that GPU alone.

**More than one machine** (2026-11-11). The config names each machine and its lanes, in GPU order:

    {"lanes": ["vast0", "vast1", "vast2", "vast3", "vast4", "vast5"],
     "machines": {"60160613": {"host": "ssh3.vast.ai", "port": 12986, "key": "~/.ssh/krator_vast", "instance": "60160613",
                               "lanes": ["vast0", "vast1"], "on": true},
                  "60169974": {"host": "ssh6.vast.ai", "port": 20428, "key": "~/.ssh/krator_vast", "instance": "60169974",
                               "lanes": ["vast2", "vast3", "vast4", "vast5"], "on": true}}}

The top-level `lanes` lists every lane of every machine that is on (other tools read it; `cloud on`/`off` keep it).
A machine that does not answer drops only its own lanes. The older single-machine shape (host, port... at the top)
still loads, as one machine with `vast0` and `vast1`. Each machine has its own repo copy and LFS store, filled as its
lanes need them.

    python3 tools/harness.py cloud on --machine 60169974 --host ssh6.vast.ai --port 20428 --key ~/.ssh/krator_vast --lanes vast2,vast3,vast4,vast5
    python3 tools/harness.py cloud setup --machine 60169974
    python3 tools/harness.py cloud off --machine 60169974      # or no --machine: every machine
    python3 tools/harness.py cloud status                      # every machine

**The watchdog.** The local side is `run_watched` on the SSH process, as for a local job: 25 minutes with no output
kills it and frees the lane (exit 124). The machine's runner stops the verify when the SSH connection closes, and
has its own 25-minute watchdog.

**When the machine is stopped or unreachable.** Before a job and in `auto`'s choice the PC checks the machine with
an SSH no-op (10 s timeout, the answer kept for two minutes). An unreachable machine drops out of `auto`; asking for
`vast0` by name fails at once with exit 3 and the reason. A connection lost mid-job exits 75: rerun it.

## Setting up a machine

Rent a machine with NVIDIA GPUs (the image `vastai/base-image:cuda-*` works), add an SSH key, then on this PC:

    python3 tools/harness.py cloud on --machine <instance> --host <host> --port <port> --key ~/.ssh/krator_vast --lanes vast0,vast1
    python3 tools/harness.py cloud setup --machine <instance>   # Playwright, its Chromium, the lane users, the GPU list

The config is `%LOCALAPPDATA%\krator-cloud.json` (`KRATOR_CLOUD_CONFIG`), never in the repo. With no config the
harness is exactly as it was: two local lanes.

## Cost

About $0.99 an hour while the instance runs, busy or idle. Stop it when the queue is empty:
`vastai stop instance 60132164` (the disk, the repo copy and the LFS store are kept; `destroy` loses them). After a
start, `harness.py cloud status` checks it; the SSH port can change, then `cloud on` again with the new one.
