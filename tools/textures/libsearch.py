#!/usr/bin/env python3
"""Search the material library by words or by a picture, and find near-duplicate sets: so a texture is reused, not
generated twice (core/materials/PLAN.md, "Rules, from now"). An image-text model (SigLIP base, Apache-2.0) runs on the NPU, else the CPU.

    python tools/textures/libsearch.py index [--root CHECKOUT]       # embed every set's colour map (only new or changed ones)
    python tools/textures/libsearch.py search "wet black basalt" ["moss on bark" ...] [-n 12] [--sheet out.jpg]
    python tools/textures/libsearch.py search --file queries.txt     # one query per line
    python tools/textures/libsearch.py like delivery/rock.marble.white.webp [-n 12] [--sheet out.jpg]
    python tools/textures/libsearch.py dupes [--min 0.97] [--sheet out.jpg]

Run it with the model venv's python (setup below). `index` reads core/materials/library and core/materials/patterns under
--root (default this checkout); the images are in Git LFS, so a worktree that holds pointers is skipped with a note: point
--root at a checkout that has them. The index (ids, file hashes, embeddings) lives beside the weights, outside the repo.
`search` ranks by the cosine between the words and each colour map; `like` and `dupes` by the cosine between pictures.
Scores are only comparable within one command. `--sheet` writes the hits as a contact sheet.

Setup, once (the same venv as tools/textures/depth.py):

    & "$env:LOCALAPPDATA\\krator-models\\venv\\Scripts\\python.exe" -m pip install openvino tokenizers numpy pillow
    & "$env:LOCALAPPDATA\\krator-models\\venv\\Scripts\\python.exe" tools/textures/libsearch.py --setup

KRATOR_SEARCH_DEVICE (e.g. CPU) overrides the device; KRATOR_MODELS the folder.
"""
import argparse, hashlib, json, os, re, sys, time
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HF = 'https://huggingface.co/Xenova/siglip-base-patch16-224/resolve/main/'
FILES = ['onnx/vision_model.onnx', 'onnx/text_model.onnx', 'tokenizer.json']
SIDE, TOKENS, PAD = 224, 64, 1
SETUP = 'set the search model up first: tools/textures/libsearch.py, "Setup" (a venv with openvino and tokenizers, then --setup)'


def model_dir():
    return os.environ.get('KRATOR_MODELS') or os.path.join(os.environ.get('LOCALAPPDATA', os.path.expanduser('~/.cache')), 'krator-models')


def index_path():
    return os.path.join(model_dir(), 'libsearch', 'index.npz')


def is_pointer(path):
    """An LFS pointer: a small text file in place of the image."""
    if os.path.getsize(path) > 1024:
        return False
    with open(path, 'rb') as fh:
        return fh.read(24).startswith(b'version https://git-lfs')


def sets(root):
    """(id, colour map path) for every set under core/materials/library and core/materials/patterns: the id is the set's
    folder relative to those (patterns keep 'patterns/' in front), the colour map is meta.json's maps.map."""
    out = []
    for base, pre in (('library', ''), ('patterns', 'patterns/')):
        top = os.path.join(root, 'core', 'materials', base)
        for d, _, files in os.walk(top):
            if 'meta.json' not in files:
                continue
            try:
                maps = json.load(open(os.path.join(d, 'meta.json'), encoding='utf-8')).get('maps', {})
            except ValueError:
                continue
            p = os.path.join(d, maps.get('map', 'albedo.jpg'))
            if os.path.exists(p):
                out.append((pre + os.path.relpath(d, top).replace(os.sep, '/'), p))
    return sorted(out)


def picture(path):
    """The model's input: the whole image squeezed to 224 (a card's cut-out over mid grey), as the SigLIP processor does."""
    im = Image.open(path)
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA'); bg = Image.new('RGBA', im.size, (128, 128, 128, 255)); bg.alpha_composite(im); im = bg
    x = np.asarray(im.convert('RGB').resize((SIDE, SIDE), Image.BICUBIC)).astype(np.float32) / 255
    return ((x - 0.5) / 0.5).transpose(2, 0, 1)[None]


def unit(v):
    return v / np.maximum(np.linalg.norm(v, axis=-1, keepdims=True), 1e-9)


