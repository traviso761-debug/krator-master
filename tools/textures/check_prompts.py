#!/usr/bin/env python3
"""core/materials/PROMPTS-NEEDED.md holds together (BUGS-2026-11-15.md T19, CORE-IMPROVEMENTS.md item 50): every ``` fence
is closed before the next heading (two blocks had lost their closing fence, so a parser ran one prompt into the next),
and its count line, **Count: N prompts**, says how many prompts the file holds (it was 18 off).

A prompt is a fenced block (one image per block) or a row of a `| id | Material line |` table (a section whose prompts
each take the base template). The count line's prose after N is free.

    python3 tools/textures/check_prompts.py            # the repo's file; exit 1 on a problem
    python3 tools/textures/check_prompts.py <file.md>  # another file of the same shape
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FILE = os.path.join(ROOT, 'core', 'materials', 'PROMPTS-NEEDED.md')
FENCE = re.compile(r'^\s*```')
HEADING = re.compile(r'^#{1,6} ')
COUNT = re.compile(r'\*\*Count: (\d+) prompts?\b')
TABLE_HEAD = re.compile(r'^\|\s*id\s*\|', re.I)
ROW = re.compile(r'^\|\s*`[^`]+`\s*\|')


def check(text):
    """(problems, blocks, rows, the count line's number or None)."""
    lines = text.splitlines()
    problems, blocks, rows, opened, in_table = [], 0, 0, None, False
    for i, ln in enumerate(lines, 1):
        if FENCE.match(ln):
            if opened is None:
                opened = i
            else:
                blocks += 1
                opened = None
            continue
        if opened is not None:
            if HEADING.match(ln):
                problems.append('the fence opened at line %d is not closed before the heading at line %d (%s)' % (opened, i, ln.strip()[:60]))
                opened = None   # count on from the heading, as a reader would
            continue
        if TABLE_HEAD.match(ln):
            in_table = True
        elif in_table and ROW.match(ln):
            rows += 1
        elif not ln.startswith('|'):
            in_table = False
    if opened is not None:
        problems.append('the fence opened at line %d is never closed' % opened)
    n = sum(1 for ln in lines if FENCE.match(ln))
    if n % 2:
        problems.append('%d fence lines: an odd count, so one block is open' % n)
    m = COUNT.search(text)
    said = int(m.group(1)) if m else None
    if said is None:
        problems.append('no count line (**Count: N prompts**)')
    elif said != blocks + rows:
        problems.append('the count line says %d prompts; the file holds %d (%d fenced blocks, %d table rows)' % (said, blocks + rows, blocks, rows))
    return problems, blocks, rows, said


def main(argv):
    path = argv[0] if argv else FILE
    with open(path, encoding='utf-8') as fh:
        problems, blocks, rows, said = check(fh.read())
    name = os.path.relpath(path, ROOT).replace(os.sep, '/')
    for p in problems:
        print('FAIL  %s: %s' % (name, p))
    if not problems:
        print('check_prompts: %s holds %d prompts (%d fenced blocks, %d table rows), as its count line says' % (name, blocks + rows, blocks, rows))
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
