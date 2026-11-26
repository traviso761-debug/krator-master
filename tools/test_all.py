#!/usr/bin/env python3
"""Every check the repo has, in one run (ROADMAP.md, stage 0a). CI runs this; so can anyone, from anywhere.

    python3 tools/test_all.py              # the push checks: lints, node tests, rebuild everything, hash baseline
    python3 tools/test_all.py --nightly    # also: the furniture fingerprint, verify.py --assert on the critical
                                           # builds, the Godot headless tests, the shot compare on the must-pass
                                           # cases (each skipped, and said so, when its tool is missing: playwright,
                                           # godot, numpy and Pillow)
    python3 tools/test_all.py --no-build   # skip the rebuild and the baseline (lints and tests only, on the committed pages)
    python3 tools/test_all.py --nightly --no-cache   # run every verify, even one that passed on the same page before
    python3 tools/test_all.py --list       # print the steps, numbered, and exit
    python3 tools/test_all.py --from 40    # resume at step 40 of --list (or at the first step whose name holds the text:
                                           # --from check_stale, --from "node core/city")
    python3 tools/test_all.py --timeout 3600   # a step's limit in seconds (default 1800); one past it is a FAIL, and the run goes on
    python3 tools/test_all.py --help       # this text

A node test that requires a dist/ bundle still a Git LFS pointer is skipped, naming the pull (tools/lfs_needs.py --test);
with --no-build, so is one whose own dist/ bundle is not committed (build it first). A node test that fails anyway on a
file that is a pointer (a SyntaxError "Unexpected identifier 'https'": a pointer read as code) says which file and the pull.

Exit code 1 if any step fails. Each step prints PASS, FAIL or SKIP with its time; failures print the tail of their
output. A step that times out or cannot start is a FAIL like any other and the run carries on (the 2026-11-15 survey:
one traceback lost every later step); output the console cannot encode is replaced, not fatal. Nothing here edits a tracked file except the rebuild, which writes the pages every build.py writes and each
build's build-inputs.json (it runs through tools/build.py): a clean tree after a run is part of the proof (the push job
checks it with `git status --porcelain`).

The ratcheted steps (tools/ratchet.py) fail on what is new, never on the pile; each baseline is meant to shrink to {}:
check_assembly, check_source, check_vendor, check_views, check_stale and check_cells (--strict replaces its ratchet at
the rebuild's close-out). Known entries, on purpose:
  - check_views: 40 view names hold a ':' (a name a screenshot cannot take on NTFS); tools/harness.py owns the fix, which
    is to make the file name safe when it writes one (CORE-IMPROVEMENTS.md item 17);
  - check_stale: the pages the biome rebuild's pairs and its close-out rebuild; it records them with --write-baseline, so a
    page a change leaves behind is new and fails. A pair's rebuild removes its keys (rerun --write-baseline).
Reports, in --no-build: the pages that differ from PORT-BASELINE.json are the same stale pages, so the hash compare runs
with the rebuild, where it can hold.
"""
import glob, importlib.util, os, re, shutil, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PY = sys.executable
TOPS = ('settlements', 'kits', 'biomes', 'openworld')
TIMEOUT = 1800   # a step's limit in seconds (--timeout)

