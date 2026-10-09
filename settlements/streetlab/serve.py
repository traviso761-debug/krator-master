#!/usr/bin/env python3
"""Serve Streetlab and let the Voth site editor save into the repo.

    python3 serve.py [port]          # default 8813; open /dist/voth-site.html

A static server rooted at this folder, plus two writes: POST /save/voth-site with the site JSON writes
site/voth-site.json (checked to be a site object first). The next build inlines it, so commit it with the work.
POST /save/voth-city-marks writes site/voth-city-marks.json: the owner's marks on the city plan (areas, lines,
points with notes), which the city page reads back when it opens. POST /save/voth-city-edits writes
site/voth-city-edits.json: the city plan editor's placed kit buildings, painted streets and deletions, which the
layout applies (the city page reads it fresh when it opens; the next build inlines it).
Local use only: it binds 127.0.0.1.
"""
import http.server, json, os, re, socketserver, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SITES = {'/save/voth-site': os.path.join(HERE, 'site', 'voth-site.json'),
         '/save/voth-city-marks': os.path.join(HERE, 'site', 'voth-city-marks.json'),
         '/save/voth-city-edits': os.path.join(HERE, 'site', 'voth-city-edits.json')}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=HERE, **k)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, fmt, *a):
        if self.command == 'POST':
            super().log_message(fmt, *a)

    def do_POST(self):
        path = SITES.get(self.path)
        n = int(self.headers.get('Content-Length') or 0)
        if not path:
            return self.send_error(404)
        if n <= 0 or n > 8 * 1024 * 1024:
            return self.send_error(413)
        try:
            data = json.loads(self.rfile.read(n).decode('utf-8'))
            if self.path == '/save/voth-city-marks':
                if not isinstance(data, dict) or not isinstance(data.get('marks'), list):
                    raise ValueError('not a marks object')
            elif self.path == '/save/voth-city-edits':
                if not isinstance(data, dict) or not all(isinstance(data.get(k), list) for k in ('buildings', 'streets', 'del')):
                    raise ValueError('not an edits object')
            elif not isinstance(data, dict) or not isinstance(data.get('districts'), list) or not isinstance(data.get('markers'), list):
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
