#!/usr/bin/env python3
"""Run one of the repo's node tests inside Playwright's Chromium, on a machine with no node.

    python3 tools/node_in_chromium.py core/tags/test-tags.js          # from the repo root; exit code as node's
    python3 tools/node_in_chromium.py core/tags/test-tags.js --root DIR   # another tree (an archive of origin/main, say)

A small CommonJS shim: require() of relative files, fs.readFileSync / existsSync / readdirSync (served from the tree by a
local HTTP server and read with synchronous XHR), path.join / dirname, process.argv and process.exit. writeFileSync is
refused (a --write run needs real node), and so is require('crypto') (core/rand's test needs it). Proven on
core/tags/test-tags.js: an archive of origin/main reproduced its pinned export digest. Needs pip playwright and its Chromium.
"""
import asyncio, http.server, os, socketserver, sys, threading, json
argv = sys.argv[1:]
root = os.getcwd()
if '--root' in argv:
    i = argv.index('--root'); root = os.path.abspath(argv[i + 1]); del argv[i:i + 2]
test, args = argv[0].replace('\\', '/'), argv[1:]
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


httpd = socketserver.TCPServer(("127.0.0.1", 0), lambda *x, **k: Quiet(*x, directory=root, **k))
port = httpd.server_address[1]
threading.Thread(target=httpd.serve_forever, daemon=True).start()
SHIM = r"""
(async()=>{const OUT=[];const base='http://127.0.0.1:%PORT%/';
function norm(p){const parts=[];for(const s of p.split('/')){if(!s||s==='.')continue;if(s==='..')parts.pop();else parts.push(s);}return parts.join('/');}
function get(p){const x=new XMLHttpRequest();x.open('GET',base+norm(p),false);x.send();if(x.status!==200)throw new Error('ENOENT '+p);return x.responseText;}
const path={join:(...a)=>norm(a.join('/')),dirname:p=>norm(p).split('/').slice(0,-1).join('/'),basename:p=>p.split('/').pop(),resolve:(...a)=>norm(a.join('/'))};
const fs={readFileSync:(p)=>get(p),existsSync:p=>{try{get(p);return true;}catch(e){return false;}},writeFileSync:()=>{throw new Error('writeFileSync refused in the shim');},readdirSync:p=>{const h=get(norm(p)+'/');return [...h.matchAll(/href="([^"?\/]+)\/?"/g)].map(m=>decodeURIComponent(m[1]));}};
const cache={};
function req(from){return function(m){if(m==='fs')return fs;if(m==='path')return path;if(m==='crypto')throw new Error('no crypto in shim');
 const p=norm(path.dirname(from)+'/'+m);if(cache[p])return cache[p].exports;const mod={exports:{}};cache[p]=mod;const src=get(p);
 Function('module','exports','require','__dirname','__filename','globalThis',src)(mod,mod.exports,req(p),path.dirname(p),p,globalThis);return mod.exports;};}
globalThis.process={argv:['node','%TEST%'].concat(%ARGS%),exit:c=>{throw {exitCode:c};},env:{}};
const log=console.log;console.log=(...a)=>OUT.push(a.join(' '));
let code=0;try{req('')('%TEST%');}catch(e){if(e&&e.exitCode!==undefined)code=e.exitCode;else{OUT.push('THROW '+(e&&e.stack||e));code=2;}}
window.__out={code,out:OUT};})();
"""
async def main():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        await pg.goto(f'http://127.0.0.1:{port}/')
        await pg.evaluate(SHIM.replace('%PORT%', str(port)).replace('%TEST%', test).replace('%ARGS%', json.dumps(args)))
        await pg.wait_for_function('window.__out', timeout=120000)
        r = await pg.evaluate('window.__out')
        print('\n'.join(r['out']))
        await b.close()
        sys.exit(r['code'])
asyncio.run(main())
