#!/usr/bin/env python3
"""Config-driven static server for the City of Iziz pages.

Usage:
  python3 server.py [--config site.toml] [--host ADDR] [--port N]
  python3 server.py --check      validate the config and print the route table

Only paths listed in the config are served; everything else is 404.
Send SIGHUP (systemctl --user reload iziz) to re-read the config without a restart.
"""
import argparse
import email.utils
import gzip
import http.server
import mimetypes
import os
import shutil
import signal
import sys
import tomllib
import urllib.parse

ROOT = os.path.dirname(os.path.abspath(__file__))
DEFAULT_CONFIG = os.path.join(ROOT, "site.toml")
TEXT_TYPES = ("application/javascript", "application/json", "image/svg+xml", "application/toml")
GZIP_MIN = 1024   # smaller bodies are not worth compressing


class ConfigError(Exception):
    pass


class Site:
    """An immutable snapshot of the config; swapped whole on reload."""

    def __init__(self, path):
        self.path = path
        base = os.path.dirname(os.path.abspath(path))
        try:
            with open(path, "rb") as f:
                raw = tomllib.load(f)
        except (OSError, tomllib.TOMLDecodeError) as e:
            raise ConfigError(f"{path}: {e}") from e

        server = raw.get("server", {})
        self.host = str(server.get("host", "0.0.0.0"))
        self.port = int(server.get("port", 8000))
        self.log_requests = bool(server.get("log_requests", True))
        self.health = server.get("health")
        self.headers = {str(k): str(v) for k, v in server.get("headers", {}).items()}

        # routes: exact URL path -> (file, headers, title, canonical path)
        self.routes = {}
        self.route_list = []
        for i, r in enumerate(raw.get("route", [])):
            if not r.get("enabled", True):
                continue
            where = f"route #{i + 1}"
            if "path" not in r or "file" not in r:
                raise ConfigError(f"{where}: needs both 'path' and 'file'")
            file = os.path.join(base, r["file"])
            headers = {**self.headers, **{str(k): str(v) for k, v in r.get("headers", {}).items()}}
            entry = (file, headers, r.get("title", ""), r["path"])
            self.route_list.append((r["path"], list(r.get("aliases", [])), file, entry[2]))
            for p in [r["path"], *r.get("aliases", [])]:
                p = self._norm(p, where)
                if p in self.routes:
                    raise ConfigError(f"{where}: path {p!r} is already routed")
                self.routes[p] = entry

        # mounts: URL prefix -> directory (no listings, no escaping the directory)
        self.mounts = []
        for i, m in enumerate(raw.get("mount", [])):
            if not m.get("enabled", True):
                continue
            where = f"mount #{i + 1}"
            if "prefix" not in m or "dir" not in m:
                raise ConfigError(f"{where}: needs both 'prefix' and 'dir'")
            prefix = self._norm(m["prefix"], where)
            headers = {**self.headers, **{str(k): str(v) for k, v in m.get("headers", {}).items()}}
            self.mounts.append((prefix, os.path.realpath(os.path.join(base, m["dir"])), headers))
        self.mounts.sort(key=lambda m: len(m[0]), reverse=True)

    @staticmethod
    def _norm(p, where):
        if not isinstance(p, str) or not p.startswith("/"):
            raise ConfigError(f"{where}: path {p!r} must start with '/'")
        return p.rstrip("/") or "/"

    def problems(self):
        """Non-fatal issues: missing files and directories."""
        out = []
        for path, _, file, _ in self.route_list:
            if not os.path.isfile(file):
                out.append(f"route {path}: file not found: {file}")
        for prefix, d, _ in self.mounts:
            if not os.path.isdir(d):
                out.append(f"mount {prefix}: directory not found: {d}")
        return out

    def resolve(self, path):
        """Return (file, headers) for a request path, or (None, None)."""
        key = path.rstrip("/") or "/"
        if key in self.routes:
            file, headers, _, _ = self.routes[key]
            return file, headers
        for prefix, d, headers in self.mounts:
            if key.startswith(prefix + "/"):
                target = os.path.realpath(os.path.join(d, key[len(prefix) + 1:]))
                if os.path.commonpath([d, target]) == d and os.path.isfile(target):
                    return target, headers
        return None, None


SITE = None


