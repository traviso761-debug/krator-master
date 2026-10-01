#!/usr/bin/env python3
"""Generates src/61a-61e (the Ancients port) = kit slice (patched) + tools/anc_kit_tail.js + tools/anc_glue.js
+ tools/anc_assets.js + tools/anc_furniture.js.

THE KIT SLICE IS READ FROM THE LIVE KIT (kits/ancients/src + core/materials), not from a frozen copy. It used
to be cut from ref/ancients-kit-rehabilitated.html, a single-file kit of 2026-09-26 that was never committed;
that froze Yuni at the pre-QA kit. Now a sync is: rerun this script, fix whatever patch no longer applies (it
says which, all at once), rebuild, verify. See ANCIENTS-SYNC.md for the map of what Yuni takes and why.

Usage:  python3 tools/gen_ancients.py [--check]     (--check: report patches that miss, write nothing)
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
REPO = os.path.dirname(os.path.dirname(ROOT))
KSRC = os.path.join(REPO, 'kits', 'ancients', 'src')
CORE = os.path.join(REPO, 'core', 'materials')

# THE FRAGMENTS YUNI TAKES, in the kit's own (filename) order: the helpers, the materials, and the builder of every
# type ANC_TABLE places, plus the fragments those builders call into (64-houses-def: domRoom/domMould/domShards;
# 42-offices: the civ* helpers and civFlatten; 66-office-c: officeC, which buildOffices calls). The kit's other
# builders (towers C/F/G, gate, spire, police, hotel, campus, dam, government, houses, amphitheatre, megastructure,
# bunker, every arcology, the biome) are left out: nothing in Yuni builds them and they were ~120 KB of script.
# 69w-worn.js is left out on purpose: it is the kit's re-implementation of Yuni's own worn variant, which Yuni keeps
# in tools/anc_kit_tail.js (the names would collide).
FRAGS = ['10-core', '12-stats', '20-textures', '22-materials', '30-kit', '32-surfaces', '34-kitdefs', '36-decor',
         '38-helpers2', '40-factory-extras', '42-offices', '44-starport', '48-library', '50-registry', '52-sky-abc',
         '54-mat-concrete', '56-sky-d', '57-sky-e', '62-robotics', '64-houses-def', '66-office-c', '68-mat-v5',
         '69-mat-salvage', '71-sky-h', '72-datacenter', '74-hospital', '78-factory-silo', '82-apartments', '84-fuel',
         '85-radar', '86-dish', '88-factory', '89-lab']

def frag(name):
    for d in (KSRC, CORE):
        p = os.path.join(d, name + '.js')
        if os.path.exists(p):
            return open(p, encoding='utf-8').read()
    raise SystemExit('gen_ancients: no fragment %s in kits/ancients/src or core/materials' % name)

kit = ''.join(frag(f) for f in FRAGS)
A = '// ---------------------------------------------------------------- rng + noise'
assert kit.count(A) == 1
kit = kit[kit.index(A):]            # drop the kit's error panel (Yuni has its own; ERR)

CHECK = '--check' in sys.argv
MISS = []
def rep(old, new, count=1):
    global kit
    n = kit.count(old)
    if n != count:
        MISS.append('%d x (want %d): %s' % (n, count, old[:110].replace('\n', '\\n')))
        return
    kit = kit.replace(old, new)

# ------------------------------------------------------------------------------------------- hosting patches
# the WORN skin: tarnished white metal with rust bleeding out of the panel seams and fasteners (MAT.whiteWorn,
# defined in the tail). Only the big shells go through SHELL(); the small white instanced parts keep MAT.white.
rep('const SHELL=d=>d>0?MAT.rust:MAT.white;', 'const SHELL=d=>d>0?MAT.rust:(WORN?MAT.whiteWorn:MAT.white);')
rep('function terrainH(x,z){return 0;}', 'function terrainH(x,z){return ANC_TH?ANC_TH(x,z):0;}')
rep("const REG=[];function REGISTER(o){REG.push({name:o.name,x:o.x+KOFF[0],y:o.y||0,z:o.z+KOFF[2],r:o.r,h:o.h});}", 'function REGISTER(o){}')
rep("function kput(name,p,q,s,c){let P=p,Q=q;", "function kput(name,p,q,s,c){if(KSKIP||name==='figB'||name==='figH')return;if(KTHIN>1&&(KTNAMES.indexOf(name)>=0||name==='moss'||name==='rubble'||name==='vine'||name==='stain'||name==='pipeR'||name==='cell'||name==='strip')&&((KTN++)%KTHIN))return;if(name==='strip'||name==='dot'||name==='cell')c=DEAD;let P=p,Q=q;")
# no trees (the city's flora pass plants), but keep the PRNG stream identical
rep(" tree(x,y,z,species,h){\n", " tree(x,y,z,species,h){KSKIP=true;try{this.tree0(x,y,z,species,h);}finally{KSKIP=false;}},\n tree0(x,y,z,species,h){\n")
# the library kdef()s at run time: a second build must not reset the item list
rep("function kdef(name,geo,mat){KIT.defs[name]={geo,mat};", "function kdef(name,geo,mat){if(KIT.defs[name])return;KIT.defs[name]={geo,mat};")
rep("window._instances=tot;}", "}")
rep("window._projectFire=PROJFIRE;", "")
# civFlatten merges a group's meshes per material. ANC_finish already merges EVERY ancient building into one mesh per
# output material, so in Yuni it buys nothing — and it would defeat ANC_build's per-mesh footprint cull (a merged
# mesh keeps the fragments that fell outside the plot). A no-op here.
rep("function civFlatten(G){", "function civFlatten(G){if(YFLAT)return;")
# The Foundry's merge sink (40-factory-extras.js facSink) does the same thing for buildFactory, and Yuni cuts TWO
# assets out of that one builder (the Foundry, and the clover silo at x=72): merged, the silo's skin went with the
# hall's merged mesh, whose centre is outside the silo's plot. Flushed as one mesh per surface here.
rep("flush(parent){for(const [mat,gs] of B)meshMerged(gs,mat,parent);B.clear();}", "flush(parent){for(const [mat,gs] of B){if(YFLAT)for(const g of gs)mesh(g,mat,parent);else meshMerged(gs,mat,parent);}B.clear();}")

# ------------------------------------------------------------------------------------------- cost patches
# central segment multiplier
rep("function gridSurface(fn,nu,nv,opt){opt=opt||{};", "function gridSurface(fn,nu,nv,opt){opt=opt||{};if(UVK!==1){opt=Object.assign({},opt);if(opt.uS)opt.uS*=UVK;if(opt.vS)opt.vS*=UVK;}if(nu>12)nu=Math.max(12,Math.round(nu*SEGK));if(nv>8)nv=Math.max(6,Math.round(nv*SEGK));")
rep("kdef('slab',new THREE.CylinderGeometry(1,1,1,48),MAT.slab);", "kdef('slab',new THREE.CylinderGeometry(1,1,1,16),MAT.slab);")
rep("new THREE.TorusGeometry(1,.09,6,40)", "new THREE.TorusGeometry(1,.09,5,20)", 2)
rep("TEX.ground=canvasTex(1024,1024,", "TEX.ground=canvasTex(4,4,")
# window / porthole geometry was the triangle hog (100+ tris per arched window)
rep("const g=new THREE.ExtrudeGeometry(s,{depth:dep,bevelEnabled:false});g.translate(0,0,-dep/2);return g;}", "const g=new THREE.ExtrudeGeometry(s,{depth:dep,bevelEnabled:false,curveSegments:5});g.translate(0,0,-dep/2);return g;}")
rep("new THREE.CylinderGeometry(1,1,.6,14).rotateX(Math.PI/2)", "new THREE.CylinderGeometry(1,1,.6,8).rotateX(Math.PI/2)", 2)
# the cooling hyperboloids' lattice is a 10-period diagonal weave; at Yuni's halved segment counts that aliases
# into a checkerboard. Coarser weave, same silhouette, and it survives the decimation.
rep("const lat=(u,y)=>{const a=u*TAU*10,b=y*.28;return Math.abs(Math.sin(a+b))>.28&&Math.abs(Math.sin(a-b))>.28;};",
    "const lat=(u,y)=>{if(SEGK<.55)return false;const a=u*TAU*5,b=y*.15;return Math.abs(Math.sin(a+b))>.34&&Math.abs(Math.sin(a-b))>.34;};")
# the apron: a short skirt only (footprints are hard limits in Yuni)
rep("const th=u*TAU,r=lerp(rIn,rOut,v)*(1+.07*fbm(u*7,1.3,17,2));", "const th=u*TAU,r=lerp(rIn,rIn+(rOut-rIn)*APRK,v)*(1+.04*fbm(u*7,1.3,17,2));")

# ------------------------------------------------------------------------------------------- Yuni variants
# TERRACE-STACK APARTMENTS: full roofs. Each tray's terrace deck gets a parapet lip and a soffit, and the top
# stage is capped by a lobed roof, so the stack reads as roofed storeys rather than eight open floor plates.
rep("   if(s%2===0)stripRing(ox,y+3.5,oz,R*.8,d,18);if(d>0)mossOnRing(ox,y+4.8,oz,R*1.1,10,1.5);}",
 """   const lobe=th=>R*(1+.28*(.5+.5*Math.cos(6*th)));
   aSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=lobe(th)+.1;return[ox+r*Math.cos(th),y+5.0+v*1.15,oz+r*Math.sin(th)];},72,2,{uS:14,vS:.4}));     // terrace parapet
   aSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=lobe(th)+.1;return[ox+r*Math.cos(th),y+6.15,oz+r*Math.sin(th)*1];},72,1,{}));                    // parapet coping
   aSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(R*.98,lobe(th)+.1,v);return[ox+r*Math.cos(th),y+4.5-.25*v,oz+r*Math.sin(th)];},72,1,{}));   // soffit under the deck
   if(s<7)aSkin.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(R*.99,(24-(s+1)*1.6)*.99,v);const ox2=lerp(ox,Math.sin((s+1)*1.3)*5,v),oz2=lerp(oz,Math.cos((s+1)*.9)*5,v);
    return[ox2+r*Math.cos(th),y+4.95+v*.45,oz2+r*Math.sin(th)];},72,1,{}));                                                                         // closes the gap up to the next tray
   if(s%2===0)stripRing(ox,y+3.5,oz,R*.8,d,18);if(d>0)mossOnRing(ox,y+4.8,oz,R*1.1,10,1.5);}""")
rep("  meshMerged(aSkin,skin,G);meshMerged(aDark,MAT.dark,G);",
 """  {const ty=6+7*5.4,tR=24-7*1.6,tox=Math.sin(7*1.3)*5,toz=Math.cos(7*.9)*5;      // the top stage gets a real roof
   aSkin.push(lathe({rFn:yy=>tR*1.03*Math.pow(clamp(1-Math.pow(yy/7.4,2),0,1),.55),H:7.4,flutes:6,amp:.13,sharp:1.4,nu:56,nv:12,hole:holeFn(d*.5,760,null,2)}).translate(tox,ty+4.95,toz));
   kput('slab',[tox,ty+4.9,toz],null,[tR*1.02,.4,tR*1.02],new THREE.Color(d>0?0x4a4038:0xcfcac2));
   if(d===0)kput('finial',[tox,ty+12.6,toz],null,[1.2,2,1.2],null);}
  meshMerged(aSkin,skin,G);meshMerged(aDark,MAT.dark,G);""")
# HOSPITAL: four bed towers, not three. The kit drops one ward at every decay level; Yuni keeps the quatrefoil.
rep("const gone=d>0&&l===0;const hole=holeFn(d*.8,1900+l,null,2);", "const gone=false;const hole=holeFn(d*.8,1900+l,null,2);")
# HOSPITAL: a narrower podium, the four wards pulled in toward the core, and the entrance canopy brought inside the
# plot instead of hanging 5 m past it (where the footprint cull threw it away).
rep(" const PW=170,PD=110,SH=5;", " const PW=150,PD=104,SH=5;")
rep("kput('archOpen',[0,2.2,PD/2],qFacing([0,0,1]),[1.2,.9,2],null);kput(BOXC(d),[0,5.5,PD/2+12],null,[30,.8,20],null);for(const s of [-1,1])kput(BOXC(d),[s*13,2.7,PD/2+20],null,[1,5.5,1],null);",
    "kput('archOpen',[0,2.2,PD/2],qFacing([0,0,1]),[1.2,.9,2],null);kput(BOXC(d),[0,5.5,PD/2+5],null,[30,.8,12],null);for(const s of [-1,1])kput(BOXC(d),[s*13,2.7,PD/2+9],null,[1,5.5,1],null);")
rep("for(let k=0;k<5;k++)kput('boxD',[-40+k*20,.7,PD/2+42],null,[6,.1,12],null);",
    "for(let k=0;k<5;k++)kput('boxD',[-34+k*17,.7,PD/2+8],null,[6,.1,8],null);")
rep("const LR=26;for(let l=0;l<4;l++){const a=l*Math.PI/2+Math.PI/4;const cx=Math.cos(a)*24,cz=Math.sin(a)*24;",
    "const LR=23.5;for(let l=0;l<4;l++){const a=l*Math.PI/2+Math.PI/4;const cx=Math.cos(a)*20,cz=Math.sin(a)*20;")
# DISH: the "reclaimed, dish intact" state. Same rusted, re-occupied structure, but the reflector, its struts, the
# feed, the rim and the mount are whole and it still points at the sky.
rep("function buildDish(scene,gx,gz,d){reseed(9990+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);",
    "function buildDish(scene,gx,gz,d){reseed(9990+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);const dw=DISHOK;")
rep("const tilt=d===1?1.1:.55;", "const tilt=(d===1&&!dw)?1.1:.55;")
rep("const dHole=d>0?(u,v)=>", "const dHole=d>0&&!dw?(u,v)=>")
rep("for(let k=0;k<12;k++){const a=k/12*TAU;if(d>0&&k===7)continue;", "for(let k=0;k<12;k++){const a=k/12*TAU;if(d>0&&!dw&&k===7)continue;")
rep(" if(d!==1)kput(d>0?'ringR':'ringW',", " if(d!==1||dw)kput(d>0?'ringR':'ringW',")
rep(" if(d>0){const fm=mesh(gridSurface((u,v)=>{const p=dishF(u*.12+.65,v*.4+.6);return p;}", " if(d>0&&!dw){const fm=mesh(gridSurface((u,v)=>{const p=dishF(u*.12+.65,v*.4+.6);return p;}")
# COMPACT LABORATORY. The colonnaded porch, its canopy and the reactor hut carry the Reliquary's footprint out to
# 76 x 46 m for very little read; inside the city wall the drum has to stand on its own. LABTIGHT drops all three.
# (The kit now collects the porch canopy and the hut into the dome's merge list `lX`, so the merge stays outside.)
rep(" // colonnaded porch → reactor hut\n for(let i=0;i<7;i++)", " // colonnaded porch → reactor hut\n let hut=null;if(!LABTIGHT){\n for(let i=0;i<7;i++)")
rep(" const hut=new THREE.Group();hut.position.set(104,0,0);G.add(hut);", " hut=new THREE.Group();hut.position.set(104,0,0);G.add(hut);")
rep(" meshMerged(lX,skin,G);\n if(d>0)mesh(lathe({rFn:y=>9.2", " }\n meshMerged(lX,skin,G);\n if(!LABTIGHT){\n if(d>0)mesh(lathe({rFn:y=>9.2")
rep(" stripRing(104,7,0,7,d,20);\n", " stripRing(104,7,0,7,d,20);}\n")

if MISS:
    print('gen_ancients: %d patch(es) no longer apply to the live kit:' % len(MISS))
    for m in MISS:
        print('  -', m)
    sys.exit(1)
assert 'document.getElementById' not in kit
if CHECK:
    print('gen_ancients: every patch applies (%d KB of kit)' % (len(kit) // 1024)); sys.exit(0)

pre = """reseed(610001);
/* ============================== 61. THE ANCIENTS ==============================
   GENERATED by tools/gen_ancients.py — do not edit by hand; edit tools/anc_*.js (or the patch list in the
   generator) and re-run it. A port of the Krator Ancients kit, cut from the live kit (kits/ancients/src and
   core/materials; the fragment list is in the generator, the sync map in ANCIENTS-SYNC.md):
   the kit's builders run inside a private IIFE (own PRNG, own clamp/lerp/fbm/mesh/lathe...),
   ANC_build() places one structure at an asset frame (position + yaw + uniform scale),
   ANC_finish() merges everything into one mesh per material. */
