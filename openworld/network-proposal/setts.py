import re, json, sys, subprocess
src = open(sys.argv[1], encoding='utf8').read()
def arr(after):
    i = src.index(after); i = src.index('[', i); depth=0
    for j in range(i, len(src)):
        c = src[j]
        if c == '[': depth += 1
        elif c == ']':
            depth -= 1
            if depth == 0: return json.loads(src[i:j+1])
S = {s['id']: s for s in arr('const defSetts')}
# SETT_ADDED / SETT_MOVED blocks: find each 'version':[...]
for blk in ('SETT_ADDED', 'SETT_MOVED'):
    i = src.index('const ' + blk); k = src.index('};', i)
    body = src[i:k]
    for m in re.finditer(r"'([^']+)':\[", body):
        j = m.end() - 1; depth = 0
        for e in range(j, len(body)):
            if body[e] == '[': depth += 1
            elif body[e] == ']':
                depth -= 1
                if depth == 0: break
        for s in json.loads(body[j:e+1]):
            if blk == 'SETT_ADDED' or s['id'] in S: S[s['id']] = s
json.dump(sorted(S.values(), key=lambda s: s['name']), open(sys.argv[2], 'w', encoding='utf8'), indent=0, ensure_ascii=False)
from collections import Counter
print(len(S), Counter(s['type'] for s in S.values()))
