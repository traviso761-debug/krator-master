#!/usr/bin/env python3
"""Headless verification of Grēṭ-Āil, the Azure Dream's head monastery. The page is built on Xanadu's (build.py), so its probe
(window._api), invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py), with the
page's own:

  azure-laid        every place of the site placed (89zad: over 120), with the Hall of Dreaming, the great monastery in the blue
                    dress, the mole, the three jetties and the boathouse among them
  dream-cots        the Hall's 256 cots, 32 in each of the eight turnings (PLAN.md section 5; the owner: "keep it")
  cove-water        the cove holds water (the ground under the lake 3 m or more, 60-160 m out from the head on its centre line)
                    and its two headlands stand out of it (20 m or more at their records' centres): the records of
                    tools/scale-model/edit_517_azure.py on the 1:1 ground
  terraces-climb    the precinct's four terraces climb the slope in order (the gate court, the monastery, the Lotus Garden, the
                    Hall), all over the lake
  stair-climbs      the Stair of Lowered Eyes zigzags up the scarp in six runs, 20-70 m of rise, its foot on the ground
  hall-walk-in      the Hall of Dreaming walked into (core/walk, 90ag): its two doors unlocked and opened, a walker from the
                    terrace before its steps reaches the kora and both sides of the hall, and one from the shrine the kora
  lotus-ponds       the Lotus Garden's four ponds, their water on core/water (WATER.still)
  lamps             the lamps placed: the Hall's 32 azure lamps and the Damsel's gold one, the wharf's lanterns

The summit's page (dist/azure-dream-summit.html, window.CITY_BUILD 'azure-dream-summit') takes these instead:

  summit-laid       the summit's places: the Summit Chorten, the great wheel, the Station Watch, the pilgrims' shelter, the road's
                    chorten and the High Kora's wheel houses
  high-kora         sixteen wheel houses 240-256 m out, none crowding another, the Dream Road passing between two of them
  summit-crest      the Summit Chorten on the crest: over +250 m, and no lower than the kora's ground less 8 m
  signal-lamp       the Station Watch's one signal lamp, the highest lamp on the page; its detail says whether it sees the
                    monastery's back gate over the 1:1 ground (it does not: the dome's shoulder, KNOWN_ISSUES.md)

    KRATOR_GL=gpu python3 verify.py dist/azure-dream.html --assert --views "Overview,From the barge"
    KRATOR_GL=gpu python3 verify.py dist/azure-dream-summit.html --assert --views "Overview,On the High Kora"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

SUMMIT_JS = r"""
if(window.CITY_BUILD==='azure-dream-summit'){const Z=window._azure||{},K=Z.byKind||{},P=typeof AD_PLACE!=='undefined'?AD_PLACE:[],has=id=>P.some(p=>p.id===id);
 R.push({name:'summit-laid',ok:Z.placed>=21&&['summit-chorten','great-wheel','station-watch','pilgrims-shelter','road-chorten'].every(has),
  detail:Z.placed+' placed ('+JSON.stringify(K)+'), '+Z.chunks+' chunks, '+Z.pads+' pads, '+Z.retain+' retaining faces; the crest +'+Z.crest+' m'});
 const H=P.filter(p=>p.key==='qb_wheel_house'),rr=H.map(p=>Math.hypot(p.x,p.z)),Rd=AD_ROAD;
 let clash=0;for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++)if(Math.hypot(H[i].x-H[j].x,H[i].z-H[j].z)<14)clash++;
 const roadGap=Math.min(...H.map(p=>{const s=p.x*Rd.dx+p.z*Rd.dz;return s<0?1e9:Math.abs(p.x*Rd.dz-p.z*Rd.dx);}));
 R.push({name:'high-kora',ok:H.length===16&&rr.every(r=>r>240&&r<256)&&clash===0&&roadGap>9,
  detail:H.length+' wheel houses '+Math.min(...rr).toFixed(0)+'-'+Math.max(...rr).toFixed(0)+' m out, '+clash+' too close, the Dream Road '+roadGap.toFixed(1)+' m clear of the nearest'});
 const ring=[];for(let a=0;a<16;a++){const t=a/16*2*Math.PI;ring.push(terrainH(260*Math.sin(t),260*Math.cos(t)));}
 const C=P.find(p=>p.id==='summit-chorten'),top=Math.max(...ring);
 R.push({name:'summit-crest',ok:!!C&&C.o.y>250&&C.o.y>=top-8,detail:'the Summit Chorten at +'+(C?C.o.y:0)+' m, the kora\'s ground '+Math.min(...ring).toFixed(1)+'-'+top.toFixed(1)+' m'});
 const LA=typeof AD_LAMPS!=='undefined'?AD_LAMPS:[],S=LA.filter(l=>l[3]==='signal');
 /* the signal's sight line to the monastery's back gate, over the 1:1 ground (adBase: the pads are this page's only) */
 let los='';if(S.length){const s=S[0],gx=adWx(846.075)-AD.WX,gz=adWz(1508.493-484/2000)-AD.WZ,gy=adBase(gx,gz)+6;let w=1e9;
  for(let i=1;i<400;i++){const t=i/400,x=s[0]+(gx-s[0])*t,z=s[2]+(gz-s[2])*t;w=Math.min(w,s[1]+(gy-s[1])*t-adBase(x,z));}
  los=w>0?'; it sees the monastery\'s back gate, '+w.toFixed(1)+' m clear':'; the dome\'s shoulder hides it from the monastery\'s back gate ('+(-w).toFixed(1)+' m short: KNOWN_ISSUES.md, the relay)';}
 R.push({name:'signal-lamp',ok:S.length===1&&S[0][1]>=Math.max(...LA.map(l=>l[1]))-.01,detail:S.length+' signal lamp(s) at +'+(S[0]?S[0][1].toFixed(1):'-')+' m, the highest of '+LA.length+los});}
