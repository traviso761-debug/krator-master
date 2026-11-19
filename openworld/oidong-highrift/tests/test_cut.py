#!/usr/bin/env python3
"""Strongbow's face, the 97 km terminal escarpment, and the 1,165.8 m Oidong Great Cataract (src/48-world-site.js OHR_CUT;
the owner, 2026-11-16: "Yes, carve it" and "make sure this doesn't result in water flowing uphill"). Runs in node on the
ground the bake reads (core/world/bake_sites.py's script: the region's rasters, core/world 41, 42, 44c and the sites' spec),
each check with a negative:

  1. the face: the lip's level at the pin, and the ground 50 m behind the lip and 30 m ahead of it at least 850 m apart
  2. continuous escarpment: 93 profiles across 92 km (z = -120..-28 km) all drop >= 860 m at >= 57.5 grade, flanked by the
     north and south mountain walls. Negative: without the escarpment cut, gentle slopes cross the valley mouth
  3. it only lowers: across Strongbow and the full 97 km reach, no point is higher than the land without it
  4. it drains: 0 wet core cells on Strongbow and on the Cataract/canyon grid, and Strongbow's gorge bed falls monotonically
     to where it meets the land. Negative: the pad tilted back from the lip holds pits
  5. the Great Cataract: Rifar al-Jadwal plunges > 1,160 m (> Angel Falls' 979 m) into its cauldron; 0 upstream points moved,
     0 rises downstream, 0 other rivers moved. Negative: without the lower canyon carve (canGuard=0), the bed rises uphill

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
const toXZ=(u,v)=>[PX-v,PZ+u];
const U0=-(C.half+C.sideB+50),U1=-U0,V0=C.rec0-C.back-C.backB-50,V1=11000;
const nu=Math.round((U1-U0)/G)+1,nv=Math.round((V1-V0)/G)+1;
function grid(u0,v0,nU,nV,step,f){const A=new Float64Array(nU*nV);
 for(let j=0;j<nV;j++)for(let i=0;i<nU;i++){const p=toXZ(u0+i*step,v0+j*step);A[j*nU+i]=f(p[0],p[1]);}return A;}
const D=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
function flood(H,nU,nV){const F=Float64Array.from(H),done=new Uint8Array(nU*nV),hp=[];
 const push=k=>{hp.push(k);let i=hp.length-1;while(i>0){const p=(i-1)>>1;if(F[hp[p]]<=F[hp[i]])break;[hp[p],hp[i]]=[hp[i],hp[p]];i=p;}};
 const pop=()=>{const t=hp[0],l=hp.pop();if(hp.length){hp[0]=l;let i=0;for(;;){const a=2*i+1,b=a+1;let m=i;if(a<hp.length&&F[hp[a]]<F[hp[m]])m=a;if(b<hp.length&&F[hp[b]]<F[hp[m]])m=b;if(m===i)break;[hp[m],hp[i]]=[hp[i],hp[m]];i=m;}}return t;};
 for(let j=0;j<nV;j++)for(let i=0;i<nU;i++)if(i===0||j===0||i===nU-1||j===nV-1){const k=j*nU+i;done[k]=1;push(k);}
 while(hp.length){const k=pop(),i=k%nU,j=(k/nU)|0;for(const d of D){const a=i+d[0],b=j+d[1];if(a<0||b<0||a>=nU||b>=nV)continue;const q=b*nU+a;if(done[q])continue;
  done[q]=1;if(F[q]<F[k])F[q]=F[k];push(q);}}
 const dep=new Float64Array(nU*nV);for(let k=0;k<dep.length;k++)dep[k]=F[k]-H[k];return dep;}
function held(H,wt,core,nU,nV,u0,v0,step){const d=flood(H,nU,nV);let cMax=0,cN=0,ex=null;
 for(let k=0;k<d.length;k++){if(wt[k]<=0)continue;
  if(core[k]&&d[k]>.02){cN++;if(d[k]>cMax){cMax=d[k];ex=[u0+(k%nU)*step,v0+((k/nU)|0)*step];}}}
 return {coreWet:cN,coreMax:cMax,coreAt:ex};}

const wt=grid(U0,V0,nu,nv,G,(x,z)=>K.weight(x,z));
const Hc=grid(U0,V0,nu,nv,G,(x,z)=>W.Hbare(x,z)),Hn=K.uncut(()=>grid(U0,V0,nu,nv,G,(x,z)=>W.Hbare(x,z)));

/* 1. the face */
const at=(u,v)=>{const p=toXZ(u,v);return W.Hbare(p[0],p[1]);};
out.face={lip:I.at[1],behind:at(0,-50),ahead:at(0,30),drop:at(0,-50)-at(0,30),floorAt200:at(0,200),pageFloor:I.floor,
 pin:W.Hbare(I.pin[0],I.pin[1]),pinV:K.local(I.pin[0],I.pin[1])[1],
 edges:[at(0,C.rec0-C.back+6),at(C.pageHalf-5,-800),at(-(C.pageHalf-5),-800)].map(h=>h-I.at[1]),
 rims:[at(0,C.rec0-C.back-6),at(C.pageHalf+5,-800),at(-(C.pageHalf+5),-800)].map(h=>h-I.at[1])};

/* 2. continuous escarpment: 93 profiles z = -120..-28 km */
let pCount=0,minDrop=1e9,minGrade=1e9,negMinDrop=1e9,negMinGrade=1e9;
for(let zk=-120;zk<=-28;zk++){
 const z=zk*1000,lx=K.scarpLipX(z);
 const h0=W.Hbare(lx+35,z),h1=W.Hbare(lx-135,z),dr=h0-h1,gr=dr/170*100;
 const n0=K.uncut(()=>W.Hbare(lx+35,z)),n1=K.uncut(()=>W.Hbare(lx-135,z)),ndr=n0-n1,ngr=Math.max(0,ndr/170*100);
 pCount++;minDrop=Math.min(minDrop,dr);minGrade=Math.min(minGrade,gr);
 negMinDrop=Math.min(negMinDrop,ndr);negMinGrade=Math.min(negMinGrade,ngr);}
let wallN=0,wallS=0;
for(let x=-624000;x<=-596000;x+=1000){wallN=Math.max(wallN,K.uncut(()=>W.Hbare(x,-132000)));wallS=Math.max(wallS,K.uncut(()=>W.Hbare(x,-18000)));}
out.scarp={profiles:pCount,minDrop,minGrade,wallN,wallS,negMinDrop,negMinGrade};

/* 3. lowers only (Strongbow + full 97 km reach sampled on 250 m grid) */
let up=0,deep=0,checked=Hc.length;
for(let k=0;k<Hc.length;k++){if(Hc[k]>Hn[k]+1e-6)up++;deep=Math.max(deep,Hn[k]-Hc[k]);}
for(let z=-124000;z<=-24000;z+=250)for(let x=-626000;x<=-608000;x+=250){
 checked++;const a=W.Hbare(x,z),b=K.uncut(()=>W.Hbare(x,z));if(a>b+1e-6)up++;deep=Math.max(deep,b-a);}
out.lowers={higher:up,deepest:deep,cells:checked};

/* 4. drains: Strongbow core + Cataract/canyon core (50 m grid over z=-75500..-70500, x=-621500..-609500) */
const core=new Uint8Array(Hc.length);let nCore=0;
for(let k=0;k<Hc.length;k++)if(wt[k]>=.999&&Hn[k]-Hc[k]>.01){core[k]=1;nCore++;}
const cu0=PZ-75500?-5500:0;
const cU0=1000,cU1=5500,cV0=-700,cV1=11300,cG=40;
const cnu=Math.round((cU1-cU0)/cG)+1,cnv=Math.round((cV1-cV0)/cG)+1;
const cwt=grid(cU0,cV0,cnu,cnv,cG,(x,z)=>K.weight(x,z));
const cHc=grid(cU0,cV0,cnu,cnv,cG,(x,z)=>W.Hbare(x,z)),cHn=K.uncut(()=>grid(cU0,cV0,cnu,cnv,cG,(x,z)=>W.Hbare(x,z)));
const cCore=new Uint8Array(cHc.length);let nCatCore=0;
for(let k=0;k<cHc.length;k++)if(cwt[k]>=.999&&cHn[k]-cHc[k]>.01){cCore[k]=1;nCatCore++;}
out.heldSb=held(Hc,wt,core,nu,nv,U0,V0,G);out.sbCore=nCore;
out.heldCat=held(cHc,cwt,cCore,cnu,cnv,cU0,cV0,cG);out.catCore=nCatCore;

const bed=[];let rise=0,end=null;
for(let v=40;v<=C.maxV;v+=G){const h=at(0,v),n=K.uncut(()=>at(0,v));if(h>=n-.01){end=v;break;}bed.push(h);
 if(bed.length>1&&h>bed[bed.length-2]+1e-6)rise++;}
out.gorge={samples:bed.length,rises:rise,ends:end,top:bed[0],last:bed[bed.length-1]};

/* negative 4: the pad tilted back from the lip */
const pd=C.padDrop;C.padDrop=-6;const Hb=grid(U0,V0,nu,nv,G,(x,z)=>W.Hbare(x,z));C.padDrop=pd;
out.negHeld=held(Hb,wt,core,nu,nv,U0,V0,G);

/* 5. the Great Cataract */
const R=W.riverLines(40),R0=K.uncut(()=>W.riverLines(40));
let upMoved=0,rises=0,ptsChecked=0,otherMoved=0,lipW=0,caulW=1e9;
for(let r=0;r<R.length;r++){
 const L=R[r],L0=R0[r];
 if(L.name.indexOf('Jadwal')>=0){
  for(let i=0;i<L.pts.length;i++){
   const p=L.pts[i],p0=L0.pts[i];
   if(p[0]>-609950&&Math.abs(p[2]-p0[2])>1e-4)upMoved++;
   if(p[0]>=-624000&&p[0]<=-605000){
    ptsChecked++;
    if(i>0&&p[2]>L.pts[i-1][2]+1e-4)rises++;
    if(i>0&&L.pts[i-1][0]>-609955&&p[0]<=-609955)lipW=L.pts[i-1][2];
    if(p[0]<-610000&&p[0]>-610450)caulW=Math.min(caulW,p[2]);}}
 }else{
  for(let i=0;i<L.pts.length;i++)if(Math.abs(L.pts[i][2]-L0.pts[i][2])>1e-4)otherMoved++;}}
C.canGuard=0;
const Rneg=W.riverLines(40).find(l=>l.name.indexOf('Jadwal')>=0);
let negRises=0;
for(let i=1;i<Rneg.pts.length;i++)if(Rneg.pts[i][0]>=-624000&&Rneg.pts[i][0]<=-609000&&Rneg.pts[i][2]>Rneg.pts[i-1][2]+.05)negRises++;
C.canGuard=1;
out.cat={plunge:lipW-caulW,cauldron:caulW,lipW,upMoved,rises,ptsChecked,otherMoved,negRises};
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
    P = json.load(open(os.path.join(ROOT, 'openworld', 'oidong-highrift', 'plan', 'sites.json'), encoding='utf-8'))
    R = next(l for l in P['links'] if 'sfgtxw10kr' in (l['from'], l['to']))
    end = R['pts'][-1] if R['to'] == 'sfgtxw10kr' else R['pts'][0]
    over = [p for p in R['pts'] if (I['at'][0] - p[0]) > -30 and abs(p[1] - I['at'][2]) < 2000]
    top = lambda h: h >= f['lip'] - 25
    ok(top(f['pin']) and f['pinV'] < -100 and top(end[2]) and not over and R['length_m'] < 500000,
       'the site stays on the top: its pin %.0f m behind the lip at %.1f m; the Sultanate\'s road (%.0f km) ends at %.1f m, none of it ahead of the lip'
       % (-f['pinV'], f['pin'], R['length_m'] / 1000, end[2]))
    ok(not top(f['ahead']), 'negative: the ground 30 m ahead of the lip (%.1f m) is not the top' % f['ahead'])
    ok(all(-0.05 < e <= 0 for e in f['edges']) and all(abs(r) < 0.05 for r in f['rims']),
       'Strongbow\'s top is level with the lip at its back edge and both sides: %s m inside, %s m outside'
       % (', '.join('%.2f' % e for e in f['edges']), ', '.join('%.2f' % r for r in f['rims'])))
    sc = o['scarp']
    ok(sc['profiles'] == 93 and sc['minDrop'] >= 860 and sc['minGrade'] >= 57.5 and sc['wallN'] >= 4200 and sc['wallS'] >= 3300,
       'continuous escarpment: %d profiles across 92 km (z = -120..−28 km) all drop >= %.0f m at >= %.1f grade, flanked by %.0f m (N) and %.0f m (S) mountain walls'
       % (sc['profiles'], sc['minDrop'], sc['minGrade'], sc['wallN'], sc['wallS']))
    ok(sc['negMinDrop'] < 200,
       'negative: without the escarpment cut, gentle slopes cross the valley mouth (min drop %.1f m, grade %.2f)'
       % (sc['negMinDrop'], sc['negMinGrade']))
    ok(L['higher'] == 0 and L['deepest'] >= 900,
       'it only lowers: %d cells checked (Strongbow + full 97 km reach), none higher than the land, deepest cut %.0f m'
       % (L['cells'], L['deepest']))
    hs, hc, g = o['heldSb'], o['heldCat'], o['gorge']
    ok(o['sbCore'] > 0 and o['catCore'] > 0 and hs['coreWet'] == 0 and hc['coreWet'] == 0 and g['rises'] == 0 and g['ends'] is not None,
       'it drains: %d wet core cells on Strongbow (%d core) and Cataract/canyon (%d core); Strongbow gorge falls %.0f -> %.0f m over %d samples to %d m out'
       % (hs['coreWet'] + hc['coreWet'], o['sbCore'], o['catCore'], g['top'], g['last'], g['samples'], g['ends'] or -1))
    nh = o['negHeld']
    ok(nh['coreWet'] > 0, 'negative: the pad tilted back 6 m from the lip would hold water on %d of its cells, %.1f m deep at %s'
       % (nh['coreWet'], nh['coreMax'], nh['coreAt']))
    ct = o['cat']
    ok(ct['plunge'] > 979 and ct['upMoved'] == 0 and ct['rises'] == 0 and ct['otherMoved'] == 0,
       'the Great Cataract: Rīfar al-Jadwal plunges %.1f m (> Angel Falls\' 979 m) into a %.1f m cauldron; %d upstream points moved, %d rises across %d river points, %d other rivers moved'
       % (ct['plunge'], ct['cauldron'], ct['upMoved'], ct['rises'], ct['ptsChecked'], ct['otherMoved']))
    ok(ct['negRises'] > 0,
       'negative: without the lower canyon carve (canGuard=0), Rīfar al-Jadwal\'s bed rises uphill at %d downstream steps' % ct['negRises'])
    print('\n%s: %d failed' % ('FAILED' if fails else 'OK', fails))
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
