#!/usr/bin/env python3
"""A small, fast JavaScript lexer shared by the lints in tools/ (check_assembly.py first).

    import jsscan
    for kind, value, start, end, line in jsscan.scan(text): ...

It does not parse; it splits source into tokens well enough that a lint can skip what is not code. Kinds:

  code             one identifier, keyword, number or punctuator ('=>', '===', '?.', '{' ...); one token each
  string           a '...' or "..." literal, quotes included
  template         one raw chunk of a template literal, without its delimiters (`, ${ and }); start/end span the chunk
  tmpl_expr_start  the '${' that opens a template expression; the expression follows as ordinary tokens
  tmpl_expr_end    the '}' that closes it; the template's next chunk follows
  regex            a /.../flags literal
  line_comment     // ... to the end of the line (the newline is not part of it)
  block_comment    /* ... */

A template `a${b}c` is: template 'a', tmpl_expr_start, code 'b', tmpl_expr_end, template 'c'. Templates nest to any depth
(an expression can hold a template that holds an expression ...). `line` is the 1-based line of `start`.

Regex or division: a '/' starts a regex unless the previous significant token ends an operand: an identifier that is
not an operator keyword (return, typeof, case ...), a number, a string, a template's closing chunk, a regex, ')', ']' or
'}'. ('}' is taken as an operand: a regex that starts a statement right after a block is rare in this repo, and a
division after an object literal in an expression rarer still; either way the slip is local to one line.)

Malformed input never raises: an unterminated string or regex lexes its first character as punctuation and goes on;
an unterminated comment or template runs to the end of the text.

`python3 tools/jsscan.py` runs the self-test; `python3 tools/jsscan.py FILE` prints a token count and the time taken.
"""
import re
import sys

_CODE = re.compile(r'''
   (?P<ws>[ \t\r\n\f\v ﻿  ]+)
 | (?P<id>[A-Za-z_$\u0080-￿][\w$\u0080-￿]*)
 | (?P<num>(?:0[xXbBoO][0-9a-fA-F_]+|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d+)?)n?)
 | (?P<str>"[^"\\\n]*(?:\\[\s\S][^"\\\n]*)*"|'[^'\\\n]*(?:\\[\s\S][^'\\\n]*)*')
 | (?P<lc>//[^\n]*)
 | (?P<bc>/\*)
 | (?P<slash>/=?)
 | (?P<bt>`)
 | (?P<lb>\{)
 | (?P<rb>\})
 | (?P<p>>>>=|\.\.\.|===|!==|\*\*=|<<=|>>=|>>>|&&=|\|\|=|\?\?=|=>|==|!=|<=|>=|&&|\|\||\?\?|\?\.(?!\d)|\+\+|--
       |[-+*%&|^/]=|<<|>>|\*\*|[()\[\];,<>+\-*%&|^!~?:=.@\#])
 | (?P<other>[\s\S])
''', re.X)

_REGEX = re.compile(r'/(?![*/])(?:[^\\/\[\n]|\\[^\n]|\[(?:[^\]\\\n]|\\[^\n])*\])+/[A-Za-z]*')
_TCHUNK = re.compile(r'[^`\\$]*(?:(?:\\[\s\S]|\$(?!\{))[^`\\$]*)*')

# after these identifiers an expression starts, so a '/' opens a regex
_KW_BEFORE_EXPR = frozenset('return typeof instanceof in of new delete void throw case do else yield await extends'.split())


def scan(text):
    """Yield (kind, value, start, end, line) for every token of `text` (see the module docstring)."""
    n = len(text)
    pos = 0
    line = 1
    lpos = 0                 # line is the line of lpos
    stack = []               # '{' or 'tmpl' (an open ${)
    operand = False          # does the previous significant token end an operand? ('/' is then division)
    count = text.count
    match_code = _CODE.match
    while pos < n:
        m = match_code(text, pos)
        g = m.lastgroup
        s = pos
        pos = e = m.end()
        if g == 'ws':
            continue
        if s != lpos:
            line += count('\n', lpos, s)
            lpos = s
        if g == 'id':
            v = m.group()
            operand = v not in _KW_BEFORE_EXPR
            yield ('code', v, s, e, line)
        elif g == 'p':
            v = m.group()
            operand = v == ')' or v == ']'
            yield ('code', v, s, e, line)
        elif g == 'num':
            operand = True
            yield ('code', m.group(), s, e, line)
        elif g == 'str':
            operand = True
            yield ('string', m.group(), s, e, line)
        elif g == 'lc':
            yield ('line_comment', m.group(), s, e, line)
        elif g == 'bc':
            j = text.find('*/', s + 2)
            pos = e = n if j < 0 else j + 2
            yield ('block_comment', text[s:e], s, e, line)
        elif g == 'lb':
            stack.append('{')
            operand = False
            yield ('code', '{', s, e, line)
        elif g == 'rb':
            if stack and stack[-1] == 'tmpl':
                stack.pop()
                yield ('tmpl_expr_end', '}', s, e, line)
                pos = yield from _template(text, e, stack, line, lpos)
                operand = True
                continue
            if stack:
                stack.pop()
            operand = True
            yield ('code', '}', s, e, line)
        elif g == 'slash':
            if not operand:
                r = _REGEX.match(text, s)
                if r:
                    pos = e = r.end()
                    operand = True
                    yield ('regex', r.group(), s, e, line)
                    continue
            operand = False
            yield ('code', m.group(), s, e, line)
        elif g == 'bt':
            pos = yield from _template(text, e, stack, line, lpos)
            operand = True
        else:
            operand = False
            yield ('code', m.group(), s, e, line)