class Model:
    """The two encoders, compiled once each (NPU first, then CPU), and the tokenizer."""
    def __init__(self):
        try:
            import openvino as ov
            from tokenizers import Tokenizer
        except ImportError:
            raise SystemExit('libsearch.py: openvino or tokenizers is not installed in this Python; ' + SETUP)
        ir = os.path.join(model_dir(), 'ir')
        if not os.path.exists(os.path.join(ir, 'siglip-vision_model.xml')):
            raise SystemExit('libsearch.py: no model in %s; %s' % (ir, SETUP))
        core = ov.Core()
        core.set_property({'CACHE_DIR': os.path.join(model_dir(), 'cache')})
        want = os.environ.get('KRATOR_SEARCH_DEVICE') or 'NPU'
        self.tok = Tokenizer.from_file(os.path.join(model_dir(), 'onnx', 'siglip-base', 'tokenizer.json'))
        self.nets = {}
        for n in ('vision_model', 'text_model'):
            for dev in [want] + (['CPU'] if want != 'CPU' else []):
                if dev.split('.')[0] not in [d.split('.')[0] for d in core.available_devices]:
                    continue
                try:
                    self.nets[n] = core.compile_model(os.path.join(ir, 'siglip-%s.xml' % n), dev); self.device = dev
                    break
                except Exception as e:
                    print('libsearch.py: %s would not compile %s (%s); trying the CPU' % (dev, n, str(e).strip().splitlines()[-1][:100]))
            if n not in self.nets:
                raise SystemExit('libsearch.py: no device compiled ' + n)

    def image(self, path):
        return unit(np.asarray(self.nets['vision_model'](picture(path))['pooler_output'], np.float64)[0])

    def text(self, q):
        """SigLIP's tokenizer lowercases and drops punctuation; it was trained on text padded to 64 tokens."""
        q = re.sub(r'[^\w\s]', ' ', q.lower()).strip()
        ids = self.tok.encode(q).ids[:TOKENS]
        ids = np.array([ids + [PAD] * (TOKENS - len(ids))], np.int64)
        return unit(np.asarray(self.nets['text_model'](ids)['pooler_output'], np.float64)[0])


def sha(path):
    h = hashlib.sha1()
    with open(path, 'rb') as fh:
        h.update(fh.read())
    return h.hexdigest()


def load_index():
    if not os.path.exists(index_path()):
        raise SystemExit('libsearch.py: no index yet; run: libsearch.py index [--root CHECKOUT]')
    z = np.load(index_path(), allow_pickle=False)
    return list(z['ids']), list(z['paths']), list(z['shas']), z['emb'].astype(np.float64)


def build_index(root, embed, old=None):
    """Embed every set's colour map; a set whose file hash is unchanged keeps its old embedding. Returns the index and
    how many were embedded, kept and skipped as LFS pointers."""
    old = old or ([], [], [], np.zeros((0, 768)))
    keep = {i: (s, e) for i, s, e in zip(old[0], old[2], old[3])}
    ids, paths, shas, emb, n = [], [], [], [], {'embedded': 0, 'kept': 0, 'pointers': 0}
    for sid, p in sets(root):
        if is_pointer(p):
            n['pointers'] += 1; continue
        h = sha(p)
        if sid in keep and keep[sid][0] == h:
            e = keep[sid][1]; n['kept'] += 1
        else:
            e = embed(p); n['embedded'] += 1
        ids.append(sid); paths.append(os.path.abspath(p)); shas.append(h); emb.append(e)
    return (ids, paths, shas, np.array(emb, np.float64) if emb else np.zeros((0, 768))), n


def save_index(ix):
    os.makedirs(os.path.dirname(index_path()), exist_ok=True)
    np.savez(index_path(), ids=np.array(ix[0]), paths=np.array(ix[1]), shas=np.array(ix[2]), emb=ix[3].astype(np.float32))


def top(emb, q, n, skip=None):
    s = emb @ q
    order = [i for i in np.argsort(-s) if i != skip][:n]
    return [(int(i), float(s[i])) for i in order]


def dupes(emb, lo):
    """Pairs of sets whose pictures' cosine is at least `lo`, most alike first."""
    s = emb @ emb.T
    i, j = np.nonzero(np.triu(s, 1) >= lo)
    return sorted(((float(s[a, b]), int(a), int(b)) for a, b in zip(i, j)), reverse=True)


