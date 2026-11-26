# the working src/50-figure.js (its diff against HEAD) onto base/ (the live labs as they were before round 4: Cosmetic v74,
# Animation v54), written to patched/, and patched/cosmetic-live.html copied to dist/ so tools/shots.py can load it
import difflib, os, shutil, subprocess, sys
W = r'C:\Users\travi\Documents\krator-garments'
S = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(S, 'patched')
SRC = 'core/charactermodels/src/50-figure.js'
pre = subprocess.check_output(['git', '-C', W, 'show', 'b0477373b:' + SRC]).decode('utf-8').replace('\r\n', '\n').split('\n')
post = open(os.path.join(W, SRC.replace('/', os.sep)), encoding='utf-8', newline='').read().replace('\r\n', '\n').split('\n')
ops = [o for o in difflib.SequenceMatcher(None, pre, post, autojunk=False).get_opcodes() if o[0] != 'equal']
os.makedirs(OUT, exist_ok=True)
fails = 0
for name in ('cosmetic-live.html', 'animation-live.html'):
    lines = open(os.path.join(S, 'base', name), encoding='utf-8', newline='').read().split('\n')
    for tag, i1, i2, j1, j2 in reversed(ops):
        old, new = pre[i1:i2], post[j1:j2]
        if old:
            hits = [k for k in range(len(lines) - len(old) + 1) if lines[k:k + len(old)] == old]
            if len(hits) != 1:
                print('MISS', name, len(hits), old[0][:100]); fails += 1; continue
            lines[hits[0]:hits[0] + len(old)] = new
        else:
            at = None
            for n in (1, 2, 3, 4):
                ctx = pre[i1 - n:i1]
                hits = [k for k in range(len(lines) - n + 1) if lines[k:k + n] == ctx]
                if len(hits) == 1:
                    at = hits[0] + n
                    break
            if at is None:
                print('MISS ctx', name, pre[i1 - 1][:100]); fails += 1; continue
            lines[at:at] = new
    open(os.path.join(OUT, name), 'w', encoding='utf-8', newline='\n').write('\n'.join(lines))
shutil.copy(os.path.join(OUT, 'cosmetic-live.html'), os.path.join(W, 'core', 'charactermodels', 'dist', 'cosmetic-live.html'))
print(len(ops), 'hunks, fails', fails)
sys.exit(1 if fails else 0)
