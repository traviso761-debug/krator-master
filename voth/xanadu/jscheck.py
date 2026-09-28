#!/usr/bin/env python3
"""Compile-only syntax check for a JS file, using headless Chromium.

build.py cannot check syntax (node is absent). This does the same job with the
playwright chromium that verify.py already depends on: it hands the source to
new Function(), which PARSES and COMPILES it without running a line of it, and
reports the SyntaxError with its line number if it does not parse.

  python jscheck.py path/to/file.js [more.js ...]
"""
import asyncio, os, sys


async def main(paths):
    from playwright.async_api import async_playwright
    bad = 0
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get("PW_CHROME") or None)
        pg = await b.new_page()
        for path in paths:
            src = open(path, encoding='utf-8').read()
            r = await pg.evaluate(
                """(s)=>{try{new Function(s);return {ok:true};}
                   catch(e){return {ok:false,name:e.name,msg:String(e.message),stack:String(e.stack).slice(0,900)};}}""",
                src)
            if r["ok"]:
                print("PARSES OK  %s  (%d lines)" % (path, src.count("\n") + 1))
            else:
                bad += 1
                print("SYNTAX ERROR in %s\n  %s: %s\n%s" % (path, r["name"], r["msg"], r["stack"]))
        await b.close()
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main(sys.argv[1:])))