def sheet(rows, ids, paths, out, side=160):
    """rows: [(label, [(index, score)])]: one row per query, its hits left to right with id and score under each."""
    cols = max(len(h) for _, h in rows)
    W, H = 150 + cols * side, len(rows) * (side + 30)
    im = Image.new('RGB', (W, H), (250, 250, 248)); dr = ImageDraw.Draw(im)
    for r, (label, hits) in enumerate(rows):
        y = r * (side + 30)
        for k in range(0, len(label), 22):
            dr.text((6, y + 6 + k // 22 * 12), label[k:k + 22], fill=(0, 0, 0))
        for c, (i, s) in enumerate(hits):
            t = Image.open(paths[i]).convert('RGB').resize((side - 6, side - 6), Image.BILINEAR)
            im.paste(t, (150 + c * side, y))
            dr.text((150 + c * side, y + side - 4), ids[i][-26:], fill=(0, 0, 0))
            dr.text((150 + c * side, y + side + 8), '%.3f' % s, fill=(90, 90, 90))
    im.save(out, quality=85)


def setup():
    import urllib.request
    import openvino as ov
    src = os.path.join(model_dir(), 'onnx', 'siglip-base'); ir = os.path.join(model_dir(), 'ir')
    os.makedirs(src, exist_ok=True); os.makedirs(ir, exist_ok=True)
    for f in FILES:
        p = os.path.join(src, os.path.basename(f))
        if not os.path.exists(p):
            print('fetching', HF + f); urllib.request.urlretrieve(HF + f, p)
    for n, shape in (('vision_model', {'pixel_values': [1, 3, SIDE, SIDE]}), ('text_model', {'input_ids': [1, TOKENS]})):
        m = ov.convert_model(os.path.join(src, n + '.onnx')); m.reshape(shape)
        ov.save_model(m, os.path.join(ir, 'siglip-%s.xml' % n)); print('wrote', os.path.join(ir, 'siglip-%s.xml' % n))
    t = time.time(); M = Model(); print('compiled on %s in %.1f s' % (M.device, time.time() - t))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--setup', action='store_true', help='fetch the weights and write the IR into the model folder')
    sub = ap.add_subparsers(dest='cmd')
    p = sub.add_parser('index'); p.add_argument('--root', default=ROOT); p.add_argument('--fresh', action='store_true', help='embed every set again')
    p = sub.add_parser('search'); p.add_argument('query', nargs='*'); p.add_argument('--file'); p.add_argument('-n', type=int, default=12); p.add_argument('--sheet')
    p = sub.add_parser('like'); p.add_argument('image', nargs='+'); p.add_argument('-n', type=int, default=12); p.add_argument('--sheet')
    p = sub.add_parser('dupes'); p.add_argument('--min', type=float, default=0.97); p.add_argument('--sheet'); p.add_argument('--max-rows', type=int, default=40)
    a = ap.parse_args()
    if a.setup:
        setup(); return 0
    if a.cmd == 'index':
        old = None if a.fresh or not os.path.exists(index_path()) else load_index()
        M = Model(); t = time.time()
        ix, n = build_index(a.root, M.image, old)
        if not ix[0]:
            raise SystemExit('libsearch.py: every colour map under %s is an LFS pointer (%d); point --root at a checkout with the images' % (a.root, n['pointers']))
        save_index(ix)
        print('%d sets indexed on %s in %.0f s: %d embedded, %d unchanged, %d LFS pointers skipped -> %s'
              % (len(ix[0]), M.device, time.time() - t, n['embedded'], n['kept'], n['pointers'], index_path()))
        return 0
    if a.cmd in ('search', 'like'):
        ids, paths, _, emb = load_index(); M = Model(); rows = []
        qs = (a.query + ([l.strip() for l in open(a.file, encoding='utf-8') if l.strip()] if getattr(a, 'file', None) else [])) if a.cmd == 'search' else a.image
        for q in qs:
            hits = top(emb, M.text(q) if a.cmd == 'search' else M.image(q), a.n)
            label = q if a.cmd == 'search' else os.path.basename(q)
            print('\n' + label); [print('  %.3f  %s' % (s, ids[i])) for i, s in hits]
            rows.append((label, hits))
        if a.sheet:
            sheet(rows, ids, paths, a.sheet); print('\nsheet:', a.sheet)
        return 0
    if a.cmd == 'dupes':
        ids, paths, _, emb = load_index()
        pairs = dupes(emb, a.min)
        for s, i, j in pairs:
            print('%.3f  %-40s %s' % (s, ids[i], ids[j]))
        print('%d pairs at %.2f or above, of %d sets' % (len(pairs), a.min, len(ids)))
        if a.sheet and pairs:
            sheet([('%.3f' % s, [(i, s), (j, s)]) for s, i, j in pairs[:a.max_rows]], ids, paths, a.sheet); print('sheet:', a.sheet)
        return 0
    ap.print_help()
    return 0


if __name__ == '__main__':
    sys.exit(main())
