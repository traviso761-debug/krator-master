#!/usr/bin/env python3
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'kits', 'lizardmen', 'settle'))
import lzv_verify  # noqa: E402
lzv_verify.main(__file__)