else"""
PAGE_JS = r"""
{const Z=window._azure||{},K=Z.byKind||{},P=typeof AD_PLACE!=='undefined'?AD_PLACE:[],has=id=>P.some(p=>p.id===id);
 R.push({name:'azure-laid',ok:Z.placed>=120&&['hall-of-dreaming','great-monastery','mole','boathouse','jetty:0','jetty:1','jetty:2'].every(has),
  detail:Z.placed+' placed ('+JSON.stringify(K)+'), '+Z.chunks+' chunks, '+Z.pads+' pads, '+Z.retain+' retaining faces'});
 const T=Z.cotsByTurning||{},tk=Object.keys(T);
 R.push({name:'dream-cots',ok:Z.cots===256&&tk.length===8&&tk.every(k=>T[k]===32),detail:Z.cots+' cots: '+JSON.stringify(T)});
 const wet=[];for(let d=60;d<=160;d+=20)wet.push(+terrainH(0,d).toFixed(1));
 const arms=AD_ARMS.map(L=>+(terrainH(L.x-AD.WX,L.z-AD.WZ)).toFixed(1));
 R.push({name:'cove-water',ok:wet.every(h=>h<-3)&&arms.every(h=>h>20),detail:'the ground on the centre line 60-160 m out '+wet.join(', ')+' m; the headlands '+arms.join(', ')+' m over the lake'});
 const L=Z.terraces||{},o=['court','monastery','lotus','hall'].map(k=>L[k]);
 R.push({name:'terraces-climb',ok:o.every((y,i)=>y>0&&(i===0||y>o[i-1])),detail:'court '+o[0]+', monastery '+o[1]+', Lotus Garden '+o[2]+', Hall '+o[3]+' m over the lake'});
 const S=Z.stair||{},runs=P.filter(p=>p.key==='qb_terrace_stair'&&/^stair:/.test(p.id)).length,foot=typeof AD_STAIR!=='undefined'?Math.abs(AD_STAIR.fy-terrainH(0,-AD_STAIR.footU)):99;
 R.push({name:'stair-climbs',ok:runs===6&&S.rise>=20&&S.rise<=70&&foot<4,detail:runs+' runs, '+S.rise+' m of rise, its foot '+foot.toFixed(1)+' m off the ground'});
 const LA=typeof AD_LAMPS!=='undefined'?AD_LAMPS:[],n=k=>LA.filter(l=>l[3]===k).length;
 const AW=window._adWalk,WI=AW&&AW.walkIn?AW.walkIn():null;
 R.push({name:'hall-walk-in',ok:!!(WI&&WI.ok),detail:!WI?'window._adWalk missing (targets/isle/90ag-ad-walk.js)':WI.doors+' doors unlocked, '+AW.floors+' floors, '+AW.blocks+' blocks; shut, the walker '+(WI.shutIn.length?'GOT IN to '+WI.shutIn.join(', '):'stayed out')+'; '+WI.routes.map(r=>'from '+r.from+(r.miss.length?' MISSED '+r.miss.join(', '):' reached the kora and both sides')).join('; ')});
 const PW=typeof AD_POND_WATER!=='undefined'?AD_POND_WATER:[];
 R.push({name:'lotus-ponds',ok:PW.length===4&&PW.every(S=>S.level>0),detail:PW.length+' still ponds on core/water at '+PW.map(S=>S.level.toFixed(2)).join(', ')+' m'});
 R.push({name:'lamps',ok:n('azure')===32&&n('gold')===1&&n('oil')>=4,detail:LA.length+' lamps: azure '+n('azure')+', gold '+n('gold')+', oil '+n('oil')+', clerestory panes '+n('pane')});}
return R;}"""
xv.ASSERT_JS = xv.ASSERT_JS.rstrip()[:-len('return R;}')] + SUMMIT_JS + PAGE_JS
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
    a = ap.parse_args([os.path.abspath(x) if x.endswith('.html') and os.path.exists(x) else x for x in sys.argv[1:]])
    sys.exit(asyncio.run(xv.run(a)))
