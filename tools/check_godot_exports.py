#!/usr/bin/env python3
"""Static export hygiene gate for godot/data/world-* cases (standalone krator-world and streamed krator-world-stream).

Checks without booting Godot or a GPU:
  1. .gitattributes tracks godot/data/**/*.glb and godot/data/**/tex/*.webp in Git LFS.
  2. Standalone krator-world cases: valid JSON, zero export errors, no backslash paths, resolved item/bucket material IDs,
     existing world.glb (real binary or LFS pointer) whenever items/buckets are non-empty, and existing library texture files.
  3. Streamed krator-world-stream cases (index.json): chunk & place lattice alignment (place boxes snapped to chunk.step,
     disjoint place boxes, pins inside boxes), no orphan chunk/place folders on disk, valid nested arcology/monastery cases,
     no forbidden clunky lv=0 flora items in streamed places/flora library, and valid chunk/place world.json containers.
"""
import argparse, glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LV0_RE = re.compile(r'^flora/\d+\|\d+\|\d+\|0(?:/|$)')


def _read_json(path, issues, label):
    if not os.path.isfile(path):
        issues.append('%s: missing %s' % (label, os.path.basename(path)))
        return None
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        issues.append('%s: invalid JSON in %s (%s)' % (label, os.path.basename(path), e))
        return None


def _valid_glb_or_lfs(path):
    if not os.path.isfile(path):
        return False
    sz = os.path.getsize(path)
    if sz < 12:
        return False
    with open(path, 'rb') as f:
        head = f.read(48)
    return head.startswith(b'glTF') or head.startswith(b'version https://git-lfs.github.com/spec/v1')


def _check_world_dir(case_dir, label, forbid_lv0=False):
    issues = []
    wj = os.path.join(case_dir, 'world.json')
    d = _read_json(wj, issues, label)
    if not isinstance(d, dict):
        return issues
    if d.get('format') != 'krator-world':
        issues.append('%s: expected format krator-world, got %r' % (label, d.get('format')))
        return issues
    errs = d.get('errors') or []
    if errs:
        issues.append('%s: world.json carries %d export error(s): %r' % (label, len(errs), errs[:2]))
    items = d.get('items') or []
    buckets = d.get('buckets') or []
    mats = d.get('materials') or []
    texs = d.get('textures') or []
    mat_ids = {m.get('id') for m in mats if isinstance(m, dict) and m.get('id')}

    for it in items:
        mid = it.get('material')
        if mid not in mat_ids:
            issues.append('%s: item %s references missing material %r' % (label, it.get('id'), mid))
        nm = str(it.get('name') or '')
        if forbid_lv0 and LV0_RE.match(nm):
            issues.append('%s: forbidden clunky lv=0 flora item %r' % (label, nm))
    for bk in buckets:
        mid = bk.get('material')
        if mid not in mat_ids:
            issues.append('%s: bucket %s references missing material %r' % (label, bk.get('id'), mid))

    if len(items) + len(buckets) > 0:
        glb_rel = (d.get('glb') or {}).get('file', 'world.glb') if isinstance(d.get('glb'), dict) else 'world.glb'
        if '\\' in str(glb_rel):
            issues.append('%s: backslash in glb path %r' % (label, glb_rel))
        gp = os.path.join(case_dir, str(glb_rel))
        if not _valid_glb_or_lfs(gp):
            issues.append('%s: missing or invalid %s for %d items / %d buckets' % (label, glb_rel, len(items), len(buckets)))

    packs = {}
    for t in texs:
        if not isinstance(t, dict):
            continue
        if t.get('from') == 'png' and not str(t.get('png') or '').startswith('data:image/'):
            issues.append('%s: broken png texture %s (missing data:image/ payload)' % (label, t.get('id')))
        elif t.get('from') == 'library':
            pk = str(t.get('pack') or '')
            pj = os.path.join(case_dir, 'tex', '%s.pack.json' % pk)
            if not os.path.isfile(pj):
                pj = os.path.join(case_dir, 'tex', 'pack.json')
            if pj not in packs:
                packs[pj] = _read_json(pj, issues, label + '/tex') or {}
            fams = (packs[pj].get('families') or {}) if isinstance(packs[pj], dict) else {}
            slot_file = ((fams.get(t.get('family')) or {}).get('files') or {}).get(t.get('slot'))
            if not slot_file:
                issues.append('%s: library texture %s missing family/slot in pack.json' % (label, t.get('id')))
            elif '\\' in str(slot_file):
                issues.append('%s: backslash in texture file %r' % (label, slot_file))
            elif not os.path.isfile(os.path.join(case_dir, 'tex', str(slot_file))):
                issues.append('%s: missing texture file tex/%s' % (label, slot_file))
    return issues