def _template(text, p, stack, line, lpos):
    """Yield the chunk that starts at p (just after a ` or a closing } of ${...}); return where code resumes.
    Pushes 'tmpl' when the chunk ends at ${, so the scanner's next '}' at that depth resumes the template."""
    m = _TCHUNK.match(text, p)
    e = m.end()
    line += text.count('\n', lpos, p)
    yield ('template', m.group(), p, e, line)
    if text.startswith('${', e):
        stack.append('tmpl')
        yield ('tmpl_expr_start', '${', e, e + 2, line + text.count('\n', p, e))
        return e + 2
    return e + 1 if e < len(text) else e     # past the closing backtick (or at the end of an unterminated one)


def _selftest():
    def kinds(src):
        return [(k, v) for k, v, *_ in scan(src)]

    def codes(src):
        return [v for k, v, *_ in scan(src) if k == 'code']

    cases = 0

    def check(cond, msg):
        nonlocal cases
        cases += 1
        if not cond:
            raise AssertionError(msg)

    # a regex with '/' in a class, and a regex after '('
    t = kinds('x = s.replace(/[/\\]]+/g, "");')
    check(('regex', '/[/\\]]+/g') in t, t)
    # division after ')' and after an identifier and a number
    t = kinds('a = (b + c) / 2 / d; e = f / g; h = 1 / 2;')
    check(not any(k == 'regex' for k, _ in t), t)
    # regex after return, after '=', after ',', at the start, after '!'
    for src in ('return /ab+c/i.test(x)', 'y = /x/', 'f(a, /b/)', '/re/.exec(s)', 'if (!/x/.test(s)) {}'):
        check(any(k == 'regex' for k, _ in kinds(src)), src)
    # '//' inside a string and a template is not a comment
    t = kinds('u = "http://x"; v = `http://y`; w = 1;')
    check(not any(k == 'line_comment' for k, _ in t) and 'w' in [v for _, v in t], t)
    # nested templates
    t = kinds('a = `x${ b ? `y${c}z` : "q" }w`; d;')
    check([v for k, v in t if k == 'template'] == ['x', 'y', 'z', 'w'], t)
    check([v for k, v in t if k == 'code'] == ['a', '=', 'b', '?', 'c', ':', ';', 'd', ';'], t)
    check([k for k, _ in t].count('tmpl_expr_start') == 2 and [k for k, _ in t].count('tmpl_expr_end') == 2, t)
    # an object literal inside a template expression: its braces do not close the expression
    t = kinds('`a${ f({k: 1}) }b` + z')
    check([v for k, v in t if k == 'template'] == ['a', 'b'] and t[-1] == ('code', 'z'), t)
    # comments of both kinds; a '/' inside a block comment
    t = kinds('a /* b / c */ + d // e /f/\ng')
    check(t == [('code', 'a'), ('block_comment', '/* b / c */'), ('code', '+'), ('code', 'd'),
                ('line_comment', '// e /f/'), ('code', 'g')], t)
    # escapes in strings, and a quote of the other kind
    t = kinds(r'''s = 'it\'s "x"' + "a\\" + b''')
    check([v for k, v in t if k == 'code'] == ['s', '=', '+', '+', 'b'], t)
    # identifiers are separate tokens; '?.' is not '?' before a number
    check(codes('a?.b??c') == ['a', '?.', 'b', '??', 'c'], codes('a?.b??c'))
    check(codes('x?.5:1') == ['x', '?', '.5', ':', '1'], codes('x?.5:1'))
    # packed statements, a regex right after a keyword
    check(codes('const A=1;let B=A/2;function f(){return/x/}') ==
          ['const', 'A', '=', '1', ';', 'let', 'B', '=', 'A', '/', '2', ';', 'function', 'f', '(', ')', '{', 'return', '}'],
          codes('const A=1;let B=A/2;function f(){return/x/}'))
    # an escaped backtick and a lone '$' in a template
    t = kinds(r'`a\`b$c${d}`')
    check([v for k, v in t if k == 'template'] == [r'a\`b$c', ''], t)
    # line numbers
    toks = list(scan('a\n/* x\ny */ b\n`p\nq${c}`\nd'))
    check([(v, ln) for k, v, s, e, ln in toks if k == 'code'] == [('a', 1), ('b', 3), ('c', 5), ('d', 6)], toks)
    # malformed input does not raise
    for bad in ('"abc', "'", '`abc', '/* x', 'a = /x', '}}}', '`${'):
        list(scan(bad))
    # division assignment, and '/=' after an operand
    check(codes('a /= 2') == ['a', '/=', '2'], codes('a /= 2'))
    print('jsscan self-test: %d cases passed' % cases)


if __name__ == '__main__':
    if len(sys.argv) > 1:
        import time
        src = open(sys.argv[1], encoding='utf-8', errors='replace').read()
        t0 = time.time()
        k = sum(1 for _ in scan(src))
        print('%d tokens in %.2f s (%.1f MB)' % (k, time.time() - t0, len(src) / 1e6))
    else:
        _selftest()
