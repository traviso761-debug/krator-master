#!/usr/bin/env python3
"""Serve the isle demo's site planner and let it save into the repo.

    python3 serve.py [port]          # default 8817; open http://127.0.0.1:8817/dist/isle-site.html (?town=Valapo)

A static server rooted at this folder, plus one write: POST /save/isle-site?town=<name> with one town's site (its
frame and its drawing, as the planner sends it) puts it into site/isle-site.json under towns.<name>, leaving the
other town's entry as it was. The next build inlines the file, so commit it with the work.
Local use only: it binds 127.0.0.1.
"""
import http.server, json, os, re, socketserver, sys, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.path.join(HERE, 'site', 'isle-site.json')
TOWNS = ('Kautoa', 'Valapo')


def write(data):
    os.makedirs(os.path.dirname(FILE), exist_ok=True)
    text = json.dumps(data, indent=1, ensure_ascii=False)
    text = re.sub(r'\[\s*(-?[\d.eE+-]+),\s*(-?[\d.eE+-]+)\s*\]', r'[\1, \2]', text)   # a point on one line
    with open(FILE, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text + '\n')


def merge(town, site):
    """one town's site into the file: checked to be a site with its frame first"""
    if town not in TOWNS:
        raise ValueError('no town %r' % town)
    if not isinstance(site, dict) or not isinstance(site.get('districts'), list) or not isinstance(site.get('markers'), list):
        raise ValueError('not a site object')
    fr = site.get('frame')
    if not isinstance(fr, dict) or not all(isinstance(fr.get(k), (int, float)) for k in ('x', 'z', 'sea')):
        raise ValueError('the site has no frame {x, z, sea}')
    data = json.load(open(FILE, encoding='utf-8')) if os.path.isfile(FILE) else {}
    data.setdefault('site', 'isle-demo')
    data.setdefault('version', 1)
    data.setdefault('towns', {})
    site['town'] = town
    data['towns'][town] = site
    write(data)


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
        u = urllib.parse.urlparse(self.path)
        if u.path != '/save/isle-site':
            return self.send_error(404)
        n = int(self.headers.get('Content-Length') or 0)
        if n <= 0 or n > 8 * 1024 * 1024:
            return self.send_error(413)
        try:
            town = (urllib.parse.parse_qs(u.query).get('town') or [''])[0]
            merge(town, json.loads(self.rfile.read(n).decode('utf-8')))
        except Exception as e:
            return self.send_error(400, str(e))
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'saved')


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8817
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', port), Handler) as httpd:
        print('isle demo site planner: http://127.0.0.1:%d/dist/isle-site.html  (saves to site/isle-site.json)' % port)
        httpd.serve_forever()