def _boxes_overlap(a, b):
    return float(a[0]) < float(b[2]) and float(a[2]) > float(b[0]) and float(a[1]) < float(b[3]) and float(a[3]) > float(b[1])


def _check_stream_case(case_dir, label):
    issues = []
    idx = _read_json(os.path.join(case_dir, 'index.json'), issues, label)
    if not isinstance(idx, dict):
        return issues
    if idx.get('format') != 'krator-world-stream':
        issues.append('%s: index.json format %r != krator-world-stream' % (label, idx.get('format')))
        return issues
    src = str(idx.get('source') or '')
    if '\\' in src:
        issues.append('%s: backslash in index.json source %r' % (label, src))

    chunk_meta = idx.get('chunk') or {}
    csz = int(chunk_meta.get('size') or 0)
    cstep = int(chunk_meta.get('step') or 0)
    clist = chunk_meta.get('list') or []
    if csz <= 0 or cstep <= 0 or not clist:
        issues.append('%s: invalid chunk metadata (size=%r, step=%r, count=%d)' % (label, csz, cstep, len(clist)))
        return issues

    expected_chunks = set()
    for c in clist:
        cid = str(c.get('id') or '')
        crel = str(c.get('case') or '')
        if '\\' in crel:
            issues.append('%s: backslash in chunk case %r' % (label, crel))
        expected_chunks.add(os.path.basename(crel))
        b = c.get('box') or []
        if len(b) != 4 or (b[2] - b[0]) != csz or (b[3] - b[1]) != csz:
            issues.append('%s: chunk %s invalid box %r (expected %d m square)' % (label, cid, b, csz))
        cdir = os.path.join(case_dir, crel)
        issues.extend(_check_world_dir(cdir, '%s/%s' % (label, crel), forbid_lv0=True))
        cfj = os.path.join(cdir, 'flora.json')
        if os.path.isfile(cfj):
            cfd = _read_json(cfj, issues, '%s/%s' % (label, crel))
            if isinstance(cfd, dict):
                for fk in (cfd.get('keys') or []):
                    if str(fk).count('|') >= 3 and str(fk).endswith('|0'):
                        issues.append('%s/%s: forbidden lv=0 key %s in flora.json' % (label, crel, fk))

    chunks_root = os.path.join(case_dir, 'chunks')
    if os.path.isdir(chunks_root):
        on_disk = {n for n in os.listdir(chunks_root) if os.path.isdir(os.path.join(chunks_root, n))}
        orphans = sorted(on_disk - expected_chunks)
        if orphans:
            issues.append('%s: orphan chunk folder(s) not in index.json: %s' % (label, ', '.join(orphans[:5])))

    places = idx.get('places') or []
    expected_places = set()
    pboxes = []
    for p in places:
        pid = str(p.get('id') or '')
        prel = str(p.get('case') or '')
        if '\\' in prel:
            issues.append('%s: backslash in place case %r' % (label, prel))
        expected_places.add(os.path.basename(prel))
        b = p.get('box') or []
        pin = p.get('pin') or []
        if len(b) != 4 or b[2] <= b[0] or b[3] <= b[1]:
            issues.append('%s: place %s invalid box %r' % (label, pid, b))
        else:
            if any(int(round(v)) % cstep != 0 for v in b):
                issues.append('%s: place %s box %r is not snapped to chunk step %d m' % (label, pid, b, cstep))
            if len(pin) == 2 and not (b[0] <= pin[0] <= b[2] and b[1] <= pin[1] <= b[3]):
                issues.append('%s: place %s pin %r outside box %r' % (label, pid, pin, b))
            for prev_id, prev_b in pboxes:
                if _boxes_overlap(b, prev_b):
                    issues.append('%s: place %s box overlaps place %s' % (label, pid, prev_id))
            pboxes.append((pid, b))
        issues.extend(_check_world_dir(os.path.join(case_dir, prel), '%s/%s' % (label, prel), forbid_lv0=True))
        for sub_key in ('arcology', 'monastery'):
            sub = p.get(sub_key)
            if isinstance(sub, dict):
                srel = str(sub.get('case') or '')
                if '\\' in srel or '\\' in str(sub.get('page') or ''):
                    issues.append('%s: backslash in %s.%s path' % (label, pid, sub_key))
                expected_places.add(os.path.basename(srel))
                issues.extend(_check_world_dir(os.path.join(case_dir, srel), '%s/%s' % (label, srel), forbid_lv0=False))

    places_root = os.path.join(case_dir, 'places')
    if os.path.isdir(places_root):
        on_disk_p = {n for n in os.listdir(places_root) if os.path.isdir(os.path.join(places_root, n))}
        orphans_p = sorted(on_disk_p - expected_places)
        if orphans_p:
            issues.append('%s: orphan place folder(s) not in index.json: %s' % (label, ', '.join(orphans_p[:5])))

    flora_dir = os.path.join(case_dir, 'flora')
    if os.path.isdir(flora_dir):
        issues.extend(_check_world_dir(flora_dir, '%s/flora' % label, forbid_lv0=True))
        pr = _read_json(os.path.join(flora_dir, 'protos.json'), issues, '%s/flora' % label)
        if isinstance(pr, dict):
            plist = pr.get('protos') or []
            if not plist:
                issues.append('%s/flora: protos.json has 0 prototypes' % label)
            for item in plist:
                if str(item.get('lv')) == '0':
                    issues.append('%s/flora: forbidden lv=0 prototype %s' % (label, item.get('key')))
    return issues


