#!/usr/bin/env python3
"""Run one of the repo's node tests inside Playwright's Chromium, on a machine with no node.

    python3 tools/node_in_chromium.py core/tags/test-tags.js          # from the repo root; exit code as node's
    python3 tools/node_in_chromium.py core/tags/test-tags.js --root DIR   # another tree (an archive of origin/main, say)
    python3 tools/node_in_chromium.py godot/tools/atmos_golden.js --write   # a generator: what it writes is saved

A small CommonJS shim: require() of relative files, fs.readFileSync / existsSync / readdirSync (served from the tree by a
local HTTP server and read with synchronous XHR), path.join / dirname, process.argv and process.exit, `global` and
require.main. writeFileSync is refused unless --write: then the files come back to this script, which saves them under
the tree when the script exits 0. require('crypto') is refused (core/rand's test needs it). Proven on
core/tags/test-tags.js: an archive of origin/main reproduced its pinned export digest. Needs pip playwright and its Chromium.
"""
import asyncio, http.server, os, socketserver, sys, threading, json
argv = sys.argv[1:]
root = os.getcwd()
if '--root' in argv:
    i = argv.index('--root'); root = os.path.abspath(argv[i + 1]); del argv[i:i + 2]
write = '--write' in argv
if write: argv.remove('--write')
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
const FILES={},WRITE=%WRITE%;
const fs={readFileSync:(p)=>norm(p) in FILES?FILES[norm(p)]:get(p),existsSync:p=>{try{get(p);return true;}catch(e){return false;}},writeFileSync:(p,d)=>{if(!WRITE)throw new Error('writeFileSync refused in the shim (pass --write)');FILES[norm(p)]=String(d);},readdirSync:p=>{const h=get(norm(p)+'/');return [...h.matchAll(/href="([^"?\/]+)\/?"/g)].map(m=>decodeURIComponent(m[1]));}};
const cache={};let MAIN=null;globalThis.global=globalThis;
// crypto: createHash('sha256') only (update with strings or bytes, digest('hex')), a plain FIPS 180-4 SHA-256
function sha256(bytes){const K=[],H=[];let n=2,c=0;const fr=x=>(x-Math.floor(x))*4294967296|0;
 while(c<64){let p=1;for(let d=2;d*d<=n;d++)if(n%d===0){p=0;break;}if(p){if(c<8)H[c]=fr(Math.pow(n,1/2));K[c]=fr(Math.pow(n,1/3));c++;}n++;}
 const L=bytes.length,m=new Uint8Array(((L+9+63)>>6)<<6);m.set(bytes);m[L]=0x80;const dv=new DataView(m.buffer);dv.setUint32(m.length-4,L*8>>>0);dv.setUint32(m.length-8,Math.floor(L/536870912));
 const w=new Int32Array(64),r=(x,s)=>x>>>s|x<<32-s;
 for(let o=0;o<m.length;o+=64){for(let i=0;i<16;i++)w[i]=dv.getInt32(o+i*4);
  for(let i=16;i<64;i++){const a=w[i-15],b=w[i-2];w[i]=w[i-16]+(r(a,7)^r(a,18)^a>>>3)+w[i-7]+(r(b,17)^r(b,19)^b>>>10)|0;}
  let[a,b,cc,d,e,f,g,h]=H;
  for(let i=0;i<64;i++){const t1=h+(r(e,6)^r(e,11)^r(e,25))+(e&f^~e&g)+K[i]+w[i]|0,t2=(r(a,2)^r(a,13)^r(a,22))+(a&b^a&cc^b&cc)|0;h=g;g=f;f=e;e=d+t1|0;d=cc;cc=b;b=a;a=t1+t2|0;}
  H[0]=H[0]+a|0;H[1]=H[1]+b|0;H[2]=H[2]+cc|0;H[3]=H[3]+d|0;H[4]=H[4]+e|0;H[5]=H[5]+f|0;H[6]=H[6]+g|0;H[7]=H[7]+h|0;}
 return H.map(x=>(x>>>0).toString(16).padStart(8,'0')).join('');}
const crypto={createHash:alg=>{if(alg!=='sha256')throw new Error('shim crypto: sha256 only');const parts=[];
 const o={update:d=>{parts.push(typeof d==='string'?new TextEncoder().encode(d):new Uint8Array(d));return o;},
  digest:enc=>{let n=0;for(const p of parts)n+=p.length;const all=new Uint8Array(n);let k=0;for(const p of parts){all.set(p,k);k+=p.length;}
   const hex=sha256(all);if(enc==='hex')return hex;throw new Error('shim crypto: digest(\'hex\') only');}};return o;}};
function req(from){const r=function(m){if(m==='fs')return fs;if(m==='path')return path;if(m==='crypto')return crypto;
 // './x' and '../x' are relative to the caller; anything else is a path path.join already rooted at the tree (node's absolute)
 const p=/^\.\.?\//.test(m)?norm(path.dirname(from)+'/'+m):norm(m);if(cache[p])return cache[p].exports;const mod={exports:{}};cache[p]=mod;if(!MAIN)MAIN=mod;const src=get(p);
 Function('module','exports','require','__dirname','__filename','globalThis',src)(mod,mod.exports,req(p),path.dirname(p),p,globalThis);return mod.exports;};
 Object.defineProperty(r,'main',{get:()=>MAIN});return r;}
globalThis.process={argv:['node','%TEST%'].concat(%ARGS%),exit:c=>{throw {exitCode:c};},env:{}};
const log=console.log;console.log=(...a)=>OUT.push(a.join(' '));
let code=0;try{req('')('%TEST%');}catch(e){if(e&&e.exitCode!==undefined)code=e.exitCode;else{OUT.push('THROW '+(e&&e.stack||e));code=2;}}
window.__out={code,out:OUT,files:FILES};})();
"""
async def main():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        await pg.goto(f'http://127.0.0.1:{port}/')
        await pg.evaluate(SHIM.replace('%PORT%', str(port)).replace('%TEST%', test).replace('%ARGS%', json.dumps(args)).replace('%WRITE%', 'true' if write else 'false'))
        await pg.wait_for_function('window.__out', timeout=120000)
        r = await pg.evaluate('window.__out')
        print('\n'.join(r['out']))
        # --write: what the script wrote comes back here and is saved under the tree (only when it exited cleanly)
        for rel, data in sorted((r.get('files') or {}).items()):
            if r['code'] == 0:
                dst = os.path.join(root, *rel.split('/'))
                with open(dst, 'w', encoding='utf-8', newline='') as f: f.write(data)
                print('node_in_chromium: wrote', rel, '(%d bytes)' % len(data))
        await b.close()
        sys.exit(r['code'])
asyncio.run(main())