# The critical-path builds for the nightly verify (GODOT-PLAN.md 3.3): the page and the arguments verify.py takes.
NIGHTLY_VERIFY = [
    ('biomes/hyperjungle', 'dist/hyperjungle.html', ['--assert']),
    ('biomes/rift', 'dist/rift.html', ['--assert']),
    ('biomes/sedesert', 'dist/sedesert.html', ['--assert']),
    ('settlements/iziz', 'dist/iziz.html', ['--assert']),
    ('settlements/girder', 'girder.html', ['--assert']),
    # the first Voth (voth.html) is retired (owner, 2026-10-14; archive/voth-first); Voth is settlements/voth's voth-city, whose
    # verify --assert runs simulated days (about 40 min alone) and so waits for a short mode before it joins the nightly list
    ('settlements/verge', 'dist/verge.html', ['--assert']),
    ('settlements/yuni', 'yuni.html', ['--assert']),   # its export profile (registry, fixtures, interiors) since 2026-10-18
]
GODOT_TESTS = ['res://tests/rand/krand_test.gd', 'res://tests/clock/kseason_test.gd', 'res://tests/clock/kseason_flush_test.gd', 'res://tests/fire/kfire_test.gd', 'res://tests/tags/ktags_test.gd', 'res://tests/tags/ksound_test.gd',
               'res://tests/mask/kmask_test.gd', 'res://tests/mask/kmask_distance_test.gd', 'res://tests/atmos/atmos_test.gd',
               'res://tests/verge/verge_sim_test.gd', 'res://tests/dhelv/dhelv_sim_test.gd', 'res://tests/ride/kride_test.gd', 'res://tests/ride/ride_cars_test.gd', 'res://tests/isle/isle_books_test.gd', 'res://tests/export/isle_test.gd', ('res://tests/export/isle_test.gd', '--case=world-isle-valapo', '--town=valapo'),
               'res://tests/dhelv/dhelv_nav_test.gd', 'res://tests/terrain/kfield_test.gd', 'res://tests/terrain/kstrata_test.gd', 'res://tests/terrain/kstrata_vary_test.gd', 'res://tests/terrain/klava_test.gd', 'res://tests/relief/wrelief_test.gd', 'res://tests/terrain/kstacks_test.gd', 'res://tests/terrain/kslab_test.gd', 'res://tests/resources/kres_field_test.gd',
               'res://tests/terrain/field_import_test.gd', 'res://tests/tags/records_test.gd',
               'res://tests/export/world_test.gd', 'res://tests/export/iziz_test.gd', 'res://tests/export/yuni_test.gd', 'res://tests/export/yuni_interiors_test.gd', 'res://tests/export/longsong_test.gd', 'res://tests/water/water_test.gd',
               'res://tests/water/falls_case_test.gd', 'res://tests/water/gaps_test.gd', 'res://tests/door/door_test.gd',
               'res://tests/shaders/library_test.gd', 'res://tests/anim/anim_test.gd', 'res://tests/motion/motion_test.gd',
               # a test and its arguments (after Godot's --): Pylon's sheet on Iziz's page, through the city test (core/export/README.md)
               ('res://tests/export/iziz_test.gd', '--case=world-pylon', '--sheet'),
               ('res://tests/export/iziz_test.gd', '--case=world-talia', '--sheet'),
               # the Eternian kit's sheet (records, materials, ground: the Scyvoi engine's profile; kits/eternian P7)
               'res://tests/export/eternian_test.gd',
               # the look (GODOT-LOOK-PLAN.md steps 1 to 3; godot/README.md, "The look"): the light rig by tier, items cut into
               # cells, the ground's occluders, the library surface's three shaders, the weathering stack, detail normals
               'res://tests/look/look_test.gd', 'res://tests/cells/cells_test.gd', 'res://tests/occluders/occluders_test.gd', 'res://tests/cook/cook_test.gd',
               # steps 4, 6 and 7: the cooks (above), the air and the dressing
               'res://tests/air/air_test.gd', 'res://tests/dress/dress_test.gd', 'res://tests/export/eternian_form_test.gd', 'res://tests/export/sedesert_wind_test.gd',
               'res://tests/shaders/library_faces_test.gd', 'res://tests/materials/kweather_test.gd', 'res://tests/materials/kdetail_test.gd',
               'res://tests/world_plan/world_plan_test.gd', 'res://tests/catchbowl/catch_bowl_test.gd',
               # the Godot-native Host's minimap and the Gallery (godot/gallery.tscn; godot/README.md, "The Gallery")
               'res://tests/gallery/gallery_minimap_test.gd',
               # desert surface, weathering, heat shimmer/mirage, haboob dust slab & KratorSky storm browning
               'res://tests/desert/desert_graphics_test.gd']