def check_gitattributes(attr_path):
    issues = []
    if not os.path.isfile(attr_path):
        return ['missing .gitattributes']
    with open(attr_path, encoding='utf-8') as f:
        txt = f.read()
    if 'godot/data/**/*.glb' not in txt or 'filter=lfs' not in txt:
        issues.append('.gitattributes must track godot/data/**/*.glb with filter=lfs')
    if 'godot/data/**/tex/*.webp' not in txt:
        issues.append('.gitattributes must track godot/data/**/tex/*.webp with filter=lfs')
    return issues


def check_data_root(data_root, attr_path=None):
    issues = []
    if attr_path is not None:
        issues.extend(check_gitattributes(attr_path))
    cases = sorted(d for d in glob.glob(os.path.join(data_root, 'world-*')) if os.path.isdir(d))
    names = []
    for cdir in cases:
        nm = os.path.basename(cdir)
        names.append(nm)
        if os.path.isfile(os.path.join(cdir, 'index.json')):
            issues.extend(_check_stream_case(cdir, nm))
        else:
            issues.extend(_check_world_dir(cdir, nm, forbid_lv0=False))
    return names, issues


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--data', default=os.path.join(ROOT, 'godot', 'data'), help='godot/data directory to audit')
    ap.add_argument('--no-gitattributes', action='store_true', help='skip .gitattributes LFS rule check')
    args = ap.parse_args(argv)
    attr = None if args.no_gitattributes else os.path.join(ROOT, '.gitattributes')
    names, issues = check_data_root(args.data, attr_path=attr)
    if issues:
        for msg in issues:
            print('FAIL  ' + msg)
        print('check_godot_exports: %d issue(s) across %d case(s)' % (len(issues), len(names)))
        return 1
    print('check_godot_exports: %d case(s) clean (%s)' % (len(names), ', '.join(names)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
