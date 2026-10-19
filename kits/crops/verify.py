#!/usr/bin/env python3
"""Headless check for the Crops kit.

  python3 verify.py dist/crops.html --assert

Runs the node tests (tests/test-crops.js), then loads the page in headless Chromium through the shared harness (tools/harness.py),
waits for window._ready, and checks the sheet: no page errors, every biome draws crops with their cards, and a dark-beds
checkbox adds the alecap. No WebGL is needed (the page is DOM only).
"""
import argparse, asyncio, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness as _h
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass

CHECK_JS = """()=>{const A=window._api,C=A.CROPS,R=[];
 const names=Object.keys(C.BIOMES);let bad=[];
 for(const b of names){A.state.biome=b;A.state.dark=false;A.draw();const n=A.count();if(n<10)bad.push(b+':'+n);}
 R.push({name:'every biome draws crops',ok:bad.length===0,detail:bad.join(', ')||names.length+' biomes'});
 A.state.biome='swlowlands';A.draw();const imgs=[...document.querySelectorAll('.c img')],blank=imgs.filter(i=>!i.complete||!i.naturalWidth);
 R.push({name:'every card image decodes',ok:imgs.length>5&&blank.length===0,detail:imgs.length+' images, '+blank.length+' blank'});
 A.state.biome='xanadu';A.state.dark=false;A.draw();const off=!!document.querySelector('.c[data-id=alecap]');
 A.state.dark=true;A.draw();const on=!!document.querySelector('.c[data-id=alecap]');
 R.push({name:'dark beds bring the alecap',ok:!off&&on,detail:'without: '+off+', with: '+on});
 A.state.biome='nhighlands';A.state.dark=false;A.draw();
 R.push({name:'the northern highlands can make a plaid',ok:/plaid \\(own dyes\\): yes/.test(document.querySelector('.pal').textContent),detail:document.querySelector('.pal').textContent.slice(0,80)});
 R.push({name:'error panel empty',ok:document.getElementById('errs').textContent.length===0,detail:''});
 return R;}"""


async def run(page_path, do_assert):
    from playwright.async_api import async_playwright
    errors = []
    async with async_playwright() as p:
        b = await _h.launch_chromium(p)
        pg = await b.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        await pg.goto('file:///' + os.path.abspath(page_path).replace(os.sep, '/'), wait_until='load', timeout=120000)
        await pg.wait_for_function('window._ready===true', timeout=60000)
        res = await pg.evaluate(CHECK_JS)
        await b.close()
    fails = 0
    for r in res:
        print(('PASS  ' if r['ok'] else 'FAIL  ') + r['name'] + ('  (' + r['detail'] + ')' if r['detail'] else ''))
        fails += 0 if r['ok'] else 1
    if errors:
        print('PAGE ERRORS:', *errors, sep='\n  '); fails += 1
    return fails


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('page'); ap.add_argument('--assert', dest='do_assert', action='store_true')
    a = ap.parse_args()
    node = subprocess.run(['node', os.path.join(HERE, 'tests', 'test-crops.js')])
    fails = 1 if node.returncode else 0
    fails += asyncio.run(run(a.page, a.do_assert))
    print('\n%s' % ('FAILED' if fails else 'all passed'))
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