# The must-pass cases compare_shots.py scores in the nightly (M4, M5). COMPARE_ASSERT False: the step prints the table and
# passes whatever the scores (the owner reads the first numbers); True: a pair under compare_shots.py's threshold fails the nightly.
COMPARE_CASES = ['world-sedesert', 'world-iziz']
COMPARE_ASSERT = False
# The export size compare (tools/export_report.py --compare godot/data/export-report.json): its output ends with the list
# of what grew past EXPORT_TOLERANCE percent (bytes, instances, triangles, materials, textures, draws), new or vanished
# cases and sections fallen from ok. EXPORT_ASSERT False: a report, printed in full and never a failure (the owner reads
# the list, the last thing in the log); True: that list being non-empty fails the nightly (export_report.py --assert).
EXPORT_TOLERANCE = 10
EXPORT_ASSERT = False


# A build that reads another build's output builds after it: kits/ancients-interiors loads kits/interiors'
# dist/interiors-core.js in node (in CI that file is an LFS pointer until kits/interiors writes it).
BUILD_FIRST = ['kits/interiors']
# A node test that reads a build's output runs after the builds (in CI its input is an LFS pointer until the build
# writes it); with --no-build it runs with the other node tests, on the committed output.
NODE_AFTER_BUILD = ['settlements/isle-demo/tests/test-isle-city.js', 'settlements/isle-demo/tests/test-isle-sim.js',
                    'settlements/isle-demo/tests/test-isle-week.js', 'settlements/isle-demo/tests/test-isle-export.js', 'settlements/isle-demo/tests/test-isle-hamlets.js',
                    'settlements/isle-demo/tests/test-isle-crime.js', 'settlements/isle-demo/tests/test-isle-money.js',
                    'settlements/isle-demo/tests/test-isle-unrest.js', 'settlements/isle-demo/tests/test-isle-build.js',
                    'settlements/isle-demo/tests/test-isle-refugees.js',   # dist/isle-city.plan.js
                    'kits/interiors/tests/test-walk.js',   # dist/interiors-core.js
                    'core/simulation/ride/test-ride.js', 'core/simulation/ride/test-ride-cargo.js',
                    'core/simulation/ride/test-ride-r6.js']   # kits/motor-vehicles/dist/krator-vehicles.js (the Line's cars)


def builds():
    out = []
    for top in TOPS:
        for d in sorted(glob.glob(os.path.join(ROOT, top, '*', 'build.py'))):
            out.append(os.path.relpath(os.path.dirname(d), ROOT).replace(os.sep, '/'))
    return [b for b in BUILD_FIRST if b in out] + [b for b in out if b not in BUILD_FIRST]


def extra_builds():
    """Pages a build writes only when asked: every station kit's stations (build.py --station <name>; the plain build.py
    writes station 1 only, or none). The baseline hashes them, so they are rebuilt too. A station is a folder under
    stations/ with a station.json or its own fragments; one marked "baseOnly" is a shared stage, never built alone; a kit with stations but no build.py is a plan (2026-11-10: the
    second integration pass found --all had skipped about a hundred station pages; Girder's hero page is retired to
    archive/girder-hero)."""
    import json
    out = []
    for sd in sorted(glob.glob(os.path.join(ROOT, 'biomes', '*', 'stations', '*', ''))):
        sd = sd.rstrip('/' + os.sep)
        kit = os.path.dirname(os.path.dirname(sd))
        b = os.path.relpath(kit, ROOT).replace(os.sep, '/')
        name = os.path.basename(sd)
        sj = os.path.join(sd, 'station.json')
        # a station is a folder with a station.json or its own fragments (several kits keep no station.json); a plan with
        # no build.py yet, the shared fragments of a kit's stations (`common`) and a "baseOnly" stage are not
        if not os.path.isfile(os.path.join(kit, 'build.py')) or name == 'common':
            continue
        if not os.path.isfile(sj) and not glob.glob(os.path.join(sd, '[0-9]*.js')):
            continue
        try:
            with open(sj, encoding='utf-8') as fh:
                if json.load(fh).get('baseOnly'):
                    continue
        except (OSError, ValueError):
            pass
        out.append(('build %s --station %s' % (b, name), [PY, 'build.py', '--station', name], b))
    return out

def node():
    return shutil.which('node') or next(iter(sorted(glob.glob('/opt/node*/bin/node'), reverse=True)), None)


