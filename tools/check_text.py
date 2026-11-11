#!/usr/bin/env python3
"""Windows text traps in what is about to be committed (CORE-IMPROVEMENTS.md item 30; the 2026-11-11 survey: a BOM from
PowerShell 5.1's `Set-Content -Encoding utf8` reached a commit subject, `Get-Content` read BOM-less UTF-8 as ANSI and the
mojibake was merged once, `*>` writes UTF-16).

    python3 tools/check_text.py                 # the staged files (what `git commit` would record); exit 1 on a finding
    python3 tools/check_text.py --files a b     # these files as they are on disk
    python3 tools/check_text.py --install-hook  # run it as .git/hooks/pre-commit in this clone (opt-in, per clone)

Findings, per file:
  BOM       the file starts with the UTF-8 byte order mark (EF BB BF), or is UTF-16 (FF FE / FE FF)
  MOJIBAKE  UTF-8 read as cp1252 and written back: A-tilde (U+00C3) before U+0080-U+00BF (an e-acute becomes two
            characters), a-circumflex + euro sign (U+00E2 U+20AC: an em dash becomes three), or A-circumflex before
            U+00A0-U+00BF. Written with escapes here, so this file passes itself
            In a file already committed, only mojibake the change ADDS counts (notes that quote it on purpose stay editable).
  CRLF      a carriage return before a newline, in a file .gitattributes does not mark eol=crlf (*.bat)
Binary files (a NUL in the first 8 KB) and Git LFS pointers are skipped. tools/commit.py runs this before it commits.
"""
import os, re, subprocess, sys

MOJI = re.compile('\u00c3[\u0080-\u00bf]|\u00e2\u20ac|\u00c2[\u00a0-\u00bf]')
CRLF_OK = ('.bat', '.cmd')   # .gitattributes: *.bat text eol=crlf


def scan_bytes(name, data, before=None):
    """[(rule, detail)] for one file's bytes. `before`: the file as committed (HEAD), when it was: mojibake counts only
    when the change adds some (a file that quotes it on purpose, as this survey's notes do, can still be edited)."""
    out = []
    if b'\0' in data[:8192] and not data.startswith((b'\xff\xfe', b'\xfe\xff')):
        return out
    if data.startswith(b'version https://git-lfs'):
        return out
    if data.startswith(b'\xef\xbb\xbf'):
        out.append(('BOM', 'starts with a UTF-8 byte order mark'))
    elif data.startswith((b'\xff\xfe', b'\xfe\xff')):
        out.append(('BOM', 'UTF-16 (written by PowerShell `*>` or `Out-File`?): write UTF-8'))
        return out
    text = data.decode('utf-8', errors='replace')
    m = MOJI.search(text)
    if m and before is not None and len(MOJI.findall(text)) <= len(MOJI.findall(before.decode('utf-8', errors='replace'))):
        m = None
    if m:
        line = text.count('\n', 0, m.start()) + 1
        out.append(('MOJIBAKE', 'line %d: %r (UTF-8 read as cp1252 and saved)' % (line, text[max(0, m.start() - 12):m.end() + 12])))
    if b'\r\n' in data and not name.lower().endswith(CRLF_OK):
        out.append(('CRLF', '%d CRLF line ends' % data.count(b'\r\n')))
    return out


def git(args, cwd):
    return subprocess.run(['git'] + args, cwd=cwd, capture_output=True)


def staged(cwd):
    """[(path, bytes as staged, bytes in HEAD or None)] for files added, copied or modified in the index."""
    r = git(['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR'], cwd)
    out = []
    for p in r.stdout.decode('utf-8', errors='replace').split('\0'):
        if p:
            b = git(['show', ':' + p], cwd)
            if b.returncode == 0:
                h = git(['show', 'HEAD:' + p], cwd)
                out.append((p, b.stdout, h.stdout if h.returncode == 0 else None))
    return out


def check(items):
    found = []
    for it in items:
        name, data, before = (tuple(it) + (None,))[:3]
        for rule, detail in scan_bytes(name, data, before):
            found.append('%s  %s: %s' % (rule, name, detail))
    return found


def install_hook(cwd):
    top = git(['rev-parse', '--git-path', 'hooks'], cwd).stdout.decode().strip()
    hooks = os.path.join(cwd, top) if not os.path.isabs(top) else top
    os.makedirs(hooks, exist_ok=True)
    path = os.path.join(hooks, 'pre-commit')
    if os.path.exists(path):
        with open(path, encoding='utf-8', errors='replace') as fh:
            if 'check_text.py' in fh.read():
                print('check_text: the hook is already installed (%s)' % path)
                return 0
        print('check_text: %s exists; add this line to it: python3 tools/check_text.py' % path)
        return 1
    with open(path, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('#!/bin/sh\n# tools/check_text.py: a BOM, mojibake or CRLF in staged text (CORE-IMPROVEMENTS.md item 30)\n'
                 'PY=$(command -v python3 || command -v python)\nexec "$PY" tools/check_text.py\n')
    os.chmod(path, 0o755)
    print('check_text: installed %s' % path)
    return 0


def main(argv, cwd=None):
    cwd = cwd or os.getcwd()
    if '--install-hook' in argv:
        return install_hook(cwd)
    if '--files' in argv:
        items = []
        for p in argv[argv.index('--files') + 1:]:
            with open(os.path.join(cwd, p), 'rb') as fh:
                items.append((p, fh.read()))
    else:
        items = staged(cwd)
    found = check(items)
    for f in found:
        print(f)
    print('check_text: %d file(s), %d finding(s)%s' % (len(items), len(found),
                                                      '; fix them (re-save as UTF-8 without a BOM, LF line ends) and stage again' if found else ''))
    return 1 if found else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
