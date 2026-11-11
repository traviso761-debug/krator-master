#!/usr/bin/env python3
"""Commit with the message read from a file, after the staged-text check (CORE-IMPROVEMENTS.md item 30; the 2026-11-11
survey: nine sessions lost a commit to `git commit -F -` or `-m` with a PowerShell here-string, whose lines became
pathspecs, and a BOM reached a commit subject).

    python3 tools/commit.py -F msg.txt                 # check the staged files and the message, then git commit -F
    python3 tools/commit.py -F msg.txt --amend         # anything after the message file goes to git commit as it is
    python3 tools/commit.py -F msg.txt --no-check      # skip the staged-text check (the message is still cleaned)

Write the message with the Write tool or an editor, never a here-string. The message is read as UTF-8: a BOM is dropped,
CRLF becomes LF, trailing blanks go; mojibake in it (tools/check_text.py, MOJIBAKE) or an empty subject refuses the commit. The staged files
must pass tools/check_text.py (BOM, mojibake, CRLF).
"""
import os, subprocess, sys, tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import check_text  # noqa: E402


def clean_message(data):
    """(text, [problems]) for a message file's bytes."""
    probs = []
    if data.startswith((b'\xff\xfe', b'\xfe\xff')):
        return '', ['the message file is UTF-16: save it as UTF-8']
    if data.startswith(b'\xef\xbb\xbf'):
        data = data[3:]
    text = data.decode('utf-8', errors='replace').replace('\r\n', '\n').replace('\r', '\n')
    text = '\n'.join(ln.rstrip() for ln in text.split('\n')).strip('\n') + '\n'
    if '�' in text:
        probs.append('the message is not valid UTF-8')
    m = check_text.MOJI.search(text)
    if m:
        probs.append('mojibake in the message: %r' % text[max(0, m.start() - 12):m.end() + 12])
    if not text.split('\n', 1)[0].strip():
        probs.append('the subject line is empty')
    return text, probs


def main(argv, cwd=None):
    cwd = cwd or os.getcwd()
    if '-F' not in argv and '--file' not in argv:
        print(__doc__)
        return 2
    i = argv.index('-F') if '-F' in argv else argv.index('--file')
    path, rest = argv[i + 1], argv[:i] + argv[i + 2:]
    check = '--no-check' not in rest
    rest = [a for a in rest if a != '--no-check']
    if any(a in ('-m', '--message') or a.startswith(('-m', '--message=')) for a in rest):
        print('commit.py: give the message as a file (-F), not -m')
        return 2
    with open(os.path.join(cwd, path), 'rb') as fh:
        text, probs = clean_message(fh.read())
    if check:
        found = check_text.check(check_text.staged(cwd))
        probs += found
    if probs:
        for p in probs:
            print('commit.py: ' + p)
        print('commit.py: nothing committed')
        return 1
    fd, tmp = tempfile.mkstemp(prefix='krator-commit-', suffix='.txt')
    try:
        with os.fdopen(fd, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(text)
        return subprocess.run(['git', 'commit', '-F', tmp] + rest, cwd=cwd).returncode
    finally:
        os.remove(tmp)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