def node_tests():
    tests = sorted(glob.glob(os.path.join(ROOT, 'core', '**', 'test-*.js'), recursive=True))
    tests += sorted(glob.glob(os.path.join(ROOT, 'settlements', '*', 'tests', 'test-*.js')))
    tests += sorted(glob.glob(os.path.join(ROOT, 'kits', '*', 'tests', 'test-*.js')))
    tests += sorted(glob.glob(os.path.join(ROOT, 'openworld', '*', 'tests', 'test-*.js')))   # the outpost registry (openworld/outposts/PLAN.md)
    tests += sorted(glob.glob(os.path.join(ROOT, 'biomes', '*', 'tests', 'test-*.js')))   # the biome kits' data tests (gills, clivobredos, ...)
    tests += [os.path.join(ROOT, 'tools', 'walk_audit', 'test_audit.js')]   # the geometry walk audit (tools/walk_audit/README.md)
    return [os.path.relpath(t, ROOT) for t in tests]


def _lfs_needs():
    if os.path.join(ROOT, 'tools') not in sys.path:
        sys.path.insert(0, os.path.join(ROOT, 'tools'))
    import lfs_needs
    return lfs_needs


def node_pointers(test):
    """The dist/ bundles a node test requires that are still LFS pointers (tools/lfs_needs.py; item 23)."""
    try:
        L = _lfs_needs()
        return L.pointers(L.test_reads(test.replace(os.sep, '/')))
    except OSError:
        return []


def node_missing(test):
    """The test's own dist/ bundles it names that are not in the checkout at all (not committed: the isle demo's
    dist/isle-city.plan.js; the survey's T5). [] when every one is there."""
    try:
        return _lfs_needs().test_missing(test.replace(os.sep, '/'))
    except OSError:
        return []


# a file named in a failing step's output: an absolute path (C:\...\x.js, /home/.../x.js) or a repo path, with node's
# :line[:col] after it
PATH_IN_OUT = re.compile(r"([A-Za-z]:[\\/][^\s:'\"()<>|*?]+|/[^\s:'\"()<>|*?]+|(?:settlements|kits|biomes|openworld|core|tools|godot)/[^\s:'\"()<>|*?]+)")
POINTER_SIGN = re.compile(r"Unexpected identifier '?https'?|version https://git-lfs")


def pointers_in_output(text, cwd=ROOT):
    """The files a failing step's output names that are Git LFS pointers (repo paths, sorted): the file to pull."""
    sys.path.insert(0, os.path.join(ROOT, 'tools'))
    import buildlib
    out = set()
    for m in PATH_IN_OUT.findall(text or ''):
        p = m.rstrip('.,;')
        p = os.path.normpath(p if os.path.isabs(p) else os.path.join(cwd, p))
        try:
            if os.path.isfile(p) and buildlib.is_pointer(p):
                r = os.path.relpath(p, ROOT).replace(os.sep, '/')
                if not r.startswith('..'):
                    out.add(r)
        except (OSError, ValueError):
            continue
    return sorted(out)


def pointer_note(text, test=None, cwd=ROOT):
    """One line for a failure that comes from a pointer, or '' when nothing in it points at one."""
    ptr = pointers_in_output(text, cwd)
    if ptr:
        return 'an LFS pointer, not the file: %s. Run: git lfs pull --include="%s"' % (', '.join(ptr), ','.join(ptr))
    if POINTER_SIGN.search(text or ''):
        return ("a SyntaxError on 'https' is a Git LFS pointer read as code%s" %
                (': python3 tools/lfs_needs.py --test %s names what the test reads' % test if test else ''))
    return ''


def run_step(cmd, cwd, timeout):
    """(ok, output, note) for one step; a timeout or a step that cannot start is a failure with a note, never a traceback."""
    try:
        r = subprocess.run(cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
                           encoding='utf-8', errors='replace', timeout=timeout)
        out = r.stdout or ''
        if r.returncode != 0 and not out.strip():   # died before it printed: say so, so a crash is not read as the test's verdict
            code = r.returncode & 0xFFFFFFFF
            return False, out, 'exited %s with no output: it may not have started (a machine out of memory, or the app crashing); rerun it' % (
                '0x%08X' % code if code > 0xFFFF else str(r.returncode))
        return r.returncode == 0, out, ''
    except subprocess.TimeoutExpired as e:
        out = e.stdout or e.output or ''
        if isinstance(out, bytes):
            out = out.decode('utf-8', 'replace')
        return False, out, 'timed out after %ds (--timeout; rerun this step with --from)' % timeout
    except Exception as e:   # OSError (a missing interpreter), ValueError: the step fails, the run goes on
        return False, '', 'could not run: %s: %s' % (type(e).__name__, e)


