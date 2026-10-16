#!/usr/bin/env python3
"""Serve Voth's pages and let the Voth site editor and the city plan save into the repo.

    python3 serve.py [port]          # default 8813; open /dist/voth-site.html

A static server rooted at this folder, plus three writes: POST /save/voth-site with the site JSON writes
site/voth-site.json (checked to be a site object first). The next build inlines it, so commit it with the work.
The city page is on core/host (ROADMAP.md section 10, step 6b), whose save route is tools/edits/serve.py's, answered here
too: POST /__save {kind: 'marks' | 'edits', page, data} writes marks.json (the owner's marks on the city plan: areas,
lines, points with notes, which the page reads back when it opens) or edits.json (the editor's core/edits log: placed kit
buildings, painted streets, deletions, plants, which build.py inlines and the layout applies; a draft in the browser
wins until then), and GET /__file?kind=marks reads marks.json back (204 when there is none).
Local use only: it binds 127.0.0.1.
"""
import http.server, json, os, re, socketserver, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SITES = {'/save/voth-site': os.path.join(HERE, 'site', 'voth-site.json')}
SAVE_KINDS = {'edits': ('krator-edits', 'ops'), 'marks': ('krator-marks', 'marks')}   # core/host's (tools/edits/serve.py)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=HERE, **k)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, fmt, *a):
        if self.command == 'POST':
            super().log_message(fmt, *a)

    def do_GET(self):
        if self.path.split('?', 1)[0] == '/__file':   # core/host's marks (94-host-marks.js), or 204 when none was saved
            q = re.search(r'kind=([a-z]+)', self.path)
            f = os.path.join(HERE, q.group(1) + '.json') if q and q.group(1) in SAVE_KINDS else ''
            if not f or not os.path.isfile(f):
                self.send_response(204); self.end_headers(); return
            body = open(f, 'rb').read()
            self.send_response(200); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(body))); self.end_headers()
            return self.wfile.write(body)
        return super().do_GET()

    def do_POST(self):
        n = int(self.headers.get('Content-Length') or 0)
        if n <= 0 or n > 16 * 1024 * 1024:
            return self.send_error(413)
        if self.path.split('?', 1)[0] == '/__save':   # core/host's save route (98-host-edit.js, 94-host-marks.js)
            try:
                req = json.loads(self.rfile.read(n).decode('utf-8'))
                kind, data = req.get('kind'), req.get('data')
                assert kind in SAVE_KINDS and isinstance(data, dict)
                fmt, key = SAVE_KINDS[kind]
                assert data.get('format') == fmt and isinstance(data.get(key), list)
            except Exception:
                return self.send_error(400, 'expected {kind: edits|marks, page, data: a krator-edits or krator-marks object}')
            with open(os.path.join(HERE, kind + '.json'), 'w', encoding='utf-8', newline='\n') as f:
                json.dump(data, f, indent=1, ensure_ascii=False)
                f.write('\n')
            print('saved %s.json: %d %s' % (kind, len(data[key]), key))
            body = json.dumps({'saved': 'settlements/voth/' + kind + '.json'}).encode()
            self.send_response(200); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(body))); self.end_headers()
            return self.wfile.write(body)
        path = SITES.get(self.path)
        if not path:
            return self.send_error(404)
        try:
            data = json.loads(self.rfile.read(n).decode('utf-8'))
            if not isinstance(data, dict) or not isinstance(data.get('districts'), list) or not isinstance(data.get('markers'), list):
                raise ValueError('not a site object')
        except Exception as e:
            return self.send_error(400, str(e))
        os.makedirs(os.path.dirname(path), exist_ok=True)
        text = json.dumps(data, indent=1, ensure_ascii=False)
        text = re.sub(r'\[\s*(-?[\d.eE+-]+),\s*(-?[\d.eE+-]+)\s*\]', r'[\1, \2]', text)   # a point on one line
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(text + '\n')
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'saved')


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8813
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(('127.0.0.1', port), Handler) as s:
        print('serving %s on http://127.0.0.1:%d/' % (HERE, port))
        s.serve_forever()
