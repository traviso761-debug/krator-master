"""A headless page for the bake steps: the repository served over local HTTP (the builds' pages load their fragments'
relative files), three.js r128 from the CDN routed to the pinned local copy (kits/ancients/three.min.js), SwiftShader
WebGL as every build's verify.py uses it.

  with Page() as P:
      P.open('settlements/yuni/yuni.html', wait="window._ready===true", timeout=600)
      result = P.eval(js_source)
"""
import functools, http.server, os, socketserver, threading, time

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
THREE = os.path.join(ROOT, 'kits', 'ancients', 'three.min.js')
GL_ARGS = ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--js-flags=--max-old-space-size=8192"]


class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


class Page:
    def __init__(self, size=(1280, 800), root=None):
        self.size = size
        self.root = root or ROOT

    def __enter__(self):
        from playwright.sync_api import sync_playwright
        handler = functools.partial(_Quiet, directory=self.root)
        self.httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), handler)
        self.httpd.daemon_threads = True
        self.port = self.httpd.server_address[1]
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()
        self.pw = sync_playwright().start()
        self.browser = self.pw.chromium.launch(args=GL_ARGS)
        self.page = None
        return self

    def open(self, rel, query='', wait='window._ready===true', timeout=600):
        if self.page:
            self.page.close()
        ctx = self.browser.new_context(viewport={'width': self.size[0], 'height': self.size[1]})
        self.page = ctx.new_page()
        self.errors = []
        self.page.on('pageerror', lambda e: self.errors.append(str(e)))
        three = open(THREE, 'rb').read()
        self.page.route('**/three.min.js', lambda r: r.fulfill(body=three, content_type='application/javascript'))
        self.page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**', lambda r: r.fulfill(body=three, content_type='application/javascript'))
        url = 'http://127.0.0.1:%d/%s%s' % (self.port, rel.replace(os.sep, '/'), query)
        t0 = time.time()
        self.page.goto(url, timeout=timeout * 1000)
        self.page.wait_for_function(wait, timeout=timeout * 1000, polling=500)
        time.sleep(2.5)
        return time.time() - t0

    def eval(self, js, arg=None):
        return self.page.evaluate(js, arg)

    def __exit__(self, *a):
        try:
            self.browser.close()
            self.pw.stop()
        finally:
            self.httpd.shutdown()
