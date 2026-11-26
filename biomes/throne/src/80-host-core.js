// ================================================================= HOST — the final rebuild's switches (2026-11-02; BACKPORT.md section 1)
// Every page of the Throne takes this fragment (src/: no station has its own), after the kit (70) and before the sky and the ground (82, 84),
// so the switches are set before anything is built or compiled. Each is the owner's before-and-after:
//   ?kground=0   the ground's layers on the kit's own sampler (THRONE.GLSL_LAY) instead of KGROUND's (THRONE.layGLSL, 70)
//   ?imp=0       the far trees as the kit's blob crowns instead of octahedral impostors (34-core-impostor.js; 55's buildTrees)
//   ?lodmerge=0, ?lodfade=0   one mesh per item a chunk (the merge, minTris 1500) and the LOD cross-fade, off
const CORE_Q=new URLSearchParams(location.search);
const USE_KG=typeof KGROUND!=='undefined'&&CORE_Q.get('kground')!=='0';
if(CORE_Q.get('imp')==='0'){THRONE.IMPOSTORS=false;if(typeof HYPERJUNGLE!=='undefined')HYPERJUNGLE.IMPOSTORS=false;}
BIO.LOD.merge=CORE_Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&CORE_Q.get('lodfade')!=='0'?.15:0;
