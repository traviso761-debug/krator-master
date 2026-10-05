#!/usr/bin/env python3
"""Serve the repo with the edit queue injected into every page (tools/edits/README.md).

    python3 tools/edits/serve.py [--port 8765] [--host 127.0.0.1]

Then open a built page through it, e.g. http://127.0.0.1:8765/settlements/girder/girder.html, Alt+click a spot,
type the change and press Ctrl+Enter. Each request lands in edits/pending/<id>.json (git-ignored);
`python3 tools/edits/pending.py` lists them for Claude. Built files are served unchanged on disk: the
<script> tag is added on the way out, so no build, hash or port baseline is touched.

Standard library only. Binds to localhost unless --host says otherwise; anyone who can reach the port can
queue notes and read the repo's files, so do not expose it beyond your own network.
"""
import argparse, datetime, functools, http.server, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERE = os.path.dirname(os.path.abspath(__file__))
PENDING = os.path.join(ROOT, 'edits', 'pending')
TAG = b'<script src="/__edits.js"></script>'
MAX = 1 << 20


def build_of(page):
    """The build folder (holding build.py) that a page path lives in, relative to the repo, or ''."""
    d = os.path.dirname(os.path.normpath(os.path.join(ROOT, page.lstrip('/'))))
    while d.startswith(ROOT) and d != ROOT:
        if os.path.isfile(os.path.join(d, 'build.py')):
            return os.path.relpath(d, ROOT).replace(os.sep, '/')
        d = os.path.dirname(d)
    return ''


def pending(build=None):
    if not os.path.isdir(PENDING):
        return []
    out = []
    for f in sorted(os.listdir(PENDING)):
        if f.endswith('.json') and (build is None or f.split('--')[1:2] == [build.replace('/', '.')]):
            out.append(f)
    return out


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        path = self.path.split('?', 1)[0]
        if path == '/__edits.js':
            return self.send(open(os.path.join(HERE, 'edit-queue.js'), 'rb').read(), 'text/javascript; charset=utf-8')
        if path == '/__edits':
            q = re.search(r'page=([^&]+)', self.path)
            b = build_of(http.server.urllib.parse.unquote(q.group(1))) if q else None
            return self.send(json.dumps({'pending': len(pending(b))}).encode(), 'application/json')
        fs = self.translate_path(path)
        if fs.endswith('.html') and os.path.isfile(fs):
            html = open(fs, 'rb').read()
            i = html.rfind(b'</body>')
            html = html[:i] + TAG + html[i:] if i >= 0 else html + TAG
            return self.send(html, 'text/html; charset=utf-8')
        return super().do_GET()

    def do_POST(self):
        if self.path.split('?', 1)[0] != '/__edits':
            return self.send_error(404)
        n = int(self.headers.get('Content-Length') or 0)
        if not 0 < n <= MAX:
            return self.send_error(413)
        try:
            rec = json.loads(self.rfile.read(n))
            assert isinstance(rec, dict) and isinstance(rec.get('note'), str) and rec['note'].strip()
        except Exception:
            return self.send_error(400, 'expected a JSON object with a note')
        build = build_of(str(rec.get('page', '')))
        now = datetime.datetime.now()
        os.makedirs(PENDING, exist_ok=True)
        stem = '%s--%s' % (now.strftime('%Y%m%d-%H%M%S'), (build or 'unknown').replace('/', '.'))
        rid, k = stem, 1
        while os.path.exists(os.path.join(PENDING, rid + '.json')):
            k += 1; rid = '%s-%d' % (stem, k)
        rec = dict(id=rid, build=build, received=now.isoformat(timespec='seconds'), **rec)
        with open(os.path.join(PENDING, rid + '.json'), 'w', encoding='utf-8') as f:
            json.dump(rec, f, indent=1)
            f.write('\n')
        print('queued %s: %s' % (rid, rec['note'][:80]))
        self.send(json.dumps({'id': rid, 'pending': len(pending(build))}).encode(), 'application/json')

    def send(self, body, ctype):
        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):      # quiet: only errors and queued edits
        if args and str(args[1])[:1] in '45':
            super().log_message(fmt, *args)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--port', type=int, default=8765)
    ap.add_argument('--host', default='127.0.0.1')
    a = ap.parse_args()
    srv = http.server.ThreadingHTTPServer((a.host, a.port), functools.partial(Handler, directory=ROOT))
    print('edit queue: http://%s:%d/  (pages get Alt+click notes; queue in %s)' % (a.host, a.port, os.path.relpath(PENDING, ROOT)))
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == '__main__':
    main()
