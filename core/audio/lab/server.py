#!/usr/bin/env python3
import http.server
import socketserver
import os
import json
import urllib.parse
import sys

PORT = 8080
LAB_DIR = os.path.abspath(r"C:\Users\travi\Documents\krator-audio\lab")
AUDIO_SAVED_DIR = os.path.abspath(r"C:\Users\travi\Documents\krator-audio\saved_presets")
MASTER_SAVED_DIR = os.path.abspath(r"C:\Users\travi\Documents\krator-master\core\audio\saved_presets")

for d in [AUDIO_SAVED_DIR, MASTER_SAVED_DIR]:
    for sub in ['soundtracks', 'cuts', 'scenes', 'backups']:
        os.makedirs(os.path.join(d, sub), exist_ok=True)

class LabRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=LAB_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/save-preset':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                payload = json.loads(body.decode('utf-8'))

                ptype = payload.get('type', 'soundtracks')
                if ptype not in ['soundtracks', 'cuts', 'scenes', 'backups']:
                    ptype = 'soundtracks'

                raw_name = payload.get('filename') or payload.get('name') or 'preset'
                clean_name = "".join(c for c in raw_name if c.isalnum() or c in ('-', '_')).rstrip()
                if not clean_name:
                    clean_name = 'preset'
                if not clean_name.endswith('.json'):
                    clean_name += '.json'

                # Save to both krator-audio and krator-master
                path1 = os.path.join(AUDIO_SAVED_DIR, ptype, clean_name)
                path2 = os.path.join(MASTER_SAVED_DIR, ptype, clean_name)

                data_to_save = payload.get('data', payload)
                with open(path1, 'w', encoding='utf-8') as f:
                    json.dump(data_to_save, f, indent=2)

                with open(path2, 'w', encoding='utf-8') as f:
                    json.dump(data_to_save, f, indent=2)

                resp = {
                    'ok': True,
                    'type': ptype,
                    'filename': clean_name,
                    'savedTo': [path1, path2],
                    'message': f'Preset successfully written to protected disk folder: {clean_name}'
                }
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(resp).encode('utf-8'))
                print(f"[DISK SAVE] Saved preset to {path1}")
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode('utf-8'))
                return

        super().do_POST()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/list-presets':
            try:
                result = []
                for ptype in ['soundtracks', 'cuts', 'scenes', 'backups']:
                    tdir = os.path.join(AUDIO_SAVED_DIR, ptype)
                    if os.path.exists(tdir):
                        for fname in os.listdir(tdir):
                            if fname.endswith('.json'):
                                fpath = os.path.join(tdir, fname)
                                stat = os.stat(fpath)
                                result.append({
                                    'type': ptype,
                                    'filename': fname,
                                    'relativePath': f'{ptype}/{fname}',
                                    'size': stat.st_size,
                                    'mtime': stat.st_mtime
                                })
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': True, 'presets': result}).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode('utf-8'))
                return

        if parsed.path == '/api/load-preset':
            try:
                qs = urllib.parse.parse_qs(parsed.query)
                rel = qs.get('file', [''])[0].replace('\\', '/')
                # security sanitize
                if '..' in rel or rel.startswith('/'):
                    raise ValueError('Invalid path traversal')
                fpath = os.path.join(AUDIO_SAVED_DIR, rel)
                if not os.path.exists(fpath):
                    raise FileNotFoundError(f'Preset file not found: {rel}')
                with open(fpath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': True, 'data': data}).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode('utf-8'))
                return

        super().do_GET()

class ThreadingHTTPServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True

if __name__ == '__main__':
    print(f"Starting Krator Audio Lab server on port {PORT}...")
    print(f"Serving files from: {LAB_DIR}")
    print(f"Protected Presets Folder: {AUDIO_SAVED_DIR}")
    with ThreadingHTTPServer(("", PORT), LabRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