def console_safe():
    """A console that cannot encode a character (cp1252 and a Hawaiian name) replaces it rather than ending the run."""
    for s in (sys.stdout, sys.stderr):
        try:
            s.reconfigure(errors='replace')
        except (AttributeError, ValueError):
            pass


def arg_value(argv, flag):
    if flag in argv:
        i = argv.index(flag)
        if i + 1 < len(argv):
            return argv[i + 1]
        raise SystemExit('test_all: %s takes a value' % flag)
    for a in argv:
        if a.startswith(flag + '='):
            return a.split('=', 1)[1]
    return None


def start_index(plan, frm):
    """The index --from names: a step number from --list (1-based), else the first step whose name holds the text."""
    if frm is None:
        return 0
    if frm.isdigit():
        i = int(frm) - 1
        if 0 <= i < len(plan):
            return i
        raise SystemExit('test_all: --from %s: there are %d steps (--list)' % (frm, len(plan)))
    for i, st in enumerate(plan):
        if frm.lower() in st[0].lower():
            return i
    raise SystemExit('test_all: --from %r names no step (--list)' % frm)


def steps(nightly, build):
    s = [('port lint (every build and core)', [PY, 'tools/check_port.py']),
         ('port lint (openworld/outposts: shared data, not a build)', [PY, 'tools/check_port.py', 'openworld/outposts']),
         ('insulation (core never names host/)', [PY, 'tools/check_insulation.py']),
         ('dependencies run one way (MODULARITY-PLAN.md)', [PY, 'tools/dep_graph.py']),
         ('build.py open() names its encoding', [PY, 'tools/check_encoding.py']),
         ('builds take the core modules (README.md, "Core modules are not optional")', [PY, 'tools/check_core_use.py']),
         ('Voth census tables (every build with a *_TRADES)', [PY, 'tools/check_trades.py', '--all']),
         ('botany census in step (tools/check_botany.py)', [PY, 'tools/check_botany.py', '--check']),
         ('godot vendored core in step', [PY, 'godot/tools/sync_core.py', '--check']),
         ('godot export hygiene (tools/check_godot_exports.py)', [PY, 'tools/check_godot_exports.py']),
         ('core/rand GDScript transliteration', [PY, 'core/rand/test_rand.py']),
         # tools/check_source.py: trailing // that swallow statements, `|| <number>` option reads, cameraPosition, bare GLSL splices
         # and raw texture2D in hooks (CORE-IMPROVEMENTS.md 17, 14, 8b, 9b); a ratchet
         ('source lints (comments, || numbers, shader text)', [PY, 'tools/check_source.py']),
         ('vendored drift only shrinks (item 19)', [PY, 'tools/check_vendor.py', '--quiet']),
         ('stations have views, view names are file-safe (item 10b)', [PY, 'tools/check_views.py']),
         ('page cap and BUDGETS.json (items 3a, 3d)', [PY, 'tools/check_budgets.py']),
         # passes, saying so, while the library cards are LFS pointers (CI pulls only tex/)
         ('card cells (ratchet; tools/textures/check_cells.py)', [PY, 'tools/textures/check_cells.py', '--ratchet']),
         # its fences pair up and its count line is right (BUGS-2026-11-15.md T19; item 50)
         ('PROMPTS-NEEDED.md fences and count (tools/textures/check_prompts.py)', [PY, 'tools/textures/check_prompts.py'])]
    for t in sorted(glob.glob(os.path.join(ROOT, 'tools', 'tests', 'test_*.py'))):
        s.append(('tools ' + os.path.relpath(t, ROOT).replace(os.sep, '/'), [PY, t]))
    n = node()
    late = [t for t in node_tests() if build and t.replace(os.sep, '/') in NODE_AFTER_BUILD]
    for t in node_tests():
        if t not in late:
            s.append(('node ' + t, [n, t] if n else None))
    # read the pages and the manifests, so after the rebuild when there is one (with --no-build: the committed pages; an
    # LFS pointer page counts as NOT BUILT in the first and as its oid in the second)
    pages = [('page assembly: clash, order, missing, needs (tools/check_assembly.py)', [PY, 'tools/check_assembly.py']),
             ('pages behind their sources (tools/check_stale.py)', [PY, 'tools/check_stale.py'])]
    if build:
        # through tools/build.py: the same build, plus its LFS refusal, page cap, fragment needs and build-inputs.json
        for b in builds():
            s.append(('build ' + b, [PY, 'tools/build.py', b]))
        for name, cmd, cwd in extra_builds():
            script = os.path.basename(cmd[1])
            s.append((name, [PY, 'tools/build.py', cwd] + cmd[2:] + ([] if script == 'build.py' else ['--script', script])))
        for t in late:
            s.append(('node ' + t, [n, t] if n else None))
        s += pages
        s.append(('hash baseline (PORT-BASELINE.json)', [PY, 'tools/port_baseline.py']))
    else:
        s += pages
    if nightly:
        pw = importlib.util.find_spec('playwright') is not None
        s.append(('furniture fingerprint', [PY, 'core/furnish/fingerprint.py'] if pw else None))
        # through tools/verify_cache.py: a verify that passed on the same page bytes is skipped (a fresh CI checkout has no
        # cache, so it runs them all); --no-cache runs every one
        for b, page, args in NIGHTLY_VERIFY:
            ok = pw and os.path.isfile(os.path.join(ROOT, b, 'verify.py'))
            if '--no-cache' in sys.argv:
                s.append(('verify ' + b, [PY, 'verify.py', page] + args if ok else None, b))
            else:
                s.append(('verify ' + b, [PY, 'tools/verify_cache.py', b, page] + args if ok else None))
        # the scripted walk (ROADMAP.md stage 0j): real keys held for 20 frames from open ground; the walker must
        # cover 2 m forward, stay up, and leave the console clean
        s.append(('walk settlements/girder', [PY, 'tools/harness.py', 'walk', 'settlements/girder/girder.html', '--route', 'KeyW:20f',
                                               '--start', 'auto', '--min', '2', '--dir', '0,-1'] if pw else None))
        # the size of each exported case against godot/data/export-report.json, ending with the flagged-growth list; a
        # report until EXPORT_ASSERT is True (a refreshed baseline is simply the new reference)
        if os.path.isfile(os.path.join(ROOT, 'godot', 'data', 'export-report.json')):
            cmd = [PY, 'tools/export_report.py', '--compare', 'godot/data/export-report.json', '--tolerance', str(EXPORT_TOLERANCE)]
            s.append(('export sizes (assert, tools/export_report.py)', cmd + ['--assert']) if EXPORT_ASSERT
                     else ('report: export sizes (tools/export_report.py)', cmd))
        else:
            s.append(('report: export sizes (tools/export_report.py)', [PY, 'tools/export_report.py']))
        g = os.environ.get('GODOT') or shutil.which('godot')
        for t in GODOT_TESTS:
            t, targs = (t[0], list(t[1:])) if isinstance(t, tuple) else (t, [])
            s.append(('godot ' + ' '.join([t] + targs), [g, '--headless', '--path', 'godot', '--script', t] + (['--'] + targs if targs else []) if g else None))
        # the perf capture (ROADMAP.md section 11, item 4; godot/README.md "The perf capture") smoked headless: it must run and
        # write its files into shots/perf (gitignored); its numbers mean nothing here and are never checked
        s.append(('godot perf capture (headless smoke)', [g, '--headless', '--path', 'godot', '--script', 'res://tests/perf/perf_capture.gd', '--',
                                                           '--cases=world-sedesert,world-iziz', '--frames=10', '--out=res://shots/perf'] if g else None))
        # the perceptual compare (ROADMAP.md stage 4, section 11 item 4): the page and the spike shot from one camera on the
        # must-pass cases, scored by SSIM (godot/README.md "Scoring the pairs"). A report until COMPARE_ASSERT is True.
        img = pw and g and importlib.util.find_spec('numpy') is not None and importlib.util.find_spec('PIL') is not None
        s.append(('compare shots ' + ('(assert)' if COMPARE_ASSERT else '(report)'),
                  [PY, 'godot/tools/compare_shots.py'] + COMPARE_CASES + ['--assert' if COMPARE_ASSERT else '--report'] if img else None))
    return s


