#!/usr/bin/env python3
"""Headless check for the Xanadu kit's own sheet (build.py; the checks are kits/iziz-vernacular/sheet_verify.py's, on
tools/harness.py):

    python3 verify.py dist/xanadu.html --assert [--views "Opening|Overview"] [--all-views] [--only key1,key2] [--out shots]

The trades table (src/89-xa-trades.js, XA_TRADES) is checked against the Voth census by tools/check_trades.py, as Xanadu's
verify.py did. The kit's own invariants (FORT_JS, settlements/strongwall/PLAN.md section 5, 2026-11-16):
  fort-plans   every size of the Xanadui fort plans to XFORT's rules (src/80f-xa-fort-data.js; tests/test-fort.js is its
               node test with the negatives)
  fort-walks   every standing fort's wall walks and stairs (core/walk) reached from its stairs' feet (xfReach), with a
               negative: a walk no stair meets, on a walk of its own, is caught
The damaged and ruined forts are watched by core/ruins (targets/sheet/91u-xasheet-ruins.js): the harness's ruins asserts."""
import os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'iziz-vernacular'))
import sheet_verify   # noqa: E402

FORT_JS = r"""()=>{const R=[];if(typeof XFORT==='undefined')return [{name:'fort-plans',ok:false,detail:'XFORT missing (src/80f-xa-fort-data.js)'}];
 {const bad=[];for(const s of['watch','march','gate'])XFORT.check(XFORT.plan({size:s})).forEach(f=>bad.push(s+': '+f));
  R.push({name:'fort-plans',ok:!bad.length,detail:bad.length?bad.slice(0,4).join(' | '):'watch, march and gate keep every rule'});}
 {const Q=xfReach()||[],bad=Q.filter(q=>!q.floors||q.unreached.length||q.capped);
  /* the negative: a walk with a stair, and a second walk no stair meets, on a walk of its own */
  const W=KWALK.create(),tag='fort:neg';W.strip({a:[0,0,0],b:[8,0,6],w:1.3,name:'stair',tag});W.strip({a:[8,0,6],b:[30,0,6],w:2,name:'wall walk',tag});
  W.strip({a:[0,20,6],b:[30,20,6],w:2,name:'wall walk',tag});
  const N=xfReach(W,[{key:'neg',v:0,state:'kept',tag,feet:[[.3,.1,0]],box:[-6,36,-6,26]}])[0],negOk=N.unreached.length===1&&N.reached===2;
  R.push({name:'fort-walks',ok:Q.length>0&&!bad.length&&negOk,detail:(bad.length?'unreached: '+bad.map(q=>q.key+' v'+q.v+' '+q.unreached.slice(0,3).join(',')).join(' | ')
   :Q.map(q=>q.key.replace('xa_fort_','')+' '+q.state+' '+q.reached+'/'+q.floors).join(', '))+'; the negative '+(negOk?'catches a walk no stair meets':'FAILED: '+JSON.stringify(N))});}
 return R;}"""

if __name__ == '__main__':
    sheet_verify.run('xanadu', census=True, extra=FORT_JS)
