#!/usr/bin/env python3
"""Strongbow's face cut into the scarp (src/48-world-site.js OHR_CUT; the owner, 2026-11-16: "Yes, carve it" and "make
sure this doesn't result in water flowing uphill"). Runs in node on the ground the bake reads (core/world/bake_sites.py's
script: the region's rasters, core/world 41, 42, 44c and the sites' spec), each check with a negative:

  1. the face: the lip's level at the pin, and the ground 50 m behind the lip and 30 m ahead of it at least 850 m apart
  2. it only lowers: on a 25 m grid over the cut, no point is higher than the land without it
  3. it drains: every cell the cut touches leads downhill, by its steepest neighbour, out of the cut (no new pit), and
     the gorge's bed falls all the way to where it ends. Negative: the pad tilted back from the lip holds pits
  4. the water stands where it stood: no river's ground moves (every river point within 15 km), and no water surface
     stands over cut ground. Negative: the gorge widened onto the cataract's river, its guard off, moves the river's ground

    python3 openworld/oidong-highrift/tests/test_cut.py      exit 0 when every check passes
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'core', 'world'))
import bake_sites as BS   # noqa: E402

TEST = r'''
WORLD.init(WORLD_R);
const W=WORLD,K=OHR_CUT,C=K.spec,I=K.info(),out={info:I};
const PX=I.at[0],PZ=I.at[2],G=25;
/* the cut's cells: a 25 m grid over its reach, in the page's frame turned to the site (u along the face, v ahead) */
const toXZ=(u,v)=>[PX-v,PZ+u];   /* ry -pi/2: the page's +z to the region's -x */
const U0=-(C.half+C.sideB+50),U1=-U0,V0=C.rec0-C.back-C.backB-50,V1=C.maxV+50;
const nu=Math.round((U1-U0)/G)+1,nv=Math.round((V1-V0)/G)+1;
function grid(f){const A=new Float64Array(nu*nv);for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const p=toXZ(U0+i*G,V0+j*G);A[j*nu+i]=f(p[0],p[1]);}return A;}
const wt=grid((x,z)=>K.weight(x,z));
const D=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
function pits(H){let n=0;const at=[];for(let j=1;j<nv-1;j++)for(let i=1;i<nu-1;i++){const k=j*nu+i;if(wt[k]<=0)continue;
  let low=true;for(const d of D)if(H[(j+d[1])*nu+i+d[0]]<=H[k]){low=false;break;}if(low){n++;if(at.length<5)at.push([U0+i*G,V0+j*G,+H[k].toFixed(2)]);}}
 return {n,at};}
/* the water the ground would hold: a priority flood from the grid's edge (water leaves there) fills every depression to
   its spill level; per cell the depth it would stand. core: the cells where the cut replaces the land outright (weight 1,
   cut by more than 1 cm), where the land's own noise is gone and nothing may stand */
function flood(H){const F=Float64Array.from(H),done=new Uint8Array(nu*nv),hp=[];
 const push=k=>{hp.push(k);let i=hp.length-1;while(i>0){const p=(i-1)>>1;if(F[hp[p]]<=F[hp[i]])break;[hp[p],hp[i]]=[hp[i],hp[p]];i=p;}};
 const pop=()=>{const t=hp[0],l=hp.pop();if(hp.length){hp[0]=l;let i=0;for(;;){const a=2*i+1,b=a+1;let m=i;if(a<hp.length&&F[hp[a]]<F[hp[m]])m=a;if(b<hp.length&&F[hp[b]]<F[hp[m]])m=b;if(m===i)break;[hp[m],hp[i]]=[hp[i],hp[m]];i=m;}}return t;};
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++)if(i===0||j===0||i===nu-1||j===nv-1){const k=j*nu+i;done[k]=1;push(k);}
 while(hp.length){const k=pop(),i=k%nu,j=(k/nu)|0;for(const d of D){const a=i+d[0],b=j+d[1];if(a<0||b<0||a>=nu||b>=nv)continue;const q=b*nu+a;if(done[q])continue;
  done[q]=1;if(F[q]<F[k])F[q]=F[k];push(q);}}
 const dep=new Float64Array(nu*nv);for(let k=0;k<dep.length;k++)dep[k]=F[k]-H[k];return dep;}
function held(H,core){const d=flood(H);let cMax=0,cN=0,all=0,aMax=0,ex=null;
 for(let k=0;k<d.length;k++){if(wt[k]<=0)continue;all+=d[k]*G*G;aMax=Math.max(aMax,d[k]);
  if(core[k]&&d[k]>.01){cN++;if(d[k]>cMax){cMax=d[k];ex=[U0+(k%nu)*G,V0+((k/nu)|0)*G];}}}
 return {coreWet:cN,coreMax:cMax,coreAt:ex,volume:all,max:aMax};}
const Hc=grid((x,z)=>W.Hbare(x,z)),Hn=K.uncut(()=>grid((x,z)=>W.Hbare(x,z)));
/* 1. the face */
const at=(u,v)=>{const p=toXZ(u,v);return W.Hbare(p[0],p[1]);};
out.face={lip:I.at[1],behind:at(0,-50),ahead:at(0,30),drop:at(0,-50)-at(0,30),floorAt200:at(0,200),pageFloor:I.floor,
 pin:W.Hbare(I.pin[0],I.pin[1]),pinV:K.local(I.pin[0],I.pin[1])[1]};
/* 2. lowers only */
let up=0,deep=0;for(let k=0;k<Hc.length;k++){if(Hc[k]>Hn[k]+1e-6)up++;deep=Math.max(deep,Hn[k]-Hc[k]);}
out.lowers={higher:up,deepest:deep,cells:Hc.length,touched:wt.reduce((a,w)=>a+(w>0),0)};
/* 3. drains */
const core=new Uint8Array(Hc.length);let nCore=0;for(let k=0;k<Hc.length;k++)if(wt[k]>=.999&&Hn[k]-Hc[k]>.01){core[k]=1;nCore++;}
out.pitsCut=pits(Hc);out.pitsLand=pits(Hn);out.heldCut=held(Hc,core);out.heldLand=held(Hn,core);out.core=nCore;
const bed=[];let rise=0,end=null;for(let v=40;v<=C.maxV;v+=G){const h=at(0,v),n=K.uncut(()=>at(0,v));if(h>=n-.01){end=v;break;}bed.push(h);
 if(bed.length>1&&h>bed[bed.length-2]+1e-6)rise++;}
out.gorge={samples:bed.length,rises:rise,ends:end,top:bed[0],last:bed[bed.length-1]};
/* negative 3: the pad tilted back from the lip */
const pd=C.padDrop;C.padDrop=-pd;const Hb=grid((x,z)=>W.Hbare(x,z));C.padDrop=pd;
out.negPits=pits(Hb);out.negHeld=held(Hb,core);
/* 4. the water */
const R=W.riverLines(40);let rp=0,moved=0,inCut=0;
for(const L of R)for(const p of L.pts){if(Math.hypot(p[0]-PX,p[1]-PZ)>15000)continue;rp++;
 if(K.weight(p[0],p[1])>0)inCut++;const a=W.Hbare(p[0],p[1]),b=K.uncut(()=>W.Hbare(p[0],p[1]));if(Math.abs(a-b)>1e-6)moved++;}
let wet=0;for(let j=0;j<nv;j+=2)for(let i=0;i<nu;i+=2){const k=j*nu+i;if(wt[k]<=0)continue;const p=toXZ(U0+i*G,V0+j*G);if(W.water(p[0],p[1])>-1e8)wet++;}
out.water={riverPoints:rp,inCut,moved,wetCells:wet};
/* negative 4: the gorge widened 2 km each side with its river guard off */
const gh=C.gorgeHalf,rv=C.river.slice();C.gorgeHalf=2000;C.river=[0,0];let negMoved=0;
for(const L of R)for(const p of L.pts){if(Math.hypot(p[0]-PX,p[1]-PZ)>15000)continue;const a=W.Hbare(p[0],p[1]),b=K.uncut(()=>W.Hbare(p[0],p[1]));if(Math.abs(a-b)>1e-6)negMoved++;}
C.gorgeHalf=gh;C.river=rv;out.negWater={moved:negMoved};
process.stdout.write(JSON.stringify(out));
'''

fails = 0


def ok(c, m):
    global fails
    print(('ok   ' if c else 'FAIL ') + m)
    if not c:
        fails += 1


def main():
    s = BS.script('oidong-highrift')
    s = s[:s.index('\nvar KIT_DIMS=')] + TEST
    o = BS.run(s)
    f, L, I = o['face'], o['lowers'], o['info']
    ok(abs(f['lip'] - I['at'][1]) < 1e-6 and f['drop'] >= 850 and abs(f['floorAt200'] - (I['floor'] - 1)) < 5,
       'the face: the lip at %.1f m on the pin; the ground 50 m behind the lip and 30 m ahead %.0f m apart; 200 m ahead %.1f m (the page\'s floor %.1f)'
       % (f['lip'], f['drop'], f['floorAt200'], I['floor']))
    # the site stays on the top: its pin on the plateau behind the lip, and the Sultanate's road (the baked plan) ending
    # there without going over the edge. Negative: the floor 30 m ahead of the lip is no plateau
    P = json.load(open(os.path.join(ROOT, 'openworld', 'oidong-highrift', 'plan', 'sites.json'), encoding='utf-8'))
    R = next(l for l in P['links'] if 'sfgtxw10kr' in (l['from'], l['to']))
    end = R['pts'][-1] if R['to'] == 'sfgtxw10kr' else R['pts'][0]
    over = [p for p in R['pts'] if (I['at'][0] - p[0]) > -30 and abs(p[1] - I['at'][2]) < 2000]   # ahead of the lip, near the face
    top = lambda h: h >= f['lip'] - 25
    ok(top(f['pin']) and f['pinV'] < -100 and top(end[2]) and not over and R['length_m'] < 500000,
       'the site stays on the top: its pin %.0f m behind the lip at %.1f m; the Sultanate\'s road (%.0f km) ends at %.1f m, none of it ahead of the lip'
       % (-f['pinV'], f['pin'], R['length_m'] / 1000, end[2]))
    ok(not top(f['ahead']), 'negative: the ground 30 m ahead of the lip (%.1f m) is not the top' % f['ahead'])
    ok(L['higher'] == 0 and L['touched'] > 0, 'it only lowers: %d of %d cells touched, none higher than the land, the deepest cut %.0f m'
       % (L['touched'], L['cells'], L['deepest']))
    hc, hl, g = o['heldCut'], o['heldLand'], o['gorge']
    ok(o['core'] > 0 and hc['coreWet'] == 0 and hc['volume'] <= hl['volume'] + 1 and g['rises'] == 0 and g['ends'] is not None,
       'it drains: where the cut replaces the land (%d cells) no water would stand (%d cells, deepest %.2f m); over the whole cut the ground would hold %.0f m3 against the land\'s %.0f m3 there (deepest %.2f against %.2f m; pits %d against %d); the gorge\'s bed falls from %.0f to %.0f m over %d samples and meets the land %d m out'
       % (o['core'], hc['coreWet'], hc['coreMax'], hc['volume'], hl['volume'], hc['max'], hl['max'], o['pitsCut']['n'], o['pitsLand']['n'],
          g['top'], g['last'], g['samples'], g['ends'] or -1))
    nh = o['negHeld']
    ok(nh['coreWet'] > 0, 'negative: the pad tilted back from the lip would hold water on %d of its cells, %.1f m deep at %s'
       % (nh['coreWet'], nh['coreMax'], nh['coreAt']))
    w = o['water']
    ok(w['riverPoints'] > 0 and w['moved'] == 0 and w['inCut'] == 0 and w['wetCells'] == 0,
       'the water stands where it stood: %d river points within 15 km, none in the cut, none moved; no water over cut ground (%d wet cells)'
       % (w['riverPoints'], w['wetCells']))
    ok(o['negWater']['moved'] > 0, 'negative: the gorge widened 2 km each side with its river guard off moves %d river points' % o['negWater']['moved'])
    print('\n%s: %d failed' % ('FAILED' if fails else 'OK', fails))
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
