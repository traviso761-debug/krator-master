import sys,json,glob,collections,os
S=sys.argv[1]; ds=sys.argv[2:]
tot={}; per={}
for d in ds:
    c=collections.Counter(); o=collections.Counter(); n=0
    for f in glob.glob(os.path.join(S,d,'audit-*.jsonl')):
        for l in open(f):
            r=json.loads(l); n+=1
            ph='rest' if r['clip']=='none' else r['clip'].split('_')[-1]
            for p in r['patches']:
                k=p['kind']+(':'+p['cls'] if p['kind']=='under' else '')
                c[(k,ph)]+=p['px']; c[(k,'ALL')]+=p['px']
                if p['kind'] in('skin','under') and p['cls']!='feet': o[(r['outfit'],k,ph=='rest')]+=p['px']
    tot[d]=c; per[d]=o; print(d,n,'shots')
keys=sorted(set(k for c in tot.values() for k in c))
print('%-24s'%''+''.join('%12s'%d for d in ds))
for k in keys:
    if k[1]=='ALL' or k[0] in('skin','under:legs'):
        print('%-24s'%' '.join(k)+''.join('%12d'%tot[d][k] for d in ds))
base=ds[0]
print('\nworst regressions vs',base)
for d in ds[1:]:
    diffs=[(per[d][k]-per[base][k],k) for k in set(per[d])|set(per[base])]
    diffs.sort(reverse=True)
    print(d,'up:',[(v,*k) for v,k in diffs[:10] if v>300])
    print(d,'down:',[(v,*k) for v,k in diffs[-6:]])
    print(d,'still worst:',per[d].most_common(12))
