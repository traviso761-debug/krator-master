#!/usr/bin/env python3
"""Serve Hook's pages and let the site editor save into the repo (the model: settlements/voth/serve.py).

    python3 serve.py [port]          # default 8814; open http://127.0.0.1:8814/dist/hook-site.html

A static server rooted at this folder, plus one write: POST /save/hook-site with the site JSON writes
site/hook-site.json (checked to be a site object first: districts, markers, avenues and hosts lists). The next
`python3 build.py` inlines it into dist/hook.html (and the editor), so commit it with the work. Without the server
(the page opened from a file, or served by anything else) the editor's save button downloads hook-site.json instead.
Local use only: it binds 127.0.0.1.
"""
import http.server, json, os, re, socketserver, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SITES = {'/save/hook-site': os.path.join(HERE, 'site', 'hook-site.json')}


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
        n = int(self.headers.get('Content-Length') or 0)
        if n <= 0 or n > 16 * 1024 * 1024:
            return self.send_error(413)
        path = SITES.get(self.path.split('?', 1)[0])
        if not path:
            return self.send_error(404)
        try:
            data = json.loads(self.rfile.read(n).decode('utf-8'))
            if not isinstance(data, dict) or data.get('site') != 'hook' or not all(isinstance(data.get(k), list) for k in ('districts', 'markers', 'avenues', 'hosts')):
                raise ValueError('not a Hook site object (site: "hook" with districts, markers, avenues and hosts lists)')
        except Exception as e:
            return self.send_error(400, str(e))
        os.makedirs(os.path.dirname(path), exist_ok=True)
        text = json.dumps(data, indent=1, ensure_ascii=False)
        text = re.sub(r'\[\s*(-?[\d.eE+-]+),\s*(-?[\d.eE+-]+)\s*\]', r'[\1, \2]', text)   # a point on one line
        text = re.sub(r'\[\s*(-?[\d.eE+-]+),\s*(-?[\d.eE+-]+),\s*(-?[\d.eE+-]+)\s*\]', r'[\1, \2, \3]', text)   # a grid row too
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(text + '\n')
        print('saved site/hook-site.json: %d districts, %d markers, %d avenues, %d hosts' % tuple(len(data[k]) for k in ('districts', 'markers', 'avenues', 'hosts')))
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'saved')


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8814
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(('127.0.0.1', port), Handler) as s:
        print('serving %s on http://127.0.0.1:%d/  (the editor: /dist/hook-site.html)' % (HERE, port))
        s.serve_forever()