class Handler(http.server.BaseHTTPRequestHandler):
    server_version = "Iziz/1.1"
    protocol_version = "HTTP/1.1"   # keep-alive: one connection serves the page and everything it loads

    def do_GET(self):
        self.serve(send_body=True)

    def do_HEAD(self):
        self.serve(send_body=False)

    def serve(self, send_body):
        site = SITE
        path = urllib.parse.unquote(urllib.parse.urlsplit(self.path).path)

        if site.health and path == site.health:
            body = b"ok\n"
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            if send_body:
                self.wfile.write(body)
            return

        file, headers = site.resolve(path)
        if file is None:
            self.send_error(404)
            return
        try:
            f = open(file, "rb")
        except OSError as e:
            self.log_error("cannot open %s: %s", file, e)
            self.send_error(404)
            return
        with f:
            st = os.fstat(f.fileno())
            etag = f'"{st.st_mtime_ns:x}-{st.st_size:x}"'
            modified = email.utils.formatdate(st.st_mtime, usegmt=True)
            if self.not_modified(etag, st.st_mtime):
                self.send_response(304)
                self.send_header("ETag", etag)
                self.send_header("Last-Modified", modified)
                for k, v in headers.items():
                    self.send_header(k, v)
                self.end_headers()
                return
            ctype = mimetypes.guess_type(file)[0] or "application/octet-stream"
            text = ctype.startswith("text/") or ctype in TEXT_TYPES
            if text:
                ctype += "; charset=utf-8"
            body = None
            encoding = None
            if text and st.st_size >= GZIP_MIN and "gzip" in self.headers.get("Accept-Encoding", ""):
                body = gzip.compress(f.read(), compresslevel=6, mtime=0)
                encoding = "gzip"
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body) if body is not None else st.st_size))
            self.send_header("Last-Modified", modified)
            self.send_header("ETag", etag)
            if encoding:
                self.send_header("Content-Encoding", encoding)
            self.send_header("Vary", "Accept-Encoding")
            for k, v in headers.items():
                self.send_header(k, v)
            self.end_headers()
            if send_body:
                try:
                    if body is not None:
                        self.wfile.write(body)
                    else:
                        shutil.copyfileobj(f, self.wfile)
                except (BrokenPipeError, ConnectionResetError):
                    pass

    def not_modified(self, etag, mtime):
        """True when the client's cached copy is still current."""
        inm = self.headers.get("If-None-Match")
        if inm:
            return etag in [t.strip() for t in inm.split(",")]
        ims = self.headers.get("If-Modified-Since")
        if ims:
            try:
                since = email.utils.parsedate_to_datetime(ims).timestamp()
            except (TypeError, ValueError):
                return False
            return int(mtime) <= int(since)
        return False

    def log_request(self, code="-", size="-"):
        if SITE.log_requests:
            super().log_request(code, size)

    def log_message(self, fmt, *args):
        # journald adds the timestamp
        print(f"{self.client_address[0]} {fmt % args}", file=sys.stderr, flush=True)


def print_routes(site):
    print(f"config: {site.path}")
    print(f"listen: {site.host}:{site.port}")
    if site.health:
        print(f"health: {site.health}")
    for path, aliases, file, title in site.route_list:
        state = "ok" if os.path.isfile(file) else "MISSING"
        extra = f"  (also {', '.join(aliases)})" if aliases else ""
        print(f"route  {path:<12} -> {os.path.relpath(file, ROOT)} [{state}] {title}{extra}")
    for prefix, d, _ in site.mounts:
        state = "ok" if os.path.isdir(d) else "MISSING"
        print(f"mount  {prefix + '/*':<12} -> {os.path.relpath(d, ROOT)}/ [{state}]")


def main():
    global SITE
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--config", default=DEFAULT_CONFIG)
    ap.add_argument("--host", help="override [server] host")
    ap.add_argument("--port", type=int, help="override [server] port")
    ap.add_argument("--check", action="store_true", help="validate config, print routes, exit")
    args = ap.parse_args()

    try:
        SITE = Site(args.config)
    except ConfigError as e:
        print(f"config error: {e}", file=sys.stderr)
        sys.exit(1)

    if args.check:
        print_routes(SITE)
        problems = SITE.problems()
        for p in problems:
            print(f"problem: {p}", file=sys.stderr)
        sys.exit(1 if problems else 0)

    for p in SITE.problems():
        print(f"warning: {p}", file=sys.stderr, flush=True)

    host = args.host or SITE.host
    port = args.port or SITE.port

    def reload(signum, frame):
        global SITE
        try:
            new = Site(args.config)
        except ConfigError as e:
            print(f"reload failed, keeping previous config: {e}", file=sys.stderr, flush=True)
            return
        for p in new.problems():
            print(f"warning: {p}", file=sys.stderr, flush=True)
        if (new.host, new.port) != (SITE.host, SITE.port):
            print("note: host/port changes need a restart", file=sys.stderr, flush=True)
        SITE = new
        print(f"reloaded {args.config}: {len(new.route_list)} routes, {len(new.mounts)} mounts",
              file=sys.stderr, flush=True)

    signal.signal(signal.SIGHUP, reload)

    with http.server.ThreadingHTTPServer((host, port), Handler) as httpd:
        print(f"serving {len(SITE.route_list)} routes on http://{host}:{port}/", file=sys.stderr, flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
