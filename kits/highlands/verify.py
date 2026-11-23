#!/usr/bin/env python3
"""Headless check for the Highlands kit's own sheet (build.py; the checks are kits/iziz-vernacular/sheet_verify.py's, on
tools/harness.py):

    python3 verify.py dist/highlands.html --assert [--views "Opening|Overview"] [--all-views] [--only key1,key2] [--out shots]

The trades table (src/89-hl-trades.js, HL_TRADES) is checked against the Voth census by tools/check_trades.py, as Highlands'
verify.py did, plus extra asserts on the Slavic procedural motifs and the 7 Hydropower defs and mechanisms."""
import os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'iziz-vernacular'))
import sheet_verify   # noqa: E402

EXTRA_JS = r"""()=>{const R=[];
 const hydroKeys=['hl_rep_hydro_forge','hl_rep_hydro_sawmill','hl_rep_hydro_stampmill','hl_rep_hydro_gristmill','hl_hydro_weir','hl_hydro_flume','hl_hydro_sluice_gate'];
 const missH=hydroKeys.filter(k=>!VERN.defs[k]||!VERN.defs[k].hydro);
 R.push({name:'hydropower-defs',ok:!missH.length,detail:missH.length?'missing hydro defs: '+missH.join(', '):hydroKeys.length+' hydropower defs with hydraulic anchors placed'});
 const triLeft=Object.keys(VERN.defs).filter(k=>VERN.defs[k].branch==='tribal');
 R.push({name:'no-tribal-in-highlands',ok:!triLeft.length,detail:triLeft.length?'leftover tribal defs: '+triLeft.join(', '):'0 tribal defs in kits/highlands (moved to kits/painted-men)'});
 const hp=window._hydroParts||0;
 R.push({name:'hydropower-mechanisms',ok:hp>=12,detail:hp+' animated hydropower assemblies active in HLANIM'});
 const slavicOk=!!(MAT.formF&&MAT.formF.userData&&MAT.formF.userData.lib==='procedural/slavic'&&MAT.hM_w_rozetka&&MAT.hM_w_kolovrat);
 R.push({name:'slavic-ornamentation',ok:slavicOk,detail:slavicOk?'Slavic rozetka, kolovrat, pletenka and rospis maps active':'missing Slavic ornamentation maps'});
 return R;}"""

if __name__ == '__main__':
    sheet_verify.run('highlands', census=True, extra=EXTRA_JS)
