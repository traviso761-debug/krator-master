#!/usr/bin/env python3
"""Headless verification of the Marr city settlement (settlements/marr/dist/marr.html).

    python3 settlements/marr/verify.py settlements/marr/dist/marr.html --assert
"""
import os, runpy, sys

HERE = os.path.dirname(os.path.abspath(__file__))
IZ = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'iziz', 'verify.py')
sys.argv = [IZ] + [os.path.abspath(a) if a.endswith('.html') and os.path.exists(a) else a for a in sys.argv[1:]]
runpy.run_path(IZ, run_name='__main__')