KNOWN_FLAGS = ('--help', '-h', '--nightly', '--no-build', '--no-cache', '--list', '--from', '--timeout')


def main(argv):
    console_safe()
    if '--help' in argv or '-h' in argv:   # the survey: `--help` used to run the whole suite
        print(__doc__)
        return 0
    odd = [a for i, a in enumerate(argv) if a.split('=')[0] not in KNOWN_FLAGS and not (i and argv[i - 1] in ('--from', '--timeout'))]
    if odd:   # a typo used to run the whole suite too
        print('test_all: unknown argument(s) %s (--help)' % ' '.join(odd))
        return 2
    nightly, build = '--nightly' in argv, '--no-build' not in argv
    tv = arg_value(argv, '--timeout')
    timeout = int(tv) if tv else TIMEOUT
    plan = steps(nightly, build)
    if '--list' in argv:
        for i, st in enumerate(plan):
            print('%3d  %s' % (i + 1, st[0]))
        return 0
    first = start_index(plan, arg_value(argv, '--from'))
    if first:
        print('resuming at step %d of %d: %s (--from)' % (first + 1, len(plan), plan[first][0]), flush=True)
    fails, t0 = [], time.time()
    for st in plan[first:]:
        name, cmd = st[0], st[1]
        cwd = os.path.join(ROOT, st[2]) if len(st) > 2 else ROOT
        if cmd is None:
            print('SKIP  %s (tool missing)' % name, flush=True)
            continue
        if name.startswith('node '):   # item 23: a bundle the test requires is still an LFS pointer: say the pull, do not run it
            ptr = node_pointers(name[5:])
            if ptr:
                print('SKIP  %s (needs %s, an LFS pointer: python3 tools/lfs_needs.py --test %s --pull)' % (name, ', '.join(ptr), name[5:]), flush=True)
                continue
            gone = [] if build else node_missing(name[5:])
            if gone:   # T5: with --no-build the test reads its build's output, and that output is not committed
                own = gone[0].split('/dist/')[0]
                print('SKIP  %s (needs %s, not committed: python3 tools/build.py %s first)' % (name, ', '.join(gone), own), flush=True)
                continue
        t = time.time()
        ok, out, note = run_step(cmd, cwd, timeout)
        if name.startswith('report:'):    # a report prints and never fails the run
            print('REPORT  %s  (%.1fs)%s' % (name[8:], time.time() - t, '  ' + note if note else ''), flush=True)
            for ln in out.splitlines():
                print('      ' + ln, flush=True)
            continue
        if not ok and not note:
            note = pointer_note(out, name[5:] if name.startswith('node ') else None, cwd)
        print('%s  %s  (%.1fs)%s' % ('PASS' if ok else 'FAIL', name, time.time() - t, '  ' + note if note else ''), flush=True)
        if not ok:
            fails.append(name)
            print('\n'.join('      ' + ln for ln in out.splitlines()[-25:]), flush=True)
    ran = len(plan) - first
    print('\n%d steps%s, %d failed, %.0fs' % (ran, ' (from %d of %d)' % (first + 1, len(plan)) if first else '', len(fails), time.time() - t0))
    for f in fails:
        print('  failed: ' + f)
    if fails:
        at = next(i for i, st in enumerate(plan) if st[0] == fails[0]) + 1
        flags = [a for a in argv if a in ('--nightly', '--no-build', '--no-cache')]
        print('resume at the first failure: python3 tools/test_all.py ' + ' '.join(flags + ['--from', str(at)]))
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
