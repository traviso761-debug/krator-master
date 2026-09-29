#!/usr/bin/env python3
"""Write the claude.ai artifact copy of dist/swbay.html (KNOWN_ISSUES: the artifact
host wraps the page itself, so strip the wrapper 00-head.html carries).
  python3 publish.py [out.html]   (default: dist/swbay.artifact.html)"""
import os,sys
HERE=os.path.dirname(os.path.abspath(__file__))
src=open(os.path.join(HERE,'dist','swbay.html'),encoding='utf8').read()
s=src[src.index('<title>'):]
s=s[:s.rindex('</body>')].rstrip()+'\n'
out=sys.argv[1] if len(sys.argv)>1 else os.path.join(HERE,'dist','swbay.artifact.html')
open(out,'w',encoding='utf8').write(s);print('wrote',out,len(s)//1024,'KB')
