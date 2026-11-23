#!/usr/bin/env python3
"""Headless verification of the Order of the Flashing Eye's head house. The page is built on Xanadu's (build.py), so its probe
(window._api), invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py; the opt-in
checks of tools/checks_optin.json), with the page's own:

  eye-laid       every place of the layout drawn: the Lip Range, the Red Monastery (crimson), the Hall of the Ember, the
                 three gates, the ranges, the Eye Post and the Watch's hut on the rim, the walls, the talus heaps
  bench-level    the bench inside its wall is level at 1,660 m on the drawn ground (cut and filled over the region cut)
  band-face      the band stands 150 m or more from the Lip to the talus's foot on the drawn ground, at its middle and
                 400 m either side; the Lip Range stands on the Lip
  crater         the crater is a bowl 120 m or more below its rim; the Eye Post stands on the rim, not in the crater
  vent           the vent bursts every 10-20 minutes (FE_WATCH), a burst lights the throat, the plume is drawn (core/atmos's
                 smoke) and recorded (ATMOS.ashPlume), the hazards are recorded
  sights-near    from the Mirror Hall's balcony (14 m over the bench) the lines to the Beacon (245), Erehwon (284) and the
                 Tears' camp (197) clear the drawn ground by 2 m or more for their first 2 km (the far field is tools/sights.py)
  no-trees       the flora's mask is empty on the band's face, on the rim within 120 m of the crater and in the crater
  fires          the house's two lights (the Ember's window, the fire basket) hung; no oil lamp anywhere

    KRATOR_GL=gpu python3 verify.py dist/flashing-eye.html --assert --views "Overview,The band from the apron"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

PAGE_JS = r"""
{const Z=window._flashing||{},K=Z.byKind||{},P=typeof FE_PLACE!=='undefined'?FE_PLACE:[],has=id=>P.some(p=>p.id===id),L=FE_LAYOUT;
 const need=['lip-range','red-monastery','ember','g.rift','g.mule','g.breath','post','hut','chapter','novices','school','granary','kitchen'];
 const mon=P.find(p=>p.id==='red-monastery');
 R.push({name:'eye-laid',ok:Z.placed>=30&&need.every(has)&&(K.wall||0)>=6&&Z.talus>=10&&mon&&mon.o.v===0,
  detail:Z.placed+' placed ('+JSON.stringify(K)+'), '+Z.chunks+' chunks, '+Z.talus+' talus heaps; missing: '+need.filter(id=>!has(id)).join(',')});
 const lv=[];for(let u=-140;u<=-16;u+=8)for(let v=-84;v<=84;v+=12)lv.push(Math.abs(terrainH(v,u)-FLASHING_EYE.terraceY(L,u)));const lvm=Math.max(...lv);
 R.push({name:'bench-level',ok:lvm<0.6,detail:'the bench inside its wall within '+lvm.toFixed(2)+' m of the level of its terrace (+0, +4, +9 m over 1,660 m; '+lv.length+' points)'});
 const B=L.band,face=v=>{const lu=FLASHING_EYE.lipU(L,v);return terrainH(v,lu-1)-terrainH(v,lu+B.batter+B.talusRun);};
 const fs=[-400,0,400].map(face),lr=P.find(p=>p.id==='lip-range'),onLip=lr&&Math.abs((lr.z+7)-FLASHING_EYE.lipU(L,0))<3;
 R.push({name:'band-face',ok:fs.every(h=>h>=150)&&onLip,detail:'the face at v -400, 0, 400: '+fs.map(h=>h.toFixed(0)).join(', ')+' m; the Lip Range\'s front '+(lr?(lr.z+7).toFixed(1):'?')+' m from the Lip\'s origin'});
 const C=L.crater,rim=terrainH(FE_CR[0],FE_CR[1]+C.r-5),floor=terrainH(FE_CR[0],FE_CR[1]),po=P.find(p=>p.id==='post'),pd=po?Math.hypot(po.x-FE_CR[0],po.z-FE_CR[1]):0;
 R.push({name:'crater',ok:rim-floor>=120&&po&&pd>=C.r-12&&Math.abs(po.o.y-terrainH(po.x,po.z))<2,detail:'rim '+rim.toFixed(0)+', floor '+floor.toFixed(0)+' m ('+(rim-floor).toFixed(0)+' deep); the Eye Post '+pd.toFixed(0)+' m from the centre, on the ground by '+(po?(po.o.y-terrainH(po.x,po.z)).toFixed(2):'?')});
 const bs=FE_WATCH.bursts(FE_CLOCK.t0,FE_CLOCK.t0+3*3600),gaps=bs.slice(1).map((b,i)=>b-bs[i]),va=FE_WATCH.vent(bs[0]+1.2).amp;
 R.push({name:'vent',ok:bs.length>=9&&bs.length<=18&&gaps.every(g=>g>=600&&g<=1200)&&va>0.5&&!!window._fePlumeSprites&&!!FE_PLUME&&FE_HAZ.length>=3,
  detail:bs.length+' bursts in 3 h (gaps '+Math.min(...gaps).toFixed(0)+'-'+Math.max(...gaps).toFixed(0)+' s), a burst\'s light '+va.toFixed(2)+', plume '+(window._fePlumeSprites?'drawn':'missing')+', ash plume '+(FE_PLUME?'recorded':'missing')+', '+FE_HAZ.length+' hazards'});
 const bal=fePart('lip.mirror').balcony,o=FE_P(bal[0],bal[1]),eyeY=14,sight=b=>{const a=b*Math.PI/180,dx=Math.sin(a),dz=-Math.cos(a);let least=1e9;
  for(let s=20;s<=2000;s+=10){const x=o[0]+dx*s,z=o[1]+dz*s;least=Math.min(least,eyeY-terrainH(x,z));}return least;};
 const ss=L.sights.balcony.list.filter(s=>s.must).map(s=>[s.id,sight(s.bearing)]);
 R.push({name:'sights-near',ok:ss.every(s=>s[1]>=2),detail:ss.map(s=>s[0]+' clear by '+s[1].toFixed(1)+' m').join(', ')+' (the first 2 km on the drawn ground)'});
 const bad=[];for(let v=-500;v<=500;v+=50){const lu=FLASHING_EYE.lipU(L,v);for(const d of[6,14,22])if(feBioMask(v,lu+d)>0)bad.push('face '+v+','+d);}
 for(let a=0;a<12;a++){const x=FE_CR[0]+Math.sin(a*.52)*(C.r+60),z=FE_CR[1]+Math.cos(a*.52)*(C.r+60);if(feBioMask(x,z)>0)bad.push('rim '+a);if(feBioMask(FE_CR[0]+Math.sin(a*.52)*C.r*.5,FE_CR[1]+Math.cos(a*.52)*C.r*.5)>0)bad.push('crater '+a);}
 R.push({name:'no-trees',ok:bad.length===0,detail:bad.length?bad.slice(0,6).join('; '):'the mask is empty on the face (33 points), the rim and the crater (24)'});
 const SB=typeof FE_BRIDGES!=='undefined'?FE_BRIDGES:[],ST=typeof FE_STACKS!=='undefined'?FE_STACKS:[],low=[];
 SB.forEach(B=>B.pts.forEach((p,k)=>{if(k>2&&k<B.pts.length-3&&p[1]-terrainH(p[0],p[2])<3)low.push(B.from+':'+k);}));
 const shr=ST.filter((S,i)=>P.some(p=>p.id==='shrine.'+(i+1)&&p.o.y===S.top)).length,last=SB[SB.length-1],g=FE_P(-3,-80);
 R.push({name:'way-of-shrines',ok:ST.length===6&&SB.length===6&&shr===6&&low.length===0&&last&&Math.hypot(last.b[0]-g[0],last.b[2]-g[1])<5&&Math.abs(last.b[1])<.5,
  detail:ST.length+' stacks ('+ST.map(S=>(S.top-S.ground).toFixed(0)+' m').join(', ')+' tall), '+SB.length+' bridges ('+SB.map(B=>B.span.toFixed(0)).join(', ')+' m), '+shr+' shrines on their tops; '+(low.length?'decks within 3 m of the ground at '+low.slice(0,4).join(', '):'every deck clear of the ground by 3 m')});
 const W=typeof KWALK!=='undefined'?KWALK:null,fl=(x,z,y)=>{const f=W&&W.floorBelow(x,z,y+.3,.6);return!!f&&Math.abs(f[0]-y)<.6;},miss=[];
 if(W){const A=FE_NOSE.from,B1=ST[0].land,mx=(A[0]+B1[0])/2,mz=(A[1]+B1[1])/2;if(!(W.floorBelow(mx,mz,terrainH(mx,mz)+6,8)))miss.push('the nose stair');
  ST.forEach(S=>{if(!fl(S.x,S.z,S.top))miss.push(S.id+' top');if(!fl(S.land[0],S.land[1],S.landing))miss.push(S.id+' landing');});
  SB.forEach(B=>{const m=B.pts[24];if(!fl(m[0],m[2],m[1]))miss.push('the bridge from '+B.from);});}
 R.push({name:'way-walk',ok:!!W&&miss.length===0,detail:W?(miss.length?'no floor at '+miss.join(', '):'a floor at every top, landing and bridge\'s middle; '+JSON.stringify(typeof FE_WALKS!=='undefined'?FE_WALKS:{})):'no core/walk on the page'});
 const t0=FE_CLOCK.set,ts=FE_API.signal(1),gs=FE_WATCH.state(ts,FE_ENV);FE_CLOCK.set=t0;
 R.push({name:'glints',ok:FE_GLINTS.length===2&&gs.mode==='mirror'&&gs.shutter===true,detail:FE_GLINTS.length+' glints (the Eye Post, the Mirror Tower); on the hour the day line '+gs.mode+' to '+gs.station+', shutter '+(gs.shutter?'open':'shut')});
 const LA=typeof FE_LAMPS!=='undefined'?FE_LAMPS:[];
 R.push({name:'fires',ok:LA.length===2&&LA.some(l=>l[3]==='ember')&&LA.some(l=>l[3]==='fire')&&!LA.some(l=>l[3]==='oil'),detail:LA.length+' lights: '+LA.map(l=>l[3]+' ('+l[4]+')').join(', ')});}
