#!/usr/bin/env python3
"""kitshots.py OUTDIR [--sheet FILE] key[:variant][:view] ...   view = f (front 3/4, default) | b (back) | p (plan) | c (close eye-level front) | n (night front)
       kitshots.py OUTDIR [--sheet FILE] --dump
--sheet picks the kit sheet (default locus-kit.html). --dump writes sheet-items-<sheet name>.json (the item list with
positions); the shot run reads it, so dump each sheet once after a rebuild that moves its items."""
import json, subprocess, sys, os
args=sys.argv[1:]
out=args.pop(0)
sheet='locus-kit.html'
if '--sheet' in args:
    i=args.index('--sheet'); sheet=args[i+1]; del args[i:i+2]
dumpf='sheet-items-%s.json' % os.path.splitext(os.path.basename(sheet))[0]
if args and args[0]=='--dump':
    r=subprocess.run(['python3','verify.py',sheet,'--out',out,'--eval','()=>JSON.stringify(_api.SHEET_ITEMS)'],capture_output=True,text=True)
    line=[l for l in r.stdout.splitlines() if l.startswith('eval:')][0]
    json.dump(json.loads(json.loads(line[5:].strip())), open(dumpf,'w')); print('dumped', len(json.load(open(dumpf))), 'items to', dumpf); sys.exit(0)
items=json.load(open(dumpf))
cams=[]; hour=None
for spec in args:
    parts=spec.split(':'); key=parts[0]; v=int(parts[1]) if len(parts)>1 and parts[1] else 0; view=parts[2] if len(parts)>2 else 'f'
    its=[i for i in items if i['key']==key]
    if not its: print('no such key', key); continue
    it=its[min(v,len(its)-1)]; R=max(it['w'], it['d']*0.9, it['h']*1.25); x,z,h,d=it['x'],it['z'],it['h'],it['d']
    if view=='p': c=(x+0.01, h+R*1.5, z-R*0.25, x,0,z)
    elif view=='b': c=(x+R*1.05, h*0.55+R*0.30, z+R*0.95, x,h*0.40,z)
    elif view=='c': c=(x-R*0.45, 1.7, z-d/2-R*0.75, x,h*0.35,z)
    elif view=='n': c=(x-R*0.75, h*0.45+R*0.32, z-d/2-R*1.05, x,h*0.42,z); hour=21.5
    else: c=(x-R*0.75, h*0.45+R*0.32, z-d/2-R*1.05, x,h*0.42,z)
    cams.append(('%s_%d_%s'%(key,v,view), c))
os.makedirs(out, exist_ok=True)
cmd=['python3','verify.py',sheet,'--out',out]
for name,c in cams: cmd+=['--cam='+','.join('%.1f'%q for q in c)]
if hour: cmd+=['--hour',str(hour)]
cmd+=['--cam-name','shot']
r=subprocess.run(cmd,capture_output=True,text=True); print(r.stdout[-1500:]); print(r.stderr[-800:])
# rename shots in order
for i,(name,c) in enumerate(cams):
    src=os.path.join(out,'shot%d.png'%i)
    if os.path.exists(src): os.replace(src, os.path.join(out,name+'.png'))
print('shots:', ' '.join(n+'.png' for n,c in cams))
