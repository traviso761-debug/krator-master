"""Run a check script in a built Iziz page headless and write what it returns to a file (verify.py --eval cuts at 3000
characters). python3 towers/runcheck.py dist/iziz-ixtest.html out.txt "IZWALKCHECK({list:2000})" [more expressions...]
Each expression runs after towers/walkcheck.js, doorcheck.js and zcheck.js are loaded; a value that is not a string is JSON; a promise is awaited."""
import asyncio, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'tools'))
import harness  # noqa: E402
from playwright.async_api import async_playwright  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))


async def main(html, out, exprs):
    with open(os.path.join(HERE, 'walkcheck.js'), encoding='utf-8') as f:
        wc = f.read()
    with open(os.path.join(HERE, 'doorcheck.js'), encoding='utf-8') as f:
        dc = f.read()
    with open(os.path.join(HERE, 'zcheck.js'), encoding='utf-8') as f:
        zc = f.read()
    folder = os.path.dirname(os.path.abspath(html))
    async with async_playwright() as p:
        browser = await harness.launch_chromium(p)
        with harness.serve(folder) as port:
            pg, errs, ready = await harness.open_page(browser, html, port, size="640x400")
            await pg.add_script_tag(content=wc)
            await pg.add_script_tag(content=dc)
            await pg.add_script_tag(content=zc)
            res = []
            for e in exprs:
                v = await pg.evaluate("async ()=>{const v=await (" + e + ");return typeof v==='string'?v:JSON.stringify(v,null,1);}")
                res.append('== ' + e + '\n' + v)
        await browser.close()
    with open(out, 'w', encoding='utf-8', newline='\n') as f:
        f.write(('ready\n' if ready else 'NOT READY\n') + '\n'.join(errs[:5]) + '\n' + '\n'.join(res) + '\n')


if __name__ == '__main__':
    asyncio.run(main(sys.argv[1], sys.argv[2], sys.argv[3:]))