(function(){
var WORLD_TH = terrainH;
var ANCK = (function(){
var ANC_TH=null, KSKIP=false, KTHIN=1, KTN=0, KTNAMES=[], UVK=1, DISHOK=false, WORN=false, LABTIGHT=false, SEGK=0.5, RSC=1, APRK=0.3, YFLAT=true;
var NIGHT=false;          /* the kit's day/night flag (92-camera.js), driven by ANCK.setNight from Yuni's clock */
function reportErr(m){ ERR('ancients kit: '+m); }
"""
# One file per component, so an agent can open the part it needs. build.py joins
# files that share the 61 prefix back into one unit (one PRNG stream, one scope).
parts = [('61a-ancients-kit', pre + kit),
         ('61b-ancients-kit-tail', open(os.path.join(HERE, 'anc_kit_tail.js')).read() + "})();\n"),
         ('61c-ancients-glue', open(os.path.join(HERE, 'anc_glue.js')).read()),
         ('61d-ancients-assets', open(os.path.join(HERE, 'anc_assets.js')).read() + "})();\n"),
         ('61e-ancients-furniture', open(os.path.join(HERE, 'anc_furniture.js')).read())]
old = os.path.join(ROOT, 'src', '61-ancients.js')
if os.path.exists(old):
    os.remove(old)
for name, text in parts:
    open(os.path.join(ROOT, 'src', name + '.js'), 'w').write(text)
    print('wrote src/%s.js' % name, len(text))