return R;}"""
xv.ASSERT_JS = xv.ASSERT_JS.rstrip()[:-len('return R;}')] + PAGE_JS
assert xv.ASSERT_JS.endswith('return R;}'), 'settlements/xanadu/verify.py ASSERT_JS no longer ends with return R;}'
xv._voth_trades = lambda: {'name': 'voth-trades', 'ok': True, 'detail': 'the Xanadu kit\'s table (kits/xanadu): checked on its own sheet'}

if __name__ == '__main__':
    import argparse, asyncio
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    ap.add_argument("--views", default="")
    ap.add_argument("--all-views", action="store_true")
    ap.add_argument("--assert", dest="assert_", action="store_true")
    ap.add_argument("--strict-budget", dest="strict_budget", action="store_true")
    ap.add_argument("--baseline", default="")
    ap.add_argument("--save-baseline", default="")
    ap.add_argument("--out", default="./shots")
    ap.add_argument("--cam", action="append")
    ap.add_argument("--cam-name", default="cam")
    ap.add_argument("--eval", action="append")
    ap.add_argument("--size", default="1280x800")
    ap.add_argument("--no-cache", action="store_true")
    ap.add_argument("--interiors", action="store_true")
    a = ap.parse_args([os.path.abspath(x) if x.endswith('.html') and os.path.exists(x) else x for x in sys.argv[1:]])
    sys.exit(asyncio.run(xv.run(a)))
