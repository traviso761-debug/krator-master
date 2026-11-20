#!/usr/bin/env python3
"""Headless WebGL check for the Painted Men kit's own sheet (build.py; on kits/iziz-vernacular/sheet_verify.py and
tools/harness.py):

    python3 verify.py dist/painted-men.html --assert [--views "Opening|Overview"] [--all-views] [--only key1,key2] [--out shots]
"""
import os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'iziz-vernacular'))
import sheet_verify   # noqa: E402

EXTRA_JS = r"""()=>{const R=[];
 const pmMats=['pmFormA','pmFormW','pmFormV','pmFormT','pmFormB','pmFormF','pmTotem','pmTotemP','pmWing','trFront','trFrontK','trShield','trCone'];
 const miss=pmMats.filter(k=>!MAT[k]||!MAT[k].map);
 R.push({name:'tlingit-formline-materials',ok:!miss.length,detail:miss.length?'missing MAT: '+miss.join(', '):pmMats.length+' Tlingit formline/totem/wing maps active'});
 const triDefs=Object.keys(VERN.defs).filter(k=>VERN.defs[k].branch==='tribal');
 R.push({name:'painted-men-defs',ok:triDefs.length>=20,detail:triDefs.length+' Painted Men defs registered ('+triDefs.slice(0,6).join(', ')+'...)'});
 return R;}"""

if __name__ == '__main__':
    sheet_verify.run('painted-men', census=False, extra=EXTRA_JS)
